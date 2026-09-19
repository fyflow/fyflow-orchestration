# P20 — What the runtime owes a consumer that the driver does not

**Status:** **IN PROGRESS** — [W76](../work-items/w76-what-start-accepts.md) is DONE and retro-ready; W77 and W78 are not started. Declared 2026-09-19 on `817fd73` (P1-P19 complete and
retro'd, `doc/workflow.md` [v0.20](../workflow.md)), its six facts measured the same day into
`dev-dist/p20/`.
**Question this plan answers:** *What does `createRuntime` owe a consumer that a `Driver` does not —
and what does `runtime.start()` hand back?*
**Exit artifact:** one L6 row on a real `FyflowScheduler` in **both** runtimes in which the consumer
holds **only what `start` returned**: a fan-out's region events counted through `StartOptions`, and
the run's end awaited in ONE line — plus the reference's thirteen hand-rolled copies of that line
reduced to the number [W78](../work-items/) measures.
**Reserves:** W76-W79 (W79 expected unused), Q315-Q329, ADR 0058-0059 (0059 expected unused).
*Derived by grep off the tree, never from a sentence — see [A note on ids](#a-note-on-ids).*

---

## Why this plan, and why now

**Two register rows, both raised by items doing something else, both saying a consumer cannot do
something they would ordinarily want.**

| | |
|---|---|
| [**Q297**](../open-questions.md) | **`onRegionEvent` is a `Driver` option the runtime does not forward**, so a consumer on the road `AGENTS.md` recommends cannot subscribe to region events at all. Raised by [W71](../work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md), which found it only because the snippet it was converting **built its own `Driver`** — a fake scheduler does not merely fail to prove a claim, it lets the reference demonstrate an API its readers do not have |
| [**Q293**](../open-questions.md) | **A `Driver` has no completion promise**, so *the run is over* is a block a consumer copies. Raised by [W69](../work-items/w69-a-getting-started-example-a-consumer-can-copy.md) while writing the getting-started snippet — the one a reader meets first, and the one they will paste |

**Neither was found by looking at the consumer surface. Both were found by an item standing on it.**
That is the signature of a surface nobody has aimed a plan at, and it is true here in the literal
sense: [P18](p18-a-flow-and-its-runtime-from-documents-alone.md) built `createRuntime`,
[P19](p19-what-a-schema-buys-an-author.md) built the checks an author runs before it, and W69-W71
rewrote the reference onto it — **so `createRuntime` is the newest thing on the tree and the only
layer here that has never been a plan's subject.** Every plan since P10 has taken the open row that
says the library is missing something a person wants ([Q12](../open-questions.md),
[Q11](../open-questions.md), [Q187](../open-questions.md), [Q206](../open-questions.md),
[Q19](../open-questions.md)/[Q22](../open-questions.md)); these two are what is left of that shape.

### Are these ONE question? — the framing was the maintainer's and it was CHECKED before it was taken

The brief proposed *"what does a consumer hold after `start()`?"* as the one question. **Strictly,
that covers Q293 and not Q297**: a callback you passed IN is not something you hold, so the two rows
sit on opposite sides of the call. Taken at face value the plan would be Q293 with a chore stapled
to it, and the honest move would be to say so.

**Fact 1 is what makes them one question rather than two, and it was not known before this
declaration.** `DriverOptions` has **eighteen** members, a consumer of `createRuntime` reaches them
by exactly four roads, and **exactly ONE is on none**. That one is `onRegionEvent`.

*(**The road SIZES this paragraph first gave were `2 / 6 / 6 / 7` and were corrected by
[W76](../work-items/w76-what-start-accepts.md), whose own orphan test failed on them.** That is 21
slots over 18 members and therefore not a partition at all: road (c) was read off `RuntimeOptions`'
DECLARATION, and four of that interface's six — `base`, `flows`, `createPool`, `createScheduler` —
are the runtime's own and are not `DriverOptions` members. Derived from what `start` actually
FORWARDS the road is **two**, and `2 + 6 + 2 + 7 = 17` with `onRegionEvent` the eighteenth. **The
conclusion above survives and only the arithmetic under it failed**, which is why nobody caught it —
the orphan count is 1 either way, and `fact1-partition.mjs` prints four road sizes and never adds
them up. `runId` is also on TWO roads under a reading that fact does not take, because
`StartOptions` declares it in its own body rather than in the `Pick`.
[Q316](../open-questions.md).)*

So the subject is not *what a consumer holds*; it is **what the seam passes through and what it
owes**, and the two rows are that question's two answers:

| | the debt | who could pay it |
|---|---|---|
| **Q297** | a **pass-through** the seam dropped. The driver already produces region events, already freezes them (fact 6B), and the runtime simply does not carry the handle | anyone — this is a defect, and the fix is two lines |
| **Q293** | a **composition** only the seam can do. [ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) forbids the driver subscribing to itself, so a completion promise **cannot** come from the driver; the runtime already holds the driver, so it is the only thing that can offer one without reopening that decision | **only the runtime** |

*The asymmetry is the finding rather than a fudge.* One is the seam losing something it was handed;
the other is the seam declining to do the one thing a seam is for. **A plan whose question has two
answers of different kinds is a plan; a plan whose question has one answer twice is an item.**

**And Q297 alone would not have been a plan** — it is two lines in `src/` (fact 2). It is declared as
[W76](../work-items/) and the plan says plainly that it is the small item, on
[P19](p19-what-a-schema-buys-an-author.md)'s own shape, where W72 was the small contract and W74 the
artifact. What it is not is trivial: **fact 2 measures that the half-fix is FREE** — widening the
`Pick` and forgetting the forwarding line is green on all five typecheckers, every test,
`check:source` and `check:docs` — so the obvious way to close Q297 ships a typed option that is
silently dropped, which is Q297 one step worse.

### The departure from P19's *slices beyond*, recorded

**[P19](p19-what-a-schema-buys-an-author.md) ordered the next three slices and this plan is none of
them.** Read off that file rather than inherited: (1) per-settlement result validation as an opt-in,
priced first; (2) `oneOf`, **if prediction 3 confirms**; (3) node-type versioning
([Q249](../open-questions.md)).

- **Slice 2's condition did NOT fire.** P19's retro records prediction 3 as **UNTOUCHED** — its
  subject arrived from inside rather than from a consumer ([Q311](../open-questions.md)). So slice 2
  is not next; it is not anything yet.
- **Slice 1 is ready and is genuinely next in that order.** It is a measurement plan, and a good one.
- **It is deferred, and the argument is P19's own.** P19 departed from P16's *strict mode* on the
  maintainer's argument that the schemas were for the AUTHOR and *a runtime failure is a different
  problem*. That argument does not expire when the author's half ships — **it says the run-time half
  is a cost to be priced, not a gap to be closed**, and nothing on the tree is blocked by its
  absence. Q293 and Q297 are gaps: a consumer on the recommended road cannot watch a fan-out, and
  must copy a block to learn a run ended. **A gap outranks a price.**

*Recorded here rather than argued in a commit message, on P19's own precedent for a departure: the
reason belongs in the plan, so the next plan argues with it rather than re-deriving it.* Slice 1
keeps its place and is [Scope Out](#scope) below.

---

## What the design settled, and how

*Decided before fan-out (`doc/workflow.md` section 7 rule 3). Each is recorded with the alternative
it was chosen over, so an item argues from the decision rather than re-deriving it.*

1. **The RUNTIME keeps the fold; the driver never learns one exists.** *Over*: a promise kept by the
   `Driver`. ADR 0014 spends a paragraph forbidding exactly that — *"a fold with a subscription has a
   lifetime, a fold with a lifetime has state between calls, and ladder L3's fold-the-same-log-twice
   stops meaning anything"* — and it names `attachFold(driver)` as the ergonomic next step it
   refuses. **A runtime-kept promise does not touch it**: the runtime is a caller, `onFoldInput` is
   the push half ADR 0014 rule 3 built for a caller, and `fold` still never learns a driver exists.
   Fact 4B measured the prototype resolving to a `RunState` **canonically identical** to the one the
   copied pattern computes. *(The shape to watch is `Object.assign(driver, { done })` — see decision
   3: it is runtime-kept and it LOOKS driver-kept, which is the half of ADR 0014 a reader would get
   wrong.)*
2. **`done` is the SAME expression moved, not a second definition of terminality.** *Over*: a
   promise the runtime resolves from its own bookkeeping. `doc/workflow.md` rule 8 obligation (c)'s
   LIMIT and [P15](p15-what-a-run-retains-and-what-a-result-may-be.md)'s *a sensor cannot corroborate
   itself* are the standing warning against a second observer, and the register's row cites it. **It
   binds a second SOURCE, not a second call site**: `done` resolves from `fold(inputs)` and
   `isTerminal` — the two functions the consumer would have called — so there is one definition of
   terminality with one more caller. **An item that reimplements either has broken this decision**,
   and that is the sentence its adequacy reader should try to falsify first.
3. **Both roads for the return type are PRICED and the choice is a stop-and-ask.** Fact 5c, all five
   typecheckers run separately: `{ driver, done }` costs **30 errors in 2 files**, both ours;
   `Driver & { done }` costs **ZERO**. The plan **leans breaking**, on honesty — an additive `done`
   hanging off the driver object tells every reader that the driver produced it, which is the one
   thing decision 1 exists to deny — and [ADR 0048](../decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)/[W67](../work-items/w67-a-flow-from-documents-on-real-workers.md)
   is the tree's own precedent for a bump made for a reason. **The maintainer decides.**
4. **Forwarding `onRegionEvent` adds one name to `StartOptions` and one spread line, and touches
   `RuntimeRegistry` not at all.** P18 decision 14 says `runtime.registry` is *exactly the object this
   runtime hands its own drivers*; a per-RUN callback is not part of that object and must not become
   one. Fact 1's partition is what makes this checkable: after W76, `StartOptions` is eight and the
   orphan count is **zero**.
5. **The two hand-written lists get bound, because fact 2 measured the half-fix free.** `StartOptions`'
   `Pick` and `start`'s conditional spreads are two literals nobody compares —
   `doc/workflow.md` rule 8 obligation (e)'s **third shape**, *a LIST is a claim about another list*,
   with the procedure *find the other list and compare BOTH WAYS*. **The comparison is not naive**:
   `joinPolicy` is legitimately in the `Pick` with no spread line, because it is applied as
   `?? liveToken`. A binding that does not know that shape reports a false positive on the tree that
   ships, which is why this is a TEST rather than a `check-source` clause ([Q315](#open-questions-this-plan-carries)).
6. **What `done` does about a person in the loop is a DECISION, not a detail.** Fact 6C:
   `isTerminal` is `outcome !== 'running' && outcome !== 'awaiting_action'`, so a run parked for a
   human **is not terminal** and a `done` that waits for terminality **never settles** until someone
   resolves it. Measured end to end: parked at `awaiting_action`, `done` unsettled; after
   `resolve()`, `completed`. That is correct and it is a trap, and it is stop-and-ask (b).
7. **Nothing here changes what a worker receives, and the plan DOES move L6 — declared and priced.**
   Every constraint the brief named holds: ADR 0001 rules 1 and 4 (routing stays in the driver),
   ADR 0014 (decision 1), P18 decisions 10 and 14 (decision 4). The exception is stated rather than
   hoped for: **W78's exit artifact adds an L6 row**, so L6's numbers move, and its row says by how
   much. W76 and W77 declare L6 UNMOVED.

---

## What was measured before this plan is declared

*Six facts, on `817fd73`, Node 24.20.0 asserted in every shell, every rung RUN and redirected to
`dev-dist/p20/` and read by `$?`. The tree was held still by a content digest —
**`e3f998edc43e0498` over 360 files, identical before the first probe and after the last**, with
`git status` clean at both ends. Every probe restored and the restore asserted byte for byte.*

| # | fact | where |
|---|---|---|
| **1** | **`DriverOptions` has 18 members; a `createRuntime` consumer reaches them by four roads; exactly ONE is on none.** Supplied by the runtime 2 (`runId`, `scheduler`); `RuntimeRegistry` 6; `RuntimeOptions` **2 as measured by W76, stated as 6 here** ([Q316](../open-questions.md) — four of that interface's six are not `DriverOptions` members, so `2 / 6 / 6 / 7` is 21 slots over 18 and is not a partition; `2 / 6 / 2 / 7 = 17` plus the orphan is); `StartOptions` 7 — **1 on none: `onRegionEvent`**, and `runId` on two under the reading this harness does not take. *So Q297 is not a judgement about which callbacks are worth carrying; it is the unique residue of a partition that is otherwise total.* | `fact1-partition.mjs`, `fact1.txt` |
| **2** | **The half-fix for Q297 is FREE, and the whole fix turns a GATE ENTRY red.** Four probes, control first. **control** green everywhere. **p1** — the `Pick` widened and the forwarding line NOT added: `typecheck`, `npm test`, `check:source`, `check:docs` **all green**, so a typed option a consumer passes is silently dropped and nothing anywhere notices. **p2** — widened AND forwarded: `check:docs` **EXIT 1, one FAIL line**, because `AGENTS.md` §10 asserts `regionEvents !== 0` is an error *"so the runtime forwards it now and this comment is stale"*, and `X8` holds `README.md` byte-equal to it. **p3** — a name REMOVED from the `Pick`: `typecheck` **EXIT 2, zero FAIL lines**. *The list is bound DOWNWARD by a consumer and not bound UPWARD at all — you cannot narrow it silently, you can widen it silently, and the tripwire for the fix is one the reference set on purpose.* | `fact2-probes.mjs`, `fact2.txt` |
| **3** | **The pattern Q293 calls "eight lines" is THIRTEEN copies, 135 lines, in THREE disagreeing shapes — and exactly ONE of the thirteen carries both guards.** In `AGENTS.md` and `README.md` alone: ten are *microtask, no deadline*; two are *poll + deadline, no microtask*; one has all three. **Ten hang for ever on a run that never becomes terminal** — which is the failure W71's own declaration records its author's first spike hitting — and **two can fold mid-turn**, which the reference's own prose at `AGENTS.md:112` calls *"load-bearing rather than decoration"*. *The row understates it, in the direction that matters: the copies do not agree, and the document that tells a consumer to copy them disagrees with itself.* | `fact3-terminality.mjs`, `fact3b-shapes.mjs`, `fact3b.txt` |
| **4** | **Q293's stated case AGAINST is measured FALSE, on a real `FyflowScheduler`.** The row argues a promise gains nothing because *"`start` starts INSIDE the call, so what the promise had seen before the caller held it is the same window."* Measured: **(A)** exactly **1** fold input arrives before `start` returns — W67's number, reproduced — so the window is real; **(B)** the prototype's `done` resolves to a `RunState` **canonically identical** to the copied pattern's; **(C)** a `.then` attached **fifty macrotask turns after the run was over** still receives `completed`. **A promise RETAINS its resolution — the window is precisely what a promise is immune to.** [Q289](../open-questions.md) is about a CLOSURE that needs the driver, which is a different thing, and it stays open. *The only argument the register had against Q293 does not survive contact with a run.* | `fact4-done.ts`, `fact4.txt` |
| **5** | **`{ driver, done }` costs 30 typecheck errors in 2 files; `Driver & { done }` costs ZERO.** BREAKING: 18 in `test/scheduler/runtime.test.ts`, 12 in `examples/run-flow.ts`, both ours; `typecheck:node`, `:browser` and `:deno` green in both cases. ADDITIVE: green in all five. *And this fact was WRONG TWICE before it was right, which is recorded rather than tidied away* — see below. | `fact5c-breaking.mjs`, `fact5c.txt` |
| **6** | **Forwarding is observable, the freeze already holds across the seam, and `done` never settles for a parked run.** **(A)** a `Driver` built BY HAND out of `runtime.registry` — which P18 decision 14 says is exactly what `start` builds — sees **4 region events** (`branch.opened`, `branch.arrived`) on a two-branch fan-out where `runtime.start` sees **0**. **(B)** all four are **frozen**, so W12's `OR-R7`/[Q73](../open-questions.md) fix holds at the seam and W76 inherits it rather than re-establishing it. **(C)** a run with a person in the loop is `awaiting_action`, `isTerminal` **false**, and a terminality-waiting `done` **had not settled**; after `resolve()`, `completed` and terminal. | `fact6-forward.ts`, `fact6.txt` |

### The declaration's own measurement was wrong twice, and both are the same shape

**Fact 5 was taken three times.** The first version changed `Runtime.start`'s *declaration* and not
its *implementation*, so every error it counted was `runtime.ts` failing to satisfy its own interface
— **it measured the probe.** The second changed both and ran `npm run typecheck`, which is **five
typecheckers chained by `&&`**: it reported *18 errors in 1 file*, which is what the FIRST failing
typechecker saw and nothing after it ran. The true answer is **30 in 2**, and `examples/run-flow.ts`
— the file the number most matters for — is in the half the chained run never reached.

*This is section 4's clause one step out.* The document says a rung reported GREEN means its command
exited 0; the mirror is that **a chained rung reported RED reports its FIRST failure and is silent
about everything downstream**, so a failure COUNT from a chain is a lower bound wearing a
measurement's clothes. Recorded here, at one occurrence, for P20's retro to judge; the counter-measure
used was to run the five lanes separately, which is what `fact5c` does.

---

## Scope

**In**

1. **`onRegionEvent` forwarded**, with the two lists bound so the half-fix fact 2 measured is not
   free, and `AGENTS.md` §10 + its `X8` README twin rewritten from *this road cannot* to *this road
   can*.
2. **A completion handle from `runtime.start`** — ADR 0058 — with the road chosen by the maintainer,
   the `awaiting_action` semantics decided, the rejection semantics decided, and the package version
   moved if the road is the breaking one.
3. **The reference's thirteen copies reduced**, and the residue explained rather than left: a copy
   that survives says what else it is teaching.
4. **One L6 row** in which a consumer holds only what `start` returned, on a real `FyflowScheduler`
   in both runtimes, with the revert cost of each item measured there.

**Out** — named rather than left implicit, with where each goes instead

- **Per-settlement result validation** — P19's slice 1, deferred with its argument above, and it is
  the next plan's likeliest subject. Not weakened, not re-decided, just not now.
- **`oneOf`** — P19 slice 2, whose condition did not fire. [Q311](../open-questions.md) is the live
  subject there.
- **Node-type versioning** — [Q249](../open-questions.md), P18's leftover, P19 slice 3.
- **[Q289](../open-questions.md) itself.** Fact 4 shows a promise is immune to that window; it does
  **not** close the row, because the row is about a closure that needs the `driver` binding, and
  `done` gives such a closure nothing. It stays open with fact 4 noted against it.
- **The `Driver`'s own surface.** [P4](p4-the-drivers-lifetime-and-the-handles-it-gives-out.md)
  settled a driver's lifetime, its run id at construction, and what makes an inbound event this
  run's ([ADR 0022](../decisions/0022-a-driver-takes-its-run-at-construction.md),
  [ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)).
  **None of it is reopened**, and an item that finds itself editing `src/driver/driver.ts` for more
  than a type export should stop and say so.
- **Anything that changes what a worker RECEIVES.** Decision 7.
- **Bounding what a run retains** — [Q19](../open-questions.md)/[Q22](../open-questions.md),
  answered by [P15](p15-what-a-run-retains-and-what-a-result-may-be.md) and untouched. A `done`
  promise holds a `RunState`, which is already retained; **an item that makes the runtime hold the
  fold INPUTS for the life of the run has added retention P15 measured and must price it.**

---

## Work items

*Serial. Each owns its files; the `Owns` block is written from the row here, never from the item's
title (`doc/workflow.md` section 7 rule 2).*

| | what it does | Owns | Depends on | Gate |
|---|---|---|---|---|
| **W76** | **What `start` ACCEPTS** — `onRegionEvent` added to `StartOptions` and forwarded; the `Pick` and the conditional-spread list bound **both ways** as a test, with `joinPolicy`'s `??` shape known to the comparison (decision 5); fact 1's partition asserted so the orphan count is **0** and a future `DriverOptions` member cannot join it silently; `AGENTS.md` §10 and its README twin rewritten, and the assertion that fires when the answer changes kept pointing the other way. **No ADR.** L6 UNMOVED | `src/scheduler/runtime.ts`, `test/scheduler/**`, `AGENTS.md` §10, `README.md` | nothing | L0 under all five typecheckers; L1-L2 on a real inline pool through `runtime.start`; `check:docs` (which **fact 2 p2 says goes RED until §10 is rewritten** — predicted, and the item measures it); `check:source` |
| **W77** | **What `start` RETURNS** — **[ADR 0058](../decisions/)**: a completion handle the RUNTIME keeps, the road from stop-and-ask (a), `awaiting_action` from (b), rejection from (c); the version moved if breaking; the deadline question answered. L6 UNMOVED | `src/scheduler/runtime.ts`, `test/scheduler/**`, `doc/decisions/0058-*`, `package.json` + `deno.json` **only if the road is breaking** | W76 | L0 under all five; L1 on real inline and threaded pools in both runtimes; a test that `done` and a caller's own fold are the SAME expression (decision 2) and that neither is downstream of the other; ADR 0014's `RN-R1` re-run at L3 |
| **W78** | **The exit artifact** — one L6 row where the consumer holds only what `start` returned: a fan-out's region events counted through `StartOptions`, the end awaited in one line, on a real `FyflowScheduler` in both runtimes; the reference's thirteen copies reduced and the residue explained; **what reverting W76 and W77 costs at L6**, measured. **No ADR expected.** **L6 MOVES and this row says so** | `examples/**`, `AGENTS.md`, `README.md`, `examples/README.md` | W77 | L6 in **both** runtimes; `check:docs` over every rewritten snippet; `check:markdown`; the full `npm run gate` |

**W79 is reserved and expected unused**, on P19's W75 precedent.

---

## Predictions, to be written down BEFORE the items that test them

*The scope column states what the measurement COVERED. P19's retro found that a scope column is
correct and still does not prevent the defect, because **it cannot state what nobody thought of** —
so these say what was measured and make no claim beyond it.*

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **W76 is two lines in `src/` and everything else it costs is the REFERENCE** — the forwarding needs no freeze, no copy and no new contract | facts 1, 2 and 6B, over `src/scheduler/runtime.ts` and the four rungs the probes ran; **the reference's cost is NOT in that measurement** and fact 2 p2 says only that `check:docs` goes red, not how much rewriting that is | a `StartOptions` entry that needs more than a name and a spread line — the likeliest is the event needing to be re-frozen or re-wrapped at the seam, which fact 6B measured it does not on the hand-built road but did not measure through `start`, because through `start` it cannot arrive at all |
| 2 | **`done` is the same expression moved, and a test can show it** — deleting `isTerminal` from the runtime's copy and from the consumer's costs the same failures, because there is one definition | fact 4B, ONE flow, ONE runtime, canonical-JSON equality of the resulting `RunState`; it measures that the two AGREE on one run, not that they cannot diverge | the `awaiting_action` decision (stop-and-ask (b)) resolving `done` where `isTerminal` says it should not — which makes `done` a second definition, moves this into obligation (c)'s LIMIT, and makes the breaking road's honesty worth its 30 errors |
| 3 | **REACH: no consumer wants `done` without also wanting the driver**, so the two roads are the same thing to every caller and the choice is about honesty rather than ergonomics | **none — this is a reach over what a consumer will write, and it is measured nowhere.** The thirteen copies all keep the driver, but they are OURS | an L6 row or a reference snippet that uses `done` and never touches the driver, which would argue for a `runtime.run(flow, payload)` beside `start` rather than a change to `start` |
| 4 | **Deleting the copies removes more lines than the whole plan adds to `src/`** | fact 3b — 135 lines inside 13 copies, over `AGENTS.md` and `README.md` **only**; `examples/**` and `test/**` copies are not in that count, and `examples/run-flow.ts`'s bespoke machinery is deliberately excluded because it asserts `finishedBy` | the copies surviving because each teaches something else — §10 teaches frozen handles, §7 teaches the human in the loop — in which case `done` deletes the termination and not the snippet, and the count is far smaller than the reach |

---

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q297](../open-questions.md) | *the row this plan's first half answers* — its *"against: nothing yet"* is now **measured**: fact 1 makes it the unique orphan of a total partition, and fact 6A/6B say the events exist and are already frozen | W76 |
| [Q293](../open-questions.md) | *the row this plan's second half answers* — **its stated case AGAINST is measured false (fact 4)** and its *"eight lines"* is thirteen copies and 135 lines (fact 3b). Both corrections land in the register at this declaration | W77, W78 |
| [Q289](../open-questions.md) | *the window before a caller holds the driver* — **declared OUT and NOT closed.** Fact 4C shows a promise is immune to it; a closure that needs the driver is not, and that is what the row is about | unchanged, no owner |
| [Q73](../open-questions.md) | *the region event a listener cannot corrupt* — resolved by W12 inside the driver; **fact 6B is the first measurement of it at the runtime seam**, and W76 is where it becomes a road a consumer can reach | W76 |
| [Q253](../open-questions.md) | *a claim-checking harness that can go vacuous at exit 0 and lives in no commit* — `dev-dist/p20/` is untracked like every facts harness before it, and fact 5's three attempts are this row's shape from the other side: the harness was not vacuous, it was **wrong about its own scope twice** | the items, when they re-run these facts |
| [Q310](../open-questions.md) | *an executed snippet's assertions are bound by their PRESENCE* — **W78 ships snippets and inherits v0.20's obligation (b) tautology clause by name**; `AGENTS.md` §10's `regionEvents !== 0` guard is the live case, because W76 inverts it rather than deleting it | W76, W78 |
| Q315-Q329 | *reserved for the items* | |

---

## Slices beyond this plan, in order

1. **Per-settlement result validation as an OPT-IN driver option**, priced at the scale this library
   targets before it ships — P19's slice 1, which this plan defers rather than displaces.
2. **`oneOf`**, if [Q311](../open-questions.md) turns into a consumer asking for it.
3. **Node-type versioning** ([Q249](../open-questions.md)), as P18 left it.

---

## Stop and ask a human

- **(a) The road for `done`: BREAKING or ADDITIVE.** `{ driver, done }` is Q293's own suggestion and
  costs **30 typecheck errors in 2 files**, both ours, plus `0.2.0` → `0.3.0`.
  `Driver & { done }` costs **ZERO** across all five typecheckers. **The plan leans BREAKING**, on
  the ground that an additive `done` hanging off the driver object says the driver produced it, which
  is exactly what decision 1 denies — and the tree has ADR 0048/W67's precedent for a bump taken for
  a reason. W77 asks before the ADR is written.
- **(b) What `done` does when a person is in the loop.** Measured (fact 6C): a parked run is
  `awaiting_action`, `isTerminal` is false, and a terminality-waiting `done` never settles. Three
  roads: **(i)** `done` waits — correct, and a trap the reference must then teach; **(ii)** `done`
  also settles on `awaiting_action` — ergonomic, and it makes `done` a SECOND definition of
  terminality, which breaks decision 2; **(iii)** `done` waits and a second named handle reports
  suspension. **The plan leans (i) plus a deadline**, and thinks (ii) is the one that would make this
  plan wrong.
- **(c) Does `done` REJECT or RESOLVE on a failed run?** `failed`, `stopped` and `stuck` are terminal
  OUTCOMES, not errors; all thirteen copies resolve on terminal and reject only from
  `onRunFailure`. **The plan leans: resolve with the state, reject only for a driver refusal** — the
  copies' own split, kept.
- **(d) Whose deadline?** Ten of the thirteen copies have none and hang for ever. Library-side
  default, consumer-supplied, or none at all with the reference teaching it — W77 prices it.
- **(e) Whether `examples/run-flow.ts` converts.** Its termination machinery is ADR 0014's own
  correction — `finishedBy` exists because W5's adequacy reader replaced the predicate with
  `setTimeout(1)` and all 72 assertions still passed. **A `done` that absorbs that claim deletes the
  assertion ADR 0014 was corrected to carry**, which is obligation (c)'s LIMIT. W78 asks rather than
  assuming; the safe answer is that the harness keeps its own observer and `done` is asserted
  BESIDE it.
- **(f) Anything that changes what a worker receives, or moves an L6 row's claims other than by
  adding W78's row.** Decision 7 makes the first a constraint and the second declared.

---

## A note on ids

**Reserves W76-W79, Q315-Q329, ADR 0058-0059.** **Derived by grep off the tree at this declaration**,
never from a sentence — the practice P19 adopted after three consecutive items outside a plan
falsified exactly the sentence naming the next plan's first id:

| | on disk | so |
|---|---|---|
| highest work item | **W74** | W75 was reserved by P19 and **closed unissued**, so it is skipped; P20 starts at **W76** |
| highest register row | **Q312** | Q313-Q314 were W74's, reserved and unused, so they are **spent**; P20 starts at **Q315** |
| highest decision | **ADR 0056** | 0057 was reserved by P19 and **SKIPPED**; P20 starts at **ADR 0058** |

Fifteen questions, sized by the worse case as every plan since P15 has done; **none spent by this
declaration**. Two ADRs, one expected taken (0058, the completion handle) and 0059 expected unused.

---

## The exceptions each item will take, seeded

*Seeded from W72's, W73's and W74's LATE tables read forward — P16's refused-as-a-rule,
adopted-as-a-table procedure. **All three of P19's items found this table wrong in BOTH directions**,
so it is seeded and **will be re-measured at each item's declaration step**, which is where the
corrections belong.*

| path | who | why it is seeded |
|---|---|---|
| `AGENTS.md`, `README.md` | W76, W78 | W76 owns §10 and its README twin by its row; W78 owns the rest. **`X8` holds THREE README pairs byte-equal**, so a section edited in one must move in the other, and `README_SNIPPETS` / `README_SNIPPET_FLOOR` are two more literals beside it — W74's *a member and its name are two edits in one diff, and the floor is the third* |
| `scripts/check-docs.mjs` and its self-test | W78 | `RUN_FLOOR` is a ratchet an item that adds or removes a `run` snippet must move — [Q102](../open-questions.md)'s shape, live for six plans. **W78 may REMOVE snippets, which is the direction that lowers it**, and no item has yet taken it downward |
| `examples/README.md` | W78 | its L6 row table gains a line per new row and its `getting-started/` paragraph enumerates workers and the AGENTS sections that execute them — **W71's, W72's and W74's late exception on the same two paragraphs, three items running** |
| `package.json`, `deno.json` | W77 | **conditional on stop-and-ask (a)**: only the breaking road moves the version, and it moves it in both manifests. [Q279](../open-questions.md)'s precedent is W67's |
| `examples/l6.ts` | W78 | the exit artifact's row lands here, with the row-key and cross-row membership lists v0.14's *a count is not a membership* and v0.18's *a membership names its CONTROLS* both bind |
| `examples/run-flow.ts` | W78 | **conditional on stop-and-ask (e)** — and if the answer is *the harness keeps its own observer*, this is predicted UNNEEDED and must be measured rather than assumed |
| `scripts/check-markdown.mjs` | **predicted UNNEEDED** | measured at this declaration (below) and **re-measured before each record step**, which is where the index paragraphs land |
| `scripts/check-source.mjs` | **predicted UNNEEDED** | no new gate entry and no new published module under any road here; `S6`'s JSR allowlist fires only on a new file in `src/**`, and no item adds one. **W73 took this LATE and undeclared until `S6` fired**, which is why it is named |
| `src/driver/driver.ts` | **predicted UNNEEDED, and it is a SCOPE TRIPWIRE** | nothing here changes the driver. An item editing it for more than a type export has left this plan's scope — see [Scope Out](#scope) |

### [Q142](../open-questions.md)'s window, measured BEFORE the record step

`dev-dist/w74/decl-q142.mjs` on this tree, which is the tightest constraint here and **has fired at a
plan declaration before**:

```
whole tree           {"files":132,"links":5708,"anchored":275}
doc/decisions out    {"files":100,"links":5237,"anchored":275}
both out             {"files":80,"links":4213,"anchored":275}

M3 = 107 : window is (100, 132] — margin below 7, above 25
M4 = 4450: window is (4213, 5708] — margin below 237, above 1258
M5 = 60  : whole-tree anchored 275
```

**This declaration adds ONE markdown file**, and it lands in `doc/plans`, which probe 1 does **not**
cut — so the `M3` fixture goes 100 → 101 against a floor of 107, **six files of margin left**. `M4`'s
lower bound is cut by probe 2, which removes `doc/plans`, so this file's own links do not reach it;
the index paragraphs do, against **237 links of margin** — where
[P18](p18-a-flow-and-its-runtime-from-documents-alone.md)'s retro had 31 and fired. **Q142 is
predicted NOT to fire.**

**RE-MEASURED after the record step, which is where the index paragraphs land — and it does not
fire, exactly as predicted:**

```
whole tree           {"files":133,"links":5790,"anchored":284}
doc/decisions out    {"files":101,"links":5319,"anchored":284}
both out             {"files":80,"links":4244,"anchored":280}

M3 = 107 : window is (101, 133] — margin below 6, above 26
M4 = 4450: window is (4244, 5790] — margin below 206, above 1340
M5 = 60  : whole-tree anchored 284
```

**One file (100 → 101, six of margin) and thirty-one links into files neither probe cuts
(4213 → 4244, 206 of margin).** The whole tree moved 132 → 133 files and 5708 → 5790 links. *P18's
retro paid the FILE half, left the LINK half, and fired on a 31-link margin; this declaration's link
increment is the same 31 against a margin seven times larger, which is why the prediction was
affordable to make.*

---

## The baseline this plan was declared on

**P19's retro's confirming gate on `cf6d821`'s tree, 2026-09-19** — every rung RUN and never PIPED,
redirected to `dev-dist/p19-retro/gate-final.log` and read by its exit code:

```
GATE EXIT=0, zero lines beginning FAIL at any indent, 16 chain entries
44 file(s), 1234 assertions in node 24.20.0, deno 2.9.6 and chromium
1627 assertions at L6, 0 failed, 53 real runs on fyflow-scheduler 0.5.2, in node and deno
spec     7 documents, 61 examples, 107 rules, C4 at 34
docs     33 snippets: 27 run, 6 check; X8 comparing THREE README pairs
workers  14 workers, 12 confirmed by a run, 2 NOT CHECKED
markdown 132 documents, 5704 relative links, 275 anchored
register 241 / 185 / 2 / 54, 241 of 241 in one cluster cell, 0 aborts
digest   64d0a5f37f7bf7ef over 360 files at that gate
```

**Re-taken at this declaration rather than copied**, on `817fd73` — the tree the retro's six named
post-gate prose edits left behind, digest **`e3f998edc43e0498` over 360 files**:

| | at the retro's gate | on this tree | |
|---|---|---|---|
| `check:spec` | 7 / 61 / 107, C4 at 34 | **7 / 61 / 107, C4 at 34** | unmoved |
| `check:docs` | 33 snippets: 27 run, 6 check | **33: 27 run, 6 check**, X8 over 3 README pairs | unmoved |
| `check:workers` | 14 / 12 / 2 | **14 / 12 / 2, 0 refused** | unmoved |
| `check:markdown` | 132 / 5704 / 275 | **132 / 5708 / 275** | **+4 links** — the retro's six post-gate prose edits, which no rung reads and which this re-take is how anyone would know about |
| register | 241 / 185 / 2 / 54 | **241 / 185 / 2 / 54**, 241 of 241 in one cluster cell, **0 aborts** | **CONFIRMED for the TWENTIETH plan running**, by `dev-dist/p15/census.mjs` unchanged |

*L1-L6 and the five-runtime figures are NOT re-taken and are quoted as the retro's, because this
declaration changes no file any of those rungs reads — one markdown document and five index
paragraphs. The declaration commit's own confirming gate is what checks that claim.*

**The declaration commit's own confirming gate, 2026-09-19** — over this file, the register's
reservation note and two corrected rows, and the three index paragraphs; **the tree held STILL while
it ran**, every rung RUN and never PIPED, `dev-dist/p20/decl-gate.log`:

```
GATE EXIT=0, zero lines beginning FAIL at any indent, 16 chain entries
44 file(s), 1234 assertions in node 24.20.0, deno 2.9.6 and chromium — UNMOVED
1627 assertions at L6, 0 failed, 53 real runs on fyflow-scheduler 0.5.2, in both runtimes — UNMOVED
spec     7 / 61 / 107, C4 at 34 — UNMOVED
docs     33 snippets: 27 run, 6 check — UNMOVED
workers  14 / 12 confirmed / 2 NOT CHECKED, 0 refused — UNMOVED
markdown 133 documents, 5790 relative links, 284 anchored
selftests 8/8 completed, 8 ok, 827.2 s wall over 6 lanes
digest   017b9353e42dbe04 over 361 files, IDENTICAL before and after
```

**Every figure this declaration could move, moved by exactly what it added — one document, 82 links,
nine anchors — and nothing else did.** `git status` names five files at both ends: this one and the
four the record step allows (`doc/README.md`, `CLAUDE.md`, `README.md`,
`doc/open-questions.md`). *The claim above — that no rung below `check:markdown` reads anything this
declaration touches — is what the five UNMOVED rows check.*

---

## Record

*Filled in as the plan runs.*

| item | status | |
|---|---|---|
| W76 | **DONE** 2026-09-19 | [w76-what-start-accepts.md](../work-items/w76-what-start-accepts.md). `onRegionEvent` forwarded — **[Q297](../open-questions.md) RESOLVED**, no ADR. Two lines in `src/`, so **prediction 1 HOLDS**; `src/driver/driver.ts` UNEDITED, so the scope tripwire is clean; **L6 UNMOVED at 1627 / 53** in both runtimes; L1-L5 **44 / 1251** in five runtimes; `check:docs` **RED on `X4` first, exactly as fact 2 p2 predicted**, then green at **33 / 27 / 6 UNMOVED**. **It corrects this plan in THREE places** — §10 has no README twin (finding A), fact 1 reads the `Pick` and not the interface so `runId` is on two roads (finding B), and **fact 1's table is not a PARTITION: `2 / 6 / 6 / 7` is 21 slots over 18 members** because road (c) was read off `RuntimeOptions`' declaration and four of its six are not `DriverOptions` members (finding D, [Q316](../open-questions.md)). Derived from what `start` forwards it is `2 / 6 / 2 / 7 = 17`, with `onRegionEvent` the eighteenth — *the conclusion survives and only the arithmetic under it fails*. Readers 19 / 7 blocking and 25 mutations / 14 survivors / 8 blocking, **overlap 2, the forty-seventh measurement**, and **both shared subjects are one literal reached from opposite ends**. The adequacy reader's central finding is that the forwarding was bound at **exactly one topology** and could be narrowed three ways for zero; the answer is an EQUALITY rather than more shapes — what `onRegionEvent` receives IS the region subsequence of what `onFoldInput` receives. Rule 8 final **25 probes, 23 caught, 1 declared ceiling, 0 undeclared survivors, 0 crashes, 0 against declaration, 3 aborts all re-anchored**; **W71's dated ceilings re-run HERE, one catch and one vacuous survivor** ([Q317](../open-questions.md)). Q315-Q317 raised, Q318-Q319 spent; census **244 / 187 / 2 / 55** |
| W77 | **not started** | |
| W78 | **not started** | |
| W79 | *reserved, expected unused* | |
