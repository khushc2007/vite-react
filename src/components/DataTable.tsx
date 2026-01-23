interface Props {
  ph: number;
  tds: number;
  turbidity: number;
}

export default function DataTable({ ph, tds, turbidity }: Props) {
  return (
    <table style={{ marginTop: 20, width: "100%", color: "#fff" }}>
      <thead>
        <tr>
          <th>pH</th>
          <th>TDS</th>
          <th>Turbidity</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{ph}</td>
          <td>{tds}</td>
          <td>{turbidity}</td>
        </tr>
      </tbody>
    </table>
  );
}
