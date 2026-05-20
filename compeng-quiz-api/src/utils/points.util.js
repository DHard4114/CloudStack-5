function calculatePoints(isCorrect, timeTakenMs, timeLimitSeconds, basePoints = 1000) {
  if (!isCorrect) return 0;
  const ratio = Math.max(0, Math.min(1, 1 - timeTakenMs / (timeLimitSeconds * 1000)));
  return Math.round(basePoints * (0.5 + 0.5 * ratio));
}
module.exports = { calculatePoints };
