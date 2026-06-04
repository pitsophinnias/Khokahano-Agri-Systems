// ---------------------------------------------------------------------------
// StatsBar.jsx
// Summary strip at the top of the farmer dashboard.
// ---------------------------------------------------------------------------

const C = {
  green:    "#1c4a1c",
  greenMid: "#2a6b2a",
  white:    "#ffffff",
  line:     "#e2e0da",
  ink:      "#1a1a18",
  inkLight: "#8a8a80",
  bg:       "#f7f6f3",
};

export default function StatsBar({ stats }) {
  const items = [
    { label: "Pending",   value: stats.pending,   alert: stats.pending > 0,  icon: "🕐" },
    { label: "Active",    value: stats.active,    alert: false,               icon: "⚙️" },
    { label: "Completed", value: stats.completed, alert: false,               icon: "✅" },
    { label: "Revenue",   value: `M ${stats.todayRevenue.toLocaleString()}`, alert: false, icon: "💰" },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      borderBottom: `1px solid ${C.line}`,
      background: C.white,
    }}>
      {items.map((item, i) => (
        <div
          key={item.label}
          style={{
            padding: "14px 12px",
            textAlign: "center",
            borderRight: i < items.length - 1 ? `1px solid ${C.line}` : "none",
            background: item.alert ? "#fff8e1" : C.white,
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
          <div style={{
            fontSize: "clamp(16px, 4vw, 22px)",
            fontWeight: 700,
            color: item.alert ? "#7f5500" : C.green,
            lineHeight: 1,
            marginBottom: 3,
          }}>
            {item.value}
          </div>
          <div style={{
            fontSize: "clamp(9px, 2vw, 11px)",
            color: C.inkLight,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}