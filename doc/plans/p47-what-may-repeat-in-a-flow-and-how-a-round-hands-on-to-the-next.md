# P47 — What may repeat in a flow, and how does one round hand on to the next?

**Status:** planning — DRAFTED 2026-11-13, not yet declared. Decisions 1-7 are the maintainer's, taken one by one on
2026-11-13 against fyflow-app's *pass 8* #2, each *"as recommended"*. **Nothing below is MEASURED yet**: every fact is
READ, with its source, and the declaration measures them in a byte copy before any item file is written (section
*Before declaration*). The app's pass 8 #1 is not evaluated here.
**Question this plan answers:** *may a flow run one region's branch again and again, one round after another, until a
declared comparison holds, the body breaks, or a declared bound is reached — with the outer graph and the body both
staying acyclic, every task id unique by its branch path, and a resume replaying the rounds from their settlements
alone?*
**Exit artifact:** *on the final tree: (1) an L2 suite routing a `loop` from fixture logs to each of its five ways out
— continue, done, exhausted, break, lost — every expected value derived from this plan's decisions and the spec text
the items write, never from output; (2) L5's matrix extended by a loop × lost / break / park / cancel / stop / pause;
(3) a resume of a loop checkpointed mid-round replaying to the same fold with no new `FoldInput` kind and
`CHECKPOINT_FORMAT` unchanged — or the measurement that refutes that, as a stop-and-ask; (4) one block in
`examples/l6.ts`, green in node 24 and deno: a training-shaped loop (a `map` inside the body, `collect`, `until`) and a
polling loop that breaks; (5) the retained footprint of a loop MEASURED beside a `map` of the same task count, against
`RN-R13`; and `npm run gate:full` EXIT 0 — the LAST item runs it (workflow v0.29).*
**Reserves:** W228-W231, Q809-Q818, ADR 0145-0147; no S id

```
Question: what may repeat in a flow, and how does one round hand on to the next?
Items:    W228 (the definition: the `loop` kind, its refusals, the schema and the wiring check's arcs),
          W229 (the driver: a round opened, carried, decided, broken and lost; the join value; `collect`),
          W230 (resume, retention and real workers: L5, L6, AGENTS.md, the measured footprint, the reply, P47's Record)
Reserves: W228-W231, Q809-Q818, ADR 0145-0147
Raises:   at declaration, the compaction question (decision 3) and the seed-constant question (decision 4)
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

## Facts read for this draft — NOT measured

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

1. A `loop` node kind: `branch`, `until`, `maxIterations`, optional `maxIterationsFrom`, `needs` and `collect`; its
   join is an ordinary `join` declaring `of`.
2. Every validation refusal it needs, `definitionSchema` and `definitionSchema(registry)`, and the wiring check's new
   arcs.
3. The driver: opening round *i* at its own branch-path segment, carrying the state, deciding continue / done /
   exhausted / break / lost, the join value, `collect`, and `"$iteration"`.
4. Nesting both ways: a `map` inside a loop's body and a loop inside a `map` instance, and a loop inside a loop.
5. Run control in a loop: cancel, stop, pause, an ask's park, `retryPolicy` in a body task.
6. Resume of a loop checkpointed mid-round; the retained footprint measured.
7. `AGENTS.md`'s section for it; the reply to fyflow-app; P47's Record.

**Out** — named rather than left implicit

- **Arbitrary back-edges.** `FD-V10` stays exactly as it is.
- **A reference from outside a loop into its body** — refused, decision 1.
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

1. **What leaves a loop is its join value, and nothing else.**
   - **(a)** A reference from a node OUTSIDE a loop to a node of its body is REFUSED at validation (a new `FD-V`). A
     map's ADR 0044 reading — *a reader outside sees every instance's output* — would make a reader anywhere hold every
     round of a body node, a retention nobody declared; resolving to the last round instead fails exactly when the last
     round routed around the node.
   - Inside the body a reference resolves within the reader's OWN round, as within a map instance. An earlier round is
     reached only through the carried value. A node upstream of the loop is reached by `needs` as anywhere, and resolves
     the same in every round.
   - **(d)** A loop may declare **`collect`**: one body node, or a key path into it (ADR 0137's grammar). The join value
     then carries `collected: [{ iteration, value }, …]`, one entry per round in which that node ran, a round where it
     did not having NO entry (not `null`, which a result may be). Collecting is opt-in and written in the document.
   - **Why not reduce through the carried value**: a carried state of FIXED size (best so far, a count, a handle) costs
     rounds x c and is free; a carried HISTORY costs round *i* a copy of *i* summaries, every one kept by `RN` section 7,
     so about N²·r/2 over N rounds — 500 rounds of 1 KiB is ~125 MB where `collect` is ~500 KiB. *(Estimated from the
     formula, not measured; W230 measures it.)*
2. **A round that is LOST loses the loop.** `branch.lost` in round *i* — a node settled with no eligible edge, or an
   inner region `unsatisfiable` (`JP-R10`) — makes the loop's join `unsatisfiable`, as for every region. A failure the
   author wants to survive is routed inside the body (`optional` and `on: ["failed"]`) into the state, where the next
   round and `until` see it. A non-optional task out of retries PARKS (`branch.suspended`), and a person resolving it
   `failed` is a loss. `retryPolicy` stays a task's; a round never re-runs a task by itself. Cancel and stop are halts
   (ADR 0104, ADR 0105), not losses, and open no next round. `onLost: "exit"` is out.
3. **A loop releases nothing.** Its footprint is `RN-R13`'s: rounds x tasks per round x bytes each returned — the same
   law as a `map` of that many tasks, so the lever is a result that is a REFERENCE rather than the data, in a loop as in
   a map. No live-state release: the log is the floor (`RN` section 7), and a second retention rule for loops alone would
   buy only the per-task view (ADR 0121). **Compaction is raised as a deferred question**: decision 1(a) makes it SOUND,
   because once round *i + 1* has opened, everything the run can still need of rounds 0…*i* is the carried value and
   `collected` — so a fold input such as `loop.compacted { carried, collected, through }` would let the fold say it was
   handed less, which is `RN` section 7's condition for any eviction. Not built: it moves what a Host must keep to show
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
   ARRIVED, checked by the driver on each arrival, so it replays as a decision edge does; the loop is do-while — a round
   always runs before `until` is read, and a check-first loop is an `if` in front of it. **The join value**:

   ```ts
   { last, iterations, exhausted, broke?: { at, value }, collected?: [{ iteration, value }] }
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
| W228 | the definition: the `loop` kind and its keys; the refusals of decisions 1, 4 and 6; `"$iteration"`; `definitionSchema`; the wiring check's arcs; ADR 0145 | `spec/flow-definition.md`, `spec/task-id.md`, `src/definition/**`, its L1/L3/L4 tests, `spec/examples/` loop fixtures | — | `gate:item` |
| W229 | the driver: a round opened, carried, decided and broken; lost; the join value; `collect`; `maxIterationsFrom`'s refusal; L2 and L5 | `spec/join-policy.md`, `src/driver/**`, `src/fold/**` as needed, its L2/L5 tests | W228 | `gate:item` |
| W230 | resume and retention measured; L6 in node 24 and deno; `AGENTS.md`; the reply to fyflow-app; P47's Record | `spec/run-state.md`, `examples/**`, `AGENTS.md`, the reply file | W229 | `gate:full` |

W231 is reserved spare. Each item's file is written at the declaration; this table is an index, not the declaration.
The `Owns` column is a draft to be checked against the tree at declaration — in particular whether the fold changes at
all (decision 3 and exit artifact (3) expect not).

## Before declaration

1. In a byte copy of the tree at `HEAD`: measure facts 3 and 9 for a loop rather than a map — a one-branch region's
   findings, and whether replay regenerates every round's `branch.opened` from the settlements — by hand-built fixture
   or spike, recorded as this plan's measured facts.
2. Check decision 1(a)'s refusal against every reference form a reader can write (`needs`, an edge's `needs`, a
   comparison's `valueFrom` (ADR 0140), a key path) and list them in W228's declaration.
3. Raise the two questions at Q809 onward and move [Q582](../questions/q582.md) from `deferred` to `open` with this plan
   as owner, under `doc/questions/README.md`'s procedure.
4. Write W228-W230's files from `doc/work-items/TEMPLATE.md`.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q582](../questions/q582.md) | a loop — the question this plan answers; resolved by W230 if the exit artifact stands | P47 |
| Q809 (to raise) | compaction of a loop's finished rounds: a fold input that lets the fold say it was handed less; sound by decision 1(a) | no owner — deferred |
| Q810 (to raise) | may `needs` state a constant, so a loop's seed needs no transforming node before it? | W228 |
| [Q16](../questions/q16.md) | flow-level retry — scoped out; a loop does not answer it | no owner |

## Record

*Filled in at the join, after the work items are merged.*

**Exit artifact.**

**What the plan answered.**

**Retro.**
