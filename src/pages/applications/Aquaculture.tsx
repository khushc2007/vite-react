import Breadcrumbs from "../../components/Breadcrumbs";
import PdfExportButton from "../../components/PdfExportButton";

/* ===============================
   SECTION STYLES (REUSABLE)
================================ */
const baseSection: React.CSSProperties = {
  marginBottom: 36,
};

const softSection: React.CSSProperties = {
  marginBottom: 36,
  padding: "16px 20px",
  background: "#020617",
  borderRadius: 12,
};

const accentSection: React.CSSProperties = {
  marginBottom: 36,
  paddingLeft: 18,
  borderLeft: "4px solid #22c55e",
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

This document explains how session-based water-quality monitoring,
decision logic, filtration classification, and iteration history
support sustainable aquaculture operations.
`;

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={["Home", "Applications", "Aquaculture"]} />

      <h1 style={{ marginBottom: 8 }}>🐟 Aquaculture Applications</h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        Application of intelligent, session-based water-quality monitoring
        and decision systems in aquaculture environments.
      </p>

      <PdfExportButton
        title="Aquaculture_Water_Quality_System"
        content={pdfContent}
      />

      {/* 1. PROBLEM CONTEXT */}
      <section style={baseSection}>
        <div style={titleStyle}>1. Problem Context</div>
        <p style={textStyle}>
          Aquaculture systems are highly sensitive to water quality fluctuations.
          Even minor deviations in pH, turbidity, or dissolved solids can result
          in stress, disease outbreaks, and reduced growth rates among aquatic
          organisms. Traditional manual sampling methods are reactive, error-prone,
          and unsuitable for continuous monitoring.
        </p>
      </section>

      {/* 2. PARAMETERS MONITORED */}
      <section style={softSection}>
        <div style={titleStyle}>2. Parameters Monitored</div>
        <p style={textStyle}>
          The system continuously measures pH, turbidity, and Total Dissolved Solids
          (TDS). These parameters collectively represent chemical stability, suspended
          particle load, and dissolved ionic concentration—critical indicators of
          aquaculture water health.
        </p>
      </section>

      {/* 3. LIVE MONITORING & SESSIONS */}
      <section style={accentSection}>
        <div style={titleStyle}>3. Live Monitoring & Session-Based Collection</div>
        <p style={textStyle}>
          Sensor data is collected strictly within explicitly triggered live sessions.
          This ensures that only intentional, validated measurements contribute to
          system decisions. Pre-session or idle readings are ignored, eliminating
          background noise and false conclusions.
        </p>
      </section>

      {/* 4. ITERATION HISTORY */}
      <section style={baseSection}>
        <div style={titleStyle}>4. Iteration History & Trend Analysis</div>
        <p style={textStyle}>
          Each completed session is stored as an iteration containing raw readings,
          averages, decisions, and timestamps. Historical iterations allow farmers
          to observe seasonal trends, recurring anomalies, and long-term water
          stability patterns.
        </p>
      </section>

      {/* 5. DECISION LOGIC */}
      <section style={softSection}>
        <div style={titleStyle}>5. Decision Logic & Classification</div>
        <p style={textStyle}>
          After collecting a full batch, the system computes averages and classifies
          water into filtration brackets (F1–F5). This logic determines whether water
          is reusable, requires treatment, or must be isolated, ensuring consistent
          and explainable decision-making.
        </p>
      </section>

      {/* 6. TANK & PUMP ROUTING */}
      <section style={accentSection}>
        <div style={titleStyle}>6. Tank Segregation & Pump Routing</div>
        <p style={textStyle}>
          Based on classification results, pumps are automatically actuated to route
          water into designated tanks. Reusable water is separated from contaminated
          water, preventing cross-contamination and preserving aquatic environments.
        </p>
      </section>

      {/* 7. OPERATIONAL BENEFITS */}
      <section style={baseSection}>
        <div style={titleStyle}>7. Operational Benefits for Farmers</div>
        <ul style={textStyle}>
          <li>Reduced fish mortality and disease risk</li>
          <li>Lower water replacement and treatment costs</li>
          <li>Improved yield predictability</li>
          <li>Reduced dependency on manual testing</li>
        </ul>
      </section>

      {/* 8. SUSTAINABILITY & COMPLIANCE */}
      <section style={softSection}>
        <div style={titleStyle}>8. Sustainability & Regulatory Alignment</div>
        <p style={textStyle}>
          Controlled reuse of water minimizes freshwater extraction and wastewater
          discharge. Session logs and stored iterations provide auditable records,
          supporting environmental compliance and responsible aquaculture practices.
        </p>
      </section>

      {/* 9. SCALABILITY & ADAPTABILITY */}
      <section style={accentSection}>
        <div style={titleStyle}>9. Scalability & Cross-Domain Adaptability</div>
        <p style={textStyle}>
          The same architecture, logic, and iteration model can be adapted for
          agriculture irrigation systems and industrial process water management
          with minimal changes. This makes the system future-proof and domain-agnostic.
        </p>
      </section>
    </div>
  );
}
