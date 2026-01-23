import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Reading } from "../App";

export default function ChartModal({
  readings,
  metric,
  onClose,
}: {
  readings: Reading[];
  metric: "ph" | "tds" | "turbidity";
  onClose: () => void;
}) {
  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{metric.toUpperCase()} vs Time</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={readings}>
            <CartesianGrid stroke="#334155" />
            <XAxis dataKey="time" label={{ value: "Time (10s)", position: "insideBottom", fill: "#cbd5f5" }} />
            <YAxis label={{ value: metric, angle: -90, position: "insideLeft", fill: "#cbd5f5" }} />
            <Tooltip />
            <Line dataKey={metric} stroke="#38bdf8" dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#020617",
  padding: 20,
  borderRadius: 12,
  width: "70%",
};
