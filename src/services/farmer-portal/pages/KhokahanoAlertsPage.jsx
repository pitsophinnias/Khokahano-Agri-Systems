// ---------------------------------------------------------------------------
// KhokahanoAlertsPage.jsx
// Internal page for Khokahano staff to monitor escalated orders.
// Shows all orders where farmers didn't respond within 10 minutes.
// Allows staff to call the farmer and log that they've followed up.
// ---------------------------------------------------------------------------

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const C = {
  green:    "#1c4a1c",
  ink:      "#1a1a18",
  inkMid:   "#4a4a44",
  inkLight: "#8a8a80",
  line:     "#e2e0da",
  bg:       "#f7f6f3",
  white:    "#ffffff",
  red:      "#7f1f1f",
  redMid:   "#a32d2d",
  redLight: "#ffebee",
};
const F = {
  display: "'Instrument Serif', Georgia, serif",
  body:    "'Geist', system-ui, sans-serif",
};

function formatDateTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString([], {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeSince(ts) {
  const totalMins = Math.floor((Date.now() - ts) / 60000);
  if (totalMins < 1)  return "just now";
  if (totalMins < 60) return `${totalMins} minute${totalMins === 1 ? "" : "s"} ago`;
  const hrs  = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs < 24) {
    return mins > 0 ? `${hrs}h ${mins}m ago` : `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  }
  const days   = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  if (remHrs > 0) return `${days} day${days === 1 ? "" : "s"} & ${remHrs} hour${remHrs === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function AlertRow({ alert, onFollowUp }) {
  const [followed, setFollowed] = useState(!!alert.followedUpAt);
  const [note, setNote]         = useState(alert.followUpNote ?? "");
  const [editing, setEditing]   = useState(false);
  const title = typeof alert.productTitle === "object" ? alert.productTitle.en : alert.productTitle;
  const overdueLabel = timeSince(alert.escalatedAt ?? alert.placedAt);
  const overdueMins  = Math.floor((Date.now() - (alert.escalatedAt ?? alert.placedAt)) / 60000);

  const handleFollowUp = () => {
    onFollowUp(alert.id, note);
    setFollowed(true);
    setEditing(false);
  };

  return (
    <div style={{
      background: followed ? C.white : "#fff5f5",
      border: `1px solid ${followed ? C.line : "#f5c6c6"}`,

      borderRadius: 6, marginBottom: 8, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: followed ? C.green : C.redMid,
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>
          {followed ? "✓" : "!"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            {!followed && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                background: C.redMid, color: "#fff",
                textTransform: "uppercase", letterSpacing: "0.08em",
                animation: "pulse-alert 1.5s ease-in-out infinite",
              }}>
                NEEDS FOLLOW-UP
              </span>
            )}
            {followed && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                background: "#e8f5e9", color: "#2e7d32",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                FOLLOWED UP
              </span>
            )}
          </div>

          <div style={{ fontFamily: F.display, fontSize: 15, color: C.ink, marginBottom: 4 }}>
            {alert.farmer?.name ?? "Unknown farmer"} — {title}
          </div>

          <div style={{ fontSize: 12, color: C.inkLight, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span>📦 {alert.qty} units · M {alert.total?.toLocaleString()}</span>
            <span>👤 Buyer: {alert.buyer?.name}</span>
            <span>⏱ Escalated {overdueLabel}</span>
          </div>

          <div style={{ fontSize: 12, color: C.inkLight, marginTop: 3 }}>
            Placed: {formatDateTime(alert.placedAt)} · Escalated: {formatDateTime(alert.escalatedAt ?? alert.placedAt)}
          </div>
        </div>

        {/* Urgency */}
        {!followed && (
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: overdueMins > 20 ? C.redMid : C.inkMid,
            textAlign: "right", flexShrink: 0,
          }}>
            {overdueLabel}
          </div>
        )}
      </div>

      {/* Action area */}
      <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Call buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a
            href={`tel:${alert.farmer?.phone}`}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", background: C.green, color: "#fff",
              borderRadius: 4, fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}
          >
            📞 Call farmer — {alert.farmer?.phone}
          </a>
          <a
            href={`tel:${alert.buyer?.phone}`}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", background: "#1a4fa0", color: "#fff",
              borderRadius: 4, fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}
          >
            📞 Call buyer — {alert.buyer?.phone}
          </a>
        </div>

        {/* Follow-up note */}
        {!followed && (
          <>
            {editing ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note what happened (called, farmer confirmed, etc.)"
                  style={{
                    flex: 1, padding: "8px 10px",
                    border: `1px solid ${C.line}`, borderRadius: 4,
                    fontFamily: F.body, fontSize: 13,
                  }}
                />
                <button
                  onClick={handleFollowUp}
                  style={{
                    padding: "8px 14px", background: C.green, color: "#fff",
                    border: "none", borderRadius: 4, fontSize: 12,
                    fontWeight: 600, cursor: "pointer", fontFamily: F.body,
                    whiteSpace: "nowrap",
                  }}
                >
                  Mark resolved
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: "8px 14px", background: "none",
                  border: `1px solid ${C.line}`, borderRadius: 4,
                  fontSize: 12, cursor: "pointer", fontFamily: F.body,
                  color: C.inkMid, alignSelf: "flex-start",
                }}
              >
                + Log follow-up
              </button>
            )}
          </>
        )}

        {/* Show follow-up note if resolved */}
        {followed && alert.followUpNote && (
          <div style={{ fontSize: 12, color: C.inkLight, fontStyle: "italic" }}>
            Note: {alert.followUpNote}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KhokahanoAlertsPage({ onBack }) {
  const navigate = useNavigate();
  const [alerts,  setAlerts]  = useState([]);
  const [filter,  setFilter]  = useState("all"); // "all" | "open" | "resolved"

  // Load from localStorage (written by useOrders escalation handler)
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("kh_escalation_log") || "[]");
      // Attach mock farmer data (real version comes from backend join)
      const enriched = raw.map((a) => ({
        ...a,
        farmer: a.farmer ?? {
          name:  "Nthabiseng Mokoena",
          phone: "+26658123456",
          id:    "farmer_001",
        },
      }));
      setAlerts(enriched);
    } catch {}
  }, []);

  const handleFollowUp = (alertId, note) => {
    setAlerts((prev) => {
      const next = prev.map((a) =>
        a.id === alertId ? { ...a, followedUpAt: Date.now(), followUpNote: note } : a
      );
      localStorage.setItem("kh_escalation_log", JSON.stringify(next));
      return next;
    });
  };

  const filtered = alerts.filter((a) => {
    if (filter === "open")     return !a.followedUpAt;
    if (filter === "resolved") return !!a.followedUpAt;
    return true;
  });

  const openCount     = alerts.filter((a) => !a.followedUpAt).length;
  const resolvedCount = alerts.filter((a) => !!a.followedUpAt).length;

  return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh", color: C.ink, WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @keyframes pulse-alert {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{
        background: C.red, padding: "0 16px", height: 52,
        display: "flex", alignItems: "center", gap: 10,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <button onClick={onBack ?? (() => navigate("/farmer"))} style={{
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", width: 32, height: 32, borderRadius: 4,
            cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.display, fontSize: 15, color: "#fff" }}>
            🚨 Farmer Response Alerts
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>Khokahano Operations Centre</div>
        </div>
        {openCount > 0 && (
          <div style={{
            background: "#ff5252", color: "#fff",
            fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
          }}>
            {openCount} open
          </div>
        )}
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: C.white, borderBottom: `1px solid ${C.line}` }}>
        {[
          { label: "Total alerts",  value: alerts.length,  color: C.ink    },
          { label: "Open",          value: openCount,       color: C.redMid },
          { label: "Resolved",      value: resolvedCount,   color: C.green  },
        ].map((s, i) => (
          <div key={i} style={{ padding: "14px 12px", textAlign: "center", borderRight: i < 2 ? `1px solid ${C.line}` : "none" }}>
            <div style={{ fontFamily: F.display, fontSize: 22, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.inkLight, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", background: C.white, borderBottom: `1px solid ${C.line}` }}>
        {[["all","All"], ["open","Open"], ["resolved","Resolved"]].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            flex: 1, padding: "10px 0", background: "none", border: "none",
            borderBottom: filter === key ? `2px solid ${C.redMid}` : "2px solid transparent",
            color: filter === key ? C.redMid : C.inkLight,
            fontWeight: filter === key ? 600 : 400,
            fontSize: 13, cursor: "pointer", fontFamily: F.body,
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>{filter === "resolved" ? "✅" : "🎉"}</div>
            <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink, marginBottom: 8 }}>
              {filter === "open" ? "No open alerts" : filter === "resolved" ? "No resolved alerts yet" : "No alerts yet"}
            </div>
            <div style={{ fontSize: 13, color: C.inkLight }}>
              {filter === "open" ? "All farmers are responding on time." : "Alerts will appear here when farmers don't respond within 10 minutes."}
            </div>
          </div>
        ) : (
          filtered.map((alert) => (
            <AlertRow key={alert.id} alert={alert} onFollowUp={handleFollowUp} />
          ))
        )}
      </div>
    </div>
  );
}