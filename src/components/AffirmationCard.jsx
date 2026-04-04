import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { getRandomAffirmation } from "../data/affirmations";

function AffirmationCard() {
  const [affirmation, setAffirmation] = useState("");

  useEffect(() => {
    setAffirmation(getRandomAffirmation());
  }, []);

  function refresh() {
    setAffirmation(getRandomAffirmation());
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
