/**
 * Ladder L2 — **what a run retains, and when a region releases its collection.**
 * [W53](../../doc/work-items/w53-what-a-run-retains-that-nothing-reads.md) under
 * [P15](../../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md),
 * asserting
 * [ADR 0046](../../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
 * and `RN-R13`.
 *
 * **Every expected value here is derived from `spec/` and from the ADR, never from
 * output:**
 *
 * | what | from |
 * |---|---|
 * | which structures may hold a settled result | `RN-R13` in [spec/run-state.md](../../spec/run-state.md) section 7 — `inputs` holds it, `log` is its record-kind subsequence BY REFERENCE, and `outputsCache` aliases it |
 * | when a region's collection is released | `JP-R11`/`JP-R12` in [spec/join-policy.md](../../spec/join-policy.md) section 4, and ADR 0046 rule 3 |
 * | what a satisfied join carries | `JP-R12` — one entry per branch that emitted `branch.arrived`, keyed by `branchPath`, ascending segment-wise-numeric |
 * | `stuck` on `p1-routed-away` under `arrival-count` | `RN-R10`, and `spec/join-policy.md` section 3's first row |
 * | that a stopped run releases | `OR-R10`, and ADR 0046 rule 3's THIRD moment — the run-level one |
 * | that a stopped run does not ROUTE | `OR-R10` again, and it is the guard W53's conformity reader bought |
 * | a `fanout` region, a NESTED region, and `outputsCache`'s alias | ADR 0046 rules 1 and 3, and all three are cases W53's adequacy reader bought |
 *
 * ---
 *
 * ### Why this file reaches for a private field, stated rather than left as a smell
 *
 * `doc/workflow.md` section 5 rule 5 says *test the contract, not the
 * implementation*. **Retention IS the contract here** — ADR 0046 rule 1 is a
 * statement about what a run holds — and it is observable through **no** public
 * surface: `snapshot()` and `foldInputs()` both return the log, and `arrivals` is
 * reachable from neither, which is exactly `RN-R13`'s point. The alternatives were
 * both worse. A public accessor would enlarge the surface for a test's convenience,
 * which is [Q53](../../doc/questions/q53.md)'s own finding (*a redundant surface is
 * read as a permissive one*); and a byte measurement would need `v8.serialize`,
 * which exists in only **two** of the five runtimes L1-L5 must be green in — node and
 * deno, through `node:v8`, and in none of the three browsers
 * (`spec/runtime-targets.md`). *(Three documents said it was in ONE. Measured:
 * `deno eval "import v8 from 'node:v8'; console.log(typeof v8.serialize)"` prints
 * `function`. W53's conformity reader; the conclusion is unaffected, because a
 * rung green in two runtimes of five is not a rung.)*
 *
 * **So the reach is deliberate, it is one named helper rather than casts scattered
 * through the file, and it is recorded here as the cost of the rule being
 * unobservable from outside.** [Q233](../../doc/questions/q233.md).
 */
import { collected, deepEqual, equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import { arrivalCount, liveToken } from '../../src/fold/policies.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>; pools: Record<string, { type: string }>; predicates: string[]; languages: string[] };

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

function harness(def: FlowDefinition, policy: JoinPolicy, predicates = new Map<string, () => boolean>()) {
  const scheduler = new FakeScheduler();
  const events: RegionEvent[] = [];
  const failures: { kind: string; message: string }[] = [];
  const unsatisfiable: unknown[] = [];
  const driver = new Driver(def, {
    runId: 'r1',
    scheduler,
    createTask: (c) => c,
    predicates: predicates as never,
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
    joinPolicy: policy,
    onRegionEvent: (e) => events.push(e),
    onUnsatisfiableJoin: (i) => unsatisfiable.push(i),
    onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
  });
  return {
    scheduler, driver, events, failures, unsatisfiable,
    ids: () => scheduler.added.map((t) => t.id),
    // What the node RECEIVED: the envelope's `input` — every task node is typed since v0.19 (ADR 0054).
    payloadOf: (id: string) => (scheduler.added.find((t) => t.id === id)?.payload as { input?: unknown } | undefined)?.input,
  };
}
type H = ReturnType<typeof harness>;

/**
 * **The one reach into the driver, named once** — see the header. The shape is
 * `Map<fanoutId, Map<openerPath, Map<branchPath, payload>>>`, which is the field's
 * own declaration.
 *
 * **THREE levels since W84, and the middle one is the region INSTANCE** (ADR 0062):
 * a `map` can enter one opener N times, so a collection is per instance and not per
 * opener. *This cast is why this file was one of the four a typechecker did not name
 * when the shape moved* — a reach that RESTATES the shape it reaches into compiles
 * against its own restatement, so the drift shows up as a wrong NUMBER at L1 rather
 * than as an error at L0. It is still the right reach (the alternative is a public
 * accessor for a private field), and the cost is now written where the cast is.
 */
const arrivalsOf = (d: Driver): Map<string, Map<string, Map<string, unknown>>> =>
  (d as unknown as { arrivals: Map<string, Map<string, Map<string, unknown>>> }).arrivals;

/** How many arrival entries the driver is holding, across every region INSTANCE. */
const heldArrivals = (d: Driver): number => {
  let n = 0;
  for (const [, byPath] of arrivalsOf(d)) for (const [, m] of byPath) n += m.size;
  return n;
};

/**
 * **Which region INSTANCES are holding, and how much each holds** — `opener@path`
 * to entry count, in insertion order.
 *
 * **`heldArrivals`' second level was bound by NOTHING, and W85's declaration step
 * measured it at ZERO**: narrowing that inner loop to each opener's FIRST instance
 * cost no failures at any rung, because every fixture this file loaded had exactly
 * one instance per opener. A sum over a walk cannot say which level it summed.
 *
 * *(The subject is handed here by [ADR 0062](../../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)
 * consequence 7 and by [W84](../../doc/work-items/w84-what-a-regions-identity-is.md)'s
 * Scope-Out bullet, with [Q349](../../doc/questions/q349.md) as the mechanism. This
 * comment cited "W84's adequacy reader, finding 8" and **that finding does not exist
 * in the tree** — W84's file carries one numbered reader finding, its finding 7,
 * about a different subject. W85's conformity reader, finding 3.)*
 *
 * So the per-instance cases below assert THIS rather than the total, and the total's
 * two levels are held to it both ways in the same breath: a number is what a walk
 * reports and a key set is what says where it came from.
 */
const heldByInstance = (d: Driver): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const [opener, byPath] of arrivalsOf(d)) for (const [rp, m] of byPath) out[`${opener}@${rp}`] = m.size;
  return out;
};

/**
 * **What the walk below does NOT look in, and why each is excluded.** `graph`, `opts`
 * and `def` are the DEFINITION and the caller's own options: neither grows with the
 * run, which is `RN-R13`'s subject. Nothing else is excluded, and the test below
 * asserts that this list and the driver's own property names account for each other
 * BOTH WAYS — so a new field cannot join the driver without this file saying so,
 * which is the whole of *a sixth structure holding a result is a second copy and this
 * is what would say so*.
 */
// `nodeTypes` since W59: the registry's node types, normalised once at construction — a map
// of consumer-supplied entries whose `settings` are FUNCTIONS, so it is configuration exactly
// as `opts` is, holds no result, and a serialising walk would refuse it.
// `languages` since W61, for the same reason one set over: the registry's languages, whose `compile` is a
// FUNCTION and whose `worker` is a URL string — configuration, holding no result.
// `gateTypes` since W93, for the same reason one set over again: the gate types — the built-in `distinct` and a
// consumer's — whose `fn` is a FUNCTION. Configuration, holding no result; the gate's MEMORY is the run state and is walked.
const NOT_RUN_STATE = ['def', 'gateTypes', 'graph', 'languages', 'nodeTypes', 'opts'];

/** The driver's own growing structures — every own property that is not in the list above. */
const walkableKeys = (d: Driver): string[] =>
  Object.keys(d as unknown as Record<string, unknown>).filter((k) => !NOT_RUN_STATE.includes(k)).sort();

/**
 * **Does this value hold the marker anywhere inside it?** An explicit graph walk with
 * a `seen` set, and **not** `JSON.stringify` — which is what this was, and W53's
 * adequacy reader measured two shapes it structurally could not see:
 *
 * | shape | why the JSON walk missed it |
 * |---|---|
 * | a `Set` below the top level | the top-level unwrap handled `Set`, and the replacer handled only `Map`, so a nested `Set` serialised as `{}` |
 * | a **cyclic** object | `stringify` threw and the `catch` arm said *"a cyclic structure holds no settled result here"* — which is the exact thing the probe falsified, and `structuredClone` **accepts** cycles (P15 fact 7), so a worker result may be one |
 *
 * Both shapes retained every arrived branch result for the life of the driver — the
 * defect ADR 0046 exists to remove — and were invisible to the rule's only observer.
 * *A comment that states as a fact the thing a probe is about to falsify is worse
 * than no comment.*
 *
 * **Identity cannot stand in for this** — `OR-R2` deep-copies `result` at the
 * listener boundary, so the worker's own object is in none of these structures — and
 * a byte count cannot, because `v8.serialize` is absent from three of the five
 * runtimes L1-L5 must be green in — the three browsers. A unique marker string is
 * what works everywhere.
 */
function holdsMarker(v: unknown, marker: string, seen: Set<object>): boolean {
  if (typeof v === 'string') return v.includes(marker);
  if (!v || typeof v !== 'object') return false;
  // A cycle is not a hiding place: every node is visited once and then skipped.
  if (seen.has(v as object)) return false;
  seen.add(v as object);
  const inner: unknown[] = v instanceof Map
    ? [...(v as Map<unknown, unknown>).keys(), ...(v as Map<unknown, unknown>).values()]
    : v instanceof Set
    ? [...(v as Set<unknown>)]
    : Array.isArray(v)
    ? v
    : Object.values(v as Record<string, unknown>);
  for (const x of inner) if (holdsMarker(x, marker, seen)) return true;
  return false;
}

/** `RN-R13`'s observer: which of the driver's growing structures hold the marker. */
function holdersOf(d: Driver, marker: string): string[] {
  const o = d as unknown as Record<string, unknown>;
  return walkableKeys(d).filter((k) => holdsMarker(o[k], marker, new Set<object>())).sort();
}

/**
 * **The memo's entries, for the ALIAS half of `RN-R13`.** `outputsCache` holds a
 * settled result **by reference** — every entry IS a log record's own `result`
 * object — so it is a holder in the reachability sense and is not a second copy.
 * A holder SET cannot tell those apart; identity can, and this is what it reads.
 */
const cachedResults = (d: Driver): unknown[] => {
  const c = (d as unknown as {
    outputsCache: { byNode: Map<string, { path: string; result: unknown }[]> } | null;
  }).outputsCache;
  return c ? [...c.byNode.values()].flatMap((list) => list.map((e) => e.result)) : [];
};

/** The `result` object of every settled record in the driver's own log, by reference. */
const loggedResults = (d: Driver): unknown[] =>
  (d as unknown as { log: { result?: unknown }[] }).log
    .filter((r) => r && typeof r === 'object' && 'result' in r).map((r) => r.result);

/** A 3-item map over `over: "items"`, so the arity is the RUN's and not the document's. */
const MAP_FANOUT = 'valid/map-fanout.flow.json';
const THREE = { items: ['a', 'b', 'c'], rows: ['x', 'y'] };

/**
 * **Every own property of a `Driver`, sorted.** The other half of `NOT_RUN_STATE`:
 * this is the list the walk's universe is checked against, and it is `RN-R13`'s
 * ratchet — a new field here is a candidate second copy and the rule has to be
 * re-measured for it. **Its limit is `ROW_KEYS`'** — it is a literal, so a field and
 * its name here are two edits in one diff ([Q102](../../doc/questions/q102.md)).
 */
const DRIVER_FIELDS = [
  'arrivals', 'def', 'dispatched', 'failed', 'firedJoins', 'graph', 'inputs', 'joinState',
  'languages', 'log', 'nodeTypes', 'now', 'opts', 'outputsCache', 'regions', 'runId', 'started',
  // W73 — `workers`: the registry's worker entries, read at FD-R4's two boundaries for a task's input
  // and output schema. Declarations the consumer wrote, holding no result, and it joins
  // `NOT_RUN_STATE` beside `nodeTypes` and `languages` for the same reason. The ratchet fired as designed.
  'workers',
  // W88 — `header`: the checkpoint's header, set once by `start()` (`RN-R15`, ADR 0064). It holds the
  // driver's own COPY of the entry payload, so it is run state the driver RETAINS and it is on the
  // WALKED side, not in `NOT_RUN_STATE` — one copy of one value, constant in the task count and
  // proportional to the payload, which `RN-R13` names as a third term since v0.9. The ratchet fired
  // by name on W88's first run, the only L1-L5 failure it cost.
  'header',
  // W89 — `replay`: the replay's stored events and HELD dispatches, present only while `resume()`
  // runs and `null` at every other moment (`RN-R19`, ADR 0065), so it retains nothing once a run is
  // resumed and `RN-R13`'s terms do not move. WALKED, because while it exists it holds the stored
  // events — the consumer's, handed in. The ratchet fired by name on W89's first L1 run.
  'replay',
  // W93 — `gateMemory`: each gate's memory, one per gate per RUN (`RN-R26`, ADR 0067), holding whatever its type
  // wrote — for `distinct` one entry per key seen — for the life of the run. WALKED: it is run state, and it is
  // `RN-R13`'s FOURTH term. `gateTypes`: the gate types, normalised once — configuration, in `NOT_RUN_STATE`.
  // The ratchet fired by name on W93's first L1 run, naming both.
  'gateMemory', 'gateTypes',
  // W151 — `deaf`: one boolean, set when a resume is refused because its replay regenerated a stop in the lost tail
  // (`RN-R23`). It holds no result; WALKED beside `failed` and `started`. The ratchet fired as designed.
  'deaf',
].sort();
// `nodeTypes` since W59 — the ratchet firing as designed: the field was added and this list went
// red naming it. It holds the registry's node types (consumer functions, no result) and joins
// `NOT_RUN_STATE` above rather than the walk, for the reason stated there.
// *(This list read THIRTEEN on its first run and the assertion below caught it
// immediately: it was derived from `dev-dist/p15/facts.ts`, whose enumeration skips
// anything that is not an object, so the two booleans `failed` and `started` were
// invisible to it. They stay in the WALK rather than in `NOT_RUN_STATE` — a boolean
// holds no result, so walking one costs nothing, and excluding it would be a second
// judgement to keep right. The binding earning its place on its first run is the
// argument for it.)*

/**
 * **A `fanout` inside a `map` — the one shape in which ONE opener holds N
 * collections**, and the shape no document under `spec/examples/` contains, because
 * [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md) refused it at `Driver`
 * construction until [W84](../../doc/work-items/w84-what-a-regions-identity-is.md)
 * lifted the refusal. Written inline rather than added to the corpus: a corpus
 * document is `spec/flow-definition.md` section 7's to declare and `check:spec`'s to
 * count, and this file needs a shape rather than an example.
 *
 * `split` opens at top level, so its instance is `-`; `f2` opens inside `split`'s
 * branch, so its instances are the ITEM INDICES — `f2@0` and `f2@1` at two items,
 * with branches `0.0` / `0.1` and `1.0` / `1.1` ([ADR 0062](../../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)
 * rule 1).
 */
const FANOUT_IN_MAP = {
  flowId: 'w85-fanout-in-map', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'items', branch: 'lead' },
    { id: 'lead', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'f2' }] },
    { id: 'f2', kind: 'fanout', branches: ['p', 'q'] },
    { id: 'p', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j2' }] },
    { id: 'q', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j2' }] },
    { id: 'j2', kind: 'join', of: 'f2', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

const SUITE = 'ADR 0046 / RN-R13 — a region releases its collection when its join becomes terminal';

/**
 * **The cases this suite declares** — its own `ROW_KEYS`, and the last test in the
 * file compares it to what actually ran, both ways. W53's adequacy reader deleted
 * seven of the eight cases that existed before it and every rung stayed at exit 0,
 * because `test/definition/l4-corpus.test.ts`'s census is a membership over SUITE
 * names and the suite was still there.
 */
const DECLARED_CASES = [
  'the pair — arrivals are EMPTY once the join has fired and NON-EMPTY before it',
  'the release is AFTER the read — the join carries all three, keyed by branchPath',
  'RN-R13 — a settled branch result is reachable from `inputs` and `log`, and nothing else',
  'nothing the fold reads moved — no FoldInput carries what a join collected',
  'the unsatisfiable exit releases too — a region declared dead with arrivals in it',
  'rule 4 — an arrival at a join that has ALREADY become terminal records nothing',
  'a refusal that stops the run releases every region, and leaves the log whole',
  'rule 5 — a run the FOLD calls `stuck` still holds its collection, and that is the bound',
  'a `fanout` region releases as a `map` one does — the half that had no observer',
  'a nested region releases its OWN collection and leaves the enclosing one held',
  // **W85.** ADR 0062 consequence 7 — *a region's collection is released per INSTANCE,
  // and the opener's own entry goes when its last instance's does.* Both rows are the
  // shape `heldArrivals`' second level had no case for.
  'an opener entered N times releases PER INSTANCE, and the opener`s key goes with the last',
  'the unsatisfiable exit releases its OWN instance, and the sibling keeps what it held',
  'RN-R13 — `outputsCache` holds results BY REFERENCE, and identity is what says so',
  'the walk looks at EVERY growing structure — a new driver field fails here naming itself',
  'a run stopped from inside `append` does not route out of the join it was settling',
  // **W93.** `RN-R13`'s fourth term — a gate's memory — and what it holds: the KEY, not the value that reached the gate.
  'RN-R13 — a GATE`s memory is a fourth term: it holds the KEY, for the life of the run, and not the value it was handed',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  /**
   * **THE DISCRIMINATING PAIR, and `doc/workflow.md` section 5 rule 8's fourth
   * requirement on the set is why the difference is asserted too.** Two runs of ONE
   * definition at ONE arity, differing in exactly one thing: whether the last branch
   * settled. Collapse that — settle all three in both, or two in both — and one half
   * of this test fails naming which, rather than the suite quietly getting smaller.
   */
  test('the pair — arrivals are EMPTY once the join has fired and NON-EMPTY before it', async () => {
    const fired = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    fired.driver.start({});
    fired.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    const settledInFired = ['r1:score:0:0', 'r1:score:1:0', 'r1:score:2:0'];
    for (const id of settledInFired) fired.scheduler.settle(id, 'done', { result: { s: id } });

    const waiting = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    waiting.driver.start({});
    waiting.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    const settledInWaiting = ['r1:score:0:0', 'r1:score:1:0'];
    for (const id of settledInWaiting) waiting.scheduler.settle(id, 'done', { result: { s: id } });

    // **What makes the two differ, asserted rather than assumed.** The arity is the
    // same in both — three instances dispatched from one `items` array — so the pair
    // turns on SETTLEMENT and on nothing else. Section 5 rule 8's fourth requirement.
    equal(fired.ids().length, waiting.ids().length - 0 + 1,
      'the fired run dispatched one more task than the waiting one — the join`s successor. ' +
      'If these were equal the pair would be two copies of one run');
    equal(settledInFired.length, 3, 'three branches settled in the fired run — the whole region');
    equal(settledInWaiting.length, 2, 'two in the waiting run — one short, which is what keeps its join open');
    equal(
      fired.events.filter((e) => e.type === 'branch.arrived').length -
        waiting.events.filter((e) => e.type === 'branch.arrived').length,
      1,
      'and the difference reaches the region event stream as exactly one arrival, so the ' +
      'fixtures` disagreement is a fact about the RUN rather than about two literals',
    );

    // THE RULE. ADR 0046 rule 3.
    equal(heldArrivals(fired.driver), 0,
      'ADR 0046 rule 3 — the join became terminal, so the region`s collection is released. ' +
      'Before W53 this was 3 and stayed 3 for the life of the driver',
    );
    equal(arrivalsOf(fired.driver).size, 0,
      'and the region`s entry itself is gone, not merely emptied — an empty inner Map per ' +
      'region would still grow with the number of regions a run enters',
    );
    equal(heldArrivals(waiting.driver), 2,
      'JP-R12`s window is still OPEN in the other half: two branches have arrived at a join ' +
      'that has not become terminal, and the driver is holding exactly those two',
    );
  });

  /**
   * **The SECOND observer on the same fact, and it is what makes the release`s ORDER
   * load-bearing rather than a comment** — `doc/workflow.md` section 5 rule 8
   * obligation (c)'s LIMIT: a clause with one observer cannot corroborate itself.
   * The test above reads the driver's own map; this reads what the join CARRIED.
   * A release moved before `collectArrivals` leaves the first assertion green and
   * this one red — which is P15 fact 3's negative control, RE-TAKEN by W53 on the tree
   * this file ships at **14** L1-L5 failures, against **13** on the suite as it stood
   * before this file existed. The fourteenth is this case.
   */
  test('the release is AFTER the read — the join carries all three, keyed by branchPath', async () => {
    const h = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    for (const i of [0, 1, 2]) h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { s: i } });

    const carried = h.payloadOf('r1:publish:-:0');
    ok(
      deepEqual(carried, { 0: { s: 0 }, 1: { s: 1 }, 2: { s: 2 } }),
      'JP-R12 — one entry per branch that emitted branch.arrived, keyed by branchPath, in ' +
      'ascending segment-wise-numeric order. Released BEFORE this read, it is `{}`',
    );
    equal(Object.keys(carried as object), ['0', '1', '2'],
      'all three keys, so the collection was complete at the moment it was read',
    );
    equal(heldArrivals(h.driver), 0, 'and released immediately after, which is the pair');
  });

  /**
   * **`RN-R13` — which structures hold a settled result.** The rule says a run's
   * footprint is *(tasks settled) x (bytes each returned)* and names `inputs` as
   * what holds it; this is that claim made falsifiable. A second copy introduced
   * anywhere the driver can reach fails here naming the field it landed in.
   */
  test('RN-R13 — a settled branch result is reachable from `inputs` and `log`, and nothing else', async () => {
    const MARK = 'W53-MARKER-9f3c';
    const h = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });

    // BEFORE the join becomes terminal: two branches in, one still live.
    h.scheduler.settle('r1:score:0:0', 'done', { result: { s: MARK } });
    h.scheduler.settle('r1:score:1:0', 'done', { result: { s: MARK } });
    equal(holdersOf(h.driver, MARK), ['arrivals', 'inputs', 'log'],
      'inside JP-R12`s window the collection is a THIRD holder, and P15 fact 3 measured it ' +
      'as a second COPY rather than an alias — 49.8% of what a region-bearing run holds',
    );

    // AFTER: the join fires and the window closes.
    h.scheduler.settle('r1:score:2:0', 'done', { result: { s: MARK } });
    equal(holdersOf(h.driver, MARK), ['inputs', 'log'],
      'RN-R13 — `inputs` is what holds every result and `log` is its record-kind subsequence ' +
      'BY REFERENCE, so these two are one copy. A third name here is a second copy',
    );
    ok(
      JSON.stringify(h.driver.snapshot()).includes(MARK),
      'and the result itself is UNTOUCHED — rule 2. What was released is the copy nothing ' +
      'reads, never the log the fold is a pure function of',
    );
  });

  /**
   * **Decision 2, asserted rather than argued.** P15 forbids anything that makes
   * `fold()` return a plausible wrong answer. The release cannot, and the reason is
   * structural: no `FoldInput` kind carries a join's collection at all — `dispatched`
   * carries a `taskId` and nothing else, which is `spec/run-state.md` section 6's own
   * sentence. **This is also the [Q15](../../doc/questions/q15.md) finding**: a run
   * resumed from a persisted log cannot be handed a collection no log carries.
   */
  test('nothing the fold reads moved — no FoldInput carries what a join collected', async () => {
    const MARK = 'W53-COLLECTED-4d71';
    const h = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    for (const i of [0, 1, 2]) h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { [MARK]: i } });

    // **`publish` is settled too, and the reason is `RN-R7`/`RN-R10`'s precedence
    // rather than tidiness**: the join's successor is dispatched and not yet settled,
    // so the run is `running` — which outranks `completed` and says nothing about
    // this rule. The first draft asserted `completed` here and the suite caught it.
    h.scheduler.settle('r1:publish:-:0', 'done', { result: { ok: true } });

    const inputs = h.driver.foldInputs();
    const nonRecord = inputs.filter((i: FoldInput) => i.kind !== 'outcome' && i.kind !== 'resolution');
    ok(nonRecord.length > 0, 'the sequence carries region events, dispatches and a joinSettled');
    equal(
      nonRecord.filter((i: FoldInput) => JSON.stringify(i).includes(MARK)).map((i: FoldInput) => i.kind),
      [],
      'no non-record input carries a result at all, so the collection a join carries is in ' +
      'NO element of the fold`s sequence — which is why releasing it cannot change fold()',
    );
    const state = fold(inputs);
    equal(state.outcome, 'completed',
      'RN-R10 — every live path reached an `end`, and it still does with the collection released',
    );
    equal(Object.keys(state.nodes).length, 5,
      'ingest, three instances and publish — one entry per DISPATCHED task (RN-R4), unmoved',
    );
  });

  /**
   * **ADR 0046 rule 3's OTHER site, and it is the reachable half of the exception.**
   * A policy reporting `unsatisfiable` latches `firedJoins` and routes nowhere, so
   * the region's collection is dead without ever having been read.
   *
   * **The policy is a STUB and that is recorded rather than argued** —
   * `doc/workflow.md` section 5 rule 8: *construct the case that makes each guard
   * fire, and where the corpus cannot express one, RECORD that*. None of the three
   * shipped policies reaches this shape: `arrival-count` fires on the N-th arrival,
   * and both live-token variants answer `unsatisfiable` only when every branch is
   * terminal and **none arrived**, so the one region they can declare dead holds an
   * empty collection and could not discriminate a release from its absence. A policy
   * that declares a region dead with arrivals recorded is lawful under `JP-R3` and is
   * what this asserts.
   */
  test('the unsatisfiable exit releases too — a region declared dead with arrivals in it', async () => {
    // **The counter lives in the policy's own state `S`, and that is not tidiness** —
    // W53's adequacy reader. The first version kept it in a closure, so `step` mutated
    // something outside `S` and `status` was **not a function of its argument**: `S`
    // was `{}` throughout and the answer changed anyway. `JP-R1` says *every method is
    // pure — no clock, no scheduler, no IO, no mutation of `S`*, so the exhibit for
    // ADR 0046 rule 3's unsatisfiable arm was a policy this document's FIRST rule
    // forbids, while that rule's justification rests on such a policy being LAWFUL.
    // Rewritten below with the counter in `S`; every assertion is unchanged.
    type DeadState = { terminals: number };
    const deadAfterTwo: JoinPolicy = {
      id: 'w53-dead-after-two',
      open: () => ({ terminals: 0 }),
      step: (s: DeadState, e: RegionEvent) =>
        (e.type === 'branch.arrived' || e.type === 'branch.exited' || e.type === 'branch.lost'
          ? { terminals: s.terminals + 1 }
          : s),
      status: (s: DeadState) => (s.terminals >= 2 ? 'unsatisfiable' : 'waiting'),
      describe: () => 'w53 — declared dead with one branch already arrived',
    } as unknown as JoinPolicy;

    const h = harness(await load(MAP_FANOUT), deadAfterTwo);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });

    h.scheduler.settle('r1:score:0:0', 'done', { result: { s: 0 } });
    equal(heldArrivals(h.driver), 1,
      'one arrival recorded and the policy still waiting — the window is open, which is what ' +
      'makes the next assertion a release rather than an empty map',
    );

    h.scheduler.settle('r1:score:1:0', 'done', { result: { s: 1 } });
    equal(h.unsatisfiable.length, 1, 'the policy declared the region dead on the second terminal event');
    equal(heldArrivals(h.driver), 0,
      'ADR 0046 rule 3 — `firedJoins` latched, so no later settleJoin for this region runs and ' +
      'no later arrival is recorded. The collection is unreachable and is released',
    );

    // **The third instance is settled so the run reaches a quiescent point with
    // nothing running** — `RN-R10`'s precedence puts `running` above `stuck`, so a
    // region with a live branch says nothing about a dead join. It also exercises
    // rule 4 in passing: this arrival reaches a join that is already terminal.
    h.scheduler.settle('r1:score:2:0', 'done', { result: { s: 2 } });
    equal(heldArrivals(h.driver), 0, 'and rule 4 held for it — nothing was recorded');

    const state = fold(h.driver.foldInputs());
    equal(state.outcome, 'stuck',
      'RN-R10 — a joinSettled with fired:false gives the region joined:false, and nothing ' +
      'downstream of the join is ever dispatched. The release did not change that',
    );
    equal(state.regions['split']?.['-']?.joined, false,
      'RN-R11 — `false` means a policy reported it unsatisfiable, which is this row`s whole shape',
    );
  });

  /**
   * **ADR 0046 rule 4's opening bound.** Without it the release is a leak with a
   * narrower mouth: an arrival reaching a join that has already become terminal would
   * mint a fresh inner map and store a payload nothing can read, once per late
   * arrival, for the life of the run.
   *
   * **Constructed, for the same reason as the row above** — no shipped policy fires a
   * join with branches still live, which is precisely the precondition
   * [Q95](../../doc/questions/q95.md) records for `settleJoin`'s own `at most once`
   * latch. The same hypothetical policy, reaching the same region through a second
   * door.
   *
   * **And the guard is LESS hypothetical than that sentence says** — W53's conformity
   * reader instrumented it: over one `node test/runner.ts` it fires **nine** times, and
   * only three of those are this file's constructed policies. The other six come from
   * four pre-existing test policies — `stub-arrival`, `always`, `dead-on-first-arrival`
   * and `dead-then-alive` — on regions `split` and `perItem`. So the suite already
   * exercises rule 4 outside this case, which is stronger than a constructed row and is
   * recorded rather than left looking speculative.
   */
  test('rule 4 — an arrival at a join that has ALREADY become terminal records nothing', async () => {
    const eagerly: JoinPolicy = {
      id: 'w53-satisfied-at-once',
      open: () => ({}),
      step: (s: unknown) => s,
      status: () => 'satisfied',
      describe: () => 'w53 — satisfied on the first terminal event, with branches still live',
    } as unknown as JoinPolicy;

    const h = harness(await load(MAP_FANOUT), eagerly);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });

    h.scheduler.settle('r1:score:0:0', 'done', { result: { s: 0 } });
    ok(h.ids().includes('r1:publish:-:0'), 'the join fired on the first arrival and routed out');
    equal(heldArrivals(h.driver), 0, 'and released what it read');

    // The two branches that were still live now arrive at a join that is terminal.
    h.scheduler.settle('r1:score:1:0', 'done', { result: { s: 1 } });
    h.scheduler.settle('r1:score:2:0', 'done', { result: { s: 2 } });
    equal(heldArrivals(h.driver), 0,
      'ADR 0046 rule 4 — outside JP-R12`s window nothing is recorded. Without the firedJoins ' +
      'guard in `enter`s join arm these two payloads are held for the life of the run and ' +
      'are readable by nothing, which is the defect rule 3 exists to remove',
    );
    equal(arrivalsOf(h.driver).size, 0,
      'and no entry was MINTED for the region either — `arrivalsOf` creates on first touch, so ' +
      'a guard placed on the `set` alone would leave one empty Map per late arrival`s region',
    );
  });

  /**
   * **ADR 0046 rule 3's run-level moment.** `OR-R10` — the driver has stopped
   * routing, so no join of any region will settle again and every collection is
   * unreadable whether or not its join had fired.
   */
  test('a refusal that stops the run releases every region, and leaves the log whole', async () => {
    const MARK = 'W53-STOPPED-7b20';
    const h = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });

    h.scheduler.settle('r1:score:0:0', 'done', { result: { s: MARK } });
    equal(heldArrivals(h.driver), 1, 'one branch has arrived and the join is still waiting');

    // OR-R6 — an uncloneable result stops the run at the listener boundary.
    h.scheduler.settle('r1:score:1:0', 'done', { result: { bad: () => 1 } });
    equal(h.failures.map((f) => f.kind), ['UncloneableResult'],
      'OR-R6 — structuredClone throws and the run is stopped, naming the task id',
    );
    equal(heldArrivals(h.driver), 0,
      'ADR 0046 rule 3 — the run stopped, so nothing can route again and every region`s ' +
      'collection is released. This is not per-region: the whole map is cleared',
    );
    ok(
      JSON.stringify(h.driver.snapshot()).includes(MARK),
      'rule 2 — and the LOG is untouched. A stopped run is a run a consumer folds to find out ' +
      'what happened, so releasing what the fold reads is the plausible wrong answer P15 ' +
      'decision 2 forbids',
    );
    equal(fold(h.driver.foldInputs()).outcome, 'stopped', 'RN-R8 — stopped outranks everything');
  });

  /**
   * **ADR 0046 rule 5 — the exception, on a corpus flow, with the fold`s own word for
   * it.** A region whose join never becomes terminal holds its collection until the
   * driver is released, and the driver cannot know: `stuck` is decided in the FOLD at
   * a quiescent point (`RN-R10`), and moving that determination into the driver is
   * what ADR 0014 rule 4 and ADR 0001 rule 1 both forbid.
   *
   * **This is the run whose footprint matters most and the one the release does not
   * reach**, which is why the rule states the bound over LIVE regions rather than
   * over the run.
   */
  test('rule 5 — a run the FOLD calls `stuck` still holds its collection, and that is the bound', async () => {
    const h = harness(
      await load('valid/p1-routed-away.flow.json'),
      arrivalCount as JoinPolicy,
      new Map([['isLowConfidence', () => true]]),
    );
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { confidence: 0.1 } });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: { s: 'a' } });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { s: 'b' } });

    equal(h.events.filter((e) => e.type === 'branch.arrived').map((e) => e.branchPath), ['0'],
      'P1`s case — scoreB routes away to `abandoned`, so exactly one branch arrives and ' +
      'arrival-count is short of its N forever',
    );
    equal(
      h.driver.foldInputs().filter((i: FoldInput) => i.kind === 'joinSettled').length, 0,
      'the join never became terminal — no policy said unsatisfiable and the driver never ' +
      'routed out, so neither of ADR 0046 rule 3`s per-region moments occurred',
    );
    equal(heldArrivals(h.driver), 1,
      'ADR 0046 rule 5 — the collection is RETAINED, and that is the rule rather than a leak. ' +
      'A run that hangs is exactly the run that keeps everything',
    );
    equal(fold(h.driver.foldInputs()).outcome, 'stuck',
      'RN-R10 says `stuck` and the DRIVER was never told — which is why the bound is stated ' +
      'over regions whose join is still live rather than over the run',
    );
  });

  /**
   * **A `fanout` region releases too, and before this case the WHOLE `fanout` half of
   * rule 3 had no observer** — W53's adequacy reader, which made `releaseArrivals`
   * return early for anything that is not a `map` region and measured **zero**
   * failures at every rung. Every release-observing case above uses
   * `map-fanout.flow.json`; the one `fanout` flow in this file is the case where the
   * join does NOT fire.
   *
   * **It is [W41](../../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)'s
   * finding verbatim** — *every one of the author's 37 probes used a map region, so a
   * rule wrong about `fanout` regions was unreachable from the set* — and it is what
   * `JP-R11`'s own Test cell insists on by requiring both kinds.
   */
  test('a `fanout` region releases as a `map` one does — the half that had no observer', async () => {
    const h = harness(await load('valid/fanout-join.flow.json'), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { seed: 1 } });

    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: { s: 'a' } });
    equal(heldArrivals(h.driver), 1, 'one branch in, the join still waiting — the window is open');

    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { s: 'b' } });
    ok(
      deepEqual(h.payloadOf('r1:publish:-:0'), { 0: { s: 'a' }, 1: { s: 'b' } }),
      'JP-R12 — both branches, keyed by branchPath, so the release came after the read here too',
    );
    equal(heldArrivals(h.driver), 0,
      'ADR 0046 rule 3 is about a REGION and not about a region KIND. `FD-V9`s floor makes a ' +
      'fanout`s arity something an author wrote down, which is exactly why a rule wrong about ' +
      'this half would never show up in a map fixture',
    );
  });

  /**
   * **A NESTED region releases its own collection and NOT its parent's** — W53's
   * adequacy reader, which made `releaseArrivals` return early whenever the region was
   * itself inside a region and measured **zero** failures at every rung.
   *
   * This falsifies a claim in the item's own Verification section: *a nested fan-out
   * ([Q6](../../doc/questions/q6.md)) is covered, because the clear is keyed by
   * region and a nested region has its own key.* **Keyed-by-region was an argument and
   * not a case** — every fixture above is depth 1 — and a nested region is where the
   * arity multiplies, so it is the shape fact 3's 49.8% is largest on.
   */
  test('a nested region releases its OWN collection and leaves the enclosing one held', async () => {
    const h = harness(await load('valid/nested-fanout.flow.json'), liveToken as JoinPolicy);
    h.driver.start({});

    // `scoreA` arrives at the OUTER join; `scoreC`/`scoreD` arrive at the INNER one.
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: { s: 'a' } });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { s: 'b' } });
    equal([...arrivalsOf(h.driver).keys()].sort(), ['outer'],
      'only the outer region has a collection so far: scoreA arrived there, and the inner ' +
      'region has just been opened by scoreB settling',
    );

    h.scheduler.settle('r1:scoreC:1.0:0', 'done', { result: { s: 'c' } });
    equal([...arrivalsOf(h.driver).keys()].sort(), ['inner', 'outer'],
      'both windows are open at once, at two depths — which is the state a release keyed by ' +
      'anything other than the region would destroy',
    );
    equal(heldArrivals(h.driver), 2, 'one arrival in each');

    h.scheduler.settle('r1:scoreD:1.1:0', 'done', { result: { s: 'd' } });
    equal([...arrivalsOf(h.driver).keys()].sort(), [],
      'the inner join fired and released `inner`; the outer join then fired on the inner ' +
      'join`s arrival as branch 1 and released `outer`. Both, in one settlement',
    );
    equal(fold(h.driver.foldInputs()).outcome, 'completed',
      'ADR 0030 — a join is transitive over nested fan-out, and releasing per region did not ' +
      'disturb it. Releasing ALL regions instead costs 1 failure in the L5 matrix, where a ' +
      'nested outer join then carries ["1"] against the ["0","1"] JP-R12 declares',
    );
  });

  /**
   * **ADR 0062 consequence 7, and the case `heldArrivals`' second level had none of.**
   * That sentence reads *a region's collection is released per INSTANCE, and the
   * opener's own entry goes when its last instance's does — so a run that released
   * everything holds no key at all rather than N empty maps.* Every fixture above
   * loads a document in which each opener has exactly ONE instance, so the walk's
   * inner loop could be narrowed to each opener's first entry for **zero**.
   *
   * **The settlements are INTERLEAVED and the order is load-bearing**, which is
   * W84's own finding one file over ([Q349](../../doc/questions/q349.md)): with
   * instances settling in dispatch order there is never a second collection to
   * confuse the first with, so *release the instance being settled* and *release the
   * opener's whole entry* are the same expression. Instance **1** closes first here
   * on purpose — instance 0 is also `values()[0]`, so closing it first leaves a
   * release keyed by the opener looking right.
   */
  test('an opener entered N times releases PER INSTANCE, and the opener`s key goes with the last', () => {
    const h = harness(FANOUT_IN_MAP, liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    for (const i of [0, 1]) h.scheduler.settle(`r1:lead:${i}:0`, 'done', { result: {} });

    // One branch of each instance. Neither join can fire, so BOTH windows are open.
    h.scheduler.settle('r1:p:0.0:0', 'done', { result: { s: 'p0' } });
    h.scheduler.settle('r1:p:1.0:0', 'done', { result: { s: 'p1' } });
    equal(heldByInstance(h.driver), { 'f2@0': 1, 'f2@1': 1 },
      'TWO instances of ONE opener are holding at the same instant, one entry each — the state a ' +
      'single-instance fixture cannot reach, and the state in which the walk`s two levels stop ' +
      'agreeing with each other',
    );
    equal(heldArrivals(h.driver), 2,
      'and the total agrees with the decomposition, which is what holds the sum`s inner loop to ' +
      'the key set: narrowed to each opener`s FIRST instance this reads 1',
    );

    h.scheduler.settle('r1:q:1.1:0', 'done', { result: { s: 'q1' } });
    equal(heldByInstance(h.driver), { 'f2@0': 1, 'split@-': 1 },
      'instance 1`s join fired and released ITS OWN collection; instance 0 still holds what it had, ' +
      'and the ENCLOSING map now holds the value instance 1 routed into it. A release keyed by the ' +
      'opener drops f2@0 here and the opener`s key disappears with it',
    );

    h.scheduler.settle('r1:q:0.1:0', 'done', { result: { s: 'q0' } });
    equal(heldByInstance(h.driver), {},
      'and with the last instance released the OPENER`S OWN KEY is gone too — ADR 0062 ' +
      'consequence 7`s second half: a run that released everything holds no key at all rather than ' +
      'N empty maps',
    );
    equal([...arrivalsOf(h.driver).keys()], [],
      'asserted on the outer map directly as well, because an empty inner map and an absent one ' +
      'are the same number and different structures',
    );
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });
    equal(fold(h.driver.foldInputs()).outcome, 'completed',
      'and the interleaving changed the ORDER and not the outcome, which is what makes the two ' +
      'releases above comparable with the sequential case',
    );
  });

  /**
   * **The other exit, per instance.** `releaseArrivals` is called at BOTH ends of
   * `settleJoin`, and the `unsatisfiable` one has no route that reads the collection
   * first — so it is the arm where a release keyed one level short is completely
   * silent. W85's declaration step measured it at **zero**.
   *
   * The policy is constructed for the same reason W53's is: no shipped policy
   * declares a region dead with an arrival recorded in it.
   */
  test('the unsatisfiable exit releases its OWN instance, and the sibling keeps what it held', () => {
    type DeadState = { target: boolean; terminals: number };
    const deadInnerAfterOne: JoinPolicy = {
      id: 'w85-dead-inner-after-one',
      open: (region: { fanoutId: string }) => ({ target: region.fanoutId === 'f2', terminals: 0 }),
      step: (s: DeadState, e: RegionEvent) =>
        (e.type === 'branch.arrived' ? { ...s, terminals: s.terminals + 1 } : s),
      // Scoped to `f2`, so the enclosing map's join is an ordinary waiting one and the
      // only thing that moves is an inner INSTANCE.
      // **TWO terminals and not one**, so the arrival is HELD before the death: a policy
      // that dies on the first arrival releases in the same call that recorded it, and
      // then nothing is ever holding and this row asserts an empty map twice.
      status: (s: DeadState) => (s.target && s.terminals >= 2 ? 'unsatisfiable' : 'waiting'),
      describe: (s: DeadState) => ({ w85: 'dead with an arrival recorded', terminals: s.terminals }),
    } as unknown as JoinPolicy;

    const h = harness(FANOUT_IN_MAP, deadInnerAfterOne);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    for (const i of [0, 1]) h.scheduler.settle(`r1:lead:${i}:0`, 'done', { result: {} });

    h.scheduler.settle('r1:p:1.0:0', 'done', { result: { s: 'p1' } });
    h.scheduler.settle('r1:p:0.0:0', 'done', { result: { s: 'p0' } });
    equal(heldByInstance(h.driver), { 'f2@1': 1, 'f2@0': 1 },
      'both instances hold one arrival and neither policy has died yet — the window this exit has ' +
      'to close, open twice at once under ONE opener',
    );

    // **Instance 1 dies FIRST, and the order is the claim.** Killing instance 0 first
    // would leave *release the dying instance* and *release the opener's first entry*
    // the same expression, because instance 0 is also `values()[0]`.
    h.scheduler.settle('r1:q:1.1:0', 'done', { result: { s: 'q1' } });
    equal(heldByInstance(h.driver), { 'f2@0': 1 },
      'instance 1 is declared dead and the `unsatisfiable` arm released ITS collection alone — ' +
      'which is the arm with no route that reads the collection first, so a release keyed one ' +
      'level short is completely silent there. Instance 0 still holds what it had',
    );
    equal((h.unsatisfiable as { fanoutId: string; regionPath: string }[])
      .map((u) => `${u.fanoutId}@${u.regionPath}`), ['f2@1'],
      'and the report names the instance that died, not the opener — `UnsatisfiableJoin.regionPath`',
    );

    h.scheduler.settle('r1:q:0.1:0', 'done', { result: { s: 'q0' } });
    equal(heldByInstance(h.driver), {},
      'and instance 0 then dies on its own account, releasing its own — so the DEATH of one ' +
      'instance neither released nor latched the other, which is the same expression`s too-STRONG ' +
      'direction on the arm that had no observer at all',
    );
    equal((h.unsatisfiable as { fanoutId: string; regionPath: string }[])
      .map((u) => `${u.fanoutId}@${u.regionPath}`), ['f2@1', 'f2@0'],
      'both deaths reported, each naming its own instance, in the order they occurred',
    );
  });

  /**
   * **`RN-R13`'s ALIAS half, and it needs IDENTITY rather than a holder set** — both of
   * W53's readers, from opposite ends, and it is the one subject they shared.
   *
   * The conformity reader ran this file's own `holdersOf` predicate against a corpus
   * flow that declares a `needs` and got a **third** name: `outputsCache` holds a
   * settled result, so *"the set is exactly `{inputs, log}`"* is false wherever
   * `outputs()` has been called. The adequacy reader came the other way and made that
   * memo `structuredClone` what it stores — **a real second copy of every result, for
   * ZERO failures at every rung** — because both fixtures above declare no `needs`, so
   * the memo is `null` in all of their cases.
   *
   * **That is P15 fact 1's own defect reproduced inside the test written to correct
   * it.** Fact 1 recorded `outputsCache` as `null` because it enumerated properties on
   * flows with no `needs`; ADR 0046's measurement 2 corrects that by name, and this
   * file then chose its fixtures the same way.
   *
   * **A reachability SET cannot tell an alias from a copy. Identity can**, and that is
   * what the rule now says and what this asserts.
   */
  test('RN-R13 — a GATE`s memory is a fourth term: it holds the KEY, for the life of the run, and not the value it was handed', async () => {
    // `gated-map`: two files of ONE series, so the second is a duplicate. The KEY carries one marker and the rest of
    // the value another — so a memory that kept what reached the gate, rather than the key, holds the wrong marker.
    const KEY = 'W93-KEY-7b1e', REST = 'W93-REST-c40d';
    const h = harness(await load('valid/gated-map.flow.json'), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { files: [{ n: 0 }, { n: 1 }] } });
    h.scheduler.settle('r1:identify:0:0', 'done', { result: { series: { id: KEY }, note: REST } });
    h.scheduler.settle('r1:identify:1:0', 'done', { result: { series: { id: KEY }, note: REST } });
    equal(holdersOf(h.driver, KEY), ['gateMemory', 'inputs', 'log'],
      'the key is held by the gate`s memory beside `inputs` and `log` — a FOURTH holder, the memory`s own copy of the key');
    equal(holdersOf(h.driver, REST), ['inputs', 'log'],
      'and the REST of the value is not — the memory holds the key and nothing the key did not name');
    h.scheduler.settle('r1:setup:0:0', 'done', { result: { set: 1 } });
    h.scheduler.settle('r1:publish:-:0', 'done', { result: { ok: true } });
    equal(fold(h.driver.foldInputs()).outcome, 'completed', 'the run COMPLETED — the join fired and its collection was released');
    equal(holdersOf(h.driver, KEY), ['gateMemory', 'inputs', 'log'],
      'and the memory is STILL held: unlike a region`s collection it has no terminal moment inside the run, so it is retained for the life of the run');
  });

  test('RN-R13 — `outputsCache` holds results BY REFERENCE, and identity is what says so', async () => {
    const h = harness(await load('valid/map-over-region-output.flow.json'), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    for (const i of [0, 1]) h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { s: i } });

    const cached = cachedResults(h.driver);
    ok(cached.length > 0,
      'the memo is POPULATED — `rank` declares needs {scores: ["score"]}, so `outputs()` ran. ' +
      'On a flow that declares no `needs` it is null, which is the fixture gap both readers found',
    );
    const logged = loggedResults(h.driver);
    equal(cached.filter((r) => !logged.some((l) => l === r)), [],
      'RN-R13 — every entry IS a log record`s own result object, by reference. Clone them here ' +
      'and the memo becomes a second copy of every result: measured at ZERO failures across ' +
      'lint, typecheck, check:spec, L1-L5 and L6 before this assertion existed',
    );
    equal(cached.length, logged.length,
      'and it holds one per settled task rather than a subset, so the identity check above is ' +
      'not vacuous on an almost-empty cache',
    );

    // **And the holder SET on this same run reaches a FOURTH name**, which is what
    // makes the walk's universe load-bearing rather than decorative. Every other case
    // in this file expects a subset of {inputs, log, arrivals}, so pinning the walk to
    // exactly those three names cost ZERO — measured in rule 8's re-run, with the
    // adequacy reader's own edit checked back in. This row is the one that fails.
    const MARK = 'W53-ALIAS-3e8a';
    const h2 = harness(await load('valid/map-over-region-output.flow.json'), liveToken as JoinPolicy);
    h2.driver.start({});
    h2.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    for (const i of [0, 1]) h2.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { s: MARK } });
    equal(holdersOf(h2.driver, MARK), ['inputs', 'log', 'outputsCache'],
      'RN-R13 — on a flow that declares a `needs` the memo is a HOLDER, and the set says so. ' +
      'This is the case the rule`s first draft denied: `exactly {inputs, log}` is false wherever ' +
      '`outputs()` has been called, and only the identity check above says it is not a COPY',
    );
  });

  /**
   * **The walk's UNIVERSE is bound to the driver's own property names, both ways** —
   * W53's adequacy reader, which pinned `holdersOf`'s loop to
   * `['inputs', 'log', 'arrivals']` and measured **zero** failures at every rung with
   * both expected literals untouched. `doc/workflow.md` section 5 rule 8 obligation
   * (d), applied to the observer's own loop rather than to a row — and obligation
   * (e)'s third shape, because `NOT_RUN_STATE` is a list and the driver's fields are
   * the other list.
   *
   * **This is also `RN-R13`'s ratchet.** *A sixth structure holding a result is a
   * second copy and this is what would say so* is only true if the walk looks at
   * everything; a new field on the driver fails here, naming itself.
   */
  test('the walk looks at EVERY growing structure — a new driver field fails here naming itself', async () => {
    const h = harness(await load(MAP_FANOUT), liveToken as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });

    const own = Object.keys(h.driver as unknown as Record<string, unknown>).sort();
    equal(own, DRIVER_FIELDS,
      'the driver`s own property names. A field ADDED here is a candidate second copy and ' +
      'RN-R13 is the rule that has to be re-measured for it; a field REMOVED is a structure ' +
      'this file stops observing. Either way it is one edit and this names it',
    );
    equal(NOT_RUN_STATE.filter((k) => !own.includes(k)), [],
      'everything the walk excludes actually exists on the driver — an exclusion for a field ' +
      'that is gone silently widens nothing and hides that the list went stale',
    );
    equal(walkableKeys(h.driver).filter((k) => NOT_RUN_STATE.includes(k)), [],
      'and the walk excludes exactly those three, so the two lists account for each other ' +
      'BOTH WAYS: pinning the universe to the answer the assertions expect fails here',
    );
    equal(walkableKeys(h.driver).length, own.length - NOT_RUN_STATE.length,
      'a count BESIDE the membership — it catches a duplicate entry, which set equality cannot',
    );
  });

  /**
   * **`OR-R10` on the one door into `settleJoin` that is already OPEN** — W53's
   * conformity reader. `append` calls `onFoldInput` un-wrapped, so a re-entrant
   * listener can reach `failRun` — and `failRun` is where every region's collection is
   * released. The three doors `failRun`'s own comment enumerates are all shut behind
   * `this.failed`; the door on the STACK is not.
   *
   * **W53 did not create the defect and it made it SILENT.** A stopped run routing out
   * of a join is `OR-R10`'s violation and pre-dates this item; before W53 the successor
   * was dispatched with the full collection, and after it with **`{}`** — which looks
   * exactly like `live-token`'s legitimate all-exited case.
   */
  test('a run stopped from inside `append` does not route out of the join it was settling', async () => {
    const scheduler = new FakeScheduler();
    const failures: { kind: string; message: string }[] = [];
    let stopOnJoinSettled = false;
    const driver = new Driver(await load(MAP_FANOUT), {
      runId: 'r1',
      scheduler,
      createTask: (c) => c,
      predicates: new Map() as never,
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
      joinPolicy: liveToken as JoinPolicy,
      onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
      // A listener that stops the run at the moment the join settles. `OR-R10` says
      // the driver has stopped routing from here on; nothing may be dispatched after.
      onFoldInput: (i: FoldInput) => {
        if (stopOnJoinSettled && i.kind === 'joinSettled' && i.fired) {
          stopOnJoinSettled = false;
          // **It must reach `failRun` and RETURN, not unwind.** The first version of
          // this listener THREW, which reported the same failure and asserted the same
          // absence — and it asserted it by the wrong route: a throw propagates out of
          // `append` and out of `settleJoin`, so the guard below it is never reached
          // and removing that guard cost ZERO. Measured, in rule 8's re-run with the
          // reader's own edit checked back in. What reaches `failRun` and comes BACK
          // is a re-entrant scheduler event: `onEvent` catches, calls `failRun`, and
          // returns normally — leaving `this.failed` true with `settleJoin` still on
          // the stack, which is the shape the conformity reader measured.
          scheduler.settle('r1:score:0:0', 'done', { result: { uncloneable: () => 1 } });
        }
      },
    });
    driver.start({});
    scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    stopOnJoinSettled = true;
    for (const i of [0, 1, 2]) scheduler.settle(`r1:score:${i}:0`, 'done', { result: { s: i } });

    const dispatched = scheduler.added.map((t) => t.id);
    equal(dispatched.filter((id) => id.includes(':publish:')), [],
      'OR-R10 — the run was stopped inside the append that announced the join, so the join`s ' +
      'successor is NOT dispatched. Without the guard it is dispatched carrying `{}`, because ' +
      'failRun released every region one frame earlier',
    );
    equal(failures.map((f) => f.kind), ['UncloneableResult'],
      'and the run really did stop rather than the listener being unreachable — `OR-R6` fired ' +
      'on the re-entrant settlement and was reported through onRunFailure exactly once. This ' +
      'is the pair`s second half: without a stop there is nothing for the guard to guard',
    );
    equal(fold(driver.foldInputs()).outcome, 'stopped', 'RN-R8 — stopped outranks everything');
  });

  /**
   * **The CASE MEMBERSHIP, and it is this suite's own `ROW_KEYS`** — W53's adequacy
   * reader, which deleted seven of this file's eight cases plus the helpers they
   * orphaned and measured **exit 0 at every rung**, with `LATE_SUITES` still green
   * because that census is a membership over SUITE NAMES and the suite was still
   * there. The assertion count fell 689 -> 682 and nothing reads it.
   *
   * **`ROW_KEYS`' shape, one layer in** — set equality against the cases that actually
   * ran, so a deleted case fails NAMING itself. **Its limit is stated rather than
   * hidden**, exactly as `ROW_KEYS`' and `CROSS_ROW_SUBJECTS`' are: this is a literal,
   * so deleting a case and its name is two edits in one diff
   * ([Q102](../../doc/questions/q102.md), [Q217](../../doc/questions/q217.md)).
   *
   * **What it does NOT catch is [Q234](../../doc/questions/q234.md)**, and the two are
   * the count/membership distinction playing out: a case EMPTIED with an early return
   * is still present, still named, and still counted. A membership catches deletion;
   * nothing here catches an emptied body.
   */
  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    // `collected()` is `{suite, cases}[]`, registered at module load, so by the time
    // this case RUNS every case in this file is in it.
    const ran = collected().filter((s) => s.suite === SUITE)
      .flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [],
      'a declared case did not run — it was deleted, renamed, or its suite stopped loading. ' +
      'Deleting seven of eight cost ZERO before this assertion existed',
    );
    equal(ran.filter((n) => !declared.includes(n)), [],
      'a case ran that this list does not name. Add it here in the same commit; the ratchet is ' +
      'deliberate and is `ROW_KEYS`s',
    );
    equal(ran.length, DECLARED_CASES.length,
      'and the COUNT beside the membership, which catches a duplicated name that set equality ' +
      'reads as one',
    );
  });
});
