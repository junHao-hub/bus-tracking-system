import { useEffect, useState } from "react";
import { subscribeBuses } from "../services/busService";
import { STOPS } from "../data/stops";
import { ROUTE } from "../data/route";
import { distanceInMeters, formatDistance } from "../utils/distanceCalculator";
import { calculateEtaMinutes, formatEta } from "../utils/etaCalculator";
import BusCard from "../components/BusCard";
import MapView from "../maps/MapView";

export default function Dashboard() {
  const [buses, setBuses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [stopId, setStopId] = useState(STOPS[0].id);

  // Add ?pick=1 to the address to turn on the coordinate picker
  const pickMode =
    new URLSearchParams(window.location.search).get("pick") === "1";

  useEffect(() => {
    const unsubscribe = subscribeBuses(setBuses);
    return () => unsubscribe();
  }, []);

  const stop = STOPS.find((s) => s.id === stopId);

  // Distance and ETA from one bus to the selected stop
  const getDistanceAndEta = (bus) => {
    if (!bus.latitude || !bus.longitude) {
      return { distance: undefined, eta: undefined };
    }
    const meters = distanceInMeters(
      bus.latitude,
      bus.longitude,
      stop.latitude,
      stop.longitude
    );
    const minutes = calculateEtaMinutes(meters, bus.speed ?? 0);
    return { distance: formatDistance(meters), eta: formatEta(minutes) };
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        height: "calc(100vh - 56px)",
      }}
    >
      <div style={{ flex: "1 1 300px", padding: 12, overflowY: "auto" }}>
        <h2 style={{ marginTop: 0 }}>Student Dashboard</h2>

        <label>
          Your bus stop{" "}
          <select value={stopId} onChange={(e) => setStopId(e.target.value)}>
            {STOPS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <div style={{ marginTop: 12 }}>
          {buses.length === 0 && <p>No buses available</p>}
          {buses.map((bus) => {
            const { distance, eta } = getDistanceAndEta(bus);
            return (
              <BusCard
                key={bus.id}
                bus={bus}
                distance={distance}
                eta={eta}
                selected={bus.id === selectedId}
                onSelect={setSelectedId}
              />
            );
          })}
        </div>
      </div>

      <div style={{ flex: "2 1 400px", minHeight: 350 }}>
        <MapView
          buses={buses}
          selectedId={selectedId}
          stops={STOPS}
          selectedStopId={stopId}
          route={ROUTE}
          pickMode={pickMode}
        />
      </div>
    </div>
  );
}