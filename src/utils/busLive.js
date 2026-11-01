// A bus counts as live when its location was updated in the last 90 seconds
const LIVE_TIMEOUT_MS = 90 * 1000;

export function isBusLive(bus) {
  if (!bus || !bus.lastUpdated || !bus.lastUpdated.toMillis) return false;
  return Date.now() - bus.lastUpdated.toMillis() < LIVE_TIMEOUT_MS;
}