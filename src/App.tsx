import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";

/* PAGES */
import Home from "./pages/Home";
import LiveDashboard from "./pages/LiveDashboard";
import History from "./pages/history/HistoryPage";
import Settings from "./pages/Settings";
import Aquaculture from "./pages/applications/Aquaculture";
import Agriculture from "./pages/applications/Agriculture";
import Industrial from "./pages/applications/Industrial";
import GreywaterViz from "./pages/GreywaterViz";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wraps every route — BottomNavigation lives inside Layout */}
        <Route element={<Layout />}>

          {/* DEFAULT */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* HOME */}
          <Route path="/home" element={<Home />} />

          {/* CORE */}
          <Route path="/live"     element={<LiveDashboard />} />
          <Route path="/history"  element={<HistoryPage />} />
          <Route path="/settings" element={<Settings />} />

          {/* VISUALIZATION */}
          <Route path="/chamber" element={<GreywaterViz />} />

          {/* APPLICATIONS */}
          <Route path="/applications/aquaculture" element={<Aquaculture />} />
          <Route path="/applications/agriculture"  element={<Agriculture />} />
          <Route path="/applications/industrial"   element={<Industrial />} />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/home" replace />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
