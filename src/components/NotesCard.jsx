import { useState, useEffect } from "react";
import { StickyNote } from "lucide-react";

const STORAGE_KEY = "morning-dashboard-note";

function NotesCard() {
  const [note, setNote] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setNote(saved);
  }, []);

  function handleChange(e) {
    setNote(e.target.value);
    localStorage.setItem(STORAGE_KEY, e.target.value);
  }

  return (
    <div className="card notes-card">
      <div className="card-header">
        <StickyNote size={20} />
        <h2>Leave a Note</h2>
      </div>
      <textarea
        className="notes-textarea"
        placeholder="Write yourself a note for tomorrow..."
        value={note}
        onChange={handleChange}
        rows={6}
      />
    </div>
  );
}

export default NotesCard;
