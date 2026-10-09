# P31 — Which of the open questions close once the maintainer takes their decision now?

**Status:** complete and retro'd 2026-10-09 — declared 2026-10-07 on `a68b449`; W140 and W142 done 2026-10-07, W141, W145 and W144 done 2026-10-08, W143 and W146 done 2026-10-09; the exit artifact measured on the final tree (Record below); the retro ran 2026-10-09 and the maintainer answered A, B and C the same day, declining D (Retro below)
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
| **(c)** | Q142: if no derivation from the probe trees is stable, are the floors retuned once more and Q142 re-asked? | **ANSWERED by the maintainer, 2026-10-08: (A) pure derivation plus M9.** W144 measured that a floor no ordinary document can close is also one no ordinary document LEAVING can fire, so a derivation keeps no reach over a partial loss inside its subject. Each floor is the largest measure among the probe trees that must fire it, plus 1, from one exported probe-tree definition the self-test's `removes` probes read, with no literal; and a new clause, `M9`, *the walk reads every markdown file a walked document links to*, takes over noticing documents that leave the walk, landing with `examples/` joining the walk (Q337). *Not chosen*: (B) a literal margin over each subject; (C) retune once more |
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
  *Answered by the maintainer on 2026-10-08: the sentence corrected as `spec/flow-definition.md` v0.29, `b9dd0c8`,
  its old reading kept. This retro's correction (pass 3 rule 6): the line said outstanding after the answer.*
- **Counts:** L1-L5 went from 1538 to **1580** in node, deno and chromium; L6 from 2474 / 162 to **2487 / 164**
  in node and deno — the setup-fails block's two runs.
- **What W145 inherits**: `scripts/build-browser-tests.mjs` gained one corpus line (`src/definition/registry.ts`).
- **Prediction 6 held**: `CLAUDE.md`, `doc/workflow.md` and `doc/concept.md` are untouched.
- **Overlap**: THREE shared subjects, the eighty-sixth measurement.
- **The confirming gate**: `npm run gate:item` EXIT 0 on `511a009`, once, on a still tree (decision 4).

**W145 — done 2026-10-08.** Its own Record covers the gate, the measurement, the reader and the rule-8
passes; this section names what the PLAN needs from it.

- **Closed: Q541**, its `resolved-by` naming P31 W145. **Raised: none** (Q562-Q564 unused). Prediction 1
  held for W145. On W145's tree `npm run q -- --where status=open --count` prints **9**.
- **Prediction 2 held**: no ADR; ADR 0089 is unused. **Prediction 6 held**: `CLAUDE.md`, `doc/workflow.md`
  and `doc/concept.md` are untouched.
- **Workflow section 1 rule 6 did not fire**: no fix needed a file outside `Owns`.
- **Q541's second clause**: the baseline fix does not reach a bundle that throws on import — after a failed
  baseline no browser starts. Chromium's own 60 s wait was fixed separately, inside `Owns`: a page error
  shortens it to a 5 s grace (about 62 s to about 6 s).
- **Counts:** L1-L5 unchanged at **1580** in node, deno and chromium; L6 unchanged at **164** runs.
- **What W144 inherits**: nothing in its files. `test/provocations/q541.ts` is a new `test/` file outside
  every glob.
- **The confirming gate**: `npm run gate:item` EXIT 0 on `ff61ff6`, once, on a still tree (decision 4).

**W144 — done 2026-10-08.** Its own Record covers the gate, the floors and the window before and after, the
reader and the rule-8 passes; this section names what the PLAN needs from it.

- **Closed: Q142 and Q337**, each `resolved-by` naming P31 W144 — **and Q487, a THIRTEENTH beyond decision 1's
  twelve**, by the maintainer's answer (2026-10-08): it was deferred *waiting on Q142's decision*. The exit
  artifact's `resolved-by~P31` listing therefore shows thirteen. **Raised: none** (Q565-Q567 unused).
  Prediction 1 held for W144. On W144's tree `npm run q -- --where status=open --count` prints **7**.
- **Stop-and-ask (c) fired and was answered (A) plus M9** — the row above. The floors are derived (M3 169,
  M4 121, M5 71 today, each printed by the check); M9 and M10 are new; examples/ is walked.
- **Prediction 2 held**: no ADR; ADR 0089 is unused. The maintainer chose dated notes in ADR 0076 and ADR 0078
  over ADR 0089 (the reader's finding 1).
- **Prediction 5 is now true by construction**, shown on W144's own tree with 200 ordinary documents; W146's
  edits are its first real test.
- **Workflow section 1 rule 6 fired once, two files, answered YES** (2026-10-08): doc/work-items/TEMPLATE.md's
  italic note and scripts/check-spec-selftest.mjs:31. Neither is on this plan's W144 row.
- **Prediction 6 held**: `CLAUDE.md`, `doc/workflow.md` and `doc/concept.md` are untouched.
- **What W143 inherits**: check-markdown-selftest.mjs now builds its tree probes from the script under test's
  `PROBE_TREES`, holds each tree probe's fixture to the in-memory measure, and lets a META entry graded
  `corpus` declare its ids (a 5th element). Its lane is the slowest: about 12.7 min alone, 1302.6 s in the gate.
- **The confirming gate**: `npm run gate:item` EXIT 0 on `8bbb662`, once, on a still tree (decision 4).

**W143 — done 2026-10-09.** Its own Record covers the gate, the per-self-test table before and after, the reader and
the rule-8 passes; this section names what the PLAN needs from it.

- **Closed: Q434, Q437 and Q536**, each `resolved-by` starting "P31 W143 —". **Raised: none** (Q568-Q570 unused;
  P31's own block was wholly reserved by W140-W145). Prediction 1 held for W143. On W143's tree
  `npm run q -- --where status=open --count` prints **4**.
- **Prediction 2 held**: no ADR; ADR 0089 is unused. **Prediction 6 held**: `CLAUDE.md`, `doc/workflow.md` and
  `doc/concept.md` are untouched.
- **Workflow section 1 rule 6 fired once**: scripts/selftest-guards.mjs, a shared helper outside the row's
  `scripts/*-selftest.mjs`, answered **YES (option A)** by the maintainer on 2026-10-08 and written into W143's
  Exceptions before the file existed. Not on this plan's W143 row.
- **A second stop-and-ask, on the wall**: the first form of the guard cases (nine as SELF entries) put the
  `gate:item` self-test wall at 1600.1 s against W144's 1316.1 s. The maintainer chose **(B)** on 2026-10-09: those
  nine run in process, one level less end-to-end. On `f722ffa` the wall is **1277.9 s**.
- **Q434 was live**: the shared instrumented replace found a dead first edit in check-policies-selftest.mjs on its
  first run. Two further in-Owns defects were fixed (the scheduler self-test's junction branch; the source
  self-test's vacuous returns).
- **Counts:** L1-L5 unchanged at **1580** in node, deno and chromium; L6 unchanged at **164** runs, 2487 assertions.
- **What W146 inherits**: nothing in its files. `check:markdown:selftest` alone reads 742 s on `f722ffa`.
- **The confirming gate**: `npm run gate:item` EXIT 0 on `f722ffa`, once, on a still tree (decision 4); and, because
  check-register-selftest.mjs moved, `npm run check:register:selftest` EXIT 0 on the same tree, once.

**W146 — done 2026-10-09.** Its own Record covers the gate, each claim before and after, the glossary rows, the reader
and the rule-8 passes; this section names what the PLAN needs from it.

- **Closed: Q542 and Q508**, each `resolved-by` starting "P31 W146 —". **Raised: none** (Q571-Q573 unused; P31's
  block and Q568-Q570 were wholly reserved). Prediction 1 held for W146.
- **Q542**: every claim it lists was still present and false on `c9f0918`; each is deleted or corrected in
  doc/README.md. The per-plan history table was DELETED to `git` rather than brought to P31 (P27 decisions 2 and 4;
  Q466), its last form cited at the public `2b48046`.
- **Q508**: all three senses of *gate* stay (decision 2). The commands row had named `gate:item` against ADR 0070,
  which never mentions it; by the maintainer's answer the row now says exactly what ADR 0070 says, and `gate:item`
  is the `confirming gate` row's.
- **Workflow section 1 rule 6 fired three times, each answered by the maintainer on 2026-10-09**, written into W146's
  Exceptions before the edit: (A) doc/scheduler-upstream.md's two sentences now say S10 is not raised; (B) the
  false *every snippet executed* sentence corrected in README.md and CLAUDE.md, doc/decisions/README.md:29 left;
  (C) the glossary row above. None is on this plan's W146 row.
- **Prediction 5 held**: the derived floors moved with their measures through W146's edits, and with sixty
  ordinary linking documents added on its tree `check:markdown:selftest` EXITed 0.
- **Prediction 6 REVERSED, by the maintainer's decision (B (ii)) rather than by its named mechanism**: CLAUDE.md's
  one false sentence about AGENTS.md's snippets was corrected, +55 bytes, `check:budget` green. `doc/workflow.md` and
  `doc/concept.md` are untouched.
- **Prediction 2 held**: no ADR; ADR 0089 is unused.
- **Counts:** L1-L5 unchanged at **1580** in node, deno and chromium; L6 unchanged at **164** runs, 2487 assertions.
- **The confirming gate — the plan's**: `npm run gate:full` **EXIT 0** on `c99e930`, once, on a still tree
  (decision 4): 2413 s, the self-tests 11/11 ok at **2272.1 s wall**, `check:register:selftest` included.

### The exit artifact, measured on the final tree

- **`npm run gate:full`: EXIT 0** on `c99e930` (above). The record step then changed only documents and question
  files; `check:register`, `check:markdown` and `npm run gate` were re-run on the record step's tree and EXITed 0.
- **`npm run q -- --where "resolved-by~P31" --fields id,status,resolved-by`** lists **thirteen**, each `resolved` and
  naming its item: Q142 (W144), Q244 (W142), Q266 (W141), Q283 (W141), Q337 (W144), Q434 (W143), Q437 (W143), Q487
  (W144), Q508 (W146), Q533 (W140), Q536 (W143), Q541 (W145), Q542 (W146). **That is decision 1's twelve plus Q487**,
  which W144 closed by the maintainer's answer of 2026-10-08 (deferred, waiting on Q142's decision). No other difference.
- **`npm run q -- --where status=open --count`: 2**, Q20 and Q513, the two decision 1 put Out. No item raised a question.
- **The answer to the plan's question**: all twelve of decision 1's questions closed inside this repository, each when
  its fix landed, and a thirteenth with them. Prediction 1 held for every item: seven items, zero questions raised;
  workflow section 1 rule 6 fired in five of the seven items, every time answered rather than raised.

## Retro

*Pass 3 ran on 2026-10-09 over `c47087a`, with the working tree clean before it. Scratch
`dev-dist/p31r-25787/` (the retro shell's pid). Every figure is read from the items' logs under
`dev-dist/w140-2595/`, `w142-4000/`, `w141-12912/`, `w145-14690/`, `w144-16309/`, `w143-19571/` and
`w146-23759/`, and from their Records. Ids in this Retro are bare text, as in the Record. **Sections 1-9
are the proposal as it went up; section 10 is the maintainer's answer and the edits it allowed.***

### 1. Workflow section 1 rule 6 (v0.30): what it did

**Closed and raised, per item**, with every decision put to the maintainer while the item ran. A
*rule-6 ask* is a widening of `Owns` asked before the edit; an *other stop* is any other mid-item
question. *Rounds* are distinct answer sittings, read from the Exceptions commits and the Records.

| item | closed | raised | rule-6 asks, each with its answer | other stops, each with its answer | questions | rounds |
|---|---|---|---|---|---|---|
| W140 | Q533 | 0 | `test/harness.ts` — **(A)**, `throws` matches `${name}: ${message}`; `test/definition/map.test.ts` comment — YES; `test/driver/nested-regions.test.ts` comment — YES | — | 3 | 2 |
| W142 | Q244 | 0 | — | prediction 3's stop — **(B)**, route the L6 harness too, which put `examples/run-flow.ts` into `Owns` | 1 | 1 |
| W141 | Q266, Q283 | 0 | `AGENTS.md` section-20 sentence — YES (A); `scripts/build-browser-tests.mjs` corpus line — YES (B, option 1) | the spec's single-task F1 sentence — corrected as `spec/flow-definition.md` v0.29 (`b9dd0c8`), a spec change of its own | 3 | 2 |
| W145 | Q541 | 0 | — | — | 0 | 0 |
| W144 | Q142, Q337, Q487 | 0 | `doc/work-items/TEMPLATE.md` note and `scripts/check-spec-selftest.mjs:31` — YES (one ask, two files) | stop-and-ask (c) — **(A) plus M9**; the ADR note — **(a)**, dated notes, no ADR 0089; Q487 — close it here | 4 | 2 |
| W143 | Q434, Q437, Q536 | 0 | `scripts/selftest-guards.mjs`, a new shared file — YES (option A) | the +22% wall — **(B)**, nine guard cases in process | 2 | 2 |
| W146 | Q542, Q508 | 0 | doc/scheduler-upstream.md — **A**: YES; `CLAUDE.md` and `README.md` — **B**: (i) and (ii) YES, (iii) leave doc/decisions/README.md:29; the glossary row — **C (b)** | — | 3 | 1 |
| **P31** | **13** | **0** | **10 asks, 10 answered, 0 NO** | **6** | **16** | **10** |

**Against P30**: P30 closed 13 and its items raised 4 (Q533, Q536, Q541, Q542; Q534 was raised and
closed inside it), with **five** mid-plan answers over four items (P30's Retro section 5 (d)). **P31
closed 13 and raised 0, with sixteen questions in ten sittings over seven items** — about 2.3
questions per item against P30's 1.25. Open questions went 14 → 2, the two decision 1 put Out.

**Did it work as intended? Yes, on its own measure.** Its trigger was *a unit may open more questions
than it closes*; no P31 item opened one. **What it cost is the sixteen answers**, every one of which
blocked a serial plan until it came; how long each wait was is **not measured** — nothing records
when a question went up, only when its answer was written down.

**Three asks were more than *one simple decision*:**

1. **W146's B** came back in three parts and moved the always-read set: (ii) edited `CLAUDE.md`, which
   reversed prediction 6. A decision about the always-read set is the maintainer's anyway, so asking
   was right; it was not *simple*.
2. **W141's F1 sentence** could not be a rule-6 widening at all: a spec change is its own change
   (CLAUDE.md, *Working rules*). It was answered the next morning by `b9dd0c8`, and **neither W141's
   Record nor P31's recorded the answer** — both still said *outstanding*. This retro corrected both
   (section 9).
3. **W143's helper** was asked as a widening and was a NEW module that ten self-tests import. The
   answer was a YES, but the fix was not *small* in rule 6's sense, and rule 6 says such a fix is a
   question raised.

**And rule 6's NO branch has never run**: ten asks, ten YESes or chosen options. *A question is
raised only on a NO* is untested. **Verdict: no change.** Each of the three is one occurrence of its
own kind (pass 3 rule 2).

### 2. Gate cost

**The confirming gate per item**, each `gate:item` or `gate:full` EXIT 0, from the `selftests —`
summary line of each log. The ladder ahead of it is ~140 s every time (W144 1455 s minus 1316 s;
W146 2413 s minus 2272 s).

| item | log | self-test wall | serial-equivalent | binding lane |
|---|---|---|---|---|
| W139 (for reference) | `w139-1638/item.log` | 845.8 s | 3975.2 s | wiring 832.5 |
| W140 | `item.log` | 845.0 s | 3940.1 s | wiring 830.8 |
| W142 | `item.log` | 846.7 s | 3972.9 s | wiring 832.4 |
| W141 | `item.log` | 879.4 s | 4151.6 s | wiring 863.8 |
| W145 | `item.log` | 850.7 s | 3967.8 s | wiring 836.6 |
| W144 | `item.log` | **1316.1 s** | 4660.2 s | **markdown 1302.6** |
| W143, first form | `item.log` (`0b2d8c3`) | **1600.1 s** | 5332.9 s | markdown 1585.4 |
| W143, after (B) | `item2.log` (`f722ffa`) | 1277.9 s | 4646.8 s | markdown 1263.0 |
| W143, the register lane alone after it | `register.log` | 1720 s | — | — |
| W146 (`gate:full`) | `full.log` | 2272.1 s | 7184.4 s | register 2257.3 |

**Per lane** (s), as the runner prints it, nine lanes in `gate:item`, ten in `gate:full`:

| lane | W140 | W142 | W141 | W145 | W144 | W143 (B) | W146 full |
|---|---|---|---|---|---|---|---|
| `check:markdown:selftest` | 614.5 | 622.0 | 648.1 | 622.0 | **1302.6** | **1263.0** | **1385.4** |
| `check:wiring:selftest` | 830.8 | 832.4 | 863.8 | 836.6 | 851.1 | 845.0 | 895.3 |
| `check:docs:selftest` | 806.5 | 799.7 | 835.0 | 807.1 | 807.0 | 836.7 | 875.3 |
| `check:source:selftest` | 775.5 | 785.8 | 817.7 | 790.9 | 787.7 | 730.9 | 768.1 |
| `lookup:selftest` | 568.3 | 573.3 | 600.1 | 569.8 | 561.5 | 560.8 | 586.9 |
| `check:spec:selftest` | 150.9 | 159.7 | 171.1 | 149.4 | 159.1 | 171.3 | 177.9 |
| `check:budget:selftest` | 91.9 | 97.5 | 108.6 | 91.4 | 90.6 | 121.9 | 123.5 |
| `check:policies:selftest` | 38.8 | 39.7 | 41.4 | 38.4 | 38.8 | 53.1 | 50.8 |
| `check:workers:selftest` | 48.7 | 48.6 | 50.3 | 48.3 | 48.3 | 49.2 | 49.3 |
| `check:scheduler:selftest` (alone) | 14.0 | 14.1 | 15.5 | 13.9 | 13.5 | 14.8 | 14.7 |
| `check:register:selftest` | left out | left out | left out | left out | left out | 1720 alone | 2257.3 |

**What `gate:item` saved, measured.** The counterfactual for each item is `gate:full`'s self-test
wall; W146's **2272.1 s** is used, the lower of the two P31-era runs (W139's was 2515.8 s).

| item | `gate:item` self-test wall | saved against 2272.1 s |
|---|---|---|
| W140, W142, W141, W145 | 845.0 / 846.7 / 879.4 / 850.7 s | **1427 / 1425 / 1393 / 1421 s** (~23.5 min each) |
| W144 | 1316.1 s | **956 s** (~16 min) |
| W143 | 1277.9 s, then 1720 s for the register lane alone | **−726 s**: it cost 12 minutes MORE |
| W146 | ran `gate:full`, the plan's last item | 0 |
| **P31** | | **5896 s, about 98 minutes** |

P30's retro estimated ~1550 s (26 min) per item. **It measured 1393-1427 s while markdown was not the
binding lane, and 956 s after.**

- **W143 lost time by following P31 decision 4's wording.** The decision said *runs the register lane
  too*, so W143 ran it after `gate:item`, one lane after the other: 2998 s against a ~2272 s
  `gate:full`, in which it runs alongside the others. Workflow v0.29 says *runs `gate:full` too*.
  The plan's paraphrase cost the difference. *(W143 also paid 1600 s for its first-form gate, which
  was the measurement behind its stop-and-ask, not a cost of the rule.)*
- **The markdown lane went up at W144 and stayed up**: about 620 s inside `gate:item` before, then
  1302.6, 1263.0 and 1385.4 s. It is now `gate:item`'s binding lane, 420-450 s above wiring, so
  **the gate's wall rose 51-55%** (848 → 1278-1316 s). Alone, it reads 763 s (W144's `st3.log`) and
  742 s (W143 after (B)), so concurrency adds ~1.7×. **The cause, measured here:**
  `check-markdown.mjs` since W144 calls `resolveLinks` FOUR times per run: the walk, then once per
  probe tree in `deriveFloors`. Each call re-reads every file and re-tests every target's existence.
  The self-test runs the check once per probe and META child, so it pays that factor each time. One
  machine, five warm samples each, `dev-dist/p31r-25787/`:

  | `node scripts/check-markdown.mjs` on | median | samples (ms) |
  |---|---|---|
  | a `git archive` of `fb64b63` (before W144) | **~820 ms** | 1110, 588, 656, 1069, 824 (and 637-1138 in a second set) |
  | a `git archive` of `HEAD` | **~2130 ms** | 2125, 2210, 1808, 2104, 2921 |
  | the same, with ONE read cache and ONE `existsSync` cache shared across the four calls (`cache-probe.mjs`) | **~1170 ms** | 1032, 1899, 1510, 1170, 1045 — **report byte-identical** to HEAD's |

- **The register lane did NOT go up.** It read 2502.4 s inside W139's `gate:full` and 1915 s alone
  before W143. W143 made a SELF child stop at its first red after META, which brought it to 1717-1720 s
  alone, and it read 2257.3 s inside W146's `gate:full`. **The 1720 against 2257 is the arrangement,
  not growth** (~1.31× under ten concurrent lanes), which is section 8's own warning that *a per-lane
  wall measured in one arrangement does not predict the wall in another*. `gate:full`'s self-test
  wall FELL from 2515.8 s (W139) to 2272.1 s (W146).
- **W143's guards cost the cheap lanes**: budget 91 → 122 s, policies 39 → 53 s. The four large lanes
  are flat or lower after (B).

**Yield**: eight confirming gates, **81 lane runs, 0 red**. That is the second plan running with no
self-test red inside a confirming gate. Every self-test red the Records report came from a lane the
item itself was editing (section 5 rule 7): W144's markdown, and W143's.

### 3. Rules followed that failed, and the candidates (pass 3 rules 3 and 5)

| candidate | followed? | caught by (the rung) | verdict |
|---|---|---|---|
| **(a) every item's rule-8 grader mis-declared probes** | FOLLOWED | rule 8's exact-set match, every time; no product defect | **No change** (below) |
| **(b) heredoc corruption, W143 twice and W146 once** | **BROKEN**: both wrote an edit script through a heredoc against CLAUDE.md's *write the script with the Write tool and run it by path* | W143: `node --check`, and `grep` reporting a binary file. W146: its own no-op controls graded CRASH (23/28), then `node --check`. All before L0 and before any verdict was read | **No change** |
| **(c) `check:register` R8 refused a `resolved-by` naming ADR 0076 and ADR 0078 at W144**, with the warning in the brief, and P30's W131 the same | FOLLOWED: the check ran at the record step | `check:register` in `gate`, on its first run, before the commit | **No change**: the rung costs seconds and caught both. Prose would be one more thing to read |
| **(d) W143's first form raised the `gate:item` wall 22%** | FOLLOWED: v0.29 confirming gate | **no rung**. Section 8 sets no budget for proving the checks can fail. The author caught it by comparing with W144's wall, and it went up as a stop-and-ask | **No change**: the stop-and-ask did the work, and (B) stated its loss (guard cases one level less end-to-end) |

**(a) in numbers.** Gradings that came back against their declaration, from each Record:

| item | gradings | against declaration: the DECLARATION's | the CODE's | extra re-run passes |
|---|---|---|---|---|
| W140 | 73 | 3 | 0 | 1 (1b) |
| W142 | 66 | 15 (the Record's count; p-forget twice) | 0 | 2 (1b, 2b) |
| W141 | 178 | 4 | 0 | 1 |
| W145 | 48 | 5 probes (p8, p9, t1, t2, r2) | 1 (p14) | 1 (2b) |
| W144 | 74 | 4, plus 2 RED where a survivor was declared (r7, r7b) | 1 (d6) | 2 |
| W143 | 135 | 2 (s7, g-wrongb), plus 1 harness abort (wk2) | 0 | 0 |
| W146 | 76 | **0**: every `must` copied from a failure line SEEN first | 0 | 0, plus 5 CRASH from (b) |

**35 declaration errors in 650 gradings, against P30's 24 over four items.** Each one was caught by
the exact-set match (section 5 rule 7 (c)). **No re-declaration turned a CAUGHT into a survivor**:
every Record names each re-declaration and the line it was read from.

**W146 is the one item whose Record says every `must` was copied from a failure line seen BEFORE
the pass, and it is the one item with zero.** That is one occurrence. It is also what section 5's
existing (f) row, *graded every pass on its clause's own failure line*, already asks, so it is the
existing rule followed early, not a second mechanism. **Followed, and it worked, for the second plan
running; the cost is the extra passes in the table.**

**Rule 5 over P31's other defects**, grouped by who caught them:

| caught by | the defects |
|---|---|
| a rung in `gate` | W144's R8 (above); W142's enumerable observer (L6's cross-row byte census); W142's first router taking the L1 process down (L1); W142 breaking W76's binding on the `new Driver` literal (L1); W141's corpus line (`test:browser`, chromium, *fixture not inlined*) |
| a self-test inside a confirming gate | **0** |
| the item's own new guard (rule 7 at birth) | W143's Q434 helper found a dead first edit in check-policies-selftest.mjs on its first run |
| rule 8, the code's | W145 p14 (a rejection handler guarding nothing); W144 d6 (the in-memory tree differing from the real one, every verdict unchanged) |
| the conformity readers | W141 2 blocking, W143 1 blocking, and the should-fix findings of every item. Sharpest: W141's order of kinds, W143's controls deletable at exit 0, W146's glossary row claiming what ADR 0070 does not say |
| the adequacy readers (W140-W142) | W141's prototype-key defect (Rl, older than the item, found by construction); W142's unrouted resume (M22); W140's superstring `name` |
| a measurement, before any rung | W142's harness O(N²) (prediction 3); W141's F1 premise; W143's wall |
| this retro | two stale claims in the reviewed items' files (section 9) |

**The readers are still the mechanism, for the sixth plan running.** Every defect a rung could have
caught, a rung in `gate` caught.

### 4. The predictions, scored

| | prediction | measured |
|---|---|---|
| 1 | every item closes what it takes and raises at most one | **HELD**: 13 closed, 0 raised, in all seven items |
| 2 | W142 is the only item needing an ADR | **HELD**: ADR 0088 only. W144 chose dated notes over ADR 0089 |
| 3 | W142 measures N runs on one scheduler as linear | **HELD after a stop**: the library 6N² → 6N handed events; W55's command linear after (B), 904 ms and 68.0 MiB at N = 800 against 13 652 ms and 879 MiB. **A residual N × 6N walk in `examples/run-flow.ts`'s `poolOfTask`** is stated, not removed (W142, conformity finding 9). It is the harness's, and N = 800 did not show it |
| 4 | W140 changes no L1-L6 count except its own assertions | **HELD**: 1528 cases unchanged; L6 2465 → 2466 |
| 5 | W144's derived floors hold through W146's edits | **HELD**: the floors moved with their measures (M3 170 → 171), and with sixty documents added `check:markdown:selftest` EXITed 0 |
| 6 | the always-read set does not grow | **REVERSED** by W146's B (ii): CLAUDE.md +55 bytes, `check:budget` green |

**On 6, this retro differs from W146's Record.** The Record says it was reversed *by the maintainer's
decision rather than by its named mechanism*. The named mechanism was *a fix whose only home is one of
them*, and CLAUDE.md:18's false sentence is exactly that: it lives only in CLAUDE.md. The maintainer's
YES was rule 6's permission for the edit, **not a different cause**. Five of six held, and the sixth
was reversed for the reason it named.

### 5. Proposals (pass 3 rule 4), ranked

**A. Recommended for the workflow: NO CHANGE.** Rule 6 did what it was adopted to do (section 1);
`gate:item` saved ~98 minutes (section 2); no rule followed in P31 failed in a way that a new rule
would fix (section 3).

**B. Recommended, as a WORK ITEM rather than a rule: `check-markdown.mjs` shares one read and one
existence cache across the walk and its three probe trees.**

- **Replaces**: nothing in `doc/workflow.md`. Inside `resolveLinks`, the per-call reads and existence
  tests become shared ones.
- **Saves**: measured on one machine, the check's run falls from ~2130 ms to ~1170 ms with the report
  byte-identical. If the lane scales with the check's run, `check:markdown:selftest` drops back under
  wiring, and `gate:item`'s wall falls from ~1280-1316 s to ~850 s: **about 7 minutes per item**.
  *That scaling is an estimate, not a measurement*. The work item measures it on `gate:item` itself.
- **Costs**: one small item. It owns `scripts/check-markdown.mjs` and its self-test, with a rule-7
  provocation at birth: **a cache that ignores `absent` or `rewrite` must go red**.
- **Would no longer catch**: nothing, if the observer W144 built stays. The risk is W144's d6 class
  again: an in-memory tree that differs from the real one while every verdict holds. The self-test's
  per-run comparison of each tree probe's fixture with the in-memory measure (cmp2) is that observer.
  The cache must sit BELOW `rewrite`, as `cache-probe.mjs` places it.

**C. For the NEXT plan's declaration, not the workflow: an item that edits the register's machinery
runs `gate:full`, as v0.29 says, not `gate:item` followed by the register lane.**

- **Replaces**: P31 decision 4's paraphrase.
- **Saves**: ~726 s per such item (W143).
- **Costs**: nothing.
- **Would no longer catch**: nothing, because the same eleven lanes run.

**D. Optional, for the maintainer: CLAUDE.md's heredoc count.**

- **The change**: *seven occurrences across three items* → *ten across five* (W143's two and W146's
  one).
- **Costs**: about 0 bytes, but it edits the always-read set, which is the maintainer's call.
- **What leaving it costs**: a stale count. **The warning's prescription is correct and was broken,
  not followed and failed**, so the count is the only thing that moves.

### 6. Refusals

- **A check over `doc/` — the 30th time, P2-P31.** Section 9's first correction is P31's Record and
  W141's saying an ask was *outstanding* a day after `b9dd0c8` answered it, and this retro is what
  found them. W146's six declared survivors (s1-s6) are the same class. The only mechanical observer
  is a check that prose is true, refused on the row's standing ground.
- **No other ledger row is re-raised.** Every late file in P31 was asked before its edit, so *an
  `Owns` pre-declaration rule* has no miscount to answer.

### 7. The overlap

**W140 4, W142 4, W141 3** — the eighty-fourth, eighty-fifth and eighty-sixth measurements, each
inside the 0-4 band with briefs written apart. W145, W144, W143 and W146 ran one reader each, as
decision 6 declared, so they took none. **The ordinal is now EIGHTY-SIX and the next measurement is
the EIGHTY-SEVENTH.** The band's *fifty-nine* stays: P28's and P29's retros held it as the band's
denominator, not the ordinal.

### 8. Ids

- **Issued**: W140-W146 and ADR 0088. **No Q was issued**.
- **Reserved and unissued, SKIPPED and never reissued** (section 3):
  - W147, W148 and W149 CLOSED unissued;
  - Q553-Q573 SPENT: P31's block of Q553-Q567, W143's Q568-Q570 and W146's Q571-Q573. None exists in
    the tree;
  - ADR 0089 SKIPPED.

**The next plan starts at W150, Q574 and ADR 0090.**

*`npm run state` before this section printed the tree's W147 / Q553 / ADR 0089 against the ledger's
W140 / Q553 / ADR 0088, the ledger being W139's sentence. P30's retro chose W139 on the same rule, and
P29's chose W128-W130 and ADR 0083-0084.*

### 9. What the retro changed and ran

| file | why |
|---|---|
| this plan | the Status line; W141's *one ask is outstanding* bullet in the Record, given its answer (pass 3 rule 6); this Retro |
| doc/work-items/w141-… | its *One ask outstanding* bullet, given the same answer (pass 3 rule 6) |
| doc/work-items/w146-… | *an eighth occurrence* annotated as the tenth, counting W143's two (pass 3 rule 6) |

Ran, each redirected with `$?` read in the same command: `npm run state` (before and after), the
check-markdown timing in `dev-dist/p31r-25787/` (copies only, never the tree), and on the final tree
`check:markdown`, `check:register` and `npm run gate`.

### 10. The maintainer's answer, 2026-10-09: A, B and C; D declined

- **A — no change to any rule in `doc/workflow.md`.** v0.30 stands.
- **B — ADOPTED AS A WORK ITEM, not built here.** `check-markdown.mjs` shares one read cache and one
  existence cache across its walk and the three probe trees. **It is the first item of the next plan,
  or an item outside any plan; the maintainer chooses when it starts.** Its gate carries a birth
  provocation (section 5 rule 7): a cache that ignores `absent` or `rewrite` goes red. It keeps the
  self-test's comparison of each tree probe's fixture with the in-memory measure. It measures the
  `gate:item` wall before and after, because section 5's ~7 minutes is an estimate.
- **2026-10-09: B landed at W150**, an item outside any plan (doc/work-items/w150-check-markdown-reads-each-file-once.md).
  It took one run of the check from 1425 to 519 ms, with a byte-identical report. `gate:item`'s self-test
  wall went from 1351.5 to 885.1 s, about 7.8 minutes saved against the estimate's 7, and the markdown
  lane went from 1335.2 to 727.8 s. Most of the saving is the existence cache, not the read cache.
- **C — the next plan's declaration says it**: an item that edits `scripts/check-register*.mjs`,
  `scripts/state.mjs` or `doc/questions/README.md` runs `gate:full`, as v0.29 says. It does not run
  `gate:item` and then the register lane after it.
  - **No workflow text changes. This retro's judgment is that v0.29's wording is ambiguous enough to
    have contributed.** *runs `gate:full` too* can be read as *in addition to `gate:item`*.
  - P31 decision 4 paraphrased it as *runs the register lane too*, which is that reading, and W143
    followed the decision.
  - The cure is the declaration's sentence, as answered, and not a workflow edit.
- **D — declined.** `CLAUDE.md` is untouched.

**The held bookkeeping, made in `doc/workflow.md`, one commit each:**
- the refusal ledger's first row: 30 times, P2-P31;
- the Status line: THIRTY-ONE times, P1 through P31;
- section 6: eighty-six, so the next is the EIGHTY-SEVENTH.

**P31 joins the Status line's *adopted nothing* list, which now reads P8, P25, P28, P29 and P31.**
- The judgment is that the list's sense is *adopted no workflow change*: B is a work item, C is a
  sentence in a declaration, and neither moves a rule.
- *One inconsistency, noted and not acted on*: P29 is on the list, yet its retro's option 1 became
  v0.28. That is the list's own history; this retro does not re-judge it.

**No new version.** `doc/workflow.md` moved only by bookkeeping, and its version index gains no
entry. This follows P28's retro, which adopted nothing, changed the ordinal and took no version; the
index runs v0.27 P27, then v0.28 P29.

Ran after the edits, each redirected with `$?` read in the same command: `check:budget` and
`npm run gate` (`dev-dist/p31r-25787/`).
