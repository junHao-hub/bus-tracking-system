import { useEffect, useState } from "react";
import { subscribeBuses } from "../services/busService";
import { useNow } from "../hooks/useNow";
import { useFavorites } from "../services/favoriteService";
import { useWeather } from "../hooks/useWeather";
import { getTripTimes } from "../utils/tripPlanner";
import { ALL_STOPS } from "../data/routes";
import { distanceInMeters } from "../utils/distanceCalculator";
import { calculateEtaMinutes, applyRainDelay } from "../utils/etaCalculator";
import { formatClock, formatCountdown } from "../utils/timeUtils";
import { isBusLive } from "../utils/busLive";
import { addNotification, claimAlert } from "../services/notificationService";

const DEPART_REMINDER_MINUTES = 10;
const ARRIVE_REMINDER_MINUTES = 5;

export default function NotificationWatcher() {
  const now = useNow(10000);
  const favorites = useFavorites();
  const { weather } = useWeather();
  const [buses, setBuses] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeBuses(setBuses);
    return () => unsubscribe();
  }, []);

  // Check every saved trip and send the reminders that are due
  useEffect(() => {
    const today = new Date().toDateString();
    const clock = formatClock(now);
    const rainy = Boolean(weather && weather.rainy);

    const fire = (type, title, body) => {
      setToast(addNotification({ type, title, body, clock }));
    };

    favorites.forEach((fav) => {
      const details = getTripTimes(fav.tripId, fav.pickupId, fav.destinationId);
      if (!details) return;

      const pickup = ALL_STOPS.find((s) => s.id === fav.pickupId);
      const destination = ALL_STOPS.find((s) => s.id === fav.destinationId);
      if (!pickup || !destination) return;

      const base = `${today}|${fav.key}`;

      // 10 minutes before the shuttle leaves the pickup stop
      const untilDeparture = details.departure - now;
      if (untilDeparture > 0 && untilDeparture <= DEPART_REMINDER_MINUTES) {
        if (claimAlert(`${base}|depart`)) {
          fire(
            "depart",
            "Your shuttle is leaving soon",
            `${details.route.busName} leaves ${pickup.name} at ${formatClock(
              details.departure
            )}, in ${formatCountdown(untilDeparture)}`
          );
        }
      }

      // 5 minutes before the shuttle arrives at the destination
      if (now >= details.departure && now < details.arrival) {
        let minutesLeft = details.arrival - now;

        // The live position gives a better estimate than the timetable
        const bus = buses.find((b) => b.id === details.route.busId);
        if (isBusLive(bus) && bus.latitude && bus.longitude) {
          const meters = distanceInMeters(
            bus.latitude,
            bus.longitude,
            destination.latitude,
            destination.longitude
          );
          minutesLeft = applyRainDelay(
            calculateEtaMinutes(meters, bus.speed ?? 0),
            rainy
          );
        }

        if (minutesLeft <= ARRIVE_REMINDER_MINUTES) {
          if (claimAlert(`${base}|arrive`)) {
            fire(
              "arrive",
              "Your shuttle is almost there",
              `${details.route.busName} arrives at ${destination.name} in about ${formatCountdown(
                minutesLeft
              )}`
            );
          }
        }
      }
    });
  }, [now, favorites, buses, weather]);

  // Hide the banner after 8 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="toast" role="status">
      <div className="toast-title">{toast.title}</div>
      <div className="toast-body">{toast.body}</div>
    </div>
  );
}