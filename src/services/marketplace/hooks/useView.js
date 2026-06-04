// ---------------------------------------------------------------------------
// useView.js
// Simple in-app "router" without React Router.
// Views: "marketplace" | "about" | "subscribe"
// ---------------------------------------------------------------------------
import { useState, useCallback } from "react";

export function useView(initial = "marketplace") {
  const [view, setView]         = useState(initial);
  const [viewData, setViewData] = useState(null); // optional payload

  const navigate = useCallback((target, data = null) => {
    setView(target);
    setViewData(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { view, viewData, navigate };
}