// ---------------------------------------------------------------------------
// useBuyerOrders.js
// Buyer-side order tracking. Polls localStorage for status changes
// (simulating real-time push from backend). When backend is ready,
// replace polling with WebSocket or SSE.
// ---------------------------------------------------------------------------

import { useState, useEffect, useRef, useCallback } from "react";

const BUYER_ORDERS_KEY = "kh_buyer_orders";
const POLL_INTERVAL    = 3000; // ms — check for status updates every 3s

const STATUS_MESSAGES = {
  accepted:  { en: "Your order has been accepted by the farmer! 🎉",     icon: "✅" },
  preparing: { en: "The farmer is preparing your order. 🐔",              icon: "⚙️" },
  ready:     { en: "Your order is ready! Arrange pickup or delivery. 📦", icon: "📦" },
  completed: { en: "Your order has been completed. Thank you! 🙏",        icon: "✅" },
  declined:  { en: "Your order was declined by the farmer.",              icon: "❌" },
};

function loadBuyerOrders() {
  try { return JSON.parse(localStorage.getItem(BUYER_ORDERS_KEY) || "[]"); } catch { return []; }
}

function saveBuyerOrders(orders) {
  try { localStorage.setItem(BUYER_ORDERS_KEY, JSON.stringify(orders)); } catch {}
}

// ---------------------------------------------------------------------------
// registerBuyerOrder
// Called from CheckoutModal on successful checkout.
// 1. Saves the order to the buyer's tracking list.
// 2. Also injects the order into the farmer's order store (kh_farmer_orders)
//    so the farmer sees it on their dashboard and the polling can match IDs.
// ---------------------------------------------------------------------------
export function registerBuyerOrder(order) {
  // 1. Save to buyer tracking
  const buyerExisting = loadBuyerOrders();
  if (!buyerExisting.find((o) => o.id === order.id)) {
    saveBuyerOrders([{ ...order, lastSeenStatus: "pending" }, ...buyerExisting]);
  }

  // 2. Inject into farmer orders so it shows up on the farmer dashboard
  //    and polling can match by ID.
  try {
    const farmerOrdersKey = "kh_farmer_orders";
    const farmerOrders = JSON.parse(localStorage.getItem(farmerOrdersKey) || "[]");
    if (!farmerOrders.find((o) => o.id === order.id)) {
      // Shape the order to match the farmer dashboard format
      const farmerOrder = {
        id:           order.id,
        productId:    order.productId,
        productTitle: order.productTitle,
        productImage: order.productImage ?? "",
        qty:          order.qty,
        unitPrice:    order.unitPrice,
        unit:         order.unit,
        total:        order.total,
        currency:     order.currency ?? "LSL",
        status:       "pending",
        placedAt:     order.placedAt ?? Date.now(),
        buyer: {
          name:     order.buyerName ?? "Customer",
          phone:    order.delivery?.phone ?? "",
          district: order.district  ?? "",
          village:  order.delivery?.address ?? "",
        },
        delivery: order.delivery ?? { method: "pickup" },
        payment:  order.payment  ?? { method: "unknown" },
        notes:    order.notes    ?? "",
      };
      localStorage.setItem(farmerOrdersKey, JSON.stringify([farmerOrder, ...farmerOrders]));
    }
  } catch (e) {
    console.error("Failed to inject order into farmer store:", e);
  }
}

export function useBuyerOrders({ onStatusChange }) {
  const [orders, setOrders] = useState(loadBuyerOrders);
  const lastStatuses = useRef({}); // { orderId: status } — track what we last showed

  // Initialize last-seen from current order state
  useEffect(() => {
    orders.forEach((o) => {
      lastStatuses.current[o.id] = o.lastSeenStatus ?? o.status;
    });
  }, []); // eslint-disable-line

  // Poll farmer orders for status changes.
  // Only writes to localStorage and updates state when something actually changed —
  // prevents constant disk writes that fill up browser storage.
  useEffect(() => {
    const poll = () => {
      try {
        const farmerOrders = JSON.parse(localStorage.getItem("kh_farmer_orders") || "[]");
        const buyerOrders  = loadBuyerOrders();

        let statusChanged = false;
        let newOrdersFound = false;

        // Check for new orders not yet in state
        const stateIds = new Set(ordersRef.current.map((o) => o.id));
        buyerOrders.forEach((o) => { if (!stateIds.has(o.id)) newOrdersFound = true; });

        const updated = buyerOrders.map((buyerOrder) => {
          const farmerOrder = farmerOrders.find((fo) => fo.id === buyerOrder.id);
          if (!farmerOrder) return buyerOrder;

          const prevStatus = lastStatuses.current[buyerOrder.id] ?? buyerOrder.status;
          const newStatus  = farmerOrder.status;

          if (newStatus !== prevStatus) {
            lastStatuses.current[buyerOrder.id] = newStatus;
            const msg = STATUS_MESSAGES[newStatus];
            if (msg && onStatusChange) {
              onStatusChange({
                orderId:       buyerOrder.id,
                status:        newStatus,
                message:       msg.en,
                icon:          msg.icon,
                declineReason: farmerOrder.declineReason,
              });
            }
            statusChanged = true;
            return {
              ...buyerOrder,
              status:         newStatus,
              lastSeenStatus: newStatus,
              declineReason:  farmerOrder.declineReason,
              updatedAt:      Date.now(),
            };
          }
          return buyerOrder;
        });

        // Only write to localStorage and re-render when something changed
        if (statusChanged) {
          saveBuyerOrders(updated);
          setOrders(updated);
        } else if (newOrdersFound) {
          // New orders registered since mount — update state only, no write needed
          // (registerBuyerOrder already wrote them)
          setOrders(buyerOrders);
        }
      } catch (e) {
        // Silently swallow storage errors — don't spam the console
      }
    };

    const id = setInterval(poll, POLL_INTERVAL);
    poll();
    return () => clearInterval(id);
  }, [onStatusChange]);

  // Keep a ref to current orders so the poll closure can read it without stale closure issues
  const ordersRef = useRef([]);
  useEffect(() => { ordersRef.current = orders; }, [orders]);

  const clearCompleted = useCallback(() => {
    const remaining = orders.filter((o) => !["completed", "declined"].includes(o.status));
    saveBuyerOrders(remaining);
    setOrders(remaining);
  }, [orders]);

  return { orders, clearCompleted };
}