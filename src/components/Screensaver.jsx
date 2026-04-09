import { useMemo } from "react";
import useWeather from "../hooks/useWeather";

/* ── Weather scenes — animated backgrounds keyed to condition ── */

function SunScene() {
  const dust = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        left: Math.random() * 100,
        top: 40 + Math.random() * 60,
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 10,
        size: 2 + Math.random() * 4,
        drift: -30 + Math.random() * 60,
      })),
    []
  );
  return (
    <div className="scene scene-sun">
      <div className="sun-rays" />
      <div className="sun-glow" />
      <div className="sun-core" />
      {dust.map((d, i) => (
        <div
          key={i}
          className="sun-dust"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            "--drift": `${d.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

function MoonScene() {
  const stars = useMemo(
    () =>
      Array.from({ length: 55 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 4,
        size: 1.5 + Math.random() * 3,
      })),
    []
  );
  // Two shooting stars with mismatched cycles — gives pseudo-random feel
  // because they never line up on any common interval.
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
      <div className="moon-wisp" />
      <div className="moon-body" />
      <div className="shooting-star shooting-star-1" />
      <div className="shooting-star shooting-star-2" />
    </div>
  );
}

function RainScene({ heavy = false }) {
  const nearCount = heavy ? 55 : 35;
  const farCount = heavy ? 65 : 45;

  const near = useMemo(
    () =>
      Array.from({ length: nearCount }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.7 + Math.random() * 0.5,
        height: 55 + Math.random() * 35,
      })),
    [nearCount]
  );

  const far = useMemo(
    () =>
      Array.from({ length: farCount }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 1.3 + Math.random() * 0.9,
        height: 28 + Math.random() * 22,
      })),
    [farCount]
  );

  return (
    <div className="scene scene-rain">
      {/* Distant layer — smaller, slower, softer */}
      {far.map((d, i) => (
        <div
          key={`f${i}`}
          className="raindrop raindrop-far"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
      {/* Foreground layer — bold, fast */}
      {near.map((d, i) => (
        <div
          key={`n${i}`}
          className="raindrop raindrop-near"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
      <div className="rain-mist" />
      {heavy && (
        <>
          <div className="lightning lightning-a" />
          <div className="lightning lightning-b" />
        </>
      )}
    </div>
  );
}

function SnowScene() {
  const near = useMemo(
    () =>
      Array.from({ length: 25 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 9 + Math.random() * 7,
        size: 10 + Math.random() * 10,
        drift: -50 + Math.random() * 100,
      })),
    []
  );
  const far = useMemo(
    () =>
      Array.from({ length: 40 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 14 + Math.random() * 10,
        size: 4 + Math.random() * 5,
        drift: -25 + Math.random() * 50,
      })),
    []
  );
  return (
    <div className="scene scene-snow">
      {far.map((f, i) => (
        <div
          key={`f${i}`}
          className="snowflake snowflake-far"
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
      {near.map((f, i) => (
        <div
          key={`n${i}`}
          className="snowflake snowflake-near"
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
  // Three depth layers — back (far, slow, small) → mid → front (close,
  // faster, larger). The offset delays stagger their entrances so the
  // sky never feels empty and never too busy.
  const back = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        top: 8 + i * 14 + Math.random() * 4,
        duration: 160 + Math.random() * 60,
        delay: -Math.random() * 160,
        scale: 0.55 + Math.random() * 0.3,
      })),
    []
  );
  const mid = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        top: 20 + i * 18 + Math.random() * 6,
        duration: 110 + Math.random() * 50,
        delay: -Math.random() * 110,
        scale: 0.85 + Math.random() * 0.3,
      })),
    []
  );
  const front = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        top: 35 + i * 20 + Math.random() * 8,
        duration: 70 + Math.random() * 30,
        delay: -Math.random() * 70,
        scale: 1.1 + Math.random() * 0.5,
      })),
    []
  );

  const layer = (items, className) =>
    items.map((c, i) => (
      <div
        key={i}
        className={`drift-cloud ${className}`}
        style={{
          top: `${c.top}%`,
          animationDuration: `${c.duration}s`,
          animationDelay: `${c.delay}s`,
          "--cloud-scale": c.scale,
        }}
      />
    ));

  return (
    <div className="scene scene-clouds">
      {layer(back, "cloud-back")}
      {layer(mid, "cloud-mid")}
      {layer(front, "cloud-front")}
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

  return (
    <div
      className={`screensaver ${exiting ? "screensaver-exiting" : ""}`}
      onClick={onWake}
      onTouchStart={onWake}
      role="button"
      aria-label="Tap to wake dashboard"
    >
      <WeatherScene condition={weather.conditionIcon} />
    </div>
  );
}

export default Screensaver;
