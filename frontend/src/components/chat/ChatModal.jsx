export default function ChatModal({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "90px",
        left: "24px",
        width: "360px",
        height: "420px",
        background: "#0b1220",
        borderRadius: "14px",
        zIndex: 1000,
        padding: "12px",
        color: "white"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>RideWise AI</strong>
        <button onClick={onClose}>✕</button>
      </div>

      <p style={{ marginTop: "20px" }}>
        Chat UI working ✔
      </p>
    </div>
  );
}
