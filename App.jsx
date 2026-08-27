export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#081226",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>Qidazzz</h1>

      <p>Welcome back.</p>

      <div
        style={{
          background: "#13203a",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <h2>Dashboard</h2>
        <p>Balance: 0 Points</p>
      </div>

      <div
        style={{
          background: "#13203a",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <h2>Upcoming Matches</h2>
        <p>Sample schedule data</p>
      </div>
    </div>
  );
}
