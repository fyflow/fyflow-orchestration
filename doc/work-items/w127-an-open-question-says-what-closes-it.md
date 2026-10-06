# W127 — R9: an open question says what would close it; ADR 0082; Q494 resolved; the self-test and `npm run state` made triage-proof

**Status:** done — declared 2026-10-06 on `1b8b819`, after W126's Record; BUILD, both readers and the fix round done 2026-10-06
**Plan:** P29, `doc/plans/p29-which-open-questions-still-matter.md`

*This file carries NO relative link, deliberately* — W126's calibration 16 and Q142's mechanism.
A linking document here would be one more in `check-markdown`'s second `removes` probe tree and
crosses `M4`'s floor, so `check:markdown:selftest` would exit 1 while `check:markdown` stays green.
Ids and paths are written as bare text.

```
Spec:       none — P29 decision 6 and stop-and-asks (i), (l) and (m); ADR 0079 decision 2, which
            ADR 0082 amends; doc/questions/README.md's format
Owns:       scripts/check-register.mjs, scripts/check-register-selftest.mjs,
            doc/questions/README.md, doc/decisions/0082-*.md, doc/questions/q494.md
            (P29's index row), and — ADDED BY THE MAINTAINER'S ANSWER OF 2026-10-06, P29
            stop-and-ask (m) — scripts/state.mjs, and scripts/check-markdown-selftest.mjs for its
            FIXTURE ANCHORS ONLY (no probe added, removed or re-graded there); and this file
Inputs:     the tree at `1b8b819` (W121-W126 applied: open 23, deferred 65, icebox 182,
            resolved 124, by `npm run q --count`); the diagnosis and logs in dev-dist/p29x-54441/
Outputs:    (1) R9 in check-register.mjs: every `status: open` question has a non-empty
                `closes-when` (after trim, as R2's emptiness test reads a field)
            (2) R9's probes in check-register-selftest.mjs, rule 7 (a)-(c), and META mutants
                that disable and narrow R9's clause
            (3) the META fix: MAX_CORPUS = 0 replaced (Build step 3)
            (4) every fixture anchored on a live question re-pointed (Build step 4)
            (5) the state.mjs floor fix (Build step 5)
            (6) ADR 0082, amending ADR 0079 decision 2
            (7) doc/questions/README.md: the format table's `closes-when` and `owner` rows, and
                *Raising a question* step 2
            (8) Q494 resolved by ADR 0082, and ADR 0082's `resolves` naming Q494 (R8 both ways)
Depends on: W126
Blocks:     nothing — the last item of P29; the plan's Record follows
Tests:      R9's probes are the tests (section 5 rule 7). Expected verdicts come from R9's
            sentence in P29 decision 6, not from running the check. No test under test/ (P29
            prediction 1)
Gate:       R9 provoked at birth; check:register:selftest EXIT 0; npm run state EXIT 0;
            gate:full EXIT 0 once on a still tree; `npm run q -- --where status=open --where
            closes-when=` EXIT 1 printing `no question matches`
Reserves:   Q532 (the last of P29's Q513-Q532 block) and ADR 0082. No W beyond W127
```

Q532 is spare at declaration; an unused id is skipped, never reissued. ADR 0083-0084 stay P29's and
are not this item's.

**Exceptions** — every file edited outside `Owns` and outside section 1 rule 5's record step, named
before the first edit (`doc/workflow.md` section 7 rule 2):

| file | why |
|---|---|
| `doc/plans/p29-which-open-questions-still-matter.md`, its Stop-and-asks table only | row (m), the maintainer's two answers of 2026-10-06, added at this declaration. The plan's Record is a record-step file; the table is not, so it is named here. Nothing else in the plan changes |

## Why the two additions

The maintainer's answers of 2026-10-06 (P29 stop-and-ask (m)), on the coordinator's diagnosis in
`dev-dist/p29x-54441/`:

1. **`scripts/state.mjs` joins Owns.** `npm run state` has EXITed 1 since W123 (`9ad2345`). Its
   `ASSERTIONS` table (line ~335 at `1b8b819`) floors `questions reading open` at 200 under a comment
   that *ids are never reused, so these quantities only grow*. That is true of files and false of a
   status: triage took `open` from 307 to 23 on purpose. **P29 prediction 6 is reversed**, by its own
   stated condition.
2. **The live-question fixtures are W127's to re-point.** `check:register:selftest` is RED on HEAD:
   **META since `81ed979`** (W121), because the mutant *icebox removed from the vocabulary* fails on
   the untouched tree once any question is iceboxed (182 now) and `MAX_CORPUS = 0` forbids that; and
   **STATE since `9ad2345`** (W123), the floor above. W126's Q488 duplicate added a third cause: the
   probes anchored on Q488's `status: open`, `note: ""` and `resolved-by: ""` now abort under rule 7
   (b). `check-markdown-selftest.mjs` anchors on the end fences of `q488.md` and `q490.md`, which no
   verdict has moved yet, and is in Owns so that none can.

## Scope

**In — the BUILD, in this order**

1. **`R9`** in `scripts/check-register.mjs`: `fail('R9', ...)` for each `status: open` file whose
   `closes-when` is empty after trim, naming the file. `deferred`, `icebox` and `resolved` are not
   bound (decision 6). The report lists R9 with R1-R8, and a file whose front matter does not parse
   is R2's, not R9's (R9 reads no field of an unreadable file).
2. **R9's probes** in `scripts/check-register-selftest.mjs`, rule 7: checked in; each asserts that
   it changed its input; each declares the exact set it trips. At least: an open question's
   `closes-when` emptied (`['R9']`); whitespace only (`['R9']`); the CONTROLS that must pass — a
   `deferred`, an `icebox` (with a note) and a `resolved` question each with an empty `closes-when`
   (`[]`); and a status near-miss with an empty `closes-when` (`['R2']` only, or the build states
   why R9 also fires). META mutants: R9's `fail` disabled; R9 reading `!== ''` without trim;
   R9 widened to `deferred`; R9 narrowed to skip the first or last file. Rule 8 (a): every status
   word R9 enumerates is a fixture.
3. **The META fix.** `MAX_CORPUS = 0` is replaced by an **exact by-id allow-list** of the mutants
   permitted to fail the untouched tree, checked both ways: a listed mutant that does NOT fail the
   untouched tree is red, and an unlisted one that does is red. Reported by id, never by count
   (rule 8, *a declared ceiling is reported BY ID*). The BUILD may choose another fix if it
   justifies it in the Record, for example re-pointing the icebox mutant's untouched-tree reading
   at a synthetic register.
4. **Re-point every fixture anchored on a live question** to a synthetic question raised inside
   the staged copy (an id above the register's maximum, written by the harness with the fields the
   probe needs) or to a dedicated fixture file, so that **no triage verdict can break a probe
   again**. At `1b8b819` the anchors are: in `check-register-selftest.mjs`, Q488 (`status: open`,
   `note: ""`, `resolved-by: ""`) and Q490 (`status`, `shared`, `id`, `resolved-by`, and the
   `raise()` template), Q1, Q4, Q12, Q17, Q92, Q300 and Q466; in `check-markdown-selftest.mjs`, the
   end fences of Q488 and Q490. **The BUILD scans every `scripts/*selftest*.mjs` for an anchor on a
   live question first**, and lists the result in the Record; a hit outside Owns is a stop-and-ask,
   not an edit. *(Declaration scan: `check-lookup-selftest.mjs` builds a synthetic tree and anchors
   on nothing live.)* An anchor on a RESOLVED question with an ADR pairing (Q1, Q4 and Q466, for R8)
   is re-pointed too, with a synthetic ADR written into the copy beside its synthetic question;
   keeping any anchor on a register question is a stop-and-ask, not a BUILD judgement.
5. **The `state.mjs` floor fix.** The `questions reading open` floor is removed; the relation row
   (*live questions that are open, deferred or iceboxed* equals `liveCount`) already guards a status
   line that changes shape. The comment that *these quantities only grow* is corrected to say it is
   true of file counts and false of a status. **The `live >= 200` floor is reviewed**: live is 270
   at `1b8b819` and falls with every resolution, so the BUILD keeps it, lowers it or replaces it
   with a relation, and says which in the Record with its margin. `resolved >= 50` is monotonic in
   practice and stays. The STATE pass of `check-register-selftest.mjs` is re-run against the change.
6. **ADR 0082**: *an open question owes a closing condition, and `owner` is prose*. It amends ADR
   0079 decision 2 (`amends: ADR 0079`), adds R9, records that `owner` stays optional prose and is
   not checked (decision 6, Q494), and that `deferred` is not bound because its reason is in `note`.
   `resolves: Q494`. `item: W127`, `raised-by: P29`.
7. **`doc/questions/README.md`**: the `closes-when` row says it is **required non-empty while
   `status` is `open`** (R9) and is a CLOSING condition, not a reopening trigger (W121-W126
   calibration 1 and 9); the `owner` row's Q494 pointer becomes ADR 0082; *Raising a question* step 2
   requires a `closes-when`.
8. **Q494**: `status: resolved`, `resolved-by: ADR 0082`, `closes-when` cleared, `note` appended
   `; P29 W127: resolve — ADR 0082` (decision 2's stamp). R8 is checked both ways: ADR 0082's
   `resolves` names Q494, and Q494's `resolved-by` names ADR 0082.

**Out**

- **`owner`'s form.** No check on it (decision 6). No migration of its prose to `note`.
- **Q465's non-empty `closes-when` on an `icebox`** (W126's Record): R9 does not bind icebox, and
  nothing here clears it.
- **Any other check change, a fifth status word, and the lookup** (P29 Out). `lookup.mjs` and
  `check-lookup-selftest.mjs` are not edited.
- **`CLAUDE.md`, `doc/workflow.md`, `doc/concept.md`, `spec/`, `src/`, `test/`, `examples/`.**
- **Retuning `check-markdown.mjs`'s floors** (Q142). The markdown self-test changes anchors only.

## The procedure

1. **BUILD** steps 1-8 above. Scratch `dev-dist/w127b-<pid>/`. Node 24 by `fnm use 24` in every
   shell; LF only; no Python text mode; scripts written with the Write tool and run by path.
2. **`check:register:selftest` ALONE first**, redirected, EXIT read in the same command; then
   `check:markdown:selftest` alone, since its anchors moved. Fix a red lane and re-run it alone.
3. **`gate:full` ONCE, on a still tree**, with `git diff`'s sha256 taken before and compared after.
   Never over a known red lane.
4. **TWO READERS, fresh contexts, different briefs** (section 6):
   - **conformity**: P29 decision 6, ADR 0079 and the README first, then the diff; re-derives R9's
     verdict on every probe and on the real register; checks the allow-list against the untouched
     tree both ways, and every re-pointed anchor against "no live question".
   - **adequacy**: walks R9's clause, the allow-list and the state floors by rule id and mutates, **in
     an isolated copy** (`git archive` or copy under `dev-dist/`) with dependencies **COPIED, never
     linked**; green in the copy first; `find <copy> -type l` and `gci -Recurse -Force -Attributes
     ReparsePoint` both empty before any removal. It is the only one that mutates.
   Both report; neither fixes. The Record states the overlap.
5. **FIX**, then rule 8: for each finding acted on, break the fix and watch the named lane go red,
   restore with bytes compared, and re-run the set with the readers' exact edits checked in. Then
   `gate:full` once more on the still, final tree.

## Verification

| clause | how |
|---|---|
| R9 provoked at birth | its probes in `check:register:selftest`, each graded on the exact `trips` set, and its META mutants caught |
| `check:register:selftest` | `npm run check:register:selftest > rs.log 2>&1; echo EXIT=$?` — EXIT 0, META and STATE included |
| `npm run state` | `npm run state > st.log 2>&1; echo EXIT=$?` — EXIT 0 |
| `gate:full` | `npm run gate:full > gf.log 2>&1; echo EXIT=$?` — EXIT 0, once per tree |
| the exit artifact | `npm run q -- --where status=open --where closes-when= > r9.log 2>&1; echo EXIT=$?` — EXIT 1, `no question matches` (EXIT 1 at declaration too: the batches left no open question without one) |
| R8 for Q494 | `check:register`'s R8 pairing count: W126's 26 plus 2 (calibration 26) |
| `git diff --name-only` against Owns and Exceptions | by hand, before the Record |
| own-id and withdrawn-claim grep | `W127`, `MAX_CORPUS = 0` and the open floor, excluding `dev-dist/` |

*Routing cases (Q4, Q17, Q10, Q13, Q6): not applicable — no product code changes.*

## Prediction notes

- **Prediction 6 is REVERSED** by its own condition: `state.mjs` changes (stop-and-ask (m)).
  `lookup.mjs` does not, and the Record says whether `lookup:selftest` had to learn R9.
- **Prediction 1 is untouched**: no L0-L6 rung reads a question's `status` or an ADR's `resolves`.
- **Prediction 5 is untouched**: `CLAUDE.md`, `doc/workflow.md` and `doc/concept.md` are not edited;
  `doc/questions/README.md` is the live instruction that names R9.

## Calibration handed on by W126

1. **A fixture anchored on a live question is a P29 hazard**: a verdict can move it, and the
   self-test fails in `gate:full`, not in a batch's gate. Hence Build step 4.
2. **A floor tuned to the register's size breaks when a plan moves that size on purpose** — the
   batches turned `check:register:selftest` and `npm run state` red at W121 and W123, and no batch
   gate ran either. Hence Build steps 3 and 5.
3. **An approved field description can contradict the tree** (Q465's *unchanged (empty)*): apply
   the operation, report the mismatch, never fit the value to the description.
4. **The keeps round followed every recommendation for the third batch running.**
5. **Resolves overturned at W126: 1 of 2** (Q461).

## BUILD

*The build unit's report, 2026-10-06, on `8ad7db7` plus this item's edits, uncommitted. Scratch
`dev-dist/w127b-56423/`, whose `56423` is the build shell's pid. The Reader and Record sections are
later units'.*

**Built, per Build step.**

1. **`R9`** in `scripts/check-register.mjs`: for every PARSED file carrying both `status` and
   `closes-when`, `status: open` with `closes-when` empty after `trim()` fails, naming the file. A
   file that does not parse, or lacks either field, is skipped as R2's. R9 runs inside the
   readable-folder branch, so a missing folder prints it NOT RUN; it is in `ran`, in the report rows
   and in the header comment.
2. **R9's probes**, 14, in `scripts/check-register-selftest.mjs`, each checked in, each graded on its
   exact `trips` and `notRun` sets, each aborting if its staging changed nothing (rule 7 (b)):
   - `['R9']` x5: `closes-when` emptied; one space; a tab and a newline; the FIRST file in the
     folder's order (q1.md, overwritten whole with a synthetic open question); the LAST (a synthetic
     q99999.md).
   - `[]` x3, the controls: the SAME synthetic file with `closes-when` emptied and its status moved
     to `deferred`, to `icebox` (its note kept) and to `resolved` (with a `resolved-by`) — so every
     status word R9 enumerates is a fixture, and each control differs from the firing probe by the
     status alone (rule 8 (a)).
   - `['R2']` x6: each of the five status near-misses (`opened`, `Open`, `Deferred`, `iceboxed`,
     `Resolved`) with `closes-when` emptied, and an open question with `closes-when` emptied whose
     front matter never closes. The existing *`closes-when` deleted* probe (`['R2']`) is R9's
     absent-field control.
   - **11 META mutants**: R9's test disabled; without its trim; stripping spaces only; widened to
     `deferred`; the status matched case-insensitively; by prefix; an absent `closes-when` read as
     empty; the first file skipped; the last file skipped; `ran.R9` never set; R9 marked run with no
     folder. Each names the probe that must stop grading as declared.
   - The folder-missing probe's `notRun` set gained `R9`.
3. **The META fix**: `MAX_CORPUS = 0` is replaced by `CORPUS_ALLOWED`, an exact list of META NAMES
   permitted to fail the untouched tree, checked BOTH WAYS in the META pass — a listed mutant that
   is inert is red, and an unlisted one that is not inert is red — and statically, before anything
   runs, against the META list (a name that is no META entry, or a name listed twice, is red). The
   run reports the corpus-noticed mutants BY NAME. Listed at build: *`icebox` removed from the
   vocabulary* (182 iceboxed questions) and *R9 widened to `deferred`* (64 of 65 deferred questions
   carry no `closes-when`). Measured over all 184 META entries against the untouched tree before the
   gate: exactly those two are not inert, and 0 disagree with the list. The SELF entry for
   `MAX_CORPUS` is replaced by three: the list emptied, an inert mutant listed, and a name that is
   no META entry.
4. **Every live-question fixture re-pointed.** The harness PLANTS synthetic questions into its
   staged copy — Q8001 (open, a note), Q8002 (open, empty note), Q8003 (resolved by prose), Q8004
   (resolved by the synthetic ADR 8803, which resolves it back), Q8005 (deferred), Q80031 (resolved;
   Q8003 is a prefix of its id) — and synthetic ADRs 8801-8803 for R3's and R8's pairings. `plant`
   refuses to overwrite a register file, so the day the register reaches the band it aborts by name.
   Every probe, grader control, STATE probe, the R4 deletion target (was Q300) and the restore
   control's shifted file (was q1.md) now reads only these. *Scan of every `scripts/*selftest*.mjs`
   first*: anchors on live questions in `check-register-selftest.mjs` (Q1, Q4, Q12, Q17, Q92, Q300,
   Q466, Q488, Q490 — the declaration's list, complete) and in `check-markdown-selftest.mjs` (the
   end fences of q488.md and q490.md); `check-lookup-selftest.mjs` builds a synthetic tree; the other
   eight self-tests and `run-selftests.mjs` name no question file. **What still needs a real file,
   and why**: q466.md by NAME, because `NOT_A_RESOLUTION` in the check excuses `Q466 -> ADR 0077`
   by id — the base overwrites it whole with a synthetic stand-in, so no probe reads its content;
   q1.md by NAME for R9's first-position probe, overwritten whole; q490-q499 and q492 by EXISTENCE
   for the two STATE listing mutants S1 and S1b; and q488.md and q490.md by existence in the
   markdown self-test, whose five probes now write a synthetic question over the file and read none
   of it. Real ADRs 0062, 0077, 0078 and 0079 stay R6/R7 anchors: no ADR's CONTENT is a triage
   subject, **but its `resolves` is** (P29 decision 5), so the five probes that anchored on
   `resolves: ""` above the fence of 0079 and 0062 now anchor on the fence itself.
5. **The `state.mjs` floor fix.** The `questions reading open >= 200` floor is removed. The comment
   now says a floor is safe where the quantity only grows, which is true of a file count and false
   of a status. **The `live >= 200` floor is REPLACED by a relation**: live against open + deferred +
   iceboxed read the other way, so with the existing forward row live EQUALS their sum at any
   register size. What the floor caught (every question read as resolved, live 0) the relation
   catches; a new STATE_META entry, S8, provokes it. Margin: none needed — at W127 live is 270,
   which a floor of 200 would have lost after 71 more resolutions. `resolved >= 50` stays.
6. **ADR 0082**, *An open question owes a closing condition, and owner is prose*: `amends: ADR 0079
   decision 2`, `resolves: Q494`, `item: W127`, `raised-by: P29`.
7. **`doc/questions/README.md`**: the `closes-when` row (a CLOSING condition, required non-empty
   while `open`, R9), the `owner` row's pointer moved from Q494 to ADR 0082, the `open` status row,
   the check paragraph naming the amendment, and *Raising a question* step 2 requiring a
   `closes-when` (or `deferred` with its reason).
8. **Q494**: `status: resolved`, `resolved-by` naming ADR 0082 decision 4, `closes-when` cleared,
   `note` appended `; P29 W127: resolve — ADR 0082`. `check:register` R8 compared 28 pairings,
   W126's 26 plus 2.

**Floors moved to their lists' lengths**: `MIN_PROBES` 238 -> 252, `MIN_META` 173 -> 184,
`MIN_SELF` 19 -> 21, `MIN_STATE_META` 10 -> 11.

**Prediction 6 is reversed as declared** (`state.mjs` changed). `lookup.mjs` and
`check-lookup-selftest.mjs` are untouched; `lookup:selftest`'s AGREE did not have to learn R9.

**The gate**, every command redirected with its EXIT read in the same command:

| command | EXIT | log, under `dev-dist/w127b-56423/` |
|---|---|---|
| `npm run check:register:selftest`, alone | **0** — 252 probes (232 caught, 20 clean), 4/4 grader, META 182/184 by the named probe plus 2 by the corpus as `CORPUS_ALLOWED` permits, by name; STATE 6/6 and 11/11; SELF 21/21; digest unmoved | `regself.log`, `regself.exit` |
| `npm run check:markdown:selftest`, alone | **0** | `mdself.log` |
| `npm run check:register` | **0** — R1-R9 ok, R8 compared 28 pairings | `reg2.log` |
| `npm run state` | **0** — all 24 derivations non-empty | `st2.log` |
| `npm run q -- --where status=open --where closes-when=` | **1**, `# no question matches`, as the exit artifact requires | `r9.log` |
| `npm run gate:full`, once | **0** — selftests 11/11 ok, 2164.2 s wall | `gatefull.log`, `gatefull.exit` |

The tree was still across `gate:full`: the sha256 of `git diff` plus ADR 0082 (untracked) was
`0ea2b884…d6498` before and after (`gf-before.sha`, `gf-after.sha`). This table was written after
the gate and is the only edit since. `git diff --name-only` plus the one untracked file: the five
Owns scripts and documents, `q494.md`, ADR 0082 and this file. The plan's Stop-and-asks row (m),
the declared exception, was written at declaration and is unchanged by the build.

## Reader

### Conformity reader

*Section 6 pass 2, 2026-10-06, on `d2c19ff` with the tree clean. Spec first (P29 decisions 1, 6
and 7, stop-and-ask (m), the predictions; ADR 0079; ADR 0082; doc/questions/README.md; this file's
Owns, Gate and Build steps), the verdicts derived on paper, then the diff. Scratch
`dev-dist/w127c-56876/`, whose `56876` is the reader shell's pid: `construct.mjs`, `statemut.mjs`,
`corpus.mjs` and their logs. Nothing tracked was edited except this section. Reports; fixes
nothing.*

**What conforms, by construction** (`node dev-dist/w127c-56876/construct.mjs`, EXIT 0, 18 staged
copies run through the real `check-register.mjs` and `lookup.mjs`). Each verdict matched the one
derived from ADR 0082 decisions 1-3 before the run: open with `""`, `"   "`, `"\t\r\n"` or NBSP
gives R9; a quoted `"open"` status gives R9; open with an unquoted empty or padded value, with the
field missing, declared twice, or with CRLF endings gives R2 and not R9; `Open` gives R2 alone;
deferred, icebox with a note, and resolved with a `resolved-by`, each with `""`, give nothing; an
id that disagrees with its name gives R1 and R9, because the file parses; and a missing folder
gives R1 and R5, with R9 NOT RUN. *The staged copies leave out `doc/scheduler-upstream.md`, so R7
is red in every row, the control included. That comes from the staging and is independent of R9.*
On the real tree: `npm run check:register` EXIT 0 (R1-R9 ok, R8 28 pairings); `npm run state`
EXIT 0 (live 269 = open 22 + deferred 65 + icebox 182); the exit artifact query EXIT 1,
`no question matches`. Deferred: 65, of which 64 have an empty `closes-when`, which is ADR 0082's
figure. ADR 0082 amends ADR 0079 decision 2 in its front matter and in decision 5, in the form
other ADRs use (`amends: ADR 0078 decision 1`). Q494 is resolved with R8 holding both ways: ADR
0082 is the only ADR whose `resolves` names Q494, and Q494's `resolved-by` names ADR 0082.
`CORPUS_ALLOWED` is checked both ways: statically, an unknown or duplicated name is red; at run
time, a listed mutant that is inert is red and an unlisted one that is not inert is red. The
markdown self-test's five probes ignore the file's text and write a synthetic question.

**Findings**

1. **MEDIUM. The replacement for `live >= 200` does not catch what the floor caught, and two
   places say it does.** The second relation row, at scripts/state.mjs:344-349, is a tautology
   over the unmutated code. `liveCount` is `questions.length - resolvedCount`, and the four
   `byStatus` counts are disjoint, so `live >= open + deferred + icebox` holds for every input. It
   can fail only when one of the two count expressions is mutated on its own. S8 is that mutation,
   and the row catches it. A status reader that reads every file as `resolved` does not get
   caught: live is 0, every count is 0, and both rows hold. Evidence: `node
   dev-dist/w127c-56876/statemut.mjs`, EXIT 0. With the reader mutated to return `resolved`,
   `state.mjs` prints `live / resolved 0 / 394` and **EXITs 0**, where `live >= 200` would have
   been red. S8 applied gives EXIT 1, and S8 applied with the reverse row deleted gives EXIT 0.
   This breaks Build step 5's *says which … with its margin*: BUILD step 5 says *what the floor
   caught (every question read as resolved, live 0) the relation catches*, and so does the comment
   at state.mjs:344-347. That holds for a `resolvedCount` mutation and is false for a status
   reading that collapses. The self-test's STATE pass, with its third reading, may still see it
   under `gate:full`. A person's own `npm run state` does not.
2. **MEDIUM. `CORPUS_ALLOWED` is a fixture that depends on live register content, which is what
   Build step 4 set out to remove.** Inertness is measured by `run(mutant, null)` at
   scripts/check-register-selftest.mjs:1741, which reads the REAL register, so both entries
   (lines 63-66) depend on its content. `R9 widened to deferred` needs at least one deferred
   question with no `closes-when`, and `icebox removed` needs at least one iceboxed question.
   Evidence: `node dev-dist/w127c-56876/corpus.mjs`, EXIT 0. I gave the 64 deferred questions a
   `closes-when`, which ADR 0082 decision 3 permits. The widened mutant goes from EXIT 1 to EXIT 0
   (INERT), and line 1744 turns that into a red META entry. Two clauses conflict. Build step 4 says
   *no triage verdict can break a probe again*. Build step 3 offered a synthetic register for the
   untouched-tree reading, and the BUILD did not take it. A side effect: the deferred control's
   power against widening is credited to the corpus and is never graded by its own probe.
3. **LOW. ADR 0082 consequence 1 overclaims.** At doc/decisions/0082-*.md:54-57 it calls the
   lookup's empty match *the same fact* as R9. The lookup's `=` is exact and does not trim
   (scripts/lookup.mjs:548), while R9 trims. An open question with `closes-when: "   "` is red under
   R9 and is not matched by `--where closes-when=` (construct.mjs, rows 3-5). R9 is the stricter of
   the two, so green R9 implies an empty lookup and the exit artifact is sound. The converse is
   false.
4. **LOW. Two probes still depend on the relationships of register questions, though not on
   their content.** The first-position R9 probe overwrites q1.md (selftest:504-510), and `plant`
   overwrites q466.md (selftest:129-130). The probe's exact `['R9']` holds only while no real
   ADR's `resolves` names Q1. The base holds only while no ADR other than 0077 resolves Q466,
   because otherwise R8 fires. That is true today (grep `^resolves:` over doc/decisions/). Under
   P29 decision 5, a later resolution that names an ADR edits that ADR's `resolves`, so this can
   move. The BUILD names both files and gives its reasons. It does not name this dependency.
5. **INFO. "Non-empty after a trim" is JavaScript's `trim()`.** A `closes-when` of `"​"`
   (zero-width space) passes R9 (construct.mjs, row 6). That conforms to ADR 0082 decision 1 as
   written, and consequence 3 already accepts placeholders.
6. **INFO, already in the code before W127.** A `q<N>.md` that exists but cannot be read throws
   at scripts/check-register.mjs:246 before any clause reports. It is an uncaught crash with a
   non-zero exit, not a named R2 failure. R9 never reads such a file, which conforms, but the
   README's *refused rather than guessed at* gets a stack trace here. I did not construct this
   case: denying read access on Windows needs an ACL edit, which I chose not to make in the shared
   tree.

**Not run:** `check:register:selftest`, `gate:full` and every self-test, which are the author's
rungs and the adequacy reader's subject. No mutation was made to the shared tree. Scratch
copies only.

### Adequacy reader

*Section 6 pass 2, mutation, 2026-10-06. I read the spec first (ADR 0082, ADR 0079 decision 2,
doc/questions/README.md's format and P29 decision 6), then the tests. Isolated copy:
`git archive d2c19ff` into dev-dist/w127q-56833/tree, with node_modules COPIED (`cp -r`), plus one
archive tree for each state.mjs mutant and harness mutant. Node 24.20.0 in every shell. Logs are in
dev-dist/w127q-56833/res/, where 56833 is the reader shell's pid.*

**Green in the copy first.** `node scripts/check-register.mjs` gave EXIT 0, with R1-R3 and R5-R9
ok and R4 NOT RUN. `node scripts/check-register.mjs --self-test` gave EXIT 0 in 2026 s: 232/232
caught and 20/20 clean, META 182/184 plus the 2 that CORPUS_ALLOWED names, STATE 6/6 and 11/11,
SELF 21/21, and the digest unmoved.

**How each mutant was graded.** Each check-register mutant was graded twice. First it was run on
the untouched tree, to see whether the corpus notices it. Then the whole PROBES and STATE pass was
run against it, through `CHECK_REGISTER_SCRIPT`. A state.mjs mutant was placed in its own archive
tree and graded by `node scripts/state.mjs` (what a person runs) and by the STATE pass (what the
gate runs). CAUGHT means a self-test EXIT of 1 (or 3) with the named probe among its FAIL lines.
The SELF pass of the green run already covers the three CORPUS_ALLOWED rows (CA1-CA3), so those
rows cite that run instead of a separate one.

| # | rule | mutation | caught | by what |
|---|---|---|---|---|
| CR01 | R9 | the whole R9 block removed | yes | every probe: R9 row NOT RUN against the declared notRun |
| CR02 | R9 | binds `deferred` and skips `open` | yes | the corpus, and all 252 probes as noise — Q8005 and 64 register questions are deferred with no closes-when |
| CR03 | R9 | binds every status but `resolved` | yes | the corpus, and 247 probes as noise |
| CR04 | R9 | binds `open` and `icebox` | yes | the corpus, and 247 probes as noise |
| CR05 | R9 | no trim | yes | the one-SPACE and TAB-NEWLINE probes |
| CR06 | R9 | trims spaces only | yes | the TAB-NEWLINE probe |
| CR07 | R9 | reads `owner` instead of `closes-when` | yes | 242 probes (BARE has an empty owner) |
| CR08 | R9 | reports as R2 | yes | the five R9 probes, against-declaration |
| CR09 | R9 | tests only the first file | yes | the emptied, space, tab and last-file probes |
| CR10 | R9 | tests only the last file | yes | the emptied, space, tab and first-file probes |
| CR11 | R9 | `break` after the first failure | **no** | — |
| CR12 | R9 | runs only when no earlier clause failed | **no** | — |
| CR13 | R9 | skips a file without exactly ten fields | **no** | — |
| CR14 | R9 | skips a file whose cluster is undeclared | **no** | — |
| CR15 | R9 | skips a file whose id disagrees with its name | **no** | — |
| CR16 | R9 | a closes-when shorter than 4 characters read as empty | **no** | — |
| CR17 | R9 | ASCII whitespace stripped instead of `trim()` | **no** | — |
| CR18 | R9 | the message drops the file name | yes | the five R9 probes, wrong-reason |
| CR19 | R9 | `TBD` refused as a placeholder | **no** | — |
| CR20 | R9 | widened to `deferred` (the listed META mutant, graded by its probes) | yes | the corpus, and 247 probes as noise, the three R9 CONTROLs among them |
| ST01 | state relation | `icebox` dropped from the reverse (`live`) row | **no** | — |
| ST02 | state relation | the reverse (`live`) row deleted | **no** | — |
| ST03 | state open floor | `open >= 200` added back | yes | STATE CONTROL and the iceboxed probe exited 1; `npm run state` exited 1 |
| ST04 | state live floor | `live >= 200` added back | **no** | — |
| ST05 | state relation | reverse row deleted and S8 applied together | yes | the figure grader (`live/resolved 0,400`), not the relation; `node scripts/state.mjs` EXIT 0 with live 0 |
| ST06 | state open floor | `open >= 20` added back | **no** | — |
| CA1 | CORPUS_ALLOWED | the list emptied | yes | SELF entry, green run 21/21 |
| CA2 | CORPUS_ALLOWED | an inert META name added | yes | SELF entry, green run 21/21 |
| CA3 | CORPUS_ALLOWED | a name that is no META entry | yes | SELF entry, green run 21/21 |
| H3 | fixtures | OPEN set to 494, a register id | yes | `plant` refuses, ABORT, EXIT 3 |
| H3b | fixtures | the emptied R9 probe anchored on live Q20 | **no** | single-probe mode grades it caught, EXIT 0 |

**31 mutants: 18 caught and 13 survived.**

**Constructed inputs**, each run through the copy's check against a staged register (construct.log).
The check is right on all ten, and the probes cover none of K3-K6, K9 or K10:

- K1, an inline comment after `""`, is R2: the quoted value does not parse.
- K2, a CRLF file, is R2: it does not open with `---`.
- K3 (U+00A0) and K10 (U+FEFF) are R9, because `trim()` strips them.
- K4 (U+200B) passes R9.
- K5, two open files, gives two R9 lines.
- K6, an undeclared cluster, is R2 and R9 both.
- K7, a plain `TBD`, passes.
- K8, a plain value with a trailing comment, is R2.
- K9, an id that disagrees with its name, is R1 and R9 both.

**Findings**

1. **MEDIUM. R9 is never graded when it is not the only failure** (CR11-CR15). Every R9 probe stages
   exactly one fault, so nothing in the suite can see a narrowing by interaction. Four kinds of
   change survive, each at EXIT 0: R9 stopping after its first failure; R9 running only when the
   other clauses are clean; R9 skipping a file that has an extra field or an undeclared cluster;
   and R9 skipping a file whose id disagrees with its name. ADR 0082 decision 2 says *one failure
   per open file* and excuses only an unparseable file or a missing `status` or `closes-when`. K5,
   K6 and K9 show that the check does what the ADR says; the suite does not. The probes are
   checked in and cheap: two open files emptied (`['R9']`, with both file names in the reason), an
   open file emptied with an undeclared cluster (`['R2','R9']`), and an id mismatch
   (`['R1','R9']`).
2. **MEDIUM-LOW. The reverse `live` relation can be deleted (ST02) or have `icebox` dropped (ST01)
   at no cost.** S8 does not provoke the relation: ST05 shows S8 is still caught with the relation
   gone, by the STATE grader's figure comparison. A person's `npm run state` then exits 0 with
   live 0. The BUILD says *S8 provokes it*. It provokes the figure grader. Rule 8 (c): count the
   observers.
3. **LOW. The three R9 CONTROLs (deferred, icebox, resolved) are never seen to discriminate.** Every
   staged copy holds the synthetic Q8005, deferred with an empty closes-when, and the register's
   deferred and iceboxed questions. So any widening of R9 fails every probe (CR02-CR04, CR20).
   That is Q150's noise, not the control's verdict. The META pass is still sound, because the
   corpus catches each widening and CORPUS_ALLOWED lists it by name. What is unproven is that a
   control would notice a widening on its own.
4. **LOW. R9 over-binding a short or placeholder condition survives** (CR16, CR19). ADR 0082
   consequence 3 says outright that `TBD` passes, and no probe holds a minimal non-empty
   `closes-when`.
5. **LOW. Non-ASCII whitespace is unprobed** (CR17). And K4: a closes-when of U+200B, which looks
   empty, passes R9 because `trim()` leaves U+200B alone. That is the ADR's *after a trim* read
   literally. I am noting it, not calling it a defect.
6. **INFORMATIONAL. A status floor can be re-added below today's reading** (ST04 `live >= 200`,
   ST06 `open >= 20`) and nothing objects. This is the shape the corrected comment warns about.
   No check could tell it apart from a legitimate floor.
7. **LOW. Only `plant` guards the synthetic band** (H3b). Nothing stops a future probe from editing
   a live question by number. One that does is graded caught today and goes red at the next
   triage, which is calibration 1's hazard.

**Link scan before removal.** `find dev-dist/w127q-56833 -type l` printed nothing, and
`gci -Recurse -Force -Attributes ReparsePoint` counted 0. The trees were then removed and the logs
kept. In the shared tree, only this section changed.

## Record

*The fix unit, 2026-10-06, on `d2c19ff` plus this round's edits, uncommitted. Scratch
`dev-dist/w127f-57782/`, whose `57782` is the fix shell's pid. Every command redirected, its EXIT
read in the same command. The tree was still across the rule 8 re-run, the lanes and `gate:full`:
this Record and the Status line are the only edits since.*

**What was built** — the BUILD section above, plus this round:

1. **R9 beside another failure** (adequacy finding 1, CR11-CR15): four probes in
   `scripts/check-register-selftest.mjs` — two open files emptied (`['R9']`, BOTH file names
   required: `says` may now be a list, each matched on a failure line), an undeclared cluster
   (`['R2','R9']`), an eleventh field (`['R2','R9']`) and an id disagreeing with its name
   (`['R1','R9']`) — and five META entries, CR11-CR15, each naming its probe.
2. **The emptiness test's other edge** (CR16, CR17, CR19): `x` is clean, `TBD` is clean (ADR 0082
   consequence 3 is right, so no stop), a no-break space alone is `['R9']`; three META entries.
3. **The live relation made able to fail** (conformity 1, adequacy ST01/ST02): `scripts/state.mjs`'s
   tautological reverse row is REPLACED by `live >= liveSecondRoute`, a live count read by a second
   route — its own `readdirSync` listing, its own read, a line scan — that does not pass through
   `questions`. **Why this and not a STATE probe alone**: no staged tree can make the old row fail on
   unmutated code, because it is an identity over four disjoint counts; a probe can only fail a row
   that some input can fail. The smallest change is one independent count and one row. And
   `STATE_META` gains a fourth element, the ROW a mutant must be refused BY: S8 and the new **S9**
   (the status reader returns `resolved` for every file — the all-resolved misreading) are graded on
   that row's refusal, so the figure grader can no longer stand in for it (ST05's shape).
   `MIN_STATE_META` 11 -> 12.
4. **Inertness measured on the planted base** (conformity 2, option (a)): `run(mutant, base)`, and a
   synthetic iceboxed **Q8006** joins the planted fixtures, so each `CORPUS_ALLOWED` entry is
   non-inert BY A SYNTHETIC FILE (Q8006; Q8005 deferred with no `closes-when`).
5. **A control seen to discriminate on its own** (adequacy finding 3): a listed mutant is now ALSO
   graded by its named probe, and *R9 widened to `deferred`* is graded on a new isolated control —
   every other deferred file given a `closes-when` first — with an optional fourth META element
   requiring every failure line to name `q8001.md`.
6. **The register-write guard** (adequacy H3b): after each staging, a question file below the
   synthetic band (8000) that is new or changed aborts the probe by name. Deletion is not a write;
   q1.md and q466.md are declared stand-ins; a probe may pass only by declaring `writesRegister` with
   its reason (the isolated control is the one). A GUARD CONTROL provokes it on every run (the
   lowest non-stand-in register id, found at run time) and a SELF entry blinds it.
7. **ADR 0082 consequence 1** corrected (conformity 3): the query is a WEAKER reading — exact `=`,
   no trim — so green R9 implies an empty query and not the converse.
8. **Q150's note** appended: `MAX_CORPUS` no longer caps the register self-test; it caps three.

Floors moved to their lists' lengths: `MIN_PROBES` 252 -> 260, `MIN_META` 184 -> 192, `MIN_SELF`
21 -> 22, `MIN_STATE_META` 11 -> 12. `scripts/check-register.mjs`, `doc/questions/README.md` and
`scripts/check-markdown-selftest.mjs` were not edited this round.

**The readers' findings and their disposition**

| reader | finding | disposition |
|---|---|---|
| conformity 1 | the reverse `live` row is a tautology; an all-resolved reader exits 0 | FIXED — built 3 |
| conformity 2 | `CORPUS_ALLOWED` leans on live register content | FIXED — built 4 |
| conformity 3 | ADR 0082 consequence 1 says *the same fact* | FIXED — built 7 |
| conformity 4 | the q1.md and q466.md overwrites hold only while no ADR's `resolves` names Q1, and none but ADR 0077 names Q466 | INFO. **The condition**: the first-position probe's exact `['R9']` holds while no ADR's `resolves` names Q1, and the base holds while ADR 0077 is the only ADR whose `resolves` names Q466; a later resolution that names either breaks it with an R8 failure, by name |
| conformity 5 | U+200B counts as non-empty | INFO — `trim()` as ADR 0082 decision 1 says; consequence 3 accepts placeholders |
| conformity 6 | an unreadable `q<N>.md` crashes before any clause reports | INFO — pre-existing at W116, not R9's |
| adequacy 1 | CR11-CR15 survive | FIXED — built 1 |
| adequacy 2 | ST01/ST02 survive; S8 is caught by the figure grader | FIXED — built 3 |
| adequacy 3 | the three R9 controls are never seen to discriminate | FIXED for the deferred control — built 5. The iceboxed and resolved controls are still seen only with noise: INFO |
| adequacy 4 | CR16, CR19 survive | FIXED — built 2 |
| adequacy 5 | CR17 survives; U+200B passes | CR17 FIXED — built 2; U+200B INFO, as conformity 5 |
| adequacy 6 | ST04, ST06: a status floor re-added below today's reading | INFO — not a defect of the shipped code, and no fix here catches it: a floor below the reading passes by construction |
| adequacy 7 | H3b: nothing stops a probe writing a live question | FIXED — built 6 |

**The reader overlap: 2 shared subjects** — the live relation (conformity 1, adequacy 2) and the
zero-width space (conformity 5, adequacy 5), which agrees with the coordinator's estimate.
*Considered and not counted*: conformity 4 and adequacy 7 both concern probes touching register
files, but conformity 4 is the RELATIONS two declared stand-ins depend on and adequacy 7 the
ABSENCE of a guard; and conformity 2 and adequacy 3 both concern the register's deferred
questions, but their subjects are the allow-list's inertness and the controls' discrimination.

**Rule 8 — each fix broken, the red seen, the break undone.** Every break was made in a scratch
mutant or a scratch COPY of the tree (`dev-dist/w127f-57782/tree-*`, copied, never linked, removed
after each run), so no restore of the shared tree was needed. The shared tree's `git diff` digest
was `b2482299…a3302` before the still-tree run and before and after `gate:full`.

| fix | break | red seen | EXIT |
|---|---|---|---|
| 1, 2 | each CR mutant applied to the check, the new probe in single-probe mode (`probes.mjs`) | CR11 wrong-reason; CR12 (twice), CR13, CR14, CR15, CR16, CR17, CR19 against-declaration | **1** x9; the 8 probes against the real check **0** x8 |
| 3 | `state.mjs`: the all-resolved reader; S8 (`statemut.mjs`) | refused BY the new row | **1**, **1** |
| 3 | the same two with the new row deleted | not refused (ST02's shape) | **0**, **0** — what the fix closes |
| 3 | the new row deleted, through the STATE pass (`trim.mjs row-deleted`) | `STATE_META S8`, `S9` — *not refused by* the row | **1** |
| 4 | a legal register edit (64 deferred given a `closes-when`) with inertness on the base (`register-edit`) | none | **0** |
| 4 | the same edit with inertness on the REAL register (`register-edit-on-real`) | *listed in CORPUS_ALLOWED and INERT* | **1** |
| 5 | the isolated control's `fillDeferred` removed (`iso-unfilled`) | *seen through 65 failure line(s) not naming q8001.md* | **1** |
| 6 | a probe pointed at live Q20, full pass (`guard`) and single-probe mode (`guard-single`) | abort: *the probe WROTE register question(s) q20.md* | **1**, **1** |
| 6 | the guard blinded (`guard-blind`; `guard-blind-single`) | GUARD CONTROL red; the live probe grades **caught**, which is H3b | **1**; **0** |

`trim.mjs fixed`, the trimmed harness on the unbroken copy: **0**. Each `trim.mjs` case printed
*as-predicted*.

**The lanes**, on the still tree, logs under `dev-dist/w127f-57782/`:

| command | EXIT | |
|---|---|---|
| `npm run check:register:selftest`, alone | **0**, 1828 s | 260 probes (237 caught, 23 clean), grader 4/4, guard seen, META 192/192 by the named probe, 2 also by the corpus on the base, by name; STATE 6/6 and 12/12; SELF 22/22; digest unmoved |
| `npm run check:register` | **0** | R1-R9 ok, R8 28 pairings |
| `npm run state` | **0** | live 269 / resolved 125; open 22, deferred 65, iceboxed 182; 24 derivations |
| `npm run check:markdown` | **0** | |
| `npm run check:markdown:selftest` | **0** | |
| `npm run q -- --where status=open --where closes-when=` | **1** | `# no question matches`, the exit artifact |
| `npm run gate:full`, once | **0**, 2580 s wall | selftests 11/11 ok, 2424.3 s, 10 lanes |
| `npm run lint`, `npm run check:wiring`, before the still tree | **0**, **0** | |

**Predictions.** **1 holds**: no L0-L6 rung reads a question's `status` or an ADR's `resolves`, and
nothing under `test/` changed. **5 holds**: `CLAUDE.md`, `doc/workflow.md` and `doc/concept.md`
were not edited. **6 is REVERSED** by its own condition: `scripts/state.mjs` changed, by the
maintainer's answer (m), at the BUILD and again here. `lookup.mjs` and `lookup:selftest` did not.

**Ids**: ADR 0082 issued. **Q532 unissued** — skipped, never reissued. No W beyond W127.

**`git diff --name-only`**: `scripts/check-register-selftest.mjs`, `scripts/state.mjs`, ADR 0082,
`doc/questions/q150.md` and this file — every one in Owns or the record step; nothing untracked.
Over the item: the five Owns scripts and documents, `q494.md`, ADR 0082, `q150.md` and this file,
with the plan's Stop-and-asks row (m) the declared exception. **Own-id and withdrawn-claim grep**,
excluding `dev-dist/`: `W127` appears where P29 and W121-W126 name it as planned and in the files
this item owns; *the same fact* survives only inside ADR 0082's correction note; *read the other
way* only in `state.mjs`'s comment naming the first cut; `MAX_CORPUS = 0` only as the history in
the register self-test's comments.

**Info for a human, not acted on**: a future ADR whose `resolves` names Q1 or Q466 breaks the base
by name (conformity 4); the iceboxed and resolved R9 controls still discriminate only under noise.
