// src/layouts/MainLayout.tsx

import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1f2a36, #2f4f6f)",
        color: "#eaeaea",
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          padding: "24px",
          marginLeft: "12px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

