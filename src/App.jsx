import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "./services/auth/AuthContext.jsx";
import { MarketplacePage }    from "./services/marketplace/index.js";
import { FarmerDashboardPage, KhokahanoAlertsPage } from "./services/farmer-portal/index.js";
import LoginPage             from "./services/auth/pages/LoginPage.jsx";
import RegisterPage          from "./services/auth/pages/RegisterPage.jsx";
import MyListingsPage        from "./services/farmer-management/pages/MyListingsPage.jsx";
import SurveyPage            from "./services/farmer-management/pages/SurveyPage.jsx";
import SurveyHistoryPage     from "./services/farmer-management/pages/SurveyHistoryPage.jsx";
import FarmerProfilePage     from "./services/farmer-management/pages/FarmerProfilePage.jsx";
import BuyerAccountPage      from "./services/marketplace/pages/BuyerAccountPage.jsx";
import AdminDashboardPage    from "./services/admin/pages/AdminDashboardPage.jsx";
import AdminSurveyImportPage from "./services/admin/pages/AdminSurveyImportPage.jsx";

function FarmerRoute({ children }) {
  const { isLoggedIn, isFarmer, isAdmin } = useAuthContext();
  if (!isLoggedIn)           return <Navigate to="/login" replace />;
  if (!isFarmer && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function BuyerRoute({ children }) {
  const { isLoggedIn, isBuyer } = useAuthContext();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isBuyer)    return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuthContext();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin)    return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<MarketplacePage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Buyer protected */}
      <Route path="/account" element={
        <BuyerRoute><BuyerAccountPage /></BuyerRoute>
      } />

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
      <Route path="/farmer/survey" element={
        <FarmerRoute><SurveyPage /></FarmerRoute>
      } />
      <Route path="/farmer/survey/history" element={
        <FarmerRoute><SurveyHistoryPage /></FarmerRoute>
      } />
      <Route path="/farmer/profile" element={
        <FarmerRoute><FarmerProfilePage /></FarmerRoute>
      } />

      {/* Admin protected */}
      <Route path="/admin" element={
        <AdminRoute><AdminDashboardPage /></AdminRoute>
      } />
      <Route path="/admin/surveys/import" element={
        <AdminRoute><AdminSurveyImportPage /></AdminRoute>
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