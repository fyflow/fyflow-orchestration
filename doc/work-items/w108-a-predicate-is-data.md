# W108 — A predicate is data

```
Spec: spec/flow-definition.md — a `when` may be a declared PREDICATE, and the FD-V family that
      refuses one. Version bump expected; the refusal count MOVES.
Owns: spec/flow-definition.md, src/driver/routing.ts, src/definition/validate.ts,
      test/driver/decision-context.test.ts, test/definition/predicate.test.ts (new),
      spec/examples/invalid/** (the FD-V fixtures), spec/examples/valid/** (one document),
      doc/decisions/0074-*.md, doc/work-items/w108-a-predicate-is-data.md
Inputs: P26 facts 1 and 2, each RE-TAKEN at this declaration rather than transcribed —
        fact 1 (jsonata's only evaluation entry returns a Promise; `selectEdge` is synchronous
        and pure; `driver.ts` holds 2 async/await) and fact 2 (the eight predicate shapes in
        the tree, of which THREE are not path+op+literal). Q444, Q9, Q251.
Outputs: (1) a `when` may be a registered NAME or a declared PREDICATE, and the name road is
             BYTE-UNCHANGED — asserted as an identical dispatch comparison, not as prose
         (2) the subset covers all eight shapes fact 2 measures, and REFUSES outside itself
             BY NAME (ADR 0053's shape), with the enumeration CLOSED and flat `all`/`any` only
         (3) every refusal is at CONSTRUCTION with its position, never at routing time —
             ADR 0002 rule 1's actual property, `FD-V36`'s precedent
         (4) a declared predicate CANNOT be impure, which is strictly stronger than Q9's
             measured 1-of-4 and is asserted rather than argued
Depends on: nothing. W109 is independent and SERIAL only because both edit the grammar
Blocks: W109 (the grammar's version), W110 (the exit artifact needs both)
Tests: L1 (the grammar, every FD-V both ways), L2 (routing from a fixture outcome log —
       where this repo's value is proved and where the evaluator lives), L4 (the corpus),
       check:spec (C4's count, C7), check:docs (AGENTS.md section 3's refusal count — X7)
Gate: npm test, check:spec, check:docs, npm run gate
Reserves: W108, Q444-Q450, ADR 0074
```

## Why

**A flow document cannot say what a branch depends on.** `when` names a predicate registered in
code, so the reference is data and the logic is not — and that is the last thing in this library
that a flow document cannot say for itself. [Q444](../open-questions.md) is the row; P26 is the
plan; `doc/concept.md` section 5's invariant is what makes the answer safe, because a predicate
that is data cannot reach a clock, a random source or the network.

## What to be careful of

1. **The name road must not move.** Every existing flow, every corpus document and all four of
   `PredicateRegistry`'s live consumers keep working, and the evidence is a byte-identical
   dispatch comparison of two runs — the device W59 used for a bare `workerType` node — not a
   sentence saying nothing changed.
2. **Fact 2 is a claim about THIS tree and nothing else.** It measures what eight predicates
   here need; it says nothing about what a consumer writes. The enumeration is CLOSED and
   refuses outside itself by name, which is ADR 0053's shape and is what stops this becoming a
   bad expression language one shape at a time. **The refusal is the deliverable as much as the
   subset is.**
3. **The absent path is a DECISION, not a default.** `(outcome.result.score ?? 0) > 0.5` is one
   of the eight shapes, and what a missing path compares as has to be stated in the grammar —
   silently reading `undefined` as `0` is the class of defect `FD-R2` exists for, one layer over.
4. **`readKeyPath` and W100's refusal walk are REUSE, and the scope differs.** That walk was
   built for an arc leaving a GATE; a decision reads `ctx.outcome.*` and `ctx.needs.*`, and
   `outcome.taskId` is the second most-read root in the tree. Whether the walk applies unchanged
   is a measurement this item takes, not an assumption it inherits — P26 prediction 2's own
   reversal condition.
5. **The evaluator goes where routing is PURE.** `selectEdge`'s comment says so and `FD-C3` gives
   each edge its own context. An evaluator that touches anything but its argument has broken
   ADR 0014, and that is the sentence this item's adequacy reader should try to falsify first.

## Record

*(to be written at the record step)*
