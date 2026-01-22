import { useState } from "react";

/* ================= TYPES ================= */

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

/* ================= ROOT APP ================= */

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

/* ================= HEADER ================= */

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header style={styles.header}>
      <button style={styles.menuBtn} onClick={onMenu}>☰</button>
      <h1 style={styles.headerTitle}>Smart Water Monitoring System</h1>
    </header>
  );
}

/* ================= SIDEBAR ================= */

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
    <aside style={{ ...styles.sidebar, ...(open ? styles.sidebarOpen : {}) }}>
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
      style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
    >
      {label}
    </div>
  );
}

/* ================= LIVE ANALYSIS ================= */

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
      const res = await fetch(
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
      <h2 style={styles.sectionTitle}>Live Water Quality Analysis</h2>

      <Card>
        <Input label="pH (0–14)" value={ph} set={setPh} />
        <Input label="Turbidity (NTU)" value={turbidity} set={setTurbidity} />
        <Input label="TDS (ppm)" value={tds} set={setTds} />
        <button style={styles.primaryBtn} onClick={analyze}>Analyze Sample</button>
        {error && <p style={styles.error}>{error}</p>}
      </Card>

      {result && (
        <Card>
          <p><b>Reusable:</b> {result.reusable}</p>
          <p><b>Tank Allocation:</b> {result.tank}</p>
          <p><b>Filtration Method:</b> {result.filtrationMethod}</p>
          <p style={styles.explanation}>{result.explanation}</p>
        </Card>
      )}
    </section>
  );
}

/* ================= HISTORY ================= */

function History() {
  const data = loadHistory();

  return (
    <section>
      <h2 style={styles.sectionTitle}>Analysis History</h2>
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

/* ================= REPORTS ================= */

function Reports() {
  const data = loadHistory();
  const reusable = data.filter(d => d.reusable === "YES").length;

  return (
    <section>
      <h2 style={styles.sectionTitle}>System Reports</h2>
      <Card>
        <p>Total Samples: {data.length}</p>
        <p>Reusable Water: {reusable}</p>
        <p>Non-Reusable Water: {data.length - reusable}</p>
        <p>This report is generated from real operational data.</p>
      </Card>
    </section>
  );
}

/* ================= RESEARCH ================= */

function Research() {
  const papers = [
    ["WHO Water Reuse Guidelines", "World Health Organization, 2017"],
    ["Greywater Treatment Technologies", "Water Research Journal, 2020"],
    ["Turbidity & TDS Threshold Analysis", "Environmental Review, 2019"]
  ];

  return (
    <section>
      <h2 style={styles.sectionTitle}>Research & References</h2>
      {papers.map((p, i) => (
        <Card key={i}>
          <h3>{p[0]}</h3>
          <p>{p[1]}</p>
        </Card>
      ))}
    </section>
  );
}

/* ================= UI HELPERS ================= */

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

/* ================= STORAGE ================= */

function loadHistory(): HistoryRecord[] {
  return JSON.parse(localStorage.getItem("history") || "[]");
}

function saveHistory(entry: HistoryRecord) {
  const h = loadHistory();
  h.push(entry);
  localStorage.setItem("history", JSON.stringify(h));
}

/* ================= STYLES ================= */

const styles: any = {
  app: {
    background: "#f1f5f9",
    minHeight: "100vh",
    color: "#020617",
    fontFamily: "system-ui"
  },

  header: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    background: "#020617",
    color: "#ffffff"
  },
  headerTitle: { marginLeft: 12, fontSize: 18 },
  menuBtn: {
    fontSize: 22,
    background: "none",
    border: "none",
    color: "#ffffff",
    cursor: "pointer"
  },

  body: { display: "flex" },

  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: 240,
    background: "#020617",
    color: "#e5e7eb",
    padding: 16,
    transform: "translateX(-100%)",
    transition: "transform 0.3s ease",
    zIndex: 1000
  },
  sidebarOpen: { transform: "translateX(0)" },

  navItem: {
    padding: "12px",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 6
  },
  navItemActive: {
    background: "#2563eb",
    color: "#ffffff"
  },

  main: {
    flex: 1,
    padding: 20,
    marginLeft: 0,
    marginTop: 0
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 20
  },

  card: {
    background: "#ffffff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
  },

  inputGroup: { marginBottom: 10 },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    fontSize: 16
  },

  primaryBtn: {
    marginTop: 10,
    padding: "12px 16px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 16
  },

  explanation: { marginTop: 8, color: "#334155" },
  error: { color: "#dc2626", marginTop: 8 }
};
