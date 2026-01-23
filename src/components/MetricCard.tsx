interface Props {
  title: string;
  current: number;
  average: number;
  onClick: () => void;
}

export default function MetricCard({
  title,
  current,
  average,
  onClick,
}: Props) {
  const diff = (((current - average) / average) * 100) || 0;

  return (
    <div onClick={onClick} style={card}>
      <h4>{title}</h4>
      <h1 style={{ color: "#38bdf8" }}>{current}</h1>
      <small>
        Avg: {average.toFixed(2)} | {diff.toFixed(1)}%
      </small>
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
