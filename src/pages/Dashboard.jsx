import { useEffect, useRef, useState } from "react";
import {
  ArrowUpDown,
  Heart,
  Bus,
  Clock,
  Route as RouteIcon,
  Activity,
  Map as MapIcon,
} from "lucide-react";
import { subscribeBuses } from "../services/busService";
import { ALL_STOPS, ROUTES, HUB_STOP } from "../data/routes";
import { ROUTE_PATHS } from "../data/routePaths";
import { listTrips } from "../utils/tripPlanner";
import { formatClock, formatCountdown } from "../utils/timeUtils";
import { useNow, DEMO_CLOCK } from "../hooks/useNow";
import { useWeather } from "../hooks/useWeather";
import { isBusLive } from "../utils/busLive";
import { distanceInMeters, formatDistance } from "../utils/distanceCalculator";
import {
  calculateEtaMinutes,
  applyRainDelay,
  formatEta,
} from "../utils/etaCalculator";
import {
  favoriteKey,
  toggleFavorite,
  useFavorites,
} from "../services/favoriteService";
import MapView from "../maps/MapView";
import WeatherCard from "../components/WeatherCard";

function getGreeting(minutes) {
  const hour = Math.floor(minutes / 60);
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function tripNote(trip, now) {
  if (trip.status === "Unavailable") return "Departed";
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

function Stat({ icon: Icon, label, value, valueClass = "" }) {
  return (
    <div className="stat">
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className={"stat-value " + valueClass}>{value}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const now = useNow();
  const { weather } = useWeather();
  const rainy = Boolean(weather && weather.rainy);
  const favorites = useFavorites();
  const [buses, setBuses] = useState([]);
  const [pickupId, setPickupId] = useState(HUB_STOP.id);
  const [destinationId, setDestinationId] = useState(
    destinationOptionsFor(HUB_STOP.id)[0].id
  );
  const [selectedTripId, setSelectedTripId] = useState(null);
  const trackRef = useRef(null);
  const scrollRef = useRef(null);

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

  const trips = listTrips(pickupId, destinationId, now);
  const firstOpenId = (trips.find((t) => t.status !== "Unavailable") || {}).id;

  // Only an Available trip can be tracked
  const selectedTrip =
    trips.find((t) => t.id === selectedTripId && t.status === "Available") ||
    null;

  // Scroll the list to the first trip that has not finished
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const target = container.querySelector("[data-first-open='true']");
    if (target) {
      container.scrollTop = target.offsetTop - 8;
    }
  }, [pickupId, destinationId]);

  // On a phone, jump down to the tracking panel after a trip is tapped
  useEffect(() => {
    if (selectedTripId && window.innerWidth <= 860 && trackRef.current) {
      trackRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedTripId]);

  const changePickup = (id) => {
    setPickupId(id);
    setDestinationId(validDestinationId(id, destinationId));
    setSelectedTripId(null);
  };

  const changeDestination = (id) => {
    setDestinationId(id);
    setSelectedTripId(null);
  };

  const swap = () => {
    setPickupId(destinationId);
    setDestinationId(pickupId);
    setSelectedTripId(null);
  };

  const handleSelect = (trip) => {
    if (trip.status === "Available") {
      setSelectedTripId(trip.id);
    }
  };

  // Tracking details for the selected trip
  let selectedRoute = null;
  let trackedBus = null;
  let live = false;
  let target = null;
  let targetLabel = "";
  let meters = null;
  let minutes = null;

  if (selectedTrip) {
    selectedRoute = ROUTES.find((r) => r.id === selectedTrip.routeId);
    trackedBus = buses.find((b) => b.id === selectedRoute.busId) || null;
    live = isBusLive(trackedBus);
    const beforeDeparture = now < selectedTrip.departure;
    target = beforeDeparture ? pickup : destination;
    targetLabel = beforeDeparture ? "to your pickup stop" : "to your destination";

    if (trackedBus && trackedBus.latitude && trackedBus.longitude) {
      meters = distanceInMeters(
        trackedBus.latitude,
        trackedBus.longitude,
        target.latitude,
        target.longitude
      );
      // Rain makes the traffic slower, so the ETA gets longer
      minutes = applyRainDelay(
        calculateEtaMinutes(meters, trackedBus.speed ?? 0),
        rainy
      );
    }
  }

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
                    onChange={(e) => changeDestination(e.target.value)}
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
              <p className="muted">No shuttle between these two stops</p>
            )}

            {trips.length > 0 && !firstOpenId && (
              <p className="muted">No more shuttles today</p>
            )}

            <div className="trip-scroll" ref={scrollRef}>
              {trips.map((trip) => {
                const favorite = favorites.some(
                  (f) => f.key === favoriteKey(trip.id, pickupId, destinationId)
                );
                const classes =
                  "trip-row" +
                  (trip.status === "Available" ? " clickable" : "") +
                  (trip.status === "Unavailable" ? " past" : "") +
                  (trip.id === selectedTripId ? " selected" : "");

                return (
                  <div
                    key={trip.id}
                    className={classes}
                    data-first-open={trip.id === firstOpenId ? "true" : "false"}
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
          <section className="card" ref={trackRef}>
            <p className="eyebrow">Live tracking</p>
            <h2 className="card-title">
              {selectedTrip ? selectedRoute.name : "Track your shuttle"}
            </h2>

            {!selectedTrip && (
              <div className="track-empty">
                <MapIcon size={36} />
                <p>Tap a shuttle marked Available to see its live location and route</p>
              </div>
            )}

            {selectedTrip && (
              <>
                <div className="live-badge">
                  <span className={"live-dot " + (live ? "on" : "off")} />
                  {live ? "Live" : "Waiting for the driver"}
                </div>
                <div className="muted small">
                  {formatClock(selectedTrip.departure)} {pickup.name} to{" "}
                  {destination.name}
                </div>

                <div className="track-map">
                  <MapView
                    key={selectedTrip.id}
                    buses={trackedBus ? [trackedBus] : []}
                    selectedId={selectedRoute.busId}
                    stops={selectedRoute.stops}
                    pickupStopId={pickupId} destinationStopId={destinationId}
                    route={ROUTE_PATHS[selectedRoute.id] || []}
                    routeColor={selectedRoute.color}
                  />
                </div>

                <div className="stat-row">
                  <Stat icon={Bus} label="Shuttle" value={selectedRoute.busName} />
                  <Stat
                    icon={Clock}
                    label="Est. arrival"
                    value={minutes !== null ? formatEta(minutes) : "-"}
                  />
                  <Stat
                    icon={RouteIcon}
                    label="Distance"
                    value={meters !== null ? formatDistance(meters) : "-"}
                  />
                  <Stat
                    icon={Activity}
                    label="Status"
                    value={live ? trackedBus.status : "Offline"}
                    valueClass={live ? "status-" + trackedBus.status : ""}
                  />
                </div>
                <p className="muted small">
                  Distance and ETA are measured {targetLabel}
                </p>

                {rainy && (
                  <p className="rain-note">
                    Rain may delay your shuttle, the estimated arrival includes
                    extra time
                  </p>
                )}
              </>
            )}
          </section>

          <WeatherCard />
        </div>
      </div>
    </div>
  );
}