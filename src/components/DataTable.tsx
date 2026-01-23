interface Props {
  rows: any[];
}

export default function DataTable({ rows }: Props) {
  return (
    <div
      style={{
        marginTop: 12,
        background: "#020617",
        borderRadius: 12,
        padding: 12,
        maxHeight: 260,
        overflowY: "auto",
        border: "1px solid #1e293b",
      }}
    >
      <table style={{ width: "100%", color: "#e5e7eb" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#94a3b8" }}>
            <th>Time</th>
            <th>pH</th>
            <th>TDS</th>
            <th>Turbidity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
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
