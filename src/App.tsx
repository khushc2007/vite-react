import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type AvgData = {
  ph: number;
  turbidity: number;
  tds: number;
};

type Decision = {
  reusable: string;
  tank: string;
  filtration: string;
  explanation: string;
};

type HistoryItem = {
  time: string;
  avg: AvgData;
  decision: Decision;
};

/* ================= CONFIG ================= */

// 🔴 PUT YOUR RENDER BACKEND URL HERE
const API_URL = "https://water-quality-backend-6-8hwp.onrender.com/analyze-water";

/* ================= APP ================= */

export default function App() {
  const [page, setPage] = useState<"report" | "home" | "history">("report");

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Water IQ</h2>
        <Nav label="Report" onClick={() => setPage("report")} />
        <Nav label="Home" onClick={() => setPage("home")} />
        <Nav label="History" onClick={() => setPage("history")} />
      </aside>

      <main style={styles.main}>
        {page === "report" && <Report />}
        {page === "home" && <Home />}
        {page === "history" && <History />}
      </main>
    </div>
  );
}

/* ================= NAV ================= */

function Nav({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div style={styles.navItem} onClick={onClick}>
      {label}
    </div>
  );
}

/* ================= REPORT PAGE ================= */
/* Collects data every 5s for 5 minutes */

function Report() {
  const [avg, setAvg] = useState<AvgData | null>(null);

  useEffect(() => {
    let samples: AvgData[] = [];

    const interval = setInterval(() => {
      // 🔁 Replace with Arduino data later
      samples.push({
        ph: 6.5 + Math.random() * 2,
        turbidity: 10 + Math.random() * 30,
        tds: 500 + Math.random() * 800
      });

      if (samples.length === 60) {
        const sum = samples.reduce(
          (a, b) => ({
            ph: a.ph + b.ph,
            turbidity: a.turbidity + b.turbidity,
            tds: a.tds + b.tds
          }),
          { ph: 0, turbidity: 0, tds: 0 }
        );

        const avgData = {
          ph: +(sum.ph / 60).toFixed(2),
          turbidity: +(sum.turbidity / 60).toFixed(1),
          tds: Math.round(sum.tds / 60)
        };

        localStorage.setItem("latestAvg", JSON.stringify(avgData));
        setAvg(avgData);
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1>5-Minute Water Report</h1>
      {!avg ? (
        <p>Collecting sensor data…</p>
      ) : (
        <div style={styles.cards}>
          <Card title="Avg pH" value={avg.ph} />
          <Card title="Avg Turbidity (NTU)" value={avg.turbidity} />
          <Card title="Avg TDS (ppm)" value={avg.tds} />
        </div>
      )}
    </>
  );
}

/* ================= HOME PAGE ================= */
/* Calls backend for decision */

function Home() {
  const [decision, setDecision] = useState<Decision | null>(null);

  useEffect(() => {
    const avg = JSON.parse(localStorage.getItem("latestAvg") || "null");
    if (!avg) return;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(avg)
    })
      .then(res => res.json())
      .then(data => {
        const record: HistoryItem = {
          time: new Date().toLocaleString(),
          avg,
          decision: data
        };

        const history = JSON.parse(
          localStorage.getItem("history") || "[]"
        );
        history.push(record);
        localStorage.setItem("history", JSON.stringify(history));

        setDecision(data);
      });
  }, []);

  if (!decision) return <p>No report data available.</p>;

  return (
    <>
      <h1>Decision Summary</h1>
      <p><b>Reusable:</b> {decision.reusable}</p>
      <p><b>Tank:</b> {decision.tank}</p>
      <p><b>Filtration:</b> {decision.filtration}</p>
      <p><b>Explanation:</b> {decision.explanation}</p>
    </>
  );
}

/* ================= HISTORY PAGE ================= */

function History() {
  const history: HistoryItem[] =
    JSON.parse(localStorage.getItem("history") || "[]");

  if (history.length === 0) return <p>No history yet.</p>;

  return (
    <>
      <h1>History</h1>
      {history.map((h, i) => (
        <div key={i} style={styles.historyCard}>
          <p><b>Time:</b> {h.time}</p>
          <p>pH: {h.avg.ph}, Turbidity: {h.avg.turbidity}, TDS: {h.avg.tds}</p>
          <p>Reusable: {h.decision.reusable}</p>
          <p>Filtration: {h.decision.filtration}</p>
        </div>
      ))}
    </>
  );
}

/* ================= UI ================= */

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

/* ================= STYLES ================= */

const styles: any = {
  app: { display: "flex", minHeight: "100vh", fontFamily: "system-ui" },
  sidebar: {
    width: 220,
    background: "#0f172a",
    color: "#fff",
    padding: 20
  },
  logo: { marginBottom: 30 },
  navItem: {
    padding: 12,
    cursor: "pointer",
    borderBottom: "1px solid #334155"
  },
  main: { flex: 1, padding: 30, background: "#f8fafc" },
  cards: { display: "flex", gap: 20 },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },
  historyCard: {
    background: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 6
  }
};
