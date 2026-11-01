import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { pickupIcon, destinationIcon, stopIcon, busIcon } from "./mapIcons";

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
  pickupStopId,
  destinationStopId,
  route = [],
  routeColor = "#1d4ed8",
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

      {/* The route is a dark line with a white edge, drawn first so stops and buses stay on top */}
      {route.length > 1 && (
        <>
          <Polyline
            positions={route}
            pathOptions={{
              color: "#ffffff",
              weight: 11,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
          <Polyline
            positions={route}
            pathOptions={{
              color: routeColor,
              weight: 6,
              opacity: 1,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </>
      )}

      {stops.map((s) => {
        let icon = stopIcon;
        let role = null;
        if (s.id === pickupStopId) {
          icon = pickupIcon;
          role = "Pickup";
        } else if (s.id === destinationStopId) {
          icon = destinationIcon;
          role = "Destination";
        }

        return (
          <Marker key={s.id} position={[s.latitude, s.longitude]} icon={icon}>
            <Tooltip permanent direction="top">
              {role && <div className="map-role">{role}</div>}
              <div>{s.name}</div>
            </Tooltip>
          </Marker>
        );
      })}

      {buses
        .filter((b) => b.latitude && b.longitude)
        .map((b) => (
          <Marker
            key={b.id}
            position={[b.latitude, b.longitude]}
            icon={busIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              {b.busNumber} - {b.status}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}