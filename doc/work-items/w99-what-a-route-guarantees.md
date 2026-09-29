# W99 — what a ROUTE guarantees, and the declaration that says so

**Status:** **in progress** — declared 2026-09-29 on `54ff41d` ([P25](../plans/p25-what-a-route-guarantees-about-the-value-it-carries.md)'s
declaration), before any file under `Owns` was edited.
**Plan:** [P25](../plans/p25-what-a-route-guarantees-about-the-value-it-carries.md) — *what does a gate's
ROUTE guarantee about the value it carries, and what must its KEY PATH satisfy for that guarantee to exist?*

```
Spec:       spec/flow-definition.md, BOTH tables in section 3 (measured, not guessed: the interface's
            member table is under *Gate types — CODE, beside the built-ins*, and the arc-shape table
            under *What the schemas buy an author — the wiring check*). The member table gains a ROW;
            the arc table gains a GATE row: what leaves a gate on a route the type calls key-resolved is
            what arrived, REFINED. One rule id for the guarantee.
            **ADR 0068** — the decision is that the TYPE declares it, which P25 stop-and-ask (a) settled.
Owns:       src/definition/types.ts (the interface), src/definition/validate.ts (GATE_TYPE_KEYS, its two
            prose messages, and `distinct`'s own declaration), src/definition/wiring.ts (the reader and
            the derivation), spec/flow-definition.md, test/definition/wiring.test.ts,
            test/definition/gate.test.ts, doc/decisions/0068-*.md,
            examples/l6.ts (the W94 clause — see correction 4; the plan's table says W101)
Inputs:     P25 facts 1-9, RE-RUN here (P15 decision 5) — 89 arcs over 28 flows with 2 `no` and
            all five key variants giving identical counts both reproduce; Q391; ADR 0066 (the
            interface) and ADR 0067 (what a gate does in a run); spec/flow-definition.md v0.24;
            `distinct`'s own `fn`, which is what defines "the key resolved".
Outputs:    (1) `GateType` gains ONE optional member naming the routes on which the key path
                RESOLVED, allowed by GATE_TYPE_KEYS, with `distinct` declaring `['first',
                'duplicate']` — its own `fn` returns `nokey` for every other case
            (2) `WiringRegistry` widened with `gateTypes`, and the gate arc carrying its ROUTE —
                mapped through the type's `defaultRoute` where the edge declares none
            (3) the derivation: on a declared key-resolved route the arrival's schema gains
                `required` along the node's key path, at every step — PRESENCE and not the leaf's
                type, which is type-specific (see *What the member is, and what it is not*)
            (4) the corpus number MOVES: `checkWiring` over `examples/flows` goes from
                **89 arcs / 2 `no`** to **89 / 1**, the survivor `map-no-array`'s deliberate FD-R2
            (5) ADR 0068, and `examples/l6.ts`' W94 clause replaced by its opposite
Depends on: nothing
Blocks:     W100 (the key-path verdict reads the same `gateTypes`), W101 (the session teaches the member)
Tests:      L1 on the member's shape (a type carrying it is accepted; one naming a route it does not
            declare is refused) and L2 on the derivation — the TV arc `fits`, and a control where the
            type declares NO key-resolved route so the same arc is `no` again. Expected values from
            `spec/` and from `distinct`'s `fn`, never from the check's output.
Gate:       L0 (`lint`, five typecheck lanes, each separately); `npm test` (L1-L5, three runtimes);
            `check:spec` (`C4`/`C8` move with the document); `check:docs` (`AGENTS.md`'s `GateType`
            literal is an executed snippet — X3/X4); L6 node and deno, which this item MOVES; then
            `npm run gate` with a content digest identical at both ends.
Reserves:   Q410-Q414, ADR 0068
```

## What the member is, and what it is not

**It names the routes on which the KEY PATH resolved, and the library derives the schema.** Three shapes were
weighed and one is refuted by a fact rather than by taste:

| | Shape | Verdict |
|---|---|---|
| **(A)** | the type names the routes on which the key path resolved; the library composes `required` along the node's own key path | **TAKEN.** It is the only guarantee the LIBRARY computes — P25 fact 9's bound — because the key path is the one thing the driver resolves and hands to `fn` as `ctx.key` |
| **(B)** | the type carries a per-route SCHEMA literal | **REFUTED by a fact**: a `GateType` is registered ONCE per name and the key path is per NODE (`settings.key`), so a literal on the type cannot name `series`. It could only say something the settings do not parameterise |
| **(C)** | the type carries a FUNCTION the check calls with the node's settings, returning a refinement per route | Possible and more general, and what P25 prediction 3's reversal would force. Not taken now: it buys nothing this corpus or `distinct` can express, and the repository's precedent is against speculative generality (P19: *a type-level JSONata interpreter stays refused*) |

**And the guarantee is PRESENCE, not the leaf's TYPE.** `distinct`'s `fn` returns `nokey` unless `ctx.key` is
a string or a finite number, so its `first` route guarantees more than *the path is there*. The library will
not derive that part, because *which leaf values count as a key* is the type's judgement and differs between
types — so the refinement is `required` along the path and the item says so where a reader would otherwise
assume the stronger claim.

## What re-running P25's facts CORRECTED — four things, before any file was edited

1. **`GATE_TYPE_KEYS` is a CLOSED list and `checkGateTypes` refuses an extra key BY NAME** —
   `it carries "…", which a gate type does not declare`. So the new member is not merely added to an
   interface: a consumer's type carrying it is **refused today**, and `src/definition/validate.ts` must be
   edited. **That file is not in P25's seeded exceptions table**, which names `types.ts`, `wiring.ts`, the
   spec, the two suites and the examples — the one file that decides whether the member may exist at all.
2. **The shape is stated in PROSE at two LIVE sites**, both inside `checkGateTypes`' own messages
   (`a gate type is an object { routes, defaultRoute, settingsSchema?, fn }`, twice). Neither is bound to
   `GATE_TYPE_KEYS`, so adding a member leaves two error messages describing an interface that no longer
   exists — `doc/workflow.md` obligation (e)'s THIRD shape, *a list is a claim about another list*, and a
   rule-8 target for this item rather than a thing to notice later.
3. **`distinct.defaultRoute` is `first`, which is a RESOLVED route** — so P25 fact 6's prototype, which
   hard-coded `'(default)'` into the resolved set, was right only because the one type that exists has a
   resolved default. A type whose default is its unresolved route would have been refined wrongly, in
   silence. *That is v0.23's selection clause exactly: the well-formed wrong selection coinciding with the
   right answer at the DEFAULT position.* The shipped reader maps an edge with no `route` through the type's
   `defaultRoute` and then asks, and the suite carries a type whose default is NOT key-resolved.
4. **This item MOVES ladder L6, where P25's table gives `examples/l6.ts` to W101.** Read rather than
   assumed: the cross-row clause compares `rowsWithNo` against
   `['map / FD-R2 …', ...EXPECTED.filter((e) => e.gate).map(…)]`, a literal that names **every gate row** —
   so the moment the TV arc stops being a `no`, that comparison fails. W99's own gate cannot be green
   without replacing the clause, so the clause is W99's. **What W101 then moves at L6 is its own
   artifact's, and P25's row saying *L6 MOVES* there is corrected to say it moves HERE first.**

## Declared exceptions, at the declaration

**[P25](../plans/p25-what-a-route-guarantees-about-the-value-it-carries.md)'s own file**, for corrections 1
and 4: its seeded exceptions table gains `src/definition/validate.ts`, and its work-items row for W101
is corrected where it gives `examples/l6.ts` and *L6 MOVES* to that item. A plan is on nobody's `Owns`
once declared, and leaving the row would hand W101 a file this item must edit for its own gate to be
green — which is `doc/workflow.md` v0.7 change 3's argument in the directory it does not cover.

## Scope

**In**

1. Outputs (1)-(5).
2. The two prose messages of correction 2, bound to `GATE_TYPE_KEYS` rather than restated.
3. A second gate type in the suite whose `defaultRoute` is its UNRESOLVED route — correction 3's
   discriminating fixture, without which the default-route mapping is asserted by nothing.

**Out** — named rather than left implicit, with where it goes instead

- **The key-path verdict** (P25 fact 7) — W100's, and it reads the same widened `WiringRegistry` this item
  ships, which is why the two are serial rather than parallel.
- **The authoring session** — W101's. This item teaches the member nowhere a consumer reads except the
  interface's own doc comment and the spec.
- **Shape (C)**, the function form: named above with what would force it.
- **A leaf-type refinement**: the type's judgement, not the library's, stated above.
- **[Q405](../open-questions.md), [Q406](../open-questions.md), [Q407](../open-questions.md)** — none is
  about a route.

## Verification

How each clause of `Gate:` is actually run. Every rung RUN, never piped, and its exit code read
(`doc/workflow.md` section 4).

| Clause | How |
|---|---|
| L0 | `npm run lint`, then each of the five typecheck lanes SEPARATELY — `npm run typecheck` is five lanes chained by `&&` and a chained rung reports its FIRST failure only (P20's declaration) |
| `npm test` | L1-L5 in three runtimes; the new L1/L2 cases are in `test/definition/wiring.test.ts` and `test/definition/gate.test.ts` |
| `check:spec` | `C2` (the guarantee's rule id cited where it is declared), `C4` (the document's own counts), `C8` (`spec/README.md`'s version column) |
| `check:docs` | `X3`/`X4` over `AGENTS.md`'s `GateType` literal — an OPTIONAL member must leave that snippet compiling and executing unchanged, which is the additive claim's one executed observer |
| L6 node / deno | RUN in both; this item moves the W94 clause and must leave every count it does not claim unmoved |
| conformity reader | in an isolated copy, spec first: derive every verdict of the TV flow and of the suite's second type ON PAPER before reading output |
| adequacy reader | in an isolated copy: the member deletable, the default-route mapping narrowed, the derivation's `required` walk truncated to one step (correction 3's shape one level in), the corpus number's literal |
| rule 8 | obligations (a)-(f), with the harness carrying its control, its two GRADER controls (v0.24), per-edit anchors and a content digest |

*Routing cases this item covers:* none of Q4, Q17, Q10, Q13 or Q6 — it changes a static check and one
interface, and dispatches nothing. **Q391 is the case it exists for**, and L6 is where the answer is observed
on real workers.

## Record

*Filled in when the item is done.*
