import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------------- FILTRATION MAP ---------------- */

const FILTRATION_MAP = {
  F1: {
    label: "Reusable",
    color: "#22c55e",
    reason: "All parameters within safe limits.",
  },
  F2: {
    label: "Non-Reusable (Low Treatment)",
    color: "#38bdf8",
    reason: "Minor deviation, light filtration required.",
  },
  F3: {
    label: "Non-Reusable (Moderate Treatment)",
    color: "#facc15",
    reason: "High suspended solids or TDS.",
  },
  F4: {
    label: "Non-Reusable (Heavy Treatment)",
    color: "#fb923c",
    reason: "Multiple parameters exceed limits.",
  },
  F5: {
    label: "Hazardous",
    color: "#ef4444",
    reason: "Unsafe water, high contamination.",
  },
};

/* ---------------- HELPERS ---------------- */

const randomReading = () => ({
  time: new Date().toLocaleTimeString(),
  pH: +(6.8 + Math.random() * 0.6).toFixed(2),
  tds: Math.floor(380 + Math.random() * 120),
  turbidity: +(1.8 + Math.random() * 2.5).toFixed(2),
  temp: +(25 + Math.random() * 2).toFixed(1),
});

const calculateAverage = (data, key) =>
  +(data.reduce((a, b) => a + b[key], 0) / data.length).toFixed(2);

const decideFiltration = (avg) => {
  if (avg.turbidity < 2 && avg.tds < 400 && avg.pH >= 6.5 && avg.pH <= 7.5)
    return "F1";
  if (avg.turbidity < 3) return "F2";
  if (avg.turbidity < 5) return "F3";
  if (avg.turbidity < 8) return "F4";
  return "F5";
};

/* ---------------- MAIN APP ---------------- */

export default function App() {
  const [page, setPage] = useState("HOME");
  const [data, setData] = useState([]);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("history") || "[]")
  );
  const [chartKey, setChartKey] = useState(null);
  const [iterationName, setIterationName] = useState("");

  /* Simulate live data */
  useEffect(() => {
    if (page !== "LIVE") return;
    const id = setInterval(() => {
      setData((d) => [...d.slice(-49), randomReading()]);
    }, 2000);
    return () => clearInterval(id);
  }, [page]);

  const averages =
    data.length > 0
      ? {
          pH: calculateAverage(data, "pH"),
          tds: calculateAverage(data, "tds"),
          turbidity: calculateAverage(data, "turbidity"),
          temp: calculateAverage(data, "temp"),
        }
      : null;

  const filtration = averages ? decideFiltration(averages) : null;

  const saveIteration = () => {
    if (!iterationName || !averages) return;
    const entry = {
      name: iterationName,
      time: new Date().toLocaleString(),
      averages,
      filtration,
    };
    const updated = [...history, entry];
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
    setIterationName("");
  };

  /* ---------------- UI ---------------- */

  return (
    <div style={styles.app}>
      {page === "HOME" && (
        <div style={styles.grid}>
          {["LIVE", "HISTORY", "APPS", "SETTINGS"].map((p) => (
            <div key={p} style={styles.tile} onClick={() => setPage(p)}>
              {p}
            </div>
          ))}
        </div>
      )}

      {page === "LIVE" && (
        <>
          <button onClick={() => setPage("HOME")}>← Back</button>

          <div style={styles.cards}>
            {["pH", "tds", "turbidity", "temp"].map((k) => (
              <div
                key={k}
                style={styles.card}
                onClick={() => setChartKey(k)}
              >
                <h3>{k.toUpperCase()}</h3>
                <p>{data.at(-1)?.[k] ?? "--"}</p>
                <small>Avg: {averages?.[k] ?? "--"}</small>
              </div>
            ))}
          </div>

          <div style={styles.table}>
            <table width="100%">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Time</th>
                  <th>pH</th>
                  <th>TDS</th>
                  <th>Turb</th>
                  <th>Temp</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{r.time}</td>
                    <td>{r.pH}</td>
                    <td>{r.tds}</td>
                    <td>{r.turbidity}</td>
                    <td>{r.temp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {averages && (
            <div style={styles.summary}>
              <h3>Prediction</h3>
              <p>
                Filtration Class:{" "}
                <span style={{ color: FILTRATION_MAP[filtration].color }}>
                  {filtration}
                </span>
              </p>
              <p>{FILTRATION_MAP[filtration].reason}</p>

              <input
                placeholder="Iteration name"
                value={iterationName}
                onChange={(e) => setIterationName(e.target.value)}
              />
              <button onClick={saveIteration}>Save Iteration</button>
            </div>
          )}
        </>
      )}

      {page === "HISTORY" && (
        <>
          <button onClick={() => setPage("HOME")}>← Back</button>
          {history.map((h, i) => (
            <div key={i} style={styles.historyCard}>
              <h4>{h.name}</h4>
              <p>{h.time}</p>
              <p>Filtration: {h.filtration}</p>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(JSON.stringify(h, null, 2))
                }
              >
                Export
              </button>
            </div>
          ))}
        </>
      )}

      {chartKey && (
        <div style={styles.modal} onClick={() => setChartKey(null)}>
          <div style={styles.modalBox}>
            <h3>{chartKey.toUpperCase()} vs Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  dataKey={chartKey}
                  stroke="#38bdf8"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  app: {
    background: "#0e0e11",
    color: "#e5e7eb",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "Inter, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 20,
  },
  tile: {
    background: "#111827",
    padding: 60,
    textAlign: "center",
    fontSize: 20,
    cursor: "pointer",
    borderRadius: 12,
  },
  cards: {
    display: "flex",
    gap: 16,
    marginTop: 20,
  },
  card: {
    flex: 1,
    background: "#111827",
    padding: 20,
    borderRadius: 12,
    cursor: "pointer",
  },
  table: {
    marginTop: 20,
    maxHeight: 200,
    overflowY: "auto",
    background: "#020617",
    borderRadius: 8,
  },
  summary: {
    marginTop: 20,
    background: "#111827",
    padding: 20,
    borderRadius: 12,
  },
  historyCard: {
    background: "#111827",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    background: "#020617",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
};
