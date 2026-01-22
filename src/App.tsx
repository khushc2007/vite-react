import { useEffect, useState } from "react";

/* ===================== TYPES ===================== */
type Analysis = {
  timestamp: string;
  ph: number;
  turbidity: number;
  tds: number;
  reusable: string;
  tank: string;
  filtrationMethod: string;
};

type ApiResponse = {
  reusable: string;
  tank: string;
  filtrationMethod: string;
  explanation: string;
};

/* ===================== MAIN APP ===================== */
export default function App() {
  const [page, setPage] = useState<"live" | "history" | "reports" | "research">("live");

  return (
    <div style={styles.app}>
      <Sidebar setPage={setPage} />
      <main style={styles.main}>
        {page === "live" && <LiveAnalysis />}
        {page === "history" && <History />}
        {page === "reports" && <Reports />}
        {page === "research" && <Research />}
      </main>
    </div>
  );
}

/* ===================== LIVE ANALYSIS ===================== */
function LiveAnalysis() {
  const [ph, setPh] = useState("");
  const [turbidity, setTurbidity] = useState("");
  const [tds, setTds] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);

  async function analyze() {
    const res = await fetch("https://water-quality-backend-qxd3.onrender.com/analyze-water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ph: Number(ph),
        turbidity: Number(turbidity),
        tds: Number(tds)
      })
    });

    const data = await res.json();
    setResult(data);

    const history: Analysis[] = JSON.parse(localStorage.getItem("history") || "[]");

    history.push({
      timestamp: new Date().toLocaleString(),
      ph: Number(ph),
      turbidity: Number(turbidity),
      tds: Number(tds),
      reusable: data.reusable,
      tank: data.tank,
      filtrationMethod: data.filtrationMethod
    });

    localStorage.setItem("history", JSON.stringify(history));
  }

  return (
    <section>
      <h1>Live Water Quality Analysis</h1>

      <Input label="pH" value={ph} set={setPh} />
      <Input label="Turbidity (NTU)" value={turbidity} set={setTurbidity} />
      <Input label="TDS (ppm)" value={tds} set={setTds} />

      <button style={styles.button} onClick={analyze}>Analyze</button>

      {result && (
        <div style={styles.card}>
          <p><b>Reusable:</b> {result.reusable}</p>
          <p><b>Tank:</b> {result.tank}</p>
          <p><b>Filtration:</b> {result.filtrationMethod}</p>
          <p>{result.explanation}</p>
        </div>
      )}
    </section>
  );
}

/* ===================== HISTORY ===================== */
function History() {
  const history: Analysis[] = JSON.parse(localStorage.getItem("history") || "[]");

  return (
    <section>
      <h1>Analysis History</h1>
      {history.length === 0 && <p>No records yet.</p>}

      {history.map((h, i) => (
        <div key={i} style={styles.card}>
          <p>{h.timestamp}</p>
          <p>pH: {h.ph}, Turbidity: {h.turbidity}, TDS: {h.tds}</p>
          <p>{h.reusable} → {h.tank}</p>
          <p>Filtration: {h.filtrationMethod}</p>
        </div>
      ))}
    </section>
  );
}

/* ===================== REPORTS ===================== */
function Reports() {
  const history: Analysis[] = JSON.parse(localStorage.getItem("history") || "[]");

  const reusableCount = history.filter(h => h.reusable === "YES").length;
  const avg = (key: keyof Analysis) =>
    history.reduce((s, h) => s + (h[key] as number), 0) / (history.length || 1);

  return (
    <section>
      <h1>System Reports</h1>

      <div style={styles.card}>
        <p>Total Samples: {history.length}</p>
        <p>Reusable Water: {reusableCount}</p>
        <p>Non-Reusable Water: {history.length - reusableCount}</p>
        <p>Average pH: {avg("ph").toFixed(2)}</p>
        <p>Average Turbidity: {avg("turbidity").toFixed(2)}</p>
        <p>Average TDS: {avg("tds").toFixed(2)}</p>
      </div>

      <p>
        <b>Conclusion:</b> The system successfully classifies greywater and
        recommends filtration strategies based on scientifically defined thresholds.
      </p>
    </section>
  );
}

/* ===================== RESEARCH ===================== */
function Research() {
  const papers = [
    {
      title: "WHO Guidelines for Water Reuse",
      abstract: "Defines acceptable limits for water reuse in non-potable applications.",
      citation: "WHO, 2017"
    },
    {
      title: "Greywater Treatment Techniques",
      abstract: "Compares filtration and membrane-based treatment methods.",
      citation: "Journal of Water Research, 2020"
    },
    {
      title: "Turbidity as a Quality Indicator",
      abstract: "Analyzes the impact of suspended solids on reuse safety.",
      citation: "Environmental Monitoring Review, 2019"
    }
  ];

  return (
    <section>
      <h1>Research Library</h1>
      {papers.map((p, i) => (
        <div key={i} style={styles.card}>
          <h3>{p.title}</h3>
          <p>{p.abstract}</p>
          <p><i>{p.citation}</i></p>
        </div>
      ))}
    </section>
  );
}

/* ===================== COMPONENTS ===================== */
function Sidebar({ setPage }: any) {
  return (
    <aside style={styles.sidebar}>
      <h2>WaterSys</h2>
      <Nav label="Live Analysis" onClick={() => setPage("live")} />
      <Nav label="History" onClick={() => setPage("history")} />
      <Nav label="Reports" onClick={() => setPage("reports")} />
      <Nav label="Research" onClick={() => setPage("research")} />
    </aside>
  );
}

function Nav({ label, onClick }: any) {
  return <div style={styles.nav} onClick={onClick}>{label}</div>;
}

function Input({ label, value, set }: any) {
  return (
    <div>
      <label>{label}</label>
      <input value={value} onChange={e => set(e.target.value)} />
    </div>
  );
}

/* ===================== STYLES ===================== */
const styles: any = {
  app: { display: "flex", fontFamily: "sans-serif" },
  sidebar: { width: 220, background: "#111827", color: "#fff", padding: 20 },
  nav: { padding: 10, cursor: "pointer", background: "#1f2937", marginTop: 8 },
  main: { flex: 1, padding: 30 },
  button: { padding: 10, marginTop: 10 },
  card: { background: "#f1f5f9", padding: 15, marginTop: 15, borderRadius: 6 }
};
