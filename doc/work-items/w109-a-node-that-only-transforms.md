# W109 — A node that only transforms

```
Spec: spec/flow-definition.md — the built-in node type, and the refusal of one declaring no
      `transform`. spec/runtime-targets.md if the envelope's contract moves.
Owns: src/definition/registry.ts, src/definition/validate.ts, src/scheduler/envelope-worker.ts,
      src/definition/assist.ts, spec/flow-definition.md, test/definition/node-type.test.ts,
      test/scheduler/envelope.test.ts, doc/decisions/0075-*.md,
      doc/work-items/w109-a-node-that-only-transforms.md
Inputs: P26 facts 3-7, each RE-TAKEN at this declaration — fact 3 (BUILT_IN_GROUP_TYPES and
        BUILT_IN_GATE_TYPES exist, BUILT_IN_NODE_TYPES does not), fact 4 (`EnvelopeWorker.inner`
        is already `InnerWorker | null`), fact 5 (`S14` forbids the engine outside
        src/jsonata/**), fact 6 (`produced()` returns `unchecked` with no outputSchema),
        fact 7 (`tryTransform` ships and is not wired to this case). Q445, Q446.
Outputs: (1) `BUILT_IN_NODE_TYPES` with one member — a type whose worker is the package's own
             envelope with NO inner worker, which names a LANGUAGE and imports no engine
         (2) a node of that type declaring no `transform` is REFUSED at construction, because
             the alternative is an expensive identity (P26 decision 5 (b))
         (3) it takes `settings`, which the wrapper already binds as `$settings` (5 (c))
         (4) the sampled output shape is an EXPLICIT deliverable: `tryTransform` wired to this
             case so an author gets a shape where fact 6 gives them none (5 (a))
         (5) the three-tier rule in ADR 0075 — `needs` for selection, `transform` on the
             consuming node for computation, this type only when there is no consuming node —
             with the COST of a tier-three node measured rather than asserted
Depends on: W108 (both edit spec/flow-definition.md — SERIAL)
Blocks: W110
Tests: L1 (the registry, the refusal both ways), L2, L4 (the corpus), a real-pool case for the
       envelope's no-inner arm, check:wiring (the `unchecked` verdict asserted, not hoped for),
       check:source S14 and S16, check:docs
Gate: npm test, check:source, check:wiring, check:docs, npm run gate
Reserves: W109, Q451-Q455, ADR 0075
```

## Why

**A node whose whole job is to reshape data has to be written as code**, even though the envelope
worker already does the reshaping — and the library ships no node type at all, where it ships
three group types and one gate type. [Q445](../open-questions.md). With W108 this is the second
half of what a UI needs: a flow document that says both *which way* and *what shape*.

## What to be careful of

1. **This REINTRODUCES a shape two ADRs removed, and the ADR must say so.** P17's declaration
   calls a reshaping task node *"the workaround ADR 0040 exists to remove"*. It is legitimate as
   an escape hatch and wrong as a default, so output (5)'s three-tier rule is not decoration —
   without it a UI emits a dispatch where a `transform` or a `needs` would have cost nothing.
2. **The cost is a real task and it multiplies.** A dispatch, an `OR-R2` clone and a log record;
   inside a `map`, N of them. W34 measured a clone per branch at **2207 ms at N = 1000**. Output
   (5) requires that measured here rather than cited from there.
3. **A built-in JSONata type would turn `S14` red and ship a 242 KB engine to every consumer.**
   Fact 5. The type names `lang` exactly as `transform` does; the adapter stays the consumer's,
   and ADR 0052 rule 4 is untouched. **Nothing in this item may import `jsonata`.**
4. **Output (4) is a SAMPLE and the verdict stays `unchecked`.** A sample is evidence about one
   input; `fits` is a claim about every input. Saying otherwise would be the strongest claim in
   this item and the easiest to make falsely — [Q446](../open-questions.md) records the residue,
   and P26 prediction 4 says this item does not remove it.
5. **`EnvelopeWorker.inner` is ALREADY nullable, which makes the arm small and the probes
   necessary.** A new arm in a shipped file is exactly where rule 8 obligation (e) belongs: what
   happens when the no-inner road is taken by a node that HAS an inner worker, and the reverse.
6. **`BUILT_IN_NODE_TYPES` is a new SET, so the collision rules apply to it.** `registry.ts`
   already refuses *one name, two definitions* for node types, group types and gate types; a
   built-in node type colliding with a document's or `code`'s must be refused the same way, and
   whether the existing clause reaches it is a measurement rather than an assumption.

## Record

*(to be written at the record step)*
