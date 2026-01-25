import { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import DatasetTable from "../components/DatasetTable";
import ChartModal from "../components/ChartModal";

/* ======================================================
   BACKEND ENDPOINTS
====================================================== */
const BACKEND_ANALYZE_URL =
  "https://water-quality-backend-8-ffv5.onrender.com/analyze-water";

const BACKEND_LATEST_URL =
  "https://water-quality-backend-8-ffv5.onrender.com/latest";

/* ======================================================
   CONFIG
====================================================== */
const INTERVAL_MS = 4000;
const MAX_ROWS = 10;

/* ======================================================
   TYPES
====================================================== */
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

/* ======================================================
   FILTRATION KNOWLEDGE LIBRARY
====================================================== */
type FiltrationVisual = {
  label: string;
  src: string;
  type: "image" | "lottie";
};

const FILTRATION_LIBRARY: Record<
  string,
  {
    title: string;
    tank: string;
    status: string;
    contamination: string[];
    method: string[];
    explanation: string;
    postUse: string[];
    risks: string[];
    mitigation: string[];
    visuals: FiltrationVisual[];
  }
> = {
  F1: {
    title: "Baseline Polishing Filtration",
    tank: "Tank A",
    status: "Reusable (with baseline filtration)",
    contamination: [
      "Trace suspended particles such as sand, silt, rust flakes, and debris",
      "Minor organic residues from surface runoff and domestic discharge",
      "Aesthetic issues including color, odor, and taste inconsistencies",
    ],
    method: ["Sediment filtration", "Activated carbon filtration"],
    explanation:
      "F1 represents lightly contaminated water that is structurally safe but aesthetically impaired. Sediment filtration removes fine particulate matter that can clog systems or reduce clarity, while activated carbon adsorption removes dissolved organic compounds, chlorine residues, and odor-causing molecules. This preserves mineral balance while improving usability.",
    postUse: [
      "Gardening and landscaping",
      "Toilet flushing",
      "Domestic cleaning",
      "Cooling water systems",
      "Light industrial washing",
    ],
    risks: [
      "Carbon saturation",
      "Sediment filter clogging",
      "Breakthrough if neglected",
    ],
    mitigation: [
      "Scheduled replacement",
      "Backwashing",
      "Parallel units",
    ],
    visuals: [],
  },
  F2: {
    title: "Moderate Suspended Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    contamination: [
      "Moderate suspended solids",
      "Visible turbidity",
      "Flow instability",
    ],
    method: [
      "Sand filtration",
      "Activated carbon",
      "Fine polishing filters",
    ],
    explanation:
      "F2 water contains suspended solids that disrupt flow and damage equipment. Staged filtration progressively removes particles and stabilizes hydraulics, preparing water for controlled reuse.",
    postUse: [
      "Agricultural irrigation",
      "Construction",
      "Cooling towers",
      "Equipment washing",
    ],
    risks: [
      "Media saturation",
      "Channeling",
    ],
    mitigation: [
      "Layered beds",
      "Periodic replacement",
    ],
    visuals: [],
  },
  F3: {
    title: "High Suspended Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    contamination: [
      "Very high suspended solids",
      "Organic load",
    ],
    method: [
      "Coagulation",
      "Flocculation",
      "Sedimentation",
      "Rapid sand filtration",
    ],
    explanation:
      "F3 water requires chemical destabilization of colloids. Coagulants form flocs which settle and are filtered. This is standard in municipal wastewater treatment.",
    postUse: [
      "Industrial reuse",
      "Construction",
      "Landscaping",
    ],
    risks: [
      "Sludge buildup",
      "Chemical overdosing",
    ],
    mitigation: [
      "Automated dosing",
      "Sludge handling",
    ],
    visuals: [],
  },
  F4: {
    title: "High Dissolved Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    contamination: [
      "High salts",
      "High conductivity",
    ],
    method: [
      "Ultrafiltration",
      "Carbon stabilization",
    ],
    explanation:
      "F4 water is dominated by dissolved contaminants. UF protects downstream membranes and stabilizes chemistry.",
    postUse: [
      "Industrial processes",
      "Cooling systems",
      "Boiler feed",
    ],
    risks: [
      "Membrane fouling",
    ],
    mitigation: [
      "Cleaning cycles",
      "Monitoring",
    ],
    visuals: [],
  },
  F5: {
    title: "Severe Dissolved Contamination",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    contamination: [
      "Extreme dissolved solids",
      "Toxic ions",
    ],
    method: [
      "Advanced RO",
      "Electrodialysis",
      "Thermal desalination",
    ],
    explanation:
      "F5 water requires molecular-level separation. These processes are energy-intensive but essential for recovery.",
    postUse: [
      "Industrial manufacturing",
      "Potable after remineralization",
    ],
    risks: [
      "High cost",
      "Brine disposal",
    ],
    mitigation: [
      "ZLD systems",
      "Energy recovery",
    ],
    visuals: [],
  },
};

/* ======================================================
   COMPONENT
====================================================== */
export default function LiveDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [activeMetric, setActiveMetric] =
    useState<"ph" | "tds" | "turbidity" | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [iterationName, setIterationName] = useState("");
  const [readyToSave, setReadyToSave] = useState(false);

  const slCounter = useRef(1);
  const clickCounter = useRef(0);

  /* ======================================================
     FALLBACK 1: URL FLAG
  ====================================================== */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("live") === "li") setMode("live");
    if (p.get("live") === "fa") setMode("simulation");
  }, []);

  /* ======================================================
     FALLBACK 2: KEYBOARD
  ====================================================== */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "L") setMode("live");
      if (e.ctrlKey && e.shiftKey && e.key === "S") setMode("simulation");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* ======================================================
     FALLBACK 3: CLICK COUNT
  ====================================================== */
  const secretClick = () => {
    clickCounter.current += 1;
    if (clickCounter.current >= 10) setMode("simulation");
  };

  /* ======================================================
     AVERAGES
  ====================================================== */
  const avg = {
    ph: rows.length ? rows.reduce((s, r) => s + r.ph, 0) / rows.length : 0,
    turbidity: rows.length
      ? rows.reduce((s, r) => s + r.turbidity, 0) / rows.length
      : 0,
    tds: rows.length ? rows.reduce((s, r) => s + r.tds, 0) / rows.length : 0,
  };

  /* ======================================================
     SIMULATION MODE
  ====================================================== */
  useEffect(() => {
    if (mode !== "simulation" || rows.length >= MAX_ROWS) return;

    const id = setInterval(() => {
      setRows((p) =>
        p.length >= MAX_ROWS
          ? p
          : [
              ...p,
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

  /* ======================================================
     RUN PREDICTION (NO AUTO SAVE)
  ====================================================== */
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

  /* ======================================================
     SAVE ITERATION
  ====================================================== */
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

  const filtrationInfo =
    prediction && FILTRATION_LIBRARY[prediction.filtrationBracket];

  return (
    <div style={{ padding: 24 }}>
      <h1 onClick={secretClick}>Live Dashboard</h1>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => setMode("simulation")}>Deploy Simulation</button>
        <button onClick={() => setMode("live")}>Deploy Live Sensors</button>
      </div>

      <DatasetTable rows={rows} />

      {rows.length === MAX_ROWS && (
        <button onClick={runPrediction}>Run Prediction Model</button>
      )}

      {filtrationInfo && (
        <div
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 12,
            background: "#052e16",
            border: "1px solid #22c55e",
            color: "#e5e7eb",
          }}
        >
          <h2>{filtrationInfo.title}</h2>
          <p>{filtrationInfo.explanation}</p>
        </div>
      )}

      {readyToSave && (
        <div style={{ marginTop: 20 }}>
          <input
            placeholder="Iteration name"
            value={iterationName}
            onChange={(e) => setIterationName(e.target.value)}
          />
          <button onClick={saveIteration}>Save Iteration</button>
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
