# W153 — a gate type's routes may come from its NODE

**Status:** done 2026-10-13 — implemented on `5adf7ec`; both reader passes RUN and their eight items acted on (Record); declared 2026-10-13 on `06a45ca`; declaration step RUN the same day, its findings below, written before any `src/` edit. stop-and-asks (e), (e′), (f), (g) and (h) answered YES 2026-10-13 and acted on (Exceptions); **`npm run gate:item` EXIT 0** on the final tree, after the reader items
**Plan:** [P32](../plans/p32-what-a-gate-may-decide-without-memory.md) — *may a gate decide by a
declared condition or a declared value table, without memory?* — and this is its FIRST item: the
interface, not the built-ins.

```
Spec:       spec/flow-definition.md — section 2's gate subsection, section 3's "Gate types" table,
            FD-V39/FD-V40/FD-V41/FD-R5's rows; spec/README.md's row for the new version.
Owns:       src/definition/types.ts, src/definition/validate.ts, src/definition/wiring.ts,
            src/driver/driver.ts, src/driver/routing.ts, spec/flow-definition.md, spec/README.md,
            AGENTS.md (its GateType sections only), test/definition/gate.test.ts,
            test/definition/wiring.test.ts,
            test/driver/gate.test.ts, doc/decisions/0092-*;
            and by the Exceptions below (2026-10-13): test/driver/retention.test.ts,
            test/definition/l4-corpus.test.ts, examples/l6.ts (the driver-field census at :10826
            and `skipped` at :10839 only), src/definition/registry.ts (the GateTypeRefused comment
            only), AGENTS.md section 3's gate row (one line)
Inputs:     P32 decisions 1-3 and 7, stop-and-asks (a) and (d) ANSWERED 2026-10-13 as recommended;
            P32 facts 1-3, RE-RUN at this item's declaration step, never transcribed (P15 decision 5);
            ADR 0066 rules 1, 2 and 4 (what is amended); ADR 0067 (a gate runs in the driver and its
            decision is recorded); ADR 0068 (keyResolvedRoutes); ADR 0053 (why the subset cannot
            check a grammar).
Outputs:    (1) ADR 0092 — a gate type's routes are declared STATICALLY or DERIVED from its node's
                settings, exactly one of the two; a gate is a node that routes by a registered
                type, and memory is something a type MAY use. Amends ADR 0066 rules 1 and 2.
            (2) `GateType` becomes `StaticGateType | DerivedGateType` — the second carries
                `routesFor(settings) => { routes, defaultRoute, keyResolvedRoutes? }` IN PLACE of the
                three static members — and both may carry `settingsProblem(settings) => string | null`;
                `distinct` is declared `StaticGateType` (the declaration step, re-take 1)
            (3) `gateTypeProblem` refuses a type carrying both static routes and `routesFor`, and one
                carrying neither — FD-V39
            (4) ONE function, `routesOf(type, settings)`, resolving a gate's route set once at
                instantiation (after FD-V40 passed), held to gateTypeProblem's existing route clauses;
                a `routesFor` that throws or returns a malformed set is refused at the GATE, FD-V39
            (5) every reader of P32 fact 2 — FD-V41's count, FD-R5's undeclared-route stop, `gateEdge`'s
                default, the wiring check's default and keyResolvedRoutes — reads the RESOLVED set
            (6) `settingsProblem` run by FD-V40 after the settingsSchema, its message reported under it
            (7) spec/flow-definition.md's version, its rows, and AGENTS.md's GateType text and snippets
Depends on: nothing
Blocks:     W154
Tests:      L1 `test/definition/gate.test.ts` — each new gateTypeProblem clause with its accepted
            neighbour; a derived-route type whose routes differ per NODE, FD-V41 counting each
            gate against its own set (a route wired on gate A and missing on gate B refused at B
            alone); `routesFor` throwing and returning a malformed set; `settingsProblem` refusing
            and passing. Expected values from the spec text, never from the validator's output.
            L2 `test/driver/gate.test.ts` — one run routing on a derived route, its default by an edge
            with no `route`, and FD-R5 on a route outside the NODE's set that IS inside another node's.
            `test/definition/wiring.test.ts` — the two sites the compiler cannot see (re-take 1):
            a derived-route type's default edge and keyResolvedRoutes read off the NODE's set.
            `distinct`'s suites UNMOVED: no existing assertion edited.
Gate:       `npm run gate:item` (doc/workflow.md v0.26 / v0.29); then the conformity reader and the
            adequacy reader, workflow section 6.
Reserves:   Q584-Q588, ADR 0092
```

*Reserves derived by `npm run state` at P32's declaration: the tree's next free question is **Q584**,
P32 having raised Q582 and Q583; P32 reserved ADR 0092-0093 and this item takes **0092**.*

**Exceptions** — the stop-and-asks the Record names, **answered YES by the maintainer 2026-10-13** and
recorded here BEFORE the edits (`doc/workflow.md` section 1 rule 6). Each is a ratchet or a stale sentence
that this item's correct change turns red or leaves false:

| | file | the edit, and nothing else |
|---|---|---|
| **(e)** | `test/driver/retention.test.ts` | `'gateRoutes'` in `DRIVER_FIELDS` — `RN-R13`'s field census, which fires for the driver's per-gate route cache (re-take 2) |
| **(e′)** | `examples/l6.ts` | `'gateRoutes'` in the cross-row field list (`:10826`). **Not in `skipped` (`:10839`), against the answer's wording**: what that clause compares to is `examples/run-flow.ts:1566`'s `NOT_RUN_STATE`, a file outside both `Owns` and the YES, so `gateRoutes` is WALKED there and in `retention.test.ts` alike. That is stop-and-ask (i) |
| **(f)** | `src/definition/registry.ts` | `GateTypeRefused`'s doc comment: the interface's seven members and the exactly-one rule |
| **(g)** | `test/definition/l4-corpus.test.ts` | the three `W153 — …` suite names in `LATE_SUITES` |
| **(h)** | `AGENTS.md` | section 3's `gate` row: drop *Not run by any driver yet*, stale since W93 — one line. **Widened by the maintainer 2026-10-13 (reader item C7)** to the whole row: it names `settingsProblem`'s refusal (`FD-V40`) and `routesFor`'s defects (`FD-V39`) |

**The reader passes' eight items — acting on all of them APPROVED by the maintainer on 2026-10-13**, recorded here
before the edits. One constraint: **no fix may add work to the per-decision path** (`decideGate`, the gate arm of
`enter`, `FD-R5`'s check). Every fix stays at instantiation or on an error path.

| | finding | the fix, within `Owns` |
|---|---|---|
| 1 | conformity C1: `routesOf` and the validator's gate messages `JSON.stringify` whatever a type returned, so a BigInt or a cycle throws out of `validateDefinition`, `new Driver` and `checkWiring` | one describe helper that cannot throw, for every value a gate message describes |
| 2 | adequacy reader: 14 test gaps (M07, M08, M09, M11, M27/M60, M30, M31, M32, M36/M43/M46, M45, M51/M52, M58, M63) | one assertion per gap, each re-run against its mutant |
| 3 | conformity C2: the settings were cloned inside `routesFor`'s and `settingsProblem`'s `try`, so uncloneable settings were blamed on the TYPE | clone BEFORE the call; a clone failure is the SETTINGS', `FD-V40` |
| 4 | conformity C3 + C4: spec wording | the wiring check resolves over the settings as given; a THROWING `settingsProblem` blocks resolution too |
| 5 | conformity C5: `settingsProblem` returning `''` gave a message ending in nothing | stays `FD-V40`, and the message says the type returned an empty message |
| 6 | conformity C6: `FD-V41` named routes a TYPE declares | message text names this gate's routes |
| 7 | conformity C7 | (h) above, widened |
| 8 | the Record | the stale (e′) cell; Output (5)'s pinning claim, which was false of `boundaryEdges` until item 2's entry test |

*Outputs (4) read `routesOf(gate, type)` until this note; the re-takes and the code have `routesOf(type, settings)`,
and it is corrected in place. P32's own text is the coordinator's to correct.*

## Scope

**In**

1. **The interface** — Outputs (2)-(3): the two optional members and the exactly-one rule.
2. **The resolution** — Outputs (4)-(5): one function between every reader and the type.
3. **The settings hook** — Outputs (6).
4. **The record** — ADR 0092, the spec rows, `AGENTS.md`'s `GateType` text.

**Out** — named rather than left implicit, with where it goes instead

- **The built-in `if` and `switch`** — **W154**. This item ships the road; a test type derived per
  node stands in for them, registered through the public interface as a consumer's would be.
- **Any change to `distinct`** — it keeps its static routes, byte-identical.
- **An `input` root for a declared comparison** (P32 fact 4) — **W154**, which is the only reader.
- **The exit artifact** — **W155**.

## What the declaration step must re-take before anything is edited

*P15 decision 5: every fact is re-run by the item that acts on it.*

| # | re-take | against |
|---|---|---|
| 1 | P32 fact 2: every read of `routes`, `defaultRoute` and `keyResolvedRoutes` in `src/`, by grep and by making `routes` optional and counting the typecheck errors across the five lanes, each run separately | the ten sites P32 names (it said nine, and counted ten) — an eleventh is this item's |
| 2 | where a gate's type is resolved at instantiation and whether the driver re-resolves it, or reads the validator's | whether `routesOf` is computed once or twice per gate, and if twice, whether both can disagree |
| 3 | `checkRegistry`'s `GateTypeRefused` road: is a type held to `gateTypeProblem` before any node names it | whether a `routesFor` defect can be refused at the REGISTRY (no settings yet) or only at the gate |
| 4 | the ladder counts — L1-L5 cases in three runtimes, L6 assertions and runs | the baseline P32 did not take |

## What the re-takes found — RUN 2026-10-13 on `06a45ca`, before any `src/` edit

*The tree carried P32, Q582, Q583 and this file uncommitted, all under `doc/`; nothing under `src/`,
`test/`, `spec/` or `examples/` differed from `06a45ca`.*

**Re-take 1 — the TEN sites CONFIRMED by grep, and the compiler names EIGHT of them.** P32 fact 2
said *nine* and listed ten; the plan is corrected in place. Making `routes` and `defaultRoute` optional
in `src/definition/types.ts` and running each lane SEPARATELY gave **9 errors in every lane** (two on
one line) at `validate.ts` 1025, 1031, 1032, 1035 and `driver.ts` 2563, 2569, 2698, 2713 — then the file
was restored from `git` and `git diff` was empty. **Two consequences, and both change Outputs:**

| finding | consequence |
|---|---|
| **`wiring.ts:384` and `:567` raise NOTHING** — both already read through `?.`, so `undefined` is a type they accept | the compiler will not find a wiring site left reading the TYPE. **Each is bound by a TEST**: a derived-route type through `checkWiring`, its default edge resolved to the NODE's default (`:384`) and its `keyResolvedRoutes` read off the node's set (`:567`) — with the route NAMES chosen so a type-level read gives a different verdict |
| **three reads outside `src/`** — `test/definition/gate.test.ts` 252 and 520, and **`examples/l6.ts` 8915**, which reads `distinct.routes` and is OUTSIDE this item's `Owns` | Outputs (2) is a UNION, not two optional members: `GateType = StaticGateType \| DerivedGateType`, and `distinct` is declared `StaticGateType`, so `distinct.routes` stays a `readonly string[]` and `examples/l6.ts` is not edited. *Predicted, confirmed by the gate:* `AGENTS.md`'s two snippets (`sloppy: GateType = { routes, defaultRoute, fn }` and `noGuarantee as GateType`) typecheck unchanged under `check:docs` |

**Re-take 2 — the type is resolved in THREE places, independently, and the driver re-resolves on
EVERY decision.** `validateDefinition` per gate (`FD-V39`-`FD-V41`); `Driver` via `gateTypesOf` at
construction (`driver.ts:1315`) and then `this.gateTypes.get(node.type)` inside `decideGate`
(`driver.ts:2681`) at every arrival and once more for an entry gate's `FD-R4` road; and `checkWiring`
via its own `gateTypesOf` (`wiring.ts:762`), **which does not run the validator first**. So:

- `routesOf(type, settings)` is ONE exported function, PURE and TOTAL — it returns a route set or a
  problem, catches a throwing `routesFor`, and hands `routesFor` a COPY of the settings.
- The **validator** reports its problem as `FD-V39` at the gate. The **driver** calls it once per gate
  at construction, after `validateDefinition` passed, and `decideGate` reads that cache — so within one
  run the route set has ONE answer, and a resume (a new driver) recomputes it from the same settings by
  the same function. The **wiring check** treats a problem as it treats an unknown type today: no
  default, no guarantee, the arcs reported as they are.
- **Can the two computations disagree?** Only for a `routesFor` that is not a pure function of its
  settings, which the interface requires it to be (Q9's demand of every decision). The driver's cache
  removes the disagreement WITHIN a run; one between validation and the run is the impure type's, and
  is stated in ADR 0092 rather than checked.

**Re-take 3 — every registered type is held BEFORE any node names it.** `checkRegistry` →
`checkGateTypes` runs `gateTypeProblem` over every entry, the built-ins included (`registry.ts:510`),
in every `new Driver` (`driver.ts:1305`) and in the runtime (`runtime.ts:415`). So **the exactly-one
rule — static routes or `routesFor`, never both, never neither — is refused at the REGISTRY** as
`GateTypeRefused`, and at the gate as `FD-V39` for a definition validated without one. **What
`routesFor` RETURNS can only be held at the gate**, because only a node has settings: `FD-V39`, through
`gateTypeProblem`'s existing route clauses applied to the returned set.

**Re-take 4 — the baseline.** `npm run gate` **EXIT 0** in 2m40s, node 24.20.0, deno 2.9.6:

| rung | count |
|---|---|
| L1-L5 | **56 files / 1593 cases**, identical in node, deno and chromium |
| L6 | **2487 assertions / 164 real runs**, in node and in deno |
| `check:spec` | 7 documents / 72 examples / 132 rules |

## Verification

`npm run gate:item`, then the two readers. **Routing coverage**: a branch routed away from its join
(Q4) — not applicable, a gate's out-arcs are unchanged in kind; `user_action` (Q17) — not applicable,
a gate never settles; no matching decision edge (Q10) — FD-R5's road is in Tests; a duplicate task id
(Q13) — not applicable, a gate has no task id; a nested fan-out (Q6) — not applicable.

## Record

*Written 2026-10-13 on `5adf7ec` with the item's changes UNCOMMITTED. The reader passes have not run.*

**The stop-and-asks, all outside `Owns`. (e), (e′), (f) and (g) were answered YES by the maintainer on 2026-10-13, with (h) added, and are recorded in Exceptions above. (i) was answered by the maintainer the same day — LEFT WALKED, as recommended, so no edit follows from it:**

| | the question | measured | recommended |
|---|---|---|---|
| **(e)** | may W153 widen `Owns` to `test/driver/retention.test.ts`, to add `gateRoutes` to `DRIVER_FIELDS`? | `npm test` on this tree: **1 failure**, `ADR 0046 / RN-R13 — … a new driver field fails here naming itself`, actual list = expected + `gateRoutes`. That list is `RN-R13`'s ratchet, written to fire on any new `Driver` field (W73, W88, W89, W93, W151 each added theirs). The field is re-take 2's per-gate cache, which this item declared | YES: one line, `'gateRoutes'` with a W153 comment — configuration derived from the definition, constant in the task count, no result. Walked or in `NOT_RUN_STATE` beside `gateTypes`; only `DRIVER_FIELDS` is red |
| **(e')** | (e)'s second site: `examples/l6.ts`, outside `Owns` and declared untouched by re-take 1 | `test:l6` and `test:l6:deno`: **2487 assertions, 1 failed** in each, the `cross-row` clause *the two lists account for the driver's own fields, both ways* (`examples/l6.ts:10826` and `:10839`). Same list, same `gateRoutes` | YES with (e): `'gateRoutes'` in the field list (`:10826`) and nothing in `skipped`, WALKED as in `retention.test.ts`. *(This cell first recommended `skipped` too. That needs `examples/run-flow.ts:1566`, outside the YES; (i) below, corrected by reader item 8.)* The alternative is a driver with no cache, which is re-take 2's design reversed, or the cache hidden inside an existing field, which dodges a ratchet that exists to name exactly this |
| **(g)** | may W153 widen `Owns` to `test/definition/l4-corpus.test.ts`, to name its three new suites in the L1 suite census? | `npm test`: `L1 — every suite this tree declares actually RAN › the declared suite names are present`. Actual lists the three `W153 — …` suites, and its message reads *Add it here in the same commit — the ratchet is deliberate*. The declaration's Tests line named the three files and not the census | YES: three names |
| **(i)** | (e′)'s answer said *and in `skipped` beside `gateTypes`*. Should `gateRoutes` be SKIPPED rather than WALKED? | `examples/l6.ts:10839` compares `retention.skipped` to a literal, and `skipped` is computed from `examples/run-flow.ts:1566`'s `NOT_RUN_STATE`, a file outside `Owns` and outside the YES. Editing `:10839` alone turns the clause red | **Left WALKED**, in `l6.ts` and `retention.test.ts` alike (nothing in `NOT_RUN_STATE` there either). Walking a structure that holds no result costs nothing. To SKIP it, widen to `run-flow.ts:1566` and `retention.test.ts:172`'s `NOT_RUN_STATE`, one name each |
| **(f)** | may W153 widen `Owns` to `src/definition/registry.ts`, comment only? | `GateTypeRefused`'s doc comment (`registry.ts:86-90`) lists *a key beside the interface's five* and the v0.25 clauses. With ADR 0092 that is seven, plus the exactly-one rule. The class and `checkGateTypes` need no code change, since they call `gateTypeProblem` | YES, comment only. The spec's `GateTypeRefused` row, which this item owns, already reads seven |

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate:item` — after the reader items | **RAN, EXIT 0**, on the final tree with the tree held still | L1-L5 **56 files / 1617 cases in node 24.20.0, deno 2.9.6 and chromium**, against a baseline of 56 / 1593 (+24: the 14 below, plus 10 from the reader items — 6 L1, 2 L2, 2 wiring). L6 **2487 / 164, 0 failed, in node and deno**, unmoved. `check:spec` **7 / 72 / 132**, unmoved. Self-tests 10 of 10 ok, 1229.5 s wall, `check:register:selftest` left out by design |
| `npm run gate:item` — before the reader items | **RAN, EXIT 0**, on the tree after the Exceptions' edits, with the tree held still | L1-L5 **56 files / 1607 cases in node 24.20.0, deno 2.9.6 and chromium**, against a baseline of 56 / 1593 (+14: 7 L1, 4 L2, 3 wiring). L6 **2487 assertions / 164 real runs, 0 failed, in node and deno**, unmoved. `check:spec` **7 / 72 / 132**, unmoved. Self-tests: 10 of 10 ok, 834.6 s wall, `check:register:selftest` left out by design |
| L0-L6 lane by lane, BEFORE the Exceptions | RAN | the table below: what made (e), (e′) and (g) stop-and-asks. Superseded by the row above |
| W153's own provocations | RAN, 15 of 15 RED, 3 controls green | each one reverts or narrows one clause and runs the suite file it names. Every edit was checked to change its file, and every file was restored and its digest compared. Listed below |
| `check:docs` provocation on the new AGENTS.md lines | RAN, RED | `forgot.length !== 1` → `!== 2`: `X4: AGENTS.md:3303 — the snippet does not run … the unwired case is refused at load`. Restored |
| conformity reader | RAN 2026-10-13, fresh context, worktree `C:/tmp-w153/rc` on `5adf7ec` plus this item's diff, spec first and expected values written before the code was opened; three constructed probes, nothing edited | **1 should-fix and 7 notes.** C1 *routesOf is not total*: messages ran `JSON.stringify` over what a type returned, so a BigInt or a circular value threw a raw `TypeError` out of `validateDefinition`, `new Driver` and `checkWiring`, against ADR 0092 rule 3's *never throws* — **Output (4)'s "total" was FALSE**. C2 uncloneable settings blamed on the type; C3 the wiring check resolves over settings `FD-V40` would refuse, where the spec said *once FD-V40 found nothing*; C4 a throwing `settingsProblem` blocking resolution, unstated; C5 an empty message; C6 `FD-V41`'s wording; C7 AGENTS.md section 3's gate row; C8 `routesOf`'s static/derived asymmetry over non-object settings (unreachable from the validator and driver; no change). Confirmed TRUE: Outputs (2), (3), (5), (6), the Exceptions' diffs and four of the five undeclared choices. C1-C7 acted on (the reader items table below) |
| adequacy reader | RAN 2026-10-13, fresh context, worktree `C:/tmp-w153/ra`, spec first then tests, mutations walked by rule id, every file restored by sha256 | **63 mutations, 44 killed, 19 survived: 14 real gaps, 5 equivalent** (M16 message wording; M38, M56 a static type's members equal its resolved set; M44 a stored problem reads as nothing stored; M53 reachable only by an impure `routesFor`). The gaps sat where the author's 15 provocations never reached: `boundaryEdges`' entry walk (M51, M52 — so Output (5)'s *pinned* was overstated), `{}` when absent (M36, M43, M46), the copies (M27, M58, M60), `settingsProblem`'s `undefined` and `''` (M30, M31), the exactly-one rule's other members on a derived type (M07, M08, M09), a VACUOUS routesOf case (M11), the wiring check per gate (M45), M63 and M32. Its results agree with all 15 provocations. Each gap killed by a new assertion (item 2 below) |
| reader overlap | **3** shared subjects | C4/M32 (a throwing `settingsProblem`), C5/M31 (the empty message), C8/M11 (non-object settings to `routesOf`) — inside section 6's 0-4 band, with the two briefs deliberately differed (only the conformity reader was handed the author's undeclared choices) |

**The lanes**, against the baseline (L1-L5 56 / 1593 in node, deno and chromium; L6 2487 / 164 in node and deno;
`check:spec` 7 / 72 / 132):

| lane | EXIT | count | red on |
|---|---|---|---|
| `lint`, `typecheck` (five lanes), `check:scheduler`, `check:policies`, `check:source`, `check:markdown`, `check:wiring`, `check:workers`, `check:docs`, `check:budget`, `check:register` | 0 each | `check:docs`: 40 snippets, 34 run, 6 check | — |
| `check:spec` | 0 | **7 / 72 / 132**, C4 42 refusals — unmoved | — |
| `test` (node 24.20.0) | **1** | **56 files / 1607 cases** (+14: 7 L1, 4 L2, 3 wiring) | (e) and (g) only |
| `test:deno` (2.9.6) | **1** | 56 / 1607 | (e) and (g) only |
| `test:browser` | **1** | **NOT RUN in chromium**: the script's Node baseline exited 1 on (e) and (g), so no browser started | — |
| `test:l6` (node) | **1** | 2487 assertions / 164 real runs, **1 failed** | (e'), the cross-row census |
| `test:l6:deno` | **1** | 2487 / 164, **1 failed** | (e'), the same |

**W153's provocations** (a scratch harness outside the tree. **Not checked in**: these test the item's tests, not
a new check. Section 5 rule 7 does not apply, and the adequacy reader's mutations replace them):

| probe | the clause it narrows | RED in |
|---|---|---|
| W1 | `wiring.ts` default read off the TYPE (`:384`'s old reading) | both default and `keyResolvedRoutes` cases, wiring suite |
| W2 | `wiring.ts` `keyResolvedRoutes` read off the TYPE (`:567`'s old reading) | both, wiring suite |
| D1 | `FD-R5` held to every gate's routes together | the `FD-R5` case, L2 |
| D2 | the default edge read off the TYPE | the derived-route run, L2 |
| D3 | `routesFor` asked per decision instead of the construction cache | the once-per-gate case, L2 |
| V1 | `FD-V41` skipping a derived type (no per-gate set) | 4 L1 cases |
| V2 | `routesFor` asked over refused settings | 2 L1 cases |
| V3 | `settingsProblem` asked over schema-refused settings | the `settingsProblem` case |
| V4 | `settingsProblem`'s message under `FD-V39` | 2 L1 cases |
| V5 | a throwing `settingsProblem` under `FD-V40` | the `settingsProblem` case |
| V6 | both route forms accepted | the exactly-one case |
| V7 | neither form left to `routes`' own clause | the exactly-one case |
| V8 | `routesFor` handed the settings themselves | 3 L1 cases |
| V9 | a key beside the three accepted in a derived set | the malformed-set case |
| V10 | the resolved set not copied | the `routesOf` case |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) ADR 0092 | yes, `doc/decisions/0092-a-gate-types-routes-are-declared-statically-or-derived-from-its-node.md`, amending ADR 0066 rules 1 and 2 (whose header now says so) | `check:spec` `C5` on the spec's four links and the README's one, and `check:register` `R6`-`R7` |
| (2) `GateType = StaticGateType \| DerivedGateType`, `routesFor`, `settingsProblem`, `distinct` static | yes, `src/definition/types.ts`, `validate.ts` | the typecheck of the new suites (`byCases`, `colour` and `byNode` are typed `GateType` with no `routes`), and the spec-table case in W92's suite, which compares `GATE_TYPE_KEYS` to section 3's table both ways (it went red at the first run, before the spec rows were written) |
| (3) `gateTypeProblem` refuses both and neither | yes | probes V6 and V7 |
| (4) `routesOf`, one function, total | yes, exported from `validate.ts` and so from `index.ts` | the `routesOf` case; probes V8-V10 |
| (5) every reader reads the resolved set | yes: validator `FD-V41`, driver `decideGate`, the gate arm and `boundaryEdges` through a per-gate cache built at construction, and wiring's two sites | probes V1, D1-D3, W1, W2, and M51/M52 for `boundaryEdges`. **This cell claimed every reader was pinned, and `boundaryEdges` was NOT** until the derived-ENTRY-gate case reader item 2 added (the adequacy reader's M51/M52; corrected by reader item 8) |
| (6) `settingsProblem` run by `FD-V40` | yes | probes V3-V5 |
| (7) spec version, rows, AGENTS.md | yes. `spec/flow-definition.md` **v0.30**: the paragraph, section 2's gate subsection, section 3's *Gate types* table and `GateTypeRefused` row, `FD-V39`/`FD-V40`/`FD-V41`/`FD-R5`. `spec/README.md`'s row and version column. AGENTS.md section 19: a bullet, plus lines appended to its existing `run` snippet | `check:spec` `C8` on the version column; the AGENTS.md provocation above |

**The reader passes' eight items — acted on, 2026-10-13** (Exceptions above).

| item | what changed | its mutant, run against the suite named — RED in every row |
|---|---|---|
| 1 C1 | `describeValue`/`describeThrown` in `validate.ts`, used by every gate-type message: `routeSetProblem`, `gateTypeProblem`, `routesOf`, the gate's `FD-V40` and `settingsProblem` findings | C1 (`describeValue` reverted to `JSON.stringify`): the *nothing … makes validation THROW* case |
| 2 | 14 gaps, one assertion or case each | M07, M08, M09: the `gateTypeProblem` case. M11: the THROW case, after the vacuous `echo` settings rows were deleted. M27/M60, M58: the COPY case (M58 in 4 cases). M30, M31: the undefined/empty case. M32, M63: the key-refusal/throw case. M36, M46: the wiring no-settings case. M43: the L2 no-settings case. M45: the wiring two-defaults case. M51, M52: the L2 derived-ENTRY case |
| 3 C2 | the settings are cloned BEFORE `routesFor`/`settingsProblem`, outside their `try`. The validator refuses settings that cannot be copied as `FD-V40`, only for a type carrying either member | C2 (copy check removed): the uncopyable-settings case |
| 4 C3 + C4 | the spec's gate subsection, `routesFor` and `settingsProblem` rows, and `FD-V40`/`FD-V41` rows; ADR 0092 rules 3 and 4 | M32's case pins (b) |
| 5 C5 | `''` stays `FD-V40`, and its message says *it returned an EMPTY message* | C5: the undefined/empty case |
| 6 C6 | `FD-V41`'s three messages name *this gate's routes* | message text. Existing assertions match `"green"`, `has no edge`, `2 edges` and all still hold |
| 7 C7 | AGENTS.md section 3's gate row names `routesFor`'s and `settingsProblem`'s refusals | `check:docs` |
| 8 | the (e′) cell and Output (5)'s claim, both corrected in place above | — |

19 mutants, all RED, plus 3 controls green. M36 was first run against `definition/gate`, where it SURVIVED because its case lives in the wiring suite; re-run against `definition/wiring`, it is RED. Every edit was checked to change its file, and every file was restored and its digest compared.

**The per-decision path is UNCHANGED — the maintainer's constraint.** Per decision, `decideGate` still does exactly
what it did at the gate:item before the reader items. It reads the type from `gateTypes` and the settings off the
node. It clones the value and the settings and resolves the key. It calls `fn` in a `try`. Then it does ONE
`Map.get` of the gate's cached set and one `includes`. The gate arm still does one `gateEdge` over the cached
default. `git diff` of `driver.ts` across the reader items is empty: every reader-item change is in `validate.ts`,
at instantiation or on an error path (a message being built). Against the baseline `5adf7ec`, the per-decision
path differs by that `Map.get` in place of reading `type.routes`/`type.defaultRoute`. That is W153's own design,
re-take 2.

**What broke.** Two things, both measured on the first `npm test` run.

1. W92's spec-table case went red. That was expected: the code list grew before the spec table did, and the
   case went green with no assertion edited once the rows were written.
2. **`RN-R13`'s driver-field ratchet went red, as it was designed to.** That is stop-and-ask (e).

Nothing else in L1-L5 moved. **`distinct`'s suites are UNMOVED, with no existing assertion edited.** The new
cases sit in three NEW suites (`W153 — …`), each with its own membership case, so W93's `DECLARED_CASES.length
=== 20` and W92's list were not touched. **W99's shape-message assertion constrained one choice.** It holds
the message's `{ … }` to exactly `GATE_TYPE_KEYS` and holds `routes`, `defaultRoute` and `fn` to no `?`. So
`routesFor` is printed bare as well, and the message states the two forms in words after the brace (ADR 0092
Consequences).

**Choices made inside the declaration and not named by it**, listed so the conformity reader can check them:

1. `routesOf`'s problem is `{ problem: string }`. The resolved set has no exported type name: it is
   `Pick<StaticGateType, …>`, so no new public name was added.
2. A derived set carrying a key beside the three is a malformed set. This mirrors `gateTypeProblem`'s
   extra-key clause.
3. `settingsProblem` runs only once the schema accepted the settings. A message from it is `FD-V40`. A throw,
   or a return that is neither a string nor `null`, is `FD-V39`.
4. A derived type's gate is not counted by `FD-V41` when `FD-V40` refused its settings, the key grammar
   included. A static type's gates are counted as before.
5. `routesOf` refuses settings that are not a plain object.

**What this taught.** Nothing about the method yet. The readers have not run.

**Questions raised.** None. Q584-Q588 unused. (e), (e′), (f), (g), (h) and (i) are ASKED rather than raised
(`doc/workflow.md` section 1 rule 6).
