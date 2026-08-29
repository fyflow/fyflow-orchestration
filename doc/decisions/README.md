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

Use [TEMPLATE.md](TEMPLATE.md).

## Index

| # | Decision | Raised by | Date |
|---|---|---|---|
| [0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md) | Routing executes in the driver, outside the scheduler | Q1 | 2026-08-30 |
| [0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) | A flow definition is data, and a predicate is registered by name | Q2 | 2026-08-30 |
| [0007](0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) | The driver normalizes every scheduler event into an immutable outcome record | Q31 | 2026-08-30 |

**Why the jump to 0007.** [P1](../plans/p1-what-satisfies-a-join.md) reserves **0003-0006**, and
0003 is held for Q4's answer. ADR 0007 did not come from P1's work items — it came from reading
`../fyflow-scheduler/RESOURCE_EVENTS_PLAN.md` — so it takes the next number outside that block.
Gaps are free; renumbering is not (`doc/workflow.md` section 3).

**The third gating question has no ADR on purpose.** Q4 - what satisfies a join - is
[settled by P1's spike](../plans/p1-what-satisfies-a-join.md) rather than by argument. The ADR that
records the winner is reserved as **0003** and is written when W4 has run, not before.

**ADR 0001 and 0002 both went to the leaning stated in `doc/concept.md` section 6.** That is worth
noticing rather than celebrating: a leaning that always wins is a leaning that was doing the
deciding. Q4 breaking the pattern is the check on it.

**ADR 0007 is the first one no leaning predicted.** It came from four lines of an upstream document
written for a different consumer, and it is the only decision so far that a *constraint* forced
rather than a preference chose.

