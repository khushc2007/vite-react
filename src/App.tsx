import { useState } from "react";
import Sidebar from "./components/Sidebar";
import LiveDashboard from "./pages/LiveDashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
import ChartModal from "./components/ChartModal";

export default function App() {
  const [page, setPage] = useState("live");
  const [chartKey, setChartKey] = useState<string | null>(null);

  const renderPage = () => {
    if (chartKey) {
      return (
        <ChartModal
          title={chartKey.toUpperCase()}
          back={() => setChartKey(null)}
        />
      );
    }

    switch (page) {
      case "history":
        return <History />;
      case "settings":
        return <Settings />;
      default:
        return <LiveDashboard openChart={setChartKey} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0b1220",
      }}
    >
      <Sidebar activePage={page} setActivePage={setPage} />

      <div
        style={{
          flex: 1,
          padding: 24,
          marginLeft: 12,
          background: "#0f172a",
          borderRadius: "16px 0 0 16px",
        }}
      >
        {renderPage()}
      </div>
    </div>
  );
}
