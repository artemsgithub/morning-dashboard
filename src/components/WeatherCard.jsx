import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Sunrise,
  Sunset,
  Wind,
  Droplets,
  Gauge,
  Umbrella,
  Moon,
} from "lucide-react";
import placeholderWeather from "../data/placeholderWeather";

const weatherIcons = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-snow": CloudSnow,
  "cloud-lightning": CloudLightning,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  moon: Moon,
};

/* AQI: 0-50 Good, 51-100 Moderate, 101-150 Unhealthy for sensitive,
   151-200 Unhealthy, 201-300 Very Unhealthy, 301-500 Hazardous */
const aqiSegments = [
  { max: 50, label: "Good", color: "#7A9E7E" },
  { max: 100, label: "Moderate", color: "#D4A843" },
  { max: 150, label: "Sensitive", color: "#D97757" },
  { max: 200, label: "Unhealthy", color: "#C4613E" },
  { max: 300, label: "Very Unhealthy", color: "#8B4049" },
  { max: 500, label: "Hazardous", color: "#5C2033" },
];

function ScaleBar({ value, max, segments, label, icon: Icon }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="scale-bar-container">
      <div className="scale-bar-header">
        <Icon size={16} />
        <span className="detail-label">{label}</span>
      </div>
      <div className="scale-bar-track">
        <div className="scale-bar-gradient">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="scale-bar-segment"
              style={{
                flex: i === 0 ? seg.max : seg.max - segments[i - 1].max,
                backgroundColor: seg.color,
              }}
            />
          ))}
        </div>
        <div
          className="scale-bar-pointer"
          style={{ left: `${pct}%` }}
        >
          <div className="scale-bar-needle" />
        </div>
      </div>
      <div className="scale-bar-value">{value} — {segments.find(s => value <= s.max)?.label}</div>
    </div>
  );
}

function PercentBar({ value, label, icon: Icon, color }) {
  return (
    <div className="scale-bar-container">
      <div className="scale-bar-header">
        <Icon size={16} />
        <span className="detail-label">{label}</span>
        <span className="percent-value">{value}%</span>
      </div>
      <div className="percent-bar-track">
        <div
          className="percent-bar-fill"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SunArc({ sunrise, sunset }) {
  return (
    <div className="sun-arc-container">
      <div className="sun-arc-header">
        <span className="detail-label">Daylight</span>
      </div>
      <div className="sun-arc-visual">
        <svg viewBox="0 0 200 70" className="sun-arc-svg">
          {/* arc path */}
          <path
            d="M 10 60 Q 100 -10 190 60"
            fill="none"
            stroke="var(--card-border)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          {/* filled portion — placeholder at ~60% of day */}
          <path
            d="M 10 60 Q 100 -10 190 60"
            fill="none"
            stroke="var(--clay)"
            strokeWidth="2.5"
            strokeDasharray="170"
            strokeDashoffset="68"
          />
          {/* sun dot */}
          <circle cx="130" cy="18" r="8" fill="var(--clay)" />
          <circle cx="130" cy="18" r="12" fill="var(--clay)" opacity="0.15" />
        </svg>
        <div className="sun-arc-labels">
          <div className="sun-arc-time">
            <Sunrise size={14} />
            <span>{sunrise}</span>
          </div>
          <div className="sun-arc-time">
            <Sunset size={14} />
            <span>{sunset}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherCard() {
  const weather = placeholderWeather;
  const ConditionIcon = weatherIcons[weather.conditionIcon] || Cloud;

  return (
    <div className="card weather-card">
      <div className="weather-header">
        <div className="weather-main">
          <div className="weather-temp-row">
            <ConditionIcon size={64} className="weather-condition-icon" />
            <div className="weather-temp-group">
              <span className="weather-temp">{weather.temperature}°</span>
              <div className="weather-temp-meta">
                <span className="weather-condition">{weather.condition}</span>
                <div className="weather-hilo">
                  <span>H: {weather.high}°</span>
                  <span>L: {weather.low}°</span>
                </div>
              </div>
            </div>
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
              <Icon size={26} />
              <span className="hourly-temp">{hour.temp}°</span>
            </div>
          );
        })}
      </div>

      <div className="weather-gauges">
        <div className="weather-gauges-row">
          <ScaleBar
            value={weather.airQuality.index}
            max={500}
            segments={aqiSegments}
            label="Air Quality"
            icon={Gauge}
          />

          <PercentBar
            value={weather.humidity}
            label="Humidity"
            icon={Droplets}
            color="var(--sage)"
          />
        </div>

        <PercentBar
          value={weather.rain.chance}
          label={weather.rain.willRain ? `Rain — ${weather.rain.when}` : "Rain"}
          icon={Umbrella}
          color="var(--clay)"
        />

        <div className="weather-gauges-row">
          <div className="scale-bar-container">
            <div className="scale-bar-header">
              <Wind size={16} />
              <span className="detail-label">Wind</span>
            </div>
            <div className="wind-display">
              <span className="wind-speed">{weather.windSpeed}</span>
              <div className="wind-meta">
                <span className="wind-unit">mph</span>
                <span className="wind-dir">{weather.windDirection}</span>
              </div>
            </div>
          </div>

          <SunArc sunrise={weather.sunrise} sunset={weather.sunset} />
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
