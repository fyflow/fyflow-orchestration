# W142 — A settlement reaches only its own run's driver: the runtime routes each settlement by run id, and N runs on one scheduler are linear (Q244, ADR 0088)

**Status:** done — declared 2026-10-07 on `7ba87df`, the second item of P31; built, both readers and the fix round done 2026-10-07
**Plan:** P31, `doc/plans/p31-which-open-questions-close-by-a-decision-taken-now.md`

*This file carries NO relative link, deliberately* — W127's note and Q142's mechanism (`M4`). A
linking document here is one more in `check-markdown`'s second `removes` probe tree and can cross
`M4`'s floor, so `check:markdown:selftest` would exit 1 while `check:markdown` stays green. Ids and
paths are bare text.

```
Spec:       none changed. P31 decision 2 (Q244's direction, the maintainer, 2026-10-07) fixes the
            change: settlements are ROUTED to their own run's driver, not broadcast to all N.
            ID-R3 to ID-R5 (spec/task-id.md), OR-R10 (spec/outcome-record.md) and RN-R25
            (spec/run-state.md) bind it and none of their texts may move — a text that would have
            to is a stop (P31 stop-and-ask (a) and this item's brief). ADR 0022, 0023, 0027 and
            0058 are the decisions it must leave meaning what they mean
Owns:       src/scheduler/runtime.ts — the runtime's event delivery (P31's W142 row:
            src/scheduler/*.ts), and a new src/scheduler/*.ts module only if the router does not
            fit there; NOTHING re-exported from src/scheduler/index.ts (that would be surface);
            src/driver/driver.ts ONLY where routing needs it — expected: no code, at most a comment
            the routing makes false;
            the tests: test/scheduler/runtime.test.ts (a W142 suite), examples/l6.ts (the two pair
            rows gain a delivery clause; DECLARED_TOTAL by arithmetic), examples/run-flow.ts (the
            per-driver delivery observer those clauses read);
            examples/run-flow.ts's per-run scheduler listeners and `poolOfTask` on a SHARED runtime —
            the maintainer's answer (B) to the prediction-3 stop, 2026-10-07;
            examples/retention.ts (a `topology` mode: N runs through runtime.start with no per-run
            harness listener on the scheduler — the scale measurement);
            doc/decisions/0088-*.md; AGENTS.md section 12 (the topology guidance);
            and this file
Inputs:     the tree at `7ba87df`; Q244; W55's Record (the O(N²), 115 / 277 / 884 / 3304 ms at
            N = 100 / 200 / 400 / 800 shared, linear own); W122's triage row for Q244; ADR 0022,
            0023, 0027, 0058; spec/task-id.md ID-R3 to ID-R5; RN-R25; createRuntime's openRun and
            Driver's constructor subscription and onEventOrThrow
Outputs:    (1) the "before" figure, re-taken on this tree by W55's own command (retention.ts
                scale, both topologies) AND by a library-only measurement (no harness listener
                per run), wall time and heap at N = 100 / 200 / 400 / 800, with the commands
            (2) ADR 0088 — where routing lives, how a settlement's run id is read (ID-R4's tier 0
                parse, the same parseTaskId), what happens to an id that does not parse and to a
                run id no driver of the runtime holds, and every consequence for ADR 0022, 0023,
                0027, 0058 and RN-R25; `resolves: Q244`
            (3) the routing in createRuntime: each driver the runtime builds subscribes to a
                per-run view of the scheduler; the runtime subscribes to the scheduler ONCE per
                settlement event and hands each settlement to the driver holding its run id
            (4) L1-L2 tests through createRuntime's scheduler seam, expected values from ADR 0088
                and the spec: N drivers on one scheduler each receive ONLY their own run's
                settlements; the scheduler carries one listener per settlement event however many
                runs; an id that does not parse still reaches EVERY driver's onUnmintedTask
                (ADR 0027, ID-R5); another run's parseable id reaches no other driver and no
                onUnmintedTask (ADR 0023 rule 3, ADR 0027 rule 4); OUR run id on an undispatched
                task still stops the run with UndispatchedTask (ID-R4 tier 2); a finished run's
                driver still hears its own id (RN-R25)
            (5) L6: both pair rows assert what each driver was DELIVERED — its own run's
                settlements plus every id minted by no driver, and nothing of the other run's
            (6) the "after" figure by the same commands; N runs on one scheduler shown linear
                (P31 prediction 3), or the residual named and stopped on
            (7) AGENTS.md section 12's topology guidance matches ADR 0088; `check:docs` EXIT 0
            (8) Q244 resolved, `resolved-by` starting "P31 W142 —", naming ADR 0088
Depends on: W140 (P31 decision 5: serial on one tree)
Blocks:     W141
Tests:      (4) and (5). Expected values come from ADR 0088 and spec/task-id.md — a delivered set is
            {own run's settlement events} ∪ {ids parseTaskId refuses}, derived from pairTaskIds and
            the UNMINTED list, never from output
Gate:       L0-L6 (L0-L5 in Node, Deno and Chromium; L6 in Node and Deno); a measured N-run
            scaling figure before and after; rule 8 on every output; the conformity and adequacy
            readers (P31 decision 6); `npm run gate:item` EXIT 0 once, on a still tree (decision 4)
Reserves:   Q556-Q558, ADR 0088. No W beyond W142
```

**Exceptions** — declared 2026-10-07, before the first edit (`doc/workflow.md` section 7 rule 2):

| file | the edit | why |
|---|---|---|
| `examples/README.md` | the two current L6 count copies `check-docs`' `X10` compares, each with the one-clause history parenthetical every copy there carries (W142 as bare text, no link) | output (5) moves `DECLARED_TOTAL`, and `X10` is red until both copies follow. No run is added, so `DECLARED_RUNS` should not move; if it does, the same two copies carry it |
| `test/definition/l4-corpus.test.ts` | one suite name appended to `LATE_SUITES` | output (4) is a new suite in `test/scheduler/runtime.test.ts`, and the L1 census holds suite names both ways |
| `spec/README.md` | its version line — **ONLY if** a spec document is bumped | none is planned; a spec text that must move is a stop, not an exception |

## Scope

**In**

1. **Measure first** (output 1), into `dev-dist/w142-4000/`, before any edit to `src/`.
2. **Design, then ADR 0088** (output 2), committed as `adr:` before the implementation. If the design
   needs a public-surface change — what `start()` returns, what a consumer passes, a new export — STOP:
   P31 stop-and-ask (a).
3. **Implement** (output 3) and **test** (outputs 4 and 5).
4. **Measure after** (output 6) with the same commands.
5. **AGENTS.md section 12** (output 7).
6. **Rule 8 on every output**, in `dev-dist/w142-4000/`, with probes that break routing back to
   broadcast, route a settlement to the wrong driver, parse the run id with a cheaper grammar than
   tier 0's, and drop an unparseable id instead of broadcasting it.
7. Grep the tree for `W142`, `Q244` and every withdrawn sentence or figure, excluding `dev-dist/`.

**Out**

- A hand-built `Driver` on `runtime.scheduler` (P18 decision 14's road): it subscribes to the
  scheduler directly and still hears every settlement. ADR 0088 states it; changing it would change
  the `Driver`'s surface.
- Detaching a finished run from the routing: RN-R25 says a finished run's driver still hears its id,
  and this item does not move that rule.
- ~~The harness's own per-run listeners in `examples/run-flow.ts` — measured, reported, not removed.~~
  **Moved IN by the maintainer, 2026-10-07 — answer (B) to this item's prediction-3 stop.** After
  ADR 0088 routed the drivers, `retention.ts scale` (W55's command) was still super-linear (10 985 ms
  and 880 MiB at N = 800 shared), because `runFlow` files about ten listeners of its own per run on the
  scheduler and copies `scheduler.tasks` into each report. The answer: on a SHARED runtime those
  listeners hear only their own run's events and every unminted id (ADR 0088's rule, applied to the
  harness), and `poolOfTask` keeps the same set. A run on its own runtime is unchanged. `runPair`'s
  `record` stays a direct listener, because it must hear every run.
- P31's other items.

## Verification

- **L0-L5**: `npm run gate` covers them in all three runtimes; L6: `npm run test:l6`,
  `npm run test:l6:deno`. Every rung is RUN and never piped: `cmd > log 2>&1; echo "EXIT=$?"`.
- **Scale**: `node --expose-gc examples/retention.ts scale N 4 1 [own]` (W55's command) and
  `node --expose-gc examples/retention.ts topology N [own]` (library-only), N = 100 / 200 / 400 / 800,
  before and after.
- **Rule 8**: probes to the RULE — broadcast restored; a settlement routed to the wrong run; the run
  id read by `split(':')[0]` instead of `parseTaskId`; an unparseable id dropped or sent to one driver;
  the scheduler subscribed once per run; the L6 delivery clause removed and made a tautology; a no-op
  control, a CRASH grader on L6 and a WRONG-REASON grader; anchors checked against the CURRENT text and
  unique, every edit asserted to change its input, restore to the first snapshot byte for byte, a
  digest before and after.
- **Readers**: conformity (ADR 0088 and the spec first, then the code; reports, does not fix) and
  adequacy (the spec first, then the tests; mutates only in an isolated `cp -r` COPY,
  `find <copy> -type l` before any removal, the copy left in place), fresh contexts, differed briefs,
  the tree still.
- **Confirming gate**: `npm run gate:item > dev-dist/w142-4000/item.log 2>&1; echo "EXIT=$?"`, once,
  on the final tree.
- **Routing cases** (template): routing as in decisions, joins and fan-out is not changed — the
  driver's routing is untouched and only WHICH driver hears a settlement moves. `user_action` (Q17) is
  IN: its two events carry one id and are both routed to the one driver. A duplicate task id (Q13) is
  IN as ID-R4's tier 2 under routing. Routed-away (Q4), no-matching-edge (Q10) and nested fan-out (Q6)
  are not applicable.

## Record

*Filled in 2026-10-07 on `81b0ed9`, the tree the confirming gate ran on, which was held still from that gate to
this Record (`tree-before-item.txt`).* Scratch is `dev-dist/w142-4000/` (this item's shell pid). It holds every log
and script named below. Node v24.20.0 by `fnm use 24` in every shell, Deno 2.9.6. Every rung was redirected and its
EXIT read in the same command, never piped. Ids are bare text, as the header says.

### Gate

| command | EXIT | reading |
|---|---|---|
| `npm run gate:item > dev-dist/w142-4000/item.log 2>&1; echo "EXIT=$?"` | **0** | run ONCE, on `81b0ed9`, after both readers' fixes and rule 8's last pass; 0 `FAIL` lines |
| — L0 (lint, typecheck) | 0 | inside the gate |
| — L1-L5 | 0 | **1538** cases in node, deno and chromium (parity 1538), from 1528: the W142 suite's **ten**, all inside one new suite named in `LATE_SUITES` |
| — L6 | 0 | **2474** assertions over **162** real runs, in node and deno, from 2466. That is +8, derived in `l6.ts`'s comment above `DECLARED_TOTAL` before the file was re-run: two clauses per run on the two pair rows. No run moved |
| — self-tests | 0 | 10/10 lanes ok, 846.7 s wall; `check:register:selftest` left out (workflow v0.29), and this item edits none of the files that would bring it back |

L7 did not run: no person looked at a trace. Ladder L6 in the browser is Q52's and not a rung.

### Scaling — the before and after figures, the commands and the trees

Node v24.20.0, `--expose-gc`, Windows 11. Wall time and heap are properties of this machine (Q179). The EVENT
COUNT is clock-free, and it is the figure that shows the shape.

**Command 1, the library alone** — `node --expose-gc examples/retention.ts topology N 4 1 [own]`, by
`dev-dist/w142-4000/measure-topology.sh`. It runs N runs of `map-alias` (six tasks each) through `runtime.start`
and `await done`, with no harness listener on the scheduler.
- **Before** ran on `ba90b5a`'s source, with the mode added and not yet committed.
- **After** ran on `81b0ed9`, the tree the gate ran on, after the gate.

| N | shared wall ms | shared heap MiB | events handed to drivers | own wall ms | own heap MiB |
|---|---|---|---|---|---|
| 100 | 97 → 104 | 6.6 → 6.7 | 60 000 → 600 | 94 → 112 | 13.3 → 13.5 |
| 200 | 191 → 128 | 11.2 → 11.4 | 240 000 → 1 200 | 146 → 152 | 24.4 → 24.9 |
| 400 | 429 → 201 | 20.4 → 20.6 | 960 000 → 2 400 | 252 → 263 | 46.1 → 47.0 |
| 800 | 1 313 → 349 | 38.6 → 39.3 | 3 840 000 → 4 800 | 428 → 929 | 89.6 → 91.5 |
| 1600 | 7 567 → 673 | 76.1 → 78.2 | 15 360 000 → 9 600 | 963 → 957 | 182.3 → 185.9 |

**Command 2, W55's own** — `node --expose-gc examples/retention.ts scale N 4 1 [own]`, by
`dev-dist/w142-4000/before-retention.sh`. It runs each run through `runFlow` and the L6 harness. Each cell gives
three figures, separated by slashes:
1. before, on `7ba87df`;
2. after ADR 0088 alone, on `6ed7c7d`'s content;
3. after the harness fix, on `81b0ed9`.

| N | shared wall ms | shared heap MiB | own wall ms | own heap MiB |
|---|---|---|---|---|
| 100 | 204 / 190 / 131 | 20.9 / 21.0 / 10.2 | 224 / 219 / 224 | 16.3 / 16.7 / 16.7 |
| 200 | 548 / 472 / 218 | 67.7 / 67.9 / 18.5 | 358 / 381 / 366 | 30.1 / 30.6 / 30.6 |
| 400 | 1 651 / 1 523 / 413 | 236.4 / 236.7 / 34.9 | 641 / 666 / 648 | 57.1 / 58.1 / 58.2 |
| 800 | 13 652 / 10 985 / 904 | 879.2 / 880.1 / 68.0 | 1 181 / 1 087 / 1 078 | 111.3 / 113.2 / 113.5 |

**Prediction 3 is now RIGHT, and reaching it took one stop.**
- **Command 1 is linear.** The events handed to drivers go from **6N²** to **6N**, with nothing of another run's
  handed over. Heap is linear in both topologies, before and after.
- **Command 2 was still super-linear after ADR 0088** (10 985 ms and 880 MiB at N = 800).
  - The cause was the L6 harness. `runFlow` files eight listeners of its own per run on the scheduler, and it
    copies `scheduler.tasks` into each report.
  - That was the stop. The maintainer answered **(B)**, 2026-10-07: fix the harness too.
- **After (B), Command 2 is linear** in both wall and heap, on both topologies.
- **What still grows with N² is the `poolOfTask` WALK.** On a shared runtime each run visits every entry to filter
  it, which costs N x 6N cached lookups. The heap does not see it, and at N = 800 the wall barely does.

### Outputs

| | output | where | what fails without it |
|---|---|---|---|
| (1) | the "before" figure, by both commands | Scaling, above; `before-topology.log`, `before-retention.log` | — a measurement |
| (2) | ADR 0088 | `doc/decisions/0088-*.md` | `check:register` (front matter); the rule is what (3)-(5) are graded against |
| (3) | the router | `src/scheduler/runtime.ts`, `settlementRouter` and `openRun` | p-broadcast, p-wrong-driver, p-split, p-drop-unminted, p-unminted-to-one, p-subscribe-per-run, a-M22, a-M16, a-M09, a-C1, p-no-rethrow, p-no-isolate (all CAUGHT); p-forget TIMEOUT |
| (4) | the W142 suite: ten cases | `test/scheduler/runtime.test.ts`; its name in `test/definition/l4-corpus.test.ts` | each probe in (3) names the case it trips |
| (5) | L6: two per-run clauses on both pair rows (`delivered`; the harness heard only its run) | `examples/l6.ts`, `examples/run-flow.ts` (`onDelivery`, `routeHarnessListener`) | p-broadcast, p-split, p-drop-unminted (delivered); h-broadcast (CRASH, see rule 8), h-pool, h-split, h-drop-unminted (heard); l6-off (count); l6-taut |
| (6) | the "after" figure; prediction 3 | Scaling, above | — a measurement; `retention.ts topology` exits 1 on any delivery to a run's non-holder (topo rung of p-broadcast) |
| (7) | AGENTS.md section 12 | `AGENTS.md` | `check:docs` EXIT 0 (prose only; no snippet added) |
| (8) | Q244 resolved | `doc/questions/q244.md` | the record step; `check:register` R8 both ways with ADR 0088's `resolves` |

### Exceptions, reconciled to `git status --short` and `git diff --name-only 7ba87df..HEAD` to the path

**Ten paths** in `git diff --name-only 7ba87df..HEAD` before the record step, and `git status --short` was empty.
- **Owns: 8.** `src/scheduler/runtime.ts`, `test/scheduler/runtime.test.ts`, `examples/l6.ts`,
  `examples/run-flow.ts` (its routed listeners under answer (B), written into Owns before the edit),
  `examples/retention.ts`, `doc/decisions/0088-*.md`, `AGENTS.md` (section 12 only) and this file.
  `src/driver/driver.ts` was declared but **not edited**, and `src/scheduler/index.ts` was not touched, so nothing
  new is exported.
- **Exceptions: 2, both declared at the start.**
  - `examples/README.md`: the two X10 copies, 2474 / 162.
  - `test/definition/l4-corpus.test.ts`: one `LATE_SUITES` name.
  - The third row, `spec/README.md`, was not used, because no spec moved.
- **Record step: 4.** P31's plan file (its Record and status line), `doc/questions/q244.md`, ADR 0088's
  `resolves`, and `doc/questions/q245.md`. The final grep found that Q245's note *waits on Q244's topology*, which
  is now decided, so the note says so. `README.md` was not edited: it carries no copy of a figure this item moved.
- **After the gate, one comment.** The grep also found `examples/retention.ts`'s `scale` comment still saying a
  shared scheduler delivers to every driver. It was corrected, comment only. `npm run lint` re-ran EXIT 0, and the
  closing `npm run gate` below covers it.
- **Re-runs after the record step**, because it changed files the checks read: `check:register`, `check:markdown`,
  `check:budget` and `check:docs` each EXIT 0, then `npm run gate` EXIT 0 with 0 `FAIL` lines (`gate-final.log`).

### Rule 8 — three passes and two re-grades, the last two on the tree that shipped

The harness is `rule8.mjs`, adapted from W140's. It works as follows:
- an anchor must match ONCE in the CURRENT text, and the edit must change it;
- each touched file is restored to its FIRST snapshot and compared back byte for byte;
- a digest over every tracked and untracked-unignored file is taken before and after;
- node 24 is asserted;
- the set includes a no-op control `c0`, a CRASH grader `g-crash` (on L6, since W132's runner names an unloadable
  file) and a WRONG-REASON grader `g-wrong`;
- each probe declares the full SET of named failures it must trip, written as substrings of failure lines with the
  FULL L6 row key;
- a run killed by the 600 s timeout grades TIMEOUT.

```
pass 1    21 probes: 13 as declared,  8 against declaration   digest 6198dc08e7adab1a IDENTICAL
pass 1b    8 probes:  7 as declared,  1 against declaration   (p-forget: TIMEOUT, re-declared)
pass 2    30 probes: 23 as declared,  7 against declaration   digest c048cf2c5e0acf08 IDENTICAL
pass 2b    7 probes:  7 as declared,  0 against declaration   digest c048cf2c5e0acf08 IDENTICAL
```

**Every against-declaration verdict was the GRADER's, and each is named here.**

*Pass 1:*
- p-wrong-driver: the L1 runner HANGS (exit 13) before reaching the W142 suite, so the probe moved to L6.
- p-split and p-drop-unminted: W76's `onUnmintedTask` observers catch the same edit, so they were added to `only`.
- p-subscribe-per-run: a broad breakage. Any failure is accepted, and the `must` set discriminates.
- p-no-isolate: the edit was a syntax error, so it was re-written.
- h-split: the cross-row pool clause catches it too.
- h-seq-count: it was declared GREEN, and row 2's pd clauses caught it. The pair now asserts that row 1 stays silent.
- p-forget: L6 never finishes within 600 s.

*Pass 2:*
- p-split, p-drop-unminted, p-unminted-to-one and a-M09: the readers' new cases caught them too.
- p-subscribe-per-run: re-anchored after the copy-on-write fix.
- h-broadcast and h-seq-count: runPair's new wiring self-check refuses first.

**The probes that put the HARNESS listener back to hearing every run** (the maintainer's ask) are as follows.
- **h-broadcast**: CAUGHT on all four HEARD clauses in pass 1. Since the H11 fix it is a CRASH: runPair refuses
  0 of 16 routed registrations before any clause runs.
- **h-pool** and **h-split**: CAUGHT.
- **h-drop-unminted**: CAUGHT.

**Declared survivors and ceilings, by id:**
- **a-M18** and **a-M19**: a later broadcast throw swallowed, or the wrong throw made synchronous. A re-raise on a
  microtask is an uncaught error, which no L1 case can observe portably across node, deno and the browser. The
  second route is the code read.
- **a-H10**: the routed registrations dropped from runPair's count. The term matters only for a SEQUENTIAL pair, and
  h-seq / h-seq-count are that discriminating pair.
- **a-H05**: harness `resource.*` routing. No shared-runtime row asserts resource events.
- **topo-off**: the topology mode's own predicate. It is a measurement and not a rung, and p-broadcast is the route.

**CRASH- and TIMEOUT-graded, by id:**
- **g-crash**: the grader control.
- **a-H11**: runPair's wiring self-check refuses.
- **h-broadcast**: the same refusal.
- **p-forget** (TIMEOUT): nothing parseable is handed, every run waits, and L6 does not finish. p-broadcast and
  p-wrong-driver are the routes that grade.

### The readers — both fresh contexts, spec and ADR first, tree still, briefs written apart

`brief-conformity.md` and `brief-adequacy.md`. Both ran on `b09d49e` while the tree was watched for movement for
30 minutes; it did not move.

**Conformity** (12 findings: 4 should-fix, 8 notes; no blocking). It re-derived every expected value
independently, and they agree.
- (1) The l6.ts wiring comment said "ten" and "in the same synchronous call". **Fixed**: it is eight, and the
  `await checkWiring` is named.
- (2) The pair rows' attach clause and the `PairFacts` docs claimed DRIVER attachment, which since ADR 0088 no
  scheduler count can see. **Fixed**:
  - the clause is labelled for what it measures: *both runs were WIRED…*;
  - the predicate is unchanged;
  - the docs say what still sees a driver.
- (3) The `RunOptions.runtime` doc said shared listeners are scheduler-wide. **Fixed.**
- (4) ADR 0088 rule 5 credited RN-R25 with a refused resume's driver "still hearing", which RN-R23 contradicts.
  **Corrected in place**: "handed", with RN-R23's sense stated.
- (5) The ADR's "what it does not reach" named the harness after (B). **Corrected.**
- (6) A run started mid-broadcast was handed the event in flight. **Fixed**: the list is copy-on-write, and the case
  is added (a-C1).
- (7) Listener order relative to a consumer's listener. **Stated** in the ADR.
- (8) "N² times" in retention.ts should be "N times". **Fixed.**
- (9) The `poolOfTask` walk is still N x 6N. **Stated** in run-flow.ts and in this Record.
- (10) It is two parses, not one. **Corrected** in the ADR's Cost.
- (11) The before-tree's instrument was uncommitted. **Stated** in the ADR.
- (12) AGENTS.md's "measures both". **Fixed.**

**Adequacy** (43 mutations in an isolated `cp -r` copy, every rung under a 400 s timeout; `find -type l` and the
ReparsePoint scan were empty before and after; the copy is left in place). 33 killed and 10 survived: 4 should-fix,
4 notes, 1 equivalent and 1 weak only on the current fixtures. One defect was found by construction.
- **M22**: resumed drivers were not routed and nothing noticed. **Fixed** with a resume case (a-M22 CAUGHT).
- **M16**: a finished run leaving the broadcast was not noticed. **Fixed** by an unminted id after `done`
  (a-M16 CAUGHT).
- **M09**: the broadcast order was unpinned. **Fixed** with one shared log (a-M09 CAUGHT).
- **M18**, **M19**: kept as declared survivors (above).
- **H10** / **H11**: H11 is **bound** by runPair's self-check (16 routed registrations); H10 is kept as a ceiling.
- **H04** / **H05**: kept as a ceiling.
- **M11**: equivalent (`parseTaskId` throws one class).
- **C1** (the conformity reader's 6): fixed.
- **M02, M23, M25**: caught by a hang, an exit 13 or a crash rather than a named failure. **Stated** here, not acted
  on: a broken router's runs wait for ever, and the rungs have no deadline per run.

**The overlap is FOUR shared subjects, the eighty-fifth measurement:**
1. the copy-on-write broadcast (conformity 6; adequacy C1);
2. routing a resumed run (conformity's *not covered* list; adequacy M22);
3. runPair's wiring count and the attach clause (conformity 2; adequacy H10, H11, S01 and S02);
4. rule 5's finished and refused drivers (conformity 4; adequacy M16).

The briefs were written apart and named no shared obligation.

### What broke

1. **Prediction 3 was reversed by the measurement harness, not by the library.** The stop was answered (B).
   - The harness held N² ids, because `noteDone` recorded every settlement it heard and `poolOfTask` copied the
     scheduler's map.
   - W55's *super-linear in heap* had been the harness's all along.
2. **The first router isolated every listener throw onto a microtask.** W77's throwing-consumer case, over a double
   that calls listeners directly, then took the L1 process down. The first throw is now re-thrown synchronously.
3. **W76's binding reads the `new Driver` literal for bare `name,` lines**, and `scheduler: router.forRun(runId)`
   broke it. The view now shadows `scheduler` inside `openRun`. This also means the literal cannot hand a driver the
   scheduler itself.
4. **The delivery observer RETAINED every id** and inflated the shared heap it was measuring. It counts now.
5. **The delivery observer was an enumerable own property**, and the cross-row byte census caught it. It is
   non-enumerable now.
6. **The grader was wrong fifteen times over four passes** (named above). The probes were right each time.

### What this taught

- **A measurement through a harness measures the harness too.** The `topology` mode is the library alone. Q244's
  heap half was never the library's.
- **When a decision moves WHO is subscribed, every count of subscriptions changes meaning.** One L6 label said
  "drivers", and since ADR 0088 it can count only wiring.

### Questions closed and raised (workflow section 1 rule 6)

- **Closed: Q244**, `resolved-by` "P31 W142 — …", naming ADR 0088, whose `resolves` lists it.
- **Raised: none.** One stop-and-ask, prediction 3's, was answered (B) before the harness edit, and the answer is
  written into this file's Out section and Owns. Q556-Q558 are unissued.
