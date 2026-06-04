// ---------------------------------------------------------------------------
// Order status definitions — single source of truth.
// Keep in sync with your backend enum when the API is connected.
// ---------------------------------------------------------------------------

export const STATUS = {
  PENDING:   "pending",
  ACCEPTED:  "accepted",
  PREPARING: "preparing",
  READY:     "ready",
  COMPLETED: "completed",
  DECLINED:  "declined",
  ESCALATED: "escalated", // pending too long — Khokahano alerted
};

export const STATUS_CONFIG = {
  pending: {
    label:   { en: "New order",    st: "Taelo e ncha" },
    color:   "#b8860b",
    bg:      "#fff8e1",
    dot:     "#f5c518",
    actions: ["accept", "decline"],
  },
  escalated: {
    label:   { en: "Overdue",      st: "E fedile nako" },
    color:   "#a32d2d",
    bg:      "#ffebee",
    dot:     "#e53935",
    actions: ["accept", "decline"],
  },
  accepted: {
    label:   { en: "Accepted",     st: "E amohetsoe" },
    color:   "#1c4a1c",
    bg:      "#e8f0e8",
    dot:     "#2a6b2a",
    actions: ["start_preparing"],
  },
  preparing: {
    label:   { en: "Preparing",    st: "E hlophisoa" },
    color:   "#1a4fa0",
    bg:      "#e3f2fd",
    dot:     "#1976d2",
    actions: ["mark_ready"],
  },
  ready: {
    label:   { en: "Ready",        st: "E lokile" },
    color:   "#2e7d32",
    bg:      "#e8f5e9",
    dot:     "#43a047",
    actions: ["complete"],
  },
  completed: {
    label:   { en: "Completed",    st: "E phethiloe" },
    color:   "#5a7a5a",
    bg:      "#f0f7ec",
    dot:     "#5a7a5a",
    actions: [],
  },
  declined: {
    label:   { en: "Declined",     st: "E hanetsoe" },
    color:   "#8a8a80",
    bg:      "#f1efe8",
    dot:     "#8a8a80",
    actions: [],
  },
};

export const ACTION_CONFIG = {
  accept:          { label: { en: "Accept order",    st: "Amohela taelo"    }, style: "primary" },
  decline:         { label: { en: "Decline",         st: "Hana"             }, style: "ghost"   },
  start_preparing: { label: { en: "Start preparing", st: "Qala ho hlophisa" }, style: "primary" },
  mark_ready:      { label: { en: "Mark as ready",   st: "Bontša e lokile"  }, style: "primary" },
  complete:        { label: { en: "Mark completed",  st: "Phetha"           }, style: "primary" },
};

// Minutes before a pending order triggers escalation
export const ESCALATION_MINUTES = 10;