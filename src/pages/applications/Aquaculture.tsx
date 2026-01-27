import Breadcrumbs from "../../components/Breadcrumbs";
import PdfExportButton from "../../components/PdfExportButton";

const sectionStyle: React.CSSProperties = {
  marginBottom: 32,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  marginBottom: 8,
};

const sectionText: React.CSSProperties = {
  lineHeight: 1.7,
  opacity: 0.9,
};

export default function Aquaculture() {
  const pdfContent = `
Aquaculture Water Quality Monitoring System

This document describes the application of a session-based, sensor-driven
water quality monitoring and decision system in aquaculture environments.
`;

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={["Home", "Applications", "Aquaculture"]} />

      <h1 style={{ marginBottom: 6 }}>🐟 Aquaculture Application</h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        Intelligent monitoring, decision-making, and reuse of water in aquaculture systems.
      </p>

      <PdfExportButton
        title="Aquaculture_Water_Quality"
        content={pdfContent}
      />

      {/* 1. Problem Context */}
      <section style={sectionStyle}>
        <div style={sectionTitle}>1. Problem Context</div>
        <p style={sectionText}>
          Aquaculture systems are highly sensitive to water quality variations.
          Even minor deviations in pH, turbidity, or dissolved solids can lead
          to stress, disease outbreaks, reduced growth rates, and economic loss.
          Manual monitoring is inconsistent and impractical at scale.
        </p>
      </section>

      {/* 2. Parameters Monitored */}
      <section style={sectionStyle}>
        <div style={sectionTitle}>2. Parameters Monitored</div>
        <p style={sectionText}>
          The system continuously monitors pH, turbidity, and total dissolved
          solids (TDS). These parameters directly influence fish metabolism,
          oxygen availability, and long-term water toxicity.
        </p>
        {/* You can add images here later */}
      </section>

      {/* 3. Live Monitoring & Sessions */}
      <section style={sectionStyle}>
        <div style={sectionTitle}>3. Live Monitoring & Session-Based Collection</div>
        <p style={sectionText}>
          Data is collected only during explicitly triggered live sessions.
          This prevents stale or random readings from influencing decisions.
          Each session produces a consistent batch of sensor readings used
          for analysis and classification.
        </p>
      </section>

      {/* 4. Iteration History */}
      <section style={sectionStyle}>
        <div style={sectionTitle}>4. Iteration History & Trend Analysis</div>
        <p style={sectionText}>
          Every completed session is stored as an iteration with timestamps
          and averaged values. Historical iterations enable trend detection,
          such as gradual pH drift, recurring turbidity spikes after feeding,
          and long-term salinity accumulation.
        </p>
      </section>

      {/* 5. Decision Logic */}
      <section style={sectionStyle}>
        <div style={sectionTitle}>5. Decision Logic & Water Routing</div>
        <p style={sectionText}>
          Based on computed averages, water is classified into filtration
          brackets. Reusable water is routed to Tank A, while non-reusable
          water is directed to Tank B for treatment or disposal through
          automated pump control.
        </p>
      </section>

      {/* 6. Operational Benefits */}
      <section style={sectionStyle}>
        <div style={sectionTitle}>6. Operational Benefits</div>
        <ul style={sectionText}>
          <li>Reduced fish mortality</li>
          <li>Lower water replacement costs</li>
          <li>Consistent and objective decision-making</li>
          <li>Reduced manual intervention</li>
        </ul>
      </section>

      {/* 7. Example Scenario */}
      <section style={sectionStyle}>
        <div style={sectionTitle}>7. Example Scenario</div>
        <p style={sectionText}>
          After feeding cycles, turbidity spikes are observed across multiple
          iterations. Using historical data, farmers adjust feed timing and
          quantity, stabilizing water quality and improving fish health.
        </p>
      </section>

      {/* 8. Scalability */}
      <section style={sectionStyle}>
        <div style={sectionTitle}>8. Scalability & Deployment Readiness</div>
        <p style={sectionText}>
          The system supports single-pond and multi-pond deployments. Its
          ESP-based architecture enables low-cost scaling and integration
          with additional sensors such as temperature or dissolved oxygen.
        </p>
      </section>

      {/* 9. Compliance */}
      <section style={sectionStyle}>
        <div style={sectionTitle}>9. Compliance & Reporting</div>
        <p style={sectionText}>
          Stored iterations provide traceable water quality records that
          support audits, compliance reporting, and data-driven farm
          management decisions.
        </p>
      </section>
    </div>
  );
}
