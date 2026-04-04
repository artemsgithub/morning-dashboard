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
];

export function getRandomAffirmation() {
  return affirmations[Math.floor(Math.random() * affirmations.length)];
}

export default affirmations;
