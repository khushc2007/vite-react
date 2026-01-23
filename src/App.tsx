import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import History from "./pages/History";
import Settings from "./pages/Settings";

export type Page = "home" | "history" | "settings";

export default function App() {
  const [activePage, setActivePage] = useState<Page>("home");

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0b0f14" }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div style={{ flex: 1, padding: "20px", color: "#fff" }}>
        {activePage === "home" && <Home />}
        {activePage === "history" && <History />}
        {activePage === "settings" && <Settings />}
      </div>
    </div>
  );
}
