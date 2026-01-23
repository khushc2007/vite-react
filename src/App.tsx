import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

/* Pages */
import Login from "./pages/Login";
import Home from "./pages/Home";
import LiveDashboard from "./pages/LiveDashboard";
import ApplicationsHome from "./pages/applications/Applications";
import Aquaculture from "./pages/applications/Aquaculture";
import Agriculture from "./pages/applications/Agriculture";
import Industrial from "./pages/applications/Industrial";
import Settings from "./pages/Settings";
import History from "./pages/History";

/* Layout */
import MainLayout from "./MainLayout";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* ---------------- LOGIN ---------------- */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={() => setIsAuthenticated(true)} />
            )
          }
        />

        {/* ------------- PROTECTED ROUTES ------------- */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <MainLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Home />} />
          <Route path="live-dashboard" element={<LiveDashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="history" element={<History />} />
        </Route>

        {/* ------------- FALLBACK ------------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
