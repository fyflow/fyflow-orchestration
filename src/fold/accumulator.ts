/**
 * **The fold's ONE definition** — `spec/run-state.md` `RN-R43`,
 * [ADR 0120](../../doc/decisions/0120-the-fold-is-one-accumulator-and-step-stays-pure.md),
 * [W194](../../doc/work-items/w194-the-fold-is-one-accumulator.md), P39 decisions 1-3, 5 and 6.
 *
 * An accumulator holds a run's state in a form one input can move in time proportional to what it TOUCHES, not to the
 * run: nodes and region instances in `Map`s, each instance's branch paths in a `Set` beside the list, and RUNNING COUNTS
 * of nodes per state, of region instances whose join has not fired, of those that opened nothing, and of path ends by
 * reason — so section 3's precedence is read off counts and never off a scan. It is mutated IN PLACE, within one call,
 * and MATERIALISED into a plain {@link RunState} at the end: `fold` applies every input to one accumulator and
 * materialises once, so its work is linear in its inputs; `step` loads the state it is handed, applies one input and
 * materialises, so its work is O(the state it is handed) — what a pure function from a plain `RunState` to a new one
 * costs (P39 decision 2).
 *
 * **Every arm here is the arm `src/fold/run-state.ts` held before W194, on ANY state it is handed** — not only on one a
 * fold can reach: the outcome is recomputed exactly where that arm recomputed it, and an arm that returned the state it
 * was handed reports `false` from {@link Accumulator.apply}, so `step` returns that same object. A hand-built state
 * whose `outcome` disagrees with its cells keeps that outcome across an arm that never recomputed it.
 *
 * **Lazy over what it was handed.** A loaded state is read through, never copied up front: a node, a region instance
 * or a list is copied only when an input touches it, a count is taken from the handed state only when an arm first
 * recomputes the outcome, and a cell no input touched is materialised as the handed state's own object — the sharing a
 * spread-per-step had, kept (`RN-R2`: the handed state is never mutated). *One narrowing* (C2): an instance a
 * `joinSettled` touches gets COPIES of its three lists, where the old `{ ...cur, joined }` kept the handed instance's —
 * less aliasing, never more.
 *
 * **The stated limit** (W194's conformity reader, C3): a REGION PATH that names an `Object.prototype` member — `constructor`, `toString` — is read from a `Map` here where the pre-v0.29 arm read it off a plain object and found the inherited member, so two such sequences differ (the old one threw, or kept a bare `{ joined }`). A region path is a branch path (`spec/task-id.md`), which no such name is, so no driver appends one.
 *
 * **What a materialised state shares.** With an INPUT: a settlement's `result`, by reference, as before (ADR 0058
 * consequence 3); an ask's `input` and a gate's `key` are deep copies taken once, when applied, as before. With the
 * ACCUMULATOR: its node entries, gate decisions, path ends, resume lists and the request records — objects the
 * accumulator REPLACES and never mutates, so a later `apply` never changes a state already materialised. A caller that
 * mutates a materialised state reaches those shared objects; nothing in this library keeps an accumulator open past a
 * call yet (W196 freezes what it hands out).
 *
 * **`RN-R1`: nothing survives a call and nothing is module state.** The {@link FoldCounter} is an ARGUMENT the caller
 * owns (P39 decision 6, fact 9); `fold` and `step` pass none. **Internal**: not re-exported by `index.ts` or any
 * published entry (P39 (c)).
 */
import type { RegionEvent } from '../driver/events.ts';
import { parseTaskId } from '../driver/ids.ts';
// A cycle by design and a safe one: `run-state.ts` calls into this module only from inside `fold` and `step`, and this
// module reads `emptyState` only from inside `foldWith` — neither at evaluation.
import { emptyState } from './run-state.ts';
import type { BranchSettlement, FoldInput, GateDecision, NodeRun, RegionRun, RunOutcome, RunState } from './run-state.ts';

/**
 * **A count of the work an accumulator did** — P39 decision 6 and stop-and-ask (e): one per input applied, and one per
 * entry, element or cell it reads or writes while loading, copying or materialising. Clock-free, so a ratio of two
 * counts is a property of the code and not of a machine (Q179). Owned by the caller; absent, nothing is counted.
 */
export interface FoldCounter {
  visits: number;
}

/** One region instance, held so an event costs O(1): the list and a `Set` beside it, `settled` in insertion order. */
interface RegionAcc {
  /** The instance this one was loaded from, or an empty one — its own keys are kept on materialisation, as a spread kept them. */
  origin: RegionRun;
  opened: string[];
  openedSet: Set<string>;
  settled: Map<string, BranchSettlement>;
  suspended: Suspended;
  joined: boolean | null;
}

/**
 * **`RegionRun.suspended` as an ordered list with O(1) add, remove and membership** — and with the array's own
 * semantics on a list that holds a path twice, which a `Set` would not keep: an add appends only when the path is
 * absent; a remove takes out EVERY occurrence. Each element carries the generation it was added in, and is live while
 * its path's current generation is that one.
 */
class Suspended {
  private items: { v: string; g: number }[] = [];
  private alive = new Map<string, number>();
  private gen = 0;
  private readonly count: (n: number) => void;
  constructor(from: ReadonlyArray<string>, count: (n: number) => void) {
    this.count = count;
    const g = ++this.gen;
    for (const v of from) {
      this.alive.set(v, g);
      this.items.push({ v, g });
    }
    count(from.length);
  }
  has(v: string): boolean {
    return this.alive.has(v);
  }
  add(v: string): void {
    if (this.alive.has(v)) return;
    const g = ++this.gen;
    this.alive.set(v, g);
    this.items.push({ v, g });
  }
  remove(v: string): void {
    this.alive.delete(v);
  }
  toArray(): string[] {
    this.count(this.items.length);
    const out: string[] = [];
    for (const e of this.items) if (this.alive.get(e.v) === e.g) out.push(e.v);
    return out;
  }
}

/** What one region instance contributes to section 3's two region counts. */
function regionWeight(opened: readonly string[], joined: unknown): { unjoined: number; openedNothing: number } {
  const unjoined = joined !== true ? 1 : 0;
  return { unjoined, openedNothing: opened.length === 0 && joined !== true ? 1 : 0 };
}

/** The counts section 3's precedence is read from — taken from a loaded state once, then kept by every write. */
interface Counts {
  /** Nodes per `state` value — `Object.values(nodes)` counted, so a hand-built state's unknown value is counted too. */
  byState: Map<unknown, number>;
  nodes: number;
  unjoined: number;
  openedNothing: number;
  noEligibleEdge: number;
  ends: number;
  pathEnds: number;
}

const hasOwn = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

/**
 * `o[k] = v` as an OWN data property, whatever `k` is — what a spread and a computed key (`{ ...o, [k]: v }`) created
 * before v0.29. An assignment of `'__proto__'` calls the prototype SETTER and creates no key, and FD-V16's id grammar
 * admits a node — so a region opener — named `__proto__` (W194's conformity reader, C1: the region vanished from `fold`
 * and `step` lost it again, turning a `stuck` run `completed`).
 */
function put<T>(o: Record<string, T>, k: string, v: T): void {
  if (k === '__proto__') Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true });
  else o[k] = v;
}

export class Accumulator {
  private runId: string | null;
  private outcome: RunOutcome;
  private haltedBy: string | null;
  private cancelRequest: RunState['cancelRequest'];
  private interruption: RunState['interruption'];
  private paused: boolean;
  /** Entries written since the load, by task id, in first-write order. A task id not here reads through to the base. */
  private readonly nodes = new Map<string, NodeRun>();
  /** Instances touched since the load, by opener and then by the opener's branch path, in first-touch order. */
  private readonly regions = new Map<string, Map<string, RegionAcc>>();
  private readonly pathEnds: RunState['pathEnds'] = [];
  private readonly resumes: string[][] = [];
  private readonly gated: GateDecision[] = [];
  private counts: Counts | null = null;

  private readonly base: RunState;
  private readonly counter: FoldCounter | undefined;

  private constructor(base: RunState, counter: FoldCounter | undefined) {
    this.base = base;
    this.counter = counter;
    this.runId = base.runId;
    this.outcome = base.outcome;
    this.haltedBy = base.haltedBy;
    this.cancelRequest = base.cancelRequest;
    this.interruption = base.interruption;
    this.paused = base.paused;
  }

  /** An accumulator over `state`, which it reads and never mutates. `counter`, when given, is charged for its work. */
  static load(state: RunState, counter?: FoldCounter): Accumulator {
    return new Accumulator(state, counter);
  }

  private tick(n = 1): void {
    if (this.counter !== undefined) this.counter.visits += n;
  }

  // --- reads, through to the base ---------------------------------------------------------------------------

  /** `prev.nodes[taskId]` — the entry written since the load, else the base's own read, prototype and all. */
  private node(taskId: string): NodeRun | undefined {
    return this.nodes.has(taskId) ? this.nodes.get(taskId) : this.base.nodes[taskId];
  }

  /** `prev.regions[regionId]?.[regionPath]` — the touched instance, else the base's. */
  private instance(regionId: string, regionPath: string): RegionAcc | RegionRun | undefined {
    const touched = this.regions.get(regionId)?.get(regionPath);
    return touched ?? this.base.regions[regionId]?.[regionPath];
  }

  /** The counts, taken from everything the state holds on first need — O(the state), once per accumulator. */
  private tally(): Counts {
    if (this.counts !== null) return this.counts;
    const c: Counts = { byState: new Map(), nodes: 0, unjoined: 0, openedNothing: 0, noEligibleEdge: 0, ends: 0, pathEnds: 0 };
    const baseNodes = this.base.nodes;
    const keys = Object.keys(baseNodes);
    this.tick(keys.length);
    for (const k of keys) if (!this.nodes.has(k)) this.countNode(c, baseNodes[k]!, 1);
    for (const n of this.nodes.values()) this.countNode(c, n, 1);
    this.tick(this.nodes.size);
    const baseRegions = this.base.regions;
    for (const id of Object.keys(baseRegions)) {
      const byPath = baseRegions[id]!;
      const touched = this.regions.get(id);
      for (const p of Object.keys(byPath)) {
        this.tick();
        if (touched?.has(p)) continue;
        const r = byPath[p]!;
        const w = regionWeight(r.opened, r.joined);
        c.unjoined += w.unjoined;
        c.openedNothing += w.openedNothing;
      }
    }
    for (const byPath of this.regions.values()) {
      for (const acc of byPath.values()) {
        this.tick();
        const w = regionWeight(acc.opened, acc.joined);
        c.unjoined += w.unjoined;
        c.openedNothing += w.openedNothing;
      }
    }
    for (const list of [this.base.pathEnds, this.pathEnds]) {
      this.tick(list.length);
      for (const e of list) {
        c.pathEnds += 1;
        if (e.reason === 'no-eligible-edge') c.noEligibleEdge += 1;
        if (e.reason === 'end') c.ends += 1;
      }
    }
    this.counts = c;
    return c;
  }

  private countNode(c: Counts, n: NodeRun, by: number): void {
    c.nodes += by;
    c.byState.set(n.state, (c.byState.get(n.state) ?? 0) + by);
  }

  private stateCount(state: string): number {
    return this.tally().byState.get(state) ?? 0;
  }

  // --- writes ------------------------------------------------------------------------------------------------

  /** `nodes[taskId] = entry`, the counts kept. An entry is REPLACED, never mutated: a materialised state may hold the old one. */
  private setNode(taskId: string, entry: NodeRun): void {
    if (this.counts !== null) {
      const own = this.nodes.has(taskId) || hasOwn(this.base.nodes, taskId);
      if (own) this.countNode(this.counts, this.node(taskId)!, -1);
      this.countNode(this.counts, entry, 1);
    }
    this.nodes.set(taskId, entry);
    this.tick();
  }

  /**
   * The instance at (`regionId`, `regionPath`) to write to — the touched one, else a COPY of the base's (O(its branch
   * paths), once), else an empty one; with its share of the region counts taken out, for {@link settleRegion} to put back.
   */
  private touchRegion(regionId: string, regionPath: string): RegionAcc {
    let byPath = this.regions.get(regionId);
    let acc = byPath?.get(regionPath);
    if (acc === undefined) {
      const at = this.base.regions[regionId]?.[regionPath];
      if (at) {
        this.tick(at.opened.length + Object.keys(at.settled).length);
        acc = {
          origin: at,
          opened: [...at.opened],
          openedSet: new Set(at.opened),
          settled: new Map(Object.entries(at.settled)),
          suspended: new Suspended(at.suspended, (n) => this.tick(n)),
          joined: at.joined,
        };
      } else {
        acc = {
          origin: { opened: [], settled: {}, suspended: [], joined: null },
          opened: [],
          openedSet: new Set(),
          settled: new Map(),
          suspended: new Suspended([], (n) => this.tick(n)),
          joined: null,
        };
      }
      if (byPath === undefined) {
        byPath = new Map();
        this.regions.set(regionId, byPath);
      }
      byPath.set(regionPath, acc);
      // Its share as the counts held it before this touch: the base's instance where the tally counted it (an OWN key at
      // both levels, as `Object.keys` reads them), or nothing for a new one.
      const inner = this.base.regions[regionId];
      if (this.counts !== null && at && inner !== undefined && hasOwn(this.base.regions, regionId) && hasOwn(inner, regionPath)) {
        this.unweigh(regionWeight(at.opened, at.joined));
      }
    } else if (this.counts !== null) {
      this.unweigh(regionWeight(acc.opened, acc.joined));
    }
    this.tick();
    return acc;
  }

  private unweigh(w: { unjoined: number; openedNothing: number }): void {
    this.counts!.unjoined -= w.unjoined;
    this.counts!.openedNothing -= w.openedNothing;
  }

  /** The instance's share of the region counts put back after a write. */
  private settleRegion(acc: RegionAcc): void {
    if (this.counts === null) return;
    const w = regionWeight(acc.opened, acc.joined);
    this.counts.unjoined += w.unjoined;
    this.counts.openedNothing += w.openedNothing;
  }

  private addPathEnd(e: RunState['pathEnds'][number]): void {
    this.pathEnds.push(e);
    this.tick();
    if (this.counts !== null) {
      this.counts.pathEnds += 1;
      if (e.reason === 'no-eligible-edge') this.counts.noEligibleEdge += 1;
      if (e.reason === 'end') this.counts.ends += 1;
    }
  }

  // --- the arms -------------------------------------------------------------------------------------------------

  /**
   * **Apply one input.** `true` when the arm moved the state — where `step` before W194 returned a NEW object — and
   * `false` where it returned the state it was handed, so `step` can return that same object. Throws where
   * that `step` threw: a malformed task id (`parseTaskId`), a kind it does not name (`input.record` undefined) — within
   * the module header's stated limit on region paths.
   */
  apply(input: FoldInput): boolean {
    this.tick();
    // `RN-R8` and ADR 0102 rule 3, the DUAL READ: a stored `{ kind: 'stopped', reason }` is 0.7.0's name for this
    // element, read here and written nowhere. Not in `FoldInput`, so the comparison goes through `string` — without it a
    // 0.7.0 log of a halted run fell through to `input.record` below and THREW (P34 fact 7 (iii)).
    if (input.kind === 'halted' || (input.kind as string) === 'stopped') {
      this.haltedBy = (input as { reason: string }).reason;
      this.outcome = 'halted';
      return true;
    }

    if (input.kind === 'cancelRequested') {
      // `RN-R30` — the FIRST request is the run's; one folded after the run is already `cancelled` — by `RN-R28`'s cancel
      // or an earlier request — moves NOTHING and is not recorded: the run ended before it (`RN-R31`).
      if (this.cancelRequest !== null || this.outcome === 'cancelled') return false;
      this.cancelRequest = { actor: input.actor, reason: input.reason };
      return this.withOutcome();
    }

    if (input.kind === 'interrupted') {
      // `RN-R32` — the stop is recorded until a `resumed` element ends it; one folded while a stop is current moves nothing.
      if (this.interruption !== null) return false;
      this.interruption = { actor: input.actor, reason: input.reason };
      return this.withOutcome();
    }

    if (input.kind === 'paused' || input.kind === 'unpaused') {
      // `RN-R34` — a FLAG and nothing else: no outcome is recomputed. One that would not change it moves nothing (`RN-R35`).
      const paused = input.kind === 'paused';
      if (this.paused === paused) return false;
      this.paused = paused;
      return true;
    }

    if (input.kind === 'region') {
      this.applyRegion(input.event);
      return this.withOutcome();
    }

    if (input.kind === 'dispatched') {
      const { runId, nodeId, branchPath, attempt } = parseTaskId(input.taskId);
      // A dispatch for a task already in `nodes` is ignored rather than resurrecting it: `ID-R1` refuses a duplicate
      // dispatch before it reaches the scheduler, so this can only be a malformed input sequence.
      if (this.node(input.taskId)) return false;
      this.runId = this.runId ?? runId;
      // `RN-R41` — the attribution from the id, and no attempt yet: the scheduler has not started one.
      this.setNode(input.taskId, {
        runId, nodeId, branchPath, flowAttempt: attempt, attemptNumber: null, state: 'running', result: null, error: null,
      });
      return this.withOutcome();
    }

    if (input.kind === 'asked') {
      // `RN-R36` — `suspended` from its `asked` element, what reached it KEPT as `input`: a COPY, taken once, because a
      // state never shares a value of any shape with the input it came from (`RN-R2`). An `asked` for a task already in
      // `nodes` is ignored — `dispatched`'s rule. `RN-R41`: an ask is never handed to a scheduler; `attemptNumber` null.
      const { runId, nodeId, branchPath, attempt } = parseTaskId(input.taskId);
      if (this.node(input.taskId)) return false;
      this.runId = this.runId ?? runId;
      this.setNode(input.taskId, {
        runId, nodeId, branchPath, flowAttempt: attempt, attemptNumber: null,
        state: 'suspended', result: null, error: null, input: structuredClone(input.input),
      });
      return this.withOutcome();
    }

    if (input.kind === 'pathEnded') {
      this.addPathEnd({ reason: input.reason, at: input.at });
      return this.withOutcome();
    }

    if (input.kind === 'regionEntered') {
      // Idempotent: a region instance already present keeps what it holds. Otherwise an EMPTY instance — present, which
      // is the whole of what "entered" adds; `joined` stays `null` until a `joinSettled` (`RN-R11`).
      if (this.instance(input.regionId, input.regionPath)) return false;
      const acc = this.touchRegion(input.regionId, input.regionPath);
      this.settleRegion(acc);
      return this.withOutcome();
    }

    if (input.kind === 'resumed') {
      // `RN-R22` — recorded as a COPY of the list; the ids were dispatched before and are still `running`. And it ENDS an
      // interruption (`RN-R32`), recomputing the outcome only then — a resume of a run nobody stopped moves nothing else.
      this.resumes.push([...input.taskIds]);
      this.tick(input.taskIds.length + 1);
      if (this.interruption !== null) {
        this.interruption = null;
        return this.withOutcome();
      }
      return true;
    }

    if (input.kind === 'gated') {
      // `RN-R26` — recorded, and nothing else moves. A COPY of the decision and of its key, which may be an object.
      const d: GateDecision = { gateId: input.gateId, branchPath: input.branchPath, route: input.route };
      if (input.key !== undefined) d.key = structuredClone(input.key);
      this.gated.push(d);
      this.tick();
      return true;
    }

    if (input.kind === 'attempted') {
      // `RN-R40`, `RN-R41` — the task's `attemptNumber` is the number the latest element carried; nothing else moves, and
      // the outcome is not recomputed. One for a task not in `nodes` moves nothing.
      const node = this.node(input.taskId);
      if (node === undefined) return false;
      this.setNode(input.taskId, { ...node, attemptNumber: input.attemptNumber });
      return true;
    }

    if (input.kind === 'joinSettled') {
      const acc = this.touchRegion(input.regionId, input.regionPath);
      acc.joined = input.fired;
      this.settleRegion(acc);
      return this.withOutcome();
    }

    const r = input.record;
    const { runId, nodeId, branchPath, attempt } = parseTaskId(r.taskId);
    const existing = this.node(r.taskId);
    // `RN-R41` — a settlement or a resolution KEEPS the attempt number the entry carried: it comes from `attempted`
    // elements alone, never from the record's `attempts`.
    const attemptNumber = existing?.attemptNumber ?? null;
    if (r.kind === 'outcome') {
      this.setNode(r.taskId, {
        runId,
        nodeId,
        branchPath,
        flowAttempt: attempt,
        attemptNumber,
        // `user_action` is `suspended` at flow level: a resolution resumes it.
        state: r.terminalState === 'user_action' ? 'suspended' : r.terminalState,
        result: r.result,
        error: r.error,
      });
    } else {
      // `RN-R9` — a resolved node is indistinguishable from one that settled that way; an ASK's `input` is KEPT through
      // its answer (`RN-R36`) — the entry's own copy, made when it was asked.
      this.setNode(r.taskId, {
        runId: existing?.runId ?? runId,
        nodeId: existing?.nodeId ?? nodeId,
        branchPath: existing?.branchPath ?? branchPath,
        flowAttempt: existing?.flowAttempt ?? attempt,
        attemptNumber,
        state: r.resolvedAs,
        result: r.result,
        error: r.error,
        ...(existing !== undefined && 'input' in existing ? { input: existing.input } : {}),
      });
    }
    this.runId = this.runId ?? runId;
    return this.withOutcome();
  }

  private applyRegion(e: RegionEvent): void {
    const acc = this.touchRegion(e.regionId, e.regionPath);
    switch (e.type) {
      case 'branch.opened':
        if (!acc.openedSet.has(e.branchPath)) {
          acc.opened.push(e.branchPath);
          acc.openedSet.add(e.branchPath);
        }
        break;
      case 'branch.arrived':
      case 'branch.exited':
      case 'branch.lost': {
        // `RN-R6` — what HAPPENED, not what a policy concluded.
        const how: BranchSettlement =
          e.type === 'branch.arrived' ? 'arrived' : e.type === 'branch.exited' ? 'exited' : 'lost';
        acc.settled.set(e.branchPath, how);
        acc.suspended.remove(e.branchPath);
        break;
      }
      case 'branch.suspended':
        acc.suspended.add(e.branchPath);
        break;
      case 'branch.resumed':
        acc.suspended.remove(e.branchPath);
        break;
    }
    this.settleRegion(acc);
  }

  /**
   * **Section 3's precedence, read off the counts** — `RN-R7`, `RN-R8`, `RN-R10`, `RN-R28`, `RN-R30` and `RN-R32` in the
   * one order they have always had. Called by exactly the arms that recomputed before W194. Always `true`: an arm that
   * recomputes has moved the state.
   */
  private withOutcome(): true {
    this.outcome = this.precedence();
    return true;
  }

  private precedence(): RunOutcome {
    // `RN-R8` — a run a refusal terminated is `halted` whatever its nodes say,
    // because the log after that point is incomplete by construction.
    if (this.haltedBy !== null) return 'halted';

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
    if (this.cancelRequest === null && this.stateCount('cancelled') > 0) return 'cancelled';

    // `RN-R30` — a run its OWNER cancelled is `cancelling` while a dispatched task is still unsettled, and `cancelled` once
    // none is (P34 (c), (h)). Below `halted` and the line above; ABOVE `awaiting_action`, so a parked task — settled
    // already, and not waited on (P34 (i)) — never makes a run its owner ended read as waiting for a person; and above
    // `stuck`, `failed` and `completed`, so a join the cancel left waiting is the owner's act, not a defect.
    if (this.cancelRequest !== null) return this.stateCount('running') > 0 ? 'cancelling' : 'cancelled';

    // `RN-R32` — a run its OWNER stopped is `interrupted` until a `resumed` element ends it (P34 (d), (h)). Below every
    // cancel above, so a run its owner cancelled never reads resumable; ABOVE `awaiting_action`, so a parked task — whose
    // `resolve()` the stopped driver refuses — does not make it read as waiting for a person here; and above `running`,
    // because the tasks the stop cancelled stay `running` in `nodes` by construction (the driver went deaf first): they
    // are the in-flight set the resume re-dispatches, not live work on this runtime. Above `stuck`, `failed` and
    // `completed` too: a join the stop left waiting is the owner's act, resumed elsewhere.
    if (this.interruption !== null) return 'interrupted';

    // `RN-R7` — `awaiting_action` outranks `running`: the thing a reader must know
    // is that a human is needed, not that other work continues.
    if (this.stateCount('suspended') > 0) return 'awaiting_action';
    if (this.stateCount('running') > 0) return 'running';
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
    //
    // *(Since v0.29 the three are COUNTS kept by every write — `RN-R43` — where they were three scans of the state.)*
    const c = this.tally();
    if (c.nodes === 0 && c.pathEnds === 0 && c.openedNothing === 0) return 'running';

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
    if (c.unjoined > 0) return 'stuck';

    // Section 3's own words, and not "some node settled failed" — which is a
    // different proposition, and mislabels a failed node that ROUTED ON through an
    // `on: ["failed"]` edge to an `end`.
    if (c.noEligibleEdge > 0) return 'failed';
    if (c.ends > 0) return 'completed';

    // Every node settled and no path end was reported: the input sequence carried
    // no `pathEnded`, so fall back to the node states rather than inventing one.
    if (this.stateCount('failed') > 0) return 'failed';
    return 'completed';
  }

  // --- materialisation ------------------------------------------------------------------------------------------

  /**
   * **One plain `RunState`**, built from the base and what was written since the load: a record or list nothing wrote is
   * the base's own object, and one that was written is a new one with the base's entries in their places and the new
   * entries after them, in first-write order — the key order a spread-per-step produced. O(what it builds).
   */
  materialise(): RunState {
    const b = this.base;
    let nodes = b.nodes;
    if (this.nodes.size > 0) {
      nodes = { ...b.nodes };
      this.tick(Object.keys(b.nodes).length);
      for (const [k, n] of this.nodes) put(nodes, k, n);
      this.tick(this.nodes.size);
    }
    let regions = b.regions;
    if (this.regions.size > 0) {
      regions = { ...b.regions };
      this.tick(Object.keys(b.regions).length);
      for (const [id, byPath] of this.regions) {
        const inner: Record<string, RegionRun> = { ...b.regions[id] };
        this.tick(Object.keys(inner).length);
        for (const [p, acc] of byPath) put(inner, p, this.materialiseRegion(acc));
        put(regions, id, inner);
      }
    }
    return {
      ...b,
      runId: this.runId,
      outcome: this.outcome,
      nodes,
      regions,
      pathEnds: this.list(b.pathEnds, this.pathEnds),
      haltedBy: this.haltedBy,
      cancelRequest: this.cancelRequest,
      interruption: this.interruption,
      paused: this.paused,
      resumes: this.list(b.resumes, this.resumes),
      gated: this.list(b.gated, this.gated),
    };
  }

  private list<T>(base: T[], added: readonly T[]): T[] {
    if (added.length === 0) return base;
    this.tick(base.length + added.length);
    return [...base, ...added];
  }

  private materialiseRegion(acc: RegionAcc): RegionRun {
    const settled: Record<string, BranchSettlement> = {};
    // An ASSIGNMENT, as the pre-v0.29 arm's `cur.settled[e.branchPath] = how` was — so a branch path `__proto__` sets
    // the prototype here exactly as it did there (C1's one site that was never a spread).
    for (const [k, v] of acc.settled) settled[k] = v;
    this.tick(acc.opened.length + acc.settled.size + 1);
    return { ...acc.origin, opened: [...acc.opened], settled, suspended: acc.suspended.toArray(), joined: acc.joined };
  }
}

/**
 * **The fold, with its work counted** — the INTERNAL entry point P39 decision 6 names: `fold` is this with no counter.
 * One accumulator, every input applied in append order (`RN-R3`), materialised once: linear in `inputs`.
 */
export function foldWith(inputs: readonly FoldInput[], counter?: FoldCounter): RunState {
  const acc = Accumulator.load(emptyState(), counter);
  for (const i of inputs) acc.apply(i);
  return acc.materialise();
}

/**
 * **One step, with its work counted** — `step` is this with no counter: load, apply, materialise, and the state it was
 * handed itself back wherever the arm moves nothing. O(the state it is handed).
 */
export function stepWith(prev: RunState, input: FoldInput, counter?: FoldCounter): RunState {
  const acc = Accumulator.load(prev, counter);
  return acc.apply(input) ? acc.materialise() : prev;
}
