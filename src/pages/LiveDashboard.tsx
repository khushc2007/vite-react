import { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import DatasetTable from "../components/DatasetTable";
import ChartModal from "../components/ChartModal";

const BACKEND_URL =
  "https://water-quality-backend-8-ffv5.onrender.com/analyze-water";

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
  const [isDeployed, setIsDeployed] = useState(false);

  const slCounter = useRef(1);

  /* ===============================
     SAFE AVERAGES (NEVER NULL)
  ================================ */
  const avg = {
    ph: rows.length
      ? rows.reduce((s, r) => s + r.ph, 0) / rows.length
      : 0,
    turbidity: rows.length
      ? rows.reduce((s, r) => s + r.turbidity, 0) / rows.length
      : 0,
    tds: rows.length
      ? rows.reduce((s, r) => s + r.tds, 0) / rows.length
      : 0,
  };

  /* ===============================
     SAFE POLLING (NO BACKEND CALLS)
  ================================ */
  useEffect(() => {
    if (!isDeployed) return;

    const id = setInterval(() => {
      setRows((prev) => {
        const next: Row = {
          slNo: slCounter.current++,
          time: new Date().toLocaleTimeString(),
          ph: Number((6.5 + Math.random()).toFixed(2)),
          turbidity: Number((2 + Math.random()).toFixed(2)),
          tds: Number((150 + Math.random() * 15).toFixed(1)),
        };

        return [...prev, next].slice(-MAX_ROWS);
      });
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [isDeployed]);

  /* ===============================
     RUN PREDICTION (REAL BACKEND)
  ================================ */
  const runPrediction = async () => {
    if (!rows.length) return;

    try {
      const res = await fetch(BACKEND_URL, {
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
    <div style={{ padding: 24 }}>
      {/* ===== HEADER ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1>Live Dashboard</h1>

        <button
          onClick={() => setIsDeployed(true)}
          disabled={isDeployed}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            background: isDeployed
              ? "#475569"
              : "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            cursor: isDeployed ? "not-allowed" : "pointer",
          }}
        >
          {isDeployed ? "Reading Deployed" : "Deploy Reading"}
        </button>
      </div>

      {/* ===== METRIC CARDS (ALWAYS VISIBLE) ===== */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <MetricCard
          title="pH"
          valueKey="ph"
          rows={rows}
          avg={avg.ph}
          onClick={() => rows.length && setActiveMetric("ph")}
        />
        <MetricCard
          title="TDS"
          valueKey="tds"
          rows={rows}
          avg={avg.tds}
          onClick={() => rows.length && setActiveMetric("tds")}
        />
        <MetricCard
          title="Turbidity"
          valueKey="turbidity"
          rows={rows}
          avg={avg.turbidity}
          onClick={() => rows.length && setActiveMetric("turbidity")}
        />
      </div>

      {/* ===== DATA TABLE (ALWAYS VISIBLE) ===== */}
      <DatasetTable rows={rows} />

      {/* ===== RUN MODEL ===== */}
      {rows.length === MAX_ROWS && (
        <button
          onClick={runPrediction}
          style={{
            marginTop: 24,
            padding: "14px 22px",
            fontSize: 16,
            borderRadius: 12,
            background:
              "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
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
            borderRadius: 14,
            background: "#052e16",
          }}
        >
          <h3>Prediction Result</h3>
          <p><b>Reusable:</b> {prediction.reusable}</p>
          <p><b>Tank:</b> {prediction.tank}</p>
          <p><b>Filtration Bracket:</b> {prediction.filtrationBracket}</p>
        </div>
      )}

      {/* ===== CHART MODAL ===== */}
      {activeMetric && rows.length > 0 && (
        <ChartModal
          metric={activeMetric}
          rows={rows}
          onClose={() => setActiveMetric(null)}
        />
      )}
    </div>
  );
}
