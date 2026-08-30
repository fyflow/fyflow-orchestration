/**
 * Run state, and the fold that produces it — `spec/run-state.md`.
 *
 * **Pure.** `fold(log)` reads nothing but `log`: no clock, no scheduler, no IO,
 * no module-level mutation, no memoisation across calls (`RN-R1`). That is what
 * ladder L3 checks by folding the same log twice and deep-comparing, and it is
 * what makes [Q14](../../doc/open-questions.md)'s answer an answer rather than a
 * restated leaning.
 */
import type { LogRecord, OutcomeRecord } from '../driver/log.ts';
import type { RegionEvent } from '../driver/events.ts';
import { parseTaskId } from '../driver/ids.ts';

/** `spec/run-state.md` section 4. `user_action` is `suspended` here — it is not terminal at flow level. */
export type NodeState = 'pending' | 'running' | 'done' | 'failed' | 'suspended';

/** `spec/run-state.md` section 3. Closed, and ours — an author labels why a path ended, not what the run is. */
export type RunOutcome = 'running' | 'completed' | 'failed' | 'awaiting_action' | 'stopped';

/** How a branch left its region. `null` while it is still live. */
export type BranchSettlement = 'arrived' | 'exited' | 'lost';

export interface NodeRun {
  nodeId: string;
  /** `'-'` when the node is in no fan-out region. */
  branchPath: string;
  state: NodeState;
  result: unknown;
  error: string | null;
}

export interface RegionRun {
  joinId: string;
  /** Branch paths opened, in the order the driver emitted them (`JP-R5`). */
  opened: string[];
  /** Per branch path, how it left. A branch still live has no entry. */
  settled: Record<string, BranchSettlement>;
  /** Branch paths currently suspended — live, but waiting on a person. */
  suspended: string[];
}

export interface RunState {
  runId: string | null;
  outcome: RunOutcome;
  /** Keyed by **task id**, not node id (`RN-R5`): one entry per branch of a fan-out. */
  nodes: Record<string, NodeRun>;
  /** Keyed by fanout id, one entry per region entered. */
  regions: Record<string, RegionRun>;
  /** Set when a refusal terminated the run (`OR-R10`, `RN-R8`). */
  stoppedBy: string | null;
}

/** What the fold consumes: the log, plus the region events the driver derived while routing. */
export type FoldInput =
  | { kind: 'outcome' | 'resolution'; record: LogRecord }
  | { kind: 'region'; event: RegionEvent }
  | { kind: 'stopped'; reason: string };

export function emptyState(): RunState {
  return { runId: null, outcome: 'running', nodes: {}, regions: {}, stoppedBy: null };
}

/**
 * One step. **Returns a new state; never mutates the one it was given** — which is
 * what lets `RN-R2` hold (folding a prefix then one more record equals folding the
 * whole) and what makes a fold usable while a run is still going.
 */
export function step(prev: RunState, input: FoldInput): RunState {
  if (input.kind === 'stopped') {
    return { ...prev, stoppedBy: input.reason, outcome: 'stopped' };
  }

  if (input.kind === 'region') {
    return withOutcome(applyRegion(prev, input.event));
  }

  const r = input.record;
  const { runId, nodeId, branchPath } = parseTaskId(r.taskId);
  const nodes = { ...prev.nodes };
  const existing = nodes[r.taskId];

  if (r.kind === 'outcome') {
    nodes[r.taskId] = {
      nodeId,
      branchPath,
      // `user_action` is `suspended` at flow level: a resolution resumes it, and
      // calling it terminal is what makes a design drop the fifth state.
      state: r.terminalState === 'user_action' ? 'suspended' : r.terminalState,
      result: r.result,
      error: r.error,
    };
  } else {
    // `RN-R9` — a resolved node is indistinguishable from one that settled that
    // way, which is `RS-R3`'s promise kept one layer up. The values come from the
    // effective outcome's rule: the resolution replaces state, result and error.
    nodes[r.taskId] = {
      nodeId: existing?.nodeId ?? nodeId,
      branchPath: existing?.branchPath ?? branchPath,
      state: r.resolvedAs,
      result: r.result,
      error: r.error,
    };
  }

  return withOutcome({ ...prev, runId: prev.runId ?? runId, nodes });
}

function applyRegion(prev: RunState, e: RegionEvent): RunState {
  const regions = { ...prev.regions };
  const cur: RegionRun = regions[e.regionId]
    ? { ...regions[e.regionId]!, opened: [...regions[e.regionId]!.opened],
        settled: { ...regions[e.regionId]!.settled }, suspended: [...regions[e.regionId]!.suspended] }
    : { joinId: '', opened: [], settled: {}, suspended: [] };

  switch (e.type) {
    case 'branch.opened':
      if (!cur.opened.includes(e.branchPath)) cur.opened.push(e.branchPath);
      break;
    case 'branch.arrived':
    case 'branch.exited':
    case 'branch.lost': {
      // `RN-R6` — what HAPPENED, not what a policy concluded. Two policies folded
      // over one log produce the same `regions`; they differ only in whether the
      // join fired, which is a routing fact and shows up in `nodes`.
      const how: BranchSettlement =
        e.type === 'branch.arrived' ? 'arrived' : e.type === 'branch.exited' ? 'exited' : 'lost';
      cur.settled[e.branchPath] = how;
      cur.suspended = cur.suspended.filter((b) => b !== e.branchPath);
      break;
    }
    case 'branch.suspended':
      if (!cur.suspended.includes(e.branchPath)) cur.suspended.push(e.branchPath);
      break;
    case 'branch.resumed':
      cur.suspended = cur.suspended.filter((b) => b !== e.branchPath);
      break;
  }
  regions[e.regionId] = cur;
  return { ...prev, regions };
}

/** Section 3's precedence, in one place so `RN-R7` and `RN-R8` cannot disagree with each other. */
function withOutcome(s: RunState): RunState {
  if (s.stoppedBy !== null) return { ...s, outcome: 'stopped' };
  const nodes = Object.values(s.nodes);

  // `RN-R7` — `awaiting_action` outranks `running`: the thing a reader must know
  // is that a human is needed, not that other work continues.
  if (nodes.some((n) => n.state === 'suspended')) return { ...s, outcome: 'awaiting_action' };
  if (nodes.some((n) => n.state === 'pending' || n.state === 'running')) {
    return { ...s, outcome: 'running' };
  }
  if (nodes.length === 0) return { ...s, outcome: 'running' };
  if (nodes.some((n) => n.state === 'failed')) return { ...s, outcome: 'failed' };
  return { ...s, outcome: 'completed' };
}

/**
 * The fold. `RN-R2`: total over any prefix, so `fold(log.slice(0, n))` is defined
 * for every `n` and `step(fold(prefix), next) === fold(prefix + next)`.
 *
 * `RN-R3`: read in **append order**, never sorted. Two settlements can share a
 * millisecond; `schedulerTimestamp` is the scheduler's clock and `observedAt` is
 * ours, and neither is a total order (`OR-R5`).
 */
export function fold(inputs: readonly FoldInput[]): RunState {
  let s = emptyState();
  for (const i of inputs) s = step(s, i);
  return s;
}

/** Convenience for a log with no region events — the shape most fixtures take. */
export function foldLog(log: readonly LogRecord[]): RunState {
  return fold(log.map((r) => ({ kind: r.kind, record: r }) as FoldInput));
}

/** The effective outcome of a task, as run state sees it. Derived, never stored (`OR-R8`). */
export function nodeOf(s: RunState, taskId: string): NodeRun | null {
  return s.nodes[taskId] ?? null;
}

export type { OutcomeRecord };
