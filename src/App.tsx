import { useState } from "react";

/* ================= CONFIG ================= */
const API_URL = "https://water-quality-backend-6-8hwp.onrender.com/analyze-water";

/* ================= TYPES ================= */
type Reading = { ph: number; turbidity: number; tds: number };
type Decision = {
  reusable: string;
  tank: string;
  filtration: string;
  explanation: string;
};
type HistoryItem = {
  time: string;
  input: Reading;
  decision: Decision;
};

/* ================= APP ================= */

export default function App() {
  const [tab, setTab] = useState<"analyze" | "report" | "history">("analyze");

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1>Water Quality Decision System</h1>
      </header>

      <nav style={styles.nav}>
        <Tab label="Analyze" active={tab === "analyze"} onClick={() => setTab("analyze")} />
        <Tab label="Report" active={tab === "report"} onClick={() => setTab("report")} />
        <Tab label="History" active={tab === "history"} onClick={() => setTab("history")} />
      </nav>

      <main style={styles.main}>
        {tab === "analyze" && <Analyze />}
        {tab === "report" && <Report />}
        {tab === "history" && <History />}
      </main>
    </div>
  );
}

/* ================= ANALYZE ================= */

function Analyze() {
  const [input, setInput] = useState({ ph: "", turbidity: "", tds: "" });
  const [result, setResult] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setResult(null);

    const payload = {
      ph: Number(input.ph),
      turbidity: Number(input.turbidity),
      tds: Number(input.tds)
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setResult(data);

    const history: HistoryItem[] = JSON.parse(localStorage.getItem("history") || "[]");
    history.push({
      time: new Date().toLocaleString(),
      input: payload,
      decision: data
    });
    localStorage.setItem("history", JSON.stringify(history));

    setLoading(false);
  };

  return (
    <>
      <h2>Manual Analysis</h2>
      <Form input={input} setInput={setInput} onSubmit={submit} />

      {loading && <p>Analyzing…</p>}
      {result && <DecisionCard decision={result} />}
    </>
  );
}

/* ================= REPORT ================= */

function Report() {
  const [entries, setEntries] = useState<Reading[]>([]);
  const [input, setInput] = useState({ ph: "", turbidity: "", tds: "" });
  const [avgDecision, setAvgDecision] = useState<Decision | null>(null);

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        ph: Number(input.ph),
        turbidity: Number(input.turbidity),
        tds: Number(input.tds)
      }
    ]);
    setInput({ ph: "", turbidity: "", tds: "" });
  };

  const analyzeAverage = async () => {
    const avg = entries.reduce(
      (a, b) => ({
        ph: a.ph + b.ph,
        turbidity: a.turbidity + b.turbidity,
        tds: a.tds + b.tds
      }),
      { ph: 0, turbidity: 0, tds: 0 }
    );

    const payload = {
      ph: +(avg.ph / entries.length).toFixed(2),
      turbidity: +(avg.turbidity / entries.length).toFixed(1),
      tds: Math.round(avg.tds / entries.length)
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setAvgDecision(data);

    const history: HistoryItem[] = JSON.parse(localStorage.getItem("history") || "[]");
    history.push({
      time: new Date().toLocaleString(),
      input: payload,
      decision: data
    });
    localStorage.setItem("history", JSON.stringify(history));
  };

  return (
    <>
      <h2>Report (Averaged Inputs)</h2>
      <Form input={input} setInput={setInput} onSubmit={addEntry} buttonLabel="Add Reading" />

      {entries.length > 0 && (
        <>
          <p>{entries.length} readings added</p>
          <button style={styles.primaryBtn} onClick={analyzeAverage}>
            Analyze Average
          </button>
        </>
      )}

      {avgDecision && <DecisionCard decision={avgDecision} />}
    </>
  );
}

/* ================= HISTORY ================= */

function History() {
  const history: HistoryItem[] = JSON.parse(localStorage.getItem("history") || "[]");

  if (history.length === 0) return <p>No history yet.</p>;

  return (
    <>
      <h2>History</h2>
      {history.map((h, i) => (
        <div key={i} style={styles.historyCard}>
          <p><b>{h.time}</b></p>
          <p>pH: {h.input.ph}, Turbidity: {h.input.turbidity}, TDS: {h.input.tds}</p>
          <p>Reusable: {h.decision.reusable}</p>
          <p>Filtration: {h.decision.filtration}</p>
        </div>
      ))}
    </>
  );
}

/* ================= SHARED COMPONENTS ================= */

function Form({ input, setInput, onSubmit, buttonLabel = "Analyze" }: any) {
  return (
    <div style={styles.form}>
      {["ph", "turbidity", "tds"].map(k => (
        <input
          key={k}
          placeholder={k.toUpperCase()}
          value={input[k]}
          onChange={e => setInput({ ...input, [k]: e.target.value })}
          type="number"
        />
      ))}
      <button style={styles.primaryBtn} onClick={onSubmit}>
        {buttonLabel}
      </button>
    </div>
  );
}

function DecisionCard({ decision }: { decision: Decision }) {
  return (
    <div style={styles.card}>
      <p><b>Reusable:</b> {decision.reusable}</p>
      <p><b>Tank:</b> {decision.tank}</p>
      <p><b>Filtration:</b> {decision.filtration}</p>
      <p>{decision.explanation}</p>
    </div>
  );
}

function Tab({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.tab,
        borderBottom: active ? "3px solid #2563eb" : "none"
      }}
    >
      {label}
    </button>
  );
}

/* ================= STYLES ================= */

const styles: any = {
  app: { fontFamily: "system-ui", maxWidth: 800, margin: "auto" },
  header: { padding: 20, background: "#0f172a", color: "#fff" },
  nav: { display: "flex", gap: 20, padding: 15 },
  tab: { background: "none", border: "none", cursor: "pointer", fontSize: 16 },
  main: { padding: 20 },
  form: { display: "flex", gap: 10, marginBottom: 20 },
  primaryBtn: {
    padding: "8px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  card: {
    padding: 20,
    background: "#f8fafc",
    borderRadius: 8,
    marginTop: 20
  },
  historyCard: {
    padding: 15,
    background: "#f1f5f9",
    marginBottom: 10,
    borderRadius: 6
  }
};
