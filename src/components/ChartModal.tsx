interface Props {
  title: string;
  onClose: () => void;
}

export default function ChartModal({ title, onClose }: Props) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{ background: "#020617", padding: 20 }}>
        <h3>{title} vs Time</h3>
        <p>(Chart placeholder)</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
