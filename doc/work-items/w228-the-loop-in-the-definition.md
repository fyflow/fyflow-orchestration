# W228 — the `loop` node kind in the definition: its keys, its refusals, the schema and the wiring check's arcs

**Status:** done 2026-11-14 — **`npm run gate:item` EXIT 0** on the final tree, its SECOND run (the first RED at R8, below);
declared 2026-11-14 on `df60b9e`, built on `d935d4f`; both readers RAN and acted on; four spec answers from the maintainer
((a1), (b1), (c1), (d1)); Q810 resolved, declined
**Plan:** [P47](../plans/p47-what-may-repeat-in-a-flow-and-how-a-round-hands-on-to-the-next.md) — its first item.

```
Spec:       spec/flow-definition.md: section 2 gains `loop` (its keys, what it receives, what its entry may be);
            section 3's `needs` table gains "$iteration" and the fifth arc of "."; section 4 states a loop region
            with the four sets and what does NOT change (P47 fact 12, re-taken as a real loop); section 5 gains the
            refusals below. spec/task-id.md section 1: a round's index is a DISPATCH-side segment, as a map
            instance's is (ID-R6 widened to a loop). Changed FIRST, as its own edit with its rationale.
Owns:       spec/flow-definition.md, spec/task-id.md, src/definition/** (types, validate, regions, wiring,
            definition-schema, witness as needed), test/definition/**, spec/examples/valid/ and
            spec/examples/invalid/ loop fixtures, doc/decisions/0145-*.md
Inputs:     P47 decisions 1, 4, 5 (the `until` comparison), 6; facts 12-16
Outputs:    (1) `kind: "loop"` with `branch` (required; a `task` or an `ask`), `until` (required; a comparison from
                the declared subset over the ONE root `input`, GATE_SCOPE's), `maxIterations` (required; integer
                >= 1), `maxIterationsFrom` (optional; FD-V16-charset key path), `needs` (optional; the seed); no
                `edges`. Its join is an ordinary `join` with `of`.
            (2) a reference from OUTSIDE a loop to a node of its body, at both sites fact 14 names (node `needs`,
                edge `needs`), read as after a map (decision 1 (b′)): the fact 13 document GREEN for a loop as for a
                map, its singular twin RED by FD-V28 for both. ADR 0044's reading of an instance that did not reach
                the node is CONFIRMED against the code before the spec is written — a stop-and-ask if it does not
                leave that instance out.
            (2a) refusals, each its own FD-V with a failing fixture: `maxIterations` absent or not an integer >= 1;
                "$iteration" where no loop contains the reader (FD-V49's pattern); `until` outside the subset or
                off the `input` root (the existing comparison rules, at a new site).
            (3) regions.ts: a loop is a region opener whose branch index is a property of the dispatch;
                branchPathOf refuses without a round index (ID-R6 widened).
            (4) wiring.ts: E's inputSchema held against the loop's value (its `needs`, or what reached it) AND
                against the output of EVERY body node with an edge to the loop's join — one arc each, naming its
                producer.
            (5) definitionSchema and definitionSchema(registry) carry the kind and its keys.
            (6) Q810 decided: a constant in `needs` accepted with its grammar, or declined with the transforming
                node as the stated form.
            (7) ADR 0145: a loop is a region that runs its one branch sequentially, read from outside as a map is,
                its join value its state — P47 decisions 1-5.
Depends on: nothing
Blocks:     W229
Tests:      L1/L3/L4 suites: each refusal by rule id and subject; the fact 13 document and its singular twin, each
            for a loop and a map; every acceptance
            (a training-shaped and a polling-shaped loop; a map inside a loop; a loop inside a map instance; a loop
            inside a loop); branchPathOf with and without a round index; each wiring arc, matching and mismatching,
            naming its producer; the schema accepting and refusing the same corpus as validateDefinition on the
            shape it can carry. Expected values from the spec text written FIRST, not from output.
Gate:       `npm run gate` before the readers; conformity and adequacy readers; `npm run gate:item` once on the
            final tree.
Reserves:   Q811-Q813, ADR 0145-0146
```

## Scope

**In**

1. Everything on the `Outputs:` line.
2. The two spike documents of P47 facts 12-13, rewritten as real `loop` fixtures in `spec/examples/`.

**Out** — named rather than left implicit, with where it goes instead

- What a run DOES with a loop — opening, carrying, deciding, the join value, the rounds a reader outside receives,
  `maxIterationsFrom`'s run-time refusal: W229.
- A `map` or `fanout` as a loop's entry; `onLost`; `delayMs`: P47 *Out*.
- `AGENTS.md`: W230, once the run-time behaviour exists to document.

## Exceptions — files outside `Owns`

*Declared before each edit. The four driver suites and `examples/l6.ts` were asked of the maintainer (2026-11-14, (a),
`doc/workflow.md` section 1 rule 6) when the first ladder run went red on them.*

| file | why | predicted? |
|---|---|---|
| `src/driver/driver.ts` | `enter`'s default arm asserts `LoopNode` rather than `never`, so a loop is REPORTED `InvalidDefinition` (W32's precedent for `map`) and any other unhandled kind stays a compile error; the two `"$iteration"` read sites throw, unreachable until W229. W229 restores `never` and replaces all three | **no — found by `tsc`** |
| `spec/README.md` | the two documents' version rows (`check-spec` C8) and the C4 quote, 45 → 47 refusals | **no — required by `check-spec`** |
| `test/driver/input-of.test.ts`, `test/driver/log-view.test.ts`, `test/driver/needs.test.ts`, `test/driver/reference-index.test.ts` | each runs EVERY valid corpus flow through the driver, which cannot run a loop until W229: the loop flows are split off BY KIND and the driver's refusal of each is ASSERTED — W92's precedent for a gate flow — so W229's lift fails that assertion naming the flow | **no — asked, (a)** |
| `spec/outcome-record.md` | section 4's `OR-R11` census sentence moves with the corpus — the two loop fixtures add nine task nodes and one more named; `test/fold/result-value.test.ts` derives it. W209's and W221's precedent: the sentence moves, no rule and no version | **no — required by `result-value.test.ts`** |
| `AGENTS.md` | section 5's ONE count sentence — 45 refusals over `FD-V1` … `FD-V49` becomes 47 over … `FD-V51`, the two rules NAMED and nothing documented about a run; `check:docs` X7 binds it to section 5's rows. The loop itself is still W230's *Out* | **no — required by `check:docs` X7** |
| `examples/l6.ts` | `spellingOf`'s switch over a reference's `form` gains the `'iteration'` case, and `NOT_YET_AT_L6` comes back as `['iteration']` — W209's pattern — because section 3's table now names a row no L6 run names; W230 runs it and removes the list | **no — asked, (a)** |

## Verification

Routing cases this item covers, by the template's list: a branch routed away from its join — an `end` inside the body
is VALID (the break), which is a definition fact here and a run fact in W229; `user_action` — not applicable (no run);
no matching decision edge — not applicable; a duplicate task id — `branchPathOf`'s refusal without a round index; a
nested fan-out — a map inside a loop and a loop inside a map instance, both validated.

## Record

**Author's record, 2026-11-14, on `d935d4f`.** Nothing committed.

### Gate

| Rung | Result |
|---|---|
| first ladder run, before the exceptions | RED — `typecheck` (examples/l6.ts `spellingOf`), `check:spec` C4 (the README quote), `npm test` 17 failures: the driver suites running every corpus flow, and W228's own suites' tables — the stop-and-ask that granted the Exceptions below, (a) |
| `npm run gate` before the readers | **EXIT 0** — node, deno and chromium 107 files, 2359 assertions (chromium parity); L6 2923, 0 failed, both runtimes. Two reds on the way: `check:docs` X7 (AGENTS.md's count, an exception below) and chromium's `_InvalidDefinition` (the bundle renames classes — `loopRefusal` compares by `instanceof`) |
| `npm run gate` after the readers' findings and the maintainer's (a1), (b1), (c1), (d1) | **EXIT 0** (`C:/tmp-p47/w228-gate.log`) — 107 files, **2361** assertions in node, deno and chromium (parity); L6 2923, 0 failed, both runtimes |
| Workflow rule 8, author's | 3 of 3 RED before the readers (the break clause, the carry arcs, FD-V51 removed); after them, **19 of 19 RED** — every adequacy survivor below and the (a1), (b1) and F3 code, each mutated alone in the author's tree and restored byte-identical (`git status` unchanged) |
| Conformity reader | **RAN** (`C:/tmp-p47/c`, 21 constructed loop documents, 8 wiring documents) — 0 BLOCKING, 2 SHOULD (both the SPEC's), 3 NIT; everything else re-derived and conforming |
| Adequacy reader | **RAN** (`C:/tmp-p47/a`) — 62 mutations, 45 killed, **17 survived** (8 SHOULD, 4 NIT and equivalents), one assertion that could not fail as labelled; the copy restored and green |
| Overlap | **3** shared SUBJECTS, different findings on each: the break clause's scope (F2: nested ends; survivor 7: maps), `FD-V26`'s message for `"$iteration"` (F4: the grammar message; survivor 10: the fix), and the loop join's record (F1: `last`; survivors 6, 11 and the closedness assertion) |
| `npm run gate:item` on the final tree | **RUN 1 RED** — `check:register` R8: Q810's `resolved-by` named ADR 0145 and the ADR's `resolves` was empty; `resolves: Q810` added. **RUN 2 EXIT 0** (`C:/tmp-p47/w228-gate-item-run2.log`) — the ladder (2361 in node, deno and chromium; L6 2923, 0 failed, both runtimes) and every self-test but the register lane's |

### Outputs

| Output | Where | Tests |
|---|---|---|
| (1) `kind: "loop"` and its keys; no `edges` | `src/definition/types.ts` `LoopNode`; `validate.ts` `KINDS`, `NODE_KEYS.loop`, the FD-V50 block | `loop.test.ts` cases 0-2 |
| (2) read from outside as after a map (b′); ADR 0044's reading CONFIRMED in code (`visibleOutputs`, settled entries in branch-path order) before the spec — no stop-and-ask | `validate.ts` FD-V28's `many` | case 5 (fact 13 for a loop and a map) |
| (2a) FD-V50, FD-V51, `until` under FD-V42-45 | `validate.ts` | cases 0-4, 11; seven invalid fixtures |
| (3) a loop region; ID-R6 for a round | `regions.ts` `succ`, `opensWith`, `branchPathOf`, `branchIndexOf`, `innermostLoopOf`, `loopBreakEnds`, `certainlySettled` | cases 6-8 |
| (4) `round` and `carry` arcs, the loop join's record | `wiring.ts` | case 9; `wiring.test.ts` (WIRING_SHAPES, the census, 91 L4 arcs) |
| (5) the schema, static and registry forms | `definition-schema.ts` | case 10; `definition-schema.test.ts`'s partition and repairs |
| (6) Q810 | DECLINED — section 3, ADR 0145 decision 8; the register row resolved | — |
| (7) ADR 0145 | `doc/decisions/0145-*.md` | — |
| FD-R4 through an entry loop, (c1) | `wiring.ts` `entryWalk`'s loop arm; spec section 2's paragraph beside the entry gate's | case 12 |
| spec | `spec/flow-definition.md` **v0.57**, **47 refusals**; `spec/task-id.md` **v0.17** | `check:spec` |

### Decisions taken within the plan's room

1. **The four driver suites SPLIT the loop flows off and assert the driver's refusal** (`test/driver/loop-not-yet-run.ts`) — W92's arrangement; W229's lift fails each naming the flow, and W229 deletes the helper, the splits and their census lines.
2. **`examples/l6.ts` carries TWO exemption lists until W230**: `NOT_YET_AT_L6 = ['iteration']` (a reference form) and `KINDS_NOT_YET_AT_L6 = ['loop']` (a node kind), each flagging the kind exempt AND present, or exempt and in no corpus flow.
3. **A carry from a gate or an inner join is `unchecked`**, naming why — never a recursion through the arc it is part of.
4. **A `"$iteration"` key composes `{ type: integer, minimum: 0 }`, sample 0.**
5. Q811-Q813 and ADR 0146 unused.

### The readers' findings, and what was done

| Finding | Done |
|---|---|
| F1 (SHOULD, the spec) `last` read as the entry's `inputSchema`, a different value where the entry declares `needs`: a `fits` a run would refute | **the maintainer's (a1)**: `last` is the JOIN ARRIVAL — one body node's output, `unchecked` for several, a gate, an inner join or no schema. And **(d1)**, the follow-up the author raised from P47 decision 5: a break hands on the round's STARTING state, the seed in round 0, so a breakable loop's join gives a SECOND `record` arc, `last` the seed's shape, `through` the loop. Spec section 2, the record row, ADR 0145 decision 5; case 9 |
| F2 (SHOULD, the spec) an `end` in a nested region counted as an outer break | **the maintainer's (b1)**: only an `end` whose INNERMOST region is the loop's; one reached both ways is a break (the safe direction). `loopBreakEnds`; section 2, section 4 consequence 2, FD-V29's row, ADR 0145 decision 7; case 6 (a nested map, an inner loop, an own-path break, a shared end); `needs.test.ts`'s oracle re-expressed as region membership |
| F3 (NIT) FD-V43 at `until` worded for an `if` gate | `LOOP_SCOPE`; case 2 asserts the loop's wording |
| F4 (NIT) FD-V26's grammar message omits `"$iteration"` | both sites; `map-item.test.ts`, `run-payload.test.ts` |
| F5 (NIT) `round`/`carry` reported as `needs` where the entry declares `needs` | **kept**: the map's `item` -> `needs` precedent, the producer and `through` still named; a consumer cannot tell round 0 from a carry on such an entry, stated here |
| survivors 1, 9 — FD-V6, FD-V2, FD-V12 for a loop | case 11 |
| survivor 2 — the schema refusing a group `until` | case 10, both forms |
| survivor 3 — `branchIndexOf` on a round member | case 8 |
| survivor 4 — the gate carry clause | case 9 |
| survivor 5 — `"$iteration"`'s arc type and range | case 9 |
| survivors 6, 11 — `broke` optional, `iterations >= 1` | case 9 |
| survivor 7 — the break clause applied to a map | case 6, a map control |
| survivor 8 — the entry loop's walk, untested AND unspecified | **the maintainer's (c1)**: spec section 2's paragraph, beside the entry gate's; case 12 |
| survivor 10 — `"$iteration"`'s FD-V26 fix | case 4 asserts each fix |
| survivor 12 — the break filter's order, the entry credit | equivalent (the reader's own reason); a shared `end` is now tested, case 6 |
| the closedness assertion could not fail | replaced: a consumer forbidding extra keys fits the closed record, `no` without `broke` |

### Asked of the maintainer

- (a) the Exceptions below, widened at the first red ladder; Q810 declined — 2026-11-14
- (a1), (b1), (c1) on the readers' three spec questions; (d1) on the break follow-up — 2026-11-14

### What the next item inherits

- **W229** runs the loop and must DELETE `test/driver/loop-not-yet-run.ts`, the four splits and their three census lines in `l4-corpus.test.ts`, and restore `enter`'s `never`; `spec/join-policy.md` and section 6 carry the run, the until decision, the break's handed-on value (P47 decision 5, read by (d1) here) and `maxIterationsFrom`'s run-time refusal.
- **W230** runs both at L6 and removes `NOT_YET_AT_L6` and `KINDS_NOT_YET_AT_L6`, and the `round`/`carry` set-aside in `wiring.test.ts`'s L6 census; documents the loop in `AGENTS.md`.
