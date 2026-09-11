# W59 — What a node type is

**Status:** todo
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
   wording that would close the door to [Q251](../open-questions.md)'s transform.
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

- **A `transform` on a typed node** — P17's, [Q251](../open-questions.md). This item's only
  obligation to it is `FD-C5`'s wording.
- **Input and output schemas, and edge compatibility** — P18's. A node type here says nothing
  about what its worker expects or returns.
- **Per-variant pools** — the road not taken, [Q250](../open-questions.md). Recorded in ADR 0049
  with its cost; issuing it is W60's third condition.
- **Node type versioning** — [Q249](../open-questions.md), raised here and not decided.
- **A visual editor or `fyflow-react-components`' envelope** — `doc/concept.md` section 7 and
  [Q21](../open-questions.md). The registry is what such a thing would consume; this item builds
  the registry and says nothing about a UI.
- **`map-with-context`, `map-over-region-output` and every other corpus flow** — unchanged by name.

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint` and `npm run typecheck`, redirected and read by `$?` (section 4, v0.16). The new sub-path must pass all five typechecks, including `typecheck:browser`, because the scheduler ships a `browser` export condition (P16 fact 5) |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, redirected and read by exit code. Baseline **27 files / 703 cases in five runtimes** at `8550978`, plus W58's and this item's suites |
| L4 | `npm run check:spec` — three more definition refusals under `C4`, `spec/README.md`'s row moved with the document's version under `C8` |
| checks | `npm run check:source` — `S6` sees the new files in `deno.json`'s allowlist; whatever `S7` became in W57 must accept `src/scheduler/**` and still refuse a working-tree reach. `npm run check:docs` — the new AGENTS.md section's `run` snippet executes |
| L6 | `npm run test:l6` and `npm run test:l6:deno`. Baseline **1061 / 42**; this item adds the exit-artifact rows and states the new numbers in its Record, taken on the tree it ships; the two P12 map rows at their P15 numbers |
| revert costs | three runs of L6 with each of W57, W58 and W59 reverted in turn, from this item's tree, each read by exit code and by its failure count |
| conformity reader | spec first, code second, re-deriving `FD-C5` and the three refusals from the new section before reading the code |
| adequacy reader | **in an isolated copy**, with the author's tree held still (section 6, v0.15); the discriminating pair — two settings, two answers — has its DIFFERENCE asserted, and the reader is asked whether collapsing it costs anything |

**Rule 8 obligation (a) at v0.16.** The fixtures include a typed task at the top level, a typed task
inside a `fanout` branch, and a typed `map` branch at arity three — the last because a map instance
receives its own item as `input` under `JP-R11` and the envelope must wrap that, not the map node's
value.

**Routing coverage.** A nested fan-out ([Q6](../open-questions.md)) **is covered** by the
fanout-branch shape. `user_action` ([Q17](../open-questions.md)) **is covered** by the retrying
typed node, whose role is non-optional. A branch routed away from its join
([Q4](../open-questions.md)), no matching decision edge ([Q10](../open-questions.md)) and a
duplicate task id ([Q13](../open-questions.md)) are **not applicable** — a type changes what a node
receives and what pool runs it, never an edge or an id.

**Before this item is done it greps the tree for `W59`** outside `doc/` — at this declaration that
returns **0** hits.

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0-L6 | | |
| L4 and checks | | |
| revert costs | | W57 / W58 / W59, in L6 failures |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| ADR 0049 | | |
| `NodeType` and `Registry.nodeTypes` | | |
| `type`/`settings` and `FD-V32`-`FD-V34` | | |
| `FD-C5`, the envelope | | |
| `fyflow-orchestration/scheduler` | | |
| the exit artifact in both runtimes | | |
| the three revert costs | | |
| AGENTS.md section 3 and the new section | | |

**What broke.**

**What this taught.**

**Questions raised.**
