import { useEffect, useState } from "react";
import {
  pushLiveData,
  getLiveData,
  getAverages,
  saveIteration,
  MAX_ROWS,
} from "../services/dataService";

import MetricCard from "../components/MetricCard";
import DatasetTable from "../components/DatasetTable";
import ChartModal from "../components/ChartModal";

type PredictionResult = {
  reusable: "YES" | "NO";
  tank: "A" | "B";
  filtrationBracket: string;
  filtrationMethod: string;
};

export default function LiveDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [avg, setAvg] = useState<any>(null);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      pushLiveData();
      setRows(getLiveData());
      setAvg(getAverages());
    }, 4000);

    return () => clearInterval(id);
  }, []);

  const runPredictionModel = () => {
    if (!avg) return;

    // ---- Simulated backend response ----
    const reusable =
      avg.ph >= 6.5 && avg.ph <= 8.5 && avg.tds < 1000 ? "YES" : "NO";

    const result: PredictionResult = reusable === "YES"
      ? {
          reusable: "YES",
          tank: "A",
          filtrationBracket: "F1",
          filtrationMethod: "Basic Sand + Carbon",
        }
      : {
          reusable: "NO",
          tank: "B",
          filtrationBracket: "F3",
          filtrationMethod: "Coagulation + Sand Filtration",
        };

    setPrediction(result);

    saveIteration({
      timestamp: new Date().toLocaleString(),
      averages: avg,
      result,
    });
  };

  return (
    <div>
      <h1>Live Dashboard</h1>

      {/* ===== METRIC CARDS ===== */}
      <div style={{ display: "flex", gap: 16 }}>
        {avg && (
          <>
            <MetricCard
              title="pH"
              valueKey="ph"
              rows={rows}
              avg={avg.ph}
              onClick={() => setActiveMetric("ph")}
            />
            <MetricCard
              title="TDS"
              valueKey="tds"
              rows={rows}
              avg={avg.tds}
              onClick={() => setActiveMetric("tds")}
            />
            <MetricCard
              title="Turbidity"
              valueKey="turbidity"
              rows={rows}
              avg={avg.turbidity}
              onClick={() => setActiveMetric("turbidity")}
            />
          </>
        )}
      </div>

      {/* ===== DATA TABLE ===== */}
      <DatasetTable rows={rows} />

      {/* ===== RUN MODEL BUTTON ===== */}
      {rows.length === MAX_ROWS && (
        <button
          onClick={runPredictionModel}
          style={{
            marginTop: 20,
            padding: "14px 22px",
            fontSize: "16px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Run Prediction Model
        </button>
      )}

      {/* ===== PREDICTION RESULT ===== */}
      {prediction && (
        <div
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 12,
            background: "#052e16",
          }}
        >
          <h3>Prediction Result</h3>
          <p><b>Reusable:</b> {prediction.reusable}</p>
          <p><b>Tank:</b> {prediction.tank}</p>
          <p><b>Filtration Bracket:</b> {prediction.filtrationBracket}</p>
          <p><b>Method:</b> {prediction.filtrationMethod}</p>
        </div>
      )}

      {/* ===== CHART MODAL ===== */}
      {activeMetric && (
        <ChartModal
          metric={activeMetric}
          rows={rows}
          onClose={() => setActiveMetric(null)}
        />
      )}
    </div>
  );
}
