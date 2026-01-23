import { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard";
import DataTable from "../components/DataTable";

interface Props {
  openChart: (key: string) => void;
}

export default function LiveDashboard({ openChart }: Props) {
  const [data, setData] = useState<any[]>([]);

  // Mock live data every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const point = {
        time: new Date().toLocaleTimeString(),
        ph: +(7 + Math.random()).toFixed(2),
        tds: Math.floor(300 + Math.random() * 200),
        turbidity: +(2 + Math.random()).toFixed(2),
      };
      setData((prev) => [...prev.slice(-20), point]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const latest = data[data.length - 1] || {};

  return (
    <div>
      <h1 style={{ color: "#e5e7eb", marginBottom: 20 }}>
        Live Dashboard
      </h1>

      {/* CARDS */}
      <div style={{ display: "flex", gap: 16 }}>
        <MetricCard
          title="pH"
          value={latest.ph}
          onClick={() => openChart("ph")}
        />
        <MetricCard
          title="TDS"
          value={latest.tds}
          onClick={() => openChart("tds")}
        />
        <MetricCard
          title="Turbidity"
          value={latest.turbidity}
          onClick={() => openChart("turbidity")}
        />
      </div>

      {/* TABLE */}
      <div style={{ marginTop: 30 }}>
        <h2 style={{ color: "#cbd5f5" }}>Live Readings</h2>
        <DataTable rows={data} />
      </div>

      {/* PREDICTION BUTTON */}
      <div style={{ marginTop: 30 }}>
        <button
          style={{
            padding: "12px 24px",
            background: "#38bdf8",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Run Prediction Model
        </button>
      </div>
    </div>
  );
}
