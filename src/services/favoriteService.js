import { useEffect, useState } from "react";

const STORAGE_KEY = "apu_shuttle_favorites";

export function favoriteKey(tripId, pickupId, destinationId) {
  return `${tripId}|${pickupId}|${destinationId}`;
}

export function readFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function writeFavorites(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    // Storage can be blocked by the browser, then nothing is saved
  }
  window.dispatchEvent(new Event("favorites-changed"));
}

export function toggleFavorite({ tripId, pickupId, destinationId }) {
  const key = favoriteKey(tripId, pickupId, destinationId);
  const current = readFavorites();
  const exists = current.some((f) => f.key === key);
  const next = exists
    ? current.filter((f) => f.key !== key)
    : [...current, { key, tripId, pickupId, destinationId }];
  writeFavorites(next);
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    const update = () => setFavorites(readFavorites());
    window.addEventListener("favorites-changed", update);
    return () => window.removeEventListener("favorites-changed", update);
  }, []);

  return favorites;
}