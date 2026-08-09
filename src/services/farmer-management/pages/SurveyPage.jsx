// ---------------------------------------------------------------------------
// SurveyPage.jsx
// Farmer survey form UI.
// Route:  /farmer/survey  (FarmerRoute protected)
// Module: src/services/farmer-management/pages/SurveyPage.jsx
//
// Field names match backend surveys.service.js exactly.
// Packaging is multi-select (farmer may sell live AND dressed birds).
// Vaccination values map to what assignGroup() actually checks.
// ---------------------------------------------------------------------------

import { useNavigate } from "react-router-dom";
import { THEME } from "../../marketplace/constants/theme.js";
import { useSurvey } from "../hooks/useSurvey.js";

const C = THEME.colors;
const F = THEME.fonts;

// ── Option constants ──────────────────────────────────────────

const POULTRY_TYPE_OPTIONS = [
  { value: "broilers",   label: "Broilers (meat birds)" },
  { value: "layers",     label: "Layers (egg production)" },
  { value: "indigenous", label: "Indigenous / village chickens" },
  { value: "eggs",       label: "Eggs only (no live birds sold)" },
];

const HOUSING_OPTIONS = [
  { value: "deep_litter", label: "Deep litter (floor bedding system)" },
  { value: "cage",        label: "Cage system" },
  { value: "free_range",  label: "Free range / semi-intensive" },
  { value: "open_yard",   label: "Open yard / backyard" },
];

const FEEDING_OPTIONS = [
  { value: "commercial",  label: "Commercial feed only" },
  { value: "homemix",     label: "Home-mixed feed only" },
  { value: "both",        label: "Both commercial and home-mixed" },
  { value: "scavenging",  label: "Scavenging / foraging" },
];

// Values checked by assignGroup(): "yes", "no", "sometimes"
// assignGroup treats anything containing "none" or "rarely" as poor vaccination.
// "no" does not contain those strings so GROUP_C triggers only on "no" explicitly —
// the backend handles this via the poorVaccination check.
const VACCINATING_OPTIONS = [
  { value: "yes",       label: "Yes — on a regular schedule" },
  { value: "sometimes", label: "Sometimes — when I can afford it" },
  { value: "no",        label: "No — I don't vaccinate" },
];

const VACCINE_OPTIONS = [
  { value: "newcastle", label: "Newcastle disease" },
  { value: "gumboro",   label: "Gumboro (IBD)" },
  { value: "marek",     label: "Marek's disease" },
  { value: "fowlpox",   label: "Fowl pox" },
  { value: "other",     label: "Other vaccines" },
];

const DISEASE_OPTIONS = [
  { value: "newcastle",          label: "Newcastle disease" },
  { value: "gumboro",            label: "Gumboro disease" },
  { value: "coccidiosis",        label: "Coccidiosis" },
  { value: "marek",              label: "Marek's disease" },
  { value: "respiratory",        label: "Respiratory infections (CRD)" },
  { value: "fowl_typhoid",       label: "Fowl typhoid / Salmonella" },
  { value: "external_parasites", label: "External parasites (mites, lice)" },
  { value: "none",               label: "No major disease challenges" },
];

// Multi-select — a farmer selling broilers AND layers may sell live birds
// and also sell dressed / tray-packed birds simultaneously.
const PACKAGING_OPTIONS = [
  { value: "live",        label: "Live birds — sold alive to the buyer" },
  { value: "dressed",     label: "Dressed / cleaned — slaughtered by me" },
  { value: "tray_packed", label: "Tray packed — portioned and packed" },
  { value: "vacuum",      label: "Vacuum packed" },
];

// ── Shared sub-components ─────────────────────────────────────

function TopBar({ onBack, isUpdate }) {
  return (
    <div style={{
      background: C.green, padding: "0 16px", height: 52,
      display: "flex", alignItems: "center", gap: 10,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <button
        onClick={onBack}
        style={{
          background: "rgba(255,255,255,0.12)", border: "none",
          color: "#fff", width: 32, height: 32, borderRadius: 4,
          cursor: "pointer", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        ←
      </button>
      <img src="/assets/logo.png" alt="Khokahano" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
      <div style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>
        {isUpdate ? "Update farm survey" : "Farm practice survey"}
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{
      background: C.white,
      borderTop:    `1px solid ${C.line}`,
      borderRight:  `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`,
      borderLeft:   `1px solid ${C.line}`,
      borderRadius: 6, padding: 20, marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ step, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 24, height: 24, borderRadius: "50%",
        background: C.green, color: "#fff",
        fontSize: 11, fontWeight: 700, marginBottom: 8, fontFamily: F.body,
      }}>
        {step}
      </div>
      <div style={{ fontFamily: F.display, fontSize: 17, color: C.ink, marginBottom: 4 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.5 }}>{subtitle}</div>
      )}
    </div>
  );
}

function CheckOption({ label, checked, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "11px 14px",
        borderTop:    `1px solid ${checked ? C.green : C.line}`,
        borderRight:  `1px solid ${checked ? C.green : C.line}`,
        borderBottom: `1px solid ${checked ? C.green : C.line}`,
        borderLeft:   `3px solid ${checked ? C.green : "transparent"}`,
        borderRadius: 4,
        background: checked ? "rgba(28,74,28,0.05)" : C.white,
        cursor: "pointer", fontFamily: F.body,
        textAlign: "left", width: "100%",
        transition: "border-color 0.12s, background 0.12s",
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 3, flexShrink: 0,
        background: checked ? C.green : "none",
        borderTop:    `1.5px solid ${checked ? C.green : C.inkLight}`,
        borderRight:  `1.5px solid ${checked ? C.green : C.inkLight}`,
        borderBottom: `1.5px solid ${checked ? C.green : C.inkLight}`,
        borderLeft:   `1.5px solid ${checked ? C.green : C.inkLight}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.4 }}>{label}</span>
    </button>
  );
}

function RadioOption({ label, selected, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "11px 14px",
        borderTop:    `1px solid ${selected ? C.green : C.line}`,
        borderRight:  `1px solid ${selected ? C.green : C.line}`,
        borderBottom: `1px solid ${selected ? C.green : C.line}`,
        borderLeft:   `3px solid ${selected ? C.green : "transparent"}`,
        borderRadius: 4,
        background: selected ? "rgba(28,74,28,0.05)" : C.white,
        cursor: "pointer", fontFamily: F.body,
        textAlign: "left", width: "100%",
        transition: "border-color 0.12s, background 0.12s",
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
        borderTop:    `1.5px solid ${selected ? C.green : C.inkLight}`,
        borderRight:  `1.5px solid ${selected ? C.green : C.inkLight}`,
        borderBottom: `1.5px solid ${selected ? C.green : C.inkLight}`,
        borderLeft:   `1.5px solid ${selected ? C.green : C.inkLight}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && (
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
        )}
      </div>
      <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.4 }}>{label}</span>
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 13, fontWeight: 500,
        color: C.inkMid, marginBottom: 4, fontFamily: F.body,
      }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: C.inkLight, marginLeft: 6 }}>— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px",
  borderTop:    `1px solid ${C.line}`,
  borderRight:  `1px solid ${C.line}`,
  borderBottom: `1px solid ${C.line}`,
  borderLeft:   `1px solid ${C.line}`,
  borderRadius: 4,
  fontFamily: F.body, fontSize: 14, color: C.ink,
  background: C.white, outline: "none", boxSizing: "border-box",
};

// ── Success screen ────────────────────────────────────────────

function SuccessScreen({ group, onDone }) {
  const groupDescriptions = {
    GROUP_A: "You're following strong biosecurity and farming practices. You'll receive advanced market access tips and premium advisory content.",
    GROUP_B: "You have good foundations. Your advisory content will focus on feeding improvements and cost reduction strategies.",
    GROUP_C: "Your plan will include practical guides on vaccination schedules, disease prevention, and reducing mortality.",
    GROUP_D: "You'll receive step-by-step guides on housing improvements and flock management to build strong foundations.",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh",
      padding: 32, textAlign: "center",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "rgba(28,74,28,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, marginBottom: 20,
      }}>
        ✓
      </div>
      <div style={{ fontFamily: F.display, fontSize: 22, color: C.ink, marginBottom: 8 }}>
        Survey submitted
      </div>
      {group && (
        <div style={{
          display: "inline-block", padding: "4px 14px",
          background: C.green, color: "#fff",
          borderRadius: 20, fontSize: 13, fontWeight: 600,
          marginBottom: 16, fontFamily: F.body,
        }}>
          {group.replace("_", " ")}
        </div>
      )}
      <p style={{
        fontSize: 14, color: C.inkMid, lineHeight: 1.6,
        maxWidth: 340, marginBottom: 28,
      }}>
        {group
          ? groupDescriptions[group] ?? "Your advisory content will be ready soon."
          : "Your responses have been saved. Khokahano will use them to tailor support for your farm."}
      </p>
      <button
        onClick={onDone}
        style={{
          padding: "12px 32px", background: C.green, color: "#fff",
          border: "none", borderRadius: 4,
          fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: F.body,
        }}
      >
        Back to dashboard
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function SurveyPage() {
  const navigate = useNavigate();
  const {
    form, setField, toggleArrayField,
    existing, loading,
    submitting, submitted, submitError,
    submit,
  } = useSurvey();

  // Minimum required: poultry types, housing, vaccination, at least one packaging method
  const isValid =
    form.poultryTypes.length > 0 &&
    form.housingSystem !== "" &&
    form.vaccinationPractice !== "" &&
    form.packagingMethod.length > 0;

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", fontFamily: F.body, color: C.inkLight,
      }}>
        Loading…
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh" }}>
        <TopBar onBack={() => navigate("/farmer")} isUpdate={!!existing} />
        <SuccessScreen
          group={existing?.groupCategory}
          onDone={() => navigate("/farmer")}
        />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh", color: C.ink, WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        .survey-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        @media (min-width: 480px) { .survey-grid { grid-template-columns: 1fr 1fr; } }
        .survey-count-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (min-width: 560px) { .survey-count-grid { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      <TopBar onBack={() => navigate("/farmer")} isUpdate={!!existing} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: F.display, fontSize: 22, color: C.ink, marginBottom: 6 }}>
            {existing ? "Update your farm survey" : "Farm practice survey"}
          </div>
          <p style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.6, margin: 0 }}>
            {existing
              ? "Your responses determine the advisory support and market insights you receive. Update any fields that have changed."
              : "Help Khokahano understand your farming practices. Your answers determine the advisory support and market insights you receive."}
          </p>
          {existing && (
            <button
              onClick={() => navigate("/farmer/survey/history")}
              style={{
                marginTop: 10, background: "none",
                borderTop: "none", borderRight: "none",
                borderBottom: `1px solid ${C.green}`, borderLeft: "none",
                padding: "0 0 1px 0", color: C.green,
                fontSize: 13, fontFamily: F.body,
                cursor: "pointer", fontWeight: 500,
              }}
            >
              📋 View my submitted answers →
            </button>
          )}
        </div>

        {/* ── Section 1: Poultry types ── */}
        <Card>
          <SectionTitle
            step="1"
            title="What do you raise?"
            subtitle="Select all that apply to your current operation."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {POULTRY_TYPE_OPTIONS.map((opt) => (
              <CheckOption
                key={opt.value}
                label={opt.label}
                checked={form.poultryTypes.includes(opt.value)}
                onChange={() => toggleArrayField("poultryTypes", opt.value)}
              />
            ))}
          </div>
        </Card>

        {/* ── Section 2: Bird counts ── */}
        <Card>
          <SectionTitle
            step="2"
            title="How many birds do you have?"
            subtitle="Approximate numbers are fine."
          />
          <div className="survey-count-grid">
            <Field label="Total birds">
              <input
                type="number" min="0"
                value={form.totalBirds}
                onChange={(e) => setField("totalBirds", e.target.value)}
                placeholder="e.g. 200"
                style={inputStyle}
              />
            </Field>
            {form.poultryTypes.includes("broilers") && (
              <Field label="Broilers">
                <input
                  type="number" min="0"
                  value={form.broilerCount}
                  onChange={(e) => setField("broilerCount", e.target.value)}
                  placeholder="e.g. 100"
                  style={inputStyle}
                />
              </Field>
            )}
            {form.poultryTypes.includes("layers") && (
              <Field label="Layers">
                <input
                  type="number" min="0"
                  value={form.layerCount}
                  onChange={(e) => setField("layerCount", e.target.value)}
                  placeholder="e.g. 80"
                  style={inputStyle}
                />
              </Field>
            )}
            {form.poultryTypes.includes("indigenous") && (
              <Field label="Indigenous">
                <input
                  type="number" min="0"
                  value={form.indigenousCount}
                  onChange={(e) => setField("indigenousCount", e.target.value)}
                  placeholder="e.g. 20"
                  style={inputStyle}
                />
              </Field>
            )}
          </div>
        </Card>

        {/* ── Section 3: Housing ── */}
        <Card>
          <SectionTitle step="3" title="Housing system" subtitle="How are your birds housed most of the time?" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {HOUSING_OPTIONS.map((opt) => (
              <RadioOption
                key={opt.value}
                label={opt.label}
                selected={form.housingSystem === opt.value}
                onChange={() => setField("housingSystem", opt.value)}
              />
            ))}
          </div>
        </Card>

        {/* ── Section 4: Feeding ── */}
        <Card>
          <SectionTitle step="4" title="Feeding" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {FEEDING_OPTIONS.map((opt) => (
              <RadioOption
                key={opt.value}
                label={opt.label}
                selected={form.feedingMethod === opt.value}
                onChange={() => setField("feedingMethod", opt.value)}
              />
            ))}
          </div>
          {(form.feedingMethod === "commercial" || form.feedingMethod === "both") && (
            <Field label="Feed brand" hint="optional">
              <input
                type="text"
                value={form.feedBrand}
                onChange={(e) => setField("feedBrand", e.target.value)}
                placeholder="e.g. Molapo, Lesotho Milling, Rainbow"
                style={inputStyle}
              />
            </Field>
          )}
        </Card>

        {/* ── Section 5: Vaccination ── */}
        <Card>
          <SectionTitle step="5" title="Vaccination" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {VACCINATING_OPTIONS.map((opt) => (
              <RadioOption
                key={opt.value}
                label={opt.label}
                selected={form.vaccinationPractice === opt.value}
                onChange={() => setField("vaccinationPractice", opt.value)}
              />
            ))}
          </div>
          {(form.vaccinationPractice === "yes" || form.vaccinationPractice === "sometimes") && (
            <>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.inkMid, marginBottom: 8, fontFamily: F.body }}>
                Which vaccines do you use? <span style={{ fontWeight: 400, color: C.inkLight }}>— select all</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {VACCINE_OPTIONS.map((opt) => (
                  <CheckOption
                    key={opt.value}
                    label={opt.label}
                    checked={form.vaccinesUsed.includes(opt.value)}
                    onChange={() => toggleArrayField("vaccinesUsed", opt.value)}
                  />
                ))}
              </div>
            </>
          )}
        </Card>

        {/* ── Section 6: Diseases & mortality ── */}
        <Card>
          <SectionTitle
            step="6"
            title="Health challenges"
            subtitle="Which diseases or health problems have affected your flock in the past year?"
          />
          <div className="survey-grid" style={{ marginBottom: 16 }}>
            {DISEASE_OPTIONS.map((opt) => (
              <CheckOption
                key={opt.value}
                label={opt.label}
                checked={form.diseaseChallenges.includes(opt.value)}
                onChange={() => toggleArrayField("diseaseChallenges", opt.value)}
              />
            ))}
          </div>
          <Field label="Mortality rate" hint="% of birds lost per cycle">
            <div style={{ position: "relative" }}>
              <input
                type="number" min="0" max="100" step="0.5"
                value={form.mortalityRatePercent}
                onChange={(e) => setField("mortalityRatePercent", e.target.value)}
                placeholder="e.g. 5"
                style={{ ...inputStyle, paddingRight: 32 }}
              />
              <span style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                fontSize: 13, color: C.inkLight, pointerEvents: "none",
              }}>%</span>
            </div>
          </Field>
        </Card>

        {/* ── Section 7: Market access & packaging ── */}
        <Card>
          <SectionTitle step="7" title="Market access & packaging" />
          <Field label="Biggest market challenge" hint="optional — describe in your own words">
            <textarea
              rows={3}
              value={form.marketAccessChallenges}
              onChange={(e) => setField("marketAccessChallenges", e.target.value)}
              placeholder="e.g. No transport, buyers pay late, prices too low, no cold storage…"
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </Field>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.inkMid, marginBottom: 4, fontFamily: F.body }}>
            How do you sell your products?
          </div>
          <div style={{ fontSize: 12, color: C.inkLight, marginBottom: 10 }}>
            Select all that apply — you may sell live birds and dressed birds to different buyers.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PACKAGING_OPTIONS.map((opt) => (
              <CheckOption
                key={opt.value}
                label={opt.label}
                checked={form.packagingMethod.includes(opt.value)}
                onChange={() => toggleArrayField("packagingMethod", opt.value)}
              />
            ))}
          </div>
        </Card>

        {/* ── Submit ── */}
        {submitError && (
          <div style={{
            padding: "12px 16px", marginBottom: 16,
            background: "rgba(163,45,45,0.08)",
            borderTop:    `1px solid rgba(163,45,45,0.2)`,
            borderRight:  `1px solid rgba(163,45,45,0.2)`,
            borderBottom: `1px solid rgba(163,45,45,0.2)`,
            borderLeft:   `3px solid #a32d2d`,
            borderRadius: 4,
            fontSize: 14, color: "#a32d2d", fontFamily: F.body,
          }}>
            {submitError}
          </div>
        )}

        <button
          onClick={submit}
          disabled={submitting || !isValid}
          style={{
            width: "100%", padding: 14,
            background: submitting || !isValid ? C.inkLight : C.green,
            color: "#fff", border: "none", borderRadius: 4,
            fontSize: 15, fontWeight: 600,
            cursor: submitting || !isValid ? "default" : "pointer",
            fontFamily: F.body, transition: "background 0.15s",
          }}
        >
          {submitting ? "Saving…" : existing ? "Update survey" : "Submit survey"}
        </button>

        {!isValid && (
          <p style={{ fontSize: 12, color: C.inkLight, textAlign: "center", marginTop: 10 }}>
            Complete sections 1, 3, 5, and 7 before submitting.
          </p>
        )}
      </div>
    </div>
  );
}