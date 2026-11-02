import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Bus,
  Clock,
  Route as RouteIcon,
  Activity,
} from "lucide-react";
import { subscribeBuses } from "../services/busService";
import { ALL_STOPS, ROUTES } from "../data/routes";
import { ROUTE_PATHS } from "../data/routePaths";
import { listTrips } from "../utils/tripPlanner";
import { formatClock } from "../utils/timeUtils";
import { useNow } from "../hooks/useNow";
import { useWeather } from "../hooks/useWeather";
import { isBusLive } from "../utils/busLive";
import { distanceInMeters, formatDistance } from "../utils/distanceCalculator";
import {
  calculateEtaMinutes,
  applyRainDelay,
  formatEta,
} from "../utils/etaCalculator";
import MapView from "../maps/MapView";

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

export default function TrackingPage() {
  const { tripId } = useParams();
  const [params] = useSearchParams();
  const now = useNow();
  const { weather } = useWeather();
  const rainy = Boolean(weather && weather.rainy);
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeBuses(setBuses);
    return () => unsubscribe();
  }, []);

  const pickupId = params.get("from");
  const destinationId = params.get("to");
  const pickup = ALL_STOPS.find((s) => s.id === pickupId);
  const destination = ALL_STOPS.find((s) => s.id === destinationId);

  const backLink =
    pickup && destination ? `/?from=${pickupId}&to=${destinationId}` : "/";

  const trip =
    pickup && destination
      ? listTrips(pickupId, destinationId, now).find((t) => t.id === tripId)
      : null;

  const backButton = (
    <Link to={backLink} className="back-link">
      <ArrowLeft size={18} />
      Back to timetable
    </Link>
  );

  // Only an Available trip can be tracked
  if (!trip || trip.status !== "Available") {
    return (
      <div className="track-page">
        {backButton}
        <section className="card">
          <h2 className="card-title">This shuttle cannot be tracked right now</h2>
          <p className="muted">
            Tracking opens 10 minutes before the shuttle leaves and closes
            after it arrives.
          </p>
        </section>
      </div>
    );
  }

  const route = ROUTES.find((r) => r.id === trip.routeId);
  const bus = buses.find((b) => b.id === route.busId) || null;
  const live = isBusLive(bus);

  // Before departure the bus is heading to the pickup stop, afterwards to the destination
  const beforeDeparture = now < trip.departure;
  const target = beforeDeparture ? pickup : destination;
  const targetLabel = beforeDeparture ? "to your pickup stop" : "to your destination";

  let meters = null;
  let minutes = null;
  if (bus && bus.latitude && bus.longitude) {
    meters = distanceInMeters(
      bus.latitude,
      bus.longitude,
      target.latitude,
      target.longitude
    );
    // Rain makes the traffic slower, so the ETA gets longer
    minutes = applyRainDelay(calculateEtaMinutes(meters, bus.speed ?? 0), rainy);
  }

  return (
    <div className="track-page">
      {backButton}

      <section className="card">
        <p className="eyebrow">Live tracking</p>
        <h2 className="card-title">{route.name}</h2>

        <div className="live-badge">
          <span className={"live-dot " + (live ? "on" : "off")} />
          {live ? "Live" : "Waiting for the driver"}
        </div>
        <div className="muted small">
          {formatClock(trip.departure)} {pickup.name} to {destination.name}
        </div>

        <div className="track-map">
          <MapView
            key={trip.id}
            buses={bus ? [bus] : []}
            selectedId={route.busId}
            stops={route.stops}
            pickupStopId={pickupId}
            destinationStopId={destinationId}
            route={ROUTE_PATHS[route.id] || []}
            routeColor={route.color}
          />
        </div>

        <div className="stat-row">
          <Stat icon={Bus} label="Shuttle" value={route.busName} />
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
            value={live ? bus.status : "Offline"}
            valueClass={live ? "status-" + bus.status : ""}
          />
        </div>
        <p className="muted small">Distance and ETA are measured {targetLabel}</p>

        {rainy && (
          <p className="rain-note">
            Rain may delay your shuttle, the estimated arrival includes extra time
          </p>
        )}
      </section>
    </div>
  );
}
