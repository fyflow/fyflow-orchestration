# CLAUDE.md — fyflow-orchestration

Guidance for Claude Code working in this repository.

## What this project is

A **flow orchestration layer over [fyflow-scheduler](https://github.com/fyflow/fyflow-scheduler)**:
flows with sequence, **decision** routing, **fan-out** and **join**, instantiated per workload at
1000s-10000s scale.

Full context: [doc/concept.md](doc/concept.md). Do not re-derive it — read it.

**[AGENTS.md](AGENTS.md) is the consumer reference** — what the library looks like from outside, and
the only document that does. **Every snippet in it is extracted and executed by `npm run gate`**
(`scripts/check-docs.mjs`), so it cannot rot the way a hand-maintained reference does. If you change
the public surface, that check is what tells you the reference is now wrong.

## Current state: **P1-P9 are ALL complete and retro'd, `doc/workflow.md` is [v0.10](doc/workflow.md), and [P10](doc/plans/p10-is-fan-out-one-feature-or-two.md) is RUNNING — the first PRODUCT plan since P7.** Its question — *is fan-out one feature or two?* ([Q12](doc/open-questions.md), open since P1) — is **ANSWERED by [ADR 0036](doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md): TWO FEATURES OVER ONE REGION.** [W32](doc/work-items/w32-what-a-map-fanout-is.md) is **DONE** - author pass, both readers, rule 8's re-run and the gate re-run after acting on them (`GATE EXIT=0`, zero FAIL lines, 19 entries, 7m18; L1 **20 / 517**, L6 unmoved at **489 / 25**); [W33](doc/work-items/w33-a-map-at-run-time-arity.md), [W34](doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) and [W35](doc/work-items/w35-a-map-on-real-workers.md) have **not started**. **Read every status from the item's own file, never from this line.** *(This sentence has now been found stale at two consecutive hand-offs — **and then went stale a third time INSIDE W32**, when a script correcting it aborted on a later substitution and wrote nothing, leaving *"BOTH READERS OUTSTANDING"* standing while their reports were being acted on three paragraphs below. **A batched edit that fails halfway leaves the index describing a state that has not existed for hours**, and nothing checks this line. Treat it as a pointer, not as a fact.)*

**`map` is a fifth node kind and the library can express something it could not before — the first plan in ten to change that.** `{ "kind": "map", "over": "items", "branch": "score" }`: **one** branch declared, N instances opened by the run, where a `fanout` declares N branches known at authoring time. `spec/flow-definition.md` and `spec/task-id.md` are both **v0.8** with `spec/README.md`'s rows moved by `C8`; `spec/` is **7 documents, 33 examples, 77 rules**; L1 is **20 files / 517 cases in five runtimes**, from 19 / 474. **Nothing dispatches a map yet** — the driver is W33's, and `AGENTS.md` deliberately describes the refusal class and not the feature.

**What decided the ADR is a fact about a data structure, and nobody had measured it.** `branchOf` is a `Map<string, Set<string>>` **keyed by branch NODE ID**, so `branches: ["x","x","x"]` collapses to **ONE** entry and `region(F)` is `{x}` — **the repeated-entry encoding of a map does not express N branches even to the layer that would have to honour it.** And `FD-V19` fires **`n(n-1)/2`** times on that encoding (1, 3, 6, 10, 15, 45 measured at N = 2, 3, 4, 5, 6, 10; 124 750 at N = 500) while iterating **0** pairs over a one-branch region. **The same rule, quadratic on one encoding and vacuous on the other.** What the two features share is the **REGION**; what differs is the whole of the **FAN-OUT**.

**So `FD-V9` and `FD-V19` are UNCHANGED and [Q27](doc/open-questions.md) is UNTOUCHED, which corrects the framing P10 handed the item.** P10's declaration and Q27's own row both said *"a map is `FD-V19`'s condition on purpose"* — **true of the ENCODING, false of a `map` node**, because one branch means *"two distinct branch entries"* has no instance. Both rows corrected in place. **All three of P10 fact 1's refusals are kept exactly as they are; not one is retired or restated** — a map's arity is **not in the document at all**, so `FD-V9`'s floor and `FD-V11`'s reachability cannot fire for an arity reason. *(P10 fact 1's `branches: []` row is right for the fixture it measured and does not generalise: with the branch task still declared it is **5 findings and a fourth refusal path**, `FD-V20`, rather than 3.)*

**P10 prediction 1 CONFIRMED, and `src/driver/ids.ts` was not edited at all** — the grammar, `parseTaskId` and `buildTaskId`'s signature are all unchanged, and that file is in W32's `Owns` precisely because P10 raised the possibility. `spec/task-id.md` section 1's **heading** is corrected rather than deleted: a branch index is a property of the **NODE** inside a `fanout` region and of the **DISPATCH** inside a `map` one. **`ID-R6`** is the refusal — `branchPathOf` takes an optional item index **per region** and throws `UnresolvedBranchPath`, because the measured alternative mints `r1:x:0:0` for every dispatch and dies at `ID-R1` naming a *duplicate*, the symptom rather than the cause.

**P10 prediction 3 FIRES: rule 8's fifth obligation — break the WIRING — generalises past a harness.** Three instances in W32's own paths, all named before the set was written. A **corpus flow renamed out of the `.flow.json` glob** was noticed by **nothing**, and is now closed by a **set equality both ways** against `spec/flow-definition.md` section 7's table — **which had a live case the day it was written**: `nested-fanout.flow.json` was added by [W20](doc/work-items/w20-what-a-nested-region-is.md) and never documented, so the spec's own example index was stale by one **for a whole plan**. A rule **present, correct and unreachable** was caught twice. And **a whole `*.test.ts` file renamed out of the runner's glob — 26 cases — is noticed by NOTHING** at exit 0: [Q158](doc/open-questions.md), in `test/runner.ts` and `scripts/**`, which are in nobody's `Owns`.

**Rule 8: 31 provocations, 28 caught, 0 survived, 0 aborted, 3 read by hand**, graded on the **failure lines** rather than the exit code. **One real survivor, found and closed**: `opensWith` read from `branches.length === 1` rather than from the opener's kind survives the whole suite, because `FD-V9`'s floor makes the two sources agree on every VALID document — closed by constructing an **invalid** one-branch `fanout`, which `regionSets` is handed anyway. **Three things W32 wrote down were false and its own set caught each**: two L1 fixtures made a CYCLE so `FD-V10` fired and the whole region family was skipped; the expected set named **`C4`**, which *"never opens the file"* by `spec/README.md`'s own bold sentence; and the census caught [Q156](doc/open-questions.md)'s status cell reading `open - deferred by W32`, which a classifier reads as **deferred** — one row across two columns whose totals still summed, with **no abort**.

**And W32's own Record contained a number measured BEFORE the change it described, which is how its sharpest defect was found.** The L1 row read *"506 on chromium"* from a run made before the corpus equality existed; `npm run test:browser:all` then reported **0 file(s), 1 assertion** and `PARITY FAIL` in **all three** browsers. The browser bundle inlines only `spec/examples/` JSON, suites read fixtures at **module scope**, and a `readText` throw while the bundle is LOADING takes **all twenty suites** with it — reported as *"the suite never reported"*, naming no file. **L1 was green in node and deno and broken in all three browsers.** Fixed by inlining the one document — the second late exception, on `scripts/build-browser-tests.mjs` — and provoked. **This is section 1 rule 5's provenance clause, *any copy including your own*, inside a Record describing its own item's gate**: [W23](doc/work-items/w23-a-nested-flow-on-real-workers.md)'s exact failure one plan later. `npm run gate` is **`GATE EXIT=0`, zero FAIL lines, 19 chain entries, 6m21**, L6 unmoved at **489 assertions / 25 real runs**.

**Both readers ran: conformity 12 findings / 6 blocking, adequacy 11 survivors of 29 mutations / 5 blocking, OVERLAP 2** — the fifteenth measurement, inside the settled 0-4 band, and **neither reader was primed** (unlike W31's pair), so it is comparable with the thirteen before it. **Their split is the one the two roles predict**: the conformity reader found **claims that were false or unlicensed**, the adequacy reader found **bounds that were not there** — and three of its five blocking survivors are one shape, *the new check binds a set of NAMES and nothing binds where those names came from, what the files contain, or the sibling directory.*

**The sharpest finding is aimed at what W32 was proudest of, and the second is a defect W32 CREATED.** The check built to close the corpus wiring hole **could be made vacuous by one source-expression swap** — re-source it from the disk and both set differences are empty by construction, with W32's own `e2` probe passing again underneath it; **the comment above the guard named that exact failure and then guarded it with a bound the disk listing satisfies.** And `enter()`'s switch in `src/driver/driver.ts` had four arms, no `map` arm and **no `default`** — `node.kind` is a union TypeScript does not require a switch to exhaust — so a valid map document dispatched one task of six and folded to **`completed`**: `ADR 0015`'s own false statement reached through the driver's declared surface, and the silent stop `spec/flow-definition.md` section 3 refuses **by name**. Closed by a `default` arm reporting through `OR-R10` with an **existing** error class, so P10 decision 4 holds; W33 replaces it.

**Five more written claims were false and are corrected in place**: section 4's `reaches(X)` row omits a map's arc **while enumerating arc shapes exhaustively**, so a validator written from it rejects a valid example; `FD-V23` refuses a map missing `over` with no rule text licensing it, making *"four rules widened"* **five**; `ID-R1`'s soundness argument is a closed argument from three **validator** rules and a map region has no `FD-V19` instance; `spec/join-policy.md` section 1's `branches` sentence is false for a map region **today** (that document is now **v0.11**); and `AGENTS.md` §3 said *"Four node kinds"* and *"22 refusals"* while `spec/README.md` said 23 in the same change.

**Rule 8 ran TWICE — 32/29 before the readers, 42 provocations / 39 caught / 0 survived / 0 aborted after, with ELEVEN of the readers' own edits checked back in.** **The re-run earned its place**: the fix for one reader's finding **masked another guard** — with `branchPathOf`'s `ID-R6` arm unreachable, the newly-refusing `branchIndexOf` fires in its place with the same class, citation and map name, so three assertions passed **by the wrong route**. W29's `D5` masking shape, produced by acting on a review. **Finding a discriminating phrase took three attempts**, because `ID-R6`, `split` and even `item index` appear in both messages — the new refusal helpfully says *"use `branchPathOf` with an item index"*. **A helpful error message is a worse discriminator than a terse one.**

**`Owns` audit: 23 paths, ZERO undeclared, FIVE late exceptions** — `AGENTS.md`, `scripts/build-browser-tests.mjs`, `src/driver/driver.ts`, `spec/join-policy.md` and `test/driver/driver.test.ts`. **Not one was found by reading**: two by running a check, three by the conformity reader. Five is P7's W20 number from the **opposite** cause — W20's came from a block that gave it nowhere to work — and it is an argument that **W32's `Owns` was drawn one layer too narrow for what a new node kind reaches**, which is P10's retro's to judge. `index.ts` re-exports `src/definition/regions.ts` with `export *`, so `UnresolvedBranchPath` reached the package root without W32 touching `index.ts` and section 9's executed snippet went red at `X4` ([Q101](doc/open-questions.md)). **[Q157](doc/open-questions.md)**: **no P10 item owns `AGENTS.md`**. **[Q142](doc/open-questions.md) was predicted NOT to fire and did not** — the three counts were taken before any file was added and the ADR lives in the directory both `removes` probes cut. **Census CONFIRMED for the FIFTH plan running — 118 questions, 81 open, 2 deferred, 35 resolved**, both halves at 118 of 118 in exactly one cluster cell; Q156-Q159 all used, **Q12 resolved**.


**[P8](doc/plans/p8-what-can-be-deleted-with-the-gate-green.md) asks *what can be deleted from this
repository with `npm run gate` still green?*, and it is the plan that owns `scripts/**` and
`package.json`** — the paths in nobody's `Owns` that blocked **two** checks in P7 alone, which P7's
retro named and deliberately refused to make a workflow rule. It also **exercises rule 7 (c)**, unused
for five plans. **Its declaration measured four load-bearing facts and three of the register rows were
wrong** — the twelfth plan running to have that happen, and the eighth to find a register row wrong by
trying to act on it:

- **[Q123](doc/open-questions.md)'s premise is FALSE.** *"`HEAD` is LF throughout"* — `git ls-files
  --eol` says **161 LF and one CRLF**, and the CRLF file is **`doc/concept.md`**, CRLF in all six
  commits that ever touched it, back to the founding commit. So a check refusing CRLF **fails on day
  one** on the document this file says to read rather than re-derive, and W26 owns a choice it would
  not otherwise have had.
- **[Q121](doc/open-questions.md) is wrong twice and incomplete once, and the third is what matters.**
  Dead file links today: **0**. Code-span false positives: **4 in three files**, not two, one of them a
  placeholder rather than a link-syntax illustration. **And it never mentions anchors** — `C5` strips
  `#…` and compares the path alone, so it is blind to **14 dead anchors over 9 targets, being all nine
  S-ids in `doc/scheduler-upstream.md`'s own index**, which `git log -S` shows were **born dead in the
  founding commit** and have never once worked. `C5` **can be lifted rather than copied** (measured:
  span-blanking leaves `spec/` at 0 → 0) but **its id must survive**, being cited in seven documents.
- **[Q126](doc/open-questions.md) was confirmed, the hole was seven times wider, and [W24](doc/work-items/w24-the-gates-own-wiring.md)
  CLOSED it.** `check-source.mjs:290` was the only thing that read `scripts.gate` and `S11` guarded
  **8 of 15** entries; one level down nothing guarded `typecheck`'s five sub-typechecks,
  `test:browser`'s `build:browser-tests`, or **`lint`'s directory list** — dropping `examples/`
  un-lints all of L6, which is rule 8's fourth obligation applied to `package.json`. **The chain is
  now 16 of 16 guarded** by `S12` — a declared list compared to `scripts.gate` **both ways and in
  order**, equality rather than a floor, so a **swapped** entry fails where a floor passes — and the
  three composed lists by `S13`, **two of whose clauses derive their bound from `package.json` and
  from disk rather than from the declaration**, so emptying the list fails rather than passes.
- **A third item was declared and DROPPED before it started, and both halves are recorded.** W26 —
  *a tracked text file's bytes* — is out on a **scope call, not a measurement**, leaving P8 at exactly
  the two checks P7 declined. **`doc/concept.md` is normalised to LF in P8's declaration commit**
  (221 CRLF pairs removed at the byte level, byte-identical to the previous `HEAD` with the CRs
  stripped, so none of the `Get-Content | Set-Content` re-encode hazard), because the file was wrong
  today and the check that would catch it is not being built. **No `.gitattributes`** — it hides the
  problem where a check would show it. **W26 and W27 are skipped and never reissued; the next plan
  starts at W28**, and [Q123](doc/open-questions.md) and [Q131](doc/open-questions.md) return to the
  register with no owner. **Q131 is deliberately NOT fixed**, so whoever builds that check has a live
  defect to fire on.
- **[Q131](doc/open-questions.md) is new and nobody had raised it.** The census parser — the
  **aborting** kind P6's retro asked for — split rows on unescaped pipes and found that **`Q119` and
  `Q71` render their Status and Owner columns wrong**: Q119's Status shows `regions` and its Owner
  shows `^2) with the inner call doubled…`, with the real `open` / `no owner` dropped off the row. In
  the file read before every work item. **The register is now 92 questions — 58 open, 2 deferred, 32
  resolved**, and the standing *"59 open"* was the right total under the wrong noun.

**[W24](doc/work-items/w24-the-gates-own-wiring.md) is DONE, [Q126](doc/open-questions.md) is
RESOLVED, and `check-source` has the first self-test it has ever had.** The gate chain is **16 of 16
entries guarded** where it was 8 of 15, plus the three lists one level down. **`S12` is set equality
AND order** — the order clause exists because a reader pointed out that `&&` in sequence is the only
implementation `doc/workflow.md` section 4's ladder has. **`S13` carries two clauses whose bound
comes from somewhere other than the declaration** — `package.json` itself for which entries compose
other scripts, and the disk for which trees must be linted — so emptying its list fails rather than
passes. `scripts/check-source-selftest.mjs` is **24 probes, 20 gradings of those probes, 3 of the
probe list itself**, ~34 s, each probe declaring the exact **set** of checks it must trip. **Rule 7
(c) fired on its first outing here**: the item's own declared table gave probe 7 as `{S11}` and the
true set is `{S11, S12}`, reported as 16/17 rather than passing.

**Four things W24 WROTE DOWN were false and measurement is what caught each.** Two of the four
self-grading ceiling holes copied from `check-policies-selftest.mjs` are **caught** here rather than
live; *"S11 guards eight of the gate's sixteen entries"* mixed the before and after counts; *"three
lists live here"* was four; and *"order is deliberately NOT asserted"* rested on a reason that was
wrong. **The item's own claimed survivor was the worst of them** — *"deleting the `lint` row from
`COMPOSED` costs 0 failures"*, measured by running `check:source` and never the self-test, which it
turns red. It was one command from being written into the register as a fact. **[Q43](doc/open-questions.md)'s
class, inside the file built to refuse it.**

**And its method finding is an axis rule 8 does not have.** Both readers independently found the same
hole in **the entry W24 adds**: `"check:source:selftest": "node scripts/check-source.mjs"` — drop
` --self-test` and the whole self-test never runs, with `npm run gate` at **exit 0**. All four
`:selftest` entries had it. Neither the author's twenty-four probes nor the item's declared thirteen
could reach it, because every one asks *what happens when the INPUT is broken* and this asks **what
happens when the CHECK IS NOT RUN**. That is not a clause, not an output row, not a provenance and not
a bound. **For P8's retro.** Its questions: [Q132](doc/open-questions.md) (the probes cover **4 of
`check-source`'s 13** checks; the other nine are pattern lists each emptiable for 0, and `check-spec`
still has none), [Q133](doc/open-questions.md) (the gate now spends about a minute proving its own
checks can fail and nothing decided that it should), [Q134](doc/open-questions.md) (`S12` subsumes
`S11`'s membership half) and [Q135](doc/open-questions.md) (a **third** register row renders wrong, by
a different mechanism than Q131's two). **[Q102](doc/open-questions.md) is ANSWERED and not closed: an
owner MOVES it, NARROWS it and MULTIPLIES it** — `Owns` is per-item rather than standing, `S12` is
equality rather than a floor, and W24 ships three more floors of Q102's own shape, two of them made to
fire by a list one level out. **No ADR: 0032 and 0033 are both skipped.**

**[W25](doc/work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) is DONE and P8 is CLOSED.**
`scripts/check-markdown.mjs` resolves every relative link and **every anchor** across
**62 documents / 1602 relative links / 80 anchored** — `M1`, `M2`, and `M3`/`M4`/`M5` for the walk's
own bounds. **`C5` is LIFTED rather than copied and keeps its id**, cited in nine documents;
`check-spec.mjs` is now a caller. **The fourteen dead anchors are fixed** — nine S-ids in
`doc/scheduler-upstream.md`'s own index, **born dead in the founding commit** and never once working,
in the file this document points at for upstream wants. [Q121](doc/open-questions.md) is RESOLVED.

**W25's declaration falsified the ARGUMENT behind one of P8's decisions**, which is W22's shape one
plan on. Decision 3 said runs are not collapsed *"which is the whole difference between the two-hyphen
and three-hyphen forms"*; four different slug rules each report **the same 14 dead of 76**. The
conclusion survives — the declared rule is what GitHub does — and its stated reason did not.

**And what replaced that reason is the item's central finding: a check can ship against a corpus that
cannot falsify its central rule.** Three clauses, one item. The four slug rules disagree about
**134, 140 and 294 of 584 headings** and **no link points at any heading they disagree about**. All
**76** anchor links are **same-file** — zero cross-file — so a provenance mutation on the anchor source
swaps one expression for an identical one, found by a META entry coming back *not noticed*. And the
file half **ships green** at 0 dead links, so `M1` would pass on an empty implementation. **Then the
item's own fix made two thirds of the first one false** — the fourteen repaired anchors ARE the
discriminating cases — and only a reader noticed. *Fixing the defect built the fixture that proves the
rule.*

**Its readers found 13 + 23 things, 2 + 7 blocking, and two were structural.** All three `M3` clauses
reported under **one id**, so set equality could not tell them apart and two of the three floors were
replaceable by `if (false)` for 0; and the probe harness could only edit **one document's text**, so
the file and link counts were unreachable from any probe. Split into `M3`/`M4`/`M5`, and the harness
gained a `removes` capability. **Four probes were wrong at birth, two more could not discriminate, and
two META entries matched a COMMENT instead of the code** — the paragraph above the floors quotes them
verbatim, so `String.replace` edited the prose and the check ran unchanged. **A comment that quotes
the code it explains makes that code unmutatable by a literal-anchored probe.**

**[Q102](doc/open-questions.md) reproduced one item later, not one plan later.** W24 predicted the
ownership half would be settled by the next plan to edit the gate chain; it took the next **item**, and
W25 declared it as a late exception. `RUN_FLOOR` went stale **silently, toward weakness**; `S12` failed
**loudly, toward safety**, naming both the entry and the file to edit.

**The cost is a decision somebody owes, and the number is 88% rather than half.** *(P8's retro wrote
*"`check:markdown:selftest` is **2m31 to 3m14** of a **4m46 to 6m00** gate … roughly half the gate,
either way"*. **The absolutes were right and the comparison was not** — it counts **one** self-test
and there are **five**. Corrected at P9's declaration by one timed pass over the gate's own eighteen
entries: `check:source:selftest` 23.1 s, `check:markdown:selftest` 129.4 s, `check:scheduler:selftest`
2.0 s, `check:policies:selftest` 6.5 s, `check:docs:selftest` 45.3 s = **206.3 s of 234.6 s**. **The
whole product-facing gate — every check, L0-L5 in three runtimes, and both L6 runtimes — is 28 s.**
That run's `check:markdown:selftest` was **2m09**, below the recorded band, which reinforces rather
than undermines the *"absolutes are not constants"* half. **A third shape for this repository's count
problem: not stale and not mis-derived, but a correct number answering a narrower question than the
sentence around it claimed.)* [Q133](doc/open-questions.md) and [Q138](doc/open-questions.md); changing what the gate
RUNS was out of P8's scope. **P8's retro proposes two `doc/workflow.md` changes and adopts neither**,
on one occurrence each with a stated argument: a **fifth** rule 8 obligation — *break the WIRING: what
happens when the check is NOT RUN* — and *a check written for a defect you just fixed has no live case,
so its probes are the whole of its evidence.* **No ADR: 0032 and 0033 both skipped.**


**[P9](doc/plans/p9-when-a-check-stops-checking-what-notices.md) is COMPLETE and RETRO'D, and
`doc/workflow.md` is [v0.10](doc/workflow.md).** Its question — *when a check clause stops checking,
what notices, and does it notice for the right reason?* — is answered on both halves. **Before P9 a
clause going inert was noticed by an EXIT CODE**, which cannot tell a detection from noise, a crash, a
sibling covering for the clause, or a harness that never ran. **After it, 118 gradings name the probe
that must break**, up from 63, over **136 probes** and **31 `SELF` entries** from 100 and 6.

**Its central finding is that the defect P9 set out to remove was living inside rule 8's own
procedure.** Rule 8 grades a provocation by *did the gate go red*, and P9 found that wrong **six times
in three items** — three `SELF` entries that bounded an ABORT while naming a floor, a probe refused by
the copy of a duplicated expression that was already covered, 17 of 21 gradings reporting the right
verdict by the wrong route, and a probe that reported *refused* by crashing. **Read the failure lines,
not the exit code.**

**v0.10's three changes**, each measured rather than argued:

1. **Rule 8 gains a FIFTH obligation: break the WIRING — what happens when the check is NOT RUN.**
   Three instances, three items: the **manifest** (W24), the **script** ([Q149](doc/open-questions.md),
   W30 — the four-line dispatch deleted, exit **0** with the self-test unrun, measured **six for six**,
   and `S11` reads the manifest so it cannot see it), and the **harness**
   ([Q151](doc/open-questions.md), W31 — mutants written into a directory the child deletes, reporting
   `12/12 bounded` at exit 0 while every grading read *"the mutant did not run"*). **Earned against a
   prediction P9 wrote down before the item that tested it.**
2. **Rule 8 gains a requirement on the SET: a provocation is evidence only when it FIRES, and only
   when it fires FOR THE REASON IT NAMES.** The first half is P8's proposal, adopted — W30 is seventeen
   instances at once, W31 constructed three cases, and W29's `D5` is the live counter-case. The second
   half is the six occurrences above.
3. **Section 1 rule 5 gains a clause about WRITING: a claim states the scope it was MEASURED at.**
   W30 measured five checks and wrote *"all five"* into six documents when there are six; W31 measured
   one file and wrote *"in any of the three"* with an owner cell naming six, **false in two**. Neither
   read anything wrong; both generalised without saying so.

**And a question P6's retro left open two plans ago is answered NO**: rule 8 stays a rule rather than
becoming a section, because *"section 5 rule 8"* is cited in four plans, eleven work items and the
register — section 3's *ids are never renumbered*, one level out. It gains an **index** instead.

**The cost is the number to remember, and it is measured in one pass rather than subtracted across
two.** The six checks cost **4.3 s**; proving they can fail costs **347.0 s** — a factor of **81**.
Against a 438 s gate that is about 79%, down from 88% at P9's declaration while the absolute rose from
206 s: **W28's contract change worked** — `check-markdown` went 129.4 s to 65.1 s — **and the coverage
ate it.** [Q133](doc/open-questions.md) stays open with a better number on both sides, and
[Q148](doc/open-questions.md) is the constraint on the obvious mitigation: two of the six cannot run
concurrently, because `check:scheduler:selftest` moves `node_modules/fyflow-scheduler` aside while an
`AGENTS.md` snippet imports it.

**Its exit artifact grew from three row shapes to NINE**, and four of the six new ones are neither a
detection nor a miss: a sibling clause reporting the same id (masking), the same but **co-firing** and
therefore detectable by the failure COUNT, a clause **unreachable by construction**, a grading that
passes as **`corpus`**, a clause noticed **under a different id**, and — W31's, and invisible to
everything this plan built — a **message-only** clause that assigns a diagnosis and touches no verdict.

**Reader passes: eight, none empty, overlap 4, 1, 2 and 0.** W31's **zero** is the fourteenth
measurement and the first outside the settled 1-4 band, so the band is corrected to **0-4** and the
conclusion is not: a zero is what *"the second reader finds what the first was not looking for"*
predicts at its limit, and that pair produced the largest yield of the four. **The caveat is recorded
with it** — W31 primed both readers with the same list of its author's uncertain claims, which no
earlier measurement did.

**`check-owns.mjs` stays retired for the fifth plan** (eleven consecutive correct `Owns` audits;
P9's four at zero, zero, two and zero). **Rule 7 (c) is EXERCISED heavily** — all 136 probes declare
their set — and W29 found its mirror image: naming one check does not discriminate because a malformed
probe trips two, and **two clauses that both trip the right one are indistinguishable**. **`doc/` is
refused for the eighth time.** **Q141-Q153 all used, the first plan to spend its whole block; one
resolved. ADR 0034 and 0035 both SKIPPED.**

**[P9](doc/plans/p9-when-a-check-stops-checking-what-notices.md) was declared as — *when a
check clause stops checking, what notices, and does it notice for the right reason?*** It takes
[Q138](doc/open-questions.md) and [Q132](doc/open-questions.md) as **one subject**, because they are
the same defect from two sides: a self-test's META pass grades a broken check by its **exit code**, so
it cannot tell *the clause I broke was caught* from *something else went wrong* — and because the
verdict is an exit code, reaching it means re-running the whole probe suite. **Three items, serial**:
[W28](doc/work-items/w28-a-grading-names-the-probe-it-breaks.md) makes a grading name the probe it
breaks; [W29](doc/work-items/w29-the-two-self-tests-that-grade-nothing.md) gives a META pass to the
two that have none; [W30](doc/work-items/w30-the-clauses-nothing-probes.md) gives probes to nine of
the sixteen clauses that have none, including **`check-spec`'s first self-test ever**. **Q ids resume
at Q142; ADR 0034-0035 reserved and expected skipped; W31 reserved and expected unused.**

**[W29](doc/work-items/w29-the-two-self-tests-that-grade-nothing.md) is DONE** — author pass, both
readers and rule 8's re-run. *(This sentence read "its two readers have NOT run" for a day after
W29's own file said `done`, here and in `doc/README.md`, where the same paragraph then said "Both
readers ran" two sentences later. `doc/workflow.md` section 1 rule 5 is what made W30 read the item
file instead; **an index contradicting itself inside one paragraph is a new shape for that class**.)* `check-scheduler-selftest.mjs` is **20 probes / 22 gradings — one per `fail()` site plus one per way
the report can lie** — from 12 and none; `check-docs-selftest.mjs` is **14 / 8**, capped at one entry
per check id plus two for the report and one for the exit path, **with the nine it leaves out named in
the file's own header** *(these three figures read 18 / 21, 14 / 7 and ten — W29's AUTHOR-PASS counts,
left behind when its readers' fixes added two probes, a grading and a clause. W29's own file,
`README.md` and `doc/README.md` all carry the shipped numbers; this paragraph did not, and W31 rewrote
the two sentences above it without touching them. Found by W31's conformity reader)*
rather than omitted. *(That list read **six** until W29's conformity reader found it undercounting by
two — in five documents at once, in the item written to refuse exactly that. One of the ten,
`check-docs`' missing-document refusal, is reachable by **no probe at all**: every probe writes its
mutated reference to disk, so none can present a document that is not there.)*
**[Q141](doc/open-questions.md) is RESOLVED** — `D5`'s empty-parse clause reproduced inert at **12/12
green, exit 0**, closed by a `CHECK_SCHEDULER_DTS` override and a **hand-written** fixture, **which
closed two more `D5` clauses that were unreachable for the same reason**. Both files also gained the
report-row **`agree`** projection, after a measurement that deleting a row from the `checks` array —
or forcing every verdict to `ok`, which erases `check-scheduler`'s **`NOT RUN`** — was invisible to
every probe in both ([Q100](doc/open-questions.md)).

**[W30](doc/work-items/w30-the-clauses-nothing-probes.md) is DONE** — author pass, both readers and
rule 8's re-run, which caught three defects in the fixes themselves.

**Its two readers found 10 and 17, seven blocking, and the split is the cleanest since W29's**: the
conformity reader found **claims that were false** — a census wrong in six documents, an `Outputs`
row attaching a check id to an unmeasured case, a cluster table still stale after the item said it
had fixed it — and the adequacy reader found **bounds that were not there**, twelve of its seventeen
survivors on rule 8's obligations (a) and (d) and not one reachable by a probe that breaks a VALUE.
**Overlap 2**, the thirteenth measurement and inside the settled band. `check-spec.mjs` has a `--self-test` for the first time since W1, and
`scripts/check-spec-selftest.mjs` is **18 probes / 21 gradings**: one of each per `fail()` site for
`C1`-`C4`, `C6`-`C8` — **seventeen, with no cap** — plus two for the report and two for the exit
path. `check-source-selftest.mjs` goes **24/20/7 to 34/24/10**, closing `S4` and `S7`, the two clauses
[Q132](doc/open-questions.md) names as having no second route anywhere and which four clause-level
mutations had just been measured to leave at **24/24 probes green**. The gate chain is **19 entries**;
`npm run gate` is **322 / 326 s**, exit 0, zero FAIL lines, with L1-L6 unmoved.

**Its central finding REVERSES P9's own written-down prediction, and that is why the prediction was
written down.** P9 predicted `S11` would catch W30's new wiring, making P8's proposed **fifth
obligation for rule 8 — break the WIRING** — unearned. `S11` catches the **manifest** four ways, all
measured and all by name. **It does not catch the SCRIPT**: delete the four-line `--self-test`
dispatch from `check-spec.mjs` and `npm run check:spec:selftest` runs the plain check, exits **0**,
and `check:source` exits 0 beside it. Measured in **all SIX** checks that carry a dispatch — for
`check-docs` that is 128 s of gradings silently not running. *(This paragraph read **five** until
W31's conformity reader found it: W30's own conformity reader corrected the count to six and W30
recorded it as *"corrected in all six"* documents, and this was one of two it missed — so this
document said **five** here and **sixth** in W31's paragraph below. The same shape W31 names for W29
one paragraph up, in the same file, one item later.)* [Q149](doc/open-questions.md), and **the obligation is earned
on the item that predicted it would not be.**

**And the claim W30 argued hardest for was FALSIFIED by its own adequacy reader.** Its file said *"a
bound whose authority is the checked artefact rather than a declaration stops the regress where it
is"*; emptying `GRADED_IDS` — the list that bound named its universe with — printed **`0/0 graded` at
exit 0**, every grading gone and green. The authority was the artefact and the **scope** was a
literal with nothing beyond it. The list is now **derived** from `check-spec.mjs` twice over and
cross-checked, and rule 8's re-run then showed the hole **moved rather than closed** — which is
`check-source-selftest.mjs`'s own sentence, quoted in W30's header and not applied to it.

**Both of W29's structural holes were LIVE in `check-source-selftest.mjs`, and W30 measured them
rather than inheriting the claim** — an entry replaced by a **duplicate** of another, and one entry's
anchor made **global** so it disabled all five `S12` sites while naming one. Each reported
`20/20 noticed` at exit 0. Both closed, and both now bounded by a `SELF` entry rather than merely
present. **And [Q150](doc/open-questions.md) is new**: a `corpus` grading is a **pass**, so dropping
W30's own import relocation made all 21 mutants non-inert and the file exited 0 saying *"0 noticed by
the named probe, 21 by the corpus"*. Closed there by a declared `MAX_CORPUS = 0`; live in the other
four.

**And a mechanism can be unreachable in the file that most needs it.** On its first run **no META
entry in `check-spec-selftest.mjs` graded `caught`**, so W29's failure-COUNT discriminator would have
shipped as decoration in the file with `C7`'s five `fail()` sites under one id. An eighteenth probe —
one flow tripping the workerType clause and the predicate clause at once — makes it reachable and it
fires at **2 → 1** with the id set unmoved. **It then paid for itself twice**: forcing
`refused = true` is refused *because* the two report entries grade STILL CAUGHT and the count does not
move either. **The report-id repair, by contrast, has NO discriminating case this corpus can express** —
every id `check-spec` reports is two characters — so it ships inert, with the `C10` case constructed
and measured rather than argued, and **no META entry**, because one would grade STILL CAUGHT and be a
lie.

**The census parser was wrong in a direction no previous one has been, and the register was stale by
three.** W30's first parser was **code-span aware** and aborted on **three rows that render
perfectly** — Q101, Q102 and Q117 each carry an odd number of backticks. GFM cuts a table row on `|`
FIRST and parses inline code afterwards, which is also exactly why [Q131](doc/open-questions.md)'s two
rows really do render wrong. **A parser more careful than the renderer reads a different document.**
Corrected, the census is **CONFIRMED for the second plan running — 109 questions, 73 open, 2 deferred,
34 resolved**, 29 ids in both tables, Q119 and Q71 carried as two **declared** exemptions. **And the
cluster table was stale by three**: Q146, Q147 and Q148 sat in no cluster cell at all, in the half the
register's own note says is checked separately. Corrected in place.

**Its declaration step changed the item's SIZE rather than its table, and that is a first in fifteen.**
A META entry is **two** check runs, because W28's readers added the inertness run — so P9's *"~46 s for
ten entries"* is optimistic by **2.3x**. Measured: **7.1 s** an entry in `check-docs` against **~0.5 s**
in `check-scheduler`, two orders of magnitude, and the coverage was bought accordingly rather than
evenly. **The obvious mitigation is unsafe today**: `check:scheduler:selftest` moves
`node_modules/fyflow-scheduler` aside and an `AGENTS.md` snippet imports it, so those two self-tests
**cannot run concurrently** — invisible while the gate's chain is `&&`, and a flaky snippet failure the
moment anyone parallelises it. [Q148](doc/open-questions.md), for whoever answers
[Q133](doc/open-questions.md).

**And the finding to carry is a limit of rule 7 (c)'s own form, one layer out — corrected once under
measurement, which is the half worth reading.** `D2`'s and `D5`'s unreadable-input clauses both came
back **STILL CAUGHT**, and the author read the same mechanism into each: **a sibling clause reporting
the SAME id firing in the disabled clause's place**, invisible to set equality. Both entries were made
to **declare** the masking, on the argument that the declaration goes red if the masking ever changes.
**That argument was FALSE and W29's conformity reader measured it**: deleting `D5`'s
`!failures.some(…'D5')` fallthrough guard left the file at **18/18, 21/21, exit 0** — the guard was
deletable for 0, a *third* instance of the class inside the mechanism written to describe it.

**The fix is the discriminator [Q146](doc/open-questions.md) itself proposed and the author had
declined: the failure COUNT.** A `caught` verdict is no longer terminal — the entry is re-run against
the unmutated check and the counts compared, one extra child for the entries that reach it (today,
one). **And it split the two cases apart the moment it ran.** `D2` is **CO-FIRING, not masking**: both
clauses report under `D2`, so disabling one moves the count **2 → 1** and the clause **is** detected —
it is graded normally now and its declaration was removed. `D5` is the real thing: same id **and**
same count, because its guard exists so the two never both report. **Co-firing is detectable by a
projection nobody was reading; masking is not.** Rule 7 (c) settled that naming *one* check does not
discriminate because a malformed probe trips two; this is the mirror image — **two clauses that both
trip the right one are indistinguishable** — and the signal that discriminates half of them was
printed in the report all along, as `(2)` versus `(1)`.

**Rule 8: 29 provocations, 14 refused, 15 survivors, eleven of them the ceiling** — wider in these two
files than in `check-source` because **neither has a `SELF` list**, and W31 is narrowed to
`check-policies`, so nothing picks them up. **Two positive tests the set structurally could not reach
both fired**, and the first closes a named gap: **[Q144](doc/open-questions.md)'s missing case is
CONSTRUCTED** — a mutant inert on the clean tree and **fatal under the probe**, reporting `ran: no`
with the guard live and the identical crash graded **`disappeared`** with it disabled. That is the
first demonstration anywhere that `ran:` fires, in a guard live in five files and provoked in none.
The second is W29's own new **ambiguous-anchor** guard, which refuses a three-way match by name.
**[Q147](doc/open-questions.md)** is the survivor worth naming: re-sourcing `tripped` to the report
rows costs **0**, because the report entries then pass as `disappeared` instead of `disagreed` — **the
right verdict by the wrong route**, which is Q138's shape one layer further in.

**The 39 check clauses split THREE ways and nobody had written the middle one down.** 13 have a probe
**and** a grading; **10 have a probe that nothing grades** — `D1`-`D5` and `X1`-`X5`, because
`check-docs` (14 probes) and `check-scheduler` (12) have **no META pass at all**, and `check-policies`
has META and no `SELF`; and 16 have **no probe**. That split is the item decomposition, and it is why
P9 is three items rather than two.

**Its declaration measured six load-bearing facts, four changed what got written, and one of the four
was a hypothesis it killed before writing it down.** [Q132](doc/open-questions.md) says `check-spec`
has *"8 more clauses, 0 probes"* — it is **7**, because
[W25](doc/work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) gave `C5` two probes one item
after Q132 was written at W24. **[Q141](doc/open-questions.md) is new and is the one live defect**:
`check-scheduler`'s `D5` empty-parse clause can be made inert with **all twelve probes green**,
because no probe supplies a `.d.ts` the parse cannot read — while four other clause-level mutations of
the same two checks were **caught**, so the yield of *no META pass* is **1 in 5** and is reported as
measured rather than assumed. **And the killed hypothesis is the `ALL_CHECKS` allowlist** W24 removed
from `check-source-selftest.mjs`: it is still in three self-tests and **renaming a reported id outside
each list was caught in all three**, because every id those checks report is declared by some probe.
[Q43](doc/open-questions.md)'s class, refused at the declaration step rather than written into the
register as a hole.

**Q138 is confirmed and sharper than its own row.** Across all 56 code-targeted META entries in
`check-source` and `check-markdown`, every grading is `r.status !== 0`; **which probe gets the credit
is an artefact of `PROBES`' ORDER** — five of `check-markdown`'s six slug-rule mutations are credited
to *a link to a file that does not exist*, while the two probes written for the slug rule sit lower and
never run; and in **7 of 56** the crediting probe declared a non-empty set and reported a **strictly
larger** one, meaning the mutant became **noisy** rather than being detected. Only **14 of 24** and
**31 of 37** probes are ever the one that notices.

**And the declaration's own four documents turned the gate RED, which is the seventh fact and the one nobody could have predicted.** `scripts/check-markdown.mjs`'s header argues its `M3`/`M4`/`M5` floors are *"a MINIMUM nobody is obliged to raise, which is what keeps them out of [Q102](doc/open-questions.md)'s shape"*. **Right about the CHECK, false about the PROBES** — `M3` and `M4` are fired only by two `removes` probes that cut directories out of a copy of the tree, so each floor must sit **above the probe's fixture and below the whole tree**. One plan and three work items took *doc/decisions removed* from 46 files to **50** against a floor of `< 50`, and `npm run gate` exited **1**. **So it IS Q102's shape and worse** — two-sided rather than one-sided — and the mitigation is the direction: `RUN_FLOOR` went stale *silently, toward weakness*; this failed *loudly, in the gate*. Retuned to **56 / 1350 / 60** from a measurement, which restores green and **does not remove the ratchet**. [Q142](doc/open-questions.md), owned by W28. *(Retuning it then broke the two META entries pinned to the old literals — rule 7 (b) firing correctly rather than passing: **a mutation pinned to a magic number is unmutatable the moment the number is right to change.**)*

**The census was CONFIRMED rather than corrected, for the first time in four plans** — 99 → 100 with
Q141, **65 open, 2 deferred, 33 resolved** — and the parser aborted three times on real hazards first.
**The third abort is the one to carry**: honouring only the strict `| a | b |` row shape **silently
merged Q87 into Q86 and lost a whole question**, and the parser did **not** abort, because a merged
row is still classifiable. *A parser that aborts on what it cannot classify does not abort on what it
misreads as something else.*

**[W31](doc/work-items/w31-the-self-list-check-policies-never-had.md) — P9's LAST item — is DONE**:
author pass, both readers and rule 8's re-run. `scripts/check-policies-selftest.mjs` is **13 probes /
6 gradings / 14 SELF**, from 13 / 6 / none, and `check:policies:selftest` goes **2.2 s to 14.7 s**
(bare `node`), against a control — `check:spec:selftest` — flat at 17-21 s on both sides.

**Its two readers found 5 and 10, eight blocking, and the OVERLAP IS 0 — the fourteenth measurement
and the first outside the settled 1-4 band.** Their only shared subject is
[Q152](doc/open-questions.md), approached from opposite ends and yielding two different corrections.
**One caveat, stated rather than buried**: both were given the same list of *claims the author was
least sure of*, a priming none of the thirteen earlier measurements had. The adequacy reader found
**guards that were not there** — four of its five blocking findings were unreachable by the author's
own set, and **three of those four are one shape: an entry written to a LIST when the thing it had to
bound was a GUARD**. The conformity reader found **claims that were false** — a register row
generalised from one file to six, a ceiling row quoting a literal the file no longer contains, and a
cost decomposition that accounts for the whole run inside one of its phases.

**The sharpest single finding is the verdict the thirteen probes exist to produce.**
`if (caught !== PROBES.length)` cost **0**, and the ceiling list had never carried it — the two
verdicts it names are the META one and the `SELF` one. **It is also what makes rule 7 (b)
load-bearing**: a probe whose mutation matches nothing prints its `FAIL … the mutation matched
nothing`, prints `12/13 probes caught`, and without that line **exits 0**. No other `SELF` entry could
reach it, because every other one breaks a LIST and this breaks the VERDICT OVER a list.

**And [Q152](doc/open-questions.md) is the register's own standing failure in a row raised to record a
different instance of it.** It generalised a measurement taken in one file to six; `check-spec` and
`check-scheduler` do NOT carry the message-only form, because W29's failure-COUNT discriminator turned
that arm into a block that can set `ok`. Disabling it costs **1** and **2** there. Corrected in the
register, here and in `doc/README.md`. **That is the cheapest self-test in the gate becoming a mid-priced one**, for a
check with three clause ids and ten `fail()` sites, and it is recorded as a number rather than a ratio.
`npm run gate` is **425 s over 19 entries, exit 0, zero FAIL lines**, with L1-L6 unmoved at 474 `test()`
cases and 489 L6 assertions.

**Its declaration was wrong in FOUR places before anything was built.** `Reserves: Q146-Q148`
**collided with W29**, which reserved the same block and used all three — corrected to **Q151-Q153**
with nothing renumbered; the gate is 19 entries, not 18; the baseline sha was W28's; and the Record's
prefilled *"one `META` entry deleted — cost 0"* is **1**, because `MIN_META` fires and the hole is the
floor being **lowered**. Eleventh time a row has been found wrong by trying to act on it, and the
first time it was the item's own file before it had run anything.

**Its headline is P9's own question one layer further out, in the entries written to close it, and its
own green run could not see it.** [Q151](doc/open-questions.md): the `SELF` mutants were written into
the scratch directory a child deletes on its first line, so no `META` grandchild could re-import them.
**All twelve entries passed — `12/12 bounded`, exit 0** — while every grading inside every child read
*"the mutant did not run: this is a crash, not a detection"*. **The whole pass was measuring the
deletion.** A grading of the shape *the child failed* cannot tell a fired floor from a broken harness,
which is [Q138](doc/open-questions.md) restated one level out. Found by rule 8's set, not by the file.
Closed by a **control run** — an unmutated copy, run as a `SELF` child, must RUN and must NOT be graded
— routed through the same expression the entries use, so the control is that expression's negative
case; reintroducing the defect is refused by name. **Live in `check-source-selftest.mjs` and
`check-markdown-selftest.mjs`.** *(It also falsified the item's own cost figure — the first "after"
reading was **8.5 s** against the broken harness, and **a performance number taken from a crashed child
is a claim about the crash**.)*

**What a `SELF` list BUYS is now measured as a pair in one file, which is what P9's retro needs from
this item.** **Thirteen** mutations cost **0 before and non-zero after**: `MIN_META` lowered alone and
compounded; `MIN_PROBES` lowered alone and its disjunct; a duplicate `META` entry; an ambiguous anchor;
a global anchor disabling all six `P3` sites while naming one; a second `wide` exemption; a grading
passing as `corpus`; the inertness run that produces it; the `ran:` guard both halves; the PROBE-PASS
verdict; set equality downgraded to cardinality in the main pass; `ALL_CHECKS` widened; and
**`MAX_WIDE -> 99`, which W30 recorded as SURVIVING in `check-source`**. *(This paragraph said **nine**
and enumerated **eight**, mixing a count of mutation rows with a count of entries — W31's conformity
reader. The list above is the mutations, which is what the sentence is about.)* **And what it buys nothing against is anything that RETURNS BEFORE IT**:
`if (!meta) -> if (true)`, `if (nestedSelf) -> if (true)` and the outermost verdict all survive, because
the mutation reaches the parent as well as the child. *The regress does not move one list further out;
it stops at the first thing that can return early.* **The item's own header argued the opposite before
it measured and corrected itself in place** — the second time in this item that a claim about what a
mechanism cannot reach was written from the mechanism instead of from the entries.

**And two of W28's three verdicts CANNOT be made load-bearing, in any file** —
[Q152](doc/open-questions.md). The ABORT and STILL-CAUGHT arms assign a message and never touch `ok`,
so each costs 0 with the `SELF` list in place exactly as without one; the item was declared to take all
three to non-zero and two of them cannot go there. **Only the `ran:` guard changes a verdict, and this
file is the only place its case exists** — W28 had to DELETE that mutation as a `META` entry because it
crashes under its own probe ([Q144](doc/open-questions.md)), and as a `SELF` entry it is exactly right,
at `6/7` exit 1 with the guard live and `7/7` exit 0 with either half disabled. **The second
demonstration anywhere that `ran:` fires.** *The mutation that could not be a `META` entry is the one
that makes a `SELF` entry for the crash guard possible.*

**Rule 8: 40 provocations, 20 refused, 20 survive, run FIVE times** — an author pass and four re-runs,
each after acting on the previous one's findings, and each re-run moved provocations. Three ride-alongs
taken with a live case measured first; the ambiguous-anchor guard taken **with no live case, stated**,
its entry constructed from `fail('P1',` — the one anchor in the check that occurs twice without being
global. **Two DECLINED on measurements**: a per-id coverage bound fires on nothing here and a per-site
one would need five new `META` entries, one impossible inside this item's `Owns`; and the failure-COUNT
discriminator would ship as decoration, because **no entry here grades `caught`**.
[Q153](doc/open-questions.md) is the third question: a `SELF` list is bounded by count and not by
content — `13/13` exit 0 with a duplicate entry — closed here and live in the two other files with one.
**[Q149](doc/open-questions.md) is confirmed for the sixth check**, and `S11`/`S12` do not fire for this
item, which adds no `package.json` entry, exactly as W30 predicted.

**The census is CONFIRMED for the THIRD plan running — 112 questions, 76 open, 2 deferred, 34
resolved** — both halves at 112 of 112 in exactly one cluster cell, so W30's cluster repair held. The
parser aborted on Q119 and Q71, carried as declared exemptions, and **twice on Q87 in two opposite
directions**: 2 cells reading its first line, 3 reading its last, for a row that renders as 4. The
width check belongs only on a first line that both opens and closes with a pipe, which is what this
file's own stated predicate has said all along. **A parser can be wrong about a row in two opposite
directions on the way to being right about it**, and neither wrong reading is visible in the rendered
table.

**[P10](doc/plans/p10-is-fan-out-one-feature-or-two.md) is DECLARED — *is fan-out one feature or
two?* — and it is the first PRODUCT plan since P7.** [Q12](doc/open-questions.md) has been open since
P1 and is **the only open question that might mean the library is missing a FEATURE rather than a
guarantee**. Four items, serial: [W32](doc/work-items/w32-what-a-map-fanout-is.md) (what a map-fanout
is, and what its `branchPath` is — **ADR 0036**),
[W33](doc/work-items/w33-a-map-at-run-time-arity.md) (the driver and the three policies at run-time
arity, and N=0), [W34](doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) (what a
branch receives and what a join carries — **ADR 0037**) and
[W35](doc/work-items/w35-a-map-on-real-workers.md) (a map on real workers). **Reserves W32-W35,
Q154-Q163, ADR 0036-0037**, and unlike P9 it expects to take **both** ADRs.

**Its declaration measured seven facts and four changed what got written. Two made it much smaller
than [Q12](doc/open-questions.md)'s row reads, and the split is between a GRAMMAR and a DERIVATION.**
The id **grammar** already admits run-time arity — 500 ids for one node at 500 indices are 500
distinct strings, and `3.11`, `137.0` and `0.9999` all round-trip — so **`spec/task-id.md` needs no
format change**, and none of the *"every fixture, every log line and every test name"* cost P1 spent
an argument reserving against. And **two of the three shipped policies never read `region.branches`**
— measured with a `Proxy` rather than read — and answer identically at N=3, N=7 and N=1, which is
[ADR 0030](doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)'s
*"it needed no mechanism"* a second time. **So P10 is a definition-and-driver plan, not a join plan.**

**What it must decide is what the DERIVATION pins.** `branchPathOf(regions, nodeId)` takes the region
sets and a node id and **no run-time input at all**, so three dispatches of one node mint **one id of
three** and the second is a `DuplicateTaskId`. That is `FD-V19`'s own stated reason for existing, and
it falsifies `spec/task-id.md` section 1's *"`branchPath` is a property of the node"* — the sentence
[W21](doc/work-items/w21-the-branch-path-is-a-path.md) made true about the code one plan ago.
**A map-fanout is refused today three different ways depending on arity**: `FD-V9`'s repeated-entry
clause at N≥2, `FD-V9`'s arity floor at N=1, and `FD-V11`'s reachability at N=0, where the join and
the `end` become unreachable from entry.

**Three of its findings are live today rather than hypothetical, and the first is the sharpest.**
`arrival-count` at a run-time arity does **not** hang: with `need` fixed from a branch list the run
does not use, it reports `satisfied` on the **first** arrival **with two branches still live** — a
join fired over a region that has not finished, which is a failure direction W4's matrix never saw,
because every failure it recorded was `need` being too **large**. **N=0 is `waiting` in all three
policies** — `live-token` hangs on ADR 0003's own *"having been positive"* clause — and `FD-V9`'s
arity floor means the static feature can **never** reach it. And **a fan-out hands ONE payload object
to every branch**: `a.payload === b.payload` is **`true`**, so a branch mutating what it was given
mutates its siblings' input. The payload **is** cloned once at the edge hop, so the log is protected
and the siblings are not, and `spec/` states no contract on it: **measured across all seven documents
there**, `payload` occurs **six times on five lines in three of them** — the outcome record's own
field, `settleJoin` taking no payload parameter, and `start(payload)`'s signature — and **not one says
what a node receives or whether two branches may share it**. [Q154](doc/open-questions.md), **measured
at ladder L2 in ONE flow with `createTask: (c) => c`; the thread-pool half is NOT measured**, which
is the scope stated rather than generalised (`doc/workflow.md` section 1 rule 5's writing clause).

**And the join's successor receives `null`, which is why [Q11](doc/open-questions.md) and
[Q12](doc/open-questions.md) are one plan.** Not because both touch a payload — **because a map that
runs N tasks and hands its successor `null` has computed N results and thrown all of them away.**
[Q36](doc/open-questions.md)'s owner cell read `W2`, an item from P1 done since. **P10 decides it
AFTER the map runs**, deliberately: a join-payload rule written before a map exists has one case and
would be generalised to the case that matters, which is P9's *"a claim written from a mechanism
instead of from the cases"*.

**[Q9](doc/open-questions.md) is declared OUT with a measurement rather than on scope, and stays
open.** Freezing the argument is already effectively done — the driver hands the predicate a clone —
and catches mutation and nothing else; **evaluating twice caught 1 of 4** impurity shapes and is
*flaky* on `Math.random()`, which is the one property `doc/concept.md` section 5 refuses; and **ladder
L3, the rung the register cites for it, structurally cannot reach a predicate** — a `FoldInput`
carries an outcome record and a region event, so routing is already decided and `selectEdge` is never
called from the fold. That last is a finding about the **ladder**, not about Q9:
[Q155](doc/open-questions.md).

**[Q142](doc/open-questions.md) was measured BEFORE the documents landed, and that is a first.** Its
two-sided window caught P9's declaration and W30; P10's declaration adds **five documents that survive
both `removes` cuts** — four work items plus the plan file — so the one-directory fixture was
predicted to go **51 → 56** against `M3`'s floor of `< 56`, stopping probe 1 firing. **It did,
exactly.** Retuned from a three-count pass to **64** and **1720** (`M5` untouched at 60 for the third
plan running), and the two `META` entries pinned to the old literals were repointed — **rule 7 (b)
firing correctly rather than passing**, which is *"a mutation pinned to a magic number is unmutatable
the moment the number is right to change."*

**Two claims P10 was handed were FALSE and checking them is what found it.** *"The Verification and
fixtures cluster has never resolved one"* is wrong by the register's own predicate — it has resolved
**two**, [Q126](doc/open-questions.md) by W24 and [Q141](doc/open-questions.md) by W29 — and two of
thirty-eight is still the worst ratio of any cluster, so the point survived and the number did not.
And a running count of *"plans that measured a load-bearing fact before declaring"* was quoted as
**sixteen** where `doc/workflow.md` section 4 says **nine** and P9's own declaration says
**thirteen**, on a wider predicate. **P10 adds no number to that**, because the predicate is stated
nowhere in one expression. *(Found in passing and deliberately NOT fixed, because it is not P10's:
this document says **"Q121 is RESOLVED"** in its W25 paragraph while that row's own status cell reads
`open`.)*

**The census is CONFIRMED for the FOURTH plan running — 114 questions, 78 open, 2 deferred, 34
resolved**, both halves at 114 of 114 in exactly one cluster cell. **The parser aborted twice on its
own conventions and was then WRONG ONCE WITHOUT ABORTING, which is the one to carry.** Counting the
empty leading and trailing cell puts *"the second-to-last cell"* on the **Owner** column — it returned
`W4` as Q4's status and said so — and the **Resolved table is THREE columns with no status cell**.
Then the cluster half: the cells write `Q8-Q12` and `Q36-Q39`, so a bare `/Q\d+/` reads the endpoints
and **silently loses everything between them**, reporting **ten** ids in no cluster cell where the
true answer was **two**. **A missing id is still a classifiable answer, so nothing fired.**

**P7's exit artifact exists.** A nested fan-out runs end to end on a real scheduler, in **both L6
runtimes**, with the outer join firing over branches it never opened. Ladder L6 is **489 assertions,
23 row labels, 25 real runs** (from 373 / 19 / 21), and it dispatches the **first dotted task ids any
rung above L2 has asserted** — `r18:scoreC:1.0:0` and its siblings, the shape `spec/task-id.md`
reserved in P1. L0-L5 are **474 in five runtimes**, unmoved by W23, which is the declared result.

**[W23](doc/work-items/w23-a-nested-flow-on-real-workers.md)'s harness had the same defect the driver
had.** `examples/l6.ts` hard-coded the literal `'split'` as *the* region in **18 places** — W22's
`Cell` finding one rung up — and its inbound `resolve()` step minted ids with `Number(branchPath)`,
which is **1** for `'1.0'`, not `NaN`: a well-formed id for a **different task**, reported as a
refusal naming the wrong cause ([Q117](doc/open-questions.md), whose own row described the failure
incorrectly twice). Both fixed. **[Q107](doc/open-questions.md) is closed for one boolean** —
`ForeignTask.optional` — and **[Q90](doc/open-questions.md) is declined with a measurement that
corrects P7's stated cost**: `ID-R4` tier 2 does not drop silently, so a foreign task carrying a
run's own id **stops that run** and cannot join a row whose claim is both runs completing.

**LOOP BOUNDS is a fourth obligation for rule 8, and it now has two occurrences in two items.** An
author's probes break VALUES — what a thing is; a reader's break BOUNDS — how many things are
iterated. W22's reader found a matrix row and a whole column deletable **for 0 failures**; W23's found
**four L6 rows and the entire foreign-task list** deletable for 0, the second taking **P6's** exit
artifact with it. **W23 ran five bounds probes deliberately and all five were caught, and its reader
still found two more** — the author bounded the lists a *row* iterates, not the lists the *file*
iterates. Both occurrences are BLOCKING and no value probe reaches either. **For P7's retro.**

**[Q6](doc/open-questions.md) — P7's own question, open since P1 — is ANSWERED by
[ADR 0030](doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md):
a join IS transitive over nested fan-out, for every policy, and it needed no mechanism.** Measured
over four depth-2 rows × the four matrix columns — **each region answers exactly as the depth-1 row
of the same shape does**, sixteen cells. `N` is per-region, so an inner branch never needed counting
by the outer join. **`spec/join-policy.md` is v0.10 and 474 assertions run in five runtimes.**

**P7's own decision was falsified by W22's declaration step, and that is a first.** The plan settled
that `arrival-count` would **REFUSE** nesting at construction, on the ground that *"`N` is fixed at
the outer branch list and an inner branch has no way to be counted"*. That is **not a mechanism** —
`arrival-count` reports `satisfied` at both depths on an all-arriving nested flow — so the refusal,
the driver construction check, the new error class and the matrix's first declared-empty cells were
**all struck**, and the plan's stated size problem dissolved with them. Nine plans have measured a
load-bearing fact before declaring; this is the first time it took out a **decision** rather than a
table. *(The plan carries the correction in place; W22's own file is what an item reasons from.)*

**What ADR 0030 actually decides is the one thing that is NOT a depth-1 behaviour one level down.**
An `unsatisfiable` join's exit emitted **nothing at all** — unobservable at depth 1, because a
top-level fanout is in no region, and at depth 2 it left an outer branch with **no terminal event**
in a run that was neither suspended nor in flight, which `JP-R5`'s own enumeration does not admit.
**`JP-R10` ends that branch and the enclosing policy decides for itself**; at depth 3 the cascade is
**emergent from one emission** — `inner` dead → `mid` dead → `outer` **satisfied**, three verdicts,
none of them the driver's. A walk outward would have put satisfaction in the driver, which ADR 0001
rule 1 forbids.

**W22's two blocking findings point in different directions and the second is the method one.** Its
conformity reader found **`spec/join-policy.md` section 2 contradicting the rule the item had just
added**: `branch.lost`'s stated condition is *"a node … reached a terminal state — by settling, or by
being resolved — and no edge was eligible"*, and a dead join satisfies **neither** — the ADR had
quoted only the trailing consequence clause and read it as a definition. Section 2 now has an (a) and
a (b). Its adequacy reader found **two LOOP BOUNDS**: a whole depth-2 row deletable for **0
failures**, and a whole column droppable from the depth-2 loop for **0 failures with the assertion
count unmoved**, while the render kept advertising four columns. **An author's probes break VALUES; a
reader's broke BOUNDS**, and 28 of the author's could reach neither — that is neither v0.7's two
obligations nor v0.8's third, and **for P7's retro**.

[ADR 0001, 0002 and 0007](doc/decisions/) settle the architecture so far: **routing executes in the
driver, outside the scheduler** — a worker computes and does not route, and `context.spawnTask()` is
not used for flow control; **a flow definition is data with predicates registered by name**, where
an unknown name fails at instantiation rather than at routing time; and **the driver normalizes
every scheduler event into an immutable outcome record at the listener boundary**, because event
details are live mutable objects and `task.failed` also fires for `user_action` tasks. Pinned to
`fyflow-scheduler` **0.3.0**, installed **from npm**, with Deno reaching `@fyflow/scheduler@0.3.0` on **JSR** — [ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md).

**[P1](doc/plans/p1-what-satisfies-a-join.md)'s five work items are all built.** `spec/` holds **six
normative documents and 73 numbered rules**; `src/` holds the definition validator, the driver and
the fold with **three** join policies (two P1's, one ADR 0025's); `test/matrix/` holds the
join/failure matrix; `examples/` holds ladder **L6**. **410 assertions in five runtimes** — Node 24,
Deno, chromium, firefox, webkit — identical in all of them, **plus 373 at L6 in Node and Deno**. *(**426 since W21, measured in all five** — `npm run gate` runs three, so `npm run test:browser:all` was run for firefox and webkit rather than the word *five* inherited. Two items running have had a reader catch that parenthetical inheriting it. **Nested fan-out is a valid definition and mints the dotted `branchPath` the grammar reserved in P1** — `spec/flow-definition.md` and `spec/task-id.md` are both v0.7.)*
*(**The two numbers count different things.** The runner counts `test()` **cases**, not `equal`/`ok` calls — [Q98](doc/open-questions.md); L6's 373 is a real count of individual assertions. Do not add them.)* **`npm run gate` runs `test:browser`, which is CHROMIUM ONLY** (`scripts/run-browser-tests.mjs:68`); firefox and webkit need `test:browser:all`, which W19 ran to measure the five above rather than inherit them. **`doc/workflow.md` is v0.7**, run to
completion by six plans.

**[P2](doc/plans/p2-the-non-success-half-on-a-real-scheduler.md) is complete and added no features.**
Ladder L6 is **nineteen row labels, 373 assertions, 21 real runs**, in Node and Deno, and **all six run
outcomes and all six region events now occur there** — `awaiting_action`, `stopped`, `branch.suspended` and
`branch.resumed` for the first time. **Nothing in `src/` broke**, which is the weaker result P2
predicted when it measured `user_action` before the plan was written: **all nine of W6's findings
were in the gate that was supposed to be checking `src/`.**

**The one behavioural surprise was not in the non-success half at all.** The join had **never once
been fired from the `lost` or `exited` path** across twelve rows, because the arriving branch always
settled last — so `settleJoin` could be deleted from both other paths and nothing noticed. That is
P1's own case, and `spec/join-policy.md` section 4 exists for it. Fixed by **arranging** the causal
order with per-role delays rather than hoping for it.

**[P3](doc/plans/p3-a-consumer-reference-the-gate-keeps-true.md) is complete and retro'd, and its
retro is what made `doc/workflow.md` v0.5.** **[AGENTS.md](AGENTS.md) is the consumer reference** and `npm run gate`
extracts, typechecks and executes its snippets. Its two readers measured the thing to know about it:
**the gate covers about 16% of the reference**, and the other 84% is prose that can be inverted with
the gate green. The response was not to guard the prose but to **move the load-bearing claims into
assertions** — 7 `run` snippets became 11, and the six-outcome precedence table, the `user_action`
event pair and a double `resolve()` are now executed rather than asserted in a sentence.

**P3's retro says that is an acceptable steady state and names what is not.** The criterion, so it is
not re-derived: *a claim a consumer writes code from belongs in an assertion; a claim they read for
orientation does not.* What is **not** acceptable is what P3 also produced — **the prose absorbed
three `src/` defects rather than the code being fixed** (`AGENTS.md` §12 documents a cast for Q71;
§§2, 9 and 10 document Q72 as a hazard). **Rot is what the gate prevents; absorption is what it
cannot see**, because an accurate description of a defect passes every check there is. Its one
adopted change is rule 7 (c): a probe now declares the **set** of checks it must trip, because naming
one does not discriminate — a merely malformed probe trips two at once.

**[P4](doc/plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) is the active plan and it
deletes two of those three apologies by fixing the code.** One subject — *what is a `Driver`'s
lifetime, and what makes an inbound event or an outbound handle **this run's*** — and three
reader-found defects: [Q53](doc/open-questions.md)'s many-run surface,
[Q72](doc/open-questions.md)'s two-drivers-one-scheduler cross-routing, and
[Q73](doc/open-questions.md)'s unfrozen region event. **W12-W14 declared**; W10 is held for
`check-owns.mjs` and W7, W8, W11 are skipped. **Its load-bearing fact was measured first and it
changed the design:** filtering `Driver.onEvent` by run id — the mechanism the register proposed —
closes **one of four** inbound holes, while `dispatched.has(taskId)` closes all four with state the
driver already keeps. Run-id-at-construction was spiked in the working tree: `src/` typechecks clean
and **all thirteen L6 rows pass**. What happens next, in order: [doc/README.md](doc/README.md).

**[P5](doc/plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md) is COMPLETE and retro'd,
and it answered [Q24](doc/open-questions.md) — third and fourth policy, or repairs of the first two?**
**W15, W16 and W17 are all done**, six reader passes between them, and **`doc/workflow.md` is now
[v0.7](doc/workflow.md)**. The matrix renders at **four columns** and every one of its
nine rows runs against all four policies — 36 cells, where the refinements had previously been
executed on four. `JP-R7`'s and `JP-R8`'s effects are asserted as **exact sorted row lists** rather
than as counts, each three ways: the declared literal, a predicate over the row's own region-event
stream, and what the columns did. And the **`unsatisfiable` chain runs
end to end for the first time** — a policy's answer, through a real `Driver`, through `foldInputs()`, to
`RunState.outcome === 'stuck'` — where each of its four links previously had its own stub and nothing
ran them as one. W15 takes **no decision and writes no spec**, deliberately: ADR 0025 is W16's, and
building the evidence first is what stops it being written from the argument in P5's prose.

**Its sharpest finding is one the counts hid.** `JP-R7`'s variant, on the all-branches-exited row,
reaches `need: 0` with nothing arrived — so it **fires a join zero branches reached**, which is
precisely the cost ADR 0003 records for `live-token` and precisely what `JP-R8` removes. **The two
refinements point in opposite directions** ([Q91](doc/open-questions.md)). And its **one surviving
provocation of twenty-two**: the `at most once` latch on the driver's `unsatisfiable` path can be
deleted with all 361 assertions still green, because no policy here settles a join before every
branch is terminal ([Q95](doc/open-questions.md) — **W18 closes it with a stub**).

**Its readers found what its own provocations structurally could not, and the lesson generalises.**
Twenty-two probes, written to the rules' clauses as `doc/workflow.md` v0.6 asks, all mutated something
the suite reads — so **both** of the things W15 *created* went unmeasured: the four-column render was
produced by a script `npm run gate` never executes (**seven** surviving mutations, one of which
printed a two-column table with the whole gate green), and the two variant policies were promoted to
columns and to ADR 0025's evidence **without inheriting one of the clause-level tests the shipped pair
has** (four survivors, each with a named test for `arrival-count` or `live-token`). Both are closed:
the render is now a function the suite asserts field by field, and the variants are held to `JP-R1`,
`JP-R2` and `JP-R3` in `test/matrix/variants.test.ts`. **For P5's retro: writing provocations to the
rule finds holes in the CODE and is blind to the DELIVERABLE.**

**[W17](doc/work-items/w17-the-all-exit-row-at-l6.md) puts the `all-exit` row on real workers and
completes P5's exit artifact.** At the time it landed, ladder L6 was **19 real runs and 342 assertions**, and one run's join
is now **reported dead** — `joined: false`, `onUnsatisfiableJoin` carrying the policy's own
`describe`, and the fold reaching `stuck` — which nothing at L6 had ever reached. One flow, one
payload, three policies, three answers: `completed`, silently `stuck`, and `stuck` with a reason.

**Its two findings are both about the harness, and the second is the sharper one.** First, the three
declared rows **could not test the policy they were built for** — they run
`live-token-requiring-arrival` on one scenario where `arrived` is always zero, so deleting the
arrival count from the policy left all **316** assertions green — the count at the moment the three rows
were the whole of it; a fourth row on P1's own case closes it.
Second, **W6's causal arrangement was a load-bearing test input held down by nothing**: reversing one
`Set` literal in `examples/run-flow.ts` restores W6's original defect exactly — `settleJoin` deletable
from the `lost` path with the gate green — and drops `exit-last` from four failures to none on the
`exited` path. That is rule 8's own case one item before rule 8 existed. `Expectation.joinSettledBy`
closes it; the other three harness knobs are [Q99](doc/open-questions.md).

**Its two readers found two BLOCKING survivors, both in the harness and both the same shape.** The
termination race could be replaced by a **1200 ms sleep** — longer than the run, where W5's recorded
probe is 1 ms and truncates it — with all 341 assertions green, because `finishedBy` was read from a
flag rather than from the race's own result; and `lateInputs`' single recording could be deleted,
making `RN-R12`'s *"nothing arrived after"* a tautology on nineteen rows. **Both are this file's own
`timedOut` lesson in fields that had not inherited it**, both are fixed by deriving the value from one
source, and both fixes are provoked — the reader's exact probe now costs 22 failures and a genuinely
late input costs 18. **Overlap between the two readers: 3 of ~31**, the eighth measurement and inside
the band.

**And W17 answers P4's retro prediction 1 in the direction the first two items did not see.** W15 and
W16 both found rule-written provocations blind to what the item *created*; W17 found the thing it
created blind to a **clause of the rule**, which only the clause-by-clause walk saw. Three items, both
halves. Its other Q is [Q100](doc/open-questions.md) — **L6's rendered table is a deliverable no
assertion reads**, which is W15's renderer finding in a second file and therefore a second occurrence.

**[P6](doc/plans/p6-what-may-share-a-scheduler-with-a-driver.md) is COMPLETE and retro'd — [W18](doc/work-items/w18-the-scheduler-edge-and-what-an-id-we-did-not-mint-means.md), [W19](doc/work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md), and `doc/workflow.md` v0.8** —
*what may share a scheduler with a driver?* It takes the three things P5 ruled on and could not own,
because **no P5 item takes `src/driver/**`**: [Q86](doc/open-questions.md) as **ADR 0027**,
[Q87](doc/open-questions.md)'s message sentence, and [Q95](doc/open-questions.md)'s latch. **Two of
those three register rows were wrong and were corrected by trying to act on them**, which is the
fifth plan running to find one that way. `InvalidTaskId` has **three** producers — `buildTaskId`
outbound, and `parseTaskId` at `resolve()` and at the listener — and **Q86 is about the listener
alone**, which the register read as one site. And Q95 is **not dead code**: its precondition is any
policy that settles a join *before every branch is terminal*, and with the latch deleted such a
policy routes the join twice and the run dies on `DuplicateTaskId`. **Its urgency is that `AGENTS.md`
§9 already recommends the shared-scheduler topology** while one foreign task on that scheduler stopped
every driver subscribed to it.

**W18 answered Q86 with [ADR 0027](doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md),
and it took the third option — *ignore it, but report it*.** A settlement whose task id does not parse
was minted by **no** driver (`buildTaskId` emits only four-segment ids in the `ID-R2`/`FD-V16`
charsets), so it is **`ID-R5`**: decided at **tier 0**, ahead of `ID-R4`'s two tiers because both
compare a run id and an unparseable id has none; reported through the new **`onUnmintedTask`**; and
dropped, with the run still routing. **ADR 0023 rule 2 is superseded and the first of `ID-R4`'s two
preconditions is retired.**

**What decided it is not the argument the plan and the register made, and that is the part to carry.**
Both argued about the *shape* of the objection — *every clause of the against-case is about silence
rather than about stopping*. What carried it was asking **who produces an unparseable id**: a foreign
task and a worker's own `context.spawnTask()` child can **never** be ours and are the common case on
the blessed topology; a `detail.id` that stopped being what we dispatched **could** be ours and is
rare — and that is measured history, since `task.progress`'s detail changed shape at 0.3.0 with no
changelog. Stopping is right for the rare case and catastrophic for the common one, and the string
cannot discriminate — so *stop* is wrong in one direction, *ignore* in the other, and **only *report*
is wrong in neither.** **Tier 1's silence is untouched**: another run's settlement is reported by the
driver that owns it, an unparseable one by nobody, and that asymmetry is ADR 0027 rule 4.

**[W19](doc/work-items/w19-a-task-we-did-not-mint-on-a-real-scheduler.md) is DONE and P6's exit
artifact exists on real workers.** Ladder L6 is **19 row labels, 21 real runs, 373 assertions** in
Node and Deno, from 18 / 19 / 342. Row 19 is one `FyflowScheduler` carrying **five ids this library
did not mint** — one per refusal `parseTaskId` makes, from `nightly-cleanup` to `pc:ingest:x:0` —
all settling **before either run settles anything**, with two `Driver`s subscribed and **both runs
`completed`**, each having dispatched all four of its own task ids and reported all five settlements
through `onUnmintedTask` under **its own** run id. It owns `examples/**` and reached into no other
directory. **Restoring ADR 0023 rule 2 costs 13 L6 failures** and leaves each run having dispatched
1 of its 4 tasks, which is the number to quote: the scheduler never breaks; the drivers go deaf while
everything around them proceeds.

**W19 is where `doc/workflow.md` v0.7 change 3 finally fired, on the first item that could hit it.**
P5's retro added `doc/decisions/**` to the record step *"so a demonstration could correct the decision
it demonstrates"*, after that gap blocked W17 from correcting ADR 0015; W19's own declaration named
itself the likely next occurrence. **ADR 0027's producer table listed three producers of an
unparseable id and could not name the one W19 built** — its third row is *"a `detail` with **no**
`id`, or an `id` that is not a string"*, while `pc:ingest:x:0` is a four-segment string in our own
shape, which is the class the decision's argument actually turns on. **Producer row 4 added, no rule
changed, no exception declared or needed.**

**And its sharpest method finding is a category rule 8 does not have.** Its rule-written probes found
the one code-level survivor (L6 injected a **colon-free** id only, so tier 0 could be narrowed by the
shape of the id with all 370 green — W17's `all-exit` finding in a second file); its
`Outputs`-written probes found that *"counts derived rather than typed"* is **unachievable** in a
markdown file ([Q100](doc/open-questions.md), two more occurrences). **Neither half found either of
the adequacy reader's two BLOCKING survivors, and both of those were the same thing — the PROVENANCE
of a harness value**: a latched flag standing in for *"both drivers were attached"*, whose guard was
deletable with everything green, and an assertion whose **source** could be swapped from the
scheduler to a driver, which the item's own `Outputs` row forbids in prose and nothing enforced. That
is neither a clause of the rule nor a row of the table, and it is the third time in `examples/**`
after `finishedBy` and `lateInputs`. **For P6's retro.** Overlap **4 of 18**, the ninth measurement
and inside the band. Its questions: [Q107](doc/open-questions.md) — `ID-R5` at L6 sees
`task.completed` and nothing else, found by both readers independently — and
[Q108](doc/open-questions.md), ADR 0027's `context.spawnTask()` producer, demonstrated nowhere at all.

**Its three side-findings are each a document that was wrong and a check that could not see it.**
**[Q95](doc/open-questions.md) is closed with a stub, and the register was corrected a third time**:
`settleJoin` has **two** latches, the register's `DuplicateTaskId` belongs to the *satisfied* one
(already covered, deleting it costs an assertion), and W15's actual survivor is the *unsatisfiable*
one — deleting it costs **0 of 386** and produces either a doubled report or, worse, **a join routed
out of after being declared dead**, taking `RunState.outcome` from `stuck` to `completed` in silence.
**[Q101](doc/open-questions.md)**: `AGENTS.md`'s executed error-class snippet was a **closed list
compared against a copy of itself** — eight classes mapped to `.name` and matched against a literal in
the same snippet — so it omitted `InvalidTaskId`, exported from the package root the whole time, with
the gate green. It now enumerates the package's own `Error` subclasses. *A list the gate executes is
not a list the gate checks*, which is the third form of **rot is what the gate prevents, absorption is
what it cannot see**. And **[Q102](doc/open-questions.md)**: `check-docs.mjs`'s `RUN_FLOOR` ratchet
obliges the item that adds a snippet to raise it, sits in **nobody's `Owns`**, and went stale
silently — the probe written to catch a deleted snippet passed at 14 - 1 = 13. **W18 took two late
exceptions, not one**: that file, and `spec/join-policy.md`, whose section 4 stated **neither** of the
two things Q95's stub asserts about the `unsatisfiable` exit. The second is `doc/workflow.md` v0.7
change 3's own argument in a directory it does not cover, and its reason generalises: **which spec
clause a stub makes load-bearing is not knowable until the stub exists.**

**Thirty-one reader-passes have run and not one came back empty.** *(The predicate: one per reader
per work item, counted from each item's own Record — `doc/workflow.md` section 1 rule 5, never from
this line.)* W1 ×3, W3 ×3, W2 ×1, W4 ×2, W5 ×2, W6 ×2, W9 ×2, W12 ×2, W13 ×2, W14 ×2, **W15 ×2,
W16 ×2, W17 ×2, W18 ×2, W19 ×2**. *(Sum the list; it is 31, and the list is the predicate.)* *(This line read **twenty-one** and listed only the first ten items until
W18 re-derived it: it went stale the day P5 finished and stayed wrong for three items — the same
count-in-prose failure `doc/` keeps producing, in the paragraph that tells you to budget for the
pass.)* Most found the same shape: *the code was correct and the tests were pointed at the wrong
half.* **Budget for the pass; it is not a formality here, and section 6 asks for two readers.**
**That question is now settled and should not be re-litigated:** **ten** overlap measurements — 1, 2,
3, 3, 3, 3, 3, 4, 4, 4 shared findings. **The absolute count is what to carry**; the fraction has read 8%
to 17% across items from a one-line fix to the largest surface change here, and reading it invites
over-reading.

**W5 ran P1's case on a real scheduler and it behaves exactly as the matrix said.** `p1-routed-away`
completes under `live-token` and is **`stuck`** under `arrival-count`, with the join's successor
never dispatched. Three ADRs came out of it, and **each came from a different kind of gap**:

| | |
|---|---|
| [**0013**](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) | `fyflow-scheduler` is a **development** dependency and the published library depends on it **not at all** — `SchedulerLike` is structural and a caller passes its own scheduler in. **`S7` in `scripts/check-source.mjs` refuses any published file that imports it.** **Superseded in part 2026-08-31 by [ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)** — rule 1 stands, rules 3 and 5 do not. Node reaches 0.3.0 through **npm** → `dist/`; Deno through `examples/deno-import-map.json` → **`jsr:@fyflow/scheduler@0.3.0`** → the source; the browser not at all |
| [**0014**](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) | **The driver produces the fold's ordered input sequence** — `Driver.foldInputs()`, and `onFoldInput` for the push half. `snapshot()` is now *defined* as its record-kind subsequence. Before this, `FoldInput.pathEnded` had **no producer anywhere** |
| [**0015**](doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) | **A run whose join can no longer fire is `stuck`** — the sixth run outcome. Run state used to call such a run `completed` |

**Three things this repository believed turned out to be wrong, and each was one command away.** npm and
JSR **both carry the scheduler** — at 0.2.1 when W5 measured it, and **at 0.3.0 since 2026-08-31**,
which is what made [ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
possible; `@fyflow/scheduler` on JSR was an assumption nobody had checked. `../fyflow-scheduler/dist/`
**existed and was stale** — a pre-0.3.0 build behind a `package.json` reading `0.3.0`, which is a
directory layout that invites the assumption and asserts nothing. **That hazard is now gone with the
link**: a published tarball ships no source to be stale against, and `npm run check:scheduler` guards
the replacement hazard instead — Node's npm pin and Deno's JSR pin drifting apart.
And `AGENTS.md` §3's *"a worker must be JavaScript"* is **false at Node 24**, which is why ladder L6
runs in Deno as well as Node ([Q33](doc/open-questions.md), `RT-R10`) — the leaning that said *Node
only* rested on that claim. Both scheduler findings are [S9](doc/scheduler-upstream.md), **the only
live item in an upstream register that had nothing left to raise.**

**And one of our own register entries was wrong, which is the newest failure mode here.**
[Q43](doc/open-questions.md) said *"`regions` already records `{0: arrived, 1: exited}`, so the
information is present"*. It does not: **both policies produce that identical value**, which is
exactly what `RN-R6` guarantees. Found by trying to act on it. `doc/open-questions.md` is read before
every work item and **checked by nothing**.

**W5's two review passes — run as two readers, per W4's proposal — found ~35 things between them,
and every one is acted on.** Three are worth carrying:

1. **The L6 gate did not depend on the mechanism W5 exists to build.** Replacing its termination
   predicate with `setTimeout(1)` left every assertion passing, because `scheduler.shutdown()` drains
   the run while the fold keeps advancing. **This is W4's shape one level deeper:** the author's
   sweep found a hole, and the author's fix for it still could not fail.
2. **A `Driver` serving two runs merged them and reported `completed` for a hung run**, through its
   own declared surface. `ID-R3` refuses it; the surface still says otherwise, which is
   [Q53](doc/open-questions.md) — **now owned by P4's W13.**
3. **A mutation sweep run by its author measures what its author fears.** Mine: 19 mutations, 2
   survivors. The reader's, chosen by walking the rule ids rather than by intuition: **148 mutations
   and 38 survivors**, 10 of them blocking.

**Two readers, three overlaps, and each overlap arrived from a different direction.** W4 proposed
the split after 1 overlap in 13; this is the second occurrence in a different work item, which is
what `doc/workflow.md` section 6 rule 2 asks of a proposed rule. **For the retro.**

**Q4 is answered: [ADR 0003](doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
— a join is satisfied when its region has no live branches, having had at least one.** `live-token`
is the policy an application passes; `arrival-count` stays shipped, because the matrix is only
meaningful while both columns can be run.

**The result is bigger than the question, and this is the part to carry forward.** P1 predicted that
arrival-counting breaks on one exotic case — a decision routing a branch away from its join. W4's
matrix says it hangs on **six of nine rows**, and only one of them is that case: an ordinary
`optional` task failing is enough. Fixed-`N` is wrong whenever *"how many will arrive"* differs from
*"how many opened"*, and **every non-success outcome makes it differ.**

**[Q24](doc/open-questions.md) is answered by
[ADR 0025](doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md),
and the two rules got different answers.** `JP-R8`'s refinement is **adopted** — a third policy under
its own id, `live-token-requiring-arrival`, which is what `JP-R8` itself prescribes — so a flow can
now treat a join reached by nothing as a failure and the run folds to **`stuck`** rather than
`completed`, visible in `RunState.outcome` with no callback registered. `JP-R7`'s is **refused**: over
the nine matrix rows it is `live-token` weakened and never strengthened — every row on which they
differ, it reports `waiting` where `live-token` is `satisfied`, so its whole contribution is a silent
hang — and on the **third** row it repairs it fires a join **zero branches reached**
([Q91](doc/open-questions.md)). **`live-token` and `arrival-count` are byte-identical and `liveToken`
is still what an application passes** (ADR 0003 rule 1; whether that should change is
[Q96](doc/open-questions.md)). The refused variant stays a matrix column, because a refusal nothing
executes is a refusal nobody can falsify. **Not one of the 36 matrix cells changed.**

**W16 also fired `doc/workflow.md` rule 7 (c) for the first time in three plans.**
`scripts/check-policies.mjs` holds the new **`JP-R9`** — *a policy `id` exists in
`spec/join-policy.md` section 3 or it does not exist* — with **thirteen** checked-in probes — ten when W16's Record was written — and **three of
them failed at birth**: two were holes in the check and one was a probe that edited a heading the
parser does not read.

**And its provocation sweep reproduced W15's finding exactly, which makes it two occurrences.** 28
mutations: **every probe written to a rule went red, and four of the five aimed at what the item
CREATED survived** — section 3's third-row wording can be rewritten to demand two arrivals, and a
whole column can be deleted from ADR 0025's pasted table, with the gate green. The ADR's table was
therefore verified against `runCell` **once, mechanically**, all 36 cells.

## The fact that reframes the whole repo

> **`fyflow-scheduler` has no dependency graph.** No `dependsOn`, no `parents`, no ordering. Its own
> `AGENTS.md` section 1 lists them under *"Things that do NOT exist"*, along with `DagScheduler`.

Two consequences, and both catch people:

1. **`../fyflow-scheduler/FLOW_PLANNING.md` is written against an API that does not exist.** It
   calls the library "the existing FyFlow DAG scheduler" and passes `parents: ['extract']` to a
   constructor with no such field. Its *goals* are still ours; its premise is not. Do not use it as
   a design input without reading `doc/concept.md` section 2 first.
2. **`SpawnTaskConfig.parents` is declared and dead.** `../fyflow-scheduler/core/workerInterface.ts:50`
   declares it; nothing reads it; the spawn path (`core/FyflowScheduler.ts:1468-1473`) drops it
   silently. It typechecks and does nothing. **Confirmed by the maintainer (2026-08-30): it stays
   dead and will eventually be removed — never pass it.** [S1](doc/scheduler-upstream.md) is closed;
   do not re-raise it.

**So sequence, decision, fan-out and join are built here, not wrapped from below.**

## The invariant everything hangs off

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

Now backed by [ADR 0001](doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
rules 1 and 4, [ADR 0002](doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 4, and **[ADR 0014](doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md),
which is what finally made it executable**: the driver produces the ordered `FoldInput` sequence and
`fold(driver.foldInputs())` is the whole of turning a run into run state. Until W5 **nothing produced
that sequence**, so the invariant was true of hand-written fixtures and of nothing else. A decision
predicate that calls `addTask`, a fold that reads `scheduler.tasks`, or **a fold that subscribes to
the driver** has broken it — the last is the ergonomic next step ADR 0014 spends a paragraph
forbidding.
This is what makes routing testable with no scheduler (ladder L2), makes determinism a real check
rather than an aspiration, and keeps durable runs additive. `doc/concept.md` section 5.

Task completion **order** is genuinely non-deterministic. The fold must be deterministic *given an
ordered log*; the driver is what turns unordered reality into that ordered log. Never write a test
that depends on fan-out completion order.

## How work is done

**[doc/workflow.md](doc/workflow.md) — read it before starting any work item. It is v0.10, run to
completion by NINE plans.**

**v0.10 is P9's retro and its three changes are above.** The short form: **rule 8 gains a fifth
obligation — break the WIRING**, because a check, a grading or a guard can be present, correct and
never reached while everything is green; **rule 8 gains a requirement on the SET** — a provocation is
evidence only when it FIRES, and only when it fires FOR THE REASON IT NAMES, which is reading the
failure lines rather than the exit code; and **section 1 rule 5 gains a clause about WRITING** — a
claim states the scope it was MEASURED at. **Rule 8 now carries its own index**, having grown to five
obligations and three requirements on the set, and it stays a RULE rather than becoming a section
because its address is cited in four plans, eleven work items and the register.

**v0.9 is P7's retro, and its central finding is that rule 8's obligations are about WHAT is
asserted, WHERE THE VALUE CAME FROM, and — new — HOW MANY THINGS ARE ITERATED.** Four changes:

1. **Rule 8 gains a FOURTH obligation: break the LOOP BOUNDS.** Two occurrences, two items, four
   instances, **every one BLOCKING and every one found by an adequacy reader** — and none reachable
   by a probe of the first three kinds. A matrix row deletable for **0**; a whole column droppable
   **with the assertion count unmoved**; four L6 rows deletable for one edited number, green at 388
   with everything passing; a whole foreign-task list emptiable, taking P6's exit artifact with it.
   **W23 ran five bounds probes deliberately and all five were caught, and its reader found two
   more** — the author bounded the lists a **row** iterates, not the lists the **file** iterates.
2. **Rule 8 states the PROCEDURE for a provenance probe**: *it changes the source expression and
   nothing else.* [Q112](doc/open-questions.md) corrected v0.8's third obligation **four times across
   three items**, three of them an author repeating a correction a reader had made to them one item
   earlier. The axis was right and could not be instantiated from what it said.
3. **Section 1 rule 5's provenance clause extends from *an index* to ANY copy, including your own.**
   W23 reported a wrong count read from a file **that item had written**, for an earlier version of
   its own work.
4. **Section 7 rule 2: an item's `Owns` is written from its PLAN's index row, never from its title.**
   Late exceptions across P7: **five, four, two, zero**, with the cause stated in between.
   **`check-owns.mjs` stays retired** — a sentence did what a script was proposed for.

**Rule 7 (c) is unexercised for the fifth plan, and P7 declined TWO checks for the same reason:
`scripts/**` and `package.json` are in nobody's `Owns`** ([Q121](doc/open-questions.md),
[Q126](doc/open-questions.md)). That is v0.7 change 3's shape — a gap that blocks a fix — twice in one
plan, and it is **the next plan's scope rather than a workflow rule**.

**v0.8 is P6's retro, and its central finding is that rule 8's two obligations are both about WHAT is
asserted and neither is about WHERE THE VALUE COMES FROM.** Two changes, both to rule 8, neither
replacing anything:

1. **Break the PROVENANCE of every value an assertion reads** — substitute a different source, delete
   the guard that makes a recorded value the one it claims to be, let a later write overwrite it,
   delete one of two writers. **Section 5 rule 4 made provocable**: *"fixtures must not come from the
   code under test"* has had no procedure since v0.3, and **five instances across W14, W17 and W19
   were all BLOCKING and all found by adequacy readers**. All five are in `examples/**`, where values
   are reported rather than asserted, and the rule says so rather than overclaiming.
2. **Re-run the whole set AFTER acting on the readers' findings, and check their exact edits back in
   as probes.** An author's set is written once, before the readers report; the fixes that follow are
   the least-tested code the item ships. W18 found it — both its blocking survivors were in guards it
   had written earlier in the same item — and W19 ran it and it fired.

**Rule 7 (c) is unexercised for the fourth plan**, twice now because no check was worth building
rather than because none was possible. **`check-owns.mjs` stays retired** — seven consecutive correct
audits. **The two-reader split is settled at ten overlap measurements and closed to re-litigation.**

**v0.7 is P5's retro, and it is the first whose central finding is that a
change was RIGHT AND INCOMPLETE rather than right or wrong.** Five changes:

1. **Rule 8's set has TWO obligations — the rule's clauses AND the `Outputs` table's rows.** v0.6
   said *write to the rule*; measured over three items the readers found blocking gaps in all three,
   and the direction flipped on the third. W15 and W16 found a rule-written set blind to what the
   item **created**; **W17 found a deliverable-written set blind to a clause of the rule**, and only
   the clause-by-clause walk saw it. Neither half is redundant.
2. **Rule 8 defines *survivor*: a survivor is only a survivor once a second, independent route
   confirms the mutated clause was reachable.** Replaces W17's own weaker proposal (that rule 8 needs
   rule 7 (b)) — its adequacy reader's harness enforced 7 (b) and **all three of its vacuous probes
   passed**, reading as SURVIVED with the gate green.
3. **The record-step list gains `doc/decisions/**`** — the same one-word fix P4 made for the
   register, un-generalised. `Reserves:` names ADR ids too. **W17 is where it blocked a fix** rather
   than hiding an edit.
4. **A claim about another item's status is read from that item's own file, never from an index.**
   The one sub-case of *`doc/` is checked by nothing* that has occurred twice — and the second time
   it **reproduced**, into a fourth document.
5. **Section 6's isolated-copy rule says how to REMOVE the copy**: scan for links first. It was
   followed and cost a repository.

**Two things did NOT change**: `check-owns.mjs` stays retired (five items audited their `Owns` set
correctly; W16's failure was a stale *count*), and rule 7 (c) is **exercised** by W16 and unchanged.
**v0.6 was P4's retro and its three changes all replaced mechanisms that were *followed* and failed
anyway**: rule 8's provocations written to the **rule**; the **adequacy reader in an isolated copy**;
and the record-step list gaining **`doc/open-questions.md`**. **v0.5 is P3's retro and it changes one requirement of one rule**: a
negative-test probe declares the **set** of checks it must trip and the set must match exactly,
because naming one check does not discriminate — a merely *malformed* probe trips two at once, which
is W6's original defect surviving the requirement written for it. Measured over `check-docs`' twelve
probes, then provoked, which is **rule 8's first outing**. **Rule 8 itself is v0.4's and has the
strongest evidence of any rule in it:**
*when you act on a review finding, break the fix and watch the gate go red* — because W4, W5 and W9
each shipped a repair that could not fail, and **no rung of the ladder covers the repair.** The other
two v0.4 changes replace mechanisms that were *followed* and failed anyway: a new check's
provocations are now **checked in** rather than run once, and `Owns` is **checked** rather than
declared, after three consecutive items answered *"did you edit outside it"* with *"yes, and I did
not notice."* The short form:

```
concept -> plan -> work items -> verify (ladder, spec conformity, retro) -> record
```

- A **plan** (`doc/plans/`) answers one question and ends in something a human can look at.
- A **work item** (`doc/work-items/`) is the smallest thing with its own gate. It is **declared
  before it starts** — owns-files, tests, gate, reserved ids — using the template.
- **Verification is a ladder.** Climb from L0, stop at the first failure, and report which levels
  did not run. `workflow.md` section 4. **L2 (routing from a fixture outcome log) is where this
  repo's value is proved**, **L5 is the join/failure matrix** — the hard part — and **L6 is
  `examples/`**, the only rung that touches a real scheduler:

  ```bash
  npm run gate            # everything, both L6 runtimes included
  npm run test:l6         # ladder L6, node 24 - twenty-one real runs
  npm run test:l6:deno    # ladder L6, deno
  ```

  **L6 lives in `examples/**` and not in `test/**`, deliberately**: the browser bundle globs
  `test/**/*.test.ts`, so anything that imports a scheduler placed there would be bundled for a
  runtime L6 does not run in (`RT-R10`).
- Ids (`P`, `W`, `Q`, `ADR`, `S`) are reserved in blocks before fan-out, and are **never reused or
  renumbered**.

## Working rules

**`spec/` is the source of truth.** A spec change is its own change with its rationale stated, never
a side effect. If a spec looks wrong or unimplementable, **stop and report the specific conflict**
rather than patching it to make a test pass.

**Tests are part of the work item, never follow-up.** Expected values come from the spec, not from
output. A snapshot generated by running the implementation is not a test. Assertions must be able to
fail. Full rules: `workflow.md` section 5.

**"Tests pass", reported by whoever wrote the code, is a claim rather than evidence.** The
spec-conformity pass (`workflow.md` section 6) converts it into a statement about the code — run it
with a fresh context, spec first and code second, and it reports rather than fixes.

**A decision not in `spec/`, an ADR, or a plan did not happen.**

**A leaning is not a decision, and a leaning's *argument* is worth checking before its conclusion
is.** All four of `doc/concept.md` section 6's have now landed — two as ADRs, one as P1's spike, and
run-state-as-a-fold as Q14's answer — **and all four went to the leaning**, which section 6 now says
in place rather than leaving to a reader to notice. The live example is elsewhere: **[Q33](doc/open-questions.md)'s
leaning said *L6 in Node only*, on the stated ground that L6 *"needs a real worker file per
runtime"*, and that ground is false at Node 24.** W5 measured it in one command and the answer
flipped. Citing a leaning as settled is the most likely way to get this wrong; inheriting the
*reasoning* behind one without checking it is the second.

**A written claim nobody ran is this repository's most common defect, and `doc/open-questions.md` is
now one of its homes.** `spec/run-state.md` section 5 tabulates **four**: three were a spec asserting
what its own inputs could not supply, and the fourth is [Q43](doc/open-questions.md) — a register
entry, written by a reader, saying the data was already there when it was not. `spec/` has a
conformity pass; **the register has nothing.**

**A wish for `fyflow-scheduler` goes in [doc/scheduler-upstream.md](doc/scheduler-upstream.md), not
into a workaround comment.** Every item states what we do without it — an item with no workaround is
a blocker and belongs in a plan instead. **[S9](doc/scheduler-upstream.md) is the one live item**,
and it is ready to raise.

**`src/` and `index.ts` may never import `fyflow-scheduler`.** The published npm and JSR packages
depend on it **not at all** — `SchedulerLike` is a two-method structural interface and the caller
passes its own scheduler in. It is now a devDependency with the library on disk, so this is one
autocomplete away from being broken; `S7` in `scripts/check-source.mjs` is the refusal
([ADR 0013](doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rules 1-2).

**Writing documents:** dense and decided. Tables and numbered rules over narrative. Distinguish
decided from open — open items get a Q id in `doc/open-questions.md`, not an inline TODO. Reference
paths from the repo root in prose; only markdown links are relative.

## Facts about fyflow-scheduler that catch people out

Grounded in its `AGENTS.md` at **0.3.0**, which **ships inside the npm package**: read it at
`node_modules/fyflow-scheduler/AGENTS.md`, not next door. There is **no changelog**, so a version
bump means re-reading `AGENTS.md` §6 rather than reading a diff. Re-check there rather than trusting
this list if it matters.

- **No dependencies, no ordering** — see above. This is the big one.
- **Its published TypeScript source does not load under Node**, and its `AGENTS.md` §3 is wrong in
  the other direction about workers. `core/threadWrapper.ts:5` value-imports an `interface`, which
  Node's type stripping cannot erase — so importing its source throws under Node 24 and works under
  Deno. Meanwhile a **typed `.ts` worker runs fine** under Node 24, `inline` and threaded, contrary
  to §3's *"the file must be JavaScript"*. Both are [S9](doc/scheduler-upstream.md), and together
  they are why **Node reads npm's `dist/` while Deno reads JSR's source**
  ([ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)).
- **The version is written down twice, and that is the live hazard.** `package.json` pins the npm
  package and `examples/deno-import-map.json` pins the JSR one; ladder L6 runs in both. `npm run
  check:scheduler` **D3** is what stops L6 reporting two runtimes green against two different
  schedulers. *(It replaced a stale-`dist/` check, which a published tarball cannot fail.)*
- **An event's `detail` is the live object, not a snapshot.** `detail` **is** the `FyflowTask` for
  `task.running`/`completed`/`failed`/`user_action` — **including the `timestamp` field**, so a
  retained detail reports the *most recent* event's time, not the one you received. **Never retain
  `e.detail`** — copy declared fields synchronously in the listener. `{...e.detail}` is *not*
  compliance: it still aliases `payload`, `result` and `error`.
  [ADR 0007](doc/decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md);
  upstream declined to fix it in code and documented it instead
  ([S8](doc/scheduler-upstream.md), `AGENTS.md` §6). *Not* affected: `task.progress`,
  `scheduler.completed` and `resource.*`, all copies.
- **A `user_action` task fires TWO events, and the first is called `task.failed`.** For a
  non-optional task out of retries the scheduler sets `state = 'user_action'` and then dispatches
  `task.failed` *and* `task.user_action` with the same object — at 0.3.0 in **two** places,
  `core/FyflowScheduler.ts:896-910` and `1128-1142` (the orphaned-task path). Key outcomes on
  **terminal state, not event name**, or you double-count and route a human-intervention case down
  an error edge. An *optional* task takes the other branch: `state = 'failed'`, `resolve(null)`, and
  only `task.failed` fires. **`AGENTS.md` still does not document this for the ordinary path** — it
  says *"`task.failed` fires once per failed task"*, and only the `orphaned` row records the
  pairing. Trust ADR 0007 rule 2 over that sentence.
- **`task.progress`'s detail changed shape in 0.3.0.** It is now the task **spread flat** — the id
  is `id`, *not* `taskId` — and the wrapper's `workerType` (`'inline'`/`'thread'`) overwrites the
  task's own pool key. A 0.2.1 consumer reading `detail.taskId` silently gets `undefined`.
- Task states are `pending -> running -> done | failed`, **plus `user_action`** for a non-optional
  task out of retries. Five states, not four, and it is the one every design drops (Q17).
- **Reusing a task id overwrites, silently.** Our id scheme is a correctness rule with a refusal
  test, not a convention (Q13).
- **A queued task cannot be cancelled.** Not implemented — so "cancel a run" is partial by
  construction (Q18, [S2](doc/scheduler-upstream.md)).
- `scheduler.completed` fires **every time the scheduler drains** — with a flow it will fire between
  steps routinely. It is not "the run finished".
- `onCompleteDescendants()` is **not a join**: transitive over lineage, but a failing descendant does
  not reject.
- `maxCompletedTasks` evicts terminal tasks from `scheduler.tasks` with no event to say so.
- Resource groups are **optimistic** — a limit can be briefly exceeded. Nothing is a hard cap.
- `addTask` returns `undefined` without `{ createPromise: true }`, and a scheduler that is never
  shut down keeps the process alive.

`AGENTS.md` inside the installed package is the single-file API reference and every snippet in it is
executed by that project's own test suite. **Nothing here reaches a checkout next door**, and
`check-scheduler.mjs` D1-D3 refuse the three ways that could come back — a `file:` dependency, a path
in the import map, and a symlink in `node_modules`. The last one is not hypothetical: it is how a
`git worktree remove --force` deleted most of the sibling repository on 2026-08-31
([ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)).

## Sibling repositories

`../fyflow-react-components` visualizes a scheduler. **Three of its open questions are the same as
three of ours** — `user_action` (their Q16 / our Q17), unbounded retention (their Q14 / our Q19),
one-collector-one-scheduler (their Q15 / our Q20) — and **two upstream wants are shared** (their
S1/S2 are our S5/S4). Answering a shared question differently in two repos is a bug with two homes.

**Cite another repo's ids with its name attached.** Two Q sequences, same questions.

## Environment

Windows 11. PowerShell 5.1 is the primary shell — `&&` and `||` are parser errors there, use `;` or
`if ($?)`. A Bash tool with POSIX syntax is also available and is usually the easier one.

**Node 24 is required and is not on the PATH by default** — `.node-version` pins it and **fnm** is
what selects it. In a non-login shell, activate it before running anything:

```bash
eval "$(fnm env --shell bash)" && fnm use 24
```

Node 16 is what a bare `node` resolves to here, and it fails at `??=`-era syntax long before it
reaches a test.

**`npm install` is just `npm install`.** The scheduler is a pinned registry devDependency
(`fyflow-scheduler@0.3.0` from npm; Deno reaches `jsr:@fyflow/scheduler@0.3.0`), so nothing needs to
be checked out beside this repository and **this repo writes nothing outside itself** —
[ADR 0029](doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md),
which supersedes ADR 0013 rules 3 and 5.

**Never put a link into `node_modules`.** Not a `file:` dependency, not `npm link`, not a junction —
`check-scheduler.mjs` D1 refuses one and this is why: on 2026-08-31 a junction placed there so `tsc`
would ignore the sibling's source was **followed by `git worktree remove --force`**, which deleted
through the real repository — `.git/`, `core/`, `index.ts`, `dist/` — until it hit a lock. It was
recoverable only because 0.3.0 had been pushed publicly. Every recursive tool that touches
`node_modules` is one link away from another repository.

**Do not rewrite files with `Get-Content | Set-Content`** — PS 5.1 reads UTF-8 without a BOM as
CP1252 and silently double-encodes every non-ASCII character. Use the Edit or Write tool.

## Git

Local identity is `tsukeero <tsukee.kage@gmail.com>`. **Commit only when asked, and push only when
asked separately** — the two are different questions and an approval to commit is not an approval to
publish. Commit subjects are scoped: `doc:`, `spec:`, `adr:`, `feat:`, `fix:`, `chore:`.

**There IS a remote and it is public.** `origin` is
`https://github.com/fyflow/fyflow-orchestration.git`, `main` tracks `origin/main`, and history has
been pushed to it since **2026-09-01**. *(This paragraph read "There is no remote yet" until that
day, while five commits sat unpushed against a remote that had been registered for some time — a
`doc/` claim in the front-door document, wrong in the direction that matters: an agent reading it
believes nothing it writes can leave the machine.)*

**A pushed commit is public and is not revisable in the way a local one is.** Four of the five
commits published on 2026-09-01 predated that session, and one of them — `75b3033` — edits a
decision's prose. **Prefer a new commit to amending or rebasing anything at or below
`origin/main`**, which is `doc/workflow.md` section 3's *"a commit message cannot be rewritten"*
applied one level out: ids leak into commit messages, and now those messages leak off the machine.
