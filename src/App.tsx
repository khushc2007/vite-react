import { useState, useEffect } from "react";

/* ======================= MAIN APP ======================= */

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState<
    "dashboard" | "research" | "paper" | "history"
  >("dashboard");

  function switchPage(p: typeof page) {
    setPage(p);
    setSidebarOpen(false);
  }

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <header style={headerStyle}>
        <button style={menuButton} onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
        <span>Water Quality Monitoring System</span>
      </header>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div style={sidebarStyle}>
          <h3>Navigation</h3>
          <SidebarItem text="Live Dashboard" onClick={() => switchPage("dashboard")} />
          <SidebarItem text="Research & Standards" onClick={() => switchPage("research")} />
          <SidebarItem text="Research Paper" onClick={() => switchPage("paper")} />
          <SidebarItem text="History" onClick={() => switchPage("history")} />
          <button style={closeButton} onClick={() => setSidebarOpen(false)}>
            Close
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main style={contentStyle}>
        {page === "dashboard" && <Dashboard />}
        {page === "research" && <Research />}
        {page === "paper" && <ResearchPaper />}
        {page === "history" && <History />}
      </main>
    </div>
  );
}

/* ======================= DASHBOARD (CONNECTED TO BACKEND) ======================= */

function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/analyze-water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ph: 7.2,
        turbidity: 18,
        tds: 1200
      })
    })
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Card title="Loading">Fetching backend data...</Card>;
  }

  if (!data) {
    return <Card title="Error">Backend not reachable</Card>;
  }

  return (
    <>
      <Card title="Live Sensor Values">
        <p><b>pH:</b> 7.2</p>
        <p><b>Turbidity:</b> 18 NTU</p>
        <p><b>TDS:</b> 1200 ppm</p>
      </Card>

      <Card title="Prediction Model 1: Reusability">
        <Badge text={data.reusable} />
      </Card>

      <Card title="Tank Routing Decision">
        <div style={data.tank === "Tank A" ? tankActive : tankInactive}>
          Tank A – Reusable Water
        </div>
        <div style={data.tank === "Tank B" ? tankActive : tankInactive}>
          Tank B – Treatment Required
        </div>
      </Card>

      <Card title="Prediction Model 2: Filtration">
        <p><b>Bracket:</b> {data.filtrationBracket}</p>
        <p><b>Method:</b> {data.filtrationMethod}</p>
      </Card>

      <Card title="Explanation">
        <p>{data.explanation}</p>
      </Card>
    </>
  );
}

/* ======================= RESEARCH ======================= */

function Research() {
  return (
    <Card title="Research & Standards">
      <p><b>Parameters:</b> pH, Turbidity, TDS</p>
      <ul>
        <li>WHO Water Quality Guidelines</li>
        <li>IS 10500:2012 Drinking Water Standards</li>
        <li>Greywater Reuse Guidelines</li>
      </ul>
      <p>
        This system uses standards-derived thresholds to classify water usability
        and determine filtration strategies.
      </p>
    </Card>
  );
}

/* ======================= RESEARCH PAPER ======================= */

function ResearchPaper() {
  return (
    <Card title="Research Paper">
      <p><b>Title:</b> Smart Greywater Quality Monitoring and Reuse System</p>

      <p><b>Abstract:</b><br />
        This project presents a rule-based decision system for monitoring
        greywater quality using physicochemical parameters and selecting
        appropriate filtration methods.
      </p>

      <p><b>Methodology:</b></p>
      <ul>
        <li>Sensor data acquisition</li>
        <li>Reusability classification</li>
        <li>Filtration bracket selection</li>
        <li>Relay-based water routing</li>
      </ul>

      <p><b>Conclusion:</b><br />
        The system ensures efficient water reuse while minimizing unnecessary
        treatment.
      </p>
    </Card>
  );
}

/* ======================= HISTORY ======================= */

function History() {
  return (
    <Card title="History Logs">
      <ul>
        <li>10:00 — pH 7.2 | TDS 1200 | F4</li>
        <li>10:15 — pH 6.9 | TDS 850 | F2</li>
        <li>10:30 — pH 8.1 | TDS 1600 | F5</li>
      </ul>
    </Card>
  );
}

/* ======================= UI COMPONENTS ======================= */

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div style={cardStyle}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return <span style={badgeRed}>{text}</span>;
}

function SidebarItem({ text, onClick }: { text: string; onClick: () => void }) {
  return <div style={sidebarItem} onClick={onClick}>{text}</div>;
}

/* ======================= STYLES ======================= */

const pageStyle: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  background: "#f3f4f6",
  minHeight: "100vh"
};

const headerStyle: React.CSSProperties = {
  background: "#111827",
  color: "white",
  padding: "14px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "18px"
};

const menuButton: React.CSSProperties = {
  background: "transparent",
  color: "white",
  fontSize: "22px",
  border: "none",
  cursor: "pointer"
};

const sidebarStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "260px",
  height: "100%",
  background: "#1f2937",
  color: "white",
  padding: "16px",
  zIndex: 10
};

const sidebarItem: React.CSSProperties = {
  padding: "10px",
  cursor: "pointer",
  borderBottom: "1px solid #374151"
};

const closeButton: React.CSSProperties = {
  marginTop: "20px",
  padding: "8px",
  width: "100%"
};

const contentStyle: React.CSSProperties = {
  padding: "20px",
  maxWidth: "900px",
  margin: "0 auto"
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "18px",
  marginBottom: "18px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
};

const badgeRed: React.CSSProperties = {
  background: "#dc2626",
  color: "white",
  padding: "6px 14px",
  borderRadius: "999px",
  fontWeight: "bold"
};

const tankActive: React.CSSProperties = {
  background: "#fde68a",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "8px",
  fontWeight: "bold"
};

const tankInactive: React.CSSProperties = {
  background: "#e5e7eb",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "8px"
};

export default App;
