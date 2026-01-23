import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import LiveDashboard from "./pages/LiveDashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
import ChartView from "./pages/ChartView";

export type Page =
  | "home"
  | "live"
  | "history"
  | "settings"
  | "chart";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [chartKey, setChartKey] = useState<string>("");

  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home navigate={setPage} />;

      case "live":
        return (
          <LiveDashboard
            openChart={(key) => {
              setChartKey(key);
              setPage("chart");
            }}
          />
        );

      case "chart":
        return (
          <ChartView
            title={chartKey}
            back={() => setPage("live")}
          />
        );

      case "history":
        return <History />;

      case "settings":
        return <Settings />;

      default:
        return <Home navigate={setPage} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar activePage={page} setActivePage={setPage} />
      <div style={{ flex: 1, padding: 24, background: "#020617" }}>
        {renderPage()}
      </div>
    </div>
  );
}
