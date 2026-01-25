import { useEffect, useState } from "react";

/* ===============================
   TYPES (MUST MATCH LiveDashboard)
================================ */
type Row = {
  slNo: number;
  time: string;
  ph: number;
  turbidity: number;
  tds: number;
  source: "simulation" | "live";
};

type Iteration = {
  id: string;
  name?: string;
  timestamp: string;
  mode: "idle" | "simulation" | "live";
  rows: Row[];
  avg: {
    ph: number;
    turbidity: number;
    tds: number;
  };
  prediction: {
    reusable: string;
    tank: string;
    filtrationBracket: string;
  };
};

/* ===============================
   FILTRATION KNOWLEDGE LIBRARY
   (READ-ONLY VIEW)
================================ */
const FILTRATION_LIBRARY: Record<string, any> = {
  F1: {
    title: "Baseline Polishing Filtration",
    explanation:
      "F1 represents lightly contaminated water that is structurally safe but aesthetically impaired. Sediment filtration removes fine particulate matter that can clog systems or reduce clarity, while activated carbon adsorption removes dissolved organic compounds, chlorine residues, and odor-causing molecules. This preserves mineral balance while improving usability.",
  },
  F2: {
    title: "Moderate Suspended Solids",
    explanation:
      "F2 water contains suspended solids at levels that interfere with hydraulic performance. Multi-stage filtration stabilizes flow, protects equipment, and enables controlled reuse in non-critical applications.",
  },
  F3: {
    title: "High Suspended Solids",
    explanation:
      "F3 water requires coagulation, flocculation, sedimentation, and rapid sand filtration. This treatment train is essential in municipal and industrial wastewater plants to prevent mechanical damage.",
  },
  F4: {
    title: "High Dissolved Solids",
    explanation:
      "F4 water is dominated by dissolved salts and ions. Ultrafiltration and carbon stabilization act as pre-treatment before advanced membrane systems such as reverse osmosis.",
  },
  F5: {
    title: "Severe Dissolved Contamination",
    explanation:
      "F5 represents extreme contamination. Advanced membrane or thermal separation is required to remove pollutants at the molecular level, often followed by remineralization.",
  },
};

/* ===============================
   HISTORY PAGE
================================ */
export default function History() {
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  /* ===============================
     LOAD FROM LOCAL STORAGE
  ================================ */
  useEffect(() => {
    const stored = localStorage.getItem("waterIQ_iterations");
    if (!stored) return;

    try {
      const parsed: Iteration[] = JSON.parse(stored);
      setIterations(parsed.reverse()); // newest first
    } catch {
      console.error("Failed to parse iteration history");
    }
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 20 }}>History</h1>

      {iterations.length === 0 && (
        <p style={{ color: "#94a3b8" }}>
          No saved iterations found.
        </p>
      )}

      {iterations.map((it) => {
        const filtration =
          FILTRATION_LIBRARY[it.prediction.filtrationBracket];

        const isOpen = activeId === it.id;

        return (
          <div
            key={it.id}
            style={{
              marginBottom: 20,
              padding: 20,
              borderRadius: 14,
              background: "#020617",
              border: "1px solid #22c55e",
              boxShadow: "0 0 18px rgba(34,197,94,0.15)",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() =>
                setActiveId(isOpen ? null : it.id)
              }
            >
              <div>
                <h3 style={{ margin: 0, color: "#22c55e" }}>
                  {it.name || "Unnamed Iteration"}
                </h3>
                <small style={{ color: "#94a3b8" }}>
                  {new Date(it.timestamp).toLocaleString()} ·{" "}
                  {it.mode.toUpperCase()}
                </small>
              </div>

              <div style={{ color: "#22c55e" }}>
                {isOpen ? "▲" : "▼"}
              </div>
            </div>

            {/* DETAILS */}
            {isOpen && (
              <div style={{ marginTop: 16 }}>
                {/* AVG */}
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    marginBottom: 16,
                    color: "#e5e7eb",
                  }}
                >
                  <div>Avg pH: {it.avg.ph.toFixed(2)}</div>
                  <div>
                    Avg Turbidity:{" "}
                    {it.avg.turbidity.toFixed(2)}
                  </div>
                  <div>Avg TDS: {it.avg.tds.toFixed(2)}</div>
                </div>

                {/* PREDICTION BOX */}
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: "#052e16",
                    border: "1px solid #22c55e",
                    color: "#dcfce7",
                    marginBottom: 16,
                  }}
                >
                  <p>
                    <b>Reusable:</b>{" "}
                    {it.prediction.reusable}
                  </p>
                  <p>
                    <b>Tank:</b> {it.prediction.tank}
                  </p>
                  <p>
                    <b>Filtration Bracket:</b>{" "}
                    {it.prediction.filtrationBracket}
                  </p>
                </div>

                {/* FILTRATION DETAILS */}
                {filtration && (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: "#020617",
                      border: "1px solid #16a34a",
                      color: "#e5e7eb",
                    }}
                  >
                    <h4
                      style={{
                        marginTop: 0,
                        color: "#22c55e",
                      }}
                    >
                      {filtration.title}
                    </h4>
                    <p>{filtration.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
