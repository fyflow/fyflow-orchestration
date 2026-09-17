# W70 — A flow that DECIDES on the runtime, and a custom group TYPE, both executed and the first in the README

**Status:** IN REVIEW — declared 2026-09-17 on the tree W69 ships (uncommitted, its gate green), built
and gated the same day; **both reader passes NOT RUN**, as W69's are (Record).
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
| non-task nodes on a runtime | of 24 executed snippets, 3 touch a runtime and all 3 are linear chains; `kind: 'decision'` is in **no** executed snippet; §4's and §5's run on the fake |
| what a join successor receives | `JP-R12`: an object keyed by `branchPath`, ascending segment-wise, one entry per arrived branch |
| the group contract | ADR 0055: `canRun`, `onStart`, `onFinish`, `getMetrics`, `id`, `type`; `GroupType.create` returns `ResourceGroup`, which `extends EventTarget` in the type, so the class extends it to typecheck though the runtime does not require it |
| where §5 and §12 end | §5's `---` before `## 6.` at line 770; §12's first fence closes at 1441 |

## Verification

As W69's, over two snippets: `npm run check:docs`, its self-test, `check:markdown`, L6 both runtimes,
`dev-dist/w70/rule8.mjs`, the readers. *Routing cases: a branch routed away from its join (Q4) —
**covered, on real workers, as the pair's second run**; no matching decision edge (Q10) — not
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
| declaration | measured | the reference showed a custom group TYPE nowhere and ran every decision, fan-out and join on the FAKE scheduler — the `decision` kind in NO executed snippet — which is the gap this item closes |
| L0 | **GREEN, first run** | `lint` 0, `typecheck` 0 (`tag.ts` under `strict`) |
| check:docs | **GREEN, first run** | **32 snippets, 26 run** (from 30 / 24): both new snippets EXECUTE — the routing pair takes two roads and `publish` receives `JP-R12`'s record with both branches' roads in it; the group counts 2 starts and 2 finishes off the object the runtime built — and **`X8` compared 2 README fences to all 26 `run` bodies**, both ways by the heading list; `RUN_FLOOR` 24 -> 26 |
| check:docs:selftest | **26 / 26 probes caught, 13 / 13 noticed, exit 0, first run** | W69's ten moved sets still hold; the fourth X8 probe (README's SECOND fence) caught; the heading-gone probe now trips X8 twice under one id — the both-ways clause read in one probe; the META entry re-anchored to the generalised clause and noticed |
| check:markdown | GREEN | **126 / 5445 / 272**; fixtures on a scratch copy: 95 against `M3`'s 107, 3996 against `M4`'s 4450 — *predicted NOT to fire*, did not |
| L6 | **GREEN and UNMOVED at 1610 / 53 in node AND deno** | as declared |
| rule 8 | **27 probes: 1 control green, 21 caught, 3 declared ceilings each RUN against its rung, 2 measured, 0 undeclared, 0 crashes, 0 aborts, 0 against declaration** — after a first pass of 2 aborts and **1 CAUGHT AGAINST DECLARATION** (`rule8-run-1.log`, `rule8-run-2.log`), digest identical throughout | **The against-declaration is the finding.** `d2` declared *the §12 group fence re-tagged `check` with the floor lowered survives, because README does not carry it* — and it was caught, by **`X2`** (*a `check` snippet containing `throw`*), which sees a re-tag whatever the floor says. So a RE-TAG never measured the Q102 shape — **not here, and not in W69, whose `d2` and `b2` were the same re-tag and were caught by `X2` with `X8` co-firing**; W69's Record said *caught by `X8`* and is corrected in place. The Q102 shape is a fence DELETED WHOLE with the floor lowered, invisible to `X2`: rewritten, **`d2` (the group fence, not in README) SURVIVES — Q102 verbatim, the limit of `X8`** — and **`d3` (the routing fence README carries) is caught by `X8` ALONE**. Two aborts were rule 7 (b) on `confidence < 0.5;`, also §4's predicate; re-anchored on the full line. Measured: `a9`, `onStart` no longer counting — caught, the two counts are observed separately; `c1c`, the counts re-sourced to literals AND the type no longer naming the group — green, the literal removed the only observer (`c1`'s reason, as W69's) |
| census | **231 / 177 / 2 / 52** unchanged | this item raises no question; Q294-Q296 reserved and unused, so the next plan starts at **W71, Q297**, which falsifies the *W70, Q294* sentence W69 wrote into four files yesterday — corrected here, same shape, second day running |
| own id | measured | `W70` outside `doc/` and `dev-dist/`: its own annotations in `AGENTS.md`, `README.md`, `examples/README.md`, `examples/getting-started/tag.ts`, `scripts/check-docs.mjs` and the self-test |
| readers | **NOT RUN** | conformity: derive the two roads, the record's string and the two counts on paper from the documents; adequacy: X8's heading list both ways, the pair, the record's key order, in an isolated copy — then rule 8 re-run with their edits |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL at any indent, 29 chain entries, `selftests` 7/7 completed and 7 ok** (`dev-dist/w70/gate.log`; L1-L5 41 / 1112 in node, deno and chromium, L6 1610 / 53, `check:docs` 32 / 26, `check:markdown` 126 / 5453 / 272) — on the SECOND start over the final tree: the first was STOPPED before it reported, because the index script it was chained behind had aborted on an ambiguous anchor and written nothing, so that gate would have been about a tree that did not ship (section 6's hold-still rule, read from the other end) | digest **`d85a335ba3d1e89a` over 331 files identical before and after** — this row the ONE edit after it |

**Outputs.** (1) `examples/getting-started/tag.ts` — `b1`, `a4`. (2) §5's *The same on the RUNTIME* — `a1`-`a5`, `p1`, `p2`, `b3`, `d3`. (3) §12's *A custom group type is a FACTORY* — `a6`-`a9`, `b6`. (4) README's *A flow that decides* — `b2`, `b4`. (5) `X8` generalised with `README_SNIPPET_HEADINGS` both ways, `RUN_FLOOR` 26, the fourth probe, the META anchor — `b5`, `e1`, `e2`, `d3`. `examples/README.md`'s paragraph now names two workers and three sections.

**What broke.** (1) `d2` caught against declaration by `X2` — a re-tag is not a deletion, in this item and in W69's Record, corrected. (2) `confidence < 0.5;` occurs twice in `AGENTS.md` — §4's predicate — rule 7 (b) on two probes, re-anchored. (3) W69's *the next plan starts at W70, Q294* is false one day later, because this item took W70 and its reserved questions are unused — the same expiry-dated claim, corrected by the same grep.

**What this taught.** **`X2` catches a re-tag and nothing catches a deletion but the floor and `X8`** — which is why the Q102 measurement must delete, and why `X8`'s reach is exactly the README's headings and no further: the group snippet, §12's alone by choice, has the floor as its only observer of existence, stated in `d2`. **Every non-task node kind a consumer meets first now runs on a real runtime in the reference**, with the road legible from the values rather than from a diagram — and `JP-R12`'s key order is asserted by a string a swapped branch list breaks (`a3`).

**Questions raised.** None; Q294-Q296 reserved and unused.
