// ---------------------------------------------------------------------------
// useNotifications.js
// Manages an in-app notification queue. Toasts auto-dismiss after 6 seconds.
// Also plays a sound on new orders (if browser allows).
// ---------------------------------------------------------------------------

import { useState, useCallback, useRef } from "react";

let nextId = 1;

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const dismissTimers = useRef({});

  const push = useCallback((notification) => {
    const id = notification.id ?? `notif_${nextId++}`;
    const notif = { ...notification, id, createdAt: Date.now() };

    setNotifications((prev) => [notif, ...prev].slice(0, 5)); // max 5 toasts

    // Play a subtle beep for new orders (browser may block if no prior interaction)
    if (notification.type === "new_order" || notification.type === "escalation") {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = notification.type === "escalation" ? 440 : 520;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } catch {
        // Audio not available — silent fail
      }
    }

    // Auto-dismiss after 6 seconds (escalation stays longer)
    const duration = notification.type === "escalation" ? 12000 : 6000;
    dismissTimers.current[id] = setTimeout(() => dismiss(id), duration);

    return id;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback((id) => {
    clearTimeout(dismissTimers.current[id]);
    delete dismissTimers.current[id];
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    Object.values(dismissTimers.current).forEach(clearTimeout);
    dismissTimers.current = {};
    setNotifications([]);
  }, []);

  return { notifications, push, dismiss, dismissAll };
}