/**
 * Ladder L2 — **`"n!error"` composed: a failed task's error, reached by the nodes its failure edge leads to** —
 * `spec/flow-definition.md` v0.49 `FD-C1`, `FD-C3`, `FD-C4`, `spec/outcome-record.md`'s `error` row and `RS-R1`;
 * [ADR 0131](../../doc/decisions/0131-a-reference-may-name-a-nodes-error.md),
 * [P43](../../doc/plans/p43-what-a-flow-and-a-run-say-as-data-rather-than-as-prose.md) (c1), decision 5, fact 5;
 * [W209](../../doc/work-items/w209-a-reference-to-a-nodes-error.md).
 *
 * **Every expected value is written from those rows, never read off a run**: a scheduler double settles KNOWN error
 * strings, so the value a `"n!error"` key resolves to is a literal written before the run — the outcome record's
 * `error` (`d.error ?? null`), `null` where the output succeeded, a resolution's `error` where a person resolved the
 * node `failed` (`'resolved as failed'` where they gave none); absent for `"n!error?"` where the node did not run, and
 * one per instance in item order for `["n!error"]`. Each claim sits beside a CONTROL that differs by the one thing the
 * claim is about — most often the same flow's other road, or the plain reference beside the error one.
 */
import { collected, equal, ok, readText, ROOT, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver } from '../../src/driver/driver.ts';
import type { Checkpoint } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { DecisionContext } from '../../src/driver/routing.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

const SUITE = 'L2 — W209, ADR 0131: "n!error" composed — the failure edge`s successor handed the outcome`s error, null on success, absent unrun, one per instance, a resolution`s, at both sites, no copy';

const TYPES = typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker', 'ReviewWorker', 'ExtractWorker']);

/** A scheduler double: it RECORDS every `addTask`, and settles what a test tells it to with the error it is given. */
class Fake {
  readonly added: { id: string; payload: { input?: unknown } }[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown): void { this.added.push(t as { id: string; payload: { input?: unknown } }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  cancel(): Promise<boolean> { return Promise.resolve(true); }
  ids(): string[] { return this.added.map((t) => t.id); }
  inputOf(id: string): unknown { return this.added.find((t) => t.id === id)?.payload?.input; }
  /** `failed` is an OPTIONAL task's road (`task.failed` alone); `user_action` a non-optional one's (the PAIR, OR-R3). */
  settle(id: string, state: 'done' | 'failed' | 'user_action', v: { result?: unknown; error?: string } = {}): void {
    const detail = { id, state, result: v.result ?? null, error: v.error, attempts: 1, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    const ev = state === 'done' ? ['task.completed'] : state === 'failed' ? ['task.failed'] : ['task.failed', 'task.user_action'];
    for (const name of ev) for (const fn of this.listeners.get(name) ?? []) fn({ detail });
  }
}

function make(def: FlowDefinition, predicates: Map<string, (c: DecisionContext) => boolean> = new Map()) {
  const sch = new Fake();
  const failures: string[] = [];
  const driver = new Driver(def, {
    runId: 'r1', scheduler: sch as never, createTask: (c) => c as never, predicates, now: () => 42,
    joinPolicy: liveToken as unknown as JoinPolicy, ...TYPES,
    onRunFailure: (f) => { failures.push(`${f.kind}: ${f.message}`); },
  });
  return { driver, sch, failures };
}
const flow = (flowId: string, entry: string, nodes: unknown[]): FlowDefinition => ({ flowId, version: 1, entry, nodes } as unknown as FlowDefinition);
const END = { id: 'done', kind: 'end', outcome: 'completed' };
const askedOf = (d: Driver) => d.foldInputs().filter((e) => e.kind === 'asked') as Extract<FoldInput, { kind: 'asked' }>[];
const recordOf = (d: Driver, taskId: string) =>
  d.foldInputs().find((e) => e.kind === 'outcome' && e.record.taskId === taskId) as { record: { error: string | null; terminalState: string } } | undefined;
const cacheOf = (d: Driver) => (d as unknown as { outputsCache: { copies: number } | null }).outputsCache;

const CORPUS = async () => JSON.parse(await readText(`${ROOT}spec/examples/valid/ask-after-a-failure.flow.json`)) as FlowDefinition;
const MSG = 'lookup timed out after 30 s';

const DECLARED_CASES = [
  'the corpus flow`s FAILURE road: the ask after the failure edge is handed the outcome record`s error, and publish the error beside a null result',
  'the corpus flow`s SUCCESS road: the same keys read null for the error and the result itself — the control',
  'a resume from the parked ask re-composes the same error, and the asked element compares equal',
  'a DECLINED ask is read too: its error is the person`s, or "resolved as failed" where they gave none',
  'a user_action task resolved FAILED: the RESOLUTION`s error, never the scheduler`s; resolved done: null',
  'the "?" form: ABSENT where the node did not run, the string where it failed, null where it succeeded',
  'the array form inside a map: one error per instance in ITEM order, settled out of order — and each instance`s own inside it',
  'at an EDGE: a predicate routes on ctx.needs.why, both ways, by the same resolution as a node`s',
  'nothing is copied: an error-only read leaves the shared-copy count at 0, its plain twin makes one',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('the corpus flow`s FAILURE road: the ask after the failure edge is handed the outcome record`s error, and publish the error beside a null result', async () => {
    const m = make(await CORPUS());
    m.driver.start({ invoice: 'INV-?' });
    m.sch.settle('r1:lookup:-:0', 'failed', { error: MSG });
    const record = recordOf(m.driver, 'r1:lookup:-:0')!.record;
    equal([record.terminalState, record.error], ['failed', MSG], 'the outcome record: failed, its error the string the scheduler reported');
    equal(askedOf(m.driver).map((a) => a.input), [{ why: MSG }], 'the ask parks with { why: <the record`s error> } — by hand');
    equal((askedOf(m.driver)[0]!.input as { why: unknown }).why, record.error, 'and EQUAL to the record`s own error field');
    equal(m.sch.ids(), ['r1:lookup:-:0'], 'nothing handed past the ask');
    ok(m.driver.resolve('r1:resolve:-:0', 'done', { result: { value: 'INV-9' }, actor: 'p' }), 'the person answers');
    equal(m.sch.inputOf('r1:publish:-:0'), { found: null, why: MSG, given: { value: 'INV-9' } },
      'publish: the failed result null (FD-C1), the error string under `why`, the answer under `given`');
    m.sch.settle('r1:publish:-:0', 'done', { result: 'ok' });
    equal(fold(m.driver.foldInputs()).outcome, 'completed', 'the run completes');
    equal(m.failures, [], 'nothing reported');
  });

  test('the corpus flow`s SUCCESS road: the same keys read null for the error and the result itself — the control', async () => {
    const m = make(await CORPUS());
    m.driver.start({ invoice: 'INV-1' });
    m.sch.settle('r1:lookup:-:0', 'done', { result: { id: 'INV-1' } });
    equal(askedOf(m.driver), [], 'no ask on the success road');
    equal(m.sch.inputOf('r1:publish:-:0'), { found: { id: 'INV-1' }, why: null },
      'publish: the result under `found`, `why` NULL — present, the succeeded output`s error — and `given` absent (the ask did not run)');
    ok(Object.prototype.hasOwnProperty.call(m.sch.inputOf('r1:publish:-:0'), 'why'), '`why` is PRESENT holding null, not absent');
    equal(m.failures, [], 'nothing reported');
  });

  test('a resume from the parked ask re-composes the same error, and the asked element compares equal', async () => {
    const m = make(await CORPUS());
    m.driver.start({ invoice: 'INV-?' });
    m.sch.settle('r1:lookup:-:0', 'failed', { error: MSG });
    const cp = structuredClone(m.driver.checkpoint()) as Checkpoint;
    const r = make(await CORPUS());
    r.driver.resume(cp);
    equal(askedOf(r.driver).map((a) => a.input), [{ why: MSG }], 'the replay regenerates the asked element from the stored record`s error — not diverged');
    ok(r.driver.resolve('r1:resolve:-:0', 'done', { result: { value: 'INV-2' }, actor: 'p' }), 'and the resumed ask is answered');
    equal(r.sch.inputOf('r1:publish:-:0'), { found: null, why: MSG, given: { value: 'INV-2' } }, 'publish on the resumed runtime reads the same error');
    equal(r.failures, [], 'nothing reported');
  });

  test('a DECLINED ask is read too: its error is the person`s, or "resolved as failed" where they gave none', () => {
    const def = flow('decline', 'approve', [
      { id: 'approve', kind: 'ask', edges: [{ on: ['failed'], to: 'audit' }, { to: 'done' }] },
      { id: 'audit', kind: 'task', type: 'ReviewWorker', needs: { why: 'approve!error', answer: 'approve' }, edges: [{ to: 'done' }] },
      END,
    ]);
    const m = make(def);
    m.driver.start(null);
    ok(m.driver.resolve('r1:approve:-:0', 'failed', { error: 'not this quarter', actor: 'p' }), 'declined, with a reason');
    equal(m.sch.inputOf('r1:audit:-:0'), { why: 'not this quarter', answer: null }, 'audit: the person`s reason, beside a null answer');
    const n = make(def);
    n.driver.start(null);
    ok(n.driver.resolve('r1:approve:-:0', 'failed', { actor: 'p' }), 'declined with no reason');
    equal(n.sch.inputOf('r1:audit:-:0'), { why: 'resolved as failed', answer: null }, 'the RS-R1 default, "resolved as failed"');
  });

  test('a user_action task resolved FAILED: the RESOLUTION`s error, never the scheduler`s; resolved done: null', () => {
    const def = flow('parked', 'lookup', [
      { id: 'lookup', kind: 'task', type: 'ExtractWorker', edges: [{ on: ['done', 'failed'], to: 'report' }] },
      { id: 'report', kind: 'task', type: 'PublishWorker', needs: { why: 'lookup!error', got: 'lookup' }, edges: [{ to: 'done' }] },
      END,
    ]);
    const m = make(def);
    m.driver.start(null);
    m.sch.settle('r1:lookup:-:0', 'user_action', { error: 'scheduler: out of retries' });
    equal(m.sch.ids(), ['r1:lookup:-:0'], 'parked — no entry, so report is not entered yet');
    ok(m.driver.resolve('r1:lookup:-:0', 'failed', { error: 'gave up by hand', actor: 'p' }), 'resolved failed');
    equal(m.sch.inputOf('r1:report:-:0'), { why: 'gave up by hand', got: null }, 'the RESOLUTION`s error (the effective outcome`s), not the scheduler`s');
    const n = make(def);
    n.driver.start(null);
    n.sch.settle('r1:lookup:-:0', 'user_action', { error: 'scheduler: out of retries' });
    ok(n.driver.resolve('r1:lookup:-:0', 'done', { result: { v: 1 }, actor: 'p' }), 'resolved done');
    equal(n.sch.inputOf('r1:report:-:0'), { why: null, got: { v: 1 } }, 'resolved done: the error is null — the scheduler`s string is gone with its record');
  });

  test('the "?" form: ABSENT where the node did not run, the string where it failed, null where it succeeded', () => {
    const def = flow('maybe', 'ingest', [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ when: { predicate: 'risky' }, to: 'check' }, { to: 'publish' }] },
      { id: 'check', kind: 'task', type: 'ReviewWorker', optional: true, edges: [{ on: ['done', 'failed'], to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'PublishWorker', needs: { why: 'check!error?', got: 'check?' }, edges: [{ to: 'done' }] },
      END,
    ]);
    const run = (risky: boolean, settle?: (s: Fake) => void) => {
      const m = make(def, new Map([['risky', () => risky]]));
      m.driver.start(null);
      m.sch.settle('r1:ingest:-:0', 'done', { result: 1 });
      settle?.(m.sch);
      return m.sch.inputOf('r1:publish:-:0');
    };
    equal(run(false), {}, 'routed around check: BOTH keys absent (FD-C4) — the run does not stop');
    equal(run(true, (s) => s.settle('r1:check:-:0', 'failed', { error: 'bad checksum' })), { why: 'bad checksum', got: null }, 'check failed: the string, beside a null result');
    equal(run(true, (s) => s.settle('r1:check:-:0', 'done', { result: 'fine' })), { why: null, got: 'fine' }, 'check succeeded: null, beside the result');
  });

  test('the array form inside a map: one error per instance in ITEM order, settled out of order — and each instance`s own inside it', () => {
    const def = flow('per-item', 'ingest', [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'score', needs: { items: '.' } },
      { id: 'score', kind: 'task', type: 'ScoreWorker', optional: true, edges: [{ on: ['done', 'failed'], to: 'note' }] },
      { id: 'note', kind: 'task', type: 'ScoreWorker', needs: { mine: 'score!error' }, edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'PublishWorker', needs: { errors: ['score!error'], results: ['score'] }, edges: [{ to: 'done' }] },
      END,
    ]);
    const m = make(def);
    m.driver.start(null);
    m.sch.settle('r1:ingest:-:0', 'done', { result: ['a', 'b', 'c'] });
    // Settled in REVERSE item order, so an answer in settlement order differs from one in item order everywhere.
    m.sch.settle('r1:score:2:0', 'done', { result: 'C' });
    m.sch.settle('r1:score:1:0', 'failed', { error: 'e1' });
    m.sch.settle('r1:score:0:0', 'failed', { error: 'e0' });
    equal(['r1:note:0:0', 'r1:note:1:0', 'r1:note:2:0'].map((id) => m.sch.inputOf(id)), [{ mine: 'e0' }, { mine: 'e1' }, { mine: null }],
      'inside each instance: its OWN score`s error — e0, e1, and null for the one that succeeded');
    for (const i of [2, 0, 1]) m.sch.settle(`r1:note:${i}:0`, 'done', { result: i });
    equal(m.sch.inputOf('r1:publish:-:0'), { errors: ['e0', 'e1', null], results: [null, null, 'C'] },
      'after the join: one error per instance in ITEM order, beside the results in the same order');
    equal(m.failures, [], 'nothing reported');
  });

  test('at an EDGE: a predicate routes on ctx.needs.why, both ways, by the same resolution as a node`s', () => {
    const seen: unknown[] = [];
    const def = flow('edge', 'lookup', [
      { id: 'lookup', kind: 'task', type: 'ExtractWorker', optional: true, edges: [{ on: ['done', 'failed'], to: 'triage' }] },
      { id: 'triage', kind: 'task', type: 'ReviewWorker', edges: [
        { when: { predicate: 'transient' }, to: 'later', needs: { why: 'lookup!error' } },
        { to: 'done' },
      ] },
      { id: 'later', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
      END,
    ]);
    const preds = new Map([['transient', (c: DecisionContext) => { seen.push(c.needs.why); return typeof c.needs.why === 'string' && c.needs.why.startsWith('timeout'); }]]);
    const run = (settle: (s: Fake) => void) => {
      const m = make(def, preds);
      m.driver.start(null);
      settle(m.sch);
      m.sch.settle('r1:triage:-:0', 'done', { result: 1 });
      return m.sch.ids();
    };
    equal(run((s) => s.settle('r1:lookup:-:0', 'failed', { error: 'timeout: 30 s' })), ['r1:lookup:-:0', 'r1:triage:-:0', 'r1:later:-:0'], 'a transient error routes to later');
    equal(run((s) => s.settle('r1:lookup:-:0', 'failed', { error: 'refused' })), ['r1:lookup:-:0', 'r1:triage:-:0'], 'another error takes the default');
    equal(run((s) => s.settle('r1:lookup:-:0', 'done', { result: 'x' })), ['r1:lookup:-:0', 'r1:triage:-:0'], 'success: why is null, the default');
    equal(seen, ['timeout: 30 s', 'refused', null], 'the predicate saw exactly the three errors, null for the success');
  });

  test('nothing is copied: an error-only read leaves the shared-copy count at 0, its plain twin makes one', () => {
    const def = (needs: Record<string, unknown>) => flow('copies', 'lookup', [
      { id: 'lookup', kind: 'task', type: 'ExtractWorker', optional: true, edges: [{ on: ['done', 'failed'], to: 'b' }] },
      { id: 'b', kind: 'task', type: 'PublishWorker', needs, edges: [{ to: 'done' }] },
      END,
    ]);
    const err = make(def({ why: 'lookup!error' }));
    err.driver.start(null);
    err.sch.settle('r1:lookup:-:0', 'done', { result: { big: [1, 2, 3] } });
    equal(err.sch.inputOf('r1:b:-:0'), { why: null }, 'the error read: null');
    equal(cacheOf(err.driver)?.copies, 0, 'and NO shared copy made — the result was never read');
    const plain = make(def({ got: 'lookup' }));
    plain.driver.start(null);
    plain.sch.settle('r1:lookup:-:0', 'done', { result: { big: [1, 2, 3] } });
    equal(cacheOf(plain.driver)?.copies, 1, 'the CONTROL: the plain twin makes ONE shared copy (ADR 0126) — the counter can see a read');
    const failed = make(def({ why: 'lookup!error', again: 'lookup!error' }));
    failed.driver.start(null);
    failed.sch.settle('r1:lookup:-:0', 'failed', { error: MSG });
    equal(failed.sch.inputOf('r1:b:-:0'), { why: MSG, again: MSG }, 'two error keys: the same string twice (a primitive, nothing to share)');
    equal(cacheOf(failed.driver)?.copies, 0, 'and still no copy');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
