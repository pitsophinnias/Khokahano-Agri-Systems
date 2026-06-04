import { THEME } from "../constants/theme.js";
import WhatWeDo from "../components/WhatWeDo.jsx";

const C = THEME.colors;
const F = THEME.fonts;

function ImpactCard({ title, desc, icon }) {
  return (
    <div style={{ padding: "22px 20px", background: C.white, display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.ink }}>{title}</div>
      <div style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.7 }}>{desc}</div>
    </div>
  );
}

export default function AboutPage({ t }) {
  const impacts = [
    { icon: "💼", title: t("impact1_title"), desc: t("impact1_desc") },
    { icon: "📈", title: t("impact2_title"), desc: t("impact2_desc") },
    { icon: "🌾", title: t("impact3_title"), desc: t("impact3_desc") },
    { icon: "🤝", title: t("impact4_title"), desc: t("impact4_desc") },
  ];

  return (
    <main>
      {/* Hero banner */}
      <div style={{
        background: C.green, padding: "52px 20px 48px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>
          Khokahano Agri Systems
        </p>
        <h1 style={{
          fontFamily: F.display, fontSize: "clamp(28px,5vw,44px)",
          color: "#fff", fontWeight: 400, lineHeight: 1.15, marginBottom: 16,
        }}>
          Transforming poultry<br />
          <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.75)" }}>in Lesotho.</em>
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
          A coordination &amp; market access ecosystem for sustainable livelihoods.
        </p>
      </div>

      {/* Mission + Vision */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}` }}>
        <div style={{
          maxWidth: 1060, margin: "0 auto", padding: "48px 20px",
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 1, background: C.line, border: `1px solid ${C.line}`,
        }}>
          {[
            { title: t("about_mission_title"), body: t("about_mission"), icon: "🎯" },
            { title: t("about_vision_title"),  body: t("about_vision"),  icon: "👁" },
          ].map((item) => (
            <div key={item.title} style={{ background: C.white, padding: "32px 28px" }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
              <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink, marginBottom: 12, fontWeight: 400 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.8 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What we do */}
      <WhatWeDo t={t} />

      {/* Impact */}
      <section style={{ background: C.bg, borderTop: `1px solid ${C.line}`, padding: "48px 20px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkLight, marginBottom: 10 }}>
            {t("about_impact_title")}
          </p>
          <h2 style={{ fontFamily: F.display, fontSize: "clamp(22px,4vw,32px)", fontWeight: 400, color: C.ink, marginBottom: 28 }}>
            How we make a difference.
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 1, background: C.line, border: `1px solid ${C.line}`,
          }}>
            {impacts.map((item) => <ImpactCard key={item.title} {...item} />)}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section style={{ background: C.green, padding: "48px 20px", textAlign: "center" }}>
        <div style={{
          fontFamily: F.display, fontSize: "clamp(18px,3vw,26px)",
          color: "#fff", fontStyle: "italic", lineHeight: 1.6,
          maxWidth: 480, margin: "0 auto",
        }}>
          &ldquo;{t("about_quote")}&rdquo;
        </div>
      </section>
    </main>
  );
}