import { useMemo } from "react";
import { X, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getPressure3hAgo, getPressureHistory } from "../hooks/useWeather";

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

/* ── Rate-of-change classification ── */
function classifyChange(change3h) {
  if (change3h === null) return { severity: "unknown", dir: "steady" };
  const abs = Math.abs(change3h);
  const dir = change3h < -0.5 ? "falling" : change3h > 0.5 ? "rising" : "steady";
  if (abs < 1.5) return { severity: "steady", dir };
  if (abs < 3.5) return { severity: "gradual", dir };
  if (abs < 6)   return { severity: "notable", dir };
  return { severity: "rapid", dir };
}

function interpret(hPa, change3h) {
  const zone = getZone(hPa);
  const { severity, dir } = classifyChange(change3h);

  if (change3h === null) {
    return `Pressure is at ${zone.label.toLowerCase()} levels (${Math.round(hPa - STANDARD)} hPa from baseline). History will build over the next few hours to show movement.`;
  }

  const abs = Math.abs(change3h);

  if (severity === "steady") {
    return `Pressure is holding steady at ${zone.label.toLowerCase()} levels. Current conditions are likely to persist.`;
  }
  if (severity === "rapid") {
    if (dir === "falling")
      return `Pressure is dropping fast — ${abs} hPa in 3 hours. That exceeds the 6 hPa threshold for significant weather. A storm is likely approaching.`;
    return `Pressure is surging — up ${abs} hPa in 3 hours. Rapid clearing trend. Dramatically improving conditions ahead.`;
  }
  if (severity === "notable") {
    if (dir === "falling")
      return `Pressure is falling notably — ${abs} hPa in 3 hours. A front is approaching and conditions will likely shift.`;
    return `Pressure is rising steadily — ${abs} hPa in 3 hours. A clearing trend is underway.`;
  }
  if (dir === "falling")
    return `Pressure is easing slowly. A gradual shift is possible, but nothing imminent.`;
  return `Pressure is climbing gently. Conditions are stabilizing.`;
}

/* ═══════════════════════════════════════════════════════
   SVG Gauge
   ═══════════════════════════════════════════════════════ */

const ARC_START_DEG = 210;
const ARC_SWEEP_DEG = 240;
const GAUGE_MIN = 960;
const GAUGE_MAX = 1060;

function pressureToAngle(hPa) {
  const clamped = Math.max(GAUGE_MIN, Math.min(GAUGE_MAX, hPa));
  const pct = (clamped - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN);
  return ARC_START_DEG - pct * ARC_SWEEP_DEG;
}

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function svgArc(cx, cy, r, a1, a2) {
  const s = polar(cx, cy, r, a1);
  const e = polar(cx, cy, r, a2);
  const large = Math.abs(a1 - a2) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function Gauge({ pressure, pressure3hAgo }) {
  const cx = 150, cy = 140, r = 105;
  const labelR = r + 20;

  const zoneArcs = useMemo(() => {
    const out = [];
    let prev = GAUGE_MIN;
    for (const z of zones) {
      const from = Math.max(prev, GAUGE_MIN);
      const to = Math.min(z.max, GAUGE_MAX);
      if (from >= GAUGE_MAX || to <= GAUGE_MIN) { prev = z.max; continue; }
      out.push({ d: svgArc(cx, cy, r, pressureToAngle(from), pressureToAngle(to)), color: z.color });
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
      const pos = polar(cx, cy, labelR, pressureToAngle((from + to) / 2));
      out.push({ ...pos, text: z.label.toUpperCase() });
      prev = z.max;
    }
    return out;
  }, []);

  const needleAngle = pressureToAngle(pressure);
  const needleTip = polar(cx, cy, r - 14, needleAngle);
  const needleBase = polar(cx, cy, 16, needleAngle);

  let ghostTip = null, ghostBase = null;
  if (pressure3hAgo != null) {
    const ga = pressureToAngle(pressure3hAgo);
    ghostTip = polar(cx, cy, r - 26, ga);
    ghostBase = polar(cx, cy, 16, ga);
  }

  return (
    <svg viewBox="-5 0 310 210" className="baro-gauge-svg">
      {zoneArcs.map((a, i) => (
        <path key={i} d={a.d} fill="none" stroke={a.color}
              strokeWidth="12" strokeLinecap="round" opacity="0.55" />
      ))}
      {zoneLabels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor="middle"
              dominantBaseline="middle" className="baro-zone-label">{l.text}</text>
      ))}
      <circle cx={cx} cy={cy} r="9" fill="var(--walnut)" opacity="0.2" />
      <circle cx={cx} cy={cy} r="5" fill="var(--clay)" />
      {ghostTip && ghostBase && (
        <>
          <line x1={ghostBase.x} y1={ghostBase.y} x2={ghostTip.x} y2={ghostTip.y}
                stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"
                opacity="0.3" strokeDasharray="4 3" />
          <text x={ghostTip.x} y={ghostTip.y - 7} textAnchor="middle"
                className="baro-ghost-label">3h ago</text>
        </>
      )}
      <line x1={needleBase.x} y1={needleBase.y} x2={needleTip.x} y2={needleTip.y}
            stroke="var(--clay)" strokeWidth="3.5" strokeLinecap="round"
            style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }} />
      <text x={cx} y={cy + 26} textAnchor="middle" className="baro-reading-hpa">
        {pressure} hPa
      </text>
      <text x={cx} y={cy + 40} textAnchor="middle" className="baro-reading-inhg">
        {hPaToInHg(pressure)} inHg
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Pressure History Chart — SVG line graph
   ═══════════════════════════════════════════════════════ */

function formatHour(ts) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function PressureChart({ history, currentPressure }) {
  // Build data points: stored history + current live reading
  const data = useMemo(() => {
    const pts = [...history];
    const now = Date.now();
    // Append current reading if it's newer than last history entry
    if (pts.length === 0 || now - pts[pts.length - 1].ts > 60_000) {
      pts.push({ hPa: currentPressure, ts: now });
    }
    return pts;
  }, [history, currentPressure]);

  if (data.length < 2) {
    return (
      <div className="baro-chart-empty">
        <p>Pressure readings are collected every 3 hours.</p>
        <p>The graph will appear once at least two data points are available.</p>
      </div>
    );
  }

  // Chart dimensions (inside the SVG viewBox)
  const pad = { top: 24, right: 16, bottom: 36, left: 44 };
  const w = 360;
  const h = 280;
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  // Scales
  const tMin = data[0].ts;
  const tMax = data[data.length - 1].ts;
  const tRange = tMax - tMin || 1;

  const hPaVals = data.map((d) => d.hPa);
  const pMin = Math.min(...hPaVals);
  const pMax = Math.max(...hPaVals);
  // Pad the y-axis by ±3 hPa so the line isn't pinned to edges,
  // but ensure at least 6 hPa of range for visual clarity.
  const yPad = 3;
  const rawRange = pMax - pMin;
  const yMin = rawRange < 6 ? ((pMin + pMax) / 2 - 3) : (pMin - yPad);
  const yMax = rawRange < 6 ? ((pMin + pMax) / 2 + 3) : (pMax + yPad);
  const yRange = yMax - yMin || 1;

  const x = (ts) => pad.left + ((ts - tMin) / tRange) * plotW;
  const y = (hPa) => pad.top + plotH - ((hPa - yMin) / yRange) * plotH;

  // Build the polyline
  const linePath = data.map((d, i) =>
    `${i === 0 ? "M" : "L"} ${x(d.ts).toFixed(1)} ${y(d.hPa).toFixed(1)}`
  ).join(" ");

  // Gradient fill below the line
  const areaPath = linePath
    + ` L ${x(data[data.length - 1].ts).toFixed(1)} ${(pad.top + plotH).toFixed(1)}`
    + ` L ${x(data[0].ts).toFixed(1)} ${(pad.top + plotH).toFixed(1)} Z`;

  // Y-axis grid lines — pick ~4 nice round values
  const yStep = yRange <= 6 ? 1 : yRange <= 15 ? 2 : 5;
  const yGridStart = Math.ceil(yMin / yStep) * yStep;
  const yGridLines = [];
  for (let v = yGridStart; v <= yMax; v += yStep) {
    yGridLines.push(v);
  }

  // X-axis labels — show hour for each data point
  const xLabels = data.map((d) => ({
    ts: d.ts,
    label: formatHour(d.ts),
  }));
  // Only show a subset if too many points (max ~6 labels)
  const labelStep = Math.max(1, Math.ceil(xLabels.length / 6));
  const shownLabels = xLabels.filter((_, i) => i % labelStep === 0 || i === xLabels.length - 1);

  // Zone color for the current reading dot
  const dotColor = getZone(currentPressure).color;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="baro-chart-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--clay)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--clay)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Y grid lines + labels */}
      {yGridLines.map((v) => (
        <g key={v}>
          <line
            x1={pad.left} y1={y(v)} x2={w - pad.right} y2={y(v)}
            stroke="var(--card-border)" strokeWidth="0.7"
          />
          <text x={pad.left - 6} y={y(v) + 1} textAnchor="end"
                dominantBaseline="middle" className="baro-chart-ylabel">
            {Math.round(v)}
          </text>
        </g>
      ))}

      {/* 1013 baseline — dashed */}
      {yMin < STANDARD && yMax > STANDARD && (
        <line
          x1={pad.left} y1={y(STANDARD)} x2={w - pad.right} y2={y(STANDARD)}
          stroke="var(--text-muted)" strokeWidth="0.8" strokeDasharray="4 3"
          opacity="0.6"
        />
      )}

      {/* Area fill */}
      <path d={areaPath} fill="url(#chart-fill)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="var(--clay)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />

      {/* Data point dots */}
      {data.map((d, i) => (
        <circle key={i} cx={x(d.ts)} cy={y(d.hPa)} r="3.5"
                fill={i === data.length - 1 ? dotColor : "var(--clay)"}
                opacity={i === data.length - 1 ? 1 : 0.6}
                stroke={i === data.length - 1 ? "white" : "none"}
                strokeWidth={i === data.length - 1 ? 1.5 : 0} />
      ))}

      {/* X-axis labels */}
      {shownLabels.map((l) => (
        <text key={l.ts} x={x(l.ts)} y={h - 8}
              textAnchor="middle" className="baro-chart-xlabel">
          {l.label}
        </text>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Modal — two-column layout: gauge left, chart right
   ═══════════════════════════════════════════════════════ */

export default function BarometricModal({ pressure, onClose }) {
  const pressure3hAgo = getPressure3hAgo();
  const history = getPressureHistory();
  const change3h = pressure3hAgo != null ? pressure - pressure3hAgo : null;
  const deviation = Math.round(pressure - STANDARD);
  const zone = getZone(pressure);
  const { severity, dir } = classifyChange(change3h);
  const meaning = interpret(pressure, change3h);

  const TrendIcon = dir === "falling" ? TrendingDown
                  : dir === "rising"  ? TrendingUp
                  : Minus;

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

        <div className="baro-columns">
          {/* ── Left: gauge + metrics ── */}
          <div className="baro-col-left">
            <div className="baro-zone-name" style={{ color: zone.color }}>
              {zone.label}
            </div>

            <Gauge pressure={pressure} pressure3hAgo={pressure3hAgo} />

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
          </div>

          {/* ── Right: 24h history chart ── */}
          <div className="baro-col-right">
            <span className="baro-chart-title">24-Hour History</span>
            <PressureChart history={history} currentPressure={pressure} />
          </div>
        </div>

        {/* ── Full-width bottom section ── */}
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
