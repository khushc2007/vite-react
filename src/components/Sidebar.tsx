import { Page } from "../App";

interface Props {
  activePage: Page;
  setActivePage: (p: Page) => void;
}

export default function Sidebar({ page, setPage }: any) {
  return (
    <div style={{ width: 240, padding: 20, background: "#020617" }}>
      <h2 style={{ color: "var(--accent)" }}>IoTWQMS</h2>

      <div onClick={() => setPage("home")} style={item(page === "home")}>Home</div>

      <div style={{ marginLeft: 12 }}>
        <div onClick={() => setPage("live")} style={sub(page === "live")}>Live Dashboard</div>
        <div onClick={() => setPage("history")} style={sub(page === "history")}>History</div>
        <div onClick={() => setPage("applications")} style={sub(page === "applications")}>
          Real-World Applications
        </div>
        <div onClick={() => setPage("settings")} style={sub(page === "settings")}>Settings</div>
      </div>
    </div>
  );
}

const item = (a: boolean) => ({
  padding: "10px",
  fontWeight: 600,
  cursor: "pointer",
  background: a ? "#1e293b" : "transparent"
});

const sub = (a: boolean) => ({
  padding: "8px",
  fontSize: 14,
  cursor: "pointer",
  background: a ? "#0f172a" : "transparent"
});

function NavItem({
  label,
  active,
  onClick,
}: any) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderRadius: 8,
        cursor: "pointer",
        background: active ? "#1e293b" : "transparent",
        color: "#e5e7eb",
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}

function SubItem({
  label,
  active,
  onClick,
}: any) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 6,
        cursor: "pointer",
        background: active ? "#0f172a" : "transparent",
        color: "#cbd5f5",
        marginTop: 6,
        fontSize: 14,
      }}
    >
      • {label}
    </div>
  );
}

const sidebar = {
  width: 240,
  background: "#020617",
  padding: 20,
};
