import { useState } from "react";
import MetricCard from "../components/MetricCard";
import DataTable from "../components/DataTable";
import ChartModal from "../components/ChartModal";
import { analyzeWater, saveHistory } from "../services/dataService";
import { Page } from "../App";

interface Props {
  live?: boolean;
  navigate?: (p: Page) => void;
}

export default function Home({ live, navigate }: Props) {
  const [ph] = useState(7.2);
  const [tds] = useState(420);
  const [turbidity] = useState(4);
  const [chartKey, setChartKey] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  /* ---------- HOME HUB ---------- */
  if (!live && navigate) {
    return (
      <>
        <h1 style={{ color: "#e5e7eb", marginBottom: 24 }}>
          Water Quality Monitoring System
        </h1>

        <div style={hubGrid}>
          <HubCard title="Live Dashboard" onClick={() => navigate("live")} />
          <HubCard title="History" onClick={() => navigate("history")} />
          <HubCard title="Settings" onClick={() => navigate("settings")} />
        </div>
      </>
    );
  }

  /* ---------- LIVE DASHBOARD ---------- */
  const runAnalysis = () => {
    const res = analyzeWater({ ph, tds, turbidity });
    setResult(res);
    saveHistory({ ph, tds, turbidity, result: res });
  };

  return (
    <>
      <h2 style={{ color: "#e5e7eb" }}>Live Dashboard</h2>

      <div style={{ display: "flex", gap: 20 }}>
        <MetricCard
          title="pH"
          value={ph}
          dataKey="ph"
          onClick={() => setChartKey("ph")}
        />
        <MetricCard
          title="TDS"
          value={tds}
          dataKey="tds"
          onClick={() => setChartKey("tds")}
        />
        <MetricCard
          title="Turbidity"
          value={turbidity}
          dataKey="turbidity"
          onClick={() => setChartKey("turbidity")}
        />
      </div>

      <button
        onClick={runAnalysis}
        style={actionBtn}
      >
        Run Prediction Model
      </button>

      {result && (
        <div style={resultBox}>
          <p><b>Reusable:</b> {result.reusable}</p>
          <p><b>Filtration Bracket:</b> {result.bracket}</p>
        </div>
      )}

      <DataTable ph={ph} tds={tds} turbidity={turbidity} />

      {chartKey && (
        <ChartModal
          title={chartKey.toUpperCase()}
          onClose={() => setChartKey(null)}
        />
      )}
    </>
  );
}

/* ---------- STYLES ---------- */

const hubGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 30,
};

function HubCard({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#111827",
        padding: 50,
        borderRadius: 16,
        cursor: "pointer",
        textAlign: "center",
        color: "#e5e7eb",
        fontSize: 18,
        boxShadow: "0 0 20px rgba(56,189,248,0.15)",
      }}
    >
      {title}
    </div>
  );
}

const actionBtn = {
  marginTop: 20,
  padding: "10px 18px",
  background: "#38bdf8",
  border: "none",
  color: "#020617",
  cursor: "pointer",
  borderRadius: 6,
};

const resultBox = {
  marginTop: 16,
  background: "#020617",
  padding: 16,
  borderRadius: 8,
  color: "#e5e7eb",
};
