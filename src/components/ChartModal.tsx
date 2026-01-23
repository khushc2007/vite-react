import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  title: string;
  data: any[];
  back: () => void;
}

export default function ChartModal({ title, data, back }: Props) {
  return (
    <div>
      <button onClick={back}>← Back</button>

      <h2 style={{ color: "#e5e7eb", marginBottom: 20 }}>
        {title} over Time
      </h2>

      <LineChart width={800} height={400} data={data}>
        <CartesianGrid stroke="#334155" />
        <XAxis
          dataKey="time"
          label={{
            value: "Time (10s interval)",
            position: "insideBottom",
            fill: "#94a3b8",
          }}
        />
        <YAxis
          label={{
            value: title,
            angle: -90,
            position: "insideLeft",
            fill: "#94a3b8",
          }}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={title.toLowerCase()}
          stroke="#38bdf8"
        />
      </LineChart>
    </div>
  );
}
