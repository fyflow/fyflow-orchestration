/**
 * **L5 — a LOOP in a fan-out branch, against every shipped join policy** — `spec/join-policy.md` v0.26 `JP-R13`-`JP-R15`
 * and `JP-R10`, P47 decisions 2 and 5, [W229](../../doc/work-items/w229-a-loop-at-run-time.md); its *Tests* line: *the
 * matrix gains a loop × lost / break / park-then-done / park-then-failed / cancel / stop / pause*.
 *
 * `ingest → F[a, pre]`; `a → FJ`; `pre → L`, a loop whose body is `work` — `until: input.ok == true`, `maxIterations: 3`, an
 * edge to the `end` `stop` when `isLowConfidence` (the result's `stop`) — whose join `J` is the arrival of F's branch 1 at
 * `FJ`; `FJ → publish`. The loop is in branch 1, so it sits at path `1` and its rounds are `1.0`, `1.1`. **A loop's join
 * takes no policy, so the COLUMNS are what each policy makes of what the loop did to F's branch 1**, written by hand from
 * section 3's definitions:
 *
 * - **lost** / **park-then-failed** — the round is lost, the loop`s join `unsatisfiable` (`JP-R14`), and `JP-R10` emits
 *   `lost(F:1)`: `arrival-count` has 1 of N=2 for ever — waiting, the run `stuck`; `live-token` counts 0 having been
 *   positive — satisfied; `live-token-requiring-arrival` likewise, branch 0 having arrived. The join carries `a`'s alone.
 * - **break** / **park-then-done** — the loop`s join FIRES, its successor `FJ` is branch 1's arrival: all three satisfied,
 *   the join carrying `a`'s result and the loop's value under `pre`, branch 1's entry id (`JP-R12`).
 * - **cancel** / **stop** — a halt: no region event after the request (`RN-R31`, `RN-R33`), no next round, nothing fired;
 *   every policy still `waiting` on the stream the halt found, the fold `cancelled` and `interrupted`.
 * - **pause** — round 1 OPENS (its region event is the routing step's) and its dispatch is HELD until the unpause.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { JoinPolicy, UnsatisfiableJoin } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold } from '../../src/fold/run-state.ts';
import { POLICIES } from '../../src/fold/policies.ts';
import { registry } from './flows.ts';
import { Fake } from './run.ts';

const SUITE = 'W229 — L5: a loop × lost, break, park-then-done, park-then-failed, cancel, stop and pause';

const flow = (optional: boolean): FlowDefinition => ({
  flowId: optional ? 'w229-loop-in-a-fanout-optional' : 'w229-loop-in-a-fanout', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'F' }] },
    { id: 'F', kind: 'fanout', branches: ['a', 'pre'] },
    { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'FJ' }] },
    { id: 'pre', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'L' }] },
    { id: 'L', kind: 'loop', branch: 'work', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 3 },
    { id: 'work', kind: 'task', type: 'ScoreWorker', ...(optional ? { optional: true } : {}),
      edges: [{ to: 'stop', when: { predicate: 'isLowConfidence' } }, { to: 'J' }] },
    { id: 'stop', kind: 'end', outcome: 'stopped' },
    { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'FJ' }] },
    { id: 'FJ', kind: 'join', of: 'F', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition);

interface Driven { d: Driver; sch: Fake; events: RegionEvent[]; unsat: UnsatisfiableJoin[] }

function start(optional: boolean, policy: JoinPolicy): Driven {
  const sch = new Fake();
  const events: RegionEvent[] = [];
  const unsat: UnsatisfiableJoin[] = [];
  const d = new Driver(flow(optional), {
    runId: 'r1', scheduler: sch, createTask: (c) => c as never,
    predicates: new Map([['isLowConfidence', (ctx) => (ctx.outcome.result as { stop?: boolean } | null)?.stop === true]]),
    workers: registry.workers, nodeTypes: registry.nodeTypes, pools: registry.pools, now: () => 1,
    joinPolicy: policy, validateBoundaries: false,
    onRegionEvent: (e) => events.push(e), onUnsatisfiableJoin: (u) => unsat.push(u),
  });
  d.start({});
  sch.settle('r1:ingest:-:0', 'done', {});
  sch.settle('r1:a:0:0', 'done', { a: 1 });
  sch.settle('r1:pre:1:0', 'done', { p: 1 });
  return { d, sch, events, unsat };
}

const BASE = ['opened(F:0)', 'opened(F:1)', 'arrived(F:0)', 'opened(L:1.0)'];
const evs = (x: Driven): string[] => x.events.map((e) => `${e.type.replace('branch.', '')}(${e.regionId}:${e.branchPath})`);
const published = (x: Driven): unknown => (x.sch.added.find((t) => t.id === 'r1:publish:-:0')?.payload as { input?: unknown } | undefined)?.input;

/** The rows: each drives a started run on from BASE. `async` only for the stop, which settles on a later tick. */
const ROWS: { key: string; optional: boolean; go: (x: Driven) => void | Promise<void> }[] = [
  { key: 'lost', optional: true, go: (x) => {
    x.sch.settle('r1:work:1.0:0', 'done', { ok: false });
    x.sch.settle('r1:work:1.1:0', 'failed', null);
  } },
  { key: 'break', optional: false, go: (x) => {
    x.sch.settle('r1:work:1.0:0', 'done', { ok: false });
    x.sch.settle('r1:work:1.1:0', 'done', { stop: true });
  } },
  { key: 'park-then-done', optional: false, go: (x) => {
    x.sch.settle('r1:work:1.0:0', 'user_action', null);
    ok(x.d.resolve('r1:work:1.0:0', 'done', { result: { ok: true }, actor: 'ana' }), 'park-then-done: the resolution is accepted');
  } },
  { key: 'park-then-failed', optional: false, go: (x) => {
    x.sch.settle('r1:work:1.0:0', 'user_action', null);
    ok(x.d.resolve('r1:work:1.0:0', 'failed', { error: 'no', actor: 'ana' }), 'park-then-failed: the resolution is accepted');
  } },
  { key: 'cancel', optional: false, go: (x) => {
    x.sch.settle('r1:work:1.0:0', 'done', { ok: false });
    void x.d.cancel({ actor: 'ops' });
    x.sch.settle('r1:work:1.1:0', 'cancelled', null);
  } },
  { key: 'stop', optional: false, go: async (x) => {
    x.sch.settle('r1:work:1.0:0', 'done', { ok: false });
    const stopped = x.d.stop({ actor: 'ops' });
    x.sch.settle('r1:work:1.1:0', 'cancelled', null);
    await stopped;
  } },
  { key: 'pause', optional: false, go: (x) => {
    x.d.pause({ actor: 'ops' });
    x.sch.settle('r1:work:1.0:0', 'done', { ok: false });
    ok(!x.sch.added.some((t) => t.id === 'r1:work:1.1:0'), 'pause: round 1 is NOT handed to the scheduler while the run is paused');
    equal(evs(x).at(-1), 'opened(L:1.1)', 'pause: round 1 OPENED — the routing step`s region event');
    x.d.unpause({ actor: 'ops' });
    ok(x.sch.added.some((t) => t.id === 'r1:work:1.1:0'), 'pause: the unpause hands round 1 on');
    x.sch.settle('r1:work:1.1:0', 'done', { ok: true });
  } },
];

const A = { a: { a: 1 } };
const LOOP_LOST = { fanoutId: 'L', regionPath: '1', joinId: 'J', policyId: 'loop' };
/** row -> [the events past BASE, the loop's unsatisfiable report or null, what publish received (undefined: never)]. */
const STREAM: Record<string, [string[], unknown, unknown]> = {
  'lost': [['arrived(L:1.0)', 'opened(L:1.1)', 'lost(L:1.1)', 'lost(F:1)'], { ...LOOP_LOST, describe: { iterations: 2, bound: 3 } }, A],
  'break': [['arrived(L:1.0)', 'opened(L:1.1)', 'exited(L:1.1)', 'arrived(F:1)'], null,
    { ...A, pre: { last: { ok: false }, iterations: 2, exhausted: false, broke: { at: 'stop', value: { stop: true } } } }],
  'park-then-done': [['suspended(L:1.0)', 'resumed(L:1.0)', 'arrived(L:1.0)', 'arrived(F:1)'], null, { ...A, pre: { last: { ok: true }, iterations: 1, exhausted: false } }],
  'park-then-failed': [['suspended(L:1.0)', 'resumed(L:1.0)', 'lost(L:1.0)', 'lost(F:1)'], { ...LOOP_LOST, describe: { iterations: 1, bound: 3 } }, A],
  'cancel': [['arrived(L:1.0)', 'opened(L:1.1)'], null, undefined],
  'stop': [['arrived(L:1.0)', 'opened(L:1.1)'], null, undefined],
  'pause': [['arrived(L:1.0)', 'opened(L:1.1)', 'arrived(L:1.1)', 'arrived(F:1)'], null, { ...A, pre: { last: { ok: true }, iterations: 2, exhausted: false } }],
};
/** row -> policy -> [F's status, the fold's outcome]. A loss reaches F's policies as `lost(F:1)`; a halt reaches none. */
const LOSS = { 'arrival-count': ['waiting', 'stuck'], 'live-token': ['satisfied', 'running'], 'live-token-requiring-arrival': ['satisfied', 'running'] };
const FIRED = { 'arrival-count': ['satisfied', 'running'], 'live-token': ['satisfied', 'running'], 'live-token-requiring-arrival': ['satisfied', 'running'] };
const halted = (o: string) => ({ 'arrival-count': ['waiting', o], 'live-token': ['waiting', o], 'live-token-requiring-arrival': ['waiting', o] });
const VERDICT: Record<string, Record<string, string[]>> = {
  'lost': LOSS, 'park-then-failed': LOSS, 'break': FIRED, 'park-then-done': FIRED, 'pause': FIRED,
  'cancel': halted('cancelled'), 'stop': halted('interrupted'),
};
/** What each policy's satisfied answer hands on, where its row loses branch 1: arrival-count never fires. */
const handed = (row: string, policy: string): unknown => (VERDICT[row]![policy]![0] === 'satisfied' ? STREAM[row]![2] : undefined);

const DECLARED_CASES = [
  'every row × every policy, by hand: the region events, the loop`s report, F`s status, what the fan-out`s join carried and the fold`s outcome',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, async () => {
    const policyIds = Object.keys(POLICIES).sort();
    equal(policyIds, ['arrival-count', 'live-token', 'live-token-requiring-arrival'], 'the three shipped policies — every column');
    const visited: string[] = [];
    for (const row of ROWS) {
      for (const id of policyIds) {
        const at = `${row.key} × ${id}`;
        const x = start(row.optional, POLICIES[id as keyof typeof POLICIES] as unknown as JoinPolicy);
        equal(evs(x), BASE, `${at}: the base stream — round 0 of the loop opened inside branch 1`);
        await row.go(x);
        const [tail, report] = STREAM[row.key]!;
        const [status, outcome] = VERDICT[row.key]![id]!;
        equal(evs(x), [...BASE, ...tail], `${at}: the region events`);
        equal(x.unsat.filter((u) => u.fanoutId === 'L').map((u) => ({ ...u })), report === null ? [] : [report], `${at}: the loop's report`);
        equal(x.d.joinStatusOf('F')?.status, status, `${at}: F's status`);
        equal(published(x), handed(row.key, id), `${at}: what FJ carried to publish`);
        equal(fold(x.d.foldInputs()).outcome, outcome, `${at}: the fold's outcome`);
        visited.push(at);
      }
    }
    equal(visited.length, ROWS.length * policyIds.length, 'every row × every policy was asserted');
    equal(ROWS.map((r) => r.key), ['lost', 'break', 'park-then-done', 'park-then-failed', 'cancel', 'stop', 'pause'], 'the rows W229 declares');
  });

  test(DECLARED_CASES[1]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    equal(ran, [...DECLARED_CASES].sort(), 'the cases that ran ARE the declared ones, both ways');
  });
});
