import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import DriverTracking from "./pages/DriverTracking";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        <Route path="/driver" element={<DriverTracking />} />
      </Routes>
    </BrowserRouter>
  );
}