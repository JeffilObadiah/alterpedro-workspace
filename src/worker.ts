// Cloudflare Worker: POST /api/scan/turn (ARCHITECTURE section 3). Everything else is static assets.
// Stateless turns: the browser holds the signed Problem Model. No database read on the hot path.
import { callModel, providerFromEnv, type Message, type ProviderEnv } from './model';
import { getSystemPrompt } from './prompt';
import siteConfig from './site-config.json';
import {
  FALLBACK_ECHO, FALLBACK_QUESTION, MAX_ANSWER_CHARS, MAX_TURNS,
  applyUpdate, blankModel, parseModelOutput, signModel, validateModel, verifyModel, type ProblemModel,
} from './schema';

export interface Env extends ProviderEnv {
  SCAN_HMAC_SECRET?: string;
  /** Test/local override. Normally the switch comes from src/site-config.json (generated at build from SPRINT_PRICE). */
  SPRINT_PRICE?: string;
  ASSETS?: { fetch(request: Request): Promise<Response> };
}

/** Single door (DEC-005): the paid option exists only when SPRINT_PRICE was set at build time. */
export function sprintEnabled(env: Env): boolean {
  return env.SPRINT_PRICE !== undefined ? env.SPRINT_PRICE.trim() !== '' : siteConfig.sprintEnabled === true;
}

const MAX_BODY_BYTES = 32 * 1024;
const BASE_HEADERS = { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };

/** Counters and error codes only. NEVER pass visitor or model text here. */
function log(code: string, turn?: number) {
  console.log(JSON.stringify({ evt: 'scan_turn', code, turn }));
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, 'content-type': 'application/json; charset=utf-8' } });

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/** Visitor text goes in as a JSON data field inside delimiters; it is never concatenated into the instructions. */
export function buildMessages(model: ProblemModel, answer: string, turn: number, dontKnow: boolean, twoDoors = false): Message[] {
  const { sig: _sig, ...state } = model;
  const data = JSON.stringify({ schema: 'scan.v1', turn, max_turns: MAX_TURNS, dont_know: dontKnow, answer, model: state })
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e'); // the visitor cannot close the delimiter
  return [
    { role: 'system', content: getSystemPrompt(twoDoors) },
    { role: 'user', content: `<visitor_data>\n${data}\n</visitor_data>` },
  ];
}

interface Parsed { model: unknown; answer: unknown; turn: unknown; dont_know: unknown }

async function readBody(request: Request): Promise<{ form: boolean; body: Parsed } | { error: string; status: number }> {
  const type = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  const len = Number(request.headers.get('content-length') ?? '0');
  if (len > MAX_BODY_BYTES) return { error: 'body_too_large', status: 413 };
  let text: string;
  try { text = await request.text(); } catch { return { error: 'bad_body', status: 400 }; }
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return { error: 'body_too_large', status: 413 };
  if (type === 'application/json') {
    try {
      const b = JSON.parse(text);
      if (typeof b !== 'object' || b === null || Array.isArray(b)) return { error: 'bad_body', status: 400 };
      return { form: false, body: { model: b.model ?? null, answer: b.answer, turn: b.turn ?? 0, dont_know: b.dont_know ?? false } };
    } catch { return { error: 'bad_json', status: 400 }; }
  }
  if (type === 'application/x-www-form-urlencoded') {
    const f = new URLSearchParams(text);
    let model: unknown = null;
    const m = f.get('model');
    if (m) { try { model = JSON.parse(m); } catch { return { error: 'bad_model', status: 400 }; } }
    return { form: true, body: { model, answer: f.get('answer') ?? '', turn: f.has('turn') ? Number(f.get('turn')) : 0, dont_know: f.get('dont_know') === '1' } };
  }
  return { error: 'unsupported_media_type', status: 415 };
}

function page(inner: string, status = 200) {
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alter Pedro</title>` +
    `<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.6">${inner}</body></html>`;
  return new Response(html, { status, headers: { ...BASE_HEADERS, 'content-type': 'text/html; charset=utf-8', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'" } });
}

export async function handleTurn(request: Request, env: Env): Promise<Response> {
  const parsed = await readBody(request);
  const wantsHtml = !('error' in parsed) && parsed.form;
  const fail = (error: string, status: number, turn?: number) => {
    log(error, turn);
    return wantsHtml || ('error' in parsed && (request.headers.get('content-type') ?? '').includes('x-www-form-urlencoded'))
      ? page(`<p>That did not work (${esc(error)}).</p><p><a href="/">Back to the start</a></p>`, status)
      : json({ error }, status);
  };
  if ('error' in parsed) return fail(parsed.error, parsed.status);
  if (!env.SCAN_HMAC_SECRET) return fail('not_configured', 500);
  const { body } = parsed;

  // ---- input limits ----
  if (typeof body.answer !== 'string') return fail('answer_required', 422);
  const answer = body.answer.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (answer.length > MAX_ANSWER_CHARS) return fail('answer_too_long', 422);
  const dontKnow = body.dont_know === true;
  if (!answer && !dontKnow) return fail('answer_required', 422);
  if (!Number.isInteger(body.turn) || (body.turn as number) < 0) return fail('bad_turn', 400);
  const turn = body.turn as number;

  // ---- model state: fresh on turn 0, otherwise must be well-formed AND correctly signed ----
  let model: ProblemModel;
  if (body.model === null || body.model === undefined) {
    if (turn !== 0) return fail('bad_turn', 400, turn);
    model = blankModel();
  } else {
    if (!validateModel(body.model)) return fail('bad_model', 400, turn);
    if (!(await verifyModel(body.model, env.SCAN_HMAC_SECRET))) return fail('bad_signature', 403, turn);
    if (body.model.turn !== turn) return fail('bad_turn', 400, turn);
    model = body.model;
  }
  if (model.turn >= MAX_TURNS) return fail('turn_cap', 409, turn);

  // ---- model call (provider-agnostic), strict validation, fixed fallback on ANY failure ----
  let out = null as ReturnType<typeof parseModelOutput>;
  let code = 'ok';
  try {
    const raw = await callModel(providerFromEnv(env), buildMessages(model, answer, turn, dontKnow, sprintEnabled(env)));
    out = parseModelOutput(raw, sprintEnabled(env));
    if (!out) code = 'fallback_invalid_output';
  } catch {
    code = 'fallback_provider_error';
  }
  const newTurn = turn + 1;
  let next = { ...model, turn: newTurn };
  let echo = FALLBACK_ECHO;
  let question: string | null = FALLBACK_QUESTION;
  let done = false;
  if (out) {
    next = { ...applyUpdate(model, out.update), turn: newTurn };
    echo = out.echo; question = out.question; done = out.done;
  }
  if (newTurn >= MAX_TURNS) { done = true; question = null; } // hard cap enforced in code, not by the model
  const signed = await signModel(next, env.SCAN_HMAC_SECRET);
  log(code, newTurn);

  if (wantsHtml) {
    const cont = done
      ? `<p>That's enough for me to say something useful. <a href="/#book">Rather talk to a person? Book 20 minutes.</a></p>`
      : `<form method="post" action="/api/scan/turn"><input type="hidden" name="model" value="${esc(JSON.stringify(signed))}"><input type="hidden" name="turn" value="${newTurn}">` +
        `<p><label for="answer">Your answer</label><br><textarea id="answer" name="answer" rows="4" maxlength="${MAX_ANSWER_CHARS}" required style="width:100%"></textarea></p>` +
        `<p><button type="submit">Send</button> <button type="submit" name="dont_know" value="1" formnovalidate>I don't know</button></p></form>`;
    return page(`<p>${esc(echo)}</p>${question ? `<p><strong>${esc(question)}</strong></p>` : ''}${cont}`);
  }
  return json({ echo, question, done, model: signed });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/scan/turn') {
      if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...BASE_HEADERS, allow: 'POST', 'content-type': 'application/json' } });
      return handleTurn(request, env);
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'not_found' }, 404);
    return env.ASSETS ? env.ASSETS.fetch(request) : json({ error: 'not_found' }, 404);
  },
};
