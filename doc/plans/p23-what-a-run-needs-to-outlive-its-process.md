# P23 — What a run needs to OUTLIVE its process

**Status:** **DECLARED** 2026-09-24 on `5d704a1` (P1-P22 complete and retro'd, `doc/workflow.md`
[v0.23](../workflow.md)). **[W88](../work-items/w88-what-a-checkpoint-is.md) is DONE** — ADR 0064, `spec/run-state.md` v0.9, L6
unmoved, and **prediction 4 REVERSED on its first test** (`RN-R13` gained a clause for the header's
retained entry payload). **[W89](../work-items/w89-what-resuming-is.md) is DONE** — ADR 0065, `spec/run-state.md`
v0.10 (`RN-R19` to `RN-R25`), `runtime.resume`, L6 unmoved, prediction 2's WORDING reversed and its
substance confirmed. W90 is a row in the table below, declared with their full template when each starts, so its
declaration step can correct what this plan hands it. Its facts were measured into `dev-dist/p23/`
on that tree and nothing there is checked in, on P22 stop-and-ask (a)'s precedent — so each item's
declaration step RE-RUNS them (P15 decision 5).
**Question this plan answers:** *What does a run need so that it can be saved while it runs and
resumed after the process that ran it is gone — and can one stream of events serve both the saving
and a live view?*
**Exit artifact:** a flow on a real `FyflowScheduler`, in **both** L6 runtimes, **killed mid-run**
with its scheduler thrown away, and **resumed on a fresh runtime** from a checkpoint a consumer
stored by appending events — completing exactly as a run nobody killed, with the work re-run by the
resume asserted as a COUNT.
**Reserves:** W88-W91 (W91 expected unused), Q364-Q378, ADR 0064-0065.
*Derived by grep off the tree, never from a sentence — see [A note on ids](#a-note-on-ids).*

---

## Why this plan, and why now

**The maintainer's request of 2026-09-24**: the ability to save and resume a running flow. *Storing
the state is not this library's job; the API for it is.* The state must be available both as
**events** — to keep a stored copy current without repeatedly pulling snapshots, and later to drive
a UI showing live status — and as a **snapshot**, and a run must be **resumable from a snapshot**.

**This is [Q15](../open-questions.md), deferred since P1** — *is a run resumable across a process
restart?* — and it is the question `doc/concept.md` section 5 made the founding invariant for:
*"if run state is already a fold, durability is writing the log down."* Twenty-two plans have kept
that door open. **This plan measures whether it is actually open, and fact 1 says it is**: the
driver's whole private state is regenerated from the settlements in its log, exactly, with no line of
`src/` changed.

**It is also the first half of [Q21](../open-questions.md)** — *do we emit an event family for a
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
   than invented here ([Q249](../open-questions.md) stays open).
8. **No option to stop the library keeping the events in memory.** Fact 6 measured what it would
   buy: the events a checkpoint adds on top of what routing must keep are **~240 B a task whatever
   the results weigh** — 16% of a run at 1 KiB results and 1.4% at 16 KiB — because the RESULTS
   are the memory and routing reads them (`needs`, `resolve()`), `done` resolves with them, and the
   event sequence SHARES rather than copies them. The lever that matters is result retention,
   [Q19](../open-questions.md)'s unfinished half, and the maintainer's answer is *we will deal with
   memory later, if needed.*
9. **Resume REPLAYS the stored settlements through the driver's own routing, with every dispatch
   HELD, and REFUSES a log it cannot regenerate.** The stored events must be a PREFIX of what the
   replay produces — *a prefix, not equal*, because fact 4 measured that an event appended from
   inside `onFoldInput` is appended BEFORE the driver routes it, so a checkpoint taken there ends
   mid-step and the replay regenerates 1-7 events past it. A stored event the replay does not
   produce at the same index — a predicate that changed, a definition edited under the same version
   — is a refusal naming the index, never a silent divergence. **This is what turns
   [Q9](../open-questions.md)'s unenforced predicate purity into a named refusal at the one moment it
   would matter.**
10. **A stopped run is NOT resumable and is refused by name** — [Q38](../open-questions.md) is
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
| 1 | **The log regenerates the run.** `Driver.prototype.start` wrapped, `examples/l6.ts` run UNCHANGED on real schedulers (1833 assertions, 0 failed), and every captured driver — at most six per flow id, **180 drivers over 30 flows** of the 1275 L6 starts — replayed into a FRESH driver on a fake scheduler that records `addTask` and runs nothing, fed ONLY its settlements and resolutions in log order *(**corrected by [W88](../work-items/w88-what-a-checkpoint-is.md)'s declaration step: L6 starts 62 drivers, not 1275** — the spike's exit handler iterated `captured` with `for…of` while the replay drivers it started were pushed onto it, so the sample was mostly the harness's own replays; re-taken on L6's own drivers it is **61 captured over 30 flows, 57 reproduce exactly, 324 prefixes, 261 / 261 payloads, 998 events**, the other four being two `FD-R4` refusals and two `OR-R6` stops — [Q366](../open-questions.md). The conclusion stands; the numbers beside it are the spike's.)* | **169 of 180 reproduce EXACTLY** — the whole fold-input sequence element for element, and every private stateful structure (`log`, `inputs`, `dispatched`, `joinState`, `firedJoins`, `arrivals`, `started`, `failed`) — **and at every one of 673 prefix cut points**, nested map instances, parked tasks and 8 resolutions among them. The eleven that do not: **nine** whose `start` was refused by `FD-R4`, where the replay refuses identically; **two** stopped by `OR-R6`, whose uncloneable result never reached the log (decision 10). **Only 493 of the 2015 events are stimuli**; the driver regenerates the other 1522 |
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
  compares run ids and the scheduler silently overwrites a reused task id ([Q13](../open-questions.md)).
  **[Q364](../open-questions.md)**, and stop-and-ask (b).
- **A resumed task gets a FRESH retry budget.** The log records a task's `attempts` only when it
  SETTLES, so for a task in flight at the kill the attempts already spent are recorded nowhere — the
  re-dispatch starts again at zero on the new scheduler. **Not measured; derived from the record
  shape** — [Q365](../open-questions.md), and a stated consequence of decision 6 rather than a fix.
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
- **Result retention and any memory option.** Decision 8; [Q19](../open-questions.md)'s remaining
  half is the follow-on plan if memory ever matters.
- **Resuming a STOPPED run** ([Q38](../open-questions.md)), **migrating a checkpoint across flow
  versions**, and **versioning the registry** ([Q249](../open-questions.md)). Decisions 7 and 10.
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
| **W90** | **The exit artifact** — kill and resume on real workers in both L6 runtimes, where **L6 MOVES and this row says by how much**; `AGENTS.md` and a `README.md` paired fence teaching append-then-resume; the version bump if stop-and-ask (a) makes the change breaking | `examples/**`, `AGENTS.md`, `README.md`, `examples/README.md`, `package.json`, `deno.json` | W89 | **L0 and L1-L5 UNMOVED**; L6 in both runtimes; `check:docs`; `check:markdown`; the full `npm run gate` |

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
| W88 | `AGENTS.md` | `RunHandle` gains a member and `DriverOptions`/`StartOptions` may; the reference's executed snippets carry literals no typecheck lane reads ([Q348](../open-questions.md)). ***Measured by W88: needed, for a reason seeded against W89*** — `NotStarted` reached §9's executed error-class enumeration ([Q101](../open-questions.md)); no snippet broke on `RunHandle` |
| W88 | `scripts/build-browser-tests.mjs` | only if a new suite reads a `spec/**` document the browser bundle does not inline — wrong in both directions across four items, so re-measured rather than assumed. ***Measured by W88: not needed*** |
| W89 | `examples/l6.ts` | a `resumed` fold-input kind, if stop-and-ask (a) takes it, reaches every exhaustive walk over `FoldInput.kind` in the harness. ***Measured by W89: needed, for W88's reason and not this one*** — `examples/**` has no exhaustive walk over the kind; the new `replay` field reached `DRIVER_FIELDS` |
| W89 | `AGENTS.md` | new refusal classes reach the executed error-class snippet, which ENUMERATES the package's `Error` subclasses ([Q101](../open-questions.md)). ***Measured by W89: needed, as seeded*** — `ResumeRefused` went red at `X4`; and W88's *"resuming from one is not built yet"* was found by W89's conformity reader |
| W90 | `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | `RUN_FLOOR`, `README_SNIPPET_FLOOR` and the `X8` pair list, for a new section and a new README fence |
| W90 | `test/definition/wiring.test.ts`, `spec/outcome-record.md` section 4 | a new corpus flow document moves both CENSUSES pinned outside their corpus ([Q342](../open-questions.md), [Q360](../open-questions.md)) — only if W90 adds a flow rather than resuming an existing one |
| W90 | `scripts/check-workers-selftest.mjs` | only if W90 adds a worker |

---

## Predictions, to be written down BEFORE the items that test them

*The scope column states what the measurement COVERED and claims nothing beyond it.*

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **Resume needs NO change to routing** — every private structure is regenerated by the existing listener and `resolve()`, and the items add a replay road beside routing rather than inside it | fact 1: **180 drivers, 30 flows, 673 prefixes, on a FAKE scheduler** with inline dispatch; fact 4 on REAL schedulers for **two flows only** | a structure the replay cannot regenerate — something keyed by wall time, by scheduler state, or by a callback's side effect — which would put a resume branch inside routing |
| 2 | **The at-least-once cost is EXACTLY the in-flight set at the stored prefix** — no task that settled in the stored events is re-run, and every task that did not is. ***W89: the SUBSTANCE confirmed and the WORDING reversed*** — no settled task was re-dispatched at any of 14 kill points, and the set is the in-flight set at the END of the replay: 14 of 29 re-dispatched tasks were dispatched only in the regenerated tail (`RN-R21`) | fact 4: 14 kill points, 1-4 re-dispatches each, all at the same task ids | a settled task re-dispatched, or an in-flight one lost — either means the held-dispatch road and the settled set disagree |
| 3 | **REACH: a consumer that appends `onFoldInput` events after the header and resumes after a restart needs nothing but `runtime.resume` and its own store** | **none — this is a reach.** No consumer-facing resume has been written; fact 4 drove the driver by hand | state that lives OUTSIDE the log — a retry budget half spent ([Q365](../open-questions.md)), a resource group's held slot, a transform's compiled cache, a person's resolution arriving while the process was down — making a resumed run differ from one nobody killed |
| 4 | **The fold changes by at most ONE input kind, and no existing `spec/` rule moves** — only rules are ADDED | decision 9 plus fact 1: the replay regenerated every existing kind unchanged | a rule whose TEXT has to change for resume — `RN-R13`'s release moments or `OR-R10`'s stop — which would mean resume is not additive, and `doc/concept.md` section 5's promise was not kept |

---

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q15](../open-questions.md) | *is a run resumable across a process restart* — deferred since P1, and the row this plan exists to answer | W89 |
| [Q21](../open-questions.md) | *an event family for a UI* — the STREAM half is W88's; REDACTION is declared out | W88, half |
| [Q364](../open-questions.md) | *a fresh runtime mints a run id a resumed run already holds* — raised by this declaration | W89 |
| [Q365](../open-questions.md) | *a resumed task gets a fresh retry budget* — raised by this declaration | W89 |
| [Q38](../open-questions.md) | *is a stopped run resumable* — declared OUT, refused by name | out |
| [Q19](../open-questions.md) | *result retention* — declared OUT; the follow-on plan if memory matters | out |
| Q366-Q378 | *reserved for the items* | |

---

## Stop and ask a human — ALL THREE ANSWERED 2026-09-24, each as recommended

*Answered the same day the plan was declared, after the alternatives in each row were priced. **(a) makes the change BREAKING**, so the package moves to `0.5.0` at W90's close; (b) and (c) are W89's to build.*

| | the question | recommendation — and the answer |
|---|---|---|
| **(a)** | **Is a resume RECORDED as an event?** A resumed run's events are otherwise indistinguishable from a run never interrupted, and the at-least-once re-dispatch of decision 6 is invisible to the consumer, the fold and a live view alike | **Yes — a `resumed` fold input naming the re-dispatched task ids**, appended after the replay and before the re-dispatch. *Its cost*: a new `FoldInput` kind breaks any consumer switching EXHAUSTIVELY on `kind`, exactly as `UnsatisfiableJoin.regionPath` broke a consumer constructing one — so the package moves to **`0.5.0`** at W90's close, on W77's and W86's precedent **ANSWERED: yes, as recommended** |
| **(b)** | **What stops a fresh runtime minting a run id a resumed run holds?** ([Q364](../open-questions.md)) | **The runtime REFUSES a `start` or a `resume` whose run id is LIVE on it, and its minted counter SKIPS ids in use** — one `Set` the runtime already has reason to keep. *Over*: requiring every resumable run to carry a caller-chosen id (a rule a consumer can forget) and minting globally unique ids ([Q34](../open-questions.md), [Q85](../open-questions.md) — a larger question this plan should not answer by accident) **ANSWERED: refuse, as recommended** |
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

**[Q142](../open-questions.md) was MEASURED at this declaration, on the tree it commits, and does NOT
fire**: probe 1's cut tree (`doc/decisions` removed) is **114 documents against `M3`'s floor of 123 —
margin 9** — and probe 2's (`doc/decisions` and `doc/plans` removed) **5030 links against `M4`'s 5270
— margin 240**. This declaration adds one document to `doc/work-items/`, which neither probe cuts, and
W89 and W90 will add two more there, so **`M3`'s margin reaches 7 by W90's declaration** before any
record step — narrow enough that each item measures it again rather than inheriting this sentence.
