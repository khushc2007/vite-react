import React from "react";

type Props = {
  navigate: (page: string) => void;
};

export default function ApplicationsHome({ navigate }: Props) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Real-World Applications</h1>

      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigate("aquaculture")}>
          Aquaculture
        </div>

        <div style={styles.card} onClick={() => navigate("agriculture")}>
          Agriculture
        </div>

        <div style={styles.card} onClick={() => navigate("industrial")}>
          Industrial Use
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 32,
    color: "#e6f1ff",
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#143a52",
    padding: 24,
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 18,
    textAlign: "center",
  },
};
