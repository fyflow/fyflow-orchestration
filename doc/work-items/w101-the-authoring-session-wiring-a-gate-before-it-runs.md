# W101 — the authoring session: wiring a gate before it runs

**Status:** done — 2026-09-30; see the Record. *(This read `in progress` until 2026-10-03, while this file's own Record read `DONE 2026-09-30, and it is P25's EXIT ARTIFACT`. Found by `npm run state`. [W114](w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md))* Declared 2026-09-30 on the tree [W100](w100-what-a-key-path-must-satisfy.md)
ships ([W99](w99-what-a-route-guarantees.md) and W100 both DONE; highest W on disk 100; the register's
live table gives Q417, with W100's Q418-Q419 reserved-and-unused and therefore SPENT; `ls doc/decisions`
gives 0068). **Reserves Q420-Q424** — P25's block, and the plan expects **W102 unused and ADR 0069
skipped**. **This is P25's EXIT ARTIFACT**, so it takes no ADR and writes no `spec/` rule.

**Plan:** [P25](../plans/p25-what-a-route-guarantees-about-the-value-it-carries.md) — *what does a gate's
ROUTE guarantee about the value it carries?* W99 said what a route GUARANTEES and W100 what a KEY PATH
must satisfy. **This item is the pair of them from the AUTHOR's chair**, which is where P25 says the
answer has to land: an authoring session a human can watch, EXECUTED by `npm run gate`, with its
`README.md` twin held byte-equal by `X8`.

```
Spec:       none — an exit artifact writes no rule. It DEMONSTRATES spec/flow-definition.md section 3's
            *what the schemas buy an author* subsection (v0.26) and ADR 0068, both halves.
Owns:       AGENTS.md section 20, README.md's *Wiring a gate before it runs*,
            examples/getting-started/{classify,per-owner,skipped}.ts,
            scripts/check-docs.mjs (the X8 pairing entry and both floors)
            — drawn from P25's work-items row and its seeded exceptions table (section 7 rule 2),
            whose rows for examples/l6.ts, examples/flows/tv-ingest.flow.json and
            examples/registry.json are WRONG for this item and are corrected there.
Inputs:     ADR 0068 and both its halves as W99 and W100 shipped them; `keyResolvedRoutes` and
            `GateContext` in src/definition/types.ts; `checkWiring`'s gate arm and `keyPathRefusal` in
            src/definition/wiring.ts; `distinct`'s own declaration in src/definition/validate.ts;
            AGENTS.md section 15 (W74's authoring session, this one's shape) and section 19 (W94's
            gate section, which teaches the RUN where this teaches the WIRING); P25 prediction 3.
Outputs:    (1) an authoring session `npm run gate` EXECUTES, whose subject is a CONSUMER'S OWN gate
                type — P25 prediction 3's reach, since the corpus has one gate and it is `distinct`
            (2) a misspelled key path named before anything runs, at whichever STEP it sits, with the
                gate, the key, the schema's own words and the ROUTE in the reason
            (3) the refusal shown to be the ROUTE's and not the gate's: ONE consumer, TWO arcs, two
                verdicts in one report, because `over` is key-resolved and `nokey` is not
            (4) the guarantee shown DOING something: the same arc reads `no` with the type's
                declaration removed, which is what the declaration buys
            (5) the run, on a real FyflowScheduler through createRuntime — one run over five files, so
                the gate's memory is shared, and the quota is asserted per KEY rather than per file
            (6) the three silences named in prose, each measured: an entry gate, a gate into a join,
                and an `enum` container (Q416, Q415, Q417)
Depends on: W99 and W100 — this item reads what they shipped and adds no src/ change.
Blocks:     nothing. It is P25's exit artifact.
Tests:      the session IS the test, and check:docs is its rung — X3 typechecks it, X4 runs it and
            requires it to assert, X5 compiles it under the DOM lib, X8 holds README.md's copy
            byte-equal both ways. Every expected value comes from spec/flow-definition.md section 3
            and from the schemas the session itself declares, never from output: the verdict of each
            arc, the STEP each reason names, the words the schema contributes, the route, and the run's
            five routes and keys. NOT bound by check:workers, whose corpus is examples/registry.json
            and does not reach examples/getting-started/.
Gate:       L0 (lint, then each of the five typecheck lanes SEPARATELY), check:docs, npm test, L6 in
            both runtimes (expected UNMOVED at 2176 / 154 — this item adds no row), check:markdown,
            then the spec-conformity pass and rule 8.
Reserves:   Q420-Q424, ADR 0069 (expected SKIPPED — an exit artifact takes no decision). P25's block
            ends at Q424 and W102 is expected unused.
```

*(**This block was MISSING** until W101's conformity reader (F1) measured it: W99 and W100 each carry all eight
of the template's lines and this file carried NONE, with `Reserves` in prose in the Status line instead. Its
consequences were measured too — the `Owns` audit `doc/workflow.md` section 7 rule 2 prescribes had nothing
to run against, so every file this item edits was undeclared by construction; rule 8's SECOND obligation on the
set and v0.20's tautology clause both range over `Outputs` rows that did not exist, while this item's own
Verification table handed its adequacy reader *the session's guards tautologised rather than deleted*; and the
Verification section's stated job, enumerating the `Gate:` line, had no line to enumerate. The template's own
sentence is **if any line cannot be filled in, the decomposition is wrong and starting will not fix it** — and
every line could be filled in, which is the point: nothing stopped the item starting without them.)*

## What it is

**`AGENTS.md` section 20 — an authoring session for a GATE**, on
[W74](w74-the-assists-and-the-exit-artifact.md)'s precedent (section 15, *what a schema buys an
AUTHOR*) and with the same three properties: one ` ```ts run ` snippet the gate EXECUTES, a real
`createRuntime` on a real `FyflowScheduler`, and a `README.md` section carrying it byte for byte.

**Its subject is a CONSUMER'S OWN gate type**, which is P25 prediction 3's reach — *the corpus has ONE
gate and it is `distinct`; nothing this repository ships exercises a second type declaring a
guarantee*. The session's type is **`quota`**: the first *limit* values per key go to `within`, the
rest to `over`, a value the key does not resolve on to `nokey`. **Two of its three routes are
key-resolved and one is not**, so the per-route half of ADR 0068 rule 1 is visible rather than stated.

## What the declaration step MEASURED, before a line of the session was written

`dev-dist/w101/facts.ts`, on the tree W100 ships. Every document below is run through
`validateDefinition` first and returns **0 findings**, so each verdict is about a document the grammar
accepts.

1. **A consumer's own gate type gets BOTH halves, and P25 prediction 3 is CONFIRMED.** The right key
   `owner.id` gives `fits` on both key-resolved arcs; the typo `ownr.id` gives **`no`** at `$` and
   `owner.ident` gives **`no`** at `$.owner` — each naming the gate, the key, the failing STEP, the
   schema's own words and the route. *Two wrong keys failing at two different steps is the session's
   two rows.*
2. **There IS a payoff to show, and it is the point of the session.** `owner` is OPTIONAL on the
   producer and `owner.id` is required inside it. With the type declaring `keyResolvedRoutes` the arc
   past `within` is **`fits`**; with the SAME type declaring none it is **`no`: `$: consumer requires
   "owner", producer does not guarantee it`**. So the session can show the guarantee doing visible
   work — *a consumer requiring what the route guarantees fits only because the route says so* — which
   is [Q410](../open-questions.md)'s complaint answered in prose rather than in a field.
3. **P25 prediction 3 is CONFIRMED, and its stated REVERSAL ARM is one the session's own type exhibits.**
   The column names *a route that narrows a TYPE rather than asserting presence*, and `quota`'s `fn` returns
   `nokey` unless the key is a non-empty STRING — so `within` and `over` do in fact guarantee more than
   presence, and `keyResolvedRoutes` cannot say so. That is not a reversal but ADR 0068 rule 3 working: the
   member is a promise about PRESENCE along the path and a type must not read it as one about the leaf. The
   session needs presence only, which is why the prediction holds. *(Recorded CONFIRMED without naming this
   arm until W101's conformity reader, F13.)*
4. **P25 prediction 4 is CONFIRMED ON REAL WORKERS, and the plan records that the run had NOT been taken.**
   The session runs the MISSPELLED key through `createRuntime` as well as through the check: the run reports
   **`completed`**, all six branches take `nokey`, and NO `report` task is dispatched. *Its own headline
   sentence — the run completes having done none of the work the gate guards — was carried from W100's
   measurement and asserted by nothing until its adequacy reader (F4) measured that it was the plan's own
   unfired prediction sitting in the exit artifact's prose.*
5. **The route that is NOT key-resolved keeps its own verdict**: the arc past `nokey` is `fits` either
   way, so the session shows the refusal is per-ROUTE and not per-gate.

## Scope

**In**

1. `AGENTS.md` section 20, ONE executed `run` snippet, and its `README.md` twin under `X8`.
2. `scripts/check-docs.mjs` — `RUN_FLOOR` and `README_SNIPPET_FLOOR` raised, and the `X8` pairing
   entry, which is [Q102](../open-questions.md)'s ratchet and three edits in one diff.
3. The session's registry and workers under `examples/getting-started/`.
4. Whether ladder **L6** moves, settled by measurement rather than by the plan's table.

**Out**

- **Any `src/` change.** The session is a READING of what W99 and W100 built; if it needs a code
  change, that is a finding and not a session.
- **A second built-in gate type.** `quota` is the CONSUMER's, declared in the session's own code,
  which is what makes it prediction 3's reach rather than a widening of `distinct`.
- **Q415, Q416 and Q417 — the three SILENCES — and Q410, the missing FIELD.** *(This read *the four
  silences and the missing field* over four ids, of which Q410 IS the field — W101's conformity reader, F14.)*
  All four are NAMED in section 20's closing paragraph, Q410 added there at the review because a verdict
  carrying no `route` is what step 3 has to work around. The session is where a human
  would notice them, so it names them in prose and takes none.

## Verification

| Clause | How |
|---|---|
| L0 | `lint`, then each of the five typecheck lanes SEPARATELY |
| `check:docs` | the session EXECUTES (`X3`, `X4`), `X8` pairs it byte for byte, `RUN_FLOOR` and `README_SNIPPET_FLOOR` raised in the same diff |
| `npm test` | L1-L5 in three runtimes, expected UNMOVED unless the session's registry earns a case |
| L6 node / deno | RUN in both, and **UNMOVED at 2176 / 154** — this item adds no row and `examples/l6.ts` is not in its diff, which corrects P25's seeded table (the file is W99's, where L6 moved). *(This row cited **fact 4**, and the section above states three — W101's conformity reader, F4, and W98's `ID-R7` class: an id cited in the row a reader is meant to check against.)* |
| `check:workers` | RUN, and it reaches **none** of this item's three workers — `scripts/check-workers.mjs` reads `examples/registry.json` alone, which holds 21 workers and none under `examples/getting-started/`, and the session's entries declare no input example for `K3` to run them on. *(This row read **the session's workers run on their declared examples**, which BOTH readers measured false — its conformity reader's F2 and its adequacy reader's F7. What binds the three workers is the session's own executed assertions under `X4`, which read `report`'s results off the run, plus `test/definition/gate-session.test.ts`.)* |
| conformity reader | derive every verdict and the run's outcome ON PAPER from `spec/` and the schemas before reading output |
| adequacy reader | the session's guards tautologised rather than deleted (v0.20), and the payoff's pair collapsed |
| rule 8 | obligations (a)-(f), the harness with its control and a CRASH + WRONG-REASON grader control ON EVERY RUNG, per-edit anchors, content digest |

## Record

**DONE 2026-09-30, and it is P25's EXIT ARTIFACT, so the plan is COMPLETE pending its retro.**
`AGENTS.md` section 20 is an authoring session `npm run gate` EXECUTES, on a **CONSUMER'S OWN** gate
type, with its `README.md` twin held byte-equal by `X8`. No ADR: **0069 SKIPPED** and not reused. No
`spec/` rule — an exit artifact writes none.

| | |
|---|---|
| `check:docs` | **38 snippets, 32 run, 6 check**; `X8` pairs **8**; `RUN_FLOOR` **32**, `README_SNIPPET_FLOOR` **8** |
| L1-L5 | **54 files / 1446 cases** in node 24.20.0 and deno 2.9.6, from 53 / 1439 — the new file is the session's SECOND OBSERVER |
| L6 | **2176 / 154 UNMOVED** in both runtimes, and `examples/l6.ts` is not in the diff — which corrects P25's seeded table |
| `check:spec` | **7 / 65 / 126 UNMOVED**, `C4` at 37 |
| `check:workers` | **21 workers, and NONE of this item's three** — measured, not assumed |
| Census | **317 / 244 / 1 / 72**, raising **Q420** and extending Q102, Q266 and Q310 |

### What the session is, and why its registry is a MODULE

**Five steps a human can watch, every one executed.** A misspelled key path named before anything runs
and named at the STEP it sits on (`ownr.id` at `$`, `owner.ident` at `$.owner`); the refusal shown to be
the **ROUTE's** rather than the gate's, by ONE consumer carrying TWO verdicts in one report because
`over` is key-resolved and `nokey` is not; the guarantee shown DOING something, since the same arc reads
`no` with the type's declaration removed; and the run, on a real `FyflowScheduler`, where six files share
one gate memory and the quota is asserted per KEY.

**The registry, the gate type and the flow are `examples/getting-started/quota-registry.ts` rather than a
literal in the snippet, and that is the item's central repair.** Its adequacy reader made **all NINE** of
the section's guards TAUTOLOGIES at `check:docs` EXIT 0 — individually and all nine at once — and deleted
TWO of its five steps for zero, because `X4` counts a `throw` textually and refuses `if (false)` by name,
so `x !== x` and `includes('')` are outside both tests, while `RUN_FLOOR` counts SNIPPETS rather than what
is inside one. **A snippet cannot be its own second observer.** So everything the session claims lives in
one module and `test/definition/gate-session.test.ts` asserts the same verdicts from the same
declarations — six cases, and the reader's own `b1`, *the one probe of its sixty-two that survived
everything*, is now CAUGHT at BOTH rungs.

### The readers

**Conformity: 16 findings, 3 BLOCKING, and its central obligation came back with ZERO disagreements on
39 VALUES** — every arc's verdict, the step each reason names, the schema's own words, the route, the
run's five routes and keys, the outcome, and `validateDefinition` on all three documents, all derived on
paper from `spec/` and the schemas before any output was read. **The fifth item running with zero
disagreements.** It also confirmed prediction 3 and measured all three silences against the CODE, by
constructing an entry gate (`verdicts: []`), a gate into a join, and an `enum` container.

**Its F1 is the item's own biggest miss: the file had NO declaration block at all** — none of the
template's eight lines, with `Reserves` in prose. W99 and W100 each carry all eight. The consequences were
measured rather than asserted: the `Owns` audit had nothing to run against, so every file this item edits
was undeclared by construction; rule 8's second obligation and v0.20's tautology clause range over
`Outputs` rows that did not exist, *while this item's own Verification table handed its adequacy reader
the tautology clause by name*; and the Verification section's job, enumerating `Gate:`, had no line to
enumerate. **And when I re-derived the finding my own grep pattern said W100 had no block either** — the
block is plain text inside a fence, never bold — which is a pattern that would have made a true finding
look false.

**Its F2 and the adequacy reader's F7 are the same finding from two ends**: the Verification table claimed
`check:workers` runs the session's workers on their declared examples. That check reads
`examples/registry.json` alone, reports 21 workers, names none of the three, and the session's entries
declare no input example for `K3` to run. *The row was satisfied by nothing, and the check was green
because it never saw the session.*

**Its F15 is a defect in W100's text, found in the tree this item ships**: `spec/flow-definition.md`'s
`fits` row stated *its ONE scope* **TWICE**, one of the two sentences added by the fix for that same
reader's F5 at W100, with the leniency's own clause stranded after a full stop. A normative row
self-contradictory on its face, and a fix that edited a row already carrying its own answer.

**Adequacy: 62 probes, 28 SURVIVED, 12 findings, 7 BLOCKING**, both its grader controls right at the start
and again at the end, and its digest — a FILESYSTEM walk, because `git ls-files` inside a copy under an
ignored directory resolves to the PARENT and lists nothing — identical at both ends, having caught one live
mutation mid-probe.

| | finding | what it cost, and now |
|---|---|---|
| F1 | **all nine guards tautologisable, singly and together; two steps deletable** | **0** each. Closed by a second observer rather than by a better snippet, and the reader's own `z1` decomposition is what makes that the right repair |
| F2 | **the reach rests entirely on step 5, which deletes for zero** — `examples/run-flow.ts` declares no `gateTypes`, so L6 runs only `distinct` | **0**. Closed by asserting `report`'s three results off the run, which F5 also needed |
| F3 | **step 3's claim satisfied by its own NEGATION** — the two key-resolved routes swapped give the same SORTED pair | **0**, and this is the probe that survived all 62. A verdict carries no `route` (Q410), so the discriminator is the reason a refusal gives. **CAUGHT at both rungs now** |
| F4 | **the session's own headline sentence asserted by nothing**, and it is P25 prediction 4, which the plan records as not taken | closed by RUNNING the misspelled key: `completed`, six `nokey`, no `report` dispatched |
| F5 | **`per-owner.ts`'s body bound by nothing** once `no-unused-vars` could not stand in | **0**. *The run completing had stopped being evidence that the guarantee held.* Closed by reading the results |
| F6 | **the type's `key === ''` arm was DEAD** and `classify.ts`'s comment described what did not happen | **0**. `classify` now hands the empty id on, so the path RESOLVES and the TYPE refuses it — and the session asserts BOTH roads to `nokey` |
| F7 | `check:workers` reaches none of the three | the Verification row is corrected and says what does bind them |

**Non-blocking and acted on:** F11 (the arc selection unbound, closed by a COUNT), F12 (`README_SNIPPET_FLOOR`
has no self-test probe where `RUN_FLOOR` does — written into the check's own comment as a declared ceiling,
Q102 extended). **Declared ceilings the readers left standing:** F8 (section 20's PROSE inverts for zero in
both documents — `X8` compares fences), F9 (the producer's `examples` annotation read by nothing here, which
is F7's consequence), F10 (the consumer type's `settingsSchema`, now bound by the grammar case).

**Readers — overlap 4, the SIXTY-FIFTH measurement**, at the top of the settled 0-4 band: `check:workers`'
reach, `per-owner.ts`'s header and body, the misspelled-key sentence, and the self-test's stale fence
comment. *Two of the four are the same defect approached from opposite ends.*

### What the BUILD met

**A worker whose url cannot resolve leaves its task PENDING for ever** — the run hangs rather than failing.
It cost a diagnosis: the session passed `base: import.meta.url`, its own url, where the registry's worker
urls are relative to the MODULE that declares them, so every worker resolved to a path in `dev-dist/`. That
is [Q266](../open-questions.md)'s class, met while building, and the line now passes `QUOTA_BASE` with the
reason beside it. *The isolating measurement was a two-file run timing out where five had worked, which is
what said the problem was not the new file.*

### Rule 8

**34 probes, 20 caught, 9 declared ceilings RUN, 0 undeclared survivors, 0 against declaration**,
with **both readers' exact edits checked in** (v0.8) and **five grader controls — a CRASH and a
WRONG-REASON on each of the two rungs the set uses, plus the clean control**. Content digest `05de0fe0cc37c79f`
identical at both ends.

### Gate — what ran

| Clause | Result |
|---|---|
| L0 | `lint` EXIT 0; all five typecheck lanes EXIT 0, run SEPARATELY |
| `check:docs` | EXIT 0 — **38 snippets, 32 run, 6 check**, `X8` pairing **8** |
| `npm test` (L1-L5) | EXIT 0, **54 files / 1446 cases** in node 24.20.0, deno 2.9.6 and chromium |
| `test:l6` / `test:l6:deno` | EXIT 0 both, **2176 / 154** each — UNMOVED, and `examples/l6.ts` untouched |
| `check:spec` | EXIT 0, **7 / 65 / 126**, `C4` at 37 |
| `check:workers` | EXIT 0, 21 workers — and NONE of this item`s three, which is the measurement rather than the claim |
| `check:markdown` | EXIT 0 |
| `npm run gate` | **EXIT 0**, 16 chain entries, zero `FAIL` lines |

**Content digest `56c19a5b0d54eae5` before the gate and `56c19a5b0d54eae5` after — IDENTICAL.**

**[Q142](../open-questions.md) measured BEFORE the record step and it does NOT fire**: `M3`'s margin is
**15 files** and `M4`'s **531 links** on the tree this item ships. It adds one document (its own) and
three modules, so the margin narrows rather than the floor moving.

**The census was CONFIRMED at 317 / 244 / 1 / 72** by the parser W100 wrote, re-run here: the register's
five ids that live in the Resolved table alone are unchanged, Q119 and Q71 are still the two declared
exemptions with Q71 RESOLVED, and every id sits in exactly one cluster cell.
### What this item did NOT take

**Q420** is the one question it raises: nothing checks that a work item carries the declaration block its
own template requires, and an item without one cannot be `Owns`-audited at all — which is how this item
started and finished its build with no `Owns` line. Q421-Q424 are reserved and UNUSED. Q102, Q266 and Q310
are extended. **W102 stays unissued and ADR 0069 is SKIPPED.**
