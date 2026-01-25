import { useNavigate } from "react-router-dom";
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

export default function Home() {
  const navigate = useNavigate();

  // 🔴 TEMP: replace with real history state later
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
      summary: "Water is reusable with basic filtration."
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
        "Requires coagulation and sand filtration. Suitable for gardening after treatment."
    }
  ];

  /* ===============================
     GLOBAL AVERAGES
  ================================ */
  const averages = useMemo(() => {
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
        history.length
    };
  }, [history]);

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ marginBottom: 20 }}>Home Overview</h1>

      {/* ===============================
          GLOBAL AVERAGE CARDS
      ================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 36
        }}
      >
        {["pH", "Turbidity", "TDS"].map((label, idx) => {
          const value =
            !averages
              ? "—"
              : label === "pH"
              ? averages.ph.toFixed(2)
              : label === "Turbidity"
              ? averages.turbidity.toFixed(1)
              : averages.tds.toFixed(0);

          return (
            <div
              key={idx}
              style={{
                padding: 28,
                borderRadius: 18,
                background:
                  "linear-gradient(135deg,#0f766e,#064e3b)",
                color: "#e5f9f6",
                fontSize: 28,
                fontWeight: 700
              }}
            >
              <div style={{ fontSize: 14, opacity: 0.8 }}>
                Avg {label}
              </div>
              <div>{value}</div>
            </div>
          );
        })}
      </div>

      {/* ===============================
          ITERATION HISTORY (CARDS)
      ================================ */}
      <h2 style={{ marginBottom: 16 }}>History</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
          gap: 20,
          marginBottom: 40
        }}
      >
        {history.map((it) => (
          <div
            key={it.id}
            style={{
              padding: 20,
              borderRadius: 16,
              background: "#052e16",
              border: "1px solid #14532d"
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

      {/* ===============================
          NAVIGATION CARDS
      ================================ */}
      <h2 style={{ marginBottom: 16 }}>Explore</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20
        }}
      >
        {[
          { label: "Live Dashboard", path: "/live" },
          { label: "History", path: "/history" },
          { label: "Applications", path: "/applications" },
          { label: "Settings", path: "/settings" }
        ].map((item) => (
          <div
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              cursor: "pointer",
              padding: 28,
              borderRadius: 18,
              background:
                "linear-gradient(135deg,#1e40af,#065f46)",
              color: "#ecfeff",
              fontSize: 18,
              fontWeight: 600,
              textAlign: "center"
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
