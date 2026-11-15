/**
 * **L2 — a LOOP resumed from its settlements** — `spec/run-state.md` v0.37 section 9 (*A loop resumes from its
 * settlements*), `RN-R19`-`RN-R22`, `RN-R45`, and `spec/join-policy.md` `JP-R14`'s *replays as a decision edge does*;
 * P47 exit artifact (3), [W230](../../doc/work-items/w230-a-loop-resumed-measured-and-on-real-workers.md).
 *
 * From fixture outcome logs with no scheduler (`../matrix/run.ts`'s `Fake`). **Every expected value is written by hand**:
 * which task is in flight at a cut from the run's own steps (`RN-R21`: dispatched and not settled; a park is a
 * settlement), the resumed run's sequence from `RN-R20` and `RN-R22` (the uninterrupted run's, one `resumed` element
 * aside), and a reading's answers from `RN-R45`'s *for a JOIN, an arrival at an arriving branch's path, or the collection
 * it handed on when it fired, at its opener's path*, with a loop's rounds as its branches (`JP-R13`) and its collection
 * the join value (`JP-R15`). No case depends on completion order: the map inside the training body settles DESCENDING,
 * and the same order is replayed.
 */
import { collected, equal, ok, readText, ROOT, suite } from '../harness.ts';
import { CHECKPOINT_FORMAT, Driver, inputOf, type Checkpoint } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { Fake } from '../matrix/run.ts';

const SUITE = 'W230 — L2: a loop resumed from its settlements — after a round, mid-round, at a park, at every element, and read at its join';

const reg = JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as {
  workers: never; nodeTypes: never; pools?: never; groups?: Record<string, unknown>;
};
const OPTS = {
  predicates: new Map(), workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools,
  groups: Object.keys(reg.groups ?? {}), validateBoundaries: false, joinPolicy: liveToken as JoinPolicy,
};
const mk = (flow: FlowDefinition, sch: Fake): Driver =>
  new Driver(flow, { ...OPTS, runId: 'r1', scheduler: sch, createTask: (c) => c as never, now: () => 1 });

/** One step of a run's script: a settlement, or a park's answer. */
interface Step { id: string; state?: 'done' | 'failed' | 'user_action'; result?: unknown; resolve?: boolean }

/** `ingest → L(work) → J → after → done`, `until: input.ok == true`, at most 4 rounds; `after` reads every round. */
const POLL = {
  flowId: 'w230-poll', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'L' }] },
    { id: 'L', kind: 'loop', branch: 'work', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 4 },
    { id: 'work', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'J' }] },
    { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'after' }] },
    { id: 'after', kind: 'task', type: 'PublishWorker', needs: { all: ['work'] }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;
/** Three rounds, a PARK in round 1 answered by a person, `until` holding on round 2. */
const POLL_STEPS: Step[] = [
  { id: 'r1:ingest:-:0', result: { seed: 1 } },
  { id: 'r1:work:0:0', result: { ok: false, n: 0 } },
  { id: 'r1:work:1:0', state: 'user_action', result: null },
  { id: 'r1:work:1:0', resolve: true, result: { ok: false, n: 1 } },
  { id: 'r1:work:2:0', result: { ok: true, n: 2 } },
  { id: 'r1:after:-:0', result: { published: true } },
];

const TRAINING = JSON.parse(await readText(`${ROOT}spec/examples/valid/loop-training.flow.json`)) as FlowDefinition;
/** Two rounds (the bound read off `ingest`), the inner map's two instances settled DESCENDING in each. */
const TRAINING_STEPS: Step[] = [
  { id: 'r1:ingest:-:0', result: { budget: { rounds: 2 } } },
  ...[0, 1].flatMap((k): Step[] => [
    { id: `r1:plan:${k}:0`, result: { items: ['a', 'b'] } },
    { id: `r1:rollout:${k}.1:0`, result: { roll: `${k}.1` } },
    { id: `r1:rollout:${k}.0:0`, result: { roll: `${k}.0` } },
    { id: `r1:fit:${k}:0`, result: { fit: k } },
    { id: `r1:evaluate:${k}:0`, result: { score: 0.1 } },
  ]),
  { id: 'r1:promote:-:0', result: {} },
];

function apply(d: Driver, sch: Fake, s: Step): void {
  if (s.resolve) d.resolve(s.id, 'done', { result: s.result, actor: 'ana' });
  else sch.settle(s.id, s.state ?? 'done', s.result);
}

/** The run nobody killed, with the checkpoint taken after each step: `cps[k]` holds the first `k` steps. */
function uninterrupted(flow: FlowDefinition, steps: Step[]): { d: Driver; cps: Checkpoint[] } {
  const sch = new Fake();
  const d = mk(flow, sch);
  d.start({});
  const cps = [d.checkpoint()];
  for (const s of steps) { apply(d, sch, s); cps.push(d.checkpoint()); }
  return { d, cps };
}

/** Resume `cp` on a fresh driver and scheduler, then play every step the checkpoint does not already hold a settlement for. */
function resumeAndFinish(flow: FlowDefinition, cp: Checkpoint, steps: Step[]): { d: Driver; sch: Fake; resumed: string[] } {
  const sch = new Fake();
  const d = mk(flow, sch);
  d.resume(cp);
  const r = d.foldInputs().find((e) => e.kind === 'resumed');
  const resumed = r?.kind === 'resumed' ? [...r.taskIds] : [];
  for (const s of steps) {
    const held = s.resolve
      ? cp.events.some((e) => e.kind === 'resolution' && e.record.taskId === s.id)
      : cp.events.some((e) => e.kind === 'outcome' && e.record.kind === 'outcome' && e.record.taskId === s.id && e.record.terminalState === (s.state ?? 'done'));
    if (!held) apply(d, sch, s);
  }
  return { d, sch, resumed };
}

const withoutResumed = (d: Driver): FoldInput[] => d.foldInputs().filter((e) => e.kind !== 'resumed');

/**
 * **The `FoldInput` kinds 0.14.0 wrote**, written out by hand from `src/fold/run-state.ts` at `df60b9e` — P47's
 * declaration, before W228 — so a kind a loop added would fail here naming itself (`spec/run-state.md` section 9:
 * *no new `FoldInput` kind*). A loop's every decision is in the sequence as one of these, never as a new one.
 */
const KINDS_AT_0_14_0 = new Set([
  'outcome', 'resolution', 'region', 'regionEntered', 'dispatched', 'asked', 'pathEnded', 'joinSettled', 'halted',
  'cancelRequested', 'interrupted', 'paused', 'unpaused', 'resumed', 'gated', 'attempted',
]);
/** `spec/run-state.md` section 9's measured cut counts — every element of each completed log a cut, 0 included. */
const DECLARED_CUTS = { poll: 23, training: 44 } as const;

const DECLARED_CASES = [
  'a checkpoint AFTER ROUND 0: round 1 is the one task in flight, re-dispatched at its own id, and the run folds equal to the uninterrupted one',
  'MID-ROUND 1 of the training loop, one inner instance settled: the other is in flight, and the inner join and the round still fire once',
  'at a PARK inside round 1: nothing is in flight, the park stays parked, and answered after the resume the run completes as the uninterrupted one',
  'EVERY ELEMENT a cut, both flows: the resumed run`s sequence, its one `resumed` element aside, IS the uninterrupted run`s',
  'a READING of a loop`s join (RN-R45): each round`s arrival at its own path, then the join value handed on at the loop`s',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const { d: whole, cps } = uninterrupted(POLL, POLL_STEPS);
    const cp = cps[2]!; // ingest and round 0 settled
    ok(cp.events.some((e) => e.kind === 'region' && e.event.type === 'branch.opened' && e.event.branchPath === '1'),
      'the ARRANGEMENT: the store holds round 1`s opening');
    const r = resumeAndFinish(POLL, cp, POLL_STEPS);
    equal(r.resumed, ['r1:work:1:0'], 'RN-R21: round 1`s one task is in flight, and only it');
    equal(r.sch.added[0]?.id, 'r1:work:1:0', 'and it is the first task the new scheduler is handed, at the SAME id');
    equal((r.sch.added[0]?.payload as { input?: unknown } | undefined)?.input, { ok: false, n: 0 },
      'JP-R15: re-handed, round 1 receives what round 0 ARRIVED with, regenerated from the stored settlement');
    equal(withoutResumed(r.d), whole.foldInputs(), 'the resumed run`s sequence, `resumed` aside, IS the uninterrupted run`s');
    equal(fold(withoutResumed(r.d)), fold(whole.foldInputs()), 'and so is its fold');
    equal(fold(r.d.foldInputs()).outcome, 'completed', 'the resumed run completes');
    equal(r.d.joinStatusOf('L'), { status: 'satisfied', describe: { iterations: 3, bound: 4 } }, 'and its loop answers as the live one did');
  });

  test(DECLARED_CASES[1]!, () => {
    const { d: whole, cps } = uninterrupted(TRAINING, TRAINING_STEPS);
    // ingest, round 0's five steps, round 1's plan and its instance 1's rollout: instance 0's is in flight.
    const cp = cps[8]!;
    ok(cp.events.some((e) => e.kind === 'outcome' && e.record.taskId === 'r1:rollout:1.1:0')
      && !cp.events.some((e) => e.kind === 'outcome' && e.record.taskId === 'r1:rollout:1.0:0'),
    'the ARRANGEMENT: the store is cut between round 1`s two rollouts');
    const r = resumeAndFinish(TRAINING, cp, TRAINING_STEPS);
    equal(r.resumed, ['r1:rollout:1.0:0'], 'RN-R21: the one rollout of round 1 not yet settled');
    equal(withoutResumed(r.d), whole.foldInputs(), 'the sequence, `resumed` aside, IS the uninterrupted run`s');
    equal(r.d.foldInputs().filter((e) => e.kind === 'joinSettled').map((e) => e.kind === 'joinSettled' ? `${e.regionId}:${e.regionPath}` : ''),
      ['envs:0', 'envs:1', 'train:-'], 'the inner join fired once per round and the loop`s once — none twice across the resume');
    equal(fold(r.d.foldInputs()).outcome, 'completed', 'the resumed run completes');
  });

  test(DECLARED_CASES[2]!, () => {
    const { d: whole, cps } = uninterrupted(POLL, POLL_STEPS);
    const cp = cps[3]!; // round 1's task parked, not yet answered
    ok(cp.events.some((e) => e.kind === 'outcome' && e.record.kind === 'outcome' && e.record.taskId === 'r1:work:1:0' && e.record.terminalState === 'user_action'),
      'the ARRANGEMENT: the store holds round 1`s park');
    const sch = new Fake();
    const d = mk(POLL, sch);
    d.resume(cp);
    equal(d.foldInputs().filter((e) => e.kind === 'resumed').map((e) => e.kind === 'resumed' ? e.taskIds : null), [[]],
      'RN-R21: a park is a settlement — nothing is in flight');
    equal(sch.added, [], 'and nothing is handed to the scheduler');
    equal(fold(d.foldInputs()).outcome, 'awaiting_action', 'the resumed run waits on the person');
    equal(d.joinStatusOf('L'), { status: 'waiting', describe: { iterations: 2, bound: 4 } }, 'a park HOLDS the loop (JP-R14): round 1 still live');
    for (const s of POLL_STEPS.slice(3)) apply(d, sch, s);
    equal(withoutResumed(d), whole.foldInputs(), 'answered after the resume: the sequence, `resumed` aside, IS the uninterrupted run`s');
    equal(fold(d.foldInputs()).outcome, 'completed', 'and it completes');
  });

  test(DECLARED_CASES[3]!, () => {
    for (const [name, flow, steps] of [['poll', POLL, POLL_STEPS], ['training', TRAINING, TRAINING_STEPS]] as const) {
      const { d: whole } = uninterrupted(flow, steps);
      const full = whole.checkpoint();
      equal(full.events.length + 1, DECLARED_CUTS[name], `${name}: the completed log is the length section 9 measured — ${DECLARED_CUTS[name]} cuts, so no element was added or lost`);
      equal(full.header.format, CHECKPOINT_FORMAT, `${name}: the checkpoint is written at the current format`);
      equal(CHECKPOINT_FORMAT, 2, 'section 9: CHECKPOINT_FORMAT unmoved by the loop — 2, as RN-R16 has held it since v0.36');
      equal(full.events.map((e) => e.kind).filter((k) => !KINDS_AT_0_14_0.has(k)), [], `${name}: no FoldInput kind 0.14.0 did not write`);
      let redispatched = 0;
      for (let k = 0; k <= full.events.length; k += 1) {
        const r = resumeAndFinish(flow, { header: full.header, events: full.events.slice(0, k) }, steps);
        equal(withoutResumed(r.d), full.events, `${name}, cut at ${k}: the sequence, \`resumed\` aside, IS the uninterrupted run's`);
        redispatched += r.resumed.length;
      }
      ok(redispatched > 0, `${name}: the CONTROL — ${redispatched} tasks re-dispatched across the cuts, so the in-flight road was taken`);
    }
  });

  test(DECLARED_CASES[4]!, () => {
    const { d } = uninterrupted(POLL, POLL_STEPS);
    const run = d.checkpoint();
    const r = inputOf(POLL, OPTS, run, { nodeId: 'J' });
    ok(r.ok, `the reading answers: ${r.ok ? '' : r.message}`);
    if (!r.ok) return;
    equal(r.inputs.map((i) => [i.handed, i.branchPath]), [['arrival', '0'], ['arrival', '1'], ['arrival', '2'], ['collection', '-']],
      'three rounds arrived, each at its round`s path, then the join FIRED at the loop`s own path');
    equal(r.inputs.slice(0, 3).map((i) => i.value), [{ ok: false, n: 0 }, { ok: false, n: 1 }, { ok: true, n: 2 }],
      'each arrival: what that round carried into the join');
    equal(r.inputs[3]!.value, { last: { ok: true, n: 2 }, iterations: 3, exhausted: false },
      'the collection: the join value JP-R15 hands on — done on round 2, not exhausted');
    const settled = run.events.findIndex((e) => e.kind === 'joinSettled');
    const cut = inputOf(POLL, OPTS, { header: run.header, events: run.events.slice(0, settled) }, { nodeId: 'J' });
    ok(cut.ok, 'a store cut BEFORE the join settled answers');
    if (!cut.ok) return;
    equal(cut.inputs.map((i) => [i.handed, i.branchPath]), [['arrival', '0'], ['arrival', '1'], ['arrival', '2']],
      'a store cut BEFORE the join settled: the three arrivals, no collection');
    const at = inputOf(POLL, OPTS, { header: run.header, events: run.events.slice(0, settled + 1) }, { nodeId: 'J' });
    ok(at.ok, 'a store cut AT the join`s `joinSettled` answers');
    if (!at.ok) return;
    equal(at.inputs.map((i) => [i.handed, i.branchPath]), [['arrival', '0'], ['arrival', '1'], ['arrival', '2'], ['collection', '-']],
      'a store ending AT `joinSettled`: the join HAS fired, so its collection is handed on at the loop`s path (RN-R45)');
    equal(at.inputs[3]!.value, { last: { ok: true, n: 2 }, iterations: 3, exhausted: false }, 'and it is the join value');
  });

  test(DECLARED_CASES[DECLARED_CASES.length - 1]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    equal(ran, [...DECLARED_CASES].sort(), 'the cases that ran ARE the declared ones, both ways');
  });
});
