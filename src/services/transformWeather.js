/**
 * Transform raw OpenWeatherMap API responses into the shape
 * our WeatherCard component expects.
 */

// Map OWM icon codes to our Lucide icon keys
// https://openweathermap.org/weather-conditions
const owmIconMap = {
  "01d": "sun",
  "01n": "moon",
  "02d": "cloud-sun",
  "02n": "cloud-sun",
  "03d": "cloud",
  "03n": "cloud",
  "04d": "cloud",
  "04n": "cloud",
  "09d": "cloud-drizzle",
  "09n": "cloud-drizzle",
  "10d": "cloud-rain",
  "10n": "cloud-rain",
  "11d": "cloud-lightning",
  "11n": "cloud-lightning",
  "13d": "cloud-snow",
  "13n": "cloud-snow",
  "50d": "cloud-fog",
  "50n": "cloud-fog",
};

// Wind degree to compass direction
function degToDirection(deg) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Unix timestamp to formatted time string in Indiana timezone
function formatTime(unix, options = {}) {
  return new Date(unix * 1000).toLocaleTimeString("en-US", {
    timeZone: "America/Indiana/Indianapolis",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  });
}

function formatHour(unix) {
  return new Date(unix * 1000).toLocaleTimeString("en-US", {
    timeZone: "America/Indiana/Indianapolis",
    hour: "numeric",
  });
}

/**
 * OWM Air Pollution API returns its own 1-5 scale.
 * We convert the raw PM2.5 value to the EPA AQI 0-500 scale
 * that our gauge expects.
 */
function pm25ToAqi(pm25) {
  const breakpoints = [
    { cLow: 0,     cHigh: 12,    iLow: 0,   iHigh: 50 },
    { cLow: 12.1,  cHigh: 35.4,  iLow: 51,  iHigh: 100 },
    { cLow: 35.5,  cHigh: 55.4,  iLow: 101, iHigh: 150 },
    { cLow: 55.5,  cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
  ];

  for (const bp of breakpoints) {
    if (pm25 <= bp.cHigh) {
      return Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow
      );
    }
  }
  return 500; // beyond scale
}

function aqiLabel(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

/**
 * Find the first rain entry in the forecast and describe when.
 */
function findRain(forecastList) {
  const rainEntries = forecastList.filter(
    (item) => item.rain && item.rain["3h"] > 0
  );

  if (rainEntries.length === 0) {
    return { willRain: false, chance: 0, when: "" };
  }

  // Use pop (probability of precipitation) from the first rainy period
  const first = rainEntries[0];
  const pop = Math.round((first.pop || 0) * 100);
  const when = formatTime(first.dt);

  return {
    willRain: true,
    chance: Math.max(pop, 10), // at least show something if rain data exists
    when: `Around ${when}`,
  };
}

/**
 * Main transform: takes raw { current, forecast, airQuality }
 * and returns the shape WeatherCard expects.
 */
export function transformWeatherData({ current, forecast, airQuality }) {
  // Current conditions
  const condition = current.weather[0];
  const iconCode = condition.icon;

  // Hourly — take the next 7 forecast entries (3-hour intervals)
  const hourly = forecast.list.slice(0, 7).map((item) => ({
    time: formatHour(item.dt),
    temp: Math.round(item.main.temp),
    icon: owmIconMap[item.weather[0].icon] || "cloud",
  }));

  // Hi/Lo from today's forecast entries
  const todayDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Indiana/Indianapolis",
  });
  const todayEntries = forecast.list.filter((item) => {
    const d = new Date(item.dt * 1000).toLocaleDateString("en-CA", {
      timeZone: "America/Indiana/Indianapolis",
    });
    return d === todayDate;
  });

  const temps = todayEntries.map((e) => e.main.temp);
  const high = temps.length > 0 ? Math.round(Math.max(...temps)) : Math.round(current.main.temp_max);
  const low = temps.length > 0 ? Math.round(Math.min(...temps)) : Math.round(current.main.temp_min);

  // Air quality — use PM2.5 to calculate EPA AQI
  const pm25 = airQuality.list[0]?.components?.pm2_5 || 0;
  const aqiValue = pm25ToAqi(pm25);

  // Rain prediction from forecast
  const rain = findRain(forecast.list.slice(0, 8)); // next 24h

  // Max pop from today's forecast as a fallback rain chance
  if (!rain.willRain) {
    const maxPop = Math.max(...forecast.list.slice(0, 8).map((e) => e.pop || 0));
    if (maxPop > 0.1) {
      rain.willRain = true;
      rain.chance = Math.round(maxPop * 100);
      const rainEntry = forecast.list.slice(0, 8).find((e) => (e.pop || 0) === maxPop);
      rain.when = rainEntry ? `Around ${formatTime(rainEntry.dt)}` : "Today";
    }
  }

  return {
    location: `${current.name}`,
    temperature: Math.round(current.main.temp),
    feelsLike: Math.round(current.main.feels_like),
    high,
    low,
    condition: condition.main,
    conditionIcon: owmIconMap[iconCode] || "cloud",
    humidity: current.main.humidity,
    windSpeed: Math.round(current.wind.speed),
    windDirection: degToDirection(current.wind.deg),
    airQuality: {
      index: aqiValue,
      label: aqiLabel(aqiValue),
    },
    sunrise: formatTime(current.sys.sunrise, { minute: "2-digit" }),
    sunset: formatTime(current.sys.sunset, { minute: "2-digit" }),
    rain,
    hourly,
    fetchedAt: Date.now(),
  };
}
