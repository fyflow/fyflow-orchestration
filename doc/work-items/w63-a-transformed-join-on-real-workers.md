# W63 — A transformed join on real workers

**Status:** todo
**Plan:** [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)

```
Spec:       none — this item writes no rule; it demonstrates FD-C6 and Q263 on a
            real FyflowScheduler in both L6 runtimes
Owns:       examples/**
Inputs:     P17's exit artifact paragraph and decisions 5, 7 and 8, read from the
            PLAN's own file; fact 5 (the singleton rule and the empty join)
            re-run from dev-dist/p17/facts.mjs; W61's FD-C6 and W62's adapter;
            JP-R12 (a join carries the arrived results keyed by branch path,
            `{}` when nothing arrived); ADR 0046 rule 3 (the successor is the
            last thing that sees the collection whole); examples/l6.ts's
            ROW_KEYS, CROSS_ROW_SUBJECTS and DECLARED_TOTAL discipline
            (W35, W47, W55).
Outputs:    (1) examples/flows/transformed.flow.json: a fanout of two typed
                scorers into a join whose typed successor declares
                `transform: { lang: "jsonata", expr: "$sum([*.score])" }` and
                NO reshaping node, and a typed map branch whose transform
                reshapes its own item — with the map's settings read through
                `$settings`
            (2) L6 rows at arity TWO, ONE (a branch routed away, P1's own case
                under liveToken) and ZERO (a join nothing reached, so the
                successor's input is the transform over `{}`), each asserting
                what the successor's worker RECEIVED from the run and not from
                a literal — Q263 as three rows, and the discriminating pair
                between arity one and two asserted (v0.13 change 3)
            (3) an L6 row where the transform FAILS at run time (a type error,
                `1 + "a"`'s shape) on a non-optional node, the run parked as
                `user_action`, resolved by the harness with the value the
                transform did not supply, and the run completing — decision 5
                measured end to end
            (4) what reverting W61, W62 and W63 EACH costs, in L6 failures, on
                the tree this item ships, with every existing row unmoved
            (5) examples/README.md and the flow-worker's role table updated
Depends on: W62
Blocks:     nothing
Tests:      expected values from spec/ (JP-R12 for the record's shape, FD-C6 for
            what the worker receives) and from jsonata's documented semantics,
            never from output. The arity-two and arity-one rows' expected
            values SWAPPED must fail; the transform deleted from the flow must
            fail the arity-two row by the worker receiving the raw record;
            the reshaping node re-added must leave the row green (it is the
            road this plan removes, not forbids).
Gate:       L6 in both runtimes, redirected and read by exit code, at the
            pre-item numbers plus this item's rows; three revert runs; rule 8
            over ROW_KEYS/CROSS_ROW_SUBJECTS/DECLARED_TOTAL; then
            spec-conformity pass (two readers), rule 8 re-run with their edits
Reserves:   Q274-Q277
```

## Scope

**In**

1. **The exit artifact**, at three arities, on real workers, in both runtimes.
2. **The run-time failure road** end to end — the only place decision 5's `user_action` consequence
   can be observed with a person (the harness) in the loop.
3. **The three revert costs**, the plan's headline numbers, taken last on the tree that ships.

**Out**

- **Any rule or refusal** — an exit artifact writes no rule (W43, W47, W51, W55, W59).
- **A second flow shape** — one flow carries the four `input` kinds `FD-C5` enumerates; if a
  reader's finding needs a second, it is added here, not in a new item.

## Exceptions

| path | why |
|---|---|
| `spec/outcome-record.md` §4, `spec/run-state.md` §7 | predicted from W58's and W59's tables: the corpus split moves with every L6 flow |
| `scripts/check-markdown.mjs` | predicted NOT to fire; checked against `M4`'s fixture before the first document is written |

## Verification

| clause | command |
|---|---|
| L6 | `npm run test:l6`, `npm run test:l6:deno`, redirected, read by `$?`; baseline W62's shipped numbers, from **1281 assertions over 46 real runs** at `4c269d4` |
| revert costs | three L6 runs with W61, W62 and W63 reverted in turn, each read by exit code and failure count |
| readers | conformity: `JP-R12` and `FD-C6` first, every expected value re-derived on paper before a row is read; adequacy: isolated copy, the rows' literals and bounds mutated |

*Routing cases: a branch routed away from its join (Q4) — **covered**, the arity-one row;
`user_action` (Q17) — **covered**, output 3; no matching decision edge (Q10), duplicate task id
(Q13) — not applicable; nested fan-out (Q6) — not applicable unless a reader asks for the typed map
inside a fanout branch, which W59's `typed-regions` already runs.*

## Record

*Filled in when the item is done.*
