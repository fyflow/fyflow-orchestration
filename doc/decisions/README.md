# Decisions (ADRs)

One file per architectural decision, `NNNN-<slug>.md`, numbered from `0001`. Numbers are reserved
in a work item's `Reserves:` line before work starts, and are **never reused or renumbered**
(`doc/workflow.md` section 3).

**What earns an ADR:** a choice that would be expensive to reverse, that a future reader would
otherwise re-litigate, or that a piece of code silently depends on. A decision recorded only in a
chat transcript did not happen.

**What does not:** anything reversible in an afternoon, and anything already stated normatively in
`spec/`. A spec rule with a rationale paragraph is better than a spec rule plus an ADR restating
it.

An ADR is **superseded, never edited into a different decision.** The new one names the old.

**Correcting a false statement inside a decision is not changing the decision**, and is done in
place with the correction left visible, dated, and attributed to whatever found it. The test is
whether a reader who acted on the old text and one who acts on the new would do something different
*because the decision changed* — or only because one of them was working from a sentence that was
not true. [ADR 0004](0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
carries one instance: a trailing clause of rule 7 contradicted rule 4 three lines above it, and was
removed rather than superseded. **Deleting the correction notice would be the violation**, not the
edit.

**[ADR 0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) now carries two, and
the pair is worth reading together** — they are the same sentence corrected twice, by two different
readers, a day apart, and **the second refutation was already inside the first**. It is the clearest
evidence this repository has that `doc/` is upstream of every check and is checked by nothing.

**A rule superseded is not the ADR superseded.** ADR 0003's rule 5 is replaced by
[ADR 0025](0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) while
rules 1-4 stand; the notice sits **inside the rule it replaces**, so a reader cannot act on the old
text without seeing it. Marking the whole document superseded would have been false — the decision it
is named for is unchanged.

Use [TEMPLATE.md](TEMPLATE.md).

## Index

| # | Decision | Raised by | Date |
|---|---|---|---|
| [0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md) | Routing executes in the driver, outside the scheduler | Q1 | 2026-08-30 |
| [0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) | A flow definition is data, and a predicate is registered by name | Q2 | 2026-08-30 |
| [0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) | A join is satisfied when its region has no live branches, not when N have arrived | Q4 / W4 | 2026-08-30 |
| [0004](0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md) | A non-success outcome routes only where an edge opts in, and `user_action` suspends | W1 | 2026-08-30 |
| [0007](0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) | The driver normalizes every scheduler event into an immutable outcome record | Q31 | 2026-08-30 |
| [0013](0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) | `fyflow-scheduler` is a **development** dependency, reached from the working tree, and the published library depends on it not at all | Q51 / W5 | 2026-08-30 |
| [0014](0014-the-driver-produces-the-folds-ordered-input-sequence.md) | The driver produces the fold's ordered input sequence, and it is the log with the routing facts interleaved | Q41 / W5 | 2026-08-30 |
| [0015](0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) | A run whose join can no longer fire is `stuck`, the fold decides it, and `regions` did not already hold the data | Q42, Q43 / W5 | 2026-08-30 |
| [0022](0022-a-driver-takes-its-run-at-construction.md) | A `Driver` takes its run at construction, and `start()` takes only the payload | Q53 / W13 | 2026-08-31 |
| [0023](0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) | An inbound settlement is this run's only if this driver dispatched its task id | Q72 / W13 | 2026-08-31 |
| [0025](0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) | The zero-arrival join is reportable, under a third policy id; arrival-counting is not repaired | Q24 / W16 | 2026-08-31 |
| [0029](0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md) | The scheduler is a registry dependency, and nothing here reaches a working tree — **supersedes 0013 rules 3 and 5** | the maintainer | 2026-08-31 |

**0029 takes an id outside every reserved block, deliberately.** [P5](../plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md)
reserves 0025-0026 and [P6](../plans/p6-what-may-share-a-scheduler-with-a-driver.md) reserves
0027-0028; this decision belongs to neither, because it was forced by an **environment change and an
incident** rather than by a plan. Taking a reserved id would have made a plan's ledger false, and
gaps are free while renumbering is not (`doc/workflow.md` section 3).

**The 0022 and 0023 rows were missing until W16 added them** — both ADRs are dated 2026-08-31 and so
is the backfill, so this index was wrong for a day rather than for long, and it was wrong from the
moment each decision shipped. The file that indexes the decisions is not one of `doc/workflow.md`
section 1 rule 5's record-step files, so nothing obliged P4 to write them and no check noticed.
**A fourth address for the same class**, alongside a false register entry (Q43), a stale ADR table
(Q94) and the sentence ADR 0003 has now had corrected twice.

**W5's three are the first ADRs written after a work item ran real code**, and they divide cleanly:
0013 came from measuring an environment, 0014 from a gate that could not otherwise be written
honestly, and **0015 from a register entry being wrong**. That last one is the pattern worth
carrying: [Q43](../open-questions.md) said *"`regions` already records `{0: arrived, 1: exited}`, so
the information is present"*, and it does not — both policies produce that identical value, which is
what `RN-R6` guarantees. **Two of five conformity-pass findings and now one ADR have come from a
plausible written claim nobody had run.**

**ADR 0013 is the first one decided by measuring the environment rather than by reasoning about the
design.** Every claim in its Context is a command that was run — two registry queries, an import that
throws under one runtime and not the other, and a worker file that the sibling's own reference says
cannot work. Three of the four inputs to the decision contradicted something this repository had
written down: that 0.3.0 was *"not yet on npm"* (both registries have the package, at 0.2.1), that
`@fyflow/scheduler` on JSR was an assumption (it is there), and that a `.ts` worker needs compiling
for Node (it does not). **It is also the first ADR whose Context is mostly about a *sibling*
repository's source**, which is the shape to expect from anything downstream of ladder L6.

**Why 0005-0006 and 0008-0009 are missing.** [P1](../plans/p1-what-satisfies-a-join.md) reserves
**0003-0006**. **0003 was held for Q4's answer from the day P1 was written and is now spent** —
W4's matrix, not an argument. **0004 was allocated by W1**, which reserved 0004-0005; 0005 and 0006
are unallocated, and W2 reserved 0008-0009 and used neither. ADR 0007 did not come from P1's
work items at all — it came from reading `../fyflow-scheduler/RESOURCE_EVENTS_PLAN.md` — so it took
the next number outside the block, which is why it landed before two of P1's own. **W4 reserved
0010-0012 and used none; W5 reserved 0013-0015 and spent all three** — the only item so far to
use its whole ADR block. Gaps are free; renumbering is not
(`doc/workflow.md` section 3).

**The third gating question was settled by evidence, and the evidence changed the answer's
shape.** Q4 was [deferred to P1's spike](../plans/p1-what-satisfies-a-join.md) rather than argued,
and **[ADR 0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) went to the
leaning after all** — live tokens. That is not the interesting part. The matrix found that
arrival-counting fails on **six of nine rows** rather than on the one exotic case P1 predicted, and
that an ordinary `optional` task failing is enough to hang it. **The argument was right about the
winner and wrong about the size of the effect**, which is the clearest thing this repo has yet
recorded about deciding by argument.

**ADR 0001, 0002 and now 0003 all went to the leaning stated in `doc/concept.md` section 6.** That
is worth noticing rather than celebrating: a leaning that always wins is a leaning that was doing
the deciding. **Q4 did not break the pattern — it was supposed to be the check on it, and it
agreed.** What kept the exercise honest was that the spike was built anyway: the two guards
`JP-R7`/`JP-R8`, the losing policy shipped rather than described, and a matrix in which
arrival-counting could have won. The finding that arrival-counting fails on the *ordinary* case is
something no amount of leaning produced. The pattern is now three for three, and the next
still-open decision — [Q24](../open-questions.md) — is where to watch it.

**ADR 0007 was the first one no leaning predicted.** It came from four lines of an upstream document
written for a different consumer — a *constraint* forced it rather than a preference choosing it.

**ADR 0004 came from a verification pass rather than from design.** W1's spec-conformity reader
found that `spec/` said in one document that every settlement routes and in another that a failure
does not - **both readings conformed**, which is the failure `doc/workflow.md` section 7 rule 1
exists to prevent, discovered before either W2 or W3 had written a line against it. It is the second
ADR no leaning predicted, and the first raised by a *reader* rather than by an author. Its `optional`
rule is another argument from the substrate: the library already splits *"the flow handles this"*
from *"a human handles this"*, and this decision adopts that split rather than inventing one.

