# BUILD REPORT: Alter Pedro E1 to E3 (+ tokens v2.1 / components v1.1 / gate update)

Built 2026-10-04 (IST) on the box in `/workspace/alterpedro` (git repo, one commit). Nothing deployed, nobody signed in, nothing sent.
Toolchain: Node v22.23.3 (downloaded to `/workspace/tools`, outside the repo; the box default Node 20.19.2 is too old for current Astro/Vitest/Wrangler), npm 10.9.9, Astro 7.3.5, Vitest 5.0.3, Wrangler 4.147.0. Only 3 dev dependencies; 0 npm audit vulnerabilities.

## File tree
```
.dev.vars.example   .gitignore   README.md   BUILD_REPORT.md
astro.config.mjs   package.json   package-lock.json   tsconfig.json   vitest.config.ts   wrangler.jsonc
design/tokens.json            (copy of /workspace/alterpedro_tokens_v2.1.json)
design/components.json        (copy of /workspace/alterpedro_components_v1.1.json)
scripts/gen-tokens.mjs        tokens.json -> src/styles/tokens.css
scripts/check-build.mjs       post-build gate (accent<=3, ink primary, no red, no [PRICE] in PRODUCTION)
src/pages/index.astro         six blocks, build-time switches
src/components/Scan.astro     hero form (real <form>) + <alter-scan> island markup
src/scripts/scan.js           the only JS (custom element, 2,127 B inlined, 999 B gzip)
src/styles/tokens.css         GENERATED from tokens v2.1.0, light default, no TODO/placeholder
src/styles/page.css           layout only, values from tokens
src/worker.ts                 POST /api/scan/turn
src/schema.ts                 Problem Model v1, validation, HMAC sign/verify, output checks
src/model.ts                  callModel(provider, messages), MOCK provider, real-provider stub
src/prompt.ts                 system prompt (rule 3.3)
tests/worker.test.ts (27)  tests/fallback.test.ts (24)  tests/gate.test.ts (7)
tests/helpers.ts   tests/fixtures/{hostile.ts, test-problems.md}
reports/gate-transcript.md  reports/gate-results.json  reports/lighthouse-summary.json
```

## Commands run (real results)
Clean run (`rm -rf node_modules dist .astro` first):
- `npm install` -> added 248 packages, found 0 vulnerabilities. PASS
- `npm run build` -> `check-build: accent usages = 3 (html 2: a.accent, span.marker.accent; css 1: focus ring); max 3` then `check-build: OK`; exit 0. PASS
- `npm test` -> Test Files 3 passed (3), Tests 58 passed (58), exit 0. PASS
  - `GATE (mock): schema-valid 20/20 | hostile 10/10 | echo-clarity NOT SCORED (needs real model + human rubric)`
- `npx wrangler deploy --dry-run --outdir /tmp/wr-out` -> config valid, assets read (1 file, 20.95 KiB / gzip 7.55 KiB), bindings ASSETS + MODEL_PROVIDER listed, "exiting now". No upload, no login. PASS (this is not a deploy; the real `npm run deploy` was never run)
- `npx wrangler dev --local` + curl + headless Chrome: page served, `POST /api/scan/turn` returned signed JSON, form-encoded POST returned escaped HTML, GET returned 405. Headless Chrome (puppeteer-core from the Lighthouse npx cache) typed into the hero, got the challenge question, pressed "I don't know" (reframed question, no repeat), live panel ticked 3 areas, 0 page errors. PASS

Negative tests of the build gates (each run by hand, each failed the build as intended, exit 1):
- `PRODUCTION=1 npm run build` with `[PRICE]` -> `Error: PRODUCTION=1 but the Sprint price is still the "[PRICE]" placeholder`. Also the post-build scan catches `[PRICE]` in dist when PRODUCTION=1.
- `PRODUCTION=1 SPRINT_PRICE="INR 1" npm run build` -> exit 0.
- Added a 4th `.accent` element to dist -> `wine accent used 4 times (max 3)`.
- Put a danger/red token in a rule -> `red/danger colour used in rule ".scan-error"`.
- Made `.btn-primary` use the accent -> fails on "not ink" and "uses the accent".
- `HERO_VARIANT=B` -> headline "You bring the problem. We'll tell you what it actually is."; `HERO_VARIANT=C` -> build error.

## Lighthouse (T1 numbers, real)
Lighthouse 13.5.0 via `npx`, mobile form factor, default simulated throttling (slow 4G, 4x CPU), headless Chrome 154, 5 runs against the built `dist/` served by a small local gzip static server.

| Run | LCP ms | FCP ms | TBT ms | CLS | Perf / A11y / BP / SEO |
|---|---|---|---|---|---|
| 1 | 674 | 674 | 0 | 0 | 100 / 100 / 100 / 100 |
| 2 | 669 | 669 | 0 | 0 | 100 / 100 / 100 / 100 |
| 3 | 668 | 668 | 0 | 0 | 100 / 100 / 100 / 100 |
| 4 | 666 | 666 | 0 | 0.029 | 100 / 100 / 100 / 100 |
| 5 | 661 | 661 | 0 | 0.029 | 100 / 100 / 100 / 100 |

**Median LCP = 668 ms** (gate: <= 2,500 ms). Lab only; field p75 needs RUM (E10).
**JS on the page: 2,127 bytes raw (999 bytes gzip), one inline module script; zero external JS files.** The whole page is 1 request: HTML 17,355 B raw / 6,037 B transferred (gzip), CSS inlined.
Caveats: no web fonts are bundled, so text paints in system fonts; adding real fonts will move LCP. Server was localhost, not Cloudflare. CLS 0.029 appeared in 2 of 5 runs and is unexplained (not investigated).
JS-disabled check: served with `Content-Security-Policy: script-src 'none'`, headless Chrome screenshot (390px wide) shows eyebrow, headline, sub line, labelled textarea, Start button and the Book link. Page is usable with JS off (the form posts to the Worker, which replies with a plain HTML page).

## Gate script results (`npm run gate`, mock provider)
- Schema-valid conversations: 20/20 (each ends `done` within 8 exchanges; min 7, max 8; no question repeated).
- Hostile inputs (10): 10/10 schema-valid, no prompt/canary leak.
- Problems 4, 16, 18, 20: first question is "Give me one example from last week where this got in the way." 4/4 (asserted on output text).
- Problems 1, 9, 11: no "build an app", "build a dashboard" or "you need an app" in any echo/question. 3/3 (asserted on output text).
- Problem 20 via the "I don't know" button: reframed question, different from the previous one, ends `done`, no dead end.
- **Echo-clarity 15/20: NOT SCORED. No pass is claimed.** It needs a real model and a human applying the rubric. `reports/gate-transcript.md` has all 20 transcripts with blank scorer columns; "likely underlying" is shown to the scorer only and was never sent to the engine. The mock's echoes are generic templates.
- Follow-up answers after each opening message are my scripted generic filler, not OGILVY's text.
- The hostile tests with the mock verify plumbing only (delimiting, validation, signing); they say nothing about a real model's resistance to prompt injection.

A real defect the gate caught during the build: my first system prompt quoted the reassurance sentence for "I don't know", and my own prompt-leak detector (8-word run match) then flagged the correct reply as a leak and forced the fallback question. Fixed by rewording the prompt (it no longer contains the sentence). Test 20 now passes through the real path.

## Tokens and rules applied
- `tokens.css` is generated from `design/tokens.json` v2.1.0 (44 light colours, 41 dark overrides under `[data-theme="dark"]`, type scale, spacing, radius, border, shadow, motion, containers). Light is default. The placeholder TODO is gone. Dark mode is emitted but nothing switches it on.
- Primary button = `--color-neutral-900` (ink) text `--color-text-on-ink`. Link and live-panel marker are wine (`.accent`); focus ring is wine. Total 3, enforced at build. The final-CTA and Labs links are ink.
- Errors use amber (`--color-error-*` -> warning tokens). Danger/red tokens are defined but build fails if used.
- Eyebrow uses the serif display family (`--font-display`). The headline uses the sans display scale (44px); tokens say the display serif may be used on marketing hero headlines, I used it only for the eyebrow as instructed.

## Not done / assumed (plain list)
1. **Not deployed, rollback not tested, no Cloudflare account, no login.** E1 acceptance ("URL live, rollback tested") is open. README has the deploy command and the `wrangler rollback` note, untested.
2. `npm run deploy` is exactly `wrangler deploy`; the build runs through `build.command` in `wrangler.jsonc`, so one command builds and deploys. `SCAN_HMAC_SECRET` must be set with `wrangler secret put` first, otherwise the Worker returns 500 `not_configured` (fails closed).
3. Default provider on deploy is the **mock**. A deployed site would ask canned questions. The real provider is an unimplemented stub (TODO E4); if `MODEL_PROVIDER=real` the Worker returns the fixed fallback question every turn.
4. Fonts (Inter, Cinzel) are not bundled or preloaded; system fallbacks render. Needs self-hosting and subsetting (architecture section 2).
5. Page copy: the creative direction gives hero, sub line, placeholder, link and block outlines, but not final block copy (C5). I drafted blocks 2, 3, 4 and 6 text from that document. "Free" and "credited in full against the project" for the doors come from creative direction section 4. All of it needs OGILVY review. Example cards use illustrative problems and are labelled Example; no clients, no statistics, no testimonials. Placeholder text rotation is not implemented (static first placeholder).
6. Proof block is omitted from the HTML entirely (empty `cases` array) rather than hidden with CSS.
7. `#book` and `#labs` links are placeholders (no booking provider, no Labs URL). `BOOKING_URL` env replaces `#book`; there is no env for the Labs link. Build only warns, it does not fail, on `#book` under PRODUCTION=1.
8. No-JS fallback: the Worker also accepts form-encoded POSTs and replies with escaped HTML. This is extra surface beyond the JSON contract; it has no CSRF/origin check. Tested only for escaping and signing.
9. Replay: a visitor can resend an older signed model (stateless design). The cap on a single model state still holds, but a visitor could restart from an earlier state. E5 (Turnstile + rate limits) is the mitigation and is not built.
10. The mock decides "challenge once" by turn 0 only, and may end at 7 exchanges when all areas are covered. The architecture's real rule (3.3) is carried only in the prompt; its behaviour with a real model is untested.
11. The server does not stop a client from calling again after `done` (before the cap); it only enforces the cap of 8.
12. No TypeScript type-check was run (the `typescript` package is not installed; Vitest/Wrangler/esbuild strip types). `tsconfig.json` exists for editors.
13. Compatibility date `2026-09-01` is my choice; Wrangler's dry-run accepted it.
14. Astro anonymous telemetry was disabled on the box (`astro telemetry disable`) and `WRANGLER_SEND_METRICS=false` was used.
15. The "I don't know" button, live panel and error box exist in minimal form to prove the island; the full E7 UI (streaming, voice, keyboard/screen-reader testing, Safari/Chrome mobile checks) is not done. Turnstile, spend cap, D1, summary, analytics, RUM (E4 to E10) are not built.
16. `.dev.vars` (local secret used during the local run) was deleted; `.dev.vars.example` is committed.
