import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [3.0568, 101.7012];

// Moves the map view when the selected bus position changes
function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng]);
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapView({ buses, selectedId, stops = [], selectedStopId }) {
  const selectedBus = buses.find((b) => b.id === selectedId);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Recenter lat={selectedBus?.latitude} lng={selectedBus?.longitude} />

      {/* Bus stops are drawn first so the buses appear on top */}
      {stops.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.latitude, s.longitude]}
          radius={s.id === selectedStopId ? 10 : 7}
          pathOptions={{
            color: "#15803d",
            fillColor: s.id === selectedStopId ? "#f59e0b" : "#22c55e",
            fillOpacity: 1,
          }}
        >
          <Tooltip permanent direction="top" offset={[0, -8]}>
            {s.name}
          </Tooltip>
        </CircleMarker>
      ))}

      {buses
        .filter((b) => b.latitude && b.longitude)
        .map((b) => (
          <CircleMarker
            key={b.id}
            center={[b.latitude, b.longitude]}
            radius={b.id === selectedId ? 12 : 8}
            pathOptions={{ color: b.id === selectedId ? "#2563eb" : "#dc2626" }}
          >
            <Popup>
              {b.busNumber} - {b.status}
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}