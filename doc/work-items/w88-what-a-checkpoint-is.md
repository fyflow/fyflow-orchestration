# W88 — what a checkpoint IS

**Status:** todo
**Plan:** [P23](../plans/p23-what-a-run-needs-to-outlive-its-process.md) — *what does a run need so
that it can be saved while it runs and resumed after the process that ran it is gone?*

```
Spec:       spec/run-state.md — a new section, WHAT A CHECKPOINT CARRIES, and the rules for it
            (the header's fields, the event sequence, the structuredClone contract, the sequence
            position). Rules are ADDED and no existing rule's text moves — P23 prediction 4, and
            this item is its first test.
Owns:       src/driver/**, src/fold/**, src/scheduler/**, spec/**, test/**, doc/decisions/0064-*
Inputs:     P23 decisions 1-8, RE-TAKEN at this item's declaration step rather than transcribed:
            facts 1, 2, 3 and 6 by re-running dev-dist/p23/replay.ts and footprint.ts on the tree
            this item starts from; ADR 0014 (the driver produces the ordered fold-input sequence);
            ADR 0058 (what start returns, and ADR 0014's refusal of a driver subscribing to itself);
            OR-R2, OR-R6, OR-R11 and OR-R12 (what crosses the clone); W42's finding that the entry
            payload is in no record.
Outputs:    (1) ADR 0064 — what a checkpoint is
            (2) the HEADER: a format version, runId, flowId, flow version and the ENTRY PAYLOAD,
                and the driver keeping the entry payload it was started with
            (3) driver.checkpoint() returning { header, events }, and the header on RunHandle
            (4) the structuredClone contract as a RULE, with an observer over EVERY fold-input
                kind rather than over the kinds a corpus happens to produce
            (5) each event's SEQUENCE POSITION available to a consumer appending events, so a
                stored stream can be named "everything up to N"
Depends on: nothing
Blocks:     W89
Tests:      test/driver/** at L1-L2 on a fake scheduler. Every expected header field is derived
            from the definition and the start call, never read back from checkpoint() itself; the
            round-trip is asserted against structuredClone for each fold-input kind by NAME, and
            the kind list is bound both ways to FoldInput's union (a list is a claim about another
            list — rule 8 obligation (e)).
Gate:       L0 under all five typecheck lanes and lint, EACH RUN SEPARATELY; L1-L5 in three
            runtimes; check:spec; check:docs; L6 UNMOVED at 1833 / 60 in both runtimes.
Reserves:   Q366-Q370, ADR 0064
```

## Scope

**In**

1. **The header**, its fields and its format version, and the rule that makes the format version
   the thing W89's resume refuses on.
2. **The driver keeps the entry payload** — the one thing P23 fact 2 found the log does not carry.
3. **`driver.checkpoint()`** returning a value that round-trips `structuredClone` exactly and holds
   no live reference to the driver, and **the header on `runtime.start`'s handle** (P23 decision 4).
4. **The sequence position** — how a consumer knows which event is which when it appends.
5. **What `checkpoint()` costs**: a copy or a reference, measured and decided, with the choice
   stated against P23 fact 6.

**Out** — named rather than left implicit, with where it goes instead

- **Resuming** from a checkpoint, the replay, the prefix check, the re-dispatch and every refusal —
  W89.
- **Whether a resume is RECORDED as an event** — P23 stop-and-ask (a), answered before W89.
- **The real-worker demonstration and the reference's teaching** — W90.
- **Storage, redaction and any memory option** — P23 decisions 1 and 8.

## What the declaration step must re-take before anything is edited

| # | re-take | from |
|---|---|---|
| 1 | the replay still reproduces the corpus exactly — P23 fact 1 | `dev-dist/p23/replay.ts`, re-run on this item's starting tree |
| 2 | the entry payload is still in no record, and every site that would need it at resume | fact 2, plus a grep of `src/driver/driver.ts` for every read of the start payload |
| 3 | every fold-input KIND round-trips `structuredClone` — including the kinds the corpus never produced | fact 3 re-taken over the `FoldInput` union rather than over the corpus |
| 4 | which of `examples/**`'s `DRIVER_FIELDS` lists and `test/driver/retention.test.ts`'s a new private field reaches | the seeded exceptions table's first row |

## Verification

*To be filled at the item's declaration step. An item that touches routing states which of these
it covers: a branch routed away from its join (Q4), `user_action` (Q17), no matching decision edge
(Q10), a duplicate task id (Q13), a nested fan-out (Q6). This item adds no routing and says so; the
checkpoint of a run in each of those states is in its observers.*

## Record

*Filled in when the item is done.*
