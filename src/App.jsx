import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import DriverTracking from "./pages/DriverTracking";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/driver" element={<DriverTracking />} />
      </Routes>
    </BrowserRouter>
  );
}