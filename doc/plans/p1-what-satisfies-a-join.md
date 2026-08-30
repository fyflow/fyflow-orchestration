# P1 — What satisfies a join

**Status:** **complete, pending W5's spec-conformity pass.** All five work items are built. The question is answered - [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md), **live tokens** - and W5 ran it on a real scheduler in two runtimes: `p1-routed-away` completes under `live-token` and is **`stuck`** under `arrival-count`, with `publish` never dispatched. Three more ADRs came out of W5 (0013-0015) and five of the plan's carried questions closed
**Question this plan answers:** *When a decision inside a fan-out branch routes that branch away
from its join, does expected-arrival counting actually break — and does live-token accounting
actually survive it?*
**Exit artifact:** the branch-routed-away case as an executable test, run against **both** join
policies, plus one real fan-out flow completing on a real scheduler.
**Reserves:** W1-W5, Q22-Q30, ADR 0003-0006
**Both reserve blocks are spent.** W3 used Q36-Q39 and no ADR; **W2 reserves Q41-Q45 and ADR 0008-0009**, past the block. W1 allocated Q22-Q30 in full (five of them raised by its own
spec-conformity pass) **and then Q33-Q35**, from the three-runtime requirement; **W3 takes Q36-Q40
and ADR 0005-0006**, the last of the ADR block. ADR 0003 is still held for Q4 and is W4's; W1 took
0004; 0007 came from outside the block. **W2 took Q41 and skipped ADR 0008-0009; W4 reserves
Q42-Q50, ADR 0003 and 0010-0012**, and W5 reserves from Q51 and 0013. ADR **0003 is W4's** and is
the one number in that block that was never free.

---

## Why this plan, and why now

[Q4](../open-questions.md) is the hard question in the repo and it was **deliberately not decided by
argument**. Both candidate answers are defensible on paper:

- **Expected-arrival counting** — wait for N branches. Obvious to implement, obvious to display,
  obvious to explain.
- **Live-token accounting** — the join fires when the region's outstanding-token count reaches zero.
  Survives a branch being routed away, failing, or fanning out further.

The case that separates them is **a decision inside a fan-out branch that routes away from the
join**. The branch legitimately never arrives; an arrival counter never completes; the run hangs
with **no error**. Worse, the scheduler looks *idle* while it happens — a blocked task is removed
from `queued`, so `stats` reads `queued=0 running=0` (`AGENTS.md`, the `idleTimeout: 0` deadlock
note).

That is a strong argument, and a strong argument is exactly what this plan refuses to accept as
sufficient. **We build the case and let it decide.** If arrival-counting survives it — because some
constraint makes the routed-away branch impossible or cheap to forbid — that is a real result and
the simpler mechanism wins.

Afterwards we will know: which policy is correct, what a join costs at fan-out width, and whether
Q5-Q7 are one question or several.

## Scope

**In**

1. The **minimum flow definition** that can express the case: sequence, a decision, a fan-out, a
   join. Data-shaped, predicates by name (ADR 0002).
2. The **task id scheme** — fan-out forces it, and a collision silently overwrites (Q13).
3. The **fold**: run state from an ordered outcome log, with the join policy behind one interface so
   both implementations are swappable.
4. The **driver**: the only thing that touches the scheduler (ADR 0001).
5. The **join/failure matrix** — every Q5 outcome against both policies.
6. One **real run**: real scheduler, real workers, a fan-out that completes.

**Out** — named rather than left implicit

- **Nested fan-out (Q6).** The matrix records what each policy *would* do; nothing implements it.
  It lands in P2 once Q4 is settled, because its answer is nearly free under one policy and a
  separate mechanism under the other.
- **Map-style fan-out (Q12)** — "one branch per item in the previous output". P1 uses static
  parallel split only. Q12 is what makes the counter dynamic, and mixing it in here would confound
  the very comparison this plan exists to make.
- **Flow-level retry (Q16), cancellation (Q18), durability (Q15).** All downstream of Q4.
- **An event family for `fyflow-react-components` (Q21).** Not before the shape of run state is
  settled by this plan.
- **Performance at scale (Q19).** P1 measures a join at modest width to get a number, not to tune.
- **Proving portability.** `spec/runtime-targets.md` binds every work item from now on — L0-L5 run in
  all three runtimes — but **P1 exists to answer Q4, not to demonstrate that the layer runs in a
  browser.** Whether W5's real run happens once or three times is [Q33](../open-questions.md),
  answered at W5 rather than assumed here. The plan gate is budgeted at 90 s
  (`doc/workflow.md` section 8) and a three-runtime L6 does not fit in it.

## Decisions taken before fan-out

Per `doc/workflow.md` section 7 rule 3 — decide, then fan out.

| | Settled by |
|---|---|
| Routing executes in the driver, outside the scheduler | [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) |
| The graph is data; predicates are registered by name; an unknown name fails at instantiation | [ADR 0002](../decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) |
| The driver copies declared fields at the listener boundary; the outcome record is keyed on terminal state, not event name | [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) — **binds W1 (the record shape), W2 (the fold) and W3 (the listener)** |
| Run state is a fold of an ordered outcome log | `doc/concept.md` section 5. Still a leaning as far as Q14 is concerned — **W2 is what tests it** |
| A non-success outcome routes only through an edge that opts in; `user_action` **suspends** and is resumed by a resolution record | [ADR 0004](../decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md) — raised by **W1's spec-conformity pass**, not by design. It is the only decision here taken *after* fan-out was cleared, and it was taken before W2 or W3 wrote a line |
| Both join policies are built | This plan. They meet at one interface, which is W1's job to define |

**Q4 itself is deliberately still open.** Building both is the method, and a work item that picks a
winner before W4 has run has skipped the plan.

## The threat to this plan's validity — **retired 2026-08-30**

**It was:** a silently dropped task is indistinguishable from a stuck join. At 0.2.1
`core/FyflowScheduler.ts:848` shifted a task out of a blocked queue and dropped it when its pool was
missing — no event, no rejection, no `stats` entry. The run then waited forever with nothing queued,
nothing running and no error: **exactly** the signature this plan is trying to attribute to a join
policy, and an experiment whose null result has a second possible cause has not run.

**It is gone.** `fyflow-scheduler` 0.3.0 (`634e23a`) fails such a waiter terminally via
`_failOrphanedTask` — `task.failed`, then `task.user_action` unless optional, a rejected promise, a
`stats.failed` increment, and one `orphaned` unblocked exit per queue it sat in.
[Q32](../open-questions.md) is resolved; [S7](../scheduler-upstream.md) is closed.

What survives, deliberately:

1. **W5 still asserts that every dispatched node eventually produces an outcome record** — now
   *cheap insurance* rather than a validity gate. It checks a property the library asserts instead
   of one it violated, which is a much weaker reason to keep a test and still a sufficient one.
2. **W4's matrix still distinguishes *"the policy did not fire"* from *"the outcome never
   arrived"*.** They remain different cells. The second is now expected to be empty, and an empty
   cell that could fill is worth more than a cell that was never there.

**Detecting a stuck join is still entirely ours.** 0.3.0's `resource.blocked` and
`getAdmissionQueue()` make a *scheduler-level* stall visible and legible. A stuck join has **nothing
blocked and nothing queued** — no resource is short of anything — so neither fires.
[Q7](../open-questions.md) is untouched by that work, and W4 needs its own detection or it can only
report a hang as a timeout.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W1 | The definition spec + task id scheme + **the outcome-record shape** (ADR 0007) + the join-policy interface + **the runtime targets** | `spec/**`, `scripts/check-spec.mjs`, `.node-version` | nothing | L0, spec review — **L0 run three times, spec review run twice**. The first review produced [ADR 0004](../decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md); the second found the same defect class the first had, under a new id |
| W2 | The fold: outcome log → run state, both policies behind W1's interface, **and `spec/run-state.md`** | `spec/run-state.md`, `src/fold/**`, `test/fold/**` | W1 (and W3 by sequencing) | L0-L3 in **all five runtimes** |
| ~~W3~~ | The driver, the validator, the join seam, the toolchain | `src/driver/**`, `src/definition/**`, `test/{driver,definition}/**`, the toolchain | W1 | **done** — L0-L2 and L4 in **five runtimes**, 142 assertions, plus **three** spec-conformity passes |
| ~~W4~~ | The join/failure matrix — every Q5 outcome × both policies, **and ADR 0003** | `test/matrix/**`, `doc/decisions/0003-*.md` | W2, W3 | **done** — L0-L5 in **all five runtimes**, 47 assertions, [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) with one dated in-place correction, and **two** review passes: 4 blocking, 9 defects, 13 notes |
| ~~W5~~ | One real fan-out flow on a real scheduler, **plus the every-node-settles assertion** (Q32) | `examples/**`, `scripts/check-scheduler.mjs`, and six declared exceptions | W2, W3, **W4** | **built** — L0-L5 in **all five runtimes** (279 assertions), **L6 in Node 24 and Deno** (72 assertions, six real runs). [Q33](../open-questions.md) answered: **Node and Deno**, `RT-R10`. Three ADRs: **0013** (how the runtimes reach the scheduler), **0014** (the fold's input sequence), **0015** (`stuck`). Conformity pass outstanding |

**W1 grew, twice.** ADR 0007 made the outcome record a normative shape rather than an internal type:
it is what rule 1's "declared fields" means, and it is what lets a reviewer tell a compliant copy
from a `{...e.detail}` spread that still aliases `payload`, `result` and `error`. Then its own
spec-conformity pass produced **[ADR 0004](../decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)** —
routing is opt-in per terminal state and `user_action` suspends — which added a **resolution record**
to the log and two non-terminal region events to the join vocabulary.

**W3 grew too, and the argument is ADR 0002's.** The definition validator had no owner: W2's gate is
L0-L3 over `src/fold/**` and ladder **L4 was in nobody's**, leaving W1's twenty refusals and the
whole example corpus ungated (`doc/workflow.md` section 1 rule 1). ADR 0002 rule 3 validates a
definition *at instantiation*, and instantiation is a driver action — so W3 owns it. W3 also owns
the inbound resolution API that ADR 0004 rule 5 creates, which is the only place anything outside
this process can change a run.

W2 and W3 run in parallel **because W1's spec separates them** — they meet at the definition and the
outcome-log shape, never at each other's code (`doc/workflow.md` section 7 rule 1). W1 is serial and
everything waits on it.

Each has its own file under `doc/work-items/`. This table is an index, not the declaration.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q4](../open-questions.md) | What satisfies a join — arrivals or live tokens. **The plan's whole question, and it is answered: live tokens** ([ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)). **The result is bigger than the question** — arrival-counting hangs on six of the matrix's nine rows, and only one of them is the routed-away case this plan was built around; an ordinary `optional` failure is enough | ~~W4~~ **done** |
| [Q5](../open-questions.md) | What a join does when a branch fails / is `user_action` / is optional-null / is routed away. The matrix's rows. **Narrowed by ADR 0004: the four cases are three region events, and two of the four are the same scheduler outcome** — `optional`-null *is* `terminalState: 'failed'`. `user_action` is not a loss at all; the branch suspends and the join keeps waiting | W4 |
| [Q7](../open-questions.md) | Whether a join can time out. P1 must at least **detect** a stuck join, or W4 cannot report a failure as anything but a hang | W4 |
| [Q10](../open-questions.md) | What happens when no decision edge matches. Reachable in P1's own flow, so it needs an answer here. **Answered** — `FD-V7` at instantiation, `FD-R1` as the assertion | ~~W1~~ **done** |
| [Q13](../open-questions.md) | The task id scheme. Fan-out forces it; a collision silently overwrites. **Answered** — and the source says worse than "overwrites": both tasks run and two records land under one key | ~~W1~~ **done** |
| [Q14](../open-questions.md) | Is run state a fold, and of whose log. **Answered** - yes, and of *our* log, not the scheduler's: `spec/run-state.md` section 1. The last of `doc/concept.md` section 6's four leanings to land | ~~W2~~ **done** |
| [Q25](../open-questions.md) | Where the flow-level outcome vocabulary lives. **Answered** - run state's, and `end.outcome` stays a label the driver never interprets. **Five outcomes when W2 answered it; six since [ADR 0015](../decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) added `stuck`** | ~~W2~~ **done** |
| [Q17](../open-questions.md) | How `user_action` surfaces at flow level. **Detection** was answered by [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) rule 2 and the **mechanism** by ADR 0004 rules 3-6 — it suspends, and an external resolution record resumes it. What is left for W4 is what a join does while a branch is suspended, and it is **`awaiting_action`** at run level (Q25, answered by `spec/run-state.md` section 3) - it outranks `running`, because the fact a human is needed is the thing a reader must not miss | W4 |
| [Q32](../open-questions.md) | Telling a stuck join apart from a silently dropped task. **A threat to this plan's validity**, not a side question — see the section above | W5 |

Q6, Q12, Q15, Q16, Q18-Q21 are **not** carried — see Scope/Out.

## Record

**Exit artifact.** Two halves, both required by this plan's own statement of it.

1. **The branch-routed-away case as an executable test against both policies** —
   `test/matrix/matrix.test.ts`, nine rows x two policies, eighteen hand-derived cells.
   `npm test`, and identically in five runtimes.
2. **One real fan-out flow completing on a real scheduler** — `examples/l6.ts`, and it is six runs
   rather than one, because the plan's own sentence asks for both a *completing* flow and the
   *routed-away case*, and a predicate that only ever returns `true` is not a predicate.

```bash
npm run test:l6         # node 24
npm run test:l6:deno    # deno 2.9.6
```

| run | outcome | join | tasks |
|---|---|---|---|
| `fanout-join` / `live-token` | `completed` | fired | 4 |
| `fanout-join` / `arrival-count` | `completed` | fired | 4 |
| `p1-routed-away` high / `live-token` | `completed` | fired | 4 |
| `p1-routed-away` high / `arrival-count` | `completed` | fired | 4 |
| **`p1-routed-away` low / `live-token`** | **`completed`** | **fired** | **4** |
| **`p1-routed-away` low / `arrival-count`** | **`stuck`** | **never** | **3** |

**The last row is the plan.** `publish` is never dispatched; the join waits forever with nothing
queued and nothing running. Every expected value was written from `spec/` before the first run and
all six matched.

**What the plan answered.** [Q4](../open-questions.md): **live tokens**
([ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)), decided
by W4's matrix rather than by the argument the plan refused as sufficient. *"Arrival-counting was
fine"* was a real possible outcome and it lost on evidence — on **six of nine** matrix rows and on
the sixth row above, and for a reason the plan did not predict: an ordinary `optional` failure is
enough, so the sharp edge is the common case rather than the exotic one.

**Nine of the twelve questions this plan carried are closed**, and five of them by W5:
[Q4](../open-questions.md), [Q10](../open-questions.md), [Q13](../open-questions.md),
[Q14](../open-questions.md), [Q25](../open-questions.md), [Q17](../open-questions.md),
[Q32](../open-questions.md), plus W5's [Q33](../open-questions.md), [Q41](../open-questions.md),
[Q42](../open-questions.md), [Q43](../open-questions.md) and [Q51](../open-questions.md).
[Q5](../open-questions.md) and [Q7](../open-questions.md) are half-answered and named as such;
[Q24](../open-questions.md) is the live question the plan deliberately did not settle.

**What the plan cost, in the shape a later plan should budget for.** Five work items, six spec
documents, **70 numbered rules**, eight ADRs, 279 assertions in five runtimes plus 72 at L6 in two,
and **five spec-conformity passes of which not one came back empty** — W5's is the sixth and is
outstanding.

**Retro.** `doc/workflow.md` section 6 pass 3, and **the first time this workflow has been run to
completion anywhere** — it was copied from `fyflow-react-components`, which had not run it either.
It judges the method, not the product, and it also judges the adaptation table at the end of
`workflow.md`.

**Who ran it, and the bias.** The same session that built W5. Section 6 requires a fresh context for
pass 2 and does not for pass 3, and the evidence here is the five Records rather than anyone's
memory — four of which were written by other sessions. Where a finding rests only on W5 it is marked
as one occurrence.

### What the method produced

| | |
|---|---|
| work items | 5, each declared before it started |
| **reader-passes** | **11** — W1 ×3, W3 ×3, W2 ×1, W4 ×2, W5 ×2 |
| blocking findings, in order | 4, 5, 1 · 1, 1, 4 · 4 · 2, 2 · 3, 10 |
| **passes that came back empty** | **0** |
| assertions at the end | 288 in five runtimes, 118 at L6 in two |
| ADRs | 8, of which 4 carry dated in-place corrections |
| full plan gate, measured | **55 s** — `npm run gate` 46 s, plus firefox and webkit 9 s |

**The running total this repository quotes about itself was wrong, and had been since W4.**
`doc/README.md`, `CLAUDE.md` and three Records say *"five passes"*, then *"six"*, and give the
blocking sequence as *"4, then 5, then 1, then 4"* — which is W1's three plus W2's, silently dropping
W3's three. Eleven passes have run. **It is the single most-repeated self-descriptive claim in the
repository and nobody had counted it**, which is finding 5 below in miniature. Corrected everywhere
in this change.

### Rules that were followed and did not work

Section 6 pass 3 rule 3 — *"a rule that was **followed** and failed anyway means the mechanism is
wrong and needs replacing, not restating."* Three qualify.

**1. Section 1 rule 2 — *"tests are part of the work item, never follow-up"* — was followed by every
item, and every item still shipped assertions that could not fail.** W1: one. W3: three shapes of it
across three passes. W2: two, including `RN-R8`'s, which applied `stopped` last so the guard it was
testing could be deleted. W4: three, one of which was **its own mutation sweep's fix from the day
before**. W5: one in its own first draft, plus a new check that failed its own negative test and an
ordering test pointed at a flow that could not reach the branch it named.

The rule makes tests a deliverable. **Nothing makes them falsifiable**, and writing them inside the
work item does not: the author who misreads the spec writes the code and the test from the same
misreading. What did work, every time it was run, is **mutation** — and the second mechanism, quieter
and cheaper, is **negative-testing a check at birth**: W3's `S1`-`S6` were each provoked and each
fired, while `RT-R4`'s grep was hand-run once and written into a Record as though it were a gate,
and did not exist. W5's `S10` failed its own negative test *first*, which is the mechanism working.

**2. Section 4's ladder has no rung for a declared output that was not built. Six occurrences, four
items.** W3: the join seam (the largest behaviour in the item — no `joinPolicy`, no `status()` call —
and **all 132 assertions passed**), the `Region` accessor, and `RT-R4`'s grep. W2: the `OR-R7` and
`OR-R8` tests its own declaration promises verbatim. W4: `test/**` typechecked by no config. W5:
`examples/**`, the same, **predicted in its own declaration before the fact**.

W3's Record put it at three occurrences and said that was enough to bring here; W2 added a fourth and
noted the ladder still had no rung; W5 made it five-for-five. The ladder climbs over behaviour that
*exists* and never asks whether the item produced what it promised.

**3. Section 7 rule 2 — *"if two work items would edit the same file, they are one work item"* — was
broken by the last two items and was right to be.** W4 edited one line of W3's suite; W5 declared
**seven** exceptions and needed every one. The rule prices merge cost between **concurrent** items,
and a serial final item pays none of it: W2, W3 and W4 were all finished. Two occurrences, two items.

The mechanism that worked was not the rule — it was **W5's declared exceptions table**, and its value
is measurable: the conformity pass used it to find the one file W5 edited and had *not* listed
(`doc/concept.md`).

### Name the rung

Pass 3 rule 5 — for every defect class, which ladder level should have caught it.

| defect class | rung | |
|---|---|---|
| an assertion that cannot fail | **none** | L0-L6 all *run* tests; nothing asks whether one could fail |
| a declared output that was not built | **none** | finding 2 above |
| a spec asserting what its own inputs cannot supply | **none** | pass 2 caught all four; no rung can |
| a false claim in `doc/` | **none** | finding 5 below |
| a check that does not exist but is reported as run | **none** | `RT-R4`'s grep, W3 |
| Node refusing syntax every typechecker accepts | **L1, and only because `RT-R1` forces it** | `RT-R9`; the rung existed, the *runtime axis* is what found it |
| the sibling's `dist/` silently stale | **L0, now** | `check-scheduler.mjs`. Before W5: none |
| a stuck join reported as a completed run | **L1** | it had a rung and no test — `RN-R10` |

**Five of eight have no rung at all**, and every one of the five was found by pass 2. That is the
retro's central measurement: **the ladder is good at what it covers and the conformity pass is
carrying the classes it does not cover.** The adaptation table predicted this row and predicted the
wrong detector — see below.

### Adopted

Each states what it replaces (pass 3 rule 4).

**A. Every declared output names the assertion that would fail if it were absent.**
`doc/work-items/TEMPLATE.md`'s Record gains an **Outputs** table beside the Gate table, one row per
item on the `Outputs:` line. **Replaces nothing; it is the missing half of section 1 rule 1** — the
declaration states outputs and the Record accounts for clauses, so an output that was never built has
nowhere to show up. All six occurrences would have been a blank cell a reviewer could see.

Deliberately **not** a new ladder rung: L0-L6 are commands, and *"did you build what you said"* is not
one. This is a hole in the **Record's shape**, and the fix is a table with a blank in it.

**B. Pass 2 is two readers, and the two questions are the split.**
**Replaces** section 6's *"It answers two questions"* framing for one reader. W4: 13 findings, **1
overlap**. W5: ~35 findings, **3 overlaps**, and each overlap arrived from a different direction —
both readers killed `RT-R10`'s structural claim, one by bundling directly and one by running the
build script; both hit `S7`, on **different holes**. Two occurrences, two items.

**The honest cost:** roughly twice the pass. And the honest counter-evidence: W1's and W3's single
readers ran mutation sweeps too (85/146/100) and found a great deal. What the split buys is **marginal
coverage, not coverage** — the second reader finds what the first was not looking for, which is
exactly the overlap number.

**C. A new check is negative-tested at birth, and the Record names the provocation.**
**Sharpens** section 5 rule 3 from a property into a procedure. Rule 3 says assertions must be able
to fail; nothing said how you know. W3's `S1`-`S6` and W5's `S1`-`S10` and `D1`-`D5` were each
provoked; `RT-R4`'s grep was not, and did not exist. Two occurrences, two items.

**D. Section 7 rule 2 is about concurrent items, and a serial item declares its exceptions.**
**Replaces** the absolute phrasing. Finding 3 above.

### No change

Pass 3 rule 1 — *"a retro that always finds three improvements is measuring its own output."*

- **Section 1 rule 1 — a work item that cannot state its gate is not ready.** The most productive
  rule in the document. W1 and W3 each found a decomposition error by filling the header block, and
  **W5's `Inputs:` line could not be written at all** — which produced ADR 0013 and four measured
  facts that contradicted what this repository believed. Unchanged.
- **Section 7 rule 3 — decide, then fan out.** W2 and W3 ran in parallel against W1's spec and met at
  the definition and the log shape. The one place they did not compose — `Region` never produced in
  its declared shape — was caught by W3's own pass. Unchanged.
- **L2's definition (routing from a fixture log, no scheduler).** The adaptation table says it is
  wrong if L2 needs a scheduler. W3's fake is 22 lines and W5's is 30. Unchanged.
- **L5's definition (the join/failure matrix).** The table says it is wrong if the matrix is mostly
  undefined cells. All eighteen were filled, hand-derived, and matched on first run. Unchanged.
- **Section 8's budget.** *"Plan gate (L0-L6) < 90 s."* **Measured at 55 s** with five runtimes at
  L0-L5 and two at L6. The budget holds with room, and it holds *because* L6 is Node and Deno rather
  than three runtimes. Unchanged.
- **Section 5 rules 1, 2, 4 and 5.** No counter-evidence in five items. Rule 5 earned itself late:
  W5 wrote an overlap assertion, measured it varying run to run, and deleted it.

### Named and not fixed

**5. Every check in this repository is downstream of `doc/`, and `doc/` is checked by nothing.**
Two occurrences, two items, opposite directions. **W1**: the three-runtime requirement was in no
document — L0 checks the spec's self-consistency, pass 2 checks the artifact against the spec, and
both ran clean on a `spec/` that did not know the library had to run on Deno. **W5**: `Q43` in
`doc/open-questions.md` stated a reason that was false, and the item that acted on it paid for that
in a new field and a new input. The pass-count error at the top of this retro is a third, milder
instance.

**No mechanism is proposed, deliberately.** The two that suggest themselves — *review `doc/`* and
*extend pass 2 to the register* — are both prose guards, and W1's Record already measured what those
are worth: a block-quote warning about reflexive reachability did not stop `FD-V19` making the same
mistake one version later, because *"a prose guard is a reminder for whoever reads that paragraph; it
is not a check."* Extending pass 2 would not have helped either: W5's reader **did** read Q43, and it
took *acting on it* to find it false.

So this is recorded as a structural property of the method rather than a defect with a fix:
**`doc/` is the only layer with no check below it, and it is the layer every check trusts.** The next
plan should treat a register row it is about to act on as unverified until it has been.

### The adaptation table, judged

P1 is its first run. One verdict per row.

| Change | Verdict |
|---|---|
| Ladder rungs 1-5 rewritten | **Right, and its failure prediction was wrong in an instructive way.** It said the sign of trouble would be *"a defect class with no rung, found at L6 or by a human"*. Five classes have no rung — and **every one was found by pass 2**, not by L6 and not by a person. The rungs are sound; what the table mispredicted is who catches what falls between them |
| **L5 is a join/failure matrix** | **Right.** Its stated failure mode — mostly-undefined cells — did not occur, and the matrix is what produced ADR 0003 and the finding that arrival-counting fails on the ordinary case |
| **L2 is routing-from-a-fixture-log** | **Right, and the cheapest thing in the document.** Its stated failure mode — L2 needing a scheduler — did not occur in any of four items that used it |
| Section 3's cross-repo id rule | **Unproven.** No cross-repo citation occurred in P1. Keep; nothing was learned |
| Section 7 rule 3 names Q1/Q2/Q4 | **Right.** Fan-out was gated on the two ADRs and on P1 building both join policies, and W2/W3 composed |
| No jsdom rule | n/a |

**The adaptation the table does not list, and the one that mattered most: the runtime axis.** It was
added to section 4 by W1 after the gap surfaced from outside every check, and it is what found
`RT-R9` — a construct all four typecheckers accept and Node refuses to load. `RT-R1` read as ceremony
and was not.
