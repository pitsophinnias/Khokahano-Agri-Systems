import { THEME, SUBSCRIPTION_PLANS } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

export default function SubscriptionPlans({ lang, t }) {
  const planLabels = {
    basic:   t("plan_basic"),
    growth:  t("plan_growth"),
    premium: t("plan_premium"),
  };

  return (
    <section style={{
      background: C.bg,
      borderTop: `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`,
      padding: "48px 20px",
    }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <p style={{
          fontSize: 11, fontWeight: 500, letterSpacing: "0.1em",
          textTransform: "uppercase", color: C.inkLight, marginBottom: 10,
        }}>
          {t("plans_heading")}
        </p>
        <h2 style={{
          fontFamily: F.display, fontSize: "clamp(22px,4vw,32px)",
          fontWeight: 400, color: C.ink, marginBottom: 8,
        }}>
          {t("plans_sub")}
        </h2>
        <p style={{ fontSize: 11, color: C.inkLight, marginBottom: 36 }}>
          {t("plan_note")}
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 1,
          background: C.line,
          border: `1px solid ${C.line}`,
        }}>
          {SUBSCRIPTION_PLANS.map((plan, i) => {
            const isPopular = plan.key === "growth";
            const features  = plan.features[lang] ?? plan.features.en;
            return (
              <div
                key={plan.key}
                style={{
                  background: isPopular ? C.green : C.white,
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  position: "relative",
                }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <span style={{
                    position: "absolute", top: 16, right: 16,
                    background: C.gold, color: "#fff",
                    fontSize: 9, fontWeight: 700, padding: "3px 8px",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>
                    {t("plan_popular")}
                  </span>
                )}

                {/* Plan name */}
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: isPopular ? "rgba(255,255,255,0.6)" : C.inkLight,
                    marginBottom: 6,
                  }}>
                    {planLabels[plan.key]}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{
                      fontFamily: F.display, fontSize: 36,
                      color: isPopular ? "#fff" : C.ink, fontWeight: 400,
                    }}>
                      M{plan.price}
                    </span>
                    <span style={{ fontSize: 12, color: isPopular ? "rgba(255,255,255,0.6)" : C.inkLight }}>
                      {t("plan_per_month")}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
                      <span style={{ color: isPopular ? C.gold : C.green, flexShrink: 0, marginTop: 1, fontWeight: 700 }}>
                        ✓
                      </span>
                      <span style={{ color: isPopular ? "rgba(255,255,255,0.85)" : C.inkMid, lineHeight: 1.5 }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button style={{
                  marginTop: "auto",
                  padding: "11px 0",
                  border: isPopular ? "none" : `1.5px solid ${C.green}`,
                  borderRadius: 4,
                  background: isPopular ? C.gold : "transparent",
                  color: isPopular ? "#fff" : C.green,
                  fontFamily: F.body,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}>
                  {t("plan_cta")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}