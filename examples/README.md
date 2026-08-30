# examples — ladder L6, the only code here that touches a real scheduler

Owned by [W5](../doc/work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md). **Not published** — neither `package.json`'s `files`
(which ships `dist/**` only) nor `deno.json`'s publish allowlist includes this directory.

```bash
npm run test:l6         # Node 24
npm run test:l6:deno    # Deno
```

Both print the same table and run the same 118 assertions. `RT-R10`: **L6 runs in Node and
Deno and not in the browser** — [Q33](../doc/open-questions.md), and the browser half is
[Q52](../doc/open-questions.md).

## What is here

| | |
|---|---|
| [`l6.ts`](l6.ts) | **the gate.** Eight real runs — three flows × both join policies, with two entry payloads on the routed-away flow — every expected value written by hand from `spec/` before anything ran |
| [`run-flow.ts`](run-flow.ts) | one run: build the scheduler, drive the flow, fold the driver's input sequence, return a report |
| [`workers/flow-worker.ts`](workers/flow-worker.ts) | **one worker file for both runtimes**, four roles selected by the pool's `config` — one of which always throws |
| [`flows/`](flows/) | the one flow this gate needs that `spec/examples/` cannot express ([Q44](../doc/open-questions.md)) |
| [`deno-import-map.json`](deno-import-map.json) | how Deno resolves the bare `fyflow-scheduler` specifier — [ADR 0013](../doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) rule 3 |

## Three things a reader should not have to rediscover

**1. `fyflow-scheduler` 0.3.0 is on no registry, and the two runtimes reach it differently.**
npm has `fyflow-scheduler` and JSR has `@fyflow/scheduler`, and **both stop at 0.2.1** — so the pin
comes from the working tree next door. Node reads its `dist/` build; Deno reads its TypeScript
source, because **Node cannot** (`core/threadWrapper.ts:5` value-imports an `interface`, which type
stripping cannot erase — [S9](../doc/scheduler-upstream.md)). `npm run check:scheduler` is what stops
the two runtimes silently running different versions. All of this is ADR 0013, and none of it is
visible to a consumer: the published library depends on the scheduler **not at all**.

**2. How a run is known to be over, with no clock.** The three obvious answers are wrong:
`scheduler.completed` fires **every time the scheduler drains**, `stats` reads `queued=0 running=0`
for a scheduler that is genuinely stalled, and a `setTimeout` is how a green L6 gets written that
proves nothing. So the harness folds the driver's own input sequence as it arrives
([ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)) and stops
when the **run-state outcome** leaves `running` and `awaiting_action` (`RN-R12`). That is decidable,
and it is this repository's central invariant applied to a real run for the first time.

**Read at a quiescent point, never mid-turn**, and the qualification is load-bearing: the driver
appends a settlement *before* the routing it causes, so most prefixes of a run are not resting
states and several of them report a terminal outcome for a run that is not over
(`spec/run-state.md` section 3). `queueMicrotask` is the boundary. `RunReport.finishedBy` records
**which** of the predicate and the backstop ended the wait, and every row asserts it was the
predicate — without that, replacing the whole mechanism with a 1 ms timer passes every other
assertion, because `scheduler.shutdown()` drains the run before the report is read.

The wall-clock backstop in `run-flow.ts` is **not** how a run is detected. Reaching it is a failure.

**3. Why there are eight runs and not one.** P1's exit artifact is *"the branch-routed-away case as an
executable test, run against both policies, plus one real fan-out flow completing on a real
scheduler"*. The control rows exist so the comparison has a baseline; the high-confidence rows exist
so `isLowConfidence` is a predicate that can return **both** answers, rather than a constant nothing
would notice was stuck at `true`.

The last four rows are the ones to look at, and they are ADR 0003's **two** mechanisms:

| | `live-token` | `arrival-count` |
|---|---|---|
| `p1-routed-away`, low confidence — *a decision routes a branch away* | `completed` — 4 tasks | **`stuck`** — 3 tasks |
| `optional-loss` — *an `optional` task simply fails* | `failed` — 4 tasks | **`stuck`** — 3 tasks |

The second is the one ADR 0003 calls ordinary: **no decision, no routing away, just a task that
failed**, and arrival-counting hangs anyway. `optional-loss` is defined in
[`flows/`](flows/optional-loss.flow.json) rather than in the corpus because the corpus cannot express
an `optional` branch node with no `on: ["failed"]` edge — [Q44](../doc/open-questions.md), and this
is its second occurrence.

In both `arrival-count` rows the join's successor is **never dispatched**: `N` is fixed at two and
only one branch ever arrives, so the join waits forever with nothing queued and nothing running.
That is ADR 0003's matrix executed rather than simulated — and until
[ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) run state called
both of those runs **`completed`**.

## What these are not

They are a **gate**, not a copy-paste starting point. A consumer writes
`import { FyflowScheduler } from 'fyflow-scheduler'` exactly as `l6.ts` does — but installs it from
npm or JSR, at a version that exists there, rather than from a `file:` link to a sibling checkout.
When 0.3.0 reaches a registry, ADR 0013 rule 3 becomes a version range and nothing else in these
files changes.
