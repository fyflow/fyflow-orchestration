# P_ — <slice name>

**Status:** planning | in progress | ✅ complete — <date>
**Question this plan answers:** *<one sentence, in the form of an actual question>*
**Exit artifact:** *<a run that routed correctly, a measured number, a trace - something a human can
look at>*
**Reserves:** W__-W__, Q__-Q__, ADR ____-____

---

## Why this plan, and why now

*What is missing, what it blocks, and what we will know afterwards that we do not know now.*

## Scope

**In**

1.

**Out** — named rather than left implicit

-

## Decisions taken before fan-out

*`doc/workflow.md` section 7 rule 3: decide, then fan out. Anything decided here that is
architectural gets an ADR; anything unresolved gets a Q id and is listed under Open questions.*

*For any plan that touches routing: **Q1, Q2 and Q4 must be resolved or explicitly scoped out
before fan-out.** A driver, a definition format and a join designed in parallel from open questions
will not compose.*

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W_ | | | | |

Each has its own file under `doc/work-items/`. This table is an index, not the declaration.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| | | |

## Record

*Filled in at the join, after the work items are merged.*

**Exit artifact.** *Where it is, and how to re-produce it.*

**What the plan answered.** *The question above, answered - including "no" or "not the way we
thought".*

**Retro.** *`doc/workflow.md` section 6 pass 3. "No change" is an expected verdict. The first plan's
retro also judges the adaptations listed at the end of `doc/workflow.md`.*
