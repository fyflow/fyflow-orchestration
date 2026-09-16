/**
 * **What the driver hands `createTask` for a node that says something about its own task** —
 * `spec/flow-definition.md` section 2 (v0.16), ladder L2,
 * [W58](../../doc/work-items/w58-what-a-node-says-about-its-own-task.md).
 *
 * Three claims, each asserted on the three shapes a task node takes (`doc/workflow.md` section
 * 5 rule 8 obligation (a), v0.16): a top-level task, a task inside a `fanout` branch, and the
 * branch task of a `map` — where the passthrough is per INSTANCE, which is the shape the feature
 * was not built for.
 *
 *   1. both keys reach the factory exactly as declared;
 *   2. the merge rule — *the node wins, whole* — with a node whose policy differs from the
 *      driver's default in BOTH fields, so a field-by-field merge is distinguishable;
 *   3. a node that declares neither hands the factory the exact four-field object it always did
 *      — `Object.keys`, not a deep-equal that would let `retryPolicy: undefined` through.
 *
 * And the construction refusal: `groups` omitted is an EMPTY set (`FD-V31`), so a definition
 * declaring one throws `InvalidDefinition` naming the rule before anything is queued.
 *
 * Every expected value is copied from the definition under test, never from the run.
 */
import { equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, InvalidDefinition } from '../../src/driver/driver.ts';
import { POLICIES } from '../../src/fold/policies.ts';
import { shapesOf } from '../definition/task-shapes.ts';
import type { FlowDefinition, RetryPolicy } from '../../src/definition/types.ts';

class Fake {
  added: Record<string, unknown>[] = [];
  private l = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown) { this.added.push(t as Record<string, unknown>); }
  addEventListener(t: string, f: (e: { detail: unknown }) => void) { this.l.set(t, [...(this.l.get(t) ?? []), f]); }
  settle(id: string, result: unknown) {
    const d = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const f of this.l.get('task.completed') ?? []) f({ detail: d });
  }
  byId(id: string): Record<string, unknown> {
    const t = this.added.find((x) => x.id === id);
    if (!t) throw new Error(`no task ${id} was added; added: ${this.added.map((x) => x.id).join(', ')}`);
    return t;
  }
}

const NODE_POLICY: RetryPolicy = { maxRetries: 1, backoffMs: 0 };
const DRIVER_DEFAULT: RetryPolicy = { maxRetries: 5, backoffMs: 100 };
const WORKER_TYPES = ['IngestWorker', 'ScoreWorker'];

/**
 * Each shape: build the document with `extra` on the task under test, drive the run far enough
 * for that task to be dispatched, and return the ids of the dispatches the task under test
 * produced (three for the map, one otherwise) plus one id of a task that declares nothing.
 */
const SHAPES: readonly [string, (extra: Record<string, unknown>, s: Fake, opts: Partial<ConstructorParameters<typeof Driver>[1]>) => { subject: string[]; control: string }][] = [
  ['top-level task', (extra, s, opts) => {
    const def = {
      flowId: 'top', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'score' }] },
        { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'done' }], ...extra },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...typesFor(WORKER_TYPES), now: () => 1, ...opts });
    d.start({});
    s.settle('r1:ingest:-:0', {});
    return { subject: ['r1:score:-:0'], control: 'r1:ingest:-:0' };
  }],
  ['task inside a fanout branch', (extra, s, opts) => {
    const def = {
      flowId: 'fan', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
        { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }], ...extra },
        { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...typesFor(WORKER_TYPES), now: () => 1, joinPolicy: POLICIES['live-token'], ...opts });
    d.start({});
    s.settle('r1:ingest:-:0', {});
    // The SIBLING branch is the control here: same region, same kind, declares nothing.
    return { subject: ['r1:scoreA:0:0'], control: 'r1:scoreB:1:0' };
  }],
  ['branch task of a map', (extra, s, opts) => {
    const def = {
      flowId: 'map', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'each' }] },
        { id: 'each', kind: 'map', over: 'items', branch: 'rank' },
        { id: 'rank', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'gather' }], ...extra },
        { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...typesFor(WORKER_TYPES), now: () => 1, joinPolicy: POLICIES['live-token'], ...opts });
    d.start({});
    s.settle('r1:ingest:-:0', { items: ['a', 'b', 'c'] });
    return { subject: ['r1:rank:0:0', 'r1:rank:1:0', 'r1:rank:2:0'], control: 'r1:ingest:-:0' };
  }],
];

suite('W58 — retryPolicy and workerGroups reach createTask exactly as the node declares them', (test) => {
  for (const [shape, drive] of SHAPES) {
    test(`${shape}: both keys arrive, deep-equal to the declaration, on every dispatch of the node`, () => {
      const s = new Fake();
      const { subject, control } = drive({ retryPolicy: NODE_POLICY, workerGroups: ['gpu', 'api'] }, s, { groups: ['gpu', 'api'] });
      for (const id of subject) {
        const c = s.byId(id);
        equal(c.retryPolicy, NODE_POLICY, `${id}: retryPolicy is the node's, whole`);
        equal(c.workerGroups, ['gpu', 'api'], `${id}: workerGroups is the node's, in declaration order`);
        equal(Object.keys(c).sort(), ['id', 'optional', 'payload', 'retryPolicy', 'workerGroups', 'workerType'],
          `${id}: exactly the six keys — the four the driver always passed plus the two the node declared`);
      }
      // And the node that declares nothing is byte-identical to before this item.
      equal(Object.keys(s.byId(control)).sort(), ['id', 'optional', 'payload', 'workerType'],
        `${control}: a node declaring neither key hands the factory the exact four-field object — no \`retryPolicy: undefined\``);
    });

    test(`${shape}: the merge rule — the node WINS, WHOLE, over the driver's defaultRetryPolicy`, () => {
      // **The pair's difference is asserted, not left to two literals** — the adequacy reader
      // (p05a/p05b): with the two policies made equal, *the default wins* cost ZERO. Rule 8's
      // fourth requirement on the set: whatever makes a discriminating pair differ is a claim.
      ok(NODE_POLICY.maxRetries !== DRIVER_DEFAULT.maxRetries && NODE_POLICY.backoffMs !== DRIVER_DEFAULT.backoffMs,
        'the node`s policy and the driver`s default differ in BOTH fields, which is what makes this test able to tell whole from field-wise from default-wins');
      const s = new Fake();
      const { subject, control } = drive({ retryPolicy: NODE_POLICY }, s, { defaultRetryPolicy: DRIVER_DEFAULT });
      for (const id of subject) {
        // Both fields differ between the two policies, so a field-by-field merge would show
        // as `{ maxRetries: 1, backoffMs: 100 }` or `{ 5, 0 }` — neither of which is accepted.
        equal(s.byId(id).retryPolicy, NODE_POLICY, `${id}: the node's own policy, both fields`);
      }
      equal(s.byId(control).retryPolicy, DRIVER_DEFAULT, `${control}: a node declaring none gets the driver's default, whole`);
      equal(Object.keys(s.byId(control)).sort(), ['id', 'optional', 'payload', 'retryPolicy', 'workerType'],
        `${control}: and no workerGroups key appears from nowhere — there is no defaultWorkerGroups`);
    });

    test(`${shape}: with no default and no declaration, no retryPolicy key exists at all`, () => {
      const s = new Fake();
      const { subject, control } = drive({}, s, {});
      for (const id of [...subject, control]) {
        equal(Object.keys(s.byId(id)).sort(), ['id', 'optional', 'payload', 'workerType'], `${id}: four keys, as before W58`);
      }
    });
  }

  test('construction: groups OMITTED is an EMPTY set, so a declared group is FD-V31 before anything is queued', () => {
    const s = new Fake();
    const [, drive] = SHAPES[0]!;
    throws(() => drive({ workerGroups: ['gpu'] }, s, {}), 'FD-V31',
      'the definition is refused at construction, naming the rule (ADR 0002 rule 3)');
    equal(s.added, [], 'and nothing was queued');
    let err: unknown;
    try { drive({ workerGroups: ['gpu'] }, new Fake(), {}); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && err.rules.includes('FD-V31'), 'InvalidDefinition, with the rule on the error');
  });

  test('SHAPES here is the same set the L1 suite runs and the corpus flow carries, both ways — the adequacy reader (d05, d05c)', async () => {
    // With the map shape deleted from this list, the passthrough skipped on a map instance cost
    // ZERO. Derived from the corpus document's structure, as the L1 suite does, so the two suites
    // and the fixture cannot drift apart on which shapes exist.
    const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/task-config.flow.json`)) as FlowDefinition;
    equal([...new Set(shapesOf(flow))].sort(), SHAPES.map(([label]) => label).sort(), 'the shapes the corpus flow carries are the shapes every case here runs on');
  });

  test('construction: a malformed defaultRetryPolicy is refused by FD-V30 before anything is queued — the adequacy reader (x03)', () => {
    const s = new Fake();
    const [, drive] = SHAPES[0]!;
    for (const bad of [{ maxRetries: '1', backoffMs: 0 }, {}, { maxRetries: 1, backoffMs: 0, jitter: 5 }, { maxRetries: -1, backoffMs: -5 }, null, 'retry-please']) {
      throws(() => drive({}, s, { defaultRetryPolicy: bad as unknown as RetryPolicy }), 'FD-V30',
        `defaultRetryPolicy = ${JSON.stringify(bad)} is refused under FD-V30 — the same rule, at the driver's option`);
    }
    equal(s.added, [], 'and nothing was queued');
  });

  test('construction: groups is any Iterable — a Set works as an array does', () => {
    const s = new Fake();
    const [, drive] = SHAPES[0]!;
    const { subject } = drive({ workerGroups: ['gpu'] }, s, { groups: new Set(['gpu']) });
    equal(s.byId(subject[0]!).workerGroups, ['gpu'], 'validated against the Set and passed through');
  });
});
