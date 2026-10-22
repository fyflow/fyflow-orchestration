# P42 — What was a node handed, asked after the fact?

**Status:** complete and retro'd 2026-10-22 — W205-W206 done, `gate:full` EXIT 0 on W206's final tree (the Record); the retro raises ONE stop-and-ask (section 8 (a)). Earlier: declared 2026-10-22 — on `40560bd` (the tree clean, `main` at 0.9.1 with P41's unpublished 0.10.0 work on it), answering fyflow-app's *pass 3* #1 and #2; facts 1-10 read at this declaration; stop-and-asks (a)-(e) ANSWERED by the maintainer 2026-10-22, all as recommended; W206 waits on W205.
**Question this plan answers:** *what was a node handed — a task's envelope, or the value any other node kind received, on
a named branch path — asked after the fact of a run that is finished, live, or whose runtime is gone, answered by the
driver's OWN composition rather than a second one, exactly, or with the reason it cannot be?*
**Exit artifact:** *on the final tree: (1) a new L2 suite, green in `npm run gate:full` and in all three L0-L5 runtimes,
holding the export's answer for EVERY dispatched task of EVERY valid corpus flow EQUAL to the envelope the driver handed
`createTask` for it (captured on the double), on the run as it ran and on a resume of it from EVERY stored prefix, every
ask's answer equal to its `asked` element's `input`, every other node kind's answer equal to a value derived BY HAND from
the spec on a flow built so each wrong selection differs, and each refusal reason reached and named; with a CLOCK-FREE
count of the stored elements the replay consumes, PINNED exact at 2,000 and 8,000 items for the first and the last
instance of a map, provoked red by removing the cut (checked in, bounded to the chromium lane's 60 s); (2) the export
TIMED once on the final tree in node 24 and in deno at 2,000 / 8,000 / 16,000 items — the last instance of a map — beside
ADR 0124 consequence 1's 68 / 223 / 442 ms for the whole run (a reading, not a gate entry — [Q179](../questions/q179.md));
(3) one block in `examples/l6.ts`, green in node 24 and in deno, on a threaded and an inline pool, in which every task's
answer — through `handle.inputOf` while the run is live and through the export from the stored header and events once
its runtime is gone — equals the envelope its worker ECHOED, an end's answer equals what reached it by hand, a join's
two answers and a gate's are each held, a halted run is answered up to its halt, and a changed registry is refused
`diverged`, each claim with its control; and `npm run gate:full` EXIT 0 — the LAST item runs it (workflow v0.29).*
**Reserves:** W205-W207 (W207 expected unused), Q760-Q769, ADR 0128-0129 (ADR 0129 expected unused); no S id

```
Question: what was a node handed, asked after the fact?
Items:    W205 (the replay cut at a target's composition: the export, handle.inputOf, ADR 0128, the spec, L2 with the
          corpus-and-resumes oracle, the count), W206 (the exit artifact on real workers, the reply to fyflow-app,
          P42's Record and retro)
Reserves: W205-W207 (W207 expected unused), Q760-Q769, ADR 0128-0129 (ADR 0129 expected unused)
Raises:   no question at this declaration; no S entry. W205 raises ONE, (b1)'s post-transform input, from its block
Baseline: ids derived by `npm run state` at this declaration — P42, W205, Q760, ADR 0128 from the tree and W205, Q760,
          ADR 0128 from the ledger, which AGREE. The ladder counts are NOT taken here and are W205's declaration step's
Measured: NOTHING re-run at this declaration. Facts 1-10 are READ, at `40560bd`, with file:line; fact 4's figures are
          ADR 0124 consequence 1's (the whole run, node), cited, not re-taken. W205's declaration step re-takes them on
          this tree before any `src/` edit (P15 decision 5)
```

## Why this plan, and why now

0.9.0 gave the app's Host a run's live state (`handle.state()`, ADR 0122) and 0.9.1 and P40/P41 made a map's reference
reads cost their answer and one shared copy. **The app is building the view that reads a run Task by Task, and the first
question a person asks of a wrong result is *what was this Task handed?*** — which no surface answers: the state keeps an
ASK's input (`NodeRun.input`, `RN-R37`) and no task's, by [P35](p35-may-a-node-wait-for-a-person-by-design.md) decision 1
and [ADR 0046](../decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md),
both of which the app agrees with. Its second question, *what did the run produce*, lives only at the ends, and the fold
records WHERE a path ended and neither on which branch nor with what. **The app proposed a pure function over `RunState`**
and asked that it be *the driver's composition, not a second one*. Those two requirements cannot both hold (fact 3): the
state lacks what composing needs, and the one thing that composes exactly is the driver. **The maintainer answered
(a)-(e) on 2026-10-22, all as recommended, after the replay rationale was explained and accepted**: the answer is a DEAF
REPLAY of the driver, cut at the target's composition.

## What fyflow-app asked, held against this declaration

Read at `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass3.md` (read, not edited).

| the app's clause | where it is answered |
|---|---|
| **#1** — *a pure export taking a Run's state, its flow, a registry and a Task id, returning what the driver handed the Worker or why not*; their sketch `inputOf(state, flow, taskId, registry?)` | (a1): **accepted in a different shape** — `inputOf(flow, registry, { header, events }, target)` and `handle.inputOf(target)`; NOT over `RunState`, because no function over it is exact (fact 3) |
| *it is the driver's composition, not a second one … a test holding it equal to what the driver hands the Worker, across your corpus and resumes, as W199's oracle does* | (a1): it IS the driver's — `enter`, `compose`, `dispatch`, run by the replay `resume()` already uses (fact 4); the oracle is exactly theirs (exit (1)) |
| *pure and on demand … it costs what the composition costs once, which ADR 0124 made proportional to the answer* | **corrected in the reply**: a composition costs its answer only on the driver that holds the run's outputs as they were AT DISPATCH. Rebuilding that costs the run's prefix up to the target — O(run) at worst, counted (decision 6) |
| *it works on a state from `handle.state()` and on one from `fold` over stored inputs* | answered from the STORED EVENTS and the HEADER (`RN-R15`), which the Host already keeps (`handle.header`, `src/scheduler/runtime.ts:372`); not from a state (fact 3). A live run through `handle.inputOf` |
| *retries and resolutions share one input; an ask's is `NodeRun.input`* | decision 3: a task's answer is its ONE dispatch's envelope (`buildTaskId(…, 0)`, `src/driver/driver.ts:5055`), retries and a resolution included; an ask's answer equals its `asked` element's `input` |
| *since 0.9.0 the state holds each result once, frozen and shared; so composing later from the same state gives the value the Worker got* | **two corrections in the reply** (fact 7): frozen and shared is `handle.state()` (ADR 0122), not `fold`; and the premise is inexact — the final state can hold MORE than was visible at dispatch (fact 3) |
| **#2 (a)** — *`pathEnded` and `pathEnds` carry the `branchPath`* | (d1): **declined** — not additive (fact 6), and it gives only the branch |
| **#2 (b)** — *#1's export also answers for an end node: what reached node `n` on branch `b`, any node kind* | (c1), (d1): **accepted** — one function, any node kind, a node id plus a branch path or a task id; and decision 4: a node id ALONE lists every path it was reached on, because nothing a consumer holds names an end's branch paths (fact 8) |
| *whether ADR 0124's index makes a composition outside the driver cheap, or whether `inputOf` needs a state the driver alone holds — then `handle.inputOf(taskId)` plus the pure form* | the second: the index is over what is visible NOW, and a composition reads what was visible THEN (fact 3); both forms are built (a1) |
| *the version it would ship in* | (e1): **0.10.0, together with P41**, unpublished; the bump, push and publish the maintainer's |

## Facts read at this declaration

**Fact 1 — the driver composes FORWARD, hop by hop, and keeps nothing it composed.** All in `src/driver/driver.ts` at
`40560bd`:

| site | what is handed on |
|---|---|
| `advance` (`:3863`), a settled task's successor | `cloneValue(outcome.result)` to `enter` (`:3955-3964`) — after `selectEdge` chose ONE edge, a predicate per edge (`:3912-3920`) |
| `enter` (`:3971`), every node kind | `compose` at its head (`:4002`): no `needs` → the edge value; `"."` → a clone of it; `"$payload"` → `sharedPayload()` (`:4917`), the run's one frozen copy of `header.entryPayload` (ADR 0126); `"$item"` → a clone of `itemOf` (`:4947`, `items.held`); a node reference → `resolveReference` (`:4835`) → `visibleOutputs` (`:4721`, ADR 0124's index) → `sharedOf` (`:4903`, ADR 0126). `compose` is defined at `:4759-4814` |
| fanout (`:4076`) | `cloneValue(received)` per branch |
| map (`:4188`) | `cloneValue(items[i])` per instance, `items` read from `received` under `over` |
| join, an arrival (`:4291`) | `arrivals[fromBranch] = payload`, unless the join already fired (`firedHas`); then `settleJoin` |
| join, its firing (`:5791-5860`) | `collectArrivals` (`:851`, keys in branch-path order) entered into its successor at the OPENER's path, the collection RELEASED (`:5792`; ADR 0046 rule 3) |
| gate (`:4366`) | the route chosen by the type (`decideGate`, `:4469`), entered with `received`; one `gated` element carries `branchPath` and `route` |
| end (`:4299-4321`) | `received` is COMPUTED AND DISCARDED; only `{ kind: 'pathEnded', reason: 'end', at }` is appended (`:4319`); a path with no eligible edge appends the same with `no-eligible-edge` at the TASK (`:3934`) |
| ask (`:5169`) | `{ kind: 'asked', taskId, input: cloneValue(received) }` (`:5182`) — the ONE kind whose input is kept (`RN-R37`) |
| task, `dispatch` (`:5035`) | the envelope `{ settings, input, transform? }` (`:5118`; `FD-C5`, `FD-C6`) in the `createTask` config; the transform runs IN THE WORKER ([ADR 0051](../decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md), `src/scheduler/envelope-worker.ts`) |

`FD-R4`'s entry walk composes too (`:2423`), with the caller's value and no header; it is a refusal at `start()`, not the
run's composition, and a reading must never cut there.

**Fact 2 — what "handed" means differs by kind, and a JOIN has two meanings.** A task is handed an ENVELOPE; an ask, a
gate, a fanout, a map and an end are handed the value `enter` composed (`received`; a gate, fanout, join and end declare
no `needs` — `spec/flow-definition.md:508` names `task`, `map` and `ask` — so theirs is the edge value). **A join is handed
one value PER ARRIVING BRANCH** (`:4291`, keyed by the arriving branch's path) **and hands ON one collection** (`:5791`,
entered at the opener's path, `pathOf(region.fanoutId, …)`, `:5858`) — and the two differ whenever a policy fires early:
a late arrival is entered and not collected. The collection is not the successor's answer either: a successor declaring
`needs` without `"."` composes it away.

**Fact 3 — `RunState` lacks what composing needs, so no function over it is the driver's composition.**

1. **The entry payload.** The header (`RN-R15`) is not a fold input; `"$payload"` and the entry node's `"."` read it.
2. **Which edge each node took.** `RunState` records a gate's route (`gated`) and no task's edge: `selectEdge` ran a
   predicate per edge (`:3912-3920`) and appended nothing. Re-deriving it re-runs the predicates against outcomes AND
   against `ctx.needs` resolved as visible THEN.
3. **The moment of dispatch.** A reference resolves against the outputs visible AT dispatch (`visibleOutputs`, `:4721`);
   a final state can hold more — an `all` (`["n"]`) or conditional (`"n?"`) read whose later siblings settled after it,
   and a join that fired early with arrivals after.
4. **A gate's memory** (`RN-R26`) — the driver's, rebuilt only by re-evaluating every gate in order.

**The driver's own comment says so**, at `:3889-3899`: a derivation of what a node received *"re-implements `compose`,
`JP-R11` and `JP-R12` at a second site, which ADR 0040 rule 2 refuses by name"* — and the entry node's payload *"appears
in no record"*.

**Fact 4 — the replay already exists, and it is exact.** `resumeStep` (`:2521`) and `replayStored` (`:2638`): given the
definition, the registry's driver options, the header and the stored events, it re-enters the entry from a clone of the
header's payload (`:2640`) and re-runs `enter` / `compose` / `dispatch` exactly, FEEDING the stimuli (`isFed`, `:586`:
`outcome`, `resolution`, `resumed`, `interrupted`, `paused`, `unpaused`, `attempted`) and REGENERATING every other
element, compared with the stored one by `sameData` (`:547-583`) — the first difference is refused `diverged` at its
position (`RN-R20`). It hands nothing to a scheduler: every dispatch's config is HELD (`replay.held`, `:5127`; `Replay`,
`:757-764`), so **the envelope a cut wants is already built and already captured**. It rebuilds released arrivals,
held items (`RN-R13`) and gate memory. **Its cost is O(run)**: ADR 0124 consequence 1 — 68 / 223 / 442 ms for the WHOLE
run at 2,000 / 8,000 / 16,000 items in node; a replay can stop at its target. **Two things a reading must NOT inherit
from `resume()`**: `resumeRefusal` (`:462`) refuses a stored `halted` (or 0.7.0 `stopped`) and a stored `cancelled` /
`cancelRequested` BEFORE replaying — refusals of CONTINUING a run, not of reading one; and the replay's `held` map keeps
EVERY dispatch's config (each one's composed payload) until the resume decides what is in flight.

**Fact 5 — no register question exists** about recomposing a node's input: `npm run q -- --search input`, `received` and
`branchPath`, each with `--include-icebox`. Nearest: [Q19](../questions/q19.md) (resolved — per-run retention bounded,
whose answer is why inputs are not kept), [Q41](../questions/q41.md), [Q154](../questions/q154.md),
[Q251](../questions/q251.md) (resolved — the transform), [Q280](../questions/q280.md) (deferred — the envelope off a flow).

**Fact 6 — `branchPath` on `pathEnded` is NOT additive.** `pathEnded` is REGENERATED by a replay, not fed (`isFed`,
`:586`), so a resumed driver writing a field an older checkpoint's element lacks is compared by `sameData` (`:547`) and
refused `diverged` — unless `CHECKPOINT_FORMAT` (`:355`, `1`; `RN-R16`: *it moves only when what a checkpoint CARRIES
moves*) bumps, which refuses every older checkpoint as `format` instead. And it gives the branch, not the value.

**Fact 7 — the app's two premises, read.** *Frozen and shared* is `handle.state()`'s (`RN-R44`, ADR 0122: a copy frozen
at every depth, its results the runtime's own) — **`fold` freezes nothing** (`src/fold/run-state.ts:506`; no `freeze`
in the file). *Composing later from the same state gives the value the Worker got* is inexact by fact 3.

**Fact 8 — nothing a consumer holds names the branch paths an END was reached on.** `pathEnded` is `{ reason, at }`
(`run-state.ts:356`, `pathEnds` at `:191`); a region's `settled` maps a branch path to `'exited'`
(`BranchSettlement`, `:92`, `:141`) without the end; an end outside every region is reached at `-`. **So asking (end,
path) per candidate path costs one replay per candidate** — 2,000 replays for a 2,000-item map whose branch ends — where
one replay to the end of the stored events sees every arrival. A task's path is in its id; a gate's in its `gated`
element; a join's arrivals in `settled`'s `'arrived'`.

**Fact 9 — the recorded rules the work bears on.**

| rule | what it says, read here | how this plan's shape keeps or moves it |
|---|---|---|
| [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) rules 1, 4; [ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) | routing executes in the driver; the driver produces the fold's ordered input | **Kept**: the answer is produced by the driver's code, on a driver that appends to no consumer and hands nothing on; nothing is appended, folded or checkpointed |
| [ADR 0040](../decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) rule 2 | no second definition of what a node reaches | **Kept**: (a1)'s reason, (a2)'s refusal |
| ADR 0046; [P35](p35-may-a-node-wait-for-a-person-by-design.md) decision 1; [Q19](../questions/q19.md) | a run retains what tasks RETURNED, not what they were handed | **Kept**: nothing new is retained; (a3) refused |
| [ADR 0065](../decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md), `RN-R19`, `RN-R20`, `RN-R23` | a resume replays, refuses what it cannot regenerate, refuses a halted or cancelled run | **Reused, NOT amended**: the replay and `diverged` are shared; a reading does not take resume's halted/cancelled refusals (decision 5) — ADR 0128 states the reading's own set |
| [ADR 0124](../decisions/0124-a-reference-read-costs-its-answer.md), [ADR 0126](../decisions/0126-a-references-value-is-one-frozen-copy-shared-by-every-reader.md) | a reference read costs its answer; a referenced value is one frozen shared copy | **Unmoved**: the replay's driver builds its own index and copies; the answer's referenced values are that driver's frozen copies, reaching no live run |
| [ADR 0051](../decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md) | a transform runs in the type's worker wrapper | **Unmoved**: (b1) — the answer is the envelope BEFORE it; the post-transform input is W205's register question |
| [ADR 0122](../decisions/0122-a-runtimes-live-state-is-a-frozen-copy-on-its-handle.md), `RN-R44`, `RN-R25` | the handle's reads | **Extended**: `RunHandle` gains `inputOf` — BREAKING for code that BUILDS a handle, as `state()` was in 0.9.0 |
| `RN-R16`, `CHECKPOINT_FORMAT` 1 | moves only when what a checkpoint carries moves | **Unmoved** — (d1) is why |
| ADR 0002 rule 4, [Q9](../questions/q9.md) | a predicate is asked to be pure | **Leaned on**: a reading re-runs predicates and gate types, as a resume does; an impure one diverges or answers what its re-run computes |

**Fact 10 — the census at this declaration.** Spec versions: `run-state.md` v0.33 (its last rule `RN-R44`, so the next
is `RN-R45`), `flow-definition.md` v0.47, `join-policy.md` v0.24, `outcome-record.md` v0.21, `runtime-targets.md` v0.13,
`task-id.md` v0.16. Package `0.9.1` / `0.9.1` (0.10.0 the maintainer's bump, not taken), scheduler pin 0.6.0,
`CHECKPOINT_FORMAT` 1, L6 2831 / 234, 77 decisions (`npm run state`). `RunHandle` at `src/scheduler/runtime.ts:317`, its
`header` `:372`, `state()` `:392`; `runtime.resume` `:450`; `Checkpoint` and `CheckpointHeader` at `driver.ts:373`,
`:400`. **`AGENTS.md` already names a snippet-local `const inputOf` at `:546` and `:637`** (a reader of a captured
`createTask` payload) — a name a root export of the same name meets in `check:docs`'s typecheck. `pack-smoke`'s `P5`
compares the installed exports with the entry's both ways, so a new export moves no literal there.

## Scope

**In** — a reading of what a node was handed, for every node kind, on a run's stored header and events (a root export)
and on a live run (`RunHandle.inputOf`), produced by the driver's replay cut at the target's composition (W205); its
answer and refusal shapes; a count of what the replay consumes; ADR 0128; `spec/run-state.md` (a new rule, `RN-R45`, and
`RN-R25`'s handle), `spec/README.md`, `AGENTS.md` (W205); the L2 suite and its oracle (W205); an L6 block, examples and
the reply (W206); the post-transform input as a register question (W205).

**Out** — anything over `RunState` alone ((a2)); recording inputs ((a3)); the post-transform input BUILT ((b1)); a
`branchPath` on `pathEnded` / `pathEnds` ((d1)); any `FoldInput` kind, `RunState` cell, checkpoint field or
`CHECKPOINT_FORMAT`; resume's own refusals and behaviour; `FD-R4`; a cache of answers; the version bump, the push and the
publish ((e1), the maintainer's).

## Decisions taken at this declaration

*Each follows from a fact or an answer named beside it; they leave nothing open.*

1. **The answer IS the driver's composition** ((a1); facts 3, 4). A reading builds a driver for the stored run with the
   definition and the registry's driver options exactly as `runtime.resume` builds one (`RN-R25`) — so the two cannot
   build different drivers — DEAF (no consumer callback, nothing handed to any scheduler), and runs the replay of fact 4
   until the target's composition, then stops. **No line of `compose`, `resolveReference`, `dispatch`, `selectEdge` or a
   region arm is written twice**; the cut is a hook the replay consults, and the run's own code path is unmoved
   (prediction 1).
2. **The target** ((c1)): a node id plus a branch path, for ANY node kind the definition has; or a task id (a task's or an
   ask's), which names both. A node id that is not in the definition, or a task id this run's ids cannot be (`ID-R4`'s
   parse), is `unknown`.
3. **The answer, per kind** ((b1), (c1); facts 1, 2):

   | kind | the answer |
   |---|---|
   | task | the ENVELOPE `dispatch` built, `{ settings, input, transform? }` — synchronous and exact; retries and a resolution share it (one dispatch per task id) |
   | ask | the value `enter` composed — equal to its `asked` element's `input` (an oracle, exit (1)) |
   | gate, fanout, map, end | the value `enter` composed for that node on that path — for a gate what its type was asked of and routed; for an end what reached it |
   | join, at an ARRIVING branch's path | that branch's carried value, entered at the join — **a late arrival after an early firing included** |
   | join, at its OPENER's path | the collection it HANDED ON when it fired (`collectArrivals`); `not-reached` if it never fired |

   **The join's two meanings are both taken, told apart by the path** — an arriving path is always a child of the
   opener's, so no target names both. *Recommended over one meaning*: the arrivals are what the join was HANDED, and the
   collection is the one value a policy selects at firing time that no final state and no successor's answer can
   reproduce (fact 2). The value is handed as the replay's driver built it — its referenced values that driver's frozen
   copies (ADR 0126), reaching no live run; whether it is handed frozen at every depth is W205's, stated in ADR 0128.
4. **A node id ALONE answers every path the node was reached on**, in the order the replay reached them (fact 8; (d1)).
   This is (c1)'s target with the path left open, inside the shape the maintainer delegated (*final name and signature
   are the plan's or W's*): without it, #2 asked of an end inside a 2,000-item map costs 2,000 replays, because no
   surface names the paths. It costs ONE replay to the end of the stored events.
5. **The refusals** ((a1)), each a returned reason, never a throw: **`unknown`** (decision 2); **`not-reached`** — the
   target was not entered (or, for a task, not dispatched) within the stored events; **`diverged`** — the replay produced
   something other than a stored element BEFORE reaching the target, at that position (`RN-R20`); and the HEADER refusals
   `resumeRefusal` already makes before anything is replayed — `format` and `flow` — reused from that one function, so a
   reading and a resume cannot read a header differently. **A halted, cancelled or stopped run IS read** (fact 4): those
   are refusals of CONTINUING a run; a target entered before the halt or the cancel is answered, and a stored element only
   an owner's call or a refused result can append — `halted`, `cancelRequested` — ENDS the prefix the reading can verify,
   so what follows it is `not-reached`, never `diverged`. **A definition or registry changed after the target is not
   detected**: the cut verifies the prefix it replays, and says so (ADR 0128).
6. **The cost, counted** (fact 4; P40/P41's precedent). The replay consumes the stored events up to the target's
   composition and NO further — counted, clock-free, by a private counter read by a cast (ADR 0121 rule 7's constraints),
   pinned EXACT at 2,000 and 8,000 items for the FIRST and the LAST instance of a map, each derived from the counted code:
   the first instance's count CONSTANT across the sizes, the last's linear in them. A node-id-alone target (decision 4)
   consumes them all. **It names what it does NOT count**: the composition itself (ADR 0124's), the predicates' and
   gates' re-runs, the header's clone. The provocation removes the cut (the replay runs to the end), asserting it ran
   and reddening exactly the first instance's pin. Timed once (exit (2)) — a reading, never a gate entry (Q179). What the
   replay RETAINS while it runs — fact 4's `held` map, every dispatch's envelope — is measured by W205 before and after,
   and whether the cut keeps only the target's is W205's to state.
7. **The live form** ((a1)): `RunHandle.inputOf(target)` reads the run's OWN header and events so far through the same
   function, synchronously, so a live answer and a stored one cannot differ. It is O(the run's prefix), never cached,
   and touches the live driver only to READ its events — a reading neither appends to the live run nor lets the replay
   reach one of its objects (a write path W205 closes and tests). On a released run (`done` settled) it answers from what
   the run delivered.
8. **One ADR**: ADR 0128 (W205) — *what a node was handed is read by replaying the run to the target's composition* —
   the new surface, the exposed replay, the per-kind answers, the refusal set and decision 5's limits. ADR 0129 reserved,
   expected unused.
9. **Each changed public surface is stated where it changes** (P33 decision 7 … P41 decision 8): a NEW root export and its
   answer types; `RunHandle` gains `inputOf` — **BREAKING for code that builds a handle** (ADR 0122's precedent); no
   existing signature, value, element or behaviour moves. Shipped in 0.10.0 with P41 ((e1)).

### Stop-and-asks — (a)-(e) ANSWERED by the maintainer, 2026-10-22

**All five are the maintainer's, each answered as recommended** (*"As recommended"*, after the replay rationale was
explained and accepted, then *"Ok, go"*). Nothing waits on the maintainer: W205 may start.

| | the question | answered / recommended | the alternatives, and what each changes |
|---|---|---|---|
| **(a)** | **What computes the answer** | **ANSWERED (a1)**: a replay-based export, `inputOf(flow, registry, { header, events }, target)` (its final name and signature the plan's or W205's within this shape), plus `handle.inputOf(target)` for a live run. **It IS the driver's composition**, a deaf replay cut at the target's composition, not a second implementation. Oracle: equal to what the driver handed — the captured `createTask` payload — across the corpus and its resumes. Returns the answer or the reason it cannot: unknown target, not reached/dispatched, diverged. A new ADR for the surface and for exposing the replay | **(a2)** a pure function over `RunState` — a second routing derivation (ADR 0040 rule 2, ADR 0001), and inexact on timing (fact 3): what was visible at dispatch, which edge was taken, the entry payload, a gate's memory. **(a3)** decline, or record every input — against P35 decision 1, ADR 0046 and Q19's bound, and the app's own preference |
| **(b)** | **What the answer is for a task** | **ANSWERED (b1)**: the envelope the driver dispatched, `{ settings, input, transform? }` — synchronous and exact. The POST-transform input (async; runs the transform's language, which runs in the worker — ADR 0051) is RAISED as a register question, not built | **(b2)** the post-transform input: asynchronous, a language runtime in the reader, and a value no driver ever held. **(b3)** the composed `input` alone: drops `settings` and `transform`, which are what a person needs to see why a worker did what it did |
| **(c)** | **What a target is** | **ANSWERED (c1)**: a node id plus a branch path, for ANY node kind (task, ask, gate, join, end, and every other kind the definition has); a task id accepted too. One function answers #1 and #2 (b). What *handed* means per kind is the plan's, the join's two meanings settled here or by W205 with a recommendation — **settled by decision 3: both, told apart by the path** | **(c2)** task ids only — #2 unanswered, and a gate's and a join's input, which the app's Run page shows next, left to their reconstruction |
| **(d)** | **#2, what reached each end** | **ANSWERED (d1)**: answered by (c1) — an end's answer is what reached it. Option (a), `branchPath` on `pathEnded`, NOT taken: it bumps the checkpoint format (fact 6) and gives only the branch | **(d2)** `branchPath` on `pathEnded` / `pathEnds` — `CHECKPOINT_FORMAT` 2, every older checkpoint refused, and still no value |
| **(e)** | **How the items run, and which release** | **ANSWERED (e1)**: one after another as subagents, each committed, nothing pushed. P42 ships TOGETHER with P41 in the unpublished 0.10.0. The bump, push and publish are the maintainer's, ONLY when the maintainer says so, and are not part of any item | P42 in its own 0.11.0 — a second release for one surface |

## Work items

**P39 retro's proposal B, as P40 adopted it and P40's and P41's retros carried it UNCHANGED** — B′, C, D′ (with P38's
sixth clause) and E, E per CALL SITE:

- **B′ — the census re-take, with the self-test floors**: *an item that adds a node, a field, a suite, a module, a
  snippet or a flow builds its change in a byte copy and runs every lane BEFORE writing its `Owns` — and, where the change
  adds or removes an executed snippet or moves the size of an always-read document, the self-test that reads that floor
  (`check:docs:selftest`, `check:budget:selftest`) as well.*
- **C — one confirming gate per item**: *an item runs `npm run gate` (the ladder) before its readers, and its confirming
  gate — `gate:item`, or the last item's `gate:full` — runs ONCE, after the reader items, on the final tree.*
- **D′ — the census sites AND the readers in the plan's row**: every file that READS the surface the item changes, found
  by a grep for each changed name over `src/`, `scripts/`, `examples/` and `index.ts`; a grep for each PREMISE the change
  falsifies; a grep for a SIBLING of each member the change adds. **Every row touching `AGENTS.md` owns the WHOLE of it**,
  and a parenthetical in an `Owns` cell is a forecast of where in the file, not a limit.
- **E — a compound probe kills nothing**: *a provocation's edit changes ONE clause; where one replacement moves two, the
  probe is COMPOUND, and a Record counts it as killing neither clause until each is re-cut alone and killed* — **per CALL
  SITE**: the cut in `enter` and the cut in a join's firing are two probes, and each node kind's answer one clause.

**The brief sentences, every item's**: ***each item's Record states its readers' overlap***; ***a claim of ABSENCE is
shown able to fail by a control on the same observer, taken AFTER the event it denies — and each CLAIM carries its own
verdict, never another claim's***; ***a COST check names what its counter does NOT count; its item derives the count's
EXACT value on the sizes it runs, and TIMES its subject once at those sizes — a reading in the Record, not a gate entry
(Q179)***; ***an oracle reached through the package names which `src/` functions it shares with its subject*** — here
the oracle (the captured `createTask` payload) and the subject share `compose` and `dispatch` BY DESIGN, so the oracle
proves the cut and the replay, never the composition, and every per-kind claim also holds a value derived BY HAND from
the spec; and ***a new suite's wall is a share of the chromium lane's 60 s*** — a corpus oracle asking every target of
every flow from every prefix is O(n³) in a flow's size, so its flows are the corpus's and its prefixes bounded, the
large sizes left to the count. From P41's retro section 4 (a), carried as an observation: ***where a plan enumerates what
a change protects, enumerate what it BREAKS*** — here, what a reading re-runs (predicates, gate types) and what it holds.

**D′ applied — the sites each row moves.**

- **The readers of the replay**: `resumeStep` (`:2521`), `replayStored` (`:2638`), `feedOne`, `Replay` (`:757`),
  `resumeRefusal` (`:462`), `isFed` (`:586`), `sameData` (`:547`), `dispatch`'s held branch (`:5126-5128`); the cut's
  sites, `enter` (`:4002`) and the join's firing (`:5791`); `runtime.resume` (`src/scheduler/runtime.ts:450`) and
  `RunHandle` (`:317`), whose handle builder gains the member. **Unmoved, re-read**: `compose`, `resolveReference`,
  `selectEdge`, every region arm.
- **The siblings**: `handle.state()`, `outcome()`, `node()` (`RN-R44`) — every test or snippet enumerating `RunHandle`'s
  members (`test/scheduler/live-state.test.ts`, `examples/l6.ts`'s handles, `AGENTS.md` sections 8, 12 and 18) — and
  every consumer double that BUILDS a handle; `driver.checkpoint()` (`:5909`), the live form's source.
- **The PREMISES**: *the input is not kept / cannot be recovered* — `driver.ts:3889-3899`'s *"The references are
  derivable; the payload is not"*, true of `RunState` and stated now beside the reading that recovers it from the header;
  `AGENTS.md` on `NodeRun.input` (`:150`, `:1487`) and section 11's rows; the app's *composing later from the same state*
  (answered in the reply).
- **The name**: `AGENTS.md`'s snippet-local `inputOf` (`:546`, `:637`) — renamed or left local, measured by `check:docs`.
- **`spec/run-state.md`** v0.34 — `RN-R45` (the reading: target, per-kind answer, refusals, cost, limits), `RN-R25` (the
  handle's member), section 5's table if a claim moves; `spec/README.md`'s rows; `spec/flow-definition.md` only for a
  dated pointer at `FD-C1` (*what a node received is readable after the fact, `RN-R45`*) if W205 finds a reader there.
- **`LATE_SUITES`** (`test/definition/l4-corpus.test.ts`) and the counted suites' counts, for each new suite and case.
- **`X10`** (`examples/README.md`) — W206's block; `CONSTRUCTION_PRICED` (`examples/l6.ts`) if a construction is added.
- **The always-read set**: no row edits `CLAUDE.md`, `doc/workflow.md` or `doc/concept.md`, except W206's plan-close
  bookkeeping in `doc/workflow.md` (P40's W200 and P41's W203 precedent, declared before the edit).

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W205 | **What a node was handed, read by replaying the run to the target's composition** — the export and `handle.inputOf`; ADR 0128; decisions 1-9; (a1)-(e1); facts 1-10 | `src/driver/driver.ts`, `src/scheduler/runtime.ts`, `src/scheduler/index.ts` and `index.ts` (if an export needs a line), `test/driver/**`, `test/scheduler/**`, `test/fold/**` (if the count sits beside the cost suites), `test/definition/l4-corpus.test.ts` (counted), `spec/run-state.md`, `spec/README.md`, `spec/flow-definition.md` (`FD-C1`'s dated pointer only), `AGENTS.md`, `doc/decisions/0128-*`; **declared exception**: `examples/l6.ts` (only where a handle-member census there moves with `RunHandle`) | nothing — (a)-(e) answered | `gate:item`; L2: every dispatched task of every valid corpus flow answered EQUAL to its captured `createTask` envelope, on the run and on a resume from every stored prefix (bounded); every ask equal to its `asked` `input`; gate, fanout, map, end and both join answers each equal to a hand-derived value on a flow where every wrong selection differs — an early-firing join with a late arrival, a gate with memory, an `all` and a `"n?"` read whose later siblings settle after dispatch, `"$payload"` at the entry, a node reached on several paths (decision 4's list, in order); a task id and its (node, path) giving one answer; each refusal reached — `unknown`, `not-reached`, `diverged` on a changed registry and on a changed definition BEFORE the target, `format`, `flow` — with a halted (every halt class, `OR-R6`'s included), a cancelled and a stopped run READ up to the halt and `not-reached` after it, never `diverged`; nothing handed to a scheduler and no consumer callback called (a control that a resume does); `handle.inputOf` equal to the export over `checkpoint()` at every quiescent point, and no write through an answer reaching the live run; the count EXACT at 2,000 / 8,000 for the first and last instance, the cut's removal red at its pin; the replay's retention measured; the subjects timed once |
| W206 | **The exit artifact on real workers, the reply, P42's close** — exit (2) and (3); `gate:full` | `examples/l6.ts`, `examples/README.md`, `examples/flows/**`, `examples/workers/**`, a cost subject under `examples/` (`examples/map-cost.ts` or a sibling), `test/definition/l4-corpus.test.ts` (if a census moves); `doc/workflow.md` (the plan-close bookkeeping only, declared); outside this repository, `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass3.reply.md` | W205 | **`gate:full`** (the plan's last item); L6 in node 24 and deno, threaded and inline; `X10` moved by its block alone |
| W207 | *reserved, expected unused* | | | |

**The two rows share `examples/l6.ts` and `l4-corpus.test.ts`, so they are SERIAL, never concurrent**
(`doc/workflow.md` section 7 rule 2) — which (e1) answers anyway. **No item edits `scripts/check-register*.mjs`,
`scripts/state.mjs` or `doc/questions/README.md`**, so `gate:item` is W205's and `gate:full` W206's. **Questions
reserved per item**, so no two take one: W205 Q760-Q764, W206 Q765-Q769. **W205 raises ONE question at its record step**,
from its block: *the input a task's worker sees AFTER its transform* — (b1)'s post-transform input, asynchronous, the
transform's language run in the reader; what would make it worth building, and what it costs — `deferred`, with its
closing condition stated (v0.30 rule 6 does not apply: it is a design, not a defect one decision settles).

**The reply to fyflow-app goes where P41's did** — `../fyflow-app/.scratch/mu-upstream-adoption/requests/`, as
`fyflow-orchestration.pass3.reply.md`. **W206 writes it**, from this plan and the two Records, once its own gate is green:
#1 accepted in the replay shape ((a1)) — the export's final signature, `handle.inputOf`, the answer per kind ((b1),
decision 3), the refusals (decision 5); why not over `RunState` (fact 3) and the two corrections to their premises (fact
7); ADR 0124's index answered — it costs a read its answer on the driver that holds the run as it was, and a reading
pays the run's prefix to rebuild that (decision 6, the count and the timing); what the Host must keep — the header beside
the events, which it already stores; #2 (b) accepted and (a) declined ((d1), fact 6), with decision 4's node-id-alone
form for an end's paths; the post-transform input's question by id; the cuts it touches (ADR 0046 kept, ADR 0044's
visibility and ADR 0124's index reused, `FD-C1`'s shared copy unmoved); 0.10.0, **its release state MEASURED at the time of
writing** (npm, JSR, tags, `origin/main`), and the bump, push and publish the maintainer's ((e1)).

**Each item writes its own file from its row when it starts** (`doc/work-items/TEMPLATE.md`), as W202 and W203 did — no
item file is written at this declaration, so `npm run state`'s two derivations agree. **Its `**Status:**` line's FIRST
WORD is one of the template's five** (`todo`, `in progress`, `in review`, `done`, `reserved`), which is what
`scripts/state.mjs` reads (its `STATUSES`). What the row cannot carry is below: each item's OUTPUTS, and what its
declaration step RE-TAKES before any `src/` edit (P15 decision 5). Every item's last re-take is the ladder counts, the
baseline this plan did not take.

**W205 — outputs**: ADR 0128; the cut — a hook the replay consults in `enter` after `compose` and in a join's firing —
and the reading built on it; the root export (its name and signature settled within (a1), stated in ADR 0128) and its
answer and refusal types; `RunHandle.inputOf`; decision 3's per-kind answers, decision 4's node-id-alone list, decision
5's refusals and limits; the private counter of consumed stored elements; the L2 suite (a new
`test/driver/input-of.test.ts` or sibling) of decisions 1-7 and the row's claims, each expected value from the spec; the
runtime's `handle.inputOf` cases beside `test/scheduler/live-state.test.ts`'s; `spec/run-state.md` v0.34 (`RN-R45`,
`RN-R25`), `spec/README.md`; `AGENTS.md` — the reading in section 8 (and 18, where a stored run is read back), the handle's
member, section 11's rows checked; the post-transform question. **Re-takes**: fact 4's figures on this tree (the whole
run at 2,000 / 8,000 / 16,000 items, node and deno, each size a fresh process) before any edit; whether anything is
entered after a stored `cancelRequested` or a regenerated halt (decision 5's prefix end); the replay's `held` retention at
2,000 / 8,000 items; every surface enumerating `RunHandle`'s members and every double building one (D′); fact 8's
claim that no surface names an end's paths; that a join's arriving paths and its opener's never coincide, at every depth
of the corpus; `AGENTS.md`'s `inputOf` name collision; `resumeRefusal`'s header refusals' reuse without its
halted/cancelled scan.

**W206 — outputs**: the L6 block (exit (3)) — a flow with a map of at least twelve items (ADR 0044 rule 3's two-digit
segment), a fanout and its join under an early-firing policy with a late arrival, a gate, an ask and two ends, threaded
and inline: each worker ECHOES its envelope, and every task's answer equals the echo — through `handle.inputOf` while the
run is live (mid-run, a target dispatched and one not yet `not-reached`) and through the export from the stored header
and events once the runtime is gone; each end's answer, the gate's, and the join's two equal to values derived by hand;
a halted run read up to its halt; a changed registry refused `diverged`; each claim its own verdict with its control;
the timing subject (exit (2)) at 2,000 / 8,000 / 16,000 items, node and deno; `X10` moved by the block alone; the reply;
P42's Record and retro. **It places no logic**: a counter or `src/` site it cannot read is an Exception named before the
edit. **Re-takes**: W205's counts and walls in node, deno and chromium on W205's tree; fact 4 on the final tree; the
release state, measured.

## Predictions, written before the items that test them

1. **W205 moves no existing behaviour in any lane**: every composed payload, every fold input sequence, every checkpoint,
   every `resume()` byte-identical on every corpus flow; `CHECKPOINT_FORMAT`, `FoldInput`, `RunState` and every existing
   signature unmoved. An item that finds one must move is a stop-and-ask.
2. **The cut is two sites** — `enter`, after `compose`, for every kind and a join's arrivals; and the join's firing, for
   its collection — and no line of the composition is written twice.
3. **The first instance of a map is answered from a CONSTANT count of stored elements at 2,000 and 8,000 items**, and the
   last from a count linear in the items; the export on the last instance at 16,000 items lands within 2x of ADR 0124's
   442 ms for the whole run, in node.
4. **No corpus flow's answer differs from its captured envelope**, on the run or on any resume — a difference is a
   defect in the replay or in resume, and a stop-and-ask, never a test edit.
5. **`AGENTS.md`'s snippet-local `inputOf` meets the root export in `check:docs`** and is renamed in place.
6. **W206 moves `X10` by its block alone, and no existing L6 row** beyond a `RunHandle` member census, if one exists.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q19](../questions/q19.md) | per-run retained state bounded — why inputs are not kept, which (a3) keeps; `resolved` | — |
| [Q9](../questions/q9.md) | nothing enforces a predicate's purity — a reading re-runs predicates and gate types, as a resume does; `deferred` | — |
| [Q179](../questions/q179.md) | wall time is not a reproducible cost measure — why the count is the gate and the timing a reading; `icebox` | — |
| [Q280](../questions/q280.md) | the envelope off a flow — (b1)'s answer IS the envelope; unmoved; `deferred` | — |
| *(Q760-Q764)* | the post-transform input, (b1) | W205 raises it |

## Record

*Written 2026-10-22 over W206's final tree, the tree held still before it. Every figure is read from the two items' own
files; none is re-measured here. Ids are bare text, as in P33's-P41's Records.*

**The items.** Each row is its own file's Record, which covers its declaration step, its provocations and its readers.

| item | built | spec | closed / raised | exceptions and rulings | the readers | L1-L5 / L6 after | confirming gate |
|---|---|---|---|---|---|---|---|
| **W205** `1288209` | the cut (`Reading`, `offer`, `take`, three sites and the confirmation in `append`), `Driver.read` / `readStep`, `DEAF_SCHEDULER`, `headerRefusal` split out of `resumeRefusal`; the root `inputOf` and its types; `RunHandle.inputOf`; the private count `replay.reading.fed` / `.elements`; `test/driver/input-of.test.ts` (the corpus-and-every-prefix oracle), `test/fold/input-of-cost.test.ts` (EXACT at 2,000 / 8,000), `test/scheduler/input-of.test.ts`; `AGENTS.md` section 8; ADR 0128 | run-state v0.34 (`RN-R45`, `RN-R25`); `FD-C1`'s dated pointer | — / **Q760** | ONE asked exception, `RUN_FLOOR` 51 → 52 in `scripts/check-docs.mjs`, answered YES; the row's `examples/l6.ts` exception UNUSED | conformity 2 SHOULD, 2 NIT; adequacy 88 mutations, 1 BLOCKER, 4 SHOULD, 3 NIT — every one acted on or declared. **Overlap 1** | 94 / 2197; 2831 / 234 | `gate:item` EXIT 0 on its second run (the first EXIT 1 at `check:docs:selftest`, the exception's cause) |
| **W206** `bb17100` | the `W206 exit` L6 block — a flow whose every task's worker ECHOES its envelope, on a threaded and an inline pool, node and deno: every task answered equal to its echo live (a parked ask, one task in flight) and from what a store kept once the runtime is gone; an end inside a map by its node id alone, a gate, a join's arrivals (a late one included) and collection, an ask, each by hand; a halted run read up to its halt, at the halt's index; a changed registry refused `diverged` — sixteen claims, four runs; `examples/map-cost.ts`' two READING subjects; the README's copies; the reply | none | — / — | one, declared before the edit: `doc/workflow.md`'s plan-close bookkeeping | conformity 2 SHOULD, 4 NIT, no BLOCKER; adequacy 71 mutants, 3 SHOULD, 3 NIT, no BLOCKER — every one acted on or declared; 10 probes. **Overlap 1** | 94 / 2197; **2847 / 238** | **`gate:full`** EXIT 0, 11/11 self-tests, 2,398 s |

**One question raised (Q760), none closed. One asked exception (W205's `RUN_FLOOR`), answered YES. The readers' overlap,
every Record stating its own: 1, 1.**

### The exit artifact, measured

| the exit sentence's clause | what was built and measured | verdict |
|---|---|---|
| (1) a new L2 suite: every dispatched task of every valid corpus flow answered EQUAL to its captured `createTask` envelope, on the run and on a resume from every prefix; every ask equal to its `asked` input; every other kind by hand; each refusal reached; a clock-free count PINNED exact at 2,000 and 8,000 for the first and last instance of a map, provoked red by removing the cut | W205: `test/driver/input-of.test.ts` (13 cases), `test/fold/input-of-cost.test.ts` (5) — the first instance fed **2** stimuli and compared **2n + 5** elements, the last **n + 1** and **5n + 2**, of the stored 5n + 5; the cut's removal red at the first instance's pin; `test/scheduler/input-of.test.ts` (4); node, deno and chromium | **met** |
| (2) the export TIMED once in node 24 and deno at 2,000 / 8,000 / 16,000 items, the last instance of a map, beside ADR 0124's 68 / 223 / 442 ms for the whole run | W205's harness: **35 / 138 / 263 ms** node, **52 / 166 / 352** deno. W206's `examples/map-cost.ts` (checked in, the stored events JSON-round-tripped, a JIT-warm process): last instance **47 / 168 / 302** node, **53 / 187 / 365** deno; first instance 15 / 51 / 91 and 17 / 57 / 95; the whole run live re-taken 66 / 205 / 381 and 79 / 273 / 513 | **met** — a reading, not a gate entry (Q179) |
| (3) one L6 block, node and deno, threaded and inline: every task's answer — live through `handle.inputOf` and from the stored header and events once the runtime is gone — equal to the envelope its worker ECHOED; an end's answer by hand; a join's two answers and a gate's held; a halted run answered up to its halt; a changed registry refused `diverged`; each claim with its control | the `W206 exit` block, sixteen claims over four runs, **2847 / 238, 0 failed** in both runtimes | **met** |
| `npm run gate:full` EXIT 0 — the LAST item runs it | W206, one command on the final tree after the readers' fixes: the ladder, then 11/11 self-test lanes ok, `check:register:selftest` included (2,097.2 s wall, 10 lanes), 2,398 s in all | **met** |

**The counts across the plan**, each from the items' gate tables: L1-L5 **91 / 2174 → 94 / 2197** in node, deno and
chromium; L6 **2831 / 234 → 2847 / 238** in node and deno; `check:docs` 51 → **52** `run` snippets; `check:spec` C4 45;
spec/run-state **v0.33 → v0.34**, flow-definition v0.47 (a dated pointer, no version); `CHECKPOINT_FORMAT` 1, `FoldInput`,
`RunState` and `snapshot()` unmoved; the package surface gains `inputOf` and six types, and `RunHandle` gains `inputOf`
(BREAKING for code that builds a handle); `doc/concept.md` untouched.

**What the plan answered.** *What was a node handed, asked after the fact?* — **the driver's own composition, replayed
from the stored header and events to that node** (ADR 0128): a task its envelope `{ settings, input, transform? }`
before any transform, an ask, gate, fanout, map and end what reached it on its path, a join an arrival on an arriving
path (a late one included) or its collection on the opener's path; a node id alone every path in replay order; refused
with a reason, never thrown, and a halted, cancelled or stopped run read up to its halt. **Not over `RunState`**, which
lacks the entry payload, the edge each node took, what was visible at dispatch and a gate's memory. **The price**: the
run's prefix up to the target per reading, O(run) at worst, nothing retained. **fyflow-app's pass 3**: #1 accepted in
the replay shape, #2 (b) accepted with the node-id-alone form, #2 (a) declined; the reply is written
(`../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass3.reply.md`).

**Predictions, scored against the items' Records.**

| | prediction | verdict | evidence |
|---|---|---|---|
| 1 | W205 moves no existing behaviour in any lane | **HOLDS** — 685 corpus runs' payloads and checkpoints byte-identical | W205 Record |
| 2 | the cut is two sites | **MOVED** — three sites plus the confirmation in `append`: a task's envelope is offered where `dispatch` builds it, and an offer is taken only when its node's own element is compared | W205 Record, ADR 0128 rule 2 |
| 3 | the first instance from a CONSTANT count, the last linear; the last at 16,000 within 2x of 442 ms | **HOLDS for `fed` and the timing** (263 / 302 ms), **NOT for `elements`** — a map opens every instance in one step and a step is replayed whole up to the cut | W205, W206 Records |
| 4 | no corpus flow's answer differs from its captured envelope | **HOLDS** | W205 Record |
| 5 | `AGENTS.md`'s snippet-local `inputOf` meets the root export in `check:docs` | **FALSE in its first half** — each snippet is its own module; renamed `handedInput` anyway | W205 Record |
| 6 | W206 moves `X10` by its block alone, and no existing L6 row | **HOLDS** — 2831 / 234 → 2847 / 238 | W206 Record |

**The D′ paragraph's census predictions**: right at every site it named; `RunHandle` is built in ONE place
(`openRun`), so the handle-member census it forecast in `examples/l6.ts` did not exist (W205's exception unused). **Short
at one sentence**, found by W206's conformity reader by construction: RN-R45, ADR 0128 rule 5 and `readStep`'s message
say a replay *cannot regenerate* a `halted` element — and a halt raised by a PREDICATE's throw IS regenerated, since a
reading re-runs predicates (ADR 0128 consequence 3). The prefix end still holds the reading correct (what follows is not
read); the sentence's reason is what is wrong — a stop-and-ask, section 8.

**Questions**: **raised [Q760](../questions/q760.md)** (W205, `deferred` — the input a worker sees after its transform);
**closed none.** `npm run q -- --where status=open` lists **none**.

**Handed on**, each with its owner:

| hand-off | from | owner | where it is recorded |
|---|---|---|---|
| **0.10.0** — P41 and P42 together: the version bump, the push, the publish to npm and JSR | (e1) | **the maintainer** — *only when the maintainer says so* | this Record |
| RN-R45 / ADR 0128 rule 5's *cannot regenerate* | W206's conformity reader | **the maintainer** — stop-and-ask (a), section 8 | below |
| the reply to fyflow-app | P42's *The reply* | **done** — W206 | W206's Record |
| a NESTED join's collection read at its opener's path — a cut site offering it at `-` survives L6 AND L2, every join in both suites opening at the root (W206's adequacy reader, A19) | W206's readers | **the next item touching the reading** — a test gap, not a defect; no question raised | W206's Record |
| the byte copies `C:/tmp-w205`, `C:/tmp-w206` and the session scratchpad's probes | both items | **the maintainer** — left in place, outside the repository | each item's Record |

## Retro

*Pass 3 ran on 2026-10-22 over W206's final tree, by W206's author as the plan's last item. Every figure is read from the
two items' Records; this retro re-ran no harness. **One routing here needs the maintainer** (section 8); nothing is acted
on outside the record step's four files and W206's one declared exception.*

### 1. The asks

| item | widenings (rule 6), each answered | design, each answered | reader defects | raised / closed |
|---|---|---|---|---|
| P42's declaration | — | (a)-(e), all as recommended | — | — |
| W205 | **1** — `RUN_FLOOR` 51 → 52, YES | — | 1 BLOCKER, 6 SHOULD, 5 NIT | **Q760 raised** |
| W206 | — (one exception declared before the edit) | — | 5 SHOULD (one shared), 7 NIT | — |
| **P42** | **1, answered YES** | **5 answers, all as recommended** | **every one acted on or declared** | **1 raised, 0 closed** |

### 2. The `Owns` and the census sites — B′, C, D′ and E

**B′ was FOLLOWED and fell short once**: W205 built its change in a byte copy and ran every lane, but did not run
`check:docs:selftest` before writing its `Owns` — the self-test half of B′ — and `gate:item` went red at that lane on a
literal outside the `Owns` (`RUN_FLOOR`), which rule 6 then asked. The rule names that self-test by name; it was skipped,
not insufficient. **C held** (one confirming gate per item, run once on the final tree; W205's first run red, re-run
after the asked edit). **D′ held** at every site but the one sentence above. **E held**: both items' provocations cut one
clause per call site.

### 3. The readers, and the overlap

| item | conformity | adequacy | overlap | ordinal |
|---|---|---|---|---|
| W205 | 2 SHOULD, 2 NIT | 88 mutations; 1 BLOCKER, 4 SHOULD, 3 NIT | **1** — the reading's run id | 123rd |
| W206 | 2 SHOULD, 4 NIT, no BLOCKER | 71 mutants (15 in deno too); 3 SHOULD, 3 NIT, no BLOCKER | **1** | 124th |

**Every Record states its overlap**, the seventh plan running. **Two measurements, both inside section 6's 0-4 band. The
ordinal is a hundred and twenty-four, so the next is the HUNDRED-AND-TWENTY-FIFTH** — carried into `doc/workflow.md` by
W206's declared exception.

### 4. Rules followed that failed, and the rung (pass 3 rules 3 and 5)

| candidate | followed? | caught by | verdict |
|---|---|---|---|
| **(a) a claim pinned through a form that cannot observe it** — W205's `diverged` case asked the node id alone, which replays to the end and diverges whether or not the cut confirms; W206's halt claim asserted `not-reached`, which a REGENERATED halt yields whether or not the prefix ends there | **FOLLOWED** — each claim had a control and each control could fail; the claim was right and its OBSERVER blind to the clause | W205's adequacy reader (BLOCKER); W206's conformity reader (SHOULD 1), each by construction | **TWO occurrences, in DIFFERENT items** — pass 3 rule 2's bar. It is section 5 rule 8 (a)'s *the SHAPES the clause quantifies over* applied to the OBSERVER: the target's form, the refusal's index. Recorded as an observation for the next plan's brief, not proposed as a rule: rule 8 (a) already covers it, and both were caught by the pass that exists for it |
| **(b) a spec sentence's REASON false while its rule holds** — *a replay cannot regenerate `halted`* | the spec was written from fact 4 and W205's re-take 2, which measured a halt and saw nothing AFTER it — not whether the halt itself is regenerated | W206's conformity reader | One occurrence. Section 8 (a) |
| **(c) a stray tool-call tail committed into a plan** — P42's declaration (`27d73b6`) ended with two lines of markup (`</content>`, `</invoke>`) after its last table row | — | W206, writing this Record; no check reads a plan's tail | corrected here (pass 3 rule 6, this plan's own file). W206's item file had the same tail at birth and it was removed before any commit. One occurrence committed; recorded |

**Pass 3 rule 5 over P42's defects**, by what caught them: **a rung in `gate`** — `check:docs:selftest` (W205's
`RUN_FLOOR`), the only one; **the authors** — W205's sweep (three survivors), W206's first L6 runs; **the conformity
readers** — W205's four, W206's six; **the adequacy readers** — W205's eight, W206's six. **No rung would have caught**
a claim whose observer cannot see its clause: that is rule 8's provocation and section 6's reader.

**The flaky rows ([Q599](../questions/q599.md))**: **YES, in P42** — W206's `npm run gate` before its readers went red
at `test:l6:deno` on W94 (2h) at K=2, and the lane re-run alone red on `uncloneable / OR-R6, threaded`, both Q599's rows,
on a machine loaded by other sessions; the third run green. `gate:full` on the final tree: no Q599 row red. No row of W206's block went red.

### 5. The scheduler

**No S entry raised. No contract found broken.** An inline pool's worker is handed the wrapper's new `{ settings, input }`
over the driver's own objects, a threaded one a clone: the echo saw the same envelope on both, as `AGENTS.md` §6 says.

### 6. Proposals (pass 3 rule 4), ranked

**A. Recommended for the workflow: NO CHANGE to a rule.** B′'s one short fall was a named self-test skipped; C, D′ and E
held; every Record stated its overlap; the BLOCKER reached no Record unacted.

**B. Carried UNCHANGED for the next plan's author** — P39's proposal B as P40 adopted it and P40's, P41's and this retro
carried it (B′, C, D′, E and the brief sentences). Section 4 (a) is recorded beside it as an observation: *a claim's
OBSERVER is a shape too — its target form, its index.*

### 7. Refusals, and what this retro changed

- **A check over `doc/` — considered and NOT proposed; it is the 41st refusal, P2-P42.** P42's text defects were a
  spec sentence's reason (section 8), a stray tail in a plan (4 (c)), and an overstated README clause (W206's NIT 5) —
  each found by a reader or an author reading the text beside the code. **No other ledger row is re-raised.**

| file | why |
|---|---|
| this plan | the Status line; this Record and Retro; the stray tail at its end removed (section 4 (c)) |
| `doc/workflow.md` | W206's declared exception: the Status line's count (FORTY-TWO, P1-P42), section 6's ordinal (a hundred and twenty-four; the HUNDRED-AND-TWENTY-FIFTH next), the ledger's first row (41 times, P2-P42) |

`README.md`, `doc/questions/**` and `doc/decisions/**` carry nothing more: Q760 and ADR 0128 are W205's.

**Ids.**

- **Issued**: W205, W206; ADR 0128; Q760; no S entry.
- **Reserved and unissued, SKIPPED and never reissued** (section 3): W207 CLOSED unissued, as expected; Q761-Q764 SPENT
  (W205's), Q765-Q769 SPENT (W206's); ADR 0129 SKIPPED.

**The next plan starts at W208, Q770 and ADR 0130.** The next S id is S13; the next plan id is P43.

### 8. Stop-and-asks for the maintainer

| | the question | recommended | the alternatives |
|---|---|---|---|
| **(a)** | **RN-R45, ADR 0128 rule 5 and `readStep`'s `not-reached` message say a replay CANNOT REGENERATE a `halted` element** (*only a consumer's callback, a refused result or an owner's call appends those*). **A halt raised by a PREDICATE's throw IS regenerated** — a reading re-runs predicates (ADR 0128 consequence 3) — W206's conformity reader measured it: the prefix end deleted, a predicate-halted run still answers `not-reached`, at the events' length instead of the halt's position; a halt raised by a consumer's callback answers `diverged`. **The rule holds** (the prefix ends at the first `halted` either way, and W206's halt claim now pins the index); its stated REASON is wrong for one halt class. A spec and ADR edit is outside every P42 item's `Owns`, so workflow section 1 rule 6 ASKS | **(a1)** YES — one dated sentence in RN-R45 and in ADR 0128 rule 5 (and the message's clause in `src/driver/driver.ts`): the prefix ends at the first `halted` because what FOLLOWS it may not be regenerable (a callback's halt, a refused result, an owner's call), a predicate's halt being regenerated and compared like any element; its own `spec:`/`adr:` commit, no version bump (no rule moves) | **(a2)** NO — raise it as a register question; **(a3)** leave the sentence as written |
