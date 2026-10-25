/**
 * **L5 — an ASK in a fan-out, against every shipped join policy** — `spec/join-policy.md` sections 2-4 (v0.23),
 * `spec/run-state.md` `RN-R37`, [ADR 0109](../../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md),
 * [W180](../../doc/work-items/w180-asking-and-answering-in-a-run.md); P35's W180 row: *an ask in a fan-out holds its join*.
 *
 * The rows are the corpus's `ask-in-a-fanout` (branch 0 the ask `review`, branch 1 the task `score`) and its variant with
 * NO decline edge, driven by `run.ts`'s own `runCell` — the matrix's harness, unchanged but for `verdictOf` learning that
 * a parked ask is a person being waited on. **Every cell is written by hand from section 3's definitions**:
 *
 * - **unanswered** — `opened(0) opened(1) suspended(0) arrived(1)`: `arrival-count` has 1 of N=2; `live-token`'s count is
 *   1 (`suspended` decrements nothing); `live-token-requiring-arrival` likewise — all three `waiting`, and the run
 *   `waiting-on-human`, never `stuck`.
 * - **answered `done`** — `+ resumed(0) arrived(0)`: 2 of 2, count 0 having been positive, an arrival seen — all three
 *   `satisfied`, the join fired, carrying branch 0's ANSWER and branch 1's result (`JP-R12`).
 * - **declined, to an `end`** — `+ resumed(0) exited(0)`: `arrival-count` 1 of 2 for ever (it ignores `exited`) — waiting,
 *   the run `stuck`; `live-token` count 0 — satisfied; `live-token-requiring-arrival` count 0 with an arrival — satisfied.
 * - **declined, NO failed edge** — `+ resumed(0) lost(0)`: the same three verdicts, by `lost` rather than `exited`.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold } from '../../src/fold/run-state.ts';
import { POLICIES } from '../../src/fold/policies.ts';
import { driveScenario, runCell, type Scenario } from './run.ts';

const SUITE = 'L5 — an ASK in a fan-out holds its join, under every shipped policy';

const FLOW = JSON.parse(await readText(`${ROOT}spec/examples/valid/ask-in-a-fanout.flow.json`)) as FlowDefinition;
/** The same flow with the ask's decline edge — and the `end` only it reached (`FD-V11`) — removed: a decline then ends the path inside the region — `branch.lost`. */
const NO_DECLINE = {
  ...FLOW, flowId: 'ask-in-a-fanout-no-decline',
  nodes: FLOW.nodes.filter((n) => n.id !== 'dropped').map((n) => (n.id === 'review' ? { ...n, edges: [{ to: 'collect' }] } : n)),
} as unknown as FlowDefinition;

const PRE = [
  { do: 'settle' as const, taskId: 'r1:ingest:-:0', state: 'done' as const, result: { from: 'ingest' } },
  { do: 'settle' as const, taskId: 'r1:score:1:0', state: 'done' as const, result: { s: 0.9 } },
];
const ROWS: Scenario[] = [
  { key: 'ask-unanswered', title: 'the ask waits; its sibling arrives', flow: FLOW, fanoutId: 'split', downstream: 'r1:publish:-:0', steps: PRE },
  { key: 'ask-answered', title: 'the person answers `done`', flow: FLOW, fanoutId: 'split', downstream: 'r1:publish:-:0',
    steps: [...PRE, { do: 'resolve', taskId: 'r1:review:0:0', resolvedAs: 'done', result: { ok: true } }] },
  { key: 'ask-declined-exits', title: 'the person declines; the decline edge leaves for an `end`', flow: FLOW, fanoutId: 'split', downstream: 'r1:publish:-:0',
    steps: [...PRE, { do: 'resolve', taskId: 'r1:review:0:0', resolvedAs: 'failed' }] },
  { key: 'ask-declined-lost', title: 'the person declines; no edge opts into `failed`', flow: NO_DECLINE, fanoutId: 'split', downstream: 'r1:publish:-:0',
    steps: [...PRE, { do: 'resolve', taskId: 'r1:review:0:0', resolvedAs: 'failed' }] },
];

const BASE = ['opened(split:0)', 'opened(split:1)', 'suspended(split:0)', 'arrived(split:1)'];
/** row -> policy -> [status, verdict, the events past BASE, what the downstream task received (undefined: not dispatched)]. */
const EXPECTED: Record<string, Record<string, [string, string, string[], unknown]>> = {
  'ask-unanswered': {
    'arrival-count': ['waiting', 'waiting-on-human', [], undefined],
    'live-token': ['waiting', 'waiting-on-human', [], undefined],
    'live-token-requiring-arrival': ['waiting', 'waiting-on-human', [], undefined],
  },
  'ask-answered': {
    'arrival-count': ['satisfied', 'joined', ['resumed(split:0)', 'arrived(split:0)'], { review: { ok: true }, score: { s: 0.9 } }],
    'live-token': ['satisfied', 'joined', ['resumed(split:0)', 'arrived(split:0)'], { review: { ok: true }, score: { s: 0.9 } }],
    'live-token-requiring-arrival': ['satisfied', 'joined', ['resumed(split:0)', 'arrived(split:0)'], { review: { ok: true }, score: { s: 0.9 } }],
  },
  'ask-declined-exits': {
    'arrival-count': ['waiting', 'stuck', ['resumed(split:0)', 'exited(split:0)'], undefined],
    'live-token': ['satisfied', 'joined', ['resumed(split:0)', 'exited(split:0)'], { score: { s: 0.9 } }],
    'live-token-requiring-arrival': ['satisfied', 'joined', ['resumed(split:0)', 'exited(split:0)'], { score: { s: 0.9 } }],
  },
  'ask-declined-lost': {
    'arrival-count': ['waiting', 'stuck', ['resumed(split:0)', 'lost(split:0)'], undefined],
    'live-token': ['satisfied', 'joined', ['resumed(split:0)', 'lost(split:0)'], { score: { s: 0.9 } }],
    'live-token-requiring-arrival': ['satisfied', 'joined', ['resumed(split:0)', 'lost(split:0)'], { score: { s: 0.9 } }],
  },
};

const DECLARED_CASES = [
  'every cell, by hand: an unanswered ask holds the join under every policy, and an answer moves it as a branch`s settlement would',
  'the run`s own outcome agrees with each cell, and folds the same way twice (L3)',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const policyIds = Object.keys(POLICIES).sort();
    equal(policyIds, ['arrival-count', 'live-token', 'live-token-requiring-arrival'], 'the three shipped policies — every column');
    const visited: string[] = [];
    for (const row of ROWS) {
      for (const id of policyIds) {
        const c = runCell(row, POLICIES[id as keyof typeof POLICIES] as unknown as JoinPolicy);
        const [status, verdict, tail, received] = EXPECTED[row.key]![id]!;
        const at = `${row.key} × ${id}`;
        equal(c.events, [...BASE, ...tail], `${at}: the region events`);
        equal(c.status, status, `${at}: the policy's status`);
        equal(c.verdict, verdict, `${at}: the verdict`);
        equal(c.joinFired, received !== undefined, `${at}: whether the join fired`);
        equal(c.payloads['r1:publish:-:0'], received, `${at}: what the join carried downstream`);
        ok(!Object.keys(c.payloads).includes('r1:review:0:0'), `${at}: the ask was never handed to the scheduler`);
        visited.push(at);
      }
    }
    equal(visited.length, ROWS.length * policyIds.length, 'every row × every policy was asserted');
  });

  test(DECLARED_CASES[1]!, () => {
    const outcomes = ROWS.map((row) => {
      const { driver } = driveScenario(row, POLICIES['live-token'] as unknown as JoinPolicy);
      const seq = driver.foldInputs();
      equal(fold(seq), fold(seq), `${row.key}: folded twice, deep-equal`);
      return fold(seq).outcome;
    });
    // Unanswered: waiting on the person. Answered or declined under live-token: the join fired and `publish` is in flight.
    equal(outcomes, ['awaiting_action', 'running', 'running', 'running'], 'the fold`s outcome per row, live-token');
    const { driver } = driveScenario(ROWS[2]!, POLICIES['arrival-count'] as unknown as JoinPolicy);
    equal(fold(driver.foldInputs()).outcome, 'stuck', 'and a declined ask under arrival-count leaves the join that can never fire: `stuck` (RN-R10)');
  });

  test(DECLARED_CASES[2]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    equal(ran, [...DECLARED_CASES].sort(), 'the cases that ran ARE the declared ones, both ways');
    equal(ran.length, DECLARED_CASES.length, 'and the count');
  });
});
