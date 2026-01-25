import { useMemo } from "react";

type Iteration = {
  id: number;
  name: string;
  ph: number;
  turbidity: number;
  tds: number;
  reusable: string;
  tank: string;
  filtrationBracket: string;
  summary: string;
};

export default function History() {
  // 🔴 TEMP DATA — replace with real stored history later
  const history: Iteration[] = [
    {
      id: 1,
      name: "Iteration 1",
      ph: 7.1,
      turbidity: 18,
      tds: 620,
      reusable: "YES",
      tank: "Tank A",
      filtrationBracket: "F1",
      summary: "Reusable with basic filtration.",
    },
    {
      id: 2,
      name: "Iteration 2",
      ph: 6.4,
      turbidity: 45,
      tds: 980,
      reusable: "NO",
      tank: "Tank B",
      filtrationBracket: "F3",
      summary:
        "Requires coagulation and sand filtration. Suitable for gardening after treatment.",
    },
  ];

  /* ===============================
     GLOBAL AVERAGES
  ================================ */
  const avg = useMemo(() => {
    if (!history.length) return null;
    return {
      ph:
        history.reduce((s, i) => s + i.ph, 0) /
        history.length,
      turbidity:
        history.reduce((s, i) => s + i.turbidity, 0) /
        history.length,
      tds:
        history.reduce((s, i) => s + i.tds, 0) /
        history.length,
    };
  }, [history]);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ marginBottom: 24 }}>History</h1>

      {/* ===== AVERAGE CARDS ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {[
          { label: "Avg pH", value: avg?.ph?.toFixed(2) },
          {
            label: "Avg Turbidity",
            value: avg?.turbidity?.toFixed(1),
          },
          { label: "Avg TDS", value: avg?.tds?.toFixed(0) },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              padding: 28,
              borderRadius: 18,
              background:
                "linear-gradient(135deg,#0f766e,#064e3b)",
              color: "#ecfeff",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              {c.label}
            </div>
            <div>{c.value ?? "—"}</div>
          </div>
        ))}
      </div>

      {/* ===== ITERATION CARDS ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
          gap: 24,
        }}
      >
        {history.map((it) => (
          <div
            key={it.id}
            style={{
              padding: 22,
              borderRadius: 18,
              background: "#052e16",
              border: "1px solid #14532d",
            }}
          >
            <h3>{it.name}</h3>
            <p>
              pH: {it.ph} | TDS: {it.tds} | Turbidity:{" "}
              {it.turbidity}
            </p>
            <p>
              <b>{it.reusable}</b> → {it.tank}
            </p>
            <p>
              Filtration: <b>{it.filtrationBracket}</b>
            </p>
            <p style={{ opacity: 0.8 }}>{it.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
