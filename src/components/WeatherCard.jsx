import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Sunrise,
  Sunset,
  Wind,
  Droplets,
  Gauge,
  Umbrella,
  Thermometer,
} from "lucide-react";
import placeholderWeather from "../data/placeholderWeather";

const weatherIcons = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
};

function WeatherCard() {
  const weather = placeholderWeather;

  return (
    <div className="card weather-card">
      <div className="weather-header">
        <div className="weather-main">
          <div className="weather-temp-group">
            <span className="weather-temp">{weather.temperature}°</span>
            <span className="weather-condition">{weather.condition}</span>
          </div>
          <div className="weather-hilo">
            <span>H: {weather.high}°</span>
            <span>L: {weather.low}°</span>
          </div>
        </div>
        <div className="weather-location">{weather.location}</div>
      </div>

      <div className="weather-hourly">
        {weather.hourly.map((hour) => {
          const Icon = weatherIcons[hour.icon] || Cloud;
          return (
            <div key={hour.time} className="hourly-item">
              <span className="hourly-time">{hour.time}</span>
              <Icon size={20} />
              <span className="hourly-temp">{hour.temp}°</span>
            </div>
          );
        })}
      </div>

      <div className="weather-details">
        <div className="weather-detail-item">
          <Sunrise size={18} />
          <div>
            <span className="detail-label">Sunrise</span>
            <span className="detail-value">{weather.sunrise}</span>
          </div>
        </div>
        <div className="weather-detail-item">
          <Sunset size={18} />
          <div>
            <span className="detail-label">Sunset</span>
            <span className="detail-value">{weather.sunset}</span>
          </div>
        </div>
        <div className="weather-detail-item">
          <Wind size={18} />
          <div>
            <span className="detail-label">Wind</span>
            <span className="detail-value">
              {weather.windSpeed} mph {weather.windDirection}
            </span>
          </div>
        </div>
        <div className="weather-detail-item">
          <Gauge size={18} />
          <div>
            <span className="detail-label">Air Quality</span>
            <span className="detail-value">
              {weather.airQuality.index} — {weather.airQuality.label}
            </span>
          </div>
        </div>
        <div className="weather-detail-item">
          <Droplets size={18} />
          <div>
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{weather.humidity}%</span>
          </div>
        </div>
        <div className="weather-detail-item">
          <Umbrella size={18} />
          <div>
            <span className="detail-label">Rain</span>
            <span className="detail-value">
              {weather.rain.willRain
                ? `${weather.rain.chance}% — ${weather.rain.when}`
                : "Not expected"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
