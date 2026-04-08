import { useState, useEffect, useMemo } from "react";
import useWeather from "../hooks/useWeather";

/* ── Weather scenes — animated backgrounds keyed to condition ── */

function SunScene() {
  return (
    <div className="scene scene-sun">
      <div className="sun-glow" />
      <div className="sun-core" />
    </div>
  );
}

function MoonScene() {
  const stars = useMemo(
    () =>
      Array.from({ length: 45 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3,
        size: 2 + Math.random() * 3,
      })),
    []
  );
  return (
    <div className="scene scene-moon">
      {stars.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
      <div className="moon-body" />
    </div>
  );
}

function RainScene({ heavy = false }) {
  const count = heavy ? 90 : 55;
  const drops = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.8 + Math.random() * 0.9,
        height: 40 + Math.random() * 40,
      })),
    [count]
  );
  return (
    <div className="scene scene-rain">
      {drops.map((d, i) => (
        <div
          key={i}
          className="raindrop"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function SnowScene() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 50 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 8,
        size: 6 + Math.random() * 10,
        drift: -20 + Math.random() * 40,
      })),
    []
  );
  return (
    <div className="scene scene-snow">
      {flakes.map((f, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            fontSize: `${f.size}px`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            "--drift": `${f.drift}px`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

function CloudScene() {
  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        top: 10 + i * 18 + Math.random() * 6,
        duration: 80 + Math.random() * 60,
        delay: -Math.random() * 80,
        scale: 0.7 + Math.random() * 0.8,
      })),
    []
  );
  return (
    <div className="scene scene-clouds">
      {clouds.map((c, i) => (
        <div
          key={i}
          className="drift-cloud"
          style={{
            top: `${c.top}%`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            transform: `scale(${c.scale})`,
          }}
        />
      ))}
    </div>
  );
}

function WeatherScene({ condition }) {
  switch (condition) {
    case "sun":
      return <SunScene />;
    case "moon":
      return <MoonScene />;
    case "cloud-rain":
      return <RainScene />;
    case "cloud-drizzle":
      return <RainScene />;
    case "cloud-lightning":
      return <RainScene heavy />;
    case "cloud-snow":
      return <SnowScene />;
    case "cloud-fog":
    case "cloud":
    case "cloud-sun":
    default:
      return <CloudScene />;
  }
}

/* ── Main screensaver ── */

function Screensaver({ onWake, exiting }) {
  const { weather } = useWeather();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`screensaver ${exiting ? "screensaver-exiting" : ""}`}
      onClick={onWake}
      onTouchStart={onWake}
      role="button"
      aria-label="Tap to wake dashboard"
    >
      <WeatherScene condition={weather.conditionIcon} />

      <div className="screensaver-clock-wrap">
        <div className="screensaver-time">{time}</div>
        <div className="screensaver-date">{date}</div>
        <div className="screensaver-temp">
          {weather.temperature}° · {weather.condition}
        </div>
      </div>

      <div className="screensaver-hint">Tap to wake</div>
    </div>
  );
}

export default Screensaver;
