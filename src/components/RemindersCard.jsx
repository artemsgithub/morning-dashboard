import { useState, useEffect } from "react";
import { Bell, Settings2 } from "lucide-react";
import RemindersModal from "./RemindersModal";

const STORAGE_KEY = "morning-dashboard-reminders";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function loadReminders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReminders(reminders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

/** Days until the next occurrence of a given day-of-week (0-6) */
function daysUntil(dayOfWeek) {
  const today = new Date().getDay();
  const diff = (dayOfWeek - today + 7) % 7;
  return diff;
}

function labelForReminder(r) {
  const days = daysUntil(r.dayOfWeek);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return DAY_NAMES[r.dayOfWeek];
}

function RemindersCard() {
  const [reminders, setReminders] = useState(loadReminders);
  const [modalOpen, setModalOpen] = useState(false);

  // Sort reminders by upcoming
  const sorted = [...reminders].sort(
    (a, b) => daysUntil(a.dayOfWeek) - daysUntil(b.dayOfWeek)
  );

  // Reload from storage when modal closes (in case it was edited)
  useEffect(() => {
    if (!modalOpen) setReminders(loadReminders());
  }, [modalOpen]);

  return (
    <>
      <div className="card reminders-card">
        <div className="card-header">
          <Bell size={20} />
          <h2>Reminders</h2>
          <button
            className="reminders-manage-btn"
            onClick={() => setModalOpen(true)}
            title="Manage reminders"
            aria-label="Manage reminders"
          >
            <Settings2 size={16} />
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="reminders-empty">
            No reminders yet. Tap the gear to add one.
          </p>
        ) : (
          <ul className="reminders-list">
            {sorted.slice(0, 4).map((r) => {
              const isToday = daysUntil(r.dayOfWeek) === 0;
              return (
                <li
                  key={r.id}
                  className={`reminder-item ${isToday ? "reminder-today" : ""}`}
                >
                  <span className="reminder-title">{r.title}</span>
                  <span className="reminder-day">{labelForReminder(r)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {modalOpen && (
        <RemindersModal
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

export default RemindersCard;
