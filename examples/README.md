# examples — ladder L6, the only code here that touches a real scheduler

Owned by [W6](../doc/work-items/w6-the-non-success-rows-at-l6.md) under
[P2](../doc/plans/p2-the-non-success-half-on-a-real-scheduler.md), and built by
[W5](../doc/work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md). **Not published** — neither `package.json`'s `files`
(which ships `dist/**` only) nor `deno.json`'s publish allowlist includes this directory.

```bash
npm run test:l6         # Node 24
npm run test:l6:deno    # Deno
```

Both print the same table and run the same **478 assertions over 25 real runs**. *(Two counts, two
predicates: a **run** is one `Driver` on one flow; a **row label** is an `EXPECTED[]` entry or a
`PairRow`, and there are **19** of those, because each pair row is one label producing two runs.
`l6.ts` prints the run count and derives it from the arrays; the row-label count and the assertion
count appear only here, and **nothing checks the three numbers on this page** — a markdown file
cannot derive one. That is [Q100](../doc/open-questions.md)'s class in a second file, and it is why
the parenthetical below exists.)* `RT-R10`: **L6 runs in Node and
Deno and not in the browser** — [Q33](../doc/open-questions.md), and the browser half is
[Q52](../doc/open-questions.md).

## What is here

| | |
|---|---|
| [`l6.ts`](l6.ts) | **the gate.** **Twenty-five real runs, 478 assertions** — every expected value written by hand from `spec/` before anything ran. **Twenty-one** `EXPECTED[]` entries plus **two** two-driver pair rows, each **one row** producing two runs on ONE scheduler — so **23 row labels and 25 runs**, and the two numbers are derived rather than typed. *(This sentence read 454 / 20 / 22 / 24 and **"the last three"** below — written for a three-row version of this item and not updated when its fourth row was added. Found by W23's conformity reader, in the paragraph whose own parenthetical says nothing checks the numbers on this page.)*. Four of the entries are [W17](../doc/work-items/w17-the-all-exit-row-at-l6.md)'s, and one of those is the row whose join is reported **dead** rather than merely never firing; the second pair row is [W19](../doc/work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md)'s and is **P6's exit artifact**; and **the last four are [W23](../doc/work-items/w23-a-nested-flow-on-real-workers.md)'s, which are P7's** |
| **the four nested rows** | **P7's exit artifact, and the first dotted task ids any rung above L2 has asserted.** One flow, one worker set, three answers. `nested HIGH / live-token`: every branch at both depths arrives, and **the outer join fires over branches it never opened** — `inner` is entered from `outer`'s branch 1, `scoreC` and `scoreD` are dispatched at `1.0` and `1.1`, and when `innerJoin` fires it enters `outerJoin` at the path its own **region** sits at, which *is* branch 1 arriving. `nested LOW / live-token`: both inner branches route away, so the inner join fires **having been reached by nothing** — [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)'s recorded cost, one level down — and the run still completes. `nested LOW / live-token-requiring-arrival`: the same run under the one policy that can say so, where `inner` is **reported dead**, `JP-R10` ends the outer branch it sat in, and `outer` fires anyway because `scoreA` arrived — so `publish` runs real work in a run that folds to `stuck`, which is [ADR 0030](../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md) rule 5's stated cost rather than a surprise |
| [`run-flow.ts`](run-flow.ts) | one run: build the scheduler, drive the flow, fold the driver's input sequence, return a report |
| [`workers/flow-worker.ts`](workers/flow-worker.ts) | **one worker file for both runtimes**, five roles selected by the pool's `config` — one always throws, one returns a value `structuredClone` refuses |
| [`flows/`](flows/) | the **seven** flows this gate needs that `spec/examples/` cannot express — [Q44](../doc/open-questions.md), whose own text said this would not be needed. `all-exit` is the fifth and the reason is the same one a third time: the corpus's all-exit shape reaches its second exit through a human, which would put a resolution race in a row whose point is elsewhere. **`nested` is the sixth and `nested-suspend` the seventh**, and their reason is different: `spec/examples/valid/nested-fanout.flow.json` exists and its outer join routes to an `end`, so **nothing is dispatched when that join fires** and a row has no id to read as *the join fired* |
| [`deno-import-map.json`](deno-import-map.json) | how Deno resolves the bare `fyflow-scheduler` specifier — to `jsr:@fyflow/scheduler@0.5.1`, at the same version `package.json` pins for npm ([ADR 0029](../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md) rule 2) |

## Five things a reader should not have to rediscover

*(The heading read **three** over four numbered items for two work items, and the section below it
read **fifteen runs** at nineteen. Both are the count-in-prose failure this repository keeps
producing, in the document whose job is to state the counts; each now says what it counts.)*

**1. The two runtimes reach the scheduler through two registries, and the version is written down
twice.** Node installs `fyflow-scheduler@0.5.1` from **npm** and reads its `dist/` build; Deno
resolves the same bare specifier to **`jsr:@fyflow/scheduler@0.5.1`** and reads its TypeScript
source, because **Node cannot** (`core/threadWrapper.ts:5` value-imports an `interface`, which type
stripping cannot erase — [S9](../doc/scheduler-upstream.md)). `npm run check:scheduler` **D3** is what
stops the two runtimes silently running different versions — the hazard survived the move from a
working-tree link and only changed address. All of this is
[ADR 0029](../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md),
and none of it is visible to a consumer: the published library depends on the scheduler **not at
all**.

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

**`runPair` is the second entry point, and it now serves two rows.**
[ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
makes *two drivers on one scheduler* a supported topology, so P4's exit artifact is that topology on
real workers. `runFlow` gained one option — a scheduler to share — and will not `shutdown()` one it
did not build; everything else about a run is unchanged, so the pair differs from two sequential runs
in exactly the respect under test. **Before W13 that pairing corrupted both runs silently**: each
driver received the other's settlements and dispatched its successors, so one task id was dispatched
twice under two outcomes and `ID-R1` could not fire.

**W19 gave it a third argument: `ForeignTask[]`** — tasks put on the shared scheduler with their ids
passed through **verbatim**, so they are whatever the caller says rather than anything
`spec/task-id.md` would produce. They go in through the **instrumented** `addTask`, so
`PairFacts.addTaskCalls` counts them and the count stays a fact about the scheduler; and they are
queued **before either driver starts**, on a single-slot inline pool, so the foreign settlement is
the first one the scheduler dispatches. Both halves are asserted rather than trusted —
`settlementIds[0]` for the order, `listenersAtFirstSettlement === listenersTotal` for the claim that
both drivers were there to receive it.

**3. Why there is more than one run, and what the first eight are for.** P1's exit artifact is *"the
branch-routed-away case as an executable test, run against both policies, plus one real fan-out flow
completing on a real scheduler"*. The control rows exist so the comparison has a baseline; the high-confidence rows exist
so `isLowConfidence` is a predicate that can return **both** answers, rather than a constant nothing
would notice was stuck at `true`.

Rows five to eight are ADR 0003's **two** mechanisms:

| | `live-token` | `arrival-count` |
|---|---|---|
| `p1-routed-away`, low confidence — *a decision routes a branch away* | `completed` — 4 tasks | **`stuck`** — 3 tasks |
| `optional-loss` — *an `optional` task simply fails* | `failed` — 4 tasks | **`stuck`** — 3 tasks |

The second is the one ADR 0003 calls ordinary: **no decision, no routing away, just a task that
failed**, and arrival-counting hangs anyway. `optional-loss` is defined in
[`flows/`](flows/optional-loss.flow.json) rather than in the corpus because the corpus cannot express
an `optional` branch node with no `on: ["failed"]` edge — [Q44](../doc/open-questions.md), and this
is its second occurrence.

**4. What W6 added, and the pair that matters.** *(Five rows after its review, not four — the fifth
was added because a negative test survived, and so was one of the first four. Both are in W6's
Record.)* P1's rows are all successes or hangs. W6's four are
the non-success half: a failure that **routes** rather than being lost; a suspension a person
resolves; a suspension nobody resolves; and a refusal that stops the run. The pair to read together
is the middle two — **the same flow, distinguished only by whether a human turns up**:

| | outcome | join | tasks | finishes? |
|---|---|---|---|---|
| `suspend / resolve / resume` | `completed` | fired | 4 | yes |
| `suspend / nobody comes` | **`awaiting_action`** | never | 3 | **no, and correctly** |

The second is **not `stuck`**, and that distinction is what `branch.suspended` exists for: a
suspended branch is still live, so the region has not emptied and `RN-R10` sits below
`awaiting_action` on purpose. `RN-R12` makes such a run non-terminal, so it is the one row whose
**expected result is the backstop** — a run parked on a person is not over, and the harness must not
pretend it is.

In both `arrival-count` rows the join's successor is **never dispatched**: `N` is fixed at two and
only one branch ever arrives, so the join waits forever with nothing queued and nothing running.
That is ADR 0003's matrix executed rather than simulated — and until
[ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) run state called
both of those runs **`completed`**.

**5. The two pair rows, and the one variable between them.** Both run the same flow with the same
payloads under `live-token`, two `Driver`s on **one** `FyflowScheduler`. They differ in whether that
scheduler also carries **tasks this library did not mint**:

| | foreign tasks | each driver's `onUnmintedTask` | both runs |
|---|---|---|---|
| `two runs / two drivers / one scheduler` — **P4's** | **none** | **`[]`** — a *parseable* foreign settlement is dropped in silence, which is `ID-R4` tier 1 and [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) rule 4's asymmetry | `completed` |
| `two runs / one scheduler / tasks we did not mint` — **P6's, [W19](../doc/work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md)** | **six** — one per refusal `parseTaskId` makes, plus [Q107](../doc/open-questions.md)'s `weekly-report`, which reaches the same refusal down `task.failed` instead of `task.completed`. All settle **before either run settles anything**, with both drivers already attached. *(This cell read **two** through two items that changed it: W19 took it to five and W23 to six. The list is `UNMINTED` in `l6.ts`; count it there.)* | **one report per foreign task, per run**, each under **its own** `runId` and carrying the event name, the id uncoerced and `parseTaskId`'s own message — ADR 0027 rule 3 | `completed` |

**Two foreign ids, not one, and the second was added by the item's own provocation sweep.**
`nightly-cleanup` is colon-free, so it reaches only `parseTaskId`'s **arity** refusal — one of the
five it makes. With it alone, narrowing tier 0 to `if (taskId.includes(':')) throw e` left all 370
assertions green - 370 being the count at that moment, before the second id was added. `pc:ingest:x:0` is four segments in our own shape with a **branchPath** outside the
grammar: the one producer ADR 0027 says could be **ours**, and the referent of that decision's whole
against-case.

**Neither row is assertable without the other.** An empty `onUnmintedTask` array proves nothing on a
scheduler where nothing unminted ever settles, and a non-empty one proves nothing about the channel's
*boundary* — that another run's settlement, which is parseable, must not arrive on it. `ID-R5` is
decided at **tier 0**, ahead of `ID-R4`'s two tiers, because both of those compare a run id and an
unparseable id has none. `pc:ingest:x:0` is what makes that ordering load-bearing rather than
stated: its first segment is run `pc`'s, so under any tier order that compared a run id first,
driver `pd` would drop it in silence.

**What the second row costs, under the rule it replaced.** Measured by restoring ADR 0023 rule 2 and
running this row, on this flow: both runs `stopped`, each reported `InvalidTaskId` **twice**, and
each dispatched **1 of its 4** tasks — so the scheduler was handed 4 of the 10 tasks it would
otherwise have run, and settled every one of them. The failure was never that the scheduler breaks;
it is that **the drivers go deaf while everything around them proceeds**, which is the shape that
does not get noticed in production.

## What these are not

They are a **gate**, not a copy-paste starting point. A consumer writes
`import { FyflowScheduler } from 'fyflow-scheduler'` exactly as `l6.ts` does — and installs it from
npm or JSR exactly as this repository now does
([ADR 0029](../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md),
which supersedes ADR 0013 rules 3 and 5). *(This paragraph read "when 0.3.0 reaches a registry" and
"rather than from a `file:` link to a sibling checkout" after both had stopped being true — the
`doc/`-is-checked-by-nothing class, in the front matter of the directory it describes.)*
