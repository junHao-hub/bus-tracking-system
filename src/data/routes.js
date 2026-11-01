import { STOPS } from "./stops.js";

// The two stops of route 1 are read from stops.js by their names
const APU_STOP =
  STOPS.find((s) => s.name === "APU Main Campus") || STOPS[0];
const LRT_STOP =
  STOPS.find((s) => s.name === "LRT Bukit Jalil") || STOPS[1];

// The Parkhill stop for route 2
const PARKHILL_STOP = {
  id: "PARKHILL",
  name: "Parkhill",
  latitude: 3.05502,
  longitude: 101.69559,
};

// APU is one of the two stops of every route
export const HUB_STOP = APU_STOP;

// One bus runs each route in both directions, the bus id must match the driver page and Firestore.
// firstTrip, lastTrip and intervalMinutes control the generated timetable.
export const ROUTES = [
  {
    id: "ROUTE1",
    name: "APU - LRT",
    busId: "BUS001",
    busName: "APU-BUS-01",
    color: "#007a3d",
    stops: [APU_STOP, LRT_STOP],
    firstTrip: "07:30",
    lastTrip: "22:30",
    intervalMinutes: 30,
  },
  {
    id: "ROUTE2",
    name: "APU - Parkhill",
    busId: "BUS002",
    busName: "APU-BUS-02",
    color: "#1e40af",
    stops: [APU_STOP, PARKHILL_STOP],
    firstTrip: "07:45",
    lastTrip: "22:45",
    intervalMinutes: 40,
  },
];

// Every stop once, in the order APU first and then the other places
function collectStops() {
  const seen = new Map();
  ROUTES.forEach((route) => {
    route.stops.forEach((stop) => {
      if (!seen.has(stop.id)) {
        seen.set(stop.id, stop);
      }
    });
  });
  return [...seen.values()];
}

export const ALL_STOPS = collectStops();