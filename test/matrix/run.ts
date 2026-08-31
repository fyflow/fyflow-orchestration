/**
 * How one matrix cell is produced: one flow, one scripted sequence of scheduler
 * settlements and human resolutions, one join policy — in, and a `Cell` out.
 *
 * **Nothing here decides anything.** The cell records what the policy said and
 * what the driver did; every expected value is written by hand in
 * `matrix.test.ts` from `spec/join-policy.md` sections 2-4. A cell computed and
 * then asserted against itself is a snapshot, and `doc/workflow.md` section 5
 * says a snapshot is not a test.
 *
 * The fake scheduler is W4's own rather than shared with `test/driver/`. It is
 * short, and the alternative is a helper two work items own — which is the shape
 * `doc/workflow.md` section 1 rule 2 asks items to avoid. It models two facts
 * about `fyflow-scheduler` 0.3.0, and **both are refusals rather than
 * decoration** — W4's first version stated them in this comment and enforced
 * neither, which both review passes found:
 *
 *   1. **Only an `optional` task can settle `failed`.** Both `state = 'failed'`
 *      assignments live inside `if (task.optional)`
 *      (`../fyflow-scheduler/core/FyflowScheduler.ts:894-897`); a non-optional
 *      task out of retries goes to `user_action` instead. A fake that emits
 *      `failed` for a non-optional node produces an event stream the real
 *      scheduler cannot, and the `lost-settled` row then proves nothing about the
 *      road it names. **It throws** rather than warning: a scenario that scripts
 *      an impossible settlement is a broken fixture, not a cell.
 *   2. **The `user_action` pairing.** A non-optional task out of retries
 *      dispatches `task.failed` AND `task.user_action` with the same object; an
 *      `optional` one dispatches only `task.failed` (`CLAUDE.md`; ADR 0007 rule
 *      2). The driver keys on terminal state, not event name.
 */
import { Driver } from '../../src/driver/driver.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { JoinPolicy, JsonValue } from '../../src/driver/policy.ts';
import type { Predicate } from '../../src/driver/routing.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { registry } from './flows.ts';

export type Step =
  | { do: 'settle'; taskId: string; state: 'done' | 'failed' | 'user_action'; result?: unknown }
  | { do: 'resolve'; taskId: string; resolvedAs: 'done' | 'failed' };

export interface Scenario {
  /** Stable key, used as the matrix row id and in every assertion message. */
  key: string;
  /** One line, for the rendered table. */
  title: string;
  flow: FlowDefinition;
  /** The fanout whose join this row is about. */
  fanoutId: string;
  /** The task id the join routes to when it fires. Dispatch of this IS "the join fired". */
  downstream: string;
  predicates?: Record<string, Predicate>;
  steps: Step[];
}

/**
 * What a run looks like once nothing more will happen without an outside event.
 *
 * `stuck` is [Q7](../../doc/open-questions.md)'s detection half and it needs no
 * clock: every dispatched task has an outcome, no branch is parked on a person,
 * and the join has not fired — so nothing in the system can change, and a timeout
 * would only put a wall-clock guess on top of a decidable answer.
 */
export type Verdict = 'joined' | 'waiting-on-human' | 'in-flight' | 'stuck';

export interface Cell {
  policyId: string;
  /**
   * The region event stream, as `type(regionId:branchPath)` — the policy's whole
   * input.
   *
   * **The region id is in the string because a flow may have more than one.**
   * `end` nodes are exempt from `FD-V13`/`FD-V19`/`FD-V22`, so two sequential
   * fan-outs may share one, and a driver that attributed a terminal event to the
   * region *containing* the node rather than the one the branch was *opened in*
   * would send it to the wrong join. Without the id in the stream that is
   * invisible: `exited(1)` reads the same either way.
   */
  events: string[];
  status: string;
  describe: JsonValue;
  joinFired: boolean;
  /**
   * What every dispatched task was dispatched WITH, keyed by task id.
   *
   * Two claims read this one map, and that is deliberate. `spec/join-policy.md`
   * section 4: **a satisfied join carries `null`**, because which terminal event
   * satisfied it is decided by fan-out completion order — so a join forwarding
   * "whichever branch finished last" would make a run's DATA order-dependent.
   * And `spec/outcome-record.md` section 4: an ordinary edge **does** carry the
   * previous node's result forward. Asserting only the first let a harness that
   * hard-coded `null` pass; asserting both from the same map does not.
   */
  payloads: Record<string, unknown>;
  /** Reported by the driver when a policy says a join can never fire. */
  unsatisfiable: { fanoutId: string; policyId: string }[];
  verdict: Verdict;
}

class Fake {
  added: { id: string; payload?: unknown; optional?: boolean }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();

  addTask(t: unknown) {
    this.added.push(t as { id: string; payload?: unknown; optional?: boolean });
  }

  addEventListener(type: string, fn: (e: { detail: unknown }) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }

  settle(id: string, state: string, result: unknown) {
    // Fact 1 above. The scheduler cannot produce this, so neither may the fake —
    // and it is checked against what the DRIVER dispatched rather than against the
    // definition, so a driver that dropped `optional` on the way out is caught
    // here too.
    if (state === 'failed') {
      const task = this.added.find((t) => t.id === id);
      if (!task) throw new Error(`matrix fixture: settled "${id}", which was never dispatched`);
      if (task.optional !== true) {
        throw new Error(
          `matrix fixture: "${id}" settled \`failed\` but was dispatched with ` +
            `optional=${String(task.optional)}. Only an \`optional\` task can settle failed ` +
            '(FyflowScheduler.ts:894-897); a non-optional one reaches `user_action`. ' +
            'This event stream cannot occur.',
        );
      }
    }
    const detail = { id, state, result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    if (state === 'done') return this.fire('task.completed', detail);
    // Both other states fire `task.failed` first. Only a non-optional task out of
    // retries also fires `task.user_action`, and the driver keys on the terminal
    // state rather than on the event name — ADR 0007 rule 2.
    this.fire('task.failed', detail);
    if (state === 'user_action') this.fire('task.user_action', detail);
  }

  private fire(type: string, detail: unknown) {
    for (const fn of this.listeners.get(type) ?? []) fn({ detail });
  }
}

export const RUN = 'r1';

export function runCell(scenario: Scenario, policy: JoinPolicy): Cell {
  const scheduler = new Fake();
  const events: RegionEvent[] = [];
  const unsatisfiable: { fanoutId: string; policyId: string }[] = [];
  const driver = new Driver(scenario.flow, {
    runId: RUN,
    scheduler,
    createTask: (c) => c,
    predicates: new Map(Object.entries(scenario.predicates ?? {})),
    workerTypes: registry.workerTypes,
    now: () => 1,
    joinPolicy: policy,
    onRegionEvent: (e) => events.push(e),
    onUnsatisfiableJoin: (i) => unsatisfiable.push({ fanoutId: i.fanoutId, policyId: i.policyId }),
  });

  driver.start({});
  for (const step of scenario.steps) {
    if (step.do === 'settle') {
      scheduler.settle(step.taskId, step.state, step.result ?? null);
    } else {
      // `RS-R1` refuses a resolution whose task is not suspended, and returns
      // `false` rather than throwing. Discarding it made a mis-scripted step a
      // silent no-op, which is a fixture that quietly stops testing.
      const accepted = driver.resolve(step.taskId, step.resolvedAs, { result: null, error: 'matrix', actor: 'ops' });
      if (!accepted) throw new Error(`matrix fixture: resolve("${step.taskId}") was REFUSED — not suspended`);
    }
  }

  const reported = driver.joinStatusOf(scenario.fanoutId);
  const joinFired = scheduler.added.some((t) => t.id === scenario.downstream);

  return {
    policyId: policy.id,
    events: events.map((e) => `${e.type.replace('branch.', '')}(${e.regionId}:${e.branchPath})`),
    // `JP-R3` — status is total. There is no fourth answer and no blank cell, so
    // a missing report is itself a finding rather than something to paper over.
    status: reported?.status ?? '<no report>',
    describe: (reported?.describe ?? null) as JsonValue,
    joinFired,
    payloads: Object.fromEntries(scheduler.added.map((t) => [t.id, t.payload])),
    unsatisfiable,
    verdict: verdictOf(driver, joinFired),
  };
}

/** Computed from the driver's PUBLIC surface only — see the item's Out list. */
function verdictOf(driver: Driver, joinFired: boolean): Verdict {
  if (joinFired) return 'joined';
  const dispatched = driver.dispatchedIds();
  // A suspended task has an outcome record and no effective outcome (ADR 0004
  // rule 3), which is exactly what distinguishes "waiting on a person" from
  // "waiting on nothing" — the mistake `branch.suspended` exists to prevent.
  const suspended = dispatched.filter((id) => driver.terminalStateOf(id) === null &&
    driver.snapshot().some((r) => r.taskId === id));
  if (suspended.length > 0) return 'waiting-on-human';
  const inFlight = dispatched.filter((id) => !driver.snapshot().some((r) => r.taskId === id));
  if (inFlight.length > 0) return 'in-flight';
  return 'stuck';
}

/** The rendered table — a by-product of the same values the assertions use. */
export function renderTable(rows: { scenario: Scenario; cells: Cell[] }[], policyIds: string[]): string {
  const head = `| row | ${policyIds.join(' | ')} |`;
  const rule = `|---|${policyIds.map(() => '---').join('|')}|`;
  const body = rows.map(({ scenario, cells }) => {
    const cs = policyIds.map((id) => {
      const c = cells.find((x) => x.policyId === id)!;
      return `\`${c.status}\` / **${c.verdict}** <br> ${JSON.stringify(c.describe)}`;
    });
    return `| **${scenario.key}** <br> ${scenario.title} <br> \`${cells[0]!.events.join(' ')}\` | ${cs.join(' | ')} |`;
  });
  return [head, rule, ...body].join('\n');
}
