# W17 — The row L6 has never had: every branch exits, on real workers

**Status:** todo
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
- **A browser L6.** [Q52](../open-questions.md), untouched. L6 is Node and Deno
  ([Q33](../open-questions.md), `RT-R10`), and `examples/**` is deliberately outside `test/**` so the
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

*Filled in when the item is done. Delete the italic lines.*

| Clause | Verdict | Notes |
|---|---|---|
| L0 | | |
| L1-L5 | | |
| L6 node 24 | | |
| L6 deno | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors — **in an isolated copy** |
| re-run at `<sha>` | | |

| Declared output | Exists | What would fail without it |
|---|---|---|
| the all-exit flow | | |
| a row per shipped policy | | |
| the `joined: false` row | | |
| the extended `Expectation` clause | | |

**What broke.**

**What this taught.**

**Questions raised.** *Q99-Q100, with one line each. They also go in `doc/open-questions.md`.*
