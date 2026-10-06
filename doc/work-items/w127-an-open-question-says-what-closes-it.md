# W127 — R9: an open question says what would close it; ADR 0082; Q494 resolved; the self-test and `npm run state` made triage-proof

**Status:** in progress — declared 2026-10-06 on `1b8b819`, after W126's Record; BUILD done 2026-10-06, readers next
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

## Record

*Filled in when the item is done, with the tree still.*
