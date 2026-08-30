# spec/task-id — the scheduler task id scheme

**Status:** v0.2 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md). **v0.2 acts on the W1 spec-conformity pass**:
section 2 point 3 was **wrong about the source** and is corrected (finding D7), `branchPath` is
pinned against convergent branches (B3), and the rules name the item owing their test (D8, N19).
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
| `branchPath` | `-`, or `^(0\|[1-9][0-9]*)(\.(0\|[1-9][0-9]*))*$` | `-` when the node is in no fan-out region. Otherwise the branch indices of the enclosing regions, outermost first |
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

### `branchPath` is a property of the node, and `FD-V19` is what makes that true

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

### Why the two forward-looking segments exist now

Both are out of P1's scope and both are in the format anyway, because an id format change is a
change to every fixture, every log line and every test name written before it.

- **`branchPath` is a path, not an index.** P1 only emits `-` or a single index — nested fan-out is
  refused by `FD-V15` ([Q6](../doc/open-questions.md)) and map-style fan-out is out of scope
  ([Q12](../doc/open-questions.md)). A dotted path admits both without touching the grammar.
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
| `ID-R1` | the driver is about to dispatch a task id already in the run's dispatched-id set. `addTask` is **not** called; the run fails with `DuplicateTaskId` naming the id. Test: a driver driven to repeat an id, asserting the refusal and asserting the scheduler received nothing | W3 |
| `ID-R2` | a `runId` does not match its charset at run creation. Node ids are covered by `FD-V16` at instantiation; this is the half the definition cannot check. Test: run creation with a `runId` containing `:`, asserting the refusal | W3 |

**`ID-R1` is a refusal rather than a guard because the collision should be impossible.**
`FD-V10` forbids cycles, `FD-V15` forbids nested fan-out, and **`FD-V19` forbids convergent
branches** — so within one run a `(nodeId, branchPath, attempt)` triple can be produced at most
once. `FD-V13` is what keeps a node from being reachable from two different regions. `ID-R1` is the
assertion that the argument held: a duplicate means the definition validator or the driver's path
bookkeeping is wrong, and continuing past it corrupts the run in the way section 2 describes.

**The driver holds the dispatched-id set, not the scheduler.** Asking `scheduler.tasks.has(id)` is
not a substitute: `maxCompletedTasks` evicts terminal tasks with no event
(`core/FyflowScheduler.ts:1605`, `_recordTerminalTask`), so the scheduler's answer is *"not any
more"* rather than *"never"*.
