# P24 — What a node may REMEMBER across a run's branches

**Status:** **DECLARED** 2026-09-25 on `912bfcb`, all four stop-and-asks ANSWERED the same day as recommended, and
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
| 5 | **What a sixth node kind costs at L0.** `GateNode` added to the `FlowNode` union in a copy of the tree, the five typecheck lanes run separately | **ONE error, the same in four lanes**: the driver's exhaustive `never` in `enter()`'s `default` arm (`typecheck:deno` fails on it too). **`src/` has 51 node-kind dispatch sites in 6 files** — `validate.ts` 18, `wiring.ts` 12, `regions.ts` 10, `driver.ts` 9, one each in `bootstrap.ts` and `routing.ts` — **and ONE is exhaustive.** 45 more sit outside `src/`, in `examples/l6.ts`, `scripts/check-spec.mjs` and nine test files |
| 6 | **The validator today** | a `kind` outside its `KINDS` literal is refused by **`FD-V24`** by name — so before this plan a gate document is LOUD; the moment `gate` joins that literal, every other site that does not name it falls through in silence |
| 7 | **A worker cannot hold the memory** (measured in conversation, `dev-dist/teardown/`) | an inline pool's instance state is LOST on idle teardown and its MODULE state survives; a threaded pool loses both, because a new thread loads the module fresh |

### What the facts found that nobody asked about

- **The inline pool is the DEFAULT-POSITION trap for this feature, verbatim.** v0.23's selection clause
  says a fixture at the default position cannot tell a rule from its most plausible wrong selection — and
  on an inline pool *first to arrive* and *lowest index* are the same selection 19 times in 20. Every
  fixture that asserts a winner must ARRANGE the order and assert the arrangement's own effect, and the
  exit artifact's threaded rows are where the two differ without arrangement. **[Q379](../open-questions.md).**
- **The churn is SILENT, and fact 5 is why.** One exhaustive check among 51 dispatch sites means the
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
| W92 | `scripts/check-spec.mjs`, `scripts/check-spec-selftest.mjs` | six node-kind sites; `C7` reads every task's type, and a gate has a type and is not a task |
| W92 | `AGENTS.md` | *Five node kinds* in section 3, and section 9's executed error-class enumeration if a refusal gains a class ([Q101](../open-questions.md)) |
| W93 | `examples/l6.ts` | the driver's new private field reaches `DRIVER_FIELDS` — W55's universe binding, which fired on W59, W61, W88 and W89 |
| W93 | `AGENTS.md` | a new `FoldInput` kind, if stop-and-ask (b) takes one, reaches the executed snippets that walk `kind` |
| W94 | `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | `RUN_FLOOR`, `README_SNIPPET_FLOOR`, the `X8` pair list, and the `X9` probe's version anchor |
| W94 | `test/definition/wiring.test.ts`, `spec/outcome-record.md` section 4 | the corpus censuses pinned outside their corpus ([Q342](../open-questions.md), [Q360](../open-questions.md)), because W94 ADDS a flow |
| W94 | `scripts/check-workers-selftest.mjs` | W94 adds workers (fetch, identify, thumbnail, series setup) |

---

## Predictions, to be written down BEFORE the items that test them

*The scope column states what the measurement COVERED and claims nothing beyond it.*

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **The churn surfaces at L1 and not at L0**: W92's typecheck names only the driver's `default` arm, and every other site that must learn the kind is found by a failing test or by reading | fact 5: 51 sites, one exhaustive, measured by the TYPE change alone; no site's BEHAVIOUR on a gate document was measured | a second exhaustive site, or a site that mishandles a gate with every test green — which would be a silent defect, not a reversal to be glad of |
| 2 | **Resume needs no new mechanism**: the gate's memory is rebuilt by the replay P23 built, a checkpoint needs no new field, and a checkpoint taken before this plan resumes unchanged | fact 4: an EMULATION — a predicate, not a gate — one flow, one kill point, both runtimes | a memory the replay cannot regenerate — anything keyed by wall time, by pool, or by a callback's side effect |
| 3 | **REACH: the TV-series flow runs as the maintainer described it** — one per-series branch per series whatever the arrival order, thumbnails for every file, the run `completed`, and identical after a kill at every kill point | **none — this is a reach.** No gate has run; fact 2 measured arrival order under a predicate | a shape the flow needs that a gate cannot express — a key the task before it cannot compute, a drop that must report more than `branch.exited`, a join that must know how many were dropped |
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
