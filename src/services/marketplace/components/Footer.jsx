import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;
const CONTACT = THEME.contact;

export default function Footer({ t, onNavigate }) {
  return (
    <footer style={{ background: C.ink, color: "rgba(255,255,255,0.5)", padding: "40px 20px 28px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: 32, marginBottom: 36,
          paddingBottom: 36, borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {/* Brand */}
          <div style={{ maxWidth: 260 }}>
            <div style={{ fontFamily: F.display, fontSize: 20, color: "#fff", marginBottom: 4 }}>
              Khokahano Agri Systems
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
              Connect. Coordinate. Grow. Succeed.
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              {t("footer_desc")}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
              {t("contact_us")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href={`tel:${CONTACT.phone}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13 }}>
                📞 {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13 }}>
                ✉ {CONTACT.email}
              </a>
              <a href={`https://${CONTACT.website}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13 }}>
                🌐 {CONTACT.website}
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
              Platform
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span
                onClick={() => onNavigate("about")}
                style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
              >
                {t("about")}
              </span>
              <span
                onClick={() => onNavigate("subscribe")}
                style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
              >
                {t("list_farm")}
              </span>
              <span
                onClick={() => onNavigate("marketplace")}
                style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
              >
                {t("nav_marketplace")}
              </span>
            </nav>
          </div>

          {/* WhatsApp CTA */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <a
              href="https://wa.me/26657638217"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 20px", background: "#128C7E",
                borderRadius: 4, textDecoration: "none",
                color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: F.body,
              }}
            >
              💬 Chat on WhatsApp
            </a>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8, textAlign: "center" }}>
              +266 57638217
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            {t("rights")} &middot; Connecting farmers. Transforming poultry. Transforming Lesotho.
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            {CONTACT.email}
          </div>
        </div>
      </div>
    </footer>
  );
}