# Documentation index

## Current state

**[P1](plans/p1-what-satisfies-a-join.md) is complete — five work items, eleven reader-passes, and
its retro is run.** [Q4](open-questions.md) is answered:
[ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md), **a join is
satisfied when its region has no live branches** — and **W5 ran it on a real scheduler**, where
`p1-routed-away` completes under `live-token` and is **`stuck`** under `arrival-count`, with the
join's successor never dispatched. **288 assertions in five runtimes, plus 219 at ladder L6 in two.**

**The retro is in [P1's Record](plans/p1-what-satisfies-a-join.md) and `doc/workflow.md` is v0.3.**
Its central measurement, which should shape how the next plan reads that document: **of the eight
defect classes P1 produced, five have no rung on the ladder at all — and every one of those five was
found by the conformity pass.** Four changes adopted; several findings deliberately left as findings.

**[P2](plans/p2-the-non-success-half-on-a-real-scheduler.md) is COMPLETE and its retro is run —
`doc/workflow.md` is v0.4.** Two of v0.3's four changes needed nothing; the two that changed had both
been **followed** and failed anyway. **Rule 8 is new and has the strongest evidence of any rule
here**: W4, W5 and W9 each shipped a fix for a review finding that could not fail. Ladder
L6 is now **thirteen rows and 219 assertions** in Node and Deno, and **all six run outcomes occur
there** — `awaiting_action` and `stopped` for the first time, along with `branch.suspended` and
`branch.resumed`. **Nothing in `src/` broke**, which is the weaker result P2 predicted when it
measured `user_action` before the plan was written.

**The pair to read is `suspend / resolve / resume` against `suspend / nobody comes`** — the same
flow, distinguished only by whether a human turns up. The second is `awaiting_action` and **not
`stuck`**, which is what `branch.suspended` exists for, and it is the one row whose expected result
is the backstop: a run parked on a person is not over.

**What W5 changed, beyond running the flow.** Three ADRs, and each came from a different kind of
gap:

- **[0013](decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
  — the scheduler is a *development* dependency and the published library depends on it not at all.**
  The repo had no dependency on it at all until now, deliberately. **Every one of the four facts it
  rests on contradicted something written or assumed here**, and each was one command away:
  `fyflow-scheduler`
  **is** on npm and `@fyflow/scheduler` **is** on JSR (both at 0.2.1, so only 0.3.0 is unpublished);
  Node **cannot** load the sibling's TypeScript source while Deno can; and a typed `.ts` worker
  **does** run under Node 24, contrary to its `AGENTS.md` §3. The last two are
  **[S9](scheduler-upstream.md)** — the first live upstream item since the register was declared
  empty.
- **[0014](decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) — the driver
  produces the fold's input sequence** ([Q41](open-questions.md)). `FoldInput` had five variants and
  **`pathEnded` had no producer anywhere**; two of the six kinds were not observable from outside at
  all, so no caller could have built the sequence. It is what makes L6 clock-free.
- **[0015](decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) — a run whose join can no
  longer fire is `stuck`** ([Q42](open-questions.md), [Q43](open-questions.md)). Run state called
  such a run `completed`. **Q43's own stated reason was false** — `regions` does *not* already hold
  the data, because both policies produce an identical `regions` on that flow, which is exactly what
  `RN-R6` guarantees. Found by trying to act on the register.

**[Q33](open-questions.md) is answered and its leaning lost its own argument:** ladder L6 runs in
**Node and Deno**, not Node only, because the premise *"a real worker file per runtime"* is false at
Node 24. The browser half is [Q52](open-questions.md).

**[P3](plans/p3-a-consumer-reference-the-gate-keeps-true.md) is COMPLETE and its retro is run —
`doc/workflow.md` is v0.5.** [AGENTS.md](../AGENTS.md) is the consumer reference and every snippet in
it is extracted, typechecked and executed by `npm run gate`. **The answer to its question is yes, and
the number is 16%** — the gate covers the snippets and not the sentences between them, and W9's
response was to move the load-bearing claims **into** assertions rather than to guard the prose.
P3's retro says why that is an acceptable steady state and what is not: **the prose absorbed three
`src/` defects** ([Q71](open-questions.md), [Q72](open-questions.md), [Q73](open-questions.md)) rather
than the code being fixed. *Rot is what the gate prevents; **absorption is what it cannot see**,
because an accurate description of a defect passes every check there is.*

**[P4](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) is the active plan and it
deletes two of those three apologies by fixing the code.** One subject — *what is a `Driver`'s
lifetime, and what makes an inbound event or an outbound handle **this run's*** — and three defects
found by readers: Q53's many-run surface, Q72's two-drivers-one-scheduler cross-routing, and Q73's
unfrozen region event. **Its load-bearing fact was measured before it was written and it changed the
design**: filtering `onEvent` by run id — the mechanism the register proposed — closes **one of four**
inbound holes, while `dispatched.has(taskId)` closes all four using state the driver already keeps.
Taking the run id at construction was spiked in the working tree: `src/` typechecks clean and **all
thirteen L6 rows pass**, with the whole cost landing in call sites and in four `AGENTS.md` snippets.

**Fifteen reader-passes have run and every finding is acted on** — W1 ×3, W3 ×3, W2 ×1, W4 ×2,
W5 ×2, W6 ×2, W9 ×2 — with blocking findings of 4, 5, 1 · 1, 1, 4 · 4 · 2, 2 · 3, 10 · … · 5, 12.
**Not one has come back empty**, which is the strongest thing this repo knows about its own process.

*Until P1's retro this paragraph said **"five passes"**, then "six", and gave the sequence as
"4, then 5, then 1, then 4" — W1's three plus W2's, silently dropping W3's three. **It is the
most-repeated self-descriptive claim in the repository and nobody had counted it.** Corrected by the
retro, which also names the class it belongs to: `doc/` is upstream of every check here and is
checked by nothing.*

**The first four found the same shape four times: the code was correct and the tests were pointed
at the wrong half.** W1's pass found an assertion that could not fail; W3's second found a half of
the system nothing asserted on (the join never fired); its third found a half of the *seam* nothing
asserted on; W2's found five of the fold's own rules untestable, because the spec claimed what its
inputs could not supply and the **code narrowed itself until the claim was unobservable** rather
than reporting the conflict. That last one is what `spec/README.md` rule 2 exists to catch, and it
happened because W2 wrote both the spec and the code — **a spec authored by its implementer needs
the conformity pass more, not less.**

**W4 broke the pattern and W5 extended the break.** W4's eighteen cells were all correct and **every
finding was at the edges** — the fake's fidelity, the harness's own reporting, an untested region
shape. W5's were at the edges too, and two of them are new in kind: a **latent flake reported as a
pass** (dropping the L6 harness's microtask boundary survived every assertion, because
`scheduler.shutdown()` masked it), and a **claim in `open-questions.md` that was simply false**. The
middle keeps being sound; what is not checked is the instrument and the prose.

As of 2026-08-30: `doc/concept.md` is v0.2, **Q1 and Q2 are resolved** as
[ADR 0001-0002](decisions/), **Q4 is deferred to a spike**, and
**[P1](plans/p1-what-satisfies-a-join.md)** is planned with five work items. **W1 filled `spec/`
with five normative documents and answered [Q10](open-questions.md) and
[Q13](open-questions.md)**; its spec-conformity pass found **four blocking ambiguities**, one of
which became **[ADR 0004](decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)**.
**W3 built the driver and the validator**, and **W2 built the fold, both join policies and the
sixth spec document** — answering [Q14](open-questions.md) and [Q25](open-questions.md).
**30 questions remain open, 13 resolved.**

**What is decided:** routing executes in the driver, outside the scheduler (0001) · the flow
definition is data and predicates are registered by name, failing at instantiation (0002) · **a
non-success outcome routes only where an edge opts in, and `user_action` suspends until an external
resolution record resumes it** (0004) · the driver normalizes every event into an immutable outcome
record at the listener boundary (0007) · pinned to `fyflow-scheduler` **0.3.0** (Q3) · **three
runtimes from one source tree - Deno via JSR, Node >= 24 and the browser via npm** · and the
normative layer itself, [`spec/`](../spec/README.md), six documents · **run state is a fold of our
own log, and a run has SIX outcomes** (Q14's answer lives in `spec/run-state.md` rather than an
ADR; `stuck` is [ADR 0015](decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)'s) · **a join is satisfied when its region has no live branches** (0003).

**Upstream shipped: `fyflow-scheduler` 0.3.0 landed 2026-08-30** (npm and JSR both stop at 0.2.1 - measured by W5) and this repo has
been re-verified against **the code, not the plan** — details and the S-id map in
[scheduler-upstream.md](scheduler-upstream.md). Short version:

- **Four of our eight upstream items settled and we raised none of them** — S4 (timestamps) done,
  **S7 fixed better than we asked**, S8 declined-and-documented, S5 still deferred.
- **[Q32](open-questions.md) dissolved.** The orphaned-task drop that would have masqueraded as a
  stuck join is now a terminal failure, so **P1's validity threat is retired**.
- **[ADR 0007](decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
  needed no rule changed** — but every line reference moved, a second dispatch site appeared, and
  timestamps arrived as a **mutable field on the live task**, which makes rule 1 protect *more* than
  it did at 0.2.1.
- **[S1](scheduler-upstream.md) is answered** — the dead `parents` field stays dead and will
  eventually be removed. That left the register with nothing to raise, and **W5 changed that**:
  [S9](scheduler-upstream.md) is live and ready.

**[Q4](open-questions.md) is answered, and the answer is
[ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md): a join is
satisfied when its region has no live branches.** It was decided by W4's matrix rather than by the
argument P1 refused as *sufficient* — and the matrix found more than the plan asked for.
Arrival-counting does not merely fail the exotic routed-away case: it hangs on **six of nine rows**,
and an ordinary `optional` task failing is enough. Fixed-`N` is wrong whenever *"how many will
arrive"* differs from *"how many opened"*, and every non-success outcome makes it differ. **The
argument was right about the winner and wrong about the size of the effect.**

**What is deliberately *not* decided:** [Q24](open-questions.md) — whether either one-line
refinement of the two policies should be built. It is the live question now, and ADR 0003 names it
as the first thing a reader should look at: on the all-branches-exited row, `live-token` fires a
join **no branch reached**.

**The one thing to know before reading anything else:**

> `fyflow-scheduler` **has no dependency graph** - no `dependsOn`, no `parents`, no ordering. Its
> own reference lists them under *"Things that do NOT exist"*.

So the input document, [`../fyflow-scheduler/FLOW_PLANNING.md`](../../fyflow-scheduler/FLOW_PLANNING.md),
**is written against an API that is not there.** It calls the library "the existing FyFlow DAG
scheduler" and passes `parents: ['extract']` to a constructor with no such field. Its goals survive;
its premise does not. This repo **builds** sequence, decision, fan-out and join rather than wrapping
them, which is a different project of a different size. Details and evidence:
[concept.md](concept.md) section 2.

The trap that made it plausible: `SpawnTaskConfig.parents` is **declared** at
`../fyflow-scheduler/core/workerInterface.ts:50` and **read nowhere** - the spawn path drops it
silently. It typechecks and does nothing — **confirmed vestigial by the maintainer**, so this no
longer rests on our own reading. [S1](scheduler-upstream.md).

**What happens next:**

1. **[S9](scheduler-upstream.md) is ready to raise**, and it is the only live item in that register.
   Two one-line changes with a measurement behind each: `import type` in
   `core/threadWrapper.ts:5`, and `AGENTS.md` §3's claim that a Node worker must be JavaScript.
2. **[P4](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md)'s three items, in order.**
   [W12](work-items/w12-the-region-event-a-listener-cannot-corrupt.md) — one line and a test, the
   frozen region event, no ADR because `OR-R7` and ADR 0014 already say it.
   [W13](work-items/w13-one-driver-one-run-fixed-at-construction.md) — the run id at construction and
   the inbound boundary, **ADR 0022-0023**, and the first breaking change to a published surface.
   [W14](work-items/w14-two-runs-two-drivers-one-scheduler-at-l6.md) — the exit artifact, a
   fourteenth L6 row.
3. **After P4, a feature plan starts from [Q24](open-questions.md)** — `JP-R7` and `JP-R8`, which
   ADR 0003 names as the first thing a reader should look at. It stays the live **feature** question;
   P4 is deliberately a defect plan. The other candidates are
   [Q6](open-questions.md) (nested fan-out, nearly free under `live-token`) and
   [Q12](open-questions.md) (map-style fan-out, which makes the count dynamic).
4. **Read `doc/workflow.md` v0.5 first**, and in particular the things three retros have refused to
   turn into rules — those are the ones most likely to bite. **A register row you are about to act
   on is unverified until you have**, and P4 is the third plan in a row to find one wrong by trying
   to act on it.
4. **Five traps are live for whoever comes next.**
   - **`JP-R7` and `JP-R8`** ([Q24](open-questions.md)) — the two one-line policy refinements, and
     **the live question**. `test/matrix/variants.test.ts` runs both under their own ids. **W1 wrote
     one of them itself** before a conformity pass caught it: neither belongs in
     `src/fold/policies.ts` without its own decision.
   - **`FD-V14`** — the well-formedness rule whose *absence* keeps P1's case authorable, stated in
     the **all-paths** form because the *can-reach* form forbids nothing.
   - **`OR-R1`** — where a `{...e.detail}` spread looks like compliance and is not.
   - **A normative claim with no assertion.** W4 found the join's `null` payload could become `{}`
     and survive 251 assertions; W5 found the driver's `joinSettled(fired: false)` could be deleted
     and survive 278, because **neither shipped policy can reach it**. A seam with two exits and one
     reachable needs a stub, not a real run.
   - **`../fyflow-scheduler/dist/` goes stale silently**, and Node reads it while Deno reads the
     source. `npm run check:scheduler` is the guard; it was written because the directory *was*
     stale, behind a manifest reading `0.3.0`.

**The fan-out gate is cleared** (`workflow.md` section 7 rule 3) — not because Q4 is answered, but
because P1 builds both of its candidate answers, so W2 and W3 can be written without knowing which
wins.

## Reading order

| | |
|---|---|
| [concept.md](concept.md) | **Read first.** What we are building, the substrate fact that shapes everything, and the one structural idea - run state is a pure fold of an event log |
| [workflow.md](workflow.md) | **Read before any work item.** The loop, the verification ladder, the test rules, how work is split. **v0.5, run to completion by three plans** - the adaptation tables at the end carry a verdict per row from P1, P2 and P3, and stay for the next plan to re-judge |
| [decisions/](decisions/) | ADR 0001, 0002, 0007. They bind `spec/` rather than being superseded by it - 0007 in particular is what [outcome-record.md](../spec/outcome-record.md) makes checkable |
| [plans/p1-...](plans/p1-what-satisfies-a-join.md) | **Complete.** Five work items, and its Record carries the exit artifact and five proposals for the retro |
| [plans/p2-...](plans/p2-the-non-success-half-on-a-real-scheduler.md) | **Complete, and its Record carries the retro that made this document v0.4.** One question, one work item, no new features. Two facts measured before it was written, both of which changed it |
| [plans/p3-...](plans/p3-a-consumer-reference-the-gate-keeps-true.md) | **Complete, and its Record carries the retro that made `workflow.md` v0.5.** Can a reference be kept true by the gate rather than by discipline? Yes — and the gate covers about **16%** of it. The retro's answer to whether the other 84% is acceptable is the part to read |
| [plans/p4-...](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) | **The active plan.** What is a `Driver`'s lifetime, and what makes an inbound event or an outbound handle *this run's*? Three defects — [Q53](open-questions.md), [Q72](open-questions.md), [Q73](open-questions.md) — all found by readers, none a deliberate non-decision. **W12-W14 declared** |
| [../AGENTS.md](../AGENTS.md) | **The consumer reference** — the only document that describes this library from outside. Every snippet is executed by the gate |
| [open-questions.md](open-questions.md) | The register. **34 open, 13 resolved** - and **it is the one artifact here that is read as authoritative and checked by nothing**, which W5 found the hard way ([Q43](open-questions.md)) |
| [scheduler-upstream.md](scheduler-upstream.md) | S1-S8, plus **the S-id map for reading `RESOURCE_EVENTS_PLAN.md`**, which uses `fyflow-react-components`' numbering. **Nothing here blocks us, and nothing is left to raise** |
| [../spec/README.md](../spec/README.md) | **The normative layer.** Six documents, an example corpus, and the rules for changing it. Five written by W1, [run-state.md](../spec/run-state.md) by W2 |
| [work-items/](work-items/) | One file per work item. [W1](work-items/w1-the-normative-layer.md), [W3](work-items/w3-the-driver-and-the-validator.md), [W2](work-items/w2-the-fold-and-both-join-policies.md) and [W4](work-items/w4-the-join-failure-matrix.md) **done**; [W5](work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md) and [W6](work-items/w6-the-non-success-rows-at-l6.md) **done**; [W9](work-items/w9-the-consumer-reference-and-its-extractor.md) **done**. [W12](work-items/w12-the-region-event-a-listener-cannot-corrupt.md), [W13](work-items/w13-one-driver-one-run-fixed-at-construction.md) and [W14](work-items/w14-two-runs-two-drivers-one-scheduler-at-l6.md) **declared** — P4. **W7, W8 and W11 are skipped and never reissued; W10 is held for `check-owns.mjs`**, which P2's retro named. [TEMPLATE.md](work-items/TEMPLATE.md) |

## Document status

| Document | Status | Notes |
|---|---|---|
| `concept.md` | **v0.3** | Section 7's *"controlling a run from a UI"* non-goal carries one narrow, cited exception (ADR 0004). Section 2 is the load-bearing part and is verified against the library rather than assumed - **re-checked unchanged at 0.3.0**. **v0.3 updates section 6 only: all four leanings have landed and the table said two were still open.** Everything else has held up unchanged, which is the more interesting half - it was written before a line of code existed |
| `open-questions.md` | live | **38 open, 16 resolved** — *counted by P4, and the register's own census line said "47 questions, 34 open, 13 resolved" until then.* **Q33, Q41, Q42, Q43 and Q51 closed with W5**; Q4 and Q17 with W4, Q14 and Q25 with W2. **Q24 is the live one.** Q44 and Q45 are narrowed rather than answered. **W5 found a register entry that was false** (Q43) — this file is read before every work item and checked by nothing, which is the retro’s |
| `workflow.md` | **v0.5 — run to completion three times** | **P3's retro is v0.5 and it changes one requirement of one rule**: rule 7 (c) — *name which check refused the probe* — does not discriminate, because a merely malformed probe trips two checks at once and so satisfies a probe declared as either. A probe now declares the **set** it must trip. Measured over `check-docs`' twelve probes (11 already trip exactly one) and provoked after building, which is **rule 8's first outing**. Everything else P3 confirmed unchanged, including the ladder, which took a *document* deliverable without bending. **P2's retro is v0.4, and it is a smaller edit than P1's because two of v0.3's four changes needed nothing.** Settled: the **two-reader** split (four measurements, flat at ~10% overlap) and the **Outputs** table (whose load-bearing column turned out to be *what would fail without it*). Amended: **rule 7's provocations are checked in** rather than run once, and **section 7 rule 2's exceptions table is replaced by a check** — both had been *followed* and failed anyway. **New rule 8**: break the fix for a review finding and watch the gate go red, after W4, W5 and W9 each shipped one that could not fail. **v0.3 was P1's retro**, and adopted: the TEMPLATE gains an **Outputs** table (six occurrences, four items, of a declared output nobody built); pass 2 is **two readers** (1 overlap in 13, then 3 in ~35); a new check is **negative-tested at birth** (section 5 rule 7); and section 7 rule 2 is about **concurrent** items, with a serial one declaring its exceptions. Several findings were deliberately **not** turned into rules. The adaptation table at the end now carries a verdict per row |
| `decisions/` | **8 ADRs**, all accepted | None superseded. **0003 answers Q4** and carries this repository’s first in-place *Correction*. **W5 wrote 0013-0015 and is the first item to spend its whole ADR block** — one from measuring an environment, one from a gate that could not otherwise be written honestly, one from a register entry being wrong |
| `plans/p1` | **complete — question answered and exit artifact produced** | All five work items built. [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) is the answer; `examples/l6.ts` is the artifact. **279 assertions in five runtimes plus 72 at L6 in two.** W4 used Q42-Q50 and ADR 0003; **W5 used Q51-Q52 and ADR 0013-0015** |
| `scheduler-upstream.md` | live | **9 items, 5 closed** (S1 answered, S3 declined by us, S4 done, S7 fixed, S8 declined by upstream), S5 deferred, S2/S6 waiting on a real need, and **[S9](scheduler-upstream.md) live and ready to raise** — found by W5, the first item to load the library rather than a structural stand-in for it |
| `spec/` | **six documents** | `flow-definition` v0.6, `outcome-record` v0.5, `join-policy` v0.7, **`runtime-targets` v0.7**, **`task-id` v0.4**, **`run-state` v0.3**, plus 29 hand-written examples, a declared registry, and **71 numbered rules**. **Six conformity passes, all acted on.** `run-state` section 5 is the one thing to read if you read one section: **four** claims that their own inputs could not supply — and the fourth came from `open-questions.md` rather than from a spec. L0 is `check-spec.mjs` (eight checks), `check-source.mjs` (**ten**), **`check-scheduler.mjs` (five)** and `deno publish --dry-run` |

## Sibling repositories

Three repos, one stack, one maintainer. What each owns:

| Repo | Owns | Pinned to |
|---|---|---|
| [`fyflow-scheduler`](../../fyflow-scheduler) | executing independent tasks: pools, resource groups, retry, spawn | — |
| **`fyflow-orchestration`** (here) | **control flow**: sequence, decision, fan-out, join | scheduler **0.3.0** |
| [`fyflow-react-components`](../../fyflow-react-components) | visualizing a scheduler: collector, wire envelopes, React components | scheduler 0.2.1 — **needs the same bump**; 0.3.0 is what unblocks its `3a`/`3b` views |

Deliberate overlaps, which are coordination points rather than duplication:

1. **The same structural invariant.** Their view model is a pure fold of the scheduler's event
   stream; our run state is a pure fold of an outcome log. Adopted knowingly ([concept.md](concept.md)
   section 5), because it is what makes both testable without a live scheduler.
2. **Three questions are literally shared** - `user_action` at the top level (our Q17, their Q16),
   unbounded retention (our Q19, their Q14), one-driver-one-scheduler (our Q20, their Q15).
   **Answering these differently in two repos is a bug with two homes.**
3. **Two upstream wants were shared** - our S4/S5 are their S2/S1. Both are now answered via that repo (S4 implemented, S5 deferred), so the joint-raise is done. What remains shared is the *pattern*: raise once, from whichever repo has the stronger case. **Their S8 is our S8** and is the one that changed our architecture.
4. **They cannot see flow structure.** Which node, which branch, what a join is waiting on - none of
   it reaches the scheduler, so no UI can show it today. Whether we become a second envelope source
   family for them is [Q21](open-questions.md).

**Cite another repo's ids with its name attached, always.** Two Q sequences, same questions
(`workflow.md` section 3).

## Plan history

*One row per plan, oldest first.*

| P | Question it answered | Exit artifact | Date |
|---|---|---|---|
| [P1](plans/p1-what-satisfies-a-join.md) | **Yes — and worse than predicted.** Arrival-counting breaks on **six of nine** matrix rows, not on the one exotic case, and an ordinary `optional` failure is enough. Live tokens survive: [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) | `test/matrix/matrix.test.ts` (18 hand-derived cells × 2 policies) and **`examples/l6.ts`** (**eight** real runs at P1's close, thirteen after P2's W6). The row that is the plan: `p1-routed-away` under `arrival-count` is **`stuck`**, with the join's successor never dispatched | 2026-08-30 |
| [P2](plans/p2-the-non-success-half-on-a-real-scheduler.md) | **Yes, and the plan was right to lower its own stakes: nothing in `src/` broke.** All nine of W6's findings were in the gate that was supposed to be checking `src/`. The one surprise was elsewhere — the join had never once fired from the `lost` or `exited` path across twelve rows, so `settleJoin` could be deleted from both paths unnoticed | `examples/l6.ts` at **thirteen rows, 219 assertions**, with all six run outcomes and all six region events occurring on real workers | 2026-08-31 |
| [P3](plans/p3-a-consumer-reference-the-gate-keeps-true.md) | **Yes — and the second half of the question was worth more than the first.** A reference *can* be kept true by the gate, and what it keeps true is **~16% of the document**. Writing the surface down from outside produced three `src/` defects inside the item's own life. The cost the plan did not predict: **the prose absorbed three of them rather than the code being fixed** | [AGENTS.md](../AGENTS.md) — 15 snippets extracted, typechecked and, for the 11 tagged `run`, executed by `npm run gate`; `check-docs` is five checks and its self-test is 12 checked-in probes | 2026-08-31 |
| [P4](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) | *in progress* — what is a `Driver`'s lifetime, and what makes an inbound event or an outbound handle *this run's*? | a **fourteenth** ladder-L6 row: two runs, two drivers, **one** scheduler, both completing on real workers | — |
