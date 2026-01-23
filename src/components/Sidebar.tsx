import { Page } from "../App";

interface Props {
  activePage: Page;
  setActivePage: (p: Page) => void;
}

export default function Sidebar({ activePage, setActivePage }: Props) {
  const itemStyle = (page: Page) => ({
    padding: "12px",
    cursor: "pointer",
    background: activePage === page ? "#1f2937" : "transparent",
    color: "#fff"
  });

  return (
    <div style={{ width: 220, background: "#020617", padding: 10 }}>
      <h3 style={{ color: "#38bdf8" }}>IoT WQMS</h3>
      <div style={itemStyle("home")} onClick={() => setActivePage("home")}>Live Dashboard</div>
      <div style={itemStyle("history")} onClick={() => setActivePage("history")}>History</div>
      <div style={itemStyle("settings")} onClick={() => setActivePage("settings")}>Settings</div>
    </div>
  );
}


