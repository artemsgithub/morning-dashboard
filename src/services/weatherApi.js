const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE = "https://api.openweathermap.org";

/**
 * OpenWeatherMap API service
 *
 * Free tier endpoints used:
 *  - Current weather:  /data/2.5/weather
 *  - 5-day forecast:   /data/2.5/forecast  (3-hour intervals)
 *  - Air pollution:    /data/2.5/air_pollution
 *
 * All requests use imperial units (°F, mph).
 */

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** Current conditions — temp, humidity, wind, sunrise/sunset, etc. */
export async function getCurrentWeather(lat, lon) {
  return fetchJson(
    `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
  );
}

/** 5-day / 3-hour forecast — used for hourly strip & rain prediction */
export async function getForecast(lat, lon) {
  return fetchJson(
    `${BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
  );
}

/** Air quality index */
export async function getAirQuality(lat, lon) {
  return fetchJson(
    `${BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

/** Geocode a city name to lat/lon */
export async function geocode(cityName, limit = 1) {
  return fetchJson(
    `${BASE}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=${limit}&appid=${API_KEY}`
  );
}

/**
 * Fetch all weather data in parallel for a given lat/lon.
 * Returns the raw API responses — transformation into our
 * component data shape will be handled separately.
 */
export async function fetchAllWeatherData(lat, lon) {
  const [current, forecast, airQuality] = await Promise.all([
    getCurrentWeather(lat, lon),
    getForecast(lat, lon),
    getAirQuality(lat, lon),
  ]);

  return { current, forecast, airQuality };
}

export default { getCurrentWeather, getForecast, getAirQuality, geocode, fetchAllWeatherData };
