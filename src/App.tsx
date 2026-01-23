import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./MainLayout";

import Home from "./pages/Home";
import LiveDashboard from "./pages/LiveDashboard";
import Applications from "./pages/applications/Applications";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Default landing */}
          <Route path="/" element={<Home />} />

          {/* Main pages */}
          <Route path="/dashboard" element={<LiveDashboard />} />
          <Route path="/applications" element={<Applications />} />

          {/* Safety fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
