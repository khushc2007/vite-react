import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import LiveDashboard from "./pages/LiveDashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
import ChartModal from "./components/ChartModal";

export type Reading = {
  sl: number;
  time: string;
  ph: number;
  tds: number;
  turbidity: number;
};

export default function App() {
  const [page, setPage] = useState("home");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [chartKey, setChartKey] = useState<null | "ph" | "tds" | "turbidity">(null);

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      <Sidebar setPage={setPage} />

      <div style={{ flex: 1, padding: 24, marginLeft: 16 }}>
        {page === "home" && <Home navigate={setPage} />}
        {page === "live" && (
          <LiveDashboard
            readings={readings}
            setReadings={setReadings}
            openChart={setChartKey}
          />
        )}
        {page === "history" && <History />}
        {page === "settings" && <Settings />}
      </div>

      {chartKey && (
        <ChartModal
          readings={readings}
          metric={chartKey}
          onClose={() => setChartKey(null)}
        />
      )}
    </div>
  );
}
