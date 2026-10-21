---
id: ADR 0120
title: "The fold is one accumulator, and step stays pure"
status: accepted
date: "2026-10-21"
item: W194
raised-by: P39
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0120 — The fold is one accumulator, and step stays pure

**Status:** accepted — [P39](../plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md) decisions 1-3, 5 and 6,
and stop-and-asks (a), (c) and (e), answered *"as recommended"* by the maintainer 2026-10-21; written by
[W194](../work-items/w194-the-fold-is-one-accumulator.md). It defines `spec/run-state.md` v0.29 (`RN-R43`, and the Test
text of `RN-R1` and `RN-R2`). It amends no decision and resolves no question.

## Context

fyflow-app's pass 2, #1: a `map` over a few thousand items is unusable, and at 4,000 items 97% of the app's CPU was our
`step` and `withOutcome` (P39). Measured at W194's declaration on `c1aefb0`, each size in a fresh process: `fold` took
134 / 3,387 / 30,073 ms at 1,000 / 2,000 / 4,000 items in node 24.20.0, and 138 / 2,800 / 26,868 ms in deno 2.9.6. The
cause is in the shape (P39 facts 2-3): `fold` was a `step` per input, every `step` returned a new state by spreading the
old one — `nodes` on every dispatch and settlement, a region instance's `opened`, `settled` and `suspended` on every region
event, the three run-level lists on every append — and every arm that can move the outcome then scanned the whole state for
section 3's precedence (`Object.values(nodes)` with up to five `some` passes, every region instance flattened twice, the
path ends twice). Each input cost O(run), so a fold cost O(run²), and a `map` region's lists are as long as its items.

Two constraints decide the shape. **`RN-R1`**: no module-level mutation and no memoisation across calls — so nothing may
survive a call, and a counter the gate reads cannot be module state (P39 fact 9). **`step` is public**, `RN-R2` states it,
and the runtime and consumers call it: its signature, its purity and its result on every input stay (P39 decision 2).

## Decision

1. **ONE definition of the fold's semantics: an internal accumulator** (`src/fold/accumulator.ts`). It holds a run's
   state in `Map`s — nodes by task id, region instances by opener and the opener's branch path — with each instance's
   opened branches in a `Set` beside the list, its `settled` in an insertion-ordered `Map` and its `suspended` in an
   ordered list with O(1) add, remove and membership; and RUNNING COUNTS of nodes per state, of region instances whose
   join has not fired, of those that opened nothing, and of path ends by reason. **Section 3's precedence is read off the
   counts**, in its one order, and never off a scan. Every arm of the fold is written there once; `src/fold/run-state.ts`
   keeps the types, `emptyState`, `isTerminal`, `nodeOf`, `foldLog`, and `fold` and `step` as two calls into it.
2. **`fold` applies every input to ONE accumulator, in place, and materialises one plain `RunState` at the end: linear in
   its inputs.** What it returns is unchanged on every sequence whose region paths are branch paths (P39 decision 5; rule 10 is the limit) — the same values, in the same key order.
3. **`step` keeps its signature and stays PURE: it loads the state it is handed, applies one input and materialises.**
   Its work is **O(the state it is handed)**, documented as such (`RN-R43`): a pure function from one plain `RunState` to
   another cannot do less than copy the record it changes without structural sharing a plain `Record` does not admit, and
   a consumer that steps every input is the consumer P39's W196 gives a cheaper road. **Each arm keeps its exact behaviour
   on ANY state of `RunState`'s type**, not only on one a fold can reach: the outcome is recomputed only by the arms that
   recomputed it before, so a hand-built state whose `outcome` disagrees with its cells keeps that outcome across
   `paused`, `unpaused`, `gated`, `attempted` and a `resumed` that ends no stop; and an input that moves nothing — the
   seven arms that returned `prev` — hands back `prev` ITSELF.
4. **Lazy over what it is handed.** A loaded state is read through, never copied up front: a node, a region instance or a
   list is copied only when an input touches it, the counts are taken from the handed state only when an arm first
   recomputes the outcome, and a cell no input touched is the handed state's own object in the result — the sharing a
   spread-per-step had, with ONE narrowing: an instance a `joinSettled` touches gets copies of its three lists, where
   `{ ...cur, joined }` kept the handed instance's (W194's conformity reader, C2 — less aliasing, never more). So `step`
   costs what it did, near enough, and `fold` costs a fraction.
5. **What a materialised state shares is what a state shared before**: with an INPUT, a settlement's `result` by
   reference (ADR 0058 consequence 3); an ask's `input` and a gate's `key` are deep copies, taken once, when applied; a
   resumed list is copied. No share is added and none removed. With the ACCUMULATOR, its node entries, gate decisions,
   path ends, resume lists and request records — objects it REPLACES and never mutates, so **a later `apply` never changes
   a state already materialised**. The reverse is not promised: a caller that mutates a materialised state reaches those
   objects. Nothing in the library keeps an accumulator open past one call at this decision; one that does (P39's W196)
   hands out a FROZEN copy.
6. **The counter is an argument** (P39 decision 6): `foldWith(inputs, counter?)` and `stepWith(prev, input, counter?)` are
   the internal entry points, and `fold` and `step` pass no counter. It counts one per input applied and one per entry,
   element or cell read or written while loading, copying or materialising — clock-free, so a RATIO of two counts is a
   property of the code (Q179). Absent, it costs nothing measured: 1.62 ms without and 1.49 ms with, at 1,000 items,
   medians of 41 in node 24.20.0, against 120.74 ms for the pre-change fold.
7. **Internal** (P39 (c)): `index.ts` re-exports `src/fold/run-state.ts`, never `src/fold/accumulator.ts`, so no public
   surface moves but `step`'s documented cost. The new file is published source — `run-state.ts` imports it — and is on
   `deno.json`'s publish list.
8. **The pre-change fold is the ORACLE**: `test/fold/oracle-run-state.ts`, lines 455-833 of `src/fold/run-state.ts` at
   `c1aefb0` sliced verbatim, never edited again. `RN-R2`'s test is the equivalence: at every prefix of every corpus
   sequence, `fold`, the `step` reduction and the oracle's fold are equal, key order included; and `step` over every
   oracle state, its outcome forced to each of the nine, equals the oracle's `step`, the same object exactly where the
   oracle's is.

9. **Every key a materialised record gains is an OWN data property**, as a spread or a computed key made it — never an
   assignment, which for the key `__proto__` calls the prototype setter and creates nothing. FD-V16's id grammar admits a
   node, so a region opener, named `__proto__`; an assignment there lost the region from `fold`, and a `step` over that
   state turned a `stuck` run `completed` (W194's conformity reader, C1, reproduced on a `Driver`). The one exception is
   `settled`, which the pre-v0.29 arm ASSIGNED, and still does.
10. **The stated limit** (C3): a REGION PATH that names an `Object.prototype` member is read from a `Map` where the
    pre-v0.29 arm read a plain object and found the inherited member, so such a sequence differs. A region path is a
    branch path (`spec/task-id.md`), and no driver appends one.

## Consequences

1. **`fold` at 4,000 map items: 30,073 → 17 ms in node, 26,868 → 15 ms in deno** (the app's repro, fresh processes);
   16,000 items fold in 49 ms. P39 prediction 2 holds.
2. **The invariant holds, unmoved**: run state is a pure fold of the event log. The accumulator is that fold's working
   form, mutated only inside one call, and `fold(driver.foldInputs())` is still the whole of turning a run into run state.
3. **A runtime that keeps the accumulator open** (P39's W196, ADR 0122) gets an O(1)-per-input fold of a live run; this
   decision gives it the shape and says what it must add — a frozen copy for every state it hands out (rule 5).
4. **The runtime's own `step` per input is unchanged in cost and result here** (`src/scheduler/runtime.ts`), and is W196's.
5. **ADR 0062's `allRegionRuns`, the one place the two region walks were written so they could not drift, is gone with
   the walks**: both are now counts kept by the one function that weighs an instance, which serves the same purpose.
