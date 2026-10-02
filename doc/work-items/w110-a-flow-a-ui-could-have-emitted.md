# W110 — A flow a UI could have emitted

```
Spec: NONE expected — an exit artifact writes no rule.
Owns: examples/l6.ts, examples/registry.json, examples/flows/** (one new document),
      examples/README.md, AGENTS.md, README.md (only if a section is paired),
      doc/work-items/w110-a-flow-a-ui-could-have-emitted.md
Inputs: W108's grammar and W109's type, RE-TAKEN rather than inherited; P26 prediction 3, the
        plan's one REACH prediction, which nothing in this repository has ever tested.
Outputs: (1) a flow that runs on a real `FyflowScheduler` in BOTH L6 runtimes where the ONLY
             code is the domain workers — no predicate function, no reshaping worker, no gate
             type, and `RunOptions.predicates` EMPTY, asserted rather than merely unused
         (2) the two roads of a decision, in ONE flow: one `when` a declared predicate and one
             a registered name, so the name road is shown alive beside the data road
         (3) a reshaping step with no code whose output a downstream worker READS, so the
             transform is shown doing something rather than being present
         (4) P26 prediction 3 answered either way, and if it REVERSES the shape that could not
             be expressed is NAMED rather than worked around
         (5) what reverting each item costs at L6, per item, measured
Depends on: W108, W109 — SERIAL, this is the exit artifact
Blocks: nothing
Tests: ladder L6 in node and deno; L1-L5 UNMOVED is the declared result for the definition half
Gate: npm run gate (both L6 runtimes), check:docs, check:workers, npm run gate:full
Reserves: W110, Q456-Q458, no ADR expected
```

## Why

P26's exit artifact, and its one real test. The plan's predictions 1, 2 and 4 restate facts
measured at the declaration, so confirming them tests the reasoning; **prediction 3 is the only
one about something nobody has measured** — that a UI can emit a complete flow with no code but
the domain workers — and it can only be answered by trying.

## What to be careful of

1. **`RunOptions.predicates` empty is the claim, and it must be ASSERTED.** The seam exists for a
   row that wants a different predicate (W67), so an empty map that is merely never consulted
   proves nothing. The row asserts the registry is empty AND that the run routed both ways.
2. **A row that cannot tell the feature from its negation is not evidence.** W43 built an exit
   artifact in which every map instance scored zero and would have shipped it; the two decision
   roads in output (2) exist so that one flow carries both and a single wrong value cannot
   satisfy both.
3. **Prediction 3 reversing is a RESULT, not a failure.** P15's retro recorded that a reversal
   clause DIRECTS an item; this one's job is to try to find the shape that needs a function. If
   it finds one, naming it is worth more than routing around it.
4. **L6 MOVES, so every count copy moves with it.** `X10` holds the copies in
   `examples/README.md` against `examples/l6.ts`, both ways, and W96 built it because those
   counts went stale in six consecutive commits. Raise them in the commit that moves them.
5. **No new worker unless the artifact needs one**, and if it does, say so at the declaration
   step rather than at the record step — P21's grant was measured UNUSED and P22's was used.

## Record

*(to be written at the record step)*
