# W112 — the budget, the check that holds it, and the three floors re-pointed

**Status:** in progress
**Plan:** [P27](../plans/p27-what-a-register-row-is.md)

```
Spec:       NONE — this item writes no spec rule. It adds a gate entry and changes what two
            check-markdown floors COUNT, which is ADR 0076's subject
Owns:       scripts/check-budget.mjs, scripts/check-budget-selftest.mjs,
            scripts/check-markdown.mjs, scripts/check-markdown-selftest.mjs,
            scripts/check-wiring.mjs, scripts/check-wiring-selftest.mjs,
            scripts/check-source.mjs, package.json, doc/decisions/0076-*.md
            (`check-source.mjs` was MISSING from this line at the declaration and is not a late
            exception: `S12` REFUSES a gate entry `GATE_CHAIN` does not declare, so adding the
            sixteenth entry necessarily edits that file. W112's conformity reader found it;
            P16/P18's seed-the-exceptions-table class, where the seed was predictable and not
            seeded.)
Inputs:     the always-read set's measured sizes; check-markdown's M3/M4/M5 windows and the two
            `removes` fixtures they must sit between; the gate chain; `stray()`'s glob.
            EVERY figure re-taken at this declaration step rather than transcribed from P27
            (P15 decision 5), and three of the figures handed over were wrong
Outputs:    (1) `npm run check:budget` — the always-read set named as a list, each member under its
            declared ceiling, the per-file figures and the distance to target PRINTED
            (2) the SIXTEENTH gate entry, bound by S11, S12, G3 and G4
            (3) `scripts/check-budget-selftest.mjs` — probes, META and SELF
            (4) ADR 0076 — what M4 and M5 COUNT, and why M3 is deliberately unmoved
            (5) `M4` re-pointed to a count that is invariant under a prose cut, measured on the
            post-cut tree as well as on this one
            (6) `stray()`'s glob widened past `check-*.mjs` — Q459
            (7) the measured obligation W113 inherits for `M5`, which cannot be re-pointed here
Depends on: nothing
Blocks:     W113, W114, W115 — every one of them cuts prose, and M4 goes red on a correct cut
Tests:      `check:budget`'s own self-test; `check:markdown` and `check:markdown:selftest` green on
            THIS tree and on a simulated post-cut tree; `check:wiring` + its self-test for G6/stray.
            Expected values come from the measurement below, never from a check's output
Gate:       L0, check:budget, check:budget:selftest, check:markdown, check:markdown:selftest,
            check:wiring, check:wiring:selftest (for G1-G6 and the CHECKS list),
            check:source (+selftest, for S11/S12), check:docs (+selftest, for X7-X11),
            then `npm run gate:full` as the CONFIRMING gate
            (v0.26 — `npm run gate` is NOT an item's confirming gate)
Reserves:   Q459-Q463, ADR 0076
```

## What this item is

**It cuts nothing.** It makes cutting possible without turning the gate red on correct work, which
is [P27](../plans/p27-what-a-register-row-is.md) decision 3. Its whole value is in what it finds
before W113 can be surprised by it, and prediction 2 names that job explicitly: *a fourth counting
ratchet nobody enumerated — W112's job is to find it.*

## The declaration step's measurements

Every figure below was taken at this declaration step. **Three of the figures this item was handed
were wrong, in three different places**, which is why `doc/workflow.md` section 1 rule 5's re-take
clause is cited in the `Inputs` line rather than assumed.

| figure | handed over | measured | where the handed figure came from |
|---|---|---|---|
| `check:markdown` relative links | **8055** (P27 baseline) / **8051** (brief) | **8052** | two different stale readings of one number |
| the always-read set, today | **876 KB** (P27 decision 1) | **891,288 bytes** | a KiB figure for `CLAUDE.md` added to a KB figure for `doc/workflow.md` |
| `M3`'s margin | **5 files**, whole tree **182**, fixture **137** (P26's retro) | **7 files**, whole **180**, fixture **135** at `b6366ce`; **6 / 181 / 136** at `HEAD` | measured two too high in both columns, and P26's retro's *predicted to fire at P27's FOURTH item document* inherits the error |

### 1. The always-read set, in bytes

| document | today | P27's budget |
|---|---|---|
| `CLAUDE.md` | 569,698 | 25 KB |
| `doc/workflow.md` | 304,465 | 35 KB |
| `doc/concept.md` | 17,125 | 17 KB — already under |
| **total** | **891,288** | **77 KB** |

`CLAUDE.md` minus its `## Current state` block is **37,964 bytes**, which confirms P27's 37 KB.

**So a hard 77 KB ceiling cannot be green at W112, which cuts nothing** — it is over by 11x. P27's
stop-and-ask (c) is not reopened, because its answer already says what the check does: it *"refuses a
commit that grows the required reading"*. The ceilings are declared at today's measured size, the
TARGET is declared beside them and the distance printed, each cut item lowers the ceiling, and W115
lands it on target.

### 2. The ratchet census is complete, and only ONE check is exposed

Every numeric comparison in all 19 check scripts was enumerated — inline literals and comparisons
against named constants, separately, because `count < 142` and `count < RUN_FLOOR` do not match one
pattern. Then the question that actually decides the hazard: **which clauses READ a document P27
cuts?** Only two checks touch `doc/` at all:

| check | what it reads under `doc/` |
|---|---|
| `check-docs` `X11` | `doc/decisions/` only — not cut |
| `check-markdown` `M1`-`M5` | **all of `doc/`** |

`doc/open-questions.md` is read by **no check in code**; `doc/workflow.md` appears only inside
failure-message strings. **So `check:markdown` is the entire ratchet surface for P27's cuts.**

**Every candidate prediction 2 names is safe, and each was measured rather than reasoned about**:
`RUN_FLOOR`, `X4_WIDTH_FLOOR`, `README_SNIPPET_FLOOR`, `COPIES_FLOOR` and `DECLARED_TOTAL` read
`AGENTS.md`, `README.md` and `examples/**`; `X7` reads `AGENTS.md` + `spec/`; `X9` reads `README.md`
+ both manifests; `X10` reads `examples/README.md` + `examples/l6.ts`; `C4` and `C8` read `spec/`.
None of them reads a cut document. *Prediction 2 names the right check and the wrong candidates.*

### 3. The three floors are TWO-SIDED windows, and `check-markdown.mjs` already says so

A floor must sit **above its `removes` probe's fixture** — or the probe stops firing it and rule
7 (c)'s declared set reports `wanted [M1,M3,M4], got [M1,M3]` — **and below the whole tree**, or the
check itself fails. That is `check-markdown.mjs`'s own struck paragraph: *"THAT PARAGRAPH IS FALSE and
P9's declaration step falsified it … a floor is one-sided for the CHECK and two-sided for the PROBE."*
**P27 decision 3 reproduces the struck reading** — it calls them high-water marks and says they need
*enough links to check, not more than last time*, which is right about the check and wrong about the
probes, exactly as the paragraph it unknowingly restates was.

Measured on a scratch `git archive` copy of `HEAD`, and on four simulated post-cut trees built by
applying P27's own cuts (register → 418 one-line rows with its 74-line preamble accretion log gone,
`CLAUDE.md` minus `Current state`, `doc/workflow.md` minus the version blocks, `doc/README.md` minus
its long status paragraphs):

| | whole tree | − `doc/decisions` | − `decisions`+`plans` |
|---|---|---|---|
| **files** — today | 181 | 136 | 108 |
| **files** — post-cut | **181** | **136** | **108** |
| **links** — today | 8052 | 7418 | 5969 |
| **links** — post-cut | **5496** | **4862** | **3413** |
| **anchored** — today | 473 | 473 | 455 |
| **anchored** — post-cut | **28** | **28** | **15** |

**(a) `M3` is not a hazard and is deliberately NOT moved.** A prose cut deletes no document
(P27 decision 2: nothing is archived to a file), so the file count is **181 before and after**.
`M3`'s window is `(136, 181]` on both trees and 142 is inside it. Lowering it below 136 would
*silence* the `doc/decisions removed` probe. **P27 decision 3 lists it as one of three to re-point;
it is measured and left alone**, which is a non-change recorded as one.

**(b) `M4` cannot be re-pointed as a VALUE at all.** Its window is
`(two-directory fixture, one-directory fixture]`: **`(5969, 7418]` today and `(3413, 4862]`
post-cut**. The two are **disjoint** — no literal is valid both before and after. Deeper fixtures
(`− work-items`, `− the three big directories`) and `distinct (source,target) pairs` were measured
and every one stays disjoint. *So "re-point the floors first" is not implementable for `M4` as a
value change, and that is the plan's own prediction-2 reversal arriving at the item asked to find it.*

**(c) `M5` is a hazard P27 does not identify as one.** It lists `anchored >= 60 against 473`, which
reads safe. Anchored links go **473 → 28**, because **440 of the 473 are `](#live)` and
`](#resolved)` self-links inside the register** — 301 in the row bodies and 150 in the preamble —
**and they resolve to exactly TWO distinct anchors.** *473 is 24 distinct anchors wearing a large
number's clothes.*

### 4. What IS implementable: change what the floor COUNTS

[ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) decision 4
took `README_SNIPPET_FLOOR` from 8 to 3 and states the only condition under which lowering a ratchet
is legitimate: **the decision changes what the floor COUNTS.** That is the road here.

`M4`'s failure message states its own job — *"`M1` is vacuous below that"*. `M1` resolves every
relative link, and what makes that non-vacuous is **how much of the corpus it resolved links FROM**,
not how many repeated citations it walked. A prose cut removes citations, not documents.

| floor | counts now | will count | today (whole / −dec / −dec+plans) | post-cut | shared window |
|---|---|---|---|---|---|
| `M3` | files | **unchanged** | 181 / 136 / 108 | 181 / 136 / 108 | `(136, 181]` — keep **142** |
| `M4` | link instances | **documents that carry at least one relative link** | **176 / 134 / 107** | **175 / 133 / 106** | `(107, 133]` → **120** |
| `M5` | anchored instances | **unchanged — see below** | 473 / 473 / 455 | 28 / 28 / 15 | keep **60** |

`M4` at **120** satisfies all three constraints on **both** trees — the check passes (176, 175 ≥ 120),
the `−dec+plans` probe fires it (107, 106 < 120) and the `−dec` probe stays quiet (134, 133 ≥ 120) —
**with every existing probe, fixture and declared set unchanged.** The one-document drift (176 → 175)
is a document losing its last link, which is signal rather than noise.

### 5. `M5` cannot be re-pointed here, and that is measured rather than conceded

**`M5`'s only probe empties `doc/open-questions.md`'s anchors, and W113 deletes that probe's
subject** — [ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
consequence 2's shape (*"removing a subject removed its probes"*), arriving at W113 rather than here.
Post-cut the register carries no anchors, so the probe strips nothing and the whole tree stays at 28:
the probe needs `28 < floor` and the check needs `28 >= floor`, which no value satisfies.

Four alternatives were measured and all four fail:

| candidate | why it fails |
|---|---|
| **distinct anchors resolved** (24 → 20) | the register's 440 anchors are **2 distinct**, so emptying it moves the count by 2; the probe dies on both trees |
| **documents carrying an anchor** (9 → 7) | the `−dec+plans` fixture is 2 today and 1 post-cut, so the floor must be ≤ 1 while the probe needs ≥ 9 |
| **probe re-pointed to `doc/scheduler-upstream.md`** (the biggest post-cut holder, 15 anchored / 10 distinct) | today that leaves 458 of 473, and the floor must be ≤ 455 for the `−dec+plans` probe to stay quiet |
| **probe 2 given `M5` in its declared set** | needs `floor > 455` today and `floor <= 28` post-cut |

**So `M5` keeps its floor and its probe, its META entry is repaired (below), and W113 inherits a
measured obligation rather than a surprise**: post-cut the corpus carries **28 anchored links over 7
documents**, the largest holder is `doc/scheduler-upstream.md` at **15 anchored / 10 distinct**, and
`M5`'s floor must land in **`(13, 15]`** with its probe re-pointed there. *That is the whole purpose
of an item that cuts nothing — the floor W113 would have discovered as a red gate is a declared line
in W113's `Inputs` instead.*

### 6. A live defect found while measuring: `M5`'s META entry is PINNED

`M3`'s and `M4`'s META entries are anchor-agnostic by regex — `M4`'s since W33, `M3`'s since W42 —
and the comments above both say why: *"a mutation pinned to a magic number is unmutatable the moment
the number is right to change."* **`M5`'s was left behind and is still `t.replace('if (r.anchored <
60)', 'if (false)')`.** Third instance of one defect, live now, and it will report *"the mutation
matched nothing"* the moment W113 moves that floor. Repaired here.

### 7. `Q459` — `stray()`'s glob

**`check-wiring-selftest.mjs`'s** named-residue reading globbed `check-*.mjs` only, so when W108
left six `w108-*.mjs` harness modules in `dev-dist/` it could not NAME them, and
`check:wiring:selftest`'s control died at 3.1 s against a lane
[ADR 0072](../decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md)
measures at 228 s.

**The sharp form, measured here and not in the hand-over**: `G6`'s own scan already filters every
`.mjs` in that directory, so `G6` could **REFUSE** a file `stray()` could not **NAME**. Measured in
both directions with a constructed leftover — the widened glob reports `w999-harness.mjs`, the
original reports nothing. The universe is `G6`'s now rather than `G3`'s, which also means **dotted
mutants are excluded**: widening it without that exclusion made it able to name another lane's LIVE
`.meta-*` and `.budget-*` files as residue, a false positive this item introduced and then removed.

*(Two attributions in the first cut of this section were wrong and W112's conformity reader found
both: `stray()` is in `check-wiring-SELFTEST.mjs`, not `check-wiring.mjs`, whose only occurrence of
the word is the anchor string in `SHARED_SCRATCH`; and the comment at the `G6` block names **`G6`'s
own** widening at W105, while the paragraph this item replaced records the gap and **judges it
harmless** — the opposite of naming the fix.)*

## Scope

**In**

1. `scripts/check-budget.mjs` and its `--self-test`, with `check:budget` and
   `check:budget:selftest` as the sixteenth and seventeenth `package.json` entries (the sixteenth
   **gate chain** entry is `check:budget`; the self-test joins `selftests`, not `gate`, per
   [ADR 0070](../decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md)).
2. `M4` re-pointed to count documents that carry a relative link, floor **120**; the report line,
   `resolveLinks`'s return value and `M4`'s META regex updated with it.
3. `M5`'s META entry made anchor-agnostic. Its floor and its probe are **unchanged**.
4. `M3` measured and **unchanged**, recorded as a deliberate non-change in ADR 0076.
5. `stray()`'s glob widened past `check-*.mjs` (Q459).
6. ADR 0076, and the measured obligation W113 inherits for `M5`.

**Out** — named rather than left implicit, with where it goes instead

- **Any cut.** W113, W114 and W115.
- **`M5`'s re-pointing.** Measured here, impossible here, handed to W113 as an `Inputs` line.
- **A seventeenth GATE-CHAIN entry.** `check:budget:selftest` goes in `selftests`, which is
  `gate:full`'s, not `gate`'s.
- **`markdownIn` throwing `ENOENT` on a missing directory**, found while building the fixtures. No
  probe removes `doc/` or `spec/` whole, so it is unreached; Q460 records it.
- **Any floor outside `M3`/`M4`/`M5`.** The census above is why none other is exposed.

## Verification

How each clause of `Gate:` is run. Every rung is RUN and redirected, never piped, and `$?` is read
on its own line (section 4, v0.16).

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| the new check | `npm run check:budget`, `npm run check:budget:selftest` |
| the floors | `npm run check:markdown`, `npm run check:markdown:selftest` |
| **the floors on the POST-CUT tree** | the same two, in a simulated post-cut copy — the only thing that tests `M4`'s re-pointing rather than its value |
| the gate's wiring | `npm run check:source` + `:selftest` (`S11`, `S12`), `npm run check:docs` + `:selftest` (`G3`, `G4`) |
| `stray()` | `npm run check:wiring`, `npm run check:wiring:selftest` |
| confirming gate | **`npm run gate:full`** |

*Routing: not applicable. This item touches no node kind, no policy and no driver path; `src/` is
untouched.*

**The claim most easily made falsely here** is that the re-pointed `M4` is correct, since on this
tree any value in `(5969, 7418]` and the new one in `(107, 133]` are both green. The thing that
discriminates them is the **post-cut copy**, and it is a gate row above rather than a sentence.

## Declared exceptions

**There was no table here at the declaration, and W112's conformity reader asked for one** — the
same gap it found in `Owns`. Paths outside `Owns` and outside the record step's six, each with the
reason:

| path | why | predicted? |
|---|---|---|
| `doc/workflow.md` | **section 1 rule 5's list, and ADR 0077 is why.** The maintainer decided at this item's record step that an item does not write its status into `CLAUDE.md`, which makes that rule's list FIVE rather than six. The file is **W115's**, and the edit is taken here because [W113](../plans/p27-what-a-register-row-is.md) and W114 read that rule before W115 exists — leaving the procedure document naming six while the practice is five is the shape this repository has recorded most often. ADR 0077 decision 5 states it | **no** — the decision was taken after the confirming gate |
| `doc/plans/p27-what-a-register-row-is.md` | three stale `8055` figures the item measured as **8052**, plus a prediction-2 scope column whose *"`links >= 6225`"* is no longer what `M4` counts. `doc/workflow.md` section 1 rule 5's third direction asks for the search and the corrections to LAND; the record step allows the plan's **Record** and these are its Baseline and prediction table | **no** — the item measured the figures as wrong and did not plan to annotate the plan |

**Within the record step's six** (section 1 rule 5): `doc/open-questions.md`, `doc/decisions/**`,
`CLAUDE.md`, `doc/README.md`. **Within `Owns`**: everything else, after `scripts/check-source.mjs`
was added to that line for the reason given there.

## Record

**Status: DONE.** It cuts nothing, and what it delivers is three things W113 would otherwise have met
as a red gate: a budget check in the chain, `M4` counting a quantity a prose cut cannot move, and a
measured obligation for the one floor that could not be re-pointed here.

**Gate — what ran.** Every rung RUN and redirected, `$?` read on its own line, on the tree this item
ships.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, EXIT 0** | `lint` over 136 files, all five `typecheck` lanes |
| `check:budget` | **RAN, EXIT 0** | 891,288 bytes against a 907,590 ceiling and a 78,848 target |
| `check:budget:selftest` | **RAN, EXIT 0** | 13 probes (12 caught, 1 control clean), 11/11 META with 0 by the corpus, 14/14 SELF, 7/7 SOURCE, **4/4 grader controls as declared**, 0 scratch residue, content digest unmoved |
| `check:markdown` | **RAN, EXIT 0** | `M1`-`M6`; `M6` is new |
| `check:markdown:selftest` | **RAN, EXIT 0** | 37/37 probes, 37/37 META noticed, 7/7 SELF bounded |
| `check:wiring` + `:selftest` | **RAN, EXIT 0** | 42 probes, 42/42 caught, 14/14 graded, 6/6 bounded, control green |
| `check:source` (+ selftest) | **RAN, EXIT 0** | `S11`, `S12` |
| `check:docs` (+ selftest) | **RAN, EXIT 0** | `X11` over the new ADR row |
| the floors on a POST-CUT tree | **RAN** | `M1`-`M4` **ok** at 177 sources, where 6225 link instances would have been RED at 5517. **`M5` FAILS at 28 against 60**, which is decision 3's subject — so the lane is NOT green there and the `Gate:` row's word "green" was wrong |
| conformity reader | **RAN** | **58 values derived independently, 9 disagreed** — 5 blocking, 13 non-blocking. **Three of the nine were its own error** (below) |
| adequacy reader | **RAN** | **18 mutations, 13 real survivors, 5 blocking** |
| rule 8, readers' exact edits | **RAN** | **12 of 12 CAUGHT, 0 survived, 0 aborted** |
| `npm run gate` | **RAN, EXIT 0** | zero `FAIL` lines — and see the flake below |
| **`npm run gate:full`** | **RAN TWICE, EXIT 0 both times, zero `FAIL` lines** | the confirming gate (v0.26). **The second is the verdict**, taken on the tree this item ships: **2063 s**, every lane `ok` — budget 258.2 s, docs 1853.8, markdown 1701.7, policies 190.2, scheduler 30.8 (alone), source 1750.9, spec 391.5, wiring 1544.7, workers 113.6. The first (1959 s) predated ADR 0077, `doc/workflow.md` rule 5 and the index rows, so **its verdict was about a tree that no longer existed** — which is the defect P14's retro recorded, declared here rather than relied on. No script changed between the two, so only the document-walking lanes could have moved |

**The cost, since this item adds a lane and lengthens another.** `gate:full` went **995 s → 1959 s**.
`check:wiring:selftest` is ADR 0072's 228 s and is **1141.7 s** here, because `CHECKS` drives
`G1_PROBES` and two more probe families, so a ninth check multiplies that lane by five;
`check:budget:selftest` is **192.7 s** against 58.7 s at its first outing, having gained a content
digest and four clauses. *An earlier draft of ADR 0076 cited 526.9 s for the wiring lane — which is
what it took when it exited at its first bound. A duration read off a red lane measures the failure.*

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `npm run check:budget`, figures printed | yes | `S11` (*a check outside the gate does not exist*); and a `SOURCE` clause holds the table's columns and the `note:` distance line, after the reader deleted them for zero |
| (2) the sixteenth gate entry | yes | **FIVE clauses by name**: `S11`, `S12`, `G3`, `G6`, and `check-wiring`'s `CHECKS` both-ways comparison. The declaration named four and the fifth was the one that was red |
| (3) `check-budget-selftest.mjs` | yes | its own floors, the coverage bound derived from `check-budget.mjs`'s `fail('BN'` sites, and 7 `SOURCE` clauses for what no tree can reach |
| (4) ADR 0076 | yes | `X11` compares `doc/decisions/README.md` against disk both ways |
| (5) `M4` re-pointed, verified post-cut | yes | **`M6`** — and nothing else did, which was the adequacy reader's central finding |
| (6) `stray()` widened — Q459 | yes | nothing on a green tree. Measured both ways with a constructed leftover; recorded as [Q464](../open-questions.md) rather than guarded |
| (7) W113's measured obligation | yes | nothing — it is prose by construction, and that is what an item which cuts nothing can deliver |

**What broke.** Twenty-one defects, and the shape of the list is the finding: **the two largest were
invisible to every rung and were found by the two readers, from opposite ends of the same question.**

*Found by a RUNG, and all five read correctly:*

1. **`S12`** refused `check:budget` until `GATE_CHAIN` declared it.
2. **`G6`** refused the digest walk's `dev-dist` skip; then refused the leak-watching clause added
   for a reader's finding **on the very next run** — [Q178](../open-questions.md)'s shape, which that
   file has recorded twice about itself.
3. **`check-wiring`'s `CHECKS`** comparison refused the new `:selftest` entry, and its two `SELF`
   entries, pinned to the `CHECKS` literal, went stale with it — `check-markdown`'s *a mutation
   pinned to a magic number is unmutatable the moment the number is right to change*, with a magic
   LIST.
4. **`check:budget:selftest`'s own new scratch clause** caught five `declare` and grader mutants that
   only the exit handler removed — a real leak, on its first run.
5. **`npm run gate:full`** found what `npm run gate` structurally cannot: the `G6` concurrency race
   below. **This is ADR 0070 consequence 2 measured for the second plan running**, and v0.26's reason
   for existing.

*Found by a READER:*

6. **`M4`'s re-pointing had NO OBSERVER** (adequacy, blocking). `sources: sources.size` →
   `sources: files.length` cost **ZERO** on this tree and on a post-cut tree — the two counts differ
   by at most 5 across all three fixtures while the floor sits 12+ away, so `M4` was a duplicate of
   `M3` at a lower floor. *The item's claim that the post-cut tree was "the only thing that tests the
   re-pointing rather than its value" was false: it tests the value.* Closed by `M6`, a relation over
   the derivation, which fires on the real tree with no probe.
7. **Decision 5's one guard matched NOTHING and reported itself satisfied** (adequacy, blocking).
   `[^,]+` cannot span the comma in `join(ROOT, 'CLAUDE.md')`, so a derived ceiling matched 0 of 3 —
   and a zero-match read as *no bad entries*. `source: 5/5 bound(s) held` with every ceiling tracking
   the file it bounds.
8. **The `G6` concurrency race** (adequacy, blocking; found independently by `gate:full`). Mutants
   written flat and UNDOTTED into `dev-dist` draw 15 `G6` failures in a concurrent
   `check:wiring:selftest`, because that exception list is keyed on the FILENAME. **W108's incident
   reproduced by this item's own residue.** The fix is the repository's own convention — a leading
   dot, which `G6`'s filter encodes and no document states.
9. **`M3`'s "not a hazard" was scoped to prose cuts and did not say so** (adequacy, blocking).
   Document ADDITION is the churn `M3` has actually fired on, and its margin is **5 documents**;
   measured, 5 added documents silence probe 1.
10. **ADR consequence 1's report line was wrong in four numbers** (both readers) — and the quadruple
    co-occurred on no state of the tree. **Then the corrected figure went stale before the confirming
    gate.** The consequence states no numbers now, which is P27 decision 4 applied to this ADR.
11. **`G3`/`G4` attributed to `check:docs`** (both readers) — they are `check-wiring`'s clauses.
12. **`scripts/check-source.mjs` edited outside `Owns`** (conformity) — and predictable, since `S12`
    makes that edit necessary.
13. **A second probe dies at W113** (conformity): the `M2` same-file-anchor probe, the only one for
    that form, plus **30 probes anchored on link text inside documents P27 cuts.** The item's census
    enumerated NUMERIC COMPARISONS and cannot reach that class — prediction 2's *fourth ratchet
    nobody enumerated*, in a shape that is not a count.
14. **`440 = 301 + 150` does not add up** (conformity): 301 is raw, **290** is after `blankCode`.
15. **"cheapest" was unsupported** (conformity): `0.1` is not cheaper than `0.09`, and measured the
    three are inside [Q179](../open-questions.md)'s band. Premise withdrawn, argument intact.
16. **"five" where everything else says seven** (conformity).
17. **A dead link** to an unnamed `w113-*.md` in a shipped comment (both readers) — invisible because
    `check:markdown` does not scan `scripts/**`.
18. **§7's two attributions wrong** (conformity): `stray()` is in the self-test, and the comment it
    cited *judges the gap harmless* rather than naming the fix.
19. **"`check-markdown` is the whole of it" made false by this item's own `check-budget`** (conformity),
    which `statSync`es two cut documents. Conclusion survives on a structural reason.
20. **Six harness instruments of the author's own, each costing zero** (adequacy): bytes measured as
    characters because every staged file was ASCII; the crash discriminator's exit-code half **with
    both grader controls still reading *as declared***; `did-not-run` an arm with no case;
    `GRADER_CONTROLS` with no floor; `MIN_META`/`MIN_SELF` one below their lists, the free slot
    compounding with `MAX_CORPUS = 99`; and **the "content digest" hashing only path and size.**
21. **Three of the conformity reader's nine disagreements were its own error** — one mechanism:
    `anchored++` sits behind `isMarkdownFile(abs)`, so an anchored link dies when its TARGET is
    removed, not only when the link is. It counted the 12 anchors living IN `doc/plans` and reported
    `473 − 12 = 461`; the check reports **455**, because 6 more point INTO it —
    `doc/workflow.md`'s five anchors are all `](plans/p2N-….md#retro)`. Its claim that the ADR's
    impossibility was wrong is itself wrong, and decision 3 stands unamended.

*And four of the author's own, found by neither rung nor reader:* mutant copies written into the
per-process scratch directory computed `ROOT` as `dev-dist/`, leaving nine of eleven META clauses
ungraded (*which is why the other self-tests write mutants flat* — a convention three files follow
and none explains); a `SELF` entry whose replacement string was its own anchor, so it deleted its own
declaration; both grader controls graded wrong on their first outing; and a `\n` through a Python
heredoc became a real newline in a JS regex literal, three times.

**What this taught.**

- **`sources: files.length` is the sharpest thing in the item, and what makes it sharp is that the
  fix for obligation (c) was the thing obligation (c) catches.** The re-pointing's defence was
  *every existing probe, fixture and declared set is unchanged* — offered as evidence that it was a
  re-pointing and not a weakening, and it is exactly the property that made the change unobservable.
  **A change whose correctness argument is that nothing had to move is a change nothing can see.**
  For P27's retro: this is v0.13's LIMIT clause (*count the observers; at one, add a second
  independent expression*) arriving on a change that had one observer and did not know it.
- **A grep that cannot say it found its subject has none of the authority an artefact-derived bound
  is credited with.** W30 settled that a bound whose authority is the checked artefact stops the
  regress; decision 5's clause had that authority and matched nothing, and reported `5/5`. The
  general form — *every SOURCE clause asserts it found as many subjects as the declaration names* —
  is one line and is now in the clause.
- **`SELF` entries that REMOVE a grader clause measure the absence of a case**, which is
  [Q462](../open-questions.md) and was found seven times in this file before it had a name. The
  counter-measure is to plant the case.
- **`gate:full` earned itself a second time, on the item that cites it.** The `G6` race is invisible
  to `npm run gate` by construction, and it was found by the lane v0.26 made an item's confirming
  gate.

**Questions raised.** [Q459](../open-questions.md) RESOLVED (`stray()`'s glob);
[Q460](../open-questions.md) (`markdownIn` throws on a missing directory);
[Q461](../open-questions.md) (a ceiling goes stale toward WEAKNESS, and nothing enforces that it only
moves down); [Q462](../open-questions.md) (a `SELF` entry that removes a grader clause measures the
absence of a case); [Q463](../open-questions.md) (a mutant must sit exactly one level below the root,
in tension with ADR 0072); [Q464](../open-questions.md) (a diagnostic on a failure path is bound by
nothing on a green tree); [Q465](../open-questions.md) (the always-read set is three paths bound to
three paths, and a FOURTH always-read document is already instructed in `CLAUDE.md`).
[Q131](../open-questions.md) extended with **eleven** measured rows where it named two; Q102, Q142,
Q178, Q179, Q182, Q426, Q452 cited. **Census CONFIRMED 356 / 279 / 1 / 76**, all ids in exactly one
cluster cell, 0 aborts, from a parser written from scratch that was wrong in **four** directions
first.

**Not this item's, and reported rather than taken.** `npm run gate` is **flaky at roughly 1 in 4** on
`tv-ingest / arranged LAST-first` — `expected [6,5,4,3,2,1,0]`, `actual [6,5,4,2,3,1,0]`, two adjacent
arrivals swapped in a **total**-order assertion. `git diff` shows zero changed files under `src`,
`examples` and `test`. It is W94's row and the class
[W98](w98-what-a-row-may-assert-about-a-dispatch-order.md) fixed once by asserting PER SERIES. This
item saw two clean runs and the conformity reader saw the red one; *two clean samples are a sample.*
