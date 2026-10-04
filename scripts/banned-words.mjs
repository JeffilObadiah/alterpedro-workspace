// DEC-005 single door. While SPRINT_PRICE is unset these must not appear anywhere in the built output
// (list from ALTERPEDRO_SINGLE_DOOR_COPY.md: Solution Sprint, Sprint, credited, credit, price, [PRICE], Door 1, Door 2).
// Matching is case-insensitive substring on purpose (stricter than whole-word): "prices", "pricing" and "credits" also fail.
export const BANNED_WORDS = ['Solution Sprint', 'Sprint', 'credited', 'credit', 'price', '[PRICE]', 'Door 1', 'Door 2'];
export const BANNED_RE = /sprint|credit|pric(?:e|ing)|door\s*[12]/i; // covers every entry above ("[PRICE]" contains "price"); "pricing" added
export function bannedHits(text, label = 'text') {
  const hits = [];
  for (const m of text.matchAll(new RegExp(BANNED_RE.source, 'gi'))) {
    const from = Math.max(0, m.index - 30);
    hits.push(`${label}: "${m[0]}" in …${text.slice(from, m.index + m[0].length + 30).replace(/\s+/g, ' ')}…`);
    if (hits.length >= 5) break;
  }
  return hits;
}
