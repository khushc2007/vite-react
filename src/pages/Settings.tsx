import { useBackendConnectivity } from "../hooks/useBackendConnectivity";
import SystemStatus from "../components/SystemStatus";

export default function Settings() {
  /* ===============================
     SYSTEM STATE (READ-ONLY)
  ================================ */
  const mode: "live" | "simulation" = "live";

  const session = {
    active: true,
    completed: false,
    collected: 6,
    required: 10,
  };

  const backendConnected = useBackendConnectivity(
    "https://water-quality-backend-10-kijx.onrender.com/session/status"
  );

  /* ===============================
     EXPORT SNAPSHOT
  ================================ */
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

  /* ===============================
     UI
  ================================ */
  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 24 }}>
        Settings
      </h1>

      {/* ===============================
         SYSTEM STATUS
      ================================ */}
      <SystemStatus
        mode={mode}
        session={session}
        backendConnected={backendConnected}
      />

      <button
        onClick={exportSnapshot}
        style={{
          marginTop: 20,
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

      {/* ===============================
         SENSOR CONFIGURATION
      ================================ */}
      <Section title="Sensor Configuration (Read-only)">
        <ul>
          <li>pH Sensor — Analog input (ESP32 ADC)</li>
          <li>TDS Sensor — Analog input (ESP32 ADC)</li>
          <li>Turbidity Sensor — Analog input (ESP32 ADC)</li>
          <li>Sampling handled by ESP firmware</li>
        </ul>
      </Section>

      {/* ===============================
         DECISION LOGIC
      ================================ */}
      <Section title="Decision Logic">
        <p>
          Water classification is based on averaged batch values of pH,
          turbidity, and TDS collected during an active live session.
        </p>
        <ul>
          <li>Reusable range: pH 6.5–8.5</li>
          <li>Turbidity thresholds define filtration brackets (F1–F5)</li>
          <li>TDS used to determine reuse feasibility</li>
        </ul>
      </Section>

      {/* ===============================
         TANK & PUMP ROUTING
      ================================ */}
      <Section title="Tank & Pump Routing">
        <ul>
          <li>Reusable water → Tank A</li>
          <li>Non-reusable water → Tank B</li>
          <li>Pump routing controlled via relay module</li>
          <li>Routing decision issued by backend</li>
        </ul>
      </Section>

      {/* ===============================
         DATA HANDLING
      ================================ */}
      <Section title="Data Handling">
        <ul>
          <li>Sensor data ingested only during active sessions</li>
          <li>Session data stored in memory for prediction</li>
          <li>Saved iterations stored locally (frontend)</li>
          <li>No personal or user-identifiable data stored</li>
        </ul>
      </Section>

      {/* ===============================
         SAFETY DISCLAIMER
      ================================ */}
      <Section title="Safety Disclaimer">
        <p>
          This system is intended for academic, experimental, and controlled
          environments. It must not be used as a sole decision-making system
          for potable water supply or critical industrial operations.
        </p>
      </Section>
    </div>
  );
}

/* ===============================
   HELPER COMPONENT
================================ */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 32 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#22c55e",
          marginBottom: 8,
        }}
      >
        {title}
      </h2>
      <div style={{ color: "#cbd5f5", lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}
