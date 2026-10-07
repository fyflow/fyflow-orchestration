# P30 — Which open questions close by a fix their own `closes-when` already names?

**Status:** complete and retro'd 2026-10-07 — declared 2026-10-06 on `e61df81`; W133 done 2026-10-06, W131, W132 and W134 done 2026-10-07 (Record below); proposal A adopted by the maintainer the same day as `doc/workflow.md` v0.29 (Retro below)
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

## Retro

*Pass 3 ran on 2026-10-07 over `5108345`, with the working tree clean before it. Scratch
`dev-dist/p30r-1122/` (the retro shell's pid). **PROPOSAL A ADOPTED by the maintainer, 2026-10-07, as `doc/workflow.md`
v0.29** — section 10. Sections 1-9 are the proposal as it went up, unedited but for section 7's
heading. Ids in this Retro are bare text, as in the Record.*

### 1. What is in `gate:full`, measured from the four confirming gates

The maintainer asked for this subject by name: *the 50 min full gate … is not performance, is what is
in that run*. Every figure below is read from the four `full.log`s (`dev-dist/w133-59497/`,
`w131-61120/`, `w132-63479/`, `w134-64418/`), each `gate:full` EXIT 0, run once per item on a still
tree.

**The wall per item**, from `tree-before-full.txt`'s write to `full.log`'s last write:

| item | `gate:full` wall | of which `selftests` | so the ladder (`gate`) |
|---|---|---|---|
| W133 | 2451 s (40 m 51 s) | 2312.9 s | ~138 s |
| W131 | 2461 s (41 m 01 s) | 2323.0 s | ~138 s |
| W132 | 2467 s (41 m 07 s) | 2328.8 s | ~138 s |
| W134 | 2495 s (41 m 35 s) | 2358.3 s | ~137 s |

**The self-test half is 94% of every confirming gate.** Each item then re-ran `gate` (~140 s) and
`check:markdown:selftest` alone after its record step, which is how 41 minutes reads as 50.

**Per lane**, as the runner prints it (`=== <entry> — ok, N s`). Ten lanes run at once and
`check:scheduler:selftest` runs alone first:

| lane | W133 | W131 | W132 | W134 | what it proves can fail | reads |
|---|---|---|---|---|---|---|
| `check:register:selftest` | **2299.4** | **2309.0** | **2315.5** | **2344.9** | `R1`-`R9` over the register's front matter, ADR pairing, `state.mjs`: 260 probes, 192 META, 22 SELF, 4 grader controls, 6 state gradings — **each probe stages a whole copy of `doc/questions/` and `doc/decisions/`** | `doc/questions/**`, `doc/decisions/**`, plan and item NAMES |
| `check:docs:selftest` | 815.1 | 813.3 | 810.9 | 807.3 | `X2`-`X10`: every `AGENTS.md` snippet typechecked and run, the cost figures, the README floor | `AGENTS.md`, `README.md`, `examples/`, `spec/flow-definition.md` |
| `check:source:selftest` | 782.7 | 784.8 | 783.5 | 784.3 | `RT-R4`/`RT-R5`, `S7`'s bare specifier, `S11`-`S13`'s chain | `src/`, `index.ts`, `test/`, `examples/`, `package.json` |
| `check:markdown:selftest` | 639.6 | 644.0 | 639.6 | 637.6 | links and anchors, `M3`-`M6` floors | every tracked `.md` |
| `check:wiring:selftest` | 616.4 | 613.1 | 614.0 | 615.0 | a `:selftest` entry runs a self-test; the runner's accounting | `scripts/`, `package.json` |
| `lookup:selftest` | 602.7 | 601.5 | 595.9 | 596.3 | the lookup's 82 cases; AGREE with the check's reader over ~449 tree files | `doc/**` |
| `check:spec:selftest` | 157.3 | 159.5 | 160.3 | 156.8 | `C1`-`C8` | `spec/**` |
| `check:budget:selftest` | 88.9 | 97.3 | 95.3 | 93.9 | `B1`-`B7` | `CLAUDE.md`, `doc/workflow.md`, `doc/concept.md` |
| `check:workers:selftest` | 48.9 | 47.9 | 49.9 | 48.9 | `K1`-`K4`: a worker run on its example | `examples/workers/`, `examples/registry.json` |
| `check:policies:selftest` | 37.0 | 41.0 | 41.1 | 41.4 | `JP-R9` both ways | `spec/join-policy.md`, `src/fold/policies.ts` |
| `check:scheduler:selftest` (alone) | 13.4 | 13.9 | 13.2 | 13.2 | `D1`-`D3`: the pin, both runtimes | `package.json`, `node_modules/`, the import map |
| **wall / serial-equivalent** | 2312.9 / 6101.5 | 2323.0 / 6125.5 | 2328.8 / 6119.1 | 2358.3 / 6139.6 | | |

**One lane IS the wall.** `check:register:selftest` is within 15 s of the whole `selftests` wall in
all four runs and **2.9x the next lane**. The other nine concurrent lanes finish inside its shadow.
*This is ADR 0070 consequence 3's finding again, one lane over: then `check:docs:selftest` was 98%
of the wall, W104 halved it, and the register lane has since grown past it* — W127 measured it
1828 s alone.

**Measured without it**, on `5108345` with nothing else moving, through the runner's own
`CHECK_SELFTESTS_PKG` override pointed at a copy of `package.json` with that one entry removed
(`dev-dist/p30r-1122/selftests-no-register.log`): `selftests` EXIT 0, 10/10 ok, **777.2 s wall** (3604.9 s serial-equivalent, 9 lanes), from 13:40:05 to 13:53:02. The wall is now `check:docs:selftest`'s 763.3 s, within 14 s, so **the next binding lane is docs, as ADR 0070 consequence 3 left it**. Every other lane ran 4-10% faster with one fewer competitor. With the ladder's ~138 s, a `gate:full` without the register lane is **about 915 s, 15 minutes, against 41**.

### 2. The yield, by lane

**P30's four `gate:full` runs: 44 lane runs, ZERO red.** No self-test went red inside a confirming
gate, and none went red in any standalone run either: W131's three owned lanes (its own deliverable,
section 5 rule 7), W133's, W132's and W134's `check:markdown:selftest`, all EXIT 0. **No defect in
P30 was caught by a self-test.** Section 4 below names who caught each one: the ladder three times
(`check:spec` `C8`, the L1 census, `check:register` `R8`, all in `gate`), the rule-8 harnesses, and
the readers.

**Which lanes read a file each item changed** (each lane also reads its own two scripts):

| item | files changed (with the record step) | lanes reading one | lanes reading none |
|---|---|---|---|
| W133 | `spec/` ×3, `src/` ×1, `test/` ×3, `examples/` ×5, `doc/` ×7 | register, markdown, lookup, spec, source, docs, workers, scheduler (8) | budget, policies, wiring |
| W131 | `scripts/` ×7, `doc/` ×9 | register, markdown, lookup, policies, docs, budget, scheduler, wiring (8) | spec, source, workers |
| W132 | `test/` ×4, `doc/` ×5 | register, markdown, lookup, source (4) | the other seven |
| W134 | `.gitignore`, `AGENTS.md`, `doc/` ×7 | register, markdown, lookup, docs (4) | the other seven |

**Every item reaches `register`, `markdown` and `lookup` through its record step alone**, because the
record step writes `doc/questions/**` and a plan. So v0.28's alternative — *run alone every self-test
whose check reads a file in its `Owns`* — runs the 2300 s lane for every item in P30, and decision 6
said so before the plan began.

**Across the plans since v0.26 made `gate:full` the confirming gate**, every red self-test lane the
retros record, other than an item's own new or edited lane (rule 7 at birth):

| plan | lane | caused by | found |
|---|---|---|---|
| P26 | `check:docs:selftest` | W109 editing `check-docs.mjs` | W110's `gate:full`, two items late |
| P26 | `check:wiring:selftest` | W108's scratch left in `dev-dist/` | W110's `gate:full` |
| P27 | `check:markdown:selftest` ×4 | W114 (`M6`), W115 ×2, the retro: `.md` edits | the item's own `gate:full` |
| P28 | `check:markdown:selftest` | W116's declaration documents | `gate:full` |
| P28 | `check:wiring:selftest` | W119's new `:selftest` entry | W119's `gate:full` |
| P29 | `check:register:selftest` ×2 | W121 (META `MAX_CORPUS = 0` against an iceboxed corpus), W123 (`state.mjs`'s `open >= 200`): register CONTENT | W127's `gate:full`, **the plan's last item**, after six items that ran none |
| P30 | — | — | — |

**`check:register:selftest`'s whole cross-item yield is P29's two**, both in a triage plan that
rewrote hundreds of question files on purpose, and **both were found at the plan's last item, not at
the item that caused them**. W127 then moved every probe onto synthetic fixtures above Q8000 and
measured META inertness on a planted base, which narrows the coupling to the real register without
removing it. P30 is the only plan since: thirteen resolutions and five raises, four runs, 0 red,
**about 2.6 hours of lane time**. *The markdown, docs and wiring lanes have earned their place in an
item's gate at least once each; the register lane has not earned it at item scope.*

### 3. The proposal the maintainer asked for: what leaves the item's confirming gate

Section 6 pass 3 rule 4: each states what it replaces, what it costs, and what it would no longer
catch, measured from section 2. **Ranked.**

**A. Recommended. `check:register:selftest` leaves the ITEM's confirming gate and runs once at the
plan's JOIN.**

- **Replaces** section 4's v0.26 clause for an item that does not edit the register's machinery: its
  confirming gate becomes `gate:full` without that one lane. An item that edits
  `scripts/check-register*.mjs`, `scripts/state.mjs`, or the register's declared front-matter subset
  (`doc/questions/README.md`) still runs it. **The plan's last item runs the whole `gate:full`**, and
  its Record says that run is the join's. Nothing is deleted and no bound moves, so ADR 0070 rule 4
  holds: every lane still runs once per plan, and in CI when it is dispatched.
- **Saves** about 1550 s, 26 minutes, per item: `gate:full` about 15 minutes against 41 minutes, measured above. Over P30's
  four items that is about 87 minutes (three at 15 and the join at 41) against 164 minutes.
- **Costs** a way to run the self-tests minus one lane that the gate's checks can see. Today the only
  way is the runner's test override, which `G4` and `G5` exist to keep out of the shipped path. So it
  needs either a manifest entry (`gate:item`) with a runner option that `check-wiring` binds, or the
  lane split into its own entry outside `selftests` with `gate:full` naming both. **Either is a work
  item with its own provocations, not a retro edit.** About 200 bytes of `doc/workflow.md`, which has
  567 of headroom, by REPLACING the v0.26 and v0.28 paragraphs; and `CLAUDE.md`'s *an ITEM'S
  CONFIRMING GATE* line.
- **Would no longer catch, at item scope**: a register edit that turns one of 192 META mutants
  non-inert, or a `state.mjs` floor crossed by a count. **Measured: two firings in the sixteen items
  since the lane was born at W116 (P28's five, P29's seven, P30's four), not counting the items that
  built or edited the lane itself, which would still run it; both in P29, both found at the plan's last item anyway; 0 in P30's four.**
  Under A each would be found at the join, as both actually were. `check:register` itself stays in
  `gate`, so a malformed question is still caught at the item, as W131's `R8` was.

**B. v0.28 promoted from the alternative to the rule: each item runs only the lanes reading a file it
changed, with A's exception for the register lane.**

- **Replaces** v0.26 outright.
- **Saves** almost nothing over A, measured: every item in section 2 reaches `markdown` (640 s) and
  `lookup` (600 s) through its record step, and half reach `docs` or `source` (~800 s), so B's wall
  is bounded below by the same lanes that bound A's. Its best case in P30 (W132, W134) is perhaps
  five minutes under A.
- **Costs** a hand-kept mapping from file to lane, judged per item. **That is P29's failure exactly**:
  a waiver argued item by item, which held a lane red for six items. And P26's wiring red came from a
  file no item changed (scratch in `dev-dist/`), which a by-file mapping cannot see.
- **Would no longer catch** that class, at any scope until the join. **Not recommended.**

**C. `gate:full` leaves the item altogether and runs at the plan's join; an item's gate is `gate`
plus its own lanes.**

- **Replaces** v0.26 and v0.28 both.
- **Saves** the most: an item's gate becomes ~140 s.
- **Would no longer catch**, at item scope, every row of section 2's table but P29's: **eight firings
  over P26-P28, each found in the item that caused it or the next**. Under C each is found at the
  join, with every item since as a suspect. **That is the state v0.26 was adopted to end** (P26:
  W108's and W109's reds found at W110). Re-raising it needs the ground to have changed, and section
  2 shows the markdown, docs and wiring lanes still firing on ordinary `.md` and script edits.
  **Not recommended.**

**D. No change.** v0.26 as written, ~41 minutes per item. Listed because rule 1 says it is always a
legitimate verdict; the maintainer's question rules it out as the only answer.

*Neither ledger row the brief names is re-raised.* *A ladder LEVEL for the evidence* (4 times,
P11-P14) and *a LEVEL for the gate itself* (P10-P11) proposed new rungs. A, B and C add no rung; they
move ONE lane, or all of them, between the item and the plan's join, which ADR 0070 already placed
outside the ladder.

### 4. Name the rung (rule 5)

**Thirty-eight defects across the four Records**, counting each *What broke* entry and each reader's
BLOCKING and should-fix findings once (a *What broke* entry that restates a finding is the finding;
notes are not counted). By who caught them:

| caught by | count | the defects |
|---|---|---|
| **a rung in `gate`** | 3 | W133's two late exceptions (`check:spec` `C8`, L0; the L1 census); W131's record-step `R8` (`check:register`, L0) |
| **a self-test lane** | **0** | — |
| **the rule-8 harness** (the item's own provocations) | 6 | W131's `ran:` replacement passing for a reason it did not name (p8); the grader's own declarations in all four items, W133 twice (section 5 below) |
| **the conformity reader** | 20 | should-fix: W133 5, W131 8, W132 3, W134 4 — the sharpest each item's prediction 6 names: W133's optional half of `OR-R6`, W131's constructed survivor through the whole budget self-test, W132's `catch` that could crash, W134's sentence true and incomplete |
| **the adequacy reader** (W133 only) | 5 | two BLOCKING (a second `outcome` record surviving L6; a `branch.resumed` emptying other instances surviving L2), three should-fix |
| **the author, before any rung** | 3 | W133's output (2) unbuildable as declared (Scope 1's measurement); W131's heredoc scripts (aborted before the tree); W134's cut matching its own quoted heading (seen in the diff) |
| **the exit artifact, measured at the join** | 1 | decision 1's miscount (section 5) |

**The readers remain the mechanism, for the fifth plan running** (P26-P30); the ladder is what keeps
the product from regressing. **And every defect a rung COULD have caught, the rung in `gate` did.**
*No defect has NO rung that should have caught it and did not*: the readers' findings are spec
scope, consumer prose and constructed inputs, which section 4's closing note already says no command
covers.

### 5. Rules followed, and the candidates

**(a) Every item's rule-8 grader mis-declared probes. FOLLOWED, and it WORKED. No change.** W133
pass 1 ten and pass 2 nine, W131 one, W132 one, W134 three: **24 gradings against declaration, every
one the DECLARATION's error and the probe right**, every one caught by the harness's exact-set match
(section 5 rule 7 (c)) and re-run in a 1b or 2b pass. This is four items, which meets rule 2's bar,
but nothing failed: the requirement exists because a declaration is a claim, and it caught the claim
every time. The cost is one short re-run pass per item. *What would make it a finding is a
re-declaration that hid a survivor*, and every Record says the re-declared set was read from the
output and why, which is the guard. **Noted.**

**(b) W133's two late "drag" files. One occurrence, and W133's Record already names both for the
next item. No change.** A spec version bump drags `spec/README.md`'s version column (`C8`) and a new
suite drags the L1 census. W131, W132 and W134 did neither. **The ledger row *an `Owns`
pre-declaration rule / `check-owns.mjs`* returns *on a miscount with the list correct*, and this is
that shape**: the record-step list was right. It is refused anyway, on a ground the row does not yet
state: **both files were found by a rung in `gate` before their first edit, so a diff-against-`Owns`
check would have reported nothing the gate had not.** Appended to the row (section 7).

**(c) Decision 1 miscounted, and the amendment compounded it. BROKEN, not followed.** Decision 1 wrote
*thirteen* beside a table of twelve; W133's record step amended the exit artifact to *fourteen* and
**8** from that figure; W134 found it by measuring the exit artifact, and the maintainer corrected
both. **The rule that would have prevented it exists**: P27 decision 4, *a count a script can derive
is not written down* — the table is the list, and the count of it is a second copy. **It is the third
plan running whose own text contradicted itself, found only at the join** (P28's exit artifact
against its decision, P29's candidate (f), this). The only mechanical observer is a check over a
plan's prose: **a check over `doc/` is REFUSED a 29th time**, on the row's standing ground. The
exit artifact did its job, which is the point of measuring it.

**(d) Stop-and-ask (g) — *an item that finds a small fix outside its `Owns` may stop and ask to widen
its scope*. FOLLOWED, and it WORKED. No change.** Three widenings across two items (Q534 into W134;
W131's two comment-only edits to `check-docs.mjs`), each asked and answered before its first edit, and
none late; plus (h) at W134 and the maintainer's correction of decision 1, five mid-plan answers in
all. It is a plan-level device, and a plan that wants it declares it, as P30 did on 2026-10-06.
Making it a workflow default would answer a question P30 did not ask. **Noted for P31's
declaration.**

**(e) The record step's re-runs.** W131, W132 and W134 each re-ran `gate` and
`check:markdown:selftest` after the record step and did not re-run `check:register:selftest`, citing
`gate:full` on the commit before. Each said so (section 1 rule 4). The record step writes exactly the
files that lane reads. *That is A's argument stated by three items, without a rule behind it.*

### 6. The overlap

**W133's two readers shared 2 subjects** (`OR-R6` v0.11's thread-pool clauses; `RN-R6` v0.13's
sentence and its test cell), with briefs written apart. **The eighty-third measurement, inside the
0-4 band.** W131, W132 and W134 ran one reader each, as decision 8 declared, so they took none. **The
ordinal is now EIGHTY-THREE and the next measurement is the EIGHTY-FOURTH.** The band's *fifty-nine*
stays, as P29's retro kept it.

### 7. Refusals, and the `doc/workflow.md` edits

**Held until the maintainer answered, then made in v0.29** (section 10):

| edit | where |
|---|---|
| the ledger's first row: *28 times, P2-P29* → *29 times, P2-P30* | refusal ledger |
| the `Owns` row: *13 times, P2-P26* → *14 times, P2-P30*, and its ground gains *a late file a rung in `gate` found before its edit is not a miscount a script would add to* | refusal ledger |
| the Status line: *TWENTY-NINE times, by P1 through P29* → THIRTY, P30 | header |
| section 6: *eighty-two, so the next is the EIGHTY-THIRD* → *eighty-three … EIGHTY-FOURTH* | section 6 |
| whichever of section 3's proposals the maintainer answers, with its version line | sections 4 and 8, the version index |

### 8. Ids

**Issued: W131-W134; Q533, Q534, Q536, Q541 and Q542.** No ADR (prediction 4). **W135 CLOSED
unissued, W136 CLOSED unissued, W137 CLOSED unissued, W138 CLOSED unissued; Q535 SPENT; Q537-Q540
SPENT; Q543-Q547 SPENT; ADR 0085-0086 SKIPPED.** None exists in the tree. **The next plan starts at
W139, Q548 and ADR 0087**, and P31 is the next plan. *`npm run state` printed the tree and the ledger
disagreeing before this section (W135 / Q543 / ADR 0085 against W131 / Q533 / ADR 0085), because
P29's sentence was the last; section 3 of `doc/workflow.md` (reserved and never issued is skipped,
never reissued) and P29's own precedent with W128-W130 and ADR 0083-0084 decide it.*

### 9. What the retro changed and ran

| file | why |
|---|---|
| this plan | the Status line and this Retro |

Ran, each redirected with `$?` read in the same command: `npm run state` (before and after),
`check:budget`, the self-tests without the register lane (section 1). Only this plan file changed after them, so `check:markdown`, `check:register` and `npm run gate` were re-run on the final tree; `gate:full` was not, since nothing a self-test reads moved but this file, which `check:markdown:selftest` was also re-run over.

### 10. The maintainer's answer, 2026-10-07: proposal A

**A, and not B, C or D.** `check:register:selftest` runs once per PLAN, not per item. An item's
confirming gate is `gate:full` less that lane; an item that edits `scripts/check-register*.mjs`,
`scripts/state.mjs` or `doc/questions/README.md` still runs it; the plan's LAST item runs the whole
`gate:full`. Written into `doc/workflow.md` section 4 as **v0.29**, replacing the v0.26 and v0.28
paragraphs, with section 7's edits, in `7ebd377`. `check:budget` EXIT 0 after it, with 649 bytes of
headroom against 567 before: the replacement is shorter than what it replaced.

**The rule is NOT in force yet.** Section 3's cost stands: nothing today runs the self-tests less one
lane in a form the gate's checks can see. **The mechanism is a work item — the first of the next
plan, or an item outside any plan if the maintainer prefers — and v0.29 says that until it lands an
item runs `gate:full`.** It owns:

| file | the change |
|---|---|
| `package.json` | a `gate:item` entry: `gate`, then the self-tests less the register lane |
| `scripts/run-selftests.mjs` | the option that leaves one entry out, printed by `--plan` and accounted for both ways, provoked at birth (section 5 rule 7) |
| `scripts/check-wiring.mjs` and its self-test | if `G4`/`G5` bind the manifest: `gate:item` runs the runner, and the set left out is exactly the register lane |
| `CLAUDE.md` | its *an ITEM'S CONFIRMING GATE* line, which names `gate:full` |
| `doc/workflow.md` | v0.29's *In force when the `gate:item` mechanism lands; until then an item runs `gate:full`*, deleted |

**`CLAUDE.md` and `package.json` are not edited by this retro**, so neither says something false
before the mechanism exists: today `gate:full` IS an item's gate, as both say. ADR 0070 is not
amended: its rule 4 (nothing deleted, every lane still runs) holds, once per plan. **The ids stand**
as section 8 states them.

Ran after the answer, each redirected with `$?` read in the same command: `check:budget`,
`check:markdown` and `npm run gate`, all EXIT 0 (`dev-dist/p30r-1122/`).
