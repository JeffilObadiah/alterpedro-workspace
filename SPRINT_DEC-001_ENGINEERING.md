# SPRINT DRAFT: DEC-001 Video Hero — Engineering lane (TORVALDS)
Status: DRAFT. Not open. Waiting on DEMING (process check), DRUCKER (acceptance sign-off, pricing), OGILVY (content tasks), human (Rule 001 answer + repo).

## Tasks (roles are placeholders until the teams exist)
E1 Frontend Bot: static hero baseline kept intact as the control and the fallback. Depends on: repo.
E2 Frontend Bot: poster image (AVIF/WebP), `<link rel="preload" as="image" fetchpriority="high">`, `poster` attribute. Depends on: E1, OGILVY poster frame.
E3 Frontend Bot: muted, compressed video (`muted playsinline`, no autoplay dependency on sound), source attached only after the poster paints. Depends on: E2, OGILVY final video file.
E4 Analytics Bot: A/B assignment + conversion event; sample size and run time fixed before launch. Depends on: baseline numbers (DRUCKER item 6), OGILVY test design.
E5 Performance Bot: field LCP (p75, mobile) collection via CrUX/RUM; lab Lighthouse for pre-merge. Depends on: E1.
E6 QA Bot: mobile/desktop/reduced-motion/no-sound/slow-network passes. Depends on: E3.
E7 DevOps Bot: feature flag with kill switch that reverts to static hero without a deploy. Depends on: E1.

## Sequencing
E1 -> (E2, E5, E7 in parallel) -> E3 -> E6 -> E4 test launch -> read-out.

## Acceptance criteria (written before work starts; DRUCKER to confirm)
A1 Control hero unchanged and one flag away at all times (E7 verified by toggling in staging).
A2 Poster is the LCP element and is preloaded with fetchpriority=high (verified in Lighthouse trace).
A3 Video request starts only after poster paint (verified in network waterfall).
A4 Page fully usable with sound off and with video blocked (QA pass).
A5a LAB GATE (pre-launch): Lighthouse mobile, default throttling, median of 5 runs, LCP <= 2.5s on the video variant. Fail = no launch.
A5b FIELD GATE (own RUM, not CrUX, which needs a 28-day window): video variant mobile p75 LCP <= 2.5s.
A5c STOP RULE: LCP is a guardrail, not a conversion read, so it may be checked daily. If rolling 24h mobile p75 LCP on the video variant > 2.5s with at least N mobile sessions, kill switch fires and static hero serves. N PROPOSED = 1,000 (p75 on a small sample is noise). Deming to check.
A5d SAMPLE SIZE: NOT WRITABLE YET. Needs baseline conversion rate, minimum lift worth detecting, and daily traffic. Fixed in DECISIONS.md before launch. Conversion is read once, at that sample size. No peeking.
A6 Sample size and run time recorded in DECISIONS.md before launch.
A7 Winner decided on conversion rate only. BLOCKED: the one counted event is undefined (OPEN-001, human).
A8 Video production: owner, cost, date. OGILVY lane (content) + DRUCKER (price). Engineering side: hero video byte budget set after E1 measures the current hero payload.
A9 Every task has a named owner and done-date. Until the bot teams exist, TORVALDS is the accountable owner of E1-E7. Done-dates: blocked on OPEN-001 and E1 inspection.

## Benchmark vs top 3 competitors
BLOCKED: niche and competitor names unknown. Metrics to compare once known: mobile LCP, total hero payload (KB), time to first video frame. Source: CrUX/PageSpeed for each competitor URL.

## Timeline
NOT ESTIMATED. No repo, no baseline, no video file. Will give durations after E1 inspection.

## Open items needing the human
1. Rule 001: outcome the client wants, and the number that should move.
2. Repo link or stack.
3. Niche / top 3 competitors.
