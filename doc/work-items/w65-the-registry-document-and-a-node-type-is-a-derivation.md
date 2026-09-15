# W65 — The registry document, and a node type is a derivation

**Status:** todo
**Plan:** [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)

```
Spec:       spec/flow-definition.md §2 (a task node's keys: `type` required, `pool?`
            added, `workerType` retired), §3 (the registry: workers with four
            schemas, node types as derivations, pool instances, group types), §5
            (FD-V23/FD-V32/FD-V34 folded into one rule; FD-V33 reading a schema; one
            new FD-V for a `pool` that is not an instance of the node's `type`; a
            fold of the refusal count), §7 (the corpus rows); a registry-document
            section stating every construction-time refusal by name
Owns:       src/definition/**, spec/flow-definition.md, spec/README.md,
            spec/examples/**, test/**, AGENTS.md (the grammar migration of every
            snippet naming `workerType` — the gate executes them), doc/decisions/0053-*,
            doc/decisions/0054-*
Inputs:     P18 decisions 1-6 and 12-14, read from the PLAN's own file; facts 1, 2,
            4 and 5 re-run from dev-dist/p18/facts.mjs and the subset prototype
            dev-dist/p18/subset-validator.mjs (a seed to rewrite, never to copy);
            today's NodeType, Registry and bootstrap (src/definition/types.ts,
            src/scheduler/bootstrap.ts); W59's FD-C5 and W61's FD-C6
Outputs:    (1) `NodeTypeDefinition` and `PoolSpec` in src/definition/types.ts, a
                worker entry type carrying `url` and four optional schemas, a group
                type as `{ configSchema?, create }`, and the registry DOCUMENT type
                — with the document form of a node type implemented as the identity
                derivation (merge), reproducing fact 5's captured options byte for
                byte for every existing type
            (2) the built-in JSON Schema SUBSET validator in src/definition — ADR
                0053 — with its keywords enumerated in the spec, a keyword outside
                the subset REFUSED at construction naming it (Q278 decided), and
                the sample's fourteen cases as fixtures
            (3) the grammar: `type` required on a task node, `pool?`, `workerType`
                retired — ADR 0054 — FD-V23, FD-V32 and FD-V34 folded into one rule,
                FD-V33 reading the worker's `settingsSchema` with the type's
                `settings` defaults merged under, one new FD-V for a `pool` not of
                the node's `type`; `Registry.workerTypes` and
                `DriverOptions.workerTypes` retired (decision 14)
            (4) the corpus migrated: spec/examples/registry.json becomes a registry
                document, every `workerType: X` in both corpora becomes `type: X`
                with a document-declared type per former pool, the invalid examples
                for the folded rules removed, spec/README.md's rows moved
            (5) every construction-time refusal of the registry document — type's
                worker missing, pool's type missing, config against schema, group
                config against its factory's schema, a type whose own `config` fails
                its own schema, a document/code name collision — as a named error
                class with a fixture each
Depends on: nothing — P17 is merged
Blocks:     W66
Tests:      expected values from spec/ and from P18's facts, never from output.
            Every refusal fixtured with a document that trips it and one that does
            not; the identity derivation compared to fact 5's captured options as
            JSON text; the subset validator over the sample's schemas with the
            negative cases; prediction 2's byte-for-byte comparison of every existing
            type's pool options before and after
Gate:       L0-L5 in five runtimes; check:spec (C7 reads the registry document);
            rule 8 obligation (a) over every field of both interfaces and BOTH shapes
            of a node type (document, class), (d) over the corpus census and the
            subset's keyword list, (e) the registry document renamed out; then
            spec-conformity pass (two readers), rule 8 re-run with their edits
Reserves:   Q280-Q284, ADR 0053-0054
```

## Scope

**In**

1. **What a registry document IS**, as types and as spec prose, with the document form of a node
   type being the identity derivation and a class form being any other — decision 2.
2. **The subset validator** — ADR 0053, the maintainer's choice at the draft — and the one decision
   it forces: an unknown keyword is refused, never ignored (Q278).
3. **The grammar change** — ADR 0054 — and the corpus that shows it: 146 task nodes, eleven pool
   keys, every worker that read its payload whole (fact 4).

**Out** — named, with where each goes

- **Building anything.** No pool, no group, no driver is constructed here; the document is validated
  and typed. Construction is W66's.
- **Run-time enforcement of `inputSchema` and `outputSchema`.** Declared and carried; P19's.
- **Rewriting `examples/**`.** W67's, the corpus under `examples/flows/` included — this item
  migrates `spec/examples/**` and the `test/**` fixtures only, and the L6 rows keep running on
  `workerType` until W67 because ADR 0054's refusal lands in the validator and L6 is not migrated
  here. *(If that ordering fails — the validator refusing `workerType` breaks every L6 row the
  moment W65 ships — the migration of `examples/flows/` moves into this item as a declared
  exception, and the plan's Record says so.)*

## Exceptions

*Seeded from the plan's own table, on P16's and P17's finding that the previous item's late table
predicts the next's.*

| path | why |
|---|---|
| `scripts/check-spec.mjs`, `scripts/check-spec-selftest.mjs` | predicted: `C7` reads typed tasks against `registry.json`'s `nodeTypes` and `languages` (W61's table) and the registry document's shape moves under it; `C4`'s refusal count moves when `FD-V23` and `FD-V34` fold; a probe and a `META` entry per new clause |
| `scripts/build-browser-tests.mjs` | predicted: it inlines `spec/examples/**` JSON; the registry document is one more fixture (W54's shape) |
| `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | predicted: `RUN_FLOOR` moves if a snippet is deleted rather than migrated; declared before the first `AGENTS.md` edit |
| `scripts/check-markdown.mjs` | predicted NOT to fire: the declaration retuned `M3` for this plan's four documents; this item adds two under `doc/decisions/`, which the one-directory probe cuts. Checked against the fixture before the first document |
| `examples/flows/**`, `examples/run-flow.ts`, `examples/l6.ts` | **predicted as the one late exception this item may have to take**: if the validator's refusal of `workerType` cannot be staged behind W67 (Scope Out, last bullet), the L6 corpus migrates here. Declared so that taking it is not undeclared |

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck`, read by `$?` |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, redirected, read by exit code; baseline P18's declaration numbers, re-taken |
| L4 | `npm run check:spec` — the refusal count and the example index both ways |
| identity | a test comparing, for every entry of the L6 harness's `NODE_TYPES` and for the sample's types, the derivation's `PoolSpec` to fact 5's captured `WorkerManagerOptions` as JSON text |
| readers | conformity: the spec's registry section and ADR 0054 first, every refusal re-derived on paper before a fixture is read; adequacy: isolated copy, the subset's keyword list, the folded rules and the derivation's merge mutated |

*Routing cases: not applicable — this item dispatches nothing. A branch routed away (Q4),
`user_action` (Q17), no matching edge (Q10), a duplicate task id (Q13), a nested fan-out (Q6) are
all W67's on the migrated corpus.*

## Record

*Filled in when the item is done.*
