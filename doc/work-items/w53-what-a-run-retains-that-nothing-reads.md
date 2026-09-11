# W53 — What a run retains that nothing reads

**Status:** todo
**Plan:** [P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md)

```
Spec:       spec/run-state.md section 5 (the "Bounded retention" bullet, open
            since v0.1) and spec/join-policy.md section 4 (JP-R11, JP-R12)
Owns:       src/driver/**, test/driver/**, spec/run-state.md,
            spec/join-policy.md, doc/decisions/0046-*.md
Inputs:     P15 facts 1-4, read from the PLAN's own file and RE-RUN from
            dev-dist/p15/facts.ts rather than transcribed - which is the
            mechanism that caught P14's founding error (its retro, refusal 5).
            ADR 0037 rule 1 and rule 4; ADR 0040 rule 2; ADR 0014.
Outputs:    (1) ADR 0046 - what a run retains, what it may forget, and when
            (2) the `arrivals` clear, with the join-never-fires case answered
            (3) spec/run-state.md section 5's bullet RESOLVED rather than
                restated, with the variable named correctly (fact 2)
            (4) JP-R11/JP-R12 stating the lifetime of what a join collects
            (5) an L2 assertion that the cleared structure is empty after the
                join has fired, and NON-empty before it - the discriminating
                pair, whose difference is itself asserted (v0.13 change 3)
Depends on: nothing
Blocks:     W54, W55
Tests:      expected values from spec/ and from the ADR, never from output.
            The negative control is P15 fact 3's: clearing BEFORE the join
            reads costs 13 L1-L5 failures, so the suite can see the structure.
Gate:       L0-L6, then spec-conformity pass (two readers)
Reserves:   Q233-Q237, ADR 0046
```

## Scope

**In**

1. **[Q19](../open-questions.md), decided as ADR 0046.** What a run retains, what it may forget, and
   when. The decision has to be falsifiable — `spec/run-state.md` section 5 has carried this as an
   unanswered bullet since v0.1, and a restatement is not an answer.
2. **The measured-free half**: `arrivals` is a second copy of every branch result and is **49.8%** of
   what a region-bearing run holds (fact 3). Clearing it after the join reads it costs **0 at L1-L5
   and 0 at L6**, and takes the top of P15's scale table from **3174.8 MiB to 1610.9 MiB**.
3. **The case the free half does not cover**: a region whose join never fires holds its arrivals for
   the life of the run (fact 3's own exception, measured at 65571 B on a 3-branch fanout with one
   branch settled). *A run that hangs is exactly the run that keeps everything*, and the ADR must say
   what happens to it rather than leave it to the clear site.
4. **Correcting the variable.** Fact 2 measures the footprint as *(tasks settled) x (bytes each
   returned)*; `spec/run-state.md` section 5 says *"proportional to its dispatched-node count"* and
   [Q19](../open-questions.md)'s row says *"proportional to its node count"*. Both name the smaller
   half. The corrected statement lands in the document this item owns.
5. **Naming `inputs`.** Fact 1: the register names `log` and `arrivals`; `inputs` is what actually
   holds every result and is in no row. Whatever ADR 0046 says a run retains has to name the structure
   that holds it.

**Out** — named rather than left implicit, with where each goes instead

- **Bounding `RunState.nodes[*].result`** — fact 7's 89%. It is measured **not** free: blanking every
  result takes the fold's input from 13984 B to 1612 B and **changes what `RunState` reports**. P15
  decision 1 forbids this item from taking it on the strength of fact 3. **W54's**, with the surface
  named.
- **Any eviction.** P15 decision 2: a fold over an incomplete log reports `completed` with zero nodes
  and no signal (fact 4). An eviction candidate needs a way for the fold to say it was handed less
  than the whole log, and that is a new `FoldInput` kind. **If this item finds one that costs a field
  rather than a kind, that is prediction 2's reversal and it goes to the plan's Record.**
- **`maxCompletedTasks`.** Fact 4: it caps `scheduler.tasks`, which is the scheduler's own map, and
  reaches nothing this driver holds. There is no answer to inherit. Recorded in the ADR as a candidate
  measured and refused, not as an open option.
- **[Q22](../open-questions.md)** — what a result may be. **W54's.**
- **[Q15](../open-questions.md)** — durability. Named in the ADR as what a resumed run cannot be
  handed; not decided.
- **[Q219](../open-questions.md)** — a region's collection. P15 declares it the follow-on.

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint` and `npm run typecheck`. **A rung reported GREEN means its command EXITED 0** — `doc/workflow.md` section 4, v0.15. A tail line is never the predicate, and `deno lint` prints `Checked N files` either way |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`. The baseline is 25 files / 681 cases in five runtimes |
| L6 | `npm run test:l6` and `npm run test:l6:deno`. The baseline is 942 assertions over 42 real runs |
| L4 | `npm run check:spec` — `spec/` is 7 documents, 44 examples, 89 rules, and `C8` compares `spec/README.md`'s version row |
| conformity reader | spec first, code second, re-deriving this item's expected values before looking at them |
| adequacy reader | **in an isolated copy**, and the AUTHOR's tree holds still while it reads (section 6, v0.15). Scan for links and reparse points before removing the copy; `../fyflow-w16-adequacy` is on disk from earlier work and is **not** this item's to remove |

**Routing coverage**, since this item touches the join exit: a branch routed away from its join
([Q4](../open-questions.md)) is covered — it is the case where arrivals are held and never read; a
nested fan-out ([Q6](../open-questions.md)) is covered, because the clear is keyed by region and a
nested region has its own key; `user_action` ([Q17](../open-questions.md)) is covered by the
never-fires case. A duplicate task id ([Q13](../open-questions.md)) and no matching decision edge
([Q10](../open-questions.md)) are **not applicable** — neither reaches the join exit.

**Before this item is done it greps the tree for `W53`** outside `doc/` — section 1 rule 5's third
direction, with the procedure v0.15 adopted. At this declaration that returns **1** hit, in
`CLAUDE.md`'s *"the next plan starts at W53"*.

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0-L6 | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| ADR 0046 | | |
| the `arrivals` clear | | |
| `spec/run-state.md` section 5 resolved | | |
| `JP-R11`/`JP-R12` lifetime | | |
| the L2 discriminating pair | | |

**What broke.**

**What this taught.**

**Questions raised.**
