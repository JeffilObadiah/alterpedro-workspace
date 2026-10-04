# Alter Pedro (E1 to E3)

Static Astro site + one Cloudflare Worker route (`POST /api/scan/turn`). Nothing here has been deployed. No account, no sign-in.

Requires **Node >= 22.12** (Astro 7, Vitest 5 and Wrangler 4 need it).

## Commands

| Command | What it does |
|---|---|
| `npm install` | install (3 dev dependencies: astro, wrangler, vitest) |
| `npm run dev` | Astro dev server (page only; the API is not served here, use `npm run preview`) |
| `npm run build` | regenerate `src/styles/tokens.css` from `design/tokens.json`, build to `dist/`, then run `scripts/check-build.mjs` |
| `npm test` | Vitest: unit tests + the quality-gate harness (offline, mock provider) |
| `npm run gate` | only the gate harness; writes `reports/gate-transcript.md` |
| `npm run preview` | `wrangler dev` locally: static site + Worker together (copy `.dev.vars.example` to `.dev.vars` first) |
| `npm run deploy` | `wrangler deploy` |

## Deploy (single command)

```
PRODUCTION=1 npm run deploy                                  # launch: single door (free 20-minute call only)
PRODUCTION=1 SPRINT_PRICE="<the real price>" npm run deploy  # later: two doors (adds the Solution Sprint)
```

`wrangler.jsonc` has a `build.command` that runs `npm run build` with `BOOKING_URL` defaulting to `https://cal.com/alter-pedro-discovery` (public, not a secret; override by setting `BOOKING_URL` in the shell; POSIX shell syntax), so this builds, checks and uploads in one step. `.env.example` lists the build-time settings. Before the first deploy, once:

```
npx wrangler login                       # human, interactive
npx wrangler secret put SCAN_HMAC_SECRET # a long random string
```

With `PRODUCTION=1` the build **fails** if the booking link is still `#book`, `BOOKING_URL` is unset, or `BOOKING_URL` does not start with `https://cal.com/` or `https://app.cal.com/` (with a path after it). The rule lives in `scripts/booking.mjs` and is enforced twice: when Astro renders the page, and by `scripts/check-build.mjs` on the built output. Dev and non-production builds are unaffected (`#book` stays a placeholder).

## Rollback

Each deploy is a Worker version. To go back: `npx wrangler versions list` then `npx wrangler rollback <version-id>` (omit the id for the previous version). Rollback has **not** been tested: there is no Cloudflare account on the build box (E1 acceptance "rollback tested" is still open).

## Build-time switches

| Env var | Effect |
|---|---|
| `HERO_VARIANT=A` (default) / `B` | Headline test. A: "Describe the problem. Get it back in writing, in 3 minutes." B: "You bring the problem. We'll tell you what it actually is." |
| `SPRINT_PRICE` | **The single-door switch (DEC-005).** Unset/empty (launch): Door 2 renders nowhere (page block 2 example part 5, engine closing step 5, end summary); the only next step is the free 20-minute call (button "Book 20 minutes" to `BOOKING_URL`); the model prompt never offers a Sprint; the build fails if a banned word appears in the built output. Set: Door 2 renders with this price and the credit line |
| `BOOKING_URL` | Replaces the `#book` placeholder link. Under `PRODUCTION=1` it is required and must be a `https://cal.com/…` or `https://app.cal.com/…` link |
| `PRODUCTION=1` | Build fails if the booking link is missing / not cal.com, or if `SPRINT_PRICE` is the literal `[PRICE]` |

## Design tokens and the build checks

`design/tokens.json` (v2.1.0) and `design/components.json` (v1.1.0) are copies of the human's files. `scripts/gen-tokens.mjs` turns tokens into `src/styles/tokens.css` (light mode default; dark values only under `[data-theme="dark"]`). Do not hand-edit `tokens.css`.

`scripts/check-build.mjs` runs after every build and fails it when:
- wine accent is used more than 3 times on the built page (counts: HTML elements with class `accent`, the focus ring once, any other CSS rule that references an accent token);
- the primary button is not ink (`--color-neutral-900`) or uses the accent;
- red/danger tokens are used anywhere (errors use amber via `--color-error-*`);
- single-door mode (`SPRINT_PRICE` unset) and any banned word appears in any text file of the output: `Solution Sprint`, `Sprint`, `credited`, `credit`, `price`, `pricing`, `[PRICE]`, `Door 1`, `Door 2` (list in `scripts/banned-words.mjs`, from `ALTERPEDRO_SINGLE_DOOR_COPY.md`; case-insensitive substring);
- two-door mode (`SPRINT_PRICE` set) and the built page lacks "Door 2" or the price;
- `PRODUCTION=1` and `SPRINT_PRICE` is the literal `[PRICE]`;
- `PRODUCTION=1` and the booking link is `#book`, unset, or not a cal.com link (tested in `tests/check-build.test.ts`);
- the hero does not have 6 to 8 example chips, or a chip phrase is not found verbatim in the research file (`tests/fixtures/research.md`, copy of `ALTERPEDRO_RESEARCH.md`), or a chip uses the accent.

## Page

One page, `src/pages/index.astro`, six blocks: hero (real `<form>`), "What you get back" (labelled Example), stated vs real (labelled Examples), method, proof (omitted from the HTML until `cases` in the page frontmatter holds a REAL case), final CTA + Labs line. The only JS is the `<alter-scan>` custom element (`src/scripts/scan.js`, about 2.1 KB, inlined). Without JS the form posts to `/api/scan/turn` and the Worker answers with a plain HTML page (escaped text) carrying the signed state in a hidden field, so the Scan also works with JS disabled.

## Example chips and layout stability

- Chips (`src/data/chips.json`, rendered in `Scan.astro`) fill the textarea and focus it. Each text is an exact string from the research file section 3 (autocomplete or forum wording). Components v1.1 has no chip component, so a chip is the **ghost button, size sm** (32px visual, 44px hit area), ink, never wine.
- Chips are server-rendered, so their space is reserved from first paint. With JS blocked they are invisible but keep their space; with scripting switched off in the browser they collapse.
- The Scan area (question log + live panel + "I don't know") sits in a fixed-height `.scan-stage` that is reserved from first paint, so nothing moves when it fills. Cause of the earlier CLS 0.029: see BUILD_REPORT.md.

## Worker (`src/worker.ts`)

- `POST /api/scan/turn` body `{ model, answer, turn, dont_know }` -> `{ echo, question, done, model }`. `model` is the Problem Model v1 (`src/schema.ts`), HMAC-SHA256 signed with `SCAN_HMAC_SECRET` over a canonical encoding that includes the turn count. Any edit to the model or turn is rejected (403).
- Limits: answer <= 1500 chars, <= 8 turns (the 8th answer returns `done`, a 9th is rejected with 409), body <= 32 KB.
- Output from the model is parsed and checked strictly by hand-written validation (exact keys, length caps, no `<` `>`, no links, no product prescription, no prompt text). Anything that fails gives the fixed fallback question ("Can you give me one example from last week where this got in the way?"). A failed turn still counts toward the cap.
- Prompt: `src/prompt.ts` (next-best-question rule, architecture 3.3). Visitor text only goes in as JSON inside `<visitor_data>` in a separate message, with `<` and `>` escaped so it cannot close the delimiter.
- One model entry point: `callModel(provider, messages)` in `src/model.ts`. Default provider is the **mock** (deterministic, offline). The `real` provider is a stub that reads `MODEL_API_KEY` and `MODEL_ENDPOINT` and throws `NOT_IMPLEMENTED` (TODO E4); the Worker then returns the fallback question.
- Logs carry only an event name, an error code and the turn number.

## What the tests do and do not prove

- They prove: schema validity, signing/tamper rejection, the turn cap, the answer-size limit, malformed or unsafe model output -> fallback, no transcript text in logs, and that the 10 hostile strings do not change the output schema or leak `src/prompt.ts` text.
- **The hostile-input tests run against the MOCK provider, which never reads instructions from text. They verify the plumbing only (delimiting, validation, signing). They say nothing about how a real model behaves under prompt injection.** That has to be re-run at E4/E9 with the real provider.
- The "said it more clearly than the visitor" echo score (15/20) is **not scored** and cannot be with the mock. `npm run gate` writes the transcript to `reports/gate-transcript.md` for a human to score against `tests/fixtures/test-problems.md`.

## Known limits (by design at this stage)

- Stateless signing cannot stop replay of an older signed model (a visitor can re-send an earlier state). Bounded by E5 (Turnstile, per-IP rate limit, spend cap), which is not built.
- No Turnstile, rate limits, spend cap, summary call, lead storage or analytics yet (E4 to E10).
- Fonts are not bundled: the stack in the tokens (Inter / Cinzel) falls back to system fonts. Self-hosted, subset, `font-display: swap` fonts are still to do and will change the LCP numbers.

## Single door vs two doors (DEC-005)

`scripts/gen-site-config.mjs` writes `src/site-config.json` (`sprintEnabled`) from `SPRINT_PRICE` at build time; the Worker reads it (a Worker `SPRINT_PRICE` var overrides it). Unset: `SYSTEM_PROMPT_SINGLE_DOOR` is sent to the model (closing = free 20-minute call only) and `parseModelOutput` rejects any model output that mentions a Sprint or a door (the fixed fallback question is used instead). Set: `SYSTEM_PROMPT_TWO_DOORS` (never states an amount). Tests: `tests/single-door.test.ts` and `tests/check-build.test.ts`.
