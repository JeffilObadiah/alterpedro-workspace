# WAR ROOM DECISIONS

Single source of truth for the War Room. Every settled decision goes here. Every bot reads from it and writes to it. Append new entries at the bottom with the next DEC ID.

## Standing Rules

### Rule 001
Before proceeding on any proposal that changes brand, architecture, or scope, ask the human one question: what is the outcome the client actually wants, and which number should move? No work begins without that answer. Applies to OGILVY and TORVALDS.

## DEC-001
- Date: 2026-10-04
- Room: WAR ROOM
- Proposer: Human (client proposal: full-bleed video hero on the homepage)
- Decision: Do not ship a bare full-bleed video hero; ship a tested version with a product-proof video, a preloaded poster image, a muted video that starts after the poster paints, an A/B test against the static hero, and a gate that mobile field LCP at the 75th percentile must be 2.5s or less, otherwise the static hero ships.
- Evidence:
  - T4: web.dev, Largest Contentful Paint. Good LCP is 2.5s or less at the 75th percentile, and a video's poster image or first painted frame is an LCP candidate. https://web.dev/articles/lcp
  - T4: web.dev, video performance guide and lazy-loading video article. Use a `poster` attribute and preload the poster with high priority when it is the LCP element. https://web.dev/learn/performance/video-performance and https://web.dev/articles/lazy-loading-video
  - T3: Conversion Rate Experts win report. Replacing a lifestyle hero video with a benefit-led product video lifted conversions 26%. Both versions had video, so the content decided the result. https://conversion-rate-experts.com/diamondback-covers-new-homepage-hero-video-win-report/
  - Caveat: no T1 data from the client's site yet; no lift is promised.
- Owner: OGILVY (what the video shows, headline, A/B test design); TORVALDS (poster, video loading, performance budget and LCP gate)
- Parked items:
  - Test sample size and run time: to be agreed before launch. Reopen when the client's baseline traffic and conversion numbers are known.
  - Video as second hero slide instead of replacing the static hero: parked. Reopen if the first A/B test shows no win.
- Status: SETTLED

## DEC-002
- Date: 2026-10-04
- Room: WAR ROOM
- Proposer: Human (client proposal: abandon the existing blue brand color for a bold red)
- Decision: Do not abandon brand blue outright; first get the client's reason, desired outcome and target metric, then A/B test a darker red as the accent or call-to-action color with blue kept as the base, using a shade that meets WCAG contrast and error states that do not rely on color alone.
- Evidence:
  - T4: Labrecque and Milne, color and brand personality research. Hue changes perceived brand personality (red reads as exciting, blue as competent). https://laurenlabrecque.com/2023/01/02/exciting-red-and-competent-blue-the-importance-of-color-in-marketing/
  - T4: Marketing Letters (2013), study of 281 top brands. Color differentiation helps in some categories and hurts in others; following category color norms tends to pay off where a dominant market leader exists. https://ideas.repec.org/a/kap/mktlet/v24y2013i2p165-176.html
  - T3: Performable/HubSpot red vs green button test (+21% for red). The authors say it does not generalize; contrast with the page likely drove the result. https://www.poper.ai/blog/cta-button-color-conversion/
  - T4: WCAG 1.4.3 Contrast (Minimum): 4.5:1 for body text, 3:1 for large text. Pure red #FF0000 on white is about 4.0:1. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
  - T4: WCAG 1.4.11 Non-text Contrast: 3:1 for UI components. https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
  - T4: WCAG 1.4.1 Use of Color: color alone must not convey meaning, so error states need an icon or text. https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
  - Caveat: no T1 evidence that swapping a core brand color to red raises sales; no client numbers yet.
- Owner: OGILVY (client conversation: why red, desired outcome, target metric; A/B test design); TORVALDS (WCAG check on the final hex, repo cost count of color occurrences once he has the repo)
- Parked items:
  - Full switch from blue to red: parked. Reopen if the accent test wins and a brand-perception test with real customers supports it.
  - Cost and date for any color swap: parked until TORVALDS counts color occurrences in the repo (design tokens vs hardcoded values).
- Status: SETTLED

## OPEN ITEMS (not decisions; logged by DRUCKER at DEMING's request)

### OPEN-001
- Date: 2026-10-04
- Room: DELIVERY ROOM
- Question for the human (Rule 001): What outcome does the client actually want, and which number should move?
- Blocks: scope sign-off, pricing and timeline for DEC-001 (video hero) and DEC-002 (accent color A/B test). Ogilvy holds that DEC-001 content work is not blocked by Rule 001; Torvalds asks the human to confirm, because the hero is a scope change.
- Also needed from the human: repo link or stack; niche and top 3 competitors; baseline traffic and conversion numbers; budget and deadline; the one person accountable for each.
- Owner of the question: DRUCKER
- Status: OPEN

### DEC-003
- Date: 2026-10-04
- Room: WAR ROOM
- Topic: Model provider and visitor data for the ALTER PEDRO scan
- Decision: DeepSeek (Flash, thinking off, JSON output on) may run the build and the 20 synthetic test problems. No real visitor uses the scan until one of two things is true: DeepSeek's API data terms are confirmed in writing, or the provider is switched to one hosted where the owner accepts. The provider is one setting. The scan page tells visitors in plain words not to enter personal details.
- Evidence:
  - T4: DeepSeek pricing page lists Flash at $0.30/M input and $1.20/M output at peak, JSON output supported. https://api-docs.deepseek.com/quick_start/pricing
  - T4: DeepSeek privacy policy (dated Feb 10, 2026) says data is stored in China and used to train models; API data terms not found. https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html
  - Not yet measured (T1): real cost per scan and cache hit rate (TORVALDS task E4).
- Owner: TORVALDS (provider setting, cost measurement); OGILVY (privacy notice copy); the human (choose provider before launch)
- Status: SETTLED

### DEC-004
- Date: 2026-10-04
- Room: WAR ROOM
- Topic: Booking provider for the 20-minute call
- Decision: cal.com, chosen by the human. The scan page's booking link (BOOKING_URL, currently the placeholder #book) becomes the human's cal.com event link.
- Open: the human must create the cal.com account and a 20-minute event, then supply the public link. Until then the production build must not ship with #book.
- Owner: TORVALDS (wire BOOKING_URL, make the production build fail on #book); the human (account and link)
- Status: SETTLED

### DEC-005
- Date: 2026-10-04
- Room: WAR ROOM
- Topic: Launch with one door (free 20-minute call); Solution Sprint price deferred
- Decision: The human chose to launch without the Sprint price. The page and the scan summary show only the free 20-minute call (cal.com). Door 2 (paid Solution Sprint, credited against the project) stays hidden until the human sets a price. Paid conversion happens on the call.
- Copy rule: while Door 2 is hidden, no text anywhere mentions a Sprint, a price or a credit. See /workspace/ALTERPEDRO_SINGLE_DOOR_COPY.md.
- Build rule (TORVALDS): SPRINT_PRICE unset means Door 2 does not render; the production build fails only if the price is set but malformed or placeholder text appears in the output.
- Metrics: scans completed, calls booked, calls held, calls that become paid work. The last two come from the human's own records, not the site.
- Status: SETTLED
