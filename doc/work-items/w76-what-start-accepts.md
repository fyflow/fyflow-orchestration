# W76 — What `start` ACCEPTS: `onRegionEvent` forwarded, and the two lists bound both ways

**Status:** done
**Plan:** [P20](../plans/p20-what-the-runtime-owes-a-consumer.md)

```
Spec:       none — `StartOptions` is a TypeScript surface and appears in no spec/ document
            (grepped: `StartOptions` occurs in AGENTS.md, doc/plans/** and doc/work-items/**,
            and in nothing under spec/). No FD-, RN-, OR-, JP-, ID- or RT- rule moves.
Owns:       src/scheduler/runtime.ts, test/scheduler/**, AGENTS.md section 10
            (written from P20's work-items row, `doc/workflow.md` section 7 rule 2 — and the
            row's fourth path, README.md, is CORRECTED at this declaration step: see Exceptions)
Inputs:     P20 facts 1, 2 and 6, RE-RUN here rather than transcribed (dev-dist/w76/*.txt);
            Q297's row; W71's item file, which raised Q297 and set the tripwire this item inverts,
            and whose ceiling `f3` names the list this item binds; ADR 0014 rules 1-3;
            P18 decisions 10 and 14; doc/workflow.md v0.20 rule 8 (b), (d), (e)
Outputs:    (1) `onRegionEvent` on `StartOptions` and FORWARDED, so a consumer of createRuntime
                can watch a fan-out — Q297 closed;
            (2) the two hand-written lists BOUND BOTH WAYS by a test that reads the shipped
                source: every StartOptions member is reached by `start`, and everything `start`
                reaches is declared;
            (3) fact 1's partition asserted with ORPHAN COUNT = 0, so a DriverOptions member
                added later cannot join the unreachable set in silence;
            (4) a behavioural arrival test per StartOptions member — the SECOND observer
                obligation (c)'s LIMIT asks for, since (2) and (3) both read one text;
            (5) AGENTS.md section 10 inverted rather than deleted: the snippet asserts the events
                DO arrive and are FROZEN, and keeps a guard that fires if the answer changes back.
Depends on: nothing
Blocks:     W77
Tests:      test/scheduler/runtime.test.ts — expected values from P20 fact 1 (the partition, the
            four roads) and from THIS item's own declaration-step measurements, taken on the
            shipped tree before a line was edited (dev-dist/w76/decl-partition.txt,
            decl-before.txt): 18 members, 4 roads, 0 orphans after; §10's flow sees 4 region
            events on a hand-built driver, 2 `branch.opened` + 2 `branch.arrived`, all frozen.
            NOT from this module's output.
Gate:       L0 under all five typecheckers; L1-L2 through `runtime.start` on the RECORDED pool
            seam — the two suites in test/scheduler/** use `seams()`, and the real-inline-pool
            half is carried by AGENTS.md section 10, which `check:docs` EXECUTES on a real
            `createRuntime` (conformity reader, finding 13: the first version of this line put
            both in test/, and only one is there); `check:docs` (which fact 2 p2 says goes RED until
            section 10 is rewritten — predicted, and this item MEASURES it); `check:source`;
            then the two spec-conformity reader passes and rule 8 re-run.
            L6 UNMOVED — this item adds no row and changes nothing a worker receives.
Reserves:   Q315-Q319; no ADR — 0058 is W77's
```

## Scope

**In**

1. **`onRegionEvent` added to `StartOptions`' `Pick` and forwarded by one conditional-spread line.**
   P20 decision 4: `RuntimeRegistry` is untouched, because P18 decision 14 defines it as *exactly
   the object this runtime hands its own drivers* and a per-RUN callback is not part of that object.
2. **The two lists bound BOTH WAYS, and the binding derives the exception rather than declaring
   it.** P20 decision 5 names `joinPolicy` as the legitimate member with no spread line, because it
   is applied as `?? liveToken`. **This declaration step measured that `??` is a ROAD and not an
   exception, and that the two roads are total in both directions** — see finding B — so the
   binding is *every member is reached by exactly one of the two roads*, **with no name written
   down in the binding itself**. *(A separate case PINS the `??` road's membership to
   `['joinPolicy', 'runId']`, deliberately, so that moving a member between roads is a failure
   rather than a silent change. The first version of this line ran the two together and claimed the
   whole suite named nobody; both readers said so, and it is the only subject they shared.)*
3. **The partition asserted, orphan count 0.** Fact 1's own shape, as a test, so a nineteenth
   `DriverOptions` member cannot become a second `onRegionEvent` silently.
4. **A behavioural arrival observer per `StartOptions` member.** (2) and (3) are two regexes over
   one file, which is obligation (c)'s LIMIT verbatim — *a both-ways comparison is worth having;
   what it is not is a second observer*. Four members already have one (`createTask` F3,
   `joinPolicy` F2, `onFoldInput` F5, `runId` F19); the other four and `onRegionEvent` do not.
6. **The forwarded stream held EQUAL to the driver's own region stream, element for element** —
   added after the adequacy reader, and it is what makes the forwarding claim total rather than
   true of one topology. See *What the readers changed* below.
5. **`AGENTS.md` section 10 INVERTED.** The snippet stops asserting that the road cannot see region
   events and starts asserting that it can, that they are frozen, and what they are — with the
   guard kept and pointed the other way.

**Out** — named rather than left implicit, with where each goes instead

- **A completion handle on `start`.** W77, ADR 0058. This item changes what `start` ACCEPTS and
  nothing about what it RETURNS; `start`'s return type is untouched.
- **An L6 row.** W78. L6 is UNMOVED here and the Gate line says so.
- **`RuntimeRegistry`.** P20 decision 4. A per-run callback is not part of the object a hand-built
  `Driver` is spread from, and making it one would falsify P18 decision 14.
- **`src/driver/driver.ts`.** The driver already produces region events and already freezes them
  (fact 6B, re-run here). P20's Scope Out makes editing it for more than a type export a tripwire;
  this item does not edit it at all.
- **[Q81](../open-questions.md)** — whether the join SEAM should see a frozen event too. It is
  about `emit()` stepping the policy with the unfrozen `e` before handing a frozen copy out, which
  is inside the driver and one layer below the seam this item carries a handle across. Untouched.
- **[Q310](../open-questions.md)** in general — a `check-docs` clause comparing a snippet's stdout
  to its output comments, or a per-snippet `throw` floor. Both are `check-docs`' and neither is
  this item's; what this item owes Q310 is the TAUTOLOGY pass over its own rewritten section, which
  is rule 8 obligation (b) at v0.20 and is in the set.
- **The three `README_SNIPPETS` pairs and `README_SNIPPET_FLOOR`.** Section 10 is not one of them —
  see finding A. This item adds no pair, because a common-mistakes snippet is not a section a
  registry-page visitor is shown, and adding one is a scope decision belonging to W78's rewrite.

## What this declaration step MEASURED, and what it corrects

*Every fact P20 handed this item was RE-RUN rather than transcribed
(`doc/workflow.md` section 1 rule 5's `Inputs` clause, and P14's retro's lesson). The tree was held
still throughout — digest **`e7be5895ffe635c2` over 361 files**, identical before the first probe
and after the last, `git status` clean at both ends.*

| fact | re-run | verdict |
|---|---|---|
| **1** | `node dev-dist/p20/fact1-partition.mjs` | **The harness reproduces EXACTLY** — 18 members; 2 / 6 / 6 / 7; **orphan count 1, `onRegionEvent`**; 0 on two roads; the `Pick` at 7 names against 6 spread lines with `joinPolicy` the difference. **What does NOT hold is calling that a partition** — see finding D, which this item's own test found |
| **2** | `node dev-dist/p20/fact2-probes.mjs`, ~8 min | **REPRODUCES EXACTLY** — control green on all four rungs; **p1 green on all four**, so the half-fix is still free; **p2 `check:docs` EXIT 1, 1 FAIL line**; **p3 `typecheck` EXIT 2, 0 FAIL lines**. Tree restored, 1 file byte-identical, `git status` clean |
| **6** | `node --experimental-strip-types dev-dist/p20/fact6-forward.ts` | **REPRODUCES EXACTLY** — 4 region events on the hand-built road (`branch.opened`, `branch.arrived`), **4 of 4 frozen**; a parked run is `awaiting_action` with `isTerminal` false and an unsettled `done`; `completed` after `resolve` |

**Four findings, and three of them correct the plan.** A, B and C were taken at the declaration
step; **D was found by the item's own test failing on its first run**, and is recorded here rather
than in *What broke* because it corrects a fact the plan is argued from.

### Finding A — **`AGENTS.md` section 10 has NO README twin, and the plan says it does in two places**

P20's work-items row declares W76 rewrites *"`AGENTS.md` §10 and its README twin"*, and its seeded
exceptions table gives `README.md` to this item because *"`X8` holds THREE README pairs"*. Measured:

```
README.md ```ts fences : 3, at lines 35, 118, 205
README.md ## headings  : Getting started | A flow that decides | Checking a flow before it runs | …
X8's README_SNIPPETS   : those same three, paired to AGENTS §2, "The same on the RUNTIME…", §15
grep -c regionEvents README.md : 0
```

**Section 10's frozen-handles snippet is in `AGENTS.md` alone.** So `X8` cannot fire on this item,
`README_SNIPPETS` and `README_SNIPPET_FLOOR` are not literals it must move, and the `Owns` block
above drops `README.md` — which the record step covers anyway, for the one prose claim in it this
item falsifies. *The plan's table was seeded from W72-W74 read forward, and P19's retro records that
all three of its items found that table wrong in both directions; this is the first row of P20's.*

### Finding B — **fact 1's *"zero on two roads"* is a claim about the `Pick`, and over the INTERFACE it is one**

`fact1-partition.mjs` derives road (d) from the `Pick<DriverOptions, …>` type argument alone.
`StartOptions` also declares members in its own body — today exactly one, `runId` — and a caller may
pass it (test F19 asserts precisely that). Re-taken both ways
(`dev-dist/w76/decl-partition.mjs`):

```
road (d) = the Pick ONLY, as fact 1 reads it
  StartOptions side : 7    ORPHANS: 1 — onRegionEvent    ON TWO: 0

road (d) = the INTERFACE (Pick + its own body)
  StartOptions side : 8    ORPHANS: 1 — onRegionEvent    ON TWO: 1 — runId (a+d)
```

**The orphan count is 1 under both readings, so fact 1's conclusion survives and its *clean
partition* wording is narrower than it reads.** [W71](w71-the-reference-stops-teaching-a-fake-scheduler.md)'s
conformity reader had already measured the same thing from the other end — *"eight options, not
seven — `runId` is declared in the interface body"* — and that item's response was to **delete the
enumeration from its prose rather than fix it**. *(This paragraph first said the correction was
therefore lost. It was not: W71's `f3` ceiling row carries it in as many words, in the file this
item's `Inputs:` line cites by name. What is true is narrower — **it did not reach P20 fact 1**, and
the item that re-ran that fact is where it surfaced again. W76's conformity reader, finding 11.)*

**And the same measurement gives the binding its shape.** P20 decision 5 says the comparison must
know that `joinPolicy` is legitimately spread-less because it is applied as `?? liveToken`, and
warns that a naive one reports a false positive. Measured, `??` is not an exception but a **second
ROAD**, and the two roads are **total in both directions on the shipped tree**:

```
start() reaches them by : 6 conditional spread(s), 2 `??` default(s)
  conditionally spread : createTask, onFoldInput, onRunFailure, onUnsatisfiableJoin, onUnmintedTask, now
  defaulted with ??    : runId, joinPolicy
  declared and NEITHER : (none)
  reached and NOT declared : (none)
```

So the binding needs **no name written down** — it is *every declared member is reached by exactly
one of the two roads, and everything `start` reaches is declared* — and `runId`, which the plan did
not know was in `StartOptions` at all, is the second instance of the shape decision 5 thought was
`joinPolicy`'s alone. *An exception list with one entry is a rule nobody looked for.*

### Finding C — **fact 6A's *"`runtime.start` sees 0"* is a SENTENCE in the harness, not a measurement**

`fact6-forward.ts` prints `A  the same run via runtime.start() would see: 0 — StartOptions has no
onRegionEvent entry (fact 1)`. The harness never passes `onRegionEvent` through `start`; the line is
derived from fact 1 and is true. **It is also the exact number this item's guard inverts**, so it is
taken here, through `start`, with the cast section 10 itself uses, on section 10's own flow
(`dev-dist/w76/decl-before.ts`):

```
START   outcome=completed  onRegionEvent fired 0 time(s)   <- the number §10's guard asserts today
BY HAND outcome=completed  onRegionEvent fired 4 time(s): {"branch.opened":2,"branch.arrived":2}
        every one frozen: true (4/4)   regionIds: ["split"]   branchPaths: ["0","1","0","1"]
```

**So section 10's rewritten guard has a measured expected value — 4, as two opens and two arrivals
on one region — rather than one derived from the document's branch count.** *Section 4's clause on
the reading side: a number printed by a harness is only a measurement if the harness took it.*

### Finding D — **fact 1's table is not a PARTITION: 2 / 6 / 6 / 7 is 21 slots over 18 members**

*Found by this item's own orphan test failing on its first run, which is the direction a
declaration step cannot reach: the harness prints four road sizes and never adds them up.*

`fact1-partition.mjs` derives road (c) from `RuntimeOptions`' whole DECLARATION. Four of that
interface's six members — `base`, `flows`, `createPool`, `createScheduler` — are the runtime's own
and are **not `DriverOptions` members at all**, so they cannot be slots in a partition of
`DriverOptions`. Derived instead from what `start` actually FORWARDS
(`...(options.X !== undefined ? … )`), the road is **two**:

```
road (c) = RuntimeOptions' declaration : base, flows, createPool, createScheduler,
                                         defaultRetryPolicy, validateBoundaries   (6, four of them not members)
road (c) = what start FORWARDS         : defaultRetryPolicy, validateBoundaries    (2)

2 (supplied) + 6 (RuntimeRegistry) + 2 (forwarded) + 7 (the Pick) = 17, and the eighteenth
is onRegionEvent — the orphan the fact is about.
```

**The conclusion survives and the table under it was never a partition.** The plan's own sentence —
*"the runtime supplies two, `RuntimeRegistry` carries six, `RuntimeOptions` carries six,
`StartOptions` carries seven — and the partition is **clean**"* — describes 21 slots over 18
members. Reading road (c) as the forwarding also makes it a real BINDING rather than a superset: a
`DriverOptions` member added to `RuntimeOptions` and never spread would still be an orphan, and
reading the declaration would have hidden it. [Q316](../open-questions.md).

## Exceptions — seeded from P20's table, then MEASURED

*Every row re-measured at this declaration step, which is where P20 says the corrections belong.*

| path | seeded as | measured |
|---|---|---|
| `AGENTS.md` | this item's, §10 | **CONFIRMED and it is in `Owns`** — §10's snippet and the prose bullet above it |
| `README.md` | this item's, "§10 and its README twin" | **WRONG — there is no twin** (finding A). Dropped from `Owns`. It is a **record-step file** here, for the **two** prose claims in it this item falsifies — *a consumer on the recommended road cannot subscribe to region events at all* and *`onRegionEvent` is never forwarded to a runtime's driver* (this row said ONE; conformity reader, finding 8) |
| `scripts/check-docs.mjs` and its self-test | predicted UNNEEDED — a snippet is edited, not added or removed, so `RUN_FLOOR` should not move | *to be measured at the build and recorded in the Gate table — **not** predicted-and-left, which is W74's defect on this exact row* |
| `scripts/check-source.mjs` | predicted UNNEEDED — no new gate entry, no new published module, no new `src/**` file for `S6`, no construction for `S16` | *to be measured at the build* |
| `src/driver/driver.ts` | predicted UNNEEDED, and a SCOPE TRIPWIRE | *to be measured at the build; the expectation is ZERO edits, not "a type export"* |
| `examples/**` | predicted UNNEEDED — L6 is W78's | *to be measured at the build* |
| `scripts/build-browser-tests.mjs` | **NOT SEEDED — LATE, and it is this item's one approved exception** | the binding reads two `src/**` files as TEXT and the browser bundle carries only what this script inlines. The maintainer chose this road over a `check-source` clause and over skipping the suite in three runtimes. **193.0 KB**, corpus 386.1 KB -> 579.1 KB, and `e1` measures the inline LOAD-BEARING: removed, fifteen named browser failures, all W76's |
| `test/definition/l4-corpus.test.ts` | **NOT SEEDED — LATE** | the suite CENSUS (W41's) is a standing obligation on any item adding a suite, exactly `RUN_FLOOR`'s shape ([Q102](../open-questions.md)). It **fired on this item's first run**, which is how it was found; `Owns` is `test/scheduler/**` and the census lives one directory over. *Both of these were undeclared until W76's conformity reader ran `git diff --name-only` by hand — section 7 rule 2's own procedure, for the fourth time in this repository* |
| `scripts/check-markdown.mjs` | predicted UNNEEDED — Q142's window re-measured before the record step | measured at this declaration: `M3` window (101, 133], **margin below 6**; `M4` (4244, 5790], margin below 206. This item adds ONE markdown file, in `doc/work-items`, which **neither probe cuts** — so the `M3` fixture goes 101 → 102 and `M4`'s lower bound takes this file's links. **Predicted NOT to fire**; re-measured before the record step |

## Verification

How each clause of `Gate:` is run. **Every rung is RUN and redirected to `dev-dist/w76/`, never
piped, and read by `$?`** (`doc/workflow.md` section 4). Node 24 is asserted in every shell.

| clause | command |
|---|---|
| L0, all five typecheckers | `npm run typecheck > dev-dist/w76/typecheck.log 2>&1; echo "EXIT=$?"` — **and the five lanes run SEPARATELY where a count is wanted**, because `typecheck` is five chained by `&&` and a chained rung reported RED reports its FIRST failure and is silent about everything downstream (P20's declaration, recorded at one occurrence) |
| L0, lint | `npm run lint > dev-dist/w76/lint.log 2>&1; echo "EXIT=$?"` |
| L1-L5, three runtimes | `npm test > dev-dist/w76/test.log 2>&1; echo "EXIT=$?"` |
| L1-L5, the other two browsers | `npm run test:browser:all > dev-dist/w76/browsers.log 2>&1; echo "EXIT=$?"` |
| `check:docs` | `npm run check:docs > … ; echo "EXIT=$?"` — **expected RED before §10 is rewritten and green after**, and both readings are recorded |
| `check:source` | `npm run check:source > … ; echo "EXIT=$?"` |
| L6, both runtimes | `npm run test:l6` and `npm run test:l6:deno` — **expected UNMOVED at 1627 / 53** |
| whole gate | `npm run gate > dev-dist/w76/gate.log 2>&1; echo "GATE EXIT=$?"`, tree held STILL, digest at both ends |
| rule 8 | `node dev-dist/w76/rule8.mjs`, twice — the author pass and a re-run with the readers' exact edits checked back in |
| **W71's dated ceiling** | **`f3` names the `Pick` list this item moves, so it is RE-RUN here rather than at the retro** — `doc/workflow.md` section 5 rule 8's dated-ceiling clause, which P18 and P19 both refused to make a hand-off precisely because the item that MOVES the value is the one that can see it |
| both readers | conformity and adequacy per section 6, adequacy in an isolated copy, both reading P20 and Q297 before the artifact |

*This item touches routing not at all. A branch routed away from its join (Q4), `user_action`
(Q17), no matching decision edge (Q10), a duplicate task id (Q13) and a nested fan-out (Q6) are all
**not applicable**: nothing here changes what is dispatched, what a node receives, or what a join
decides — it changes which callbacks a caller can hand to the driver the runtime builds. The one
thing it does reach is `onRegionEvent`'s own production, which is the driver's and is untouched.*

## Record

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w76/`, never piped, read by `$?`,
Node 24.20.0 asserted in every shell.

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint` | **RAN, green** | `deno lint src/ test/ examples/ index.ts`, 109 files |
| L0 — all five typecheckers | **RAN, green** | **run SEPARATELY**, not as the chained `npm run typecheck`: `node`, `browser`, `deno`, `tests`, `examples`, five exit codes read one at a time. The chain is five lanes joined by `&&`, so a RED chain reports its FIRST failure and is silent about everything downstream — P20's declaration recorded that at one occurrence and this is the item acting on it. It paid: the one error this item produced was in `typecheck:tests`, the FOURTH lane |
| L1-L5, node | **RAN, green** | **44 files / 1251 assertions**, from 1234 |
| L1-L5, chromium / firefox / webkit | **RAN, green** | 1251 in each, parity — and the two `src/**` files really are in the bundle, which `e1` measures |
| `check:docs` | **RAN — RED first, exactly as predicted, then green** | **`EXIT 1`, ONE `FAIL` line, `X4` naming `AGENTS.md:1442` and the `regionEvents !== 0` guard**, before section 10 was rewritten. That is P20 fact 2 p2 reproduced on this item's own tree, and it is W71's tripwire firing as designed. After: **`EXIT 0`, 33 snippets — 27 run, 6 check — UNMOVED**, so `RUN_FLOOR` does not move |
| `check:source` | **RAN, green** | the seeded row's *predicted UNNEEDED* MEASURED rather than left — no new gate entry, no new `src/**` file for `S6`, no construction for `S16` |
| `check:markdown` | **RAN, green** | 134 documents / 5795 links, from 133 / 5790 |
| L6, node and deno | **RAN, green** | **1627 assertions, 0 failed, 53 real runs — UNMOVED in BOTH runtimes**, which is what the Gate line declared |
| conformity reader | **RAN** | **19 findings, 7 BLOCKING.** Its central obligation came back **NOT empty — one disagreement of four**: re-deriving the partition on paper, it found that `2 / 6 / 6 / 7` cannot be a partition of eighteen, which is finding D. The other three derivations — the region events, the two roads, `X4` before and after — matched exactly |
| adequacy reader | **RAN** | **25 mutations, 1 control green, 14 real survivors, 8 BLOCKING** |
| overlap | **2 — the FORTY-SEVENTH measurement**, inside the 0-4 band, neither reader primed | and both shared subjects are the SAME LITERAL reached from opposite ends: `equal(sorted(s.defaulted), ['joinPolicy','runId'])`. The conformity reader derived by READING that *a member moved from one road to the other still passes* is false; the adequacy reader MEASURED it, moving `now` to the `??` road with behaviour identical. The second shared subject is the sentence above it, claiming the test names nobody |
| rule 8, author pass | **RAN** | 16 probes: control green, 14 caught, 1 declared ceiling, 0 undeclared survivors, 0 crashes, 0 aborts, 0 against declaration |
| rule 8, RE-RUN with the readers' exact edits checked back in | **RAN** | **25 probes: 1 control green, 23 caught, 1 declared ceiling RUN, 0 UNDECLARED survivors, 0 crashes, 0 against declaration, 3 aborts all re-anchored and then caught.** All NINE of the readers' edits FIRE. The content digest is identical at both ends of every pass |
| **W71's dated ceilings `f3`/`f3b`, re-run HERE** | **RAN — one CATCH and one vacuous survivor** | `doc/workflow.md` rule 8's dated-ceiling clause, in the item that MOVES the value rather than at the retro. See *What broke* (5) |
| `npm run gate`, CONFIRMING (over the final tree) | **GATE EXIT=0, ZERO lines beginning `FAIL` at any indent**, `selftests` 8/8 completed and 8 ok in 824.7 s over 6 lanes (`dev-dist/w76/gate.log`) | `check:spec` **7 / 61 / 107, C4 at 34 — UNMOVED**; `check:docs` **33 snippets: 27 run, 6 check — UNMOVED**; `check:workers` **14 / 14 ran / 0 refused — UNMOVED**; `check:source` 23 published files, 16 gate entries; `check:markdown` **134 / 5832 / 285**, from 133 / 5790; L1-L5 **44 files / 1251 assertions in node 24.20.0, deno 2.9.6 and chromium**; **L6 1627 / 0 failed / 53 real runs in BOTH runtimes — UNMOVED**. Digest **`fc7bf27dd0950bde` over 362 files, IDENTICAL before and after**, with no edit made while it ran; **these four Record rows are the ONE edit after it**, and `check:markdown` — the only rung that reads `doc/work-items/**` — was re-run over them and is green at 134 / 5833 / 285 |
| [Q142](../open-questions.md) | **measured, does NOT fire** | re-taken on the final tree: `M3 = 107` against a fixture of **102** (margin 5), `M4 = 4450` against **4278** (margin 172), `M5 = 60` against 285 anchored. This item adds one markdown file, in `doc/work-items`, which neither `removes` probe cuts — predicted at the declaration step and confirmed here |
| `Owns` audit | **CLEAN — 11 paths, ZERO undeclared** | `git status --porcelain` by hand: `Owns` (3) + the two LATE exceptions + the six record-step files + this file. **The two late ones were found by the conformity reader running the same command**, not by reading — section 7 rule 2's own procedure |
| census | **244 / 187 / 2 / 55**, 244 of 244 in exactly one cluster cell, **0 aborts** | from 241 / 185 / 2 / 54, by `dev-dist/p15/census.mjs` unchanged: Q315-Q317 raised and placed, Q297 RESOLVED |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `onRegionEvent` on `StartOptions` and FORWARDED | **yes** — one name in the `Pick`, one conditional spread | `a1` (the forwarding deleted): `npm test` 2 failures plus `check:docs` `FAIL X4`. `a3` (the whole revert): red at `typecheck`, `npm test` and `check:docs`. **This is Q297** |
| (2) the two lists bound BOTH WAYS | **yes** — `test/scheduler/runtime.test.ts`, reading the shipped source | `a1` fails *every StartOptions member is REACHED by start*; `a2` and `r-m23` fail *everything start reaches is DECLARED*. Both directions have a live case, and P20 fact 2 measured the first one FREE before this item |
| (3) the partition, ORPHAN COUNT 0 | **yes**, and **corrected** — road (c) is what `start` forwards, not `RuntimeOptions`' declaration | `d1` (a nineteenth member reachable by nothing): one failure naming itself. `r-m21` and `r-m22`: the same defect in `readonly` and method-shorthand spellings, which were **GREEN before the readers** |
| (4) a behavioural observer per member, bound to the type | **yes** — nine observers, the key set held equal to `StartOptions`' membership | `c2` (one observer deleted): the membership fails naming it. `c1` (the text binding re-sourced AND the forwarding deleted): still caught, so the two routes are genuinely independent for the forwarding's existence |
| (5) `AGENTS.md` section 10 INVERTED, with a guard pointing the other way | **yes** | `r-c6` (the forwarding deleted): `check:docs` `FAIL X4`, and the message is **`Q297 has regressed`** — which it was NOT before the conformity reader, because the guard sat below a membership check that threw first |
| (6) the forwarded stream held EQUAL to the driver's own region stream | **yes** — added after the adequacy reader | `r-m1`, `r-m2`, `r-m3` (the forward narrowed by variant, by depth, by region kind) and `r-m20` (every event forwarded twice). **All four were GREEN on every rung before it** |

**What broke.**

1. **The item's own test found P20 fact 1's table is not a partition** (finding D). Four of
   `RuntimeOptions`' six members are not `DriverOptions` members, so `2 / 6 / 6 / 7` is 21 slots
   over eighteen. The harness prints four road sizes and never adds them up, which is why nobody
   caught it and why the orphan count was right anyway. [Q316](../open-questions.md).
2. **Two files were edited outside `Owns` and outside the Exceptions table, and a reader found both
   by hand.** `scripts/build-browser-tests.mjs` (the approved inline) and
   `test/definition/l4-corpus.test.ts` (the suite census, which FIRED on the first run and was then
   fixed without being declared). Found by `git diff --name-only` run by the conformity reader —
   section 7 rule 2's own procedure, and `check-owns.mjs` stays retired.
3. **The identity assertion was wrong about its own mechanism and went red on its first run.** It
   asserted `onRegionEvent` receives the SAME OBJECT the fold received, reasoning from W12's *one
   copy, frozen, stored AND handed out*. `freezeInput` gives `onFoldInput` its own frozen copy, so
   the two outbound paths carry EQUAL values and not the same one. *The claim survived and its
   stated mechanism did not.*
4. **The first nested fixture was an invalid document** — `FD-V9` requires a fan-out's branch ENTRY
   to be a task, and a `map` was one. The validator said so by name on the first run.
5. **W71's `f3` and `f3b` ceilings, re-run here: one CATCH and one vacuous survivor, and neither is
   visible to rule 7 (b).** This item SHIPPED the name `f3` adds and the line `f3b` adds, so both
   edits now append duplicates that mean nothing — the anchors still match, the files still change,
   no abort fires. `f3` reports DECLARED under a reason that is now false; `f3b` reports SURVIVED
   **against its declaration**. [Q317](../open-questions.md).
6. **My own harness reported its CONTROL as an undeclared survivor** on its first run, because a
   probe with no edits fell through to the one verdict that means *a hole nobody declared*.
7. **Two of my own probes fired for a reason they did not name.** `d3` and `d4` said *the count is
   what is left standing*; the probe disabled ONE of the control test's seven assertions, so what
   fired was the control's others. Corrected — and then `d4`'s declared CEILING turned out not to
   exist, which is the finding under *What this taught*.
8. **Three probes ABORTED on the re-run**, every one on the member-extraction anchor that this
   item's own fix for `r-m21` and `r-m22` had widened — rule 7 (b) firing correctly. Re-anchored
   agnostically and all three caught.
9. **A shell heredoc ate a block of code twice** ([Q272](../open-questions.md), the rule
   `CLAUDE.md` carries and which P19 broke eight times). Written as a file and concatenated both
   times.

**What this taught.**

**A list bound BOTH WAYS is self-guarding against a vacuous extraction, and a list bound one way is
not.** The declared ceiling `d4` predicted that neutering the member regex three edits deep would
leave the orphan test comparing two empty sets with nothing to say so. It does not: with the
universe empty, the *nothing the four roads carry is missing from `DriverOptions`* direction fires
on everything the roads carry. **Only one of the two directions can go vacuous from an empty
derivation, so the pair cannot.** That is a reason to prefer set equality over a floor which is
stronger than *it catches more* — and it means the count beside the membership earns its place for
a different reason than v0.14 gives: not against a silently-smaller derivation, which the pair
already sees, but against a derivation that misses exactly ONE member, which is what `r-m21` and
`r-m22` were and which no direction can see.

**And the sharpest finding is the adequacy reader's, because the answer was not more shapes.** The
forwarding claim was bound at exactly one topology — a two-branch `fanout` at depth 1 — and three
narrowings of it cost zero: four of six event variants dropped, every nested region's events
dropped, every `map` region's events dropped. Enumerating the six variants and the two kinds would
have been the AUTHOR's enumeration, which is the thing rule 8 (a)'s own clause says keeps failing.
What closes it totally is the claim the runtime actually owes: **what `onRegionEvent` receives IS
the region subsequence of what `onFoldInput` receives, element for element.** One equality, total
over variant, kind and depth, and it closed four of the reader's survivors at once — including
`m20`, where the count's only second observer was inside this item's own declared Q310 ceiling.
*When a claim is bound at one shape, look for the invariant the shapes are instances of before
enumerating them.*

**Questions raised.** [Q315](../open-questions.md) (a binding that must read source TEXT has no
cheap home; three roads priced and the cost of the one taken), [Q316](../open-questions.md) (fact
1's table is not a partition, and the harness cannot see that because it never adds up),
[Q317](../open-questions.md) (a dated ceiling whose site the expiring item CONSUMES still matches
its anchor, so rule 7 (b) cannot abort it). **Q318 and Q319 reserved and unused, so they are
spent.**
