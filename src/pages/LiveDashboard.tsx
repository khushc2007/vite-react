import { useEffect } from "react";
import MetricCard from "../components/MetricCard";
import DataTable from "../components/DataTable";
import { Reading } from "../App";

const MAX_ROWS = 30;
const INTERVAL_SECONDS = 10;
const MIN_FOR_PREDICTION = 15;

export default function LiveDashboard({
  readings,
  setReadings,
  openChart,
}: {
  readings: Reading[];
  setReadings: React.Dispatch<React.SetStateAction<Reading[]>>;
  openChart: (k: "ph" | "tds" | "turbidity") => void;
}) {
  useEffect(() => {
    const id = setInterval(() => {
      setReadings(prev => {
        const next: Reading = {
          sl: prev.length + 1,
          time: new Date().toLocaleTimeString(),
          ph: 7 + Math.random(),
          tds: 300 + Math.random() * 20,
          turbidity: 3 + Math.random(),
        };
        return [...prev, next].slice(-MAX_ROWS);
      });
    }, INTERVAL_SECONDS * 1000);

    return () => clearInterval(id);
  }, []);

  const latest = readings[readings.length - 1];

  return (
    <>
      <h2 style={{ color: "#e5e7eb" }}>Live Dashboard</h2>

      {latest && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <MetricCard
            label="pH"
            value={latest.ph}
            readings={readings}
            metric="ph"
            onClick={() => openChart("ph")}
          />
          <MetricCard
            label="TDS"
            value={latest.tds}
            readings={readings}
            metric="tds"
            onClick={() => openChart("tds")}
          />
          <MetricCard
            label="Turbidity"
            value={latest.turbidity}
            readings={readings}
            metric="turbidity"
            onClick={() => openChart("turbidity")}
          />
        </div>
      )}

      <DataTable readings={readings} />

      <button
        disabled={readings.length < MIN_FOR_PREDICTION}
        onClick={() => runPrediction(readings, setReadings)}
        style={{ marginTop: 20 }}
      >
        Run Prediction Model
      </button>
    </>
  );
}

function runPrediction(readings: Reading[], setReadings: any) {
  if (readings.length < 15) return;

  const name = prompt("Enter iteration name");
  if (!name) return;

  const avg = {
    ph: readings.reduce((a, r) => a + r.ph, 0) / readings.length,
    tds: readings.reduce((a, r) => a + r.tds, 0) / readings.length,
    turbidity: readings.reduce((a, r) => a + r.turbidity, 0) / readings.length,
  };

  const history = JSON.parse(localStorage.getItem("history") || "[]");
  history.unshift({ name, avg, time: new Date().toISOString() });
  localStorage.setItem("history", JSON.stringify(history));

  setReadings([]);
}
