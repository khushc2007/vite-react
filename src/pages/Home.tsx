import { Page } from "../App";

export default function Home({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <>
      <h1 style={{ color: "#e5e7eb", marginBottom: 30 }}>
        Water Quality Monitoring System
      </h1>

      <div style={grid}>
        <HomeCard title="Live Dashboard" onClick={() => navigate("live")} />
        <HomeCard title="History" onClick={() => navigate("history")} />
        <HomeCard title="Settings" onClick={() => navigate("settings")} />
      </div>
    </>
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
