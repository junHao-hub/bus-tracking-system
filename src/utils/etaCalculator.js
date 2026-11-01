// Used when the bus is almost stopped, so the ETA is still meaningful
const DEFAULT_SPEED_KMH = 20;
const MIN_USEFUL_SPEED_KMH = 5;

// Rain slows the traffic down, so the ETA is made 25 percent longer
export const RAIN_DELAY_FACTOR = 1.25;

export function calculateEtaMinutes(distanceMeters, speedKmh) {
  const speed = speedKmh >= MIN_USEFUL_SPEED_KMH ? speedKmh : DEFAULT_SPEED_KMH;
  const hours = distanceMeters / 1000 / speed;
  return hours * 60;
}

export function applyRainDelay(minutes, rainy) {
  return rainy ? minutes * RAIN_DELAY_FACTOR : minutes;
}

export function formatEta(minutes) {
  if (minutes === null || minutes === undefined) return "Calculating...";
  if (minutes < 1) return "Less than 1 min";
  return `${Math.round(minutes)} min`;
}