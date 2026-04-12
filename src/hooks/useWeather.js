import { useState, useEffect, useCallback } from "react";
import { fetchAllWeatherData } from "../services/weatherApi";
import { transformWeatherData } from "../services/transformWeather";
import placeholderWeather from "../data/placeholderWeather";

// 46240 — Indianapolis, IN
const LAT = 39.9087;
const LON = -86.1225;

// Bump this when the cached data shape changes so old clients invalidate.
const CACHE_VERSION = 2;
const CACHE_KEY = "morning-dashboard-weather";
const INDIANA_TZ = "America/Indiana/Indianapolis";

// Refresh cadence — enough to catch rolling weather changes for the
// screensaver scene, but cheap on API quota (8 calls/day).
const REFRESH_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours

/** Get current hour in Indiana time */
function indianaHour() {
  return parseInt(
    new Date().toLocaleString("en-US", {
      timeZone: INDIANA_TZ,
      hour: "numeric",
      hour12: false,
    }),
    10
  );
}

/** Get today's date string in Indiana time */
function indianaDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: INDIANA_TZ });
}

/** Load cached weather from localStorage */
function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Invalidate stale schemas — e.g. old caches with only 7 hourly entries
    // and no dayLabel field will vanish and force a refetch.
    if (parsed?._v !== CACHE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Save weather to localStorage */
function saveCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, _v: CACHE_VERSION }));
}

/**
 * Should we fetch fresh data?
 * - Yes if no cache exists
 * - Yes if cached data is from a different day (Indiana time)
 * - Yes if it's 7am+ Indiana time and data was fetched before 7am today
 * - Yes if more than REFRESH_INTERVAL_MS has elapsed since last fetch
 */
function shouldFetch(cached) {
  if (!cached || !cached.fetchedAt) return true;

  const fetchedAt = new Date(cached.fetchedAt).getTime();
  const now = Date.now();

  // Stale by interval — keeps the screensaver scene in sync with actual sky
  if (now - fetchedAt > REFRESH_INTERVAL_MS) return true;

  const today = indianaDate();
  const cachedDate = new Date(cached.fetchedAt).toLocaleDateString("en-CA", {
    timeZone: INDIANA_TZ,
  });

  // Different day — always refresh
  if (cachedDate !== today) return true;

  // Same day — refresh if it's past 7am and data was fetched before 7am
  const cachedHour = parseInt(
    new Date(cached.fetchedAt).toLocaleString("en-US", {
      timeZone: INDIANA_TZ,
      hour: "numeric",
      hour12: false,
    }),
    10
  );
  const currentHour = indianaHour();

  if (currentHour >= 7 && cachedHour < 7) return true;

  return false;
}

export default function useWeather() {
  const cached = loadCache();
  const [weather, setWeather] = useState(cached || placeholderWeather);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchAllWeatherData(LAT, LON);
      const data = transformWeatherData(raw);
      setWeather(data);
      saveCache(data);
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setError(err.message);
      // Keep showing cached/placeholder data
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch if needed
  useEffect(() => {
    if (shouldFetch(cached)) {
      fetchWeather();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check every minute if it's time to refresh (catches the 7am crossover)
  useEffect(() => {
    const id = setInterval(() => {
      const current = loadCache();
      if (shouldFetch(current)) {
        fetchWeather();
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [fetchWeather]);

  // Refresh when the user wakes the dashboard from the screensaver.
  useEffect(() => {
    const onWake = () => fetchWeather();
    window.addEventListener("dashboard-wake", onWake);
    return () => window.removeEventListener("dashboard-wake", onWake);
  }, [fetchWeather]);

  return { weather, loading, error, refresh: fetchWeather };
}
