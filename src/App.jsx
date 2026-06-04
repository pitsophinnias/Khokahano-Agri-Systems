// ---------------------------------------------------------------------------
// Shell App — URL-based routing
//
// Routes:
//   /              → Marketplace (buyer side)
//   /farmer        → Farmer dashboard
//   /farmer/alerts → Khokahano alerts page (staff only)
//
// Open each in a separate browser tab to see the full ordering flow:
//   Tab 1: http://localhost:3000/
//   Tab 2: http://localhost:3000/farmer
// ---------------------------------------------------------------------------

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MarketplacePage }                         from "./services/marketplace/index.js";
import { FarmerDashboardPage, KhokahanoAlertsPage } from "./services/farmer-portal/index.js";

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition:   true,   // silences startTransition warning
        v7_relativeSplatPath: true,   // silences splat route warning
      }}
    >
      <Routes>
        <Route path="/"              element={<MarketplacePage />} />
        <Route path="/farmer"        element={<FarmerDashboardPage lang="en" />} />
        <Route path="/farmer/alerts" element={<KhokahanoAlertsPage />} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}