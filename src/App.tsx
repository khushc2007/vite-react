import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

/* PAGES */
import Home from "./pages/Home";
import LiveDashboard from "./pages/LiveDashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Aquaculture from "./pages/applications/Aquaculture";
import Agriculture from "./pages/applications/Agriculture";
import Industrial from "./pages/applications/Industrial";

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#020617",
          color: "#ecfdf5",
        }}
      >
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          <Routes>
            {/* DEFAULT */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* HOME */}
            <Route path="/home" element={<Home />} />

            {/* CORE */}
            <Route path="/live" element={<LiveDashboard />} />
            <Route path="/tank" element={<TankView />} />
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

            {/* SAFETY FALLBACK */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
