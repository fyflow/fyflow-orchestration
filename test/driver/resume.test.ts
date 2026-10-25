/**
 * Ladder L2 — **what RESUMING is**: `spec/run-state.md` section 9, `RN-R19` to `RN-R24`,
 * [ADR 0065](../../doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md),
 * [W89](../../doc/work-items/w89-what-resuming-is.md). No scheduler; the fake is L2's usual one.
 *
 * **Every checkpoint resumed here is TAKEN from a run this file drove** — `driver.checkpoint()` at a
 * quiescent point, or inside `onFoldInput` (mid-step, ADR 0064), or a prefix of a run's events at a
 * length a callback would have handed a store — **never written by hand**, except where a case says
 * it is corrupting one on purpose. Every expected value is derived from the flow and the settlements
 * this file delivered.
 *
 * **Resume SELECTS, so each fixture puts the right selection where the well-formed wrong ones DIFFER**
 * (`doc/workflow.md` rule 8 obligation (a), v0.23), and each case asserts the ARRANGEMENT beside the
 * claim:
 *
 * | what is selected | the wrong selections, each shown to differ |
 * |---|---|
 * | the in-flight set | parked tasks counted as in flight; tasks dispatched after the last stored settlement; dispatches past the stored prefix only; every dispatch the replay held |
 * | the diverging position | 0; the FED element's position that led to it; the last stored position; the stored length; a comparison of KINDS only |
 * | the positions a consumer is handed | a count from 0 at the consumer's first callback |
 */
import { collected, equal, ok, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, MultipleRuns, ResumeRefused, resumeRefusal } from '../../src/driver/driver.ts';
import type { Checkpoint } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { Predicate } from '../../src/driver/routing.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import { fold } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

class FakeScheduler {
  readonly added: { id: string; payload: unknown }[] = [];
  /** What `onAdd` saw at each `addTask` — how many elements the driver held when the task reached a scheduler. */
  readonly heldAtAdd: number[] = [];
  onAdd: (() => number) | null = null;
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void {
    this.added.push(task as { id: string; payload: unknown });
    if (this.onAdd) this.heldAtAdd.push(this.onAdd());
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  // **`cancelled` since W158** — the union `TerminalState` widened, and `finish` below passes a stored record's
  // state here, so this signature failed to COMPILE (P33 prediction 4: loud where a type constrains). A cancel
  // fires `task.cancelled` alone, as the scheduler does; no reference run here holds one.
  settle(id: string, state: 'done' | 'failed' | 'user_action' | 'cancelled', over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', detail);
    else if (state === 'cancelled') this.fire('task.cancelled', detail);
    else {
      this.fire('task.failed', detail);
      if (state === 'user_action') this.fire('task.user_action', detail);
    }
  }
  private fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
}

/**
 * **The flow every selection here is made on.** A decision (`gate`) whose two roads dispatch the SAME
 * kind — a task either way — so a comparison of kinds cannot see the road change; a fan-out of three
 * branches, one of which (`a`) is two tasks long, so a dispatch can happen AFTER the others; and a
 * branch (`c`) that parks for a person. At version 3, run `R`.
 */
const MAIN = {
  flowId: 'resume-main', version: 3, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'gate' }] },
    { id: 'gate', kind: 'task', type: 'T', edges: [{ when: { predicate: 'isHigh' }, to: 'pre' }, { to: 'low' }] },
    { id: 'pre', kind: 'task', type: 'T', edges: [{ to: 'fan' }] },
    { id: 'fan', kind: 'fanout', branches: ['a1', 'b', 'c'] },
    { id: 'a1', kind: 'task', type: 'T', edges: [{ to: 'a2' }] },
    { id: 'a2', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'fan', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'low', kind: 'task', type: 'T', edges: [{ to: 'lowDone' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
    { id: 'lowDone', kind: 'end', outcome: 'routed-low' },
  ],
} as unknown as FlowDefinition;

const isHigh: Predicate = (ctx) => ((ctx.outcome.result as { score?: number } | null)?.score ?? 0) > 0.5;
const PREDICATES = new Map<string, Predicate>([['isHigh', isHigh]]);
const INVERTED = new Map<string, Predicate>([['isHigh', (ctx) => !isHigh(ctx)]]);

type Step =
  | { settle: string; state: 'done' | 'failed' | 'user_action'; over?: Record<string, unknown> }
  | { resolve: string; result: unknown; actor: string };

/**
 * **The run, as the stimuli this file delivers** — every expected value below is derived from these.
 * After step 4 the run is QUIESCENT with `c` parked, `b` and `a2` running, and `a1` settled.
 */
const SCRIPT: Step[] = [
  { settle: 'R:ingest:-:0', state: 'done', over: { result: { v: 1 } } },
  { settle: 'R:gate:-:0', state: 'done', over: { result: { score: 0.9 } } },
  { settle: 'R:pre:-:0', state: 'done', over: { result: { p: 1 } } },
  { settle: 'R:a1:0:0', state: 'done', over: { result: { a: 1 } } },
  { settle: 'R:c:2:0', state: 'user_action', over: { error: 'ask a person' } },
  { resolve: 'R:c:2:0', result: { c: 'by hand' }, actor: 'ana' },
  { settle: 'R:b:1:0', state: 'done', over: { result: { b: 1 } } },
  { settle: 'R:a2:0:0', state: 'done', over: { result: { a: 2 } } },
  { settle: 'R:publish:-:0', state: 'done', over: { result: { ok: true } } },
];
/** The step after which the run is quiescent with a task parked and two running. */
const QUIET_AFTER = 4;

function mainDriver(scheduler: FakeScheduler, extra: Record<string, unknown> = {}) {
  return new Driver(MAIN, {
    runId: 'R', scheduler, createTask: (c) => c, predicates: PREDICATES, ...typesFor(['T']),
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0, onRunFailure: () => {}, ...extra,
  });
}

function drive(d: Driver, s: FakeScheduler, steps: readonly Step[]): void {
  for (const st of steps) {
    if ('settle' in st) s.settle(st.settle, st.state, st.over ?? {});
    else ok(d.resolve(st.resolve, 'done', { result: st.result, actor: st.actor }), `the resolution of ${st.resolve} was accepted`);
  }
}

/**
 * **The run nobody killed**, and every checkpoint a store could hold of it: `quiet` after
 * `QUIET_AFTER`, and `inside[seq]` — the checkpoint taken INSIDE `onFoldInput` for position `seq`,
 * which holds `seq + 1` elements and ends mid-step (ADR 0064).
 */
function reference() {
  const s = new FakeScheduler();
  const inside: Checkpoint[] = [];
  const ref = {} as { d: Driver };
  ref.d = mainDriver(s, { onFoldInput: (_i: FoldInput, seq: number) => { inside[seq] = ref.d.checkpoint(); } });
  ref.d.start({ n: 1 });
  drive(ref.d, s, SCRIPT.slice(0, QUIET_AFTER + 1));
  const quiet = ref.d.checkpoint();
  drive(ref.d, s, SCRIPT.slice(QUIET_AFTER + 1));
  return { d: ref.d, s, quiet, inside, all: ref.d.checkpoint() };
}

const REF = reference();
const at = (events: readonly FoldInput[], pred: (e: FoldInput) => boolean) => events.findIndex(pred);
const isOutcomeOf = (id: string) => (e: FoldInput) => e.kind === 'outcome' && e.record.taskId === id;
const isDispatchOf = (id: string) => (e: FoldInput) => e.kind === 'dispatched' && e.taskId === id;
/** The checkpoint a store held when the element matching `pred` had just been appended — cut INSIDE the callback. */
const cutAt = (pred: (e: FoldInput) => boolean) => REF.inside[at(REF.all.events, pred)]!;
const resumedOf = (d: Driver) => d.foldInputs().filter((e): e is Extract<FoldInput, { kind: 'resumed' }> => e.kind === 'resumed');

function resumeFrom(cp: Checkpoint, extra: Record<string, unknown> = {}) {
  const s = new FakeScheduler();
  const d = mainDriver(s, extra);
  s.onAdd = () => d.foldInputs().length;
  d.resume(cp);
  return { d, s };
}

/** Feed the rest of the reference's stimuli — every settlement and resolution at a position past `k`, in order. */
function finish(d: Driver, s: FakeScheduler, k: number): void {
  for (const e of REF.all.events.slice(k)) {
    if (e.kind !== 'outcome' && e.kind !== 'resolution') continue;
    const r = e.record;
    if (r.kind === 'outcome') s.settle(r.taskId, r.terminalState, { result: r.result, ...(r.error !== null ? { error: r.error } : {}) });
    else ok(d.resolve(r.taskId, r.resolvedAs, { result: r.result, actor: r.actor }), 'the reference`s resolution is accepted on the resumed run');
  }
}

/** A class whose array lives on its PROTOTYPE — what `OR-R11` says does not cross a clone. */
class Items { get items() { return ['x', 'y']; } }
const MAP_ENTRY = {
  flowId: 'resume-map-entry', version: 1, entry: 'split',
  nodes: [
    { id: 'split', kind: 'map', over: 'items', branch: 's' },
    { id: 's', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;
const INGEST_THEN_MAP = {
  flowId: 'resume-ingest-map', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'items', branch: 's' },
    { id: 's', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;
function plainDriver(def: FlowDefinition, runId: string, s: FakeScheduler, extra: Record<string, unknown> = {}) {
  return new Driver(def, {
    runId, scheduler: s, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']),
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0, onRunFailure: () => {}, ...extra,
  });
}

/** `ResumeRefused` caught, or a failure naming what was thrown instead. */
function refusal(fn: () => unknown): ResumeRefused {
  try { fn(); } catch (e) { if (e instanceof ResumeRefused) return e; throw new Error(`expected ResumeRefused, got ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`); }
  throw new Error('expected ResumeRefused, nothing was thrown');
}

const SUITE = 'W89 — what RESUMING is: RN-R19 to RN-R24';
const DECLARED_CASES = [
  'RN-R21 — the in-flight set is dispatched-and-unsettled, where every wrong selection differs',
  'RN-R20 — a checkpoint cut MID-STEP resumes: the replay runs past it, and its tail is re-dispatched',
  'RN-R21 — a parked task stays parked, and resolve() works on it after the resume',
  'RN-R19 — resumed at EVERY position, the run completes exactly as the run nobody killed',
  'RN-R20 — a divergence is refused at the position it happens: 0, mid-run, and the end — and not in the tail',
  'RN-R20 — a stored settlement the replay never dispatched, or a resolution for a task it has not parked, is refused at its own position',
  'RN-R19 — the replay hands the entry node its OWN copy of the entry payload, never the header`s',
  'RN-R24 — a dead join the replay regenerates is reported only past the stored length',
  'RN-R23 — the header refusals, each by name, before anything is replayed or dispatched',
  'RN-R23 — a run HALTED in the lost tail is refused, after that tail is delivered',
  'RN-R23 — a run HALTED in the lost tail, once refused, is DEAF: nothing appended, delivered or reported after',
  'RN-R22 — `resumed` is appended after the replay and BEFORE the first re-dispatch, and the fold records it',
  'RN-R22 — a resumed run resumes again: a stored `resumed` is fed and CHECKED',
  'RN-R24 — the consumer is handed the DRIVER`s positions from the stored length on, and every callback only past it',
  'ID-R3 — start() and resume() are one run`s two doors: each refuses the other and itself',
  'RN-R19 — a fed element is appended AS STORED — its clock, its attempts — and as the driver`s own copy',
  'RN-R20 — the data comparison reads nested region events and every key, and ignores key order and undefined keys',
  'RN-R23 — the `halted` position is the halt`s own, wherever it sits',
  'RN-R23 / ADR 0102 — a stored `stopped` (0.7.0`s kind) is refused `halted` at ITS position under this format, one of a live run still resumes, and the 0.7.0 checkpoint itself is refused `format`',
  'RN-R23 — a resume refused DURING its replay leaves the driver spent and deaf, with nothing handed to a scheduler',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('RN-R21 — the in-flight set is dispatched-and-unsettled, where every wrong selection differs', () => {
    const Q = REF.quiet;
    const RIGHT = ['R:b:1:0', 'R:a2:0:0'];
    // **The ARRANGEMENT — each well-formed wrong selection, computed from the stored events, DIFFERS.**
    const dispatched = Q.events.flatMap((e) => (e.kind === 'dispatched' ? [e.taskId] : []));
    const settledDone = new Set(Q.events.flatMap((e) => (e.kind === 'outcome' && e.record.kind === 'outcome' && e.record.terminalState !== 'user_action' ? [e.record.taskId] : [])));
    const lastSettlement = Q.events.map((e) => e.kind).lastIndexOf('outcome');
    const wrong = {
      parkedCountsAsInFlight: dispatched.filter((t) => !settledDone.has(t)),
      afterLastSettlement: Q.events.slice(lastSettlement + 1).flatMap((e) => (e.kind === 'dispatched' ? [e.taskId] : [])),
      pastTheStoredPrefix: [] as string[], // Q is quiescent: the replay regenerates nothing past it
      everyHeldDispatch: dispatched,
    };
    for (const [name, w] of Object.entries(wrong)) ok(JSON.stringify(w) !== JSON.stringify(RIGHT), `the ARRANGEMENT: "${name}" selects ${JSON.stringify(w)}, which is not ${JSON.stringify(RIGHT)}`);
    ok(fold(Q.events).outcome === 'awaiting_action', 'the ARRANGEMENT: a task is PARKED in the stored run');

    const made: string[] = [];
    const { d, s } = resumeFrom(Q, { createTask: (c: { id: string }) => { made.push(c.id); return c; } });
    equal(resumedOf(d).map((e) => e.taskIds), [RIGHT], 'RN-R21: `resumed` names exactly the tasks dispatched and never settled, in dispatch order');
    equal(made, RIGHT, 'and createTask is called at RELEASE, for those tasks only — not for the five the replay held and never released (W89`s adequacy reader, a30)');
    equal(s.added.map((t) => t.id), RIGHT, 'and exactly those — no more, no fewer — are handed to the scheduler, at the SAME task ids');
    for (const id of RIGHT) {
      const original = REF.s.added.find((t) => t.id === id)!;
      equal(s.added.find((t) => t.id === id)!.payload, original.payload, `${id} is re-dispatched with the payload the original run sent it — the replay RECOMPOSED it`);
    }
  });

  test('RN-R20 — a checkpoint cut MID-STEP resumes: the replay runs past it, and its tail is re-dispatched', () => {
    const M = cutAt(isOutcomeOf('R:a1:0:0'));
    ok(M.events.at(-1)?.kind === 'outcome' && !M.events.some(isDispatchOf('R:a2:0:0')),
      'the ARRANGEMENT: the store holds a1`s settlement and NOT the dispatch of a2 it caused — the checkpoint ends mid-step');
    const seen: { seq: number; kind: string; ids?: string[] }[] = [];
    const { d, s } = resumeFrom(M, { onFoldInput: (i: FoldInput, seq: number) => { seen.push({ seq, kind: i.kind, ...(i.kind === 'dispatched' ? { ids: [i.taskId] } : i.kind === 'resumed' ? { ids: [...i.taskIds] } : {}) }); } });
    equal(d.foldInputs().slice(0, M.events.length), M.events, 'the stored events are a PREFIX of the replay, element for element');
    equal(seen, [
      { seq: M.events.length, kind: 'dispatched', ids: ['R:a2:0:0'] },
      { seq: M.events.length + 1, kind: 'resumed', ids: ['R:b:1:0', 'R:c:2:0', 'R:a2:0:0'] },
    ], 'the consumer is handed the lost tail — a2`s dispatch — at the position the store had not reached, then `resumed`');
    equal(s.added.map((t) => t.id), ['R:b:1:0', 'R:c:2:0', 'R:a2:0:0'],
      'and a2, dispatched ONLY in the regenerated tail, is re-dispatched with b and c — the in-flight set at the end of the REPLAY, not at the stored prefix (W89`s declaration step, re-take 3)');
  });

  test('RN-R21 — a parked task stays parked, and resolve() works on it after the resume', () => {
    const { d, s } = resumeFrom(REF.quiet);
    ok(!s.added.some((t) => t.id === 'R:c:2:0'), 'c, parked for a person, is NOT handed to a worker again');
    equal(fold(d.foldInputs()).outcome, 'awaiting_action', 'the resumed run is still waiting on the person');
    ok(d.resolve('R:c:2:0', 'done', { result: { c: 'by hand' }, actor: 'ana' }), 'and the person`s resolution is accepted by the RESUMED driver (RS-R1 reads the replayed log)');
    s.settle('R:b:1:0', 'done', { result: { b: 1 } });
    s.settle('R:a2:0:0', 'done', { result: { a: 2 } });
    s.settle('R:publish:-:0', 'done', { result: { ok: true } });
    equal(fold(d.foldInputs()).outcome, 'completed', 'and the run completes');
  });

  test('RN-R19 — resumed at EVERY position, the run completes exactly as the run nobody killed', () => {
    const all = REF.all.events;
    const settledIn = (evs: readonly FoldInput[]) => new Set(evs.flatMap((e) => (e.kind === 'outcome' ? [e.record.taskId] : [])));
    let cuts = 0, redispatched = 0;
    for (let k = 0; k <= all.length; k += 1) {
      const cp: Checkpoint = { header: REF.all.header, events: all.slice(0, k) };
      const { d, s } = resumeFrom(cp);
      const first = resumedOf(d)[0]!.taskIds;
      finish(d, s, k);
      const withoutResume = d.foldInputs().filter((e) => e.kind !== 'resumed');
      equal(withoutResume, all, `cut at ${k}: the resumed run's sequence, its one \`resumed\` element aside, IS the run nobody killed`);
      const settled = settledIn(cp.events);
      equal(first.filter((t) => settled.has(t)), [], `cut at ${k}: no task that settled in the stored events is re-dispatched (P23 prediction 2)`);
      equal(s.added.slice(0, first.length).map((t) => t.id), first, `cut at ${k}: the tasks re-dispatched are the ones \`resumed\` names`);
      cuts += 1; redispatched += first.length;
    }
    equal(cuts, all.length + 1, `every position was a cut, 0 to ${all.length}`);
    ok(redispatched > all.length / 2, `the CONTROL: the cuts re-dispatched ${redispatched} tasks in all, so the at-least-once road was taken, not skipped`);
  });

  test('RN-R20 — a divergence is refused at the position it happens: 0, mid-run, and the end — and not in the tail', () => {
    // **Mid-run** — the decision's predicate is not the one the stored run had. Both roads dispatch a
    // TASK, so the diverging elements are the same KIND and a kind-only comparison would pass.
    const Q = REF.quiet;
    const want = at(Q.events, isDispatchOf('R:pre:-:0'));
    const gate = at(Q.events, isOutcomeOf('R:gate:-:0'));
    ok(want > 0 && want !== gate && want !== Q.events.length - 1 && want !== Q.events.length,
      `the ARRANGEMENT: the diverging position ${want} is not 0, not the fed settlement's (${gate}), not the last, not the length`);
    const mid = refusal(() => resumeFrom(Q, { predicates: INVERTED }));
    equal([mid.reason, mid.index], ['diverged', want], 'RN-R20: refused as `diverged` at the FIRST position the replay does not reproduce');
    ok(mid.message.includes('R:pre:-:0') && mid.message.includes('R:low:-:0'), 'and the message names the stored element and the replayed one — a dispatch either way');

    // **Index 0** — an entry payload whose array lives on a PROTOTYPE: the original run's map read it
    // through the getter; the header holds what CROSSES the clone (ADR 0064 consequence 4), so the
    // replay's map finds no array and stops where the original opened its region.
    const s0 = new FakeScheduler();
    const o = plainDriver(MAP_ENTRY, 'm1', s0);
    o.start(new Items());
    ok(s0.added.length === 2 && !('items' in (o.checkpoint().header.entryPayload as object)),
      'the ARRANGEMENT: the original opened two instances, and its header`s entry payload has no `items` — OR-R11 took the getter');
    const zero = refusal(() => plainDriver(MAP_ENTRY, 'm1', new FakeScheduler()).resume(o.checkpoint()));
    equal([zero.reason, zero.index], ['diverged', 0], 'refused at position 0 — a lossy entry payload is a named refusal, never a different run');

    // **The end** — a store that appended its last element twice: every stored element up to the
    // last is reproduced, and the replay ends one short.
    const dup: Checkpoint = { header: Q.header, events: [...Q.events, Q.events.at(-1)!] };
    const end = refusal(() => resumeFrom(dup));
    equal([end.reason, end.index], ['diverged', Q.events.length], 'refused at the first stored position the replay never reached');

    // **The tail** — the same inverted predicate, on a checkpoint cut INSIDE the callback for the
    // decision's settlement: the road it takes is past the stored events, so nothing contradicts it.
    const G = cutAt(isOutcomeOf('R:gate:-:0'));
    ok(G.events.at(-1)?.kind === 'outcome' && !G.events.some(isDispatchOf('R:pre:-:0')),
      'the ARRANGEMENT: the store holds the decision`s settlement and not the road it took');
    const { s } = resumeFrom(G, { predicates: INVERTED });
    equal(s.added.map((t) => t.id), ['R:low:-:0'],
      'NOT refused, and it takes the NEW road — the prefix check sees only what was stored, which is its stated limit');
  });

  test('RN-R20 — a stored settlement the replay never dispatched, or a resolution for a task it has not parked, is refused at its own position', () => {
    const Q = REF.quiet;
    const i = at(Q.events, isOutcomeOf('R:a1:0:0'));
    const events = Q.events.map((e, k) => (k === i && e.kind === 'outcome' ? { ...e, record: { ...e.record, taskId: 'R:a9:0:0' } } : e));
    const r = refusal(() => resumeFrom({ header: Q.header, events }));
    equal([r.reason, r.index], ['diverged', i], 'refused at the settlement`s own position — the replay dispatched no R:a9:0:0');
    const scheduler = new FakeScheduler();
    const d = mainDriver(scheduler);
    refusal(() => d.resume({ header: Q.header, events }));
    equal(scheduler.added.length, 0, 'and nothing reached the scheduler: every dispatch the replay made was held');
    // A task id that does not PARSE — no driver minted it (W89's conformity reader, finding 10: no fixture had one).
    const unparsed = Q.events.map((e, k) => (k === i && e.kind === 'outcome' ? { ...e, record: { ...e.record, taskId: 'not-an-id' } } : e));
    const failures: string[] = [];
    const up = refusal(() => resumeFrom({ header: Q.header, events: unparsed }, { onRunFailure: (f: { kind: string }) => { failures.push(f.kind); } }));
    equal([up.reason, up.index, failures], ['diverged', i, []], 'an unparseable stored task id is refused at its own position, and nothing is reported as a run failure');
    // A RESOLUTION for a task the replay has not parked — `b`, running, where the stored run resolved
    // the parked `c` (rule 8's author pass, `b16`: this clause had no fixture and cost ZERO).
    const all = REF.all.events;
    const j = at(all, (e) => e.kind === 'resolution');
    ok(j > 0 && all[j]!.kind === 'resolution', 'the ARRANGEMENT: the stored run carries a resolution');
    const forB = all.map((e, k) => (k === j && e.kind === 'resolution' ? { ...e, record: { ...e.record, taskId: 'R:b:1:0' } } : e));
    const rr = refusal(() => resumeFrom({ header: REF.all.header, events: forB }));
    equal([rr.reason, rr.index], ['diverged', j], 'refused at the resolution`s own position — `b` was running, not parked, in the replay');
    ok(rr.message.includes('not parked'), 'and the message says why');
  });

  test('RN-R19 — the replay hands the entry node its OWN copy of the entry payload, never the header`s', () => {
    // Rule 8's author pass, `a9`: entering with the header's own object instead of a copy cost ZERO,
    // because every re-dispatched payload was compared by VALUE. On a store cut before the entry
    // settled, the entry task is re-dispatched, and writing into what it receives must not reach the
    // header a later checkpoint hands out.
    const cp: Checkpoint = { header: REF.all.header, events: REF.all.events.slice(0, 1) };
    ok(cp.events[0]?.kind === 'dispatched' && (cp.events[0] as { taskId: string }).taskId === 'R:ingest:-:0',
      'the ARRANGEMENT: the store holds only the entry task`s dispatch, so the entry task is in flight');
    const { d, s } = resumeFrom(cp);
    const input = (s.added.find((t) => t.id === 'R:ingest:-:0')!.payload as { input: Record<string, unknown> }).input;
    equal(input, { n: 1 }, 'the entry task receives the stored entry payload');
    input.n = 'WRITTEN BY THE WORKER';
    equal(d.checkpoint().header.entryPayload, { n: 1 }, 'and a worker writing into it moves the header not at all — it was handed a copy (RN-R15)');
  });

  test('RN-R24 — a dead join the replay regenerates is reported only past the stored length', () => {
    // Rule 8's author pass, `b9`: `onUnsatisfiableJoin` ungated cost ZERO, because no fixture had a
    // join a policy declares dead. This policy declares one dead at its region's first terminal event.
    const dies = {
      id: 'dies-at-first', open: () => ({ n: 0 }), step: (st: { n: number }, e: { type: string }) => ({ n: st.n + (e.type === 'branch.arrived' || e.type === 'branch.exited' || e.type === 'branch.lost' ? 1 : 0) }),
      status: (st: { n: number }) => (st.n >= 1 ? 'unsatisfiable' : 'waiting'), describe: (st: { n: number }) => st,
    } as unknown as JoinPolicy;
    const FJ = {
      flowId: 'resume-dead-join', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['x', 'y'] },
        { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
        { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const inside: Checkpoint[] = [];
    const s0 = new FakeScheduler();
    const ref = {} as { d: Driver };
    ref.d = plainDriver(FJ, 'dj', s0, { joinPolicy: dies, onFoldInput: (_i: FoldInput, seq: number) => { inside[seq] = ref.d.checkpoint(); } });
    ref.d.start({});
    s0.settle('dj:ingest:-:0', 'done', { result: {} });
    s0.settle('dj:x:0:0', 'done', { result: {} });
    const quiet = ref.d.checkpoint();
    const dead = at(quiet.events, (e) => e.kind === 'joinSettled');
    ok(dead > 0, 'the ARRANGEMENT: the stored run`s join was declared dead');
    const reported = (cp: Checkpoint) => {
      const seen: string[] = [];
      const d = plainDriver(FJ, 'dj', new FakeScheduler(), { joinPolicy: dies, onUnsatisfiableJoin: (u: { policyId: string }) => { seen.push(u.policyId); } });
      d.resume(cp);
      return seen;
    };
    equal(reported(quiet), [], 'a dead join the store HOLDS is not reported again — it was reported in the process that stored it');
    const cut = inside[at(quiet.events, isOutcomeOf('dj:x:0:0'))]!;
    ok(!cut.events.some((e) => e.kind === 'joinSettled'), 'the ARRANGEMENT: a store cut at x`s settlement, before the join died');
    equal(reported(cut), ['dies-at-first'], 'and one the replay regenerates PAST the stored length is reported, once');
  });

  test('RN-R23 — the header refusals, each by name, before anything is replayed or dispatched', () => {
    const Q = REF.quiet;
    const cases: [string, unknown, string, string][] = [
      // **Format 1 — what every driver before 0.12.0 wrote — is refused by name** (`RN-R16` v0.36, ADR 0138): this
      // driver reads ONE format, so the same run's checkpoint at format 1 is refused where `Q` itself — the CONTROL below,
      // the same events at format 2 — passes. It read `format: 2` (*a format this version does not know*) until 0.12.0.
      ['format', { ...Q, header: { ...Q.header, format: 1 } }, 'format', 'format 1 — every 0.11.0 checkpoint, the same run'],
      ['format', { ...Q, header: { ...Q.header, format: 3 } }, 'format', 'a format this version does not know'],
      ['format', { header: Q.header, events: 'not an array' }, 'format', 'events that are not an array'],
      ['format', { events: Q.events }, 'format', 'no header at all'],
      ['run', { ...Q, header: { ...Q.header, runId: 'R2' } }, 'run', 'a checkpoint of another run'],
      ['flow', { ...Q, header: { ...Q.header, flowId: 'resume-other' } }, 'flow', 'another flow'],
      ['flow', { ...Q, header: { ...Q.header, version: 4 } }, 'flow', 'the same flow at another version — no migration'],
      // W89's adequacy reader, a20: `format > 1` in place of `!== 1` passed at the one value, 2. At format 2 the two
      // inequalities are `format 1` (below) and `format 3` (above), both above; `0` and a string are kept.
      ['format', { ...Q, header: { ...Q.header, format: 0 } }, 'format', 'format 0'],
      ['format', { ...Q, header: { ...Q.header, format: '1' } }, 'format', 'format "1", a string'],
      ['format', { ...Q, header: { ...Q.header, format: '2' } }, 'format', 'format "2", a string — this format\'s number, not its type'],
      ['format', { ...Q, header: { runId: 'R', flowId: 'resume-main', version: 3, entryPayload: { n: 1 } } }, 'format', 'no format at all'],
      // W89's conformity reader, finding 1: a header field of the wrong TYPE is not a header the format writes.
      ['format', { ...Q, header: { ...Q.header, runId: undefined } }, 'format', 'no runId'],
      ['format', { ...Q, header: { ...Q.header, runId: 7 } }, 'format', 'a numeric runId'],
      ['format', { ...Q, header: { ...Q.header, version: '3' } }, 'format', 'a string version'],
    ];
    for (const [, cp, reason, what] of cases) {
      const s = new FakeScheduler();
      const d = mainDriver(s);
      const r = refusal(() => d.resume(cp as Checkpoint));
      equal([r.reason, r.index], [reason, null], `refused as \`${reason}\`: ${what}`);
      equal(resumeRefusal(MAIN, cp, 'R')?.reason, reason, 'and resumeRefusal() — the runtime`s pre-check — refuses it for the same reason');
      equal([s.added.length, d.foldInputs().length], [0, 0], 'nothing replayed, nothing dispatched');
      throws(() => d.start({}), 'MultipleRuns', 'and the driver is SPENT — a refused resume is not a second chance at start()');
    }
    ok(resumeRefusal(MAIN, Q, 'R') === null && resumeRefusal(MAIN, Q) === null, 'the CONTROL: the untouched checkpoint passes the pre-check, with and without a run id');

    // A STORED `halted` — the OR-R6 case: a result the clone refused never reached the log.
    const s1 = new FakeScheduler();
    const o = plainDriver(INGEST_THEN_MAP, 'st', s1);
    o.start({});
    s1.settle('st:ingest:-:0', 'done', { result: { f: () => 1 } });
    const halted = o.checkpoint();
    const k = halted.events.findIndex((e) => e.kind === 'halted');
    ok(k > 0, 'the ARRANGEMENT: the stored run was halted, and its `halted` element is not at 0');
    const r = refusal(() => plainDriver(INGEST_THEN_MAP, 'st', new FakeScheduler()).resume(halted));
    equal([r.reason, r.index], ['halted', k], 'refused as `halted`, naming the stored element`s position (P23 decision 10)');

    // An entry payload the clone refuses: `DataCloneError`, and the driver UNSTARTED, as `start()`.
    const bad = { ...Q, header: { ...Q.header, entryPayload: { f: () => 1 } } } as unknown as Checkpoint;
    const d = mainDriver(new FakeScheduler());
    let err: unknown;
    try { d.resume(bad); } catch (e) { err = e; }
    equal((err as { name?: string })?.name, 'DataCloneError', 'an uncloneable entry payload throws the platform`s DataCloneError (RN-R15`s shape)');
    d.resume(Q);
    equal(resumedOf(d).length, 1, 'and the driver was left unstarted, so a good checkpoint then resumes it');
  });

  test('RN-R23 — a run HALTED in the lost tail is refused, after that tail is delivered', () => {
    const s0 = new FakeScheduler();
    const inside: Checkpoint[] = [];
    const ref = {} as { d: Driver };
    ref.d = plainDriver(INGEST_THEN_MAP, 'tl', s0, { onFoldInput: (_i: FoldInput, seq: number) => { inside[seq] = ref.d.checkpoint(); } });
    ref.d.start({});
    // `ingest` returns no array where `split` maps over one: routing its settlement STOPS the run.
    s0.settle('tl:ingest:-:0', 'done', { result: { nothing: true } });
    const cut = inside[ref.d.foldInputs().findIndex((e) => e.kind === 'outcome')]!;
    ok(!cut.events.some((e) => e.kind === 'halted') && ref.d.foldInputs().some((e) => e.kind === 'halted'),
      'the ARRANGEMENT: the run halted, and the store was cut before its `halted` element');
    const delivered: { seq: number; kind: string }[] = [];
    const failures: string[] = [];
    const s = new FakeScheduler();
    const d = plainDriver(INGEST_THEN_MAP, 'tl', s, {
      onFoldInput: (i: FoldInput, seq: number) => { delivered.push({ seq, kind: i.kind }); },
      onRunFailure: (f: { kind: string }) => { failures.push(f.kind); },
    });
    const r = refusal(() => d.resume(cut));
    equal([r.reason, r.index], ['halted', cut.events.length], 'refused as `halted`, at the position PAST the stored events where the replay regenerated it');
    ok(r.message.startsWith('ResumeRefused (halted)'), `and its message opens with the reason it is refused for: ${r.message}`);
    equal(delivered, [{ seq: cut.events.length, kind: 'halted' }], 'the store is handed the halt it had lost, at its position');
    equal(failures, ['UnresolvedMapArity'], 'and onRunFailure hears it once — it is past the stored events');
    equal(s.added.length, 0, 'nothing was re-dispatched');
    equal(d.checkpoint().events.at(-1)?.kind, 'halted', 'the driver holds the HALTED run, whose checkpoint a store may take');
  });

  // **W151 — the maintainer's YES, 2026-10-09 (W151's conformity reader, finding 6).** The case above shows the tail-stop
  // refusal keeps the HALTED run; RN-R23 says the same refused driver *hears nothing from its scheduler: no settlement
  // is appended, routed, delivered or reported, and resolve() is refused*. It kept its header, so the `started` with no
  // header test in `onEvent` did not cover it, and a driver built by hand went on hearing.
  test('RN-R23 — a run HALTED in the lost tail, once refused, is DEAF: nothing appended, delivered or reported after', () => {
    const s0 = new FakeScheduler();
    const inside: Checkpoint[] = [];
    const ref = {} as { d: Driver };
    ref.d = plainDriver(INGEST_THEN_MAP, 'tl', s0, { onFoldInput: (_i: FoldInput, seq: number) => { inside[seq] = ref.d.checkpoint(); } });
    ref.d.start({});
    s0.settle('tl:ingest:-:0', 'done', { result: { nothing: true } });
    const cut = inside[ref.d.foldInputs().findIndex((e) => e.kind === 'outcome')]!;
    const delivered: number[] = [];
    const failures: string[] = [];
    const unminted: unknown[] = [];
    const s = new FakeScheduler();
    const d = plainDriver(INGEST_THEN_MAP, 'tl', s, {
      onFoldInput: (_i: FoldInput, seq: number) => { delivered.push(seq); },
      onRunFailure: (f: { kind: string }) => { failures.push(f.kind); },
      onUnmintedTask: (u: { taskId: unknown }) => { unminted.push(u.taskId); },
    });
    equal(refusal(() => d.resume(cut)).reason, 'halted', 'the ARRANGEMENT: refused as `halted`, its lost tail regenerated a halt');
    const held = d.checkpoint();
    const after = { delivered: delivered.length, failures: failures.length };
    // Under its run id: the task the replay settled, again; a task it never dispatched; and an id nobody minted.
    s.settle('tl:ingest:-:0', 'done', { result: { nothing: true } });
    s.settle('tl:zz:-:0', 'done', { result: {} });
    s.settle('tl:ingest:-:0', 'failed', { error: 'boom' });
    s.settle('nightly-cleanup', 'done', { result: {} });
    equal(d.checkpoint(), held, 'nothing was appended: the halted run`s checkpoint is the one it was refused with');
    equal([delivered.length, failures.length, unminted], [after.delivered, after.failures, []],
      'nothing was delivered, nothing reached onRunFailure, and the unminted id was not reported — the driver hears nothing');
    equal(s.added.length, 0, 'and nothing was handed to a scheduler');
  });

  test('RN-R22 — `resumed` is appended after the replay and BEFORE the first re-dispatch, and the fold records it', () => {
    const Q = REF.quiet;
    const { d, s } = resumeFrom(Q);
    const r = at(d.foldInputs(), (e) => e.kind === 'resumed');
    equal(r, Q.events.length, '`resumed` is the first element past the stored events of a quiescent checkpoint');
    equal(s.heldAtAdd, s.added.map(() => Q.events.length + 1), 'and every re-dispatch reached the scheduler with `resumed` already appended');
    const before = fold(Q.events), after = fold(d.foldInputs());
    equal(after.resumes, [['R:b:1:0', 'R:a2:0:0']], 'RunState.resumes records the resume and what it ran again');
    equal({ ...after, resumes: [] }, before, 'and moves NOTHING else: the ids were running before and are running still');
    equal(fold(REF.all.events).resumes, [], 'the CONTROL: a run nobody resumed has no resumes');
    const ids = ['R:x:-:0'];
    const stepped = fold([{ kind: 'resumed', taskIds: ids }]);
    ids.push('WRITTEN AFTER');
    equal(stepped.resumes, [['R:x:-:0']], 'the fold COPIES the ids it is handed (RN-R2) — a write into the element afterwards moves the state not at all (a27)');
    // Nothing in flight is still a resume, and says so.
    const done = resumeFrom(REF.all);
    equal(resumedOf(done.d).map((e) => e.taskIds), [[]], 'a completed run resumed re-dispatches nothing and still records `resumed: []`');
    equal(fold(done.d.foldInputs()).outcome, 'completed', 'and is completed');
  });

  test('RN-R22 — a resumed run resumes again: a stored `resumed` is fed and CHECKED', () => {
    const first = resumeFrom(REF.quiet);
    first.s.settle('R:b:1:0', 'done', { result: { b: 1 } });
    const cp2 = first.d.checkpoint();
    ok(cp2.events.some((e) => e.kind === 'resumed'), 'the ARRANGEMENT: the second checkpoint carries the first resume');
    const second = resumeFrom(cp2);
    equal(resumedOf(second.d).map((e) => e.taskIds), [['R:b:1:0', 'R:a2:0:0'], ['R:a2:0:0']],
      'the stored `resumed` is reproduced where it was, and the second resume names what is in flight NOW');
    equal(second.s.added.map((t) => t.id), ['R:a2:0:0'], 'only a2 runs again the second time');
    equal(fold(second.d.foldInputs()).resumes, [['R:b:1:0', 'R:a2:0:0'], ['R:a2:0:0']],
      'and the FOLD records both resumes, in order — `resumes` APPENDS (W89`s adequacy reader, a26: an overwrite folded to the last alone)');
    const i = at(cp2.events, (e) => e.kind === 'resumed');
    const tampered = cp2.events.map((e, k) => (k === i ? { kind: 'resumed', taskIds: ['R:a2:0:0', 'R:b:1:0'] } as FoldInput : e));
    const r = refusal(() => resumeFrom({ header: cp2.header, events: tampered }));
    equal([r.reason, r.index], ['diverged', i], 'a stored `resumed` naming another set — here the same ids out of order — is refused at its position');
    // A SUBSET and the EMPTY set — W89's adequacy reader, a6: with the length compare removed, every prefix of the
    // in-flight list passed, because a permutation was the only tampering tried.
    for (const ids of [['R:b:1:0'], [] as string[]]) {
      const sub = cp2.events.map((e, k) => (k === i ? { kind: 'resumed', taskIds: ids } as FoldInput : e));
      const rs = refusal(() => resumeFrom({ header: cp2.header, events: sub }));
      equal([rs.reason, rs.index], ['diverged', i], `a stored \`resumed\` naming ${JSON.stringify(ids)} where two tasks were in flight is refused at its position`);
    }
  });

  test('RN-R24 — the consumer is handed the DRIVER`s positions from the stored length on, and every callback only past it', () => {
    const K = cutAt(isOutcomeOf('R:a2:0:0'));
    const regionBelow = K.events.filter((e) => e.kind === 'region').length;
    ok(K.events.length > 10 && regionBelow >= 6, `the ARRANGEMENT: the store holds ${K.events.length} elements, ${regionBelow} of them region events — a count from 0, or a callback for every element, differs`);
    const seqs: number[] = [];
    const heldInside: number[] = [];
    const regions: string[] = [];
    const reports: string[] = [];
    const ref = {} as { d: Driver };
    const s = new FakeScheduler();
    ref.d = new Driver(MAIN, {
      runId: 'R', scheduler: s, createTask: (c) => c, predicates: PREDICATES,
      // every result lacks `ok`, so every settlement's result is nonconforming (`OR-R13`)
      ...typesFor(['T'], {}, { T: { url: 'test://T', outputSchema: { type: 'object', required: ['ok'] } } } as never),
      validateBoundaries: false, joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
      onFoldInput: (_i: FoldInput, seq: number) => { seqs.push(seq); heldInside.push(ref.d.checkpoint().events.length); },
      onRegionEvent: (e: { type: string; branchPath: string }) => { regions.push(`${e.type}@${e.branchPath}`); },
      onNonconformingResult: (f: { taskId: string }) => { reports.push(f.taskId); },
    });
    ref.d.resume(K);
    // publish's result LACKS `ok` — the control: a settlement past the stored events IS reported.
    s.settle('R:publish:-:0', 'done', { result: { no: 'ok' } });
    const all = ref.d.foldInputs();
    equal(seqs, all.map((_, i) => i).slice(K.events.length), 'positions K.length … n-1: the DRIVER`s index, never a count from the consumer`s first call');
    equal(heldInside, seqs.map((q) => q + 1), 'a checkpoint taken inside the callback for position k holds k + 1 elements — `RN-R18`, on a resumed run');
    equal(regions, ['branch.arrived@0'], 'onRegionEvent hears only the region event PAST the stored events — a2 arriving — and none of the ones the store holds');
    equal(reports, ['R:publish:-:0'],
      'onNonconformingResult reports publish — settled PAST the stored events — and none of the six REPLAYED settlements, each as nonconforming, which were reported in the process that stored them');
  });

  test('RN-R19 — a fed element is appended AS STORED — its clock, its attempts — and as the driver`s own copy', () => {
    // W89's adequacy reader, a01-a05: every fixture above ran both drivers at `now: () => 0` with attempts 0, so a fed
    // record RESTAMPED by this process's clock, or given fresh attempts, was the same bytes. Here the two clocks differ.
    const s0 = new FakeScheduler();
    const ref = mainDriver(s0, { now: () => 100 });
    ref.start({ n: 1 });
    s0.settle('R:ingest:-:0', 'done', { result: { v: 1 }, attempts: 3, startTime: 7, endTime: 9, executionTime: 2 });
    s0.settle('R:gate:-:0', 'done', { result: { score: 0.9 } });
    s0.settle('R:pre:-:0', 'done', { result: { p: 1 } });
    s0.settle('R:a1:0:0', 'done', { result: { a: 1 } });
    s0.settle('R:c:2:0', 'user_action', { error: 'ask a person' });
    ok(ref.resolve('R:c:2:0', 'done', { result: { c: 'by hand' }, actor: 'ana' }), 'the ARRANGEMENT: a resolution, stamped at 100');
    const stored = structuredClone(ref.checkpoint()) as { header: Checkpoint['header']; events: FoldInput[] };
    const { d } = resumeFrom(stored, { now: () => 999 });
    const records = (evs: readonly FoldInput[]) => evs.flatMap((e) => (e.kind === 'outcome' || e.kind === 'resolution' ? [e.record] : []));
    equal(records(d.foldInputs()), records(stored.events), 'every fed settlement and resolution is the stored one — observedAt 100, attempts 3, the timings — not restamped at 999');
    ok(records(stored.events).every((r) => r.observedAt === 100) && (records(stored.events)[0] as { attempts: number }).attempts === 3,
      'the ARRANGEMENT: the stored records carry the other clock and non-zero attempts');
    // And a COPY: a store writing into what it handed the resume rewrites nothing the driver holds (a05).
    const before = d.foldInputs();
    const first = stored.events.find((e) => e.kind === 'outcome')!;
    (first as unknown as { record: Record<string, unknown> }).record.terminalState = 'failed';
    ((first as unknown as { record: { result: Record<string, unknown> } }).record.result).v = 'WRITTEN BY THE STORE';
    equal(d.foldInputs(), before, 'the driver`s sequence is unmoved by a write into the stored checkpoint after the resume');
  });

  test('RN-R20 — the data comparison reads nested region events and every key, and ignores key order and undefined keys', () => {
    // W89's adequacy reader, a08-a11: every divergence fixture was a flat dispatch or a length, so a SHALLOW comparison,
    // one that ignored an extra key, and one that did NOT ignore key order or an undefined key all passed.
    const Q = REF.quiet;
    const opened = at(Q.events, (e) => e.kind === 'region' && e.event.type === 'branch.opened' && e.event.branchPath === '1');
    const disp = at(Q.events, isDispatchOf('R:b:1:0'));
    ok(opened > 0 && disp > 0, 'the ARRANGEMENT: a stored region event and a stored dispatch to tamper with');
    const swap = (k: number, e: FoldInput) => Q.events.map((x, j) => (j === k ? e : x));
    const nested = refusal(() => resumeFrom({ header: Q.header, events: swap(opened, { kind: 'region', event: { ...(Q.events[opened] as { event: object }).event, branchPath: '9' } } as FoldInput) }));
    equal([nested.reason, nested.index], ['diverged', opened], 'a region event whose NESTED branchPath differs is refused at its position — the comparison reads inside the event');
    const extra = refusal(() => resumeFrom({ header: Q.header, events: swap(disp, { ...Q.events[disp], note: 'x' } as unknown as FoldInput) }));
    equal([extra.reason, extra.index], ['diverged', disp], 'a stored element with an EXTRA key is refused at its position');
    const reordered = swap(disp, { taskId: 'R:b:1:0', kind: 'dispatched' } as FoldInput);
    const regionReordered = reordered.map((x, j) => (j === opened ? { event: Object.fromEntries(Object.entries((x as { event: object }).event).reverse()), kind: 'region' } as unknown as FoldInput : x));
    equal(resumedOf(resumeFrom({ header: Q.header, events: regionReordered }).d).length, 1,
      'the same elements with their keys in another ORDER — at the top level and inside a region event — resume');
    equal(resumedOf(resumeFrom({ header: Q.header, events: swap(disp, { ...Q.events[disp], note: undefined } as unknown as FoldInput) }).d).length, 1,
      'and so does one carrying an undefined-valued key, which a store may drop or keep');
  });

  test('RN-R23 — the `halted` position is the halt`s own, wherever it sits', () => {
    // W89's adequacy reader, a18-a19 (v0.23): the tail fixture's lost tail WAS the stop, so `index = stored length` passed;
    // and every stored `halted` was the LAST element, so `index = last` passed. Here neither coincides.
    const FJM = {
      flowId: 'resume-stop-late', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['x', 'y'] },
        { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
        { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'm' }] },
        { id: 'm', kind: 'map', over: 'items', branch: 's' },
        { id: 's', kind: 'task', type: 'T', edges: [{ to: 'c2' }] },
        { id: 'c2', kind: 'join', of: 'm', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    // (1) A stop regenerated in the lost tail AFTER two other elements: y arrives, the join fires, and the map after it
    // finds no array in what the join carried.
    const inside: Checkpoint[] = [];
    const s0 = new FakeScheduler();
    const ref = {} as { d: Driver };
    ref.d = plainDriver(FJM, 'sl', s0, { onFoldInput: (_i: FoldInput, seq: number) => { inside[seq] = ref.d.checkpoint(); } });
    ref.d.start({});
    s0.settle('sl:ingest:-:0', 'done', { result: {} });
    s0.settle('sl:x:0:0', 'done', { result: {} });
    s0.settle('sl:y:1:0', 'done', { result: {} });
    const all = ref.d.foldInputs();
    const stopAt = all.findIndex((e) => e.kind === 'halted');
    const cut = inside[at(all, isOutcomeOf('sl:y:1:0'))]!;
    ok(stopAt > cut.events.length, `the ARRANGEMENT: the halt is at ${stopAt}, ${stopAt - cut.events.length} past the store's length ${cut.events.length}`);
    const tail = refusal(() => plainDriver(FJM, 'sl', new FakeScheduler()).resume(cut));
    equal([tail.reason, tail.index], ['halted', stopAt], 'refused at the HALT`s position, not at the stored length');
    // (2) A stored `halted` that is NOT the last element: a settlement heard after the halt is appended after it.
    const s1 = new FakeScheduler();
    const late = plainDriver(FJM, 'sm', s1);
    late.start({});
    s1.settle('sm:ingest:-:0', 'done', { result: {} });
    s1.settle('sm:x:0:0', 'done', { result: { f: () => 1 } }); // OR-R6: the run stops here, with y in flight
    s1.settle('sm:y:1:0', 'done', { result: {} });
    const stored = late.checkpoint();
    const k = stored.events.findIndex((e) => e.kind === 'halted');
    ok(k >= 0 && k < stored.events.length - 1, `the ARRANGEMENT: the stored halt is at ${k}, before the last element ${stored.events.length - 1}`);
    const r = refusal(() => plainDriver(FJM, 'sm', new FakeScheduler()).resume(stored));
    equal([r.reason, r.index], ['halted', k], 'refused at the stored halt`s own position, not the last');
  });

  // **W171 — `RN-R23` v0.16's DUAL READ** (ADR 0102 rule 3, P34 stop-and-ask (f)). A 0.7.0 store holds the halt under
  // its old kind; `CHECKPOINT_FORMAT` did not move, so such a checkpoint must be refused for the RIGHT reason — `halted`,
  // at that element's position — where renamed with no read it passed `resumeRefusal` and the replay refused it
  // `diverged` (P34 fact 7 (i)-(ii)). Each 0.7.0 checkpoint below is a checkpoint this file's run took, with ONE element's
  // `kind` re-written to what 0.7.0 wrote there and nothing else — the bytes a 0.7.0 store holds of that run.
  test('RN-R23 / ADR 0102 — a stored `stopped` (0.7.0`s kind) is refused `halted` at ITS position under this format, one of a live run still resumes, and the 0.7.0 checkpoint itself is refused `format`', () => {
    const as070 = (cp: Checkpoint, at: number): Checkpoint => ({
      header: cp.header,
      events: cp.events.map((e, i) => (i === at ? { ...e, kind: 'stopped' } as unknown as FoldInput : e)),
    });
    const oldKinds = (cp: Checkpoint) => cp.events.filter((e) => (e.kind as string) === 'stopped').length;

    // (1) `OR-R6`: ingest's result is refused by the clone, so NO record is written for it (`OR-R6`) and the run is
    // `[dispatched ingest, halted]` — the halt at position 1, derived from the rule and not read off the run.
    const s1 = new FakeScheduler();
    const o = plainDriver(INGEST_THEN_MAP, 'lg', s1);
    o.start({});
    s1.settle('lg:ingest:-:0', 'done', { result: { f: () => 1 } });
    const halted = o.checkpoint();
    equal(halted.events.map((e) => e.kind), ['dispatched', 'halted'], 'the ARRANGEMENT: the entry dispatched, then the halt at 1');
    equal(oldKinds(halted), 0, 'and NOTHING this version writes is of the old kind — read, never written (ADR 0102 rule 3)');
    const old = as070(halted, 1);
    equal(oldKinds(old), 1, 'the ARRANGEMENT: the 0.7.0-shaped checkpoint holds exactly one `stopped` element');
    // **The 0.7.0 checkpoint ITSELF is format 1, and is refused `format` before its events are read** (ADR 0138
    // consequence 3): the `stopped` read below is held under THIS driver's header, a pairing no driver writes.
    const as070AtFormat1 = { ...old, header: { ...old.header, format: 1 } } as Checkpoint;
    equal([refusal(() => plainDriver(INGEST_THEN_MAP, 'lg', new FakeScheduler()).resume(as070AtFormat1)).reason,
      resumeRefusal(INGEST_THEN_MAP, as070AtFormat1, 'lg')?.reason], ['format', 'format'],
      'a 0.7.0 checkpoint as 0.7.0 wrote it — format 1 — is refused `format`, by the driver and the pre-check, never `halted`');
    const sch = new FakeScheduler();
    const d = plainDriver(INGEST_THEN_MAP, 'lg', sch);
    const r = refusal(() => d.resume(old));
    equal([r.reason, r.index], ['halted', 1], 'refused `halted` at the stored element`s position — not `diverged`, which is what a rename with no read gave');
    ok(r.message.startsWith('ResumeRefused (halted)'), `the message opens with the reason, never the stored kind: ${r.message}`);
    // The stored element's reason, hand-written from `OR-R6`'s message (`src/driver/listener.ts`) and `failRun`'s
    // `<class>: <message>` (RN-R8), as the refusal quotes it (JSON).
    ok(r.message.includes(JSON.stringify('UncloneableResult: the result of task "lg:ingest:-:0" is not structured-cloneable')),
      `and it quotes the stored element's reason: ${r.message}`);
    ok(r.message.includes('`stopped`') && r.message.includes('ADR 0102'), `and the message names the kind the store holds: ${r.message}`);
    equal([resumeRefusal(INGEST_THEN_MAP, old, 'lg')?.reason, resumeRefusal(INGEST_THEN_MAP, old, 'lg')?.index, resumeRefusal(INGEST_THEN_MAP, old)?.index],
      ['halted', 1, 1], 'and resumeRefusal() — the runtime`s pre-check — refuses it the same, with and without a run id');
    equal([sch.added.length, d.foldInputs().length], [0, 0], 'nothing replayed, nothing dispatched');
    throws(() => d.start({}), 'MultipleRuns', 'and the driver is SPENT, as after any refused resume');

    // (2) The stored `stopped` is NOT the last element: on MAIN, `a1`'s result is refused while `b` and `c` are in flight,
    // and `b`'s settlement is appended after the halt — routed nowhere (`OR-R10`).
    const s2 = new FakeScheduler();
    const m = mainDriver(s2);
    m.start({ n: 1 });
    drive(m, s2, SCRIPT.slice(0, 3));
    s2.settle('R:a1:0:0', 'done', { result: { f: () => 1 } });
    s2.settle('R:b:1:0', 'done', { result: { b: 1 } });
    const late = m.checkpoint();
    const k = late.events.findIndex((e) => e.kind === 'halted');
    ok(k >= 0 && k === late.events.length - 2 && isOutcomeOf('R:b:1:0')(late.events.at(-1)!),
      `the ARRANGEMENT: the halt at ${k}, and b's settlement after it, last`);
    const r2 = refusal(() => mainDriver(new FakeScheduler()).resume(as070(late, k)));
    equal([r2.reason, r2.index], ['halted', k], 'refused `halted` at the stored `stopped` element`s own position, not the last');

    // (3) The CONTROL: a 0.7.0 checkpoint of a LIVE run holds no halt element, so its bytes are this version's — and it
    // resumes: `REF.quiet`, with `b` and `a2` in flight (RN-R21's case above) and `c` parked.
    equal(oldKinds(REF.quiet) + REF.quiet.events.filter((e) => e.kind === 'halted').length, 0, 'the ARRANGEMENT: no halt element of either kind');
    equal(resumeRefusal(MAIN, REF.quiet, 'R'), null, 'the dual read refuses nothing a live run stored');
    equal(REF.quiet.header.format, 2, 'the ARRANGEMENT: format 2 — this driver`s (it read format 1, what 0.7.0 wrote, until ADR 0138)');
    const { d: live, s: ls } = resumeFrom(REF.quiet);
    equal([resumedOf(live).map((e) => e.taskIds), ls.added.map((t) => t.id)], [[['R:b:1:0', 'R:a2:0:0']], ['R:b:1:0', 'R:a2:0:0']],
      'it RESUMES, re-dispatching exactly the in-flight set');
  });

  test('RN-R23 — a resume refused DURING its replay leaves the driver spent and deaf, with nothing handed to a scheduler', () => {
    // W89's adequacy reader, a21-a23 and e01, and its conformity reader, finding 6: every "spent" assertion was on a
    // HEADER refusal. After a divergence the driver held a partial replay, stayed subscribed, and — with `failed` unset —
    // ROUTED a settlement for a task it had held.
    const s = new FakeScheduler();
    const failures: string[] = [];
    const delivered: number[] = [];
    const d = mainDriver(s, {
      predicates: INVERTED, onRunFailure: (f: { kind: string }) => { failures.push(f.kind); },
      onFoldInput: (_i: FoldInput, seq: number) => { delivered.push(seq); },
    });
    const r = refusal(() => d.resume(REF.quiet));
    ok(r.reason === 'diverged', 'the ARRANGEMENT: refused during the replay');
    throws(() => d.checkpoint(), 'NotStarted', 'there is no run to checkpoint');
    throws(() => d.start({ n: 1 }), 'MultipleRuns', 'and start() is refused — the driver is spent, not reset');
    throws(() => d.resume(REF.quiet), 'MultipleRuns', 'and so is a second resume');
    const held = d.foldInputs().length;
    // The scheduler delivers settlements under this run id — for a task the replay held, and for one it never saw.
    s.settle('R:ingest:-:0', 'done', { result: { v: 1 } });
    s.settle('R:b:1:0', 'done', { result: { b: 1 } });
    s.settle('R:zz:-:0', 'done', { result: {} });
    equal([s.added.length, d.foldInputs().length, failures, delivered], [0, held, [], []],
      'nothing reached the scheduler, nothing was appended, nothing was reported and nothing delivered: a spent driver hears nothing');
    ok(d.resolve('R:c:2:0', 'done', { result: {}, actor: 'ana' }) === false, 'and a resolution is refused');
    equal((d as unknown as { replay: unknown }).replay, null, 'and it retains no replay — the stored events and held dispatches are released (a23)');
  });

  test('ID-R3 — start() and resume() are one run`s two doors: each refuses the other and itself', () => {
    const a = mainDriver(new FakeScheduler());
    a.start({ n: 1 });
    throws(() => a.resume(REF.quiet), 'MultipleRuns', 'resume() after start() is refused');
    const b = mainDriver(new FakeScheduler());
    b.resume(REF.quiet);
    throws(() => b.start({ n: 1 }), 'MultipleRuns', 'start() after resume() is refused');
    throws(() => b.resume(REF.quiet), 'MultipleRuns', 'and a second resume() is refused');
    let caught: unknown;
    try { b.resume(REF.quiet); } catch (e) { caught = e; }
    ok(caught instanceof MultipleRuns, 'by the class ID-R3 names');
    // W140 — Q533, P31 decision 2: the class names the refusal ONCE, by its own `name`; the message does not.
    equal([(caught as Error).message.startsWith('this driver already started or resumed run "R"'), String(caught).split('MultipleRuns').length],
      [true, 2], `String(e) names the class EXACTLY once, and the message opens with the run: ${String(caught).slice(0, 80)}`);
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
