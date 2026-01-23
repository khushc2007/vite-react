import { Reading } from "../App";

export default function DataTable({ readings }: { readings: Reading[] }) {
  return (
    <div style={{ maxHeight: 250, overflowY: "auto", marginTop: 20 }}>
      <table style={{ width: "100%", color: "#e5e7eb" }}>
        <thead>
          <tr>
            <th>SL</th>
            <th>Time</th>
            <th>pH</th>
            <th>TDS</th>
            <th>Turbidity</th>
          </tr>
        </thead>
        <tbody>
          {readings.map(r => (
            <tr key={r.sl}>
              <td>{r.sl}</td>
              <td>{r.time}</td>
              <td>{r.ph.toFixed(2)}</td>
              <td>{r.tds.toFixed(2)}</td>
              <td>{r.turbidity.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
