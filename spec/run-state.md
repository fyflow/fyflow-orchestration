# spec/run-state — what a run holds, and what it is derived from

**Status:** v0.18 — written by [W2](../doc/work-items/w2-the-fold-and-both-join-policies.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md).
**v0.18 is [W173](../doc/work-items/w173-cancelling-a-run.md) under [P34](../doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md): a run its OWNER cancels — section 13 and TWO rules, `RN-R30` (what the fold reads) and `RN-R31` (what the call does).** [ADR 0104](../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md), P34 decision 4 and stop-and-asks (b), (c), (h) and (i): `driver.cancel({ actor, reason?, graceMs? })` holds the run, appends ONE fold input `{ kind: 'cancelRequested', actor, reason }` and asks the scheduler to cancel each task in flight, and the fold reads the run **`cancelling`** while any dispatched task is unsettled and **`cancelled`** once none is — so a runtime's `done` settles after the LAST `task.cancelled`, from the fold alone. **ONE `FoldInput` kind is added — `cancelRequested` —, ONE cell of run state — `cancelRequest` — and an EIGHTH outcome, `cancelling`, the first NON-terminal one since `awaiting_action`**: each is BREAKING for a consumer switching on it exhaustively. **Rules whose TEXT moves**: `RN-R12` (`cancelling` is not finished), `RN-R23` (a stored `cancelRequested` is refused `cancelled`, at its position), `RN-R28` (a `cancelled` settlement AFTER a request is the request's, and halts nothing of its own) and `RN-R29` (a requested cancel is a halt; its limit (i) is acted on, and a resume's re-dispatch hands a task on to cancel it); section 3's table and its count, and section 6's bullet that said there is no cancel. The precedence is P34 (h)'s: `halted` > `cancelled` > `cancelling` > `awaiting_action` > `running`, the rest as before — P34's `interrupted`, between `cancelling` and `awaiting_action`, is W174's.
**v0.17 is [W172](../doc/work-items/w172-the-dispatch-hold-and-q605.md) under [P34](../doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md): section 12 and ONE rule, `RN-R29` — the DISPATCH HOLD every halt shares.** [ADR 0103](../doc/decisions/0103-every-halt-shares-one-dispatch-hold.md), P34 decisions 5 and 8, [Q605](../doc/questions/q605.md): a halt raised ON THE STACK of the driver's own step — a consumer's callback that cancels a waiting task or reaches a refusal — dispatched, routed and emitted more at two doors, a fan-out's or a `map`'s remaining branches and a resolution's `branch.resumed` and routing. One hold, checked at the head of entering a node, at the head of a dispatch, twice on a resolution and before each of a resume's re-dispatches, now shuts both for every halt, and the rule states what it does not hold. **ONE existing rule's TEXT moves — `RN-R28`'s sentence naming the two open doors**, which v0.17 makes false. No `FoldInput` kind, no cell of run state and no outcome is added: the hold changes what the driver APPENDS after a re-entrant halt, never how a sequence folds.
**v0.16 is [W171](../doc/work-items/w171-the-drivers-halt-is-renamed-halted.md) under [P34](../doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md): the run a refusal terminates is HALTED, and the outcome, its fold input, its cell and its resume refusal are RENAMED `halted`.** [ADR 0102](../doc/decisions/0102-a-run-the-driver-halts-is-halted-and-a-stored-stopped-reads-as-one.md), P34 decision 2 and stop-and-ask (f): 0.7.0 called the driver's halt on a defect `stopped`, and *stop* now names only P34's resumable stop. So section 3's outcome `stopped` is `halted`, the fold input `{ kind: 'stopped', reason }` is `{ kind: 'halted', reason }`, section 2's `stoppedBy` is `haltedBy`, and `RN-R23`'s reason `stopped` is `halted` — **the old names leave every type, which is BREAKING and LOUD**: a consumer comparing `'stopped'` fails to compile rather than silently changing meaning. **And ONE DUAL READ, which is new behaviour**: the kind is PERSISTED (a checkpoint is the event sequence, `RN-R14`), so a stored element of kind `stopped` — a 0.7.0 checkpoint or log — is READ as the `halted` element it is: `RN-R8` folds it `halted`, and `RN-R23` refuses its checkpoint `halted` at its position. Nothing writes `stopped` again, and `CHECKPOINT_FORMAT` stays `1` (`RN-R16`), so a 0.7.0 checkpoint of a LIVE run still resumes. **Rules whose TEXT moves**: `RN-R8` (the name, and the dual read), `RN-R12`, `RN-R23` (the reason, and the dual read), `RN-R25` and `RN-R28` (the name). No rule id is added or retired, the outcome count stays SEVEN, and no cell of run state is added — one is renamed.
**v0.15 is [W158](../doc/work-items/w158-cancelled-is-a-library-state-and-a-run-outcome.md) under [P33](../doc/plans/p33-what-a-run-does-when-a-task-ends-cancelled.md): a SEVENTH run-level outcome, `cancelled`, a FIFTH
per-node state, `cancelled`, and ONE rule, `RN-R28`.** [ADR 0094](../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md) is the decision. A task the scheduler
ended `cancelled` HALTS its run: the driver dispatches nothing further and routes no later settlement, exactly as
after a refusal and with neither of its reports, and the fold reads the run `cancelled` from the settlement
itself, ranked below `stopped` and above every other outcome. **ONE existing rule's TEXT moves — `RN-R23` gains
a sixth reason, `cancelled`**, for a stored cancel. **No `FoldInput` kind is added and no cell of run state is
added**: the outcome and the node state are two new VALUES of existing cells, and both are BREAKING for a
consumer switching on them exhaustively, which `src/fold/run-state.ts` says where each is widened. Section 3's
table, section 4's state list and its count move with them. No other rule's text moves.
**v0.14 is [W151](../doc/work-items/w151-a-runtime-releases-a-run-when-its-done-settles.md), an item outside any
plan, and ONE rule's text moves: `RN-R25`'s REASON, not what it refuses.** [ADR 0091](../doc/decisions/0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md)
is the decision (the maintainer's, on [Q513](../doc/questions/q513.md)): when a run's `done` settles the runtime
RELEASES its driver and keeps only its run id. `RN-R25` said a finished run's driver *still hears every settlement
under its id — measured, its sequence grows after it completed*, and named that as why the id stays in use; the
decision makes the sentence false, so it is withdrawn and the reason that replaces it is stated — a run can end
with tasks in flight, and their settlements carry its id. **What `RN-R25` refuses does not move**: every id a
driver of the runtime was built for, a finished run's and a refused start's included, and the counter still skips
them. No `FoldInput` moves, no cell of run state moves, and no other rule's text moves.
**v0.13 is [W133](../doc/work-items/w133-two-spec-sentences-and-one-message.md) under
[P30](../doc/plans/p30-which-open-questions-close-by-a-fix-already-named.md), and it adds ONE
sentence to `RN-R6`: `regions[*].suspended` is CURRENT, not cumulative.** `RN-R6` named the field
as one of three that `regions` carries and said nothing about its lifetime
([Q62](../doc/questions/q62.md)). The fold has always treated it as current, and L6 has asserted it
that way since W6, with a comment saying the gap was reported rather than patched. **The spec catches
up to the code, and the code does not move** (P30 decision 2). The sentence names BOTH events that
take a path out of the field, `branch.resumed` and the terminal three. P30's own gloss named only
the terminal event, and a resolution's `branch.resumed` comes first. No `FoldInput` moves, no cell
of run state moves, and no other rule's text moves.
**v0.12 is [W98](../doc/work-items/w98-what-a-row-may-assert-about-a-dispatch-order.md), an item outside any plan: section 11
and ONE rule, `RN-R27` — what a run fixes about the ORDER of its own dispatches, which nothing said and a rung asserted
row by row from [W51](../doc/work-items/w51-the-sibling-region-flow-on-real-workers.md) until this item ([Q400](../doc/questions/q400.md), [Q401](../doc/questions/q401.md)). No `FoldInput` moves, no cell of run state
moves, and no existing rule's text moves: the sequence already carried every fact the rule reads.**
**v0.11 is [W93](../doc/work-items/w93-what-a-gate-does-in-a-run.md) under [P24](../doc/plans/p24-what-a-node-may-remember-across-a-runs-branches.md), and it ADDS section 10, what a GATE
records, and ONE rule, `RN-R26`.** [ADR 0067](../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md) is the decision. **ONE `FoldInput` kind
is added — `gated` — and ONE cell of run state, `gated`**, which is P24 stop-and-ask (b)'s answer: a gate's
decision IS recorded. **ONE existing rule's TEXT moves — `RN-R13` gains a FOURTH term, each gate's memory**
— which is P24 prediction 4, predicted before the item and CONFIRMED by it; no other rule's text moves,
`RN-R19`'s *everything else it REGENERATES* already covering the new kind. **No checkpoint field is added**
(P24 prediction 2): a gate's memory is rebuilt by the replay `RN-R19` already defines, so a checkpoint taken
before this version resumes unchanged — asserted on one produced by v0.10's own code.
**v0.10 is [W89](../doc/work-items/w89-what-resuming-is.md) under
[P23](../doc/plans/p23-what-a-run-needs-to-outlive-its-process.md), and it ADDS section 9, what a RESUME
does, and seven rules, `RN-R19` to `RN-R25`.** [ADR 0065](../doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md) is the decision. **ONE
`FoldInput` kind is added — `resumed` — and ONE cell of run state moves, `resumes`**, which is the one
kind P23 prediction 4 allowed and the fact stop-and-ask (a) asked to be recorded. **Two existing rules'
TEXT moves, each by a clause, and neither changes what the rule said of a run that was never resumed**:
`RN-R15`, because a resumed driver's header is the checkpoint's rather than a copy of a `start()`
argument; and `RN-R18`, because a resumed driver hands its consumer positions from the stored length
and not from 0. `spec/task-id.md`'s `ID-R3` moves with them (v0.11): `resume()` is the second door into
one run. Section 6's *durability* bullet and section 8's closing paragraph gain the pointer here.
**v0.9 is [W88](../doc/work-items/w88-what-a-checkpoint-is.md) under
[P23](../doc/plans/p23-what-a-run-needs-to-outlive-its-process.md), and it ADDS: section 8, what a
checkpoint carries, and five rules, `RN-R14` to `RN-R18`.** **No `FoldInput` kind is added and no
cell of run state moves**, because a checkpoint is the sequence this document already defines plus a
header of the five facts that sequence cannot regenerate, and the fold never learns either exists.
**ONE existing rule's text DOES move — `RN-R13` gains a clause**, because the driver now retains a
copy of the entry payload for the life of the run and `RN-R13` states what a run retains. That is
P23 prediction 4 **REVERSING on its first test**, by retention rather than by resume: the clause is
additive and the rule's two terms are untouched, and *a rule's text moved* is the reversal condition
the prediction wrote down.
[ADR 0064](../doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)
is the decision. Section 6's *durability* and *event family* bullets gain what this version does and
does not settle; resuming is W89's.
**v0.8 is [W85](../doc/work-items/w85-what-a-nested-region-carries-and-how-it-ends.md) under
[P22](../doc/plans/p22-what-a-regions-identity-is.md), and it moves ONE `Test:` cell and nothing
else.** No rule is added, retired or reworded, no cell of run state moves and no `FoldInput` moves.
`RN-R13`'s second term already reads *a join*, which is per INSTANCE since `RN-R6` v0.7 — what it did
not say is that the RELEASE is per instance too, so a walk over the collections could be narrowed
from instances back to openers for **zero**. That is
[ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)
consequence 7, and it is a fixture rather than a clause.
**v0.6 is [W53](../doc/work-items/w53-what-a-run-retains-that-nothing-reads.md) under
[P15](../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md), and it ANSWERS the one
bullet section 6 has carried since v0.1.** *Bounded retention* stated that a run's footprint is
*"proportional to its dispatched-node count"*, which is **measured false** — the count is the smaller
half and the whole of every result is the multiplier neither that sentence nor
[Q19](../doc/questions/q19.md)'s row named. **Section 7 is new, `RN-R13` is the rule, and
[ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
is the decision.** No `FoldInput` moved, no `RN-R*` rule was changed and no cell of run state moved:
what a run RETAINS and what a run REPORTS are different questions, and only the first is answered
here.
**v0.7 is [W84](../doc/work-items/w84-what-a-regions-identity-is.md) under
[P22](../doc/plans/p22-what-a-regions-identity-is.md), and it moves ONE cell of the shape.**
`regions` becomes **two-level** — `regions[openerId][openerPath]` — because
[ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)
makes a region INSTANCE the pair `(opener node id, the opener's own branchPath)`. Section 2's shape
says *one entry per fan-out region ENTERED*, and that sentence was true only while no opener could be
entered twice — a property [W33](../doc/work-items/w33-a-map-at-run-time-arity.md) held by REFUSING a
region inside a `map` region at `Driver` construction ([Q160](../doc/questions/q160.md)). **The
refusal is lifted and this shape is what replaces it**: instance 2 gets its own entry rather than
discarding instance 1's, which W33 measured producing a run reporting `stuck` with all seven of its
tasks `done`.

**`RN-R6` is the only rule IN THIS DOCUMENT that moves, and only in what it is keyed by. No `RN-R*`
is added or retired, no outcome moves, and no `FoldInput` is added** — *(`spec/join-policy.md`'s
`JP-R10` gains its second subscript at v0.17, as do section 4's two `regions[…]` references; this
sentence read *the only rule that moves* unqualified, in the place a reader goes to ask which rules
moved. W84's conformity reader.)* — `regionEntered` and `joinSettled` each
gain a `regionPath` beside the `regionId` they already carried, which is the same field
`RegionEvent` gains ([spec/join-policy.md](join-policy.md) v0.17) and not a new input.

**It is BREAKING for a reader**, and the break is named rather than softened: `RunState` reaches the
package root through `index.ts`, so `regions` is public surface, and a consumer reading
`state.regions[F].joined` now reads one level short. It is loud where a type constrains the result
and **silent where it does not** — `Record<string, RegionRun>` has an open index signature, so
`regions[F].joined` still TYPES as `RegionRun` and evaluates to `undefined`. That is measured rather
than assumed: eight of the thirty-four failures W84 paid were in four files no typechecker named.

**v0.3 is [W5](../doc/work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md)'s**, and it changes
two things this document said were open: **section 6's last bullet is done** — the input sequence
exists and the driver produces it
([ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)) — and
**section 3 gains a sixth outcome, `stuck`**
([ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)), because v0.2
called a permanently stuck run `completed`. Section 5 gains a **fourth row**: the claim that
`regions` already held the data to know better was itself a claim its own inputs could not supply.
**v0.5 is [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) under
[P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md), and it corrects ONE FALSE SENTENCE.**
Section 6's *"what this document does not fix"* said a satisfied join *"carries `null`"* and cited
[Q36](../doc/questions/q36.md) as open; [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
answers it. **Nothing else changed, and that is the result rather than a restraint**: `JP-R12` moves
no `FoldInput`, no `RN-R*` rule and no cell of run state, because a payload is invisible to the fold —
which is that item's own written prediction, confirmed. Taken as a **late** declared exception: the
item declared `spec/join-policy.md`, `spec/flow-definition.md`, `spec/README.md` and
`spec/outcome-record.md` in advance and not this one.

**Normative.**
**The document `spec/README.md` has marked *"not written — W2"* since W1**, and the reason it waited
is the whole of section 1: whether run state is a fold at all is
[Q14](../doc/questions/q14.md), and W2 is the item that tests it. A spec that answered it first
would have made W2's gate vacuous.

**v0.2 acts on W2's own spec-conformity pass**, which found v0.1 asserting three things the fold's
inputs could not supply — and the code silently resolving each in its own favour rather than
reporting the conflict, which is exactly what `spec/README.md` rule 2 forbids. What changed is
recorded in section 6 rather than quietly edited away.

---

## 1. Q14, answered: run state is a fold of **our** log, and of nothing else

`doc/concept.md` section 5 carried this as a leaning from the first day:

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

The open half was *whose* log — our own flow-level one, the scheduler's task events, or ours
wrapping theirs. **It is ours, and the distinction is not stylistic.**

| | why not |
|---|---|
| the scheduler's task events | They cannot see flow structure. *"Branch taken"*, *"join satisfied"*, *"branch suspended"* do not exist at that level, and `doc/concept.md` section 2 is the reason: **the library has no dependency graph**, so there is nothing in its events to carry them |
| ours wrapping theirs | An event's `detail` is a live object ([ADR 0007](../doc/decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)), so a log that retained them would be a bag of aliases. The normalization at the listener boundary is what makes the log a log, and once it exists there is nothing left to wrap |

**What makes this an answer rather than a restated leaning** is that the fold is now the only thing
that produces run state, and two rungs check it: `RN-R1`'s purity, and ladder L3 folding the same
log twice and deep-comparing. A fold that read `scheduler.tasks`, memoised across calls, or called
`Date.now()` would pass a green suite and fail both.

| id | | Test owed by |
|---|---|---|
| `RN-R1` | **The fold is pure.** `fold(log)` reads nothing but `log`. No clock, no scheduler, no IO, no module-level mutation, and no memoisation across calls. Test: fold the same array twice into two independent values and deep-compare; and fold a log whose records were built with different clock values, asserting the state does not carry them | W2 |
| `RN-R2` | **The fold is total over any prefix.** Folding the first `n` records of a log is defined for every `n`, and folding `n` then applying record `n+1` equals folding `n+1`. This is what makes a run observable *while it runs* rather than only at the end, and it is what [Q15](../doc/questions/q15.md) needs if durability is ever added | W2 |
| `RN-R3` | **The log is read in append order and never sorted** (`OR-R5`). Two settlements can share a millisecond, `schedulerTimestamp` is the scheduler's clock and `observedAt` is ours, and neither is a total order | W2 |

## 2. What a run holds

```jsonc
{
  "runId": "r7c1f",
  "flowId": "p1-routed-away",
  "outcome": "running",              // section 3
  "nodes": {                         // one entry per DISPATCHED task, keyed by task id
    "r7c1f:scoreB:1:0": {
      "nodeId": "scoreB",
      "branchPath": "1",
      "state": "suspended",          // section 4
      "result": { "score": 0.41 },
      "error": null
    }
  },
  "regions": {                       // v0.7 - TWO LEVELS: opener id, then the
    "split": {                       //   OPENER'S OWN branchPath. One entry per
      "-": {                         //   region INSTANCE entered.
        "opened": ["0", "1"],
        "settled": { "0": "arrived", "1": "exited" },
        "suspended": [],
        "joined": true               // v0.3 - did the DRIVER route out of the join
      }
    }
  },
  "pathEnds": [                      // how each path ended; what separates completed from failed
    { "reason": "end", "at": "abandoned" }
  ],
  "haltedBy": null,                  // set when a refusal HALTED the run (OR-R10) - `stoppedBy` until v0.16
  "cancelRequest": null,             // v0.18 - { actor, reason } once its OWNER cancelled the run (RN-R30)
  "resumes": [],                     // v0.10 - one entry per RESUME, the task ids it ran again (RN-R22)
  "gated": []                        // v0.11 - one entry per GATE decision, in order (RN-R26)
}
```

| id | | Test owed by |
|---|---|---|
| `RN-R4` | **A run holds only what its input sequence says.** Every field above is derived; none is supplied from outside. A node absent from `nodes` **was never dispatched** — which is only true because `dispatched` is an input (section 6); without it, absence would also mean "in flight", and the rule would be false | W2 |
| `RN-R5` | **`nodes` is keyed by task id, not by node id.** A node inside a fan-out has one entry per branch, and [spec/task-id.md](task-id.md)'s total parse is what recovers `(nodeId, branchPath, attempt)` from the key. Keying by node id would silently merge two branches of one fan-out | W2 |
| `RN-R6` | **`regions` records what happened, not what a policy concluded.** A policy's own state is opaque (`JP-R1`) and reachable only through `describe`; run state carries the **events**, so two policies folded over the same *region events* produce the same `opened`, `settled` and `suspended`. **v0.7: it is keyed by the region INSTANCE, `regions[openerId][openerPath]`**, and the rule quantifies over instances rather than over openers ([ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md), [W84](../doc/work-items/w84-what-a-regions-identity-is.md)) — a `map` enters one opener once per item, so an opener inside a map region names N regions and one entry would merge them. **The OUTER key is unchanged in meaning and in value**, so every flow that could be written before v0.7 has exactly one inner key and `regions[F]['-']` is the v0.6 entry; `RN-R10`'s walk is over the flattened instances, which is why it reads *a region* and not *an opener*. **v0.13: `suspended` is CURRENT, not cumulative.** It lists the branch paths of that instance that are parked on a person NOW. A path enters it on its `branch.suspended` and leaves it on its `branch.resumed` or its terminal event (`branch.arrived`, `branch.exited` or `branch.lost`), whichever comes first. A path that suspends again re-enters it. So a run that suspended and was resolved shows `suspended: []`, and the fact that it ever suspended is in the INPUT SEQUENCE (its `branch.suspended` and the `resolution` record), not in this field and not in `nodes`, where `RN-R9` makes a resolved node indistinguishable from one that settled that way. Test: at ladder L2, a branch listed while it is suspended and not listed once it is resolved, both `done` and `failed`, and again on the prefix that ends at its `branch.resumed`; and over hand-written sequences, because a run always emits `branch.resumed` first, each terminal event taking a suspended path out with no `branch.resumed` before it, and a path that suspends a second time listed again; per INSTANCE, a path leaving one instance of an opener by `branch.resumed`, `branch.arrived` or `branch.lost` while another instance keeps its own listed; and the suite's cases held to a literal list and count | W2, two-level **[W84](../doc/work-items/w84-what-a-regions-identity-is.md)**, lifetime **[W133](../doc/work-items/w133-two-spec-sentences-and-one-message.md)** |
| `RN-R11` | **`joined` is a routing fact, and it is the only field a policy's behaviour reaches that is *decidable without the definition*.** `true` the driver routed out of the join, `false` a policy reported it unsatisfiable and it never will, `null` neither. **v0.4: `null` is not always *"yet"*** — a `map` over an empty list is permanently `stuck` with `joined: null`, because no policy can report a region that opened nothing (`spec/join-policy.md` section 5) and so nothing ever moves this field. `null` means *the driver neither routed out nor was told it never will*, which is a state a run can END in. It records what the **driver did**, not what the policy said — which is the distinction `RN-R6` rests on, and it is a thin one: a field carrying a policy's `status` or `describe` would cross it. Test: drive the same flow twice, once under each policy, and assert `opened`, `settled` and `suspended` are identical while `joined` differs. **Note the test is two drivers, not one stream** — `joined` comes from a `joinSettled` input, which is not a region event, so a literally identical stream cannot differ | **W5** |

**`RN-R6` is what keeps [Q4](../doc/questions/q4.md) answerable.** If run state carried a
policy's conclusion, W4's matrix would be comparing two run states rather than two policies, and
every cell would be a tautology.

> **v0.3 qualified `RN-R6`, and the reason is worth reading before trusting the old sentence.** It
> used to end *"...and differ only in whether the join fired"*, with a note that the difference
> *"shows up in `nodes`"*. Both halves are true and together they were **read as** *"so `regions`
> already tells you"* — which is what [Q43](../doc/questions/q43.md) said, and it is false. On
> `p1-routed-away` every branch settles under both policies, so `settled` is
> `{ "0": "arrived", "1": "exited" }` either way.
>
> **`joined` is not the only field the two runs differ in, and v0.3's first wording said it was** —
> found by the same pass, and it is the third occurrence of one failure mode in this repository (the
> others are [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)'s
> dated correction and [Q43](../doc/questions/q43.md) itself): **an over-broad enumeration inside a
> claim that is otherwise right.** They also differ in `nodes` (`publish` present or absent), in
> `pathEnds` (two entries or one) and therefore in `outcome`. What is true, and what the rule now
> says, is that `joined` is the only one of those **decidable without the definition**: an absence in
> `nodes` and a count of `pathEnds` are both legible only against a flow the fold does not have and
> `RN-R4` says it must not acquire. `RN-R11` is the fact that was missing, and
> [ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) is why it costs a
> field rather than a precedence tweak.

## 3. The run-level outcome vocabulary

`spec/README.md` named this as the hard half of the document — *"the terminal outcomes, which are
more than `done` and `failed`"*. **Eight at v0.18** — the eighth, `cancelling`, is `RN-R30`'s: a run its owner
cancelled while its tasks stop, and it is NOT terminal ([ADR 0104](../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md)). **Seven at v0.15** — the seventh, `cancelled`, is `RN-R28`'s and
the scheduler's newest terminal state's ([ADR 0094](../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md)). **Six at v0.3.** The fifth is the one every design drops; the sixth
is the one v0.2 got wrong, and it got it wrong about the exact run
[P1](../doc/plans/p1-what-satisfies-a-join.md) exists to attribute.

**Highest-ranked match wins**, and the order below is the order.

| outcome | means | reached when |
|---|---|---|
| `halted` | a refusal terminated the run — `stopped` until v0.16 ([ADR 0102](../doc/decisions/0102-a-run-the-driver-halts-is-halted-and-a-stored-stopped-reads-as-one.md)) | `OR-R10` — the driver reported a failure and HALTED the run: it routes nothing for it again |
| **`cancelled`** | **a task of the run was cancelled, so the driver halted it — or its owner cancelled the run and every task has stopped** | any node is `cancelled` and no cancel was REQUESTED before it (`RN-R28`); or a cancel was requested and no dispatched node is `running` (`RN-R30`) — whatever else is parked or waiting at a join |
| **`cancelling`** | **its owner cancelled the run, and a task is still stopping** — v0.18, NOT terminal | a cancel was requested (`cancelRequested`) and some dispatched node is still `running` (`RN-R30`) — whatever else is parked or waiting at a join |
| **`awaiting_action`** | **a node suspended and nothing has resolved it** | any node is `suspended` (ADR 0004 rule 3) |
| `running` | live work exists | any dispatched node is `running` — that is, dispatched and not yet settled |
| **`stuck`** | **nothing is live and nothing ever will be** | nothing running, nothing suspended, and an entered region's `joined` is not `true` — so nothing downstream of that join will ever be dispatched |
| `failed` | a path ended with no eligible edge, and none is still live | a path ended with **no eligible edge**, outside or inside a region. *(This read *"`branch.lost`'s condition"*, and the two stopped being coextensive at [W22](../doc/work-items/w22-what-an-inner-join-does-to-the-outer-one.md): `JP-R10` emits `branch.lost` for a branch whose nested region was declared `unsatisfiable`, and [ADR 0030](../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md) rule 7 deliberately appends **no** `pathEnded` for it, because neither reason is true of a join that has an eligible edge and never fires. **The run-level answer is unchanged** — `stuck` outranks `failed` and the dead region's `joined: false` reaches it first — so this is a false sentence rather than a false outcome, corrected in place.)* |
| `completed` | every live path reached an `end` node | nothing live, nothing suspended, and at least one path ended **at an `end` node** |

| id | | Test owed by |
|---|---|---|
| `RN-R7` | **`awaiting_action` outranks `running`.** A run with one suspended node and three live ones is `awaiting_action`, because the thing a human must know is that a human is needed. This is the answer to [Q17](../doc/questions/q17.md)'s *"it is neither success nor failure, so it needs a run-level outcome of its own"*, and the shape [Q7](../doc/questions/q7.md) will most likely reuse for a timed-out join | W2 |
| `RN-R8` | **`halted` outranks everything.** A run a refusal terminated is `halted` whatever its nodes say, because the log after that point is incomplete by construction — the driver stopped routing it. The fold learns it from ONE element, `{ kind: 'halted', reason }`, and sets `haltedBy` to its `reason`. **v0.16, the DUAL READ** ([ADR 0102](../doc/decisions/0102-a-run-the-driver-halts-is-halted-and-a-stored-stopped-reads-as-one.md) rule 3): an element of kind `stopped` — 0.7.0's name for the same element, in a stored sequence — is folded exactly as `halted`, its `reason` into `haltedBy`; nothing writes it any more. Test: a settlement and a suspended node AFTER the halt changing nothing; at v0.16, a hand-written 0.7.0 sequence with a stored `stopped` folding `halted` — first in the sequence, and before a settlement and a `user_action` — and equal to the same sequence with `halted`; folded twice, deep-equal | W2, the dual read **[W171](../doc/work-items/w171-the-drivers-halt-is-renamed-halted.md)** |
| `RN-R10` | **`stuck` outranks `failed` and `completed`, and nothing else.** Below `awaiting_action` and `running` because both mean the run can still move — a suspended branch keeps its join legitimately waiting, which is the whole reason `branch.suspended` exists. **Above `failed`** because `failed` is a flow outcome an author asked for and `stuck` is a defect nobody asked for: reporting `failed` names a cause and hides that the run will not terminate. Test: the same real flow under both policies, one `completed` and one `stuck`, with identical `regions` apart from `joined` | **W5** |
| `RN-R12` | **At a quiescent point, a run is finished exactly when its outcome is neither `running` nor `awaiting_action` — nor, since v0.18, `cancelling`.** Those three are the only outcomes that say more input is coming — a dispatched node has not settled, or a person has not answered. *(v0.15: the converse is not claimed. `halted` (v0.16's name) and `cancelled` are terminal with dispatched nodes possibly unsettled — the driver has HALTED the run, so what is still in flight settles routed nowhere and moves no outcome.)* *(v0.18: `cancelling` is the third outcome that is NOT finished — its owner cancelled the run and a task is still stopping, so a settlement is still coming that moves the outcome to `cancelled` (`RN-R30`). A `cancelled` reached through a REQUEST is terminal with nothing in flight; one reached through `RN-R28` alone is not.)* **This is what makes ladder L6 clock-free**: a harness resolves on this predicate rather than on `scheduler.completed` (which fires on every drain), on `stats` (which reads `queued=0 running=0` for a genuinely stalled scheduler) or on a timer. `RN-R10` is load-bearing for it — before `stuck` existed this predicate reported a permanent hang as a **success**. **The qualification is not decoration; see below.** Test: an L6 run that reaches a terminal outcome, asserting the wait ended **because** the predicate fired and not because a backstop did | **W5** |
| `RN-R28` | **A run a task of which settled `cancelled` is `cancelled`, and the FIRST such settlement HALTS it** — v0.15, [ADR 0094](../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md). **v0.18: this rule is a cancel nobody REQUESTED through the run** — one made by the scheduler's `cancel(id)` directly — **and a `cancelled` settlement folded AFTER a `cancelRequested` element is not one**: it is the request's own, it halts nothing the request has not, and it moves the outcome only as `RN-R30` says, so a run its owner cancelled reads `cancelling` until its LAST task has stopped rather than `cancelled` at its first ([ADR 0104](../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md), amending ADR 0094 consequences 4 and 7). **The outcome**: `cancelled` outranks every outcome but `halted` — below `halted` because a refusal is a defect and must not hide behind an owner's choice (a run refused AND cancelled reads `halted`), above `awaiting_action` because a parked task must not make a cancelled run read as waiting for a person, and above `running` and `stuck` because the run is halted: a task still in flight settles into `nodes` and moves no outcome, and **a join the cancel left waiting is not `stuck`** — nothing will fire it, and that is the owner's cancel rather than a defect nobody asked for. It is terminal (`RN-R12`), so a runtime's `done` settles on the first cancel, with the run's other tasks possibly still running unheard. **The halt**: on the first `cancelled` settlement the driver shuts exactly the doors `OR-R10` shuts for a refusal — a later settlement is not routed, `resolve()` is refused, and a join firing on the stack of the cancel routes nowhere — **and, since v0.17, the same doors on the stack of a RE-ENTRANT halt**: a fan-out's or a `map`'s remaining branches and a resolution's `branch.resumed` and routing are held by `RN-R29`'s one dispatch hold, which every halt shares — v0.15 to v0.16 said these two doors could each let one more dispatch through when a consumer callback cancelled synchronously ([Q605](../doc/questions/q605.md)). Each later settlement of the run is still APPENDED by the driver, routed nowhere and emitting no region event — **on a bare `Driver`**; on a runtime, once `done` settles the run is RELEASED ([ADR 0091](../doc/decisions/0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md)) and later settlements reach no driver; a parked task stays parked and `resolve()` is refused, as after `halted`; every region's collection is released, `JP-R12`'s run-level moment. **It is not a refusal**: no `halted` element is appended, `onRunFailure` is not called and `hasFailed()` stays false — the fold reads the outcome from the settlement. A cancel routes no edge: `RoutableState` does not gain it, so `FD-V18` still refuses `on: ["cancelled"]`. **The rule is not monotone, stated**: a `cancelled` settlement for a task that had already settled `done` would turn a `completed` run `cancelled` — unreachable at the pin, where `cancel()` of a finished task resolves `false` and fires nothing. Test: at ladder L1, the node folded verbatim and `cancelled` beside each of its six neighbours in both orders, a parked node, and a waiting join with nothing live; at L2, a cancel mid-fan-out against its control — nothing dispatched, no region event, no report, the in-flight sibling appended and routed nowhere, a second cancel and a later `user_action` changing nothing, a parked task's `resolve()` refused, a cancel at a sequence's entry, a cancel on a join's stack, `on: ["cancelled"]` refused, and a cancel releasing every region's collection (the twin of a halt's, `test/driver/retention.test.ts`); at L3 the run driven twice and folded twice; at L5 the `cancelled` rows under every column | **[W158](../doc/work-items/w158-cancelled-is-a-library-state-and-a-run-outcome.md)** |
| `RN-R30` | **A run its OWNER cancelled is `cancelling` while any dispatched task is unsettled, and `cancelled` once none is** — v0.18, [ADR 0104](../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md), P34 stop-and-asks (c), (h) and (i). The fold learns the request from ONE element, `{ kind: 'cancelRequested', actor, reason }` — `reason` is `null` when the caller gave none — and sets `cancelRequest` to `{ actor, reason }`. From that element on the run is **`cancelling`** while some dispatched node is `running`, and **`cancelled`** once none is: whatever settles a task after the request — `cancelled`, or a `done` or `failed` it reached first — ends its wait. **A parked node is not waited on** — it settled already, and it STAYS `suspended` in `nodes`: nothing is written per parked task, the element is the fact (P34 (i)). **The precedence** is P34 (h)'s — `halted` > `cancelled` > `cancelling` > `awaiting_action` > `running` > `stuck` > `failed` > `completed` (W174's `interrupted` is to sit between `cancelling` and `awaiting_action`): `cancelling` outranks `awaiting_action` because a parked task must not make a run its owner ended read as waiting for a person; and a join the cancel left waiting is never `stuck` under either outcome — it will not fire by the owner's act, not by a defect nobody asked for (`RN-R28`'s reasoning). **A request folded after the run is already `cancelled`** — by `RN-R28`, or by an earlier request — **moves nothing and is not recorded**: the run ended before it, and the driver refuses that call (`RN-R31`). Beside `halted` the run reads `halted` (`RN-R8`), the request recorded. `cancelling` is not terminal (`RN-R12`); a `cancelled` reached this way is, with nothing in flight. Test: at ladder L1, over hand-written sequences — the element over two running tasks reading `cancelling`, still `cancelling` after the first `cancelled` settlement, and `cancelled` at the last; a `done` and a `failed` settlement each ending the last wait; a parked node beside a running one, not waited on and left `suspended`; a request with nothing running, `cancelled` at once; the request after an `RN-R28` cancel (`cancelled`, `cancelRequest` still `null`), a second request moving nothing, and the request beside `halted` before and after it (`halted`); over a waiting join, never `stuck`; `isTerminal` false at `cancelling` and true at `cancelled`; folded twice, deep-equal (L3); and at L5, the `cancelling` row under every column of the matrix | **[W173](../doc/work-items/w173-cancelling-a-run.md)** |

> ### The precedence is defined at a **quiescent point**, and `RN-R12` says so for a reason
>
> **v0.3, and it is what W5's spec-conformity pass found.** `RN-R2` makes the fold total over any
> prefix, so an outcome can be read at any element. Most prefixes are **mid-turn**, and mid-turn is
> not a resting state: the driver appends a settlement **before** the routing it causes (ADR 0014
> rule 6), so between a node settling and its successor being dispatched there is momentarily
> nothing running, and between the last branch arriving and the join firing there is momentarily a
> region with `joined: null`.
>
> Folding every prefix of a real `fanout-join` run, **7 of 14 report a terminal outcome for a run
> that is not over** — including the first settlement, which reads `completed`. `stuck` made it
> louder rather than causing it: those prefixes used to say `completed` and now say the outcome that
> specifically means *nothing will ever move again*.
>
> **A quiescent point is the end of the driver's synchronous turn** — every element the current
> event produced has been appended. A consumer folding incrementally reaches one with
> `queueMicrotask`, because the driver routes synchronously inside the scheduler's listener. A
> consumer folding `driver.foldInputs()` after the fact is always at one.
>
> **This also names the table's missing row.** A state with settled nodes and **no** path end
> matches neither `completed` (*at least one path ended at an `end` node*) nor `failed` (*a path
> ended with no eligible edge*), and `src/fold/run-state.ts` falls back to the node states. That
> fallback is **not a precedence row of its own and must not be read as one**: it exists to keep the fold
> total over prefixes (`RN-R2`), and every state that reaches it is either mid-turn or a fixture
> carrying no `pathEnded`. At a quiescent point of a real run the table is total, because every path
> that ended appended a `pathEnded` and a run with no ended path has something live.

**`completed` and `failed` are discriminated by how a PATH ended, never by whether a node
settled `failed`.** They are different propositions and they diverge on a case the corpus already
holds: in `spec/examples/valid/failure-edge.flow.json` an `optional` node fails and **routes on**
through its `on: ["failed"]` edge to an `end`. Every live path reached an `end`, so the run is
`completed` — and *"some node settled failed"* would call it `failed`. That is the case
[ADR 0004](../doc/decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
forced into existence, so getting it wrong would mislabel the shape W5 is built around.

**Q25 is answered here rather than in the definition.** `end.outcome` is an author-defined string
the driver never interprets (`spec/flow-definition.md` section 2); this vocabulary is **closed and
ours**. An author labels *why* a path ended; run state says *what the run is*. Letting the
definition supply run-level outcomes would let a flow invent a state no UI could render and no fold
could reason about.

## 4. Per-node state

`running` → `done` | `failed` | `suspended` | `cancelled`.

**Five, not the scheduler's six**, and the two differences are both deliberate. *(Four and five until v0.15,
when the scheduler gained `cancelled` and this list gained it VERBATIM — a cancelled node is copied from its
settlement as `done` and `failed` are, and is terminal: nothing resolves it, and `RN-R28` says what it does to
its run.)*

- **`user_action` is `suspended` here**, because at flow level it is not a terminal state — a
  resolution resumes it (ADR 0004 rule 4), and calling it terminal is what makes a design drop it.
- **There is no `pending`.** `OR-R4` says `task.running` writes no record, so the only signal this
  layer has is the dispatch itself and a node is `running` from that moment. v0.1 declared `pending`
  and nothing could ever produce it; **a state nothing can produce is not a state**, and leaving it
  in the document would have meant a reader writing a `case` for it forever.

| id | | Test owed by |
|---|---|---|
| `RN-R9` | **A resolved node takes the state its resolution gave it**, `done` or `failed`, and its `result`/`error` come from the **effective outcome** ([spec/outcome-record.md](outcome-record.md) section 7) rather than from either record alone. A node that suspended and was resolved is not distinguishable, in run state, from one that settled that way — which is `RS-R3`'s promise kept one layer up | W2 |

## 5. Three things v0.1 claimed that its own inputs could not supply, and two found since

Recorded rather than edited away, because the failure was not the claims — it was that the **code
resolved each one silently**, in a document the same item wrote, which is precisely what
`spec/README.md` rule 2 exists to prevent. The conformity pass found all three.

| v0.1 said | what was true | what v0.2 does |
|---|---|---|
| `nodes` holds one entry per **dispatched** task | the fold saw only *settlements*, so a task in flight was invisible, `running` was unreachable, and **`RN-R7` was unfalsifiable** — no state could hold both a suspended node and a live one | **adds `dispatched` as an input.** The claim becomes true rather than the rule becoming weaker |
| `completed` means *"at least one `end` was reached"*; `failed` means *"a path ended with no eligible edge"* | neither was derivable — nothing reported a path reaching an `end` outside a region. The code substituted *"some node settled failed"*, which **mislabels `failure-edge.flow.json`** | **adds `pathEnded` as an input**, so section 3's own words are what the fold computes |
| the shape carries `flowId` and `regions[*].joinId` | neither is derivable: no record carries a flow id, and `RegionEvent` carries `regionId` and — since v0.7 — `regionPath`, and no join id. The code shipped `joinId: ''` forever and dropped `flowId` | **removes both from the shape.** A caller that wants either reads the definition, which is where they live |
| **v0.3's fourth row, and it is not v0.1's** — [Q43](../doc/questions/q43.md) said *"`regions` already records `{0: arrived, 1: exited}`, so the information is present"* | **it is not.** Both policies settle every branch on `p1-routed-away`, so `regions` is byte-identical under each; `RN-R6` guarantees precisely that. The other candidate — infer it from `publish` being absent from `nodes` — needs the definition, which `RN-R4` forbids | **adds `joined` and the `joinSettled` input** ([ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)). The claim becomes true rather than the outcome staying wrong |
| **v0.4's fifth row, and it is a v0.1 claim that stayed true by ACCIDENT for nine plans** - section 2's shape says `regions` holds *"one entry per fan-out region ENTERED"* | **an entered region that opens NO branch has no entry.** Every producer of an entry was a region EVENT, so *entered* and *opened at least one branch* were the same thing - and they were the same thing because `FD-V9`'s arity floor makes a `fanout` open at least two. **A `map` separates them** ([ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)): a map over an empty list appends nothing at all, `RN-R10` iterates nothing, and the run reports **`completed`** having reached no `end` node - through section 3's final fall-back rather than by any positive determination. Measured by [W33](../doc/work-items/w33-a-map-at-run-time-arity.md) before the fix | **adds `regionEntered` as an input**, appended when the driver opens a region's policy. The claim becomes true rather than the shape being weakened to match the code |

**The pattern is worth naming.** Each of the first three was a spec written by the item that
implements it, asserting something reasonable, and each was resolved by narrowing the code until the
assertion was unobservable — which produces a green gate and an untestable rule. **The fourth is a
different author and a different document** — a register entry, written by a reader, asserting that
the data was already there — and it was caught the same way: by an item trying to act on it. What
the four share is that the claim was plausible and nobody had run it. `spec/join-policy.md` handled
the identical situation correctly for `JP-R5`'s ordering clause: it wrote down that the clause is
currently unfalsifiable, and why. This document did not, and that is the finding.

## 6. What this document does not fix

- **What a satisfied join carries downstream** — **[Q36](../doc/questions/q36.md) is ANSWERED and
  this bullet said otherwise.** It read *"It carries `null`, and the fold records that faithfully
  rather than inventing a value."* Since
  [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
  a satisfied join carries **an object keyed by `branchPath`**, one entry per branch that emitted
  `branch.arrived` — `JP-R11` and `JP-R12` in [join-policy.md](join-policy.md) section 4.
  **What this document does not fix is unchanged**: the fold still records what the driver dispatched
  and invents nothing, and **no `FoldInput` moved** — `dispatched` carries a `taskId` and nothing
  else, so a join that carries a value is invisible here. *(Corrected in place rather than deleted —
  `spec/README.md` rule 1. [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)
  took `join-policy.md` as a declared exception for exactly this sentence and **missed this copy of
  it**; its conformity reader found it. `doc/workflow.md` section 1 rule 5's *any copy, including
  your own*, one document across.)*
- ~~**Bounded retention**~~ — **[Q19](../doc/questions/q19.md), ANSWERED in v0.6. See section 7.**
  This bullet read *"A run's footprint is proportional to its dispatched-node count and the total is
  that times the run count, which is the measurement P1 was always going to need and does not have."*
  **The measurement exists since [P15](../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s
  declaration and the sentence is FALSE in the half that matters**: the dispatched-node count is one
  factor and *the whole of every result* is the other, which this sentence and Q19's row both omitted.
  A **4**-node chain returning 256 KiB retains **1025 KiB**; a **128**-node chain returning one key
  retains **33 KiB**. Kept rather than deleted (`spec/README.md` rule 1), because the shape of the
  error is the finding: a document can carry a correct-sounding proportionality for fourteen plans
  when nobody has multiplied it out.
- **Durability** — [Q15](../doc/questions/q15.md). `RN-R2` is what would make it additive; it does
  not make it done. **v0.9: section 8 is its first half** — what a checkpoint CARRIES, so a run can be
  written down while it runs. **v0.10: section 9 is the second** — what resuming one DOES, after the
  process that ran it is gone. What neither fixes — storage, exactly-once, a retry budget across a
  resume — is named at the end of section 9.
- **An event family for a UI** — [Q21](../doc/questions/q21.md). **v0.9 settles the STREAM half**:
  `onFoldInput` with its position (`RN-R18`) is one stream that serves a store and a live view alike.
  Redaction — a view of it without results — is declared out by P23 and is not here.
- ~~**Who composes the input sequence.**~~ **Done in v0.3** —
  [ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md). The
  driver holds one ordered `FoldInput` array and `Driver.foldInputs()` returns it; `snapshot()` is
  now *defined* as its record-kind subsequence, and `onFoldInput` is the push half. v0.2's text is
  kept below because the diagnosis was right and the reason it mattered was not the one recorded:
  **two of the six kinds were not observable from outside at all**, so no caller could have built
  the sequence however carefully it tried. `pathEnded` in particular had no producer anywhere — a
  path reaching an `end` node was reported only as a *region* event, and only inside a region.
  [Q41](../doc/questions/q41.md) was filed as an ergonomics question and was a capability gap.

  > *v0.2:* `FoldInput` interleaves records, region events, dispatches, path ends and a stop into
  > one ordered value, and **nothing produces that value yet** […] The ordered sequence `RN-R3` and
  > `OR-R5` are *about* does not exist as a thing you can hold.

- **Whether `stuck` says WHY.** A map of zero items is `stuck` and **no policy reports it
  `unsatisfiable`**, because a policy's state after a region opens nothing is byte-identical to its
  state before any branch opens - so `onUnsatisfiableJoin` does not fire and `joined` is `null`
  rather than `false`. That is [Q97](../doc/questions/q97.md) exactly, open since P5 with **ADR 0026
  held for it**, now with a second case. `spec/join-policy.md` section 5 carries the ruling and the
  three alternatives it rejected.
- **What a consumer should do about a `stuck` run.** [Q38](../doc/questions/q38.md) asks whether a
  `halted` run is resumable and neither is answered here. There was no cancel until v0.18
  ([Q18](../doc/questions/q18.md), resolved by `RN-R31`), and a `stuck` run has nothing in flight for one to
  stop — `driver.cancel` refuses it as `ended` — so the honest answer is still *report it and abandon it*.

## 7. What a run RETAINS, and what it may forget — [Q19](../doc/questions/q19.md), answered

**v0.6, and it is the one bullet above that moved out of section 6.**
[ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
is the decision; this is what the document says.

**Sections 1-6 are about what a run REPORTS. This section is about what a run HOLDS**, and the two
are different questions with different answers: a `RunState` is a value a caller computes and drops,
and the retained footprint is the driver's, for as long as the caller keeps the driver.

### The variable, and why the old sentence was wrong

| dimension, varied one at a time | measured | per unit |
|---|---|---|
| a chain of N tasks, each returning one key | 599 … **33490 B** at N = 2 … 128 | linear, **~262 B/node** |
| one `fanout` of W branches, arity AUTHORED | 1523 … **30007 B** at W = 2 … 64 | linear, **~469 B/branch** |
| one `map` over A items, arity from the DATA | 1546 … **116814 B** at A = 2 … 256 | linear, **~456 B/instance** |
| the SAME 4-task chain, each result K KiB | 1113 B … **1025.1 KiB** at K = 0 … 256 | linear, and it is **the whole of every result** |

**The first three are ONE variable — how many tasks SETTLE — and the fourth is the multiplier the old
bullet omitted.** Thirty-one times the footprint at a thirty-second of the node count.

| id | | Test owed by |
|---|---|---|
| `RN-R13` | **A run's retained footprint is *(tasks settled) x (bytes each returned)*, plus one further copy of each result that has arrived at a join that has NOT YET BECOME TERMINAL** — **plus, since v0.9, ONE copy of the ENTRY PAYLOAD for the life of the run, the checkpoint header's (`RN-R15`)**, constant in the tasks settled and proportional to the payload, which for a `map` at the entry is its whole item list — **plus, since v0.11, each GATE's MEMORY for the life of the run (`RN-R26`)**: whatever its type's `fn` wrote, which for `distinct` is one entry per distinct KEY seen, the key's JSON — proportional to the keys and not to the values that carried them, and with no terminal moment inside the run, because a later branch may reach the gate. *(v0.11 added this clause, and it is the one existing rule's text W93 moved — P24 prediction 4, predicted before the item. The `gated` elements' keys are in `inputs`, the first term, and are not a fifth.)* *(v0.9 added the clause before it, and it is the one existing rule's text W88 moved: [W88](../doc/work-items/w88-what-a-checkpoint-is.md)'s conformity reader read the unamended sentence as a footprint that IS two terms while the driver now retains a third, and placing the third beside this rule rather than in it would have kept P23 prediction 4 true in its letter and this sentence false.)* *(The second term read *"whose region is still live"* in the first draft of v0.6. **That is a different predicate and it is the wrong one** — W53's conformity reader, on this document's own fixture: `p1-routed-away.flow.json` under `arrival-count` has **zero live branches**, both terminal, and still retains, because *live* is what a branch is and *terminal* is what a JOIN becomes. Stated as *live*, this rule licenses a release the driver must not make and does not make.)* **The first term is `inputs`** — the fold's own sequence, which is what `Driver.foldInputs()` returns and what holds every `result`; `log` is its **record-kind subsequence by reference** and costs **16-18 B** on top of it rather than a second copy. **The second term is the region collections `JP-R12` is about**, bounded by the window that rule now states: from a region's first arrival until its join becomes terminal, and **not one byte longer**. Everything else the driver holds is per-region or per-id and does not scale with a result: `dispatched` is task-id **strings** (44 B for 3 ids), `joinState` and `firedJoins` are per region (41 B and 14 B on a one-region flow), and **`outputsCache` holds results BY REFERENCE** — every entry in it **is** a log record's own `result` object, measured 5/5, 17/17 and 65/65 — costing ~25 B an entry for the `branchPath` string beside the pointer. **So the falsifiable form is TWO claims and not one, and a reachability set is only half of it.** *Which* structures hold a settled result: exactly `{inputs, log}` once its region's join is terminal, `{inputs, log, arrivals}` inside the window, and `{inputs, log, outputsCache}` — or all four — on any flow that declares a `needs`, because that is what makes the memo exist. *Whether* a holder holds a **copy**: only `inputs` and `arrivals` do, and `outputsCache`'s entries are **identical objects** to the log's. *(The first draft claimed the set alone was the test and that it was *"exactly `{inputs, log}`"*. **Both of W53's readers falsified it from opposite ends** — the conformity reader ran the stated predicate on a corpus flow with a `needs` and got a third name; the adequacy reader made the memo `structuredClone` what it stores, **a real second copy of every result, for ZERO failures at every rung**, because both of that suite's fixtures declared no `needs`. *A reachability SET cannot tell an alias from a copy.* It is P15 fact 1's own defect — `outputsCache` recorded as `null` because the flows measured declared no `needs` — reproduced inside the test written to correct it.)* Test: at ladder L2, a unique marker in a branch result and the set of holders asserted at both ends of the window, **with the walk's own universe bound to the driver's own property names both ways** so a new field fails naming itself; plus the memo's entries asserted `===` a log record's result. Identity alone cannot answer the set question, because `OR-R2` deep-copies at the listener boundary; a byte count cannot answer either, because `v8.serialize` is in two of the five runtimes. **v0.8 — and per region INSTANCE, which is the second term's own quantifier once one opener can be entered N times** ([ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md) consequence 7): an opener entered N times holds N collections AT ONCE, releases the one whose join became terminal and NO other, and gives up its own key only with the last of them — so a run that released everything holds no key at all rather than N empty maps. **The settlements have to be INTERLEAVED, and which instance closes first is itself a claim**: in dispatch order there is never a second collection to confuse the first with, and closing instance 0 first leaves *release the instance being settled* and *release the opener's first entry* the same expression. Asserted at BOTH exits — the `unsatisfiable` one needing the constructed policy `JP-R12` already calls for, because that arm never reads the collection and a release keyed one level short is silent there | **[W53](../doc/work-items/w53-what-a-run-retains-that-nothing-reads.md)**, per instance **[W85](../doc/work-items/w85-what-a-nested-region-carries-and-how-it-ends.md)** |

### What a run may NOT forget, and it is the fold that decides

**Nothing may be evicted from `inputs`.** `RN-R1` makes the fold a pure function of the sequence and
`RN-R2` makes it total over any **prefix** — neither says anything about a sequence with a hole in
it, and the fold has no way to say it was handed less than the whole log. Measured on a 37-input
sequence truncated from the front:

| `fold()` over | outcome | nodes | regions |
|---|---|---|---|
| the complete log, 37 inputs | `completed` | 9 | 1 |
| the last **18** | `completed` | 8 | 1 |
| the last **1** | `completed` | **0** | **0** |

**It does not throw and it does not say it is incomplete.** A run state reporting `completed` while
knowing nothing about the run is not a silent eviction; it is a **plausible wrong answer**, which is
what a fold defined over a complete log does when the log stops being complete. So an eviction
candidate needs a way for the fold to say it was handed less, and that is a new `FoldInput` kind —
a change to the one value this repository's whole invariant hangs off. **Not taken here.**

**`maxCompletedTasks` is not an answer to inherit.** [Q19](../doc/questions/q19.md)'s row said *"the
scheduler already has this problem and answers it with `maxCompletedTasks` and eviction; we would
inherit the answer and its sharp edge"*. Measured: it caps **`scheduler.tasks`**, the scheduler's own
map, and reaches nothing this layer holds. There is no answer to inherit, only a shape, and the table
above is that shape applied here.

### What this section does NOT fix

- **Bounding what a CONSUMER reads.** `RunState.nodes[taskId].result` **is** the retained result, so
  dropping one changes what a run reports. Measured: blanking every `result` takes a fold's input
  from 13984 B to 1612 B — a factor of **8.7** *(on one fixture, and the factor is not a constant:
  the blanked sequence is a floor whatever the payload, so the same measurement over a 4-task chain
  reads 1.0 / 4.7 / 15.5 / 58.7 / 231.8 at 0 / 1 / 4 / 16 / 64 KiB results. What blanking removes is
  **the whole of every result**, which is `RN-R13`'s own variable, so a ratio only ever reports how
  big the fixture's results were —
  [W54](../doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) and
  [Q240](../doc/questions/q240.md), found by both of that item's readers. Corrected here as a
  declared late exception, because this document is
  [W53](../doc/work-items/w53-what-a-run-retains-that-nothing-reads.md)'s and the number moved after
  it shipped)* — and changes `RunState`. Over both corpora **153 of
  175 task nodes (91%)** *(110 of 124 and 89% when W54 measured it; 153 of 169 until [W67](../doc/work-items/w67-a-flow-from-documents-on-real-workers.md) added `triage.flow.json`, P18's sample — six task nodes and no `needs`; 150 of 166 and 90% until [W65](../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) added `pooled.flow.json`, three task nodes and no `needs`; 140 of 155 and 90% until [W63](../doc/work-items/w63-a-transformed-join-on-real-workers.md) added two flows to `examples/flows/` — eleven task nodes and one more task node NAMED by a `needs` (two declarations, one target), the count's fourth move and the second to move the number `needs` NAMES, 15 to 16; 136 of 150 and 91% until [W61](../doc/work-items/w61-what-a-transform-is.md) added `transformed.flow.json` — five task nodes and one `needs`, the count's third move since W54 measured it and the first to move the number `needs` NAMES, 14 to 15; 122 of 136 and 90% after [W58](../doc/work-items/w58-what-a-node-says-about-its-own-task.md)
  added three flows with twelve task nodes and no `needs`, whose conformity reader found this
  third copy of the count standing in the present tense after the other two had moved — a second
  late exception on this document for the same number; [W59](../doc/work-items/w59-what-a-node-type-is.md)
  added three more with fourteen task nodes and no `needs`, and declared this document as an
  exception BEFORE writing them, on W58's precedent)* are named by no `needs`, so *drop a result no reference can name* is
  decidable from the document; it is a change to the library's public answer rather than a driver
  optimisation, and it is [W54](../doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md)'s
  to price.
- **What a result may BE** — [Q22](../doc/questions/q22.md), and `OR-R2`/`OR-R6` are where it lives.
- **Durability** — [Q15](../doc/questions/q15.md), and this section sharpens it rather than
  answering it. **A join's collection is in no `FoldInput` at all**: `dispatched` carries a `taskId`
  and nothing else, so a run resumed from a persisted sequence cannot be handed what a join collected
  and cannot recompute it. That was true before v0.6 and is visible now that the collection has a
  stated lifetime.
- **The THIRD release moment is a RUN-level one, and v0.6's first draft named only the
  two per-region ones.** A refusal that halts the run (`OR-R10`) releases **every**
  region's collection, including regions whose join is still `waiting`, because the
  driver has stopped routing and no join will settle again. *(W53's conformity reader:
  the code had three sites while this document, `spec/join-policy.md` and
  `spec/README.md` all enumerated two, so a reader implementing the driver from `spec/`
  alone would not have written it — and ADR 0046 rule 5's unconditional "a region whose
  join never becomes terminal holds its collection" was false against ADR 0046 rule 3
  for exactly that region. Rule 5 is now scoped **in a run that has not halted**.)*
  **The LOG is untouched at all three moments**, which is the asymmetry rule 2 turns on:
  a halted run is a run a consumer folds to find out what happened.
- **Whether a `stuck` run can be released early.** `RN-R10` decides `stuck` **here**, at a quiescent
  point, from a region whose `joined` is not `true`. The driver has no event for it, and giving it
  one would put a run-state determination inside the driver — which
  [ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) rule 4
  and [ADR 0001](../doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
  rule 1 both refuse. **So a region whose join never becomes terminal holds its collection until the
  caller releases the driver**, and `RN-R13`'s second term is stated over **regions whose JOIN is
  still live** for exactly that reason. *(This read "over live regions", which is the predicate
  `RN-R13`'s own parenthetical rejects by name — *live* is what a BRANCH is and *terminal* is what a
  JOIN becomes, and `p1-routed-away.flow.json` under `arrival-count` has zero live branches and
  still retains. The rule and
  [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
  rule 5 both had it right and this one sentence of the section that cites them did not.
  [W55](../doc/work-items/w55-a-run-at-scale-on-real-workers.md)'s conformity reader, reading `spec/`
  first; taken as a **declared late exception**, because this document is
  [W53](../doc/work-items/w53-what-a-run-retains-that-nothing-reads.md)'s and W53 is done.)*

## 8. What a CHECKPOINT carries — v0.9, [P23](../doc/plans/p23-what-a-run-needs-to-outlive-its-process.md)

**A checkpoint is this document's own input sequence, handed out as plain data with a header in
front of it.** [ADR 0064](../doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)
is the decision. It is not a `RunState` — section 2's shape cannot restore a run, because the
driver's private routing state (join state, fired joins, per-instance arrivals, the dispatched set)
is not in it — and it is not the settlements alone, which regenerate a run (P23 fact 1: **57 of the
61 L6 drivers replay exactly from their settlements**; of the other four, the two `FD-R4` refusals
replay identically and the two `OR-R6` stops do NOT — the refused result never reached the log, so the
replay leaves that task in flight, which is P23 decision 10's halted-run refusal)
but cannot serve a live view. So **an event IS a checkpoint's element**: a checkpoint is every event
so far, and every event after it is an append.

**What the sequence cannot regenerate is the HEADER's.** Replayed from its settlements, a fresh
driver regenerates every dispatch, region event, join settlement and path end — **261 of 261
dispatched payloads equal what the real scheduler was sent** — but only because the replay starts
from the original entry payload, which is in **no record at any moment**
([W42](../doc/work-items/w42-what-a-decision-sees.md)'s finding, now load-bearing). *(P23 fact 1 read
*180 drivers, 169 reproduce, 616 payloads*; its harness captured its own replay drivers while it
iterated them, and W88's declaration step re-took it on L6's own drivers — the conclusion unchanged
and the sample a third of the size. [Q366](../doc/questions/q366.md).)*

| id | | Test owed by |
|---|---|---|
| `RN-R14` | **A checkpoint is `{ header, events }`, and `events` is the WHOLE fold-input sequence in append order** — element for element what `Driver.foldInputs()` returns at that moment, of every kind, and not a subsequence of it. `fold(checkpoint.events)` is `fold(driver.foldInputs())`. **There is no checkpoint of a driver that has not started**: `checkpoint()` throws `NotStarted`, because its header would have to invent an entry payload and the only candidate, `undefined`, is also what a run started with `undefined` carries. Test: a run's checkpoint against `foldInputs()` at the same moment, element for element and folded; a checkpoint before `start()` refused by name | **[W88](../doc/work-items/w88-what-a-checkpoint-is.md)** |
| `RN-R15` | **The header is five facts, each a SELECTION from a named source**: `format` (`RN-R16`); `runId`, the driver's own (`ID-R3`); `flowId` and `version`, the definition the driver was constructed with; and `entryPayload`, **a `structuredClone` of the value `start()` was CALLED with, taken at the call** — not the entry node's composed payload (they differ whenever the entry declares `needs`), not its result, not any task's envelope, and not the caller's object by reference, so a caller mutating what it passed moves nothing. Each `checkpoint()` hands out its own copy. **An entry payload `structuredClone` refuses throws the platform's `DataCloneError` from `start()`, with the driver UNSTARTED and nothing appended** — `OR-R12`'s asymmetry at the other caller-initiated boundary, and a behaviour change: before v0.9 such a payload started a run on an inline pool. **The header is written only once `start()` has passed its two earlier refusals** — a second `start()` (`MultipleRuns`, `ID-R3`) and `FD-R4`'s boundary check, which runs first, so a payload failing both reports `BoundaryRefused` — and a refused call writes no header and does not call `onRunFailure`: nothing ran. **The entry node still receives the caller's value exactly as before**; the copy is the header's alone. **The driver retains ONE copy of one value per run** — constant in the number of tasks settled and proportional to the payload, and `RN-R13` names it as a third term since v0.9. **v0.10 — a RESUMED driver's header is the checkpoint's** (`RN-R19`): the same five facts, and its entry payload a `structuredClone` of the stored header's, taken at `resume()` — so it is still ONE copy, and an entry payload the clone refuses throws `DataCloneError` from `resume()` with the driver unstarted, as from `start()`. Test: every field against a literal derived from the definition and the call, on a flow where each well-formed wrong selection DIFFERS — version 7, run `batch42`, an entry that composes `{ seed: "." }` — with the arrangement asserted beside the claim; the payload mutated between `start()` and the first checkpoint; two drivers on one scheduler differing in every selected field; a `start()` refused by `FD-R4` and a second refused by `MultipleRuns`, each leaving the header as it was | **W88** |
| `RN-R16` | **`header.format` is the integer `CHECKPOINT_FORMAT`, which is `1` at v0.9, and it moves only when what a checkpoint CARRIES moves.** It is the field a resume refuses on when it meets a format it does not know — the refusal is W89's; the number it reads is this rule's. Test: the header carries the exported constant, and the constant is `1` | **W88** |
| `RN-R17` | **A checkpoint is PLAIN DATA and a COPY.** The header and every event, of **every** `FoldInput` kind, round-trip `structuredClone` to a value with the same data AND the same prototypes at every depth — `OR-R11`'s boundary is where *round-trips* is decided, and property ATTRIBUTES are outside it, since a frozen event arrives unfrozen. **The contract is `structuredClone`, not JSON**: a `result` is whatever survived `OR-R2`'s clone, and that includes `Map`, `Set`, `Date`, `BigInt` and `-0`, which the events carry. And the checkpoint holds **no reference to anything the driver holds**: writing into one moves neither the driver's sequence nor the next checkpoint. Test: at ladder L2, one run per KIND keyed by `FoldInput['kind']` — a `Record` over the union's key type, so a missing or an extra kind fails at L0 in `typecheck:tests`, the one lane whose config includes `test/**` — each asserted to carry its kind and every event, header and whole checkpoint to round-trip under a comparator that sees a lost prototype, **beside controls showing that comparator fails on a lost prototype, an accessor and a changed key order — the three the harness's `equal` does not see** — and passing an `Error` result, whose clone carries the engine's own `stack` accessor on both sides; and a write through every event of every kind's checkpoint, the driver's sequence unmoved each time | **W88** |
| `RN-R18` | **Every element has a POSITION: its index in the sequence**, which `onFoldInput` receives as its second argument — the index at which the same element appears in `foldInputs()` and in `checkpoint().events`, from 0, contiguous in delivery order. So a consumer that appends what it is handed holds exactly the prefix named by its length, and a checkpoint taken inside the callback for position `k` holds `k + 1` events. **It is the driver's index**, chosen when the element is appended and unmoved by a re-entrant append inside the callback; **a runtime composing `onFoldInput` hands it on unchanged** and does not count for itself. **A consumer receives the run's first events before `runtime.start` returns the handle that carries the header** — 1 to 5 over L6's 62 starts, and 2N + 1 for an entry fan-out of N branches — which is why the position, and not the arrival order, names what a store holds. **v0.10 — a RESUMED driver's consumer is handed positions from the STORED LENGTH on, never from 0** (`RN-R24`): the elements before it are the ones the store already holds, and the replay regenerates them without delivering them — so *counted from 0* is a property of a run entered by `start()`, and *the driver's index* is the rule for both doors. Test: at ladder L2 positions `0 … n-1` against the checkpoint element by element, a checkpoint taken inside the callback at every position, and a person resolving from inside the callback; at L1 the same through `createRuntime`'s composition, on the runtime's second minted run with a callback on its first as well — where a counter the runtime kept for itself would start past 0 | **W88** |

**What this section does NOT fix**, named so it is not mistaken for an omission: **resuming** — the
replay, the prefix check, the re-dispatch of the in-flight set and every refusal (section 9, v0.10);
**storage and serializers** — the library defines the value and never where it goes (P23 decision 1);
**redaction** and any **memory option** (P23 decisions 8 and Out). A checkpoint of a `halted` run is a
checkpoint like any other; resuming one is refused (`RN-R23`).

## 9. What a RESUME does — v0.10, [P23](../doc/plans/p23-what-a-run-needs-to-outlive-its-process.md)

**A resume is a replay of the stored stimuli through the routing that produced them, with every
dispatch held, a refusal wherever the replay cannot regenerate what was stored, and the tasks still in
flight handed to a scheduler again.** [ADR 0065](../doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md) is the decision. It rests on
`doc/concept.md` section 5's promise — *if run state is a fold, durability is writing the log down* —
and on section 8's measurement that the settlements regenerate the rest: of the 2015 elements P23 fact
1 counted, 493 were stimuli (**261 of 998 dispatches, re-measured on L6's own drivers — W88**), and a
fresh driver fed only those reproduces the run exactly. **The replay is not a second road beside
routing**: a stored settlement goes through the listener's own post-normalisation path and a stored
resolution through `resolve()`'s own, which is P23 prediction 1 held as a structure.

**What W89's declaration step measured before the rules were written**, on real schedulers: 14 kill
points over two flows complete IDENTICALLY to a run nobody killed; **29 tasks re-dispatched, none of
them settled in the stored events — and 14 of the 29 dispatched ONLY in the regenerated tail**, which
is why `RN-R21` says *at the end of the replay* and not *at the stored prefix* (P23 prediction 2's
wording, corrected); and a task with a budget of two attempts ran **three** times across one kill
([Q365](../doc/questions/q365.md)).

| id | | Test owed by |
|---|---|---|
| `RN-R19` | **A resume REPLAYS the stored run, and `resume()` is the other door into ONE run.** A driver constructed for the checkpoint's run and definition is handed the checkpoint instead of an entry payload: it enters the entry node with a COPY of `header.entryPayload` exactly as `start()` enters it — with no `FD-R4` check, because the payload was held to the schemas when the run started — and then FEEDS every stored element of the three kinds a replay cannot regenerate — `outcome`, `resolution`, `resumed` — **at its own position**, a settlement through the path the listener takes once `ID-R4` and `OR-R2` have passed it and a resolution through `resolve()`'s. Everything else it REGENERATES. **Every dispatch the replay makes is HELD** — nothing reaches a scheduler until `RN-R21`. A fed element is appended AS STORED: its `observedAt`, `attempts` and timings are the stored run's, so the replayed log IS the stored log — and as the driver's OWN COPY, so a store writing into what it handed the resume rewrites nothing the driver holds (`OR-R7`). `start()` and `resume()` are each refused on a driver that has used either (`ID-R3`). Test: at ladder L2, a reference run cut at EVERY position from 0 to its length — at quiescent points and inside `onFoldInput`, where it ends mid-step — each resumed and driven with the reference's remaining stimuli, asserting the resumed run's sequence, its `resumed` element aside, IS the reference's, element for element; and a run stored under ONE clock with non-zero attempts, resumed under ANOTHER, its fed records the stored ones and untouched by a write into the store | **[W89](../doc/work-items/w89-what-resuming-is.md)** |
| `RN-R20` | **The stored events must be a PREFIX of what the replay regenerates, and the first position where they are not is REFUSED by that position.** Every element the replay appends at a position the stored events cover is the stored one — a fed element by being appended at the very position it was fed from, a regenerated one by being the same DATA, key order ignored and an `undefined`-valued key read as absent, because a store may reorder or drop either — or the resume throws `ResumeRefused` with `reason: 'diverged'` and `index` that position, naming the stored element and the replayed one. A replay that ENDS short of the stored length is refused at the replay's length; a stored settlement for a task the replay never dispatched, a resolution for one it has not parked, or a task id that does not parse, is refused at its own position. **A replay may run PAST the stored events**: that is the stored run's LOST TAIL — a checkpoint taken inside `onFoldInput` ends mid-step (ADR 0064) — and nothing past the stored length is compared. **That is the check's stated limit**: a predicate or a definition that changed where the stored run's road lies past its stored events is not seen, and the resumed run takes the NEW road. Test: a region event whose NESTED `branchPath` differs and an element with an EXTRA key, each refused at its position, and the same elements with their keys reordered — at the top level and inside an event — or carrying an `undefined`-valued key, resumed; a divergence at position 0 (an entry payload whose array lives on a prototype `OR-R11` drops, so the replay's map finds none), mid-run (an inverted predicate, whose two roads dispatch the same KIND, at a position that is not 0, not the fed settlement's, not the last and not the length), and at the end (a store that appended its last element twice), each by `reason` and `index`; the same inverted predicate on a checkpoint cut before its road, NOT refused and taking the new road; a settlement the replay never dispatched, a task id that does not parse and a resolution for a task the replay has not parked, each refused at its position with nothing handed to the scheduler | **W89** |
| `RN-R21` | **What is IN FLIGHT is every task the replayed sequence DISPATCHED and holds no settlement for, in dispatch order, and each is handed to the scheduler again at the SAME task id** (P23 stop-and-ask (c)) — with the payload the replay composed and `createTask` called at release, so a factory sees exactly the tasks a scheduler is handed. **At the END of the replay, not at the stored prefix**: a task the lost tail dispatched is in flight though the store never saw its dispatch. **A `user_action` settlement IS a settlement**: a task parked for a person is not in flight, stays parked, and `resolve()` works on it after the resume, because `RS-R1` reads the replayed log. **AT-LEAST-ONCE, and that is the contract** (P23 decision 6): a task in flight may have finished in the process that is gone and runs again, and it runs with a FRESH retry budget, because the log records `attempts` only at a settlement ([Q365](../doc/questions/q365.md), measured). Test: a quiescent checkpoint with one branch task settled, one PARKED and two running — one dispatched with the fan-out and one dispatched after a `done` settlement inside it, both before the parked task's `user_action` settlement, which is the LAST stored settlement — so that parked-counted-as-in-flight, dispatched-after-the-last-settlement, dispatched-past-the-stored-prefix and every-held-dispatch each give a DIFFERENT set from the right one; a mid-step checkpoint whose tail dispatches a task the store never saw, re-dispatched; the re-dispatched payloads equal to what the original run sent, and `createTask` called for exactly those tasks; the parked task resolved on the resumed driver | **W89** |
| `RN-R22` | **A resume is RECORDED: a `resumed` element naming the in-flight ids is appended after the replay and BEFORE the first re-dispatch — always, `taskIds: []` when nothing is in flight** (P23 stop-and-ask (a)). The fold appends the ids to `RunState.resumes` and **moves nothing else**: every id was dispatched before and is `running` still. **A stored `resumed` element — a checkpoint of a run already resumed — is FED at its position**, and refused unless it names exactly what is in flight in the replay there, in order. It is the ONE `FoldInput` kind this section adds, and it is BREAKING for a consumer switching on `kind` exhaustively. Test: `resumed` first past a quiescent checkpoint's stored events, every re-dispatch reaching the scheduler with it already appended; `RunState.resumes` recording it with every other field equal to the stored run's fold; a completed run resumed to `resumed: []`; a resumed run resumed again, the fold recording BOTH resumes in order, and its stored `resumed` tampered to the same ids out of order, to a subset and to `[]`, each refused at its position; the fold copying the ids it is handed | **W89** |
| `RN-R23` | **A resume REFUSES by name, and a refused resume hands nothing to a scheduler.** `ResumeRefused` carries `reason` and `index`: **before replaying anything**, `format` — not `{ header, events[] }`, `header.format` not `CHECKPOINT_FORMAT` (`RN-R16`), or `runId`, `flowId` and `version` not the two strings and a number format 1 writes; `run` — `header.runId` not the driver's (`ID-R3`); `flow` — `header.flowId` or `header.version` not the definition's, with **no migration** (P23 decision 7); `halted` — a stored `halted` element, **or a stored element of kind `stopped`, 0.7.0's name for it (v0.16, ADR 0102 rule 3)**, `index` its position (P23 decision 10: the refusal that halted it would halt it again, and the class whose cause never reached the log cannot be regenerated); **v0.15: `cancelled` — a stored `outcome` element whose record is `terminalState: 'cancelled'`, checked after `halted`, `index` the FIRST such element's position** — **and since v0.18 a stored `cancelRequested` element too, `index` the first element of EITHER kind** (a requested cancel's element precedes every settlement it caused, so its run is refused at the request — and a run cancelled while parked, with no settlement after its request, is refused at all; ADR 0104) ([ADR 0094](../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md) rule 5: a cancel is its owner's act, and a resume would hand the scheduler again what the owner stopped; only a STORED cancel, because a settlement is fed to the replay and never regenerated). These five are `resumeRefusal(definition, checkpoint, runId?)`, a pure function the runtime also calls before it builds a driver. **During the replay**: `diverged` (`RN-R20`); and `halted` again when the replay REGENERATES a halt past the stored events — the lost tail, `halted` included, is delivered first (`RN-R24`) and the driver keeps the HALTED run, whose checkpoint a store may take. **A refused resume leaves the driver SPENT**: `start()` and `resume()` throw `MultipleRuns`; except after a halt regenerated in the tail, there is no run to checkpoint (`checkpoint()` throws `NotStarted`) — `foldInputs()` still shows the replay up to the refused position, which is what `index` points into — and **the driver hears nothing from its scheduler**: no settlement is appended, routed, delivered or reported, and `resolve()` is refused. An entry payload the clone refuses throws `DataCloneError` with the driver UNSTARTED, as `start()` does. Test: each header refusal by `reason` and `index` — format 2, 0 and `"1"`, no format, no or a numeric `runId`, a string `version` among them — the pure function agreeing, nothing replayed or dispatched and the driver spent; a resume refused DURING its replay leaving the driver spent and deaf, with settlements under its id — for a task it held and one it never saw — appending, routing, delivering and reporting nothing; a stored `halted` refused at its position, and one that is not the last element; at v0.16 a 0.7.0 checkpoint — the same two, the element in its old kind `stopped` — refused `halted` at that position by the driver and the pure function, and a 0.7.0 checkpoint of a live run still resuming; a halt regenerated in the lost tail refused after that tail and one `onRunFailure` were delivered, and one whose tail holds two elements before it, refused at the halt's position and not the stored length; an uncloneable entry payload ; a stored cancel refused `cancelled` at the FIRST of two cancels, neither the first element nor the last, the pure function agreeing and the driver spent; the same run's checkpoint from before the cancel resuming; and a run cancelled THEN halted refused `halted` at the halt; at v0.18 a run its owner cancelled refused `cancelled` at its `cancelRequested` element — with settlements after it, and with none — by the driver and the pure function | **W89**, `cancelled` **[W158](../doc/work-items/w158-cancelled-is-a-library-state-and-a-run-outcome.md)**, the request **[W173](../doc/work-items/w173-cancelling-a-run.md)** |
| `RN-R24` | **Every callback fires for exactly the elements at positions ≥ the stored length, and for none below it** — `onFoldInput`, `onRegionEvent`, `onUnsatisfiableJoin`, `onRunFailure` and `onNonconformingResult` alike: the consumer holds everything before that position and reported, in the process that stored it, whatever it was told. **The positions are the DRIVER's** (`RN-R18`), so the first a resumed run's consumer receives is the stored length — the lost tail's first element, or `resumed` — and a store that appends what it is handed holds the whole run again; a checkpoint taken inside the callback for position k still holds k + 1. Test: at ladder L2, a checkpoint cut mid-step with region events on both sides of its length and every settlement's result nonconforming, asserting the positions, the k + 1 inside the callback, the one region event past the length and none below, and a report for the one settlement past the length and none for the replayed six; at L1, the same positions through `createRuntime`'s composition on a runtime that has already handed another run positions — where a count from the wrapper's first call would start at 0 | **W89** |
| `RN-R25` | **`runtime.resume(flow, checkpoint, options)` builds the resumed run's driver exactly as `start` builds one and returns the same `{ driver, done, header }`** — `header` the stored header, `done` resolving with the fold of the WHOLE run, stepped from the stored events before the first delivered one; `options` every `StartOptions` member but `runId`, which is the header's. **It refuses the header first, with `resumeRefusal`, and an entry payload the clone refuses, both before any driver exists. And it refuses a `start` or a `resume` naming a run id IN USE on it — held by any driver it has built, from the moment that driver exists — with `RunIdInUse`, and its minted counter SKIPS every id in use** ([Q364](../doc/questions/q364.md), P23 stop-and-ask (b)). **In use means a driver of the runtime was BUILT for the id, not that its run is running — and the id stays in use for the runtime's life, after the driver is released** (v0.14, [ADR 0091](../doc/decisions/0091-a-runtime-releases-a-run-when-its-done-settles-and-keeps-only-its-run-id.md)): when a run's `done` settles, or the `start` or `resume` that built its driver throws, the runtime drops that driver from its routing and keeps only the id, so a FINISHED run's driver is handed nothing more under its id, and nor is the driver of a `start` that `FD-R4` refused. **The id is kept because a run can end with tasks in flight** — a `halted` run by construction — whose settlements carry it: a second run under it would be handed them, refused by `ID-R4` tier 2 or, where it minted the same task id, accepted as its own. A resume refused by its header therefore costs no run id; one refused during its replay does, and resumes on a fresh runtime. Test: at ladder L1, a checkpoint of another runtime's SECOND run resumed, the counter then minting `r1` and `r3`; a start and a resume naming the resumed id, a finished run's id and a refused start's id, each refused naming it with nothing handed to the scheduler; the collision built by hand, the finished run's sequence NOT growing — released, it is handed nothing — while its id is still refused; a header refusal — one with no `runId` among them — and an uncloneable entry payload each leaving the id usable, and a replay refusal spending it; `done` over three processes, the third store carrying the second's resume and its first delivered element the lost tail's, equal byte for byte to the fold of the whole run; and every `StartOptions` member but `runId` observed on a resumed driver as on a started one | **W89** |

**What this section does NOT fix**, named so it is not mistaken for an omission: **exactly-once** — a
task in flight at the kill runs again, and idempotence is the worker's (P23 decision 6); **a retry
budget carried across a resume** ([Q365](../doc/questions/q365.md)); **a resource group's state**, which
is a process's and is rebuilt with the runtime — a limit that must hold ACROSS processes is not modelled
here; **storage and serializers** (P23 decision 1); **migrating a checkpoint across flow versions or
registry changes** (P23 decision 7, [Q249](../doc/questions/q249.md)); **resuming a halted run**
([Q38](../doc/questions/q38.md)); and **a divergence past the stored events** (`RN-R20`'s limit).

## 10. What a GATE records — v0.11, [P24](../doc/plans/p24-what-a-node-may-remember-across-a-runs-branches.md)

A gate (`spec/flow-definition.md` section 2, v0.24) routes the branch that reaches it by what the run's
OTHER branches have already shown it, so a run's state has something it did not before: **a decision made
by memory rather than by the settlement in front of it.** Without a record of it, a drop is visible only as
`branch.exited` at an `end`, and *which* key and *which* route are in no event — so P24 stop-and-ask (b)
answered that it IS recorded, and this section is that record and the memory it comes from.

| id | | Test owed by |
|---|---|---|
| `RN-R26` | **A gate's decision is RECORDED, and its memory is the DRIVER's.** Where a branch ENTERS a gate the driver asks the gate's type — its `fn`, synchronously, handed the gate's memory, **ONE per gate per RUN**, the same for every branch that reaches the gate whatever region instance or map item it comes from (P24 stop-and-ask (a)) — and, where the route it returns is one the type declares, appends **`{ kind: 'gated', gateId, branchPath, route, key }`** BEFORE entering that route's target: `branchPath` the gate's own, derived as a task's is (`spec/task-id.md` section 1), and `key` a COPY of what `settings.key` resolved to over the value as a `structuredClone` carries it — the SAME key the type was handed, resolved once and copied before the type ran — **absent** where nothing resolved. The fold appends `{ gateId, branchPath, route, key? }` to **`RunState.gated`**, in order, as a copy, and **moves nothing else** — a gate dispatches and settles nothing, so what its route leads to arrives as its own inputs. **The memory is created EMPTY with the driver and never handed in or out**, so a resume REBUILDS it: `gated` is not one of the three kinds `RN-R19` FEEDS, so the replay re-asks every gate on the stored settlements in their order, and `RN-R20` compares each regenerated `gated` element with the stored one — a stored route that is not the replay's, or a type whose answer changed ([Q9](../doc/questions/q9.md)), is refused `diverged` at its position. **It is the one kind v0.11 adds and it is BREAKING for a consumer switching on `kind` exhaustively**, as `resumed` was. *(A memory kept anywhere but the driver is what this rule refuses by construction, and it was measured rather than argued: at W93's declaration step a memory kept by the PROCESS resumed a run killed before its first gate decision WRONG, with nothing refused — that decision lay past the stored events, where `RN-R20` compares nothing.)* Test: at ladder L2, the element field for field and its position — after the settlement that brought the branch, before what the route led to — and `RunState.gated` from the fold, `step` moving no other field; a key path ending on an OBJECT recorded as a COPY, frozen at its top level, which a consumer cannot write through to the driver, a worker writing into its input moving nothing recorded, and a missing segment or a gate with no `key` recording no key in the element or the fold; a type writing into its key moving nothing downstream or recorded; the memory shared across two instances of an ENCLOSING map with the settlements ARRANGED so the first arrival is not the lowest index, exactly one `first` per key read off the sequence — and two gates in one run keeping two memories; a gate in a `fanout` branch whose drop exits the branch while the join fires on the other; a run resumed at EVERY cut equal to the reference element for element with the killed driver alive in the same process; the resumed memory asserted to be the REBUILT one at a cut where it, a fresh one and the killed driver's DIFFER; a tampered stored route, key, gate and branch path, and an impure type, each refused at its position; an entry gate started with a CLASS instance whose checkpoint resumes; and a checkpoint produced by v0.10's code resuming with `gated` empty | **[W93](../doc/work-items/w93-what-a-gate-does-in-a-run.md)** |
## 11. What a run FIXES about the ORDER of its own dispatches — v0.12, [W98](../doc/work-items/w98-what-a-row-may-assert-about-a-dispatch-order.md)

**This section exists because a rung asserted orders nothing fixes, and nothing here said which orders a run fixes at all.** A dispatch happens in
the TURN a settlement opens: the driver hears a task settle, routes, and dispatches synchronously
(`spec/join-policy.md` section 2, *a fanout dispatches all its branches in one turn*). Nothing in this
document, that one or [task-id.md](task-id.md) said which of two dispatches comes first — and
[W97](../doc/work-items/w97-obligation-f-across-ladder-l6.md) found four assertions that depended on it by
DELAYING one worker at a time, while [W98](../doc/work-items/w98-what-a-row-may-assert-about-a-dispatch-order.md)'s
declaration step derived the whole set from the runs themselves. *The four were the ones a delay happened to move.*
**The counts are in W98's Record, with their methods, and not here**, because the quantity they measure was re-measured under three relations of different strength and only the last stands: what the shipped relation leaves asserted by NOTHING on this rung. A normative document carries the rule and not an item's arithmetic — and the figure that circulated before this one was an over-count taken from a relation that knew only case (a).

**So the rule says which pairs a run fixes, and a test may assert those and no others.** It fixes a
partial order, never a total one, and the three relations below are it. **What it does NOT fix is the
order of two settlements that raced** — which is `doc/workflow.md` section 5 rule 5 stated as a property
of the RUN rather than as advice to an author.

**Two dispatches under one `map` opener are case (b)**, and an earlier cut of this section said the opposite in its own
next sentence — that they are unfixed because [flow-definition.md](flow-definition.md) section 6 declines to fix a map's
arity and order. That section declines to fix them *as a property of the definition's graph*; the ARRAY the `over` names
fixes them, one item of it per dispatch, in one pass. So the order is the DATA's, the data is the payload a caller passes,
and a test that names the payload may assert it. W98's conformity reader found the contradiction.

| id | | Test owed by |
|---|---|---|
| `RN-R27` | **A run fixes the order of two dispatches by its own CAUSALITY and by the DEFINITION, and by nothing else.** (a) **A trigger chain**: the settlement that opened one dispatch's turn is the other dispatch, or is reachable from it by repeating that step — the earlier task was dispatched AND settled before the later one's turn existed. (b) **One turn**: both were dispatched in the turn one settlement opened, in which case their order is neither task's and neither run's — it is the order the DEFINITION lists them in, or, under a `map`, the order of the array its `over` names, because the driver dispatches a turn's tasks in one synchronous pass. (c) **A join BARRIER**: a `joinSettled` for a region precedes one of them inside its own turn, in which case every task of that region precedes it, because the policy could not satisfy the join until those branches were terminal (`JP-R5`, and section 4's owner table in [join-policy.md](join-policy.md)). **And (a) COMPOSES with (b)**: where one dispatch is fixed before another, everything dispatched in ITS turn is fixed before that other too — the same synchronous pass ran them all before the settlement that opened the later turn. **Any other pair is two turns opened by settlements that RACED, and its order is not this run's to fix, not reproducible, and not assertable.** A test that asserts one is green on the sample it was written from and red on the machine that reorders it | `examples/l6.ts` — every row's dispatch comparison derives this relation from the run's own fold-input sequence and asserts the pairs it returns, with the rung-wide census of fixed and free pairs as its control and two CONSTRUCTED sequences as that census's |

**What this does not say.** It does not say a run is nondeterministic — the same machine at the same
delays reproduces its order, which is exactly why the pairs nothing fixes were green for as long as they were.
It says the order is a property of the SAMPLE and not of the flow, so nothing may be derived from it.
And it does not fix (b)'s order any harder than the document does: a flow that reorders a fanout's
branch list reorders those dispatches, and that is a change to the flow.

## 12. What a HALT holds — the dispatch hold — v0.17, [P34](../doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md)

**A run has more than one halt, and every one of them must stop the same work.** `RN-R8`'s (a refusal, `OR-R10`) and
`RN-R28`'s (a cancelled settlement) are today's; P34 adds a cancel and a stop the owner requests. Each must leave the
run dispatching nothing further and routing nothing further, and until v0.17 each door asked that question on its
own — so two doors that a halt can reach WHILE the driver is mid-step asked nothing ([Q605](../doc/questions/q605.md)).
The driver calls a consumer's `onFoldInput` and `onRegionEvent` synchronously from inside its own step, and a callback
can halt the run there: `cancel()` of a WAITING task fires `task.cancelled` inside the call, and a refusal it reaches
halts the run as `OR-R10` says. **The answer is one hold every halt shares, checked where the driver decides to do
more** ([ADR 0103](../doc/decisions/0103-every-halt-shares-one-dispatch-hold.md)) — and not after every element,
because a settlement of a task still in flight must still be appended after a halt: the log is what happened.

**The hold has two forms, and this section fixes the first.** SHUT — a halt's, for good: nothing is appended for the
work it holds. DEFERRED — the replay's (`RN-R19`): each dispatch is appended and handed on later. P34's pause is to
take the deferred form at the same door (ADR 0106); its cancel and stop the shut one (ADR 0104, 0105). **v0.18: the cancel has** — section 13.

| id | | Test owed by |
|---|---|---|
| `RN-R29` | **Once a halt is on a run its dispatch hold is SHUT: the driver dispatches, routes and emits nothing further for it — whether the halt arrived at rest or ON THE STACK of the driver's own step**, apart from the two limits named below. A halt is any of `RN-R8`'s and `RN-R28`'s, and — since v0.18 — a cancel its owner REQUESTED (`RN-R31`), which holds from the moment of the call, before its element is appended. **The hold is checked**: (1) at the head of ENTERING any node, so once the first branch of a fan-out or the first instance of a `map` has halted the run on its `dispatched` element, no later branch or instance is entered — no `dispatched`, no hand-off, no region event (Q605's door (a)) — and a node that dispatches nothing, a gate's route among them, is not entered either; (2) at the head of a DISPATCH, before its `dispatched` element, so a halted run appends no dispatch — a check REACHED in its own right, because between (1) and (2) the driver composes what the node receives (`FD-C1`), and composing a `needs` clones the value, which runs a caller's getters; (3) on a RESOLUTION, after its element and before its `branch.resumed`, and again after that and before its routing (door (b)) — a resolution whose own element halted the run stays ACCEPTED, `resolve()` returning `true` with its element in the log, and routes nowhere; and, as before v0.17, after a settlement's element (`RN-R28`, `OR-R10`), after a join's `joinSettled` (`JP-R12` — for routing, (1) now holds the join's successor as well, and this check is kept as the one before the region's collection is read), and at `resolve()`'s entry, which refuses; and (4) before EACH of `resume()`'s re-dispatches of the in-flight set (`RN-R21`), so a halt raised on the `resumed` element's own stack, or by one hand-off, hands nothing further on — the maintainer's answer to W172's stop-and-ask S-1, which widened P34 decision 8's three places by this one — **except under a REQUESTED cancel** (v0.18), which hands each re-dispatch on and cancels it at once, because a task the run has `dispatched` must end in a settlement the scheduler writes, or the run reads `cancelling` for ever (`RN-R31`). **What it does not hold, because it is checked at those doors and not after every element**: (i) a halt raised on a task's own `dispatched` element hands THAT task to the scheduler — the dispatch in progress, whose element `RN-R4` appends first — and holds the next; **a halt that must STOP that task therefore acts after its hand-off**, since a scheduler's `cancel()` of an id it has not yet been handed does nothing (P34's cancel and stop, ADR 0104 and 0105 — **v0.18: a requested cancel does exactly that**, cancelling the task right after `addTask` returns, `RN-R31`); (ii) a halt raised on ANY element the driver appends mid-step lets the rest of THAT step's appends land, up to its next check — named: on a region's `regionEntered`, every `branch.opened` of the region (`JP-R5`'s *every one before any branch is entered*) and no dispatch; on a branch's `branch.arrived`, the join's `joinSettled` (fired) and no routing out of it; on a branch's `branch.lost`, the path's `pathEnded` and the join's settlement — a `joinSettled` either way, and, where the policy answers unsatisfiable, `onUnsatisfiableJoin` still CALLED for the halted run. Every element that lands after a halt is appended and moves no outcome (`RN-R8`, `RN-R28`). Test: at ladder L2, each of Q605's doors — a fan-out's first branch, a `map`'s first instance, a resolution's own element — under a refusal and under a cancelled settlement raised from `onFoldInput`, each beside its control raising nothing at the same element: the log ending at the halt, `dispatchedIds()` and the scheduler's tasks holding nothing after it, and no region event after it; under the two refusals of door (a), a later settlement — a `user_action` on the fan-out, a `failed` with no edge opting in on the `map` — appended with nothing after it; a refusal AND a cancel raised on a resolution's `branch.resumed`, the resolution `failed` so that its routing ends the path, with no `branch.lost` and no `pathEnded` after it; a refusal AND a cancel raised on a gate's `gated` element, its route an `end`, with no `branch.exited` or `pathEnded` after it — and, under the cancel, a later `user_action` with nothing after it; a refusal raised by a getter while the entry's `needs` is composed, with no dispatch after it (check (2)); a refusal and a cancel raised on a resumed run's `resumed` element, with nothing handed on, and a refusal raised inside the first re-dispatch's hand-off holding the second (check (4)); and (ii) on `regionEntered`, on `branch.arrived` and on `branch.lost` — `onUnsatisfiableJoin` counted — asserted as it is; at v0.18 the requested cancel's two cases — limit (i)'s task cancelled after its hand-off, and a resume's re-dispatch handed on and cancelled — are `RN-R31`'s | **[W172](../doc/work-items/w172-the-dispatch-hold-and-q605.md)**, the requested cancel **[W173](../doc/work-items/w173-cancelling-a-run.md)** |

## 13. What CANCELLING a run does — v0.18, [P34](../doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md)

**A run's owner can end it, and until v0.18 nothing could** ([Q18](../doc/questions/q18.md)): `RN-R28` makes a cancel
the scheduler heard END the run, but nothing asked the scheduler for one, and `done` settled at the FIRST cancel while
the run's other tasks still ran (P34 fact 6). The answer is ONE call on the driver, because the driver is the only thing
with side effects (ADR 0001) — so a driver built by hand cancels exactly as a runtime's does — recorded BEFORE it
cancels anything (P34 decision 4), with every task's end still the scheduler's own settlement (ADR 0007). **It is a halt**
(`RN-R29`), and it differs from `RN-R28`'s in one thing a reader of `done` sees: the run reads `cancelling`, not
`cancelled`, until its LAST task has stopped (`RN-R30`).

| id | | Test owed by |
|---|---|---|
| `RN-R31` | **`driver.cancel({ actor, reason?, graceMs? })` cancels the run, and its promise resolves once every task it cancelled has stopped** — v0.18, [ADR 0104](../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md), P34 stop-and-asks (b), (c), (i) and (j). **In order**: (1) **refused by name, BEFORE anything is recorded or sent** — `RunControlRefused`, its `reason`: `unsupported` when the driver's scheduler has no `cancel` (the OPTIONAL member `SchedulerLike` gains, P34 (b)); `not-started` before `start()` or `resume()`, and on a driver whose resume was refused before it regenerated a run (one refused for a halt regenerated in its lost tail keeps that HALTED run, and is refused `halted`); `halted` after `OR-R10`; `cancelled` after `RN-R28`'s cancel; and `ended` when nothing is in flight and nothing is parked **AT REST** — so the run has finished. **Mid-step it is not refused** (W173's conformity reader, D-1): on the stack of the driver's own step — a consumer callback on a settlement's element, on `regionEntered` — a prefix with nothing in flight is the instant before the step dispatches more (P34 fact 3), so the call is accepted, the hold stops that dispatch, and the run reads `cancelled` — while a `graceMs` that is not a number throws `TypeError` and a negative one or `NaN` `RangeError`, the scheduler's own refusals, raised before it could raise them mid-cancel; (2) **the HOLD** (`RN-R29`) is shut for the run, and every region's collection is released (`JP-R12`'s run-level moment); (3) **ONE `cancelRequested` element** is appended (`RN-R30`); (4) **`scheduler.cancel(id, { reason, graceMs })`** — each key present only when the caller gave it — **for each task IN FLIGHT** (`RN-R21`'s set: dispatched, no settlement) that the scheduler has been handed; the task whose own `dispatched` element carried the call (`RN-R29` (i)) is cancelled right AFTER its hand-off, and a resumed run's in-flight tasks not yet handed on — the call raised on its `resumed` element, or on an element its REPLAY regenerated in the stored run's lost tail, while nothing is handed to the scheduler at all — are handed on and cancelled (`RN-R29` (4)), each once. **A parked task is not in flight and nothing is sent for it** — the scheduler cannot end it (P34 fact 8) — and a task a WORKER spawned is not this run's to cancel (P34 (j)). (5) **Every settlement after the element is APPENDED, routed nowhere and emits no region event**, and `resolve()` is refused. **A SECOND call** appends nothing and forwards its `graceMs` to each task still stopping — the scheduler's own escalation, *a shorter `graceMs` shortens the wait* — and resolves as the first does, once every task still stopping has stopped, a task not yet handed on included; it is never refused for the run having halted — its own request is a halt, and a refusal after it (`OR-R10`) does not refuse it either: it still forwards. **On a runtime** the per-run view forwards `cancel` to the runtime's scheduler (ADR 0088 rule 1), so `done` settles from the fold — `cancelled`, after the last settlement — and the run is RELEASED then and not before (ADR 0091 rule 1, unchanged). **A resume of its checkpoint is refused `cancelled`** at the element (`RN-R23`). **`graceMs: 0` is a REQUEST, not a guarantee**: at the scheduler pin it arms a 0 ms timer that a prompt worker's reply can beat (P34 fact 9, S12), so nothing here promises a forced stop. Test: at ladder L2, each refusal by its `reason`, and both `graceMs` refusals, with nothing appended and nothing sent; a cancel mid-fan-out with one task RUNNING, one WAITING (its `task.cancelled` fired inside the call), one PRE-PICKUP (`task.cancelling` and `task.cancelled` with no `task.running`, after the call), one in a retry BACKOFF (`task.cancelled` inside the call, no `task.cancelling`) and one PARKED (nothing sent): the element before every `task.cancelled`, `cancelling` until the last, `cancelled` at it, nothing dispatched, routed or emitted after the element, `resolve()` refused, and the promise resolved only after the last; a second cancel appending nothing and forwarding its `graceMs` to each task still stopping and to none that stopped; a cancel raised on a task's own `dispatched` element cancelling that task after its hand-off; a cancel raised on a resumed run's `resumed` element handing each in-flight task on and cancelling it; a run parked with nothing in flight reading `cancelled` at the element, and one with a task done and another parked; a cancel raised MID-STEP on a settlement's element and on a fan-out's `regionEntered`, accepted, nothing dispatched after it, `cancelled`; two cancels on a task's own `dispatched` element — one cancel sent after its hand-off, both resolving only once it stops; on the RUNNING road, a cancel raised on a task's own `dispatched` element and on a `resumed` element resolving only once the task stops; a cancel raised on a regenerated element of a resume's lost tail — nothing sent during the replay, one cancel after the hand-off; a second call after a later `OR-R10` halt still forwarding; the checkpoint refused `cancelled` at the element; and the fold of the driver's sequence twice, deep-equal (L3). Through `createRuntime`'s routing ([Q606](../doc/questions/q606.md)): a run cancelled by the scheduler alone (`RN-R28`), its `done` `cancelled` and the run released; and a run its owner cancelled, its `done` pending while one task is still stopping, then `cancelled` after the last settlement, equal to the caller's fold, and the run released | **[W173](../doc/work-items/w173-cancelling-a-run.md)** |
