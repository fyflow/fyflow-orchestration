# W171 — the driver's halt on a defect is RENAMED `halted`, and a stored `stopped` is read as one

**Status:** done 2026-10-16 — **`npm run gate:item` EXIT 0** on the final tree, one command; declared 2026-10-16 on `7c88a20`; P34's THIRD item, decision 2 and stop-and-ask (f) as answered; both reader passes RAN, no DEFECT, their items acted on (C1-C4, C7; A1-A3); no exception; no question raised; P34 prediction 3 FALSIFIED (M4, made loud)
**Plan:** [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) — *what does a run do when its owner
cancels it, stops it to resume it elsewhere, or pauses it?* — its THIRD item: decision 2 and stop-and-ask (f) as the
maintainer answered them 2026-10-16 (*"as recommended"*). Today's `stopped` is the driver's halt on a defect (`failRun`,
`OR-R10`), terminal and refused by a resume; *stop* is to name only W174's resumable stop, so the halt is renamed
`halted` everywhere, a stored `'stopped'` (a 0.7.0 checkpoint or log) is READ as `halted` and never written again,
and `CHECKPOINT_FORMAT` stays `1`.

```
Spec:       spec/run-state.md v0.15 -> v0.16: section 2's `haltedBy`; section 3's table row `halted`; `RN-R8`
            (the outcome's name, and the DUAL READ — a stored element whose kind is `stopped` folds as `halted`);
            `RN-R12`'s and `RN-R28`'s names; `RN-R23` (the reason `halted`, its position, and a stored `stopped`
            refused `halted` at ITS position); `RN-R25`'s *a `halted` run*; sections 6-9's prose naming the halt.
            No rule id moves or is added; the outcome count stays SEVEN; no `FoldInput` kind is added — one is
            RENAMED, and its old name is read and never written.
            spec/outcome-record.md v0.14 -> v0.15: `OR-R10` — the run is HALTED, its outcome `halted` (`RN-R8`).
            No rule moves.
            spec/flow-definition.md v0.40 -> v0.41: section 2's one sentence naming the outcome (*never says
            `halted` for a transform*). No rule moves.
            spec/README.md: the three rows' version columns and prose.
            spec/join-policy.md and spec/task-id.md are in P34's row and are NOT edited: every `stopped` in both is
            the English verb (B′, M3 below), none names the halt.
Owns:       from P34's W171 row: src/fold/run-state.ts, src/driver/driver.ts, src/driver/listener.ts,
            src/scheduler/runtime.ts, src/scheduler/envelope-worker.ts (:346), spec/run-state.md,
            spec/outcome-record.md, spec/join-policy.md, spec/flow-definition.md, spec/task-id.md, spec/README.md,
            test/**, examples/l6.ts, examples/run-flow.ts, examples/README.md, scripts/run-browser-tests.mjs and
            the script self-tests its copy finds, AGENTS.md, README.md; doc/decisions/0102-* (record step).
            B′ (M3) classified the script self-tests and run-browser-tests.mjs: NONE names the halt — the bare
            word in nine self-tests and four checks is English (*stopped being true*, *stopped detecting*), and
            run-browser-tests.mjs's two `stoppedBy` are its local `stoppedByPageError` — so NO script is edited.
            spec/join-policy.md and spec/task-id.md: not edited (above).
            Exceptions: none declared. An out-of-Owns need is a stop-and-ask, reported, never edited.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q641-Q643 if raised),
            doc/decisions/** (ADR 0102), the plan's Record, README.md (also in Owns), this file.
Inputs:     P34 decision 2, decisions 10-11, stop-and-ask (f) as answered, fact 7 (the census and the persisted
            kind), fact 12 (P33's three stale comments), prediction 3, sentence D′'s census sites; ADR 0058 rules 3
            and 4 (`done` resolves a refused run), ADR 0064/0065 (a checkpoint is the event sequence; resume),
            ADR 0094 (`cancelled`, ranked below the halt).
Outputs:    (1) src: `RunOutcome` `'halted'`, `FoldInput` `{ kind: 'halted'; reason }`, `RunState.haltedBy`,
                `ResumeRefusalReason` `'halted'` — `'stopped'` and `stoppedBy` gone from every type; `failRun`
                appends `halted`; `resume()`'s regenerated-halt refusal names `halted`.
            (2) the DUAL READ: `step` folds an element of kind `'stopped'` as `halted`; `resumeRefusal` (both
                callers) refuses it `halted` at its position, its message naming the stored kind.
            (3) P33's three stale comments (fact 12) in the sentences this rewrites: envelope-worker.ts's `FD-C5`
                comment (the context IS passed), runtime.ts's `done` list (`cancelled` named), runtime.ts's
                `resumeRefusal` list (a cancelled run named).
            (4) spec v0.16 / v0.15 / v0.41 and spec/README.md's rows.
            (5) ADR 0102.
            (6) tests (below); test/** renamed site by site.
            (7) examples/l6.ts, examples/run-flow.ts, examples/README.md renamed; l6.ts's `outcomesSeen` /
                `outcomesNotSeen` typed `RunOutcome[]` (M4 — the one site B′ found GREEN under the old literal).
            (8) AGENTS.md and README.md renamed — every snippet typechecked and run by `check:docs`.
Depends on: W170 (done, 7c88a20)
Blocks:     W172
Tests:      L0 — test/fold/fold-rules.test.ts, a checked-in typecheck probe: `@ts-expect-error` on a consumer's
            `outcome === 'stopped'`, `reason === 'stopped'`, `RunOutcome`/`ResumeRefusalReason` = `'stopped'`, a
            `FoldInput` of kind `'stopped'` and `state.stoppedBy` — each an error under `typecheck:tests`, where an
            unused `@ts-expect-error` is itself an error.
            L1 — test/fold/fold-rules.test.ts, RN-R8's suite: a HAND-WRITTEN 0.7.0-shaped log with a stored
            `{ kind: 'stopped', reason }` folds `halted`, `haltedBy` the reason, a settlement and a `user_action`
            after it moving nothing (RN-R8); the same element first in the sequence; a `halted` element and a
            `stopped` one folding to the same state. L3 — the legacy log folded twice, deep-equal.
            L2 — test/driver/resume.test.ts, W89's suite: a 0.7.0 checkpoint — a run's checkpoint whose halt
            element is re-written in 0.7.0's kind, as a 0.7.0 store holds it — refused `halted` at that element's
            position, by `Driver.resume` and by `resumeRefusal` (the runtime's pre-check), nothing dispatched,
            the message naming `stopped`; the same where the stored element is NOT the last; a 0.7.0 checkpoint of
            a LIVE run (no halt element — byte-identical in 0.7.0) still resuming; and no element of kind
            `'stopped'` in any log this item's halted runs write.
            Every existing assertion on the halt renamed, its expected value re-read from the spec; the suites
            whose NAME carries the word renamed with `l4-corpus.test.ts`'s census; W89's DECLARED_CASES and its
            count in `l4-corpus.test.ts` moved by the cases added.
            Expected values from spec v0.16's `RN-R8` / `RN-R23` and ADR 0102 — never from the implementation's
            output. Each new case shown able to fail by a ONE-clause mutation (sentence E) in the byte copy
            C:/tmp-w171/m.
Gate:       `npm run gate` before the readers (P34 sentence C); then the conformity and adequacy readers, NOT run by
            this item's author; then `npm run gate:item` ONCE on the final tree. The row's clauses: L0 a consumer's
            `outcome === 'stopped'` and `reason === 'stopped'` FAIL to compile (a typecheck probe, checked in); L1 a
            0.7.0-shaped log with a stored `'stopped'` folds `halted` and its checkpoint is refused `halted` at that
            position; L3 every fixture folded twice equal; no `'stopped'` literal WRITTEN anywhere in `src/`.
Reserves:   Q641-Q643 (P34's W171 row); ADR 0102 (P34 decision 11)
```

## Scope

**In** — Outputs (1)-(8).

**Out** — named rather than left implicit, with where it goes instead

- **Any meaning for `stop`** — the resumable stop is W174 (ADR 0105), its outcome `interrupted`; this item only frees
  the word.
- **The precedence of the new outcomes** — `cancelling`, `interrupted` — (h), W173-W174. `halted` keeps `stopped`'s
  place: it outranks everything.
- **A `CHECKPOINT_FORMAT` bump** — refused by (f): every 0.7.0 checkpoint of a live run would be refused `format`.
- **Version-history paragraphs** in `spec/*.md`, `spec/README.md` and `examples/README.md` that describe what an
  earlier version or item did, in that version's vocabulary — left as written: each is true of the version it
  names. Only sentences stating CURRENT behaviour are renamed.
- **The English verb** *stop* / *stopped* (*the driver has stopped routing*, *stopped being true*) — kept where it is
  an act and not the outcome's name.

## Verification

`npm run gate` on the real tree, held still, each rung's exit read on its own line; the author's ONE-clause provocations
in the byte copy `C:/tmp-w171/m`; then the readers; then `npm run gate:item` once. The *no `'stopped'` written* clause
is a grep of `src/` for the quoted literal, every hit classified READ (a comparison) or prose. Routing coverage: a branch
routed away from its join (Q4), `user_action` (Q17 — a parked node after a legacy halt), no matching decision edge (Q10),
a duplicate task id (Q13), a nested fan-out (Q6) — not applicable beyond the `user_action` case: this item renames one
outcome and reads one stored kind; it changes no route.

## What the declaration step measured

*Measured 2026-10-16 in a BYTE COPY of `7c88a20` (`git archive` into `C:/tmp-w171/m`, `node_modules` copied, never
linked; `find -type l` zero), node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `lint` 146 files; `check:spec` 7 / 75 / 135 rules; `check:docs` 43 snippets (37 run, 6 check); L1-L5 **62 files / 1776 cases** in node, deno and chromium; L6 **2664 / 176**, 0 failed, in node and deno |
| M2 | **P34 prediction 3** — `src/` renamed ALONE (outputs 1-3) against HEAD's tests, examples and `AGENTS.md` | `typecheck:node`, `:browser`, `:deno` EXIT 0; **`typecheck:tests` EXIT 2, 36 errors in 15 files** (every `stoppedBy` read TS2339, every `kind === 'stopped'` TS2367, every `'stopped'` element or outcome TS2322); **`typecheck:examples` EXIT 2, 8 errors** in `l6.ts`; L1-L5 **39 failures**; `check:docs` X3 6 errors, X4 3 snippets, X5 3; L6 **8 failed** of 2664 |
| M3 | **B′'s classification** of the bare word outside `src/`'s halt | every script hit is English (*stopped being true*, *ran and stopped detecting*, *stopped at a literal*) — none is the halt; `run-browser-tests.mjs`'s `stoppedBy` is the local `stoppedByPageError`; `spec/join-policy.md`'s four and `spec/task-id.md`'s four are English; `src/definition/regions.ts:437` and `src/driver/events.ts:20` (OUT of `Owns`) are the English verb (*stopped the run at `FD-R3`*, *stopped naming one region*) and stay true |
| M4 | **the site that stayed GREEN under the old literal** — prediction 3's exception | **`examples/l6.ts:4122`**, the threaded `uncloneable` row's `outcomesNotSeen: ['stopped', 'completed']`: typed `string[]` (`:581`), so no typecheck reaches it, and with the outcome renamed the run can never read `'stopped'`, so the *not seen* clause holds VACUOUSLY — absent from M2's 8 L6 failures. **Made loud**: `outcomesSeen`/`outcomesNotSeen` typed `RunOutcome[]`. `test/driver/outbound.test.ts:252` also stays green — a FORGED `{ kind: 'stopped' }` pushed into a frozen array, whose content no assertion reads — renamed for the vocabulary, and loud since (a `FoldInput` of kind `'stopped'` no longer typechecks) |
| M5 | census sites the rename moves | six suite NAMES carry the word (`l4-corpus.test.ts`'s census: `:419`, `:420`, `:449`, `:565`, `:603`, `:691`); W89's `DECLARED_CASES` (three case names, and the cases added) and its count at `l4-corpus.test.ts:740`; `RUN_FLOOR` does not move (no snippet added or removed); `X10` moves only if an L6 assertion is added or removed |

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | real tree held still, node 24.20.0: `lint` 146 files; `check:spec` 7 / 75 / 135 rules; `check:docs` 43 snippets (37 run, 6 check); L1-L5 **62 files / 1780 cases** in node, deno 2.9.6 and chromium (+4 over M1: the three fold cases and the resume case); L6 **2664 / 176**, 0 failed, in node and deno — unmoved, so `X10` does not move. firefox and webkit NOT RUN |
| L0 — the old names fail to compile | **RAN** | `test/fold/fold-rules.test.ts`'s `@ts-expect-error` probe under `typecheck:tests`; K11-K14 below each make it red |
| L1 — a 0.7.0 log folds `halted`; L2 — its checkpoint refused `halted` at that position | **RAN** | the RN-R8 cases and W89's new case; K1-K10, K16-K20 |
| L3 — folded twice equal | **RAN** | the legacy sequence folded twice and from its structured clone |
| *no `'stopped'` WRITTEN in `src/`* | **RAN** | grep: three literals, all READS (`driver.ts` the scan and the message suffix, `run-state.ts` the `step` arm); and since A1, a test — every halted run's checkpoint in the new case holds no element of the old kind, and K10 (`failRun` writing it) is killed |
| conformity reader | **RAN** | probed on REAL v0.7.0 checkpoints: a halted run refused `halted` at its own index, a live run resumes, nothing writes `stopped`; reading 2's unreachability verified in both callers. **No DEFECT**; C1-C2 SHOULD-FIX, C3-C7 notes — acted on below |
| adequacy reader | **RAN** | **33 own one-clause mutations, 29 KILLED**; survivors A7 (EQUIVALENT — first-wins vs last-wins `haltedBy`, unreachable: no reachable log holds two halts) and B7, B8, B9 (the refusal message's head and its stored reason unasserted). **No DEFECT** — acted on below |
| author's provocations, re-run after the readers' items | **RAN** | harness `C:/tmp-w171/mutate.mjs` in the byte copy re-synced with the final tree: control CLEAN; **20 of 20 KILLED** — K1-K15 of the first run and K16-K20, cut against the readers' items; every file restored, digests equal |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still, after the readers' items and the record step (this Record written before it, but for this row and the Status line): the ladder — `lint` 146 files, `check:spec` 7 / 75 / 135 rules, `check:docs` 43 snippets (37 run, 6 check), L1-L5 **62 files / 1780 cases** in node 24.20.0, deno 2.9.6 and chromium (the readers' assertions sit inside existing cases, so the count does not move), L6 **2664 / 176**, 0 failed, in node and deno — then the self-tests less `check:register:selftest`: **10/10 completed, 10 ok**, 906.6 s self-test wall. firefox and webkit NOT RUN; `gate:full` NOT RUN and not owed (W176 is P34's last item) |

**The author's mutation table** (each ONE clause, sentence E; runtime graded on the runner's `FAIL` lines over
`fold/fold-rules` and `driver/resume`, types on `tsc`'s error lines).

| id | the clause broken | killed by |
|---|---|---|
| K1 | `step`: the dual read removed | the three new fold cases (a 0.7.0 element falls through to `input.record` and throws) |
| K2 | `step`: the dual read keyed on the wrong word | the same three |
| K3 | `step`: `haltedBy` not from the element's `reason` | the new fold cases and RN-R8's first case |
| K4 | `withOutcome`: the RN-R8 latch removed | RN-R8's two cases and the new legacy case |
| K5 | `resumeRefusal`: the dual read removed | the new resume case (refused `diverged`) |
| K6 | `resumeRefusal`: the reason from the stored kind | the new resume case |
| K7 | `resumeRefusal`: the index the last element | the position case and the new case |
| K8 | the message no longer names the stored kind | the new resume case |
| K9 | over-broad: a `dispatched` element refused too | the live-run control and 19 other resume cases |
| K10 | `failRun` WRITES `'stopped'` | four resume cases, the new case's *nothing written* among them |
| K11 | `RunOutcome` regains `stopped` | `typecheck:tests`, unused `@ts-expect-error` (TS2578) |
| K12 | `ResumeRefusalReason` regains `stopped` | the same |
| K13 | `FoldInput` regains `{ kind: 'stopped' }` | the same, and `checkpoint.test.ts`'s `Record` over the kinds |
| K14 | `RunState` regains an optional `stoppedBy` | the same |
| K15 | the l6 row's `outcomesNotSeen` given `'stopped'` back | `typecheck:examples` (TS2322) — B′'s M4 made loud |
| K16 | the message head names the stored kind (adequacy B7) | the new resume case's `startsWith` |
| K17 | the regenerated-halt message head (B8) | the lost-tail case's `startsWith` |
| K18 | the message quotes the kind, not the stored reason (B9) | the new resume case's hand-written reason |
| K19 | `step`'s halt arm leaves the outcome as it was (A2) | the new one-step case |
| K20 | `CHECKPOINT_FORMAT` bumped to `2` (A3) | the live-run control's literal `format === 1`, and the header refusals |

**The adequacy reader's table, as reported**: 33 one-clause mutations, 29 KILLED; A7 EQUIVALENT (recorded, A6);
B7, B8 and B9 closed by A1's assertions and re-cut as K16-K18 above, now KILLED. *(The per-mutation list is the
reader's report.)*

**What was done for each finding.**

| | finding | done |
|---|---|---|
| C-C1 (SHOULD-FIX) | `spec/outcome-record.md` `OR-R6`'s v0.11 note said *rather than `stopped`* of current behaviour | **renamed** `halted`, with *`stopped` until v0.15* |
| C-C2 (SHOULD-FIX) | `AGENTS.md` §9's note did not say BREAKING and named three surfaces, omitting `FoldInput` | **rewritten**: *BREAKING in 0.8.0* (P34 decision 10) and all FOUR surfaces — `RunOutcome`, `RunState.stoppedBy`→`haltedBy`, the `FoldInput` kind, `ResumeRefusalReason` — and a constructed `{ kind: 'stopped' }` named; the `halted` member's JSDoc in `run-state.ts` says BREAKING too |
| C-C3 | `FD-R5`'s Test clause, `spec/flow-definition.md:2370`, said *stopped* | **renamed** *halted*; `:44`, `:2371`, `:2413` are history, left |
| C-C4 | the verb still named the halt in current text | **in `Owns`, renamed**: `driver.ts`'s `UndeclaredRoute` message (*the run halts here*) and `RN-R23` (*the refusal that halted it would halt it again*). **OUT of `Owns`, left for W174** (which introduces the real stop): `src/definition/types.ts:757` and `:790`, *STOPS the run* |
| C-C5 | `doc/questions/q605.md:32` says *(or `stopped`)* | **left for W172**, which closes Q605 |
| C-C6 | D′'s count sentence; prediction 3 | stated below, in *What this taught* |
| C-C7 | the refusal suffix used a backtick as an apostrophe beside code spans | **reworded**: *(the name 0.7.0 wrote for `halted`, ADR 0102)*. A stored `stopped` with NO `reason` folds `haltedBy: undefined` — PRE-EXISTING (0.7.0's `step` read `input.reason` the same way), recorded only |
| C — reading 2 | | stated plainly: **a DEVIATION from (f)'s LETTER, not its intent.** (f) says *the replay treats it as the regenerated halt's equal*; no code does, because `resumeRefusal` runs first in both callers and refuses the stored `stopped` — so the replay never meets one. (f)'s intent, *a 0.7.0 checkpoint of a halted run is refused for the right reason*, holds. ADR 0102 Consequences says so |
| A-A1 (SHOULD-FIX; B7-B9) | no assertion on the message head or the stored reason | **added**: `startsWith('ResumeRefused (halted)')` in the new case and in the regenerated-halt tail case, and the stored reason as a hand-written literal (`OR-R6`'s message and `failRun`'s `<class>: <message>`). K16-K18 KILLED |
| A-A2 | the latch (their A4) killed by one case | **added**: one `step` from `emptyState()` on a legacy element, held to a hand-written `RunState`. K19 KILLED |
| A-A3 | the live-run control did not pin the format | **added**: `REF.quiet.header.format === 1`, the literal ADR 0102 rule 4 keeps. K20 KILLED |
| A-A4 | an optional direct `runtime.resume(flow, legacy)` case | **not added**: `runtime.resume` calls the same `resumeRefusal` the new case holds (*one function, two callers*), and a case there moves `test/scheduler/resume.test.ts`'s counted suite. Covered by construction, as the reader says |
| A-A5 | `AGENTS.md`'s precedence snippet catches an old literal only at X4, at run time (its rows are not typed `RunOutcome`) | recorded only |
| A-A6 | A7 equivalent | recorded only |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the renamed types and writes | yes | K10-K14; M2's 36 + 8 typecheck errors and 39 L1-L5 failures |
| (2) the dual read in `step` and `resumeRefusal` | yes | K1-K9, K16-K18 |
| (3) P33's three stale comments | yes | comments — no check reads them |
| (4) spec v0.16 / v0.15 / v0.41 and the README rows | yes | `check:spec` C8 binds each Status to its row; the prose is bound by no test |
| (5) ADR 0102 | yes | `check:register` reads its front matter |
| (6) the tests | yes | the table above |
| (7) the examples, `outcomesSeen`/`outcomesNotSeen` typed | yes | K15; L6 |
| (8) `AGENTS.md` and `README.md` | yes | `check:docs` X3/X4/X5 and X8 (M2: six typecheck errors, three snippets that did not run) |

**Record-step files**: `doc/decisions/0102-*` (new), this file. `README.md` is edited as `Owns` (one snippet comment,
byte-equal to `AGENTS.md`'s, X8). The plan's Record is the join's. No `doc/questions/**` file is edited.

**Owns, checked by hand** (`git diff --name-only` against the block above): every file changed is in P34's W171 row or
is a record-step file; no exception was needed.

**What broke.** Nothing at the ladder. Both readers' items were documentation sites still stating current behaviour
in the old word (C1-C4), a BREAKING label (C2) and four unasserted clauses of the new refusal (A1-A3); all closed.

**What this taught.**
- **P34 prediction 3 is FALSIFIED**: `examples/l6.ts`'s threaded `uncloneable` row, `outcomesNotSeen: ['stopped', …]`,
  stayed GREEN under the old literal (M4) — an exclusion over a `string[]` holds trivially once the name cannot occur.
  It is loud only since this item typed the field `RunOutcome[]` (K15). An exclusion claim needs the type of what it
  excludes, or a rename makes it vacuous. For P34's retro.
- **P34's D′ sentence is wrong for W171**: *`run-state.md` … counts seven run-level outcomes — W171, W173 and W174 each
  move the count*. A rename moves no count: it is still SEVEN at v0.16. W173 and W174 add outcomes and do move it.
- **A dual read needs its message held, not only its reason** (A1): the refusal's reason and index were asserted and its
  text was not, so the message could name the wrong thing at no cost.

**Questions raised.** None — Q641-Q643 unused, skipped. **Closed**: none. **Handed on**: `src/definition/types.ts:757`
and `:790` (*STOPS the run*) to W174; `doc/questions/q605.md:32` (*(or `stopped`)*) to W172.
