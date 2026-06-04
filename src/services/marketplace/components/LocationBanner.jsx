import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

export default function LocationBanner({ onAllow, onDeny, detecting, t }) {
  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .loc-banner {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 300;
          animation: slideUp 0.3s ease;
        }
      `}</style>

      <div className="loc-banner">
        <div style={{
          background: C.ink,
          borderTop: `3px solid ${C.green}`,
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          maxWidth: "100%",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 240 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>📍</span>
            <div>
              <div style={{ fontFamily: F.display, fontSize: 15, color: "#fff", marginBottom: 4 }}>
                {t("loc_title")}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                {t("loc_desc")}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={onDeny}
              style={{
                padding: "8px 16px", background: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.6)", borderRadius: 4,
                fontSize: 13, cursor: "pointer", fontFamily: F.body,
              }}
            >
              {t("loc_deny")}
            </button>
            <button
              onClick={onAllow}
              disabled={detecting}
              style={{
                padding: "8px 16px",
                background: detecting ? C.inkLight : C.green,
                border: "none", color: "#fff",
                borderRadius: 4, fontSize: 13, fontWeight: 500,
                cursor: detecting ? "default" : "pointer",
                fontFamily: F.body,
              }}
            >
              {detecting ? t("loc_detecting") : t("loc_allow")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}