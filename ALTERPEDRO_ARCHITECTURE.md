# ALTER PEDRO: ENGINEERING ARCHITECTURE v1 (TORVALDS)
Status: PROPOSED. Converges with OGILVY's ALTERPEDRO_CREATIVE_DIRECTION.md. Visual design (tokens v2.1, components v1.1) is not touched.
Brief: lean, cheap, premium. Number that should move: conversations booked (assumption A1, from OGILVY; human confirmed "lean, cheap, premium").

## Assumptions (every one is mine; the human can overrule any)
- E-A1: Monthly model spend ceiling = USD 50 until the human says otherwise. Hard cap, enforced in code.
- E-A2: Traffic at launch is under 100k requests/day. If that is wrong, cost changes (see Cost).
- E-A3: Scan transcripts are not stored by default. We store data only when the visitor presses "Send me a copy" or books a call. Retention: 90 days, deletable on request. No personal data is asked for before the summary.
- E-A4: Calendar booking uses a hosted scheduler link (no custom calendar code). Provider: human to pick.
- E-A5: Model provider is swappable behind one function. First provider chosen on measured quality and cost per scan, not brand.
- E-A6: Domain and a Cloudflare account exist or will be created by the human.

## 1. Stack (smallest thing that works)
- Site: Astro, static output. Astro renders components to HTML with no client JS unless a `client:*` directive is set (T4: docs.astro.build/en/concepts/islands/). Result: six-block page ships near-zero JS; only the Scan is an island.
- Hosting/API: Cloudflare Workers + static assets. Free plan: 100,000 requests/day, 10 ms CPU per request, and time spent waiting on `fetch()` does not count as CPU (T4: developers.cloudflare.com/workers/platform/limits/). The scan Worker mostly waits on the model, so it fits.
- Storage: one D1 (SQLite) database for leads and the daily spend counter. No other datastore.
- Bot check: Cloudflare Turnstile on the first scan message. (Verify current free-tier terms at implementation; not yet checked.)
- Model: one HTTPS call per turn, streamed to the browser. Structured JSON output (problem model + echo + next question).
- No framework app, no microservices, no queue, no auth system. One repo, one deploy command.

## 2. Hero and performance (answers OGILVY section 10)
- Hero = headline + textarea + Start button, all plain HTML/CSS. Works before JS loads: the form is a real `<form>`; JS upgrades it into the streaming scan. Largest element is text, so LCP is a text paint, no image, no video.
- Fonts: self-hosted, `font-display: swap`, subset, preloaded for the display face only.
- Gates (carried from DEC-001, same numbers): lab Lighthouse mobile LCP <= 2.5s median of 5 runs before launch; field mobile p75 LCP <= 2.5s via own RUM (T4: web.dev LCP). Stop rule: rolling 24h p75 > 2.5s with >= 1,000 mobile sessions => revert hero to static (it already is static; the fallback is disabling the Scan island script).
- DEC-001 (video hero) stays in force for other clients; OGILVY already scoped it out of this site.

## 3. The Scan engine
### 3.1 Stateless turns
Browser holds the Problem Model. Each turn: `POST /api/scan/turn` with `{model, answer, turn, token}`. Worker calls the model, returns `{model', echo, next_question | done}`. The model JSON is HMAC-signed by the Worker so the client cannot forge turn count or inject fields. No database read on the hot path.

### 3.2 Problem Model schema v1 (the API contract)
{
  "areas": { "situation","cost","history","constraint","vision","stake","urgency" : { "covered": bool, "notes": string<=300 } },
  "stated_problem": string<=300,
  "underlying_problem": string<=300 | null,
  "solution_areas": [string] (max 4, never "you need X"),
  "gaps": [string] (max 4),
  "turn": int, "sig": string
}
Turn output: `{ echo: string<=240, question: string<=200 | null, done: bool, model }`.

### 3.3 Next-best-question rule (the intelligence)
System prompt rule, in this order: (1) if the visitor named a solution ("we need an app"), challenge it once; (2) if an uncovered area is implied by the last answer, take that area; (3) if the last answer was vague, ask for one concrete example from last week; (4) otherwise take the uncovered area with highest value: cost > constraint > stake > vision > urgency > history. Hard cap 8 turns, then `done`. "I don't know" button sends a flag; the engine reframes instead of repeating.

### 3.4 Summary
Separate call, same Worker. Output = OGILVY's five parts, written as prose, plus structured fields for the lead record. Each part has a max length enforced by schema. Quality gate below.

### 3.5 Security boundary (non-negotiable)
- Model has no tools, no network, no secrets, no retrieval from internal data. Its only output is JSON validated against the schema; anything that fails validation is dropped and a fixed fallback question is shown.
- Visitor text is passed as data in a delimited field, never concatenated into instructions. Output is rendered as text (escaped), never as HTML.
- Per-visitor: Turnstile on turn 1; rate limit (proposed 10 scans/hour/IP, 40 model calls/hour/IP); max 1,500 characters per answer; max 8 turns.
- Global: daily and monthly spend counters in D1, atomic increment before each model call, hard stop when the ceiling is reached; the site then shows "Scan is resting, book 20 minutes instead" (still converts).
- Logs: no transcript text in logs. Counters and error codes only.
- Lead record only on opt-in; fields: summary, email, timestamp, source page. Deletion = one SQL statement behind an admin token.

## 4. Cost (formula, not a promise)
cost_per_scan = turns (<= 8) x (input_tokens x in_price + output_tokens x out_price) + 1 summary call.
We do not know the number until measured. Task E4 measures it (T1) on the 20 test problems and writes the real figure to DECISIONS.md. The spend ceiling in E-A1 makes the worst case bounded regardless: max scans/month = ceiling / measured cost_per_scan. Hosting at launch volume: USD 0 on the free plan if E-A2 holds.

## 5. Quality gate (the "feeling heard" test)
- OGILVY writes 20 realistic test problems (C4). I run all 20 through the engine and save every transcript.
- Pass = OGILVY scores >= 15 of 20 echoes "said it more clearly than the visitor" AND 20/20 outputs validate against schema AND 0 outputs prescribe a specific product ("you need an app") AND 0 prompt-injection attempts from a fixed set of 10 hostile inputs leak instructions or change behaviour.
- Thresholds 15/20 and 10 hostile inputs are my proposal; Deming/Drucker to confirm.
- After that: ship to ~10 real people (OGILVY test plan step 1). No A/B until a baseline exists.

## 6. Analytics (minimum)
Events: scan_started, scan_turn_n, scan_completed, summary_viewed, copy_requested, call_booked, sprint_clicked. Cookieless, first-party, written to D1 or the host's analytics. The north-star metric = call_booked / visitors; funnel shows where people leave.

## 7. Tasks (bounded, each with output + acceptance)
E1 Repo + deploy pipeline. Out: empty Astro site deployed to the Cloudflare URL by one command. Accept: URL live, rollback tested.
E2 Static page, six blocks, tokens/components applied, copy from OGILVY (C1,C5). Accept: Lighthouse mobile LCP <= 2.5s median of 5; page usable with JS disabled.
E3 Scan Worker: /api/scan/turn, schema, signing, validation, fallback question. Accept: 20/20 schema-valid on test set; tampered `sig` rejected.
E4 Model integration + cost measurement. Accept: cost_per_scan measured over 20 scans and recorded.
E5 Abuse controls: Turnstile, rate limits, spend cap. Accept: scripted burst is throttled; setting cap to $0 shows the fallback; no transcript in logs.
E6 Summary generator + two-door CTA + "Send me a copy" + D1 lead record. Accept: summary has 5 parts within length caps; lead row written only on opt-in; delete works.
E7 Scan UI island: streaming echo, "I don't know" button, live panel, voice input (browser speech API where available, typed input always works). Accept: works on mobile Safari + Chrome; keyboard and screen-reader usable.
E8 Analytics events. Accept: funnel visible end to end on test traffic.
E9 Quality gate run (section 5) with OGILVY's 20 problems + 10 hostile inputs.
E10 RUM for field LCP + stop rule.
Sequence: E1 -> E2 and E3 in parallel -> E4 -> E5 -> E6 -> E7 -> E8 -> E9 -> E10 -> ship to 10 people.
Owner: TORVALDS for all E-tasks. Dates: none until the human states a deadline; I will not invent one.

## 8. What I need from the human (only these, none block E1-E3)
1. Cloudflare account + domain (needed at E1 deploy; you will have to log in yourself, I cannot do sign-ins in a room).
2. Confirm or change the USD 50/month spend ceiling (E-A1).
3. Pick the booking link provider (E-A4).
4. Solution Sprint price (OGILVY needs it before launch).

## 9. Rejected, with reason
- Custom backend + Postgres + auth: more surface and cost, no benefit at this volume.
- Video/animated hero: OGILVY and I agree the text hero is cheaper and is the product itself.
- Storing every transcript: raises privacy risk and cost with no near-term use. Reopen only with a stated need.
- Seven separate PEDRO tools: the brief itself says do not build them now.
