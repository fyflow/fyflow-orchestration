# W54 — What a result may be, and what bounding it would cost

**Status:** todo
**Plan:** [P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md)

```
Spec:       spec/outcome-record.md section 4 (OR-R2 - why `result` is the
            exception, what it costs, and what it is not) and OR-R6
Owns:       spec/outcome-record.md, src/fold/**, test/fold/**,
            test/definition/**, doc/decisions/0047-*.md
Inputs:     P15 facts 6 and 7, read from the PLAN's own file and RE-RUN from
            dev-dist/p15/clone.ts and dev-dist/p15/facts.ts rather than
            transcribed. W53's ADR 0046 - what a run retains, which is what
            decides how much a result costs. ADR 0007 (which did NOT want a
            deep copy), ADR 0037 rule 1, W46's method finding.
Outputs:    (1) Q22 DECIDED - is a cloneable result a constraint on workers or
                on the driver - as ADR 0047 or as a recorded decision with no
                ADR, on prediction 3's verdict
            (2) spec/outcome-record.md section 4 carrying the RE-TAKEN numbers
                with their METHOD, on W46's Q190 precedent
            (3) the SILENT lossy case written down - a class instance clones
                and arrives as a plain object with no error
            (4) the price of bounding RunState.nodes[*].result, measured
                rather than argued, with the surface named
            (5) an L1/L2 assertion of the cloneability boundary in BOTH
                directions - what is refused and what is silently changed
Depends on: W53
Blocks:     W55
Tests:      expected values from spec/ and from the ADR. A timing is not an
            assertion: what is asserted is the BOUNDARY (refused / cloneable /
            lossy) and the SHAPE of the cost, never a millisecond count -
            Q179 says wall time here is not reproducible.
Gate:       L0-L6, then spec-conformity pass (two readers)
Reserves:   Q238-Q242, ADR 0047
```

## Scope

**In**

1. **[Q22](../open-questions.md), decided.** Its row says *"what it now needs is a decision about the
   CONSTRAINT rather than a measurement"* — the measurement arrived with
   [W34](w34-what-a-branch-receives-and-what-a-join-carries.md) and P15 re-took it. The decision is
   whether *a result must be structured-cloneable* is a constraint on **workers** (declare it, refuse
   at the boundary) or on the **driver** (copy it, and wear the cost).
2. **Re-taking the numbers with their method, and saying so.** Fact 6: Q22's row quotes 1.50 /
   2207.94 / 2.29 / 7.99 ms; one case per process the same measurements are **0.64 / 516.77 / 0.02 /
   1.54 ms**. The conclusion is unchanged and the ratio class holds; **every absolute is 2-5x lower**,
   because W34's were taken accumulated in one process and W46 later measured that at up to 4.4x.
   *A register row quoting an absolute is quoting a method*, and the method goes in the document on
   [Q190](../open-questions.md)'s precedent.
3. **The silent lossy case, which no rule anywhere names.** Fact 7: `structuredClone` **refuses** a
   function, an object holding one, a `Symbol`, a `Promise` and a `WeakMap`; it **accepts** a plain
   object, a `Map`, a `Date`, a cyclic object — and **a class instance, which arrives as a plain
   `Object` with its prototype and methods gone, `instanceof` false, and no error and no report.**
   `OR-R6` makes the loud case a run failure; nothing at all is a rule about the quiet one.
4. **The price of bounding `RunState.nodes[*].result`** — fact 7's other half. 89% of the corpus's
   task nodes are named by no `needs`, so *drop a result no reference can name* is decidable **from
   the document**; and it is **not free**, because blanking every result takes the fold's input from
   13984 B to 1612 B **and changes what `RunState` reports**. Priced here, with the public surface
   named. Taking it is the maintainer's call (P15's stop-and-ask list).

**Out** — named rather than left implicit, with where each goes instead

- **Taking the bound.** This item **prices** it. P15 decision 1 says a candidate that changes what a
  consumer reads belongs in an ADR with the surface named and is the maintainer's; the stop-and-ask
  list is where it goes.
- **[Q186](../open-questions.md)'s threshold** — *how large is too large*.
  [W46](w46-what-a-reference-costs-and-whether-anything-says-so.md) decided **nothing warns** and left
  it open deliberately. **Not reopened.** If this item's decision makes that row answerable, **say so
  in the Record rather than acting on it** — reopening a row whose status reads *decided* is section 6
  pass 3 rule 1's *measuring your own output*.
- **Changing `OR-R2`'s deep copy or `OR-R6`'s refusal.** Prediction 3 says both stand. If the evidence
  says otherwise, that is a weakening of a `spec/` rule and it is on P15's stop-and-ask list.
- **What a run retains** — W53's, and this item's `Depends on`.
- **[Q9](../open-questions.md)** — predicate purity. The *"a worker must not retain what it returns"*
  alternative in Q22's own row is the shape Q9 already rejected as unenforceable; cited, not reopened.

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint` and `npm run typecheck`. **A rung reported GREEN means its command EXITED 0** (section 4, v0.15) |
| L1-L3 | `npm test`, `npm run test:deno`, `npm run test:browser:all`. The cloneability boundary is asserted in **all five runtimes**, deliberately: fact 7 was measured in Node 24 alone, and that is prediction 3's stated way of being wrong |
| L4 | `npm run check:spec` — and `C8` compares `spec/README.md`'s version row against `spec/outcome-record.md`, which this item bumps |
| L5, L6 | `npm test` (the matrix) and `npm run test:l6` / `test:l6:deno` as regressions this item must not break |
| conformity reader | spec first, code second, **re-deriving the re-taken timings independently** — fact 6 is the case where an author's number was reproduced by nobody for four plans |
| adequacy reader | **in an isolated copy**, with the author's tree held still (section 6, v0.15) |

**Routing coverage**: **not applicable**. This item touches the outcome-record boundary and the fold,
and routes nothing. `user_action` ([Q17](../open-questions.md)) is the one exception worth naming —
`OR-R2`'s guard is `terminalState === 'done' ? structuredClone(d.result) : null`, so a `user_action`
settlement carries no result to clone, and the resolution path (`spec/outcome-record.md` section 6)
deep-copies for the same reason. Both are asserted.

**Before this item is done it greps the tree for `W54`** outside `doc/` — section 1 rule 5's third
direction. At this declaration that returns **0** hits.

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
| Q22 decided | | |
| the re-taken numbers with their method | | |
| the silent lossy case written down | | |
| the price of the bound | | |
| the boundary asserted both ways | | |

**What broke.**

**What this taught.**

**Questions raised.**
