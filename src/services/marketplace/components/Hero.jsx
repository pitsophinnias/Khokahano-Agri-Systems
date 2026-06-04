import { useState } from "react";
import { THEME, DISTRICTS } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

export default function Hero({ t, onSearch }) {
  const [query, setQuery]       = useState("");
  const [district, setDistrict] = useState("all");

  const handleSearch = () => onSearch({ query, district });

  return (
    <>
      <style>{`
        .kh-hero { background: ${C.white}; border-bottom: 1px solid ${C.line}; padding: 32px 16px 28px; }
        .kh-hero-inner { max-width: 680px; margin: 0 auto; }
        .kh-search-row { display: flex; flex-direction: column; gap: 8px; }
        .kh-search-row input,
        .kh-search-row select,
        .kh-search-row button { width: 100%; font-size: 16px; } /* 16px prevents iOS zoom */
        @media (min-width: 520px) {
          .kh-search-row { flex-direction: row; flex-wrap: wrap; }
          .kh-search-row input  { flex: 1; min-width: 140px; width: auto; }
          .kh-search-row select { width: auto; }
          .kh-search-row button { width: auto; }
        }
      `}</style>

      <section className="kh-hero">
        <div className="kh-hero-inner">
          <p style={{
            fontSize: 11, fontWeight: 500, letterSpacing: "0.1em",
            textTransform: "uppercase", color: C.inkLight, marginBottom: 12,
          }}>
            {t("marketplace_label")}
          </p>

          <h1 style={{
            fontFamily: F.display,
            fontSize: "clamp(24px, 6vw, 44px)",
            color: C.ink, lineHeight: 1.1, marginBottom: 12, fontWeight: 400,
          }}>
            {t("hero_title")}<br />
            <em style={{ fontStyle: "italic", color: C.greenMid }}>{t("hero_title_em")}</em>
          </h1>

          <p style={{
            fontSize: 14, color: C.inkMid, lineHeight: 1.7,
            maxWidth: 520, marginBottom: 22,
          }}>
            {t("hero_desc")}
          </p>

          <div className="kh-search-row">
            <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                color: C.inkLight, fontSize: 15, pointerEvents: "none",
              }}>⌕</span>
              <input
                style={{
                  width: "100%", padding: "10px 12px 10px 34px",
                  border: `1px solid ${C.line}`, borderRadius: 4,
                  fontFamily: F.body, background: C.bg, color: C.ink, outline: "none",
                }}
                placeholder={t("search_placeholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={(e)  => (e.target.style.borderColor = C.green)}
                onBlur={(e)   => (e.target.style.borderColor = C.line)}
              />
            </div>

            <select
              style={{
                padding: "10px 12px",
                border: `1px solid ${C.line}`, borderRadius: 4,
                fontFamily: F.body, background: C.bg, color: C.ink, cursor: "pointer",
              }}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="all">{t("all_districts")}</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <button
              onClick={handleSearch}
              style={{
                padding: "10px 18px", background: C.green, color: "#fff",
                border: "none", borderRadius: 4, fontSize: 14, fontWeight: 500,
                cursor: "pointer", fontFamily: F.body,
              }}
            >
              {t("search_btn")}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}