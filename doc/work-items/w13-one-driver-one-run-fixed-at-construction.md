# W13 — One driver, one run, fixed at construction — and what makes an event ours

**Status:** **done** - built, both readers run, every finding acted on, gate re-run
**Plan:** [P4](../plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) — the item the plan
exists for, and the only one that breaks a published surface

```
Spec:       spec/task-id.md sections 2 and 3 — ID-R1, ID-R2, ID-R3, and one new
            inbound rule. This item CHANGES that spec, which is its own change
            with its rationale stated (spec/README.md rule 1): the rationale is
            ADR 0022 and ADR 0023, written first
Owns:       src/driver/driver.ts, test/driver/** (from W3, done — taken over by
            P4's declaration), spec/task-id.md (from W1), AGENTS.md (from W9),
            test/matrix/run.ts (from W4)
            plus five declared exceptions (doc/workflow.md section 7 rule 2):
              - examples/run-flow.ts — TWO lines, the construction site and the
                start() call. W6's file and W14's Owns; this item cannot
                typecheck without it
              - doc/decisions/0022-*.md and 0023-*.md — new files, from this
                item's own Reserves block
              - spec/README.md — the version column only. check-spec C8 REFUSES
                a document whose header and index disagree, so editing
                spec/task-id.md without this is a red gate
              - scripts/check-docs-selftest.mjs — one probe, pinned to the
                literal text `driver.start('run-1', …)` that this item deletes.
                Rule 7 (b) turned that into a red gate rather than a silent
                pass, which is the mechanism working
              - doc/open-questions.md — the rows this item's Reserves block
                allocates and the three it closes. W12 raised that section 1
                rule 5's record-step list omits this file while every
                Reserves: line obliges it; declared here for the same reason
Inputs:     Q53 and Q72, both reproduced against the code before this item was
            declared (P4, "The facts"). The SPIKE is the load-bearing input:
            run-id-at-construction applied to src/driver/driver.ts typechecks
            clean, all thirteen L6 rows pass with a two-line harness change, and
            the cost lands as 77 typecheck errors in four test files, 2 in
            examples/, and 4 of 15 AGENTS.md snippets. Also: the REPLACEMENT
            provocation for ID-R1, measured — settling the same task twice fires
            it on the successor's redispatch
Outputs:    (1) ADR 0022 — a Driver takes its run at construction; (2) ADR 0023
            — an inbound settlement is ours iff we dispatched its task id, and
            whether "not ours" is silent or observable; (3) spec/task-id.md
            v0.5, with ID-R2 and ID-R3 restated and one new inbound rule; (4)
            the driver itself; (5) a replacement direct test for ID-R1; (6)
            AGENTS.md's three Q72/Q53 apologies DELETED — sections 2, 9 and 10
Depends on: W12, which edits the same file and must land first
Blocks:     W14, which cannot build a two-driver L6 row until this is what a
            driver is
Tests:      L2 is where this is proved and it costs nothing: two drivers on one
            FAKE scheduler, both runs completing, each driver's log holding only
            its own records. Expected values come from spec/task-id.md section 2
            — a task id identifies (run, node, branch, attempt) and two outcomes
            under one key is the corruption — never from what the driver emits.
            The five inbound ids P4 measured are the coverage checklist: ours
            and dispatched; ours but never dispatched; a node not in the
            definition; a branch path never opened; another run entirely. Plus
            a malformed id, which must STILL stop the run
Gate:       L0-L5, all five runtimes for L0-L5; L6 runs and must stay green but
            is W14's gate rather than this one's. Then pass 2 — TWO readers
Reserves:   Q84-Q89, ADR 0022-0024
```

**Every line is fillable**, and the two that would have been guesses were measured first: `Inputs:`
(does the change work, and what does it cost) and `Tests:` (does `ID-R1` still have a provocation).
**`spec/task-id.md` section 3 predicted the second in writing** — *"widening `ID-R3` would take away
`ID-R1`'s only direct test, trading a tested rule for an untested one"* — so this item is declared
knowing it owes a replacement.

---

## Scope

**In**

1. **The run id moves to construction.** `DriverOptions.runId`; `start(payload)`; `hasFailed()`;
   `failedRuns` becomes a boolean. **`ID-R2`'s charset refusal moves to the constructor**, where
   `MissingJoinPolicy` already lives — a definition and a run id are both configuration, and both
   should be refused before anything is queued (ADR 0002 rule 3's argument, applied one level out).
2. **`ID-R3` is restated.** It becomes *"`start()` at most once"* rather than *"not a second,
   different run"*, because with the id fixed at construction there is no second id to name.
3. **`ID-R1` gets a replacement direct test**, because 2 takes its current one away. Measured:
   delivering the same settlement twice routes twice and refuses the successor's redispatch,
   **reported through `onRunFailure`** rather than thrown — `OR-R10`. The test asserts the reported
   form, the id in the message, and that `addTask` saw nothing.
4. **The inbound boundary.** A settlement whose task id this driver did **not dispatch** is not this
   run's: nothing is appended and nothing routes. **This is not a run-id filter** — P4 measured that
   a run-id filter closes one of four holes and this closes all four, using state the driver already
   keeps. A task id that does not **parse** still stops the run, unchanged.
5. **The one thing ADR 0023 has to decide rather than implement:** whether "not ours" is **silent**.
   It cannot throw — with two legitimate drivers on one scheduler, every foreign settlement reaches
   it and it is the normal case. Whether it is counted, reported through a new optional callback, or
   simply dropped is the decision, and *"a driver that silently ignores an event drops a real
   defect"* is the argument on the other side. **The plan does not pre-empt it.**
6. **`spec/task-id.md` v0.5**, and the section-3 passage that predicted 3 is rewritten to record
   what happened rather than deleted.
7. **`AGENTS.md`'s three apologies deleted** — §2 line 118, §9 lines 591-598 (`hasFailed(runId)`,
   *"one driver per scheduler"*, the Q53/Q72 parenthetical) and §10 lines 656 and 659-660. **Four of
   fifteen snippets stop compiling when the surface changes**, which is the gate working; they are
   rewritten to the new surface and re-executed.

**Out** — named rather than left implicit, with where it goes instead

- **The L6 row.** [W14](w14-two-runs-two-drivers-one-scheduler-at-l6.md). This item proves it at L2,
  which is where the repository's own rule says routing is proved; L6 is what proves a *fixture* was
  not lying, and it is the plan's exit artifact rather than this item's gate.
- **[Q71](../open-questions.md)** — `SchedulerLike` under the DOM lib. Adjacent, differently argued,
  and `X5` already reports it. Touching `SchedulerLike` here would put two surface decisions behind
  one ADR.
- **[Q20](../open-questions.md)** — whether a run id is global. This item will form an opinion while
  moving the id to construction and **is not entitled to record it as an answer**; it goes in the
  Record as a finding.
- **`index.ts`'s exports.** Unchanged in number. If the collapse of `hasFailed(runId)` removes a
  name, that is a surface change to report, not to extend.
- **Deprecation, or keeping the old signature alongside the new.** Nothing is published
  (`README.md`), so a breaking change costs nothing today and an overload costs forever.

## Verification

| Clause | How it is run |
|---|---|
| L0 | `npm run check:spec`, `check:source`, `check:scheduler`, **`check:docs`** — which fails until `AGENTS.md` is rewritten, and that failing is the point — `check:docs:selftest`, `npm run lint`, `npm run typecheck` (six configs), `deno publish --dry-run` |
| L1 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, five runtimes |
| **L2 — the item's real gate** | two drivers on one fake scheduler, both runs completing with disjoint logs; and the six inbound ids of the `Tests:` block, each asserted separately |
| L3 | determinism, unchanged — the fold is not touched |
| L4 | definition conformance, unchanged |
| L5 | `test/matrix/**`, unchanged in content; two call sites move |
| **rule 8** | **this item is a fix for three review findings.** Each fix is broken and the gate watched go red: delete the inbound guard (the two-driver L2 test must fail); make the guard a **run-id** filter instead (the *"a node not in the definition"* case must fail, which is the measurement that chose the design); revert `runId` to a `start` parameter (`ID-R2`'s constructor test must fail). Recorded in the Record beside each fix |
| L6 | runs, must stay green, **and is W14's gate** |
| pass 2 | two readers |

**Routing cases** (`TEMPLATE.md` asks each in turn):

| case | covered |
|---|---|
| a branch routed away from its join (Q4) | **unchanged and re-run** — `test/matrix/**` and L6's `p1-routed-away` rows. This item must not move them |
| `user_action` (Q17) | **yes, and it needs saying**: a `user_action` task fires **two** events for **one** dispatched id, so the inbound guard must admit both. `resolve()` appends outside `onEvent` and is unaffected |
| no matching decision edge (Q10) | unchanged |
| a duplicate task id (Q13) | **the centre of this item.** `ID-R1` loses its provocation and gains another; `ID-R3` is restated |
| a nested fan-out (Q6) | forbidden by `FD-V15`; unchanged |
## Record

**Status: done** — built, both readers run, every finding acted on, gate re-run.

**Gate — what ran.**

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | **RAN** — pass | Node, Deno | `check-spec` (8, including **C8**, which refused `spec/task-id.md` v0.5 against a stale `spec/README.md` before a human saw it), `check-source` (10), `check-scheduler` (5), `check-docs` (16 snippets, 12 `run`), `check-docs-selftest` (**12/12**), `deno lint`, `tsc` × 6, `deno check`, `deno publish --dry-run` |
| **X5 — the DOM lib pass** | **RAN** — reported | Node | **1 of 16**. Went to 5 of 16 while the reference was stale and back to 1 |
| L1 | **RAN** — pass | **all five** | **326 assertions** — 301 before this item, 314 at first commit, 326 after the readers |
| **L2 — the item's real gate** | **RAN** — pass | all five | two drivers on one fake scheduler; the six inbound ids; **each of the two tiers in all three terminal states**; the same-`runId` limit pinned |
| L3-L5 | **RAN** — pass | all five | unchanged in content; `test/matrix/run.ts` moved two call sites |
| **rule 8 — the provocations** | **RAN** — **18 of 18 red**, full suite | Node | table below. **The first set of 7 was incomplete and the adequacy reader proved it with 8 survivors** |
| L6 | **RAN** — pass, and it is W14's gate | Node, Deno | 219, unchanged, with a two-line `examples/run-flow.ts` change |
| **conformity reader** | **RAN** — **1 blocking, 7 defect, 7 note** | n/a | derived the six-id inbound contract from `OR-R7`/ADR 0023 **before opening the code**; that derivation found the blocking one |
| **adequacy reader** | **RAN** — **78 mutations, 8 survivors, 4 blocking** | n/a | walked the rule ids; scored against the **full** suite, as W12's Record was falsified for not doing |
| **re-run after acting on both** | **RAN** — pass | all five, both L6 runtimes | `npm run gate` exit 0 |

**Rule 8 — 18 provocations, all red.** Seven of mine, eight of the adequacy reader's survivors, plus
the conformity reader's blocking finding restored as its own probe:

| provocation | result |
|---|---|
| delete both tiers / tier 1 / tier 2 | **RED** 12 / 7 / 9 |
| **a run-id filter instead** — the mechanism [Q72](../open-questions.md) proposed | **RED** 9 |
| make tier 1 loud | **RED** 7 |
| **restore the original order — `normalizeEvent` before the ownership test (B1)** | **RED** 1, and it is the case named for it |
| **tier 2 exempt for `user_action`** / for `failed`; **tier 1 exempt for `user_action`** | **RED** 1 each — *all three survived everything before the readers* |
| **a stopped run keeps routing on the scheduler edge** | **RED** 1 — *survived 314 assertions and 219 L6 assertions before* |
| `RunFailure` always reports a sentinel | **RED** 1 |
| `started` latched only on success / `start()` reports-not-rethrows / rethrows-not-reports | **RED** 3 / 1 / 1 |
| `ID-R2` out of the constructor / drop the second-`start` refusal / `hasFailed()` always false | **RED** 3 / 3 / 12 |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| [ADR 0022](../decisions/0022-a-driver-takes-its-run-at-construction.md) | **yes** | the last three provocations |
| [ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) | **yes, and it now carries a *Correction*** — rule 1's ordering was wrong and two preconditions were unstated | the first six provocations |
| `spec/task-id.md` v0.5 | **yes** — `ID-R2`/`ID-R3` restated, **`ID-R4`** added with the ordering and both preconditions, 71 rules → **72** | `check-spec` C6 and C8 |
| the driver | **yes** | all 18 |
| **a replacement direct test for `ID-R1`** | **yes**, and the conformity reader confirmed it independently: five weakenings of `ID-R1` each die on it, and it **could not** be deleted with the gate green | `driver.test.ts`'s `ID-R1` suite |
| `AGENTS.md`'s apologies deleted | **yes**, and the reference came out **shorter** — but §9 now also states the two **preconditions** the Correction adds, which is the honest version of "a second driver is fine" | `check:docs` X3/X4 |

## What broke

**1. ADR 0023 rule 3 was false as shipped, and the rule's own ordering clause was why.**
`normalizeEvent` deep-copies `result` and raises `UncloneableResult` (`OR-R6`) — and it ran *before*
the ownership test. So **another run's settlement with an uncloneable result stopped this run**, and
the `RunFailure` named *that other run*. All three of rule 3's clauses — not a failure, not counted,
does not reach `onRunFailure` — were false at once, on precisely the `OR-R6` path L6's `uncloneable`
row exercises, on the topology the ADR exists to bless. **Ownership is now decided from the task id
alone, before anything else reads the detail**, which is also cheaper: a driver no longer clones the
result of every settlement it is about to discard.

**2. `ID-R4` was tested only against `done`, and both tiers were exemptible per state.** Three
surviving mutations, one clause each. The guard now cannot see the terminal state at all — it runs
before `normalizeEvent` — and the suite drives both tiers in all three states. **A guard the fixtures
only exercise in one state is a guard that can be conditioned on the state.**

**3. `OR-R10`'s own owed test did not exist for the edge it was written for.** The rule says *"the
failure is reported **and no further task is dispatched for that run**"*. The only test asserting
"nothing after the stop" exercises `resolve()` — the *inbound* edge, added by W5. Deleting
`if (this.failed) return` from `onEventOrThrow` left **314 assertions and 219 L6 assertions green**
while a stopped run kept dispatching. W13 rewrote the function around that line and did not notice.

**4. A test's comment claimed something unreachable — rule 8's shape at the assertion level.** The
`user_action` case said it would catch a guard keyed on a consumable "seen" set. Three seen-set
mutants killed **zero** cases there: `OR-R3` dropped the first event of the pair before the guard, so
the pair could not exercise it. Now that the guard runs earlier both events reach it, so the case is
real — and the comment says where the credit actually belongs.

**5. Two preconditions of the blessed topology were unstated, and both readers found the sharper one
independently.** Two `Driver`s on the **same** run id mint the same task ids, so `dispatched.has()`
is true in both, `ID-R4` is not violated, and one settlement produces two dispatches of the successor
with nothing reported — [Q72](../open-questions.md)'s corruption verbatim, for the one case ADR 0023
does not close. No driver can detect it. And a plain **non-flow** task on a shared scheduler does not
parse, so rule 2 stops every driver on it. Both are now stated in the ADR's Correction, in `ID-R4`,
and in `AGENTS.md` §9; the second is [Q86](../open-questions.md) and the first
[Q87](../open-questions.md).

**6. Three claims in the item's own documents were false.** `AGENTS.md:583` still said
*"`InvalidRunId` is thrown by `start()`"*, two paragraphs below the table row this item correctly
rewrote. §9's prose named `UndispatchedTask` while its executed snippet asserted a seven-name string
omitting it — **the reference contradicting itself inside one section**, which is worse than either
state alone; [Q84](../open-questions.md) is closed by adding it, and Q84's *stated reason for
deferring was itself wrong* (`AGENTS.md` is in this item's `Owns` outright). And `README.md` said
*"eight ADRs"* where there are ten, in the same commit that corrected the two lines beside it.

**7. The register's census line was wrong three times in one session, by one author, with the rule in
front of them.** Stale, then self-contradictory, then off by one — each time by chaining a derivation
instead of stating a predicate. It now states one: *a question is resolved when its status cell says
so*. **This is a four-plan observation that has never been made a rule, and this is its worst
occurrence.** For P4's retro.

## What this taught

- **The two readers found the same defect from opposite ends and neither would have found both.** The
  conformity reader derived the six-id contract from the ADR and found rule 3 violated by an
  ordering it had not thought to check; the adequacy reader mutated the guard state-by-state and
  found the same region unguarded from the test side. **24 findings between them, 4 clean overlaps —
  ~17%**, against W12's 3 in 18 (also 17%), W9's 3 in ~30, W5's 3 in ~35, W4's 1 in 13. W12's Record
  hypothesised that the *fraction* rises as items shrink; **W13 is a large item at the same 17%, so
  that hypothesis did not survive its first test.** What is stable is the absolute count: 1-4.
- **A provocation set written by the author is shaped by the fix.** Mine were seven ways to *remove*
  the guard; the reader's eight survivors were ways to *narrow* it. This is the second item in a row
  where that was the finding, which is what `doc/workflow.md` section 6 pass 3 rule 2 asks for.
- **`ID-R1`'s substitution held up.** The one claim this item was declared knowing it owed, and the
  conformity reader confirmed it independently under mutation: five weakenings each die on the
  replacement, and it could not be deleted with the gate green. **A rule may take another rule's test
  away; it may not do it silently** — and the spec now carries that sentence.
- **A blessed topology needs its preconditions written down at the same time.** ADR 0023 said "a
  second driver is now safe" and meant "with a distinct run id, on a scheduler carrying only flow
  tasks". The unqualified sentence is the same failure ADR 0022's own Context argues against: *a
  surface that says more than the rule is read as the surface.*

## Questions raised

**Q84-Q87** from this item's block. Q88-Q89 unused.

| Q | | raised by |
|---|---|---|
| ~~Q84~~ | `AGENTS.md` §9 did not name `UndispatchedTask` — **resolved**, added after both readers found the section contradicting itself | W13, then its conformity reader |
| Q85 | [Q20](../open-questions.md) is now a design question: a `Driver` is a per-run object and rule 3 ignores other runs, both of which assume a run id means the same thing everywhere | W13 |
| Q86 | **Should an unparseable task id be treated as "not ours" rather than as a defect?** A driver mints only parseable ids, so an unparseable one cannot be ours — but refusing it stops every driver on a scheduler that also carries non-flow tasks | W13's conformity reader |
| Q87 | **Nothing enforces run-id uniqueness across drivers on one scheduler**, and `ID-R4` cannot see the violation | both readers, independently |

## What is still open in this item, deliberately

- **`AGENTS.md` §12's cast for [Q71](../open-questions.md)** — the third of P3's three absorbed
  defects, out of scope by declaration and argued on both sides.
- **The L6 row is [W14](w14-two-runs-two-drivers-one-scheduler-at-l6.md)'s**, and the adequacy reader
  measured what that means: **L6 gives `ID-R4` zero coverage today** — single driver, single run, no
  foreign settlements. It is red for "the guard drops everything", so it is not vacuous, and green
  for every narrower mutation. W14 carries all of it.
