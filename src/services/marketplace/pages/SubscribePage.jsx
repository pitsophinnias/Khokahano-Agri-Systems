import { THEME, SUBSCRIPTION_PLANS } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

export default function SubscribePage({ lang, t, onBack }) {
  return (
    <main>
      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: "32px 20px 28px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <button
            onClick={onBack}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              color: C.inkLight, fontSize: 13, fontFamily: F.body, marginBottom: 20,
            }}
          >
            ← {t("subscribe_back")}
          </button>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkLight, marginBottom: 10 }}>
            {t("plans_heading")}
          </p>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(24px,4vw,36px)", fontWeight: 400, color: C.ink, marginBottom: 10 }}>
            {t("subscribe_heading")}
          </h1>
          <p style={{ fontSize: 15, color: C.inkMid, lineHeight: 1.7, maxWidth: 520 }}>
            {t("subscribe_sub")}
          </p>
        </div>
      </div>

      {/* Plans */}
      <div style={{ background: C.bg, padding: "40px 20px 60px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 1, background: C.line, border: `1px solid ${C.line}`,
            marginBottom: 16,
          }}>
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isPopular = plan.key === "growth";
              const features  = plan.features[lang] ?? plan.features.en;
              const labels    = { basic: t("plan_basic"), growth: t("plan_growth"), premium: t("plan_premium") };

              return (
                <div
                  key={plan.key}
                  style={{
                    background: isPopular ? C.green : C.white,
                    padding: "32px 28px",
                    display: "flex", flexDirection: "column", gap: 18,
                    position: "relative",
                  }}
                >
                  {isPopular && (
                    <span style={{
                      position: "absolute", top: 18, right: 18,
                      background: C.gold, color: "#fff",
                      fontSize: 9, fontWeight: 700, padding: "3px 8px",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      {t("plan_popular")}
                    </span>
                  )}

                  <div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: isPopular ? "rgba(255,255,255,0.55)" : C.inkLight, marginBottom: 8,
                    }}>
                      {labels[plan.key]}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontFamily: F.display, fontSize: 40, color: isPopular ? "#fff" : C.ink, fontWeight: 400 }}>
                        M{plan.price}
                      </span>
                      <span style={{ fontSize: 13, color: isPopular ? "rgba(255,255,255,0.55)" : C.inkLight }}>
                        {t("plan_per_month")}
                      </span>
                    </div>
                  </div>

                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                    {features.map((f, j) => (
                      <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                        <span style={{ color: isPopular ? C.gold : C.green, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
                        <span style={{ color: isPopular ? "rgba(255,255,255,0.85)" : C.inkMid, lineHeight: 1.5 }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => alert(`Joining ${labels[plan.key]} plan — payment flow coming soon!`)}
                    style={{
                      marginTop: "auto", padding: "13px 0",
                      border: isPopular ? "none" : `1.5px solid ${C.green}`,
                      borderRadius: 4,
                      background: isPopular ? C.gold : "transparent",
                      color: isPopular ? "#fff" : C.green,
                      fontFamily: F.body, fontSize: 14, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {t("plan_cta")}
                  </button>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 12, color: C.inkLight, textAlign: "center" }}>
            {t("plan_note")}
          </p>
        </div>
      </div>
    </main>
  );
}