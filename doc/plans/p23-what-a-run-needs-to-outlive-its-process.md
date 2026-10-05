# P23 — What a run needs to OUTLIVE its process

**Status:** **COMPLETE and RETRO'D** — retro run 2026-09-25, `doc/workflow.md` [v0.24](../workflow.md), ONE change adopted and SIX refused ([Retro](#retro)). Declared 2026-09-24 on `5d704a1` (P1-P22 complete and retro'd, `doc/workflow.md`
[v0.23](../workflow.md)). **[W88](../work-items/w88-what-a-checkpoint-is.md) is DONE** — ADR 0064, `spec/run-state.md` v0.9, L6
unmoved, and **prediction 4 REVERSED on its first test** (`RN-R13` gained a clause for the header's
retained entry payload). **[W89](../work-items/w89-what-resuming-is.md) is DONE** — ADR 0065, `spec/run-state.md`
v0.10 (`RN-R19` to `RN-R25`), `runtime.resume`, L6 unmoved, prediction 2's WORDING reversed and its
substance confirmed. **[W90](../work-items/w90-a-run-killed-and-resumed-on-real-workers.md) is DONE and P23 was COMPLETE pending its retro** until its [retro](#retro) — the exit artifact in both L6
runtimes, L6 **1853 / 100**, the package at `0.5.0`, and its declaration step's correction: `shutdown()` DRAINS, so the
kill is the consumer's store and not the scheduler thrown away. Its facts were measured into `dev-dist/p23/`
on that tree and nothing there is checked in, on P22 stop-and-ask (a)'s precedent — so each item's
declaration step RE-RUNS them (P15 decision 5).
**Question this plan answers:** *What does a run need so that it can be saved while it runs and
resumed after the process that ran it is gone — and can one stream of events serve both the saving
and a live view?*
**Exit artifact:** a flow on a real `FyflowScheduler`, in **both** L6 runtimes, **killed mid-run**
with its scheduler thrown away, and **resumed on a fresh runtime** from a checkpoint a consumer
stored by appending events — completing exactly as a run nobody killed, with the work re-run by the
resume asserted as a COUNT. *(**"With its scheduler thrown away" is FALSE and stood here until P23's
retro** (pass 3 rule 6): `runtime.shutdown()` DRAINS — it runs the work in flight and what that work
dispatches — so the KILL is the consumer's store freezing, and the shutdown is cleanup the store never
sees. W90's declaration step measured it ([Q376](../questions/q376.md)) and the artifact is built on the
store.)*
**Reserves:** W88-W91 (W91 expected unused), Q364-Q378, ADR 0064-0065.
*Derived by grep off the tree, never from a sentence — see [A note on ids](#a-note-on-ids).*

---

## Why this plan, and why now

**The maintainer's request of 2026-09-24**: the ability to save and resume a running flow. *Storing
the state is not this library's job; the API for it is.* The state must be available both as
**events** — to keep a stored copy current without repeatedly pulling snapshots, and later to drive
a UI showing live status — and as a **snapshot**, and a run must be **resumable from a snapshot**.

**This is [Q15](../questions/q15.md), deferred since P1** — *is a run resumable across a process
restart?* — and it is the question `doc/concept.md` section 5 made the founding invariant for:
*"if run state is already a fold, durability is writing the log down."* Twenty-two plans have kept
that door open. **This plan measures whether it is actually open, and fact 1 says it is**: the
driver's whole private state is regenerated from the settlements in its log, exactly, with no line of
`src/` changed.

**It is also the first half of [Q21](../questions/q21.md)** — *do we emit an event family for a
UI?* — because the stream persistence needs is the stream a live view needs, and the maintainer's
framing is that both use ONE API. The other half — REDACTION, a structural view of the stream that
omits task results — is **declared OUT on the maintainer's answer**: *not needed yet, maybe never.*

---

## What the design settled, and how

*Decided before fan-out (`doc/workflow.md` section 7 rule 3). Items 1-8 are the maintainer's answers
of 2026-09-24, each given after the alternatives were priced; 9-10 are what the facts below forced.*

1. **The library defines the API and never the storage.** No file, no database, no serializer. A
   consumer decides where a checkpoint and its events go.
2. **A CHECKPOINT is the run's FULL event sequence plus a HEADER — not a `RunState`, and not the
   settlements alone.** *Over*: a `RunState`, which cannot restore a run because the driver's private
   state (join state, fired joins, per-instance arrivals, the dispatched set) is not in it; and the
   settlements alone, which fact 1 measures as SUFFICIENT (493 of 2015 events) but which cannot serve
   a live view and give up the divergence check of decision 9. **So an event IS a checkpoint's
   element, and the event stream and the checkpoint are one format**: a checkpoint is every event so
   far, and every event after it is an append.
3. **Named `checkpoint()`** — `driver.checkpoint()` returns `{ header, events }`. *Over*: reusing
   `snapshot()`, which already exists, returns the settlement records alone, and is documented in
   `AGENTS.md`; changing its meaning would be a silent break.
4. **The HEADER is handed out by BOTH `runtime.start` and `checkpoint()`**, so a consumer that
   appends events knows what to write first without calling `checkpoint()` at all. It carries at
   least a FORMAT version, the `runId`, the flow's `flowId` and `version`, and the ENTRY PAYLOAD —
   fact 2 is why the last is not optional.
5. **The contract is `structuredClone`, not JSON.** A checkpoint and every event are PLAIN DATA
   that round-trips `structuredClone` exactly — no functions, no class instances, no live references
   to a driver or a scheduler — and the consumer picks the serializer (`v8.serialize`, IndexedDB, a
   JSON with revivers). *Over*: a JSON guarantee, which the library cannot make, because
   [`OR-R11`](../../spec/outcome-record.md) defines a result as whatever survives the clone and that
   includes `Map` and `Date`. The reference names the JSON caveat.
6. **Resume RE-DISPATCHES every task that was dispatched and never settled in the stored events** —
   the maintainer's answer, over parking them for a person or a per-node declaration. **So resume is
   AT-LEAST-ONCE**, including for a task that really finished but whose event the consumer had not
   yet stored, and **workers must tolerate running twice**; the reference says so in those words.
   A task parked for a person (`awaiting_action`) is NOT in flight — it stays parked, and `resolve()`
   works on it after resume.
7. **A checkpoint whose `flowId` or `version` differs from the definition it is resumed against is
   REFUSED, by name.** No migration. *And the REGISTRY carries no version*, so a worker's code or a
   type's config changing under a checkpoint is the consumer's responsibility — declared out rather
   than invented here ([Q249](../questions/q249.md) stays open).
8. **No option to stop the library keeping the events in memory.** Fact 6 measured what it would
   buy: the events a checkpoint adds on top of what routing must keep are **~240 B a task whatever
   the results weigh** — 16% of a run at 1 KiB results and 1.4% at 16 KiB — because the RESULTS
   are the memory and routing reads them (`needs`, `resolve()`), `done` resolves with them, and the
   event sequence SHARES rather than copies them. The lever that matters is result retention,
   [Q19](../questions/q19.md)'s unfinished half, and the maintainer's answer is *we will deal with
   memory later, if needed.*
9. **Resume REPLAYS the stored settlements through the driver's own routing, with every dispatch
   HELD, and REFUSES a log it cannot regenerate.** The stored events must be a PREFIX of what the
   replay produces — *a prefix, not equal*, because fact 4 measured that an event appended from
   inside `onFoldInput` is appended BEFORE the driver routes it, so a checkpoint taken there ends
   mid-step and the replay regenerates 1-7 events past it. A stored event the replay does not
   produce at the same index — a predicate that changed, a definition edited under the same version
   — is a refusal naming the index, never a silent divergence. **This is what turns
   [Q9](../questions/q9.md)'s unenforced predicate purity into a named refusal at the one moment it
   would matter.**
10. **A stopped run is NOT resumable and is refused by name** — [Q38](../questions/q38.md) is
    declared OUT. Fact 1 found the one class of run whose log cannot regenerate its own stop: a
    result `OR-R6` refuses never reaches the log, so the replay of such a run leaves that task in
    flight. A completed or `stuck` run resumes to itself and dispatches nothing.

---

## What was measured before this plan is declared

*On `5d704a1`'s tree, node 24.20.0, in `dev-dist/p23/` — `replay.ts`, `kill-resume.ts` and
`footprint.ts`. No `src/` edit: every fact is taken through the driver's existing public and private
surface from outside.*

| # | fact | measured |
|---|---|---|
| 1 | **The log regenerates the run.** `Driver.prototype.start` wrapped, `examples/l6.ts` run UNCHANGED on real schedulers (1833 assertions, 0 failed), and every captured driver — at most six per flow id, **180 drivers over 30 flows** of the 1275 L6 starts — replayed into a FRESH driver on a fake scheduler that records `addTask` and runs nothing, fed ONLY its settlements and resolutions in log order *(**corrected by [W88](../work-items/w88-what-a-checkpoint-is.md)'s declaration step: L6 starts 62 drivers, not 1275** — the spike's exit handler iterated `captured` with `for…of` while the replay drivers it started were pushed onto it, so the sample was mostly the harness's own replays; re-taken on L6's own drivers it is **61 captured over 30 flows, 57 reproduce exactly, 324 prefixes, 261 / 261 payloads, 998 events**, the other four being two `FD-R4` refusals and two `OR-R6` stops — [Q366](../questions/q366.md). The conclusion stands; the numbers beside it are the spike's.)* | **169 of 180 reproduce EXACTLY** — the whole fold-input sequence element for element, and every private stateful structure (`log`, `inputs`, `dispatched`, `joinState`, `firedJoins`, `arrivals`, `started`, `failed`) — **and at every one of 673 prefix cut points**, nested map instances, parked tasks and 8 resolutions among them. The eleven that do not: **nine** whose `start` was refused by `FD-R4`, where the replay refuses identically; **two** stopped by `OR-R6`, whose uncloneable result never reached the log (decision 10). **Only 493 of the 2015 events are stimuli**; the driver regenerates the other 1522 |
| 2 | **The ENTRY PAYLOAD is the one thing the log does not carry.** A `dispatched` event holds a task id and no payload | the replay RECOMPUTES every dispatch's payload, and **all 616 equal what the real scheduler was sent** under that id — because the replay begins from the original entry payload. [W42](../work-items/w42-what-a-decision-sees.md) measured it first: the entry payload is *in no record at any moment*. So the header carries it (decision 4), and it carries the `runId`, because every task id embeds it |
| 3 | **The events are serializable** | **all 2015 round-trip `structuredClone` EXACTLY**, and on this corpus JSON too; a failure's `error` is a STRING in the record, not an `Error`, so `OR-R11`'s lossy-`Error` row does not reach the log |
| 4 | **KILL and RESUME on real schedulers.** Two flows — [W86](../work-items/w86-score-each-item-then-fan-out-per-item.md)'s nested-map exit artifact and `triage` — killed after K settlements for EVERY K, the scheduler shut down, and resumed on a FRESH runtime: replay through a scheduler wrapper that HOLDS every `addTask`, then the held tasks that never settled handed to the real scheduler | **14 of 14 kill points complete IDENTICALLY to a run nobody killed** (outcome, every node's state and result), re-dispatching **1 to 4 tasks** each — the at-least-once cost of decision 6 — **at the SAME task ids, with no refusal** from `ID-R1` or `ID-R4`, because the replay has already put them in the dispatched set. **Every stored log is an exact PREFIX of its replay, 1-7 events short** (decision 9) |
| 5 | **Divergence is visible.** Every predicate inverted in the replay *(13 and 46 on L6's own drivers — W88, as fact 1)* | **22 runs dispatch different ids** and the prefix comparison catches each at the first differing event; 147 route identically, because the inverted predicate chose the same edges on that data |
| 6 | **What one run of 10 000 tasks holds**, a `map` on a fake scheduler, weighed by `v8.serialize` (an object reached twice counted once) | at 16 B / 1 KiB / 16 KiB results: the events **5.0 / 14.6 / 161.1 MiB**, the settlement log alone 2.4 / 12.1 / 158.5, the `RunState` 1.7 / 11.3 / 157.8, **all three together 6.0 / 15.6 / 162.1** — the three SHARE the results — and the events that are NOT settlements **2.3 MiB at every size**, ~240 B a task (decision 8) |

### What the facts found that nobody asked about

- **A fresh runtime mints a run id that is already in use.** `createRuntime` mints `r${++minted}`
  from a counter that starts at zero PER RUNTIME (`src/scheduler/runtime.ts`), and a resumed run
  KEEPS its id, because its task ids embed it. So a process that resumes `r1` and then starts a new
  run mints `r1` again — two drivers of one run id on one scheduler, where `ID-R4`'s first tier
  compares run ids and the scheduler silently overwrites a reused task id ([Q13](../questions/q13.md)).
  **[Q364](../questions/q364.md)**, and stop-and-ask (b).
- **A resumed task gets a FRESH retry budget.** The log records a task's `attempts` only when it
  SETTLES, so for a task in flight at the kill the attempts already spent are recorded nowhere — the
  re-dispatch starts again at zero on the new scheduler. **Not measured; derived from the record
  shape** — [Q365](../questions/q365.md), and a stated consequence of decision 6 rather than a fix.
- **The fake scheduler's replay is SYNCHRONOUS and the driver has no `async` anywhere**, so a replay
  of 493 stimuli ran inside a `process.on('exit')` handler. Resume costs no event-loop turn per event.

---

## Scope

**In**

1. **What a checkpoint IS** — the header, the event sequence, the `structuredClone` contract, the
   entry payload kept by the driver, `driver.checkpoint()`, and the header on `runtime.start`'s
   handle. **ADR 0064.** *(W88)*
2. **What RESUMING is** — replay with dispatch held, the prefix check refusing a diverging log, the
   re-dispatch of the in-flight set, parked tasks staying parked and resolvable, the refusals
   (flow version, unknown format, stopped run), `runtime.resume(flow, checkpoint, options)` returning
   the same `{ driver, done }` as `start`, and the run-id collision. **ADR 0065.** *(W89)*
3. **The exit artifact** — kill and resume on real workers in both L6 runtimes, the re-dispatch
   COUNT asserted, `AGENTS.md` teaching both halves (append events, resume from them), and a
   `README.md` paired fence. *(W90)*

**Out** — named rather than left implicit

- **Storage, serializers, and anything that writes a file.** Decision 1.
- **Redaction and a UI.** Q21's second half; the maintainer's *not needed yet, maybe never*.
- **Result retention and any memory option.** Decision 8; [Q19](../questions/q19.md)'s remaining
  half is the follow-on plan if memory ever matters.
- **Resuming a STOPPED run** ([Q38](../questions/q38.md)), **migrating a checkpoint across flow
  versions**, and **versioning the registry** ([Q249](../questions/q249.md)). Decisions 7 and 10.
- **Exactly-once.** Decision 6 makes resume at-least-once and says so; idempotence is the worker's.
- **A scheduler that persists its own queue.** The scheduler has none, and
  `../fyflow-scheduler/PERSISTENCE_ANALYSIS.md` rates adding it *medium to high* — it is not this
  plan's, and nothing here depends on it.

---

## Work items

*Serial. Each owns its files; the `Owns` block is written from the row here, never from the item's
title (`doc/workflow.md` section 7 rule 2).*

| | what it does | Owns | Depends on | Gate |
|---|---|---|---|---|
| [**W88**](../work-items/w88-what-a-checkpoint-is.md) **DONE** | **What a checkpoint IS** — ADR 0064; the header and its format version; the driver keeping the entry payload; `driver.checkpoint()`; the header on `RunHandle`; the `structuredClone` contract as a rule with an observer over every event kind; the sequence position every event has | `src/driver/**`, `src/fold/**`, `src/scheduler/**`, `spec/**`, `test/**`, `doc/decisions/0064-*` | nothing | **L0 under all five lanes and `lint`, each SEPARATELY**; L1-L5 in three runtimes; `check:spec`; **`check:docs`** (the public surface grows); **L6 UNMOVED** |
| [**W89**](../work-items/w89-what-resuming-is.md) **DONE** | **What RESUMING is** — ADR 0065; `runtime.resume` and the driver's resume; replay with dispatch held; the prefix check and its refusal; the in-flight re-dispatch; parked tasks after resume; the flow-version, format and stopped-run refusals; the run-id collision | `src/driver/**`, `src/fold/**`, `src/scheduler/**`, `spec/**`, `test/**`, `doc/decisions/0065-*` | W88 | the same as W88's, **L6 UNMOVED** |
| [**W90**](../work-items/w90-a-run-killed-and-resumed-on-real-workers.md) **DONE** | **The exit artifact** — kill and resume on real workers in both L6 runtimes, where **L6 MOVES and this row says by how much**; `AGENTS.md` and a `README.md` paired fence teaching append-then-resume; the version bump if stop-and-ask (a) makes the change breaking | `examples/**`, `AGENTS.md`, `README.md`, `examples/README.md`, `package.json`, `deno.json` | W89 | **L0 and L1-L5 UNMOVED**; L6 in both runtimes; `check:docs`; `check:markdown`; the full `npm run gate` |

**W91 is reserved and expected unused**, on P19's W75, P20's W79, P21's W83 and P22's W87 precedent.

**Every row's `Gate` names L0**, which [W85](../work-items/w85-what-a-nested-region-carries-and-how-it-ends.md)
and [W86](../work-items/w86-score-each-item-then-fan-out-per-item.md) each had to add to P22's rows
at their own declaration step — P22's retro, refusal (iii).

---

## The exceptions each item will take, seeded

*P16's retro recorded this as a table rather than a rule, P18-P21 each seeded one at their
declaration, and **P22 did not — and its exit artifact shipped with no exceptions table until its
conformity reader asked** (P22's retro, refusal (iii)). Seeded here from the three plans' late
tables; each item re-measures its row at its declaration step and says where it was wrong.*

| item | file, outside `Owns` | why it is predicted |
|---|---|---|
| W88 | `examples/l6.ts`, `examples/run-flow.ts`, `examples/retention.ts` | a NEW private field on `Driver` (the entry payload) reaches the byte walk's both-ways `DRIVER_FIELDS` lists — W55's universe binding, which fired on W59 and W61 for exactly this. ***Measured by W88: `examples/l6.ts` ONLY*** — `run-flow.ts` walks by exclusion and `retention.ts` carries no list |
| W88 | `AGENTS.md` | `RunHandle` gains a member and `DriverOptions`/`StartOptions` may; the reference's executed snippets carry literals no typecheck lane reads ([Q348](../questions/q348.md)). ***Measured by W88: needed, for a reason seeded against W89*** — `NotStarted` reached §9's executed error-class enumeration ([Q101](../questions/q101.md)); no snippet broke on `RunHandle` |
| W88 | `scripts/build-browser-tests.mjs` | only if a new suite reads a `spec/**` document the browser bundle does not inline — wrong in both directions across four items, so re-measured rather than assumed. ***Measured by W88: not needed*** |
| W89 | `examples/l6.ts` | a `resumed` fold-input kind, if stop-and-ask (a) takes it, reaches every exhaustive walk over `FoldInput.kind` in the harness. ***Measured by W89: needed, for W88's reason and not this one*** — `examples/**` has no exhaustive walk over the kind; the new `replay` field reached `DRIVER_FIELDS` |
| W89 | `AGENTS.md` | new refusal classes reach the executed error-class snippet, which ENUMERATES the package's `Error` subclasses ([Q101](../questions/q101.md)). ***Measured by W89: needed, as seeded*** — `ResumeRefused` went red at `X4`; and W88's *"resuming from one is not built yet"* was found by W89's conformity reader |
| W90 | `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | `RUN_FLOOR`, `README_SNIPPET_FLOOR` and the `X8` pair list, for a new section and a new README fence. ***Measured by W90: needed, as seeded*** — and the self-test's `X9` probe anchors on the README's version literal, which the seed did not name |
| W90 | `test/definition/wiring.test.ts`, `spec/outcome-record.md` section 4 | a new corpus flow document moves both CENSUSES pinned outside their corpus ([Q342](../questions/q342.md), [Q360](../questions/q360.md)) — only if W90 adds a flow rather than resuming an existing one. ***Measured by W90: not needed*** — three existing flows |
| W90 | `scripts/check-workers-selftest.mjs` | only if W90 adds a worker. ***Measured by W90: not needed*** |

---

## Predictions, to be written down BEFORE the items that test them

*The scope column states what the measurement COVERED and claims nothing beyond it.*

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **Resume needs NO change to routing** — every private structure is regenerated by the existing listener and `resolve()`, and the items add a replay road beside routing rather than inside it | fact 1: **180 drivers, 30 flows, 673 prefixes, on a FAKE scheduler** with inline dispatch; fact 4 on REAL schedulers for **two flows only** | a structure the replay cannot regenerate — something keyed by wall time, by scheduler state, or by a callback's side effect — which would put a resume branch inside routing |
| 2 | **The at-least-once cost is EXACTLY the in-flight set at the stored prefix** — no task that settled in the stored events is re-run, and every task that did not is. ***W89: the SUBSTANCE confirmed and the WORDING reversed*** — no settled task was re-dispatched at any of 14 kill points, and the set is the in-flight set at the END of the replay: 14 of 29 re-dispatched tasks were dispatched only in the regenerated tail (`RN-R21`). ***W90: CONFIRMED on real workers in both L6 runtimes*** in that wording — 0 settled tasks re-dispatched at 14 kill points, 14 of 29 tail-only, and the stored events' set wrong at 8 of 14 | fact 4: 14 kill points, 1-4 re-dispatches each, all at the same task ids | a settled task re-dispatched, or an in-flight one lost — either means the held-dispatch road and the settled set disagree |
| 3 | **REACH: a consumer that appends `onFoldInput` events after the header and resumes after a restart needs nothing but `runtime.resume` and its own store** ***W90: CONFIRMED for the store, three processes deep, with its exceptions named*** — a retry budget half spent ([Q365](../questions/q365.md), re-measured in deno), and one the column did not name: the consumer's own `shutdown()` is not a kill ([Q376](../questions/q376.md)); confirmed IN-PROCESS only ([Q378](../questions/q378.md)) | **none — this is a reach.** No consumer-facing resume has been written; fact 4 drove the driver by hand | state that lives OUTSIDE the log — a retry budget half spent ([Q365](../questions/q365.md)), a resource group's held slot, a transform's compiled cache, a person's resolution arriving while the process was down — making a resumed run differ from one nobody killed |
| 4 | **The fold changes by at most ONE input kind, and no existing `spec/` rule moves** — only rules are ADDED | decision 9 plus fact 1: the replay regenerated every existing kind unchanged | a rule whose TEXT has to change for resume — `RN-R13`'s release moments or `OR-R10`'s stop — which would mean resume is not additive, and `doc/concept.md` section 5's promise was not kept |

---

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q15](../questions/q15.md) | *is a run resumable across a process restart* — deferred since P1, and the row this plan exists to answer | W89 |
| [Q21](../questions/q21.md) | *an event family for a UI* — the STREAM half is W88's; REDACTION is declared out | W88, half |
| [Q364](../questions/q364.md) | *a fresh runtime mints a run id a resumed run already holds* — raised by this declaration | W89 |
| [Q365](../questions/q365.md) | *a resumed task gets a fresh retry budget* — raised by this declaration | W89 |
| [Q38](../questions/q38.md) | *is a stopped run resumable* — declared OUT, refused by name | out |
| [Q19](../questions/q19.md) | *result retention* — declared OUT; the follow-on plan if memory matters | out |
| Q366-Q378 | *reserved for the items* | |

---

## Stop and ask a human — ALL THREE ANSWERED 2026-09-24, each as recommended

*Answered the same day the plan was declared, after the alternatives in each row were priced. **(a) makes the change BREAKING**, so the package moves to `0.5.0` at W90's close; (b) and (c) are W89's to build.*

| | the question | recommendation — and the answer |
|---|---|---|
| **(a)** | **Is a resume RECORDED as an event?** A resumed run's events are otherwise indistinguishable from a run never interrupted, and the at-least-once re-dispatch of decision 6 is invisible to the consumer, the fold and a live view alike | **Yes — a `resumed` fold input naming the re-dispatched task ids**, appended after the replay and before the re-dispatch. *Its cost*: a new `FoldInput` kind breaks any consumer switching EXHAUSTIVELY on `kind`, exactly as `UnsatisfiableJoin.regionPath` broke a consumer constructing one — so the package moves to **`0.5.0`** at W90's close, on W77's and W86's precedent **ANSWERED: yes, as recommended** |
| **(b)** | **What stops a fresh runtime minting a run id a resumed run holds?** ([Q364](../questions/q364.md)) | **The runtime REFUSES a `start` or a `resume` whose run id is LIVE on it, and its minted counter SKIPS ids in use** — one `Set` the runtime already has reason to keep. *Over*: requiring every resumable run to carry a caller-chosen id (a rule a consumer can forget) and minting globally unique ids ([Q34](../questions/q34.md), [Q85](../questions/q85.md) — a larger question this plan should not answer by accident) **ANSWERED: refuse, as recommended** |
| **(c)** | **Does resume re-dispatch at the SAME task id or bump its attempt segment?** | **The same id** — measured working in fact 4, and it keeps the replay's dispatched set and the stored events equal. A bumped segment would make every resumed task a NEW node instance to the fold **ANSWERED: the same id, as recommended** |

---

## A note on ids

**Reserves W88-W91, Q364-Q378, ADR 0064-0065.** Derived by grep off the tree at this declaration,
never from a sentence:

| | on disk | so |
|---|---|---|
| highest work item | **W86** | W87 was reserved by P22 and **closed unissued**, so it is skipped; P23 starts at **W88** |
| highest question | **Q363** | P22 used all of Q345-Q363; P23 starts at **Q364** |
| highest ADR | **0062** | 0063 was reserved by P22 and skipped; P23 starts at **0064** |
| highest plan | **P22** | this is **P23** |

## The baseline this plan was declared on

Taken by P22's retro's confirming `npm run gate` on the tree `5d704a1` commits — `GATE EXIT=0`, zero
`FAIL` lines, content digest `ab94cb6b840466b0` identical at both ends: **L6 1833 assertions over 60
real runs** in node 24.20.0 and deno 2.9.6; **L1-L5 47 files / 1322 assertions** in node, deno and
chromium; `check:spec` **7 / 61 / 108**; `check:docs` **35 snippets: 29 run, 6 check**;
`check:workers` **17 / 17**; `check:markdown` **147 documents, 6749 relative links, 355 anchored**;
census **284 / 221 / 2 / 61** before this declaration's rows.

**[Q142](../questions/q142.md) was MEASURED at this declaration, on the tree it commits, and does NOT
fire**: probe 1's cut tree (`doc/decisions` removed) is **114 documents against `M3`'s floor of 123 —
margin 9** — and probe 2's (`doc/decisions` and `doc/plans` removed) **5030 links against `M4`'s 5270
— margin 240**. This declaration adds one document to `doc/work-items/`, which neither probe cuts, and
W89 and W90 will add two more there, so **`M3`'s margin reaches 7 by W90's declaration** before any
record step — narrow enough that each item measures it again rather than inheriting this sentence.

---

## Retro

*Pass 3, run 2026-09-25 on `a26c92a`'s tree. **ONE change adopted, SIX refused**, and
`doc/workflow.md` is [v0.24](../workflow.md), where the full reasoning lives. What follows is this
plan's own evidence. Every harness was re-run in an isolated copy and every number below was taken on
the tree this retro commits unless it says otherwise.*

### The central finding: the only rung readings that were WRONG were a GRADER's

**Of the twenty-four defects in the three items' *What broke* lists that a rung FIRED on, twenty-two
were read correctly — and the two misread were both misread by a rule 8 HARNESS's grader, not by a
person.** [W88](../work-items/w88-what-a-checkpoint-is.md)'s harness counted `FAIL` lines and never
matched one to the probe that was supposed to produce it, so `d1` was graded CAUGHT by a
`typecheck:tests` that was already red for an unrelated reason (What broke 8); W88 asked for the fix
in words — *fires for the reason it names is a requirement on the SET that the harness does not
implement* — and [W89](../work-items/w89-what-resuming-is.md) BUILT it: a probe is caught only when
a failure line within four lines carries the text its declaration names, which reported `e2`
WRONG-REASON on its first run. **[W90](../work-items/w90-a-run-killed-and-resumed-on-real-workers.md)
inherited that grader and it graded three CRASHES as CATCHES** (`a5`, `c1`, `c5`): block (2g) had
thrown, its `try` turned the throw into a named failure, and the `CROSS_ROW_SUBJECTS` membership then
printed every subject's name TWO lines below its `FAIL` line — inside the window. *Section 6 pass 3
rule 3's sharpest kind: a mechanism asked for by one item, built by the next, FOLLOWED by the third,
and wrong.*

**Why no existing requirement reaches it.** Every requirement on the harness controls the RUNGS (a
probe that changes nothing comes back clean) or the TREE (restore, anchors, digest, environment).
**None controls the GRADER** — the one component that turns a rung's output into the verdict the
Record prints. And the crash discriminator, *non-zero exit with zero `FAIL` lines*, is defeated by
construction wherever the subject reports its own throw as a failure, which every block outside
L6's row loop now does ([W59](../work-items/w59-what-a-node-type-is.md)'s per-row catch, and the
`try` around each block). **Measured at this retro**: block (2g) with a `throw` as its first
statement, run once at L6 in an isolated copy, exits 1 with **FOUR named `FAIL` lines** — `kill and
resume`, two `gate` counts and `cross-row` — so it is not a CRASH to the discriminator at all, and
only the reason check can tell it from a catch. Re-grading W90's thirty-five declared catches against
that log: | the grader's window after each `FAIL` line | W90's catches whose reason it finds in their OWN logs | catches it would grade CAUGHT on the CRASH log, where the block never ran |
|---|---|---|
| 1 line — the `FAIL` line alone | **7 / 35** — an L6 clause prints its text on the NEXT line | 0 |
| **2 lines — W90's shipped fix** | **35 / 35** | **4** — `b1`, `b2`, `d5`, `r11`, whose named clauses (the membership and the counts) a crash fires too |
| **4 lines — W89's grader, and W90's author pass** | **35 / 35** | **28 / 35** |

**At the width W89 built, twenty-eight of W90's thirty-five catches could not be told from a block
that never ran; at the width W90 shipped, four still cannot, and no width finds every probe's own
reason while refusing the crash.** *A reason window cannot be chosen by reading the output — it has to
be graded against a probe whose right answer is NO*, which is what the change below makes the set
carry. (`dev-dist/p23r/grader.py`, untracked like every harness before it.)

**THE ONE CHANGE: rule 8's requirement on the HARNESS gains that its GRADER is controlled** — the set
carries a probe whose right verdict is CRASH (the subject made to throw) and one whose right verdict is
WRONG-REASON (a failure in a clause the probe does not name), both graded against those expectations on
every pass; and a reason is matched on the failure line the named clause writes, never in a window
that can reach another failure's text. It is **v0.11's control one component along**, and the third
occurrence of the class across two plans — P21's W82 `b6b`, where `X4` laundered a snippet's
`TypeError` into its own named failure, refused as a rule at one occurrence.

### Name the rung

**SEVENTY-THREE defects across the three items' own *What broke* lists — 27 / 24 / 22** — counted one
per DISTINCT defect a row names (W88's row 9 is five findings, W90's row 11 three claims, W89's row 9
eight), and **W89's row 3 counted as ZERO**: its five entries are ratchets moved deliberately, each
firing by name, which is the design working rather than a defect. **TWENTY-FOUR name a rung that FIRED
(9 / 7 / 8), TWENTY-TWO were read correctly, and the TWO misread were both a GRADER's** (above).

| the rung | what it caught |
|---|---|
| rule 8's AUTHOR pass | W88's `b7` and `d2`, and its own `c2b` misdeclared; W89's `a9`, `b9`, `b16` — each deletable for ZERO — and its harness's first CRASH (`a12`) and WRONG-REASON (`e2`); W90's `c5` WRONG-REASON, a malformed probe of the author's own |
| rule 8's RE-RUN with the readers' edits | W88's `r7`, the adequacy reader's own *equivalent* classification measured wrong |
| L0, each lane run separately | W89's `typecheck:tests` RED on a cast while `npm test` was green; W90's `typecheck:examples` three times on the block's own types |
| an item's own new suite or block on its FIRST run | W88's entry-payload claim; W89's `freezeInput` handing out the driver's own array (W88's every-kind copy case, doing what it was built for); W90's chain expecting a `resumed` twice, and claim (3)'s first source not delivered by a drain |
| a gate-entry self-test | W90's `check:docs:selftest` at 33 / 34 — rule 7 (c) discriminating exactly as designed |
| the environment clause | W88's bare `node` resolving to 16 in the author's shell, and the harness's assertion on its first run |
| node's type stripping | W88's own probe written with a constructor parameter property |

**FORTY-NINE have no rung, and FOURTEEN of the seventy-three are in the INSTRUMENTS** — the facts
harness capturing its own replays and its prototype-blind `deepEqual` (W88, both at the declaration
step), three probes and a probe declaration, two graders, the heredoc discipline broken twice, and
**the exit artifact's own KILL**: P23 wrote *killed mid-run with its scheduler thrown away*, and
`shutdown()` DRAINS ([Q376](../questions/q376.md)). Of the forty-nine, **thirty-seven were found by a
reader, four by a declaration step's re-take, and eight by an item reading its own files.**

**And W90's twenty-two are ALL outside the product** — the harness, the reference, the counts and
the plan — because it wrote no product code; fourteen of them have no rung, which is P22's reading of
W85 one plan on: *an item whose deliverable is a harness has defects of the kind no rung fires on.*

### The predictions

| # | kind | verdict |
|---|---|---|
| 1 | derived, from fact 1 (a FAKE scheduler) and fact 4 (two flows) | **CONFIRMED, its wording narrowed by the item that met it** (W89). *No change to routing* is false in its letter — a dispatch HELD during a replay and a callback GATED by position are two new branches inside routing's own sites — and true of what it meant: neither decides a road. P18 prediction 2's shape, a derived prediction whose wording was stronger than its observable |
| 2 | derived, from fact 4 | **SUBSTANCE CONFIRMED, WORDING REVERSED** (W89), then **CONFIRMED on real workers in both L6 runtimes in W89's wording** (W90). Its prediction column said *the in-flight set at the stored PREFIX*; its own harness computed `held − settled` — the set at the END of the replay — and 14 of 29 re-dispatched tasks were dispatched only in the lost tail. *A prediction that names a SELECTION its measurement did not make*: the stored-prefix set is the well-formed wrong selection that coincides with the right one at a QUIESCENT cut, the default position, and differs at 8 of 14 mid-step ones — v0.23's clause, inside a prediction's own sentence |
| 3 | **the REACH** | **CONFIRMED for the store, three processes deep, with its exceptions named** (W90). Its reversal column's FIRST entry is a real exception — a retry budget half spent, measured three attempts against two ([Q365](../questions/q365.md)) — two more differ in cost and not in result (a group slot, a compiled transform), the fourth (a person's resolution across the restart) is exercised by the parked kill, resolved on the resumed driver, and **one it did not name**: the consumer's own `shutdown()` is not a kill ([Q376](../questions/q376.md)). Confirmed in-process only ([Q378](../questions/q378.md)) |
| 4 | derived, from decision 9 and fact 1 | **REVERSED at its first test** (W88), by RETENTION: `RN-R13`'s text moved for the header's copy of the entry payload; W89 then moved `RN-R15`, `RN-R18` and `ID-R3` by a clause each. **Its measurement answered a narrower question than its wording** — fact 1 is about which fold-input KINDS a replay regenerates, the prediction about which rules' TEXT moves — which is P13's reading of a derived reversal, a fourth plan |

**So: two confirmed (one narrowed), one reversed, one split** — and **the one REACH is the one that
held**, with its reversal column right about its first entry and silent about the instrument. *Two of
three derived predictions went wrong in their WORDS while their measurements were right*, and both in
the direction P22's finding names: the wording described the default case.

### v0.23's selection clause: FOLLOWED in all three, and short once in each — on a selection nobody framed as one

| item | the declared selection table | the selection it missed | found by |
|---|---|---|---|
| W88 | the header — `r1`, version 1, the composed payload, the result, clone-late, a reference: **every one caught on the first pass** | *which RUN a position counter belongs to* — a runtime counter agrees on a FIRST run, the default position | BOTH readers |
| W89 | five rows, one of them **W88's miss**, which caught W88's dated ceilings `c3` and `r6` | the `stopped` refusal's own `index`, whose only fixtures sat at the stored length and the last element, where both wrong answers are the right one | the adequacy reader (`a18`, `a19`) |
| W90 | seven rows, each arranged so the wrong one DIFFERS — the cut, the set, the count, the keys, the parked task, *identical*, K = 1 | the ORDER `RN-R21` fixes: the scheduler-side claim compared SORTED sets, so a reversal above three ids was L6 GREEN in both runtimes | the adequacy reader (BLOCKING 1) |

**Each item closed the previous one's miss and missed a new one**, and every miss was in a place the
author had not framed as a selection — a counter's scope, a refusal's REPORTED number, an order a
comparison discards. W90's is a new variety: its FIXTURE could differ and its OBSERVER could not see it,
because a sorted comparison is blind to the one selection the rule makes. **Not amended** — refusal (1)
below.

### Refused, six, each with a measurement

**(1) A fifth amendment to obligation (a)** naming three more selections — a counter's scope, a
refusal's index, an order. **Three misses, three items, all found by a reader and none shipped**, and
the table above is the regress P22 recorded for (a) and P21 for (d): an amendment that names examples
is followed and short at the next example. What the clause asks is a QUESTION a reader asks, and the
readers asked it.

**(2) A rule that a plan's exit artifact names the INSTRUMENT that performs its event, and the
declaration measures it.** Two occurrences in two plans — P22's real pool interleaving LESS than a fake
([Q358](../questions/q358.md), found at W86's build) and P23's `shutdown()` DRAINING
([Q376](../questions/q376.md), W90's declaration re-take 2). **Both were caught before anything
shipped**, the second by P15 decision 5's re-take — prompted, W90's file says, by the item's own
instructions. *The mechanism is the re-take and it fired*; the cost was a plan sentence, corrected here
under pass 3 rule 6.

**(3) A rule for a fix applied at ONE of the sites that share a defect** — W90's pass 2 found the guard
for its reader's `r6` on one resume of four, and P22's W86 shipped its crash repair one block short of
the identical defect. **v0.8's re-run with the readers' exact edits checked in is the counter-measure
and it caught W90's**; W86's was caught by a reader. Zero shipped.

**(4) A rule that a block outside L6's row loop REPORTS rather than throws** — W67, W86 and W90, three
plans. Every block now sits in a `try` that turns a throw into ONE named failure; what W90 found is that
one throw still costs a block every claim (its `r6` names **13** clauses where it had named one), so
the repair is per SUBJECT inside a block, which is a property of one file and the next item's to build
where it adds one. The workflow half — *a crash is not a detection* — is already rule 8's, and the change
above is what makes a laundered crash visible to the harness.

**(5) A `doc/` check, for the TWENTY-SECOND time, on the English class — and this retro does NOT refuse
the other class, because its criterion is met.** P23's English stale claims are the plan's own kill,
`AGENTS.md`'s *resuming from one is not built yet*, `README.md`'s *P22 is DECLARED* through five
commits and three sibling *whole rung* claims — nothing to compare them against without reading.
**Two classes are machine-comparable and neither is under the standing refusal**: `doc/decisions/README.md`
against the directory it indexes — **measured over history: 29 of the 46 commits that touched
`doc/decisions/` shipped an index missing at least one ADR on disk, in FIVE episodes** (0022-0029,
0030-0036, 0039-0046, 0049-0058 — eight ADRs behind at its worst — and 0062), where W88 said *the fourth*;
and [Q171](../questions/q171.md)'s L6 count copies, which **P20's retro NAMED for the next plan and three
plans have not built** — `README.md`'s current-count cell read **1724 / 58 for six commits** (W86 to W89)
while `DECLARED_TOTAL` read 1833, and a check reading only *does README contain the total* passes all
six, because the total appears in another sentence. **Both are a set or a number a check can derive from
another file**, which is the criterion the refusal has named since P18 and the shape `X7` already has.
They are an item's work in `scripts/**`, and this retro hands both to the next plan's declaration rather
than counting a refusal it no longer holds.

**(6) An `Owns` pre-declaration rule, for the ELEVENTH plan** — P23 SEEDED its exceptions table at the
declaration, as P22's retro argued it should, and every item re-measured its rows: **eight rows seeded,
five fired — two of them for a reason the seed did not give — and three did not; the two exceptions nobody
seeded were W88's corrections to this plan's own facts and W90's `X9` probe anchor, the second found at
W90's own declaration step**. Zero undeclared. *The procedure measured from the side where it was kept.*

### The numbers

**Rule 8 across the plan, all 169 probes RE-RUN at this retro on the shipped tree** (W88's 46, W89's
77, W90's 46) — each in its own isolated copy: a `git clone --no-hardlinks` of `a26c92a` with
`core.longpaths` set (a copy under the scratch directory could not check out six ADR file names
otherwise) and `node_modules` copied in, zero symlinks and zero reparse points measured first, each
item's own harness run unchanged against it. **All three read digest `e758ab75c60df81d` over 397
files, identical at both ends of every set**, and the retro's documents were written while the probes
ran.

| set | at this retro |
|---|---|
| W88's 46 | **40 caught, 5 declared ceilings RUN, 1 control clean, 0 crashes — after NINE ABORTS, all rule 7 (b) and all re-anchored**: W89 moved every line they pin (`openRun` re-indented the runtime's composition, the handle's `return` and the settled flag; `delivers(seq)` gated the driver's callback; the runtime's type import gained `Checkpoint`), and re-anchored, seven are CAUGHT and two survive as declared. Those two are `c3` and `r6`, W88's DATED ceilings — they survive on W88's own rung, a first run, and are **CATCHES on the rung their reasons name**, re-taken in W89's set below as its `c1` and `c2`. **W88's harness has no reason check**, so its forty catches are graded by count alone — the defect the change above closes |
| W89's 77 | **73 caught, 3 declared ceilings RUN (`b12`, `c3`, `c4`), 1 control clean, 0 wrong-reason, 0 crashes, 0 aborts, 0 against declaration** — exactly W89's pass 2, with W88's `c3` and `r6` caught as its `c1` and `c2` |
| W90's 46 | **2 clean, 35 caught, 9 declared ceilings RUN, 0 wrong-reason, 0 crashes, 0 aborts, 0 against declaration** — exactly W90's pass 3, with its `a6` re-anchor holding. Its reason check is the 2-line window above, so its catches are graded by NAME — with the four exceptions the crash log measures |

**Across the plan: 169 probes, **4 controls clean, 148 caught, 17 declared ceilings RUN, ZERO undeclared survivors, ZERO crashes, ZERO wrong-reason, NINE aborts — all W88's, all rule 7 (b), all re-anchored — and ZERO against declaration after re-anchoring**** — and the dated-ceiling clause's yield is **ZERO NEW
catches for the fifth plan running**: W88's two were re-run and taken by W89, the item their reasons
name.

**Readers: six passes, none empty, and THREE overlaps — 2, 2, 1, the fifty-fourth to fifty-sixth
measurements**, band unmoved. **And section 6's list was short by THREE, not two**: this retro's prompt
named W89's and W90's because W90's Record said *W89's fifty-fifth is not yet in the list*, and W88's
fifty-fourth was not either — while the sequence under the total had stopped at W74 through three
retros (appended here). **Blocking findings: W88 3 + 6, W89 3 + 8, W90 2 + 3 — twenty-five, split 8
conformity / 17 adequacy**, and the split held: the conformity readers found claims that were false,
the adequacy readers bounds that were not there. **All THREE conformity readers' central obligations
came back with ZERO disagreements on the VALUES — the third plan running to record three of three.**

**Late exceptions: zero undeclared in any of the three.**

**Census CONFIRMED for the TWENTY-FIFTH plan running — 295 / 230 / 1 / 64, 295 of 295 in exactly one
cluster cell**, by W88's parser unchanged — which refuses ten rows by id (Q119, Q71, Q87, Q123, Q131,
Q135, Q204, Q215, Q301, Q343), classified by hand as eight open and two resolved. The retro raises no
question and resolves none.

**[Q142](../questions/q142.md) did not fire in any of the three items** — measured before each record
step at margins of 9 / 218, 8 / 177 and 7 / 104 (`M3` files / `M4` links) — **and measured at this
retro, before its edits, on the shipped tree: `M3` 116 files against 123 — margin 7 — and `M4` 5193
links against 5270 — margin 77**, where W90's file says *78 after the record step*: its last Record cell
was filled after the measurement, v0.12's WHEN clause at one link, corrected in W90's file. **Re-measured AFTER this retro's edits, on the tree it commits: `M3` 7, and `M4` 5233 links —
margin 37**, forty links narrower, every one in `CLAUDE.md`, `doc/README.md`, `doc/workflow.md` and the register — files
probe 2 does not cut. Q142 does not fire; **the margin is within six of the 31 at which P18's retro FIRED**, so the next
plan's declaration measures it before it writes a paragraph rather than inheriting this sentence.

**The confirming `npm run gate` over the retro's final tree: `GATE EXIT=0`, ZERO `FAIL` lines**, 1449 s in node
24.20.0; `selftests` 8 / 8 ok in 1326.7 s wall; spec 7 / 61 / 120; markdown 153 / 7069 / 381; docs 36 / 30 / 6; L1-L5
51 / 1376 in node, deno and chromium; L6 1853 / 100 in node and deno — every rung UNMOVED, which is what a retro that
edits only documents must show. Content digest `e25d5028097b5be2` over 397 tracked and untracked-unignored files,
identical before and after — RUN and redirected, never piped. This sentence is the one edit made after it, and
`check:markdown` was re-run over it.

**W91 CLOSED unissued. Q364-Q378 all used or spent** — Q368-Q370 (W88) and Q375 (W89) reserved and
unused. **ADR 0064 and 0065 both taken. The next plan starts at W92, Q379 and ADR 0066** *(and [P24](p24-what-a-node-may-remember-across-a-runs-branches.md) did, 2026-09-25)* — derived by
grep off the tree at this retro, never from this sentence, and `CLAUDE.md` already says so.
