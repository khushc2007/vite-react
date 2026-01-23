import React, { useState } from "react";

/* =====================
   MOCK SENSOR DATA
===================== */
const sensorData = {
  current: { ph: 7.4, tds: 620, turbidity: 18 },
  history: [
    { time: "10:00", ph: 7.2, tds: 600, turbidity: 15 },
    { time: "10:10", ph: 7.3, tds: 610, turbidity: 16 },
    { time: "10:20", ph: 7.4, tds: 620, turbidity: 18 },
    { time: "10:30", ph: 7.5, tds: 640, turbidity: 20 },
  ],
};

/* =====================
   PREDICTION LOGIC
===================== */
function runPrediction({ ph, tds, turbidity }) {
  const reusable =
    ph >= 6.5 && ph <= 8.5 && tds <= 1000 && turbidity <= 10;

  let filtration = "F1 – Basic Filtration";
  if (tds > 1500) filtration = "F5 – Reverse Osmosis";
  else if (tds > 1000) filtration = "F4 – Carbon + UF";
  else if (turbidity > 30) filtration = "F3 – Coagulation + Sand";
  else if (turbidity > 10) filtration = "F2 – Sand + Carbon";

  return {
    reusable: reusable ? "Reusable" : "Not Reusable",
    filtration,
  };
}

/* =====================
   MAIN APP
===================== */
export default function App() {
  const [page, setPage] = useState("home");

  const prediction = runPrediction(sensorData.current);

  return (
    <div style={styles.app}>
      {page === "home" && (
        <>
          <h1 style={styles.title}>Water Quality Monitoring System</h1>

          <div style={styles.homeGrid}>
            <HomeCard title="Live Dashboard" onClick={() => setPage("live")} />
            <HomeCard title="History" onClick={() => setPage("history")} />
            <HomeCard
              title="Real-World Applications"
              onClick={() => setPage("applications")}
            />
            <HomeCard title="Settings" onClick={() => setPage("settings")} />
          </div>
        </>
      )}

      {page === "live" && (
        <>
          <BackButton onClick={() => setPage("home")} />

          <h2>Live Dashboard</h2>

          {/* Cards */}
          <div style={styles.cardRow}>
            <StatCard title="pH" value={sensorData.current.ph} />
            <StatCard title="TDS" value={sensorData.current.tds} />
            <StatCard title="Turbidity" value={sensorData.current.turbidity} />
          </div>

          {/* Table */}
          <h3>Recent Readings</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>pH</th>
                  <th>TDS</th>
                  <th>Turbidity</th>
                </tr>
              </thead>
              <tbody>
                {sensorData.history.map((r, i) => (
                  <tr key={i}>
                    <td>{r.time}</td>
                    <td>{r.ph}</td>
                    <td>{r.tds}</td>
                    <td>{r.turbidity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Prediction */}
          <h3>Prediction Model Output</h3>
          <div style={styles.predictionBox}>
            <p><strong>Status:</strong> {prediction.reusable}</p>
            <p><strong>Recommended Filtration:</strong> {prediction.filtration}</p>
          </div>
        </>
      )}

      {page === "history" && (
        <>
          <BackButton onClick={() => setPage("home")} />
          <h2>History</h2>
          <p>Saved prediction iterations will appear here.</p>
        </>
      )}

      {page === "applications" && (
        <>
          <BackButton onClick={() => setPage("home")} />
          <h2>Real-World Applications</h2>
          <p>• Greywater reuse</p>
          <p>• Agriculture irrigation</p>
          <p>• Aquaculture monitoring</p>
        </>
      )}

      {page === "settings" && (
        <>
          <BackButton onClick={() => setPage("home")} />
          <h2>Settings</h2>
          <p>Configuration options will appear here.</p>
        </>
      )}
    </div>
  );
}

/* =====================
   SMALL COMPONENTS
===================== */
function HomeCard({ title, onClick }) {
  return (
    <div style={styles.homeCard} onClick={onClick}>
      <h3>{title}</h3>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={styles.statCard}>
      <h4>{title}</h4>
      <p style={{ fontSize: "26px", color: "#38bdf8" }}>{value}</p>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={styles.backBtn}>
      ← Back
    </button>
  );
}

/* =====================
   STYLES
===================== */
const styles = {
  app: {
    padding: "30px",
    fontFamily: "Segoe UI, sans-serif",
    background: "#0b0f14",
    color: "#e5e7eb",
    minHeight: "100vh",
  },
  title: { marginBottom: "30px" },
  homeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "30px",
  },
  homeCard: {
    background: "#111827",
    padding: "50px",
    textAlign: "center",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "18px",
  },
  cardRow: { display: "flex", gap: "20px", marginBottom: "20px" },
  statCard: {
    flex: 1,
    background: "#111827",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },
  tableWrapper: {
    maxHeight: "200px",
    overflowY: "auto",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  predictionBox: {
    background: "#020617",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "10px",
  },
  backBtn: {
    marginBottom: "20px",
    background: "none",
    border: "1px solid #38bdf8",
    color: "#38bdf8",
    padding: "6px 12px",
    cursor: "pointer",
  },
};
