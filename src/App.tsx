import { useState } from "react";

type ApiResponse = {
  status: string;
  reusable: "YES" | "NO";
  tank: string;
  filtrationBracket: string;
  filtrationMethod: string;
  explanation: string;
};

export default function App() {
  const [ph, setPh] = useState("");
  const [turbidity, setTurbidity] = useState("");
  const [tds, setTds] = useState("");

  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeWater() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        "https://water-quality-backend-qxd3.onrender.com/analyze-water",
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

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Failed to reach backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Water Quality Monitoring System</h1>

      <div className="card">
        <h2>Sensor Inputs</h2>

        <label>
          pH
          <input value={ph} onChange={e => setPh(e.target.value)} />
        </label>

        <label>
          Turbidity (NTU)
          <input
            value={turbidity}
            onChange={e => setTurbidity(e.target.value)}
          />
        </label>

        <label>
          TDS (ppm)
          <input value={tds} onChange={e => setTds(e.target.value)} />
        </label>

        <button onClick={analyzeWater} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Water"}
        </button>

        {error && <p className="error">{error}</p>}
      </div>

      {result && (
        <div className="card">
          <h2>Analysis Result</h2>
          <p><b>Reusable:</b> {result.reusable}</p>
          <p><b>Tank:</b> {result.tank}</p>
          <p><b>Filtration Bracket:</b> {result.filtrationBracket}</p>
          <p><b>Filtration Method:</b> {result.filtrationMethod}</p>
          <p><b>Explanation:</b> {result.explanation}</p>
        </div>
      )}
    </div>
  );
}
