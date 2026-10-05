# W45 — What a reference must be able to say

**Status:** done
**Plan:** [P13](../plans/p13-when-is-a-declared-reference-refused.md)

```
Spec:       spec/flow-definition.md sections 3, 5 and 6 - this item widens all
            three. spec/join-policy.md section 4 is NOT reopened (P13 decision
            2): JP-R11 and JP-R12 are ADR 0037's and both are settled.
Owns:       src/definition/**, spec/flow-definition.md, spec/examples/**,
            test/definition/**, doc/decisions/0042-*.md, and
            src/driver/driver.ts BECAUSE a fourth reference form reaches the
            resolver - the plan's index row makes that conditional and
            measurement 5 below discharges the condition
            (written from P13's index row, not from this item's title -
            doc/workflow.md section 7 rule 2)
Inputs:     P13 facts 1-6, read from the PLAN's own file; Q187, Q186, Q22, Q190
            and Q192, read from doc/open-questions.md; ADR 0040 (what a node
            can reach) and ADR 0041 (what a decision sees), read from
            doc/decisions/; spec/flow-definition.md v0.12 sections 2, 3, 5, 6
            and 7; spec/join-policy.md sections 2, 4 and 5; the FD-V27/FD-V28
            block in src/definition/validate.ts and the compose /
            resolveReference / resolveNeeds trio in src/driver/driver.ts.
Outputs:    (1) ADR 0042 - what a reference must be able to say, deciding Q187
                between a dominance rule on FD-V27 and a fourth reference form,
                on the measurements below rather than on the principle W41 chose.
            (2) The rule in spec/ with an id, and whatever FD-V26, FD-V28 and
                FD-R3 owe it.
            (3) Whatever reaches src/definition/validate.ts and the driver's
                resolver.
            (4) A corpus flow in spec/examples/valid/ for the accepted shape and
                one in spec/examples/invalid/ per new FD-V rule (C4).
            (5) L1 assertions for the grammar and the aiming, L2 for what the
                driver hands a node when the target did NOT run.
            (6) The evidence P13's W45 row REQUIRES: a flow that a dominance rule
                would refuse and an author would want, or a record that none
                could be constructed.
Depends on: nothing - P13's first item
Blocks:     W46 (which edits the same section 3), W47 (the exit artifact)
Tests:      Expected values derived from spec/flow-definition.md before any run,
            never from output (doc/workflow.md section 5 rule 1). L1 in
            test/definition/needs.test.ts for the grammar and the aiming rules,
            at BOTH declaration sites (ADR 0041 rule 4); L2 in
            test/driver/needs.test.ts for resolution, over a fanout region, a
            map region and a map nested in a fanout branch. L4 is the corpus,
            which the new flow joins.
Gate:       L0-L5 in three runtimes, then the two spec-conformity readers, then
            rule 8's whole set re-run with the readers' edits checked in.
Reserves:   Q199-Q205, ADR 0042  (extended to Q207 at the Record)
```

## Scope

**In**

1. **[Q187](../questions/q187.md)**, decided as **ADR 0042**. P13's scope names the fork and prefers
   neither: a **dominance rule** on `FD-V27`, or a **fourth reference form** that says *if it ran*.
2. **The evidence clause, which is P13 prediction 1's whole test.** The item must exhibit a flow a
   dominance rule would refuse and an author would want, or record that none could be constructed.
3. **Whatever `FD-V26`, `FD-V28` and `FD-R3` owe the answer.** P13 prediction 4 says `FD-V27` is not
   the only rule that moves.

**Out** — named rather than left implicit, with where it goes instead

- **[Q186](../questions/q186.md)'s cost question** — **W46's**, and P13 decision 4 puts Q187 first
  deliberately: if the answer is a fourth reference form, that form is where a size question would
  also have to live, so deciding the cost first would let it pick the grammar.
- **[Q190](../questions/q190.md)** — decided as ACCEPTED, both shapes confirmed at P13 fact 5.
- **[Q192](../questions/q192.md)** — the edge caller's one independent bound on `resolveReference`.
  This item **moves that expression** and says so in its Record rather than closing the row.
- **[Q22](../questions/q22.md)**, **[Q19](../questions/q19.md)**, the gate
  ([Q181](../questions/q181.md)-[Q183](../questions/q183.md)) and
  [Q165](../questions/q165.md)'s reducer — P13's `Out` list, unchanged.
- **A new node kind** — P13 decision 3. Every candidate here is a property of a reference.
- **`spec/join-policy.md`** — P13 decision 2. `JP-R5` is *read* below and not edited.

## What was measured before anything was built

`doc/workflow.md` section 1 rule 5's writing clause: every figure states the scope it was measured
at. The scripts are thrown away with `dev-dist/`.

**Nine measurements. Every one of P13's six facts HELD, one of its predictions' own enumerations did
not, and the deciding fact is one nobody had taken.**

> **FOUR OF THESE NUMBERS WERE WRONG AS FIRST WRITTEN, and the item's conformity reader re-derived
> every one.** Rows 3, 4, 7 and 8 read **121 / 29 / 7** and *"in 14 of 25 flows"*. The probe's
> registry was hard-coded and did not carry `earlierWasLowConfidence`, so `FD-V4` fired on one of the
> two `decision-on-an-earlier-step` files and the walk silently ran over **25** files where row 2 in
> the same table says 26. Re-taken with the registry derived per flow: **127 / 30 / 8 over 7 distinct
> shapes / 22**, in **13** of the 26. **`22` was the only one of the five that survived**, and the
> 7-shape list in row 8 is unmoved item for item. *A measurement that has to skip what it cannot
> validate must say what it skipped* — and the symptom was in this table all along, two adjacent rows
> saying 26 flows and 25 flows. **The four properties the decision rests on are now an executable L1
> suite** rather than prose in three files, and the absolutes are deliberately not pinned
> ([Q102](../questions/q102.md)).
>
> **And re-taking it found a second thing.** Once `FD-V29` ships, using the whole validator as the
> admission test refuses **exactly** the certainty set, so it reports *certainty refuses 0* and the
> measurement is circular. Measured: it does. The admission test excludes `FD-V29` by name.

| # | | measured |
|---|---|---|
| **1** | **P13 fact 1 reproduces, and it is already asserted** | `validateDefinition` returns **0 findings** on `ingest -> decide -> {flag, publish}` with `publish` declaring `needs: {"f": "flag"}`; the branch that routes around `flag` stops with `UnresolvedReference` naming the node, the path, the key and the target. `test/driver/needs.test.ts`'s *L2 — FD-R3* suite is that flow, checked in since W41 |
| **2** | **P13 fact 2 reproduces EXACTLY** | Iterative dominators over the entry-rooted DAG, across `spec/examples/valid/**` and `examples/flows/**`: **26 flows, 6 aimed references, dominance would refuse 0** — the same three numbers, from a walk written from section 4's arc enumeration rather than from `src/definition/regions.ts` |
| **3** | **and its ZERO is a property of what the corpus WRITES, not of the rule.** This is the deciding fact | The corpus **ADMITS 127** references — every (reader, target, form) triple `FD-V26`, `FD-V27` and `FD-V28` accept today, measured by running `validateDefinition` itself so the two halves cannot drift — and **plain dominance refuses 30 of them, in 13 of the 26 flows** |
| **4** | **One of the 30 is a document this spec calls VALID nine lines from the rule** | `needs: {"a": "scoreA"}` on `publish` after `fanout-join`'s two-branch join: **0 findings**, the run dispatches all four tasks, and `publish` receives `{"a":{"a":"A"}}`. `FD-V28`'s own note records its first version refusing exactly this and calls it *"a valid document"*. **A dominance rule on `FD-V27` would refuse what `FD-V28` declares legal, in the same document** |
| **5** | **A reference to a task that FAILED resolves to `null`, with the key PRESENT** | `fanout-failure`, `scoreA` optional and settling `failed`: `publish` receives `{"got": null}` and no failure is reported. So `null` already means *ran and produced nothing*, and **an ABSENT KEY is the only answer a conditional form can give that an author can tell apart** |
| **6** | **P13 fact 6 reproduces and the grammar has room** | `"flag?"`, `"?flag"`, `"flag!"`, `["flag","?"]`, `["flag?"]`, `{"node":"flag","optional":true}`, `"flag."` and `".flag"` are **all refused today by `FD-V26` alone** — `referenceTarget` returns `null` for every one — because `?` `!` `.` are outside `FD-V16`'s charset and no node may ever be named with one |
| **7** | **The graph has TWO kinds of branching and dominance cannot tell them apart** | A `task`'s edges are **disjunctive** — exactly one is taken (section 3 routing rule 2). A `fanout`'s or `map`'s branches are **conjunctive** — all are entered, and `JP-R5` emits every `branch.opened` before any dispatch. A **certainty** walk that adds a region's branch entries to its join's set refuses **8 of the 127**, over **7 distinct shapes**, so **22 of plain dominance's 30 are references a correct rule accepts**. The 8 are a strict subset of the 30 — measured, both walks in one file, *refused by certainty only: 0* |
| **8** | **and the 8 are exactly the references that can fail** | `decision-on-an-earlier-step: publish "review"` (Q187's own shape); `nested: publish "scoreC"` / `"scoreD"` and `nested-suspend: publish "reviewC"` / `"scoreD"` (inner branch entries, reachable only if the outer branch progressed); `map-in-fanout: publish ["merge"]` and `nested-map: publish ["item"]` (a map region inside a fanout branch). **0 of the 6 references the corpus writes** |
| **9** | **and all three non-arrival roads RESOLVE, which is why 22 is not luck** | `p1-routed-away` with `publish` needing the arriving branch gives `{"got":{"A":1}}`; needing **the branch that LEFT the region** gives `{"got":{"B":2}}`, which is a value `JP-R12` deliberately does not carry; `fanout-failure` with `publish` needing the branch that **exited** via a failure edge gives `{"got":null}`. No `FD-R3` on any of the three |

**And the rule's LIMIT is a property of the POLICY, measured rather than argued.** Measurement 7's
certainty walk rests on `JP-R5` **and** on no policy firing a join while a branch entry is parked at
`user_action` — and `validateDefinition` is not given the policy, which is `FD-V15`'s own note in
the document. Constructed: a policy satisfied on the first arrival, `scoreA` parked, `scoreB`
arriving — **`publish` is not dispatched and `UnresolvedReference` is reported.** So the rule
**removes cases from `FD-R3`'s reach and does not replace it**, and an unsound acceptance degrades
to today's behaviour rather than to something worse. [Q97](../questions/q97.md).

**One thing P13's own file says is wrong, and trying to act on it is what found it.** Prediction 4
reads *"that table's row count is a live bound in three places: `check-spec`, W41's L1 census, and
W43's L6 cross-row clause"*. **It is two.** Grepping the whole tree for the table's own header line
finds `test/definition/needs.test.ts:48` and `examples/l6.ts:2510` and nothing else;
`scripts/check-spec.mjs` contains the string `reference` **zero** times and has no clause over that
table. What it *does* bound is the RULE census — `C2` uniqueness and prefix membership, `C4`'s
invalid example per `FD-V`, `C6`'s owner cell, `C8`'s version row — which moves when a rule is added
and is a different claim. Corrected in the plan's prediction table as a **declared late exception**,
because leaving it would make the retro's verdict on prediction 4 false.

## Verification

How each clause of `Gate:` is run.

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| L1-L5, three runtimes | `npm run test`, `npm run test:deno`, `npm run test:browser` — and `npm run test:browser:all` if any suite reads a `spec/**` document the browser bundle does not inline (W32's and W33's defect) |
| L4 | `test/definition/l4-corpus.test.ts` — the corpus and section 7's table, both ways |
| L6 | `npm run test:l6`, `npm run test:l6:deno` — **run as a regression this item must not break**; the exit artifact is W47's |
| static checks | `npm run check:spec` (`C2`, `C4`, `C6`, `C8` all move when a rule is added), `npm run check:source`, `npm run check:markdown` |
| conformity reader | fresh context, spec first and artifact second |
| adequacy reader | fresh context, in an isolated copy |
| rule 8 | the whole set at v0.13 — five obligations, four requirements on the set, one on the harness — then re-run with the readers' edits checked back in |
| gate | `npm run gate`, against the control run recorded below |

**Routing cases this item touches** (`doc/workflow.md` section 5's checklist). *(This paragraph
claimed two things that were not true when it was written, and both of W45's readers found them. It is
corrected rather than rewritten, so the shape of the error stays legible: **a `Verification` row is a
declaration of intent and reads as a report**.)*

| case | | |
|---|---|---|
| a branch routed away from its join (**Q4**) | measurement 9, and **it is asserted now** | *This read "is measurement 9 and is asserted" while only ONE of measurement 9's three probes had an assertion — the `fanout-failure` exit road, by the `FD-C4` `null` test. The two `p1-routed-away` probes had none, and the interesting one is a reference to the branch that **LEFT the region**, whose value `JP-R12` deliberately does not carry.* Both are asserted at L2 |
| no matching decision edge (**Q10**) | not this item's | unchanged |
| `user_action` (**Q17**) | the certainty rule's stated limit, and **it is asserted now** | *This read "is asserted at L2" and nothing asserted it: `grep -rn FD-V29 test/ examples/` returned the L1 suite and two L6 `why` strings, and the file it pointed at said in prose that the case was **deliberately not** a fixture, citing a Record that did not yet exist.* It is a checked-in L2 fixture with a constructed policy and a shipped-policy control — and **parking is inessential**, so the fixture uses a branch entry that simply never settles |
| a duplicate task id (**Q13**) | not applicable | unchanged |
| a nested fan-out (**Q6**) | measurement 8's `nested`/`nested-suspend` rows, asserted at L1 | held |

**The control run, taken before anything was built** (`doc/workflow.md` section 5 rule 8's
requirement on the HARNESS, and the baseline every revert cost below is measured against).
`npm run gate` at `a2c9325`: **`GATE EXIT=0`, zero lines beginning `FAIL`, 15 chain entries**;
`spec` 7 documents / 40 examples / 87 rules; `markdown` 87 documents / 3534 relative links / 171
anchored; **24 files / 633 `test()` cases** in node 24.20.0, deno 2.9.6 and chromium; **760
assertions over 36 real runs** at L6 in node and deno; `selftests` 7/7 completed, 7 ok, 416.1 s.

## Record

**Gate — what ran.** One row per clause of the `Gate:` line. Every number below was re-taken on the
tree this item ships, after the readers' findings were acted on (`doc/workflow.md` section 1 rule 5's
WHEN clause).

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN** | `deno lint` 48 files, `npm run typecheck` all five projects, clean |
| L1-L5, three runtimes | **RAN** | **24 files / 654 `test()` cases** in node 24.20.0, deno 2.9.6 and chromium, from 633. `npm run test:browser:all` was run because L1 moved and two `spec/**` fixtures were added: **654 in firefox and webkit too**, parity with node |
| L4 | **RAN** | the corpus and section 7's table, both ways — `spec/examples/valid/` is 14 files, from 12 |
| L6, both runtimes | **RAN** | **806 assertions over 38 real runs** in node and deno, from 760 / 36. Two rows added, and see the `Owns` exception below for why they are here rather than in W47 |
| static checks | **RAN** | all seven green. `spec` **7 documents / 43 examples / 89 rules** from 7 / 40 / 87; `markdown` **89 documents / 3651 relative links / 178 anchored** from 87 / 3534 / 171. *(The link and anchor figures were 3583 / 171 at code-complete and are re-taken on the tree this item ships — this Record and the register rows are themselves prose that carries links. Section 1 rule 5's WHEN clause, on the numbers the clause exists for.)* **[Q142](../questions/q142.md) did NOT fire**: `check:markdown:selftest` is 37/37 caught and 7/7 bounded, and both `removes` probes still trip their floors, so `M3` and `M4` need no retune |
| conformity reader | **RAN** | **14 findings, 8 blocking.** Every one acted on; the numbers this item was argued from were wrong in four places and it re-derived all four |
| adequacy reader | **RAN** | **41 mutations, 6 real survivors + 1 vacuous, 3 blocking.** Isolated copy at `../w45-adequacy`, verified green before it started and restored after; no symlinks and no reparse points, checked before and not assumed |
| rule 8, author pass | **RAN** | 38 probes: control OK, 34 caught, 3 declared ceilings, **0 survivors standing, 0 aborts**. It found two real holes and both were closed before the readers saw the tree |
| rule 8, re-run | **RAN** | **50 probes: control OK, 46 caught (one of them a named refusal at exit 1 with no failure line), 3 declared ceilings, 0 survivors standing, 0 aborts** — with **ten of the readers' exact edits checked back in**. The re-run earned its place twice: see *What broke*. *(**The three ceilings were NOT RUN, and P13's retro measured them** — `doc/workflow.md` section 6 pass 3 rule 6. This harness, W46's and W47's are one lineage and all three had a code path that executed nothing for a row declared `red: []`: the command list was empty and the verdict restated the declaration, which W47's conformity reader caught by TIMING a probe. Re-run: `b1-adr-deleted` and `c3-sawverdict-resourced` come back clean at `l1=0/exit0` and their reasons hold. **`e4-roles-list-unbound` does not.** It says *a member added to `ROLES` with no arm and no pool costs ZERO, at L6 and at typecheck* — true when written, and **[W47](w47-the-blocked-flow-on-real-workers.md) closed it**: the same mutation now costs **2 at L6**. Running it against L1, which is what this harness controls on, cannot see that, and it is why v0.14's clause names the rung. The count of ceilings is right; one of the three is now stale and says so here.)* |
| gate | **RAN** | `npm run gate` — `GATE EXIT=0`, **zero lines beginning `FAIL`**, 15 chain entries. `selftests` **553.0 s wall / 1267.8 s serial-equivalent over 5 lanes**, against the control run's 416.1 / 762.3 at `a2c9325`. **No claim is made about the difference**: wall time here is not reproducible ([Q179](../questions/q179.md), measured at a 32% spread on one entry alone), the serial-equivalent moved by more than the two probes this item adds could explain, and every self-test re-walks a tree that grew by six files and ~120 links. It is one reading |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) ADR 0042, deciding Q187 | yes | `M1` reports 11 dead links if the file leaves. **Its TITLE is a declared ceiling** — changing it costs 0, because a decision is prose and only its links are bound |
| (2) the rule in `spec/` with an id, and what `FD-V26`/`FD-V28`/`FD-R3` owe it | yes — **`FD-V29` and `FD-C4`**, and `FD-V27` is the one rule that did NOT move | `check-spec` `C2`/`C4`/`C6`/`C8` (4 failures) and 1 L1 failure if the `FD-V29` row leaves section 5; 1 L1 + 1 L6 if the reference table loses its new row |
| (3) whatever reaches the validator and the resolver | yes — `certainlySettled` in `src/definition/regions.ts`, `FD-V29` in `validate.ts`, `ABSENT` and two call sites in `driver.ts` | 7 L1 failures for the certainty walk, 8 for the suffix exemption, 2 L1 + 1 L6 for `FD-C4`'s node site, 1 L1 for its edge site |
| (4) a valid corpus flow and an invalid case per new `FD-V` | yes — `reference-if-it-ran`, `reference-past-a-map-arity`, `FD-V29--reference-across-a-decision` | 3 L1 failures if a valid flow leaves the glob; `check-spec` `C4` + 1 L1 if the invalid case stops violating its rule |
| (5) L1 for the grammar and the aiming, L2 for what the driver hands a node when the target did not run | yes — `L1 — FD-V29`, `L1 — FD-V29 is not dominance`, `L2 — FD-C4`, and four rewritten L2 cases | 1 L1 failure if either new suite leaves the runner's glob — the census in `l4-corpus.test.ts` names both |
| (6) **a flow a dominance rule would refuse and an author would want, or a record that none could be constructed** | yes — **22 of them**, from flows already in the corpus | the L1 measurement suite: certainty ⊂ dominance, certainty-only = 0, the gap > 0, and 0 of the written references refused |

**What broke.**

**The conformity reader falsified the measurement this decision is argued from, and `22` was the only
one of five that survived.** The probe's registry was hard-coded and did not carry
`earlierWasLowConfidence`, so `FD-V4` fired on one of the two `decision-on-an-earlier-step` files and
the walk silently ran over **25** files where fact 2's own row in the same table says 26. Re-taken
with the registry derived per flow: **127 admitted / 30 dominance / 8 certainty over 7 distinct
shapes / 22 in between, in 13 of the 26 flows**, against the shipped 121 / 29 / 7 / *14 of 25*.
Corrected in six places. *A measurement that has to skip what it cannot validate must say what it
skipped* — and the visible symptom was in the table all along: two adjacent rows saying 26 flows and
25 flows.

**And re-taking it found a second thing, which is why the corrected walk carries a warning.** Once
`FD-V29` ships, running the whole validator as the admission test refuses **exactly** the certainty
set — so it reports *certainty refuses 0* and the measurement is circular. Measured: it does. The
admission test excludes `FD-V29` by name, and the L1 suite says so in place.

**`FD-C4` at the EDGE site was asserted by nothing, and the author's own set found it.** Dropping the
`v !== ABSENT` guard in `resolveNeeds` cost **0** across the whole suite, after which a predicate
reads `'f' in ctx.needs` as **true** and `ctx.needs.f` as a `Symbol`. Two attempts were needed: the
first fixture used the array form, which gives `[]` whether the guard is there or not, and a
one-form reference whose target always ran — so it reached neither. **The reachable case is a
one-form conditional reference across a DECISION**, which is the shape `FD-V29` accepts and this
plan exists for.

**Both readers found the same two things, from opposite ends.** The **certainty rule's stated LIMIT
had no observer anywhere** — W45's `Verification` claimed it was *"asserted at L2"* and the file it
pointed at said the opposite in prose, pointing at a Record that did not yet exist. ADR 0042 rule 5
is what makes `FD-V29` affordable to have got slightly wrong, and that argument was unbound. It is
now a checked-in L2 fixture with a constructed policy **and a shipped-policy control beside it**, so
the row is a statement about `FD-V29` rather than about any policy this repository ships. And **the
`Owns` split could not hold** — see below.

**The limit is a property of the POLICY and every one of five statements of it named ONE ROAD.**
*Parked at `user_action`* was written into the v0.13 header, `FD-V29`'s row, `FD-R3`'s row, ADR 0042
rule 5 and `certainlySettled`'s comment. Parking is inessential: a policy satisfied on the first
arrival, with the other branch entry **simply never settling**, dispatches the reader and `FD-R3`
fires with no `user_action` anywhere. All five corrected. *The rule text was right and every
enumeration of its limit was narrower than it.*

**The adequacy reader found `FD-V29`'s own central expression unexercised above two predecessors.**
`for (const p of ps.slice(1))` narrowed to `ps.slice(1, 2)` cost **0 failures** — every fixture in
the tree merged exactly two paths — and `FD-V29` is *"a node is on EVERY path"*. On a three-way
merge the narrowed walk **accepts** the document and the workload that skips the target dies at run
time on `FD-R3`: **Q187 re-opened for one edited slice bound.** Closed with the reader's own
document, plus an assertion that the reader really has three inbound arcs.

**And it found the grammar's own free refusals held down by one integer.** `"?"`, `"?ingest"`,
`"ingest??"` and `".?"` were four rows in a list bounded by `equal(ranRefused.length, 12)`; deleting
all four and editing the literal cost **0**, after which `referenceTarget` could be made to accept
`".?"` and `"?"` for 0 as well. That is `Q102`'s shape **twenty lines below the comment that names
it** — the ACCEPTED list beside it reads `referenceTableRows()` out of the normative document for
exactly this reason. Closed by GENERATING the cases: `{valid, invalid, dot, empty}` x
`{none, trailing, leading, twice}` is sixteen spellings and exactly three are accepted, so no row can
leave. **The four rows then became deletable for 0 by construction and were removed**, on this item's
own argument for deleting `target === n.id`.

**And the fix for that had the same defect one layer in, found by rule 8's re-run.**
`cells.length === Object.keys(bodies).length * Object.keys(suffixes).length` shrinks on **both** sides
when an axis member leaves, so dropping `empty` cost **0**. Both axes are now named by set equality.
*Q102's shape inside the fix for a reader's finding about Q102's shape* — which is rule 8's own
founding observation, and it is the second time in this item that the re-run caught it.

**The L6 pair was held down by nothing, and collapsing it made `FD-C4` dead at L6.** Making the HIGH
row take the LOW payload, with its `dispatched` and `nodeResults` edited to match and
`DECLARED_TOTAL` bumped by one, cost **0** — and then `FD-C4` resolving to `null` cost 0 and the
whole conditional branch could be deleted for 0. v0.13's fourth requirement on the SET, on the
plan that did not write it. Closed with four cross-row clauses reading the rows' own payloads,
dispatch lists and `sawVerdict` values.

**Five more written claims were false and are corrected in place.** `src/definition/validate.ts`'s
header said *"Twenty-four refusals"* where the file implements **27** — the increment was applied to
a number nothing was tracking, and it had been wrong by three before this item too. `spec/README.md`
stated the refusal count twice and **both could be moved for zero** while `check-spec` printed the
true number in the same terminal, so `C4` now compares them; its own first run then found the row's
v0.11 sentence quoting *"C4 covered 26"* in the present tense, which is the live-versus-historical
split W36 leaked twelve times. Section 3 called `"."` *"the one invented token"* ten lines above the
row that added the second. A sentence quoted ADR 0040 rule 5 as *"three forms and two tokens"*, which
is not in it and misstates the half v0.13 moved. `FD-C4`'s Test cell prescribed *"a nested map
region"* and the fixture uses sibling regions — the third occurrence in that document of a rule cell
naming a test other than the one that exists. And `CLAUDE.md`'s L6 line said thirty-six real runs.

**And the sharpest thing neither the ADR nor the rule owns: `FD-V28` asks a REGION question,
resolution applies a PATH filter, and section 3 asserted they agree.** They do not, for **sibling**
map regions at the same depth — which is the shape of the flow this item added to keep `FD-R3`
reachable. `publish` inside `rank` is outside `region(split)`, so `FD-V28` demands `["score"]` and
says *"it produces one output per ITEM"*; the array holds **at most one** entry, the `score` output
whose branch path is numerically equal to `publish`'s own index in an unrelated region. Measured on
the shipped document at three arity pairs. **There is no form an author can write from inside `rank`
that yields all of `score`'s outputs.** The cause is `FD-C1`'s prefix predicate, whose three worked
examples in section 3 are all ancestor/descendant; the fix is a fourth refusal or a change to the
predicate, and the predicate is ADR 0040's KEY, which P13 decision 1 forbids this plan from
reopening. Recorded with the measurement in section 3, in `FD-C1`'s `["n"]` row, in section 7's row
for the flow, and as [Q206](../questions/q206.md).

**`Owns` audit — 20 tracked files changed and 6 added, against a block of 6 paths plus section 1
rule 5's six record-step files. SIX late exceptions, ZERO undeclared.** *(This table read FIVE and
enumerated five; the sixth is the last row, and it was declared in this item's measurement section
before it was taken and left out of the count here. Found by running `git diff --name-only HEAD` at
the record step, which is what section 7 rule 2 asks for and is why the count moved rather than the
set — the same shape as W16's stale count of a correct set.)*

| exception | why | forced? |
|---|---|---|
| `AGENTS.md` | the consumer reference states the reference forms, the refusal count and what `FD-R3` costs, and all three moved | **yes** — and P13 line 181 declared this file as its live test of P12's refused pre-declaration rule |
| `spec/README.md` | `check-spec`'s `C8` makes its version row a consequence of any `spec/**` bump | **yes**, and the same test |
| `test/driver/**` | `FD-V29` invalidated four fixtures **W41 and W42** built — the cheap way to construct an unresolvable reference is exactly what the rule now refuses. P13's index row gives this tree to **W46** | **yes** |
| `examples/**` | `examples/l6.ts` carries a live bound on `spec/flow-definition.md` section 3's reference-table ROW COUNT, and it goes red the moment the table grows. Also the `forms` bucketing could not express a conditional reference. P13's index row gives this tree to **W47** | **yes** |
| `scripts/check-spec.mjs` and `scripts/check-spec-selftest.mjs` | `C4` gained two clauses binding `spec/README.md`'s refusal count, with two self-test probes; the self-test is **24 probes / 23 gradings** from 22 / 23 | no — taken on the adequacy reader's finding 7, at the second occurrence of that defect in that row |
| `doc/plans/p13-*.md` **beyond its Record** | section 1 rule 5 allows *the plan's Record* and nothing else in that file. **Prediction 4's enumeration was wrong** (three places, and there are two) and **fact 2's INFERENCE was false** (the corpus writes 6 and admits 127) — and leaving either would make the retro's verdict on its own predictions false, which is section 6 pass 3 rule 6's argument in the other direction | **yes**, and it is the case that rule was written for, reached from the item rather than from the retro |

**`scripts/check-docs.mjs` was NOT needed**, which is the third of the three files P13 line 181 names.
**So the answer to the test P13 set is: `AGENTS.md` and `spec/README.md` yes, `scripts/check-docs.mjs`
no** — and the two that were needed were needed for the reason P12's retro predicted, while the
exceptions that actually cost something were the two the plan's own index row created. That is
[Q203](../questions/q203.md) and it is the retro's to judge.

**Census re-derived, CONFIRMED for the TWELFTH plan running.** 155 / 107 / 2 / 46 before this item's
rows and **164 / 115 / 2 / 47** after; 42 ids in both tables, from 41; **164 of 164 in exactly one
cluster cell**. The parser was written from scratch from the register's own note and **aborted ZERO
times on its first run**, the third time that has happened — and then its *exactly one cluster cell*
clause aborted **twenty** times, correctly, because it counted Q ids in every cell of a cluster row
and the third cell names them in prose. The **tenth** direction a parser of that file has been wrong
in, the clause is now in the note, and it is the first time an abort found a defect in a CLAUSE while
every count the parser had already produced was right. [Q204](../questions/q204.md).

**What this taught.**

**A rule measured against the references a corpus WRITES is measured against its authors' habits.**
P13 fact 2 is a true measurement — dominance refuses 0 of the 6 — and *therefore adopting it costs
zero* does not follow from it. The corpus admits 127 and dominance refuses 30. The admitted-set
measure is one nested loop, no plan had used it before, and it is the whole of what turned a
principle into a decision. [Q199](../questions/q199.md).

**And the two candidates a register presents as a fork were halves of one mechanism, for the second
time in two plans.** ADR 0040 found it for Q11's three candidates — *they are a stack, not a fork* —
and Q187's two are the same shape: the rule can refuse an uncertain reference only because the form
gives the author something to write instead, and the form is more than an affordance only because the
rule refuses the alternative. *When a register row names two options, the question worth asking first
is whether either is sufficient alone.*

**Questions raised.** [Q199](../questions/q199.md)-[Q207](../questions/q207.md), nine of the seven
reserved plus two — the block was extended by two at this Record, which is the fourth consecutive
plan to extend. **[Q187](../questions/q187.md) is RESOLVED** and [Q192](../questions/q192.md) is amended rather than closed, which is what P13's *open questions this plan carries* table asked of it.

| Q | |
|---|---|
| [Q199](../questions/q199.md) | a rule measured against what a corpus WRITES is measured against its authors' habits |
| [Q200](../questions/q200.md) | `FD-V29` is the first `FD-V` whose soundness rests on something the document does not contain |
| [Q201](../questions/q201.md) | a `?` written where nothing needed it is accepted and inert — Q190's shape, in a second rule |
| [Q202](../questions/q202.md) | `CROSS_ROW` is a literal whose right value depends on the number of ROWS, so it is not a constant |
| [Q203](../questions/q203.md) | P13's index row split `src/driver/driver.ts` from `test/driver/**` and `examples/**`, and the split could not hold |
| [Q204](../questions/q204.md) | a census parser can be right about the counts and wrong about *exactly one* |
| [Q205](../questions/q205.md) | a conditional reference cannot tell *did not run* from *ran and returned `null`* |
| [Q206](../questions/q206.md) | `FD-V28` asks a REGION question and resolution applies a PATH filter, and section 3 asserts they agree |
| [Q207](../questions/q207.md) | `certainlySettled`'s `map` arm is redundant today, by a rule this repository has discussed lifting |

**Reader overlap: 2 of 21, and it is the TWENTY-THIRD measurement** — derived by counting
`doc/workflow.md` section 6's own list, which runs W4 … W43 and holds **22** entries. Inside the
settled 0-4 band, and **neither reader was primed**. Their shared subjects were the certainty rule's
limit having no observer and the `Owns` split, reached from opposite ends: the conformity reader from
a `Verification` row that claimed the assertion existed, the adequacy reader from an ADR arm with no
observer of any kind. **Their split is the one the two roles predict** — the conformity reader found
**claims that were false**, four of them numbers this decision is argued from; the adequacy reader
found **bounds that were not there**, and all three of its blocking findings are loop bounds or list
bounds rather than values.
