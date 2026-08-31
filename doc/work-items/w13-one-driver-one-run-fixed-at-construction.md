# W13 — One driver, one run, fixed at construction — and what makes an event ours

**Status:** todo
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
            plus one declared exception: examples/run-flow.ts — TWO lines, the
            construction site and the start() call. It is W6's file and W14's
            Owns, and this item cannot typecheck without it
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

*Filled in when the item is done.*
