import { useState } from "react";
import { Reading } from "../App";

export default function SaveIterationModal({
  readings,
  close,
}: {
  readings: Reading[];
  close: () => void;
}) {
  const [name, setName] = useState("");

  const save = () => {
    if (!name) return;

    const avg = {
      ph: readings.reduce((a, r) => a + r.ph, 0) / readings.length,
      tds: readings.reduce((a, r) => a + r.tds, 0) / readings.length,
      turbidity: readings.reduce((a, r) => a + r.turbidity, 0) / readings.length,
    };

    const history = JSON.parse(localStorage.getItem("history") || "[]");
    history.unshift({ name, avg, time: new Date().toISOString() });
    localStorage.setItem("history", JSON.stringify(history));

    close(); // IMPORTANT: does NOT clear readings
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Name this iteration</h3>
        <input value={name} onChange={e => setName(e.target.value)} />
        <button onClick={save}>Save</button>
        <button onClick={close}>Cancel</button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  background: "#020617",
  padding: 20,
  borderRadius: 12,
};
