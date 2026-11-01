import { ROUTES } from "./routes";
import { distanceInMeters } from "../utils/distanceCalculator";
import { toMinutes } from "../utils/timeUtils";

// Planning values used to estimate the time between two stops
const AVERAGE_SPEED_KMH = 20;
const ROAD_DETOUR_FACTOR = 1.4;
const MIN_LEG_MINUTES = 5;

// The bus waits this long at the first stop before the next trip starts
const LAYOVER_MINUTES = 5;

function legMinutes(from, to) {
  const meters = distanceInMeters(
    from.latitude,
    from.longitude,
    to.latitude,
    to.longitude
  );
  const minutes = ((meters * ROAD_DETOUR_FACTOR) / 1000 / AVERAGE_SPEED_KMH) * 60;
  return Math.max(MIN_LEG_MINUTES, Math.round(minutes));
}

// Minutes after a trip starts when the bus reaches each stop, the route is a loop
function buildRouteTimes(stops) {
  const offsets = [0];
  for (let i = 1; i < stops.length; i++) {
    offsets.push(offsets[i - 1] + legMinutes(stops[i - 1], stops[i]));
  }
  const last = stops[stops.length - 1];
  const loopMinutes = offsets[stops.length - 1] + legMinutes(last, stops[0]);
  return { offsets, loopMinutes };
}

function buildTimetable(route) {
  const { offsets, loopMinutes } = buildRouteTimes(route.stops);

  // One bus runs the route, so the gap must be longer than one full loop
  const interval = Math.max(route.intervalMinutes, loopMinutes + LAYOVER_MINUTES);

  const trips = [];
  let index = 0;
  for (
    let start = toMinutes(route.firstTrip);
    start <= toMinutes(route.lastTrip);
    start += interval
  ) {
    trips.push({
      id: `${route.id}-${String(index + 1).padStart(2, "0")}`,
      routeId: route.id,
      routeName: route.name,
      routeColor: route.color,
      busId: route.busId,
      busName: route.busName,
      startMinutes: start,
    });
    index += 1;
  }

  return { route, offsets, loopMinutes, trips };
}

export const TIMETABLE = ROUTES.map(buildTimetable);