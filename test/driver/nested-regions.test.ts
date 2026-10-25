/**
 * Ladder L2 — what a region nested inside a `map` region **CARRIES** and how it
 * **ENDS**. [W85](../../doc/work-items/w85-what-a-nested-region-carries-and-how-it-ends.md)
 * under [P22](../../doc/plans/p22-what-a-regions-identity-is.md).
 *
 * [W84](../../doc/work-items/w84-what-a-regions-identity-is.md) made the shape RUN:
 * a region instance is `(opener node id, the opener's own branchPath)`
 * ([ADR 0062](../../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)),
 * so a `map` may enter one opener once per item. **This file is the half W84 edited
 * and did not drive.** P22 fact 5 states the gap: the change touches `branch.lost`,
 * `branch.suspended` and `branch.resumed` and drove none of them, and *a mis-keyed
 * exit fires the outer join early or hangs it, and no typechecker can see that,
 * because the key is a string either way.*
 *
 * **The gap is SIX sites at zero, not three, and W85's declaration step measured
 * which.** Forced to `'-'` for any nested instance, each of these cost ZERO failures
 * at L1-L5 on the tree this file starts from:
 *
 * | site | cost before this file |
 * |---|---|
 * | `branch.suspended`'s `regionPath` | **0** — the only map that parks a branch (`map-fanout`) opens at top level, where `rpathOf` is `'-'` anyway |
 * | `branch.resumed`'s `regionPath` | **0**, for the same reason |
 * | `firedAdd` at the `unsatisfiable` exit | **0** — [Q95](../../doc/questions/q95.md)'s precondition one key deeper |
 * | `releaseArrivals` at the `unsatisfiable` exit | **0**, same precondition |
 * | `firedAdd` at the `satisfied` exit | **0**, same precondition |
 * | `JP-R10`'s `branch.lost` at **N = 0**, the ENCLOSING region's path | **0** — the only N=0 nesting in the tree has a top-level enclosing map |
 *
 * And two that are **already bound**, recorded so the set is not read as wider than
 * it is: `branch.lost`'s own `regionPath` costs **7** (the L5 `nested-inner-lost`
 * row and `test/matrix/chain.test.ts`, whose regions are `fanout`-nested at path
 * `'1'`), and `JP-R10`'s emission at the `unsatisfiable` exit costs **1**.
 *
 * **Every expected value here comes from the DOCUMENT and from `spec/`, never from a
 * run:**
 *
 * | what | from |
 * |---|---|
 * | every region instance's key | [ADR 0062](../../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md) rule 1 and `spec/task-id.md` section 1: the opener's own `branchPath`, innermost segment last |
 * | every collection's key set | `JP-R12` — *one entry per branch that emitted `branch.arrived`*, in ascending segment-wise-numeric order, a lost or routed-away branch having **no** key |
 * | `branch.lost` at N = 0 | `spec/join-policy.md` section 5's ruling and `JP-R10` |
 * | the run outcomes | `RN-R10`'s ordering — `stuck` over `failed` over `completed`, and a lost branch is a `pathEnded` with `no-eligible-edge` |
 *
 * **What is NOT here, with where each goes.** No L6 row, no `examples/**`, no worker
 * and nothing in the CONSUMER reference (`AGENTS.md`) — all of that is W86's, whose
 * own file does not exist yet, so [P22](../../doc/plans/p22-what-a-regions-identity-is.md)'s
 * work-item table is what names it. L6 is UNMOVED by this item, which is its declared
 * result. *A `needs` IS exercised here, in the last suite* — what is out is the
 * reference a consumer reads. Retention per INSTANCE is
 * `test/driver/retention.test.ts`'s, because that file owns the walk.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { JoinPolicy, Region } from '../../src/driver/policy.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';

const EX = `${ROOT}spec/examples`;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as {
  workers: Record<string, { url: string }>;
  nodeTypes: Record<string, { worker: string }>;
  pools: Record<string, { type: string }>;
};
const registry = { predicates: [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools };

/** The whole scheduler, for level 2. It queues nothing and runs nothing. */
class FakeScheduler {
  readonly added: { id: string; workerType: string; payload: unknown }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void {
    this.added.push(task as { id: string; workerType: string; payload: unknown });
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  settle(id: string, state: 'done' | 'failed' | 'user_action', over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', detail);
    else {
      this.fire('task.failed', detail);
      if (state === 'user_action') this.fire('task.user_action', detail);
    }
  }
  private fire(type: string, detail: unknown): void {
    for (const fn of this.listeners.get(type) ?? []) fn({ detail });
  }
}

function harness(def: FlowDefinition, policy: JoinPolicy = liveToken as JoinPolicy) {
  const scheduler = new FakeScheduler();
  const events: RegionEvent[] = [];
  const failures: { kind: string; message: string }[] = [];
  const unsatisfiable: { fanoutId: string; regionPath: string; joinId: string }[] = [];
  const driver = new Driver(def, {
    runId: 'r1',
    scheduler,
    createTask: (c) => c,
    predicates: new Map(),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
    joinPolicy: policy,
    onRegionEvent: (e) => events.push(e),
    onUnsatisfiableJoin: (i) => unsatisfiable.push(i as { fanoutId: string; regionPath: string; joinId: string }),
    onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
  });
  return {
    scheduler, driver, events, failures, unsatisfiable,
    ids: () => scheduler.added.map((t) => t.id),
  };
}

type H = ReturnType<typeof harness>;

/** What the node RECEIVED — the envelope's `input` (every task node is typed since v0.19, `FD-C5`). */
const inputOf = (t: unknown): unknown => (t as { payload?: { input?: unknown } } | undefined)?.payload?.input;

/** What a task with that id was dispatched with. */
const receivedBy = (h: H, id: string): unknown =>
  inputOf(h.scheduler.added.find((t) => t.id === id));

/**
 * Every region event as `type region@instance branch`, which is the one projection
 * in which a mis-keyed instance is READABLE. `regionId` alone cannot show it — it
 * is unchanged in value by ADR 0062 rule 3 — and `branchPath` alone cannot either,
 * because a branch path is correct whichever instance the event was filed under.
 */
const trace = (h: H): string[] =>
  h.events.map((e) => `${e.type.replace('branch.', '')} ${e.regionId}@${e.regionPath} ${e.branchPath}`);

/**
 * A copy of a document with one node's `needs` replaced. Used only by the
 * visibility suite's two controls, so that each control differs from the row it
 * guards in EXACTLY the reference and in nothing else — a second hand-written
 * document would differ in whatever the author retyped.
 */
const withNeeds = (def: FlowDefinition, nodeId: string, needs: unknown): FlowDefinition => ({
  ...(def as unknown as { nodes: unknown[] }),
  nodes: (def as unknown as { nodes: { id: string }[] }).nodes
    .map((n) => (n.id === nodeId ? { ...n, needs } : n)),
} as unknown as FlowDefinition);

/** `joinSettled` inputs, as `region@instance:fired` — one per instance, by `JP-R12`'s *at most once*. */
const joinSettlements = (inputs: readonly FoldInput[]): string[] =>
  inputs.filter((i): i is Extract<FoldInput, { kind: 'joinSettled' }> => i.kind === 'joinSettled')
    .map((i) => `${i.regionId}@${i.regionPath}:${i.fired}`);

/**
 * A policy that behaves as `live-token` everywhere EXCEPT one named opener, where it
 * answers `verdict` the moment that region instance sees its first terminal event.
 *
 * **Why a policy rather than a shape.** [Q95](../../doc/questions/q95.md)'s
 * precondition is *a policy that settles a join before every branch is terminal*, and
 * no shipped policy does — which is why the `at most once` latch's TOO-WEAK direction
 * was bound by nothing at instance granularity. It is built here rather than shipped,
 * which is exactly what W18 did for the depth-1 case and what the register's row says
 * is not a feature.
 *
 * **Scoped to one opener on purpose.** An eager policy applied to every region turns
 * the OUTER join into a second early fire, and then a doubled inner settlement and a
 * doubled outer one are indistinguishable in the outcome. Scoping it makes the
 * enclosing region an ordinary `live-token` region, so what moves is the inner
 * instance and nothing else.
 */
function eagerFor(opener: string, verdict: 'satisfied' | 'unsatisfiable'): JoinPolicy {
  type S = { target: boolean; terminals: number; inner: unknown };
  const lt = liveToken as JoinPolicy;
  return {
    id: `w85-${verdict}-at-${opener}`,
    open: (region: Region): S => ({ target: region.fanoutId === opener, terminals: 0, inner: lt.open(region) }),
    step: (s: S, e: RegionEvent): S => ({
      ...s,
      terminals: s.terminals + (e.type === 'branch.arrived' || e.type === 'branch.exited' || e.type === 'branch.lost' ? 1 : 0),
      inner: lt.step(s.inner, e),
    }),
    status: (s: S) => (s.target ? (s.terminals >= 1 ? verdict : 'waiting') : lt.status(s.inner)),
    describe: (s: S) => (s.target ? { w85: verdict, terminals: s.terminals } : lt.describe(s.inner)),
  } as unknown as JoinPolicy;
}

/* -------------------------------------------------------------------------
 * The documents. Each is written once and its region instances derived ON PAPER
 * beside it, because every expected value below is read from that derivation.
 * ---------------------------------------------------------------------- */

/**
 * **A `fanout` inside a `map` — Q160's own document, with the inner branch made
 * `optional` so its failure is a LOST branch rather than a run failure.**
 *
 * ```
 * ingest -> split(map over items, branch lead)
 *   lead -> f2(fanout [p, q]) ; p, q -> j2(join of f2) -> collect(join of split)
 *   collect -> publish -> done
 * ```
 *
 * | node | region chain | its own `branchPath` at two items |
 * |---|---|---|
 * | `split` | — | `-` (top level) |
 * | `lead` | `[split]` | `0`, `1` — the ITEM INDEX (ADR 0036) |
 * | `f2` | `[split]` | `0`, `1` — so `f2` has TWO INSTANCES |
 * | `p`, `q` | `[split, f2]` | `0.0` / `0.1` and `1.0` / `1.1` |
 * | `j2`, `collect`, `publish` | `[split]`, —, — | joins are not members of their own region |
 *
 * So the region instances are **`split@-`, `f2@0`, `f2@1`** — three, over two
 * openers — and that is what every assertion in this file is derived from.
 */
const FANOUT_IN_MAP = {
  flowId: 'w85-fanout-in-map', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'items', branch: 'lead' },
    { id: 'lead', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'f2' }] },
    { id: 'f2', kind: 'fanout', branches: ['p', 'q'] },
    { id: 'p', kind: 'task', type: 'ScoreWorker', optional: true, edges: [{ to: 'j2' }] },
    { id: 'q', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j2' }] },
    { id: 'j2', kind: 'join', of: 'f2', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/**
 * **`FANOUT_IN_MAP` with an `end` INSIDE the inner region, and a TASK after the inner
 * join.** Two additions to one document, each closing a gap the base fixture cannot:
 *
 *   - `bail` makes **`branch.exited`** reachable at a map instance. It is the SIXTH
 *     event of `spec/join-policy.md` section 2 and the last one W85 did not drive:
 *     like `branch.lost`, its `regionPath` is bound under `fanout` nesting (the L5
 *     `nested-inner-all-exit` row, whose regions sit at path `'1'`) and by nothing
 *     under a `map` instance. **The `end` is INSIDE `region(f2)`**, which is what
 *     section 2 means by *exited* — not *left the region*.
 *   - `after` is what makes the `at most once` latch's failure REACHABLE AS A COST.
 *     In the base document the inner join routes into another JOIN, so a doubled fire
 *     records a second arrival and mints no task; with a task there it mints the same
 *     id twice and `ID-R1` stops the run. *The same defect is silent or loud depending
 *     on what the join's successor is*, which is why this is a second document rather
 *     than another settlement order on the first.
 */
const FANOUT_IN_MAP_WITH_EXIT = {
  flowId: 'w85-exit-in-map', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'items', branch: 'lead' },
    { id: 'lead', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'f2' }] },
    { id: 'f2', kind: 'fanout', branches: ['p', 'q'] },
    { id: 'p', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'bail', on: ['failed'] }, { to: 'j2' }] },
    { id: 'q', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j2' }] },
    { id: 'bail', kind: 'end', outcome: 'branch-abandoned' },
    { id: 'j2', kind: 'join', of: 'f2', edges: [{ to: 'after' }] },
    { id: 'after', kind: 'task', type: 'MergeWorker', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** Settle `ingest` and both `lead` tasks, leaving the four inner branches in flight. */
function openTwoInstances(h: H, items: string[] = ['a', 'b']): void {
  h.driver.start({});
  h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items } });
  for (let i = 0; i < items.length; i++) h.scheduler.settle(`r1:lead:${i}:0`, 'done', { result: { i } });
}

/**
 * **Depth THREE, with a collection at every level.** W84 asserted the KEYS at this
 * depth; this document is what asserts what each level CARRIES.
 *
 * ```
 * ingest -> A(fanout [b0, b1])
 *   b0 -> jA
 *   b1 -> M(map over items, branch mid) ; mid -> F(fanout [p, q])
 *   p, q -> jF(join of F) -> jM(join of M) -> jA(join of A) -> publish -> done
 * ```
 *
 * | node | region chain | its own `branchPath` at two items |
 * |---|---|---|
 * | `A` | — | `-` |
 * | `b0`, `b1` | `[A]` | `0`, `1` |
 * | `M` | `[A]` | `1` — one instance |
 * | `mid` | `[A, M]` | `1.0`, `1.1` |
 * | `F` | `[A, M]` | `1.0`, `1.1` — TWO instances, at TWO-SEGMENT paths |
 * | `p`, `q` | `[A, M, F]` | `1.0.0` / `1.0.1` and `1.1.0` / `1.1.1` |
 *
 * Instances: **`A@-`, `M@1`, `F@1.0`, `F@1.1`** — four, over three openers.
 */
const DEPTH_THREE = {
  flowId: 'w85-depth-three', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'A' }] },
    { id: 'A', kind: 'fanout', branches: ['b0', 'b1'] },
    { id: 'b0', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'jA' }] },
    { id: 'b1', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'M' }] },
    { id: 'M', kind: 'map', over: 'items', branch: 'mid' },
    { id: 'mid', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'F' }] },
    { id: 'F', kind: 'fanout', branches: ['p', 'q'] },
    { id: 'p', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'jF' }] },
    { id: 'q', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'jF' }] },
    { id: 'jF', kind: 'join', of: 'F', edges: [{ to: 'jM' }] },
    { id: 'jM', kind: 'join', of: 'M', edges: [{ to: 'jA' }] },
    { id: 'jA', kind: 'join', of: 'A', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/**
 * **A `map` inside a `map` inside a `fanout` branch** — the one document in which
 * `JP-R10`'s N = 0 site has an ENCLOSING region whose own instance path is not `'-'`.
 *
 * ```
 * ingest -> A(fanout [b0, b1]) ; b1 -> M(map over items, branch mid)
 *   mid -> Inner(map over rows, branch leaf) ; leaf -> ij(join of Inner) -> jM -> jA
 * ```
 *
 * `Inner` sits inside `M`'s branch, so `regionOf('Inner')` is `region(M)` and
 * `M`'s own path is **`1`** — the outer fanout's second branch. When one `Inner`
 * instance opens nothing, the branch `JP-R10` ends belongs to `M@1`.
 */
const N0_UNDER_A_NESTED_MAP = {
  flowId: 'w85-n0-nested', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'A' }] },
    { id: 'A', kind: 'fanout', branches: ['b0', 'b1'] },
    { id: 'b0', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'jA' }] },
    { id: 'b1', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'M' }] },
    { id: 'M', kind: 'map', over: 'items', branch: 'mid' },
    { id: 'mid', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'Inner' }] },
    { id: 'Inner', kind: 'map', over: 'rows', branch: 'leaf' },
    { id: 'leaf', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'ij' }] },
    { id: 'ij', kind: 'join', of: 'Inner', edges: [{ to: 'jM' }] },
    { id: 'jM', kind: 'join', of: 'M', edges: [{ to: 'jA' }] },
    { id: 'jA', kind: 'join', of: 'A', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/**
 * **Three maps, so the region `JP-R10` names has TWO INSTANCES** — W85's adequacy
 * reader, finding 2, and it is that reader's own constructed document.
 *
 * ```
 * ingest -> A(map over items, branch a1) ; a1 -> B(map over rows, branch b1)
 *   b1 -> C(map over cells, branch c1) ; c1 -> jC -> jB -> jA -> publish -> done
 * ```
 *
 * `JP-R10` ends a branch of the region the DYING region sits in, and in every other
 * document here that enclosing region has exactly ONE instance — `M@1` in
 * `N0_UNDER_A_NESTED_MAP` (because `M` sits in a fanout branch) and `split@-` in
 * `FANOUT_IN_MAP`. So *which* instance the branch is ended in cost **zero**: filed
 * under the opener's first instance it was the same string. **That is W84's adequacy
 * finding one region OUTWARD rather than one level in** — the item was written to
 * discharge it and reproduced it at two new sites.
 *
 * Here `C` sits inside `B`'s branch and `B` has two instances, `B@0` and `B@1`, so
 * ending a branch of `B@1` and ending one of `B@0` are different answers.
 */
const THREE_MAPS = {
  flowId: 'w85-three-maps', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'A' }] },
    { id: 'A', kind: 'map', over: 'items', branch: 'a1' },
    { id: 'a1', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'B' }] },
    { id: 'B', kind: 'map', over: 'rows', branch: 'b1' },
    { id: 'b1', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'C' }] },
    { id: 'C', kind: 'map', over: 'cells', branch: 'c1' },
    { id: 'c1', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'jC' }] },
    { id: 'jC', kind: 'join', of: 'C', edges: [{ to: 'jB' }] },
    { id: 'jB', kind: 'join', of: 'B', edges: [{ to: 'jA' }] },
    { id: 'jA', kind: 'join', of: 'A', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/**
 * **A reader after a region nested in a map, naming a node INSIDE that region** —
 * the second expressible narrowing shape, which `test/driver/needs.test.ts` records
 * as W85's by name.
 *
 * ```
 * ingest -> outer(map over items, branch gate)
 *   gate -> innerA(fanout [x1, x2]) ; x1, x2 -> joinA(join of innerA)
 *   joinA -> post(needs {got: ["x1"]}) -> outerJoin(join of outer) -> done
 * ```
 *
 * | node | region chain | path at two items |
 * |---|---|---|
 * | `outer` | — | `-` |
 * | `gate`, `innerA` | `[outer]` | `0`, `1` |
 * | `x1`, `x2` | `[outer, innerA]` | `0.0` / `0.1` and `1.0` / `1.1` |
 * | `joinA`, `post` | `[outer]` | `0`, `1` |
 *
 * `sharedRegionDepth(post, x1)` is **1** — the chains are `[outer]` and
 * `[outer, innerA]`, whose common prefix is `[outer]` — so
 * [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
 * rule 2 compares **one** segment: `post@0` sees `x1@0.0` and not `x1@1.0`.
 *
 * **The form is the BARE one, and the author wrote the array and was refused.**
 * `post` is outside `innerA`, which reads like `FD-V28`'s list case — but that rule's
 * condition is about a **`map`** region and nothing else: *`"n"` where this node is
 * outside a `map` region containing `n`*. `innerA` is a `fanout`, and the `map` that
 * does contain `x1` — `outer` — contains `post` too, so the condition is false and the
 * bare form is the legal one. **A region nested inside a `map` does not make a
 * reference across it a list**: the outer map multiplies the READERS rather than the
 * visible outputs. *(This comment read *"that rule asks how many outputs are visible
 * on this node's branch path"*, which is a phrase from one of `FD-V28`'s two error
 * MESSAGES and not from its condition — the rule reads no branch path at all. The
 * verdict is right and the derivation was not, and an implementer writing `FD-V28`
 * from that sentence would have written a different rule. W85's conformity reader,
 * finding 8.)* Measured both ways before this row was written.
 */
const READER_PAST_A_NESTED_REGION = {
  flowId: 'w85-reader-past-nested', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'outer' }] },
    { id: 'outer', kind: 'map', over: 'items', branch: 'gate' },
    { id: 'gate', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'innerA' }] },
    { id: 'innerA', kind: 'fanout', branches: ['x1', 'x2'] },
    { id: 'x1', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'joinA' }] },
    { id: 'x2', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'joinA' }] },
    { id: 'joinA', kind: 'join', of: 'innerA', edges: [{ to: 'post' }] },
    { id: 'post', kind: 'task', type: 'MergeWorker', needs: { got: 'x1' }, edges: [{ to: 'outerJoin' }] },
    { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/* ====================================================================== */

/**
 * **The cases this file declares, by SUITE and by CASE** — W85's adequacy reader,
 * finding 3, and the last suite below compares this to what actually ran, both ways
 * AND by count.
 *
 * **Measured before this list existed: ELEVEN of the file's thirteen cases were
 * deletable at `npm test` EXIT 0, zero FAIL lines**, and four of the item's six
 * declared Outputs went with them. `test/definition/l4-corpus.test.ts`'s census is a
 * membership over SUITE names and says so in its own header, so an EMPTY suite still
 * satisfies it; the only residue was the assertion count, which nothing asserts.
 *
 * `test/driver/retention.test.ts` has carried `DECLARED_CASES` since W53's adequacy
 * reader deleted seven of its eight cases for zero, and this is that shape — with
 * the SUITE carried beside each case, so a case moving between suites fails too, and
 * with the COUNT, which is what makes the comparison a control rather than two set
 * differences that a re-source empties by construction.
 */
const DECLARED: [suite: string, cases: string[]][] = [
  ['L2 — W85: the three branch-exit paths, under a region nested in a map', [
    'branch.lost is filed under the INSTANCE the failure is in, and the sibling is untouched',
    'branch.suspended and branch.resumed are filed under the INSTANCE, and the run then completes',
    'the pair — one item LOSES a branch and the other PARKS one, in one run',
    'branch.exited is the sixth, and it too names the instance the branch was in',
  ]],
  ['L2 — W85: what a NESTED join carries — JP-R12 at two levels and at depth three', [
    'two instances of one opener carry SEPARATE and COMPLETE collections, under the same own keys',
    'a LOST branch removes its key from ITS instance and from no other',
    'depth THREE: every level carries its own branches, and every key at every level is ONE segment',
    'the key order holds at BOTH levels when twelve instances settle descending',
  ]],
  ['L2 — W85: N = 0 inside a map, at the depths the lift made reachable', [
    'one instance opening nothing leaves the OTHER instance`s join untouched',
    'EVERY instance opening nothing still ends every branch, and the outer join carries {}',
    'and the enclosing region it ends a branch of is ITSELF one instance of several',
  ]],
  ['L2 — W85: the at-most-once latch is per INSTANCE — Q95`s precondition one key deeper', [
    'a join that fired ONCE does not fire again when its late branch arrives',
    'and what it COSTS when the join`s successor is a TASK: one id, dispatched twice',
    'a join reported UNSATISFIABLE is reported once, for its own instance alone',
    'a dead join ends a branch of the enclosing INSTANCE it sits in, not of the opener',
  ]],
  ['L2 — W85: ADR 0044 visibility across a region nested in a map', [
    'a reader past a nested region sees ITS OWN instance`s output and no other',
    'and a sibling branch of the inner region is still refused, by a RULE',
  ]],
];

suite('L2 — W85: the three branch-exit paths, under a region nested in a map', (test) => {
  /**
   * **P22 fact 5's first clause, as an assertion.** The spike measured this under a
   * patch; the tree runs the document unpatched now, so it is re-taken against real
   * behaviour rather than against a probe's.
   *
   * The discriminating property is not that a `branch.lost` occurs — a top-level map
   * already emits one ([`test/driver/map.test.ts`](map.test.ts)) — it is that the
   * event is filed under **`f2@1` and not under `f2@0`**, and that instance 0's
   * settled map is untouched by it.
   */
  test('branch.lost is filed under the INSTANCE the failure is in, and the sibling is untouched', () => {
    const h = harness(FANOUT_IN_MAP);
    openTwoInstances(h);
    h.scheduler.settle('r1:p:0.0:0', 'done', { result: { w: 'p0' } });
    h.scheduler.settle('r1:q:0.1:0', 'done', { result: { w: 'q0' } });
    // `p` is `optional`, so no edge opts into `failed` and the branch is LOST rather
    // than failing the run — `spec/join-policy.md` section 2's `branch.lost` (a).
    h.scheduler.settle('r1:p:1.0:0', 'failed', {});
    h.scheduler.settle('r1:q:1.1:0', 'done', { result: { w: 'q1' } });
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });

    equal(trace(h).filter((s) => s.startsWith('lost')), ['lost f2@1 1.0'],
      'ONE lost event, under f2@1. Filed under f2@0 it would say the first item lost a branch that ' +
      'arrived, and `regionId` alone cannot tell the two apart because ADR 0062 rule 3 keeps its value');

    const s = fold(h.driver.foldInputs());
    equal(s.regions['f2']!['0']!.settled, { '0.0': 'arrived', '0.1': 'arrived' },
      'f2@0: both of ITS branches arrived, and the loss in the other item left no mark here — ' +
      '`RN-R6` keyed by the instance');
    equal(s.regions['f2']!['1']!.settled, { '1.0': 'lost', '1.1': 'arrived' },
      'f2@1: one lost, one arrived — the two instances of one opener disagree about what happened, ' +
      'which is the whole discrimination a single entry could not hold');
    equal([s.regions['f2']!['0']!.joined, s.regions['f2']!['1']!.joined], [true, true],
      'and BOTH inner joins still fired: live-token is satisfied when a region has no live branches, ' +
      'and a lost branch is not a live one (ADR 0003)');
    equal(s.outcome, 'failed',
      '`RN-R10` — a lost branch is a `pathEnded` with `no-eligible-edge`, which outranks `completed`. ' +
      'Stated because it is NOT what P22 fact 5 claims: fact 5`s *the run completes* is about the ' +
      'RESUME case below');
    equal(h.failures, [], 'and nothing was reported as a run failure — an optional loss is a routing fact');
  });

  /**
   * **P22 fact 5's second and third clauses**, and the two sites the declaration step
   * measured at ZERO. The only map in the tree that parks a branch is `map-fanout`,
   * which opens at TOP LEVEL — so `rpathOf` there is `'-'`, forcing `'-'` is a no-op,
   * and both `regionPath` expressions were free to be wrong.
   */
  test('branch.suspended and branch.resumed are filed under the INSTANCE, and the run then completes', () => {
    // **The park is in instance ONE, and that is the whole of what this case binds** —
    // W85's adequacy reader, finding 1. Parked in instance 0 both events are caught
    // against `'-'` and cost **ZERO** when filed under the opener's FIRST OPENED
    // instance, because instance 0 *is* `values()[0]`: the wrong answer and the right
    // one are the same string. That is [Q349](../../doc/questions/q349.md) exactly,
    // reproduced by the item written to discharge it, in the two sites it exists to
    // drive. `branch.lost` above escaped it only because its loss is in instance 1.
    //
    // Instance 1's branches are also settled FIRST, so instance 1's join is the one
    // still open when the person is asked — a reader tidying these into dispatch
    // order re-opens the hole and this comment is where they find out.
    const h = harness(FANOUT_IN_MAP);
    openTwoInstances(h);
    h.scheduler.settle('r1:p:1.0:0', 'user_action', {});
    h.scheduler.settle('r1:q:1.1:0', 'done', { result: { w: 'q1' } });
    h.scheduler.settle('r1:p:0.0:0', 'done', { result: { w: 'p0' } });
    h.scheduler.settle('r1:q:0.1:0', 'done', { result: { w: 'q0' } });

    equal(trace(h).filter((s) => s.startsWith('suspended')), ['suspended f2@1 1.0'],
      'the park is under f2@1 — the instance the person is being asked about, and NOT the opener`s ' +
      'first instance, which is what makes this line a claim about the key rather than about `-`');
    const mid = fold(h.driver.foldInputs());
    equal(mid.outcome, 'awaiting_action',
      'and the run is waiting on a person rather than stuck: `branch.suspended` is not terminal');
    equal(mid.regions['f2']!['1']!.suspended, ['1.0'], 'f2@1 carries the suspension');
    equal(mid.regions['f2']!['0']!.suspended, [],
      'and f2@0 carries none — the OTHER instance of the same opener is not waiting on anybody. ' +
      'Under one entry per opener this list would hold `1.0` for both');
    equal([mid.regions['f2']!['0']!.joined, mid.regions['f2']!['1']!.joined], [true, null],
      'so instance 0`s join has fired and instance 1`s has not, at the same instant, under ONE opener');

    equal(h.driver.resolve('r1:p:1.0:0', 'done', { result: { w: 'p1' }, actor: 'ops:jane' }), true,
      'a person resolves the parked branch — the resolve() -> advance -> indicesFrom road, which no ' +
      'test walked for a NESTED map');
    equal(trace(h).filter((s) => s.startsWith('resumed')), ['resumed f2@1 1.0'],
      'and the resumption is filed under f2@1 too');
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });
    const s = fold(h.driver.foldInputs());
    equal(s.outcome, 'completed', 'P22 fact 5`s own clause: the run completes');
    equal(h.failures, [], 'with zero failures');
  });

  /**
   * **The two exits are the SAME document at two settlement orders, and the
   * difference between them is asserted** — `doc/workflow.md` section 5 rule 8's
   * fourth requirement on the set. Collapse the pair — park in both, or fail in both
   * — and this line says so rather than the suite quietly becoming one case.
   */
  test('the pair — one item LOSES a branch and the other PARKS one, in one run', () => {
    const h = harness(FANOUT_IN_MAP);
    openTwoInstances(h);
    h.scheduler.settle('r1:p:0.0:0', 'user_action', {});     // instance 0 parks
    h.scheduler.settle('r1:q:0.1:0', 'done', { result: {} });
    h.scheduler.settle('r1:p:1.0:0', 'failed', {});          // instance 1 loses
    h.scheduler.settle('r1:q:1.1:0', 'done', { result: {} });

    equal(trace(h).filter((s) => !s.startsWith('opened') && !s.startsWith('arrived')),
      ['suspended f2@0 0.0', 'lost f2@1 1.0'],
      'TWO non-arrival exits in one run, under TWO instances of ONE opener — the shape that is the ' +
      'whole of the difference, and which a single region entry reports as one region doing both');
    const mid = fold(h.driver.foldInputs());
    equal([mid.regions['f2']!['0']!.suspended, mid.regions['f2']!['1']!.suspended], [['0.0'], []],
      'the suspension belongs to instance 0 alone');
    equal([mid.regions['f2']!['0']!.settled['0.0'], mid.regions['f2']!['1']!.settled['1.0']],
      [undefined, 'lost'],
      'and the loss to instance 1 alone. Swap either settlement and this pair collapses into two ' +
      'copies of one case');
    equal(mid.outcome, 'awaiting_action',
      'and the run as a whole is waiting on the person, not failed — `RN-R10` puts `awaiting_action` ' +
      'above `failed`, because the run can still move');
  });

  /**
   * **The SIXTH event, and the one this suite did not drive until its conformity
   * reader counted them.** `spec/join-policy.md` section 2 enumerates six, and
   * `doc/workflow.md` section 5 rule 8's obligation (a) says that where a rule
   * ENUMERATES its values the set IS that enumeration — so five of six is short by
   * the one nobody chose.
   *
   * `branch.exited` is `branch.lost`'s twin in exactly the way that matters here: its
   * `regionPath` is bound under `fanout` nesting, by the L5 `nested-inner-all-exit`
   * row whose regions sit at path `'1'`, and by NOTHING under a `map` instance.
   */
  test('branch.exited is the sixth, and it too names the instance the branch was in', () => {
    equal(validateDefinition(FANOUT_IN_MAP_WITH_EXIT, registry), [],
      'zero findings — `FD-V13` lets an edge leave a fan-out region for an `end`, and this one is ' +
      'INSIDE `region(f2)`, which is what section 2 means by *exited*');

    const h = harness(FANOUT_IN_MAP_WITH_EXIT);
    openTwoInstances(h);
    h.scheduler.settle('r1:p:0.0:0', 'done', { result: { w: 'p0' } });
    h.scheduler.settle('r1:q:0.1:0', 'done', { result: { w: 'q0' } });
    h.scheduler.settle('r1:p:1.0:0', 'failed', {});     // routes to `bail`, an `end`
    h.scheduler.settle('r1:q:1.1:0', 'done', { result: { w: 'q1' } });

    equal(h.events.filter((e) => e.type === 'branch.exited')
      .map((e) => `${e.regionId}@${e.regionPath} ${e.branchPath} at:${(e as { at: string }).at}`),
      ['f2@1 1.0 at:bail'],
      'ONE exit, under f2@1, naming the `end` it reached — the sixth of section 2`s six events, at ' +
      'a map instance. `at` is asserted too, because *exited* is defined on what the branch ' +
      'REACHED and not on where it went');
    const s0 = fold(h.driver.foldInputs());
    equal([s0.regions['f2']!['0']!.settled, s0.regions['f2']!['1']!.settled],
      [{ '0.0': 'arrived', '0.1': 'arrived' }, { '1.0': 'exited', '1.1': 'arrived' }],
      'and `RN-R6` records `exited` in the instance it happened in and `arrived` in the other — ' +
      'three of section 2`s three TERMINAL kinds now occur at a non-`-` instance in this file');
    // Keyed by `f2`'s entries `[p, q]` — each branch's OWN key (v0.25, ADR 0138), where v0.24 keyed `1.1`.
    equal(receivedBy(h, 'r1:after:1:0'), { q: { w: 'q1' } },
      '`JP-R12` — an EXITED branch has no key, so instance 1 carries one entry (`q`) where instance 0 ' +
      'carries two. The rule enumerates three ways to have no key and this is the third');
    equal(receivedBy(h, 'r1:after:0:0'), { p: { w: 'p0' }, q: { w: 'q0' } }, 'instance 0 is whole');
    for (const i of [0, 1]) h.scheduler.settle(`r1:after:${i}:0`, 'done', { result: { i } });
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });
    equal(fold(h.driver.foldInputs()).outcome, 'completed',
      'and the run COMPLETES — an exit reaches an `end`, so it is a `pathEnded` with reason `end` ' +
      'and not the `no-eligible-edge` a LOSS is, which is the whole of why the lost row above ends ' +
      '`failed` and this one does not');
  });
});

suite('L2 — W85: what a NESTED join carries — JP-R12 at two levels and at depth three', (test) => {
  /**
   * **ADR 0062's instance key as an assertion rather than as an argument.** Its
   * consequence 5 said two instances of one opener hold *disjoint* collections *by
   * construction*, because a branch inside an instance carried that instance's path as
   * its prefix. **Since v0.25 (ADR 0138) the keys carry no prefix** — `f2@i`'s join
   * carries `{"p": p's result, "q": q's result}` for EVERY `i`, the same key set — so
   * what keeps the two apart is that each INSTANCE holds its own collection, which is
   * what ADR 0138 puts in place of the prefix argument. Derived from `JP-R12` before the
   * run; the VALUES are what tell the two instances apart, and a collection keyed by
   * the opener alone would hand both items one object holding the last writer's values.
   */
  test('two instances of one opener carry SEPARATE and COMPLETE collections, under the same own keys', () => {
    const h = harness(FANOUT_IN_MAP);
    openTwoInstances(h);
    for (const [id, w] of [['r1:p:0.0:0', 'p0'], ['r1:q:0.1:0', 'q0'],
                           ['r1:p:1.0:0', 'p1'], ['r1:q:1.1:0', 'q1']] as const) {
      h.scheduler.settle(id, 'done', { result: { w } });
    }
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });

    // `collect` is `split`'s join, so what IT carries is keyed by the MAP's item
    // indexes — one entry per item — and each value is what that item's own `j2`
    // carried, keyed by `f2`'s entries. Two levels of `JP-R12`, read from one dispatch.
    const got = receivedBy(h, 'r1:publish:-:0') as Record<string, Record<string, unknown>>;
    equal(got, {
      '0': { p: { w: 'p0' }, q: { w: 'q0' } },
      '1': { p: { w: 'p1' }, q: { w: 'q1' } },
    }, 'the outer join carries one entry per ITEM and each is the inner join`s own collection. ' +
       'The two inner key sets are the SAME — `p` and `q` — and the values are each instance`s own, ' +
       'which is ADR 0062`s instance key doing it now that no key carries a prefix (ADR 0138)');
    ok(got['0'] !== got['1'], 'and they are two OBJECTS, one per instance, not one collection read twice');
    equal(fold(h.driver.foldInputs()).outcome, 'completed',
      'and the run completes, so the two collections above are what a SATISFIED join carried and ' +
      'not what a halted run left behind');
  });

  /**
   * **The half a complete run cannot show**: that a branch which did NOT arrive has
   * no key, *per instance*. `JP-R12`'s key set is *which branches arrived* and not
   * the region's width — and under nesting the two instances disagree about it.
   */
  test('a LOST branch removes its key from ITS instance and from no other', () => {
    const h = harness(FANOUT_IN_MAP);
    openTwoInstances(h);
    h.scheduler.settle('r1:p:0.0:0', 'done', { result: { w: 'p0' } });
    h.scheduler.settle('r1:q:0.1:0', 'done', { result: { w: 'q0' } });
    h.scheduler.settle('r1:p:1.0:0', 'failed', {});
    h.scheduler.settle('r1:q:1.1:0', 'done', { result: { w: 'q1' } });

    equal(receivedBy(h, 'r1:publish:-:0'), {
      '0': { p: { w: 'p0' }, q: { w: 'q0' } },
      '1': { q: { w: 'q1' } },
    }, 'item 0 carries BOTH its branches and item 1 carries ONE (`q`) — the lost branch has no key, and ' +
       'the two collections differ in their key SETS rather than only in their values. A read keyed ' +
       'by the opener hands both items the same object');
  });

  /**
   * **Depth three**, where `JP-R12` applies at three levels at once. W84 asserted the
   * KEYS at this depth and left what each level CARRIES unasserted. *(Until v0.25 the
   * innermost keys carried three segments; since ADR 0138 every key is ONE.)*
   *
   * Derived on paper, innermost first — `F`'s entries `[p, q]`, `M`'s item indexes,
   * `A`'s entries `[b0, b1]`:
   *   `F@1.0` -> `{"p": p@1.0.0, "q": q@1.0.1}` and `F@1.1` -> `{"p": p@1.1.0, "q": q@1.1.1}`
   *   `M@1`   -> `{"0": <F@1.0's collection>, "1": <F@1.1's collection>}`
   *   `A@-`   -> `{"b0": b0's result, "b1": <M@1's collection>}`
   */
  test('depth THREE: every level carries its own branches, and every key at every level is ONE segment', () => {
    equal(validateDefinition(DEPTH_THREE, registry), [], 'the document validates with zero findings');
    const h = harness(DEPTH_THREE);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:b0:0:0', 'done', { result: { w: 'b0' } });
    h.scheduler.settle('r1:b1:1:0', 'done', { result: { items: ['x', 'y'] } });
    for (const id of ['r1:mid:1.0:0', 'r1:mid:1.1:0']) h.scheduler.settle(id, 'done', { result: {} });
    for (const id of ['r1:p:1.0.0:0', 'r1:q:1.0.1:0', 'r1:p:1.1.0:0', 'r1:q:1.1.1:0']) {
      h.scheduler.settle(id, 'done', { result: { w: id.slice(3, -2) } });
    }
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });

    equal(receivedBy(h, 'r1:publish:-:0'), {
      b0: { w: 'b0' },
      b1: {
        '0': { p: { w: 'p:1.0.0' }, q: { w: 'q:1.0.1' } },
        '1': { p: { w: 'p:1.1.0' }, q: { w: 'q:1.1.1' } },
      },
    }, 'THREE nestings of JP-R12 in one value: the outer fanout`s two entries, the map`s two items ' +
       'under `b1`, and each item`s own fanout under that — every key ONE segment, so `input.b1.1.q` ' +
       'reaches the second item`s `q` (ADR 0138). The full path `1.1.1` is still the TASK id`s, ' +
       'which is where each value`s `w` came from');

    const s = fold(h.driver.foldInputs());
    equal(s.outcome, 'completed',
      'and the run completes, so every key above is one a SATISFIED join carried rather than one a ' +
      'stopped run left behind');
    equal(Object.entries(s.regions).flatMap(([id, byPath]) => Object.keys(byPath).map((rp) => `${id}@${rp}`)).sort(),
      ['A@-', 'F@1.0', 'F@1.1', 'M@1'],
      'four region instances over three openers, and the innermost opener`s two keys carry TWO ' +
      'segments each — derived from the document above and not read back');
  });

  /**
   * **`JP-R12`'s key-ORDER clause, at a depth that is not the one it was written
   * for** — the rule's second key-order fixture, twelve INSTANCES of one opener settled
   * descending, `q` before `p` inside each.
   *
   * **v0.25 (ADR 0138) changes what it discriminates and keeps its shape.** Until v0.24
   * each inner collection's keys were DOTTED (`11.0`, `11.1`), so the comparator had to
   * order them. Now they are `f2`'s entries `p` and `q` — NON-integer-like, so the
   * language keeps INSERTION order, and `p` coming out first though `q` settled first in
   * every instance is the driver inserting in `branches` order rather than settlement
   * order. The outer keys are item indexes `0` … `11`, integer-like, which the language
   * orders anyway; what that level discriminates is each instance's values under its OWN
   * index — a key taken from settlement position files instance 11's under `0`.
   */
  test('the key order holds at BOTH levels when twelve instances settle descending', () => {
    const items = Array.from({ length: 12 }, (_, i) => `i${i}`);
    const h = harness(FANOUT_IN_MAP);
    openTwoInstances(h, items);
    for (let i = 11; i >= 0; i--) {
      h.scheduler.settle(`r1:q:${i}.1:0`, 'done', { result: { w: `q${i}` } });
      h.scheduler.settle(`r1:p:${i}.0:0`, 'done', { result: { w: `p${i}` } });
    }
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });

    const outer = receivedBy(h, 'r1:publish:-:0') as Record<string, Record<string, unknown>>;
    equal(Object.keys(outer), items.map((_, i) => String(i)),
      'the OUTER join`s keys come out 0..11 ascending though the items settled 11..0 — and at this ' +
      'level the language would have done it anyway, which is why the level below is the test');
    equal(outer['11'], { p: { w: 'p11' }, q: { w: 'q11' } },
      'and each item`s collection sits under its OWN index — instance 11 settled FIRST, so a key ' +
      'taken from settlement position would file it under `0`');
    equal(outer['0'], { p: { w: 'p0' }, q: { w: 'q0' } }, 'and instance 0, settled LAST, under `0`');
    equal(Object.keys(outer['11']!), ['p', 'q'],
      'and inside instance 11 the keys are `f2`s entries in `branches` order — non-integer-like, ' +
      'where the language keeps INSERTION order — so `q` settling before `p` and coming out second ' +
      'is the driver inserting in `branches` order, not settlement order');
    equal(Object.keys(outer['0']!), ['p', 'q'], 'and the same inside instance 0');
  });
});

suite('L2 — W85: N = 0 inside a map, at the depths the lift made reachable', (test) => {
  /**
   * **`spec/join-policy.md` section 5's ruling, one key deeper — asserted, not
   * reopened.** P22 decision 6 settles what N = 0 MEANS on the shipped tree. What is
   * asserted here is that the ruling's three clauses hold PER INSTANCE: the region is
   * recorded as entered, no policy verdict is reported, and `joined` stays `null` —
   * for the instance that opened nothing and for no other.
   */
  test('one instance opening nothing leaves the OTHER instance`s join untouched', () => {
    const h = harness(N0_UNDER_A_NESTED_MAP);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:b0:0:0', 'done', { result: { w: 'b0' } });
    h.scheduler.settle('r1:b1:1:0', 'done', { result: { items: ['x', 'y'] } });
    // Item 0 has one row; item 1 has NONE — so `Inner@1.1` opens nothing, which is
    // the one shape in which `regionEntered` is the only producer of a region entry.
    h.scheduler.settle('r1:mid:1.0:0', 'done', { result: { rows: ['r'] } });
    h.scheduler.settle('r1:mid:1.1:0', 'done', { result: { rows: [] } });
    h.scheduler.settle('r1:leaf:1.0.0:0', 'done', { result: { w: 'leaf' } });

    equal(trace(h).filter((s) => s.startsWith('lost')), ['lost M@1 1.1'],
      '`JP-R10``s consequence, filed against the ENCLOSING region`s own instance — and `M@1` is not ' +
      '`M@-`, which is what makes this document different from every other N=0 case in the tree. ' +
      'The branch it ends is the map ITEM the empty list was under');
    equal(h.unsatisfiable, [],
      'and NO join verdict was reported: `spec/join-policy.md` section 5 — the driver reports a ' +
      'routing fact it alone knows, and no policy said `unsatisfiable`');

    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });
    const s = fold(h.driver.foldInputs());
    equal(Object.keys(s.regions['Inner']!).sort(), ['1.0', '1.1'],
      'BOTH inner instances are present, at TWO-SEGMENT paths — instance 1.1 opened no branch, so ' +
      '`regionEntered` is the only thing that can put it there');
    equal([s.regions['Inner']!['1.0']!.joined, s.regions['Inner']!['1.1']!.joined], [true, null],
      'and one join fired while the other stayed `null` — `RN-R11`, where `null` means the driver ' +
      'neither routed out nor was told it never will. One entry per opener cannot hold both');
    equal(s.regions['Inner']!['1.1']!.opened, [], 'the empty instance opened nothing');
    equal(s.outcome, 'stuck',
      'so the run is STUCK by `RN-R10`, even though its outer joins fired and `publish` ran — which ' +
      'is section 5`s ruling holding at a depth it was not measured at');
  });

  /**
   * **Every instance empty**, which the ruling's own words cover and which no fixture
   * held: with no instance opening anything, the outer join fires over a region all of
   * whose branches were lost, and `JP-R12` gives it `{}`.
   */
  test('EVERY instance opening nothing still ends every branch, and the outer join carries {}', () => {
    const h = harness(N0_UNDER_A_NESTED_MAP);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:b0:0:0', 'done', { result: { w: 'b0' } });
    h.scheduler.settle('r1:b1:1:0', 'done', { result: { items: ['x', 'y'] } });
    h.scheduler.settle('r1:mid:1.0:0', 'done', { result: { rows: [] } });
    h.scheduler.settle('r1:mid:1.1:0', 'done', { result: { rows: [] } });

    equal(trace(h).filter((s) => s.startsWith('lost')), ['lost M@1 1.0', 'lost M@1 1.1'],
      'TWO branches of M@1 ended, one per empty instance — `JP-R10` applied twice rather than once ' +
      'per opener, which is exactly what a latch keyed by the opener would have prevented');
    // **The author expected `{"0": ...}` here and the run said `{"0": ..., "1": {}}`** — keyed by
    // `A`'s entries since v0.25, `{"b0": ..., "b1": {}}`.
    // `M@1`'s own join is SATISFIED — `live-token` fires when a region has no live
    // branches and a lost branch is not a live one — so it routes out carrying `{}`,
    // and branch 1 of the OUTER fanout arrives with that empty object. *`JP-R12`'s
    // `{}` is a value that PROPAGATES, not an absence*, and at depth 1 there is
    // nothing above a region for it to propagate into.
    equal(receivedBy(h, 'r1:publish:-:0'), { b0: { w: 'b0' }, b1: {} },
      'branch 1 of the outer fanout ARRIVED, carrying the empty collection M@1`s join fired with — ' +
      'so `JP-R12``s *a join nothing arrived at carries {}* is not where this stops: the `{}` is ' +
      'itself what the enclosing branch carries in');
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });
    equal(fold(h.driver.foldInputs()).outcome, 'stuck',
      'and the run is STUCK anyway, with `publish` having run and every outer join fired — because ' +
      'the two `Inner` instances never joined and `RN-R10` quantifies over region INSTANCES');
  });

  /**
   * **The branch `JP-R10` ends belongs to an ENCLOSING region that has TWO
   * instances** — W85's adequacy reader, finding 2, and the document is its own.
   *
   * The two cases above end a branch of `M@1` and of `split@-`, each of which is the
   * only instance of its opener — so *which* instance cost **ZERO**: the opener's
   * first instance and the right one were the same string. Here `C` dies inside
   * `B@1`, and `B@0` is alive beside it.
   */
  test('and the enclosing region it ends a branch of is ITSELF one instance of several', () => {
    equal(validateDefinition(THREE_MAPS, registry), [], 'three nested maps validate with zero findings');
    const h = harness(THREE_MAPS);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['p', 'q'] } });
    for (const i of [0, 1]) h.scheduler.settle(`r1:a1:${i}:0`, 'done', { result: { rows: ['r'] } });
    // `B@0`'s one row yields a cell; `B@1`'s yields none, so `C@1.0` opens nothing and
    // the branch `JP-R10` ends is `1.0` — a branch of **`B@1`**, with `B@0` still live.
    h.scheduler.settle('r1:b1:0.0:0', 'done', { result: { cells: ['c'] } });
    h.scheduler.settle('r1:b1:1.0:0', 'done', { result: { cells: [] } });

    equal(trace(h).filter((s) => s.startsWith('lost')), ['lost B@1 1.0'],
      'the lost branch belongs to B@1 and not to B@0 — two instances of the ENCLOSING opener are ' +
      'live at once, which is the state in which naming the opener`s first instance is a different ' +
      'answer. In every other N=0 document here the enclosing region has exactly one instance');
    equal(h.unsatisfiable, [], 'and still no policy verdict — section 5`s ruling is unchanged by depth');
    h.scheduler.settle('r1:c1:0.0.0:0', 'done', { result: { w: 'cell' } });
    const s0 = fold(h.driver.foldInputs());
    equal(Object.keys(s0.regions['C']!).sort(), ['0.0', '1.0'],
      'both innermost instances are recorded, at two-segment paths');
    equal([s0.regions['C']!['0.0']!.joined, s0.regions['C']!['1.0']!.joined], [true, null],
      'and only the one that opened a branch joined');
    for (const id of h.ids().filter((x) => x.startsWith('r1:publish'))) {
      h.scheduler.settle(id, 'done', { result: {} });
    }
    equal(fold(h.driver.foldInputs()).outcome, 'stuck',
      'and once nothing is in flight the run is STUCK, at three levels of map — `RN-R10` over an ' +
      'instance that was entered and never joined');
  });
});

suite('L2 — W85: the at-most-once latch is per INSTANCE — Q95`s precondition one key deeper', (test) => {
  /**
   * **[Q95](../../doc/questions/q95.md)'s precondition at instance granularity, and
   * W84's Record hands it here by name**: the latch's TOO-STRONG direction is bound at
   * 3, and its TOO-WEAK direction — `firedAdd` writing a key no `firedHas` will look
   * for — is bound by nothing, *because no shipped policy settles a join before every
   * branch is terminal*.
   *
   * So the policy is CONSTRUCTED, and scoped to `f2` so that the enclosing region
   * stays an ordinary `live-token` one.
   */
  test('a join that fired ONCE does not fire again when its late branch arrives', () => {
    const h = harness(FANOUT_IN_MAP, eagerFor('f2', 'satisfied'));
    openTwoInstances(h);

    h.scheduler.settle('r1:p:0.0:0', 'done', { result: { w: 'p0' } });
    equal(joinSettlements(h.driver.foldInputs()), ['f2@0:true'],
      'f2@0 fired on its FIRST arrival, with branch 0.1 still live — which is the precondition no ' +
      'shipped policy supplies and which this policy exists to supply');

    h.scheduler.settle('r1:q:0.1:0', 'done', { result: { w: 'q0' } });
    equal(joinSettlements(h.driver.foldInputs()), ['f2@0:true'],
      'and the late arrival did NOT fire it a second time. With `firedAdd` writing the opener`s ' +
      'first key instead of the instance`s, `firedHas(f2, "0")` is false here and the join routes ' +
      'out twice — `spec/join-policy.md` section 4`s *at most once per region*, per INSTANCE');
    ok(receivedBy(h, 'r1:publish:-:0') === undefined,
      'and the outer join has not fired yet, because instance 1 is still live — so the doubled ' +
      'settlement above would be visible here as a second arrival at `collect` for branch 0');

    h.scheduler.settle('r1:p:1.0:0', 'done', { result: { w: 'p1' } });
    h.scheduler.settle('r1:q:1.1:0', 'done', { result: { w: 'q1' } });
    equal(joinSettlements(h.driver.foldInputs()), ['f2@0:true', 'f2@1:true', 'split@-:true'],
      'THREE settlements, one per region instance — and instance 1 fired although instance 0 had ' +
      'already latched, which is the too-STRONG direction on the same expression');
    equal(receivedBy(h, 'r1:publish:-:0'), { '0': { p: { w: 'p0' } }, '1': { p: { w: 'p1' } } },
      '`JP-R12` rule 4 PER INSTANCE: each item carries the ONE branch that arrived before its own ' +
      'join became terminal, and the late arrival recorded nothing. Keyed by the opener, the late ' +
      '`q` (at `0.1`) lands in a collection that is still open and item 0 comes out with two keys');
  });

  /**
   * **What the doubled fire COSTS, and the row above cannot show it** — W85's
   * conformity reader, finding 2. The item claimed a `DuplicateTaskId` and there is
   * none: in `FANOUT_IN_MAP` the inner join routes into ANOTHER JOIN, so a second
   * fire records a second arrival and mints no task at all. The failure is real and
   * completely silent.
   *
   * With a TASK after the inner join the same defect mints `r1:after:0:0` twice and
   * `ID-R1` stops the run naming the id. *The same mis-keyed latch is silent or loud
   * depending on what the join's successor is*, which is why this is a second document
   * rather than another settlement order on the first — and it is
   * [Q13](../../doc/questions/q13.md)'s routing case at instance granularity, which
   * W18 could only reach at depth 1.
   */
  test('and what it COSTS when the join`s successor is a TASK: one id, dispatched twice', () => {
    equal(validateDefinition(FANOUT_IN_MAP_WITH_EXIT, registry), [], 'the document validates');
    const h = harness(FANOUT_IN_MAP_WITH_EXIT, eagerFor('f2', 'satisfied'));
    openTwoInstances(h);

    h.scheduler.settle('r1:p:0.0:0', 'done', { result: { w: 'p0' } });
    equal(h.ids().filter((id) => id.startsWith('r1:after')), ['r1:after:0:0'],
      'f2@0 fired on its first arrival and dispatched the join`s successor — a TASK, so the ' +
      'dispatch is observable where an arrival at another join is not');

    h.scheduler.settle('r1:q:0.1:0', 'done', { result: { w: 'q0' } });
    equal(h.ids().filter((id) => id.startsWith('r1:after')), ['r1:after:0:0'],
      'and the late branch did not dispatch it a SECOND time. Keyed by the opener, `firedHas(f2, ' +
      '"0")` is false here and `after` is minted again at the same id');
    equal(h.failures, [],
      'so no run failure — which is the assertion the mutation moves: with the latch one level ' +
      'short this reads, as `${kind}: ${message}`, `DuplicateTaskId: "r1:after:0:0" was already dispatched in run "r1"`, ' +
      'reported through `onRunFailure` and stopping the run. ID-R1 catches it BEFORE addTask, ' +
      'which is why the id list above is unmoved either way and this list is not');
  });

  /**
   * The other exit. `firedAdd` and `releaseArrivals` both sit in the `unsatisfiable`
   * arm, both were measured at ZERO, and both need a policy that declares ONE instance
   * dead while another is live.
   */
  test('a join reported UNSATISFIABLE is reported once, for its own instance alone', () => {
    const h = harness(FANOUT_IN_MAP, eagerFor('f2', 'unsatisfiable'));
    openTwoInstances(h);

    h.scheduler.settle('r1:p:0.0:0', 'done', { result: { w: 'p0' } });
    equal(h.unsatisfiable.map((u) => `${u.fanoutId}@${u.regionPath}`), ['f2@0'],
      'f2@0 is declared dead and the report NAMES the instance — `UnsatisfiableJoin.regionPath`, ' +
      'ADR 0062 rule 3`s second half, which under nesting is the only thing telling a consumer ' +
      'WHICH of N joins died');
    equal(trace(h).filter((s) => s.startsWith('lost')), ['lost split@- 0'],
      'and `JP-R10` ended the enclosing branch — the map ITEM the dead region sat in');

    h.scheduler.settle('r1:q:0.1:0', 'done', { result: { w: 'q0' } });
    equal(h.unsatisfiable.map((u) => `${u.fanoutId}@${u.regionPath}`), ['f2@0'],
      'the late arrival at an already-dead join reports NOTHING further: *once per region, and ' +
      'terminal for it* (section 4), per instance. With the latch keyed by the opener this is ' +
      'reported twice and the enclosing branch is lost twice');

    h.scheduler.settle('r1:p:1.0:0', 'done', { result: { w: 'p1' } });
    equal(h.unsatisfiable.map((u) => `${u.fanoutId}@${u.regionPath}`), ['f2@0', 'f2@1'],
      'and instance 1 reports its OWN death, untouched by instance 0 having latched — the too-STRONG ' +
      'direction of the same expression, on the arm that had no observer at all');
    equal(joinSettlements(h.driver.foldInputs()).filter((s) => s.startsWith('f2')),
      ['f2@0:false', 'f2@1:false'],
      'two `joinSettled` records, both `fired: false` — `RN-R11` gives that the meaning *a policy ' +
      'reported it unsatisfiable*, and there are two policies` worth of that, not one');
  });

  /**
   * **`JP-R10`'s OTHER emission site, at an enclosing region with two instances** —
   * W85's adequacy reader, finding 2's second half. The row above ends a branch of
   * `split@-`, the only instance of its opener, so which instance cost **zero**;
   * this ends a branch of `B@1` with `B@0` alive beside it.
   *
   * The two sites are different lines in `settleJoin` — one in the `unsatisfiable`
   * arm and one at N = 0 — and the N = 0 one is bound by the suite above, so this
   * is the arm a policy reaches.
   */
  test('a dead join ends a branch of the enclosing INSTANCE it sits in, not of the opener', () => {
    const h = harness(THREE_MAPS, eagerFor('C', 'unsatisfiable'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['p', 'q'] } });
    for (const i of [0, 1]) h.scheduler.settle(`r1:a1:${i}:0`, 'done', { result: { rows: ['r'] } });
    for (const p of ['0.0', '1.0']) h.scheduler.settle(`r1:b1:${p}:0`, 'done', { result: { cells: ['c'] } });

    // Instance 1.0's cell arrives FIRST, so the first join to die is not the opener's
    // first instance — the same ordering claim the retention cases turn on.
    h.scheduler.settle('r1:c1:1.0.0:0', 'done', { result: { w: 'c1' } });
    equal(h.unsatisfiable.map((u) => `${u.fanoutId}@${u.regionPath}`), ['C@1.0'],
      'C@1.0 is declared dead — the innermost region, named by a two-segment instance path');
    equal(trace(h).filter((s) => s.startsWith('lost')), ['lost B@1 1.0'],
      'and `JP-R10` ended a branch of **B@1**, the enclosing INSTANCE the dead region sat in. ' +
      'B@0 is untouched and still live, so filing this against the opener`s first instance is a ' +
      'different answer here and the same string everywhere else in this file');

    h.scheduler.settle('r1:c1:0.0.0:0', 'done', { result: { w: 'c0' } });
    equal(h.unsatisfiable.map((u) => `${u.fanoutId}@${u.regionPath}`), ['C@1.0', 'C@0.0'],
      'and then C@0.0 dies on its own account');
    equal(trace(h).filter((s) => s.startsWith('lost')), ['lost B@1 1.0', 'lost B@0 0.0'],
      'ending a branch of B@0 — two enclosing instances, each ended by its own inner death');
    for (const id of h.ids().filter((x) => x.startsWith('r1:publish'))) {
      h.scheduler.settle(id, 'done', { result: {} });
    }
    equal(fold(h.driver.foldInputs()).outcome, 'stuck',
      'and the run is stuck: `RN-R11` gives `joined: false` to the two dead innermost joins');
  });
});

suite('L2 — W85: ADR 0044 visibility across a region nested in a map', (test) => {
  /**
   * **The second expressible narrowing shape, which `test/driver/needs.test.ts`
   * records as W85's by name.** That file's row says a narrowing case needs a target
   * with two or more outputs whose reader shares a region with it, that `FD-V19`
   * makes a `fanout` target unique, and that the only two ways left were both refused
   * when it was written — W84 lifted the second.
   *
   * Derived from `outputIsVisible` on paper: `chain(post) = [outer]`,
   * `chain(x1) = [outer, innerA]`, so `sharedRegionDepth` is **1** and exactly one
   * segment is compared. `post@0` sees `x1@0.0` and not `x1@1.0`.
   */
  test('a reader past a nested region sees ITS OWN instance`s output and no other', () => {
    equal(validateDefinition(READER_PAST_A_NESTED_REGION, registry), [],
      'zero findings — `FD-V27` is satisfied because `post` is reachable from `x1`, and `FD-V28` by ' +
      'the BARE form: the reader`s own map instance selects one output, so the nesting multiplies ' +
      'the READERS and not the visible outputs');
    equal(
      validateDefinition(
        withNeeds(READER_PAST_A_NESTED_REGION, 'post', { got: ['x1'] }), registry,
      ).map((f) => (f as { rule: string }).rule),
      ['FD-V28'],
      'and the LIST form is refused by name, which is this row`s control: it says the count `FD-V28` ' +
      'computes is ONE here, so the bare form above is a fact about the graph rather than a ' +
      'spelling that happened to pass');

    const h = harness(READER_PAST_A_NESTED_REGION);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    for (const i of [0, 1]) h.scheduler.settle(`r1:gate:${i}:0`, 'done', { result: {} });
    for (const p of ['0.0', '0.1', '1.0', '1.1']) {
      h.scheduler.settle(`r1:${p.endsWith('.0') ? 'x1' : 'x2'}:${p}:0`, 'done', { result: { at: p } });
    }

    equal(receivedBy(h, 'r1:post:0:0'), { got: { at: '0.0' } },
      'ONE entry, and it is instance 0`s. There are TWO `x1` outputs in this run and the reader ' +
      'names one node id — which is exactly the ambiguity ADR 0044 resolves by comparing the ' +
      'shared region`s segment');
    equal(receivedBy(h, 'r1:post:1:0'), { got: { at: '1.0' } },
      'and instance 1`s reader gets instance 1`s. There are TWO `x1` outputs in this run and both ' +
      'readers name one node id, so an unfiltered resolver has to pick — and picking wrong is ' +
      'silent, because both values have the same shape');

    for (const i of [0, 1]) h.scheduler.settle(`r1:post:${i}:0`, 'done', { result: {} });
    equal(fold(h.driver.foldInputs()).outcome, 'completed',
      'and the run completes — before W84 this document`s DRIVER refused to construct at all, ' +
      'which is why `test/driver/needs.test.ts` could record the shape and not run it');
  });

  /**
   * **The narrowing direction's own control**, and it is what makes the row above a
   * statement about the SHARED segment rather than about arity. `x2` reads `x1`
   * across a sibling branch of the SAME `innerA` instance: chains `[outer, innerA]`
   * both, depth 2, and the second segments differ — so the reference is not visible.
   * `FD-V27` refuses it statically, which is the measured ABSENCE the sibling case
   * has had since W49 and which nesting does not change.
   */
  test('and a sibling branch of the inner region is still refused, by a RULE', () => {
    const found = validateDefinition(
      withNeeds(READER_PAST_A_NESTED_REGION, 'x2', { got: 'x1' }), registry,
    ).map((f) => (f as { rule: string }).rule);
    equal(found, ['FD-V27'],
      'refused because `x2` is not reachable FROM `x1` — so the shared `innerA` segment can never ' +
      'differ between a reader and a target a reference may connect, at this depth as at depth 1');
  });
});

suite('L2 — W85: every case this file declares actually RAN', (test) => {
  /**
   * **The membership, both ways AND by count** — W85's adequacy reader, finding 3.
   *
   * Eleven of this file's thirteen cases were deletable at exit 0 before this, because
   * the only thing binding them was `test/definition/l4-corpus.test.ts`'s census, which
   * is a membership over SUITE names and is satisfied by an EMPTY suite.
   *
   * **The COUNT is what makes this a control rather than a fourth claim, and its
   * REACH is stated rather than implied** (v0.21, v0.22: *name the tree on which the
   * control fails and its claim passes*).
   *
   * Both set differences can be emptied by one token — re-source `declared` from
   * `observed` and `missing` and `extra` are empty by construction, which is exactly
   * the mutation that leaves the corpus census in `test/definition/l4-corpus.test.ts`
   * green. The count is against a **literal**, so it survives that re-source and still
   * fails a deletion. Measured, all four:
   *
   * | | costs |
   * |---|---|
   * | a case DELETED | caught, by the differences AND by the count |
   * | a case RENAMED | caught, by the differences |
   * | the sets re-sourced, alone | **0 — and nothing is wrong**: seventeen cases did run |
   * | re-sourced + a case DELETED | **caught, by the count alone** |
   * | re-sourced + a case RENAMED | **0 — the declared CEILING** |
   *
   * **The ceiling is re-source-plus-rename, and it is [Q217](../../doc/questions/q217.md)'s
   * regress rather than a hole in this list**: a rename keeps the count, so only a
   * comparison against written-down NAMES can see it, and no expression inside one
   * process can check that those names were written down before the run. What it costs
   * an editor is TWO edits in one diff, forty lines apart — which is the argument
   * `ROW_KEYS` and `CROSS_ROW_SUBJECTS` already rest on, and the reason the answer here
   * is not a fourth list.
   *
   * **Read inside a `test()` body**, because the runner imports every file before it
   * runs any case; at module scope this would see only the suites that loaded first.
   */
  test('the declared suite/case pairs are exactly what ran, both ways and by count', () => {
    const observed = collected()
      .filter((s) => s.suite.startsWith('L2 — W85:') && s.suite !== 'L2 — W85: every case this file declares actually RAN')
      .flatMap((s) => s.cases.map((c) => `${s.suite} :: ${c.name}`))
      .sort();
    const declared = DECLARED.flatMap(([suiteName, cases]) => cases.map((c) => `${suiteName} :: ${c}`)).sort();

    equal(observed.filter((x) => !declared.includes(x)), [],
      'every case that RAN is declared above — an undeclared one means a case was added without a ' +
      'row, which is how this list goes stale toward weakness');
    equal(declared.filter((x) => !observed.includes(x)), [],
      'and every case declared above RAN — a deleted case fails HERE naming itself, where the ' +
      'suite census is blind to it because the suite is still present and merely empty');
    equal(observed.length, 17,
      'and SEVENTEEN of them, counted against a literal rather than against `declared` — which is ' +
      'what the two lines above cannot do, because re-sourcing `observed` from `declared` empties ' +
      'both differences by construction and leaves them exactly as true as before');
    equal(declared.length, 17, 'the declaration carries seventeen rows, so the count binds both sides');
  });
});
