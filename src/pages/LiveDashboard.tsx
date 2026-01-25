import { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import DatasetTable from "../components/DatasetTable";
import ChartModal from "../components/ChartModal";

/* ===============================
   BACKEND ENDPOINTS
================================ */
const BACKEND_ANALYZE_URL =
  "https://water-quality-backend-8-ffv5.onrender.com/analyze-water";

const BACKEND_LATEST_URL =
  "https://water-quality-backend-8-ffv5.onrender.com/latest";

/* ===============================
   CONFIG
================================ */
const INTERVAL_MS = 4000;
const MAX_ROWS = 10;

/* ===============================
   TYPES
================================ */
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

/* ===============================
   FILTRATION KNOWLEDGE LIBRARY
   (UI ENRICHMENT LAYER)
================================ */

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
      "Trace suspended particles such as fine sand, silt, and rust flakes",
      "Minor organic residues from domestic runoff and surface water",
      "Color, odor, and aesthetic inconsistencies that reduce visual quality"
    ],

    method: [
      "Sediment filtration",
      "Activated carbon filtration"
    ],

    explanation:
      "Water classified under the F1 filtration bracket exhibits only minor physical and aesthetic contamination and is considered structurally safe for reuse after baseline polishing. Sediment filtration is employed to remove fine particulate matter such as sand, silt, corrosion debris, and organic fragments that can impair clarity and gradually damage plumbing or mechanical systems. Following this, activated carbon filtration adsorbs dissolved organic compounds, chlorine residuals, and odor-causing molecules through surface adsorption and pore diffusion mechanisms. This combined treatment approach does not significantly alter the chemical composition of water, preserving its mineral balance while substantially improving clarity, odor, and usability. As a result, F1 treatment is widely regarded as the minimum standard for safe non-potable reuse systems in sustainable water management frameworks.",

    postUse: [
      "Gardening and landscape irrigation",
      "Toilet flushing systems",
      "Domestic cleaning and washing",
      "Cooling water for HVAC systems",
      "Light industrial and maintenance washing"
    ],

    risks: [
      "Activated carbon media saturation leading to reduced adsorption efficiency",
      "Sediment filter clogging due to prolonged operation",
      "Undetected breakthrough of fine particulates if filters are neglected"
    ],

    mitigation: [
      "Scheduled replacement of sediment and carbon filter cartridges",
      "Installation of backwashing or self-cleaning filter systems",
      "Use of parallel filtration units to maintain redundancy and flow stability"
    ],

    visuals: []
  },

  F2: {
    title: "Moderate Suspended Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",

    contamination: [
      "Moderate concentration of suspended solids",
      "Visible turbidity reducing transparency",
      "Particulate matter causing flow instability and abrasion risk"
    ],

    method: [
      "Multi-stage physical filtration",
      "Sand filtration",
      "Activated carbon filtration",
      "Fine polishing filters"
    ],

    explanation:
      "F2-classified water contains a moderate level of suspended solids that make it unsuitable for direct reuse without structured treatment. These suspended particles increase turbidity, interfere with flow dynamics, and pose mechanical risks to pumps, valves, and pipelines. Multi-stage physical filtration is applied to progressively remove contaminants: sand filtration captures larger particulates through depth filtration, activated carbon stabilizes organic and chemical residues, and fine polishing filters remove remaining micro-particles. This layered filtration strategy improves hydraulic stability and protects downstream systems. While chemical composition remains largely unchanged, the physical cleanup achieved through this process enables controlled reuse for applications tolerant to minor residual contamination.",

    postUse: [
      "Agricultural irrigation systems",
      "Construction and curing water",
      "Cooling towers and industrial heat exchangers",
      "Vehicle and equipment washing"
    ],

    risks: [
      "Sand filter bed saturation over time",
      "Channel formation within filter media reducing efficiency",
      "Uneven flow distribution across filtration layers"
    ],

    mitigation: [
      "Periodic sand and media replacement",
      "Use of layered or graded filter beds",
      "Modular filtration units allowing staged maintenance"
    ],

    visuals: []
  },

  F3: {
    title: "High Suspended Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",

    contamination: [
      "Very high suspended solids concentration",
      "Organic and biological particulate load",
      "Colloidal matter resistant to simple filtration"
    ],

    method: [
      "Chemical coagulation",
      "Flocculation",
      "Sedimentation",
      "Rapid sand filtration"
    ],

    explanation:
      "Water falling under the F3 bracket contains a heavy load of suspended solids, including fine particulates, organic matter, and biological debris that cannot be effectively removed through simple physical filtration alone. Chemical coagulation is introduced to destabilize colloidal particles by neutralizing surface charges, allowing them to aggregate during flocculation into larger, settleable masses. These flocs are then removed through sedimentation, significantly reducing the suspended load. Rapid sand filtration acts as a final polishing step to capture remaining particulates. This treatment train is a standard configuration in municipal wastewater and industrial effluent treatment plants and is essential for preventing mechanical abrasion, fouling, and downstream process failure.",

    postUse: [
      "Industrial reuse applications",
      "Construction and earthwork operations",
      "Landscaping and non-food irrigation"
    ],

    risks: [
      "Sludge accumulation requiring disposal",
      "Chemical overdosing leading to residual contamination",
      "Operational complexity and monitoring requirements"
    ],

    mitigation: [
      "Sludge dewatering and safe disposal systems",
      "Automated chemical dosing control",
      "Large-capacity clarifiers for stable sedimentation"
    ],

    visuals: []
  },

  F4: {
    title: "High Dissolved Solids",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",

    contamination: [
      "High concentration of dissolved salts and ions",
      "Elevated electrical conductivity",
      "Chemical imbalance affecting compatibility"
    ],

    method: [
      "Ultrafiltration (UF)",
      "Activated carbon stabilization",
      "Pre-treatment for membrane systems"
    ],

    explanation:
      "F4 water is dominated by dissolved contaminants rather than suspended solids, making it unsuitable for conventional filtration approaches. Ultrafiltration removes colloids, macromolecules, and biological contaminants while allowing most dissolved salts to pass through, thereby protecting downstream membrane systems. Activated carbon adsorption helps stabilize chemical composition by removing trace organics and oxidants. This bracket is commonly used as a pre-treatment stage for reverse osmosis or in applications where partial salt tolerance exists. Although not potable at this stage, F4 treatment significantly improves chemical stability and reduces biofouling risk.",

    postUse: [
      "Industrial process water",
      "Cooling and heat exchange systems",
      "Boiler feed water with conditioning"
    ],

    risks: [
      "Membrane fouling",
      "Pressure loss across UF systems",
      "Incomplete salt removal"
    ],

    mitigation: [
      "Optimized pre-treatment design",
      "Periodic membrane cleaning cycles",
      "Continuous conductivity monitoring"
    ],

    visuals: []
  },

  F5: {
    title: "Severe Dissolved Contamination",
    tank: "Tank B",
    status: "Non-reusable (before treatment)",

    contamination: [
      "Extremely high dissolved solids concentration",
      "Heavy ions, salts, and chemical pollutants",
      "Potential toxic and industrial contaminants"
    ],

    method: [
      "Advanced reverse osmosis",
      "Electrodialysis",
      "Thermal desalination (where applicable)"
    ],

    explanation:
      "F5 represents the most severe level of water contamination, characterized by extreme dissolved solids, toxic ions, and chemical pollutants that render water completely unsuitable for direct reuse. Advanced separation technologies such as high-pressure reverse osmosis, electrodialysis, or thermal desalination are required to remove contaminants at the molecular level. These processes are energy-intensive and generate concentrated reject streams but are essential for recovering water from highly contaminated industrial, brackish, or saline sources. Following treatment and appropriate remineralization, recovered water can meet stringent industrial or potable standards.",

    postUse: [
      "Industrial manufacturing processes",
      "Potable water after remineralization",
      "Emergency and disaster-relief water supply"
    ],

    risks: [
      "High operational and energy costs",
      "Brine and concentrate disposal challenges",
      "Membrane degradation under extreme conditions"
    ],

    mitigation: [
      "Zero Liquid Discharge (ZLD) systems",
      "Brine recovery and salt harvesting",
      "Energy recovery devices and hybrid treatment designs"
    ],

    visuals: []
  }
};

/* ===============================
   COMPONENT
================================ */
export default function LiveDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [activeMetric, setActiveMetric] = useState<
    "ph" | "tds" | "turbidity" | null
  >(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [mode, setMode] = useState<Mode>("idle");

  const slCounter = useRef(1);

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
    ph: rows.length ? rows.reduce((s, r) => s + r.ph, 0) / rows.length : 0,
    turbidity: rows.length
      ? rows.reduce((s, r) => s + r.turbidity, 0) / rows.length
      : 0,
    tds: rows.length ? rows.reduce((s, r) => s + r.tds, 0) / rows.length : 0,
  };

  /* ===============================
     SIMULATION MODE (HARD STOP)
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
     RUN PREDICTION + SAVE ITERATION
  ================================ */
  const runPrediction = async () => {
    if (rows.length !== MAX_ROWS) return;

    try {
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
    } catch (err) {
      console.error("Prediction failed", err);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Live Dashboard</h1>

      {/* DEPLOY BUTTONS */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setMode("simulation")}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            border: "none",
            fontWeight: 600,
          }}
        >
          Deploy Simulation
        </button>

        <button
          onClick={() => setMode("live")}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            border: "none",
            fontWeight: 600,
          }}
        >
          Deploy Live Sensors
        </button>
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
            marginTop: 20,
            padding: "14px 22px",
            borderRadius: 12,
            background: "#052e16",
            color: "#22c55e",
            border: "1px solid #22c55e",
            fontWeight: 700,
          }}
        >
          Run Prediction Model
        </button>
      )}

      {prediction && (
        <div style={{ marginTop: 20 }}>
          <p><b>Reusable:</b> {prediction.reusable}</p>
          <p><b>Tank:</b> {prediction.tank}</p>
          <p><b>Bracket:</b> {prediction.filtrationBracket}</p>
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
