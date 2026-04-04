import ClockHeader from "./components/ClockHeader";
import WeatherCard from "./components/WeatherCard";
import NotesCard from "./components/NotesCard";
import AffirmationCard from "./components/AffirmationCard";
import "./App.css";

function App() {
  return (
    <div className="dashboard">
      <ClockHeader />
      <div className="dashboard-grid">
        <WeatherCard />
        <div className="dashboard-sidebar">
          <AffirmationCard />
          <NotesCard />
        </div>
      </div>
    </div>
  );
}

export default App;
