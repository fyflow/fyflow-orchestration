---
id: ADR 0122
title: "A runtime's live state is a frozen copy on its handle"
status: accepted
date: "2026-10-21"
item: W196
raised-by: P39
supersedes: ""
amends: ADR 0058 rules 1 and 5
resolves: ""
---

# ADR 0122 — A runtime's live state is a frozen copy on its handle

**Status:** accepted — [P39](../plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md) stop-and-asks (b), (c),
(d) and (f), each answered *"as recommended"* by the maintainer 2026-10-21 — (f) the last, the same day; written by
[W196](../work-items/w196-the-runs-live-state-on-its-handle.md). It defines `spec/run-state.md` v0.31 (`RN-R44`, and
`RN-R25`'s text). **It amends [ADR 0058](0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)** rule 1 (the
handle's shape), rule 5 (what the runtime keeps) and consequence 3 (what the kept state shares). It resolves no question.

## Context

fyflow-app's pass 2, #2: the Host shows a run's state live, and the runtime's state was unreadable until `done` — so the
app folded every run a SECOND time in its own `onFoldInput`, paying #1's cost twice. After
[ADR 0120](0120-the-fold-is-one-accumulator-and-step-stays-pure.md) a `fold` is linear, but a `step` costs O(the state it
is handed), and the runtime still kept ONE `RunState` and `step`ped it per input (ADR 0058 rule 5): a 4,000-item `map`
stepped 16,003 times, O(run²).

Three facts re-taken at W196's declaration step on `e2b62c8`:

1. **One literal builds a handle** — `openRun`'s return. Adding three members costs one typecheck error in each of the five
   lanes, all at that literal; no `AGENTS.md` snippet builds one.
2. **A resume delivers before it returns.** `resume()` hands the consumer's `onFoldInput` at least its `resumed` element —
   `RN-R22`: appended always — so no read of the handle can precede the first delivered input, and the stored events,
   applied at that input, are already folded when anything can ask.
3. **The kept state shared its results with the consumer.** `freezeInput` hands `onFoldInput` a record frozen one level
   deep, and `step` wrote `result: r.result` by reference, so the kept state's `result` WAS the object the consumer was
   handed (`===`): a consumer writing into its nested result moved `await done` (measured), and `await done` was mutable at
   every depth.

## Decision

1. **The runtime keeps the fold's ONE accumulator OPEN, one per run** — W194's `Accumulator`, `fold`'s own definition
   (`RN-R43`): each fold input is applied to it as it is delivered, and nothing materialises a `RunState` unless something
   reads one. *Amends ADR 0058 rule 5*, whose *"ONE `RunState`, `step`ped per fold input"* is replaced; its argument —
   keep state, not inputs; `RN-R2` licenses keeping a prefix — stands, with `fold`'s body kept open instead of stepped.
2. **`RunHandle` gains three members** — *amends ADR 0058 rule 1*, `{ driver, done }` then `{ driver, done, header, stop }`:
   - **`state(): RunState`** — a COPY of the run's state, **frozen at every depth**, **cached until the next fold input
     that moves the state** (an input the accumulator reports unmoved keeps the cached object, as `step` hands back the
     state it was handed). Equal to `fold(driver.foldInputs())` at a quiescent point (`RN-R12`). O(run) for the first read
     after each input that moved the state, nothing for a read after it.
   - **`outcome(): RunOutcome`** — the accumulator's outcome, O(1).
   - **`node(taskId): NodeRun | null`** — the accumulator's entry for that task, the SAME frozen object `state()` places
     there, O(1) in the run (the first read of an entry freezes it once); `null` for a task the run never dispatched or asked, whatever the id names (`toString`, `__proto__`).
3. **`done` resolves with the object `state()` returns at that moment** — P39 (f): one copy, one definition, so
   `await done === handle.state()` once it has settled — until the ONE run control a finished run takes: `unpause`, never
   refused `ended` (ADR 0106, `RN-R35`), so a run that finished while paused can be unpaused after `done`; `state()` then
   follows the driver's `unpaused` element and `done` keeps the state at settlement (the conformity reader's C1, stated
   rather than suppressed: the runtime still applies every element its driver appends, so `state()` stays the fold). It is still asked at a microtask (ADR 0058 rule 6), and the
   predicate reads `outcome` alone: materialising for it would cost O(run) per input for every run, read or not.
4. **The kept state shares nothing with what a consumer holds.** A settlement's or a resolution's record whose `result` is
   an object is COPIED (`structuredClone`) as the runtime applies it — from a delivered input and from a resume's stored
   events alike — so neither the `onFoldInput` input nor a consumer's store is frozen by the runtime, and writing into
   either reaches no read. A record's `error` is a string or `null` (`LogRecord`), and every other kind the accumulator
   already copies (an ask's `input`, a gate's `key`, a resume's list) or holds only primitives of BY TYPE (a cancel's and a
   stop's `reason` is a `string`; an untyped caller passing an object has it held by reference — C4). *Amends ADR 0058 consequence 3*: the kept state's results are the
   runtime's own copy, not the record `freezeInput` handed on.
5. **Frozen means every object `Object.freeze` reaches**, each frozen ONCE: the accumulator shares node entries, results
   and records across materialisations and never writes one again (ADR 0120 rule 5), so a walk skips what an earlier one
   froze and a read costs the new containers plus what is new. **The stated limit**: what `Object.freeze` does not stop stays
   WRITABLE through a read and reaches later reads and `done` — a typed array's elements (a view is left as it is:
   `Object.freeze` throws on a non-empty one), an `ArrayBuffer`'s bytes, a `Date`'s time, a `Map`'s and a `Set`'s
   membership (their members and keys are walked and frozen). A write to anything frozen throws in strict code.
6. **A resume's stored events are applied before the first delivered input or the first read, whichever is first** —
   every read catches them up, so the reads are total; by fact 2 the delivery comes first on every resume that returns a
   handle. P39's *taken at rest* sentence: no element is added, and the stored events are applied by the runtime, never by
   a caller's call.
7. **Not a live view, not handed to `onFoldInput`, not public machinery** — P39 (b) and (c): a mutable view is ADR 0007's
   live-`detail` hazard; state beside each `onFoldInput` call makes every consumer pay a materialisation per input; the
   accumulator stays internal (`index.ts` and the published entries re-export it nowhere).
8. **What does NOT move** (P39 decision 5): no `FoldInput` kind, no element, no order, no `RunState` cell, no checkpoint
   field; what `onFoldInput`, `foldInputs()` and `snapshot()` hand out; `done`'s settlement rule (ADR 0058 rule 3 and its
   amendments). What `done` resolves with is the same VALUE — the caller's own fold — now frozen and `===` `state()`.

## Consequences

1. **BREAKING in 0.9.0** (P39 (d), (f)), in two places: for code that BUILDS a `RunHandle` (three new members — `stop`'s
   precedent, P34 decision 10), and for code that MUTATES `await done` (frozen; a write throws in strict code). The version
   bump is the maintainer's `chore:` after P39.
2. **A consumer reading the run per input pays O(1)** through `outcome()` and `node()`, and O(run) per input only if it
   reads `state()` after every one — O(run²) over a run, at a far smaller constant than a second fold (P39 prediction 4).
   The reference teaches the pattern: the cheap reads per input, `state()` when a view is drawn.
3. **One more `structuredClone` per settlement or resolution whose result is an object** (rule 4), beside the one
   `freezeInput` already makes ([Q320](../questions/q320.md)). What is RETAINED is unchanged — the copy `freezeInput` made
   is garbage once the consumer drops it — and the kept state is still one copy of every result per retained handle.
4. **`test/scheduler/runtime.test.ts`'s source binding moves**: the machinery keeps `Accumulator.load(…)` and calls
   `acc.apply(…)`, and reads neither `step(`, `fold(` nor `foldInputs()` — a step or a fold per input is the O(run²) this
   decision removes.
5. **For P39's W197**: no counter is placed in the runtime. The runtime's work is the accumulator's, read by wrapping
   `Accumulator.prototype.apply` and `.materialise` in a test (W196's own count case does): restoring a materialisation per
   input — `isTerminal(current())` in the predicate — is the provocation that makes a runtime's count ratio red.

## Alternatives rejected

| | why not |
|---|---|
| **A live, mutable view of the accumulator** | ADR 0007's hazard: a consumer holding it sees it change under them, and one writing to it corrupts the runtime's own `done`. P39 (b) |
| **The state handed to `onFoldInput` beside each input** | Every consumer pays a materialisation per input whether it reads it or not — #1's cost moved, not removed. P39 (b) |
| **`done` as a separate, unfrozen materialisation** | No behaviour change for `done`, and two objects for one state whose difference is only whether they freeze. P39 (f), answered for the same object |
| **Freeze the consumer's `onFoldInput` input deeper, instead of copying the record (rule 4)** | Cheaper — a freeze is cheaper than a clone — and it moves what `onFoldInput` hands out, which P39 decision 5 keeps still: a consumer's own write into a nested result would begin to throw on a runtime and not on a bare `Driver` |
| **Deep-freeze the materialised state and share the record as before** | The freeze would reach the consumer's `onFoldInput` input through the shared `result` — at the first `state()` read or at `done`, whichever came first — so whether a consumer's own object is frozen would depend on whether anybody had read the run: action at a distance |
| **A counter in the runtime for W197** | A field no public surface reaches would be one more thing a reader must find; the accumulator's prototype is the seam the runtime's work already passes through |
