# P16 — What is a node type, and what does the library owe the scheduler to have one?

**Status:** COMPLETE and RETRO'D — retro run 2026-09-12, `doc/workflow.md` to [v0.17](../workflow.md), three changes adopted and five refused; see *Retro* in the Record. *(The paragraph below is the status line as the items closed, kept as the plan's own record.)* **[W57](../work-items/w57-the-scheduler-is-a-dependency.md) is DONE**
(2026-09-11, [ADR 0048](../decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md);
its three stop-and-ask items were answered *exact pin*, *`deno.json` gains the `jsr:` import and the
L6 map stays — W60 not issued*, and *`S7` narrowed*; Q71 resolved, Q252-Q253 raised), **[W58](../work-items/w58-what-a-node-says-about-its-own-task.md) is DONE** (2026-09-12, **no ADR** — decision 3 is the decision; its three stop-and-ask items were answered *exact shape*, *no `defaultWorkerGroups` — W60's second condition does not fire*, and *strict: an absent registry set is empty*; Q256-Q258 raised, Q253 extended, Q16's task half landed; prediction 2 CONFIRMED — the first non-zero `attempts` a scheduler set at any rung, on a `map` of three) and **[W59](../work-items/w59-what-a-node-type-is.md) is DONE** (2026-09-12, [ADR 0049](../decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md); its four stop-and-ask items were answered *`settings`/`input`*, *an `exports` map with `./scheduler`*, *node > type > driver default, whole* and *record the by-reference road, Q259*; Q259-Q262 raised, Q239 extended; prediction 3 CONFIRMED — every refusal an `FD-V`, the envelope an `FD-C`, no `FD-R`; W60 not issued, ADR 0050 skipped) — **all three items are done and the plan's RETRO is next**. Declared 2026-09-11 on
`8550978`, the commit that carried this file as a draft, after
[P15](p15-what-a-run-retains-and-what-a-result-may-be.md) completed and its retro moved
`doc/workflow.md` to [v0.16](../workflow.md). *(This read "No item has started" until W57 closed.)*
*(Drafted the same morning on
`82ff3ba` while P15 was in flight, re-verified on `b317486` after it closed, committed as a draft so
its decisions lived in a plan rather than a transcript, and declared here.)* *Read every status from
the item's own file, never from this line.*

**Baseline:** `8550978` — `doc/workflow.md` [v0.16](../workflow.md), **P1-P15 complete and retro'd,
no plan running**, tree clean, `npm run gate` `GATE EXIT=0` with zero lines beginning `FAIL`, 15
chain entries — see *The baseline this plan starts from*. *(This paragraph read *"SERIAL AFTER P15 —
W53 measures the driver"* while P15 was in flight; P15 closed the same day, so the serial constraint
is discharged and every fact below was re-taken against the tree it left.)*

**The question in one sentence.** A flow names a worker pool by a string and hands it a payload,
and that is the whole of what a node can say about the thing that runs it: no retry policy, no
resource group, no per-node settings, no statement of what the worker expects or returns. **A node
type** is the layer that would carry all of that — and it cannot be built while `src/` is forbidden
to import the scheduler it would configure.

**Exit artifact:** one flow on a real `FyflowScheduler` in **both** L6 runtimes, where two nodes of
**one** node type run with **different settings**, one of them **retries once** under a policy the
node declares, both hold a **resource group** the type declares, and the worker receives its settings
and its input as **one envelope** — with what reverting each of the three decisions costs, measured
in L6 failures.

**Reserves:** W57-W60 (W60 expected unused), Q248-Q262, ADR 0048-0050 (0050 expected skipped).
*Derived from P15's line — `W53-W56, Q233-Q247, ADR 0046-0047` — and confirmed against what P15's
retro wrote into `doc/README.md` on closing: "The next plan starts at W57, Q248 and ADR 0048." The
register's highest row is Q246, Q247 is spent and not reused, and ADR 0047 was skipped, so the three
blocks are free.*

---

## Why this plan, and why now

**Three things a flow author wants are unsayable today, and each was found by trying to say it.**

1. **A node cannot declare how it fails.** `retryPolicy` is a per-task field the scheduler has
   carried since 0.2.1 and the driver never sets it: `dispatch` hands `createTask` exactly four
   fields — `id`, `workerType`, `payload`, `optional` (`src/driver/driver.ts:1839`). `optional` is
   the one scheduler task field a node *can* set, and it is the precedent this plan generalises.
   [Q16](../questions/q16.md) has asked who owns retry since P1 and has no owner.
2. **A node cannot carry configuration.** A `task` node has six keys and `FD-V17` refuses a seventh.
   The only per-task channel to a worker is `payload`, so today "one worker, two configurations" is
   spelled as two `workerType`s with two pool `config`s — which is exactly how `examples/` runs nine
   roles through one worker file. That works for a harness and does not scale to a library whose
   consumers write flows.
3. **Nothing says what a worker expects.** The scheduler's contract is `run(payload: any)`, and the
   library's `workerTypes` registry checks a *name*. [W43](../work-items/w43-the-two-blocked-flows-on-real-workers.md)'s
   first flows ran on real workers and every map instance scored **zero**, because every shipped
   worker read `payload.confidence` and under a `needs` the payload is exactly the composed object —
   green at every rung. That is the defect a declared input shape refuses at construction, and it
   is **out of this plan** (see *Slices beyond this plan*), because it needs the layer this plan
   builds first.

**And the wall in front of all three is a decision whose forcing fact expired.**
[ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rule 1 says the published library depends on the scheduler *not at all*, and `S7`, `S8` and `S9` in
`scripts/check-source.mjs` refuse the import, the manifest entry and the bundle. Read its context
section: the fact that forced it was **context fact 1, the pinned version was on no registry** —
0.3.0 existed only in a sibling working tree, so a runtime dependency was undeclarable and a
`peerDependency` was rejected as *"a false statement in a manifest"*. That fact expired on
2026-08-31, and [ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
superseded rules 3 and 5 on exactly that ground while leaving rule 1 standing as if it had been
independent. Context fact 2, that Node could not load the source, expired at 0.5.2
([S9](../scheduler-upstream.md)). **Rule 1 is the last clause of that ADR resting on nothing it was
decided on**, and a node type that defines its worker, its pool and its resource groups is
scheduler-specific code by construction. Deciding this is the plan's first item, not a side effect
of its third.

> **Corrected by [W57](../work-items/w57-the-scheduler-is-a-dependency.md), 2026-09-11, on its
> conformity reader's finding.** ADR 0013 does NOT ground rule 1 on context fact 1. Its stated
> ground is context fact 4 — *nothing in the published source may import it, and nothing does*,
> because ADR 0001 rule 2 and `RT-R2` "already imply it" — and its Consequences PREDICT that when
> the pin reaches a registry *"rule 3 becomes a version range and rules 1, 2 and 4 are unchanged"*,
> which ADR 0029 then did; so 0029 followed 0013 rather than leaving something standing. What fact
> 1 forced was the shape of the ALTERNATIVE (a peer was *a false statement in a manifest* because
> nobody could install the version), not the rule. **The claim the rule protected is the one in
> 0013's Consequences — *"a driver that can construct a scheduler is a driver that will"* — and
> [ADR 0048](../decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
> answers that claim on ADR 0001's own terms** rather than resting on an expiry. The paragraph
> above is left as written because three of its measurements are right and W57 acted on it; its
> argument is not.

**Why now.** P15 answered what a run *retains*
([ADR 0046](../decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md))
and what a result *may be* (`OR-R11`, `OR-R12`); this plan answers what a node *is*. Nothing here
depends on P15's answer, and two of its results are inputs: a result crosses the listener boundary
as a **value** (`OR-R11`), which is what a typed node's declared shapes will range over, and a
region's collection is **released when its join becomes terminal** (ADR 0046 rule 3), which is why
a transform on a join's successor is the last thing that sees the collection whole. One thing P15
names as its own follow-on — [Q219](../questions/q219.md), making a region's collection referenceable
— is untouched by this plan.

## What was measured before this plan was drafted

**Five facts, first taken read-only on `82ff3ba` with the tree held still, and RE-TAKEN at this
declaration on `8550978` by `dev-dist/p16/facts.mjs`, which prints every number below and is the
file an item re-runs rather than transcribes.** All five reproduced. *(The draft's harness was two
files in a session scratchpad outside the repository; section 6's held-still rule is why the draft
ran neither `npm run gate` nor rule 8's set, because P15's W53 was taking its own baseline in the
same tree at 09:44. P15's three items then moved `src/driver/driver.ts` by 166 lines and none of the
four fields `dispatch` hands `createTask`; the line numbers below are the post-P15 ones, and
`facts.mjs` derives them rather than quoting them.)*

**1. The driver hands the scheduler four fields and the scheduler accepts eight.** `TaskFactory`'s
parameter type is `{ id, workerType, payload, optional }` (`src/driver/driver.ts:430`, and the one
call site at `:1839`). `new
FyflowTask(config)` at 0.5.2 destructures `{ id, workerType, payload, optional, retryPolicy,
workerGroups, handleRejection, limitKey }` (`dist/types/core/FyflowScheduler.d.ts:98`). **Four of
the eight are unreachable from a definition**, and they split three ways: `retryPolicy` and
`workerGroups` are **static per node**; `limitKey` is **per workload** — a bucket for a keyed rate
limit, a tenant id — so it cannot be a literal in a document and belongs to the `needs` grammar if
it belongs anywhere; `handleRejection` is **irrelevant**, because the driver routes on events and
never awaits the task promise.

**2. An unknown resource-group id on a task is SILENTLY IGNORED by the scheduler.** Measured: a
`FyflowScheduler` with one `ConcurrentLimitGroup` named `g`, one inline pool, and a task carrying
`workerGroups: ["nope"]` — `addTask` does not throw, no `resource.blocked` fires, the task runs and
settles `done` with `task.running, task.completed`. **So a typo in a group id is caught by nothing
downstream**, and the only place it can be caught is a registry the validator checks at
instantiation — the third set beside `predicates` and `workerTypes`, which
[ADR 0002](../decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 3 already prescribes for exactly this shape of error. *(The scheduler's own reference says
`workerGroups` is "added to the pool's groups"; it does not say what an unknown id does. Now it is
measured.)*

**3. [Q71](../questions/q71.md) reproduces at 0.5.2, and it is the DOM lib alone.** *(The closing
sentence of this fact — *an `import type` closes it by construction* — was measured FALSE by W57: the
import alone changes nothing about assignability, and what closes Q71 is `SchedulerLike`'s listener
parameter, `object`; the type import survives as an L0 assertion. ADR 0048's Q71 table.)* `const x:
SchedulerLike = s` with `s: FyflowScheduler` typechecks under `lib: ["ES2022"]` and fails under
`["ES2022", "DOM"]` with `TS2322` on `addEventListener`: the DOM `EventListenerOrEventListenerObject
| null` parameter is not compatible with `(e: { detail: unknown }) => void`. `AGENTS.md` section 12
documents the cast and calls it *"a defect in our type, not in yours"*. **An `import type {
FyflowScheduler }` in `src/` closes it by construction, and `S7` forbids that import today.**

**4. The reference already contradicts itself about the version, twenty-one sections apart.**
`AGENTS.md` section 1: *"Install whichever version you like."* Section 12: *"Pin the scheduler at
0.5.2. This library's listener boundary is written against 0.3.0 semantics."* Both sentences are in
the copy a consumer reads first; the second is bound by `check-scheduler`'s `D7` and the first by
nothing. The driver **is** version-sensitive — `task.progress`'s detail shape, the `user_action`
event pair, `task.timestamp` — and the honest statement of that sensitivity is a peer range in the
manifest a consumer's installer reads, which rule 1 forbids.

**5. The scheduler's browser export condition exists and `S9`'s own correction note says so.**
`node_modules/fyflow-scheduler/package.json` exports `.` with `node` and `browser` conditions at
0.5.2, and ADR 0013's correction of 2026-08-30 records that esbuild resolved the browser build into
the test bundle at 55 KB *"happily"*. **So the bundle argument for rule 1 was never about
feasibility** — a scheduler import in `src/` bundles for the browser today — only about the package
being dependency-free, which fact 4 says it already is not in substance.

**What was NOT measured, and is the first item's declaration step:** what a `peerDependency`
costs at L1-L6 (predicted zero, prediction 1); whether `import type` alone satisfies `deno check`
and the browser typecheck; and how many of the 66 `createTask` call sites outside `dev-dist/` (8 in
`AGENTS.md`, 44 across `test/**`, 1 in `examples/run-flow.ts`, the rest prose) change when the
factory gains a default — counted by `grep -c` this session, and the number is a claim about
occurrences, not sites.

## Scope

**In**

1. **Whether the scheduler is a dependency, decided as ADR 0048 superseding ADR 0013 rule 1.** A
   `peerDependency` on `fyflow-scheduler` with a range, `import type` in `src/` first and a runtime
   import for a default `createTask` second, `SchedulerLike` **kept** as the L2-L5 test seam, and
   `S7`/`S8`/`S9` narrowed to what still holds — the browser bundle must still not carry a *working
   tree*, and `deno.json` must still not map a path. Q71 closes; `AGENTS.md` section 12's cast
   paragraph is deleted rather than apologised for.
2. **A node's task configuration**, as declared keys on a `task` node mirroring `optional`:
   `retryPolicy` and `workerGroups`, passed through `createTask`, each with an `FD-V` refusal and a
   fixture, and a `groups` set added to `Registry` so fact 2's silent typo fails at instantiation.
   A driver-level `defaultRetryPolicy` a node overrides, with the merge rule in `spec/`. **This is
   Q16's task half**; the flow half — re-dispatching a node under a new attempt — stays open.
3. **A node type, decided as ADR 0049.** A registry entry that names a worker, pool defaults,
   resource groups, a global config, a per-node **settings** schema and a **payload envelope**; a
   `task` node that names a type instead of a `workerType` and carries `settings`; and a bootstrap
   helper — permitted by (1) — that turns a registry into `workerPools` and `resourceGroups`.
   `Registry` gains `nodeTypes`. A bare `workerType` node is a degenerate type and is **unchanged**.
4. **The exit artifact** on real workers in both L6 runtimes, and what reverting (1), (2) and (3)
   each costs.

**Out** — named rather than left implicit, with where each goes instead

- **Input and output schemas, and edge compatibility.** The most valuable piece and the one that
  turns W43's zero-score flow into a refusal. It needs a schema language, a decidable subtyping
  relation, a rule per `needs` form, and its own ADR — **P17**, in *Slices beyond this plan*, with
  the reason it is not here: this plan's exit artifact must run on real workers inside the plan-gate
  budget, and a type checker over the definition doubles the item count.
- **A per-node INPUT TRANSFORM** — an expression on the receiving node, declared in the flow
  rather than in the type, mapping what `needs` composed into what the worker receives. Its own
  plan, ordered **before** the schema plan in *Slices beyond this plan*, because it is the adapter
  that makes strict compatibility livable without a reshaping task node. **What this plan owes it
  is one wording**: W59's `FD-C5` defines the envelope's `input` as *the value this node receives*
  and names no expression, so a transform slots in between composition and the envelope without
  rewording the rule. [Q251](../questions/q251.md).
- **Run-time validation of a result against a declared schema.** The strict-mode plan's, priced there.
- **`limitKey`.** Per workload, so a `needs`-shaped reference and not configuration — fact 1. A row
  in the register, no owner.
- **Flow-level retry** — Q16's other half, and the task id's fourth segment
  ([Q111](../questions/q111.md)). Untouched: scheduler retries happen inside one task id and are
  reported on the outcome record's `attempts`, which is the field this plan's exit artifact makes
  non-zero at L6 for the first time.
- **[Q19](../questions/q19.md) and [Q22](../questions/q22.md)** — RESOLVED by P15 (ADR 0046 and
  W54's `OR-R11`); this plan cites them and reopens neither. **[Q219](../questions/q219.md)** — named
  by P15 as its own follow-on.
- **Per-join policy choice, cancellation, durability** — `AGENTS.md` section 11's list, unmoved.
- **`fyflow-react-components`' event envelope** ([Q21](../questions/q21.md)). A node type registry
  with schemas is what a visual editor would consume, and `doc/concept.md` section 7 names a visual
  editor a non-goal. This plan builds the registry and says nothing about a UI.

## Decisions taken before fan-out

*Section 7 rule 3: decide, then fan out. Q1, Q2 and Q4 are resolved. Each decision below was taken
by the maintainer in conversation on 2026-09-11 and is recorded here so an item argues from it
rather than re-deriving it; the two that are architectural become ADRs inside the items that
measure them.*

1. **The scheduler is a hard dependency, and the refusal is counterproductive.** The maintainer's
   words. ADR 0048 records the decision with the measurement, on the shape of ADR 0029 and the S9
   note: the forcing fact expired, here is what changing it costs *(W57 measured that the ADR has
   to answer ADR 0013's actual ground — ADR 0001's separation — and does; see the correction under
   *Why this plan*)*. **The structural seam survives**:
   `SchedulerLike` is what makes L2-L5 run against fakes, and that is a testing decision the manifest
   never touched. **Stop-and-ask:** the peer *range*. `^0.5.2` says "any 0.x above 0.5.2", which is
   false the day upstream changes an event shape again with no changelog; an exact pin in a
   `peerDependency` is unusual and honest. W57 prices both and asks.
2. **Per-node settings reach the worker as an ENVELOPE, and it is the TYPE's contract.** A typed
   node's worker receives `{ settings, input }`, where `input` is exactly what `needs` describes or
   the ordinary edge carries. **ADR 0040 rule 6 is untouched for an untyped node**: no wrapper and
   no reserved key on a payload whose shape the author owns. The envelope is a rule about what a
   *type* receives, stated in `spec/` as an `FD-C` rule beside `FD-C1`, and the alternative — one
   pool per distinct settings variant, settings delivered as pool `config` — is recorded in ADR 0049
   as the road not taken, with its cost: pool capacity per variant rather than per type. **That
   `FD-C` rule defines `input` as *the value this node receives* and not as *what `needs`
   composed*** — so a later transform ([Q251](../questions/q251.md)) sits between the two without
   rewording the rule, and W59 is refused a wording that would close that door.
3. **Task configuration is DECLARED KEYS, not an opaque bag.** A `task: {...}` object forwarded to
   `createTask` untouched would be a hole where a typo lives until run time, which is ADR 0002
   rule 3's defect and `FD-V17`'s whole job. The coupling to the scheduler's field names exists
   either way; declaring them makes it visible. One `FD-V` per key.
4. **The node type is a REGISTRY entry and the definition stays data.** `type: "score"` and
   `settings: {...}` on a task node; the worker, the pool and the groups live in the registry the
   consumer passes to the driver, exactly as predicates and worker types do today. **The definition
   never names a file or a URL.** A bare `workerType` node keeps working with no change to any
   corpus flow, and that is a hard constraint on W59: every existing L6 row keeps its numbers.
5. **The bootstrap helper is a separate module of the same package**, not a separate package.
   Decision 1 makes it legal; a sub-path export (`fyflow-orchestration/scheduler`) keeps the pure
   half importable without it. **Stop-and-ask:** whether the JSR publish allowlist in `deno.json`
   should carry it — `S6` compares that list to the tree.
6. **No new node kind.** A typed node is `kind: "task"` with `type` in place of `workerType`; a
   `map`'s branch may be a typed task. `FD-V17`'s key table gains the keys and nothing else moves.
   Prediction 3.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [W57](../work-items/w57-the-scheduler-is-a-dependency.md) | **The scheduler is a dependency — ADR 0048.** `peerDependencies`, `import type` in `src/driver/driver.ts`, a default `createTask` of `new FyflowTask(config)`, `S7`/`S8`/`S9` narrowed with their probes and `META` entries repointed, Q71 closed, `AGENTS.md` section 12 rewritten and the `check` snippet that needed the cast made a `run` one | `package.json`, `deno.json`, `src/driver/**`, `scripts/check-source.mjs`, `scripts/check-source-selftest.mjs`, `scripts/check-scheduler.mjs`, `spec/runtime-targets.md`, `AGENTS.md` §1 and §12, `doc/decisions/0048-*` | P15's driver items merged | L0-L6 in five runtimes at the declared pre-item numbers; `check:source:selftest` at its new probe count; the section 12 snippet **executed** under `tsconfig.docs.json` with `lib: ["ES2022", "DOM"]`, which is the configuration fact 3 fails in today; rule 8 over every narrowed clause |
| [W58](../work-items/w58-what-a-node-says-about-its-own-task.md) | **What a node says about its own task.** `retryPolicy` and `workerGroups` on a `task` node, `FD-V30`-`FD-V31` (ids confirmed against `spec/flow-definition.md` section 5 at the item's start, `FD-V29` being the highest at declaration), `Registry.groups`, `defaultRetryPolicy`, `TaskFactory` widened, the driver passing both through, corpus fixtures valid and invalid | `src/definition/**`, `src/driver/driver.ts` (the `dispatch` site and `DriverOptions` only), `spec/flow-definition.md` §2 §5 §7, `spec/README.md`, `spec/examples/**`, `test/definition/**`, `test/driver/**`, `examples/**` (the two L6 rows and the retrying role), `AGENTS.md` §3 | W57 | L1-L5 with the new refusals fixtured; **an L6 row where a worker role fails once and succeeds on retry, `attempts === 1` on the outcome record, the first non-zero `attempts` a SCHEDULER has ever set at any rung** (L1's `log.test.ts` feeds 2 and 3 from fixtures); an L6 row where a task carrying a group is `resource.blocked` behind a `ConcurrentLimitGroup(1)` the row holds; rule 8 obligation (e) on `Registry.groups` both ways |
| [W59](../work-items/w59-what-a-node-type-is.md) | **What a node type is — ADR 0049.** `NodeType` and `Registry.nodeTypes`; `type` and `settings` on a task node with `FD-V` refusals for an unknown type, a settings object the type's VALIDATOR refuses (a registered function, as a predicate is — the schema LANGUAGE is P18's), and `type` beside `workerType`; the envelope as `FD-C5` (`FD-C4` being the highest at declaration); the bootstrap helper as a sub-path export; the exit artifact | `src/definition/**`, `src/driver/**`, `src/scheduler/**` (new), `index.ts`, `package.json` (the sub-path export), `deno.json` (allowlist and export), `spec/flow-definition.md` §2 §3 §5 §7 and a new section, `spec/README.md`, `spec/examples/**`, `test/**`, `examples/**`, `AGENTS.md` §3 and a new section, `doc/decisions/0049-*` | W58 | L1-L5 in five runtimes; **L6: two typed nodes of one type with different settings on real workers in both runtimes, each worker receiving `{ settings, input }` and computing a different answer from `settings`**, with the two pools built by the helper and a group the type declared; reverting W57, W58 and W59 each measured in L6 failures; `map-with-context` and `map-over-region-output` at the numbers P15 left them (L6 closed P15 at **1061 assertions over 42 real runs**, and those two rows are unmoved by it); **and, per v0.16's obligation (a), the typed-node fixtures include a shape the feature was not built for** — a typed task inside a `fanout` branch and a typed `map` branch — not only the top-level task |
| [W60](../work-items/w60-reserved.md) | *reserved — expected unused; its three issuance conditions are in its file* | | | |

Each has its own file under `doc/work-items/`, declared with this plan. This table is an index, not
the declaration.

**Why serial and in this order.** W57 changes what `createTask` is and what `src/` may import, and
both W58 and W59 build on that; W58's passthrough of `workerGroups` is what W59's type-declared
groups ride on. Every item edits `src/driver/driver.ts`, so section 7 rule 2 makes them serial
whatever the order. **W58 before W59 rather than folded into it** because W58's exit row — a real
retry observed on the outcome record — is the smallest thing on real workers this plan can show,
and a plan whose first two items ship nothing observable is P11's shape.

## Predictions, written down before the items that test them

| # | prediction | scope of the measurement it rests on | what would reverse it |
|---|---|---|---|
| 1 | **Declaring the peer dependency costs 0 failures at L1-L6** and `import type` costs 0 at L0 in all three typechecks | fact 5, plus that `src/` reaches no scheduler *value* today; not measured under `deno check` | `deno check` refusing a bare specifier `deno.json` does not map — W57 measures it first, and if it fires the fix is an `imports` entry `S8` currently refuses |
| 2 | **W58's retry row is the first non-zero `attempts` produced by a REAL retry, at L6** | `grep -rn 'attempts' test/ examples/` on `82ff3ba`: `test/driver/log.test.ts` asserts `attempts` of **2** and **3** at L1, from **fixture** records fed to the listener, and `examples/**` carries none above 0 — so L1 already proves the field is carried through and nothing proves a scheduler ever set it. *(This row first read "the first non-zero `attempts` at any rung", written before the grep was run; the grep reversed it within the hour, which is section 1 rule 5's WHEN clause on a draft.)* | an L6 row already asserting `attempts > 0`, which the grep says there is not |
| 3 | **No new node kind and no `FD-R`** — every refusal this plan adds is an `FD-V`, and the envelope is an `FD-C` | decision 6, and fact 1's split: everything a node declares here is static | a settings value that must be resolved per workload, which would be `limitKey`'s shape and is out of scope |
| 4 | **`S7` survives narrowed rather than deleted**, refusing a *working-tree* reach and nothing else | ADR 0029's D1-D3, which refuse the same thing at the manifest and the symlink | W57 finding that D1-D3 already cover every case `S7` would keep, in which case `S7` is retired and `check:source:selftest` loses probes rather than gaining them |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| Q248 | **`limitKey` is a per-workload task field with no home.** It is not configuration and not a reference to a node; the nearest grammar is `needs`, which names a node and never a value inside one. Raised here so it is not folded into W58 by analogy with `workerGroups` | no owner |
| Q249 | **Does a node type have a VERSION, and what does a definition's `version` field mean against it?** `FlowDefinition.version` is *"author-managed; the driver does not interpret it"*. A definition valid against registry v1 may be invalid against v2, and a persisted run ([Q15](../questions/q15.md)) would need the registry version in the log | W59 raises; not decided by this plan |
| Q250 | **Per-variant pools versus the envelope: does pool capacity per settings-variant ever matter?** The road ADR 0049 does not take, recorded with its cost so the next plan that wants per-variant concurrency can price it | W59 |
| Q251 | **A per-node INPUT TRANSFORM, declared in the flow and applied in the TYPE's worker wrapper.** Not in the driver: `driver.ts` dispatches inside a listener with no `await` and `jsonata` 2.x returns a Promise, and a worker's `run()` is async by contract. The language registered by name, the core carrying no engine; a syntax error refused at construction because compilation is sync; an evaluation failure a **task failure**, with the `user_action` consequence on a non-optional node stated; **no clock, no random**, because `$now`, `$millis` and `$random` exist. Compatibility across a transform is checked by an async **pre-flight** on schema-derived samples, evidence and not proof. Not this plan's, and it reaches Q165's reducer from the successor's side | no owner — *Slices beyond this plan* item 1 |
| Q252-Q262 | *reserved for the items* | |

## Slices beyond this plan, in order

*Not declared, not reserved, and written down so the order is a decision rather than a drift.*

1. **P17 — what a node may DO to its input before its worker sees it.** A `transform` key on a
   typed `task` or `map` node, declared in the flow and **applied in the TYPE's WORKER WRAPPER, not
   in the driver** — decided by the maintainer 2026-09-11 after both placements were priced. The
   driver dispatches the envelope as `{ settings, input, transform }` exactly as W59 leaves it —
   composed at `compose` (`driver.ts:1652`) and handed over at `dispatch` (`:1818`); the
   wrapper the bootstrap helper puts around the type's worker evaluates the transform inside `run()`
   and hands the worker `{ settings, input }`. **The driver is untouched** — `src/driver/driver.ts`
   contains no `async` and no `await`, dispatch runs inside a scheduler listener in one turn, and
   `AGENTS.md` section 8's quiescent-point contract rests on that; a worker's `run()` is async by
   contract, so **`jsonata` 2.x's Promise-returning `evaluate()`** (its 2.0.0 changelog:
   *"reimplementing the evaluator to use async functions instead of generators"*; current 2.2.2,
   zero dependencies, ~834 KB unpacked) is fine there, and the per-instance cost runs in parallel
   workers rather than serially in one listener call. **The language is registered by NAME** —
   `{ lang: "jsonata", expr: "…" }`, the evaluator supplied to the bootstrap helper — so the core
   carries no engine, an unknown language fails at instantiation (ADR 0002 rule 3), and the JSONata
   adapter ships as a sub-path export on decision 5's pattern. **A parse failure is still refused at
   construction**, as an `FD-V`: `jsonata(expr)` compiles synchronously and throws on a syntax
   error, and only `evaluate()` is async. **An evaluation failure is a TASK FAILURE, not a run
   refusal** — decided with its consequence stated: it routes through `on: ["failed"]` on an
   `optional` node and **suspends as `user_action`** on a non-optional one, so the wrapper reports it
   under its own distinct error so a later plan can teach the driver to treat it as a refusal if
   that message proves wrong for the person who receives it. **Only a typed node has a wrapper, so
   only a typed node may carry a transform**, and ladder L2 cannot see it — L2 asserts on what
   `createTask` received, which is the untransformed envelope; the transform is proved in a unit
   test of the wrapper and at L6. **Exit artifact: a node consuming a join's collection through a
   transform with no reshaping task node**, which reaches [Q165](../questions/q165.md)'s refused
   reducer by a route ADR 0037 rule 5 did not close — the transform sits on the join's SUCCESSOR and
   receives `JP-R12`'s collection, so nothing about the collection's shape is decided by it. **And
   since ADR 0046 rule 3 the successor is the LAST thing that sees that collection whole**: the
   region releases it the moment the join is routed out of, after `collectArrivals` has built the
   successor's payload, so a transform there costs no retention and a later `needs` cannot reach
   what it reshaped — which is [Q219](../questions/q219.md)'s subject and stays P15's follow-on.
   **One constraint survives the placement: `$now()`, `$millis()` and `$random()` are unbound**,
   or a worker's input stops being a function of what the run produced. `doc/concept.md` section 7
   names *an expression language for decisions* a non-goal; a transform is not a decision and the
   plan says so, and a consumer who wants an expression predicate registers one by name through the
   same adapter with no library change. Cost per instance measured as
   [Q186](../questions/q186.md)'s was, in the wrapper. **JSONata is the first and only adapter, decided
   by the maintainer 2026-09-11 with the alternative priced**: CEL is the one mature expression
   language with a static type checker, but the battle-tested checker is cel-go, reachable from
   JavaScript only through a Go-to-WASM build, and every JavaScript port that carries a checker
   (`@marcbachmann/cel-js`, GRESB's `cel-javascript`, `@celjs/parser`) is young, single-maintainer or
   self-described not-for-production, while Buf's `@bufbuild/cel` is an evaluator with no checker.
   Nothing statically types a JSONata expression, so compatibility across a transform is checked by
   **samples** (item 2). **One hook is reserved so that choice stays reversible**: a language adapter
   may expose an optional `check(expr, inputShape) → outputShape`, which the pre-flight uses where
   present and falls back to samples where not — a CEL adapter that passes the conformance suite
   plugs in there with no change to the driver or the definition format.
2. **P18 — what a node type SAYS about its input and output.** Input and output schemas on a node
   type; a restricted structural schema language with a decidable compatibility relation (object
   keys with types, arrays, unions, `unknown` as the always-compatible escape); one `FD-V` per
   `needs` form — `"x"` takes x's output schema, `["x"]` an array of it, `"x?"` makes the key
   optional, a `map` instance the element type of `over`'s array, a `join` a record of branch outputs
   with **absent** keys; and `over` typed, which closes the static half of `FD-R2`. **Exit artifact:
   W43's zero-score flow refused at construction by name.** Its own ADR. Two places are forced loose
   by run-time semantics and the plan must say so: a join's record and a conditional reference.
   **And a transformed edge is checked by EVIDENCE, not by proof — a "check before run".** An
   expression's output type is not inferable, so the plan does not try: for an edge with no
   transform the checker proves `out ⊆ in` symbolically, and for an edge with one it **evaluates
   the transform on values derived from the producer's output schema** and validates each result
   against the consumer's input schema. The sample set is written from this repository's own
   run-time hazards rather than invented: the **minimal** instance (every optional key absent,
   every array empty, a join's record `{}`, which `liveToken` makes a real answer), the **maximal**
   one, and a **seeded** random set, so the check is reproducible run to run. A path typo yields
   `undefined` in JSONata rather than a throw, so it surfaces as a missing required key; a type
   error throws and surfaces as such. **It is a separate ASYNC entry point** — `await
   checkFlow(definition, registry)` — and not part of `new Driver`, because `evaluate()` is async
   and construction is not; it is the consumer's own gate, run in CI, and the reference says so.
   **What it cannot do is stated on the tin**: a conditional branch the samples never take is not
   exercised, so the verdict is *no counter-example found*, never *compatible*, and an author may
   pin a declared post-transform shape to make the edge checked by declaration instead — which is
   what the strict-mode plan then verifies at run time. The sound alternative, a type-level
   interpreter for a JSONata subset, is refused in advance with its reason: it is a second
   implementation of the language's semantics, and two implementations are two sources that can
   disagree, which is W50's finding one layer up. That is also why P17 comes first — a strict
   checker with no adapter refuses flows whose only remedy is the reshaping node ADR 0040 exists to
   remove.
3. **P19 — strict mode.** Validating a result against its declared output schema at the listener
   boundary, where `OR-R2` already clones it, and a transform's declared output against what the
   transform produced; a mismatch as a runtime refusal in `FD-R2`'s family (*the definition is valid
   and the worker is wrong*); a driver option, its cost measured the way
   [Q186](../questions/q186.md)'s was. Only after P18, because it validates against something P18
   declares.
4. **Q16's flow half**, if anything ever asks for it: re-dispatching a node under a new attempt,
   which is the task id's fourth segment and the composition Q16 warns about.

## Stop and ask a human

- **The peer range** (decision 1). Exact pin or caret. W57 prices both; the maintainer chooses.
- **How the JSR package declares the scheduler.** JSR has no `peerDependencies`; a dependency there
  is a `deno.json` `imports` entry, which `S8` refuses today and which ADR 0029 rule 2 keeps in
  `examples/deno-import-map.json` on purpose. W57 decides it inside ADR 0048 or issues W60 on its
  first condition; either way the maintainer sees it before it lands.
- **Retiring versus narrowing `S7`** (prediction 4). If D1-D3 cover it, retiring loses probes and
  a clause id cited in seven documents; narrowing keeps an id whose reason has changed. Either is
  defensible and the ADR must say which and why.
- **The envelope's key names.** `settings` and `input` are this draft's; the type's worker reads
  them by name forever after, so they are spelled once.
- **Anything that would change what a `map-with-context` or `map-over-region-output` instance
  receives.** Decision 4 forbids it; an item that finds it necessary stops.

## A note on ids

**Reserves W57-W60, Q248-Q262, ADR 0048-0050.** Derived rather than inherited: the highest work item
on disk is **W55** and **W56 was reserved by P15 and never issued**; the highest Q in the register is
**Q246** and **Q247 was reserved by P15 and unused**; the highest decision on disk is **ADR 0046**
and **0047 was skipped**. All of those are spent and not reused, so the next free triple is **W57,
Q248, ADR 0048** — which is what P15's retro wrote into `doc/README.md`, and what this derivation
confirms independently.

**Fifteen questions**, on P15's argument that the block size is set by the worse case. **Two ADRs
expected and a third reserved**: 0048 is W57's and 0049 is W59's; 0050 is taken only if W60's first
condition fires, and the plan says which rather than reserving work for it.

## The baseline this plan starts from

`8550978`, clean tree, `GATE EXIT=0`, zero lines beginning `FAIL`, 15 chain entries — the gate run
over the draft's own commit, read from `dev-dist/p16/gate-8550978.log` by exit code rather than from
a piped line (v0.16 change 1). **Every figure below was RE-TAKEN at this declaration rather than
transcribed:**

```
27 file(s), 703 assertions, in node 24.20.0, deno 2.9.6, chromium, firefox and webkit
1061 assertions at L6, 0 failed, 42 real runs, in node and deno
spec        - 7 documents, 44 examples, 92 rules
markdown    - 103 documents, 4614 relative links, 240 anchored
register    - 191 questions, 139 open, 2 deferred, 50 resolved, before this declaration's four rows
selftests   - 7/7 completed, 7 ok, 550.5 s wall, 5 lanes; check-markdown 37/37 caught, 7/7 bounded
```

**The five-runtime claim is measured, not inherited**: `npm run gate` runs `test:browser`, which is
chromium only, so `npm run test:browser:all` was run for firefox and webkit — exit 0, 27 / 703 in
each, `dev-dist/p16/browser-all-8550978.log`. **703 counts `test()` cases and 1061 counts individual
assertions ([Q98](../questions/q98.md)) — they are never added.**

**The census parser is P15's, unchanged** (`dev-dist/p15/census.mjs`), and it reproduced the
standing line exactly before this declaration's rows were written — **191 / 139 / 2 / 50, 44 ids in
both tables, 191 of 191 in exactly one cluster cell, 0 aborts**. The re-run after the four rows is
recorded in the register's own note beside them.

**[Q142](../questions/q142.md) was checked rather than assumed.** This declaration adds four
documents under `doc/work-items/`, which neither `removes` probe cuts, so `M3`'s one-directory
fixture and `M4`'s two-directory one both rise; P15's declaration retuned them to **90** and
**3490** against fixtures of 78 and 3109, and the gate over `8550978` — with this plan file already
counted — reports the `check-markdown` self-test at 37/37 caught and 7/7 bounded. The declaration's
own gate below is the measurement with the item files in.

**The declaration's own tree gates green, measured with the tree HELD STILL** — `git status
--porcelain` was written to a file before `npm run gate` started and again after it returned, and
the two are identical; the log is `dev-dist/p16/gate-declared.log`, read by exit code:

```
GATE EXIT=0, zero lines beginning FAIL, 15 chain entries
27 file(s), 703 assertions, in node 24.20.0, deno 2.9.6 and chromium
1061 assertions at L6, 0 failed, 42 real runs, in node and deno
spec        - 7 documents, 44 examples, 92 rules
markdown    - 107 documents, 4681 relative links, 243 anchored
selftests   - 7/7 completed, 7 ok, 439.5 s wall, 5 lanes (550.5 s over the draft's commit; Q179)
check-markdown self-test - 37/37 probes caught, 7/7 bounded
```

**The last line is [Q142](../questions/q142.md)'s verification**: four documents under
`doc/work-items/` took the tree from 103 to 107 and both `removes` probes still trip exactly the set
they declare, so P15's retune of `M3` to 90 and `M4` to 3490 holds with this declaration in. **No
floor was moved and no file outside section 1 rule 5's record step was edited** — the declaration's
whole diff is this plan, four work-item files, the register, and the three indexes.

## Record

*Filled in at the join, after the work items are merged.*

**Exit artifact.** EXISTS — [W59](../work-items/w59-what-a-node-type-is.md)'s two L6 rows on a
real `FyflowScheduler` in both runtimes: two nodes of ONE type (`Scorer`) with DIFFERENT settings,
each receiving the envelope `{ settings, input }` and computing a different answer from it (9 and
90 from one input), `high` retrying once under the TYPE's `retryPolicy` with `attempts: 1` on both
observers, both holding the group the type declares, read back by the scheduler's key; and a typed
task inside a fanout branch feeding a typed `map` branch at arity three. **What reverting each
decision costs in L6 failures, on the tree the plan ships: ADR 0048 (W57) 88, W58's passthrough 11,
ADR 0049 (W59) 11.** L6 is **1281 assertions over 46 real runs**, from 1061 / 42 at this
declaration.

**What the plan answered.** *(Written by W59 at its close; the retro's is the reading that
counts.)* A node type is a REGISTRY entry — worker, pool, groups, config, a settings VALIDATOR and
a retry default — named by `type` in a definition that stays data; its pool is keyed by its name;
its worker receives `{ settings, input }`; and what the library owes the scheduler to have one is
the declared dependency ADR 0048 made and the ONE sub-path that constructs scheduler objects.
Three of four predictions confirmed as written (1, 2 narrowed at the declaration, 3); prediction 4
confirmed with `S7` narrowed. Facts 1-5 all held; fact 3's mechanism was false (W57). Q71 resolved;
Q248-Q262 used but Q254, Q255 — check the register before reusing either.

## Retro

**Run 2026-09-12, after W57, W58 and W59 were merged. `doc/workflow.md` section 6 pass 3, and it
takes that document to [v0.17](../workflow.md) — THREE changes adopted, FIVE refused.**

P16 asked *what is a node type, and what does the library owe the scheduler to have one?* Three
items, six reader passes, two ADRs, and an exit artifact on real workers in both L6 runtimes. At
declaration: `spec/` **7 / 44 / 92**, L1-L5 **27 files / 703 cases**, L6 **1061 / 42**, register
**191 / 139 / 2 / 50**. It closes at **7 / 51 / 99**, **32 / 858**, **1281 / 46** and
**204 / 151 / 2 / 51**. What the library owes the scheduler is a DECLARED dependency reached by one
bare specifier (ADR 0048) and ONE sub-path that constructs scheduler objects (ADR 0049); what a node
type is, is a registry entry named by `type`, whose worker receives `{ settings, input }`.

### Name the rung, and it is this retro's shape

| | defect | rung |
|---|---|---|
| W57 | ADR 0048's supersession argument was a claim about ADR 0013 that ADR 0013 does not make | **none** — conformity reader, reading the two ADRs together |
| W57 | fields ADJACENT to the ones a check reads — `peerDependenciesMeta`, `scopes`, `"0.5.2"` in double quotes — every one green | **none** — adequacy reader; obligation (a)'s kind is *a field* |
| W57 | `createTask` ignored outright cost **0 of 705 and 0 of 1138**; a default injecting W58's two fields, green everywhere | **none** — until the item added two observers |
| W57 | a green `deno publish --dry-run` was the wrong answer | **none**, and none can be built from it ([Q252](../questions/q252.md)) |
| W57 | the declaration's facts harness read fact 1 wrong at exit 0 — and W58 found it wrong two more ways | **none** — it is untracked ([Q253](../questions/q253.md)) |
| W58 | the rule 8 harness applied only the LAST edit per file — seven probes measured that instead of the tree | **none** — reading the failure LINES against what each probe claimed |
| W58 | the same harness kept an applied edit when a later anchor failed; thirteen later probes crashed on it | **none** — `git status` cannot see a file modified either way |
| W58 | the three SHAPES were a list bound to nothing but the printed case count | **none** — adequacy reader; the item's headline claim unfalsifiable by its own suite |
| W58 | `defaultRetryPolicy` validated nowhere while a comment said the driver read it | **none** — a probe the mutations could not reach |
| W58 | a THIRD present-tense copy of W54's corpus count | **none** — conformity reader grepping the NUMBER where the author grepped the phrase |
| W58 | `M4`'s fixture rose past its floor in the item's final gate | **the gate's self-test — IT FIRED, and it was READ correctly** ([Q142](../questions/q142.md)) |
| W59 | a probe dropping `nodeTypes` took ladder L6 down with ZERO FAIL lines | **L6 — it fired as a CRASH**, which section 4 says is not a detection; the reading caught it and the row loop was fixed |
| W59 | two probes re-tagged a snippet instead of deleting it — caught by `X2`, not by the floor they named | **none** — failure lines, P9's *for the reason it names* |
| W59 | the helper's group check had no fixture whose map key differed from the group's own name — a helper checking the inert NAME survived L1 AND L6 | **none** — adequacy reader; a fact measured, written, and unobserved |
| W59 | `FD-C5` names FOUR kinds of `input` and the suites instantiated three | **none** — adequacy reader; the shapes clause's fourth iteration |
| W59 | the construction loop over types bounded by single-entry fixtures; the pure entry's non-export bound by nothing | **none** — adequacy reader, two loop-bound and wiring holes |
| W59 | `AGENTS.md` section 3's refusal count twelve lines below a table the item rewrote; `examples/README.md` an hour early | **none** — conformity reader |
| W59 | [Q262](../questions/q262.md) attributed a doubled acquisition to RETRY; it is ADMISSION | **none** — the reader flipped one pool to threaded and measured |

**Eighteen defects; TWO had a rung; both rungs FIRED and both were READ correctly** — Q142 as a red
self-test in W58's final gate, and W59's crash as *exit 1 with zero FAIL lines*, which section 4's
v0.15 clause names in so many words. P15's retro found the one rung that fired reported green twice;
this plan's two were read as what they were. **Sixteen of eighteen have no rung and every one of the
sixteen was found by a reader or by reading rule 8's failure lines** — and five of the sixteen are
in the INSTRUMENTS (two harness defects, two wrong-reason probes, a facts harness), which is where
P11 found all seven of its own.

### The three changes

1. **Rule 8's requirement on the HARNESS gains PER-EDIT integrity: every edit's anchor is checked
   against the CURRENT text, an abort UNDOES what it applied, and the tree is held still by a
   CONTENT DIGEST.** v0.11 wrote *a control, and the restore asserted*; v0.14 added *every ceiling
   run*. **[W58](../work-items/w58-what-a-node-says-about-its-own-task.md) satisfied all three
   throughout and its harness measured nothing on seven probes**: `apply()` replaced against the
   ORIGINAL bytes on every edit, so a two-edit probe kept only its last — W37's defect verbatim,
   inside a harness with a control — and, fixed, the ABORT path then kept an edit it had applied,
   so thirteen later probes crashed at load while the held-still check, a `git status` diff, saw
   nothing. **Three occurrences across two plans** (W37; W58 twice), and none of v0.11's or v0.14's
   requirements could see them, because all three are about a probe that RAN.
   [W59](../work-items/w59-what-a-node-type-is.md)'s harness carried the clause and its one abort —
   an anchor the fourth shape had moved — undid cleanly, with the digest identical.
2. **Obligation (a)'s shapes clause gains: where a rule ENUMERATES the values it ranges over, the
   set is that enumeration — not *more than one*.** v0.16 said *instantiate more than one value of
   each kind*, and W59 did: three shapes on every rule, chosen deliberately under the clause. `FD-C5`'s
   own row lists **four** kinds of `input` — the ordinary edge, `needs`, a map item, a join's
   collection — and the fourth was the one no suite instantiated; a driver handing a typed join
   successor `{}` cost **0** at L2 and L6. **W41's, W53's and P15's shape a FOURTH time, one shape
   past the three the author chose**, and W58's adequacy finding is the same lesson from the other
   side: its three-shape list was *bound by nothing but the printed case count*. Two items, one
   clause: *more than one* is a ceiling an author sets at two or three, and where the rule counts
   its own values the count is the rule's.
3. **v0.14's ceiling clause gains its DATE: a ceiling whose reason is *a literal set-equal to the
   value it replaces* is a CATCH the moment the value moves, and the item that moves the value
   re-runs it.** This retro re-ran all **twenty-three** ceilings the three items declared on the
   tree the plan ships: twenty-one hold with their reasons intact, **two are catches** — W58's `c3`
   and `c6`, literals equal to the scheduler's groups and to the task key list on W58's day, both
   moved by W59 (`scorer`; `type` and `settings`) — and two anchors had moved (`b6`, `c4`; re-anchored,
   both hold). **P13's retro found the same thing**: W45's `e4`, true when written and false on the
   tree W47 shipped. Two plans, the same class, and the retro is the wrong place to find it — W59
   edited the two values and could have run W58's eight ceilings in a minute. So: *an item re-runs
   the previous item's declared ceilings where its own edits touch the value a reason names.*

### Five refused, each with a measurement

- **A `doc/` check, the FOURTEENTH time.** W59's conformity reader found *29 refusals over `FD-V1` …
  `FD-V31`* in `AGENTS.md` section 3, twelve lines below the table the item rewrote to cite
  `FD-V32`-`FD-V34`. The number is checkable and the sentence is not: which sentences carry a count
  is unbounded, `C4` reads `spec/README.md` and `X6` reads five cost figures, and the reader found
  it by reading the two together. Same ground as the thirteen before.
- **An `Owns` pre-declaration rule, the FIFTH plan running — with a NEW datum.** Late exceptions ran
  **1, 5, 0**: W57 declared five and took one late; W58 declared none and took five, none predictable
  from a file set; **W59 declared six and took none, and two of the six were W58's late table read
  forward** — the two corpus-split documents fired exactly as predicted, and `check-markdown.mjs`,
  predicted from W58's too, did not. *What predicted W59's exceptions was the PREVIOUS ITEM's
  exceptions table, not a file list.* Recorded as a procedure worth trying (an item seeds its table
  from the item before it) and not adopted: one occurrence, and it is a claim about a plan's
  SECOND and THIRD items only ([Q157](../questions/q157.md)).
- **Tracking the declaration's facts harness, or making its facts L1 assertions.** `dev-dist/p16/facts.mjs`
  was wrong five ways across two items at exit 0 and the plan re-ran it three times; every earlier
  plan's was in the same ignored directory. Refused as a rule: a declaration instrument is the plan's
  and not the workflow's, and *make fact 1 an L1 assertion* is a per-fact call the next plan makes
  ([Q253](../questions/q253.md) stays open with that choice named).
- **A rung for `deno publish --dry-run`.** It PASSES in this repository for the wrong reason —
  `devDependencies` resolves the bare specifier to the npm build — so a rung reading its exit code
  would be green on the shape ADR 0029 refused. W59's L6 clause (2c) binds the two manifests' exports
  instead, from the files. [Q252](../questions/q252.md) stays.
- **A rule about a harness's per-row catch.** W59 closed the L6 row loop's crash shape that W23 and
  W58 had recorded; it is a fix in a file, not a rule, and section 4's *a crash is not a detection*
  is the rule that already covers it.

### The predictions: four of four CONFIRMED, and the declaration corrected one of them itself

| # | kind | verdict |
|---|---|---|
| 1 | derived | **CONFIRMED** — the peer entry and the import cost 0 at L0-L6 in every runtime, the scheduler's browser build in the bundle. **The fact under half of it was FALSE and the prediction held anyway**: fact 3's *an `import type` closes Q71 by construction* measured false at W57 (assignability does not move; the seam's `object` parameter is what closes it), and the cost was 0 either way |
| 2 | derived | **CONFIRMED, narrowed BEFORE any item ran** — the declaration's own grep reversed *first non-zero `attempts` at any rung* to *the first a SCHEDULER set* within the hour, and W58's map of three then set it. The first time a plan corrected its own prediction at the declaration step |
| 3 | derived | **CONFIRMED** — every refusal W58 and W59 added is an `FD-V`, the envelope is `FD-C5`, no node kind and no `FD-R`; the one refusal that looked like a run-time one (a type whose `settings` is not a function) lands at Driver construction, naming the type |
| 4 | **reach** | **CONFIRMED by the measurement it named** — `D1`-`D3` read no source file, so `S7` is narrowed to the FORM of the reach and keeps four of five shapes |

**Four of four, for the first time since P10 — and P10's retro's reading holds**: three are derived
from the declaration's facts and test the inference, and 4 is the one reach prediction and the only
one that could have reversed. What is new is prediction 1's shape: **a derived prediction whose
premise was false and whose conclusion was right**, the third such case after W42's ADR and P13's
prediction 3, and the first where nobody had to reverse anything — the false premise was a
MECHANISM (why the cost is zero) and the prediction was about the COST.

### v0.16's three changes, and the ceiling re-run

| v0.16 change | What would show it was wrong | **P16's verdict** |
|---|---|---|
| **Section 4: a rung is RUN, never PIPED — redirect and read `$?`** | a rung is read from a piped line again | **Right, FOLLOWED by all three items with zero occurrences, and it is what read W59's crash correctly** — `GATE EXIT`/`L6 EXIT` from a file, and *exit 1 with zero FAIL lines* was legible because nothing was piped |
| **Obligation (a) gains the SHAPES a rule quantifies over** | an author picks the built-for shape again | **Right, FOLLOWED, and NOT SUFFICIENT — extended (change 2).** W58 and W59 both enumerated three shapes deliberately under the clause; W58's list was bound by nothing but its count, W59's was one short of the rule's own enumeration. *An obligation run as a step satisfies the step* — v0.13's recorded correction, on v0.16's newest clause, twice |
| **Obligation (c)'s LIMIT: the second observer is not DOWNSTREAM of the first's apparatus** | a second observer measures the first's instrument again | **Right, and EXERCISED in W58**: `schedulerGroups` had one reading and the driver's registry was downstream of it; the fix was a second observer over the constructor call's SOURCE, which is the clause's own prescription. W59 built three readings of one registry from the start |

**And v0.14's ceiling clause, at its second full plan, yields TWO of twenty-three** (P13: two of
eleven; P15: none of twenty-four) — both the same class, and that class is change 3.

### The measurements

**Readers: six passes, none empty — 13 / 2, 12 / 2, 12 / 2 blocking, against mutation counts of
64 / 106 / 37 with 13 / 16 / 20 survivors and 5 / 3 / 4 blocking.** Overlaps **0, 1, 1** — the
**thirty-second, thirty-third and thirty-fourth** measurements, inside the 0-4 band, none primed. The
split held in all three: the conformity reader found claims that were false (an ADR's argument, a
stale 1061, seven identifiers, a third copy of a count, a section number, a refusal count twelve
lines below its table, a number written an hour early, a mechanism named wrong in a register row);
the adequacy reader found bounds that were not there (fields adjacent to the ones a check reads, the
option half of a rule no fake asserted, a shapes list bound by count, a pair of literals, a single
observer, a validator nowhere, a fixture, a fourth shape, a loop, an export).

**Rule 8 across the plan: 240 provocations, 209 caught, 24 declared ceilings all RUN, 0 undeclared
survivors, 0 against declaration on every final pass, 1 abort — on the re-run, re-anchored and then
caught.** Five instrument defects in three items, every one found by reading failure LINES: W58's two
harness defects, W59's L6 crash with zero FAIL lines and two wrong-reason probes. **Late exceptions
1, 5, 0 — six, zero undeclared.** [Q142](../questions/q142.md) fired once (W58's final gate, retuned
3490 → 3960) and was checked three times more without firing (this declaration; W59, margin 369; this retro, **3610
against 3960** on the two-directory fixture built from the tree it ships, margin 350). **Census CONFIRMED for the SIXTEENTH plan running — 204 / 151 / 2 / 51**, 0 aborts,
204 of 204 in one cluster cell; this retro raises no question.

### What the plan taught, beyond its own question

- **The scheduler's reference is silent on five facts this plan needed, and all five were learned by
  measurement**: an unknown group id is ignored at the task AND the pool level; `addTask` duck-types
  its task and runs a plain object; `resource.*` is emitted only once something listens; a group
  resolves by the scheduler's map KEY and its own name is inert; a group is acquired once per
  ADMISSION. None is a defect and none is documented upstream; they are [Q258](../questions/q258.md)
  and [Q262](../questions/q262.md) and the ADRs' fact tables, and a row in
  `doc/scheduler-upstream.md` is the next plan's call if it ever costs a consumer something.
- **A fact measured for a decision is not a test until a fixture depends on it.** Fact 2 (key, not
  name) was measured at W59's declaration, written into ADR 0049 and the spec, and every fixture in
  the tree then made key and name equal. Recorded beside change 2 rather than adopted: one occurrence.
- **A decision about what a module does NOT export has no observer by default.** ADR 0049 rule 5's
  second half — the pure entry loads no `WorkerManager` — was green under every check with the
  helper re-exported from `index.ts`, because `S7` binds imports and nothing binds re-exports.
- **The per-item numbers were right and re-taken every time**, which two plans ago was the standing
  failure; what went stale this plan was in the DOCUMENTS beside them, and the readers found all of
  it — which is the standing refusal's own evidence.

### Ids

W57-W59 used, **W60 CLOSED as reserved and never issued** (its three conditions did not fire);
Q248-Q262 used but **Q254 and Q255, spent and not reused**; ADR 0048 and 0049 taken, **0050
skipped**. **The next plan starts at W61, Q263 and ADR 0051.** Its subject is written down: P17,
*what a node may DO to its input before its worker sees it* — the transform in the envelope
worker, `FD-C5`'s wording already holding the door.
