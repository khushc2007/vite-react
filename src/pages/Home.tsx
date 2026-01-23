import { useState } from "react";
import MetricCard from "../components/MetricCard";
import DataTable from "../components/DataTable";
import ChartModal from "../components/ChartModal";
import { analyzeWater, saveHistory } from "../services/dataService";

export default function Home() {
  const [ph, setPh] = useState(7.2);
  const [tds, setTds] = useState(420);
  const [turbidity, setTurbidity] = useState(4);
  const [showChart, setShowChart] = useState<null | string>(null);
  const [result, setResult] = useState<any>(null);

  const runAnalysis = () => {
    const res = analyzeWater({ ph, tds, turbidity });
    setResult(res);
    saveHistory({ ph, tds, turbidity, result: res });
  };

  return (
    <>
      <h2>Live Dashboard</h2>

      <div style={{ display: "flex", gap: 16 }}>
        <MetricCard title="pH" value={ph} onClick={() => setShowChart("pH")} />
        <MetricCard title="TDS" value={tds} onClick={() => setShowChart("TDS")} />
        <MetricCard title="Turbidity" value={turbidity} onClick={() => setShowChart("Turbidity")} />
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={runAnalysis}>Run Prediction Model</button>
      </div>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Prediction Result</h3>
          <p>Reusable: {result.reusable}</p>
          <p>Filtration Bracket: {result.bracket}</p>
        </div>
      )}

      <DataTable ph={ph} tds={tds} turbidity={turbidity} />

      {showChart && <ChartModal title={showChart} onClose={() => setShowChart(null)} />}
    </>
  );
}

