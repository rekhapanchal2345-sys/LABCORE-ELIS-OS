// ============================================================
// APP ROOT — Router + Background
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MfaVerifyPage from "./pages/MfaVerifyPage";
import MfaSetupPage from "./pages/MfaSetupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <>
      {/* Animated background */}
      <div className="app-bg">
        <div className="app-bg-grid" />
        <div className="app-bg-accent" />
      </div>

      <div className="portal-layout">
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/mfa-verify" element={<MfaVerifyPage />} />
            <Route path="/mfa-setup" element={<MfaSetupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Default */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}
