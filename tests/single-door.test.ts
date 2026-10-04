// DEC-005 single door: SPRINT_PRICE unset => no Door 2 anywhere (page, engine prompt, engine output); set => two-door version.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import chipData from '../src/data/chips.json';
import { BANNED_RE, BANNED_WORDS, bannedHits } from '../scripts/banned-words.mjs';
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SINGLE_DOOR, SYSTEM_PROMPT_TWO_DOORS, getSystemPrompt } from '../src/prompt';
import { FALLBACK_QUESTION, blankModel, parseModelOutput } from '../src/schema';
import { buildMessages, sprintEnabled } from '../src/worker';
import { turn } from './helpers';

const root = mkdtempSync(join(tmpdir(), 'ap-door-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));
afterEach(() => vi.unstubAllGlobals());
const checker = new URL('../scripts/check-build.mjs', import.meta.url).pathname;
const astroBin = new URL('../node_modules/.bin/astro', import.meta.url).pathname;
const projectRoot = new URL('..', import.meta.url).pathname;
const cleanEnv = () => { const e = { ...process.env } as Record<string, string | undefined>; for (const k of ['PRODUCTION', 'BOOKING_URL', 'SPRINT_PRICE', 'HERO_VARIANT']) delete e[k]; return e; };

describe('banned-word list', () => {
  it('matches every word OGILVY listed (case-insensitive)', () => {
    for (const w of BANNED_WORDS) expect(BANNED_RE.test(w.toLowerCase()), w).toBe(true);
    for (const w of ['Prices', 'pricing', 'credits', 'door 2', 'DOOR  1']) expect(BANNED_RE.test(w), w).toBe(true);
    expect(BANNED_RE.test('Book 20 minutes. A free call.')).toBe(false);
  });
});

describe('engine prompt', () => {
  it('single-door prompt contains none of the banned words and ends with the call only', () => {
    expect(SYSTEM_PROMPT).toBe(SYSTEM_PROMPT_SINGLE_DOOR);
    expect(bannedHits(SYSTEM_PROMPT_SINGLE_DOOR)).toEqual([]);
    expect(SYSTEM_PROMPT_SINGLE_DOOR).toMatch(/only next step[^.]*free 20-minute call/);
    expect(SYSTEM_PROMPT_SINGLE_DOOR).not.toMatch(/paid/i);
  });
  it('two-door prompt may point to a paid session but never states an amount; both share the same cacheable prefix', () => {
    expect(SYSTEM_PROMPT_TWO_DOORS).toMatch(/paid half-day/);
    expect(SYSTEM_PROMPT_TWO_DOORS).toMatch(/Never state an amount/);
    expect(SYSTEM_PROMPT_TWO_DOORS).not.toMatch(/[$€£₹]/);
    const common = SYSTEM_PROMPT_SINGLE_DOOR.indexOf('\n\nCLOSING.');
    expect(SYSTEM_PROMPT_TWO_DOORS.slice(0, common)).toBe(SYSTEM_PROMPT_SINGLE_DOOR.slice(0, common));
  });
  it('the worker switch: default single door, SPRINT_PRICE override flips it', () => {
    expect(sprintEnabled({})).toBe(false); // src/site-config.json is generated with sprintEnabled=false when SPRINT_PRICE is unset
    expect(sprintEnabled({ SPRINT_PRICE: '' })).toBe(false);
    expect(sprintEnabled({ SPRINT_PRICE: '   ' })).toBe(false);
    expect(sprintEnabled({ SPRINT_PRICE: 'INR 1' })).toBe(true);
    expect(buildMessages(blankModel(), 'x', 0, false)[0].content).toBe(getSystemPrompt(false));
    expect(buildMessages(blankModel(), 'x', 0, false, true)[0].content).toBe(getSystemPrompt(true));
  });
  it('the request sent to the model carries the single-door prompt when SPRINT_PRICE is unset, the two-door prompt when set', async () => {
    const seen: string[] = [];
    vi.stubGlobal('fetch', async (_u: unknown, init: RequestInit) => {
      seen.push(JSON.parse(init.body as string).messages[0].content);
      return new Response(JSON.stringify({ choices: [{ message: { content: 'x' }, finish_reason: 'stop' }] }), { status: 200 });
    });
    const base = { SCAN_HMAC_SECRET: 'test-secret-0123456789-abcdefghijklmnop', MODEL_PROVIDER: 'deepseek', DEEPSEEK_API_KEY: 'sk-test-FAKE' };
    await turn(null, 'Our reports take all day.', 0, {}, base);
    await turn(null, 'Our reports take all day.', 0, {}, { ...base, SPRINT_PRICE: 'INR 1' });
    expect(seen).toEqual([SYSTEM_PROMPT_SINGLE_DOOR, SYSTEM_PROMPT_TWO_DOORS]);
  });
});

describe('engine output filter', () => {
  const out = (echo: string, question: string) => JSON.stringify({ echo, question, done: false, update: { covered: [], notes: {} } });
  it.each(['We also run a Sprint for this.', 'Door 2 is a workshop.', 'The [PRICE] is low.', 'A solution sprint helps.'])('single door rejects %j (fallback)', (t) => {
    expect(parseModelOutput(out(t, 'What does it cost you each week?'))).toBeNull();
    expect(parseModelOutput(out('Reports eat Fridays.', t))).toBeNull();
  });
  it('two-door mode does not filter those tokens; ordinary business words are fine in both', () => {
    expect(parseModelOutput(out('We also run a Sprint for this.', 'What does it cost you each week?'), true)).not.toBeNull();
    expect(parseModelOutput(out('You give customers credit terms and watch the price.', 'How long do invoices stay unpaid?'))).not.toBeNull();
  });
  it('through the Worker: a model that offers a Sprint in single-door mode gets the fixed fallback question', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ choices: [{ message: { content: out('We can run a Sprint for you.', 'Want to book it?') }, finish_reason: 'stop' }] }), { status: 200 }));
    const e = { SCAN_HMAC_SECRET: 'test-secret-0123456789-abcdefghijklmnop', MODEL_PROVIDER: 'deepseek', DEEPSEEK_API_KEY: 'sk-test-FAKE' };
    const r = await turn(null, 'Our reports take all day.', 0, {}, e);
    expect(r.body.question).toBe(FALLBACK_QUESTION);
  });
});

describe('check-build in both modes (fixture dist)', () => {
  const CSS = '.btn-primary{background:var(--color-neutral-900)}.accent{color:var(--color-accent-text)}:focus-visible{outline:2px solid var(--focus-ring-color)}';
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  let n = 0;
  const fixture = (body: string) => {
    const dir = join(root, `f${n++}`); mkdirSync(dir);
    const chips = chipData.chips.map((c) => `<button type="button" class="btn btn-ghost btn-sm chip" data-chip="${esc(c.text)}">${esc(c.text)}</button>`).join('');
    writeFileSync(join(dir, 'index.html'), `<!doctype html><style>${CSS}</style><body>${chips}<a class="accent" href="https://cal.com/alter-pedro-discovery">Book 20 minutes</a><button class="btn btn-primary">Start</button>${body}</body>`);
    return dir;
  };
  const run = (dir: string, env: Record<string, string> = {}) => {
    const r = spawnSync(process.execPath, [checker], { env: { ...cleanEnv(), ...env, DIST_DIR: dir }, encoding: 'utf8' });
    return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
  };
  it('unset + clean page passes', () => {
    const r = run(fixture('<h3>5. Next step</h3><p>A free 20-minute call. We go through the summary with you.</p>'));
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/single door \(SPRINT_PRICE unset\)/);
  });
  it.each(BANNED_WORDS)('unset + page containing "%s" FAILS', (w) => {
    const r = run(fixture(`<p>about the ${w} here</p>`));
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/banned word while SPRINT_PRICE is unset/);
  });
  it('unset + banned word only in a script or css file also fails', () => {
    const dir = fixture('<p>ok</p>');
    writeFileSync(join(dir, 'a.js'), 'var s="Solution Sprint";');
    expect(run(dir).code).toBe(1);
  });
  it('unset also fails in a PRODUCTION build (and with a valid cal.com link)', () => {
    const r = run(fixture('<p>Door 2: Solution Sprint</p>'), { PRODUCTION: '1', BOOKING_URL: 'https://cal.com/alter-pedro-discovery' });
    expect(r.code).toBe(1);
  });
  it('set + two-door page with the price passes, and the words are allowed', () => {
    const body = '<li>Door 1: a 20-minute call. Free.</li><li>Door 2: a Solution Sprint, INR 1, credited in full.</li>';
    const r = run(fixture(body), { SPRINT_PRICE: 'INR 1' });
    expect(r.out).toMatch(/two doors \(SPRINT_PRICE set\)/);
    expect(r.code).toBe(0);
    const prod = run(fixture(body), { SPRINT_PRICE: 'INR 1', PRODUCTION: '1', BOOKING_URL: 'https://cal.com/alter-pedro-discovery' });
    expect(prod.code).toBe(0);
  });
  it('set but the page has no Door 2 / price fails', () => {
    const r = run(fixture('<p>A free call.</p>'), { SPRINT_PRICE: 'INR 1' });
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/two-door example/);
  });
  it('PRODUCTION=1 and a literal [PRICE] in the output fails even when SPRINT_PRICE is set', () => {
    const r = run(fixture('<li>Door 2: [PRICE]</li>'), { SPRINT_PRICE: '[PRICE]', PRODUCTION: '1', BOOKING_URL: 'https://cal.com/alter-pedro-discovery' });
    expect(r.code).toBe(1);
  });
  it('PRODUCTION=1 still fails on a missing / non-cal.com booking link in single-door mode', () => {
    expect(run(fixture('<p>ok</p>'), { PRODUCTION: '1' }).code).toBe(1);
    expect(run(fixture('<p>ok</p>'), { PRODUCTION: '1', BOOKING_URL: 'https://calendly.com/x' }).code).toBe(1);
  });
});

describe('real Astro build in both modes', () => {
  const build = (env: Record<string, string>) => {
    const out = join(root, `b${n2++}`);
    const b = spawnSync(astroBin, ['build', '--outDir', out], { cwd: projectRoot, env: { ...cleanEnv(), ...env, ASTRO_TELEMETRY_DISABLED: '1' }, encoding: 'utf8' });
    return { out, build: b };
  };
  let n2 = 0;
  const check = (dir: string, env: Record<string, string>) => spawnSync(process.execPath, [checker], { env: { ...cleanEnv(), ...env, DIST_DIR: dir }, encoding: 'utf8' });
  it('SPRINT_PRICE unset: one door, no banned word anywhere in the built page', () => {
    const { out, build: b } = build({});
    expect(b.status, b.stderr).toBe(0);
    const html = readFileSync(join(out, 'index.html'), 'utf8');
    expect(bannedHits(html)).toEqual([]);
    expect(html).toContain('A free 20-minute call. We go through the summary with you and tell you honestly whether we can help, and how.');
    expect(html).toContain('Rather talk to a person? Book 20 minutes.');
    expect(check(out, {}).status).toBe(0);
  });
  it('SPRINT_PRICE set: Door 1 and Door 2 render with the price and the credit line', () => {
    const env = { SPRINT_PRICE: 'INR 99,000 (test value)' };
    const { out, build: b } = build(env);
    expect(b.status, b.stderr).toBe(0);
    const html = readFileSync(join(out, 'index.html'), 'utf8');
    expect(html).toContain('Door 1:');
    expect(html).toContain('Door 2:');
    expect(html).toContain('INR 99,000 (test value)');
    expect(html).toContain('credited in full against the project if you go ahead');
    expect(check(out, env).status).toBe(0);
  });
  it('PRODUCTION=1 + SPRINT_PRICE="[PRICE]" fails the build', () => {
    const { build: b } = build({ PRODUCTION: '1', BOOKING_URL: 'https://cal.com/alter-pedro-discovery', SPRINT_PRICE: '[PRICE]' });
    expect(b.status).not.toBe(0);
  });
});
