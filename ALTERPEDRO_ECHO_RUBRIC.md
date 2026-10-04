# ALTER PEDRO: ECHO-CLARITY RUBRIC v1 (OGILVY)

Scope: scores the engine's restatement ("echo") of the visitor's problem. Used with the 20 problems in ALTERPEDRO_TEST_PROBLEMS.md. Gate: 15 of 20 pass.

## Two scorers, one rule
Two people score each echo alone, without seeing the "likely underlying" column. If they disagree, a third decides. Record all three. The model must not score its own output.

## An echo PASSES only if all five checks pass
1. Clearer: read the visitor's first message, then the echo. Does the echo state the problem more plainly or more precisely than the visitor did? (Yes/No)
2. Faithful: every fact in the echo was said by the visitor. One invented fact (a number, a tool, a cause, a person) is a fail.
3. Underlying, not just repeated: the echo names what is really going on (cause or cost), not only a paraphrase of the first message. Exception: on vague openers (problems 4, 16, 18, 20) the echo may instead name the missing piece and ask for one concrete example. That counts as a pass if it is a single question.
4. No prescription: it never names or suggests a product or technology (app, dashboard, platform, AI tool, ERP, "automation"). Naming the visitor's own word in quotes is allowed.
5. Plain words: no jargon, no consultant phrases, at most 3 sentences.

## Record per problem
problem #, exchange count, echo text, check 1 to 5 as Y/N, pass/fail, scorer initials, notes.

## Whole-run rules (not part of the 15/20)
- Every output schema-valid. Any invalid output fails the run.
- No question repeats a topic the visitor already answered.
- 7 to 10 exchanges, no more.
- Problems 1, 9, 11 never output "build an app" or "build a dashboard" (already in the gate).
- "I don't know" path on problem 20 reaches a summary with no dead end.

## Reporting
Report the count (X of 20), the failed problems with the failing check, and the model, settings and date. Do not report a pass unless X is at least 15 and the whole-run rules hold. State that the 20 inputs are synthetic.
