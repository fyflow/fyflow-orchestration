# P4 — The driver's lifetime, and the handles it gives out

**Status:** planning — W12-W14 declared
**Question this plan answers:** *What is a `Driver`'s lifetime — and what makes an inbound event, or
an outbound handle, **this run's**?*
**Exit artifact:** a **fourteenth ladder-L6 row**: two runs, two `Driver`s, **one** scheduler, both
completing on real workers — the pairing that silently corrupts both runs today.
**Reserves:** W12-W14, Q81-Q90, ADR 0022-0024

---

## Why this plan, and why now

**Three defects in shipped code, all found by readers, none fixed, and they are one subject.**

| | |
|---|---|
| [**Q53**](../open-questions.md) | `Driver`'s public surface says it serves many runs and `ID-R3` says it serves one. `start(runId, payload)` takes the id per call, `failedRuns` is a `Set`, `hasFailed(runId)` is public. Three shapes that only make sense for many runs. Raised by **W5**'s conformity reader |
| [**Q72**](../open-questions.md) | **Two `Driver`s on one scheduler cross-route.** `ID-R3` refuses a second run on one driver; **nothing refuses a second driver on one scheduler.** Each receives the other's settlements and a task id is dispatched twice — the two-outcomes-under-one-key corruption `spec/task-id.md` section 2 exists to describe. Measured by **W9**'s adequacy reader |
| [**Q73**](../open-questions.md) | `onRegionEvent` hands out the driver's **own live object**, while `snapshot()`, `foldInputs()` and `onFoldInput` all return frozen copies. A listener that mutates it corrupts the fold. Measured, same reader |

**Q72 is the sharp one, and the reason is not its severity.** `MultipleRuns`' own error message says
*"construct a second Driver"* — so **a consumer following the library's own advice produces the
corruption.** `AGENTS.md` documents that hazard in **three places** (§2 line 118, §9 lines 591-598,
§10 lines 656 and 659-660), which is [P3](p3-a-consumer-reference-the-gate-keeps-true.md)'s finding
stated in the other direction: *the reference stayed true by describing a defect*, and a reference
apologising for the code is a cost the gate cannot see.

**Why this before [Q24](../open-questions.md).** Q24 is a deliberate non-decision — two one-line
policy refinements that [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
names and declines. These three are **defects**. Q24 stays the live *feature* question and is
explicitly not this plan.

## The facts, settled before this plan was written

*Five consecutive plans have measured their load-bearing fact before declaring — ADR 0013, P2's two
spikes, P3's extraction spike, and this. In all five it changed what got written, and here it changed
the answer itself.*

**The register was verified against the code first** (`doc/workflow.md`: a register row you are about
to act on is unverified until you have — W5 found [Q43](../open-questions.md) simply false).

| | measured |
|---|---|
| **Q72 reproduces** | two drivers on one fake scheduler: `run-a:publish:-:0` is **dispatched twice**, driver B's log holds driver A's outcome, and **no failure is reported** — `ID-R1` cannot fire, because each driver has its own dispatched-id set |
| **the register is wrong in one detail** | Q72 says *"both runs report `stopped`"*. On `linear.flow.json` **neither does**: the corruption is entirely silent. That `stopped` came from a flow with a join and does not generalize. **Corrected in `doc/open-questions.md` rather than inherited** |
| **Q72b reproduces** | a `run-9:` settlement delivered to a `run-1` driver dispatches `run-9:publish:-:0`. Exactly as written |
| **Q73 reproduces** | `onRegionEvent`'s argument is **not frozen**; a listener writing `e.branchPath` makes the driver's own `foldInputs()` read `CORRUPTED` |
| **filtering by run id is the WRONG check** | **the finding that changed the plan.** Four inbound ids that are *not* another run's are accepted and appended today: a node of ours we never dispatched, a node **not in the definition at all**, and a branch path never opened. A run-id filter covers **one of four**. `this.dispatched.has(taskId)` covers **all four**, needs no new state, and subsumes the run-id case |
| **a malformed id must keep stopping the run** | it does — `InvalidTaskId` through `onRunFailure`, `OR-R10`. The guard sits *after* `parseTaskId`, so it still does. Verified under the spike |
| **run id at construction works, and L6 does not notice** | spiked in the working tree: `src/` typechecks clean, `ID-R2`'s charset refusal lands in the constructor beside `MissingJoinPolicy`, and **all thirteen L6 rows pass** with a **two-line** change to `examples/run-flow.ts` |
| **the cost is call sites and the reference, not behaviour** | **77 typecheck errors across four test files, 2 in `examples/`, and 4 of 15 `AGENTS.md` snippets stop compiling.** The last is the gate working, not a problem |
| **and one thing `spec/` warned about in advance** | `spec/task-id.md` section 3: widening `ID-R3` to refuse *any* second `start()` **takes `ID-R1`'s only direct test away** — W3 provokes a duplicate dispatch by starting the same run twice. **A replacement was measured before this plan was declared**: settling the same task twice fires `ID-R1` on the successor's redispatch, reported through `onRunFailure` rather than thrown |

**What the measurement changed.** The brief for this plan asked whether filtering by run id in
`Driver.onEvent` is correct. It is not — it is a *narrower* check than the one the driver can already
make for free, and three of the four holes it leaves have nothing to do with run ids.

## Decisions taken before fan-out

*`doc/workflow.md` section 7 rule 3: decide, then fan out.*

1. **A `Driver` takes its run id at construction.** `start(payload)`; `hasFailed()`; `failedRuns`
   becomes a boolean. `ID-R2`'s charset refusal moves to the constructor, where `MissingJoinPolicy`
   already lives, and `ID-R3` becomes *"`start()` once"*. **Breaking change to a public surface —
   ADR 0022.**
2. **An inbound settlement is this run's if and only if this driver dispatched its task id.** Not a
   run-id filter; the dispatched-id set the driver already keeps. A settlement that does not match is
   **not ours** and is not appended. A task id that does not *parse* still stops the run, unchanged.
   **ADR 0023**, which also decides whether "not ours" is silent or observable.
3. **Q73 is a conformity fix and gets no ADR.**
   [ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) and `OR-R7`
   already say every outbound value is a frozen copy; `onRegionEvent` does not do what they say. There
   is nothing to decide, which is why it is the first and smallest item rather than part of the ADR.
4. **[Q24](../open-questions.md) is not this plan**, and neither is [Q71](../open-questions.md) —
   `SchedulerLike` under the DOM lib is a separate surface question with its own trade-off recorded.

## Which files this plan takes over, and why

**`src/driver/**` is [W3](../work-items/w3-the-driver-and-the-validator.md)'s `Owns` and W3 is
done.** `doc/workflow.md` section 7 rule 2 binds *concurrent* items; these are serial, so the
takeover is declared rather than merged — and it is declared here, at the plan, because three items
share the file.

| file | owned by | taken by | why |
|---|---|---|---|
| `src/driver/driver.ts` | W3 | **W12**, then **W13** | the defects are in it. W12 touches `emit()` only; W13 rewrites the lifetime. **Serial, never concurrent** — that is the whole reason this is two items and not a merge |
| `test/driver/**` | W3 | **W12**, then **W13** | a fix without its test is not a work item (section 1 rule 2) |
| `spec/task-id.md` | W1 | **W13** | `ID-R2`, `ID-R3` and the new inbound rule are all in it. **A spec change is its own change with its rationale stated** — here, ADR 0022 and 0023 |
| `AGENTS.md` | W9 | **W13** | the three apologies are deleted **by this item**, and the gate proves the snippets still run. Deleting them is part of the fix, not follow-up |
| `test/matrix/run.ts` | W4 | **W13** | two call sites, from the surface change. Nothing about the matrix changes |
| `examples/**` | W5, then W6 | **W14** | the exit artifact is an L6 row, and `run-flow.ts` needs a two-driver shape it does not have |

**`src/fold/**` and `src/definition/**` are not taken over and are not edited.** If either turns out
to need a change, that is a finding for the Record and its own item.

## Scope

**In**

1. **Q73** — `onRegionEvent` receives a frozen copy, like every other outbound path.
2. **Q53** — the run id moves to construction and the three many-run shapes collapse.
3. **Q72** — an inbound settlement this driver did not dispatch is not this run's.
4. **The three apologies in `AGENTS.md` are deleted**, and `spec/task-id.md` is amended with the
   rationale stated.
5. **The exit artifact**: two runs, two drivers, one scheduler, at L6.

**Out** — named rather than left implicit

- **[Q24](../open-questions.md)** — `JP-R7`/`JP-R8`. The live *feature* question, and a different
  plan. This one fixes defects.
- **[Q71](../open-questions.md)** — `SchedulerLike` under the DOM lib. It is a surface question, but
  it is a *widening* with a recorded argument against it, not a defect with an obvious fix. `X5`
  reports it on every gate run and fails if it worsens.
- **[Q20](../open-questions.md)** (is a run id global) and [Q15](../open-questions.md) (durability).
  Both are adjacent — a driver's lifetime is where durability would become a persistence boundary —
  and neither is answered by fixing these three.
- **`index.ts`'s 38 exports.** W9 named the omission; whether the other ~26 are public at all is a
  question nobody has asked and it is not this plan's.
- **Any new capability.** Like P2, this plan adds none.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [W12](../work-items/w12-the-region-event-a-listener-cannot-corrupt.md) | The region event a listener cannot corrupt (Q73) | `src/driver/driver.ts`, `test/driver/**` — taken from W3 | nothing | L0-L1, then two readers |
| [W13](../work-items/w13-one-driver-one-run-fixed-at-construction.md) | One driver, one run, fixed at construction — and what makes an event ours (Q53, Q72) | as W12, plus `spec/task-id.md`, `AGENTS.md`, `test/matrix/run.ts` | W12 | L0-L5, ADR 0022-0023, then two readers |
| [W14](../work-items/w14-two-runs-two-drivers-one-scheduler-at-l6.md) | Two runs, two drivers, one scheduler — at L6 | `examples/**` — inherited from W6 | W13 | L0-L6, then two readers |

**Why three and not one.** They are separated by a spec, which is section 7 rule 1's test: W12 is
`OR-R7`/ADR 0014 conformity with nothing to decide, W13 is `spec/task-id.md` and two ADRs, W14 is the
L6 harness. **W12 first, deliberately** — it is one line and a test, it deletes `AGENTS.md` §10's
exception on its own, and running it ahead of the breaking change means the small fix is not
hostage to the large one.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q53](../open-questions.md) | the many-run surface | **W13** — closed by ADR 0022 |
| [Q72](../open-questions.md) | two drivers, one scheduler | **W13** — closed by ADR 0023. **Its "both runs report `stopped`" detail is corrected first** |
| [Q73](../open-questions.md) | the unfrozen region event | **W12** — closed as a conformity fix, no ADR |
| [Q20](../open-questions.md) | is a run id global | still open, and W13 will have an opinion it is not entitled to record as an answer |

## A note on ids

**This plan reserves W12-W14 rather than W10-W12, and the reason is on the record.**
[P2's retro](p2-the-non-success-half-on-a-real-scheduler.md) proposed `scripts/check-owns.mjs`
**as W10, by name and by link**. Taking W10 here would make that sentence false, which is the defect
class this repository names most often. **W10 stays held for `check-owns.mjs`; W11 is P3's unused
reserve and is skipped, never reissued** — the same disposition P2's retro gave W7-W8.
`ADR 0016-0021` (P2's and P3's unused blocks) are skipped likewise, so this plan starts at **0022**.

## Record

*Filled in at the join, after the work items are merged.*
