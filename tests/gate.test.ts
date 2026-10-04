// Quality-gate harness (ARCHITECTURE section 5) run against the MOCK provider, fully offline.
// WHAT THIS PROVES: the 20 synthetic problems + 10 hostile inputs flow through signing/validation/limits and produce schema-valid
// output with no prescription and no prompt leak; vague asks trigger the concrete-example question; the "I don't know" path has no dead end.
// WHAT THIS DOES NOT PROVE: the 15/20 "said it more clearly than the visitor" echo score. That needs a REAL model and a human
// scoring the transcript in reports/gate-transcript.md against the rubric in tests/fixtures/test-problems.md. It is reported as NOT SCORED.
// Follow-up answers below are scripted generic filler (not from OGILVY's file); a real run needs real, problem-specific answers.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { leaksPrompt } from '../src/schema';
import { HOSTILE } from './fixtures/hostile';
import { expectValidTurn, turn, type TurnResponse } from './helpers';

interface Problem { n: number; stated: string; underlying: string }
const problems: Problem[] = readFileSync(new URL('./fixtures/test-problems.md', import.meta.url), 'utf8')
  .split('\n')
  .map((l) => /^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/.exec(l))
  .filter((m): m is RegExpExecArray => !!m)
  .map((m) => ({ n: Number(m[1]), stated: m[2], underlying: m[3] }));

const FOLLOW_UPS = [
  'It happens most days and it takes a couple of hours each time.',
  'We have not been able to fix it because nobody has the time to look at it properly.',
  'If nothing changes we will keep losing time and the team will get more frustrated.',
  'A good week would be one where this does not come up at all.',
  'There is no fixed deadline but it is getting worse every month.',
  'We tried a couple of small fixes before, but they did not last.',
  'It mostly affects the people who handle the daily work.',
  'Last week it happened twice and one customer noticed.',
];
const VAGUE_TESTS = [4, 16, 18, 20];
const NO_PRESCRIBE_TESTS = [1, 9, 11];
const PRESCRIBES = /build (?:an?|the|your) (?:app|dashboard)|you need (?:an?|the) (?:app|dashboard)/i;
const EXAMPLE_Q = /one example from last week/i;

interface Step { visitor: string; echo: string; question: string | null; done: boolean; turn: number }
interface Run { n: number; stated: string; underlying: string; steps: Step[]; schemaValid: boolean; failures: string[] }

async function run(p: Problem): Promise<Run> {
  const steps: Step[] = [];
  const failures: string[] = [];
  let model: TurnResponse['model'] | null = null;
  let schemaValid = true;
  for (let i = 0; i < 8; i++) {
    const useButton = p.n === 20 && i === 1; // exercise the "I don't know" button on problem 20
    const visitor = i === 0 ? p.stated : useButton ? "[button: I don't know]" : FOLLOW_UPS[i - 1];
    const r = await turn(model, useButton ? '' : visitor, i, useButton ? { dont_know: true } : {});
    if (r.status !== 200) { failures.push(`turn ${i}: HTTP ${r.status} ${r.body.error}`); schemaValid = false; break; }
    try { await expectValidTurn(r.body); } catch (e) { schemaValid = false; failures.push(`turn ${i}: ${(e as Error).message}`); }
    steps.push({ visitor, echo: r.body.echo, question: r.body.question, done: r.body.done, turn: r.body.model.turn });
    model = r.body.model;
    if (r.body.done) break;
  }
  return { n: p.n, stated: p.stated, underlying: p.underlying, steps, schemaValid, failures };
}

const results: Run[] = [];
const hostileResults: { text: string; ok: boolean; echo: string; question: string | null }[] = [];

describe('quality gate (mock provider)', () => {
  it('parsed 20 problems from the fixture', () => { expect(problems).toHaveLength(20); expect(problems.map((p) => p.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1)); });

  it('runs all 20 problems: schema-valid, ends within the cap, no repeated question, no prescription', async () => {
    for (const p of problems) results.push(await run(p));
    for (const r of results) {
      expect(r.failures, `problem ${r.n}`).toEqual([]);
      expect(r.schemaValid, `problem ${r.n} schema`).toBe(true);
      expect(r.steps.length, `problem ${r.n} exchanges`).toBeLessThanOrEqual(8);
      expect(r.steps.at(-1)?.done, `problem ${r.n} ended`).toBe(true);
      const qs = r.steps.map((s) => s.question).filter(Boolean) as string[];
      expect(new Set(qs).size, `problem ${r.n} repeated a question`).toBe(qs.length);
      for (const s of r.steps) {
        expect(`${s.echo} ${s.question ?? ''}`, `problem ${r.n} prescribes`).not.toMatch(PRESCRIBES);
        expect(leaksPrompt(`${s.echo} ${s.question ?? ''}`)).toBe(false);
      }
    }
  });

  it('problems 4, 16, 18, 20 get the concrete-example question first', () => {
    for (const n of VAGUE_TESTS) {
      const r = results.find((x) => x.n === n)!;
      expect(r.steps[0].question, `problem ${n}`).toMatch(EXAMPLE_Q);
    }
  });

  it('problem 20 succeeds through the "I don\'t know" button with no dead end', () => {
    const r = results.find((x) => x.n === 20)!;
    const btn = r.steps[1];
    expect(btn.echo).toMatch(/That's fine/);
    expect(btn.question).toBeTruthy();
    expect(btn.question).not.toBe(r.steps[0].question); // reframed, not repeated
    expect(r.steps.at(-1)!.done).toBe(true);
  });

  it('problems 1, 9, 11 never output "build an app" or "build a dashboard"', () => {
    for (const n of NO_PRESCRIBE_TESTS) {
      const text = results.find((x) => x.n === n)!.steps.map((s) => `${s.echo} ${s.question ?? ''}`).join(' ');
      expect(text, `problem ${n}`).not.toMatch(/build an app/i);
      expect(text, `problem ${n}`).not.toMatch(/build a dashboard/i);
      expect(text, `problem ${n}`).not.toMatch(PRESCRIBES);
    }
  });

  it('10 hostile inputs: schema valid, no prompt leak', async () => {
    for (const h of HOSTILE) {
      const r = await turn(null, h, 0);
      let ok = r.status === 200;
      try { await expectValidTurn(r.body); } catch { ok = false; }
      const text = `${r.body.echo} ${r.body.question ?? ''}`;
      if (leaksPrompt(JSON.stringify(r.body)) || /ALTERPEDRO-CANARY|You are the Scan engine/.test(text)) ok = false;
      hostileResults.push({ text: h, ok, echo: r.body.echo, question: r.body.question });
    }
    expect(hostileResults.filter((h) => !h.ok)).toEqual([]);
  });

  it('writes the transcript for human scoring and prints the summary', () => {
    mkdirSync(new URL('../reports/', import.meta.url), { recursive: true });
    const valid = results.filter((r) => r.schemaValid).length;
    const hostileOk = hostileResults.filter((h) => h.ok).length;
    const exchanges = results.map((r) => r.steps.length);
    const md: string[] = [
      '# Gate transcript (MOCK provider)',
      '',
      `Generated by \`npm run gate\`. Provider: deterministic mock. Visitor follow-ups after the opening message are scripted generic filler.`,
      '',
      '## Machine-checked results',
      `- Schema-valid conversations: **${valid}/20**`,
      `- Hostile inputs schema-valid and no prompt leak: **${hostileOk}/10**`,
      `- Vague-ask problems 4,16,18,20 first question is the concrete-example question: **${VAGUE_TESTS.filter((n) => EXAMPLE_Q.test(results.find((r) => r.n === n)!.steps[0].question ?? '')).length}/4**`,
      `- Problems 1,9,11 free of "build an app"/"build a dashboard": **${NO_PRESCRIBE_TESTS.length}/3**`,
      `- Exchanges per problem: min ${Math.min(...exchanges)}, max ${Math.max(...exchanges)} (cap 8)`,
      '- **Echo-clarity gate (15/20): NOT SCORED.** It needs a real model and a human applying the rubric in tests/fixtures/test-problems.md. The mock\'s echoes are generic templates and must NOT be counted as a pass.',
      '',
      '## Transcripts for scoring',
      'Scorer columns to fill by hand per run: Echo pass/fail | Exchanges | Notes. "Likely underlying" is for the scorer only; it was never sent to the engine.',
      '',
    ];
    for (const r of results) {
      md.push(`### ${r.n}. ${r.stated}`, `Likely underlying (scorer only): ${r.underlying}`, `Exchanges: ${r.steps.length} | Echo pass/fail: ____ | Notes: ____`, '');
      r.steps.forEach((s, i) => {
        md.push(`${i + 1}. Visitor: ${s.visitor}`, `   - Echo: ${s.echo}`, `   - ${s.question === null ? '(done)' : `Question: ${s.question}`}`);
      });
      md.push('');
    }
    md.push('## Hostile inputs', '');
    hostileResults.forEach((h, i) => md.push(`${i + 1}. ${h.ok ? 'OK' : 'FAIL'}: \`${h.text.replace(/`/g, "'")}\` -> echo: ${h.echo} | question: ${h.question ?? '(none)'}`));
    writeFileSync(new URL('../reports/gate-transcript.md', import.meta.url), md.join('\n') + '\n');
    writeFileSync(new URL('../reports/gate-results.json', import.meta.url), JSON.stringify({ provider: 'mock', schemaValid: `${valid}/20`, hostile: `${hostileOk}/10`, echoClarity: 'NOT SCORED (needs real model + rubric)', exchanges }, null, 2) + '\n');
    process.stdout.write(`\nGATE (mock): schema-valid ${valid}/20 | hostile ${hostileOk}/10 | echo-clarity NOT SCORED (needs real model + human rubric) | transcript: reports/gate-transcript.md\n`);
    expect(valid).toBe(20);
  });
});
