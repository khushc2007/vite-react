import SystemStatus from "../components/SystemStatus";

import { useBackendConnectivity } from "../hooks/useBackendConnectivity";



const backendConnected = useBackendConnectivity(
  "https://water-quality-backend-10-kijx.onrender.com/"
);
export default function Settings() {
  return (
    <div style={{ padding: 32 }}>
      <SystemStatus
        mode="live"
        session={{
          active: true,
          completed: false,
          collected: 6,
          required: 10,
        }}
        backendConnected={true}
      />
    </div>
  );
}

const exportSnapshot = () => {
  const snapshot = {
    timestamp: new Date().toISOString(),
    mode,
    backendConnected,
    session,
  };

  const blob = new Blob(
    [JSON.stringify(snapshot, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "water-iq-system-status.json";
  a.click();
  URL.revokeObjectURL(url);
};

<button
  onClick={exportSnapshot}
  style={{
    marginTop: 24,
    padding: "12px 20px",
    borderRadius: 10,
    background: "#020617",
    color: "#22c55e",
    border: "1px solid #22c55e",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  Export System Snapshot
</button>
