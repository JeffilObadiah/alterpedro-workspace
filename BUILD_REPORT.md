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

---

# Follow-up 1: chips, CLS fix, cal.com booking rule (2026-10-04, IST)

## Chips (7)
Source: `src/data/chips.json`, exact strings from `ALTERPEDRO_RESEARCH.md` section 3 (copy in `tests/fixtures/research.md`):
`systems that don't talk to each other` (3.1 autocomplete) | `website traffic but no leads` (3.2 autocomplete) | `I keep manually sending weekly reports` (3.3 forum quote) | `where to start with ai` (3.4 autocomplete) | `Our inventory is accurate on paper and wrong on the shelf` (3.7 forum title) | `stock mismatch` (3.7 autocomplete) | `failed erp implementation` (3.8 autocomplete).
Not used on purpose: "old software" (research says consumer intent) and the "i have an idea for an app" family (different buyer, and it names a solution).
- Components v1.1 has no chip/pill, so a chip = ghost button, size sm. Ink, no wine; accent budget still 3 (check-build reports `accent usages = 3`).
- Works with JS: click fills the textarea with the exact phrase and focuses it (verified in headless Chrome at 4 widths). Without JS: CSS `@media (scripting: none)` collapses them; if scripts are blocked another way (CSP/extension) they are `visibility:hidden` until the island sets `data-ready`. Verified by screenshot with `script-src 'none'`.
- I added a small visible "Examples:" label and an `aria-label` on the group (rule: example content is labelled Example). OGILVY may reword it. OGILVY's copy was not changed.
- Assertions: `tests/chips.test.ts` (6 to 8, verbatim in research file, section matches, no duplicates) and `scripts/check-build.mjs` (built page has 6 to 8 chips, each verbatim in the research file and in chips.json, label equals fill text, none uses `accent`).

## CLS: cause and fix
Cause (reproduced and measured, not guessed): Lighthouse blamed `section#what-you-get` (score 0.0288), i.e. something above it grew when the island script ran. Two defects in my own island, both fixed:
1. The island created an "I don't know" button with `hidden`, but `.btn { display:inline-flex }` overrides the `hidden` attribute, so the button was visible and wrapped the hero row. Measured: row 55px (no JS) vs 90px (JS), `#what-you-get` top 683px vs 718px. It only counted in Lighthouse runs where the first paint came before the script ran (2 of 5), which is why it was intermittent. Fix: global `[hidden]{display:none!important}`, and the button now lives in the reserved stage.
2. Found while testing interaction: swapping the Start label to "Send" widened the button by 3px (91 to 94px), which made the row wrap again at 412px wide (+35px shift on the first answer). Fix: the label stays "Start".
Also: the done state used to hide the textarea/label/button (shrinking the hero); it now disables them. The question log is a fixed 11rem scroll area and the stage is a fixed `34rem` (measured natural content 506px after 7 turns, stage 544px) so nothing moves as answers arrive.

Interaction check (puppeteer, wrangler dev, chip click + 7 turns, at 360, 412, 768, 1280 px wide): `#what-you-get` top unchanged at every width; layout-shift entries: none at any width. (Before the fixes the same script recorded 0.029, 0.028, 0.0023+0.0153 and 0.0026.)

## Lighthouse mobile, 5 runs after the fixes (lighthouse 13.5.0, default mobile throttling, local gzip server)
| Run | LCP ms | CLS | TBT ms | Perf/A11y/BP/SEO |
|---|---|---|---|---|
| 1 | 674 | 0 | 0 | 100/100/100/100 |
| 2 | 670 | 0 | 0 | 100/100/100/100 |
| 3 | 671 | 0 | 0 | 100/100/100/100 |
| 4 | 682 | 0 | 0 | 100/100/100/100 |
| 5 | 672 | 0 | 0 | 100/100/100/100 |
**Median LCP 672 ms (was 668). Median CLS 0 (all five runs 0).** Page: 1 request, 19,800 B HTML (6,376 B gzip); JS: one inline script, 2,283 B raw (1,059 B gzip). Same caveats as before (localhost, system fonts, lab only). Lighthouse does not interact with the page, so the interaction result above is from puppeteer.

## Booking link rule
- Under `PRODUCTION=1` the build now FAILS (not warns) when the link is `#book`, `BOOKING_URL` is unset/empty, or it does not start with `https://cal.com/` or `https://app.cal.com/` with a path after (`scripts/booking.mjs`). Enforced at Astro render and again on the built output (built page must link to exactly `BOOKING_URL`). Non-production builds unaffected.
- Checked by hand: `PRODUCTION=1 SPRINT_PRICE=x npm run build` -> `Error: PRODUCTION=1 but BOOKING_URL is not set`, exit 1. Automated: `tests/check-build.test.ts` (unset, `#book`, calendly, http://, host look-alikes `cal.com.evil.example`, empty path, quotes/spaces; passes for cal.com and app.cal.com; dev build with `#book` passes; `[PRICE]` and chip failures too).
- `npm test` now: 5 files, 89 tests passed.

---

# Follow-up 2: booking link set to https://cal.com/alter-pedro-discovery (2026-10-04, IST)

- `BOOKING_URL=https://cal.com/alter-pedro-discovery` is set in `.env.example` and as the default inside `wrangler.jsonc` `build.command` (`BOOKING_URL=${BOOKING_URL:-https://cal.com/alter-pedro-discovery} npm run build`, POSIX shell). It is public, not a secret. The site reads it from the environment at build time (`process.env.BOOKING_URL`).
- The guard is unchanged and still strict: a plain `npm run build` with `PRODUCTION=1` and no `BOOKING_URL` in the shell still fails; only the wrangler deploy path supplies the default. Dev builds still use the `#book` placeholder.
- `[PRICE]` still blocks a production build until the human gives a price. `TEST-ONLY` below is a dummy used purely to show the booking check passing; it must never be deployed.
- Tests: `npm test` -> 6 files, 102 tests passed (added: real URL accepted).

Captured output (real, from `/tmp/booking-evidence.txt`; progress lines trimmed to the error/OK lines):

```
=== (a) PRODUCTION=1 with BOOKING_URL unset, or #book: must FAIL (price supplied so only the booking rule is tested) ===
$ env -u BOOKING_URL PRODUCTION=1 SPRINT_PRICE=TEST-ONLY npm run build
15:52:42   ├─ /index.html15:52:42 [ERROR] Error: PRODUCTION=1 but BOOKING_URL is not set. Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
> node scripts/gen-tokens.mjs && astro build && node scripts/check-build.mjs
PRODUCTION=1 but BOOKING_URL is not set. Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
[exit 1]

$ PRODUCTION=1 SPRINT_PRICE=TEST-ONLY BOOKING_URL="#book" npm run build
15:52:43   ├─ /index.html15:52:43 [ERROR] Error: PRODUCTION=1 but booking link is still the "#book" placeholder. Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
> node scripts/gen-tokens.mjs && astro build && node scripts/check-build.mjs
PRODUCTION=1 but booking link is still the "#book" placeholder. Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
[exit 1]

=== (b) PRODUCTION=1 with the real cal.com URL ===
--- b1: exact user case, no price yet -> booking rule passes, build stops on [PRICE] ---
$ PRODUCTION=1 BOOKING_URL=https://cal.com/alter-pedro-discovery npm run build
15:52:44   ├─ /index.html15:52:44 [ERROR] Error: PRODUCTION=1 but the Sprint price is still the "[PRICE]" placeholder. Set SPRINT_PRICE.
> node scripts/gen-tokens.mjs && astro build && node scripts/check-build.mjs
PRODUCTION=1 but the Sprint price is still the "[PRICE]" placeholder. Set SPRINT_PRICE.
[exit 1]

--- b2: same URL with a dummy price TEST-ONLY (proves the booking check passes end to end; dummy price is NOT for deploy) ---
$ PRODUCTION=1 SPRINT_PRICE=TEST-ONLY BOOKING_URL=https://cal.com/alter-pedro-discovery npm run build
15:52:45 [build] Complete!
> node scripts/gen-tokens.mjs && astro build && node scripts/check-build.mjs
check-build: OK
check-build: accent usages = 3 (html 2: <a class="accent small"> in index.html, <span class="marker accent"> in index.html; css 1: focus ring (:focus-visible)); max 3
[exit 0]

href="https://cal.com/alter-pedro-discovery"
=== (c) non-cal.com URLs: must FAIL ===
$ PRODUCTION=1 SPRINT_PRICE=TEST-ONLY BOOKING_URL=https://calendly.com/alter-pedro-discovery npm run build
15:52:46   ├─ /index.html15:52:46 [ERROR] Error: PRODUCTION=1 but BOOKING_URL must start with https://cal.com/ or https://app.cal.com/ (got "https://calendly.com/alter-pedro-discovery"). Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
> node scripts/gen-tokens.mjs && astro build && node scripts/check-build.mjs
PRODUCTION=1 but BOOKING_URL must start with https://cal.com/ or https://app.cal.com/ (got "https://calendly.com/alter-pedro-discovery"). Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
[exit 1]

$ PRODUCTION=1 SPRINT_PRICE=TEST-ONLY BOOKING_URL=https://cal.com.evil.example/alter-pedro-discovery npm run build
15:52:47   ├─ /index.html15:52:47 [ERROR] Error: PRODUCTION=1 but BOOKING_URL must start with https://cal.com/ or https://app.cal.com/ (got "https://cal.com.evil.example/alter-pedro-discovery"). Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
> node scripts/gen-tokens.mjs && astro build && node scripts/check-build.mjs
PRODUCTION=1 but BOOKING_URL must start with https://cal.com/ or https://app.cal.com/ (got "https://cal.com.evil.example/alter-pedro-discovery"). Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
[exit 1]

=== dev build, nothing set: unaffected ===
$ npm run build
15:52:48 [build] Complete!
> node scripts/gen-tokens.mjs && astro build && node scripts/check-build.mjs
check-build: OK
check-build: accent usages = 3 (html 2: <a class="accent small"> in index.html, <span class="marker accent"> in index.html; css 1: focus ring (:focus-visible)); max 3
[exit 0]

$ PRODUCTION=1 npx wrangler deploy --dry-run        (via wrangler's build.command, no price; NOT a deploy)
-> Running custom build `BOOKING_URL=${BOOKING_URL:-https://cal.com/alter-pedro-discovery} npm run build` failed
-> Error: PRODUCTION=1 but the Sprint price is still the "[PRICE]" placeholder. Set SPRINT_PRICE.   (booking rule passed; only the price stops it)
$ PRODUCTION=1 SPRINT_PRICE=TEST-ONLY npx wrangler deploy --dry-run
-> check-build: OK ; Total Upload: 23.06 KiB / gzip: 8.29 KiB ; --dry-run: exiting now.
```

## DEC-005: single door at launch (SPRINT_PRICE switch)

Source of wording: `ALTERPEDRO_SINGLE_DOOR_COPY.md` (OGILVY). The old "`[PRICE]` blocks a production build" guard is replaced by a `SPRINT_PRICE` switch. Earlier sections of this report that mention the `[PRICE]` guard (including the Follow-up 2 captures) describe the previous behaviour and are superseded by this section.

- **`SPRINT_PRICE` unset/empty (launch):** Door 2 renders nowhere. Page block 2 example part 5 is `5. Next step: A free 20-minute call. We go through the summary with you and tell you honestly whether we can help, and how.` (no "Door 1" label). The engine's closing step is the free 20-minute call only; the end summary shows the button "Book 20 minutes" linking to `BOOKING_URL`. The model prompt (`SYSTEM_PROMPT_SINGLE_DOOR`) never mentions a Sprint, and `parseModelOutput` rejects any model output that mentions a Sprint, a door or `[PRICE]` (the fixed fallback question is used instead). The production build FAILS if any banned word appears in any text file of the built output: Solution Sprint, Sprint, credited, credit, price, pricing, [PRICE], Door 1, Door 2 (`scripts/banned-words.mjs`, case-insensitive substring, deliberately stricter than whole-word).
- **`SPRINT_PRICE` set:** two-door version as before (Door 1 free call, Door 2 Solution Sprint with the price and "credited in full" line), `SYSTEM_PROMPT_TWO_DOORS` (never states an amount). `check-build` then requires "Door 2" and the price in the page.
- **`PRODUCTION=1`** still fails on a missing / non-cal.com `BOOKING_URL`. `SPRINT_PRICE` equal to the literal `[PRICE]` under `PRODUCTION=1` also fails.
- Mechanism: `scripts/gen-site-config.mjs` writes `src/site-config.json {sprintEnabled}` at build time; the Worker reads it (a Worker `SPRINT_PRICE` var overrides it). `wrangler.jsonc` `build.command` runs the same npm build, so `PRODUCTION=1 npm run deploy` now needs no price.
- Door 2 price used in the two-door capture below is the dummy `INR 99,000 (test value)`; it is not a real price and must never be deployed. The real price is not supplied.

### Tests (both modes)

`npm test`: 7 files, **131 tests, all pass** (new: `tests/single-door.test.ts`; updated: `tests/check-build.test.ts`). They cover: the banned list and matcher; single-door prompt has no Sprint/price/credit/door wording and ends with the free call only; two-door prompt offers the Sprint without stating an amount; the Worker sends the single-door prompt when `SPRINT_PRICE` is unset and the two-door one when set (and the env override); the output filter rejects Sprint/door/[PRICE] mentions in single-door mode and allows them in two-door mode; `check-build` fixture dirs for both modes (unset + clean passes, unset + each banned word fails, set without Door 2/price fails, set with them passes, production booking rules in both); and two real `astro build` runs (unset and set) into temp dirs.

### Captured build outputs (real runs, 2026-10-04 ~15:57 IST)

```
=== 1. single door, production (launch config): PRODUCTION=1, cal.com link, SPRINT_PRICE unset ===
$ PRODUCTION=1 BOOKING_URL=https://cal.com/alter-pedro-discovery npm run build
15:57:13 [build] Complete!
check-build: OK
check-build: accent usages = 3 (html 2: <a class="accent small"> in index.html, <span class="marker accent"> in index.html; css 1: focus ring (:focus-visible)); max 3
check-build: mode = single door (SPRINT_PRICE unset)
site-config: sprintEnabled=false (single door)
[exit 0]

--- built page, part 5 and banned-word grep (expect no matches) ---
<h3>5. Next step</h3><p class="secondary">A free 20-minute call. We go through the summary with you and tell you honestly whether we can help, and how.</p>
banned-word matches in dist: 0

=== 2. two doors: PRODUCTION=1, cal.com link, SPRINT_PRICE set (dummy test value, not a real price) ===
$ PRODUCTION=1 BOOKING_URL=https://cal.com/alter-pedro-discovery SPRINT_PRICE='INR 99,000 (test value)' npm run build
15:57:14 [build] Complete!
check-build: OK
check-build: accent usages = 3 (html 2: <a class="accent small"> in index.html, <span class="marker accent"> in index.html; css 1: focus ring (:focus-visible)); max 3
check-build: mode = two doors (SPRINT_PRICE set)
site-config: sprintEnabled=true (two doors)
[exit 0]

<h3>5. Next step</h3><ul class="secondary"><li><strong>Door 1:</strong> a 20-minute call. Free.</li><li><strong>Door 2:</strong> a Solution Sprint. Half a day, led by a person, INR 99,000 (test value), credited in full against the project if you go ahead.</li></ul>

=== 3. banned word injected into the single-door output must FAIL the production build ===
$ PRODUCTION=1 BOOKING_URL=https://cal.com/alter-pedro-discovery node scripts/check-build.mjs   (dist hand-edited to contain 'Sprint')
check-build: mode = single door (SPRINT_PRICE unset)
check-build FAILED:
 - single door: banned word while SPRINT_PRICE is unset: dist/index.html: "Sprint" in …A free 20-minute call, then a Sprint. We go through the summary wi…
 - PRODUCTION=1 and href="#book" placeholder still in dist/index.html
 - PRODUCTION=1 and the built page does not link to BOOKING_URL in dist/index.html
[exit 1]

=== 4. PRODUCTION=1 still fails on missing / non-cal.com BOOKING_URL (single door) ===
$ env -u BOOKING_URL PRODUCTION=1 npm run build
Error: PRODUCTION=1 but BOOKING_URL is not set. Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
PRODUCTION=1 but BOOKING_URL is not set. Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
site-config: sprintEnabled=false (single door)
[exit 1]

$ PRODUCTION=1 BOOKING_URL=https://calendly.com/alter-pedro-discovery npm run build
Error: PRODUCTION=1 but BOOKING_URL must start with https://cal.com/ or https://app.cal.com/ (got "https://calendly.com/alter-pedro-discovery"). Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
PRODUCTION=1 but BOOKING_URL must start with https://cal.com/ or https://app.cal.com/ (got "https://calendly.com/alter-pedro-discovery"). Set BOOKING_URL to a https://cal.com/ or https://app.cal.com/ link.
site-config: sprintEnabled=false (single door)
[exit 1]

=== 5. SPRINT_PRICE='[PRICE]' literal in production ===
$ PRODUCTION=1 BOOKING_URL=https://cal.com/alter-pedro-discovery SPRINT_PRICE='[PRICE]' npm run build
Error: PRODUCTION=1 but SPRINT_PRICE still contains the "[PRICE]" placeholder. Set a real price or leave SPRINT_PRICE unset for the single-door launch.
PRODUCTION=1 but SPRINT_PRICE still contains the "[PRICE]" placeholder. Set a real price or leave SPRINT_PRICE unset for the single-door launch.
site-config: sprintEnabled=true (two doors)
[exit 1]

=== 6. dev build restored ===
$ npm run build
15:57:20 [build] Complete!
check-build: OK
check-build: accent usages = 3 (html 2: <a class="accent small"> in index.html, <span class="marker accent"> in index.html; css 1: focus ring (:focus-visible)); max 3
check-build: mode = single door (SPRINT_PRICE unset)
site-config: sprintEnabled=false (single door)
[exit 0]


$ PRODUCTION=1 npx wrangler deploy --dry-run   (no price; NOT a deploy)
[custom build] > node scripts/gen-tokens.mjs && node scripts/gen-site-config.mjs && astro build && node scripts/check-build.mjs
[custom build] check-build: mode = single door (SPRINT_PRICE unset)
[custom build] check-build: accent usages = 3 (html 2: <a class="accent small"> in index.html, <span class="marker accent"> in index.html; css 1: focus ring (:focus-visible)); max 3
[custom build] check-build: OK
Total Upload: 24.57 KiB / gzip: 8.80 KiB
--dry-run: exiting now.
[exit 0]
```

Reading the captures: (1) launch config builds, passes check-build in single-door mode, has 0 banned-word matches in `dist`; (2) with a price set, Door 1 and Door 2 render and the build passes; (3) a hand-edited `dist` with "Sprint" makes the check fail (the other two lines are only because that edit step re-used a non-production dist where the booking link is the `#book` placeholder, not a second defect); (4) a missing or non-cal.com booking link still fails the production build; (5) a literal `[PRICE]` fails; the wrangler dry-run (no deploy) now passes with no price.

Not done / assumed (DEC-005): the "Prefer to keep a copy first? Email me this summary." line belongs to the E6 summary screen, which is not built. The live end-summary screen (E6) must render through the same switch when it is built. Banned-word scan covers text outputs in `dist` (html, js, css, json, txt, xml, svg, webmanifest); it does not read images.
