/**
 * Moon phase calculation — purely from date, no API required.
 *
 * Based on a known new moon reference (Jan 6, 2000 18:14 UTC) and
 * the mean synodic month of 29.530588853 days.
 */

const SYNODIC_MONTH = 29.530588853;
const REFERENCE_NEW_MOON = new Date("2000-01-06T18:14:00Z").getTime();

/** Returns phase as a fraction 0..1 (0 = new moon, 0.5 = full moon) */
export function getMoonPhase(date = new Date()) {
  const diffDays = (date.getTime() - REFERENCE_NEW_MOON) / (1000 * 60 * 60 * 24);
  const phase = (diffDays % SYNODIC_MONTH) / SYNODIC_MONTH;
  return phase < 0 ? phase + 1 : phase;
}

/** Human-readable name for a phase value */
export function getMoonPhaseName(phase) {
  const p = phase * 8;
  if (p < 0.5 || p >= 7.5) return "New Moon";
  if (p < 1.5) return "Waxing Crescent";
  if (p < 2.5) return "First Quarter";
  if (p < 3.5) return "Waxing Gibbous";
  if (p < 4.5) return "Full Moon";
  if (p < 5.5) return "Waning Gibbous";
  if (p < 6.5) return "Last Quarter";
  return "Waning Crescent";
}
