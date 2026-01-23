export default function MetricCard({
  title,
  valueKey,
  rows,
  avg,
  onClick,
}: any) {
  const current = rows.length ? rows[rows.length - 1][valueKey] : "--";
  const deviation =
    avg && current !== "--"
      ? (((current - avg) / avg) * 100).toFixed(2)
      : "0";

  return (
    <div
      onClick={onClick}
      style={{
        background: "#1e293b",
        padding: 18,
        borderRadius: 12,
        width: 180,
        cursor: "pointer",
      }}
    >
      <h4>{title}</h4>
      <h2>{current}</h2>
      <small>
        Avg: {avg} | {deviation}% from avg
        <br />
        Updated every 4s
      </small>
    </div>
  );
}
