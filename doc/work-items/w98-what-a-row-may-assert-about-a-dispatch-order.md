# W98 — what a row may assert about a dispatch ORDER, and what finds the orders nobody named

**Status:** **DONE** 2026-09-29 — see the Record. Declared on `fea1639` (W97), before any file under `Owns` was edited.
**Plan:** none — an item outside any plan, on [W96](w96-the-counts-and-the-index-a-check-can-compare-and-q394.md)'s and
[W97](w97-obligation-f-across-ladder-l6.md)'s precedent, asked for by the maintainer on 2026-09-29: *"lets do the rest. I
think q400-q402 (and q142 during declaration)"*. It takes the next id, so **the next plan starts at W99**.

**Question:** *what may a row assert about the order its tasks were dispatched in — and what finds an order nobody named?*
[Q400](../open-questions.md), [Q401](../open-questions.md) and [Q402](../open-questions.md), all three raised by W97 and its
readers, are one subject: a claim about order, the justification a row gives for weakening one, and the procedure that
finds the claims nobody justified.

```
Spec:       spec/run-state.md — section 11 and `RN-R27`, what a run FIXES about the order of its own
            dispatches: a trigger chain, one turn (where the DOCUMENT fixes it), and a join barrier,
            and nothing else. **NO ADR**: `doc/decisions/README.md`'s own criterion is that a spec rule
            with a rationale beats a rule plus an ADR restating it, and this rule states behaviour the
            driver already has. ADR 0068 stays unused and is not reused.
Owns:       examples/**, spec/** (the answer above), AGENTS.md (Q402's sentence),
            scripts/check-markdown.mjs (Q142, fact 1)
Inputs:     Q400 (unorderedDispatch justifies by the ROW and names no id — W97's rule 8 ceiling `r5`
            and its adequacy reader p3a/p3b), Q401 (obligation (f) misses a speed-up and trusts one
            green sample — its measurement half only; the WORDING is P25's retro's, as that row says),
            Q402 (AGENTS.md's *order-free by construction* and P24 decision 7's *reproduced exactly*),
            Q142 (`M3`'s margin is 1 — this file fires it); doc/workflow.md v0.25 rule 8 (a)-(f);
            spec/join-policy.md's JP-R5 and section 2's *one turn*; W51's `unorderedDispatch` and
            W97's narrowing of it. Every fact RE-RUN here, never transcribed (P15 decision 5).
Outputs:    (1) the dispatch comparison a row gets, per the stop-and-ask's answer: the SET both ways
                plus the order the run's own CAUSALITY fixes, derived from the run's fold-input
                sequence (each dispatch's TRIGGER is the settlement before it) — and `unorderedDispatch`
                retired or kept per that answer
            (2) Q401's MEASUREMENT: the sweep re-run with every knob at its MINIMUM as well as past its
                peers, and every arrangement sampled TWICE including the greens — reported as a number,
                with anything it finds fixed. The rule's wording is left to P25's retro, with this as
                its evidence
            (3) Q402's two sentences corrected — AGENTS.md's in place, P24's plan file as a declared
                exception (a finished plan is on nobody's `Owns`)
            (4) `M3` retuned from a scratch copy at this declaration (fact 1), the declared exception
Depends on: nothing
Blocks:     nothing — P25's retro reads Output (2)
Tests:      L6 in both runtimes is the test of (1): the comparison must still refuse every wrong SET
            and every causally forced pair out of order, and must go red under W97's own arrangements.
            (2) is a measurement, run in an isolated copy, reported and not ratcheted.
Gate:       L0 (`lint`, five typecheck lanes, each separately); L6 node and deno; `check:docs` (X10 if
            a count moves) and `check:markdown` with its self-test (fact 1 moves a floor); then
            `npm run gate` with a content digest identical at both ends.
Reserves:   Q405-Q409, and ADR 0068 if the stop-and-ask takes one
```

*Reserves by grep off the tree at this declaration: the highest question on disk is **Q402** (W97 reserved Q403-Q404 and left
them unused, so they are skipped, never reused) → this item starts at **Q405**; the highest work item is **W97** → **W98**; the
highest ADR is **0067** → **0068**, taken only if the stop-and-ask's answer is a decision rather than a repair.*

## Scope

**In**: Outputs (1)-(4).

**Out** — named rather than left implicit, with where it goes instead

- **Obligation (f)'s WORDING in `doc/workflow.md`** — [Q401](../open-questions.md)'s row says *P25's retro*, and a retro is
  what edits that document. This item measures; that retro rules.
- **`src/**`** — nothing here changes the driver. If the stop-and-ask's answer needs a driver change, that is a different item.
- **The gate's cost** ([Q133](../open-questions.md), [Q373](../open-questions.md)) — `selftests` ran 1441 s at W96 and 1842 s
  at W97 with no self-test changed. Named, not taken.

## What the declaration step re-took before anything was edited

*On `fea1639`, node 24.20.0 and deno 2.9.6, in `dev-dist/w98/`. Re-run, never transcribed.*

| # | re-take | result |
|---|---|---|
| 1 | Q142's margins | **`M3`'s margin is ZERO** — probe 1 reads 123 files against a floor of 123, this file having spent the 1 W97's record step predicted. Retuned to **142**, the midpoint of the window `(123, 162]` on the tree this item ships, from a scratch-copy measurement (W80's rule, W92's precedent). `M4` safe at 653 |
| 2 | **does any rule fix the ORDER of dispatches within one turn?** | **NO.** `spec/join-policy.md` section 2 says only that *a fanout dispatches all its branches in one turn*; `JP-R5` fixes the EVENTS (every `branch.opened` before any other event for that region) and not the dispatches; `spec/flow-definition.md` section 6 explicitly declines *how many dispatches a map opens, in what order*. So the rung asserted an order no document fixed |
| 3 | the CAUSAL partial order across every L6 row | **`examples/l6.ts` asserted 647 pairs, of which 210 are RACING — two turns opened by settlements that raced — across 37 of its 55 rows.** The other 437 are forced: 281 by a trigger chain, 156 by being in ONE turn (the document's order). W97's sweep found FOUR of the 210, because a delay moves only the order it perturbs. *Two limits, both found by the readers and both in the Record: it knew the trigger chain and not the join BARRIER, nor (a) composed with (b), so 210 was an over-count — the shipped relation includes barriers and the honest figures are in the Record* |
| 4 | Q402's two sentences | **both present and both false as written.** `AGENTS.md`'s *a `RunState` is order-free by construction* sits in a `run` snippet's COMMENT in *What a join carries downstream*, which is **not** one of `X8`'s seven paired sections — so it moves without a README twin. P24's decision 7 is in a finished plan's file, on nobody's `Owns`: a declared exception |

## Stop and ask a human — ANSWERED 2026-09-29

| | the question | the answer |
|---|---|---|
| **(a)** | **L6 asserts 210 racing dispatch pairs across 37 rows. Which road?** Three were priced: (1) the CAUSAL comparison — assert the SET both ways plus only the pairs the run fixes, retiring `unorderedDispatch`, which touches the comparison all 55 rows use and probably wants a spec rule; (2) the NARROW fix Q400's row asks for — a loose set's justification names the ids rather than the row's overlap flag, leaving the 210; (3) ARRANGE all 37 rows, keeping the strength and paying the labour on every future row too | **(1), the causal comparison**, as recommended. *And it turned out to ASSERT MORE than the total order did*: 660 forced pairs against 647 of which 210 were unjustified — the old comparison left whole loose sets unordered where a join barrier genuinely forces them |

## Verification

**Routing:** not applicable — no routing changes; this item changes what a row ASSERTS about a dispatch order.

## Record

**DONE 2026-09-29.** A row of ladder L6 asserts its dispatched ids as a **SET**, and of their ORDER only the pairs the run itself fixes — **`RN-R27`**, `spec/run-state.md` v0.12 section 11, derived per row from the run's own fold-input sequence. `unorderedDispatch` is retired with its helper and its five declarations. **No ADR**: the rule states behaviour the driver already has, which is `doc/decisions/README.md`'s own criterion; ADR 0068 stays unused and is not reused. L6 **2174 assertions over 154 real runs** in both runtimes, from 2072 / 154.

### What the rung asserted, and what it asserts now

| | pairs asserted | of them, pairs the run does not fix |
|---|---|---|
| before | 647 *(the figure the declaration step took; its conformity reader recomputed the same quantity at **566**, and neither number is defended here — both came from the first relation, which knew only the trigger chain)* | **210** |
| after | **941** — 764 by the run's own causality and 177 in one turn | **0** |

**So the change asserts MORE and asserts nothing racing**, because the total order left whole `unorderedDispatch` sets unordered where a join barrier genuinely forces them. **264 pairs across 13 rows are now asserted by nothing**, which is the honest cost and the point.

### What the readers changed, and what measurement said

| | finding | what it cost |
|---|---|---|
| 1 | **CONFORMITY (blocking): `RN-R27` missed (a) composed with (b)** — where one dispatch is fixed before another, everything dispatched in ITS turn is fixed before that other too | **281 pairs**: 660 became **941**, and the reader's own derivation of 941 / 264 was reproduced to the pair |
| 2 | **CONFORMITY (blocking): `ID-R7` cited twice and does not exist** — once in a comment and once in the assertion LABEL a reader sees when the clause fails; `check:spec`'s `C2` builds its cited set from `spec/` alone | both corrected to `RN-R27` |
| 3 | **BOTH (blocking): `unorderedDispatch` was not retired** — three comments said it was while the field, `tvUnordered` and five row declarations stood with ZERO readers, green at `lint`, five typecheck lanes and `check:docs` | all seven sites gone; `CLAUDE.md`'s own hazard about a field declared and dead |
| 4 | **ADEQUACY (blocking): the census had no control**, and `rows: orderCensus.length` against `EXPECTED.length` is a self-comparison — one token made it vacuous, and six of seven derivation mutations were caught by the census ALONE | two CONSTRUCTED sequences no run produces, answered deterministically, are its control now |
| 5 | **ADEQUACY (blocking): `RN-R27` names three relations and the census counted one number** — swapping the `chain` and `turn` labels cost ZERO | the counts are split — **and measuring found the split is not run-invariant**: `chain`/`barrier` read 759 / 5 in one run and 760 / 4 in the next, because which of them reaches a join's successor depends on which branch settled LAST. Their SUM is a property of the run and `turn` of the document, so the census asserts those two and the constructed control binds the labels ([Q405](../open-questions.md)) |
| 6 | **CONFORMITY: the flake W97 shipped and PUSHED** — its arrangement clause asserted a TOTAL size order over all seven TV files in every resumed run, and L6 was RED **1 run in 6** on node (`K=4`) | asserted PER SERIES now, which is what the identity rests on: **six consecutive green node runs**. Kept inside W98 at the maintainer's direction rather than split out |
| 7 | **CONFORMITY: the barrier is keyed by `regionId` alone**, where a region INSTANCE is the pair (ADR 0062) | **measured INERT twice** — keying by instance, and narrowing the paths to the join instance's own children, each left the census unmoved — so it is declared as a ceiling (`r4`) and raised as [Q406](../open-questions.md), not claimed correct |
| 8 | CONFORMITY: the census comment contradicted itself three ways (660, 656, *437 to 656*); `RN-R27` carried the withdrawn *210 across 37 rows* in the normative layer — and **the fix for that one was itself short: it took the figure out of the rule's own ROW and left FOUR copies in the prose around it, one of them three lines under a new sentence saying the figure is not here**, found by grepping for the number rather than by any rung, which is v0.8's founding observation on prose; section 11 sat between 9 and 10; `AGENTS.md`'s corrected sentence still over-claimed (`pathEnds`, `gated` and `resumes` are sequences); the per-row control's `> 0` is weaker than `n - 1` | every one corrected; the control is `>= want.length - 1` |

### Q401's measurement — Output (2)

**47 arrangements, in BOTH directions (every knob past its peers AND at its minimum), twice each, in node and deno**: 64 green twice, 30 red, **0 INTERMITTENT — and not ONE dispatch-order clause among any red**, where the total order had four. Every red is a pre-existing arrangement its own row names (Q379's sizes, P22's overlap walks, the parked kill, W19's hostile order, Q394's thumbnails) or a claim about pool mode itself (a worker's realm, the `inline` membership). **The rule's WORDING is still P25's retro's**, as Q401's row says; this is its evidence, and finding 6 above is the second instance of that row's other half — a single green sample hid a flake in a pushed commit.

### Gate — what ran

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint`, five typecheck lanes, each separately | RAN, exit 0 | `typecheck:examples` exit 2 twice on the way, read off the exit code |
| L6 node / deno | RAN, exit 0 | **2174 / 154 in both**, and the census stable in repeated runs of each |
| `check:spec` | RAN, exit 0 | **7 / 65 / 126**; `C8` fired first on `spec/README.md`'s version column, exactly as designed |
| `check:docs` / `check:markdown` | RAN, exit 0 | `X10` named all four count copies twice on the way; `M3` retuned to **142**, the midpoint of `(123, 162]` |
| conformity reader | RAN, isolated copy | 13 findings, **5 BLOCKING**; three VALUES it derived disagreed with the code's and it was right about the one that mattered (941) |
| adequacy reader | RAN, isolated copy | 24 provocations, **4 BLOCKING**; 0 dispatch clauses red under five two-knob arrangements |
| rule 8 | RAN, FIVE passes | pass 1 **22 probes, 5 against declaration** (four my declarations, one a real hole: the census's `free` was `total − fixed`, one reading); pass 2's **CONTROL came back dirty and that is the catch** — `check:docs` red on four count copies I had left at 2173, so every verdict in it was void; pass 3's digest MOVED, because I wrote the Record while it ran — my own breach of section 6's *the tree holds still*, so every verdict in it was void as well; pass 4 read TWO ABORTS (rule 7 (b), both anchored on the `rows:` term the census had just dropped) and one WRONG-REASON whose cause was a probe whose `names` was not moved when its `why` was, so it was graded against the census while its own first failure line is the per-row control. **Pass 5 is the clean one: 27 probes, 1 control CLEAN, 16 caught, 8 declared ceilings each RUN, both grader controls right (1 CRASH, 1 WRONG-REASON), 0 aborts, 0 AGAINST DECLARATION**, digest `c16eb1f12f361974` identical at both ends over 417 files |
| `npm run gate` | **RAN, `GATE EXIT=0`, ZERO `FAIL` lines** over 31 chain entries | digest `bb186b0bbaca70a4` over 417 files at both ends. **It ran over the tree BEFORE this Record's own two tables were repaired** — three of its rows and two of its headings were each three lines, from an edit script's list/join error, and `check:markdown` and `check:docs` are green either way because nothing anywhere checks that a markdown table is well formed ([Q407](../open-questions.md)). Both checks RE-RUN over the final tree |

**Readers — overlap 3**, the sixty-SECOND measurement — *derived from section 6's own list, which ended at W94 with a count word of fifty-nine, and is brought up to the tree here: W96 is the sixtieth, W97 the sixty-first, and **W97's Record states its overlap with no ordinal at all**, which is the silent gap that made this line read sixty-first when it was written. P22's retro adopted keeping that list current as the counter-measure for exactly this, and the two items since did not apply it* — : `unorderedDispatch` not retired, `ID-R7`, and the three-relation split, each reached from opposite ends (a claim and a mutation). **Owns**: `README.md` is a LATE EXCEPTION, declared here — it carries two of the four L6 count copies `X10` holds and is a record-step file for everything else. `doc/plans/p24-*.md` is the declared exception for Q402's second sentence.

### Questions

**One more defect, found by reading this Record rather than by any rung: three of its table ROWS and two of its headings were each THREE LINES**, because the script that wrote it passed `"text ", D, " text"` as three ELEMENTS of the list it handed to `NL.join` rather than joining them first — so five em-dashes each became a line of their own and two tables rendered wrong. **`npm run gate` was EXIT 0 over that tree**, and so were `check:markdown` and `check:docs`: `M1`-`M5` validate links, anchors and two floors, and **nothing anywhere checks that a markdown table is well formed.** That is [Q131](../open-questions.md)'s and [Q135](../open-questions.md)'s three register rows by a second mechanism — a newline inside a row rather than an unescaped pipe — and it is raised as [Q407](../open-questions.md) rather than refused at one — because the clause it proposes was RUN here over 81 tables in the eight files this item touched and **fires on FOUR rows of the SHIPPED tree**: Q119 and Q87 in the register, both already declared census exemptions, and **P19's and P21's rows in `doc/README.md`'s plan-history table, which have TWO cells where the header has four, so the *Exit artifact* and *Date* columns are empty for both plans and nobody had noticed**. Those two are left for that row's owner; the repair here is this file's own.

**Resolved: [Q400](../open-questions.md)** and **[Q402](../open-questions.md)**. **[Q401](../open-questions.md)'s first half MEASURED**, its wording left to P25's retro. **Raised: [Q405](../open-questions.md)** (a relation whose LABEL varies between runs while its verdict does not), **[Q406](../open-questions.md)** (the barrier keyed by a region rather than a region instance) and **[Q407](../open-questions.md)** (nothing checks that a markdown table is well formed). Q408-Q409 unused and not reused. Census **311 / 239 / 1 / 71**. [Q142](../open-questions.md): `M3`'s margin was **0** at this declaration and is **19** after the retune. The next plan starts at **W99, Q410 and ADR 0068**.
