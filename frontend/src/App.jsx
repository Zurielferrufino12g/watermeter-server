// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/login";
import DashboardPage from "./pages/Dashboard";
import AdminPage from "./pages/Admin";

/* ================= AUTH HELPERS ================= */
function getToken() {
  return localStorage.getItem("sw_token") || sessionStorage.getItem("sw_token");
}
function getRole() {
  return localStorage.getItem("sw_role") || sessionStorage.getItem("sw_role");
}

/* ================= GUARDS ================= */
function RequireAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const token = getToken();
  const role = getRole();

  if (!token) return <Navigate to="/login" replace />;

  // Si no hay role aún, manda a dashboard (o podrías mandar a /login)
  // pero lo ideal es que el login SIEMPRE guarde sw_role.
  if (role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}

/* ✅ Ruta inteligente: decide según token + role */
function HomeRedirect() {
  const token = getToken();
  const role = getRole();

  if (!token) return <Navigate to="/login" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

/* ✅ Opcional: si admin intenta entrar a dashboard, lo mandamos a admin */
function DashboardRedirectIfAdmin({ children }) {
  const role = getRole();
  if (role === "admin") return <Navigate to="/admin" replace />;
  return children;
}

/* ================= ROUTES ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardRedirectIfAdmin>
                <DashboardPage />
              </DashboardRedirectIfAdmin>
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />

        {/* ✅ Cambiamos el "/" para que te mande al lugar correcto */}
        <Route path="/" element={<HomeRedirect />} />

        {/* ✅ Y los 404 también */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}  