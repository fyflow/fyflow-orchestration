# W157 — the pin moves to `fyflow-scheduler` 0.6.0, behaviour unmoved; the exact version is written only where something resolves it

**Status:** done 2026-10-15 — **`npm run gate:item` EXIT 0** on the final tree, one command, after a first run RED on
`check:budget:selftest` (Record); declared 2026-10-15 on `3ae2738`, declaration step RUN the same day in a byte copy;
stop-and-asks (1)-(7) ANSWERED by the maintainer 2026-10-15 and recorded before their edits; both reader passes RUN;
Q174 resolved, nothing raised
**Plan:** [P33](../plans/p33-what-a-run-does-when-a-task-ends-cancelled.md) — *what does a run fold to when the
scheduler under it can end a task cancelled?* — and this is its FIRST item.

```
Spec:       spec/README.md rule 6 (REWORDED, not re-decided: a citation is at "the version we pin", which is
            named by the manifests, not by the rule); spec/outcome-record.md, spec/join-policy.md,
            spec/flow-definition.md, spec/task-id.md — each UNDATED line citation into the scheduler's source
            RE-TAKEN at the pinned version, each dated one left as the record it is. No rule moves; no FD-V,
            OR-R, ID-R or RT-R id moves.
Owns:       from P33's index row: package.json, package-lock.json, deno.json, deno.lock,
            examples/deno-import-map.json, scripts/check-scheduler*.mjs, scripts/check-source-selftest.mjs,
            scripts/pack-smoke.mjs, doc/concept.md, doc/scheduler-upstream.md, README.md, examples/README.md,
            spec/README.md, the 0.5.2 claims in spec/*.md, AGENTS.md section 12, src/scheduler/runtime.ts
            (comments only). And by the Exceptions below (2026-10-15): AGENTS.md section 11 (E1), AGENTS.md
            section 18's shutdown sentence (E5), examples/run-flow.ts :1157 (E2), CLAUDE.md (E3).
Inputs:     P33 facts 1-9, decisions 1 and 7, scope 1 and 4, P32-retro sentences B and C, predictions 1-2;
            W36's and W37's files; fyflow-scheduler 0.6.0 from npm (dist/, AGENTS.md) and from JSR (source,
            manifest), and 0.5.2 from both, read into scratch; fyflow-app's request #16.
Outputs:    (1) both pins at 0.6.0 — devDependencies and peerDependencies exact, deno.json and the import map
                `jsr:@fyflow/scheduler@0.6.0`, package-lock.json by `npm install`, deno.lock written ONCE by
                `--min-dep-age=0` (method below), holding ONE JSR entry.
            (2) `test:l6:deno` shown to resolve 0.6.0 THROUGH THE LOCK without the flag, with a control that
                refuses it without the lock.
            (3) D7 REWRITTEN (stop-and-ask (4)): the pin's number is written ONLY where something resolves or
                binds it. The five pin sentences D7 bound are reworded to name the pin without its number, and
                D7 refuses the current pin's number anywhere else in the scanned tree on a line that speaks of
                the scheduler or the pin. Its self-test proves the new rule can fail (probes + META).
            (4) every UNDATED prose statement of the pin reworded without the number; every undated line
                citation into the scheduler's source re-taken at 0.6.0; every DATED record kept (census below).
            (5) doc/concept.md sections 2-3 re-verified at 0.6.0 and their citations re-taken; section 7's pin
                sentence reworded; S2 and S6 brought to what 0.6.0 shipped; Q3's answer.
            (6) runtime compatibility: NO deno.json key (stop-and-ask (1)); the intended values and one Node 26
                L6 run recorded in AGENTS.md section 11.
            (7) self-test and source-selftest literals derived, not hard-coded.
            (8) `D9` — added after the readers (the adequacy reader's A3): `deno.lock`'s `@fyflow/scheduler@<v>`
                keys and `package-lock.json`'s installed entry held to `PIN`, every stale or dead lock entry
                refused (Q174's shape), with a probe and a META entry per clause.
Depends on: nothing
Blocks:     W158, W159, W160
Tests:      the whole ladder at 0.6.0 (`npm run gate`): L1-L5 UNMOVED (prediction 1), L6 in node 24 and deno —
            every row green, any moved row measured and reported (prediction 2). check:scheduler's self-test
            red on a one-registry pin (its existing D3/D8 probes) and on the new D7 rule (new probes, META).
Gate:       `npm run gate` before the readers (P32-retro C); then the conformity and adequacy readers, NOT run by
            this item's author; then `npm run gate:item` ONCE on the final tree. Both L6 lanes green against
            0.6.0, `test:l6:deno` shown to resolve 0.6.0, and one L6 run on Node 26 recorded (scope 4).
Reserves:   Q600-Q604, and NO ADR
```

*Reserves: `npm run state` on `3ae2738` reads the next free ids as **W157, Q600, ADR 0094**, from the tree and from
the ledger, which AGREE. P33 reserves Q600-Q614 and ADR 0094-0095; ADR 0094 is W158's by the plan, so this item
takes **Q600-Q604** and no ADR. A pin move writes no rule (W36's and W37's precedent).*

## Scope

**In** — Outputs (1)-(7).

**Out** — named rather than left implicit, with where it goes instead

- **`cancelled` as a state, an outcome or a refusal** — W158 (ADR 0094). After this item a cancelled task is still
  dropped by the listener (P33 fact 1); nothing in the gate cancels, so no lane sees it.
- **`AGENTS.md` section 11's `cancellation` and `durability` rows** — W158's (P33 scope 4, W158's row). The
  cancellation row is false at 0.6.0 from this item until W158; this item adds a paragraph to section 11 (E1) and
  edits no row.
- **`cancelGraceMs`, `messages`, `context.signal`, `context.emit`** — W159.
- **`src/driver/listener.ts:5`** (an undated citation, `:857, 907, 909, 1139, 1141`) — W158 re-takes it (answer to
  ask (2)); **`examples/l6.ts:6947`** — W160 re-takes it. **And two more undated citations of `:894-897`, both in
  W158's `Owns`**: `test/matrix/run.ts:168` (a failure-message string — the conformity reader's F7) and
  `test/driver/driver.test.ts:630` (a comment, found by the author re-grepping after F7).
- **`AGENTS.md:1024` (section 7)** — *"the scheduler's own reference does not document it for the ordinary path"* is
  false at 0.6.0, whose §6 per-task order reads *"`task.failed` (plus `task.user_action`)"*. W158 owns `AGENTS.md`
  sections 6, 8 and 11 and edits section 7's neighbour; it is W158's (the conformity reader's F4).
- **`spec/task-id.md` section 2's mechanism** (`:444-445`, `:1421`, `:1514`, `:1533`, `:723-727`, `:819`, `:94`) — it
  is DATED (*"Read in the source at **0.5.2**"*, :202) and stays the record it is; whether the overwrite still
  reads the same at 0.6.0 is not re-measured here, and ID-R1 refuses a reused id whatever the scheduler does.
- **The ADRs' citations** (0004, 0007, 0013, 0023, 0029, 0048, 0049, 0051, 0055) — dated decisions, records.
- **`fyflow-react-components`' pin** — P33 Out.
- **jsr.io's runtime-compatibility setting** — the maintainer's own action, outside the repository (answer (1)).

## What the declaration step measured before anything was edited

*P15 decision 5 and P32-retro B: measured 2026-10-15 in a BYTE COPY of `3ae2738` (`git archive` into `C:/tmp-w157/m`,
`node_modules` copied, **zero links** by `find -type l` and by PowerShell's `ReparsePoint` scan), node 24.20.0 and
deno 2.9.6. The JSR sources of 0.5.2 and 0.6.0 were fetched into `C:/tmp-w157/jsr`, never into `node_modules`.*

| # | fact | measured |
|---|---|---|
| M1 | 0.6.0 on both registries | npm `time` 2026-10-14T13:21:11Z, `latest`; JSR the same version. **Pinned here 2026-10-15**, inside Deno's 24-hour window, by the lock (M4) |
| M2 | npm install | `npm install` with both entries at `0.6.0`: **EXIT 0**, zero links; npm applies no age gate |
| M3 | Deno refuses without the flag | `deno check index.ts src/` → *newer than the specified minimum dependency date* (2026-10-14T22:42Z) — P33 fact 8 reproduced |
| M4 | the lock, ONCE | `deno check --min-dep-age=0 index.ts src/` → EXIT 0; `deno.lock` holds ONE JSR entry, `@fyflow/scheduler@0.6.0` integrity `562ba42249ad8a66eebbdcac32e3e5eef527e64a5e06a6a9e4eeb66f61c8654b`, the 0.5.2 entry gone, `packageJson` reading `npm:fyflow-scheduler@0.6.0` |
| M5 | `test:l6:deno` through the lock | **EXIT 0, no flag**; `deno info --import-map=examples/deno-import-map.json examples/l6.ts` resolves `jsr.io/@fyflow/scheduler/0.6.0/core/…`. **Control**: the same command with `--no-lock` → EXIT 1, the minimum-age refusal. The L6 banner is NOT evidence — it reads the import map, not what loaded |
| M6 | the ladder lanes at 0.6.0 | `lint`, `typecheck` EXIT 0; L1-L5 **58 files / 1635 cases** in node, deno and chromium — **UNMOVED** (prediction 1); L6 **2602 assertions / 168 real runs, 0 failed** in 4 node runs and 3 deno runs — **no row moved** (prediction 2 NOT observed in 7 runs; Q599's rows did not flake) |
| M7 | Node 26 | `fnm exec --using=26 node examples/l6.ts` on node 26.11.1: EXIT 0, 2602 / 168 — in the copy; re-run on the real tree after the bump (Record) |
| M8 | `runtimeCompat` | **no `deno.json` form**: Deno's config schema has no such key; JSR's package-configuration page lists name, version, exports, include/exclude; JSR's API carries `runtimeCompat` per PACKAGE (`@fyflow/scheduler` `{"deno":true}`, `@fyflow/orchestration` `{}`), set on jsr.io. In `deno.json` it is accepted by `deno publish --dry-run` (EXIT 0) and read by nothing |
| M9 | the source diff | JSR manifests: **11 of 18 files differ or are new** (`taskQueue.ts`, `messageChannel.ts` new); **`core/FyflowScheduler.ts` is NOT byte-identical** — 1850 → 2373 lines, 667 changed lines. Every undated citation into it moved |
| M10 | `SpawnTaskConfig.parents` | declared at `core/workerInterface.ts:107` (was `:50`), read nowhere in the 0.6.0 source; the spawn path builds the child at `core/FyflowScheduler.ts:1930-1935` (was `:1468-1473`) from the same six fields |
| M11 | the `user_action` pair | unchanged on both paths: state set, then `task.failed` and `task.user_action` with one object — ordinary `:1151-1167` (was `:894-910`), orphaned `:1545-1557` (was `:1130-1142`). 0.6.0's `AGENTS.md` §6 now records the pair on the ordinary path (*"`task.failed` (plus `task.user_action`)"*) while its §5 still says *"`task.failed` fires once per failed task"* |
| M12 | S10 | `onStart`/`onFinish` still optional in `ResourceGroup` (`groups/resourceGroup.ts:114,117` — *(this cell said `core/workerInterface.ts`; W157's conformity reader, F1)*) and still called unguarded (`core/FyflowScheduler.ts:894`, `:976`) |
| M13 | S2, S6 | `scheduler.cancel(id, { reason, graceMs })` shipped — a waiting task (queued, blocked, in backoff) is removed and never runs, a running one is signalled and ends `cancelled`; **no pause** in 0.6.0's reference or source |
| M14 | `shutdown()` and a retry in backoff | scratch probes, one inline pool, an optional task failing once with a retry. (a) `backoffMs: 300`, a second 100 ms task, `shutdown()` 60 ms in: **0.6.0** — the retry did not run (`task.running` for it ONCE); **0.5.2** — it RAN at once, backoff ignored. (b) the conformity reader's arrangement (F2), re-run by the author: `backoffMs: 100` beside a 500 ms running task, `shutdown()` 40 ms in — **0.6.0 ran the retry INSIDE the drain** (`task.running` twice). 0.6.0's `shutdown()` source (`core/FyflowScheduler.ts:2243` ff) says so: the drain dispatches, and only a backoff still pending when it ends is discarded. So `AGENTS.md` section 18's sentence is CONDITIONAL — a retry runs if its backoff ends inside the drain. *(This row first concluded *"TRUE at 0.6.0 by contract"* from (a) alone, and section 18 was written from it — F2.)* |
| M15 | `task.progress` | the detail is the task spread flat plus the same six fields (`:1884-1893`) — the 0.3.0 shape this library reads is unmoved |

## The census — every `0.5.2` outside `doc/work-items`, `doc/plans`, `doc/decisions` and `doc/questions`

*`git grep -n "0\.5\.2"` on `3ae2738`, `dev-dist/` excluded. The four record directories are dated by construction
and are not classified line by line.*

**RESOLVING — the number stays, moved to 0.6.0:** `package.json` (dev, peer), `package-lock.json`, `deno.json:11`,
`deno.lock`, `examples/deno-import-map.json:4`, `scripts/check-scheduler.mjs:58` (`PIN`).

**UNDATED — a statement of the current pin, reworded WITHOUT the number (13):**

| # | site | statement |
|---|---|---|
| U1 | `AGENTS.md:2128` (§12) | *Pin the scheduler at 0.5.2.* — D7's site |
| U2 | `CLAUDE.md:213` | *Grounded in its `AGENTS.md` at **0.5.2*** (E3) |
| U3 | `CLAUDE.md:303` | *(`fyflow-scheduler@0.5.2` from npm; Deno reaches `jsr:@fyflow/scheduler@0.5.2`)* (E3) |
| U4 | `README.md:36` | *pinned to **0.5.2** and installed from npm* — D7's site |
| U5 | `doc/concept.md:78` | *both carry **0.5.2** now* |
| U6 | `doc/concept.md:228` | *We pin **0.5.2** (Q3)* — D7's site |
| U7 | `doc/scheduler-upstream.md:9` | *Pinned to `fyflow-scheduler` **0.5.2*** |
| U8 | `examples/README.md:82` | the import-map row, *to `jsr:@fyflow/scheduler@0.5.2`* |
| U9 | `examples/README.md:91-92` | *Node installs `fyflow-scheduler@0.5.2` … `jsr:@fyflow/scheduler@0.5.2`* — D7's site |
| U10 | `examples/deno-import-map.json:2` | the `_note`'s *Both registries carry 0.5.2 as of 2026-09-08* |
| U11 | `scripts/check-scheduler.mjs:12-13` | the two-road diagram |
| U12 | `scripts/check-source-selftest.mjs:680-681, 701, 740` | four `"0.5.2"` anchors in probe mutations → derived from `package.json` |
| U13 | `spec/README.md:100` | rule 6, *at **0.5.2**, the version we pin* — D7's site |

**UNDATED LINE CITATIONS — re-taken at 0.6.0 (no version written; rule 6 says a citation is at the pin):**
`spec/flow-definition.md:510` (`:894-897`, `:1130-1133`); `spec/join-policy.md:281` (`:894-897`);
`spec/outcome-record.md:112` (`:857, 907, 909, 1139, 1141`), `:122` (`:889`), `:147` (`:894-910`, `:1130-1142` — the
sentence is dated *At 0.5.2*; re-measured unchanged, M11), `:484` (`:212`); `spec/task-id.md:190` (`:869-886`), `:353`
(`:1605`); `doc/concept.md:57` (`workerInterface.ts:50`, `:1468-1473`); `CLAUDE.md:62-63`, `:241` (E3);
`examples/run-flow.ts:1157` (E2). Left to their owners: `src/driver/listener.ts:5` (W158), `examples/l6.ts:6947`
(W160), `test/matrix/run.ts:168` and `test/driver/driver.test.ts:630` (W158). Already dated *at 0.3.0* and left:
`src/driver/ids.ts:12`, `test/matrix/flows.ts:15`, `test/matrix/run.ts:20`, `test/matrix/scenarios.ts:10`. *(This
sentence called all of `test/matrix/{flows,run,scenarios}.ts` dated; `run.ts:168` is not — the conformity reader's
F7.)*

**DATED — a measurement or history; the version is part of the claim and STAYS:** `AGENTS.md:1982, 2121` (§12);
`CLAUDE.md:188, 220`; `doc/README.md:58`; `doc/concept.md:51, 57` (the third re-verification — compressed to *"at every pin since 0.2.1"*, see choice 6), `:231` (REMOVED, choice 6);
`doc/scheduler-upstream.md:11, 13, 34, 58, 327, 330, 334, 340, 430, 477`; `examples/README.md:93`;
`examples/l6.ts:359, 4124`; `scripts/check-scheduler-selftest.mjs:258, 1108, 1115`; `scripts/check-scheduler.mjs:377,
400`; `scripts/pack-smoke.mjs:224` (W152's measurement — reworded only to name its date: *measured at W152*);
`spec/README.md:25`; `spec/flow-definition.md:402, 542, 546, 771, 1675, 1710`; `spec/join-policy.md:127, 275`;
`spec/outcome-record.md:10, 12, 62, 146, 212`; `spec/runtime-targets.md:15, 51, 56, 57, 77, 255`; `spec/task-id.md:61,
202`; `src/definition/registry.ts:359`, `types.ts:207`, `validate.ts:84, 96`; `src/scheduler/envelope-worker.ts:245`;
`src/scheduler/runtime.ts:24, 133, 134` (M12: unchanged at 0.6.0 — the comment gains that, without the number);
`test/driver/node-type.test.ts:413`; `test/scheduler/transform.test.ts:461`.

**And `AGENTS.md` §12's *"byte-identical between 0.3.0, 0.5.1 and 0.5.2"*** (:2131) stays as dated history; the
paragraph's undated conclusion *"so every one of those still holds"* is re-measured (M11, M15) and says so.

**Which of these the plan's `Owns` covers.** Every site above is in `Owns` or an exception, except the three left
to W158 and W160 by answer (2). The consolidation (answer (4)) reaches no file beyond them: **it is small**, measured
by this census, so it proceeds rather than returning as a stop-and-ask.

## Stop-and-asks — raised at the declaration step, ANSWERED 2026-10-15

| | the question | measured | recommended | the answer |
|---|---|---|---|---|
| **(1)** | P33 scope 4 says *`runtimeCompat` in `deno.json`*, and there is no such field | M8 | no `deno.json` key; the maintainer sets jsr.io's package setting; this item records the intended values (deno, node, browser qualified by Q52) and the Node 26 run in `AGENTS.md` §11 | **as recommended** (the orchestrator proceeding on the recommended branch, reversible) — and the Node 26 L6 re-run once on the REAL tree after the bump |
| **(2)** | three undated citations sit outside `Owns`: `listener.ts:5`, `l6.ts:6947`, `run-flow.ts:1157` | M9 | W158 and W160 take theirs; one-line exception for `run-flow.ts` | **as recommended** — E2 |
| **(3)** | `CLAUDE.md` names the pin and two citations that go stale, outside `Owns` | M10, M11 | YES, those edits only | **YES** — E3, and *without restating the exact pin in prose* |
| **(4)** | the dated lines elsewhere | the census | leave them | **the maintainer's direction**: *reduce the places where we quote the exact scheduler version* — the number stays only where something resolves or binds it; every undated statement is reworded without it; D7 binds that the number appears ONLY in the resolving sites; self-test literals derive; dated records keep their version. Stop again if not small — measured small, above |
| **(5)** | after the readers (F3): with the heading reworded to *"at the pinned version"*, `CLAUDE.md`'s bullets *"Five states"* and *"A queued task cannot be cancelled"* read as current, and both are false at 0.6.0 | M13; P33 fact 2 | fix both under E3, no pin number | **YES** (2026-10-15) — those two bullets, the other facts kept accurate where touched, nothing beyond |
| **(6)** | after the readers: `scripts/check-docs.mjs:1162`'s comment says `D7` holds the scheduler's pin to *"two sentences"*, false since W37 (five) and since this item (none) | the rewrite | fix as a new exception | **YES** (2026-10-15) — E6 |
| **(7)** | after the first `gate:item` (RED): `check-budget-selftest.mjs`'s B7 probe reads the REAL sizes and isolated `B7` only while `doc/concept.md` was over 16 KiB; this item's cut to 16279 bytes made it co-fire `B5` | the run | rewrite that one probe on declared sizes, still `[B7]` alone; and resolve Q174 by `D9` | **YES to both** (2026-10-15) — E7, and Q174 resolved at the record step |

## Exceptions — the maintainer's answers, recorded BEFORE the edit

*`doc/workflow.md` section 1 rule 6 and section 7 rule 2.*

| | file | the edit, and nothing else |
|---|---|---|
| **E1** (1) | `AGENTS.md` section 11 | one paragraph after the table: the runtime compatibility this package intends (Deno, Node, the browser qualified by [Q52](../questions/q52.md)), that it is a jsr.io setting rather than a manifest field, and the one Node 26 L6 run. No row edited (W158's) |
| **E2** (2) | `examples/run-flow.ts:1157` | the citation `:894-897` re-taken at the pin |
| **E3** (3) | `CLAUDE.md` | U2, U3, the citations at :62-63 and :241, :242's *"byte-identical through 0.5.2"* made dated, and the *"does not document this for the ordinary path"* clause corrected to M11 — no pin number in prose |
| **E5** | `AGENTS.md` section 18, :3268-3270 | the `shutdown()` sentence P33 fact 7 names and places in §12; it is in §18. Re-measured (M14) and dated by its measurement, no number. *Declared here on the plan's naming of the sentence; a reader who reads it as outside `Owns` should say so* |
| **E3+** (5) | `CLAUDE.md:253-258` | the two scheduler-fact bullets: six states with `cancelled`, and the queued-cancel bullet made true at the pin — no number |
| **E6** (6) | `scripts/check-docs.mjs:1160-1162` | the comment's clause about `D7`, and nothing else |
| **E7** (7) | `scripts/check-budget-selftest.mjs`, the probe *"one KiB moved from CLAUDE.md`s target to doc/concept.md`s"* | `sizes: 'real'` replaced by DECLARED sizes under every ceiling, no member meeting a moved target with its ceiling above it — the probe's expected set `[B7]` unchanged |

*E4 is not used: answer (4) widens nothing beyond the files above.*

## Choices made inside the declaration and not named by P33

1. **D7's scanned set and its limit.** Scanned: every `.md`, `.ts`, `.mjs`, `.js`, `.json` and `.html` file at the
   root and under the six top-level directories this repository writes (`doc/`, `spec/`, `src/`, `test/`,
   `examples/`, `scripts/`), less the RECORDS (`doc/work-items/`, `doc/plans/`, `doc/decisions/`, `doc/questions/`,
   and `doc/scheduler-upstream.md`, a register whose rows date what upstream shipped) and the RESOLVING sites
   (`package.json`, `package-lock.json`, `deno.json`, `deno.lock`, the import map, and `check-scheduler.mjs`'s
   `const PIN` line). *(First written as everything-less-a-skip-list naming `dev-dist`; `check-wiring` `G6` refused
   the quoted scratch name in a file outside its `SHARED_SCRATCH` list, which lives in `check-wiring.mjs`, outside
   `Owns`. A declared list of top-level directories names neither the scratch directory nor `node_modules`. Its
   hole: a NEW top-level directory is unscanned until added.)* Refused: the current pin's number as a whole version token on a line
   that also says *scheduler*, *pin*, `jsr:` or `npm:`. **The line filter exists because this package's OWN
   history names `0.6.0`** (`AGENTS.md:3568`, `spec/flow-definition.md:350`, `scripts/check-docs-selftest.mjs:278`),
   and a bare-number rule refuses all three. **Its hole, stated**: the pin's number on a line naming neither the
   scheduler nor the pin passes.
2. **The consequence for every later item**: a living document cannot write the CURRENT pin's number, even dated
   (*"measured at 0.6.0"*) — it dates a measurement by the item that took it (*"measured by W157"*), whose file
   carries the version. When the pin moves on, older numbers become writable again, because they are history.
   W158-W160 inherit this.
3. **Spec documents take a version for the re-take alone** (W36's and W37's precedent): `flow-definition.md`,
   `join-policy.md`, `outcome-record.md`, `task-id.md`, and `spec/README.md`'s version column (`C8`).
4. **The lock is written by `deno check --min-dep-age=0 index.ts src/`** — through `deno.json`, which is the
   resolution `typecheck:deno` uses; `test:l6:deno`'s import-map road is then shown to read the same lock entry (M5).
5. **`check-source-selftest.mjs`'s anchors derive from `package.json`'s `peerDependencies`**, as the maintainer
   directs — read from the manifest TEXT each probe is handed, not from a path beside the script: the first form,
   `new URL('../package.json', import.meta.url)` at load, left all ten of that file's `SELF` children dead before
   running (*"a broken file, not a fired floor"*, `0/10 bounded`), because the `SELF` pass runs a copy from
   elsewhere. Run alone after the fix: 65/65 probes, 10/10 bounded, EXIT 0. `check-scheduler-selftest.mjs` keeps its version-agnostic regexes (it has no literal), and its
   new D7 probes take the number from `check-scheduler.mjs`'s `PIN` — a different file from the one they mutate.
6. **`doc/concept.md` is in `check:budget`'s always-read set, with a 17408-byte ceiling that only moves down**, and
   this item's first edit put it 2253 bytes over (`B2`, `B3` red on the first gate run). It was cut, not the ceiling
   raised: the re-verification sentences compressed, and THREE parentheticals removed whose subject this item
   deleted — section 3's W36 corrections (it dated the pin *"the pin is 0.5.1"* and the registries' versions) and
   section 7's two corrections of the pin sentence's publish and adoption dates, which that sentence no longer
   states. The history is in `git` and in W36's and W37's files. 17124 → 16242 bytes.
7. **`D7` also refuses the five RETIRED pin sentences at ANY version** — beyond the maintainer's literal rule,
   which sees only the CURRENT pin's number: after the next bump a reinstated *"Pin the scheduler at"* an old
   number is W37's measured state (the gate green with eleven documents naming the old pin), and the number rule
   cannot see it.
8. **The self-test's counts, as first shipped to the readers**: probes 41 → 41 (six five-sentence probes out, six new in: the number into
   `README.md`, `spec/README.md`, `doc/concept.md`, `CLAUDE.md` as a `jsr:` specifier, a `.ts` comment, and a
   retired sentence into `AGENTS.md`); META 36 → 40 (two out; in: the number clause, the retired clause, the line
   filter, the `.ts` extension, `spec/` dropped from `SCAN_DIRS`, the record skip widened to `doc/`); `MIN_META`
   36 → 40. `D7`'s vacuity floor (`scanned < 100`) has no probe and no META entry (stated in the self-test).
   **After the adequacy reader (A1-A3): probes 56, META 57, `MIN_PROBES` 56, `MIN_META` 57** — a number probe into
   `examples/`, `test/`, this check's own file (`scripts/`, `.mjs`, and the `PIN`-line exemption) and a root
   `.json`, one into the import map's `_note`, one per remaining retired sentence, and six `D9` probes; META
   entries narrowing `SCAN_DIRS` (test, examples, scripts), `EXTENSIONS` (`.mjs`, `.json`), widening the own-file
   exemption, dropping the `_note` scan, deleting each retired pattern, and disabling each `D9` clause. Run on
   the author's tree: 56/56 caught, 57/57 graded, EXIT 0. **Still ungraded, stated**: the vacuity floor's
   removal, a file ADDED to the resolving or record lists that no probe targets, and the `.js`/`.html` kinds.
10. **`D7`'s line filter dropped `jsr:` and `npm:`** (the adequacy reader's A1 found them ungraded): every
   specifier of this package carries the word *scheduler*, so they admitted no line the word does not.
11. **What `D7` reads in the RESOLVING files, and what it leaves unbound.** The files are skipped whole except
   their free-text `NOTES` — the import map's `_note` and `package.json`'s `description` — which are read as prose
   (A2: the `_note` restated the number until this item). **`doc/scheduler-upstream.md`'s header sentence is
   UNBOUND**: the register is a RECORD, skipped whole, because every version in it is a release date. **Further
   holes, stated in the check** (A4-A6): a number WRAPPED onto the line after *"pinned to"*, a shortened number
   (`0.6`, `0.6.x`), a retired sentence reworded, and `.github/` (unwalked, `.yml`). The self-test's `PIN_NOW` is
   read from `check-scheduler.mjs` at load (A7, stated beside it).
9. **The `GROUP_MEMBERS` `why` strings in `src/scheduler/runtime.ts` are not edited**: they are data a refusal
   message carries, not comments, and the plan's `Owns` is *comments only*. They say *measured on 0.5.2*, which
   stays true and dated; a comment above them records M12.

## Verification

`npm run gate` (each rung's exit read on its own line), then the readers, then `npm run gate:item` once. Routing
coverage: not applicable — no routing code moves; the user_action pair (Q17) is re-read in the source (M11) and run
by every existing L6 user_action row at 0.6.0.

## Record

**Gate — what ran.** Baseline `3ae2738`; every number below is the final tree's, re-taken by the confirming gate.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, pass** | `deno lint`, the five `typecheck` lanes (`typecheck:deno` resolving 0.6.0 through the lock) |
| the checks | **RAN, pass** | `check:scheduler` **D1-D9** (D9 new), `check:spec` 7 documents / 75 examples / 133 rules, `check:budget` 77,628 bytes (concept.md 16,279), and the rest of the ladder's twelve |
| L1-L5 | **RAN, pass — UNMOVED** | **58 files / 1635 cases** in node 24.20.0, deno 2.9.6 and chromium; firefox and webkit NOT RUN (`test:browser:all` is not on the gate) |
| L6 node 24 | **RAN, pass — UNMOVED** | **2602 assertions / 168 real runs on fyflow-scheduler 0.6.0**, 0 failed |
| L6 deno | **RAN, pass — UNMOVED** | **2602 / 168**, deno 2.9.6, the scheduler resolved through `deno.lock` with no flag |
| `test:l6:deno` reaches 0.6.0 through the lock | **RAN** | on the real tree: `deno info --import-map=…` resolves `jsr.io/@fyflow/scheduler/0.6.0/`; `--frozen` EXIT 0; the control `--no-lock` EXIT 1 with Deno's minimum-age refusal. Lock written ONCE by `deno check --min-dep-age=0 index.ts src/` (M4) |
| L6 on Node 26 | **RAN, recorded, not gated** | real tree after the bump: node 26.11.1, `node examples/l6.ts` EXIT 0, 2602 / 168, 0 failed |
| `check-scheduler`'s self-test | **RAN, pass** | **56/56 probes caught, 57/57 META graded** (53 by the named probe, 3 by the failure count, 1 masked by a declared sibling). A one-registry pin is red: `D3` (import map off by one) and `D8` (`deno.json` off by one) each by their own probe |
| `gate:item`, first run | **RAN, RED** | the ladder green and eight self-test lanes green; **`check:budget:selftest` RED on one probe** — *"one KiB moved from CLAUDE.md`s target to doc/concept.md`s"*, wanted `[B7]`, got `[B5,B7]`. The probe read REAL sizes and isolated `B7` only while `doc/concept.md` was over 16 KiB; choice 6 cut it to 16,279 bytes, so the moved 16 KiB target was MET with its 17 KiB ceiling above it and `B5` fired. Stop-and-ask (7), answered YES: E7 rewrote the probe on declared sizes |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still: the ladder, then the self-tests less `check:register:selftest` — **10/10 lanes completed, 10 ok**, 868.7 s wall. `gate:full` NOT RUN and not owed: workflow v0.29 names `scripts/check-register*.mjs`, `scripts/state.mjs` and `doc/questions/README.md`, none of which this item edits |
| conformity reader | **RAN** | **9 findings (F1-F9)**, all acted on (below) |
| adequacy reader | **RAN** | **7 findings (A1-A7)**, all acted on (below); it could not run the install probe that makes a junction and ran the rest singly — the author's self-test run above includes it, and `node_modules` held zero links after |
| overlap | | **1 shared subject**: `doc/scheduler-upstream.md`'s header sentence (F5: false; A2: unbound) |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| F1 | `onStart?`/`onFinish?` are at `groups/resourceGroup.ts:114,117`, not `core/workerInterface.ts` | `runtime.ts:132` and M12 corrected |
| F2 | §18's *"never runs — by contract"* is false: a backoff that ends inside the drain dispatches | reproduced by the author (A ran twice); §18 made CONDITIONAL, M14 rewritten with both arrangements |
| F3 | `CLAUDE.md`'s *"Five states"* and *"A queued task cannot be cancelled"* read as current | stop-and-ask (5), YES: both fixed (E3+) |
| F4 | `AGENTS.md:1024` (§7) still says the reference does not document the pair | handed to W158 in Out |
| F5 | the register's header said the number is not repeated, then repeated it | reworded: the register never states the CURRENT pin; its numbers are releases |
| F6 | consumers were pointed at `npm run state` | `README.md` and `AGENTS.md` §12 point at `peerDependencies` and `npm ls fyflow-scheduler` |
| F7 | `test/matrix/run.ts:168` is undated, and the census called it dated | census corrected; it and `test/driver/driver.test.ts:630` (found re-grepping) handed to W158 |
| F8 | `worker.message` listed as a scheduler event | concept.md says it is the POOL's |
| F9 | *"re-read and is unchanged"* — the retry block's code changed; `:1107-1142` ends one short | the four version paragraphs say the CLAIM holds; `:1107-1143` |
| A1 | `D7`'s coverage only partly graded | 15 probes and 17 META entries added (choice 8); `jsr:`/`npm:` dropped from the line filter (choice 10); the ungraded remainder stated |
| A2 | the import map's `_note` and the register header were unbound | `D7` reads the RESOLVING files' `NOTES` as prose, with a probe and an entry; the register header stated UNBOUND (choice 11) |
| A3 | nothing bound the lock files to the pin | **`D9`**, five clauses, a probe and an entry each (Output 8) |
| A4-A7 | wrap, shortened number, exact spelling, `.github/`, `PIN_NOW` | stated in the check and here |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) both pins at 0.6.0, the lock written once | `package.json`, `deno.json`, the import map, both locks | `D2`, `D3`, `D8`, `D9` |
| (2) `test:l6:deno` through the lock | measured above | `typecheck:deno` and `test:l6:deno`, refused by Deno's minimum age until 2026-10-15T13:21Z |
| (3) `D7` rewritten | `scripts/check-scheduler.mjs` | its probes and META entries |
| (4) undated statements reworded, citations re-taken | 13 sites, the census | `D7` (the number and the retired sentences); the citations are bound by nothing but the readers |
| (5) concept 2-3, S2, S6, Q3 | the documents | — |
| (6) runtime compatibility, Node 26 | `AGENTS.md` section 11 | — |
| (7) literals derived | the two self-tests | the self-tests' own anchors |
| (8) `D9` | `scripts/check-scheduler.mjs` | its six probes and five entries |

**`git diff --name-only` against `Owns` and the exceptions**, on the final tree: 26 modified files, plus this file. All of
them are in the plan row's `Owns`, in E1, E2, E3/E3+, E5, E6 or E7, or in the record step (`doc/questions/q3.md`,
`doc/questions/q174.md`). Nothing is undeclared.

**What broke.**

1. **`D7`'s first form named the shared scratch directory** and `check-wiring` `G6` refused it; the walk became a
   declared list of top-level directories (choice 1).
2. **`doc/concept.md` went 2253 bytes over its ceiling** on the first gate (`B2`, `B3`); cut, not raised (choice 6).
3. **The cut then broke a sibling self-test's fixture** — `check:budget:selftest`'s `B7` probe depended on concept.md's
   REAL size staying over 16 KiB — and the first `gate:item` was RED for it (E7).
4. **The source self-test's first derivation killed all ten of its `SELF` children** — it read `package.json` beside the
   script, and the `SELF` pass runs a copy from elsewhere (choice 5).
5. **M14 generalised from one arrangement** and section 18 was written from it as *"by contract"*; the conformity reader
   built the other arrangement and the author reproduced it (F2) — `doc/workflow.md` section 1 rule 5's *write*
   clause, once more.

**What this taught.** A size-dependent fixture is a claim about the tree's size, and cutting a document to its budget can
falsify a probe in a file nobody owns — the `B7` probe had been true by coincidence since W115. Nothing proposed here;
the retro decides.

**Questions.** Raised: none (Q600-Q604 reserved and unused). Closed: **[Q174](../questions/q174.md) resolved** by `D9`
(stop-and-ask (7)); [Q3](../questions/q3.md)'s answer moved to 0.6.0. [Q173](../questions/q173.md) stays deferred:
`D9` binds the lock to the pin, and a pin one runtime cannot FETCH is still caught by the L6 lane, not by a check.
