import { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import DatasetTable from "../components/DatasetTable";
import ChartModal from "../components/ChartModal";

/* ======================================================
   BACKEND ENDPOINTS
====================================================== */
const BACKEND_ANALYZE_URL =
  "https://water-quality-backend-9-o4p1.onrender.com/analyze-water";

const BACKEND_LATEST_URL =
  "https://water-quality-backend-9-o4p1.onrender.com/tank-levels";

const BACKEND_SESSION_START_URL =
  "https://water-quality-backend-9-o4p1.onrender.com/session/start";

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
      "F1 represents lightly contaminated water that is structurally safe but aesthetically impaired. Sediment filtration removes fine particulate matter that can clog systems or reduce clarity, while activated carbon adsorption removes dissolved organic compounds, chlorine residues, and odor-causing molecules. This preserves mineral balance while improving usability and ensures consistent performance in non-potable reuse systems.",
    postUse: [
      "Gardening and landscaping",
      "Toilet flushing",
      "Domestic cleaning",
      "Cooling water systems",
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
      "F2 water contains suspended solids at levels that interfere with hydraulic performance and mechanical equipment. A staged filtration process removes progressively smaller particles, stabilizing hydraulics, protecting infrastructure, and enabling controlled reuse for non-sensitive applications.",
    postUse: [
      "Agricultural irrigation",
      "Construction activities",
      "Cooling towers",
      "Equipment and vehicle washing",
    ],
    risks: ["Media saturation", "Channel formation"],
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
      "F3 water requires chemical destabilization of colloidal particles. Coagulants neutralize surface charges, forming flocs that settle during sedimentation. Rapid sand filtration removes remaining solids. This process is standard in municipal and industrial wastewater treatment.",
    postUse: [
      "Industrial reuse",
      "Construction supply",
      "Landscaping",
    ],
    risks: ["Sludge accumulation", "Chemical overdosing"],
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
      "F4 water is dominated by dissolved contaminants. Ultrafiltration removes colloids and biological matter while protecting downstream membranes. Activated carbon stabilizes chemistry, preparing water for advanced treatment stages.",
    postUse: [
      "Industrial process water",
      "Cooling systems",
      "Boiler feed with conditioning",
    ],
    risks: ["Membrane fouling", "Pressure loss"],
    mitigation: [
      "Optimized pretreatment",
      "Scheduled membrane cleaning",
      "Continuous monitoring",
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
      "F5 represents extreme contamination. Molecular-level separation technologies are required. These systems are energy-intensive but essential for recovering water from industrial, saline, or chemically polluted sources.",
    postUse: [
      "Industrial manufacturing",
      "Potable water after remineralization",
      "Emergency water supply",
    ],
    risks: ["High operational cost", "Brine disposal challenges"],
    mitigation: [
      "Zero Liquid Discharge systems",
      "Energy recovery devices",
      "Brine recovery and reuse",
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
const lastModeRef = useRef<Mode>("idle");
   const primaryButtonStyle = {
  padding: "12px 20px",
  borderRadius: 12,
  background: "linear-gradient(135deg,#22c55e,#16a34a)",
  color: "#ecfdf5",
  border: "1px solid #22c55e",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "12px 20px",
  borderRadius: 12,
  background: "#020617",
  color: "#22c55e",
  border: "1px solid #22c55e",
  fontWeight: 700,
  cursor: "pointer",
};
   const startLiveSession = async () => {
  // reset UI state
  setRows([]);
  setPrediction(null);
  setReadyToSave(false);
  slCounter.current = 1;

  

 /* ======================================================
   FALLBACK SESSION (ALL MODES)
====================================================== */







/* 4️⃣ LIVE MODE FAILOVER */
useEffect(() => {
  if (mode !== "live") return;
  if (rows.length >= MAX_ROWS) return;

  const id =setInterval(async () => {
  const res = await fetch(BACKEND_LATEST_URL);
  const data = await res.json();

  setRows((prev) => {
    if (prev.length >= MAX_ROWS) return prev;

    return [
      ...prev,
      {
        slNo: slCounter.current++,
        time: data.time ?? new Date().toLocaleTimeString(),
        ph: data.ph,
        turbidity: data.turbidity,
        tds: data.tds,
        source: "live",
      },
    ];
  });
}, INTERVAL_MS);

  return () => clearInterval(id);
}, [mode, rows.length]);
   
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
  if (mode !== "live") return;
  if (rows.length >= MAX_ROWS) return;

  const id = setInterval(async () => {
    try {
      const res = await fetch(BACKEND_LATEST_URL);
      if (!res.ok) throw new Error("Live backend unavailable");

      const data = await res.json();

      setRows((prev) => {
        if (prev.length >= MAX_ROWS) return prev;

        return [
          ...prev,
          {
            slNo: slCounter.current++,
            time: data.time ?? new Date().toLocaleTimeString(),
            ph: 0,
            turbidity: 0,
            tds: 0,
            source: "live",
          },
        ];
      });
    } catch (err) {
      console.error("Live polling error:", err);
      // DO NOT change mode here
    }
  }, INTERVAL_MS);

  return () => clearInterval(id);
}, [mode, rows.length]);

  /* ======================================================
     RUN PREDICTION
  ====================================================== */
  const runPrediction = async () => {
  if (mode !== "live") {
    alert("Prediction is only available in Live mode");
    return;
  }

  const res = await fetch(BACKEND_ANALYZE_URL, {
    method: "POST",
  });

  const result = await res.json();
  setPrediction(result);
  setReadyToSave(true);
};
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

    setIterationName("");
    setReadyToSave(false);
  };

  const filtrationInfo =
    prediction && FILTRATION_LIBRARY[prediction.filtrationBracket];

  return (
    <div style={{ padding: 24 }}>
      {/* TOP BAR */}
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
  style={secondaryButtonStyle}
  onClick={() => setMode("simulation")}
>
  Deploy Simulation
</button>

<button
  style={secondaryButtonStyle}
  onClick={() => {
    startLiveSession().catch((err) => {
      console.error(err);
      alert("Backend unavailable. Live mode cannot start.");
    });
  }}
>
  Deploy Live Sensors
</button>


          
        </div>
      </div>

      {/* METRIC CARDS */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
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
        <button
  onClick={runPrediction}
  style={{
    marginTop: 24,
    width: "100%",
    padding: "16px 24px",
    fontSize: 18,
    borderRadius: 14,
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#022c22",
    border: "none",
    fontWeight: 800,
    cursor: "pointer",
  }}
>
  Run Prediction Model
</button>
       )}

     {filtrationInfo && (
  <div
    style={{
      marginTop: 32,
      padding: 24,
      borderRadius: 16,
      background: "#052e16",
      border: "1px solid #22c55e",
      color: "#ecfdf5",
    }}
  >
    <h2 style={{ color: "#22c55e", marginBottom: 12 }}>
      {filtrationInfo.title}
    </h2>

    <p><b>Tank:</b> {filtrationInfo.tank}</p>
    <p><b>Status:</b> {filtrationInfo.status}</p>

    <hr style={{ borderColor: "#14532d", margin: "16px 0" }} />

    <p style={{ lineHeight: 1.6 }}>
      {filtrationInfo.explanation}
    </p>
  </div>
)}

      {readyToSave && (
        
  <div
    style={{
      marginTop: 24,
      padding: 20,
      borderRadius: 14,
      background: "#020617",
      border: "1px dashed #22c55e",
      display: "flex",
      gap: 12,
      alignItems: "center",
    }}
  >
    <input
      value={iterationName}
      onChange={(e) => setIterationName(e.target.value)}
      placeholder="Iteration name"
      style={{
        flex: 1,
        padding: "12px 14px",
        borderRadius: 10,
        background: "#020617",
        color: "#ecfdf5",
        border: "1px solid #22c55e",
        outline: "none",
      }}
    />

    <button
      onClick={saveIteration}
      style={primaryButtonStyle}
    >
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
