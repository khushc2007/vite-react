import Breadcrumbs from "../../components/Breadcrumbs";
import ExpandableSection from "../../components/ExpandableSection";
import PdfExportButton from "../../components/PdfExportButton";

export default function Aquaculture() {
  const pdfContent = `
Aquaculture Water Quality Monitoring

Aquaculture systems require precise monitoring of water quality parameters
such as pH, turbidity, and total dissolved solids (TDS) to ensure fish health,
prevent disease outbreaks, and maintain sustainable production.

Poor water quality leads to stress, reduced growth rates, and increased mortality.
`;

  return (
    <div>
      {/* Breadcrumb navigation */}
      <Breadcrumbs
        items={["Home", "Applications", "Aquaculture"]}
      />

      <h1 style={{ marginBottom: "8px" }}>
        🐟 Aquaculture Applications
      </h1>
      <p style={{ opacity: 0.75, marginBottom: "18px" }}>
        Application of intelligent water-quality monitoring in aquaculture systems.
      </p>

      {/* PDF Export */}
      <PdfExportButton
        title="Aquaculture_Water_Quality"
        content={pdfContent}
      />

      {/* Expandable Research Sections */}
      <ExpandableSection
        title="Importance of Water Quality in Aquaculture"
        icon="💧"
      >
        <p>
          Aquatic organisms are extremely sensitive to changes in water chemistry.
          Parameters such as pH affect metabolic activity, while turbidity can
          reduce oxygen penetration and interfere with feeding behavior.
        </p>
        <p>
          Continuous monitoring enables early detection of unfavorable conditions,
          reducing economic losses and improving fish welfare.
        </p>
      </ExpandableSection>

      <ExpandableSection
        title="Role of Sensors and IoT Systems"
        icon="📡"
      >
        <p>
          IoT-based sensor networks provide real-time measurement of pH,
          turbidity, and TDS. These systems eliminate manual sampling errors
          and allow remote monitoring of large aquaculture facilities.
        </p>
        <p>
          Data collected can be visualized, stored, and analyzed for trends
          and anomalies.
        </p>
      </ExpandableSection>

      <ExpandableSection
        title="Filtration, Reuse, and Tank Segregation"
        icon="🧪"
      >
        <p>
          Based on measured parameters, water is classified into filtration
          brackets (F1–F5). Reusable water is routed to Tank A, while non-reusable
          water undergoes further treatment or disposal.
        </p>
        <p>
          This decision-making process minimizes water wastage and supports
          sustainable aquaculture practices.
        </p>
      </ExpandableSection>

      <ExpandableSection
        title="Automation and Sustainability Benefits"
        icon="⚙️"
      >
        <p>
          Automated decision systems reduce dependency on manual labor and
          ensure consistent water quality. Integration with control units
          allows automatic filtration, alerts, and corrective actions.
        </p>
        <p>
          Such systems promote sustainability by optimizing water reuse and
          reducing environmental impact.
        </p>
      </ExpandableSection>
    </div>
  );
}
