# W13 — One driver, one run, fixed at construction — and what makes an event ours

**Status:** **in review** - built, gate green, both readers owed
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

**Status: built, gate green, both readers owed.**

**Gate — what ran.**

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | **RAN** — pass | Node, Deno | `check-spec` (8, including **C8**, which is what caught `spec/README.md`'s version column before a human did), `check-source` (10), `check-scheduler` (5), `check-docs` (16 snippets, 12 `run`), `check-docs-selftest` (**12/12**), `deno lint`, `tsc` × 6 configs, `deno check`, `deno publish --dry-run` |
| **X5 — the DOM lib pass** | **RAN** — reported | Node | **1 of 16**, `AGENTS.md:751`. Went to **5 of 16** mid-item while the reference was stale and back to 1; [Q71](../open-questions.md) is unchanged |
| L1 | **RAN** — pass | **all five** | **314 assertions, was 301.** `test/driver/lifetime.test.ts` is **13 assertions in 4 suites** |
| **L2 — the item's real gate** | **RAN** — pass | all five | two drivers on one fake scheduler, both runs `completed`, disjoint logs and disjoint dispatch sets; the six inbound ids, each asserted separately |
| L3-L5 | **RAN** — pass | all five | determinism, definition conformance and the matrix all unchanged in content; `test/matrix/run.ts` moved two call sites |
| **rule 8 — the provocations** | **RAN** — **7 of 7 red**, against the **full** suite | Node | table below |
| L6 | **RAN** — pass, and it is W14's gate | Node, Deno | 219 assertions, unchanged, with a **two-line** change to `examples/run-flow.ts` — exactly what the spike predicted |
| conformity reader | **NOT RUN** | | owed |
| adequacy reader | **NOT RUN** | | owed |
| re-run at `<sha>` | **NOT RUN** | | owed |

**Rule 8 — each fix broken, and the gate watched go red.** Run against the **whole** suite, because
W12's Record was falsified for measuring against one file:

| provocation | result |
|---|---|
| ADR 0023 r1 — delete the inbound guard entirely | **RED**, 3 cases, including both two-driver cases |
| ADR 0023 r4 — delete only tier 2 (our run id, undispatched) | **RED**, 5 cases |
| **ADR 0023 — use a RUN-ID FILTER instead**, the mechanism [Q72](../open-questions.md) proposed | **RED, 5 cases — and they are exactly the three holes the measurement rejected it for**: a node never dispatched, a node not in the definition, a branch path never opened |
| ADR 0023 r3 — make tier 1 loud instead of silent | **RED**, 3 cases |
| ADR 0022 r3 — move `ID-R2` out of the constructor back into `start()` | **RED**, 3 cases |
| ADR 0022 r4 — drop the second-`start` refusal | **RED**, 2 cases |
| ADR 0022 r5 — `hasFailed()` always false | **RED**, 9 cases |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| [ADR 0022](../decisions/0022-a-driver-takes-its-run-at-construction.md) | **yes** | provocations 5-7 |
| [ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) | **yes**, and it decided the thing the plan refused to pre-empt: **tier 1 is silent, tier 2 is loud** | provocations 1-4 |
| `spec/task-id.md` v0.5 | **yes** — `ID-R2` and `ID-R3` restated, **`ID-R4`** added, 71 rules → **72** | `check-spec` C6 (every rule names a test owner) and C8 (the index matches the header) |
| the driver | **yes** — `runId` at construction, `start(payload)`, `hasFailed()`, `failed` a boolean, the two-tier guard | all seven provocations |
| **a replacement direct test for `ID-R1`** | **yes**, and it is the output this item was declared knowing it owed | `driver.test.ts`'s `ID-R1` suite. Deleting `ID-R1`'s refusal now fails there rather than nowhere |
| `AGENTS.md`'s three apologies deleted | **yes** — §2's *"one driver per scheduler"*, §9's Q53/Q72 parenthetical, §10's bullet. **The reference is shorter and the gate is green** | `check:docs` X3/X4: five snippets stopped compiling when the surface changed, which is the mechanism working |

## What broke

**1. Nothing behavioural, and the spike said so in advance.** L6's thirteen rows passed at every
stage, including with the inbound guard applied **before** any surface change — which is the
measurement that made ADR 0022 and ADR 0023 separable rather than one decision. The whole cost was
call sites: **82 typecheck errors** across five test files and `examples/`, plus five `AGENTS.md`
snippets.

**2. `spec/task-id.md` predicted the one real casualty in writing, and it came due.** v0.4 kept
`ID-R3` narrow *"because widening it would take away `ID-R1`'s only direct test — trading a tested
rule for an untested one"*. ADR 0022 widens it. **The replacement was measured before the ADR was
written**, and it is a better test: the same settlement delivered twice refuses the *successor's*
redispatch, **reported** through `onRunFailure` rather than thrown — the form `OR-R10` actually
describes, on a path a real scheduler could reach rather than one only a caller could.
*A rule may take another rule's test away. It may not do it silently*, and section 3 of the spec now
carries that sentence for the next occasion.

**3. Two checks caught drift before a human did, and both were written for other reasons.**
`check-spec` **C8** refused `spec/task-id.md` v0.5 against a `spec/README.md` still saying v0.4 —
which is why `spec/README.md` is a declared exception rather than a miss. And
`check-docs-selftest`'s probe 11 **failed with *"the mutation matched nothing"***, because it is
pinned to the literal text `driver.start('run-1', …)` that this item deleted. **That is rule 7 (b)
firing on a real API change** — the requirement P3's retro adopted so a rotted probe becomes a red
gate instead of a silent pass. First occurrence in the wild.

**4. `AGENTS.md` came out shorter, which is the answer to a question P3's retro asked.** P3 found the
reference had *absorbed* three `src/` defects and asked whether removing them would need different
words or none. **None**: §2's fourth bite became three, §9's paragraph lost its parenthetical, §10's
bullet lost half of itself, and every claim that replaced them is executed by a snippet or is a
statement of the new rule. One of the three absorbed defects — [Q71](../open-questions.md)'s cast in
§12 — is untouched and still there, which is the honest remainder.

**5. `index.ts` gained a name.** `UndispatchedTask`. The declaration said *"unchanged in number. If
the collapse of `hasFailed(runId)` removes a name, that is a surface change to report"* — it removes
none, and adds one. Reported here rather than smoothed over: the reference's §9 error-class snippet
does **not** yet name it, which is a gap a reader may reasonably call.

## What this taught

- **The spike was the item.** Everything decided here — that a run-id filter is the wrong check, that
  the two ADRs are separable, that the cost is call sites and not behaviour, that `ID-R1` keeps a
  test — was measured before a line of `src/` changed. **Five consecutive plans have now settled
  their load-bearing fact before declaring**, and P2's retro said it would flip that habit into a
  rule only if an item skipped it and paid. Still no rule, and the habit is still unbroken.
- **A two-tier guard where a filter was proposed.** [Q72](../open-questions.md) proposed filtering by
  run id; the register is read as authoritative and is checked by nothing, and this is the third
  consecutive plan to find one of its rows wrong **by trying to act on it**. Here the row was not
  false — it was *narrower than the defect*, which is a new shape of the same problem.
- **Silence is a decision and it has a stated cost.** ADR 0023 rule 3 makes a driver silent about
  settlements it drops, so a caller who starts `run-l` meaning `run-1` sees a run that never
  progresses and hears nothing. That is worse than today's diagnostic, and it is accepted because the
  alternative is noise on the topology the ADR exists to support. **It is written into the ADR's
  Consequences rather than discovered later**, which is what "be honest about the cost" is for.

## Questions raised

**Q84-Q85** from this item's block. Q86-Q89 unused so far.

| Q | | raised by |
|---|---|---|
| Q84 | **Should `AGENTS.md` §9 name `UndispatchedTask` among the refusal classes it lists?** Its `run` snippet imports the seven and asserts their names; the eighth exists and is not there. Trivial to add and it is a **surface** claim, so it is raised rather than done inside an item whose scope is the driver | W13, writing §9 |
| Q85 | **[Q20](../open-questions.md) is now a live design question rather than a note.** Moving the run id to construction makes a `Driver` a per-run object, which is the shape durability ([Q15](../open-questions.md)) would need — and ADR 0023 rule 3 has a driver *ignoring* other runs, which is only correct if a run id means the same thing everywhere. This item formed an opinion and its declaration says it is not entitled to record one | W13 |

## What is still open in this item, deliberately

- **Both readers are owed.** This is the largest surface change the repository has made and it has
  had one author.
- **`AGENTS.md` §12's cast for [Q71](../open-questions.md) is untouched**, and is the third of the
  three apologies P3's retro named. It is a different question with a recorded argument on both
  sides, and it was out of scope by declaration.
- **The L6 row is [W14](w14-two-runs-two-drivers-one-scheduler-at-l6.md)'s.** Two drivers on one
  scheduler is proved here against a **fake**, and this repository's own record is that
  fixtures-versus-reality is exactly where it has been wrong.
