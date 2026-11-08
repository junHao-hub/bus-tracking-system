import { NavLink } from "react-router-dom";
import { Bus, House, Bell } from "lucide-react";
import { useNotifications } from "../services/notificationService";

const LINKS = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export default function TopBar() {
  const notifications = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon">
          <Bus size={22} />
        </div>
        <div className="brand-name">APU Shuttle</div>
      </div>

      <nav className="top-nav">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            <Icon size={20} />
            <span>{label}</span>
            {to === "/notifications" && unread > 0 && (
              <span className="nav-badge">{unread}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}