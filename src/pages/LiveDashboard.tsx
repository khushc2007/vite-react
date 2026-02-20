import { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import DatasetTable from "../components/DatasetTable";
import ChartModal from "../components/ChartModal";

/* ======================================================
   BACKEND ENDPOINTS
====================================================== */
const BACKEND_ANALYZE_URL =
  "https://water-quality-backend-12-pctw.onrender.com/analyze-water";

const BACKEND_SESSION_READINGS_URL =
  "https://water-quality-backend-12-pctw.onrender.com/session/readings";

const BACKEND_SESSION_START_URL =
  "https://water-quality-backend-12-pctw.onrender.com/session/start";

const BACKEND_SESSION_STATUS_URL =
  "https://water-quality-backend-12-pctw.onrender.com/session/status";

const BACKEND_SESSION_RESET_URL =
  "https://water-quality-backend-12-pctw.onrender.com/session/reset";

const BACKEND_PUMP_COMMAND_URL =
  "https://water-quality-backend-12-pctw.onrender.com/pump/command";





/* ======================================================
   CONFIG
====================================================== */
const INTERVAL_MS = 4000;
const MAX_ROWS = 5;


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
type Prediction = {
  bracket: "F1" | "F2" | "F3" | "F4" | "F5";
  reusable: boolean;
  suggestedTank: "A" | "B";
};

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
 prediction: Prediction | null;
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

function simulatePrediction(avg: { ph: number; turbidity: number; tds: number }): Prediction {
  const { ph, turbidity, tds } = avg;

  if (turbidity < 2 && tds < 200 && ph >= 6.5 && ph <= 8) {
    return { bracket: "F1", reusable: true, suggestedTank: "A" };
  }

  if (turbidity < 4 && tds < 300) {
    return { bracket: "F2", reusable: true, suggestedTank: "A" };
  }

  if (turbidity < 8 && tds < 500) {
    return { bracket: "F3", reusable: true, suggestedTank: "A" };
  }

  if (tds < 800) {
    return { bracket: "F4", reusable: false, suggestedTank: "B" };
  }

  return { bracket: "F5", reusable: false, suggestedTank: "B" };
}
/* ======================================================
   COMPONENT
====================================================== */
export default function LiveDashboard() {
   const [pumpBusy, setPumpBusy] = useState(false);
const [lastPumpCommand, setLastPumpCommand] = useState<string | null>(null);
const sendPumpCommand = async (
  command: "START_PUMP_A" | "START_PUMP_B" | "START_PUMP_C" | "STOP_ALL"
) => {
  try {
    setPumpBusy(true);

    const res = await fetch(BACKEND_PUMP_COMMAND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Pump command failed");
      return;
    }

    setLastPumpCommand(command);
  } catch (err) {
    console.error("Pump command error", err);
    alert("Backend unavailable");
  } finally {
    setPumpBusy(false);
  }
};
  const [rows, setRows] = useState<Row[]>([]);
  const [activeMetric, setActiveMetric] =
    useState<"ph" | "tds" | "turbidity" | null>(null);
 
const [prediction, setPrediction] = useState<Prediction | null>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [iterationName, setIterationName] = useState("");
  const [readyToSave, setReadyToSave] = useState(false);
const startSimulation = () => {
  setMode("simulation");
  setRows([]);
  setPrediction(null);
  setReadyToSave(false);
  slCounter.current = 1;

  setSessionStatus({
    active: true,
    completed: false,
    collected: 0,
    phase: "COLLECTING",
  });
};
  const [sessionStatus, setSessionStatus] = useState<{
  active: boolean;
  completed: boolean;
  collected: number;
  phase: "IDLE" | "COLLECTING" | "ANALYZED" | "TRANSFERRING_MAIN" | "POST_FILTRATION" | "COMPLETE";
} | null>(null);


  const slCounter = useRef(1);
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
  setRows([]);
  setPrediction(null);
  setReadyToSave(false);
  slCounter.current = 1;

  const res = await fetch(BACKEND_SESSION_START_URL, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to start backend session");
  }

  setMode("live");
};

  

 /* ======================================================
   FALLBACK SESSION (ALL MODES)
====================================================== */







/* 4️⃣ LIVE MODE FAILOVER */
useEffect(() => {
  if (mode !== "live") return;

  const id = setInterval(async () => {
    try {
      const res = await fetch(BACKEND_SESSION_READINGS_URL);
      if (!res.ok) return;

      const data = await res.json();

      if (Array.isArray(data.readings)) {
      setRows(prev => {
  const incoming = data.readings.slice(prev.length);

  const mapped = incoming.map((r: any, i: number) => ({
    slNo: prev.length + i + 1,
    time: new Date(r.timestamp).toLocaleTimeString(),
    ph: r.ph,
    turbidity: r.turbidity,
    tds: r.tds,
    source: "live",
  }));

  return [...prev, ...mapped].slice(0, MAX_ROWS);
});
      }
    } catch (err) {
      console.error("Live session sync failed", err);
    }
  }, INTERVAL_MS);

  return () => clearInterval(id);
}, [mode]);


      useEffect(() => {
  if (mode !== "live") return;

  const id = setInterval(async () => {
    try {
      const res = await fetch(BACKEND_SESSION_STATUS_URL);
      if (!res.ok) return;

      const data = await res.json();
      setSessionStatus(data);
    } catch (err) {
      console.error("Session status fetch failed", err);
    }
  }, 2000);

  return () => clearInterval(id);
}, [mode]);
     useEffect(() => {
  if (mode !== "live") {
    fetch(BACKEND_SESSION_RESET_URL, { method: "POST" }).catch(() => {});
    setSessionStatus(null);
  }
}, [mode]);


   
  
  

  /* ======================================================
     SIMULATION MODE
  ====================================================== */
useEffect(() => {
  if (mode !== "simulation") return;
  if (rows.length >= MAX_ROWS) return;

  const id = setInterval(() => {
    setRows((prev) => {
      if (prev.length >= MAX_ROWS) return prev;

      const newRow = {
        slNo: slCounter.current++,
        time: new Date().toLocaleTimeString(),
        ph: +(6 + Math.random() * 2).toFixed(2),
        turbidity: +(Math.random() * 10).toFixed(2),
        tds: +(100 + Math.random() * 900).toFixed(1),
        source: "simulation",
      };

      const updated = [...prev, newRow];

      setSessionStatus({
        active: true,
        completed: false,
        collected: updated.length,
        phase: "COLLECTING",
      });

      return updated;
    });
  }, INTERVAL_MS);

  return () => clearInterval(id);
}, [mode]);

  /* ======================================================
     RUN PREDICTION
  ====================================================== */
  const runPrediction = async () => {
  if (rows.length < MAX_ROWS) {
    alert("Collect 5 readings first");
    return;
  }

  // 🔵 SIMULATION MODE (NO BACKEND)
  if (mode === "simulation") {
    const result = simulatePrediction(avg);

    setPrediction(result);
    setReadyToSave(true);

    setSessionStatus({
      active: true,
      completed: false,
      collected: MAX_ROWS,
      phase: "ANALYZED",
    });

    return;
  }

  // 🔴 LIVE MODE (BACKEND)
  if (mode === "live") {
    try {
      const res = await fetch(BACKEND_ANALYZE_URL, {
        method: "POST",
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        alert(result.error || "Prediction failed");
        return;
      }

      setPrediction(result);
      setReadyToSave(true);
    } catch (err) {
      console.error("Prediction request failed", err);
      alert("Backend unavailable.");
    }
  }
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
  prediction?.bracket
    ? FILTRATION_LIBRARY[prediction.bracket]
    : null;
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
        <h1>
  Live Dashboard{" "}
  <span
    style={{
      marginLeft: 12,
      padding: "4px 10px",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 700,
      background: mode === "live" ? "#14532d" : "#1e293b",
      color: mode === "live" ? "#22c55e" : "#38bdf8",
    }}
  >
    {mode === "live" ? "LIVE MODE" : "SIMULATION MODE"}
  </span>
</h1>


        <div style={{ display: "flex", gap: 12 }}>
          <button
  style={secondaryButtonStyle}
  onClick={startSimulation}
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
       {mode === "live" && sessionStatus && !sessionStatus.completed && (
  <p style={{ marginTop: 12, color: "#22c55e", fontWeight: 600 }}>
    Collecting data ({sessionStatus.collected}/{MAX_ROWS})
  </p>
)}
       {mode === "live" && sessionStatus && (
  <p style={{ marginTop: 6, color: "#94a3b8" }}>
    Backend Phase: <b>{sessionStatus.phase}</b>
  </p>
)}



     {mode === "live" &&
 sessionStatus?.collected === MAX_ROWS &&
 sessionStatus?.phase === "COLLECTING" && (
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
    {/* TITLE */}
    <h2 style={{ color: "#22c55e", marginBottom: 12 }}>
      {filtrationInfo.title}
    </h2>

    {/* BASIC INFO */}
    <p><b>Tank:</b> {filtrationInfo.tank}</p>
    <p><b>Status:</b> {filtrationInfo.status}</p>

    <hr style={{ borderColor: "#14532d", margin: "16px 0" }} />

    {/* CONTAMINATION */}
    <h3 style={{ color: "#86efac" }}>Contamination</h3>
    <ul>
      {filtrationInfo.contamination.map((c, i) => (
        <li key={i}>{c}</li>
      ))}
    </ul>

    {/* METHOD */}
    <h3 style={{ color: "#86efac", marginTop: 12 }}>Treatment Method</h3>
    <ul>
      {filtrationInfo.method.map((m, i) => (
        <li key={i}>{m}</li>
      ))}
    </ul>

    {/* EXPLANATION */}
    <h3 style={{ color: "#86efac", marginTop: 12 }}>Explanation</h3>
    <p style={{ lineHeight: 1.6 }}>
      {filtrationInfo.explanation}
    </p>

    {/* POST USE */}
    <h3 style={{ color: "#86efac", marginTop: 12 }}>Post-Treatment Uses</h3>
    <ul>
      {filtrationInfo.postUse.map((u, i) => (
        <li key={i}>{u}</li>
      ))}
    </ul>

    {/* RISKS */}
    <h3 style={{ color: "#fca5a5", marginTop: 12 }}>Risks</h3>
    <ul>
      {filtrationInfo.risks.map((r, i) => (
        <li key={i}>{r}</li>
      ))}
    </ul>

    {/* MITIGATION */}
    <h3 style={{ color: "#fde68a", marginTop: 12 }}>Mitigation Measures</h3>
    <ul>
      {filtrationInfo.mitigation.map((m, i) => (
        <li key={i}>{m}</li>
      ))}
    </ul>

    {/* VISUALS (optional, future-proof) */}
    {filtrationInfo.visuals.length > 0 && (
      <>
        <h3 style={{ color: "#93c5fd", marginTop: 12 }}>Visuals</h3>
        <p>Visual references available</p>
      </>
    )}
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
