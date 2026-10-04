// DeepSeek provider: request shape and failure behaviour, with fetch stubbed (offline, no key needed).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { callModel, providerFromEnv } from '../src/model';
import { SYSTEM_PROMPT } from '../src/prompt';
import { FALLBACK_ECHO, FALLBACK_QUESTION } from '../src/schema';
import { turn } from './helpers';

const FAKE_KEY = 'sk-test-FAKE-KEY-for-unit-tests-only';
afterEach(() => vi.unstubAllGlobals());

function stubFetch(impl: (url: string, init: RequestInit) => Promise<Response> | Response) {
  const f = vi.fn(async (url: string | URL | Request, init?: RequestInit) => impl(String(url), init ?? {}));
  vi.stubGlobal('fetch', f);
  return f;
}
const ok = (content: string, extra: object = {}) =>
  new Response(JSON.stringify({ choices: [{ message: { content }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 1 }, ...extra }), { status: 200 });
const msgs = [{ role: 'system' as const, content: SYSTEM_PROMPT }, { role: 'user' as const, content: '<visitor_data>{}</visitor_data>' }];

describe('providerFromEnv', () => {
  it('defaults to mock', () => expect(providerFromEnv({})).toEqual({ kind: 'mock' }));
  it('deepseek and the alias real select the DeepSeek provider; key from DEEPSEEK_API_KEY or MODEL_API_KEY', () => {
    expect(providerFromEnv({ MODEL_PROVIDER: 'deepseek', DEEPSEEK_API_KEY: 'a' })).toMatchObject({ kind: 'deepseek', apiKey: 'a' });
    expect(providerFromEnv({ MODEL_PROVIDER: 'real', MODEL_API_KEY: 'b' })).toMatchObject({ kind: 'deepseek', apiKey: 'b' });
  });
});

describe('DeepSeek request shape', () => {
  it('POSTs to /chat/completions with json_object, thinking disabled, stable system prompt first, no tools', async () => {
    const f = stubFetch(() => ok('{"x":1}'));
    const out = await callModel({ kind: 'deepseek', apiKey: FAKE_KEY }, msgs);
    expect(out).toBe('{"x":1}');
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.deepseek.com/chat/completions');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).authorization).toBe(`Bearer ${FAKE_KEY}`);
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe('deepseek-flash');
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.thinking).toEqual({ type: 'disabled' });
    expect(body).not.toHaveProperty('reasoning_effort');
    expect(body).not.toHaveProperty('tools');
    expect(body.stream).toBe(false);
    expect(body.messages[0]).toEqual({ role: 'system', content: SYSTEM_PROMPT });
    expect(JSON.stringify(body)).not.toContain(FAKE_KEY);
  });
  it('honours MODEL_ENDPOINT / MODEL_NAME but refuses non-https endpoints', async () => {
    const f = stubFetch(() => ok('{}'));
    await callModel({ kind: 'deepseek', apiKey: FAKE_KEY, endpoint: 'https://example.test/', model: 'm' }, msgs);
    expect((f.mock.calls[0] as unknown as [string])[0]).toBe('https://example.test/chat/completions');
    await expect(callModel({ kind: 'deepseek', apiKey: FAKE_KEY, endpoint: 'http://example.test' }, msgs)).rejects.toThrow('provider_endpoint_must_be_https');
  });
});

describe('DeepSeek failures never leak the key and end in the fallback question', () => {
  const env = { SCAN_HMAC_SECRET: 'test-secret-0123456789-abcdefghijklmnop', MODEL_PROVIDER: 'deepseek', DEEPSEEK_API_KEY: FAKE_KEY };
  it('missing key', async () => {
    stubFetch(() => ok('{}'));
    await expect(callModel({ kind: 'deepseek' }, msgs)).rejects.toThrow('provider_not_configured');
  });
  it.each([
    ['HTTP 401', () => new Response(`bad key ${FAKE_KEY}`, { status: 401 }), 'provider_http_401'],
    ['HTTP 500', () => new Response('x', { status: 500 }), 'provider_http_500'],
    ['no choices', () => new Response('{}', { status: 200 }), 'provider_bad_response'],
    ['truncated', () => new Response(JSON.stringify({ choices: [{ message: { content: '{' }, finish_reason: 'length' }] }), { status: 200 }), 'provider_truncated'],
    ['network error', () => { throw new TypeError(`fetch failed for ${FAKE_KEY}`); }, 'provider_network_error'],
  ])('%s -> controlled error', async (_n, impl, code) => {
    stubFetch(impl as never);
    const err = await callModel({ kind: 'deepseek', apiKey: FAKE_KEY }, msgs).catch((e: Error) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe(code);
    expect((err as Error).message).not.toContain(FAKE_KEY);
  });
  it('through the Worker: provider failure -> fixed fallback question, key absent from the response and the logs', async () => {
    stubFetch(() => new Response('nope', { status: 503 }));
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const r = await turn(null, 'Our reports take all day on Fridays.', 0, {}, env);
    expect(r.status).toBe(200);
    expect(r.body.echo).toBe(FALLBACK_ECHO);
    expect(r.body.question).toBe(FALLBACK_QUESTION);
    expect(JSON.stringify(r.body)).not.toContain(FAKE_KEY);
    expect(spy.mock.calls.map((c) => c.join(' ')).join('\n')).not.toContain(FAKE_KEY);
    spy.mockRestore();
  });
  it('through the Worker: a good DeepSeek-shaped reply is used', async () => {
    const reply = JSON.stringify({ echo: 'Reports eat your Fridays.', question: 'What does that cost you each week?', done: false, update: { covered: ['situation'], notes: { situation: 'Weekly reports take a day.' } } });
    stubFetch(() => ok(reply));
    const r = await turn(null, 'Our reports take all day on Fridays.', 0, {}, env);
    expect(r.body.echo).toBe('Reports eat your Fridays.');
    expect(r.body.model.areas.situation.covered).toBe(true);
  });
});
