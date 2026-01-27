import Breadcrumbs from "../../components/Breadcrumbs";
import PdfExportButton from "../../components/PdfExportButton";

/* ===============================
   STYLES (SINGLE SYSTEM)
================================ */
const pageStyle: React.CSSProperties = {
  padding: 32,
  maxWidth: 1100,
};

const sectionBase: React.CSSProperties = {
  marginBottom: 36,
  padding: "18px 22px",
  borderRadius: 12,
};

const sectionAlt: React.CSSProperties = {
  ...sectionBase,
  background: "#020617",
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  marginBottom: 10,
};

const textStyle: React.CSSProperties = {
  lineHeight: 1.7,
  opacity: 0.9,
};

/* ===============================
   PAGE
================================ */
export default function Aquaculture() {
  const pdfContent = `
Aquaculture Water Quality Monitoring System

Session-based monitoring, filtration classification,
and automated tank routing for aquaculture environments.
`;

  return (
    <div style={pageStyle}>
      <Breadcrumbs items={["Home", "Applications", "Aquaculture"]} />

      <h1 style={{ marginBottom: 8 }}>🐟 Aquaculture Applications</h1>
      <p style={{ opacity: 0.75, marginBottom: 28 }}>
        Intelligent, session-driven water-quality monitoring for aquaculture systems.
      </p>

      <PdfExportButton
        title="Aquaculture_Water_Quality_System"
        content={pdfContent}
      />

      {/* 1 */}
      <section style={sectionBase}>
        <div style={titleStyle}>1. Problem Context</div>
        <p style={textStyle}>
          Aquaculture systems are highly sensitive to water chemistry. Small
          deviations in pH, turbidity, or dissolved solids can lead to stress,
          disease outbreaks, and reduced yield.
        </p>
      </section>

      {/* 2 */}
      <section style={sectionAlt}>
        <div style={titleStyle}>2. Key Water Quality Parameters</div>
        <p style={textStyle}>
          The system monitors pH, turbidity, and Total Dissolved Solids (TDS) to
          capture chemical balance, particulate load, and ionic concentration.
        </p>
      </section>

      {/* 3 */}
      <section style={sectionBase}>
        <div style={titleStyle}>3. Live Session-Based Monitoring</div>
        <p style={textStyle}>
          Data is collected only during explicitly started sessions. This prevents
          stale or accidental readings from influencing system decisions.
        </p>
      </section>

      {/* 4 */}
      <section style={sectionAlt}>
        <div style={titleStyle}>4. Iteration History & Analysis</div>
        <p style={textStyle}>
          Each completed session is stored as an iteration containing raw values,
          averages, timestamps, and decisions. This enables trend analysis and
          seasonal comparison.
        </p>
      </section>

      {/* 5 */}
      <section style={sectionBase}>
        <div style={titleStyle}>5. Decision Logic & Classification</div>
        <p style={textStyle}>
          Session averages are evaluated against predefined thresholds and
          classified into filtration brackets (F1–F5), ensuring consistent,
          explainable decisions.
        </p>
      </section>

      {/* 6 */}
      <section style={sectionAlt}>
        <div style={titleStyle}>6. Tank Routing & Pump Control</div>
        <p style={textStyle}>
          Based on classification results, pumps route reusable water to
          appropriate tanks while isolating contaminated water to prevent
          cross-contamination.
        </p>
      </section>

      {/* 7 */}
      <section style={sectionBase}>
        <div style={titleStyle}>7. Operational Benefits for Farmers</div>
        <ul style={textStyle}>
          <li>Reduced fish mortality and disease risk</li>
          <li>Lower water replacement costs</li>
          <li>Improved yield predictability</li>
          <li>Minimal manual intervention</li>
        </ul>
      </section>

      {/* 8 */}
      <section style={sectionAlt}>
        <div style={titleStyle}>8. Sustainability & Compliance</div>
        <p style={textStyle}>
          Controlled reuse minimizes freshwater extraction and wastewater
          discharge. Stored iterations support audits and regulatory compliance.
        </p>
      </section>

      {/* 9 */}
      <section style={sectionBase}>
        <div style={titleStyle}>9. Scalability & Cross-Domain Use</div>
        <p style={textStyle}>
          The same architecture can be adapted for agriculture irrigation and
          industrial process water systems with minimal changes.
        </p>
      </section>
    </div>
  );
}
