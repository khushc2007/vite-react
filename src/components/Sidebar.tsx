import { Page } from "../App";

interface Props {
  activePage: Page;
  setActivePage: (p: Page) => void;
}

export default function Sidebar({ activePage, setActivePage }: Props) {
  return (
    <div style={sidebar}>
      <h2 style={{ color: "#38bdf8" }}>IoTWQMS</h2>

      <NavItem
        label="Home"
        active={activePage === "home"}
        onClick={() => setActivePage("home")}
      />
    </div>
  );
}

function NavItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderRadius: 8,
        cursor: "pointer",
        background: active ? "#1e293b" : "transparent",
        color: "#e5e7eb",
        marginTop: 8,
      }}
    >
      {label}
    </div>
  );
}

const sidebar = {
  width: 220,
  background: "#020617",
  padding: 20,
};
