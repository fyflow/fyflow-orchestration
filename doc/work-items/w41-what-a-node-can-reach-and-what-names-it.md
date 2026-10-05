# W41 — What a node can reach, and what NAMES it

**Status:** done
**Plan:** [P12](../plans/p12-what-a-node-receives-and-what-a-decision-sees.md)

```
Spec:       spec/flow-definition.md sections 2-3 - this item widens both.
            spec/join-policy.md section 4 is NOT reopened (P12 decision 3):
            JP-R11 and JP-R12 are ADR 0037's and both are settled.
Owns:       src/driver/driver.ts, src/driver/routing.ts, src/definition/**,
            spec/flow-definition.md, spec/examples/**, test/driver/**,
            test/definition/**, doc/decisions/0040-*.md, and
            scripts/check-spec.mjs IF Q164 lands
            (written from P12's index row, not from this item's title -
            doc/workflow.md section 7 rule 2)
Inputs:     Q11's three candidates and P12 facts 1-6, read from the PLAN's own
            file; ADR 0036 (a map is a second node kind) and ADR 0037 (what a
            branch receives, what a join carries), read from doc/decisions/;
            spec/flow-definition.md v0.10 sections 2-4; spec/join-policy.md
            section 4's owner table and JP-R11/JP-R12; spec/task-id.md section 1
            (branchPath); src/driver/driver.ts's six `enter` call sites.
Outputs:    (1) ADR 0040 - what a node can reach, and what NAMES it.
            (2) The rule in spec/, with an id, which is what forces Q164.
            (3) The projection in the driver, and whatever reaches `enter`.
            (4) Two corpus flows in spec/examples/valid/ - one per blocked flow
                (Q166's *against the run's config*, Q165's *over the scores*) -
                each of which validateDefinition accepts and the driver runs.
            (5) L2 assertions over both, INCLUDING a map region (P12 decision 2:
                evidence that does not include one does not bind).
Depends on: nothing - P12's first item
Blocks:     W42 (which takes the same mechanism to DecisionContext), W43
Tests:      Expected values derived from spec/flow-definition.md and
            spec/join-policy.md before any run, never from output
            (doc/workflow.md section 5 rule 1). L1 in test/definition/ for
            whatever validation rule lands; L2 in test/driver/ for what the
            driver hands each node, over a fanout region, a map region, and a
            map nested in a fanout branch - the three shapes P12 fact 3
            measured. L4 is the corpus, which the two new flows join.
Gate:       L0-L5 in three runtimes, then the two spec-conformity readers,
            then rule 8's whole set re-run with the readers' edits checked in.
Reserves:   Q184-Q189, ADR 0040
```

## Scope

**In**

1. **[Q11](../questions/q11.md) in general.** Its two remaining candidates — a run-scoped
   accumulator and a declared per-edge mapping — decided as **ADR 0040**, from the three blocked
   flows rather than from a mechanism (P12's *why this plan*).
2. **What NAMES an output.** P12 decision 2: the key is the decision. Three candidates named there
   with none preferred — the node id, the task id, and the pair `(node id, branchPath)` — and the
   evidence must include a **map** region.
3. **[Q164](../questions/q164.md)** — where a rule about what a run *carries* lives, and whether
   `RULE_ID` grows by a prefix. Forced by 1 and 2.
4. **[Q166](../questions/q166.md) and [Q165](../questions/q165.md) as CASES**: each becomes a corpus
   flow that validates and runs, or the item records explicitly that it does not and why.

**Out** — named rather than left implicit, with where it goes instead

- **[Q8](../questions/q8.md) — what a decision sees.** **W42**'s, deliberately and by P12
  decision 1: the payload half has three real cases and the predicate half has one sentence, and
  answering Q8 first would let *what is cheap to hand a predicate* decide what a worker receives.
  This item may not touch `DecisionContext`'s shape.
- **A reducer on a join node.** [Q165](../questions/q165.md)'s own row, ADR 0037 rule 5's narrow
  refusal, and P12 decision 3: nothing in `spec/join-policy.md` section 4 is reopened. This item
  takes Q165's **flow** as a case, not the reducer as a feature.
- **A sixth node kind.** P12 decision 4. Every candidate here is a property of an edge, of a node's
  declaration, or of what the driver hands `enter`.
- **[Q19](../questions/q19.md)'s actual question** — whether retained state is BOUNDED. P12
  declares it out; fact 1 corrects its premise and does not answer it.
- **[Q160](../questions/q160.md)** — a map inside a map, refused at construction by W33. This item
  says whether fact 3 is one defect or a convention and does **not** lift the refusal.
- **[Q22](../questions/q22.md)'s constraint decision**, and **[Q9](../questions/q9.md)**. Both
  named in P12's `Out`.
- **The gate.** [Q181](../questions/q181.md)-[Q183](../questions/q183.md) are live and unowned.

## Verification

How each clause of `Gate:` is run. Named commands.

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| L1-L5, node | `npm test` |
| L1-L5, deno | `npm run test:deno` |
| L1-L5, chromium | `npm run test:browser` (and `npm run test:browser:all` if L1 moves) |
| L4 | the corpus test in `test/definition/l4-corpus.test.ts`, which the two new flows join |
| static checks | `npm run checks` |
| whole gate | `npm run gate` — `GATE EXIT=0` **and** zero lines beginning `FAIL`, both |

*An item that touches routing states which of these it covers.* This item touches what a node
**receives**, not which edge is taken, so:

| case | |
|---|---|
| a branch routed away from its join ([Q4](../questions/q4.md)) | **covered as a regression** — `p1-routed-away.flow.json` stays in the corpus and its L5 cells must not move |
| `user_action` ([Q17](../questions/q17.md)) | **not applicable** — a suspended node produces no edge hop, so nothing this item changes is on that road. The resumed node's hop IS covered, because `advance` is one of the six `enter` sites |
| no matching decision edge ([Q10](../questions/q10.md)) | **not applicable** — `FD-R1` is about *which* edge, and this item is about what the edge carries |
| a duplicate task id ([Q13](../questions/q13.md)) | **not applicable** — no id is minted differently. `ID-R6` and `branchPathOf` are unchanged |
| a nested fan-out ([Q6](../questions/q6.md)) | **covered, and required** — P12 decision 2 makes a map region mandatory evidence, and `map-in-fanout.flow.json` is the depth-2 shape where a node id collapses |

## Record

**Status: done.** Author pass, both readers, and rule 8's set re-run with the readers' own edits
checked back in.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint`, `typecheck` | **RAN**, green | `deno lint` 47 files; five `tsc` projects |
| L1-L5, node 24 | **RAN**, green | **23 files, 612 `test()` cases**, from 574 |
| L1-L5, deno 2.9.6 | **RAN**, green | 612, parity |
| L1-L5, chromium / firefox / webkit | **RAN**, green | 612 in each, `PARITY` in all three. `npm run gate` runs chromium only; `test:browser:all` was run because L1 moved |
| L4 — the corpus | **RAN**, green | 38 examples, from 33: two valid flows and three invalid ones |
| L6 | **RAN, and UNMOVED at 638 assertions over 31 real runs** — the declared result. W41 owns no `examples/**` and W43 is the item that moves it |
| the seven static checks | **RAN**, green | `spec` (7 documents, 38 examples, **86 rules** from 80), `source`, `wiring`, `markdown` (83 documents, 3187 relative links, 163 anchored), `scheduler`, `policies`, `docs` |
| `check:spec:selftest` | **RAN**, green | **22 probes / 23 gradings**, from 18 / 21 — the two new `C2` clauses, one probe and one grading each |
| conformity reader | **RAN** | **18 findings, 7 blocking.** Its finding 1 is a real code defect: `FD-V28` refused a valid document |
| adequacy reader | **RAN** | **98 mutations, 34 survivors (20 real, 14 vacuous or unreachable), 8 blocking** |
| **overlap** | **1 of 116** | see below |
| rule 8, author pass | **RAN** | 38 probes: 37 caught, 0 survived, 0 aborted after three re-anchors |
| rule 8, re-run after the readers | **RAN** | **54 probes: 51 caught, 2 survivors (both classified vacuous with a second route), 0 aborted, 0 wrong-reason, 0 crash** |
| `npm run gate` | **RAN**, `GATE EXIT=0`, zero `FAIL` lines | at the commit that acts on the review findings |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) **ADR 0040** | yes | `check:markdown` `M1` — eleven dead links. *(Which says nothing about the ADR being right; P11's retro records that (b) degenerates on a decision, and this row is the same shape)* |
| (2) **the rule in `spec/`, with an id** | yes — `FD-C1`, `FD-C2`, `FD-V26`-`FD-V28`, `FD-R3` | `C4` (three invalid examples), `C6` (owner cells), and `C2`'s new prefix binding, which goes red if `FD-C` leaves `RULE_PREFIXES` |
| (3) **the projection, and what reaches `enter`** | yes — `outputs()` and `compose()` | 27 L2 cases; probe 33 (`enter` uses the raw payload) costs 6 failure lines |
| (4) **two corpus flows** | yes | `l4-corpus.test.ts`'s both-ways equality against section 7's table; probes 20-22 |
| (5) **L2 assertions over both, including a map region** | yes | the FD-C2 census over **eight** region-bearing flows, four of them map-bearing, with the set derived from the directory |

**What broke.**

**The item's own driver work was destroyed by `git checkout -- src/driver/driver.ts` on a dirty
tree, and it is W35's defect exactly, by hand, outside the harness that forbids it.** The provocation
harness carries `git is never invoked, so a dirty tree cannot be destroyed` in its own header; the
command was typed at a shell while restoring a by-hand probe. Every edit was reconstructible from the
session and the file was rebuilt; nothing else was lost. **The harness's rule was right and the rule
did not cover the author**, which is `doc/workflow.md` section 6 pass 3 rule 3's sharpest shape.

**And `String.prototype.replace` corrupted two mutations and one register row, three times, in three
different files** — [Q184](../questions/q184.md). Probe 36's replacement ended `$');`, `$'` means
*the portion after the match*, and the harness wrote a truncated statement: the child failed to
**parse** and the grading reported **SURVIVED**, because `green` was *no failure line AND
`all passed`* and `all passed` came from a sibling child. Two fixes: a function replacement, which
disables the `$` vocabulary, and a `green` that requires every child at exit 0 with no crash marker.
**The same defect then reproduced in the script that inserted Q184's own row**, whose text names those
tokens.

**Python's text-mode write converted six files entirely to CRLF** — [Q123](../questions/q123.md)'s
second occurrence, four plans on, same tool, same cause. A 3834-line diff for a 458-line change, and
**`check-wiring`'s `G2` is what noticed** — it derives a dispatch block's end from the layout, and
there is no `\n}\n` in a CRLF file. That row's *"invisible to every check"* is corrected: it is
visible to one check, which reports it as a dispatch-block failure. Every file normalised back.

**What this taught.**

1. **`FD-V28` was written against a set that the same document contradicts nine lines down, and the
   author's 37 probes could not see it.** The rule asked *is the target inside a region the reader is
   outside of*, which is true of a `fanout` too — so `needs: {"a": "scoreA"}` on a node after a
   two-branch join was **refused**, and the author was told to write `["scoreA"]` and index `[0]`.
   `FD-C2`'s own measurement, in section 3, says the ids collapse **in exactly the map-bearing flows
   and in neither with only `fanout`s**. Every probe in the file used a map region, so the whole
   `fanout` half was unreachable from the set. *A probe set written against the cases the feature was
   built for cannot see a rule that is wrong about the cases it was not.*
2. **A discriminating fixture at the right ARITY can fail to discriminate on the ORDER it settles**
   — [Q185](../questions/q185.md). The two-digit fixture exists so `String.startsWith` visibility can
   be caught, and settled **descending** the probe still survived, because a node composes when it is
   entered and the earlier instance is not in the log yet. `JP-R12`'s own note prescribes *descending*
   for the key-order clause and this needs *ascending* for the visibility clause — same file, same
   arity, opposite directions. Both are asserted now rather than written in a comment, because the
   reader flipped one back for **0**.
3. **Obligation (e)'s SECOND QUESTION fires on a product item, twice, and neither instance is in
   `scripts/**`.** See below — it is what P12's Record says its retro owes a verdict on.
4. **A measured number taken at code-complete was three orders of magnitude out on the case the
   feature exists for.** The ADR's *0.027 ms over a 6-record log* was true and was not the number that
   mattered: `outputs()` was `O(log²)`, and a `needs` pointing at a large value inside a map region is
   [ADR 0037](../decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)'s
   **refused** quadratic at the author's request — **546.6 ms against 6.5** at N = 1000. v0.12
   change 2's *re-take the number on the tree the item ships* is what found both, and both changed
   what shipped: the projection is grouped in one pass and memoised, and [Q186](../questions/q186.md)
   records the cost the decision makes reachable.

**Obligation (e)'s second question, on a product item — the verdict P12's Record asks for.**

It fires, twice, and **neither instance is a command string**:

| | what was bound | what was not |
|---|---|---|
| **the fix for Q164** | `RULE_PREFIXES` gained `FD-C`, and both of `check-spec.mjs`'s patterns were derived from one constant so they cannot disagree | **the list itself was bound to nothing.** Dropping `FD-C` from it costs **zero** — the two `FD-C` rules then match neither pattern, so they are neither declared nor cited and every check is silent. *Q164's own defect, surviving inside the fix for it.* Closed by binding the list to `spec/`'s own declaration rows **both ways** |
| **the two new `C2` clauses** | the clauses run on every `check:spec` | **nothing probed them.** `check-spec-selftest.mjs` declares *one probe per `fail()` site*, its floors are literals, and `gradedIds()` derives at **id** granularity where `C2` already existed — so two new sites moved nothing and the file reported `20/20, 21/21, exit 0`. Found by the conformity reader; closed with two probes, two gradings and both floors raised |

**The scope P11's retro stated is *checks over the gate's own wiring, in `scripts/**`*, and the
second half generalises exactly as that retro predicted it would**: *any test that stubs, injects or
overrides its subject is by construction not testing what ships.* Here the subject is a **normative
document's id vocabulary**, and the shape is neither of the two procedures that retro names — not a
command bound by name and not an override that hides the default. It is a **LIST bound to nothing**,
and the question that finds it is (e)'s second one asked of a declaration rather than of a command:
*what does this list have to agree with, and what would say so?* **Recorded for the retro as a third
shape**, on one item, with the argument that the first two are both instances of it.

**And the sharper half is that the author instantiated (e) three times and its readers found both of
these.** Probes 33, 34 and 37 are (e) as written — the composition never called, the validator block
never reached, the rule rows deleted while cited — and all three passed. **The two above are (e)
asked of the SUBJECT, and the author reached neither**, which is W39's asymmetry reproduced on a
product item one plan later.

**Overlap: 1 of 116** — the TWENTIETH measurement recorded, inside the settled 0-4 band,
*(This read **the eighteenth** until P12's retro. `doc/workflow.md` section 6 lists nineteen measurements ending at W39, and [W36](w36-the-scheduler-pin-moves-to-0-5-1.md) and [W39](w39-what-the-gate-proves-and-what-it-costs.md) number themselves eighteenth and nineteenth in their own Records — so this item is the twentieth. **All three of P12's items were wrong by two, each inheriting the ordinal from the one before**: W41 took W36's number and W42 and W43 incremented from it. Section 1 rule 5's provenance clause — *any copy including your own* — on a number that was derivable by counting one list. Corrected under section 6 pass 3 rule 6.)*
 **and it is
the second ZERO-adjacent pair after [W31](w31-the-self-list-check-policies-never-had.md)'s**. Their
one shared subject is `test/driver/needs.test.ts`'s `FD-R3` suite, reached from opposite ends: the
conformity reader from `spec/`'s claim that `FD-R3` is *reported and rethrown from `start()`* (which
`FD-V27` makes unreachable), the adequacy reader from the suspended-node clause having no reachable
case. **Two different corrections, one file, neither reader's route visible to the other.** Neither
was primed with the author's uncertain claims, unlike W31's pair, so the measurement is comparable
with the seventeen before it. **The split is the one the two roles predict**: the conformity reader
found **claims that were false** — a rule refusing a valid document, three stale counts, *zero new
fields* asserted three times beside the field — and the adequacy reader found **bounds that were not
there**, seven of its eight blocking findings being obligation (c) or (d).

**Rule 8 — 54 provocations, 51 caught, 2 survivors, 0 aborted, 0 wrong-reason.** Both survivors are
classified rather than counted, each with the second route that says so:

| | why it is not a hole |
|---|---|
| probe 10, re-anchored | **vacuous.** The group's LAST record is the resolution for a resumed node and the settlement for one that settled, so it agrees with `effectiveOutcome` on both; the one input where it does not is a node parked on `user_action`, which the adequacy reader measured to be **unreachable with every shipped policy**. Recorded in `outputs()` itself |
| probe 51, re-aimed | **vacuous.** `nodes` is read in two places and both are covered independently — `ids.length` from the run, and *which* ids collapse from `allRegions`, a source neither the expectation table nor the swap can reach. **The graph-derived assertion is what turned it from a hole into a redundancy, and it was added because of this probe** |

**Five probes went stale during the item and all five were re-anchored AGNOSTICALLY rather than
re-pinned** — rule 7 (b) firing correctly four times on the author's own fixes and once on a
reader's. Two of the five had no subject left at all: the reader's compound on a literal that is now
read from `spec/`, and the reader's provenance swap on an assertion this item **deleted** for
restating `ID-R1`. Both are recorded with what replaced them rather than dropped.

**A harness whose measurement does not reach the thing that binds a clause reports its own scope as
the subject's weakness.** Probe 52 — the `RULE_PREFIXES` binding removed — came back **SURVIVED**,
because `measure()` ran `check-spec.mjs` and the clause's only binding is `check-spec.mjs --self-test`.
It is caught. The harness gained a `via: 'selftest'` field for the probes that need it, rather than
making all 54 pay twelve seconds for it. *[Q138](../questions/q138.md)'s shape one layer out from the
probes, in the harness's own scope rather than in its grading.*

**`Owns` audit — `git diff --name-only` plus untracked, 21 paths, ZERO undeclared, FIVE late
exceptions.**

| late exception | why |
|---|---|
| `AGENTS.md` | §3 gains `needs`, §9 gains `UnresolvedReference`, and three counts were stale. `Q157` again: no P12 item owns this file, and every item that changes the public surface needs it |
| `spec/README.md` | `C8`'s version row is a consequence of any `spec/**` bump — W16's finding, and section 1 rule 5 deliberately does not list it |
| `scripts/check-docs.mjs` | `RUN_FLOOR` 15 → 16, because §3's `needs` snippet is a new `run` block. **[Q102](../questions/q102.md)'s obligation for the fourth recorded time, and by the same mechanism as the third**: the obligation is created by the CONTENT of the change, not by a file set |
| `scripts/check-spec-selftest.mjs` | the conformity reader's finding 7 — the two new `C2` clauses had no probe. The `Owns` block names `scripts/check-spec.mjs` exactly, and a clause added to a check needs its self-test in the same commit |
| `doc/plans/p12-*.md` | fact 2's *six* `enter` call sites, corrected to **five** — [Q189](../questions/q189.md). Beyond the plan's Record, which section 1 rule 5 grants |

**`src/driver/routing.ts` is in `Owns` and was NOT edited**, which is the declared result: it is
W42's, and P12 decision 1 forbids this item touching `DecisionContext`.

**Questions raised.** [Q184](../questions/q184.md) `String.replace`'s `$` vocabulary silently
rewrites a mutation harness's replacement, and a crash then reads as a survivor.
[Q185](../questions/q185.md) a discriminating fixture's SETTLE ORDER is a load-bearing input that
nothing asserts. [Q186](../questions/q186.md) a `needs` reference to a large value inside a map region
is ADR 0037's refused quadratic, made available per key. [Q187](../questions/q187.md) `FD-V27`
requires reachability and not dominance. [Q188](../questions/q188.md) the suite census cannot bind
itself. [Q189](../questions/q189.md) a count from a `grep` can be a count of the file's own prose.

**Resolved:** [Q11](../questions/q11.md) in general, [Q164](../questions/q164.md),
[Q166](../questions/q166.md), and [Q158](../questions/q158.md) — the last of which had been open for
three plans because its own row named a fix in files nobody owns.

**Census re-derived: 146 questions — 99 open, 2 deferred, 45 resolved**, both halves at 146 of 146 in
exactly one cluster cell, **CONFIRMED for the ninth plan running**. The parser was written from the
register's own accumulated note and aborted **once**, in a ninth direction: eight status cells carry
emphasis on **both** sides, and a first-word test that strips only the leading `*` returns
`resolved**`.
