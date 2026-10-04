// Problem Model schema v1 + HMAC signing + strict validation. (ARCHITECTURE 3.2, 3.1, 3.5)
import { PROMPT_CANARY, SYSTEM_PROMPT } from './prompt';

export const AREAS = ['situation', 'cost', 'history', 'constraint', 'vision', 'stake', 'urgency'] as const;
export type Area = (typeof AREAS)[number];
export const MAX_TURNS = 8;
export const MAX_ANSWER_CHARS = 1500;
export const FALLBACK_ECHO = "Thanks, I've noted that.";
export const FALLBACK_QUESTION = 'Can you give me one example from last week where this got in the way?';

export interface ProblemModel {
  areas: Record<Area, { covered: boolean; notes: string }>;
  stated_problem: string;
  underlying_problem: string | null;
  solution_areas: string[];
  gaps: string[];
  turn: number;
  sig: string;
}
export interface ModelUpdate {
  covered: Area[];
  notes: Partial<Record<Area, string>>;
  stated_problem?: string;
  underlying_problem?: string | null;
  solution_areas?: string[];
  gaps?: string[];
}
export interface ModelOutput { echo: string; question: string | null; done: boolean; update: ModelUpdate }

export function blankModel(): ProblemModel {
  const areas = {} as ProblemModel['areas'];
  for (const a of AREAS) areas[a] = { covered: false, notes: '' };
  return { areas, stated_problem: '', underlying_problem: null, solution_areas: [], gaps: [], turn: 0, sig: '' };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const onlyKeys = (o: Record<string, unknown>, allowed: readonly string[]) => Object.keys(o).every((k) => allowed.includes(k));
const str = (v: unknown, max: number): v is string => typeof v === 'string' && v.length <= max;
const strList = (v: unknown, maxItems: number, maxLen: number): v is string[] =>
  Array.isArray(v) && v.length <= maxItems && v.every((x) => str(x, maxLen));

/** Strict check of a Problem Model object (without verifying the signature). */
export function validateModel(m: unknown): m is ProblemModel {
  if (!isObj(m) || !onlyKeys(m, ['areas', 'stated_problem', 'underlying_problem', 'solution_areas', 'gaps', 'turn', 'sig'])) return false;
  if (!isObj(m.areas) || !onlyKeys(m.areas, AREAS) || Object.keys(m.areas).length !== AREAS.length) return false;
  for (const a of AREAS) {
    const v = (m.areas as Record<string, unknown>)[a];
    if (!isObj(v) || !onlyKeys(v, ['covered', 'notes']) || typeof v.covered !== 'boolean' || !str(v.notes, 300)) return false;
  }
  if (!str(m.stated_problem, 300)) return false;
  if (!(m.underlying_problem === null || str(m.underlying_problem, 300))) return false;
  if (!strList(m.solution_areas, 4, 300) || !strList(m.gaps, 4, 300)) return false;
  if (!Number.isInteger(m.turn) || (m.turn as number) < 0 || (m.turn as number) > MAX_TURNS) return false;
  return typeof m.sig === 'string' && m.sig.length <= 100;
}

// ---- HMAC signing ---------------------------------------------------------------------------
function canonical(m: ProblemModel): string {
  // Fixed key order so the signed bytes never depend on client-side key ordering. `sig` is excluded.
  return 'alterpedro.scan.v1|' + JSON.stringify([
    AREAS.map((a) => [a, m.areas[a].covered, m.areas[a].notes]),
    m.stated_problem, m.underlying_problem, m.solution_areas, m.gaps, m.turn,
  ]);
}
const enc = new TextEncoder();
async function hmacKey(secret: string, usage: 'sign' | 'verify') {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);
}
const b64u = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export async function signModel(m: ProblemModel, secret: string): Promise<ProblemModel> {
  const sig = b64u(await crypto.subtle.sign('HMAC', await hmacKey(secret, 'sign'), enc.encode(canonical(m))));
  return { ...m, sig };
}
/** Constant-time verify via WebCrypto. Any malformed signature returns false. */
export async function verifyModel(m: ProblemModel, secret: string): Promise<boolean> {
  try {
    return await crypto.subtle.verify('HMAC', await hmacKey(secret, 'verify'), unb64u(m.sig), enc.encode(canonical(m)));
  } catch {
    return false;
  }
}

// ---- Model output validation ----------------------------------------------------------------
const PRESCRIPTION = /\b(?:you(?:'ll| will)? need (?:an?|the) (?:app|dashboard|platform|website|system|tool|software|erp|crm|portal)|build (?:an?|the|your) (?:app|dashboard|platform|website|portal|system)|you should (?:build|buy|get))\b/i;
const BAD_CHARS = /[<>\u0000-\u0008\u000B-\u001F\u007F]/;
const URLISH = /https?:\/\/|www\./i;

/** True if a string contains the canary or any run of 8 consecutive words from the system prompt. */
export function leaksPrompt(text: string): boolean {
  if (text.includes(PROMPT_CANARY)) return true;
  const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean);
  const w = words(text);
  if (w.length < 8) return false;
  const shingles = new Set<string>();
  const p = words(SYSTEM_PROMPT);
  for (let i = 0; i + 8 <= p.length; i++) shingles.add(p.slice(i, i + 8).join(' '));
  for (let i = 0; i + 8 <= w.length; i++) if (shingles.has(w.slice(i, i + 8).join(' '))) return true;
  return false;
}

function cleanText(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  if (BAD_CHARS.test(v.replace(/[\t\n\r]/g, ' '))) return null;
  const t = v.replace(/\s+/g, ' ').trim();
  if (t.length > max || URLISH.test(t) || PRESCRIPTION.test(t) || leaksPrompt(t)) return null;
  return t;
}

/** Parse + strictly validate raw model text. Returns null on ANY problem (caller then shows the fixed fallback). */
export function parseModelOutput(raw: unknown): ModelOutput | null {
  if (typeof raw !== 'string' || raw.length > 8000) return null;
  let j: unknown;
  try { j = JSON.parse(raw); } catch { return null; }
  if (!isObj(j) || !onlyKeys(j, ['echo', 'question', 'done', 'update']) || Object.keys(j).length !== 4) return null;
  const echo = cleanText(j.echo, 240);
  if (!echo) return null;
  if (typeof j.done !== 'boolean') return null;
  let question: string | null = null;
  if (j.question !== null) { question = cleanText(j.question, 200); if (!question) return null; }
  if (j.done ? question !== null : question === null) return null;
  const u = j.update;
  if (!isObj(u) || !onlyKeys(u, ['covered', 'notes', 'stated_problem', 'underlying_problem', 'solution_areas', 'gaps'])) return null;
  if (!Array.isArray(u.covered) || u.covered.length > AREAS.length || !u.covered.every((a) => AREAS.includes(a as Area))) return null;
  if (!isObj(u.notes) || !onlyKeys(u.notes, AREAS)) return null;
  const update: ModelUpdate = { covered: u.covered as Area[], notes: {} };
  for (const [k, v] of Object.entries(u.notes)) { const t = cleanText(v, 300); if (t === null) return null; update.notes[k as Area] = t; }
  if ('stated_problem' in u) { const t = cleanText(u.stated_problem, 300); if (t === null) return null; update.stated_problem = t; }
  if ('underlying_problem' in u) {
    if (u.underlying_problem === null) update.underlying_problem = null;
    else { const t = cleanText(u.underlying_problem, 300); if (t === null) return null; update.underlying_problem = t; }
  }
  for (const key of ['solution_areas', 'gaps'] as const) {
    if (key in u) {
      if (!Array.isArray(u[key]) || (u[key] as unknown[]).length > 4) return null;
      const out: string[] = [];
      for (const x of u[key] as unknown[]) { const t = cleanText(x, 300); if (t === null) return null; out.push(t); }
      update[key] = out;
    }
  }
  return { echo, question, done: j.done, update };
}

/** Merge a validated update into the model. The model can never touch `turn` or `sig`. */
export function applyUpdate(m: ProblemModel, u: ModelUpdate): ProblemModel {
  const next: ProblemModel = JSON.parse(JSON.stringify(m));
  for (const a of u.covered) next.areas[a].covered = true;
  for (const [a, n] of Object.entries(u.notes)) next.areas[a as Area].notes = n as string;
  if (u.stated_problem !== undefined) next.stated_problem = u.stated_problem;
  if (u.underlying_problem !== undefined) next.underlying_problem = u.underlying_problem;
  if (u.solution_areas) next.solution_areas = u.solution_areas;
  if (u.gaps) next.gaps = u.gaps;
  return next;
}
