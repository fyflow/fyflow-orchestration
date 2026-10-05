---
id: ADR 0064
title: "A checkpoint is the run's whole event sequence and a header of what it cannot regenerate, handed out as a COPY, and every event has a position"
status: accepted
date: "2026-09-24"
item: W88
raised-by: P23, Q15, Q21
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0064 — A checkpoint is the run's whole event sequence and a header of what it cannot regenerate, handed out as a COPY, and every event has a position

**Raised by:** [P23](../plans/p23-what-a-run-needs-to-outlive-its-process.md) decisions 2-5, taken by
[W88](../work-items/w88-what-a-checkpoint-is.md); [Q15](../questions/q15.md)'s first half and
[Q21](../questions/q21.md)'s stream half

## Context

The maintainer asked for a run to be SAVED while it runs and RESUMED after its process is gone, with
the library defining the API and never the storage (P23 decision 1), and with one stream of events
serving both a store and a live view. `doc/concept.md` section 5 made this the founding promise —
*if run state is a fold, durability is writing the log down* — and
[ADR 0014](0014-the-driver-produces-the-folds-ordered-input-sequence.md) already produces the
sequence: `foldInputs()` and its push half `onFoldInput`.

What W88's declaration step re-took before deciding anything, on the tree it starts from:

| | measured | so |
|---|---|---|
| 1 | **The sequence regenerates the run.** L6's own drivers — **62 starts over 30 flows**, 61 captured — replayed into fresh drivers on a fake scheduler, fed only their settlements: **57 reproduce exactly**, every event and every private structure, at 324 prefix cut points; the other four are two `FD-R4` refusals (the replay refuses identically) and two `OR-R6` stops. *(P23 fact 1 read 180 / 169 / 673; its harness iterated `captured` with `for…of` while its own replay drivers were pushed onto it. [Q366](../questions/q366.md).)* | the settlements are sufficient; the whole sequence is what a live view also needs |
| 2 | **The entry payload is in no record.** `start()` reads its argument three times — the `FD-R4` boundary walk, `compose`, and `enter` — and keeps it nowhere; **261 of 261** replayed dispatch payloads equal what the real scheduler was sent only because the replay began from the original payload | the header must carry it, and the driver must KEEP it |
| 3 | **Every `FoldInput` kind round-trips `structuredClone`** — one constructed element per kind, keyed by `FoldInput['kind']`, and the corpus's 998 events, **all eight kinds present** — **and the harness's `deepEqual` cannot see a lost prototype**: a class instance and its clone compare EQUAL | the rule is `structuredClone`, and its observer cannot be `equal` |
| 4 | **Copy against reference**, at 10 000 tasks: a copy (`foldInputs()`) costs **22 / 24 / 61 ms** at 16 B / 1 KiB / 16 KiB results and holds one more copy of the events while kept; a reference costs 0.1-0.3 ms and shares every result with the driver; the `v8.serialize` a store then pays is **19 / 22 / 113 ms** on either | the copy costs about what storing it costs |
| 5 | **A consumer receives events before `start()` returns** — over L6's 62 starts, 1 on 59, 5 on a nested map at the entry, 0 on the two refused; and 2N + 1 for an entry fan-out of N branches, so not bounded by 5 | a header handed out by `start` arrives after the first events |

## Decision

1. **A checkpoint is `{ header, events }`, and `events` is the WHOLE fold-input sequence in append
   order** — exactly `foldInputs()` at that moment (`RN-R14`). Not a `RunState`, which cannot restore
   a run because the driver's private routing state is not in it; not the settlements alone, which
   regenerate a run but cannot serve a live view. **So an event IS a checkpoint's element**, and a
   checkpoint is every event so far. `Driver.checkpoint()` returns it; `snapshot()` keeps its meaning
   (P23 decision 3). Before `start()` there is no checkpoint and `checkpoint()` throws **`NotStarted`**.
2. **The header is five facts, each a SELECTION from one named source** (`RN-R15`): `format`;
   `runId`, the driver's own; `flowId` and `version`, the definition's; and `entryPayload`, **a
   `structuredClone` of the value `start()` was CALLED with, taken at the call**, kept by the driver
   for the life of the run and cloned again on every `checkpoint()`. The entry node still receives the
   caller's value exactly as before; the copy is the header's alone. **An entry payload
   `structuredClone` refuses throws `DataCloneError` from `start()` with the driver unstarted** —
   [`OR-R12`](../../spec/outcome-record.md)'s shape at the other caller-initiated boundary.
3. **`format` is `CHECKPOINT_FORMAT`, `1` now**, and it moves only when what a checkpoint carries
   moves (`RN-R16`). It is what a resume refuses on; the refusal is W89's.
4. **The contract is `structuredClone`, and the checkpoint is a COPY** (`RN-R17`): the header and
   every event of every kind round-trip to the same data and the same prototypes, and nothing in a
   checkpoint is an object the driver holds.
5. **Every element has a POSITION — its index in the sequence — and `onFoldInput` receives it as a
   second argument** (`RN-R18`). It is chosen when the element is appended, from `push`'s own return,
   so a re-entrant append cannot move it; a runtime that composes `onFoldInput` (ADR 0058) hands it on
   unchanged. **`runtime.start`'s handle carries the header**: `{ driver, done, header }`, the driver's
   header read back rather than assembled by the runtime (P23 decision 4).

## Consequences

**What this makes easy.** A consumer keeps a store current by writing the header once and appending
what `onFoldInput` hands it, keyed by position — never pulling a checkpoint again — and the store
holds exactly *everything before position N*. The same callback drives a live view. A checkpoint can
be taken at any moment, including inside the callback, where it holds `k + 1` events at position `k`:
**it ends mid-step**, which is why W89's divergence check is *prefix* rather than *equal* (P23
decision 9).

**What this makes hard, and the cost is real.**

1. **The header arrives after the first events.** Measured, 1 to 5 of them. A consumer who writes
   strictly in arrival order must buffer until `start` returns; one who writes by position need not.
   The position exists for that reason as much as for naming a prefix. *(This read *1 to 5*; that is L6's range, and an entry fan-out of N delivers 2N + 1 — W88's conformity reader.)*
2. **The driver RETAINS one more value**: its own copy of the entry payload, for the life of the run.
   One copy of one value, constant in the number of tasks settled and proportional to the payload —
   for a `map` at the entry, its whole item list — and **`RN-R13` gains a clause saying so**. *(This
   read *it sits beside that rule's two terms rather than in them, and `RN-R13`'s text does not move*;
   W88's conformity reader read `RN-R13` as stating a footprint that IS two terms, which the retained
   copy makes false. So P23 prediction 4 — no existing rule's text moves — REVERSES on its first test,
   by retention rather than by resume.)* The byte walk's
   universe gained the field on its WALKED side, and both lists that bind it (`examples/l6.ts` and
   `test/driver/retention.test.ts`) fired by name.
3. **A payload `structuredClone` refuses no longer starts a run.** Before this decision a payload
   holding a function started one on an inline pool; it cannot be checkpointed, so it is refused before
   the run exists rather than discovered when someone asks. BREAKING, and named; the package moves at
   W90's close (P23 stop-and-ask (a)).
4. **The header holds what crosses the clone.** A class instance in the entry payload is a plain
   object in the header — [`OR-R11`](../../spec/outcome-record.md) applied to the entry payload — so a
   resumed run's re-dispatched tasks are composed from that copy, and on an inline pool the original run
   handed its entry node the instance itself. W89 inherits this.
5. **A checkpoint costs one copy of the events while it is held.** Refused as a reference on the
   contract, not the price: a caller writing into a result it was handed would rewrite the run
   (`OR-R7`), and P23 decision 5 says a checkpoint holds no live reference.

**What a future reader is likely to try that this forbids.** Assembling the header in the runtime
from `flow`, `payload` and `runId` — it agrees on every field but the one that matters, the entry
payload, which would then be the caller's live object. Counting positions in the runtime's wrapper —
it agrees while that wrapper sees a run from its first element and is wrong the first time a
driver's sequence does not start there. Judging the round trip with the harness's `equal` — it calls
a class instance and its clone equal.

## Alternatives rejected

| | why not |
|---|---|
| a checkpoint that is a `RunState` | cannot restore a run: join state, fired joins, arrivals and the dispatched set are the driver's and are not in it (P23 decision 2) |
| the settlements alone | sufficient to regenerate (fact 1) and useless to a live view, and it gives up the divergence check a resume makes against the regenerated sequence |
| `checkpoint()` returning the driver's own array | 0.1-0.3 ms instead of 22-61, and every result shared with the driver: a consumer's write rewrites the run (`OR-R7`), and it is a live reference P23 decision 5 forbids |
| an entry payload kept BY REFERENCE, or cloned at `checkpoint()` | both agree with the copy until the caller mutates its object between `start()` and the first checkpoint, which is exactly the case a store meets |
| an unstarted driver's checkpoint with `entryPayload: undefined` | indistinguishable from a run started with `undefined` — the resume that reads it cannot tell |
| a `NotCloneable` class for an uncloneable entry payload | `OR-R12` already rules that a caller-initiated boundary throws the platform's `DataCloneError`; a second class for the same fact at the second boundary would make the two disagree |
| the position as a property ON the event | the event is a fold input the fold reads and a stored element a resume compares; a field the fold ignores would be a field two sequences can disagree on for no reason |
| a runtime-side `onHeader` callback, so the header could be written before the first event | a second channel for one fact; the position already makes write order irrelevant |
