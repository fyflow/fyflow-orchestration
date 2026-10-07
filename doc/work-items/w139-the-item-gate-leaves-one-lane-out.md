# W139 — `gate:item`: an item's confirming gate is `gate:full` less the register lane

**Status:** done 2026-10-07 — see the Record. Declared on `ac84c1e`, before any file under `Owns` was edited.
**Plan:** none — an item outside any plan, on W98's precedent. Its source is P30's Retro section 10,
*the maintainer's answer, 2026-10-07: proposal A*, which names this mechanism and the five files it
owns; `doc/workflow.md` v0.29 says the rule is *in force when the `gate:item` mechanism lands*. It
takes the next id, so the next free work item after it is W140; the Record states the ledger
sentence once the reserved Q block is settled.

*Every id in this file is bare text and the file carries no relative link — Q142's `M4`, as the brief
asks.*

**Question:** *what runs the self-tests less exactly one lane, in a form the gate's own checks can
see, so that v0.29's item gate exists?*

```
Spec:       none - doc/workflow.md section 4, v0.29 (an item's confirming gate is gate:full LESS
            check:register:selftest; the plan's last item runs the whole gate:full; an item editing
            scripts/check-register*.mjs, scripts/state.mjs or doc/questions/README.md runs that lane
            too), and P30's Retro section 10. NO ADR is predicted: ADR 0070 rule 4 (nothing deleted,
            every lane still runs) holds, once per plan, which section 10 states.
Owns:       package.json (a gate:item entry, and nothing else in it)
            scripts/run-selftests.mjs (the leave-one-out option)
            scripts/check-wiring.mjs and scripts/check-wiring-selftest.mjs (the binding)
            CLAUDE.md ("How work is done": the ITEM'S CONFIRMING GATE lines)
            doc/workflow.md (section 4's v0.29 paragraph)
            this file
Inputs:     P30's Retro sections 1, 3 and 10 (777.2 s without the lane; ~915 s estimated with the
            ladder's ~138 s, against 41 min); doc/workflow.md v0.29 and section 5 rules 7 and 8;
            scripts/run-selftests.mjs and check-wiring.mjs G4/G5 as they stand at ac84c1e.
Outputs:    (1) `node scripts/run-selftests.mjs --without <entry>`, repeatable: refuses a missing
                value, an entry that is not one of the manifest's `:selftest` entries, a duplicate,
                any argument it does not know, and a set that leaves nothing to run; `--plan` prints
                each left-out entry and the count; the run's accounting compares planned plus
                left-out to the manifest BOTH WAYS
            (2) package.json `gate:item`: `npm run gate && node scripts/run-selftests.mjs --without
                check:register:selftest`
            (3) check-wiring `G7`: `gate:item` exists; is exactly two `&&` parts, `npm run gate` then
                the runner followed only by `--without <entry>` pairs; the set it names equals a
                declared ITEM_LEAVES_OUT both ways; and the runner, run with that argv plus `--plan`,
                plans exactly the manifest's entries less that set and reports exactly that set left
                out. `G5`'s declarations follow the runner's. Provoked at birth in
                check-wiring-selftest.mjs, checked in (section 5 rule 7 (a)-(c))
            (4) CLAUDE.md and doc/workflow.md name `gate:item`; v0.29's "until then" sentence deleted
            (5) gate:item measured for real, wall against the retro's ~915 s and 41 min
Depends on: nothing
Blocks:     nothing - every later item's confirming gate uses it
Tests:      the runner's refusals and `G7` each provoked by a checked-in probe declaring its exact
            set of tripped checks; rule 8 on every output in dev-dist/w139-1638/ with a no-op control,
            a CRASH grader and a WRONG-REASON grader; expected values from v0.29 (the set left out is
            exactly {check:register:selftest}) and never from the runner's output.
Gate:       L0 untouched (scripts/ is not linted - check-wiring's G6 header); check:wiring and
            check:wiring:selftest alone (the owned lane, rule 7); check:budget; then
            `npm run gate:item` measured; then the WHOLE `npm run gate:full` once on a still tree,
            because this item builds the mechanism (the brief), with a content digest at both ends.
Reserves:   Q548-Q552; ADR 0087 only if a stop-and-ask answer needs one
```

## Exceptions, declared before their first edit

| file | why | predicted |
|---|---|---|
| `doc/glossary.md` | its *confirming gate* row says `npm run gate:full, not npm run gate`, and that is the sentence this item makes false | NEEDED |
| `doc/plans/p30-which-open-questions-close-by-a-fix-already-named.md` | one dated Retro line: the mechanism landed at W139. A finished plan is on nobody's `Owns` and W139 is not that plan's item, so it is declared rather than taken as record step | NEEDED |
| `scripts/check-source.mjs` | `S11`/`S13` read the manifest; `S13`'s loop is over `GATE_CHAIN`, which `gate:item` is not in, so nothing forces a `COMPOSED` row | UNNEEDED |
| `scripts/check-markdown.mjs` | `M3`/`M4` floors move with a new `.md`; this file carries no relative link | UNNEEDED |
| `.github/workflows/gate.yml`, `AGENTS.md`, `README.md`, `doc/work-items/TEMPLATE.md` | CI runs `gate:full`, which is unchanged; none of the other three names an item's confirming gate (grep at declaration) | UNNEEDED |

## What the declaration step measured before anything was edited

*On `ac84c1e`, node 24.20.0, in `dev-dist/w139-1638/`.*

| # | measured | result |
|---|---|---|
| 1 | how the runner selects lanes | **derived, not listed**: every manifest entry ending `:selftest`, sorted; exclusivity from the `SELFTEST-EXCLUSIVE:` marker in the self-test file. Overrides: `CHECK_SELFTESTS_PKG`, `_SCRIPTS`, `_CMD`. The only argument read is `--plan`; **`--plan --without x` exits 0** — every other argument is ignored silently. `--plan` names 11 entries, 1 exclusive |
| 2 | what check-wiring holds about the manifest | `G3`: each check's two entries exist and are reached from `gate:full`'s chain, one level deep. `G4`: exactly one chain entry is `node scripts/run-selftests.mjs`, verbatim; its `--plan` equals the manifest both ways, per-entry command included; the exclusive set; a passing-stub and a failing-stub run. `G5`: nine runner declarations pinned line for line. **Nothing reads any entry but `gate`, `gate:full` and the runner's** |
| 3 | `gate:full`'s composition | `npm run gate && npm run selftests`, bound by name in `check-source.mjs` `S13` (`COMPOSED`); `gate` is 17 entries bound by `S12` (`GATE_CHAIN`) |
| 4 | `check:wiring` alone | EXIT 0, 1.2 s wall |

## Record

*Built and committed 2026-10-07: `bc97922` (declaration), `3fabab0` (the mechanism), `b67db6d` (the
documents), `f0c5ae6` (the conformity reader's finding 1). Scratch `dev-dist/w139-1638/`. Every rung
below was RUN with its output redirected and `$?` read in the same command.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 | NOT RUN separately; RAN inside both gates below | no file `lint` or the typechecks read was edited (`scripts/` is not linted) |
| `check:wiring` | RAN, EXIT 0, `G1`-`G7` ok | before `gate:item` existed it was EXIT 1 on exactly `G7: package.json has no "gate:item" script` — the clause's first provocation |
| `check:wiring:selftest`, alone | RAN, EXIT 0 — 56/56 probes, 24/24 META, 6/6 SELF | its first run was EXIT 1 on one META entry: *What broke* 1 |
| `check:budget` | RAN, EXIT 0 | `doc/workflow.md` headroom 649 → 666 bytes (the replacement is shorter); `CLAUDE.md` 1933 → 1544 |
| `check:markdown`, `check:register` | RAN, EXIT 0 | after the declaration and after the document edits |
| **`npm run gate:item`, measured** | **RAN, EXIT 0, 985 s (16 m 25 s)** | against the retro's ~915 s and 41 min. `selftests` 845.8 s wall, 10/10 completed, *1 left out: check:register:selftest*. **The binding lane is now `check:wiring:selftest` at 832.5 s**, 27 s over `check:docs:selftest` (805.7 s): W139's own probes grew it from ~615 s, which is the ~70 s the estimate did not have. Run on `b67db6d`, one probe short of the final tree |
| conformity reader | RAN, fresh context, one reader | seven findings, below |
| rule 8 | RAN, two passes | below |
| **`npm run gate:full`, CONFIRMING** | **RAN, EXIT 0, 2654 s (44 m 14 s)**, zero lines beginning `FAIL` | on `f0c5ae6`, digest `0bb36524ba8dbd15` over 897 files, IDENTICAL before and after, nothing touched while it ran. `selftests` 11/11, 2515.8 s wall, `check:register:selftest` 2502.4 s the wall; `check:wiring:selftest` 57/57 probes. This item builds the mechanism, so it ran the whole gate |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the runner's `--without` | yes | `G7`'s plan, left-out and refusal runs; rule 8 r1-r4, r10-r12, s1, s4, f1 |
| (2) `gate:item` | yes | `G7: package.json has no "gate:item" script` (rule 8 m12) |
| (3) `G7`, provoked at birth | yes: 12 probes bound by `G7_NAMES`, 10 META entries, one per `fail('G7'` site | the by-name binding in `check:wiring:selftest`; rule 8 w1-w8, s2 |
| (4) `CLAUDE.md`, `doc/workflow.md`, the glossary | yes | nothing: prose, declared survivor S7 |
| (5) the measurement | yes, the row above | nothing: a number |

**Exceptions, reconciled to `git status --short` and `git diff --name-only ac84c1e`.** Nine files: the
six of `Owns`, this file, `doc/glossary.md` and the P30 plan file (its dated Retro line), the last two
declared NEEDED and used. The four UNNEEDED rows are untouched. **No late exception.**

**Rule 7 (at birth).** `G7` was RED before `gate:item` existed; every `G7` probe is checked in with its
exact declared set. Five `G4`/`G5` probes gained `G7` in their `also`, reasoned before the run from what
`G7`'s plan and stub runs read; the run agreed.

**Rule 8.** Harness `dev-dist/w139-1638/rule8.mjs`. It mutates the real tree one probe at a time and
asserts node 24. Every anchor must occur exactly once in the CURRENT text, and every edit must change
its input. All three files are restored to their FIRST snapshot, compared byte for byte, and the tree
is digested before and after each pass.

- **Pass 1:** 38 fast probes, 3 graded by `check:wiring:selftest`, and 1 second route, all as expected.
  Digest identical.
- **Pass 2**, after the reader, with its exact edits as `f1`/`f1x`/`s4`: **45/45 as expected**. CLEAN 1,
  CRASH 1 (`c1`, the CRASH grader), WRONG-REASON 1 (`c2`, the WRONG-REASON grader), CAUGHT 32, SURVIVED 7,
  REACHED 3. Digest `0bb36524ba8dbd15` identical.

Every `must` is a substring of a real failure line, and `c0` is the no-op control. **Declared
survivors, by id:**

| id | probe | why it survives | second route |
|---|---|---|---|
| S1 | `r5` | the duplicate refusal is dropped, which is benign because the set is still one lane | `r5b` REACHED |
| S2 | `r6` | the unknown-argument refusal is dropped; it is unreachable from the manifest because `G7`'s shape clause refuses it first | `r6b` REACHED |
| S3 | `r7` | the leaves-nothing refusal is dropped; it is reachable only by also editing `ITEM_LEAVES_OUT` | `r7b` REACHED |
| S4 | `r9` | no check reads the run's log line for the left-out lane | — |
| S5 | `w3` | `ITEM_LEAVES_OUT` and the manifest were moved together: two declarations in one commit, with v0.29 as their authority, and a check over `doc/` is refused | — |
| S6 | `s3` | `G7`'s stub-run count against the expected plan, masked by the plan clause and by the runner's own accounting | `s3b` CAUGHT |
| S7 | — | the documents (Output 4) | — |

`f1x` reports SURVIVED by design: it shows that the *neither run nor left out* arm is the sole observer
of `f1`.

**The conformity reader** read P30's Retro and v0.29 first, with the tree held still. Seven findings:

1. **should-fix, ACTED ON.** The runner's *neither run nor left out* arm was deletable for zero. Its
   exact edits are now a checked-in probe, *the runner drops a lane from the run and reports the
   manifest's count anyway* (`G7`+`G4`); rule 8 `f1`, `f1x` and `s4` show the arm caught.
2. **note, DECLARED.** Three refusals are run by no check: S1-S3, each with a route.
3. **should-fix, the record step.** P30's Retro section 10 still said *NOT in force*. Its dated line is
   added.
4. **note.** This Record was not yet written.
5. **note, ACTED ON.** One META label named the wrong refusal; it is renamed. Removing ONE tuple of
   `G7`'s refusal loop is caught by the PROBES pass, not by META.
6. **note.** The `probeFails` baseline is correct, and it makes `G4`'s unplanned-entry META verdict
   newly honest (4 -> 3).
7. **note, NOT acted on.**
   - `doc/workflow.md` section 8 does not name `G7`.
   - Two halves of v0.29 are enforced by no check, by the retro's design: the plan's last item runs
     `gate:full`, and the register-file carve-out.
   - `scripts/check-budget.mjs:383`'s historical comment is outside `Owns`.

**What broke.**

1. **META graded every entry against the WRONG probe's count.** The pass compared each mutant's
   failure count to one number: the control's, which is the count of `META[0]`'s `G1`+`G2` probe. Any
   other entry passed *by the failure COUNT* whenever its mutant merely differed from 2:
   `G7 stops requiring the declared lane to be left out` printed `2 -> 3` against a real 4, and
   `G7 stops reading whether the runner could plan at all` read STILL CAUGHT. The fix takes each probe's
   own count from the PROBES pass (`probeFails`), and the control must reproduce it. This defect in
   Q146's discriminator was pre-existing; `G7` exposed it as the first clause whose several fail sites
   co-fire at varied counts.
2. A `python` assertion counted an anchor 3 times, not once, because two `SELF` entries quote
   `MIN_PROBES`. It aborted before writing.
3. `gate:item` came in ~70 s over the estimate, because the lane that gained the probes became the wall.
   This is not material against 41 minutes.

**What this taught.** The item that adds probes to a lane moves that lane's wall, and a self-test's
growth now decides `gate:item`'s wall: `check:wiring:selftest` at 832 s against `check:docs:selftest`
at 806 s. And a discriminator compared against a constant is a coincidence detector.

**Questions raised.** None. Q548-Q552 are SPENT and ADR 0087 is SKIPPED, all unused.
**The next plan starts at W140, Q553 and ADR 0088.**
