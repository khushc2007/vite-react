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
  const metricLabel =
    metric === "ph"
      ? "pH"
      : metric === "tds"
      ? "TDS"
      : "Turbidity";

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>
            {metricLabel} vs Time
          </h2>
          <button onClick={onClose} style={closeBtn}>
            ✕
          </button>
        </div>

        {/* Chart */}
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
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
                dataKey={metric}
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <p style={footerText}>
          Live values sampled every 4 seconds.  
          Closing this view will not reset data.
        </p>
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  width: "85%",
  maxWidth: "900px",
  background: "#0f172a",
  padding: "24px",
  borderRadius: "14px",
  color: "#e5e7eb",
  boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

const closeBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#e5e7eb",
  fontSize: "22px",
  cursor: "pointer",
};

const footerText: React.CSSProperties = {
  marginTop: "10px",
  fontSize: "13px",
  color: "#94a3b8",
};
