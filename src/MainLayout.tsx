import { Outlet, NavLink } from "react-router-dom";

export default function MainLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f1b2a" }}>
      
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#12263a",
          color: "#fff",
          padding: "20px",
          borderRight: "1px solid #1f3a56",
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>Water UI</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <NavLink to="/" style={linkStyle}>Home</NavLink>
          <NavLink to="/dashboard" style={linkStyle}>Live Dashboard</NavLink>
          <NavLink to="/applications" style={linkStyle}>Applications</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "30px" }}>
        <Outlet />
      </main>
    </div>
  );
}

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? "#4fd1c5" : "#cbd5e1",
  textDecoration: "none",
  fontSize: "16px",
});
