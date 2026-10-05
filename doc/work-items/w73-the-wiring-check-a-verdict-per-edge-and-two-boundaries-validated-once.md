# W73 — The wiring check: a verdict per edge, and two boundaries validated ONCE

**Status:** **DONE** 2026-09-18 — built, gated, both reader passes run the same day, rule 8 re-run
with their exact edits as probes, the confirming gate green with the tree held still (the Record).
Declared the same morning on `5525f2c`'s tree (digest `54f6ff480ef265cb` over 342 files, Node
24.20.0), its declaration-step facts measured before anything was built and the four stop-and-asks
answered by the maintainer before a rule was written (*go with the recommendations*, each recorded
in its section below).
**Plan:** [P19](../plans/p19-what-a-schema-buys-an-author.md) — decisions 4, 5 and 8, fact 3,
predictions 1 and 2, [Q263](../questions/q263.md) and [Q186](../questions/q186.md); the plan's
second item, serial after [W72](w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md)
and before W74. **[Q300](../questions/q300.md) and [Q301](../questions/q301.md) are addressed to this
item by name.**

```
Spec:       spec/flow-definition.md — section 6 gains ONE rule, FD-R4 (the two runtime boundaries,
            P19 decision 5), and section 3's registry-document subsection gains a short
            "what the schemas buy an author" subsection stating the wiring relation's clauses and
            the five verdicts, so the conformity reader has a normative text to read the module
            against (v0.21; no FD-V added, so C4 stays at 34); spec/README.md's C8 row follows.
            NO ADR unless stop-and-ask 2 chooses a shape the plan's decision 5 does not state
            (ADR 0057 is reserved and this item expects it UNUSED).
Owns:       src/definition/wiring.ts (new), src/driver/driver.ts (the two boundaries only),
            src/scheduler/runtime.ts, spec/flow-definition.md, test/definition/**, test/driver/**,
            spec/examples/** (the miswire) — the plan's W73 row, verbatim
Inputs:     P19 fact 3 — RE-RUN on the SHIPPED registry document (dev-dist/w73/decl-edges.mjs), not
            transcribed from the plan or from dev-dist/p19/schemas.mjs (W72's fact-3 lesson): the
            45-line relation dev-dist/p19/fact-3-fits.mjs, its twelve controls in
            fact-3-controls.log (eight negative — these are fixtures here); P19 facts 5 (the witness)
            and 6; W72's coverage-shipped.mjs; ADR 0056 rule 3 (the first example is the sample;
            optional, witness as fallback); ADR 0053 (the subset, a keyword outside it refused);
            JP-R12 (what a join carries); FD-C1/FD-C5/FD-C6 (what a node receives and what its
            worker sees); the maintainer's answers to the four stop-and-asks below
Outputs:    (1) checkWiring(registry, flow) in src/definition/wiring.ts, exported from the root:
                one verdict per CONSUMER over every shape of "what this node receives" — an
                ordinary edge, a fan-out branch (JP-R11), a map instance (an item of `over`), a
                join successor (JP-R12's record), a `needs` composition (FD-C1's four reference
                forms) — from the plan's four kinds plus UNCHECKED where a side declares no schema
                (P18 decision 3's "absent means unchecked"), the relation TOTAL (prediction 2)
            (2) the transformed edge verified by RUNNING the transform (the adapter's worker half,
                imported on the main thread) on the producer's declared example — or on its
                WITNESS, and the verdict carries which, and the ARITY of the sample where the
                producer is a region (Q301, Q263)
            (3) decision 8's answer: what the check says of a join successor, from the RECORD it
                knows (branch outputs keyed by path) rather than from a keyword the subset cannot
                say (fact B below)
            (4) FD-R4, the two boundaries, ON by default (stop-and-ask 2): the entry payload held
                to the first task(s) it reaches at start(), a person's resolution held to the
                node's worker outputSchema at resolve() — once per run, once per human action;
                a driver option turns both off, named in the rule
            (5) a wiring fixture corpus with a recorded verdict per document, so the check has a
                POSITIVE case for every verdict kind — its home is stop-and-ask 3
            (6) src/definition/witness.ts: P19 fact 5's 28-line generator lifted from the check
                script into the library, because (2) needs it here and W74's assist imports it
Depends on: W72 (the schemas and the examples the check reads)
Blocks:     W74 (the assists run over this relation; the authoring session's miswire is (5)'s)
Tests:      expected values from the DOCUMENTS — fact 3's twelve controls verbatim as fixtures,
            the corpus's own schemas, JP-R12's record shape, FD-C1's table — never from output.
            A verdict is a claim about two declared schemas or about a value a transform
            produced; the twelve controls and the constructed miswires are what make it falsifiable.
Gate:       L0; L1-L5 in five runtimes — fact 3's twelve controls (8 negative) and the corpus as
            fixtures, every verdict kind reached on a constructed document, the transformed edge
            on the FAKE language (its worker half is a data: URL every runtime imports — fact E),
            the record shape at arities two, one and zero (Q263), both boundary refusals at L2 on
            a fake scheduler; L6 in BOTH runtimes — an entry payload the schema refuses (nothing
            dispatched; the same-driver half is L2's, the runtime never hands out a refused driver)
            and a resolution the schema refuses (the task still
            suspended, then resolved with a conforming value and the run completing), on real
            workers; check:spec (C4 UNMOVED at 34, C8 over v0.21), check:docs (the §9 executed
            error-class list, which REFUSES a new root export until named), check:source,
            check:wiring, check:workers (unmoved unless stop-and-ask 4's road touches a worker);
            rule 8 obligation (a) over every shape the relation ranges over and every keyword of
            the subset it reads, (c) over the verdict's provenance (the schema each side is read
            FROM, the sample the transform ran ON), (d) over the edge loop's bounds (an edge out,
            a node out, a flow out of the fixture corpus, a control out of the twelve), (e) over
            the L4 fixture corpus's wiring (a document renamed out of the glob); then both reader
            passes and rule 8's re-run with their exact edits as probes; the confirming gate with
            the tree held still; the grep of the tree for W73 before recording
Reserves:   Q305-Q309 (Q303-Q304 were W72's, reserved and unused, so they are skipped); ADR 0057
            reserved by the plan and expected UNUSED by this item
```

## Exceptions

Seeded from the plan's table and then MEASURED at this declaration, which changed the table in both
directions — as W72's did, and for the same reason: the plan's table predicts a reference item.

| path | seeded? | why |
|---|---|---|
| `spec/README.md` | seeded — **true** | `C8`'s version row, a consequence of the `spec/flow-definition.md` bump to v0.21 |
| `scripts/build-browser-tests.mjs` | seeded — **predicted UNNEEDED, measured** | its `walk` is RECURSIVE over `spec/examples/` and `examples/flows/` (`build-browser-tests.mjs:33-41`), so a fixture document anywhere under either is inlined with no edit; the seed fires only for a fixture placed outside both trees, which no road in stop-and-ask 3 does |
| `examples/registry.json` | **no — measured here (fact A)** | with every edge SHAPE wired rather than task→task alone, the shipped corpus has **9 consumers that do not fit**: eight on ONE bound (`split`'s per-item `confidence`, unbounded above since W72's reader dropped the `maximum` the code did not keep, flowing into `score`'s and `weigh`'s inputs which still say `maximum: 1`) and one on `typed`'s echoed `items` declaring nothing of an item that `rank` requires to be an object. The corpus holds a miswire the plan's fact 3 could not see — **stop-and-ask 4**, because the fix is in W72's file either way |
| `examples/workers/shared.ts` *(this row said `split.ts` — the clamp lives in `memoisedItems`, measured at the build)* | **no — stop-and-ask 4, road (ii) only** | one `Math.min(1, …)` restores confidence as a probability; no L6 payload has a word longer than five letters (`grep` of every `text:` in `l6.ts`: `''`, `'a a'`, `'a bb'`, `'a bb ccc'`, `'alpha bb alpha bb alpha bb'`), so no L6 value moves and `check:workers`' example (`alpha`) still conforms |
| `examples/l6.ts` | **no — measured here** | the plan's gate line puts the boundary checks AT L6 and no `examples/**` path is in this item's `Owns` — W72's finding one item later, predicted this time. TWO rows are added (an entry payload refused on a task entry; one on a fan-out entry, `nested-map`'s, the shape the corpus has and the rule must name) and **one EXISTING row MOVES under stop-and-ask 2's ON-by-default**: W63's `transform-fails` resolves `review` (type `Echo`) with `{ points: '…' }` and `stamp` with `{ confidence, at }`, and `echo`'s declared `outputSchema` (eight required keys, `additionalProperties: false`) REFUSES both — measured by reading the row against the schema. Its two resolutions become a refused attempt followed by a conforming one, or the resolve boundary ships off by default; the maintainer's call |
| `examples/README.md` | **no — measured here** | its L6 row table gains a line per new row (W72's, W71's late exception on the same table) |
| `AGENTS.md` §9 and §13 | **no — measured here** | §9's executed error-class snippet compares the root's `Error` subclasses to a literal list BOTH WAYS and throws `section 9 does not mention: <class>` for a new one — a new refusal class is refused by the reference until it is documented, which is `X4` doing its job (`AGENTS.md:1355-1380`); §13's *"`inputSchema` and `outputSchema` are declared and carried, and enforced on no RUN"* (`AGENTS.md:2011`) and *"no RUN enforces them"* (`AGENTS.md:2213`) are false once `FD-R4` ships |
| `index.ts` | **no — measured here** | the root re-exports `src/definition/*` module by module (`index.ts`, sixteen lines) and a new module is exported by nothing until named — W47's finding, the direction that lets `checkWiring` exist and be unreachable |
| `scripts/check-workers.mjs` | **no — conditional on Outputs (6)** | the witness generator is lifted into `src/definition/witness.ts` and the check imports the ONE copy rather than carrying its own; its self-test's two witness probes (`check-workers-selftest.mjs:128,134`) anchor on the check's behaviour and not on the function's text, predicted unmoved — measured at the build |
| `spec/outcome-record.md`, `test/fold/result-value.test.ts` | **predicted UNNEEDED, measured** | `OR-R11`'s corpus half walks exactly `spec/examples/valid` and `examples/flows` (`result-value.test.ts:576`) and derives *16 of 175* against that document's sentence; every road in stop-and-ask 3 puts the fixture corpus in a SIBLING directory or under `test/`, and the L6 rows derive their flows from documents already there, so neither count moves |
| `scripts/check-spec.mjs` and its self-test | **predicted UNNEEDED** | `FD-R` ids are counted by `C2`/`C6` from `RULE_PREFIXES` (`check-spec.mjs:66`) and `C4` counts `FD-V` rows alone; W33 added `FD-R2` with no change here. **Known hazard from W72**: `C4`'s own-paragraph clause reads the LAST `**N refusals**` sentence, so v0.21's paragraph carries `**34 refusals**` verbatim |
| `scripts/check-docs.mjs` and its self-test | **predicted UNNEEDED** | `RUN_FLOOR` moves for a new `run` snippet and this item adds none — the reference's wiring section is W74's |
| `deno.json` | **LATE — undeclared until `S6` fired** | every new published module reaches the JSR allowlist (`!src/definition/wiring.ts`, `!src/definition/witness.ts`) — W62's shape, missed by this table and by the plan's |
| `examples/run-flow.ts` | **LATE — undeclared until the L6 rows were written** | the two rows need the HARNESS and not only `l6.ts`: `refuseAtStart` and `refusedFirst` options, three report fields, and — after the conformity reader — `checkWiring` over `runtime.registry` on every row (`RunReport.wiring`) |
| `test/driver/retention.test.ts`, `test/definition/needs.test.ts`, `test/definition/l4-corpus.test.ts` | Owned — not exceptions, recorded | three OTHER items' suites firing as ratchets on this item's edits: `RN-R13`'s `DRIVER_FIELDS` (the driver's `workers` field), section 7's row count (the wiring table's rows), the suite census (Q158's closure); and `task-config.test.ts`'s kind-row regex read an arc named `join` as a node kind, which is why the shape is `record` |
| `src/definition/schema.ts`, `src/definition/registry.ts` | **UNDECLARED — added by P19's retro under `doc/workflow.md` section 6 pass 3 rule 6** | three lines and five, both W72's files, both outside this item's `Owns`: two header sentences this item's own `FD-R4` falsified (*"a worker's last two are declared, carried, enforced on no RUN"* and *"a malformed inputSchema is a registry defect today even though no RUN enforces it"*). **The conformity reader found them — its finding 10, which says in so many words *"they need a late exception or a note"* — and the item acted on the SENTENCES and not on the TABLE ROW.** Recorded here so this table matches `git show af7b1db --name-only`: section 7 rule 2's declared-exceptions list is the claim, and it was one row short in two directions |
| `src/` (rule 8 only) | — | probes mutate `wiring.ts`, `witness.ts`, the driver's two boundaries and the fixtures to measure what the suites observe |

## Scope

**In**

1. `checkWiring(registry, flow)` — a verdict per consumer over every shape of *what this node
   receives* (Outputs 1), with fact 3's relation promoted verbatim and then held to the twelve
   controls as fixtures.
2. The transformed edge, sample-verified on the producer's example or witness, the verdict naming
   which and the sample's arity (Outputs 2); the join successor's answer (Outputs 3).
3. `FD-R4` and the driver's two boundaries, with the runtime forwarding an off switch (Outputs 4).
4. The wiring fixture corpus and its table in `spec/flow-definition.md` (Outputs 5).
5. `src/definition/witness.ts` (Outputs 6).

**Out** — named, with where each goes

- **Path enumeration, the sample-and-diff loop, the generated-signature recipe, the authoring
  session** — W74 (P19 decisions 7 and 9).
- **Per-settlement validation of a worker's result** — *slices beyond*, OUT of the plan as a default.
- **Extending the subset** — `additionalProperties: <schema>` is what a join record would need and
  the subset cannot say it (fact B); this item does NOT add it, because the check knows the record's
  shape from `JP-R12` and needs no keyword to say so (prediction 1 holds in the letter; see fact B
  for what it costs).
- **Schemas on the L4 corpus's seven `corpus://` workers** — stop-and-ask 1 (Q300); priced below,
  not assumed.
- **A type-level JSONata interpreter** — refused (P19 decision 7); the transformed verdict is a
  SAMPLE and says so.
- **Changing what any worker RECEIVES** — the plan's constraint; the only worker edit any road here
  takes is what `split` RETURNS for an eleven-letter word (stop-and-ask 4, road ii).

## The declaration step

Seven facts, every one from a run on this tree under Node 24.20.0, redirected to `dev-dist/w73/`
and read by its exit code; nothing transcribed from the plan.

| fact | measured |
|---|---|
| **A. Fact 3 RE-TAKEN on the shipped document, and over every SHAPE — the corpus does NOT all fit** | `decl-edges.mjs`: fact 3's harness still reads 14 of 14 task→task fits on the shipped registry. But a consumer receives one of SIX shapes, counted over both corpora: **23 task→task, 48 fan-out branches, 20 map items, 26 join successors, 16 `needs` compositions, 44 entries** (11 transformed). Over the L6 corpus with W72's shipped schemas the census reads **fits 61 / no 9 / unchecked 7**; the nine are `split.outputSchema.items[].confidence` with NO `maximum` (dropped by W72's reader, Q302) into `score`'s and `weigh`'s `maximum: 1` on seven map-item edges and one `needs`-composed one, `typed`'s echoed `items[]` (schema `{}`) into `rank`'s `type: object`, and triage's `report` whose join record meets a consumer requiring `text` — a TRANSFORMED edge the static reading cannot see. *The plan's fact 3 measured fifteen edges of one shape and concluded the corpus holds no miswire; it holds eight of one kind and one of another, on the shapes it did not count.* Two non-task entries exist, one per corpus, both fan-outs (`nested-map`, `nested-fanout`) |
| **B. Decision 8's first measurement: the subset CANNOT say `additionalProperties: <schema>`** | `decl-subset.mjs`: `schemaProblem` refuses it by name (`the subset admits true or false, not a schema`). What it CAN say of a `JP-R12` record: `{ type: 'object' }` and `{}` accept arities 2, 1, 0 and a nested `1.0/1.1` record alike; keys named for a static fan-out of two accept arity 2 and refuse 1, 0 and nested; `{ type: 'array' }` refuses all. **So the join successor's declared input schema is `{ type: object }` at best, and the shape per key is the CHECK's knowledge** — it builds the record schema from the branch outputs keyed by path (exact for a static fan-out, whose paths are known; *any key, each of shape S* for a map) and asks the consumer's schema of THAT. Prediction 1's named reversal is measured real and NOT taken: no extension |
| **C. Q263 at the wiring check: the corpus's two join-successor transforms cover every arity, and the scalar form does not** | `decl-q263.mjs`, the shipped adapter's worker half on the main thread: `$sum([*.score])` (transformed.flow's `total`) is a NUMBER at arity 3, 2, 1 and 0 (60 / 30 / 10 / 0), accepted by `Echo`'s input schema at each; `{ "text": $join([*.answer], " ") }` (triage's `report`) is an object with a string `text` at all four, accepted by `Prompt`'s (which REQUIRES `text`) at each — including `{"text": ""}` at arity 0. The controls: `*.score` is an array at 3 and 2, the NUMBER 10 at 1 and `undefined` at 0; `$sum(*.score)` is a number at 3-1 and `undefined` at 0. **So a transformed-join verdict is a fact about the arity the sample had, and the verdict SAYS the arity** — the sample's arity is the producer example's array length for a map, the declared branch count for a fan-out |
| **D. Decision 5's price, once per run** | `decl-cost.mjs`: `findings` over the corpus's entry payloads costs **0.47-0.85 µs** (ingest, split, prompt, fetch), a resolution against `retry`'s / `prompt`'s output schema **0.96 / 1.28 µs**, the floor with no schema 0.19 µs; the shape that GROWS is a schema with `items` walking an array — `split.outputSchema` over a 1000-item result **350 µs = 0.35 ms**, `typed.inputSchema` over the same array **1.2 µs** because its `items` declares no sub-schema. Against P15's ~100 ms per real run at L6 that is under 0.4% at the walking worst case and under 0.001% on every corpus payload. **The check is affordable ON; what the maintainer decides is the SHAPE** (stop-and-ask 2) |
| **E. An adapter's worker half imports on the main thread, in `src/`** | `decl-import.mjs`: the fake language's `data:` URL imports under Node 24 and evaluates (`run.config` → 7); the JSONata adapter's `worker` is its own module and its default export IS that module's default, evaluating `$sum([*.score])` to 3 over two branches. So `checkWiring` can run a transform where a driver cannot (P17 fact 1 — the driver dispatches inside a listener with no `await`; the check is async and outside any listener), by `import(adapter.worker)` — a URL, never the bare specifier `jsonata`, so `S14` holds. The Deno and browser halves are the L1 suite's to show, on the fake language |
| **F. Q300, both roads priced** | `decl-q300.mjs`. **Road A** — the seven `corpus://` workers gain **14 schemas, 273 pretty-printed lines**, eight keywords, all in the subset, invented for workers that do not exist and confirmable by no check (Q300's shape: a wrong one is caught only by the wiring check disagreeing with a flow); with them the L4 corpus reads **46 fit / 4 no / 3 unchecked / 3 sampled** on this census's conservative record rule (the four are `Scorer` nodes after a join whose input schema NAMES keys without requiring them — which the shipped relation ACCEPTS, so the real figure is 50 / 0 / 3; recorded rather than re-run because the census is a declaration probe and the relation is the item's). **Road B** — the check runs over the L6 corpus alone, whose fourteen workers are RUN by `check:workers`; the L4 corpus's **53 consumers stay UNCHECKED** and L4 asserts only that the check is total over them (every consumer a verdict, no crash). Either road, the miswire the check needs a positive case for is a FIXTURE and not a corpus flow — see stop-and-ask 3 |
| **G. What "the L6 corpus wires" costs** | `decl-q300.mjs`, last section: with `split.outputSchema.items[].confidence` bounded at 1 again and `typed`'s `items[]` typed as objects (input and output), the L6 corpus reads **fits 62 / no 0 / unchecked 7 / 8 sampled at the build** — three schema fields in `examples/registry.json`, plus one line in `split.ts` under road (ii) so the schema is TRUE (`word.length / 10` exceeds 1 at eleven letters). The seven UNCHECKED are the edges into and out of `fail` and `uncloneable`, which declare no `outputSchema` by design (ADR 0056 rule 4) |

**And two things the plan's seeded exceptions did not know**: ladder L6 is where the boundary checks
are gated and no `examples/**` path is in this item's `Owns` (the table above); and the resolve
boundary ON by default meets W63's `transform-fails` row, whose two resolutions `echo`'s declared
output schema refuses — measured against the row's own literals, not run.

## Stop and ask 1 — Q300: schemas on workers no check can run, or the wiring check over the L6 corpus alone

**Put to the maintainer 2026-09-18 with both roads priced from fact F. ANSWERED the same day: ROAD B**, the author's reading — the L4 corpus stays UNCHECKED with totality asserted over its 56 arcs (every one `unchecked` by name, no throw — `test/definition/wiring.test.ts`, the conformity reader's finding 2: the declaration said 53, the census set three transformed arcs aside), and the wiring check's corpus is the L6 one plus the fixture corpus of stop-and-ask 3. [Q300](../questions/q300.md) RESOLVED with the reading recorded.

| | ROAD A — the L4 registry's seven `corpus://` workers gain input and output schemas with examples | ROAD B — the wiring check's corpus is the L6 one; L4's stays UNCHECKED |
|---|---|---|
| what it costs today | 14 schemas, 273 lines, in `spec/examples/registry.json` (this item's `Owns`); a section 7 sentence; the L4 suite gains a verdict-per-consumer assertion over 19 flows | nothing in `spec/examples/registry.json`; the L4 suite asserts totality (a verdict for all 53, none a crash) and the L6 corpus's 62 fits / 0 no / 7 unchecked, both as EQUALITIES |
| what confirms the schemas | nothing can RUN a `corpus://` URL — a schema there is a declaration about a fictional worker, true by construction and falsifiable only by the wiring check disagreeing with a flow (fact 6's shape, Q300) | `check:workers` runs all fourteen L6 workers on their examples; the wiring check reads schemas a run has confirmed at one value |
| the two corpora | agree: both carry schemas, both wire | disagree, as Q300 says they do today: one corpus is about DOCUMENTS (validation, L4) and the other about RUNS (L6) — recorded as the reading, in Q300's row |
| the miswire | can live in `spec/examples/valid/` as a flow the relation refuses (with a section 7 row recording the verdict) — the third stop-and-ask's road (a) | cannot live in the L4 corpus (no schemas to be wrong against); lives in a FIXTURE corpus with its own registry (road c) or in `test/**` (road b) |
| the plan's lean | — | **this one**: W72 named the L4 workers OUT for exactly this reason, and a declaration nothing runs is the class P19 fact 6 exists to refuse |

**The author's reading, offered and not decided**: road B, with the fixture corpus of stop-and-ask
3's road (c) carrying the positive cases. Road A's 273 lines would be the largest hand-written
declaration in `spec/` with no execution behind any line of it; road B leaves the L4 corpus honest
about what it is.

## Stop and ask 2 — decision 5's boundary checks ON by default, and their SHAPE

**Put to the maintainer 2026-09-18 with the price from fact D and the row that moves from fact A's
second note. ANSWERED the same day: ON by default, as REJECTED COMMANDS, and no ADR** — `FD-R4`'s row
says it is the one row of its table whose heading clause does not hold; ADR 0057 stays unused.

| | ON by default (the plan's *yes*) | OFF by default (an opt-in `validateBoundaries: true`) |
|---|---|---|
| cost, once per run | 0.5-1.3 µs on every corpus payload; 0.35 ms at the walking worst case (a 1000-item array under a schema that walks items) against ~100 ms per real run | 0.19 µs (the skipped-check floor) |
| what a consumer gets | the one value the caller supplies and the one value a human supplies each meet the schema the worker's author wrote, before anything runs on them; a payload with `confidence: 2` is refused naming the node, the field and the finding instead of scoring 200 | today's behaviour: a wrong payload runs and the worker copes or does not, and a human's off-schema value flows downstream into wired consumers as a lie about the producer |
| the corpus | **W63's `transform-fails` row MOVES**: `review` (`Echo`) is resolved with `{ points: '…' }` and `stamp` with `{ confidence, at }`, and `echo.outputSchema` (eight required keys) refuses both. The row gains a refused first attempt per node (`BoundaryRefused` thrown at the caller, the task still suspended — the L6 observer of the rule) and then resolves each with `echo`'s DECLARED EXAMPLE, which is the value ADR 0056 rule 3 says a tool reaches for and here a person does | the row stands unchanged; the resolve boundary has no live L6 case unless a row opts in |
| the plan's lean | **this one** — once per run, once per human action | — |

**And the SHAPE, which decision 5 does not state and the `FD-R` family's heading does (*the run
terminates when*)**: the author's reading is that both boundaries are **REJECTED COMMANDS, not run
failures** — `start()` throws `BoundaryRefused` before `started` is set, so the driver is UNSTARTED
and a corrected payload may start it (ID-R3 is untouched: nothing ran); `resolve()` throws it with
nothing appended and the task still suspended, so a person corrects their value and tries again, as
`RS-R1`'s other refusals already work (*a rejected command, not a run failure: it came from outside
and a caller can retry*). A boundary that STOPPED the run would turn a typo in a human's value into
a dead run, which is the opposite of what the schemas are for. **If the maintainer wants the
run-stops shape instead, or wants this departure recorded, ADR 0057 is reserved for it**; the
author's reading needs no ADR because it is decision 5 plus `resolve`'s existing contract.

## Stop and ask 3 — the miswire's home

**Put to the maintainer 2026-09-18 with the three roads priced. ANSWERED the same day: road (c)** —
`spec/examples/wiring/` with its own five-worker registry and one document per verdict, named by the
verdict it earns, listed in section 7 and held to the directory both ways (Outputs 5).

| | (a) beside the valid corpus — `spec/examples/valid/miswired.flow.json` with its verdict in section 7's table | (b) `test/**` only | (c) a FIXTURE corpus — `spec/examples/wiring/` with its own small `registry.json` and one document per verdict kind, named `<verdict>--<slug>.flow.json` as `invalid/` names its cases by rule id, with a table in section 7 compared to the directory BOTH WAYS (as `valid/` is) |
|---|---|---|---|
| precedent | none — every `invalid/` document is refused at construction and a miswire VALIDATES; `valid/` is an equality against section 7's table, so the row must say *this document is wrong on purpose* | a literal in a suite, as fact 3's controls are today | `invalid/`'s own shape one rule family over: a document wrong on purpose, named by what refuses it, listed in the spec, held both ways |
| needs | road A of stop-and-ask 1, or the miswire has no schemas to be wrong against | nothing | its own registry (two or three workers with OPPOSED schemas, `path` as the language for the transformed cases) — declarations nothing runs, but FIXTURES rather than the corpus's claim about itself |
| what it gives W74 | one flow the session can catch | nothing a document reader can find | one document per verdict — `fits`, `no` (no transform), `transform-passes`, `transform-fails`, `unchecked` — the session picks the one it needs and the reference can point at each |
| what it costs | one file, one row, and the L4 corpus stops being *every document here is one an author would want* | zero documents, zero spec text | a directory, a registry, five or six documents, a section 7 sub-table, an L4 suite comparing directory and table both ways; the browser bundle inlines it unedited (fact table above) |
| the author's reading | — | — | **this one**, on `invalid/`'s precedent: a fixture that is wrong on purpose belongs beside the fixtures that are wrong on purpose, named by the verdict it earns |

## Stop and ask 4 — fact A's finding: the L6 corpus is miswired by one bound, and the fix is in W72's file

**Put to the maintainer 2026-09-18 because every road moves W72's recorded document and one moves a
worker's return value. ANSWERED the same day: road (ii)** — the clamp is one `Math.min(1, …)`, and it
lives in `examples/workers/shared.ts`'s `memoisedItems`, NOT in `split.ts` as this section and the
exceptions table said (measured at the build; the table is corrected below). [Q302](../questions/q302.md)
extended with the other resolution — *the code made to keep the bound*.

| | (i) relax the CONSUMERS to match the unbounded producer | (ii) bound the PRODUCER in code and restore the schema |
|---|---|---|
| edits | `score.inputSchema.confidence` and `weigh.inputSchema.item.confidence` drop `maximum: 1`; then `score.outputSchema.confidence` (echoed) and `weigh.outputSchema.score` (`round(item.confidence * run.confidence * 100)`) drop theirs too, and `score.outputSchema.score` (`round(c * 100)`) — **five bounds leave `examples/registry.json`** and *confidence is a probability* stops being true of the corpus | `examples/workers/split.ts` clamps the per-item confidence at 1 (`Math.min(1, word.length / 10)`) and `split.outputSchema.items[].confidence` gets its `maximum: 1` back — **one line of worker code, one schema field**; plus `typed`'s `items[]` typed as objects on input and output (two fields), which is road-independent |
| what it says | the schemas tell the truth about a toy that computes a confidence above 1 | the toy is corrected to compute what every other worker in the corpus declares confidence to be (ingest, score, weigh, prompt, fetch, typed, retry all say `0..1`); Q302's *the bound dropped where the code does not keep it* gets its other resolution — *the code made to keep the bound* — recorded in Q302's row, not by editing W72's file |
| what moves | nothing at L6 (values unchanged); `check:workers` unchanged; five fewer bounds for W74's session to reason with | nothing at L6 — no payload has a word past five letters (measured); `check:workers` unchanged (`alpha` is five); one worker's return value for an input the corpus never sends |
| the plan's constraint | untouched | *anything that changes what a worker RECEIVES* is untouched; what `split` RETURNS for an eleven-letter word changes, and it is named here rather than slipped through |
| the author's reading | — | **this one** |

## Stated assumptions, each overridable by the answers above

1. **Five verdict kinds, the plan's four plus `unchecked`**: `fits`; `no` (does not fit, no
   transform); `transform-passes` and `transform-fails` (a transform present, the sample run — each
   carrying `sample: { source: 'example' | 'witness', arity?: number, value }`); `unchecked` naming
   the side that declares no schema. A verdict is a value with a `kind`, a `why` (the relation's own
   reason, as fact 3's controls print it), the consumer node, the producer node or region, and the
   shape (`edge` | `branch` | `item` | `join` | `needs`). One line of text per verdict for a human.
2. **The relation is fact 3's, verbatim, plus `examples` skipped** — the harness's 45 lines with
   the thirteenth keyword read by nothing (ADR 0056 rule 1), each of the twelve keywords' clauses a
   fixture from `fact-3-controls.log`, and the corpus's `no` reasons from fact A as a further eight.
3. **A join record is checked from what the check KNOWS** (fact B): for a fan-out, the exact
   record schema — every declared path required, each branch's output schema at its key,
   `additionalProperties: false` — through `fits`; for a map, *object accepted, no key required,
   extras not forbidden, and no named property* — because the keys are minted at run time; a
   nested region composes its prefix. A transformed join successor runs the transform on the
   record built from the branches' examples (or witnesses) at the fan-out's declared arity, or at
   the map producer example's array length, and says the arity (fact C).
4. **`FD-R4` covers a TASK entry and a REGION-OPENER entry alike**: the payload is held to every
   task the run dispatches from the entry with no worker in between — the entry task; a fan-out's
   branch tasks over the same value, recursively; a map's branch task per item of `over` (the
   non-array case is `FD-R2`'s already). Two of forty-four corpus entries open a fan-out (fact A).
5. **Both boundaries are rejected commands** (stop-and-ask 2's second half): `BoundaryRefused`,
   carrying `boundary: 'start' | 'resolve'`, the node id, the task id where there is one, and the
   findings; nothing appended, nothing reported through `onRunFailure`, the run unaffected.
6. **The off switch is `DriverOptions.validateBoundaries?: boolean` (default `true`), forwarded
   by `createRuntime`'s `RuntimeOptions`** — a runtime-wide choice, since the schemas are the
   document's; a per-`start` override is not offered until someone asks.
7. **The witness generator moves into `src/definition/witness.ts`** and `check-workers.mjs`
   imports it, one copy (Outputs 6); W74's `assist.ts` imports the same. If the maintainer prefers
   the script to keep its own copy, a both-ways test binds the two.
8. **Under road (c) the fixture corpus's registry names `path` as its language**, resolved by
   `corpus-types.ts` exactly as the L4 registry's is, so a transformed fixture runs on the fake
   language in all five runtimes; the JSONata adapter is exercised by the L6 corpus and by an L1
   case over `transformed.flow.json`'s own `total` node.

## Verification

- `eval "$(fnm env --shell bash)" && fnm use 24` first, every shell; `node -v` asserted 24.
- Every rung RUN and redirected to `dev-dist/w73/<rung>.log; echo EXIT=$?` — never piped.
- L0: `npm run lint`, `npm run typecheck`. L1-L5: `npm test`, `npm run test:deno`,
  `npm run test:browser:all` (five runtimes). L6: `npm run test:l6`, `npm run test:l6:deno`.
- The checks: `check:spec`, `check:docs`, `check:source`, `check:wiring`, `check:workers`,
  `check:markdown`, `check:policies`, `check:scheduler`.
- Rule 8: `dev-dist/w73/rule8.mjs` on W72's harness shape — a control, byte-asserted restores,
  per-edit anchors on text read from the SOURCE and re-read after every edit of this item's own, an
  abort that undoes what it applied, a content digest over every tracked and untracked-unignored
  file at both ends (`dev-dist/w73/digest.mjs`), Node 24 asserted, every declared ceiling RUN
  against the rung its reason names, a crash never counted as a detection (a refused fixture
  registry takes the L1 runner down at module scope — Q272's shape, W72's two measured rows).
- Then the two reader passes (conformity re-derives every verdict on paper first; adequacy in an
  isolated copy with `node_modules` COPIED and links scanned before removal, a control run green
  first), rule 8 re-run with their exact edits as probes, the confirming gate with the tree held
  still, the Record — and the grep of the tree for `W73` before recording, the census re-derived
  with `dev-dist/p15/census.mjs` and every new row placed in a cluster cell.
- Routing coverage: not applicable — this item touches no routing; the two boundaries sit before
  the first dispatch and on the inbound edge, and neither changes what any node receives.

## Record

**Built and gated 2026-09-18 on `5525f2c`'s tree.** Every rung RUN and redirected to `dev-dist/w73/`, read by `$?`; Node 24.20.0 asserted in every shell and by the harness. Expected values from the documents — fact 3's twelve controls verbatim from `dev-dist/p19/fact-3-controls.log`, the corpus's own schemas, `JP-R12`'s record shape, `FD-C1`'s table, the fixture corpus's verdicts from section 7 — never from output.

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured, seven facts, **fact 3 re-taken over every SHAPE and the shipped corpus did NOT all fit** | 14 of 14 task→task edges fit as fact 3 said; over six shapes the shipped L6 corpus held NINE arcs that did not — seven on ONE bound (`split`'s per-item `confidence`, unbounded since W72's reader dropped the `maximum` the code did not keep, through six map items and one `needs`), one on an undescribed item, one a transformed record the static reading refuses; the subset CANNOT say `additionalProperties: <schema>` (fact B); `$sum([*.score])` is one type at every arity and `*.score` is three (fact C); the boundaries cost 0.47-1.28 µs (fact D); an adapter's worker half imports on the main thread (fact E); Q300's road A is 273 invented lines (fact F). *(The declaration wrote "eight on one bound through seven map items" — SEVEN through SIX, the conformity reader's finding 4, corrected in four documents.)* |
| the four stop-and-asks | RAN — all four answered the same day, *go with the recommendations*: road B, ON as rejected commands with no ADR, the fixture corpus, the clamp | recorded in each section above; ADR 0057 unused |
| L0 | **GREEN** | `lint` 0 over 103 files; `typecheck` 0 in all five configurations (red twice at the readers' fixes: a `Readonly<Record> | undefined` past a moved check, and a `'self'`/`'all'` comparison with no overlap — both caught by `X3` too) |
| L1-L5 | **GREEN — 43 files / 1197 cases in five runtimes** (from 41 / 1119) | `test/definition/wiring.test.ts` (fact 3's twelve controls and the SEVEN clause controls the adequacy reader asked for, each keyword of the bounds list in both directions; the leniency's own control; the map record literal; both enumerations held to the spec's two tables both ways; the fixture corpus against section 7 both ways with every verdict kind reached; the L6 corpus's census as an EQUALITY — 62 fit, 1 `no`, 5, 2, 8; the L4 corpus's totality — 56 arcs, every one `unchecked` by name; the constructed shapes: a `needs` in every form, the fan-out record requiring none of its keys, the three nesting documents, the map record marker, Q263's arities, the per-item composition, the witness road, a throw, a missing language, provenance, `boundaryTargets` recursive and composing an entry map's `needs`, one entry walk for two callers) and `test/driver/boundary.test.ts` (both boundaries on a fake scheduler — refused, nothing dispatched, the same driver then started; refused, still suspended, then resolved on the declared example; both switches; the runtime forwarding). Node 1197, Deno 1197, chromium / firefox / webkit 1197 — `test:browser:all` RUN, not inherited |
| the checks | **GREEN** | `check:spec` (7 documents, 61 examples, 107 rules — 55 + the six wiring files, 106 + `FD-R4`; C4 UNMOVED at 34; C8 over v0.21), `check:docs` 32 / 26 unmoved (`X4` REFUSED `BoundaryRefused` until §9 named it — predicted), `check:source` (`S6` fired on the JSR allowlist — a late exception), `check:wiring`, `check:workers` 14 / 12 / 2 unmoved, `check:markdown`, `check:policies`, `check:scheduler`; every self-test green |
| L6 | **GREEN — 1627 assertions over 53 runs in BOTH runtimes**, from 1611 / 53 | +3 (`map / live-token`'s entry payload refused at `ingest`, nothing dispatched), +3 (`nested-map`'s refused at `scoreA`, a fan-out entry naming the branch), +3 (W63's `transform-fails` row: both resolutions REFUSED first — `echo`'s declared schema refuses `{ points }` and `{ confidence, at }` — then resolved on `echo`'s declared example, the run completing), +7 cross-row: `FD-R4` refused a START and a RESOLUTION on exactly the rows declaring one, both ways, with a control each (v0.18); and — after the conformity reader — `checkWiring` over the RUNTIME's registry on every row: `no` on exactly the `FD-R2` row both ways, the two triage rows with ZERO unchecked over the class type, no report empty. `CROSS_ROW` 134 → 141, `DECLARED_TOTAL` 1611 → 1627 |
| rule 8, author pass | **67 probes: 1 control green, 60 caught, 6 declared ceilings each RUN against the rung its reason names, 0 undeclared after acting, 0 crashes after re-cut, 0 aborts, 0 against declaration** (`rule8-run1.log`, `-run1b.log`) | the first pass read THREE undeclared survivors (the `const` clause with no control; the map record's marker constructed and unobserved; a VACUOUS header probe) and THREE crashes — `p4c`'s compound dispatching the entry twice in a suite that builds drivers at module scope, and `d1` and `e2` taking the runner down because this item's OWN suite asserted at module scope, twice, on the day it was written (Q272's shape). All six acted on: two tests added, two parses made throw-free, two probes re-cut; the digest identical at both ends of every pass |
| readers | **BOTH RAN 2026-09-18 — 20 findings / 5 blocking, and 24 mutations / 23 probes / 20 survived / 18 real / 11 blocking plus one constructed finding, OVERLAP 1, the FORTY-FIFTH measurement** | **The conformity reader's central obligation came back AGREED on paper and then found the check THROWING** `ID-R6` on two documents the validator accepts (a fan-out in a map branch, a map in a map) — P19 prediction 2's *total* reversed as worded, closed by taking item index 0 for every enclosing map; `certain()` contradicted `JP-R12`'s three roads (a person may resolve a non-optional branch `failed`, a policy may fire early) — deleted, no branch key required; *53 consumers* was 56 and no L4 totality test existed — written; *eight on one bound through seven map items* was seven through six, in four documents; the L1 census's comment claimed L6 ran the check over the runtime's registry and NOTHING did — L6 does now. Fifteen non-blocking, every one acted on or recorded (ADR 0056 consequence 2 now false and annotated; `witness.ts`'s *eleven*; two *no RUN enforces* sentences; README's 1610; the exceptions table's three missing rows). **The adequacy reader found `fits` lenient for ZERO five ways** — an unbounded producer into an enum, `minLength` / `maxLength` / `minItems` each removable, `maximum`'s DIRECTION flippable because the corpus's one pair is 1 into 1, a producer with no `items`, the leak between two closed objects; **and its sharpest finding needed no mutation**: a map's branch task composing `"."` through `needs` and transforming it was sampled on the WHOLE `over` array under the key, evaluated once beside a one-item schema, so a CORRECT wiring read `transform-fails` — the refusing direction on a flow an author would want. Also: the entry task's `needs` got a `no` on a synthetic `<entry>` producer where the spec says the entry has no arc; arity 0 through the item shape and a transformed consumer with no `inputSchema` uninstantiated; `FD-R4`'s *recursively* with no nested entry region; `WiringReport.entry` a second walk beside `boundaryTargets`; and the L6 claim *the same driver then started* carried by a driver the harness mints and discards — `runtime.start` builds and starts in one call, so a refused driver is a value no caller holds; the same-driver half is L2's and the spec and the harness say so now. Every blocking finding acted on; the readers' twenty-three exact edits are probes (`k1`-`k7`, `q1`-`q16`) |
| rule 8, RE-RUN with the readers' edits checked in | **90 probes: 1 control green, 82 caught, 7 declared ceilings each RUN against the rung its reason names, 0 measured, 0 UNDECLARED survivors, 0 crashes, 0 aborts, 0 against declaration** (`rule8-run2.log`, digest `501caaad448dde67 over 353 files` before and after) | six of the author's probes needed re-anchoring (rule 7 (b)): `s3` mutated a `certain()` the conformity reader had deleted and was RE-CUT to *every key required*; `b6`, `b8`, `p3` on lines the readers' fixes moved; `d4`-`d6`, `o4b` on the two L6 counts. The one declared ceiling among the readers' edits is `q15` — `started` set before the check, at L6 alone — for the reason the spec's Test cell now states |
| `npm run gate`, CONFIRMING (after the readers, the re-run and the record step) | ****GATE EXIT=0, zero lines beginning FAIL at any indent, `selftests` 8/8 completed and 8 ok in 1103.6 s over 6 lanes** — L0 green, every check green, L1 43 / 1197 in node, deno and chromium (firefox and webkit at 1197 by `test:browser:all`, RUN in the same still window), L6 1627 / 53 in both runtimes** (`dev-dist/w73/gate-final.log`) | with the tree held still: digest `aaf85f839c4d7101` over 353 files before and after |

**Outputs.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `checkWiring(registry, flow)`, five shapes, five verdicts, TOTAL | `src/definition/wiring.ts`, exported from the root | L1: the root-exports test (`o1`), the twelve and seven controls (`r1`-`r10`, `q1`-`q7`), the shapes (`s1`-`s6`, `k1`, `q8`, `q11`-`q14`), the L4 totality (`k3`), the L6 census (`d3`, `e6`, `k5`) |
| (2) the transformed arc verified by RUNNING the transform on the example or the witness, the verdict saying which and the arity | `wiring.ts`, `src/definition/witness.ts` | L1: `v2`-`v5`, `p3`, `q9`, `q10`, `q13`; the browser rung without the worker-half handle (`e5`) |
| (3) decision 8's answer — the join record from what the check KNOWS, no key required | `wiring.ts`'s `record()` | L1: `s3`/`k2` (a key required), `s4` (the marker), `r10` (the path rule), `k1` (the nesting), `v4` (the arity) |
| (4) `FD-R4`, both boundaries ON by default as rejected commands, an off switch forwarded | `src/driver/driver.ts`, `src/scheduler/runtime.ts`, `spec/flow-definition.md` section 6 | L2: `b1`-`b11`, `e7`; L6: `b1`, `b2`, `o4`, `o4b`, `o5`, `d4`-`d6`, `p4c`, `p5` |
| (5) the wiring fixture corpus, one document per verdict, held to section 7 both ways | `spec/examples/wiring/` | L1: `o2`, `o2b`, `o3`, `e3b`, `v1`, `v2`; the browser bundle inlines it unedited |
| (6) `witness.ts`, one copy, imported by the check script | `src/definition/witness.ts`, `scripts/check-workers.mjs` | L1: `v5`, `p2`; `check:workers` (the import); `S6` (`e1`) |

**What broke.** (1) A constructor PARAMETER PROPERTY in `wiring.ts` — Node's type stripping refused it (`RT-R9`, `S4`; P18's own sample failed the same way at W67). (2) `deno lint`: an unused import and a `let` never reassigned. (3) The STRICT reading of an open producer read `typed`'s echoed items into `rank` as `no` — reverted to fact 3's leniency and NAMED ([Q305](../questions/q305.md)). (4) `boundary.test.ts` imported `liveToken` from the wrong module. (5) A backtick-quoted apostrophe inside a template literal — W72's first breakage verbatim, one day later, **and a second time in the conformity fix set** (`ERR_INVALID_TYPESCRIPT_SYNTAX`, the runner down with zero FAIL lines). (6) Six L1 failures on the first green-looking run, four of them RUNGS FIRING AS DESIGNED: the suite census (Q158's closure), section 7's row count (`needs.test` counted the wiring table's rows), the kind-row parse (an arc named `join` read as a node kind — the shape is `record`), `RN-R13`'s `DRIVER_FIELDS` ratchet; two the author's expected values (`typed`'s example score is 9, not 15; the flow id is `nested-map`). (7) `typecheck:tests` on `OUT.examples![0]`. (8) `S6`: the JSR allowlist — a late exception. (9) `X4`: §9's executed class list refused `BoundaryRefused` until named — predicted. (10) L6: W63's row red exactly as predicted (both resolutions refused); then the byte walk's THREE lists for one driver field (`NOT_RUN_STATE`, `DRIVER_FIELDS`, the pinned `skipped` literal), each firing in turn. (11) Rule 8: two undeclared survivors and three crashes (the table). (12) The census parser aborted on the author's own Q301 row — an unescaped pipe inside a code span, Q215's defect reproduced by a row about verdict WORDS. (13) After the readers: two type errors at `X3`/`typecheck`; a nesting test written against a `sample` a `fits` verdict never carries (rewritten through a transformed successor); the bounds-list control reading `minimum` at the top level where control 7 nests it.

**What this taught.** **Fact 3's *the corpus holds no miswire* was a claim about ONE shape of six, and counting the other five found nine** — seven from a bound a reader dropped one item earlier: the wiring check is a second observer of [Q302](../questions/q302.md)'s shape, since a bound a producer does not keep is invisible to its own check and visible at every consumer. **A strict relation is sound and useless; the leniency an author expects has to be NAMED** (Q305). **The subset cannot write a map's record, so the check carries the shape** (Q306) — prediction 1's reversal condition measured real and not taken. **A static check must give a verdict where a run would not start**: the validator accepts a region inside a map region and the driver refuses it (Q160), and the first cut THREW there — *total over what the validator accepts* is the obligation, not *total over what runs*. **Read the run's three roads before requiring a key**: `certain()` was written from the document (an `end`, an `optional`) and `JP-R12` loses a branch by a person's `failed` and a policy's early fire too — the conformity reader's paper derivation, not a probe, found the unsafe direction. **A `needs` over a map item composes per element, as the run does** — the adequacy reader's constructed route with no mutation, the case W74's sample-and-diff loop meets first. **Five ways to be lenient for zero under twelve controls**: v0.17's enumeration clause names the set as the enumeration, and the author's controls were fact 3's, written before the clause. **A rung of runs cannot see a driver a harness never holds**: `runtime.start` builds and starts in one call, so *the same driver then started* is L2's claim and the spec had put it on L6. **Q272's shape twice in the author's OWN suite on the day it was written**: an assertion at module scope is a crash, not a failure, and rule 8 found both by reading its own crash lines. **Three lists for one driver field** — `RN-R13`'s ratchet at L2, `NOT_RUN_STATE` and `DRIVER_FIELDS` plus the pinned literal at L6 — each fired in turn (Q217's shape, three edits for one field). **Every new published module reaches `deno.json`'s allowlist, and every new check-free item still reached README, AGENTS and examples/README**: the seeded table predicted two of twelve. **`doc/workflow.md`**: no change proposed; two more instances of Q272 and one of Q217 recorded in their rows for P19's retro.

**Questions raised.** [Q305](../questions/q305.md) (the relation's stated leniency), [Q306](../questions/q306.md) (the subset cannot say `additionalProperties: <schema>`; the check carries the record's shape), [Q307](../questions/q307.md) (a refused driver stays subscribed — and, from the adequacy reader, is a value `createRuntime`'s caller never holds). **Resolved**: [Q300](../questions/q300.md) (road B) and [Q301](../questions/q301.md) (the verdict names the sample's source). **Extended**: [Q302](../questions/q302.md) (the code made to keep the bound; the wiring check as its second observer), [Q263](../questions/q263.md) (one type at every arity for `$sum([*.score])`, three for `*.score`; the record at arities 2 / 1 / 0), [Q186](../questions/q186.md) (the boundaries priced once per run), [Q272](../questions/q272.md) (two more instances, in this item's own suite), [Q217](../questions/q217.md) (three lists for one field). Q308-Q309 reserved and unused. **ADR 0057 not taken** — decision 5 plus `FD-R4`'s text plus `RS-R1`'s contract. **Predictions**: 1 HOLDS (no extension to the subset; its reversal condition measured real — Q306); 2 CONFIRMED on the shipped tree AFTER the conformity reader — the first cut threw on two valid documents, so *total* was true of the corpus and false of the validator's language until the reader read it; `unchecked` is a fifth kind for an absent schema, never a *cannot tell*, and a passing transform is *the sample passed*.
