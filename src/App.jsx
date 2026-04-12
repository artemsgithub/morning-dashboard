import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import ClockHeader from "./components/ClockHeader";
import WeatherCard from "./components/WeatherCard";
import RemindersCard from "./components/RemindersCard";
import AffirmationCard from "./components/AffirmationCard";
import BarometricModal from "./components/BarometricModal";
import Screensaver from "./components/Screensaver";
import useWakeLock from "./hooks/useWakeLock";
import useWeather from "./hooks/useWeather";
import useInactivity from "./hooks/useInactivity";
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
  const { weather } = useWeather();
  const [showBaro, setShowBaro] = useState(false);

  // Show screensaver by default on launch and after 5 min idle.
  const [asleep, setAsleep] = useState(true);
  const [exiting, setExiting] = useState(false);
  const { idle, reset } = useInactivity(5 * 60 * 1000);

  // Auto-sleep when inactivity fires
  useEffect(() => {
    if (idle && !asleep) {
      setExiting(false);
      setAsleep(true);
    }
  }, [idle, asleep]);

  const wake = () => {
    if (exiting) return;
    setExiting(true);
    // Let the reveal animation play, then drop the overlay.
    setTimeout(() => {
      setAsleep(false);
      setExiting(false);
      reset();
      // Signal weather to refresh so the user sees current data.
      window.dispatchEvent(new Event("dashboard-wake"));
    }, 700);
  };

  return (
    <>
      <div className={`dashboard ${isNight ? "night-mode" : ""}`}>
        <ClockHeader />

        <button
          className="baro-fab"
          onClick={() => setShowBaro(true)}
          title="Barometric pressure"
          aria-label="Barometric pressure"
        >
          <Activity size={18} />
        </button>

        <div className="dashboard-grid">
          <WeatherCard />
          <div className="dashboard-sidebar">
            <AffirmationCard />
            <RemindersCard />
          </div>
        </div>
      </div>

      {showBaro && (
        <BarometricModal
          pressure={weather.pressure}
          onClose={() => setShowBaro(false)}
        />
      )}
      {asleep && <Screensaver onWake={wake} exiting={exiting} />}
    </>
  );
}

export default App;
