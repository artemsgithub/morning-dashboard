import { useMemo } from "react";
import { X } from "lucide-react";
import { getPressure3hAgo } from "../hooks/useWeather";

const STANDARD = 1013.25; // hPa — standard atmospheric pressure

/* ── Pressure zones mapped to the gauge arc ── */
const zones = [
  { max: 980, label: "Stormy", color: "#C4613E" },
  { max: 1000, label: "Rain", color: "#D97757" },
  { max: 1013, label: "Change", color: "#D4A843" },
  { max: 1030, label: "Fair", color: "#7A9E7E" },
  { max: 1060, label: "Very Dry", color: "#95B898" },
];

function getZone(hPa) {
  return zones.find((z) => hPa <= z.max) || zones[zones.length - 1];
}

function hPaToInHg(hPa) {
  return (hPa * 0.02953).toFixed(2);
}

/** Interpret the trend for the "What this means" box. */
function interpret(hPa, change3h) {
  const zone = getZone(hPa);
  if (change3h === null) {
    // No history yet
    switch (zone.label) {
      case "Stormy":
        return "Pressure is very low — stormy conditions are likely. If you're pressure-sensitive, you may already feel it.";
      case "Rain":
        return "Low pressure suggests unsettled weather. Rain or clouds are probable.";
      case "Change":
        return "Pressure is near the tipping point — weather could shift either way.";
      case "Fair":
        return "Comfortable pressure levels. Settled, pleasant conditions expected.";
      default:
        return "High pressure — clear skies and dry conditions are likely to hold.";
    }
  }

  const abs = Math.abs(change3h);
  const dir = change3h < 0 ? "falling" : "rising";

  if (abs < 1) {
    return `Pressure is holding steady at ${zone.label.toLowerCase()} levels. Conditions are unlikely to change soon.`;
  } else if (abs < 4) {
    return `Pressure is ${dir} slowly. A gradual weather shift is ${change3h < 0 ? "possible" : "clearing up"}.`;
  } else if (abs < 8) {
    return `Pressure is ${dir} notably. ${change3h < 0 ? "A front is approaching — expect changing conditions." : "Clearing trend — improving weather ahead."}`;
  } else {
    return `Pressure is ${dir} fast — ${change3h < 0 ? "a storm is likely approaching. If you're pressure-sensitive, you may already feel it." : "rapid clearing. Dramatically improving conditions."}`;
  }
}

/* ── SVG Gauge ── */

// The arc spans from 220° to 320° (200° sweep), centered at bottom.
const ARC_START = 220; // degrees (left of bottom)
const ARC_END = 320;   // degrees (right of bottom)
const ARC_SWEEP = ARC_END - ARC_START;
const GAUGE_MIN = 960;
const GAUGE_MAX = 1060;

function pressureToAngle(hPa) {
  const clamped = Math.max(GAUGE_MIN, Math.min(GAUGE_MAX, hPa));
  const pct = (clamped - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN);
  // Flip: low pressure on left, high on right. Sweep goes counterclockwise
  // from ARC_START (low) across the top to ARC_END (high).
  return ARC_START - pct * ARC_SWEEP;
}

function polarToCart(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const s = polarToCart(cx, cy, r, startAngle);
  const e = polarToCart(cx, cy, r, endAngle);
  const sweep = startAngle - endAngle;
  const large = Math.abs(sweep) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function Gauge({ pressure, pressure3hAgo }) {
  const cx = 150;
  const cy = 150;
  const r = 120;

  // Zone arcs — break the sweep into colored segments
  const zoneArcs = useMemo(() => {
    const arcs = [];
    let prevMax = GAUGE_MIN;
    for (const zone of zones) {
      const from = Math.max(prevMax, GAUGE_MIN);
      const to = Math.min(zone.max, GAUGE_MAX);
      if (from >= GAUGE_MAX || to <= GAUGE_MIN) {
        prevMax = zone.max;
        continue;
      }
      const a1 = pressureToAngle(from);
      const a2 = pressureToAngle(to);
      arcs.push({ d: arcPath(cx, cy, r, a1, a2), color: zone.color, label: zone.label });
      prevMax = zone.max;
    }
    return arcs;
  }, []);

  // Zone labels positioned on the arc
  const zoneLabels = useMemo(() => {
    const labels = [];
    let prevMax = GAUGE_MIN;
    for (const zone of zones) {
      const from = Math.max(prevMax, GAUGE_MIN);
      const to = Math.min(zone.max, GAUGE_MAX);
      if (from >= GAUGE_MAX || to <= GAUGE_MIN) {
        prevMax = zone.max;
        continue;
      }
      const mid = (from + to) / 2;
      const angle = pressureToAngle(mid);
      const pos = polarToCart(cx, cy, r + 22, angle);
      labels.push({ ...pos, text: zone.label.toUpperCase(), angle });
      prevMax = zone.max;
    }
    return labels;
  }, []);

  const needleAngle = pressureToAngle(pressure);
  const needleEnd = polarToCart(cx, cy, r - 16, needleAngle);
  const needleInner = polarToCart(cx, cy, 18, needleAngle);

  // Ghost needle for 3h ago
  let ghostEnd = null;
  let ghostInner = null;
  if (pressure3hAgo != null) {
    const ghostAngle = pressureToAngle(pressure3hAgo);
    ghostEnd = polarToCart(cx, cy, r - 28, ghostAngle);
    ghostInner = polarToCart(cx, cy, 18, ghostAngle);
  }

  return (
    <svg viewBox="0 0 300 210" className="baro-gauge-svg">
      {/* Arc segments */}
      {zoneArcs.map((arc, i) => (
        <path
          key={i}
          d={arc.d}
          fill="none"
          stroke={arc.color}
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}

      {/* Zone labels */}
      {zoneLabels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="baro-zone-label"
        >
          {l.text}
        </text>
      ))}

      {/* Center hub */}
      <circle cx={cx} cy={cy} r="10" fill="var(--walnut)" opacity="0.25" />
      <circle cx={cx} cy={cy} r="6" fill="var(--clay)" />

      {/* Ghost needle (3h ago) */}
      {ghostEnd && ghostInner && (
        <line
          x1={ghostInner.x}
          y1={ghostInner.y}
          x2={ghostEnd.x}
          y2={ghostEnd.y}
          stroke="var(--text-muted)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.35"
        />
      )}

      {/* Main needle */}
      <line
        x1={needleInner.x}
        y1={needleInner.y}
        x2={needleEnd.x}
        y2={needleEnd.y}
        stroke="var(--clay)"
        strokeWidth="4"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }}
      />

      {/* Reading below the hub */}
      <text x={cx} y={cy + 30} textAnchor="middle" className="baro-reading-hpa">
        {pressure} hPa
      </text>
      <text x={cx} y={cy + 46} textAnchor="middle" className="baro-reading-inhg">
        {hPaToInHg(pressure)} inHg
      </text>
    </svg>
  );
}

/* ── Modal ── */

export default function BarometricModal({ pressure, onClose }) {
  const pressure3hAgo = getPressure3hAgo();
  const change3h = pressure3hAgo != null ? pressure - pressure3hAgo : null;
  const deviation = Math.round(pressure - STANDARD);
  const zone = getZone(pressure);
  const meaning = interpret(pressure, change3h);

  return (
    <div className="baro-overlay" onClick={onClose}>
      <div className="baro-modal" onClick={(e) => e.stopPropagation()}>
        <button className="baro-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <h2 className="baro-title">Barometric Pressure</h2>

        <Gauge pressure={pressure} pressure3hAgo={pressure3hAgo} />

        <div className="baro-zone-name" style={{ color: zone.color }}>
          {zone.label}
        </div>

        <div className="baro-stats">
          <div className="baro-stat">
            <span className="baro-stat-label">Deviation</span>
            <span className="baro-stat-value">
              {deviation > 0 ? "+" : ""}
              {deviation} hPa
            </span>
          </div>
          <div className="baro-stat">
            <span className="baro-stat-label">3hr Change</span>
            <span className="baro-stat-value">
              {change3h != null
                ? `${change3h > 0 ? "+" : ""}${change3h} hPa`
                : "—"}
            </span>
          </div>
          <div className="baro-stat">
            <span className="baro-stat-label">3hr Ago</span>
            <span className="baro-stat-value">
              {pressure3hAgo != null ? `${pressure3hAgo} hPa` : "—"}
            </span>
          </div>
        </div>

        <div className="baro-meaning">
          <span className="baro-meaning-label">What this means</span>
          <p className="baro-meaning-text">{meaning}</p>
        </div>

        {pressure3hAgo != null && (
          <p className="baro-footnote">
            Faded needle shows pressure 3 hours ago. The gap between needles
            makes the change visible.
          </p>
        )}
      </div>
    </div>
  );
}
