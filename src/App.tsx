import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* SIDEBAR */
import Sidebar from "./components/Sidebar";

/* PAGES */
import LiveDashboard from "./pages/LiveDashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";

/* APPLICATION PAGES */
import Aquaculture from "./pages/applications/Aquaculture";
import Agriculture from "./pages/applications/Agriculture";
import Industrial from "./pages/applications/Industrial";

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#020617",
        }}
      >
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          <Routes>
            {/* DEFAULT */}
            <Route path="/" element={<Navigate to="/live" replace />} />

            {/* CORE */}
            <Route path="/live" element={<LiveDashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />

            {/* APPLICATIONS */}
            <Route
              path="/applications/aquaculture"
              element={<Aquaculture />}
            />
            <Route
              path="/applications/agriculture"
              element={<Agriculture />}
            />
            <Route
              path="/applications/industrial"
              element={<Industrial />}
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/live" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
