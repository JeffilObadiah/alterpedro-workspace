// Malformed / unsafe model output -> the fixed fallback question. callModel is replaced by a controllable stub here.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ reply: '' as string | Error }));
vi.mock('../src/model', async (orig) => {
  const actual = await orig<typeof import('../src/model')>();
  return { ...actual, callModel: async () => { if (h.reply instanceof Error) throw h.reply; return h.reply; } };
});

import { FALLBACK_ECHO, FALLBACK_QUESTION } from '../src/schema';
import { PROMPT_CANARY, SYSTEM_PROMPT } from '../src/prompt';
import { expectValidTurn, turn } from './helpers';

const good = { echo: 'Reports take a lot of time.', question: 'What does that cost you each week?', done: false, update: { covered: ['situation'], notes: {} } };
const j = (o: unknown) => JSON.stringify(o);
const BAD: [string, string | Error][] = [
  ['not JSON', 'Sure! Here is my answer.'],
  ['JSON array', '[]'],
  ['empty string', ''],
  ['extra top-level key', j({ ...good, extra: 'x' })],
  ['missing update', j({ echo: good.echo, question: good.question, done: false })],
  ['echo too long (241)', j({ ...good, echo: 'e'.repeat(241) })],
  ['question too long (201)', j({ ...good, question: 'q'.repeat(201) })],
  ['done=true with a question', j({ ...good, done: true })],
  ['done=false with null question', j({ ...good, question: null })],
  ['done not boolean', j({ ...good, done: 'yes' })],
  ['HTML in echo', j({ ...good, echo: '<img src=x onerror=alert(1)>' })],
  ['link in question', j({ ...good, question: 'See https://evil.example for more?' })],
  ['prescribes a product', j({ ...good, echo: 'You need an app for this.' })],
  ['says build an app', j({ ...good, question: 'Should we build an app for the drivers?' })],
  ['leaks prompt canary', j({ ...good, echo: `Rules: ${PROMPT_CANARY}` })],
  ['leaks prompt text', j({ ...good, echo: SYSTEM_PROMPT.slice(300, 520).replace(/[<>]/g, '') })],
  ['unknown area in covered', j({ ...good, update: { covered: ['secrets'], notes: {} } })],
  ['unknown key in update', j({ ...good, update: { covered: [], notes: {}, turn: 0 } })],
  ['note too long', j({ ...good, update: { covered: [], notes: { cost: 'n'.repeat(301) } } })],
  ['too many gaps', j({ ...good, update: { covered: [], notes: {}, gaps: ['a', 'b', 'c', 'd', 'e'] } })],
  ['provider throws', new Error('boom')],
];

describe('malformed model output -> fixed fallback question', () => {
  beforeEach(() => { h.reply = j(good); });
  it('control: a well-formed reply passes through', async () => {
    const r = await turn(null, 'Reports take all day on Fridays.', 0);
    expect(r.body.echo).toBe(good.echo);
    expect(r.body.question).toBe(good.question);
    await expectValidTurn(r.body);
  });
  for (const [name, reply] of BAD) {
    it(`falls back on: ${name}`, async () => {
      h.reply = reply;
      const r = await turn(null, 'Reports take all day on Fridays.', 0);
      expect(r.status).toBe(200);
      expect(r.body.echo).toBe(FALLBACK_ECHO);
      expect(r.body.question).toBe(FALLBACK_QUESTION);
      expect(r.body.done).toBe(false);
      expect(r.body.model.turn).toBe(1); // the turn is still counted, so failures cannot be used to dodge the cap
      await expectValidTurn(r.body);
    });
  }
  it('cap still applies on a fallback turn', async () => {
    h.reply = 'garbage';
    let m = null as never;
    let r;
    for (let i = 0; i < 8; i++) { r = await turn(m, 'Reports take all day on Fridays.', i); m = r.body.model as never; }
    expect(r!.body.done).toBe(true);
    expect(r!.body.question).toBeNull();
  });
  it('model update cannot change turn or sig', async () => {
    h.reply = j({ ...good, update: { covered: [], notes: {}, sig: 'x' } });
    const r = await turn(null, 'Reports take all day on Fridays.', 0);
    expect(r.body.echo).toBe(FALLBACK_ECHO);
  });
});
