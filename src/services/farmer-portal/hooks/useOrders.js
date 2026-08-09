// ---------------------------------------------------------------------------
// useOrders.js — farmer order management, now connected to real backend
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchMyOrdersAsFarmer, updateOrderStatus as apiUpdateStatus } from "../../marketplace/api/marketplace.api.js";
import { STATUS, ESCALATION_MINUTES } from "../constants/orderStatuses.js";

const POLL_INTERVAL  = 5000;  // poll every 5s for new orders
const ESCALATION_MS  = ESCALATION_MINUTES * 60 * 1000;
const REMINDER_MS    = (ESCALATION_MINUTES / 2) * 60 * 1000;

// ── Hook ──────────────────────────────────────────────────────
export function useOrders({ onEscalation, onNotification }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const timers        = useRef({});
  const alertTimers   = useRef({});
  const escalatedIds  = useRef(new Set());

  // ── Load orders from backend ───────────────────────────────
  const load = useCallback(async () => {
    try {
      const result = await fetchMyOrdersAsFarmer();
      const list   = result.orders ?? result ?? [];
      setOrders(list);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [load]);

  // ── Escalation logic ──────────────────────────────────────
  const handleEscalate = useCallback(async (order) => {
    if (escalatedIds.current.has(order.id)) return;
    escalatedIds.current.add(order.id);

    try {
      await apiUpdateStatus(order.id, "ESCALATED");
    } catch {}

    setOrders((prev) =>
      prev.map((o) => o.id === order.id ? { ...o, status: "ESCALATED", escalatedAt: new Date().toISOString() } : o)
    );
    onEscalation(order);
  }, [onEscalation]);

  // ── Escalation timers ─────────────────────────────────────
  useEffect(() => {
    orders.forEach((order) => {
      const isPending = ["PENDING", "pending"].includes(order.status);

      if (!isPending) {
        clearTimeout(timers.current[order.id]);
        clearTimeout(alertTimers.current[order.id]);
        return;
      }
      if (timers.current[order.id]) return;
      if (escalatedIds.current.has(order.id)) return;

      const placedAt  = new Date(order.placedAt).getTime();
      const age       = Date.now() - placedAt;
      const remaining = ESCALATION_MS - age;

      if (remaining <= 0) { handleEscalate(order); return; }

      // 5-min reminder
      const reminderIn = Math.max(0, REMINDER_MS - age);
      alertTimers.current[order.id] = setTimeout(() => {
        onNotification({
          id:      `reminder_${order.id}`,
          type:    "warning",
          title:   "Order waiting",
          message: `Order from ${order.buyer?.name ?? "a buyer"} has been waiting 5 minutes.`,
          orderId: order.id,
        });
      }, reminderIn);

      // 10-min escalation
      timers.current[order.id] = setTimeout(() => handleEscalate(order), remaining);
    });

    return () => {
      Object.values(timers.current).forEach(clearTimeout);
      Object.values(alertTimers.current).forEach(clearTimeout);
    };
  }, [orders, handleEscalate, onNotification]);

  // ── Update status ─────────────────────────────────────────
  const updateStatus = useCallback(async (orderId, newStatus, extra = {}) => {
    clearTimeout(timers.current[orderId]);
    clearTimeout(alertTimers.current[orderId]);
    delete timers.current[orderId];

    try {
      const updated = await apiUpdateStatus(orderId, newStatus, extra);
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, ...updated } : o)
      );
    } catch (err) {
      onNotification({ id: `err_${orderId}`, type: "escalation", title: "Error", message: err.message });
    }
  }, [onNotification]);

  // ── Derived stats ─────────────────────────────────────────
  const stats = {
    pending:   orders.filter((o) => ["PENDING","pending","ESCALATED","escalated"].includes(o.status)).length,
    active:    orders.filter((o) => ["ACCEPTED","accepted","PREPARING","preparing","READY","ready"].includes(o.status)).length,
    completed: orders.filter((o) => ["COMPLETED","completed"].includes(o.status)).length,
    declined:  orders.filter((o) => ["DECLINED","declined"].includes(o.status)).length,
    todayRevenue: orders
      .filter((o) => ["COMPLETED","completed"].includes(o.status))
      .reduce((sum, o) => sum + (o.totalAmount ?? o.total ?? 0), 0),
  };

  const resetOrders = useCallback(() => load(), [load]);

  return { orders, loading, error, stats, updateStatus, resetOrders };
}