import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 style={{ color: "#e2e8f0", marginBottom: "30px" }}>
        Water Quality Monitoring System
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <Card title="Live Dashboard" onClick={() => navigate("/dashboard")} />
        <Card title="Applications" onClick={() => navigate("/applications")} />
        <Card title="Settings" onClick={() => alert("Settings page later")} />
      </div>
    </div>
  );
}

function Card({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#1b2f45",
        padding: "40px",
        borderRadius: "14px",
        cursor: "pointer",
        textAlign: "center",
        color: "#e5e7eb",
        fontSize: "18px",
        border: "1px solid #2a4365",
      }}
    >
      {title}
    </div>
  );
}
