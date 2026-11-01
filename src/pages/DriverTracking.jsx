import { useEffect, useRef, useState } from "react";
import { updateBusLocation } from "../services/busService";
import {
  driverSignIn,
  driverSignOut,
  watchAuth,
  DRIVER_EMAIL,
} from "../services/authService";
import { STOPS } from "../data/stops";
import { distanceInMeters } from "../utils/distanceCalculator";
import { getBusStatus } from "../utils/busStatus";

const BUS_LIST = [
  { id: "BUS001", busNumber: "APU-BUS-01" },
  { id: "BUS002", busNumber: "APU-BUS-02" },
];

// Movements smaller than this are treated as position noise
const MIN_MOVE_METERS = 10;

function findNearestStop(lat, lng) {
  let nearest = null;
  let nearestMeters = null;
  STOPS.forEach((stop) => {
    const meters = distanceInMeters(lat, lng, stop.latitude, stop.longitude);
    if (nearestMeters === null || meters < nearestMeters) {
      nearest = stop;
      nearestMeters = meters;
    }
  });
  return { stop: nearest, meters: nearestMeters };
}

export default function DriverTracking() {
  const [user, setUser] = useState(undefined);
  const [code, setCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [busId, setBusId] = useState("BUS001");
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState("");
  const watchRef = useRef(null);
  const lastPositionRef = useRef(null);

  useEffect(() => {
    const unsubscribe = watchAuth(setUser);
    return () => unsubscribe();
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await driverSignIn(code);
      setCode("");
    } catch (err) {
      setAuthError("Wrong driver code");
    }
  };

  const start = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }
    setError("");
    lastPositionRef.current = null;
    const bus = BUS_LIST.find((b) => b.id === busId);

    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let speedKmh = 0;

        if (position.coords.speed !== null && position.coords.speed !== undefined) {
          // Phones with GPS report the speed directly
          speedKmh = position.coords.speed * 3.6;
        } else if (lastPositionRef.current) {
          // Otherwise calculate the speed from the last position
          const last = lastPositionRef.current;
          const meters = distanceInMeters(last.latitude, last.longitude, latitude, longitude);
          const seconds = (position.timestamp - last.timestamp) / 1000;
          if (seconds > 0 && meters > MIN_MOVE_METERS) {
            speedKmh = (meters / seconds) * 3.6;
          }
        }

        lastPositionRef.current = { latitude, longitude, timestamp: position.timestamp };

        const nearest = findNearestStop(latitude, longitude);
        updateBusLocation(busId, {
          busNumber: bus.busNumber,
          latitude,
          longitude,
          speed: Math.round(speedKmh),
          status: getBusStatus(speedKmh, nearest.meters),
          nearestStop: nearest.stop.name,
        }).catch((err) => setError(err.message));
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    setTracking(true);
  };

  const stop = () => {
    navigator.geolocation.clearWatch(watchRef.current);
    updateBusLocation(busId, { status: "Stopped", speed: 0 });
    setTracking(false);
  };

  const handleSignOut = async () => {
    if (tracking) {
      navigator.geolocation.clearWatch(watchRef.current);
      await updateBusLocation(busId, { status: "Stopped", speed: 0 });
      setTracking(false);
    }
    await driverSignOut();
  };

  if (user === undefined) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  const isDriver = user && user.email === DRIVER_EMAIL;

  if (!isDriver) {
    return (
      <form onSubmit={handleSignIn} style={{ padding: 20 }}>
        <h2>Driver Access</h2>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Driver code"
        />{" "}
        <button type="submit">Enter</button>
        {authError && <p style={{ color: "red" }}>{authError}</p>}
      </form>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Driver Tracking</h2>
      <select
        value={busId}
        onChange={(e) => setBusId(e.target.value)}
        disabled={tracking}
      >
        {BUS_LIST.map((b) => (
          <option key={b.id} value={b.id}>
            {b.busNumber}
          </option>
        ))}
      </select>

      <div style={{ marginTop: 12 }}>
        {!tracking ? (
          <button onClick={start}>Start Tracking</button>
        ) : (
          <button onClick={stop}>Stop Tracking</button>
        )}{" "}
        <button onClick={handleSignOut}>Sign out</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {tracking && <p>Sending location to Firebase...</p>}
    </div>
  );
}