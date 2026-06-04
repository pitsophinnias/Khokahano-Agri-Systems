// ---------------------------------------------------------------------------
// useOrderTimer.js
// Returns a live countdown string (mm:ss) for a pending order.
// Updates every second. Returns null when order is no longer pending.
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import { ESCALATION_MINUTES } from "../constants/orderStatuses.js";

const ESCALATION_MS = ESCALATION_MINUTES * 60 * 1000;

export function useOrderTimer(order) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (order.status !== "pending" && order.status !== "escalated") {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const age  = Date.now() - order.placedAt;
      const left = ESCALATION_MS - age;
      setRemaining(left);
    };

    tick(); // immediate
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [order.placedAt, order.status]);

  if (remaining === null) return null;

  if (remaining <= 0) {
    return { display: "00:00", overdue: true, urgent: true };
  }

  const totalSec = Math.ceil(remaining / 1000);
  const min      = Math.floor(totalSec / 60);
  const sec      = totalSec % 60;
  const display  = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  const urgent   = remaining < 120_000; // last 2 minutes

  return { display, overdue: false, urgent };
}