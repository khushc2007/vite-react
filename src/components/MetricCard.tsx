export default function MetricCard({
  title,
  rows,
  valueKey,
  avg,
}: any) {
  const current = rows.length ? rows[rows.length - 1][valueKey] : "--";
  const deviation =
    avg && current !== "--"
      ? (((current - avg) / avg) * 100).toFixed(2)
      : "0";

  return (
    <div
      style={{
        background: "#052e16",
        padding: 20,
        borderRadius: 12,
        width: 180,
        color: "white",
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
