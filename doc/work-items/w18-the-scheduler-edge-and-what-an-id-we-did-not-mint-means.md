# W18 — The scheduler edge, and what an id we did not mint means (ADR 0027)

**Status:** **done** — [ADR 0027](../decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) accepted, both readers run and every finding acted on, gate green
**Plan:** [P6](../plans/p6-what-may-share-a-scheduler-with-a-driver.md) — the item that answers
[Q86](../questions/q86.md). **It is entitled to reach "stop the run, and the precondition stands"**,
and the plan says so in as many words: the third option the plan names is written there as a
candidate, and **this item does not inherit it**.

```
Spec:       spec/outcome-record.md section 6 — OR-R10, "a refusal that
            terminates a run is caught at the listener boundary, reported, and
            stops the run". `InvalidTaskId` reaches that path without being
            named as a rule, which is the seam this item decides.
            spec/task-id.md section 3 — ID-R4's row, whose FIRST stated
            precondition IS Q86 ("every task on the driver's scheduler carries
            an id some driver minted; one that does not stops every driver on
            it"), and section 1, which defines what parses.
            AND IT MAY AMEND BOTH, with the rationale stated, which is
            ADR 0027. A spec change is its own change and never a side effect
            of making a test pass (doc/workflow.md section 5, anti-patterns).
Owns:       src/driver/**            (from W3)
            test/driver/**           (from W3/W13)
            spec/outcome-record.md   (from W1)
            spec/task-id.md          (from W1) — see "What the declaration
                                     step changed" below; this file is NOT in
                                     P6's index table and it has to be here
            spec/README.md           (from W1) — doc/workflow.md v0.7 puts it
                                     with whichever item owns the spec document
                                     that moves it: check-spec's C8 makes its
                                     version row a CONSEQUENCE of any spec/**
                                     bump, so it is an Owns question rather
                                     than a record-step one
            AGENTS.md                (from W9)
            All five owners (W1, W3, W9, W13) are done. No concurrent item
            touches any of these, so doc/workflow.md section 7 rule 2 is
            satisfied by the declaration rather than by ordering.
Inputs:     Q86, Q87 and Q95 as the register states them, READ AND RE-MEASURED
            rather than trusted — the corrected fact table below is this
            item's actual input and three of its rows disagree with the plan.
            ADR 0023 in full, especially its Correction, which states Q86 as a
            precondition and is the sentence ADR 0027 either keeps or retires.
            ADR 0022 (the run id is a constructor option), because tier 1's
            comparison is what an unparseable id is refused AHEAD of.
            ADR 0014, because the fold is a second consumer of parseTaskId and
            the plan's producer table does not name it.
            spec/join-policy.md section 4's "at most once per region however
            many events follow", which is the clause Q95's stub exists to make
            true of something.
Outputs:    (1) ADR 0027 — the decision on the SCHEDULER EDGE ONLY, stating
                explicitly which of parseTaskId's other call sites it does not
                change and why, and ruling on ADR 0023's Correction sentence;
            (2) whatever ADR 0027 ships in src/driver/driver.ts — which may be
                NOTHING, and a no-code ADR is a complete output;
            (3) spec/outcome-record.md's OR-R10 and spec/task-id.md's ID-R4
                amended if the decision touches them, each with its rationale;
            (4) an EARLY-SETTLING stub policy in test/driver/**, making the
                `at most once` latch load-bearing — Q95, closed with a stub and
                not with a feature;
            (5) MultipleRuns' message no longer recommending the violation —
                Q87's message half, and only that half;
            (6) AGENTS.md gaining `InvalidTaskId`: a row in section 9's refusal
                table AND the ninth class in the executed snippet that today
                enumerates eight as though they were the set.
Depends on: nothing
Blocks:     W19 — which cannot build its exit artifact until this decides what
            a foreign settlement does
Tests:      Expected values come from spec/outcome-record.md section 6 and
            spec/task-id.md section 3, re-derived from the rule text before
            any of them is run, never from what the driver emits
            (doc/workflow.md section 5 rule 1). Four groups:
              - the scheduler edge, whichever way ADR 0027 goes: a settlement
                carrying an unparseable id, delivered through the fake, in all
                three terminal states — the state-blindness W13's adequacy
                reader found on ID-R4 applies to this guard identically;
              - the three sites ADR 0027 does NOT change, asserted as NOT
                changed: buildTaskId's two refusals, resolve()'s guarded site,
                and the fold's;
              - Q95's stub: a policy that settles a join BEFORE every branch is
                terminal, with the trailing region event re-entering
                settleJoin, asserting the latch holds — expected value from
                spec/join-policy.md section 4, not from the DuplicateTaskId the
                plan measured, which is what the latch's ABSENCE produces;
              - MultipleRuns' message asserted against its text, since a
                sentence is what is wrong with it.
Gate:       L0-L5 in all three runtimes (node 24, deno, browser), then ADR 0027
            written and its Consequences answerable, then the two readers of
            doc/workflow.md section 6 — the adequacy one in an isolated copy.
            NOT L6: this item's whole surface is fixtures over a fake, and the
            real scheduler is W19's, by declaration.
Reserves:   Q101-Q106, ADR 0027-0028
```

**ADR 0028 is reserved and is not expected to be used.** It is held in case ADR 0027 splits — the
scheduler edge and Q87's message are different decisions and only one of them is a decision at all.
An unused reserve is **skipped, never reissued** (`doc/workflow.md` section 3).

**`doc/decisions/**` needs no declared exception, and this is the first item for which that is
true.** `doc/workflow.md` v0.7 change 3 put it on section 1 rule 5's record-step list, precisely
because every `Reserves:` line names ADR ids and every item that ever reserved one wrote an
undeclared file. So ADR 0027 itself, `doc/decisions/README.md`'s index row, and the sentence in
[ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)'s
*Correction* that ADR 0027 supersedes are all record-step files. **P6's retro is asked to judge
whether this stops the exception inflation W16 measured** (nine exceptions where the rule should have
granted three), so the count is recorded rather than assumed: **this declaration takes one
conditional exception**, below.

## Exceptions — files edited outside `Owns` and outside the record step

`doc/workflow.md` section 7 rule 2. Declared before the item starts, and audited by hand after the
record step with `git diff --name-only` and `git ls-files --others --exclude-standard`.

| File | Owner | Reason, and the condition under which it is used |
|---|---|---|
| `scripts/check-source.mjs` | **nobody's declared `Owns`** — created by W3, extended by W5 (`S7`) and W16 (`S11`) | **Conditional, and it is P6's Record note 2. UNUSED — see the Record.** *If* ADR 0027 creates a refusal `src/` must not make — a driver that silently drops an id, say, must not also be free to drop one at `resolve()` — that is a `check-source.mjs` clause, and rule 7 (c) applies to it: checked-in probes, each declaring the exact SET of checks it trips. **If ADR 0027 ships no such rule, this exception is unused and the Record says so**, which is the fourth plan reporting rule 7 (c) unexercised |

**Two exceptions were DECLARED LATE, during the item, and that is a rule-2 failure recorded rather
than smoothed over.** `doc/workflow.md` section 7 rule 2 says an exception is named *before the item
starts*; neither of these could have been, and saying so is the point of writing them down.

| File | Owner | Why it was edited, and why the declaration could not come first |
|---|---|---|
| `scripts/check-docs.mjs` | **nobody's declared `Owns`** — created by W9, `RUN_FLOOR` added by W16 | **The check's own comment obliges the edit**: *"raise it when the reference gains a snippet, never lower it to make a deletion pass."* W18 added a ` ```ts run ` snippet to `AGENTS.md`, and at a stale floor of 13 the self-test probe *"a whole `run` snippet deleted"* went **green** at 14 - 1. So the file had to move and the declaration could not have known — the obligation is created by an edit to a *different* file, which is `spec/README.md`'s `C8` shape one directory across. **[Q102](../questions/q102.md)** |
| `spec/join-policy.md` | **W1's**, and not in this item's `Owns` | **Found by the spec-conformity reader, and it is the sharper of the two.** Q95's stub asserts two things about section 4's `unsatisfiable` exit — that it settles **once per region**, and that it is **terminal for the region** even when the policy later answers `satisfied`. Section 4 stated **neither**: *"at most once … however many events follow"* sits on the `satisfied` row, and the unsatisfiable row said only *"reports it … and routes nowhere"*. The driver has always enforced both with one latch; Q95 is the measurement that the second was enforced untested. Leaving it would have shipped a rule asserted twice and written nowhere, which section 1 rule 3 refuses outright. **This is `doc/workflow.md` v0.7 change 3's shape in `spec/**` rather than in `doc/decisions/**`** — a gap that blocks a *fix* — and the item could not have foreseen it, because which clause a stub makes load-bearing is not knowable until the stub exists |

## What the declaration step changed, and it is three things

*`doc/workflow.md`: measure the load-bearing fact before declaring. Seven plans have, and in all
seven it changed what got written. **Four plans running have each found a register row wrong by
trying to act on it; this is the fifth, and this time two of the wrong rows are the PLAN's own
prose.*** Every row below was run, not read. Baseline: `npm run gate` green at `75b3033`,
exit code 0 — 386 assertions × {node 24.20.0, deno 2.9.6, chromium}, 342 assertions / 19 real runs
at L6 × {node, deno}.

### 1. `resolve()` is not a producer of `InvalidTaskId`. It is unreachable, and the plan's argument for leaving it alone rests on behaviour that does not exist

P6's fact table says `parseTaskId` raises `InvalidTaskId` at two inbound sites, that `Driver.resolve()`
(`src/driver/driver.ts:380`) is one of them, and that *"an unparseable id handed to `resolve()` is
unambiguously the caller's defect — they invented it — and must keep stopping the run."*

**It does not stop the run. It returns `false`.** `isSuspended(this.log, taskId)` is line 379, one
line above the parse, and `isSuspended` requires the log to already hold an `outcome` record for that
exact `taskId` in `user_action` (`src/driver/log.ts:55-58`). The log holds only ids the driver
appended, and the driver appends only for ids `dispatched` contains (`ID-R4` tier 2), every one of
which `buildTaskId` minted. **So an unparseable id cannot reach line 380**, and the rejected-command
path swallows it first.

Measured, both paths through one driver on one fake scheduler:

| | |
|---|---|
| `driver.resolve('not-a-task-id', 'done', {actor:'x'})` | **returned `false`** — `RS-R1`'s rejected command. Nothing appended, run unaffected, nothing reported |
| the same id delivered at the listener | **reported `InvalidTaskId`** through `onRunFailure`, run stopped |

**Why this matters to the decision rather than being a footnote.** The plan's framing is *"three
producers, and ADR 0027 changes one and leaves two untouched"* — which reads as a live trade-off,
because the reader believes the other two are doing work. One of them is not doing any work. So
ADR 0027's blast radius is **smaller than the plan claims**, and the *"but a corrupted id for a task
that IS ours"* objection — the whole of the register's against-case — has **no second site to be true
at**. It is true at the listener or nowhere.

### 2. `parseTaskId` has a consumer outside `src/driver/**`, and the plan names neither call

`src/fold/run-state.ts:154` (`dispatched` inputs) and `:179` (every record input) call `parseTaskId`,
so **`fold()` — a pure function, and the invariant this whole repository hangs off — throws
`InvalidTaskId` on a malformed sequence.**

Today this is unreachable in the same way: [ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)
makes the driver the producer of the fold's sequence, and the driver only appends ids it minted. But
it is **exactly the surface ADR 0027's third option would touch**: *"ignore it, but report it"*, if
the report were a new `FoldInput` kind carrying the offending id, puts an unparseable string into the
one place that parses every id it is given. **ADR 0027 must state what it does to
`src/fold/run-state.ts` even if the answer is "nothing"**, and it could not have known to, because
the plan's producer table stops at `src/driver/`.

### 3. The counts are wrong, and `AGENTS.md`'s omission is sharper than "the reference gains a row"

`buildTaskId` raises `InvalidTaskId` **twice** (`src/driver/ids.ts:52,53`), not the six the plan
states; `parseTaskId` raises it **five** times (`:62,65,66,67,68`); **seven** throw sites in the file,
plus `assertRunId`'s `InvalidRunId`, which is a different class. *(`doc/workflow.md`: a count in prose
states the predicate that produces it. The predicate here is `throw new InvalidTaskId` in
`src/driver/ids.ts`, by enclosing function.)*

And the reference's gap is not an absence. **`InvalidTaskId` is exported from the package root** —
`index.ts:4` is `export * from "./src/driver/ids.ts"`, and `typeof InvalidTaskId === 'function'`
through the entry point, measured. `AGENTS.md`:680-693 is a ` ```ts run ` snippet that imports eight
error classes, maps them to `.name`, and throws unless the joined string matches a literal it also
contains. **It is a closed list of the library's refusal classes, it is executed by `npm run gate`,
it omits one, and it passes** — because the list is compared against itself. `InvalidRunId`, from the
same file, IS in it, so this is not `ids.ts` being excluded wholesale.

That is [Q84](../questions/q84.md)'s shape with a gate behind it, which is worse: P3's conformity
reader called an omission *"a claim by omission it does not defend"*, and here the omission is inside
the one document the gate keeps true. **`doc/workflow.md`'s standing lesson — rot is what the gate
prevents, absorption is what it cannot see — has a third form: a list the gate executes against
itself is not a list the gate checks.** Raised as [Q101](../questions/q101.md).

## Scope

**In**

1. **ADR 0027 — Q86, the scheduler edge only.** The decision, with all three options costed, and
   naming explicitly what it does **not** change: `buildTaskId`'s two outbound refusals, `resolve()`'s
   guarded and unreachable site, and `src/fold/run-state.ts`'s two calls.
2. **Whatever ADR 0027 ships** in `src/driver/driver.ts`, with `OR-R10` and `ID-R4`'s precondition
   sentence amended if it touches them. **Shipping no code is a complete outcome** and the Record
   states it as one rather than as a shortfall.
3. **[Q95](../questions/q95.md), closed with a stub.** An early-settling policy under
   `test/driver/**` — the seam has two exits and only one is reachable from what we ship, which is
   this repository's own rule for the case, already applied twice
   (`test/driver/driver.test.ts:389`, `test/driver/fold-inputs.test.ts:176`).
4. **[Q87](../questions/q87.md)'s message sentence, and only that.** `MultipleRuns`' text reads
   *"Construct a second Driver; ADR 0023 makes that safe on the same scheduler."* — verified verbatim
   at `src/driver/driver.ts:350` — and omits *with a different run id*, so the library's own error
   recommends the violation.
5. **`AGENTS.md` gains `InvalidTaskId`** in both places section 3 above distinguishes: the prose
   table of refusals, and the executed snippet's closed list.

**Out** — named rather than left implicit, with where it goes instead

- **A real scheduler.** Every assertion here is L2 over a fake. **W19** is this rule on real workers,
  and P6 separates them by spec on exactly that line.
- **Q87's enforcement half.** Stays a precondition, on P5's argument, which P6 adopts and this item
  does not re-derive: no driver can detect it (`SchedulerLike` is two methods, ADR 0013 rule 1) and
  the alternative is the first mutable module-level state in `src/`.
- **[Q7](../questions/q7.md) — whether a join may time out.** The stub in (3) is an *instrument*.
  Shipping an early-settling policy is a feature question P6 does not take, and the Record must say
  so rather than letting the stub read as a proposal.
- **[Q97](../questions/q97.md)** — whether `stuck` should distinguish a reported dead join from a
  silent one. `spec/run-state.md` is **W2's** and is not in this item's `Owns`; **ADR 0026 stays
  held** for it and is not reissued here.
- **W15's generalisation of Q95** — that making `emit` return early once a join has settled also
  survives everything, so *nothing in this repository exercises what happens to a region after its
  join is decided*. The stub in (3) makes **one** event follow a settlement; the general clause is
  larger than Q95 and is re-read at the Record rather than absorbed.
- **[Q90](../questions/q90.md)** — `ID-R4` tier 2's missing L6 coverage. Named in P6's Scope/Out and
  W19's declaration re-reads it, as the register asks.

## Verification

How each clause of `Gate:` is run. Named as commands, per the template.

| Clause | Command |
|---|---|
| L0 | `npm run check:spec`, `npm run check:source`, `npm run check:scheduler` (+ self-test), `npm run check:policies` (+ self-test), `npm run check:docs` (+ self-test), `npm run lint`, `npm run typecheck` — the last covering all five projects, so the browser tree is typechecked even though no browser test is added here |
| L1-L5, three runtimes | `npm run test` (node 24), `npm run test:deno`, `npm run test:browser` — **chromium only**, which is what that script defaults to (`scripts/run-browser-tests.mjs:68`). `npm run test:browser:all` is what runs firefox and webkit and **`npm run gate` does not run it**; if the Record claims more than one browser it names this command |
| ADR 0027 | not a command. Written, its Consequences answerable, and its options costed from measurements in this file rather than from P6's prose |
| conformity reader | `doc/workflow.md` section 6, fresh context, spec first |
| adequacy reader | same, tests second, mutating **in an isolated copy** — `git worktree`, `cp -r node_modules` (inert: `node_modules` holds zero symlinks and zero reparse points, re-verified before the copy), green in the copy before the reader starts, and **scan for links before removing it** |

**Rule 8 — provocations, both obligations.** `doc/workflow.md` v0.7 change 1: the set is written to
the **rule's clauses** AND to the **`Outputs` table's rows**, because measured over three items each
half alone was blind — W15 and W16 rule-written and blind to what the item created, W17
deliverable-written and blind to a clause of the rule. **And a survivor is only a survivor once a
second, independent route confirms the mutated clause was reachable** (v0.7 change 2): W17's adequacy
reader enforced *"the probe changed its input"* and all three of its vacuous probes still read as
SURVIVED with the gate green.

*This item touches routing at the inbound edge, so, per the template:* a branch routed away from its
join (Q4) — **not applicable**, no routing changes; `user_action` (Q17) — **covered**, the unparseable
id is delivered in all three terminal states because a guard the fixtures drive in one state can be
conditioned on the state (W13's adequacy reader's finding, on the guard one line below this one); no
matching decision edge (Q10) — **not applicable**; a duplicate task id (Q13) — **covered, and it is
the assertion Q95's stub turns on**, since the latch's absence is what produces one; a nested fan-out
(Q6) — **not applicable**.

## Record

**The decision is [ADR 0027](../decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md):
an inbound task id that does not parse was minted by no driver, so it is `ID-R5` — reported through
`onUnmintedTask` and dropped — and not a refusal that stops the run.** It takes the plan's third
option and supersedes ADR 0023 rule 2.

**What carried it is not the argument the plan or the register made, and that distinction is the
item's main methodological result.** Both argued about the *shape* of the objection: *every clause of
the against-case is about silence rather than about stopping*. True, and not decisive. What decided it
was asking **who produces an unparseable id at that listener**, which no document had asked:

| producer | could it be ours? | will anyone else report it? |
|---|---|---|
| a foreign task on a shared scheduler (`nightly-cleanup`) | never | no — it is nobody's run |
| a worker's own `context.spawnTask()` child (id caller-supplied) | never | no |
| a `detail` with no string `id` — a scheduler version skew | **possibly** | no |

The first two are the common case on the topology ADR 0023 blessed; the third is rare and is not
hypothetical (`task.progress`'s detail changed shape at 0.3.0, no changelog). **Stopping is right for
the rare one and catastrophic for the common one, and the string cannot tell them apart** — so *stop*
is wrong in one direction, *ignore* in the other, and only *report* is wrong in neither.

**The leaning this item was handed and told not to inherit did not carry it either, and that is
checkable rather than a claim about disposition.** The declaration's sentence — that correction 1
*"shrinks ADR 0027's blast radius and removes the second site the against-case was assumed to be true
at"* — was verified and is true. But it argues from **sites**, and the decision turned on
**producers**; a different argument reached the same place, so the leaning was never load-bearing.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, green** | `npm run gate` runs all of it: `check-spec` 8 checks / 7 docs / 30 examples / **74** rules (`ID-R5` is new), `check-source` **11 checks over 13 published files** (S1-S11), `check-scheduler` 4 checks + **12/12** self-test probes, `check-policies` 4 checks + **13/13** probes and 6 META, `check-docs` 5 checks + **14/14** probes, `deno lint` over 42 files, `typecheck` over all five projects. *(Each figure is read from that script's own summary line. This row first said **"check-source 42 files"** — 42 is `deno lint`'s count, two scripts further down. `CLAUDE.md`: **a count in prose states the predicate that produces it**, and the Record is not exempt.)* **Read from the exit code, not through a grep** — W17 lost a round to that |
| L1-L5, three runtimes | **RAN, green** | `npm run gate` → **410 assertions × {node 24.20.0, deno 2.9.6, chromium}**, parity asserted against node. Was 386 at `783c1bb`. **The browser rung is CHROMIUM ONLY** — that is what `npm run gate` runs (`scripts/run-browser-tests.mjs:68`); firefox and webkit need `npm run test:browser:all`, **which was NOT run for this item** |
| L6 | **NOT RUN — by declaration**, and it is W19's | The `Gate:` line excludes it: this item's whole surface is fixtures over a fake. It nonetheless stayed green throughout at **342 assertions / 19 real runs × {node, deno}**, because `npm run gate` runs it — so nothing here broke it, which is weaker than testing it and is worth exactly that much |
| ADR 0027 | **RAN** — written, three options costed from measurements in this file, Consequences answerable | Its *Alternatives rejected* costs *"stop the run, and the precondition stands"* first and by name, because this item was entitled to reach it |
| conformity reader | **RAN** — **2 BLOCKING, 5 SHOULD FIX, 9 NOTE; all sixteen acted on** | See *What broke*. Both BLOCKING findings were about **this file** |
| adequacy reader | **RAN** in an isolated copy — **35 mutations, 10 survivors, 2 BLOCKING**; all ten acted on | `cp -r node_modules` into a copy off the tree; **zero symlinks and zero reparse points measured first**, copy verified green (402 / spec / docs / typecheck) **before** the reader started, links scanned before removal. It restored the copy itself; the copy is left in place rather than `--force`d away |
| re-run after the findings | **RAN, green** — in the working tree | **No commit exists**: this item was not asked to commit, so there is no sha to name. The re-run is `npm run gate`, **exit code 0 read directly**, against the tree carrying every fix below — 410 × 3 runtimes, 342 × 2 at L6, `check-spec` at **74** rules |
| rule 8 provocations | **RAN — 35 probes, 35 tripping exactly their declared set** | Written to **both** obligations. The set and its harness are in the session scratchpad (`provoke.mjs`), recorded as edits precise enough to re-run, which is what rule 8 asks rather than rule 7 (a)'s checked-in form. **Two probes declare the EMPTY set on purpose** and that is the finding, not a pass: `AGENTS.md`'s prose and `spec/**`'s prose have no route to red |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) ADR 0027, naming what it does **not** change | **yes** | `check-spec` `C5` — four `spec/` links and `doc/decisions/README.md`'s row resolve to it. **Provoked**: moving the file away fails `C5`. Its *"what it does not change"* half is asserted rather than promised — see (2) |
| (2) what it ships in `src/driver/driver.ts` | **yes** — tier 0, `UnmintedTask`, `onUnmintedTask` | `test/driver/lifetime.test.ts`'s `ID-R5` suite: 11 cases. **Provoked nine ways** — restore the throw, delete the report, parse the `runId`, coerce `taskId`, constant the `event`, replace the `reason` (both directions), condition it on the terminal state, fall through instead of returning. Every one is caught. The **three sites it does not change** are asserted too: `resolve()`'s unreachability, the fold's throwing calls, and the `FD-V16`/`ID-R2` charset equality the whole argument rests on |
| (3) `OR-R10` / `ID-R4` amended, and `ID-R5` added | **yes**, and **`spec/join-policy.md` section 4 as well** — see the late exception | `check-spec` `C2` (rule ids unique), `C6` (every rule names a test owner), `C8` (three `spec/README.md` version rows). **Provoked**: renaming `ID-R5` out of the namespace and stripping its owner cell each fail `check-spec` |
| (4) the early-settling stub policy (Q95) | **yes** — two cases and two stub policies in `test/driver/driver.test.ts` | Deleting the `unsatisfiable` latch (`settleJoin`) was **0 failures of 386** before this item and is **2 of 402** now. **The stub's own precondition is asserted**, after two provocations showed it passing vacuously — see *What broke* |
| (5) `MultipleRuns`' message (Q87) | **yes** | `test/driver/fold-inputs.test.ts` asserts the **text**, not the class — `throws(…, 'MultipleRuns')` matches the name and would pass with the sentence still wrong, which is how the defect survived two plans. **Provoked twice**: dropping the phrase, and keeping the phrase while dropping the rule behind it |
| (6) `AGENTS.md` — the prose row AND the snippet's ninth class | **yes**, and the snippet no longer compares against itself | `check-docs` `X3`/`X4`. **Provoked**: dropping `InvalidTaskId` from the documented list now fails `X4`; **neutering the discovery half makes the same omission pass again**, which is the second, independent route confirming the discovery half is what does the work |

**`Owns` audit.** By hand, after the record step, with `git diff --name-only` and
`git ls-files --others --exclude-standard`. **Every file accounted for.**

| | files |
|---|---|
| `Owns` | `src/driver/driver.ts`, `test/driver/{driver,lifetime,fold-inputs}.test.ts`, `spec/outcome-record.md`, `spec/task-id.md`, `spec/README.md`, `AGENTS.md` |
| record step (`doc/workflow.md` section 1 rule 5 — no exception needed) | `doc/plans/p6-*.md`, `doc/README.md`, `CLAUDE.md`, `README.md`, `doc/open-questions.md`, `doc/decisions/**` (ADR 0027 new, ADR 0023 corrected, `doc/decisions/README.md`'s row) |
| declared exception, **unused** | `scripts/check-source.mjs` — ADR 0027 created no refusal `src/` must not make. **Rule 7 (c) unexercised for the fourth plan** |
| declared **late** | `scripts/check-docs.mjs` ([Q102](../questions/q102.md)), `spec/join-policy.md` (the conformity reader's finding 3) — both in the Exceptions table above, with why neither could have been declared first |
| the item's own file | `doc/work-items/w18-*.md` |

**19 files, and every one accounted for**: 8 `Owns` + 7 record-step + 2 late exceptions + this file
(18 modified, 1 untracked — ADR 0027). **`src/driver/ids.ts` is deliberately NOT among them**: the
provocation harness mutated it and the restore did not cover it, which is recorded under *What broke*;
it is back at `HEAD` and `git diff` over it is empty.

**Six items have now audited their `Owns` set correctly and this is the first to audit it *wrong* in
a new way**: the set was right and **two files outside it had to move anyway**, for reasons created by
the work rather than knowable at declaration. `check-owns.mjs` would not have helped — it would have
reported the two edits, which is what this table already does.

**What broke.**

**Three of my own provocations found real holes, and all three are the same shape: a clause I could
state but not falsify.**

1. **The `instanceof InvalidTaskId` rethrow cannot fire and no test can kill it.** The `try` wraps
   exactly one call raising exactly one class, so widening it to bare `catch (e)` changes nothing
   reachable — it survived the unit suite and was caught only by an *unused-import* typecheck error,
   which is an accident. The guard is kept as a **forward** guard and the code, the ADR and the test's
   comment all now say that instead of claiming it is exercised. *A defensive clause that cannot fail
   is not a defect; describing it as though it could is.*
2. **The two Q95 cases passed vacuously under two independent mutations.** Weakening the stub to
   settle on the *second* arrival, and deleting the third settlement, each made *"an event follows the
   settlement"* **false** — and each left every assertion green, because the cases asserted what the
   driver did and not that the situation they exist for occurred. Under either, *at most once* is
   satisfied by there being only one chance. **Two independent routes, which is what
   `doc/workflow.md` v0.7 change 2 asks before calling something a survivor.** Fixed by asserting the
   precondition in `bothArrive` itself.
3. **`AGENTS.md`'s new `run` snippet could lose both its assertions with the gate green.** `X4a` asks
   whether a `run` snippet contains a `throw`; the demonstrated `mintedByADriver` helper's own
   **rethrow** answered yes on the assertions' behalf. Rewritten without a rethrow, so `X4a` sees only
   assertions. The general weakness is [Q104](../questions/q104.md).

**The conformity reader found sixteen and both of its BLOCKING findings were about this file.**

| | |
|---|---|
| **BLOCKING** | P6's Record and `CLAUDE.md` both claimed W18 *"says so in its Exceptions table"* about `check-docs.mjs` — **and the table had one row, which was not it.** The register (Q102) stated the fact correctly and the two documents describing the remedy stated it wrongly. **This is `doc/` unchecked, in the sub-case where the item was writing about its own compliance** |
| **BLOCKING** | Five indexes said W18 was DONE while this file said `Status: todo` with an empty Record — **`doc/workflow.md` section 1 rule 5's own provenance clause, violated by the item the clause protects.** The rule says a claim is read from the item's file; here the item's file was the last thing written, so every reader of an index would have been misled in the meantime |
| **SHOULD FIX ×5** | `spec/join-policy.md` section 4 fixed **neither** thing Q95's stub asserts (finding 3, the sharpest — see the late exception); a count contradicting its own enumeration in `spec/outcome-record.md` *and* the code mirroring it (*"three … two … and two"*); the two-driver case asserting **lengths** while its message claimed **run ids**; `check-docs.mjs`'s comment citing a snippet the item had deleted; `Q101` struck through in the cluster table and `open` in its row |
| **NOTE ×9, all acted on** | Two overclaims corrected — *"`InvalidTaskId` cannot reach `onRunFailure`"* is true of the **library's** raise sites and not of the field, since `kind` is `err.constructor.name` and §9 now tells consumers to call `parseTaskId`; and ADR 0027 rule 5's stated mechanism was the **weaker half** (`:154`/`:179` sit inside branches a new kind would not reach — what it would hit is `step()`'s unguarded fallthrough). A `reason` describing the `''` **we** substituted rather than the absent id the scheduler sent, in exactly the case a consumer is debugging a skew. A throwing `onUnmintedTask` stopping the run, reinstating the damage the ADR removes — documented in code and in §9 rather than guarded. `README.md`'s stale *"fifteen runs"* for L6. An orphaned sentence fragment in §9. Stale line numbers in the ADR's table, which states its baseline commit, so honest |
| **CONFIRMED, and these are results** | The register census re-derived independently and matching character-for-character: **77 rows, 27 resolved, 50 open**, with the partition checked both ways. The tier ordering, the per-**event** report count on the `user_action` pair, `resolve()`'s unreachability, `ID-R4`'s one surviving precondition, and the nine exported `Error` subclasses |

**The adequacy reader ran 35 mutations, found 10 survivors and 2 BLOCKING, and both blocking ones
were in the guards I had just written to close the readers' earlier findings.**

| | |
|---|---|
| **BLOCKING** | **`ID-R5` is one guard over SIX refusals and five of them were never delivered.** Every fixture was `nightly-cleanup`, `not-a-task-id` or a missing `id` — all single-segment and colon-free, all reaching only `parseTaskId`'s **arity** refusal. So `if (taskId.includes(':')) throw e;` narrows tier 0 to colon-free ids **with all 402 green**, restoring ADR 0023 rule 2 for five of six shapes; and so does `taskId.startsWith(this.runId + ':')`, which is **character-for-character ADR 0027's own last rejected alternative**. `r1:ingest:x:0` — the *"corrupted id for a task that IS ours"* the whole decision argues about — was never once delivered. **Seven shapes now are**; the two edits cost **6** and **5** failures |
| **BLOCKING** | **The precondition I added to `bothArrive` two hours earlier admitted a trailing event that never re-enters `settleJoin`.** One token — settling the second branch `user_action` instead of `done` — emits `branch.suspended`, which satisfies *"a region event follows"* and then **returns before `advance()`**. With that, deleting the `unsatisfiable` latch was green again at 402: **Q95 restored by the guard written to prevent it.** Now asserted on the three **terminal** region events, which are the ones `spec/join-policy.md` section 4 says status is asked after. The edit costs **2** failures |
| **SHOULD FIX ×2** | ADR 0027 chose *"documented rather than guarded"* for a throwing `onUnmintedTask` and **nothing asserted the choice** — wrapping the call in `try {} catch {}` was green, silently reversing a stated ADR position and a bold `AGENTS.md` warning. Three observables flip; three are now asserted (**1** failure). And the `AGENTS.md` snippet compares its `documented` **array** against the exports, so *documented* means *"in this array"* — **deleting section 9's whole `InvalidTaskId` paragraph is green**. That half is recorded on [Q101](../questions/q101.md) rather than fixed: nothing ties a prose paragraph to a snippet |
| **NOTE ×6, four acted on** | The `describe`-before-latch comment claimed an unreachable difference — **the `instanceof` finding one function away and uncorrected**, so the comment is now a forward guard like its neighbour rather than a claim (it stays unfalsifiable, deliberately). The single-driver `runId` case used `run-a`, equal to the constant it was pinning, so replacing `this.runId` with `'run-a'` passed it; a run id no other case uses makes it independent (**1 → 2** failures). And **`spec/**` prose has no route to red**: three separate deletions survive, including section 4's new clause — the one artifact this item took a late `Owns` exception to write |
| **CONFIRMED** | Everything else in the declared surface is load-bearing, with kill counts recorded: the tier-0 report (8), reinstating ADR 0023 rule 2 (8), a constant `event` (2), coercing `taskId` (1), each half of `reason` (1 each), gating tier 0 on `done` (2 — **so the three-state rows are real coverage, not one assertion three times**), moving `normalizeEvent` inside tier 0's `try` (3), reporting tier 1 (1), de-duplicating reports and breaking the ADR 0007 pair (1), appending a `FoldInput` at tier 0 (1), the `unsatisfiable` latch (2), section 4's *once* and *terminal* halves **separately** (1 each), `MultipleRuns`' advice (1), widening `SEGMENT` so `FD-V16` and `ID-R2` diverge (1). `RUN_FLOOR` is 14 against 14 — exact, not slack |

**The provocation harness itself produced two findings, and one of them was damage.**

1. **A mutation harness that does not restore is a mutation.** `provoke.mjs` backed up eight files
   and two probes reached outside that set — `src/driver/ids.ts` and **`spec/join-policy.md`**. Neither
   was restored, and one of them **deleted the section 4 clause this item took a late `Owns` exception
   to write**, leaving the tree carrying a spec that contradicted two passing tests. **Found only
   because the same probe's anchor then failed to match on a re-run** — nothing else would have said
   so, and `check-spec` was green over the damaged file the whole time. Both files are in the restore
   set now, and the file names its own rule at the top.
2. **A test that reads `src/` passes in node and deno and fails in chromium.** The charset-equality
   case first compared the two regex *literals* as source text; the browser bundle can read nothing
   from disk (`RT-R1` — three runtimes from one source tree), so it went red at L1-L5 in the third
   runtime only. Rewritten to assert the **property** — `FD-V16` accepts a node id exactly when
   `buildTaskId` does, over thirteen candidates — which is portable *and* strictly stronger: it
   survives either constant being rewritten in an equivalent form, which a text compare would have
   called a failure. **The runtime axis caught a test, not a library defect**, which is `RT-R1`'s
   *"read as ceremony and was not"* one rung further in.

**Overlap between the two readers: 2 of ~26** — the throwing `onUnmintedTask`, which the conformity
reader reached by reading the callback's position in the listener and the adequacy reader by
swallowing it and watching nothing go red; and `spec/**` prose being uncheckable, reached from a
missing rule and from a surviving deletion. **Ninth measurement, and inside the 1-4 band `doc/workflow.md`
section 6 says to carry.**

**The sharpest NOTE became a test.** *"`InvalidTaskId` cannot reach `onRunFailure`"* holds only
because `ID_RE` in `src/definition/validate.ts` and `SEGMENT` in `src/driver/ids.ts` are the **same
expression** — `advance()` and `dispatch()` call `buildTaskId` from inside the listener, where a throw
becomes a `RunFailure`. **Two regexes agreeing was load-bearing and unasserted**; widen `FD-V16` by one
character and `spec/outcome-record.md` section 6 is false with everything else green. There is now an
assertion.

**What this taught.**

1. **A decision's *conclusion* and its *argument* fail independently, and P5 said so about its own
   prose one plan before this happened to the plan itself.** P6's third option was right; P6's
   argument for it — *the against-case is about silence, not stopping* — is a claim about the
   objection's grammar and would have survived being wrong. The producer table is what makes the
   decision checkable, and it took twenty minutes to build.
2. **Writing a stub for an unreachable seam does not make the seam reachable, and the stub is where
   to look.** Q95's two cases assert the right things about the right exit and **both passed with
   their own precondition false**. The instrument that creates the situation needs an assertion that
   the situation occurred — which is W17's `joinSettledBy` finding in a second file, and therefore a
   **second occurrence** of *a load-bearing test input held down by nothing*.
3. **Rule 8's two halves found different classes here, and neither half found the other's.** The
   rule-written half found the `instanceof` unfalsifiable and the `reason` under-specified; the
   `Outputs`-written half found both Q95 cases vacuous and the `AGENTS.md` snippet's assertions
   deletable. **Three items now, and P5's amendment holds on a fourth sample.**
4. **An item that writes its indexes before its own file breaks the rule written to protect it.** The
   provenance clause is v0.7 change 4 and it is about *readers*; W18 is the first occurrence of the
   **writer** side, and it produced five documents claiming DONE over a file reading `todo`. **The
   cheap rule, if P6's retro wants one: the item's own `Status` and Record are the FIRST record-step
   file written, not the last.**
5. **`spec/**` needs v0.7 change 3's fix and does not have it.** `doc/decisions/**` was added to the
   record step because *a gap that blocks a fix is worse than one that hides an edit*. This item hit
   exactly that in `spec/join-policy.md`: a rule the code has always enforced, that the item's own
   stub made load-bearing, and that no document stated. **Which clause a stub makes load-bearing is
   not knowable before the stub exists**, so no declaration could have foreseen it — which is the
   argument that the record-step list, not the declaration, is the wrong-shaped thing. **Second
   occurrence of change 3's class, in a second directory.**

**Questions raised.**

| Q | |
|---|---|
| [Q101](../questions/q101.md) | `AGENTS.md`'s executed error-class snippet was a closed list compared against a copy of itself, so it omitted an exported class with the gate green — a third form of *the gate cannot see absorption*. **Instance fixed; the class is not surveyed** |
| [Q102](../questions/q102.md) | `check-docs.mjs`'s `RUN_FLOOR` is a ratchet an item is obliged to raise, in a file no item owns and that is not a record-step file. It went stale silently and the probe written to catch a deleted snippet **passed** |
| [Q103](../questions/q103.md) | `fold()` — a pure function — throws `InvalidTaskId`. ADR 0027 keeps it throwing on purpose and did **not** take the question of whether a pure fold over a log may throw at all. Interacts with durability ([Q15](../questions/q15.md)) |
| [Q104](../questions/q104.md) | `check-docs`' `X4a` is satisfied by **any** `throw` in a `run` snippet, including one belonging to the code being demonstrated. Found on a snippet this item had just written |

**Q105 and Q106 are unused and are skipped, never reissued** (`doc/workflow.md` section 3).
**ADR 0028 is unused and skipped** — ADR 0027 did not split; Q87's message turned out to be a
one-sentence defect rather than a second decision, which is what the reserve was held against.
