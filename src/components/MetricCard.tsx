import { Reading } from "../App";

export default function MetricCard({
  label,
  value,
  readings,
  metric,
  onClick,
}: {
  label: string;
  value: number;
  readings: Reading[];
  metric: "ph" | "tds" | "turbidity";
  onClick: () => void;
}) {
  const avg =
    readings.reduce((a, r) => a + (r as any)[metric], 0) / readings.length;

  const deviation = ((value - avg) / avg) * 100;

  return (
    <div onClick={onClick} style={card}>
      <h3>{label}</h3>
      <div style={{ fontSize: 28 }}>{value.toFixed(2)}</div>

      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
        Updated every 10s <br />
        {deviation >= 0 ? "+" : ""}
        {deviation.toFixed(2)}% from avg ({avg.toFixed(2)})
      </div>
    </div>
  );
}

const card = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: 20,
  cursor: "pointer",
};
