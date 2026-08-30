# W_ — <one line, what this item delivers>

**Status:** todo | in progress | in review | done
**Plan:** `[P_](../plans/p_-<slug>.md)` — a real link once the plan exists; left as literal text
here so a link checker does not chase the placeholder

```
Spec:       spec/<file>.md section _        (or: none - this item defines it)
Owns:       src/<path>/**                   (no other item may edit these)
Inputs:     what it reads, and from where
Outputs:    the typed value or document other items consume
Depends on: W_ (or: nothing)
Blocks:     W_ (or: nothing)
Tests:      what would prove it correct, and where the expected values come from
Gate:       L0-L_, then spec-conformity pass
Reserves:   Q__-Q__, ADR ____-____
```

If any line cannot be filled in, the decomposition is wrong and starting will not fix it
(`doc/workflow.md` section 1 rule 1). `Reserves:` is the id block this item may allocate from -
size it generously; unused numbers are skipped, never reissued.

## Scope

**In**

1.

**Out** — named rather than left implicit, with where it goes instead

-

## Verification

How each clause of `Gate:` is actually run. Name the commands.

*An item that touches routing states which of these it covers, and which it does not:
a branch routed away from its join (Q4), `user_action` (Q17), no matching decision edge (Q10),
a duplicate task id (Q13), a nested fan-out (Q6). "Not applicable" is a fine answer; silence
is not.*

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.** One row per clause of the `Gate:` line above. Each verdict starts with `RAN`
or `NOT RUN`; a clause with no row reads as *did not run*. The last row is the gate re-run at the
commit that acts on the review findings, and it names that commit. **A check this item added names
the provocation that made it fail** (`doc/workflow.md` section 5 rule 7).

| Clause | Verdict | Notes |
|---|---|---|
| L0-L_ | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.** One row per item on the `Outputs:` line, and for each, the
assertion or command that **would fail if it did not exist**. A blank cell is the finding.

| Declared output | Exists | What would fail without it |
|---|---|---|
| | | |

*This table is P1's retro, and it exists because the ladder has no rung for it: L0-L6 climb over
behaviour that exists and never ask whether the item produced what it promised. Six occurrences
across four work items — a join seam that was never built while all 132 assertions passed, an
accessor, a grep reported as a gate, two tests a declaration promised verbatim, and two trees no
typecheck covered.*

**What broke.**

**What this taught.** *What changes in the spec, the plan, or `doc/workflow.md` - or "nothing",
which is a legitimate answer.*

**Questions raised.** *Q ids from the reserved block, with one line each. They also go in
`doc/open-questions.md`.*
