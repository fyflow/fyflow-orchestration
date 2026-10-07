# P30 — Which open questions close by a fix their own `closes-when` already names?

**Status:** complete — declared 2026-10-06 on `e61df81`; W133 done 2026-10-06, W131, W132 and W134 done 2026-10-07 (Record below); the retro is to come
**Question this plan answers:** *which open questions close by a fix their own `closes-when` already
names, and does each one close when that fix lands?*
**Exit artifact:** *on the final tree, `npm run gate:full` EXITs 0; `npm run q -- --where
"resolved-by~P30" --fields id,status,resolved-by` lists exactly the thirteen questions of decision 1 (its twelve plus Q534),
each `resolved` and each naming the item that closed it; and `npm run q -- --where status=open
--count` prints **10**, down from 22 at `e61df81` by the twelve, plus any question an item raises open, each
named in that item's Record.* *(Read thirteen and **9** at declaration, then fourteen and **8** after Q534
joined at W133's record step, stop-and-ask (g); both were wrong.)* *(Corrected 2026-10-07, by the maintainer's answer to W134's Record: decision 1's table always listed twelve, not thirteen, and Q534 was raised after `e61df81`, so it was never among the 22.)*
**Reserves:** W131-W138, Q533-Q547, ADR 0085-0086

```
Question: which open questions close by a fix their own closes-when already names?
Items:    W131 (the self-tests: Q144, Q430, Q439, Q454, Q490),
          W132 (the test harness: Q272, Q382),
          W133 (two spec sentences and one message: Q61, Q62, Q63),
          W134 (the repository's own files: Q235, Q484, Q534)
Reserves: W131-W138, Q533-Q547, ADR 0085-0086
Baseline: plans to p29, work items to w127, ADRs to 0084, register to Q532 — `npm run state`
          on `e61df81`, where the tree and the ledger AGREE on W131 / Q533 / ADR 0085
Declared: 2026-10-06 on `e61df81`
```

## Why this plan, and why now

P29 gave every open question a `closes-when` (`R9`, ADR 0082). **Twenty-two are open on `e61df81`,
and for twelve of them the `closes-when` names a fix of a few lines in one or two files**,
most of them written as *"one commit outside P29"*. P29 decision 3 forbade it from answering
anything, so those fixes were left for a later plan. This is that plan.

Every claim below was **re-checked on `e61df81`**, not inherited from P29's notes, which are dated
`988ef5f`:

| Q | the claim in its note | on `e61df81` |
|---|---|---|
| Q235 | `.gitignore` has no `.claude` entry | true: 6 entries, none under `.claude/` |
| Q144 | `scripts/check-policies.mjs` ends on `names.join` | true, line 187 |
| Q272 | `test/runner.ts` imports every suite outside a `try` | true, line 38 |
| Q382 | `test/definition/gate.test.ts` names its cases by index | true: 17 `test(DECLARED_CASES[i]!` sites |
| Q430, Q454 | `scripts/check-docs-selftest.mjs`'s header states site counts that are stale | true: the header says 55 and 64; `grep -c "fail(" scripts/check-docs.mjs` is 58 |
| Q439 | `README_SNIPPET_FLOOR` is held by no self-test | true: it is 3 at `scripts/check-docs.mjs:953`, and the self-test's source-text bound (lines 975-990) reads only `X4_WIDTH` |
| Q490 | `DECLARED_TARGETS_UNDECLARED` has no META entry | true: 2 hits, both in `scripts/check-budget.mjs` |
| Q63 | the message opens with its class name | true, and **it is worse than the title says**: `src/driver/driver.ts:1806` builds `stoppedBy` as `${constructor.name}: ${message}`, so `RunState.stoppedBy` reads `UncloneableResult: UncloneableResult: the result of task …` without any consumer render |
| Q484 | `doc/README.md` carries stale derived counts | true, and **far more than four** — section 3 |

## Decisions taken before fan-out

**1. Twelve questions are in. Ten are Out**, by the maintainer's choice on 2026-10-06 (*"A + B"*).
*(Corrected 2026-10-07, by the maintainer's answer to W134's Record: decision 1's table always listed twelve, not thirteen, and Q534 was raised after `e61df81`, so it was never among the 22.)*
**Q534 is the thirteenth**, raised by W133 and added to W134 by the maintainer on the same day
(stop-and-ask (g)):

| | questions | why |
|---|---|---|
| **in, tier A** | Q144, Q235, Q272, Q382, Q430, Q439, Q454, Q484, Q490 | P27 decision 4 or a device already in the tree sets the fix's direction. The only open choice is how to write it |
| **in, tier B** | Q61, Q62, Q63 | one spec sentence, or a small change to the public surface. Section 2 decides the direction of each |
| **Out, tier C** | Q337, Q434, Q437 | concrete fixes, but spread across several files. **Q337 re-takes the `M3`-`M5` floors, which is [Q142](../questions/q142.md)'s question**, so it waits for that decision |
| **Out, decisions** | Q20, Q513 (they close in `fyflow-react-components`, P29 decision 7), Q142, Q244, Q266, Q283, Q508 | each `closes-when` names a design or naming decision, not a fix. Q508 was offered and left out by the maintainer |

**2. The direction of each tier-B question is decided here**, so no item has to choose it:

- **Q61. `spec/outcome-record.md`'s `OR-R6` gains the thread-pool sentence.** With a thread pool,
  the scheduler's own structured clone refuses the value first, the task ends `user_action`, and no
  result reaches the listener. So `OR-R6` is reachable only from an inline pool. **P2 measured this
  before the 0.5.2 pin.** W133 re-measures it on 0.5.2 at L6 and writes the sentence from that
  measurement rather than from P2's. If the measurement differs, that is stop-and-ask (b).
- **Q62. `spec/run-state.md`'s `RN-R6` says `regions[*].suspended` is CURRENT**: a branch path
  leaves it on that branch's terminal event. That is how the fold behaves (`examples/l6.ts:564-571`).
  It is the spec catching up to the code, and the code does not change. The spec change owes a test,
  so W133 adds an L2 assertion that a suspended branch is listed while it is suspended and is not
  listed once it is resolved. The test's expected values come from the new sentence.
- **Q63. The message drops its class name**: `the result of task "<id>" is not structured-cloneable`.
  Chosen by the maintainer on 2026-10-06. `stoppedBy` and every `${kind}: ${message}` render then
  read the class name once. `AGENTS.md:1797` asserts `stoppedBy.startsWith('UncloneableResult')`, and
  that still holds, because `driver.ts:1806` supplies the name. **This changes public message text**,
  so it is a `fix:` commit, and `AGENTS.md` changes only if a snippet quotes the text.

Each spec change is **its own change with its rationale stated** (`CLAUDE.md`, *Working rules*). It
bumps the document's own version (`outcome-record` v0.10 → v0.11, `run-state` v0.12 → v0.13) and is
never a side effect of a test.

**3. Q484 is a DELETION, not a re-take** — P27 decision 4. The question names four sections of
`doc/README.md`. Measured on `e61df81`, its *Reading order* and *Document status* tables carry
dozens of derived figures: register counts, ADR counts, spec example and rule counts, workflow
versions and plan counts, and a parenthetical history of each one going stale. **W134 deletes every
figure that `npm run state` or a check derives**, and the parentheticals that record that figure's
staleness go with it. A cell left with nothing to say goes too. This is
`doc/README.md`'s first edit since W115, and the Out section's *not CLAUDE.md* still holds.

**4. Q144's fix breaks the only `ran:` case in its own self-test** (stop-and-ask (a)).
`scripts/check-policies-selftest.mjs:645-658` uses the Q144 mutant as a `SELF` entry, and it is the
file's only demonstration that the `ran:` guard fires. The mutant fires because it is inert on the
clean tree and fatal under its probe, and **it is fatal only because of `names.join`**. Fix the
line and that entry stops proving anything. **W131 constructs a replacement `ran:` case before it
lands the fix**, and the Record names which mutation now carries it. `check-docs`' W29 case is the
other demonstration of `ran:` in the tree, so that guard is not proved only here. But this file
would otherwise lose its own proof.

**5. Q430 and Q454 are one fix**: both are about the site counts in `check-docs-selftest.mjs`'s
header. **Delete the counts** (P27 decision 4) rather than computing them. Q454's `closes-when`
offers the computed census as the alternative. It is refused here because a census printed for a
reader is a second copy of `grep -c`, and both questions record it going stale three times.

**6. Every item's confirming gate is `npm run gate:full`** (`doc/workflow.md` section 4, v0.26).
None runs the v0.28 alternative of self-tests one at a time. Every item edits `doc/questions/**` in
its record step, and `check:register:selftest` alone ran 1828 s at W127. Three of the four items
also own a file that a self-test reads. So per-lane runs would cost more than `gate:full` and would
cover less.

**7. The items run SERIALLY on one tree**, although their `Owns` are disjoint. Each item's
`gate:full` and its reader need the tree to hold still (section 6, v0.15), and four agents on one
checkout cannot give them that. The order is W133, W131, W132, W134: the public-surface change
first, and the document deletion last, so that its `check:markdown` floors are measured on the
final tree.

**8. Readers.** **W133 runs both readers**, conformity and adequacy, because it changes `spec/` and
`src/`. **W131, W132 and W134 run one conformity reader each**: W131 and W132 change checks and
harnesses whose provocations are checked in (section 5 rule 7), and W134 changes no behaviour. The
item that runs two readers states its overlap in its Record, and it is the **eighty-third**
measurement (P29's retro, section 6).

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W133 | **Two spec sentences and one message.** Q61: `OR-R6` gains the thread-pool sentence, re-measured at L6 on 0.5.2. Q62: `RN-R6` says `suspended` is current, with an L2 test. Q63: the message drops its class name, and a test asserts `stoppedBy` names the class exactly once | `spec/outcome-record.md`, `spec/run-state.md`, `src/driver/listener.ts`, `test/driver/log.test.ts`, the L2 suite that takes Q62's test, `examples/l6.ts` (the Q61 row and the comments at 564-571 and 4961-5016), `AGENTS.md` only if a snippet quotes the message | nothing | L0-L6 in every runtime that rung requires; both readers; `gate:full` EXIT 0 |
| W131 | **The self-tests' stale and unpinned.** Q144: the success line stops dereferencing `names`, after a replacement `ran:` case exists (decision 4). Q430 + Q454: the header's site counts deleted (decision 5). Q439: `README_SNIPPET_FLOOR` read by the self-test's source-text bound beside `X4_WIDTH`'s. Q490: the META entry for `DECLARED_TARGETS_UNDECLARED` | `scripts/check-policies.mjs`, `scripts/check-policies-selftest.mjs`, `scripts/check-docs-selftest.mjs`, `scripts/check-budget-selftest.mjs`, plus comment-only edits to `scripts/check-markdown-selftest.mjs:871` and `scripts/check-scheduler-selftest.mjs:124` if their Q144 sentences become false | W133 | each new or moved clause provoked at birth (section 5 rule 7); conformity reader; `gate:full` EXIT 0 |
| W132 | **The test harness.** Q272: `test/runner.ts` reports a suite it cannot import as one named `FAIL` and exits 1, and it still runs the other suites. Q382: the 17 cases in `test/definition/gate.test.ts` are named at the call site, as in `test/driver/gate.test.ts` | `test/runner.ts`, `test/definition/gate.test.ts`, and a checked-in provocation for Q272 (a suite that throws on import, outside the default glob) | W131 | L1-L5 in Node, Deno and Chromium, with the case count unchanged; Q272's provocation shows one named `FAIL` and EXIT 1; conformity reader; `gate:full` EXIT 0 |
| W134 | **The repository's own files.** Q235: `.gitignore` gains `.claude/worktrees/`. Q484: every derived figure in `doc/README.md` deleted (decision 3). Q534: `AGENTS.md`'s sentence on a result that cannot be cloned states the pool dependence, as `spec/outcome-record.md` `OR-R6` v0.11 does — a non-optional task ends `user_action` and an `optional` one `failed` on a thread pool | `.gitignore`, `doc/README.md`, `AGENTS.md` (that sentence only) | W132 | `git check-ignore .claude/worktrees/x` EXIT 0; `check:markdown` and `check:markdown:selftest` EXIT 0 on the final tree; `check:docs` EXIT 0 (it executes `AGENTS.md`); conformity reader; `gate:full` EXIT 0 |

**Item files are written from these rows when each item starts**, as at P29, so that what one item
learns reaches the next item's declaration.

## Predictions

| | prediction | what would reverse it |
|---|---|---|
| **1** | **Q61's sentence survives re-measurement**: on 0.5.2 a thread pool still ends the task `user_action` and no result reaches the listener | the scheduler now passing the value, or ending the task `failed` (stop-and-ask (b)) |
| **2** | **no L1-L6 case count moves except by W133's added tests**: Q382 renames and Q272 changes reporting, not cases | a rename that changes a case's identity in a way some check counts |
| **3** | **W134 crosses no `check-markdown` floor.** Deleting counts removes few relative links | `check:markdown:selftest` RED on W134's tree. Then it is [Q142](../questions/q142.md)'s window again, and stop-and-ask (c) |
| **4** | **no ADR is written**: every fix is a spec sentence, a check or a file, within existing decisions | an item finding that a fix needs a rule no spec, ADR or plan holds |
| **5** | **the always-read set does not grow.** `CLAUDE.md`, `doc/workflow.md` and `doc/concept.md` are not edited | a fix whose only home is one of them |
| **6** | **every item's reader finds at least one thing**, because the fixes are small and so are easy to under-provoke | a reader with zero findings on a check change |

## Stop-and-asks

| | the question | answer |
|---|---|---|
| **(a)** | Q144: may W131 land the fix if no replacement `ran:` case can be built in `check-policies-selftest.mjs`? | *open — W131 asks before the fix if it gets there* |
| **(b)** | Q61: if the 0.5.2 measurement differs from P2's, does the sentence state the new behaviour, or does Q61 stay open and gain a new question? | **did not fire**: W133's measurement matched P2's table in Node and Deno |
| **(c)** | Q484: if W134's deletion crosses an `M3`-`M5` floor, are the floors retuned per ADR 0076 and ADR 0078, or does Q484 wait for Q142? | **did not fire**: W134 crossed no floor — `check:markdown:selftest` EXIT 0, 42/42, before and after the deletion; 199 linking documents against `M4`'s 120, 84 anchored against `M5`'s 72 |
| **(d)** | ~~Scope~~ | **ANSWERED by the maintainer, 2026-10-06: tiers A and B**, twelve questions (decision 1; *read thirteen until 2026-10-07*) |
| **(e)** | ~~Q63's direction~~ | **ANSWERED, 2026-10-06: drop the class name** (decision 2) |
| **(f)** | ~~Q508~~ | **ANSWERED, 2026-10-06: Out** |
| **(g)** | ~~Q534, raised by W133 outside its `Owns`~~ | **ANSWERED by the maintainer, 2026-10-06: into W134**, which gains `AGENTS.md` for that sentence. And for the rest of the plan: *an item that finds a small fix outside its `Owns` may stop and ask to widen its scope*, rather than only raising a question |
| **(h)** | ~~Q484: decision 3 deletes what `npm run state` or a check DERIVES, and names "workflow versions and plan counts" — which no command derives. Do they go, and does a figure neither named nor derived (`concept.md` v0.3, `S1-S9`, `9 items`)?~~ | **ANSWERED by the maintainer, 2026-10-07: option A.** The workflow-version copies go with their staleness parentheticals and the intro paragraph, since their one source is `doc/workflow.md`'s own header (P27 decision 4); the class neither named nor derived stays, and [Q542](../questions/q542.md) is raised for it and for the stale claims that are not figures. Raised by W134 |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q533](../questions/q533.md) | raised by W133: nine refusal classes still open their message with their own class name, which Q63 changed for one | no owner |
| [Q534](../questions/q534.md) | raised by W133: `AGENTS.md` states the inline-only `OR-R6` behaviour generally | W134, by stop-and-ask (g) |
| [Q536](../questions/q536.md) | raised by W131: the `ran:` guard has a checked-in case in one self-test of six | no owner |
| [Q541](../questions/q541.md) | raised by W132: `test:browser` reports any failing node baseline as *could not establish* it, and chromium alone never reports a bundle that throws on import | no owner |
| [Q542](../questions/q542.md) | raised by W134: `doc/README.md`'s stale claims that no command derives, which decision 3 does not reach (stop-and-ask (h)) | no owner |

## Out

- **Tier C**: [Q337](../questions/q337.md), [Q434](../questions/q434.md),
  [Q437](../questions/q437.md). They are concrete, but not small, and Q337 waits on Q142.
- **Every question whose `closes-when` names a decision**: [Q142](../questions/q142.md),
  [Q244](../questions/q244.md), [Q266](../questions/q266.md), [Q283](../questions/q283.md),
  [Q508](../questions/q508.md). And **the two that close in the sibling repository**,
  [Q20](../questions/q20.md) and [Q513](../questions/q513.md).
- **Q272 in the browser.** `test:browser` bundles its suites (`scripts/run-browser-tests.mjs`), so
  there a suite that fails to import is a bundle failure, not the runner's. W132 fixes the Node and
  Deno runner and states what Chromium does, measured.
- **`CLAUDE.md` and `doc/workflow.md`**, by prediction 5.

## Record

**W133 — done 2026-10-06.** The item's own Record carries the gate, the measurement, both readers and the
rule-8 passes; this section names what the PLAN needs from it.

- **Closed: Q61, Q62, Q63**, each `resolved-by` naming P30 W133 and the spec version: `OR-R6` v0.11
  (`spec/outcome-record.md`), `RN-R6` v0.13 (`spec/run-state.md`) and decision 2's message. On W133's
  tree `npm run q -- --where status=open --count` prints **21**: 22, less these three, plus the two W133
  raised (Q533, Q534). Q534 has since joined W134 (stop-and-ask (g)), so the exit artifact's figure is
  **8**, and with Q533 still open the final count reads **9** if nothing else moves.
- **Prediction 1 held on the measured half and was too narrow.** On 0.5.2 a thread pool still refuses the
  value first and a non-optional task ends `user_action`, in Node and Deno. W133's conformity reader found
  the `optional` half — the task ends `failed` — which neither P2 nor decision 2 named; the sentence now
  states both, measured.
- **Decision 2's Q62 gloss was imprecise**: *"leaves it on that branch's terminal event"*. A resolution's
  `branch.resumed` takes a path out first. The spec sentence names both events; the code did not move.
- **Prediction 4 held** (no ADR) and **prediction 5 held** (`CLAUDE.md`, `doc/workflow.md`,
  `doc/concept.md` untouched). **Prediction 6 held** for W133: both readers found blocking or should-fix
  defects. **Prediction 2** moved as allowed: L1-L5 +12 cases and L6 +30 assertions and +1 run, all W133's.
- **Overlap**: two shared subjects, the eighty-third measurement — the count a retro carries forward.
- **Six exceptions**, four declared before the first edit and two late (`spec/README.md`,
  `test/definition/l4-corpus.test.ts`); W133's Record lists them and why. A spec bump and a new suite
  each drag one of those two files, every time: the next item that does either can name them up front.

**W131 — done 2026-10-07.** Its own Record carries the gate (`gate:full` EXIT 0 on `79e844a`), the reader
and three rule-8 passes; this section names what the PLAN needs from it.

- **Closed: Q144, Q430, Q439, Q454, Q490**, each `resolved-by` naming P30 W131. **Raised: Q536** (open) — the
  `ran:` guard has a checked-in case in one self-test of six, and the gap Q144 carried for the others has
  no address now. On W131's tree `npm run q -- --where status=open --count` prints **17**: 21, less these
  five, plus Q536. Q536 is the second question an item has raised and left open, after Q533, so the exit
  artifact's **8** reads **10** on the final tree if nothing else moves.
- **Stop-and-ask (a) did not fire.** The replacement `ran:` case was built and shown firing before the fix:
  `srcPolicies`' `if (!m) return null;` disabled, named against *the POLICIES block renamed*, which throws
  before any report line. P3's `names === null` clause then gained the `META` entry Q144 said it could not
  have.
- **Stop-and-ask (g) fired twice for W131**, both answered by the maintainer with option A, comment-only
  in `scripts/check-docs.mjs`: on 2026-10-06 the paragraph above `README_SNIPPET_FLOOR`, whose residue
  sentence Q439's fix made false; on 2026-10-07 one clause in its "8 since W101" sentence, after the
  conformity reader's finding 7. Neither touched code.
- **Decision 5 held as written**: the counts were deleted, not computed; a re-added count survives every
  check (declared survivor S2), which is P27 decision 4's own position.
- **Prediction 2 held** for W131 (no case count moved: 1528 L1-L5, 2465 L6). **Prediction 4 held** (no ADR;
  ADR 0073 consequence 10 gained a dated note in the record step). **Prediction 5 held.** **Prediction 6
  held**: the reader's finding 1 was a constructed survivor green through the whole budget self-test.
- **Exceptions: one path, two widenings, none late.** Neither of W133's drag files applied: W131 added no
  suite and bumped no spec.

**W132 — done 2026-10-07.** Its own Record carries the gate (`gate:full` EXIT 0 on `c72e704`), the
measurement, the reader and two rule-8 passes; this section names what the PLAN needs from it.

- **Closed: Q272, Q382**, each `resolved-by` naming P30 W132. **Raised: Q541** (open) — `test:browser`
  reports any failing node baseline as *could not establish the Node baseline — run node test/runner.ts
  first*, wrong once the runner has run and failed. On W132's tree `npm run q -- --where status=open
  --count` prints **16**: 17, less these two, plus Q541. Q541 is the third question an item has raised and
  left open, after Q533 and Q536, so the exit artifact's **8** reads **11** on the final tree if nothing
  else moves.
- **The Out section's *Q272 in the browser*, measured** before and after W132 with a suite that throws on
  import: `npm run test:browser` stops at its node baseline either way, so chromium never starts; run on
  its own, the bundle (one module) raises a `pageerror`, no suite runs, and the result is never set. Not
  fixed, as decided; Q541 is its address.
- **Prediction 2 held**: 1528 L1-L5 cases in node, deno and chromium before and after, 2465 L6 assertions
  over 162 runs. The 17 renamed cases keep their exact text, so no census or `DECLARED_CASES` list moved.
  **Prediction 4 held** (no ADR). **Prediction 5 held.** **Prediction 6 held**: the reader's finding 1
  restored Q272's own crash through the fix — a thrown value with no string form escaped the `catch`.
- **Exceptions: none.** Neither of W133's drag files applied: no suite entered the glob and no spec was
  bumped. The provocation lives in `test/provocations/`, outside the glob, and is run by
  `node test/provocations/q272.ts` and its deno form; it is not a gate entry, since `package.json` is
  outside W132's `Owns`.

**W134 — done 2026-10-07.** Its own Record carries the gate (`gate:full` EXIT 0 on `2b48046`), the
measurement, the reader and two rule-8 passes; this section names what the PLAN needs from it.

- **Closed: Q235, Q484, Q534**, each `resolved-by` naming P30 W134. **Raised: Q542** (open) — the stale
  claims in `doc/README.md` that no command derives, which decision 3 does not reach.
- **Stop-and-ask (h) fired and was answered** (option A, the table above): decision 3's operative test
  (*what `npm run state` or a check derives*) and its own list (*workflow versions and plan counts*)
  disagreed about the workflow-version copies, which no command derives. They went; the class neither
  named nor derived stayed, and is Q542's.
- **Stop-and-ask (c) did not fire, and prediction 3 held**: 610 → 612 documents, 199 linking documents
  and 84 anchored before and after, `check:markdown:selftest` EXIT 0 at 42/42 on both trees. Stripping
  every relative link from `doc/README.md` (W134's probe r6) still crosses no floor.
- **Prediction 4 held** (no ADR). **Prediction 5 held**: `CLAUDE.md`, `doc/workflow.md` and
  `doc/concept.md` untouched by every item. **Prediction 2 held**: 1528 L1-L5 cases in all three
  runtimes, 2465 L6 assertions over 162 runs. **Prediction 6 held**: the reader's finding 2 widened the
  `AGENTS.md` sentence to what `OR-R6` v0.11 says a consumer needs (`onRunFailure` not called,
  `awaiting_action`, `inline` decides).
- **Exceptions: one, late** — row (h) of the Stop-and-asks table, which the maintainer's answer directed.
  Neither of W133's drag files applied.

### The exit artifact, measured on the final tree

*Taken after W134's record step, on the tree its last commit ships.*

| clause | measured | |
|---|---|---|
| `npm run gate:full` EXIT 0 | **0**, on `2b48046`, the last commit before W134's record step; the record step changed only four documents a check reads, and `npm run gate` and `check:markdown:selftest` were re-run after it (W134's Record) | met |
| `npm run q -- --where "resolved-by~P30" --fields id,status,resolved-by` lists the fourteen questions of decision 1, each resolved | **thirteen**, each `resolved` and naming its item: Q61, Q62, Q63 (W133); Q144, Q430, Q439, Q454, Q490 (W131); Q272, Q382 (W132); Q235, Q484, Q534 (W134) | met on the questions; **the figure fourteen was wrong** — below |
| `npm run q -- --where status=open --count` prints 8, plus any question an item raised open | **14** | accounted below |

**Decision 1 miscounts by one.** It says *thirteen questions are in* and its table lists **twelve**:
tier A is nine (Q144, Q235, Q272, Q382, Q430, Q439, Q454, Q484, Q490) and tier B three (Q61, Q62, Q63).
The W-row index agrees with the table — five, two, three and two, plus Q534 — so thirteen were closed,
which is every question the plan took. The *Why* section's *thirteen of them* carries the same error, and
so does *nine are Out*: the Out rows hold **ten** (Q337, Q434, Q437; Q20, Q513, Q142, Q244, Q266, Q283,
Q508), and 12 + 10 is the 22 open on `e61df81`.

**The open count, by id.** 14 = the ten Out questions above, still open as decided, **plus four raised
by P30's own items and left open**: Q533 (W133), Q536 (W131), Q541 (W132), Q542 (W134). The declared **8**
was 22 less fourteen, and it is wrong twice: the plan took twelve of the 22, not thirteen, and Q534 was
raised after `e61df81`, so closing it does not lower the count from 22. The arithmetic the plan meant:
22 − 12 = **10**, plus the four raised = **14**, as measured.
