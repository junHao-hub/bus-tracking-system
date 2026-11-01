import { useEffect, useState } from "react";
import { fetchWeather } from "../services/weatherService";

// Add rain=1 to the address to pretend it is raining, used for testing and demos
const FORCE_RAIN =
  new URLSearchParams(window.location.search).get("rain") === "1";

let latest = null;
let failed = false;
let started = false;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

async function load() {
  if (FORCE_RAIN) {
    latest = { temperature: 26, label: "Rain", rainy: true, icon: "rain" };
    failed = false;
    notify();
    return;
  }
  try {
    latest = await fetchWeather();
    failed = false;
  } catch (error) {
    failed = true;
  }
  notify();
}

// The weather is loaded once and refreshed every 10 minutes for all components
function start() {
  if (started) return;
  started = true;
  load();
  setInterval(load, 10 * 60 * 1000);
}

export function useWeather() {
  const [, setTick] = useState(0);

  useEffect(() => {
    start();
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  return { weather: latest, failed };
}