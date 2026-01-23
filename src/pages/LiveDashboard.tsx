import { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import DatasetTable from "../components/DatasetTable";
import ChartModal from "../components/ChartModal";

const BACKEND_URL = "https://water-quality-backend-8-ffv5.onrender.com/analyze-water"; // 🔴 CHANGE THIS
const INTERVAL_MS = 4000;
const MAX_ROWS = 10;

type Row = {
  slNo: number;
  time: string;
  ph: number;
  turbidity: number;
  tds: number;
};

export default function LiveDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [activeMetric, setActiveMetric] = useState<
    "ph" | "tds" | "turbidity" | null
  >(null);
  const [prediction, setPrediction] = useState<any>(null);

  const slCounter = useRef(1); // prevents reset on re-render

  /* ===============================
     CONTINUOUS BACKEND POLLING
  ================================ */
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/latest`);
        const data = await res.json();

        if (!data) return;

        setRows((prev) => {
          const next: Row = {
            slNo: slCounter.current++,
            time: data.time,
            ph: data.ph,
            turbidity: data.turbidity,
            tds: data.tds,
          };

          const updated = [...prev, next];
          return updated.slice(-MAX_ROWS);
        });
      } catch (err) {
        console.error("Backend not reachable", err);
      }
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  /* ===============================
     AVERAGES (DERIVED, NOT STORED)
  ================================ */
  const avg = rows.length
    ? {
        ph:
          rows.reduce((s, r) => s + r.ph, 0) / rows.length,
        turbidity:
          rows.reduce((s, r) => s + r.turbidity, 0) /
          rows.length,
        tds:
          rows.reduce((s, r) => s + r.tds, 0) / rows.length,
      }
    : null;

  /* ===============================
     RUN PREDICTION MODEL
  ================================ */
  const runPrediction = async () => {
    if (!avg) return;

    try {
      const res = await fetch(`${BACKEND_URL}/analyze-water`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(avg),
      });

      const result = await res.json();
      setPrediction(result);
    } catch (err) {
      console.error("Prediction failed", err);
    }
  };

  return (
    <div>
      <h1>Live Dashboard</h1>

      {/* ===== METRIC CARDS ===== */}
      {avg && (
        <div style={{ display: "flex", gap: 16 }}>
          <MetricCard
            title="pH"
            valueKey="ph"
            rows={rows}
            avg={avg.ph}
            onClick={() => setActiveMetric("ph")}
          />
          <MetricCard
            title="TDS"
            valueKey="tds"
            rows={rows}
            avg={avg.tds}
            onClick={() => setActiveMetric("tds")}
          />
          <MetricCard
            title="Turbidity"
            valueKey="turbidity"
            rows={rows}
            avg={avg.turbidity}
            onClick={() => setActiveMetric("turbidity")}
          />
        </div>
      )}

      {/* ===== DATA TABLE ===== */}
      <DatasetTable rows={rows} />

      {/* ===== RUN MODEL ===== */}
      {rows.length === MAX_ROWS && (
        <button
          onClick={runPrediction}
          style={{
            marginTop: 20,
            padding: "14px 22px",
            fontSize: "16px",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Run Prediction Model
        </button>
      )}

      {/* ===== PREDICTION RESULT ===== */}
      {prediction && (
        <div
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 12,
            background: "#052e16",
          }}
        >
          <h3>Prediction Result</h3>
          <p><b>Reusable:</b> {prediction.reusable}</p>
          <p><b>Tank:</b> {prediction.tank}</p>
          <p><b>Filtration Bracket:</b> {prediction.filtrationBracket}</p>
          {prediction.filtrationMethod && (
            <p><b>Method:</b> {prediction.filtrationMethod}</p>
          )}
        </div>
      )}

      {/* ===== CHART MODAL ===== */}
      {activeMetric && (
        <ChartModal
          metric={activeMetric}
          rows={rows}
          onClose={() => setActiveMetric(null)}
        />
      )}
    </div>
  );
}
