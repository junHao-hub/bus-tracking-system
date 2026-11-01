import StatusBadge from "./StatusBadge";

export default function BusCard({ bus, selected, onSelect, distance, eta }) {
  return (
    <div
      onClick={() => onSelect && onSelect(bus.id)}
      style={{
        border: selected ? "2px solid #2563eb" : "1px solid #ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      <h3 style={{ margin: "0 0 8px 0" }}>{bus.busNumber}</h3>
      <StatusBadge status={bus.status} />
      <p>Speed {bus.speed ?? 0} km/h</p>
      <p>Nearest stop {bus.nearestStop || "Not set"}</p>      <p>Distance {distance ?? "Calculating..."}</p>
      <p>ETA {eta ?? "Calculating..."}</p>
    </div>
  );
}