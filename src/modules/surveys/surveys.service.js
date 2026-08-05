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

  // Assign farmer to a group based on their responses
  const groupCategory = assignGroup({
    vaccinationPractice, housingSystem,
    feedingMethod, mortalityRatePercent,
  });

  const survey = await prisma.farmerSurvey.upsert({
    where:  { farmerId },
    create: {
      farmerId,
      poultryTypes:   poultryTypes ?? [],
      totalBirds:     totalBirds   ? parseInt(totalBirds)   : null,
      broilerCount:   broilerCount ? parseInt(broilerCount) : null,
      layerCount:     layerCount   ? parseInt(layerCount)   : null,
      indigenousCount:indigenousCount ? parseInt(indigenousCount) : null,
      housingSystem, feedingMethod, feedBrand,
      vaccinationPractice,
      vaccinesUsed:          vaccinesUsed         ?? [],
      diseaseChallenges:     diseaseChallenges     ?? [],
      mortalityRatePercent:  mortalityRatePercent  ? parseFloat(mortalityRatePercent) : null,
      marketAccessChallenges, packagingMethod,
      groupCategory,
      groupAssignedAt: new Date(),
    },
    update: {
      poultryTypes:   poultryTypes ?? [],
      totalBirds:     totalBirds   ? parseInt(totalBirds)   : null,
      broilerCount:   broilerCount ? parseInt(broilerCount) : null,
      layerCount:     layerCount   ? parseInt(layerCount)   : null,
      indigenousCount:indigenousCount ? parseInt(indigenousCount) : null,
      housingSystem, feedingMethod, feedBrand,
      vaccinationPractice,
      vaccinesUsed:          vaccinesUsed         ?? [],
      diseaseChallenges:     diseaseChallenges     ?? [],
      mortalityRatePercent:  mortalityRatePercent  ? parseFloat(mortalityRatePercent) : null,
      marketAccessChallenges, packagingMethod,
      groupCategory,
      groupAssignedAt: new Date(),
    },
  });

  return survey;
}

// ── GET MY SURVEY ─────────────────────────────────────────────
export async function getMySurvey(farmerId) {
  return prisma.farmerSurvey.findUnique({ where: { farmerId } });
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

  // Common challenges per group
  const allSurveys = await prisma.farmerSurvey.findMany({
    select: { groupCategory: true, diseaseChallenges: true, marketAccessChallenges: true },
  });

  return groups.map((g) => {
    const groupSurveys = allSurveys.filter((s) => s.groupCategory === g.groupCategory);
    const allChallenges = groupSurveys.flatMap((s) => s.diseaseChallenges ?? []);
    const challengeMap  = {};
    allChallenges.forEach((c) => { challengeMap[c] = (challengeMap[c] ?? 0) + 1; });

    return {
      group:   g.groupCategory,
      count:   g._count.farmerId,
      topChallenges: Object.entries(challengeMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([challenge, count]) => ({ challenge, count })),
    };
  });
}

// ── GROUP ASSIGNMENT LOGIC ────────────────────────────────────
// GROUP_A = following recommended standards
// GROUP_B = needs improvement in feeding
// GROUP_C = needs improvement in vaccination/disease
// GROUP_D = needs improvement in housing/management
function assignGroup({ vaccinationPractice, housingSystem, feedingMethod, mortalityRatePercent }) {
  const mortality = parseFloat(mortalityRatePercent ?? 0);

  const poorVaccination = !vaccinationPractice ||
    vaccinationPractice.toLowerCase().includes("none") ||
    vaccinationPractice.toLowerCase().includes("rarely");

  const poorHousing = !housingSystem ||
    housingSystem.toLowerCase().includes("none") ||
    housingSystem.toLowerCase().includes("poor");

  const poorFeeding = !feedingMethod ||
    feedingMethod.toLowerCase().includes("scraps") ||
    feedingMethod.toLowerCase().includes("none");

  const highMortality = mortality > 10;

  if (poorVaccination || highMortality) return "GROUP_C";
  if (poorHousing)                      return "GROUP_D";
  if (poorFeeding)                      return "GROUP_B";
  return "GROUP_A";
}