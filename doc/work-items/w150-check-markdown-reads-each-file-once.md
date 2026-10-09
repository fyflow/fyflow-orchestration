# W150 — `check-markdown.mjs` reads each file once: one read cache and one existence cache shared by the walk and its three probe trees

**Status:** done 2026-10-09 — see the Record. Declared on `0bdc329` (committed `50295d9`), before any file under `Owns` was edited.
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

Built on `50295d9` (the declaration), code at `2b08095`, the conformity reader's findings acted on at
`64bffc4`. Every command below was redirected and its `$?` read in the same command; logs are under
dev-dist/w150-26316/.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| check:markdown, byte-identical | RAN, EXIT 0 | `before-md.out` (on `50295d9`) against `after-md.out` (`2b08095`) and `after2-md.out` (`64bffc4`): `cmp` identical both times. A `git archive` copy with the old script gave the same bytes, so the comparison is across the code, not across the tree |
| check:markdown:selftest alone | RAN, EXIT 0 | before 788 s (`before-st.log`); after 338 s (`after-st.log`, `2b08095`) and 339 s (`after2-st.log`, `64bffc4`): 44/44 probes caught, **56/56 noticed** (33 by the named probe, 23 by the corpus), 7/7 bounded |
| check-spec (C5's caller) | RAN, EXIT 0 | `spec-after.log`; the reader compared old and new output byte for byte |
| rule 8 | RAN, 2 passes, 0 harness failures each | see below |
| conformity reader | RAN, once, on a still tree | 0 blocking, 1 should-fix, 6 notes; see below |
| `npm run gate:item`, before | RAN, EXIT 0 on `50295d9` | `before.log`: **self-test wall 1351.5 s**, binding lane markdown 1335.2 s; whole command 1492 s |
| `npm run gate:item`, confirming | RAN, EXIT 0 on `64bffc4`, once, on a still tree | `item.log`: **self-test wall 885.1 s**, markdown 727.8 s, binding lane docs 869.2 s (wiring 867.7 s); whole command 1027 s |
| adequacy reader | NOT RUN | one reader, as the brief states |

**The measured saving, against P31's estimate.**

| | before | after | change |
|---|---|---|---|
| `node scripts/check-markdown.mjs`, median of 9 | 1425 ms | 519 ms | **−64%**, and below the ~820 ms P31 measured before W144 |
| check:markdown:selftest alone | 788 s | 338 s | −450 s |
| the markdown lane inside gate:item | 1335.2 s | 727.8 s | −607 s; no longer the binding lane |
| **gate:item's self-test wall** | **1351.5 s** | **885.1 s** | **−466 s, about 7.8 minutes**, against P31's *about 7 minutes*. Not materially different, so no stop-and-ask |

The estimate's mechanism held: the wall is now set by the next lane (docs 869.2 s, wiring 867.7 s).
These are single runs on one machine, the before on `50295d9` and the after on `64bffc4`, with only this
item's two scripts changed between them.

**Where the saving is, measured by rule 8's `s` probes** (median of five, same machine, same session):
the unmutated check 553-557 ms; the TEXT cache never stored 596-598 ms; deriveFloors given a fresh cache
590-596 ms; the KIND cache never stored **1075-1091 ms**. *The stat cache is almost all of it.* The
prototype in P31's Retro cached `existsSync` and reads, and measured ~1170 ms. This item also routes
`isMarkdownFile`'s `statSync` through the same cache, which the prototype did not. A cache of derived text
(`blankCode`, `anchorsOf`) stays Out: about 40 ms is left to win.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the before measurement | yes: `before-md.out`, `before-st.log`, `before.log`, and the timing above | nothing mechanical. It is the evidence the other rows are compared with |
| (2) one cache, below `absent` and `rewrite`, threaded through the walk and deriveFloors; check-spec's call unchanged | yes: `fileCache`, `kindOf`, `rawText` in scripts/check-markdown.mjs; `deriveFloors` refuses a missing cache | `absent` above it: META entries 1 and 2 (`measured`). `rewrite` above it: META entries 3 (`corpus`, [M5]) and 4 (`measured`). A failed stat cached as existing: the dead-link probe (rule 8 `k1`). The default removed: check-spec crashes (`x2`). The deriveFloors refusal: `x1`. Not sharing: no verdict moves, survivor S3 |
| (3) the birth provocation, checked in | yes: **four** META entries (the declaration said three; the reader's finding 2 added the fourth) and MIN_META 52 → 56. **One** existing META anchor was re-pointed (*counted ALIVE*). The declaration said *two*; the second, *the strip NOT applied*, anchors on a line the edit kept, as the reader's finding 1 says | each entry made vacuous: `t1`. One deleted: `t2`, `t3` (the floor) |
| (4) the evidence | yes: the Gate table and the measured saving above | — |

**Exceptions, reconciled.** `git diff --name-only 0bdc329 HEAD` before the record step lists exactly the
three files in `Owns`, and `git status --short` was empty. The record step adds P31's plan file (its Retro
section 10, one dated line; a record-step file under workflow section 1 rule 5). **No exception was asked.**

**Rule 8.** Harness dev-dist/w150-26316/rule8.mjs, with scenario.mjs for the in-process second routes. It
mutates the REAL tree one probe at a time and checks each anchor against the CURRENT text, aborting on any
count other than one. It asserts every edit changed its input. It restores to the FIRST snapshot and
compares the bytes, and it digests the tree before and after. It refuses to grade under any Node but 24.
Each `must` was copied from a failure line seen in a discovery run on a copy (`discover.log`).

- **Pass 1** (`rule8-pass1.log`, `2b08095`): 25 probes, 0 harness failures, digest equal.
- **Pass 2** (`rule8-pass2.log`, `64bffc4`): 31 probes. The six new ones are the reader's exact edits (E2b, E4, E5/E6, E7) and the entry its finding 2 checked in (`r3d`, `t3`). 0 harness failures, digest equal.

Controls and graders:
- **No-op controls**: `c0` (the corpus, byte-identical) and `c1` (probe 2) are GREEN.
- **CRASH graders**:
  - `x1`: deriveFloors called without the cache. **On its first discovery run this came back GREEN, which is a finding**: `resolveLinks` takes `undefined` as *use the default*, so each tree silently got a fresh cache. The refusal in deriveFloors was added for it.
  - `x2`: resolveLinks' default removed, so check-spec dies.
- **WRONG-REASON grader**: `w1`. M3 is disabled and graded against the `measured` line, and it comes back WRONG.

**Declared survivors, by id.** Each was run against the rung its reason names, and each has a second route that shows the clause reachable:

- **S1** (`r3`, `e4`): the rewritten text WRITTEN BACK to the cache. It reaches nothing, because the strip tree runs last.
  - Second route: `r3b`/`r3d`, with M5 moved first, RED (`measured` on *decisions removed*). Its control `r3c` (the reorder alone) is GREEN.
  - **Checked in as META entry 4 after the reader's finding 2**, so the form is observed whenever the order changes. The plain write-back stays a survivor on this order.
- **S2** (`k2`): `isMarkdownFile` asks *anything there* rather than *a file*. No directory in the tree is named `*.md`.
  - Second route: `k2b`, in process, where a directory named d.md with an anchored link throws EISDIR.
  - The old `statSync().isFile()` had the same reach.
- **S3** (`s1`, `s2`, `s3`, `e7`): the cache not stored, not shared, or the guard and the argument removed together. Every verdict is right and only the time moves.
  - Second route: the timings above (1091 ms with no kind cache).
  - Performance has no correctness observer, by design. The report must stay byte-identical, so it cannot carry a counter.
- **S4** (`n1`, `e5`): the per-call anchor cache made shared. No probe tree rewrites a heading.
  - Second route: `n1b`, in process, where a heading-changing rewrite after the walk DIFFERS from a fresh cache.
- **S5** (`e2b`): a probe tree's removal stored only on a cache MISS. The walk has already filled every path the strip tree asks about, so it is harmless on this order.
  - Second route: META entry 2, the overwriting form, RED.
  - *So not every form of either `absent` direction is provoked*, and that is the reader's finding 4, stated rather than claimed away.

**The conformity reader** read P31's Retro (sections 2, 5 B and 10), W144's Record and the prototype
first, then the code, on a still tree, in its own copy (dev-dist/w150reader-26865/). It found every bullet
of the brief satisfied:

- one cache across the four calls;
- below `rewrite` and `absent`;
- byte-identical, re-checked by `cmp` and by running the old script on the current tree;
- cmp2 kept, with the full self-test green in its copy;
- the call order as the comments state it;
- C5 unchanged, byte for byte;
- no semantic difference between `existsSync` plus `statSync().isFile()` and one cached stat;
- no staleness within a run.

Its findings, and what was done with each:

| # | severity | finding | done |
|---|---|---|---|
| 1 | should-fix | the declaration says two META anchors were re-pointed; the diff re-points one | corrected in this Record (Outputs row 3); the declaration is left as declared |
| 2 | note | the write-back form of *ignores `rewrite`* is green, and its observer (`r3b`) was scratch | **checked in** as META entry 4, MIN_META 56, `64bffc4`; rule 8 pass 2's `r3d` and `t3` |
| 3 | note | the reorder comment said the write-back then reaches *the removed trees*; it reaches one, *decisions removed* | comment corrected, `64bffc4`. Pass 2's `r3d` ran it: RED on that tree's probe, 79 against 63 |
| 4 | note | a removal stored only on a miss survives | declared survivor S5, above |
| 5 | note | the deriveFloors refusal has no checked-in observer | kept as rule 8's `x1`. Removing it together with the argument is S3, because only the time moves |
| 6 | note | the per-call anchor cache has no observer | declared survivor S4, with `n1b` as the second route |
| 7 | note | the docstring's name for entry 3 differs from the entry's title | the docstring now names all four entries as titled, `64bffc4` |

**What broke.**
- **`x1` came back GREEN on its first run.** The docstring had said deriveFloors with no cache *fails loudly*. The code did not, because a destructured default treats `undefined` as absent. The claim was written before it was run, which is the most common defect in this repository by CLAUDE.md's own count. The rule-8 harness caught it before the code reached the tree.
- **The `npx eslint` call in the first after-run was mine and wrong.** `lint` is `deno lint` over `src/ test/ examples/ index.ts` and does not cover `scripts/`. Nothing was broken.

**What this taught.**
- **P31's estimate was right about the total and wrong about the mechanism.** The read cache it prototyped saves about 40 ms. The stat cache saves about 500 ms, because `isMarkdownFile` stats every target once per tree.
- *A cache that ignores a probe tree is caught only in the direction the call order exposes.* Two of its four forms are green on this order (S1, S5). META entry 4 is how the order itself is held.
- No change to the spec, a plan or `doc/workflow.md`.

**The record step** edited P31's Retro section 10 (one dated line under B) and this file; README.md needed nothing. A grep for W150 outside dev-dist/ finds only the item's three files and P31. Of the withdrawn claims, only the declaration's *two existing META anchors* survives, left as declared and corrected above. Afterwards, check:markdown and `npm run state` (W150 done; the ledger reads W151 / Q577 / ADR 0090 against the tree's Q574, because Q574-Q576 are spent) and `npm run gate` were each re-run: EXIT 0 (`record-md.log`, `state-final.log`, `record-gate.log`).

**Questions closed and raised.** None closed, none raised (section 1 rule 6: no stop-and-ask arose). Q574-Q576
are SPENT, unused. No ADR was reserved or issued. **The next plan starts at W151, Q577 and ADR 0090.**
