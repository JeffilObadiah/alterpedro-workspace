// Booking link rule, shared by src/pages/index.astro (build-time throw) and scripts/check-build.mjs.
// Under PRODUCTION=1 the link must be a public cal.com URL. Returns null if OK, else a human-readable problem.
export const ALLOWED_PREFIXES = ['https://cal.com/', 'https://app.cal.com/'];
export function bookingProblem(url) {
  if (url === undefined || url === null || String(url).trim() === '') return 'BOOKING_URL is not set';
  const u = String(url).trim();
  if (u === '#book') return 'booking link is still the "#book" placeholder';
  const prefix = ALLOWED_PREFIXES.find((p) => u.startsWith(p));
  if (!prefix) return `BOOKING_URL must start with ${ALLOWED_PREFIXES.join(' or ')} (got "${u}")`;
  if (u.length === prefix.length) return 'BOOKING_URL has no path after the cal.com host';
  if (/[\s"'<>]/.test(u)) return 'BOOKING_URL contains whitespace or quote characters';
  return null;
}
