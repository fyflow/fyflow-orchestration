# W117 — An ADR's header is data, and supersession is declared once

**Status:** todo
**Plan:** [P28](../plans/p28-what-can-be-looked-up-instead-of-read.md)

```
Spec:       none — P28 decision 2, under ADR 0079 (W116's). No new ADR expected; 0081 is held
            for a decision the work finds
Owns:       doc/decisions/0*.md (header lines and the Status prose they carry, nothing else),
            doc/decisions/TEMPLATE.md, scripts/check-register.mjs,
            scripts/check-register-selftest.mjs, this file
Inputs:     the 46 ADRs at the commit W116 closes on. Their headers are not uniform: 45 carry
            `**Status:** accepted` with prose after it, ADR 0075 carries no Status line, 33 carry
            `**Raised by:**`, 10 carry `**Item:**` instead, and 11 carry `**Supersedes:**`
Outputs:    (1) every ADR opens with front matter per P28 decision 2, followed by its H1
            (2) any Status prose beyond the status word moved VERBATIM into the body, directly
                under the H1 — a correction notice is never deleted (decisions README)
            (3) TEMPLATE.md in the new shape
            (4) check:register R6-R8 and their probes
Depends on: W116 (check-register exists)
Blocks:     W119, W118
Tests:      the header round-trip, against the OLD headers parsed independently; R6-R8 provoked
            in the self-test, each probe declaring its exact set
Gate:       L0-L6 via gate:full; the round-trip; conformity and adequacy readers
Reserves:   Q498-Q501, ADR 0081
```

## Scope

**In**

1. Each ADR's bold-line header becomes front matter. `supersedes` and `amends` list ids and rule
   numbers the ADR's own header states — **never inferred from its body.** Where only the OLDER
   ADR states a supersession (ADR 0066's *rule 7 SUPERSEDED by ADR 0067*), the newer ADR's
   `supersedes` gains it and the item's Record lists each such case by id.
2. `resolves` is filled only where a header's `Raised by:` names a Q **and** that question's file
   says `resolved` naming this ADR. Every other case is listed in the Record, not guessed.
3. Clauses:
   - **R6** every ADR file is `NNNN-<slug>.md`, its `id` is `ADR NNNN`, and its required fields are
     present; `status` is `proposed` or `accepted`
   - **R7** every id in `supersedes`, `amends`, `raised-by` and `resolves` exists
   - **R8** **both directions**: an ADR that `resolves: Q<N>` is named by that question's
     `resolved-by`, and a question whose `resolved-by` names an ADR is listed in that ADR's
     `resolves` (section 5 rule 8 (e))

**Out**

- Any edit to an ADR's decision text — `doc/decisions/README.md`: superseded, never edited.
- Deleting the hand-kept index — W119, once the command that replaces it exists.

## Verification

- `check:register` and its self-test, each by exit code.
- **The round-trip**: an independent parser of every old header against the new front matter —
  *46 compared, 0 fields lost*; a control edit must come back as one difference.
- `npm run gate:full` once, on the final tree.
- *Routing cases: not applicable.*

## Record

*Filled in when the item is done.*
