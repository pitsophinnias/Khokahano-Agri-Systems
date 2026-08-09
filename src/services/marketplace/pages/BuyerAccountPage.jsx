// ---------------------------------------------------------------------------
// BuyerAccountPage.jsx
// Full order history for the logged-in buyer.
// Route:  /account  (BuyerRoute protected)
// Module: src/services/marketplace/pages/BuyerAccountPage.jsx
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from "react";
import { useNavigate }                       from "react-router-dom";
import { useAuthContext }                    from "../../auth/AuthContext.jsx";
import { THEME }                             from "../constants/theme.js";
import { fetchMyOrdersAsBuyer }              from "../api/marketplace.api.js";

const C = THEME.colors;
const F = THEME.fonts;

const STATUS_META = {
  PENDING:   { label: "Pending",   colour: "#b8860b", icon: "⏳" },
  ACCEPTED:  { label: "Accepted",  colour: "#1c4a1c", icon: "✅" },
  PREPARING: { label: "Preparing", colour: "#2a6b2a", icon: "⚙️" },
  READY:     { label: "Ready",     colour: "#3d8b3d", icon: "📦" },
  COMPLETED: { label: "Completed", colour: "#1c4a1c", icon: "✓"  },
  DECLINED:  { label: "Declined",  colour: "#a32d2d", icon: "✗"  },
  ESCALATED: { label: "Escalated", colour: "#c0392b", icon: "🚨" },
};

const FILTER_TABS = [
  { key: "ALL",       label: "All"       },
  { key: "ACTIVE",    label: "Active"    },
  { key: "COMPLETED", label: "Completed" },
  { key: "DECLINED",  label: "Declined"  },
];

const ACTIVE_STATUSES = ["PENDING","ACCEPTED","PREPARING","READY","ESCALATED"];

function statusGroup(status) {
  if (ACTIVE_STATUSES.includes(status))  return "ACTIVE";
  if (status === "COMPLETED")            return "COMPLETED";
  if (status === "DECLINED")             return "DECLINED";
  return "ALL";
}

// ── Sub-components ────────────────────────────────────────────

function TopBar({ user, onBack }) {
  return (
    <div style={{
      background: C.green, padding: "0 16px", height: 52,
      display: "flex", alignItems: "center", gap: 10,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <button onClick={onBack} style={{
        background: "rgba(255,255,255,0.12)", border: "none",
        color: "#fff", width: 32, height: 32, borderRadius: 4,
        cursor: "pointer", fontSize: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>←</button>
      <div>
        <div style={{ fontFamily: F.display, fontSize: 16, color: "#fff", lineHeight: 1 }}>My Orders</div>
        {user && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>
            {user.firstName} {user.lastName}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, colour: C.inkLight, icon: "" };
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20,
      background: meta.colour, color: "#fff",
      fontSize: 11, fontWeight: 600, fontFamily: F.body,
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {meta.icon} {meta.label}
    </span>
  );
}

// Progress bar: Pending → Accepted → Preparing → Ready → Completed
const PROGRESS_STEPS = ["PENDING","ACCEPTED","PREPARING","READY","COMPLETED"];

function ProgressBar({ status }) {
  if (["DECLINED","ESCALATED"].includes(status)) {
    return (
      <div style={{ fontSize: 12, color: STATUS_META[status]?.colour, fontFamily: F.body, marginBottom: 12 }}>
        {STATUS_META[status]?.icon} Order {STATUS_META[status]?.label.toLowerCase()}
      </div>
    );
  }
  const currentIdx = PROGRESS_STEPS.indexOf(status);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {PROGRESS_STEPS.map((step, i) => {
          const done   = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step} style={{ display: "flex", alignItems: "center", flex: i < PROGRESS_STEPS.length - 1 ? 1 : 0 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                background: done ? C.green : C.line,
                borderTop:    `2px solid ${done ? C.green : C.line}`,
                borderRight:  `2px solid ${done ? C.green : C.line}`,
                borderBottom: `2px solid ${done ? C.green : C.line}`,
                borderLeft:   `2px solid ${done ? C.green : C.line}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: done ? "#fff" : C.inkLight,
                fontWeight: 700,
                boxShadow: active ? `0 0 0 3px rgba(28,74,28,0.2)` : "none",
              }}>
                {done ? "✓" : ""}
              </div>
              {i < PROGRESS_STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2,
                  background: i < currentIdx ? C.green : C.line,
                }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {PROGRESS_STEPS.map((step) => (
          <div key={step} style={{
            fontSize: 9, color: PROGRESS_STEPS.indexOf(step) <= currentIdx ? C.green : C.inkLight,
            fontFamily: F.body, textAlign: "center",
            width: 20, overflow: "visible", whiteSpace: "nowrap",
            transform: "translateX(-50%)", marginLeft: 10,
          }}>
            {step.charAt(0) + step.slice(1).toLowerCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const meta    = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const items   = order.items ?? [];
  const placed  = new Date(order.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const farmerName = order.farmer?.user
    ? `${order.farmer.user.firstName} ${order.farmer.user.lastName}`
    : "Farmer";

  return (
    <div style={{
      background: C.white,
      borderTop:    `1px solid ${C.line}`,
      borderRight:  `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`,
      borderLeft:   `1px solid ${C.line}`,
      borderRadius: 6, overflow: "hidden",
    }}>
      {/* Summary row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: "100%", padding: "14px 16px",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: F.body, textAlign: "left",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 12,
          borderBottom: expanded ? `1px solid ${C.line}` : "none",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.inkLight, letterSpacing: "0.05em" }}>
              #{order.id.slice(-6).toUpperCase()}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div style={{ fontSize: 13, color: C.inkMid }}>
            {farmerName} · {placed}
          </div>
          <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>
            {items.map((it) => {
              const title = typeof it.product?.title === "object" ? it.product.title.en : (it.product?.title ?? "Product");
              return `${title} ×${it.quantity}`;
            }).join(", ")}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: F.display, fontSize: 17, color: C.ink }}>
            M {order.totalAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>
            {expanded ? "▲" : "▼"}
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "16px 16px 20px" }}>
          <ProgressBar status={order.status} />

          {/* Items breakdown */}
          <div style={{
            borderTop:    `1px solid ${C.line}`,
            borderRight:  `1px solid ${C.line}`,
            borderBottom: `1px solid ${C.line}`,
            borderLeft:   `1px solid ${C.line}`,
            borderRadius: 4, overflow: "hidden", marginBottom: 14,
          }}>
            {items.map((item, i) => {
              const title = typeof item.product?.title === "object" ? item.product.title.en : (item.product?.title ?? "Product");
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: i < items.length - 1 ? `1px solid ${C.line}` : "none",
                  fontSize: 13, fontFamily: F.body,
                }}>
                  <span style={{ color: C.ink }}>{title} <span style={{ color: C.inkLight }}>×{item.quantity}</span></span>
                  <span style={{ fontWeight: 500, color: C.ink }}>M {item.subtotal?.toLocaleString() ?? (item.unitPrice * item.quantity).toLocaleString()}</span>
                </div>
              );
            })}
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 14px", background: C.bg,
              fontSize: 13, fontWeight: 600, fontFamily: F.body,
            }}>
              <span style={{ color: C.ink }}>Total</span>
              <span style={{ color: C.green }}>M {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery & payment */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Delivery",       value: order.deliveryMethod  },
              { label: "Payment",        value: order.paymentMethod   },
              { label: "Delivery to",    value: order.deliveryAddress },
              { label: "Contact",        value: order.deliveryPhone   },
            ].filter((r) => r.value).map(({ label, value }) => (
              <div key={label} style={{ fontSize: 12, fontFamily: F.body }}>
                <div style={{ color: C.inkLight, marginBottom: 2 }}>{label}</div>
                <div style={{ color: C.ink, textTransform: label === "Delivery" || label === "Payment" ? "capitalize" : "none" }}>
                  {value.toLowerCase().replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>

          {/* Decline reason if applicable */}
          {order.status === "DECLINED" && order.declineReason && (
            <div style={{
              padding: "10px 14px",
              background: "rgba(163,45,45,0.06)",
              borderTop:    `1px solid rgba(163,45,45,0.2)`,
              borderRight:  `1px solid rgba(163,45,45,0.2)`,
              borderBottom: `1px solid rgba(163,45,45,0.2)`,
              borderLeft:   `3px solid #a32d2d`,
              borderRadius: 4,
              fontSize: 13, color: "#a32d2d", fontFamily: F.body,
            }}>
              Declined: {order.declineReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function BuyerAccountPage() {
  const navigate        = useNavigate();
  const { user }        = useAuthContext();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("ALL");

  useEffect(() => {
    fetchMyOrdersAsBuyer()
      .then((data) => {
        // API returns { orders } or array directly
        setOrders(Array.isArray(data) ? data : (data.orders ?? []));
      })
      .catch((err) => setError(err.message ?? "Could not load orders"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (filter === "ALL")    return true;
    if (filter === "ACTIVE") return ACTIVE_STATUSES.includes(o.status);
    return statusGroup(o.status) === filter;
  });

  const counts = {
    ALL:       orders.length,
    ACTIVE:    orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    COMPLETED: orders.filter((o) => o.status === "COMPLETED").length,
    DECLINED:  orders.filter((o) => o.status === "DECLINED").length,
  };

  return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh", color: C.ink, WebkitFontSmoothing: "antialiased" }}>
      <TopBar user={user} onBack={() => navigate("/")} />

      {/* Buyer info strip */}
      {user && (
        <div style={{
          background: C.white, padding: "14px 16px",
          borderBottom: `1px solid ${C.line}`,
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: C.ink }}>{user.firstName} {user.lastName}</div>
              <div style={{ fontSize: 12, color: C.inkLight }}>{user.email} · {user.district}</div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink }}>{counts.ALL}</div>
                <div style={{ fontSize: 11, color: C.inkLight }}>Orders</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink }}>{counts.COMPLETED}</div>
                <div style={{ fontSize: 11, color: C.inkLight }}>Completed</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: F.display, fontSize: 20, color: C.green }}>{counts.ACTIVE}</div>
                <div style={{ fontSize: 11, color: C.inkLight }}>Active</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, display: "flex" }}>
        {FILTER_TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            flex: 1, padding: "10px 4px", background: "none", border: "none",
            borderBottom: filter === key ? `2px solid ${C.green}` : "2px solid transparent",
            color: filter === key ? C.green : C.inkLight,
            fontWeight: filter === key ? 600 : 400,
            fontSize: "clamp(11px,3vw,13px)", cursor: "pointer", fontFamily: F.body,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            {label}
            {counts[key] > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: filter === key ? C.green : C.line,
                color: filter === key ? "#fff" : C.inkLight,
                padding: "1px 6px", borderRadius: 10,
              }}>{counts[key]}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 60px" }}>
        {loading && <div style={{ padding: "60px 20px", textAlign: "center", color: C.inkLight }}>Loading orders…</div>}
        {error   && <div style={{ padding: "40px 20px", textAlign: "center", color: "#a32d2d" }}>{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>📭</div>
            <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink, marginBottom: 8 }}>
              {filter === "ALL" ? "No orders yet" : `No ${filter.toLowerCase()} orders`}
            </div>
            {filter === "ALL" && (
              <button
                onClick={() => navigate("/")}
                style={{
                  padding: "10px 24px", background: C.green, color: "#fff",
                  border: "none", borderRadius: 4,
                  fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: F.body,
                }}
              >
                Browse the marketplace
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}