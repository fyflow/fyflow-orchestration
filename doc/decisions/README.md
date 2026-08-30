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
carries the only instance: a trailing clause of rule 7 contradicted rule 4 three lines above it, and
was removed rather than superseded. **Deleting the correction notice would be the violation**, not
the edit.

Use [TEMPLATE.md](TEMPLATE.md).

## Index

| # | Decision | Raised by | Date |
|---|---|---|---|
| [0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md) | Routing executes in the driver, outside the scheduler | Q1 | 2026-08-30 |
| [0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) | A flow definition is data, and a predicate is registered by name | Q2 | 2026-08-30 |
| [0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) | A join is satisfied when its region has no live branches, not when N have arrived | Q4 / W4 | 2026-08-30 |
| [0004](0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md) | A non-success outcome routes only where an edge opts in, and `user_action` suspends | W1 | 2026-08-30 |
| [0007](0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) | The driver normalizes every scheduler event into an immutable outcome record | Q31 | 2026-08-30 |

**Why 0005-0006 and 0008-0009 are missing.** [P1](../plans/p1-what-satisfies-a-join.md) reserves
**0003-0006**. **0003 was held for Q4's answer from the day P1 was written and is now spent** —
W4's matrix, not an argument. **0004 was allocated by W1**, which reserved 0004-0005; 0005 and 0006
are unallocated, and W2 reserved 0008-0009 and used neither. ADR 0007 did not come from P1's
work items at all — it came from reading `../fyflow-scheduler/RESOURCE_EVENTS_PLAN.md` — so it took
the next number outside the block, which is why it landed before two of P1's own. Gaps are free;
renumbering is not (`doc/workflow.md` section 3).

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

