# Documentation index

## Current state

**[P1](plans/p1-what-satisfies-a-join.md) is complete — five work items, eleven reader-passes, and
its retro is run.** [Q4](open-questions.md) is answered:
[ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md), **a join is
satisfied when its region has no live branches** — and **W5 ran it on a real scheduler**, where
`p1-routed-away` completes under `live-token` and is **`stuck`** under `arrival-count`, with the
join's successor never dispatched. **474 assertions in five runtimes, plus 489 at ladder L6 in two — 23 row labels, 25 real runs.** *(This line read **386** and **342** after the counts had moved; both are re-measured here rather than carried forward. The five runtimes are measured too - `npm run gate` runs `test:browser`, which is **chromium only**, so W19 ran `npm run test:browser:all` for firefox and webkit.)*
*(**The two numbers do not count the same thing and the word is the same.** `386` is `test/runner.ts`'s count of `test()` CASES, not of `equal`/`ok` calls — [Q98](open-questions.md), raised by W16 while re-deriving it. `342` is a genuine count of individual `check`/`assertThat` calls in `examples/l6.ts`. W17's conformity reader found the caveat attaching ambiguously to a sentence carrying both.)*

**The retro is in [P1's Record](plans/p1-what-satisfies-a-join.md) and `doc/workflow.md` is v0.3.**
Its central measurement, which should shape how the next plan reads that document: **of the eight
defect classes P1 produced, five have no rung on the ladder at all — and every one of those five was
found by the conformity pass.** Four changes adopted; several findings deliberately left as findings.

**[P2](plans/p2-the-non-success-half-on-a-real-scheduler.md) is COMPLETE and its retro is run —
`doc/workflow.md` is v0.4.** Two of v0.3's four changes needed nothing; the two that changed had both
been **followed** and failed anyway. **Rule 8 is new and has the strongest evidence of any rule
here**: W4, W5 and W9 each shipped a fix for a review finding that could not fail. Ladder
L6 was **thirteen rows and 219 assertions** in Node and Deno at P2's close, and **all six run outcomes occur
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

**[P3](plans/p3-a-consumer-reference-the-gate-keeps-true.md) is COMPLETE and its retro is run — it is
what made `doc/workflow.md` v0.5.** [AGENTS.md](../AGENTS.md) is the consumer reference and every snippet in
it is extracted, typechecked and executed by `npm run gate`. **The answer to its question is yes, and
the number is 16%** — the gate covers the snippets and not the sentences between them, and W9's
response was to move the load-bearing claims **into** assertions rather than to guard the prose.
P3's retro says why that is an acceptable steady state and what is not: **the prose absorbed three
`src/` defects** ([Q71](open-questions.md), [Q72](open-questions.md), [Q73](open-questions.md)) rather
than the code being fixed. *Rot is what the gate prevents; **absorption is what it cannot see**,
because an accurate description of a defect passes every check there is.*

**[P4](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) is COMPLETE and its retro is
run — `doc/workflow.md` was v0.6 at its close and is v0.7 now.** It deleted two of those three apologies by fixing the code. One subject — *what is a `Driver`'s
lifetime, and what makes an inbound event or an outbound handle **this run's*** — and three defects
found by readers: Q53's many-run surface, Q72's two-drivers-one-scheduler cross-routing, and Q73's
unfrozen region event. **Its load-bearing fact was measured before it was written and it changed the
design**: filtering `onEvent` by run id — the mechanism the register proposed — closes **one of four**
inbound holes, while `dispatched.has(taskId)` closes all four using state the driver already keeps.
Taking the run id at construction was spiked in the working tree: `src/` typechecks clean and **all
thirteen L6 rows pass**, with the whole cost landing in call sites and in four `AGENTS.md` snippets.

**Twenty-one reader-passes have run and every finding is acted on** — W1 ×3, W3 ×3, W2 ×1, W4 ×2,
W5 ×2, W6 ×2, W9 ×2, W12 ×2, W13 ×2, W14 ×2. **Not one has come back empty**, which is the strongest
thing this repo knows about its own process. **The two-reader overlap is now measured seven times —
1, 3, 3, 3, 3, 4, 4 — and the number to carry is that ABSOLUTE one**: two readers produce 1-4 shared
findings whatever the item's size, and the fraction (8% to 17%) is noise.

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

**Upstream shipped: `fyflow-scheduler` 0.3.0 landed 2026-08-30**, and **both registries carry it since 2026-08-31** - which is what [ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md) acts on. This repo has
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

**Q24 is answered too, by [ADR 0025](decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md),
and the two one-line refinements got DIFFERENT answers.** `JP-R8`'s is **adopted** — as a third
policy under its own id, `live-token-requiring-arrival`, which is what `JP-R8` itself prescribes — so
a flow that treats a join reached by nothing as a failure can now say so, and the run folds to
**`stuck`** rather than `completed`. `JP-R7`'s is **refused**: over the nine matrix rows it is
`live-token` weakened and never strengthened, differing from it only by reporting `waiting` where
`live-token` is `satisfied`, and it fires a join **zero branches reached** on the **third** of the
**three** rows it repairs — which is `Correction 2`'s point, and the reason *"repairs only P1's row"*
was never the objection.
**`live-token` and `arrival-count` are byte-identical**, so ADR 0003 rules 1-4 stand and not one of
the 36 matrix cells changed. **`liveToken` is still what the library tells you to pass**
([Q96](open-questions.md)).

**The one thing to know before reading anything else:**

> `fyflow-scheduler` **has no dependency graph** - no `dependsOn`, no `parents`, no ordering. Its
> own reference lists them under *"Things that do NOT exist"*.

So the input document, [`FLOW_PLANNING.md`](https://github.com/fyflow/fyflow-scheduler/blob/main/FLOW_PLANNING.md) in the scheduler's repository,
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
2. **[P5](plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) is COMPLETE and
   retro'd, and `doc/workflow.md` is now [v0.7](workflow.md) — five changes, two refusals.** [W15](work-items/w15-the-fourth-column-and-the-chain-nothing-runs.md) is **done**
   — the matrix renders at **four columns**, `JP-R7`'s and `JP-R8`'s variants are asserted as
   **exact row lists** rather than counts, and the `unsatisfiable` chain runs end to end for the
   first time. Both its readers ran and between them found that the two things W15 *created*, the
   render and the two promoted variant policies, were the least-guarded things in the item.
   **[W16](work-items/w16-the-decision-and-what-it-ships.md) is done, both readers run and every
   finding acted on**: [ADR 0025](decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
   answers Q24, adopting `JP-R8`'s refinement as a third policy and refusing `JP-R7`'s, with **not
   one of the 36 matrix cells changed** (386 assertions, up from 370). It also fired
   **`doc/workflow.md` rule 7 (c) for the first time in three plans** — `scripts/check-policies.mjs`
   holds the new `JP-R9`, and **three of its ten probes failed at birth**; the set is **thirteen** now,
   after its adequacy reader found the count vacuous at zero.
   **[W17](work-items/w17-the-all-exit-row-at-l6.md) is DONE — gated in both L6 runtimes, both readers
   run and every finding acted on — and it completed the plan's exit artifact**: L6 is **19 real runs and 342
   assertions**, and the `all-exit` shape now runs on real workers under every shipped policy —
   `completed` under `live-token`, silently `stuck` under `arrival-count`, and **`stuck` with
   `joined: false`** under `live-token-requiring-arrival`, which is the first L6 row here whose join
   is *reported* dead rather than merely never firing. **Its two findings are both about the harness
   rather than the library**: the three declared rows could not test the policy they were built for,
   because `arrived` is zero on the only scenario they run — found by a probe walking the rule's
   clauses, which is P4's amendment answering in the direction W15 and W16 did not see — and **W6's
   causal arrangement was held down by nothing**, so reversing one `Set` literal restored W6's
   original defect with the whole gate green. **Its readers then found two BLOCKING survivors, both
   in the harness**: the termination race could be replaced by a **1200 ms** sleep — longer than the
   run, where W5's recorded probe is 1 ms and truncates it — with everything green, and `lateInputs`'
   one recording could be deleted, making `RN-R12` a tautology on nineteen rows. Both fixed by
   deriving the value from its single source, both provoked. **Overlap 3 of ~31.** The other feature candidates stay where they were: [Q6](open-questions.md) (nested fan-out, nearly free under `live-token`) and
   [Q12](open-questions.md) (map-style fan-out, which makes the count dynamic).
3. **[P6](plans/p6-what-may-share-a-scheduler-with-a-driver.md) is COMPLETE and retro'd** — *what may share a scheduler with a driver?*
   It takes the three questions P5 ruled on but could not own, because **no P5 item takes
   `src/driver/**`**: [Q86](open-questions.md) as **ADR 0027** (is an unparseable task id a defect
   that stops the run, or a task that is not ours), [Q87](open-questions.md)'s one-line message
   defect, and [Q95](open-questions.md)'s unexercised latch. **Its urgency is that `AGENTS.md` §9
   already recommends the topology**: a second `Driver` on the same scheduler is the supported
   answer, and on a scheduler carrying anything else **one settlement stopped every driver on it** —
   which is what [ADR 0027](decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
   removed, so §9 now states one condition rather than two.
   Its measurement narrowed the decision before it was declared — `InvalidTaskId` is raised from
   **one** inbound site Q86 is about. *(P6's plan said **three producers**; the declaration step
   measured it and **two of those three rows were wrong** — `Driver.resolve()`'s site is unreachable
   and the fold has two call sites the plan never named. The plan carries a Correction and
   **[W18](work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md)'s own file is
   the version to reason from**.)* Exit artifact: a scheduler carrying a task this library did
   not mint, two drivers, both runs completing — **confirmed on a REAL scheduler at declaration**,
   where a foreign task settles normally and both drivers go deaf while everything around them
   proceeds. **[W18](work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md) is DONE**
   and **[W19](work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md) is DONE**;
   read each one's status from its own file rather than from this line (`doc/workflow.md` section 1
   rule 5). **The retro IS run, and it made `doc/workflow.md` [v0.8](workflow.md)** — two changes,
   both to rule 8: **break the PROVENANCE of every value an assertion reads** — five blocking
   instances across W14, W17 and W19, every one found by an adequacy reader and none by an author,
   which is section 5 rule 4 made provocable — and **re-run the set after acting on the readers'
   findings, checking their exact edits back in as probes**, which W18 found the need for and W19
   exercised. Rule 7 (c) unexercised for the fourth plan; `check-owns.mjs` retired for the third; the
   two-reader split settled at **ten** overlap measurements and closed to re-litigation. **`doc/` is
   refused a sixth time on a NEW direction**: the register's census line was *correct*, and this
   retro's own re-derivation made it wrong with a parser that could not classify three rows and
   returned a value instead of saying so. Corrected in place.

   **W18 answered Q86 with the third option and it won on evidence neither side of the register row
   had.** [ADR 0027](decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md):
   an inbound task id that does not parse was minted by **no** driver, so it is **`ID-R5`** — reported
   through `onUnmintedTask` and dropped — rather than a refusal that stops the run. **What decided it
   was asking who PRODUCES one.** A foreign task and a worker's own `context.spawnTask()` child can
   never be ours and are the common case on the blessed topology; a `detail.id` that stopped being
   what we dispatched **could** be ours and is rare — and `task.progress`'s detail changed shape at
   0.3.0 with no changelog, so that is measured history rather than a hypothetical. Stopping is right
   for the rare case and catastrophic for the common one, the string cannot tell them apart, and
   **only *report* is wrong in neither direction.** ADR 0023 rule 2 is superseded, one of `ID-R4`'s
   two preconditions is retired, and **tier 1's silence is untouched** — another run's settlement is
   reported by the driver that owns it, an unparseable one by nobody, which is the whole asymmetry.

   **Q95 is closed with a stub and the re-measurement corrected the register a third time.** There
   are **two** latches, not one: deleting the *satisfied* one costs an assertion and produces the
   `DuplicateTaskId` the register recorded; deleting the *unsatisfiable* one — W15's actual survivor
   — cost **0 of 386** and produces no refusal at all. What it produces is a second
   `joinSettled(fired: false)`, or, with a policy that says `unsatisfiable` and later `satisfied`,
   **a join routed out of after being declared dead**, taking `RunState.outcome` from `stuck` to
   `completed` silently. Expected values from `spec/join-policy.md` section 4, not from the refusal.
   **Q87's message sentence is fixed and asserted on its TEXT**; its enforcement half stays a
   precondition with no owner. **Q101 is fixed at the instance and open as a class**: `AGENTS.md`'s
   executed error-class snippet was a closed list compared against a copy of itself, and it now
   enumerates the package's own `Error` subclasses instead — **and the adequacy reader then found the
   same shape inside that fix**, since *documented* means *"in this array"* and section 9's prose can
   still be deleted with the gate green.

   **Both of W18's readers found things, and the two BLOCKING findings of each were about what the
   item had just written.** The conformity reader: five indexes said DONE over an item file reading
   `todo`, and two documents claimed an exception was declared that was not. The adequacy reader,
   35 mutations and 10 survivors: **`ID-R5` was one guard over six refusals with five never
   delivered** — every fixture was colon-free, so `if (taskId.includes(':')) throw e;` narrowed it
   back to ADR 0023 rule 2 with everything green — and **the precondition guarding Q95's stub admitted
   a trailing event that never re-enters `settleJoin`**, so one token restored Q95 exactly as W15
   measured it. Both are fixed and both fixes are provoked (6, 5 and 2 failures). **Overlap 2 of ~26**,
   the ninth measurement and inside the band. **35 rule-8 probes, all 35 tripping exactly their
   declared set** — two of them declaring the EMPTY set on purpose, because the reference's prose and
   `spec/**`'s prose have no route to red. **The harness itself then produced the item's most
   alarming finding**: two probes reached files it had not backed up, and one **deleted the
   `spec/join-policy.md` clause W18 took a late `Owns` exception to write**, with `check-spec` green
   over the damaged file. A mutation harness that does not restore is a mutation.
4. **Read `doc/workflow.md` v0.8 first**, and in particular the things six retros have refused to
   turn into rules — those are the ones most likely to bite. **A register row you are about to act
   on is unverified until you have**, and P4 is the third plan in a row to find one wrong by trying
   to act on it.
5. **Five traps are live for whoever comes next.**
   - **`JP-R7`, and only `JP-R7`** — [Q24](open-questions.md) is **answered**
     ([ADR 0025](decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md))
     and `JP-R8`'s refinement is shipped, so the live trap is the other one: **decrementing
     `arrival-count`'s `N` on `branch.exited` is refused, permanently, and it still reads like an
     obvious repair.** It lives in `test/matrix/variants.ts` and is still run as a matrix column so
     the refusal can be falsified. **W1 wrote one of these itself** before a conformity pass caught
     it. The reason to distrust it is not the one the counts suggested
     (**[Q91](open-questions.md)**): every row where it differs from `live-token` is a row where it
     **hangs**, and on the **third** of the **three** rows it repairs it fires a join **zero branches
     reached**.
   - **`FD-V14`** — the well-formedness rule whose *absence* keeps P1's case authorable, stated in
     the **all-paths** form because the *can-reach* form forbids nothing.
   - **`OR-R1`** — where a `{...e.detail}` spread looks like compliance and is not.
   - **A normative claim with no assertion.** W4 found the join's `null` payload could become `{}`
     and survive 251 assertions; W5 found the driver's `joinSettled(fired: false)` could be deleted
     and survive 278, because **neither shipped policy can reach it**. A seam with two exits and one
     reachable needs a stub, not a real run. **W15 found the third of these and it is still open**:
     the `at most once` latch on the driver's `unsatisfiable` path can be deleted and **all 361
     assertions still pass**, because no policy here settles a join before every branch is terminal
     — so nothing follows to re-enter the seam ([Q95](open-questions.md); **W18 closes it with a
     stub**). **W16 found the fourth, and it is a rung further out**: rewriting
     `spec/join-policy.md` section 3's third row to demand **two** arrivals, or deleting a whole
     column from ADR 0025's pasted table, leaves the entire gate green. Its probes written to the
     **rules** all went red and four of five aimed at what the item **created** survived — W15's
     finding, reproduced in a second item.
   - **The scheduler version is written down twice** — `package.json` pins npm's
     `fyflow-scheduler@0.3.0`, `examples/deno-import-map.json` pins JSR's `@fyflow/scheduler@0.3.0`,
     and ladder L6 runs in both. `npm run check:scheduler` **D3** is the guard.
     *(Until 2026-08-31 the hazard was a gitignored `dist/` in a checkout next door going stale;
     [ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
     removed the link and the hazard moved rather than disappearing.)*
   - **Never put a link into `node_modules`.** A junction placed there so `tsc` would skip the
     sibling's source was followed by `git worktree remove --force` and **deleted most of that
     repository**. `check-scheduler.mjs` D1 refuses one now.

   **[W19](work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md) is DONE and the exit
   artifact exists on real workers.** L6 is **19 row labels, 21 real runs, 373 assertions** in node
   and deno, from 18 / 19 / 342. Row 19 is one `FyflowScheduler` carrying **five** ids this library
   did not mint — one per refusal `parseTaskId` makes — all settling before either run settles
   anything, two `Driver`s, and **both runs `completed`**, each reporting all five through
   `onUnmintedTask` under its own run id. Restoring ADR 0023 rule 2 costs **13** L6 failures and
   leaves each run having dispatched **1 of its 4** tasks.

   **Its three method findings, and the third is the one for the retro.** First,
   **`doc/workflow.md` v0.7 change 3 fired on the first item that could hit it**: ADR 0027's producer
   table named three producers of an unparseable id and could not name the one W19 built, so
   **producer row 4 was added with no rule changed and no exception needed** — the gap that blocked
   W17 from correcting ADR 0015, closed and then used. Second, **rule 8's two halves both worked and
   both missed the blocking survivors**: the rule-written half found that L6 injected a colon-free id
   only, so tier 0 could be narrowed by the shape of the id with the gate green; the
   `Outputs`-written half found that *"counts derived rather than typed"* is unachievable in a
   markdown file. **Both of the adequacy reader's BLOCKING findings were about the provenance of a
   harness value** — a latched flag standing in for *"both drivers were attached"*, and an assertion
   whose source could be swapped from the scheduler to a driver — which is neither a clause of the
   rule nor a row of the table, and is the same shape as W17's `finishedBy` and `lateInputs`. Third,
   **W18's carried-forward proposal held**: the whole set was re-run after acting, twice, and the
   readers' exact edits are checked back in as probes. **Overlap 4 of 18**, the ninth measurement and
   inside the band. Its two questions are [Q107](open-questions.md) — `ID-R5` at L6 sees
   `task.completed` and nothing else, found by both readers independently — and
   [Q108](open-questions.md), the `context.spawnTask()` producer that is demonstrated nowhere at all.

4. **[P7](plans/p7-is-a-join-transitive-over-nested-fan-out.md) is COMPLETE and retro'd** —
   *[Q6](open-questions.md): if a branch itself fans out, does the outer join wait for the
   grandchildren?* **The first plan in six whose subject is a FEATURE rather than an edge**, and it
   takes the shape `doc/concept.md` section 2 names and the library refuses. Exit artifact: a nested
   fan-out running end to end on a real scheduler, with the outer join firing over branches it never
   directly opened, and the join/failure matrix at depth 2. **All four items are done; the detail is
   further down this page and the status is read from the plan's own file.** *(This paragraph read
   *"DECLARED and runs after P6 … nothing has started"* through the whole of P7, while the block below
   read COMPLETE — one index contradicting itself, which is `doc/workflow.md` section 1 rule 5's own
   class. Corrected at P8's declaration.)*

5. **[P8](plans/p8-what-can-be-deleted-with-the-gate-green.md) is DECLARED and runs after P7** —
   *what can be deleted from this repository with `npm run gate` still green?* **It owns `scripts/**`
   and `package.json`**, which are in nobody's `Owns` and which blocked two checks in P7 alone —
   [Q126](open-questions.md) and [Q121](open-questions.md) — and it is the plan that finally
   **exercises `doc/workflow.md` rule 7 (c)**, unused for five plans. Exit artifact: a table of
   deletions the gate accepted at `d8a9ea3` and refuses afterwards, each a checked-in probe with a
   failure count, plus **fourteen dead anchors fixed** in `doc/scheduler-upstream.md`. **[W24](work-items/w24-the-gates-own-wiring.md) is DONE — read its own file for its status, not this line.** The gate chain is **16 of 16 entries guarded** where it was 8 of 15, plus the three composed lists one level down — `typecheck`'s five sub-typechecks, `test:browser`'s `build:browser-tests`, and `lint`'s **argument list**. **[Q126](open-questions.md) is resolved.** `S12` is set equality **and order**, not a floor; `S13` carries **two clauses derived from sources that are not the declaration**, so emptying its list fails rather than passes. `scripts/check-source-selftest.mjs` is **the first self-test `check-source` has ever had** — **24 probes, 20 META gradings, 3 SELF gradings**, ~34 s, each probe declaring the exact set it must trip. **W25 is in the plan's index table and in no item file yet.** A third item —
   **W26, a tracked text file's bytes** — was declared in that table and **dropped before it started**,
   on a scope call rather than a measurement; **W26 and W27 are skipped and never reissued**, and the
   next plan starts at W28. Its one irreversible half was taken outside it: **`doc/concept.md` is
   normalised to LF in P8's declaration commit**, byte-identical to the previous `HEAD` with the CRs
   stripped. [Q123](open-questions.md) and [Q131](open-questions.md) return to the register with **no
   owner** — Q123's instance fixed and its mechanism unguarded, Q131 **not fixed at all**, so the two
   register rows still render their Status and Owner columns wrong.

   **Its declaration measured all four of its load-bearing facts and three were wrong** — the twelfth
   plan running to have that happen. `HEAD` is **not** LF throughout (`doc/concept.md` has been CRLF
   since the founding commit); the dead-link count is **0** and the false-positive count **4** rather
   than two; `S11` leaves **seven of the gate's fifteen entries** unguarded rather than one. And the
   census parser it wrote — the aborting kind P6's retro asked for — found a defect nobody had raised:
   **two register rows carry unescaped pipes and render their Status and Owner columns wrong**
   ([Q131](open-questions.md)).

   **Its measurement moved a work item's document, which is the ninth plan running to have the
   load-bearing fact change what got written.** The region maths is **already** nesting-ready —
   `regionSets` computes members transitively, so an outer region's set already contains the inner
   fan-out's nodes — and the defect is the **lookup**: `Driver.regionOf` is `.find()` over regions
   returned in **node-declaration order**, so with nesting a node is in two regions and the answer
   depends on which `fanout` appears first in the file. **No test can see it**, because `FD-V15`
   refuses the only input that would tell them apart. Beside it, `parseTaskId` accepts the dotted
   `branchPath` and **`buildTaskId` cannot emit one**, so the shape `spec/task-id.md` reserved in P1
   has never been produced by this library. And the seventh fact is the one that moved an item:
   `validateDefinition` does not know the policy, so *"invalid under arrival-counting"* cannot be an
   `FD-V*` rule — but `driver.ts:370` already throws `MissingJoinPolicy` at construction on exactly
   that shape. *(**That refusal was struck at W22's declaration**, on a measurement: `N` is
   per-region and `arrival-count` joins on an all-arriving nested flow. See W22's own file, which is
   what an item reasons from — `doc/workflow.md` section 1 rule 5.)* The construction refusal that
   sentence describes was never built
   rather than W20's.

   *(**Corrected by W22 and left standing as evidence.**)* One thing was settled before fan-out and it sized W22: nested fan-out is supported under
   `live-token` and its refinement, and **`arrival-count` REFUSES it** — at construction, not by
   hanging. Repairing fixed-`N` is the repair
   [ADR 0025](decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
   already refused, and reopening it would relitigate two decisions to serve a policy ADR 0003 says
   nobody should pass. **The cost is named rather than discovered**: the matrix gains its first
   declared-empty cells, and how a refusal renders in a table nobody asserts on is
   [Q100](open-questions.md)'s problem arriving in `test/matrix/**`.

   Two `spec/` documents said this was *"scheduled for P2"* — `spec/flow-definition.md` and
   `spec/join-policy.md` section 5 — and it was not taken there. **Stale by four plans, in `spec/`
   rather than in `doc/`**, which is the class six retros have refused to mechanise, one directory
   over.

   **[W20](work-items/w20-what-a-nested-region-is.md) is built, provoked and gated; its readers have
   not run.** `FD-V15` is **retired**, `spec/flow-definition.md` is **v0.7**, the corpus's nested flow
   moved from `invalid/` to `valid/`, and L1 is **416 assertions over 19 files**. **The measurement
   came first and the plan's central claim held**: with `FD-V15` set aside the nested example produced
   **no other finding**, so this was a lift rather than a redesign. The order-dependence was total
   rather than subtle — the same graph gave `outer`/branch **1** or `inner`/branch **0** for `scoreC`
   depending only on which `fanout` was declared first.

   **Two findings for the retro.** A **`Tests:` line that names assertions and not paths is a
   declaration that cannot be audited** — W20's `Owns` gave it no file it was allowed to test in, and
   both test files are late exceptions. And **`doc/workflow.md` v0.8's provenance obligation was
   refined by its own first outing** ([Q112](open-questions.md)): it does not distinguish breaking the
   **actual** side of an assertion from the **expected** side, and the second always survives — three
   of six such probes survived and none was a hole. **Rule 8's founding case also recurred inside rule
   8's own procedure**: reverting `Driver.regionOf` to `.find` cost **nothing**, because nothing drove
   a `Driver` through a nested flow. Closing it produced [Q113](open-questions.md) — `regionOf` is read
   on **three** paths only, and arrivals and openings use keyed lookups, so innermost resolution is
   load-bearing on the **non-success paths only**.

   **[P7](plans/p7-is-a-join-transitive-over-nested-fan-out.md) is COMPLETE and retro'd, and
   `doc/workflow.md` is [v0.9](workflow.md).** Its retro adopted four changes; the central one is that
   **rule 8 gains a fourth obligation — break the LOOP BOUNDS** — on two occurrences in two items,
   four instances, every one BLOCKING and every one found by an adequacy reader. Late `Owns`
   exceptions across its four items ran **five, four, two, zero**, and `check-owns.mjs` stayed
   retired.

   **[W23](work-items/w23-a-nested-flow-on-real-workers.md) is DONE and P7's EXIT ARTIFACT EXISTS.**
   A nested fan-out runs end to end on a real scheduler, in **both L6 runtimes**, with the outer join
   firing over branches it never opened. Ladder L6 is **489 assertions, 23 row labels, 25 real runs**,
   from 373 / 19 / 21 — and it dispatches the **first dotted task ids any rung above L2 has
   asserted**. Three rows on one flow give ADR 0030's three answers; a fourth exists because
   reverting [Q117](open-questions.md)'s fix cost **0 assertions** without it, which is rule 8's
   founding case in the item's own output.

   **Its harness had the same defect the driver had.** `examples/l6.ts` hard-coded `'split'` as *the*
   region in **18 places** — W22's `Cell` finding one rung up — and the inbound `resolve()` step minted
   with `Number(branchPath)`, which is **1** for `'1.0'`, not `NaN`: a well-formed id for a different
   task. **[Q107](open-questions.md) closed for one boolean**; **[Q90](open-questions.md) declined**
   with a measurement correcting P7's stated cost.

   **Its readers found five and three BLOCKING respectively, and the sharpest are two LOOP BOUNDS:**
   the four nested rows could be deleted for one edited number — **green at 388 with lint, typecheck
   and all five `check:*` passing**, and no dotted id dispatched anywhere above L2 — and `UNMINTED`
   had no bound at all, so all six foreign tasks could go, taking **P6's** exit artifact with them.
   **The author ran five bounds probes and all five were caught; the reader found two more**, because
   the author bounded the lists a *row* iterates and not the lists the *file* iterates.

   **[W22](work-items/w22-what-an-inner-join-does-to-the-outer-one.md) is DONE, and it answers the
   plan's question**: [Q6](open-questions.md) is closed by
   [ADR 0030](decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md) —
   **a join IS transitive over nested fan-out, for every policy, and it needed no mechanism.**
   Measured over four depth-2 rows × the four matrix columns: **each region answers exactly as the
   depth-1 row of the same shape does**, sixteen cells, statuses and `describe`s alike. `N` is
   per-region, so an inner branch never needed counting by the outer join — which is why the plan's
   `arrival-count` refusal is **struck**, and with it the driver refusal, the new error class and the
   matrix's declared-empty cells.

   **What ADR 0030 actually decides is the thing that is NOT a depth-1 behaviour one level down.** An
   `unsatisfiable` join emitted nothing at all, which was unobservable at depth 1 because a top-level
   fanout is in no region — and at depth 2 it left an outer branch with **no terminal event** in a
   quiescent run, a state `JP-R5`'s own enumeration does not admit. `JP-R10` ends that branch, the
   enclosing policy decides for itself, and the cascade at depth 3 is **emergent from one emission**:
   `inner` dead → `mid` dead → `outer` **satisfied**, three verdicts and none of them the driver's.
   `spec/join-policy.md` is **v0.10**, 474 assertions in five runtimes.

   **Its two blocking findings are one each, and they point in different directions.** The conformity
   reader found `spec/join-policy.md` **section 2** contradicting the rule the item had just added —
   `branch.lost`'s stated condition is *"a node … reached a terminal state — by settling, or by being
   resolved — and no edge was eligible"*, and a dead join satisfies **neither** clause; the ADR had
   quoted only the trailing consequence and read it as a definition. The adequacy reader found **two
   loop bounds**: a whole depth-2 row could be deleted for 0 failures, and a whole column dropped from
   the depth-2 loop for 0 failures **with the assertion count unmoved**, while the render kept
   advertising four. **An author's probes break VALUES; a reader's broke BOUNDS**, and 28 of the
   author's could not reach either.

   **[W21](work-items/w21-the-branch-path-is-a-path.md) is DONE and a nested run now mints the ids
   the grammar reserved in P1.** `spec/task-id.md` is **v0.7** and its *"`branchPath` is a property
   of the node"* is a statement about the code rather than about the result: the driver stopped
   **threading** a path and now **derives** one, both `split('.')[0]` sites are gone, and `dispatch`
   lost its `branchPath` parameter entirely — it took a path and reduced it to the outermost index,
   so the caller threaded a value the callee discarded. **The fork P7 named was closed on
   measurement**: deriving is total over the corpus, agrees with the threaded value at depth 1, and
   closed [Q114](open-questions.md) with **no new state**.

   **It also shipped a valid definition that hangs**, found by its conformity reader: Q114's first
   fix carried the path and dropped the region, so an inner join routing to an `end` inside the
   enclosing region emitted **no terminal event for the outer branch** and the outer join sat at
   `live: 1` forever. **The fix for that was then found blind at depth 2**, where the truncation its
   adequacy reader probed is the identity — a depth-3 sibling shape hangs a run under
   `arrival-count`. Three more real holes, all in what the item created: the `branchPath` grammar's
   **numeric** shape was untested, so widening it restores ADR 0027's catastrophe; `branchPathOf` was
   unasserted on the one shape both specs say has no path; and `1e21` minted an id `parseTaskId`
   rejects.

   **Two findings for the retro.** The **`Owns` gap recurred and P7's own table had the answer** —
   W21's declaration named paths, as W20's finding asked, and still narrowed `src/driver/driver.ts`
   out of a block the plan's index table had put it in. And **[Q112](open-questions.md) was corrected
   for the second item running, both times by the adequacy reader**: W20 refuted *"expected-side
   probes prove nothing"*, W21 refuted *"a source choice cannot be proved by a single-file probe"*
   with a counterexample at 1 failure. Both are about how the obligation is **instantiated**.

**The fan-out gate is cleared** (`workflow.md` section 7 rule 3) — not because Q4 is answered, but
because P1 builds both of its candidate answers, so W2 and W3 can be written without knowing which
wins.

## Reading order

| | |
|---|---|
| [concept.md](concept.md) | **Read first.** What we are building, the substrate fact that shapes everything, and the one structural idea - run state is a pure fold of an event log |
| [workflow.md](workflow.md) | **Read before any work item.** The loop, the verification ladder, the test rules, how work is split. **v0.9, run to completion by seven plans** - the adaptation tables at the end carry a verdict per row from P1 through P7, and stay for the next plan to re-judge. *(This cell read v0.8 / six plans / P1-P5 through the whole of P7 — read from `doc/workflow.md`'s own header at P8's declaration.)* |
| [decisions/](decisions/) | ADR 0001, 0002, 0007. They bind `spec/` rather than being superseded by it - 0007 in particular is what [outcome-record.md](../spec/outcome-record.md) makes checkable |
| [plans/p1-...](plans/p1-what-satisfies-a-join.md) | **Complete.** Five work items, and its Record carries the exit artifact and five proposals for the retro |
| [plans/p2-...](plans/p2-the-non-success-half-on-a-real-scheduler.md) | **Complete, and its Record carries the retro that made this document v0.4.** One question, one work item, no new features. Two facts measured before it was written, both of which changed it |
| [plans/p3-...](plans/p3-a-consumer-reference-the-gate-keeps-true.md) | **Complete, and its Record carries the retro that made `workflow.md` v0.5.** Can a reference be kept true by the gate rather than by discipline? Yes — and the gate covers about **16%** of it. The retro's answer to whether the other 84% is acceptable is the part to read |
| [plans/p4-...](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) | **Complete, and its Record carries the retro that made `workflow.md` v0.6.** What is a `Driver`'s lifetime, and what makes an inbound event or an outbound handle *this run's*? Three reader-found defects fixed, two ADRs, and **the first plan whose readers found a shipped ADR rule false** |
| [../AGENTS.md](../AGENTS.md) | **The consumer reference** — the only document that describes this library from outside. Every snippet is executed by the gate |
| [open-questions.md](open-questions.md) | The register. **34 open, 13 resolved** - and **it is the one artifact here that is read as authoritative and checked by nothing**, which W5 found the hard way ([Q43](open-questions.md)) |
| [scheduler-upstream.md](scheduler-upstream.md) | S1-S8, plus **the S-id map for reading `RESOURCE_EVENTS_PLAN.md`**, which uses `fyflow-react-components`' numbering. **Nothing here blocks us, and nothing is left to raise** |
| [../spec/README.md](../spec/README.md) | **The normative layer.** Six documents, an example corpus, and the rules for changing it. Five written by W1, [run-state.md](../spec/run-state.md) by W2 |
| [work-items/](work-items/) | One file per work item. **[W12](work-items/w12-the-region-event-a-listener-cannot-corrupt.md), [W13](work-items/w13-one-driver-one-run-fixed-at-construction.md) and [W14](work-items/w14-two-runs-two-drivers-one-scheduler-at-l6.md) done** — P4. [W1](work-items/w1-the-normative-layer.md), [W3](work-items/w3-the-driver-and-the-validator.md), [W2](work-items/w2-the-fold-and-both-join-policies.md) and [W4](work-items/w4-the-join-failure-matrix.md) **done**; [W5](work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md) and [W6](work-items/w6-the-non-success-rows-at-l6.md) **done**; [W9](work-items/w9-the-consumer-reference-and-its-extractor.md) **done**. [W12](work-items/w12-the-region-event-a-listener-cannot-corrupt.md), [W13](work-items/w13-one-driver-one-run-fixed-at-construction.md) and [W14](work-items/w14-two-runs-two-drivers-one-scheduler-at-l6.md) **declared** — P4. **W7, W8 and W11 are skipped and never reissued; W10 is held for `check-owns.mjs`**, which P2's retro named. [TEMPLATE.md](work-items/TEMPLATE.md) |

## Document status

| Document | Status | Notes |
|---|---|---|
| `concept.md` | **v0.3** | Section 7's *"controlling a run from a UI"* non-goal carries one narrow, cited exception (ADR 0004). Section 2 is the load-bearing part and is verified against the library rather than assumed - **re-checked unchanged at 0.3.0**. **v0.3 updates section 6 only: all four leanings have landed and the table said two were still open.** Everything else has held up unchanged, which is the more interesting half - it was written before a line of code existed |
| `open-questions.md` | live | **38 open, 16 resolved** — *counted by P4, and the register's own census line said "47 questions, 34 open, 13 resolved" until then.* **Q33, Q41, Q42, Q43 and Q51 closed with W5**; Q4 and Q17 with W4, Q14 and Q25 with W2. **Q24 is the live one.** Q44 and Q45 are narrowed rather than answered. **W5 found a register entry that was false** (Q43) — this file is read before every work item and checked by nothing, which is the retro’s |
| `workflow.md` | **v0.8 — run to completion six times** | **P6's retro is v0.8: rule 8's two obligations are both about WHAT is asserted and neither is about WHERE THE VALUE COMES FROM**, so it gains a third — break the PROVENANCE of every value an assertion reads — plus re-running the set after acting on the readers' findings. **P5's retro is v0.7, and it is the first whose central finding is that a change was RIGHT AND INCOMPLETE**: rule 8's set now has two obligations, the rule's clauses **and** the `Outputs` table's rows, because three items measured each half blind to what the other sees. It also defines *survivor* (a second, independent route must confirm the mutated clause was reachable), adds `doc/decisions/**` to the record-step list after that gap **blocked a fix**, adds a provenance clause (an item's status is read from its own file, never from an index) and says how to REMOVE an isolated copy. `check-owns.mjs` stays retired and rule 7 (c) is exercised. **Previously:** **P4's retro is v0.6, and its three changes all replace mechanisms that were followed and failed anyway**: rule 8's provocations are written to the **rule** rather than to the fix (three items, three author sets incomplete in the same direction); the **adequacy reader works in an isolated copy** (three reader pairs had run against one tree); and section 1 rule 5's record-step list gains `doc/open-questions.md`, which **retires `check-owns.mjs`** — the cause of three `Owns` miscounts was the list being wrong, not the discipline. **P3's retro is v0.5 and it changes one requirement of one rule**: rule 7 (c) — *name which check refused the probe* — does not discriminate, because a merely malformed probe trips two checks at once and so satisfies a probe declared as either. A probe now declares the **set** it must trip. Measured over `check-docs`' twelve probes (11 already trip exactly one) and provoked after building, which is **rule 8's first outing**. Everything else P3 confirmed unchanged, including the ladder, which took a *document* deliverable without bending. **P2's retro is v0.4, and it is a smaller edit than P1's because two of v0.3's four changes needed nothing.** Settled: the **two-reader** split (four measurements, flat at ~10% overlap) and the **Outputs** table (whose load-bearing column turned out to be *what would fail without it*). Amended: **rule 7's provocations are checked in** rather than run once, and **section 7 rule 2's exceptions table is replaced by a check** — both had been *followed* and failed anyway. **New rule 8**: break the fix for a review finding and watch the gate go red, after W4, W5 and W9 each shipped one that could not fail. **v0.3 was P1's retro**, and adopted: the TEMPLATE gains an **Outputs** table (six occurrences, four items, of a declared output nobody built); pass 2 is **two readers** (1 overlap in 13, then 3 in ~35); a new check is **negative-tested at birth** (section 5 rule 7); and section 7 rule 2 is about **concurrent** items, with a serial one declaring its exceptions. Several findings were deliberately **not** turned into rules. The adaptation table at the end now carries a verdict per row |
| `decisions/` | **10 ADRs**, all accepted | **0023 carries the second in-place *Correction* in this repository** — its rule 1 placed the ownership test after `normalizeEvent`, which made its own rule 3 false. None superseded. **0003 answers Q4** and carries this repository’s first in-place *Correction*. **W5 wrote 0013-0015 and is the first item to spend its whole ADR block** — one from measuring an environment, one from a gate that could not otherwise be written honestly, one from a register entry being wrong |
| `plans/p1` | **complete — question answered and exit artifact produced** | All five work items built. [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) is the answer; `examples/l6.ts` is the artifact. **279 assertions in five runtimes plus 72 at L6 in two.** W4 used Q42-Q50 and ADR 0003; **W5 used Q51-Q52 and ADR 0013-0015** |
| `scheduler-upstream.md` | live | **9 items, 5 closed** (S1 answered, S3 declined by us, S4 done, S7 fixed, S8 declined by upstream), S5 deferred, S2/S6 waiting on a real need, and **[S9](scheduler-upstream.md) live and ready to raise** — found by W5, the first item to load the library rather than a structural stand-in for it |
| `spec/` | **six documents** | `flow-definition` v0.6, `outcome-record` v0.5, `join-policy` v0.7, **`runtime-targets` v0.7**, **`task-id` v0.4**, **`run-state` v0.3**, plus 29 hand-written examples, a declared registry, and **71 numbered rules**. **Six conformity passes, all acted on.** `run-state` section 5 is the one thing to read if you read one section: **four** claims that their own inputs could not supply — and the fourth came from `open-questions.md` rather than from a spec. L0 is `check-spec.mjs` (eight checks), `check-source.mjs` (**ten**), **`check-scheduler.mjs` (five)** and `deno publish --dry-run` |

## Sibling repositories

Three repos, one stack, one maintainer. What each owns:

**A sibling checkout is no longer something this repository assumes.** `fyflow-scheduler` is reached
from npm and JSR ([ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)),
so the rows below link to repositories rather than to directories next door — a relative link into a
checkout is a claim about one machine's layout, and on 2026-08-31 those links went dangling when the
sibling was deleted by a recursive tool following a `node_modules` junction.

| Repo | Owns | Pinned to |
|---|---|---|
| [`fyflow-scheduler`](https://github.com/fyflow/fyflow-scheduler) | executing independent tasks: pools, resource groups, retry, spawn | — |
| **`fyflow-orchestration`** (here) | **control flow**: sequence, decision, fan-out, join | scheduler **0.3.0** |
| `fyflow-react-components` | visualizing a scheduler: collector, wire envelopes, React components | scheduler 0.2.1 — **needs the same bump**; 0.3.0 is what unblocks its `3a`/`3b` views |

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

*One row per plan, oldest first. **A plan appears here when it closes**, so
[P6](plans/p6-what-may-share-a-scheduler-with-a-driver.md) (declared, not started) is not below.*

| P | Question it answered | Exit artifact | Date |
|---|---|---|---|
| [P1](plans/p1-what-satisfies-a-join.md) | **Yes — and worse than predicted.** Arrival-counting breaks on **six of nine** matrix rows, not on the one exotic case, and an ordinary `optional` failure is enough. Live tokens survive: [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) | `test/matrix/matrix.test.ts` (18 hand-derived cells × 2 policies) and **`examples/l6.ts`** (**eight** real runs at P1's close, thirteen after P2's W6). The row that is the plan: `p1-routed-away` under `arrival-count` is **`stuck`**, with the join's successor never dispatched | 2026-08-30 |
| [P2](plans/p2-the-non-success-half-on-a-real-scheduler.md) | **Yes, and the plan was right to lower its own stakes: nothing in `src/` broke.** All nine of W6's findings were in the gate that was supposed to be checking `src/`. The one surprise was elsewhere — the join had never once fired from the `lost` or `exited` path across twelve rows, so `settleJoin` could be deleted from both paths unnoticed | `examples/l6.ts` at **thirteen rows, 219 assertions**, with all six run outcomes and all six region events occurring on real workers | 2026-08-31 |
| [P3](plans/p3-a-consumer-reference-the-gate-keeps-true.md) | **Yes — and the second half of the question was worth more than the first.** A reference *can* be kept true by the gate, and what it keeps true is **~16% of the document**. Writing the surface down from outside produced three `src/` defects inside the item's own life. The cost the plan did not predict: **the prose absorbed three of them rather than the code being fixed** | [AGENTS.md](../AGENTS.md) — 15 snippets extracted, typechecked and, for the 11 tagged `run`, executed by `npm run gate`; `check-docs` is five checks and its self-test is 12 checked-in probes | 2026-08-31 |
| [P4](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) | **A `Driver`'s lifetime is a run's, fixed at construction; a settlement is this run's iff this driver dispatched its task id; everything it hands out is a frozen copy.** [ADR 0022](decisions/0022-a-driver-takes-its-run-at-construction.md), [ADR 0023](decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) and W12's conformity fix. **The spike changed the design**: the run-id filter the register proposed closes one of four inbound holes | ladder L6's **fourteenth row** — two runs, two drivers, **one** scheduler, both completing on real workers, with the collision stated as a thing that cannot happen | 2026-08-31 |
| [P5](plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) | **Two rules, two different answers — and the plan's conclusion survived while its argument did not.** [ADR 0025](decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md): `JP-R8`'s refinement is **adopted** under its own id, `live-token-requiring-arrival`, with `live-token` byte-identical; `JP-R7`'s is **refused**, on a reason the counts could not show — it is `live-token` weakened and never strengthened, and on the row it repairs it fires a join zero branches reached. **Not one of the 36 matrix cells changed** | the matrix at **four columns, 36 cells**, and ladder L6's **`all-exit` row on real workers under every shipped policy** — one flow, one payload, three answers: `completed`, silently `stuck`, and **`stuck` with `joined: false`**, which nothing at L6 had ever reached | 2026-09-01 |
