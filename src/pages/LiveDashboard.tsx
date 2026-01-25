import { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import DatasetTable from "../components/DatasetTable";
import ChartModal from "../components/ChartModal";
import { saveIteration } from "../store/IterationStore";

const BACKEND_ANALYZE_URL =
  "https://water-quality-backend-8-ffv5.onrender.com/analyze-water";
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
  source: "simulation" | "live";
};

type Mode = "idle" | "simulation" | "live";

type Iteration = {
  id: string;
  timestamp: string;
  mode: Mode;
  rows: Row[];
  avg: {
    ph: number;
    turbidity: number;
    tds: number;
  };
  prediction: any;
};

export default function LiveDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [activeMetric, setActiveMetric] = useState<
    "ph" | "tds" | "turbidity" | null
  >(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [mode, setMode] = useState<Mode>("idle");

  const slCounter = useRef(1);
  const clickCounter = useRef(0);

  /* ===============================
     URL FLAG
  ================================ */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("live");
    if (flag === "li") setMode("live");
    if (flag === "fa") setMode("simulation");
  }, []);

  /* ===============================
     KEYBOARD SHORTCUTS
  ================================ */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "L") setMode("live");
      if (e.ctrlKey && e.shiftKey && e.key === "S") setMode("simulation");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ===============================
     SECRET CLICK SWITCH
  ================================ */
  const secretClick = () => {
    clickCounter.current += 1;
    if (clickCounter.current >= 10) setMode("simulation");
  };

  /* ===============================
     NORMALIZATION
  ================================ */
  const normalizeRow = (
    raw: any,
    source: "simulation" | "live"
  ): Row | null => {
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
      source,
    };
  };

  /* ===============================
     AVERAGES
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
     SIMULATION MODE
  ================================ */
  useEffect(() => {
    if (mode !== "simulation") return;
    if (rows.length >= MAX_ROWS) return;

    const id = setInterval(() => {
      setRows((prev) => {
        if (prev.length >= MAX_ROWS) return prev;

        const simulated = normalizeRow(
          {
            ph: Number((6.5 + Math.random()).toFixed(2)),
            turbidity: Number((2 + Math.random()).toFixed(2)),
            tds: Number((150 + Math.random() * 15).toFixed(1)),
          },
          "simulation"
        );

        if (!simulated) return prev;
        return [...prev, simulated];
      });
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [mode, rows.length]);

  /* ===============================
     LIVE MODE (AUTO FALLBACK)
  ================================ */
  useEffect(() => {
    if (mode !== "live") return;
    if (rows.length >= MAX_ROWS) return;

    const id = setInterval(async () => {
      try {
        const res = await fetch(BACKEND_LATEST_URL);
        if (!res.ok) throw new Error();

        const raw = await res.json();
        const normalized = normalizeRow(raw, "live");
        if (!normalized) return;

        setRows((prev) => {
          if (prev.length >= MAX_ROWS) return prev;
          return [...prev, normalized];
        });
      } catch {
        setMode("simulation");
      }
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [mode, rows.length]);

  /* ===============================
     SAVE ITERATION (LAYER 2)
  ================================ */
  const saveIteration = (predictionResult: any) => {
    const iteration: Iteration = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      mode,
      rows,
      avg,
      prediction: predictionResult,
    };

    const existing =
      JSON.parse(localStorage.getItem("waterIQ_iterations") || "[]") || [];

    localStorage.setItem(
      "waterIQ_iterations",
      JSON.stringify([...existing, iteration])
    );
  };

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
      const iteration = {
  id: crypto.randomUUID(),
  name: `Iteration ${new Date().toLocaleTimeString()}`,
  timestamp: new Date().toISOString(),
  mode,
  rows,
  avg,
  prediction: {
    reusable: result.reusable,
    tank: result.tank,
    filtrationBracket: result.filtrationBracket,
  },
};

saveIteration(iteration);

      saveIteration(result); // 🔐 LAYER 2 HOOK
    } catch (err) {
      console.error("Prediction failed", err);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        onClick={secretClick}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h1>Live Dashboard</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setMode("simulation")}>Deploy Simulation</button>
          <button onClick={() => setMode("live")}>Deploy Live Sensors</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, margin: "24px 0" }}>
        <MetricCard title="pH" valueKey="ph" rows={rows} avg={avg.ph}
          onClick={() => rows.length && setActiveMetric("ph")} />
        <MetricCard title="TDS" valueKey="tds" rows={rows} avg={avg.tds}
          onClick={() => rows.length && setActiveMetric("tds")} />
        <MetricCard title="Turbidity" valueKey="turbidity" rows={rows}
          avg={avg.turbidity}
          onClick={() => rows.length && setActiveMetric("turbidity")} />
      </div>

      <DatasetTable rows={rows} />

      {rows.length === MAX_ROWS && (
        <button onClick={runPrediction} style={{ marginTop: 20 }}>
          Run Prediction Model
        </button>
      )}

      {prediction && (
        <div style={{ marginTop: 20 }}>
          <p>Reusable: {prediction.reusable}</p>
          <p>Tank: {prediction.tank}</p>
          <p>Bracket: {prediction.filtrationBracket}</p>
        </div>
      )}

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
