# W70 — A flow that DECIDES on the runtime, and a custom group TYPE, both executed and the first in the README

**Status:** DONE — declared 2026-09-17 on the tree W69 ships, built and gated the same day; **both
reader passes RUN 2026-09-17** (10 / 3 blocking and 15 mutations / 11 survivors, overlap 0, the
forty-second measurement), their findings acted on, and **rule 8 re-run with their six exact edits
checked in as probes** — 33 probes, 0 undeclared survivors, 0 against declaration on the final
pass, after one FIRED AGAINST DECLARATION against a fix a reader had prescribed (Record).
**Plan:** none — the second consumer-facing gap in the reference, raised by the maintainer on
2026-09-17 after reading W69: *"a separate snippet demonstrating how to add custom groups, and a
flow with other (non-task) nodes."* W36/W37/W69's precedent; P19 starts at W71.

```
Spec:       none — no rule. What it asserts is already asserted of every executed
            snippet (check-docs X4) and of every README fence (X8, generalised here).
Owns:       examples/getting-started/** (with W69), AGENTS.md §5's tail and §12's
            second block, README.md's second snippet
Inputs:     W69's shape (the snippet as a single source of bytes in two documents);
            the measurement at this item's declaration that the reference shows a
            custom group TYPE nowhere (`groupTypes`: 0 occurrences) and runs every
            decision, fan-out and join snippet on the FAKE scheduler — the `decision`
            kind is in NO executed snippet at all; ADR 0055's six members;
            `JP-R12`'s record keyed by branchPath; the maintainer's two answers:
            README carries TWO snippets (getting-started + the routing flow) and the
            routing flow is decision + fan-out + join, `map` staying where it is
Outputs:    (1) examples/getting-started/tag.ts — a worker that tags its input with
                the node's `settings.label`, so WHICH nodes ran is legible from what
                the last node returned
            (2) AGENTS.md §5 gains "The same on the runtime": one flow with a decision
                routing low confidence away, a fan-out into two typed branches, a
                join, and a publish node receiving JP-R12's record — TWO runs on one
                runtime at confidence 0.9 and 0.2, the discriminating pair, asserted
                from the fold's node ids and from the last node's result
            (3) AGENTS.md §12 gains "A custom group type is a factory": a class with
                ADR 0055's six members and a counter, registered in `code.groupTypes`,
                named by a type, two tasks acquiring it — `onStart` twice and `onFinish`
                twice asserted off `runtime.groups`
            (4) README.md gains "A flow that decides" carrying (2)'s snippet byte for
                byte; the custom-group snippet is §12's only, and README links to it
            (5) check-docs X8 GENERALISED: every ```ts fence in README.md, located by a
                DECLARED heading list (both ways — a listed heading with no fence, a
                fence under no listed heading), is byte-equal to some `run` fence in
                AGENTS.md; RUN_FLOOR 24 -> 26; a fourth probe (the second README fence,
                README direction); MIN_PROBES 26
Depends on: W69 (uncommitted — this item is built on its tree)
Blocks:     nothing
Tests:      expected values from the documents: the predicate's threshold and the two
            payloads decide which of five task nodes run; JP-R12 fixes the join
            record's keys as `0` and `1` in that order; the tag worker's output is a
            pure function of its input and settings, so the last node's result is
            derivable on paper. The group's counter is 2 and 2 because the flow has two
            tasks of the type. X8's expected value is byte equality
Gate:       L0; check:docs (X3/X4 on two new snippets, X8 over two README fences);
            check:docs:selftest; check:markdown; L6 UNMOVED at 1610 / 53; rule 8 over
            the pair (0.9 against 0.2 — make them equal), the join record's two keys,
            the group's two counts, X8's heading list both ways, RUN_FLOOR both ways;
            then the two reader passes and rule 8's re-run
Reserves:   Q294-Q296
```

## Scope

**In**: the two snippets the maintainer asked for, executed; README's second; X8 over N fences.

**Out**: `map` on the runtime (§5/§13 already carry it on the fake, and `triage` runs it at L6);
a custom node-type CLASS (`triage`); README's third snippet (refused at the declaration — the
front door carries two and links).

## Exceptions

| path | why |
|---|---|
| `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | predicted: X8's generalisation, the floors, one probe, the META anchor moved (rule 7 (b)) |
| `examples/README.md` | predicted: W69's paragraph says *the one file*; there are two now |
| `scripts/check-markdown.mjs`, the spec split, `tsconfig.docs.json` | predicted NOT to fire, on W69's measurements (466-link margin; literals, not JSON imports; no flow under `examples/flows/`) |

## The declaration step

| fact | measured |
|---|---|
| custom group types in the reference | `groupTypes` occurs **0** times in `AGENTS.md`; the factory shape lives only in `examples/run-flow.ts` |
| non-task nodes on a runtime | of 24 executed snippets, 3 touch a runtime and all 3 are linear chains; no executed snippet routes on a DECISION EDGE at all; §4's and §5's run on the fake. *(This fact said `kind: 'decision'`, which is a thing the grammar refuses BY NAME — `spec/flow-definition.md` §2, and `FD-V24`'s own stated case. A decision is a property of an EDGE, which is what this item built; the measured absence was real and the words for it were wrong. Conformity reader.)* |
| what a join successor receives | `JP-R12`: an object keyed by `branchPath`, ascending segment-wise, one entry per arrived branch |
| the group contract | ADR 0055: `canRun`, `onStart`, `onFinish`, `getMetrics`, `id`, `type`; `GroupType.create` returns `ResourceGroup`, which `extends EventTarget` in the type, so the class extends it to typecheck though the runtime does not require it |
| where §5 and §12 end | §5's `---` before `## 6.` at line 770; §12's first fence closes at 1441 |

## Verification

As W69's, over two snippets: `npm run check:docs`, its self-test, `check:markdown`, L6 both runtimes,
`dev-dist/w70/rule8.mjs`, the readers. *Routing cases: a branch routed away from its join (Q4) —
**NOT covered**, and this row claimed it was: in the low run the decision routes away BEFORE the
fan-out, so no region is ever opened and there is no join for a branch to be routed away from — Q4's
case is a branch of an OPEN region leaving its join with an arrival that never comes (adequacy
reader; section 5 rule 6 treats these as addresses, and this one pointed at nothing); no matching decision edge (Q10) — not
covered, the default edge always matches; `user_action` (Q17), duplicate id (Q13), nested fan-out
(Q6) — `triage` and the corpus.*

## Record

**Built and gated 2026-09-17 on the tree W69 ships. Both reader passes NOT RUN — IN REVIEW, as W69.**
Every rung RUN and redirected to `dev-dist/w70/`, read by `$?`; rule 8's harness is W69's verbatim,
the Node-24 environment asserted. Expected values from the documents: which of five task nodes run
is decided by the predicate's threshold and the two payloads; the join record's keys are `JP-R12`'s
`0` and `1`; the tag worker's output is a pure function of input and settings; the group's counts
are the flow's two tasks.

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured | the reference showed a custom group TYPE nowhere and ran every decision, fan-out and join on the FAKE scheduler — NO executed snippet routed on a decision edge at all — which is the gap this item closes (this row said *the `decision` kind*, a kind the grammar refuses by name; see the declaration table) |
| L0 | **GREEN, first run** | `lint` 0, `typecheck` 0 (`tag.ts` under `strict`) |
| check:docs | **GREEN, first run** | **32 snippets, 26 run** (from 30 / 24): both new snippets EXECUTE — the routing pair takes two roads and `publish` receives `JP-R12`'s record with both branches' roads in it; the group counts 2 starts and 2 finishes off the object the runtime built — and **`X8` compared 2 README fences to all 26 `run` bodies**, both ways by the heading list; `RUN_FLOOR` 24 -> 26 |
| check:docs:selftest | **26 / 26 probes caught, 13 / 13 noticed, exit 0, first run** | W69's ten moved sets still hold; the fourth X8 probe (README's SECOND fence) caught; the heading-gone probe now trips X8 twice under one id — the both-ways clause read in one probe; the META entry re-anchored to the generalised clause and noticed |
| check:markdown | GREEN | **126 / 5453 / 272** *(this row said **5445** — a link count taken before the Record's own six paragraphs were written and not re-taken on the tree the item ships, which the `npm run gate` row four rows below reads as 5453. Section 1 rule 5's WHEN clause, and the contradiction was visible without leaving this table; corrected at the conformity reader's finding 4)*; fixtures on a scratch copy: 95 against `M3`'s 107, 3996 against `M4`'s 4450 — *predicted NOT to fire*, did not |
| L6 | **GREEN and UNMOVED at 1610 / 53 in node AND deno** | as declared |
| rule 8 | **27 probes: 1 control green, 21 caught, 3 declared ceilings each RUN against its rung, 2 measured, 0 undeclared, 0 crashes, 0 aborts, 0 against declaration** — after a first pass of 2 aborts and **1 CAUGHT AGAINST DECLARATION** (`rule8-run-1.log`, `rule8-run-2.log`), digest identical throughout | **The against-declaration is the finding.** `d2` declared *the §12 group fence re-tagged `check` with the floor lowered survives, because README does not carry it* — and it was caught, by **`X2`** (*a `check` snippet containing `throw`*), which sees a re-tag whatever the floor says. So a RE-TAG never measured the Q102 shape — **not here, and not in W69, whose `d2` and `b2` were the same re-tag and were caught by `X2` with `X8` co-firing**; W69's Record said *caught by `X8`* and is corrected in place. The Q102 shape is a fence DELETED WHOLE with the floor lowered, invisible to `X2`: rewritten, **`d2` (the group fence, not in README) SURVIVES — Q102 verbatim, the limit of `X8`** — and **`d3` (the routing fence README carries) is caught by `X8` ALONE**. Two aborts were rule 7 (b) on `confidence < 0.5;`, also §4's predicate; re-anchored on the full line. Measured: `a9`, `onStart` no longer counting — caught, the two counts are observed separately; `c1c`, the counts re-sourced to literals AND the type no longer naming the group — green, the literal removed the only observer (`c1`'s reason, as W69's) |
| census | **231 / 177 / 2 / 52** unchanged | this item raises no question; Q294-Q296 reserved and unused — **and Q294-Q295 were reserved TWICE**, by [W69](w69-a-getting-started-example-a-consumer-can-copy.md) as well, which is the collision section 3's reservation mechanism exists to prevent. Neither item used either id, so no register row collides; **the block is W70's** and W69's file now narrows to Q293, the one it spent. Found by W69's conformity reader, reading two declarations that were each internally consistent — so the next plan starts at **W71, Q297**, which falsifies the *W70, Q294* sentence W69 wrote into four files yesterday — corrected here, same shape, second day running |
| own id | measured | `W70` outside `doc/` and `dev-dist/`: its own annotations in `AGENTS.md`, `README.md`, `examples/README.md`, `examples/getting-started/tag.ts`, `scripts/check-docs.mjs`, the self-test and **`CLAUDE.md`**, whose two record-step annotations this row left out until the conformity reader re-took the grep. The procedure fired; the number beside it was written from memory |
| rule 8, RE-RUN with the readers' edits | **33 probes: 25 caught, 6 declared ceilings, 0 UNDECLARED survivors, 0 crashes, 0 aborts standing, 2 measured** — after a first pass of 4 aborts and **1 CAUGHT AGAINST DECLARATION** (`dev-dist/w71/rule8-w70.log`, `rule8-w70-reanchored.log`); digest `e75d752941f01b86` over 331 files identical throughout | **The against-declaration is a defect in the FIX, which is what the re-run exists to find.** `c1` declares *the group counts re-sourced to a literal SURVIVES* — and the fix for the adequacy reader's S7 and S8 added `getMetrics()`, `id` and `type` to the assertions, so the probe's two-field fake died on a TypeError and `X4` reported *the snippet does not run*. **A crash is not a detection**, closed twice before in this repository and reproduced here inside a reader's own fix. The fake is COMPLETE now — five members and a method stub where two integers sufficed — and the ceiling holds, which is the honest form of it: what it measures is what a literal costs a reader to write, not whether one can be written. Four aborts, all rule 7 (b) on this pass's own edits: two on the routing predicate, which the conformity reader's finding 9 rewrote to carry §4's type guard and which is now BYTE-IDENTICAL to §4's, so the one-line anchor matches twice — re-anchored on the comment the two copies do not share — and two on the list `X8` now declares as PAIRS rather than headings. Of the readers' six probes `r1`-`r6`: **`r1` and `r4` CAUGHT** (the group naming itself something other than its key; a `getMetrics` that lies, where that member had no observer of any kind), **`r6` CAUGHT** by `X8` alone (the two README bodies swapped — the OVERLAP finding), and **`r2`, `r3` and `r5` are DECLARED CEILINGS** with their measurements |
| readers | **BOTH RAN 2026-09-17 — 10 / 3 blocking and 15 mutations / 11 survivors / 8 blocking, OVERLAP 0, the FORTY-SECOND measurement** (derived by counting section 6's list, not inherited) | **The conformity reader's central obligation came back EMPTY.** It derived, on paper and before reading a single assertion, which of five task nodes each payload dispatches, `JP-R12`'s key order, the `want` string character for character, and the group's two counts from admission and settlement — zero disagreements. Everything it found is a sentence: the group comment saying once per TASK where section 13 says once per ADMISSION, §5's new preamble claiming everything above it runs on a fake scheduler when §2 above it does not, the README's stale `check:markdown` cell, this Record contradicting itself on the link count, the `decision` KIND the grammar refuses by name, `worker.ts`'s header short by a caller inside this item's own `Owns`, the own-id row short by a file, the ungrounded *every non-task node kind*, and the predicate dropping the guard §4's carries. All corrected in place. The adequacy reader's eight are `X8`'s five (in [W69](w69-a-getting-started-example-a-consumer-can-copy.md)'s own Record, which is where that clause lives), the group snippet's two, and the Q4 address above. **Overlap ZERO, and the band is 0-4**: their only near-subjects were the group snippet and §5's snippet, reached for different properties |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL at any indent, 29 chain entries, `selftests` 7/7 completed and 7 ok** (`dev-dist/w70/gate.log`; L1-L5 41 / 1112 in node, deno and chromium, L6 1610 / 53, `check:docs` 32 / 26, `check:markdown` 126 / 5453 / 272) — on the SECOND start over the final tree: the first was STOPPED before it reported, because the index script it was chained behind had aborted on an ambiguous anchor and written nothing, so that gate would have been about a tree that did not ship (section 6's hold-still rule, read from the other end) | digest **`d85a335ba3d1e89a` over 331 files identical before and after** — this row the ONE edit after it |
| `npm run gate`, CONFIRMING (after the readers) | **GATE EXIT=0, zero lines beginning FAIL at any indent, 29 chain entries, `selftests` 7/7 completed and 7 ok in 787.0 s wall over 5 lanes** (`dev-dist/w71/gate.log`): `check:docs` **32 / 26** with `X8` comparing 2 README snippets to the AGENTS.md snippets their sections NAME, `check:docs:selftest` **33 probes / 20 gradings, all caught and all noticed**, `check:markdown` **126 / 5457 / 272**, L1-L5 **41 / 1112**, L6 **1610 assertions over 53 real runs in BOTH runtimes**, `check:source:selftest` 44/44, `check:spec:selftest` 31/31, `check:wiring:selftest` 34/34 | digest **`43341066a6dd893d` over 331 files identical before and after**, the tree held still throughout — this row is the ONE edit made after it |

**Outputs.** (1) `examples/getting-started/tag.ts` — `b1`, `a4`. (2) §5's *The same on the RUNTIME* — `a1`-`a5`, `p1`, `p2`, `b3`, `d3`. (3) §12's *A custom group type is a FACTORY* — `a6`-`a9`, `b6`. (4) README's *A flow that decides* — `b2`, `b4`. (5) `X8` generalised with `README_SNIPPET_HEADINGS` both ways, `RUN_FLOOR` 26, the fourth probe, the META anchor — `b5`, `e1`, `e2`, `d3`. `examples/README.md`'s paragraph now names two workers and three sections.

**What broke.** (1) `d2` caught against declaration by `X2` — a re-tag is not a deletion, in this item and in W69's Record, corrected. (2) `confidence < 0.5;` occurs twice in `AGENTS.md` — §4's predicate — rule 7 (b) on two probes, re-anchored. (3) W69's *the next plan starts at W70, Q294* is false one day later, because this item took W70 and its reserved questions are unused — the same expiry-dated claim, corrected by the same grep.

**What this taught.** **`X2` catches a re-tag and nothing catches a deletion but the floor and `X8`** — which is why the Q102 measurement must delete, and why `X8`'s reach is exactly the README's headings and no further: the group snippet, §12's alone by choice, has the floor as its only observer of existence, stated in `d2`. **A decision edge, a fan-out and a join now run on a real runtime in the reference**, with the road legible from the values rather than from a diagram — *(this said **every non-task node kind**, which `map` falsifies: this item's own Scope declares it Out, and `map` reaches a real runtime NOWHERE in the reference. The hedge *a consumer meets first* was doing the work and was measured against nothing. Conformity reader)* — and `JP-R12`'s branch-to-KEY MAPPING is asserted by a string a swapped branch list breaks (`a3`) — *the ORDER is not*, and the snippet's comment said it was. Reversing `collectArrivals`'s sort in the driver leaves `check:docs` at exit 0, because at depth 1 the keys are `"0"` and `"1"` and the LANGUAGE orders integer-like keys ascending whatever the driver did — this repository's own docblock four lines above that sort says so, *invisible at depth 1 and live at depth 2*. The reader confirmed the site is reachable with a control (narrowing the collection to one branch costs exit 1 naming the line), so this is a scope correction and not a dead clause. Narrowed in both copies of the snippet rather than closed: closing it needs a NESTED region, which is what makes the keys dotted, and that is a different snippet.

## What the readers changed — the group snippet gains two observers, and keeps one CEILING

**`X8`'s rebuild is in [W69](w69-a-getting-started-example-a-consumer-can-copy.md)'s Record**, which
is where that clause lives; this item's own two are the group snippet's.

**CLOSED: the group's own identity had no observer.** The assertion read `runtime.groups['budget']`,
which is the KEY the document filed it under and says nothing about the object, so the factory could
ignore the key it is handed and name the group anything. That is [W59](w59-what-a-node-type-is.md)'s
adequacy finding verbatim — *no fixture whose map key differed from the group's own name* —
reproduced inside the snippet written to demonstrate the six members `id` is one of. The snippet now
asserts `budget.id` and `budget.type`, and the reader's exact edit is **measured caught**: with
`create: (config, _key) => new CountingGroup('not-budget', …)` the snippet throws and `X4` names the
line.

**CLOSED: `getMetrics` had no observer of any kind.** It is one of ADR 0055's six and the snippet
never called it; a group returning nonsense metrics was green. It now asserts `running` back at zero
and `available` back at the limit, and **a `getMetrics` that lies is measured caught**.

**NOT CLOSED, and declared: `onFinish`'s COUNTER cannot be shown to be `onFinish`'s.** The reader's
sharp edit — `onStart` incrementing BOTH counters while `onFinish` only releases the slot — is
**still green**, and so is the narrow provenance edit that re-sources `finished` to `started`. **And
the reader's own prescribed fix does not fire on it**: `getMetrics().running === 0` was the
prescription, and it is satisfied, because both edits leave `active` correct. Measured here, after
the fix, rather than assumed from it — v0.8's *the re-run finds the defect in the FIX rather than in
the product*, on a fix a reader wrote.

*The reason is structural and is why this is a ceiling rather than a hole: the group object is the
only witness to its own methods being called. Every observer available inside one snippet — the
counters, the metrics, the identity, even an event the class could dispatch — is written by the class
under test, so a mutation that MOVES a write between two methods the scheduler calls is invisible to
all of them. The independent observer would have to be the scheduler's own view of the acquisition,
which the runtime does not expose and ADR 0055 does not require. What IS closed is the direction that
matters to a consumer: a group that never releases (`onFinish` doing nothing) is caught twice over,
and that is the hazard ADR 0055 exists for.*

**Questions raised.** None; Q294-Q296 reserved and unused.
