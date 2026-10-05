# W25 — A link is a link and an anchor is an anchor

**Status:** **done** - 2026-09-03
**Plan:** [P8](../plans/p8-what-can-be-deleted-with-the-gate-green.md)

```
Spec:       none - this item defines it. The C-ids are `scripts/check-spec.mjs`'s own
            vocabulary and no spec/ document names them
Owns:       scripts/check-markdown.mjs           (new)
            scripts/check-markdown-selftest.mjs  (new)
            scripts/check-spec.mjs               (W1)
            doc/scheduler-upstream.md
            package.json                         (shared with W24, which is done)
            scripts/check-source.mjs             (W24 — a LATE exception, see below:
                                                  S12 obliges it and P8's table predates S12)
Inputs:     every *.md ON DISK under doc/** and spec/**, plus README.md, AGENTS.md
            and CLAUDE.md at the root - the walk reads the filesystem, not the index,
            so an untracked scratch .md under doc/ is scanned and fails the gate, and
            examples/README.md is scanned by nothing. Said as "tracked" first, which
            is not what the code does (W25's conformity reader). Nothing else; this
            item reads no source and no test
Outputs:    scripts/check-markdown.mjs holding the LIFTED C5 plus new anchor and
            span-blanking clauses, scripts/check-markdown-selftest.mjs with a
            MIN_PROBES floor, a `check:markdown` entry in package.json that S11 and
            S12 then guard, and doc/scheduler-upstream.md's fourteen dead anchors fixed
Depends on: W24 - which widened S12 to a named list, so this item's new entry lands in
            the WIDENED list rather than the narrow one
Blocks:     nothing. This is P8's second and last item
Tests:      the probes, checked in and re-runnable (`doc/workflow.md` section 5 rule 7),
            each declaring the exact SET of checks it trips. Expected values come from
            the slug rule and the file tree, never from running the check
Gate:       L0 (own coverage), L1-L6 as regression and MUST NOT MOVE, then two readers
Reserves:   Q136-Q140, ADR 0033
```

## Why this item exists

**[Q121](../questions/q121.md): dead relative links in `doc/**` and `AGENTS.md` are mechanically
checkable and nothing checks them**, while `check-spec`'s **`C5`** has done exactly this for `spec/**`
since W1. `doc/` is upstream of every check in this repository and **seven retros have refused to
mechanise it** — and this is the one sub-case that needs none of that argument, because a link target
either exists or does not.

**The live defects are in the half nobody had measured.** `C5` is at
[`scripts/check-spec.mjs:182`](../../scripts/check-spec.mjs) and its pattern is
`\]\(([^)#\s]+)(?:#[^)\s]*)?\)`: it **strips the `#…` and compares the path alone**, and a link whose
target is *only* an anchor (`](#live)`) does not match it at all. So it is structurally blind to a link
whose file exists and whose anchor does not.

## The facts, measured before this item was declared

**Twelve plans and every declaration since have measured a load-bearing fact first, and it has changed
what got written every time.** Four of P8's five hold exactly. **The fifth is the argument behind a
plan DECISION, and it is false** — which is W22's shape one plan on.

| | what P8 says | what one command says |
|---|---|---|
| dead file links | **0** today | **0**, over 54 files. The file half ships **green on day one**, and that is the honest description of it |
| span false positives | **4, in three files**, one a placeholder | **4, in three files** — `doc/open-questions.md` ×2, `doc/work-items/TEMPLATE.md` ×1 (`../plans/p_-<slug>.md`, the placeholder), `w22` ×1 |
| dead anchors | **14 over 9 targets, all nine S-ids** | **14 over 9 distinct targets**, every one in `doc/scheduler-upstream.md`, and **76 anchor-carrying links** in total — so 62 resolve and the check is non-vacuous in both directions |
| the lift is inert on `spec/` | `0 → 0`, and `spec/` carries no anchor links | **0 → 0** over 7 files, and **0** anchor-carrying links. Anchor resolution is inert there, so `C5`'s id keeps its meaning |
| **decision 3's argument** | *"runs are **not** collapsed, which is **the whole difference** between the two-hyphen and three-hyphen forms"* | **FALSE, and the conclusion survives it.** Four slug rules — the declared one, whitespace-runs collapsed, hyphen-runs collapsed, punctuation-to-hyphen — each report **14 dead of 76**. The 14 are dead under *every* rule, because the link text is a fixed string no heading slug produces. Collapsing would not hide them |

**And the fifth measurement is what shapes this item.** The four slug rules disagree about **134, 140
and 295 of the corpus's 584 headings** — `adr-0001--routing-…` against `adr-0001-routing-…`, and
`1-what-this-repo-is` against `1--what-this-repo-is` — and **not one of the 76 links points at any
heading they disagree about.** So:

> **The slug rule is the centre of this check and the corpus cannot falsify it, in either direction.**

**That was true when it was written and this item's OWN FIX made two thirds of it false** — measured
by the conformity reader, corrected here in place. The fourteen repaired `s2---cancel-a-queued-task`
anchors **are** discriminating cases: on the tree as shipped, hyphen-run collapsing costs **14** and
punctuation-to-hyphen **6**, where both cost **0** before. Only whitespace-run collapsing is still
invisible to the corpus. **Fixing the defect built the fixture that proves the rule**, and the probes
stay for all three, because a corpus that happens to discriminate today is not a test.

**And the same shape turned up twice more, neither of them predicted here.** All **76** anchor links
in this repository are **same-file** — zero cross-file — so `p === abs` for every real link and a
provenance mutation on the anchor source changes one expression into an identical one; found by a META
entry coming back *not noticed*. And the file half **ships green** at 0 dead links, so `M1` would pass
on an empty implementation. **Three clauses, three corpora that cannot falsify them.**

That is `doc/workflow.md` rule 8's own territory arriving before the code exists: a clause whose every
variant produces an identical result on the tree it ships against. **The probes have to supply the
discriminating case**, because the repository does not contain one.

**Two smaller corrections, both found by trying to act on the plan.**

- **`C5` is cited in EIGHT documents at P8's declaration and NINE now**, not seven — `CLAUDE.md`,
  `doc/open-questions.md`, `doc/workflow.md`, P7's plan, P8's own plan, W1, W18, W22, and now W24.
  Seven is the count with P8's own file excluded, which is presumably what it did. **The conclusion is
  unaffected and is reinforced**: `doc/workflow.md` section 3 forbids renumbering, so `C5` keeps its
  id and its row in `check-spec`'s report.
- **A bare check id is ambiguous across documents, and there is already a collision.**
  [W20](w20-what-a-nested-region-is.md) uses `C5` as one of its own **probe labels** — *"C5 (the
  `EXPECTED` table's `scoreC` row …)"* — which has nothing to do with `check-spec`'s `C5`. A grep for
  the id finds ten files and two of the matches are a different `C5`. Worth knowing before an item
  goes looking for citations of one.

## The one late exception, and it is [Q102](../questions/q102.md) reproducing inside P8

**`doc/workflow.md` section 7 rule 2's exceptions table, declared as soon as it was found rather
than at the Record.**

| file | why it is edited, and why it is not in `Owns` |
|---|---|
| `scripts/check-source.mjs` | **`S12` requires it.** This item adds `check:markdown` and `check:markdown:selftest` to `package.json`, and [W24](w24-the-gates-own-wiring.md)'s `S12` asserts the gate chain **equals** the `GATE_CHAIN` literal in that file — so an entry added to the chain and not to the list is a failure, by design. The edit is two lines |
| `doc/plans/p8-what-can-be-deleted-with-the-gate-green.md` | **Not only its Record**, which is the part section 1 rule 5 grants. This item's declaration measured **decision 3's argument false** and corrected it **in place**, per the convention P7 used when W22 falsified one of its decisions — and it also edited the plan's Scope bullet and its work-item index row. **Missed on the first pass and added by W25's conformity reader**, which is the second entry in a table this item declared as having one |

**This is the first test of W24's answer to [Q102](../questions/q102.md) and it fired one item
later, not one plan later.** W24's Record said an owner *moves, narrows and multiplies* the problem
and that *"what settles the ownership half is the next plan outside P8 that edits the gate chain."*
**It did not take another plan.** P8's own work-item table — which this item's `Owns` was written from,
per section 7 rule 2 — was fixed before W24 existed, so it could not name a file W24's own deliverable
would later oblige this item to edit.

**The mechanism is Q102's exactly, and the direction is the informative part.** `RUN_FLOOR` went stale
**silently, in the direction of weakness**: nothing told W18 the floor was wrong. `S12` failed
**loudly, in the direction of safety**: `npm run check:source` went red on the commit that added the
entry, named the entry, and named the file to edit. The obligation is identical and **what happens
when you do not discharge it is not**, which is the distinction W24 was arguing for when it chose
equality over a floor — now measured on a real occurrence rather than on a probe.

**One exception, declared, and it is the plan's table that was incomplete rather than this item's
reading of it.**

## Scope

**In**

1. **`scripts/check-markdown.mjs`, holding one implementation of link resolution over BOTH trees.**
   `C5`'s logic is **lifted, not copied** — P8's decision 1, and measured above: adding span-blanking
   leaves `spec/` at 0 → 0 and anchor resolution is inert there, so the lift changes nothing about what
   `spec/` reports.
2. **Fenced blocks and inline code spans blanked before parsing**, length-preserving so line numbers
   survive. P8's decision 2; **4** false positives otherwise, and the phenomenon is placeholders as
   well as illustrations of link syntax.
3. **Anchors resolved** — same-file (`#live`) and cross-file — against the target's headings, with the
   slug rule stated in one function and **provoked by probes rather than by the corpus**.
4. **The fourteen dead anchors fixed** in `doc/scheduler-upstream.md`, which is what makes the anchor
   clause non-vacuous on the day it ships. The file half is already green, and this is the half that is
   not.
5. **`check:markdown` in `package.json`**, which **`S11` and `S12` both then guard** — W24's widened
   list is why this item runs second, and adding the entry without adding it to `GATE_CHAIN` is a
   failure `S12` now reports.

**Out** — named rather than left implicit, with where it goes instead

- **A self-test for `check-spec`'s OTHER SEVEN clauses.** W24's `Out` asked this item's declaration to
  rule on it and **the ruling is no.** `check-spec` has **8 clauses and zero probes**; `C1`-`C4` and
  `C6`-`C8` are about rule ids, examples, refusals and a version column, and probing them means
  mutating `spec/**`, which is in no P8 item's `Owns` and which needs an input override per clause.
  **This item takes `C5` because it is lifting `C5`**, and the remaining seven join
  [Q132](../questions/q132.md)'s nine as a measured gap with a named owner-shaped answer. *(The lifted
  clause does get probes: they are this item's.)*
- **Checking what a document SAYS.** P8: *"a false sentence is not in scope and this plan does not
  reopen that argument."* A dead link and an unresolvable anchor are arithmetic; a wrong claim is not.
- **Renaming or renumbering `C5`.** Nine documents cite it and section 3 forbids it. The lift shares an
  implementation and `check-spec` still reports `C5 links resolve`.
- **[Q131](../questions/q131.md) and [Q135](../questions/q135.md) — the register's malformed rows.**
  Three rows render their cells wrong and **all three are deliberately left unfixed** so that whoever
  builds a cell-count check has live defects to fire on. A cell-count clause is **not** in this item;
  P8 named it as mechanically decidable, and W26 — the item that would have taken it — was dropped.
- **[Q123](../questions/q123.md) — line endings.** Same reason: W26 was dropped and the row has no
  owner.
- **[Q100](../questions/q100.md)'s class.** This check's report is a render; W24's answer — requiring
  the report rows and the failure lines to agree — is available here and is the standard this item
  should meet rather than a thing it gets to skip.

## The decision this item takes, and what it costs

**The slug rule is written down, and the probes are the only thing that can hold it to anything.**
Measured above: every variant tried produces an identical result on this corpus. So the rule is
declared as one function with the GitHub behaviour it is imitating stated beside it, and **at least
three probes construct the discriminating cases the corpus lacks** — a heading with an em-dash, a
heading with a ` - ` separator, and a duplicate heading needing GitHub's `-1` suffix. **A probe that
only re-runs the corpus is a probe that passes under every rule.**

**And the file half ships green.** That is not a reason to leave it out — a renamed work item breaks
every link to it silently and this repository renames work items — but it is a reason the probes carry
the whole weight of that clause, exactly as rule 7 (a) says of any check whose subject is currently
clean.

## Verification

**L0 — own coverage.** Each command named, not implied:

```bash
npm run check:markdown           # the new check, over doc/**, spec/** and the root markdown
npm run check:markdown:selftest  # the probes, each declaring the exact SET it trips
npm run check:spec               # C1-C8, with C5 now served by the lifted implementation
npm run check:source             # S11 and S12 must accept the new entry
npm run lint                     # deno lint, 43 files
npm run typecheck                # five projects
```

**L1-L6 — regression, and they must not move.** This item reads no source and no test:

```bash
npm run gate                     # exit code is the result
```

The expected numbers, **to be re-derived rather than copied at the Record**: 474 assertions / 19 files
× node, deno, chromium, and 489 assertions / 25 real runs / 23 row labels at L6 × node and deno.
*(`npm run gate` runs `test:browser`, which is **chromium only**; firefox and webkit need
`test:browser:all`, which the gate does not run. `474` counts `test()` **cases** and `489` counts
individual assertions — [Q98](../questions/q98.md) — so they are never added. The row-label count is
derived from the run count, not read from a header.)*

**Routing cases.** *Not applicable, and stated rather than left silent*: this item touches no routing,
no definition and no driver. A branch routed away from its join (Q4), `user_action` (Q17), no matching
decision edge (Q10), a duplicate task id (Q13) and a nested fan-out (Q6) are **all out of reach** —
this check reads markdown and the file tree and nothing else.

## The provocation set — `doc/workflow.md` rule 8, all four obligations

**Written before the readers report, and RE-RUN after acting on them.** Each probe declares the exact
**set** of checks it must trip.

*(Declared as **ten** probes below. Shipped as **37**, with **37** META gradings and **3** SELF —
the difference is what the two readers found, and every added entry is a mutation that cost **0
failures** before it existed. Four of the probes written here were **wrong at birth** and two more
could not discriminate; the Record has both lists.)*

**(a) the rule's own clauses:**

| # | probe | must trip |
|---|---|---|
| 1 | a link to a file that does not exist | the file clause |
| 2 | a link whose anchor does not exist | the anchor clause |
| 3 | a **same-file** `](#…)` anchor that does not exist — the form `C5`'s pattern cannot even match | the anchor clause |
| 4 | one of `doc/scheduler-upstream.md`'s S-id anchors broken again | the anchor clause |
| 5 | a link inside a **fenced block** made dead — must trip **NOTHING** | `{}` |
| 6 | a link inside an **inline code span** made dead — must trip **NOTHING** | `{}` |
| 7 | a dead link in `spec/`, which the lift must still catch | `{C5}` |

**(b) the `Outputs` table's rows** — each declared output broken so it is *present but inert*.

**(c) PROVENANCE — the source expression and NOTHING else.** The value to attack is *which headings a
target actually has*: read them from a literal, from the linking file rather than the target file, or
from a cache keyed wrongly. A probe that also edits the expected literal is a rewrite.

**(d) LOOP BOUNDS** — the file list, the heading list per file, the link list per file, and `PROBES`.
Can one leave? Can the whole list leave? **Does anything count it from a source other than itself?**
W24's answer to the same question is the standard: its `ALL_CHECKS` allowlist was **deleted** rather
than bounded, because the ids were derivable from the run's own output.

**And the slug rule's own probes, which the corpus cannot supply:**

| # | probe | must trip |
|---|---|---|
| 8 | a link to a heading containing an **em-dash**, correct under the declared rule | `{}` — and it must FAIL under a runs-collapsing rule |
| 9 | a link to a heading containing ` - `, correct under the declared rule | `{}` |
| 10 | a link to the **second** of two identical headings, using GitHub's `-1` suffix | `{}` |

**Where this stops.** `scripts/check-policies-selftest.mjs:30-45` and
`scripts/check-source-selftest.mjs`'s header both record the fixed point — **nothing inside a
self-grading file can assert that the file grades** — and W24 measured that the hole **moves outward**
rather than closing when a list one level out asserts the guard fires. This item inherits both and
**must not claim to have beaten either**; the Record names which of its own guards are outside its
reach, measured against the file as shipped rather than copied from a sibling.

## Record

**Done 2026-09-03.** `npm run gate` exit **0**, read as an exit code and not through a grep.

| Clause | Verdict | Notes |
|---|---|---|
| L0 own coverage | **pass** | `check:markdown` 5 checks over **62 documents / 1577 relative links / 78 anchored**; `check:markdown:selftest` **37 probes, 37 META gradings, 3 SELF gradings**; `check:spec` C1-C8 with `C5` served by the lift; `check:source` S1-S13, 18 gate entries; `lint` 43 files; `typecheck` 5 projects |
| L1-L6 regression | **pass, and UNMOVED** | **474 assertions, 19 files** in node 24.20.0, deno 2.9.6 and chromium; **489 assertions, 25 real runs, 23 row labels** at L6 in node and deno. Identical to the pre-item baseline. *(`test:browser` is **chromium only**; firefox and webkit need `test:browser:all`, which the gate does not run and this item did not run. `474` counts `test()` **cases** and `489` counts individual assertions — [Q98](../questions/q98.md) — so they are never added.)* |
| conformity reader | **13 findings, 2 BLOCKING**, all acted on | Both blocking ones were in the check's centre — see *What broke* |
| adequacy reader | **75 mutations, 23 survivors, 7 BLOCKING**, all acted on | Ran in an isolated copy verified green first; zero symlinks and zero reparse points before and after; copy left in place |
| **a FIRST reader died mid-run** | **partial, salvaged, re-verified** | An earlier adequacy pass was interrupted with no report. Its harness and logs were salvaged to `scratchpad/w25-salvage/`, its candidate survivors **re-verified by the author against the current tree** — its own verdicts were partly stale — and all of them closed before the replacement reader started, which was told what ground was covered. **Recorded because a stopped agent's log is a claim, not a measurement** |
| overlap | **2 of 20** | `C5`'s missing vacuity guard ([Q137](../questions/q137.md)) and *the report rows are counted from nothing*. Union 13 + 9 − 2. Inside the 1-4 absolute band section 6 declares settled |
| re-run at the fixes | **fired four times, and twice it changed an outcome** | Rule 8's re-run after acting. It caught: an off-by-one cap mutation (`min(n,3)` still emits `-2`); **four probes wrong at birth**; **two META entries that matched a comment instead of the code**; and two probes that could not discriminate at all. The readers' own edits are checked in — **26 of them** |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| `scripts/check-markdown.mjs` with `C5` lifted | **yes** | probes *a dead link inside spec/* and *a dead ANCHOR inside spec/*, both `runs: 'spec'`, plus the META entry that keeps the import and drops the calls |
| the anchor clause | **yes** | eight `M2` probes, including the **same-file** form `C5`'s pattern could not match at all, and a heading renamed under its links |
| span blanking | **yes** | four `{}` probes — fenced, inline span, `~~~`, and a fence indented in a list item — plus three META entries |
| `scripts/check-markdown-selftest.mjs` + `MIN_PROBES` | **yes**, three floors | `SELF`: one probe deleted, `PROBES` emptied, **and the rule 7 (b) guard disabled with a probe made a no-op** |
| `check:markdown` in `package.json` | **yes** | `S11` and `S12`, measured five ways by the adequacy reader, including a **swap** of this item's two entries against `check:scheduler`'s — order, not just membership |
| the fourteen anchors fixed | **yes** | the corpus itself: breaking any of the nine S-id anchors fires `M2` immediately |

**What broke.**

**1. The slug rule stripped `_`, and it was the false-positive direction.** `slug()` removed underscores
with ``[`*_~]`` as "emphasis markup" while its own docstring said GitHub keeps them, so
`## The run_flow helper` slugged to `the-runflow-helper` and a **correct** link to
`#the-run_flow-helper` was reported dead. A false positive makes the gate red for a document that is
right, which this file's own reach paragraph calls the worse direction. **Zero live occurrences** — so
only a constructed probe could ever reach it, which is this item's own thesis landing on its own code.
Found by the conformity reader deriving the rule independently before reading it.

**2. The primary loop had no bound.** Adding `work-items` and `plans` to the walk's skip list dropped
**31 of 62 documents — every work item and every plan — with all five checks green and the gate at
exit 0.** The `M3` floors were 20 / 100 / 20, which is the degenerate extreme rather than the tree.

**3. And splitting `M3` was what made the fix real.** Raising the floors was not enough: all three
clauses reported under **one id**, so `if (r.files < 50)` and `if (r.links < 1200)` could each become
`if (false)` for **0**, because any probe tripping the anchored floor satisfied a declaration of
`{M3}` no matter which clause fired. **Set equality cannot discriminate inside a single id.** They are
`M3`, `M4` and `M5` now, and the probe harness gained a `removes` capability, because every probe
edited one document's text and the file and link counts were unreachable from the probes at all.

**4. `C5`'s lift ran the whole `doc/` scan on import and called `process.exit(1)`.** `check-spec.mjs`
imports `resolveLinks`, and the importer never reached its own first line. Found by the author within
a minute of writing it, and it is why `IS_ENTRY` exists.

**5. Two crash paths that would have taken `C5` down with them.** `decodeURIComponent` on a bare `%`
is a `URIError`, and `readFileSync` on an anchored **directory** link is `EISDIR`. Either replaces the
whole report with a stack trace and leaves every remaining file unscanned — in a script another gate
step now depends on. Zero occurrences today, so latent rather than live.

**6. Two environment variables read by nothing**, one of them a behaviour change nobody authorised:
`CHECK_SPEC_DIR` let an environment variable silently redirect the `spec/` scan, inside a lift P8
decision 1 says has *"no behaviour change to `spec/`"*. Both removed.

**7. Six written claims were false, and two of them were self-inflicted in the same way.** The
"invisible, 0 occurrences" list said a link inside an HTML comment is invisible — **it is reported**,
so the count of false-positive shapes is three, not two. `resolveLinks`' docstring named a returned
field that never existed. The `55 documents` figure and the script's own `62` had no stated referent.
And **two META entries matched a COMMENT rather than the code**, because the paragraph above the
floors quotes them verbatim to explain the id split, so `String.replace`'s first-occurrence rule
edited the prose and the check ran unchanged — reporting *"the probes passed against a check that does
not check"* against a check that was never broken. **A comment that quotes the code it explains makes
that code unmutatable by a literal-anchored probe.**

**8. Four probes were wrong at birth and two more could not discriminate.** A spec link that does not
exist; two `removes` probes whose declared sets missed a structural `M1` cascade (taking a directory
out of the tree also kills every link **into** it, and 1483 of 1577 links are to `.md` files); one
probe still declaring the retired `M3` id. And two `{}` probes that asserted something **resolves**
where the mutation only ever **added** anchors: **a probe for a clause that makes the check more
permissive must assert something is DEAD.**

**What this taught.**

**A check can ship against a corpus that cannot falsify its central rule, and this item is the worked
example.** At declaration, four different slug rules each reported **14 dead of 76** on this
repository; they disagreed about **134, 140 and 294 of 584 headings** and **no link pointed at any
heading they disagreed about.** So the rule the check turns on was unfalsifiable by the tree it runs
over, in either direction, and the probes had to construct the discriminating cases.

**Then the item's own fix made two thirds of that false, and only the conformity reader noticed.** The
fourteen repaired `s2---cancel-a-queued-task` anchors **are** the discriminating cases: hyphen-run
collapsing now costs 14 and punctuation-to-hyphen 6, where both cost 0 before. **Fixing the defect
built the fixture that proves the rule.** The probes stay anyway, because a corpus that happens to
discriminate today is not a test — and the `_` defect is the case that proves it: zero live
occurrences, a false positive, reachable only by a constructed probe.

**The same shape appeared twice more and neither was predicted.** All 76 anchor links in this
repository are **same-file**; there are **zero** cross-file ones, so `p === abs` for every real link
and the provenance mutation *"read the target's anchors from the linking file"* swaps one expression
for an identical one. That was found by a META entry coming back **not noticed**, not by a probe. And
the file half of the check **ships green** — 0 dead file links — so `M1` would pass on an empty
implementation. **Three clauses, three corpora that cannot falsify them.** The generalisation this
item offers: *a check written for a defect you have just fixed has no live case by construction, and
its probes are not a supplement to the corpus but the whole of its evidence.*

**And [Q102](../questions/q102.md) reproduced one item later, not one plan later.** W24's Record said
the ownership question would be settled by *"the next plan outside P8 that edits the gate chain"*. It
took the next **item**: W25 adds two `check:*` entries, `S12` obliges the `GATE_CHAIN` literal in
`scripts/check-source.mjs`, and this item's `Owns` — written from P8's index row, which predates
`S12` — does not name that file. **The direction is the informative part**: `RUN_FLOOR` went stale
*silently, toward weakness*; `S12` failed *loudly, toward safety*, naming both the entry and the file
to edit. Same obligation, opposite failure mode, which is what W24 was arguing for when it chose
equality over a floor — now measured on a real occurrence rather than on a probe.

**Exceptions taken: TWO, both declared** — `scripts/check-source.mjs` (above) and
`doc/plans/p8-*.md`, whose **decision 3 this item corrected in place** along with its Scope bullet and
its index row, where section 1 rule 5 grants only the Record. The second was **missed on the first
pass and added by the conformity reader**, in a table this item had declared as having one entry.

**Questions raised.** Q136-Q138, one line each, and written to `doc/open-questions.md`. **Q139 and
Q140 are unused and are skipped.**

- **[Q136](../questions/q136.md)** — ten markdown shapes the check cannot see, all at zero occurrences,
  failing in **both** directions; one of them was miscategorised in the file that declares them.
- **[Q137](../questions/q137.md)** — `C5` did not inherit `M3`: `spec/`'s link check can still pass
  vacuously where `doc/`'s cannot, and filtering one of `spec/`'s seven documents out costs 0.
- **[Q138](../questions/q138.md)** — the META pass asserts that **some** probe notices, never **which**,
  which is what let two entries report a verdict about a check that was never broken — and it is why
  `check:markdown:selftest` costs **2m31 to 3m14** of a **4m46 to 6m00** gate — two runs of the same tree each, so the absolutes vary by a quarter and the **ratio does not: roughly half the gate, either way**.

**No ADR: 0033 is reserved and skipped**, as P8 predicted for an item that lifts a function.
