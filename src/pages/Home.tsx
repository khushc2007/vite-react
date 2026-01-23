import { Page } from "../App";

export default function Home({ navigate }: { navigate: (p: string) => void }) {
  const tileStyle = {
    background: "#111827",
    border: "1px solid #1f2933",
    borderRadius: 16,
    padding: 40,
    cursor: "pointer",
    fontSize: 22,
    fontWeight: 600,
    color: "#e5e7eb",
    textAlign: "center" as const,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
      <div style={tileStyle} onClick={() => navigate("live")}>Live Dashboard</div>
      <div style={tileStyle} onClick={() => navigate("history")}>History</div>
      <div style={tileStyle} onClick={() => navigate("settings")}>Settings</div>
    </div>
  );
}

function HomeCard({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} style={card}>
      {title}
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 30,
};

const card = {
  background: "#111827",
  padding: 50,
  borderRadius: 16,
  textAlign: "center" as const,
  color: "#e5e7eb",
  cursor: "pointer",
  fontSize: 20,
  boxShadow: "0 0 25px rgba(56,189,248,0.15)",
};
