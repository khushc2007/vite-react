import { useEffect, useState } from "react";
import {
  addReading,
  getReadings,
  canRunPrediction,
  saveIteration,
} from "../services/dataService";
import DataTable from "../components/DataTable";

export default function LiveDashboard() {
  const [rows, setRows] = useState(getReadings());
  const [iterationName, setIterationName] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      addReading({
        time: new Date().toLocaleTimeString(),
        ph: +(7 + Math.random()).toFixed(2),
        tds: +(500 + Math.random() * 50).toFixed(1),
        turbidity: +(2 + Math.random()).toFixed(2),
      });

      setRows([...getReadings()]);
    }, 4000);

    return () => clearInterval(id);
  }, []);

  const avg = (key: "ph" | "tds" | "turbidity") =>
    rows.reduce((a, b) => a + b[key], 0) / (rows.length || 1);

  return (
    <>
      <h1>Live Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        {["ph", "tds", "turbidity"].map((k) => (
          <div
            key={k}
            style={{
              flex: 1,
              padding: "20px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <h3>{k.toUpperCase()}</h3>
            <div style={{ fontSize: "26px" }}>
              {rows.at(-1)?.[k as keyof typeof rows[0]] ?? "--"}
            </div>
            <div style={{ opacity: 0.7, fontSize: "12px" }}>
              Avg: {avg(k as any).toFixed(2)} • Updated every 4s
            </div>
          </div>
        ))}
      </div>

      <DataTable rows={rows} />

      {canRunPrediction() && (
        <div style={{ marginTop: "20px" }}>
          <input
            placeholder="Iteration name"
            value={iterationName}
            onChange={(e) => setIterationName(e.target.value)}
          />
          <button
            style={{ marginLeft: "12px" }}
            onClick={() => saveIteration(iterationName)}
          >
            Run Prediction Model
          </button>
        </div>
      )}
    </>
  );
}
