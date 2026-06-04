import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

const ICONS = ["🤝", "🛒", "📚", "📊"];

export default function WhatWeDo({ t }) {
  const items = [
    { icon: ICONS[0], title: t("what1_title"), desc: t("what1_desc") },
    { icon: ICONS[1], title: t("what2_title"), desc: t("what2_desc") },
    { icon: ICONS[2], title: t("what3_title"), desc: t("what3_desc") },
    { icon: ICONS[3], title: t("what4_title"), desc: t("what4_desc") },
  ];

  return (
    <section style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: "48px 20px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <p style={{
          fontSize: 11, fontWeight: 500, letterSpacing: "0.1em",
          textTransform: "uppercase", color: C.inkLight, marginBottom: 10,
        }}>
          {t("what_heading")}
        </p>
        <h2 style={{
          fontFamily: F.display, fontSize: "clamp(22px,4vw,32px)",
          fontWeight: 400, color: C.ink, marginBottom: 36,
        }}>
          A coordination &amp; market access ecosystem<br />
          <em style={{ fontStyle: "italic", color: C.greenMid }}>for sustainable livelihoods.</em>
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 0,
          border: `1px solid ${C.line}`,
        }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                padding: "24px 22px",
                borderRight: i % 2 === 0 ? `1px solid ${C.line}` : "none",
                borderBottom: i < 2 ? `1px solid ${C.line}` : "none",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.ink, marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.7 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}