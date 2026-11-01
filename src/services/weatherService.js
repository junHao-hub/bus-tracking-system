// Bukit Jalil, Kuala Lumpur
const LATITUDE = 3.0568;
const LONGITUDE = 101.7012;

// Turns the numeric weather code into a label and an icon name
export function describeWeather(code) {
  if (code === 0) return { label: "Clear sky", rainy: false, icon: "sun" };
  if (code <= 3) return { label: "Partly cloudy", rainy: false, icon: "cloud" };
  if (code <= 48) return { label: "Foggy", rainy: false, icon: "cloud" };
  if (code <= 67) return { label: "Rain", rainy: true, icon: "rain" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", rainy: true, icon: "rain" };
  if (code >= 95) return { label: "Thunderstorm", rainy: true, icon: "storm" };
  return { label: "Cloudy", rainy: false, icon: "cloud" };
}

export async function fetchWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
    "&current=temperature_2m,weather_code&timezone=auto";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Weather request failed");
  }
  const data = await response.json();
  const info = describeWeather(data.current.weather_code);
  return { temperature: Math.round(data.current.temperature_2m), ...info };
}