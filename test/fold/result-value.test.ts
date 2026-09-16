/**
 * Ladder L1 and L2 — **`OR-R11`: a result is a VALUE, not an OBJECT**, and
 * **`OR-R12`**: an uncloneable RESOLUTION value throws to its caller.
 * [W54](../../doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md)
 * under [P15](../../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md),
 * answering [Q22](../../doc/open-questions.md).
 *
 * **Every expected value here is derived from `spec/outcome-record.md` section 4 and
 * never from output**, and the boundary table below is **read out of that document**
 * rather than copied from it — `doc/workflow.md` section 5 rule 8 obligation (e)'s
 * third shape, *a LIST is a claim about another list*, compared BOTH WAYS.
 *
 * ---
 *
 * ### What each row asserts, and why it is not a three-way label
 *
 * A first version classified every shape by comparing top-level prototypes and called
 * the three answers `refused` / `faithful` / `lossy`. **Both of W54's readers took
 * that apart, from opposite ends**, and the classifier was wrong twice over:
 *
 * - `faithful` meant *did not throw and kept its prototype*. It **never checked that
 *   the value crossed** — measured, the classifier's clone could be replaced with an
 *   Invalid `Date`, an empty `Map`, an empty `Set` or an empty array and every row
 *   still read `faithful`, for **zero** failures.
 * - A **plain `Error`** keeps `Error.prototype` and still drops its own fields, and a
 *   **frozen plain object** keeps its prototype and arrives unfrozen. So prototype
 *   identity is not what *intact* means, and the three-way label was hiding four
 *   silent losses inside its middle row.
 * - The classifier was **the very predicate section 4 declines** four paragraphs
 *   later *because it is blind to the nested case* — and the table's lossy row names
 *   the nested case. The suite defined the oracle, so the disagreement was invisible.
 *
 * **So each row now asserts the property its own row names**: a refusal for the
 * refused rows, a content ROUND TRIP for the intact ones, and the NAMED loss for each
 * lossy one. There is no label to collapse.
 *
 * ### Why the boundary runs in ALL FIVE RUNTIMES
 *
 * `structuredClone` is a host function, not a language one, and P15 fact 7 measured it
 * in **Node 24 alone**. That plan's prediction 3 states its own way of being wrong as
 * *"`structuredClone` refusing a class instance in a runtime this library targets"* —
 * which would make `OR-R6` fire exactly where `OR-R11` says it does not. So this runs
 * wherever L1 runs: node, deno, chromium, firefox and webkit.
 *
 * ### Why `normalizeEvent` is called directly
 *
 * `OR-R11` says the loss happens **at `OR-R2`'s clone**, and there are THREE clone
 * sites on the path to a consumer — `OR-R2` in the listener, `cloneValue` at the edge
 * hop, and `cloneRecord` in `snapshot()`/`onFoldInput`. A test that reads the payload
 * or the log is satisfied by any one of them: measured, **deleting `cloneValue`
 * entirely left the whole of this suite green**. `normalizeEvent` is `OR-R2`'s own
 * site and the only place the attribution can be pinned, so the identity assertion
 * below is made there. W54's adequacy reader.
 */
import { equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import { normalizeEvent, UncloneableResult } from '../../src/driver/listener.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;
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

const CHAIN: FlowDefinition = {
  flowId: 'w54-chain', version: 1, entry: 't0',
  nodes: [
    { id: 't0', kind: 'task', type: 'IngestWorker', edges: [{ to: 't1' }] },
    { id: 't1', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

function harness() {
  const scheduler = new FakeScheduler();
  const failures: { kind: string; message: string }[] = [];
  const driver = new Driver(CHAIN, {
    runId: 'r1', scheduler, createTask: (c) => c,
    predicates: new Map() as never, workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
    joinPolicy: liveToken as JoinPolicy,
    onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
  });
  return { scheduler, driver, failures };
}

/** A class with behaviour — the shape section 4 said would THROW until v0.9. */
class Score {
  readonly value: number;
  constructor(value: number) { this.value = value; }
  isHigh(): boolean { return this.value > 0.5; }
}

const clone = (v: unknown): unknown => structuredClone(v);
const threw = (f: () => unknown): boolean => {
  try { f(); return false; } catch { return true; }
};

/**
 * **One entry per row of section 4's boundary table**, keyed by that table's own first
 * cell. `assert` is what the row's *what does NOT cross* column claims, made
 * executable — never a label, so there is nothing to collapse.
 */
/**
 * **A SECOND, independent record that every `assert` ran** — `doc/workflow.md`
 * section 5 rule 8 obligation (c)'s LIMIT. The loop below keeps its own list of what
 * it asserted, and re-sourcing THAT list to `SHAPES` costs nothing on its own, because
 * a clause with one observer cannot corroborate itself. This counter is incremented
 * inside each wrapped `assert`, so it survives a probe that rewrites the loop's record
 * and the compound — slice the loop AND re-source its list — is caught.
 */
let assertsRun = 0;

const RAW_SHAPES: { key: string; verdict: 'refused' | 'intact' | 'lossy'; assert: () => void }[] = [
  // ---- refused: OR-R6 ----
  { key: 'a function', verdict: 'refused', assert: () => ok(threw(() => clone(() => 1)), 'a function throws') },
  {
    key: 'an object holding a function', verdict: 'refused',
    assert: () => ok(threw(() => clone({ f: () => 1 })), 'so does an object holding one — the walk is deep'),
  },
  { key: 'a Symbol', verdict: 'refused', assert: () => ok(threw(() => clone(Symbol('s'))), 'a Symbol throws') },
  { key: 'a Promise', verdict: 'refused', assert: () => ok(threw(() => clone(Promise.resolve(1))), 'a Promise throws') },
  { key: 'a WeakMap', verdict: 'refused', assert: () => ok(threw(() => clone(new WeakMap())), 'a WeakMap throws') },

  // ---- intact: the value CROSSES. Each asserts a content round trip, never a label.
  {
    key: 'a plain object', verdict: 'intact',
    assert: () => {
      const v = { a: 1, nested: { b: [2, 3] } };
      const c = clone(v) as typeof v;
      equal(c, v, 'every own enumerable key crossed, to any depth');
      ok(c !== v && c.nested !== v.nested, 'and it is a DEEP copy, not an alias');
    },
  },
  {
    key: 'an array', verdict: 'intact',
    assert: () => {
      const c = clone([1, 'x', { k: 2 }]) as unknown[];
      equal(c, [1, 'x', { k: 2 }], 'the ELEMENTS crossed — an empty array would pass a prototype check');
      equal(c.length, 3, 'and the length with them');
    },
  },
  {
    key: 'a Date', verdict: 'intact',
    assert: () => {
      const c = clone(new Date(86_400_000)) as Date;
      ok(c instanceof Date, 'it is still a Date');
      equal(c.getTime(), 86_400_000, 'and it is the SAME instant — an Invalid Date passes instanceof');
    },
  },
  {
    key: 'a Map', verdict: 'intact',
    assert: () => {
      const c = clone(new Map<string, unknown>([['a', 1], ['b', { k: 2 }]])) as Map<string, unknown>;
      equal(c.size, 2, 'the ENTRIES crossed — an empty Map is still a Map');
      equal(c.get('b'), { k: 2 }, 'including nested values');
    },
  },
  {
    key: 'a Set', verdict: 'intact',
    assert: () => {
      const c = clone(new Set([1, 2, 3])) as Set<number>;
      equal(c.size, 3, 'the members crossed');
      ok(c.has(2), 'and they are the same members');
    },
  },
  {
    key: 'a RegExp', verdict: 'intact',
    assert: () => {
      const c = clone(/ab+c/gi) as RegExp;
      equal(c.source, 'ab+c', 'the source crossed');
      equal(c.flags, 'gi', 'and the flags');
    },
  },
  {
    key: 'a typed array', verdict: 'intact',
    assert: () => {
      const c = clone(new Uint8Array([7, 8, 9])) as Uint8Array;
      equal(c.length, 3, 'the length crossed');
      equal([...c], [7, 8, 9], 'and the bytes');
    },
  },
  {
    key: 'a BigInt', verdict: 'intact',
    assert: () => equal(clone(90_071_992_547_409_931n), 90_071_992_547_409_931n, 'a BigInt crosses by value'),
  },
  { key: 'undefined', verdict: 'intact', assert: () => equal(clone(undefined), undefined, 'undefined crosses — it is not JSON') },
  { key: 'null', verdict: 'intact', assert: () => equal(clone(null), null, 'null crosses') },
  {
    key: 'a cyclic object', verdict: 'intact',
    assert: () => {
      const o: Record<string, unknown> = { tag: 'w54' };
      o.self = o;
      const c = clone(o) as Record<string, unknown>;
      equal(c.tag, 'w54', 'the fields crossed');
      ok(c.self === c, 'and the cycle is a cycle IN THE COPY — section 4`s own claim');
      ok(c.self !== o, 'pointing at the copy rather than back at the original');
    },
  },

  // ---- lossy: it crossed, and something did not. Each asserts the NAMED loss.
  {
    key: 'a class instance with a method', verdict: 'lossy',
    assert: () => {
      const c = clone(new Score(0.9)) as Score;
      equal(c.value, 0.9, 'the field crossed');
      equal(typeof (c as { isHigh?: unknown }).isHigh, 'undefined', 'and the METHOD did not');
      equal(c instanceof Score, false, 'so instanceof is false');
    },
  },
  {
    key: 'a class instance with a getter', verdict: 'lossy',
    assert: () => {
      const v = new (class { get v() { return 41 + 1; } })();
      const c = clone(v) as { v?: unknown };
      equal(Object.getOwnPropertyDescriptor(v, 'v'), undefined, 'the accessor is on the PROTOTYPE');
      equal(c.v, undefined, 'so it does not cross at all — the prototype went with it');
    },
  },
  {
    key: 'a frozen class instance', verdict: 'lossy',
    assert: () => {
      const c = clone(Object.freeze(new Score(0.1))) as Score;
      equal(c.value, 0.1, 'the field crossed');
      equal(c instanceof Score, false, 'the prototype did not');
      equal(Object.isFrozen(c), false, 'and NEITHER did the frozen-ness');
    },
  },
  {
    key: 'a frozen plain object', verdict: 'lossy',
    assert: () => {
      const v = Object.freeze({ a: 1 });
      const c = clone(v) as { a: number };
      equal(c.a, 1, 'the data crossed');
      equal(Object.getPrototypeOf(c) === Object.prototype, true, 'and the prototype is unchanged');
      equal(Object.isFrozen(c), false,
        'yet the frozen-ness is GONE — which is why `intact` cannot mean `kept its prototype`',
      );
    },
  },
  {
    key: 'an object with a non-enumerable own property', verdict: 'lossy',
    assert: () => {
      const v: Record<string, unknown> = { a: 1 };
      Object.defineProperty(v, 'secret', { value: 9, enumerable: false });
      equal(v.secret, 9, 'the original has it');
      equal((clone(v) as Record<string, unknown>).secret, undefined, 'and the copy does not — silently');
    },
  },
  {
    key: 'an object with a symbol-keyed property', verdict: 'lossy',
    assert: () => {
      const v = { [Symbol('k')]: 1, a: 2 };
      equal(Object.getOwnPropertySymbols(v).length, 1, 'the original has one symbol key');
      equal(Object.getOwnPropertySymbols(clone(v) as object).length, 0, 'and the copy has none');
    },
  },
  {
    key: 'Object.create(proto)', verdict: 'lossy',
    assert: () => {
      const v = Object.create({ m() { return 1; } }) as { m?: unknown };
      equal(typeof v.m, 'function', 'the original reaches its prototype`s method');
      equal(typeof (clone(v) as { m?: unknown }).m, 'undefined', 'the copy does not');
    },
  },
  {
    key: 'a class instance nested in a plain object', verdict: 'lossy',
    assert: () => {
      const v = { ok: 1, score: new Score(0.9) };
      const c = clone(v) as { ok: number; score: Score };
      equal(c.ok, 1, 'the outer object crossed');
      equal(Object.getPrototypeOf(c) === Object.getPrototypeOf(v), true,
        'and its OWN prototype is unchanged — so a top-level check is QUIET here',
      );
      equal(typeof (c.score as { isHigh?: unknown }).isHigh, 'undefined',
        'while the INNER method is gone. This is the row section 4 says the cheap detector ' +
        'cannot see, and it is the shape a worker actually writes',
      );
    },
  },
  {
    key: 'a subclass of Array', verdict: 'lossy',
    assert: () => {
      class Rows extends Array { first(): unknown { return this[0]; } }
      const v = Rows.from([1, 2]) as Rows;
      const c = clone(v) as Rows;
      equal(Array.isArray(c), true, '`Array.prototype` DOES cross, so Array.isArray still holds');
      equal([...c], [1, 2], 'and the elements with it');
      equal(c instanceof Rows, false, 'the SUBCLASS prototype does not');
      equal(typeof (c as { first?: unknown }).first, 'undefined', 'so its own method is gone');
    },
  },
  {
    key: 'a subclass of Error', verdict: 'lossy',
    assert: () => {
      class MyErr extends Error { code = 7; }
      const c = clone(new MyErr('boom')) as MyErr;
      equal(c instanceof Error, true, '`Error.prototype` DOES cross');
      equal(c.message, 'boom', 'and so does the message');
      equal(c instanceof MyErr, false, 'the subclass prototype does not');
      equal((c as { code?: unknown }).code, undefined,
        'and NEITHER does its own field — the algorithm serialises name/message/stack/cause only',
      );
    },
  },
  {
    key: 'an Error', verdict: 'lossy',
    assert: () => {
      const v = new Error('plain');
      (v as Error & { code?: number }).code = 7;
      const c = clone(v) as Error & { code?: number };
      equal(c instanceof Error, true, 'a plain Error keeps its prototype');
      equal(c.message, 'plain', 'and its message');
      equal(c.code, undefined,
        'and still loses a field a worker set on it. This row is why prototype identity is not ' +
        'the classifier: it is the ONE shape that keeps its prototype and is lossy anyway',
      );
    },
  },
];

const SHAPES = RAW_SHAPES.map((s) => ({ ...s, assert: () => { assertsRun++; s.assert(); } }));

/**
 * **Section 4's table, read out of the document.** The first cell of each row is the
 * shape key; the second carries the verdict in bold. Obligation (e)'s third shape —
 * a LIST is a claim about another list — and the comparison below is BOTH WAYS.
 */
async function tableRows(): Promise<{ key: string; verdict: string }[]> {
  const doc = await readText(`${ROOT}spec/outcome-record.md`);
  const out: { key: string; verdict: string }[] = [];
  for (const line of doc.split(/\r?\n/)) {
    const m = /^\|\s*`([^`]+)`\s*\|\s*\*\*(refused|intact|lossy)\*\*\s*\|/.exec(line);
    if (m) out.push({ key: m[1]!, verdict: m[2]! });
  }
  return out;
}

suite('OR-R11 — a result is a VALUE, and each shape asserts what does NOT cross', (test) => {
  test('every shape section 4 tabulates is asserted here, and nothing else is — both ways', async () => {
    const declared = await tableRows();
    ok(declared.length > 0,
      'the table was READ from spec/outcome-record.md. Zero rows means the parse broke and every ' +
      'comparison below would be vacuous',
    );
    const mine = SHAPES.map((s) => s.key).sort();
    const theirs = declared.map((r) => r.key).sort();
    equal(theirs.filter((k) => !mine.includes(k)), [],
      'a shape the DOCUMENT tabulates and this suite does not assert. Add the case in the same ' +
      'commit — 16 of 19 rows left this list for ZERO before this assertion existed',
    );
    equal(mine.filter((k) => !theirs.includes(k)), [],
      'a shape this suite asserts and the document does not tabulate — the other direction, and ' +
      'it is what stops the table and the suite drifting apart',
    );
    equal(SHAPES.length, declared.length, 'a COUNT beside the membership, which catches a duplicate key');
    for (const row of declared) {
      equal(SHAPES.find((s) => s.key === row.key)?.verdict, row.verdict,
        `the verdict for \`${row.key}\` matches the document's own column`,
      );
    }
    // The three verdict classes are all populated, so a suite that lost one whole class
    // would fail here rather than getting quietly smaller.
    for (const v of ['refused', 'intact', 'lossy']) {
      ok(SHAPES.some((s) => s.verdict === v), `the \`${v}\` class has at least one shape`);
    }
  });

  test('and each row asserts the property its own row names', async () => {
    const declaredCount = (await tableRows()).length;
    // **The loop's own bound, asserted** — `doc/workflow.md` section 5 rule 8
    // obligation (d) applied to the FILE's loop rather than to a row. Narrowing this
    // to `SHAPES.slice(0, 3)` cost ZERO before this counter existed, because the
    // comparisons below read `SHAPES` and not what actually RAN.
    const ran: string[] = [];
    for (const s of SHAPES) { s.assert(); ran.push(s.key); }
    equal(ran, SHAPES.map((s) => s.key), 'every shape in the list was asserted, in order');
    equal(assertsRun, declaredCount,
      'and a SECOND, independent count says so — incremented inside each `assert` rather than by ' +
      'the loop, so a probe that re-sources the list above leaves this one live. Obligation (c)`s ' +
      'LIMIT: one observer cannot corroborate itself',
    );
    // **The per-class counts are DERIVED from the document, not written down here** —
    // the first version wrote 5 / 10 / 12 as literals and the true split is 5 / 11 / 11,
    // which this assertion caught on its first run. A literal count beside a membership
    // is a second thing to keep right; a count of the OTHER list is a binding.
    const declared = await tableRows();
    for (const v of ['refused', 'intact', 'lossy'] as const) {
      equal(SHAPES.filter((s) => s.verdict === v).length, declared.filter((r) => r.verdict === v).length,
        `the number of \`${v}\` shapes asserted here is the number section 4 tabulates`,
      );
    }
  });

  /**
   * **`OR-R2` is the site, and this is the only place that can say so.** The L2 case
   * below and the `RunState` case are each satisfied by any of the three clone sites
   * on the path; `normalizeEvent` is `OR-R2` itself.
   */
  test('OR-R2 — the loss happens at the LISTENER`s clone, asserted at that site', () => {
    const returned = new Score(0.9);
    const record = normalizeEvent('task.completed', {
      id: 'r1:t0:-:0', state: 'done', attempts: 0, timestamp: 1,
      startTime: 1, endTime: 2, executionTime: 1, result: returned,
    } as never, 100);

    ok(record !== null, 'a settlement writes one record — OR-R3');
    ok(record?.result !== returned,
      'OR-R2 — the record holds a COPY and not the worker`s own object. Delete the clone and ' +
      'this is the assertion that fails; every other case in this file is satisfied by the ' +
      'edge-hop clone or by snapshot()`s, which is why the attribution is pinned here',
    );
    equal((record?.result as Score).value, 0.9, 'the field crossed');
    equal(typeof (record?.result as { isHigh?: unknown }).isHigh, 'undefined', 'the method did not');
    equal(record?.result instanceof Score, false, 'and the prototype went with it');
  });

  test('OR-R6 fires at that same site, and it is the control for the silence', () => {
    let caught: unknown;
    try {
      normalizeEvent('task.completed', {
        id: 'r1:t0:-:0', state: 'done', attempts: 0, timestamp: 1, result: { f: () => 1 },
      } as never, 100);
    } catch (e) { caught = e; }
    ok(caught instanceof UncloneableResult, 'OR-R6 — the named refusal, not a bare DataCloneError');
    ok((caught as Error).message.includes('r1:t0:-:0'), 'and it names the task id');
  });

  test('OR-R11 end to end — the successor gets the FIELDS, not the BEHAVIOUR, and nothing is reported', () => {
    const h = harness();
    h.driver.start({});
    equal(h.scheduler.added.map((t) => t.id), ['r1:t0:-:0'], 'the entry task, and nothing else');
    h.scheduler.settle('r1:t0:-:0', 'done', { result: new Score(0.9) });

    const received = (h.scheduler.added.find((t) => t.id === 'r1:t1:-:0')?.payload as { input?: unknown } | undefined)?.input as
      { value?: number; isHigh?: unknown } | undefined;
    ok(received !== undefined, 'FD-C1 — t1 was dispatched and receives t0`s result unchanged');
    equal(received?.value, 0.9, 'the FIELDS crossed');
    equal(typeof received?.isHigh, 'undefined', 'and the BEHAVIOUR did not');
    equal(h.failures, [],
      'and NOTHING was reported — OR-R6 is the only refusal on this path and it did not fire',
    );

    const node = fold(h.driver.foldInputs()).nodes['r1:t0:-:0'];
    equal((node?.result as { value?: number })?.value, 0.9, 'RunState carries the same field');
    equal(typeof (node?.result as { isHigh?: unknown })?.isHigh, 'undefined',
      'and the same absence, so the rule holds at both surfaces or it is not about the VALUE',
    );
  });

  /**
   * **`OR-R12`** — section 5. `OR-R6` was stated of the whole boundary and holds only
   * at the listener; the resolution path's clone is unguarded, so it throws to the
   * caller and the run keeps going. W54's conformity reader.
   */
  test('OR-R12 — an uncloneable RESOLUTION throws to the caller and does not fail the run', () => {
    const h = harness();
    h.driver.start({});
    h.scheduler.settle('r1:t0:-:0', 'user_action', {});
    const before = h.driver.snapshot().length;

    let caught: unknown;
    try {
      h.driver.resolve('r1:t0:-:0', 'done', { result: { f: () => 1 }, actor: 'someone' });
    } catch (e) { caught = e; }

    ok(caught !== undefined, 'OR-R12 — it THREW, out of resolve(), to the caller that made the call');
    equal(caught instanceof UncloneableResult, false,
      'and NOT as OR-R6`s named refusal — the resolution clone is unguarded, which is the ' +
      'asymmetry this rule exists to write down',
    );
    equal(h.failures, [], 'the run was NOT failed: onRunFailure saw nothing');
    equal(h.driver.snapshot().length, before, 'and no record was appended');
    equal(fold(h.driver.foldInputs()).outcome, 'awaiting_action',
      'RN-R7 — the node is still suspended and the run is still live, so the driver kept routing',
    );

    ok(h.driver.resolve('r1:t0:-:0', 'done', { result: { ok: 1 }, actor: 'someone' }),
      'and a cloneable resolution still works afterwards — the throw left no latch behind',
    );
  });

  /**
   * **The price of bounding `RunState.nodes[*].result` is a VOCABULARY**, and this is
   * the assertion behind that claim in section 4. Both candidate encodings for
   * *withheld* are already reachable and already mean *it returned nothing*.
   */
  test('`null` and `undefined` are BOTH already reachable results, which is what the bound would cost', () => {
    const cases: [string, Record<string, unknown>][] = [
      ['returned null', { result: null }],
      ['returned undefined', { result: undefined }],
      ['no result key at all', {}],
    ];
    const seen = new Map<string, { state: string; result: unknown }>();
    for (const [label, over] of cases) {
      const h = harness();
      h.driver.start({});
      h.scheduler.settle('r1:t0:-:0', 'done', over);
      const node = fold(h.driver.foldInputs()).nodes['r1:t0:-:0'];
      ok(node !== undefined, label + ' — the task was dispatched and settled');
      seen.set(label, { state: node!.state, result: node!.result });
    }
    equal([...seen.keys()].sort(), cases.map((c) => c[0]).sort(),
      'all three cases were driven — the list below is read from the same table that drove them',
    );
    // **Driven from `cases` rather than by hand-written lookups.** A named lookup on a
    // key the map does not hold returns `undefined`, which is the expected value for
    // two of these three — so `seen.get('NO SUCH LABEL')` PASSED, and the first
    // version of this case had three such lookups. W54's adequacy reader.
    const want = new Map<string, unknown>([
      ['returned null', null],
      ['returned undefined', undefined],
      ['no result key at all', undefined],
    ]);
    equal([...want.keys()].sort(), cases.map((c) => c[0]).sort(),
      'and the expectations are keyed by the same labels, both ways, so neither list can drift',
    );
    for (const [label] of cases) {
      const got = seen.get(label);
      ok(got !== undefined, label + ' — the map holds this case, so the assertions below read it');
      equal(got!.state, 'done', label + ' — the task SUCCEEDED, so the `state` field does not disambiguate it');
      equal(got!.result, want.get(label), label + ' — and this is what it carries');
    }

    const h = harness();
    h.driver.start({});
    h.scheduler.settle('r1:t0:-:0', 'failed', { result: { big: 1 }, error: 'boom' });
    const failed = fold(h.driver.foldInputs()).nodes['r1:t0:-:0'];
    equal(failed?.result, null, 'OR-R2`s guard — a task that did not succeed carries null whatever it returned');
    equal(failed?.state, 'failed', 'and THAT one the `state` field does separate');

    // The conclusion, asserted rather than left to a trailing ok(true): within state
    // `done`, the two candidate encodings for "withheld" are indistinguishable from
    // "returned nothing", so a third meaning has nothing left to be spelled with.
    const doneAndEmpty = [...seen.values()].filter((v) => v.state === 'done' && (v.result === null || v.result === undefined));
    equal(doneAndEmpty.length, 3,
      'all three SUCCEEDING cases are already null-or-undefined, so a withheld result would be a ' +
      'THIRD meaning for a value that already carries two. That is what section 4 prices',
    );
  });
});

suite('OR-R11 — the corpus half of what bounding a result would cost', (test) => {
  /**
   * **`14 of 124` and `110 (89%)` are stated in `spec/outcome-record.md` section 4 and
   * in [Q239](../../doc/open-questions.md), and nothing computed them** — measured,
   * both could be changed to any value for zero failures. W54's adequacy reader.
   * They are decidable from the corpus this suite already has, so they are derived
   * here and the document's own numbers are compared to what the corpus says.
   */
  test('the 14 / 124 / 89% split is DERIVED from both corpora, not a literal in a document', async () => {
    const dirs = [`${ROOT}spec/examples/valid`, `${ROOT}examples/flows`];
    let flows = 0, nodes = 0, named = 0;
    for (const dir of dirs) {
      const { listDir } = await import('../harness.ts');
      let names: string[] = [];
      try { names = (await listDir(dir)).filter((n) => n.endsWith('.flow.json')); } catch { continue; }
      for (const n of names) {
        flows++;
        const d = JSON.parse(await readText(`${dir}/${n}`)) as { nodes: Record<string, unknown>[] };
        const targets = new Set<string>();
        const collect = (nd: unknown) => {
          for (const v of Object.values((nd ?? {}) as Record<string, unknown>)) {
            const one = Array.isArray(v) ? v[0] : v;
            if (typeof one === 'string' && one !== '.') targets.add(one.replace(/\?$/, ''));
          }
        };
        for (const node of d.nodes) {
          collect(node.needs);
          for (const e of (node.edges ?? []) as Record<string, unknown>[]) collect(e.needs);
        }
        for (const node of d.nodes) {
          if (node.kind !== 'task') continue;
          nodes++;
          if (targets.has(node.id as string)) named++;
        }
      }
    }
    ok(flows > 0 && nodes > 0, 'both corpora were walked — a zero here makes the rest vacuous');

    const doc = await readText(`${ROOT}spec/outcome-record.md`);
    const m = /\*\*(\d+) of (\d+)\*\* corpus task nodes, so \*\*(\d+) \((\d+)%\)\*\* are named by none/.exec(doc);
    ok(m !== null,
      'section 4 states the split in the shape this assertion reads. If the sentence is reworded ' +
      'this fails rather than silently stopping to check it',
    );
    equal(Number(m![1]), named, 'the document`s `named` figure is what the corpus says');
    equal(Number(m![2]), nodes, 'and its task-node total');
    equal(Number(m![3]), nodes - named, 'and the count named by none');
    equal(Number(m![4]), Math.round((nodes - named) / nodes * 100), 'and the percentage, rounded');
  });
});
