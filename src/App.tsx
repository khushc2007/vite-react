import { useState } from "react";

/* =====================================================
   DATA MODELS
===================================================== */

type WaterAnalysisResponse = {
  reusable: "YES" | "NO";
  tank: string;
  filtrationMethod: string;
  explanation: string;
};

type StoredAnalysis = {
  timestamp: string;
  ph: number;
  turbidity: number;
  tds: number;
  reusable: "YES" | "NO";
  tank: string;
  filtrationMethod: string;
};

/* =====================================================
   APPLICATION ROOT
===================================================== */

export default function App() {
  const [activePage, setActivePage] = useState<
    "live" | "history" | "reports" | "research"
  >("live");

  return (
    <div style={styles.application}>
      <Sidebar onNavigate={setActivePage} />

      <main style={styles.mainContent}>
        {activePage === "live" && <LiveAnalysis />}
        {activePage === "history" && <History />}
        {activePage === "reports" && <Reports />}
        {activePage === "research" && <ResearchLibrary />}
      </main>
    </div>
  );
}

/* =====================================================
   LIVE ANALYSIS PAGE
===================================================== */

function LiveAnalysis() {
  const [ph, setPh] = useState("");
  const [turbidity, setTurbidity] = useState("");
  const [tds, setTds] = useState("");
  const [result, setResult] = useState<WaterAnalysisResponse | null>(null);
  const [error, setError] = useState("");

  async function handleAnalysis() {
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "https://water-quality-backend-qxd3.onrender.com/analyze-water",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ph: Number(ph),
            turbidity: Number(turbidity),
            tds: Number(tds)
          })
        }
      );

      if (!response.ok) {
        throw new Error("Backend response error");
      }

      const data: WaterAnalysisResponse = await response.json();
      setResult(data);

      persistHistory({
        timestamp: new Date().toLocaleString(),
        ph: Number(ph),
        turbidity: Number(turbidity),
        tds: Number(tds),
        reusable: data.reusable,
        tank: data.tank,
        filtrationMethod: data.filtrationMethod
      });
    } catch {
      setError("Unable to communicate with backend service.");
    }
  }

  return (
    <section>
      <h1>Live Water Quality Analysis</h1>

      <InputField label="pH (0–14)" value={ph} onChange={setPh} />
      <InputField label="Turbidity (NTU)" value={turbidity} onChange={setTurbidity} />
      <InputField label="TDS (ppm)" value={tds} onChange={setTds} />

      <button style={styles.primaryButton} onClick={handleAnalysis}>
        Analyze Water Sample
      </button>

      {error && <p style={styles.errorText}>{error}</p>}

      {result && (
        <div style={styles.card}>
          <ResultRow label="Reusability" value={result.reusable} />
          <ResultRow label="Water Routing" value={result.tank} />
          <ResultRow label="Filtration Method" value={result.filtrationMethod} />
          <p style={styles.explanationText}>{result.explanation}</p>
        </div>
      )}
    </section>
  );
}

/* =====================================================
   HISTORY PAGE
===================================================== */

function History() {
  const history = loadHistory();

  return (
    <section>
      <h1>Historical Water Analysis Records</h1>

      {history.length === 0 && <p>No recorded analyses available.</p>}

      {history.map((entry, index) => (
        <div key={index} style={styles.card}>
          <p><strong>Timestamp:</strong> {entry.timestamp}</p>
          <p>pH: {entry.ph} | Turbidity: {entry.turbidity} NTU | TDS: {entry.tds} ppm</p>
          <p>
            Decision: {entry.reusable} → {entry.tank}
          </p>
          <p>Filtration: {entry.filtrationMethod}</p>
        </div>
      ))}
    </section>
  );
}

/* =====================================================
   REPORTS PAGE
===================================================== */

function Reports() {
  const history = loadHistory();

  const reusableCount = history.filter(h => h.reusable === "YES").length;
  const average = (key: "ph" | "turbidity" | "tds") =>
    history.reduce((sum, h) => sum + h[key], 0) / (history.length || 1);

  return (
    <section>
      <h1>System Performance Report</h1>

      <div style={styles.card}>
        <p>Total Samples Analyzed: {history.length}</p>
        <p>Reusable Samples: {reusableCount}</p>
        <p>Non-Reusable Samples: {history.length - reusableCount}</p>
        <p>Average pH: {average("ph").toFixed(2)}</p>
        <p>Average Turbidity: {average("turbidity").toFixed(2)} NTU</p>
        <p>Average TDS: {average("tds").toFixed(2)} ppm</p>
      </div>

      <p style={styles.explanationText}>
        This report summarizes the system’s effectiveness in classifying greywater
        and recommending appropriate filtration strategies based on accepted
        environmental thresholds.
      </p>
    </section>
  );
}

/* =====================================================
   RESEARCH LIBRARY
===================================================== */

function ResearchLibrary() {
  const papers = [
    {
      title: "WHO Guidelines for the Safe Use of Wastewater",
      description:
        "Defines international standards for water reuse in agriculture and domestic applications.",
      citation: "World Health Organization, 2017"
    },
    {
      title: "Greywater Treatment and Reuse Technologies",
      description:
        "A comparative study of filtration, membrane, and adsorption-based methods.",
      citation: "Journal of Water Research, 2020"
    },
    {
      title: "Turbidity and TDS as Water Quality Indicators",
      description:
        "Analyzes the correlation between suspended solids and reuse safety.",
      citation: "Environmental Monitoring Review, 2019"
    }
  ];

  return (
    <section>
      <h1>Research & Reference Library</h1>

      {papers.map((paper, index) => (
        <div key={index} style={styles.card}>
          <h3>{paper.title}</h3>
          <p>{paper.description}</p>
          <p><em>{paper.citation}</em></p>
        </div>
      ))}
    </section>
  );
}

/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

function Sidebar({
  onNavigate
}: {
  onNavigate: (page: "live" | "history" | "reports" | "research") => void;
}) {
  return (
    <aside style={styles.sidebar}>
      <h2>WaterSys</h2>
      <NavButton label="Live Analysis" onClick={() => onNavigate("live")} />
      <NavButton label="History" onClick={() => onNavigate("history")} />
      <NavButton label="Reports" onClick={() => onNavigate("reports")} />
      <NavButton label="Research" onClick={() => onNavigate("research")} />
    </aside>
  );
}

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div style={styles.navButton} onClick={onClick}>
      {label}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label>{label}</label>
      <input
        style={styles.input}
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  );
}

/* =====================================================
   LOCAL STORAGE HELPERS
===================================================== */

function loadHistory(): StoredAnalysis[] {
  return JSON.parse(localStorage.getItem("history") || "[]");
}

function persistHistory(entry: StoredAnalysis) {
  const history = loadHistory();
  history.push(entry);
  localStorage.setItem("history", JSON.stringify(history));
}

/* =====================================================
   STYLES
===================================================== */

const styles: Record<string, any> = {
  application: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
    background: "#f8fafc"
  },
  sidebar: {
    width: 240,
    background: "#0f172a",
    color: "#ffffff",
    padding: 20
  },
  navButton: {
    padding: 10,
    marginTop: 8,
    background: "#1e293b",
    cursor: "pointer",
    borderRadius: 4
  },
  mainContent: {
    flex: 1,
    padding: 30
  },
  primaryButton: {
    marginTop: 12,
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  input: {
    display: "block",
    marginBottom: 10,
    padding: 8,
    width: "100%"
  },
  card: {
    background: "#ffffff",
    padding: 16,
    marginTop: 16,
    borderRadius: 6,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  },
  errorText: {
    color: "red",
    marginTop: 10
  },
  explanationText: {
    marginTop: 10,
    color: "#334155"
  }
};
