import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getRandomAffirmation } from "../data/affirmations";

const STORAGE_KEY = "morning-dashboard-affirmation";
const DATE_KEY = "morning-dashboard-affirmation-date";

function getTodayString() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function getDailyAffirmation() {
  const today = getTodayString();
  const savedDate = localStorage.getItem(DATE_KEY);
  const savedAffirmation = localStorage.getItem(STORAGE_KEY);

  if (savedDate === today && savedAffirmation) {
    return savedAffirmation;
  }

  const fresh = getRandomAffirmation();
  localStorage.setItem(STORAGE_KEY, fresh);
  localStorage.setItem(DATE_KEY, today);
  return fresh;
}

function AffirmationCard() {
  const [affirmation, setAffirmation] = useState(getDailyAffirmation);

  function refresh() {
    const fresh = getRandomAffirmation();
    localStorage.setItem(STORAGE_KEY, fresh);
    localStorage.setItem(DATE_KEY, getTodayString());
    setAffirmation(fresh);
  }

  return (
    <div className="card affirmation-card">
      <div className="card-header">
        <Sparkles size={20} />
        <h2>Daily Affirmation</h2>
      </div>
      <p className="affirmation-text">{affirmation}</p>
      <button className="affirmation-refresh" onClick={refresh}>
        New affirmation
      </button>
    </div>
  );
}

export default AffirmationCard;
