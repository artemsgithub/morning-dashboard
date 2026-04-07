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
  RefreshCw,
} from "lucide-react";
import useWeather from "../hooks/useWeather";
import MoonPhase from "./MoonPhase";

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

/* Colors tuned to the mid-century warm palette —
   warm sunlit tones for clear/sunny, muted cools for wet/cold. */
const weatherIconColors = {
  sun:              "#E8A33D", // golden amber
  "cloud-sun":      "#D4A843", // muted gold
  cloud:            "#A89888", // warm gray
  "cloud-rain":     "#6B8897", // dusky blue-gray
  "cloud-drizzle":  "#8FA3A8", // lighter blue-gray
  "cloud-snow":     "#B8C4C4", // pale cool
  "cloud-lightning":"#C48A2E", // darker amber
  "cloud-fog":      "#9A8A7C", // muted fog gray
  moon:             "#7A8899", // dusky indigo
};

function iconColor(key) {
  return weatherIconColors[key] || "var(--sage)";
}

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

function InlinePercentBar({ value, label, icon: Icon, color }) {
  return (
    <div className="inline-bar-track">
      <div
        className="inline-bar-fill"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
      <div className="inline-bar-content">
        <Icon size={18} />
        <span className="inline-bar-label">{label}</span>
        <span className="inline-bar-value">{value}%</span>
      </div>
    </div>
  );
}

function SunArc({ sunrise, sunset }) {
  // Daylight span on the SVG goes from x=10 to x=190 (180 units).
  // Golden hour ≈ 1h at start and end of day (~1/12 of a 12h day ≈ 15 units).
  // Blue hour ≈ 30 min just before sunrise / after sunset (~8 units just outside).
  return (
    <div className="sun-arc-container">
      <div className="sun-arc-header">
        <span className="detail-label">Daylight</span>
      </div>
      <div className="sun-arc-visual">
        <svg viewBox="0 0 200 40" className="sun-arc-svg" preserveAspectRatio="none">
          {/* blue hour ticks — just outside the line */}
          <line x1="2" y1="20" x2="9" y2="20" stroke="#6B8897" strokeWidth="3" strokeLinecap="round" />
          <line x1="191" y1="20" x2="198" y2="20" stroke="#6B8897" strokeWidth="3" strokeLinecap="round" />

          {/* dashed daylight track */}
          <line
            x1="10" y1="20" x2="190" y2="20"
            stroke="var(--card-border)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />

          {/* golden hour bands (first and last ~1/12 of the daylight line) */}
          <line x1="10" y1="20" x2="25" y2="20" stroke="#E8A33D" strokeWidth="3" strokeLinecap="round" />
          <line x1="175" y1="20" x2="190" y2="20" stroke="#E8A33D" strokeWidth="3" strokeLinecap="round" />

          {/* filled portion — progress through the day */}
          <line
            x1="10" y1="20" x2="130" y2="20"
            stroke="var(--clay)"
            strokeWidth="2.5"
          />

          {/* sun dot */}
          <circle cx="130" cy="20" r="8" fill="var(--clay)" />
          <circle cx="130" cy="20" r="12" fill="var(--clay)" opacity="0.15" />
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
  const { weather, loading, refresh } = useWeather();
  const ConditionIcon = weatherIcons[weather.conditionIcon] || Cloud;

  return (
    <div className="card weather-card">
      <div className="weather-header">
        <div className="weather-main">
          <div className="weather-temp-row">
            <ConditionIcon
              size={64}
              className="weather-condition-icon"
              color={iconColor(weather.conditionIcon)}
            />
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
            <div className="weather-location">{weather.location}</div>
          </div>
        </div>
      </div>

      <div className="weather-hourly">
        {weather.hourly.map((hour) => {
          const Icon = weatherIcons[hour.icon] || Cloud;
          return (
            <div key={hour.time} className="hourly-item">
              <span className="hourly-time">{hour.time}</span>
              <Icon size={26} color={iconColor(hour.icon)} />
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

        <InlinePercentBar
          value={weather.rain.chance}
          label={weather.rain.willRain ? `Rain — ${weather.rain.when}` : "Rain"}
          icon={Umbrella}
          color="var(--clay)"
        />

        <div className="weather-gauges-row weather-gauges-row-triple">
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

          <MoonPhase />

          <SunArc sunrise={weather.sunrise} sunset={weather.sunset} />
        </div>
      </div>

      <button
        className="weather-refresh"
        onClick={refresh}
        disabled={loading}
        title="Refresh weather"
      >
        <RefreshCw size={14} className={loading ? "spin" : ""} />
        <span>{loading ? "Updating…" : "Refresh"}</span>
      </button>
    </div>
  );
}

export default WeatherCard;
