// ---------------------------------------------------------------------------
// EscalationBanner.jsx
// Shown at the top of the dashboard when at least one order is escalated.
// Informs the farmer that Khokahano has been notified.
// ---------------------------------------------------------------------------

export default function EscalationBanner({ escalatedOrders, onCallBuyer }) {
  if (!escalatedOrders.length) return null;

  return (
    <>
      <style>{`
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
        .kh-escalation-banner {
          background: #7f1f1f;
          border-bottom: 2px solid #a32d2d;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .kh-esc-pulse {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #ff5252;
          flex-shrink: 0;
          animation: pulse-red 1s ease-in-out infinite;
        }
      `}</style>

      <div className="kh-escalation-banner">
        <div className="kh-esc-pulse" />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
            🚨 {escalatedOrders.length} overdue order{escalatedOrders.length > 1 ? "s" : ""} — Khokahano has been notified
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            These orders have exceeded the 10-minute response window. Khokahano staff will follow up.
            Please accept or decline as soon as possible.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {escalatedOrders.map((o) => (
            <a
              key={o.id}
              href={`tel:${o.buyer.phone}`}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", background: "#ff5252",
                borderRadius: 4, color: "#fff",
                fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}
            >
              📞 Call {o.buyer.name.split(" ")[0]}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}