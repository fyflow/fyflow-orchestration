# W190 — the run's payload as a reference: `"$payload"`, on every `needs` site, from the definition to the driver to the wiring check

**Status:** done 2026-10-19 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, no BLOCKER; S-1 answered by the maintainer (W191 fixes it); no question raised; not committed. Earlier: READY-FOR-READERS 2026-10-18; declared 2026-10-18 on `86b0c7c` (P38 declared, the tree clean); P38's FIRST item: stop-and-asks
(a), (b), (d), (f)-(j), (l) and (m) as answered, facts 1, 4 and 7-11; ADR 0117 (reserved for it); not committed
**Plan:** [P38](../plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) — *may a `needs` reference
name the value that reached the RUN and, inside a `map` instance, the item that opened it — always there, copied like any
reference, refused where it means nothing, and derived again on a resume with nothing new in the checkpoint?* — the
fyflow-app ask *pass 1 follow-up*, case 1 (an ENTRY ask whose successor cannot reach the invoice) and case 3 (a run-level
parameter two hops on). **As answered**: (a) both references, this item the payload; (b) spelled `"$payload"`, the whole
`$` prefix reserved; (d) legal on every node and every edge, the entry included; (f) the value the run ENTERS with, handed
to the composition explicitly at each door; (g) the form refusals are `FD-V26` clauses naming the fix; (h)
`referenceTarget`'s union widened for BOTH `'payload'` and `'item'`, stated BREAKING; (i) an arc through a `$payload` key
reads `unchecked`; (j) `givenVerdict`/`tryTransform(…, { input })` unchanged; (l) a copy per instance per key, nothing
warns; (m) an ask's `asked.input` carries the copy.

```
Spec:       spec/flow-definition.md v0.43 -> v0.44: section 3's reference table (+1 row, "$payload"), its prose on the
            invented tokens, FD-C1 (the "$payload" key composed from the run's payload, at every door), FD-C3 (an edge
            may name it), the EDGE subsection's *not derivable* row, the wiring table's `needs` row (unchecked); section 5's
            FD-V26 row (the "$" clauses); section 6's FD-R4 row (*at an entry only "." can be named* — falsified); the
            v0.44 version paragraph. spec/README.md: the flow-definition row and its version column. No rule id is added
            (decision 6: the form refusals are FD-V26 clauses; FD-V49 is W191's) — still 44 refusals.
Owns:       from P38's W190 row, exactly: src/definition/validate.ts, src/definition/types.ts, src/definition/wiring.ts,
            src/driver/driver.ts, src/driver/routing.ts (a comment), spec/flow-definition.md (the WHOLE file — the row's
            parenthetical is a forecast, P36's clause), spec/README.md, spec/examples/invalid/**, test/definition/**,
            test/driver/**, examples/l6.ts (the four reference censuses only), AGENTS.md (the WHOLE file, D′),
            scripts/check-docs.mjs (RUN_FLOOR), doc/decisions/0117-*.
            Exceptions: none declared. Anything else found to need an edit is a STOP-AND-ASK (S-n), never an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/decisions/** (ADR 0040 rules 2 and 5 and ADR 0041's
            *not derivable* row — a dated pointer each to ADR 0117), doc/questions/** (Q700-Q704 only if raised), the
            plan's Record, README.md, this file.
            Overlap with W191 (next, serial): src/definition/validate.ts, src/definition/wiring.ts, src/driver/driver.ts,
            spec/flow-definition.md, spec/README.md, spec/examples/invalid/**, test/definition/**, test/driver/**,
            examples/l6.ts, AGENTS.md, scripts/check-docs.mjs.
Inputs:     P38 facts 1, 4, 7-11, decisions 1-8, stop-and-asks (a)-(n) as answered, the D′ list for this row (the siblings of
            "." — validate.ts:1043-1061, :1491-1497, :1586-1593, :1833; driver.ts:2093-2124, :4338-4374, :4465-4494;
            wiring.ts:319, :375-376, :757-795; types.ts:33-49; examples/l6.ts:6459, :12534-12566, :13551, :13608 — and the
            PREMISES of fact 10), sentences B′, C, D′, E and the three brief sentences; W185-W188's Records and P36's Retro
            (a copy claim provoked by an ALIAS and a SHALLOW copy over a NESTED fixture, read both ways; an Owns
            parenthetical is a forecast; the sibling grep; an observer vacuous until a control shows it sees); fyflow-app's
            request (the session scratchpad's app-request-pass1-followup.md).
Outputs:    (1) src/definition/validate.ts: `referenceTarget` returns `{ form: 'payload' | 'item'; node: null; conditional:
                false }` for "$payload" / "$item" (BREAKING, a type); FD-V26's "$" clauses at both sites — an array form, a
                `?` suffix, any other "$" token — each naming the fix; "$item" refused until W191 (reading R1); the edge's
                "." clause and the FD-V27-FD-V29 loop switch on `form`, never on `node === null`.
            (2) src/driver/driver.ts: `compose` takes the run's payload explicitly — the header's copy in a run and on a
                resume, the caller's at FD-R4 — and composes a "$payload" key as its own deep copy; `resolveNeeds` does the
                same for an edge; the premise comments (:2093-2095, :3580-3587) corrected.
            (3) src/definition/wiring.ts: `entryWalk`'s map arm composes a "$payload" key from the walk's own payload;
                `composed` reads a "$payload" key `unchecked` ((i)); the premise comment (:319) corrected.
            (4) src/definition/types.ts (`Reference`'s doc) and src/driver/routing.ts (`DecisionContext.needs`' doc).
            (5) spec flow-definition v0.44 and spec/README.md's row; spec/examples/invalid/ +3 FD-V26 cases.
            (6) tests: test/definition/run-payload.test.ts (L1, NEW); test/driver/run-payload.test.ts (L2, NEW);
                test/definition/needs.test.ts (the table bound, +1 row); l4-corpus's census (+2 suites) and a per-suite
                count case.
            (7) examples/l6.ts: the four reference censuses switch on the PARSE (fact 9).
            (8) AGENTS.md: section 3's `needs` subsection — the table row, the refusals, the cost, and one `run` snippet,
                the app's entry-ask worked example — and the BREAKING paragraph; sections 4, 7, 9 (FD-R4) and 15 where
                they state a premise this falsifies; `RUN_FLOOR` 47 -> 48.
            (9) doc/decisions/0117-a-reference-may-name-what-reached-the-run.md.
Depends on: nothing (P38's first item; the tree at 86b0c7c)
Blocks:     W191
Tests:      L1, expected values hand-written from (b), (d), (g), (h), (i) and section 3's grammar, never from output:
            `referenceTarget` on every form, the two new variants included, and null for ["$payload"], "$payload?",
            ["$item"], "$item?", "$other", "$"; FD-V26 on ["$payload"], "$payload?", "$other" at BOTH sites, each message
            naming its fix, FD-V26 alone; "$item" refused at both sites naming "."; "$payload" ACCEPTED at the entry, two
            hops on, on a map node, an ask and an edge, beside the edge's "." still refused; a node called "$payload" is
            FD-V16; the wiring check over a "$payload" key `unchecked` beside a "." control that is not; `boundaryTargets`
            over an entry map whose `over` is read off a "$payload" key. L2 over a scheduler double: "$payload" composed at
            the entry, two hops later, on a map node (its `over` read off the composed object — an arity the PAYLOAD
            carries and the predecessor's result does not), an ask (`asked.input` carrying the copy), the app's entry ask
            and its successor, and an EDGE whose declared predicate routes on `needs.run.amount` both ways; FD-R4 holding an
            entry task's composed "$payload" key to its `inputSchema`, refused BEFORE the header exists (driver unstarted)
            and accepted; a run stopped and RESUMED on a fresh driver composing the same value, its header five keys at
            format 1, no fold-input kind the control lacks; the COPY claim over a NESTED payload read both ways — the
            caller mutating its payload after start(), a worker mutating a nested field of what it received — against an
            ALIAS and a SHALLOW-copy mutant; a flow declaring neither unchanged. A real-scheduler probe in node and deno
            (M-row), not checked in — W192 owns L6. One-clause mutations (sentence E) in the byte copy C:/tmp-w190/m.
Gate:       `npm run gate` before the readers (sentence C); the conformity and adequacy readers, NOT this item's author;
            then `npm run gate:item` ONCE on the final tree. B′: `check:docs:selftest` (a `run` snippet added) and
            `check:budget:selftest` only if an always-read document moves (none is planned).
Reserves:   Q700-Q704 (P38's per-item line); ADR 0117 (P38 decision 7)
```

## Scope

**In** — Outputs (1)-(9).

**Out** — named rather than left implicit, with where it goes instead

- **`"$item"` itself** — W191: its composition, what an instance keeps for it, `FD-V49`, `RN-R13`, `DRIVER_FIELDS`. Here it
  is PARSED (the union, (h)) and REFUSED (reading R1), and no reader composes it.
- **The exit artifact on real workers** — W192. No L6 assertion or run is added here (`X10` unmoved); the censuses move by
  their PARSE only.
- **`givenVerdict` / `tryTransform(…, { input })`** — (j): unchanged; `AGENTS.md` says why.
- **`spec/run-state.md`** — not in the row: `RN-R13`'s retention of the entry payload already holds (fact 4), and nothing
  is written to the log, the header or the fold (decision 5). `spec/run-state.md:556` stays true (fact 10).

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; `check:docs:selftest` (B′: a snippet
added); the author's ONE-clause provocations in the byte copy `C:/tmp-w190/m` (node_modules copied, never linked, `find
-type l` empty), graded on the named suites' `FAIL` lines, a time-out NO VERDICT, grader controls CLEAN and CRASH; then the
readers; then `npm run gate:item` once. Routing coverage: no matching decision edge (Q10) — not applicable, an edge
predicate is evaluated as before and the L2 edge case routes both ways with a default; a branch routed away from its join
(Q4), a nested fan-out (Q6), `user_action` (Q17) and a duplicate task id (Q13) — not applicable: no routing rule, region
rule or id moves; "$payload" composes a value and changes no route.

## What the declaration step measured

*Measured 2026-10-18 in the BYTE COPY `C:/tmp-w190/m` (`git archive` of `86b0c7c`, `node_modules` copied, never linked;
`find -type l` 0), node 24.20.0, deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `node test/runner.ts` EXIT 0: **80 files / 2047 cases** |
| M2 | **P38 prediction 1 — the `src/` change ALONE** (the five `src/` files copied in; no test, spec or example touched) | **NOTHING moves**: L0 `npm run typecheck` EXIT 0 (tests and examples included — no caller typed on the old union narrows it); L1-L5 EXIT 0, **2047 / 2047**; L6 node **2767, 0 failed**; `check:docs` and `check:spec` EXIT 0. No fold input and no dispatched payload of any existing flow moved, and no assertion reads `FD-V26`'s old message text |
| M3 | **prediction 2 — the spec's new table ROW, the censuses untouched** | `test/definition/needs.test.ts`'s table bound RED and **L6 2 of 2767 RED**, both `cross-row`: *one reference form per row* (4 vs 5) and *one more SPELLING than rows* (5 vs 6 — `spellingOf` read `"$payload"` as `"n"`). No `EXPECTED` flow uses the token: the move is the census reading the TABLE (fact 9's `:6459`, `:12566`). **A NEW L6 clause moves `X10`** (`examples/README.md`, not in `Owns`) — measured, three added checks took L6 to 2771 against its declared 2767 — so the not-yet list is held both ways by the two EXISTING clauses (R4) and `X10` is unmoved |
| M4 | the two new suites against `86b0c7c`'s `src/` (written from the plan before any run) | L1: **7 of 9 RED** (green: FD-V16, true before, and the membership). L2: **10 of 11 RED** (green: the membership) |
| M5 | **B′ / D′ — the census sites**, each by its lane | `RUN_FLOOR` 47 -> 48 (`check:docs` 48 `run` / 6 `check`); `LATE_SUITES` +2 and a count case (9, 11); `spec/examples/invalid/` 47 -> 50 (`l4-corpus` +3 cases; `check:spec` C4 still *44 definition refusals*); `needs.test.ts`'s table bound +1 row; `DRIVER_FIELDS` and `NOT_RUN_STATE` UNMOVED (`runPayload()` is a METHOD, no own property); `X10` unmoved (2767 / 214); spec v0.44 and its `spec/README.md` row; no rule id. **82 files / 2071 cases** in node, deno and chromium (+2 files, +24: 9 + 11 + 1 count + 3 invalid examples) |
| M6 | **now-false statements** — `git grep` (not `dev-dist/`) for each changed name and PREMISE (*the only invented token(s)*, *a "." is the only reference an entry can carry*, *at an entry FD-V27 admits no reference but "."*, *the run's own outputs*, *no derivation at all*, *reachable by naming whatever produced it*, *at an entry only "."*, `node === null`) | rewritten in `Owns`: validate.ts, types.ts, wiring.ts, driver.ts, routing.ts; spec (section 3's row and prose, the token count, FD-C1, FD-C3, the EDGE subsection, the wiring row, FD-V26, FD-R4, *A sample the caller GIVES*); AGENTS.md sections 3, 4, 7, 15. **Outside `Owns`, record-step files**: ADR 0040 rules 2 and 5, ADR 0041's *not derivable* row, and **ADR 0101 line 50** (*at an entry only `"."`*, not named by the plan) — a dated pointer each at the record step. **Still true, left**: spec's v0.11/v0.12 history paragraphs; `test/definition/needs.test.ts:863` (the FD-V29 measurement skips node-less references by `t.node === null` — the right predicate there, it counts AIMED references); `spec/run-state.md:556` |
| M7 | **a real-scheduler probe** — `C:/tmp-w190/m/scratch-w190/probe.ts`, `createRuntime` over a real `FyflowScheduler`, `pay` on a THREADED pool and `audit` on an INLINE one; not checked in (W192 owns L6) | node 24.20.0 and deno 2.9.6 EXIT 0, **the same JSON byte for byte**: an entry ask answered, `pay` received `{ invoice: <payload>, answer: { approved: true } }`, the caller's post-`start()` nested write absent; its edge on `needs.run.amount` routed 120 to `audit` (`{ run: <payload>, prev: <pay's result> }`) and 50 to `done`; a run STOPPED at the ask, resumed on a fresh runtime and answered there: the same values, the header the five keys at `format` 1, the stored kinds `asked` and `interrupted` alone |

## Readings the plan did not settle — taken here, for the readers

| | reading | why | where stated |
|---|---|---|---|
| **R1** | **`"$item"` until W191: PARSED and REFUSED.** `referenceTarget("$item")` returns the `'item'` variant ((h) widens the union for both in this item); `FD-V26` refuses it at both sites with a clause naming today's road — `"."` on the map's branch entry — and every reader's `'item'` arm is unreachable on an accepted document (the driver throws naming the invariant; `checkWiring` reads `unchecked`; `entryWalk` leaves the key out) | the plan: W190 lands the variant AND every `node === null` reader switching on `form` in ONE item (*a tree on which the validator accepts `$payload` and `compose` still reads `node === null` as `"."` hands a worker the wrong value*); accepting `"$item"` with no composition would be that tree for the second token. W191 replaces the clause with its composition and `FD-V49` | validate.ts's clause; spec v0.44's FD-V26 row; ADR 0117 rule 7 |
| **R2** | **The two new variants are TWO union members**, `{ form: 'payload' }` and `{ form: 'item' }`, not (h)'s one member with a two-literal `form` | the same set of values; TypeScript does not split one member on a `===`, so every caller switching on `form` needed a cast (measured: six `TS2345` at L0) | validate.ts's comment |
| **R3** | **An arrival composed through ANY `"$payload"` key is wholly `unchecked`**, not that key alone | (i): *an arc through it reads `unchecked`*; an object schema with one unknown property cannot `fit` — the road `"."` over an unchecked arrival already takes | wiring.ts's `composed`; spec's wiring row; L1 case |
| **R4** | **The L6 censuses name the row no L6 row runs** — `NOT_YET_AT_L6 = ['payload']`, held both ways by the two EXISTING clauses (the count adds it; the set compares the CONCATENATION, where an overlap shows as a duplicate) | the table's row moves two censuses with no flow using it, and a new clause moves `X10`, outside `Owns` (M3); W192 empties the list | examples/l6.ts's comment |
| **R5** | **`compose`'s and `resolveNeeds`' `"$item"` arms THROW a plain `Error` naming the invariant** | unreachable on any document a `Driver` accepts (R1) — `compose`'s own `referenceTarget(ref)!` is the precedent | driver.ts; P21 (a declared equivalent) |
| **R6** | **The `$` refusal message for `["$payload?"]` is the ARRAY one** | (g) names each clause and not their combination; dropping the brackets is the first fix, and the suffix message follows | `dollarProblem`'s doc |

## Predictions, and what happened

| | prediction (at declaration) | outcome |
|---|---|---|
| 1 | **P38 prediction 1**: *W190 moves no fold input and no dispatched payload of any existing flow, in any lane; what moves at L0-L5 is only what reads the PARSE — a `referenceTarget` caller typed on its old union, an assertion on `FD-V26`'s message text, the counted suites' counts. `examples/l6.ts`'s forms census does NOT move unless an `EXPECTED` flow uses the token* | **HOLDS for the `src/` change** (M2: nothing moved, L0-L6). **REFUTED for the census half**: the forms census moved with NO `EXPECTED` flow using the token, because it counts the spec TABLE's rows (M3) |
| 2 | **Mine**: the spec table's new row DOES move two L6 censuses that read the table (`referenceFormsInSpec()` counts its rows; `REFERENCE_SPELLINGS_IN_SPEC` parses its tokens) — red at L6 until the censuses learn the row, though no `EXPECTED` flow uses the token. And `test/definition/needs.test.ts`'s table bound moves at L1 the same way | **HOLDS** (M3): exactly those two L6 clauses and the L1 bound |
| 3 | census: `RUN_FLOOR` 47 -> 48, `LATE_SUITES` +2 with a count case, `spec/examples/invalid/` +3, no `DRIVER_FIELDS`, no `X10`, no rule id; `CHECKPOINT_FORMAT`, `RUN_FOR`, `isFed`, `snapshot()` unmoved (P38 prediction 3) | **HOLDS** (M5) — `X10` only because the censuses took no new clause (M3) |

## The author's provocations (before the readers)

`C:/tmp-w190/mutate.mjs` in the byte copy `C:/tmp-w190/m` (synced to the real tree); each anchor checked to occur once in
the CURRENT text, every file restored from its FIRST snapshot and its SHA-256 compared after every probe and at the end;
graded on the FAIL lines of the cases each probe DECLARES (its clause's own failure line) — `node test/runner.ts
run-payload` (both suites), `definition/needs`, L6 `node examples/l6.ts`, L0 `tsc -p tsconfig.json`; a time-out NO
VERDICT; an import failure CRASH; failures only outside the declared cases WRONG-REASON. **Grader controls**: CONTROL
must grade CLEAN, GRADER-CRASH CRASH, GRADER-WRONG-REASON (P11's edit declared against the FD-V16 case) WRONG-REASON.

**First pass: 27 probes + 3 controls — 21 KILLED, 4 SURVIVED (P4, P19, P21, P24), 1 WRONG-REASON (P20).** Acted on:
**P4** was a real gap — the array cases asserted *write "$payload"*, a PREFIX of the suffix clause's own message, so the
array clause could be disabled for 0; they now read *is an array form*. **P20** was the harness's (its declared case name
misspelt). **P24** was graded on L1 alone; the table's TOKEN is read by L6's spelling census, a second route, and the probe
runs both lanes now. **Re-run whole on the final tests (`C:/tmp-w190/mut2.out`, `C:/tmp-w190/mut.json`): 27 probes + 3
controls — 25 KILLED, 2 SURVIVED (P19, P21 — declared equivalents), CONTROL CLEAN, GRADER-CRASH CRASH,
GRADER-WRONG-REASON WRONG-REASON, no NO VERDICT, no ABORTED; every file restored, digests equal.**

| id | the ONE clause broken | verdict |
|---|---|---|
| CONTROL / GRADER-CRASH / GRADER-WRONG-REASON | — | CLEAN / CRASH / WRONG-REASON |
| P1 | PARSE "$payload" — not recognised | KILLED — the parse, the five sites, two hops |
| P2 | PARSE "$payload" AS `self` — (h)'s refused alternative | KILLED — the parse, two hops, the edge |
| P3 | PARSE "$item" — not recognised | KILLED — the parse, "$item" refused |
| P4 | FD-V26's ARRAY clause | KILLED (after the fix above) |
| P5 / P6 | FD-V26's SUFFIX / ANY-OTHER-`$` clause | KILLED / KILLED — node and edge messages |
| P7 / P8 | "$item" refused at a NODE / an EDGE | KILLED / KILLED |
| P9 | the edge's "." clause read on `node === null` (fact 9) | KILLED — "$payload" on an edge refused |
| P10 | FD-V27-29 skip `self`/`item` only | KILLED — FD-V27 fires on "$payload" |
| P28 / P29 | the node's / the edge's "$" clauses unread | KILLED / KILLED |
| P11 | compose "$payload" from the EDGE's value (`node === null` read as ".") | KILLED — two hops, app case 1, map node, ask |
| P12 / P13 | compose: an ALIAS / a SHALLOW copy of the header's value | KILLED / KILLED — the nested copy claim |
| P14 / P15 | an edge's "$payload": an ALIAS / a SHALLOW copy | KILLED / KILLED — the predicate's nested write |
| P16 | `enter` hands the edge value as the run payload | KILLED — two hops, app case 1 |
| P17 | FD-R4 composes from the header (absent before it exists) | KILLED — FD-R4 |
| P18 | the walk drops a map's "$payload" key | KILLED — `boundaryTargets`, FD-R4's map |
| P19 | the walk composes it from the WALKED value, not the root | SURVIVED — **a declared EQUIVALENT**: the walk runs only at an entry, through fan-outs and gates that hand the payload on unchanged, so wherever a map is walked its value IS the root payload |
| P20 | the wiring check's `"$payload"` -> `unchecked` deleted | KILLED — L0 (`t.node` no longer narrows) and the L1 wiring case |
| P21 | compose's `"$item"` arm composes instead of throwing | SURVIVED — **a declared EQUIVALENT**: `FD-V26` refuses "$item" at construction (R1, R5) |
| P22 / P23 | L6's `spellingOf` reads "$payload" as `"n"` / `NOT_YET_AT_L6` emptied | KILLED / KILLED — L6 `cross-row` |
| P24 | the spec table's `"$payload"` token renamed | KILLED — L6 `cross-row` (the L1 bound counts rows, not tokens) |

## Readers — round 1 (2026-10-18), and what was acted on

*Both readers ran in their own worktrees, spec first; each reported and fixed nothing. No BLOCKER. S-1 is with the
maintainer.*

| reader | finding | kind | acted on |
|---|---|---|---|
| adequacy | **A1 SHOULD** — *a copy per KEY* untested inside ONE node or ONE edge (Q1, Q2 survived) | test | **FIXED** — the copy-claim case gives `b` and the predicate's edge two `"$payload"` keys each: distinct at every depth on the node, and the predicate's write into `run` absent from `also`; R1, R2 KILLED |
| adequacy | **A2 SHOULD** — a resume ALIASING the stored header's payload (Q3) survived W190's suites | test | **FIXED** — the resume case writes a nested field of `cp.header.entryPayload` after `resume()`; `pay` still receives the original; R3 KILLED |
| adequacy | **A3 NIT** — `runPayload ?? edgeValue` (Q5) survived | test | **FIXED** — a run started with `null`, read two hops on: `run: null`; R5 KILLED |
| adequacy | **A4 NIT** — *a flow naming "$payload" nowhere is unchanged* could not see `"."` composing the run payload (its `"."` was at the entry) | test | **FIXED** — the `needs` moved to the second node, where `"."` is the predecessor's result; R11 KILLED |
| adequacy | **A5** — FD-R4 composing from the walked value (Q6) equivalent | record | **DECLARED** — R6, SURVIVED, P19's argument; to be re-run after W191 threads the walk's item index |
| adequacy | **A6 NIT** — `["$item"]`, `"$item?"`, `["$payload?"]` unchecked at the EDGE site | test | **FIXED** — three edge-site cases; R12 (the item half of the array message) KILLED |
| conformity | **C1 SHOULD** — `test/definition/wiring.test.ts:586`'s *only "." can be named at an entry* | text | **FIXED** — and the premise grep re-run for *only "." … named*, *entry can/may name*: no other site |
| conformity | **C2 SHOULD** — `runPayload()` inserted between `resolveNeeds`' JSDoc and `resolveNeeds` | text | **FIXED** — the block moved back, with a sentence on `"$payload"` needing no derivation |
| conformity | **C3 NIT** — `referenceTarget`'s doc said *three forms* | text | **FIXED** — four, `"$item"` parsed beside them |
| conformity | **C4 NIT** — `test/fold/result-value.test.ts:589` (not in `Owns`) reads a spelling `!== '.'` as a node id | record | **LEFT** — harmless (`FD-V16`: no node can be called `$…`); a Record note |
| conformity | **C5 NIT** — *two lines on/later* (ADR 0117 decision 5, driver.ts's FD-R4 comment) | text | **FIXED** — *once the check has passed, before `onHeader`* |
| conformity | **record-step debts** — ADR 0040, ADR 0041, ADR 0101:50 pointers; ADR 0117's `amends:` lacks 0101 | record | the record step |
| conformity | **S-1 widened** — W190's own `"$payload"` on an entry map's branch task crashes `start()` the same way, so (d)'s *legal everywhere* has a run-time hole until S-1 is fixed | ask | **with the maintainer** (S-1) |

**Re-run after acting on the readers (`C:/tmp-w190/mut3.out`): 34 probes + 3 controls — 31 KILLED, 3 SURVIVED (P19, P21,
R6 — declared equivalents), CONTROL CLEAN, GRADER-CRASH CRASH, GRADER-WRONG-REASON WRONG-REASON, no NO VERDICT, no
ABORTED; every file restored, digests equal.** R1-R3, R5, R11, R12 are the readers' survivors re-cut as one clause each.

## Stop-and-asks

**S-1 — a PRE-EXISTING `FD-R4` crash, found by this item's L2 case: `start()` throws a raw `UnresolvedBranchPath` for an
ENTRY `map` whose branch task declares ANY `needs` and whose worker declares an `inputSchema`.** Measured on `86b0c7c`'s
`src/` with `needs: { item: "." }` (no `$` anywhere): `compose` computes `this.pathOf(node.id, itemIndices)` eagerly
whenever a node declares `needs`, and `FD-R4` hands it `new Map()` — no item index — for a target inside a map region
(P38 fact 8's *with EMPTY item indices*). The run never starts; the error is not `BoundaryRefused` and names a branch
index. W190's L2 case is written around it (the branch task declares no `needs`, with a comment saying why).
**Recommended: W191 fixes it**, in the row that already owns *`FD-R4` over an entry map's branch task composing `$item`
and `$payload` from the walk's own values* — it must hand the composition the walk's item index anyway — with a `"."`
regression case beside its `$item` one. **Alternatives**: (b) W190 fixes it now — `compose` computes `here` and
`produced` only when a NODE reference is declared (two lines of `src/driver/driver.ts`, in `Owns`), so an entry map's
branch task composing `"."` or `"$payload"` starts, and W191 still threads the index for `"$item"`; (c) raise it as Q700
and leave it to a later plan. Nothing was edited for it.

**S-1 ANSWERED by the maintainer 2026-10-19: W191 fixes it — its row owns FD-R4 over an entry map's branch task and must
pass the item index; it adds a `"."` and a `"$payload"` regression case.** *(A first relay of the answer read (b), fix it
in W190; the fix was built — `compose` taking the branch path only for a node reference, with both regression cases — and
then REVERTED on the maintainer's correction, byte-compared against the round-1 tree. W190's L2 case keeps the branch task
without `needs`, its comment pointing to W191.)* Until W191, the conformity reader's widening stands: `"$payload"` on an
entry map's branch task whose worker declares an `inputSchema` throws `UnresolvedBranchPath` out of `start()` — (d)'s
*legal everywhere* has that run-time hole, as `"."` there always had.

## Notes for the plan's Record

- **P38 prediction 1 holds for `src/`, and is refuted for its census half** (M2, M3).
- At the record step (`doc/decisions/**`): ADR 0040 rules 2 and 5 and ADR 0041's *not derivable* row — a dated pointer each
  to ADR 0117; **ADR 0101 line 50** (*at an entry only `"."`*) — a dated pointer (M6; not named by the plan).
- `examples/l6.ts`'s `NOT_YET_AT_L6` is W192's to empty (R4) — and W191's to extend with `'item'` if it adds a table row.
- M7's probe (`C:/tmp-w190/m/scratch-w190/probe.ts`) is W192's exit clause (1)'s shape, left in place.
- `check:docs:selftest` (B′, a snippet added): see READY's report; `check:budget:selftest` not run — no always-read
  document moved.

## Record

*Filled 2026-10-19, after the readers' round and S-1's answer. Not committed.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — EXIT 0 | `C:/tmp-w190/gate2.log`: lint; typecheck; every check, `check:docs` 48 `run` / 6 `check`; L1-L5 82 files / 2071 cases in node, deno and chromium; L6 2767 / 0 failed, node 24.20.0 and deno 2.9.6 |
| `check:docs:selftest` (B′: a snippet added) | RAN — EXIT 0, 24/24 noticed | `C:/tmp-w190/docs-self.log`. `check:budget:selftest` NOT RUN: no always-read document moved |
| L1 the grammar, FD-V26 at both sites, the five sites, FD-V16, the wiring check, the walk | RAN — green | `test/definition/run-payload.test.ts` (9 cases; 7 RED on `86b0c7c`, M4) |
| L2 the composition at every site, FD-R4, a resume, the copy claim, a flow unchanged | RAN — green | `test/driver/run-payload.test.ts` (11 cases; 10 RED on `86b0c7c`) — and after the readers, two keys per node and per edge, a store write after a resume, a null payload, `"."` off the entry |
| real-scheduler probe (M7) | RAN — before the readers | node and deno byte-identical; not re-run: the readers' fixes are tests and text, and S-1's fix was reverted |
| conformity reader | RAN | C1-C5, no BLOCKER; C1-C3, C5 fixed; C4 left (below); S-1 widened |
| adequacy reader | RAN | A1-A6, no BLOCKER; A1-A4, A6 fixed and re-cut as R1-R3, R5, R11, R12 (KILLED); A5 declared (R6) |
| the author's probes, re-run after the readers | RAN | **34 probes + 3 grader controls: 31 KILLED, 3 SURVIVED (P19, P21, R6 — declared equivalents, by id)**, controls CLEAN / CRASH / WRONG-REASON, no NO VERDICT; digests equal (`C:/tmp-w190/mut3.out`). **R6 is to be re-run after W191** threads the walk's item index |
| `npm run gate` after the readers' fixes | RAN — EXIT 0 | `C:/tmp-w190/gate3.log`, the same counts |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w190/gateitem.log`) | lint; typecheck; every check, `check:docs` 48 / 6; L1-L5 **82 files / 2071 cases** in node, deno and chromium; L6 2767 / 0 failed in node 24.20.0 and deno 2.9.6; selftests 10/10 ok (985.4 s wall, 9 lanes), `check:register:selftest` left out by `--without` |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) validate.ts: the two variants, FD-V26's `$` clauses, "$item" refused, the readers on `form` | yes | P1-P10, P28, P29, R12 |
| (2) driver.ts: `compose`/`resolveNeeds` from the run's payload, explicit at each door | yes | P11-P17, R1-R3, R5, R11 |
| (3) wiring.ts: the walk's `"$payload"`, `unchecked` | yes | P18, P20 |
| (4) types.ts / routing.ts docs | yes | — (text; `check:docs` holds AGENTS.md's) |
| (5) spec v0.44, spec/README.md, three invalid examples | yes | `check:spec` (C3, C4, C8); `l4-corpus`'s invalid suite; P24 |
| (6) the tests | yes | M4; the probe table |
| (7) examples/l6.ts's four censuses | yes | P22, P23; M3 (two `cross-row` RED without them) |
| (8) AGENTS.md and its `run` snippet | yes | `check:docs` (`RUN_FLOOR` 48) |
| (9) ADR 0117 | yes | `check:register` (front matter, R7) |

**Predictions** — 1 holds for `src/` and is refuted for its census half; 2 and 3 hold (the table above).

**What broke.** Nothing at a rung after READY. Before it: P4 survived — an array-form assertion that was a prefix of the
suffix clause's message. The readers found what no rung saw: *one copy per key* untested within one node or edge, a
resume's copy of the stored header untested in W190's suites, a null payload, and a `"."` placed where it could not
discriminate. S-1 is a pre-existing defect the item's own L2 case surfaced.

**What this taught.** *For the retro*: a census that reads a SPEC TABLE moves with the table, not with the flows that use
it — P38 prediction 1's *unless an `EXPECTED` flow uses the token* was the wrong predicate (M3). And a substring assertion on
a refusal message must not be a prefix of a sibling clause's message (P4). A copy claim "per key" is read with TWO keys on
one site, or a per-site copy satisfies it (A1) — P36's *nested* clause one dimension over.

**Questions raised.** None (Q700-Q704 SPENT, unissued). **Closed.** None. **S-1** answered by the maintainer 2026-10-19:
W191 fixes it. **C4** (conformity, NIT): `test/fold/result-value.test.ts:589`, outside `Owns`, reads a spelling `!== '.'` as
a node id — harmless, since `FD-V16` makes no node callable `$…`; not edited. **Record step**: dated pointers to ADR 0117 in
ADR 0040 rules 2 and 5, ADR 0041's *not derivable* row and ADR 0101's composition sentence; ADR 0117's `amends:` lists ADR
0101 in part.

**The readers' overlap: ONE** — `FD-R4`'s composition over an ENTRY MAP's branch task (the adequacy reader's A5, the walked
value as an equivalent; the conformity reader's widening of S-1, the run-time hole there). Every other finding was one
reader's alone.
