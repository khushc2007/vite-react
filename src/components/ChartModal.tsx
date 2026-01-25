import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  metric: "ph" | "tds" | "turbidity";
  rows: any[];
  onClose: () => void;
};

export default function ChartModal({ metric, rows, onClose }: Props) {
  // 🛡 HARD GUARD
  if (!rows || rows.length === 0) return null;

  const metricLabel =
    metric === "ph" ? "pH" : metric === "tds" ? "TDS" : "Turbidity";

  // 🛡 NORMALIZE + FILTER ONCE
  const safeData = rows
    .map((r) => ({
      time: r?.time ?? "",
      value: Number(r?.[metric]),
    }))
    .filter((d) => !isNaN(d.value));

  if (safeData.length === 0) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>{metricLabel} vs Time</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeData}>
              <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
              <XAxis
                dataKey="time"
                label={{
                  value: "Time (every 4 seconds)",
                  position: "insideBottom",
                  offset: -6,
                  fill: "#cbd5e1",
                }}
                tick={{ fill: "#cbd5e1", fontSize: 12 }}
              />
              <YAxis
                label={{
                  value: metricLabel,
                  angle: -90,
                  position: "insideLeft",
                  fill: "#cbd5e1",
                }}
                tick={{ fill: "#cbd5e1", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #334155",
                  color: "#e5e7eb",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p style={footerText}>
          Live values sampled every 4 seconds. Closing this view will not reset data.
        </p>
      </div>
    </div>
  );
}
