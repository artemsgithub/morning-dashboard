/**
 * Returns a short "what to wear" recommendation based on current weather.
 * Combines a temperature-based base layer with rain/wind/condition modifiers.
 *
 * Inputs use imperial units (°F, mph) to match the rest of the app.
 */
export function getOutfitSuggestion(weather) {
  if (!weather || typeof weather.temperature !== "number") {
    return "Loading…";
  }

  const base = baseLayer(weather.temperature);
  const mods = modifiers(weather);
  return mods.length ? `${base} — ${mods.join(", ")}` : base;
}

function baseLayer(temp) {
  if (temp < 20) return "Bitter cold, bundle up";
  if (temp < 35) return "Heavy coat weather";
  if (temp < 50) return "Coat and scarf";
  if (temp < 60) return "Light jacket";
  if (temp < 70) return "Sweater weather";
  if (temp < 80) return "T-shirt and shorts";
  if (temp < 90) return "Light layers, stay hydrated";
  return "Hot — shorts and water";
}

function modifiers({ temperature, condition, conditionIcon, rain, windSpeed }) {
  const out = [];

  // Snow / sleet take priority over generic rain
  const cond = (condition || "").toLowerCase();
  const isSnow = cond.includes("snow") || conditionIcon === "cloud-snow";
  const isStorm = conditionIcon === "cloud-lightning";

  if (isSnow) {
    out.push("boots for snow");
  } else if (isStorm) {
    out.push("storms — stay dry");
  } else if (rain?.chance >= 70) {
    out.push("umbrella's a must");
  } else if (rain?.chance >= 40) {
    out.push("umbrella just in case");
  }

  if (windSpeed >= 20) {
    out.push("it's gusty");
  } else if (windSpeed >= 12 && temperature < 55) {
    out.push("wind cuts through");
  }

  if (temperature >= 85 && cond.includes("clear")) {
    out.push("don't skip sunscreen");
  }

  return out;
}
