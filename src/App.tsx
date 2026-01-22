import { useState } from "react";

export default function App() {
  const [ph, setPh] = useState("");
  const [turbidity, setTurbidity] = useState("");
  const [tds, setTds] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeWater() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "https://YOUR_BACKEND_URL/analyze-water",
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
        throw new Error("Backend error");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>WatMonitor</h2>
        <nav style={styles.nav}>
          <NavItem label="Live Analysis" />
          <NavItem label="History" />
          <NavItem label="Research" />
          <NavItem label="System Architecture" />
          <NavItem label="Reports" />
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <h1 style={styles.heading}>
          Smart Greywater Monitoring Dashboard
        </h1>

        {/* Input Panel */}
        <section style={styles.card}>
          <h3>Sensor Input</h3>

          <div style={styles.grid}>
            <Input
              label="pH"
              unit="(0–14)"
              value={ph}
              onChange={setPh}
            />
            <Input
              label="Turbidity"
              unit="NTU"
              value={turbidity}
              onChange={setTurbidity}
            />
            <Input
              label="TDS"
              unit="ppm"
              value={tds}
              onChange={setTds}
            />
          </div>

          <button
            style={styles.button}
            onClick={analyzeWater}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Water"}
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </section>

        {/* Results Panel */}
        {result && (
          <section style={styles.card}>
            <h3>Analysis Result</h3>

            <div style={styles.resultGrid}>
              <ResultBox
                title="Reusability"
                value={result.reusable}
              />
              <ResultBox
                title="Water Routing"
                value={result.tank}
              />
              <ResultBox
                title="Filtration Bracket"
                value={result.filtrationBracket}
              />
              <ResultBox
                title="Filtration Method"
                value={result.filtrationMethod}
              />
            </div>

            <div style={styles.explanation}>
              <strong>Explanation:</strong>
              <p>{result.explanation}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ---------------- Components ---------------- */

function NavItem({ label }: { label: string }) {
  return <div style={styles.navItem}>{label}</div>;
}

function Input({
  label,
  unit,
  value,
  onChange
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={styles.inputBox}>
      <label>
        {label} <span style={styles.unit}>{unit}</span>
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}

function ResultBox({
  title,
  value
}: {
  title: string;
  value: string;
}) {
  return (
    <div style={styles.resultBox}>
      <span style={styles.resultTitle}>{title}</span>
      <span style={styles.resultValue}>{value}</span>
    </div>
  );
}

/* ---------------- Styles ---------------- */

const styles: any = {
  app: {
    display: "flex",
    height: "100vh",
    fontFamily: "Inter, system-ui, sans-serif",
    background: "#f4f6f8"
  },
  sidebar: {
    width: "240px",
    background: "#0f172a",
    color: "#fff",
    padding: "20px"
  },
  logo: {
    marginBottom: "30px"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  navItem: {
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
    background: "#1e293b"
  },
  main: {
    flex: 1,
    padding: "30px",
    overflowY: "auto"
  },
  heading: {
    marginBottom: "20px"
  },
  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    marginBottom: "20px"
  },
  inputBox: {
    display: "flex",
    flexDirection: "column"
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  unit: {
    color: "#64748b",
    fontSize: "12px"
  },
  button: {
    padding: "12px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  error: {
    marginTop: "10px",
    color: "red"
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px"
  },
  resultBox: {
    background: "#f1f5f9",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center"
  },
  resultTitle: {
    display: "block",
    fontSize: "14px",
    color: "#475569"
  },
  resultValue: {
    fontSize: "18px",
    fontWeight: "bold",
    marginTop: "5px"
  },
  explanation: {
    marginTop: "15px",
    background: "#eef2ff",
    padding: "15px",
    borderRadius: "8px"
  }
};
