import { getHistory } from "../services/dataService";

export default function History() {
  const history = getHistory();

  return (
    <>
      <h2>History</h2>
      {history.map((h, i) => (
        <div key={i} style={{ borderBottom: "1px solid #334155", padding: 8 }}>
          <b>Iteration {i + 1}</b> — pH:{h.ph}, TDS:{h.tds}, Turb:{h.turbidity} → {h.result.reusable}
        </div>
      ))}
    </>
  );
}


