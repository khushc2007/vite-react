// src/components/DataTable.tsx

import { Reading } from "../services/dataService";

export default function DataTable({ rows }: { rows: Reading[] }) {
  return (
    <div
      style={{
        marginTop: "20px",
        maxHeight: "260px",
        overflowY: "auto",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "12px",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Sl", "Time", "pH", "TDS", "Turbidity"].map((h) => (
              <th key={h} style={{ padding: "8px", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sl}>
              <td>{r.sl}</td>
              <td>{r.time}</td>
              <td>{r.ph}</td>
              <td>{r.tds}</td>
              <td>{r.turbidity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
