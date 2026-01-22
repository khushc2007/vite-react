import { useState } from "react";

/* =========================
   TYPES
========================= */

type Page = "live" | "history" | "reports" | "research";

type BackendResponse = {
  reusable: "YES" | "NO";
  tank: string;
  filtrationMethod: string;
  explanation: string;
};

type HistoryRecord = {
  timestamp: string;
  ph: number;
  turbidity: number;
  tds: number;
  reusable: "YES" | "NO";
  tank: string;
  filtrationMethod: string;
};

/* =========================
   ROOT APP
========================= */

export default function App() {
  const [page, setPage] = useState<Page>("live");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={styles.app}>
      <Header onMenu={() => setMenuOpen(!menuOpen)} />

      <div style={styles.body}>
        <Sidebar
          active={page}
          open={menuOpen}
          onSelect={(p) => {
            setPage(p);
            setMenuOpen(false);
          }}
        />

        <main style={styles.main}>
          {page === "live" && <LiveAnalysis />}
          {page === "history" && <History />}
          {page === "reports" && <Reports />}
          {page === "research" && <Research />}
        </main>
      </div>
    </div>
  );
}

/* =========================
   HEADER (MOBILE + DESKTOP)
========================= */

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header style={styles.header}>
      <button style={styles.menuBtn} onClick={onMenu}>☰</button>
      <h1 style={styles.headerTitle}>Smart Water Monitoring System</h1>
    </header>
  );
}

/* =========================
   SIDEBAR
========================= */

function Sidebar({
  active,
  open,
  onSelect
}: {
  active: Page;
  open: boolean;
  onSelect: (p: Page) => void;
}) {
  return (
    <aside
      style={{
        ...styles.sidebar,
        ...(open ? styles.sidebarOpen : {})
      }}
    >
      <NavItem label="Live Analysis" active={active === "live"} onClick={() => onSelect("live")} />
      <NavItem label="History" active={active === "history"} onClick={() => onSelect("history")} />
      <NavItem label="Reports" active={active === "reports"} onClick={() => onSelect("reports")} />
      <NavItem label="Research" active={active === "research"} onClick={() => onSelect("research")} />
    </aside>
  );
}

function NavItem({ label, active, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.navItem,
        background: active ? "#2563eb" : "transparent"
      }}
    >
      {label}
    </div>
  );
}

/* =========================
   LIVE ANALYSIS
========================= */

function LiveAnalysis() {
  const [ph, setPh] = useState("");
  const [turbidity, setTurbidity] = useState("");
  const [tds, setTds] = useState("");
  const [result, setResult] = useState<BackendResponse | null>(null);
  const [error, setError] = useState("");

  async function analyze() {
    setError("");
    setResult(null);

    try {
      const res = await fetch("https://water-quality-backend-qxd3.onrender.com/analyze-water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ph: Number(ph),
          turbidity: Number(turbidity),
          tds: Number(tds)
        })
      });

      if (!res.ok) throw new Error();
      const data: BackendResponse = await res.json();
      setResult(data);

      saveHistory({
        timestamp: new Date().toLocaleString(),
        ph: Number(ph),
        turbidity: Number(turbidity),
        tds: Number(tds),
        reusable: data.reusable,
        tank: data.tank,
        filtrationMethod: data.filtrationMethod
      });
    } catch {
      setError("Unable to connect to backend service.");
    }
  }

  return (
    <section>
      <SectionTitle title="Live Water Quality Analysis" />

      <Card>
        <Input label="pH (0–14)" value={ph} set={setPh} />
        <Input label="Turbidity (NTU)" value={turbidity} set={setTurbidity} />
        <Input label="TDS (ppm)" value={tds} set={setTds} />
        <button style={styles.primaryBtn} onClick={analyze}>Analyze Sample</button>
        {error && <p style={styles.error}>{error}</p>}
      </Card>

      {result && (
        <Card>
          <Result label="Reusable" value={result.reusable} />
          <Result label="Tank Allocation" value={result.tank} />
          <Result label="Filtration Method" value={result.filtrationMethod} />
          <p style={styles.explanation}>{result.explanation}</p>
        </Card>
      )}
    </section>
  );
}

/* =========================
   HISTORY
========================= */

function History() {
  const data = loadHistory();

  return (
    <section>
      <SectionTitle title="Analysis History" />
      {data.length === 0 && <p>No records available.</p>}
      {data.map((d, i) => (
        <Card key={i}>
          <p><b>{d.timestamp}</b></p>
          <p>pH: {d.ph} | Turbidity: {d.turbidity} | TDS: {d.tds}</p>
          <p>{d.reusable} → {d.tank}</p>
          <p>Filtration: {d.filtrationMethod}</p>
        </Card>
      ))}
    </section>
  );
}

/* =========================
   REPORTS
========================= */

function Reports() {
  const data = loadHistory();
  const reusable = data.filter(d => d.reusable === "YES").length;

  return (
    <section>
      <SectionTitle title="System Reports" />
      <Card>
        <p>Total Samples: {data.length}</p>
        <p>Reusable Water: {reusable}</p>
        <p>Non-Reusable Water: {data.length - reusable}</p>
        <p>
          This report summarizes system performance based on real operational data.
        </p>
      </Card>
    </section>
  );
}

/* =========================
   RESEARCH
========================= */

function Research() {
  const papers = [
    ["WHO Water Reuse Guidelines", "World Health Organization, 2017"],
    ["Greywater Treatment Technologies", "Water Research Journal, 2020"],
    ["TDS & Turbidity Threshold Analysis", "Environmental Review, 2019"]
  ];

  return (
    <section>
      <SectionTitle title="Research & References" />
      {papers.map((p, i) => (
        <Card key={i}>
          <h3>{p[0]}</h3>
          <p>{p[1]}</p>
        </Card>
      ))}
    </section>
  );
}

/* =========================
   REUSABLE UI
========================= */

function SectionTitle({ title }: { title: string }) {
  return <h2 style={styles.sectionTitle}>{title}</h2>;
}

function Card({ children }: any) {
  return <div style={styles.card}>{children}</div>;
}

function Input({ label, value, set }: any) {
  return (
    <div style={styles.inputGroup}>
      <label>{label}</label>
      <input style={styles.input} value={value} onChange={e => set(e.target.value)} />
    </div>
  );
}

function Result({ label, value }: any) {
  return <p><b>{label}:</b> {value}</p>;
}

/* =========================
   STORAGE
========================= */

function loadHistory(): HistoryRecord[] {
  return JSON.parse(localStorage.getItem("history") || "[]");
}

function saveHistory(entry: HistoryRecord) {
  const h = loadHistory();
  h.push(entry);
  localStorage.setItem("history", JSON.stringify(h));
}

/* =========================
   STYLES (RESPONSIVE)
========================= */

const styles: any = {
  app: { fontFamily: "system-ui", background: "#f8fafc", minHeight: "100vh" },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    background: "#0f172a",
    color: "#fff"
  },
  headerTitle: { marginLeft: 12, fontSize: 18 },
  menuBtn: { fontSize: 20, background: "none", border: "none", color: "#fff" },

  body: { display: "flex", flexWrap: "wrap" },
  sidebar: {
    width: 220,
    background: "#111827",
    color: "#fff",
    padding: 12
  },
  sidebarOpen: { display: "block" },

  navItem: { padding: 10, cursor: "pointer", borderRadius: 6 },

  main: { flex: 1, padding: 20, minWidth: 0 },

  sectionTitle: { marginBottom: 12 },

  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  },

  inputGroup: { marginBottom: 10 },
  input: { width: "100%", padding: 8 },

  primaryBtn: {
    marginTop: 10,
    padding: "10px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6
  },

  explanation: { marginTop: 8, color: "#334155" },
  error: { color: "red", marginTop: 8 }
};
