/**
 * Ladder L2 — a **map** at run-time arity, routed from a fixture log of outcomes
 * with no scheduler. [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md)
 * under [P10](../../doc/plans/p10-is-fan-out-one-feature-or-two.md).
 *
 * `doc/workflow.md` section 4: *"if level 2 is hard to write, the driver has
 * reached for the scheduler somewhere it should not have"* — which W33's own file
 * calls this item's first review question of itself. The fake below is the same
 * twelve-line one `driver.test.ts` uses, unchanged, and nothing here needs a
 * worker, a thread or a timer. **A map's arity comes from a settled outcome, and a
 * fixture log carries settled outcomes**, so the new feature costs this rung
 * nothing.
 *
 * **Every expected value here is derived from `spec/` and not from a run:**
 *
 * | what | from |
 * |---|---|
 * | `r1:score:0:0`, `…:1:0`, `…:2:0` | `spec/task-id.md` section 1's four segments, with `branchPath` the run-time **item index** — [ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md) rule 5 |
 * | `r1:merge:1.0:0`, `r1:merge:1.1:0` | the same, composed: `perItem` sits in branch **1** of `outer`, and the dotted form is `spec/task-id.md` section 1's own reserved shape |
 * | the event stream | `spec/join-policy.md` section 2's vocabulary, and `JP-R5`'s two properties |
 * | `stuck` at N = 0 | `spec/run-state.md`'s `RN-R10` over a region entered with no branch opened |
 * | the three policies' verdicts | `spec/join-policy.md` section 3's three rows |
 */
import { deepEqual, equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver, InvalidDefinition, UnresolvedMapArity } from '../../src/driver/driver.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import { arrivalCount, liveToken, liveTokenRequiringArrival, POLICIES } from '../../src/fold/policies.ts';
import { fold, isTerminal } from '../../src/fold/run-state.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
/** What the node RECEIVED — the envelope's `input` (every task node is typed since v0.19, ADR 0054); `settings` is `{}` on a node that declares none. */
const inputOf = (t: unknown): unknown => (t as { payload?: { input?: unknown } } | undefined)?.payload?.input;
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

function harness(def: FlowDefinition, policy: JoinPolicy = liveToken as JoinPolicy) {
  const scheduler = new FakeScheduler();
  const events: RegionEvent[] = [];
  const failures: { kind: string; message: string }[] = [];
  const unsatisfiable: unknown[] = [];
  const driver = new Driver(def, {
    runId: 'r1',
    scheduler,
    createTask: (c) => c,
    predicates: new Map(),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
    joinPolicy: policy,
    onRegionEvent: (e) => events.push(e),
    onUnsatisfiableJoin: (i) => unsatisfiable.push(i),
    onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
  });
  return {
    scheduler, driver, events, failures, unsatisfiable,
    ids: () => scheduler.added.map((t) => t.id),
  };
}

type H = ReturnType<typeof harness>;

/**
 * Settle everything dispatched, in dispatch order, carrying `result`.
 *
 * **The guard is 40 and the loop asserts it did not hit it**, because a drain that
 * silently stops is a test that silently asserts nothing — `doc/workflow.md`
 * section 5 rule 3.
 */
function drain(h: H, result: unknown): void {
  const done = new Set<string>();
  for (let guard = 0; guard < 40; guard++) {
    const next = h.ids().find((id) => !done.has(id));
    if (next === undefined) return;
    done.add(next);
    h.scheduler.settle(next, 'done', { result });
  }
  ok(false, 'the drain loop did not terminate — the fixture changed shape');
}

const THREE = { items: ['a', 'b', 'c'], rows: ['x', 'y'] };

suite('L2 — a map dispatches one task per item, at an arity no document carries', (test) => {
  test('three items become three distinct task ids, indexed by ITEM', async () => {
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    equal(h.ids(), ['r1:ingest:-:0'], 'the entry task, and nothing else — a map dispatches nothing itself');

    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    equal(h.ids(), ['r1:ingest:-:0', 'r1:score:0:0', 'r1:score:1:0', 'r1:score:2:0'],
      'one dispatch per item of `over`, at `spec/task-id.md` section 1s four segments, with ' +
      'the third being the run-time ITEM INDEX (ADR 0036 rule 5)');
    equal(new Set(h.ids()).size, h.ids().length,
      'ID-R1 — every id distinct. Derived without an item index this is ONE id for three ' +
      'dispatches and the second is a DuplicateTaskId');
  });

  test('the arity is the RUN`s, not the document`s: 1, 3 and 7 from one definition', async () => {
    // **The list is bounded** -- rule 8 (d). Shortening it cost 0 failures, because
    // nothing counted what this loop ran over and the title carried the claim.
    // **Bounded by counting what the LOOP DID** -- W33's adequacy reader. The first
    // closure was `equal(arities, [1, 3, 7])`, which is the list compared to a copy
    // of itself in the same snippet and says nothing about how many entries the
    // `for` consumed: `for (const n of arities.slice(0, 1))` cost **0 failures**.
    const arities = [1, 3, 7];
    const ran: number[] = [];
    for (const n of arities) {
      ran.push(n);
      const h = harness(await load('valid/map-fanout.flow.json'));
      h.driver.start({});
      h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: Array.from({ length: n }, (_v, i) => i) } });
      const scored = h.ids().filter((id) => id.startsWith('r1:score:'));
      equal(scored, Array.from({ length: n }, (_v, i) => `r1:score:${i}:0`),
        `${n} items open ${n} branches — one definition, three arities, and FD-V9s floor of two ` +
        'never applies because a maps arity is not in the document');
    }
    equal(ran, arities, 'the LOOP ran every arity — counted from what it did, not from the list');
    equal(ran.length, 3, 'three arities from ONE definition is the claim in the title');
  });

  test('every branch.opened precedes every other event for the region — JP-R5', async () => {
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    drain(h, THREE);
    const forRegion = h.events.filter((e) => e.regionId === 'split');
    const lastOpened = forRegion.map((e) => e.type).lastIndexOf('branch.opened');
    const firstOther = forRegion.findIndex((e) => e.type !== 'branch.opened');
    ok(lastOpened < firstOther,
      'JP-R5s ordering clause. It is what makes `arrival-count`s `need` final before any ' +
      'arrival can be counted against it, and a map is the first thing to REST on it');
    equal(forRegion.map((e) => `${e.type} ${e.branchPath}`), [
      'branch.opened 0', 'branch.opened 1', 'branch.opened 2',
      'branch.arrived 0', 'branch.arrived 1', 'branch.arrived 2',
    ], 'spec/join-policy.md section 2s vocabulary, and nothing outside it');

    const terminal = forRegion.filter((e) => e.type !== 'branch.opened');
    equal(terminal.length, new Set(terminal.map((e) => e.branchPath)).size,
      'JP-R5 — at most one terminal event per branch');
  });

  test('the joins successor runs once, after the join, outside the region', async () => {
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    drain(h, THREE);
    equal(h.ids().filter((id) => id.startsWith('r1:publish')), ['r1:publish:-:0'],
      'the join routes out exactly once, and its successor is in no region so its path is `-`');
    const s = fold(h.driver.foldInputs());
    equal(s.outcome, 'completed', '');
    equal(s.regions['split']!.joined, true, 'RN-R11 — the driver routed out of the join');
    equal(s.regions['split']!.settled, { 0: 'arrived', 1: 'arrived', 2: 'arrived' },
      'RN-R6 — one entry per branch the region opened, keyed by the run-time path');
  });

  test('a map inside a fanout composes: the outer prefix and the item index', async () => {
    const h = harness(await load('valid/map-in-fanout.flow.json'));
    h.driver.start({});
    drain(h, THREE);
    equal(h.ids().filter((id) => id.startsWith('r1:merge')), ['r1:merge:1.0:0', 'r1:merge:1.1:0'],
      '`perItem` sits in branch 1 of `outer` and `rows` has two entries, so the paths are the ' +
      'DOTTED shape spec/task-id.md section 1 reserved — the outer segment derived from the ' +
      'graph and the inner one supplied by the run');
    const s = fold(h.driver.foldInputs());
    equal([s.regions['outer']!.joined, s.regions['perItem']!.joined], [true, true],
      'both joins fired: ADR 0030s transitivity, with one of the two regions now a map');
    equal(s.outcome, 'completed', '');
  });

  test('a FANOUT region is `entered` too — the one-mechanism claim, tested', async () => {
    // **Rule 8 found this deletable for 0.** `driver.ts` and `spec/join-policy.md`
    // section 4 both claim `regionEntered` is appended for EVERY region *"so the
    // invariant has ONE mechanism rather than one for a fanout and another for a
    // map"* -- and for a `fanout` it is redundant with `branch.opened`, so nothing
    // exercised it. A claim written from the mechanism instead of from the cases.
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start({});
    drain(h, THREE);
    const entered = h.driver.foldInputs().filter((i) => i.kind === 'regionEntered');
    equal(entered, [{ kind: 'regionEntered', regionId: 'split' }],
      'exactly one, for the one region, from the FANOUT arm -- not only from the map arm');

    // And it precedes every event for that region, because it is appended beside
    // `open` -- which is what makes it true at the moment section 4 says it is.
    const seq = h.driver.foldInputs();
    const at = seq.findIndex((i) => i.kind === 'regionEntered');
    const firstRegionEvent = seq.findIndex((i) => i.kind === 'region');
    ok(at < firstRegionEvent, 'appended beside `open`, before the first branch.opened');
  });

  test('a NESTED map`s region events carry the dotted path, not the bare index', async () => {
    // **Rule 8 found the emitted path unasserted.** `dispatch` derives the task id
    // independently via `pathOf`, so replacing the path handed to `emit` with a bare
    // `String(i)` left every id correct and only the EVENTS wrong -- and at depth 1
    // the two are the same string, so only a nested map discriminates.
    const h = harness(await load('valid/map-in-fanout.flow.json'));
    h.driver.start({});
    drain(h, THREE);
    equal(h.events.filter((e) => e.regionId === 'perItem').map((e) => `${e.type} ${e.branchPath}`), [
      'branch.opened 1.0', 'branch.opened 1.1',
      'branch.arrived 1.0', 'branch.arrived 1.1',
    ], 'the inner regions events carry `1.0` and `1.1` -- the outer segment derived from ' +
       'the graph and the inner one supplied by the run. A bare item index would read `0`/`1`');
    equal(h.events.filter((e) => e.regionId === 'outer').map((e) => `${e.type} ${e.branchPath}`), [
      'branch.opened 0', 'branch.opened 1',
      'branch.arrived 0', 'branch.arrived 1',
    ], 'and the outer regions are unchanged by a map nesting inside one of its branches');
  });

  test('JP-R11 — each instance receives its OWN ITEM, not the value the map node received', async () => {
    // **This test read *"each instance receives the map`s OWN payload — Q11/W34,
    // not decided here"* and asserted the opposite of what it now asserts.**
    // [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md) wrote it that way
    // deliberately, so that deciding [Q11](../../doc/open-questions.md) at the
    // fan-out edge would be a **visible edit rather than a silent one**. It is, and
    // this is it: [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
    // rule 3, `JP-R11`.
    //
    // **Derived from `spec/join-policy.md` section 4's `JP-R11`, not from a run**:
    // *a `map` instance receives its own item — `over`'s array at that instance's
    // index — as its own copy.* The fixture's `over` is `items` and `THREE` is
    // three items, so instance `i` receives `THREE.items[i]` and nothing else.
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    const scored = h.scheduler.added.filter((t) => t.id.startsWith('r1:score:'));
    equal(scored.length, 3, 'three instances, one per item — the arity is unchanged by JP-R11');
    for (const [i, t] of scored.entries()) {
      equal(inputOf(t), (THREE as { items: unknown[] }).items[i],
        `instance ${i} receives over[${i}] — its OWN item. What makes \`over\` mean something: ` +
        'handed the whole value, an instance can only find its item by an index nothing gives it');
      ok(!deepEqual(inputOf(t), THREE),
        `instance ${i} does NOT receive the value the map node received. Asserting only the ` +
        'first half would pass a driver handing every instance the whole value if that value ' +
        'happened to equal its first item');
    }
  });

  test('JP-R11 — no two instances share an object, at every arity INCLUDING a repeated item', async () => {
    // **The invariant, and the constructed case that makes *its own copy* rather
    // than *its own item* load-bearing.** Measured before the rule was written:
    // `structuredClone` preserves aliasing WITHIN one clone, so `{items: [x, x]}`
    // survives the edge hop as an array holding **one object twice**. Indexing
    // alone would therefore hand instances 0 and 1 the same object, and this
    // fixture is the only thing in the repository that can tell.
    // Counted from what the loop DID — rule 8 (d). Slicing this list to its first
    // entry cost **0**, because a three-item array of distinct objects has pairs to
    // compare and the title carried the claim that the other two shapes ran.
    const ranShapes: string[] = [];
    for (const [label, items] of [
      ['three distinct items', [{ n: 0 }, { n: 1 }, { n: 2 }]],
      ['the SAME object twice', (() => { const x = { shared: true }; return [x, x]; })()],
      ['a repeat among distinct items', (() => { const x = { s: 1 }; return [x, { o: 2 }, x]; })()],
    ] as const) {
      ranShapes.push(label);
      const h = harness(await load('valid/map-fanout.flow.json'));
      h.driver.start({});
      h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items } });
      const scored = h.scheduler.added.filter((t) => t.id.startsWith('r1:score:'));
      equal(scored.length, items.length, `${label}: one instance per item`);
      let pairs = 0;
      for (let i = 0; i < scored.length; i++) {
        for (let j = i + 1; j < scored.length; j++) {
          pairs++;
          ok(inputOf(scored[i]!) !== inputOf(scored[j]!),
            `${label}: instances ${i} and ${j} hold the SAME object. JP-R11's invariant is that ` +
            'no two nodes ever receive the same object, and a shared one means either mutates ' +
            "the other's input");
        }
      }
      // The bound, so a fixture that stopped dispatching could not pass by
      // iterating nothing — `doc/workflow.md` section 5 rule 8 (d).
      equal(pairs, (items.length * (items.length - 1)) / 2,
        `${label}: every PAIR is compared — n(n-1)/2 of them, which is the number of aliased ` +
        'pairs this arrangement had before JP-R11');
    }
    equal(ranShapes, ['three distinct items', 'the SAME object twice', 'a repeat among distinct items'],
      'all THREE shapes ran, and the second is the one that matters: an array holding one object ' +
      'twice is what `structuredClone` preserves across the edge hop, so it is the case that makes ' +
      '`its own COPY` load-bearing rather than `its own item`');
  });

  test('JP-R11 — a `fanout` branch gets its own copy of the same value', async () => {
    // The other half of `JP-R11`, and the half that is NOT a map: a `fanout` has
    // nothing to give a branch but the value it received, so what changes is only
    // that each gets its own. **Measured before the rule: `inputOf(a) === inputOf(b)`
    // was `true`**, and the payload IS cloned once at the edge hop — so the log was
    // protected and the siblings were not.
    const h = harness(await load('valid/fanout-join.flow.json'));
    const RESULT = { items: ['p', 'q'], note: 'the previous node output' };
    h.driver.start({ start: true });
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: RESULT });
    const a = h.scheduler.added.find((t) => t.id === 'r1:scoreA:0:0')!;
    const b = h.scheduler.added.find((t) => t.id === 'r1:scoreB:1:0')!;
    ok(a !== undefined && b !== undefined, 'both branches dispatched');
    equal(inputOf(a), RESULT, 'a fanout branch receives the value the fanout node received — ' +
      'UNCHANGED, which is the half JP-R11 does not move');
    equal(inputOf(b), RESULT, 'and so does the other one');
    ok(inputOf(a) !== inputOf(b),
      'and they are NOT the same object. Before JP-R11 this was `true` and a branch mutating ' +
      'what it was given mutated its sibling`s input (Q154)');

    // **The consequence asserted directly, because identity alone is a proxy for
    // it.** A reader can talk themselves into `===` being fine; a sibling seeing
    // the other's write is what Q154's row is actually about.
    (inputOf(a) as { items: string[] }).items.push('MUTATED-BY-A');
    equal((inputOf(b) as { items: string[] }).items, ['p', 'q'],
      'branch B`s input is untouched by branch A mutating its own');
    equal(RESULT.items, ['p', 'q'],
      'and so is the settled result object, which the edge-hop clone already protected — so ' +
      'this test tells the two clones apart rather than re-checking the one that existed');
  });

  test('JP-R11 — a fanout of arity THREE: every pair, not just the one a two-branch flow has', async () => {
    // **The adequacy reader's finding 3, and the fix is the shape the map half
    // already had.** The `fanout` half was asserted on `fanout-join.flow.json`,
    // which declares TWO branches — **one pair** — and compared `a` and `b` by
    // hand. Measured: `i === 0 ? cloneValue(payload) : payload` in the fanout arm
    // gives branch 0 its own copy and lets every other branch share one, and the
    // whole suite stayed **green at 564**. `six-events` declares three branches
    // and runs in all four matrix columns, so the arity-3 arm executes; nothing
    // checked it for sharing.
    //
    // **A two-branch fixture cannot see a defect that spares one branch.** The map
    // half got an n(n-1)/2 pair loop from the start; the fanout half got a
    // hard-coded `a`/`b` comparison, and this is that asymmetry closed.
    const def = JSON.parse(await readText(`${EX}/valid/fanout-join.flow.json`)) as FlowDefinition;
    // A third branch, added here rather than to the corpus: `spec/examples/**` is
    // W32's and the corpus's own arity-3 flow lives in `test/matrix/flows.ts`.
    const nodes = def.nodes as unknown as Record<string, unknown>[];
    const split = nodes.find((n) => n.id === 'split')!;
    split.branches = ['scoreA', 'scoreB', 'scoreC'];
    const scoreB = nodes.find((n) => n.id === 'scoreB')!;
    nodes.push({ ...scoreB, id: 'scoreC' });

    const h = harness(def);
    const RESULT = { shared: ['p'] };
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: RESULT });
    const branches = h.scheduler.added.filter((t) => t.id.startsWith('r1:score'));
    equal(branches.length, 3, 'three branches dispatched — the arity this test exists for');

    let pairs = 0;
    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        pairs++;
        ok(inputOf(branches[i]!) !== inputOf(branches[j]!),
          `branches ${i} and ${j} hold the SAME object. JP-R11's invariant is that no two nodes ` +
          'ever receive the same object, and a copy for the FIRST branch only satisfies a ' +
          'two-branch fixture while leaving every other pair sharing');
      }
    }
    equal(pairs, 3, 'all THREE pairs compared — n(n-1)/2 at arity 3. A loop that compared only ' +
      'the first pair would pass the two-branch fixture this test replaces');
  });

  test('JP-R11 at N = 1 — the arity a `fanout` can never reach, and the one with no pair', async () => {
    // **The adequacy reader's finding 2, and the conformity reader's finding 5,
    // reached from opposite ends** — one mutated the driver, one read `JP-R11`'s
    // own Test column against the tests. Measured: an arm reading
    // `items.length === 1 ? cloneValue(payload) : cloneValue(items[i])` left the
    // whole suite **green at 564**.
    //
    // **N = 1 is where the pairwise check iterates ZERO pairs**, so the shape test
    // above cannot see it, and it is the ordinary run-time case — `FD-V9`'s floor
    // is what makes it unreachable for a `fanout`, which is precisely why a map
    // needs covering there. At N = 1 the whole value and the item differ by one
    // array wrapper and nothing else, which is what makes the mistake easy.
    const h = harness(await load('valid/map-fanout.flow.json'));
    const ITEM = { only: 'one' };
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: [ITEM] } });
    const scored = h.scheduler.added.filter((t) => t.id.startsWith('r1:score:'));
    equal(scored.length, 1, 'one item, one instance');
    equal(inputOf(scored[0]!), ITEM, 'the instance receives `over[0]` — its own item');
    ok(!deepEqual(inputOf(scored[0]!), { items: [ITEM] }),
      'and NOT the value the map node received, which at N = 1 differs by one array wrapper');
  });

  test('JP-R11 at N = 7, and the aliased-pair count the shipped behaviour had', async () => {
    // `JP-R11`'s Test column names this arity, and it is where the pair count is
    // large enough to be a claim rather than a coincidence: **21 pairs**, every one
    // of which was `true` before this rule.
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done',
      { result: { items: Array.from({ length: 7 }, (_v, i) => ({ n: i })) } });
    const scored = h.scheduler.added.filter((t) => t.id.startsWith('r1:score:'));
    equal(scored.length, 7, 'seven items, seven instances');
    let pairs = 0;
    for (let i = 0; i < 7; i++) {
      for (let j = i + 1; j < 7; j++) {
        pairs++;
        ok(inputOf(scored[i]!) !== inputOf(scored[j]!), `instances ${i} and ${j} do not share`);
      }
    }
    equal(pairs, 21, 'twenty-one pairs — n(n-1)/2 at N = 7, and the number that were ALIASED ' +
      'before JP-R11. Counted from what the loop did');
    for (const [i, t] of scored.entries()) {
      equal(inputOf(t), { n: i }, `instance ${i} receives over[${i}]`);
    }
  });

  test('JP-R12 — a branch that arrived carrying `null` has a KEY, and is not dropped', async () => {
    // **The adequacy reader's finding 1, and its sharpest.** `collectArrivals` could
    // be given `if (v === null) continue` and the whole suite stayed **green at
    // 564** — because every arriving branch in every firing matrix cell and every
    // map test carried a non-null result. The distinction the item argues hardest
    // for — **present with `null`** versus **absent** — had **zero live cases**, in
    // a test file whose own comments say `1: null` would be a lie.
    //
    // The reader's second route confirms the clause is reachable: a `throw` in place
    // of that `continue` fails **six** existing tests, so null-valued arrivals do
    // occur — they were simply never asserted about at the join.
    //
    // A `task` settling `done` with no `result` produces `result: null`
    // (`spec/outcome-record.md` section 2), so a branch can arrive carrying `null`
    // without anything unusual happening.
    // **BOTH falsy shapes, because they arise differently and a naive collector
    // drops both.** `result: null` is what `spec/outcome-record.md` section 2
    // writes for any non-`done` settlement and what a worker returning `null`
    // produces; a `done` settlement with **no `result` key at all** gives
    // `structuredClone(undefined)`, which is `undefined`. A `filter(Boolean)`, an
    // `if (!v) continue` or a `JSON.stringify` round-trip loses both.
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b', 'c'] } });
    h.scheduler.settle('r1:score:0:0', 'done', { result: null }); // an explicit null
    h.scheduler.settle('r1:score:1:0', 'done'); //                    no result key at all
    h.scheduler.settle('r1:score:2:0', 'done', { result: { at: 2 } });
    const publish = h.scheduler.added.find((t) => t.id === 'r1:publish:-:0');
    ok(publish !== undefined, 'the join fired');
    const payload = inputOf(publish!) as Record<string, unknown>;
    equal(Object.keys(payload), ['0', '1', '2'],
      'ALL THREE branches arrived, so all three have keys — including the two that carried ' +
      'nothing. A collector that skipped falsy values, or built the object with a ' +
      '`filter(Boolean)`, would give `["2"]` here, and a consumer counting keys would count one ' +
      'result where three arrived');
    equal(payload['0'], null, 'key 0 carries the explicit `null` its branch settled with');
    equal(payload['1'], undefined,
      'and key 1 carries `undefined`, which is what a `done` settlement with no `result` produces ' +
      '(`structuredClone(undefined)`). It is a structured-cloneable value, so the record is ' +
      'conformant and the join must carry it');
    ok('0' in payload && '1' in payload,
      'stated separately from the equalities deliberately: reading an ABSENT key also gives ' +
      '`undefined`, so `in` is what tells present-carrying-nothing from absent, and the ' +
      'equalities alone would not');
  });
});

suite('L2 — JP-R12: a map`s join carries its N results, and that is P10`s point', (test) => {
  test('three items in, three results out, keyed by ITEM INDEX', async () => {
    // **This is the sentence [P10](../../doc/plans/p10-is-fan-out-one-feature-or-two.md)
    // exists for**: *a map that runs N tasks and hands its successor `null` has
    // computed N results and thrown all of them away.* Until
    // [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
    // that was exactly what happened, and `map.test.ts` asserted it as deliberate.
    //
    // **Every expected value is derived from `spec/join-policy.md`'s `JP-R12` and
    // from the settlements written below, not from a run:** one entry per branch
    // that emitted `branch.arrived`, keyed by its `branchPath` — which for a map is
    // the run-time item index (ADR 0036 rule 4) — valued by what that branch
    // carried into the join, which is the settling node's `result`
    // (`spec/flow-definition.md` section 3).
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b', 'c'] } });
    // Distinct results, so a collection that dropped one, keyed one wrong or
    // overwrote one is caught. Identical results would make all three
    // indistinguishable and the assertion below vacuous.
    h.scheduler.settle('r1:score:0:0', 'done', { result: { scored: 'a', at: 0 } });
    h.scheduler.settle('r1:score:1:0', 'done', { result: { scored: 'b', at: 1 } });
    h.scheduler.settle('r1:score:2:0', 'done', { result: { scored: 'c', at: 2 } });

    const publish = h.scheduler.added.find((t) => t.id === 'r1:publish:-:0');
    ok(publish !== undefined, 'the join fired and dispatched its successor');
    equal(inputOf(publish!), {
      '0': { scored: 'a', at: 0 },
      '1': { scored: 'b', at: 1 },
      '2': { scored: 'c', at: 2 },
    }, 'JP-R12 — every item`s result reaches the join`s successor, keyed by the item index. ' +
       'This was `null` until ADR 0037, so a map`s whole deliverable was discarded');
    equal(Object.keys(inputOf(publish!) as object), ['0', '1', '2'],
      'and the keys are the three item indices in ascending order');
  });

  test('the collection is the SAME whatever order the items settle in', async () => {
    // `doc/concept.md` section 5 and `CLAUDE.md`: fan-out completion order is
    // genuinely non-deterministic and nothing may depend on it. **This is the
    // property the `null` was protecting**, so it is asserted directly rather than
    // argued: settle the three instances in each of the six permutations and
    // compare the collections as STRINGS, which catches a key-order difference
    // that a deep compare would not.
    const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    // **Two projections of each run, and they pull in opposite directions** — which
    // is what stops a constant satisfying this test. The author's first version
    // pushed one string and asserted the set had ONE member, and replacing that
    // push with a hard-coded literal cost **0 failures**: every assertion was
    // satisfied by the constant, and the test proved the harness could repeat
    // itself rather than that the driver was order-independent. **The same trap the
    // `null` test had**, quoted three tests above and then walked into.
    const keyOrders: string[] = [];   // must be IDENTICAL across the six runs
    const collections: string[] = []; // must be DISTINCT — a per-run marker no constant carries
    for (const order of perms) {
      const h = harness(await load('valid/map-fanout.flow.json'));
      h.driver.start({});
      h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b', 'c'] } });
      for (const i of order) {
        // `perm` is this run's own settlement order, so the VALUES differ run to
        // run while the KEY ORDER must not. One projection asserts sameness and
        // the other asserts difference, and no single constant can do both.
        h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { at: i, perm: order.join('') } });
      }
      const publish = h.scheduler.added.find((t) => t.id === 'r1:publish:-:0');
      ok(publish !== undefined, `settlement order ${order.join('')}: the join fired`);
      keyOrders.push(Object.keys(inputOf(publish!) as object).join(','));
      collections.push(JSON.stringify(inputOf(publish!)));
    }
    equal(keyOrders.length, 6, 'all six permutations ran — counted from what the loop DID, not from ' +
      'the list it was given (rule 8 (d), and W33`s adequacy reader`s finding)');
    equal(new Set(keyOrders).size, 1,
      'ONE key order across all six settlement orders. A join carrying "whichever branch finished ' +
      'last" would give six different answers here, which is the flaky RESULT ' +
      '`spec/join-policy.md` section 4 refuses');
    equal(keyOrders[0], '0,1,2',
      'and it is the order JP-R12 declares — ascending branch path, not arrival order');
    equal(new Set(collections).size, 6,
      'and the six runs produced six DIFFERENT payloads, because each carries its own settlement ' +
      'order in `perm`. **This is the assertion a constant cannot satisfy**: without it, replacing ' +
      'the recorded payload with a literal passes everything above');
    equal(JSON.parse(collections[0]!), { '0': { at: 0, perm: '012' }, '1': { at: 1, perm: '012' }, '2': { at: 2, perm: '012' } },
      'and the first run`s collection is what JP-R12 declares, values and all');
  });

  test('a map branch routed away has no key, and a map of zero carries `{}` to nothing', async () => {
    // The two `JP-R12` clauses that are about ABSENCE, at a run-time arity. The
    // second is the one no static flow can reach at all (`FD-V9`'s floor).
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    h.scheduler.settle('r1:score:0:0', 'done', { result: { at: 0 } });
    // No `on: ["failed"]` edge on `score`, so a failure ends the path inside the
    // region — `branch.lost`, and `JP-R12` gives a lost branch no key.
    h.scheduler.settle('r1:score:1:0', 'failed');
    const publish = h.scheduler.added.find((t) => t.id === 'r1:publish:-:0');
    ok(publish !== undefined, 'live-token fires: the region has no live branches, having had two');
    equal(inputOf(publish!), { '0': { at: 0 } },
      'item 1 never arrived, so it has NO key. `1: null` would say it arrived carrying nothing, ' +
      'and a consumer counting keys would count a result that does not exist');

    const zero = harness(await load('valid/map-fanout.flow.json'));
    zero.driver.start({});
    zero.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: [] } });
    equal(zero.ids(), ['r1:ingest:-:0'],
      'a map of zero opens nothing and the join never fires, so JP-R12 has nothing to carry and ' +
      'no successor to carry it to — `spec/join-policy.md` section 5`s N = 0 ruling is unchanged ' +
      'by ADR 0037');
  });
});

suite('L2 — JP-R12: the KEY ORDER, on the only shape that can discriminate it', (test) => {
  /**
   * **The constructed case, and rule 8's *does the guard ever fire* is why it
   * exists.** `collectArrivals` sorts with `compareBranchPaths`, and the author's
   * first set could delete that sort, replace it with a lexicographic one, and
   * invert its missing-segment rule — **all three for zero failures**. Measured,
   * not assumed, and the reason is worth stating because it is the same reason
   * three times:
   *
   * | | why nothing noticed |
   * |---|---|
   * | every depth-1 row | its keys are `"0"`, `"1"`, `"2"` — **integer-like**, which the LANGUAGE re-orders ascending whatever the insertion order. A depth-1 join is deterministic for free and no assertion over one can fail |
   * | the four depth-2 matrix rows | their inner keys are `1.0` and `1.1`, and `scoreC` settles before `scoreD` in every one of them — so insertion order **already equals** sorted order |
   * | the L2 permutation test | it permutes a top-level map, whose keys are integer-like again |
   *
   * So the discriminating shape needs **dotted keys** AND **a settlement order
   * that is not the sorted one** AND **a two-digit index**, and
   * `map-in-fanout.flow.json` is the one corpus flow that can carry all three:
   * `perItem` sits in branch `1` of `outer`, so its instances are `1.0 … 1.N-1`.
   */
  test('twelve items, settled DESCENDING, come out in segment-wise numeric order', async () => {
    const h = harness(await load('valid/map-in-fanout.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: { from: 'scoreA' } });
    // TWELVE, so that `10` and `11` exist: they are what tells a segment-wise
    // numeric order from a lexicographic one, which sorts `1.10` before `1.2`.
    const rows = Array.from({ length: 12 }, (_v, i) => `row-${i}`);
    h.scheduler.settle('r1:extract:1:0', 'done', { result: { rows } });

    const merges = h.ids().filter((id) => id.startsWith('r1:merge:'));
    equal(merges.length, 12, 'twelve instances, at branch paths 1.0 through 1.11');

    // **Settled in DESCENDING index order**, so insertion order is the reverse of
    // the answer. Nothing in `spec/` fixes settlement order — this is choosing an
    // input that makes a property observable, not depending on an order
    // (`doc/workflow.md` section 5 rule 5, and W17's own note on the same move).
    let settled = 0;
    for (let i = 11; i >= 0; i--) {
      h.scheduler.settle(`r1:merge:1.${i}:0`, 'done', { result: { at: i } });
      settled++;
    }
    equal(settled, 12, 'all twelve settled — counted from what the loop DID');

    // **The inner join fired, asserted on what it actually dispatched.** This read
    // `find(t => t.id.startsWith('r1:collect') || t.id === 'r1:publish:-:0')` with
    // the message *"the inner join fired and dispatched onward"* — and the first
    // disjunct can NEVER match, because `collect` and `gather` are `join` nodes and
    // `spec/flow-definition.md` section 2 says only a `task` is ever dispatched. So
    // the assertion was satisfied by the OUTER join's successor and duplicated the
    // `publish` check two lines below. W34's conformity reader. The inner join's own
    // observable effect is that `outer`'s branch 1 has a value at all, which is what
    // the outer payload below carries.
    const publish = h.scheduler.added.find((t) => t.id === 'r1:publish:-:0');
    ok(publish !== undefined, 'the outer join fired, which it can only do once branch 1 arrived — ' +
      'and branch 1 arrives when the INNER join routes out of itself');
    const outer = inputOf(publish!) as Record<string, unknown>;
    const inner = outer['1'] as Record<string, unknown>;
    ok(inner !== undefined && typeof inner === 'object',
      'branch 1 of `outer` carries the inner region`s collection');

    const expected = Array.from({ length: 12 }, (_v, i) => `1.${i}`);
    equal(Object.keys(inner), expected,
      'JP-R12 — ascending segment-wise NUMERIC order. Three answers are ' +
      'distinguishable here and only one is right: unsorted gives 1.11 … 1.0 ' +
      '(settlement order), lexicographic gives 1.0, 1.1, 1.10, 1.11, 1.2 …, and ' +
      'segment-wise numeric gives 1.0 … 1.11. Dotted keys are NOT re-ordered by the ' +
      'language, which is the whole reason this shape is the only one that can tell');

    // And the values follow the keys, so a sort that reordered the keys without
    // their values would be caught too.
    for (let i = 0; i < 12; i++) {
      equal(inner[`1.${i}`], { at: i },
        `key 1.${i} carries item ${i}'s own result — the sort moves keys AND values ` +
        'together, or it is a different defect wearing the same shape');
    }
  });

  test('the comparator`s missing-segment rule is UNREACHABLE, and that is measured', () => {
    // **Rule 8's *where the corpus cannot express a case, RECORD that rather than
    // arguing it*.** `compareBranchPaths` treats a missing segment as sorting
    // first, so `1` precedes `1.0`. Inverting that costs **0 failures**, and the
    // reason is structural rather than a gap in the corpus: **every key of one
    // region's collection is `pathOf(branch)` for a branch of THAT region**, so
    // they all have the same segment count. `1` and `1.0` are keys of two
    // DIFFERENT regions' collections — the outer's and the inner's — and no
    // `arrivals` map ever holds both.
    //
    // **It is kept rather than deleted** because a comparator handed to
    // `Array.prototype.sort` must be total over whatever pairs the sort chooses,
    // and a partial one is a defect waiting for the first change that makes
    // ragged paths reachable. Asserted directly here, since no run can reach it:
    const cmp = (a: string, b: string) => {
      const xs = a.split('.');
      const ys = b.split('.');
      for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
        const d = (xs[i] === undefined ? -1 : Number(xs[i])) - (ys[i] === undefined ? -1 : Number(ys[i]));
        if (d !== 0) return d;
      }
      return 0;
    };
    ok(cmp('1', '1.0') < 0, 'a shorter path sorts before a longer one sharing its prefix');
    ok(cmp('1.0', '1') > 0, 'and the relation is antisymmetric, which `sort` requires');
    equal(['1.10', '1.2', '1', '1.0'].sort(cmp), ['1', '1.0', '1.2', '1.10'],
      'the whole ordering, including the pair no region can produce. **This is a ' +
      'copy of the driver`s expression rather than the expression itself**, which ' +
      'is a weaker test than the one above and is labelled as such: it says the ' +
      'RULE is right, not that the driver implements it');
  });
});

suite('L2 — arrival-count at a run-time arity does not fire EARLY', (test) => {
  test('the join waits for all three arrivals, not for one', async () => {
    // **The regression the re-sourcing exists for.** With `need` read from
    // `region.branches.length` this fired after the FIRST arrival — measured, with
    // two branches still live — and routed `publish` over a region that had not
    // finished. Every failure W4 recorded was `need` too LARGE, which hangs; this
    // was `need` too small, which completes the run wrong.
    const h = harness(await load('valid/map-fanout.flow.json'), arrivalCount as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });

    h.scheduler.settle('r1:score:0:0', 'done', { result: {} });
    equal(h.ids().filter((id) => id.startsWith('r1:publish')), [],
      'ONE of three arrived and two are still live, so the join has not fired');
    equal(h.driver.joinStatusOf('split'), { status: 'waiting', describe: { need: 3, arrived: ['0'] } },
      '`need` is THREE — counted from the three branch.opened events. Read off ' +
      '`region.branches.length` it is 1, because a map declares one branch entry whatever it opens');

    h.scheduler.settle('r1:score:1:0', 'done', { result: {} });
    equal(h.ids().filter((id) => id.startsWith('r1:publish')), [], 'nor on the second');

    h.scheduler.settle('r1:score:2:0', 'done', { result: {} });
    equal(h.ids().filter((id) => id.startsWith('r1:publish')), ['r1:publish:-:0'],
      'and on the third it fires, with nothing left live');
  });

  test('all three policies agree on a map where every branch arrives', async () => {
    // Bounded by what the loop DID (the reader cut it to one for 0), and the policy
    // is read from the loop variable -- swapping the source to a literal `liveToken`
    // also cost 0, so the `${id}` in the message was the only thing that varied.
    const ran: string[] = [];
    for (const [id, p] of Object.entries(POLICIES)) {
      const h = harness(await load('valid/map-fanout.flow.json'), p as JoinPolicy);
      h.driver.start({});
      drain(h, THREE);
      const s = fold(h.driver.foldInputs());
      equal([id, s.outcome, s.regions['split']!.joined], [id, 'completed', true],
        `${id} — a map whose branches all arrive is the all-arrived row at a run-time arity, ` +
        'and section 3s three rows all say satisfied for it');
      // Policy-DEPENDENT, so the loop cannot be run three times on one policy: each
      // policy's `describe` is its own shape (section 3's three rows).
      equal(h.driver.joinStatusOf('split')!.describe, {
        'arrival-count': { need: 3, arrived: ['0', '1', '2'] },
        'live-token': { live: 0, positive: true },
        'live-token-requiring-arrival': { live: 0, positive: true, arrived: 3 },
      }[id], `${id} — JP-R2, and it is what makes this loop discriminate its own policy`);
      ran.push(id);
    }
    equal(ran, Object.keys(POLICIES), 'the loop ran every shipped policy');
  });

  test('P1`s case at a run-time arity: a branch routed away from a map`s join', () => {
    // Q4s own case, and a map makes it new: the branch routed away is one NOTHING
    // DECLARED. `spec/join-policy.md` section 3 fixes what each policy answers, and
    // the answers here are the depth-1 answers of the same shape.
    const def = {
      flowId: 'map-routed-away', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'score' },
        { id: 'score', kind: 'task', type: 'ScoreWorker', optional: true,
          edges: [{ on: ['failed'], to: 'abandoned' }, { to: 'collect' }] },
        { id: 'abandoned', kind: 'end', outcome: 'abandoned' },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;

    // Bounded: `.slice(0, 1)` cost 0 and dropped the `stuck` row -- the ONLY place
    // in this suite where a policy answers differently from `live-token`, and the
    // whole of what ADR 0003's recorded cost looks like at a run-time arity.
    const rows = [
      ['live-token', liveToken, 'completed'],
      ['arrival-count', arrivalCount, 'stuck'],
    ] as [string, JoinPolicy, string][];
    const ran: string[] = [];
    for (const [id, p, expected] of rows) {
      const h = harness(def, p);
      h.driver.start({});
      h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b', 'c'] } });
      // branch 1 routes away to an `end`; the other two arrive.
      h.scheduler.settle('r1:score:0:0', 'done', { result: {} });
      h.scheduler.settle('r1:score:1:0', 'failed', {});
      h.scheduler.settle('r1:score:2:0', 'done', { result: {} });
      const rest = h.ids().find((i) => i.startsWith('r1:publish'));
      if (rest) h.scheduler.settle(rest, 'done', { result: {} });
      const s = fold(h.driver.foldInputs());
      equal(s.regions['split']!.settled, { 0: 'arrived', 1: 'exited', 2: 'arrived' },
        `${id} — RN-R6: two arrived and one reached an end node, whichever policy is running`);
      equal(s.outcome, expected,
        `${id} — P1s case at an arity nothing declared. live-token decrements on exited and ` +
        'proceeds; arrival-count needs three arrivals, gets two, and waits forever (ADR 0003s ' +
        'recorded cost, at a run-time arity)');
      ran.push(id);
    }
    equal(ran, ['live-token', 'arrival-count'],
      'BOTH rows ran — and they carry different expected outcomes, so dropping either drops ' +
      'the only place these two policies disagree about a map');
  });

  test('a suspended mapped branch keeps the join waiting, and does not lose it', async () => {
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: THREE });
    h.scheduler.settle('r1:score:0:0', 'done', { result: {} });
    h.scheduler.settle('r1:score:1:0', 'user_action', {});
    h.scheduler.settle('r1:score:2:0', 'done', { result: {} });
    equal(h.events.filter((e) => e.type === 'branch.suspended').map((e) => e.branchPath), ['1'],
      'spec/join-policy.md section 2 — a user_action branch is SUSPENDED, not lost, at its item index');
    equal(h.ids().filter((id) => id.startsWith('r1:publish')), [],
      'and the join keeps waiting: a run waiting on a person is not stuck (ADR 0004, Q7)');
    equal(fold(h.driver.foldInputs()).outcome, 'awaiting_action',
      'RN-R7 — the thing a reader must know is that a human is needed');
  });
});

suite('L2 — a map of ZERO items', (test) => {
  test('it opens nothing, dispatches nothing, and the run is STUCK — not completed', async () => {
    // **The one place a map is not the static feature at a different arity.**
    // `FD-V9`s floor means a `fanout` can never produce it; a map produces it the
    // first time a filter returns nothing.
    //
    // Measured before the `regionEntered` input existed: the region emitted no
    // event, so the folds `regions` was `{}`, `RN-R10` iterated NOTHING, and the run
    // reported **`completed`** having reached no `end` node — through
    // `withOutcome`s final fall-back rather than by any positive determination.
    // **This loop was policy-INDEPENDENT and its guard closed nothing** -- W33's
    // adequacy reader. Every assertion in it (`ids`, `events`, `regions`, `outcome`)
    // is unreachable by a policy at N=0, because the map arm makes no `settleJoin`
    // call and emits no event -- so running `live-token` three times cost 0 while
    // the message still interpolated `${id}`. The `joinStatusOf` assertion below is
    // what makes each iteration its own policy's, and `ran` bounds the loop rather
    // than the list.
    const all = Object.entries(POLICIES);
    const ran: string[] = [];
    for (const [id, p] of all) {
      const h = harness(await load('valid/map-fanout.flow.json'), p as JoinPolicy);
      h.driver.start({});
      h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: [] } });

      equal(h.ids(), ['r1:ingest:-:0'], `${id} — nothing is dispatched`);
      equal(h.events, [], `${id} — and no branch event exists to describe, because no branch opened`);
      const s = fold(h.driver.foldInputs());
      ok(s.regions['split'] !== undefined,
        `${id} — the region is PRESENT: spec/run-state.mds shape says "one entry per fan-out ` +
        'region ENTERED", and it was entered');
      equal([s.regions['split']!.opened, s.regions['split']!.joined], [[], null],
        `${id} — entered, nothing opened, and the join neither fired nor was declared dead`);
      equal(s.outcome, 'stuck',
        `${id} — RN-R10. The join can never fire, which is ADR 0015s own definition, and all ` +
        'three policies answer `waiting` because none can tell "not opened yet" from "opened zero"');
      equal(h.driver.joinStatusOf('split'), {
        'arrival-count': { status: 'waiting', describe: { need: 0, arrived: [] } },
        'live-token': { status: 'waiting', describe: { live: 0, positive: false } },
        'live-token-requiring-arrival':
          { status: 'waiting', describe: { live: 0, positive: false, arrived: 0 } },
      }[id], `${id} — the verdict is waiting in all three and each says so in its OWN state`);
      ran.push(id);
    }
    equal(ran, Object.keys(POLICIES), 'the loop ran all three — counted from what it did');
  });

  test('no policy says `unsatisfiable`, and that is Q97 rather than a gap here', async () => {
    const h = harness(await load('valid/map-fanout.flow.json'), liveTokenRequiringArrival as JoinPolicy);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: [] } });
    equal(h.unsatisfiable, [],
      'even the one policy that CAN say unsatisfiable does not: its `positive` is false, so it ' +
      'reads exactly as a region that has not opened yet. The run is reported stuck by the FOLD ' +
      'and its REASON is not reported, which is Q97 — open since P5 with ADR 0026 held for it');
    equal(h.driver.joinStatusOf('split'),
      { status: 'waiting', describe: { live: 0, positive: false, arrived: 0 } },
      'and the drivers accessor agrees, so nothing here is silently disagreeing with the fold');
  });

  test('the region a map never REACHED is still absent — entered is not declared', async () => {
    // The discriminating case for `regionEntered`: it must not make every region in
    // the definition appear. A run stopped before the map is reached has no entry,
    // which is what keeps "entered" a fact about the RUN.
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    const s = fold(h.driver.foldInputs());
    equal(s.regions, {},
      'the entry task is dispatched and nothing has settled, so the map has not been entered');
  });
});

suite('L2 — `over` must name an array, and that is a RUN-TIME refusal', (test) => {
  const shapes: [string, unknown][] = [
    ['a key that is absent', { rows: ['x'] }],
    ['a key holding an object', { items: { a: 1 } }],
    ['a key holding a number', { items: 3 }],
    ['a null payload', null],
    ['a string payload', 'hello'],
  ];

  // **The five shapes run inside ONE test, and it records what it exercised** --
  // rule 8 (d). They were five separate `test()` cases over a shared list, and
  // slicing the LOOP cost 0 failures: four cases vanished and nothing counted
  // cases. Asserting `shapes.length` guarded the list while the probe cut the loop
  // -- a bound aimed at a different thing from the hole.
  test('every non-array shape stops the run and NAMES the map', async () => {
    const exercised: string[] = [];
    for (const [label, result] of shapes) {
      const h = harness(await load('valid/map-fanout.flow.json'));
      h.driver.start({});
      h.scheduler.settle('r1:ingest:-:0', 'done', { result });

      equal(h.failures.length, 1, `${label}: exactly one refusal — a second would be a re-report`);
      equal(h.failures[0]!.kind, 'UnresolvedMapArity',
        `${label}: RunFailure.kind is the class name (AGENTS.md section 9). NOT ` +
        'InvalidDefinition: the definition is valid and the DATA is wrong, which is a ' +
        'different persons bug');
      ok(h.failures[0]!.message.includes('"split"'), `${label}: it names the NODE`);
      ok(h.failures[0]!.message.includes('"items"'),
        `${label}: and the \`over\` key, so a reader knows what to look at`);
      equal(fold(h.driver.foldInputs()).outcome, 'stopped',
        `${label}: RN-R8 — reported through OR-R10 rather than thrown, because \`enter\` is ` +
        'reached from a listener');
      equal(h.ids(), ['r1:ingest:-:0'],
        `${label}: and nothing was dispatched into a region whose size is unknown`);
      exercised.push(label);
    }
    equal(exercised, shapes.map(([l]) => l),
      'the LOOP ran over every shape — counted from what it did, not from the list it was given');
    equal(exercised.length, 5,
      'absent key, an object, a number, a null payload and a string payload');
  });

  test('an EMPTY array is NOT this — it is a lawful map of zero items', async () => {
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: [] } });
    equal(h.failures, [], 'zero items is an arity, not a missing arity');
    equal(fold(h.driver.foldInputs()).outcome, 'stuck', 'and it takes the N=0 road above, not this one');
  });

  test('the message names THIS map and THIS key, not a constant that happens to match', async () => {
    // **Both halves were satisfiable by a hard-coded string** -- W33's adequacy
    // reader. Every `shapes` entry loads `map-fanout.flow.json`, whose map node IS
    // `split` and whose `over` IS `"items"`, so replacing `${node.id}` with the
    // literal `"split"` and `${node.over}` with `"items"` cost **0 failures**.
    //
    // **The discriminating fixture already existed and the suite never touched it**:
    // `map-in-fanout.flow.json` declares `{ id: "perItem", over: "rows" }`. Rule 8
    // (c) -- the source expression is what is bound here, not the value.
    const h = harness(await load('valid/map-in-fanout.flow.json'));
    h.driver.start({});
    // `extract` feeds the INNER map; give it a payload with no `rows` array.
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    h.scheduler.settle('r1:extract:1:0', 'done', { result: { items: ['a'] } });

    equal(h.failures.length, 1, 'one refusal, from the INNER map');
    equal(h.failures[0]!.kind, 'UnresolvedMapArity', '');
    ok(h.failures[0]!.message.includes('"perItem"'),
      'it names THIS map — a message hard-coded to `split` passes every other case in this file');
    ok(h.failures[0]!.message.includes('"rows"'),
      'and THIS key — hard-coded to `items` it would pass every other case too');
    ok(!h.failures[0]!.message.includes('"split"'), 'and it names no other node');
  });

  test('a map at the ENTRY node over an EMPTY list is STUCK, not running', () => {
    // **W33's adequacy reader, and it was a real defect.** `withOutcome`'s
    // nothing-has-happened-yet clause returned `running` before `RN-R10` could see a
    // region that was entered and can never join — because nothing was ever
    // dispatched, so `nodes` was empty. `RN-R12` then says the run is NOT finished,
    // so a clock-free L6 harness waits on it forever.
    //
    // `map-fanout`'s N=0 case passed only because its `ingest` task put a node in
    // `nodes` first, which is why every other N=0 assertion missed it.
    const def = {
      flowId: 'map-at-entry', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'map', over: 'items', branch: 'score' },
        { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;

    const ran: string[] = [];
    for (const [id, p] of Object.entries(POLICIES)) {
      const h = harness(def, p as JoinPolicy);
      h.driver.start({ items: [] });
      equal(h.ids(), [], `${id} — nothing is dispatched, so nodes is empty`);
      const s = fold(h.driver.foldInputs());
      equal(s.outcome, 'stuck',
        `${id} — RN-R10, and it must outrank the nothing-yet clause: nothing will ever arrive`);
      ok(isTerminal(s), `${id} — RN-R12: the run IS finished, so a harness stops waiting on it`);
      ran.push(id);
    }
    equal(ran, Object.keys(POLICIES), 'all three, counted from what the loop did');

    // The control the fix must not break: the SAME flow with items still runs.
    const live = harness(def);
    live.driver.start({ items: ['a', 'b'] });
    equal(live.ids(), ['r1:score:0:0', 'r1:score:1:0'], 'a map at entry with items is unchanged');
  });

  test('a NESTED map at N=0 ends the branch it sits in — JP-R10 without a policy verdict', async () => {
    // **W33's adequacy reader.** Branch `1` of `outer` was opened and received **no
    // terminal event at all**, in a run neither suspended nor in flight — a state
    // `JP-R5`'s enumeration does not admit. `JP-R10` exists for this shape and could
    // not fire, because it is triggered by a policy answering `unsatisfiable` and no
    // policy can say that at N = 0.
    const ran: string[] = [];
    for (const [id, p] of Object.entries(POLICIES)) {
      const h = harness(await load('valid/map-in-fanout.flow.json'), p as JoinPolicy);
      h.driver.start({});
      drain(h, { items: ['a'], rows: [] });
      const outer = h.events.filter((e) => e.regionId === 'outer')
        .map((e) => `${e.type.replace('branch.', '')} ${e.branchPath}`);
      equal(outer, ['opened 0', 'opened 1', 'arrived 0', 'lost 1'],
        `${id} — the branch holding the empty map is LOST, which is what JP-R10 says a join ` +
        'that can never fire does to the branch it sits in');
      const s = fold(h.driver.foldInputs());
      const opened = s.regions['outer']!.opened;
      equal(opened.filter((b) => !(b in s.regions['outer']!.settled)), [],
        `${id} — JP-R5: every branch opened has exactly one terminal event`);
      equal(s.regions['perItem']!.joined, null,
        `${id} — and the empty region is NOT reported dead: RN-R11 gives false the meaning ` +
        '"a policy said unsatisfiable", and none did. Q97 is where the reason lives');
      equal(s.outcome, 'stuck', `${id} — the inner join never fired, so RN-R10 holds`);
      ran.push(id);
    }
    equal(ran, Object.keys(POLICIES), 'all three, counted from what the loop did');
  });

  test('branch.lost and branch.resumed occur at a map ITEM INDEX', async () => {
    // **Correct but untested** — W33's adequacy reader. `Outputs` row 3 claims the
    // event stream is asserted against section 2's vocabulary, and four of the six
    // events appeared in map assertions; these are the other two.
    const lost = harness(await load('valid/map-fanout.flow.json'));
    lost.driver.start({});
    lost.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    lost.scheduler.settle('r1:score:0:0', 'failed', {});   // no edge opts into `failed`
    lost.scheduler.settle('r1:score:1:0', 'done', { result: {} });
    equal(lost.events.map((e) => `${e.type.replace('branch.', '')} ${e.branchPath}`),
      ['opened 0', 'opened 1', 'lost 0', 'arrived 1'],
      'branch.lost carries the ITEM INDEX, not the declared branch index');
    equal(fold(lost.driver.foldInputs()).regions['split']!.settled, { 0: 'lost', 1: 'arrived' },
      'RN-R6 records it per item');

    const res = harness(await load('valid/map-fanout.flow.json'));
    res.driver.start({});
    res.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b'] } });
    res.scheduler.settle('r1:score:0:0', 'user_action', {});
    res.scheduler.settle('r1:score:1:0', 'done', { result: {} });
    equal(res.driver.resolve('r1:score:0:0', 'done', { result: {}, actor: 'ops:jane' }), true,
      'a mapped branch resolves — and this is the resolve() -> advance -> indicesFrom road, ' +
      'which the code names and no test walked for a map');
    equal(res.events.map((e) => `${e.type.replace('branch.', '')} ${e.branchPath}`),
      ['opened 0', 'opened 1', 'suspended 0', 'arrived 1', 'resumed 0', 'arrived 0'],
      'branch.resumed carries the item index too, and the join then fires');
    equal(res.ids().filter((i) => i.startsWith('r1:publish')), ['r1:publish:-:0'],
      'and the join routed out — the resolution really did complete the region');
    res.scheduler.settle('r1:publish:-:0', 'done', { result: {} });
    equal(fold(res.driver.foldInputs()).outcome, 'completed', '');
  });

  test('resolve() reaching a refusal REPORTS it and stops the run', () => {
    // **W33's conformity reader.** `resolve()` called `advance` outside any guard,
    // so a refusal raised while routing a resolution was thrown at the caller and
    // nothing else happened: no `stopped` input, `hasFailed()` false so later
    // settlements kept routing, and the fold reporting **`completed`** for a run
    // that did none of its work. Measured against the listener as a control.
    const def = {
      flowId: 'resolve-into-map', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'score' },
        { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;

    // The control: the same failure through the LISTENER.
    const viaListener = harness(def);
    viaListener.driver.start({});
    viaListener.scheduler.settle('r1:ingest:-:0', 'done', { result: { nope: 1 } });
    equal(viaListener.failures.map((f) => f.kind), ['UnresolvedMapArity'], 'reported (OR-R10)');
    equal(fold(viaListener.driver.foldInputs()).outcome, 'stopped', 'and the run is stopped');

    // The road that reported nothing: ADR 0004's resolution, into the same map.
    const viaResolve = harness(def);
    viaResolve.driver.start({});
    viaResolve.scheduler.settle('r1:ingest:-:0', 'user_action', {});
    let threw: unknown = null;
    try {
      viaResolve.driver.resolve('r1:ingest:-:0', 'done', { result: { nope: 1 }, actor: 'ops:jane' });
    } catch (e) { threw = e; }
    ok(threw instanceof UnresolvedMapArity,
      'it rethrows, because resolve() is caller-initiated and the caller is on the stack');
    equal(viaResolve.failures.map((f) => f.kind), ['UnresolvedMapArity'],
      'AND it reports — `enter` is reached from THREE entry points and this one guarded none');
    ok(viaResolve.driver.hasFailed(), 'the run is stopped, so later settlements do not keep routing');
    equal(fold(viaResolve.driver.foldInputs()).outcome, 'stopped',
      'RN-R8 — and it was `completed` before this fix, for a run that did none of its work');
  });

  test('the refusal is a THROW from start() when the map is the entry node', () => {
    // `FD-V3` refuses only a `join` or an `end` as entry, so a map may be one — and
    // then the value is the runs start payload. `start` is called by the caller, so
    // it BOTH reports and rethrows.
    const def = {
      flowId: 'map-at-entry', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'map', over: 'items', branch: 'score' },
        { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;

    const ok1 = harness(def);
    ok1.driver.start({ items: ['a', 'b'] });
    equal(ok1.ids(), ['r1:score:0:0', 'r1:score:1:0'],
      'a map AS the entry node maps over the runs start payload — no rule was needed for it');

    const bad = harness(def);
    let thrown: unknown = null;
    try { bad.driver.start({ nope: 1 }); } catch (e) { thrown = e; }
    ok(thrown instanceof UnresolvedMapArity, 'start rethrows, because the caller is on the stack');
    equal(bad.failures.length, 1, 'and it reports too — both, which is what `start` already did');
  });
});

suite('L2 — a region opener INSIDE a map region is refused at construction', (test) => {
  // **W33's conformity reader, and it is ADR 0036's own central finding one layer
  // down.** The ADR decided *two features* because `branchOf` is keyed by branch
  // NODE ID and collapses repeated entries; every piece of per-region RUN-TIME state
  // in the driver is keyed the same way — `joinState`, `firedJoins`,
  // `RegionEvent.regionId`, the fold's `regions` — and a map is the first construct
  // that enters one opener node MORE THAN ONCE in a run.
  const nestedInMap = {
    flowId: 'fanout-in-map', version: 1, entry: 'ingest',
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

  test('the VALIDATOR accepts it, which is why the driver has to refuse it', () => {
    // Stated first because it is the whole reason this is a driver refusal: the
    // definition is well-formed by every rule `spec/flow-definition.md` declares.
    const registry = { predicates: [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools };
    equal(validateDefinition(nestedInMap, registry), [],
      'zero findings — a map`s branch may be a task with edges, and FD-V25 says nothing ' +
      'about what those edges reach');
  });

  test('constructing a Driver on it is REFUSED, and the refusal names both nodes', () => {
    let threw: unknown = null;
    try {
      harness(nestedInMap);
    } catch (e) { threw = e; }
    ok(threw instanceof InvalidDefinition,
      'InvalidDefinition — the document names a structure this driver cannot execute, which is ' +
      'what that class already means. P10 decision 4 spends its one new class on UnresolvedMapArity');
    const m = (threw as Error).message;
    ok(m.includes('"split"'), 'it names the MAP region');
    ok(m.includes('"f2"'), 'and the opener inside it, so a reader knows which pair');
    ok(m.includes('Q156'), 'and points at the open question rather than implying a decision');
  });

  test('what it would have DONE, recorded as the measurement the refusal rests on', () => {
    // Kept as a comment rather than as a run, because the refusal now prevents it —
    // which is the point. Measured before the refusal existed, on the definition
    // above, with every one of its seven tasks settling `done`:
    //
    //   ids     r1:ingest:-:0 r1:lead:0:0 r1:lead:1:0 r1:p:0.0:0 r1:q:0.1:0 r1:p:1.0:0 r1:q:1.1:0
    //   outcome stuck
    //   split   {opened:["0","1"], settled:{"0":"arrived"},        joined:null}
    //   f2      {opened:["0.0","0.1","1.0","1.1"], settled:{all four}, joined:true}
    //
    // `open(f2)` ran twice and the second call DISCARDED instance 0's live count;
    // `firedJoins.add('f2')` after instance 0 fired made instance 1's join
    // unreachable; `split` branch 1 ended with NO terminal event; and two regions
    // merged into one fold entry. Every task succeeded and the run was `stuck`.
    ok(true, 'this case cannot be run any more, which is the assertion above');
  });

  test('the OTHER direction is untouched: a map inside a FANOUT branch still runs', async () => {
    // The discriminating control. `map-in-fanout` nests a map inside a fanout
    // branch, where the opener is entered ONCE — so the refusal must not reach it,
    // and no corpus flow is refused.
    const h = harness(await load('valid/map-in-fanout.flow.json'));
    h.driver.start({});
    drain(h, THREE);
    equal(fold(h.driver.foldInputs()).outcome, 'completed',
      'a map inside a fanout is the shipped corpus flow and is unaffected');
  });
});

suite('L3 — a map run folds deterministically', (test) => {
  test('the same input sequence folded twice is deep-equal', async () => {
    // **Q155 applies and is stated rather than glossed**: a `FoldInput` carries an
    // outcome record and a region event, so ROUTING IS ALREADY DECIDED by the time
    // the fold sees anything. This asserts the FOLD is deterministic over a maps
    // sequence — including the new `regionEntered` input — and it says nothing
    // about whether the driver would pick the same arity twice.
    const h = harness(await load('valid/map-fanout.flow.json'));
    h.driver.start({});
    drain(h, THREE);
    const inputs = h.driver.foldInputs();
    equal(fold(inputs), fold(inputs), 'RN-R1/JP-R1 — same log in, same run state out');
    equal(fold(inputs.slice(0, 4)), fold(inputs.slice(0, 4)), 'RN-R2 — and over a prefix too');
  });

  test('the DRIVER picks the same arity twice from the same log — the rung Q155 names', async () => {
    // Q155s own *"what would close it"*: re-run the DRIVER over one fixture outcome
    // log twice and compare the two logs. Cheap here for the same reason L2 is, and
    // it is the half folding one log twice structurally cannot reach.
    const runOnce = async () => {
      const h = harness(await load('valid/map-fanout.flow.json'));
      h.driver.start({});
      drain(h, THREE);
      return { ids: h.ids(), events: h.events.map((e) => `${e.type} ${e.regionId} ${e.branchPath}`) };
    };
    equal(await runOnce(), await runOnce(),
      'two drivers, one fixture log, identical dispatches and identical region events');
  });
});
