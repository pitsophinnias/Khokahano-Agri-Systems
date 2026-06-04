// ---------------------------------------------------------------------------
// NotificationToast.jsx
// Stack of toast notifications in the top-right corner.
// ---------------------------------------------------------------------------

const COLORS = {
  new_order:  { bg: "#1c4a1c", border: "#2a6b2a", icon: "🛒" },
  warning:    { bg: "#7f5500", border: "#b8860b",  icon: "⏱" },
  escalation: { bg: "#7f1f1f", border: "#a32d2d",  icon: "🚨" },
  info:       { bg: "#1a1a18", border: "#4a4a44",  icon: "ℹ" },
};

function Toast({ notif, onDismiss }) {
  const c = COLORS[notif.type] ?? COLORS.info;

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 6,
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        minWidth: 280,
        maxWidth: 340,
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        animation: "toastIn 0.25s ease",
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>{c.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
          {notif.title}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
          {notif.message}
        </div>
        {notif.action && (
          <button
            onClick={notif.action.fn}
            style={{
              marginTop: 8, padding: "4px 10px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 4, color: "#fff",
              fontSize: 11, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {notif.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(notif.id)}
        style={{
          background: "none", border: "none",
          color: "rgba(255,255,255,0.5)", cursor: "pointer",
          fontSize: 14, lineHeight: 1, padding: "2px 4px", flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default function NotificationToast({ notifications, onDismiss }) {
  if (!notifications.length) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .kh-toast-stack {
          position: fixed;
          top: 70px;
          right: 16px;
          z-index: 600;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        }
        .kh-toast-stack > * { pointer-events: all; }
      `}</style>

      <div className="kh-toast-stack">
        {notifications.map((n) => (
          <Toast key={n.id} notif={n} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}