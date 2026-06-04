// ---------------------------------------------------------------------------
// OrderTimerBadge.jsx
// Shows a live countdown for pending orders.
// Turns red in the last 2 minutes. Shows "OVERDUE" when time is up.
// ---------------------------------------------------------------------------

import { useOrderTimer } from "../hooks/useOrderTimer.js";

export default function OrderTimerBadge({ order }) {
  const timer = useOrderTimer(order);
  if (!timer) return null;

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
      fontVariantNumeric: "tabular-nums",
      background: timer.overdue
        ? "#ffebee"
        : timer.urgent
        ? "#fff3e0"
        : "#fff8e1",
      color: timer.overdue
        ? "#c62828"
        : timer.urgent
        ? "#e65100"
        : "#7f5500",
      border: `1px solid ${timer.overdue ? "#ef9a9a" : timer.urgent ? "#ffcc02" : "#f5c518"}`,
      animation: timer.urgent && !timer.overdue ? "timerPulse 1s ease-in-out infinite" : "none",
    }}>
      <style>{`
        @keyframes timerPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>
      {timer.overdue ? "⏰ OVERDUE" : `⏱ ${timer.display}`}
    </div>
  );
}