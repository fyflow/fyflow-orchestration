---
id: ADR 0058
title: "`runtime.start` returns a completion handle the RUNTIME keeps, and it resolves rather than rejects"
status: accepted
date: "2026-09-19"
item: W77
raised-by: Q293, P20
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0058 — `runtime.start` returns a completion handle the RUNTIME keeps, and it resolves rather than rejects

**Raised by:** [Q293](../questions/q293.md), taken by [W77](../work-items/w77-what-start-returns.md)
under [P20](../plans/p20-what-the-runtime-owes-a-consumer.md)

## Context

[P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decision 10 made `runtime.start`
hand back a **started** `Driver`, and the only way to learn that the run had ENDED was to append
every `onFoldInput` and re-fold until `isTerminal`. [Q293](../questions/q293.md) called that *"eight
lines a consumer copies"*.

**P20's declaration measured both halves of that row and both were wrong, one in the direction that
decides the question.**

*Eight lines* is **thirteen copies and 135 lines** across `AGENTS.md` and `README.md`, in **three
shapes that disagree** — ten carry the `queueMicrotask` quiescence guard and **no deadline**, two
carry a poll and a deadline and **no microtask**, and **exactly one of the thirteen carries both** —
while the reference's own prose calls the microtask *"load-bearing rather than decoration"*.
*(That sentence sat at `AGENTS.md:112`, inside §2's copied block, until
[W78](../work-items/w78-the-run-a-consumer-holds-in-one-line.md) reduced that block to `await done`.
It now sits in §8 beside `isTerminal`, which is where the claim belongs once the copies are gone —
W78's conformity reader, finding 3, in the file `doc/workflow.md` v0.7 change 3 put in the record
step so a demonstration can correct the decision it demonstrates.)* Re-run at W77's declaration step: `M-- x10`, `-PD x2`, `M-D x1`, 135 lines.
**Ten of the thirteen hang for ever on a run that never becomes terminal**, which is the failure
[W71](../work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md)'s own declaration records
its author's first spike hitting.

**And the row's stated case AGAINST does not survive contact with a run.** It argued a promise gains
nothing because *"`start` starts INSIDE the call, so what the promise had seen before the caller held
it is the same window"*. Measured on a real `FyflowScheduler`: exactly **one** fold input arrives
before `start` returns — W67's number, reproduced — so the window is real; and a `.then` attached
**fifty macrotask turns after the run was over** still receives `completed`. **A promise RETAINS its
resolution, and the window is precisely what a promise is immune to.**
[Q289](../questions/q289.md) is about a CLOSURE that needs the `driver` binding, which `done` gives
nothing to, and it stays open.

**What survives of the objection is the *second observer* half**, and that is what this decision has
to answer without reopening
[ADR 0014](0014-the-driver-produces-the-folds-ordered-input-sequence.md).

## Decision

1. **`runtime.start` returns a `RunHandle` — `{ driver, done }` — and this is BREAKING.**
   The package moves `0.2.0` → `0.3.0` in **both** manifests, which is
   [Q279](../questions/q279.md)'s answer as a procedure and
   [ADR 0048](0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)/[W67](../work-items/w67-a-flow-from-documents-on-real-workers.md)'s
   precedent for a bump taken for a reason.
2. **The RUNTIME keeps the fold; the driver never learns one exists.** ADR 0014 spends a paragraph
   forbidding the driver subscribing to itself and names `attachFold(driver)` as the ergonomic next
   step it refuses. **The runtime is a CALLER**: `onFoldInput` is the push half ADR 0014 rule 3 built
   for a caller, `fold` still never learns a driver exists, and `RN-R1` and ladder L3 are untouched.
   *This is also why the handle is a PAIR and not `Object.assign(driver, { done })`: an additive
   `done` hanging off the driver object tells every reader that the driver produced it, which is the
   one thing this rule denies.*
3. **`done` resolves with the terminal `RunState` and NEVER rejects.** Its settlement rule is
   terminality and nothing else. `completed`, `failed`, `stuck` and `stopped` settle it; `running`
   and `awaiting_action` leave it pending, because `isTerminal` says more input is coming.
4. **A driver refusal resolves it with `outcome: 'stopped'`, carrying `stoppedBy`.** `failRun`
   appends the `stopped` fold input **before** it calls `onRunFailure`, so a refusal is already
   terminal when a consumer hears of it — resolving does not hang, and it reports strictly more than
   a rejection would. **This holds at all four of `failRun`'s call sites**, including `resolve()`'s,
   where the caller gets the throw AND holds the handle — the road out of `awaiting_action`, and the
   one W77's first table omitted (its conformity reader, finding 2).
5. **What is kept is ONE `RunState`, `step`ped per fold input, not the input sequence.** `fold` IS
   that loop — `for (const i of inputs) s = step(s, i)` — and **`RN-R2`** is the rule that a stepped
   prefix equals a fold of that prefix, so this is `fold`'s own body with the prefix kept rather than
   recomputed. It is not a second definition of terminality: `test/scheduler/runtime.test.ts` holds
   `await done` equal to `fold(driver.foldInputs())`, the caller's own expression over the driver's
   own sequence.
6. **The STEP is synchronous and the PREDICATE is not.** The driver dispatches the next node
   synchronously inside the same listener turn, so asking `isTerminal` the instant an input arrives
   can report a terminal state with the run still going — `RN-R12` claims its predicate at rest.
   Stepping is correct at every prefix (rule 5); only the predicate needs quiescence, and it gets it
   from a `queueMicrotask`.
7. **`onFoldInput` is COMPOSED, not replaced.** It is also a `StartOptions` member a consumer may
   pass, so the runtime wraps it: record first, schedule second, hand on third — `done`'s own
   bookkeeping cannot be shortened by a consumer's callback. This is a THIRD road `start` reaches a
   member by, beside the conditional spread and the `??` default, and the test that binds those
   lists binds all three both ways and **pins this one to `onFoldInput` alone**.
8. **There is no deadline, and the reference teaches `Promise.race`.** Ten of the thirteen blocks
   hang for ever precisely because a hand-rolled `new Promise` cannot be raced by whoever holds it;
   once `done` IS a promise, `Promise.race([done, timeout])` is the consumer's one line. **The
   deadline problem is solved by RETURNING a promise, not by parameterising one** — and a library
   default would be wrong for every run with a person in it.

## Consequences

**What this makes easy.** The block a consumer copies becomes one line, and the residue is explained
rather than left: what survives of the thirteen is whatever ELSE the snippet teaches.
**[W78](../work-items/w78-the-run-a-consumer-holds-in-one-line.md) measured it — thirteen copies and
135 lines become ONE and 16.** Four sites reduce to nothing but `done`; five keep a callback for a
DIFFERENT fact (a fan-out's settlement ORDER, which a `RunState` is order-free about; the PARK, which
rule 3 makes `done` wait through; the frozen-handle snippet's own `onFoldInput`; the failure KIND
beside the outcome; and `driver.runId`, readable the instant `start` returns); and ONE cannot reduce
at all, because §12's *driver with no scheduler* builds a `Driver` by hand and there is no runtime to
keep a fold. *The residue is structural, and it is exactly the shape this rule does not reach.* A run parked on a person is `awaiting_action` and `done` waits
for the resolution — correct, and a trap, and the reference now has somewhere to teach it.

**What it costs, measured rather than estimated.**

1. **31 typecheck errors in two files, both ours** — 19 in `test/scheduler/runtime.test.ts`, 12 in
   `examples/run-flow.ts`, every one the same mechanical destructure and 22 of them literally
   `Property 'runId' does not exist`. *The price is a count of USES of the returned value, not of
   `start` call sites: that file has 24 of the latter.*
2. **A sixth lane the five typecheckers do not reach.** `npm run typecheck` is five lanes and the
   reference's snippets are extracted by `check:docs`, so the plan's price — taken over those five —
   was narrower than its wording. Three `AGENTS.md` snippets bind the result and broke `X3`, `X4`
   and `X5`; `README.md`'s three do not bind and were unaffected, so `X8`'s pairs never moved.
3. **One copy of every result, per RETAINED HANDLE.** `step` writes `result: r.result` by reference into the
   record `freezeInput` handed it, and `freezeInput` builds that record with
   `structuredClone(r.result)` — so the kept `RunState` pins a second copy for the life of the run.
   **Measured by identity rather than by bytes**, because at 60 concurrent runs `v8.serialize` said
   11.3 MiB and `heapUsed` after a forced `gc()` read x0.97, which is noise larger than the signal:
   **5 of 5 results are different objects from the driver's**, and the kept state is 87.6 KiB of
   which **99.4% is the results**. That is P15's own quantity again — (tasks settled) × (bytes each
   returned) — bounded at one extra copy per live run and not growing with time.
   **The comparison that makes it acceptable is ABOUT THE SAME, not half** — W77's conformity reader,
   finding 3, and the first version of this paragraph said half. The block this replaces keeps its
   `inputs` array AND folds a state out of it, and those look additive (89.1 + 87.6 = 176.7); they
   are not, because `step` writes `result: r.result` BY REFERENCE, so that state points into that
   array and `v8.serialize` on two roots cannot see the sharing. Counting the block's non-result
   scaffolding once: **~89.7 KiB against `done`'s 87.6 — ~2% less** — and `done` does a fifth of the
   work (6 ms against 23). *The identity measurement that falsifies the sum was printed three lines
   above it.*

   It is bounded per **retained handle** rather than per live run, because a promise retains its
   resolution. The honest residue is that a consumer who kept **no** completion machinery at all now
   pays one copy they did not — **and one `structuredClone` per settlement they did not either**,
   since `freezeInput` clones only when an `onFoldInput` is present and `start` now always installs
   one, which is a second unconditional deep copy beside `OR-R2`'s. [Q320](../questions/q320.md).
4. **A consumer's `onFoldInput` throwing stops the run**, and `done` reports that as `stopped` with
   the consumer's own message in `stoppedBy`. That is behaviour this decision INHERITS rather than
   introduces — the driver has always called `onFoldInput` unguarded and `OR-R10` has always caught a
   throw from a listener — but it is now observable in one line instead of hanging a hand-rolled
   block inside the same handler.

**What a future reader is likely to try that this forbids.** Making `done` settle on
`awaiting_action` so a parked run does not hang. It is ergonomic and it ends rule 3: `done` becomes a
SECOND definition of terminality beside `isTerminal`, which is the sensor-corroborating-itself shape
[P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md) named and which P20 decision 2
exists to refuse. A consumer who wants to act on suspension folds the state they already have.

## Alternatives rejected

| | why not |
|---|---|
| **Leave it: the consumer copies the block** | It is thirteen copies in three disagreeing shapes, ten of which hang for ever, in the document that tells a consumer to copy them. The reference disagrees with itself about what the block must contain |
| **`Driver & { done }` — additive, zero typecheck cost** | `Object.assign(driver, { done })` mutates the driver and reads as driver-kept, which rule 2 denies. And a `Driver` built by hand out of `runtime.registry` — [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decision 14's own road — has no `done`, so the two roads diverge exactly where the type says they do not |
| **`start` unchanged, plus a new `runtime.run()` returning the pair** | Zero cost and honest, and it was priced and put to the maintainer. Refused because it is two entry points for one thing: `start` stays the trap, and P20 prediction 3 — *no consumer wants `done` without also wanting the driver* — makes the second method duplication rather than a choice |
| **`done` REJECTS on a driver refusal, as all thirteen copies do** | **It kills the consumer's process.** `start()` reports through `onRunFailure` AND rethrows, because the caller is on the stack — so on that one class of refusal `done` rejects a promise the caller is never handed and nobody can attach a `.catch` to. Measured in a child process with no `unhandledRejection` listener: **exit 1**, on an authoring error the consumer had correctly caught; the resolve road exited 0. It is fixable with a defensive `done.catch(() => {})` in the rethrow path, and that line's absence is invisible until production. Resolving also keeps ONE settlement rule and reports the whole `RunState` instead of an `Error` — and `failed` and `stuck` resolve on either road, so rejecting on `stopped` alone splits a failure surface a consumer must then learn |
| **Keep the fold INPUTS and re-fold, as Q293's own wording suggests** | Retains 445.5 KiB against 437.3, does 96 folds over up to 101 elements against 101 steps, and takes 23 ms against 6. It is also the retention P20's Scope Out names by id |
| **Keep nothing and re-read `driver.foldInputs()` each time** | Zero retention, and `foldInputs()` is `Object.freeze(this.inputs.map(freezeInput))` — a `structuredClone` of every result, per call. Measured: **5944 elements copied and re-frozen** for a 101-input run, and the slowest of the three |
| **A library-side deadline, or a `StartOptions` deadline** | A default is wrong for every run with a person in it, and an option is a fourth `StartOptions` member bought to replace one line of `Promise.race` that only exists because `done` is a promise. Rule 8 |
| **A promise kept by the `Driver`** | ADR 0014 refuses it by name, and the refusal is about `RN-R1` rather than about taste |
