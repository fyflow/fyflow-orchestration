/**
 * **L2 — WHEN an ask was asked: `observedAt` on the `asked` element, kept across a replay** — `spec/run-state.md` v0.35
 * `RN-R37`, `RN-R19`'s regenerated clause, `RN-R20`, `RN-R24`, `RN-R36`, `RN-R45`;
 * [ADR 0130](../../doc/decisions/0130-a-regenerated-asked-element-keeps-the-stored-runs-time.md),
 * [W208](../../doc/work-items/w208-a-transforms-cause-and-when-an-ask-was-asked.md), P43 (e1), decision 7, facts 6 and 7.
 *
 * **Every expected time is a literal set BEFORE the step it stamps**: the driver's `now` is a clock this suite moves by
 * hand (`clock.t`), so an `asked` element's `observedAt` is the value `clock.t` held when the branch entered the ask —
 * the same value an outcome record settled on that step carries (`OR-R3`'s `observedAt`, one clock). A RESUME runs under
 * a DIFFERENT clock (`LATER`), so *the stored run's time* and *the replay's time* are two numbers a wrong selection
 * cannot confuse: within the stored prefix a regenerated element carries the STORED one (and none where the stored one
 * has none — a checkpoint written before 0.11.0, hand-built by deleting the key), and past the stored tail it carries
 * `LATER` — the CONTROL, on the same observer, for every *kept* claim. Hand-edited stored times (`501`, `502`, `503`,
 * one per instance) make each instance's own stored element the only one whose time can be taken.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, inputOf, ResumeRefused, type Checkpoint, type InputOfOptions } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

const SUITE = 'L2 — W208, RN-R37 v0.35: an `asked` element`s observedAt — the injected clock, KEPT by a replay from every stored prefix, a later clock past the tail, none from a pre-0.11.0 store, never diverged';

const TYPES = typesFor(['IngestWorker', 'PublishWorker']);
/** The resume's clock — far from every time a stored run carries, so taking the stored one and taking this one differ. */
const LATER = 9999;

/** A scheduler double: records `addTask`, fires what a case tells it to. */
class Fake {
  readonly added: string[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown): void { this.added.push((t as { id: string }).id); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  cancel(): Promise<boolean> { return Promise.resolve(true); }
  settle(id: string, result: unknown): void {
    const detail = { id, state: 'done', result, error: null, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of this.listeners.get('task.completed') ?? []) fn({ detail });
  }
}

const OPTIONS: InputOfOptions = { predicates: new Map(), joinPolicy: liveToken as unknown as JoinPolicy, ...TYPES };

function make(def: FlowDefinition, clock: { t: number }, onFoldInput?: (e: FoldInput) => void) {
  const sch = new Fake();
  const driver = new Driver(def, {
    runId: 'r1', scheduler: sch as never, createTask: (c) => c as never, now: () => clock.t, ...OPTIONS,
    onRunFailure: () => {}, ...(onFoldInput ? { onFoldInput } : {}),
  });
  return { driver, sch };
}

/** `ingest` -> `each` (a map over `files`) -> `approve` (an ASK per instance) -> `collect` -> `publish` -> `done`. */
const MAP_ASK = {
  flowId: 'w208-map-ask', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'each' }] },
    { id: 'each', kind: 'map', over: 'files', branch: 'approve' },
    { id: 'approve', kind: 'ask', edges: [{ on: ['failed'], to: 'skipped' }, { to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'skipped', kind: 'end', outcome: 'skipped' },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;
/** An ENTRY ask, then a task: `approve` -> `publish` -> `done`. */
const ENTRY_ASK = {
  flowId: 'w208-entry-ask', version: 1, entry: 'approve',
  nodes: [
    { id: 'approve', kind: 'ask', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;
const ASK = (i: number) => `r1:approve:${i}:0`;

/**
 * The stored run: `start` at t=100; `ingest` settles at t=200 with three files, so three asks park on that step; ask 1 is
 * answered at t=300 and ask 0 at t=400 — ask 2 is left parked. Its checkpoint, as the driver hands it.
 */
function storedMapRun(): Checkpoint {
  const clock = { t: 100 };
  const m = make(MAP_ASK, clock);
  m.driver.start({});
  clock.t = 200;
  m.sch.settle('r1:ingest:-:0', { files: ['a', 'b', 'c'] });
  clock.t = 300;
  ok(m.driver.resolve(ASK(1), 'done', { result: 'b!', actor: 'ana' }), 'fixture: ask 1 answered');
  clock.t = 400;
  ok(m.driver.resolve(ASK(0), 'done', { result: 'a!', actor: 'ana' }), 'fixture: ask 0 answered');
  return structuredClone(m.driver.checkpoint()) as Checkpoint;
}
const askedAt = (events: readonly FoldInput[]) => events.flatMap((e, i) => (e.kind === 'asked' ? [[i, e] as const] : []));
const strip = (cp: Checkpoint): Checkpoint => ({
  header: cp.header,
  events: cp.events.map((e) => (e.kind === 'asked' ? { kind: 'asked', taskId: e.taskId, input: e.input } as FoldInput : e)),
});

const DECLARED_CASES = [
  'a FRESH ask is stamped by the injected clock: the entry ask at start, each instance of a map on the step that parked it — the clock an outcome record settled on that step reads',
  'the element a consumer is handed carries it — onFoldInput, foldInputs() and checkpoint() — and the fold puts it on the ask`s NodeRun as askedAt, kept through the answer',
  'a resume from EVERY stored prefix under a LATER clock: within the prefix each regenerated element takes its STORED time, past the tail the later clock — the control — both reached',
  'each instance takes ITS OWN stored element`s time: three asks stored at 501, 502, 503 resume carrying 501, 502, 503 and the fold reads the same',
  'a pre-0.11.0 store — every asked element WITHOUT observedAt — resumes from every prefix equal, the regenerated elements carrying none and the fold no askedAt; past the tail the later clock',
  'a stored observedAt that is NOT a number is refused diverged at its element; the same store with a number there resumes',
  'inputOf over every prefix of both stores is never diverged, and answers each ask`s input once the prefix holds it',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const clock = { t: 100 };
    const e = make(ENTRY_ASK, clock);
    e.driver.start({ doc: 1 });
    equal(e.driver.foldInputs()[0], { kind: 'asked', taskId: 'r1:approve:-:0', input: { doc: 1 }, observedAt: 100 }, 'the entry ask, stamped at start — t=100');
    const map = make(MAP_ASK, clock);
    map.driver.start({});
    clock.t = 200;
    map.sch.settle('r1:ingest:-:0', { files: ['a', 'b', 'c'] });
    const asks = askedAt(map.driver.foldInputs()).map(([, x]) => x);
    equal(asks, [0, 1, 2].map((i) => ({ kind: 'asked', taskId: ASK(i), input: ['a', 'b', 'c'][i], observedAt: 200 })),
      'each instance stamped t=200 — the step that parked it, not start`s t=100');
    const settled = map.driver.foldInputs().find((x) => x.kind === 'outcome');
    equal(settled?.kind === 'outcome' ? settled.record.observedAt : 'NONE', 200, 'the SAME clock: ingest`s outcome record, settled on that step, reads 200 too');
  });

  test(DECLARED_CASES[1]!, () => {
    const clock = { t: 100 };
    const handed: FoldInput[] = [];
    const m = make(ENTRY_ASK, clock, (e) => handed.push(e));
    m.driver.start({});
    equal(handed.map((e) => (e.kind === 'asked' ? e.observedAt : null)), [100], 'onFoldInput: the handed element carries it');
    ok(Object.isFrozen(handed[0]), 'and is frozen, as every handed element is (RN-R17)');
    equal((m.driver.checkpoint().events[0] as { observedAt?: number }).observedAt, 100, 'checkpoint(): the stored element carries it');
    equal(fold(m.driver.foldInputs()).nodes['r1:approve:-:0']!.askedAt, 100, 'the fold: askedAt on the ask`s entry');
    clock.t = 300;
    ok(m.driver.resolve('r1:approve:-:0', 'done', { result: { ok: true }, actor: 'ana' }), 'answered at t=300');
    const n = fold(m.driver.foldInputs()).nodes['r1:approve:-:0']!;
    equal([n.state, n.askedAt], ['done', 100], 'KEPT through the answer — the time it was ASKED, not the answer`s t=300');
    const resolution = m.driver.foldInputs().find((x) => x.kind === 'resolution');
    equal(resolution?.kind === 'resolution' ? resolution.record.observedAt : 'NONE', 300, 'the CONTROL: the answer`s own record reads 300, so 100 is not the only time this run holds');
    clock.t = 500;
    m.sch.settle('r1:publish:-:0', { ok: true });
    const pub = fold(m.driver.foldInputs()).nodes['r1:publish:-:0']!;
    ok(!('askedAt' in pub), 'a TASK`s entry has no askedAt');
  });

  test(DECLARED_CASES[2]!, () => {
    const cp = storedMapRun();
    const stored = askedAt(cp.events);
    equal(stored.map(([, e]) => (e as { observedAt?: number }).observedAt), [200, 200, 200], 'the ARRANGEMENT: three asks stored, each at t=200');
    let kept = 0, past = 0;
    for (let k = 0; k <= cp.events.length; k += 1) {
      const r = make(MAP_ASK, { t: LATER });
      r.driver.resume({ header: cp.header, events: cp.events.slice(0, k) });
      const asks = askedAt(r.driver.foldInputs());
      const state = fold(r.driver.foldInputs());
      for (const [i, e] of asks) {
        const want = i < k ? 200 : LATER;
        if (i < k) kept += 1; else past += 1;
        equal(e.kind === 'asked' ? e.observedAt : 'NONE', want, `prefix ${k}: the asked element at ${i} — ${i < k ? 'within the prefix, the STORED time' : 'past the tail, the LATER clock'}`);
        equal(state.nodes[e.kind === 'asked' ? e.taskId : '']!.askedAt, want, `prefix ${k}: and the fold's askedAt for it`);
      }
    }
    ok(kept > 0 && past > 0, `both sides reached over the prefixes — ${kept} kept, ${past} past the tail`);
  });

  test(DECLARED_CASES[3]!, () => {
    const cp = storedMapRun();
    const edited = structuredClone(cp) as Checkpoint;
    askedAt(edited.events).forEach(([, e], n) => { (e as { observedAt?: number }).observedAt = 501 + n; });
    const r = make(MAP_ASK, { t: LATER });
    r.driver.resume(edited);
    equal(askedAt(r.driver.foldInputs()).map(([, e]) => [e.kind === 'asked' ? e.taskId : '', e.kind === 'asked' ? e.observedAt : 0]),
      [[ASK(0), 501], [ASK(1), 502], [ASK(2), 503]], 'each regenerated element carries ITS OWN stored time');
    const nodes = fold(r.driver.foldInputs()).nodes;
    equal([0, 1, 2].map((i) => nodes[ASK(i)]!.askedAt), [501, 502, 503], 'and the fold reads each — answered (0, 1) and parked (2) alike');
  });

  test(DECLARED_CASES[4]!, () => {
    const old = strip(storedMapRun());
    equal(askedAt(old.events).filter(([, e]) => 'observedAt' in e).length, 0, 'the ARRANGEMENT: no stored asked element carries observedAt');
    let none = 0, past = 0;
    for (let k = 0; k <= old.events.length; k += 1) {
      const r = make(MAP_ASK, { t: LATER });
      r.driver.resume({ header: old.header, events: old.events.slice(0, k) });
      const state = fold(r.driver.foldInputs());
      for (const [i, e] of askedAt(r.driver.foldInputs())) {
        const id = e.kind === 'asked' ? e.taskId : '';
        if (i < k) {
          none += 1;
          ok(!('observedAt' in e), `prefix ${k}: the regenerated element at ${i} carries NO observedAt — the stored one had none`);
          ok(!('askedAt' in state.nodes[id]!), `prefix ${k}: and its entry no askedAt`);
        } else {
          past += 1;
          // The CONTROL on the same observer: past the tail the key IS there, so its absence above is not a blind read.
          equal(e.kind === 'asked' ? e.observedAt : 'NONE', LATER, `prefix ${k}: past the tail at ${i}, the LATER clock`);
        }
      }
    }
    ok(none > 0 && past > 0, `both sides reached — ${none} without, ${past} past the tail`);
  });

  test(DECLARED_CASES[5]!, () => {
    const cp = storedMapRun();
    const [at] = askedAt(cp.events)[0]!;
    const bad = structuredClone(cp) as Checkpoint;
    (bad.events[at] as unknown as { observedAt: unknown }).observedAt = '200';
    let refused: unknown = null;
    try { make(MAP_ASK, { t: LATER }).driver.resume(bad); } catch (e) { refused = e; }
    ok(refused instanceof ResumeRefused, `a string where the time is: refused — ${String(refused)}`);
    equal(refused instanceof ResumeRefused ? [refused.reason, refused.index] : null, ['diverged', at], 'diverged, at that asked element');
    const good = structuredClone(cp) as Checkpoint;
    (good.events[at] as unknown as { observedAt: unknown }).observedAt = 200;
    const r = make(MAP_ASK, { t: LATER });
    r.driver.resume(good);
    equal((r.driver.foldInputs()[at] as { observedAt?: number }).observedAt, 200, 'the CONTROL: the number there resumes, carrying it');
  });

  test(DECLARED_CASES[6]!, () => {
    const cp = storedMapRun();
    for (const [name, store] of [['the 0.11.0 store', cp], ['the pre-0.11.0 store', strip(cp)]] as const) {
      const posOf = new Map(askedAt(store.events).map(([p, e]) => [e.kind === 'asked' ? e.taskId : '', p]));
      let answered = 0;
      for (let k = 0; k <= store.events.length; k += 1) {
        const run = { header: store.header, events: store.events.slice(0, k) };
        for (const i of [0, 1, 2]) {
          const r = inputOf(MAP_ASK, OPTIONS, run, { taskId: ASK(i) });
          ok(r.ok || r.reason !== 'diverged', `${name}, prefix ${k}, ask ${i}: not diverged — ${r.ok ? 'answered' : `${r.reason}: ${r.message}`}`);
          if (r.ok) {
            answered += 1;
            equal(r.inputs.map((x) => x.value), [['a', 'b', 'c'][i]], `${name}, prefix ${k}: ask ${i} was handed its own item`);
          } else if (k > posOf.get(ASK(i))!) {
            ok(false, `${name}, prefix ${k}: the prefix holds the asks, so ask ${i} is answered — got ${r.reason}`);
          }
        }
      }
      ok(answered > 0, `${name}: the reading answered at least once — ${answered} answers`);
    }
  });

  test(DECLARED_CASES[7]!, () => {
    const ran = collected().find((s) => s.suite === SUITE)!.cases.map((c) => c.name).sort();
    const declared: string[] = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
