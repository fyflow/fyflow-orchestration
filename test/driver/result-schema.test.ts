/**
 * **`OR-R13` — a settled result held to its worker's `outputSchema`, REPORTED and never routed** —
 * `spec/outcome-record.md` section 4 (v0.10),
 * [ADR 0060](../../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md),
 * [W80](../../doc/work-items/w80-what-a-run-time-result-check-is.md), at ladder L2 on a fake
 * scheduler.
 *
 * Three suites, and they answer three different questions:
 *
 * 1. **what fires and what does not** — the rule's own clauses, each with its positive and negative
 *    case, and the SHAPES it quantifies over: a task outside any region, a fan-out branch, a map
 *    instance, a join successor; `done` against `failed` and `user_action`; a worker that declares
 *    an output schema against one that does not (`doc/workflow.md` rule 8 obligation (a));
 * 2. **P21 decision 3** — *reported and never routed*, as a PAIR of runs differing in one option,
 *    which is the sentence that plan tells an adequacy reader to falsify first;
 * 3. **the REACH** — P21 prediction 3: what this check sees that the wiring check, `check:workers`
 *    and `FD-R4` cannot, measured as a DISAGREEMENT between two observers rather than asserted.
 *
 * Every expected value comes from the schema the case declares and from `findings`' own output
 * shape, derived on paper before anything ran — never from the driver.
 */
import { equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { BoundaryRefused, Driver, type NonconformingResult } from '../../src/driver/driver.ts';
import { describeFindings, findings } from '../../src/definition/schema.ts';
import { checkWiring } from '../../src/definition/wiring.ts';
import { fold } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { FlowDefinition, JsonSchema } from '../../src/definition/types.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';

class FakeScheduler {
  readonly added: { id: string; workerType: string; payload: unknown }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push(task as { id: string; workerType: string; payload: unknown }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  settle(id: string, state: 'done' | 'failed' | 'user_action', over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', detail);
    else { this.fire('task.failed', detail); if (state === 'user_action') this.fire('task.user_action', detail); }
  }
  private fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
}

/** `score` is an integer in 0..100 and nothing else may be present — three ways for a value to fail. */
const OUT: JsonSchema = {
  type: 'object',
  required: ['score'],
  properties: { score: { type: 'integer', minimum: 0, maximum: 100 } },
  additionalProperties: false,
  examples: [{ score: 7 }],
};
/** The producer of the reach case: a probability, declared, over a worker whose code does not keep it. */
const CONF: JsonSchema = { type: 'object', required: ['confidence'], properties: { confidence: { type: 'number', minimum: 0, maximum: 1 } } };

/**
 * **The schema shapes the first cut never instantiated** — W80's adequacy reader, findings 11
 * and 12: `minimum`, `enum` and `items` never fired anywhere, and `enum` is the keyword this
 * item's own declaration step made P21 prediction 1 reverse on. It is also the keyword that
 * makes `findings` able to THROW (conformity reader, finding 1), because `enum` and `const` are
 * the only two of the thirteen that call `canonical` over the whole value.
 */
const SHAPED: JsonSchema = {
  type: 'object',
  required: ['grade', 'marks'],
  properties: {
    grade: { type: 'string', enum: ['pass', 'fail'] },
    marks: { type: 'array', minItems: 1, items: { type: 'integer', minimum: 0 } },
  },
};
/** A schema whose ONLY keyword is `enum`, so `canonical` runs on the value itself. */
const BARE_ENUM: JsonSchema = { enum: ['a', 'b'] };

const WORKERS = {
  checked: { url: 'test://checked', outputSchema: OUT },
  shaped: { url: 'test://shaped', outputSchema: SHAPED },
  bareEnum: { url: 'test://bare-enum', outputSchema: BARE_ENUM },
  // **No `outputSchema` at all** — P18 decision 3, *absent means unchecked*, and the negative case
  // for every clause below that needs one.
  loose: { url: 'test://loose' },
  tight: { url: 'test://tight', outputSchema: CONF },
  // A consumer that keeps the bound its producer declares, so the wiring check has an arc to fit.
  reader: { url: 'test://reader', inputSchema: CONF, outputSchema: OUT },
};
const TYPES = {
  Checked: { worker: 'checked' },
  Shaped: { worker: 'shaped' },
  BareEnum: { worker: 'bareEnum' },
  Loose: { worker: 'loose' },
  Tight: { worker: 'tight' },
  Reader: { worker: 'reader' },
};

const t = (id: string, type: string, to: string) => ({ id, kind: 'task', type, edges: [{ to }] });
const END = { id: 'done', kind: 'end', outcome: 'completed' };
const flow = (nodes: unknown[], entry = (nodes[0] as { id: string }).id): FlowDefinition =>
  ({ flowId: 'rs', version: 1, entry, nodes: nodes as FlowDefinition['nodes'] });

const LINEAR = flow([t('a', 'Checked', 'b'), t('b', 'Checked', 'done'), END]);
const LOOSE = flow([t('a', 'Loose', 'done'), END]);
const FANOUT = flow([
  t('a', 'Checked', 'split'),
  { id: 'split', kind: 'fanout', branches: ['x', 'y'] },
  t('x', 'Checked', 'j'), t('y', 'Checked', 'j'),
  { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'after' }] },
  t('after', 'Checked', 'done'), END,
]);
/**
 * **A NESTED region** — `spec/examples/valid/nested-fanout.flow.json`'s shape, so a settlement
 * mints a DOTTED branch path. W80's adequacy reader, finding 7: every reported settlement was
 * at depth 1, so a driver that silently never reported inside a nested region cost ZERO —
 * **which is W76's own adequacy finding reproduced in the item that cites W76's answer.**
 */
const NESTED = flow([
  { id: 'outer', kind: 'fanout', branches: ['p', 'q'] },
  t('p', 'Checked', 'outerJoin'),
  { id: 'q', kind: 'task', type: 'Checked', edges: [{ to: 'inner' }] },
  { id: 'inner', kind: 'fanout', branches: ['r', 's'] },
  t('r', 'Checked', 'innerJoin'), t('s', 'Checked', 'innerJoin'),
  { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'outerJoin' }] },
  { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
  END,
], 'outer');
const MAP = flow([
  t('a', 'Checked', 'm'),
  { id: 'm', kind: 'map', over: 'items', branch: 'each' },
  t('each', 'Checked', 'j'),
  { id: 'j', kind: 'join', of: 'm', edges: [{ to: 'done' }] },
  END,
]);

/** One driver, plus the report list the callback fills, plus what the scheduler was handed. */
function driver(def: FlowDefinition, opts: { report?: boolean; extra?: Record<string, unknown>; runId?: string } = {}) {
  const scheduler = new FakeScheduler();
  const reports: NonconformingResult[] = [];
  const d = new Driver(def, {
    runId: opts.runId ?? 'r1', scheduler, createTask: (c) => c, predicates: new Map(),
    workers: WORKERS, nodeTypes: TYPES, joinPolicy: liveToken as JoinPolicy,
    ...(opts.report === false ? {} : { onNonconformingResult: (f: NonconformingResult) => { reports.push(f); } }),
    ...(opts.extra ?? {}),
  });
  return { d, scheduler, reports };
}

const BAD = { score: 101 };
const GOOD = { score: 7 };

suite('OR-R13 — what a nonconforming result reports, and what leaves it alone', (test) => {
  test('a `done` result the schema refuses: ONE report, every field derived from the schema', () => {
    const { d, scheduler, reports } = driver(LINEAR);
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', { result: BAD });
    equal(reports.length, 1, 'exactly one report for one nonconforming settlement');
    const f = reports[0]!;
    equal([f.runId, f.taskId, f.nodeId, f.type, f.worker], ['r1', 'r1:a:-:0', 'a', 'Checked', 'checked'],
      'the run, the task, the node, the type and the worker whose schema refused it');
    // Derived from OUT on paper: 101 is an integer, so only `maximum` fires, at `$.score`.
    equal(f.findings, [{ path: '$.score', says: 'above maximum 100' }], '`findings`` own list, unabridged');
    ok(f.message.includes('r1:a:-:0') && f.message.includes('node "a"') && f.message.includes('worker "checked"') &&
      f.message.includes('above maximum 100') && f.message.includes('OR-R13') && f.message.includes('not a refusal'),
      `the message names the task, the node, the worker, the finding and the rule: ${f.message}`);
  });

  test('a result the schema ACCEPTS reports nothing — the negative case of the clause above', () => {
    const { d, scheduler, reports } = driver(LINEAR);
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', { result: GOOD });
    equal(reports, [], 'nothing to say about a conforming result');
  });

  test('every way ONE value can fail is reported, in document order — the list is not a boolean', () => {
    const { d, scheduler, reports } = driver(LINEAR);
    d.start({});
    // `{ note: 'x' }`: `score` is required and absent, and `note` is not declared under
    // `additionalProperties: false`. Two findings, in the order `findings` walks them — required
    // first, then the undeclared key.
    scheduler.settle('r1:a:-:0', 'done', { result: { note: 'x' } });
    equal(reports.length, 1, 'one report per settlement, however many findings it carries');
    equal(reports[0]!.findings, [{ path: '$.score', says: 'required' }, { path: '$.note', says: 'not declared' }],
      'both findings, in document order');
  });

  test('a worker declaring NO outputSchema is unchecked — P18 decision 3, with its control', () => {
    const { d, scheduler, reports } = driver(LOOSE);
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', { result: BAD });
    equal(reports, [], 'nothing is declared, so nothing is checked');
    // The control: the SAME value, on a worker that does declare one, reports. Without it this
    // case passes on a check that is simply never wired up.
    const c = driver(LINEAR);
    c.d.start({});
    c.scheduler.settle('r1:a:-:0', 'done', { result: BAD });
    equal(c.reports.length, 1, 'the same value on a DECLARING worker reports — so the case above is about the schema');
  });

  test('`failed` and `user_action` settlements are not checked: OR-R2 writes `result: null` for both', () => {
    const { d, scheduler, reports } = driver(LINEAR);
    d.start({});
    // **The control is over the OBSERVED side** — adequacy finding 4: the first version asserted
    // `findings(OUT, null)` refuses, which is a property of the VALIDATOR and cannot fail where
    // this claim is vacuous. This drives the same `null` through the same driver as a **`done`**
    // settlement, where the check does run, and it reports: so *nothing was reported* below is a
    // fact about the terminal state rather than about `null` being acceptable.
    const nullDone = driver(LINEAR);
    nullDone.d.start({});
    nullDone.scheduler.settle('r1:a:-:0', 'done', { result: null });
    equal(nullDone.reports.map((f) => describeFindings(f.findings)), ['$ expected object, got null'],
      'CONTROL: the same null through the same schema, as a `done` settlement, DOES report');
    scheduler.settle('r1:a:-:0', 'failed', {});
    equal(reports, [], 'a failed settlement reports nothing');
    const u = driver(LINEAR);
    u.d.start({});
    u.scheduler.settle('r1:a:-:0', 'user_action', {});
    equal(u.reports, [], 'and neither does a user_action settlement');
  });

  test('THE SHAPES: outside a region, a fan-out branch, and a join successor — each naming its own task id', () => {
    const { d, scheduler, reports } = driver(FANOUT);
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', { result: BAD });
    scheduler.settle('r1:x:0:0', 'done', { result: BAD });
    scheduler.settle('r1:y:1:0', 'done', { result: GOOD });
    scheduler.settle('r1:after:-:0', 'done', { result: BAD });
    equal(reports.map((f) => f.taskId), ['r1:a:-:0', 'r1:x:0:0', 'r1:after:-:0'],
      'one per nonconforming settlement, at its own branch path — and `y`, which conformed, is absent');
    equal([...new Set(reports.map((f) => f.nodeId))].sort(), ['a', 'after', 'x'], 'each names its own node');
    // *(A *control* asserting that the reported ids span both shapes stood here and was DELETED.
    // v0.21's clause asks of every control: what tree makes it FAIL while its claim PASSES? There
    // is none — the claim above pins the exact three ids, and that list spans both shapes by
    // construction, so the control was ENTAILED by its own claim and could not fire alone. That is
    // W78's finding verbatim, one item on, found by W80's adequacy reader asking exactly that
    // question. What binds the shape is the PRODUCT probe `a6`, which restricts the report to
    // region-free tasks and is CAUGHT here at 2 failures.)*
    // **And the MESSAGE, per report, derived from that report** — adequacy finding 5: five
    // `includes` on the ONE case where every interpolation coincides with a constant left the
    // whole field replaceable by a fixed string. Three reports with three task ids, three nodes
    // and three findings cannot all be one constant.
    for (const f of reports) {
      ok(f.message.includes(f.taskId) && f.message.includes(`node \"${f.nodeId}\"`) &&
         f.message.includes(`worker \"${f.worker}\"`) && f.message.includes(describeFindings(f.findings)),
        `the message names THIS report's task, node, worker and findings: ${f.message}`);
    }
  });

  test('THE SHAPES: a map instance — N settlements, N reports, at N branch paths', () => {
    const { d, scheduler, reports } = driver(MAP);
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', { result: { items: [1, 2, 3] } as unknown });
    equal(scheduler.added.map((x) => x.id).slice(1), ['r1:each:0:0', 'r1:each:1:0', 'r1:each:2:0'],
      'three instances, so the shape exists before the claim about it');
    // The entry's own result already failed `additionalProperties: false` — that is report 1.
    equal(reports.map((f) => f.taskId), ['r1:a:-:0'], 'the entry reported; nothing else has settled yet');
    scheduler.settle('r1:each:0:0', 'done', { result: BAD });
    scheduler.settle('r1:each:1:0', 'done', { result: GOOD });
    scheduler.settle('r1:each:2:0', 'done', { result: BAD });
    equal(reports.map((f) => f.taskId), ['r1:a:-:0', 'r1:each:0:0', 'r1:each:2:0'],
      'each instance is its own settlement, and instance 1 conformed');
  });

  test('THE SHAPES: a NESTED region — a report at a DOTTED branch path, which nothing here reached', () => {
    // W80's adequacy reader, finding 7: every reported settlement in the first cut was at depth 1,
    // so a driver that silently never reported inside a nested region cost ZERO. **That is W76's
    // own adequacy finding — every NESTED region's events dropped, for nothing — reproduced in the
    // item that cites W76's answer**, which is why the shapes clause keeps being followed and short.
    const { d, scheduler, reports } = driver(NESTED);
    d.start({});
    equal(scheduler.added.map((x) => x.id), ['r1:p:0:0', 'r1:q:1:0'], 'the outer region opened two branches');
    scheduler.settle('r1:q:1:0', 'done', { result: GOOD });
    equal(scheduler.added.map((x) => x.id).slice(2), ['r1:r:1.0:0', 'r1:s:1.1:0'],
      'and the inner region mints DOTTED paths — the shape `spec/task-id.md` reserves');
    scheduler.settle('r1:r:1.0:0', 'done', { result: BAD });
    scheduler.settle('r1:s:1.1:0', 'done', { result: GOOD });
    scheduler.settle('r1:p:0:0', 'done', { result: BAD });
    equal(reports.map((f) => f.taskId), ['r1:r:1.0:0', 'r1:p:0:0'],
      'reported at a dotted path and at a top-level one, and NOT for the two that conformed');
  });

  test('THE SHAPES: the schema`s own keywords — enum, items, minItems and a nested minimum', () => {
    // Adequacy findings 11 and 12: `minimum`, `enum` and `items` fired nowhere, and `enum` is both
    // the keyword P21 prediction 1 reverses on and one of the only two that can make `findings`
    // THROW. Every expected finding below is derived from `SHAPED` on paper.
    const { d, scheduler, reports } = driver(flow([t('a', 'Shaped', 'done'), END]));
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', { result: { grade: 'maybe', marks: [3, -1] } });
    equal(reports.map((f) => describeFindings(f.findings)),
      ['$.grade not one of ["pass","fail"]; $.marks[1] below minimum 0'],
      'the enum at $.grade and the item minimum at $.marks[1], in document order');
    scheduler.settle('r1:b:-:0', 'done', { result: GOOD });
    const empty = driver(flow([t('a', 'Shaped', 'done'), END]));
    empty.d.start({});
    empty.scheduler.settle('r1:a:-:0', 'done', { result: { grade: 'pass', marks: [] } });
    equal(empty.reports.map((f) => describeFindings(f.findings)), ['$.marks fewer than 1 items'],
      'and minItems, which no other case reaches');
  });

  test('a worker returning UNDEFINED under a declared schema reports — `OR-R11` calls undefined INTACT', () => {
    // Adequacy finding 10: no `done` settlement anywhere carried no result, so the rule's central
    // input had an unexercised value. `structuredClone(undefined)` is `undefined` and crosses
    // intact, so what the record holds is what the worker returned.
    const { d, scheduler, reports } = driver(LINEAR);
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', {});
    equal(reports.map((f) => describeFindings(f.findings)), ['$ expected object, got undefined'],
      'a worker that returned nothing, held to a schema that requires an object');
  });

  test('a result `findings` CANNOT READ is a FINDING and never a run failure — the conformity reader`s finding 1', () => {
    // **`enum` and `const` are the only two of ADR 0053's thirteen keywords that call `canonical`,
    // and `canonical` is the only expression in `findings` that walks the WHOLE VALUE** rather than
    // the schema's shape — every other clause recurses through `properties` and `items`, whose depth
    // is the schema's, and the subset has no `$ref`. So a **cyclic** result and a **BigInt** throw
    // there, and `OR-R11`'s own table calls both of them **intact**. Unguarded, that throw reaches
    // `onEvent` and STOPS THE RUN: decision 3's headline invariant broken by the reporting
    // machinery itself. Measured on four shapes at `dev-dist/w80/conf1.txt`.
    const failures: string[] = [];
    const { d, scheduler, reports } = driver(flow([t('a', 'BareEnum', 'b'), t('b', 'BareEnum', 'done'), END]),
      { extra: { onRunFailure: (f: { kind: string }) => { failures.push(f.kind); } } });
    d.start({});
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    // The control first: this value CLONES intact, which is why the check meets it at all.
    equal(typeof structuredClone(cyclic), 'object', 'CONTROL: `OR-R2` clones a cyclic value intact (`OR-R11`)');
    throws(() => findings(BARE_ENUM, cyclic), 'Maximum call stack size exceeded', 'CONTROL: and `findings` THROWS on it, unguarded — a RangeError out of `canonical`');
    scheduler.settle('r1:a:-:0', 'done', { result: cyclic });
    equal(reports.map((f) => f.findings.map((x) => x.path)), [['$']], 'one finding, at the root');
    ok(reports[0]!.findings[0]!.says.startsWith('could not be checked against the schema:'),
      `and it says the value could not be read: ${reports[0]!.findings[0]!.says}`);
    equal(failures, [], 'the run was NOT failed');
    equal(scheduler.added.map((x) => x.id), ['r1:a:-:0', 'r1:b:-:0'], 'and it routed on, which is the whole of decision 3');
    // The second shape, on the same road: a BigInt, which `JSON.stringify` refuses.
    const big = driver(flow([t('a', 'BareEnum', 'b'), t('b', 'BareEnum', 'done'), END]));
    big.d.start({});
    big.scheduler.settle('r1:a:-:0', 'done', { result: 1n });
    ok(big.reports[0]!.findings[0]!.says.includes('BigInt'), `a BigInt under \`enum\`: ${big.reports[0]!.findings[0]!.says}`);
  });

  test('the report names THIS driver`s run and THIS node`s type, not a constant', () => {
    // Adequacy finding 6: `runId` and `type` were read at exactly one case each, where the
    // fixture's value coincided with a constant, so both survived being hard-coded — asymmetric
    // with `worker`, which the author's own provenance probe already caught.
    const { d, scheduler, reports } = driver(flow([t('a', 'Shaped', 'done'), END]), { runId: 'w80-other' });
    d.start({});
    scheduler.settle('w80-other:a:-:0', 'done', { result: { grade: 'nope', marks: [1] } });
    equal(reports.map((f) => [f.runId, f.taskId, f.type, f.worker]),
      [['w80-other', 'w80-other:a:-:0', 'Shaped', 'shaped']],
      'a different run id and a different type than every other case here');
  });

  test('THE SWITCH: with no callback a nonconforming settlement is recorded and routed, exactly as a conforming one is', () => {
    const { d, scheduler } = driver(LINEAR, { report: false });
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', { result: BAD });
    equal(d.snapshot().length, 1, 'the settlement was recorded');
    equal(scheduler.added.map((x) => x.id), ['r1:a:-:0', 'r1:b:-:0'], 'and the successor was dispatched');
    // **What this case does NOT observe, stated rather than left to look complete.** *Nothing was
    // CHECKED* has no observer here, because the check's only effect is the callback: with the
    // callback absent, a driver that ran `findings` anyway and discarded the answer is
    // indistinguishable from one that did not. The two routes that DO bind it are elsewhere and
    // neither is an assertion in this file: the guard is an **L0** assertion, because the report
    // parameter is typed non-optional so deleting `report !== undefined` does not compile; and the
    // COST of running it for nothing is P21 fact 4's, which W81 owns.
    //
    // *(The first version of this case tried to observe it with a result whose getter THROWS, and
    // the probe measured the apparatus: `OR-R2`'s clone reads the getter too, so the run stopped at
    // `OR-R6` with NOTHING appended, before any check could have run. `doc/workflow.md` section 4's
    // reading clause, and P21's own four-probes-before-one-measurement sequence.)*
    ok(true, 'and *nothing was checked* is bound at L0 and by W81`s cost rung, not here');
  });
});

suite('OR-R13 — REPORTED and never ROUTED: the same run, with the check and without it', (test) => {
  /**
   * Drive one run of `LINEAR` to completion with a nonconforming result at `a`.
   *
   * **`now` is PINNED, and that is a correction rather than a convenience.** The claim below is
   * that two runs agree on every field of every record; `observedAt` is the driver's own
   * `Date.now()` read and is the one field two runs at two instants legitimately differ in. The
   * first version let it float and **passed in Node and failed in Deno**, on a one-millisecond
   * straddle — `doc/workflow.md` section 5 rule 5's *a test that depends on what the spec does not
   * fix will flake in CI and nowhere else*, caught by the second runtime rather than by the first.
   * Holding the clock equal is what makes the comparison about the CHECK.
   */
  const run = (report: boolean) => {
    const { d, scheduler, reports } = driver(LINEAR, { report, extra: { now: () => 1_700_000_000_000 } });
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', { result: BAD });
    scheduler.settle('r1:b:-:0', 'done', { result: GOOD });
    return { d, scheduler, reports, state: fold(d.foldInputs()) };
  };

  test('P21 decision 3: the log, the dispatches and the folded outcome are IDENTICAL either way', () => {
    const on = run(true);
    const off = run(false);
    // **The control that makes the pair a pair** — `doc/workflow.md` rule 8 obligation (d) at
    // v0.21: a control goes over the OBSERVED side or over the RELATION, never over the declared
    // one. These two are the relation: exactly one of the two runs reported, and it reported the
    // finding the schema names. Without them, every equality below is satisfied by a check that
    // never ran.
    equal(on.reports.map((f) => f.taskId), ['r1:a:-:0'], 'the checked run reported, at the task whose result failed');
    equal(off.reports, [], 'and the unchecked run reported nothing — the ONE thing the two runs differ in');

    // **EVERY CLAUSE IS ASSERTED AGAINST A LITERAL, FOR EACH RUN, and the pair equality sits
    // beside it rather than carrying it.** W80's adequacy reader defeated the first cut three ways
    // and all three are one shape: a claim of the form *the two runs agree* is made vacuous by
    // pointing one operand at the other run, and **no identity control can refuse that here**,
    // because `snapshot()`, `.map` and `state.nodes` all build fresh values on every read. It found
    // `off.scheduler.added` vs `on.scheduler.added` collapsible for ZERO, `off.state.nodes` vs
    // `on.state.nodes` collapsible for ZERO with nothing else covering it, and the one
    // non-comparative assertion POINTABLE at the unchecked run — the assertion whose own comment
    // said *with no second run involved*.
    //
    // The literals below are derived on paper: the two settlements this case makes, `OR-R2`'s field
    // table for what a record carries, `now` pinned above, and the `FakeScheduler`'s fixed stamps.
    // **A check that appended, altered a field, authored a terminal state or moved a dispatch fails
    // against the literal, in the CHECKED arm, with no second run involved** — and asserting both
    // arms is what leaves no operand to mis-point.
    const RECORDS = [
      { kind: 'outcome', taskId: 'r1:a:-:0', terminalState: 'done', result: BAD, error: null, attempts: 0,
        schedulerTimestamp: 1, observedAt: 1_700_000_000_000, startTime: 1, endTime: 2, executionTime: 1 },
      { kind: 'outcome', taskId: 'r1:b:-:0', terminalState: 'done', result: GOOD, error: null, attempts: 0,
        schedulerTimestamp: 1, observedAt: 1_700_000_000_000, startTime: 1, endTime: 2, executionTime: 1 },
    ];
    for (const [arm, r] of [['checked', on], ['unchecked', off]] as const) {
      // The WHOLE record, all eleven fields — not a four-field projection. The reader's sharpest
      // survivor was `reportResultSchema` writing `attempts = 99` into the record it had just been
      // handed, which a projection over `{kind, taskId, terminalState, result}` cannot see.
      equal(r.d.snapshot(), RECORDS, `${arm}: the log, ALL ELEVEN FIELDS of both records, against what the settlements carried`);
      equal(r.scheduler.added.map((x) => x.id), ['r1:a:-:0', 'r1:b:-:0'], `${arm}: the tasks dispatched, in order`);
      equal(r.state.outcome, 'completed', `${arm}: the run completes`);
      equal(Object.entries(r.state.nodes).map(([id, n]) => [id, n.result]),
        [['r1:a:-:0', BAD], ['r1:b:-:0', GOOD]], `${arm}: every node's folded result`);
    }
    // And the pair, kept beside the literals: it says the two runs agree on everything the literals
    // do not reach, and it is now the redundant half rather than the load-bearing one.
    equal(off.d.snapshot(), on.d.snapshot(), 'and the two logs agree, record for record');
    equal(off.state.nodes, on.state.nodes, 'as does every node`s folded state');
  });

  test('the nonconforming value reaches the next node UNALTERED — what this buys is knowledge, not protection', () => {
    const on = run(true);
    // `b`'s payload is the envelope `{ settings, input }`, and `input` is `a`'s result whole.
    equal(on.scheduler.added[1]!.payload, { settings: {}, input: BAD },
      'the value the schema refused is exactly what the successor received');
    equal(on.state.nodes['r1:a:-:0']!.result, BAD, 'and exactly what run state records for it');
  });

  test('a callback that THROWS stops the run — the ONE way this option changes one, and it is the consumer`s own code', () => {
    const failures: { kind: string }[] = [];
    const { d, scheduler } = driver(LINEAR, {
      extra: {
        onNonconformingResult: () => { throw new Error('consumer threw'); },
        onRunFailure: (f: { kind: string }) => { failures.push({ kind: f.kind }); },
      },
    });
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', { result: BAD });
    // `onEvent` catches a throw from anywhere inside the listener, reports it and stops the run —
    // `OR-R10`, and exactly what `onUnmintedTask` gets. **It does not leave the listener**, because
    // `dispatchEvent` would discard it if it did, which is that rule's founding measurement.
    equal(failures.map((f) => f.kind), ['Error'], 'reported through onRunFailure, under this driver`s run id');
    // **The record was already appended, which is why the report sits AFTER the append.** Had it
    // sat before, a throwing consumer callback would have deleted a settlement from the log — the
    // behaviour change P21 decision 3 forbids, caused by the reporting machinery itself.
    equal(d.snapshot().length, 1, 'the settlement is in the log, because the report happens after the append');
    equal(scheduler.added.map((x) => x.id), ['r1:a:-:0'], 'and the successor was not dispatched: the run stopped');
  });
});

suite('OR-R13 — SETTLEMENTS only: a person`s resolution is FD-R4`s, and the two do not overlap', (test) => {
  /**
   * **The clause both readers reached, from opposite ends** — W80's conformity reader (finding 4:
   * `OR-R13`'s Test cell claims a positive and a negative case for every clause, and this clause
   * had neither) and its adequacy reader (Outputs row (4) names three tools this reaches past, and
   * the `FD-R4` third had no assertion anywhere). It is the ONE subject the two passes shared.
   *
   * The code satisfies it by construction — `reportResultSchema` is reachable only from the
   * settlement path — and by construction is exactly what nothing can fail on.
   */
  /** Park `a` on a person, then hand back a value its worker's own `outputSchema` refuses. */
  const parked = (extra: Record<string, unknown> = {}) => {
    const h = driver(LINEAR, { extra });
    h.d.start({});
    h.scheduler.settle('r1:a:-:0', 'user_action', {});
    return h;
  };

  test('a person`s `done` resolution is held by FD-R4 and reported by NOBODY — one value, one mechanism', () => {
    // `validateBoundaries: false` is what lets the value through at all, so the question
    // `OR-R13` answers — *does the check fire on a resolution* — can be asked.
    const h = parked({ validateBoundaries: false });
    equal(h.d.resolve('r1:a:-:0', 'done', { result: BAD, actor: 'ops:jane' }), true, 'the resolution was accepted');
    equal(h.reports, [], 'and OR-R13 said NOTHING about it: a resolution is not a settlement');
    // **The control, over the observed side**: the value really did arrive and really does fail the
    // schema, so *nothing was reported* is about the SITE and not about the value being fine.
    equal(h.d.snapshot().map((r) => r.kind), ['outcome', 'resolution'], 'the resolution record IS in the log');
    equal(findings(WORKERS.checked.outputSchema, BAD).length, 1, 'CONTROL: and that value fails the very schema OR-R13 reads');
  });

  test('and with the boundary ON, FD-R4 is what speaks — a REJECTED COMMAND, not a report', () => {
    const h = parked();
    let caught: unknown;
    try { h.d.resolve('r1:a:-:0', 'done', { result: BAD, actor: 'ops:jane' }); } catch (e) { caught = e; }
    ok(caught instanceof BoundaryRefused, `a BoundaryRefused, got ${String(caught)}`);
    equal((caught as BoundaryRefused).boundary, 'resolve', 'at the resolve boundary');
    equal(h.reports, [], 'and still nothing from OR-R13, which is the point: ONE value, ONE mechanism');
    equal(h.d.snapshot().map((r) => r.kind), ['outcome'], 'nothing was appended, and the task is still suspended');
  });
});

suite('OR-R13 — the REACH: what a static check and a boundary cannot see (P21 prediction 3)', (test) => {
  test('a producer whose DECLARED bound its own code does not keep: the wiring check FITS and the run reports', async () => {
    // `tight` declares `confidence` in 0..1; `reader` consumes exactly that. The two SCHEMAS agree,
    // so every static observer is green — and the code behind `tight` is the corpus's own shape
    // ([Q302](../../doc/questions/q302.md)): `text.length / 10`, unbounded above.
    const REACH = flow([t('p', 'Tight', 'c'), t('c', 'Reader', 'done'), END]);
    const report = await checkWiring({ workers: WORKERS, nodeTypes: TYPES }, REACH);
    const arc = report.verdicts.find((v) => v.consumer === 'c');
    equal([arc?.producer, arc?.kind], ['p', 'fits'], 'the wiring check reads two schemas and says the arc FITS');
    equal(report.counts.no, 0, 'and it has nothing to say about this flow at all');

    const { d, scheduler, reports } = driver(REACH);
    d.start({});
    // What the worker returns for a THIRTEEN-letter input, computed as its code computes it.
    // *(This said *eleven-letter*, which is `examples/workers/shared.ts`'s phrase for `split`'s
    // own word, carried across to a different string. W80's conformity reader, finding 9.)*
    const produced = { confidence: 'unexceptional'.length / 10 };
    equal(produced.confidence, 1.3, 'the value the code produces, derived rather than asserted');
    scheduler.settle('r1:p:-:0', 'done', { result: produced });
    equal(reports.map((f) => `${f.worker} ${f.findings.map((x) => `${x.path} ${x.says}`).join('; ')}`),
      ['tight $.confidence above maximum 1'],
      'and the run says so, on the one value that reached the bound');
  });

  test('the check reads what the RECORD carries, not what the worker returned — and the two can DISAGREE', async () => {
    // `OR-R11`: `OR-R2`'s clone keeps a value's own ENUMERABLE string-keyed data, and a
    // non-enumerable own property is not that. `scripts/check-workers.mjs` validates what `run()`
    // returned — `findings(schema, returned)`, the expression below — and this check validates what
    // the log holds. No authoring-time tool can reach the second, for a structural reason: none of
    // them holds a record.
    const returned: Record<string, unknown> = {};
    Object.defineProperty(returned, 'score', { value: 7, enumerable: false });
    equal(findings(OUT, returned), [],
      'what `check:workers` computes over the RETURNED value: it conforms, because `findings` reads OWN keys');
    // **The line above is a MODEL of another file, and a model bound to nothing is a claim about a
    // list nothing compares** — W80's adequacy reader, finding 8, which replaced the schema with
    // `{}` and watched it conform trivially. `doc/workflow.md` rule 8 obligation (e)'s third shape:
    // find the other list and compare. The other half is one expression in a `.mjs` script this
    // suite cannot spawn, so what is compared is its TEXT " — if `check-workers` ever validates a
    // CLONE instead of the return value, this item's whole reach claim becomes false and this line
    // is what says so. (`scripts/check-workers.mjs` is inlined into the browser bundle for it.)
    const cw = await readText(ROOT + 'scripts/check-workers.mjs');
    ok(cw.includes('const fs = findings(w.outputSchema, out);'),
      '`check-workers` validates `out`, the direct return value, with no clone between');
    ok(!cw.includes('structuredClone(out)'), 'and nothing there clones it first');

    const { d, scheduler, reports } = driver(LINEAR);
    d.start({});
    scheduler.settle('r1:a:-:0', 'done', { result: returned });
    equal(reports.map((f) => f.findings), [[{ path: '$.score', says: 'required' }]],
      'and what the RECORD carries does not — the same schema, two values, two answers');
    equal(d.snapshot().length, 1, 'with the record written and the run routing, because this is a reading');

    // **The control, and it is what says the disagreement is a property of the SHAPE rather than of
    // the apparatus.** A PROTOTYPE getter is invisible to both, because `findings` reads own keys
    // and never `in` — W65's conformity reader's fix, closing this from the other side.
    class Score { readonly ok = true; get score() { return 7; } }
    const onProto = new Score();
    equal(findings(OUT, onProto).length > 0 && findings(OUT, structuredClone(onProto)).length > 0, true,
      'a prototype getter: BOTH observers refuse it, so they agree and there is nothing to report');
  });
});
