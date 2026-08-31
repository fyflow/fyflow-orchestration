/**
 * The driver — ADR 0001: the only component that touches the scheduler, and the
 * only one with side effects. Routing is a pure function evaluated here; this file
 * is what turns its answer into dispatches.
 *
 * ADR 0004 gave it a second, inbound edge: `resolve()`. It is the only place
 * anything outside this process can change a run, and it changes it by APPENDING
 * a record rather than by writing to run state (rule 6).
 *
 * **This file holds no run state beyond the log and the bookkeeping it needs to
 * dispatch.** What a run *is* is Q14, which W2 tests over `src/fold/**`. If this
 * driver turns out to need a second copy of run truth, that is a finding about the
 * spec rather than a thing to build.
 */
import type { FlowDefinition, FlowNode, Registry, TerminalState } from '../definition/types.ts';
import { allRegions, buildGraph, toRegion, type Graph, type RegionSets } from '../definition/regions.ts';
import { validateDefinition, violatedRules } from '../definition/validate.ts';
import { assertRunId, buildTaskId, parseTaskId } from './ids.ts';
import { effectiveOutcome, isSuspended, type LogRecord, type OutcomeRecord } from './log.ts';
import { normalizeEvent, type TaskDetailLike } from './listener.ts';
import { selectEdge, type PredicateRegistry } from './routing.ts';
import type { RegionEvent } from './events.ts';
import type { JoinPolicy, Region, UnsatisfiableJoin } from './policy.ts';
// Type-only, so it is erased and there is no runtime cycle with `src/fold/`.
// The driver PRODUCES this sequence (ADR 0014) and the fold consumes it; the type
// stays where `spec/run-state.md` defines it rather than being copied here.
import type { FoldInput } from '../fold/run-state.ts';

export class InvalidDefinition extends Error {
  /**
   * The rule ids, on the error rather than only in its text, so a caller can act
   * on them.
   *
   * Declared as a field and assigned in the body rather than as a **parameter
   * property**: Node 24 runs TypeScript by stripping types, and a parameter
   * property is syntax it cannot strip (`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`).
   * `deno check` accepts it, so this is a construct one runtime typechecks clean
   * and another refuses to run — see `spec/runtime-targets.md` section 4.
   */
  readonly rules: string[];
  constructor(rules: string[], message: string) {
    super(message);
    this.rules = rules;
  }
}
export class DuplicateTaskId extends Error {}

/**
 * A second `start()` on a driver that already ran one — `ID-R3`.
 *
 * Thrown rather than reported through `onRunFailure`, because `start` is called
 * by the caller with the caller on the stack, and because nothing has been
 * appended: there is no run to fail.
 *
 * **Widened by [ADR 0022](../../doc/decisions/0022-a-driver-takes-its-run-at-construction.md)
 * rule 4.** The run id is a constructor option, so "a second, *different* run" is
 * not a thing a caller can express: **any** second `start` is refused.
 */
export class MultipleRuns extends Error {}

/**
 * A settlement carrying THIS driver's run id for a task it never dispatched —
 * `ID-R4`, and the inbound counterpart of `ID-R1`
 * ([ADR 0023](../../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
 * rules 4-5).
 *
 * **Reported, not thrown**, because it is reached from a scheduler listener
 * (`OR-R10`) — and nothing is appended, for the reason `ID-R1` refuses before
 * `addTask` sees the task.
 *
 * A settlement for **another** run's id is not this: it is ignored silently and is
 * not a refusal at all (rule 3). The two are different failures and only one of
 * them is ours.
 */
export class UndispatchedTask extends Error {}

/**
 * A record copy that does not alias `result`. Ten of the eleven outcome fields
 * are primitives; `result` is the one that is not, which is
 * `spec/outcome-record.md` section 4's argument applied to the way OUT.
 * `Object.freeze` is shallow and a spread aliases `result`, so neither is enough
 * on its own.
 */
function cloneValue(v: unknown): unknown {
  return v === null || v === undefined ? v : structuredClone(v);
}

function cloneRecord<T extends { result?: unknown }>(r: T): T {
  return r.result === null || r.result === undefined
    ? { ...r }
    : { ...r, result: structuredClone(r.result) };
}

/**
 * One element of the fold's input sequence, copied and frozen on the way out
 * (ADR 0014). Only the two record kinds carry a `result`; the other four are flat
 * and primitive, so a shallow freeze of a fresh object is the whole copy.
 */
function freezeInput(i: FoldInput): FoldInput {
  return Object.freeze(
    i.kind === 'outcome' || i.kind === 'resolution'
      ? { ...i, record: Object.freeze(cloneRecord(i.record)) }
      : i.kind === 'region'
      ? { ...i, event: Object.freeze({ ...i.event }) }
      : { ...i },
  ) as FoldInput;
}

/**
 * A definition with a fan-out was instantiated without a join policy.
 *
 * Refused at construction rather than at the join, because the alternative is a
 * run that dispatches every branch, sees every one arrive, and then stops — with
 * no error and nothing queued. **That is the signature P1 exists to attribute to
 * a join policy** (`doc/plans/p1-what-satisfies-a-join.md`), and shipping a driver
 * that produces it for a *configuration* mistake would put a second cause behind
 * the observation the whole plan turns on.
 */
export class MissingJoinPolicy extends Error {}

/**
 * The run has failed and the driver has stopped routing it.
 *
 * **`spec/` says three refusals "terminate the run" — `FD-R1`, `ID-R1`, `OR-R6` —
 * and a `throw` cannot do that.** Every one of them is reached from inside a
 * `scheduler.addEventListener` callback, and `EventTarget.dispatchEvent`
 * **discards a listener throw**: measured on Node 24, the remaining listeners
 * still run, `dispatchEvent` returns normally, and the error resurfaces
 * out-of-band on `process.nextTick`. In a browser it is a `window.onerror` report
 * and the page carries on.
 *
 * So the run would have kept draining with nothing told — the silent stop
 * `spec/flow-definition.md` section 3 refuses on P1's own validity grounds, which
 * is the third time that signature has appeared in this file.
 *
 * The driver therefore **catches its own refusals at the listener boundary**,
 * marks the run failed so nothing routes again, and reports through
 * `onRunFailure`. The refusal classes are unchanged and still carry their names;
 * what changed is that "terminates the run" is a thing the driver *does* rather
 * than a thing it throws.
 */
export interface RunFailure {
  runId: string;
  /** `DuplicateTaskId` | `UncloneableResult` | `NoMatchingEdge` | the policy's own error name. */
  kind: string;
  message: string;
  cause: unknown;
}

/** What the driver needs from a scheduler. Structural, so W3 is testable without one. */
export interface SchedulerLike {
  addTask(task: unknown, options?: { createPromise?: boolean }): unknown;
  addEventListener(type: string, listener: (e: { detail: unknown }) => void): void;
}

/** W5 supplies `new FyflowTask({...})`; W3's tests supply a plain object. */
export type TaskFactory = (config: {
  id: string;
  workerType: string;
  payload: unknown;
  optional: boolean;
}) => unknown;

export interface DriverOptions {
  /**
   * **The one run this driver serves** —
   * [ADR 0022](../../doc/decisions/0022-a-driver-takes-its-run-at-construction.md)
   * rule 1. `ID-R3` always said a driver serves exactly one run; until W13 the
   * surface said otherwise, and the next reader believed the surface
   * ([Q53](../../doc/open-questions.md)).
   *
   * `ID-R2`'s charset refusal happens here, in the constructor, before the
   * definition is validated and before anything is queued: a run id is
   * configuration, like `joinPolicy`, and ADR 0002 rule 3's argument applies.
   */
  runId: string;
  scheduler: SchedulerLike;
  createTask: TaskFactory;
  predicates: PredicateRegistry;
  workerTypes: Iterable<string>;
  /**
   * Required when the definition contains a fan-out. **W3 ships none** — both
   * policies are W2's and which is right is W4's question (`JP-R7`, `JP-R8`), so
   * a driver that decided satisfaction itself would answer Q4 from inside W3.
   */
  joinPolicy?: JoinPolicy;
  /**
   * Called when a policy reports a join can never fire. **The driver does not
   * invent a run-level outcome** — that vocabulary is run state's
   * ([Q25](../../doc/open-questions.md)) and neither pinned policy returns
   * `unsatisfiable` at all, which is itself Q7's finding rather than a gap.
   */
  onUnsatisfiableJoin?: (info: UnsatisfiableJoin) => void;
  /**
   * Called when a refusal terminates a run. See `RunFailure` — a `throw` from a
   * listener is discarded by `dispatchEvent`, so this is the only way the failure
   * `FD-R1`, `ID-R1` and `OR-R6` describe can actually reach a caller.
   */
  onRunFailure?: (failure: RunFailure) => void;
  /** Injected so the fold stays deterministic under test and `observedAt` is not a hidden global. */
  now?: () => number;
  onRegionEvent?: (e: RegionEvent) => void;
  /**
   * **ADR 0014.** Every element of the fold's input sequence, in append order, as
   * it is appended. A frozen copy, so a listener cannot edit the driver's own
   * sequence (`OR-R7`).
   *
   * This is the push half of `foldInputs()` and it exists for one reason: a
   * consumer that folds incrementally can tell when a run has **finished** —
   * `RunState.outcome` leaving `running`/`awaiting_action` — without a clock, a
   * poll, or `scheduler.completed`, which fires on every drain and is not
   * "the run finished".
   */
  onFoldInput?: (input: FoldInput) => void;
}

const SETTLEMENT_EVENTS = ['task.completed', 'task.failed', 'task.user_action'] as const;

export class Driver {
  /**
   * `OR-R7` — nothing outside the inbound API writes to run state. Private, and
   * `snapshot()` is the only way out: a public `readonly` array still accepts
   * `.push()`, which would let a caller forge a settlement and bypass `RS-R1`.
   */
  private readonly log: LogRecord[] = [];

  /**
   * **ADR 0014 — the fold's input sequence, and the only ordered thing here.**
   *
   * `spec/run-state.md` section 6 recorded that `FoldInput` interleaves six kinds
   * into one ordered value and **nothing produced it** ([Q41](../../doc/open-questions.md)):
   * records left through `snapshot()`, region events through `onRegionEvent`,
   * dispatches through nothing at all, and a refusal through `onRunFailure` — four
   * channels with no shared order, so `RN-R3`'s *"read in append order"* was about
   * a value no one could hold.
   *
   * `log` above is the **record-kind subsequence of this array**, kept as its own
   * array only because `effectiveOutcome` and `isSuspended` scan it on every
   * settlement and rebuilding it by filter each time is quadratic. It holds the
   * same record objects, never copies. `test/driver/` asserts the two agree, so
   * the redundancy is checked rather than trusted.
   */
  private readonly inputs: FoldInput[] = [];

  private readonly graph: Graph;
  private readonly regions: RegionSets[];
  private readonly dispatched = new Set<string>();
  private readonly now: () => number;
  private readonly opts: DriverOptions;
  private readonly def: FlowDefinition;
  /** Per fanout id: the policy's opaque state. Opened when the fanout is entered. */
  private readonly joinState = new Map<string, unknown>();
  /** A join fires at most once, however many terminal events follow it. */
  private readonly firedJoins = new Set<string>();
  /**
   * **The one run this driver serves** — ADR 0022 rule 1, fixed at construction
   * and never `null`.
   *
   * Until W13 this was `startedRun: string | null`, set by the first `start`,
   * beside a `failedRuns` **set** and a `hasFailed(runId)` taking an argument —
   * three shapes that only made sense if a driver served many runs. They were
   * redundant rather than wrong, and [Q53](../../doc/open-questions.md) recorded
   * that a redundant surface is read as a permissive one.
   */
  private readonly runId: string;
  /** `ID-R3` — `start()` at most once, whatever id the caller had in mind. */
  private started = false;
  /** The run has been stopped by a refusal. Nothing dispatches for it again. */
  private failed = false;

  /**
   * Validates the definition IN FULL before anything is queued (ADR 0002 rule 3),
   * mirroring `addTasks` rejecting a whole batch up front. A typo must not become
   * a routing failure discovered on the one workload that takes that branch.
   */
  constructor(definition: FlowDefinition, opts: DriverOptions) {
    // **`ID-R2`, and it runs FIRST** — ADR 0022 rule 3. Before the definition is
    // validated, before a listener is registered, before anything is queued. A run
    // id is configuration; refusing it late would mean a driver that had already
    // subscribed to a scheduler for a run it cannot name.
    assertRunId(opts.runId);
    this.runId = opts.runId;
    const registry: Registry = {
      predicates: new Set(opts.predicates.keys()),
      workerTypes: new Set(opts.workerTypes),
    };
    const findings = validateDefinition(definition, registry);
    if (findings.length) {
      throw new InvalidDefinition(
        violatedRules(findings),
        `definition "${definition.flowId}" is invalid: ` +
          findings.map((f) => `${f.rule} at ${f.at ?? '<document>'}: ${f.detail}`).join('; '),
      );
    }
    this.def = definition;
    this.opts = opts;
    this.now = opts.now ?? (() => Date.now());
    this.graph = buildGraph(definition);
    this.regions = allRegions(this.graph, definition);

    if (this.regions.length > 0 && !opts.joinPolicy) {
      throw new MissingJoinPolicy(
        `MissingJoinPolicy: definition "${definition.flowId}" has ${this.regions.length} ` +
          `fan-out region(s) and no joinPolicy. ` +
          'Without one every branch would arrive and the join would never fire, which is ' +
          'indistinguishable from the case P1 exists to measure.',
      );
    }

    for (const name of SETTLEMENT_EVENTS) {
      // ADR 0007 rule 1: the normalization happens HERE, synchronously, while the
      // listener runs. Nothing downstream ever sees `e.detail`.
      opts.scheduler.addEventListener(name, (e) => this.onEvent(name, e.detail as TaskDetailLike));
    }
  }

  /**
   * Dispatch the entry node for the run this driver was constructed for.
   *
   * **`ID-R3` — one Driver, one run, and since ADR 0022 rule 4 that means
   * `start()` at most once.** This driver's `inputs`, `firedJoins` and
   * `joinState` are keyed per-Driver or per-`fanoutId`, with no run id anywhere.
   * Without the refusal a second run's join **never fires** —
   * `firedJoins.has(fanoutId)` is already true from the first — and
   * `fold(driver.foldInputs())` merges both runs into one `RunState` carrying the
   * first run's id and reporting `completed`, for a state containing a
   * permanently hung run. That is character-for-character the false statement
   * [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)
   * exists to remove, and it was reachable through this class's own declared
   * surface until W5's spec-conformity pass measured it.
   *
   * **v0.4 of `spec/task-id.md` made this rule narrow — only a *different* id —
   * and said in writing what widening it would cost: `ID-R1`'s only direct test,
   * because W3 provoked a duplicate dispatch by starting the same run twice.**
   * ADR 0022 widens it anyway, having measured the replacement first: the same
   * settlement delivered twice routes twice, and `ID-R1` refuses the *successor's*
   * redispatch — **reported** through `onRunFailure` rather than thrown, which is
   * the form `OR-R10` actually describes. `spec/task-id.md` section 3 records the
   * substitution rather than dropping it.
   */
  start(payload: unknown): void {
    const runId = this.runId;
    if (this.started) {
      throw new MultipleRuns(
        `MultipleRuns: this driver already started run "${runId}" and cannot start it again. ` +
          'ID-R3: a Driver serves exactly one run — its input sequence, its fired joins and its ' +
          'policy state carry no run id, so a second run would silently merge into the first. ' +
          'Construct a second Driver; ADR 0023 makes that safe on the same scheduler.',
      );
    }
    this.started = true;
    try {
      this.enter(runId, this.def.entry, payload);
    } catch (e) {
      // `start` is called by the caller, not by a listener, so it BOTH reports
      // and rethrows: the caller is on the stack and can act on it.
      this.failRun(runId, e);
      throw e;
    }
  }

  // --- inbound: the one thing outside this process that can change a run -------

  /**
   * ADR 0004 rules 4-6. `RS-R1`: refused unless the task's LAST record is an
   * outcome in `user_action` — so a task already resolved is not suspended, and a
   * second resolution is refused like any other. A rejected command, not a run
   * failure: it came from outside and a caller can retry.
   *
   * @returns `false` when refused. Nothing is appended and the run is unaffected.
   */
  resolve(
    taskId: string,
    resolvedAs: 'done' | 'failed',
    value: { result?: unknown; error?: string; actor: string },
  ): boolean {
    if (!isSuspended(this.log, taskId)) return false;
    const { runId, nodeId, branchPath } = parseTaskId(taskId);
    // `OR-R10` — *"the driver has stopped routing it"*, and that has to hold on
    // the INBOUND edge too. `onEventOrThrow` checks this; `resolve` did not, so a
    // resolution for a suspended task in a stopped run appended a record and
    // dispatched. W5's sequence made it visible: the elements kept arriving after
    // the `stopped` element, while `withOutcome` pins the outcome to `stopped`,
    // so nothing reported the work. Refused like any other rejected command.
    if (this.failed) return false;
    this.append({
      kind: 'resolution',
      record: {
        kind: 'resolution',
        taskId,
        resolvedAs,
        result: resolvedAs === 'done' ? structuredClone(value.result ?? null) : null,
        error: resolvedAs === 'failed' ? (value.error ?? 'resolved as failed') : null,
        actor: value.actor,
        observedAt: this.now(),
      },
    });
    const region = this.regionOf(nodeId);
    if (region) {
      this.emit({ type: 'branch.resumed', regionId: region.fanoutId, branchPath, at: nodeId, resolvedAs });
    }
    // RS-R2: a resolution supplies an outcome for the dispatch that already
    // happened. It never re-dispatches — that is flow-level retry, Q16/Q28.
    this.advance(runId, nodeId, branchPath);
    return true;
  }

  // --- the scheduler's side ----------------------------------------------------

  private onEvent(name: string, detail: TaskDetailLike): void {
    // The listener boundary is also the FAILURE boundary: a throw from here is
    // discarded by dispatchEvent, so it is caught, reported, and the run stops.
    let runId = '<unknown>';
    try {
      runId = typeof detail?.id === 'string' ? parseTaskId(detail.id).runId : runId;
    } catch { /* a malformed id is reported by the catch below */ }
    try {
      this.onEventOrThrow(name, detail);
    } catch (e) {
      this.failRun(runId, e);
    }
  }

  /** Whether this run has been stopped by a refusal. */
  hasFailed(): boolean {
    return this.failed;
  }

  private failRun(runId: string, cause: unknown): void {
    // `RN-R8` — `stopped` outranks everything, and the fold learns it here.
    // Appended before `failed` is set so a re-entrant `onFoldInput` listener
    // sees the same order a later `foldInputs()` reader does.
    const already = this.failed;
    this.failed = true;
    const err = cause instanceof Error ? cause : new Error(String(cause));
    if (!already) {
      this.append({ kind: 'stopped', reason: `${err.constructor?.name ?? 'Error'}: ${err.message}` });
    }
    this.opts.onRunFailure?.({
      runId,
      kind: err.constructor?.name ?? 'Error',
      message: err.message,
      cause,
    });
  }

  private onEventOrThrow(name: string, detail: TaskDetailLike): void {
    const record = normalizeEvent(name, detail, this.now());
    if (!record) return; // OR-R3/OR-R4: this event writes nothing

    // **Parsed BEFORE it is appended, and the order is load-bearing.** An id this
    // driver did not mint cannot be routed on, and `OR-R10` stops the run for it —
    // but appending the record first leaves an element in the sequence that
    // `fold` itself throws on, because `step` parses the same id. The run would
    // then be `stopped` *and* unfoldable, which is a worse failure than the one
    // being reported. Found by W5's own test, which had to fabricate the case:
    // every id the scheduler reports is one `dispatch` minted.
    const { runId, nodeId, branchPath } = parseTaskId(record.taskId);

    // **`ID-R4` — ADR 0023, and it is two tiers because they are two different
    // failures.** Both sit AFTER the parse, so a malformed id still stops the run
    // (`OR-R10`, above): "does not parse" is not "not ours", it is a defect.
    //
    // Tier 1 — another run's settlement. Routine the moment two drivers
    // legitimately share one scheduler, which ADR 0023 is what makes safe. This
    // driver has no standing to judge another run, so it is ignored, silently,
    // and nothing is appended. **The cost is stated in that ADR rather than
    // hidden: a driver is now silent about what it drops**, so a caller that
    // starts `run-l` meaning `run-1` sees a run that never progresses.
    if (runId !== this.runId) return;
    // Tier 2 — OUR run id, on a task we never dispatched. Impossible if the
    // bookkeeping is right, which is exactly `ID-R1`'s character: within one run
    // this driver mints every id it dispatches. Three shapes reach here and every
    // one was silently accepted and routed before W13 — a node never dispatched,
    // a node not in the definition at all, and a branch path never opened.
    if (!this.dispatched.has(record.taskId)) {
      throw new UndispatchedTask(
        `UndispatchedTask: "${record.taskId}" settled in run "${runId}", but this driver never ` +
          'dispatched it. ID-R4: within one run the driver mints every task id it dispatches, so ' +
          'either its path bookkeeping is wrong or something else is writing into this run id.',
      );
    }

    this.append({ kind: 'outcome', record });
    if (this.failed) return;
    if (record.terminalState === 'user_action') {
      // Not a loss. The branch is still live and the join keeps waiting; a run
      // waiting on a person must not be reported as stuck (Q7).
      const region = this.regionOf(nodeId);
      if (region) this.emit({ type: 'branch.suspended', regionId: region.fanoutId, branchPath, at: nodeId });
      return;
    }
    this.advance(runId, nodeId, branchPath);
  }

  /** Route out of a settled-or-resolved node and dispatch whatever comes next. */
  private advance(runId: string, nodeId: string, branchPath: string): void {
    const node = this.graph.byId.get(nodeId);
    if (!node) return;
    const taskId = buildTaskId(runId, nodeId, branchPath === '-' ? null : Number(branchPath.split('.')[0]));
    const outcome = effectiveOutcome(this.log, taskId);
    if (!outcome) return; // suspended, or not settled

    // The predicate sees a COPY. `effectiveOutcome` returns the stored settlement
    // record by reference when there is no resolution, and a predicate is ordinary
    // user code (ADR 0002 rule 4 asks it to be pure; nothing enforces that — Q9).
    const ctx = { outcome: cloneRecord(outcome) };
    const result = selectEdge(node, runId, outcome.terminalState, ctx, this.opts.predicates);
    if (result.taken === null) {
      // No edge opts into this state. The path ends — declared by omission.
      const region = this.regionOf(nodeId);
      if (region) {
        this.emit({ type: 'branch.lost', regionId: region.fanoutId, branchPath, reason: 'failed' });
      }
      // `spec/run-state.md` section 3's `failed` — *"a path ended with no eligible
      // edge, outside or inside a region"*. Reported for BOTH, and appended after
      // the region event and before `settleJoin`, because the join's downstream
      // dispatch happens inside that call and must not precede the path end that
      // led to it.
      this.append({ kind: 'pathEnded', reason: 'no-eligible-edge', at: nodeId });
      if (region) this.settleJoin(runId, region);
      return;
    }
    // **Deep-copied on the way to the next task.** `outcome.result` is the stored
    // record's field: handing it to `createTask` makes the next task's payload the
    // previous record's `result`, and an inline worker that mutates what it was
    // given mutates a record already in the log. `spec/outcome-record.md` section
    // 4 — *"copying the field copies the reference"* — applied to the one exit
    // that actually reaches a worker.
    // The source node's region travels with the hop. A non-`end` node is in at
    // most one region (FD-V19, FD-V22), so `regionOf` is unambiguous HERE — it is
    // only `end` nodes, which are exempt from those rules, that can be in two.
    this.enter(
      runId, result.taken.to, cloneValue(outcome.result), branchPath,
      this.regionOf(nodeId)?.fanoutId,
    );
  }

  /**
   * Walk into a node. `fanout`, `join` and `end` dispatch nothing and are passed
   * through within this turn; only a `task` becomes a scheduler task.
   */
  private enter(runId: string, nodeId: string, payload: unknown, fromBranch = '-', fromRegion?: string): void {
    const node = this.graph.byId.get(nodeId);
    if (!node) return;

    switch (node.kind) {
      case 'task':
        return this.dispatch(runId, node, payload, this.branchPathFor(nodeId, fromBranch));

      case 'fanout': {
        const region = this.regions.find((r) => r.fanoutId === nodeId);
        if (!region) return;
        // JP-R5: EVERY `branch.opened` for a region precedes any other event for
        // it. Emitting them all before dispatching any is what makes that true —
        // without it a live-token policy can see the count reach zero while a
        // branch is still running, and W4 would read that as a property of the
        // policy rather than of this loop.
        // The policy is opened BEFORE the first `branch.opened`, so `emit` has
        // state to step. `JP-R5`'s ordering rule and this are the same constraint
        // seen from two sides.
        if (this.opts.joinPolicy) {
          this.joinState.set(region.fanoutId, this.opts.joinPolicy.open(toRegion(region) as Region));
        }
        region.branches.forEach((_b, i) => {
          this.emit({ type: 'branch.opened', regionId: region.fanoutId, branchPath: String(i) });
        });
        region.branches.forEach((b, i) => this.enter(runId, b, payload, String(i), region.fanoutId));
        return;
      }

      case 'join': {
        // The driver reports arrival and then ASKS. Whether the join is satisfied
        // is a policy's answer (W2) and which policy is right is W4's; what the
        // driver does with the answer is this file's (`spec/join-policy.md`
        // section 4's owner table).
        const region = this.regions.find((r) => r.joinId === nodeId);
        if (!region) return;
        this.emit({ type: 'branch.arrived', regionId: region.fanoutId, branchPath: fromBranch });
        this.settleJoin(runId, region);
        return;
      }

      case 'end': {
        // Attributed by the region the branch was OPENED in, not by `regionOf`,
        // which returns the first region containing the node. `end` nodes are
        // exempt from FD-V13/FD-V19/FD-V22, so one may belong to two regions —
        // and a definition with two sequential fan-outs sharing an `end`
        // validates clean. Attributing by node made the wrong join see a second
        // terminal event for a branch that had already arrived, breaking JP-R5.
        const region = fromRegion
          ? this.regions.find((r) => r.fanoutId === fromRegion)
          : undefined;
        if (region && fromBranch !== '-') {
          // NOT "left the region" — the `end` is inside region(F). The condition is
          // "reached a node of kind `end`", which is local and computable.
          this.emit({ type: 'branch.exited', regionId: region.fanoutId, branchPath: fromBranch, at: nodeId });
        }
        // `spec/run-state.md` section 3's `completed` — *"at least one path ended
        // at an `end` node"*. **Reported whether or not the path was in a region**,
        // which is the half nothing reported before: outside one there was no
        // region event either, so `pathEnded` had no producer anywhere (Q41).
        this.append({ kind: 'pathEnded', reason: 'end', at: nodeId });
        if (region && fromBranch !== '-') this.settleJoin(runId, region);
        return;
      }
    }
  }

  private dispatch(runId: string, node: FlowNode & { kind: 'task' }, payload: unknown, branchPath: string): void {
    const branchIndex = branchPath === '-' ? null : Number(branchPath.split('.')[0]);
    const taskId = buildTaskId(runId, node.id, branchIndex, 0);

    // ID-R1 — the refusal, BEFORE addTask sees it. A duplicate means the validator
    // or this driver's path bookkeeping is wrong; continuing runs both tasks and
    // lands two outcome records under one key (spec/task-id.md section 2).
    if (this.dispatched.has(taskId)) {
      throw new DuplicateTaskId(`DuplicateTaskId: "${taskId}" was already dispatched in run "${runId}"`);
    }
    this.dispatched.add(taskId);
    // Appended BEFORE `addTask`. `RN-R4` says a node absent from `nodes` was never
    // dispatched; a scheduler that settled a task inside `addTask` would otherwise
    // deliver the outcome before the dispatch that caused it.
    this.append({ kind: 'dispatched', taskId });

    this.opts.scheduler.addTask(
      this.opts.createTask({
        id: taskId,
        workerType: node.workerType,
        payload,
        optional: node.optional === true,
      }),
    );
  }

  private branchPathFor(nodeId: string, inherited: string): string {
    const region = this.regionOf(nodeId);
    if (!region) return '-';
    return inherited;
  }

  private regionOf(nodeId: string): RegionSets | undefined {
    return this.regions.find((r) => r.members.has(nodeId));
  }

  /**
   * Every region event goes to the policy and to the observer, in that order.
   * A policy that never saw `branch.exited` could not survive P1's case, and
   * `JP-R4` says the vocabulary is sized for the richer policy — so the driver
   * forwards all six and lets a policy ignore what it does not need.
   */
  /**
   * Append one element to the fold's input sequence — **the single place append
   * order is decided** (ADR 0014).
   *
   * A record is pushed to `log` as well, by reference: `effectiveOutcome` reads
   * the stored object and `OR-R8` derives rather than appends, so a second copy
   * here would be a second truth. What leaves through `onFoldInput` **is** a
   * copy, frozen, for the same reason `snapshot()` is: a listener holding the
   * driver's own array could forge a settlement and bypass `RS-R1`.
   */
  private append(input: FoldInput): void {
    this.inputs.push(input);
    if (input.kind === 'outcome' || input.kind === 'resolution') this.log.push(input.record);
    if (this.opts.onFoldInput) this.opts.onFoldInput(freezeInput(input));
  }

  private emit(e: RegionEvent): void {
    const policy = this.opts.joinPolicy;
    // `has`, not `!== undefined`: `S` is the policy's own opaque state type and
    // `undefined` is a legal value of it. An `open()` returning `undefined` used to
    // silently disable the whole seam — no event reached `step`, the join never
    // fired, and `joinStatusOf` reported "not entered" about a region that was.
    if (policy && this.joinState.has(e.regionId)) {
      this.joinState.set(e.regionId, policy.step(this.joinState.get(e.regionId), e));
    }
    // **`OR-R7` and ADR 0014 — every value the driver hands outward is a frozen
    // copy, and `onRegionEvent` was the one path that was not** ([Q73](../../doc/open-questions.md)).
    // It received `e` itself: the object `append` was about to store, so a
    // listener writing `e.branchPath` rewrote the driver's own `inputs` and the
    // folded `regions` with it. Measured, not read — `snapshot()`, `foldInputs()`
    // and `onFoldInput` all froze and this did not.
    //
    // **One copy, frozen, stored AND handed out**, so `onRegionEvent` and a later
    // `foldInputs()` reader cannot be shown different objects. A `RegionEvent`'s
    // fields are all primitives — checked against **`./events.ts`**, which is what
    // establishes it; `spec/join-policy.md` section 2 lists the field names and no
    // types, so citing it for this would be citing the wrong thing (W12's
    // conformity reader). A shallow freeze is therefore the whole copy, and if
    // that stops being true `freezeInput` is already wrong in the same way.
    //
    // The POLICY is still stepped with `e` above, deliberately: a policy is ours
    // in a way a listener is not, and freezing what the seam sees is a separate
    // question this item does not answer.
    const event = Object.freeze({ ...e }) as RegionEvent;
    // The policy is stepped first and the sequence records second, so that a
    // `onFoldInput` listener asking `joinStatusOf` sees the status this event
    // produced rather than the one before it.
    this.append({ kind: 'region', event });
    this.opts.onRegionEvent?.(event);
  }

  /**
   * Ask the policy, and act on the answer.
   *
   * Called after every terminal region event, not only on arrival: a join can
   * become satisfied because the last live branch was **lost** or **exited**
   * without anything arriving at it, which is exactly P1's case.
   */
  /**
   * Deliberately takes NO payload. `settleJoin` is reached from three sites and
   * which one arrives is decided by fan-out completion order — so a signature
   * that accepted one would make the join's downstream data order-dependent by
   * construction. Removing the parameter is what makes Q36 a question rather
   * than a convention someone can quietly break.
   */
  private settleJoin(runId: string, region: RegionSets): void {
    const policy = this.opts.joinPolicy;
    if (!policy || this.firedJoins.has(region.fanoutId)) return;
    if (!this.joinState.has(region.fanoutId)) return;
    const state = this.joinState.get(region.fanoutId);

    const status = policy.status(state);
    if (status === 'waiting') return;

    if (status === 'unsatisfiable') {
      // `describe` is computed BEFORE the region is latched. The other order means
      // a throwing `describe` marks the join fired and loses the report
      // permanently — even a caller that catches never learns why.
      const describe = policy.describe(state);
      this.firedJoins.add(region.fanoutId);
      // ADR 0015 — the join is settled and it did NOT fire. Nothing downstream of
      // it will ever be dispatched, which is what makes the run `stuck` rather
      // than `completed`.
      this.append({ kind: 'joinSettled', regionId: region.fanoutId, joinId: region.joinId, fired: false });
      this.opts.onUnsatisfiableJoin?.({
        fanoutId: region.fanoutId,
        joinId: region.joinId,
        describe,
        policyId: policy.id,
      });
      return;
    }

    // satisfied — route out of the join, exactly once.
    this.firedJoins.add(region.fanoutId);
    // **ADR 0015.** Appended before the routing it authorises, so a fold that
    // reads the sequence sees the join fire and *then* sees what it dispatched.
    //
    // This is what [Q43](../../doc/open-questions.md) needed and what its register
    // entry said was already there: on `p1-routed-away` **both policies produce
    // the same `regions` value** — every branch settles under both — and the only
    // difference is whether this line was reached. Without it a permanently stuck
    // run and a completed one are the same fold.
    //
    // It records what the DRIVER did, not what a policy concluded, which is why it
    // does not violate `RN-R6`: `fired` is "routing left the join", an action, and
    // the same two policies over the same events still produce identical `regions`.
    this.append({ kind: 'joinSettled', regionId: region.fanoutId, joinId: region.joinId, fired: true });
    const join = this.graph.byId.get(region.joinId);
    if (!join || join.kind !== 'join') return;
    const edge = join.edges?.[0];
    // **The join passes `null`, deliberately.** `settleJoin` is reached from three
    // sites with three different payloads, and which one arrives is decided by
    // fan-out completion order — which `doc/concept.md` section 5 says is
    // genuinely non-deterministic and CLAUDE.md says nothing may depend on. A
    // join that forwarded "whichever branch finished last" would make a run's
    // DATA order-dependent, which is worse than a flaky test.
    //
    // `spec/` says nothing about what a join carries downstream
    // ([Q36](../../doc/open-questions.md)), so this refuses to invent it rather
    // than picking a branch arbitrarily.
    if (edge) this.enter(runId, edge.to, null);
  }

  /**
   * A frozen copy for tests and for W2's fold. The array is copied and each record
   * frozen, so neither the sequence nor a record can be edited from outside —
   * which is what `OR-R7` and `RS-R1` both assume.
   */
  snapshot(): readonly LogRecord[] {
    return Object.freeze(this.log.map((r) => Object.freeze(cloneRecord(r)))) as readonly LogRecord[];
  }

  /**
   * **The fold's input sequence — ADR 0014, and [Q41](../../doc/open-questions.md)'s
   * answer.** A frozen copy, in append order, of everything the fold consumes:
   * the two record kinds, region events, dispatches, path ends, join settlements
   * and a stop.
   *
   * `fold(driver.foldInputs())` is the whole of turning a run into run state, and
   * it is the value `RN-R3`'s *"read in append order, never sorted"* is about.
   * `snapshot()` is the record-kind subsequence of this and remains the right
   * thing to read when only the log matters.
   *
   * **This is not a second copy of run truth** (which W3's scope forbids): it is
   * the log, plus the facts the driver knew while routing that no record carries.
   * The driver still computes no run state — `fold` does, and it is pure.
   */
  foldInputs(): readonly FoldInput[] {
    return Object.freeze(this.inputs.map(freezeInput)) as readonly FoldInput[];
  }


  /** Task ids dispatched in this driver, for `ID-R1`'s assertion. */
  dispatchedIds(): readonly string[] {
    return [...this.dispatched];
  }

  /** Copied, never the stored record by reference — `effectiveOutcome` returns the settlement itself when there is no resolution. */
  /**
   * The regions in the shape `spec/join-policy.md` section 1 fixes — `members`
   * sorted, and only the four fields a policy may see. This is the value W2's
   * policies are opened with, exposed so W2 can build fixtures against the same
   * projection the driver uses rather than re-deriving the region maths, which
   * `src/definition/regions.ts` exists to keep in one place.
   */
  regionsForPolicies(): Region[] {
    return this.regions.map((r) => toRegion(r) as Region);
  }

  /**
   * What the join policy currently says, per fan-out. `null` when there is no
   * policy or the region has not been entered.
   *
   * `spec/join-policy.md` section 4 assigns W3 *"how it detects a stuck one when
   * no policy says so"* — and neither pinned policy ever returns `unsatisfiable`,
   * so this accessor is the whole of that detection today. Anything more is
   * [Q7](../../doc/open-questions.md), which is W4's.
   */
  joinStatusOf(fanoutId: string): { status: string; describe: unknown } | null {
    const policy = this.opts.joinPolicy;
    if (!policy || !this.joinState.has(fanoutId)) return null;
    const state = this.joinState.get(fanoutId);
    try {
      return { status: policy.status(state), describe: policy.describe(state) };
    } catch {
      // A detector that takes its caller down when the policy misbehaves is worse
      // than one that says nothing. `spec/join-policy.md` section 4 calls this
      // accessor "the whole of stuck-join detection today", and something asking
      // whether a run is stuck must not itself become the failure.
      return null;
    }
  }

  /**
   * Deep-copied, never the stored record by reference: `effectiveOutcome` returns
   * the settlement record itself when there is no resolution, and a spread of it
   * would still alias `result` — the mirror of the hazard `OR-R2` exists for on
   * the way in.
   */
  effectiveOutcomeOf(taskId: string): OutcomeRecord | null {
    const o = effectiveOutcome(this.log, taskId);
    return o === null ? null : (cloneRecord(o) as OutcomeRecord);
  }

  terminalStateOf(taskId: string): TerminalState | null {
    return this.effectiveOutcomeOf(taskId)?.terminalState ?? null;
  }
}
