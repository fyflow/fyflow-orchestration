/**
 * Ladder L2 — **the header BEFORE the first event** — `spec/run-state.md` v0.25 `RN-R39`,
 * [ADR 0112](../../doc/decisions/0112-a-run-delivers-its-header-before-its-first-event.md),
 * [P36](../../doc/plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) decision 1 and stop-and-asks (d)
 * and (e), [W185](../../doc/work-items/w185-the-header-before-the-first-event.md).
 *
 * **The contract, as P36 (e) answered it**: `onHeader` is called ONCE, synchronously, inside `start()` — AFTER `FD-R4`'s
 * check and the entry payload's clone, BEFORE anything is appended or handed to the scheduler — with a FROZEN copy equal
 * to `checkpoint().header`. A throw from it leaves the driver UNSTARTED: nothing appended, nothing handed on, nothing
 * reported, the throw at `start()`'s caller, and a retry may start the same driver. A refused `start()` never calls it,
 * and `resume()` never does.
 *
 * **Every ORDER is asserted against BOTH things it is claimed before** — the first `onFoldInput` AND the first `addTask` —
 * on one shared log the double, the fold callback and `onHeader` all write to, and each claim beside a CONTROL showing the
 * log can see what it says is absent (an element, a hand-off): an empty observer would pass every *before* for free.
 * Expected values are hand-written from the flow's shape and the rule — `RN-R15`'s five facts, `JP-R5`'s every
 * `branch.opened` before any branch is entered, 2N + 1 for an entry fan-out of N — never read off a run.
 */
import { collected, equal, ok, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, type CheckpointHeader, type RunFailure } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

/** The consumer's own error class — read as `Boom.name`, because the browser bundle renames classes. */
class Boom extends Error {}

/** L2's scheduler double: every hand-off, and every cancel, written to the SHARED log the case reads its order from. */
class Fake {
  readonly added: string[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  private readonly log: string[];
  constructor(log: string[]) { this.log = log; }
  addTask(task: unknown): void {
    const id = (task as { id: string }).id;
    this.added.push(id);
    this.log.push(`add ${id}`);
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  cancel(id: string): Promise<boolean> { this.log.push(`cancel ${id}`); return Promise.resolve(true); }
  done(id: string): void {
    const detail = { id, state: 'done', result: { v: id }, error: null, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of this.listeners.get('task.completed') ?? []) fn({ detail });
  }
}

const flow = (flowId: string, nodes: unknown[], entry: string, version = 1): FlowDefinition =>
  ({ flowId, version, entry, nodes } as unknown as FlowDefinition);
/** x -> y -> done, at version 3 so a header carrying a default version differs. */
const LINE = flow('hdr-line', [
  { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'y' }] },
  { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'x', 3);
/** An ask at the entry, then y. */
const ASK = flow('hdr-ask', [
  { id: 'q', kind: 'ask', edges: [{ to: 'y' }] },
  { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'q');
/** An ENTRY fan-out of THREE: `start()`'s step appends 2N + 1 = 7 elements and hands on three tasks. */
const THREE = flow('hdr-three', [
  { id: 'split', kind: 'fanout', branches: ['a', 'b', 'c'] },
  { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
  { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
  { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
  { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'split');

const label = (e: FoldInput): string => {
  switch (e.kind) {
    case 'dispatched': return `dispatched ${e.taskId}`;
    case 'region': return `${e.event.type} ${e.event.branchPath}`;
    case 'regionEntered': return `regionEntered ${e.regionId}`;
    case 'outcome': return `outcome ${e.record.taskId}`;
    case 'resumed': return `resumed ${e.taskIds.join(',')}`;
    default: return e.kind;
  }
};

interface Rig {
  readonly d: Driver;
  readonly s: Fake;
  /** The ONE log: `header`, `fold <seq> <label>` and `add <id>`, in the order they happened. */
  readonly log: string[];
  readonly headers: CheckpointHeader[];
  readonly failures: RunFailure[];
}

/**
 * A driver whose `onHeader` records the header (and then runs `hook`, which may throw or re-enter), and whose
 * `onFoldInput` and scheduler write to the same log. `withHeader: false` builds the same driver with NO `onHeader`.
 */
function rig(def: FlowDefinition, opts: { hook?: (h: CheckpointHeader, d: Driver) => void; withHeader?: boolean; runId?: string; strict?: boolean } = {}): Rig {
  const log: string[] = [];
  const headers: CheckpointHeader[] = [];
  const failures: RunFailure[] = [];
  const s = new Fake(log);
  const types = opts.strict
    ? typesFor(['T'], {}, { T: { url: 'test://T', inputSchema: { type: 'object', required: ['must'] } } } as never)
    : typesFor(['T']);
  const box: { d: Driver | null } = { d: null };
  const d = new Driver(def, {
    runId: opts.runId ?? 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...types,
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
    onFoldInput: (e, seq) => { log.push(`fold ${seq} ${label(e)}`); },
    onRunFailure: (f) => { failures.push(f); },
    ...(opts.withHeader === false ? {} : {
      onHeader: (h: CheckpointHeader) => {
        log.push('header');
        headers.push(h);
        opts.hook?.(h, box.d!);
      },
    }),
  });
  box.d = d;
  return { d, s, log, headers, failures };
}

/** Where in the log the first entry with this prefix is, `-1` when there is none. */
const firstAt = (log: readonly string[], prefix: string): number => log.findIndex((l) => l.startsWith(prefix));

const SUITE = 'L2 — RN-R39: onHeader — the header handed over ONCE inside start(), before the first element and before anything reaches the scheduler (P36 (d), (e))';
const DECLARED_CASES = [
  'an entry TASK: called once, BEFORE the first onFoldInput and BEFORE the first addTask — a frozen copy equal to checkpoint().header',
  'an entry FAN-OUT of three: before all SEVEN elements (2N + 1) and before all three hand-offs',
  'the header handed over is the consumer`s OWN copy: frozen, and a write into its entry payload moves nothing the driver holds',
  'a THROW leaves the driver UNSTARTED — nothing appended, nothing handed on, nothing reported, the throw at the caller — and a retry starts it',
  'NEVER called on a refused start(): FD-R4`s BoundaryRefused, an uncloneable payload`s DataCloneError, a second start`s MultipleRuns',
  'NEVER called by resume() — the resumed driver re-dispatches, and its onHeader is silent',
  'a call the callback makes back into the driver is refused as on a driver with no run — and the run starts ONCE',
  'a run with NO onHeader is unmoved: the same fold inputs and the same hand-offs as the same run with one (P36 prediction 2)',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('an entry TASK: called once, BEFORE the first onFoldInput and BEFORE the first addTask — a frozen copy equal to checkpoint().header', () => {
    const r = rig(LINE, { runId: 'batch42' });
    r.d.start({ n: 1, nested: { k: 'v' } });
    // The CONTROL first: the log SAW the element and the hand-off, so *before* below is not vacuous.
    equal(r.log.filter((l) => !l.startsWith('header')).map((l) => l.replace(/^fold \d+ /, 'fold ')).sort(),
      ['add batch42:x:-:0', 'fold dispatched batch42:x:-:0'],
      'the CONTROL: start() of an entry task appends ONE `dispatched` and hands ONE task on, and the log saw both');
    equal(r.headers.length, 1, 'onHeader is called ONCE');
    equal(r.log[0], 'header', 'and it is the first thing in the log');
    const h = firstAt(r.log, 'header');
    ok(h < firstAt(r.log, 'fold '), `BEFORE the first onFoldInput — header at ${h}, first element at ${firstAt(r.log, 'fold ')}`);
    ok(h < firstAt(r.log, 'add '), `BEFORE the first addTask — header at ${h}, first hand-off at ${firstAt(r.log, 'add ')}`);
    equal(r.headers[0], { format: 1, runId: 'batch42', flowId: 'hdr-line', version: 3, entryPayload: { n: 1, nested: { k: 'v' } } },
      'RN-R15`s five facts, each a literal from the flow and the call — version 3 and run batch42, so a wrong selection differs');
    equal(r.headers[0], r.d.checkpoint().header, 'equal to checkpoint().header');
    ok(r.headers[0] !== r.d.checkpoint().header && r.headers[0]!.entryPayload !== r.d.checkpoint().header.entryPayload,
      'and a copy of its own, down to the entry payload');
    ok(Object.isFrozen(r.headers[0]), 'FROZEN');
    equal(r.failures.length, 0, 'and nothing was reported');
  });

  test('an entry FAN-OUT of three: before all SEVEN elements (2N + 1) and before all three hand-offs', () => {
    const r = rig(THREE);
    r.d.start({ go: true });
    const folds = r.log.filter((l) => l.startsWith('fold ')).map((l) => l.replace(/^fold \d+ /, ''));
    // Hand-written: `regionEntered`, then every `branch.opened` before any branch is entered (JP-R5), then each branch's
    // `dispatched` — 2N + 1 for N = 3. Compared as a SET here and counted: the order among them is not this rule's.
    equal([...folds].sort(), ['branch.opened 0', 'branch.opened 1', 'branch.opened 2', 'dispatched r1:a:0:0', 'dispatched r1:b:1:0',
      'dispatched r1:c:2:0', 'regionEntered split'], 'the CONTROL: start() delivers the seven elements an entry fan-out of three appends');
    equal(r.s.added.slice().sort(), ['r1:a:0:0', 'r1:b:1:0', 'r1:c:2:0'], 'and hands on its three tasks');
    equal(r.headers.length, 1, 'onHeader once');
    const h = firstAt(r.log, 'header');
    ok(h === 0, `the header is the log's first entry (at ${h})`);
    const late = r.log.flatMap((l, i) => ((l.startsWith('fold ') || l.startsWith('add ')) && i < h ? [l] : []));
    equal(late, [], 'NOTHING — none of the seven elements, none of the three hand-offs — precedes it');
    // A FURTHER step — a branch settles and arrives at the join — so *not called again* has a step to be called on.
    r.s.done('r1:a:0:0');
    ok(r.log.some((l) => l.startsWith('fold ') && l.endsWith('outcome r1:a:0:0')), 'the CONTROL: the further step ran and the log saw it');
    equal(r.log.filter((l) => l === 'header').length, 1, 'and it is not called again by the fan-out`s further step');
  });

  test('the header handed over is the consumer`s OWN copy: frozen, and a write into its entry payload moves nothing the driver holds', () => {
    const payload = { items: [1, 2], meta: { who: 'ana' } };
    const seen: string[] = [];
    const r = rig(LINE, {
      hook: (h) => {
        // A consumer writing into what it was handed: the frozen header refuses a field write (module code is strict)…
        throws(() => { (h as { runId: string }).runId = 'forged'; }, 'TypeError', 'the header itself is FROZEN');
        // …and its entry payload is a COPY, separate from the caller's object both ways: the caller's write does not show
        // in the consumer's copy, and the consumer's write does not reach the caller's object — read in the hook itself, so
        // a header handed the caller's own payload fails HERE (W185's adequacy reader, A1).
        const mine = h.entryPayload as { meta: { who: string } };
        payload.meta.who = 'MUTATED BY THE CALLER INSIDE THE CALLBACK';
        seen.push(mine.meta.who);
        mine.meta.who = 'WRITTEN BY THE CONSUMER';
        seen.push(payload.meta.who);
      },
    });
    r.d.start(payload);
    equal(seen, ['ana', 'MUTATED BY THE CALLER INSIDE THE CALLBACK'],
      'the consumer`s copy still read `ana` after the caller wrote, and the caller`s object kept its own write after the consumer wrote');
    equal(r.d.checkpoint().header.entryPayload, { items: [1, 2], meta: { who: 'ana' } },
      'checkpoint().header`s entry payload is the value AT THE CALL — neither write reached it (RN-R15)');
    equal(r.headers[0]!.runId, 'r1', 'and the frozen field kept its value');
  });

  test('a THROW leaves the driver UNSTARTED — nothing appended, nothing handed on, nothing reported, the throw at the caller — and a retry starts it', () => {
    const boom = new Boom('the store could not write the header');
    let throwing = true;
    const r = rig(LINE, { hook: () => { if (throwing) throw boom; } });
    let thrown: unknown = null;
    try { r.d.start({ n: 1 }); } catch (e) { thrown = e; }
    ok(thrown === boom, `the consumer's OWN error reaches start()'s caller, by identity: ${String(thrown)}`);
    equal(r.log, ['header'], 'the log holds the call and NOTHING after it — no element, no hand-off');
    equal(r.d.foldInputs().length, 0, 'nothing appended');
    equal(r.s.added, [], 'nothing handed to the scheduler');
    equal(r.failures.length, 0, 'onRunFailure NOT called — no run exists to have failed');
    equal(r.d.hasFailed(), false, 'and the driver is not failed');
    throws(() => r.d.checkpoint(), 'NotStarted', 'the driver is UNSTARTED: there is no header to checkpoint');
    // The retry — the same driver, its callback no longer throwing. The CONTROL for every *nothing* above: the same log
    // now SEES the element and the hand-off, so the empty observations were not an observer that sees nothing.
    throwing = false;
    r.d.start({ n: 2 });
    equal(r.log.slice(0, 2), ['header', 'header'], 'the retry calls onHeader again, FIRST — nothing between the two calls');
    equal(r.log.slice(2).sort(), ['add r1:x:-:0', 'fold 0 dispatched r1:x:-:0'],
      'and THIS time the same observer sees the element, at position 0, and the hand-off — both after the header');
    equal(r.s.added, ['r1:x:-:0'], 'exactly one task handed on, by the retry');
    equal(r.headers.map((h) => h.entryPayload), [{ n: 1 }, { n: 2 }], 'each call was handed its own call`s header');
    equal(r.d.checkpoint().header.entryPayload, { n: 2 }, 'and the run is the retry`s');
    equal(r.failures.length, 0, 'nothing reported, either time');
  });

  test('NEVER called on a refused start(): FD-R4`s BoundaryRefused, an uncloneable payload`s DataCloneError, a second start`s MultipleRuns', () => {
    const r = rig(LINE, { strict: true });
    throws(() => r.d.start({ nope: 1 }), 'BoundaryRefused', 'the ARRANGEMENT: FD-R4 refuses this payload');
    equal(r.headers.length, 0, 'onHeader NOT called on an FD-R4 refusal — the walk runs first');
    let cloneError: unknown = null;
    try { r.d.start({ must: 'x', fn: () => 1 }); } catch (e) { cloneError = e; }
    equal((cloneError as { name?: string } | null)?.name, 'DataCloneError', 'the ARRANGEMENT: the payload`s clone refuses it');
    equal(r.headers.length, 0, 'onHeader NOT called on a DataCloneError — the clone runs before it');
    equal(r.log, [], 'and nothing at all was logged');
    // The CONTROL: the same driver, a payload both accept — the callback IS wired, and called once.
    r.d.start({ must: 'first' });
    equal(r.headers.length, 1, 'the CONTROL: a payload both accept is handed its header');
    throws(() => r.d.start({ must: 'second' }), 'MultipleRuns', 'the ARRANGEMENT: a second start() is refused');
    equal(r.headers.length, 1, 'onHeader NOT called again on MultipleRuns — the refusal is the first thing start() asks');
  });

  test('NEVER called by resume() — the resumed driver re-dispatches, and its onHeader is silent', () => {
    const first = rig(THREE, { withHeader: false });
    first.d.start({ go: true });
    first.s.done('r1:a:0:0');
    const cp = structuredClone(first.d.checkpoint());
    const second = rig(THREE);
    second.d.resume(cp);
    // The CONTROL: the resume ran — the two tasks still in flight handed to the new scheduler, `resumed` appended.
    equal(second.s.added, ['r1:b:1:0', 'r1:c:2:0'], 'the CONTROL: the resume handed on what was in flight');
    ok(second.log.some((l) => l.endsWith('resumed r1:b:1:0,r1:c:2:0')), 'and appended its `resumed` element');
    equal(second.headers.length, 0, 'onHeader was NOT called — resume()`s caller already holds the header');
    equal(second.log.filter((l) => l === 'header'), [], 'nothing in the log says otherwise');
    // And an EMPTY stored sequence — the replay starts from the entry exactly as start() does — still never calls it.
    const third = rig(THREE);
    third.d.resume({ header: cp.header, events: [] });
    equal(third.s.added.slice().sort(), ['r1:a:0:0', 'r1:b:1:0', 'r1:c:2:0'], 'the CONTROL: a resume from the header alone re-dispatches all three');
    equal(third.headers.length, 0, 'and onHeader is not called there either');
  });

  test('a call the callback makes back into the driver is refused as on a driver with no run — and the run starts ONCE', () => {
    const refusals: string[] = [];
    const tryIt = (what: string, fn: () => unknown) => {
      try { fn(); refusals.push(`${what}: accepted`); } catch (e) { refusals.push(`${what}: ${(e as Error).name}`); }
    };
    const stored = rig(LINE, { withHeader: false });
    stored.d.start({ n: 0 });
    const cp = structuredClone(stored.d.checkpoint());
    const r = rig(LINE, {
      hook: (_h, d) => {
        tryIt('start', () => d.start({ n: 'again' }));
        tryIt('resume', () => d.resume(cp));
        tryIt('checkpoint', () => d.checkpoint());
        tryIt('cancel', () => { void d.cancel({ actor: 'ops' }); });
        tryIt('stop', () => { void d.stop({ actor: 'ops' }); });
        tryIt('pause', () => d.pause({ actor: 'ops' }));
        tryIt('unpause', () => d.unpause({ actor: 'ops' }));
        refusals.push(`resolve: ${String(d.resolve('r1:x:-:0', 'done', { actor: 'ops' }))}`);
      },
    });
    r.d.start({ n: 1 });
    // Hand-written: no run exists while the header is being written, so each refuses as it does on an unstarted driver —
    // except the two DOORS, which see a driver already entered (ID-R3): a second entry would dispatch the run twice.
    equal(refusals, ['start: MultipleRuns', 'resume: MultipleRuns', 'checkpoint: NotStarted', 'cancel: RunControlRefused',
      'stop: RunControlRefused', 'pause: RunControlRefused', 'unpause: RunControlRefused', 'resolve: false'], 'every call back into the driver from onHeader is refused');
    equal(r.s.added, ['r1:x:-:0'], 'the run started ONCE — one hand-off, not two');
    equal(r.d.foldInputs().map(label), ['dispatched r1:x:-:0'], 'one element, at position 0');
    equal(r.d.checkpoint().header.entryPayload, { n: 1 }, 'the run is the OUTER start`s');
    equal(r.failures.length, 0, 'and nothing was reported');

    // An ASK at the entry, ANSWERED from inside the callback: nothing is parked yet, so the answer is refused (`false`) —
    // never pending, never taken when the step ends — and the run parks the ask after the call, its answer still to give.
    const answers: string[] = [];
    const a = rig(ASK, { hook: (_h, d) => { answers.push(String(d.resolve('r1:q:-:0', 'done', { result: { ok: true }, actor: 'ana' }))); } });
    a.d.start({ n: 1 });
    equal(answers, ['false'], 'an answer given from inside onHeader is refused: there is no run, and no ask parked');
    equal(a.d.foldInputs().map(label), ['asked'], 'the run parked the ask — and took NO answer at its step`s end');
    ok(a.d.resolve('r1:q:-:0', 'done', { result: { ok: true }, actor: 'ana' }), 'the CONTROL: the same answer, given now, is accepted');
  });

  test('a run with NO onHeader is unmoved: the same fold inputs and the same hand-offs as the same run with one (P36 prediction 2)', () => {
    const drive = (withHeader: boolean) => {
      const r = rig(THREE, { withHeader });
      r.d.start({ go: true });
      for (const id of ['r1:b:1:0', 'r1:a:0:0', 'r1:c:2:0']) r.s.done(id);
      return r;
    };
    const without = drive(false);
    const withIt = drive(true);
    equal(fold(without.d.foldInputs()).outcome, 'completed', 'the CONTROL: the run reaches its join and its end, so the sequence compared is a whole run');
    equal(withIt.d.foldInputs(), without.d.foldInputs(), 'the fold-input sequence is the same, element for element');
    equal(withIt.s.added, without.s.added, 'and so are the hand-offs');
    equal(without.headers.length, 0, 'the ARRANGEMENT: the first run passed no onHeader');
    equal(withIt.headers.length, 1, 'and the second passed one, called once');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
