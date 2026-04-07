import { getMoonPhase, getMoonPhaseName } from "../utils/moonPhase";

/**
 * SVG moon phase icon.
 * Renders an illuminated portion over a dark moon disc using two
 * SVG arcs — a half-circle and a terminator ellipse.
 */
function MoonPhase({ size = 52 }) {
  const phase = getMoonPhase();
  const name = getMoonPhaseName(phase);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  // Build the illuminated-portion path
  const theta = phase * 2 * Math.PI;
  const cos = Math.cos(theta);
  const rx = Math.abs(r * cos);
  const waxing = phase < 0.5;

  // Half-circle direction (right side for waxing, left for waning)
  const halfSweep = waxing ? 1 : 0;

  // Terminator ellipse direction flips on the quarter boundaries
  let ellipseSweep;
  if (waxing) {
    ellipseSweep = cos > 0 ? 0 : 1; // crescent vs gibbous
  } else {
    ellipseSweep = cos > 0 ? 1 : 0;
  }

  const litPath = `
    M ${cx},${cy - r}
    A ${r},${r} 0 0 ${halfSweep} ${cx},${cy + r}
    A ${rx},${r} 0 0 ${ellipseSweep} ${cx},${cy - r}
    Z
  `;

  return (
    <div className="moon-phase-container">
      <div className="scale-bar-header">
        <span className="detail-label">Moon</span>
      </div>
      <div className="moon-phase-visual" title={name}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* shadow disc */}
          <circle cx={cx} cy={cy} r={r} fill="#2C1810" opacity="0.85" />
          {/* illuminated portion */}
          <path d={litPath} fill="#E8D9B8" />
          {/* subtle rim */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#5C4033"
            strokeWidth="1"
            opacity="0.3"
          />
        </svg>
        <span className="moon-phase-name">{name}</span>
      </div>
    </div>
  );
}

export default MoonPhase;
