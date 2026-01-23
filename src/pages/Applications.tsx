import React from "react";

const applications = [
  {
    title: "Aquaculture & Fish Farming",
    description:
      "Continuous monitoring of pH, turbidity, and TDS to ensure optimal water conditions for fish health and growth. Alerts can prevent mass fish loss.",
  },
  {
    title: "Agricultural Irrigation",
    description:
      "Determine whether water is reusable for irrigation based on quality parameters and recommend filtration when required.",
  },
  {
    title: "Smart Water Reuse Systems",
    description:
      "Classify wastewater into reusable and non-reusable categories and guide treatment strategies for sustainable reuse.",
  },
  {
    title: "Industrial Effluent Monitoring",
    description:
      "Monitor industrial discharge water quality to ensure compliance with environmental regulations before release or reuse.",
  },
  {
    title: "Urban Water Supply Monitoring",
    description:
      "Track water quality trends in storage tanks and pipelines to detect contamination early.",
  },
];

export default function Applications() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Real-World Applications</h1>
      <p style={styles.subHeading}>
        Practical use-cases of the Water Quality Monitoring & Prediction System
      </p>

      <div style={styles.grid}>
        {applications.map((app, index) => (
          <div key={index} style={styles.card}>
            <h3 style={styles.cardTitle}>{app.title}</h3>
            <p style={styles.cardText}>{app.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===========================
   Inline Styles (Safe & Simple)
=========================== */

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "30px",
    color: "#EAEAEA",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "32px",
    marginBottom: "10px",
    fontWeight: 600,
  },
  subHeading: {
    fontSize: "15px",
    marginBottom: "30px",
    color: "#B0BEC5",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(6px)",
  },
  cardTitle: {
    fontSize: "18px",
    marginBottom: "8px",
    color: "#90CAF9",
  },
  cardText: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#CFD8DC",
  },
}
