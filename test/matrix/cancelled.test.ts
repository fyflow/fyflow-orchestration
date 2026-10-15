/**
 * **Ladder L5 — the `cancelled` rows, under EVERY column of the matrix**: `spec/join-policy.md` section 2's
 * `cancelled` row, `spec/run-state.md` `RN-R28`,
 * [ADR 0094](../../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md),
 * [W158](../../doc/work-items/w158-cancelled-is-a-library-state-and-a-run-outcome.md), P33 decision 3: *a join
 * waiting on a cancelled branch is not `stuck` — the run is already terminal.*
 *
 * **Every cell was written by hand before it was run**, from the same two sources `matrix.test.ts` names:
 *
 *   - **the stream** — a cancel emits NO region event (the driver halts the run and routes nothing further,
 *     `RN-R28`), and neither does any settlement after it; so the stream is the branches opened and whatever
 *     terminal or suspending event came BEFORE the cancel, and nothing else.
 *   - **each column's answer** to that stream, by `spec/join-policy.md` section 3: `arrival-count` N counted
 *     from `branch.opened`, satisfied on N arrivals; `live-token` +1 per opened, -1 per arrived/exited/lost;
 *     the `JP-R7` variant decrements N on `branch.exited` only; the `JP-R8` variant is `live-token` counting
 *     arrivals. No cancel row reaches zero live tokens or N arrivals, so **every column says `waiting`** —
 *     and the VERDICT is `cancelled`, never `stuck` and never `waiting-on-human`.
 */
import { equal, ok, suite } from '../harness.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { JsonValue } from '../../src/driver/policy.ts';
import { driveScenario, runCell, type Verdict } from './run.ts';
import { CANCELLED_SCENARIOS, SCENARIOS } from './scenarios.ts';
import { MATRIX_COLUMNS, MATRIX_POLICY_IDS } from './variants.ts';

interface Answer { status: string; describe: JsonValue; verdict: Verdict }
const waiting = (describe: JsonValue): Answer => ({ status: 'waiting', describe, verdict: 'cancelled' });
const ac = (need: number, arrived: string[]) => ({ need, arrived });
const lt = (live: number, positive = true) => ({ live, positive });
const ltA = (live: number, arrived: number, positive = true) => ({ live, positive, arrived });

/** Per row: the stream, each column's answer by policy id, and the verdict any other reading would give. */
const EXPECTED: Record<string, { events: string[]; cells: Record<string, Answer>; wouldBe: Verdict }> = {
  // Nothing arrived; `scoreB`'s later `done` is appended and routed nowhere, so no `arrived(split:1)`.
  'cancelled-in-flight': {
    events: ['opened(split:0)', 'opened(split:1)'],
    cells: {
      'arrival-count': waiting(ac(2, [])),
      'live-token': waiting(lt(2)),
      'arrival-count-decrementing': waiting(ac(2, [])),
      'live-token-requiring-arrival': waiting(ltA(2, 0)),
    },
    wouldBe: 'stuck',
  },
  // Branch 0 arrived BEFORE the cancel, so its event is in the stream.
  'cancelled-after-arrival': {
    events: ['opened(split:0)', 'opened(split:1)', 'arrived(split:0)'],
    cells: {
      'arrival-count': waiting(ac(2, ['0'])),
      'live-token': waiting(lt(1)),
      'arrival-count-decrementing': waiting(ac(2, ['0'])),
      'live-token-requiring-arrival': waiting(ltA(1, 1)),
    },
    wouldBe: 'stuck',
  },
  // Branch 0 parked BEFORE the cancel: `suspended` moves no counter in any column.
  'cancelled-beside-suspended': {
    events: ['opened(split:0)', 'opened(split:1)', 'suspended(split:0)'],
    cells: {
      'arrival-count': waiting(ac(2, [])),
      'live-token': waiting(lt(2)),
      'arrival-count-decrementing': waiting(ac(2, [])),
      'live-token-requiring-arrival': waiting(ltA(2, 0)),
    },
    wouldBe: 'waiting-on-human',
  },
};

suite('L5 — a cancelled branch under every policy: the join waits, the run is `cancelled`, nothing is `stuck`', (test) => {
  test('the rows are the three declared, and every column of the matrix is run', () => {
    equal(CANCELLED_SCENARIOS.map((s) => s.key).sort(), Object.keys(EXPECTED).sort(), 'every cancelled row has an expectation, and every expectation a row');
    equal(MATRIX_COLUMNS.map((p) => p.id), [...MATRIX_POLICY_IDS], 'the columns are the matrix`s own four — the two shipped and Q24`s two variants');
    equal(CANCELLED_SCENARIOS.filter((s) => SCENARIOS.includes(s)), [], 'and none is one of Q5`s nine, which ADR 0003 counts');
  });

  for (const scenario of CANCELLED_SCENARIOS) {
    const want = EXPECTED[scenario.key]!;
    for (const policy of MATRIX_COLUMNS) {
      test(`${scenario.key} / ${policy.id}`, () => {
        const cell = runCell(scenario, policy);
        equal(cell.events, want.events, 'the stream: what came before the cancel, and nothing after it');
        equal({ status: cell.status, describe: cell.describe, verdict: cell.verdict }, want.cells[policy.id],
          `${policy.id}: \`waiting\` with the describe section 3 derives from that stream, and the verdict \`cancelled\``);
        equal([cell.joinFired, cell.unsatisfiable], [false, []], 'the join did not fire and nothing was reported unsatisfiable');
        equal(Object.keys(cell.payloads), ['r1:ingest:-:0', 'r1:scoreA:0:0', 'r1:scoreB:1:0'], 'nothing was dispatched after the fan-out');

        const { driver } = driveScenario(scenario, policy);
        const s = fold(driver.foldInputs());
        equal(s.outcome, 'cancelled', `the fold says \`cancelled\` — not \`${want.wouldBe}\`, which is what this row would read without RN-R28`);
        equal(s.regions.split?.['-']?.joined, null, 'and the join it left waiting is `null`: the condition `stuck` reads, outranked');
        ok(Object.values(s.nodes).every((n) => n.state !== 'running'), 'with nothing live — every dispatched task has settled, so only RN-R28 keeps this from `stuck`');
      });
    }
  }

  test('the parked task in `cancelled-beside-suspended` cannot be resolved, under any column', () => {
    const row = CANCELLED_SCENARIOS.find((s) => s.key === 'cancelled-beside-suspended')!;
    for (const policy of MATRIX_COLUMNS) {
      const { driver } = driveScenario(row, policy);
      equal(driver.resolve('r1:scoreA:0:0', 'done', { result: null, actor: 'ops' }), false, `${policy.id}: resolve() is refused after the cancel`);
    }
  });
});
