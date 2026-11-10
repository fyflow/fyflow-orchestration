# W224 — the pin moves to `fyflow-scheduler` 0.7.0; D7 learns this library's own version; the claims 0.7.0 makes false

**Status:** done 2026-11-05 — **`npm run gate:item` EXIT 0** on the final tree, one command, run by the orchestrator;
declared 2026-11-05 on `5113a18`; both readers RUN and acted on; nothing raised, F6 closed in place (rule 6)
**Plan:** [P46](../plans/p46-what-the-scheduler-0-7-0-admission-rework-lets-a-document-declare.md) — its FIRST item.

```
Spec:       none moves a rule. spec/flow-definition.md:52, spec/README.md:26, spec/run-state.md:621 REWORDED so the
            version they name is qualified as this library's (P46 decision 2); no FD-V, RN-R, OR-R or RT-R id moves.
Owns:       package.json, package-lock.json, deno.json, deno.lock, examples/deno-import-map.json,
            scripts/check-scheduler.mjs, scripts/check-scheduler-selftest.mjs, CLAUDE.md (the scheduler-facts section
            only), doc/concept.md, doc/scheduler-upstream.md, the three spec lines above, src/definition/registry.ts
            (the idleTimeout-0 refusal's message and its docblock only), AGENTS.md (a sentence that 0.7.0 makes false)
Inputs:     P46 facts 1-9; the scheduler's AGENTS.md at 0.6.0 and 0.7.0 (C:/tmp-p46/pkg); W157's file (the last pin move)
Outputs:    (1) both pins at 0.7.0 — devDependencies and peerDependencies exact, deno.json and the import map
                `jsr:@fyflow/scheduler@0.7.0`, package-lock.json by `npm install`, deno.lock written ONCE by
                `--min-dep-age=0`, ONE JSR entry; `PIN` 0.7.0.
            (2) D7 skips an occurrence qualified as this library's (`orchestration <v>`, `fyflow-orchestration@<v>`);
                the three lines reworded so; a probe in which a qualified occurrence does NOT hide a bare one on the
                same line; a META entry disabling the exemption, graded against a probe that needs it.
            (3) every undated statement 0.7.0 makes false corrected: CLAUDE.md's and doc/concept.md's "optimistic,
                nothing is a hard cap"; doc/concept.md's resource.* reasons (superseded no longer emitted; migrated,
                failed); any such sentence in AGENTS.md; the refusal's "measured on 0.5.2" re-dated to P46 fact 6.
            (4) undated line citations into the scheduler's source that this tree carries re-taken at 0.7.0, or listed
                in the Record as left to an owner, W157's census method.
Depends on: nothing
Blocks:     W225, W226
Tests:      the whole ladder at 0.7.0: L1-L6 UNMOVED (P46 prediction 1); check:scheduler's self-test red on each
            new probe and META entry.
Gate:       `npm run gate` before the readers; the conformity and adequacy readers, not this item's author; then
            `npm run gate:item` ONCE on the final tree.
Reserves:   Q799-Q800, no ADR
```

## Scope

**In** — Outputs (1)-(4).

**Out** — the two new group types and the resident request (W225); grants on real workers (W226); the version bump
(the maintainer's word); dated records in `doc/work-items`, `doc/plans`, `doc/decisions`, `doc/questions`, which stay the
records they are.

## Exceptions — recorded BEFORE the edit

*`doc/workflow.md` section 1 rule 6: granted by the orchestrator under (f1), 2026-11-05, taking the recommended option.*

| | file | the edit, and nothing else |
|---|---|---|
| **E-a** | `examples/run-flow.ts:1093` (the `holdGroup` docblock) | the clause *"the scheduler's own heartbeat re-dispatches the task"* corrected to what 0.7.0 does — the group's `slot-released` wakes the waiters, the heartbeat the fallback — said to be READ in the source, not measured |
| **E-b** | `spec/flow-definition.md:774`; `spec/join-policy.md:299`; `spec/outcome-record.md:135, 145, 171, 510`; `spec/task-id.md:225, 395`; `src/driver/listener.ts:5`; `src/scheduler/runtime.ts:152-153`; `examples/l6.ts:7373`; `examples/run-flow.ts:1152`; `test/driver/driver.test.ts:626`; `test/matrix/run.ts:187` | each undated line citation into the scheduler's source re-taken at 0.7.0 by the census table, and the words 0.7.0 makes false — nothing else; W225 and W226 inherit none. *(The table first wrote `runtime.ts:152-153`; the edit is `:150-153`, its credit line included — F5)* |
| **E-b+** (F2) | `spec/outcome-record.md:169`; `src/driver/listener.ts:5-6` | the re-read credit *"W157 re-read them at the current pin"* and *"re-taken by W158"* → W224 — nothing else |
| **E-c** (F1, F4) | `AGENTS.md:3623-3628`, `AGENTS.md:3961` | `:3623-3628`'s *"the current pin adds a sixth task state"* reworded without the number, dated (`cancelled` since 0.6.0, still true at the pin, re-read by W224); `:3961`'s *"at 0.7.0"* qualified as `orchestration 0.7.0` |
| **E-d** (F6) | `src/scheduler/runtime.ts:30`, `spec/flow-definition.md:2176` — and in `Owns`, `CLAUDE.md:276`, `doc/scheduler-upstream.md:494` | *"`stats` reporting idle"* / *"the scheduler reporting idle"* corrected to what the conformity reader measured on 0.6.0 and 0.7.0 — the tasks stay running for ever, `stats` reading them `running` — nothing else. Closed here, not raised (rule 6) |
| **(g)** | `CLAUDE.md:62-63` | outside *"the scheduler-facts section"* — it is in *"The fact that reframes the whole repo"* — and taken under P46's stop-and-ask (g), the claims 0.7.0 makes false (F5) |

*E-b+, E-c, E-d and the (g) row: granted by the orchestrator under (f1), 2026-11-05, after the readers, recorded before the edit.*

## Verification

`npm run gate > gate.log 2>&1; echo "GATE EXIT=$?"`, then the readers, then `npm run gate:item` the same way. Routing:
not applicable — no routing code moves.

## Record

**Gate — what ran.** Baseline `5113a18`; node 24.20.0, deno 2.9.6.

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` (before the readers) | **RAN, `GATE EXIT=0`** — four runs, the last (`C:/tmp-p46/w224-gate4.log`) on the tree with the readers' findings acted on, before this Record's last edit, every run with the same counts as below | lint, the five typecheck lanes, `check:scheduler` D1-D9 at 0.7.0, the other eleven checks, L1-L5 **106 files / 2321 cases** in node, deno and chromium (parity 2321) — **UNMOVED** (P46 prediction 1); L6 **2905 assertions / 268 real runs on fyflow-scheduler 0.7.0, 0 failed**, in node 24 and in deno — **UNMOVED** (`check:docs` `X10` holds `examples/l6.ts`'s declared counts, which this item does not edit). firefox and webkit NOT RUN (`test:browser:all` is not on the gate) |
| `test:l6:deno` reaches 0.7.0 through the lock | **RAN** | `deno info --import-map=examples/deno-import-map.json examples/l6.ts` resolves `jsr.io/@fyflow/scheduler/0.7.0/` only |
| `check:scheduler:selftest` | **RAN, EXIT 0** | after the readers: **59/59 probes caught; 60/60 META graded — 56 by the named probe, 3 by the failure count, 1 masked, 0 by the corpus**. *(Before them: 57/57 and 59/59 with 1 by the corpus — the *exemption disabled* entry F3 removed.)* |
| rule 8, the D7 change broken by hand | **RAN, red both ways** | (a) the exemption DISABLED in the real check: `check:scheduler` EXIT 1, `D7` naming exactly `spec/flow-definition.md:52`, `spec/README.md:26`, `spec/run-state.md:621`; (b) the exemption WIDENED to the whole line, in a mutant copy, with the new probe selected: `inert: yes`, `outcome: exit0`, *wanted [D7], got []* — the probe uncaught. Both restored; `check:scheduler` green after. **After the readers, the same for A1 and A2**, each mutant a copy with its probe selected: the `OURS` alternative widened to `\bfyflow-[\w-]+@` — `inert: yes`, `outcome: exit0`, the npm-specifier probe uncaught; the `NOTES` strike widened to the whole value — `inert: yes`, `outcome: exit0`, the description probe uncaught |
| conformity reader | **RAN** | **3 SHOULD, 3 NIT** (F1-F6) — all acted on, below |
| adequacy reader | **RAN** | **about 45 mutations; 2 SHOULD and 3 NIT survivors** (A1-A5) — A1 and A2 closed by a probe and a META entry each, A3-A5 stated survivors, below |
| overlap | | **1 shared subject**: the `D7` exemption's hole — F4 and A1/A3 |
| `gate:item` | **RAN, `GATE:ITEM EXIT=0`** | once, on the final tree, by the orchestrator: the ladder plus the self-tests less `check:register:selftest` — **10/10 self-test lanes ok**, 1340.7 s wall (log `C:/tmp-p46/w224-gateitem.log`) |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) both pins at 0.7.0 | `package.json` dev and peer exact, `deno.json` and the import map `jsr:@fyflow/scheduler@0.7.0`, `PIN` 0.7.0; `package-lock.json` by `npm install` (EXIT 0, zero links — it also moved the lock's own stale `version` 0.10.0 → 0.13.0, npm's doing); `deno.lock` deleted and written ONCE by `deno check --min-dep-age=0 index.ts src/` (EXIT 0): ONE JSR entry, `@fyflow/scheduler@0.7.0`, integrity `2794c531…c2ee9bd` (P46 fact 2's) | `D2`, `D3`, `D8`, `D9` |
| (2) D7's own-release exemption | `scripts/check-scheduler.mjs`: `OURS` (`orchestration <v>`, `fyflow-orchestration@<v>`) struck per OCCURRENCE before the pin's token is looked for, in the walk and in `NOTES`; its hole stated beside it (the pin's number after the word *orchestration* passes). The three spec lines reworded — `spec/run-state.md:621` carried FIVE occurrences, all five qualified. Self-test, after the readers: THREE probes — a qualified and a bare occurrence on one line of `spec/run-state.md`; `fyflow-scheduler@<pin>` beside the word *scheduler* (A1); `package.json`'s `description` reading *orchestration <pin> over the scheduler <pin>* (A2) — and THREE META entries, each a WIDENING of the exemption graded by its probe (to the whole line; `fyflow-orchestration@` to any `fyflow-…@`; the `NOTES` strike to the whole value). **No entry for the exemption DISABLED** (F3, the option chosen: REMOVED, not reworked): the harness cannot express it — disabling the exemption makes `D7` stricter and every probe asserts a refusal — and the entry first shipped was graded by the corpus alone, which would turn inert and red at the next pin move. The fixed point, stated in the self-test's header: the corpus, while a living line names this library's own release at the pin's number. `MIN_PROBES` 56 → 59, `MIN_META` 57 → 60. The check's comment states the hole precisely: `\b` admits *orchestration* after a hyphen (F4) | the three probes and their entries, above |
| (3) the claims 0.7.0 makes false | `CLAUDE.md`'s and `doc/concept.md`'s *optimistic, nothing is a hard cap* → a concurrency limit is a hard cap at the pin and a rate group caps starts (0.7.0 `AGENTS.md` §1), the old behaviour dated by P46; `doc/concept.md`'s `unblocked` reasons → `admitted`, `migrated`, `orphaned`, `failed`, `shutdown`, `cancelled`, `superseded` no longer emitted (§6); its group row gains `UnitGroup` and `KeyedConcurrentLimitGroup`; `registry.ts:515`'s *measured on 0.5.2* → *measured at P18 fact 6 and re-measured at P46 fact 6* (no number), its docblock `:466` likewise; `AGENTS.md` — **one sentence false, found by the conformity reader (F1), not by this item's search**: `:3623-3628`'s *"the current pin adds a sixth task state, `cancelled`"* (it arrived at 0.6.0), reworded without the number and dated (E-c); `:3961`'s *"built a runtime at 0.7.0"* qualified `orchestration 0.7.0` (F4). `:3466`'s *a rate limit may briefly be exceeded* is about two runtimes' SEPARATE groups and stays true. And an older claim (F6), measured false by the conformity reader on 0.6.0 and 0.7.0: *"`stats` reporting idle"* for a group with no `onFinish` — `stats` reads `{"queued":0,"running":2,…}` — corrected in `CLAUDE.md:276`, `src/scheduler/runtime.ts:30`, `spec/flow-definition.md:2176`, `doc/scheduler-upstream.md:494` (E-d) | the readers; nothing binds prose to the scheduler's reference |
| (4) undated citations | re-taken — the census; the ones outside `Owns` under E-b, none left to W225 or W226 | the readers |

**The census.**

*Every pin site:* `package.json:130,135`, `deno.json:11`, `examples/deno-import-map.json:4`, `scripts/check-scheduler.mjs:58`,
both locks — moved. `git grep "0\.6\.0"` outside the record directories on a line saying *scheduler* or *pin*: only dated
history (`doc/concept.md:55`, `doc/scheduler-upstream.md`'s rows), which `D7` admits.

*Undated claims searched* (non-record tree, `dev-dist/` excluded) for `superseded`, `optimistic`, `hard cap`, `briefly
exceed`, `head-of-line`, `heartbeat`, `unblocked`, `wake`, resident hand-over: fixed as above; and **one false claim outside
`Owns`, CORRECTED under E-a**: `examples/run-flow.ts:1093`, *"the scheduler's own heartbeat re-dispatches the
task"* — at 0.7.0 the harness's `heldGroup.onFinish()` makes `ConcurrentLimitGroup` emit `slot-released` and the scheduler
wakes its waiters a microtask later (`AGENTS.md` §6 *How a blocked task wakes up*; dist `onFinish` and
`_setupGroupEventListeners`). The comment now says so, the heartbeat the fallback, and says it was READ in the source
by W224, not measured; the L6 `group` row is green either way.

*Undated line citations into the scheduler's source*, re-read in 0.7.0's JSR source (fetched into `C:/tmp-p46/jsr`, the
0.6.0 file into `C:/tmp-p46/jsr060` to map them). `core/FyflowScheduler.ts` is 2373 → 3317 lines. Each claim re-read and
UNCHANGED: `parents` declared and dropped; the `user_action` pair on both paths; the optional branch; the live-object
dispatches; `onStart`/`onFinish` optional and called unguarded.

| 0.6.0 | 0.7.0 | what |
|---|---|---|
| `workerInterface.ts:107` | `:139` | `SpawnTaskConfig.parents` |
| `:1930-1935` | `:2866-2871` | the spawn path's six fields |
| `:1151-1167` / `:1545-1557` | `:1633-1649` / `:2256-2268` | the `user_action` pair, ordinary / orphaned |
| `:1151-1154` / `:1545-1548` | `:1633-1636` / `:2256-2259` | the optional branch |
| `:1093, 1164, 1166, 1554, 1556`, `:1198` | `:1575, 1646, 1648, 2265, 2267`, `:1680` | the live-object dispatches |
| `:1105` | `:1587` | `task.error = error.message` |
| `:1107-1143` | `:1589-1625` | the retry block |
| `:296` | `:345` | `export class FyflowScheduler` |
| `:2075` | `:3011` | `_recordTerminalTask` |
| `resourceGroup.ts:114, 117`; `:894`, `:976` | `:140, 147`; `:1332`, `:1456` | S10 |

**Re-taken here** (in `Owns`): `CLAUDE.md:62-63` and `:243` (the line numbers; *re-read at the pin by W224*);
`doc/concept.md:55` (the 0.6.0 numbers kept as dated history) and its two *last re-checked by* sentences;
`doc/scheduler-upstream.md`'s header (the 0.7.0 adoption and S10 at 0.7.0 — S11 and S12 NOT re-read).
*`CLAUDE.md:62-63` sits in "The fact that reframes the whole repo", outside "the scheduler-facts section" `Owns` names; it
is taken under P46's (g), the claims 0.7.0 makes false — the Exceptions' (g) row (F5).*

**Re-taken under E-b** (outside `Owns`, granted), each by the table above and nothing else:
`spec/flow-definition.md:774`; `spec/join-policy.md:299`; `spec/outcome-record.md:135, 145, 171, 510`;
`spec/task-id.md:225, 395`; `src/driver/listener.ts:5-6` (and *re-taken by W158* → *W224*, E-b+); `spec/outcome-record.md:169`
(*W157 re-read them* → *W224*, E-b+); `src/scheduler/runtime.ts:150-153` (the numbers, and *W157
re-read* → *W224 re-read*, the claim being re-read at this pin); `examples/l6.ts:7373`; `examples/run-flow.ts:1152`;
`test/driver/driver.test.ts:626` and `test/matrix/run.ts:187` (the numbers, and *re-taken by W158* → *by W224*). W225 and
W226 inherit none. **Dated and left as records**: `spec/task-id.md:244-257` (*at 0.5.2*),
`src/driver/ids.ts:12` and `test/matrix/{flows,scenarios}.ts`, `run.ts:20` (*at 0.3.0*), `spec/flow-definition.md:2134`
(*measured on 0.5.2 at P18*), `doc/scheduler-upstream.md`'s rows, and `AGENTS.md:3623`'s *"byte-identical between 0.3.0,
0.5.1 and 0.5.2"* — its next sentence about the current pin was NOT dated, and is now (F1, E-c).

**What broke.**

1. **`CLAUDE.md` went 70 bytes over its 25,600-byte ceiling** (`check:budget` `B2`) on the first draft of the hard-cap
   bullet; cut to 25,459, the ceiling not raised.
2. **The first comment written for `OURS` named the pin's number beside the word *scheduler*** — `D7` would have refused its
   own explanation; reworded before any run.
3. **The first rule-8 attempt (b) edited the REAL check**, which made the META pass's distinctness guard fire (its anchor
   gone) instead of the probe; re-run against a mutant copy with the probe selected, as the META pass does. And the first
   rule-8 mutant for A1 was built with `sed`, which matched nothing — the probe came back *caught* against an UNCHANGED
   copy; rebuilt by a script that refuses a non-match, and it went red.
4. **This item's own search missed `AGENTS.md:3623-3628`** (F1): it grepped for the words 0.7.0 changes, and the false
   sentence was one 0.6.0 had already made a claim about *"the current pin"* — a sentence that names the pin goes false at
   every move whatever it says. The conformity reader found it.
5. **The *exemption disabled* META entry was graded by the corpus alone** (F3) and would have gone red at the next pin
   move; removed, with its reason and fixed point stated.

**The adequacy reader's stated survivors** (NIT, not closed here; the reasons are the reader's, copied into this Record by
the orchestrator). **A3** — four NARROWINGS or harmless shifts of `OURS` survive: the `fyflow-orchestration@` alternative
deleted, `\b` dropped, `orchestration\W+<v>`, and the exemption not applied in `NOTES`; each moves the check in the stricter
direction or barely at all. Beside it, the hole F4 names: the pin's number after the word *orchestration*, and after a
hyphen (`x-orchestration <pin>`), passes — stated in the check's comment. **A4** — older than W224: `D9` reads only
`deno.lock`'s `jsr` keys and `package-lock.json`'s installed entry, so a stale `specifiers` line or stale root
`packages[""]` entries survive; a second route plausibly exists in `npm ci`'s out-of-sync refusal, NOT run. `D9` is not
widened here. **A5** — the *disabled* META entry deleted together with its floor survived: the self-test's stated fixed
point (it has no `SELF` list). Moot after F3 removed that entry.

**Questions.** Raised: none (Q799-Q800 reserved, unused). Closed: none. F6's defect is **closed here rather than raised**
(rule 6, E-d).
