import { useState } from "react";

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
        <button style={menuButton} onClick={() => setSidebarOpen(true)}>☰</button>
        <span>Water Quality Monitoring System</span>
      </header>

      {/* LEFT PANEL */}
      {sidebarOpen && (
        <div style={sidebarStyle}>
          <h3 style={{ marginTop: 0 }}>Navigation</h3>
          <SidebarItem text="Live Dashboard" onClick={() => switchPage("dashboard")} />
          <SidebarItem text="Research & Standards" onClick={() => switchPage("research")} />
          <SidebarItem text="Research Paper" onClick={() => switchPage("paper")} />
          <SidebarItem text="History" onClick={() => switchPage("history")} />
          <button style={closeButton} onClick={() => setSidebarOpen(false)}>Close</button>
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

/* ======================= DASHBOARD ======================= */

function Dashboard() {
  return (
    <>
      <Card title="Live Sensor Values">
        <Metric label="pH" value="7.4" />
        <Metric label="Turbidity" value="65 NTU" />
        <Metric label="TDS" value="1300 mg/L" />
      </Card>

      <Card title="Prediction Model 1: Reusability">
        <Badge text="NOT REUSABLE" />
        <p style={subText}>Reason: High TDS concentration</p>
      </Card>

      <Card title="Tank Routing Decision">
        <div style={tankInactive}>Tank A – Reusable Water</div>
        <div style={tankActive}>Tank B – Treatment Required</div>
      </Card>

      <Card title="Prediction Model 2: Filtration Method">
        <p><b>Best Filtration:</b></p>
        <h3>Reverse Osmosis (RO)</h3>
      </Card>

      <Card title="Explanation & Reuse Possibilities">
        <p>
          Reverse Osmosis is selected due to excessive TDS levels in the water.
          This method efficiently removes dissolved salts and contaminants.
        </p>
        <p>The treated water can be reused for:</p>
        <ul>
          <li>Toilet flushing</li>
          <li>Gardening & irrigation</li>
          <li>Cleaning purposes</li>
        </ul>
      </Card>
    </>
  );
}

/* ======================= RESEARCH PAGE ======================= */

function Research() {
  return (
    <Card title="Research & Standards">
      <p><b>Parameters Used:</b> pH, Turbidity, TDS</p>
      <p><b>Standards Referenced:</b></p>
      <ul>
        <li>WHO Water Quality Guidelines</li>
        <li>IS 10500:2012 Drinking Water Standards</li>
      </ul>
      <p>
        This project applies a two-stage prediction approach to assess
        greywater reusability and determine optimal filtration techniques.
      </p>
    </Card>
  );
}

/* ======================= RESEARCH PAPER ======================= */

function ResearchPaper() {
  return (
    <Card title="Research Paper">
      <p><b>Title:</b> Smart Greywater Quality Assessment and Reuse System</p>

      <p><b>Abstract:</b><br />
        This research focuses on monitoring greywater quality using
        physicochemical parameters such as pH, turbidity, and total dissolved
        solids (TDS). A two-stage prediction model is proposed for reusability
        classification and filtration selection.
      </p>

      <p><b>Methodology:</b></p>
      <ul>
        <li>Sensor data acquisition</li>
        <li>Prediction Model 1: Reusability classification</li>
        <li>Tank-based routing</li>
        <li>Prediction Model 2: Filtration method selection</li>
      </ul>

      <p><b>Conclusion:</b></p>
      <p>
        The proposed system ensures efficient water reuse while minimizing
        treatment costs and environmental impact.
      </p>

      <p><b>References:</b></p>
      <ul>
        <li>WHO Guidelines for Drinking-water Quality</li>
        <li>IS 10500:2012 Bureau of Indian Standards</li>
        <li>Greywater Treatment Technologies – Review Paper</li>
      </ul>
    </Card>
  );
}

/* ======================= HISTORY ======================= */

function History() {
  return (
    <Card title="Historical Records">
      <ul>
        <li>10:00 — pH 7.2 | TDS 1200 | Filtration: RO</li>
        <li>10:10 — pH 6.9 | TDS 900 | Filtration: Carbon</li>
        <li>10:20 — pH 8.1 | TDS 1600 | Filtration: RO</li>
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

function Metric({ label, value }: { label: string; value: string }) {
  return <p><b>{label}:</b> {value}</p>;
}

function Badge({ text }: { text: string }) {
  return <span style={badgeRed}>{text}</span>;
}

function SidebarItem({ text, onClick }: { text: string; onClick: () => void }) {
  return <div style={sidebarItem} onClick={onClick}>{text}</div>;
}

/* ======================= STYLES ======================= */

const pageStyle: React.CSSProperties = {
  fontFamily: "Inter, Arial, sans-serif",
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

const subText: React.CSSProperties = {
  marginTop: "6px",
  color: "#6b7280"
};

export default App;
