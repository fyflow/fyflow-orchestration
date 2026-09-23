/**
 * Ladder L1 — **`stuck`, the sixth run outcome**, and the fact that makes it
 * decidable. `spec/run-state.md` v0.3 sections 2-3, `RN-R10`, `RN-R11`, `RN-R12`,
 * [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md).
 *
 * **The first test is the one that matters**, and it is the assertion
 * [Q43](../../doc/open-questions.md)'s register entry claimed was unnecessary:
 * *"`regions` already records `{0: arrived, 1: exited}`, so the information is
 * present."* Two sequences differing only in whether the join fired produce a
 * byte-identical `regions` apart from `joined` — so before that field existed,
 * a permanently stuck run and a completed one were the same fold.
 *
 * Every expected value comes from `spec/run-state.md` section 3's precedence
 * table, which is ordered highest-first and is the order asserted here.
 */
import { equal, ok, suite } from '../harness.ts';
import { fold, isTerminal, step, type FoldInput, type RunState } from '../../src/fold/run-state.ts';
import type { OutcomeRecord } from '../../src/driver/log.ts';

const settled = (taskId: string, state: 'done' | 'failed' | 'user_action'): FoldInput => ({
  kind: 'outcome',
  record: {
    kind: 'outcome', taskId, terminalState: state, result: null, error: null, attempts: 0,
    schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1,
  } as OutcomeRecord,
});
const dispatched = (taskId: string): FoldInput => ({ kind: 'dispatched', taskId });
const opened = (b: string): FoldInput =>
  ({ kind: 'region', event: { type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: b } });
const arrived = (b: string): FoldInput =>
  ({ kind: 'region', event: { type: 'branch.arrived', regionId: 'split', regionPath: '-', branchPath: b } });
const exited = (b: string, at: string): FoldInput =>
  ({ kind: 'region', event: { type: 'branch.exited', regionId: 'split', regionPath: '-', branchPath: b, at } });
const suspended = (b: string, at: string): FoldInput =>
  ({ kind: 'region', event: { type: 'branch.suspended', regionId: 'split', regionPath: '-', branchPath: b, at } });
const pathEnd = (reason: 'end' | 'no-eligible-edge', at: string): FoldInput =>
  ({ kind: 'pathEnded', reason, at });
const joinSettled = (fired: boolean): FoldInput =>
  ({ kind: 'joinSettled', regionId: 'split', regionPath: '-', joinId: 'collect', fired });

/**
 * `p1-routed-away` up to the point the two policies diverge — hand-written from
 * the flow's own node ids and `spec/join-policy.md` section 2's vocabulary, not
 * captured from the driver.
 *
 * Branch 0 arrives at the join; branch 1 reaches the `abandoned` end node.
 */
const UP_TO_THE_JOIN: FoldInput[] = [
  dispatched('r1:ingest:-:0'), settled('r1:ingest:-:0', 'done'),
  opened('0'), opened('1'),
  dispatched('r1:scoreA:0:0'), dispatched('r1:scoreB:1:0'),
  settled('r1:scoreA:0:0', 'done'), arrived('0'),
  settled('r1:scoreB:1:0', 'done'), exited('1', 'abandoned'), pathEnd('end', 'abandoned'),
];

/** What `live-token` causes next: the join fires and `publish` runs to `done`. */
const LIVE_TOKEN_TAIL: FoldInput[] = [
  joinSettled(true),
  dispatched('r1:publish:-:0'), settled('r1:publish:-:0', 'done'), pathEnd('end', 'done'),
];

/** What `arrival-count` causes next: nothing at all. N is 2 and one branch arrived. */
const ARRIVAL_COUNT_TAIL: FoldInput[] = [];

suite('RN-R10 — a run whose join can no longer fire is `stuck`, not `completed`', (test) => {
  test('the two policies differ in `joined` and in NOTHING else about the region', () => {
    const lt = fold([...UP_TO_THE_JOIN, ...LIVE_TOKEN_TAIL]);
    const ac = fold([...UP_TO_THE_JOIN, ...ARRIVAL_COUNT_TAIL]);

    // `RN-R6`, which is exactly why `regions` could not answer this on its own.
    equal(lt.regions['split']!['-']!.opened, ac.regions['split']!['-']!.opened, 'same branches opened');
    equal(lt.regions['split']!['-']!.settled, ac.regions['split']!['-']!.settled,
      'same branches settled, the same way');
    equal(lt.regions['split']!['-']!.suspended, ac.regions['split']!['-']!.suspended,
      'neither has anyone waiting');
    equal(ac.regions['split']!['-']!.settled, { '0': 'arrived', '1': 'exited' },
      'this is the value Q43 said already held the information — both runs have it');

    // `RN-R11` — the one field that differs, and it is a routing fact.
    equal([lt.regions['split']!['-']!.joined, ac.regions['split']!['-']!.joined], [true, null],
      'RN-R11: one routed out of the join and one never will');
  });

  test('and therefore in the run outcome — which at v0.2 was `completed` for both', () => {
    equal(fold([...UP_TO_THE_JOIN, ...LIVE_TOKEN_TAIL]).outcome, 'completed',
      'nothing live, nothing suspended, a path ended at an `end` node, and the join fired');
    equal(fold([...UP_TO_THE_JOIN, ...ARRIVAL_COUNT_TAIL]).outcome, 'stuck',
      'RN-R10: same three clauses, and a join that has not fired and never will');
  });

  test('the stuck run meets every clause `completed` needs EXCEPT the join fact', () => {
    // This is what makes `joined` the load-bearing field rather than one of
    // several signals: everything else section 3 asks of `completed` is already
    // true here, and one input flips the answer.
    const s = fold(UP_TO_THE_JOIN);
    ok(Object.values(s.nodes).every((n) => n.state !== 'running'), 'nothing is live');
    ok(Object.values(s.nodes).every((n) => n.state !== 'suspended'), 'nobody is waiting on a person');
    ok(s.pathEnds.some((e) => e.reason === 'end'), 'a path DID end at an `end` node');
    ok(s.pathEnds.every((e) => e.reason !== 'no-eligible-edge'), 'and none ended with no eligible edge');
    equal(s.stoppedBy, null, 'and no refusal terminated it');
    equal(s.outcome, 'stuck', 'so `joined` is the only thing standing between this and `completed`');
    equal(step(s, joinSettled(true)).outcome, 'completed', 'and adding it flips the answer');
  });

  test('a run with no region cannot be stuck — there is no join to wait on', () => {
    equal(fold([dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), pathEnd('end', 'done')]).outcome,
      'completed', 'every linear flow in the corpus must be unaffected by RN-R10');
  });

  test('an unsatisfiable join is stuck too — `joined: false`, not `null`', () => {
    // Reachable only from a policy returning `unsatisfiable`, and **neither
    // shipped policy ever does** (`spec/join-policy.md` section 4). Asserted as a
    // shape rather than as coverage; named in ADR 0015's Consequences as the
    // empty half.
    const s = fold([...UP_TO_THE_JOIN, joinSettled(false)]);
    equal(s.regions['split']!['-']!.joined, false, 'the driver settled the join and did not route');
    equal(s.outcome, 'stuck', 'a join that can never fire stops the run as surely as one that has not');
  });
});

suite('RN-R10 — the precedence, in the order section 3 states it', (test) => {
  const stuckBase = [...UP_TO_THE_JOIN];

  test('`running` outranks `stuck`: a live node means the run can still move', () => {
    const s = fold([...stuckBase, dispatched('r1:other:-:0')]);
    equal(s.outcome, 'running', 'a dispatched, unsettled node is live and no join verdict is final yet');
  });

  test('`awaiting_action` outranks `stuck`: a suspended branch keeps its join waiting', () => {
    // This is the row that makes `branch.suspended` worth having (ADR 0004).
    // A run parked on a person must never be reported as broken.
    const s = fold([
      dispatched('r1:ingest:-:0'), settled('r1:ingest:-:0', 'done'),
      opened('0'), opened('1'),
      dispatched('r1:scoreA:0:0'), dispatched('r1:scoreB:1:0'),
      settled('r1:scoreA:0:0', 'done'), arrived('0'),
      settled('r1:scoreB:1:0', 'user_action'), suspended('1', 'scoreB'),
    ]);
    equal(s.outcome, 'awaiting_action', 'RN-R7 and RN-R10 together: waiting on a human is not stuck');
    ok(!isTerminal(s), 'RN-R12: and the run is not finished — a resolution can still arrive');
  });

  test('`stopped` outranks `stuck`', () => {
    const s = fold([...stuckBase, { kind: 'stopped', reason: 'DuplicateTaskId' }]);
    equal(s.outcome, 'stopped', 'RN-R8: the sequence after a refusal is incomplete by construction');
  });

  test('`stuck` outranks `failed`', () => {
    // A branch lost with no eligible edge AND a join that never fires. `failed`
    // names a cause the flow asked for; `stuck` says the run will not terminate,
    // which is the thing a reader must not miss.
    const s = fold([...stuckBase, pathEnd('no-eligible-edge', 'scoreC')]);
    equal(s.outcome, 'stuck',
      'RN-R10: above `failed`, because `failed` reads as *the run is over and here is why*');
  });

  test('`stuck` outranks `completed`, which is the whole point', () => {
    equal(fold(stuckBase).outcome, 'stuck', 'a path DID end at an `end` node, and the run is still stuck');
  });
});

suite('RN-R12 — a run is finished exactly when it is neither running nor awaiting_action', (test) => {
  const cases: [string, FoldInput[], boolean][] = [
    ['a run that has dispatched nothing', [], false],
    ['a live node', [dispatched('r1:a:-:0')], false],
    ['a suspended node', [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'user_action')], false],
    ['completed', [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), pathEnd('end', 'done')], true],
    ['failed', [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'failed'), pathEnd('no-eligible-edge', 'a')], true],
    ['stopped', [{ kind: 'stopped', reason: 'x' }], true],
    ['stuck', UP_TO_THE_JOIN, true],
  ];

  test('every outcome answers, and the two live ones are the only `false`', () => {
    equal(cases.map(([name, seq]) => [name, isTerminal(fold(seq))]), cases.map(([n, , t]) => [n, t]),
      'RN-R12 is what an L6 harness resolves on, so a wrong answer here hangs a gate or ends it early');
  });

  test('before `stuck` existed this predicate called a permanent hang a success', () => {
    // The strongest statement about why RN-R10 is load-bearing for RN-R12: the
    // stuck sequence IS terminal, and it is terminal as `stuck` rather than as
    // `completed`. A harness that resolved on the v0.2 vocabulary would have
    // reported this run green.
    const s = fold(UP_TO_THE_JOIN);
    ok(isTerminal(s), 'the harness stops waiting — which is right, nothing more is coming');
    ok(s.outcome !== 'completed', 'and it does not call it a success');
  });
});

suite('RN-R2 — the fold is still total over any prefix, with the new inputs', (test) => {
  test('folding n then applying n+1 equals folding n+1, for every n', () => {
    const seq = [...UP_TO_THE_JOIN, ...LIVE_TOKEN_TAIL];
    for (let n = 0; n < seq.length; n++) {
      const a: RunState = step(fold(seq.slice(0, n)), seq[n]!);
      const b: RunState = fold(seq.slice(0, n + 1));
      equal(a, b, `prefix ${n}: step(fold(prefix), next) must equal fold(prefix + next)`);
    }
  });
});

suite('RN-R10 and RN-R12 — the reachable cases no test reached', (test) => {
  test('a run with TWO INSTANCES of ONE opener is stuck when EITHER join has not fired', () => {
    // **W84, and rule 8's set is what found this missing.** `RN-R10` quantifies over
    // region INSTANCES since ADR 0062, and `allRegionRuns` flattens the two levels for
    // it — but narrowing that flatten to the FIRST instance of each opener cost ZERO,
    // because no fold anywhere had one instance joined and another not. Two instances
    // of ONE opener, which is the only shape that separates the flatten from a walk
    // over openers.
    const inst = (rp: string, joined: boolean | null): FoldInput[] => [
      { kind: 'region', event: { type: 'branch.opened', regionId: 'f', regionPath: rp, branchPath: `${rp}.0` } },
      { kind: 'region', event: { type: 'branch.arrived', regionId: 'f', regionPath: rp, branchPath: `${rp}.0` } },
      ...(joined === null ? []
        : [{ kind: 'joinSettled', regionId: 'f', regionPath: rp, joinId: 'f-j', fired: joined } as FoldInput]),
    ];
    const head: FoldInput[] = [
      dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), pathEnd('end', 'done'),
    ];
    equal(fold([...head, ...inst('0', true), ...inst('1', true)]).outcome, 'completed',
      'both INSTANCES of the one opener joined');
    equal(fold([...head, ...inst('0', true), ...inst('1', null)]).outcome, 'stuck',
      'the SECOND instance never joined — and it is under the SAME opener key as the first, ' +
      'so a walk over openers that stopped at the first entry would report `completed`');
    equal(fold([...head, ...inst('0', null), ...inst('1', true)]).outcome, 'stuck',
      'and it is symmetric: the first not joining is equally stuck');
    // The control: with ONE instance the two walks agree, which is why every other
    // case in this file could not tell them apart.
    equal(fold([...head, ...inst('0', true)]).outcome, 'completed',
      'one instance, joined — the shape on which a walk over openers is RIGHT');
  });

  test('a run with TWO regions is stuck when EITHER join has not fired', () => {
    // `some`, not `every`. The two differ only when a run has more than one
    // region with different `joined` values — one join fired, another did not —
    // and swapping them survived every assertion until now. The shape is legal:
    // `FD-V15` refuses only NESTED fan-out, and `test/matrix/region-shapes.test.ts`
    // runs two sequential fan-outs sharing one `end` ([Q45](../../doc/open-questions.md)).
    const region = (id: string, joined: boolean | null): FoldInput[] => [
      { kind: 'region', event: { type: 'branch.opened', regionId: id, regionPath: '-', branchPath: '0' } },
      { kind: 'region', event: { type: 'branch.arrived', regionId: id, regionPath: '-', branchPath: '0' } },
      ...(joined === null ? []
        : [{ kind: 'joinSettled', regionId: id, regionPath: '-', joinId: `${id}-j`, fired: joined } as FoldInput]),
    ];
    const base: FoldInput[] = [
      dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), pathEnd('end', 'done'),
    ];

    equal(fold([...base, ...region('f1', true), ...region('f2', true)]).outcome, 'completed',
      'both joins fired, so nothing is waiting on anything');
    equal(fold([...base, ...region('f1', true), ...region('f2', null)]).outcome, 'stuck',
      'the SECOND join never fired — `some`, not `every`');
    equal(fold([...base, ...region('f1', null), ...region('f2', true)]).outcome, 'stuck',
      'and it is symmetric: the first not firing is equally stuck');
  });

  test('a fan-out entry opens a region before anything is dispatched, and that is `running`', () => {
    // Reachable, and no corpus flow reaches it: `FD-V3` refuses only a `join` or
    // an `end` as `entry`, so a **`fanout` entry is legal**. The driver emits
    // every `branch.opened` before dispatching any branch (`JP-R5`), so the first
    // `withOutcome` sees no nodes, no path ends, and a region with `joined: null`.
    //
    // Without section 3's nothing-dispatched clause that state is **`stuck`** and
    // `isTerminal` is `true` — an L6 harness would declare such a run finished
    // before it started. Deleting the clause survived every assertion until now,
    // because `fold([])` returns `emptyState()` without ever calling `withOutcome`.
    const s = fold([
      { kind: 'region', event: { type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: '0' } },
      { kind: 'region', event: { type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: '1' } },
    ]);
    equal(s.outcome, 'running', 'a region has opened and its branches are about to be dispatched');
    ok(!isTerminal(s), 'RN-R12: and the run is emphatically not finished');
  });

  test('RN-R12 holds at a QUIESCENT point and not at every prefix — the qualification is load-bearing', () => {
    // `spec/run-state.md` section 3's quiescence note, asserted. The sequence
    // below is the real append order for a `fanout-join` run (ADR 0014 rule 6:
    // a settlement is appended BEFORE the routing it causes), so several of its
    // prefixes are mid-turn and report a terminal outcome for a run that is not
    // over. That is not a defect in the fold — it is why `RN-R12` says
    // *"at a quiescent point"* and why the L6 harness reads on a microtask
    // boundary rather than on every element.
    const seq: FoldInput[] = [
      dispatched('r1:ingest:-:0'), settled('r1:ingest:-:0', 'done'),   // <- mid-turn
      opened('0'), opened('1'),
      dispatched('r1:scoreA:0:0'), dispatched('r1:scoreB:1:0'),
      settled('r1:scoreA:0:0', 'done'), arrived('0'),
      settled('r1:scoreB:1:0', 'done'), arrived('1'),                  // <- mid-turn
      joinSettled(true),
      dispatched('r1:publish:-:0'), settled('r1:publish:-:0', 'done'), pathEnd('end', 'done'),
    ];
    const terminalAt = seq
      .map((_x, n) => (isTerminal(fold(seq.slice(0, n + 1))) ? n : -1))
      .filter((n) => n >= 0);

    ok(terminalAt.length > 1,
      'more than one prefix reports terminal, and only the last of them is a resting state');
    equal(terminalAt[terminalAt.length - 1], seq.length - 1,
      'the FINAL prefix is terminal — the quiescent reading is the honest one');
    equal(fold(seq).outcome, 'completed', 'and it is `completed`, which is what the run did');
    ok(terminalAt.includes(1),
      'the very first settlement already reads terminal: nothing running, and no path end yet');
  });
});
