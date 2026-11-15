# W230 — a loop resumed, its footprint measured, on real workers; AGENTS.md, the reply and P47's close

**Status:** done 2026-11-14 — `npm run gate:full` EXIT 0 on the final tree (the second run; the first RED, the Record); declared 2026-11-14 on `df60b9e`, started 2026-11-14 on `1d2878f`; both readers RUN and acted on
**Plan:** [P47](../plans/p47-what-may-repeat-in-a-flow-and-how-a-round-hands-on-to-the-next.md) — its last item.

```
Spec:       spec/run-state.md: section 7 states a loop's footprint under RN-R13 (decision 3) with the measured
            figure; section 9 states that a loop resumes from its settlements (or the measurement that refutes it,
            as a stop-and-ask before any format change). Changed FIRST, as its own edit.
Owns:       spec/run-state.md, examples/** (l6.ts, its flows and workers, README counts), AGENTS.md (a loop
            section and every table that lists node kinds or refusals), test/driver/checkpoint*.test.ts and
            test/fold/*-cost.test.ts for the loop cases, the reply file in
            ../fyflow-app/.scratch/mu-upstream-adoption/requests/ (written, not sent), P47's Record and Retro
Inputs:     W228 and W229's outputs; P47 decision 3, exit artifact (3)-(5)
Outputs:    (1) a loop checkpointed mid-round resumes to the same fold — every round's `branch.opened`
                regenerated from the settlements, no new FoldInput kind, CHECKPOINT_FORMAT unchanged.
            (2) the retained footprint of a loop MEASURED beside a map of the same task count, and the carried-
                history case of decision 1 measured beside a reader after the loop naming the rounds.
            (3) one block in examples/l6.ts, green in node 24 and deno: a training-shaped loop (a map in the body,
                `until`, a reader after the loop naming a body node's every round) and a polling loop that breaks,
                each beside its control.
            (4) AGENTS.md documents the loop, every snippet run or checked by check:docs.
            (5) fyflow-orchestration.pass8.reply.md for #2 (#1 marked not evaluated); Q582 resolved.
Depends on: W229
Blocks:     nothing
Tests:      L2 resume suites: a checkpoint taken after round 0, mid-round 1, and at a park inside round 1, each
            resumed and folded equal to the uninterrupted run; L6 assertions on real workers; the footprint
            figures as measured numbers with their command. Expected values from the spec text and P47's
            decisions, not from output.
Gate:       `npm run gate` before the readers; conformity and adequacy readers; `npm run gate:full` once on the
            final tree — the plan's LAST item (workflow v0.29).
Reserves:   Q817-Q818
```

## Exceptions — files outside `Owns`

*Declared before each edit; asked of the maintainer (2026-11-14, (a), `doc/workflow.md` section 1 rule 6) after the
resume and footprint measurements and before any spec edit.*

| file | why | predicted? |
|---|---|---|
| `spec/README.md` | `spec/run-state.md`'s version cell, v0.37 (`check-spec` C8) | **no — required by `check-spec`; asked, (a)** |
| `test/definition/wiring.test.ts` | its `NOT_YET_IN_L6` set-aside of the `round` and `carry` shapes — asked as REMOVED once this item's L6 block runs a loop; measured, that census reads the FILE corpus (`examples/flows/`) and the block writes its flows in `l6.ts`, so the list STAYS and its comment and message say why (decision in the Record) | **yes — W228's Record; asked, (a)** |
| `test/definition/l4-corpus.test.ts` | this item's loop-resume suite (`test/driver/checkpoint-loop.test.ts`) enters `LATE_SUITES` and the case count, as every item's suites do; **and W229's own count message, stale since W229's readers added cases** (*"registers its eleven"* where the suite registers sixteen and the asserted count was already 16), corrected in passing — a message, no asserted value moved; named here after the conformity reader found it undeclared | **no — asked, (a); the message fix declared late** |
| `scripts/check-docs.mjs` | `RUN_FLOOR` 57 -> 58 for section 22's new `run` snippet, and its one-line credit — the ratchet every item adding a `run` snippet moves (W209, W210, W220, W225, W226) | **no — omitted from the declaration, found RED by the first `gate:full`; declared late, NOT asked** |

## Scope

**In**

1. Everything on the `Outputs:` line.

**Out** — named rather than left implicit, with where it goes instead

- Compaction: [Q809](../questions/q809.md).
- Sending the reply: the maintainer's call, as for every pass.

## Verification

Routing cases this item covers: a branch routed away from its join — the polling loop's break at L6; `user_action` —
the resume taken at a park; no matching decision edge — not applicable at L6 (W229's L2); a duplicate task id — every
id an L6 loop mints is distinct, asserted; a nested fan-out — the map inside the training loop's body at L6.

## Record

**Author's record, 2026-11-14, on `1d2878f`.** Nothing committed.

### Gate

| Rung | Result |
|---|---|
| the measurements, before any spec edit | resume: every element of a poll-shaped and a training-shaped run a cut, every resumed sequence the uninterrupted one's, `resumed` aside (scratch spike, `C:/tmp-p47/w230-resume-spike.log`) — **no format change, so no stop-and-ask**; footprint: `examples/loop-footprint.ts`, node and deno tables identical (`C:/tmp-p47/w230-loop-footprint-{node,deno}.log`) |
| L6, stage A | RED as predicted — `NOT_YET_AT_L6`'s and `KINDS_NOT_YET_AT_L6`'s four expiry failures once the block ran a loop (`C:/tmp-p47/w230-l6-stage-a.log`); both removed |
| first `npm run gate` before the readers | RED — `check:register` **R8**: Q582's `resolved-by` named ADR 0145 and the ADR's `resolves` did not name Q582 (`C:/tmp-p47/w230-gate-1.log`). ADR 0145 is the decision that answers Q582, so its `resolves` reads `Q810, Q582` — the record step's `doc/decisions/**` |
| `npm run gate` before the readers | **EXIT 0** (`C:/tmp-p47/w230-gate-2.log`) — 110 files, 2384 assertions in node, deno and chromium; L6 2933, 0 failed, both runtimes |
| Conformity reader | **RAN** (`C:/tmp-w230/rc`) — no defect in behaviour; **3 false or unbacked claims**, 5 imprecisions |
| Adequacy reader | **RAN** (`C:/tmp-w230/ra`) — 27 mutants of `src/driver/driver.ts`, none surviving every suite; **M16 a real gap** (a reading cut AT the loop's `joinSettled`), M26 most likely equivalent; 2 assertions that cannot fail; Output (1)'s two negative claims unasserted by W230; the copy restored byte-identical |
| Overlap | **2** shared SUBJECTS: the cut counts (conformity's unbacked *7/7 and 13/13*; adequacy's `cuts` equality that cannot fail) and what the L6 block OBSERVES (conformity's `"$item"` run and never read; adequacy's M09, the carried value invisible at L6) |
| L6 after the findings | **EXIT 0** in node and deno, **2935** assertions, **294** runs (`C:/tmp-p47/w230-l6-{node,deno}-2.log`) |
| Workflow rule 8, author's | **6 of 6 RED** (`C:/tmp-p47/w230-rule8.log`), each mutated ALONE in `src/driver/driver.ts`, restored byte-identical (sha256 `7e5e361a…` before and after): A1 the reading offer at the loop's join pending (M16) — the new cut AT `joinSettled`; A2 round *i > 0* opened with `null` (M09) — the re-handed payload; A3 an element of a NEW kind at each decision — the suite red, the fold throwing on it before the named kind assertion is reached; A3b an extra element of a KNOWN kind (M24/M27's shape) — the pinned log length; A4 `CHECKPOINT_FORMAT` 3 — *unmoved*; A5 a lost round fired as exhausted — L6's LOST claim in both pools |
| lint, typecheck, `check:spec`, `check:docs` after the findings | **EXIT 0** each |
| first `npm run gate:full` | RED — `check:docs:selftest` **45/47** (`C:/tmp-p47/w230-gatefull.log`), the other ten lanes ok: (i) *a whole `run` snippet deleted* not caught, because section 22 made the `run` count 58 and `RUN_FLOOR` stayed 57 — raised (an Exceptions row); (ii) *a `run` snippet whose assertions are deleted* reported `X3` and `X5` beside `X4`/`X8`, because section 22's done-check ended a three-line `if` in its `throw` line, so deleting that line broke the snippet's syntax — the expected value moved into a `const` so every `throw` stands on its own line. `check:docs` EXIT 0; `check:docs:selftest` **EXIT 0, 47/47 probes, 24/24 gradings** (`C:/tmp-p47/w230-docs-selftest.log`) |
| `npm run gate:full` on the final tree | **EXIT 0** (`C:/tmp-p47/w230-gatefull-2.log`, tree snapshot `C:/tmp-p47/w230-gatefull-2-tree.txt`, unchanged at the end) — L1-L5 110 files, 2384 assertions in node, deno and chromium; L6 2935, 0 failed, both runtimes; self-tests **11/11 ok**, 2834.7 s wall. Only this Record's gate cell, P47's three `gate:full` cells and the two Status lines were written after it — and, at the maintainer's review, the BREAKING sentence in P47's Record and section *What the next item inherits*, which named `FlowNode` alone where three exported unions widened (prose; no gate input) |

### Outputs

| Output | Where | Tests |
|---|---|---|
| (1) a loop resumed mid-round to the same fold; no new `FoldInput` kind; `CHECKPOINT_FORMAT` unchanged | `spec/run-state.md` **v0.37** section 9 | L2 `test/driver/checkpoint-loop.test.ts`, 6 cases: after round 0 (its re-handed input), mid-round 1 of the training loop, at a park, every element a cut (23 and 44, pinned; the kinds 0.14.0 wrote; format 2), a reading at the join before and AT `joinSettled` |
| (2) the footprint beside a map, and the carried history beside a reader | `spec/run-state.md` section 7, *A LOOP's footprint*; `examples/loop-footprint.ts` | a measurement, not a test — Q179; the in-flight half is `JP-R15`'s lifetime clause, W229's (now said in section 7) |
| (3) one L6 block, node 24 and deno | `examples/l6.ts`, W230 block: training (done) and its control (exhausted), polling (break), its control (done) and **a LOST run**, per pool | 12 cross-row claims, 10 runs |
| (4) `AGENTS.md` | the "Eight node kinds" note, section 3's `loop` row, **section 22** | `check:docs` X4 runs section 22's snippet |
| (5) the reply; Q582 | `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass8.reply.md` — written, NOT sent; `doc/questions/q582.md` resolved | — |

### Decisions taken within the plan's room

1. **`wiring.test.ts`'s `NOT_YET_IN_L6` STAYS** — measured: that census reads the FILE corpus `examples/flows/`, and this block writes its flows in `l6.ts` (so no corpus-derived count moves); the comment and the message now say a loop flow under `examples/flows/` is what retires it.
2. **The L6 flows are written in the block**, not under `examples/flows/`, for the same reason.
3. **The footprint is an example, not a rung** — `examples/loop-footprint.ts`, out of the gate chain as `retention.ts` and `map-cost.ts` are (Q179), listed in `l6.ts`'s `CONSTRUCTION_PRICED`.
4. **`AGENTS.md` gains a section, 22**, rather than growing section 3: a loop's table, a run snippet and the footprint and resume prose are a reader's whole question.
5. **L6 runs the LOST road too**, beyond exit artifact (4)'s list — Q582's *closes-when* names every way out on real workers (conformity reader, finding 1). A loss is a failure's road (FD-V7 holds every task to a default edge for `done`): `check` OPTIONAL and throwing, with no `on: ["failed"]` edge.
6. **ADR 0145 resolves Q582** beside Q810 (R8, above).
7. Q817-Q818 unused.

### The readers' findings, and what was done

| Finding | Done |
|---|---|
| C1 — Q582 resolved while L6 ran three of the loop's ways out, not every one | the LOST run per pool at L6 (decision 5); 2935 / 294 |
| C2 — the reply's *7/7 and 13/13* quiescent cuts were a scratch spike's, in no file | the reply cites the 23 and 44 element cuts, which section 9 and the L2 suite carry |
| C3 — the reply implied a failure routed by `on: ["failed"]` reaches the next round; the state is `null` | the reply: route it through a node reading `"work!error"` |
| C4, C5 — *byte-identical output*; *500 rounds cost what 500 items do*, measured to 256 | the reply: identical TABLES; the ratio to N = 256 and the 500 as an expectation |
| C6 — the L6 header says `"$item"` and `"$iteration"` are read in the body's map; no claim reads `rollout` | the header row and docblock say what is RUN and what is asserted where (L2, section 22) |
| C7 — *an `if` gate can read `input.broke`*: the subset has no presence test | the reply names a leaf, `input.broke.at` |
| C8 — `l4-corpus.test.ts`'s W229 message fix undeclared; section 7's *keeps nothing a map releases* read at the end of a run only | the Exceptions row names it; section 7 says the tables measure the first term and the in-flight half is W229's lifetime clause |
| M16 — no reading cut AT the loop's `joinSettled` | case 4: a cut AT it hands on the collection; rule 8 A1 |
| `equal(cuts, …)` cannot fail; `every` over an empty `inputs` passes | the cut counts pinned to section 9's 23 and 44; the pre-settle cut's three arrivals asserted by path |
| Output (1)'s *no new kind* and *format unchanged* unasserted (M24, M27, M25) | case 3: the kinds 0.14.0 wrote, by hand; `CHECKPOINT_FORMAT` 2; the log's length; rule 8 A3, A3b, A4 |
| M09 — the carried value seen only by `AGENTS.md`'s snippet and W229 | case 0: the re-handed round 1's input is round 0's arrival; rule 8 A2 |
| M01, M08, M17-M19, M22 — killed by W229's suites alone | **kept** — the ways out and the lifetime are W229's outputs, its suite their test; W230's suite is about the RESUME of each |
| M26 — `branch.suspended` recorded as a round's end | **equivalent**, the reader's reason: no emission site settles the loop, and the round's terminal event overwrites `ended` |
| the footprint figures drift with nothing noticing | **kept** — a footprint is a property of a serializer (Q179); the relation is `RN-R13`'s |

### Asked of the maintainer

- (a) the Exceptions above, after the resume and footprint measurements — 2026-11-14

### What the next item inherits

- Nothing of P47's: the plan closes here. [Q809](../questions/q809.md) (compaction) stays deferred; the reply's sending, the version bump to 0.15.0 (BREAKING only in three widened unions: `FlowNode`, `RegionSets.opensWith`, `WiringShape`), the push and the publish are the maintainer's.
