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

**The index is generated, never typed:** `npm run adr -- --index` prints it from every ADR's front
matter, and `npm run adr -- <NNNN>` prints one ADR's. The hand-kept table that stood here, and the
history paragraphs below it, are in `git` before W119.
