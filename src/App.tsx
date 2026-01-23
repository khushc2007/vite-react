import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import LiveDashboard from "./pages/LiveDashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Applications from "./pages/Applications";
import ChartModal from "./components/ChartModal";
import SaveIterationModal from "./components/SaveIterationModal";

export type Page =
  | "home"
  | "live"
  | "history"
  | "applications"
  | "settings";

export type Reading = {
  sl: number;
  time: string;
  ph: number;
  tds: number;
  turbidity: number;
};

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [chartMetric, setChartMetric] = useState<null | "ph" | "tds" | "turbidity">(null);
  const [showSave, setShowSave] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar page={page} setPage={setPage} />

      <div style={{
        flex: 1,
        marginLeft: 12,
        padding: 24,
        background: "#0f172a",
        borderRadius: "16px 0 0 16px"
      }}>
        {page === "home" && <Home navigate={setPage} />}
        {page === "live" && (
          <LiveDashboard
            readings={readings}
            setReadings={setReadings}
            openChart={setChartMetric}
            openSave={() => setShowSave(true)}
          />
        )}
        {page === "history" && <History />}
        {page === "applications" && <Applications />}
        {page === "settings" && <Settings />}
      </div>

      {chartMetric && (
        <ChartModal
          readings={readings}
          metric={chartMetric}
          close={() => setChartMetric(null)}
        />
      )}

      {showSave && (
        <SaveIterationModal
          readings={readings}
          close={() => setShowSave(false)}
        />
      )}
    </div>
  );
}
