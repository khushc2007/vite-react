import { useEffect, useState, useRef, useCallback } from "react";
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
  avg: { ph: number; turbidity: number; tds: number };
  prediction: Prediction | null;
};

type ToastType = "success" | "error" | "info" | "warning";
type Toast = {
  id: string;
  message: string;
  type: ToastType;
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
    postUse: ["Industrial reuse", "Construction supply", "Landscaping"],
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
    method: ["Ultrafiltration", "Activated carbon stabilization"],
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
   BRACKET SEVERITY CONFIG (color + icon per bracket)
====================================================== */
const BRACKET_META: Record<
  string,
  { color: string; bg: string; border: string; icon: string; severity: string }
> = {
  F1: {
    color: "#22c55e",
    bg: "#052e16",
    border: "#22c55e",
    icon: "✅",
    severity: "Low",
  },
  F2: {
    color: "#86efac",
    bg: "#052e16",
    border: "#86efac",
    icon: "🟡",
    severity: "Moderate",
  },
  F3: {
    color: "#fbbf24",
    bg: "#1c1007",
    border: "#fbbf24",
    icon: "⚠️",
    severity: "High",
  },
  F4: {
    color: "#f97316",
    bg: "#1c0a02",
    border: "#f97316",
    icon: "🔶",
    severity: "Very High",
  },
  F5: {
    color: "#ef4444",
    bg: "#1c0202",
    border: "#ef4444",
    icon: "🚨",
    severity: "Critical",
  },
};

/* ======================================================
   SIMULATION PREDICTION (FIXED — matches library)
====================================================== */
function simulatePrediction(avg: {
  ph: number;
  turbidity: number;
  tds: number;
}): Prediction {
  const { ph, turbidity, tds } = avg;

  if (turbidity < 2 && tds < 200 && ph >= 6.5 && ph <= 8) {
    return { bracket: "F1", reusable: true, suggestedTank: "A" };
  }
  if (turbidity < 4 && tds < 300) {
    // F2 → Tank B, non-reusable (was wrongly Tank A before)
    return { bracket: "F2", reusable: false, suggestedTank: "B" };
  }
  if (turbidity < 8 && tds < 500) {
    // F3 → Tank B, non-reusable (was wrongly Tank A before)
    return { bracket: "F3", reusable: false, suggestedTank: "B" };
  }
  if (tds < 800) {
    return { bracket: "F4", reusable: false, suggestedTank: "B" };
  }
  return { bracket: "F5", reusable: false, suggestedTank: "B" };
}

/* ======================================================
   WATER QUALITY SCORE HELPER
====================================================== */
function computeWQI(ph: number, turbidity: number, tds: number): number {
  // Simplified WQI (0–100, higher = better)
  const phScore = ph >= 6.5 && ph <= 8.5 ? 100 : Math.max(0, 100 - Math.abs(ph - 7.5) * 30);
  const turbScore = Math.max(0, 100 - turbidity * 10);
  const tdsScore = Math.max(0, 100 - (tds / 1000) * 100);
  return Math.round((phScore * 0.3 + turbScore * 0.35 + tdsScore * 0.35));
}

function wqiLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "#22c55e" };
  if (score >= 60) return { label: "Good", color: "#86efac" };
  if (score >= 40) return { label: "Fair", color: "#fbbf24" };
  if (score >= 20) return { label: "Poor", color: "#f97316" };
  return { label: "Critical", color: "#ef4444" };
}

/* ======================================================
   STYLES (defined OUTSIDE component to avoid recreation)
====================================================== */
const styles = {
  primaryButton: {
    padding: "12px 20px",
    borderRadius: 12,
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#ecfdf5",
    border: "1px solid #22c55e",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.2s",
  } as React.CSSProperties,

  secondaryButton: {
    padding: "12px 20px",
    borderRadius: 12,
    background: "#020617",
    color: "#22c55e",
    border: "1px solid #22c55e",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.2s, background 0.2s",
  } as React.CSSProperties,

  dangerButton: {
    padding: "12px 20px",
    borderRadius: 12,
    background: "#1c0202",
    color: "#ef4444",
    border: "1px solid #ef4444",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.2s",
  } as React.CSSProperties,

  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed",
    pointerEvents: "none" as const,
  },

  card: {
    padding: 20,
    borderRadius: 16,
    background: "#020617",
    border: "1px solid #1e293b",
    color: "#ecfdf5",
  } as React.CSSProperties,

  sectionHeading: {
    color: "#86efac",
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    fontWeight: 700,
  },
};

/* ======================================================
   TOAST COMPONENT
====================================================== */
const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "#052e16", border: "#22c55e", icon: "✅" },
  error:   { bg: "#1c0202", border: "#ef4444", icon: "❌" },
  info:    { bg: "#020617", border: "#38bdf8", icon: "ℹ️" },
  warning: { bg: "#1c1007", border: "#fbbf24", icon: "⚠️" },
};

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 340,
      }}
    >
      {toasts.map((t) => {
        const meta = TOAST_COLORS[t.type];
        return (
          <div
            key={t.id}
            onClick={() => onDismiss(t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 12,
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              color: "#ecfdf5",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 4px 24px 0 ${meta.border}33`,
              animation: "slideIn 0.25s ease",
            }}
          >
            <span style={{ fontSize: 18 }}>{meta.icon}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <span style={{ color: "#64748b", fontSize: 12 }}>✕</span>
          </div>
        );
      })}
    </div>
  );
}

/* ======================================================
   PROGRESS BAR COMPONENT
====================================================== */
function CollectionProgress({ collected, total }: { collected: number; total: number }) {
  const pct = Math.min((collected / total) * 100, 100);
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#94a3b8", fontSize: 13 }}>Collecting readings…</span>
        <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 700 }}>
          {collected} / {total}
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 99,
          background: "#0f172a",
          border: "1px solid #1e293b",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 99,
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

/* ======================================================
   WQI GAUGE COMPONENT
====================================================== */
function WQIGauge({ score }: { score: number }) {
  const { label, color } = wqiLabel(score);
  const pct = score;
  return (
    <div
      style={{
        ...styles.card,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: 20,
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
        Water Quality Index
      </div>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${(pct / 100) * 314} 314`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 800, color }}>{score}</span>
          <span style={{ fontSize: 11, color: "#64748b" }}>/100</span>
        </div>
      </div>
      <div style={{ fontWeight: 700, color, fontSize: 15 }}>{label}</div>
    </div>
  );
}

/* ======================================================
   ANOMALY DETECTOR
====================================================== */
type Anomaly = { metric: string; value: number; message: string; severity: "warning" | "critical" };

function detectAnomalies(rows: Row[]): Anomaly[] {
  if (rows.length === 0) return [];
  const anomalies: Anomaly[] = [];

  rows.forEach((r) => {
    if (r.ph < 6.0 || r.ph > 9.0)
      anomalies.push({
        metric: "pH",
        value: r.ph,
        message: `pH ${r.ph} is outside safe range (6.0–9.0)`,
        severity: r.ph < 4 || r.ph > 10 ? "critical" : "warning",
      });
    if (r.turbidity > 8)
      anomalies.push({
        metric: "Turbidity",
        value: r.turbidity,
        message: `Turbidity ${r.turbidity} NTU exceeds safe threshold (8 NTU)`,
        severity: r.turbidity > 15 ? "critical" : "warning",
      });
    if (r.tds > 800)
      anomalies.push({
        metric: "TDS",
        value: r.tds,
        message: `TDS ${r.tds} mg/L exceeds recommended limit (800 mg/L)`,
        severity: r.tds > 1200 ? "critical" : "warning",
      });
  });

  // Deduplicate by metric+severity to avoid noise
  const seen = new Set<string>();
  return anomalies.filter((a) => {
    const key = `${a.metric}-${a.severity}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ======================================================
   EXPORT HELPER
====================================================== */
function exportIterationsToCSV(iterations: Iteration[]) {
  const header = "Iteration,Timestamp,Mode,Bracket,Reusable,Tank,Avg pH,Avg Turbidity,Avg TDS\n";
  const rows = iterations
    .map((it) =>
      [
        `"${it.name}"`,
        it.timestamp,
        it.mode,
        it.prediction?.bracket ?? "N/A",
        it.prediction?.reusable ?? "N/A",
        it.prediction?.suggestedTank ?? "N/A",
        it.avg.ph.toFixed(2),
        it.avg.turbidity.toFixed(2),
        it.avg.tds.toFixed(1),
      ].join(",")
    )
    .join("\n");

  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wateriq_iterations_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ======================================================
   PUMP CONTROL PANEL
====================================================== */
type PumpCommand = "START_PUMP_A" | "START_PUMP_B" | "START_PUMP_C" | "STOP_ALL";

const PUMP_BUTTONS: { label: string; command: PumpCommand; color: string }[] = [
  { label: "Pump A", command: "START_PUMP_A", color: "#22c55e" },
  { label: "Pump B", command: "START_PUMP_B", color: "#38bdf8" },
  { label: "Pump C", command: "START_PUMP_C", color: "#a78bfa" },
  { label: "Stop All", command: "STOP_ALL", color: "#ef4444" },
];

function PumpControlPanel({
  pumpBusy,
  lastPumpCommand,
  onCommand,
}: {
  pumpBusy: boolean;
  lastPumpCommand: string | null;
  onCommand: (cmd: PumpCommand) => void;
}) {
  return (
    <div style={{ ...styles.card, marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: "#94a3b8", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Pump Control
        </h3>
        {lastPumpCommand && (
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Last: <b style={{ color: "#22c55e" }}>{lastPumpCommand}</b>
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {PUMP_BUTTONS.map(({ label, command, color }) => (
          <button
            key={command}
            onClick={() => onCommand(command)}
            disabled={pumpBusy}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              background: "#0f172a",
              color,
              border: `1px solid ${color}`,
              fontWeight: 700,
              fontSize: 13,
              cursor: pumpBusy ? "not-allowed" : "pointer",
              opacity: pumpBusy ? 0.5 : 1,
              transition: "opacity 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {pumpBusy && lastPumpCommand === command ? (
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
            ) : null}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ======================================================
   SESSION HISTORY PANEL
====================================================== */
function SessionHistoryPanel({
  iterations,
  onExport,
  onClear,
}: {
  iterations: Iteration[];
  onExport: () => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (iterations.length === 0) return null;

  return (
    <div style={{ ...styles.card, marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: "#94a3b8", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Session History ({iterations.length})
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onExport}
            style={{
              ...styles.secondaryButton,
              padding: "7px 14px",
              fontSize: 13,
            }}
          >
            ⬇ Export CSV
          </button>
          <button
            onClick={onClear}
            style={{ ...styles.dangerButton, padding: "7px 14px", fontSize: 13 }}
          >
            🗑 Clear
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...iterations].reverse().map((it) => {
          const meta = it.prediction ? BRACKET_META[it.prediction.bracket] : null;
          const isExpanded = expanded === it.id;
          const wqi = computeWQI(it.avg.ph, it.avg.turbidity, it.avg.tds);
          const wqiMeta = wqiLabel(wqi);

          return (
            <div
              key={it.id}
              style={{
                borderRadius: 12,
                border: `1px solid ${meta?.border ?? "#1e293b"}`,
                background: meta?.bg ?? "#0f172a",
                overflow: "hidden",
              }}
            >
              {/* Header row */}
              <div
                onClick={() => setExpanded(isExpanded ? null : it.id)}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {meta && (
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 8,
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {meta.icon} {it.prediction?.bracket}
                    </span>
                  )}
                  <span style={{ fontWeight: 700, color: "#ecfdf5" }}>{it.name}</span>
                  <span style={{ color: "#64748b", fontSize: 12 }}>
                    {it.mode === "live" ? "🔴 LIVE" : "🔵 SIM"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: wqiMeta.color, fontSize: 13, fontWeight: 700 }}>
                    WQI: {wqi}
                  </span>
                  <span style={{ color: "#64748b", fontSize: 12 }}>
                    {new Date(it.timestamp).toLocaleString()}
                  </span>
                  <span style={{ color: "#64748b" }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  style={{
                    padding: "0 16px 16px",
                    borderTop: "1px solid #1e293b",
                    marginTop: 0,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 12,
                      marginTop: 12,
                    }}
                  >
                    {[
                      { label: "Avg pH", value: it.avg.ph.toFixed(2) },
                      { label: "Avg Turbidity", value: `${it.avg.turbidity.toFixed(2)} NTU` },
                      { label: "Avg TDS", value: `${it.avg.tds.toFixed(1)} mg/L` },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          background: "#020617",
                          borderRadius: 10,
                          padding: "10px 14px",
                          border: "1px solid #1e293b",
                        }}
                      >
                        <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {label}
                        </div>
                        <div style={{ color: "#ecfdf5", fontWeight: 700, fontSize: 18, marginTop: 4 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {it.prediction && (
                    <div style={{ marginTop: 12, color: "#94a3b8", fontSize: 13 }}>
                      Routed to <b style={{ color: meta?.color }}>Tank {it.prediction.suggestedTank}</b> —{" "}
                      {it.prediction.reusable ? (
                        <span style={{ color: "#22c55e" }}>✅ Reusable after treatment</span>
                      ) : (
                        <span style={{ color: "#ef4444" }}>❌ Requires full treatment</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ======================================================
   ANOMALY BANNER
====================================================== */
function AnomalyBanner({ anomalies }: { anomalies: Anomaly[] }) {
  if (anomalies.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
      {anomalies.map((a, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 10,
            background: a.severity === "critical" ? "#1c0202" : "#1c1007",
            border: `1px solid ${a.severity === "critical" ? "#ef4444" : "#fbbf24"}`,
            color: a.severity === "critical" ? "#fca5a5" : "#fde68a",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span>{a.severity === "critical" ? "🚨" : "⚠️"}</span>
          <span>{a.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ======================================================
   MAIN COMPONENT
====================================================== */
export default function LiveDashboard() {
  /* --- Pump State --- */
  const [pumpBusy, setPumpBusy] = useState(false);
  const [lastPumpCommand, setLastPumpCommand] = useState<string | null>(null);

  /* --- Core State --- */
  const [rows, setRows] = useState<Row[]>([]);
  const [activeMetric, setActiveMetric] = useState<"ph" | "tds" | "turbidity" | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [iterationName, setIterationName] = useState("");
  const [readyToSave, setReadyToSave] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [deployingLive, setDeployingLive] = useState(false);
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [sessionStatus, setSessionStatus] = useState<{
    active: boolean;
    completed: boolean;
    collected: number;
    phase: "IDLE" | "COLLECTING" | "ANALYZED" | "TRANSFERRING_MAIN" | "POST_FILTRATION" | "COMPLETE";
  } | null>(null);

  const slCounter = useRef(1);
  const seenReadingTimestamps = useRef<Set<string>>(new Set());

  /* --- Load iterations from localStorage on mount --- */
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("waterIQ_iterations") || "[]");
      setIterations(stored);
    } catch {
      setIterations([]);
    }
  }, []);

  /* ======================================================
     TOAST HELPERS
  ====================================================== */
  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ======================================================
     PUMP COMMAND
  ====================================================== */
  const sendPumpCommand = useCallback(
    async (command: PumpCommand) => {
      try {
        setPumpBusy(true);
        const res = await fetch(BACKEND_PUMP_COMMAND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command }),
        });
        const data = await res.json();
        if (!res.ok) {
          addToast(data.error || "Pump command failed", "error");
          return;
        }
        setLastPumpCommand(command);
        addToast(`Pump command sent: ${command}`, "success");
      } catch (err) {
        console.error("Pump command error", err);
        addToast("Backend unavailable — pump command failed", "error");
      } finally {
        setPumpBusy(false);
      }
    },
    [addToast]
  );

  /* ======================================================
     SIMULATION START
  ====================================================== */
  const startSimulation = useCallback(() => {
    setMode("simulation");
    setRows([]);
    setPrediction(null);
    setReadyToSave(false);
    slCounter.current = 1;
    seenReadingTimestamps.current.clear();
    setSessionStatus({
      active: true,
      completed: false,
      collected: 0,
      phase: "COLLECTING",
    });
    addToast("Simulation started — collecting readings", "info");
  }, [addToast]);

  /* ======================================================
     LIVE SESSION START
  ====================================================== */
  const startLiveSession = useCallback(async () => {
    if (deployingLive) return;
    setDeployingLive(true);
    setRows([]);
    setPrediction(null);
    setReadyToSave(false);
    slCounter.current = 1;
    seenReadingTimestamps.current.clear();

    try {
      const res = await fetch(BACKEND_SESSION_START_URL, { method: "POST" });
      if (!res.ok) throw new Error("Backend returned error on session start");
      setMode("live");
      addToast("Live sensors deployed — awaiting readings", "success");
    } catch (err) {
      console.error(err);
      addToast("Backend unavailable — live mode cannot start", "error");
    } finally {
      setDeployingLive(false);
    }
  }, [deployingLive, addToast]);

  /* ======================================================
     LIVE MODE: READINGS POLL (with deduplication)
  ====================================================== */
  useEffect(() => {
    if (mode !== "live") return;

    const id = setInterval(async () => {
      try {
        const res = await fetch(BACKEND_SESSION_READINGS_URL);
        if (!res.ok) return;
        const data = await res.json();

        if (Array.isArray(data.readings)) {
          setRows((prev) => {
            const newReadings = data.readings.filter(
              (r: any) => !seenReadingTimestamps.current.has(r.timestamp)
            );

            newReadings.forEach((r: any) =>
              seenReadingTimestamps.current.add(r.timestamp)
            );

            const mapped = newReadings.map((r: any, i: number) => ({
              slNo: prev.length + i + 1,
              time: new Date(r.timestamp).toLocaleTimeString(),
              ph: r.ph,
              turbidity: r.turbidity,
              tds: r.tds,
              source: "live" as const,
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

  /* ======================================================
     LIVE MODE: STATUS POLL
  ====================================================== */
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

  /* ======================================================
     RESET BACKEND SESSION when leaving live mode
     (Guard: only fires if mode was previously live)
  ====================================================== */
  const prevMode = useRef<Mode>("idle");
  useEffect(() => {
    if (prevMode.current === "live" && mode !== "live") {
      fetch(BACKEND_SESSION_RESET_URL, { method: "POST" }).catch(() => {});
      setSessionStatus(null);
    }
    prevMode.current = mode;
  }, [mode]);

  /* ======================================================
     SIMULATION: DATA GENERATION
  ====================================================== */
  useEffect(() => {
    if (mode !== "simulation") return;
    if (rows.length >= MAX_ROWS) return;

    const id = setInterval(() => {
      setRows((prev) => {
        if (prev.length >= MAX_ROWS) return prev;

        const newRow: Row = {
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

        if (updated.length === MAX_ROWS) {
          addToast("All readings collected — run prediction to continue", "success");
        }

        return updated;
      });
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [mode, rows.length, addToast]);

  /* ======================================================
     AVERAGES
  ====================================================== */
  const avg = {
    ph: rows.length ? rows.reduce((s, r) => s + r.ph, 0) / rows.length : 0,
    turbidity: rows.length ? rows.reduce((s, r) => s + r.turbidity, 0) / rows.length : 0,
    tds: rows.length ? rows.reduce((s, r) => s + r.tds, 0) / rows.length : 0,
  };

  const wqiScore = rows.length ? computeWQI(avg.ph, avg.turbidity, avg.tds) : 0;
  const anomalies = detectAnomalies(rows);

  /* ======================================================
     RUN PREDICTION
  ====================================================== */
  const runPrediction = useCallback(async () => {
    if (rows.length < MAX_ROWS) {
      addToast("Collect all 5 readings first", "warning");
      return;
    }
    if (predicting) return;

    setPredicting(true);

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
      addToast(`Prediction complete: ${result.bracket} → Tank ${result.suggestedTank}`, "success");
      setPredicting(false);
      return;
    }

    if (mode === "live") {
      try {
        const res = await fetch(BACKEND_ANALYZE_URL, { method: "POST" });
        const result = await res.json();

        if (!res.ok || result.error) {
          addToast(result.error || "Prediction failed", "error");
          return;
        }

        setPrediction(result);
        setReadyToSave(true);
        addToast(`Prediction complete: ${result.bracket} → Tank ${result.suggestedTank}`, "success");
      } catch (err) {
        console.error("Prediction request failed", err);
        addToast("Backend unavailable — prediction failed", "error");
      } finally {
        setPredicting(false);
      }
    }
  }, [rows.length, predicting, mode, avg, addToast]);

  /* ======================================================
     SAVE ITERATION
  ====================================================== */
  const saveIteration = useCallback(() => {
    const iteration: Iteration = {
      id: crypto.randomUUID(),
      name: iterationName.trim() || `Iteration ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      mode,
      rows,
      avg,
      prediction,
    };

    const updated = [...iterations, iteration];
    setIterations(updated);

    try {
      localStorage.setItem("waterIQ_iterations", JSON.stringify(updated));
    } catch (e) {
      console.warn("localStorage write failed:", e);
    }

    setIterationName("");
    setReadyToSave(false);
    addToast(`Iteration "${iteration.name}" saved`, "success");
  }, [iterationName, mode, rows, avg, prediction, iterations, addToast]);

  /* ======================================================
     CLEAR HISTORY
  ====================================================== */
  const clearHistory = useCallback(() => {
    setIterations([]);
    localStorage.removeItem("waterIQ_iterations");
    addToast("Session history cleared", "info");
  }, [addToast]);

  /* ======================================================
     FILTRATION INFO
  ====================================================== */
  const filtrationInfo = prediction?.bracket ? FILTRATION_LIBRARY[prediction.bracket] : null;
  const bracketMeta = prediction?.bracket ? BRACKET_META[prediction.bracket] : null;

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <>
      {/* CSS Keyframes */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>

      {/* TOASTS */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

        {/* ── TOP BAR ─────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
            Live Dashboard
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                background: mode === "live" ? "#14532d" : mode === "simulation" ? "#1e293b" : "#0f172a",
                color: mode === "live" ? "#22c55e" : mode === "simulation" ? "#38bdf8" : "#64748b",
                border: `1px solid ${mode === "live" ? "#22c55e" : mode === "simulation" ? "#38bdf8" : "#1e293b"}`,
                animation: mode !== "idle" ? "pulse 2s ease infinite" : "none",
              }}
            >
              {mode === "live" ? "● LIVE MODE" : mode === "simulation" ? "● SIMULATION" : "IDLE"}
            </span>
          </h1>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={styles.secondaryButton}
              onClick={startSimulation}
              disabled={mode === "simulation" && rows.length < MAX_ROWS}
            >
              Deploy Simulation
            </button>

            <button
              style={{
                ...styles.secondaryButton,
                ...(deployingLive ? styles.disabledButton : {}),
              }}
              onClick={startLiveSession}
              disabled={deployingLive}
            >
              {deployingLive ? "⟳ Starting…" : "Deploy Live Sensors"}
            </button>
          </div>
        </div>

        {/* ── METRIC CARDS ────────────────────────────── */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <MetricCard
              title="pH"
              valueKey="ph"
              rows={rows}
              avg={avg.ph}
              onClick={() => rows.length && setActiveMetric("ph")}
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <MetricCard
              title="TDS"
              valueKey="tds"
              rows={rows}
              avg={avg.tds}
              onClick={() => rows.length && setActiveMetric("tds")}
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <MetricCard
              title="Turbidity"
              valueKey="turbidity"
              rows={rows}
              avg={avg.turbidity}
              onClick={() => rows.length && setActiveMetric("turbidity")}
            />
          </div>
          {rows.length > 0 && (
            <div style={{ minWidth: 160 }}>
              <WQIGauge score={wqiScore} />
            </div>
          )}
        </div>

        {/* ── ANOMALY BANNER ──────────────────────────── */}
        <AnomalyBanner anomalies={anomalies} />

        {/* ── DATA TABLE ──────────────────────────────── */}
        <DatasetTable rows={rows} />

        {/* ── COLLECTION PROGRESS ─────────────────────── */}
        {mode !== "idle" && rows.length < MAX_ROWS && (
          <CollectionProgress collected={rows.length} total={MAX_ROWS} />
        )}

        {/* ── BACKEND PHASE ───────────────────────────── */}
        {mode === "live" && sessionStatus && (
          <p style={{ marginTop: 8, color: "#94a3b8", fontSize: 13 }}>
            Backend Phase:{" "}
            <b style={{ color: "#38bdf8" }}>{sessionStatus.phase}</b>
          </p>
        )}

        {/* ── RUN PREDICTION BUTTON ───────────────────── */}
        {rows.length === MAX_ROWS && !prediction && (
          <button
            onClick={runPrediction}
            disabled={predicting}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "16px 24px",
              fontSize: 18,
              borderRadius: 14,
              background: predicting
                ? "#0f172a"
                : "linear-gradient(135deg,#22c55e,#16a34a)",
              color: predicting ? "#22c55e" : "#022c22",
              border: predicting ? "1px solid #22c55e" : "none",
              fontWeight: 800,
              cursor: predicting ? "not-allowed" : "pointer",
              opacity: predicting ? 0.8 : 1,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {predicting ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                Running prediction…
              </>
            ) : (
              "Run Prediction Model"
            )}
          </button>
        )}

        {/* ── PREDICTION RESULT BANNER ─────────────────── */}
        {prediction && bracketMeta && (
          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              borderRadius: 14,
              background: bracketMeta.bg,
              border: `1px solid ${bracketMeta.border}`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 32 }}>{bracketMeta.icon}</span>
            <div>
              <div style={{ color: bracketMeta.color, fontWeight: 800, fontSize: 22 }}>
                {prediction.bracket} — {FILTRATION_LIBRARY[prediction.bracket].title}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 14, marginTop: 2 }}>
                Severity: <b style={{ color: bracketMeta.color }}>{bracketMeta.severity}</b>
                {" · "}
                Tank: <b style={{ color: bracketMeta.color }}>{prediction.suggestedTank}</b>
                {" · "}
                {prediction.reusable ? (
                  <span style={{ color: "#22c55e" }}>✅ Reusable after treatment</span>
                ) : (
                  <span style={{ color: "#ef4444" }}>❌ Requires full treatment before reuse</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── FILTRATION KNOWLEDGE CARD ────────────────── */}
        {filtrationInfo && bracketMeta && (
          <div
            style={{
              marginTop: 24,
              padding: 24,
              borderRadius: 16,
              background: bracketMeta.bg,
              border: `1px solid ${bracketMeta.border}`,
              color: "#ecfdf5",
            }}
          >
            <h2 style={{ color: bracketMeta.color, marginBottom: 12, marginTop: 0 }}>
              {bracketMeta.icon} {filtrationInfo.title}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              <div>
                <span style={{ color: "#64748b", fontSize: 12 }}>Tank</span>
                <div style={{ fontWeight: 700 }}>{filtrationInfo.tank}</div>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: 12 }}>Status</span>
                <div style={{ fontWeight: 700 }}>{filtrationInfo.status}</div>
              </div>
            </div>

            <hr style={{ borderColor: "#1e293b", margin: "16px 0" }} />

            <h3 style={styles.sectionHeading}>Contamination</h3>
            <ul style={{ paddingLeft: 18, margin: "0 0 12px" }}>
              {filtrationInfo.contamination.map((c, i) => <li key={i}>{c}</li>)}
            </ul>

            <h3 style={styles.sectionHeading}>Treatment Method</h3>
            <ul style={{ paddingLeft: 18, margin: "0 0 12px" }}>
              {filtrationInfo.method.map((m, i) => <li key={i}>{m}</li>)}
            </ul>

            <h3 style={styles.sectionHeading}>Explanation</h3>
            <p style={{ lineHeight: 1.6, margin: "0 0 12px" }}>{filtrationInfo.explanation}</p>

            <h3 style={styles.sectionHeading}>Post-Treatment Uses</h3>
            <ul style={{ paddingLeft: 18, margin: "0 0 12px" }}>
              {filtrationInfo.postUse.map((u, i) => <li key={i}>{u}</li>)}
            </ul>

            <h3 style={{ ...styles.sectionHeading, color: "#fca5a5" }}>Risks</h3>
            <ul style={{ paddingLeft: 18, margin: "0 0 12px" }}>
              {filtrationInfo.risks.map((r, i) => <li key={i}>{r}</li>)}
            </ul>

            <h3 style={{ ...styles.sectionHeading, color: "#fde68a" }}>Mitigation Measures</h3>
            <ul style={{ paddingLeft: 18, margin: "0 0 12px" }}>
              {filtrationInfo.mitigation.map((m, i) => <li key={i}>{m}</li>)}
            </ul>

            {filtrationInfo.visuals.length > 0 && (
              <>
                <h3 style={{ ...styles.sectionHeading, color: "#93c5fd" }}>Visuals</h3>
                <p>Visual references available</p>
              </>
            )}
          </div>
        )}

        {/* ── SAVE ITERATION ───────────────────────────── */}
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
              onKeyDown={(e) => e.key === "Enter" && saveIteration()}
              placeholder="Give this iteration a name…"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 10,
                background: "#020617",
                color: "#ecfdf5",
                border: "1px solid #22c55e",
                outline: "none",
                fontSize: 14,
              }}
            />
            <button onClick={saveIteration} style={styles.primaryButton}>
              Save Iteration
            </button>
          </div>
        )}

        {/* ── PUMP CONTROL ─────────────────────────────── */}
        <PumpControlPanel
          pumpBusy={pumpBusy}
          lastPumpCommand={lastPumpCommand}
          onCommand={sendPumpCommand}
        />

        {/* ── SESSION HISTORY ──────────────────────────── */}
        <SessionHistoryPanel
          iterations={iterations}
          onExport={() => exportIterationsToCSV(iterations)}
          onClear={clearHistory}
        />

        {/* ── CHART MODAL ──────────────────────────────── */}
        {activeMetric && (
          <ChartModal
            metric={activeMetric}
            rows={rows}
            onClose={() => setActiveMetric(null)}
          />
        )}
      </div>
    </>
  );
}
