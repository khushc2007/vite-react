import { useState, useEffect } from "react";
import MetricCard from "../components/MetricCard";
import DataTable from "../components/DataTable";
import { analyzeWater } from "../services/dataService";

export default function LiveDashboard({
  openChart,
}: {
  openChart: (key: string) => void;
}) {
  const [data, setData] = useState<number[]>([]);
  const [ph, setPh] = useState(7.2);
  const [tds, setTds] = useState(420);
  const [turbidity, setTurbidity] = useState(4);
  const [result, setResult] = useState<any>(null);

  // simulate live data
  useEffect(() => {
    const i = setInterval(() => {
      const v = +(ph + (Math.random() - 0.5) * 0.1).toFixed(2);
      setPh(v);
      setData((d) => [...d.slice(-30), v]);
    }, 2000);
    return () => clearInterval(i);
  }, []);

  const avg =
    data.reduce((a, b) => a + b, 0) / (data.length || 1);

  const runPrediction = () => {
    setResult(analyzeWater({ ph, tds, turbidity }));
  };

  return (
    <>
      <h2 style={{ color: "#e5e7eb" }}>Live Dashboard</h2>

      {/* TABLE */}
      <DataTable />

      {/* CARDS */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <MetricCard
          title="pH"
          current={ph}
          average={avg}
          onClick={() => openChart("ph")}
        />
        <MetricCard
          title="TDS"
          current={tds}
          average={tds}
          onClick={() => openChart("tds")}
        />
        <MetricCard
          title="Turbidity"
          current={turbidity}
          average={turbidity}
          onClick={() => openChart("turbidity")}
        />
      </div>

      <button style={btn} onClick={runPrediction}>
        Run Prediction Model
      </button>

      {result && (
        <div style={resultBox}>
          <p>Reusable: {result.reusable}</p>
          <p>Filtration: {result.bracket}</p>
        </div>
      )}
    </>
  );
}

const btn = {
  marginTop: 20,
  padding: "10px 16px",
  background: "#38bdf8",
  border: "none",
  borderRadius: 6,
};

const resultBox = {
  marginTop: 16,
  background: "#020617",
  padding: 16,
  borderRadius: 8,
  color: "#e5e7eb",
};
