import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getDailyAffirmation, getNextAffirmation } from "../data/affirmations";

function AffirmationCard() {
  const [affirmation, setAffirmation] = useState(getDailyAffirmation);

  function refresh() {
    setAffirmation(getNextAffirmation());
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
