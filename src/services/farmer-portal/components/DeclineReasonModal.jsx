// ---------------------------------------------------------------------------
// DeclineReasonModal.jsx
// Shown when a farmer presses "Decline". Captures the reason.
// Reason is stored on the order and visible in analytics.
// ---------------------------------------------------------------------------

import { useState } from "react";

const C = {
  green:    "#1c4a1c",
  white:    "#ffffff",
  line:     "#e2e0da",
  ink:      "#1a1a18",
  inkMid:   "#4a4a44",
  inkLight: "#8a8a80",
  bg:       "#f7f6f3",
  red:      "#a32d2d",
  redLight: "#ffebee",
};

const F = { body: "'Geist', system-ui, sans-serif", display: "'Instrument Serif', Georgia, serif" };

const PRESET_REASONS = [
  { key: "out_of_stock",  en: "Out of stock",               st: "Ha ea lekana" },
  { key: "qty_too_high",  en: "Quantity too high for me",   st: "Palo e fetelletse" },
  { key: "unavailable",   en: "Not available on that date", st: "Ha ke fumaneha letsatsing leo" },
  { key: "area_far",      en: "Delivery area too far",      st: "Sebaka sa phahamo se hole haholo" },
  { key: "other",         en: "Other reason",               st: "Lebaka le leng" },
];

export default function DeclineReasonModal({ order, lang = "en", onConfirm, onCancel }) {
  const [selected, setSelected] = useState(null);
  const [custom,   setCustom]   = useState("");

  const title = typeof order.productTitle === "object" ? order.productTitle[lang] : order.productTitle;
  const canSubmit = selected && (selected !== "other" || custom.trim().length > 3);

  const handleSubmit = () => {
    const reason = selected === "other"
      ? custom.trim()
      : PRESET_REASONS.find((r) => r.key === selected)?.[lang] ?? selected;
    onConfirm({ declineReason: reason, declineReasonKey: selected });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 500,
    }} onClick={onCancel}>
      <div
        style={{
          background: C.white, width: "100%", maxWidth: 480,
          borderRadius: "10px 10px 0 0", padding: "24px 20px 32px",
          maxHeight: "80vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.red, marginBottom: 6 }}>
            Decline order
          </div>
          <div style={{ fontFamily: F.display, fontSize: 18, color: C.ink, marginBottom: 4 }}>
            Why are you declining?
          </div>
          <div style={{ fontSize: 13, color: C.inkLight }}>
            Order for <strong>{title}</strong> from {order.buyer.name}
          </div>
        </div>

        {/* Preset reasons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {PRESET_REASONS.map((r) => (
            <button
              key={r.key}
              onClick={() => setSelected(r.key)}
              style={{
                padding: "11px 14px",
                border: `1.5px solid ${selected === r.key ? C.red : C.line}`,
                borderRadius: 6,
                background: selected === r.key ? C.redLight : C.white,
                color: selected === r.key ? C.red : C.ink,
                fontSize: 14, fontWeight: selected === r.key ? 500 : 400,
                cursor: "pointer", fontFamily: F.body,
                textAlign: "left", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: "50%",
                border: `2px solid ${selected === r.key ? C.red : C.line}`,
                background: selected === r.key ? C.red : "none",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {selected === r.key && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "block" }} />}
              </span>
              {r[lang] ?? r.en}
            </button>
          ))}
        </div>

        {/* Custom reason text */}
        {selected === "other" && (
          <div style={{ marginBottom: 14 }}>
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Please describe the reason…"
              rows={3}
              style={{
                width: "100%", padding: "10px 12px",
                border: `1px solid ${C.line}`, borderRadius: 6,
                fontFamily: F.body, fontSize: 14, color: C.ink,
                resize: "vertical",
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "12px 0", border: `1px solid ${C.line}`,
              borderRadius: 6, background: "none", color: C.inkMid,
              fontSize: 14, cursor: "pointer", fontFamily: F.body,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              flex: 2, padding: "12px 0", border: "none",
              borderRadius: 6,
              background: canSubmit ? C.red : C.line,
              color: canSubmit ? "#fff" : C.inkLight,
              fontSize: 14, fontWeight: 600,
              cursor: canSubmit ? "pointer" : "default",
              fontFamily: F.body,
            }}
          >
            Confirm decline
          </button>
        </div>
      </div>
    </div>
  );
}