// Tests for scripts/check-build.mjs against small fixture "dist" folders (independent of a real build).
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import chipData from '../src/data/chips.json';
import { bookingProblem } from '../scripts/booking.mjs';

const root = mkdtempSync(join(tmpdir(), 'ap-check-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));
const script = new URL('../scripts/check-build.mjs', import.meta.url).pathname;
const CSS = '.btn-primary{background:var(--color-neutral-900);color:var(--color-text-on-ink)}.accent{color:var(--color-accent-text)}:focus-visible{outline:2px solid var(--focus-ring-color)}';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

interface Opts { href?: string; chips?: string[]; chipClass?: string; extraBody?: string }
let n = 0;
function fixture(o: Opts = {}) {
  const dir = join(root, `d${n++}`);
  mkdirSync(dir);
  const chips = (o.chips ?? chipData.chips.map((c) => c.text)).map((t) => `<button type="button" class="btn btn-ghost btn-sm chip${o.chipClass ?? ''}" data-chip="${esc(t)}">${esc(t)}</button>`).join('');
  writeFileSync(join(dir, 'index.html'), `<!doctype html><style>${CSS}</style><body>${chips}<a class="accent" href="${o.href ?? '#book'}">Book</a><button class="btn btn-primary">Start</button>${o.extraBody ?? ''}</body>`);
  return dir;
}
function run(dir: string, env: Record<string, string> = {}) {
  const base = { ...process.env } as Record<string, string | undefined>;
  delete base.PRODUCTION; delete base.BOOKING_URL; delete base.SPRINT_PRICE;
  const r = spawnSync(process.execPath, [script], { env: { ...base, ...env, DIST_DIR: dir }, encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

describe('bookingProblem()', () => {
  it('accepts the real booking link', () => expect(bookingProblem('https://cal.com/alter-pedro-discovery')).toBeNull());
  it('accepts cal.com and app.cal.com links', () => {
    expect(bookingProblem('https://cal.com/alter/20min')).toBeNull();
    expect(bookingProblem('https://app.cal.com/alter/20min')).toBeNull();
  });
  it.each([undefined, '', '   ', '#book', 'http://cal.com/alter', 'https://cal.com/', 'https://cal.com.evil.example/x', 'https://evil.example/https://cal.com/x', 'https://calendly.com/alter', 'cal.com/alter', 'https://cal.com/a b', 'https://cal.com/a"onmouseover="x'])('rejects %j', (v) => {
    expect(bookingProblem(v as string | undefined)).not.toBeNull();
  });
});

describe('check-build: booking link under PRODUCTION=1', () => {
  const price = {}; // single-door mode (SPRINT_PRICE unset) -- the "[PRICE]" test below sets its own env
  it('FAILS when BOOKING_URL is unset', () => {
    const r = run(fixture({ href: '#book' }), { PRODUCTION: '1', ...price });
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/BOOKING_URL is not set/);
  });
  it('FAILS when the link is still #book even if BOOKING_URL is cal.com', () => {
    const r = run(fixture({ href: '#book' }), { PRODUCTION: '1', BOOKING_URL: 'https://cal.com/alter/20min', ...price });
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/#book/);
  });
  it('FAILS for a non-cal.com URL', () => {
    const r = run(fixture({ href: 'https://calendly.com/alter' }), { PRODUCTION: '1', BOOKING_URL: 'https://calendly.com/alter', ...price });
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/must start with https:\/\/cal\.com\//);
  });
  it('FAILS for an http:// cal.com URL', () => {
    expect(run(fixture({ href: 'http://cal.com/alter' }), { PRODUCTION: '1', BOOKING_URL: 'http://cal.com/alter', ...price }).code).toBe(1);
  });
  it('FAILS when the page does not link to the configured BOOKING_URL', () => {
    const r = run(fixture({ href: 'https://cal.com/other' }), { PRODUCTION: '1', BOOKING_URL: 'https://cal.com/alter/20min', ...price });
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/does not link to BOOKING_URL/);
  });
  it.each(['https://cal.com/alter/20min', 'https://app.cal.com/alter/20min'])('passes with %s', (u) => {
    const r = run(fixture({ href: u }), { PRODUCTION: '1', BOOKING_URL: u, ...price });
    expect(r.out).toMatch(/check-build: OK/);
    expect(r.code).toBe(0);
  });
  it('dev/non-production builds are unaffected by #book', () => {
    const r = run(fixture({ href: '#book' }));
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/check-build: OK/);
  });
});

describe('check-build: [PRICE] and chips', () => {
  it('PRODUCTION=1 fails on [PRICE]', () => {
    const r = run(fixture({ href: 'https://cal.com/a', extraBody: '<p>[PRICE]</p>' }), { PRODUCTION: '1', BOOKING_URL: 'https://cal.com/a' });
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/\[PRICE\]/);
  });
  it('fails on a chip phrase that is not verbatim in the research file', () => {
    const r = run(fixture({ chips: [...chipData.chips.map((c) => c.text).slice(0, 6), 'we need an app for our drivers'] }));
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/not found verbatim in the research file/);
  });
  it('fails with fewer than 6 or more than 8 chips', () => {
    expect(run(fixture({ chips: chipData.chips.map((c) => c.text).slice(0, 5) })).code).toBe(1);
    const nine = [...chipData.chips.map((c) => c.text), 'stock mismatch', 'disconnected systems'];
    expect(run(fixture({ chips: nine })).code).toBe(1);
  });
  it('fails when a chip uses the wine accent class', () => {
    const r = run(fixture({ chipClass: ' accent' }));
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/accent/);
  });
  it('passes with the real chips and the accent budget intact', () => {
    expect(run(fixture()).code).toBe(0);
  });
});
