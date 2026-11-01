import { useEffect, useState } from "react";
import { Clock, MapPin, Heart, Trash2 } from "lucide-react";
import { ALL_STOPS } from "../data/routes";
import { getTripTimes } from "../utils/tripPlanner";
import { formatClock } from "../utils/timeUtils";
import { useFavorites, toggleFavorite } from "../services/favoriteService";
import {
  useNotifications,
  markAllRead,
  clearNotifications,
  notificationPermission,
  requestNotificationPermission,
} from "../services/notificationService";

function stopName(id) {
  const stop = ALL_STOPS.find((s) => s.id === id);
  return stop ? stop.name : id;
}

export default function Notifications() {
  const notifications = useNotifications();
  const favorites = useFavorites();
  const [permission, setPermission] = useState(notificationPermission());

  // Opening this page marks everything as read
  useEffect(() => {
    markAllRead();
  }, [notifications.length]);

  const enableAlerts = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  return (
    <div className="page-narrow">
      <p className="eyebrow">Updates</p>
      <h1 className="page-title">Notifications</h1>
      <p className="page-sub">
        Tap the heart on a trip to get a reminder 10 minutes before it leaves
        and 5 minutes before it arrives. Reminders only work while this page is open.
      </p>

      <div className="stack">
        <section className="card">
          <p className="eyebrow">This device</p>
          <h2 className="card-title">Pop-up alerts</h2>

          {permission === "granted" && (
            <p className="muted">Pop-up alerts are on for this browser.</p>
          )}
          {permission === "denied" && (
            <p className="muted">
              Pop-up alerts are blocked, allow them in the browser settings for this
              website. Reminders still appear inside the page.
            </p>
          )}
          {permission === "unsupported" && (
            <p className="muted">
              This browser cannot show pop-up alerts. Reminders still appear inside
              the page.
            </p>
          )}
          {permission === "default" && (
            <button className="btn" onClick={enableAlerts}>
              Turn on pop-up alerts
            </button>
          )}
        </section>

        <section className="card">
          <p className="eyebrow">Reminders</p>
          <h2 className="card-title">Your favourite trips</h2>

          {favorites.length === 0 && (
            <p className="muted">No favourite trips yet. Tap the heart on the Home page.</p>
          )}

          {favorites.map((fav) => {
            const details = getTripTimes(fav.tripId, fav.pickupId, fav.destinationId);
            if (!details) return null;
            return (
              <div key={fav.key} className="fav-row">
                <div className="fav-main">
                  <div className="trip-route">
                    {formatClock(details.departure)} {stopName(fav.pickupId)} to{" "}
                    {stopName(fav.destinationId)}
                  </div>
                  <div className="muted small">
                    {details.route.busName}, arrives {formatClock(details.arrival)}
                  </div>
                </div>
                <button
                  className="heart-btn active"
                  aria-label="Remove favourite"
                  onClick={() => toggleFavorite(fav)}
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>
            );
          })}
        </section>

        <section className="card">
          <div className="row-between">
            <div>
              <p className="eyebrow">History</p>
              <h2 className="card-title">Notification centre</h2>
            </div>
            {notifications.length > 0 && (
              <button className="btn ghost" onClick={clearNotifications}>
                <Trash2 size={16} /> Clear
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p className="muted">Nothing here yet</p>
          )}

          {notifications.map((n) => (
            <div key={n.id} className="alert-row">
              <div className={"alert-icon " + n.type}>
                {n.type === "arrive" ? <MapPin size={20} /> : <Clock size={20} />}
              </div>
              <div>
                <div className="alert-title">{n.title}</div>
                <div className="muted small">{n.body}</div>
              </div>
              <div className="alert-time">{n.clock}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}