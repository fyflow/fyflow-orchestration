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

/**
 * `spec/run-state.md` section 4. Four, not five.
 *
 * `user_action` is `suspended` here — it is not terminal at flow level. And there
 * is **no `pending`**: `OR-R4` says `task.running` writes no record, so the only
 * signal the fold has is the dispatch itself, and a task is `running` from that
 * moment. A state nothing can produce is not a state.
 */
export type NodeState = 'running' | 'done' | 'failed' | 'suspended';

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
  /** How each path ended, in order. What separates `completed` from `failed`. */
  pathEnds: { reason: 'end' | 'no-eligible-edge'; at: string }[];
  /** Set when a refusal terminated the run (`OR-R10`, `RN-R8`). */
  stoppedBy: string | null;
}

/**
 * There is no `flowId` and no `regions[*].joinId`, and both were in the first
 * draft of `spec/run-state.md`. **Neither is derivable from the fold's input** —
 * no record carries a flow id and `RegionEvent` carries only `regionId` — so
 * either they came from outside, which `RN-R4` forbids, or they were `''`
 * forever, which the first implementation did. The spec now says so rather than
 * the code quietly dropping them; a caller that wants either reads the definition,
 * which is where they live.
 */

/**
 * What the fold consumes: the log, plus the facts the driver knows while routing
 * that no log record carries.
 *
 * **`dispatched` and `pathEnded` are here because `spec/run-state.md` section 3 is
 * not derivable without them**, and the conformity pass found the first version of
 * this file quietly narrowing the spec instead of saying so:
 *
 *   - Without `dispatched`, a task in flight is invisible. `nodes` would hold only
 *     *settled* tasks where section 2 says *dispatched*, the `running` outcome
 *     would be unreachable, and `RN-R7` — *"`awaiting_action` outranks `running`"*
 *     — would be **unfalsifiable**, because no state could hold both a suspended
 *     node and a live one.
 *   - Without `pathEnded`, `completed` (*"at least one `end` was reached"*) and
 *     `failed` (*"a path ended with no eligible edge"*) are not distinguishable.
 *     Substituting *"some node settled failed"* mislabels
 *     `spec/examples/valid/failure-edge.flow.json`, where an `optional` node fails
 *     and **routes on** to an `end` — a run section 3 calls `completed`.
 *
 * Neither is a log record, and neither belongs in one: `spec/outcome-record.md`
 * section 1 fixes the log at two kinds. This is the fold's input sequence, which
 * already carried region events and a stop for the same reason.
 */
export type FoldInput =
  | { kind: 'outcome' | 'resolution'; record: LogRecord }
  | { kind: 'region'; event: RegionEvent }
  | { kind: 'dispatched'; taskId: string }
  | { kind: 'pathEnded'; reason: 'end' | 'no-eligible-edge'; at: string }
  | { kind: 'stopped'; reason: string };

export function emptyState(): RunState {
  return { runId: null, outcome: 'running', nodes: {}, regions: {}, pathEnds: [], stoppedBy: null };
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

  if (input.kind === 'dispatched') {
    const { runId, nodeId, branchPath } = parseTaskId(input.taskId);
    // A dispatch that arrives for a task already settled is ignored rather than
    // resurrecting it: `ID-R1` refuses a duplicate dispatch before it reaches the
    // scheduler, so this can only be a malformed input sequence.
    if (prev.nodes[input.taskId]) return prev;
    return withOutcome({
      ...prev,
      runId: prev.runId ?? runId,
      nodes: { ...prev.nodes, [input.taskId]: { nodeId, branchPath, state: 'running', result: null, error: null } },
    });
  }

  if (input.kind === 'pathEnded') {
    return withOutcome({ ...prev, pathEnds: [...prev.pathEnds, { reason: input.reason, at: input.at }] });
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
    : { opened: [], settled: {}, suspended: [] };

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
  // `RN-R8` — a run a refusal terminated is `stopped` whatever its nodes say,
  // because the log after that point is incomplete by construction.
  if (s.stoppedBy !== null) return { ...s, outcome: 'stopped' };
  const nodes = Object.values(s.nodes);

  // `RN-R7` — `awaiting_action` outranks `running`: the thing a reader must know
  // is that a human is needed, not that other work continues.
  if (nodes.some((n) => n.state === 'suspended')) return { ...s, outcome: 'awaiting_action' };
  if (nodes.some((n) => n.state === 'running')) return { ...s, outcome: 'running' };
  if (nodes.length === 0 && s.pathEnds.length === 0) return { ...s, outcome: 'running' };

  // Section 3's own words, and not "some node settled failed" — which is a
  // different proposition, and mislabels a failed node that ROUTED ON through an
  // `on: ["failed"]` edge to an `end`.
  if (s.pathEnds.some((e) => e.reason === 'no-eligible-edge')) return { ...s, outcome: 'failed' };
  if (s.pathEnds.some((e) => e.reason === 'end')) return { ...s, outcome: 'completed' };

  // Every node settled and no path end was reported: the input sequence carried
  // no `pathEnded`, so fall back to the node states rather than inventing one.
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

/** A node's entry, or `null`. Not an outcome record: it has no `attempts` and no timing fields. */
export function nodeOf(s: RunState, taskId: string): NodeRun | null {
  return s.nodes[taskId] ?? null;
}

export type { OutcomeRecord };
