import { TIMETABLE } from "../data/timetable";

// A trip becomes Available this many minutes before it leaves the pickup stop
export const BOARDING_WINDOW_MINUTES = 10;

export function getTripStatus(departure, arrival, nowMinutes) {
  if (nowMinutes > arrival) return "Unavailable";
  if (nowMinutes >= departure - BOARDING_WINDOW_MINUTES) return "Available";
  return "Upcoming";
}

// If the destination comes earlier in the loop, the bus has to go around first
function getArrivalOffset(entry, pickupIndex, destinationIndex) {
  return destinationIndex > pickupIndex
    ? entry.offsets[destinationIndex]
    : entry.loopMinutes + entry.offsets[destinationIndex];
}

// All trips of the route that serves both stops, with times and status
export function listTrips(pickupId, destinationId, nowMinutes) {
  if (!pickupId || !destinationId || pickupId === destinationId) {
    return [];
  }

  const result = [];

  TIMETABLE.forEach((entry) => {
    const stopIds = entry.route.stops.map((s) => s.id);
    const pickupIndex = stopIds.indexOf(pickupId);
    const destinationIndex = stopIds.indexOf(destinationId);
    if (pickupIndex < 0 || destinationIndex < 0) return;

    const arrivalOffset = getArrivalOffset(entry, pickupIndex, destinationIndex);

    entry.trips.forEach((trip) => {
      const departure = trip.startMinutes + entry.offsets[pickupIndex];
      const arrival = trip.startMinutes + arrivalOffset;
      result.push({
        ...trip,
        departure,
        arrival,
        status: getTripStatus(departure, arrival, nowMinutes),
      });
    });
  });

  return result.sort((a, b) => a.departure - b.departure);
}

// Times of one saved trip, used by the notification reminders
export function getTripTimes(tripId, pickupId, destinationId) {
  for (const entry of TIMETABLE) {
    const trip = entry.trips.find((t) => t.id === tripId);
    if (!trip) continue;

    const stopIds = entry.route.stops.map((s) => s.id);
    const pickupIndex = stopIds.indexOf(pickupId);
    const destinationIndex = stopIds.indexOf(destinationId);
    if (pickupIndex < 0 || destinationIndex < 0 || pickupIndex === destinationIndex) {
      return null;
    }

    return {
      trip,
      route: entry.route,
      departure: trip.startMinutes + entry.offsets[pickupIndex],
      arrival: trip.startMinutes + getArrivalOffset(entry, pickupIndex, destinationIndex),
    };
  }
  return null;
}