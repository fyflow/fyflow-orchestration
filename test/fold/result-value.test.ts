/**
 * Ladder L1 and L2 — **`OR-R11`: a result is a VALUE, not an OBJECT.**
 * [W54](../../doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md)
 * under [P15](../../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md),
 * answering [Q22](../../doc/open-questions.md).
 *
 * **Every expected value here is derived from `spec/outcome-record.md` section 4 and
 * never from output:**
 *
 * | what | from |
 * |---|---|
 * | which shapes are REFUSED | `OR-R6` — `structuredClone` throws, the run fails with `UncloneableResult` |
 * | which are cloned FAITHFULLY | section 4's *"`structuredClone` faithfully preserves `Date`, `Map`, `Set`, `RegExp`, `BigInt`, typed arrays and `undefined`"* |
 * | which are cloned LOSSILY | `OR-R11` — fields cross, behaviour does not |
 * | what the next node receives | `FD-C1` and ADR 0040 rule 1: a node with no `needs` receives the previous node's `result` unchanged |
 * | that nothing is reported | `OR-R11`'s own *no error and no report*, and `OR-R6` is the only refusal on this path |
 *
 * ---
 *
 * ### Why the boundary is asserted in ALL FIVE RUNTIMES, and not in Node alone
 *
 * `structuredClone` is a host function, not a language one, and
 * [P15](../../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md) fact 7
 * measured it in **Node 24 alone**. That plan's prediction 3 states its own way of
 * being wrong as *"`structuredClone` refusing a class instance in a runtime this
 * library targets"* — which would make `OR-R6` fire exactly where `OR-R11` says it
 * does not, and would make this rule false in a runtime `RT-R1` requires green.
 * **So the discriminating assertion runs wherever L1 runs**: node, deno, chromium,
 * firefox and webkit. It is the cheapest possible answer to a fact measured in one
 * runtime and stated of five.
 *
 * ### Why this file is in `test/fold/` and not in `test/driver/`
 *
 * `OR-R11` is about what a result **is by the time anything reads it**, and the fold
 * is what reads it — `RunState.nodes[*].result` is the surface the rule is about.
 * The L2 case below drives a real `Driver` because the end-to-end claim needs one;
 * `test/driver/**` is [W53](../../doc/work-items/w53-what-a-run-retains-that-nothing-reads.md)'s
 * `Owns` and this item takes no exception into it.
 */
import { equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;
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
  settle(id: string, state: 'done' | 'failed', over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    for (const fn of this.listeners.get(state === 'done' ? 'task.completed' : 'task.failed') ?? []) fn({ detail });
  }
}

/** A two-task chain: `t0` settles, `t1` receives what it returned (`FD-C1`). */
const CHAIN: FlowDefinition = {
  flowId: 'w54-chain', version: 1, entry: 't0',
  nodes: [
    { id: 't0', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 't1' }] },
    { id: 't1', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

function harness() {
  const scheduler = new FakeScheduler();
  const failures: { kind: string; message: string }[] = [];
  const driver = new Driver(CHAIN, {
    runId: 'r1', scheduler, createTask: (c) => c,
    predicates: new Map() as never, workerTypes: reg.workerTypes,
    joinPolicy: liveToken as JoinPolicy,
    onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
  });
  return { scheduler, driver, failures };
}

/** A class with behaviour — the shape `spec/outcome-record.md` section 4 said would THROW. */
class Score {
  readonly value: number;
  constructor(value: number) { this.value = value; }
  isHigh(): boolean { return this.value > 0.5; }
}

/**
 * **What `structuredClone` did, in three answers rather than two.** `refused` is
 * `OR-R6`'s case; `faithful` keeps the prototype; `lossy` is `OR-R11`'s — it crossed,
 * and it came back a plain `Object`.
 */
function outcomeOf(make: () => unknown): 'refused' | 'faithful' | 'lossy' {
  const v = make();
  let c: unknown;
  try {
    c = structuredClone(v);
  } catch {
    return 'refused';
  }
  if (v === null || typeof v !== 'object') return 'faithful';
  return Object.getPrototypeOf(v) === Object.getPrototypeOf(c) ? 'faithful' : 'lossy';
}

suite('OR-R11 — a result is a VALUE, and the boundary has THREE answers', (test) => {
  /**
   * **The rule's own table, in every runtime L1 runs in.** Each row is
   * `spec/outcome-record.md` section 4's, and the expected value is the document's
   * word rather than what a run printed.
   */
  test('the three-way boundary is what section 4 says it is', () => {
    const rows: [string, () => unknown, 'refused' | 'faithful' | 'lossy'][] = [
      // OR-R6's row: the loud case.
      ['a function', () => () => 1, 'refused'],
      ['an object HOLDING a function', () => ({ f: () => 1 }), 'refused'],
      ['a Symbol', () => Symbol('s'), 'refused'],
      ['a Promise', () => Promise.resolve(1), 'refused'],
      ['a WeakMap', () => new WeakMap(), 'refused'],
      // Section 4's "broader than JSON" row: these are conformant results.
      ['a plain object', () => ({ a: 1 }), 'faithful'],
      ['an array', () => [1, 2], 'faithful'],
      ['a Date', () => new Date(0), 'faithful'],
      ['a Map', () => new Map([['a', 1]]), 'faithful'],
      ['a Set', () => new Set([1]), 'faithful'],
      ['a RegExp', () => /x/g, 'faithful'],
      ['a typed array', () => new Uint8Array([1, 2]), 'faithful'],
      ['a BigInt', () => 1n, 'faithful'],
      ['undefined', () => undefined, 'faithful'],
      ['null', () => null, 'faithful'],
      // A CYCLIC object clones and its cycle survives - section 4's own claim.
      ['a cyclic object', () => { const o: Record<string, unknown> = {}; o.self = o; return o; }, 'faithful'],
      // OR-R11's row: the quiet case, which section 4 called a throw until v0.9.
      ['a class instance with a method', () => new Score(0.9), 'lossy'],
      ['a class instance with a getter', () => new (class { get v() { return 1; } })(), 'lossy'],
      ['Object.create(proto)', () => Object.create({ m() { return 1; } }), 'lossy'],
    ];
    for (const [name, make, want] of rows) {
      equal(outcomeOf(make), want,
        `OR-R11 / OR-R6 — section 4 says ${name} is ${want}. A runtime that answers differently ` +
        'makes one of those two rules false HERE, which is why this runs in all five',
      );
    }
    // The DISCRIMINATING pair, asserted as a pair: the three answers are three, and a
    // suite that collapsed `lossy` into `faithful` would still pass every row above
    // if `outcomeOf` stopped distinguishing them.
    equal(new Set(rows.map((r) => r[2])).size, 3,
      'three distinct answers are exercised. Section 4 named TWO of them until v0.9, and the ' +
      'one it omitted is the one with no error and no report',
    );
    equal(outcomeOf(() => new Score(0.9)) === outcomeOf(() => ({ value: 0.9 })), false,
      'and a class instance and the plain object with the same fields get DIFFERENT answers, ' +
      'which is the whole of what `lossy` means — collapse that and the rule says nothing',
    );
  });

  /**
   * **A cyclic result survives WITH ITS CYCLE**, which section 4 claims and nothing
   * asserted. It is in the `faithful` row above by prototype; this is the property
   * that makes it faithful rather than merely accepted.
   */
  test('a cyclic result keeps its cycle, which is what `faithful` means for it', () => {
    const o: Record<string, unknown> = { tag: 'w54' };
    o.self = o;
    const c = structuredClone(o) as Record<string, unknown>;
    equal(c.tag, 'w54', 'the fields crossed');
    ok(c.self === c, 'and the cycle is a cycle in the COPY, not a second object or a throw');
    ok(c.self !== o, 'while being a different object from the original — OR-R2 is a deep copy');
  });

  /**
   * **`OR-R11` end to end, through a real `Driver`.** This is the claim a worker
   * author needs and no rung asserted: what the NEXT node receives.
   */
  test('a worker returning a class instance hands its successor the FIELDS and not the BEHAVIOUR', () => {
    const h = harness();
    h.driver.start({});
    equal(h.scheduler.added.map((t) => t.id), ['r1:t0:-:0'], 'the entry task, and nothing else');

    const returned = new Score(0.9);
    ok(returned.isHigh(), 'the worker`s own object answers isHigh() — the behaviour exists before the hop');
    h.scheduler.settle('r1:t0:-:0', 'done', { result: returned });

    const received = h.scheduler.added.find((t) => t.id === 'r1:t1:-:0')?.payload as
      { value?: number; isHigh?: unknown } | undefined;
    ok(received !== undefined, 'FD-C1 — t1 was dispatched and receives t0`s result unchanged');
    equal(received?.value, 0.9, 'OR-R11 — the FIELDS crossed');
    equal(typeof received?.isHigh, 'undefined', 'and the BEHAVIOUR did not');
    equal(received instanceof Score, false, 'instanceof is false: the prototype is Object.prototype');
    equal(Object.getPrototypeOf(received as object) === Object.prototype, true,
      'which is the same fact stated the way the rule states it',
    );
    equal(h.failures, [],
      'and NOTHING was reported — OR-R6 is the only refusal on this path and it did not fire. ' +
      'That silence is the rule rather than a gap, and it is why section 4 says so',
    );
  });

  /**
   * **The same value, in `RunState`.** The rule is about what a result IS, so it has
   * to hold at the surface a consumer reads as well as at the edge hop — the two are
   * the same object (`RN-R13`).
   */
  test('and RunState reports the same value, so the loss is not the edge hop`s alone', () => {
    const h = harness();
    h.driver.start({});
    h.scheduler.settle('r1:t0:-:0', 'done', { result: new Score(0.25) });

    const state = fold(h.driver.foldInputs());
    const node = state.nodes['r1:t0:-:0'];
    ok(node !== undefined, 'RN-R4 — one entry per dispatched task');
    equal((node?.result as { value?: number })?.value, 0.25, 'the field is what RunState carries');
    equal(typeof (node?.result as { isHigh?: unknown })?.isHigh, 'undefined',
      'and the method is gone here too, so a consumer reading run state sees exactly what the ' +
      'next node saw. OR-R11 holds at both surfaces or it is not a rule about the VALUE',
    );
    equal(state.outcome, 'running', 'RN-R10 — t1 is dispatched and unsettled, which outranks completed');
  });

  /**
   * **`OR-R6` still fires, and this is the control for the row above.** Without it,
   * *nothing was reported* would be a claim about a driver that reports nothing at
   * all.
   */
  test('OR-R6 is the loud half and it still fires — the control for the silence above', () => {
    const h = harness();
    h.driver.start({});
    h.scheduler.settle('r1:t0:-:0', 'done', { result: { callback: () => 1 } });

    equal(h.failures.map((f) => f.kind), ['UncloneableResult'],
      'OR-R6 — structuredClone throws and the run fails, naming the task id',
    );
    ok(h.failures[0]?.message.includes('r1:t0:-:0'), 'and the message names it');
    equal(h.scheduler.added.map((t) => t.id), ['r1:t0:-:0'],
      'and t1 is NOT dispatched: the run stopped rather than routing a value it could not log',
    );
    equal(fold(h.driver.foldInputs()).outcome, 'stopped', 'RN-R8 — stopped outranks everything');
  });

  /**
   * **The price of bounding `RunState.nodes[*].result` is a VOCABULARY**, and this is
   * the assertion behind that sentence in section 4. Both candidate encodings for
   * *withheld* are already reachable and already mean *it returned nothing*.
   */
  test('`null` and `undefined` are BOTH already reachable results, which is what the bound would cost', () => {
    const seen = new Map<string, unknown>();
    for (const [label, over] of [
      ['returned null', { result: null }],
      ['returned undefined', { result: undefined }],
      ['no result key at all', {}],
    ] as [string, Record<string, unknown>][]) {
      const h = harness();
      h.driver.start({});
      h.scheduler.settle('r1:t0:-:0', 'done', over);
      const node = fold(h.driver.foldInputs()).nodes['r1:t0:-:0'];
      equal(node?.state, 'done',
        label + ' — the task SUCCEEDED, so the `state` field does not disambiguate it');
      seen.set(label, node?.result);
    }
    equal(seen.get('returned null'), null, 'a worker returning null gives result null');
    equal(seen.get('returned undefined'), undefined, 'a worker returning undefined gives result undefined');
    equal(seen.get('no result key at all'), undefined, 'and so does a detail carrying no result key');

    // A FAILED task also carries null - so `state` separates that one and only that one.
    const h = harness();
    h.driver.start({});
    h.scheduler.settle('r1:t0:-:0', 'failed', { result: { big: 1 }, error: 'boom' });
    const failed = fold(h.driver.foldInputs()).nodes['r1:t0:-:0'];
    equal(failed?.result, null, 'OR-R2`s guard — a task that did not succeed carries null whatever it returned');
    equal(failed?.state, 'failed', 'and THAT one `state` does separate');

    ok(true,
      'So within state `done`, both null and undefined already mean *it returned nothing*, and ' +
      'a withheld result would be a THIRD meaning with no encoding left. That is what section 4 ' +
      'prices, and it is why the bound is a shape change rather than a flag',
    );
  });
});
