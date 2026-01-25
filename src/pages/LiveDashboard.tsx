import { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import DatasetTable from "../components/DatasetTable";
import ChartModal from "../components/ChartModal";

/* ================= BACKEND ================= */
const BACKEND_ANALYZE_URL =
  "https://water-quality-backend-8-ffv5.onrender.com/analyze-water";
const BACKEND_LATEST_URL =
  "https://water-quality-backend-8-ffv5.onrender.com/latest";

/* ================= CONFIG ================= */
const INTERVAL_MS = 4000;
const MAX_ROWS = 10;

/* ================= TYPES ================= */
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
  name: string;
  timestamp: string;
  mode: Mode;
  rows: Row[];
  avg: {
    ph: number;
    turbidity: number;
    tds: number;
  };
  prediction: {
    reusable: string;
    tank: string;
    filtrationBracket: string;
  };
};

/* ================= FILTRATION LIBRARY ================= */
const FILTRATION_LIBRARY: Record<string, any> = {
  F1: {
    title: "Baseline Polishing Filtration",
    tank: "Tank A",
    status: "Reusable (with baseline filtration)",
    explanation:
      "F1 represents lightly contaminated water that is structurally safe but aesthetically impaired. Sediment filtration removes fine particulate matter that can clog systems or reduce clarity, while activated carbon adsorption removes dissolved organic compounds, chlorine residues, and odor-causing molecules. This preserves mineral balance while improving usability.",
  },
  F2: {
    title: "Moderate Suspended Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    explanation:
      "F2 water contains suspended solids that disrupt flow and damage equipment. Staged filtration progressively removes particles and stabilizes hydraulics, preparing water for controlled reuse.",
  },
  F3: {
    title: "High Suspended Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    explanation:
      "F3 water requires coagulation, flocculation, sedimentation, and filtration. This process is standard in municipal and industrial wastewater treatment.",
  },
  F4: {
    title: "High Dissolved Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    explanation:
      "F4 water is dominated by dissolved contaminants. Ultrafiltration stabilizes chemistry and protects downstream membranes.",
  },
  F5: {
    title: "Severe Dissolved Contamination",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    explanation:
      "F5 water requires molecular-level separation using advanced membrane or thermal processes.",
  },
};

/* ================= COMPONENT ================= */
export default function LiveDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [mode, setMode] = useState<Mode>("idle");
  const [prediction, setPrediction] = useState<any>(null);
  const [activeMetric, setActiveMetric] =
    useState<"ph" | "tds" | "turbidity" | null>(null);

  const [iterationName, setIterationName] = useState("");
  const [readyToSave, setReadyToSave] = useState(false);

  const slCounter = useRef(1);
  const clickCounter = useRef(0);

  /* ========== FALLBACK 1: URL FLAG ========== */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("live") === "li") setMode("live");
    if (p.get("live") === "fa") setMode("simulation");
  }, []);

  /* ========== FALLBACK 2: KEYBOARD (FIXED) ========== */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === "KeyL") setMode("live");
      if (e.ctrlKey && e.shiftKey && e.code === "KeyS") setMode("simulation");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ========== FALLBACK 3: SECRET CLICK ========== */
  const secretClick = () => {
    clickCounter.current += 1;
    if (clickCounter.current >= 10) {
      setMode("simulation");
      clickCounter.current = 0;
    }
  };

  /* ========== AVERAGES ========== */
  const avg = {
    ph: rows.reduce((s, r) => s + r.ph, 0) / (rows.length || 1),
    turbidity: rows.reduce((s, r) => s + r.turbidity, 0) / (rows.length || 1),
    tds: rows.reduce((s, r) => s + r.tds, 0) / (rows.length || 1),
  };

  /* ========== SIMULATION MODE ========== */
  useEffect(() => {
    if (mode !== "simulation" || rows.length >= MAX_ROWS) return;

    const id = setInterval(() => {
      setRows((prev) =>
        prev.length >= MAX_ROWS
          ? prev
          : [
              ...prev,
              {
                slNo: slCounter.current++,
                time: new Date().toLocaleTimeString(),
                ph: +(6.5 + Math.random()).toFixed(2),
                turbidity: +(2 + Math.random()).toFixed(2),
                tds: +(150 + Math.random() * 15).toFixed(1),
                source: "simulation",
              },
            ]
      );
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [mode, rows.length]);

  /* ========== LIVE MODE + AUTO FALLBACK ========== */
  useEffect(() => {
    if (mode !== "live" || rows.length >= MAX_ROWS) return;

    const id = setInterval(async () => {
      try {
        const res = await fetch(BACKEND_LATEST_URL);
        if (!res.ok) throw new Error();

        const d = await res.json();
        setRows((prev) =>
          prev.length >= MAX_ROWS
            ? prev
            : [
                ...prev,
                {
                  slNo: slCounter.current++,
                  time: new Date().toLocaleTimeString(),
                  ph: d.ph,
                  turbidity: d.turbidity,
                  tds: d.tds,
                  source: "live",
                },
              ]
        );
      } catch {
        setMode("simulation");
      }
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [mode, rows.length]);

  /* ========== RUN PREDICTION ========== */
  const runPrediction = async () => {
    const res = await fetch(BACKEND_ANALYZE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(avg),
    });
    const result = await res.json();
    setPrediction(result);
    setReadyToSave(true);
  };

  /* ========== SAVE ITERATION ========== */
  const saveIteration = () => {
    const iteration: Iteration = {
      id: crypto.randomUUID(),
      name: iterationName || `Iteration ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      mode,
      rows,
      avg,
      prediction,
    };

    const existing = JSON.parse(
      localStorage.getItem("waterIQ_iterations") || "[]"
    );

    localStorage.setItem(
      "waterIQ_iterations",
      JSON.stringify([...existing, iteration])
    );

    setReadyToSave(false);
    setIterationName("");
  };

  const filtration =
    prediction && FILTRATION_LIBRARY[prediction.filtrationBracket];

  /* ================= UI ================= */
  return (
    <div style={{ padding: 24 }}>
      <h1 onClick={secretClick} style={{ cursor: "pointer" }}>
        Live Dashboard
      </h1>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn-green" onClick={() => setMode("simulation")}>
          Deploy Simulation
        </button>
        <button className="btn-green" onClick={() => setMode("live")}>
          Deploy Live Sensors
        </button>
      </div>

      <DatasetTable rows={rows} />

      {rows.length === MAX_ROWS && (
        <button className="btn-green" onClick={runPrediction}>
          Run Prediction Model
        </button>
      )}

      {filtration && (
        <div className="neon-box">
          <h2>{filtration.title}</h2>
          <p><b>Tank:</b> {filtration.tank}</p>
          <p><b>Status:</b> {filtration.status}</p>
          <p>{filtration.explanation}</p>
        </div>
      )}

      {readyToSave && (
        <div className="neon-box">
          <input
            placeholder="Iteration name"
            value={iterationName}
            onChange={(e) => setIterationName(e.target.value)}
          />
          <button className="btn-green" onClick={saveIteration}>
            Save Iteration
          </button>
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
