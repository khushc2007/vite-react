interface Props {
  title: string;
  current: number;
  average: number;
  onClick: () => void;
}

export default function MetricCard({ title, value, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        background: "#020617",
        border: "1px solid #1e293b",
        borderRadius: 12,
        padding: 20,
        cursor: "pointer",
      }}
    >
      <h3 style={{ color: "#94a3b8" }}>{title}</h3>
      <div style={{ fontSize: 28, color: "#38bdf8" }}>
        {value ?? "--"}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
        Updated every 10 seconds
      </div>
    </div>
  );
}

const card = {
  flex: 1,
  background: "#111827",
  padding: 20,
  borderRadius: 14,
  color: "#e5e7eb",
  cursor: "pointer",
};
