// ---------------------------------------------------------------------------
// useOrders.js — with localStorage persistence
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef, useCallback } from "react";
import { MOCK_ORDERS } from "../constants/mockOrders.js";
import { STATUS, ESCALATION_MINUTES } from "../constants/orderStatuses.js";

const ESCALATION_MS = ESCALATION_MINUTES * 60 * 1000;
const STORAGE_KEY   = "kh_farmer_orders";
const ESCALATED_KEY = "kh_escalated_ids"; // track which orders already escalated

// ── Persistence helpers ───────────────────────────────────────
function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveOrders(orders) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)); } catch {}
}

function loadEscalated() {
  try { return new Set(JSON.parse(localStorage.getItem(ESCALATED_KEY) || "[]")); } catch { return new Set(); }
}

function saveEscalated(set) {
  try { localStorage.setItem(ESCALATED_KEY, JSON.stringify([...set])); } catch {}
}

// ── Mock API ──────────────────────────────────────────────────
async function fetchOrders() {
  await new Promise((r) => setTimeout(r, 400));
  // First load: seed from mock data; subsequent loads: use persisted data
  const persisted = loadOrders();
  if (persisted) return persisted;
  const fresh = MOCK_ORDERS.map((o) => ({ ...o }));
  saveOrders(fresh);
  return fresh;
}

async function persistStatus(orderId, status, extra = {}) {
  await new Promise((r) => setTimeout(r, 200));
  // REAL: POST /api/orders/:id/status { status, ...extra }
  return { orderId, status, updatedAt: Date.now(), ...extra };
}

async function notifyKhokahano(order) {
  // REAL: POST /api/escalations
  console.log("[Khokahano Alert] Farmer not responding:", order.id, order.buyer.name);
  // Also persist escalation record
  const alerts = JSON.parse(localStorage.getItem("kh_escalation_log") || "[]");
  alerts.unshift({ ...order, escalatedAt: Date.now(), status: "escalated" });
  localStorage.setItem("kh_escalation_log", JSON.stringify(alerts.slice(0, 50)));
}

// ── Hook ──────────────────────────────────────────────────────
export function useOrders({ onEscalation, onNotification }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const timers      = useRef({});
  const alertTimers = useRef({});
  const escalatedIds = useRef(loadEscalated());

  // ── Persist whenever orders change ────────────────────────
  const setAndPersist = useCallback((updater) => {
    setOrders((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveOrders(next);
      return next;
    });
  }, []);

  // ── Initial load ──────────────────────────────────────────
  useEffect(() => {
    fetchOrders()
      .then((data) => { setOrders(data); setLoading(false); })
      .catch((err)  => { setError(err.message); setLoading(false); });
  }, []);

  // ── Escalation logic ──────────────────────────────────────
  const handleEscalate = useCallback(async (order) => {
    if (escalatedIds.current.has(order.id)) return; // don't double-escalate
    escalatedIds.current.add(order.id);
    saveEscalated(escalatedIds.current);

    setAndPersist((prev) =>
      prev.map((o) => o.id === order.id ? { ...o, status: STATUS.ESCALATED, escalatedAt: Date.now() } : o)
    );
    await notifyKhokahano(order);
    onEscalation(order);
  }, [onEscalation, setAndPersist]);

  // ── Start timers for pending orders ───────────────────────
  useEffect(() => {
    orders.forEach((order) => {
      if (order.status !== STATUS.PENDING) {
        clearTimeout(timers.current[order.id]);
        clearTimeout(alertTimers.current[order.id]);
        return;
      }
      if (timers.current[order.id]) return;
      if (escalatedIds.current.has(order.id)) return;

      const age       = Date.now() - order.placedAt;
      const remaining = ESCALATION_MS - age;

      if (remaining <= 0) { handleEscalate(order); return; }

      // 5-min reminder
      const reminderIn = Math.max(0, ESCALATION_MS / 2 - age);
      alertTimers.current[order.id] = setTimeout(() => {
        onNotification({
          id: `reminder_${order.id}`, type: "warning",
          title: "Order waiting",
          message: `Order #${order.id.slice(-3)} from ${order.buyer.name} has been waiting 5 minutes.`,
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

  // ── Status transition ─────────────────────────────────────
  const updateStatus = useCallback(async (orderId, newStatus, extra = {}) => {
    clearTimeout(timers.current[orderId]);
    clearTimeout(alertTimers.current[orderId]);
    delete timers.current[orderId];

    const timestamp = {
      accepted:  { acceptedAt:  Date.now() },
      preparing: { preparingAt: Date.now() },
      ready:     { readyAt:     Date.now() },
      completed: { completedAt: Date.now() },
      declined:  { declinedAt:  Date.now() },
    }[newStatus] ?? {};

    setAndPersist((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus, ...timestamp, ...extra } : o
      )
    );

    await persistStatus(orderId, newStatus, { ...timestamp, ...extra });
  }, [setAndPersist]);

  // ── Reset (dev helper) ────────────────────────────────────
  const resetOrders = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ESCALATED_KEY);
    localStorage.removeItem("kh_escalation_log");
    escalatedIds.current = new Set();
    const fresh = MOCK_ORDERS.map((o) => ({ ...o }));
    setOrders(fresh);
    saveOrders(fresh);
  }, []);

  // ── Derived stats ─────────────────────────────────────────
  const stats = {
    pending:   orders.filter((o) => [STATUS.PENDING, STATUS.ESCALATED].includes(o.status)).length,
    active:    orders.filter((o) => [STATUS.ACCEPTED, STATUS.PREPARING, STATUS.READY].includes(o.status)).length,
    completed: orders.filter((o) => o.status === STATUS.COMPLETED).length,
    declined:  orders.filter((o) => o.status === STATUS.DECLINED).length,
    todayRevenue: orders
      .filter((o) => o.status === STATUS.COMPLETED)
      .reduce((sum, o) => sum + o.total, 0),
  };

  return { orders, loading, error, stats, updateStatus, resetOrders };
}