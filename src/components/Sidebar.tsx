import { Page } from "../App";

interface Props {
  activePage: Page;
  setActivePage: (p: Page) => void;
}

export default function Sidebar({
  activePage,
  setActivePage,
}: Props) {
  return (
    <div style={sidebar}>
      <h2 style={{ color: "#38bdf8", marginBottom: 20 }}>
        IoTWQMS
      </h2>

      {/* HOME */}
      <NavItem
        label="Home"
        active={activePage === "home"}
        onClick={() => setActivePage("home")}
      />

      {/* SUB SECTIONS */}
      <div style={{ marginLeft: 16, marginTop: 10 }}>
        <SubItem
          label="Live Dashboard"
          active={activePage === "live"}
          onClick={() => setActivePage("live")}
        />

        <SubItem
          label="History"
          active={activePage === "history"}
          onClick={() => setActivePage("history")}
        />

        <SubItem
          label="Settings"
          active={activePage === "settings"}
          onClick={() => setActivePage("settings")}
        />
      </div>
    </div>
  );
}

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
