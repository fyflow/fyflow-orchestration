/**
 * Run state, and the fold that produces it — `spec/run-state.md`.
 *
 * **Pure.** `fold(log)` reads nothing but `log`: no clock, no scheduler, no IO,
 * no module-level mutation, no memoisation across calls (`RN-R1`). That is what
 * ladder L3 checks by folding the same log twice and deep-comparing, and it is
 * what makes [Q14](../../doc/questions/q14.md)'s answer an answer rather than a
 * restated leaning.
 *
 * **Since v0.29 the arms live in ONE place, `src/fold/accumulator.ts`** (`RN-R43`,
 * [ADR 0120](../../doc/decisions/0120-the-fold-is-one-accumulator-and-step-stays-pure.md)): an accumulator mutated in
 * place WITHIN one call and materialised into a plain state, so nothing survives a call and `RN-R1` holds as before.
 * This module keeps the types, `emptyState`, `isTerminal`, `nodeOf` and `foldLog`, and `fold` and `step` call into it.
 * That module is internal: `index.ts` re-exports this one and never it.
 */
import type { LogRecord, OutcomeRecord } from '../driver/log.ts';
import type { RegionEvent } from '../driver/events.ts';
import { foldWith, stepWith } from './accumulator.ts';

/**
 * `spec/run-state.md` section 4. Five, not the scheduler's six.
 *
 * `user_action` is `suspended` here — it is not terminal at flow level. And there
 * is **no `pending`**: `OR-R4` says `task.running` writes no record, so the only
 * signal the fold has is the dispatch itself, and a task is `running` from that
 * moment. A state nothing can produce is not a state. *(Since v0.26 `task.running` produces a FOLD INPUT, `attempted`
 * (`RN-R40`, W186) — still no record, and it moves no state: a task is `running` from its dispatch either way.)*
 *
 * **`cancelled` is W158's** ([ADR 0094](../../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md)),
 * copied verbatim from the settlement as `done` and `failed` are. **Widening this union is BREAKING for a
 * consumer switching on it exhaustively** — `resumed`'s and `gated`'s precedent.
 */
export type NodeState = 'running' | 'done' | 'failed' | 'suspended' | 'cancelled';

/**
 * `spec/run-state.md` section 3. Closed, and ours — an author labels why a path
 * ended, not what the run is.
 *
 * **`stuck` is v0.3's sixth**, added by W5 under
 * [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md):
 * nothing is live, nothing waits on a person, and a region's join has not fired,
 * so nothing will ever move again. v0.2 called that run **`completed`**.
 *
 * **`cancelled` is v0.15's seventh**, added by W158 under
 * [ADR 0094](../../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md):
 * a task of the run settled `cancelled`, so the driver halted it (`RN-R28`). **Widening this union is BREAKING
 * for a consumer switching on it exhaustively** — `resumed`'s and `gated`'s precedent; a consumer comparing
 * strings sees a value it never named, and `isTerminal` already calls it terminal.
 *
 * **`halted` is v0.16's NAME for the outcome 0.7.0 called `stopped`** — W171,
 * [ADR 0102](../../doc/decisions/0102-a-run-the-driver-halts-is-halted-and-a-stored-stopped-reads-as-one.md), P34
 * decision 2 and stop-and-ask (f): a refusal terminated the run (`OR-R10`, `RN-R8`). *Stop* is P34's resumable stop
 * of a run (W174), so the old name leaves this union ENTIRELY: **BREAKING**, and loudly — a consumer's
 * `outcome === 'stopped'` no longer compiles, rather than silently changing what it means. The count does not move.
 *
 * **`cancelling` is v0.18's EIGHTH**, added by W173 under
 * [ADR 0104](../../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md): the
 * run's OWNER cancelled it (`driver.cancel`, a `cancelRequested` element) and a task is still stopping (`RN-R30`).
 * **NOT terminal** — the third outcome {@link isTerminal} calls unfinished — so a runtime's `done` waits for the last
 * task to stop. **BREAKING in 0.8.0** (P34 decision 10): a consumer switching on it exhaustively, or keying a
 * `Record<RunOutcome, …>`, fails to compile; one comparing strings sees a value it never named.
 *
 * **`interrupted` is v0.19's NINTH**, added by W174 under
 * [ADR 0105](../../doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md): the
 * run's OWNER stopped it to resume it elsewhere (`driver.stop`, an `interrupted` element), and no `resumed` element has
 * followed (`RN-R32`). **Terminal** — {@link isTerminal} needs no change, and a runtime's `done` settles on it once the
 * stop's cancels have resolved — **and the one terminal outcome a resume ACCEPTS**. **BREAKING in 0.8.0** (P34 decision
 * 10), as `cancelling` is.
 */
export type RunOutcome =
  | 'running' | 'completed' | 'failed' | 'awaiting_action' | 'halted' | 'stuck' | 'cancelled' | 'cancelling' | 'interrupted';

/**
 * **Who cancelled the run, and why** — `RunState.cancelRequest`, `RN-R30`, v0.18. What the `cancelRequested` element
 * carried: `actor` as the caller gave it, `reason` the caller's or `null` when it gave none.
 */
export interface CancelRequest {
  actor: string;
  reason: string | null;
}

/**
 * **Who stopped the run, and why** — `RunState.interruption`, `RN-R32`, v0.19. What the `interrupted` element carried:
 * `actor` as the caller gave it, `reason` the caller's or `null` when it gave none.
 */
export interface Interruption {
  actor: string;
  reason: string | null;
}

/** How a branch left its region. `null` while it is still live. */
export type BranchSettlement = 'arrived' | 'exited' | 'lost';

/**
 * **One task's entry in `RunState.nodes`** — `RN-R5`, and since v0.27 its ATTRIBUTION as fields (`RN-R41`,
 * [ADR 0114](../../doc/decisions/0114-a-tasks-attribution-is-fields-and-its-messages-and-progress-are-passed-through.md), P36
 * stop-and-ask (j)): the run, the flow-level attempt and the scheduler's attempt number, so a reader holding an entry on
 * its own needs no parse of its key. **`runId`, `flowAttempt` and `attemptNumber` are REQUIRED, and that is BREAKING in
 * 0.8.0 for code that builds a `NodeRun` literal** (P36 (p)); a reader is unaffected. Fold OUTPUT only: no fold input
 * carries a field derived from the task id (`spec/outcome-record.md` section 2), and none moves.
 */
export interface NodeRun {
  /**
   * **The run the task belongs to** — v0.27, `RN-R41`: the task id's first segment (`spec/task-id.md` section 1), equal to
   * `RunState.runId` on every entry of a run's fold. On the entry so it travels with it.
   */
  runId: string;
  nodeId: string;
  /** `'-'` when the node is in no fan-out region. */
  branchPath: string;
  /**
   * **The FLOW-LEVEL attempt** — v0.27, `RN-R41`: the task id's fourth segment, `0` on every id this library mints today
   * ([Q16](../../doc/questions/q16.md)'s flow half mints nothing above it). NOT the scheduler's attempt number: that is
   * {@link NodeRun.attemptNumber}, named apart so the two cannot be confused (P36 (j)).
   */
  flowAttempt: number;
  /**
   * **The SCHEDULER's attempt number** — v0.27, `RN-R41`: the 1-based `attemptNumber` the LATEST `attempted` element for this
   * task carried (`RN-R40`), so a retried task reads the attempt it is on, or settled on. **`null`** before its first
   * attempt starts, on an ASK (never handed to a scheduler), and on every entry of a log written before 0.8.0, which holds
   * no `attempted` element — never derived from a settlement's `attempts`.
   */
  attemptNumber: number | null;
  state: NodeState;
  result: unknown;
  error: string | null;
  /**
   * **What REACHED an ask** — `RN-R36`, v0.22, P35 (f),
   * [ADR 0109](../../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md): the value
   * its `needs` composed (or the edge's value without one), as its `asked` element carried it, and KEPT after the answer.
   * **Present only on an ask's node**, so every other node's entry has the five fields it always had — OPTIONAL, and
   * additive: a consumer building a `NodeRun` literal is unaffected.
   */
  input?: unknown;
  /**
   * **WHEN an ask was asked** — `RN-R36`, v0.35,
   * [ADR 0130](../../doc/decisions/0130-a-regenerated-asked-element-keeps-the-stored-runs-time.md), W208, P43 (e1): its
   * `asked` element's `observedAt`, KEPT after the answer as {@link NodeRun.input} is. **Present only on an ask's node, and
   * only where its element carried one** — an element written before 0.11.0 carries none, so its entry has none. OPTIONAL
   * and additive.
   */
  askedAt?: number;
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
  /**
   * **Keyed by the opener's node id and THEN by the opener's own `branchPath`** —
   * one entry per region INSTANCE entered
   * ([ADR 0062](../../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md),
   * [W84](../../doc/work-items/w84-what-a-regions-identity-is.md)).
   *
   * **Two levels rather than one, because a `map` enters one opener N times.**
   * Until W84 this was `Record<string, RegionRun>` and a region's identity was its
   * opener's node id alone, which is total only while no opener is entered twice —
   * a property [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md) held by
   * REFUSING a region inside a map region at `Driver` construction. That refusal is
   * lifted here and this shape is what replaces it: instance 2 gets its own entry
   * instead of discarding instance 1's.
   *
   * **The outer key is unchanged in meaning and in value**, so `regions.split` is
   * still the `split` region and every existing flow's ids are the ids they were;
   * what an existing reader gains is one more `[path]` before the fields. At top
   * level that path is `'-'`, so `regions.split['-']` is the depth-1 shape.
   *
   * **No composite string anywhere.** `"split@1"` was built and run: it keeps this
   * one level and costs **twelve measured silent failure modes**, because a
   * mis-derived composite is a string a lookup simply misses. A nested record
   * fails at the typechecker instead.
   */
  regions: Record<string, Record<string, RegionRun>>;
  /** How each path ended, in order. What separates `completed` from `failed`. */
  pathEnds: { reason: 'end' | 'no-eligible-edge'; at: string }[];
  /**
   * Set when a refusal HALTED the run (`OR-R10`, `RN-R8`): the refusal's class, `: `, and its message. *(0.7.0's
   * `stoppedBy` — renamed with the outcome by ADR 0102; BREAKING, and a consumer reading the old name fails to compile.)*
   */
  haltedBy: string | null;
  /**
   * **Set when the run's OWNER cancelled it** — `RN-R30`, v0.18, W173,
   * [ADR 0104](../../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md): the
   * FIRST `cancelRequested` element's `{ actor, reason }`, and `null` for a run nobody cancelled — including one a cancel
   * the scheduler made on its own ended (`RN-R28`), which carries no actor. **A new cell, BREAKING in 0.8.0 for a
   * consumer that builds a `RunState` literal** (P34 decision 10).
   */
  cancelRequest: CancelRequest | null;
  /**
   * **Set while the run's OWNER has STOPPED it** — `RN-R32`, v0.19, W174,
   * [ADR 0105](../../doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md): the
   * `interrupted` element's `{ actor, reason }`, and `null` again once a `resumed` element follows it. **CURRENT, not
   * cumulative** — `regions[*].suspended`'s precedent (`RN-R6`): that a resumed run was ever stopped is in the input
   * sequence, not here. **A new cell, BREAKING in 0.8.0 for a consumer that builds a `RunState` literal** (P34 decision 10).
   */
  interruption: Interruption | null;
  /**
   * **Whether the run's OWNER has paused it NOW** — `RN-R34`, v0.20, W175,
   * [ADR 0106](../../doc/decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md): `true`
   * from a `paused` element until an `unpaused` one. **A flag, NOT an outcome** (P34 (e)): a paused run still routes, and
   * each dispatch it holds is `dispatched` and so `running` in `nodes` — so `outcome` is exactly what it would be without
   * the pause, and no precedence moves. **CURRENT, not cumulative**: that a run was ever paused is in the input sequence.
   * Neither a stop, a cancel nor a resume lifts it — only an `unpaused` element does, so a run stopped while paused
   * resumes paused. **A new cell, BREAKING in 0.8.0 for a consumer that builds a `RunState` literal** (P34 decision 10).
   */
  paused: boolean;
  /**
   * **Every resume this run has had, in order, each the task ids it handed a scheduler AGAIN** —
   * `RN-R22`, [ADR 0065](../../doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md),
   * P23 stop-and-ask (a). `[]` for a run nobody resumed; `[[]]` for a run resumed with nothing in
   * flight. **This is the at-least-once cost, readable from run state**: a task named here may have
   * run once in a process that is gone and runs again here (P23 decision 6), which a run's events are
   * otherwise silent about — the replay regenerates everything else exactly.
   *
   * *(v0.10 adds this field. It is the one cell of run state W89 moves, and it is additive: every
   * other field of a resumed run folds exactly as the run nobody killed does.)*
   */
  resumes: string[][];
  /**
   * **Every decision a GATE made in this run, in the order it made them** — `RN-R26`, v0.11,
   * [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md), P24 stop-and-ask (b), answered: *a gate's
   * decision IS recorded*. One entry per branch that reached a gate: which gate, on which branch path, the
   * route its type returned and the key it was handed. `[]` for a run no gate decided in.
   *
   * **In order, and the order is the point**: which branch was FIRST to reach a `distinct` gate is a fact
   * about the ORDER branches arrived, which varies between runs (P24 decision 7) and is reproduced exactly
   * by a resume. So this is a list, `pathEnds`' precedent, and not a record keyed by gate — a record would
   * keep *which* and drop *when*.
   */
  gated: GateDecision[];
}

/**
 * **One gate decision** — what a `gated` fold input carries, and what `RunState.gated` holds. `branchPath`
 * is the GATE's own, derived as a task's is (`spec/task-id.md` section 1) — `'-'` outside every region, one
 * segment per enclosing region instance otherwise — because a gate has no task id and this is what tells
 * two branches' decisions at one gate apart. `key` is what the driver resolved `settings.key` to over the
 * value that reached the gate, and is ABSENT where nothing was resolved — the gate declares no `key`, or a
 * segment is missing — which is what `distinct` routes to `nokey`.
 */
export interface GateDecision {
  gateId: string;
  branchPath: string;
  route: string;
  key?: unknown;
}

/**
 * There is no `flowId` and no `regions[*].joinId`, and both were in the first
 * draft of `spec/run-state.md`. **Neither is derivable from the fold's input** —
 * no record carries a flow id, and `RegionEvent` carries `regionId` and (since
 * W84) `regionPath` and no join id — so
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
 * already carried region events and a halt for the same reason.
 *
 * **`joinSettled` is W5's, and it is the third fact of this shape**
 * ([ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)):
 * without it `completed` and `stuck` are the same fold, because on
 * `p1-routed-away` both policies settle every branch and differ only in whether
 * the driver routed out of the join.
 *
 * **`Driver.foldInputs()` is what produces this sequence** — ADR 0014, and
 * [Q41](../../doc/questions/q41.md). Until W5 nothing did, and `pathEnded` in
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
  | { kind: 'regionEntered'; regionId: string; regionPath: string }
  | { kind: 'dispatched'; taskId: string }
  /**
   * **A branch reached an ASK, which parked** — `RN-R36`, `RN-R37`, v0.22,
   * [W180](../../doc/work-items/w180-asking-and-answering-in-a-run.md),
   * [ADR 0109](../../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md), P35
   * stop-and-ask (b): appended by the driver where a branch ENTERS an ask, with NOTHING handed to the scheduler — `taskId`
   * the ask's own (`spec/task-id.md`'s scheme, attempt `0`) and `input` what reached it, composed through its `needs`
   * (P35 (f)). The fold reads the node `suspended` from here, its `input` kept, until the person's `resolution`.
   *
   * **A structural fact, not a terminal state** (P35 decision 5, fact 13): `dispatched`'s precedent — no outcome record is
   * ever written for an ask, and its only terminal fact is the person's answer. **REGENERATED on resume, never FED**
   * (`RN-R19`): the replay re-enters the ask and compares the input it composes with the stored one (`RN-R20`). **The
   * first kind whose payload is a value of ANY shape**, so it is deep-copied on the way out (`freezeInput`, `RN-R17`).
   * **A new kind, BREAKING in 0.8.0 for a consumer switching on `kind` exhaustively** (P35 decision 8).
   *
   * **`observedAt` — WHEN the ask was asked** (v0.35, `RN-R37`,
   * [ADR 0130](../../doc/decisions/0130-a-regenerated-asked-element-keeps-the-stored-runs-time.md), W208, P43 (e1)): the
   * driver's injected `now` where the branch entered the ask — the clock an outcome record's `observedAt` is read from.
   * **A replay KEEPS the stored run's** (`RN-R19`): within the stored prefix the regenerated element takes the stored
   * element's `observedAt`, or carries none where the stored one carries none, so it compares equal (`RN-R20`); past the
   * stored tail it is `now()`. **OPTIONAL**: an element written before 0.11.0 has none, and a consumer building one
   * literally is unaffected. `CHECKPOINT_FORMAT` does not move.
   */
  | { kind: 'asked'; taskId: string; input: unknown; observedAt?: number }
  | { kind: 'pathEnded'; reason: 'end' | 'no-eligible-edge'; at: string }
  | { kind: 'joinSettled'; regionId: string; regionPath: string; joinId: string; fired: boolean }
  /**
   * **A refusal HALTED the run** — `OR-R10`, `RN-R8`; appended by the driver's `failRun`, `reason` the refusal's class,
   * `: ` and its message. **0.7.0 wrote this element as `{ kind: 'stopped', reason }`** and ADR 0102 renamed it
   * (W171, P34 stop-and-ask (f)). **The old kind is READ, never written, and is not a member of this union**: a stored
   * sequence is data from before the rename, so {@link step} folds an element whose `kind` is `'stopped'` exactly as
   * this one and `resumeRefusal` refuses it `halted` at its position — `CHECKPOINT_FORMAT` stays `1`, and a 0.7.0
   * checkpoint of a halted run is refused for the right reason while one of a live run still resumes. Nothing in this
   * library writes `'stopped'` again, and the type says so: a consumer's `kind === 'stopped'` no longer compiles.
   * **BREAKING in 0.8.0** (P34 decision 10): a consumer that switched on, compared or CONSTRUCTED the old kind fails
   * to compile.
   */
  | { kind: 'halted'; reason: string }
  /**
   * **The run's OWNER cancelled it** — `RN-R30`, `RN-R31`, v0.18,
   * [W173](../../doc/work-items/w173-cancelling-a-run.md),
   * [ADR 0104](../../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md), P34
   * decision 4: appended ONCE by `Driver.cancel`, after the hold and BEFORE the scheduler is asked to cancel anything,
   * so every `task.cancelled` it causes folds under it. `reason` is `null` when the caller gave none. The fold reads the
   * run `cancelling` from here while a dispatched task is unsettled, and `cancelled` once none is.
   *
   * **Never fed to a replay**: a resume refuses a stored one `cancelled` before replaying anything (`RN-R23`). **A new
   * kind, BREAKING in 0.8.0 for a consumer switching on `kind` exhaustively** (P34 decision 10).
   */
  | { kind: 'cancelRequested'; actor: string; reason: string | null }
  /**
   * **The run's OWNER stopped it, to resume it elsewhere** — `RN-R32`, `RN-R33`, v0.19,
   * [W174](../../doc/work-items/w174-stopping-a-run-to-resume-it-elsewhere.md),
   * [ADR 0105](../../doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md), P34
   * decision 3 and stop-and-ask (d): appended ONCE by `Driver.stop`, after the hold and the driver going DEAF and BEFORE
   * it asks the scheduler to cancel anything, so no `task.cancelled` the stop causes — nor any settlement at all — follows it. `reason` is `null` when the
   * caller gave none. The fold reads the run `interrupted` from here until a `resumed` element.
   *
   * **FED to a replay** (`RN-R19`), at its own position — the one terminal element a resume does not refuse. **A new
   * kind, BREAKING in 0.8.0 for a consumer switching on `kind` exhaustively** (P34 decision 10).
   */
  | { kind: 'interrupted'; actor: string; reason: string | null }
  /**
   * **The run's OWNER paused it** — `RN-R34`, `RN-R35`, v0.20,
   * [W175](../../doc/work-items/w175-pausing-a-run.md),
   * [ADR 0106](../../doc/decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md), P34
   * stop-and-ask (e): appended ONCE by `Driver.pause`, at rest — between two of the driver's steps — and from it on every
   * dispatch is appended and HELD. The fold sets `RunState.paused`; no outcome moves.
   *
   * **FED to a replay** (`RN-R19`), at its own position, so a run stopped while paused resumes paused. **A new kind,
   * BREAKING in 0.8.0 for a consumer switching on `kind` exhaustively** (P34 decision 10).
   */
  | { kind: 'paused'; actor: string }
  /**
   * **The run's OWNER unpaused it** — `RN-R34`, `RN-R35`, v0.20, W175, ADR 0106: appended ONCE by `Driver.unpause`, at
   * rest, BEFORE the held tasks are handed on, in dispatch order. The fold clears `RunState.paused`. **FED to a replay**;
   * **a new kind, BREAKING in 0.8.0** (P34 decision 10).
   */
  | { kind: 'unpaused'; actor: string }
  /**
   * **The run was RESUMED, and these are the tasks handed to a scheduler again** — `RN-R22`,
   * [W89](../../doc/work-items/w89-what-resuming-is.md), P23 stop-and-ask (a), answered: *a resume
   * IS recorded*. Appended by `Driver.resume` after the replay and BEFORE the first re-dispatch, and
   * always — `taskIds: []` when nothing was in flight — so a resumed run's sequence says it was
   * resumed even when it re-ran nothing.
   *
   * **Every id here was already `dispatched` in this sequence**, at the same id (stop-and-ask (c)), so
   * the fold does not resurrect or re-run a node: each stays `running` until it settles, exactly as
   * the run nobody killed has it. What the fold gains is the fact itself, in `RunState.resumes`.
   *
   * **A new kind, and it is BREAKING for a consumer switching on `kind` exhaustively** — the cost
   * stop-and-ask (a) priced, which is why the package moves at W90's close.
   */
  | { kind: 'resumed'; taskIds: string[] }
  /**
   * **A GATE decided** — `RN-R26`, [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md), P24
   * stop-and-ask (b), answered: *a gate's decision is recorded as a fold input*. Appended by the driver where
   * a branch ENTERS a gate, after the type's `fn` returned a route the type declares and BEFORE the driver
   * enters that route's target — so what the route led to follows it in the sequence.
   *
   * **REGENERATED on resume, never FED** (`RN-R19`): the replay re-evaluates every gate on the stored
   * settlements, rebuilding the gate's memory as it goes, and the prefix check (`RN-R20`) compares each
   * regenerated `gated` element with the stored one — so a resume checks the gate's ANSWERS directly, and a
   * type whose answer changed is refused `diverged` at that position.
   *
   * **A new kind, and it is BREAKING for a consumer switching on `kind` exhaustively** — the cost
   * stop-and-ask (b) priced, which is why the package moves at W94's close, on `resumed`'s precedent.
   */
  | ({ kind: 'gated' } & GateDecision)
  /**
   * **An ATTEMPT of a task started** — `RN-R40`, v0.26,
   * [W186](../../doc/work-items/w186-attempts-recorded-and-carried-across-a-resume.md),
   * [ADR 0113](../../doc/decisions/0113-a-tasks-attempts-are-recorded-and-carried-across-a-resume.md), P36 stop-and-ask (f):
   * appended by the driver for the scheduler's `task.running` of a task THIS run dispatched, carrying the scheduler's
   * 1-based `attemptNumber` — and ONLY when that number EXCEEDS the last one recorded for the task, so a requeue (which
   * repeats its number) appends nothing. For every task, with or without a `retryPolicy`. **Appended at REST**: a
   * `task.running` heard on the driver's own step — an inline pool fires it INSIDE `addTask` — is appended when that step
   * ends, so the element always lies BETWEEN two steps, where a resume's replay feeds it (`RN-R19`).
   *
   * **FED to a replay** (`RN-R19`'s seventh kind): only the scheduler can produce it, so the replay cannot regenerate it;
   * the highest number the replay was fed for a task is what a resume re-hands it with as `attemptsSpent` (`RN-R21`), so a
   * task's retry budget is NOT reset by a crash (Q365). **Moved nothing in `RunState` at v0.26; since v0.27 it sets ONE
   * cell, its task's `NodeRun.attemptNumber`** (`RN-R41`, W187) — the run's outcome, every state and every other cell are
   * what they would be without it. **Never a log record**
   * (`OR-R4`: `task.running` writes none) — `cancelRequested`'s precedent. **A new kind, BREAKING in 0.8.0 for a consumer
   * switching on `kind` exhaustively** (P36 decision 8, (p)).
   */
  | { kind: 'attempted'; taskId: string; attemptNumber: number };

export function emptyState(): RunState {
  return {
    runId: null, outcome: 'running', nodes: {}, regions: {}, pathEnds: [], haltedBy: null, cancelRequest: null, interruption: null,
    paused: false, resumes: [], gated: [],
  };
}

/**
 * One step. **Never mutates the state it was given, and returns a NEW one wherever the input moves something** — and
 * that state ITSELF where it moves nothing (below) — which is what lets `RN-R2` hold (folding a prefix then one more record equals folding the
 * whole) and what makes a fold usable while a run is still going.
 *
 * **Its work is O(the state it is handed), not O(the input)** — `RN-R43`, v0.29,
 * [ADR 0120](../../doc/decisions/0120-the-fold-is-one-accumulator-and-step-stays-pure.md): it loads `prev` into the
 * fold's one accumulator, applies the input and materialises a new plain state, and a pure function from one plain
 * `RunState` to another cannot do less than copy the record it changes. So stepping every input of a long run costs
 * O(run) per input; {@link fold} over the whole sequence is linear. A consumer that needs a run's state after every input
 * reads it where a runtime keeps it, rather than stepping a copy of its own.
 *
 * **Each arm behaves on ANY state it is handed exactly as it did before v0.29** — not only on one a fold can reach. The
 * outcome is recomputed only by the arms that recomputed it, so a hand-built state whose `outcome` disagrees with its
 * cells keeps that outcome across `paused`, `unpaused`, `gated`, `attempted` and a `resumed` that ends no stop; and an
 * input that moves nothing — a second cancel request, or one after the run is already `cancelled`, a second stop or
 * pause, an unpause of a run not paused, a dispatch or an ask of a
 * task already in `nodes`, a region instance already entered, an attempt of a task not in `nodes` — hands back `prev`
 * ITSELF. A cell no input touched is `prev`'s own object in the result. (Its one stated limit, a region path naming an
 * `Object.prototype` member, which no driver appends, is `src/fold/accumulator.ts`'s header's.)
 */
export function step(prev: RunState, input: FoldInput): RunState {
  return stepWith(prev, input);
}

/**
 * The fold. `RN-R2`: total over any prefix, so `fold(log.slice(0, n))` is defined
 * for every `n` and `step(fold(prefix), next)` deep-equals `fold(prefix + next)`.
 *
 * **Linear in its inputs** — `RN-R43`, v0.29, [W194](../../doc/work-items/w194-the-fold-is-one-accumulator.md): ONE
 * accumulator (`src/fold/accumulator.ts`, internal) has every input applied to it in place and is materialised into a
 * plain state once, at the end. Before v0.29 this was a `step` per input, each copying the run, so a fold was quadratic
 * in its run — 30 s for a 4,000-item map (P39 fact 1). What it returns is unchanged on every sequence whose region paths are branch paths (P39 decision 5; `RN-R43`'s one stated limit).
 *
 * `RN-R3`: read in **append order**, never sorted. Two settlements can share a
 * millisecond; `schedulerTimestamp` is the scheduler's clock and `observedAt` is
 * ours, and neither is a total order (`OR-R5`).
 */
export function fold(inputs: readonly FoldInput[]): RunState {
  return foldWith(inputs);
}

/** Convenience for a log with no region events — the shape most fixtures take. */
export function foldLog(log: readonly LogRecord[]): RunState {
  return fold(log.map((r) => ({ kind: r.kind, record: r }) as FoldInput));
}

/**
 * Whether a run can still change — the predicate an L6 harness resolves on, and
 * the reason it needs no clock.
 *
 * `running` and `awaiting_action` are two of the three outcomes that say more input is
 * coming that can MOVE the run (`cancelling`, the third, below): a dispatched node has not settled, or a person has
 * not answered. `completed`, `failed` and `stuck` are reached only when nothing is
 * live. `halted` and — since W158 — `cancelled` are reached with dispatched nodes
 * possibly still unsettled: the driver has HALTED the run, so what is in flight
 * settles into `nodes` routed nowhere and moves no outcome. Either way the run is
 * over. **This is `stuck`'s point:** before
 * [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)
 * a permanently stuck run was `completed`, so a harness waiting on this predicate
 * would have reported the hang as a success rather than waiting forever — which
 * is the worse of the two failures.
 *
 * **`cancelling` is the THIRD unfinished outcome since v0.18** (`RN-R12`, `RN-R30`, ADR 0104): the run's owner
 * cancelled it and a task is still stopping, so its `task.cancelled` is still coming and moves the outcome to
 * `cancelled`. Calling it terminal would settle a runtime's `done` at the request — before the tasks have stopped,
 * the app's #1 complaint (P34 fact 6).
 *
 * **`interrupted` is TERMINAL, unchanged by v0.19** (`RN-R12`, `RN-R32`, ADR 0105): the run's owner stopped it and the
 * driver went deaf, so nothing more can move it on THIS runtime — its in-flight set is moved by a resume on another,
 * which is not this driver's input. A runtime's `done` settles on it once the stop's cancels have resolved (`RN-R33`).
 */
export function isTerminal(s: RunState): boolean {
  return s.outcome !== 'running' && s.outcome !== 'awaiting_action' && s.outcome !== 'cancelling';
}

/** A node's entry, or `null`. Not an outcome record: it has no `attempts` and no timing fields. */
export function nodeOf(s: RunState, taskId: string): NodeRun | null {
  return s.nodes[taskId] ?? null;
}

export type { OutcomeRecord };
