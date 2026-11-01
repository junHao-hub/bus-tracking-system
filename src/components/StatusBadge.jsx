const COLORS = {
  Moving: "#16a34a",
  Stopped: "#dc2626",
  Arrived: "#2563eb",
};

export default function StatusBadge({ status }) {
  return (
    <span
      style={{
        background: COLORS[status] || "#6b7280",
        color: "white",
        padding: "2px 10px",
        borderRadius: 12,
        fontSize: 12,
      }}
    >
      {status || "Unknown"}
    </span>
  );
}