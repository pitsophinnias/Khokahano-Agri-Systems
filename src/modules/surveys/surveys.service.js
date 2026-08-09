// ---------------------------------------------------------------------------
// surveys.service.js
// Farmer data collection — saves survey responses and assigns farmer groups
// ---------------------------------------------------------------------------
import prisma from "../../config/db.js";

// ── SUBMIT / UPDATE SURVEY ────────────────────────────────────
export async function submitSurvey(farmerId, data) {
  const {
    poultryTypes, totalBirds, broilerCount, layerCount, indigenousCount,
    housingSystem, feedingMethod, feedBrand,
    vaccinationPractice, vaccinesUsed,
    diseaseChallenges, mortalityRatePercent,
    marketAccessChallenges, packagingMethod,
  } = data;

  // Frontend sends lowercase strings ("broilers", "layers").
  // Prisma PoultryType enum requires uppercase ("BROILERS", "LAYERS").
  const normPoultryTypes = (poultryTypes ?? []).map((v) => v.toUpperCase());

  // Schema stores packagingMethod as String? (single value).
  // Frontend sends an array for multi-select. Join to comma-separated string
  // so no migration is needed. Split on read in getMySurvey.
  const normPackagingMethod = Array.isArray(packagingMethod)
    ? packagingMethod.join(",")
    : (packagingMethod ?? null);

  const groupCategory = assignGroup({
    vaccinationPractice, housingSystem,
    feedingMethod, mortalityRatePercent,
  });

  const surveyData = {
    poultryTypes:           normPoultryTypes,
    totalBirds:             totalBirds       ? parseInt(totalBirds)             : null,
    broilerCount:           broilerCount     ? parseInt(broilerCount)           : null,
    layerCount:             layerCount       ? parseInt(layerCount)             : null,
    indigenousCount:        indigenousCount  ? parseInt(indigenousCount)        : null,
    housingSystem:          housingSystem          ?? null,
    feedingMethod:          feedingMethod          ?? null,
    feedBrand:              feedBrand              ?? null,
    vaccinationPractice:    vaccinationPractice    ?? null,
    vaccinesUsed:           vaccinesUsed           ?? [],
    diseaseChallenges:      diseaseChallenges      ?? [],
    mortalityRatePercent:   mortalityRatePercent   ? parseFloat(mortalityRatePercent) : null,
    marketAccessChallenges: marketAccessChallenges ?? null,
    packagingMethod:        normPackagingMethod,
    groupCategory,
    groupAssignedAt:        new Date(),
  };

  const survey = await prisma.farmerSurvey.upsert({
    where:  { farmerId },
    create: { farmerId, ...surveyData },
    update: surveyData,
  });

  return survey;
}

// ── GET MY SURVEY ─────────────────────────────────────────────
export async function getMySurvey(farmerId) {
  const survey = await prisma.farmerSurvey.findUnique({ where: { farmerId } });
  if (!survey) return null;

  return {
    ...survey,
    // Expand packagingMethod back to array for the frontend
    packagingMethod: survey.packagingMethod
      ? survey.packagingMethod.split(",")
      : [],
    // Lowercase poultryTypes back to frontend convention
    poultryTypes: (survey.poultryTypes ?? []).map((v) => v.toLowerCase()),
  };
}

// ── ADMIN: ALL SURVEYS ────────────────────────────────────────
export async function getAllSurveys({ district, group } = {}) {
  return prisma.farmerSurvey.findMany({
    where: {
      ...(group    && { groupCategory: group }),
      ...(district && { farmer: { user: { district } } }),
    },
    include: {
      farmer: {
        include: {
          user: {
            select: {
              firstName: true, lastName: true,
              phone: true, district: true, village: true,
            },
          },
        },
      },
    },
    orderBy: { completedAt: "desc" },
  });
}

// ── ADMIN: GROUP BREAKDOWN ────────────────────────────────────
export async function getGroupBreakdown() {
  const groups = await prisma.farmerSurvey.groupBy({
    by:     ["groupCategory"],
    _count: { farmerId: true },
  });

  const allSurveys = await prisma.farmerSurvey.findMany({
    select: { groupCategory: true, diseaseChallenges: true, marketAccessChallenges: true },
  });

  return groups.map((g) => {
    const groupSurveys  = allSurveys.filter((s) => s.groupCategory === g.groupCategory);
    const allChallenges = groupSurveys.flatMap((s) => s.diseaseChallenges ?? []);
    const challengeMap  = {};
    allChallenges.forEach((c) => { challengeMap[c] = (challengeMap[c] ?? 0) + 1; });

    return {
      group: g.groupCategory,
      count: g._count.farmerId,
      topChallenges: Object.entries(challengeMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([challenge, count]) => ({ challenge, count })),
    };
  });
}

// ── ADMIN: IMPORT SURVEYS FROM EXTERNAL SOURCE ────────────────
export async function importSurveys(rows) {
  let imported = 0;
  let skipped  = 0;

  for (const row of rows) {
    // Look up farmer by phone number — strip spaces for matching
    const user = await prisma.user.findFirst({
      where: {
        phone: { contains: row.farmerPhone.replace(/\s/g, "") },
        role:  "FARMER",
      },
      include: { farmer: true },
    });

    if (!user?.farmer) {
      skipped++;
      continue;
    }

    const farmerId = user.farmer.id;

    // Normalise poultryTypes to uppercase enum values, reject unknown values
    const VALID_POULTRY = ["BROILERS", "LAYERS", "INDIGENOUS", "EGGS", "FEED_AND_SUPPLIES"];
    const normPoultryTypes = (row.poultryTypes ?? [])
      .map((v) => v.trim().toUpperCase().replace(/\s+/g, "_"))
      .filter((v) => VALID_POULTRY.includes(v));

    // Join packagingMethod array to comma string (schema is String?)
    const normPackagingMethod = Array.isArray(row.packagingMethod)
      ? row.packagingMethod.join(",")
      : (row.packagingMethod ?? null);

    const groupCategory = assignGroup({
      vaccinationPractice:  row.vaccinationPractice,
      housingSystem:        row.housingSystem,
      feedingMethod:        row.feedingMethod,
      mortalityRatePercent: row.mortalityRatePercent,
    });

    const surveyData = {
      poultryTypes:           normPoultryTypes,
      totalBirds:             row.totalBirds            ? parseInt(row.totalBirds)            : null,
      broilerCount:           row.broilerCount           ? parseInt(row.broilerCount)           : null,
      layerCount:             row.layerCount             ? parseInt(row.layerCount)             : null,
      indigenousCount:        row.indigenousCount        ? parseInt(row.indigenousCount)        : null,
      housingSystem:          row.housingSystem          ?? null,
      feedingMethod:          row.feedingMethod          ?? null,
      feedBrand:              row.feedBrand              ?? null,
      vaccinationPractice:    row.vaccinationPractice    ?? null,
      vaccinesUsed:           row.vaccinesUsed           ?? [],
      diseaseChallenges:      row.diseaseChallenges      ?? [],
      mortalityRatePercent:   row.mortalityRatePercent   ? parseFloat(row.mortalityRatePercent) : null,
      marketAccessChallenges: row.marketAccessChallenges ?? null,
      packagingMethod:        normPackagingMethod,
      groupCategory,
      groupAssignedAt:        new Date(),
    };

    await prisma.farmerSurvey.upsert({
      where:  { farmerId },
      create: { farmerId, ...surveyData },
      update: surveyData,
    });

    imported++;
  }

  return { imported, skipped };
}

// ── GROUP ASSIGNMENT LOGIC ────────────────────────────────────
// GROUP_A = following recommended standards
// GROUP_B = needs improvement in feeding
// GROUP_C = needs improvement in vaccination/disease
// GROUP_D = needs improvement in housing/management
function assignGroup({ vaccinationPractice, housingSystem, feedingMethod, mortalityRatePercent }) {
  const mortality = parseFloat(mortalityRatePercent ?? 0);

  const poorVaccination = !vaccinationPractice ||
    vaccinationPractice === "no" ||
    vaccinationPractice.toLowerCase().includes("none") ||
    vaccinationPractice.toLowerCase().includes("rarely");

  const poorHousing = !housingSystem ||
    housingSystem.toLowerCase().includes("none") ||
    housingSystem.toLowerCase().includes("poor");

  const poorFeeding = !feedingMethod ||
    feedingMethod === "scavenging" ||
    feedingMethod.toLowerCase().includes("scraps") ||
    feedingMethod.toLowerCase().includes("none");

  const highMortality = mortality > 10;

  if (poorVaccination || highMortality) return "GROUP_C";
  if (poorHousing)                      return "GROUP_D";
  if (poorFeeding)                      return "GROUP_B";
  return "GROUP_A";
}