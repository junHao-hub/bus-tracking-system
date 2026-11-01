import { Sun, Cloud, CloudRain, CloudLightning, Umbrella } from "lucide-react";
import { useWeather } from "../hooks/useWeather";

const ICONS = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
};

export default function WeatherCard() {
  const { weather, failed } = useWeather();
  const Icon = weather ? ICONS[weather.icon] : Cloud;

  return (
    <div className="card">
      <p className="eyebrow">Travel conditions</p>
      <h2 className="card-title">Weather</h2>

      {!weather && !failed && <p className="muted">Loading...</p>}
      {!weather && failed && (
        <p className="muted">Weather is not available right now</p>
      )}

      {weather && (
        <>
          <div className={"weather-box" + (weather.rainy ? " rainy" : "")}>
            <div className="weather-icon">
              <Icon size={30} />
            </div>
            <div>
              <div className="weather-label">{weather.label}</div>
              <div className="muted small">Bukit Jalil</div>
            </div>
            <div className="weather-temp">{weather.temperature}°</div>
          </div>

          <div className="tip">
            <Umbrella size={22} />
            <div>
              <b>{weather.rainy ? "Rain may delay your shuttle" : "No rain right now"}</b>
              <div className="muted small">
                {weather.rainy
                  ? "Estimated arrival times include about 25 percent extra time"
                  : "Good conditions for travel"}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}