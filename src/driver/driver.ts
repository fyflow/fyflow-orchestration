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
import {
  allRegions, branchPathOf, buildGraph, innermostRegionOf, toRegion,
  type Graph, type RegionSets,
} from '../definition/regions.ts';
import { validateDefinition, violatedRules } from '../definition/validate.ts';
import {
  assertRunId, branchIndices, buildTaskId, InvalidTaskId, parseTaskId, type TaskIdParts,
} from './ids.ts';
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
 * **A `map` node's `over` did not name an array on the value it received** —
 * `spec/flow-definition.md` section 2, and
 * [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md).
 *
 * A map's arity is a **run-time** fact: `over` is a key name, so what the document
 * declares is *where the arity will be found* and never what it is
 * ([ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)).
 * `FD-V25` checks that `over` is a string in `FD-V16`'s charset and can check
 * nothing else, because no validator can see a value that does not exist yet — the
 * spec says so in place and reserves no rule id for this.
 *
 * **Why a refusal rather than treating it as zero items.** Measured: a map that
 * opens nothing appends nothing, so the fold's `regions` has no entry, `RN-R10`
 * iterates nothing and the run reports **`completed`**. A mistyped `over`, or a
 * worker that returned `{}` where the flow expected `{items: [...]}`, would then be
 * a run that finished successfully having done none of its work — the silent stop
 * `spec/flow-definition.md` section 3 refuses **by name**, and the same shape W32's
 * conformity reader found behind the missing `default` arm.
 *
 * **Why a NEW class, and it is the one this plan reserved the right to refuse.**
 * [P10](../../doc/plans/p10-is-fan-out-one-feature-or-two.md)'s *"decisions taken
 * before fan-out"* rule 4 declares **no new error class** *"because every candidate
 * for one is a measurement W33 has not taken yet"* — and this is that measurement.
 * The alternative was `InvalidDefinition`, and it would be a lie in the direction
 * that matters: **the definition is valid and the DATA is wrong**, which is a
 * different person's bug. A flow author reading `InvalidDefinition` would go and
 * read their flow, where there is nothing to find.
 *
 * **Reported through `onRunFailure`, not thrown** (`OR-R10`), because `enter` is
 * reached from the scheduler listener — except from `start()`, which both reports
 * and rethrows because the caller is on the stack.
 *
 * An **empty array is not this**: `{items: []}` is a lawful map of zero items and
 * is `spec/join-policy.md` section 5's own case.
 */
export class UnresolvedMapArity extends Error {}

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

/**
 * **The item index of every `map` region on the path to a dispatch, keyed by map
 * node id** — `branchPathOf`'s third argument
 * ([ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
 * rule 5). Empty for every flow with no map in it, which is why a `fanout`-only
 * run takes exactly the road it took at v0.7.
 *
 * **One frozen shared instance rather than a fresh `new Map()` per call.** A map
 * region's fan-out is the one place in this driver that runs a loop whose bound is
 * a run-time N, so the default argument on `enter`, `dispatch`, `pathOf` and
 * `settleJoin` is evaluated once per dispatch at 1000s-10000s scale
 * (`doc/concept.md` section 1).
 */
const EMPTY_INDICES: ReadonlyMap<string, number> = new Map<string, number>();

/**
 * `itemIndices` with one more region's index bound — a COPY, never a mutation.
 *
 * Copying rather than threading one mutable map is what makes an inner map's
 * indices invisible to its siblings: at N=3 the three instances are opened in one
 * loop, and a shared map would leave all three carrying whichever index was
 * written last. That is a per-dispatch value, so it is built per dispatch.
 */
function withIndex(
  base: ReadonlyMap<string, number>,
  mapId: string,
  index: number,
): ReadonlyMap<string, number> {
  const next = new Map(base);
  next.set(mapId, index);
  return next;
}

/** For `UnresolvedMapArity`'s message: what a value IS, in one word a reader can act on. */
function describeShape(v: unknown): string {
  if (v === null) return 'null';
  if (v === undefined) return 'absent';
  if (Array.isArray(v)) return 'an array';
  const t = typeof v;
  return `${'aeiou'.includes(t[0]!) ? 'an' : 'a'} ${t}`;
}

function cloneRecord<T extends { result?: unknown }>(r: T): T {
  return r.result === null || r.result === undefined
    ? { ...r }
    : { ...r, result: structuredClone(r.result) };
}

/**
 * One element of the fold's input sequence, copied and frozen on the way out
 * (ADR 0014). Only the two record kinds carry a `result`; the other **five** are
 * flat and primitive, so a shallow freeze of a fresh object is the whole copy.
 *
 * *(Read "four" until W33 added `regionEntered`. The count is in the sentence that
 * justifies the `{ ...i }` fall-through, so it is load-bearing prose rather than
 * decoration: the fall-through is only sound while every remaining kind is flat.)*
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
 * **`spec/` says these refusals "terminate the run" — `FD-R1`, `ID-R1`, `OR-R6`, and since W13
 * `ID-R4` — and a `throw` cannot do that.** (`InvalidTaskId` used to reach this path too, raised by
 * `parseTaskId` rather than named as a rule;
 * [ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
 * moved it to `onUnmintedTask` and `ID-R5`, so it no longer does.) Every one of them is reached from inside a
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
  /** **This driver's run** — ADR 0022 rule 1. Never parsed from the inbound task id. */
  runId: string;
  /**
   * `DuplicateTaskId` | `UncloneableResult` | `NoMatchingEdge` | `UndispatchedTask` | the policy's
   * own error name.
   *
   * **`InvalidTaskId` is not in this list and no raise site the LIBRARY reaches puts it here**
   * ([ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)).
   * Four callers could: `buildTaskId`'s two in `advance` and `dispatch`, unreachable from a
   * definition `FD-V16` validated because `FD-V16`'s charset and `ID-R2`'s are **the same
   * expression** (`ID_RE` in `src/definition/validate.ts` and `SEGMENT` in `./ids.ts` — asserted
   * equal in `test/driver/lifetime.test.ts`, because the argument turns on it), plus a literal `0`
   * for `attempt`; and `src/fold/run-state.ts`'s two `parseTaskId` calls, unreachable while ADR 0014
   * keeps the fold fed by a driver that appends only ids it minted.
   *
   * **Not a claim about the field.** `kind` is `err.constructor.name`, so consumer code that throws
   * an `InvalidTaskId` inside a predicate or a `describe` still lands here — and `AGENTS.md` §9 now
   * recommends `parseTaskId` in a `try`/`catch` to consumers, which is where one would come from.
   */
  kind: string;
  message: string;
  cause: unknown;
}

/**
 * A settlement arrived whose task id **no driver minted**, and this is the only
 * thing that will ever say so —
 * [ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md),
 * `ID-R5`.
 *
 * **The observation is that the id did not parse; the inference is that it is
 * nobody's**, and the inference is what makes this a report rather than a
 * refusal: `buildTaskId` produces only four-segment ids in the `ID-R2`/`FD-V16`
 * charsets, so an id that fails `parseTaskId` cannot have come from any driver.
 *
 * **This is NOT `ID-R4` tier 1, and the asymmetry is the whole of ADR 0027.** A
 * settlement carrying *another run's* id is dropped in silence
 * ([ADR 0023](../../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
 * rule 3) because the driver that owns that run will report it. An unparseable id
 * is owned by no run, so silence means nobody reports it — which is why this one
 * gets a channel and tier 1 still does not.
 */
export interface UnmintedTask {
  /**
   * **This driver's run** — ADR 0022 rule 1, and here it could not have been
   * anything else: the inbound id carries no run id to parse one out of.
   */
  runId: string;
  /** The scheduler event's name, so `task.user_action`'s pair is distinguishable from a settlement. */
  event: string;
  /**
   * Exactly what `detail.id` held, uncoerced. **`unknown` rather than `string`**,
   * because a `detail` with no `id` at all — a scheduler version skew, which
   * `CLAUDE.md` records happening to `task.progress` at 0.3.0 — is one of the ways
   * this fires, and reporting `''` for it would hide the sharpest case.
   */
  taskId: unknown;
  /** `parseTaskId`'s own message, so the grammar is stated in one place. */
  reason: string;
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
  /**
   * Called when a settlement arrives whose task id no driver minted, instead of
   * stopping the run — `ID-R5`,
   * [ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md).
   *
   * **Optional, and a run that registers nothing still routes correctly**: the
   * dropped settlement was never this run's, so nothing this driver is waiting for
   * goes missing. What registering it buys is the one case where that reasoning
   * could be wrong — a scheduler whose `detail.id` stopped being what we
   * dispatched — which is otherwise a hang with nothing said.
   */
  onUnmintedTask?: (info: UnmintedTask) => void;
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

    // **A region opener INSIDE a `map` region is refused, and the refusal is taken
    // from a measurement** — W33's conformity reader,
    // [Q160](../../doc/open-questions.md).
    //
    // **Why it exists.** A `map` is the first construct in this library that enters
    // one opener node **more than once in a run**, and every piece of per-region
    // run-time state here is keyed by that node's **id**: `joinState`,
    // `firedJoins`, `RegionEvent.regionId`, and the fold's `regions`. So the second
    // instance's `open()` **discards** the first's state, `firedJoins` makes the
    // second join unreachable, and the fold merges two distinct regions into one
    // entry. **That is [ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
    // own central finding one layer down**: the ADR decided *two features* because
    // `branchOf` is keyed by branch node id and collapses repeated entries, and the
    // driver's run-time structures are keyed the same way.
    //
    // **Measured on a definition `validateDefinition` accepts with ZERO findings** —
    // `map(split) → lead → fanout(f2) → {p,q} → join(j2) → join(collect)`, with all
    // seven tasks settling `done`: the run reported **`stuck`**, `split` branch `1`
    // received no terminal event, and `f2` held all four branch paths of two
    // separate regions under one `joined: true`.
    //
    // **Why a refusal and not a fix.** Making this work means region IDENTITY
    // becomes (opener node, enclosing path) rather than a node id — which changes
    // what `RegionEvent.regionId` means, what the fold's `regions` is keyed by, and
    // what `joinStatusOf` and `onUnsatisfiableJoin` name. That is a decision with
    // its own evidence and its own item, and
    // [Q156](../../doc/open-questions.md) is where P10 left *"may a map's branch
    // itself open a region"* — **expressible and undecided**. W33 makes it
    // expressible-and-REFUSED instead of expressible-and-silently-wrong, which is
    // `doc/workflow.md` section 1 rule 4 applied to a capability rather than to a
    // check. **No corpus flow is refused**: `map-in-fanout` nests a map inside a
    // FANOUT branch, which is the other direction and is fine, because a fanout's
    // opener is entered once.
    //
    // `InvalidDefinition` rather than a new class: the document names a structure
    // this driver cannot execute, which is what that class already means, and
    // [P10](../../doc/plans/p10-is-fan-out-one-feature-or-two.md) decision 4 spends
    // its one new class on `UnresolvedMapArity`.
    for (const r of this.regions) {
      if (r.opensWith !== 'map') continue;
      const openers = [...r.members].filter((id) => {
        const k = this.graph.byId.get(id)?.kind;
        return k === 'fanout' || k === 'map';
      }).sort();
      if (openers.length > 0) {
        throw new InvalidDefinition(
          [],
          `definition "${definition.flowId}" opens a region inside map region "${r.fanoutId}" ` +
            `(${openers.map((o) => JSON.stringify(o)).join(', ')}). A map enters its branch once ` +
            'per item, so an opener inside it is entered N times — and this driver keys a ' +
            "region's policy state, its fired-join latch and the fold's `regions` by the opener's " +
            'NODE ID, so instance 2 would discard instance 1 and one join would answer for both. ' +
            'Refused rather than run wrong; whether a map may contain a region is Q156.',
        );
      }
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
          // **[Q87](../../doc/open-questions.md) — this sentence recommended the violation.** It
          // ended at *"on the same scheduler"*, and the obvious second `Driver` for a caller
          // re-running a workload is one carrying the run id they already have. Two drivers on one
          // run id mint the SAME task ids, so `dispatched.has()` is true in both, `ID-R4` cannot
          // see it, and one settlement dispatches the successor twice with nothing reported.
          // **No driver can detect it** — `SchedulerLike` has two methods and neither asks who else
          // is subscribed (ADR 0013 rule 1) — so it stays a precondition, and the least the
          // library can do is not advise against it in its own error text.
          'Construct a second Driver WITH A DIFFERENT RUN ID; ADR 0023 makes that safe on the ' +
          'same scheduler. Run ids must be unique across the drivers sharing one — nothing ' +
          'enforces that and nothing can see it violated.',
      );
    }
    this.started = true;
    try {
      this.enter(runId, this.def.entry, payload);
    } catch (e) {
      // `start` is called by the caller, not by a listener, so it BOTH reports
      // and rethrows: the caller is on the stack and can act on it.
      this.failRun(e);
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
    //
    // **`enter` is reached from THREE entry points, not two, and this one reported
    // nothing** — W33's conformity reader. `onEvent` catches and reports (`OR-R10`);
    // `start` catches, reports and rethrows because the caller is on the stack. This
    // call sat outside any guard, so a refusal raised while routing a RESOLUTION was
    // thrown at the caller and **nothing else happened**: no `stopped` input,
    // `hasFailed()` still false so later settlements kept routing, and
    // `fold(foldInputs())` reporting **`completed`** for a run that did none of its
    // work.
    //
    // **Measured, against the listener as a control** — the same map whose `over`
    // does not name an array, reached two ways:
    //
    //     through the listener:  reported [UnresolvedMapArity]  hasFailed true   stopped
    //     through resolve():     threw, reported []             hasFailed false  COMPLETED
    //
    // The unguarded call predates this item — a throwing user predicate could always
    // reach it — but W33 put a LIBRARY-raised refusal on the road, and ADR 0004's
    // resolution road is exactly how a `user_action` node advances into a map.
    //
    // **It reports AND rethrows, like `start`**, because `resolve` is caller-initiated
    // and the caller is on the stack — `spec/outcome-record.md` section 6's own form.
    try {
      this.advance(runId, nodeId, branchPath);
    } catch (e) {
      this.failRun(e);
      throw e;
    }
    return true;
  }

  // --- the scheduler's side ----------------------------------------------------

  private onEvent(name: string, detail: TaskDetailLike): void {
    // The listener boundary is also the FAILURE boundary: a throw from here is
    // discarded by dispatchEvent, so it is caught, reported, and the run stops.
    //
    // **The failure is reported under THIS driver's run id, always.** It used to
    // be parsed out of the inbound task id, with `'<unknown>'` when that failed —
    // three sources for one constant value, and after ADR 0022 the driver knows
    // its run from the constructor's first line. W13's conformity reader measured
    // the two ways that was wrong: a malformed settlement reported `'<unknown>'`
    // for a run that has a name, and a foreign one reported *another run's* id
    // out of a driver that does not serve it. A `RunFailure` names the run that
    // failed, which is the only run this driver has.
    try {
      this.onEventOrThrow(name, detail);
    } catch (e) {
      this.failRun(e);
    }
  }

  /** Whether this run has been stopped by a refusal. */
  hasFailed(): boolean {
    return this.failed;
  }

  private failRun(cause: unknown): void {
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
      runId: this.runId,
      kind: err.constructor?.name ?? 'Error',
      message: err.message,
      cause,
    });
  }

  private onEventOrThrow(name: string, detail: TaskDetailLike): void {
    // **`ID-R4` — ADR 0023. Ownership is decided from the TASK ID ALONE, before
    // anything else reads the detail**, and the order is the whole rule.
    //
    // W13 shipped this after `normalizeEvent` and W13's conformity reader measured
    // what that cost: `normalizeEvent` throws `UncloneableResult` (`OR-R6`) while
    // copying `result`, so **another run's settlement with an uncloneable result
    // stopped THIS run** and reported a `RunFailure` carrying *that other run's
    // id*. ADR 0023 rule 3 says a foreign settlement *"is not a failure, is not
    // counted, and does not reach `onRunFailure`"* — all three were false, on
    // precisely the `OR-R6` path L6's `uncloneable` row exercises, on the very
    // topology this ADR exists to bless. **Deciding ownership first is what makes
    // rule 3 true**, and it is cheaper too: a driver no longer deep-clones the
    // result of every settlement it is about to discard.
    //
    // **Tier 0 — an id no driver minted.** ADR 0023 rule 2 used to stop the run
    // here, on the ground that *"does not parse" is not "not ours", it is a
    // defect*, and left the topology it blessed carrying an unauditable
    // precondition: one plain non-flow task settling stopped **every** driver on
    // that scheduler. [ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
    // supersedes it and retires the precondition — `buildTaskId` emits only
    // four-segment ids in the `ID-R2`/`FD-V16` charsets, so an id that fails
    // `parseTaskId` was minted by **no** driver and cannot be this run's.
    // [Q86](../../doc/open-questions.md), `ID-R5`.
    //
    // **Reported rather than merely dropped, and that half is not decoration.**
    // Tier 1 is silent because the driver that owns that run will report it; an
    // unparseable id is owned by nobody, so silence means nobody ever does. The
    // one way the inference above could be wrong — a scheduler whose `detail.id`
    // stopped being what we dispatched, which is what happened to
    // `task.progress`'s shape at 0.3.0 — is a hang with nothing said, and this
    // callback is the whole of the difference.
    //
    // **`catch`, not a second parser.** A total `tryParseTaskId` would put the id
    // grammar in two places, which `spec/task-id.md` section 2 is about, and the
    // `catch` hands the consumer `parseTaskId`'s own message.
    //
    // **The `instanceof` is a FORWARD guard and it cannot fire today. Said here
    // because W18's own provocation caught the stronger claim being false:** the
    // `try` wraps exactly one call, and that call raises exactly one class, so
    // widening the catch to bare `catch (e)` changes no reachable behaviour and no
    // assertion can kill it. What it guards is the next edit — anything added
    // inside this block (a second parse, a lookup, a normalization moved up) would
    // otherwise be silently reported as a foreign task and the run would carry on
    // past a real defect. `normalizeEvent`, which raises `OR-R6`, is deliberately
    // BELOW this and outside the block for that reason.
    const taskId = detail?.id;
    let parts: TaskIdParts;
    try {
      parts = parseTaskId(typeof taskId === 'string' ? taskId : '');
    } catch (e) {
      if (!(e instanceof InvalidTaskId)) throw e;
      // **The `reason` must describe what ARRIVED, not the stand-in we parsed.**
      // A `detail` with no string `id` is handed `''`, so `parseTaskId`'s message
      // would read *"task id \"\" has 1 segments"* — a sentence about a value the
      // scheduler never sent, in exactly the case a consumer is debugging a
      // version skew. `taskId` carries the truth and this now does too.
      const reason = typeof taskId === 'string'
        ? e.message
        : `the event detail carried no string \`id\` (got ${typeof taskId})`;
      // Called INSIDE `onEventOrThrow`, so a callback that throws is caught at
      // `onEvent` and stops the run — reinstating, through the consumer's own
      // code, the damage ADR 0027 removed. Documented rather than guarded: every
      // other callback here is treated the same way, and swallowing a consumer's
      // throw is its own defect. `AGENTS.md` §9 says it.
      this.opts.onUnmintedTask?.({ runId: this.runId, event: name, taskId, reason });
      return;
    }
    const { runId, nodeId, branchPath } = parts;

    // Tier 1 — another run's settlement. Routine the moment two drivers
    // legitimately share one scheduler. This driver has no standing to judge
    // another run, so it is ignored, silently, and nothing is appended. **The
    // cost is stated in that ADR rather than hidden: a driver is now silent about
    // what it drops**, so a caller that starts `run-l` meaning `run-1` sees a run
    // that never progresses.
    if (runId !== this.runId) return;
    // Tier 2 — OUR run id, on a task we never dispatched. Impossible if the
    // bookkeeping is right, which is exactly `ID-R1`'s character: within one run
    // this driver mints every id it dispatches. Three shapes reach here and every
    // one was silently accepted and routed before W13 — a node never dispatched,
    // a node not in the definition at all, and a branch path never opened.
    //
    // **Both tiers are decided before the terminal state is even read**, and that
    // is deliberate: W13's adequacy reader found three surviving mutations that
    // exempted one state each (`done` was covered by the fixtures, `failed` and
    // `user_action` were not). A guard that cannot see the state cannot be
    // conditioned on it.
    if (!this.dispatched.has(taskId as string)) {
      throw new UndispatchedTask(
        `UndispatchedTask: "${taskId}" settled in run "${runId}", but this driver never ` +
          'dispatched it. ID-R4: within one run the driver mints every task id it dispatches, so ' +
          'either its path bookkeeping is wrong or something else is writing into this run id.',
      );
    }

    const record = normalizeEvent(name, detail, this.now());
    if (!record) return; // OR-R3/OR-R4: this event writes nothing

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
    // **Derived from the graph, not truncated from the inbound path** — W21.
    // This read `Number(branchPath.split('.')[0])`, the OUTERMOST index only,
    // which is correct at depth 1 and silently wrong at depth 2: `scoreC` in a
    // nested region minted `r1:scoreC:0:0` where `spec/task-id.md` section 1
    // reserves `r1:scoreC:1.0:0`.
    // The item index of every map region this node's path crosses, read back out
    // of the path the scheduler echoed and `ID-R4` already vouched for. `-` and
    // any fanout-only path give an empty map, so every pre-v0.8 flow takes the
    // same road it took before — which is what the corpus asserts.
    const itemIndices = this.indicesFrom(nodeId, branchPath);
    const taskId = buildTaskId(runId, nodeId, branchIndices(this.pathOf(nodeId, itemIndices)));
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
      if (region) this.settleJoin(runId, region, itemIndices);
      return;
    }
    // **Deep-copied on the way to the next task.** `outcome.result` is the stored
    // record's field: handing it to `createTask` makes the next task's payload the
    // previous record's `result`, and an inline worker that mutates what it was
    // given mutates a record already in the log. `spec/outcome-record.md` section
    // 4 — *"copying the field copies the reference"* — applied to the one exit
    // that actually reaches a worker.
    // The source node's region travels with the hop, and it is the **innermost**
    // one.
    //
    // **This comment said *"a non-`end` node is in at most one region (FD-V19,
    // FD-V22), so `regionOf` is unambiguous HERE"*, and `spec/flow-definition.md`
    // v0.7 made it false.** It was true because `FD-V15` refused a fanout inside
    // another fanout's region; retiring that rule puts every node of a nested
    // region in two, and the two rules the sentence cited are not the one that
    // was carrying it. `regionOf` is unambiguous now because it resolves
    // **innermost** rather than first-declared — `FD-V19` and `FD-V22` are what
    // make *innermost* unique, which is the true half of the old sentence.
    this.enter(
      runId, result.taken.to, cloneValue(outcome.result), branchPath,
      this.regionOf(nodeId)?.fanoutId,
      // The successor is in this node's region, in one enclosing it, or in a
      // region it opens itself — never in a *different* map region at the same
      // depth, because entering one goes through that map node, which mints its
      // own indices. So the accumulated map is what the successor needs, and it is
      // keyed per region so an inner map adding to it cannot disturb an outer one.
      itemIndices,
    );
  }

  /**
   * Walk into a node. `fanout`, `join` and `end` dispatch nothing and are passed
   * through within this turn; only a `task` becomes a scheduler task.
   */
  private enter(
    runId: string,
    nodeId: string,
    payload: unknown,
    fromBranch = '-',
    fromRegion?: string,
    itemIndices: ReadonlyMap<string, number> = EMPTY_INDICES,
  ): void {
    const node = this.graph.byId.get(nodeId);
    if (!node) return;

    switch (node.kind) {
      case 'task':
        return this.dispatch(runId, node, payload, itemIndices);

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
        // **The region is ENTERED, and the fold is told so** — W33. Appended beside
        // `open` in both region-opening arms, because that is the moment
        // `spec/run-state.md`'s *"one entry per fan-out region ENTERED"* becomes
        // true. Here it is redundant with the `branch.opened`s below — `FD-V9`
        // guarantees at least two — and it is emitted anyway so the invariant has
        // ONE mechanism rather than one for a fanout and another for a map.
        this.append({ kind: 'regionEntered', regionId: region.fanoutId });
        // **Each branch entry's OWN path, not its bare index** — W21. This
        // emitted `String(i)` and threaded it, so a nested fanout opened its
        // branches at `0`/`1` with the outer prefix discarded: `fromBranch` was in
        // scope at both lines and thrown away. Derived, an inner branch opens at
        // `1.0` and the outer prefix cannot be lost, because it was never carried.
        // Computed once per branch rather than twice — W21's conformity reader
        // priced the derivation and found it dearer than the fork table said.
        const paths = region.branches.map((b) => this.pathOf(b, itemIndices));
        region.branches.forEach((_b, i) => {
          this.emit({ type: 'branch.opened', regionId: region.fanoutId, branchPath: paths[i]! });
        });
        // **The last two arguments here are unobservable and are kept deliberately**
        // — W21's adequacy reader. `FD-V9` makes every branch entry a `task`, and
        // `enter`'s `task` arm discards `fromBranch` and `fromRegion`, so nothing
        // downstream reads them. They are passed because the branch entry is the
        // one node whose region and path are known here without a lookup, and the
        // moment `FD-V9` is lifted (or a branch entry may be a `join`) the arm
        // stops discarding them. **Said in place rather than left for the next
        // reader to rediscover as dead code.**
        region.branches.forEach((b, i) =>
          this.enter(runId, b, payload, paths[i]!, region.fanoutId, itemIndices));
        return;
      }

      // **A map opens N instances of ONE branch, N coming from the value this node
      // received** — `spec/flow-definition.md` section 2's `map`, and
      // [ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md).
      // [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md).
      //
      // **Clause for clause this is the `fanout` arm above with ONE difference**,
      // and that is the whole of ADR 0036's *"what the two share is the region;
      // what differs is the fan-out"* reaching the driver. Each clause of that arm
      // was enumerated before this one was written, because each is a thing a map
      // could silently drop:
      //
      //   1. the region lookup, and the silent return when there is none;
      //   2. `open` the policy BEFORE the first `branch.opened`, so `emit` has
      //      state to step (section 4's owner table);
      //   3. every branch's OWN path, derived rather than its bare index (W21);
      //   4. EVERY `branch.opened` emitted before ANY dispatch (`JP-R5`);
      //   5. entering each branch with the region and path known here.
      //
      // The difference is clause 3's source. A `fanout` derives each index from the
      // graph; a map's index is **a property of the dispatch** and the graph cannot
      // answer, so it is supplied here — the one place in the whole driver that
      // knows which instance this is — and threaded down as `itemIndices`.
      case 'map': {
        const region = this.regions.find((r) => r.fanoutId === nodeId);
        if (!region) return;
        // The arity, and the ONE run-time refusal this item takes. See `mapItems`.
        //
        // **It THROWS and is not caught here, which is what makes it behave like
        // every other refusal in this file.** The first version caught it and called
        // `failRun` directly; that reported correctly from the listener and made
        // `start()` **stop rethrowing**, because `start`'s own catch never saw it.
        // A map may be the `entry` node (`FD-V3` refuses only a `join` or an `end`),
        // so that path is reachable — and `start` is documented to BOTH report and
        // rethrow, since the caller is on the stack. Caught by the test written for
        // that case rather than by reading. The two boundaries above already do the
        // right thing with a throw: `onEvent` catches and reports (`OR-R10`), and
        // `start` catches, reports and rethrows.
        const items = this.mapItems(node, payload);
        if (this.opts.joinPolicy) {
          this.joinState.set(region.fanoutId, this.opts.joinPolicy.open(toRegion(region) as Region));
        }
        // The region is ENTERED — see the `fanout` arm. **Here it is the only thing
        // that says so when N is 0**, and without it that run folds to `completed`.
        this.append({ kind: 'regionEntered', regionId: region.fanoutId });
        // **`region.branches` is `[branch]` whatever N is** — that is the shape
        // `spec/join-policy.md` section 1 fixes and `toRegion` hands a policy, and
        // it is deliberately NOT widened to N copies. See that document's section 3
        // for why: N copies would give `arrival-count` `need: 0` at N=0 and fire a
        // join no branch reached, which is character for character the defect
        // [ADR 0025](../../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
        // refused `JP-R7`'s variant for.
        const branch = region.branches[0];
        if (branch === undefined) return; // FD-V25 makes this unreachable; FD-V21 is why
        const idx = items.map((_v, i) => withIndex(itemIndices, nodeId, i));
        const paths = idx.map((m) => this.pathOf(branch, m));
        // `JP-R5`, and it is the clause a map is most likely to lose: the arity is
        // known only once the previous node settles, but it is known ALL AT ONCE at
        // this line, so the two-pass emission is available here exactly as it is for
        // a fanout. Measured: `FD-V25` makes a map's branch a `task`, and entering a
        // task dispatches without emitting — so no event can appear between two
        // `branch.opened`s, which is `FD-V9`'s role for a fanout played by `FD-V25`
        // for a map. The clause stays unfalsifiable and its two guarantors are now
        // two rules rather than one.
        for (const p of paths) {
          this.emit({ type: 'branch.opened', regionId: region.fanoutId, branchPath: p });
        }
        // **Every instance receives the SAME payload the map itself received**,
        // which is the `fanout` arm's behaviour unchanged and is deliberately not a
        // decision this item takes. **What a branch RECEIVES is
        // [Q11](../../doc/open-questions.md), narrowed to the fan-out edge, and it is
        // [W34](../../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s**
        // — P10's decision 2, which orders the two so the rule is written from
        // cases rather than from a mechanism. **So a map here dispatches N tasks and
        // hands each one the whole value rather than its own item**: arity-correct
        // and payload-unchanged, stated loudly because handing instance `i` item `i`
        // is the obvious edit and it would answer Q11 from inside W33 where nobody
        // is looking for it — which is the move `JP-R7`'s own paragraph warns about
        // one layer down. The join still carries `null` for the same reason.
        idx.forEach((m, i) => this.enter(runId, branch, payload, paths[i]!, region.fanoutId, m));
        // **N = 0 opens nothing, and the region is REPORTABLE through the
        // `regionEntered` append above and nothing else.** With that append gone
        // the fold's `regions` has no entry at all, `RN-R10` iterates nothing and
        // the run folds to **`completed`** — measured, and it is character for
        // character the false statement
        // [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)
        // exists to remove.
        //
        // **There is deliberately no `settleJoin` call here, and the first version
        // had one.** *"Ask the policy at N = 0, exactly as after any terminal
        // event"* reads right and is dead: `spec/join-policy.md` section 5's ruling
        // is that **no policy can answer anything but `waiting`** for a region that
        // opened nothing, because its state is byte-identical to its state before
        // any branch opens. Rule 8 measured it — deleting the call cost **0
        // failures** — so it was a line that claimed to do something and could not.
        // A guard with no reachable effect is not defence in depth; it is a reader
        // being told the driver consults a policy here when the answer is fixed.
        // If [Q97](../../doc/open-questions.md) is ever answered with a signal that
        // lets a policy tell the two apart, this is where the call goes back.
        //
        // **But a region that opened NOTHING still ends the branch it sits in** —
        // `JP-R10`, reached without a policy verdict. W33's adequacy reader measured
        // the gap on `map-in-fanout` with the inner map over an empty list: branch
        // `1` of `outer` was **opened with no terminal event at all**, in a run
        // neither suspended nor in flight, which is a state `JP-R5`'s own enumeration
        // does not admit. `JP-R10` exists for exactly this shape and **could not
        // fire**, because it is triggered by a policy answering `unsatisfiable` and
        // section 5's ruling is that no policy can say that at N = 0. The mechanism
        // W22 built for the gap was unreachable here by construction.
        //
        // **Why the driver may decide this and may NOT decide satisfaction.** That a
        // region which opened zero branches can never be satisfied is arithmetic over
        // section 2's vocabulary, not a policy's judgement: `branch.arrived` is
        // emitted only for a branch that was opened, so with none opened no arrival
        // can ever occur, and every policy section 3 fixes needs one. The driver is
        // reporting a **routing fact it alone knows** — the region is closed and
        // empty — and the enclosing region's policy then decides for itself what that
        // means, which is section 4's owner table intact.
        //
        // **What is NOT done here, and the omission is the decision.** No
        // `joinSettled` is appended and `onUnsatisfiableJoin` does not fire: `RN-R11`
        // gives `joined: false` the meaning *"a policy reported it unsatisfiable"*,
        // and none did. So this region stays `joined: null` and the run is `stuck`
        // by `RN-R10` — reported, without its REASON, which is
        // [Q97](../../doc/open-questions.md) exactly where section 5 leaves it.
        const enclosing = this.regionOf(region.fanoutId);
        if (items.length === 0 && enclosing) {
          this.emit({
            type: 'branch.lost',
            regionId: enclosing.fanoutId,
            branchPath: this.pathOf(region.fanoutId, itemIndices),
            reason: 'failed',
          });
          this.settleJoin(runId, enclosing, itemIndices);
        }
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
        this.settleJoin(runId, region, itemIndices);
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
        if (region && fromBranch !== '-') this.settleJoin(runId, region, itemIndices);
        return;
      }

      // **A node kind this driver cannot execute REFUSES rather than returning.**
      // Added by [W32](../../doc/work-items/w32-what-a-map-fanout-is.md) as a
      // declared late exception, after its conformity reader measured what the
      // absence cost.
      //
      // Until v0.8 there were four kinds and four arms, so falling off the end was
      // unreachable and nothing said so. `spec/flow-definition.md` v0.8 adds a
      // fifth — `map` — and W32 made such a definition VALID while the driver that
      // executes it is [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md)'s.
      // With no arm and no `default`, `enter` returned having done nothing: no
      // dispatch, no `branch.opened`, no `pathEnded`, no `RunFailure`. **Measured**:
      // `spec/examples/valid/map-fanout.flow.json` dispatched its entry task and
      // stopped, and the run folded to **`completed`** — which is character for
      // character the false statement
      // [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)
      // exists to remove, and the silent stop `spec/flow-definition.md` section 3
      // refuses BY NAME on P1's own validity grounds.
      //
      // **A `default` rather than a `map` arm, deliberately.** The defect is the
      // missing exhaustiveness, not the missing kind: `node.kind` is a union and
      // TypeScript does not require the switch to be total, so a sixth kind would
      // land here the same way. `never` is what makes that a COMPILE error for any
      // kind the union knows about, so this arm is only reachable for a kind the
      // types do not cover — which is exactly `map` today, and nothing tomorrow.
      //
      // **Reported, not thrown, and with an EXISTING class.** `enter` is reached
      // from the scheduler listener, so `OR-R10` says report; and
      // [P10](../../doc/plans/p10-is-fan-out-one-feature-or-two.md)'s *"decisions
      // taken before fan-out"* rule 4 says this plan declares **no new error
      // class**, because every candidate for one is a measurement W33 has not taken
      // yet. `InvalidDefinition` is the honest existing one: the document names a
      // node this driver cannot execute.
      //
      // **W33 replaces this with the real arm.** When it does, this becomes
      // unreachable again — and `never` will say so at compile time rather than in
      // silence, which is the difference this arm is for.
      default: {
        // **The exhaustiveness assertion W32's comment described and could not
        // write** — W33. While `map` had no arm, `node` narrowed to `MapNode` here
        // and this line would not compile; W32 cast instead and said in prose what
        // it wanted. With every kind of the union handled, `node` narrows to `never`
        // and the assignment is legal, so **a sixth kind added to `FlowNode` without
        // an arm is now a COMPILE error in five typecheck projects** rather than a
        // silent stop found by a reader. That is the guarantee this arm was for.
        const exhaustive: never = node;
        void exhaustive;
        const kind = (node as { kind?: unknown }).kind;
        this.failRun(
          new InvalidDefinition(
            [],
            `definition "${this.def.flowId}" routes into node "${nodeId}", whose kind ` +
              `${JSON.stringify(kind)} this driver cannot execute. A definition the validator ` +
              'accepts and the driver cannot run is a silent stop, which ' +
              'spec/flow-definition.md section 3 refuses by name.',
          ),
        );
        return;
      }
    }
  }

  /**
   * **No `branchPath` parameter since W21, and its absence is the point.** It took
   * one and immediately reduced it to `Number(branchPath.split('.')[0])` — the
   * outermost index — so the caller threaded a path and the callee threw all but
   * its first segment away. Both halves are gone: the id's third segment is
   * `spec/task-id.md` section 1's *"property of the node"*, derived here from the
   * graph, and there is no longer a carried value that could disagree with it.
   */
  private dispatch(
    runId: string,
    node: FlowNode & { kind: 'task' },
    payload: unknown,
    itemIndices: ReadonlyMap<string, number> = EMPTY_INDICES,
  ): void {
    const taskId = buildTaskId(runId, node.id, branchIndices(this.pathOf(node.id, itemIndices)), 0);

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

  /**
   * **A node's `branchPath`, derived from the graph** — `spec/task-id.md` section
   * 1's *"a property of the node"*, and W21 is where the driver stopped carrying
   * it instead.
   *
   * This was `branchPathFor(nodeId, inherited)`: it asked whether the node was in
   * a region and, if so, returned **whatever path the caller had been carrying**.
   * That is right whenever the carried value happens to be the node's own path
   * and unfalsifiable when it is not — and at depth 2 it was not, because the
   * `fanout` arm discarded the outer prefix before threading it.
   *
   * **Measured before the change**: `branchPathOf` is total over the whole valid
   * corpus and agrees with the threaded value on every depth-1 flow, so this
   * replaced a carried value with a derived one and changed no existing id.
   */
  /**
   * **A map's arity, and the one run-time refusal this item takes.** See
   * `UnresolvedMapArity` for why it refuses rather than reading a missing key as
   * zero items.
   *
   * `?.` rather than a typeof test: a `payload` of `null`, `undefined`, a number
   * or a string all reach `undefined` here rather than throwing, so one predicate
   * — *is it an array* — covers every shape a worker can return.
   */
  private mapItems(node: FlowNode & { kind: 'map' }, payload: unknown): readonly unknown[] {
    const v = (payload as Record<string, unknown> | null | undefined)?.[node.over];
    if (Array.isArray(v)) return v;
    throw new UnresolvedMapArity(
      `UnresolvedMapArity: map node "${node.id}" is declared \`over: ${JSON.stringify(node.over)}\`, ` +
        `and the value it received carries no array there — it is ${describeShape(v)}, on a payload ` +
        `that is ${describeShape(payload)}. A map's arity is a run-time fact, so no validator rule ` +
        'could have seen this: `FD-V25` checks that `over` is a key NAME. Return an array (an empty ' +
        'one is a lawful map of zero items), or the previous node did not produce what this flow says it does.',
    );
  }

  private pathOf(nodeId: string, itemIndices: ReadonlyMap<string, number> = EMPTY_INDICES): string {
    return branchPathOf(this.regions, nodeId, itemIndices);
  }

  /**
   * **The item index of every `map` region a settled node's path crosses, read
   * back out of the path itself** — [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md).
   *
   * `advance` is reached from the listener and from `resolve()` with the settling
   * node's `branchPath`, and it must rebuild that node's task id to find its
   * outcome. Since [W21](../../doc/work-items/w21-the-branch-path-is-a-path.md) it
   * rebuilds by DERIVING the path from the graph — and inside a map region the
   * graph has no answer (`ID-R6`), so the derivation needs the run-time indices
   * back.
   *
   * **The source is the inbound path, and that is sound for one stated reason**:
   * `ID-R4` tier 2 has already refused any id this driver did not dispatch, so by
   * the time this runs the path is one **this driver minted**. It is not the
   * scheduler's word for it and not the caller's.
   *
   * **What it costs, stated rather than hidden.** For a map region the rebuilt id
   * now agrees with the inbound one *by construction*, so `ID-R1`'s
   * derive-and-compare is not checking the map segments — it checks the node id,
   * the run id and every `fanout` segment, and for the map segments it is a
   * round-trip. The check that a map's segments are right is `ID-R1` at DISPATCH,
   * where they are minted from `items.map((_, i) => i)` and a duplicate is refused
   * before `addTask` sees it.
   *
   * Segments are outermost-first (`spec/task-id.md` section 1) and the region walk
   * is innermost-outward, so they are consumed from the END.
   */
  private indicesFrom(nodeId: string, branchPath: string): ReadonlyMap<string, number> {
    if (branchPath === '-') return EMPTY_INDICES;
    const segs = branchPath.split('.');
    const out = new Map<string, number>();
    // The same guard `branchPathOf` carries and for the same reason: `FD-V10`
    // forbids cycles so the walk strictly ascends, and an unbounded loop over a
    // caller-supplied path is one edit away from being one.
    const seen = new Set<string>();
    let at = nodeId;
    for (let k = segs.length - 1; k >= 0; k--) {
      const r = innermostRegionOf(this.regions, at);
      if (!r || seen.has(r.fanoutId)) break;
      seen.add(r.fanoutId);
      if (r.opensWith === 'map') {
        const n = Number(segs[k]);
        // A non-segment cannot reach here through `parseTaskId`, which applies
        // `spec/task-id.md` section 1's grammar. Skipping rather than throwing
        // keeps this a reader of a value already validated: `branchPathOf` is what
        // refuses, and it will, naming the map.
        if (Number.isInteger(n) && n >= 0) out.set(r.fanoutId, n);
      }
      at = r.fanoutId;
    }
    return out;
  }

  /**
   * **Delegated to the region maths, and it is not a `.find()` any more** —
   * `spec/flow-definition.md` section 4, *"Which region a node is in, when it is
   * in two"*, added at v0.7 when `FD-V15` was retired
   * ([W20](../../doc/work-items/w20-what-a-nested-region-is.md)).
   *
   * This read `this.regions.find((r) => r.members.has(nodeId))`, which answered
   * *"which region"* with **the order the author declared the fanouts in**.
   * Nothing could see it while nested fan-out was refused; the moment it was not,
   * the same graph gave two different answers depending on node order.
   */
  private regionOf(nodeId: string): RegionSets | undefined {
    return innermostRegionOf(this.regions, nodeId);
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
  private settleJoin(
    runId: string,
    region: RegionSets,
    itemIndices: ReadonlyMap<string, number> = EMPTY_INDICES,
  ): void {
    const policy = this.opts.joinPolicy;
    if (!policy || this.firedJoins.has(region.fanoutId)) return;
    if (!this.joinState.has(region.fanoutId)) return;
    const state = this.joinState.get(region.fanoutId);

    const status = policy.status(state);
    if (status === 'waiting') return;

    if (status === 'unsatisfiable') {
      // `describe` is computed BEFORE the region is latched.
      //
      // **This comment used to claim the other order "marks the join fired and
      // loses the report permanently — even a caller that catches never learns
      // why". No such difference is reachable, and W18's adequacy reader measured
      // it**: swapping the two lines leaves all 402 assertions green, because a
      // throwing `describe` reaches `failRun`, `this.failed` is set, and every
      // later event returns before `settleJoin` — so the second call the argument
      // turns on cannot happen. Identical output under both orders.
      //
      // Kept in this order as a **forward** guard, and stated as one, which is
      // ADR 0027's own correction of the `instanceof` in `onEventOrThrow` applied
      // one function away: *a defensive clause that cannot fail is not a defect;
      // describing it as though it could is*.
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
      // **A dead join ends the branch it sits in — [ADR 0030](../../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
      // rule 4, and this arm emitted nothing at all before W22.**
      //
      // At depth 1 there was nothing to emit: the region's `fanout` is in no
      // region, `regionOf` returns `undefined`, and this block does not run. So
      // the gap was **unobservable rather than absent** — the same shape as
      // [Q114](../../doc/open-questions.md) one item earlier, where the join's
      // successor carried no path and depth 1 could not tell.
      //
      // **What it cost, measured on a nested flow before the fix:** the outer
      // branch emitted `branch.opened` and **no terminal event**, in a run that
      // was neither suspended nor in flight — `verdict: 'stuck'`, every task
      // settled. `JP-R5` enumerates the two states in which a branch may have no
      // terminal event, and this is neither, so the old behaviour broke a rule
      // this document has had since W1. `RunState.regions.outer.settled` was
      // `{"0":"arrived"}` with branch 1 simply missing.
      //
      // **`branch.lost` rather than a new event**, because
      // `spec/join-policy.md` section 2 already defines it as *"the path ended
      // inside the region without reaching an `end` node"*, which is what a join
      // that can never fire is. `JP-R6` says adding an event is a spec change
      // with its own rationale; not adding one needed this sentence instead.
      //
      // **The driver reports the fact and the POLICY decides what it means** —
      // section 4's owner table, and it is why this is not a walk outward marking
      // enclosing joins dead. The cascade is emergent: measured at depth 3, one
      // emission takes `inner` → `lost(mid)` → `mid` also `unsatisfiable` →
      // `lost(outer)` → `outer` **satisfied**, because `a` arrived there and
      // nothing arrived at `mid`. Three different verdicts from one line, none of
      // them the driver's.
      //
      // **No `pathEnded` is appended, deliberately.** Both of its reasons are
      // false here: `'end'` plainly, and `'no-eligible-edge'` because the join
      // *has* an eligible edge and simply never fires. A third reason is a
      // `spec/run-state.md` change W22 does not own, and the `joinSettled`
      // record above already says the path stopped here — `RN-R10` derives
      // `stuck` from it whatever this branch does.
      const enclosing = this.regionOf(region.fanoutId);
      if (enclosing) {
        this.emit({
          type: 'branch.lost',
          regionId: enclosing.fanoutId,
          branchPath: this.pathOf(region.fanoutId, itemIndices),
          reason: 'failed',
        });
        this.settleJoin(runId, enclosing, itemIndices);
      }
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
    // **The join's exit carries the path its REGION sits at — [Q114](../../doc/open-questions.md),
    // closed by W21.** This was `this.enter(runId, edge.to, null)`, with no
    // `fromBranch` at all. That is right at depth 1, where a join's successor is
    // outside every region and `'-'` is the answer; **inside a nested region it is
    // wrong**, and the outer region recorded the arrival of branch 1 as `'-'`.
    // Measured on `valid/nested-fanout.flow.json` before the fix: the run's last
    // event was `branch.arrived region=outer path=-`.
    //
    // **Derived, not threaded, so it needed no new state.** The region's own
    // `fanout` is a node, and a node has a path — which is the whole argument for
    // the arm of W21's fork this item took. `pathOf('inner')` is `'1'`; at depth 1
    // `pathOf` of a top-level fanout is `'-'`, so every existing run is unchanged.
    // The `null` PAYLOAD is untouched and is a different question ([Q36](../../doc/open-questions.md));
    // this changes only which branch the arrival is attributed to.
    // **Both halves, and the first version shipped only one.** The path says
    // WHICH branch; `fromRegion` says which region that branch belongs to, and the
    // `end` arm attributes a `branch.exited` by `fromRegion` alone. With it
    // `undefined`, an inner join routing to an `end` inside the enclosing region
    // emitted **no terminal event for the outer branch at all** — `JP-R5` says a
    // branch that is neither suspended nor in flight has exactly one — and the
    // outer join sat at `live: 1` forever. **A valid definition that hangs**,
    // found by W21's conformity reader; it was invisible before this item only
    // because the path was `'-'` and the arm was dead twice over.
    //
    // Derived exactly as the path is: the region's own `fanout` is a node, so the
    // region CONTAINING it is that node's region.
    if (edge) {
      this.enter(
        runId, edge.to, null, this.pathOf(region.fanoutId, itemIndices),
        this.regionOf(region.fanoutId)?.fanoutId, itemIndices,
      );
    }
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
