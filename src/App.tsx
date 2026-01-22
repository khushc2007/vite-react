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
  const [page, setPage] = useState<
    "analyze" | "report" | "history" | "applications"
  >("analyze");

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>WATER•IQ</h2>

        <SidebarItem label="Analyze" onClick={() => setPage("analyze")} />
        <SidebarItem label="Report" onClick={() => setPage("report")} />
        <SidebarItem label="History" onClick={() => setPage("history")} />
        <SidebarItem
          label="Applications"
          onClick={() => setPage("applications")}
        />
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        {page === "analyze" && <Analyze />}
        {page === "report" && <Report />}
        {page === "history" && <History />}
        {page === "applications" && <Applications />}
      </main>
    </div>
  );
}

/* ================= SIDEBAR ITEM ================= */

function SidebarItem({
  label,
  onClick
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div style={styles.sidebarItem} onClick={onClick}>
      {label}
    </div>
  );
}

/* ================= ANALYZE ================= */

function Analyze() {
  const [input, setInput] = useState({ ph: "", turbidity: "", tds: "" });
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setDecision(null);

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
    setDecision(data);

    const history: HistoryItem[] = JSON.parse(
      localStorage.getItem("history") || "[]"
    );
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
      <h1>Manual Water Analysis</h1>

      <div style={styles.grid3}>
        <Input label="pH" value={input.ph} setValue={v => setInput({ ...input, ph: v })} />
        <Input
          label="Turbidity (NTU)"
          value={input.turbidity}
          setValue={v => setInput({ ...input, turbidity: v })}
        />
        <Input
          label="TDS (ppm)"
          value={input.tds}
          setValue={v => setInput({ ...input, tds: v })}
        />
      </div>

      <button style={styles.primaryBtn} onClick={analyze}>
        Analyze
      </button>

      {loading && <p>Processing…</p>}
      {decision && <DecisionCard decision={decision} />}
    </>
  );
}

/* ================= REPORT ================= */
/* AVERAGE OF ENTIRE HISTORY */

function Report() {
  const history: HistoryItem[] = JSON.parse(
    localStorage.getItem("history") || "[]"
  );

  if (history.length === 0) {
    return <p>No history available for report.</p>;
  }

  const avg = history.reduce(
    (a, b) => ({
      ph: a.ph + b.input.ph,
      turbidity: a.turbidity + b.input.turbidity,
      tds: a.tds + b.input.tds
    }),
    { ph: 0, turbidity: 0, tds: 0 }
  );

  const avgData = {
    ph: +(avg.ph / history.length).toFixed(2),
    turbidity: +(avg.turbidity / history.length).toFixed(1),
    tds: Math.round(avg.tds / history.length)
  };

  return (
    <>
      <h1>System Report (Averaged)</h1>

      <div style={styles.grid3}>
        <Metric title="Average pH" value={avgData.ph} />
        <Metric title="Average Turbidity" value={avgData.turbidity} />
        <Metric title="Average TDS" value={avgData.tds} />
      </div>

      <p style={styles.note}>
        Report generated from {history.length} historical analyses.
      </p>
    </>
  );
}

/* ================= HISTORY ================= */

function History() {
  const history: HistoryItem[] = JSON.parse(
    localStorage.getItem("history") || "[]"
  );

  if (history.length === 0) return <p>No history yet.</p>;

  return (
    <>
      <h1>History</h1>
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

/* ================= APPLICATIONS ================= */

function Applications() {
  return (
    <>
      <h1>Real-World Applications</h1>
      <p>
        This section will describe practical deployments such as:
      </p>
      <ul>
        <li>Agricultural water reuse</li>
        <li>Aquaculture monitoring</li>
        <li>Smart irrigation systems</li>
        <li>Industrial wastewater pre-treatment</li>
      </ul>
      <p>
        (Content to be expanded.)
      </p>
    </>
  );
}

/* ================= UI COMPONENTS ================= */

function Input({
  label,
  value,
  setValue
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <div style={styles.inputGroup}>
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <div style={styles.metric}>
      <h3>{title}</h3>
      <p>{value}</p>
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

/* ================= STYLES ================= */

const styles: any = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: "#020617",
    color: "#e5e7eb",
    fontFamily: "system-ui"
  },
  sidebar: {
    width: 220,
    background: "#020617",
    borderRight: "1px solid #1e293b",
    padding: 20
  },
  logo: {
    marginBottom: 30,
    letterSpacing: 2
  },
  sidebarItem: {
    padding: 12,
    cursor: "pointer",
    borderBottom: "1px solid #1e293b"
  },
  main: {
    flex: 1,
    padding: 30
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 20
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  primaryBtn: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  metric: {
    background: "#020617",
    border: "1px solid #1e293b",
    padding: 20,
    borderRadius: 8,
    textAlign: "center"
  },
  card: {
    marginTop: 20,
    padding: 20,
    background: "#020617",
    border: "1px solid #1e293b",
    borderRadius: 8
  },
  historyCard: {
    marginBottom: 15,
    padding: 15,
    border: "1px solid #1e293b",
    borderRadius: 6
  },
  note: {
    marginTop: 20,
    color: "#94a3b8"
  }
};
