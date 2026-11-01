import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
  Polyline,
  useMap,
  useMapEvents,
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

// Shows the coordinates of the clicked point, used to collect bus stop positions
function CoordinatePicker() {
  const [point, setPoint] = useState(null);

  useMapEvents({
    click(e) {
      setPoint([e.latlng.lat, e.latlng.lng]);
    },
  });

  if (!point) return null;
  return (
    <Popup key={point.join(",")} position={point}>
      <b>
        {point[0].toFixed(6)}, {point[1].toFixed(6)}
      </b>
    </Popup>
  );
}

export default function MapView({
  buses,
  selectedId,
  stops = [],
  selectedStopId,
  route = [],
  pickMode = false,
}) {
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

      {pickMode && <CoordinatePicker />}

      {/* The route is drawn first so stops and buses appear on top */}
      {route.length > 1 && (
        <Polyline
          positions={route}
          pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.6 }}
        />
      )}

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