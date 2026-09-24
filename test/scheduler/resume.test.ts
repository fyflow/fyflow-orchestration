/**
 * Ladder L1 — **resuming through the RUNTIME**: `runtime.resume` (`RN-R25`), the positions a consumer is
 * handed through ADR 0058's composition (`RN-R24`), and the run ids in use
 * ([Q364](../../doc/open-questions.md), P23 stop-and-ask (b)).
 * [ADR 0065](../../doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md),
 * [W89](../../doc/work-items/w89-what-resuming-is.md). `createRuntime`'s two construction seams, as
 * `test/scheduler/checkpoint.test.ts` uses them, so nothing here builds a thread.
 *
 * **Every checkpoint is taken from a run on ANOTHER runtime** — the process that stored it is gone, so
 * the resuming runtime has minted nothing and holds nothing. **And each case puts the right selection
 * where the wrong ones differ**: the resumed run is the stored runtime's SECOND (`r2`), so a fresh
 * runtime's counter reaches it on its second mint; the consumer's first position is past 0, so a count
 * the runtime kept from its wrapper's first call differs (W88's dated ceilings `c3` and `r6`); and the
 * run ids refused include a FINISHED run's and a refused start's, so *live* read as *running* differs.
 */
import { collected, equal, ok, suite, throws } from '../harness.ts';
import { createRuntime, RunIdInUse } from '../../src/scheduler/runtime.ts';
import { Driver, ResumeRefused } from '../../src/driver/driver.ts';
import type { Checkpoint } from '../../src/driver/driver.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { FlowDefinition, RegistryDocument } from '../../src/definition/types.ts';

const DOCUMENT = {
  workers: { w: { url: 'https://example.test/w.js' } },
  nodeTypes: { T: { worker: 'w', inline: true } },
  predicates: [],
} as unknown as RegistryDocument;
/** The same document with a worker whose input schema REFUSES `{ nope }` — `FD-R4` at start. */
const STRICT = {
  workers: { w: { url: 'https://example.test/w.js', inputSchema: { type: 'object', required: ['must'] } } },
  nodeTypes: { T: { worker: 'w', inline: true } },
  predicates: [],
} as unknown as RegistryDocument;
const LINEAR = {
  flowId: 'resume-rt', version: 4, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'b' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

function seams() {
  const added: { id: string }[] = [];
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const settle = (id: string, result: unknown) => {
    const detail = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
  };
  const createPool = (url: string, options: unknown) => ({ url, options }) as never;
  const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => ({
    workerPools: p, groups: g,
    addTask(t: unknown) { added.push(t as { id: string }); },
    addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    shutdown() { return Promise.resolve(); },
  }) as never;
  return { added, settle, createPool, createScheduler };
}
const runtimeOn = (s: ReturnType<typeof seams>, doc: RegistryDocument = DOCUMENT) =>
  createRuntime(doc, {}, { createPool: s.createPool, createScheduler: s.createScheduler });

/**
 * **The stored run: runtime A's SECOND, `r2`**, stored as a consumer stores it — the header, then
 * every element `onFoldInput` hands over, by position — and cut once `a` has settled and `b` is
 * running. The process that ran it is then gone: runtime A is never touched again.
 */
function storedRun(): Checkpoint {
  const s = seams();
  const a = runtimeOn(s);
  a.start(LINEAR, { first: true });
  const store: FoldInput[] = [];
  const h = a.start(LINEAR, { n: 2 }, { onFoldInput: (i, seq) => { store[seq] = structuredClone(i); } });
  s.settle('r2:a:-:0', { a: 1 });
  return { header: h.header, events: store.slice() };
}

/** A caught `RunIdInUse`, or a failure naming what happened instead. */
function inUse(fn: () => unknown): RunIdInUse {
  try { fn(); } catch (e) { if (e instanceof RunIdInUse) return e; throw new Error(`expected RunIdInUse, got ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`); }
  throw new Error('expected RunIdInUse, nothing was thrown');
}

const SUITE = 'W89 — resuming through the runtime: runtime.resume, the positions, and run ids in use';
const DECLARED_CASES = [
  'runtime.resume hands back { driver, done, header }: the stored header, and done the WHOLE run',
  'the consumer`s onFoldInput receives the DRIVER`s positions from the stored length on — where a runtime counter would start at 0',
  'RN-R25 — a run id in use is refused whatever its run is doing, and the minted counter skips it',
  'RN-R25 — why a finished run`s id stays in use: its driver still hears every settlement under it',
  'RN-R25 — a checkpoint refused by its HEADER costs no run id; one refused mid-replay does',
  '`done` is the WHOLE run across three processes — a store carrying an earlier resume, a tail delivered first',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('runtime.resume hands back { driver, done, header }: the stored header, and done the WHOLE run', async () => {
    const cp = storedRun();
    ok(cp.header.runId === 'r2' && cp.events.length === 3, `the ARRANGEMENT: the stored run is r2, ${cp.events.length} elements, cut with b running`);
    const s = seams();
    const b = runtimeOn(s);
    const h = b.resume(LINEAR, cp);
    equal(h.header, cp.header, 'the handle`s header IS the stored header, field by field');
    ok(h.header !== cp.header && h.header.entryPayload !== cp.header.entryPayload && Object.isFrozen(h.header),
      'a frozen COPY of it, down to the entry payload — the driver`s own, read back');
    equal(s.added.map((t) => t.id), ['r2:b:-:0'], 'the one task in flight is handed to THIS runtime`s scheduler, at its stored id');
    s.settle('r2:b:-:0', { b: 1 });
    const end = await h.done;
    equal(end.outcome, 'completed', '`done` resolves when the resumed run ends');
    equal(end, fold(h.driver.foldInputs()), 'with the fold of the WHOLE run — the stored elements included, stepped from the checkpoint');
    equal([end.resumes, Object.keys(end.nodes).sort()], [[['r2:b:-:0']], ['r2:a:-:0', 'r2:b:-:0']],
      'which knows `a`, settled in the process that is gone, and records the resume');
  });

  test('the consumer`s onFoldInput receives the DRIVER`s positions from the stored length on — where a runtime counter would start at 0', () => {
    const cp = storedRun();
    const s = seams();
    const b = runtimeOn(s);
    // A run on this runtime FIRST, so a counter the runtime kept across its runs would be past 0 too.
    const before: number[] = [];
    b.start(LINEAR, { x: 0 }, { onFoldInput: (_i, seq) => { before.push(seq); } });
    const seen: { seq: number; input: FoldInput }[] = [];
    const h = b.resume(LINEAR, cp, { onFoldInput: (input, seq) => { seen.push({ seq, input }); } });
    s.settle('r2:b:-:0', { b: 1 });
    const all = h.driver.foldInputs();
    ok(cp.events.length > 0 && before.length > 0,
      `the ARRANGEMENT: the store held ${cp.events.length} elements, and this runtime had already handed another run ${before.length} positions`);
    equal(seen.map((x) => x.seq), all.map((_, i) => i).slice(cp.events.length),
      'positions stored-length … n-1: the driver`s index — a count from this callback`s first call would start at 0 (W88`s dated ceilings c3 and r6, expired here)');
    for (const x of seen) equal(x.input, all[x.seq], `position ${x.seq} is the element the driver holds there`);
    equal(seen[0]!.input.kind, 'resumed', 'and the first is `resumed` — a quiescent store has no lost tail');
  });

  test('RN-R25 — a run id in use is refused whatever its run is doing, and the minted counter skips it', async () => {
    const cp = storedRun();
    const s = seams();
    const b = runtimeOn(s);
    const resumed = b.resume(LINEAR, cp);
    const first = b.start(LINEAR, { m: 1 });
    const second = b.start(LINEAR, { m: 2 });
    equal([first.driver.runId, second.driver.runId], ['r1', 'r3'],
      'the counter mints r1, then SKIPS r2 — the resumed run holds it — and mints r3; a counter that did not skip would have minted the resumed run`s own id');
    const before = s.added.length;
    equal(inUse(() => b.start(LINEAR, {}, { runId: 'r2' })).at, 'r2', 'a start naming the RESUMED run`s id is refused, naming it');
    equal(inUse(() => b.resume(LINEAR, cp)).at, 'r2', 'and so is resuming it a second time');
    equal(s.added.length, before, 'refused before any driver was built: nothing reached the scheduler');
    // A FINISHED run's id: `live` read as `running` would admit it.
    s.settle('r1:a:-:0', { a: 1 });
    s.settle('r1:b:-:0', { b: 1 });
    equal((await first.done).outcome, 'completed', 'the ARRANGEMENT: r1 has finished');
    equal(inUse(() => b.start(LINEAR, {}, { runId: 'r1' })).at, 'r1', 'and its id is refused all the same');
    // A REFUSED start's id: its driver was built, and it subscribed.
    const sc = seams();
    const c = runtimeOn(sc, STRICT);
    throws(() => c.start(LINEAR, { nope: 1 }, { runId: 'bx' }), 'BoundaryRefused', 'the ARRANGEMENT: FD-R4 refuses this start');
    equal(inUse(() => c.start(LINEAR, { must: 1 }, { runId: 'bx' })).at, 'bx', 'and the id of a start FD-R4 refused is in use too — its driver still listens');
    ok(resumed.driver.runId === 'r2', 'the CONTROL: the resumed run itself is untouched by any of it');
  });

  test('RN-R25 — why a finished run`s id stays in use: its driver still hears every settlement under it', async () => {
    const s = seams();
    const r = runtimeOn(s);
    const h = r.start(LINEAR, {}, { runId: 'q' });
    s.settle('q:a:-:0', { a: 1 });
    s.settle('q:b:-:0', { b: 1 });
    equal((await h.done).outcome, 'completed', 'the ARRANGEMENT: run q has finished');
    const finished = h.driver.foldInputs().length;
    // The collision the refusal exists to prevent, built by hand — the road `new Driver` leaves open.
    const second = new Driver(LINEAR, { ...r.registry, runId: 'q', scheduler: r.scheduler, joinPolicy: liveToken, onRunFailure: () => {} });
    second.start({ again: true });
    s.settle('q:a:-:0', { a: 'the second run' });
    ok(h.driver.foldInputs().length > finished,
      `the FINISHED run's sequence grew from ${finished} to ${h.driver.foldInputs().length} — its checkpoint changed after it completed, which is what RunIdInUse refuses`);
    equal(inUse(() => r.start(LINEAR, {}, { runId: 'q' })).at, 'q', 'and the runtime refuses to build that collision itself');
  });

  test('RN-R25 — a checkpoint refused by its HEADER costs no run id; one refused mid-replay does', () => {
    const cp = storedRun();
    const b = runtimeOn(seams());
    let e: unknown;
    try { b.resume(LINEAR, { ...cp, header: { ...cp.header, format: 2 } }); } catch (x) { e = x; }
    ok(e instanceof ResumeRefused && e.reason === 'format', 'the ARRANGEMENT: refused by its header');
    equal(b.resume(LINEAR, cp).driver.runId, 'r2', 'and the SAME run id then resumes on the same runtime — the header was refused before any driver existed');
    // W89's conformity reader, finding 1: a header with no runId was refused only AFTER the runtime minted an id for it.
    const e2 = runtimeOn(seams());
    let noId: unknown;
    try { e2.resume(LINEAR, { ...cp, header: { ...cp.header, runId: undefined as unknown as string } }); } catch (x) { noId = x; }
    ok(noId instanceof ResumeRefused && noId.reason === 'format', 'a header with no runId is refused as `format`, before anything is built');
    equal(e2.start(LINEAR, {}).driver.runId, 'r1', 'so the runtime minted nothing for it — its first mint is still r1');
    // Finding 7: an entry payload the clone refuses — thrown before a driver exists, so the id is still free.
    const e3 = runtimeOn(seams());
    let clone: unknown;
    try { e3.resume(LINEAR, { ...cp, header: { ...cp.header, entryPayload: { f: () => 1 } } }); } catch (x) { clone = x; }
    equal((clone as { name?: string })?.name, 'DataCloneError', 'an uncloneable entry payload throws the platform`s DataCloneError');
    equal(e3.resume(LINEAR, cp).driver.runId, 'r2', 'and the corrected checkpoint resumes under the same id on the same runtime');
    const c = runtimeOn(seams());
    const tampered: Checkpoint = { header: cp.header, events: cp.events.map((x, k) => (k === 0 ? { kind: 'dispatched', taskId: 'r2:b:-:0' } as FoldInput : x)) };
    let d: unknown;
    try { c.resume(LINEAR, tampered); } catch (x) { d = x; }
    ok(d instanceof ResumeRefused && d.reason === 'diverged' && d.index === 0, 'the ARRANGEMENT: refused mid-replay, at position 0');
    equal(inUse(() => c.resume(LINEAR, cp)).at, 'r2',
      'and THAT one has spent the id on this runtime — the replaying driver was built and subscribed; a fresh runtime resumes it');
  });

  test('`done` is the WHOLE run across three processes — a store carrying an earlier resume, a tail delivered first', async () => {
    // W89's adequacy reader, a28-a29: in every other case the first element delivered was `resumed`, on a store holding
    // none, so stepping the stored events AFTER the first delivered one — or on every one — was indistinguishable.
    const LIN3 = {
      flowId: 'resume-three', version: 1, entry: 'a',
      nodes: [
        { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'b' }] },
        { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'c' }] },
        { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const store: FoldInput[] = [];
    const keep = (i: FoldInput, seq: number) => { store[seq] = structuredClone(i); };
    const s1 = seams();
    const h1 = runtimeOn(s1).start(LIN3, { n: 1 }, { runId: 'x', onFoldInput: keep });
    s1.settle('x:a:-:0', { a: 1 });
    // The second process dies INSIDE the callback for b's settlement: its store ends before c is dispatched.
    let cutAt = -1;
    const s2b = seams();
    const store2: FoldInput[] = [];
    runtimeOn(s2b).resume(LIN3, { header: h1.header, events: store.slice() }, {
      onFoldInput: (i, seq) => { store2[seq] = structuredClone(i); if (i.kind === 'outcome' && cutAt < 0) cutAt = seq; },
    });
    s2b.settle('x:b:-:0', { b: 1 });
    const third: FoldInput[] = [...store.slice(), ...store2.slice(store.length, cutAt + 1)];
    ok(third.some((e) => e.kind === 'resumed') && third.at(-1)?.kind === 'outcome',
      'the ARRANGEMENT: the third process`s store carries the second`s resume and ends at b`s settlement, before c`s dispatch');
    const s3 = seams();
    const firsts: string[] = [];
    const h3 = runtimeOn(s3).resume(LIN3, { header: h1.header, events: third }, { onFoldInput: (i) => { firsts.push(i.kind); } });
    equal(firsts[0], 'dispatched', 'the ARRANGEMENT: the first element delivered is the lost tail`s dispatch of c, not `resumed`');
    s3.settle('x:c:-:0', { c: 1 });
    const end = await h3.done;
    equal(JSON.stringify(end), JSON.stringify(fold(h3.driver.foldInputs())),
      '`done` IS the fold of the whole run, byte for byte — the stored events stepped once, before the first delivered element');
    equal(end.resumes, [['x:b:-:0'], ['x:c:-:0']], 'and it records both resumes, in order');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((x) => x.suite === SUITE).flatMap((x) => x.cases.map((c) => c.name)).sort();
    equal([...DECLARED_CASES].sort().filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !DECLARED_CASES.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
