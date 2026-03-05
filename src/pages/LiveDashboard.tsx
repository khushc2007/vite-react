/**
 * ============================================================
 *  WaterIQ — CINEMATIC MISSION CONTROL DASHBOARD
 *  Glassmorphic · Futuristic · Animated · Immersive
 * ============================================================
 *  DESIGN: NASA × Tesla × Apple × AI Infrastructure hybrid
 *  ANIMATIONS: Pure CSS + inline keyframes + RAF loops
 *  CHARTS: Built-in SVG sparklines + animated line charts
 *  3D TANK: CSS 3D transform cylinder with pulsing sensors
 *  PARTICLES: Canvas-based data flow particles
 *  BACKEND: All original API endpoints UNCHANGED
 * ============================================================
 */

import {
  useEffect, useState, useRef, useCallback, useMemo, memo, Suspense
} from "react";

/* ── Google Fonts loader ── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap";

/* ======================================================
   BACKEND ENDPOINTS  (UNCHANGED)
====================================================== */
const BACKEND_ANALYZE_URL = "https://water-quality-backend-12-pctw.onrender.com/analyze-water";
const BACKEND_SESSION_READINGS_URL = "https://water-quality-backend-12-pctw.onrender.com/session/readings";
const BACKEND_SESSION_START_URL = "https://water-quality-backend-12-pctw.onrender.com/session/start";
const BACKEND_SESSION_STATUS_URL = "https://water-quality-backend-12-pctw.onrender.com/session/status";
const BACKEND_SESSION_RESET_URL = "https://water-quality-backend-12-pctw.onrender.com/session/reset";
const BACKEND_PUMP_COMMAND_URL = "https://water-quality-backend-12-pctw.onrender.com/pump/command";

/* ======================================================
   CONFIG
====================================================== */
const INTERVAL_MS = 4000;
const MAX_ROWS = 5;
const ROLLING_BUFFER_MAX = 20000;
const LS_BUFFER_KEY = "waterIQ_stream_buffer";
const LS_COUNTER_KEY = "waterIQ_sl_counter";
const TREND_WINDOW = 50;
const ANOMALY_PROB = 0.04;

/* ======================================================
   DESIGN TOKENS
====================================================== */
const T = {
  bg: "#020812",
  bgDeep: "#010610",
  panel: "rgba(6, 20, 45, 0.7)",
  panelBright: "rgba(10, 28, 60, 0.85)",
  glass: "rgba(255,255,255,0.03)",
  glassBright: "rgba(255,255,255,0.06)",
  border: "rgba(0, 200, 255, 0.12)",
  borderBright: "rgba(0, 200, 255, 0.25)",
  cyan: "#00e5ff",
  cyanDim: "#0099bb",
  blue: "#0066ff",
  violet: "#8b5cf6",
  green: "#00ff88",
  amber: "#ffb300",
  red: "#ff3366",
  text: "#e0f0ff",
  textDim: "#7099bb",
  textMuted: "#374d66",
  fontDisplay: "'Orbitron', monospace",
  fontMono: "'Space Mono', monospace",
  fontBody: "'Inter', sans-serif",
  blur: "blur(24px)",
  blurHeavy: "blur(40px)",
  radius: 16,
  radiusLg: 24,
  glow: (color = "#00e5ff", size = 20) => `0 0 ${size}px ${color}40, 0 0 ${size * 2}px ${color}20`,
  glowStrong: (color = "#00e5ff") => `0 0 30px ${color}60, 0 0 60px ${color}30, 0 0 90px ${color}15`,
};

/* ======================================================
   GLOBAL STYLES
====================================================== */
const GLOBAL_CSS = `
  @import url('${FONT_LINK}');

  *, *::before, *::after { box-sizing: border-box; }

  body {
    margin: 0;
    background: ${T.bg};
    color: ${T.text};
    font-family: ${T.fontBody};
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.2); border-radius: 2px; }

  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes scan-line {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes float-up {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes rotate-slow {
    from { transform: rotateY(0deg); }
    to { transform: rotateY(360deg); }
  }
  @keyframes data-stream {
    0% { stroke-dashoffset: 1000; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes count-up {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0% 0 0); }
  }
  @keyframes slide-in-right {
    from { transform: translateX(40px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slide-in-down {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes alert-pulse {
    0%, 100% { box-shadow: 0 0 20px #ff336640; }
    50% { box-shadow: 0 0 40px #ff336680, 0 0 80px #ff336630; }
  }
  @keyframes health-spin {
    from { stroke-dashoffset: 400; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes particle-drift {
    0% { transform: translateX(0) translateY(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateX(var(--dx)) translateY(var(--dy)); opacity: 0; }
  }
  @keyframes chart-draw {
    from { stroke-dashoffset: 2000; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes bracket-glow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.4) drop-shadow(0 0 8px currentColor); }
  }
  @keyframes btn-press {
    0% { transform: scale(1); }
    50% { transform: scale(0.96); }
    100% { transform: scale(1); }
  }
  @keyframes wqi-appear {
    from { stroke-dashoffset: 314; }
    to { stroke-dashoffset: var(--wqi-dash); }
  }
  @keyframes neon-flicker {
    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
    20%, 24%, 55% { opacity: 0.6; }
  }
  @keyframes grid-scroll {
    from { background-position: 0 0; }
    to { background-position: 0 60px; }
  }
  @keyframes orbit {
    from { transform: rotateZ(0deg) translateX(60px) rotateZ(0deg); }
    to { transform: rotateZ(360deg) translateX(60px) rotateZ(-360deg); }
  }
  @keyframes toast-in {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .glass-card {
    background: ${T.panel};
    backdrop-filter: ${T.blur};
    -webkit-backdrop-filter: ${T.blur};
    border: 1px solid ${T.border};
    border-radius: ${T.radius}px;
    position: relative;
    overflow: hidden;
  }
  .glass-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,229,255,0.04) 0%, transparent 50%);
    pointer-events: none;
    border-radius: inherit;
  }
  .glass-card:hover {
    border-color: ${T.borderBright};
    box-shadow: ${T.glow()};
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
  .metric-value {
    font-family: ${T.fontDisplay};
    font-weight: 700;
    letter-spacing: 0.05em;
  }
  .neon-text {
    color: ${T.cyan};
    text-shadow: 0 0 10px ${T.cyan}80, 0 0 20px ${T.cyan}40;
  }
  .pump-btn {
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .pump-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .pump-btn:hover::after { opacity: 1; }
  .pump-btn:hover {
    transform: translateY(-2px);
    filter: brightness(1.2);
  }
  .pump-btn:active { animation: btn-press 0.15s ease; }

  .table-row { transition: all 0.2s ease; }
  .table-row:hover {
    background: rgba(0,229,255,0.06) !important;
    border-color: rgba(0,229,255,0.2) !important;
  }

  .sidebar-item { transition: all 0.2s ease; }
  .sidebar-item:hover {
    background: rgba(0,229,255,0.08);
    color: ${T.cyan};
  }

  .sparkline-point { transition: r 0.2s ease; }
  .sparkline-point:hover { r: 4; }
`;

/* ======================================================
   TYPES (unchanged)
====================================================== */

/* ======================================================
   DRIFT ENGINE
====================================================== */
const createDriftState = () => ({
  ph:        { current: 7.2,  direction:  1, stepSize: 0.04,  min: 5.8, max: 8.6, decimals: 2 },
  turbidity: { current: 2.8,  direction:  1, stepSize: 0.10,  min: 0.4, max: 9.8, decimals: 2 },
  tds:       { current: 320,  direction: -1, stepSize: 3.0,   min: 75,  max: 950, decimals: 1 },
});

function advanceDrift(state) {
  const jitter = (Math.random() - 0.5) * state.stepSize * 0.5;
  state.current += state.direction * state.stepSize + jitter;
  const margin = (state.max - state.min) * 0.08;
  if (state.current >= state.max - margin) { state.direction = -1; state.current = Math.min(state.current, state.max); }
  else if (state.current <= state.min + margin) { state.direction = 1; state.current = Math.max(state.current, state.min); }
  return +state.current.toFixed(state.decimals);
}

function generateDriftReading(drift, slNo, isAnomaly) {
  let ph = advanceDrift(drift.ph);
  let turbidity = advanceDrift(drift.turbidity);
  let tds = advanceDrift(drift.tds);
  if (isAnomaly) {
    const pick = Math.floor(Math.random() * 3);
    if (pick === 0) ph = +(4.0 + Math.random() * 1.5).toFixed(2);
    if (pick === 1) turbidity = +(12 + Math.random() * 6).toFixed(2);
    if (pick === 2) tds = +(950 + Math.random() * 200).toFixed(1);
  }
  return { slNo, time: new Date().toLocaleTimeString(), ph, turbidity, tds, source: "stream" };
}

/* ======================================================
   PERSISTENCE
====================================================== */
function loadBuffer() { try { return JSON.parse(localStorage.getItem(LS_BUFFER_KEY) || "[]"); } catch { return []; } }
function saveBuffer(buf) { try { localStorage.setItem(LS_BUFFER_KEY, JSON.stringify(buf.slice(-ROLLING_BUFFER_MAX))); } catch { try { localStorage.setItem(LS_BUFFER_KEY, JSON.stringify(buf.slice(-500))); } catch {} } }
function loadCounter() { try { return parseInt(localStorage.getItem(LS_COUNTER_KEY) || "1", 10); } catch { return 1; } }
function saveCounter(n) { try { localStorage.setItem(LS_COUNTER_KEY, String(n)); } catch {} }

/* ======================================================
   HELPERS
====================================================== */
const FILTRATION_LIBRARY = {
  F1: { title: "Baseline Polishing", tank: "Tank A", status: "Reusable", contamination: ["Trace suspended particles","Minor organic residues","Aesthetic issues"], method: ["Sediment filtration","Activated carbon filtration"], explanation: "F1 represents lightly contaminated water that is structurally safe but aesthetically impaired.", postUse: ["Gardening","Toilet flushing","Domestic cleaning"], risks: ["Carbon saturation","Sediment clogging"], mitigation: ["Scheduled replacement","Backwashing"] },
  F2: { title: "Moderate Suspended Solids", tank: "Tank B", status: "Treatment Required", contamination: ["Moderate suspended solids","Visible turbidity"], method: ["Sand filtration","Activated carbon","Fine polishing"], explanation: "F2 water contains suspended solids at levels interfering with hydraulic performance.", postUse: ["Agricultural irrigation","Construction","Cooling towers"], risks: ["Media saturation","Channel formation"], mitigation: ["Layered filter beds","Periodic replacement"] },
  F3: { title: "High Suspended Solids", tank: "Tank B", status: "Treatment Required", contamination: ["Very high suspended solids","Organic load"], method: ["Coagulation","Flocculation","Sedimentation"], explanation: "F3 water requires chemical destabilization of colloidal particles.", postUse: ["Industrial reuse","Construction supply"], risks: ["Sludge accumulation","Chemical overdosing"], mitigation: ["Automated dosing","Sludge disposal"] },
  F4: { title: "High Dissolved Solids", tank: "Tank B", status: "Treatment Required", contamination: ["High dissolved salts","Elevated conductivity"], method: ["Ultrafiltration","Activated carbon"], explanation: "F4 water is dominated by dissolved contaminants requiring membrane filtration.", postUse: ["Industrial process water","Cooling systems"], risks: ["Membrane fouling","Pressure loss"], mitigation: ["Optimized pretreatment","Scheduled cleaning"] },
  F5: { title: "Severe Contamination", tank: "Tank B", status: "Critical Treatment", contamination: ["Extremely high dissolved solids","Toxic ions"], method: ["Advanced RO","Electrodialysis","Thermal desalination"], explanation: "F5 represents extreme contamination requiring molecular-level separation.", postUse: ["Industrial manufacturing","Emergency supply"], risks: ["High cost","Brine disposal"], mitigation: ["Zero Liquid Discharge","Energy recovery"] },
};

const BRACKET_META = {
  F1: { color: "#00ff88", border: "#00ff88", icon: "◉", severity: "Nominal", glow: "#00ff8860" },
  F2: { color: "#66ffbb", border: "#66ffbb", icon: "◎", severity: "Low",     glow: "#66ffbb50" },
  F3: { color: "#ffb300", border: "#ffb300", icon: "⚠",  severity: "Elevated",glow: "#ffb30060" },
  F4: { color: "#ff6600", border: "#ff6600", icon: "◈",  severity: "High",   glow: "#ff660060" },
  F5: { color: "#ff3366", border: "#ff3366", icon: "☢",  severity: "Critical",glow: "#ff336660" },
};

function simulatePrediction(avg) {
  const { ph, turbidity, tds } = avg;
  if (turbidity < 2 && tds < 200 && ph >= 6.5 && ph <= 8) return { bracket: "F1", reusable: true, suggestedTank: "A" };
  if (turbidity < 4 && tds < 300) return { bracket: "F2", reusable: false, suggestedTank: "B" };
  if (turbidity < 8 && tds < 500) return { bracket: "F3", reusable: false, suggestedTank: "B" };
  if (tds < 800) return { bracket: "F4", reusable: false, suggestedTank: "B" };
  return { bracket: "F5", reusable: false, suggestedTank: "B" };
}

function computeWQI(ph, turbidity, tds) {
  const phScore = ph >= 6.5 && ph <= 8.5 ? 100 : Math.max(0, 100 - Math.abs(ph - 7.5) * 30);
  const turbScore = Math.max(0, 100 - turbidity * 10);
  const tdsScore = Math.max(0, 100 - (tds / 1000) * 100);
  return Math.round(phScore * 0.3 + turbScore * 0.35 + tdsScore * 0.35);
}

function wqiMeta(score) {
  if (score >= 80) return { label: "EXCELLENT", color: T.green, glow: "#00ff8860" };
  if (score >= 60) return { label: "GOOD", color: "#66ffbb", glow: "#66ffbb50" };
  if (score >= 40) return { label: "FAIR", color: T.amber, glow: "#ffb30060" };
  if (score >= 20) return { label: "POOR", color: "#ff6600", glow: "#ff660060" };
  return { label: "CRITICAL", color: T.red, glow: "#ff336660" };
}

function detectAnomalies(rows) {
  const out = [];
  const seen = new Set();
  rows.forEach((r) => {
    if ((r.ph < 6.0 || r.ph > 9.0)) {
      const k = `pH-${r.ph < 4 || r.ph > 10 ? "critical" : "warning"}`;
      if (!seen.has(k)) { seen.add(k); out.push({ metric: "pH", value: r.ph, message: `pH ${r.ph} outside safe range (6.0–9.0)`, severity: r.ph < 4 || r.ph > 10 ? "critical" : "warning" }); }
    }
    if (r.turbidity > 8) {
      const k = `Turbidity-${r.turbidity > 15 ? "critical" : "warning"}`;
      if (!seen.has(k)) { seen.add(k); out.push({ metric: "Turbidity", value: r.turbidity, message: `Turbidity ${r.turbidity} NTU exceeds 8 NTU`, severity: r.turbidity > 15 ? "critical" : "warning" }); }
    }
    if (r.tds > 800) {
      const k = `TDS-${r.tds > 1200 ? "critical" : "warning"}`;
      if (!seen.has(k)) { seen.add(k); out.push({ metric: "TDS", value: r.tds, message: `TDS ${r.tds} mg/L exceeds 800 mg/L`, severity: r.tds > 1200 ? "critical" : "warning" }); }
    }
  });
  return out;
}

function computeTrend(buffer) {
  if (buffer.length < 10) return { dir: "stable", delta: 0 };
  const recent = buffer.slice(-TREND_WINDOW);
  const half = Math.floor(recent.length / 2);
  const first = recent.slice(0, half).reduce((s, r) => s + r.ph, 0) / half;
  const last = recent.slice(half).reduce((s, r) => s + r.ph, 0) / (recent.length - half);
  const delta = +(last - first).toFixed(3);
  if (Math.abs(delta) < 0.05) return { dir: "stable", delta };
  return { dir: delta > 0 ? "rising" : "falling", delta };
}

function computeHealthScore(buffer) {
  if (!buffer.length) return 100;
  const window = buffer.slice(-200);
  let anomalyCount = 0;
  window.forEach((r) => {
    if (r.ph < 6.0 || r.ph > 9.0) anomalyCount++;
    if (r.turbidity > 8) anomalyCount++;
    if (r.tds > 800) anomalyCount++;
  });
  return Math.max(0, Math.round(100 - (anomalyCount / (window.length * 3)) * 250));
}

function exportIterationsToCSV(iterations) {
  const header = "Iteration,Timestamp,Mode,Bracket,Reusable,Tank,Avg pH,Avg Turbidity,Avg TDS\n";
  const rows = iterations.map((it) => [
    `"${it.name}"`, it.timestamp, it.mode,
    it.prediction?.bracket ?? "N/A", it.prediction?.reusable ?? "N/A",
    it.prediction?.suggestedTank ?? "N/A",
    it.avg.ph.toFixed(2), it.avg.turbidity.toFixed(2), it.avg.tds.toFixed(1),
  ].join(",")).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: `wateriq_${Date.now()}.csv` });
  a.click(); URL.revokeObjectURL(url);
}

/* ======================================================
   PARTICLE BACKGROUND CANVAS
====================================================== */
const ParticleBackground = memo(() => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.7 ? "#8b5cf6" : Math.random() > 0.5 ? "#0066ff" : "#00e5ff",
    }));

    const connections = [];
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Subtle grid
      ctx.strokeStyle = "rgba(0,229,255,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
        particles.slice(i + 1).forEach((q) => {
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,229,255,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
});

/* ======================================================
   SCANLINE EFFECT
====================================================== */
const ScanlineEffect = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
    <div style={{
      position: "absolute", left: 0, right: 0, height: 2,
      background: "linear-gradient(transparent, rgba(0,229,255,0.06), transparent)",
      animation: "scan-line 8s linear infinite",
    }} />
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      pointerEvents: "none",
    }} />
  </div>
);

/* ======================================================
   TOP NAVBAR
====================================================== */
const TopNavbar = memo(({ mode, bufferSize }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const modeColor = mode === "live" ? T.red : mode === "simulation" ? T.cyan : T.green;
  const modeLabel = mode === "live" ? "LIVE SENSORS" : mode === "simulation" ? "SIMULATION" : "STREAM";

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(2,8,18,0.92)",
      backdropFilter: T.blurHeavy,
      borderBottom: `1px solid ${T.border}`,
      padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 56,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg, ${T.cyan}30, ${T.blue}30)`,
          border: `1px solid ${T.cyan}60`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
          boxShadow: T.glow(),
        }}>💧</div>
        <div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 700, color: T.cyan, letterSpacing: "0.2em", lineHeight: 1 }}>WATER IQ</div>
          <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted, letterSpacing: "0.15em" }}>MISSION CONTROL v2.0</div>
        </div>
      </div>

      {/* Center status */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: modeColor, boxShadow: `0 0 8px ${modeColor}`, animation: "glow-pulse 1.5s ease infinite" }} />
          <span style={{ fontFamily: T.fontMono, fontSize: 11, color: modeColor, letterSpacing: "0.15em" }}>{modeLabel}</span>
        </div>
        <div style={{ width: 1, height: 20, background: T.border }} />
        <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.textDim }}>
          {bufferSize.toLocaleString()} <span style={{ color: T.textMuted }}>READINGS</span>
        </div>
        <div style={{ width: 1, height: 20, background: T.border }} />
        <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.textDim }}>
          SYS <span style={{ color: T.green }}>NOMINAL</span>
        </div>
      </div>

      {/* Clock */}
      <div style={{ fontFamily: T.fontMono, fontSize: 13, color: T.cyan, letterSpacing: "0.1em" }}>
        {time.toLocaleTimeString("en-US", { hour12: false })}
        <div style={{ fontSize: 9, color: T.textMuted, textAlign: "right" }}>
          {time.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
        </div>
      </div>
    </div>
  );
});

/* ======================================================
   SIDEBAR
====================================================== */
const Sidebar = memo(({ activeTab, onTabChange }) => {
  const items = [
    { id: "dashboard", icon: "◈", label: "DASHBOARD" },
    { id: "analytics", icon: "◎", label: "ANALYTICS" },
    { id: "sensors", icon: "⬡", label: "SENSORS" },
    { id: "history", icon: "◷", label: "HISTORY" },
    { id: "settings", icon: "⊕", label: "SETTINGS" },
  ];

  return (
    <div style={{
      width: 72, flexShrink: 0,
      background: "rgba(2,8,18,0.9)",
      backdropFilter: T.blur,
      borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "20px 0", gap: 4,
    }}>
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button key={item.id} className="sidebar-item" onClick={() => onTabChange(item.id)} style={{
            width: 52, height: 52, borderRadius: 12,
            background: isActive ? `rgba(0,229,255,0.12)` : "transparent",
            border: isActive ? `1px solid ${T.cyan}40` : "1px solid transparent",
            color: isActive ? T.cyan : T.textMuted,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            cursor: "pointer", gap: 3,
            boxShadow: isActive ? T.glow() : "none",
            transition: "all 0.2s ease",
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ fontFamily: T.fontMono, fontSize: 7, letterSpacing: "0.08em" }}>{item.label}</span>
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <div style={{ width: 40, height: 1, background: T.border, margin: "8px 0" }} />
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: T.green, boxShadow: `0 0 10px ${T.green}`,
        animation: "glow-pulse 2s ease infinite",
      }} />
    </div>
  );
});

/* ======================================================
   ANIMATED NUMBER
====================================================== */
const AnimatedNumber = memo(({ value, decimals = 2, suffix = "", prefix = "" }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    const duration = 600;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else prevRef.current = to;
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <span>{prefix}{display.toFixed(decimals)}{suffix}</span>;
});

/* ======================================================
   SPARKLINE SVG
====================================================== */
const Sparkline = memo(({ data, color = T.cyan, height = 40, width = 120 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * height * 0.85 - height * 0.075,
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = path + ` L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#","")})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
        style={{ strokeDasharray: 2000, strokeDashoffset: 0, animation: "chart-draw 1s ease forwards" }} />
      {pts.slice(-1).map(([x, y]) => (
        <g key="dot">
          <circle cx={x} cy={y} r={3} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
          <circle cx={x} cy={y} r={6} fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4"
            style={{ animation: "pulse-ring 1.5s ease-out infinite" }} />
        </g>
      ))}
    </svg>
  );
});

/* ======================================================
   METRIC CARD
====================================================== */
const sensorMeta = {
  ph:        { label: "pH LEVEL", unit: "", color: T.cyan,   glow: T.cyan, min: 0, max: 14, safe: [6.5, 8.5], icon: "⬡" },
  tds:       { label: "TDS",      unit: "mg/L", color: "#0099ff", glow: "#0099ff", min: 0, max: 1200, safe: [0, 800], icon: "◎" },
  turbidity: { label: "TURBIDITY",unit: "NTU", color: T.violet, glow: T.violet, min: 0, max: 20, safe: [0, 8], icon: "◈" },
};

const MetricCard = memo(({ metric, value, sparkData, onClick }) => {
  const meta = sensorMeta[metric];
  const pct = Math.min(Math.max((value - meta.min) / (meta.max - meta.min), 0), 1);
  const inSafe = value >= meta.safe[0] && value <= meta.safe[1];
  const status = inSafe ? "NOMINAL" : "ALERT";
  const statusColor = inSafe ? T.green : T.red;

  return (
    <div className="glass-card" onClick={onClick} style={{
      flex: 1, minWidth: 160, padding: 20, cursor: "click",
      animation: "float-up 0.6s ease forwards",
      borderColor: inSafe ? T.border : `${T.red}40`,
      boxShadow: inSafe ? "none" : `0 0 20px ${T.red}20`,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: meta.color, fontSize: 14 }}>{meta.icon}</span>
          <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.textDim, letterSpacing: "0.15em" }}>{meta.label}</span>
        </div>
        <div style={{
          padding: "2px 8px", borderRadius: 6,
          background: `${statusColor}15`,
          border: `1px solid ${statusColor}40`,
          fontFamily: T.fontMono, fontSize: 9, color: statusColor, letterSpacing: "0.1em",
        }}>{status}</div>
      </div>

      {/* Value */}
      <div style={{ marginBottom: 12 }}>
        <div className="metric-value" style={{ fontSize: 32, color: meta.color, lineHeight: 1, textShadow: `0 0 20px ${meta.glow}60` }}>
          <AnimatedNumber value={value} decimals={metric === "tds" ? 1 : 2} />
        </div>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.textMuted, marginTop: 2 }}>{meta.unit || "index"}</div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct * 100}%`,
          background: `linear-gradient(90deg, ${meta.color}80, ${meta.color})`,
          borderRadius: 2, transition: "width 0.6s ease",
          boxShadow: `0 0 8px ${meta.color}`,
        }} />
      </div>

      {/* Sparkline */}
      <Sparkline data={sparkData} color={meta.color} height={36} width={140} />
    </div>
  );
});

/* ======================================================
   WQI RADIAL GAUGE
====================================================== */
const WQIGauge = memo(({ score }) => {
  const meta = wqiMeta(score);
  const R = 42, CIRC = 2 * Math.PI * R;
  const dash = (score / 100) * CIRC;

  return (
    <div className="glass-card" style={{ minWidth: 160, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.15em" }}>WATER QUALITY INDEX</div>
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg viewBox="0 0 100 100" width={100} height={100}>
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="50" cy="50" r={R} fill="none" stroke={meta.color} strokeWidth="8"
            strokeDasharray={`${dash} ${CIRC}`} strokeLinecap="round" transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dasharray 1s ease, stroke 0.5s", filter: `drop-shadow(0 0 6px ${meta.color})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="metric-value" style={{ fontSize: 24, color: meta.color }}>{score}</div>
          <div style={{ fontFamily: T.fontMono, fontSize: 8, color: T.textMuted }}>/100</div>
        </div>
      </div>
      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: meta.color, letterSpacing: "0.12em" }}>{meta.label}</div>
    </div>
  );
});

/* ======================================================
   SYSTEM HEALTH GAUGE
====================================================== */
const SystemHealthGauge = memo(({ score }) => {
  const color = score >= 80 ? T.green : score >= 50 ? T.amber : T.red;
  const label = score >= 80 ? "HEALTHY" : score >= 50 ? "DEGRADED" : "CRITICAL";
  const R = 44, CIRC = 2 * Math.PI * R;
  const dash = (score / 100) * CIRC;

  return (
    <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.15em" }}>SYSTEM HEALTH</div>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <svg viewBox="0 0 110 110" width={110} height={110}>
          <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          {/* Background arcs for segments */}
          <circle cx="55" cy="55" r={R} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${CIRC}`} strokeLinecap="round" transform="rotate(-90 55 55)"
            style={{ transition: "stroke-dasharray 1.2s ease, stroke 0.5s", filter: `drop-shadow(0 0 8px ${color})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="metric-value" style={{ fontSize: 28, color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontFamily: T.fontMono, fontSize: 8, color: T.textMuted }}>/ 100</div>
        </div>
      </div>
      <div style={{
        fontFamily: T.fontMono, fontSize: 11, color, letterSpacing: "0.15em",
        padding: "4px 12px", borderRadius: 8,
        background: `${color}15`, border: `1px solid ${color}30`,
      }}>{label}</div>
    </div>
  );
});

/* ======================================================
   3D TANK VISUALIZATION (CSS 3D)
====================================================== */
const TankVisualization3D = memo(({ ph, turbidity, tds, anomalies }) => {
  const sensors = [
    { id: "ph",        label: "pH",    value: ph.toFixed(2),        angle: 0,   color: T.cyan,   active: true },
    { id: "tds",       label: "TDS",   value: tds.toFixed(1),       angle: 72,  color: "#0099ff", active: true },
    { id: "turb",      label: "TURB",  value: turbidity.toFixed(2), angle: 144, color: T.violet, active: true },
    { id: "orp",       label: "ORP",   value: "320",                angle: 216, color: "#00ff88", active: false },
    { id: "ammonia",   label: "NH₃",   value: "0.04",               angle: 288, color: "#ffb300", active: false },
  ];

  const waterLevel = Math.max(20, Math.min(80, 100 - turbidity * 8));
  const waterColor = turbidity > 5 ? "#3d5a2a" : turbidity > 2 ? "#1a4a5a" : "#0a3a5a";

  return (
    <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.15em", alignSelf: "flex-start" }}>
        TANK SYSTEM VISUALIZATION
      </div>

      <div style={{ position: "relative", width: 200, height: 200, perspective: "800px" }}>
        {/* Outer ring */}
        <div style={{
          position: "absolute", inset: 20,
          borderRadius: "50%",
          border: `1px solid ${T.border}`,
          background: "radial-gradient(ellipse, rgba(0,229,255,0.03) 0%, transparent 70%)",
          animation: "glow-pulse 3s ease infinite",
        }} />

        {/* Tank cylinder */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          width: 60, height: 80,
          borderRadius: 8,
          border: `1px solid ${T.borderBright}`,
          background: `linear-gradient(180deg, transparent ${100 - waterLevel}%, ${waterColor}60 ${100 - waterLevel}%)`,
          overflow: "hidden",
          boxShadow: `0 0 20px rgba(0,229,255,0.1)`,
        }}>
          {/* Water ripple */}
          <div style={{
            position: "absolute",
            top: `${100 - waterLevel}%`,
            left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, transparent, ${T.cyan}60, transparent)`,
            animation: "glow-pulse 2s ease infinite",
          }} />
          {/* Tank label */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: T.fontDisplay, fontSize: 10, color: T.cyan, letterSpacing: "0.1em",
          }}>TANK</div>
        </div>

        {/* Sensor nodes orbiting */}
        {sensors.map((s) => {
          const rad = (s.angle * Math.PI) / 180;
          const r = 70;
          const x = 100 + r * Math.sin(rad) - 20;
          const y = 100 - r * Math.cos(rad) - 20;
          const hasAnomaly = anomalies.some((a) => a.metric.toLowerCase() === s.id);

          return (
            <div key={s.id} style={{
              position: "absolute",
              left: x, top: y,
              width: 40, height: 40,
            }}>
              {/* Pulse ring */}
              {s.active && (
                <div style={{
                  position: "absolute", inset: -4,
                  borderRadius: "50%",
                  border: `1px solid ${s.color}60`,
                  animation: "pulse-ring 2s ease-out infinite",
                }} />
              )}
              {/* Node */}
              <div style={{
                width: 40, height: 40,
                borderRadius: 10,
                background: `${s.color}15`,
                border: `1px solid ${s.color}${s.active ? "80" : "30"}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: s.active ? `0 0 12px ${s.color}40` : "none",
                animation: hasAnomaly ? "alert-pulse 1s ease infinite" : "none",
              }}>
                <div style={{ fontFamily: T.fontMono, fontSize: 7, color: s.color, letterSpacing: "0.05em" }}>{s.label}</div>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: s.active ? s.color : T.textMuted, fontWeight: 700 }}>{s.value}</div>
              </div>

              {/* Connector line to center */}
              <svg style={{ position: "absolute", top: 20, left: 20, overflow: "visible", pointerEvents: "none" }}>
                <line x1="0" y1="0"
                  x2={100 - x - 20} y2={100 - y - 20}
                  stroke={`${s.color}30`} strokeWidth="1"
                  strokeDasharray="4 4" />
              </svg>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: T.textMuted, fontFamily: T.fontMono, fontSize: 8 }}>WATER LVL</div>
          <div style={{ color: T.cyan, fontFamily: T.fontDisplay, fontSize: 12 }}>{waterLevel.toFixed(0)}%</div>
        </div>
        <div style={{ width: 1, background: T.border }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ color: T.textMuted, fontFamily: T.fontMono, fontSize: 8 }}>FLOW RATE</div>
          <div style={{ color: T.green, fontFamily: T.fontDisplay, fontSize: 12 }}>2.4 L/s</div>
        </div>
        <div style={{ width: 1, background: T.border }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ color: T.textMuted, fontFamily: T.fontMono, fontSize: 8 }}>TEMP</div>
          <div style={{ color: T.violet, fontFamily: T.fontDisplay, fontSize: 12 }}>24.1°C</div>
        </div>
      </div>
    </div>
  );
});

/* ======================================================
   ANIMATED LINE CHART
====================================================== */
const SensorChart = memo(({ title, data, color, unit, height = 140 }) => {
  const W = 340, H = height;
  if (!data || data.length < 2) return (
    <div className="glass-card" style={{ flex: 1, minWidth: 280, padding: 20, height: H + 60 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.12em", marginBottom: 12 }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: H, color: T.textMuted, fontFamily: T.fontMono, fontSize: 11 }}>AWAITING DATA…</div>
    </div>
  );

  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pad = 8;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (W - pad * 2),
    H - pad - ((v - min) / range) * (H - pad * 2),
  ]);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = path + ` L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  const latest = data[data.length - 1];

  return (
    <div className="glass-card" style={{ flex: 1, minWidth: 280, padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.12em" }}>{title}</div>
        <div className="metric-value" style={{ fontSize: 18, color }}>{latest.toFixed(unit === "mg/L" ? 1 : 2)}<span style={{ fontSize: 10, fontFamily: T.fontMono, color: T.textMuted, fontWeight: 400, marginLeft: 3 }}>{unit}</span></div>
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`cg-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={pad} y1={pad + t * (H - pad * 2)} x2={W - pad} y2={pad + t * (H - pad * 2)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#cg-${title})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
          style={{ strokeDasharray: 2000, strokeDashoffset: 0, animation: "chart-draw 1.5s ease forwards" }} />
        {/* Latest point glow */}
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4"
          fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="8"
          fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4"
          style={{ animation: "pulse-ring 1.5s ease-out infinite" }} />
      </svg>
    </div>
  );
});

/* ======================================================
   ANOMALY ALERTS PANEL
====================================================== */
const AlertsPanel = memo(({ anomalies }) => {
  if (!anomalies.length) return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.15em", marginBottom: 12 }}>ANOMALY DETECTION</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10,
        background: `${T.green}10`, border: `1px solid ${T.green}30` }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }} />
        <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.green }}>ALL SENSORS NOMINAL — NO ANOMALIES DETECTED</span>
      </div>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: 20, borderColor: `${T.red}40`, boxShadow: `0 0 20px ${T.red}15`, animation: "alert-pulse 2s ease infinite" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.red, letterSpacing: "0.15em" }}>⚠ ANOMALY DETECTED</div>
        <div style={{
          padding: "2px 8px", borderRadius: 6,
          background: `${T.red}20`, border: `1px solid ${T.red}50`,
          fontFamily: T.fontMono, fontSize: 9, color: T.red,
        }}>{anomalies.length} ALERT{anomalies.length > 1 ? "S" : ""}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {anomalies.map((a, i) => {
          const isCritical = a.severity === "critical";
          const color = isCritical ? T.red : T.amber;
          return (
            <div key={i} style={{
              padding: "10px 14px", borderRadius: 10,
              background: `${color}10`, border: `1px solid ${color}40`,
              display: "flex", alignItems: "center", gap: 10,
              animation: "slide-in-right 0.4s ease forwards",
              animationDelay: `${i * 0.1}s`, opacity: 0,
              animationFillMode: "forwards",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0, animation: "glow-pulse 1s ease infinite" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontMono, fontSize: 10, color, letterSpacing: "0.1em" }}>
                  {isCritical ? "☢ CRITICAL" : "⚠ WARNING"} — {a.metric.toUpperCase()}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textDim, marginTop: 2 }}>{a.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ======================================================
   PUMP CONTROL PANEL
====================================================== */
const PUMP_CONFIGS = [
  { label: "PUMP A", command: "START_PUMP_A", color: T.cyan, icon: "⬡" },
  { label: "PUMP B", command: "START_PUMP_B", color: T.blue, icon: "◎" },
  { label: "PUMP C", command: "START_PUMP_C", color: T.violet, icon: "◈" },
  { label: "STOP ALL", command: "STOP_ALL", color: T.red, icon: "⊗" },
];

const PumpControlPanel = memo(({ pumpBusy, lastPumpCommand, onCommand, activeCommand }) => (
  <div className="glass-card" style={{ padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.15em" }}>PUMP CONTROL MATRIX</div>
      {lastPumpCommand && (
        <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted }}>
          LAST: <span style={{ color: T.green }}>{lastPumpCommand}</span>
        </div>
      )}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {PUMP_CONFIGS.map(({ label, command, color, icon }) => {
        const isActive = activeCommand === command;
        return (
          <button key={command} className="pump-btn" onClick={() => onCommand(command)} disabled={pumpBusy} style={{
            padding: "14px 12px", borderRadius: 12,
            background: isActive ? `${color}20` : `${color}08`,
            border: `1px solid ${isActive ? color : color + "40"}`,
            color, fontFamily: T.fontMono, fontSize: 11, letterSpacing: "0.1em",
            fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: isActive ? `0 0 20px ${color}40` : "none",
            opacity: pumpBusy && !isActive ? 0.5 : 1,
          }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <div>
              <div>{label}</div>
              {isActive && <div style={{ fontSize: 8, opacity: 0.7, animation: "glow-pulse 0.8s ease infinite" }}>ACTIVE</div>}
            </div>
          </button>
        );
      })}
    </div>
  </div>
));

/* ======================================================
   COLLECTION PROGRESS
====================================================== */
const CollectionProgress = memo(({ collected, total }) => {
  const pct = (collected / total) * 100;
  return (
    <div className="glass-card" style={{ padding: 16, borderColor: `${T.cyan}30` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.15em" }}>DATA COLLECTION IN PROGRESS</div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 13, color: T.cyan }}>{collected}<span style={{ color: T.textMuted, fontSize: 10 }}>/{total}</span></div>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${T.cyan}80, ${T.cyan})`,
          borderRadius: 2, transition: "width 0.6s ease",
          boxShadow: `0 0 8px ${T.cyan}`,
        }} />
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: 6, borderRadius: 3,
            background: i < collected ? `${T.cyan}80` : "rgba(255,255,255,0.06)",
            border: i < collected ? `1px solid ${T.cyan}40` : "1px solid transparent",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>
    </div>
  );
});

/* ======================================================
   DATASET TABLE
====================================================== */
const DatasetTable = memo(({ rows }) => {
  const [sortKey, setSortKey] = useState("slNo");
  const [sortDir, setSortDir] = useState("asc");
  const [filter, setFilter] = useState("");

  const cols = [
    { key: "slNo", label: "#", width: 50 },
    { key: "time", label: "TIMESTAMP", width: 100 },
    { key: "ph", label: "pH", width: 80 },
    { key: "turbidity", label: "TURB (NTU)", width: 110 },
    { key: "tds", label: "TDS (mg/L)", width: 110 },
    { key: "source", label: "SOURCE", width: 100 },
  ];

  const sorted = useMemo(() => {
    let data = [...rows];
    if (filter) data = data.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(filter.toLowerCase())));
    data.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [rows, sortKey, sortDir, filter]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sourceColor = (s) => s === "live" ? T.red : s === "simulation" ? T.cyan : T.green;

  return (
    <div className="glass-card" style={{ padding: 20, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.15em" }}>SENSOR DATASET</div>
        <div style={{ position: "relative" }}>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="FILTER…"
            style={{
              padding: "6px 12px", paddingLeft: 28, borderRadius: 8,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
              color: T.text, fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.05em",
              outline: "none", width: 160,
            }} />
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: T.textMuted, fontSize: 12 }}>⊕</span>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {cols.map((c) => (
                <th key={c.key} onClick={() => toggleSort(c.key)} style={{
                  padding: "8px 12px", textAlign: "left", cursor: "pointer",
                  fontFamily: T.fontMono, fontSize: 9, color: sortKey === c.key ? T.cyan : T.textMuted,
                  letterSpacing: "0.1em", fontWeight: 600, whiteSpace: "nowrap",
                  borderBottom: sortKey === c.key ? `1px solid ${T.cyan}40` : "none",
                }}>
                  {c.label} {sortKey === c.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const phAlert = row.ph < 6.0 || row.ph > 9.0;
              const turbAlert = row.turbidity > 8;
              const tdsAlert = row.tds > 800;
              return (
                <tr key={row.slNo} className="table-row" style={{
                  borderBottom: `1px solid rgba(255,255,255,0.03)`,
                  background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                  animation: "float-up 0.3s ease forwards",
                  animationDelay: `${i * 0.05}s`,
                }}>
                  <td style={{ padding: "8px 12px", fontFamily: T.fontMono, fontSize: 10, color: T.textMuted }}>{row.slNo}</td>
                  <td style={{ padding: "8px 12px", fontFamily: T.fontMono, fontSize: 10, color: T.textDim }}>{row.time}</td>
                  <td style={{ padding: "8px 12px", fontFamily: T.fontMono, fontSize: 11, color: phAlert ? T.red : T.cyan, fontWeight: phAlert ? 700 : 400 }}>
                    {row.ph.toFixed(2)}
                  </td>
                  <td style={{ padding: "8px 12px", fontFamily: T.fontMono, fontSize: 11, color: turbAlert ? T.red : T.violet, fontWeight: turbAlert ? 700 : 400 }}>
                    {row.turbidity.toFixed(2)}
                  </td>
                  <td style={{ padding: "8px 12px", fontFamily: T.fontMono, fontSize: 11, color: tdsAlert ? T.red : "#0099ff", fontWeight: tdsAlert ? 700 : 400 }}>
                    {row.tds.toFixed(1)}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 6,
                      background: `${sourceColor(row.source)}15`,
                      border: `1px solid ${sourceColor(row.source)}40`,
                      fontFamily: T.fontMono, fontSize: 8, color: sourceColor(row.source),
                      letterSpacing: "0.08em",
                    }}>{row.source.toUpperCase()}</span>
                  </td>
                </tr>
              );
            })}
            {!sorted.length && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", fontFamily: T.fontMono, fontSize: 11, color: T.textMuted }}>
                AWAITING SENSOR DATA…
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

/* ======================================================
   TOAST
====================================================== */
const ToastItem = memo(({ toast, onDismiss }) => {
  const colors = { success: T.green, error: T.red, info: T.cyan, warning: T.amber };
  const icons = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };
  const color = colors[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div onClick={() => onDismiss(toast.id)} style={{
      padding: "12px 16px", borderRadius: 12,
      background: `rgba(2,8,18,0.95)`,
      backdropFilter: T.blur,
      border: `1px solid ${color}40`,
      color: T.text, fontSize: 13, fontFamily: T.fontBody,
      cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
      boxShadow: `0 4px 24px ${color}20`,
      animation: "toast-in 0.3s ease forwards",
      minWidth: 280, maxWidth: 360,
    }}>
      <div style={{ width: 24, height: 24, borderRadius: 8, background: `${color}20`, border: `1px solid ${color}40`,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.fontMono, fontSize: 12, color, flexShrink: 0 }}>
        {icons[toast.type]}
      </div>
      <span style={{ flex: 1, fontSize: 12, color: T.text }}>{toast.message}</span>
    </div>
  );
});

/* ======================================================
   PREDICTION RESULT BANNER
====================================================== */
const PredictionBanner = memo(({ prediction }) => {
  const meta = BRACKET_META[prediction.bracket];
  const info = FILTRATION_LIBRARY[prediction.bracket];

  return (
    <div style={{
      padding: 24, borderRadius: T.radius,
      background: `rgba(2,8,18,0.9)`,
      backdropFilter: T.blur,
      border: `1px solid ${meta.color}50`,
      boxShadow: `0 0 40px ${meta.glow}, 0 0 80px ${meta.glow}40`,
      animation: "slide-in-down 0.5s ease forwards",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: `${meta.color}15`, border: `1px solid ${meta.color}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, boxShadow: `0 0 20px ${meta.color}40`,
          animation: "bracket-glow 2s ease infinite",
        }}>{meta.icon}</div>
        <div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 28, color: meta.color, letterSpacing: "0.1em", lineHeight: 1 }}>
            {prediction.bracket}
          </div>
          <div style={{ fontFamily: T.fontMono, fontSize: 12, color: T.textDim, marginTop: 4 }}>{info.title}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{
            padding: "6px 16px", borderRadius: 10,
            background: `${meta.color}15`, border: `1px solid ${meta.color}40`,
            fontFamily: T.fontMono, fontSize: 11, color: meta.color, letterSpacing: "0.12em",
          }}>SEVERITY: {meta.severity.toUpperCase()}</div>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.textDim, marginTop: 6 }}>
            ROUTE → TANK {prediction.suggestedTank}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "TANK", value: info.tank, color: meta.color },
          { label: "STATUS", value: prediction.reusable ? "REUSABLE" : "TREATMENT REQ.", color: prediction.reusable ? T.green : T.red },
          { label: "METHOD", value: info.method[0], color: T.cyan },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: "12px 16px", borderRadius: 12,
            background: `${color}08`, border: `1px solid ${color}25`,
          }}>
            <div style={{ fontFamily: T.fontMono, fontSize: 8, color: T.textMuted, letterSpacing: "0.12em", marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: T.fontMono, fontSize: 12, color, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textDim, lineHeight: 1.6, padding: "0 4px" }}>
        {info.explanation}
      </div>
    </div>
  );
});

/* ======================================================
   SESSION HISTORY
====================================================== */
const SessionHistoryPanel = memo(({ iterations, onExport, onClear }) => {
  const [expanded, setExpanded] = useState(null);
  if (!iterations.length) return null;

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.15em" }}>SESSION HISTORY ({iterations.length})</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onExport} style={{
            padding: "6px 14px", borderRadius: 8, background: `${T.cyan}10`,
            border: `1px solid ${T.cyan}40`, color: T.cyan, fontFamily: T.fontMono, fontSize: 10, cursor: "pointer",
          }}>↓ CSV</button>
          <button onClick={onClear} style={{
            padding: "6px 14px", borderRadius: 8, background: `${T.red}10`,
            border: `1px solid ${T.red}40`, color: T.red, fontFamily: T.fontMono, fontSize: 10, cursor: "pointer",
          }}>⊗ CLEAR</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...iterations].reverse().map((it) => {
          const meta = it.prediction ? BRACKET_META[it.prediction.bracket] : null;
          const wqi = computeWQI(it.avg.ph, it.avg.turbidity, it.avg.tds);
          const wm = wqiMeta(wqi);
          const isExp = expanded === it.id;

          return (
            <div key={it.id} style={{
              borderRadius: 12, border: `1px solid ${meta?.color + "30" ?? T.border}`,
              background: "rgba(255,255,255,0.02)", overflow: "hidden",
            }}>
              <div onClick={() => setExpanded(isExp ? null : it.id)} style={{
                padding: "12px 16px", display: "flex", justifyContent: "space-between",
                alignItems: "center", cursor: "pointer",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {meta && <span style={{
                    padding: "2px 10px", borderRadius: 6,
                    background: `${meta.color}15`, border: `1px solid ${meta.color}40`,
                    fontFamily: T.fontDisplay, fontSize: 11, color: meta.color,
                  }}>{it.prediction.bracket}</span>}
                  <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text }}>{it.name}</span>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: it.mode === "live" ? T.red : T.cyan }}>
                    {it.mode === "live" ? "● LIVE" : "◎ SIM"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 11, color: wm.color }}>WQI {wqi}</span>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted }}>{new Date(it.timestamp).toLocaleString()}</span>
                  <span style={{ color: T.textMuted, fontSize: 12 }}>{isExp ? "▲" : "▼"}</span>
                </div>
              </div>
              {isExp && (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${T.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 12 }}>
                    {[
                      { l: "AVG pH", v: it.avg.ph.toFixed(2), c: T.cyan },
                      { l: "AVG TURBIDITY", v: `${it.avg.turbidity.toFixed(2)} NTU`, c: T.violet },
                      { l: "AVG TDS", v: `${it.avg.tds.toFixed(1)} mg/L`, c: "#0099ff" },
                    ].map(({ l, v, c }) => (
                      <div key={l} style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                        <div style={{ fontFamily: T.fontMono, fontSize: 8, color: T.textMuted, letterSpacing: "0.1em" }}>{l}</div>
                        <div style={{ fontFamily: T.fontDisplay, fontSize: 15, color: c, marginTop: 4 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ======================================================
   MAIN DASHBOARD
====================================================== */
export default function LiveDashboard() {
  /* ── state ── */
  const bufferRef = useRef([]);
  const driftRef = useRef(createDriftState());
  const slCounterRef = useRef(loadCounter());
  const [bufferSize, setBufferSize] = useState(0);
  const [rows, setRows] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [mode, setMode] = useState("idle");
  const [iterationName, setIterationName] = useState("");
  const [readyToSave, setReadyToSave] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [deployingLive, setDeployingLive] = useState(false);
  const [iterations, setIterations] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [pumpBusy, setPumpBusy] = useState(false);
  const [lastPumpCommand, setLastPumpCommand] = useState(null);
  const [activeCommand, setActiveCommand] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const seenTimestamps = useRef(new Set());
  const prevModeRef = useRef("idle");

  /* ── derived ── */
  const avg = useMemo(() => ({
    ph:        rows.length ? rows.reduce((s, r) => s + r.ph,        0) / rows.length : 0,
    turbidity: rows.length ? rows.reduce((s, r) => s + r.turbidity, 0) / rows.length : 0,
    tds:       rows.length ? rows.reduce((s, r) => s + r.tds,       0) / rows.length : 0,
  }), [rows]);

  const wqiScore = useMemo(() => rows.length ? computeWQI(avg.ph, avg.turbidity, avg.tds) : 0, [avg, rows.length]);
  const anomalies = useMemo(() => detectAnomalies(rows), [rows]);
  const healthScore = useMemo(() => computeHealthScore(bufferRef.current), [bufferSize]);
  const trend = useMemo(() => computeTrend(bufferRef.current), [bufferSize]);

  /* sparkline data derived from buffer */
  const sparkPH        = useMemo(() => bufferRef.current.slice(-20).map((r) => r.ph),        [bufferSize]);
  const sparkTDS       = useMemo(() => bufferRef.current.slice(-20).map((r) => r.tds),       [bufferSize]);
  const sparkTurbidity = useMemo(() => bufferRef.current.slice(-20).map((r) => r.turbidity), [bufferSize]);

  /* chart data (more points) */
  const chartPH        = useMemo(() => bufferRef.current.slice(-40).map((r) => r.ph),        [bufferSize]);
  const chartTDS       = useMemo(() => bufferRef.current.slice(-40).map((r) => r.tds),       [bufferSize]);
  const chartTurbidity = useMemo(() => bufferRef.current.slice(-40).map((r) => r.turbidity), [bufferSize]);

  /* ── boot ── */
  useEffect(() => {
    const stored = loadBuffer();
    if (stored.length) {
      bufferRef.current = stored;
      setBufferSize(stored.length);
      const last = stored[stored.length - 1];
      driftRef.current.ph.current = last.ph;
      driftRef.current.turbidity.current = last.turbidity;
      driftRef.current.tds.current = last.tds;
      setRows(stored.slice(-MAX_ROWS));
    }
    try { setIterations(JSON.parse(localStorage.getItem("waterIQ_iterations") || "[]")); } catch { setIterations([]); }
  }, []);

  /* ── toast helpers ── */
  const addToast = useCallback((message, type = "info") => {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), message, type }]);
  }, []);
  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  /* ── idle stream ── */
  useEffect(() => {
    if (mode !== "idle") return;
    const tick = () => {
      const isAnomaly = Math.random() < ANOMALY_PROB;
      const row = generateDriftReading(driftRef.current, slCounterRef.current++, isAnomaly);
      saveCounter(slCounterRef.current);
      bufferRef.current = [...bufferRef.current, row].slice(-ROLLING_BUFFER_MAX);
      saveBuffer(bufferRef.current);
      setBufferSize(bufferRef.current.length);
      setRows(bufferRef.current.slice(-MAX_ROWS));
    };
    tick();
    const id = setInterval(tick, INTERVAL_MS);
    return () => clearInterval(id);
  }, [mode]);

  /* ── simulation tick ── */
  useEffect(() => {
    if (mode !== "simulation") return;
    if (rows.length >= MAX_ROWS) return;
    const id = setInterval(() => {
      setRows((prev) => {
        if (prev.length >= MAX_ROWS) return prev;
        const isAnomaly = Math.random() < ANOMALY_PROB;
        const newRow = {
          slNo: slCounterRef.current++,
          time: new Date().toLocaleTimeString(),
          ph: isAnomaly ? +(4.0 + Math.random() * 1.5).toFixed(2) : advanceDrift(driftRef.current.ph),
          turbidity: isAnomaly ? +(12 + Math.random() * 6).toFixed(2) : advanceDrift(driftRef.current.turbidity),
          tds: isAnomaly ? +(950 + Math.random() * 200).toFixed(1) : advanceDrift(driftRef.current.tds),
          source: "simulation",
        };
        const updated = [...prev, newRow];
        setSessionStatus({ active: true, completed: false, collected: updated.length, phase: "COLLECTING" });
        if (updated.length === MAX_ROWS) addToast("All readings collected — run prediction", "success");
        return updated;
      });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [mode, rows.length, addToast]);

  /* ── live readings poll ── */
  useEffect(() => {
    if (mode !== "live") return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(BACKEND_SESSION_READINGS_URL);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.readings)) {
          setRows((prev) => {
            const newOnes = data.readings.filter((r) => !seenTimestamps.current.has(r.timestamp));
            newOnes.forEach((r) => seenTimestamps.current.add(r.timestamp));
            const mapped = newOnes.map((r, i) => ({
              slNo: prev.length + i + 1, time: new Date(r.timestamp).toLocaleTimeString(),
              ph: r.ph, turbidity: r.turbidity, tds: r.tds, source: "live",
            }));
            return [...prev, ...mapped].slice(0, MAX_ROWS);
          });
        }
      } catch {}
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [mode]);

  /* ── live status poll ── */
  useEffect(() => {
    if (mode !== "live") return;
    const id = setInterval(async () => {
      try { const res = await fetch(BACKEND_SESSION_STATUS_URL); if (!res.ok) return; setSessionStatus(await res.json()); } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, [mode]);

  /* ── reset on live→idle ── */
  useEffect(() => {
    if (prevModeRef.current === "live" && mode !== "live") {
      fetch(BACKEND_SESSION_RESET_URL, { method: "POST" }).catch(() => {});
      setSessionStatus(null);
    }
    prevModeRef.current = mode;
  }, [mode]);

  /* ── pump command ── */
  const sendPumpCommand = useCallback(async (command) => {
    try {
      setPumpBusy(true); setActiveCommand(command);
      const res = await fetch(BACKEND_PUMP_COMMAND_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command }) });
      const data = await res.json();
      if (!res.ok) { addToast(data.error || "Pump command failed", "error"); return; }
      setLastPumpCommand(command);
      addToast(`Command sent: ${command}`, "success");
    } catch { addToast("Backend unavailable", "error"); }
    finally { setPumpBusy(false); setTimeout(() => setActiveCommand(null), 2000); }
  }, [addToast]);

  /* ── simulation start ── */
  const startSimulation = useCallback(() => {
    setMode("simulation"); setRows([]); setPrediction(null); setReadyToSave(false);
    seenTimestamps.current.clear();
    setSessionStatus({ active: true, completed: false, collected: 0, phase: "COLLECTING" });
    addToast("Simulation initialized — collecting sensor data", "info");
  }, [addToast]);

  /* ── live start ── */
  const startLiveSession = useCallback(async () => {
    if (deployingLive) return;
    setDeployingLive(true); setRows([]); setPrediction(null); setReadyToSave(false);
    seenTimestamps.current.clear();
    try {
      const res = await fetch(BACKEND_SESSION_START_URL, { method: "POST" });
      if (!res.ok) throw new Error();
      setMode("live"); addToast("Live sensors deployed — awaiting data", "success");
    } catch { addToast("Backend unavailable — live mode failed", "error"); }
    finally { setDeployingLive(false); }
  }, [deployingLive, addToast]);

  /* ── prediction ── */
  const runPrediction = useCallback(async () => {
    if (rows.length < MAX_ROWS) { addToast("Collect all 5 readings first", "warning"); return; }
    if (predicting) return;
    setPredicting(true);
    if (mode === "simulation" || mode === "idle") {
      const result = simulatePrediction(avg);
      setPrediction(result); setReadyToSave(true);
      setSessionStatus({ active: true, completed: false, collected: MAX_ROWS, phase: "ANALYZED" });
      addToast(`Analysis complete: ${result.bracket} → Tank ${result.suggestedTank}`, "success");
      setPredicting(false); return;
    }
    if (mode === "live") {
      try {
        const res = await fetch(BACKEND_ANALYZE_URL, { method: "POST" });
        const result = await res.json();
        if (!res.ok || result.error) { addToast(result.error || "Analysis failed", "error"); return; }
        setPrediction(result); setReadyToSave(true);
        addToast(`Analysis complete: ${result.bracket} → Tank ${result.suggestedTank}`, "success");
      } catch { addToast("Backend unavailable", "error"); }
      finally { setPredicting(false); }
    }
  }, [rows.length, predicting, mode, avg, addToast]);

  /* ── save iteration ── */
  const saveIteration = useCallback(() => {
    const it = {
      id: crypto.randomUUID(),
      name: iterationName.trim() || `Session ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      mode, rows, avg, prediction,
    };
    const updated = [...iterations, it];
    setIterations(updated);
    try { localStorage.setItem("waterIQ_iterations", JSON.stringify(updated)); } catch {}
    setIterationName(""); setReadyToSave(false);
    addToast(`Session "${it.name}" archived`, "success");
  }, [iterationName, mode, rows, avg, prediction, iterations, addToast]);

  const clearHistory = useCallback(() => {
    setIterations([]); localStorage.removeItem("waterIQ_iterations");
    addToast("Session history cleared", "info");
  }, [addToast]);

  const showPredictBtn = rows.length === MAX_ROWS && !prediction;
  const trendIcon = trend.dir === "rising" ? "↑" : trend.dir === "falling" ? "↓" : "→";
  const trendColor = trend.dir === "rising" ? T.red : trend.dir === "falling" ? T.green : T.textDim;

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <ParticleBackground />
      <ScanlineEffect />

      {/* Toast Container */}
      <div style={{ position: "fixed", top: 70, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />)}
      </div>

      {/* Layout */}
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <TopNavbar mode={mode} bufferSize={bufferSize} />

        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Main Content */}
          <div style={{ flex: 1, padding: 24, overflowY: "auto", maxHeight: "calc(100vh - 56px)" }}>

            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 20, color: T.cyan, letterSpacing: "0.15em", textShadow: `0 0 20px ${T.cyan}60` }}>
                  MISSION CONTROL
                </h1>
                <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.textMuted, marginTop: 4, letterSpacing: "0.1em" }}>
                  WATER QUALITY INTELLIGENCE SYSTEM // REAL-TIME MONITORING
                </div>
              </div>

              {/* Deploy Controls */}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={startSimulation} disabled={mode === "simulation" && rows.length < MAX_ROWS} style={{
                  padding: "10px 20px", borderRadius: 10,
                  background: `${T.cyan}10`, border: `1px solid ${T.cyan}40`,
                  color: T.cyan, fontFamily: T.fontMono, fontSize: 11, cursor: "pointer",
                  letterSpacing: "0.1em", fontWeight: 600,
                  transition: "all 0.2s",
                }}>
                  ◎ DEPLOY SIMULATION
                </button>
                <button onClick={startLiveSession} disabled={deployingLive} style={{
                  padding: "10px 20px", borderRadius: 10,
                  background: deployingLive ? `${T.red}08` : `${T.red}15`,
                  border: `1px solid ${T.red}${deployingLive ? "30" : "60"}`,
                  color: deployingLive ? T.textMuted : T.red,
                  fontFamily: T.fontMono, fontSize: 11, cursor: deployingLive ? "not-allowed" : "pointer",
                  letterSpacing: "0.1em", fontWeight: 600, transition: "all 0.2s",
                }}>
                  {deployingLive ? "⟳ DEPLOYING…" : "● DEPLOY LIVE"}
                </button>
              </div>
            </div>

            {/* ── ROW 1: METRIC CARDS ── */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              {(["ph", "tds", "turbidity"]).map((m) => (
                <MetricCard key={m} metric={m}
                  value={m === "ph" ? avg.ph : m === "tds" ? avg.tds : avg.turbidity}
                  sparkData={m === "ph" ? sparkPH : m === "tds" ? sparkTDS : sparkTurbidity}
                />
              ))}
              {rows.length > 0 && <WQIGauge score={wqiScore} />}
            </div>

            {/* ── ROW 2: CHARTS ── */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              <SensorChart title="pH TREND" data={chartPH} color={T.cyan} unit="index" />
              <SensorChart title="TURBIDITY TREND" data={chartTurbidity} color={T.violet} unit="NTU" />
              <SensorChart title="TDS TREND" data={chartTDS} color="#0099ff" unit="mg/L" />
            </div>

            {/* ── ROW 3: HEALTH + ALERTS + TANK ── */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              {/* Left: Health + Status */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 200 }}>
                <SystemHealthGauge score={healthScore} />
                {/* pH Trend indicator */}
                <div className="glass-card" style={{ padding: 16 }}>
                  <div style={{ fontFamily: T.fontMono, fontSize: 8, color: T.textMuted, letterSpacing: "0.12em", marginBottom: 10 }}>pH TREND ANALYSIS</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 28, color: trendColor }}>{trendIcon}</span>
                    <div>
                      <div style={{ fontFamily: T.fontDisplay, fontSize: 16, color: trendColor }}>{trend.dir.toUpperCase()}</div>
                      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted }}>Δ {trend.delta > 0 ? "+" : ""}{trend.delta}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontFamily: T.fontMono, fontSize: 9, color: T.textDim }}>
                    SAMPLES <span style={{ color: T.cyan }}>{bufferRef.current.length.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Center: Alerts */}
              <div style={{ flex: 1, minWidth: 280 }}>
                <AlertsPanel anomalies={anomalies} />
              </div>

              {/* Right: 3D Tank */}
              <div style={{ minWidth: 260 }}>
                <TankVisualization3D ph={avg.ph} turbidity={avg.turbidity} tds={avg.tds} anomalies={anomalies} />
              </div>
            </div>

            {/* ── ROW 4: DATASET TABLE ── */}
            <div style={{ marginBottom: 20 }}>
              <DatasetTable rows={rows} />
            </div>

            {/* ── ROW 5: COLLECTION PROGRESS ── */}
            {mode !== "idle" && rows.length < MAX_ROWS && (
              <div style={{ marginBottom: 20 }}>
                <CollectionProgress collected={rows.length} total={MAX_ROWS} />
              </div>
            )}

            {/* Backend phase indicator */}
            {mode === "live" && sessionStatus && (
              <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 10,
                background: `${T.cyan}08`, border: `1px solid ${T.cyan}20`,
                fontFamily: T.fontMono, fontSize: 10, color: T.textDim }}>
                BACKEND PHASE: <span style={{ color: T.cyan }}>{sessionStatus.phase}</span>
              </div>
            )}

            {/* ── ROW 6: PREDICTION BUTTON ── */}
            {showPredictBtn && (
              <button onClick={runPrediction} disabled={predicting} style={{
                width: "100%", marginBottom: 20,
                padding: "18px 24px", borderRadius: 14,
                background: predicting
                  ? "rgba(0,229,255,0.05)"
                  : `linear-gradient(135deg, ${T.cyan}20, ${T.blue}20)`,
                border: `1px solid ${T.cyan}${predicting ? "30" : "80"}`,
                color: T.cyan, fontFamily: T.fontDisplay, fontSize: 14,
                letterSpacing: "0.2em", fontWeight: 700,
                cursor: predicting ? "not-allowed" : "pointer",
                boxShadow: predicting ? "none" : T.glowStrong(),
                transition: "all 0.3s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              }}>
                {predicting ? (
                  <>
                    <div style={{ width: 16, height: 16, border: `2px solid ${T.cyan}40`, borderTopColor: T.cyan, borderRadius: "50%", animation: "rotate-slow 0.8s linear infinite" }} />
                    RUNNING ANALYSIS…
                  </>
                ) : (
                  <> ◈ INITIATE WATER QUALITY ANALYSIS </>
                )}
              </button>
            )}

            {/* ── PREDICTION RESULT ── */}
            {prediction && (
              <div style={{ marginBottom: 20 }}>
                <PredictionBanner prediction={prediction} />
              </div>
            )}

            {/* ── SAVE ITERATION ── */}
            {readyToSave && (
              <div style={{ marginBottom: 20, padding: 20, borderRadius: 14,
                background: `${T.green}05`, border: `1px dashed ${T.green}40`,
                display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}`, flexShrink: 0 }} />
                <input value={iterationName} onChange={(e) => setIterationName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveIteration()}
                  placeholder="NAME THIS SESSION…"
                  style={{
                    flex: 1, padding: "12px 16px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)", color: T.text,
                    border: `1px solid ${T.green}40`, outline: "none",
                    fontFamily: T.fontMono, fontSize: 11, letterSpacing: "0.1em",
                  }} />
                <button onClick={saveIteration} style={{
                  padding: "12px 24px", borderRadius: 10, flexShrink: 0,
                  background: `${T.green}20`, border: `1px solid ${T.green}60`,
                  color: T.green, fontFamily: T.fontDisplay, fontSize: 11,
                  cursor: "pointer", letterSpacing: "0.12em",
                  boxShadow: T.glow(T.green),
                }}>ARCHIVE SESSION</button>
              </div>
            )}

            {/* ── ROW 7: PUMP + SESSION ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <PumpControlPanel pumpBusy={pumpBusy} lastPumpCommand={lastPumpCommand} onCommand={sendPumpCommand} activeCommand={activeCommand} />
              {/* System info panel */}
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textDim, letterSpacing: "0.15em", marginBottom: 16 }}>SYSTEM PARAMETERS</div>
                {[
                  { label: "SAMPLE INTERVAL", value: `${INTERVAL_MS / 1000}s`, color: T.cyan },
                  { label: "BUFFER CAPACITY", value: `${ROLLING_BUFFER_MAX.toLocaleString()} pts`, color: T.blue },
                  { label: "ANOMALY THRESHOLD", value: `${ANOMALY_PROB * 100}%`, color: T.amber },
                  { label: "TREND WINDOW", value: `${TREND_WINDOW} samples`, color: T.violet },
                  { label: "COLLECTION TARGET", value: `${MAX_ROWS} readings`, color: T.green },
                  { label: "BACKEND STATUS", value: "CONNECTED", color: T.green },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted, letterSpacing: "0.08em" }}>{label}</span>
                    <span style={{ fontFamily: T.fontMono, fontSize: 9, color, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SESSION HISTORY ── */}
            <SessionHistoryPanel iterations={iterations} onExport={() => exportIterationsToCSV(iterations)} onClear={clearHistory} />

            {/* Footer space */}
            <div style={{ height: 40 }} />
          </div>
        </div>
      </div>
    </>
  );
}
