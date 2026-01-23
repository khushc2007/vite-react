import { Page } from "./App";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import LiveDashboard from "./pages/LiveDashboard";
import History from "./pages/History";
import Applications from "./pages/Applications";
import Settings from "./pages/Settings";

type Props = {
  page: Page;
  setPage: (page: Page) => void;
};

export default function MainLayout({ page, setPage }: Props) {
  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home setPage={setPage} />;

      case "live":
        return <LiveDashboard />;

      case "history":
        return <History />;

      case "applications":
        return <Applications />;

      case "settings":
        return <Settings />;

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#0b1220",
        color: "#e5e7eb",
      }}
    >
      <Sidebar page={page} setPage={setPage} />

      <main
        style={{
          flex: 1,
          padding: "28px",
          marginLeft: "12px",
          backgroundColor: "#0f172a",
          borderRadius: "12px",
          overflow: "auto",
        }}
      >
        {renderPage()}
      </main>
    </div>
  );
}
