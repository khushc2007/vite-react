import { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import DatasetTable from "../components/DatasetTable";
import ChartModal from "../components/ChartModal";

const BACKEND_ANALYZE_URL =
  "https://water-quality-backend-8-ffv5.onrender.com/analyze-water";

// (future-ready)
const BACKEND_LATEST_URL =
  "https://water-quality-backend-8-ffv5.onrender.com/latest";

const INTERVAL_MS = 4000;
const MAX_ROWS = 10;

type Row = {
  slNo: number;
  time: string;
  ph: number;
  turbidity: number;
  tds: number;
};

type Mode = "idle" | "simulation" | "live";

export default function LiveDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [activeMetric, setActiveMetric] = useState<
    "ph" | "tds" | "turbidity" | null
  >(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [mode, setMode] = useState<Mode>("idle");

  const slCounter = useRef(1);

  /* ===============================
     NORMALIZATION (SINGLE GATE)
  ================================ */
  const normalizeRow = (raw: any): Row | null => {
    if (
      typeof raw.ph !== "number" ||
      typeof raw.tds !== "number" ||
      typeof raw.turbidity !== "number"
    ) {
      return null;
    }

    return {
      slNo: slCounter.current++,
      time: raw.time ?? new Date().toLocaleTimeString(),
      ph: raw.ph,
      turbidity: raw.turbidity,
      tds: raw.tds,
    };
  };

  /* ===============================
     SAFE AVERAGES
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
     SIMULATION MODE (STOP AT 10)
  ================================ */
  useEffect(() => {
    if (mode !== "simulation") return;

    if (rows.length >= MAX_ROWS) return; // ⛔ HARD STOP

    const id = setInterval(() => {
      setRows((prev) => {
        if (prev.length >= MAX_ROWS) return prev; // ⛔ DOUBLE SAFETY

        const simulated = normalizeRow({
          ph: Number((6.5 + Math.random()).toFixed(2)),
          turbidity: Number((2 + Math.random()).toFixed(2)),
          tds: Number((150 + Math.random() * 15).toFixed(1)),
        });

        if (!simulated) return prev;

        return [...prev, simulated];
      });
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [mode, rows.length]);

  /* ===============================
     LIVE BACKEND MODE (STOP AT 10)
  ================================ */
  useEffect(() => {
    if (mode !== "live") return;

    if (rows.length >= MAX_ROWS) return; // ⛔ HARD STOP

    const id = setInterval(async () => {
      try {
        const res = await fetch(BACKEND_LATEST_URL);
        if (!res.ok) return;

        const raw = await res.json();
        const normalized = normalizeRow(raw);
        if (!normalized) return;

        setRows((prev) => {
          if (prev.length >= MAX_ROWS) return prev; // ⛔ DOUBLE SAFETY
          return [...prev, normalized];
        });
      } catch {
        // silently ignore to keep UI alive
      }
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [mode, rows.length]);

  /* ===============================
     RUN PREDICTION
  ================================ */
  const runPrediction = async () => {
    if (!rows.length) return;

    try {
      const res = await fetch(BACKEND_ANALYZE_URL, {
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

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setMode("simulation")}
            disabled={mode === "simulation"}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              background:
                mode === "simulation"
                  ? "#475569"
                  : "linear-gradient(135deg,#22c55e,#16a34a)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor:
                mode === "simulation"
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Deploy Simulation
          </button>

          <button
            onClick={() => setMode("live")}
            disabled={mode === "live"}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              background:
                mode === "live"
                  ? "#475569"
                  : "linear-gradient(135deg,#0ea5e9,#0284c7)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor:
                mode === "live"
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Deploy Live Sensors
          </button>
        </div>
      </div>

      {/* ===== METRIC CARDS ===== */}
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
          onClick={() =>
            rows.length && setActiveMetric("turbidity")
          }
        />
      </div>

      {/* ===== DATA TABLE ===== */}
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
          <p>
            <b>Filtration Bracket:</b>{" "}
            {prediction.filtrationBracket}
          </p>
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
