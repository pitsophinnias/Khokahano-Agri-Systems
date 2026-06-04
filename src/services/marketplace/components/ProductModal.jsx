import { useState } from "react";
import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

const stars    = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
const initials = (name) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

// ── ORDER TAB ─────────────────────────────────────────────────
function OrderTab({ product, lf, t, onAddToCart }) {
  const [qty, setQty]     = useState(product.minOrder);
  const [added, setAdded] = useState(false);

  const unit   = lf(product, "unit");
  const total  = (product.price * qty).toLocaleString();
  const change = (d) => setQty((q) => Math.max(product.minOrder, Math.min(product.stock, q + d)));

  const handleAdd = () => {
    onAddToCart(product, qty);
    setAdded(true);
  };

  if (added) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🛒</div>
        <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink, marginBottom: 8 }}>
          {t("order_success")}
        </div>
        <div style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.6 }}>{t("order_hint")}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Price summary */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        padding: 16, background: C.bg, borderRadius: 4, marginBottom: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, color: C.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            {t("price_unit")}
          </div>
          <div style={{ fontFamily: F.display, fontSize: 26, color: C.ink }}>M {product.price}</div>
          <div style={{ fontSize: 11, color: C.inkLight }}>{unit}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            {t("order_total")}
          </div>
          <div style={{ fontFamily: F.display, fontSize: 26, color: C.ink }}>M {total}</div>
          <div style={{ fontSize: 11, color: C.inkLight }}>{qty} × M {product.price}</div>
        </div>
      </div>

      {/* Quantity controls */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: C.ink, marginBottom: 8, display: "block" }}>
          {t("qty_label")}{" "}
          <span style={{ color: C.inkLight, fontWeight: 400 }}>({t("min_label")} {product.minOrder})</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => change(-1)}
            style={{
              width: 34, height: 34, border: `1px solid ${C.line}`,
              borderRadius: 4, background: C.white, fontSize: 17,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", color: C.ink,
            }}
          >−</button>
          <input
            type="number"
            value={qty}
            min={product.minOrder}
            max={product.stock}
            onChange={(e) => setQty(Math.max(product.minOrder, parseInt(e.target.value) || product.minOrder))}
            style={{
              width: 68, textAlign: "center", padding: 7,
              border: `1px solid ${C.line}`, borderRadius: 4,
              fontSize: 15, fontFamily: F.body,
            }}
          />
          <button
            onClick={() => change(1)}
            style={{
              width: 34, height: 34, border: `1px solid ${C.line}`,
              borderRadius: 4, background: C.white, fontSize: 17,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", color: C.ink,
            }}
          >+</button>
        </div>
      </div>

      {/* Availability note */}
      <div style={{
        background: C.greenLight, borderLeft: `3px solid ${C.green}`,
        padding: "10px 14px", fontSize: 12, color: "#1c4a1c",
        marginBottom: 16, lineHeight: 1.6,
      }}>
        {product.stock} {t("avail_note")}
      </div>

      <button
        onClick={handleAdd}
        style={{
          width: "100%", padding: 13, background: C.green,
          color: "#fff", border: "none", borderRadius: 4,
          fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: F.body,
        }}
      >
        {t("submit_btn")}
      </button>
      <p style={{ fontSize: 11, color: C.inkLight, textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
        {t("order_hint")}
      </p>
    </div>
  );
}

// ── CONTACT TAB ───────────────────────────────────────────────
function ContactTab({ product, lf, t }) {
  const farmer = lf(product.farmer, "name");
  return (
    <div style={{ padding: 20 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: 14, background: C.bg, borderRadius: 4, marginBottom: 16,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", background: C.green,
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: F.display, fontSize: 16, flexShrink: 0,
        }}>
          {initials(farmer)}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{farmer}</div>
          <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>📍 {product.village}, {product.district}</div>
          {product.farmer.verified && (
            <div style={{ fontSize: 11, color: C.green, marginTop: 3, fontWeight: 500 }}>✓ {t("verified")}</div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <a href={`tel:${product.farmer.phone}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, padding: 12, borderRadius: 4, fontSize: 13, fontWeight: 500,
            fontFamily: F.body, textDecoration: "none", background: C.green, color: "#fff",
          }}
        >
          📞 {t("call_btn")}
        </a>
        <a href={`https://wa.me/${product.farmer.phone.replace(/\D/g, "")}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, padding: 12, borderRadius: 4, fontSize: 13, fontWeight: 500,
            fontFamily: F.body, textDecoration: "none", background: "#128C7E", color: "#fff",
          }}
        >
          💬 {t("whatsapp_btn")}
        </a>
      </div>
      <p style={{ fontSize: 12, color: C.inkLight, textAlign: "center", lineHeight: 1.5 }}>
        {t("contact_note")}
      </p>
    </div>
  );
}

// ── DETAILS TAB ───────────────────────────────────────────────
function DetailsTab({ product, lf, t }) {
  const desc = lf(product, "description");
  const rows = [
    [t("district_label"),  product.district],
    [t("village_label"),   product.village],
    [t("available"),       `${product.stock}`],
    [t("min_order"),       `${product.minOrder}`],
    [t("rating_label"),    `${product.rating} (${product.reviews})`],
    [t("phone_label"),     product.farmer.phone],
  ];
  return (
    <div style={{ padding: 20 }}>
      <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.7, marginBottom: 14 }}>{desc}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ padding: "10px 12px", background: C.bg, borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: C.inkLight, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MODAL SHELL ───────────────────────────────────────────────
const TABS = ["order", "contact", "details"];

export default function ProductModal({ product, initialTab = "order", lf, t, onClose, onAddToCart }) {
  const [tab, setTab] = useState(initialTab);
  const title = lf(product, "title");

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.42)",
        display: "flex",
        alignItems: window.innerWidth >= 600 ? "center" : "flex-end",
        justifyContent: "center", zIndex: 200,
        padding: window.innerWidth >= 600 ? 20 : 0,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.white, width: "100%", maxWidth: 520,
          borderRadius: window.innerWidth >= 600 ? 6 : "8px 8px 0 0",
          maxHeight: window.innerWidth >= 600 ? "85vh" : "92vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: `1px solid ${C.line}`,
          position: "sticky", top: 0, background: C.white, zIndex: 1,
        }}>
          <div style={{ fontFamily: F.display, fontSize: 18, color: C.ink, fontWeight: 400 }}>{title}</div>
          <button onClick={onClose} aria-label="Close" style={{
            width: 32, height: 32, border: `1px solid ${C.line}`, borderRadius: 4,
            background: "none", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 16, color: C.inkMid,
          }}>✕</button>
        </div>

        {/* Image */}
        <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "#e8e6e0" }}>
          <img src={product.images[0]} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.line}`, padding: "0 20px" }}>
          {TABS.map((key) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "12px 14px", border: "none",
              borderBottom: tab === key ? `2px solid ${C.green}` : "2px solid transparent",
              background: "none", fontFamily: F.body, fontSize: 13, cursor: "pointer",
              color: tab === key ? C.green : C.inkLight,
              fontWeight: tab === key ? 500 : 400, transition: "all 0.15s",
            }}>
              {t(`tab_${key}`)}
            </button>
          ))}
        </div>

        {tab === "order"   && <OrderTab   product={product} lf={lf} t={t} onAddToCart={onAddToCart} />}
        {tab === "contact" && <ContactTab product={product} lf={lf} t={t} />}
        {tab === "details" && <DetailsTab product={product} lf={lf} t={t} />}
      </div>
    </div>
  );
}