import { useState, useEffect } from "react";
import { X, Plus, Pencil, Trash2, Check, Repeat } from "lucide-react";
import { loadReminders, saveReminders } from "./RemindersCard";

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

const emptyDraft = { title: "", dayOfWeek: 1, recurring: true };

function RemindersModal({ onClose }) {
  const [reminders, setReminders] = useState(loadReminders);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null); // null = not adding/editing

  // Persist on every change
  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function startAdd() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  function startEdit(r) {
    setEditingId(r.id);
    setDraft({ title: r.title, dayOfWeek: r.dayOfWeek, recurring: r.recurring });
  }

  function cancelDraft() {
    setDraft(null);
    setEditingId(null);
  }

  function saveDraft() {
    if (!draft.title.trim()) return;

    if (editingId) {
      setReminders((rs) =>
        rs.map((r) => (r.id === editingId ? { ...r, ...draft } : r))
      );
    } else {
      setReminders((rs) => [
        ...rs,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...draft },
      ]);
    }
    cancelDraft();
  }

  function deleteReminder(id) {
    setReminders((rs) => rs.filter((r) => r.id !== id));
    if (editingId === id) cancelDraft();
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-label="Reminders">
        <div className="modal-header">
          <h2>Reminders</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          {reminders.length === 0 && !draft && (
            <p className="reminders-empty">
              No reminders yet — add your first one below.
            </p>
          )}

          {reminders.length > 0 && (
            <ul className="modal-reminders-list">
              {reminders.map((r) => (
                <li key={r.id} className="modal-reminder-item">
                  <div className="modal-reminder-info">
                    <span className="modal-reminder-title">{r.title}</span>
                    <span className="modal-reminder-meta">
                      {DAY_NAMES[r.dayOfWeek]}
                      {r.recurring && (
                        <>
                          {" · "}
                          <Repeat size={12} style={{ verticalAlign: "middle" }} />
                          {" Weekly"}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="modal-reminder-actions">
                    <button
                      onClick={() => startEdit(r)}
                      aria-label="Edit"
                      className="icon-btn"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteReminder(r.id)}
                      aria-label="Delete"
                      className="icon-btn icon-btn-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {draft ? (
            <div className="reminder-form">
              <input
                type="text"
                className="reminder-input"
                placeholder="Reminder title (e.g. Trash Day)"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                autoFocus
              />
              <div className="reminder-form-row">
                <label className="reminder-form-label">Day</label>
                <select
                  className="reminder-select"
                  value={draft.dayOfWeek}
                  onChange={(e) =>
                    setDraft({ ...draft, dayOfWeek: parseInt(e.target.value, 10) })
                  }
                >
                  {DAY_NAMES.map((name, i) => (
                    <option key={i} value={i}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="reminder-form-row reminder-checkbox">
                <input
                  type="checkbox"
                  checked={draft.recurring}
                  onChange={(e) =>
                    setDraft({ ...draft, recurring: e.target.checked })
                  }
                />
                <span>Repeat weekly</span>
              </label>
              <div className="reminder-form-actions">
                <button className="btn-secondary" onClick={cancelDraft}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={saveDraft}>
                  <Check size={16} />
                  {editingId ? "Save" : "Add"}
                </button>
              </div>
            </div>
          ) : (
            <button className="add-reminder-btn" onClick={startAdd}>
              <Plus size={18} />
              Add reminder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RemindersModal;
