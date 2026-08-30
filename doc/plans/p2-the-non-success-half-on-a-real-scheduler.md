# P2 — The non-success half, on a real scheduler

**Status:** in progress — W6 declared
**Question this plan answers:** *Does the non-success half of a flow — a failure that **routes**, a
human resolving a suspended branch, and a refusal that stops a run — behave on a real scheduler the
way the fixtures say?*
**Exit artifact:** three more ladder-L6 rows, and the run-state outcomes **`awaiting_action`** and
**`stopped`** reached on real workers for the first time.
**Reserves:** W6-W8, Q61-Q70, ADR 0016-0018

---

## Why this plan, and why now

[P1](p1-what-satisfies-a-join.md) answered what satisfies a join and proved it end to end. What it
proved end to end is the **success** half: of `spec/run-state.md`'s six outcomes, ladder L6 reaches
`completed`, `failed` and `stuck`. It reaches **`awaiting_action` and `stopped` not at all**, and of
`spec/join-policy.md`'s six region events it reaches four — `branch.suspended` and `branch.resumed`
have never occurred outside a fixture.

That matters here more than it would elsewhere, because **this repository's record is that
fixtures-versus-reality is exactly where it has been wrong**:

- W4's fake scheduler emitted a settlement the real library **cannot produce** — `terminalState:
  'failed'` for a non-optional task — and three mutations survived the whole suite because of it.
- `AGENTS.md` section 3 says a Node worker must be JavaScript. False at Node 24.
- The sibling's own published TypeScript cannot be loaded by Node at all.

Each was found the moment something real was run, and never before. **The non-success half is the
largest remaining body of behaviour that only fixtures have ever seen.**

## Two facts were measured before this plan was written, and both changed it

The [ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
pattern: settle the load-bearing fact first, because a plan built on a belief is a plan that finds
out late.

**1. `user_action` is reachable, and [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
rule 2 is confirmed against behaviour for the first time.** A non-optional task with no
`retryPolicy` whose worker throws produces, in order:

```
task.running      state: running
task.failed       state: user_action     <-- the event that lies about its own name
task.user_action  state: user_action
```

and an **optional** task in the same pool produces one `task.failed` with `state: 'failed'`. That is
exactly what ADR 0007 rule 2 says, and until now the rule was **read out of
`core/FyflowScheduler.ts` and never observed**. Every test of it in this repository drives a fake
that was written from the same reading.

**This lowers the plan's stakes and is recorded rather than hidden.** The single most likely surprise
was that the pairing did not behave as read; it does. What is left is whether *our* handling of it
works on a real run, which is a weaker question and still an unanswered one.

**2. `OR-R6` is reachable from an inline pool and NOT from a thread pool** — and nothing said so.
Measured with a worker returning `{ fn: () => 1 }`:

| pool | what happens |
|---|---|
| `inline: true` | the result reaches the driver **intact** (`typeof result.fn === 'function'`), and our `structuredClone` at the listener boundary is what refuses it — `OR-R6`, `onRunFailure`, run `stopped` |
| `inline: false` | **the scheduler refuses it first.** The value cannot cross the worker boundary, so the task ends `user_action` with *"() => 1 could not be cloned"* and no result ever reaches us |

So the same worker bug produces **two different failures** depending on a pool option the flow author
does not control, and `OR-R6` can only be exercised inline. Neither `spec/outcome-record.md` nor
ADR 0007 says this. It is [Q61](../open-questions.md), and it sets the refusal row's shape.

## Scope

**In**

1. **A failure that ROUTES** — `on: ["failed"]`, the one definition feature no L6 flow reaches. It is
   ADR 0004's central mechanism and the case `spec/run-state.md` section 3 uses to define `completed`
   against `failed`: an `optional` node fails, takes its failure edge to an `end`, and the run is
   **`completed`**. W2's conformity pass found the code got that exact case wrong.
2. **A human resolving a suspended branch** — `user_action` → `branch.suspended` →
   `awaiting_action` → `Driver.resolve()` → `branch.resumed` → the branch arrives and the join
   fires. This is ADR 0004 rules 3-6, `RS-R1`-`RS-R3`, and **the only inbound API the library has**.
3. **A refusal that stops a run**, inline per fact 2 above: `OR-R6` at the listener boundary,
   reaching `onRunFailure` and folding to **`stopped`**.

**Out** — named rather than left implicit

- **New features.** P2 adds no capability. Every rule it exercises is already specified and already
  implemented; what is missing is evidence from a real scheduler.
- **[Q24](../open-questions.md), [Q6](../open-questions.md), [Q12](../open-questions.md)** — the
  policy refinements, nested fan-out and map-style fan-out. Each is its own plan; this one is
  deliberately not a feature plan.
- **The browser at L6** ([Q52](../open-questions.md)) — unchanged and still open.
- **[Q53](../open-questions.md)** — narrowing `Driver`'s multi-run surface. It is W3's public API and
  it is not what this plan is about.
- **A second `spec/` example flow.** Whether `spec/examples/` should carry behaviour fixtures is
  [Q44](../open-questions.md), which now has two occurrences and is not settled by adding a third.

## The known design problem, stated before it is hit

**A suspended run never finishes, and the L6 harness resolves on *finished*.** `RN-R12` makes
`awaiting_action` explicitly **non**-terminal — correctly, because a run waiting on a person is not
over — so `examples/run-flow.ts` will wait for its backstop and report a failure. The harness needs
an inbound step: a row must be able to say *"when branch 1 suspends, resolve it"*.

That is a change to W5's harness rather than to `src/`, and it is the one piece of design in this
plan. It is named here so it is not discovered halfway through.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W6 | The three rows, and the harness's inbound step | `examples/**` | P1 complete | L0-L6 — L0-L5 in all five runtimes, L6 in Node and Deno; then two readers |

W7 and W8 are reserved and unallocated. If W6 turns out to be three items rather than one, they are
there; if it does not, they are skipped and never reissued.

## Record

*Filled in at the join.*

**Exit artifact.**

**What the plan answered.**

**Retro.** *`doc/workflow.md` section 6 pass 3 — now v0.3, and P2 is the first plan to run it as
amended. The four changes P1 adopted are the ones to judge: the Outputs table, two readers,
negative-testing a check at birth, and section 7 rule 2's concurrent-items scoping.*
