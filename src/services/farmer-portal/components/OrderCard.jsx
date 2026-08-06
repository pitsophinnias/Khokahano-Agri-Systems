import { useState } from "react";
import { STATUS_CONFIG, ACTION_CONFIG } from "../constants/orderStatuses.js";
import OrderTimerBadge    from "./OrderTimerBadge.jsx";
import DeclineReasonModal from "./DeclineReasonModal.jsx";

const C = {
  green:    "#1c4a1c",
  gold:     "#b8860b",
  ink:      "#1a1a18",
  inkMid:   "#4a4a44",
  inkLight: "#8a8a80",
  line:     "#e2e0da",
  bg:       "#f7f6f3",
  white:    "#ffffff",
};
const F = {
  display: "'Instrument Serif', Georgia, serif",
  body:    "'Geist', system-ui, sans-serif",
};

const PAYMENT_ICONS  = { mpesa: "📱 M-Pesa", ecocash: "💳 EcoCash", card: "🏦 Card" };
const DELIVERY_ICONS = { pickup: "🏪 Pickup", delivery: "🚚 Delivery" };

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatAge(ts) {
  const ms = typeof ts === "string" ? new Date(ts).getTime() : ts;
  const totalMins = Math.floor((Date.now() - ms) / 60000);
  if (totalMins < 1)  return "just now";
  if (totalMins < 60) return `${totalMins}m ago`;
  const hrs  = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs < 24) return mins > 0 ? `${hrs}h ${mins}m ago` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  if (remHrs > 0) return `${days}d ${remHrs}h ago`;
  return `${days}d ago`;
}

const STATUS_MAP = {
  accept: "accepted", decline: "declined",
  start_preparing: "preparing", mark_ready: "ready", complete: "completed",
};

export default function OrderCard({ order, lang = "en", onUpdateStatus }) {
  const [expanded,      setExpanded]      = useState(false);
  const [actioning,     setActioning]     = useState(false);
  const [showDecline,   setShowDecline]   = useState(false);

  // Normalise status to lowercase for STATUS_CONFIG lookup
  const status  = (order.status ?? "pending").toLowerCase();
  const cfg     = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const actions = cfg.actions ?? [];
  const isPending = ["pending", "escalated"].includes(status);

  // Handle both API shape (order.items[]) and legacy shape
  const firstItem   = order.items?.[0];
  const rawTitle    = firstItem?.productTitle ?? order.productTitle ?? {};
  const title       = typeof rawTitle === "object" ? (rawTitle[lang] ?? rawTitle.en ?? "Order") : (rawTitle ?? "Order");
  const productImage= firstItem?.productImage ?? order.productImage ?? "";
  const qty         = firstItem?.quantity ?? order.qty ?? 0;
  const unitPrice   = firstItem?.unitPrice ?? order.unitPrice ?? 0;
  const total       = order.totalAmount ?? order.total ?? 0;
  const buyerName   = order.buyer?.name ?? "Customer";
  const buyerPhone  = order.buyer?.phone ?? "";
  const buyerDistrict = order.buyer?.district ?? "";
  const buyerVillage  = order.buyer?.village ?? "";

  const handleAction = async (actionKey) => {
    if (actionKey === "decline") { setShowDecline(true); return; }
    const newStatus = STATUS_MAP[actionKey];
    if (!newStatus) return;
    setActioning(true);
    await onUpdateStatus(order.id, newStatus);
    setActioning(false);
  };

  const handleDeclineConfirm = async (extra) => {
    setShowDecline(false);
    setActioning(true);
    await onUpdateStatus(order.id, "declined", extra);
    setActioning(false);
  };

  return (
    <>
      <div style={{
        background: C.white,
        borderTop:    `1px solid ${order.status === "escalated" ? "#ef9a9a" : C.line}`,
        borderRight:  `1px solid ${order.status === "escalated" ? "#ef9a9a" : C.line}`,
        borderBottom: `1px solid ${order.status === "escalated" ? "#ef9a9a" : C.line}`,
        borderLeft:   `1px solid ${order.status === "escalated" ? "#ef9a9a" : C.line}`,
        borderRadius: 6,
        overflow: "hidden",
      }}>
        {/* ── Header row (always visible) ── */}
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", cursor: "pointer" }}
          onClick={() => setExpanded((v) => !v)}
        >
          <img
            src={productImage}
            alt={title}
            style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                letterSpacing: "0.06em", textTransform: "uppercase",
                background: cfg.bg, color: cfg.color,
              }}>
                {cfg.label[lang] ?? cfg.label.en}
              </span>
              {isPending && <OrderTimerBadge order={order} />}
            </div>
            <div style={{ fontFamily: F.display, fontSize: 15, color: C.ink, lineHeight: 1.2, marginBottom: 3 }}>
              {title}
            </div>
            <div style={{ fontSize: 12, color: C.inkLight, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span>👤 {buyerName}</span>
              <span>{formatAge(order.placedAt)}</span>
            </div>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: F.display, fontSize: 18, color: C.green }}>
              M {total.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: C.inkLight }}>{qty} units</div>
            <div style={{ fontSize: 14, color: C.inkLight, marginTop: 4 }}>{expanded ? "▲" : "▼"}</div>
          </div>
        </div>

        {/* ── Expanded detail ── */}
        {expanded && (
          <div style={{ borderTop: `1px solid ${C.line}` }}>
            {/* Detail grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", background: C.bg }}>
              {[
                ["Order ID", `#${order.id.slice(-5).toUpperCase()}`],
                ["Placed",    formatTime(order.placedAt)],
                ["Qty",       `${qty} × M ${unitPrice}`],
                ["Total",     `M ${total.toLocaleString()}`],
                ["Payment",   PAYMENT_ICONS[order.paymentMethod ?? order.payment?.method] ?? "—"],
                ["Delivery",  DELIVERY_ICONS[order.deliveryMethod ?? order.delivery?.method] ?? "—"],
                ...(order.acceptedAt  ? [["Accepted",  formatTime(order.acceptedAt)]]  : []),
                ...(order.completedAt ? [["Completed", formatTime(order.completedAt)]] : []),
                ...(order.declineReason ? [["Decline reason", order.declineReason ?? ""]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ padding: "10px 14px", borderRight: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 10, color: C.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Buyer contact */}
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.line}`, background: C.white }}>
              <div style={{ fontSize: 11, color: C.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Buyer</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{buyerName}</div>
                  <div style={{ fontSize: 12, color: C.inkLight }}>📍 {buyerVillage}{buyerVillage ? ", " : ""}{buyerDistrict}</div>
                  {(order.deliveryMethod ?? order.delivery?.method) === "DELIVERY" && (
                    <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>🚚 {order.deliveryAddress ?? order.delivery?.address}</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={`tel:${buyerPhone}`}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: C.green, color: "#fff", borderRadius: 4, fontSize: 12, fontWeight: 500, textDecoration: "none" }}>
                    📞 Call
                  </a>
                  <a href={`https://wa.me/${buyerPhone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "#128C7E", color: "#fff", borderRadius: 4, fontSize: 12, fontWeight: 500, textDecoration: "none" }}>
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div style={{ padding: "10px 16px", background: "#fffde7", borderBottom: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, marginBottom: 4 }}>📝 Buyer note</div>
                <div style={{ fontSize: 13, color: C.inkMid }}>{order.notes}</div>
              </div>
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <div style={{ padding: "12px 16px", display: "flex", gap: 8, flexWrap: "wrap", background: C.white }}>
                {actions.map((actionKey) => {
                  const ac = ACTION_CONFIG[actionKey];
                  const label = ac.label[lang] ?? ac.label.en;
                  const isPrimary = ac.style === "primary";
                  return (
                    <button
                      key={actionKey}
                      disabled={actioning}
                      onClick={(e) => { e.stopPropagation(); handleAction(actionKey); }}
                      style={{
                        padding: "10px 18px",
                        background: isPrimary ? C.green : "none",
                        border: isPrimary ? "none" : `1.5px solid ${C.line}`,
                        color: isPrimary ? "#fff" : C.inkMid,
                        borderRadius: 4, fontSize: 13, fontWeight: 500,
                        cursor: actioning ? "default" : "pointer",
                        fontFamily: F.body, opacity: actioning ? 0.6 : 1,
                      }}
                    >
                      {actioning ? "…" : label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decline reason modal */}
      {showDecline && (
        <DeclineReasonModal
          order={order}
          lang={lang}
          onConfirm={handleDeclineConfirm}
          onCancel={() => setShowDecline(false)}
        />
      )}
    </>
  );
}