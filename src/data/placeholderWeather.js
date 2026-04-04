const placeholderWeather = {
  location: "San Francisco, CA",
  temperature: 64,
  feelsLike: 61,
  high: 68,
  low: 54,
  condition: "Partly Cloudy",
  conditionIcon: "cloud-sun",
  humidity: 72,
  windSpeed: 12,
  windDirection: "NW",
  airQuality: {
    index: 42,
    label: "Good",
  },
  sunrise: "6:48 AM",
  sunset: "7:32 PM",
  rain: {
    willRain: true,
    chance: 35,
    when: "Late afternoon, around 4 PM",
  },
  hourly: [
    { time: "7 AM", temp: 56, icon: "sun" },
    { time: "9 AM", temp: 60, icon: "cloud-sun" },
    { time: "11 AM", temp: 64, icon: "cloud-sun" },
    { time: "1 PM", temp: 67, icon: "sun" },
    { time: "3 PM", temp: 68, icon: "cloud" },
    { time: "5 PM", temp: 63, icon: "cloud-rain" },
    { time: "7 PM", temp: 59, icon: "cloud" },
  ],
};

export default placeholderWeather;
