# ALTER PEDRO: SCAN TEST PROBLEMS (OGILVY) v1

These are 20 realistic opening messages, written the way visitors talk. They are synthetic test inputs, not real customers. Do not use them as case studies or proof.

Scoring (per problem, done by a human until we have a better method):
- Echo test: pass if the engine's restatement says the underlying problem more clearly than the visitor did, in plain words, without adding facts the visitor never gave.
- Pass also requires: no product or technology prescribed, no question repeated, no jargon, schema-valid output, 7 to 10 exchanges max.
- Gate agreed with TORVALDS: 15 of 20 echoes pass.

"Stated" is what the visitor types. "Likely underlying" is a hypothesis for the scorer only. The engine must not be told it.

| # | Stated (opening message) | Likely underlying (scorer only) |
|---|---|---|
| 1 | We need an app for our delivery drivers. | Dispatch happens on WhatsApp and nobody can see which jobs are late. |
| 2 | Our systems don't talk to each other. | Same data typed in 3 places; reports disagree. |
| 3 | Our website gets traffic but nobody enquires. | Offer is unclear or the next step is hard to find. |
| 4 | I want AI in my business but don't know where. | No named pain; "AI" is fear of being left behind. |
| 5 | My team spends every Friday building reports. | Data lives in separate spreadsheets; no single source. |
| 6 | We keep losing customers after the first order. | No follow-up process after delivery. |
| 7 | I have an idea for a platform and no tech team. | Idea is untested; the need is validation before build. |
| 8 | Our software is old and everyone hates it. | One or two painful workflows, not the whole system. |
| 9 | We need a dashboard. | Owner can't answer one specific question quickly. |
| 10 | Staff keep making the same mistakes in data entry. | Process has no check or the form is confusing. |
| 11 | Competitors launched an app and we feel behind. | Reaction to competitors, not a customer need. |
| 12 | Our school's admissions are chaos every June. | Applications arrive by many channels; no single queue. |
| 13 | We're a small shop and inventory never matches. | Stock changes aren't recorded at the moment they happen. |
| 14 | Everything depends on one person who knows how it works. | Undocumented process; key-person risk. |
| 15 | Our agency built us a site and it doesn't do anything. | Site was built to look good, with no goal set. |
| 16 | We want to automate everything. | No priority; most value is in one or two tasks. |
| 17 | Customers keep calling to ask where their order is. | No status visibility; support cost from a missing update. |
| 18 | Leadership wants a digital transformation. | Vague mandate; no named problem or owner. |
| 19 | We tried an ERP and it failed. | Process wasn't understood before software was bought. |
| 20 | I don't know. Things just feel slow. | Needs gentle questioning; test the "I don't know" path. |

Scorer notes
- Items 4, 16, 18 and 20 are the vague-ask tests. The engine must ask for one concrete example before concluding anything.
- Items 1, 9 and 11 test the "do not prescribe a product" rule. A correct run never says "build an app" or "build a dashboard".
- Item 20 should succeed through the "I don't know" button path with no dead end.
- Add a column per run: pass or fail, the echo text, and the number of exchanges.
