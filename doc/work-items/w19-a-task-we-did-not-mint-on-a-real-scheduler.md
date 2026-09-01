# W19 — A task we did not mint, on a real scheduler, with two runs

**Status:** todo
**Plan:** [P6](../plans/p6-what-may-share-a-scheduler-with-a-driver.md) — **this item is the plan's
exit artifact**: a scheduler carrying a task this library did not mint, two drivers running flows on
it, and both runs completing. It takes no decision; [W18](w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md)
does, and this is that decision on real workers.

```
Spec:       none new — this item writes no spec and amends none. It is W18's
            rule (spec/outcome-record.md section 6's OR-R10 and
            spec/task-id.md section 3's ID-R4, as ADR 0027 leaves them) on
            real workers, and P6 separates the two items on exactly that line.
            Its expected values are READ from those two documents plus
            spec/run-state.md section 3 (both runs reach an `end`, so both are
            `completed`) and spec/join-policy.md sections 2-3, never from what
            a run emits (doc/workflow.md section 5 rule 1).
Owns:       examples/**              (from W17, which is done — the same way
                                     W17 inherited it from W14 and W14 from
                                     W6/W5)
            That is the whole of it. No src/, no spec/, no test/.
Inputs:     ADR 0027 as W18 ships it — this item cannot start before that
            decision exists, because "both runs completing" is only reachable
            if the foreign settlement does not stop them, and what it does IS
            the decision.
            The L6 harness as W17 leaves it: examples/run-flow.ts (runFlow,
            runPair, buildScheduler, PairFacts), examples/l6.ts's EXPECTED[]
            and its pair block, examples/flows/, examples/workers/.
            The four things W17 added or repaired that must not be undone, and
            each has an assertion behind it: `finishedBy` derived from
            Promise.race's OWN result; `lateInputs` derived from `finishIndex`;
            `Expectation.joinSettledBy`; and the cross-row block asserting
            every shipped policy on every verdict section 3 lets it reach.
Outputs:    (1) a way to put a task this library did not mint onto the pair's
                shared scheduler — an option on runPair, or an exported
                buildScheduler; whichever, it is examples/run-flow.ts and it
                is public to l6.ts alone;
            (2) the pair row extended, or a second pair row beside it, in
                which the foreign task settles and BOTH runs still complete —
                the exit artifact, and the assertion that names it;
            (3) the foreign settlement asserted from the SCHEDULER's own
                record (PairFacts), not from either driver — the row's claim is
                about a settlement neither driver may act on, so reading it
                from a driver asserts the absence of a thing from the thing
                accused of dropping it;
            (4) examples/README.md and l6.ts's rendered table updated to the
                new row count, with the count derived rather than typed.
Depends on: W18 — and this is a hard dependency, not an ordering preference.
Blocks:     nothing. It is the last item of the plan.
Tests:      L6 IS the test; there is no separate suite. Three groups, all
            with values derived before running:
              - the exit artifact: both runs `completed`, each with its own
                four task ids from spec/task-id.md section 1, disjoint, and
                each log holding only its own run's records;
              - the foreign task: accepted by the scheduler, settled by it,
                and reaching both drivers — asserted from PairFacts, whose
                listeners are registered before either driver exists
                (doc/workflow.md section 5 rule 4);
              - the ORDERING, which is the part a single row hides: the
                foreign task settling BEFORE either run's own first settlement
                is the hostile case and is what the measurement below used.
Gate:       L0-L6, and L6 in BOTH runtimes — `npm run test:l6` (node 24) and
            `npm run test:l6:deno`. A green L0-L5 proves nothing here: this
            item's entire claim is about a real scheduler, and L0-L5 never see
            one. Then the two readers of doc/workflow.md section 6, the
            adequacy one in an isolated copy.
Reserves:   Q107-Q110, ADR — none. The decision is W18's, and an item that
            reserved one here would invite the exit artifact to re-take it
```

**No ADR is reserved, deliberately.** P6 reserves 0027-0028 and W18 holds both. If W19 finds
something that needs a decision, that is a finding reported to P6's retro, **not** an ADR taken by
the item whose job is to demonstrate the previous one. *(An unused reserve is skipped, never
reissued — `doc/workflow.md` section 3.)*

**`doc/decisions/**` is a record-step file** (`doc/workflow.md` v0.7 change 3), so if W19's result
falsifies a sentence in ADR 0027 or ADR 0023, correcting it needs no exception. **That is the gap
that blocked W17 from correcting ADR 0015**, and this item is the first that could plausibly hit it
again — a demonstration is exactly the thing that falsifies a decision's prose.

## Exceptions — files edited outside `Owns` and outside the record step

**None declared.** `Owns: examples/**` and the record step's six files are expected to be the whole
of it. Audited by hand after the record step with `git diff --name-only` and
`git ls-files --others --exclude-standard`, per `doc/workflow.md` section 7 rule 2;
`check-owns.mjs` stays retired.

*If ADR 0027 changes `Driver`'s public surface, `examples/l6.ts` and `examples/run-flow.ts` absorb it
inside `Owns`. If it changes a type `index.ts` exports, that is W18's file and W18's edit, made
before this item starts.*

## The load-bearing fact, measured on a REAL scheduler before this was declared

*`doc/workflow.md`: measure before declaring. **P6's urgency claim — "one foreign settlement stops
every driver subscribed to that scheduler" — had only ever been measured on a FAKE**, by W13's
conformity reader and again on 2026-08-31. This repository's own record is that fixtures-versus-reality
is where it has been wrong, and the fake establishes neither of the two things this item's premise
actually needs.*

Two questions a fake cannot answer, both run against `fyflow-scheduler@0.3.0` from npm, one real
`FyflowScheduler` with three inline `WorkerManager` pools, two `Driver`s on `valid/linear.flow.json`:

| | |
|---|---|
| **Does a real scheduler accept a task whose id is not ours, and settle it?** | **Yes.** `addTask(new FyflowTask({ id: 'nightly-cleanup', workerType: 'IngestWorker', … }))` is queued, dispatched to a real worker, and settles |
| **Does its settlement carry `detail.id`, so it reaches `parseTaskId` at all?** | **Yes.** `task.completed` fires with `detail.id === 'nightly-cleanup'` |

And then, with both questions answered yes, the claim itself:

```
1 scheduler accepted + settled the foreign id : true
2 settlement ids the scheduler dispatched     : ["nightly-cleanup","runa:ingest:-:0","runb:ingest:-:0"]
3 run failures reported                       : ["runa/InvalidTaskId","runb/InvalidTaskId"]
4 runa hasFailed / runb hasFailed             : true / true
5 runa dispatched ids                         : ["runa:ingest:-:0"]
```

**Confirmed, and sharper in two ways the fake could not show.**

1. **Row 2 is the part to carry.** The scheduler *kept working*. `runa:ingest:-:0` and
   `runb:ingest:-:0` both settled **after** the foreign task did — the drivers had already stopped, so
   neither routed a successor. Row 5 is one node of a three-node linear flow. The failure is not that
   the scheduler breaks; it is that **the drivers go deaf while everything around them proceeds
   normally**, which is the shape that will not be noticed in production.
2. **Ordering is a variable and it is the hostile direction that was measured.** The foreign task was
   added before `start()`, so both drivers died before their own first settlement arrived. A foreign
   task settling *after* both runs have finished is the benign case and would pass a row written
   carelessly. **W19's row must settle the foreign task while both runs are live**, and the
   declaration says so rather than leaving the interleaving to whatever the first draft produces.

*(`doc/workflow.md` section 5 rule 5 — this ARRANGES an ordering rather than depending on one, which
is the same move `buildScheduler`'s `SETTLES_LAST` makes and which W17 measured as the honest form.
Nothing asserts which of `pa` and `pb` settles first.)*

**What this does not establish, and W19 must:** all of the above is today's behaviour, with ADR 0027
not yet written. If ADR 0027 says *stop the run*, then **"both runs completing" is unreachable and
the exit artifact changes shape** — it would become *a scheduler carrying a foreign task, two
drivers, and both runs stopping legibly with the precondition documented*. That is a real outcome and
P6 says W18 is entitled to reach it. **This item's row is written after ADR 0027, from ADR 0027**,
which is the whole of why `Depends on: W18` is hard.

## Scope

**In**

1. **The injection point** — one way, in `examples/run-flow.ts`, to put a task this library did not
   mint onto the scheduler `runPair` builds. Added through the **instrumented** `addTask`, so
   `PairFacts.addTaskCalls` counts it and the count stays a fact about the scheduler rather than
   about the harness.
2. **The exit artifact row**, with the foreign settlement arranged to land while both runs are live.
3. **The scheduler-side assertions.** `PairFacts.settlementIds` gains the foreign id, and the
   existing *"the scheduler settled eight tasks, none of them twice"* becomes nine with the ninth
   named — **derived from the flow's node ids and the injected id, not pasted from a run.**
4. **Both L6 runtimes**, node 24 and deno. Every existing row runs in both and this one is not an
   exception.

**Out** — named rather than left implicit, with where it goes instead

- **Any decision.** W18's. If this item's demonstration argues against ADR 0027, that is a **finding
  reported to P6's retro**, and the loop is: report, do not re-decide inside the demonstration.
- **[Q90](../open-questions.md) — `ID-R4` tier 2's missing L6 coverage.** Out, per P6's Scope/Out.
  **The register asks to be re-read here and this is that re-read**, recorded rather than skipped:

  > **The instrument is now shared, which P6 could not have known.** Q90 needs a settlement carrying
  > *this* run's id for a node the driver never dispatched. W19 builds exactly the machinery that
  > produces one — injecting an arbitrary task into the pair's scheduler — so the marginal cost is
  > **the string**: `pa:notanode:-:0` instead of `nightly-cleanup`. P6's stated ground for excluding
  > it, *"a different experiment"*, was written when the two looked like different rigs. It is
  > **still out**, because widening a scope the plan settled is not this item's call
  > (`doc/workflow.md` section 1 rule 3), but the reason has weakened and **the recommendation is
  > that Q90's row be updated to say the instrument exists and to name W19's harness**. For P6's
  > retro to rule on, one way or the other.

- **`src/`, `spec/`, `test/`.** None of them. An item that reached into `src/` to make its
  demonstration pass would be demonstrating the fix rather than the system.
- **[Q99](../open-questions.md)'s three remaining harness knobs and [Q100](../open-questions.md)'s
  unread rendered table.** W17 raised both and left them honest; W19 inherits `examples/**` and does
  not close them. **Q100 is worth one line at the Record**: it is W15's renderer finding in a second
  file, and this item adds a row to that same unread table.

## Verification

How each clause of `Gate:` is run.

| Clause | Command |
|---|---|
| L0 | `npm run check:spec`, `check:source`, `check:scheduler` (+ self-test — **D3** is what stops two runtimes reporting green against two different schedulers), `check:policies` (+ self-test), `check:docs` (+ self-test), `npm run lint`, `npm run typecheck` — including `typecheck:examples`, which is the project this item's files live in |
| L1-L5 | `npm run test` (node 24), `npm run test:deno`, `npm run test:browser` — **chromium only** by default (`scripts/run-browser-tests.mjs:68`); `npm run test:browser:all` is firefox and webkit and `npm run gate` does **not** run it. Unchanged by this item, run because the ladder is climbed from L0 |
| **L6, node** | `npm run test:l6` |
| **L6, deno** | `npm run test:l6:deno` |
| conformity reader | `doc/workflow.md` section 6, fresh context, spec first, re-deriving this item's expected values independently before looking at them |
| adequacy reader | same, tests second, mutating **in an isolated copy** — `cp -r node_modules` (inert: zero symlinks and zero reparse points, re-verified before the copy), green in the copy before the reader starts, **scan for links before removing it** (`find <copy> -type l`, and `Get-ChildItem -Recurse -Force -Attributes ReparsePoint`) |

**Do not read the gate's result through a grep.** W17 did, its patterns missed `deno lint`'s failure
line, and it reported a red L0 as green for a round. Read the exit code.

**And do not chain the two assertion counts.** `npm run test`'s number is `test()` **cases**
([Q98](../open-questions.md), `test/runner.ts:62`); L6's is individual assertions. Same word,
different nouns. Both are re-derived from a run.

**Rule 8 — provocations, both obligations** (`doc/workflow.md` v0.7 change 1). The set is written to
the **rule's clauses** — `OR-R10` and `ID-R4` as ADR 0027 leaves them, every terminal state, both
orderings of the foreign settlement — **and** to the **`Outputs` table's rows**, one probe per row
asking what would fail if that output did not exist. **W17 is the item that proves the second half is
not redundant here**: its deliverable-written set found three of four real survivors and was blind to
a clause of the rule, in this very file. **And a survivor is only a survivor once a second,
independent route confirms the mutated clause was reachable** (v0.7 change 2) — a probe that changes
`examples/l6.ts` without changing an observable reads as SURVIVED with the gate green, which is the
dangerous direction.

*Per the template, this item touches routing at L6, so:* a branch routed away from its join (Q4) —
**not applicable**, the pair row's flow is `fanout-join` and no branch routes away; `user_action`
(Q17) — **not applicable**, covered by L6's `suspend-resume` rows and unchanged here; no matching
decision edge (Q10) — **not applicable**; a duplicate task id (Q13) — **not applicable to this row's
own ids, and covered adjacently**: the pair row's disjointness assertions are what `spec/task-id.md`
section 2 is about, and they stay; a nested fan-out (Q6) — **not applicable**, still unbuilt
(`FD-V15`).

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.** One row per clause of the `Gate:` line above. Each verdict starts with `RAN` or
`NOT RUN`; a clause with no row reads as *did not run*. The last row is the gate re-run at the commit
that acts on the review findings, and it names that commit.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | | |
| L1-L5 | | |
| L6, node 24 | | rows, real runs, assertions |
| L6, deno | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.** One row per item on the `Outputs:` line, and for each, the
assertion or command that **would fail if it did not exist**. A blank cell is the finding.

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the injection point in `run-flow.ts` | | |
| (2) the exit-artifact row | | |
| (3) the foreign settlement asserted from `PairFacts` | | |
| (4) `examples/README.md` and the rendered table's counts | | |

**`Owns` audit.** `git diff --name-only` and `git ls-files --others --exclude-standard` against
`examples/**` plus the record step's six files, by hand, **after** the record step.

**The exit artifact.** *The plan's, not just the item's — state it as a person could check it.*

**What broke.**

**What this taught.**

**Questions raised.** *Q ids from Q107-Q110, one line each. They also go in
`doc/open-questions.md`.*
