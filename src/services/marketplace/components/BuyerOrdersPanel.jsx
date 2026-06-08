// ---------------------------------------------------------------------------
// BuyerOrdersPanel.jsx
// Slide-in panel (from right, like the cart) showing the buyer's orders
// and their current status. Polls for updates every 3 seconds.
// ---------------------------------------------------------------------------

const C = {
  green:    "#1c4a1c",
  greenLight:"#e8f0e8",
  ink:      "#1a1a18",
  inkMid:   "#4a4a44",
  inkLight: "#8a8a80",
  line:     "#e2e0da",
  bg:       "#f7f6f3",
  white:    "#ffffff",
  red:      "#a32d2d",
  redLight: "#ffebee",
  gold:     "#b8860b",
  goldLight:"#fff8e1",
};
const F = {
  display: "'Instrument Serif', Georgia, serif",
  body:    "'Geist', system-ui, sans-serif",
};

const STATUS_INFO = {
  pending:   { label: "Order received",   icon: "🕐", color: C.gold,    bg: C.goldLight  },
  escalated: { label: "Awaiting farmer",  icon: "⏰", color: C.red,     bg: C.redLight   },
  accepted:  { label: "Accepted",         icon: "✅", color: C.green,   bg: C.greenLight },
  preparing: { label: "Being prepared",   icon: "⚙️", color: "#1a4fa0", bg: "#e3f2fd"    },
  ready:     { label: "Ready",            icon: "📦", color: "#2e7d32", bg: "#e8f5e9"    },
  completed: { label: "Completed",        icon: "🎉", color: C.green,   bg: C.greenLight },
  declined:  { label: "Declined",         icon: "❌", color: C.red,     bg: C.redLight   },
};

// Simple step progress bar
const STEPS = ["pending", "accepted", "preparing", "ready", "completed"];

function ProgressBar({ status }) {
  if (status === "declined") {
    return (
      <div style={{ padding: "8px 0", fontSize: 12, color: C.red }}>
        This order was declined by the farmer.
      </div>
    );
  }
  const currentIdx = STEPS.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 10 }}>
      {STEPS.map((step, i) => {
        const done    = i <  currentIdx;
        const current = i === currentIdx;
        const info    = STATUS_INFO[step] ?? {};
        return (
          <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              {i > 0 && (
                <div style={{
                  flex: 1, height: 2,
                  background: done || current ? C.green : C.line,
                }} />
              )}
              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                background: done ? C.green : current ? C.green : C.line,
                border: `2px solid ${done || current ? C.green : C.line}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: done || current ? "#fff" : C.inkLight,
                fontWeight: 700,
              }}>
                {done ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2,
                  background: done ? C.green : C.line,
                }} />
              )}
            </div>
            <div style={{
              fontSize: 9, color: current ? C.green : C.inkLight,
              fontWeight: current ? 600 : 400, marginTop: 4,
              textAlign: "center", textTransform: "capitalize",
            }}>
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderItem({ order, lang = "en" }) {
  const title  = typeof order.productTitle === "object" ? order.productTitle[lang] : order.productTitle;
  const info   = STATUS_INFO[order.status] ?? STATUS_INFO.pending;

  return (
    <div style={{
      border: `1px solid ${C.line}`,
      borderRadius: 6, marginBottom: 10,
      background: C.white, overflow: "hidden",
    }}>
      <div style={{ display: "flex", gap: 10, padding: "12px 14px" }}>
        <img
          src={order.productImage}
          alt={title}
          style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 3, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{info.icon}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: info.color,
              background: info.bg, padding: "1px 8px", borderRadius: 10,
            }}>
              {info.label}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.green }}>M {order.total?.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: C.inkLight }}>{order.qty} units</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: "0 14px 12px" }}>
        <ProgressBar status={order.status} />
        {order.status === "declined" && order.declineReason && (
          <div style={{ fontSize: 12, color: C.red, marginTop: 6 }}>
            Reason: {order.declineReason}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuyerOrdersPanel({ orders, lang, onClose, onClearCompleted }) {
  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .kh-orders-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(380px, 100vw);
          background: ${C.bg};
          z-index: 400;
          display: flex; flex-direction: column;
          box-shadow: -4px 0 24px rgba(0,0,0,0.12);
          animation: slideInRight 0.25s ease;
        }
        .kh-orders-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 399;
        }
      `}</style>

      <div className="kh-orders-overlay" onClick={onClose} />

      <div className="kh-orders-drawer">
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: `1px solid ${C.line}`,
          background: C.white, flexShrink: 0,
        }}>
          <div style={{ fontFamily: F.display, fontSize: 18, color: C.ink }}>My Orders</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {orders.some((o) => ["completed","declined"].includes(o.status)) && (
              <button onClick={onClearCompleted} style={{
                background: "none", border: `1px solid ${C.line}`,
                borderRadius: 4, padding: "5px 10px", fontSize: 11,
                color: C.inkLight, cursor: "pointer", fontFamily: F.body,
              }}>
                Clear done
              </button>
            )}
            <button onClick={onClose} style={{
              width: 30, height: 30, border: `1px solid ${C.line}`,
              borderRadius: 4, background: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.inkMid, fontSize: 15,
            }}>✕</button>
          </div>
        </div>

        {/* Order list */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {orders.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>📭</div>
              <div style={{ fontFamily: F.display, fontSize: 18, color: C.ink, marginBottom: 8 }}>No orders yet</div>
              <div style={{ fontSize: 13, color: C.inkLight }}>Your orders will appear here after checkout.</div>
            </div>
          ) : (
            orders.map((o) => <OrderItem key={o.id} order={o} lang={lang} />)
          )}
        </div>

        {/* Polling indicator */}
        <div style={{
          padding: "8px 16px", borderTop: `1px solid ${C.line}`,
          background: C.white, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#43a047",
            animation: "pulse-green 2s ease-in-out infinite",
          }} />
          <span style={{ fontSize: 11, color: C.inkLight }}>Checking for updates every few seconds</span>
        </div>
        <style>{`@keyframes pulse-green { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    </>
  );
}