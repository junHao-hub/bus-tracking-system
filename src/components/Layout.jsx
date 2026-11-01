import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import NotificationWatcher from "./NotificationWatcher";

export default function Layout() {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="main">
        <Outlet />
      </main>
      <NotificationWatcher />
    </div>
  );
}