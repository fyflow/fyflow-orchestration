# spec/task-id — the scheduler task id scheme

**Status:** v0.8 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md). **v0.2 acts on the W1 spec-conformity pass**:
section 2 point 3 was **wrong about the source** and is corrected (finding D7), `branchPath` is
pinned against convergent branches (B3), and the rules name the item owing their test (D8, N19).
**v0.3** points `ID-R1` at `OR-R10`: a refusal reached from a listener is reported, not thrown.
**v0.4 adds `ID-R3`** - [W5](../doc/work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md)'s
spec-conformity pass **measured** a driver serving two runs and found the second run's join never
fires and the two runs fold into one `RunState`. It is a rule about a run id, so it lives here with
`ID-R1` and `ID-R2` rather than with the fold.
**v0.7** is [W21](../doc/work-items/w21-the-branch-path-is-a-path.md) under
[P7](../doc/plans/p7-is-a-join-transitive-over-nested-fan-out.md): the dotted `branchPath` this
document reserved in P1 is **produced** for the first time, and section 1's *"a property of the
node"* becomes a statement about the code rather than about the result. The grammar is unchanged and
`parseTaskId` is unchanged; `buildTaskId` **widened** to accept a path.
**v0.5 is [W13](../doc/work-items/w13-one-driver-one-run-fixed-at-construction.md) under
[P4](../doc/plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md), and it changes three
rules and adds one.** [ADR 0022](../doc/decisions/0022-a-driver-takes-its-run-at-construction.md)
moves the run id to the **constructor**, so `ID-R2` is enforced there and `ID-R3` becomes *"`start()`
at most once"*. [ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
adds **`ID-R4`**, the inbound counterpart of `ID-R1`: a settlement carrying this driver's run id for a
task it never dispatched stops the run, and one carrying another run's id is ignored.
**Section 3's own prediction came true and is recorded rather than quietly dropped** — widening
`ID-R3` took `ID-R1`'s only direct test away, and the replacement was measured before the ADR was
written.
**v0.6 is [W18](../doc/work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md)
under [P6](../doc/plans/p6-what-may-share-a-scheduler-with-a-driver.md), and it RETIRES one of
`ID-R4`'s two preconditions rather than restating it.**
[ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
answers [Q86](../doc/open-questions.md): a task id that does not parse was minted by **no** driver, so
it is not this run's and stopping the run for it was collateral damage — one plain non-flow task
settling stopped every driver on a shared scheduler, on the very topology ADR 0023 blessed and
`AGENTS.md` section 9 recommends. **`ID-R5`** is the replacement and it is *reported* rather than
merely ignored. `ID-R4` itself is unchanged, and so is ADR 0023 rule 3's silence — section 3 says why
the two cases get different answers.
**And v0.5's prediction repeated itself one rule out**: retiring the refusal took away the only
inbound vehicle whose task id carries **no run id**, which is what made *"the failure names THIS
driver's run"* falsifiable. The discrimination moved to `ID-R5`'s own test rather than being dropped,
and `test/driver/lifetime.test.ts` records the substitution in place.
**v0.8** is [W32](../doc/work-items/w32-what-a-map-fanout-is.md) under
[P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md), and it is **the version this document's
own argument was written for.** [ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
answers [Q12](../doc/open-questions.md): fan-out is two features over one region, and a `map` opens a
region whose arity is known only at run time. **The GRAMMAR is unchanged, `parseTaskId` is unchanged
and `buildTaskId`'s signature is unchanged** — measured before anything was written: indices
`0 … 1_000_000` round-trip with **0** failures, the nested forms round-trip, and **500 indices for
one node mint 500 distinct strings**. So none of the *"every fixture, every log line and every test
name"* cost this section spends its argument on is paid. **What v0.8 changes is section 1's own
heading**: inside a `map` region a branch index is a property of the **dispatch**, and `ID-R6` is the
refusal that keeps a derivation from guessing one.
**Normative.** Answers [Q13](../doc/open-questions.md).
**This is a correctness rule, not a naming convention.** Section 2 is why.

---

## 1. The scheme

```
<runId> ":" <nodeId> ":" <branchPath> ":" <attempt>
```

Four segments, **always four**, joined by `:`.

| segment | grammar | |
|---|---|---|
| `runId` | `^[A-Za-z0-9_-]{1,64}$` | one workload's journey. Allocated by the driver at run creation |
| `nodeId` | `^[A-Za-z0-9_-]{1,64}$` | the definition's node id, enforced by `FD-V16` |
| `branchPath` | `-`, or `^(0\|[1-9][0-9]*)(\.(0\|[1-9][0-9]*))*$` | `-` when the node has **no unique enclosing region** — which is a node in none, and, since v0.7, an `end` node shared by two SIBLING regions (`spec/flow-definition.md` section 4). Otherwise the branch indices of the enclosing regions, outermost first |
| `attempt` | `^(0\|[1-9][0-9]*)$` | the **flow-level** attempt. `0` on first dispatch |

```
r7c1f:score:-:0          a node outside any region
r7c1f:scoreB:1:0         branch 1 of the enclosing fan-out
r7c1f:scoreB:1.0:0       reserved shape: branch 0 of a fan-out nested inside branch 1
```

**Fixed arity is the point.** With optional segments `r7c1f:score` and `r7c1f:score:-:0` are
different strings naming the same dispatch, and a fold that keys on the string counts them twice.
Four segments always, and the parse is `split(':')` asserting length 4.

**The parse is total.** `:` and `.` are outside the `runId`/`nodeId` charset, so no segment can
contain a delimiter and no id is ambiguous. A driver that built an id can always take it apart
again, which is what lets an outcome record carry the id alone
([spec/outcome-record.md](outcome-record.md)) and derive everything else.

### `branchPath` is a property of the node inside a `fanout` region, and of the DISPATCH inside a `map` one

> **This heading read *"`branchPath` is a property of the node"*, full stop, from P1 until v0.8, and
> [W21](../doc/work-items/w21-the-branch-path-is-a-path.md) made it true of the code one plan before
> it stopped being true of the library.** It is **corrected rather than deleted**: it remains exactly
> right about the static feature, which is the only feature that existed when it was written, and
> `FD-V19` remains exactly the rule that makes it so. What v0.8 adds is a second feature the sentence
> was never about —
> [ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md),
> answering [Q12](../doc/open-questions.md). **`FD-V19` is not weakened by any of it**, and neither is
> [Q27](../doc/open-questions.md): a `map` declares one branch, so *"two distinct branch entries"* has
> no instance inside one — measured as `0` pairs iterated.

**Everything in the rest of this subsection is about a `fanout` region.** The map half is one
paragraph and it is at the end.

**Since v0.7 the library computes it that way.** Until
[W21](../doc/work-items/w21-the-branch-path-is-a-path.md) the driver **threaded** a path through
its traversal and this section described the result rather than the mechanism — which was
indistinguishable while the two agreed and stopped being so the moment nested fan-out became
expressible, because the threading discarded the outer prefix. **A node's path is now derived from
the graph**: its innermost region's branch index, prefixed by the path of that region's own
`fanout`, terminating at a node in no region. There is no carried value that can disagree with it.

*(`spec/flow-definition.md` section 4 is where "innermost" is defined, and it is also where the one
node kind with **no** derivable path lives: an `end` node shared by two sibling regions is in
neither exclusively, and `-` is what it gets — the same answer as a node in no region, for the same
reason.)*

A node's branch index is written as though it were a static property, and it only is because
`FD-V19` refuses convergent branches: no two branch entries of one fanout may have overlapping
reach, and no branch entry may be reachable from another.

Without that rule, `branches: ["a", "b"]` with `a → c` and `b → c` passes every other refusal, and
`c`'s "enclosing branch index" is a property of **the traversal that got there**, not of `c`. Two
implementers then diverge without either breaking a rule: one dispatches `c` once and the join sees
one arrival where two branches converged; the other dispatches `r:c:0:0` and `r:c:1:0` and the join
sees two. **Whether convergence should be allowed at all is [Q27](../doc/open-questions.md)**;
answering it means deciding whether a shared node runs once or once per branch, which is close
enough to map-style fan-out ([Q12](../doc/open-questions.md)) that P1 refuses it rather than
guessing.

**The map half — v0.8, and it is one paragraph because the grammar carries it.** A `map` region has
**one** branch and a run opens N instances of it, so a mapped node's segment is the **item index**
and there is nothing in the graph to derive it from. `branchPathOf` takes the region sets and a node
id and no run-time input; **measured before this was written, it answers `"0"` for the mapped entry
and `"0"` for every node behind it in the same branch subgraph**, so N dispatches would mint one
distinct id and the second would hit `ID-R1`. The segment's **grammar is unchanged** — an item index
is an index — so `r7c1f:score:137:0` and the nested `r7c1f:score:1.137:0` are the shapes P1 reserved
at an arity P1 did not have. What changes is who supplies the number: **the run, not the graph**, and
`ID-R6` below is the refusal that stops a derivation inventing one.

### Why the two forward-looking segments existed, and what happened to them

Both were out of P1's scope and both were in the format anyway, because an id format change is a
change to every fixture, every log line and every test name written before it.

**That argument was tested by the thing it was written for, and it held for the format and not for
everything.** `FD-V15` was retired in `spec/flow-definition.md` v0.7 and `branchPath`'s dotted half
became reachable in the same plan. **The grammar did not change and `parseTaskId` did not change**,
which is the half the P1 argument was about — an id *format* change would have touched every fixture,
log line and test name, and none of that happened. `buildTaskId` **widened** to express what
`parseTaskId` could always accept: `number | null` became
`number | readonly number[] | null`, so every caller written against the old shape still compiles.
`branchIndices` was its inverse from the beginning and had no partner until W21.

**Two things did move, and the first draft of this paragraph said nothing did.** *(W21's conformity
reader.)* **Four assertions** changed, in `test/driver/surface.test.ts`, because they settled
`r1:scoreC:0:0` and a node two deep now mints `r1:scoreC:1.0:0` — they were written against an id
this item corrected, which is the clearest statement of what it changed rather than a cost. And the
**scalar form's runtime behaviour is not identical**: `buildTaskId('r','n',-1)` returned
`r:n:-1:0` and now refuses, as does a non-integer. **Widening the TYPE is not leaving the BEHAVIOUR
alone**, and the two new refusals are an improvement rather than a regression — but a document that
claimed both were unchanged was wrong about the second.

- **`branchPath` is a path, not an index.** P1 only emits `-` or a single index — nested fan-out is
  refused by `FD-V15` ([Q6](../doc/open-questions.md)) and map-style fan-out is out of scope
  ([Q12](../doc/open-questions.md)). **Both halves of that sentence are now history.** `FD-V15` was
  retired by [W20](../doc/work-items/w20-what-a-nested-region-is.md), so a nested fan-out is a valid
  definition; and [W21](../doc/work-items/w21-the-branch-path-is-a-path.md) made `buildTaskId` able
  to emit the path, so P1's *"only `-` or a single index"* is a statement about P1 rather than about
  the library. ~~**Map-style fan-out is still out of scope**~~ — **that half is now history too, at v0.8.**
  [ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
  answers [Q12](../doc/open-questions.md) and a `map` is a node kind. **The prediction this bullet
  made was correct and is recorded rather than quietly dropped**: *"the dotted path admits it without
  touching the grammar, which is what this bullet was for"* — and it does. Measured at
  [W32](../doc/work-items/w32-what-a-map-fanout-is.md): **no format change, no `parseTaskId` change
  and no `buildTaskId` signature change.** Both of the two things P1 held this segment open for have
  now arrived, and neither cost the format anything.
- **`attempt` counts flow-level retries only** ([Q16](../doc/open-questions.md)), and P1 always
  emits `0`. It is **not** the scheduler's retry count: `retryPolicy` retries happen *inside* one
  scheduler task and are reported on that task's `attempts` field
  (`../fyflow-scheduler/core/FyflowScheduler.ts:869-886`, and `AGENTS.md` section 5 —
  *"`stats.failed` counts tasks that failed... a task with retries counts once"*). Two retry
  counters exist; this segment is ours, and conflating them is what Q16 is about.

  **A resolution does not increment it.** Resuming a suspended node
  ([spec/outcome-record.md](outcome-record.md) section 5) supplies an outcome for the dispatch that
  already happened; it does not re-dispatch, so no new id is minted (`RS-R2`,
  [Q28](../doc/open-questions.md)).

## 2. Why a collision corrupts a run

`AGENTS.md` section 5 records this as one line — *"Must be unique; reusing an id overwrites"* — and
the one line understates it. Read in the source at **0.3.0**:

1. **`addTask` overwrites the map entry and queues the new task alongside the old one.**
   `core/FyflowScheduler.ts:444-445` — `this.tasks.set(task.id, task)` then
   `workerQueue.push(task)`. Nothing is removed. Two task objects now sit in the ready queue under
   one id, and **both will run.**
2. **Every pool listener resolves the task by id**, so events about the first execution are
   dispatched carrying the *second* object: `core/FyflowScheduler.ts:1421` (`task.running`), `:1514`
   (`task.completed`, which writes the first execution's `executionTime` onto the second task),
   `:1533` (`task.failed`, which settles the second object on the first's failure).
3. **The success path does not go through the map at all.** `_dispatchTask` closes over the task
   object and calls `_onTaskComplete(task, …)` from the pool promise
   (`core/FyflowScheduler.ts:723-727`), and `_settling` is a per-object field (`:819`, declared
   `:94`). So on the happy path **each object settles on its own outcome and two `task.completed`
   events fire, both carrying `detail.id` equal to the same string.**

So a collision does not lose one task quietly. It produces **two outcome records under one key**,
one of them carrying the other execution's `executionTime`, plus a `task.running` for a task that
never started — and `scheduler.tasks.get(id)` shows a single well-formed terminal task the whole
time. There is no diagnostic anywhere in that sequence.

**Two records under one key is a direct contradiction of `OR-R3`** — one record per settlement — at
the level of the log rather than the listener. A fold keying on `taskId` cannot repair it, because
neither record is wrong on its own.

> **v0.1 of this document claimed the opposite** — that `_settling` meant one record was written and
> the second execution vanished. That was an inference from points 1 and 2, which are correct, and
> it did not survive reading the success path. The corruption is real either way and `ID-R1` is
> unchanged; the observable is not what was written down, and it was propagated into
> [Q13](../doc/open-questions.md)'s resolution before the spec-conformity pass caught it.

**This is why the scheme is normative and why `ID-R1` exists.** A format alone prevents nothing.

## 3. Runtime refusals

Not expressible as an example definition, so each names the test that must exist. That coverage is
the owning item's gate; **W1's L0 does not check it**
([W1](../doc/work-items/w1-the-normative-layer.md), *Verification*).

| id | The run terminates when | Test owed by |
|---|---|---|
| `ID-R1` | the driver is about to dispatch a task id already in the run's dispatched-id set. `addTask` is **not** called; the run fails with `DuplicateTaskId` naming the id, **reported** rather than thrown when it is reached from a listener (`OR-R10`). Test: a driver driven to repeat an id, asserting the refusal and asserting the scheduler received nothing | W3 |
| `ID-R2` | a `runId` does not match its charset. Node ids are covered by `FD-V16` at instantiation; this is the half the definition cannot check. **Enforced in the `Driver` CONSTRUCTOR** (ADR 0022 rule 3), throwing `InvalidRunId` before the definition is validated and before anything is queued — a run id is configuration, and ADR 0002 rule 3's *"validate in full before anything is queued"* applies one level out. Test: construction with a `runId` containing `:`, asserting the refusal and that the scheduler received nothing | W3, **restated by W13** |
| `ID-R3` | **a driver is asked to `start()` a second time.** A driver serves exactly one run and takes its id at construction (ADR 0022 rules 1-2), so there is no second id to name: **any** second `start` is refused. `start` **throws** `MultipleRuns` rather than reporting — nothing has been appended, so there is no run to fail, and the caller is on the stack. Test: `start` twice, asserting the refusal, that the scheduler received nothing for the second, and that the run's state is unchanged | **W5**, widened by **W13** |
| `ID-R4` | **a settlement arrives carrying this driver's run id for a task it never dispatched.** **Ownership is decided from the task id ALONE, before anything else reads the event detail** - `normalizeEvent` can raise `OR-R6` while copying `result`, and a guard placed after it let ANOTHER run's uncloneable result stop this run ([ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) *Correction* 1). The inbound counterpart of `ID-R1`, and `dispatched` is the same set both are asserted against. The run fails with `UndispatchedTask` naming the id, **reported** rather than thrown (`OR-R10`), and **nothing is appended** — the record is refused before it enters the sequence, for the reason `ID-R1` refuses before `addTask`. A settlement for **another** run's id is **ignored silently and is not a refusal** (ADR 0023 rule 3). Test: three ids under our own run — a node never dispatched, a node not in the definition, a branch path never opened — each asserting the refusal and an empty log; plus one under another run id asserting silence, each in **all three terminal states** - a guard the fixtures only exercise in one state can be conditioned on the state. **One precondition, stated rather than assumed:** run ids are unique across the drivers sharing one scheduler (two drivers on one run id mint the same task ids, so `dispatched.has()` is true in both and this rule cannot see the collision - [Q87](../doc/open-questions.md)). **The other precondition is retired**: *"every task on the driver's scheduler carries an id some driver minted"* was v0.5's first, and [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) replaces it with `ID-R5` below rather than leaving it a claim about code the flow author does not own | **W13**, precondition retired by **W18** |
| `ID-R6` | **the driver is about to mint a task id for a node inside a `map` region and has no item index for that region.** A map's branch index is a property of the **dispatch**, not of the node (section 1), so `branchPathOf` takes an optional item index **per region** and **refuses rather than returning the region's declared index**. It throws `UnresolvedBranchPath` naming the node and the map. **The alternative is measured rather than argued**: returning the derived value mints `r1:x:0:0` for every dispatch, and the run then dies at `ID-R1` naming a **duplicate** — the symptom, in a run whose real defect is a missing index. This is the map's counterpart of `ID-R1`'s own reasoning: *a duplicate means the definition validator or the driver's path bookkeeping is wrong*, and here the bookkeeping is nameable before the collision. **It THROWS**, and the reason is that it is a CALLER error rather than a run event: `branchPathOf` is a pure derivation over the region sets, nothing has been appended when it fires, and there is no run to fail. **A driver reaching it from a listener must convert it**, exactly as it converts every other refusal that would otherwise cross the `OR-R10` boundary — `src/driver/driver.ts`'s `pathOf` is called from `dispatch`, reached from `enter`, reached from the listener, so it is squarely on that path and W33 owns the conversion. *(An earlier wording gave the reason as *"it is reached while building an id and **not from a listener**"*, which is false about the only `src/` caller. It was unreachable at W32 only because the driver had no `map` arm at all — correct-and-unreached for the wrong reason. W32's conformity reader.)* **Two conditions, not one.** The second is that an index **is** supplied and is not a `branchPath` segment — `-1`, `1.5`, `NaN`, `1e21` — which is refused where the number ENTERS rather than four frames later inside `buildTaskId`, so the message names the map rather than the id. `1e21` is the case W21's conformity reader found in `buildTaskId`: `Number.isInteger(1e21)` is true and `String(1e21)` is `"1e+21"`, which section 1's grammar refuses, so a type test is not the predicate. Test: a map region's node asked for a path with no index, asserting the refusal and that it names both the node and the map; the same node **with** an index, asserting the path; **each of the four malformed indices, asserting the second condition**; a node in a `fanout` region asked with no index, asserting it is unaffected; and a map nested inside a `fanout`, asserting the outer prefix is still derived and only the inner segment needs supplying | **W32** at the derivation layer, **[W33](../doc/work-items/w33-a-map-at-run-time-arity.md)** at the dispatch layer |

### `ID-R5` — an inbound id no driver minted is reported and dropped

**Not in the table above, because it is the one inbound case that does *not* terminate the run.**
[ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md),
answering [Q86](../doc/open-questions.md).

| id | | Test owed by |
|---|---|---|
| `ID-R5` | **A settlement whose task id does not parse was minted by no driver. It is reported through `onUnmintedTask` and dropped, and it does not stop the run.** This is decided **before** `ID-R4`'s two tiers, because both compare a run id and an unparseable id has none. The report carries this driver's `runId`, the scheduler event's name, `detail.id` **uncoerced**, and a `reason` describing **what arrived** — `parseTaskId`'s own message when there was a string id, and an explicit *"carried no string `id`"* when there was not, because the parser is handed `''` in that case and its message would otherwise describe our substitution; nothing is appended, nothing is dispatched, and no `FoldInput` carries the offending string — the fold parses every id it is given (`src/fold/run-state.ts`), so a new input kind would make `fold()` throw. Test: a foreign id delivered in **all three terminal states**, asserting no `RunFailure`, an empty log, and that a legitimate settlement afterwards still routes; a `detail` with **no `id` field**, asserting the report carries `undefined` rather than `''` and a `reason` that names the absence rather than quoting the stand-in, with the converse pinned separately; two drivers on one scheduler, asserting both survive one foreign task and each reports under its own run id; and a settlement for another run's *parseable* id, asserting it reaches `onUnmintedTask` **not at all** | **W18** |

**Why the report and the silence are not the same decision.** `ID-R4` tier 1 drops another run's
settlement in silence because **the driver that owns that run will report it** — with two drivers on
one scheduler that is the normal case, and a refusal on the normal case is noise (ADR 0023 rule 3,
unchanged). An unparseable id is owned by **no** run, so silence there means nobody reports it ever.
That asymmetry is the whole of ADR 0027 and it is why one case gets a channel and the other does not.

**Why *reported* rather than merely *ignored*.** The inference behind this rule — `buildTaskId` emits
only four-segment ids in the `ID-R2`/`FD-V16` charsets, so an id that fails the parse cannot be ours
— is sound about **today's** scheduler and about nothing else. The one way it fails is a `detail`
whose `id` stopped being what we dispatched, which is not hypothetical: `task.progress`'s detail
changed shape at 0.3.0 and a 0.2.1 consumer reading `detail.taskId` silently got `undefined`
(`CLAUDE.md`). Under a bare *ignore* that is a run that hangs with nothing said. The callback is the
whole of the difference and it is why `ID-R5` is not one line.

### `ID-R3` — why one run per driver, and what it costs

**Measured, not reasoned.** A driver's `inputs` (the fold's sequence, ADR 0014), its `firedJoins`
latch and its per-region policy state carry **no run id** — they are keyed per driver, or per
`fanoutId`. `failedRuns` and `hasFailed(runId)` are keyed by run, which is what made a second run
look supported. Two runs of `fanout-join` on one driver:

| | |
|---|---|
| the second run's join | **never fires** — `firedJoins.has('split')` is already `true` from the first, so `settleJoin` returns before asking the policy |
| `fold(driver.foldInputs())` | returns **one** `RunState`, labelled with the **first** run's id, holding both runs' nodes |
| its outcome | **`completed`** — because region `split` carries `joined: true` from the first run |

That last cell is character-for-character the false statement
[ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) exists to remove,
reachable through the driver's own declared surface.

**v0.4 made this rule deliberately narrow, and v0.5 widened it. The narrowness had a stated price
and the price came due, which is why this passage is rewritten rather than replaced.** v0.4 said:

> *"Only a **different** run id is refused. A second `start` with the **same** id falls through to
> `ID-R1`, which refuses the entry node's redispatch. Widening `ID-R3` to cover it would take away
> `ID-R1`'s only direct test — W3 provokes a duplicate dispatch by starting the same run twice —
> which trades a tested rule for an untested one."*

[ADR 0022](../doc/decisions/0022-a-driver-takes-its-run-at-construction.md) moves the run id to the
constructor, so *"a second `start` with the same id"* is the only kind of second `start` there is and
`ID-R3` must cover it. **The prediction was correct and the trade was refused rather than paid:
`ID-R1`'s replacement provocation was measured before ADR 0022 was written.**

| | |
|---|---|
| what W3 used | `driver.start('r1', {})` twice — the second `enter` redispatches the entry node, and `ID-R1` **throws** |
| what replaces it | **the same settlement delivered twice.** The second delivery routes again and `ID-R1` refuses the *successor's* redispatch — **reported** through `onRunFailure`, not thrown, because it is reached from a listener (`OR-R10`) |
| why it is not weaker | it exercises `ID-R1` on the path a real scheduler could reach, rather than on one only a caller could. The thrown form was never the one `OR-R10` describes |

**A rule may take another rule's test away. It may not take it away silently**, which is what this
table exists to prevent on the next occasion.

**What `ID-R3` did not fix, and it was the more interesting half — now fixed.** `Driver.start` took a
run id per call, `failedRuns` was a **set**, and `hasFailed(runId)` was public: three shapes that only
made sense if a driver served many runs. That was [Q53](../doc/open-questions.md), and
[ADR 0022](../doc/decisions/0022-a-driver-takes-its-run-at-construction.md) closes it — `runId` is a
constructor option, `start(payload)` takes the payload alone, and `hasFailed()` takes no argument.

**And the half neither rule reached at all: `ID-R3` binds a *driver*, not a *scheduler*.** Two
drivers sharing one scheduler each received the other's settlements and dispatched the other's
successors — the two-outcomes-under-one-key corruption section 2 describes, produced by following
`MultipleRuns`' own advice. That was [Q72](../doc/open-questions.md), and
[ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
closes it with `ID-R4` rather than with a rule about schedulers, which `SchedulerLike` could not
express.

> **v0.8 — this argument no longer covers every node, and the gap is a `map` region.** Everything
> below is a closed argument from three VALIDATOR rules, and for a mapped node uniqueness does not
> follow from the validator at all: `FD-V19` has **no instance** inside a map region (one branch, so
> *"two distinct branch entries"* has none — measured as 0 pairs), and a map is precisely the case
> where one node yields N triples in one run. **What makes them distinct is the RUN supplying
> distinct item indices**, which is section 1's *"who supplies the number: the run, not the graph"*
> and which `ID-R6` refuses to guess. So for a node in a `fanout` region the triple is unique
> **by construction** and `ID-R1` asserts that the argument held; for a node in a `map` region the
> triple is unique **by the driver's bookkeeping** and `ID-R1` is the only thing that checks it.
> `ID-R1` therefore does more work at v0.8 than it did at v0.7, and it is unchanged because it
> already did the right thing. *(W32's conformity reader: the paragraph below was left standing when
> section 1's heading was corrected, one section further up.
> `spec/flow-definition.md`'s *"`FD-V22` is what makes `ID-R1`'s soundness argument true"* rider
> inherits the same premise and carries the same note.)*

**`ID-R1` is a refusal rather than a guard because the collision should be impossible.**
`FD-V10` forbids cycles, ~~`FD-V15` forbids nested fan-out~~ — **retired by
[W20](../doc/work-items/w20-what-a-nested-region-is.md), and the argument is restated below rather
than left resting on it** — and **`FD-V19` forbids convergent
branches** — so within one run a `(nodeId, branchPath, attempt)` triple can be produced at most
once. `FD-V13` is what keeps a node from being reachable from two different regions. `ID-R1` is the
assertion that the argument held: a duplicate means the definition validator or the driver's path
bookkeeping is wrong, and continuing past it corrupts the run in the way section 2 describes.

**The driver holds the dispatched-id set, not the scheduler.** Asking `scheduler.tasks.has(id)` is
not a substitute: `maxCompletedTasks` evicts terminal tasks with no event
(`core/FyflowScheduler.ts:1605`, `_recordTerminalTask`), so the scheduler's answer is *"not any
more"* rather than *"never"*.
