import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpDown, Heart } from "lucide-react";
import { subscribeBuses } from "../services/busService";
import { ALL_STOPS, ROUTES, HUB_STOP } from "../data/routes";
import { listTrips } from "../utils/tripPlanner";
import { formatClock, formatCountdown } from "../utils/timeUtils";
import { useNow, DEMO_CLOCK } from "../hooks/useNow";
import { isBusLive } from "../utils/busLive";
import {
  favoriteKey,
  toggleFavorite,
  useFavorites,
} from "../services/favoriteService";
import WeatherCard from "../components/WeatherCard";

function getGreeting(minutes) {
  const hour = Math.floor(minutes / 60);
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function tripNote(trip, now) {
  if (now < trip.departure) {
    return `Departs in ${formatCountdown(trip.departure - now)}`;
  }
  return "On the way";
}

// APU is always one of the two stops, so the destination depends on the pickup
function destinationOptionsFor(pickupId) {
  if (pickupId === HUB_STOP.id) {
    return ALL_STOPS.filter((s) => s.id !== HUB_STOP.id);
  }
  return [HUB_STOP];
}

function validDestinationId(pickupId, destinationId) {
  const options = destinationOptionsFor(pickupId);
  return options.some((s) => s.id === destinationId)
    ? destinationId
    : options[0].id;
}

export default function Dashboard() {
  const now = useNow();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const favorites = useFavorites();
  const [buses, setBuses] = useState([]);

  // The selected stops are kept in the address, so going back from the tracking page restores them
  const [pickupId, setPickupId] = useState(() => {
    const fromParam = params.get("from");
    return ALL_STOPS.some((s) => s.id === fromParam) ? fromParam : HUB_STOP.id;
  });
  const [destinationId, setDestinationId] = useState(() => {
    const fromParam = params.get("from");
    const startId = ALL_STOPS.some((s) => s.id === fromParam)
      ? fromParam
      : HUB_STOP.id;
    return validDestinationId(startId, params.get("to"));
  });

  useEffect(() => {
    const unsubscribe = subscribeBuses(setBuses);
    return () => unsubscribe();
  }, []);

  const dateText = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const pickup = ALL_STOPS.find((s) => s.id === pickupId);
  const destination = ALL_STOPS.find((s) => s.id === destinationId);
  const destinationOptions = destinationOptionsFor(pickupId);

  // The system finds the route that serves both stops
  const matchedRoute =
    ROUTES.find(
      (r) =>
        r.stops.some((s) => s.id === pickupId) &&
        r.stops.some((s) => s.id === destinationId)
    ) || null;
  const matchedBus = matchedRoute
    ? buses.find((b) => b.id === matchedRoute.busId) || null
    : null;
  const matchedLive = isBusLive(matchedBus);

  // Trips that already finished are not shown
  const trips = listTrips(pickupId, destinationId, now).filter(
    (trip) => trip.status !== "Unavailable"
  );

  const changePickup = (id) => {
    setPickupId(id);
    setDestinationId(validDestinationId(id, destinationId));
  };

  const swap = () => {
    setPickupId(destinationId);
    setDestinationId(pickupId);
  };

  // Only an Available trip opens the tracking page
  const handleSelect = (trip) => {
    if (trip.status === "Available") {
      navigate(`/track/${trip.id}?from=${pickupId}&to=${destinationId}`);
    }
  };

  return (
    <div>
      {DEMO_CLOCK && (
        <div className="demo-banner">
          Demo clock is on, the time is simulated as {formatClock(now)}
        </div>
      )}

      <p className="eyebrow">{dateText}</p>
      <h1 className="page-title">{getGreeting(now)}</h1>
      <p className="page-sub">Where are you heading today?</p>

      <div className="dash-grid">
        <div className="dash-left">
          <section className="card">
            <div className="planner">
              <div className="planner-fields">
                <div className="planner-row">
                  <span className="dot dot-pickup" />
                  <select
                    value={pickupId}
                    onChange={(e) => changePickup(e.target.value)}
                    aria-label="Pickup stop"
                  >
                    {ALL_STOPS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="planner-row">
                  <span className="dot dot-destination" />
                  <select
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    aria-label="Destination stop"
                  >
                    {destinationOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="swap"
                onClick={swap}
                aria-label="Swap pickup and destination"
              >
                <ArrowUpDown size={20} />
              </button>
            </div>

            {matchedRoute && (
              <p className="route-info" style={{ marginTop: 14, marginBottom: 0 }}>
                <span className={"live-dot " + (matchedLive ? "on" : "off")} />
                {matchedRoute.busName} is {matchedLive ? "live" : "offline"}
              </p>
            )}
          </section>

          <section className="card">
            <p className="eyebrow">Timetable</p>
            <h2 className="card-title">Shuttle timetable</h2>

            {trips.length === 0 && (
              <p className="muted">No more shuttles today</p>
            )}

            {trips.length > 0 && (
              <p className="muted small" style={{ marginTop: 0 }}>
                Tap a shuttle marked Available to see it on the map
              </p>
            )}

            <div className="trip-scroll">
              {trips.map((trip) => {
                const favorite = favorites.some(
                  (f) => f.key === favoriteKey(trip.id, pickupId, destinationId)
                );
                const classes =
                  "trip-row" + (trip.status === "Available" ? " clickable" : "");

                return (
                  <div
                    key={trip.id}
                    className={classes}
                    onClick={() => handleSelect(trip)}
                  >
                    <div>
                      <div className="trip-time">{formatClock(trip.departure)}</div>
                      <div className="muted small">
                        Arrives {formatClock(trip.arrival)}
                      </div>
                    </div>

                    <div>
                      <div className="trip-route">
                        {pickup.name} to {destination.name}
                      </div>
                      <div className="muted small">
                        <span
                          className="route-dot"
                          style={{ background: trip.routeColor }}
                        />
                        {trip.busName}
                      </div>
                    </div>

                    <div className="trip-right">
                      <div className="trip-status">
                        <span className={"chip chip-" + trip.status.toLowerCase()}>
                          {trip.status}
                        </span>
                        <div className="trip-note">{tripNote(trip, now)}</div>
                      </div>
                      <button
                        className={"heart-btn" + (favorite ? " active" : "")}
                        aria-label={favorite ? "Remove favourite" : "Add favourite"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite({
                            tripId: trip.id,
                            pickupId,
                            destinationId,
                          });
                        }}
                      >
                        <Heart size={20} fill={favorite ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="dash-right">
          <WeatherCard />
        </div>
      </div>
    </div>
  );
}
