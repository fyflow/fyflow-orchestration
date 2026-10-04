# W120 — The glossary points at a definition and never makes one

**Status:** todo
**Plan:** [P28](../plans/p28-what-can-be-looked-up-instead-of-read.md)

```
Spec:       none — P28 decision 4. ADR 0080: the glossary points and never defines, so it cannot
            become a third place a term is decided
Owns:       doc/glossary.md, doc/questions/q508.md-q512.md, doc/decisions/0080-*.md, this file
Inputs:     spec/** headings, the ADRs, doc/workflow.md; the term counts P28 measured (gate: 229
            under spec/, 2,588 under doc/)
Outputs:    (1) doc/glossary.md, two tables — PRODUCT (run, region, join, live branch, stuck,
                outcome record, fold input, gate as a node kind, ...) and PROCESS (ladder, rung,
                gate as a command, an item's Gate line, floor, probe, provocation, conformity
                reader, adequacy reader, always-read set, ...)
            (2) one question per term-sense with no defining heading, raised from Q508-Q512 —
                at least the gate collision
            (3) ADR 0080
Depends on: W116 (questions are files, so its questions are written in the new shape)
Blocks:     W119 (`term` reads this format), W118
Tests:      every row's third cell is exactly one relative link with an anchor, and M1/M2 resolve
            it; a term-sense whose only definition is in a work item or plan is NOT a row — it is
            a question
Gate:       L0-L6 via gate:full; one reader, conformity only, spec first: does each row's one line
            say what its target says, and nothing more
Reserves:   Q508-Q512, ADR 0080
```

## Scope

**In**

1. Rows for terms with a heading that defines them in `spec/`, an ADR, or `doc/workflow.md`.
   **The row's one line is shorter than its target and claims nothing the target does not.**
2. The *gate* collision as a question: does one of the three senses get renamed? **This item does
   not rename anything.**
3. Its question links written as `[Q<N>](questions/q<N>.md)` from the start, so W118 has nothing
   to rewrite here.

**Out**

- Adding the glossary to the always-read set — P28 decision 4.
- A check clause of its own. `M1` and `M2` already resolve every link and anchor in it, and W119's
  `term` refuses a row it cannot parse.

## Verification

- `npm run check:markdown` by exit code.
- The conformity reader's row-by-row verdict, in the Record.
- `npm run gate:full` once, on the final tree.
- *Routing cases: not applicable.*

## Record

*Filled in when the item is done.*
