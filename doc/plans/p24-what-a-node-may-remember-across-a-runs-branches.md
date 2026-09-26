# P24 — What a node may REMEMBER across a run's branches

**Status:** **COMPLETE and RETRO'D** 2026-09-26 — `doc/workflow.md` [v0.25](../workflow.md), ONE change adopted and FIVE refused; see the [Retro](#retro). **COMPLETE pending its retro** until then — [W94](../work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md), the exit artifact, DONE 2026-09-26. **DECLARED** 2026-09-25 on `912bfcb`, all four stop-and-asks ANSWERED the same day as recommended, and
[W92](../work-items/w92-what-a-gate-is.md) declared (P1-P23 complete and
retro'd, `doc/workflow.md` [v0.24](../workflow.md)). Its facts were measured into `dev-dist/p24/` on that tree
and nothing there is checked in, on P22 stop-and-ask (a)'s precedent — so each item's declaration step
RE-RUNS them (P15 decision 5).
**Question this plan answers:** *Can a flow route each branch by what the run's OTHER branches have already
seen — keep the first file of each series and end the rest — with the memory held by the library rather
than by a worker, and still resume after its process is gone?*
**Exit artifact:** a TV-series ingest on a real `FyflowScheduler`, in **both** L6 runtimes: a `map` over
files whose branches fetch and identify a series, a **`gate` of type `distinct`** sending the FIRST file of
each series to a per-series branch and every other file to an `end`, thumbnails running beside it — exactly
one per-series branch per series **whatever order the files arrive in**, the run `completed`, and the run
killed at every kill point and resumed on a fresh runtime completing identically.
**Reserves:** W92-W95 (W95 expected unused), Q379-Q393, ADR 0066-0067.
*Derived by grep off the tree, never from a sentence — see [A note on ids](#a-note-on-ids).*

---

## Why this plan, and why now

**The maintainer's request of 2026-09-25**, worked through in conversation before this draft: an ingest
lists TV-series episode files, and fetching and processing each file is what assigns its series — so the
series is known per BRANCH, one branch at a time, and only the first file of each series should open the
per-series work while thumbnails proceed for every file.

**Nothing in the library can do that today, and the reason is structural.** A branch cannot see its
siblings ([ADR 0044](../decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
makes two instances of one `map` invisible to each other); a join is the only thing that brings branches
together, and it waits for all of them; a predicate is asked to be pure ([Q9](../open-questions.md)), and
a worker's own memory is lost on idle teardown and per thread — measured below. So the memory has to be
the DRIVER's, and **since [P23](p23-what-a-run-needs-to-outlive-its-process.md) the driver's private state
is exactly what a resume regenerates from the log** — which is the argument for putting it there.

---

## What the design settled, and how

*Settled with the maintainer on 2026-09-25, each after the alternatives were priced in conversation
(`doc/workflow.md` section 7 rule 3); the four stop-and-asks below were answered the same day.*

1. **A new node kind, `gate`: a decision WITH MEMORY.** It routes the branch that reaches it and computes
   nothing: the branch continues with the value the gate received, unchanged. It is not a `filter` or a
   `reduce` — a stateless filter is a decision, and a collection reduce is a join plus a `transform`, both
   of which exist.
2. **A gate names a TYPE and carries SETTINGS**, as a task node does:
   `{ "id": "dedupe", "kind": "gate", "type": "distinct", "settings": { "key": "item.seriesId" }, "edges": [...] }`.
   **One type ships, `distinct`.** Custom gate types are registered in CODE later — and `distinct` is written
   against that same interface, so the extension road exists and is exercised the day it ships.
3. **A gate type DECLARES its routes**; `distinct` declares `first`, `duplicate` and `nokey`, with `first`
   its default. An edge names a route with `route`; **an edge with no `route` means the type's DEFAULT
   route**, never *every* route — the precedent is a task edge with no `on`, which means `done` only.
4. **Every declared route must be wired, exactly once.** An unwired route, an edge naming a route the type
   does not declare, two edges for one route, and a `when` or `on` on a gate edge are all REFUSED when the
   flow is loaded against the registry — not at run time. **A drop is an edge to an `end` node**: the event
   (`branch.exited`) and the outcome (`completed`) are the ones an `end` already produces, and an author
   may use one `end` per dropped route so a graph stays local. *Over*: dropping by omission, which the
   library allows for a task's terminal states because those are a fixed list the library owns; a gate
   type's routes are the registry's, the registry carries no version ([Q249](../open-questions.md)), and a
   route added to a type later would be dropped in silence by every flow that omitted it.
5. **The gate is evaluated by the DRIVER, synchronously, where a branch ENTERS it** — an arm of
   `enter()` beside `end` and `fanout`, with no dispatch and no task id. The key is a plain DOTTED PATH over
   the value the gate receives; **no JSONata**, because `evaluate()` returns a Promise and the driver has
   no `async` anywhere ([ADR 0051](../decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)).
   A key a gate needs COMPUTED is computed in the task before it.
6. **The memory is the driver's, one per gate per run, and it is never written down.** It is a pure
   function of the order in which branches reached the gate, which is the log's order — so a resume
   REBUILDS it by replay, and a checkpoint needs no new field.
7. **"First" means first to reach the gate in this run**, which varies between runs and is reproduced
   exactly by a resume. No test may assert WHICH file wins, only that exactly one does per key.
8. **A route a gate type returns and did not declare STOPS the run by name** (`OR-R10`), the counterpart of
   `FD-R1`: it cannot be refused at load, because only running the function reveals it.

---

## What was measured before this plan is declared

*On `912bfcb`'s tree, node 24.20.0 and deno 2.9.6, in `dev-dist/p24/` — `facts.ts` and three workers,
and a copy of the tree for the churn probe. No `src/` edit: the dedupe is EMULATED with what the library
has today, a decision whose predicate keeps closure memory.*

| # | fact | measured |
|---|---|---|
| 1 | **Where a gate goes.** The driver's `enter()` is synchronous and switches on the node's kind — `task` dispatches, `fanout`/`map` open, `join` settles, `end` appends `pathEnded` and `branch.exited` — and has a `default` arm that REFUSES an unknown kind. `src/driver/` holds no `async` and no `await` outside a comment | a gate is one more arm there: it receives `compose(node, payload)` like every other kind, and routes by calling `enter()` for its chosen edge's target |
| 2 | **Arrival order on real pools.** Six files over three series, a `map`, the emulated dedupe on the decision after `identify`, equal work, ten runs per pool mode | **inline: settle order `0,1,2,3,4,5` in 10 of 10 runs in node and 9 of 10 in deno — the winners are ALWAYS the lowest index per series.** Threaded: a different order in every run, and three different winner sets over ten. With the work ARRANGED so later files finish first, the winners move (`f1,f2,f3` instead of `f0,f1,f3`) |
| 3 | **A drop to an `end` inside the map** | `completed`, **three `branch.exited`** and three `pathEnded end@dropped` beside the one `end@done` — the events and the outcome the design needs, with no new rule |
| 4 | **Memory across a resume.** The emulated run killed after its third `identify` settles (the store frozen, the runtime shut down — which DRAINS, [Q376](../open-questions.md)), then resumed on a fresh runtime | **naive memory kept in the same process: REFUSED `diverged` at position 16** — the replay re-asks the predicate and a remembered key answers differently. Memory cleared, or memory that records the OWNER task id: **identical to a run nobody killed**, in both runtimes. The predicate was called 6 times during the resume — **the replay re-evaluates every decision on the stored settlements**, which is what will rebuild a gate's memory |
| 5 | **What a sixth node kind costs at L0.** `GateNode` added to the `FlowNode` union in a copy of the tree, the five typecheck lanes run separately | **ONE error, the same in four lanes**: the driver's exhaustive `never` in `enter()`'s `default` arm (`typecheck:deno` fails on it too). **`src/` has 51 node-kind dispatch sites in 6 files** — `validate.ts` 18, `wiring.ts` 12, `regions.ts` 10, `driver.ts` 9, one each in `bootstrap.ts` and `routing.ts` — **and ONE is exhaustive.** 45 more sit outside `src/`, in `examples/l6.ts`, `scripts/check-spec.mjs` and nine test files. *(**Re-taken at [W92](../work-items/w92-what-a-gate-is.md)'s declaration step**: the one error is in ALL FIVE lanes — *four, deno too* is five; and *51 / 45* recorded no predicate on disk, so it could not be reproduced. With one STATED — `kind ===\|!== '<kind>'`, `case '<kind>'`, `opensWith`, `KINDS` — it is **55 in the same six files and 58 outside, in fifteen**, plus 11 `kindOf` comparisons and the two key TABLES the validator indexes by kind. **And `gate` in `KINDS` alone makes the validator THROW**, which *every other site falls through in silence* below does not say.)* |
| 6 | **The validator today** | a `kind` outside its `KINDS` literal is refused by **`FD-V24`** by name — so before this plan a gate document is LOUD; the moment `gate` joins that literal, every other site that does not name it falls through in silence |
| 7 | **A worker cannot hold the memory** (measured in conversation, `dev-dist/teardown/`) | an inline pool's instance state is LOST on idle teardown and its MODULE state survives; a threaded pool loses both, because a new thread loads the module fresh |

### What the facts found that nobody asked about

- **The inline pool is the DEFAULT-POSITION trap for this feature, verbatim.** v0.23's selection clause
  says a fixture at the default position cannot tell a rule from its most plausible wrong selection — and
  on an inline pool *first to arrive* and *lowest index* are the same selection 19 times in 20. Every
  fixture that asserts a winner must ARRANGE the order and assert the arrangement's own effect, and the
  exit artifact's threaded rows are where the two differ without arrangement. **[Q379](../open-questions.md).**
- **The churn is SILENT, and fact 5 is why.** *(Half right, measured at W92: SILENT at L0, and LOUD in the wrong way at
  the validator, which threw a `TypeError` the moment `gate` joined `KINDS` — [Q380](../open-questions.md), resolved.)* One exhaustive check among 51 dispatch sites means the
  typechecker names one place and L1-L6 must find the rest — P22's *the churn is loud at L0* reversed
  before this plan's first item, measured rather than predicted. **[Q380](../open-questions.md).**
- **A dotted key path is a new grammar.** `map`'s `over` is a KEY NAME in `FD-V16`'s charset, which has no
  dot. `item.seriesId` needs a rule for what a segment may be and what a missing segment means — which is
  what `distinct`'s `nokey` route is for.

---

## Scope

**In**

1. **What a gate IS** — the node kind, its type and settings, its declared routes and default route, the
   edge `route` key, the load-time refusals of decision 4, the registry's gate types with `distinct`
   built in on the public interface, and the validator, `checkWiring` and region walks taught the kind.
   **ADR 0066.** *(W92)*
2. **What a gate DOES in a run** — the `enter()` arm, the driver-owned memory and its scope, a recorded
   GATE OUTCOME in the fold, the run-time refusal of an undeclared route, replay rebuilding the memory, and
   `RN-R13`'s retention term for it. **ADR 0067**, or folded into 0066 if W93 finds nothing ADR 0066 did
   not decide. *(W93)*
3. **The exit artifact** — the TV-series flow on real workers in both L6 runtimes, the winners ARRANGED
   and asserted, killed and resumed at every kill point; `AGENTS.md` and a `README.md` paired fence; the
   package at **`0.6.0`**, because stop-and-ask (b) makes the change breaking. *(W94)*

**Out** — named rather than left implicit

- **Memory per region INSTANCE** (dedupe within each season) — stop-and-ask (a), answered: out.
- **Custom gate types registered by a consumer beyond the interface `distinct` proves** — the interface
  ships; a second built-in type does not.
- **A key computed by an expression in the gate** — decision 5; the task before it computes it.
- **A gate that produces a value**, a `filter` or `reduce` kind, and any stateful WORKER.
- **Memory across RUNS.** A run's gate forgets at the run's end; deduplicating across runs is the
  consumer's store.

---

## Work items

*Serial. Each owns its files; the `Owns` block is written from the row here, never from the item's title
(`doc/workflow.md` section 7 rule 2).*

| | what it does | Owns | Depends on | Gate |
|---|---|---|---|---|
| [**W92**](../work-items/w92-what-a-gate-is.md) | **What a gate IS** — ADR 0066; `spec/flow-definition.md` (the kind, `route`, the refusals); the registry's gate types and `distinct`; the validator, `checkWiring` and the region walks; the driver's `default` arm still REFUSES a gate, on W32's precedent | `src/definition/**`, `src/driver/**` (the union and the refusal only), `spec/**`, `test/**`, `doc/decisions/0066-*` | nothing | L0 all five lanes and `lint`, each SEPARATELY; L1-L5 in three runtimes; `check:spec`; `check:docs`; **L6 UNMOVED** |
| **W93** | **What a gate DOES** — the `enter()` arm, memory, the gate outcome in the fold, the undeclared-route stop, replay, retention; `spec/run-state.md` | `src/driver/**`, `src/fold/**`, `src/scheduler/**`, `spec/**`, `test/**`, `doc/decisions/0067-*` | W92 | the same as W92's, **L6 UNMOVED** |
| **W94** | **The exit artifact** — the TV-series flow in both L6 runtimes, where **L6 MOVES and this row says by how much**; `AGENTS.md` and a `README.md` fence; the version | `examples/**`, `AGENTS.md`, `README.md`, `examples/README.md`, `package.json`, `deno.json` | W93 | L0 and L1-L5 UNMOVED; L6 in both runtimes; `check:docs`; `check:markdown`; the full `npm run gate` |

**W95 is reserved and expected unused.**

---

## The exceptions each item will take, seeded

*P23 seeded this table at its declaration and zero exceptions went undeclared (P23's retro, refusal (6)).
Seeded here from P22's and P23's late tables and from fact 5; each item re-measures its row.*

| item | file, outside `Owns` | why it is predicted |
|---|---|---|
| W92 | `scripts/check-markdown.mjs` | **`M4`'s margin is 22 links after this declaration** (below): an item's record step writes more than that into `CLAUDE.md`, `doc/README.md` and the register, none of which probe 2 cuts — so Q142 is PREDICTED to fire at W92's record step and `M4` to be retuned from a scratch copy, as P18's retro did |
| W92 | `examples/l6.ts` | ten node-kind dispatch sites (fact 5) and the byte walk's field lists, if a type or the registry gains a member it walks |
| W92 | `scripts/check-spec.mjs`, `scripts/check-spec-selftest.mjs` | six node-kind sites; `C7` reads every task's type, and a gate has a type and is not a task *(W92: `check-spec.mjs` NOT needed — its sites fall through correctly; the SELF-TEST was, for its count anchors)* |
| W92 | `scripts/check-docs-selftest.mjs` | *NOT SEEDED, found at W92's declaration step*: two `X7` probes anchored on *34 refusals*, which three new rules move |
| W92 | `AGENTS.md` | *Five node kinds* in section 3, and section 9's executed error-class enumeration if a refusal gains a class ([Q101](../open-questions.md)) |
| W93 | `examples/l6.ts` | the driver's new private field reaches `DRIVER_FIELDS` — W55's universe binding, which fired on W59, W61, W88 and W89 *(W93: TWO fields, and a sentence of the kind clause)* |
| W93 | `AGENTS.md` | a new `FoldInput` kind, if stop-and-ask (b) takes one, reaches the executed snippets that walk `kind` *(W93: re-taken, every such snippet FILTERS on a named kind; what moved is section 9's class list and three sentences the item made false)* |
| W93 | `examples/run-flow.ts`, `src/definition/types.ts`, `validate.ts`, `wiring.ts` | *NOT SEEDED, found at W93's declaration step*: `NOT_RUN_STATE` must skip the driver's gate types; `RegistryCode.gateTypes`; the expiry-dated sentences W92 wrote with W93's id; `boundaryTargets`' chooser for `FD-R4` |
| W94 | `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | `RUN_FLOOR`, `README_SNIPPET_FLOOR`, the `X8` pair list, and the `X9` probe's version anchor *(W94: **both fired as seeded**; the `X9` probe made version-agnostic)* |
| W94 | `test/definition/wiring.test.ts`, `spec/outcome-record.md` section 4 | the corpus censuses pinned outside their corpus ([Q342](../open-questions.md), [Q360](../open-questions.md)), because W94 ADDS a flow *(W94: **both fired as seeded** — and the wiring census now asserts a false `no`, [Q391](../open-questions.md))* |
| W94 | `scripts/check-workers-selftest.mjs` | W94 adds workers (fetch, identify, thumbnail, series setup) *(W94: **fired as seeded**, 17 → 21; `fetch` was P18's name already, so the fetch is `download`)* |

---

## Predictions, to be written down BEFORE the items that test them

*The scope column states what the measurement COVERED and claims nothing beyond it.*

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **The churn surfaces at L1 and not at L0**: W92's typecheck names only the driver's `default` arm, and every other site that must learn the kind is found by a failing test or by reading | fact 5: 51 sites, one exhaustive, measured by the TYPE change alone; no site's BEHAVIOUR on a gate document was measured | a second exhaustive site, or a site that mishandles a gate with every test green — which would be a silent defect, not a reversal to be glad of |
| 2 | **Resume needs no new mechanism**: the gate's memory is rebuilt by the replay P23 built, a checkpoint needs no new field, and a checkpoint taken before this plan resumes unchanged | fact 4: an EMULATION — a predicate, not a gate — one flow, one kill point, both runtimes | a memory the replay cannot regenerate — anything keyed by wall time, by pool, or by a callback's side effect |
| 3 | ***CONFIRMED by W94, with one named exception outside the run — the wiring check reads the gate as a pass-through ([Q391](../open-questions.md)).*** **REACH: the TV-series flow runs as the maintainer described it** — one per-series branch per series whatever the arrival order, thumbnails for every file, the run `completed`, and identical after a kill at every kill point | **none — this is a reach.** No gate has run; fact 2 measured arrival order under a predicate | a shape the flow needs that a gate cannot express — a key the task before it cannot compute, a drop that must report more than `branch.exited`, a join that must know how many were dropped |
| 4 | **`RN-R13`'s TEXT moves** — a run's footprint gains the gate memory as a term — and no other existing rule's text changes except the lists that enumerate node kinds and fold-input kinds | P23 prediction 4 reversed by retention at its first test; this plan predicts the reversal in advance | an existing rule that changes for a gate — `JP-R5`'s terminal events, `branch.exited`'s definition, or the outcome table |

---

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q379](../open-questions.md) | *on an inline pool, first-to-arrive is lowest-index* — raised by this declaration | W94 |
| [Q380](../open-questions.md) | *node-kind dispatch is exhaustive at one site of 51* — raised by this declaration | W92 |
| [Q9](../open-questions.md) | *predicate purity is requested, not enforced* — a gate type is held to the same, and resume's divergence check is what catches it | out |
| [Q249](../open-questions.md) | *the registry carries no version* — decision 4's exhaustiveness is the defence against a gate type growing a route | out |
| Q381-Q393 | *reserved for the items* | |

---

## Stop and ask a human — ALL FOUR ANSWERED 2026-09-25, each as recommended

| | the question | recommendation |
|---|---|---|
| **(a)** | **What is a gate's memory SCOPED to?** Per RUN — one memory per gate — or per INSTANCE of an enclosing region, so a gate inside a nested map remembers per outer item | **ANSWERED: per RUN only, as recommended.** **Per RUN only, in this plan.** It is the maintainer's case, and per-instance scope is P22's selection question again: the tests must put duplicates across two instances of the enclosing region, never only in instance 0. Declared OUT, with no `scope` key reserved in the grammar |
| **(b)** | **Is a gate's decision RECORDED as a fold input?** A `gated` element naming the gate, the branch, the route and the key | **ANSWERED: yes, and `0.6.0` at W94's close, as recommended.** **Yes.** Without it a drop is visible only as `branch.exited` at an `end`, and *why* — which key, which route — is in no event; with it the fold and a live view can say *dropped as a duplicate of series X*, and resume's prefix check compares the gate's answers directly. *Its cost*: a new `FoldInput` kind breaks a consumer switching exhaustively on `kind`, exactly as `resumed` did — so the package moves to **`0.6.0`** at W94's close, on P23's precedent |
| **(c)** | **What does `distinct` do with a key that is missing, `null`, or not a string or a number?** | **ANSWERED: `nokey`, as recommended.** **Route it to `nokey`**, which must be wired like every route. *Over*: stopping the run (one bad file ends a batch) and treating the missing key as a key (every unidentified file after the first is dropped as a duplicate of "undefined") |
| **(d)** | **What may a key path be?** | **ANSWERED: dotted object keys, as recommended.** **Dot-separated object keys, each in `FD-V16`'s charset, over the value the gate receives; no array index, no wildcard, no expression.** A key a flow needs computed is computed in the task before the gate (decision 5) |

---

## A note on ids

**Reserves W92-W95, Q379-Q393, ADR 0066-0067.** Derived by grep off the tree at this declaration, never
from a sentence:

| | on disk | so |
|---|---|---|
| highest work item | **W90** | W91 was reserved by P23 and **closed unissued**, so it is skipped; P24 starts at **W92** |
| highest question | **Q378** | P23 used or spent all of Q364-Q378; P24 starts at **Q379** |
| highest ADR | **0065** | P23 took 0064 and 0065; P24 starts at **0066** |
| highest plan | **P23** | this is **P24** |

## The baseline this plan was declared on

Taken by P23's retro's confirming `npm run gate` on the tree `912bfcb` commits — `GATE EXIT=0`, zero
`FAIL` lines, content digest `e25d5028097b5be2` identical at both ends: **L6 1853 assertions over 100 real
runs** in node 24.20.0 and deno 2.9.6; **L1-L5 51 files / 1376 assertions** in node, deno and chromium;
`check:spec` **7 / 61 / 120**; `check:docs` **36 snippets: 30 run, 6 check**; `check:markdown` **153
documents, 7069 relative links, 381 anchored**; census **295 / 230 / 1 / 64** before this declaration's
rows.

**[Q142](../open-questions.md) was MEASURED at this declaration, on the tree it commits, and does NOT fire —
but it is tighter than at any declaration since P18**: P23's retro left `M3`'s margin at **7** files and
`M4`'s at **37** links, and this declaration's two documents and index paragraphs take them to **5** (probe 1:
118 files against 123) and **22** (probe 2: 5248 links against 5270). `check:markdown` **155 documents,
7105 links, 386 anchored**, EXIT 0. **The seeded table predicts it fires at W92's record step.**

---

## Record

| item | status | where |
|---|---|---|
| [W92](../work-items/w92-what-a-gate-is.md) | **DONE 2026-09-25** — [ADR 0066](../decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md); `spec/flow-definition.md` v0.23, `FD-V39`-`FD-V41`, 37 refusals; a gate VALID and refused by every `Driver` at construction; L6 UNMOVED at 1853 / 100 | its Record |
| [W93](../work-items/w93-what-a-gate-does-in-a-run.md) | **DONE 2026-09-25** — [ADR 0067](../decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md) (supersedes ADR 0066 rule 7); `spec/flow-definition.md` v0.24 (`FD-R5`), `spec/run-state.md` v0.11 (`RN-R26`, `RN-R13`'s fourth term); a gate RUNS, its memory the driver's and rebuilt by replay, its decision a `gated` fold input; L6 UNMOVED at 1853 / 100 | its Record |
| [W94](../work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md) | **DONE 2026-09-26** — the TV ingest through a `distinct` gate in both L6 runtimes, arranged, paired, threaded and killed at all 25 kill points; L6 **2069 / 154**; `0.6.0`, four breaks; the `gate` exemption expired and removed | its Record |

**What W92 decided that this plan left open**, each argued in ADR 0066: `route` is a declared edge key owned by ONE rule,
`FD-V41`, on every edge, so `FD-V17` does not move; the KEY PATH is the LIBRARY's grammar and the driver resolves it,
because stop-and-ask (b)'s recorded decision names the key; gate types live on the DEFINITION layer's `Registry.gateTypes`
and **`DriverOptions` does not carry them until W93**, because W76 binds every `DriverOptions` member to a runtime road;
and the refusal is taken at CONSTRUCTION, because the declaration step measured the run-time `default` arm letting a real
worker run first. **Prediction 1 CONFIRMED**, with a loud site no lane names; **prediction 4 holding** at W92 —
`FD-V21`, `FD-V23` and `FD-V24` moved, every one an enumeration. **Handed to W93**: the driver's road for a consumer's gate
types; `routing.ts`' `eligibleEdges`, which answers `[]` for a gate. **Handed to W94**: [Q381](../open-questions.md) — a new
node kind is BREAKING for a consumer's exhaustive switch, and the `README.md` list must say so; and `examples/l6.ts`'
`NOT_YET_AT_L6` exemption, which W94's row turns red until it is removed.

**What W94 found that this plan left open**, each measured: an arrangement is defeated by a SERIAL pool, so the exit
artifact's `identify` pool is as wide as the map, and Deno's threaded pool nearly repeats Q379's trap (28 of 30 keys); the
per-series road ENDS at its own `end`, or every row field naming the per-file record would name the winner; `checkWiring`
reads the gate as a pass-through and calls the natural wiring `no` ([Q391](../open-questions.md)); and the package's
breaks are FOUR — a `route` key on a non-gate edge moved from `FD-V17` to `FD-V41`. **Prediction 3 CONFIRMED**, its one
exception an authoring tool's rather than the run's. **P24 is COMPLETE pending its retro**; W95 was never issued.

**What W93 decided that this plan left open**, each argued in ADR 0067: the memory is a DRIVER FIELD created empty and never
handed in or out — its declaration step measured a memory kept by the PROCESS resuming WRONG, in silence, when the kill preceded
the first decision ([Q386](../open-questions.md)); the `gated` element is REGENERATED on resume, never fed, and recorded BEFORE
what its route leads to; a type that throws stops the run with its own error, a throwing predicate's road; `DriverOptions.gateTypes`
travels W76's road (b), `RuntimeRegistry`; and `FD-R4` through an entry gate holds the payload to the chosen target, asking the
type against a throwaway memory ([Q387](../open-questions.md)). **And the key is resolved ONCE, off the value as a
`structuredClone` carries it** — its conformity reader found a class instance at an entry gate routing differently in a run and
its replay. **Predictions 2 and 4 CONFIRMED.** **Handed to W94**: the `gated` kind in `README.md`'s breaking-change list beside
[Q381](../open-questions.md)'s node kind, and the exit artifact.

---

## Retro

*Pass 3, run 2026-09-26 on `5a80473`'s tree — W93 and W94 in ONE commit on top of W92's `fb2a981`, the working tree
clean. **ONE change adopted, FIVE refused**, and `doc/workflow.md` is [v0.25](../workflow.md), where the full reasoning
lives. What follows is this plan's own evidence. Every harness was re-run in an isolated copy and every number below was
taken on the tree this retro commits unless it says otherwise.*

### The central finding: section 5 rule 5 was FOLLOWED, and a completion order shipped past every rung but one

**[W94](../work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md) asserted a fan-out's COMPLETION order
twice, in the item that quoted the rule forbidding it.** Its conformity reader found the first — the fourteen `beside`
dispatch ids in the order seven concurrent downloads settle (finding 2), closed with W51's `unorderedDispatch` and the
overlap that justifies it. **The second was one field over and neither reader reached it**: the gated rows' `pathEnds`,
where the per-series road ends when its task SETTLES and a drop ends at the gate synchronously, so their interleaving is a
completion time. **Ten green runs, then red in deno inside the confirming `npm run gate`** (What broke 11) — the one
defect of P24's fifty first seen at the last rung, and seen there by chance. The author had applied the rule: the gate's
decision order is asserted only where the arrangement makes it a fact, and the beside ids are a set. The miss was an order
nobody FRAMED as a completion order — v0.23's *a selection nobody framed as one*, for an order.

**Measured at this retro** (`dev-dist/p24r/order.py`, an isolated copy, the fix reverted to W94's pre-gate comparison, every
run's exit code read and every failure attributed by the clause printed under its `FAIL` line):

| the gated rows' `pathEnds` compared | how the order was chosen | node | deno |
|---|---|---|---|
| IN ORDER (W94 before its gate) | SAMPLED — the rungs as they run | **red 0 / 3** | **red 0 / 3** |
| IN ORDER | ARRANGED — `SeriesSetup`'s delay 5 → 300 ms, a worker whose timing no row arranges | **red 3 / 3** | **red 3 / 3** |
| as a MULTISET (the shipped tree) | the same arrangement — the CONTROL | green 3 / 3 | green 3 / 3 |

**Every arranged failure is exactly two `FAIL` lines, the `pathEnds` clause on BOTH arranged rows** — the LAST-first row the
gate caught and its FIRST-first pair, which no rung had ever turned red. *A completion order is a property of a SAMPLE;
every rung takes one, and rule 8's harness grades its L6 probes in one runtime.* No obligation (a)-(e) changes WHICH
completion wins — they break the tree, not the timing — so a set of any size cannot see it, and an ARRANGEMENT sees it every
time. And it is not new: W23 (P7) shipped nested rows asserting terminal-event order, found at the build; W51 (P14) asserted
`refine`'s dispatch order, found by its conformity reader and measured **25 / 25 identical inline and 12 / 12 REVERSED
threaded** — an arrangement, used by a reader, ten plans before anyone wrote it down as a procedure. **And run once against the tree P24 SHIPS it found one more** (`dev-dist/p24r/order2.py`): `Thumbnail` — a worker no TV row arranges — delayed 5 → 300 ms turns L6 red **2 of 2 in node and 2 of 2 in deno**, ONE `FAIL` line each and every other clause green: the cross-row CONTROL *only the P22 artifact and the rows through a gate have two instances of one opener holding together*, whose comment says the TV rows hold *by construction* and which holds by a thumbnail settling before `identify` — a completion order W94's rows configure and never assert ([Q394](../open-questions.md), raised here). *The procedure's first application to a shipped tree found a latent order the item's readers, its three rule 8 passes and its confirming gate had all passed over.*

**THE ONE CHANGE: rule 8 gains obligation (f), BREAK THE ORDER** — for each worker a row runs whose timing the row does not
ARRANGE, the set re-runs the row with that worker delayed past its peers (within one worker type, the other pool mode, W51's
arrangement); an assertion that goes red there compared an order `spec/` does not fix. **It enumerates WORKERS, not orders**:
a flow's node types are a finite list anyone can read off the document, and the orders an author did not frame are exactly
the ones an enumeration of orders misses. *Section 5 rule 5 made provocable*, as v0.8 made rule 4 provocable as obligation
(c) and v0.20 rule 3 as (b)'s tautology clause — it has said *never assert a fan-out completion order* since v0.3 with no
procedure, and four occurrences in three plans are what that has cost.

### Name the rung

**FIFTY defects across the three items' own *What broke* lists — 17 / 16 / 17** — counted one per DISTINCT defect a row
names (W92's row 9 is four, W93's rows 9 and 10 four each, W94's row 5 three), with rows that are a RATCHET firing by
design counted as ZERO, on P23's reading of W89's row 3: W92's row 3 (the spec bindings before the spec), W93's rows 3 and
4 (`RN-R17`'s every-kind `Record`, the lift's two designed expiries, W76's pin, `DRIVER_FIELDS`) and W94's row 5 literals.
**SEVENTEEN name a rung that FIRED (6 / 3 / 8), and ALL SEVENTEEN were read correctly** — the second plan to record none
misread, after P22.

| the rung | what it caught |
|---|---|
| L0, each lane RUN separately, read off the exit code | W92's `typecheck:tests` at exit 2 with ZERO `FAIL` lines; W94's `lint` on an unused local while printing *Checked 129 files* |
| L1, by name, an item's own suite on its first run | W92's shapes carrying an `end` no gate reached, and the record fixture no consumer judged; W93's entry-gate fixture leaving a task `FD-V11`-unreachable |
| L6, by name | W93's `NOT_RUN_STATE` walking the gate types — two NAMED failures where the declaration predicted a crash; W94's two TYPE clauses reading a gate's `type`, and its own cross-row claims' missing subjects; `checkWiring`'s false `no` ([Q391](../open-questions.md)), with the L4 census |
| a gate-entry self-test | W92's `check:docs:selftest`, rule 7 (b) ABORT on two renamed probes; W94's at 20 / 21 on the author's own `X9` probe edit |
| **rule 8's GRADER — v0.24's clause, on its first plan** | W92's two cases running under EACH OTHER's names ([Q382](../open-questions.md)) — WRONG-REASON on the failure line, which no assertion in the file could see; W93's `e1` declared against a suite name, and W92's `d2` crashing another suite |
| rule 8's RE-RUN with the readers' edits (v0.8) | W94's realm fix, which read its expected side from the very knob the reader's edit flipped |
| the confirming `npm run gate` | W94's gated `pathEnds` — above, by chance |

**THIRTY-THREE have no rung (11 / 13 / 9)**: EIGHTEEN found by a reader (5 / 9 / 4), SEVEN at a declaration step's re-take
(2 / 2 / 3 — a validator that THREW, the design's incompatible *L6 UNMOVED*, the process-kept memory resuming wrong in
silence ([Q386](../open-questions.md)), the fold throwing on a new kind, a serial pool defeating an arrangement, Deno's
threaded pool nearly repeating [Q379](../open-questions.md)'s trap, a winner leaking into every row field), and EIGHT by the
author's own reading. **ELEVEN of the fifty are in the INSTRUMENTS (6 / 3 / 2)** — probes and their declarations, two
self-tests' anchors, heredocs broken four times, a reader copy past Windows' path limit, a self-test run while a test file
moved. **All thirteen BLOCKING reader findings have no rung** (3 conformity / 10 adequacy), and the split held: the
conformity readers found claims that were false and one BEHAVIOUR (W93's key read off the copy for the type and off the
original for the record), the adequacy readers bounds that were not there — W92's pass-through bound on the DEFAULT route
only, W93's one gate in every fixture, W94's kill points never checked DISTINCT.

### The predictions

| # | kind | verdict |
|---|---|---|
| 1 | derived, from fact 5 | **CONFIRMED** (W92) — L0 named ONE site in all five lanes, and every other site surfaced at L1 or by reading. **And the churn did not stop at the item it named**: W94's two L6 TYPE clauses read a gate's `type` as a registry node type, a node-kind site W92's census could not list because its read is `.type` and not `kind ===`, found at L6 BY NAME two items later — true to the prediction's letter (not L0), and a scope the prediction did not state |
| 2 | derived, from fact 4 (an EMULATION, one kill point) | **CONFIRMED** (W93), then **on real workers at all 25 kill points in both L6 runtimes** (W94's block (2h)). Its reversal condition — a memory the replay cannot regenerate — was MET by one placement at W93's declaration step, a memory kept by the PROCESS, which completed wrong in silence past the stored events ([Q386](../open-questions.md)); that measurement is why the shipped memory is a driver field |
| 3 | **the REACH** | **CONFIRMED** (W94), one exception outside the run — the wiring check reads the gate as a pass-through ([Q391](../open-questions.md)); none of its reversal column's three shapes was needed. [Q387](../open-questions.md) (an entry gate's type asked twice) was observed on real workers and is outside the artifact |
| 4 | derived, from P23 prediction 4's reversal | **CONFIRMED** (W93) — `RN-R13`'s TEXT moved and no other rule's did but enumerations. **With one thing its wording could not see**: `FD-V17`'s text did not move and its REACH did — a `route` key on a non-gate edge was refused as `FD-V17` before P24 and as `FD-V41` after, which W94 found as `README.md`'s FOURTH break. *A prediction about which rules' TEXT moves cannot see a rule whose extension moves under unchanged text* |

**Four of four CONFIRMED — the third plan to record that, after P16 and P18** — and P10's reading holds: the three derived
predictions tested the inference, and the one REACH is the one that could have reversed.

### v0.24's grader clause: FOLLOWED in all three items, and it caught a defect nothing else could

`gX` (right verdict CRASH) and `gW` (right verdict WRONG-REASON) were graded right on every pass of all three items — three,
two and three — and on this retro's three re-runs. **Its yield is W92's [Q382](../open-questions.md)**: a case's NAME
appended to `DECLARED_CASES` after the self-check's while its BODY sat before it, so two cases ran under each other's names,
invisible to the in-file membership (a SET) and to the outside count — seen only because the grader matched the reason on
the clause's own failure line. **CONFIRMED on its first plan, no change.**

### Refused, five, each with a measurement

**(1) A rule for a fix that SURVIVES its reader's own exact edit** — W94's realm check compared the realm to
`threaded ? 'thread' : 'harness'`, so the reader's edit (the threaded row run inline) moved BOTH sides. **Seven fixes in six
items over six plans** — [W46](../work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md)'s low-baseline
guard, [W53](../work-items/w53-what-a-run-retains-that-nothing-reads.md)'s wrong-route test,
[W86](../work-items/w86-score-each-item-then-fan-out-per-item.md)'s two reach counters,
[W90](../work-items/w90-a-run-killed-and-resumed-on-real-workers.md)'s guard on one resume of four, and W94's — **every one
caught by v0.8's re-run with the readers' exact edits checked back in, zero shipped.** That is v0.8 CONFIRMED at its
seventh occurrence; W94's mechanism is v0.16's *independent* one step along — a fix whose expected side is downstream of
the edit it answers — and the clause that catches it fired.

**(2) A `doc/` check for the TWENTY-THIRD time, on the English class** — and **P24's declaration did not take either
machine-comparable class P23's retro handed it.** Re-measured: `doc/decisions/README.md` indexed every ADR on disk at all
three of P24's commits, so that class did not recur; **[Q171](../open-questions.md)'s did** — W94 shipped its four L6 count
copies at 2059 on a tree running 2060 until its conformity reader's finding 1, BLOCKING, no rung. **A hand-off to a
declaration has now been taken by NONE of the plans it was handed to** — P20's retro named Q171 and P23's named both —
because a plan is the maintainer's question and P24 was a feature request. This retro cannot build a check (`scripts/**` is
an item's), so it hands the two classes to the MAINTAINER instead, as an item outside any plan on W69-W71's precedent.

**(3) An `Owns` pre-declaration rule for the TWELFTH plan** — P24 seeded twelve files; eleven fired (`check-spec.mjs`
did not — a gate type is code, L4's), several for a reason the seed did not give; the six nobody seeded were all found at
a declaration step (W92 one, W93 four, W94 the plan file). **Zero undeclared in all three.**

**(4) A rule for a dispatch site a stated census predicate cannot see** — W94's two L6 TYPE clauses read a gate's `.type`,
outside W92's `kind ===` predicate. One occurrence, and the rung it needed fired BY NAME on the rows' first run; prediction
1 records its scope.

**(5) A rule that a rule 8 harness grades L6 in BOTH runtimes** — W94's graded node only and the order fired in deno. The
measurement above says the ARRANGEMENT is runtime-independent (3 / 3 in each), so the change adopted covers it; a second
runtime doubles the cost and still samples.

### The numbers

**Rule 8 across the plan, all 169 probes RE-RUN at this retro on the shipped tree** (W92's 48, W93's 67, W94's 54) — each in
its own isolated copy: a `git clone --no-hardlinks` of `5a80473` with `node_modules` copied in, zero symlinks and zero reparse
points measured first, each copy verified green on the four rungs its harness reads (L1-L5, L6, `check:spec`, `check:docs`,
each exit 0) before any probe ran, each item's own harness run against it. **All three read digest `ac4a78518bb90a35` over 414
files, identical at both ends of every set.**

| set | at this retro |
|---|---|
| W92's 48 | **1 control clean, `gX` CRASH and `gW` WRONG-REASON as declared, 37 caught, 3 declared ceilings RUN (`r6`, `r10`, `r12`) — and FIVE ABORTS, every one a SITE the later items CONSUMED BY DESIGN**: `b1`, `b2`, `c2` and the ceiling `b10` anchor on ADR 0066 rule 7's construction refusal, which W93 LIFTED (ADR 0067); `b8` on the `NOT_YET_AT_L6` exemption, which W94's Output 5 REMOVED. Neither confirmed nor falsified (P18's reading of a deleted site); the lift is W93's `a21` and the expiry W94's kind clause. **Four RE-ANCHORED and CAUGHT**: `b5` and `r8` on `boundaryTargets`' entry walk, which W93 gave a chooser; `r11` and `b9` on the kind clause, which lost its exemption — `b9` re-expressed as its nearest meaning, a permanent `gate` exemption written back, refused by the clause's third constructed input. **`b9` is the dated ceiling W92 already took as a catch** |
| W93's 67 | **1 control clean, `gX` CRASH and `gW` WRONG-REASON as declared, 62 caught, 2 declared ceilings RUN (`k1`, `k2`), 0 aborts, 0 against declaration** — exactly W93's pass 2 |
| W94's 54 | **1 control clean, `gX` CRASH and `gW` WRONG-REASON as declared, 48 caught, 3 declared ceilings RUN (`rc2`, `r5`, `r7`), 0 aborts, 0 against declaration** — and **the first time this set has run whole on the tree W94 SHIPS**: its Record's pass 3, headed *the final tree*, ran at `b6d1ae564aa3644b`, before the confirming gate turned What broke 11 up, and only `b16`, `d2` and the controls were re-run on the fix — corrected in W94's file under pass 3 rule 6. **`rc2`'s stated reason is itself a completion order** (*the inline downloads DO settle in index order*): a declared ceiling that obligation (f) would provoke, recorded rather than re-graded because the obligation is this retro's and the item's set predates it |

**Across the plan: 169 probes, 3 controls clean, 147 caught, 8 declared ceilings RUN, ZERO undeclared survivors, all six grader controls graded as declared (three CRASH, three WRONG-REASON), FIVE aborts — all W92's, every one a site W93 or W94 consumed by design — and ZERO against declaration otherwise** — and the dated-ceiling clause's yield is **ZERO NEW catches for the sixth plan running**:
W92's one dated ceiling (`b9`) was taken inside W92, by its own adequacy reader.

**Readers: six passes, none empty, and THREE overlaps — 1, 1, 2, the fifty-seventh to fifty-ninth measurements**, band
unmoved, and section 6's list and the sequence under it appended here. **Blocking findings: W92 0 + 4, W93 1 + 4, W94 2 + 2
— thirteen, split 3 conformity / 10 adequacy. All THREE conformity readers' central obligations came back with ZERO
disagreements on the VALUES — the fourth plan running.**

**Late exceptions: zero undeclared in any of the three.**

**Census CONFIRMED for the TWENTY-SIXTH plan running — 303 / 235 / 1 / 67 before this retro's edits and 304 / 236 / 1 / 67
after, every id in exactly one cluster cell**, by W92's parser unchanged. The retro RAISES [Q394](../open-questions.md) — the
next free id, outside P24's block, found by applying the change it adopts — and resolves none: [Q391](../open-questions.md) stays open (an authoring tool
that reads a gate as a pass-through is conservative, not wrong about the run, and teaching it routes is a plan's
question); [Q392](../open-questions.md) stays open (the static root import that makes L6 honest is what makes a revert
unreadable, and a dynamic one would reach a surface no consumer has); [Q386](../open-questions.md) stays open (the shipped
gate cannot resume wrong; a decision predicate with closure memory still can, which is [Q9](../open-questions.md)'s purity
one road over); [Q387](../open-questions.md) stays open (an entry gate's type asked twice, observed on real workers).

**[Q142](../open-questions.md)** — measured before this retro's edits on the shipped tree: probe 1 **120 files against `M3`'s
123, margin 3**; probe 2 **5402 links against `M4`'s 6225, margin 823**. **Re-measured AFTER this retro's edits, on the tree it commits: `M3` unmoved at margin 3 (the retro adds no document), and probe 2 5449 links — `M4` margin 776**, forty-seven links narrower, every one in `CLAUDE.md`, `README.md`, `doc/README.md`, `doc/workflow.md` and the register — files probe 2 does not cut (it cuts this one). Q142 does not fire. **`M3` at 3 is the tightest any retro
has handed on**: the next plan's declaration writes a plan and a work item outside `doc/decisions`, which takes it to 1, and
its second item's file FIRES it — **predicted here, from the count, as P24 predicted `M4` at W92.**

**This retro's own instruments, recorded rather than hidden**: its first launch of the three sets put `&` after a `cd … &&`,
so only W92's ran and two 19-byte logs landed one directory ABOVE the repository — seen within minutes because two of three
logs were missing, removed, the live tree untouched, and W93's and W94's sets then run in their own copies; one Python
heredoc carried a backslash escape (its anchor asserted, the bytes right); and the order harness's own `FAIL` counter read
lines from column 0 where L6 indents them, so it was re-graded from the kept logs by exit code and clause line.

**The confirming `npm run gate` over the retro's final tree: `GATE EXIT=0`, ZERO `FAIL` lines**, about nineteen minutes in node 24.20.0; `selftests` 8 / 8 ok in 1002.0 s wall; spec 7 / 65 / 125; markdown 159 / 7359 / 408; docs 37 snippets, 31 run, 6 check, `X8` pairing seven; `check:workers` 21; L1-L5 53 / 1423 in node, deno and chromium; L6 2069 / 154 in node and deno — every rung UNMOVED, which is what a retro that edits only documents must show. Content digest `060ca71b6f27a904` over 414 tracked and untracked-unignored files, identical before and after — RUN and redirected, never piped. This sentence is the one edit made after it, and `check:markdown` and `check:docs` were re-run over it.

**W95 CLOSED unissued. Q379-Q393 all used or spent** — Q383-Q385 (W92), Q388-Q390 (W93) and Q393 (W94) reserved and unused.
**ADR 0066 and 0067 both taken; Q394 taken by this retro. The next plan starts at W96, Q395 and ADR 0068** *(W97, Q400 since [W96](../work-items/w96-the-counts-and-the-index-a-check-can-compare-and-q394.md), an item outside any plan, took the id)* — derived by grep off the tree at this
retro, never from this sentence, and `CLAUDE.md` already says so.
