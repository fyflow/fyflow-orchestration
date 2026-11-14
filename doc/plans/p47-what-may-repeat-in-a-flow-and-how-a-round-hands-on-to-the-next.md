# P47 — What may repeat in a flow, and how does one round hand on to the next?

**Status:** planning — drafted 2026-11-13 on `65111af` and committed as `df60b9e`; declared 2026-11-14 on `df60b9e`
(the tree clean, `main` at 0.14.0) with facts 12-16 MEASURED in a byte copy (section *Measured at this declaration*),
Q809 and Q810 raised, [Q582](../questions/q582.md) reopened and W228-W230's files written. Decisions 1-7 are the
maintainer's, taken one by one on 2026-11-13 against fyflow-app's *pass 8* #2, each *"as recommended"*; decision 1
was REVISED by the maintainer on 2026-11-14, before declaration, from (a) to (b′) (its own text says why). The app's
pass 8 #1 is not evaluated here.
**Question this plan answers:** *may a flow run one region's branch again and again, one round after another, until a
declared comparison holds, the body breaks, or a declared bound is reached — with the outer graph and the body both
staying acyclic, every task id unique by its branch path, and a resume replaying the rounds from their settlements
alone?*
**Exit artifact:** *on the final tree: (1) an L2 suite routing a `loop` from fixture logs to each of its five ways out
— continue, done, exhausted, break, lost — every expected value derived from this plan's decisions and the spec text
the items write, never from output; (2) L5's matrix extended by a loop × lost / break / park / cancel / stop / pause;
(3) a resume of a loop checkpointed mid-round replaying to the same fold with no new `FoldInput` kind and
`CHECKPOINT_FORMAT` unchanged — or the measurement that refutes that, as a stop-and-ask; (4) one block in
`examples/l6.ts`, green in node 24 and deno: a training-shaped loop (a `map` inside the body, `until`, a reader after
the loop naming a body node's every round) and a polling loop that breaks; (5) the retained footprint of a loop MEASURED beside a `map` of the same task count, against
`RN-R13`; and `npm run gate:full` EXIT 0 — the LAST item runs it (workflow v0.29).*
**Reserves:** W228-W231, Q809-Q818, ADR 0145-0147; no S id

```
Question: what may repeat in a flow, and how does one round hand on to the next?
Items:    W228 (the definition: the `loop` kind, its refusals, the schema and the wiring check's arcs),
          W229 (the driver: a round opened, carried, decided, broken and lost; the join value; every round read from outside),
          W230 (resume, retention and real workers: L5, L6, AGENTS.md, the measured footprint, the reply, P47's Record)
Reserves: W228-W231, Q809-Q818, ADR 0145-0147
Raises:   Q809 (compaction, deferred; decision 3) and Q810 (a constant in `needs`, open, W228's; decision 4)
Measured: in a byte copy of `df60b9e` (`git archive` into C:/tmp-p47/m, node_modules copied, zero links), node 24
Baseline: `npm run state` on 2026-11-13 prints P47 / W227 / Q809 / ADR 0145 from the tree and W228 from the ledger.
          The disagreement is P46's: it reserved W224-W227 and SKIPPED W227 unissued (P46's Reserves line), and
          its Record says *"the next plan starts at W228, Q809 and ADR 0145"*. W227 is never reissued, so P47 starts at W228
```

## Why this plan, and why now

`FD-V10` refuses every cycle, so *"do this again until it is good enough"* cannot be written as a flow.
[Q582](../questions/q582.md) evaluated that at P32 and deferred it: *"Real, not now: no flow in either corpus needs one
… It comes back with the first case neither covers."* **This is that case.** fyflow-app's pass 8 #2 asks for training and
evaluation loops — collect over environments (a `map`), train, evaluate, again — plus *poll until finished* and *refine
until a reviewer accepts*. Each round is several nodes on their own pools and groups, so neither `retryPolicy` (one
task) nor `map` (a known list, run at once) covers it, and folding the round into one task loses the scheduling, the
per-node run view and per-round resume. The app's fallback, *continue-as-new* (one run per round), shows one loop as
many runs.

The shape asked for is not a back-edge. **A loop is a region whose one branch runs SEQUENTIALLY, with an arity the
run decides** — a `map` whose instances run one after another, each handed what the last arrived with. The outer graph
stays a DAG with the loop as one region, the body stays a DAG, and the four things Q582 says assume no cycle — the
task-id scheme, `reaches(X)`'s irreflexivity, `FD-V29`'s certainty walk and `RN-R26`'s replay — are untouched by
construction. That is the claim this plan exists to test rather than assume.

## What fyflow-app asked, held against this draft

Read at `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass8.md` (read, not edited; its own
status line *drafted, not sent*). **The reply is written AFTER the implementation** (the maintainer, 2026-11-13), by
W230.

| the app's item | answer in this draft | item |
|---|---|---|
| #1 an instance's pool option set back to the default | **not evaluated** — out of this plan | — |
| #2 a `loop` region | accepted, decisions 1-7 | W228-W230 |
| #2 Q1 releasing a round's results | declined: the log is the floor (`RN` section 7); decision 3 | W230 |
| #2 Q2 leaving early | a break through an `end`; leaving the region stays refused; decision 5 | W229 |
| #2 Q3 a new fold input / format | expected neither; MEASURED, exit artifact (3) | W230 |
| #2 Q4 `maxIterations` from data | accepted, only to lower it; decision 6 | W228, W229 |
| #2 Q5 `delayMs` | agreed out of scope; decision 7 | — |
| #2 *"the join fires the next round"* sketch, `branch: "collect"` (a `map`) | the entry is a `task` or an `ask`, as a map's is; decision 4 | W228 |

## Facts read for this draft — READ, not measured; 12-16 below are measured

| # | fact | source |
|---|---|---|
| 1 | `FD-V10` refuses a cycle; `reaches(X)` is irreflexive only because of it | `spec/flow-definition.md` sections 4, 5 |
| 2 | inside a `map` a branch index is a property of the DISPATCH, and `branchPathOf` refuses rather than guesses (`ID-R6`) | `spec/flow-definition.md` section 4 *What a map changes*; `spec/task-id.md` section 3; ADR 0036 |
| 3 | a one-branch region produces no finding from `FD-V12`, `FD-V13`, `FD-V20`, `FD-V22` | the same section, *What does not change* item 2 — MEASURED there for `map`, not for `loop` |
| 4 | a map's `branch` is a `task` or an `ask`; a map node is never itself a branch entry (`FD-V25`) | `spec/flow-definition.md` section 2 `map` |
| 5 | a map may declare `needs`, and its value is then the object `needs` describes (`FD-C1`) | the same, *What `over` is a key ON* |
| 6 | the region vocabulary: `branch.arrived`, `branch.exited` (reached an `end`), `branch.lost`, `branch.opened`, `branch.suspended`, `branch.resumed`; `branch.exited` is defined on reaching an `end`, not on leaving the region | `spec/join-policy.md` section 2 |
| 7 | an edge may route a failure: `on: ["failed"]` (`FD-V18`) | `spec/flow-definition.md` section 3 |
| 8 | retention is *(tasks settled) x (bytes each returned)* plus named extras (`RN-R13`); **nothing may be evicted from `inputs`**, and a fold over a truncated log reports `completed` while knowing nothing | `spec/run-state.md` section 7; ADR 0046 |
| 9 | a checkpoint is the whole fold-input sequence and a header; replay regenerates every region event from the settlements; `CHECKPOINT_FORMAT` moves only when what a checkpoint carries moves (`RN-R16`) | `spec/run-state.md` sections 8, 9 |
| 10 | a node of the built-in type that only transforms runs a JSONata `transform` with no worker of the author's (`FD-V46`) | `spec/flow-definition.md` section 2 `transform`; W109 |
| 11 | `"$item"` where no map instance contains the reader is `FD-V49` | `spec/flow-definition.md` section 5; `AGENTS.md` section 3's refusal count |

## Scope

**In**

1. A `loop` node kind: `branch`, `until`, `maxIterations`, optional `maxIterationsFrom` and `needs`; its join is an
   ordinary `join` declaring `of`.
2. Every validation refusal it needs, `definitionSchema` and `definitionSchema(registry)`, and the wiring check's new
   arcs.
3. The driver: opening round *i* at its own branch-path segment, carrying the state, deciding continue / done /
   exhausted / break / lost, the join value, a reader after the loop resolving a body node over every round, and
   `"$iteration"`.
4. Nesting both ways: a `map` inside a loop's body and a loop inside a `map` instance, and a loop inside a loop.
5. Run control in a loop: cancel, stop, pause, an ask's park, `retryPolicy` in a body task.
6. Resume of a loop checkpointed mid-round; the retained footprint measured.
7. `AGENTS.md`'s section for it; the reply to fyflow-app; P47's Record.

**Out** — named rather than left implicit

- **Arbitrary back-edges.** `FD-V10` stays exactly as it is.
- **A `collect` key** — not needed: the array form of `needs` after the loop is it, decision 1.
- **A "last round" reading of a body node from outside** — `last` in the join value is the loop's state; a body node's
  own last output is not offered, decision 1.
- **Compaction** of finished rounds — a deferred question, decision 3.
- **`onLost: "exit"`** — decision 2's opt-in, additive later.
- **A `map` or `fanout` as a loop's entry** — decision 4, additive later once measured.
- **`delayMs`** and any clock in the driver — decision 7.
- **[Q16](../questions/q16.md)**, flow-level retry and `flowAttempt` — a loop needs neither.
- fyflow-app's pass 8 #1.

## Decisions taken before fan-out

*The maintainer's, 2026-11-13, one at a time, each answered "as recommended". Q1, Q2 and Q4 are resolved; Q16 is
scoped out above. ADR 0145 records decisions 1-5 as one decision about what a round is; whether 6 and 7 need their own
is W228's to say.*

1. **A body node is read from outside a loop as a map instance's is — (b′).**
   - A reference from a node OUTSIDE a loop to a node of its body follows a map's ADR 0044 reading: the ARRAY form
     (`needs: { trained: ["train"] }`) receives that node's output from every round, in ROUND order, a round that routed
     around the node contributing nothing, as a map instance that did not reach it does; the SINGULAR form is refused
     where more than one output could exist (`FD-V28`), as after a map. No new `FD-V`, no new key. A value that must
     carry its round number includes `"$iteration"` in its own result. *(That a map leaves out an instance that did not
     reach the node is the reading this rests on; W228 confirms it against ADR 0044 and the code, and stops and asks if
     it does not hold.)*
   - Inside the body a reference resolves within the reader's OWN round, as within a map instance. An earlier round is
     reached only through the carried value. A node upstream of the loop is reached by `needs` as anywhere, and resolves
     the same in every round.
   - **Why (b′) and not (a), the refusal decided on 2026-11-13.** (a)'s reasons were retention, ambiguity and
     compaction, and none holds: `RN` section 7 keeps every round's settlement whether or not anything reads it, and a
     reader's composed copy is shared by every reader (ADR 0126), the same cost as a declared `collect`; "every round" is
     not ambiguous, only "the last round" is, and the singular is already refused; and compaction needs to know which
     body nodes are read from outside, which the document states (decision 3). What (a) bought was one exit — everything
     leaving a loop in its join value — and the price was a rule a `map` does not have, plus a `collect` key duplicating
     the array form. A loop is a map run one round after another; reading it the same way is the smaller thing to learn
     and to build.
   - **Why not reduce through the carried value**: a carried state of FIXED size (best so far, a count, a handle) costs
     rounds x c and is free; a carried HISTORY costs round *i* a copy of *i* summaries, every one kept by `RN` section 7,
     so about N²·r/2 over N rounds — 500 rounds of 1 KiB is ~125 MB where reading the rounds from outside is ~500 KiB.
     *(Estimated from the formula, not measured; W230 measures it.)*
2. **A round that is LOST loses the loop.** `branch.lost` in round *i* — a node settled with no eligible edge, or an
   inner region `unsatisfiable` (`JP-R10`) — makes the loop's join `unsatisfiable`, as for every region. A failure the
   author wants to survive is routed inside the body (`optional` and `on: ["failed"]`) into the state, where the next
   round and `until` see it. A non-optional task out of retries PARKS (`branch.suspended`), and a person resolving it
   `failed` is a loss. `retryPolicy` stays a task's; a round never re-runs a task by itself. Cancel and stop are halts
   (ADR 0104, ADR 0105), not losses, and open no next round. `onLost: "exit"` is out.
3. **A loop releases nothing.** Its footprint is `RN-R13`'s: rounds x tasks per round x bytes each returned — the same
   law as a `map` of that many tasks, so the lever is a result that is a REFERENCE rather than the data, in a loop as in
   a map. No live-state release: the log is the floor (`RN` section 7), and a second retention rule for loops alone would
   buy only the per-task view (ADR 0121). **Compaction is raised as a deferred question**, and it stays SOUND under
   decision 1 (b′): the set of body nodes read from outside the loop is stated by the document, so once round *i + 1*
   has opened, everything the run can still need of rounds 0…*i* is the carried value and those nodes' outputs — a
   fold input such as `loop.compacted { carried, read, through }` would let the fold say it was handed less, which is
   `RN` section 7's condition for any eviction. Not built: it moves what a Host must keep to show
   a compacted round and to answer `inputOf` for one (ADR 0128).
4. **State in is state out.** The body's entry `E` receives, in round 0, the LOOP'S value — what reached it, or the
   object its own `needs` describes, which is the SEED — and in round *i > 0* what round *i − 1* arrived at the join
   with. So `FD-C1`'s `"."` row gains a fifth arc. **The wiring check holds `E`'s `inputSchema` against the loop's value
   AND against the output of EVERY body node with an edge to the loop's join**, one finding per arc naming its
   producer. **`E` is a `task` or an `ask`**, as a map's branch is (`FD-V25`); the app's sketch, whose entry is a `map`,
   puts a small transforming node first. **`"$iteration"`** is the round's index inside the body and is refused outside
   it, as `"$item"` is by `FD-V49`. *(Whether `needs` may state a CONSTANT seed — `n: 0` — is not decided: a question
   raised at declaration. Without it, a transforming node BEFORE the loop shapes the seed, once.)*
5. **An `end` inside the body is a BREAK.** A round leaves one of four ways:

   | how the round leaves | the loop |
   |---|---|
   | arrives at the join; `until` does not hold; the bound not reached | **continues**: round *i + 1* opens |
   | arrives at the join; `until` holds | **done**: the join fires |
   | arrives at the join; the bound reached, `until` not holding | **exhausted**: the join fires |
   | reaches an `end` of the body (`branch.exited`) | **breaks**: the join fires |
   | no eligible edge (`branch.lost`) | **lost**: decision 2 |

   *"Leaving the region"* to a node after the join stays refused (`FD-V13`, `FD-V22`) — an `end` has no edges, so the
   app's *"the run going on from the exit"* has no reading. `until` is a comparison from the declared subset over what
   ARRIVED — over the ONE root `input`, an `if` gate's scope (fact 15) — checked by the driver on each arrival, so it
   replays as a decision edge does; the loop is do-while — a round
   always runs before `until` is read, and a check-first loop is an `if` in front of it. **The join value**:

   ```ts
   { last, iterations, exhausted, broke?: { at, value } }
   ```

   `last` is the loop's most recent STATE — the arrival `until` held on, the final arrival when exhausted, and on a break
   the state the breaking round STARTED with (the seed if round 0 broke) — so it always exists and always has `E`'s
   input shape. `iterations` counts the rounds opened, a breaking one included. `exhausted` is true only when the bound
   ended the loop. `broke` is present only on a break: the `end`'s id and what reached it. A loop's join takes NO join
   policy: the driver decides when it fires.
6. **The bound is in the document.** `maxIterations` is REQUIRED, a literal integer >= 1 (a new `FD-V`), so rounds x
   tasks per round is known before the run starts. `maxIterationsFrom`, optional, is a key path on the loop's value,
   read ONCE as round 0 opens, as `over` is read on a map's; the bound used is the SMALLER of the two. Absent, not an
   integer, or < 1 at run time is a refusal naming the loop and the key — `FD-R2`'s reasoning, the producer's bug named
   rather than a silent fall-back. A loop of zero rounds is an `if` in front of it.
7. **No `delayMs`.** The driver has no clock, and a timer would put wall time into what a resume replays. A polling body
   waits inside its task, which HOLDS a pool slot — so it belongs on a small named pool instance of its own (ADR 0099).
   A delayed start, if ever wanted, is a scheduler wish for `doc/scheduler-upstream.md`, not a driver feature.

**Settled by consistency rather than asked**, each for W228 or W229 to confirm against the spec and to stop-and-ask on
if it does not hold:

- A round's branch path is the parent's path plus the round index as one segment (`r1:train:3:0`; `3.1` for a map
  inside it) — `ID-R1` unchanged, no new segment, `flowAttempt` stays `0`.
- Each round opens with `branch.opened` at its own `branchPath`, emitted before the round's first dispatch (`JP-R5`), and
  a halted run's hold (ADR 0103) holds it like any dispatch.
- A gate's memory (`RN-R26`) spans rounds as it spans map instances: a `distinct` gate in a body dedupes across rounds.
- An ask in a body is minted per branch path, so once per round it is reached.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [W228](../work-items/w228-the-loop-in-the-definition.md) | the definition: the `loop` kind and its keys; decision 1's map reading; the refusals of decisions 4 and 6; `"$iteration"`; `definitionSchema`; the wiring check's arcs; ADR 0145 | `spec/flow-definition.md`, `spec/task-id.md`, `src/definition/**`, its L1/L3/L4 tests, `spec/examples/` loop fixtures | — | `gate:item` |
| [W229](../work-items/w229-a-loop-at-run-time.md) | the driver: a round opened, carried, decided and broken; lost; the join value; every round read from outside; `maxIterationsFrom`'s refusal; L2 and L5 | `spec/join-policy.md`, `spec/flow-definition.md` section 6 (a declared late exception), `src/driver/**`, `src/fold/**` only if measured necessary, its L2/L5 tests | W228 | `gate:item` |
| [W230](../work-items/w230-a-loop-resumed-measured-and-on-real-workers.md) | resume and retention measured; L6 in node 24 and deno; `AGENTS.md`; the reply to fyflow-app; P47's Record | `spec/run-state.md`, `examples/**`, `AGENTS.md`, the reply file | W229 | `gate:full` |

W231 is reserved spare. Each item's file is the declaration; this table is an index.

## Measured at this declaration

*In the byte copy named above; the two spikes are scratch, not in the tree, and each states its command. A `loop`
does not exist, so 12 and 13 measure a PROXY: the loop's region modelled as a `map` whose one branch is the body.*

| # | fact | measured |
|---|---|---|
| 12 | **fact 3 holds for both of the app's shapes.** A training body — entry `plan`, a nested `map` over `envs` and its join, `train`, an `optional` `evaluate` with `on: ["failed"]` to an `end` inside the body (a break), `fold`, the region's join, `promote` after it — gives **0 findings** from `validateDefinition`. A polling body — `check` with a `{ predicate }` decision edge to an `end` (a break) and a default edge to the join — gives **0** | `validateDefinition(d, corpusRegistry(spec/examples/registry.json))` |
| 13 | **decision 1 (b′)'s reading is a map's, and the document for it is in hand.** The training proxy with `promote` declaring `needs: { trained: ["train"] }` — a reader after the region naming a body node — gives **0 findings**: a `map` accepts it (ADR 0044). W228 keeps that same document green for a `loop`, and its singular twin (`needs: { trained: "train" }`) red by `FD-V28` for both. *(Measured under (a), when it was the control for a refusal; the measurement is unchanged)* | the same |
| 14 | **a node is named from another at exactly TWO sites**: a node's `needs` and an edge's `needs`, both read through `referenceTarget` (`src/definition/validate.ts`, the `needs` blocks and the one loop over both sites). A comparison's `path` and `valueFrom` reach another node only through its edge's `needs` (`PREDICATE_ROOTS`); `"$payload"` and `"$item"` name no node. So the set of body nodes read from outside a loop — what decision 3's compaction would keep — is derived from two sites, not four | read in `src/definition/validate.ts` at `df60b9e` |
| 15 | **`until` has a scope to reuse.** An `if` gate's condition has ONE root, `input` — what reached the gate (`GATE_CONDITION_ROOTS`, `GATE_SCOPE`) — which is what the app's sketch writes (`input.score`) and what decision 5 says `until` reads: what ARRIVED | the same |
| 16 | **the window a loop adds between round *i* ARRIVING and round *i + 1* OPENING is not a new kind of prefix.** A one-item `map` run, every prefix folded: after `branch.opened` the prefix reads **`stuck`**, after the branch's outcome **`stuck`**, after `branch.arrived` **`stuck`**, and only `joinSettled` turns it **`completed`** — so a prefix inside ONE routing step already reads `stuck` today, which `RN-R12` allows because it claims its predicate at a quiescent point. A loop's window is the same as long as arrival, the `until` decision and the next round's `branch.opened` happen in the SAME synchronous routing step; W229 holds that, and needs no ordering rule beyond it | 9 inputs: `dispatched` `running`, `outcome` `completed`, `regionEntered` `stuck`, `branch.opened` `stuck`, `dispatched` `running`, `outcome` `stuck`, `branch.arrived` `stuck`, `joinSettled` `completed`, `pathEnded` `completed` |

**And one READ fact made precise by measuring**: `needs` has no literal form — every value is a reference (fact 14's
grammar) — which is why [Q810](../questions/q810.md) is open rather than assumed answered.

**Not measured here, and said so**: whether replay regenerates every round's `branch.opened` from the settlements
alone (fact 9 for a loop). It needs the driver arm that does not exist yet; it is exit artifact (3), W230's, and
P23 fact 1 is the measurement it rests on for every region that exists today.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q582](../questions/q582.md) | a loop — the question this plan answers; resolved by W230 if the exit artifact stands | P47 |
| [Q809](../questions/q809.md) | compaction of a loop's finished rounds: a fold input that lets the fold say it was handed less; sound because the document states which body nodes are read from outside | no owner — deferred |
| [Q810](../questions/q810.md) | may `needs` state a constant, so a loop's seed needs no transforming node before it? | W228 |
| [Q16](../questions/q16.md) | flow-level retry — scoped out; a loop does not answer it | no owner |

## Record

*Filled in at the join, after the work items are merged.*

**Exit artifact.**

**What the plan answered.**

**Retro.**
