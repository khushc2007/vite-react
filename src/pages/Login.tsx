export default function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #16222A, #3A6073)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "40px",
          borderRadius: "14px",
          background: "rgba(0,0,0,0.45)",
          textAlign: "center",
          width: "320px",
        }}
      >
        <h2>Water Quality Monitoring</h2>
        <p style={{ opacity: 0.7 }}>Demo Login</p>
        <button
          onClick={onLogin}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#4da3ff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
