/**
 * Ladder L2 — what a node RECEIVES, routed from a fixture log of outcomes with no
 * scheduler. [W41](../../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)
 * under [P12](../../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md),
 * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md).
 *
 * **`doc/workflow.md` section 4: L2 is where this repo's value is proved.** Every
 * case here is reachable with no worker, no thread and no timer — a composed
 * payload is a pure function of a settled outcome log, so the whole of `FD-C1`,
 * `FD-C2` and `FD-R3` is testable at this rung. The fake below is the same
 * twelve-line one `driver.test.ts` and `map.test.ts` use, unchanged.
 *
 * **Every expected value here is derived from `spec/` and not from a run:**
 *
 * | what | from |
 * |---|---|
 * | `{"item":"a","run":{…}}` | `spec/flow-definition.md` section 3's `needs` table — `"."` is what the node would have received anyway, which for a map instance is `JP-R11`'s *its own item*, and `"ingest"` is that node's output on this node's path |
 * | the ascending array order | the same table's `["n"]` row, which is `JP-R12`'s *ascending `branchPath`, segment-wise numeric* |
 * | the `(node id, branchPath)` pairs | `FD-C2`, and `spec/task-id.md` section 1's four segments |
 * | `UnresolvedReference` | `FD-R3` in section 6 |
 * | an ABSENT key, and `[]` | section 3's two v0.13 table rows, and `FD-C4` |
 * | *a node with no `needs` is unchanged* | `FD-C1`'s first clause, and ADR 0040 rule 1 |
 */
import { collected, equal, listDir, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { Driver, UnresolvedReference } from '../../src/driver/driver.ts';
import { validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import { allRegions, buildGraph } from '../../src/definition/regions.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>; pools: Record<string, { type: string }>; predicates: string[]; languages: string[] };
// W59: the corpus's node types, for the census over the region-bearing corpus — `typed.flow.json`
// names one, and a driver given no `nodeTypes` reads that as NONE registered (`FD-V32`).
import { CORPUS_LANGUAGES } from '../definition/corpus-types.ts';

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

function harness(
  def: FlowDefinition,
  predicates?: Map<string, () => boolean>,
  policy: JoinPolicy = liveToken as JoinPolicy,
) {
  const scheduler = new FakeScheduler();
  const failures: { kind: string; message: string }[] = [];
  const driver = new Driver(def, {
    runId: 'r1',
    scheduler,
    createTask: (c) => c,
    // `isHighConfidence` is in `spec/examples/registry.json` and is pinned FALSE here,
    // so a decision edge guarded by it is never taken — which is how FD-R3's case is
    // constructed: a node that FD-V27 accepts (it is upstream) and that this run
    // routes around. `doc/workflow.md` section 5 rule 8's *construct the case that
    // makes each guard fire, and where the corpus cannot express one, record that*.
    // **The default is both FALSE and a caller may override**, which W50 added: a
    // decision routing AROUND a whole map region is the road `FD-C4`'s array half
    // has once ADR 0044 removes the arity road, and asserting it needs the SAME
    // document run with the predicate true and false.
    predicates: predicates ??
      new Map([['isHighConfidence', () => false], ['isLowConfidence', () => false]]),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
    // The corpus's own group ids — W58. `task-config.flow.json` declares `workerGroups`, and a
    // driver given no `groups` reads that as NONE declared (`FD-V31`), so the census over the
    // region-bearing corpus refused it at construction the moment the flow existed.
    groups: Object.keys(reg.groups ?? {}),
    // And the fifth set since W61: `transformed.flow.json` is region-bearing and names `path`.
    languages: CORPUS_LANGUAGES,
    // **A caller may bring its own** — W50. `FD-R3`'s one remaining road is a join
    // policy firing before a branch entry has settled, and until this parameter
    // existed the fixtures that reach it had to build a `Driver` by hand, which is
    // why `h.failures` had THIRTEEN reads and not one positive case: neutering
    // `onRunFailure` entirely cost **zero**. Its adequacy reader measured that.
    joinPolicy: policy,
    onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
  });
  return {
    scheduler, driver, failures,
    ids: () => scheduler.added.map((t) => t.id),
    // What the node RECEIVED: the envelope's `input` — every task node is typed since v0.19 (ADR 0054).
    payloadOf: (id: string) => (scheduler.added.find((t) => t.id === id)?.payload as { input?: unknown } | undefined)?.input,
  };
}
type H = ReturnType<typeof harness>;

/**
 * Settle everything dispatched, in dispatch order, with `result` chosen per id.
 *
 * **The guard is 40 and the loop asserts it did not hit it** — a drain that
 * silently stops is a test that silently asserts nothing (`doc/workflow.md`
 * section 5 rule 3), which is `map.test.ts`'s own sentence and is why this
 * harness copies it rather than inventing a looser one.
 */
function drain(h: H, result: (id: string) => unknown, already: readonly string[] = []): void {
  // `already` is what the caller settled by hand before draining. Without it this
  // loop settles the entry task a SECOND time, which appends a second outcome
  // record and re-enters whatever it routes to — a `DuplicateTaskId` rather than
  // this test's subject.
  const done = new Set<string>(already);
  for (let guard = 0; guard < 40; guard++) {
    const next = h.ids().find((id) => !done.has(id));
    if (next === undefined) return;
    done.add(next);
    h.scheduler.settle(next, 'done', { result: result(next) });
  }
  ok(false, 'the drain loop did not terminate — the fixture changed shape');
}

const CONTEXT = { items: ['a', 'b'], config: { threshold: 7 }, runLabel: 'nightly' };

suite('L2 — FD-C1: what a node receives', (test) => {
  test('Q166`s flow — a map instance receives its own item AND the run`s config', async () => {
    const h = harness(await load('valid/map-with-context.flow.json'));
    h.driver.start(CONTEXT);
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: CONTEXT });

    equal(h.ids(), ['r1:ingest:-:0', 'r1:score:0:0', 'r1:score:1:0'],
      'two items open two instances — the arity is the RUN`s, unchanged by `needs`');

    // Derived from section 3's table, key by key: `"."` is what this node would have
    // received anyway, which for a map instance is JP-R11's *its own item*;
    // `"ingest"` is that node's output on this node's path, and `-` is a prefix of
    // `0`, so exactly one entry is visible.
    equal(h.payloadOf('r1:score:0:0'), { item: 'a', run: CONTEXT },
      'instance 0 receives its own item under `item` and the whole of ingest`s result under `run`');
    equal(h.payloadOf('r1:score:1:0'), { item: 'b', run: CONTEXT },
      'instance 1 receives ITS own item and the same context');

    // Before ADR 0040 these two keys were reachable from a `score` worker by no
    // route at all — Q166, reproduced at P12's declaration as `received: "a"`.
    const p0 = h.payloadOf('r1:score:0:0') as { run: typeof CONTEXT };
    equal(p0.run.config, { threshold: 7 }, 'Q166: `config` is reachable, which it was not');
    equal(p0.run.runLabel, 'nightly', 'and so is `runLabel`');
  });

  test('no two instances receive the same object — JP-R11`s invariant, per key', async () => {
    const h = harness(await load('valid/map-with-context.flow.json'));
    h.driver.start(CONTEXT);
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: CONTEXT });
    const a = h.payloadOf('r1:score:0:0') as Record<string, unknown>;
    const b = h.payloadOf('r1:score:1:0') as Record<string, unknown>;
    ok(a !== b, 'the composed objects are distinct');
    ok(a.run !== b.run, 'and so is the value under a REFERENCE key — a reference is the one way ' +
      'two nodes could otherwise be handed one record`s `result` twice');
    ok(a.run !== CONTEXT, 'and neither aliases the record in the log');
  });

  test('the `"."` form gets its OWN COPY too, and two `"."` keys do not alias', () => {
    // **W41's adequacy reader**: `out[key] = cloneValue(edgeValue)` could become
    // `out[key] = edgeValue` for **zero** failures. The case above cannot reach it —
    // it compares two map INSTANCES and reads a REFERENCE key, while its `"."` key
    // holds a primitive, which cannot alias in principle. The reachable case is one
    // node with two `"."` keys, and without the copy both are the DRIVER's own edge
    // value: an inline worker mutating `payload.a` edits `payload.b` and the object
    // the driver is still holding. That is [Q154](../../doc/open-questions.md) at the
    // `needs` edge, and `FD-C1`'s *each key gets its own copy* is what refuses it.
    const def = {
      flowId: 'two-self-keys', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'sink' }] },
        {
          id: 'sink', kind: 'task', type: 'PublishWorker',
          needs: { a: '.', b: '.' }, edges: [{ to: 'done' }],
        },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(validateDefinition(def, { predicates: [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools }), [],
      'two `"."` keys are a valid document — the case has to be constructed, and it validates');
    const h = harness(def);
    h.driver.start({});
    const given = { big: { n: 1 } };
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: given });
    const p = h.payloadOf('r1:sink:-:0') as { a: { big: unknown }; b: { big: unknown } };
    equal(p, { a: given, b: given }, 'both keys carry the same VALUE');
    ok(p.a !== p.b, 'and are not the same OBJECT — FD-C1, per key');
    ok(p.a.big !== p.b.big, 'nested too, because `structuredClone` preserves aliasing within one clone');
  });

  test('Q165`s flow — a map over a whole region`s output, with no branch numbering', async () => {
    const h = harness(await load('valid/map-over-region-output.flow.json'));
    h.driver.start({ items: ['a', 'b', 'c'] });
    // Settle in DESCENDING branch order, so the array's order cannot be settlement
    // order. `JP-R12`'s key-order clause, applied to `["n"]`.
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b', 'c'] } });
    equal(h.ids().slice(1), ['r1:score:0:0', 'r1:score:1:0', 'r1:score:2:0'], 'three instances');
    for (const i of [2, 1, 0]) h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { s: i } });

    equal(h.ids().slice(4), ['r1:publish:0:0', 'r1:publish:1:0', 'r1:publish:2:0'],
      'the second map`s arity is the first region`s width, and it is in NO document — ' +
      'this is Q165`s *score, then fan out over the scores*');
    equal(h.payloadOf('r1:publish:0:0'), { s: 0 }, 'in ASCENDING branchPath order, not settlement order');
    equal(h.payloadOf('r1:publish:1:0'), { s: 1 }, 'which is what makes the array the same value whatever order they settled');
    equal(h.payloadOf('r1:publish:2:0'), { s: 2 }, 'and it is the third');
    // **Read from the PARSED document, not from `JSON.stringify`** — W41's adequacy
    // reader. The first version searched the serialised text for `'"over": "0"'`,
    // and `JSON.stringify` emits no space after the colon, so that literal could
    // never occur whatever the flow contained: measured, setting the flow's `over`
    // to `"0"` produced two failures and NEITHER was this line. **A vacuous
    // assertion protecting the one claim it exists for**, which is
    // `doc/workflow.md` section 5 rule 3 in the file that quotes it.
    const doc = await load('valid/map-over-region-output.flow.json');
    const numeric = doc.nodes
      .filter((n): n is Extract<typeof n, { kind: 'map' }> => n.kind === 'map')
      .filter((n) => /^\d+(\.\d+)*$/.test(n.over));
    equal(numeric, [],
      'NO map`s `over` is a branch PATH — the coupling Q165 names as brittle (insert a branch and ' +
      '`over: "0"` silently re-points) is gone rather than worked around');
  });

  test('a node with NO needs receives exactly what it received at v0.10', async () => {
    // ADR 0040 rule 1, and it is the clause the whole decision rests on being
    // affordable to have got wrong. `map-fanout` carries no `needs` at all.
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b', 'c'] } });
    equal(h.payloadOf('r1:score:0:0'), 'a', 'JP-R11 — its own item, and no composition happened');
    // `ingest` was settled by hand above and is excluded from the drain.
    drain(h, () => ({ done: true }), ['r1:ingest:-:0']);
    equal(h.payloadOf('r1:publish:-:0'),
      { '0': { done: true }, '1': { done: true }, '2': { done: true } },
      'JP-R12 — the join still carries the arrivals keyed by branchPath, untouched (P12 decision 3)');
  });
});

suite('L2 — FD-C2: what NAMES an output', (test) => {
  test('a node id collapses inside a map region and the PAIR does not', async () => {
    // ADR 0036's deciding fact for the third time. Measured over every
    // region-bearing flow in the corpus, not over a fixture this test invents.
    // Derived by reading each flow document and its arity, NOT from a run:
    //   fanout-join      ingest, scoreA, scoreB, publish            4 tasks / 4 ids / 0 lost
    //   nested-fanout    scoreA, scoreB, scoreC, scoreD             4 / 4 / 0
    //   map-fanout       ingest, score x3, publish                  5 / 3 / 2
    //   map-in-fanout    ingest, scoreA, extract, merge x2, publish 6 / 5 / 1
    //   map-with-context ingest, score x2, publish                  4 / 3 / 1
    //   map-over-region  ingest, score x3, publish x3               7 / 3 / 4
    //   fanout-failure   ingest, scoreA, reviewB, publish            4 / 4 / 0
    //   p1-routed-away   ingest, scoreA, scoreB, publish             4 / 4 / 0
    //   reference-past-a-map-arity  ingest, score x2, regroup, publish x2   6 / 4 / 2
    //   sibling-fanouts  ingest, scoreA1, scoreA2, publishB1, publishB2   5 / 5 / 0
    //
    // **The last two were MISSING and the both-ways bound below is what found them**
    // — added by W41's adequacy reader's finding, on its first run. They carry a
    // `fanout` region and were censused by nothing, so `FD-C2`'s *no `fanout` ever
    // collapses* rested on two flows where it now rests on four.
    const expected = new Map<string, { ids: number; nodes: number; lost: number; map: boolean }>([
      ['fanout-join', { ids: 4, nodes: 4, lost: 0, map: false }],
      ['nested-fanout', { ids: 4, nodes: 4, lost: 0, map: false }],
      ['map-fanout', { ids: 5, nodes: 3, lost: 2, map: true }],
      ['map-in-fanout', { ids: 6, nodes: 5, lost: 1, map: true }],
      ['map-with-context', { ids: 4, nodes: 3, lost: 1, map: true }],
      ['map-over-region-output', { ids: 7, nodes: 3, lost: 4, map: true }],
      ['fanout-failure', { ids: 4, nodes: 4, lost: 0, map: false }],
      ['p1-routed-away', { ids: 4, nodes: 4, lost: 0, map: false }],
      // **W45's flow, at MATCHED arities**, so this census measures `FD-C2` rather
      // than `FD-R3`: ingest, score x2, regroup, publish x2 = 6 / 4 / 2, and the two
      // lost are the two map regions' one collapsing id each. At MISMATCHED arities
      // the same document is `FD-R3`'s only remaining case with no custom policy,
      // which is the suite below.
      ['reference-past-a-map-arity', { ids: 6, nodes: 4, lost: 2, map: true }],
      // **W49's document, promoted to the corpus by W50** — a sibling `fanout` pair,
      // which neither corpus contained. Derived by reading its edges: ingest,
      // scoreA1, scoreA2, publishB1, publishB2 = **5 ids / 5 node ids / 0 lost**,
      // and `map: false` because BOTH regions are `fanout`s. *It is the row that
      // makes `FD-C2`'s no `fanout` ever collapses rest on five flows rather than
      // four, and it is the only one whose two regions are siblings.*
      ['sibling-fanouts', { ids: 5, nodes: 5, lost: 0, map: false }],
      // **W58's document — a `fanout` region followed by a `map` region.** Derived by
      // reading its nodes: ingest, scoreA, scoreB, regroup, rank x3, publish = **8 ids /
      // 6 node ids / 2 lost**, the two lost being the map's one collapsing id twice.
      // It is in the corpus for `retryPolicy` and `workerGroups` in all three task
      // shapes, and this census does not care about either key — which is the point:
      // a flow that gains a region is red here until it is censused.
      ['task-config', { ids: 8, nodes: 6, lost: 2, map: true }],
      // **W59's document — a `map` region followed by a `fanout` region, three typed nodes.**
      // Derived by reading its nodes: ingest, rank x3, scoreA, scoreB, publish = **7 ids /
      // 5 node ids / 2 lost**, the two lost being the map's one collapsing id twice. A `type`
      // changes no id and no region, which is what this census says of it.
      ['typed', { ids: 7, nodes: 5, lost: 2, map: true }],
      // **W61's document — `typed.flow.json`'s shape with a `transform` on every typed node.**
      // Derived by reading its nodes: ingest, rank x3, scoreA, scoreB, publish = **7 ids /
      // 5 node ids / 2 lost**. A `transform` changes no id and no region, and the driver
      // evaluates none of them, which is what this census says of it.
      ['transformed', { ids: 7, nodes: 5, lost: 2, map: true }],
      // **W92's document, RUN since W93** — the one region-bearing flow with a GATE. Derived by reading its nodes and
      // the stimuli below (three files, series s1, s1, s2, settled in dispatch order): ingest, identify x3, setup x2 —
      // the FIRST file of each series, the second s1 routed `duplicate` to an `end` — and publish = **7 ids / 4 node
      // ids / 3 lost**, the three lost being `identify`'s two collapsing ids and `setup`'s one. A gate mints no id,
      // so it adds none here; what it changes is HOW MANY branches reach `setup`, which is its whole point.
      ['gated-map', { ids: 7, nodes: 4, lost: 3, map: true }],
    ]);
    const entries: [string, unknown, (id: string) => unknown][] = [
      ['fanout-join', { from: 'ingest' }, (id) => ({ by: id })],
      ['nested-fanout', { from: 'ingest' }, (id) => ({ by: id })],
      ['map-fanout', {}, (id) => (id.includes(':ingest:') ? { items: ['a', 'b', 'c'] } : { by: id })],
      ['map-in-fanout', { from: 'i' }, (id) => (id.includes(':extract:') ? { rows: ['p', 'q'] } : { by: id })],
      ['map-with-context', CONTEXT, () => CONTEXT],
      ['map-over-region-output', { items: ['a', 'b', 'c'] },
        (id) => (id.includes(':ingest:') ? { items: ['a', 'b', 'c'] } : { by: id })],
      ['fanout-failure', { from: 'ingest' }, (id) => ({ by: id })],
      ['p1-routed-away', { from: 'ingest' }, (id) => ({ by: id })],
      ['reference-past-a-map-arity', { items: ['a', 'b'], slots: ['x', 'y'] },
        (id) => (id.includes(':ingest:')
          ? { items: ['a', 'b'], slots: ['x', 'y'] }
          : id.includes(':regroup:')
            ? { slots: ['x', 'y'] }
            : { by: id })],
      ['sibling-fanouts', { from: 'ingest' }, (id) => ({ by: id })],
      // W58: `regroup` feeds the map, so it is the one task whose result carries `items`.
      ['task-config', { from: 'ingest' },
        (id) => (id.includes(':regroup:') ? { items: ['a', 'b', 'c'] } : { by: id })],
      // W59: the typed entry feeds the map, so it is the one task whose result carries `items`.
      ['typed', { from: 'ingest' },
        (id) => (id.includes(':ingest:') ? { items: ['a', 'b', 'c'] } : { by: id })],
      // W61: the same shape, the transformed entry feeding the map.
      ['transformed', { from: 'ingest' },
        (id) => (id.includes(':ingest:') ? { items: ['a', 'b', 'c'] } : { by: id })],
      // W93: `ingest` feeds the map over `files`; each `identify` names its file's series, two files sharing one.
      ['gated-map', {},
        (id) => (id.includes(':ingest:')
          ? { files: ['a', 'b', 'c'] }
          : id.includes(':identify:')
            ? { series: { id: ['s1', 's1', 's2'][Number(id.split(':')[2])] } }
            : { by: id })],
    ];
    // **The list is bound to a source this file does not own** — W41's adequacy
    // reader, whose sharpest measurement is that every bound in these two files was
    // a literal sitting beside the list it bounds, so a probe that edits both costs
    // **0**. It deleted both of this item's own corpus flows from `entries` and
    // `expected`, narrowed `ran.length` 6 → 4, and the item's `Outputs` row (5) —
    // *L2 assertions over both, INCLUDING a map region* — vanished at exit 0.
    //
    // **`l4-corpus.test.ts` solves this one file across and this is the same fix**:
    // the set of region-bearing flows is derived from the CORPUS ON DISK, both ways.
    // A flow that gains a region and is not censused is red; a censused flow that
    // leaves the corpus is red; and neither edit is inside this file. *A magic
    // number beside its own list is [Q102](../../doc/open-questions.md)'s shape, and
    // this item wrote three before the reader found them.*
    const REGION_KINDS = new Set(['fanout', 'map']);
    const onDisk: string[] = [];
    // **A region-bearing flow holding a GATE is RUN here since W93, as every other one is** — ADR 0066 rule 7's
    // construction refusal is LIFTED (ADR 0067). W92 split such flows off by KIND and asserted their REFUSAL, so that
    // the lift would fail that assertion naming the flow rather than leave this census silently one flow short; it
    // did, on W93's first run (`gated-map: … refused … until W93 runs one: undefined`), and the flow joined `entries`
    // with its expectation above. What stays is the ARRANGEMENT, because the census is only a statement about gates
    // while the corpus holds one: the gate flows below are counted, and must be more than none.
    const gated: string[] = [];
    for (const f of (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json')).sort()) {
      const d = JSON.parse(await readText(`${EX}/valid/${f}`)) as FlowDefinition;
      if (!d.nodes.some((n) => REGION_KINDS.has(n.kind))) continue;
      onDisk.push(f.replace(/\.flow\.json$/, ''));
      if (d.nodes.some((n) => n.kind === 'gate')) gated.push(f.replace(/\.flow\.json$/, ''));
    }
    ok(gated.length > 0 && gated.every((g) => onDisk.includes(g)),
      `the ARRANGEMENT: the corpus holds a region-bearing gate flow, and it is censused — RUN — like the rest: ${gated.join(', ')}`);
    equal(entries.map((e) => e[0]).sort(), onDisk,
      'the censused set IS the corpus`s region-bearing flows, both ways — derived from the ' +
      'directory rather than declared beside itself');
    equal([...expected.keys()].sort(), onDisk, 'and so is the expectation table');

    const ran: string[] = [];
    for (const [name, payload, result] of entries) {
      const h = harness(await load(`valid/${name}.flow.json`));
      h.driver.start(payload);
      drain(h, result);
      const ids = h.ids();
      const nodes = new Set(ids.map((i) => i.split(':')[1]!));
      const e = expected.get(name)!;
      equal(ids.length, e.ids, `${name}: ${e.ids} tasks dispatched`);
      equal(nodes.size, e.nodes, `${name}: ${e.nodes} distinct node ids`);
      equal(ids.length - nodes.size, e.lost,
        `${name}: ${e.lost} outputs lost to a node-id key — FD-C2`);
      equal(e.lost > 0, e.map, `${name}: an output is lost exactly where there is a map region`);

      // **`FD-C2` read from the GRAPH, not from the expectation table** — W41's
      // adequacy reader's provenance finding, one turn on. `nodes` re-sourced from
      // `expected` makes `equal(nodes.size, e.nodes)` a tautology and leaves `lost`
      // still derived from a declared number; the swap survived. **What cannot be
      // re-sourced is which nodes collapsed and why**: a node id names more than one
      // output exactly when the node is inside a MAP region, and `allRegions` says
      // which nodes those are without reference to anything this table declares.
      const dispatchedMoreThanOnce = [...new Set(
        ids.map((i) => i.split(':')[1]!).filter((n, _k, a) => a.filter((x) => x === n).length > 1),
      )].sort();
      const graph = buildGraph(await load(`valid/${name}.flow.json`));
      const insideAMap = [...new Set(
        allRegions(graph, await load(`valid/${name}.flow.json`))
          .filter((r) => r.opensWith === 'map')
          .flatMap((r) => [...r.members]),
      )].filter((n) => graph.byId.get(n)?.kind === 'task' && ids.some((i) => i.split(':')[1] === n)).sort();
      equal(dispatchedMoreThanOnce, insideAMap,
        `${name}: the node ids that name MORE THAN ONE output are exactly the dispatched tasks ` +
        'inside a map region — read from `allRegions`, which knows nothing about this table');
      // **The pair-distinctness assertion is DELETED, and this records why rather
      // than leaving a weaker one in its place.** It read
      // `equal(new Set(pairs).size, pairs.length)` over pairs built from the
      // dispatched ids — and `ID-R1` refuses a duplicate dispatch, so that set is
      // distinct by a rule three plans old and the line could not fail while the
      // driver mints ids at all. W41's adequacy reader measured it from both sides:
      // weakening it to `>= 0` cost **0**, and making `outputs()` record `path: '-'`
      // for every entry — `FD-C2`'s collapse made real — failed **three** tests and
      // not that one. *An assertion that restates a rule the fixture cannot violate
      // is decoration, and it reads as coverage of the rule it names.*
      //
      // **What carries `FD-C2` is the three counts above**: `ids` is what the run
      // dispatched, `nodes` is what a node-id key would name, and `lost` is the
      // difference — which is `FD-C2` stated as a number, per flow, and which the
      // `map` column then says is nonzero in exactly the map-bearing flows.
      // **And no fourth assertion stands in for the deleted one.** The obvious
      // replacement — `equal(h.driver.snapshot().length, e.ids)` — was written and
      // then measured: it survives a provenance swap to `h.ids().length` (both are
      // the same set, because the drain settles everything it dispatches) AND it
      // survives `outputs()` skipping a node entirely. *It restated the drain the way
      // its predecessor restated `ID-R1`*, so it is not here. **Adding an assertion
      // because a probe wanted one is how a suite gains coverage it does not have.**
      ran.push(name);
    }
    equal(ran, entries.map((e) => e[0]), 'every flow was ASSERTED — pushed after the assertions, not before');
    equal([...ran].sort(), onDisk, 'and the SET it ran is the disk`s, not a literal beside it');
    // **EIGHT since W61, from seven**: `transformed` is `typed`'s shape with a transform on every typed node.
    // **SEVEN since W59, from six**: `typed` carries a map region beside its fanout, as
    // `task-config` (W58's, six from five) does, and this literal is a COUNT beside a
    // membership — the `expected` table above is the membership, and `onDisk` binds it to the
    // directory both ways, so this line is the count a human writes and the two above are what
    // stop it being the only bound.
    // **NINE since W93**: `gated-map` carries a map region and RUNS here now that ADR 0066 rule 7 is lifted.
    equal([...expected.values()].filter((v) => v.lost > 0).length, 9,
      'and exactly the NINE flows with a map region lose an output');
    equal([...expected.values()].filter((v) => !v.map).length, 5,
      'while FIVE carry only `fanout` regions and lose NOTHING — at depth 1, at depth 2, with an ' +
      'optional branch that can fail, with a branch routed away from its join, and — since W50 — ' +
      'with two SIBLING fanout regions, which is the shape neither corpus contained');
  });
});

/**
 * **What a run carries across SIBLING regions** —
 * [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md),
 * built by **W50** under
 * [P14](../../doc/plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md).
 *
 * **L1 grades the DERIVATION and this grades the RUN.** `test/definition/sibling-regions.test.ts`
 * asserts `sharedRegionDepth` and `outputIsVisible` as pure functions over region
 * sets; these are the same rule reached through `Driver.compose`, at both
 * declaration sites, on documents a validator accepts.
 *
 * **Every expected value is derived from `spec/flow-definition.md` v0.15 and from
 * each flow's own edges before any run** (`doc/workflow.md` section 5 rule 1).
 */
suite('L2 — ADR 0044: what a run carries across SIBLING regions', (test) => {
  test('a sibling FANOUT pair resolves in BOTH branches, where one of them used to stop the run', async () => {
    // **The corpus flow W49 built and could not add**, because until the resolver
    // followed it was a valid document whose run stopped. Both branches of the
    // second region declare the SAME reference against branch 0 of the first, so
    // the only thing that differs between the two readers is the branch the author
    // wrote it in — **the pair, and its difference is asserted below rather than
    // carried by two literals** (`doc/workflow.md` section 5 rule 8's fourth
    // requirement on the set).
    const def = await load('valid/sibling-fanouts.flow.json');
    const needsOf = (id: string) =>
      (def.nodes.find((n) => n.id === id) as unknown as { needs: unknown }).needs;
    equal(needsOf('publishB1'), needsOf('publishB2'),
      'the two readers declare ONE thing — if they differed, the row below would be about two ' +
      'references rather than about two paths');

    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { from: 'ingest' } });
    h.scheduler.settle('r1:scoreA1:0:0', 'done', { result: { A: 1 } });
    h.scheduler.settle('r1:scoreA2:1:0', 'done', { result: { A: 2 } });

    equal(h.failures, [], 'no FD-R3 in either branch — the two regions share no region');
    // `scoreA1` is in `region(splitA)` and both readers are in `region(splitB)`;
    // the chains are `[splitA]` and `[splitB]`, sharing nothing, so every output is
    // visible to both. `FD-V19` gives a node in a fanout region exactly ONE output,
    // which is why `FD-V28` demands the bare form and the value is not an array.
    // `own` is `"."`, which for a fanout branch entry is its own copy of what the
    // fanout node received — `JP-R11` — and that is `joinA`'s collection keyed by
    // branchPath (`JP-R12`). Both readers get the same, which is what makes `first`
    // the only thing this pair is about.
    const COLLECTION = { '0': { A: 1 }, '1': { A: 2 } };
    equal(h.payloadOf('r1:publishB1:0:0'), { own: COLLECTION, first: { A: 1 } },
      'branch 0 sees scoreA1');
    equal(h.payloadOf('r1:publishB2:1:0'), { own: COLLECTION, first: { A: 1 } },
      'and so does branch 1, which under the prefix rule stopped the run at FD-R3');
    equal(h.payloadOf('r1:publishB1:0:0'), h.payloadOf('r1:publishB2:1:0'),
      'the two are IDENTICAL — nothing about the reader`s own index reaches the answer');
  });

  test('the NARROWING direction: one shape asserted, and a SECOND one W84 made expressible', () => {
    // **W50's adequacy reader's finding 5, answered with a measured ABSENCE.** Every
    // other row in this suite asserts that MORE is visible; three mutations making
    // the resolver too PERMISSIVE were caught only by W41-era and W42-era fixtures,
    // so *the shared segment must AGREE* looked like a run-time claim with no
    // run-time counter-case of this item's own.
    //
    // **It has one, and this suite cannot add a second — which is a fact about the
    // GRAPH rather than about the coverage** (`doc/workflow.md` section 5 rule 8:
    // *construct the case that makes each guard fire, and where the corpus cannot
    // express one, RECORD that rather than arguing it*).
    //
    // A narrowing case needs a target with **two or more outputs** whose reader
    // shares a region with it. `FD-V19` gives every node in a `fanout` region
    // exactly one output, so the target must be inside a **map** region — and then
    // there are only two ways to share a region with it. **When this row was
    // written both were refused; [W84](../../doc/work-items/w84-what-a-regions-identity-is.md)
    // lifted the second, so the count in this row's own title moved.** The first is
    // still refused, by a rule rather than by a driver check:
    const readerBesideTheMap = {
      flowId: 'reader-beside-the-map', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'outer' }] },
        { id: 'outer', kind: 'fanout', branches: ['reader', 'gate'] },
        { id: 'reader', kind: 'task', type: 'MergeWorker', needs: { got: ['item'] },
          edges: [{ to: 'outerJoin' }] },
        { id: 'gate', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'm' }] },
        { id: 'm', kind: 'map', over: 'xs', branch: 'item' },
        { id: 'item', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'mj' }] },
        { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 'outerJoin' }] },
        { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(
      violatedRules(validateDefinition(readerBesideTheMap, { predicates: [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools })),
      ['FD-V27'],
      'ONE: a reader in a SIBLING BRANCH of the fanout that holds the map — refused, because ' +
      'the reader is not reachable FROM the target. So the shared `outer` segment can never ' +
      'differ between a reader and a target that a reference may connect',
    );

    const regionInsideAMap = {
      flowId: 'region-inside-a-map', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'outer' }] },
        { id: 'outer', kind: 'map', over: 'items', branch: 'gate' },
        { id: 'gate', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'innerA' }] },
        { id: 'innerA', kind: 'fanout', branches: ['x1', 'x2'] },
        { id: 'x1', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'joinA' }] },
        { id: 'x2', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'joinA' }] },
        { id: 'joinA', kind: 'join', of: 'innerA', edges: [{ to: 'outerJoin' }] },
        { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(
      validateDefinition(regionInsideAMap, { predicates: [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools }), [],
      'TWO: a region nested inside a MAP region — which a VALIDATOR always accepted',
    );
    // **And which the DRIVER now RUNS** — W84, ADR 0062. W33 refused it here because
    // it keyed a region's policy state by the opener's node id and a map enters its
    // branch once per item; the key is `(opener, the opener's own branchPath)` now,
    // so `innerA` has one instance per item instead of one instance shared by all.
    // *This row asserted the throw; it asserts the run.*
    const two = harness(regionInsideAMap);
    two.driver.start({ items: ['a', 'b'] });
    two.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    drain(two, () => ({ xs: [] }), ['r1:ingest:-:0']);
    const st = fold(two.driver.foldInputs());
    equal(st.outcome, 'completed',
      'TWO, since W84: the shape this row could not build now runs to completion');
    equal(Object.keys(st.regions['innerA']!).sort(), ['0', '1'],
      'and it is TWO instances of one opener, keyed by the map item index — which is exactly ' +
      'the narrowing shape this row exists to look for');

    // **So there are TWO expressible shapes now, and the second is TAKEN rather than
    // recorded** — [W85](../../doc/work-items/w85-what-a-nested-region-carries-and-how-it-ends.md),
    // in `test/driver/nested-regions.test.ts`'s *ADR 0044 visibility across a region
    // nested in a map*. A reader past the nested region reads ITS OWN instance's
    // output and not the sibling item's, and the LIST form is refused by name as
    // that row's control — because the outer map multiplies the READERS and not the
    // visible outputs, which is the half this row could not have predicted from the
    // shape alone. *This line asserted that the shape had become reachable; it
    // asserts where it is reached.*
    // **What this binds that the suite census does NOT.** `test/definition/l4-corpus.test.ts`'s
    // census is a membership over SUITE names and says so in its own header, so it catches the
    // suite disappearing and is blind to the suite keeping its name and losing the CASE. The
    // case is what this row handed over, so the case is what is named here.
    equal(
      collected()
        .filter((s) => s.suite === 'L2 — W85: ADR 0044 visibility across a region nested in a map')
        .flatMap((s) => s.cases.map((c) => c.name)),
      ['a reader past a nested region sees ITS OWN instance`s output and no other',
       'and a sibling branch of the inner region is still refused, by a RULE'],
      'shape one is asserted by the two-digit arity suite, and shape two by W85`s own two cases — ' +
      'named here so that losing either fails in the row that handed the shape over, rather than ' +
      'leaving this sentence describing a case nobody wrote');
  });

  test('and a NESTED sibling pair still agrees on the region they share', () => {
    // **The shape W49's adequacy reader found missing**, at run time. `x1` and `y2`
    // are in sibling regions nested inside ONE branch of an outer region, so their
    // chains are `[outer, innerA]` and `[outer, innerB]` — sharing a prefix of ONE.
    // The outer segment must AGREE and the inner ones are unrelated namespaces.
    //
    // *This is the only shape in which the rule differs from `compare every
    // segment`, and the only one in which it differs from `compare nothing`.*
    const def = {
      flowId: 'nested-siblings-at-run-time', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'outer' }] },
        { id: 'outer', kind: 'fanout', branches: ['plain', 'gate'] },
        { id: 'plain', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'outerJoin' }] },
        { id: 'gate', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'innerA' }] },
        { id: 'innerA', kind: 'fanout', branches: ['x1', 'x2'] },
        { id: 'x1', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'joinA' }] },
        { id: 'x2', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'joinA' }] },
        { id: 'joinA', kind: 'join', of: 'innerA', edges: [{ to: 'innerB' }] },
        { id: 'innerB', kind: 'fanout', branches: ['y1', 'y2'] },
        { id: 'y1', kind: 'task', type: 'MergeWorker', edges: [{ to: 'joinB' }] },
        { id: 'y2', kind: 'task', type: 'MergeWorker', needs: { got: 'x1' },
          edges: [{ to: 'joinB' }] },
        { id: 'joinB', kind: 'join', of: 'innerB', edges: [{ to: 'outerJoin' }] },
        { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(validateDefinition(def, { predicates: [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools }), [],
      'a legal document — FD-V27 accepts it and FD-V29 calls x1 certain');

    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:plain:0:0', 'done', { result: { p: 1 } });
    h.scheduler.settle('r1:gate:1:0', 'done', { result: { g: 1 } });
    h.scheduler.settle('r1:x1:1.0:0', 'done', { result: { X: 1 } });
    h.scheduler.settle('r1:x2:1.1:0', 'done', { result: { X: 2 } });

    equal(h.failures, [], 'the shared outer segment agrees, so the reference resolves');
    equal(h.payloadOf('r1:y2:1.1:0'), { got: { X: 1 } },
      'y2 at `1.1` sees x1 at `1.0` — they agree on `outer`, and the inner segments belong to ' +
      'two unrelated regions. **The prefix rule refused exactly this**');
    equal(h.payloadOf('r1:y1:1.0:0'), { '1.0': { X: 1 }, '1.1': { X: 2 } },
      'the control: `y1` declares NOTHING, so it receives `joinA``s collection unchanged — ' +
      '`JP-R11` and `JP-R12`, and ADR 0040 rule 1`s *the default is unchanged*. Which is what ' +
      'keeps the row above a statement about the REFERENCE rather than about the dispatch');
  });
});

suite('L2 — FD-R3: a reference the run did not produce', (test) => {
  /**
   * **W45 REPLACED this suite's fixture, and the replacement IS the finding.**
   *
   * Until v0.13 the case was *a decision routed around the target*: `ingest`
   * decides between `flag` and `skip`, and `publish` declares `needs: {f: 'flag'}`.
   * **`FD-V29` now refuses that document at instantiation**, which is
   * [Q187](../../doc/open-questions.md)'s whole point — so the cheap way to build an
   * unresolvable reference is gone, and what is left is the two things a validator
   * provably cannot see (`FD-R3`'s own row in section 6).
   *
   * **AND W50 REPLACED IT AGAIN, which is the second finding.** That fixture was
   * `reference-past-a-map-arity.flow.json` at mismatched arities, where the third
   * instance of the second region had a branch path comparable with neither of
   * `score`'s outputs. **[ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
   * removes that case**: the two regions are SIBLINGS, they share no region, and a
   * reader now sees ALL of the target's outputs whatever its own index — so the
   * document resolves at every arity pair and `FD-R3` does not fire on it. That was
   * `FD-R3`'s last road needing no custom policy ([Q218](../../doc/open-questions.md)),
   * and **what the flow demonstrates now is the fix**, asserted in the suite below.
   *
   * *Twice in two plans this rule's cheap fixture has turned out to be a defect
   * somewhere else: `FD-V29` took the decision road and ADR 0044 took the arity
   * road. Each time the rule was right and the document reaching it was wrong.*
   *
   * The ONE remaining case is a join **policy** firing before a branch entry has
   * settled, which `validateDefinition` cannot know about because it is not given
   * the policy (`FD-V15`'s note, [Q97](../../doc/open-questions.md)). **It IS a
   * fixture, below, and the first version of this comment said it deliberately was
   * not** — both of W45's readers found that, and they were right: `ADR 0042` rule 5
   * is what makes `FD-V29` affordable to have got slightly wrong, and that argument
   * had no observer anywhere. A policy is an injected seam (`spec/join-policy.md`
   * section 1), so constructing one costs nine lines and asserts a property of
   * `FD-V29` rather than of any shipped policy.
   */
  const pastArity = () => load('valid/reference-past-a-map-arity.flow.json');
  /**
   * **`map-over-region-output` plus ONE guarded edge**, which is the whole
   * difference — and it is the road `FD-C4`'s array half still has once
   * [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
   * removes the arity road. A decision routes around the WHOLE map region, so on
   * one payload `score` produces nothing anywhere and `["score?"]` is `[]`; on the
   * other it produces N and the array resolves. **The unconditional form of the
   * same document is `FD-V29`**, which is what makes the suffix load-bearing here.
   *
   * It is W47's `map-past-a-decision.flow.json` shape, built here rather than
   * loaded because `examples/flows/**` is that item's tree and this is L2.
   */
  const pastDecision = async () => {
    const base = JSON.parse(JSON.stringify(await load('valid/map-over-region-output.flow.json'))) as FlowDefinition;
    const ingest = base.nodes.find((n) => n.id === 'ingest') as unknown as
      { edges: { to: string; when?: string }[] };
    ingest.edges = [{ when: 'isLowConfidence', to: 'split' }, { to: 'rank' }];
    const rank = base.nodes.find((n) => n.id === 'rank') as unknown as
      { needs: Record<string, unknown> };
    rank.needs = { scores: ['score?'] };
    return base;
  };

  /**
   * THREE slots and TWO items - the mismatch is the whole fixture.
   *
   * **The MISMATCH is asserted, not carried by two literals** - `doc/workflow.md`
   * section 5 rule 8's fourth requirement on the set, and rule 8 found the instance:
   * `rank`'s arity comes from what `regroup` RETURNS, so the pair's difference lived
   * in a hard-coded `{slots: [...]}` in each settle call and making `MISMATCHED`
   * equal cost **0**. Both halves now come from here, and the inequality is a claim.
   */
  const MISMATCHED = { items: ['a', 'b'], slots: ['x', 'y', 'z'] };
  /** What `regroup` returns - the key `rank`'s `over` names, from the same literal. */
  const REGROUPED = { slots: MISMATCHED.slots };

  test('at INDEPENDENT arities every instance receives ALL N — ADR 0044, and the run does not stop', async () => {
    // **P14's own question, asked of the RUN.** `slots` and `items` are unrelated
    // keys with unrelated lengths, and before ADR 0044 the array a `publish`
    // instance received held the ONE `score` output whose branch path was
    // numerically equal to its own index in an unrelated region — one of three at
    // `items 3 / slots 1`, and past the arity the run STOPPED at `FD-R3`.
    const h = harness(await pastArity());
    h.driver.start(MISMATCHED);
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: MISMATCHED });
    h.scheduler.settle('r1:score:0:0', 'done', { result: { A: 0 } });
    h.scheduler.settle('r1:score:1:0', 'done', { result: { A: 1 } });
    // `regroup` receives the join's collection (`JP-R12`) and returns the key
    // `rank`'s `over` names. Three slots, two items.
    h.scheduler.settle('r1:regroup:-:0', 'done', { result: REGROUPED });
    ok(MISMATCHED.slots.length > MISMATCHED.items.length,
      'the fixture really is mismatched - if the two arities were equal every instance would ' +
      'receive the same array for a second reason and this assertion would be about nothing');

    // Derived from `JP-R5` and ADR 0036 rule 5, not from the run: every
    // `branch.opened` is emitted before any dispatch, and the instances are
    // dispatched in item order. **All THREE are dispatched now** — the third is
    // where the run used to stop.
    equal(h.ids(), [
      'r1:ingest:-:0', 'r1:score:0:0', 'r1:score:1:0', 'r1:regroup:-:0',
      'r1:publish:0:0', 'r1:publish:1:0', 'r1:publish:2:0',
    ], 'every instance of the second region is dispatched, including the one past the first`s arity');

    // **The three payloads are IDENTICAL and that is the rule, not a coincidence.**
    // `publish` and `score` share no region, so there is nothing for their two paths
    // to disagree about and every instance sees every output — in ascending
    // `branchPath` order, which is `JP-R12`'s order rule and `FD-C1`'s.
    const ALL = { scored: [{ A: 0 }, { A: 1 }] };
    equal(h.payloadOf('r1:publish:0:0'), ALL, 'instance 0 sees BOTH scores');
    equal(h.payloadOf('r1:publish:1:0'), ALL, 'and so does instance 1');
    equal(h.payloadOf('r1:publish:2:0'), ALL,
      'and so does the instance past the first region`s arity, which used to stop the run');
    equal(h.failures, [], 'and nothing is reported — FD-R3 has no case on this document');
  });

  test('and the array is the SAME whatever the two arities are — the independence, asserted', async () => {
    // **The pair, and its difference is a claim** (`doc/workflow.md` section 5
    // rule 8's fourth requirement on the set). Two runs of one document at two
    // arity pairs that differ in BOTH directions: `items` longer than `slots`, and
    // `slots` longer than `items`. What a reader receives must depend on the first
    // region's arity and on NOTHING about its own.
    const run = async (items: string[], slots: string[]) => {
      const h = harness(await pastArity());
      h.driver.start({ items, slots });
      h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items, slots } });
      for (const [i] of items.entries()) {
        h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { A: i } });
      }
      h.scheduler.settle('r1:regroup:-:0', 'done', { result: { slots } });
      const pubs = h.ids().filter((id) => id.startsWith('r1:publish:'));
      return { pubs, payloads: pubs.map((id) => h.payloadOf(id)), failures: h.failures };
    };

    const wide = await run(['a', 'b', 'c'], ['x']);          // three items, ONE slot
    const narrow = await run(['a', 'b'], ['x', 'y', 'z']);   // two items, THREE slots
    ok(wide.pubs.length !== narrow.pubs.length, 'the two runs really do differ in the SECOND arity');

    equal(wide.pubs.length, 1, 'one slot, one instance');
    equal(wide.payloads[0], { scored: [{ A: 0 }, { A: 1 }, { A: 2 }] },
      'and it sees all THREE scores — the case Q206 measured as receiving one of three');
    equal(narrow.pubs.length, 3, 'three slots, three instances');
    // **`checked` is pushed AFTER the assertion, never before** — W23's asymmetry,
    // and this file's own two-digit fixture three suites down records the lesson.
    // W50's adequacy reader found this loop bounded by nothing: `pubs.length`
    // counts what the run DISPATCHED, so slicing the payload list to one entry —
    // or to none — cost **zero**.
    const checked: number[] = [];
    for (const [i, got] of narrow.payloads.entries()) {
      equal(got, { scored: [{ A: 0 }, { A: 1 }] }, `instance ${i} sees both scores`);
      checked.push(i);
    }
    equal(checked, [0, 1, 2], 'every instance was ASSERTED, not merely dispatched');
    equal(wide.failures, [], 'no failure on the wide run');
    equal(narrow.failures, [], 'and none on the narrow one');
  });

  test('and the CONDITIONAL form is what the decision road needs — FD-C4, `[]`', async () => {
    // **The pair, and the difference between the halves is ONE PAYLOAD**
    // (`doc/workflow.md` section 5 rule 8's fourth requirement on the set). One
    // document, two runs: the predicate sends one down the map region and the other
    // straight past it, so on the second `score` produces nothing ANYWHERE — which
    // is a road ADR 0044 does not touch, because it is about whether the target ran
    // at all rather than about whose path its outputs are on.
    const def = await pastDecision();
    equal(
      validateDefinition(def, { predicates: ['isLowConfidence'], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools }),
      [],
      'the conditional document is valid — and the UNCONDITIONAL form of it is FD-V29, ' +
      'which is what makes the suffix load-bearing rather than decoration',
    );
    const unconditional = JSON.parse(JSON.stringify(def)) as FlowDefinition;
    (unconditional.nodes.find((n) => n.id === 'rank') as unknown as
      { needs: Record<string, unknown> }).needs = { scores: ['score'] };
    equal(
      violatedRules(validateDefinition(unconditional, {
        predicates: ['isLowConfidence'], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
      })),
      ['FD-V29'],
      'the control: drop the `?` and the document is refused at instantiation',
    );

    // THE ROAD TAKEN — the predicate is true, the region runs, the array resolves.
    const taken = harness(def, new Map([['isLowConfidence', () => true]]));
    taken.driver.start({ items: ['a', 'b'] });
    taken.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    taken.scheduler.settle('r1:score:0:0', 'done', { result: { A: 0 } });
    taken.scheduler.settle('r1:score:1:0', 'done', { result: { A: 1 } });
    equal(taken.failures, [], 'the region ran, so there is nothing to be conditional about');
    equal(taken.payloadOf('r1:publish:0:0'), { A: 0 },
      'and `rank` mapped over the resolved array — JP-R11, each instance its own item');

    // THE ROAD SKIPPED — the predicate is false, the region never opens, and the
    // array is `[]` rather than an absent key or a stopped run.
    const skipped = harness(def, new Map([['isLowConfidence', () => false]]));
    skipped.driver.start({ items: ['a', 'b'] });
    skipped.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    equal(skipped.failures, [], 'no FD-R3 — the reference said *if it ran*');
    ok(!skipped.ids().some((id) => id.startsWith('r1:score:')),
      'the map region was never entered, so `score` produced nothing ANYWHERE');
    ok(!skipped.ids().some((id) => id.startsWith('r1:publish:')),
      '`over` names an empty array, so the second region opens NO instances — W33`s N = 0, ' +
      'reached by a REFERENCE rather than by a worker returning an empty list');
  });

  test('FD-V29`s LIMIT is a POLICY: a join firing before a branch entry settled', async () => {
    // **`ADR 0042` rule 5's second case, and both readers found it unasserted.**
    // `FD-V29` credits a region's branch entries as certain for that region's join,
    // which rests on `JP-R5` AND on the join not firing until they have settled —
    // and the second half is a property of the POLICY, which the validator is not
    // given. So the rule REMOVES cases from `FD-R3`'s reach and does not replace it,
    // and an unsound acceptance degrades to today's behaviour. This is that
    // degradation, asserted.
    //
    // **Parking at `user_action` is INESSENTIAL, and every enumeration of this limit
    // said it was the condition** — W45's conformity reader. `scoreA` here simply
    // never settles. No `user_action` anywhere.
    const def = await load('valid/fanout-join.flow.json');
    (def.nodes.find((n) => n.id === 'publish') as unknown as { needs: unknown }).needs = { x: 'scoreA' };
    equal(validateDefinition(def, { predicates: [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools }), [],
      'FD-V29 ACCEPTS it — `scoreA` is a branch entry and JP-R5 dispatches it when the region opens');

    /** Satisfied on the first arrival, whatever else is live — [Q97](../../doc/open-questions.md)'s shape. */
    const seenEvents: string[] = [];
    const eager: JoinPolicy<{ arrived: number }> = {
      id: 'eager-any-arrival',
      open: () => ({ arrived: 0 }),
      step: (st, e) => {
        seenEvents.push(e.type);
        return e.type === 'branch.arrived' ? { arrived: st.arrived + 1 } : st;
      },
      status: (st) => (st.arrived > 0 ? 'satisfied' : 'waiting'),
      describe: (st) => ({ arrived: st.arrived }),
    };
    // **Through the shared harness, so `h.failures` has a POSITIVE case.** Its
    // adequacy reader measured that this file's thirteen reads of that channel all
    // assert it is EMPTY, so neutering `onRunFailure` cost zero and the compound —
    // reverting the resolver AND neutering the channel — came back at the same six
    // failures as the revert alone. *A channel every assertion expects to be empty
    // is not an observer.*
    const h = harness(def, new Map(), eager as unknown as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    // Only branch 1 settles. `scoreA` is dispatched and never settles at all.
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { B: 2 } });
    const failures = h.failures;

    equal(h.ids(),
      ['r1:ingest:-:0', 'r1:scoreA:0:0', 'r1:scoreB:1:0'],
      'both branch entries WERE dispatched — JP-R5, which is the half FD-V29 is right about');
    equal(failures.length, 1, 'and the reader was entered anyway, so FD-R3 fired');

    // **`FD-R3` names FOUR things and W50 deleted the only assertions on three of
    // them**, because they lived in the fixture ADR 0044 made resolve. Its
    // conformity reader measured what that cost: dropping the branch path from the
    // message, or replacing the node id or the target with `"ZZZ"`, each cost
    // **zero**. They are re-sited here, on the road the rule still has.
    //
    // `spec/flow-definition.md` section 6: *"Reported as an `UnresolvedReference`
    // naming the declaring node, its branch path, the key and the target."*
    const msg = failures[0]!.message;
    ok(msg.includes('"publish"'), 'it names the DECLARING NODE');
    ok(msg.includes('"scoreA"'), 'and the TARGET');
    ok(msg.includes('`needs["x"]`'), 'and the KEY');
    ok(msg.includes('branch path "-"'), 'and the BRANCH PATH — `publish` is after the join, at `-`');
    ok(msg.includes('FD-R3'), 'and it cites the rule');
    // **The SITE, at the node half** — W42's adequacy reader's finding 42, whose
    // assertion W50 also deleted with the fixture: swapping the node site's label to
    // `'edge needs'` cost **0** again, which would send a reader looking for an edge
    // that does not carry one.
    ok(!msg.includes('edge needs'),
      'as a NODE`s `needs`, not an edge`s — the edge site says `edge needs["f"]` and is asserted ' +
      'in test/driver/decision-context.test.ts');

    equal(failures[0]!.kind, 'UnresolvedReference',
      'FD-R3 is the backstop — a policy this repository does not ship falsifies FD-V29`s credit, ' +
      'and the run stops rather than handing a worker something it did not ask for');

    // **What makes this policy differ from a shipped one is itself a claim**
    // (`doc/workflow.md` section 5 rule 8's fourth requirement on the set). Its
    // adequacy reader measured that the policy's STATE was bound to nothing: a
    // policy answering `satisfied` with no events at all demonstrates the same
    // `FD-R3`, so the row said nothing about *fired ON AN ARRIVAL, with the other
    // branch entry unsettled* — which is `FD-V29`'s stated limit and the whole
    // reason this fixture exists.
    ok(seenEvents.includes('branch.arrived'),
      'the join fired on an ARRIVAL — not on an opened, not on a lost, and not on nothing');
    equal(seenEvents.filter((t) => t === 'branch.arrived').length, 1,
      'exactly ONE arrival, which is what *before the other branch entry settled* means');
    ok(h.ids().includes('r1:scoreA:0:0'),
      '`scoreA` WAS dispatched — JP-R5, the half FD-V29 is right about');
    equal(seenEvents.filter((t) => t === 'branch.arrived' || t === 'branch.exited').length, 1,
      'and only ONE branch reached a terminal event — `scoreA` never settled, which is the half ' +
      'FD-V29 credits and this policy does not wait for');

    // **The CONTROL, and it is what makes the row above a statement about the
    // POLICY rather than about the flow**: the same document, the same payload, the
    // same references, under a SHIPPED policy — and nothing goes wrong.
    const s2 = new FakeScheduler();
    const f2: string[] = [];
    const d2 = new Driver(def, {
      runId: 'r1', scheduler: s2, createTask: (c) => c, predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, joinPolicy: liveToken as JoinPolicy,
      onRunFailure: (f) => f2.push(f.kind),
    });
    d2.start({});
    s2.settle('r1:ingest:-:0', 'done', { result: {} });
    s2.settle('r1:scoreB:1:0', 'done', { result: { B: 2 } });
    equal(f2, [], 'under `live-token` the join does not fire while a branch is live, so no FD-R3');
    ok(!s2.added.some((t) => t.id.startsWith('r1:publish:')),
      'and the reader is not entered at all — which is why every shipped policy makes this ' +
      'unreachable and why the fixture has to bring its own');
  });

  test('a branch ROUTED AWAY from its join still resolves — the certainty credit, at run time', async () => {
    // **Measurement 9, which W45's Verification claimed was asserted and was not** —
    // its conformity reader. Two of the three non-arrival roads had no assertion,
    // and the interesting one is this: `publish` reads the branch that **LEFT the
    // region**, and gets its result. `JP-R12` gives an exited branch NO KEY in the
    // join's collection, so a `needs` reference reaches a value the join deliberately
    // does not carry.
    const def = await load('valid/p1-routed-away.flow.json');
    for (const [label, target, expected] of [
      ['the ARRIVING branch', 'scoreA', { A: 1 }],
      ['the branch that LEFT the region', 'scoreB', { B: 2 }],
    ] as const) {
      const d = JSON.parse(JSON.stringify(def)) as FlowDefinition;
      (d.nodes.find((n) => n.id === 'publish') as unknown as { needs: unknown }).needs = { got: target };
      equal(validateDefinition(d, { predicates: ['isLowConfidence'], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools }), [],
        `${label}: FD-V29 accepts it — a fanout branch entry is dispatched whatever the run does`);
      const scheduler = new FakeScheduler();
      const failures: string[] = [];
      const driver = new Driver(d, {
        runId: 'r1', scheduler, createTask: (c) => c,
        // TRUE, so `scoreB` takes its `when` edge to the `end` and never arrives.
        predicates: new Map([['isLowConfidence', () => true]]),
        workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, joinPolicy: liveToken as JoinPolicy,
        onRunFailure: (f) => failures.push(f.kind),
      });
      driver.start({});
      scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
      scheduler.settle('r1:scoreA:0:0', 'done', { result: { A: 1 } });
      scheduler.settle('r1:scoreB:1:0', 'done', { result: { B: 2 } });
      equal(failures, [], `${label}: no FD-R3`);
      equal((scheduler.added.find((t) => t.id === 'r1:publish:-:0')?.payload as { input?: unknown } | undefined)?.input, { got: expected },
        `${label}: and the reference resolves to that branch`);
    }
  });

  test('resolve() both reports and RETHROWS, and start() cannot reach FD-R3 at all', async () => {
    // **`start()` has no case, and this test's first version claimed it did.**
    // `start()` composes only the entry node; a reference from the entry node names
    // a target the entry node must be reachable FROM (`FD-V27`), which with
    // `FD-V11` makes the entry reachable from it — an `FD-V10` cycle. So that road
    // is refused at instantiation and cannot exist. **The `resolve()` half IS
    // reachable and was untested**, which is the half asserted below: a suspended
    // node whose RESOLUTION lets a join fire over a branch entry that never settled —
    // W50 moved this fixture there when ADR 0044 removed the arity road.
    // *This is `FD-R1`'s own "test that cannot be built", one section along in the
    // same document.* W41's conformity reader.
    const def = {
      flowId: 'reference-at-entry', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'mid' }] },
        { id: 'mid', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const h = harness(def);
    h.driver.start({});
    equal(h.ids(), ['r1:ingest:-:0'], 'the control: with no needs anywhere, start() dispatches normally');

    const h2 = harness(await pastArity());
    h2.driver.start(MISMATCHED);
    throws(
      () => {
        if (!h2.driver.resolve('r1:ingest:-:0', 'done', { result: {}, actor: 'test' })) {
          throw new Error('refused: r1:ingest:-:0 is not suspended');
        }
      },
      'refused',
      'resolve() on a task that is not suspended is REFUSED (RS-R1) — the control that keeps ' +
      'the assertion below from passing for the wrong reason',
    );

    // **The reachable half: `resolve()` reports AND rethrows.** A node suspends, a
    // person resolves it, the resolution lets a join fire, and the node the join
    // feeds cannot compose — so `compose` throws inside `resolve()`, with the caller
    // on the stack. Nothing asserted this before W41; the test was named for
    // `start()`, which `FD-V27` makes unreachable.
    //
    // **This fixture has moved TWICE and each move is a rule narrowing `FD-R3`.**
    // W45 moved it off a decision, because `FD-V29` refuses that document now; W50
    // moves it off the two-map-arity road, because
    // [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
    // makes a sibling reference resolve at every arity. **What is left is the one
    // road `FD-R3`'s row still names** — a join policy firing before a branch entry
    // has settled ([Q218](../../doc/open-questions.md)) — so this fixture brings its
    // own policy, exactly as the suite's own limit case does, and the SHIPPED-policy
    // control below is what makes it a statement about `resolve()` rather than about
    // the policy.
    const def3 = await load('valid/fanout-join.flow.json');
    (def3.nodes.find((n) => n.id === 'publish') as unknown as { needs: unknown }).needs = { x: 'scoreA' };
    /** Satisfied on the first ARRIVAL, whatever else is live. */
    const eagerR: JoinPolicy<{ arrived: number }> = {
      id: 'eager-any-arrival',
      open: () => ({ arrived: 0 }),
      step: (st, e) => (e.type === 'branch.arrived' ? { arrived: st.arrived + 1 } : st),
      status: (st) => (st.arrived > 0 ? 'satisfied' : 'waiting'),
      describe: (st) => ({ arrived: st.arrived }),
    };
    const s3 = new FakeScheduler();
    const f3: { kind: string }[] = [];
    const d3 = new Driver(def3, {
      runId: 'r1', scheduler: s3, createTask: (c) => c, predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, joinPolicy: eagerR as unknown as JoinPolicy,
      onRunFailure: (f) => f3.push({ kind: f.kind }),
    });
    d3.start({});
    s3.settle('r1:ingest:-:0', 'done', { result: {} });
    // `scoreA` never settles. `scoreB` SUSPENDS, so the arrival that satisfies the
    // join happens inside `resolve()` and not inside a settlement.
    s3.settle('r1:scoreB:1:0', 'user_action', {});
    equal(f3, [], 'suspended, and nothing has gone wrong yet');
    throws(
      () => d3.resolve('r1:scoreB:1:0', 'done', { result: { B: 2 }, actor: 'a-person' }),
      'UnresolvedReference',
      'resolve() RETHROWS, because the caller is on the stack — FD-R3, the one road it has',
    );
    equal(f3.length, 1, 'and it REPORTS as well as rethrowing');
    equal(f3[0]!.kind, 'UnresolvedReference', 'through OR-R10, under its own class');

    // **The CONTROL** — the same document, the same suspension, the same resolution,
    // under a SHIPPED policy. `live-token` does not fire the join while `scoreA` is
    // live, so the reader is never entered and `resolve()` returns normally.
    const s4 = new FakeScheduler();
    const f4: string[] = [];
    const d4 = new Driver(def3, {
      runId: 'r1', scheduler: s4, createTask: (c) => c, predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, joinPolicy: liveToken as JoinPolicy,
      onRunFailure: (f) => f4.push(f.kind),
    });
    d4.start({});
    s4.settle('r1:ingest:-:0', 'done', { result: {} });
    s4.settle('r1:scoreB:1:0', 'user_action', {});
    equal(d4.resolve('r1:scoreB:1:0', 'done', { result: { B: 2 }, actor: 'a-person' }), true,
      'under a shipped policy the same resolve() succeeds — so the row above is about FD-R3 ' +
      'and not about resolve()`s rethrow being unconditional');
    equal(f4, [], 'and nothing is reported');
  });

  test('a RESUMED node resolves to the RESOLUTION, and a suspended one is never reached', () => {
    // Section 3's *"the effective outcome, never the raw record"*: a node that
    // settled `user_action` and has not been resolved has NO effective outcome, so
    // it contributes no entry — which is what makes this refuse loudly rather than
    // compose a key holding `undefined`.
    const def = {
      flowId: 'reference-to-a-suspended-node', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'sub' }] },
        { id: 'sub', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', type: 'PublishWorker',
          needs: { s: 'sub' }, edges: [{ to: 'done' }],
        },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:sub:-:0', 'user_action', {});
    equal(h.ids(), ['r1:ingest:-:0', 'r1:sub:-:0'], 'suspended — nothing routes, so publish is not reached');
    equal(h.failures, [], 'and no failure: a suspended path is waiting on a person, not stuck');

    ok(h.driver.resolve('r1:sub:-:0', 'done', { result: { human: true }, actor: 'a-person' }),
      'the resolution is accepted');
    equal(h.ids(), ['r1:ingest:-:0', 'r1:sub:-:0', 'r1:publish:-:0'], 'the resolution resumes it');
    equal(h.payloadOf('r1:publish:-:0'), { s: { human: true } },
      'and the reference resolves to the RESOLUTION`s result, not the user_action settlement`s — ' +
      'section 3 rule 4`s *always the effective outcome*, one level out');
  });

  test('a RESUMED node read through ["n"] contributes ONE entry, not two', () => {
    // **W41's adequacy reader, and it is the intersection of two clauses no fixture
    // crossed.** A resumed task has TWO records in the log — the `user_action`
    // settlement and the resolution — and `outputs()` walks the log, so without its
    // task-id dedup that task contributes an entry PER RECORD: a two-item map read
    // through `["score"]` yields a **three**-element array. Both clauses are in this
    // file's own derivation table (`FD-C1`'s `["n"]` row and section 3's *the
    // effective outcome, never the raw record*) and no case reached both at once.
    const def = {
      flowId: 'resumed-then-collected', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'score' },
        { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', type: 'PublishWorker',
          needs: { all: ['score'] }, edges: [{ to: 'done' }],
        },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    h.scheduler.settle('r1:score:0:0', 'user_action', {});
    h.scheduler.settle('r1:score:1:0', 'done', { result: { s: 1 } });
    ok(h.driver.resolve('r1:score:0:0', 'done', { result: { s: 0, human: true }, actor: 'a-person' }),
      'the resolution is accepted and the region completes');
    equal(h.payloadOf('r1:publish:-:0'), { all: [{ s: 0, human: true }, { s: 1 }] },
      'TWO entries for a two-item map — one per TASK, not one per RECORD — and the resumed ' +
      'instance carries the RESOLUTION`s result, in ascending branchPath order');
  });

  test('UnresolvedReference is exported and is its own class', () => {
    ok(new UnresolvedReference('x') instanceof Error, 'an Error subclass');
    ok(UnresolvedReference.name === 'UnresolvedReference',
      'named separately from UnresolvedMapArity, because the two send a reader to different places');
  });
});

/**
 * **The two-digit fixture, and it is the only thing that can discriminate.**
 *
 * `JP-R12`'s own test note says the discriminating fixture for a key-order rule is
 * a map at **N = 12**, because below eleven instances *unsorted*, *lexicographic*
 * and *segment-wise numeric* all give the same answer. Rule 8 measured the same
 * thing here and it is why these cases exist rather than being folded into the
 * three-item flows above: with only `0`, `1` and `2` in play,
 *
 *   - sorting the array LEXICOGRAPHICALLY survives every assertion in this file;
 *   - reading path visibility with `String.startsWith` survives every one too.
 *
 * Both are caught here and by nothing else in the repository. **Neither is a
 * hypothetical**: the second silently hands instance `10` the output of instance
 * `1`, which is a wrong answer rather than a crash.
 */
const WIDE: FlowDefinition = {
  flowId: 'needs-at-two-digit-arity',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'items', branch: 'score' },
    { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'refine' }] },
    // **Inside the same region as what it names**, which is the shape `FD-V28`'s
    // `many` must not answer from the target's membership alone.
    {
      id: 'refine', kind: 'task', type: 'MergeWorker',
      needs: { own: 'score' }, edges: [{ to: 'collect' }],
    },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'rank' }] },
    { id: 'rank', kind: 'map', over: 'all', branch: 'publish', needs: { all: ['refine'] } },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'gather' }] },
    { id: 'gather', kind: 'join', of: 'rank', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

const N = 12;

suite('L2 — the two-digit arity, where three orderings stop agreeing', (test) => {
  test('the definition validates — `"score"` from INSIDE its own region is the ONE form', () => {
    // FD-V28: `refine` is in region(split) and so is `score`, so `score` produces
    // exactly one output on `refine`'s path and the bare form is what is legal.
    // A `many` computed from the TARGET's region membership alone would refuse
    // this valid document, and nothing else in this file would notice.
    equal(validateDefinition(WIDE, { predicates: [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools }), [],
      'zero findings — a reference within one region is the ONE form');
  });

  test('each instance receives its OWN score, at paths 0..11, and never a sibling`s', () => {
    const h = harness(WIDE);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', {
      result: { items: Array.from({ length: N }, (_v, i) => i) },
    });
    equal(h.ids().length, 1 + N, `${N} instances of score, plus ingest`);
    // **ASCENDING, and the direction is the whole of what this case discriminates.**
    // A node composes at the moment it is entered, so `refine` at path `10` is
    // dispatched as soon as `score@10` settles — and it can only be handed
    // `score@1`'s output if `score@1` is ALREADY in the log. Settled descending,
    // `1` has not run yet when `10` composes, the wrong visibility predicate has
    // nothing to reach, and the probe survives. Measured: with `isPathPrefix`
    // replaced by `b.startsWith(a)` this suite passed until the direction changed.
    // *A fixture at the right arity in the wrong order is not a discriminating
    // fixture*, which is `doc/workflow.md` section 5 rule 8's *does it fire for the
    // reason it names* one layer in.
    // **And the direction is ASSERTED rather than written in a comment**, because
    // W41's adequacy reader flipped it back to descending for **0 failures** and the
    // only thing defending it was the paragraph above. Recorded by the loop and
    // compared, so reversing the `for` is red before any payload is read.
    const settledInOrder: number[] = [];
    for (let i = 0; i < N; i++) {
      settledInOrder.push(i);
      h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { at: i } });
    }
    equal(settledInOrder, Array.from({ length: N }, (_v, i) => i),
      'settled ASCENDING — which is what puts `score@1` in the log before `refine@10` composes. ' +
      'Descending, the wrong visibility predicate has nothing to reach and the probe survives');

    // **`checked` is pushed AFTER the assertion, not before it** — the same reader.
    // Written `ran.push(i)` first, an `if (i > 0) continue;` inserted below it cost
    // **0**: the guard counted what the loop ITERATED and not what it ASSERTED, and
    // instance `0` is precisely the one where `startsWith` gives the right answer.
    // *Counting the loop is not counting the assertions*, which is obligation (d)
    // one step in from where this file first applied it.
    const checked: number[] = [];
    for (let i = 0; i < N; i++) {
      equal(h.payloadOf(`r1:refine:${i}:0`), { own: { at: i } },
        `instance ${i} sees ITS score. With visibility read as a STRING prefix, "10".startsWith("1") ` +
        'is true, so instance 10 is handed instance 1`s output — a wrong answer, not a crash');
      checked.push(i);
    }
    equal(checked, settledInOrder, 'every instance was ASSERTED, and there are as many as were settled');
    equal(checked.length, N, `and ${N} of them — the arity two-digit paths need`);
  });

  test('the collected array is in NUMERIC path order, where lexicographic differs', () => {
    const h = harness(WIDE);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', {
      result: { items: Array.from({ length: N }, (_v, i) => i) },
    });
    for (let i = N - 1; i >= 0; i--) h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { at: i } });
    for (let i = N - 1; i >= 0; i--) h.scheduler.settle(`r1:refine:${i}:0`, 'done', { result: { r: i } });

    // `rank` maps over the array `["refine"]` composed. Its instances are indexed by
    // POSITION in that array, so the payload at position k tells us what the array's
    // k-th element was — which is the projection that checks the order.
    const got = Array.from({ length: N }, (_v, k) => h.payloadOf(`r1:publish:${k}:0`));
    equal(got, Array.from({ length: N }, (_v, i) => ({ r: i })),
      'ascending segment-wise NUMERIC — `spec/flow-definition.md` section 3`s `["n"]` row, which is ' +
      'JP-R12`s order rule. Lexicographic gives 0,1,10,11,2,… and settlement order gives 11..0; ' +
      'all three agree below eleven instances and this is the arity where they stop');
    // And the two wrong orders are named rather than merely excluded, so a reader
    // can see what this assertion is discriminating between.
    const lex = [...Array.from({ length: N }, (_v, i) => String(i))].sort();
    equal(lex.slice(0, 4), ['0', '1', '10', '11'], 'lexicographic really does differ here');
  });
});

/**
 * `FD-C4` — what a CONDITIONAL reference carries when its target produced nothing.
 * [ADR 0042](../../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)
 * rule 4, [W45](../../doc/work-items/w45-what-a-reference-must-be-able-to-say.md).
 *
 * **Every expected value is derived from section 3's table:** an ABSENT KEY for
 * `"n?"` and `[]` for `["n?"]`, and everything else exactly `FD-C1`'s row for the
 * unsuffixed form.
 *
 * **The asymmetry is asserted rather than assumed**, because it is the one thing in
 * this rule that could have been a choice: the `one` form has no VALUE available to
 * mean *did not run*, since a reference to a task that ran and FAILED already
 * resolves to `null` with the key present. The last test here is that measurement.
 */
suite('L2 — FD-C4: a conditional reference, when the target produced nothing', (test) => {
  const IF_IT_RAN = 'valid/reference-if-it-ran.flow.json';

  test('Q187`s flow — the key is PRESENT on the review road and ABSENT on the other', async () => {
    // **One flow, TWO runs, and the difference is the predicate's answer** — so no
    // literal in this test can stand in for the reference (`doc/workflow.md`
    // section 5 rule 8's fourth requirement on the set: whatever makes a
    // discriminating pair differ is itself a claim, so it is read from the fixtures
    // and compared).
    const took: Record<string, string[]> = {};
    const payloads: Record<string, unknown> = {};
    for (const low of [true, false]) {
      const def = await load(IF_IT_RAN);
      const scheduler = new FakeScheduler();
      const failures: { kind: string }[] = [];
      const driver = new Driver(def, {
        runId: 'r1', scheduler, createTask: (c) => c,
        predicates: new Map([['isLowConfidence', () => low], ['isHighConfidence', () => !low]]),
        workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, joinPolicy: liveToken as JoinPolicy,
        onRunFailure: (f) => failures.push({ kind: f.kind }),
      });
      driver.start({ doc: 1 });
      scheduler.settle('r1:ingest:-:0', 'done', { result: { doc: 1 } });
      scheduler.settle('r1:decide:-:0', 'done', { result: { confidence: low ? 0.2 : 0.9 } });
      if (low) scheduler.settle('r1:review:-:0', 'done', { result: { verdict: 'keep' } });
      equal(failures, [], `low=${low}: the run did NOT stop — FD-R3 is what the suffix removes`);
      took[String(low)] = scheduler.added.map((t) => t.id.split(':')[1]!);
      payloads[String(low)] = (scheduler.added.find((t) => t.id === 'r1:publish:-:0')?.payload as { input?: unknown } | undefined)?.input;
    }

    // The two runs took different roads, which is what makes the two payloads
    // comparable at all. Read from what was dispatched, not declared here.
    equal(took['true'], ['ingest', 'decide', 'review', 'publish'], 'low: through review');
    equal(took['false'], ['ingest', 'decide', 'publish'], 'high: around it');
    ok(took['true']!.length !== took['false']!.length,
      'the PAIR really is a pair — if the two roads were the same the assertions below would ' +
      'both be about one case');

    // Section 3's table: `"."` is what the node would have received anyway, and
    // `"review?"` is `"review"` with the key absent instead of the run stopping.
    equal(payloads['true'], { own: { verdict: 'keep' }, verdict: { verdict: 'keep' } },
      'low: `verdict` is PRESENT and is review`s result, exactly as the unsuffixed form would be');
    equal(payloads['false'], { own: { confidence: 0.9 } },
      'high: the key is ABSENT — not present holding null, and not present holding undefined');
    ok(!('verdict' in (payloads['false'] as Record<string, unknown>)),
      'and `in` says so, which is the projection FD-C4 promises an author');
  });

  test('the ARRAY form gives `[]`, and `.` beside it is untouched', async () => {
    // The other row of `FD-C4`. **Its fixture MOVED at W50**: it used to be a map
    // region whose reader was a later map region's instance past the first's arity,
    // and [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
    // makes that instance see every output — so `[]` needs a road where the target
    // produced nothing ANYWHERE, which is a decision routing around the whole
    // region ([Q218](../../doc/open-questions.md)).
    //
    // **`.` beside it is the half that keeps `[]` a VALUE rather than the
    // composition failing**: the reader still receives its own item under `own`,
    // in the same object, on the same run.
    const base = JSON.parse(
      JSON.stringify(await load('valid/map-with-context.flow.json')),
    ) as FlowDefinition;
    // `ingest` decides: down the map region, or straight to `publish`, which reads
    // `score` — a node the second road never enters.
    const ingest = base.nodes.find((n) => n.id === 'ingest') as unknown as
      { edges: { to: string; when?: string }[] };
    const publish = base.nodes.find((n) => n.id === 'publish') as unknown as
      { needs: Record<string, unknown> };
    ingest.edges = [{ when: 'isLowConfidence', to: 'split' }, { to: 'publish' }];
    publish.needs = { own: '.', scored: ['score?'] };
    equal(
      violatedRules(validateDefinition(base, {
        predicates: ['isLowConfidence'], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
      })),
      [],
      'the conditional document is valid',
    );

    // THE ROAD SKIPPED — `score` runs nowhere, so the array is `[]`.
    const skipped = harness(base, new Map([['isLowConfidence', () => false]]));
    skipped.driver.start({ items: ['a', 'b'], config: { k: 1 } });
    skipped.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'], config: { k: 1 } } });
    equal(skipped.failures, [], 'no FD-R3 — the reference said *if it ran*');
    ok(!skipped.ids().some((id) => id.startsWith('r1:score:')), '`score` was never dispatched');
    const got = skipped.payloadOf('r1:publish:-:0') as Record<string, unknown>;
    equal(got.scored, [], '`scored` is PRESENT and EMPTY — iterable without a guard');
    ok('scored' in got, 'PRESENT, which is the whole difference from the ONE form`s absent key');
    equal(got.own, { items: ['a', 'b'], config: { k: 1 } },
      'and `.` beside it is untouched — so `[]` is this key`s answer and not the composition failing');

    // THE ROAD TAKEN — the same document, the same payload, the other predicate.
    // **The pair's difference is a claim**: without this half, `[]` would be
    // consistent with the array arm never resolving anything at all.
    const taken = harness(base, new Map([['isLowConfidence', () => true]]));
    taken.driver.start({ items: ['a', 'b'], config: { k: 1 } });
    taken.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'], config: { k: 1 } } });
    taken.scheduler.settle('r1:score:0:0', 'done', { result: { A: 0 } });
    taken.scheduler.settle('r1:score:1:0', 'done', { result: { A: 1 } });
    equal(taken.failures, [], 'and nothing goes wrong on the road the region runs on');
    const got2 = taken.payloadOf('r1:publish:-:0') as Record<string, unknown>;
    equal(got2.scored, [{ A: 0 }, { A: 1 }],
      'the SAME reference resolves to both outputs when the region ran — the pair, and its ' +
      'difference is the predicate rather than a literal');
  });

  test('and `null` is why the ONE form reports an ABSENT key rather than a value', async () => {
    // **The measurement rule 4 rests on**, as an assertion. A reference to a task
    // that RAN and FAILED resolves to `null` with the key PRESENT — so `null` already
    // means *ran and produced nothing*, and no value is available to mean *did not
    // run*. Without this, `{f: null}` would be the obvious design and would collapse
    // two cases an author has to tell apart.
    const def = JSON.parse(
      JSON.stringify(await load('valid/fanout-failure.flow.json')),
    ) as FlowDefinition;
    const reader = def.nodes.find((n) => n.id === 'publish') as unknown as
      { needs: Record<string, unknown> };
    reader.needs = { got: 'scoreA' };
    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'failed');
    h.scheduler.settle('r1:reviewB:1:0', 'done', { result: { B: 2 } });

    equal(h.failures, [], 'a branch that EXITED via a failure edge is not FD-R3 — it ran');
    const p = h.payloadOf('r1:publish:-:0') as Record<string, unknown>;
    equal(p, { got: null }, 'and the reference resolves to `null`, with the key present');
    ok('got' in p, 'PRESENT — which is the whole reason FD-C4 could not use null for *did not run*');
  });
});


/**
 * **What a reference COSTS, stated so a machine can check it** —
 * [W46](../../doc/work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md),
 * [Q186](../../doc/open-questions.md), and `spec/flow-definition.md` section 3's cost blockquote.
 *
 * **A timing assertion is refused in advance** — wall time here is not reproducible
 * ([Q179](../../doc/open-questions.md)), and W46 measured a cause: a table taken in
 * ONE process carries up to **4.4x of accumulation** in its last row. So the numbers
 * live in section 3 and this suite asserts what is deterministic.
 *
 * **This suite is W46's SECOND, and the first is recorded here rather than deleted
 * quietly.** That one asserted *N instances, N distinct copies* — and both readers
 * showed it was the wrong sensor:
 *
 * | | |
 * |---|---|
 * | it could not go above N | doubling the clones (`cloneValue(cloneValue(x))`) cost **0**, because a `Set` over what N receivers RECEIVED cannot exceed N however many copies were made |
 * | it was a fourth restatement | every mutation it caught was already caught by 2-7 assertions in W41's `JP-R11` suites and W42's edge-site suite |
 * | and it asserted the half that cannot go wrong for a SIZE reason | *one copy per instance* is the arity half; the document's claim is *and the cost is linear in the size of each, so the PRODUCT is what an author pays*, which it said nothing about |
 *
 * So the two clauses below are the two things nothing else asserts: **the product**,
 * as a deterministic proxy its own adequacy reader proposed, and **the decision**,
 * which is [Q190](../../doc/open-questions.md)'s bar for a verdict recorded in
 * `spec/` with no ADR.
 */
suite('L2 — Q186: what a reference costs, as a product and as a decision', (test) => {
  const MWC = 'valid/map-with-context.flow.json';

  /** Drive `map-with-context` to the settlement that opens its region. */
  async function dispatchWith(context: Record<string, unknown>, drop: boolean) {
    const def = JSON.parse(JSON.stringify(await load(MWC))) as FlowDefinition;
    if (drop) {
      const score = def.nodes.find((n) => n.id === 'score') as unknown as { needs: Record<string, unknown> };
      delete score.needs.run;
    }
    const h = harness(def);
    h.driver.start(context);
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: context });
    equal(h.failures, [], 'the run did not stop');
    const items = context.items as unknown[];
    const payloads = items.map((_v, i) => h.payloadOf(`r1:score:${i}:0`));
    ok(payloads.every((x) => x !== undefined), `all ${items.length} instances were dispatched`);
    return { payloads, def };
  }

  test('the PRODUCT is what an author pays — arity times what each copy holds', async () => {
    // **The deterministic proxy for the cost, and W46's adequacy reader proposed it**:
    // the summed serialised length of the N composed payloads IS *arity x size*, and it
    // is a pure function of the fixture. So *the product is what an author pays* is
    // falsifiable at L2 with no clock.
    //
    // **The pair is the SHIPPED document against itself with one key removed**, which
    // is what makes this a statement about the reference rather than about the payload:
    // `spec/examples/valid/map-with-context.flow.json` declares
    // `needs: {"item": ".", "run": "ingest"}`, and dropping `run` leaves the arity, the
    // items and the worker contract untouched.
    const ITEMS = Array.from({ length: 8 }, (_v, i) => ({ i, pad: 'x'.repeat(64) }));
    const CTX = { items: ITEMS, config: { threshold: 7 }, runLabel: 'nightly' };
    const total = (ps: unknown[]) => ps.reduce((n: number, p) => n + JSON.stringify(p).length, 0);

    const withRun = await dispatchWith(CTX, false);
    const without = await dispatchWith(CTX, true);
    equal(withRun.payloads.length, ITEMS.length, 'the arity is the items` — unchanged by `needs`');
    equal(without.payloads.length, ITEMS.length, 'and it is the SAME on the other half of the pair');

    // **`ingest`'s result HOLDS the array `over` names**, which is the whole of why the
    // showcase is the cliff — a reference names a NODE, so it carries everything that
    // node returned (P13 fact 4). Read from the document and from the run, not declared.
    const split = withRun.def.nodes.find((n) => n.kind === 'map') as unknown as { over: string };
    ok(Object.hasOwn(CTX, split.over),
      `\`ingest\`'s result holds "${split.over}", the very array the map iterates — so the ` +
      '`run` key carries the items once per item');

    const paid = total(withRun.payloads);
    const baseline = total(without.payloads);
    // Each of the N payloads carries the WHOLE context, so the product grows with the
    // arity AND with the size. Quadratic in the fixture, stated as a ratio so the
    // literal below is a shape rather than a byte count.
    ok(paid > 8 * baseline,
      `declaring the reference multiplies what the dispatch carries: ${baseline} bytes against ` +
      `${paid} — more than 8x at arity ${ITEMS.length}, and the multiplier IS the arity. That is ` +
      'the product section 3 names, and it is why the cost is not a property of the mechanism');
    // And the ratio RISES with the arity, which is what *quadratic* means and what one
    // arity cannot show. The two arities are the discriminating pair.
    const small = { items: ITEMS.slice(0, 2), config: CTX.config, runLabel: CTX.runLabel };
    const lowPaid = total((await dispatchWith(small, false)).payloads);
    const lowBase = total((await dispatchWith(small, true)).payloads);
    // **BOTH ratios must be real, and rule 8 found why**: `paid / baseline >
    // lowPaid / lowBase` alone is satisfied by making the LOW baseline bigger, which
    // is exactly what collapsing the low pair does — the inequality holds while its
    // right-hand side means nothing. A guard on a difference needs both terms bounded.
    ok(lowPaid / lowBase > 1,
      `the LOW arity's pair is a pair too — ${(lowPaid / lowBase).toFixed(1)}x at ` +
      `${small.items.length} items. Collapsing it makes the ratio 1 and the comparison below ` +
      'true for the wrong reason');
    ok(paid / baseline > lowPaid / lowBase,
      `and the ratio RISES with the arity — ${(lowPaid / lowBase).toFixed(1)}x at ` +
      `${small.items.length} items against ${(paid / baseline).toFixed(1)}x at ${ITEMS.length}. ` +
      'A cost linear in the arity alone would hold the ratio flat, and that is the difference the ' +
      'document calls quadratic');
    ok(small.items.length < ITEMS.length, 'the two arities really differ — the pair is a pair');
  });

  test('and NOTHING refuses it: the decision, asserted — Q190`s bar', async () => {
    // **[Q190](../../doc/open-questions.md)'s precedent for a verdict with no ADR is
    // *recorded in section 3 AND asserted at L2*, and W46's conformity reader found
    // this line missing.** The decision is that the flow whose reference the candidate
    // predicate fires on is **accepted with zero findings** — so if a warning channel
    // is ever added, this goes red and whoever adds it has to come here.
    const def = await load(MWC);
    equal(validateDefinition(def, { predicates: [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools }), [],
      'map-with-context validates with ZERO findings — the reference the candidate predicate ' +
      'fires on is accepted, and nothing warns. That is Q186`s decision, and it is what a ' +
      'warning channel would have to break');
    // And it is not vacuous: the SAME document with the reference aimed somewhere the
    // graph refuses is a finding, so this file can tell an accepted document from a
    // refused one.
    const bad = JSON.parse(JSON.stringify(def)) as FlowDefinition;
    (bad.nodes.find((n) => n.id === 'score') as unknown as { needs: Record<string, unknown> })
      .needs.run = 'publish';
    ok(validateDefinition(bad, { predicates: [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools }).length > 0,
      'the control: the same flow with the reference pointed DOWNSTREAM is refused, so the ' +
      'assertion above is about this document and not about the validator being silent');
  });
});
