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
 * | *a node with no `needs` is unchanged* | `FD-C1`'s first clause, and ADR 0040 rule 1 |
 */
import { equal, listDir, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { Driver, UnresolvedReference } from '../../src/driver/driver.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import { allRegions, buildGraph } from '../../src/definition/regions.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workerTypes: string[] };

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

function harness(def: FlowDefinition) {
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
    predicates: new Map([['isHighConfidence', () => false], ['isLowConfidence', () => false]]),
    workerTypes: reg.workerTypes,
    joinPolicy: liveToken as JoinPolicy,
    onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
  });
  return {
    scheduler, driver, failures,
    ids: () => scheduler.added.map((t) => t.id),
    payloadOf: (id: string) => scheduler.added.find((t) => t.id === id)?.payload,
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
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'sink' }] },
        {
          id: 'sink', kind: 'task', workerType: 'PublishWorker',
          needs: { a: '.', b: '.' }, edges: [{ to: 'done' }],
        },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(validateDefinition(def, { predicates: [], workerTypes: reg.workerTypes }), [],
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
    for (const f of (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json')).sort()) {
      const d = JSON.parse(await readText(`${EX}/valid/${f}`)) as FlowDefinition;
      if (d.nodes.some((n) => REGION_KINDS.has(n.kind))) onDisk.push(f.replace(/\.flow\.json$/, ''));
    }
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
    equal([...expected.values()].filter((v) => v.lost > 0).length, 4,
      'and exactly the FOUR flows with a map region lose an output');
    equal([...expected.values()].filter((v) => !v.map).length, 4,
      'while FOUR carry only `fanout` regions and lose NOTHING — at depth 1, at depth 2, with an ' +
      'optional branch that can fail, and with a branch routed away from its join');
  });
});

suite('L2 — FD-R3: a reference the run did not produce', (test) => {
  /**
   * `ingest` decides between `flag` and `skip`; `publish` needs `flag`. `FD-V27`
   * accepts it — `publish` IS reachable from `flag` — and the graph cannot know
   * which edge a run takes, which is `FD-R2`'s own argument one door along.
   */
  const routedAround = (): FlowDefinition =>
    ({
      flowId: 'reference-routed-around',
      version: 1,
      entry: 'ingest',
      nodes: [
        {
          id: 'ingest', kind: 'task', workerType: 'IngestWorker',
          edges: [{ when: 'isHighConfidence', to: 'flag' }, { to: 'skip' }],
        },
        { id: 'flag', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        { id: 'skip', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', workerType: 'PublishWorker',
          needs: { f: 'flag' }, edges: [{ to: 'done' }],
        },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition);

  test('the run stops, reported through OR-R10, and the message names the cause', () => {
    const h = harness(routedAround());
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:skip:-:0', 'done', { result: {} });

    equal(h.ids(), ['r1:ingest:-:0', 'r1:skip:-:0'], 'publish is NOT dispatched — the run stopped');
    equal(h.failures.length, 1, 'reported exactly once');
    equal(h.failures[0]!.kind, 'UnresolvedReference', 'FD-R3, and its own class');
    ok(h.failures[0]!.message.includes('"publish"') && h.failures[0]!.message.includes('"flag"'),
      'and it names both the declaring node and the target');
    ok(h.failures[0]!.message.includes('FD-R3'), 'and cites the rule');
  });

  test('resolve() both reports and RETHROWS, and start() cannot reach FD-R3 at all', () => {
    // **`start()` has no case, and this test's first version claimed it did.**
    // `start()` composes only the entry node; a reference from the entry node names
    // a target the entry node must be reachable FROM (`FD-V27`), which with
    // `FD-V11` makes the entry reachable from it — an `FD-V10` cycle. So that road
    // is refused at instantiation and cannot exist. **The `resolve()` half IS
    // reachable and was untested**, which is the half asserted below: a suspended
    // node resolved into a path whose next node names a node this run routed around.
    // *This is `FD-R1`'s own "test that cannot be built", one section along in the
    // same document.* W41's conformity reader.
    const def = {
      flowId: 'reference-at-entry', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'mid' }] },
        { id: 'mid', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const h = harness(def);
    h.driver.start({});
    equal(h.ids(), ['r1:ingest:-:0'], 'the control: with no needs anywhere, start() dispatches normally');

    const h2 = harness(routedAround());
    h2.driver.start({});
    h2.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    throws(
      () => {
        if (!h2.driver.resolve('r1:skip:-:0', 'done', { result: {}, actor: 'test' })) {
          throw new Error('refused: r1:skip:-:0 is not suspended');
        }
      },
      'refused',
      'resolve() on a task that is not suspended is REFUSED (RS-R1) — the control that keeps ' +
      'the assertion below from passing for the wrong reason',
    );

    // **The reachable half: `resolve()` reports AND rethrows.** A node suspends,
    // a person resolves it, and the successor it resumes into names a node this run
    // routed around — so `compose` throws inside `resolve()`, with the caller on the
    // stack. Nothing asserted this before; the test was named for `start()`, which
    // `FD-V27` makes unreachable.
    const onResume = {
      flowId: 'reference-unresolvable-on-resume', version: 1, entry: 'ingest',
      nodes: [
        {
          id: 'ingest', kind: 'task', workerType: 'IngestWorker',
          edges: [{ when: 'isHighConfidence', to: 'flag' }, { to: 'sub' }],
        },
        { id: 'flag', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        { id: 'sub', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', workerType: 'PublishWorker',
          needs: { f: 'flag' }, edges: [{ to: 'done' }],
        },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const h3 = harness(onResume);
    h3.driver.start({});
    h3.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h3.scheduler.settle('r1:sub:-:0', 'user_action', {});
    equal(h3.failures, [], 'suspended, and nothing has gone wrong yet');
    throws(
      () => h3.driver.resolve('r1:sub:-:0', 'done', { result: {}, actor: 'a-person' }),
      'UnresolvedReference',
      'resolve() RETHROWS, because the caller is on the stack — FD-R3, the one road it has',
    );
    equal(h3.failures.length, 1, 'and it REPORTS as well as rethrowing');
    equal(h3.failures[0]!.kind, 'UnresolvedReference', 'through OR-R10, under its own class');
  });

  test('a RESUMED node resolves to the RESOLUTION, and a suspended one is never reached', () => {
    // Section 3's *"the effective outcome, never the raw record"*: a node that
    // settled `user_action` and has not been resolved has NO effective outcome, so
    // it contributes no entry — which is what makes this refuse loudly rather than
    // compose a key holding `undefined`.
    const def = {
      flowId: 'reference-to-a-suspended-node', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'sub' }] },
        { id: 'sub', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', workerType: 'PublishWorker',
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
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'score' },
        { id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', workerType: 'PublishWorker',
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
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'items', branch: 'score' },
    { id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'refine' }] },
    // **Inside the same region as what it names**, which is the shape `FD-V28`'s
    // `many` must not answer from the target's membership alone.
    {
      id: 'refine', kind: 'task', workerType: 'MergeWorker',
      needs: { own: 'score' }, edges: [{ to: 'collect' }],
    },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'rank' }] },
    { id: 'rank', kind: 'map', over: 'all', branch: 'publish', needs: { all: ['refine'] } },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'gather' }] },
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
    equal(validateDefinition(WIDE, { predicates: [], workerTypes: reg.workerTypes }), [],
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
