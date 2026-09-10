/**
 * Ladder L2 — **what a decision sees**, routed from a fixture log of outcomes with
 * no scheduler. [W42](../../doc/work-items/w42-what-a-decision-sees.md) under
 * [P12](../../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md),
 * [ADR 0041](../../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md),
 * answering [Q8](../../doc/open-questions.md).
 *
 * **A predicate is a pure function of a `DecisionContext`, so the whole of `FD-C3` is
 * reachable at this rung** — no worker, no thread, no timer, which is
 * `doc/workflow.md` section 4's own test of whether the driver has reached for the
 * scheduler somewhere it should not have.
 *
 * **Every expected value here is derived from `spec/` and not from a run:**
 *
 * | what | from |
 * |---|---|
 * | `ctx.needs = {"earlier": …}` | section 3's `FD-C3` row — *the object THIS EDGE's `needs` describes*, resolved by `FD-C1`'s table |
 * | `ctx.needs = {}` on an undeclared edge | the same row — *or `{}` when the edge declares none*, and never `undefined` |
 * | `ctx.outcome` unchanged | routing rule 4, which has said *always the node's effective outcome* since P1 |
 * | the `"."` refusal | `FD-V26`'s v0.12 clause, and `spec/examples/invalid/FD-V26--edge-needs-uses-the-self-token.flow.json` |
 * | the worker's payload unchanged | ADR 0041 rule 3, which is why the declaration is on the EDGE |
 */
import { equal, ok, readText, ROOT, suite } from '../harness.ts';
import { Driver, UnresolvedReference } from '../../src/driver/driver.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { DecisionContext } from '../../src/driver/routing.ts';
import type { Edge, FlowDefinition } from '../../src/definition/types.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as {
  workerTypes: string[];
  predicates: string[];
};

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

/**
 * Every predicate the registry names, recording the context it was given and
 * answering from `ctx.needs` alone — so an assertion about what was DISPATCHED is
 * also an assertion about what the predicate could SEE.
 */
function harness(def: FlowDefinition, answer: (ctx: DecisionContext) => boolean = () => false) {
  const scheduler = new FakeScheduler();
  const failures: { kind: string; message: string }[] = [];
  const seen: { name: string; ctx: DecisionContext }[] = [];
  const predicates = new Map(
    reg.predicates.map((n) => [n, (ctx: DecisionContext) => {
      seen.push({ name: n, ctx });
      return answer(ctx);
    }]),
  );
  const driver = new Driver(def, {
    runId: 'r1',
    scheduler,
    createTask: (c) => c,
    predicates,
    workerTypes: reg.workerTypes,
    joinPolicy: liveToken as JoinPolicy,
    onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
  });
  return {
    scheduler, driver, failures, seen,
    ids: () => scheduler.added.map((t) => t.id),
    nodes: () => scheduler.added.map((t) => t.id.split(':')[1]!),
    payloadOf: (id: string) => scheduler.added.find((t) => t.id === id)?.payload,
  };
}

suite('L2 — FD-C3: what a decision sees', (test) => {
  test('Q8`s own flow — the predicate routes on a node it does not sit on', async () => {
    // `spec/examples/valid/decision-on-an-earlier-step.flow.json`, which is Q8's row's
    // own sentence since P1: *route to review if any earlier step flagged low
    // confidence*. **Two runs, one flow, and the only difference is `ingest`'s
    // result** — which is what makes the assertion about the CONTEXT rather than
    // about the predicate.
    const routes: Record<string, string[]> = {};
    for (const flagged of [true, false]) {
      const h = harness(
        await load('valid/decision-on-an-earlier-step.flow.json'),
        (ctx) => (ctx.needs as { earlier?: { flagged?: boolean } }).earlier?.flagged === true,
      );
      h.driver.start({});
      h.scheduler.settle('r1:ingest:-:0', 'done', { result: { flagged } });
      h.scheduler.settle('r1:score:-:0', 'done', { result: { score: 0.4 } });

      equal(h.seen.length, 1, 'the guarded edge`s predicate ran exactly once');
      equal(h.seen[0]!.ctx.needs, { earlier: { flagged } },
        'ctx.needs is what THIS EDGE declared — `{"earlier": "ingest"}` resolved against ingest`s result');
      routes[String(flagged)] = h.nodes();
    }
    equal(routes['true'], ['ingest', 'score', 'review'],
      'flagged: the run takes the review road, decided by a node the predicate does not sit on');
    equal(routes['false'], ['ingest', 'score', 'publish'],
      'not flagged: the same flow takes the other road — before ADR 0041 neither was expressible');
  });

  test('the WORKER`s payload is untouched, which is why the declaration is on the EDGE', async () => {
    // ADR 0041 rule 3. A `needs` on the NODE would have rewritten this.
    const h = harness(await load('valid/decision-on-an-earlier-step.flow.json'));
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { flagged: true } });
    equal(h.payloadOf('r1:score:-:0'), { flagged: true },
      'score receives ingest`s result unchanged — the ordinary edge`s value, FD-C1`s first clause');
  });

  test('an edge that declares nothing gives `{}`, never `undefined`', () => {
    // `FD-C3`, and routing rule 4's reason one level out: a predicate written
    // `ctx.needs.flag` must mean one thing. Both of this node's edges are guarded and
    // only ONE declares a `needs`, so one run exercises both halves.
    const def = {
      flowId: 'one-declares-one-does-not', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'score' }] },
        {
          id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [
            { when: 'isLowConfidence', to: 'review', needs: { earlier: 'ingest' } },
            { when: 'isHighConfidence', to: 'publish' },
            { to: 'done' },
          ],
        },
        { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'done' }] },
        { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(validateDefinition(def, { predicates: reg.predicates, workerTypes: reg.workerTypes }), [],
      'two guarded edges and a default is a valid document — FD-V7 is satisfied by the last');
    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { flagged: true } });
    h.scheduler.settle('r1:score:-:0', 'done', { result: {} });

    equal(h.seen.map((s) => s.name), ['isLowConfidence', 'isHighConfidence'],
      'both guarded edges were evaluated, in declaration order — ADR 0004 rule 2');
    equal(h.seen[0]!.ctx.needs, { earlier: { flagged: true } }, 'the edge that DECLARED one sees it');
    equal(h.seen[1]!.ctx.needs, {},
      'and the edge that declared none sees `{}` — a different edge of the SAME node, which is ' +
      'what makes this a property of the decision rather than of the node');
    // **ONE call per GUARDED edge, and no more** — ADR 0041 rule 2's *only for an
    // edge that carries a `when`*, which is what keeps rule 1 true of the COST as
    // well as of the value. Nothing asserted it, so a builder called an extra time
    // outside the loop cost **0**: over-calling is not observable in a value, and
    // counting the calls is what makes it observable.
    equal(h.seen.length, 2,
      'the builder ran twice for THREE edges — the default carries no `when`, so it is never ' +
      'evaluated and its context is never built');
  });

  test('ctx.outcome is unchanged, and is still the EFFECTIVE outcome after a resolution', () => {
    // Routing rule 4, since P1. A resumed node has two records and neither alone is
    // right to hand a predicate; `FD-C3` adds a field and does not touch this one.
    const def = {
      flowId: 'resumed-decision', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'score' }] },
        {
          id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [
            { when: 'isLowConfidence', to: 'review', needs: { earlier: 'ingest' } },
            { to: 'publish' },
          ],
        },
        { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { flagged: true } });
    h.scheduler.settle('r1:score:-:0', 'user_action', {});
    equal(h.seen.length, 0, 'a `user_action` settlement routes NOWHERE, so no predicate runs');

    ok(h.driver.resolve('r1:score:-:0', 'done', { result: { score: 0.9 }, actor: 'a-person' }),
      'the resolution is accepted');
    equal(h.seen.length, 1, 'and NOW the predicate runs, exactly once');
    equal(h.seen[0]!.ctx.outcome.terminalState, 'done', 'OR-R9 — the effective outcome, not the suspension');
    equal(h.seen[0]!.ctx.outcome.result, { score: 0.9 }, 'and the RESOLUTION`s result');
    equal(h.seen[0]!.ctx.needs, { earlier: { flagged: true } },
      'while ctx.needs still resolves against the run, at the moment the decision is made');
  });

  test('each predicate gets its OWN copy, and neither field aliases the log', () => {
    // `JP-R11`'s invariant, and `OR-R7`'s: a predicate is ordinary user code
    // (ADR 0002 rule 4 asks it to be pure and nothing enforces that — Q9), so a
    // context it can write through is a context that can edit a record in the log.
    const def = {
      flowId: 'two-guarded-edges', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'score' }] },
        {
          id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [
            { when: 'isLowConfidence', to: 'review', needs: { earlier: 'ingest' } },
            { when: 'isHighConfidence', to: 'publish', needs: { earlier: 'ingest' } },
            { to: 'done' },
          ],
        },
        { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'done' }] },
        { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const h = harness(def);
    h.driver.start({});
    const ingestResult = { flagged: true, deep: { n: 1 } };
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: ingestResult });
    h.scheduler.settle('r1:score:-:0', 'done', { result: {} });

    equal(h.seen.length, 2, 'both guarded edges were evaluated');
    const a = h.seen[0]!.ctx.needs as { earlier: { deep: unknown } };
    const b = h.seen[1]!.ctx.needs as { earlier: { deep: unknown } };
    equal(a, b, 'the two edges declared the same reference and got the same VALUE');
    ok(a.earlier !== b.earlier, 'and not the same OBJECT — one copy per key, per edge');
    ok(a.earlier !== ingestResult, 'and neither aliases the record in the log');
    ok(a.earlier.deep !== b.earlier.deep, 'nested too');
    ok(h.seen[0]!.ctx.outcome !== h.seen[1]!.ctx.outcome, 'and `outcome` is a copy per edge as well');
  });

  test('a decision INSIDE a map region resolves relative to its own branch path', () => {
    // **W42's conformity reader's finding 10, and it is the item's own Verification
    // table's claim.** That table says the nested case is *covered — a predicate
    // inside a region has a `branchPath`, and ADR 0040 rule 4 makes what it can reach
    // relative to it* — and nothing reached `resolveNeeds`'s `pathOf(node.id,
    // itemIndices)` with a path other than `-`. So the whole of *relative to a branch
    // path* was untested at the edge site, in the item whose subject it is.
    //
    // Here `check` sits INSIDE a map region at paths `0`, `1` and `2`, and its edge
    // names `score` — the instance ON ITS OWN PATH. `FD-V28` accepts the bare form
    // because the reader is inside the same region as the target (W41's finding 1).
    const def = {
      flowId: 'decision-inside-a-map', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'score' },
        { id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'check' }] },
        {
          id: 'check', kind: 'task', workerType: 'MergeWorker', edges: [
            { when: 'isLowConfidence', to: 'review', needs: { mine: 'score' } },
            { to: 'collect' },
          ],
        },
        { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(validateDefinition(def, { predicates: reg.predicates, workerTypes: reg.workerTypes }), [],
      'valid — and FD-V28 takes the BARE form because reader and target are in the same map region');

    // Only instance 1 is flagged, so the predicate must see a DIFFERENT value per
    // instance — which is what `pathOf(node.id, itemIndices)` is for.
    const h = harness(def, (ctx) => (ctx.needs as { mine?: { flag?: boolean } }).mine?.flag === true);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b', 'c'] } });
    for (const i of [0, 1, 2]) h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { flag: i === 1 } });
    for (const i of [0, 1, 2]) h.scheduler.settle(`r1:check:${i}:0`, 'done', { result: {} });

    equal(h.seen.map((s) => (s.ctx.needs as { mine: { flag: boolean } }).mine.flag), [false, true, false],
      'each instance`s predicate saw ITS OWN score — the reference resolved relative to the ' +
      'branch path, which is the whole of ADR 0040 rule 4 at the edge site');
    equal(h.nodes().filter((x) => x === 'review'), ['review'],
      'and exactly ONE instance took the guarded edge — instance 1');
    equal(h.ids().filter((x) => x.startsWith('r1:review:')), ['r1:review:1:0'],
      'at ITS path, which is what would break if `pathOf` were handed `-` or the wrong indices');
  });

  test('MANY keys, and the ARRAY form, resolved at the edge site', () => {
    // **Three of W42's adequacy reader's blocking survivors in one fixture**, because
    // they are three properties of one loop nothing exercised:
    //   12. `Object.entries(needs).slice(0, 1)` cost **0** — every `needs` in every
    //       fixture and in the corpus flow had exactly ONE key;
    //   17. forcing `t.form` to `'one'` cost **0** — the `["n"]` form was VALIDATED
    //       (`FD-V28`) at the edge site and never RESOLVED there;
    //   19. dropping the array form's per-entry `cloneValue` cost **0**, so two edges
    //       naming the same node received the SAME objects and a predicate could edit
    //       a record in the driver's log.
    const def = {
      flowId: 'many-keys-and-the-array-form', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'score' },
        { id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [
            { when: 'isLowConfidence', to: 'review', needs: { all: ['score'], up: 'ingest' } },
            { when: 'isHighConfidence', to: 'review', needs: { all: ['score'] } },
            { to: 'done' },
          ],
        },
        { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(validateDefinition(def, { predicates: reg.predicates, workerTypes: reg.workerTypes }), [],
      'valid — the ARRAY form is what FD-V28 requires here, because `publish` is outside the map region');

    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { items: ['a', 'b', 'c'], tag: 'T' } });
    for (const i of [0, 1, 2]) h.scheduler.settle(`r1:score:${i}:0`, 'done', { result: { s: i } });
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });

    equal(h.seen.length, 2, 'both guarded edges were evaluated');
    // 12 — TWO keys, and the second is not dropped.
    equal(Object.keys(h.seen[0]!.ctx.needs).sort(), ['all', 'up'],
      'BOTH declared keys reach the predicate — one key per entry of the declaration');
    // 17 — the array form RESOLVES to an array, in ascending branchPath order.
    equal(h.seen[0]!.ctx.needs.all, [{ s: 0 }, { s: 1 }, { s: 2 }],
      'the `["n"]` form gives an ARRAY at the edge site, in ascending branchPath order — a ' +
      'predicate written `ctx.needs.all.length` reads 3, and reads `undefined` if the form is lost');
    equal(h.seen[0]!.ctx.needs.up, { items: ['a', 'b', 'c'], tag: 'T' }, 'and the bare form beside it');
    // 19 — the array's entries are copies, per edge.
    const a = h.seen[0]!.ctx.needs.all as { s: number }[];
    const b = h.seen[1]!.ctx.needs.all as { s: number }[];
    equal(a, b, 'the two edges named the same node and got the same VALUE');
    ok(a[0] !== b[0], 'and not the same OBJECTS — the ARRAY form copies per entry, per edge');
    const logged = h.driver.snapshot().find((r) => r.taskId === 'r1:score:0:0')!;
    ok(a[0] !== logged.result, 'and neither entry aliases the record in the log — JP-R11 and OR-R7');
  });

  test('a DEFAULT edge`s `needs` is never resolved, however unresolvable it is', () => {
    // **W42's adequacy reader's finding 7, and it is the sharpest one.** ADR 0041
    // rule 2 says the context is built *only for an edge that carries a `when`*, and
    // nothing bound it: adding `contextFor(e)` to the default-edge arm of `selectEdge`
    // cost **0**. It is not a cost claim — it STOPS A VALID RUN, because a default
    // edge may declare a reference this run routed around, and resolving it throws
    // `FD-R3` on a flow that routes perfectly well. The author's count assertion
    // counts PREDICATE calls, and a default edge has no predicate to count.
    const def = {
      flowId: 'default-edge-declares-the-unreachable', version: 1, entry: 'ingest',
      nodes: [
        {
          id: 'ingest', kind: 'task', workerType: 'IngestWorker',
          edges: [{ when: 'isHighConfidence', to: 'flag' }, { to: 'skip' }],
        },
        { id: 'flag', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        { id: 'skip', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', workerType: 'PublishWorker',
          edges: [{ to: 'done', needs: { f: 'flag' } }],
        },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(validateDefinition(def, { predicates: reg.predicates, workerTypes: reg.workerTypes }), [],
      'valid — a default edge may carry a `needs`, and section 3 records that it is INERT');
    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:skip:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });
    equal(h.failures, [],
      'NO FD-R3 — the declaration names a node this run routed around, and nothing resolved it. ' +
      'Building a context for an edge with no `when` stops a run the flow routes correctly');
    equal(h.nodes(), ['ingest', 'skip', 'publish'], 'and the run reached its `end` node');
  });

  test('`ctx.needs` is FROZEN, and the same at both branches', () => {
    // **W42's adequacy reader's finding 8.** `EMPTY_NEEDS` was frozen and the composed
    // object was not, so a predicate writing to `ctx.needs` THREW when its edge
    // declared nothing and succeeded silently when it declared something — and with
    // `Object.freeze` deleted (which cost **0**), a write to the shared instance would
    // be read by the NEXT predicate, in the next run, in the same process.
    const def = {
      flowId: 'frozen-both-ways', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'score' }] },
        {
          id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [
            { when: 'isLowConfidence', to: 'review', needs: { earlier: 'ingest' } },
            { when: 'isHighConfidence', to: 'publish' },
            { to: 'done' },
          ],
        },
        { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'done' }] },
        { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { flagged: true } });
    h.scheduler.settle('r1:score:-:0', 'done', { result: {} });
    equal(h.seen.length, 2, 'both guarded edges were evaluated');
    for (const [i, label] of [[0, 'the edge that DECLARED one'], [1, 'the edge that declared none']] as const) {
      ok(Object.isFrozen(h.seen[i]!.ctx.needs), `${label}: ctx.needs is frozen`);
      let threw = false;
      try {
        (h.seen[i]!.ctx.needs as Record<string, unknown>).poison = 1;
      } catch {
        threw = true;
      }
      ok(threw, `${label}: a predicate writing to it THROWS, which is the same answer on both roads`);
    }
    equal(h.seen[1]!.ctx.needs, {}, 'and the shared empty instance is still empty afterwards');
  });

  test('an edge that is never REACHED is never resolved — order is what makes FD-R3 safe', () => {
    // **The hazard a per-edge context creates, and it is behavioural rather than a
    // cost.** `FD-R3` stops the run when a reference resolves to nothing — so an
    // implementation that builds every eligible edge's context UP FRONT stops runs
    // that should route perfectly well, on an edge the flow never takes. Here the
    // FIRST guarded edge matches and the second declares a reference to a node this
    // run routed around: today that second context is never built.
    //
    // W42's own rule 8 set: a probe adding an extra `contextFor(eligible[0])` call
    // cost **0**, because over-calling is not observable in a value. *What is
    // observable is calling it for the wrong edge*, and this is what says so.
    const def = {
      flowId: 'a-later-edge-is-never-reached', version: 1, entry: 'ingest',
      nodes: [
        {
          id: 'ingest', kind: 'task', workerType: 'IngestWorker',
          edges: [{ when: 'isHighConfidence', to: 'flag' }, { to: 'skip' }],
        },
        { id: 'flag', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        { id: 'skip', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [
            { when: 'isLowConfidence', to: 'review' },
            { when: 'isHighConfidence', to: 'review', needs: { f: 'flag' } },
            { to: 'done' },
          ],
        },
        { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(validateDefinition(def, { predicates: reg.predicates, workerTypes: reg.workerTypes }), [],
      'a valid document — FD-V27 accepts the reference because `publish` IS reachable from `flag`');
    // `isLowConfidence` matches at the FIRST guarded edge; `isHighConfidence` never runs.
    const h = harness(def, (ctx) => ctx.outcome.taskId === 'r1:publish:-:0');
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:skip:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });

    equal(h.failures, [],
      'NO FD-R3 — the second edge declares a reference this run cannot resolve, and it is ' +
      'never evaluated, so it is never resolved. Building every eligible context up front ' +
      'would stop a run that routes correctly');
    equal(h.nodes(), ['ingest', 'skip', 'publish', 'review'], 'and the run took the first guarded edge');
  });

  test('an edge reference the run did not produce is FD-R3, from the same expression', () => {
    // A decision now has a run-time refusal where before it had only `FD-R1`, and it
    // is the same class, message and rule as a node's — ADR 0041's *what it costs*.
    // `flag` is upstream of `publish` (FD-V27 accepts), and this run routes around it.
    const def = {
      flowId: 'edge-reference-routed-around', version: 1, entry: 'ingest',
      nodes: [
        {
          id: 'ingest', kind: 'task', workerType: 'IngestWorker',
          edges: [{ when: 'isHighConfidence', to: 'flag' }, { to: 'skip' }],
        },
        { id: 'flag', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        { id: 'skip', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [
            { when: 'isLowConfidence', to: 'review', needs: { f: 'flag' } },
            { to: 'done' },
          ],
        },
        { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(validateDefinition(def, { predicates: reg.predicates, workerTypes: reg.workerTypes }), [],
      'FD-V27 accepts it: `publish` IS reachable from `flag`, which is everything the GRAPH can say');
    const h = harness(def);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:skip:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:publish:-:0', 'done', { result: {} });

    equal(h.failures.length, 1, 'reported exactly once, through OR-R10');
    equal(h.failures[0]!.kind, 'UnresolvedReference', 'FD-R3, and the same class a node`s reference uses');
    ok(h.failures[0]!.message.includes('edge needs["f"]'),
      'and the message names the SITE, so a reader is sent to the edge and not to the node');
    equal(h.nodes(), ['ingest', 'skip', 'publish'], 'and the run stopped rather than routing');
    ok(new UnresolvedReference('x') instanceof Error, 'no new class was needed');
  });
});

/**
 * **A typed `Edge` carrying a `needs`** — W42's own rule 8 set, obligation (b).
 * Every fixture in this file is cast through `unknown`, so `needs` could leave the
 * `Edge` type for **0** failures and no consumer writing TypeScript could declare
 * one. This is the declaration that makes that a typecheck failure, and it is at
 * module scope so it costs no test case.
 */
const TYPED_EDGE: Edge = { when: 'isLowConfidence', to: 'review', needs: { earlier: 'ingest' } };

suite('L1 — FD-V26 on an EDGE: the grammar, minus one form', (test) => {
  test('the Edge TYPE admits a `needs`, which every other fixture here casts past', () => {
    equal(TYPED_EDGE.needs, { earlier: 'ingest' },
      'declared as an `Edge` and not cast — so `needs` leaving that type is a typecheck failure ' +
      'rather than a silent loss of the whole consumer-facing declaration');
  });

  const edge = (needs: unknown) => ({
    flowId: 'edge-needs', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'score' }] },
      {
        id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [
          { when: 'isLowConfidence', to: 'review', needs },
          { to: 'publish' },
        ],
      },
      { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition);
  const rulesOf = (d: FlowDefinition) =>
    [...new Set(validateDefinition(d, { predicates: reg.predicates, workerTypes: reg.workerTypes })
      .map((f) => f.rule))].sort();

  test('`"."` is REFUSED on an edge, and the message says why', () => {
    equal(rulesOf(edge({ self: '.' })), ['FD-V26'], 'the one form an edge does not have');
    const f = validateDefinition(edge({ self: '.' }), { predicates: reg.predicates, workerTypes: reg.workerTypes })[0]!;
    ok(f.detail.includes('ctx.outcome'),
      'and it names what the author already has, rather than only refusing');
    ok(f.at === 'score#edge0', 'reported at the EDGE, which is where the author has to look');
  });

  // **A LIST, bounded, and every case ASSERTED** — W42's own rule 8 set, obligation
  // (d). Written as separate `equal` calls, dropping any one of these cost **0**,
  // because nothing counted them. The bound is on what the loop CHECKED, pushed after
  // the assertion rather than before it — W41's adequacy reader's finding, one item on.
  const CASES: [string, unknown, string[]][] = [
    // the grammar — FD-V26's clauses, which are the node's applied to an edge
    ['empty', {}, ['FD-V26']],
    ['not an object — the EMPTY array, caught by the empty clause', [], ['FD-V26']],
    // **W42's adequacy reader's finding 23.** The row above says *not an object* and
    // uses `[]`, which the EMPTY clause catches — so `Array.isArray(nv)` never
    // discriminated and was deletable for **0**. The reachable case is a NON-EMPTY
    // array, which without that clause is accepted and resolves at run time to
    // `{"0": …}`, because `"0"` passes `ID_RE`. Same shape as W41's finding at the
    // node site, in the item that quotes it.
    ['not an object — a NON-EMPTY array, which is the clause`s only real case', ['ingest'], ['FD-V26']],
    ['null is reported, never thrown', null, ['FD-V26']],
    ['a key outside FD-V16`s charset', { 'has:colon': 'ingest' }, ['FD-V26']],
    ['a value that is not a reference', { k: { node: 'ingest' } }, ['FD-V26']],
    ['a non-empty array is not an object', { k: ['a', 'b'] }, ['FD-V26']],
    // the aiming — FD-V27 and FD-V28, unchanged, at a second site
    ['a node id upstream of the reader', { up: 'ingest' }, []],
    ['a node that does not exist', { up: 'nowhere' }, ['FD-V27']],
    ['a node this one is not reachable from', { up: 'review' }, ['FD-V27']],
    ['the ARRAY form where the target produces exactly one', { up: ['ingest'] }, ['FD-V28']],
  ];

  test('the grammar and the aiming rules, every clause, at the EDGE site', () => {
    // **`checked` collects the COMPUTED verdict, not the label** — W42's adequacy
    // reader's finding 34. Pushing the label was unconditional, so it recorded that
    // the loop RAN and not that it ASSERTED: replacing the whole `equal` with
    // `void needs; void expected;` cost **0**, with the message still reading *every
    // case was ASSERTED*. Comparing what `rulesOf` actually returned to the table is
    // what makes the sentence true.
    const checked: [string, string[], string[]][] = [];
    for (const [label, needs, expected] of CASES) {
      const found = validateDefinition(edge(needs), { predicates: reg.predicates, workerTypes: reg.workerTypes });
      const got = [...new Set(found.map((f) => f.rule))].sort();
      equal(got, expected, `${label} -> ${expected.join(',') || 'accepted'}`);
      checked.push([label, got, found.map((f) => f.at ?? '<none>')]);
    }
    equal(checked.map((c) => [c[0], c[1]]), CASES.map((c) => [c[0], c[2]]),
      'every case was ASSERTED — what the VALIDATOR returned, compared to the table');
    // **And `at`, which the table does not contain** — W42's adequacy reader's
    // finding 34. Its probe replaced the whole assertion with `got = expected`, and
    // `checked` then held the right pairs because the loop could FABRICATE them from
    // the table it was being compared to. Measured: the swap alone survives, and only
    // a COMPOUND with a broken validator goes red — and then it is caught by three
    // OTHER assertions, not by this one (W34's *a provenance probe cannot be graded
    // against a correct implementation*, with the second half measured too).
    // **`at` is a value `expected` does not carry**, so a loop body that asserts
    // nothing cannot produce it — and the claim it adds is real: every edge-site
    // refusal reports at the EDGE.
    equal(
      checked.filter((c) => c[1].length > 0).map((c) => c[2]),
      CASES.filter((c) => c[2].length > 0).map(() => ['score#edge0']),
      'every refusing case reports at `score#edge0` — the EDGE, not the node, which is where an ' +
      'author with three edges has to look. This value is nowhere in the table above',
    );
    // **A literal, and the ceiling is stated rather than hidden.** W41's adequacy
    // reader showed that a number beside its own list falls to a compound edit that
    // narrows both — and `doc/workflow.md` section 5 rule 8's own procedure calls
    // that a REWRITE whose survival says nothing ([Q112](../../doc/open-questions.md)).
    // What this catches is the SINGLE edit, which is what a later reader tidying the
    // file actually does; what it does not catch is the compound, and W41 moved its
    // equivalent bound into `spec/` because there the compound has to edit the
    // NORMATIVE document. **There is no such source here** — `FD-V26`'s row is prose,
    // not a countable list — so this is a literal, and that is recorded.
    equal(CASES.length, 11,
      'ELEVEN cases — seven of the grammar and four of the aiming. An entry leaving alone is red');
    equal(CASES.filter((c) => c[2].length === 0).length, 1,
      'exactly one case is ACCEPTED — a suite of refusals with no acceptance cannot tell a working ' +
      'rule from one that refuses everything');
    equal(new Set(CASES.flatMap((c) => c[2])).size, 3,
      'and THREE rules are exercised — FD-V26, FD-V27 and FD-V28, which is every rule an edge`s ' +
      '`needs` can trip. A clause leaving this list takes its rule with it, and this is what says so');
  });

  test('EVERY edge is aimed, and each finding names its OWN edge index', () => {
    // **W42's adequacy reader, findings 30 and 43.** `aimedReferences` iterated the
    // edges and nothing bounded the loop: `edges.slice(0, 1)` cost **0**, because
    // every edge-site fixture in the tree put its `needs` on edge **0**. And
    // `FD-V27`/`FD-V28` reported `at: <node id>` for an edge-site violation while
    // `FD-V26`'s clauses report `<node>#edgeN`, so an author with three edges was
    // told the node and not the edge.
    const def = {
      flowId: 'a-later-edge-is-aimed-too', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'score' }] },
        {
          id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [
            { when: 'isLowConfidence', to: 'review', needs: { ok: 'ingest' } },
            { when: 'isHighConfidence', to: 'publish', needs: { bad: 'nowhere-at-all' } },
            { to: 'done' },
          ],
        },
        { id: 'review', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'done' }] },
        { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const found = validateDefinition(def, { predicates: reg.predicates, workerTypes: reg.workerTypes });
    equal(found.map((f) => f.rule), ['FD-V27'],
      'edge ONE`s reference is aimed — an aiming loop that stops at edge 0 accepts this document, ' +
      'and FD-V27`s own argument is that a reference must not become FD-R3 on the one workload ' +
      'that takes that branch');
    equal(found[0]!.at, 'score#edge1',
      'and the finding names the EDGE INDEX, not the node — FD-V26`s clauses already do, and a ' +
      'node with three edges is otherwise told only which node');
  });

  test('the invalid corpus case is this rule`s CLAUSE, not merely its rule', async () => {
    // **Bound to the clause its FILENAME names** — W41's adequacy reader found that an
    // invalid file can drift to a different clause of its own rule for **0**, because
    // `l4-corpus.test.ts` asserts only `rules.includes(...)`. Measured here too:
    // rewriting this file's `"."` to `7` still trips `FD-V26` and cost 0. The filename
    // says `edge-needs-uses-the-self-token`, so the DETAIL is what binds it.
    const d = await load('invalid/FD-V26--edge-needs-uses-the-self-token.flow.json');
    equal(rulesOf(d), ['FD-V26'], 'FD-V26 alone — C3 names it and C4 counts it');
    const f = validateDefinition(d, { predicates: reg.predicates, workerTypes: reg.workerTypes })[0]!;
    ok(f.detail.includes('is "."'), 'and it is the `"."` clause, which is the one clause an EDGE adds');
    ok(f.detail.includes('ctx.outcome'), 'reported with what the author already has');
    ok(f.at !== null && f.at.includes('#edge'), 'at the EDGE, which is where the author has to look');
  });

  test('an edge with a `needs` and NO `when` is accepted and INERT, and so is a join`s', () => {
    // **Both shapes of the inert declaration**, which `spec/flow-definition.md`
    // section 3 now records rather than refuses. W42's conformity reader found the
    // second asserted only in a test comment and the first not at all.
    equal(rulesOf(edge({ up: 'ingest' })), [], 'the guarded case is the one that is READ');
    const noWhen = {
      flowId: 'needs-with-no-when', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'score' }] },
        {
          id: 'score', kind: 'task', workerType: 'ScoreWorker',
          edges: [{ to: 'publish', needs: { up: 'ingest' } }],
        },
        { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(rulesOf(noWhen), [],
      'an edge with a `needs` and no `when` VALIDATES — the grammar is about the reference and ' +
      'whether a predicate can sit here is FD-V7`s question');
    // And it is INERT: the run behaves exactly as it would with no declaration.
    const h = harness(noWhen);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { flagged: true } });
    h.scheduler.settle('r1:score:-:0', 'done', { result: { s: 1 } });
    equal(h.seen, [], 'no predicate ran, so the declaration was never resolved');
    equal(h.payloadOf('r1:publish:-:0'), { s: 1 },
      'and `publish` received score`s result unchanged — an edge `needs` never touches a PAYLOAD');
  });

  test('a `needs` on a kind that may not carry one is still FD-V17, at the edge too', () => {
    // The `FD-V26` row says so in the document: `needs` is absent from an END node's
    // key list and from a join EDGE is not a case, because a join's one edge carries
    // neither `when` nor `on` — but it may carry `needs`, which is a live oddity and
    // is asserted rather than assumed.
    const d = {
      flowId: 'join-edge-needs', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'b', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done', needs: { up: 'ingest' } }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(rulesOf(d), [],
      'a join`s edge may carry a `needs` and it is INERT — FD-V7 forbids `when` there, so no ' +
      'predicate ever reads it. Recorded rather than refused: the grammar is about the edge and ' +
      'the uselessness is about the kind, and `FD-V17` is the rule that would have to say so');
  });
});
