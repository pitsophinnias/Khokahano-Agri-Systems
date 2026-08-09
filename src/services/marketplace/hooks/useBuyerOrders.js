// ---------------------------------------------------------------------------
// useBuyerOrders.js
// Fetches buyer orders from the real backend every 5 seconds.
// When a status changes since the last poll, fires onStatusChange.
// Falls back to empty array if the user is not logged in.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchMyOrdersAsBuyer, getToken } from "../api/marketplace.api.js";

const POLL_INTERVAL = 5000; // ms

const STATUS_MESSAGES = {
  ACCEPTED:  { en: "Your order has been accepted by the farmer! 🎉", icon: "✅" },
  PREPARING: { en: "The farmer is preparing your order. 🐔",         icon: "⚙️" },
  READY:     { en: "Your order is ready for pickup or delivery. 📦", icon: "📦" },
  COMPLETED: { en: "Your order has been completed. Thank you! 🙏",   icon: "✅" },
  DECLINED:  { en: "Your order was declined by the farmer.",         icon: "❌" },
  ESCALATED: { en: "Your order has been escalated to Khokahano.",    icon: "⚠️" },
};

export function useBuyerOrders({ onStatusChange } = {}) {
  const [orders,  setOrders]  = useState([]);
  const lastStatuses = useRef({}); // { orderId: status }

  const poll = useCallback(async () => {
    if (!getToken()) {
      setOrders([]);
      return;
    }
    try {
      const fetched = await fetchMyOrdersAsBuyer();
      const list    = Array.isArray(fetched) ? fetched : fetched.orders ?? [];

      // Detect status changes since last poll
      list.forEach((order) => {
        const prev = lastStatuses.current[order.id];
        const curr = order.status;
        if (prev && prev !== curr && onStatusChange) {
          const msg = STATUS_MESSAGES[curr];
          if (msg) {
            onStatusChange({
              orderId:       order.id,
              status:        curr,
              message:       msg.en,
              icon:          msg.icon,
              declineReason: order.declineReason,
            });
          }
        }
        lastStatuses.current[order.id] = curr;
      });

      setOrders(list);
    } catch {
      // Silently fail — network hiccup shouldn't crash the UI
    }
  }, [onStatusChange]);

  useEffect(() => {
    poll(); // immediate first fetch
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [poll]);

  // Active orders = anything not completed or declined
  // Normalise to uppercase to handle both backend and legacy shapes
  const activeOrderCount = orders.filter(
    (o) => !["COMPLETED", "DECLINED"].includes((o.status ?? "").toUpperCase())
  ).length;

  const clearCompleted = useCallback(() => {
    setOrders((prev) => prev.filter(
      (o) => !["COMPLETED", "DECLINED"].includes((o.status ?? "").toUpperCase())
    ));
  }, []);

  return { orders, activeOrderCount, clearCompleted };
}

// No longer needed — kept for backward compatibility with any imports
export function registerBuyerOrder() {}