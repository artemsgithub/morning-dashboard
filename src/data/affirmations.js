// Placeholder affirmations — will be replaced by database later
const affirmations = [
  "You are exactly where you need to be.",
  "Today is full of possibility.",
  "You bring something unique to this world.",
  "Your presence matters more than your productivity.",
  "Breathe in calm, breathe out tension.",
  "You are capable of wonderful things.",
  "Progress, not perfection.",
  "The sun rises for you too.",
  "Trust the timing of your life.",
  "You are worthy of good things.",
  "Small steps still move you forward.",
  "You are growing, even when it doesn't feel like it.",
  "Let go of what you cannot control.",
  "Your energy is a gift — spend it wisely.",
  "Be gentle with yourself today.",
  "Rest is not a reward — it's a requirement.",
  "You don't have to earn your place here.",
  "Softness is its own kind of strength.",
  "The morning is patient. You can be too.",
  "You are allowed to take up space.",
  "Something good is quietly on its way.",
  "Your pace is the right pace.",
  "You've already survived every hard day before this one.",
  "Let today be easier than yesterday.",
  "You are the warm light in someone's ordinary day.",
  "Not every moment has to mean something.",
  "You can begin again, right now.",
  "The world is better with you awake in it.",
  "What you notice, you nurture — notice the good.",
  "You do not have to be finished to be whole.",
  "Let the small joys count. They add up.",
  "You are allowed to change your mind.",
  "Steady hands, open heart.",
  "Your quiet work is still work.",
  "Today does not have to be productive to be meaningful.",
  "You are a good friend to yourself today.",
  "Kindness counts, even when it's yours for you.",
  "The day is long — take it one hour at a time.",
  "You have weathered storms; a little rain is nothing.",
  "Your story is still being written, and it's a good one.",
  "You don't have to hurry to arrive.",
  "Let beauty find you in ordinary places.",
  "You are permitted to enjoy this.",
  "Grace is always available. So is another deep breath.",
  "The best thing you do today might be rest.",
  "You are more than your hardest thoughts.",
  "Warmth, light, and one good cup of something — that's enough to start.",
  "You don't owe anyone a performance today.",
  "Tend to yourself like a garden you love.",
  "A gentle day is still a full day.",
];

export function getRandomAffirmation() {
  return affirmations[Math.floor(Math.random() * affirmations.length)];
}

// ── Daily-rotation picker ──────────────────────────────────────────
// A shuffled queue of indices is kept in localStorage. Each call that
// needs a fresh pick pops the front of the queue. When the queue is
// empty, we reshuffle — and make sure the just-seen affirmation isn't
// the first one out of the new deck, so there's never a back-to-back
// repeat across cycles. Every affirmation is shown once before any
// affirmation repeats.

const STATE_KEY = "morning-dashboard-affirmation-state";

function todayString() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

/** Fisher–Yates shuffle of [0..n-1] */
function shuffledIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    // If the pool size changed (affirmations.js was edited), invalidate
    // so the new entries get mixed in on the next reshuffle.
    if (state.poolSize !== affirmations.length) {
      return { todayIndex: state.todayIndex, todayDate: state.todayDate };
    }
    return state;
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(
    STATE_KEY,
    JSON.stringify({ ...state, poolSize: affirmations.length })
  );
}

/** Build a fresh shuffled queue that doesn't start with `avoidIndex`. */
function buildQueue(avoidIndex) {
  const queue = shuffledIndices(affirmations.length);
  if (avoidIndex != null && queue.length > 1 && queue[0] === avoidIndex) {
    // Send the duplicate to the back of the new cycle.
    [queue[0], queue[queue.length - 1]] = [queue[queue.length - 1], queue[0]];
  }
  return queue;
}

/** Pop the next index, reshuffling when the queue is empty. */
function pickNext(state) {
  let queue = state?.queue ?? [];
  if (queue.length === 0) {
    queue = buildQueue(state?.todayIndex);
  }
  const [index, ...rest] = queue;
  return { index, queue: rest };
}

/**
 * Today's affirmation — stable for the whole day. First call on a new
 * day advances the queue; later calls on the same day return the same
 * pick without mutating anything.
 */
export function getDailyAffirmation() {
  const state = loadState();
  const today = todayString();

  if (state && state.todayDate === today && state.todayIndex != null) {
    return affirmations[state.todayIndex];
  }

  const { index, queue } = pickNext(state);
  saveState({ queue, todayIndex: index, todayDate: today });
  return affirmations[index];
}

/**
 * Manually advance to the next affirmation (for the "New affirmation"
 * button). Always pops the queue, so the user can walk through the
 * whole rotation without ever seeing a duplicate.
 */
export function getNextAffirmation() {
  const state = loadState();
  const { index, queue } = pickNext(state);
  saveState({ queue, todayIndex: index, todayDate: todayString() });
  return affirmations[index];
}

export default affirmations;
