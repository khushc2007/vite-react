import { useNavigate } from "react-router-dom";

export default function Applications() {
  const navigate = useNavigate();

  const cardStyle = {
    background: "#20344a",
    borderRadius: "14px",
    padding: "24px",
    cursor: "pointer",
    border: "1px solid #2f4a63",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  const cards = [
    {
      title: "Aquaculture",
      icon: "🐟",
      desc: "Water quality monitoring for fish farms, tanks, and aquaculture ecosystems.",
      path: "/applications/aquaculture",
    },
    {
      title: "Agriculture",
      icon: "🌱",
      desc: "Irrigation and soil-water quality monitoring for crops and farming systems.",
      path: "/applications/agriculture",
    },
    {
      title: "Industrial",
      icon: "🏭",
      desc: "Industrial wastewater monitoring, reuse analysis, and compliance checks.",
      path: "/applications/industrial",
    },
  ];

  return (
    <div>
      <h1>Real-World Applications</h1>
      <p style={{ opacity: 0.7, marginBottom: "24px" }}>
        Explore how water quality monitoring applies across different industries.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {cards.map((c) => (
          <div
            key={c.title}
            style={cardStyle}
            onClick={() => navigate(c.path)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(0,0,0,0.35)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "none")
            }
          >
            <div style={{ fontSize: "36px" }}>{c.icon}</div>
            <h3 style={{ marginTop: "12px" }}>{c.title}</h3>
            <p style={{ opacity: 0.75, fontSize: "14px" }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
