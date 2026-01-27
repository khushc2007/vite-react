import Breadcrumbs from "../../components/Breadcrumbs";
import PdfExportButton from "../../components/PdfExportButton";

/* ===============================
   GLOBAL SECTION STYLES
================================ */
const pageWidth: React.CSSProperties = {
  padding: 32,
  maxWidth: 1100,
};

const sectionBase: React.CSSProperties = {
  marginBottom: 40,
};

const sectionSoft: React.CSSProperties = {
  marginBottom: 40,
  padding: "18px 22px",
  background: "#020617",
  borderRadius: 14,
};

const sectionAccent: React.CSSProperties = {
  marginBottom: 40,
  paddingLeft: 20,
  borderLeft: "5px solid #22c55e",
};

const sectionAlt: React.CSSProperties = {
  marginBottom: 40,
  padding: "18px 22px",
  background: "#020617",
  borderRadius: 14,
  border: "1px solid #1e293b",
};

const titleStyle: React.CSSProperties = {
  fontSize: 21,
  fontWeight: 800,
  marginBottom: 12,
};

const textStyle: React.CSSProperties = {
  lineHeight: 1.75,
  opacity: 0.9,
};

const divider: React.CSSProperties = {
  height: 1,
  background: "#1e293b",
  margin: "48px 0",
};

/* ===============================
   PAGE
================================ */
export default function Aquaculture() {
  const pdfContent = `
Aquaculture Water Quality Monitoring System

This document outlines how session-based monitoring, iteration history,
decision logic, and automated routing improve aquaculture sustainability.
`;

  return (
    <div style={pageWidth}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={["Home", "Applications", "Aquaculture"]} />

      <h1 style={{ marginBottom: 8 }}>🐟 Aquaculture Applications</h1>
      <p style={{ opacity: 0.75, marginBottom: 28 }}>
        Application of intelligent, session-driven water-quality monitoring
        systems in aquaculture environments.
      </p>

      <PdfExportButton
        title="Aquaculture_Water_Quality_System"
        content={pdfContent}
      />

      {/* 1 */}
      <section style={sectionBase}>
        <div style={titleStyle}>1. Problem Context</div>
        <p style={textStyle}>
          Aquaculture environments are highly sensitive to water chemistry.
          Minor deviations in pH, turbidity, or dissolved solids can lead to
          physiological stress, disease outbreaks, and reduced growth rates.
          Manual testing is reactive and insufficient for continuous control.
        </p>
      </section>

      {/* 2 */}
      <section style={sectionSoft}>
        <div style={titleStyle}>2. Water Quality Parameters Monitored</div>
        <p style={textStyle}>
          The system continuously monitors pH, turbidity, and Total Dissolved
          Solids (TDS). These parameters collectively describe chemical balance,
          particulate load, and ionic concentration—core indicators of aquatic
          habitat stability.
        </p>
      </section>

      {/* 3 */}
      <section style={sectionAccent}>
        <div style={titleStyle}>3. Live Monitoring & Session Control</div>
        <p style={textStyle}>
          Data collection occurs only within explicitly triggered live sessions.
          This session-based architecture ensures that only valid, intentional
          measurements influence decisions, eliminating background noise and
          false data interpretation.
        </p>
      </section>

      <div style={divider} />

      {/* 4 */}
      <section style={sectionAlt}>
        <div style={titleStyle}>4. Iteration History & Trend Analysis</div>
        <p style={textStyle}>
          Each completed session is saved as an iteration containing timestamped
          readings, computed averages, and final decisions. Iteration history
          allows farmers to analyze seasonal behavior, detect recurring issues,
          and evaluate long-term water stability.
        </p>
      </section>

      {/* 5 */}
      <section style={sectionBase}>
        <div style={titleStyle}>5. Decision Logic & Filtration Classification</div>
        <p style={textStyle}>
          After a session completes, the system evaluates average sensor values
          and classifies water into filtration brackets (F1–F5). This ensures
          consistent, explainable, and repeatable decisions across all cycles.
        </p>
      </section>

      {/* 6 */}
      <section style={sectionSoft}>
        <div style={titleStyle}>6. Tank Segregation & Pump Routing</div>
        <p style={textStyle}>
          Classification results directly control pump routing. Reusable water
          is directed into appropriate tanks, while contaminated water is
          isolated or routed for treatment, preventing cross-contamination
          within aquaculture systems.
        </p>
      </section>

      <div style={divider} />

      {/* 7 */}
      <section style={sectionAccent}>
        <div style={titleStyle}>7. Operational Benefits for Farmers</div>
        <ul style={textStyle}>
          <li>Reduced fish mortality and disease risk</li>
          <li>Lower water replacement and treatment costs</li>
          <li>Improved yield predictability</li>
          <li>Reduced dependency on manual testing</li>
        </ul>
      </section>

      {/* 8 */}
      <section style={sectionAlt}>
        <div style={titleStyle}>8. Sustainability & Regulatory Alignment</div>
        <p style={textStyle}>
          Controlled reuse of water minimizes freshwater extraction and reduces
          wastewater discharge. Stored iterations provide auditable records,
          supporting environmental compliance and responsible aquaculture
          practices.
        </p>
      </section>

      {/* 9 */}
      <section style={sectionBase}>
        <div style={titleStyle}>9. Scalability & Cross-Domain Adaptability</div>
        <p style={textStyle}>
          The same monitoring, decision, and iteration framework can be adapted
          to agriculture irrigation systems and industrial process water
          management with minimal modification, making the system domain-agnostic
          and future-ready.
        </p>
      </section>
    </div>
  );
}
