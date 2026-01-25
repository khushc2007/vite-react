import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";

import Home from "./pages/Home";
import LiveDashboard from "./pages/LiveDashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";

import Applications from "./pages/applications/Applications";
import Aquaculture from "./pages/applications/Aquaculture";
import Agriculture from "./pages/applications/Agriculture";
import Industrial from "./pages/applications/Industrial";

import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* HOME PAGE */}
          <Route path="/" element={<Home />} />

          {/* LIVE DASHBOARD PAGE */}
          <Route
            path="/live"
            element={
              <ErrorBoundary>
                <LiveDashboard />
              </ErrorBoundary>
            }
          />

          {/* HISTORY PAGE */}
          <Route path="/history" element={<History />} />

          {/* SETTINGS PAGE */}
          <Route path="/settings" element={<Settings />} />

          {/* APPLICATIONS SECTION */}
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/aquaculture" element={<Aquaculture />} />
          <Route path="/applications/agriculture" element={<Agriculture />} />
          <Route path="/applications/industrial" element={<Industrial />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
