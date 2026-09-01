# W18 — The scheduler edge, and what an id we did not mint means (ADR 0027)

**Status:** todo
**Plan:** [P6](../plans/p6-what-may-share-a-scheduler-with-a-driver.md) — the item that answers
[Q86](../open-questions.md). **It is entitled to reach "stop the run, and the precondition stands"**,
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
| `scripts/check-source.mjs` | **nobody's declared `Owns`** — created by W3, extended by W5 (`S7`) and W16 (`S11`) | **Conditional, and it is P6's Record note 2.** *If* ADR 0027 creates a refusal `src/` must not make — a driver that silently drops an id, say, must not also be free to drop one at `resolve()` — that is a `check-source.mjs` clause, and rule 7 (c) applies to it: checked-in probes, each declaring the exact SET of checks it trips. **If ADR 0027 ships no such rule, this exception is unused and the Record says so**, which is the fourth plan reporting rule 7 (c) unexercised |

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

That is [Q84](../open-questions.md)'s shape with a gate behind it, which is worse: P3's conformity
reader called an omission *"a claim by omission it does not defend"*, and here the omission is inside
the one document the gate keeps true. **`doc/workflow.md`'s standing lesson — rot is what the gate
prevents, absorption is what it cannot see — has a third form: a list the gate executes against
itself is not a list the gate checks.** Raised as [Q101](../open-questions.md).

## Scope

**In**

1. **ADR 0027 — Q86, the scheduler edge only.** The decision, with all three options costed, and
   naming explicitly what it does **not** change: `buildTaskId`'s two outbound refusals, `resolve()`'s
   guarded and unreachable site, and `src/fold/run-state.ts`'s two calls.
2. **Whatever ADR 0027 ships** in `src/driver/driver.ts`, with `OR-R10` and `ID-R4`'s precondition
   sentence amended if it touches them. **Shipping no code is a complete outcome** and the Record
   states it as one rather than as a shortfall.
3. **[Q95](../open-questions.md), closed with a stub.** An early-settling policy under
   `test/driver/**` — the seam has two exits and only one is reachable from what we ship, which is
   this repository's own rule for the case, already applied twice
   (`test/driver/driver.test.ts:389`, `test/driver/fold-inputs.test.ts:176`).
4. **[Q87](../open-questions.md)'s message sentence, and only that.** `MultipleRuns`' text reads
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
- **[Q7](../open-questions.md) — whether a join may time out.** The stub in (3) is an *instrument*.
  Shipping an early-settling policy is a feature question P6 does not take, and the Record must say
  so rather than letting the stub read as a proposal.
- **[Q97](../open-questions.md)** — whether `stuck` should distinguish a reported dead join from a
  silent one. `spec/run-state.md` is **W2's** and is not in this item's `Owns`; **ADR 0026 stays
  held** for it and is not reissued here.
- **W15's generalisation of Q95** — that making `emit` return early once a join has settled also
  survives everything, so *nothing in this repository exercises what happens to a region after its
  join is decided*. The stub in (3) makes **one** event follow a settlement; the general clause is
  larger than Q95 and is re-read at the Record rather than absorbed.
- **[Q90](../open-questions.md)** — `ID-R4` tier 2's missing L6 coverage. Named in P6's Scope/Out and
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

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.** One row per clause of the `Gate:` line above. Each verdict starts with `RAN` or
`NOT RUN`; a clause with no row reads as *did not run*. The last row is the gate re-run at the commit
that acts on the review findings, and it names that commit.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | | |
| L1-L5, three runtimes | | |
| ADR 0027 | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.** One row per item on the `Outputs:` line, and for each, the
assertion or command that **would fail if it did not exist**. A blank cell is the finding.

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) ADR 0027 | | |
| (2) what it ships in `src/driver/driver.ts` | | |
| (3) `OR-R10` / `ID-R4` amended or explicitly not | | |
| (4) the early-settling stub policy (Q95) | | |
| (5) `MultipleRuns`' message (Q87) | | |
| (6) `AGENTS.md` — the row AND the snippet's ninth class | | |

**`Owns` audit.** `git diff --name-only` and `git ls-files --others --exclude-standard` against the
`Owns` block, by hand, **after** the record step. `check-owns.mjs` stays retired.

**What broke.**

**What this taught.**

**Questions raised.** *Q ids from the reserved block, one line each. They also go in
`doc/open-questions.md`.*

| Q | |
|---|---|
| [Q101](../open-questions.md) | `AGENTS.md`'s executed error-class snippet is a closed list compared against itself, so it omits an exported class with the gate green — a third form of *the gate cannot see absorption* |
