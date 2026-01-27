import { useState } from "react";
import { NavLink } from "react-router-dom";

const sectionStyle = {
  marginBottom: "18px",
};

const sectionTitle = {
  fontSize: "13px",
  letterSpacing: "0.5px",
  color: "#9aa4b2",
  marginBottom: "6px",
  marginTop: "14px",
  cursor: "pointer",
};

const linkStyle = {
  display: "block",
  padding: "8px 12px",
  borderRadius: "6px",
  textDecoration: "none",
  color: "#e6eaf0",
  fontSize: "14px",
};

const activeLinkStyle = {
  background: "#1f2a44",
};

export default function Sidebar() {
  const [homeOpen, setHomeOpen] = useState(true);
  const [appsOpen, setAppsOpen] = useState(true);

  return (
    <aside
      style={{
        width: "240px",
        background: "#0f172a",
        padding: "16px",
        height: "100vh",
        boxSizing: "border-box",
        borderRight: "1px solid #1e293b",
      }}
    >
      <h2 style={{ color: "#ffffff", marginBottom: "20px" }}>
        Water IQ
      </h2>

      {/* HOME SECTION */}
      <div style={sectionStyle}>
        <div
          style={sectionTitle}
          onClick={() => setHomeOpen(!homeOpen)}
        >
          HOME
        </div>

        {homeOpen && (
          <>
            {/* NEW HOME OVERVIEW */}
            <NavLink
              to="/home"
              style={({ isActive }) =>
                isActive
                  ? { ...linkStyle, ...activeLinkStyle }
                  : linkStyle
              }
            >
              Overview
            </NavLink>

            {/* EXISTING LINKS */}
            <NavLink
              to="/live"
              style={({ isActive }) =>
                isActive
                  ? { ...linkStyle, ...activeLinkStyle }
                  : linkStyle
              }
            >
              Live Dashboard
            </NavLink>
            <NavLink
  to="/tank"
  style={({ isActive }) =>
    isActive
      ? { ...linkStyle, ...activeLinkStyle }
      : linkStyle
  }
>
  Tank View
</NavLink>

            <NavLink
              to="/history"
              style={({ isActive }) =>
                isActive
                  ? { ...linkStyle, ...activeLinkStyle }
                  : linkStyle
              }
            >
              History
            </NavLink>

            <NavLink
              to="/settings"
              style={({ isActive }) =>
                isActive
                  ? { ...linkStyle, ...activeLinkStyle }
                  : linkStyle
              }
            >
              Settings
            </NavLink>
          </>
        )}
      </div>

      {/* APPLICATIONS SECTION */}
      <div style={sectionStyle}>
        <div
          style={sectionTitle}
          onClick={() => setAppsOpen(!appsOpen)}
        >
          APPLICATIONS
        </div>

        {appsOpen && (
          <>
            <NavLink
              to="/applications/aquaculture"
              style={({ isActive }) =>
                isActive
                  ? { ...linkStyle, ...activeLinkStyle }
                  : linkStyle
              }
            >
              Aquaculture
            </NavLink>

            <NavLink
              to="/applications/agriculture"
              style={({ isActive }) =>
                isActive
                  ? { ...linkStyle, ...activeLinkStyle }
                  : linkStyle
              }
            >
              Agriculture
            </NavLink>

            <NavLink
              to="/applications/industrial"
              style={({ isActive }) =>
                isActive
                  ? { ...linkStyle, ...activeLinkStyle }
                  : linkStyle
              }
            >
              Industrial
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
}
