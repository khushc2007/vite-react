import { useNavigate } from "react-router-dom";

const cardBaseStyle: React.CSSProperties = {
  padding: 28,
  borderRadius: 18,
  background: "#020617",
  border: "1px solid #22c55e",
  color: "#ecfdf5",
  cursor: "pointer",
  transition: "all 0.25s ease",
  minHeight: 160,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: "#22c55e",
};

const descStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#c7d2fe",
};

export default function Home() {
  const navigate = useNavigate();

  const Card = ({
    title,
    description,
    to,
  }: {
    title: string;
    description: string;
    to: string;
  }) => (
    <div
      style={cardBaseStyle}
      onClick={() => navigate(to)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow =
          "0 12px 40px rgba(34,197,94,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={titleStyle}>{title}</div>
      <div style={descStyle}>{description}</div>
    </div>
  );

  return (
    <div style={{ padding: 32 }}>
      {/* HEADER */}
      <h1
        style={{
          fontSize: 32,
          fontWeight: 900,
          marginBottom: 8,
          color: "#ecfdf5",
        }}
      >
Build In Bharat
      </h1>

      <p
        style={{
          color: "#94a3b8",
          marginBottom: 32,
          maxWidth: 600,
        }}
      >
        Intelligent water monitoring, filtration classification, and reuse
        decision system built for real-world deployment.
      </p>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        <Card
          title="Live Dashboard"
          description="Monitor real-time water parameters, run simulations, trigger predictions, and classify filtration brackets instantly."
          to="/live"
        />
       

        <Card
          title="History"
          description="Review saved iterations, compare past water quality states, and analyze filtration decisions over time."
          to="/history"
        />

        <Card
          title="Settings"
          description="Configure sensors, thresholds, modes, and system behavior for live and simulated environments."
          to="/settings"
        />

        <Card
          title="Applications"
          description="Explore how Water IQ applies to aquaculture, agriculture, and industrial water reuse systems."
          to="/applications/aquaculture"
        />
      </div>
    </div>
  );
}
