/**
 * Formats a numeric score with a leading '+' sign for positive values.
 * Zero returns '0', negative returns the raw number string (already has '-').
 *
 * @param {number} n
 * @returns {string}
 */
export function formatScore(n) {
  if (n > 0) return `+${n}`;
  return String(n);
}

/**
 * Returns the CSS class name that corresponds to a score's polarity.
 *
 * @param {number} score
 * @returns {'positive'|'negative'|'neutral'}
 */
export function getScoreClass(score) {
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}
