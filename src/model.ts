// ONE function talks to a model: callModel(provider, messages). Everything else is provider-agnostic.
import { AREAS, MAX_TURNS, type Area, type ProblemModel } from './schema';

export type Message = { role: 'system' | 'user'; content: string };
export type Provider =
  | { kind: 'mock' }
  | { kind: 'real'; apiKey?: string; endpoint?: string };

export interface ProviderEnv { MODEL_PROVIDER?: string; MODEL_API_KEY?: string; MODEL_ENDPOINT?: string }

/** Default is MOCK (deterministic, offline). `real` only if MODEL_PROVIDER=real. */
export function providerFromEnv(env: ProviderEnv): Provider {
  if (env.MODEL_PROVIDER === 'real') return { kind: 'real', apiKey: env.MODEL_API_KEY, endpoint: env.MODEL_ENDPOINT };
  return { kind: 'mock' };
}

/** Returns the model's RAW text reply. Throws on provider failure (caller falls back to the fixed question). */
export async function callModel(provider: Provider, messages: Message[]): Promise<string> {
  switch (provider.kind) {
    case 'mock':
      return mockModel(messages);
    case 'real':
      return realModel(provider, messages);
  }
}

// TODO(E4): implement the real provider. Send `messages` to provider.endpoint with provider.apiKey, request JSON-only output,
// no tools, no retrieval, a short timeout, and return the reply text. Measure cost_per_scan here. NOT IMPLEMENTED YET:
// until then MODEL_PROVIDER=real always throws, and the Worker answers with the fixed fallback question.
async function realModel(_provider: Extract<Provider, { kind: 'real' }>, _messages: Message[]): Promise<string> {
  throw new Error('NOT_IMPLEMENTED: real model provider (task E4)');
}

// ---------------------------------------------------------------------------------------------
// MOCK provider. Deterministic rules, no network, no randomness. It never copies visitor words into echo/question.
// It exists so tests run offline and verify PLUMBING (signing, validation, limits, fallback). It says nothing about
// the quality of a real model, and it cannot be fooled by prompt injection because it never reads instructions from text.
// ---------------------------------------------------------------------------------------------
const SOLUTION_NAMED = /\b(?:need|needs|want|build|launched|launch|have an idea for|get)\b[^.?!]{0,40}\b(?:an? app|app|dashboard|platform|website|portal|erp|crm|chatbot|software)\b/i;
const VAGUE = /don'?t know|dont know|automate everything|digital transformation|feel slow|not sure|no idea/i;
const ORDER: Area[] = ['situation', 'cost', 'constraint', 'stake', 'vision', 'urgency', 'history'];
const QUESTION: Record<Area, string> = {
  situation: 'Tell me what is going on, in your own words. Who is affected, and what happens?',
  cost: 'Roughly what does this cost you each week, in hours, money or missed work?',
  constraint: 'What has stopped you from fixing this so far?',
  stake: 'What happens if nothing changes over the next year?',
  vision: 'If this were sorted, what would be different on a normal Monday?',
  urgency: 'Is there a date or event that makes this urgent?',
  history: 'What have you already tried, and what happened?',
};
const REFRAME: Record<Area, string> = {
  situation: 'What was the last thing at work that took longer than it should have?',
  cost: 'Think of last month. Where did time or money quietly disappear?',
  constraint: 'If you could change one thing tomorrow, what would get in your way?',
  stake: 'Who feels this problem most, and what do they say about it?',
  vision: 'Imagine a good week. What is the first thing you would notice?',
  urgency: 'Does anything get worse if this waits a month?',
  history: 'Has anyone tried to fix this before?',
};
const LABEL: Record<Area, string> = {
  situation: 'what is happening', cost: 'what it costs', constraint: 'what is in the way', stake: 'what is at stake',
  vision: 'what good looks like', urgency: 'how urgent it is', history: 'what has been tried',
};

function mockModel(messages: Message[]): string {
  const user = messages.find((m) => m.role === 'user')?.content ?? '';
  const m = /<visitor_data>\s*([\s\S]*?)\s*<\/visitor_data>/.exec(user);
  let d: { answer?: string; dont_know?: boolean; turn?: number; model?: ProblemModel };
  try { d = JSON.parse(m ? m[1] : '{}'); } catch { return 'not json'; }
  const model = d.model;
  if (!model || !model.areas) return 'not json';
  const answer = String(d.answer ?? '');
  const turn = Number(d.turn ?? 0); // answers received before this one
  const covered = new Set<Area>(AREAS.filter((a) => model.areas[a].covered));
  const update: Record<string, unknown> = { covered: [], notes: {} };
  const out = (echo: string, question: string | null, done: boolean) => JSON.stringify({ echo, question, done, update });
  const nextUncovered = (): Area | undefined => ORDER.find((a) => !covered.has(a));
  const cover = (a: Area, note: string) => { covered.add(a); (update.covered as Area[]).push(a); (update.notes as Record<string, string>)[a] = note; };
  const finish = (echo: string) => out(echo, null, true);
  const ask = (echo: string, q: string | undefined) => (turn + 1 >= MAX_TURNS || !q ? finish("That's enough for me to say something useful. Give me a moment.") : out(echo, q, false));

  if (d.dont_know) {
    // "I don't know" is never punished and never repeats: reframe first, then move on and mark the area as unsure.
    if (turn >= 2) { const a = nextUncovered(); if (a) cover(a, 'Visitor was unsure.'); }
    const a = nextUncovered();
    return ask("That's fine. Most people can't see their own bottleneck. Let's come at it another way.", a ? REFRAME[a] : undefined);
  }
  if (turn === 0) update.stated_problem = answer.replace(/https?:\/\/\S+|www\.\S+/gi, '').replace(/[<>]/g, '').replace(/[^\S\n]+/g, ' ').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, 300);
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  // Rule 1: a named solution is challenged once (first answer only).
  if (turn === 0 && SOLUTION_NAMED.test(answer) && !VAGUE.test(answer)) {
    cover('situation', 'Visitor named a possible fix first.');
    return ask("You've named a possible fix. Before we assume it's the right one, I want to understand what is going on.",
      'Maybe that is the answer. Before we assume it is, what problem should it solve?');
  }
  // Rule 3: a vague answer gets one concrete example before anything is concluded.
  if (VAGUE.test(answer) || words <= 3) {
    return ask("I'd like to understand this properly, and that is still quite broad for me.", 'Give me one example from last week where this got in the way.');
  }
  // Rules 2/4: this answer covers the highest-value uncovered area; then ask the next one.
  const answered = nextUncovered();
  if (answered) cover(answered, 'Answered.');
  const next = nextUncovered();
  update.gaps = ORDER.filter((a) => !covered.has(a)).slice(0, 4).map((a) => `Not yet discussed: ${LABEL[a]}`);
  if (!next) return finish("That's enough for me to say something useful. Give me a moment.");
  return ask(`Thanks, that helps with ${LABEL[answered ?? next]}. Next I'd like to understand ${LABEL[next]}.`, QUESTION[next]);
}
