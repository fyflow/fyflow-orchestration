/**
 * **WHAT A SETTLEMENT COSTS, as COUNTS** — [W81](../../doc/work-items/w81-what-a-settlement-costs.md),
 * [P21](../../doc/plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md), at ladder L2 on
 * a fake scheduler.
 *
 * `examples/settlement-cost.ts` is the measurement and it is deliberately **not** a gate entry: a
 * cost is a property of a machine ([Q179](../../doc/questions/q179.md)), so a rung over one would
 * be a ratchet on hardware. **This file is what binds the two claims underneath it**, and it can,
 * because both are COUNTS rather than clocks:
 *
 *   1. **the switch** — `ADR 0060` rule 4 says the callback's presence IS the switch, and a
 *      consumer who supplies none pays for no check. Counted as *how many times the driver reads a
 *      worker's `outputSchema`*, which is the only observable there is: a check whose answer is
 *      discarded changes no record, no state and no dispatch, so nothing a run REPORTS can see it;
 *   2. **the handle** — [Q320](../../doc/questions/q320.md)'s `+1 structuredClone per settled
 *      task`. Counted by wrapping `structuredClone`, because P21's declaration step measured that
 *      nothing else can see a clone: BYTES give a clone and an alias the same length, and IDENTITY
 *      is confounded because `foldInputs()` is itself `Object.freeze(this.inputs.map(freezeInput))`
 *      and clones on every call.
 *
 * **Every expected value is derived from the number of settlements the case drives**, which this
 * file writes, and never from a reading.
 */
import { equal, ok, suite } from '../harness.ts';
import { Driver, type NonconformingResult } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { FlowDefinition, JsonSchema } from '../../src/definition/types.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';

class FakeScheduler {
  readonly added: { id: string }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push(task as { id: string }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  settle(id: string, state: 'done' | 'failed', over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', detail);
    else this.fire('task.failed', detail);
  }
  private fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
}

const OUT: JsonSchema = { type: 'object', required: ['score'], properties: { score: { type: 'integer' } } };

/**
 * **A schema that counts its own reads.** The accessor is on a KEY of the schema rather than on
 * `outputSchema` itself, and at ladder L6 that is forced: `src/scheduler/runtime.ts`'s
 * `resolveWorkerUrl` spreads the worker ENTRY to rewrite its url, and a spread materialises an
 * accessor — *what crosses a copy is data*, which is `OR-R11`'s own sentence applied to a schema.
 * Here nothing spreads, and the accessor is placed at the same depth anyway so that this suite and
 * `examples/settlement-cost.ts` count the same thing.
 */
function countingSchema(counts: { n: number }): JsonSchema {
  const held = OUT.type;
  const s: Record<string, unknown> = { ...(OUT as Record<string, unknown>) };
  delete s.type;
  Object.defineProperty(s, 'type', { enumerable: true, configurable: true, get() { counts.n += 1; return held; } });
  return s as JsonSchema;
}

const t = (id: string, to: string) => ({ id, kind: 'task', type: 'Checked', edges: [{ to }] });
const END = { id: 'done', kind: 'end', outcome: 'completed' };

/** A chain of `n` task nodes, so the number of settlements is a number this file writes. */
function chain(n: number): FlowDefinition {
  const nodes: unknown[] = [];
  for (let i = 0; i < n; i++) nodes.push(t(`n${i}`, i + 1 < n ? `n${i + 1}` : 'done'));
  nodes.push(END);
  return { flowId: 'cost', version: 1, entry: 'n0', nodes: nodes as FlowDefinition['nodes'] };
}

/**
 * **A MAP region** — the shape the two tests above cannot reach. `a` returns an array under `items`
 * and the driver opens one branch per element, so the number of settlements comes from the DATA
 * exactly as it does at ladder L6.
 */
const MAPFLOW: FlowDefinition = {
  flowId: 'cost-map',
  version: 1,
  entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'Checked', edges: [{ to: 'm' }] },
    { id: 'm', kind: 'map', over: 'items', branch: 'each' },
    { id: 'each', kind: 'task', type: 'Checked', edges: [{ to: 'j' }] },
    { id: 'j', kind: 'join', of: 'm', edges: [{ to: 'done' }] },
    END,
  ] as FlowDefinition['nodes'],
};

interface Built { d: Driver; scheduler: FakeScheduler; reports: NonconformingResult[] }

function build(def: FlowDefinition, opts: { schema: JsonSchema; report?: boolean; fold?: boolean }): Built {
  const scheduler = new FakeScheduler();
  const reports: NonconformingResult[] = [];
  const d = new Driver(def, {
    runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(),
    workers: { checked: { url: 'test://checked', outputSchema: opts.schema } },
    nodeTypes: { Checked: { worker: 'checked' } },
    joinPolicy: liveToken as JoinPolicy,
    ...(opts.report ? { onNonconformingResult: (f: NonconformingResult) => { reports.push(f); } } : {}),
    ...(opts.fold ? { onFoldInput: (_i: FoldInput) => {} } : {}),
  });
  return { d, scheduler, reports };
}

/** Drive `n` settlements of a chain of `n`, each returning a value the schema ACCEPTS. */
function runChain(b: Built, n: number): void {
  b.d.start({ score: 0 });
  for (let i = 0; i < n; i++) b.scheduler.settle(`r1:n${i}:-:0`, 'done', { result: { score: i } });
}

suite('W81 — the SWITCH is the callback, counted: a consumer who supplies none pays for no check', (test) => {
  /**
   * **The claim, and the baseline is a SECOND RUN rather than a construction count.** With the
   * check off, the number of times the driver reads a worker's `outputSchema` does not depend on
   * how many tasks settled — so two runs settling different numbers read it the same number of
   * times. `examples/settlement-cost.ts`'s first cut asserted against a CONSTRUCTION count and was
   * red on its own first run, because `rt.start` calls `new Driver`, which runs `checkRegistry`
   * over every worker entry a second time. *(That sentence read "because `start()` reads the schema
   * too at `FD-R4`'s boundary" — false: `FD-R4` at `start()` reads the entry worker's
   * **`inputSchema`** (`src/driver/driver.ts`) and never an output schema. The baseline was right
   * and its stated cause was the negation of its own evidence — W81's conformity reader, W46's
   * shape.)*
   *
   * **This is what separates the shipped guard from one that walks `findings` for everybody and
   * throws the answer away.** That shape changes no record, no terminal state and no dispatch, so
   * it is invisible to every other assertion in this repository — W80 declared it as the ceiling
   * `z1` and dated it to this item.
   */
  test('with the check OFF the schema is read the SAME number of times however many tasks settle', () => {
    const readings: number[] = [];
    const settled: number[] = [];
    for (const n of [2, 6]) {
      const counts = { n: 0 };
      const b = build(chain(n), { schema: countingSchema(counts) });
      runChain(b, n);
      readings.push(counts.n);
      settled.push(b.d.snapshot().filter((r) => r.kind === 'outcome' && r.terminalState === 'done').length);
    }
    equal(settled, [2, 6], 'the two runs settle different numbers of tasks — the control for the claim below');
    equal(readings[0], readings[1],
      'with no `onNonconformingResult` the driver reads a worker`s outputSchema a number of times ' +
      'that does not depend on the settlements: ADR 0060 rule 4, the callback IS the switch');
    ok(readings[0]! > 0, 'and the accessor is installed — a schema nobody ever reads would make the equality above vacuous');
  });

  /**
   * The positive case of the clause above, and the proportionality that says *once per settlement*
   * rather than *once somewhere*. Two chain lengths, so a driver that checked the first settlement
   * only would be red.
   */
  test('with the check ON the schema is read a FIXED number of times MORE, per settled result', () => {
    const per: number[] = [];
    const lengths: number[] = [];
    for (const n of [2, 6]) {
      lengths.push(n);
      const off = { n: 0 };
      runChain(build(chain(n), { schema: countingSchema(off) }), n);
      const on = { n: 0 };
      const b = build(chain(n), { schema: countingSchema(on), report: true });
      runChain(b, n);
      ok(on.n > off.n, `at ${n} settlements the check ON read the schema no more often than OFF (${on.n} against ${off.n})`);
      per.push((on.n - off.n) / n);
    }
    // **The control, over the OBSERVED side** (`doc/workflow.md` rule 8 (d), v0.21). Both siblings
    // of this test carry one and this one did not: with the two chain lengths made equal the
    // equality below compares a run with itself and `per[0] > 0` is exactly as true as before —
    // W81's adequacy reader, measured at ZERO.
    equal(lengths, [2, 6], 'the two runs drive DIFFERENT numbers of settlements — the control for the equality below');
    equal(per[0], per[1], 'the extra reads per settled result are the same at two chain lengths — the check runs once per settlement');
    ok(per[0]! > 0, 'and that number is positive, which is what makes the equality above a proportionality rather than two zeroes');
  });

  /**
   * **THE SHAPES — a MAP REGION, which a chain cannot reach** (`doc/workflow.md` rule 8 obligation
   * (a), the shapes clause). W81's adequacy reader measured that the two tests above drive a plain
   * chain, so *once per checked settlement* was asserted at ONE shape: a driver that reported only
   * outside a region cost **zero** here, and the three failures it produced were all in W80's
   * behavioural suite. The artifact covers a map region on real workers and is not a gate entry, so
   * without this the region half of the COST claim was carried by nothing of W81's that the gate
   * runs.
   *
   * The same claim, at two arities: N map instances settle, and the reads rise by the same amount
   * per settlement they do on a chain.
   */
  test('THE SHAPES: a MAP REGION — N instances, and the per-settlement cost is the chain`s', () => {
    const per: number[] = [];
    const settledBy: number[] = [];
    const offBy: number[] = [];
    for (const items of [['p', 'q'], ['p', 'q', 'r', 's']]) {
      const readings: number[] = [];
      for (const report of [false, true]) {
        const counts = { n: 0 };
        const b = build(MAPFLOW, { schema: countingSchema(counts), report });
        b.d.start({ score: 0 });
        b.scheduler.settle('r1:a:-:0', 'done', { result: { score: 0, items } });
        items.forEach((_, i) => b.scheduler.settle(`r1:each:${i}:0`, 'done', { result: { score: i } }));
        readings.push(counts.n);
        if (report) settledBy.push(b.d.snapshot().filter((r) => r.kind === 'outcome' && r.terminalState === 'done').length);
      }
      offBy.push(readings[0]!);
      per.push((readings[1]! - readings[0]!) / (items.length + 1));
    }
    equal(settledBy, [3, 5], 'the two arities settle DIFFERENT numbers of tasks — the entry plus one per item');
    equal(offBy[0], offBy[1], 'with the check OFF a map region costs no reads either, however many instances settle');
    equal(per[0], per[1], 'and with it ON the cost per settled instance is the same at both arities');
    equal(per[0], 3, 'which is the chain`s number: a map instance is a settlement like any other — ADR 0060 rule 4 ranges over settlements, not over topologies');
  });

  /**
   * **`done` only** — ADR 0060 rule 3 as a COST rather than as a behaviour. `OR-R2` writes
   * `result: null` for a failure, so a failed settlement must not even reach the schema.
   */
  test('a FAILED settlement costs no read at all, with the check ON — ADR 0060 rule 3 priced', () => {
    const counts = { n: 0 };
    const b = build(chain(1), { schema: countingSchema(counts), report: true });
    b.d.start({ score: 0 });
    const before = counts.n;
    b.scheduler.settle('r1:n0:-:0', 'failed', { error: 'boom' });
    equal(counts.n, before, 'a `failed` settlement reads no output schema: OR-R2 writes result: null and there is nothing to check');
    equal(b.reports.length, 0, 'and reports nothing, which is the behavioural half of the same clause');
  });
});

suite('W81 — Q320: the always-on handle costs exactly one structuredClone per settled task', (test) => {
  /**
   * **Counting the calls, because nothing else can see a clone** — P21's declaration step measured
   * four probes that measured the apparatus before one measured the thing, and the one that
   * answered it counted. The wrapper is installed around the run and restored in a `finally`,
   * because it is inside every expression anyone would otherwise time.
   */
  function clonesFor(n: number, fold: boolean): number {
    const real = globalThis.structuredClone;
    let calls = 0;
    (globalThis as { structuredClone: typeof structuredClone }).structuredClone =
      ((v: unknown, o?: unknown) => { calls += 1; return (real as (a: unknown, b?: unknown) => unknown)(v, o); }) as typeof structuredClone;
    try {
      runChain(build(chain(n), { schema: OUT, fold }), n);
      return calls;
    } finally {
      (globalThis as { structuredClone: typeof structuredClone }).structuredClone = real;
    }
  }

  /**
   * `src/driver/driver.ts`'s `append` calls `freezeInput` only where an `onFoldInput` is present,
   * and since [ADR 0058](../../doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)
   * `runtime.start` installs one on EVERY run — so a consumer who wants none of it pays one deep
   * copy of every result they never asked for. **The opt-out is `new Driver(flow, { ...runtime.registry, … })`,
   * which is what this suite drives: the two arms differ in that option and in nothing else.**
   */
  test('the difference is the settlement count, at two chain lengths', () => {
    const measured: number[] = [];
    for (const n of [2, 6]) {
      const without = clonesFor(n, false);
      const withHandle = clonesFor(n, true);
      equal(withHandle - without, n,
        `a chain of ${n} costs exactly ${n} extra structuredClone calls when an onFoldInput is installed — ` +
        'one per settled task, which is one more copy of everything OR-R2 already copies');
      measured.push(without);
    }
    ok(measured[0]! > 0, 'and the arm WITHOUT the handle still clones — OR-R2`s own copy, which is what the extra one is a second of');
    ok(measured[1]! > measured[0]!, 'and a longer chain clones more, so the equality above is not two constants');
  });
});
