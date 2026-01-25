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
   CONFIGURATION
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
   (UI ENRICHMENT LAYER)
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
    method: [
      "Sediment filtration",
      "Activated carbon filtration",
    ],
    explanation:
      "F1 represents lightly contaminated water that is structurally safe but aesthetically impaired. Sediment filtration removes fine particulate matter that can clog systems or reduce clarity, while activated carbon adsorption removes dissolved organic compounds, chlorine residues, and odor-causing molecules. This process preserves the natural mineral balance of water while improving usability. It is widely accepted as baseline polishing for safe non-potable reuse systems.",
    postUse: [
      "Gardening and landscaping",
      "Toilet flushing",
      "Domestic cleaning",
      "Cooling water for HVAC systems",
      "Light industrial washing",
    ],
    risks: [
      "Carbon saturation over prolonged usage",
      "Sediment filter clogging",
      "Breakthrough of fine particles if maintenance is neglected",
    ],
    mitigation: [
      "Scheduled filter replacement",
      "Backwashing mechanisms",
      "Parallel filtration units for redundancy",
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
      "Particulate-induced flow instability",
    ],
    method: [
      "Sand filtration",
      "Activated carbon filtration",
      "Fine polishing filters",
    ],
    explanation:
      "F2 water contains suspended solids at levels that interfere with hydraulic performance and mechanical equipment. A staged filtration process removes progressively smaller particles, stabilizing flow characteristics and preventing abrasion or clogging. This treatment prepares water for controlled reuse where minor residual contamination is acceptable.",
    postUse: [
      "Agricultural irrigation",
      "Construction activities",
      "Cooling towers",
      "Equipment and vehicle washing",
    ],
    risks: [
      "Sand bed saturation",
      "Channel formation in filter media",
    ],
    mitigation: [
      "Layered filter beds",
      "Periodic media replacement",
      "Modular filtration design",
    ],
    visuals: [],
  },

  F3: {
    title: "High Suspended Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    contamination: [
      "Very high suspended solids",
      "Organic and biological particulate load",
    ],
    method: [
      "Coagulation",
      "Flocculation",
      "Sedimentation",
      "Rapid sand filtration",
    ],
    explanation:
      "F3 water requires chemical destabilization of colloidal particles. Coagulants neutralize surface charges, enabling floc formation. These flocs settle during sedimentation and are removed through rapid sand filtration. This treatment train is standard in municipal and industrial wastewater plants and is critical for preventing mechanical failure downstream.",
    postUse: [
      "Industrial reuse",
      "Construction supply",
      "Landscaping",
    ],
    risks: [
      "Sludge accumulation",
      "Chemical overdosing",
    ],
    mitigation: [
      "Automated dosing systems",
      "Sludge dewatering and disposal",
    ],
    visuals: [],
  },

  F4: {
    title: "High Dissolved Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    contamination: [
      "High dissolved salts and ions",
      "Elevated electrical conductivity",
    ],
    method: [
      "Ultrafiltration",
      "Activated carbon stabilization",
    ],
    explanation:
      "F4 water is dominated by dissolved contaminants rather than suspended solids. Ultrafiltration removes colloids and biological matter, protecting downstream membrane systems. Carbon adsorption improves chemical stability. This bracket is often used as a pre-treatment stage before reverse osmosis or where partial salt tolerance exists.",
    postUse: [
      "Industrial process water",
      "Cooling systems",
      "Boiler feed with conditioning",
    ],
    risks: [
      "Membrane fouling",
      "Pressure loss across UF membranes",
    ],
    mitigation: [
      "Optimized pre-treatment",
      "Scheduled membrane cleaning",
      "Continuous conductivity monitoring",
    ],
    visuals: [],
  },

  F5: {
    title: "Severe Dissolved Contamination",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",
    contamination: [
      "Extremely high dissolved solids",
      "Toxic ions and chemical pollutants",
    ],
    method: [
      "Advanced reverse osmosis",
      "Electrodialysis",
      "Thermal desalination",
    ],
    explanation:
      "F5 represents the most severe contamination level. Advanced separation technologies are required to remove contaminants at the molecular level. These processes are energy-intensive but essential for recovering water from highly contaminated industrial or saline sources.",
    postUse: [
      "Industrial manufacturing",
      "Potable water after remineralization",
      "Emergency water supply",
    ],
    risks: [
      "High operational cost",
      "Brine disposal challenges",
    ],
    mitigation: [
      "Zero Liquid Discharge systems",
      "Energy recovery devices",
      "Brine recovery and reuse",
    ],
    visuals: [],
  },
};

/* ======================================================
   LIVE DASHBOARD COMPONENT
====================================================== */
export default function LiveDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [activeMetric, setActiveMetric] = useState<
    "ph" | "tds" | "turbidity" | null
  >(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [mode, setMode] = useState<Mode>("idle");

  const slCounter = useRef(1);

  /* ======================================================
     AVERAGES (SAFE)
  ====================================================== */
  const avg = {
    ph: rows.length ? rows.reduce((s, r) => s + r.ph, 0) / rows.length : 0,
    turbidity: rows.length
      ? rows.reduce((s, r) => s + r.turbidity, 0) / rows.length
      : 0,
    tds: rows.length ? rows.reduce((s, r) => s + r.tds, 0) / rows.length : 0,
  };

  /* ======================================================
     SIMULATION MODE (HARD STOP @ 10)
  ====================================================== */
  useEffect(() => {
    if (mode !== "simulation") return;
    if (rows.length >= MAX_ROWS) return;

    const id = setInterval(() => {
      setRows((prev) => {
        if (prev.length >= MAX_ROWS) return prev;

        return [
          ...prev,
          {
            slNo: slCounter.current++,
            time: new Date().toLocaleTimeString(),
            ph: Number((6.5 + Math.random()).toFixed(2)),
            turbidity: Number((2 + Math.random()).toFixed(2)),
            tds: Number((150 + Math.random() * 15).toFixed(1)),
            source: "simulation",
          },
        ];
      });
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [mode, rows.length]);

  /* ======================================================
     RUN PREDICTION + SAVE ITERATION
  ====================================================== */
  const runPrediction = async () => {
    if (rows.length !== MAX_ROWS) return;

    const res = await fetch(BACKEND_ANALYZE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(avg),
    });

    const result = await res.json();
    setPrediction(result);

    const iteration: Iteration = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      mode,
      rows: [...rows],
      avg,
      prediction: {
        reusable: result.reusable,
        tank: result.tank,
        filtrationBracket: result.filtrationBracket,
      },
    };

    const existing: Iteration[] = JSON.parse(
      localStorage.getItem("waterIQ_iterations") || "[]"
    );

    localStorage.setItem(
      "waterIQ_iterations",
      JSON.stringify([...existing, iteration])
    );
  };

  const filtrationInfo =
    prediction && prediction.filtrationBracket
      ? FILTRATION_LIBRARY[prediction.filtrationBracket]
      : null;

  return (
    <div style={{ padding: 24 }}>
      <h1>Live Dashboard</h1>

      <button onClick={() => setMode("simulation")}>
        Deploy Simulation
      </button>

      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
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
        <button onClick={runPrediction} style={{ marginTop: 24 }}>
          Run Prediction Model
        </button>
      )}

      {filtrationInfo && (
        <div style={{ marginTop: 32 }}>
          <h2>{filtrationInfo.title}</h2>
          <p><b>Tank:</b> {filtrationInfo.tank}</p>
          <p><b>Status:</b> {filtrationInfo.status}</p>
          <p>{filtrationInfo.explanation}</p>
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
