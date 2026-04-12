import { useMemo } from "react";
import { X, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getPressure3hAgo } from "../hooks/useWeather";

const STANDARD = 1013.25; // hPa — sea-level baseline

/* ── Pressure zones (mapped to dial position) ── */
const zones = [
  { max: 980,  label: "Stormy",   color: "#C4613E" },
  { max: 1000, label: "Rain",     color: "#D97757" },
  { max: 1013, label: "Change",   color: "#D4A843" },
  { max: 1030, label: "Fair",     color: "#7A9E7E" },
  { max: 1060, label: "Very Dry", color: "#95B898" },
];

function getZone(hPa) {
  return zones.find((z) => hPa <= z.max) || zones[zones.length - 1];
}

function hPaToInHg(hPa) {
  return (hPa * 0.02953).toFixed(2);
}

/* ── Rate-of-change classification (the real signal) ──
   A shift of ≥6 hPa in 3 hours is significant incoming weather.
   1–3 hPa: gradual, 3–6 hPa: notable, 6+: rapid.
*/
function classifyChange(change3h) {
  if (change3h === null) return { severity: "unknown", dir: "steady" };
  const abs = Math.abs(change3h);
  const dir = change3h < -0.5 ? "falling" : change3h > 0.5 ? "rising" : "steady";
  if (abs < 1.5) return { severity: "steady", dir };
  if (abs < 3.5) return { severity: "gradual", dir };
  if (abs < 6)   return { severity: "notable", dir };
  return { severity: "rapid", dir };
}

/** Build interpretation text using both zone position AND rate of change —
    the two dimensions that together give pressure its meaning. */
function interpret(hPa, change3h) {
  const zone = getZone(hPa);
  const { severity, dir } = classifyChange(change3h);

  if (change3h === null) {
    // No history yet — give position-only reading.
    return `Pressure is at ${zone.label.toLowerCase()} levels (${Math.round(hPa - STANDARD)} hPa from baseline). History will build over the next few hours to show movement.`;
  }

  const abs = Math.abs(change3h);

  if (severity === "steady") {
    return `Pressure is holding steady at ${zone.label.toLowerCase()} levels. Current conditions are likely to persist.`;
  }

  if (severity === "rapid") {
    if (dir === "falling") {
      return `Pressure is dropping fast — ${abs} hPa in 3 hours. That exceeds the 6 hPa threshold for significant weather. A storm is likely approaching. If you're pressure-sensitive, you may already feel it.`;
    }
    return `Pressure is surging — up ${abs} hPa in 3 hours. That's a rapid clearing trend. Dramatically improving conditions ahead.`;
  }

  if (severity === "notable") {
    if (dir === "falling") {
      return `Pressure is falling notably — ${abs} hPa in 3 hours. A front is approaching and conditions will likely shift.`;
    }
    return `Pressure is rising steadily — ${abs} hPa in 3 hours. A clearing trend is underway; improving weather ahead.`;
  }

  // Gradual
  if (dir === "falling") {
    return `Pressure is easing slowly. A gradual shift is possible, but nothing imminent.`;
  }
  return `Pressure is climbing gently. Conditions are stabilizing.`;
}

/* ═══════════════════════════════════════════════════════
   SVG Gauge — the spatial dial
   Shows position instantly. The ghost needle makes the
   3-hour change visible rather than calculated.
   ═══════════════════════════════════════════════════════ */

const ARC_START = 220;  // degrees (left of bottom)
const ARC_END = 320;    // degrees (right of bottom)
const GAUGE_MIN = 960;
const GAUGE_MAX = 1060;

function pressureToAngle(hPa) {
  const clamped = Math.max(GAUGE_MIN, Math.min(GAUGE_MAX, hPa));
  const pct = (clamped - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN);
  return ARC_START - pct * (ARC_END - ARC_START);
}

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arc(cx, cy, r, a1, a2) {
  const s = polar(cx, cy, r, a1);
  const e = polar(cx, cy, r, a2);
  const large = Math.abs(a1 - a2) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function Gauge({ pressure, pressure3hAgo }) {
  const cx = 150, cy = 150, r = 120;

  const zoneArcs = useMemo(() => {
    const out = [];
    let prev = GAUGE_MIN;
    for (const z of zones) {
      const from = Math.max(prev, GAUGE_MIN);
      const to = Math.min(z.max, GAUGE_MAX);
      if (from >= GAUGE_MAX || to <= GAUGE_MIN) { prev = z.max; continue; }
      out.push({ d: arc(cx, cy, r, pressureToAngle(from), pressureToAngle(to)), color: z.color });
      prev = z.max;
    }
    return out;
  }, []);

  const zoneLabels = useMemo(() => {
    const out = [];
    let prev = GAUGE_MIN;
    for (const z of zones) {
      const from = Math.max(prev, GAUGE_MIN);
      const to = Math.min(z.max, GAUGE_MAX);
      if (from >= GAUGE_MAX || to <= GAUGE_MIN) { prev = z.max; continue; }
      const pos = polar(cx, cy, r + 22, pressureToAngle((from + to) / 2));
      out.push({ ...pos, text: z.label.toUpperCase() });
      prev = z.max;
    }
    return out;
  }, []);

  const needleAngle = pressureToAngle(pressure);
  const needleTip = polar(cx, cy, r - 16, needleAngle);
  const needleBase = polar(cx, cy, 18, needleAngle);

  let ghostTip = null, ghostBase = null;
  if (pressure3hAgo != null) {
    const ga = pressureToAngle(pressure3hAgo);
    ghostTip = polar(cx, cy, r - 28, ga);
    ghostBase = polar(cx, cy, 18, ga);
  }

  return (
    <svg viewBox="0 0 300 210" className="baro-gauge-svg">
      {zoneArcs.map((a, i) => (
        <path key={i} d={a.d} fill="none" stroke={a.color}
              strokeWidth="14" strokeLinecap="round" opacity="0.55" />
      ))}
      {zoneLabels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor="middle"
              dominantBaseline="middle" className="baro-zone-label">
          {l.text}
        </text>
      ))}

      {/* Hub */}
      <circle cx={cx} cy={cy} r="10" fill="var(--walnut)" opacity="0.2" />
      <circle cx={cx} cy={cy} r="6" fill="var(--clay)" />

      {/* Ghost needle — "where you were" */}
      {ghostTip && ghostBase && (
        <>
          <line x1={ghostBase.x} y1={ghostBase.y} x2={ghostTip.x} y2={ghostTip.y}
                stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round"
                opacity="0.3" strokeDasharray="5 4" />
          <text x={ghostTip.x} y={ghostTip.y - 8} textAnchor="middle"
                className="baro-ghost-label">3h ago</text>
        </>
      )}

      {/* Current needle */}
      <line x1={needleBase.x} y1={needleBase.y} x2={needleTip.x} y2={needleTip.y}
            stroke="var(--clay)" strokeWidth="4" strokeLinecap="round"
            style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }} />

      {/* Reading at hub */}
      <text x={cx} y={cy + 30} textAnchor="middle" className="baro-reading-hpa">
        {pressure} hPa
      </text>
      <text x={cx} y={cy + 46} textAnchor="middle" className="baro-reading-inhg">
        {hPaToInHg(pressure)} inHg
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Modal — headline status + gauge + rate-of-change hero
   ═══════════════════════════════════════════════════════ */

export default function BarometricModal({ pressure, onClose }) {
  const pressure3hAgo = getPressure3hAgo();
  const change3h = pressure3hAgo != null ? pressure - pressure3hAgo : null;
  const deviation = Math.round(pressure - STANDARD);
  const zone = getZone(pressure);
  const { severity, dir } = classifyChange(change3h);
  const meaning = interpret(pressure, change3h);

  // Choose trend icon
  const TrendIcon = dir === "falling" ? TrendingDown
                  : dir === "rising"  ? TrendingUp
                  : Minus;

  // Rate-of-change accent color
  const changeColor =
    severity === "rapid"   ? "#C4613E" :
    severity === "notable" ? "#D97757" :
    severity === "gradual" ? "#D4A843" :
    "var(--sage)";

  return (
    <div className="baro-overlay" onClick={onClose}>
      <div className="baro-modal" onClick={(e) => e.stopPropagation()}>
        <button className="baro-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <h2 className="baro-title">Barometric Pressure</h2>

        {/* ── Headline status word ── */}
        <div className="baro-zone-name" style={{ color: zone.color }}>
          {zone.label}
        </div>

        {/* ── Gauge — position + ghost needle ── */}
        <Gauge pressure={pressure} pressure3hAgo={pressure3hAgo} />

        {/* ── Rate of change — the real signal ── */}
        <div className="baro-change-hero" style={{ borderColor: changeColor }}>
          <TrendIcon size={22} color={changeColor} />
          <div className="baro-change-detail">
            <span className="baro-change-value" style={{ color: changeColor }}>
              {change3h != null
                ? `${change3h > 0 ? "+" : ""}${change3h} hPa`
                : "Collecting…"}
            </span>
            <span className="baro-change-label">3-hour change</span>
          </div>
          {change3h != null && Math.abs(change3h) >= 6 && (
            <span className="baro-change-badge">Significant</span>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="baro-stats">
          <div className="baro-stat">
            <span className="baro-stat-label">Deviation</span>
            <span className="baro-stat-value">
              {deviation > 0 ? "+" : ""}{deviation} hPa
            </span>
          </div>
          <div className="baro-stat">
            <span className="baro-stat-label">Baseline</span>
            <span className="baro-stat-value">1013 hPa</span>
          </div>
          <div className="baro-stat">
            <span className="baro-stat-label">3hr Ago</span>
            <span className="baro-stat-value">
              {pressure3hAgo != null ? `${pressure3hAgo} hPa` : "—"}
            </span>
          </div>
        </div>

        {/* ── "What this means" ── */}
        <div className="baro-meaning">
          <span className="baro-meaning-label">What this means</span>
          <p className="baro-meaning-text">{meaning}</p>
        </div>

        {pressure3hAgo != null && (
          <p className="baro-footnote">
            The dashed needle shows pressure 3 hours ago. The gap between
            needles makes the change visible at a glance.
          </p>
        )}
      </div>
    </div>
  );
}
