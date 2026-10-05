# W78 — The run a consumer holds in one line: P20's exit artifact

**Status:** done
**Plan:** [P20](../plans/p20-what-the-runtime-owes-a-consumer.md)

```
Spec:       none — this item adds no FD-, RN-, OR-, JP-, ID- or RT- rule and changes no
            spec/ document. It is an EXIT ARTIFACT: it demonstrates W76's and W77's
            decisions on real workers and reduces the reference to what they made true.
            (Grepped: `RunHandle`, `StartOptions` and `runtime.start` occur in AGENTS.md,
            README.md, doc/** and src/**, and in nothing under spec/.)
Owns:       examples/**, AGENTS.md, README.md, examples/README.md
Inputs:     P20 facts 3, 3b and 4, RE-RUN here rather than transcribed
            (dev-dist/w78/fact*-rerun*.txt) — fact 3b UNMOVED, fact 3 MOVED by W77,
            fact 4's HARNESS broken by W77's own breaking change (findings A and B);
            W76's and W77's item files, which are this item's dependencies and which
            BOTH correct the plan; ADR 0058 rules 3, 4, 6 and 8; ADR 0014 rules 1-4 and
            its Correction; P20 decisions 1, 2 and 7 and predictions 3 and 4;
            doc/workflow.md v0.20 rule 8 (a), (b) including the TAUTOLOGY clause,
            (c) and its LIMIT, (d) and its membership and CONTROLS clauses, (e)
Outputs:    (1) the reference's THIRTEEN copies reduced, and the residue MEASURED rather
                than asserted — one table, one row per copy, each surviving line with the
                claim it carries;
            (2) `AGENTS.md` teaches the two things ADR 0058 leaves to it and that the
                reference had nowhere for: `Promise.race([done, …])` as the deadline, and
                `awaiting_action` as the state `done` waits through;
            (3) ONE L6 block — TWO runs on a real `FyflowScheduler` in both runtimes — in
                which the consumer holds ONLY what `start` returned: a fan-out's region
                events counted through `StartOptions` (W76) and the end awaited in one
                line (W77), with no `onFoldInput`, no poll, no deadline and no backstop;
            (4) its discriminating PAIR: the second run's driver REFUSES, and `done`
                RESOLVES with `outcome: 'stopped'` carrying `stoppedBy` — ADR 0058 rules
                3 and 4, which had no observer at L6 and no observer on real workers;
            (5) what reverting W76 and W77 costs AT L6, measured on the tree that ships;
            (6) P20 stop-and-ask (e) ANSWERED: `examples/run-flow.ts` keeps its own
                termination observer and `done` is asserted BESIDE it.
Depends on: W77 (DONE)
Blocks:     nothing — P20's retro is next
Tests:      examples/l6.ts — expected values from `spec/run-state.md`'s own `isTerminal`
            (the two non-terminal outcomes are `running` and `awaiting_action`), from
            ADR 0058 rules 3 and 4, from `spec/examples/valid/fanout-join.flow.json`'s own
            branch count (two branches, so two `branch.opened` and two `branch.arrived`),
            and from the `uncloneable / OR-R6` row's existing declared `stoppedBy`.
            NOT from this block's output.
Gate:       L0 under all five typecheckers, RUN SEPARATELY where a count is wanted;
            L1-L5 in five runtimes — expected UNMOVED, this item adds no suite;
            L6 in BOTH runtimes — **L6 MOVES and the Record says by how much**;
            `check:docs` over every rewritten snippet, with `RUN_FLOOR` MEASURED;
            `check:markdown`; `check:source`; then the two reader passes and rule 8
            re-run, plus W76's 25 and W77's 34 probes RE-RUN here.
Reserves:   Q324-Q329, ADR 0059 (expected unused)
```

## Scope

**In**

1. **The thirteen copies reduced, and the residue MEASURED.** Not *explained* — measured: one table,
   one row per copy, saying what each snippet still does with `onFoldInput`, the driver or a poll
   **after** `done` has taken the termination, and which of those is a claim the snippet exists for.
2. **`Promise.race` and the `awaiting_action` trap taught.** ADR 0058 rule 8 says *the reference
   teaches `Promise.race`* and rule 3 says a parked run leaves `done` pending; the reference has
   **nowhere** that teaches either, which is what makes this an output rather than a nicety.
3. **One L6 block, two runs, the consumer holding only `{ driver, done }`.** P20's exit artifact.
4. **The revert costs of W76 and W77 at L6**, which is the number P20 has no other way to learn: both
   items declared L6 UNMOVED, so before this block neither had any L6 observer at all.
5. **P20 stop-and-ask (e) answered, in `examples/run-flow.ts`'s own comment**, so the next reader is
   not left with a sentence addressed to an item that is done.

**Out** — named rather than left implicit, with where each goes instead

- **Any change to `src/**`.** This item is an exit artifact and touches no source. P20's Scope Out
  makes `src/driver/driver.ts` a tripwire; `src/scheduler/runtime.ts` is W76's and W77's and is
  finished.
- **A `runtime.run(flow, payload)` beside `start`.** Prediction 3's own named consequence, and
  finding D measures that the reversal does **not** argue for it. Refused by the maintainer at W77's
  stop-and-ask (a) and not reopened.
- **A deadline on `StartOptions`.** ADR 0058 rule 8, decided.
- **`examples/run-flow.ts` CONVERTING to `done`.** Stop-and-ask (e), answered NO with the argument
  measured — see finding E. The destructure W77 made stands; nothing else moves.
- **[Q320](../questions/q320.md), [Q321](../questions/q321.md), [Q322](../questions/q322.md),
  [Q323](../questions/q323.md).** W77's four prices and hazards. This item observes Q320's residue at
  L6 by construction — every L6 run now pays it — and prices none of them further.
- **[Q310](../questions/q310.md) in general** — a `check-docs` clause comparing a snippet's stdout to
  its output comments. What this item owes Q310 is the v0.20 TAUTOLOGY pass over every snippet it
  rewrites, which is in the rule 8 set.

## What this declaration step MEASURED, and what it corrects

*Every fact P20 handed this item was RE-RUN rather than transcribed (`doc/workflow.md` section 1
rule 5's `Inputs` clause). The tree was held still — digest **`a61970de11d961f0` over 364 files**,
identical before the first probe and after the last, `git status` clean at both ends.*

| fact | re-run | verdict |
|---|---|---|
| **3b** | `node dev-dist/p20/fact3b-shapes.mjs` | **REPRODUCES EXACTLY — 13 copies, 135 lines, `M--` x10 / `-PD` x2 / `M-D` x1**, unmoved by W77's three destructures and two comment edits |
| **3** | `node dev-dist/p20/fact3-terminality.mjs` | **MOVED — see finding A** |
| **4** | `node --experimental-strip-types dev-dist/p20/fact4-done.ts` | **EXIT 1 — the harness no longer runs. See finding B**; re-run on a patched copy it reproduces exactly (1 input before `start` returns, canonically identical `RunState`, a `.then` fifty macrotask turns late still receiving `completed`) |
| baseline | `npm run test:l6`, `npm run check:docs`, `dev-dist/p15/census.mjs`, `dev-dist/w74/decl-q142.mjs` | **L6 1627 / 0 failed, EXIT 0, zero FAIL lines**; docs **33: 27 run, 6 check**, `RUN_FLOOR = 27`, `X8` comparing three pairs; census **248 / 191 / 2 / 55, 248 of 248 in one cluster cell, 0 aborts — CONFIRMED**; Q142 `M3 = 107` against **103** (margin 4), `M4 = 4450` against **4331** (margin 119) |

**Five findings. A and B are the same shape and are the THIRD and FOURTH consecutive item to hit it.
C corrects the plan's word for its own artifact. D is prediction 3 REVERSED with its stated
consequence refused on a measurement. E answers stop-and-ask (e).**

### Finding A — **fact 3 MOVED, and W77 is what moved it**

P20's fact 3 walk, as W77's declaration step re-ran it: *12 files, 34 `isTerminal` sites, 23 of them
folding collected inputs*. On this tree:

```
files containing isTerminal: 13     (was 12)
isTerminal call sites:       39     (was 34)
SITES THAT FOLD COLLECTED INPUTS: 26  (was 23)
```

The three new folding sites are all in `test/scheduler/runtime.test.ts`, and the thirteenth file is
`src/scheduler/runtime.ts` itself — **which is `done`'s own `isTerminal`, the one this plan added**.
So the wider walk grew by exactly what W77 built, and the number a reader would quote to say *how
much of this repository hand-rolls terminality* went **up** on the item whose whole purpose was to
make hand-rolling unnecessary.

*That is not a defect — it is the mechanism landing, plus its tests. What it is, is a measured input
that expired between one item and the next, for the THIRD consecutive item in this plan:* W76 found
P20 fact 1's arithmetic wrong, W77 found fact 5c stale **because W76 had moved its inputs**, and this
finds fact 3 moved because W77 moved its inputs. **[Q317](../questions/q317.md)'s shape one level up,
three times in three items** — and the reason it keeps happening here rather than elsewhere is that
P20's facts are measurements **over this repository's own source**, so each item is inside its own
plan's measuring instrument.

**Fact 3b, which is prediction 4's scope, is UNMOVED** — and that is the one that matters, because
3b counts `AGENTS.md` and `README.md` alone and W77 deliberately left the copies there for this item.

### Finding B — **fact 4's HARNESS is broken by W77's own breaking change, and this is the LOUD form of Q253**

`dev-dist/p20/fact4-done.ts` exits **1** on this tree:

```
A  fold inputs before start() returned: 1
A  total fold inputs: 5, outcome completed
B  same RunState as the copied pattern: true
TypeError: driver.snapshot is not a function
```

Its prototype does `const driver = rt.start(f, payload, {…})`, which since ADR 0058 returns
`{ driver, done }`. Patched in a copy (`dev-dist/w78/fact4-done-w78.ts`, two destructures and nothing
else) it reproduces **exactly**, C and C' included.

**W77's finding E is the same row from the third side and this is the fourth**, and the two are worth
telling apart:

| | what a later item did to the harness | what the harness then does |
|---|---|---|
| **W77 finding E** (fact 6A) | falsified a **printed sentence** | still exits 0, still prints, and the line is now a lie |
| **this** (fact 4) | broke the **code** | **exits 1 and names the line** |

*The failure mode that breaks loudly is the safe one*, and the difference between them is exactly
whether the harness's claim is CODE or PROSE. [Q253](../questions/q253.md)'s row is about a harness
that can go vacuous at exit 0; the sharper reading these four instances give is that **a facts
harness's prose is what rots and its code is what breaks**, and only one of the two is visible.

### Finding C — **P20's exit artifact cannot be an `EXPECTED` row, and the plan's word for it is loose**

P20's work-items row says *one L6 **row** where the consumer holds only what `start` returned*. An
`EXPECTED` row in `examples/l6.ts` runs through `runFlow`, and `runFlow` **is** the machinery this
artifact exists not to use: it installs its own `onFoldInput`, keeps its own `inputs` array, races a
declared predicate against a backstop timer, and derives `finishedBy` from which won. A row cannot
hold only `{ driver, done }` by construction.

**The precedent is W67's own exit artifact**, which is two `EXPECTED` rows **plus the SHIM RUN** —
`runtime.start(flow, payload)` with no options, added outside the row loop by that item's adequacy
reader for exactly this reason: *every row names the ids it expects and the policy it is about, so
the no-options call was a call no row could make.* This block is the same shape one plan on: **one
labelled block, TWO runs, outside the row loop**, counted in the run total and bound by
`CROSS_ROW_SUBJECTS` rather than by `ROW_KEYS`.

*Recorded because the plan's Record and its retro will read `L6 MOVES and this row says so`, and what
moves is the RUN count and the assertion count and not the row-label count.*

### Finding D — **P20 prediction 3 REVERSES, and its own stated consequence is refused by a measurement**

> *"**REACH: no consumer wants `done` without also wanting the driver** … what would reverse it: an
> L6 row or a reference snippet that uses `done` and never touches the driver, which would argue for
> a `runtime.run(flow, payload)` beside `start`."*

**It reverses, on the snippet a consumer meets first, and harder than this finding first said.**
`AGENTS.md` §2 — the getting-started snippet, Q293's own raising site, and `README.md`'s first —
reads `state.nodes` and `state.outcome` and **touches the driver nowhere**: after reduction its call
is `const { done } = runtime.start(flow, { text: 'hello' });`.

*(**This paragraph then named "§12's wired snippet, §12's custom-group snippet and §15's session",
and it was wrong in BOTH directions** — W78's conformity reader, finding 4, and the author had spotted
half of it. It was written from the plan before the reduction existed and never re-taken, which is
section 1 rule 5's WHEN clause on the one paragraph in this file that is a claim about the shipped
tree. **§12's wired snippet is the snippet that most wants the PAIR** — the comment this item wrote
directly above it says *"this is the one snippet here that wants BOTH halves of what `start`
returns"*, because `driver.runId` is readable the instant `start` returns — and three more snippets
that ARE driver-free were omitted. Re-taken by walking every `runtime.start(` in `AGENTS.md`:)*

| use `done` and **never touch the driver** — SIX | hold BOTH halves — THREE |
|---|---|
| §2 `:119`, §5 *what a join carries* `:741`, §5 *the same on the RUNTIME* `:845`, §10 `OR-R11` `:1633`, §12 custom group `:1810`, §15 `:2530` | §7 `:954` (`driver.snapshot`, `driver.resolve`), §10 frozen handles `:1520` (the two pull handles), §12 wired `:1733` (`driver.runId`, before the run ends) |

**And the consequence does not follow.** A `runtime.run()` would exist to save a consumer from
holding a `driver` they do not want; the BREAKING road already costs them **one destructured name
they omit**, which is `const { done } =` against `const { driver, done } =`. So the reach prediction
is false **two of every three times** and the argument it was carrying — *the two roads are the same
thing to every caller* — is **false in the direction that favours the road taken**: on the additive
road (`Driver & { done }`) a consumer who wants only completion holds a whole `Driver`, and on the
breaking road they hold a promise. *A reach prediction can reverse and strengthen the decision it was
written against.*

### Finding E — **stop-and-ask (e): `examples/run-flow.ts` does NOT convert, and the reason is measurable rather than cautious**

P20's safe answer is *the harness keeps its own observer and `done` is asserted beside it*. Measured
rather than accepted: `runFlow` reports `finishedBy: 'run-state' | 'backstop'`, derived from
`Promise.race([finished, backstop])`, and **every row asserts it was `'run-state'`**. That assertion
exists because W5's adequacy reader replaced the whole termination mechanism with `setTimeout(1)` and
**all 72 L6 assertions still passed** — it is ADR 0014's own Correction, and the claim it carries is
that the run was over *when the run-state predicate said so* rather than *when a clock did*.

`await done` would end the wait with no `finishedBy` to report: the promise names no winner, because
it is not racing anything. So converting deletes the assertion ADR 0014 was corrected to carry —
**obligation (c)'s LIMIT, where the clause has exactly one observer and the probe removes it.**

**The answer is therefore: the harness keeps `finishedBy`, and `done` is asserted BESIDE it** — the
one place a second observer costs nothing, because `done` and the harness's own predicate are
statements about the same run and must agree. That is a **second independent expression over the same
fact** rather than a replacement, which is what the LIMIT prescribes. It is a **stop-and-ask, so it
goes to the maintainer** with the measurement above.

## Stop and ask a human

- **(e), P20's own, ANSWERED above and put here for the maintainer.** `examples/run-flow.ts` keeps
  `finishedBy`; `done` is asserted beside it in the new L6 block only, which holds no `runFlow`
  machinery at all. Recommended.
- **(g) Where the `awaiting_action` trap and `Promise.race` are taught.** §7 (*The human in the
  loop*) is the only section whose subject is a run that does not end by itself, and its snippet
  already polls for `awaiting_action` and carries a deadline — so it is where both land with no new
  snippet. The alternative is a new `## ` section, which costs a `run` snippet and moves `RUN_FLOOR`.
  **Recommended: §7, plus one bullet in §8 (Run state) and one in §10 (Common mistakes).**
- **(h) Whether §5's *What a join carries downstream* keeps `onFoldInput`.** It uses `inputs` twice:
  for termination, and to read the branch **settlement order**, which is the claim *the collection is
  independent of the order* rests on. `done` takes the first; the second cannot be derived from a
  `RunState`, because the fold is order-free by construction. **Recommended: keep `onFoldInput`, and
  say in the snippet that what it is for is the ORDER and no longer the end.**

## Exceptions — seeded from P20's table, then MEASURED

| path | seeded as | measured |
|---|---|---|
| `AGENTS.md`, `README.md` | **this item's** ("W78 owns the rest") | **CONFIRMED and both are in `Owns`.** `X8` holds three README fences byte-equal to AGENTS §2, *The same on the RUNTIME…* and §15 — and **all three are copies this item reduces**, so every one is two identical edits or the check goes red. `README_SNIPPETS` and `README_SNIPPET_FLOOR` are **predicted UNMOVED**: no pair is added or removed |
| `examples/l6.ts` | this item's | **CONFIRMED and in `Owns`.** `ROW_KEYS` is **predicted UNMOVED** (finding C: this is not an `EXPECTED` row); `CROSS_ROW`, `CROSS_ROW_SUBJECTS`, `DECLARED_TOTAL` and the run count all move, and v0.18 requires the subject list to name this block's **CONTROLS** beside its claims |
| `examples/README.md` | this item's | **CONFIRMED and in `Owns`.** Its L6 counts (`1627 assertions over 53 real runs`, in two places) go stale the moment the block lands — W71's, W72's and W74's late exception on the same two paragraphs, taken UP FRONT here |
| `examples/run-flow.ts` | **CONDITIONAL on stop-and-ask (e)** | **NEEDED EITHER WAY, and it is in `Owns`.** Whatever the answer, its comment at line 1759 addresses stop-and-ask (e) *"which is W78's to answer"* — a claim with an expiry date naming this item, found by the grep section 1 rule 5 prescribes |
| `scripts/check-docs.mjs` | this item's, *"`RUN_FLOOR` is a ratchet an item that adds or removes a `run` snippet must move — [Q102](../questions/q102.md)'s shape, live for six plans. **W78 may REMOVE snippets, which is the direction that lowers it**"* | **CONFIRMED UNNEEDED, and MEASURED rather than predicted-and-left** (W74's defect on this exact row): this item removes no `run` snippet — it reduces the block INSIDE ten of them, so the fences, their tags and their count are untouched. `check:docs` reports **33 snippets: 27 run, 6 check — UNMOVED**, and `RUN_FLOOR` stays 27. *No item has yet taken that ratchet downward and this one does not either* |
| `scripts/check-docs-selftest.mjs` | **the row above covered it and predicted it UNNEEDED** | **WRONG, and it is this item's ONE LATE exception — found by the CONFIRMING GATE at `GATE EXIT=1`, ONE FAIL line.** `check:docs:selftest`'s `X4` probe *a snippet that stops producing its stated result* anchors on `if (!accepted || again) throw` in `AGENTS.md` §7, and **this item's own fix for the conformity reader's findings 10 and 11 turned that `throw` into a `reject`** — so the probe reported *the mutation matched nothing*, which is **rule 7 (b) firing correctly rather than passing**. Re-anchored AGNOSTICALLY on the CONDITION alone rather than re-pinned to what follows it: **33/33 probes caught, zero FAIL lines**. *The fix for a reader's finding un-anchored a probe in a file this item does not own, and the GATE is the only thing that could have said so* — the same self-test W74's conformity reader found red one plan earlier, for the mirror reason |
| `scripts/check-markdown.mjs` | predicted UNNEEDED | measured at this declaration: `M3 = 107` against **103**, **margin 4**; `M4 = 4450` against **4331**, **margin 119**. This item adds ONE markdown file, in `doc/work-items`, which **neither probe cuts** — so the `M3` fixture goes 103 → 104, **margin 3**, and this file's links and the record step's index paragraphs both land inside `M4`'s lower bound. **`M4` is the tight one and it is predicted NOT to fire; re-measured before the record step** |
| `scripts/check-source.mjs` | predicted UNNEEDED | no new gate entry, no new published module, no `src/**` file, no construction under `src/scheduler/**` for `S16`. *`S16`'s scope is the published set and `examples/**` is outside it (W74's finding), so this block constructing nothing is not what keeps it green* |
| `src/**` | **predicted ZERO edits, and it is a SCOPE TRIPWIRE** | an exit artifact that edits source has stopped being one. Measured at the build |
| `test/definition/l4-corpus.test.ts` | **NOT SEEDED — W76 took it LATE and W77 took it UP FRONT** | **predicted UNNEEDED and declared anyway**: the suite census is a standing obligation on any item adding a `.test.ts` suite, and this item adds none. Named here so the prediction is on the record rather than absent |
| `scripts/build-browser-tests.mjs` | **NOT SEEDED — W76 and W77 both took it LATE** | **predicted UNNEEDED**: it inlines fixtures a `test/**` suite reads, and this item edits no suite. **W77's row for it says *PREDICTED ZERO EDITS AND THE PREDICTION WAS WRONG*, twice in two items, so it is named rather than omitted** |

## Verification

How each clause of `Gate:` is run. **Every rung is RUN and redirected to `dev-dist/w78/`, never
piped, and read by `$?`; a green claim carries the exit code AND the `FAIL` count or neither**
(`doc/workflow.md` section 4, and W77's *What broke* (11) — redirecting is what makes the exit code
available and it does not make anyone read it). Node 24 asserted in every shell.

| clause | command |
|---|---|
| L0, all five typecheckers | `npm run typecheck > … 2>&1; echo "EXIT=$?"` — and the five lanes RUN SEPARATELY where a count is wanted |
| L0, lint | `npm run lint > … 2>&1; echo "EXIT=$?"` |
| L1-L5, three runtimes | `npm test > … 2>&1; echo "EXIT=$?"` — expected UNMOVED |
| L1-L5, the other two browsers | `npm run test:browser:all > … 2>&1; echo "EXIT=$?"`, then `grep -c "^\s*FAIL"` beside the exit code |
| L6, both runtimes | `npm run test:l6` and `npm run test:l6:deno` — **expected to MOVE, and the Record states the new numbers and the arithmetic** |
| `check:docs` | RUN and redirected — every rewritten snippet executes, and `RUN_FLOOR` is **measured** |
| `check:markdown`, `check:source` | each RUN and redirected, expected green |
| whole gate | `npm run gate > … 2>&1; echo "GATE EXIT=$?"`, tree held STILL, content digest at both ends |
| revert costs | W76's forwarding line and W77's `done` machinery each reverted ALONE against L6, and both together, each read by `$?` and by the FAIL count |
| rule 8 | `node dev-dist/w78/rule8.mjs`, twice — the author pass and a re-run with the readers' exact edits checked back in. **Every probe that awaits a promise is BOUNDED and every real scheduler is shut down in a `finally`** ([Q323](../questions/q323.md)), and the harness writes its originals to disk before the first edit so a kill leaves the tree restorable |
| **W76's 25 and W77's 34 probes, re-run HERE** | the dated-ceiling clause: this item rewrites `AGENTS.md` §10, which W76's `b1`/`b2` anchor on, and every snippet W77's `check:docs` probes reach. [Q317](../questions/q317.md) is read before any DECLARED verdict from either set is trusted |
| both readers | conformity and adequacy per section 6, adequacy in an isolated copy, both reading P20, ADR 0014 and ADR 0058 before the artifact |

*This item touches routing not at all. A branch routed away from its join (Q4), `user_action` (Q17),
no matching decision edge (Q10), a duplicate task id (Q13) and a nested fan-out (Q6) are **not
applicable**: nothing here changes what is dispatched, what a node receives or what a join decides.
It runs a fan-out and a refusal on real workers and reads what `start` handed back. The one thing it
does reach is `user_action` as a STATE the reference must now teach, because `awaiting_action` is the
outcome `done` waits through.*

## Record

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w78/`, never piped, read by `$?`
**with the `FAIL` count printed beside it** (W77's *What broke* (11): redirecting makes the exit code
available and does not make anyone read it). Node 24.20.0 asserted in every shell.

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint` | **RAN, green** | `deno lint src/ test/ examples/ index.ts` |
| L0 — all five typecheckers | **RAN, green** | **run SEPARATELY**, five exit codes read one at a time, because `typecheck` is five lanes joined by `&&` and a chained rung reported RED reports its FIRST failure and is silent about everything downstream |
| L1-L5, five runtimes | **RAN, green — UNMOVED at 44 files / 1269 assertions** | node 24.20.0, deno 2.9.6, chromium, firefox and webkit, each `EXIT 0` with zero FAIL lines. This item adds no suite, which is what the Gate line declared |
| **L6, node and deno** | **RAN, green — 1639 assertions, 0 failed, 55 real runs, in BOTH runtimes**, from 1627 / 53 | **L6 MOVES and this is by how much**: +12 assertions and +2 runs, all of them the consumer-road block, which is one label outside the row loop. `ROW_KEYS` is UNMOVED at 48, so the ROW-LABEL count does not move and the printed table still reads 50 labels — finding C's consequence |
| `check:docs` | **RAN, green** | **33 snippets: 27 run, 6 check — `RUN_FLOOR` UNMOVED**, measured rather than predicted-and-left (W74's defect on this exact row). This item removed no `run` snippet: it reduced the block INSIDE ten of them. `X8` still compares its three README pairs byte for byte, and all three are pairs this item rewrote |
| `check:source` | **RAN, green** | the seeded *predicted UNNEEDED* MEASURED — no new gate entry, no `src/**` file for `S6`, no construction for `S16` |
| `check:markdown` | **RAN, green** | **137 documents / 5959 relative links / 294 anchored**, re-taken on the tree that ships. *(This row read 5921 / 290 — the figure from before the record step's own six files, which is section 1 rule 5's WHEN clause failing inside the Record that quotes it. Caught by re-reading the table, not by a rung.)* |
| conformity reader | **RAN** | **18 findings, 9 BLOCKING** — and its central obligation came back with **ZERO disagreements on the VALUES**. It re-derived on paper, before reading any output, the fan-out's two opens and two arrivals with their branch paths, both runs' outcomes, `stoppedBy`'s prefix from `failRun`'s own formatting, the RULE that licenses the fold equality, the assertion arithmetic 141 → 153 and 1627 → 1639, and the revert costs; all matched. It also **rebuilt the W76 tree from scratch** to confirm finding A independently |
| adequacy reader | **RAN** | **35 mutations, 13 real survivors, 7 BLOCKING**, every survivor given as an exact edit with its rungs, exit codes and FAIL counts |
| overlap | **2 — the FORTY-NINTH measurement**, inside the 0-4 band, neither reader primed | the two shared subjects are **the `settledA ?? foldedA` fallback** (conformity 9 / adequacy `S3`, reached by reading the clause and by mutating it) and **`AGENTS.md`'s `await person` line** (conformity 10+11 / adequacy `S13`) — *and the two readers disagreed about that second one*: conformity called it dangerous (unbounded, and its rejections fatal) and adequacy called it inert (deletable for zero, and Node surfaces the rejection either way). **Both are right and they are about different halves**, which is the clearest instance yet of *the second reader finds what the first was not looking for* |
| rule 8, author pass | **RAN, and it EARNED its place** | 23 probes: control green, 13 caught, 7 declared ceilings, **1 UNDECLARED survivor**, 0 crashes, 0 timeouts, 1 abort (an anchor's indentation). The survivor was §7's `Promise.race`, armed AFTER the person had already resolved the parked task — *a deadline written where it cannot lose* |
| rule 8, RE-RUN with the readers' exact edits checked back in | **RAN** | **33 probes: 1 control green, 20 CAUGHT, 12 declared ceilings RUN, 0 UNDECLARED survivors, 0 crashes, 0 timeouts, 0 aborts, 0 against declaration.** All NINE reader edits are probes; five FIRE and four are declared with a stated reason and a NAMED second route. Digest identical at both ends of every pass |
| **W76's 25 and W77's 34 probes, re-run HERE** | **RAN — 23 + 28 caught, 1 + 5 declared ceilings, ZERO catches** | `doc/workflow.md` rule 8's dated-ceiling clause, in the item that rewrites both files their anchors live in. **Both predecessor sets hold entirely on this tree**, and the digest is identical at both ends of each |
| revert costs at L6 | **MEASURED on the tree that ships** | **W76 alone 2, W77 alone 8, both 10 — additive.** Before this block each cost **ZERO**: both items declared L6 UNMOVED and nothing at this rung reached either half. *W77's read 4 until the conformity reader's finding 9; the two clauses that were self-comparing are the difference* |
| [Q142](../questions/q142.md) | **measured, does NOT fire** | `M3 = 107` against a fixture of **104** (margin 3), `M4 = 4450` against **4382** (margin 68), re-measured AFTER the record step — the tightest that bound has been at any item here, and it holds. *(It read 4347 / margin 103 before the record step's six files.)* |
| census | **252 / 195 / 2 / 55**, 252 of 252 in exactly one cluster cell, **0 aborts** | from 248 / 191 / 2 / 55, by `dev-dist/p15/census.mjs` unchanged: Q324-Q327 raised and placed, none resolved; Q328-Q329 unused and SPENT. **The register's headline was CORRECT on arrival for the first time in five items**, because W77 fixed it at its own record step rather than leaving it to its successor. *(This row read 248 / 191 — the figure from BEFORE this item's own four rows: the same WHEN-clause defect as the `check:markdown` row above, in the same table, found in the same pass.)* |
| `Owns` audit | **ONE LATE exception, declared before the Record** | `git status --porcelain` by hand: `Owns` (5 files) + the six record-step files + this file + **`scripts/check-docs-selftest.mjs` LATE**, found by the confirming gate rather than by reading. **`src/**` ZERO edits, so P20's scope tripwire is clean**, and `scripts/check-source.mjs`, `scripts/check-markdown.mjs`, `scripts/build-browser-tests.mjs` and `test/definition/l4-corpus.test.ts` are all UNTOUCHED — four seeded predictions, all four CONFIRMED |
| `npm run gate`, CONFIRMING (first run) | **GATE EXIT=1, ONE FAIL line** | `check:docs:selftest`'s `X4` probe reporting *the mutation matched nothing* — rule 7 (b) on an anchor §7's restructure moved. Digest `6e0414786b8b6f70` over 365 files, **IDENTICAL before and after**, so the tree did not move while it ran |
| `npm run gate`, CONFIRMING (over the final tree) | **GATE EXIT=0, ZERO lines beginning `FAIL` at any indent**, `selftests` **8/8 completed, 8 ok, 1032.5 s wall over 6 lanes** (`dev-dist/w78/gate-final.log`) | `check:spec` **7 / 61 / 107 — UNMOVED**; `check:docs` **33 snippets: 27 run, 6 check — UNMOVED**, `X8` still comparing its three README pairs byte for byte, and all three are pairs this item rewrote; `check:source` **23 published files, 16 gate entries**; `check:markdown` **137 documents / 5959 links / 294 anchored**; L1-L5 **44 files / 1269 assertions in node 24.20.0, deno 2.9.6 and chromium — UNMOVED**; **L6 1639 assertions, 0 failed, 55 real runs on `fyflow-scheduler` 0.5.2 in BOTH runtimes**. Digest **`0d71a47a11b12f87` over 365 files, IDENTICAL before and after**, with no edit made while it ran. **The only edits after it are in this file** — these gate rows, the late-exception rows, and the two Record numbers re-taken below — and `check:markdown`, the only rung that reads `doc/work-items/**`, was re-run over them: **137 / 5959 / 294, EXIT 0, zero FAIL lines** |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the thirteen copies reduced, the residue MEASURED | **yes — 13 → 1, 135 lines → 16** | `b1` (§2's reduction reverted in `AGENTS.md` alone): `check:docs` red at `X3`/`X4`/`X5`. **The reduction itself has NO RUNG** — re-expanding every block to the old hand-rolled shape is green everywhere, and the only thing that counts them is an UNTRACKED harness ([Q324](../questions/q324.md)) |
| (2) `Promise.race` and the `awaiting_action` trap taught | **yes** — §7's snippet, §8's three bullets, §10's three bullets | `b3` (§7's deadline made to fire immediately): `FAIL X4`, so the race is LIVE. `r-c1` (the decision made to fail): caught. **`r-a1` is a declared ceiling and the declaration is the finding** — a timeout on a correct tree never fires, so nothing a correct run does can observe that it is there |
| (3) ONE L6 block, TWO runs, the consumer holding only `{ driver, done }` | **yes** | `a1`, `a2`, `a3` (the two `src/` lines reverted): 2, 8 and 10. `b2` (an `onFoldInput` passed after all): the option-key membership names it. `a4` (the forwarding narrowed by variant): the element-for-element equality |
| (4) the discriminating PAIR — `done` RESOLVES `stopped` | **yes** | `a5` (run B given run A's flow): 3 failures. **ADR 0058 rules 3 and 4 had no real-worker observer anywhere** before this: W77's `stopped` cases are on the recorded seam and its one real-scheduler case asserts `completed` (the conformity reader confirmed it) |
| (5) the revert costs at L6 | **yes — 2 / 8 / 10** | the numbers are the output; `a1`-`a3` are how they are taken, in a harness with a control, per-rung timeouts, crash discrimination and a digest at both ends |
| (6) stop-and-ask (e) ANSWERED | **yes** — `examples/run-flow.ts` keeps `finishedBy` | `f2` is a declared ceiling: a comment is bound by nothing. **The ARGUMENT was wrong and the conclusion right** — see *What broke* (2). The adequacy reader tested the conclusion: replacing the harness's race with a 1500 ms clock resolving `'run-state'` costs **5** L6 failures, so ADR 0014's Correction is still load-bearing |

**The residue, MEASURED — Output (1).** *(`node dev-dist/p20/fact3b-shapes.mjs`, before and after.)*

**Thirteen copies and 135 lines become ONE copy and 16.** Ten sites in `AGENTS.md`, three of which
`README.md` carries byte-equal under `X8` and which moved identically.

| | site | before | what SURVIVES, and why |
|---|---|---|---|
| 1 | §2 / README *Getting started* | 9, `M--` | **nothing.** `const { done } = runtime.start(…)` — Q293's own raising site, and it never touches the driver |
| 2 | §5 *What a join carries downstream* | 6, `M--` | `onFoldInput`, for the **settlement ORDER**: a `RunState` is order-free by construction, so *which branch finished first* is a fact only the input SEQUENCE carries — and it is what the snippet's central claim is measured against (stop-and-ask (h), answered as recommended) |
| 3 | §5 *The same on the RUNTIME* / README *A flow that decides* | 7, `M--` | nothing — two runs become two promises |
| 4 | §7 *The human in the loop* | 29, `-PD` | the **POLL**, because `awaiting_action` is not terminal and `done` waits through it: *a promise cannot tell you a run has PARKED, because parking is not the end.* And the **race**, which is now the deadline the library does not ship |
| 5 | §10 frozen handles | 11, `-PD` | `onFoldInput` **IS one of the four handles the snippet is about**, and `driver` for the other two |
| 6 | §10 `OR-R11` | 11, `M-D` | `onRunFailure`, for the failure KIND — and `done` **ADDS** the `stopped` half beside it |
| 7 | §12 wired | 12, `M--` | `driver.runId`, readable the instant `start` returns. **The one snippet that wants the PAIR** |
| 8 | §12 custom group | 6, `M--` | nothing |
| 9 | **§12 the driver with NO SCHEDULER** | 16, `M--` | **everything. There is no runtime, so there is no `done`** — the structural residue, and the only copy left |
| 10 | §15 / README *Checking a flow before it runs* | 6, `M--` | nothing |

**Four reduce to nothing but `done`; five keep a callback for a DIFFERENT fact; one cannot reduce at
all.** So **prediction 4's reversal condition is HALF right and the half is measurable**: five of ten
survive because they teach something else, and in every one of the five `done` deleted the
TERMINATION and not the snippet. *(Not a copy and correctly untouched: §9's refusal snippet, which
waits for `onRunFailure` rather than for terminality.)*

**Prediction 4's own verdict depends on which line count you pick, and it names neither.**

| | |
|---|---|
| lines inside the copies | **135 → 16, so 119 removed** |
| P20 adds to `src/` | **171 insertions / 8 deletions**, of which **26 are CODE** (24 `runtime.ts` + 2 `index.ts`); the rest is comment |
| this item alone, `AGENTS.md` + `README.md` | **117 insertions / 152 deletions = net −35** |

**HOLDS** against code lines (119 against 26, 4.6x) and **FALSE** against raw lines (119 against
171). And the reference shrank by only 35 net, because ~84 lines went back in as the teaching ADR
0058 leaves to it. *In a repository whose `src/` is majority comment by convention, "lines added to
`src/`" is ambiguous by a factor of six* — [Q326](../questions/q326.md).

**What broke.**

1. **The readers found SIXTEEN blocking things between them and the sharpest was ONE EXPRESSION, found
   from both ends.** `stateA: settledA ?? foldedA` was a reporting convenience: it existed so the
   clauses below would name which claim failed rather than dying on a null. What it did was hand two
   of them **the caller's own fold**, so on a tree where `done` never settles the invariant compared
   `foldedA` with itself — P20 decision 2's headline claim, one route compared with itself, which is
   the shape W77's adequacy reader closed with a source binding **one item ago**. Measured then: the
   W77 revert cost **4**, and the two clauses that did not fire were exactly those two. It costs **8**
   now. *The convenience was written by the author who had just read that finding.*

2. **The stated reason for stop-and-ask (e) was refuted by this item's own L6 block, three files
   over.** `examples/run-flow.ts` argued that `await done` "ends the wait with no winner to name,
   because it races nothing"; `examples/l6.ts` races `done` against a deadline and asserts which side
   won, in a comment that calls itself *`finishedBy`'s analogue*. **The conclusion survives on a
   reason the comment did not give**: with `done`, `finishedBy: 'run-state'` would mean *the
   LIBRARY's own fold said so* rather than *this harness's own clock-free predicate did*, which is
   the sensor corroborating itself. The adequacy reader then tested the conclusion — a 1500 ms clock
   resolving `'run-state'` costs **5** L6 failures — so ADR 0014's Correction is still load-bearing.

3. **Q323 reproduced ONE LINE OVER, inside the block written to close it.** The first version raced a
   deadline and then wrote `const stateA = await done;` on the next line, unbounded. Green on a
   correct tree; it hung for ever the moment the revert-cost measurement stopped `done` settling.
   *W77's was one CASE over; this is one LINE over, in its successor.*

4. **A killed background job kept running and mutated the tree under my own measurements.** The hung
   run was stopped by killing `node.exe`; the PYTHON PARENT survived, kept editing
   `src/scheduler/runtime.ts` and reported hours later. Section 6's *a measurement over a moving tree
   is a claim about no tree*, from a direction it does not name: not the author editing while a reader
   reads, but **a harness the author believes is dead**. What restored the tree was Q323's other half
   — the originals written to disk before the first edit — used by hand.

5. **And that harness reported the KILLED rung as ZERO COST**: `W77 alone … EXIT=1  FAIL lines: 0`,
   in the same column that carries a real 2 or 10. It had no timeout, no crash discrimination and no
   control, because it was a measurement harness rather than a rule 8 one and nothing obliged it to
   be. **The authoritative revert costs are the rule 8 probes**, which carry all three.
   [Q327](../questions/q327.md).

6. **§7's `Promise.race` was written where it could not fire** — the author pass's one undeclared
   survivor. The deadline was armed AFTER the poll had already resolved the parked task, so `done`
   was settled before the race began and a 0 ms timeout changed nothing. *A deadline written where
   its other side has already lost demonstrates the shape and cannot exercise it* —
   [Q325](../questions/q325.md). Restructured to race the decision; the probe now costs `X4`.

7. **And the restructure put the defect back one line along, which is why the readers matter.** With
   `person` awaited AFTER the race, a run that never parks leaves the poll looping for ever, and its
   three `reject`s reached a promise nothing had attached to yet — `ERR_UNHANDLED_REJECTION`.
   **Both are one fix**: `Promise.race([Promise.all([done, person]).then(([s]) => s), nobodyCame])`.

8. **`r-c1b` was DECLARED a crash and MEASURED a catch.** The reader saw Node kill its own child
   fatally; through `check:docs` the same death arrives as `X4`, exit 1, one named FAIL line, because
   `X4` runs each snippet in a child and reports a non-zero exit whatever killed it. **So at that rung
   the two shapes are indistinguishable** — [Q138](../questions/q138.md) one document across — and the
   *crash versus detection* discrimination the pair was written for does not exist there.

9. **The item's own finding D was wrong in BOTH directions**, written from the plan before the
   reduction existed and never re-taken: six snippets are driver-free and **§12's wired snippet is not
   one of them** — it is the snippet whose own comment, written by this item, says it wants both
   halves. Section 1 rule 5's WHEN clause on the one paragraph in the file that is a claim about the
   shipped tree. Re-taken in place.

10. **Three stale claims the reduction created and a fourth it inherited**: `AGENTS.md` §2 still said
    `createRuntime` "hands back a `Driver` per run" while its `README.md` twin had been corrected by
    W77 — the two documents disagreeing on one sentence, in the direction section 1 rule 5's THIRD
    clause names; `README.md` carried **1627 / 53** in two places while `examples/README.md` was
    updated, which is [Q171](../questions/q171.md) verbatim and the sentence that page carries about
    itself; **ADR 0058's Context cited a phrase this item DELETED** (*"load-bearing rather than
    decoration"*), moved to §8 where the teaching now lives; and §7 claimed to be "the only deadline
    advice this document has" in a document to which this item added three more.

11. **`examples/l6.ts`'s own header omitted the block** — the row table and the plan list — in the
    file whose header carries a monument to exactly that defect, and which already lists W67's SHIM
    RUN, which is not a row either. **Twice now, and both times the item that added the rows wrote the
    monument and not the entry.**

13. **The CONFIRMING GATE went RED at `check:docs:selftest`, in a file this item does not own, and the fix for a READER's finding is what did it.** The `X4` probe *a snippet that stops producing its stated result* anchors on `if (!accepted || again) throw`; §7's restructure — made to close the conformity reader's findings 10 and 11, which were that `person`'s rejections reached a promise nothing had attached to — turned that `throw` into a `reject`. The probe reported **the mutation matched nothing**, which is rule 7 (b) working: a probe whose edit matches nothing FAILS rather than passing for the wrong reason. Re-anchored agnostically on the condition alone; **33/33 caught**. *No rung below the whole gate could have said so*, and it is the same self-test W74's conformity reader found red one plan earlier — there because the item MOVED the last fence, here because it moved a keyword inside one.

12. **A shell heredoc ate `\n` escapes again** ([Q272](../questions/q272.md)), in the patch that was
    splitting a probe into a discriminating pair — the harness stopped parsing. Written as a file and
    the multi-line literals hoisted to named constants, which is the shape that cannot recur.

**What this taught.**

**An exit artifact whose deliverable is a DOCUMENTATION reduction has no rung, and this is the first
item in twenty plans where that is the central output.** Re-expanding all ten blocks to their
hand-rolled shape is green on `check:docs`, `check:markdown`, every typechecker and L6; the snippet
COUNT is what `X4` binds, and the count does not move. The only thing that measured 13 → 1 is an
**untracked harness in `dev-dist/`** — which is [Q253](../questions/q253.md)'s row about the
PRODUCT rather than about a facts harness, and it is [Q324](../questions/q324.md).

**And the same item shows the two halves of that row apart.** P20 fact 6A's printed line was
falsified by W76 and the harness still exits 0 printing a lie; P20 fact 4's CODE was broken by W77's
breaking change and it exits **1** naming the line. *A facts harness's prose is what rots and its
code is what breaks, and only one of the two is visible.*

**A CONTROL that guards EMPTINESS does not guard VACUITY, and an IDENTITY control does.** v0.18 asks
a membership to name its controls beside its claims; this block named three, and the adequacy
reader's test — *make each claim vacuous without tripping its control* — defeated all three, because
a re-sourced list is exactly as non-empty as the list it came from. **The two identity controls that
replaced them refuse the two sides of a comparison BEING one value**, which is the whole of that
probe class and is what a length reading cannot be. The third was worse than weak: it asserted
`stoppedBy` is a non-empty string, which the claim beside it ENTAILS, so no tree could make it fire
alone — *a control entailed by its own claim is a fourth claim*. That is v0.18's clause **followed
and short for the third and fourth time**, after W63's block and W58's, and it is P17's retro's own
finding one layer in: the list named the controls and the controls named the wrong property.

**Projection at capture is what made one half of this block immune and a reference the other half.**
Run B was projected to `outcomeB`/`stoppedByB` the moment its promise settled and was unbreakable by
a source swap; run A handed the clauses an object and **one token** re-sourced it to the caller's own
fold. *One block, two shapes, and the projected one survived* — which is obligation (c)'s procedure
answered by a coding habit rather than by a second observer.

**Questions raised.** [Q324](../questions/q324.md) (a documentation reduction has no rung and its only
measure lives in no commit), [Q325](../questions/q325.md) (a deadline taught in a position where its
other side has already lost), [Q326](../questions/q326.md) (*lines added to `src/`* is ambiguous by a
factor of six here, and prediction 4 names neither count), [Q327](../questions/q327.md) (a killed
harness that keeps running, and a measurement harness that reports a killed rung as zero cost).
**Q328 and Q329 reserved and unused, so they are spent. ADR 0059 not taken.**
