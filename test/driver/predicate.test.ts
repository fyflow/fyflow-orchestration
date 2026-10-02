/**
 * **A DECLARED predicate ROUTES — ladder L2, a fixture log of task outcomes in and an asserted node
 * sequence out, with NO predicate registered at all** — `spec/flow-definition.md` v0.27 section 3's
 * `when` subsection and `FD-C7`,
 * [ADR 0074](../../doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md),
 * [W108](../../doc/work-items/w108-a-predicate-is-data.md).
 *
 * **Why L2 and not L1.** `test/definition/predicate.test.ts` holds the grammar and asks the evaluator
 * directly; this asks the DRIVER, through `selectEdge`, over a run. The two are independent observers
 * of one fact, which is obligation (c)'s LIMIT: a probe re-sourcing either leaves the other live.
 *
 * **The claim this file exists for is that the registry is EMPTY.** Every driver below is built with
 * `predicates: new Map()`, so a flow routes on data alone — and that is the whole of what P26 is for.
 * A tree where the evaluator fell back to a registered function cannot pass this file at all.
 *
 * **`selectEdge` is PURE and that is asserted rather than stated** (the item's `What to be careful of`
 * 5, handed to the adequacy reader by name). The last two cases are the two halves: the same context
 * evaluated twice gives the same answer with no call to anything, and a frozen context is not written
 * to.
 */
import { equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver } from '../../src/driver/driver.ts';
import type { FlowDefinition, When } from '../../src/definition/types.ts';
import type { Predicate } from '../../src/driver/routing.ts';

const SUITE = 'W108 — a DECLARED predicate ROUTES, with no predicate registered at all';

class FakeScheduler {
  readonly added: { id: string; payload?: unknown }[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    const l = this.listeners.get(type) ?? [];
    l.push(fn);
    this.listeners.set(type, l);
  }
  addTask(t: { id: string; payload?: unknown }): void { this.added.push(t); }
  settle(id: string, result: unknown): void {
    // `timestamp` is PINNED. The driver copies it into the outcome record, so leaving it to
    // the scheduler would make any two-run comparison a clock comparison — which is what the
    // purity case below caught on its second sample, having passed on its first.
    const detail = { id, state: 'done', result, attempts: 0, timestamp: 1_000 };
    for (const fn of this.listeners.get('task.completed') ?? []) fn({ detail });
  }
}

/**
 * A two-way decision whose ONE guarded edge carries `when`. `review` and `publish` are the two
 * roads, so the dispatched id after the entry settles IS the verdict — an assertion about what the
 * DRIVER did rather than about what an expression returned.
 */
const flowWith = (when: When, needs?: Record<string, unknown>): FlowDefinition => ({
  flowId: 'declared', version: 1, entry: 'score',
  nodes: [
    { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [
      needs === undefined ? { when, to: 'review' } : { when, to: 'review', needs },
      { to: 'publish' },
    ] },
    { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'done' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition);

const TYPES = typesFor(['IngestWorker', 'ScoreWorker', 'ReviewWorker', 'PublishWorker']);

/**
 * **The EMPTY predicate registry, ONE object, asserted empty** — and that is the item's headline
 * claim rather than a convenience. Rule 8 probe `b5` populated the literal `new Map()` at every
 * site for ZERO, because *no predicate registered at all* was five separate literals and a
 * sentence. Every driver below is handed THIS object, and `theRegistryIsEmpty` is what fails when
 * it stops being one.
 */
const NO_PREDICATES: ReadonlyMap<string, Predicate> = new Map<string, Predicate>();
const theRegistryIsEmpty = () =>
  ok(NO_PREDICATES.size === 0,
    `the predicate registry every driver in this suite is handed holds ${NO_PREDICATES.size} entries, ` +
    'and the whole claim is that it holds none');

/** Run the entry, settle it with `result`, and report which road the driver took. */
function roadTaken(def: FlowDefinition, result: unknown, entryId = 'r1:score:-:0'): string {
  const scheduler = new FakeScheduler();
  const d = new Driver(def, {
    runId: 'r1', scheduler, createTask: (c: unknown) => c,
    // **EMPTY.** This is the claim, and it is a parameter of the harness rather than a sentence.
    predicates: NO_PREDICATES,
    ...TYPES,
  } as unknown as ConstructorParameters<typeof Driver>[1]);
  d.start({});
  scheduler.settle(entryId, result);
  const ids = scheduler.added.map((t) => t.id);
  const after = ids.slice(1);
  return after.length === 0 ? '(nothing)' : after[0]!.split(':')[1]!;
}

suite(SUITE, (test) => {
  test('a COMPARISON routes both ways on ONE definition and two payloads, and the registry is empty', () => {
    theRegistryIsEmpty();
    const def = flowWith({ path: 'outcome.result.confidence', op: 'lt', value: 0.5 });
    equal(roadTaken(def, { confidence: 0.4 }), 'review', 'below the threshold the guarded edge is taken');
    equal(roadTaken(def, { confidence: 0.9 }), 'publish', 'above it the default edge is');
    // **The PAIR is the assertion, and what makes it differ is itself a claim** (rule 8's fourth
    // requirement on the set). Collapsing the two payloads to one value makes both rows read the
    // same road, so the two payloads are compared here rather than left as two literals.
    ok(0.4 < 0.5 && !(0.9 < 0.5), 'the two payloads straddle the declared threshold — collapse them and both rows agree');
  });

  test('the ABSENT path routes to the DEFAULT edge, and `default` moves it — the pair, on one definition each', () => {
    const bare = flowWith({ path: 'outcome.result.score', op: 'lte', value: 0.5 });
    const withDefault = flowWith({ path: 'outcome.result.score', op: 'lte', value: 0.5, default: 0 });
    equal(roadTaken(bare, {}), 'publish', 'absent is NO MATCH, so the guarded edge is not taken');
    equal(roadTaken(withDefault, {}), 'review', 'and with `default: 0` the same absent path takes it');
    // Both still agree where the path RESOLVES, so the default is not standing in for the value.
    equal(roadTaken(bare, { score: 0.9 }), 'publish', 'and where it resolves above the threshold, neither takes it');
    equal(roadTaken(withDefault, { score: 0.9 }), 'publish', '— the two differ ONLY on the absent case');
  });

  test('a TYPE-STRICT comparison routes a wrong-typed value down the DEFAULT edge, where JS would coerce', () => {
    const def = flowWith({ path: 'outcome.result.score', op: 'lt', value: 50 });
    equal(roadTaken(def, { score: 9 }), 'review', 'the number below the threshold');
    equal(roadTaken(def, { score: '9' }), 'publish',
      'and the STRING "9" does not — JS `"9" < 50` is true, and a run that routed on that would be ' +
      'deciding by coercion. This row is the one place the subset DIFFERS from an unguarded JS body');
  });

  test('a GROUP routes over its members, on the two roots, through an edge`s own `needs`', () => {
    // `needs: { earlier: "score" }` is refused by `FD-V27` (a reference must not name its own node),
    // so the group's `needs` member reads a key the edge composes from the ENTRY's own result via
    // `"."`? No — `"."` is refused on an edge by `FD-V26`. So this flow gives `score` a predecessor.
    const def = {
      flowId: 'grouped', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'score' }] },
        { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [
          { when: { all: [
            { path: 'outcome.result.score', op: 'gte', value: 50 },
            { path: 'needs.earlier.flagged', op: 'eq', value: true },
          ] }, to: 'review', needs: { earlier: 'ingest' } },
          { to: 'publish' },
        ] },
        { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'done' }] },
        { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;

    const run = (ingestResult: unknown, scoreResult: unknown): string => {
      const scheduler = new FakeScheduler();
      const d = new Driver(def, {
        runId: 'r1', scheduler, createTask: (c: unknown) => c, predicates: NO_PREDICATES, ...TYPES,
      } as unknown as ConstructorParameters<typeof Driver>[1]);
      d.start({});
      scheduler.settle('r1:ingest:-:0', ingestResult);
      scheduler.settle('r1:score:-:0', scoreResult);
      const ids = scheduler.added.map((t) => t.id);
      return ids.length < 3 ? '(nothing)' : ids[2]!.split(':')[1]!;
    };

    equal(run({ flagged: true }, { score: 90 }), 'review', 'both members true');
    equal(run({ flagged: true }, { score: 10 }), 'publish', 'the OUTCOME member false');
    equal(run({ flagged: false }, { score: 90 }), 'publish', 'the NEEDS member false');
    // The two members read DIFFERENT roots, so a reading that resolved both against one root gives
    // the same answer for the two middle rows. That is why the pair above is four runs and not two.
    equal(run({ flagged: false }, { score: 10 }), 'publish', 'and neither');
  });

  test('`length` over an edge`s `needs` routes on an array`s size, and on an ABSENT key through its default', () => {
    const def = {
      flowId: 'lengthy', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'score' }] },
        { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [
          { when: { path: 'needs.earlier.tags', op: 'gt', value: 0, length: true, default: [] }, to: 'review', needs: { earlier: 'ingest' } },
          { to: 'publish' },
        ] },
        { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'done' }] },
        { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const run = (ingestResult: unknown): string => {
      const scheduler = new FakeScheduler();
      const d = new Driver(def, {
        runId: 'r1', scheduler, createTask: (c: unknown) => c, predicates: NO_PREDICATES, ...TYPES,
      } as unknown as ConstructorParameters<typeof Driver>[1]);
      d.start({});
      scheduler.settle('r1:ingest:-:0', ingestResult);
      scheduler.settle('r1:score:-:0', { score: 1 });
      const ids = scheduler.added.map((t) => t.id);
      return ids.length < 3 ? '(nothing)' : ids[2]!.split(':')[1]!;
    };
    equal(run({ tags: ['a'] }), 'review', 'a non-empty array');
    equal(run({ tags: [] }), 'publish', 'an empty one');
    equal(run({}), 'publish', 'and an ABSENT key, through the default `[]` — `?? []` exactly');
  });

  test('the NAME road is BYTE-UNCHANGED — two runs of one flow, with and without a declared `when`, dispatch identically', () => {
    // **W59's device**, and it is the item's Output (1): the evidence that the name road did not move
    // is a dispatch comparison rather than a sentence. One flow in two spellings whose predicates
    // AGREE on the payload, run on the same scheduler shape with the same run id.
    const named = flowWith({ predicate: 'isLowConfidence' });
    const declared = flowWith({ path: 'outcome.result.confidence', op: 'lt', value: 0.5 });
    const dispatchOf = (def: FlowDefinition, preds: ReadonlyMap<string, Predicate>) => {
      const scheduler = new FakeScheduler();
      const d = new Driver(def, {
        runId: 'r1', scheduler, createTask: (c: unknown) => c, predicates: preds, ...TYPES,
      } as unknown as ConstructorParameters<typeof Driver>[1]);
      d.start({});
      scheduler.settle('r1:score:-:0', { confidence: 0.4 });
      // **The ARRAY, not a string of it.** Two equal strings are one value to `===`, so an identity
      // control cannot exist over them — and identity is the only expression that refuses one side
      // being re-sourced to the other (v0.21, W78). Rule 8 probe `b1` is what measured that.
      return scheduler.added;
    };
    const withName = dispatchOf(named, new Map([['isLowConfidence',
      (c: { outcome: { result: unknown } }) => ((c.outcome.result as { confidence: number }).confidence < 0.5)]]));
    const withData = dispatchOf(declared, NO_PREDICATES);
    // **The IDENTITY control, and it comes BEFORE the claim.** `withData = withName` made the
    // equality below a tautology for ZERO; two separate runs are two separate arrays, so this is
    // the one expression that refuses it.
    ok(withName !== withData, 'the two sides are different VALUES — two runs, two arrays, never one read twice');
    equal(withName, withData,
      'the two roads dispatch the SAME task ids with the SAME payloads, byte for byte — so the ' +
      'declared road is the name road`s answer and not a second mechanism beside it');
    // **A SECOND, INDEPENDENT observer of the declared road** — obligation (c)'s LIMIT, and rule 8
    // probe `b1` is why: `withData = withName` made the equality above a tautology for ZERO, and no
    // control over either side can see that, because a re-sourced string is as equal as the string
    // it came from. `roadTaken` reaches the declared road by a different expression entirely, so a
    // probe that re-sources one leaves the other live.
    equal(roadTaken(declared, { confidence: 0.4 }), 'review',
      'and the declared road, read by a DIFFERENT expression over a DIFFERENT run, takes the guarded edge');
    equal(roadTaken(declared, { confidence: 0.9 }), 'publish', 'and the default edge above the threshold');
    ok(withName.length === 2, 'both actually dispatched two tasks — a pair of empty arrays is also equal');
    const disagreeing = dispatchOf(named, new Map([['isLowConfidence', () => false]]));
    equal(disagreeing.map((t) => t.id), ['r1:score:-:0', 'r1:publish:-:0'],
      'and a predicate that DISAGREES takes the OTHER road, so the equality above is a claim about ' +
      'the answer rather than about two runs of one thing');
  });

  test('ROUTING STAYS PURE — the evaluator reads its argument and writes nothing, and answers the same twice', () => {
    // **The sentence the adequacy reader is asked to falsify first** (the item's `What to be careful
    // of` 5). `FD-C3` gives each edge its own context and `ADR 0014` requires the fold's input
    // sequence to be the driver's; an evaluator that touched anything else has broken both.
    const scheduler = new FakeScheduler();
    const seen: unknown[] = [];
    const def = flowWith({ path: 'outcome.result.confidence', op: 'lt', value: 0.5 });
    const d = new Driver(def, {
      runId: 'r1', scheduler, createTask: (c: unknown) => c, predicates: NO_PREDICATES,
      now: () => 1_000, onFoldInput: (i: unknown) => seen.push(i), ...TYPES,
    } as unknown as ConstructorParameters<typeof Driver>[1]);
    d.start({});
    scheduler.settle('r1:score:-:0', { confidence: 0.4 });
    const first = JSON.stringify(seen);

    const scheduler2 = new FakeScheduler();
    const seen2: unknown[] = [];
    const d2 = new Driver(def, {
      runId: 'r1', scheduler: scheduler2, createTask: (c: unknown) => c, predicates: NO_PREDICATES,
      now: () => 1_000, onFoldInput: (i: unknown) => seen2.push(i), ...TYPES,
    } as unknown as ConstructorParameters<typeof Driver>[1]);
    d2.start({});
    scheduler2.settle('r1:score:-:0', { confidence: 0.4 });
    // **The fold-input sequence is also asserted AGAINST THE SPEC, for each run separately** —
    // obligation (c)'s LIMIT again, and probe `b4` is why: `equal(first, first)` cost ZERO. These
    // two read each run on its own, so a probe that collapses the comparison leaves them live.
    // Derived from `spec/flow-definition.md` section 3 and `spec/run-state.md` before either run:
    // the entry is dispatched, it settles, and the edge the comparison chose is dispatched.
    const EXPECTED: [string, string][] = [
      ['dispatched', 'r1:score:-:0'], ['outcome', 'r1:score:-:0'], ['dispatched', 'r1:review:-:0'],
    ];
    const shapeOfRun = (xs: unknown[]) => xs.map((i) => {
      const o = i as { kind: string; taskId?: string; record?: { taskId: string } };
      return [o.kind, o.taskId ?? o.record?.taskId ?? '?'] as [string, string];
    });
    equal(shapeOfRun(seen), EXPECTED, 'run 1`s fold inputs are what the spec says a decision produces');
    equal(shapeOfRun(seen2), EXPECTED, 'and run 2`s, asserted INDEPENDENTLY rather than against run 1 — ' +
      'rule 8 probe `b4` collapsed the two-run equality to `equal(first, first)` for ZERO, and no ' +
      'expression over those two values can refuse that; a derived expectation for each run can');
    ok(seen !== seen2, 'and the two are different ARRAYS — an identity control, so neither clause can be one list twice');
    equal(JSON.stringify(seen2), first,
      'two runs of one flow over one settlement produce the IDENTICAL fold-input sequence — which is ' +
      '`doc/concept.md` section 5`s invariant, and is what a declared predicate cannot break. The CLOCK ' +
      'is pinned on both runs and in the settlement detail, so what this compares is the routing and ' +
      'not the time: unpinned, the two differ by a millisecond and this case flakes (it passed on its ' +
      'first sample and failed on its second, which is section 5 rule 5 in this suite`s own test)');
    ok(seen.length > 0, 'and the sequence is not empty — a pair of empty logs is also identical');

    // The other half: the context a predicate is handed is FROZEN, so an evaluator that wrote to it
    // would throw rather than mutate. Asserted on the real driver's own `needs`, through a NAME.
    let frozen: boolean | null = null;
    const scheduler3 = new FakeScheduler();
    const d3 = new Driver(flowWith({ predicate: 'probe' }), {
      runId: 'r1', scheduler: scheduler3, createTask: (c: unknown) => c,
      predicates: new Map([['probe', (c: { needs: unknown }) => { frozen = Object.isFrozen(c.needs); return false; }]]),
      ...TYPES,
    } as unknown as ConstructorParameters<typeof Driver>[1]);
    d3.start({});
    scheduler3.settle('r1:score:-:0', { confidence: 0.4 });
    equal(frozen, true, 'the context`s `needs` is frozen, so nothing a predicate does can reach the run');
  });
});
