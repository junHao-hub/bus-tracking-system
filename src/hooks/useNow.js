import { useEffect, useState } from "react";
import { toMinutes } from "../utils/timeUtils";

const STARTED_AT = Date.now();

// Reads ?time=08:20 from the address once when the app loads
function readOverride() {
  const value = new URLSearchParams(window.location.search).get("time");
  if (value && /^\d{1,2}:\d{2}$/.test(value)) {
    return toMinutes(value);
  }
  return null;
}

const OVERRIDE = readOverride();

export const DEMO_CLOCK = OVERRIDE !== null;

// Current time in minutes since midnight, the demo clock keeps moving forward
export function getNowMinutes() {
  if (OVERRIDE !== null) {
    return OVERRIDE + (Date.now() - STARTED_AT) / 60000;
  }
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

export function useNow(intervalMs = 15000) {
  const [now, setNow] = useState(getNowMinutes());

  useEffect(() => {
    const timer = setInterval(() => setNow(getNowMinutes()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}