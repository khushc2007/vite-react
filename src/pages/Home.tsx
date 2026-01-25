import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const cards = [
    { label: "Live Dashboard", path: "/live" },
    { label: "History", path: "/history" },
    { label: "Applications", path: "/applications" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ marginBottom: 32 }}>Home</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            onClick={() => navigate(c.path)}
            style={{
              cursor: "pointer",
              padding: 32,
              borderRadius: 20,
              background:
                "linear-gradient(135deg,#1e3a8a,#065f46)",
              color: "#ecfeff",
              fontSize: 20,
              fontWeight: 600,
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              transition: "transform 0.2s",
            }}
          >
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
