# W59 — What a node type is

**Status:** done — 2026-09-12, author pass, both readers, the re-run with their edits checked in, the gate
**Plan:** [P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)

```
Spec:       spec/flow-definition.md sections 2, 3, 5 and 7, and a NEW
            section for node types that this item writes; spec/runtime-targets.md
            section 4 for what the new sub-path may import
Owns:       src/definition/**, src/driver/**, src/scheduler/** (new),
            index.ts, package.json (the sub-path export), deno.json (the
            publish allowlist and the export), spec/flow-definition.md,
            spec/README.md, spec/examples/**, test/**, examples/**,
            AGENTS.md section 3 and one new section,
            doc/decisions/0049-*.md
Inputs:     P16 decisions 2, 4, 5 and 6, read from the PLAN's own file;
            fact 2 (an unknown group id is silently ignored) re-run from
            dev-dist/p16/facts.mjs; ADR 0048 (W57) - the sub-path may import
            the scheduler; W58's TaskFactory, Registry.groups and passthrough;
            ADR 0040 rule 6 (an untyped node receives EXACTLY what `needs`
            describes); JP-R11 (each branch its own copy); ADR 0046 rule 3
            (a region's collection is released when its join is terminal);
            doc/workflow.md v0.16 rule 8 obligation (a) - the SHAPES.
Outputs:    (1) ADR 0049 - what a node type is: a registry entry naming a
                worker, pool defaults, resource groups, a global config, a
                per-node settings VALIDATOR and the envelope; the per-variant
                pool road recorded as not taken, with its cost (Q250)
            (2) `NodeType` and `Registry.nodeTypes` in src/definition/types.ts
            (3) `type` and `settings` on a `task` node - and on a `map`'s
                branch task - with refusals: an unknown type (FD-V32), a
                settings value the type's validator refuses (FD-V33), and
                `type` declared beside `workerType` (FD-V34); ids confirmed
                against section 5 at this item's start
            (4) the ENVELOPE as FD-C5, defining `input` as THE VALUE THIS NODE
                RECEIVES - never as "what `needs` composed" - so P17's
                transform slots in between without rewording the rule
            (5) `fyflow-orchestration/scheduler`: the bootstrap helper that
                turns a registry into `workerPools` and `resourceGroups`,
                wraps the type's worker to unpack the envelope, and compares
                `Registry.groups` to the groups it built BOTH WAYS
            (6) the EXIT ARTIFACT: two typed nodes of ONE type with DIFFERENT
                settings on real workers in BOTH L6 runtimes, each worker
                receiving `{ settings, input }` and computing a different
                answer from `settings`, one of them retrying once under a
                policy the type declares, both holding a group the type
                declares - with the shapes obligation (a) asks for: a typed
                task inside a `fanout` branch and a typed `map` branch
            (7) what reverting W57, W58 and W59 EACH costs, in L6 failures
            (8) AGENTS.md: section 3's kind table gains `type`/`settings`,
                and a new section describes the registry and the helper with
                a `run` snippet that validates a typed flow and a `check`
                snippet that shows the bootstrap
Depends on: W58
Blocks:     nothing
Tests:      expected values from spec/ and ADR 0049, never from output.
            Negative controls: delete the envelope and the worker reads its
            settings as `undefined` (the L6 row's answers collapse to one
            value); point the helper at a registry with no group and the
            both-ways comparison must fail; make the two settings EQUAL and
            the row must FAIL, because whatever makes a discriminating pair
            differ is itself a claim (v0.13 change 3).
Gate:       L0-L6 in five runtimes, check:spec, check:source (S6 on the new
            sub-path), check:docs, then spec-conformity pass (two readers)
Reserves:   Q259-Q262, ADR 0049
```

## Scope

**In**

1. **ADR 0049.** A node type is a registry entry: `{ name, worker, pool, groups, config, settings,
   envelope }`, where `worker` and `pool` are what the bootstrap helper hands `WorkerManager`,
   `groups` are ids the registry declares (W58's set), `config` is the pool's global config, and
   `settings` is a **validator**, a function in the registry exactly as a predicate is. **The
   settings SCHEMA LANGUAGE is not this item's** — a declared, portable schema is P18's subject
   in *Slices beyond this plan*, and inventing one here would decide P18 from the convenience of
   W59. The validator is what keeps `FD-V33` decidable at instantiation without a schema language.
2. **The definition stays data and names no file.** `type: "score"` and `settings: {...}` on a task
   node; the worker, the pool and the groups are looked up by name at construction (P16 decision 4).
   A bare `workerType` node is a degenerate type and **every existing corpus flow is unchanged** —
   that is a hard constraint, measured by L1-L5 at the pre-item counts before this item's suites are
   added and by `map-with-context` and `map-over-region-output` at the numbers P15 left them.
3. **The envelope is the TYPE's contract, and ADR 0040 rule 6 is untouched.** A typed node's
   worker receives `{ settings, input }`, where `input` is exactly what `needs` describes or the
   ordinary edge carries. An untyped node receives what it always has, with no wrapper and no
   reserved key. **`FD-C5` defines `input` as *the value this node receives*** and is refused any
   wording that would close the door to [Q251](../questions/q251.md)'s transform.
4. **The bootstrap helper is a sub-path of this package**, legal since ADR 0048, and its
   `deno.json` allowlist entry is checked by `S6`. It is the one place in the published package that
   constructs a scheduler object; `src/driver/**` still constructs none, and `createTask`'s default
   from W57 is what the helper hands the driver. **Obligation (e) both ways**: the helper compares
   the registry's declared groups to the groups it built, in both directions, because fact 2 says
   the scheduler will not.
5. **The exit artifact and its three revert costs.** P16's headline number is what reverting each
   item costs at L6, from a baseline of **1061 assertions over 42 real runs**; W59 states all three,
   taken on the tree it ships, and the plan's Record quotes them from here.

**Out** — named rather than left implicit, with where each goes instead

- **A `transform` on a typed node** — P17's, [Q251](../questions/q251.md). This item's only
  obligation to it is `FD-C5`'s wording.
- **Input and output schemas, and edge compatibility** — P18's. A node type here says nothing
  about what its worker expects or returns.
- **Per-variant pools** — the road not taken, [Q250](../questions/q250.md). Recorded in ADR 0049
  with its cost; issuing it is W60's third condition.
- **Node type versioning** — [Q249](../questions/q249.md), raised here and not decided.
- **A visual editor or `fyflow-react-components`' envelope** — `doc/concept.md` section 7 and
  [Q21](../questions/q21.md). The registry is what such a thing would consume; this item builds
  the registry and says nothing about a UI.
- **`map-with-context`, `map-over-region-output` and every other corpus flow** — unchanged by name.

## Exceptions

Files edited outside `Owns` and outside section 1 rule 5's record step, each named with its reason
**before it was edited**. The first five were foreseeable from W58's own exceptions table and from
what a sub-path export and a typed task reach; the table is appended to if a late one arrives.

| path | why |
|---|---|
| `scripts/check-spec.mjs` | `C7` reads every valid task's `workerType` against `registry.json`; a typed task has none and names its pool by `type`, so the clause is wrong about `typed.flow.json` the moment it exists. `C7` gains a `type`-against-`nodeTypes` clause and an `FD-V32` refusal-case clause, mirroring `FD-V5`'s |
| `scripts/check-spec-selftest.mjs` | rule 7: the two new `C7` `fail()` sites get a probe and a `META` entry each, and the header's site count moves |
| `scripts/check-docs.mjs` | the new `AGENTS.md` section imports `fyflow-orchestration/scheduler`, and the extractor rewrites only the root specifier; the sub-path needs its own rewrite. `RUN_FLOOR` rises by one for the section's `run` snippet, on Q102's ratchet |
| `scripts/check-docs-selftest.mjs` | rule 7: a probe for the sub-path rewrite |
| `scripts/check-markdown.mjs` | **predicted, and it did NOT fire**: `M4`'s two-directory fixture was measured at **3537** against a floor of **3960** before any document was written, a margin of 423 links; W58 alone moved it by 430 with the same document shapes this item writes. On the final tree the fixture is **3591** — a margin of 369, this item having moved it by 54 — because its prose landed under `doc/work-items/` and `doc/decisions/`, which the probe cuts. The file was not edited; the row stays as the record of a prediction that was checked rather than assumed ([Q142](../questions/q142.md)) |
| `spec/outcome-record.md` section 4 | **predicted, W58's first exception**: W54's suite re-derives the corpus split on every run, and this item's one corpus flow and two L6 flows move it |
| `spec/run-state.md` section 7 | **predicted, W58's second exception**: the same count's third copy, in the present tense |

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint` and `npm run typecheck`, redirected and read by `$?` (section 4, v0.16). The new sub-path must pass all five typechecks, including `typecheck:browser`, because the scheduler ships a `browser` export condition (P16 fact 5) |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, redirected and read by exit code. Baseline **29 files / 746 cases in five runtimes** at `f329620`, the tree this item started on *(this read 27 / 703 at `8550978`, P16's declaration figure, until the item re-took it — W58's conformity reader's finding on W58's own table, reproduced here and corrected at the start rather than by a reader)*, plus this item's suites |
| L4 | `npm run check:spec` — three more definition refusals under `C4`, `spec/README.md`'s row moved with the document's version under `C8` |
| checks | `npm run check:source` — `S6` sees the new files in `deno.json`'s allowlist; whatever `S7` became in W57 must accept `src/scheduler/**` and still refuse a working-tree reach. `npm run check:docs` — the new AGENTS.md section's `run` snippet executes |
| L6 | `npm run test:l6` and `npm run test:l6:deno`. Baseline **1203 assertions over 44 real runs in both runtimes** at `f329620` *(1061 / 42 at `8550978`, as first written; W57 and W58 added 142 between)*; this item adds the exit-artifact rows and states the new numbers in its Record, taken on the tree it ships; the two P12 map rows at their P15 numbers |
| revert costs | three runs of L6 with each of W57, W58 and W59 reverted in turn, from this item's tree, each read by exit code and by its failure count |
| conformity reader | spec first, code second, re-deriving `FD-C5` and the three refusals from the new section before reading the code |
| adequacy reader | **in an isolated copy**, with the author's tree held still (section 6, v0.15); the discriminating pair — two settings, two answers — has its DIFFERENCE asserted, and the reader is asked whether collapsing it costs anything |

**Rule 8 obligation (a) at v0.16.** The fixtures include a typed task at the top level, a typed task
inside a `fanout` branch, and a typed `map` branch at arity three — the last because a map instance
receives its own item as `input` under `JP-R11` and the envelope must wrap that, not the map node's
value.

**Routing coverage.** A nested fan-out ([Q6](../questions/q6.md)) **is covered** by the
fanout-branch shape. `user_action` ([Q17](../questions/q17.md)) **is covered** by the retrying
typed node, whose role is non-optional. A branch routed away from its join
([Q4](../questions/q4.md)), no matching decision edge ([Q10](../questions/q10.md)) and a
duplicate task id ([Q13](../questions/q13.md)) are **not applicable** — a type changes what a node
receives and what pool runs it, never an edge or an id.

**Before this item is done it greps the tree for `W59`** outside `doc/` — at this declaration that
returns **0** hits. *(**False as written, for the second item running**: at `f329620` `git grep W59 --
. ':!doc'` returns **3** — two in `CLAUDE.md`'s current-state lines and one in `README.md`, every
one the record step of W58 naming the item that comes next. W58's conformity reader found the same
sentence wrong on W58's file, at 6; this item ran the grep at its start, which is what the
procedure says to do, and recorded the number rather than the guess.)*

## Declaration step — what was measured before anything was built

Started on `f329620` (W58's commit), tree clean, no other session in the tree (last `dev-dist/`
write 08:03 against a commit at 08:10). `node dev-dist/p16/facts.mjs` under Node 24.20.0: **fact 2
reproduced** (`workerGroups: ["nope"]` → `done`, `task.running, task.completed`, nothing blocked)
and **fact 1 printed `retryPolicy,workerGroups,handleRejection,limitKey` as `unreachable` at exit 0**
on a tree that reaches two of them — [Q253](../questions/q253.md)'s fifth and sixth ways, exactly as
W58 recorded them, not patched a seventh time. Section 5's highest id confirmed **`FD-V31`**, section
3's **`FD-C4`**, so the new ids are `FD-V32`-`FD-V34` and `FD-C5`. `M4`'s two-directory fixture
measured on a scratch copy before any document was written: **3537 against a floor of 3960**, a
margin of 423 links, which W58 alone consumed. Census **200 / 147 / 2 / 51**, 0 aborts.

**Five facts measured on a real inline scheduler at 0.5.2, under Node 24.20.0 AND Deno 2.9.6, by
`dev-dist/w59/facts.mjs` (identical output in both)**, and four stop-and-ask decisions put to the
maintainer with both options priced before anything was built:

| fact | measured |
|---|---|
| A. a POOL naming an unknown group | ignored in silence, as a task's is: `done`, `task.running` alone with a resource listener attached. The bundle's `_groupsForTask` filters unknown ids from the union of task and pool groups |
| B. how a group is resolved | by the scheduler's **map key**; a group object's own `name` is inert (`keyA`/`nameB`: `workerGroups: ["keyA"]` acquires, `["nameB"]` does not) |
| C. a pool-declared group, per task | `resource.acquired@g, task.running, resource.released@g`; a wrapper script that `import()`s the type's worker in `setup()` works inline, and a non-envelope payload handed to it is a **task failure** (`failed` on an optional task) naming the pool |
| D. the same wrapper on a real THREAD | works, same events, same result — the design the helper builds |
| E. a definition mutated after `new Driver` | dispatched as mutated: `optional: true, workerType: 'ZZZ'` reached `addTask` — the driver holds it by reference |

| decision | priced | the maintainer chose |
|---|---|---|
| the envelope's key names | `settings`/`input` collide with nothing in the scheduler's vocabulary; `config`/`payload` each already name something (the pool's global config, the whole task value) | **`settings` / `input`** |
| `deno.json`'s `exports` | `deno publish --dry-run` on a scratch copy: a MAP with `./scheduler` passes and ERRORS on an exported-but-excluded module (a real check); a string leaves JSR with no sub-path; `S6` forces the allowlist entries either way | **an `exports` map** |
| a node's own `retryPolicy` beside its type's | node > type > driver default, whole (one sentence, one L2 case per shape) against refusing the node's (a rule clause, no per-node override); `workerGroups` has no merge either way — a type's are the pool's, unioned by the scheduler | **node > type > default** |
| a refused settings value reaching a worker later (fact E) | record it (Q259; prediction 3 holds; no behaviour change) against deep-copying the definition at construction (every key closed at one clone per driver; outside scope) | **record it** |

## Record

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w59/*.log`, verdict read from `$?`
(`doc/workflow.md` section 4, v0.16); rule 8's harness holds the tree still by a CONTENT DIGEST
over every tracked and untracked-unignored file (274 files), taken before the set and after every
restore. *(Author-pass numbers; re-taken after the readers at the foot of this table.)*

| Clause | Verdict | Notes |
|---|---|---|
| L0 | GREEN | `lint` 0 (62 files); `typecheck` 0 across all five sub-typechecks, `typecheck:browser` included — the sub-path bundles for the browser |
| L1-L5 | GREEN | **32 files / 835 cases in node 24.20.0, deno 2.9.6, chromium, firefox and webkit** — from 29 / 746. **+3 files**: `test/definition/node-type.test.ts` (the three rules, every clause, on all three SHAPES; the typed corpus flow's shapes derived through `task-shapes.ts`'s new predicate, not a fourth list; `registry.json` against `corpus-types.ts` both ways), `test/driver/node-type.test.ts` (the envelope on all three shapes, `input` asserted as a PAIR against the untyped node's whole payload, settings a copy per dispatch, the three-level merge with the triple's pairwise difference asserted, the discriminating pair, and P16 decision 4 as a byte-identical dispatch comparison for the two P12 flows), `test/scheduler/bootstrap.test.ts` (the helper through a recorder seam and once through the real `WorkerManager`, the groups both ways, and the envelope worker against a `data:`-URL inner worker in all five runtimes) — plus `test/definition/corpus-types.ts`, a helper rather than a suite |
| L4 | GREEN | `check:spec` — **7 documents, 51 examples, 99 rules**, from 47 / 95; `C4` covered **32** definition refusals; `C7` gained two clauses (a declared exception) and its self-test **26 / 25** from 24 / 23; `C8` saw `spec/README.md`'s row move to v0.17 |
| L6 | GREEN | **1280 assertions over 46 real runs in node AND deno**, from 1203 / 44 — **+77**: the typed pair row (plain, 19 + 9), the typed-regions row (region, 21 + 20), eight cross-row assertions in two blocks. **The count matched the arithmetic on the file's second run**; the first taught the pair row that a retried task acquires its pool's group once per ATTEMPT (Q262) |
| checks | GREEN | `check:docs` 0 — **25 snippets, 20 `run`**, section 13's `run` snippet validating a typed flow and throwing on each of the three refusals, its `check` snippet importing the sub-path through the new rewrite; `check:source` 0 over **16** published files (`S6` sees the three new files in the allowlist); `check:markdown` 0 — 109 documents / 4846 links / 249 anchored; `check:policies`, `check:wiring`, `check:scheduler` 0; `check:docs:selftest` **19 / 10** from 18 / 10 |
| rule 8, author pass | **93 probes: 1 control green, 80 caught, 9 declared ceilings each RUN against its rung, 3 revert measurements, 0 undeclared, 0 aborts, 0 crashes, 0 against declaration — on the final pass** | `dev-dist/w59/rule8.mjs`. **The first pass read 1 CRASH and 1 AGAINST DECLARATION, and both were the instrument**: `e6` (`nodeTypes` dropped from the driver's options) took ladder L6 down with ZERO FAIL lines, because the row loop had no per-row catch — W58's recorded shape, closed here (see *What broke* 1); and `b9`/`e9` re-TAGGED section 13's `run` snippet rather than deleting it, so `X2` caught the throws where the floor was the clause named — the probes rewritten to delete the fenced block whole, after which `b9` is `X4` and `e9` is the declared Q102 ceiling |
| revert costs | **W57: 88 · W58: 11 · W59: 10** L6 failure lines, node | W57 = the default `createTask` swapped for `(c) => c` (every row's two ADR 0048 rule 5 observers, 44 rows); W58 = both passthroughs deleted (retry 1, group 2, the typed pair row 1 — `high`'s retry rode on W58's passthrough — cross-row 4, gate 3); W59 = a typed node dispatched untyped (typed 1, typed-regions 1, **cross-row 5**, gate 3 — half the number is the cross-row layer, which the first draft of this note did not mention; the conformity reader) |
| conformity reader | **12 findings / 2 blocking** | Spec first, code second; every expected value of the three refusals, `FD-C5` on the three shapes and both L6 rows re-derived on paper before any test was read — **and they matched, to the key and the key order**. **Blocking 1**: `AGENTS.md` section 3 said *29 refusals over `FD-V1` … `FD-V31`* twelve lines below the kind table this item rewrote to cite `FD-V32`-`FD-V34` — nothing compares that sentence to anything (the thirteenth-plan `doc/` check, refused again), corrected. **Blocking 2**: `examples/README.md` said **1277** where the file it describes declared 1280 — written in the hour before block (2c) landed, section 1 rule 5's WHEN clause on a document this item owns; corrected. Non-blocking, all closed: section 13 named P17 and P18 in the wrong order; `package.json`'s sub-path `types` path was in a different `dist/` layout from its `.js` paths (one layout now — and nothing builds `dist/` at all, pre-existing, Q252's neighbourhood); the Record carried only the pre-item census; the W59 revert note omitted that half its 10 were cross-row; *five* facts where the ADR's table has four; `type: 5` → `FD-V21` and *both* `FD-V32` and `FD-V33` on one node were asserted and unstated (stated now); *plain object* was stronger than the predicate (the limit stated, ADR 0002 rule 1's); the status header still read `todo`; a doubled dash. **Every number confirmed** by re-running the read-only rungs and reading the logs; `Owns` audit **nothing** outside `Owns`, the six declared exceptions and the record step; digest `5d7b138cc2e3db9e` unmoved through the read |
| adequacy reader | **37 mutations + 1 control / 20 caught / 12 vacuous as predicted / 4 BLOCKING**, in the isolated copy, green at start and at end | **None of the four was reached by the author's 93 probes**, and each is one direction the author's set never took. **B1**: the helper's both-ways group check had NO falsifier for the claim it exists for — every fixture had map key == the group object's own name, so a helper checking the inert NAME (ADR 0049 fact 2 says the scheduler reads the KEY) survived L1 AND L6; closed by a fixture whose key differs, and L6's type group is now registered under a key that is not its name. **B2**: `FD-C5` enumerates FOUR kinds of `input` and the suites instantiated three — a driver handing a typed JOIN SUCCESSOR `{}` instead of `JP-R12`'s collection cost 0 at L2 and L6 while the clean tree demonstrably produced the collection there; closed by a fourth shape in `task-shapes.ts`, both suites and the corpus flow (`publish` typed), **obligation (a)'s shapes clause on the rule's own enumeration, one shape past the three the item had chosen** — L1-L5 **835 → 858**. **B3**: the driver's construction loop over `nodeTypes` was bounded by one-entry fixtures; the malformed type is SECOND now. **B4**: ADR 0049 rule 5's second half — *the pure entry does not export the helper* — was bound by NOTHING: `export * from './src/scheduler/index.ts'` appended to `index.ts` was green at `check:source` (`S7` permits the bare specifier anywhere since ADR 0048), L1, lint, all five typechecks AND the browser bundle; closed by an L1 assertion over the root's exports. **Non-blocking, taken**: `ACCEPTED` bounded; an arrow-default fixture for the wrapper's prototype clause; a type whose `settings` is NOT a function refused at construction naming the TYPE rather than as *the validator THREW* on every node; the three map instances' inputs asserted distinct FROM THE RUN (+1 cross-row, **1281**). **Recorded**: a group is acquired once per ADMISSION and not per retry — measured on a threaded pool at `maxThreads: 2` with no retry, `acquired, released, acquired, task.running, released`, so **Q262's mechanism was wrong as first written** and the typed rows' `heldGroups` are a property of an inline pool with no contention; the envelope worker on a real thread at `maxThreads: 1` is green in BOTH runtimes; section 13's `check` snippet is deletable for zero (`RUN_FLOOR` counts `run` snippets only); the L2 pair's two halves are both the driver's; (2c)'s third clause reads a path SUFFIX; five vacuous clauses stated. **Overlap 1** — the `package.json` sub-path entry, reached from opposite ends (two layouts; a suffix-only clause) — the **thirty-fourth** measurement, inside the 0-4 band, neither reader primed |
| re-run, tree held still | **103 probes: 88 caught, 1 control green, 10 declared ceilings each RUN, 1 threaded measurement, 3 revert measurements, 0 undeclared, 0 crashes, 0 against declaration, 1 abort re-anchored and then caught** | the author's 93 plus the readers' ten exact edits (`r1`-`r10`) — all eight adequacy edits CAUGHT by the test each forced, the threaded flip MEASURED at 1 as the reader found, the conformity finding DECLARED as the `doc/` limit it is. **`d2` ABORTED on the re-run**: its anchor was the L2 shapes array's tail, and the fourth shape moved it — rule 7 (b) firing correctly, the harness undoing what it had applied (digest unchanged), re-anchored on the new tail and caught. Digest `08f8313723a8844b over 274 files` before and after every batch |
| revert costs, on the tree that ships | **W57: 88 · W58: 11 · W59: 11** | W59 rose 10 → 11: the new distinct-inputs clause reads the typed instances' results and goes red when the envelope is gone |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL, 15 chain entries — on the FIRST run over the final tree** | redirected to `dev-dist/w59/gate.log` and read from `$?`; content digest **`610f08437f4d163f over 274 files`** before and after, identical. 32 / 858 in node, deno and chromium (firefox and webkit at 858 by `test:browser:all`, same directory); L6 **1281 / 0 in both runtimes**; spec 7 / 51 / 99; markdown 109 documents, 4866 relative links, 250 anchored; docs 25 / 20; **selftests 7/7 completed, 7 ok, 499.8 s wall** (Q179's band) — `check:markdown` **37/37, 7/7** (so [Q142](../questions/q142.md) did NOT fire: on a scratch copy of the final tree the two-directory fixture is **3591 against 3960**, a margin of 369 — this item's link-dense prose landed in `doc/work-items/` and `doc/decisions/`, and the second `removes` probe cuts the latter), `check:docs` 19/19, `check:spec` 26/26 · 25/25, `check:source` 41/41, `check:scheduler` 41/41, `check:wiring`, `check:policies` 13/13. **`W59` outside `doc/`: 108 hits in 23 files, every one this item's own annotation or a record-step index line** (3 at `f329620`). Diff: 30 files changed, 1404 insertions, 129 deletions, plus 14 untracked, every one `i/lf w/lf`. This row and two index counts are the edits after the gate's digest |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| ADR 0049 | `doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md` — four measured facts (the declaration's five, C and D being one ADR row), four priced decisions, seven rules, the per-variant road as Q250 | `b1`: `M1` and `C5` — nine links from four documents |
| `NodeType` and `Registry.nodeTypes` | `src/definition/types.ts`; `nodeTypesOf`, `effectiveSettings`, `settingsProblem` in `validate.ts` shared by the validator and the driver | `b2` (typecheck, two files); `a3` (absent read as unchecked); `adj1` (the option beside the one read) |
| `type`/`settings` and `FD-V32`-`FD-V34` | the key table (`workerType` optional in shape, `FD-V23` for neither, `FD-V34` for both), the three rules, three invalid cases, `typed.flow.json` on all three shapes, `registry.json`'s `nodeTypes` resolved by `corpus-types.ts` | every clause `a1`-`a13`; the shapes `a14`, `a15`; the corpus `b3`-`b7`, `adj3`, `adj4`, `e8` |
| `FD-C5`, the envelope | section 3's row; `dispatch` wrapping `{ settings: cloneValue(effectiveSettings(node)), input: payload }` for a typed node and nothing for an untyped one | `c5a`-`c5e` at L2 and L6; the shapes `a16`, `a17`; the row `b5` |
| `fyflow-orchestration/scheduler` | `src/scheduler/{index,bootstrap,envelope-worker}.ts`; both manifests export it; the allowlist carries it | `h1`-`h7`, `w1`-`w6`; `b8`, `b12`-`b14` (the L6 clause (2c) is the only reader of the manifests' entries — measured green everywhere before it existed) |
| the exit artifact in both runtimes | rows `typed` and `typed-regions`, `NODE_TYPES` in `run-flow.ts` handed to the helper AND the driver, the `typed` role, `heldGroups` and `schedulerPools` on the report | `b10`, `b11`, `e5`-`e7`, `p1`, `d6`; the pair `p1`; `c2c`, `c4c` |
| the three revert costs | this table's row | `rev57`, `rev58`, `rev59` — printed by the harness beside the declaration |
| AGENTS.md section 3 and the new section | the kind table's `task` row; section 13 with a `run` and a `check` snippet | `b9` (the floor), `e4` (the rewrite), `e9` (declared: Q102) |

**What broke.**

1. **Ladder L6 CRASHED with zero FAIL lines on this item's own wiring probe, and the harness is
   what was wrong.** With `nodeTypes` dropped from the driver's options, `new Driver` threw
   `FD-V32` inside `runFlow`, the row loop had no catch, and `npm run test:l6` exited 1 with no
   failure line — a crash, not a detection, in the rung whose job is to detect. W58 recorded the
   same shape (`groups` misspelled on the harness) and left it; this item closed it: a thrown run
   is a FAIL line naming the row and the error, and the remaining rows are not run, because the
   cross-row layer indexes reports by row and a missing one would be a second crash further down.
2. **Two probes were CAUGHT for the wrong reason, and reading the failure LINES is what said so.**
   `b9` and `e9` re-tagged section 13's `run` snippet `check` to simulate deleting it; `X2` fired
   on the throws a check snippet may not carry, so the floor — the clause each probe named — was
   never exercised. Both rewritten to delete the fenced block whole (a helper reads the block by
   its first line), after which `b9` is `X4`'s floor and `e9` — the floor lowered in the same
   edit — is the declared Q102 ceiling it was written to be.
3. **A retried task acquires its pool's group once per ATTEMPT.** The typed pair row expected
   `high` to have held `scorer` once and read `['scorer', 'scorer']` on its first run: the
   scheduler's retry re-enters admission. The row now expects two, with the reason beside it, and
   it is [Q262](../questions/q262.md) — the scheduler's reference does not say it.
4. **The bootstrap suite's browser run failed on a path that is true in Node and Deno and false in
   a bundle.** `ENVELOPE_WORKER_URL` ends in `/src/scheduler/envelope-worker.ts` where
   `import.meta.url` is the module's; in the browser bundle it is the bundle's, so the worker
   resolves beside the bundle. Narrowed to the file name, and recorded as
   [Q261](../questions/q261.md): a bundled consumer ships the envelope worker as a sibling asset.
5. **`check-spec`'s `C7` was wrong about the corpus the moment `typed.flow.json` existed**: it read
   every valid task's `workerType` against `registry.json`, and a typed task has none. A declared
   exception before the file was written; `C7` gained a `type`-against-`nodeTypes` clause and an
   `FD-V32` refusal-case clause, each with a probe and a `META` entry, and the header's site count
   moved 25 → 27.
6. **The L6 roles clause read `typed` as a role `ROLES` declares and nothing uses**, because the
   typed pool is not a `pool()` line: its role is in the `NODE_TYPES` literal's `config`. The
   source-text reading now takes both, which is the same correction the group reading took for the
   helper's group literal.
7. **Two cross-row subject strings no longer matched their widened labels** — W58's group subject
   and this item's retry subject — and `CROSS_ROW_SUBJECTS` said so on the first run, which is
   exactly what that list is for.
8. **The `deno.json` edit was first written with `JSON.stringify` and reflowed every compact key
   into a 31-line diff**; restored and re-applied by hand as two edits.
9. **W54's corpus split moved for the second item running, and this time it was predicted**: three
   flows with fourteen task nodes and no `needs` take it to **14 of 150, 136 (91%)**; all three
   copies (`spec/outcome-record.md`, `spec/run-state.md`, Q239) moved together, both spec
   documents having been declared as exceptions before the flows were written.
10. **The helper's both-ways check had no fixture whose map key differed from the group's own
    name** (the adequacy reader's B1) — so the claim ADR 0049 fact 2 was measured for, *the KEY
    and not the name*, had no observer: every fixture in the tree, L1 and L6, had the two equal.
    A helper checking the inert name survived every rung. The fixture with a differing key is
    the test now, and L6 registers the type's group under a key that is not its name.
11. **`FD-C5` names four kinds of `input` and this item instantiated three** (B2). The shapes
    clause was followed — top-level, fanout branch, map branch, on every rule — and the rule's
    own enumeration had a fourth value the author's set did not range over: a join's successor.
    A driver handing it `{}` cost 0 everywhere. **W41's, W53's and P15's shape a fourth time,
    one shape past the three the item chose**; the fourth is in both suites, the helper and the
    corpus, and it moved L1-L5 by 23 cases.
12. **The driver's construction loop over `nodeTypes` was bounded by single-entry fixtures**
    (B3) — W22's loop-bounds shape in the item's own construction tests; the malformed type is
    second now.
13. **ADR 0049 rule 5's second half was a decision with no observer** (B4): `index.ts`
    re-exporting the helper was green at every rung including the browser bundle, because `S7`
    permits the bare scheduler specifier in any published file since ADR 0048 and nothing
    reads what the ROOT exports. One L1 assertion closes it.
14. **Q262 said *once per ATTEMPT* and the mechanism is *once per ADMISSION*** — the adequacy
    reader flipped the type's pool to threaded at `maxThreads: 2` and read the same doubled
    acquisition on an instance that never retried. The row, Q262 and section 13 now say
    admission, and the rows' literals are stated as a property of an inline pool.
15. **`AGENTS.md` section 3 carried the old refusal count twelve lines below the table this
    item rewrote**, and `examples/README.md` carried 1277 from the hour before the last three
    assertions landed — the conformity reader's two blocking findings, both section 1 rule 5's
    third direction and WHEN clause in documents the item owns.

**What this taught.**

- **A harness that cannot fail a row is a rung that can crash green-adjacent.** W23 and W58 both
  recorded the L6 row loop's crash shape and moved on; it took a probe of this item's OWN wiring —
  the obligation (e) instance nearest to hand — to make closing it cheaper than recording it a
  third time. The fix is six lines.
- **A probe that simulates a deletion by a cheaper edit measures the cheaper edit.** Re-tagging a
  block is not deleting it, and the exit code cannot tell the two apart; the failure line can, and
  did — P9's *for the reason it names* on this item's own set, twice in one pass.
- **The envelope worker makes L6 blind to a third key the DRIVER adds, by design.** The wrapper
  hands the inner worker exactly two keys, so the worker's `keys` observer sees the wrapper's
  contract and not the driver's; a third key is caught at L2 and nowhere on real workers. That is
  where P17's transform will land, and it is recorded as `c5`'s declared ceiling rather than
  repaired: the observer is in the right place for the rule it observes.
- **Three readings of one registry, none a literal beside another**: the documents' `type` names,
  the object the driver was handed, the literal as source text, and the pools the scheduler
  reports — and `c2c` measured that the source-text reading is what catches a runtime literal
  going stale, which W58's `groupIds` shape predicted.
- **The shapes clause asks for a SET, and the set is the rule's own enumeration — not the
  author's.** This item enumerated three shapes because v0.16 says to instantiate more than one
  value of each kind, and `FD-C5`'s row lists four values of the kind it ranges over. The author
  read the clause as *more than one* and the reader read it as *every one the rule names*; the
  second reading found a hole the first could not. For P16's retro: where a rule enumerates its
  own shapes, the set is that enumeration, and a fixture chosen from a shorter list is W41's
  finding at its fourth iteration.
- **A fact measured for a decision needs a fixture that is only true under that decision.** Fact 2
  (key, not name) was measured, written into the ADR and the spec, and then every fixture made the
  two equal — so the decision was recorded and unobserved. *A measurement is not a test until a
  fixture depends on it.*
- **A decision about what a module does NOT export has no observer by default.** `S7` binds what
  a published file may import; nothing binds what `index.ts` re-exports, and a re-export is one
  line. The root-export assertion is the cheapest form; a `check-source` clause would be the
  other, in a file this item does not own.
- **The readers' split held for the thirty-fourth time**: the conformity reader found claims
  that were false (a count, a number written an hour early, an order, a layout, a word); the
  adequacy reader found bounds that were not there (a fixture, a shape, a loop, an export).
  Overlap 1, from opposite ends.

**Questions raised.** [Q259](../questions/q259.md) (the definition held by reference — the road a
refused settings value takes to a worker), [Q260](../questions/q260.md) (a type name colliding
with a bare pool key), [Q261](../questions/q261.md) (the envelope worker in a bundle),
[Q262](../questions/q262.md) (a group acquired once per attempt). [Q239](../questions/q239.md)
extended with the corpus split. **ADR 0049 taken; W60 not issued.**
