import { useEffect, useState } from "react";
import {
  pushLiveData,
  getLiveData,
  getAverages,
  saveIteration,
  resetLiveData,
  MAX_ROWS,
  INTERVAL_SECONDS,
} from "../services/dataService";

import DatasetTable from "../components/DatasetTable";
import MetricCard from "../components/MetricCard";
import IterationModal from "../components/IterationModal";

export default function LiveDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [avg, setAvg] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      pushLiveData();
      setRows(getLiveData());
      setAvg(getAverages());
    }, INTERVAL_SECONDS * 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <h2 style={{ color: "white" }}>Live Dashboard</h2>

      <div style={{ display: "flex", gap: 16 }}>
        {avg && (
          <>
            <MetricCard title="pH" rows={rows} valueKey="ph" avg={avg.ph} />
            <MetricCard title="TDS" rows={rows} valueKey="tds" avg={avg.tds} />
            <MetricCard
              title="Turbidity"
              rows={rows}
              valueKey="turbidity"
              avg={avg.turbidity}
            />
          </>
        )}
      </div>

      <DatasetTable rows={rows} />

      {rows.length === MAX_ROWS && (
        <button
          style={{ marginTop: 20 }}
          onClick={() => setShowModal(true)}
        >
          Run Prediction Model
        </button>
      )}

      {showModal && (
        <IterationModal
          onSave={(name: string) => {
            saveIteration(name);
            resetLiveData();
            setRows([]);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
