// ---------------------------------------------------------------------------
// OrderHistoryPage.jsx
// Farmer's full order history with analytics:
//   - Revenue over time
//   - Top buyers
//   - District breakdown
//   - Decline reasons
//   - Sectioned list: completed / pending / declined
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { STATUS } from "../constants/orderStatuses.js";

const C = {
  green:    "#1c4a1c",
  greenMid: "#2a6b2a",
  greenLight:"#e8f0e8",
  gold:     "#b8860b",
  goldLight:"#fff8e1",
  ink:      "#1a1a18",
  inkMid:   "#4a4a44",
  inkLight: "#8a8a80",
  line:     "#e2e0da",
  bg:       "#f7f6f3",
  white:    "#ffffff",
  red:      "#a32d2d",
  redLight: "#ffebee",
};
const F = {
  display: "'Instrument Serif', Georgia, serif",
  body:    "'Geist', system-ui, sans-serif",
};

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

// ── Stat card ────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, highlight }) {
  return (
    <div style={{
      background: highlight ? C.green : C.white,
      padding: "18px 16px",
      borderRight: `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`,
    }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{
        fontFamily: F.display, fontSize: "clamp(18px,4vw,26px)",
        color: highlight ? "#fff" : C.ink, lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: highlight ? "rgba(255,255,255,0.65)" : C.inkLight, marginTop: 4 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 11, color: highlight ? "rgba(255,255,255,0.5)" : C.inkLight, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Mini bar chart ───────────────────────────────────────────
function BarChart({ data, colorFn, labelKey, valueKey, title }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkLight, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 12, color: C.inkMid, width: 110, flexShrink: 0, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item[labelKey]}
            </div>
            <div style={{ flex: 1, background: C.bg, borderRadius: 2, overflow: "hidden", height: 18 }}>
              <div style={{
                width: `${(item[valueKey] / max) * 100}%`,
                height: "100%",
                background: colorFn ? colorFn(i) : C.green,
                borderRadius: 2,
                minWidth: item[valueKey] > 0 ? 4 : 0,
                transition: "width 0.6s ease",
              }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, width: 60, flexShrink: 0 }}>
              {item[valueKey]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Order row (compact, in history list) ─────────────────────
function HistoryRow({ order, lang }) {
  const [expanded, setExpanded] = useState(false);
  const title = typeof order.productTitle === "object" ? order.productTitle[lang] : order.productTitle;
  const statusColors = {
    completed: { color: C.green,    bg: C.greenLight },
    declined:  { color: C.red,      bg: C.redLight   },
    pending:   { color: C.gold,     bg: C.goldLight  },
    escalated: { color: C.red,      bg: C.redLight   },
    accepted:  { color: C.green,    bg: C.greenLight },
    preparing: { color: "#1a4fa0",  bg: "#e3f2fd"    },
    ready:     { color: "#2e7d32",  bg: "#e8f5e9"    },
  };
  const sc = statusColors[order.status] ?? statusColors.pending;

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.line}`,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 6,
    }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <img src={order.productImage} alt={title}
          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ fontSize: 11, color: C.inkLight }}>{order.buyer.name} · {formatDate(order.placedAt)}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.green }}>M {order.total.toLocaleString()}</div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.06em", background: sc.bg, color: sc.color }}>
            {order.status}
          </span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 14px 12px", borderTop: `1px solid ${C.bg}`, background: C.bg }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 10 }}>
            {[
              ["Buyer",    order.buyer.name],
              ["District", order.buyer.district],
              ["Qty",      `${order.qty} × M ${order.unitPrice}`],
              ["Payment",  order.payment?.method ?? "—"],
              ["Delivery", order.delivery?.method ?? "—"],
              ...(order.declineReason ? [["Decline reason", order.declineReason]] : []),
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: C.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.ink }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function OrderHistoryPage({ orders, lang = "en", onBack }) {
  const navigate = useNavigate();
  const [section, setSection] = useState("all");

  const analytics = useMemo(() => {
    const completed = orders.filter((o) => o.status === STATUS.COMPLETED);
    const declined  = orders.filter((o) => o.status === STATUS.DECLINED);

    // Revenue
    const totalRevenue = completed.reduce((s, o) => s + o.total, 0);
    const avgOrder     = completed.length ? Math.round(totalRevenue / completed.length) : 0;

    // Top buyers
    const buyerMap = {};
    completed.forEach((o) => {
      const k = o.buyer.name;
      if (!buyerMap[k]) buyerMap[k] = { name: k, count: 0, revenue: 0, district: o.buyer.district };
      buyerMap[k].count++;
      buyerMap[k].revenue += o.total;
    });
    const topBuyers = Object.values(buyerMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // District breakdown
    const distMap = {};
    completed.forEach((o) => {
      const k = o.buyer.district;
      distMap[k] = (distMap[k] || 0) + 1;
    });
    const byDistrict = Object.entries(distMap)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count);

    // Decline reasons
    const reasonMap = {};
    declined.forEach((o) => {
      const k = o.declineReason ?? "Not specified";
      reasonMap[k] = (reasonMap[k] || 0) + 1;
    });
    const declineReasons = Object.entries(reasonMap)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    // Fulfillment rate
    const total = orders.filter((o) => [STATUS.COMPLETED, STATUS.DECLINED].includes(o.status)).length;
    const fulfillRate = total ? Math.round((completed.length / total) * 100) : 100;

    return { totalRevenue, avgOrder, topBuyers, byDistrict, declineReasons, fulfillRate, completedCount: completed.length, declinedCount: declined.length };
  }, [orders]);

  const SECTIONS = [
    { key: "all",       label: "All",       statuses: Object.values(STATUS) },
    { key: "completed", label: "Completed", statuses: [STATUS.COMPLETED] },
    { key: "pending",   label: "Pending",   statuses: [STATUS.PENDING, STATUS.ESCALATED, STATUS.ACCEPTED, STATUS.PREPARING, STATUS.READY] },
    { key: "declined",  label: "Declined",  statuses: [STATUS.DECLINED] },
  ];

  const visible = orders.filter((o) =>
    SECTIONS.find((s) => s.key === section)?.statuses.includes(o.status)
  ).sort((a, b) => b.placedAt - a.placedAt);

  const BAR_COLORS = ["#1c4a1c","#2a6b2a","#3d8b3d","#52a852","#6bc06b"];

  return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh", color: C.ink, WebkitFontSmoothing: "antialiased" }}>
      {/* Top bar */}
      <div style={{
        background: C.green, padding: "0 16px", height: 52,
        display: "flex", alignItems: "center", gap: 10,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <button onClick={onBack ?? (() => navigate("/farmer"))} style={{
            background: "rgba(255,255,255,0.12)", border: "none",
            color: "#fff", width: 32, height: 32, borderRadius: 4,
            cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>←</button>
        <div style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>Order History & Analytics</div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px" }}>
        {/* ── Summary stats ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
          background: C.line, border: `1px solid ${C.line}`,
          marginBottom: 20,
        }}>
          <StatCard icon="💰" label="Total revenue"     value={`M ${analytics.totalRevenue.toLocaleString()}`} highlight />
          <StatCard icon="✅" label="Completed orders"  value={analytics.completedCount} />
          <StatCard icon="📊" label="Avg order value"   value={`M ${analytics.avgOrder}`} />
          <StatCard icon="🎯" label="Fulfillment rate"  value={`${analytics.fulfillRate}%`} sub={`${analytics.declinedCount} declined`} />
        </div>

        {/* ── Analytics row ── */}
        {(analytics.topBuyers.length > 0 || analytics.byDistrict.length > 0) && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12, marginBottom: 20,
          }}>
            {analytics.topBuyers.length > 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 6, padding: 16 }}>
                <BarChart
                  title="Top buyers (revenue)"
                  data={analytics.topBuyers}
                  labelKey="name"
                  valueKey="revenue"
                  colorFn={(i) => BAR_COLORS[i % BAR_COLORS.length]}
                />
              </div>
            )}
            {analytics.byDistrict.length > 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 6, padding: 16 }}>
                <BarChart
                  title="Orders by district"
                  data={analytics.byDistrict}
                  labelKey="district"
                  valueKey="count"
                  colorFn={(i) => BAR_COLORS[i % BAR_COLORS.length]}
                />
              </div>
            )}
            {analytics.declineReasons.length > 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 6, padding: 16 }}>
                <BarChart
                  title="Decline reasons"
                  data={analytics.declineReasons}
                  labelKey="reason"
                  valueKey="count"
                  colorFn={() => "#a32d2d"}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Order list ── */}
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 6, overflow: "hidden" }}>
          {/* Section tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.line}` }}>
            {SECTIONS.map((s) => {
              const count = orders.filter((o) => s.statuses.includes(o.status)).length;
              const isActive = section === s.key;
              return (
                <button key={s.key} onClick={() => setSection(s.key)} style={{
                  flex: 1, padding: "10px 6px",
                  background: "none", border: "none",
                  borderBottom: isActive ? `2px solid ${C.green}` : "2px solid transparent",
                  color: isActive ? C.green : C.inkLight,
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "clamp(11px,3vw,13px)",
                  cursor: "pointer", fontFamily: F.body,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}>
                  {s.label}
                  {count > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10,
                      background: isActive ? C.green : C.line,
                      color: isActive ? "#fff" : C.inkLight,
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ padding: 12 }}>
            {visible.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: C.inkLight }}>
                No orders in this category yet.
              </div>
            ) : (
              visible.map((o) => <HistoryRow key={o.id} order={o} lang={lang} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}