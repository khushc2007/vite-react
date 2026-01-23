export default function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{ margin: "auto", textAlign: "center" }}>
      <h2>Water Quality Monitoring System</h2>
      <button onClick={onLogin}>Login</button>
    </div>
  );
}
