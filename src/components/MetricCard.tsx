import {
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";

interface Props {
  title: string;
  value: number;
  dataKey: string;
  onClick: () => void;
}

const mockTrend = [
  { v: 1 }, { v: 2 }, { v: 1.5 }, { v: 2.2 }, { v: 2 }
];

export default function MetricCard({ title, value, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        background: "#111827",
        padding: 20,
        borderRadius: 14,
        cursor: "pointer",
        color: "#e5e7eb",
        boxShadow: "0 0 15px rgba(0,0,0,0.6)",
      }}
    >
      <h4 style={{ marginBottom: 8 }}>{title}</h4>
      <h1 style={{ color: "#38bdf8" }}>{value}</h1>

      <div style={{ height: 60 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockTrend}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#38bdf8"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <small style={{ opacity: 0.7 }}>Click for full chart</small>
    </div>
  );
}
