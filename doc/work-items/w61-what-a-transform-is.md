# W61 — What a transform is

**Status:** todo
**Plan:** [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)

```
Spec:       spec/flow-definition.md sections 2, 3, 5 and 7 — the `type` subsection gains
            `transform`, section 3 gains FD-C6, section 5 gains FD-V35-FD-V37 (ids
            confirmed against section 5 at this item's start: FD-V34 and FD-C5 are the
            highest at declaration)
Owns:       src/definition/**, src/driver/**, src/scheduler/**,
            spec/flow-definition.md, spec/README.md, spec/examples/**,
            test/definition/**, test/driver/**, test/scheduler/**,
            AGENTS.md sections 3 and 13, doc/decisions/0051-*.md
Inputs:     P17 decisions 1, 3, 4, 5, 6, 7, 8, 9 and 10, read from the PLAN's own
            file; facts 1, 7 and 8 re-run from dev-dist/p17/facts.mjs (the
            jsonata facts need JSONATA_URL and are W62's to re-run); FD-C5's
            wording (`input` is the value this node receives); the envelope
            worker's header (a third key is the wrapper's to consume); W58's
            rule that a dispatch key is added only when present; ADR 0002 rule 3
            (registered by name, refused at instantiation); doc/workflow.md
            v0.17 obligation (a)'s enumeration clause — FD-C5 lists FOUR kinds
            of `input` and every one of them is a shape here.
Outputs:    (1) ADR 0051 — what a transform is: a declared expression in a
                registered language, applied in the type's worker wrapper to
                the value the node receives, never in the driver; the adapter's
                two halves and why (fact 7); the roads not taken with their
                cost — a transform on an untyped node (the driver would
                evaluate), a transform as a registry entry rather than a flow
                key (the flow could not say what it does to its input)
            (2) `LanguageAdapter` and `Registry.languages` in
                src/definition/types.ts: `{ compile(expr): void, worker: string,
                check?(expr, inputShape) }` — compile synchronous and throwing,
                worker a module URL, check reserved for P18 and implemented by
                nothing
            (3) `transform: { lang, expr }` on a typed task node with FD-V35
                (unregistered language; an absent set is empty), FD-V36 (an
                expression compile refuses, the language's message as detail)
                and FD-V37 (a transform on a node with no `type`, or not an
                object of two strings)
            (4) FD-C6: what a typed node's worker receives WHEN a transform is
                declared — `input` is the transform applied to the value this
                node receives, with `$settings` bound; FD-C5 unchanged
            (5) the driver: `transform` in the envelope only when declared,
                the untransformed envelope byte-identical (decision 8)
            (6) the envelope worker: loads the adapter's worker module in
                setup(), compiles each node's expression ONCE per worker
                instance, evaluates in run() and hands the inner worker
                `{ settings, input }` with `input` replaced; `TransformFailed`
                naming the expression and the language's code, a task failure
            (7) the bootstrap helper writes the adapter URL into the typed
                pool's config beside `worker` and `config`, only for a type
                some node of which declares a transform
            (8) the ADAPTER CONFORMANCE SUITE in test/scheduler/**, run here
                against a FAKE language shipped as a test fixture (a data: URL
                module), so that W62's JSONata adapter is a second
                implementation of an interface that already has a suite
            (9) AGENTS.md: section 3's key table gains `transform`; section 13
                gains the paragraph and a `run` snippet against the fake
                language, so the section is executable without jsonata
Depends on: nothing — P16 is merged
Blocks:     W62, W63
Tests:      expected values from spec/ and ADR 0051, never from output.
            Obligation (a) with the ENUMERATION: FD-C5 names four kinds of
            `input` — the ordinary edge, `needs`, a map item, a join's
            collection — and a transform is fixtured on ALL FOUR, at L1
            through the wrapper and at L2 through the envelope. Negative
            controls: delete the wrapper's evaluation and the inner worker
            receives the untransformed value (L1 fails, L2 does NOT —
            prediction 3); add the key unconditionally and the byte-identical
            comparison fails; make the fake language's compile accept
            everything and FD-V36's fixture stops firing. Make the transformed
            and untransformed fixtures' expected values EQUAL and the pair
            must FAIL (v0.13 change 3).
Gate:       L0-L5 in five runtimes, check:spec (C4 on three new invalid
            documents, C8 on the version row), check:source (S6 if a file is
            added under src/), check:docs (the section 13 snippet executes),
            then spec-conformity pass (two readers), rule 8 re-run with their
            edits checked in
Reserves:   Q266-Q269, ADR 0051
```

## Scope

**In**

1. **ADR 0051**, on P16 decision 2's and ADR 0049's shape: the decision, the measured facts under
   it (facts 1, 7, 8), and the roads not taken with their cost.
2. **The interface both halves of an adapter satisfy**, and a **fake language** that satisfies it,
   shipped as a test fixture so every clause of the interface has a positive case before a real
   language exists. The fake is deliberately trivial — an expression is a dotted key path, `compile`
   refuses anything else — so a reviewer can hold the whole language in one line and the suite is
   about the INTERFACE.
3. **The three refusals, the envelope key, the wrapper's evaluation and the helper's wiring**, each
   with its fixture, its negative control and its `spec/examples/invalid/` document.
4. **The byte-identical comparison** of decision 8, asserted the way W59 asserted the P12 flows: the
   two P16 typed flows dispatched with and without `languages` registered, compared as bytes.

**Out** — named rather than left implicit, with where each goes instead

- **JSONata**, and any dependency on it — W62's. This item's fake language is what makes that
  separation a test rather than a promise.
- **The exit artifact on real workers** — W63's. This item runs the wrapper on a real inline AND
  threaded pool at L1 (as W59's bootstrap suite does), which is real workers without being L6.
- **P18's `check` hook** — reserved in the interface, implemented nowhere, asserted optional.
- **A transform on an untyped node, on `over`, on an edge or on a decision** — refused, with the
  plan's reasons, and recorded in ADR 0051 rather than argued again.

## Exceptions

Files edited outside `Owns` and outside section 1 rule 5's record step, each named with its reason
**before it is edited** — W59's practice, whose six declared exceptions were predicted from W58's
late table and took no late one.

| path | why |
|---|---|
| `scripts/check-spec.mjs` | predicted from W59's table: `C7` reads typed tasks against `registry.json`; a task carrying `transform` names a language, and `registry.json` gains a `languages` list `C7` must read — mirroring the `nodeTypes` clause W59 added |
| `scripts/check-spec-selftest.mjs` | rule 7: a probe and a `META` entry per new `C7` site |
| `scripts/check-docs.mjs` | only if section 13's `run` snippet moves `RUN_FLOOR` (Q102's ratchet) |
| `spec/outcome-record.md` §4, `spec/run-state.md` §7 | predicted from W58's and W59's tables: the corpus split re-derived by W54's suite moves with every corpus flow this item adds |
| `scripts/check-markdown.mjs` | predicted NOT to fire: `M4`'s two-directory fixture measured **3610** against **3960** at P17's declaration; this item's prose lands under `doc/decisions/`, which the probe cuts. Checked, not assumed |

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck`, redirected and read by `$?` |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, redirected and read by exit code; baseline **32 files / 858 cases in five runtimes** at `4c269d4`, plus this item's suites. The fake language's data: URL module must load in the browser bundle too — W59's bootstrap suite already does this |
| L4 | `npm run check:spec` — three new invalid documents under `C4`, the version row under `C8`, `C7` widened as declared |
| checks | `npm run check:source`, `npm run check:docs` — the new section 13 snippet executes against the fake language |
| byte identity | the comparison test, and its negative control (the key added unconditionally) |
| conformity reader | spec first, code second: `FD-C6` and the three refusals re-derived from the new subsection before the code is read |
| adequacy reader | isolated copy, tree held still by content digest; mutations over the wrapper, the adapter interface and the four `input` kinds |

*Routing cases: a branch routed away from its join (Q4) — not applicable, no routing changes;
`user_action` (Q17) — **applicable**, a transform failure on a non-optional node parks the run and
the L1 wrapper suite asserts the failure reaches the scheduler as a task failure; no matching
decision edge (Q10), duplicate task id (Q13), nested fan-out (Q6) — not applicable.*

## Record

*Filled in when the item is done.*
