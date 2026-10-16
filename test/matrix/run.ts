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
 *      (`core/FyflowScheduler.ts:894-897` at 0.3.0); a non-optional
 *      task out of retries goes to `user_action` instead. A fake that emits
 *      `failed` for a non-optional node produces an event stream the real
 *      scheduler cannot, and the `lost-settled` row then proves nothing about the
 *      road it names. **It throws** rather than warning: a scenario that scripts
 *      an impossible settlement is a broken fixture, not a cell.
 *   2. **The `user_action` pairing.** A non-optional task out of retries
 *      dispatches `task.failed` AND `task.user_action` with the same object; an
 *      `optional` one dispatches only `task.failed` (`CLAUDE.md`; ADR 0007 rule
 *      2). The driver keys on terminal state, not event name.
 *
 * **Line citations into the scheduler are into its REPOSITORY, not into
 * `node_modules`.** Since [ADR 0029](../../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
 * the npm package ships `dist/` and `AGENTS.md` and no TypeScript source, so
 * the file below is read at **github.com/fyflow/fyflow-scheduler** and the line
 * numbers are the ones measured at 0.3.0.
 */
import { Driver } from '../../src/driver/driver.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { JoinPolicy, JsonValue, UnsatisfiableJoin } from '../../src/driver/policy.ts';
import type { Predicate } from '../../src/driver/routing.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { registry } from './flows.ts';

export type Step =
  /** `cancelled` since W158 (ADR 0094): the scheduler fires `task.cancelled` alone for it. */
  | { do: 'settle'; taskId: string; state: 'done' | 'failed' | 'user_action' | 'cancelled'; result?: unknown }
  /**
   * `result` is the RESOLUTION's, and it is what a resumed branch carries into a
   * join — `spec/outcome-record.md` section 7: an effective outcome's `result`
   * comes from the resolution when there is one. It defaults to `null`, which is
   * what every row used before `JP-R12` gave a resumed branch's value somewhere to
   * be seen, and two rows keep the default so *present with `null`* stays
   * distinguishable from *absent*.
   */
  | { do: 'resolve'; taskId: string; resolvedAs: 'done' | 'failed'; result?: unknown }
  /**
   * **The run's OWNER cancels it** — W173, `RN-R31`: `driver.cancel({ actor })`. The fake's `cancel` RECORDS each id and
   * fires nothing (the RUNNING road, P34 fact 8), so each task's `task.cancelled` is a later `settle` step of the row's
   * own — which is what lets a row put a prefix BETWEEN the request and the last task stopping.
   */
  | { do: 'cancel'; actor: string };

export interface Scenario {
  /** Stable key, used as the matrix row id and in every assertion message. */
  key: string;
  /** One line, for the rendered table. */
  title: string;
  flow: FlowDefinition;
  /** The fanout whose join this row is about. */
  fanoutId: string;
  /**
   * **Every fanout in the flow, outermost first — W22.** Defaults to
   * `[fanoutId]`, which is what all nine depth-1 rows are.
   *
   * A **nested** row has two joins and `Cell.status`/`describe` report only
   * `fanoutId`'s. Measured before this field existed: `runCell` runs a depth-2
   * scenario unchanged and produces a perfectly good cell **about the outer join
   * only**, while the thing the row exists to show — what the inner join did, and
   * what its verdict did to the outer branch — is reachable only by calling
   * `driveScenario` and `joinStatusOf` by hand. **A depth-2 row asserted through a
   * `Cell` alone asserts the outer join and calls it the row.**
   */
  regions?: string[];
  /** The task id the join routes to when it fires. Dispatch of this IS "the join fired". */
  downstream: string;
  predicates?: Record<string, Predicate>;
  steps: Step[];
}

/**
 * What a run looks like once nothing more will happen without an outside event.
 *
 * `stuck` is [Q7](../../doc/questions/q7.md)'s detection half and it needs no
 * clock: every dispatched task has an outcome, no branch is parked on a person,
 * and the join has not fired — so nothing in the system can change, and a timeout
 * would only put a wall-clock guess on top of a decidable answer.
 *
 * **`cancelled` is W158's** (ADR 0094, `RN-R28`): a task of the run settled `cancelled`, so the driver halted
 * it and the join will never fire — which is the owner's cancel, and NOT `stuck`, and not `waiting-on-human`
 * even with a branch parked. Without it the three `CANCELLED_SCENARIOS` read `stuck`, `stuck` and
 * `waiting-on-human`: each a false statement about a run that is over.
 */
export type Verdict = 'joined' | 'waiting-on-human' | 'in-flight' | 'stuck' | 'cancelled';

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
   * section 4's **`JP-R12`**: a satisfied join carries **the arrived branches'
   * results keyed by `branchPath`** — all of them, which is how it satisfies the
   * constraint that made the old answer `null`, since *which* terminal event
   * satisfied the join is decided by fan-out completion order and a collection
   * keyed by branch does not depend on it. And `spec/flow-definition.md` section 3:
   * an ordinary edge **does** carry the previous node's result forward, unchanged.
   * Asserting only the first let a harness that hard-coded `null` pass; asserting
   * both from the same map does not.
   *
   * *(This said **"a satisfied join carries `null`"**, quoting the sentence
   * [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
   * replaced. W34's conformity reader — one of seven copies of that claim the item
   * left standing in files it had edited.)*
   */
  payloads: Record<string, unknown>;
  /** Reported by the driver when a policy says a join can never fire. */
  unsatisfiable: { fanoutId: string; policyId: string }[];
  verdict: Verdict;
  /**
   * **Every region's own answer, keyed by `fanoutId` — W22.** `status` and
   * `describe` above stay the row's declared `fanoutId`'s, so all nine depth-1
   * rows and every assertion over them are unchanged; this is additive.
   *
   * It is a `Record` rather than a second pair of fields because a depth-3 row
   * has three, and a row that had to name which of its joins it was "really"
   * about would be making the choice this field exists to remove.
   */
  regions: Record<string, { status: string; describe: JsonValue }>;
}

export class Fake {
  added: { id: string; payload?: unknown; optional?: boolean }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();

  addTask(t: unknown) {
    this.added.push(t as { id: string; payload?: unknown; optional?: boolean });
  }

  addEventListener(type: string, fn: (e: { detail: unknown }) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }

  /** W173 — every id `driver.cancel` sent, in order. The RUNNING road: nothing fires until a `settle` step says so. */
  cancelled: string[] = [];
  cancel(id: string): Promise<boolean> {
    this.cancelled.push(id);
    return Promise.resolve(true);
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
            '(FyflowScheduler.ts:1151-1154 at the pin, re-taken by W158); a non-optional one reaches `user_action`. ' +
            'This event stream cannot occur.',
        );
      }
    }
    const detail = { id, state, result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    if (state === 'done') return this.fire('task.completed', detail);
    // A cancel fires `task.cancelled` ALONE — no `task.failed` before it (the scheduler's reference, section 6).
    if (state === 'cancelled') return this.fire('task.cancelled', detail);
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

/**
 * One scenario driven to quiescence, **before anything is reduced to a `Cell`**.
 *
 * `runCell` throws all of this away except what a matrix cell needs, and W15's
 * chain assertion needs the rest: the `Driver` itself (for `foldInputs()`, which
 * no matrix cell reads), and the **full** `UnsatisfiableJoin` reports including
 * `describe`, which `Cell.unsatisfiable` deliberately narrows away.
 *
 * **`Cell` is not widened to carry them**, and that is the point of splitting
 * rather than extending. A `Cell` is what `verdictOf` can see — the driver's
 * public surface — and W15's own item warns that conflating that with the fold's
 * `RunState.outcome` is the easiest wrong move available here. Two shapes keep
 * the two sources of truth apart by construction.
 */
export interface Driven {
  driver: Driver;
  scheduler: Fake;
  events: RegionEvent[];
  /** Every `onUnsatisfiableJoin` call, in order, unnarrowed. */
  unsatisfiable: UnsatisfiableJoin[];
}

export function driveScenario(scenario: Scenario, policy: JoinPolicy): Driven {
  const scheduler = new Fake();
  const events: RegionEvent[] = [];
  const unsatisfiable: UnsatisfiableJoin[] = [];
  const driver = new Driver(scenario.flow, {
    runId: RUN,
    scheduler,
    createTask: (c) => c,
    predicates: new Map(Object.entries(scenario.predicates ?? {})),
    workers: registry.workers, nodeTypes: registry.nodeTypes, pools: registry.pools,
    now: () => 1,
    joinPolicy: policy,
    onRegionEvent: (e) => events.push(e),
    onUnsatisfiableJoin: (i) => unsatisfiable.push(i),
  });

  driver.start({});
  for (const step of scenario.steps) {
    if (step.do === 'settle') {
      scheduler.settle(step.taskId, step.state, step.result ?? null);
    } else if (step.do === 'cancel') {
      void driver.cancel({ actor: step.actor });
    } else {
      // `RS-R1` refuses a resolution whose task is not suspended, and returns
      // `false` rather than throwing. Discarding it made a mis-scripted step a
      // silent no-op, which is a fixture that quietly stops testing.
      const accepted = driver.resolve(step.taskId, step.resolvedAs, { result: step.result ?? null, error: 'matrix', actor: 'ops' });
      if (!accepted) throw new Error(`matrix fixture: resolve("${step.taskId}") was REFUSED — not suspended`);
    }
  }
  return { driver, scheduler, events, unsatisfiable };
}

export function runCell(scenario: Scenario, policy: JoinPolicy): Cell {
  const { driver, scheduler, events, unsatisfiable } = driveScenario(scenario, policy);
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
    // What each task RECEIVED — the envelope's `input`, since every task node is typed (v0.19, ADR 0054).
    payloads: Object.fromEntries(scheduler.added.map((t) => [t.id, (t.payload as { input?: unknown } | undefined)?.input])),
    // Narrowed on purpose: a cell reports THAT a join was declared unsatisfiable
    // and by whom. The `describe` the driver carried out is W15's chain
    // assertion's business and it reads `driveScenario` for it.
    unsatisfiable: unsatisfiable.map((i) => ({ fanoutId: i.fanoutId, policyId: i.policyId })),
    verdict: verdictOf(driver, joinFired),
    // **Read from the same accessor `status` above is read from**, one call per
    // declared region. A second source here — the event stream, say — would let
    // this field and `status` disagree about the row's own fanout, which is the
    // provenance hazard `doc/workflow.md` rule 8's third obligation names.
    regions: Object.fromEntries((scenario.regions ?? [scenario.fanoutId]).map((f) => {
      const r = driver.joinStatusOf(f);
      // `JP-R3` — status is total, so a missing report is a finding rather than
      // something to paper over. Same treatment as `status` above.
      return [f, { status: r?.status ?? '<no report>', describe: (r?.describe ?? null) as JsonValue }];
    })),
  };
}

/** Computed from the driver's PUBLIC surface only — see the item's Out list. */
function verdictOf(driver: Driver, joinFired: boolean): Verdict {
  if (joinFired) return 'joined';
  const dispatched = driver.dispatchedIds();
  // `RN-R28` — a cancelled task halts the run, so it is read BEFORE the three below, each of which would
  // otherwise describe a halted run as one still able to move (or as a defect). Public surface only: the
  // effective outcome of a settled task, which for a cancel is its settlement.
  if (dispatched.some((id) => driver.terminalStateOf(id) === 'cancelled')) return 'cancelled';
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
    const cellOf = (id: string) => cells.find((x) => x.policyId === id)!;
    const regionIds = scenario.regions ?? [scenario.fanoutId];

    // **The shared prefix, computed rather than assumed — W22.** At depth 1 every
    // column sees the same stream and this is the whole of it, so the row below is
    // byte-identical to what it printed before. At depth 2 it is not: an inner
    // join's FIRING enters the outer join, so the tail depends on what the inner
    // region's policy concluded, and printing column 0's stream for the row would
    // show `arrival-count`'s — the one column whose inner join never fires.
    const streams = policyIds.map((id) => cellOf(id).events);
    let n = 0;
    while (streams.every((s) => s.length > n && s[n] === streams[0]![n])) n++;

    const cs = policyIds.map((id) => {
      const c = cellOf(id);
      // One region: unchanged since W15. Several: the verdict, then every region's
      // own answer, then what this column alone appended. **Both arms are printed
      // by `render.ts` and asserted by `matrix.test.ts`** — an arm the suite does
      // not execute is the defect this function was moved out of `render.ts` over.
      if (regionIds.length === 1) return `\`${c.status}\` / **${c.verdict}** <br> ${JSON.stringify(c.describe)}`;
      const per = regionIds.map((f) => `${f} \`${c.regions[f]!.status}\` ${JSON.stringify(c.regions[f]!.describe)}`);
      const tail = c.events.slice(n);
      return `**${c.verdict}** <br> ${per.join(' <br> ')} <br> then: \`${tail.join(' ') || '(nothing)'}\``;
    });
    return `| **${scenario.key}** <br> ${scenario.title} <br> \`${streams[0]!.slice(0, n).join(' ')}\` | ${cs.join(' | ')} |`;
  });
  return [head, rule, ...body].join('\n');
}
