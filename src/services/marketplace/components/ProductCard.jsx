import { useState } from "react";
import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

const BADGE_STYLES = {
  green: { color: C.green,   border: `1px solid ${C.green}` },
  amber: { color: C.gold,    border: `1px solid ${C.gold}` },
  blue:  { color: "#1a4fa0", border: "1px solid #1a4fa0" },
};

const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

export default function ProductCard({ product, lf, t, onOpen }) {
  const [hovered, setHovered] = useState(false);

  const title  = lf(product, "title");
  const farmer = lf(product.farmer, "name");
  const desc   = lf(product, "description");
  const unit   = lf(product, "unit");

  return (
    <article
      style={{
        background: hovered ? "#faf9f7" : C.white,
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{
        width: "100%",
        aspectRatio: "4/3",
        overflow: "hidden",
        position: "relative",
        background: "#e8e6e0",
        flexShrink: 0,
      }}>
        <img
          src={product.images[0]}
          alt={title}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
        />

        {/* Stock badge */}
        <span style={{
          position: "absolute", top: 8, left: 8,
          fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
          textTransform: "uppercase", padding: "2px 6px",
          background: C.white,
          ...(BADGE_STYLES[product.badge.type] ?? BADGE_STYLES.green),
        }}>
          {product.badge.en}
        </span>

        {/* Verified */}
        {product.farmer.verified && (
          <span style={{
            position: "absolute", top: 8, right: 8,
            background: C.green, color: "#fff",
            fontSize: 9, fontWeight: 700, padding: "2px 6px",
            letterSpacing: "0.04em",
            display: "flex", alignItems: "center", gap: 3,
          }}>
            &#10003;<span className="kh-verified-text"> {t("verified")}</span>
          </span>
        )}
      </div>

      {/* Body — uses kh-card-body class so media queries control padding/gap */}
      <div
        className="kh-card-body"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {/* Title + price row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
          <div
            className="kh-card-title"
            style={{ fontFamily: F.display, color: C.ink, lineHeight: 1.25, fontWeight: 400, flex: 1 }}
          >
            {title}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              className="kh-card-price"
              style={{ fontWeight: 600, color: C.green, letterSpacing: "-0.02em" }}
            >
              M {product.price}
            </div>
            <div
              className="kh-card-unit"
              style={{ color: C.inkLight, whiteSpace: "nowrap" }}
            >
              {unit}
            </div>
          </div>
        </div>

        {/* Description — hidden on very small cards via CSS */}
        <div
          className="kh-card-desc"
          style={{
            fontSize: 12, color: C.inkMid, lineHeight: 1.6,
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {desc}
        </div>

        {/* Farmer + rating — hidden on very small cards via CSS */}
        <div
          className="kh-card-farmer"
          style={{
            display: "flex",
            justifyContent: "space-between", alignItems: "flex-end",
            marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${C.line}`,
            gap: 4,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {farmer}
            </span>
            <span style={{ fontSize: 10, color: C.inkLight, display: "flex", alignItems: "center", gap: 2 }}>
              &#x1F4CD; {product.village}
            </span>
          </div>
          <div style={{ fontSize: 10, color: C.inkLight, textAlign: "right", flexShrink: 0 }}>
            <div style={{ color: C.gold, fontSize: 10 }}>{stars(product.rating)}</div>
            <div>{product.rating}</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="kh-card-actions" style={{ display: "flex", borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(product, "contact"); }}
          style={{
            flex: 1, border: "none",
            borderRight: `1px solid ${C.line}`,
            background: "none", fontFamily: F.body,
            cursor: "pointer", color: C.inkMid, fontWeight: 400,
          }}
        >
          {t("contact_btn")}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(product, "order"); }}
          style={{
            flex: 1, border: "none",
            background: C.green, color: "#fff",
            fontFamily: F.body, cursor: "pointer", fontWeight: 500,
          }}
        >
          {t("order_btn")}
        </button>
      </div>
    </article>
  );
}