import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "./services/auth/AuthContext.jsx";
import { MarketplacePage }    from "./services/marketplace/index.js";
import { FarmerDashboardPage, KhokahanoAlertsPage } from "./services/farmer-portal/index.js";
import LoginPage    from "./services/auth/pages/LoginPage.jsx";
import RegisterPage from "./services/auth/pages/RegisterPage.jsx";
import MyListingsPage from "./services/farmer-management/pages/MyListingsPage.jsx";

// Redirects to /login if not logged in as farmer
function FarmerRoute({ children }) {
  const { isLoggedIn, isFarmer, isAdmin } = useAuthContext();
  if (!isLoggedIn)          return <Navigate to="/login" replace />;
  if (!isFarmer && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<MarketplacePage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Farmer protected */}
      <Route path="/farmer" element={
        <FarmerRoute><FarmerDashboardPage lang="en" /></FarmerRoute>
      } />
      <Route path="/farmer/listings" element={
        <FarmerRoute><MyListingsPage /></FarmerRoute>
      } />
      <Route path="/farmer/alerts" element={
        <FarmerRoute><KhokahanoAlertsPage /></FarmerRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}