/**
 * **The ORACLE — the fold as it was before W194**, kept so the accumulator has something to be equal to that is not
 * itself (`doc/workflow.md` section 5 rule 4).
 * [W194](../../doc/work-items/w194-the-fold-is-one-accumulator.md), P39 decision 3,
 * [ADR 0120](../../doc/decisions/0120-the-fold-is-one-accumulator-and-step-stays-pure.md).
 *
 * **Lines 455-833 of `src/fold/run-state.ts` at `c1aefb0`, VERBATIM** — `emptyState` through `foldLog`, comments and all —
 * written by a script that slices that commit's file and checks both ends, so nothing here was retyped. The types are
 * imported from the live module: they are the contract, unchanged by W194 (P39 decision 5), and not behaviour.
 * `withOutcome` is exported by the LAST line, which is the only line this file adds below the import block.
 *
 * **NEVER EDITED AGAIN.** A change here is a change to what W194 proved equal; a fold that must behave differently
 * changes the spec, the new code and its own tests — and this file is then retired, not updated.
 *
 * Not a suite: its name does not end `.test.ts`, so the runner's glob does not load it on its own.
 */
import type { BranchSettlement, FoldInput, GateDecision, RegionRun, RunState } from '../../src/fold/run-state.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { LogRecord } from '../../src/driver/log.ts';
import { parseTaskId } from '../../src/driver/ids.ts';

export function emptyState(): RunState {
  return {
    runId: null, outcome: 'running', nodes: {}, regions: {}, pathEnds: [], haltedBy: null, cancelRequest: null, interruption: null,
    paused: false, resumes: [], gated: [],
  };
}

/**
 * One step. **Returns a new state; never mutates the one it was given** — which is
 * what lets `RN-R2` hold (folding a prefix then one more record equals folding the
 * whole) and what makes a fold usable while a run is still going.
 */
export function step(prev: RunState, input: FoldInput): RunState {
  // `RN-R8` and ADR 0102 rule 3, the DUAL READ: a stored `{ kind: 'stopped', reason }` is 0.7.0's name for this element,
  // read here and written nowhere. Not in `FoldInput`, so the comparison goes through `string` — without it a 0.7.0 log
  // of a halted run fell through to `input.record` below and THREW (P34 fact 7 (iii)).
  if (input.kind === 'halted' || (input.kind as string) === 'stopped') {
    return { ...prev, haltedBy: (input as { reason: string }).reason, outcome: 'halted' };
  }

  if (input.kind === 'cancelRequested') {
    // `RN-R30` — the FIRST request is the run's, and one folded after the run is already `cancelled` — by `RN-R28`'s
    // cancel or an earlier request — moves NOTHING and is not recorded: the run ended before it (the driver refuses that
    // call, `RN-R31`). Without this a hand-written `RN-R28` cancel followed by a request over a still-running task read
    // `cancelling`: a terminal run made unfinished again, against (h)'s `cancelled` > `cancelling`.
    if (prev.cancelRequest !== null || prev.outcome === 'cancelled') return prev;
    return withOutcome({ ...prev, cancelRequest: { actor: input.actor, reason: input.reason } });
  }

  if (input.kind === 'interrupted') {
    // `RN-R32` — the stop is recorded until a `resumed` element ends it; one folded while a stop is already current moves
    // nothing (the driver appends one per stop: a second call appends nothing, `RN-R33`).
    if (prev.interruption !== null) return prev;
    return withOutcome({ ...prev, interruption: { actor: input.actor, reason: input.reason } });
  }

  if (input.kind === 'paused' || input.kind === 'unpaused') {
    // `RN-R34` — the pause is a FLAG and moves nothing else: no outcome is recomputed, because a held dispatch is a
    // `dispatched` element and already reads `running` (P34 (e), fact 3). One that would not change the flag — a second
    // `paused`, an `unpaused` of a run not paused, neither of which the driver appends (`RN-R35`) — moves nothing.
    const paused = input.kind === 'paused';
    if (prev.paused === paused) return prev;
    return { ...prev, paused };
  }

  if (input.kind === 'region') {
    return withOutcome(applyRegion(prev, input.event));
  }

  if (input.kind === 'dispatched') {
    const { runId, nodeId, branchPath, attempt } = parseTaskId(input.taskId);
    // A dispatch that arrives for a task already settled is ignored rather than
    // resurrecting it: `ID-R1` refuses a duplicate dispatch before it reaches the
    // scheduler, so this can only be a malformed input sequence.
    if (prev.nodes[input.taskId]) return prev;
    // `RN-R41` — the attribution from the id, and no attempt yet: the scheduler has not started one.
    return withOutcome({
      ...prev,
      runId: prev.runId ?? runId,
      nodes: {
        ...prev.nodes,
        [input.taskId]: { runId, nodeId, branchPath, flowAttempt: attempt, attemptNumber: null, state: 'running', result: null, error: null },
      },
    });
  }

  if (input.kind === 'asked') {
    // `RN-R36` — the node is `suspended` from its `asked` element, with what reached it KEPT as `input` (P35 (c), (f)):
    // `awaiting_action` then follows from `RN-R7` with no precedence moved (P35 fact 3). A COPY of the input, because
    // `step` never shares a value it was handed with the state it returns (`RN-R2`). An `asked` for a task already in
    // `nodes` is ignored rather than re-parking it — `dispatched`'s rule: the driver mints an ask's id once per path.
    // `RN-R41`: an ask is never handed to a scheduler, so its `attemptNumber` is `null` and stays so.
    const { runId, nodeId, branchPath, attempt } = parseTaskId(input.taskId);
    if (prev.nodes[input.taskId]) return prev;
    return withOutcome({
      ...prev,
      runId: prev.runId ?? runId,
      nodes: {
        ...prev.nodes,
        [input.taskId]: {
          runId, nodeId, branchPath, flowAttempt: attempt, attemptNumber: null,
          state: 'suspended', result: null, error: null, input: structuredClone(input.input),
        },
      },
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
    if (prev.regions[input.regionId]?.[input.regionPath]) return prev;
    return withOutcome({
      ...prev,
      regions: withRegion(prev.regions, input.regionId, input.regionPath, emptyRegion()),
    });
  }

  if (input.kind === 'resumed') {
    // `RN-R22` — recorded, and nothing else moves: the ids were dispatched before and are still
    // `running`, so `outcome` is untouched and `withOutcome` has nothing to recompute. A COPY of the
    // list, because `step` never shares a value it was handed with the state it returns (`RN-R2`).
    // **v0.19 — and it ENDS an interruption** (`RN-R22`, `RN-R32`): the run stopped on one runtime is running again on
    // this one, so `interruption` is `null` again and the outcome is what the nodes say — recomputed only then, so a
    // resume of a run nobody stopped moves nothing but `resumes`, as before.
    const resumes = [...prev.resumes, [...input.taskIds]];
    if (prev.interruption !== null) return withOutcome({ ...prev, interruption: null, resumes });
    return { ...prev, resumes };
  }

  if (input.kind === 'gated') {
    // `RN-R26` — recorded, and nothing else moves: a gate dispatches nothing and settles nothing, so no node,
    // no region and no outcome is touched here — what the route LED to arrives as its own inputs. A COPY of
    // the decision, and of its key, because `step` never shares a value it was handed with the state it
    // returns (`RN-R2`) and a key may be an object. **Without this arm the fold THREW** — every kind `step`
    // does not name reaches `input.record` below, measured at W93's declaration step as a `TypeError`.
    const d: GateDecision = { gateId: input.gateId, branchPath: input.branchPath, route: input.route };
    if (input.key !== undefined) d.key = structuredClone(input.key);
    return { ...prev, gated: [...prev.gated, d] };
  }

  if (input.kind === 'attempted') {
    // `RN-R40` — recorded in the INPUT sequence; what it changes for a resume (`RN-R21`) the driver reads off its own
    // sequence. **v0.27 (`RN-R41`, W187): and the task's `NodeRun.attemptNumber` is the number it carries** — the latest
    // element's, which the driver appends only when the number RISES. Nothing else moves: no state, no outcome, so
    // `withOutcome` has nothing to recompute. One for a task not in `nodes` — never appended by a driver, which records only
    // its own dispatched tasks — moves nothing. *Without this arm the fold THREW* — every kind `step` does not name reaches
    // `input.record` below (W93's measurement, `gated`'s precedent).
    const node = prev.nodes[input.taskId];
    if (node === undefined) return prev;
    return { ...prev, nodes: { ...prev.nodes, [input.taskId]: { ...node, attemptNumber: input.attemptNumber } } };
  }

  if (input.kind === 'joinSettled') {
    const cur = prev.regions[input.regionId]?.[input.regionPath] ?? emptyRegion();
    return withOutcome({
      ...prev,
      regions: withRegion(prev.regions, input.regionId, input.regionPath, { ...cur, joined: input.fired }),
    });
  }

  const r = input.record;
  const { runId, nodeId, branchPath, attempt } = parseTaskId(r.taskId);
  const nodes = { ...prev.nodes };
  const existing = nodes[r.taskId];
  // `RN-R41` — a settlement or a resolution KEEPS the attempt number the entry already carried: it comes from `attempted`
  // elements alone, never from the record's `attempts` (a log written before 0.8.0 reads `null` throughout).
  const attemptNumber = existing?.attemptNumber ?? null;

  if (r.kind === 'outcome') {
    nodes[r.taskId] = {
      runId,
      nodeId,
      branchPath,
      flowAttempt: attempt,
      attemptNumber,
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
    // **v0.22: an ASK's `input` is KEPT through its answer** (`RN-R36`, P35 (f)) — what the person was shown is still
    // what reached the node — so an answered ask differs from a resolved task in `nodes` by that one key and nothing
    // else. It is the existing entry's own copy, made by the `asked` arm, and no one else holds it.
    nodes[r.taskId] = {
      runId: existing?.runId ?? runId,
      nodeId: existing?.nodeId ?? nodeId,
      branchPath: existing?.branchPath ?? branchPath,
      flowAttempt: existing?.flowAttempt ?? attempt,
      attemptNumber,
      state: r.resolvedAs,
      result: r.result,
      error: r.error,
      ...(existing !== undefined && 'input' in existing ? { input: existing.input } : {}),
    };
  }

  return withOutcome({ ...prev, runId: prev.runId ?? runId, nodes });
}

function emptyRegion(): RegionRun {
  return { opened: [], settled: {}, suspended: [], joined: null };
}

/**
 * **One region instance replaced, with the outer level copied rather than
 * mutated** — `step` returns a new state and never touches the one it was given
 * (`RN-R2`), and a two-level record has two levels to copy. Written once so the
 * three arms that write a region cannot disagree about which of them they copy.
 */
function withRegion(
  regions: Record<string, Record<string, RegionRun>>,
  regionId: string,
  regionPath: string,
  run: RegionRun,
): Record<string, Record<string, RegionRun>> {
  return { ...regions, [regionId]: { ...regions[regionId], [regionPath]: run } };
}

/**
 * **Every region INSTANCE in the state, flattened.**
 *
 * `RN-R10` and the nothing-yet guard both quantify over region **instances** and
 * not over openers: with `regions` two-level since W84, one opener can carry N of
 * them and a walk over `Object.values(s.regions)` would be iterating the inner
 * RECORDS rather than the runs. The flatten lives here, once, so the two walks
 * cannot drift — which is the shape `src/definition/regions.ts`'s own header
 * gives for the four set definitions, and for the same reason.
 */
function allRegionRuns(s: RunState): RegionRun[] {
  return Object.values(s.regions).flatMap((byPath) => Object.values(byPath));
}

function applyRegion(prev: RunState, e: RegionEvent): RunState {
  const at = prev.regions[e.regionId]?.[e.regionPath];
  const cur: RegionRun = at
    ? { ...at, opened: [...at.opened], settled: { ...at.settled }, suspended: [...at.suspended] }
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
  return { ...prev, regions: withRegion(prev.regions, e.regionId, e.regionPath, cur) };
}

/** Section 3's precedence, in one place so `RN-R7`, `RN-R8` and `RN-R28` cannot disagree with each other. */
function withOutcome(s: RunState): RunState {
  // `RN-R8` — a run a refusal terminated is `halted` whatever its nodes say,
  // because the log after that point is incomplete by construction.
  if (s.haltedBy !== null) return { ...s, outcome: 'halted' };
  const nodes = Object.values(s.nodes);

  // `RN-R28` — a run a task of which settled `cancelled` is `cancelled`, below `halted` and above everything
  // else (ADR 0094 rule 3, W158). Below `halted` because a refusal is a defect and must not hide behind an
  // owner's choice; above `awaiting_action` because a parked task must not make a cancelled run read as waiting
  // for a person — the driver refuses its `resolve()` — and above `running` and `stuck` because the driver has
  // halted it: what is still in flight settles into `nodes` and moves nothing else, and a join it left waiting
  // will never fire, which is the run's cancel and not a defect `stuck` would report.
  //
  // **v0.18: only where no cancel was REQUESTED** (`RN-R28`, ADR 0104). After a `cancelRequested` element a `cancelled`
  // settlement is the request's own, and the run's outcome is `RN-R30`'s below — or `done` would settle at the FIRST
  // cancel of a run its owner cancelled, which is the app's #1 complaint (P34 fact 6). The step arm above keeps a
  // request from being recorded once this has fired, so the two cannot both apply.
  if (s.cancelRequest === null && nodes.some((n) => n.state === 'cancelled')) return { ...s, outcome: 'cancelled' };

  // `RN-R30` — a run its OWNER cancelled is `cancelling` while a dispatched task is still unsettled, and `cancelled` once
  // none is (P34 (c), (h)). Below `halted` and the line above; ABOVE `awaiting_action`, so a parked task — settled
  // already, and not waited on (P34 (i)) — never makes a run its owner ended read as waiting for a person; and above
  // `stuck`, `failed` and `completed`, so a join the cancel left waiting is the owner's act, not a defect.
  if (s.cancelRequest !== null) {
    return { ...s, outcome: nodes.some((n) => n.state === 'running') ? 'cancelling' : 'cancelled' };
  }

  // `RN-R32` — a run its OWNER stopped is `interrupted` until a `resumed` element ends it (P34 (d), (h)). Below every
  // cancel above, so a run its owner cancelled never reads resumable; ABOVE `awaiting_action`, so a parked task — whose
  // `resolve()` the stopped driver refuses — does not make it read as waiting for a person here; and above `running`,
  // because the tasks the stop cancelled stay `running` in `nodes` by construction (the driver went deaf first): they
  // are the in-flight set the resume re-dispatches, not live work on this runtime. Above `stuck`, `failed` and
  // `completed` too: a join the stop left waiting is the owner's act, resumed elsewhere.
  if (s.interruption !== null) return { ...s, outcome: 'interrupted' };

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
  // is neither `running` nor `awaiting_action` (nor, since v0.18, `cancelling`) — so a clock-free L6 harness waits on
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
  const openedNothing = allRegionRuns(s).some((r) => r.opened.length === 0 && r.joined !== true);
  if (nodes.length === 0 && s.pathEnds.length === 0 && !openedNothing) {
    return { ...s, outcome: 'running' };
  }

  // `RN-R10` — **`stuck` outranks `failed` and `completed`, and only those two.**
  //
  // Nothing is live and nothing waits on a person, so no further input can
  // arrive; if a region's join has not fired, nothing downstream of it ever will.
  // v0.2 reported that run as `completed`, which is the false statement
  // [Q43](../../doc/questions/q43.md) records and W5 measured on a real
  // scheduler.
  //
  // It sits BELOW `awaiting_action` and `running` because both mean the run can
  // still move — a suspended branch keeps its join legitimately waiting, which is
  // the whole of `branch.suspended`'s reason for existing. It sits ABOVE `failed`
  // because `failed` is a flow outcome an author asked for (a path ended with no
  // eligible edge) while this is a defect nobody asked for: reporting `failed`
  // would name a cause and hide that the run is not going to terminate.
  if (allRegionRuns(s).some((r) => r.joined !== true)) return { ...s, outcome: 'stuck' };

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

export { withOutcome as oracleWithOutcome };
