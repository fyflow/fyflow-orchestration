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

/**
 * `spec/run-state.md` section 3. Closed, and ours — an author labels why a path
 * ended, not what the run is.
 *
 * **`stuck` is v0.3's sixth**, added by W5 under
 * [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md):
 * nothing is live, nothing waits on a person, and a region's join has not fired,
 * so nothing will ever move again. v0.2 called that run **`completed`**.
 */
export type RunOutcome =
  | 'running' | 'completed' | 'failed' | 'awaiting_action' | 'stopped' | 'stuck';

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
  /**
   * Whether the driver **routed out of this region's join** — `true` fired,
   * `false` the join was reported unsatisfiable and never will, `null` neither
   * yet ([ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)).
   *
   * **This is a routing fact, not a policy's conclusion**, so `RN-R6` still holds:
   * two policies over the same region events produce the same `opened`,
   * `settled` and `suspended`, and differ here because they made the driver *do*
   * different things. It exists because they otherwise did not differ at all —
   * on `p1-routed-away` every branch settles under both policies, so `settled` is
   * `{ "0": "arrived", "1": "exited" }` either way and a stuck run was
   * indistinguishable from a completed one.
   */
  joined: boolean | null;
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
 *
 * **`joinSettled` is W5's, and it is the third fact of this shape**
 * ([ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)):
 * without it `completed` and `stuck` are the same fold, because on
 * `p1-routed-away` both policies settle every branch and differ only in whether
 * the driver routed out of the join.
 *
 * **`Driver.foldInputs()` is what produces this sequence** — ADR 0014, and
 * [Q41](../../doc/open-questions.md). Until W5 nothing did, and `pathEnded` in
 * particular had no producer anywhere.
 */
export type FoldInput =
  | { kind: 'outcome' | 'resolution'; record: LogRecord }
  | { kind: 'region'; event: RegionEvent }
  /**
   * **A region was ENTERED** - the driver called `open` on the join policy for it.
   * [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md).
   *
   * **This closes a gap `spec/run-state.md` already declared and nothing
   * implemented.** That document's shape says `regions` holds *"one entry per
   * fan-out region ENTERED"*, and until v0.8 the only producer of an entry was a
   * region EVENT - so *entered* and *opened at least one branch* were the same
   * thing, because `FD-V9`'s arity floor makes a `fanout` open at least two.
   *
   * **A `map` separates them**, and the separation is not cosmetic. Measured: a map
   * over an empty list opens no branch, emits no region event, appends nothing -
   * `regions` is `{}`, `RN-R10` iterates nothing, and the run reports
   * **`completed`** having reached no `end` node, through `withOutcome`'s final
   * fall-back rather than by any positive determination. That is character for
   * character the false statement
   * [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)
   * exists to remove.
   *
   * **Emitted for EVERY region, not only for a map**, so the invariant has one
   * mechanism rather than two that could drift. Measured: it changes no field of
   * `RunState` on any corpus flow, because every region that exists today emits at
   * least one `branch.opened` and so already had its entry - the sequence gains an
   * input and the state gains nothing.
   *
   * It carries no verdict. `joined` stays `null` until a `joinSettled` says
   * otherwise, which is `RN-R11` untouched.
   */
  | { kind: 'regionEntered'; regionId: string }
  | { kind: 'dispatched'; taskId: string }
  | { kind: 'pathEnded'; reason: 'end' | 'no-eligible-edge'; at: string }
  | { kind: 'joinSettled'; regionId: string; joinId: string; fired: boolean }
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

  if (input.kind === 'regionEntered') {
    // Idempotent, and the early return above is what makes it so: a region already
    // carrying events keeps them. Nothing here can move `joined`, `opened`,
    // `settled` or `suspended` - it only makes the region PRESENT, which is the
    // whole of what "entered" adds.
    //
    // *(This read "`??` is what makes it so" and there is no `??` in the arm - the
    // behaviour is right and the explanation pointed at a line that does not exist.
    // W33's conformity reader.)*
    if (prev.regions[input.regionId]) return prev;
    return withOutcome({
      ...prev,
      regions: { ...prev.regions, [input.regionId]: emptyRegion() },
    });
  }

  if (input.kind === 'joinSettled') {
    const cur = prev.regions[input.regionId] ?? emptyRegion();
    return withOutcome({
      ...prev,
      regions: { ...prev.regions, [input.regionId]: { ...cur, joined: input.fired } },
    });
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

function emptyRegion(): RegionRun {
  return { opened: [], settled: {}, suspended: [], joined: null };
}

function applyRegion(prev: RunState, e: RegionEvent): RunState {
  const regions = { ...prev.regions };
  const cur: RegionRun = regions[e.regionId]
    ? { ...regions[e.regionId]!, opened: [...regions[e.regionId]!.opened],
        settled: { ...regions[e.regionId]!.settled }, suspended: [...regions[e.regionId]!.suspended] }
    : emptyRegion();

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
  // **"Nothing has happened yet", and an ENTERED REGION is something happening** —
  // W33's adequacy reader. This read `nodes.length === 0 && pathEnds.length === 0`,
  // and a `map` at the **entry** node over an empty list satisfies both: no task is
  // ever dispatched and no path ends, so it returned `running` **before** `RN-R10`
  // could see a region that was entered and can never join.
  //
  // **Measured**: `entry: split`, `over: 'items'`, started with `{items: []}` —
  // `ids=[]`, `regions={split:{opened:[],joined:null}}`, `outcome=running`. Nothing
  // will ever arrive, and `RN-R12` says a run is finished exactly when its outcome
  // is neither `running` nor `awaiting_action` — so a clock-free L6 harness waits on
  // that run **forever** and a consumer polling `RunState.outcome` is told work is in
  // flight. That is `ADR 0015`'s own false statement wearing the other outcome.
  //
  // `map-fanout`'s N=0 case passed only because its `ingest` task put one node in
  // `nodes` first, which is why every N=0 assertion in the repository missed it.
  // **The discriminator is whether a region OPENED anything, not whether one is
  // present**, and the first version of this fix got that wrong. `Object.keys(
  // s.regions).length === 0` turned the neighbouring guarantee red: a `fanout` at
  // the entry node emits every `branch.opened` **before** dispatching any (`JP-R5`),
  // so a prefix taken mid-burst legitimately holds a region with `joined: null` and
  // no nodes — and `test/fold/stuck.test.ts` pins that as `running` precisely
  // because an L6 harness would otherwise declare the run finished before it
  // started. That region has **opened** branches; a map of zero items has not.
  //
  // **The stated limit**: a prefix cut in the one-input window between
  // `regionEntered` and the first `branch.opened` reads as terminal here. `RN-R12`
  // claims its predicate at a **quiescent point** and not at every prefix — the
  // qualification the test beside that one calls load-bearing — so this is inside
  // what that rule already says, and it is recorded rather than left to be found.
  const openedNothing = Object.values(s.regions).some((r) => r.opened.length === 0 && r.joined !== true);
  if (nodes.length === 0 && s.pathEnds.length === 0 && !openedNothing) {
    return { ...s, outcome: 'running' };
  }

  // `RN-R10` — **`stuck` outranks `failed` and `completed`, and only those two.**
  //
  // Nothing is live and nothing waits on a person, so no further input can
  // arrive; if a region's join has not fired, nothing downstream of it ever will.
  // v0.2 reported that run as `completed`, which is the false statement
  // [Q43](../../doc/open-questions.md) records and W5 measured on a real
  // scheduler.
  //
  // It sits BELOW `awaiting_action` and `running` because both mean the run can
  // still move — a suspended branch keeps its join legitimately waiting, which is
  // the whole of `branch.suspended`'s reason for existing. It sits ABOVE `failed`
  // because `failed` is a flow outcome an author asked for (a path ended with no
  // eligible edge) while this is a defect nobody asked for: reporting `failed`
  // would name a cause and hide that the run is not going to terminate.
  if (Object.values(s.regions).some((r) => r.joined !== true)) return { ...s, outcome: 'stuck' };

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

/**
 * Whether a run can still change — the predicate an L6 harness resolves on, and
 * the reason it needs no clock.
 *
 * `running` and `awaiting_action` are the two outcomes that say more input is
 * coming: a dispatched node has not settled, or a person has not answered. Every
 * other outcome is reached only when nothing is live, so the sequence is
 * finished. **This is `stuck`'s point:** before
 * [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)
 * a permanently stuck run was `completed`, so a harness waiting on this predicate
 * would have reported the hang as a success rather than waiting forever — which
 * is the worse of the two failures.
 */
export function isTerminal(s: RunState): boolean {
  return s.outcome !== 'running' && s.outcome !== 'awaiting_action';
}

/** A node's entry, or `null`. Not an outcome record: it has no `attempts` and no timing fields. */
export function nodeOf(s: RunState, taskId: string): NodeRun | null {
  return s.nodes[taskId] ?? null;
}

export type { OutcomeRecord };
