import { useId } from "react";
import { getMoonPhase, getMoonPhaseName } from "../utils/moonPhase";

/**
 * Detailed SVG moon with phase shadow overlay.
 * Renders a cratered moon surface and masks the unlit portion
 * with a dark glow to indicate the current lunar phase.
 */
function MoonPhase({ size = 52 }) {
  const phase = getMoonPhase();
  const name = getMoonPhaseName(phase);
  const uid = useId();

  // Fixed viewBox for consistent detail; scaled via width/height
  const vb = 100;
  const cx = 50;
  const cy = 50;
  const r = 42;

  // ── Phase geometry (lit path) ──
  const theta = phase * 2 * Math.PI;
  const cos = Math.cos(theta);
  const rx = Math.abs(r * cos);
  const waxing = phase < 0.5;

  const halfSweep = waxing ? 1 : 0;
  let ellipseSweep;
  if (waxing) {
    ellipseSweep = cos > 0 ? 0 : 1;
  } else {
    ellipseSweep = cos > 0 ? 1 : 0;
  }

  const litPath = [
    `M ${cx},${cy - r}`,
    `A ${r},${r} 0 0 ${halfSweep} ${cx},${cy + r}`,
    `A ${rx},${r} 0 0 ${ellipseSweep} ${cx},${cy - r}`,
    "Z",
  ].join(" ");

  return (
    <div className="moon-phase-container">
      <div className="scale-bar-header">
        <span className="detail-label">Moon</span>
      </div>
      <div className="moon-phase-visual" title={name}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${vb} ${vb}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Moon surface: subtle warm-gray gradient, lit from upper-left */}
            <radialGradient id={`${uid}-surf`} cx="38%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#D2D2D8" />
              <stop offset="45%" stopColor="#BDBDC6" />
              <stop offset="80%" stopColor="#A3A3AE" />
              <stop offset="100%" stopColor="#909099" />
            </radialGradient>

            {/* Outer halo glow */}
            <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
              <stop offset="82%" stopColor="rgba(200,215,240,0)" />
              <stop offset="92%" stopColor="rgba(200,215,240,0.12)" />
              <stop offset="100%" stopColor="rgba(200,215,240,0)" />
            </radialGradient>

            {/* Shadow mask: white = shadow visible, black = shadow hidden (lit) */}
            <mask id={`${uid}-mask`}>
              <circle cx={cx} cy={cy} r={r} fill="white" />
              <path d={litPath} fill="black" />
            </mask>

            {/* Soft blur for shadow glow at terminator */}
            <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>

            {/* Clip to moon disc */}
            <clipPath id={`${uid}-clip`}>
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
          </defs>

          {/* ── Halo ── */}
          <circle cx={cx} cy={cy} r={r + 6} fill={`url(#${uid}-halo)`} />
          <circle
            cx={cx} cy={cy} r={r + 3}
            fill="none"
            stroke="rgba(195,212,238,0.1)"
            strokeWidth="4"
          />

          {/* ── Moon surface ── */}
          <g clipPath={`url(#${uid}-clip)`}>
            <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-surf)`} />

            {/* Large mare (dark sea) — upper region */}
            <ellipse cx={44} cy={33} rx={17} ry={13} fill="rgba(130,130,145,0.28)" />

            {/* Secondary mare — lower right */}
            <ellipse cx={62} cy={60} rx={9} ry={7} fill="rgba(135,135,148,0.2)" />

            {/* ── Craters ── */}
            {/* Upper-right prominent crater */}
            <circle cx={66} cy={27} r={6.5} fill="rgba(120,120,135,0.22)" />
            <ellipse cx={66} cy={28.5} rx={5.5} ry={4.5} fill="rgba(165,165,175,0.15)" />

            {/* Center-left crater */}
            <circle cx={29} cy={46} r={5} fill="rgba(125,125,140,0.25)" />
            <ellipse cx={29} cy={47.5} rx={4} ry={3.2} fill="rgba(160,160,172,0.14)" />

            {/* Upper-left small crater */}
            <circle cx={33} cy={24} r={3.5} fill="rgba(130,130,145,0.22)" />

            {/* Lower-left large crater */}
            <circle cx={34} cy={66} r={5.5} fill="rgba(122,122,138,0.26)" />
            <ellipse cx={34} cy={67.5} rx={4.5} ry={3.5} fill="rgba(158,158,170,0.13)" />

            {/* Center-bottom crater */}
            <circle cx={50} cy={72} r={3} fill="rgba(128,128,142,0.22)" />

            {/* Right-side crater */}
            <circle cx={73} cy={47} r={4} fill="rgba(130,130,144,0.2)" />
            <ellipse cx={73} cy={48} rx={3.2} ry={2.5} fill="rgba(162,162,174,0.12)" />

            {/* Scattered small craters */}
            <circle cx={55} cy={42} r={2.2} fill="rgba(134,134,148,0.18)" />
            <circle cx={42} cy={56} r={2} fill="rgba(128,128,142,0.2)" />
            <circle cx={24} cy={56} r={2.5} fill="rgba(126,126,140,0.22)" />
            <circle cx={58} cy={20} r={1.8} fill="rgba(136,136,150,0.16)" />
            <circle cx={48} cy={85} r={2} fill="rgba(130,130,144,0.18)" />
            <circle cx={70} cy={68} r={2.2} fill="rgba(132,132,146,0.17)" />

            {/* Subtle surface texture highlights */}
            <ellipse cx={55} cy={30} rx={8} ry={5} fill="rgba(190,190,200,0.08)" />
            <ellipse cx={38} cy={75} rx={6} ry={4} fill="rgba(118,118,132,0.1)" />
          </g>

          {/* ── Phase shadow ── */}
          {/* Dark glow layer (blurred, extends slightly past terminator) */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="rgba(10, 6, 24, 0.45)"
            mask={`url(#${uid}-mask)`}
            filter={`url(#${uid}-glow)`}
          />
          {/* Solid shadow layer */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="rgba(10, 6, 24, 0.82)"
            mask={`url(#${uid}-mask)`}
          />

          {/* ── Rim ── */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="rgba(210,220,238,0.18)"
            strokeWidth="0.8"
          />
        </svg>
        <span className="moon-phase-name">{name}</span>
      </div>
    </div>
  );
}

export default MoonPhase;
