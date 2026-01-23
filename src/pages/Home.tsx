import React from "react";

type HomeProps = {
  navigate: (page: string) => void;
};

export default function Home({ navigate }: HomeProps) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Water Quality Monitoring System</h1>

      <div style={styles.grid}>
        <div
          style={styles.card}
          onClick={() => navigate("live")}
        >
          <h2>Live Dashboard</h2>
          <p>Real-time sensor monitoring</p>
        </div>

        <div
          style={styles.card}
          onClick={() => navigate("history")}
        >
          <h2>History</h2>
          <p>Saved iterations & reports</p>
        </div>

        <div
          style={styles.card}
          onClick={() => navigate("applications")}
        >
          <h2>Real World Applications</h2>
          <p>Use-cases & filtration domains</p>
        </div>

        <div
          style={styles.card}
          onClick={() => navigate("settings")}
        >
          <h2>Settings</h2>
          <p>Research, FAQ, data control</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#e5e7eb",
    padding: "40px",
  },
  title: {
    textAlign: "center",
    marginBottom: "40px",
    fontSize: "32px",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "30px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  card: {
    background: "#1e293b",
    borderRadius: "14px",
    padding: "30px",
    cursor: "pointer",
    transition: "all 0.25s ease",
    border: "1px solid #334155",
  },
};
