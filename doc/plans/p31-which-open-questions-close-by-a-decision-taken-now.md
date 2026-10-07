# P31 — Which of the open questions close once the maintainer takes their decision now?

**Status:** in progress — declared 2026-10-07 on `a68b449`; W140 and W142 done 2026-10-07, W141 done 2026-10-08 (Record below)
**Question this plan answers:** *with the maintainer's direction taken up front, which of the fourteen
open questions close inside this repository, and does each close when its fix lands?*
**Exit artifact:** *on the final tree, `npm run gate:full` EXITs 0 (the LAST item runs it, workflow
v0.29); `npm run q -- --where "resolved-by~P31" --fields id,status,resolved-by` lists exactly the
twelve questions of decision 1, each `resolved` and naming the item that closed it; and `npm run q --
--where status=open --count` prints **2** (Q20, Q513), plus any question an item raises open, each
named in that item's Record — and workflow section 1 rule 6 (v0.30) says such a question is raised
only on a NO or a fix that is not small.*
**Reserves:** W140-W149, Q553-Q567, ADR 0088-0089

```
Question: which open questions close once their decision is taken now?
Items:    W140 (refusal messages: Q533), W142 (settlement routing: Q244),
          W141 (the registry and the worker envelope: Q266, Q283), W145 (the browser lane: Q541),
          W144 (markdown floors: Q142, Q337), W143 (the self-tests' guards: Q434, Q437, Q536),
          W146 (the documents: Q542, Q508)
Reserves: W140-W149, Q553-Q567, ADR 0088-0089
Baseline: plans to p30, work items to w139, ADRs to 0084, register to Q542 — `npm run state` on
          `a68b449`, where the tree and the ledger agree on W140 / ADR 0088 and the ledger's Q553
          is W139's Record (Q548-Q552 spent unissued)
Declared: 2026-10-07 on `a68b449`
```

## Why this plan, and why now

P30 closed thirteen questions and its items raised four, so fourteen are open on `a68b449`. The
maintainer named the loop that produces this — *a unit may open more questions than it closes* — and
answered it twice: workflow v0.30's section 1 rule 6 (a defect one simple decision settles is asked,
not raised), and this plan, which takes every remaining decision BEFORE fan-out so that no item has
one left to raise. **Twelve of the fourteen close here. Two cannot**: Q20 and Q513 close only with
their twins in `fyflow-react-components` (P29 decision 7).

## Decisions taken before fan-out

**1. Twelve questions are in. Two are Out**, by the maintainer on 2026-10-07:

| | questions | why |
|---|---|---|
| **in** | Q142, Q244, Q266, Q283, Q337, Q434, Q437, Q508, Q533, Q536, Q541, Q542 | each `closes-when` names a fix or a decision, and decision 2 takes every decision |
| **Out** | Q20, Q513 | they close in `fyflow-react-components` (P29 decision 7) |

**2. The direction of each question that needed one is decided here** — the maintainer, 2026-10-07:

- **Q244: settlements are ROUTED to their own run's driver**, not broadcast to all N drivers on one
  shared scheduler, so N concurrent runs on one scheduler are linear rather than O(N²). This is a
  change to how the runtime delivers events; W142 writes it as **ADR 0088** and measures it.
  *Not chosen*: documenting a scheduler per run in `AGENTS.md` and leaving the cost.
- **Q142: `check-markdown`'s M3-M5 floors are DERIVED from the probe trees**, so adding ordinary
  documents can no longer close the window. W144 then adds `examples/` to the walk (Q337) on top of
  derived floors. *Not chosen*: hand-tuned literals retuned per ADR 0076 and ADR 0078.
- **Q533: all nine refusal classes drop their class name from the message and set their own
  `name`**, as `UncloneableResult` did at W133. Public message text changes: a `fix:` commit.
  *Not chosen*: keeping the convention with `UncloneableResult` as the exception.
- **Q508: all three senses of *gate* stay**; the glossary's three rows carry the distinction.
  *Not chosen*: renaming one.

**3. The directions that need no decision** are each question's own `closes-when`, unchanged: Q266
on W61's road (the envelope remembers an inner `setup()` failure and fails each task from `run()`);
Q283 one shape function called from both `checkRegistry` and `resolveRegistry`; Q434, Q437 and Q536
the guard adopted in every self-test that grades on it; Q541 a baseline that RAN and failed is
reported as such, naming its failures; Q337 `examples/` joins the walk; Q542 each claim deleted or
corrected.

**4. Every item but the last confirms on `npm run gate:item`; the LAST item, W146, runs the whole
`npm run gate:full`** (workflow v0.29). An item that edits `scripts/check-register*.mjs`,
`scripts/state.mjs` or `doc/questions/README.md` runs the register lane too.

**5. The items run SERIALLY on one tree** — section 6's still tree, and two pairs share files: W140
and W142 both touch `src/driver/`, and W144 and W143 both touch `scripts/check-markdown-selftest.mjs`.
The order is the index below: the library first, the checks next, the documents last so their
floors are measured on the final tree.

**6. Readers.** **W140, W141 and W142 run both readers**, conformity and adequacy, because each
changes `src/`; each states its overlap, the next being the **eighty-fourth** measurement. W143, W144,
W145 and W146 run one conformity reader each.

**7. Workflow section 1 rule 6 binds every item.** A defect one simple decision settles is a
stop-and-ask to widen `Owns`, not a raised question; each item's Record states the questions it
closed and raised.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W140 | **Refusal messages name their class once.** Q533: the nine classes' messages drop the class name; each sets its own `name`. L6's `map / FD-R2` row declares `stoppedByNamesItOnce` | `src/driver/*.ts`, `src/definition/*.ts` and `src/scheduler/*.ts` where a named class is thrown, the tests that pin the messages, `examples/l6.ts` (the FD-R2 row), `AGENTS.md` only where a snippet or sentence quotes a message | nothing | L0-L6; both readers; `gate:item` EXIT 0 |
| W142 | **A settlement reaches only its own run's driver.** Q244: the runtime routes each settlement by run id, ADR 0088; the O(N²) re-measured and shown linear | `src/scheduler/*.ts` (the runtime's event delivery), `src/driver/` only where routing needs it, the tests, `examples/retention.ts` or a scale measurement, `doc/decisions/0088-*`, `AGENTS.md` section 12 | W140 | L0-L6; a measured N-run scaling figure before and after; both readers; `gate:item` EXIT 0 |
| W141 | **The registry and the worker envelope.** Q266: a type whose worker `setup()` throws fails each task from `run()` instead of hanging; Q283: one shape function for `checkRegistry` and `resolveRegistry` | `src/definition/registry.ts`, the envelope worker and `resolveRegistry` under `src/scheduler/`, their tests, an L6 row if the hang needs a real scheduler | W142 | L0-L6; both readers; `gate:item` EXIT 0 |
| W145 | **The browser lane reports a failing baseline.** Q541 | `scripts/run-browser-tests.mjs` and its provocation | W141 | the provocation shows the named failures; conformity reader; `gate:item` EXIT 0 |
| W144 | **The markdown floors are derived, and `examples/` is walked.** Q142, then Q337 | `scripts/check-markdown.mjs`, `scripts/check-markdown-selftest.mjs`, `examples/README.md` only where the walk finds a broken link | W145 | each new clause provoked at birth; conformity reader; `gate:item` EXIT 0 |
| W143 | **The self-tests' three guards.** Q434 the instrumented replace, Q437 an unmutated-copy control per META pass, Q536 a checked-in `ran:` case, in each self-test that grades on them | `scripts/*-selftest.mjs` | W144 | each guard provoked in each file; conformity reader; `gate:item` EXIT 0 (the register lane too if `check-register-selftest.mjs` moves) |
| W146 | **The documents.** Q542 each stale claim in `doc/README.md` fixed; Q508 closed by decision 2, the glossary touched only if its three rows do not already carry the distinction | `doc/README.md`, `doc/glossary.md` | W143 | `check:markdown` and its self-test EXIT 0; conformity reader; **`gate:full` EXIT 0 — the plan's last item** |

**Item files are written from these rows when each item starts**, as at P29 and P30.

## Predictions

| | prediction | what would reverse it |
|---|---|---|
| **1** | **every item closes what it takes and raises at most one question** — rule 6 turns the rest into stop-and-asks | an item raising two or more, each named in its Record |
| **2** | **W142 is the only item that needs an ADR** (0088) | another item finding a rule no spec, ADR or plan holds |
| **3** | **W142 measures N runs on one scheduler as linear** after routing | a residual super-linear term the routing does not reach |
| **4** | **W140 changes no L1-L6 case count except W140's own added assertions** | a check that counts message text |
| **5** | **W144's derived floors hold through W146's edits** — the point of Q142 | `check:markdown:selftest` RED on W146's tree |
| **6** | **the always-read set does not grow**: `CLAUDE.md`, `doc/workflow.md`, `doc/concept.md` untouched | a fix whose only home is one of them |

## Stop-and-asks

| | the question | answer |
|---|---|---|
| **(a)** | Q244: if routing by run id cannot be done without changing what `start()` returns or what a consumer must pass, does W142 change the public surface or stop at the measurement? | *open — W142 asks* |
| **(b)** | Q266: if W61's road cannot fail the tasks without the scheduler's cooperation, does the hang stay documented and an upstream want go to `doc/scheduler-upstream.md`? | **NOT NEEDED** — W141 measured that the envelope alone closes the hang (6 of 6 hung before, 6 of 6 completed after); no scheduler cooperation, no upstream want |
| **(c)** | Q142: if no derivation from the probe trees is stable, are the floors retuned once more and Q142 re-asked? | *open — W144 asks* |
| **(d)** | ~~Scope and the four directions~~ | **ANSWERED by the maintainer, 2026-10-07** (decisions 1 and 2) |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| — | *none raised at declaration* | |

## Out

- [Q20](../questions/q20.md) and [Q513](../questions/q513.md) — they close in `fyflow-react-components`.
- **Any change to what `gate:full` or `gate:item` runs** — W139's, and workflow v0.29's.

## Record

**W140 — done 2026-10-07.** Its own Record covers the gate, the measurement, both readers and the
rule-8 passes; this section names what the PLAN needs from it.

- **Closed: Q533**, its `resolved-by` naming P31 W140. **Raised: none.** Prediction 1 held for W140.
  On W140's tree `npm run q -- --where status=open --count` prints **13**: fourteen, less Q533.
- **Workflow section 1 rule 6 fired three times, and nothing was raised.**
  - `test/harness.ts`: `throws` read the class out of the message prefix this item removes. The
    maintainer chose option (A), so `throws` now matches `${name}: ${message}`.
  - The two comments the conformity reader found false or ambiguous after that change:
    `test/definition/map.test.ts` and `test/driver/nested-regions.test.ts`.
  - Each was asked before its edit, answered YES, and the YES was written into W140's Exceptions first.
    None is on this plan's W140 row, which the next item that changes refusal text can carry at declaration.
- **Prediction 4 held.** L1-L5 stayed at **1528** cases in node, deno and chromium. L6 moved from **2465 to
  2466** assertions over 162 runs: the one clause W140 added. No check counts message text.
- **Q533's masking is gone.** W133's probe p12, the driver dropping the class from `stoppedBy`, is now
  CAUGHT on the `map / FD-R2 — over names no array` row by both of its `stoppedBy` clauses.
- **Predictions 2 and 6 held for W140.** It needed no ADR, and `CLAUDE.md`, `doc/workflow.md` and
  `doc/concept.md` are untouched.
- **Overlap**: FOUR shared subjects, the eighty-fourth measurement — the count a retro carries forward.
- **The confirming gate**: `npm run gate:item` EXIT 0 on `74d3487`, once, on a still tree (decision 4).

**W142 — done 2026-10-07.** Its own Record covers the gate, the scaling figures, both readers and the rule-8
passes; this section names what the PLAN needs from it.

- **Closed: Q244**, its `resolved-by` naming P31 W142 and ADR 0088, whose `resolves` lists it. **Raised: none.**
  Prediction 1 held for W142. On W142's tree `npm run q -- --where status=open --count` prints **12**.
- **Prediction 2 held**: ADR 0088 is the one ADR. ADR 0089 is unused.
- **Prediction 3 held, after one stop.**
  - The library alone is linear: the events handed to drivers go from 6N² to 6N.
  - W55's own command stayed super-linear after the routing. The cause was the L6 harness, which files eight
    listeners per run on the scheduler and copied `scheduler.tasks` into each report.
  - The maintainer answered **(B)** on 2026-10-07: route the harness too.
  - W55's command is now linear in wall and heap: 904 ms and 68.0 MiB at N = 800 shared, against 13 652 ms and
    879 MiB on `7ba87df`.
- **Stop-and-ask (a) was not needed.** The routing changes no public surface: `start` and `resume` return the
  same handle, and nothing new is exported.
- **Prediction 6 held**: `CLAUDE.md`, `doc/workflow.md` and `doc/concept.md` are untouched.
- **Counts:**
  - L1-L5 went from 1528 to **1538** in node, deno and chromium, the W142 suite's ten.
  - L6 went from 2466 to **2474** assertions over 162 runs: two per-run clauses on the two pair rows.
- **What W141 inherits:**
  - ID-R4 tier 1 is no longer reachable at L6. Its coverage is L2's.
  - `runPair` refuses a shared pair that filed no routed harness registration.
- **Overlap**: FOUR shared subjects, the eighty-fifth measurement.
- **The confirming gate**: `npm run gate:item` EXIT 0 on `81b0ed9`, once, on a still tree (decision 4).

**W141 — done 2026-10-08.** Its own Record covers the gate, the measurement, both readers and the rule-8
passes; this section names what the PLAN needs from it.

- **Closed: Q266 and Q283**, each `resolved-by` naming P31 W141. **Raised: none** (Q559-Q561 unused).
  Prediction 1 held for W141. On W141's tree `npm run q -- --where status=open --count` prints **10**.
- **Prediction 2 held**: no ADR; ADR 0089 is unused. ADR 0051 (F1's correction) and ADR 0075 (rule 4's
  now-false *setup() has refused that*) were corrected at the record step.
- **Stop-and-ask (b) was not needed**: the envelope worker alone closes the hang.
- **Workflow section 1 rule 6 fired twice, both asked and answered YES** (2026-10-07): `AGENTS.md`'s section-20
  sentence, and `scripts/build-browser-tests.mjs`'s one corpus line. Neither is on this plan's W141 row.
- **One ask is outstanding for the maintainer**: `spec/flow-definition.md` section 2's single-task F1 sentence
  does not reproduce on 0.5.2 (a single task with no retry settles; several tasks, or a retry, hang).
- **Counts:** L1-L5 went from 1538 to **1580** in node, deno and chromium; L6 from 2474 / 162 to **2487 / 164**
  in node and deno — the setup-fails block's two runs.
- **What W145 inherits**: `scripts/build-browser-tests.mjs` gained one corpus line (`src/definition/registry.ts`).
- **Prediction 6 held**: `CLAUDE.md`, `doc/workflow.md` and `doc/concept.md` are untouched.
- **Overlap**: THREE shared subjects, the eighty-sixth measurement.
- **The confirming gate**: `npm run gate:item` EXIT 0 on `511a009`, once, on a still tree (decision 4).
