# W150 — `check-markdown.mjs` reads each file once: one read cache and one existence cache shared by the walk and its three probe trees

**Status:** in progress — declared 2026-10-09 on `0bdc329`, before any file under `Owns` was edited.
**Plan:** none — an item outside any plan, on W98's and W139's precedent. Its source is P31's Retro,
proposal B in section 5 (*shares one read and one existence cache across the walk and its three probe
trees*) and section 10, *the maintainer's answer, 2026-10-09*: **B ADOPTED AS A WORK ITEM**, and the
maintainer chose to make it an item outside any plan. P31's ledger sentence gave the next plan W150,
Q574 and ADR 0090; this item takes W150, so the next plan starts at W151.

*This file carries NO relative link, as W140-W146's files do: ids and paths are bare text, so a link
here moves no probe tree.*

**Question:** *can `check-markdown.mjs` stop re-reading every file and re-testing every target once per
probe tree, with its report byte-identical and its in-memory probe trees still equal to the staged
ones, and what does that save on an item's confirming gate?*

```
Spec:       none changes. The rule is P31's Retro section 5 proposal B and section 10's answer:
            one read cache and one existence cache shared across resolveLinks' four calls (the
            walk, then deriveFloors once per probe tree); the cache sits BELOW `rewrite` and does
            not answer for a path under `absent`; the self-test's comparison of each tree probe's
            fixture with the in-memory measure (W144's cmp2, the observer of rule 8's d6) is kept;
            the gate:item wall is measured before and after, because ~7 minutes is an estimate.
            Workflow section 5 rules 7 and 8; section 1 rule 6 (v0.30). NO ADR is predicted:
            nothing a check decides changes, and the report is byte-identical
Owns:       scripts/check-markdown.mjs
            scripts/check-markdown-selftest.mjs
            this file
Inputs:     P31's Retro sections 2 (the per-lane walls; the check at ~820 ms before W144 and
            ~2130 ms on HEAD), 5 (proposal B) and 10; W144's Record (d6, cmp2, the probe trees);
            the prototype dev-dist/p31r-25787/cache-probe.mjs, which patched a COPY and measured
            ~1170 ms with a byte-identical report; scripts/check-markdown.mjs and its self-test as
            they stand at 0bdc329
Outputs:    (1) the measurement, BEFORE any edit, under dev-dist/w150-26316/: the check's run
                time (median of several runs), check:markdown:selftest alone, the check's full
                output saved for the byte comparison, and one `npm run gate:item` on a still tree
                (the self-test wall's before figure)
            (2) check-markdown.mjs: one cache object, created once by the script and passed to
                the walk's resolveLinks and to deriveFloors, which passes it to every probe tree.
                It holds each file's RAW text and each path's existence/kind (one stat serves
                both `exists` and `isMarkdownFile`). `absent` is decided OUTSIDE it, before it is
                asked; `rewrite` is applied ABOVE it, to the raw text it returns. Called with no
                cache (check-spec's C5 lift), resolveLinks makes its own, so C5 is unchanged
            (3) check-markdown-selftest.mjs: the birth provocation, checked in as META entries —
                a cache that ignores `absent` (a cached existence served before the probe tree's
                removal is asked) and a cache that ignores `rewrite` (the rewritten text cached,
                or the raw text served past the strip) — each graded RED by its own observer;
                the two existing META anchors the edit moves re-pointed, not dropped
            (4) the evidence: the real tree's report byte-identical before and after; each probe
                tree's in-memory measure equal to its staged fixture's (the self-test's cmp2, on
                every run); the check's run time and the lane's wall after; one gate:item after
Depends on: nothing
Blocks:     nothing
Tests:      the check's own output on the real tree, compared byte for byte with (1)'s saved
            copy — the expected value comes from the tree BEFORE the change, which is what
            "byte-identical" means and not a snapshot of the code under test; the self-test's
            probes, cmp2 and META pass, with the new entries' expected verdicts derived from the
            order the script runs its four calls (the walk first, so a cache that ignores
            `absent` serves the walk's answer to the removed trees, and one that ignores
            `rewrite` serves the walk's raw text to the stripped tree)
Gate:       check:markdown EXIT 0 and byte-identical; check:markdown:selftest EXIT 0; rule 8 over
            every output in dev-dist/w150-26316/ with a no-op control, a CRASH grader and a
            WRONG-REASON grader; one conformity reader on a still tree; `npm run gate:item`
            EXIT 0 ONCE, on a still tree. Not gate:full: no file this item owns is
            scripts/check-register*.mjs, scripts/state.mjs or doc/questions/README.md (workflow
            v0.29), and it is not a plan's last item
Reserves:   Q574-Q576; no ADR. No W beyond W150
```

**Exceptions**: none at declaration. Any file edited outside `Owns` and outside the record step is asked
first under workflow section 1 rule 6, and its YES written here before the edit. **The record step**
(section 1 rule 5) is P31's Retro section 10 (one dated line: B landed at W150, with the measured saving),
`README.md` if needed, and `doc/questions/**` for anything raised. **The drag files, checked up front:**

| file | why it should not move |
|---|---|
| `scripts/check-spec.mjs` | imports `resolveLinks` for C5 and calls it with two arguments; the cache is an optional third, so the call and its result are unchanged |
| `scripts/check-spec-selftest.mjs` | copies check-markdown.mjs beside its META mutants; it anchors on check-spec's text, not on resolveLinks' body |
| `scripts/check-wiring.mjs` | binds lanes and entries in package.json; no entry changes |
| `scripts/selftest-guards.mjs` | the shared instrumented replace; read, not edited |

## Scope

**In**

1. **Measure first**, output (1), on `0bdc329`, with the tree still.
2. **Build the cache**, output (2): one object, raw text and existence/kind, below `rewrite` and
   below `absent`.
3. **Provoke it at birth**, output (3): the two META entries, run RED before the cache is right and
   checked in (section 5 rule 7).
4. **Show** output (4): the report byte-identical, cmp2 holding, the run times and the wall.
5. **Rule 8** over every output, harness in dev-dist/w150-26316/.
6. **One conformity reader**, fresh context, P31's Retro (B and section 10) and W144's Record first,
   then the code, on a still tree; act on its findings and re-run rule 8 with its exact edits.
7. **gate:item once**, on a still tree; the Record; the record step.

**Out** — named rather than left implicit

- **Caching anything derived from a file's text** (`blankCode`, `anchorsOf`). Proposal B is a read
  cache and an existence cache; a derived-text cache is a further saving with its own correctness
  argument, and is named in the Record if the measurement says it matters.
- **Any change to what a check decides, or to the report.** Byte-identical is the gate.
- **The other self-test lanes**, and `scripts/run-selftests.mjs`'s pool sizing (Q433).

## Verification

- `node scripts/check-markdown.mjs > dev-dist/w150-26316/<name>.log 2>&1; echo "EXIT=$?"`, then `cmp`
  against the before log.
- `npm run check:markdown:selftest > … 2>&1; echo "EXIT=$?"` alone, before and after.
- `npm run gate:item > dev-dist/w150-26316/before.log 2>&1; echo "EXIT=$?"` and the same into
  `item.log`, each once on a still tree; the `selftests —` summary line is the wall.
- Routing (Q4, Q17, Q10, Q13, Q6): not applicable — no routing code is touched.

## Record

*Filled in when the item is done.*
