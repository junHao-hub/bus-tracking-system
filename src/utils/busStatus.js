export const ARRIVAL_RADIUS_METERS = 50;

// Decide the bus status from its speed and its distance to the nearest stop
export function getBusStatus(speedKmh, nearestStopMeters) {
  const isNearStop =
    nearestStopMeters !== null &&
    nearestStopMeters !== undefined &&
    nearestStopMeters <= ARRIVAL_RADIUS_METERS;

  if (isNearStop && speedKmh < 5) return "Arrived";
  if (speedKmh > 3) return "Moving";
  return "Stopped";
}