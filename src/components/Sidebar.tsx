import { Page } from "../App";

type Props = {
  page: Page;
  setPage: (page: Page) => void;
};

export default function Sidebar({ page, setPage }: Props) {
  return (
    <aside
      style={{
        width: "240px",
        backgroundColor: "#020617",
        padding: "20px",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ marginBottom: "24px", color: "#38bdf8" }}>
        IoT WQMS
      </h2>

      {/* HOME */}
      <div>
        <p
          style={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() => setPage("home")}
        >
          🏠 Home
        </p>

        {/* Nested Home Sections */}
        {page === "home" && (
          <div style={{ marginLeft: "16px", marginTop: "8px" }}>
            <p
              style={{ cursor: "pointer" }}
              onClick={() => setPage("live")}
            >
              📊 Live Dashboard
            </p>

            <p
              style={{ cursor: "pointer" }}
              onClick={() => setPage("history")}
            >
              🕒 History
            </p>

            <p
              style={{ cursor: "pointer" }}
              onClick={() => setPage("applications")}
            >
              🌍 Applications
            </p>

            <p
              style={{ cursor: "pointer" }}
              onClick={() => setPage("settings")}
            >
              ⚙️ Settings
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
