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
import { allRegions, buildGraph, type Graph, type RegionSets } from '../definition/regions.ts';
import { validateDefinition, violatedRules } from '../definition/validate.ts';
import { assertRunId, buildTaskId, parseTaskId } from './ids.ts';
import { effectiveOutcome, isSuspended, type LogRecord, type OutcomeRecord } from './log.ts';
import { normalizeEvent, type TaskDetailLike } from './listener.ts';
import { selectEdge, type PredicateRegistry } from './routing.ts';
import type { RegionEvent } from './events.ts';

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
  scheduler: SchedulerLike;
  createTask: TaskFactory;
  predicates: PredicateRegistry;
  workerTypes: Iterable<string>;
  /** Injected so the fold stays deterministic under test and `observedAt` is not a hidden global. */
  now?: () => number;
  onRegionEvent?: (e: RegionEvent) => void;
}

const SETTLEMENT_EVENTS = ['task.completed', 'task.failed', 'task.user_action'] as const;

export class Driver {
  /**
   * `OR-R7` — nothing outside the inbound API writes to run state. Private, and
   * `snapshot()` is the only way out: a public `readonly` array still accepts
   * `.push()`, which would let a caller forge a settlement and bypass `RS-R1`.
   */
  private readonly log: LogRecord[] = [];

  private readonly graph: Graph;
  private readonly regions: RegionSets[];
  private readonly dispatched = new Set<string>();
  private readonly now: () => number;
  private readonly opts: DriverOptions;
  private readonly def: FlowDefinition;

  /**
   * Validates the definition IN FULL before anything is queued (ADR 0002 rule 3),
   * mirroring `addTasks` rejecting a whole batch up front. A typo must not become
   * a routing failure discovered on the one workload that takes that branch.
   */
  constructor(definition: FlowDefinition, opts: DriverOptions) {
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

    for (const name of SETTLEMENT_EVENTS) {
      // ADR 0007 rule 1: the normalization happens HERE, synchronously, while the
      // listener runs. Nothing downstream ever sees `e.detail`.
      opts.scheduler.addEventListener(name, (e) => this.onEvent(name, e.detail as TaskDetailLike));
    }
  }

  /** `ID-R2` — the half `FD-V16` cannot check. Then dispatch the entry node. */
  start(runId: string, payload: unknown): void {
    assertRunId(runId);
    this.enter(runId, this.def.entry, payload);
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
    this.log.push({
      kind: 'resolution',
      taskId,
      resolvedAs,
      result: resolvedAs === 'done' ? structuredClone(value.result ?? null) : null,
      error: resolvedAs === 'failed' ? (value.error ?? 'resolved as failed') : null,
      actor: value.actor,
      observedAt: this.now(),
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
    const record = normalizeEvent(name, detail, this.now());
    if (!record) return; // OR-R3/OR-R4: this event writes nothing
    this.log.push(record);

    const { runId, nodeId, branchPath } = parseTaskId(record.taskId);
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

    const result = selectEdge(node, runId, outcome.terminalState, { outcome }, this.opts.predicates);
    if (result.taken === null) {
      // No edge opts into this state. The path ends — declared by omission.
      const region = this.regionOf(nodeId);
      if (region) {
        this.emit({ type: 'branch.lost', regionId: region.fanoutId, branchPath, reason: 'failed' });
      }
      return;
    }
    this.enter(runId, result.taken.to, outcome.result, branchPath);
  }

  /**
   * Walk into a node. `fanout`, `join` and `end` dispatch nothing and are passed
   * through within this turn; only a `task` becomes a scheduler task.
   */
  private enter(runId: string, nodeId: string, payload: unknown, fromBranch = '-'): void {
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
        region.branches.forEach((_b, i) => {
          this.emit({ type: 'branch.opened', regionId: region.fanoutId, branchPath: String(i) });
        });
        region.branches.forEach((b, i) => this.enter(runId, b, payload, String(i)));
        return;
      }

      case 'join': {
        // The driver reports arrival. Whether the join is SATISFIED is a policy's
        // answer (W2) and which policy is right is W4's — deliberately not decided here.
        const region = this.regions.find((r) => r.joinId === nodeId);
        if (region) this.emit({ type: 'branch.arrived', regionId: region.fanoutId, branchPath: fromBranch });
        return;
      }

      case 'end': {
        const region = this.regionOf(nodeId);
        if (region && fromBranch !== '-') {
          // NOT "left the region" — the `end` is inside region(F). The condition is
          // "reached a node of kind `end`", which is local and computable.
          this.emit({ type: 'branch.exited', regionId: region.fanoutId, branchPath: fromBranch, at: nodeId });
        }
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

  private emit(e: RegionEvent): void {
    this.opts.onRegionEvent?.(e);
  }

  /**
   * A frozen copy for tests and for W2's fold. The array is copied and each record
   * frozen, so neither the sequence nor a record can be edited from outside —
   * which is what `OR-R7` and `RS-R1` both assume.
   */
  snapshot(): readonly LogRecord[] {
    return Object.freeze(this.log.map((r) => Object.freeze({ ...r }))) as readonly LogRecord[];
  }

  /** Task ids dispatched in this driver, for `ID-R1`'s assertion. */
  dispatchedIds(): readonly string[] {
    return [...this.dispatched];
  }

  /** Copied, never the stored record by reference — `effectiveOutcome` returns the settlement itself when there is no resolution. */
  effectiveOutcomeOf(taskId: string): OutcomeRecord | null {
    const o = effectiveOutcome(this.log, taskId);
    return o === null ? null : { ...o };
  }

  terminalStateOf(taskId: string): TerminalState | null {
    return this.effectiveOutcomeOf(taskId)?.terminalState ?? null;
  }
}
