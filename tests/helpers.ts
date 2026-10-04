import worker, { type Env } from '../src/worker';
import { validateModel, verifyModel, type ProblemModel } from '../src/schema';

export const SECRET = 'test-secret-0123456789-abcdefghijklmnop';
export const env: Env = { SCAN_HMAC_SECRET: SECRET };

export interface TurnResponse { echo: string; question: string | null; done: boolean; model: ProblemModel }

export function post(body: unknown, e: Env = env, contentType = 'application/json'): Promise<Response> {
  return worker.fetch(
    new Request('https://example.test/api/scan/turn', {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    e,
  );
}

/** Send one turn; returns status + parsed JSON. */
export async function turn(model: ProblemModel | null, answer: string, n: number, extra: Record<string, unknown> = {}, e: Env = env) {
  const res = await post({ model, answer, turn: n, ...extra }, e);
  return { status: res.status, body: (await res.json()) as TurnResponse & { error?: string } };
}

export async function expectValidTurn(body: TurnResponse, e: Env = env) {
  const keys = Object.keys(body).sort().join(',');
  if (keys !== 'done,echo,model,question') throw new Error(`unexpected response keys: ${keys}`);
  if (typeof body.echo !== 'string' || body.echo.length < 1 || body.echo.length > 240) throw new Error('echo invalid');
  if (body.done ? body.question !== null : typeof body.question !== 'string' || body.question.length < 1 || body.question.length > 200) throw new Error('question/done invalid');
  if (!validateModel(body.model)) throw new Error('model schema invalid');
  if (!(await verifyModel(body.model, e.SCAN_HMAC_SECRET as string))) throw new Error('model signature invalid');
}
