# ALTER PEDRO: CREATIVE DIRECTION v1 (OGILVY)

Status: PROPOSED. Not a settled decision until TORVALDS converges (build side) and the human approves. Visual design (tokens v2.1, components v1.1) is treated as decided and is not reopened.

Assumptions I am making because the human said "lean, cheap, premium" and gave no other numbers:
- A1: Outcome = qualified conversations booked. Number that should move = visitors who finish the scan and book a call (or buy a Solution Sprint).
- A2: Price of the Solution Sprint is unknown. Placeholder [PRICE] everywhere. Never ship with a placeholder.
- A3: No real case studies or metrics were supplied. None are invented. Proof section ships with real ones only.

## 1. What I changed and why (the critique)

1. "Bring us the problem. We'll figure out the rest." is the north star, not the headline. It promises nothing a visitor can check. A promise must be a benefit the customer can verify. Replace it in the hero with a specific, timed, observable promise.
2. The hero IS the product. Instead of a video or an illustration, the hero is the live input box where the visitor types their problem. It shows the thing instead of describing it. It is also the cheapest hero possible: text only, no video, nothing heavy for the largest-contentful-paint element. This supersedes the video-hero question for this site only. DEC-001 stays in force for any other client.
3. "Solution Sprint is 10x deeper" cannot be shipped until we can show it. Say what the Sprint concretely does ("we go through your systems, your numbers and your people") until we have a measured comparison.
4. The capability universe (hundreds of items) is cut to one line. The doc itself says breadth is the arsenal, not the product.
5. Case studies: ship zero fake ones. A section with no proof is better than an invented one. One real case beats nine pretty screenshots.

## 2. Hero (test A vs test B)

Eyebrow (serif display token): ALTER PEDRO · THE SOLUTION COMPANY.

Headline candidates (10 written before choosing):
1. Describe the problem. Get it back in writing, in 3 minutes.   <- TEST A (recommended)
2. You bring the problem. We'll tell you what it actually is.   <- TEST B
3. Don't tell us what to build. Tell us what hurts.
4. Seven questions. One page. Your real problem, in plain words.
5. Before you buy an app, find out if you need one.
6. Your problem, said back to you more clearly than you said it.
7. Not sure what you need? Good. Start there.
8. Three minutes. No email. A written read on your problem.
9. Tell us what's going on.
10. Most software projects start by answering the wrong question. Start with the right one.   (needs proof before use; do not ship)

Sub line: No email needed. You get a written summary at the end.
Input placeholder (rotating, customer words): "Our sales team spends Fridays building reports." / "Our systems don't talk to each other." / "Our website gets visitors but no enquiries." / "We have an idea and don't know where to start."
Primary button (ink, per tokens): "Start" . Secondary text link: "Rather talk to a person? Book 20 minutes."
Accent (wine) used on at most 3 elements per screen: the live understanding panel marker, the link, the focus ring.

## 3. The Scan (free layer): coverage map, not a script

Seven areas the engine must cover, in whatever order the visitor's answers allow:
Situation, Cost, History, Constraint, Vision, Stake, Urgency.

Mechanics (all from the brief, plus microcopy):
- Echo before you ask: one line that restates their answer before the next question.
  Template: "So the real issue isn't [stated thing]. It's [underlying thing]. Let me dig into that."
- Challenge the assumption: "Maybe an app is the answer. Before we assume it is, what problem should it solve?"
- Expand when vague: "Give me one example from last week where this got in the way."
- Compress when clear: skip areas already answered.
- "I don't know" is a real button, never punished: reply "That's fine. Most people can't see their own bottleneck. Let's come at it another way."
- Hard cap: 7 to 10 exchanges, then deliver.
- Never ask for something already said. No dropdowns. Text and voice input.
- Live understanding panel (right side on desktop, collapsed on mobile): "We're building a picture of: your workflow, your cost, your constraints." Items tick as covered.
- No email wall. Ask for email only after the summary, framed as "Send me a copy."

Wrap-up line: "That's enough for me to say something useful. Give me a moment."

## 4. The Summary (the payoff moment)

Five parts, written like a person wrote it, not bullets:
1. What we heard. 2 to 3 sentences in their own words.
2. What seems to be the real problem. Stated problem versus underlying problem. This is the insight moment.
3. What we'd want to investigate next. 3 to 4 directions. Never "you need X". Say "this looks like a workflow and data problem" and "we haven't decided what you should build yet."
4. What we'd still need to know. Honest gaps.
5. Next step, two doors:
   - Door 1: 20-minute call. Free.
   - Door 2: Solution Sprint. Half a day, led by a person, [PRICE], credited in full against the project if you go ahead.

Framing line (only after we can back it up): "This summary took 3 minutes. A Solution Sprint works through your actual systems, numbers and people."

## 5. Page structure (lean, six blocks)

1. Hero = the Scan input.
2. "What you get back": a real sample summary on screen (show, don't tell). Use a clearly labelled example, not a fake customer.
3. Stated problem versus real problem: three short cards in customer language ("We need an app" -> "The real problem was a Friday spreadsheet"). Label as examples until real cases replace them.
4. Method: Diagnose, Design, Build, Operate. One line each.
5. Proof: real case studies only, in the five-part format (Problem, What we discovered, What we decided, What we built, What changed) with numbers. Section is hidden until at least one real case exists.
6. Final CTA: "Have a problem worth solving? Tell us." (opens the Scan) plus the Labs line: "Some problems are bigger than one client. So we build the solution ourselves." One line, link to Labs.

## 6. SEO (cheap, compounding)

The scan page itself will not rank. Add 8 to 10 short, crawlable "problem pages", one per scenario in the brief ("our systems don't talk to each other", "our website isn't converting", "our data tells us nothing", and so on). Each is written in the customer's words, has real text in HTML (not baked into images), and ends with the Scan pre-filled with that problem. Keyword demand is unmeasured so far, so the first task is a keyword and intent check before writing all ten.

## 7. Voice rules

Short sentences. Specific numbers. Customer's words.
Banned: innovative digital solutions, trusted transformation partner, end-to-end, we do everything, generic "Contact us", fake AI magic, any claim we can't show.
Never claim a number we can't prove. Never invent a client.

## 8. Test plan (written before launch)

Step 1, ship ugly to about 10 real people. Watch where they get bored or confused and whether the summary lands. This is qualitative and needs no sample size.
Step 2, only then A/B: Test A headline versus Test B headline. Primary metric: scan completed and call booked. Sample size cannot be set until a baseline exists. Set it before launch and read the result once.
Guardrails (with TORVALDS): mobile LCP at the 75th percentile 2.5s or less; cost per scan under the monthly cap.

## 9. Benchmark

Quality bar named in the brief: Apple (hierarchy, simplicity), GoDaddy (action mechanics), Clay and Finsweet (proof and case-study structure). The top 3 niche competitors are not named yet. Task: pick them, then compare on mobile LCP, hero weight, clicks to first value, and clarity of the promise.

## 10. What I need from TORVALDS (creative requirements, not engineering decisions)

- Hero text and input render without waiting on scripts. Hero is the largest element and must stay fast.
- The scan model returns only a summary and the next question. No tools, no internal access.
- Rate limits, bot checks, and a monthly spend cap. He sets the numbers; I only require that they exist.
- Voice and typed input, "I don't know" button, live panel.
- A fixed set of about 20 realistic test problems. I will write them in customer language and score each echo line on one question: did it say the problem more clearly than the visitor did?

## 11. Tasks (owner OGILVY unless stated)

C1 Final hero copy and the 10-headline log. C2 Echo, challenge and "I don't know" microcopy bank. C3 Summary template and 3 sample summaries. C4 Twenty test problems and scoring sheet. C5 Six-block page copy. C6 Problem pages (keyword check first). C7 Test plan sign-off with TORVALDS and DEMING. C8 Benchmark once competitors are named. C9 Engineering tasks (TORVALDS).
Dates and prices: blank until the human gives the Sprint price, budget and deadline.
