import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function MainLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
      }}
    >
      {/* ===== SIDEBAR ===== */}
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          backgroundColor: "#020617",
          borderRight: "1px solid #1e293b",
        }}
      >
        <Sidebar />
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main
        style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          color: "#e5e7eb",
          backgroundColor: "#0f172a",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
