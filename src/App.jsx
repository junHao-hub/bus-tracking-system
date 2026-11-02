import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TrackingPage from "./pages/TrackingPage";
import Notifications from "./pages/Notifications";
import DriverTracking from "./pages/DriverTracking";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/track/:tripId" element={<TrackingPage />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        <Route path="/driver" element={<DriverTracking />} />
      </Routes>
    </BrowserRouter>
  );
}
