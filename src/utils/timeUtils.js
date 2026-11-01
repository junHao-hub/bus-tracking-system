// Times are stored as minutes since midnight

export function toMinutes(hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatClock(totalMinutes) {
  const wrapped = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Friendly countdown such as "12 min" or "1 h 5 min"
export function formatCountdown(minutes) {
  const total = Math.max(1, Math.ceil(minutes));
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}