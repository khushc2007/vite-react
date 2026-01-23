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
  <div style={{ display: "flex", height: "100vh", background: "#0b1220" }}>
    <Sidebar activePage={page} setActivePage={setPage} />

    {/* MAIN CONTENT */}
    <div
      style={{
        flex: 1,
        padding: 24,
        marginLeft: 12, // separation
        background: "#0f172a", // less dark than before
        borderRadius: "16px 0 0 16px", // clean edge
      }}
    >
      {renderPage()}
    </div>
  </div>
);
