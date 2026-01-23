interface Props {
  title: string;
  value: number;
  onClick: () => void;
}

export default function MetricCard({ title, value, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#020617",
        padding: 20,
        borderRadius: 8,
        cursor: "pointer",
        minWidth: 120
      }}
    >
      <h4>{title}</h4>
      <p style={{ fontSize: 22 }}>{value}</p>
    </div>
  );
}
