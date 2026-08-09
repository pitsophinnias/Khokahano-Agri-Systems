// ---------------------------------------------------------------------------
// SurveyHistoryPage.jsx
// Read-only view of the farmer's submitted survey answers + group assignment.
// Route: /farmer/survey/history  (FarmerRoute protected)
// Module: src/services/farmer-management/pages/SurveyHistoryPage.jsx
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { THEME }               from "../../marketplace/constants/theme.js";
import { fetchMySurvey }       from "../../marketplace/api/marketplace.api.js";

const C = THEME.colors;
const F = THEME.fonts;

// ── Label maps — mirrors the option constants in SurveyPage ──

const POULTRY_LABELS = {
  broilers:   "Broilers (meat birds)",
  layers:     "Layers (egg production)",
  indigenous: "Indigenous / village chickens",
  eggs:       "Eggs only",
};

const HOUSING_LABELS = {
  deep_litter: "Deep litter",
  cage:        "Cage system",
  free_range:  "Free range / semi-intensive",
  open_yard:   "Open yard / backyard",
};

const FEEDING_LABELS = {
  commercial:  "Commercial feed only",
  homemix:     "Home-mixed feed only",
  both:        "Both commercial and home-mixed",
  scavenging:  "Scavenging / foraging",
};

const VACCINATION_LABELS = {
  yes:       "Yes — on a regular schedule",
  sometimes: "Sometimes — when I can afford it",
  no:        "No — I don't vaccinate",
};

const PACKAGING_LABELS = {
  live:        "Live birds",
  dressed:     "Dressed / cleaned",
  tray_packed: "Tray packed",
  vacuum:      "Vacuum packed",
};

const GROUP_META = {
  GROUP_A: {
    label: "Group A",
    colour: "#1c4a1c",
    description: "Following recommended standards. You'll receive advanced market access tips and premium advisory content.",
  },
  GROUP_B: {
    label: "Group B",
    colour: "#b8860b",
    description: "Good foundations. Advisory content will focus on feeding improvements and cost reduction.",
  },
  GROUP_C: {
    label: "Group C",
    colour: "#a05c00",
    description: "Practical guides on vaccination schedules, disease prevention, and reducing mortality.",
  },
  GROUP_D: {
    label: "Group D",
    colour: "#a32d2d",
    description: "Step-by-step guides on housing improvements and flock management.",
  },
};

// ── Sub-components ────────────────────────────────────────────

function TopBar({ onBack }) {
  return (
    <div style={{
      background: C.green, padding: "0 16px", height: 52,
      display: "flex", alignItems: "center", gap: 10,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <button onClick={onBack} style={{
        background: "rgba(255,255,255,0.12)", border: "none",
        color: "#fff", width: 32, height: 32, borderRadius: 4,
        cursor: "pointer", fontSize: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>←</button>
      <img src="/assets/logo.png" alt="Khokahano" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
      <div style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>
        My survey answers
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: C.white,
      borderTop:    `1px solid ${C.line}`,
      borderRight:  `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`,
      borderLeft:   `1px solid ${C.line}`,
      borderRadius: 6, marginBottom: 12, overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 16px",
        borderBottom: `1px solid ${C.line}`,
        fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
        textTransform: "uppercase", color: C.inkLight, fontFamily: F.body,
      }}>
        {title}
      </div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      gap: 16, padding: "7px 0",
      borderBottom: `1px solid ${C.line}`,
    }}>
      <div style={{ fontSize: 13, color: C.inkLight, fontFamily: F.body, flexShrink: 0 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: C.ink, fontFamily: F.body, textAlign: "right" }}>
        {value}
      </div>
    </div>
  );
}

function TagList({ values, labelMap }) {
  if (!values || values.length === 0) return (
    <span style={{ fontSize: 13, color: C.inkLight, fontFamily: F.body }}>Not specified</span>
  );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {values.map((v) => (
        <span key={v} style={{
          padding: "3px 10px", borderRadius: 20,
          background: "rgba(28,74,28,0.08)",
          fontSize: 12, color: C.green, fontFamily: F.body, fontWeight: 500,
        }}>
          {labelMap[v] ?? v}
        </span>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function SurveyHistoryPage() {
  const navigate = useNavigate();
  const [survey,  setSurvey]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchMySurvey()
      .then((data) => { setSurvey(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh" }}>
      <TopBar onBack={() => navigate("/farmer/survey")} />
      <div style={{ padding: "60px 20px", textAlign: "center", color: C.inkLight }}>
        Loading…
      </div>
    </div>
  );

  if (error || !survey) return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh" }}>
      <TopBar onBack={() => navigate("/farmer/survey")} />
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 14 }}>📋</div>
        <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink, marginBottom: 8 }}>
          No survey submitted yet
        </div>
        <div style={{ fontSize: 13, color: C.inkLight, marginBottom: 24 }}>
          Complete your farm survey so Khokahano can tailor support for your operation.
        </div>
        <button
          onClick={() => navigate("/farmer/survey")}
          style={{
            padding: "11px 28px", background: C.green, color: "#fff",
            border: "none", borderRadius: 4,
            fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: F.body,
          }}
        >
          Start survey
        </button>
      </div>
    </div>
  );

  const group = GROUP_META[survey.groupCategory];
  const submittedDate = survey.completedAt
    ? new Date(survey.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const updatedDate = survey.updatedAt
    ? new Date(survey.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh", color: C.ink, WebkitFontSmoothing: "antialiased" }}>
      <TopBar onBack={() => navigate("/farmer/survey")} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Group badge */}
        {group && (
          <div style={{
            background: C.white,
            borderTop:    `1px solid ${C.line}`,
            borderRight:  `1px solid ${C.line}`,
            borderBottom: `1px solid ${C.line}`,
            borderLeft:   `4px solid ${group.colour}`,
            borderRadius: 6, padding: "16px 20px",
            marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.inkLight, marginBottom: 4 }}>
                Assigned group
              </div>
              <div style={{ fontFamily: F.display, fontSize: 18, color: group.colour, marginBottom: 4 }}>
                {group.label}
              </div>
              <div style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.5 }}>
                {group.description}
              </div>
            </div>
            <div style={{
              width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
              background: group.colour,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F.display, fontSize: 20, color: "#fff",
            }}>
              {group.label.slice(-1)}
            </div>
          </div>
        )}

        {/* Dates + edit button */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, gap: 12,
        }}>
          <div style={{ fontSize: 12, color: C.inkLight }}>
            {submittedDate && <span>Submitted {submittedDate}</span>}
            {updatedDate && updatedDate !== submittedDate && <span> · Updated {updatedDate}</span>}
          </div>
          <button
            onClick={() => navigate("/farmer/survey")}
            style={{
              padding: "7px 16px",
              background: "none",
              borderTop:    `1px solid ${C.green}`,
              borderRight:  `1px solid ${C.green}`,
              borderBottom: `1px solid ${C.green}`,
              borderLeft:   `1px solid ${C.green}`,
              borderRadius: 4, color: C.green,
              fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: F.body,
              whiteSpace: "nowrap",
            }}
          >
            ✏️ Edit answers
          </button>
        </div>

        {/* Section 1 — Flock */}
        <Section title="What you raise">
          <div style={{ marginBottom: 12 }}>
            <TagList values={survey.poultryTypes} labelMap={POULTRY_LABELS} />
          </div>
          <Row label="Total birds"    value={survey.totalBirds     ? `${survey.totalBirds.toLocaleString()} birds` : null} />
          <Row label="Broilers"       value={survey.broilerCount   ? `${survey.broilerCount.toLocaleString()}` : null} />
          <Row label="Layers"         value={survey.layerCount     ? `${survey.layerCount.toLocaleString()}` : null} />
          <Row label="Indigenous"     value={survey.indigenousCount? `${survey.indigenousCount.toLocaleString()}` : null} />
        </Section>

        {/* Section 2 — Practices */}
        <Section title="Farming practices">
          <Row label="Housing system"   value={HOUSING_LABELS[survey.housingSystem] ?? survey.housingSystem} />
          <Row label="Feeding method"   value={FEEDING_LABELS[survey.feedingMethod] ?? survey.feedingMethod} />
          <Row label="Feed brand"       value={survey.feedBrand || null} />
          <Row label="Vaccination"      value={VACCINATION_LABELS[survey.vaccinationPractice] ?? survey.vaccinationPractice} />
          {survey.vaccinesUsed?.length > 0 && (
            <div style={{ paddingTop: 10 }}>
              <div style={{ fontSize: 13, color: C.inkLight, marginBottom: 6 }}>Vaccines used</div>
              <TagList values={survey.vaccinesUsed} labelMap={{
                newcastle: "Newcastle", gumboro: "Gumboro", marek: "Marek's",
                fowlpox: "Fowl pox", other: "Other",
              }} />
            </div>
          )}
        </Section>

        {/* Section 3 — Health */}
        <Section title="Health & mortality">
          {survey.diseaseChallenges?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: C.inkLight, marginBottom: 6 }}>Disease challenges</div>
              <TagList values={survey.diseaseChallenges} labelMap={{
                newcastle: "Newcastle", gumboro: "Gumboro", coccidiosis: "Coccidiosis",
                marek: "Marek's", respiratory: "Respiratory (CRD)",
                fowl_typhoid: "Fowl typhoid", external_parasites: "External parasites",
                none: "None",
              }} />
            </div>
          )}
          <Row
            label="Mortality rate"
            value={survey.mortalityRatePercent != null ? `${survey.mortalityRatePercent}%` : null}
          />
        </Section>

        {/* Section 4 — Market */}
        <Section title="Market access & packaging">
          {survey.marketAccessChallenges && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: C.inkLight, marginBottom: 4 }}>Market challenge</div>
              <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>
                {survey.marketAccessChallenges}
              </div>
            </div>
          )}
          {survey.packagingMethod?.length > 0 && (
            <div>
              <div style={{ fontSize: 13, color: C.inkLight, marginBottom: 6 }}>How you sell</div>
              <TagList values={survey.packagingMethod} labelMap={PACKAGING_LABELS} />
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}