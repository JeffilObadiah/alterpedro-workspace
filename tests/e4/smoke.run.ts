// One real call to verify the request shape: thinking really is OFF, JSON mode works, usage fields exist.
// Prints ONLY non-secret fields. The API key is read from the environment and never printed or written.
import { writeSync } from 'node:fs';
import { expect, it } from 'vitest';
import { buildMessages } from '../../src/worker';
import { blankModel } from '../../src/schema';

it('smoke: one DeepSeek call', async () => {
  const key = process.env.DEEPSEEK_API_KEY;
  expect(key, 'DEEPSEEK_API_KEY must be set in the environment').toBeTruthy();
  const messages = buildMessages(blankModel(), 'Our sales team spends Fridays building reports.', 0, false);
  const body = { model: 'deepseek-flash', messages, response_format: { type: 'json_object' }, thinking: { type: 'disabled' }, temperature: 0.3, max_tokens: 700, stream: false };
  const t0 = performance.now();
  const res = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` }, body: JSON.stringify(body) });
  const ms = Math.round(performance.now() - t0);
  const j = (await res.json()) as any;
  const msg = j.choices?.[0]?.message ?? {};
  const out = { http: res.status, ms, model: j.model, finish: j.choices?.[0]?.finish_reason, has_reasoning_content: 'reasoning_content' in msg && !!msg.reasoning_content, usage: j.usage, content: msg.content, error: j.error ? { type: j.error.type, message: String(j.error.message).replace(key as string, '[redacted]') } : undefined };
  // with thinking ON for comparison (one more call) to prove the switch changes behaviour
  const t1 = performance.now();
  const res2 = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` }, body: JSON.stringify({ ...body, thinking: { type: 'enabled' } }) });
  const ms2 = Math.round(performance.now() - t1);
  const j2 = (await res2.json()) as any;
  const cmp = { http: res2.status, ms: ms2, has_reasoning_content: !!j2.choices?.[0]?.message?.reasoning_content, usage: j2.usage };
  writeSync(1, JSON.stringify({ thinking_disabled: out, thinking_enabled_for_comparison: cmp }, null, 1) + '\n');
});
