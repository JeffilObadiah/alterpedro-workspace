import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import chipData from '../src/data/chips.json';

const research = readFileSync(new URL('./fixtures/research.md', import.meta.url), 'utf8');
const chips = chipData.chips;

describe('hero example chips', () => {
  it('has 6 to 8 chips', () => {
    expect(chips.length).toBeGreaterThanOrEqual(6);
    expect(chips.length).toBeLessThanOrEqual(8);
  });
  it('every chip phrase appears verbatim (case and punctuation) in the research file', () => {
    for (const c of chips) expect(research, c.text).toContain(c.text);
  });
  it('every chip is declared as autocomplete or forum wording, and cites a section that contains it', () => {
    for (const c of chips) {
      expect(['autocomplete', 'forum']).toContain(c.from);
      const start = research.indexOf(`### ${c.section} `);
      expect(start, `section ${c.section}`).toBeGreaterThan(-1);
      const end = research.indexOf('\n### ', start + 5);
      expect(research.slice(start, end === -1 ? undefined : end), c.text).toContain(c.text);
    }
  });
  it('no duplicates', () => {
    expect(new Set(chips.map((c) => c.text)).size).toBe(chips.length);
  });
  it('the research file itself says where the forum phrases come from (sanity: file is the real one)', () => {
    expect(research).toContain('Google autocomplete');
    expect(research).toContain('3.7 Inventory');
  });
});
