import { useEffect, useMemo, useState } from "react";

type Iteration = {
  id: number;
  name: string;
  timestamp: string;
  ph: number;
  turbidity: number;
  tds: number;
  reusable: string;
  tank: string;
  filtrationBracket: string;
  summary: string;
};

export default function History() {
  const [iterations, setIterations] = useState<Iteration[]>([]);

  /* ===============================
     LOAD STORED ITERATIONS
  ================================ */
  useEffect(() => {
    const raw = localStorage.getItem("water_iterations");
    if (!raw) {
      setIterations([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setIterations(parsed);
      }
    } catch {
      setIterations([]);
    }
  }, []);

  /* ===============================
     GLOBAL AVERAGES (SAFE)
  ================================ */
  const averages = useMemo(() => {
    if (!iterations.length) {
      return { ph: 0, turbidity: 0, tds: 0 };
    }

    return {
      ph:
        iterations.reduce((s, i) => s + i.ph, 0) /
        iterations.length,
      turbidity:
        iterations.reduce((s, i) => s + i.turbidity, 0) /
        iterations.length,
      tds:
        iterations.reduce((s, i) => s + i.tds, 0) /
        iterations.length,
    };
  }, [iterations]);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ marginBottom: 24 }}>History</h1>

      {/* ===============================
          AVERAGE METRIC CARDS
      ================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {[
          {
            label: "Average pH",
            value: averages.ph.toFixed(2),
          },
          {
            label: "Average Turbidity",
            value: averages.turbidity.toFixed(1),
          },
          {
            label: "Average TDS",
            value: averages.tds.toFixed(0),
          },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              padding: 28,
              borderRadius: 18,
              background:
                "linear-gradient(135deg,#0f766e,#064e3b)",
              color: "#ecfeff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                fontSize: 14,
                opacity: 0.8,
                marginBottom: 8,
              }}
            >
              {c.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {iterations.length ? c.value : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* ===============================
          ITERATION LIST
      ================================ */}
      {iterations.length === 0 && (
        <p style={{ opacity: 0.7 }}>
          No iterations recorded yet.  
          Run the prediction model from Live Dashboard to
          create one.
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(360px,1fr))",
          gap: 24,
        }}
      >
        {iterations.map((it) => (
          <div
            key={it.id}
            style={{
              padding: 24,
              borderRadius: 20,
              background: "#052e16",
              border: "1px solid #14532d",
            }}
          >
            <h3 style={{ marginBottom: 6 }}>{it.name}</h3>
            <div
              style={{
                fontSize: 13,
                opacity: 0.7,
                marginBottom: 12,
              }}
            >
              {it.timestamp}
            </div>

            <p>
              <b>pH:</b> {it.ph.toFixed(2)} |{" "}
              <b>TDS:</b> {it.tds.toFixed(0)} |{" "}
              <b>Turbidity:</b>{" "}
              {it.turbidity.toFixed(1)}
            </p>

            <p>
              <b>Status:</b>{" "}
              <span
                style={{
                  color:
                    it.reusable === "YES"
                      ? "#22c55e"
                      : "#f97316",
                }}
              >
                {it.reusable}
              </span>{" "}
              → {it.tank}
            </p>

            <p>
              <b>Filtration Bracket:</b>{" "}
              {it.filtrationBracket}
            </p>

            <p style={{ opacity: 0.85 }}>
              {it.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
