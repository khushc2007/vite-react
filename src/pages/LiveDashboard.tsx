import { useEffect } from "react";
import MetricCard from "../components/MetricCard";
import DataTable from "../components/DataTable";
import { Reading } from "../App";

const MAX_ROWS = 30;

export default function LiveDashboard({
  readings,
  setReadings,
  openChart,
  openSave,
}: {
  readings: Reading[];
  setReadings: any;
  openChart: any;
  openSave: () => void;
}) {
  useEffect(() => {
    const id = setInterval(() => {
      setReadings((prev: Reading[]) => {
        const next: Reading = {
          sl: prev.length + 1,
          time: new Date().toLocaleTimeString(),
          ph: +(7 + Math.random()).toFixed(2),
          tds: +(300 + Math.random() * 200).toFixed(1),
          turbidity: +(2 + Math.random()).toFixed(2),
        };
        return [...prev, next].slice(-MAX_ROWS);
      });
    }, 10000);

    return () => clearInterval(id);
  }, []);

  const latest = readings[readings.length - 1];

  return (
    <>
      <h1>Live Dashboard</h1>

      {latest && (
        <div style={{ display: "flex", gap: 16 }}>
          <MetricCard label="pH" metric="ph" readings={readings} onClick={openChart} />
          <MetricCard label="TDS" metric="tds" readings={readings} onClick={openChart} />
          <MetricCard label="Turbidity" metric="turbidity" readings={readings} onClick={openChart} />
        </div>
      )}

      <DataTable readings={readings} />

      <button
        onClick={openSave}
        disabled={readings.length < MAX_ROWS}
        style={{ marginTop: 20 }}
      >
        Run Prediction Model
      </button>

      {readings.length < MAX_ROWS && (
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Prediction available after {MAX_ROWS} readings
        </p>
      )}
    </>
  );
}
