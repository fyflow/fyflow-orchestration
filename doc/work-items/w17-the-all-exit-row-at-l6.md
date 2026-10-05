# W17 — The row L6 has never had: every branch exits, on real workers

**Status:** done - gated in both L6 runtimes, **both readers run and every finding acted on**
**Plan:** [P5](../plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) — its exit
artifact, and **unconditional**: the `all-exit` row is a gap whatever ADR 0025 decides, because it is
the row [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
records as `live-token`'s cost and it has never run on a real scheduler under either policy.

```
Spec:       spec/run-state.md section 3 (the precedence, and what `completed`
            and `stuck` each require) and RN-R10/RN-R11. spec/join-policy.md
            section 2's `branch.exited` — defined on what the branch REACHED,
            not on where it went — and section 4's seam contract, including
            what the driver does on `unsatisfiable`. spec/flow-definition.md
            section 3 (an edge opts in per terminal state) and FD-V14, whose
            ABSENCE is what keeps an all-exit flow authorable. This item writes
            no spec and changes none: if a real scheduler behaves differently
            from the matrix's fake, that is a finding about the fake and it
            belongs in the Record — W14's disposition, verbatim
Owns:       examples/**  — inherited from W14, which is done, the same way W14
            inherited it from W6 and W6 from W5. P5's takeover table is the
            declaration
            plus one declared exception (doc/workflow.md section 7 rule 2):
              - none, IF W16 took examples/l6.ts:76's policyId union as its
                own declared exception. If W16 shipped nothing, that line is
                untouched and there is still nothing to declare. Either way:
                run `git diff --name-only` against this block before filling in
                the Record — check-owns.mjs was retired by P4's retro
Inputs:     the L6 harness as W14 leaves it: examples/run-flow.ts, and l6.ts's
            fourteen rows with their Expectation shape (outcome, dispatched,
            joined, settled, branchEvents, pathEnds, nodeResults, unsettled,
            runFailure, stoppedBy, expectBackstop). The four flows in
            examples/flows/. test/matrix's `fanout-failure` flow is the SHAPE
            of an all-exit run but is a spec/examples fixture, not an L6 flow —
            an L6 flow needs real worker types from examples/workers. Whatever
            POLICIES holds after W16
Outputs:    (1) an all-exit flow under examples/flows/, where every branch
            reaches an `end` and nothing arrives at the join;
            (2) one L6 row per shipped policy over it, with expected values
            written from spec/ before the run;
            (3) if W16 shipped a policy that returns `unsatisfiable`: the FIRST
            L6 row in this repository where a join is reported unsatisfiable —
            `joined: false` rather than `null`, `onUnsatisfiableJoin` carrying
            the policy's own describe, and the run folding to `stuck` WITH a
            reason. Nothing at L6 has ever reached `joined: false`;
            (4) the Expectation shape extended to carry a reported-unsatisfiable
            assertion, if (3) applies — a row that could not assert it would be
            a row that does not test it
Depends on: W16. The number of rows is the number of shipped policies, and the
            interesting assertion exists only if one of them can say
            `unsatisfiable`
Blocks:     nothing. It is the last item of the plan
Tests:      L6, in examples/l6.ts. Expected values come from spec/run-state.md
            section 3's precedence and spec/join-policy.md sections 2-4, derived
            BEFORE the run and never read off it — doc/workflow.md section 5
            rules 1 and 2. The row's causal order must be ARRANGED rather than
            hoped for: W6's `exit-last` row exists because twelve rows had never
            once fired a join from the exited path, since the arriving branch
            always settled last. Here NO branch arrives, so the hazard is the
            mirror image — give the branches different delays so the join is
            settled by a determinate one of them, and say in the row's comment
            which
Gate:       L0 through L6, both L6 runtimes (node 24 and deno). L0-L5 in all
            five runtimes, unchanged by this item. Then pass 2 as
            doc/workflow.md section 6 defines it — TWO readers, the adequacy
            one in an ISOLATED COPY (v0.6)
Reserves:   Q99-Q100, ADR — none. The decision is W16's
```

**Every line is fillable, and the one that had to be settled first was `Inputs:`** — that L6 has no
all-exit row at all. Measured before this was declared: thirteen row keys in `examples/l6.ts`, four
flows in `examples/flows/`, and none in which every branch reaches an `end`. That is what makes this
item unconditional rather than a decoration on W16.

---

## Scope

**In**

1. **An all-exit flow at L6.** Every branch reaches an `end` node and nothing arrives at the join.
   The matrix reaches this shape through an `optional` failure and a human declining a suspended
   task; an L6 flow needs real workers, so **which road each branch takes is a design choice this
   item makes and states** — the cheapest is an `on: ["failed"]` edge from an `optional` task to an
   `end`, which needs no human and no resolution.
2. **A row per shipped policy.** Under `live-token` as shipped, the join fires with **zero
   arrivals**, carries `null` downstream, and the run reaches `completed` — the cost ADR 0003 names,
   asserted on real workers for the first time. Under `arrival-count` it is `stuck` with
   `joined: null`.
3. **The row that does not exist yet anywhere**, if W16 ships a policy that can return
   `unsatisfiable`: `joined: false`, `onUnsatisfiableJoin` fired once with the policy's own
   `describe`, the join's successor never dispatched, and the run `stuck` **with a reason**.
   **Nothing at L6 has ever reached `joined: false`** — every `stuck` row there is the silent
   `null` kind.
4. **The `Expectation` shape extended to assert (3).** A row that can report a reported-unsatisfiable
   join but cannot assert it is the *"declared output nobody built"* class the `Outputs` table exists
   for.

**Out** — named rather than left implicit, with where it goes instead

- **Any change to `src/**` or `spec/**`.** By declaration, and by W14's precedent: a real scheduler
  disagreeing with the fake is a finding about the fake and goes in the Record.
- **A browser L6.** [Q52](../questions/q52.md), untouched. L6 is Node and Deno
  ([Q33](../questions/q33.md), `RT-R10`), and `examples/**` is deliberately outside `test/**` so the
  browser bundle's glob cannot pull a scheduler into a runtime L6 does not run in.
- **Making the run's termination depend on a timer.** W5's finding: replacing the harness's
  termination predicate with `setTimeout(1)` left every assertion passing, because
  `scheduler.shutdown()` drained the run while the fold kept advancing. **A row whose join declines
  to fire is precisely where that mask is most convincing** — the run genuinely stops progressing, so
  a timeout and a correct predicate look identical. The predicate is `isTerminal` over the fold and
  the row must be shown to fail without it.
- **Deciding what a `stuck`-with-a-reason run should be CALLED.** It is `stuck` either way today
  (`joined !== true`). Whether that should be two outcomes is `spec/run-state.md`'s and W2's; if W16
  did not take it, it is a Q from this item's block.

## Verification

```bash
npm run gate
```

L6 alone, while iterating:

```bash
npm run test:l6
```

```bash
npm run test:l6:deno
```

**Both L6 runtimes are required and neither may be skipped** — `doc/workflow.md` section 4: *a rung
reported green without saying which runtimes it ran in is a rung that ran in one*. Node reaches
`fyflow-scheduler` 0.3.0 through `dist/`, Deno through the source, and `npm run check:scheduler` is
what stops a stale `dist/` reporting 0.2.x green under one and 0.3.0 green under the other.

**Which of the spec's named cases this item covers.** A branch routed away from its join (Q4): **yes,
every branch of it** — that is the row. `user_action` (Q17): **not in this row**, deliberately — the
matrix reaches all-exit through a suspension and a human, and doing that at L6 would add a resolution
race to a row whose point is elsewhere. L6 already has three `user_action` rows. No matching decision
edge (Q10): **not applicable** — the branches exit through an `on: ["failed"]` edge that *does*
match. A duplicate task id (Q13): **not applicable**. A nested fan-out (Q6): **not applicable**,
`FD-V15`.

**Rule 8 binds this item** if it acts on any review finding, and its provocations are written to the
**rule**: enumerate every terminal region event a branch of this row can emit, every field of the new
`Expectation` clause independently, **and the termination predicate** — replace it with a timer and
show the row goes red, because W5's finding says that specific substitution is what survives here.
**A set that only deletes the new row is the incomplete shape P4's retro measured three times.**

## Record

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **green, and it caught one of this item's own repairs** | `deno lint` over 42 files; five typecheck configs — node, browser, deno, tests, examples. `X5` reports **1 of 17** under the DOM lib, which is [Q71](../questions/q71.md), expected, and fails the gate if it exceeds one. **The S1 and S2 fixes below left `declaredFinished` written and never read**, and `no-unused-vars` refused it — the rung climbing from L0 doing exactly what section 4 says, on a repair that had already been provoked at L6 and looked finished. Deleted; the flag was the second source of truth in person |
| L1-L5 | **green, and untouched by this item** | **386 in node 24.20.0, deno 2.9.6 and chromium via `npm run gate`; firefox and webkit via `npm run test:browser:all`, which the gate does NOT run** — `scripts/run-browser-tests.mjs:68` defaults to chromium alone. Five runtimes is true and two of them are not established by the declared command, which W17's conformity reader raised as section 4's own *"a rung reported green without saying which runtimes it ran in"* one step removed. Unchanged from `047efbc`: W17 writes no `src/`, no `spec/` and no `test/`. *(386 counts `test()` cases, not `equal`/`ok` calls — [Q98](../questions/q98.md); L6's 342 counts individual assertions. Different nouns, same word)* |
| L6 node 24 | **green** | **342 assertions, 19 real runs.** 240 at `047efbc`; the difference is four new rows, one new unconditional per-row check across all seventeen, five `joinSettledBy` declarations and **seven** cross-row assertions (`CROSS_ROW` 6 → 13). Hand-derived to 316, 336, 341 and 342 — each matched the run's first print |
| L6 deno | **green** | **342 assertions, 19 real runs**, same table. Both L6 runtimes required and neither skipped (`doc/workflow.md` section 4) |
| conformity reader | **run — 7 findings, 0 blocking, verdict *conforms*** | It re-derived every value in the four rows from `spec/` before opening the file and **matched field for field, zero divergences**, and reproduced 12 of the 13 Outputs-table provocations exactly. Findings acted on below |
| adequacy reader | **run — 126 mutations, 24 gate survivors, 19 L6-blind, 2 BLOCKING** | in a `git worktree` verified green before it started (v0.6). Both blocking survivors are fixed below, and the fixes are provoked |
| re-run at `14f7580` | **green, exit 0** | The whole gate re-run at the committed tree, **exit code read directly rather than through a filter**: 386 in node 24.20.0, deno 2.9.6 and chromium; 342 at L6 in node and deno; 12/12, 13/13 and 14/14 self-test probes; `X5` at 1 of 17. firefox and webkit green separately via `npm run test:browser:all`, which the gate does not run |

**Which levels ran, per section 1 rule 4.** L0-L6 all ran, both L6 runtimes, and the final figures
above are from a run of `npm run gate` whose **exit code was read directly**. *(For one round of
repairs they were not: the gate's output was filtered through a `grep` whose patterns did not match
`deno lint`'s failure line, so a red L0 was reported here as green. Section 1 rule 4 is about skipped
checks; this is the same defect through a filter, and it is why the numbers above name the command
that produced them.)* **L7 did not run as a separate pass and fired once anyway** — a person reading
the table is what caught a truncated row key, which is [Q100](../questions/q100.md).

| Declared output | Exists | What would fail without it |
|---|---|---|
| the all-exit flow | **yes** — `examples/flows/all-exit.flow.json` | all four W17 rows. Measured three ways: let branch 0 arrive → **17** failures; drop `optional` from branch 1 → **10**; send the two branches to different `end` nodes → **3** |
| a row per shipped policy | **yes** — three rows over that flow, plus a fourth | **the cross-row policy-coverage assertion.** Shipping a fourth policy with no L6 row now fails L6 with one failure, which nothing did before: the `policyId` literal union W16 measured as inert is replaced by `PolicyId`, and by an assertion comparing the two halves rather than repeating one |
| the `joined: false` row | **yes** — `all-exit / live-token-requiring-arrival` | declaring `null` instead → **1** failure; deleting `joinSettled(fired: false)` from the driver → **3** *(recorded as 2 in the first draft: measured before `joinSettledBy` existed and carried forward instead of re-derived. Both readers caught it independently — the chaining hazard, inside the table whose purpose is measurement)*; routing out of the join anyway → **6** |
| the extended `Expectation` clause | **yes** — `Expectation.unsatisfiable`, and `RunReport.unsatisfiableJoins` behind it | deleting the row's declaration → **1**; never recording what the callback reported → **2**; recording it but dropping the policy's `describe` → **1**; the driver reporting a constant instead of `describe(state)` → **1** *(and the adequacy reader sharpened this: a constant EQUAL to the declared value → **0**. Only one L6 row asserts a `describe`, so the row pins the value and not its provenance)*; **and the reader's own probe — firing `onUnsatisfiableJoin` on the SATISFIED path too → 11, ten of them this check on rows with no cross-row assertion** |
| *(not declared — added by this item's provocation sweep)* the fourth row, `p1-routed-away LOW / live-token-requiring-arrival` | **yes** | *"stop counting `branch.arrived` altogether"* — a mutation the whole of L6 survived before this row existed, and **6** failures after |
| *(not declared — same)* `Expectation.joinSettledBy` | **yes** | reversing `buildScheduler`'s `SETTLES_LAST` — **0** failures before, **2** after, on exactly the two rows whose arrangement it is. **It pins the effect and not the stated mechanism**, and the adequacy reader showed the stated mechanism is inert: emptying the set or dropping its 4x to 1x survives, because the inline pools settle in dispatch order anyway. Three comments said *delay* and now say *dispatch order* |
| *(not declared — added on the adequacy reader's finding)* the verdict-coverage assertion | **yes** | deleting the fourth row **with its two constants adjusted** — the reader's H3, which the policy-set assertion alone left **green** — now → **3** failures |

**What broke.**

**Nothing in `src/`, `spec/` or `test/`, and nothing was edited there.** The real scheduler agreed
with the matrix's fake on every cell this row touches: `all-exit` reads `satisfied` under
`live-token`, `waiting` under `arrival-count` and `unsatisfiable` under
`live-token-requiring-arrival` at L6 exactly as `test/matrix/matrix.test.ts` asserts at L5 — and the
`describe` the driver reported, `{ live: 0, positive: true, arrived: 0 }`, is the value that suite
pins. Two rungs, one derivation from `spec/join-policy.md` section 3, neither read off the other.

**The one provocation this item's declaration named in advance was the WEAKER HALF of a pair, and
this Record said the opposite until the adequacy reader ran.** W5's finding is that replacing the
harness's termination predicate with `setTimeout(1)` left every assertion passing. That exact
substitution now produces **148 failures** — the edit, verbatim, so it can be re-run:

```
examples/run-flow.ts, inside the termination microtask
-        if (!isTerminal(state)) return;
-        declaredFinished = true;
+        setTimeout(() => { declaredFinished = true;
...                        settle?.(); }, 1);
```

*(Recorded verbatim because both readers reproduced a different number from the same sentence — 74
and 44 — which is rule 8's "precise enough to re-run" failing on its first outing here.)*

**But a 1 ms timer truncates the run, and a timer LONGER than the run does not.** `setTimeout(1200)`
in place of the whole race left all 341 assertions passing with every row's `wallMs` at ~1213 ms.
The mask was closed against the short form only, and there was no way to see that from the inside:
the short form is the one W5 recorded, so reproducing it read as reproducing the finding. **It is
closed now, structurally** — see S1 below.

**Three things broke in `examples/**`, all found by this item's own provocation sweep, all fixed here.**

1. **The third policy's discriminating clause could not fail.** The three declared rows run
   `live-token-requiring-arrival` on one scenario, and on that scenario `arrived` is always zero — so
   deleting the `arrived` increment from the policy entirely left all **316** assertions green — the count
   at the moment the three declared rows were the whole of it. The
   policy was shown to say `unsatisfiable` when nothing arrives and **never** to say `satisfied` when
   something does. That is `doc/workflow.md` section 5 rule 3 at row granularity. Closed by a fourth
   row on P1's own case, which is also ADR 0025's other claim asserted rather than argued: *where a
   branch arrives, the refinement is `live-token` exactly*.
2. **W6's causal arrangement was a load-bearing test input held down by nothing, and reversing it
   restored W6's original defect.** `buildScheduler`'s `SETTLES_LAST` decides which *driver code
   paths* L6 can reach. Swap which role gets the long delay and `settleJoin` can be deleted from the
   **`lost`** path with all 336 assertions passing — exactly the state W6 was built to fix — while
   `exit-last` drops from four failures to **none** against its deletion from the **`exited`** path.
   Closed by `Expectation.joinSettledBy`, declared on the five rows whose order is arranged and
   deliberately **not** on `p1-routed-away`, where which branch settles the join is a genuine race
   and asserting it would be the flake section 5 rule 5 forbids.
   **[Q99](../questions/q99.md)** is the other three knobs, which are still unheld.
3. **The human artifact named a run that does not exist.** A hard-coded 40-column key width truncated
   `p1-routed-away LOW / live-token-requiring-arrival` to `p1-routed-away LOW / live-token-requirin`.
   The width is now derived from the keys. **[Q100](../questions/q100.md)** is the class: nothing
   asserts a character of that table, which is W15's renderer finding in a second file.

**And one thing that was wrong before this item, fixed as a record step.** The register's cluster
table had **seven ids in no row** — Q3, Q44, Q45, Q97, Q98 and W17's two — so it read as a partition
of the register and was a subset of it. It gains a **`Verification and fixtures`** row, and both
halves are now checked separately: every id has a row, and every row's id appears in exactly one
cluster cell.

**What this taught.**

1. **A row whose point is a policy's `unsatisfiable` verdict cannot, by itself, test that policy.**
   The three declared rows are one scenario under three columns, and the column that agrees with
   `live-token` everywhere else is the one that had nothing to say about it. **The adequacy reader
   then found the same hole one level down** — the coverage assertion added to force a row per policy
   is satisfied by a row that runs a policy without discriminating on it, so deleting the very row
   that closed this left it green. Closed a second time, by asserting reachable **verdicts** rather
   than names. The provocation that
   found it was written to the **rule** — `spec/join-policy.md` section 3's third row, clause by
   clause — which is v0.6's amendment doing exactly what it was written to do, on a clause the
   deliverable's own shape hid. **That is one for P5's retro in the OTHER direction**: W15 and W16
   both found the amendment blind to what the item created, and here it found what the item created
   was blind to the rule.
2. **This item's `all-exit` rows make the `exited` path STRUCTURALLY covered, where `exit-last`
   covers it by timing.** When every branch exits, the join is necessarily settled from the exited
   path whichever branch settles last — so W17's rows catch a deleted `settleJoin` there with the
   arrangement reversed and `exit-last` does not. A stronger kind of coverage than W6 could buy, and
   not the row's declared purpose.
3. **Two of fourteen provocations were vacuous on the first pass, and both passed for the wrong
   reason.** One added a stray property to a row object, so the row still ran; one produced
   `ERR_INVALID_TYPESCRIPT_SYNTAX`, which the harness reported as *caught*. `doc/workflow.md` section
   5 rule 7 **(b)** — a probe asserts it changed its input — is written for *checks*, and rule 8 asks
   only that a fix's provocations be recorded precisely enough to re-run. **This is an argument that
   rule 8's set deserves (b) too**, and it is one occurrence.
4. **Two assertions this item added are correct, cheap and currently unfalsifiable, and both say so
   in place.** The per-row `unsatisfiableJoins` check is `[]` on sixteen rows no shipped policy could
   make non-empty; the `joinSettled` anchor gives the same answer as reading the whole stream, because
   no shipped policy settles a join while a branch is still live. Both were measured rather than
   assumed, and both follow `spec/join-policy.md`'s own precedent for `JP-R5`'s ordering clause — name
   it in the file rather than dress it up or delete it.
5. **`examples/flows/**` is validated by the `Driver` constructor and by nothing else, and that is not
   a gap.** Ladder L4 is *"every example flow validates against `spec/`"* and reaches
   `spec/examples/**` only. A malformed flow here fails loudly at L6: the constructor validates before
   anything is queued, against the run's real registry, which is a **stricter** gate than a standalone
   `validateDefinition` call. Named here rather than given a Q id, because a Q is for a gap with an
   address and this is a rung reporting one level later than its wording suggests.

## The two readers

**Overlap: 3 of ~31 findings**, which is the band `doc/workflow.md` section 6 predicts and the eighth
measurement of it — 1, 3, 3, 3, 3, 4, 4, **3**. Each of the three arrived from a different direction,
which is the property that keeps the split worth its cost:

| overlap | conformity found it by | adequacy found it by |
|---|---|---|
| *"the per-row `unsatisfiableJoins` check is unfalsifiable"* is **false** | re-running the item's own headline mutation and watching the count drop from 6 to 5 | firing `onUnsatisfiableJoin` on the **satisfied** path and getting 11 failures, ten of them that check |
| deleting `joinSettled(fired: false)` is **3** failures, not the 2 the Record claimed | reproducing the Outputs table row by row | the same edit inside a 126-mutation sweep of the driver's `unsatisfiable` arm |
| the recorded edit for the 148-failure termination probe is not precise enough to re-run | reproducing it and noting a looser reading gives 74/44 | reproducing it and getting **44**, from a different substitution of the same sentence |

**Both blocking findings are the adequacy reader's, both are in `examples/run-flow.ts`, and both are
the same shape — a second source of truth this file had already removed once, in one field, and not
in the others.**

### S1 — the termination race could be replaced by a CLOCK, with the whole gate green

```
-  await Promise.race([finished, backstop]);
+  await new Promise<void>((r) => setTimeout(r, 1200));
```

**341 assertions, 0 failed.** Every row's `wallMs` went from 30-160 ms to 1213-1216 ms and nothing
noticed. `finishedBy` was `declaredFinished ? 'run-state' : 'backstop'`, read *after* the race — so
it proved **the predicate fired**, never that **it ended the wait**. The microtask still set the flag
while the harness slept.

**This item's declaration named this exact hazard and the Record reported it closed.** It was closed
against a **short** timer only: `setTimeout(1)` truncates the run and is caught; a timer longer than
the run reproduces W5's mask exactly. **The item's own provocation was the weaker half of the pair,
and there was no reason to think so from the inside** — the 1 ms substitution is the one W5 recorded,
so reproducing it read as reproducing the finding.

**Fixed by making the value the race's result**: each arm resolves with its own name and
`finishedBy` is what `Promise.race` returns. This is the repair the file already made for `timedOut`
— *"deriving it from the winner of the race removes the second source of truth"* — applied one level
up, to the field whose comment claimed to have had it.

### S2 — `lateInputs`' only input could be deleted and all nineteen assertions stayed green

```
-      if (declaredFinished) lateInputs.push(input.kind);
+      void declaredFinished;
```

**341/0.** `RN-R12`'s *"nothing arrived after the run was declared finished"* runs on all seventeen
rows and the pair row; delete the one push and every one becomes a tautology. **Fixed by deriving it
from the sequence** — the driver records `finishIndex` at the quiescent point and `lateInputs` is
`inputs.slice(finishIndex)`, with `finishIndex < 0` meaning *the whole sequence is late*: a harness
that never recorded when the run finished cannot claim nothing arrived afterwards.

### Rule 8 on the three fixes — and the half of it that the fixes cannot buy

Provocations written to the **rule** (`RN-R12`, and `spec/join-policy.md` section 3's reachable
verdicts), not to the fix:

| probe | before | after |
|---|---|---|
| the race replaced by a 1200 ms sleep — **the reader's own probe** | SURVIVED | **caught, 22** |
| a sleep longer than every backstop (2000 ms) | SURVIVED | **caught, 22** |
| the run-state arm resolves with the backstop's name | n/a | **caught, 21** |
| the race waits only on the backstop | SURVIVED | **caught** (the harness hangs and is killed) |
| the finish index never recorded | SURVIVED | **caught, 18** |
| the finish index recorded one element short | SURVIVED | **caught, 18** |
| **a genuinely late input — the positive control** | SURVIVED | **caught, 18** |
| `isTerminal` widened to accept `running` | caught, 130 | caught, 130 |
| `isTerminal` widened to accept `awaiting_action` | caught, 9 | caught, 9 |
| the quiescence microtask replaced by a direct call | caught, 131 | caught, 131 |
| the fourth row deleted **with both constants adjusted** — the reader's H3 | SURVIVED | **caught, 3** |
| the third policy claimed to reach only `false` | n/a | **caught, 1** |

**And four probes that still survive, all of one kind, named rather than dressed up.** Reverting a
fix to its previous form; hard-coding `lateInputs` to `[]`; comparing the verdict map with itself;
slicing the sequence one element past the finish. Each is *delete the assertion* rather than *break
the rule*, and P4's retro says a set made only of those is the incomplete shape. The positive control
is what answers them: with a genuinely late input the mechanism fires, so what survives is the
deletion of an assertion and not a defect it would miss.

### The reader's sharpest non-blocking finding, and what it cost to close

**H3.** The `JP-R9 at L6` coverage assertion is a set over `policyId`, so it is satisfied by a row
that **runs** a policy without discriminating on it. Deleting
`p1-routed-away LOW / live-token-requiring-arrival` — the row this item added *because* the third
policy's clause was exercised in one direction only — left it **green**, because the `all-exit` row
still names the policy. **The forcing function this item built to close one hole had the same hole
one level down.**

Closed by a second assertion over **reachable verdicts** rather than over names, with its expected
values read off `spec/join-policy.md` section 3 one row each: `arrival-count` and `live-token` reach
`satisfied` and `waiting` and **never `unsatisfiable`**; the third reaches all three. `RN-R11` maps
those onto `joined` as `true`/`null`/`false`.

### What the readers confirmed rather than broke

- **Conformity re-derived every value in the four rows from `spec/` before opening the file and
  matched field for field** — the region-event streams, all three dispatch lists, `joined`, `settled`,
  the outcomes walked down section 3's precedence, `pathEnds`, the `describe`, and the flow's
  validity against `FD-V7`/`FD-V9`/`FD-V13`/`FD-V19`/`FD-V22` by hand. **Zero divergences.**
- **`spec/join-policy.md` section 4's three `unsatisfiable` clauses are each separately observable**,
  not one assertion standing in for three: the `describe` by the whole-array comparison, *routes
  nowhere* by three independent witnesses (`dispatched`, `RN-R4`'s `nodes`, `pathEnds`), and *invents
  no run-level outcome* by `failures: []` **and** `stuck` rather than `stopped`.
- **The `end`-node exemption is exercised**: removing `FD-V19`'s `kind !== 'end'` guard makes the
  shared `abandoned` node a refusal and the run dies at instantiation. `FD-V13`'s and `FD-V22`'s are
  not exercised by it.
- **`pathEnds` really is order-free on the all-exit rows.** Reversing `SETTLES_LAST` makes branch 0
  settle last and all three stay green; sending the branches to different `end` nodes is caught.
- **The duplicated-subject attack fails here** — pointing two of the three all-exit cross-row
  subjects at one run is caught, because the three expected values differ per element. The pair row
  needs an explicit distinct-subjects check; this block does not.
- **`joinSettledBy`'s `joinSettled` anchor is insurance and cannot currently fail** — the author's
  claim, verified rather than accepted.
- **The register's arithmetic** — 72 ids, 47 open, 25 resolved by the file's own predicate, every id
  in exactly one cluster cell, no duplicates — re-derived independently.

### Findings recorded and deliberately not acted on

1. **`doc/decisions/0015` still says `joined: false` is *"an assertion about an empty set"* and that
   *"neither shipped policy ever does"* return `unsatisfiable`.** False since ADR 0025, and **this
   item's row is what makes it false against a real run rather than in principle**. W16 corrected
   that sentence in two of its three homes — ADR 0003 and `spec/join-policy.md` section 4 — and left
   the third. **Not edited here, and the reason is the mechanism rather than the merit:**
   `doc/decisions/**` is in no `Owns` block and not in section 1 rule 5's record-step list, so
   editing it needs a declared exception, and section 7 rule 2 requires the declaration *before the
   item starts*. **P5's Record item 4 already names that gap and P5's retro owns it.** This is the
   defect it should be made to fix first.
2. **`spec/task-id.md`'s fourth segment is inert at every rung.** Hard-coding the attempt to `0` in
   `src/driver/ids.ts`, and deleting its validation, both survive the **whole gate** — nothing
   anywhere passes a non-zero attempt. Outside this item's `Owns` (`src/driver/**` is W3's) and there
   is no reserved Q id left in this item's block, so it is recorded here for P5's retro to place
   rather than taken silently.
3. **`RunReport.settledByScheduler` can be replaced by the driver's own `dispatched` list**, with the
   gate green — in the field whose comment names it *"the second, independent source Q32 actually
   needs"*. It survives because on a single-driver run the two sources genuinely always agree, so the
   only defence is a row where they differ and none exists. Same class as the two above: correct,
   cheap, currently unfalsifiable. Left, and named in place rather than claimed.
4. **An `end` node's author-defined `outcome` is asserted nowhere at L6.** Correct by design —
   `spec/flow-definition.md` section 2 says the driver never interprets it — and worth knowing that
   the mutation is therefore silent.
5. **Nineteen mutations are L6-blind but caught at L1-L5**, including `live-token`'s and the third
   policy's `having been positive` pins, `RN-R7`'s and `RN-R8`'s precedence rows, `FD-V13`'s and
   `FD-V22`'s `end` exemptions, and the Q95 latch. Not holes; recorded so this Record does not credit
   L6 with coverage it does not have.

### The vacuous-probe count, which is the second data point rule 8 asked for

**This item: 2 of 14 (14%). The adequacy reader: 3 of 126 (2.4%).** And the two sets fail in
**opposite directions** — one of this item's was a syntax error reported as *caught*, and all three of
the reader's were no-ops reported as **SURVIVED with the gate green**, which is the more dangerous
reading: a vacuous probe and a real hole are indistinguishable in a report, and one of the reader's
landed on `RN-R10`, the rule this item's rows are built on.

**The reader's generalisation is sharper than this item's and supersedes it.** Its harness *did*
enforce rule 7 (b) as written — it refused any probe whose target text was absent and asserted the
file changed — and **all three vacuous probes passed that check**, because a probe can change the
input without changing any observable. So rule 8's set does not need 7 (b); it needs something 7 (b)
does not say: **a survivor is only a survivor once a second, independent route confirms the mutated
clause was reachable.** Two occurrences, two directions, and a mechanism that is not a restatement —
which is section 6 pass 3 rules 2 and 3 together. **For P5's retro.**

**The `Owns` audit, taken by hand after the record step** (`check-owns.mjs` is retired — P4's retro).
`git diff --name-only` plus `git ls-files --others --exclude-standard` is **ten files**, and every one
is accounted for by a rule rather than by an exception. Counted as three groups so the total is
checkable in one pass:

| | files | |
|---|---|---|
| **`Owns: examples/**`** | **4** — `examples/l6.ts`, `examples/run-flow.ts`, `examples/README.md`, and the new `examples/flows/all-exit.flow.json` | the declaration |
| **this item's own file** | **1** — `doc/work-items/w17-the-all-exit-row-at-l6.md` | every item writes its own Record |
| **section 1 rule 5's record step** | **5** — `doc/open-questions.md`, P5's Record, `doc/README.md`, `CLAUDE.md`, `README.md` | not exceptions, and **all five were edited and all five are counted**, which is the half W16's audit got wrong |

**Zero declared exceptions used**, which is what the declaration predicted either way. **And
`doc/decisions/` is untouched** — the file class P5's Record found in neither the record-step list nor
any `Owns` block. This item reserved no ADR, so the gap is not exercised here and stays open.

**Questions raised.** Q99 and Q100, both also in `doc/open-questions.md`.

| Q | |
|---|---|
| **[Q99](../questions/q99.md)** | The L6 harness's timing arrangement is a load-bearing test input that nothing asserts. One knob closed by `joinSettledBy`; `threaded`, `delayMs` and `inline` still have none, and the honest assertion for two of them may be an ordering property the spec does not fix |
| **[Q100](../questions/q100.md)** | Ladder L6's rendered table is a deliverable no assertion reads — W15's renderer finding in a second file, and therefore a **second occurrence** for P5's retro |

**No ADR, as declared.** Nothing here needed a decision: ADR 0025 is W16's, and this item ran its
consequences on real workers.
