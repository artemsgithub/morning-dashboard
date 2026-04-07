import { useState, useEffect } from "react";
import ClockHeader from "./components/ClockHeader";
import WeatherCard from "./components/WeatherCard";
import RemindersCard from "./components/RemindersCard";
import AffirmationCard from "./components/AffirmationCard";
import useWakeLock from "./hooks/useWakeLock";
import "./App.css";

function useNightMode() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    function check() {
      const hour = new Date().getHours();
      setIsNight(hour >= 22 || hour < 6);
    }
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return isNight;
}

function App() {
  useWakeLock();
  const isNight = useNightMode();

  return (
    <div className={`dashboard ${isNight ? "night-mode" : ""}`}>
      <ClockHeader />
      <div className="dashboard-grid">
        <WeatherCard />
        <div className="dashboard-sidebar">
          <AffirmationCard />
          <RemindersCard />
        </div>
      </div>
    </div>
  );
}

export default App;
