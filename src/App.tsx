function App() {
  return (
    <div style={{ fontFamily: "Arial", background: "#f3f4f6", minHeight: "100vh" }}>
      
      <div style={{
        background: "#1f2937",
        color: "white",
        padding: "16px",
        fontSize: "20px",
        textAlign: "center"
      }}>
        Water Quality Monitoring Dashboard
      </div>

      <div style={{ padding: "16px" }}>

        <div style={cardStyle}>
          <h3>Sensor Values</h3>
          <p>pH: <b>7.4</b></p>
          <p>Turbidity: <b>65 NTU</b></p>
          <p>TDS: <b>1300 mg/L</b></p>
        </div>

        <div style={cardStyle}>
          <h3>Reusability Prediction</h3>
          <span style={badgeRed}>NOT REUSABLE</span>
        </div>

        <div style={cardStyle}>
          <h3>Tank Routing</h3>
          <div style={tankInactive}>Tank A (Reusable)</div>
          <div style={tankActive}>Tank B (Treatment Required)</div>
        </div>

        <div style={cardStyle}>
          <h3>Filtration Prediction</h3>
          <b>Reverse Osmosis (RO)</b>
        </div>

        <div style={cardStyle}>
          <h3>Explanation & Usage</h3>
          <p>
            Reverse Osmosis is selected due to high TDS levels.
            After treatment, water can be reused for flushing,
            gardening, and cleaning purposes.
          </p>
        </div>

      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "16px",
  marginBottom: "16px",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
};

const badgeRed: React.CSSProperties = {
  background: "#dc2626",
  color: "white",
  padding: "6px 12px",
  borderRadius: "6px",
  display: "inline-block"
};

const tankActive: React.CSSProperties = {
  background: "#fde68a",
  padding: "10px",
  marginTop: "8px",
  borderRadius: "6px",
  fontWeight: "bold"
};

const tankInactive: React.CSSProperties = {
  background: "#e5e7eb",
  padding: "10px",
  marginTop: "8px",
  borderRadius: "6px"
};

export default App;
