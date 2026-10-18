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
import type { Edge, Finding, FlowDefinition, FlowNode, GateNode, GateType, GateTypes, LanguageAdapter, Languages, NodeTypeDeclaration, NodeTypeEntry, NodeTypes, Pools, Registry, TerminalState, WorkerEntry, Workers } from '../definition/types.ts';
import { checkRegistry, isDerivation } from '../definition/registry.ts';
// W73 (P19 decision 5, `FD-R4`): the two boundaries no static check can reach are held to the
// workers' declared schemas ONCE each, and the targets of the first are the wiring check's own walk.
import { describeFindings, findings, type SchemaFinding } from '../definition/schema.ts';
import { boundaryTargets } from '../definition/wiring.ts';
import {
  allRegions, branchPathOf, buildGraph, innermostRegionOf, outputIsVisible, toRegion,
  type Graph, type RegionSets,
} from '../definition/regions.ts';
import { effectiveSettings, gateTypesOf, languagesOf, nodeTypesOf, poolsOf, readKeyPath, referenceTarget, retryPolicyProblem, routesOf, validateDefinition, violatedRules, workersOf } from '../definition/validate.ts';
import {
  assertRunId, branchIndices, buildTaskId, InvalidTaskId, parseTaskId, type TaskIdParts,
} from './ids.ts';
import { effectiveOutcome, isSuspended, type LogRecord, type OutcomeRecord, type ResolutionRecord } from './log.ts';
import { normalizeEvent, type TaskDetailLike } from './listener.ts';
import { gateEdge, selectEdge, type PredicateRegistry } from './routing.ts';
import type { RegionEvent } from './events.ts';
import type { JoinPolicy, Region, UnsatisfiableJoin } from './policy.ts';
// Type-only, so it is erased and there is no runtime cycle with `src/fold/`.
// The driver PRODUCES this sequence (ADR 0014) and the fold consumes it; the type
// stays where `spec/run-state.md` defines it rather than being copied here.
import type { FoldInput } from '../fold/run-state.ts';
// W58 — the shape `retryPolicy` and `defaultRetryPolicy` share, defined once beside the node.
import type { RetryPolicy } from '../definition/types.ts';
// **The scheduler, by NAME — ADR 0048, superseding ADR 0013 rule 1** ([W57](../../doc/work-items/w57-the-scheduler-is-a-dependency.md)).
// `FyflowTask` is what `createTask` builds when the option is omitted, so a consumer
// wires a real scheduler up without writing a factory; the type import is what makes
// Q71's closure an L0 assertion (see `SchedulerLike`). `fyflow-scheduler` is a peer
// dependency, declared where an installer reads it, and this BARE specifier is the one
// form a published file may reach it by — `S7` refuses every other.
import { FyflowTask } from 'fyflow-scheduler';
import type { FyflowScheduler } from 'fyflow-scheduler';

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

  /**
   * **A definition's findings as the error, built in ONE place** — P34 fact 12, W169. `new Driver` throws it for what
   * `validateDefinition` found, and `createRuntime`'s `start` and `resume` throw it for what `runtime.check` found (ADR 0096
   * rule 5), so the two roads cannot drift apart: `rules` is `violatedRules(findings)` — sorted, each once — and the
   * message is `definition "<flowId>" is invalid: ` then every finding as `<rule> at <at>: <detail>`, `at` reading
   * `<document>` where a finding has none, joined by `; `. *(Until W169 the two roads each built it inline, the same text
   * twice.)* `at` is printed as given — a node id, an edge site (`id#edgeN`), or `<document>` for `null`.
   *
   * **Its precondition is at least one finding**, and an EMPTY list is refused with a `RangeError` (the conformity reader's
   * C3): an `InvalidDefinition` naming no defect would read *"is invalid: "* and name nothing. Both callers throw only
   * when they found something.
   */
  static fromFindings(flowId: string, findings: Finding[]): InvalidDefinition {
    if (findings.length === 0) throw new RangeError(`InvalidDefinition.fromFindings: definition "${flowId}" has no finding — an invalid definition names at least one`);
    return new InvalidDefinition(
      violatedRules(findings),
      `definition "${flowId}" is invalid: ` + findings.map((f) => `${f.rule} at ${f.at ?? '<document>'}: ${f.detail}`).join('; '),
    );
  }
}
export class DuplicateTaskId extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DuplicateTaskId';
  }
}

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
export class UnresolvedMapArity extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'UnresolvedMapArity';
  }
}

/**
 * **`FD-R3` — a `needs` reference that names a node this run did not produce an
 * output for on this branch path.**
 * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md).
 *
 * **Its own class rather than `InvalidDefinition`, for `UnresolvedMapArity`'s own
 * reason**: `FD-V27` has already checked that the declaring node is reachable from
 * the named one, which is everything the GRAPH can say. Whether it ran is a fact
 * about this run — a decision routed around it, or it is suspended on a person —
 * and a flow author sent to read their document would find nothing wrong there.
 *
 * **And it is a different class from `UnresolvedMapArity` rather than a widening of
 * it**, because the two send a reader to different places: that one says *the
 * previous node did not return an array*, which is a WORKER's bug; this one says
 * *the node you named did not run on your path*, which is the FLOW's shape.
 *
 * Reported through `OR-R10` from a listener, and reported **and rethrown** from
 * `start()` and `resolve()`, which are caller-initiated — exactly as
 * `UnresolvedMapArity` is.
 */
export class UnresolvedReference extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'UnresolvedReference';
  }
}

/**
 * **`FD-R5` — a gate's TYPE returned a route it does not declare.** P24 decision 8,
 * [ADR 0067](../../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md),
 * [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md). The counterpart of `FD-R1`: nothing at load
 * can refuse it, because only RUNNING the type's `fn` reveals it — `FD-V41` checks every declared route is
 * wired, and a route nobody declared has no edge to be wired by.
 *
 * **Its own class, for `UnresolvedMapArity`'s reason**: the flow is valid and the DATA is not wrong — the
 * CODE registered as the type is, which is a third person's bug, and naming it sends a reader to the type
 * rather than to the document. It stops the run through `OR-R10` (reported from a listener, reported AND
 * rethrown from `start()` and `resolve()`), and **nothing is appended for the gate**: no `gated` element,
 * because no route was taken, and the memory the type may have written before returning is the driver's own
 * and dies with the halted run. *A type whose `fn` THROWS takes the same road with its OWN error* — the road
 * a throwing decision predicate takes, measured at W93's declaration step.
 */
export class UndeclaredRoute extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'UndeclaredRoute';
  }
}

/**
 * **`FD-R4` — one of the two values no static check can reach fails the schema the worker's author
 * wrote for it: the run's PAYLOAD at `start()`, held to the input schema of every task it reaches
 * with no worker in between, or a PERSON's resolution at `resolve()`, held to the parked node's
 * worker output schema** — [P19](../../doc/plans/p19-what-a-schema-buys-an-author.md) decision 5,
 * [W73](../../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md).
 * Once per run and once per human action, never per settlement (that is OUT of P19 as a default).
 *
 * **A task that declares a `transform` is not held at `start()`** — ADR 0101,
 * [W170](../../doc/work-items/w170-a-transforming-task-is-not-held-at-start.md), Q633's road 2: its
 * worker's `inputSchema` holds the transform's RESULT (`FD-C5`), which only the worker wrapper makes;
 * `givenVerdict` (`tryTransform(…, { input })` on the node as declared) on that task, with the value it
 * RECEIVES — the payload composed through its `needs`, a map branch's element — is the check before a run.
 *
 * **A REJECTED COMMAND and not a run failure**, on `RS-R1`'s own reading of `resolve` — *it came from
 * outside and a caller can retry* — and it is the maintainer's choice at W73's stop-and-ask 2.
 * Thrown at the caller with NOTHING appended, nothing reported through `onRunFailure` and the run
 * unaffected: at `start()` it is thrown before `started` is set, so the driver is UNSTARTED and a
 * corrected payload may start it (`ID-R3` sees nothing, because nothing ran); at `resolve()` the task
 * is still suspended and a corrected value resolves it. A boundary that STOPPED the run would turn a
 * typo in a human's value into a dead run, which is the opposite of what the schemas are for.
 *
 * **Its own class**, because the two it sits beside send a reader elsewhere: `UnresolvedMapArity` is
 * a WORKER's bug and `UnresolvedReference` the FLOW's shape; this is the CALLER's value — the one
 * thing at that boundary no document declared — and the message names the node, the worker, the
 * schema kind and every finding, so the caller reads the value and not the flow.
 *
 * `DriverOptions.validateBoundaries: false` turns both off (the runtime forwards it); the default is
 * ON, priced at W73's declaration: under a microsecond on every corpus payload, 0.35 ms at the
 * walking worst case, against ~100 ms per real run.
 */
export class BoundaryRefused extends Error {
  /** Which boundary refused: the run's payload at `start`, or a person's value at `resolve`. */
  readonly boundary: 'start' | 'resolve';
  /** The task node whose worker's schema refused the value — or, at `resolve`, the ASK whose `answerSchema` did (W180). */
  readonly nodeId: string;
  /** The suspended task — or parked ask — at `resolve`; `start` has dispatched nothing yet. */
  readonly taskId: string | null;
  /** Every way the value failed the schema — `findings`' own list, one line each in `message`. */
  readonly findings: readonly { path: string; says: string }[];
  constructor(boundary: 'start' | 'resolve', nodeId: string, taskId: string | null, fs: readonly { path: string; says: string }[], message: string) {
    super(message);
    this.name = 'BoundaryRefused';
    this.boundary = boundary;
    this.nodeId = nodeId;
    this.taskId = taskId;
    this.findings = fs;
  }
}

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
export class MultipleRuns extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'MultipleRuns';
  }
}

/**
 * **`checkpoint()` on a driver that has not started a run** — `RN-R14`,
 * [ADR 0064](../../doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md).
 *
 * Thrown, like `MultipleRuns`, because the caller is on the stack and nothing is appended. **A
 * checkpoint of an unstarted driver would have to invent its header's ENTRY PAYLOAD**, and the
 * only candidates are `undefined` — which is also what a run started with `undefined` carries, so
 * the two would be indistinguishable to the resume that reads it — or a sentinel the contract
 * does not define. Refusing is the one answer that cannot be mistaken for a run.
 */
export class NotStarted extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'NotStarted';
  }
}

/**
 * **Why a run-control call was refused** — `RN-R31`, v0.18 ([ADR 0104](../../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md)),
 * and `RN-R33`, v0.19 ([ADR 0105](../../doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md)).
 *
 * | reason | refused when |
 * |---|---|
 * | `unsupported` | the driver's scheduler has no `cancel` — `SchedulerLike`'s optional member (P34 (b)); a cancel and a stop alike |
 * | `not-started` | before `start()` or `resume()`, or on a driver whose resume was refused before it regenerated a run (`RN-R23`) — one refused for a halt regenerated in its lost tail keeps that run, and is `halted` |
 * | `halted` | the run was halted by a refusal (`OR-R10`) |
 * | `cancelled` | a task of the run settled `cancelled` with no request before it, so `RN-R28` ended it — and, for a STOP, a cancel its owner requested too (P34 (c): *after a cancel, a stop is refused*) |
 * | `interrupted` | a CANCEL of a run its owner has STOPPED (`RN-R33`, P34 (c): *a cancel after a stop is refused by name*) — v0.19; and since v0.20 a PAUSE or an UNPAUSE of one (`RN-R35`) |
 * | `paused` | a PAUSE of a run already paused — or whose pause, called mid-step, is still to be taken (`RN-R35`, P34 (e): *a second pause is refused by name*) — v0.20 |
 * | `not-paused` | an UNPAUSE of a run that is not paused (`RN-R35`, P34 (e)) — v0.20 |
 * | `ended` | nothing is in flight and nothing is parked AT REST — the run has finished. Mid-step (a callback on the driver's own step) it is not refused: see `stepping`. A cancel, a stop and a pause — never an unpause, which rewrites no outcome |
 *
 * **A SECOND cancel, and a SECOND stop, is not refused**: each forwards its `graceMs` (`RN-R31`, `RN-R33`). **Widened
 * by W174 with `interrupted`, and by W175 with `paused` and `not-paused`** (`control` `'pause'` and `'unpause'`); a
 * consumer branching on either should not switch on it exhaustively.
 */
export type RunControlRefusalReason = 'unsupported' | 'not-started' | 'halted' | 'cancelled' | 'interrupted' | 'paused' | 'not-paused' | 'ended';

/**
 * **A run-control call the driver will not make, thrown at the caller BEFORE anything is recorded or sent** —
 * `RN-R31`, ADR 0104. Thrown, as `MultipleRuns` and `ResumeRefused` are, because the caller is on the stack and nothing
 * has been appended; **one class with a `reason`**, on `ResumeRefused`'s precedent, so a consumer catches one class and
 * branches on `reason`. `control` names the call — `'cancel'`, since v0.19 `'stop'` (`RN-R33`, ADR 0105), and since
 * v0.20 `'pause'` and `'unpause'` (`RN-R35`, ADR 0106).
 */
export class RunControlRefused extends Error {
  readonly control: 'cancel' | 'stop' | 'pause' | 'unpause';
  readonly reason: RunControlRefusalReason;
  constructor(control: 'cancel' | 'stop' | 'pause' | 'unpause', reason: RunControlRefusalReason, message: string) {
    super(message);
    this.name = 'RunControlRefused';
    this.control = control;
    this.reason = reason;
  }
}

/** What `Driver.cancel` takes — `RN-R31`, P34 stop-and-ask (c). */
export interface RunCancelOptions {
  /** Who cancelled the run — recorded on the `cancelRequested` element and in `RunState.cancelRequest`. */
  actor: string;
  /** Why — recorded beside `actor` (`null` when absent), and handed to the scheduler's `cancel` as given. */
  reason?: string;
  /**
   * Threaded pools: the ms each task's worker gets to stop by itself before the scheduler forces it — the pool's
   * `cancelGraceMs` when absent. **A request, not a guarantee**: at the pin `0` arms a 0 ms timer a prompt worker's
   * reply can beat (P34 fact 9, S12). A SECOND call with a shorter value escalates the tasks still stopping.
   */
  graceMs?: number;
}

/**
 * **What `Driver.stop` takes** — `RN-R33`, P34 stop-and-ask (d): the cancel's three options, read the same way.
 */
export interface RunStopOptions {
  /** Who stopped the run — recorded on the `interrupted` element and in `RunState.interruption`. */
  actor: string;
  /** Why — recorded beside `actor` (`null` when absent), and handed to the scheduler's `cancel` as given. */
  reason?: string;
  /**
   * Threaded pools: the ms each task's worker gets to stop by itself before the scheduler forces it — the pool's
   * `cancelGraceMs` when absent. **A request, not a guarantee** (P34 fact 9, S12). A SECOND call with a shorter value
   * escalates the tasks still stopping.
   */
  graceMs?: number;
}

/**
 * **What `Driver.pause` and `Driver.unpause` take** — `RN-R35`, P34 stop-and-ask (e): who paused or unpaused the run,
 * recorded on the `paused` or `unpaused` element. Nothing else: a pause cancels nothing, so it has no `reason` to hand
 * the scheduler and no `graceMs`.
 */
export interface RunPauseOptions {
  /** Who paused (or unpaused) the run — recorded on the element. */
  actor: string;
}

/**
 * **What a checkpoint's header says, and the number a resume refuses on** — `RN-R16`,
 * ADR 0064 rule 3. `1` at this version; it moves only when what a checkpoint CARRIES moves, and
 * a resume refuses a format it does not know — `ResumeRefused` with `reason: 'format'` (`RN-R23`, W89).
 */
export const CHECKPOINT_FORMAT = 1;

/**
 * **The header — the facts a run's EVENTS cannot regenerate** (`RN-R15`, ADR 0064 rule 2, P23
 * decision 4). Every other fact about a run is in its events, which the driver regenerates from
 * their settlements alone (P23 fact 1); these five are what the regeneration STARTS from.
 *
 * **Each field is a SELECTION with a named source, and the well-formed wrong ones are named with
 * it** — `doc/workflow.md` rule 8 obligation (a), v0.23 — because every one of them coincides
 * with the right answer on this repository's corpus and the tests are built where they do not:
 *
 * | field | its source | the wrong selection it is NOT |
 * |---|---|---|
 * | `format` | {@link CHECKPOINT_FORMAT} | — |
 * | `runId` | the driver's own (`ID-R3`, fixed at construction) | the runtime's first minted id, `r1` |
 * | `flowId`, `version` | the definition this driver was constructed with | a constant `1` — every corpus flow is at version 1 |
 * | `entryPayload` | a `structuredClone` of the value `start()` was CALLED with, taken at the call — or, on a RESUMED driver, of the stored header's (`RN-R15`, v0.10) | the entry node's COMPOSED payload (they differ whenever the entry declares `needs`), its RESULT, any task's envelope, or the caller's own object by reference |
 */
export interface CheckpointHeader {
  readonly format: number;
  readonly runId: string;
  readonly flowId: string;
  readonly version: number;
  /**
   * **The one thing the log does not carry** — P23 fact 2, [W42](../../doc/work-items/w42-what-a-decision-sees.md)'s
   * finding made load-bearing: a `dispatched` event holds a task id and no payload, and a replay
   * recomputes every dispatch's payload FROM this value. A copy, so a caller mutating the object it
   * passed to `start()` moves nothing here.
   */
  readonly entryPayload: unknown;
}

/**
 * **A checkpoint: the header and the run's WHOLE fold-input sequence, in append order** —
 * `RN-R14`, ADR 0064 rule 1, P23 decision 2. Not a `RunState`, which cannot restore a run because
 * the driver's private routing state is not in it; not the settlements alone, which regenerate the
 * run but cannot serve a live view. **So an event IS a checkpoint's element**: a checkpoint is
 * every event so far, and every event after it is an append — which is what `onFoldInput`'s
 * second argument, the position, is for (`RN-R18`).
 *
 * **PLAIN DATA**: it round-trips `structuredClone` exactly, holds no function, no class instance
 * and no reference to anything the driver holds (`RN-R17`). The contract is `structuredClone` and
 * not JSON (P23 decision 5): a `result` is whatever survived `OR-R2`'s clone, and that includes a
 * `Map` and a `Date`.
 */
export interface Checkpoint {
  readonly header: CheckpointHeader;
  readonly events: readonly FoldInput[];
}

/**
 * **Why a resume was refused** — `RN-R19` to `RN-R23`,
 * [ADR 0065](../../doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md).
 *
 * | reason | refused when | `index` |
 * |---|---|---|
 * | `format` | the value is not `{ header, events[] }`, or `header.format` is not {@link CHECKPOINT_FORMAT} (`RN-R16`) | `null` |
 * | `run` | `header.runId` is not the run this driver was constructed for (`ID-R3`) — every stored task id embeds it | `null` |
 * | `flow` | `header.flowId` or `header.version` is not this driver's definition's — **no migration** (P23 decision 7) | `null` |
 * | `halted` | the run was HALTED by a refusal — a stored `halted` element, or a stored `stopped` element, 0.7.0's name for it and read as one ([ADR 0102](../../doc/decisions/0102-a-run-the-driver-halts-is-halted-and-a-stored-stopped-reads-as-one.md) rule 3), or one the replay regenerates past the stored events (P23 decision 10) | that element's position |
 * | `cancelled` | the run was CANCELLED — a stored `outcome` element whose record is `terminalState: 'cancelled'`, checked after `halted` ([ADR 0094](../../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md) rule 5, W158) — **or, since v0.18, a stored `cancelRequested` element** (`RN-R31`, ADR 0104, W173), whichever comes first. Only a STORED one: a settlement is fed to the replay, never regenerated, so a replay cannot produce a cancel the store does not hold | the first such element's position |
 * | `diverged` | a stored element the replay does not produce at the same position — a predicate, a definition or an entry payload that is not what the stored run had (P23 decision 9) | the FIRST such position |
 */
/**
 * **Widened by W158 with `cancelled`, and that is BREAKING for a consumer switching on `reason` exhaustively** —
 * `resumed`'s and `gated`'s precedent (ADR 0094 consequence 1). **And W171 RENAMED `stopped` to `halted`** (ADR 0102, P34
 * stop-and-ask (f)) — BREAKING, and loudly: a consumer's `reason === 'stopped'` no longer compiles, so it cannot silently
 * come to mean P34's resumable stop. A 0.7.0 checkpoint holding a `stopped` element is refused `halted`.
 */
export type ResumeRefusalReason = 'format' | 'run' | 'flow' | 'halted' | 'cancelled' | 'diverged';

/**
 * **A resume the driver will not make, thrown at the caller** — `RN-R23`, ADR 0065.
 *
 * Thrown rather than reported, for `start()`'s reason: the caller is on the stack, and a checkpoint is a
 * value the CALLER brought (`OR-R12`'s asymmetry). **One class with a `reason`, on `BoundaryRefused`'s
 * precedent** of one class for two boundaries: a consumer catching a refused resume wants one `catch`,
 * and branches on `reason` — `diverged` and `halted` carry the POSITION a store can be inspected at.
 *
 * **What it leaves behind is the driver SPENT, and nothing handed to a scheduler.** A refusal before the
 * replay (`format`, `run`, `flow`, a stored `halted`, a stored `cancelled`) and a `diverged` one leave no run to checkpoint;
 * a `halted` the replay itself regenerated leaves the HALTED run, whose checkpoint a store may take —
 * its lost tail, `halted` included, was delivered to `onFoldInput` before the refusal was thrown.
 */
export class ResumeRefused extends Error {
  readonly reason: ResumeRefusalReason;
  /** The position `halted`, `cancelled` and `diverged` name; `null` for the three a header decides. */
  readonly index: number | null;
  constructor(reason: ResumeRefusalReason, index: number | null, message: string) {
    super(message);
    this.name = 'ResumeRefused';
    this.reason = reason;
    this.index = index;
  }
}

/**
 * **What a resume refuses a checkpoint for BEFORE replaying anything** — `RN-R23`, ADR 0065 rule 2.
 * `format`, `run` (only when `runId` is given — a runtime resuming names the run BY the header), `flow`,
 * a stored `halted` element (or a `stopped` one, 0.7.0's name for it — ADR 0102 rule 3) and a stored `cancelled` settlement, in that order; `null` when the header and the events' kinds say
 * nothing against it — which is not a promise the replay will agree, and that is `diverged`'s road.
 *
 * **Pure, exported, and called from two places**: `Driver.resume`, and `runtime.resume` BEFORE it builds
 * a driver — because a driver subscribes to its scheduler at construction and nothing can detach it, so
 * a runtime that built one to find out the header was wrong would have spent the run id (`RN-R25`). One
 * function, two callers, so the two cannot refuse different checkpoints.
 */
export function resumeRefusal(definition: FlowDefinition, checkpoint: unknown, runId?: string): ResumeRefused | null {
  const cp = checkpoint as { header?: unknown; events?: unknown } | null;
  const h = (typeof cp === 'object' && cp !== null ? cp.header : undefined) as Partial<CheckpointHeader> | undefined;
  if (typeof h !== 'object' || h === null || !Array.isArray(cp!.events)) {
    return new ResumeRefused('format', null,
      'ResumeRefused (format): this is not a checkpoint — a checkpoint is `{ header, events }` with `events` an array (RN-R14); ' +
        'resume takes what driver.checkpoint() returned, or a header and the events appended after it, positions 0 … n-1.');
  }
  if (h.format !== CHECKPOINT_FORMAT) {
    return new ResumeRefused('format', null,
      `ResumeRefused (format): the checkpoint's header.format is ${JSON.stringify(h.format) ?? String(h.format)}, and this version reads ` +
        `format ${CHECKPOINT_FORMAT} only (RN-R16) — a checkpoint in a format this driver does not know is refused rather than guessed at.`);
  }
  // **The header's three identifying fields must be the TYPES format 1 writes** — W89's conformity reader, finding 1: a
  // header with no `runId` passed this function when no run id was given (the runtime's call), so `runtime.resume` minted an
  // id, built a driver, spent the id, and only then heard the driver refuse it; a numeric `runId` reached the replay and was
  // refused as `diverged` at 0. A header that is not format 1's shape is refused as `format`, before anything is built.
  if (typeof h.runId !== 'string' || typeof h.flowId !== 'string' || typeof h.version !== 'number') {
    return new ResumeRefused('format', null,
      `ResumeRefused (format): the checkpoint's header carries runId ${JSON.stringify(h.runId) ?? String(h.runId)}, flowId ` +
        `${JSON.stringify(h.flowId) ?? String(h.flowId)} and version ${JSON.stringify(h.version) ?? String(h.version)} — format ${CHECKPOINT_FORMAT} ` +
        'writes two strings and a number (RN-R15), so this is not a header this version wrote.');
  }
  if (runId !== undefined && h.runId !== runId) {
    return new ResumeRefused('run', null,
      `ResumeRefused (run): the checkpoint is of run ${JSON.stringify(h.runId)}, and this driver serves run "${runId}" (ID-R3) — every ` +
        'task id the stored run dispatched embeds its run id, so the replay would mint different ids. Construct the driver with the header\'s runId.');
  }
  if (h.flowId !== definition.flowId || h.version !== definition.version) {
    return new ResumeRefused('flow', null,
      `ResumeRefused (flow): the checkpoint is of flow ${JSON.stringify(h.flowId)} version ${JSON.stringify(h.version)}, and this driver runs ` +
        `"${definition.flowId}" version ${definition.version}. There is no migration (P23 decision 7): a checkpoint resumes against the ` +
        'definition that produced it, and a changed flow is a new version.');
  }
  // **The DUAL READ — ADR 0102 rule 3 (W171).** A 0.7.0 store wrote the halt as `{ kind: 'stopped', reason }`, and
  // `CHECKPOINT_FORMAT` did not move, so the old kind is READ here as the halt it is: refused `halted`, at its position.
  // Without it a 0.7.0 checkpoint of a halted run passed this scan and was refused `diverged` by the replay (P34 fact 7).
  const at = (cp!.events as unknown[]).findIndex((e) => {
    const k = (e as { kind?: unknown } | null)?.kind;
    return k === 'halted' || k === 'stopped';
  });
  if (at >= 0) {
    const e = (cp!.events as { kind?: unknown; reason?: unknown }[])[at]!;
    return new ResumeRefused('halted', at,
      `ResumeRefused (halted): the stored run was HALTED by a refusal — its element at position ${at} is \`${String(e.kind)}\`` +
        `${e.kind === 'stopped' ? ' (the name 0.7.0 wrote for `halted`, ADR 0102)' : ''} (${JSON.stringify(e.reason)}). A halted run is not resumable ` +
        '(P23 decision 10): the refusal that halted it would halt it again, and the one class whose cause never reached the log — a result ' +
        'OR-R6 refused — cannot be regenerated at all.');
  }
  // **A stored CANCEL — `RN-R23`'s sixth reason, ADR 0094 rule 5 (W158).** After `halted`, which outranks it as
  // `RN-R28` ranks the two outcomes: a run refused for a defect AND cancelled reads as the defect. Only an APPENDED
  // cancel reaches here, and the driver appends every `task.cancelled` it hears for its run — so a cancel nobody
  // heard is not refused — and a STOP goes deaf before it cancels (`RN-R33`, ADR 0105, W174), so its own never are.
  // **A stored `interrupted` is not refused at all** (`RN-R32`): a stopped run is the one terminal run a resume takes.
  //
  // **And a stored `cancelRequested` — v0.18, `RN-R31`, ADR 0104 (W173)**: the FIRST element of either kind. A run its
  // owner cancelled holds its request BEFORE every settlement the request caused, so it is refused at the request; and
  // a run cancelled while parked, with nothing in flight, holds no cancelled settlement at all and was refused nowhere.
  const c = (cp!.events as unknown[]).findIndex((e) => {
    const x = e as { kind?: unknown; record?: { terminalState?: unknown } | null } | null;
    return x?.kind === 'cancelRequested' || (x?.kind === 'outcome' && x.record?.terminalState === 'cancelled');
  });
  if (c >= 0) {
    const e = (cp!.events as { kind?: unknown; actor?: unknown; record?: { taskId?: unknown } }[])[c];
    const what = e?.kind === 'cancelRequested'
      ? `the request of ${JSON.stringify(e.actor)} to cancel it (\`cancelRequested\`)`
      : `the settlement of ${JSON.stringify(e?.record?.taskId)} as \`cancelled\``;
    return new ResumeRefused('cancelled', c,
      `ResumeRefused (cancelled): the stored run was CANCELLED — its element at position ${c} is ${what}. ` +
        'A cancelled run is not resumable (ADR 0094 rule 5, ADR 0104): a cancel is its ' +
        'owner`s act, and a resume would hand the scheduler again what the owner stopped.');
  }
  return null;
}

/**
 * **Is a regenerated element the stored one?** — the prefix check's comparison for every kind the
 * replay REGENERATES (`RN-R20`). Those kinds are flat plain data — strings and booleans, one level of
 * nesting for a region event — **except a `gated` key and, since W180, an `asked` element's `input`, which are values of
 * any shape**: so this is structural equality over data, recursive, **key order ignored and an
 * `undefined`-valued key treated as absent**: a consumer's store may reorder keys or drop an undefined
 * one, and neither is the run diverging. The kinds the replay is FED (settlements, resolutions, `resumed`, and since
 * v0.19-v0.26 `interrupted`, `paused`, `unpaused` and `attempted` — `isFed`) are not compared by this: they are the
 * stored element itself, appended at its own position.
 */
function sameData(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  // **Structured-clone data, not only JSON** (W180, both readers' R13): an `asked` element's input is whatever reached
  // the ask, which may hold a `Map`, a `Set`, a `Date` and the rest of what `structuredClone` carries (`RN-R17`). Compared
  // by own keys alone, every `Map` equalled every other and a changed input resumed silently. So the class must agree;
  // an array is compared by LENGTH and element (a hole is not a missing tail); a `Map` and a `Set` by their entries in
  // order (`structuredClone` keeps it); a `Date` by its time, a `RegExp` by its source and flags, an `Error` by its name
  // and message, binary data by its bytes. A PLAIN object keeps the rule above: key order free, `undefined` as absent.
  const tag = Object.prototype.toString.call(a);
  if (tag !== Object.prototype.toString.call(b)) return false;
  if (Array.isArray(a)) {
    const y = b as unknown[];
    return a.length === y.length && a.every((v, i) => sameData(v, y[i]));
  }
  if (a instanceof Map || a instanceof Set) {
    const x = [...(a as Map<unknown, unknown>).entries()], y = [...(b as Map<unknown, unknown>).entries()];
    return x.length === y.length && x.every((e, i) => sameData(e[0], y[i]![0]) && sameData(e[1], y[i]![1]));
  }
  if (a instanceof Date) return Object.is(a.getTime(), (b as Date).getTime());
  if (a instanceof RegExp) return String(a) === String(b);
  if (a instanceof Error) return a.name === (b as Error).name && a.message === (b as Error).message;
  if (ArrayBuffer.isView(a) || a instanceof ArrayBuffer) {
    const bytes = (v: unknown) => (v instanceof ArrayBuffer ? new Uint8Array(v) : new Uint8Array((v as ArrayBufferView).buffer, (v as ArrayBufferView).byteOffset, (v as ArrayBufferView).byteLength));
    const x = bytes(a), y = bytes(b);
    return x.length === y.length && x.every((v, i) => v === y[i]);
  }
  const ra = a as Record<string, unknown>, rb = b as Record<string, unknown>;
  const ka = Object.keys(ra).filter((k) => ra[k] !== undefined);
  const kb = Object.keys(rb).filter((k) => rb[k] !== undefined);
  return ka.length === kb.length && ka.every((k) => Object.hasOwn(rb, k) && sameData(ra[k], rb[k]));
}

/**
 * The kinds a replay is FED rather than regenerates — `RN-R19`: three, and since v0.19 a fourth, `interrupted` (`RN-R32`,
 * ADR 0105), which only its owner's call can produce and which the replay therefore cannot regenerate — and since v0.20
 * a fifth and a sixth, `paused` and `unpaused` (`RN-R34`, ADR 0106), for the same reason — and since v0.26 a SEVENTH,
 * `attempted` (`RN-R40`, ADR 0113, W186): a scheduler stimulus, as a settlement is, which nothing the replay does produces.
 */
function isFed(e: FoldInput): boolean {
  return e.kind === 'outcome' || e.kind === 'resolution' || e.kind === 'resumed' || e.kind === 'interrupted' ||
    e.kind === 'paused' || e.kind === 'unpaused' || e.kind === 'attempted';
}

/**
 * **The attempt a `task.running` announces** — `RN-R40`, W186, P36 (f): the detail's `attemptNumber`, copied while the
 * listener runs (`OR-R1`: the detail IS the live task, and the scheduler moves the number on the next attempt), or `null`
 * when it is not a positive integer — a scheduler older than the pin, or a double that sends none — in which case nothing is
 * recorded. `0` is the scheduler's *before the first dispatch* and is never an attempt. Module-private: not surface.
 */
/**
 * **A pass-through's value, as the consumer receives it** — `RN-R42`, W187: a structured clone of its own, SHALLOW-frozen,
 * as `freezeInput` hands out a fold input's values; a primitive as it is. A value `structuredClone` refuses — a function in
 * an inline worker's progress `details`, which no thread boundary cloned first — is handed on `undefined`, the scheduler's
 * own treatment of an `emit` it cannot clone (its §6): a pass-through never stops a run by existing (P36 (k)).
 */
function frozenCopy(v: unknown): unknown {
  try {
    return Object.freeze(cloneValue(v));
  } catch {
    return undefined;
  }
}

function attemptNumberOf(detail: TaskDetailLike | undefined): number | null {
  const n = detail?.attemptNumber;
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 ? n : null;
}

/** One stored element, in a sentence a refusal can carry. */
function describeElement(e: unknown): string {
  if (e === undefined) return 'nothing';
  let s: string;
  try { s = JSON.stringify(e, (_k, v) => (typeof v === 'bigint' ? `${v}n` : v)); } catch { s = String((e as { kind?: unknown })?.kind); }
  return s.length > 160 ? `${s.slice(0, 157)}...` : s;
}

/**
 * **A call accepted mid-step and taken when the driver's step ends** — a pause or an unpause (`RN-R35`), or, since W180,
 * an ASK's answer (`RN-R37`): the resolution record built and every refusal asked at the call, appended at rest.
 */
type PendingCall =
  | { readonly kind: 'paused' | 'unpaused'; readonly actor: string }
  | { readonly kind: 'answer'; readonly record: ResolutionRecord; readonly runId: string; readonly nodeId: string; readonly branchPath: string };

/** What `createTask` is handed — held, during a replay, until the resume knows what is in flight. */
type TaskConfig = Parameters<TaskFactory>[0];

/** The replay's own state, present only while `resume()` runs — `RN-R19`. */
interface Replay {
  /** The stored events: what every regenerated element at a covered position is compared with. */
  readonly stored: readonly FoldInput[];
  /** The stored position of the element being FED right now, so its own append is not compared. */
  feeding: number;
  /** Every dispatch the replay made, by task id — HELD, never handed to the scheduler during the replay. */
  readonly held: Map<string, TaskConfig>;
}

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
export class UndispatchedTask extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'UndispatchedTask';
  }
}

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
 * Order two `branchPath`s the way `spec/task-id.md` section 1's grammar reads
 * them: dot-separated non-negative integers, **compared segment-wise as numbers**,
 * with a shorter path before a longer one that shares its prefix.
 *
 * **This exists because the order-dependence a satisfied join's `null` was
 * protecting against does not vanish when the payload is keyed — it MOVES**, from
 * *which value* to *which key order*, and it is invisible at depth 1. Measured:
 * integer-like object keys (`"0"`, `"1"`, `"10"`) are re-ordered **ascending by
 * the language**, so a depth-1 join is deterministic for free; **dotted keys are
 * not** — `"1.1"`, `"1.0"`, `"0.2"`, `"0.1"` keep **insertion** order, which for a
 * join is **settlement** order. So a nested region's collected payload would be
 * byte-different run to run for the same run, which is the flaky *result*
 * [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
 * exists to refuse.
 *
 * **Segment-wise numeric rather than lexicographic**, because lexicographic puts
 * `"10"` before `"2"`. Both are deterministic and only one reads as an order.
 */
function compareBranchPaths(a: string, b: string): number {
  const xs = a.split('.');
  const ys = b.split('.');
  for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
    // A missing segment sorts FIRST, so `1` precedes `1.0`. `-1` is not a legal
    // segment (the grammar admits no sign), so it cannot collide with a real one.
    //
    // **The MIXED-DEPTH clause has no case anywhere in this repository, and that is
    // recorded rather than argued.** W41's adequacy reader instrumented every call:
    // every `visible` list `compose` builds and every key set `collectArrivals`
    // reads is **single-depth**, so `1` is never compared with `1.0` and both
    // `-1 -> 1e9` and `Math.max -> Math.min` cost **0**. `JP-R12`'s rule text states
    // the ordering (*"`1` precedes `1.0` precedes `2` precedes `10`"*) and so does
    // the paragraph above; **nothing exercises it**. The shape that would is a join
    // collecting from branches at two different depths of one region, which
    // `FD-V19` and `FD-V22` between them do not admit today.
    const d = (xs[i] === undefined ? -1 : Number(xs[i])) - (ys[i] === undefined ? -1 : Number(ys[i]));
    if (d !== 0) return d;
  }
  return 0;
}

/**
 * **What a satisfied join carries** — `JP-R12`. One entry per branch that emitted
 * `branch.arrived`, keyed by its `branchPath`, valued by what that branch carried
 * into the join. **Inserted in `compareBranchPaths` order**, so the object is the
 * same value whatever order the branches settled in.
 *
 * A join nothing arrived at carries `{}` rather than `null`, and that is a real
 * case rather than a defensive one: `live-token` fires over an all-exited region,
 * which is the cost [ADR 0003](../../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
 * records for it.
 */
function collectArrivals(arrived: ReadonlyMap<string, unknown> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!arrived) return out;
  for (const path of [...arrived.keys()].sort(compareBranchPaths)) out[path] = arrived.get(path);
  return out;
}

/**
 * **`isPathPrefix` lived here and is GONE** —
 * [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
 * rule 2, and this note is here so its removal reads as a decision rather than as
 * a deletion. It answered *is one path a prefix of the other, segment-wise*, which
 * is the SPECIAL CASE of `outputIsVisible`'s *do the two paths agree on the regions
 * their chains share*: where the chains nest the shared regions are the shorter
 * chain entire and the two pick out the same entries. Where they do not nest it was
 * wrong, and only its reflexive case ever fired ([Q206](../../doc/questions/q206.md)).
 *
 * **Keeping both would be two sources that can disagree**, which ADR 0040 rule 2
 * refuses by name — and `deno lint` said so first: with the resolver re-pointed,
 * L0 reported `isPathPrefix is never used` before any test ran.
 *
 * **What its docblock carried is not lost.** The measured claim — `'1'` is a prefix
 * of `'1.0'` and is NOT a prefix of `'10'`, which a `String.startsWith` gets wrong
 * in exactly the case a map region of eleven or more items produces, invisible
 * below eleven instances and live at twelve — is now on `outputIsVisible` in
 * `src/definition/regions.ts`, and `test/driver/needs.test.ts`'s two-digit fixture
 * is still the only thing in the repository that discriminates it.
 */


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
 * **What a predicate sees under `ctx.needs` when its edge declares none** — `FD-C3`.
 * One frozen shared instance, for `EMPTY_INDICES`s reason: it is the value on every
 * edge in the corpus and on every edge of every flow written before v0.12.
 */
const EMPTY_NEEDS: Readonly<Record<string, unknown>> = Object.freeze({});

/**
 * **What `resolveReference` returns for a CONDITIONAL reference whose target has no
 * output on this path** — `FD-C4`, and
 * [ADR 0042](../../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)
 * rule 4. The two callers omit the key rather than writing it.
 *
 * **A private `Symbol` and not `undefined` or `null`.** `null` is a value a
 * reference legitimately resolves to — W45 measured `{"got": null}` for a reference
 * to an optional task that settled `failed` — and `undefined` is what
 * `structuredClone` of a missing `result` gives, so neither can carry *there is
 * nothing here*. A symbol cannot appear in a `result`, because `OR-R2` deep-copies
 * with `structuredClone` and a symbol is not cloneable, so `v !== ABSENT` cannot be
 * confused by anything a worker returns.
 */
const ABSENT: unique symbol = Symbol('needs.absent');

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

/** For `UndeclaredRoute`'s message: what a gate type returned, whatever it is. */
function describeRoute(v: unknown): string {
  if (typeof v === 'string') return JSON.stringify(v);
  return `${describeShape(v)} (${String(v)}) — not a route name`;
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
 * (ADR 0014). Only the two record kinds carry a `result`; `region` wraps one flat event,
 * `resumed` one array of strings, `gated` a KEY that may be anything the key path ends on, and `asked` an INPUT
 * that may be anything; the other **ten** are flat and primitive, so a shallow freeze of a fresh object is the
 * whole copy. *(Read "five" from W93 until W180 — four flat kinds added by W173-W175 had not moved it; "nine" until W186's
 * `attempted`, a task id and a number.)*
 * *(W93's `gated` is the second kind that is NOT flat — its declaration step found the fall-through
 * handing a consumer the driver's own key object wherever a key path ends on an object.)*
 * *(W180's `asked` is the third — its `input` is whatever reached the ask, of any shape — and it has its own arm for
 * the same reason, `RN-R17` and P35 fact 4: the fall-through would hand a consumer the driver's own kept input.)*
 *
 * *(Read "four" until W33 added `regionEntered`. The count is in the sentence that
 * justifies the `{ ...i }` fall-through, so it is load-bearing prose rather than
 * decoration: the fall-through is only sound while every remaining kind is flat. **W89's
 * `resumed` is the first kind since that is NOT flat**, and it went through the fall-through on
 * the item's first run — handing a consumer the driver's own `taskIds` array — caught by W88's
 * every-kind copy case, `RN-R17`, which is exactly what that case was built to do.)*
 */
function freezeInput(i: FoldInput): FoldInput {
  return Object.freeze(
    i.kind === 'outcome' || i.kind === 'resolution'
      ? { ...i, record: Object.freeze(cloneRecord(i.record)) }
      : i.kind === 'region'
      ? { ...i, event: Object.freeze({ ...i.event }) }
      : i.kind === 'resumed'
      ? { ...i, taskIds: Object.freeze([...i.taskIds]) as string[] }
      : i.kind === 'gated' && i.key !== undefined
      ? { ...i, key: Object.freeze(cloneValue(i.key)) }
      : i.kind === 'asked'
      ? { ...i, input: Object.freeze(cloneValue(i.input)) }
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
export class MissingJoinPolicy extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'MissingJoinPolicy';
  }
}

/**
 * The run has failed and the driver has stopped routing it.
 *
 * **`spec/` says these refusals "terminate the run" — `FD-R1`, `ID-R1`, `OR-R6`, and since W13
 * `ID-R4` — and a `throw` cannot do that.** (`InvalidTaskId` used to reach this path too, raised by
 * `parseTaskId` rather than named as a rule;
 * [ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
 * moved it to `onUnmintedTask` and `ID-R5`, so it no longer does.) Every one of them is reached from inside a
 * `scheduler.addEventListener` callback, and `EventTarget.dispatchEvent`
 * **never hands a listener throw back to the dispatcher**: measured on Node 24, the
 * remaining listeners still run, `dispatchEvent` returns normally, and the error
 * resurfaces out-of-band on `process.nextTick` — where node 24 and deno each raise
 * it as an UNCAUGHT exception that ends the process, unless a global handler is
 * installed (P35 fact 10). In a browser it is a `window.onerror` report and the page
 * carries on.
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

/**
 * **`OR-R13` — a settled `done` result the log now carries does not satisfy the `outputSchema` its
 * node's worker declares** ([ADR 0060](../../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md),
 * [W80](../../doc/work-items/w80-what-a-run-time-result-check-is.md), P21 decision 3).
 *
 * **A READING and not a refusal.** Nothing is appended differently, no terminal state changes, no
 * dispatch moves, and the value flows downstream exactly as it would with the check off — so what
 * this buys a consumer is KNOWLEDGE rather than protection, which the ADR states as the cost rather
 * than hiding it. `OR-R12` is the precedent: a refusal that appends nothing and does not fail the
 * run.
 *
 * **A plain object rather than an `Error` subclass**, because it is never thrown and constructing an
 * `Error` captures a stack once per nonconforming settlement on the settlement path. `UnmintedTask`'s
 * shape, for the same reason: a fresh literal per call, retained by nothing here, so — unlike a
 * `RegionEvent`, which the driver stores and hands out — there is nothing for a freeze to protect.
 */
export interface NonconformingResult {
  /** This driver's run — `ID-R4` has already decided the settlement is ours. */
  runId: string;
  /** The settled task, whole, so the branch path and the attempt are recoverable by `parseTaskId`. */
  taskId: string;
  /** The node it settled for. */
  nodeId: string;
  /** The node's `type` — the registry entry that names the worker. */
  type: string;
  /** The worker key whose `outputSchema` refused it, so the schema is findable in one lookup. */
  worker: string;
  /**
   * Every way the result failed, in document order — `findings`' own list, unabridged. **This is
   * what a consumer branches on**; `message` below is what it logs.
   */
  findings: readonly SchemaFinding[];
  /** One line naming the task, the node, the worker and every finding — `BoundaryRefused`'s shape, without the throw. */
  message: string;
}

/**
 * **Whose task this is, as FIELDS** — `RN-R42`, v0.27,
 * [ADR 0114](../../doc/decisions/0114-a-tasks-attribution-is-fields-and-its-messages-and-progress-are-passed-through.md),
 * P36 stop-and-ask (k): what {@link TaskMessage} and {@link TaskProgress} carry beside the scheduler's own fields, so a
 * consumer never parses a task id. `runId`, `nodeId`, `branchPath` and `flowAttempt` are the id's four segments
 * (`spec/task-id.md` section 1) — `NodeRun`'s names for them (`RN-R41`); `attemptNumber` is the SCHEDULER's 1-based
 * number of the attempt the event came from, as the event carried it, and `null` where it carried no positive integer (a
 * scheduler older than the pin, or a double).
 */
export interface TaskAttribution {
  runId: string;
  nodeId: string;
  /** `'-'` when the node is in no fan-out region. */
  branchPath: string;
  taskId: string;
  /** The task id's flow-level attempt segment — `0` on every id minted today (P36 (j)). Not the scheduler's number. */
  flowAttempt: number;
  /** The scheduler's attempt number, from the event itself. */
  attemptNumber: number | null;
}

/**
 * **One `context.emit()` of a task THIS run dispatched — the scheduler's `task.message`, passed through** — `RN-R42`,
 * v0.27, ADR 0114, P36 stop-and-ask (k), what {@link DriverOptions.onTaskMessage} is handed. The scheduler's own fields
 * (`name`, `data`, `seq`, `timestamp`, and `dropped` and `error` only when the event carried them — its `AGENTS.md` §6)
 * beside the attribution. A COPY taken while the listener runs (ADR 0007 rule 1) and FROZEN (`OR-R7`): `data` is the
 * driver's own clone, shallow-frozen as `onFoldInput`'s values are. `workerId` is not carried: it names a pool's worker,
 * not the run's task.
 */
export interface TaskMessage extends TaskAttribution {
  /** The name the worker emitted under — the scheduler defines none. */
  name: string;
  /**
   * What it emitted. `undefined` when the SCHEDULER could not clone it — `error` is then set — and, with NO marker, when the
   * driver's own copy could not clone it (`RN-R42`; unreachable for a message the scheduler cloned at the `emit`).
   */
  data: unknown;
  /** The emit's index within its attempt, from 0 — a retry starts again at 0 under the next `attemptNumber`. */
  seq: number;
  /** `Date.now()` at the emit, in the worker. */
  timestamp: number;
  /** Emits the scheduler discarded at its cap immediately before this one. Present only when the event carried it. */
  dropped?: number;
  /** Why `data` is missing. Present only when the event carried it. */
  error?: string;
}

/**
 * **One progress report of a task THIS run dispatched — the scheduler's `task.progress`, passed through** — `RN-R42`, v0.27,
 * ADR 0114, P36 stop-and-ask (k), what {@link DriverOptions.onTaskProgress} is handed: the report's own fields beside the
 * attribution, and NONE of the task's — the scheduler spreads the whole task flat into this event's detail (its §6), and
 * its `workerType` there is `'inline'`/`'thread'`, not the pool key, so neither is carried. A frozen COPY, as
 * {@link TaskMessage} is.
 */
export interface TaskProgress extends TaskAttribution {
  /** A fraction, 0-1, as the worker reported it. */
  progress: number;
  /** The worker's message, if it gave one. */
  message: string | undefined;
  /** The worker's details, if it gave any — the driver's own clone; `undefined`, with no marker, if they cannot be cloned. */
  details: unknown;
  /** `Date.now()` when the report was made. */
  timestamp: number;
}

/**
 * What the driver needs from a scheduler. Structural, so W3 is testable without one — and
 * satisfied by a real `FyflowScheduler` under EVERY lib configuration, which is what closed
 * [Q71](../../doc/questions/q71.md) ([W57](../../doc/work-items/w57-the-scheduler-is-a-dependency.md)).
 *
 * **The listener takes `object`, not `{ detail: unknown }`, and that is the whole of Q71's fix.**
 * `FyflowScheduler extends EventTarget`, and with the DOM lib in scope its `addEventListener`
 * takes `EventListenerOrEventListenerObject | null`. TypeScript compares a callback parameter's
 * OWN parameter covariantly, so the seam's listener has to accept whatever the DOM says a listener
 * receives — and `{ detail: unknown }` is not a supertype of `Event`, which was `TS2322` for every
 * consumer who did not set `lib`, because the DOM lib is TypeScript's default. Measured over
 * seven candidate shapes at W57: `object` and `unknown` are the only two the real class AND the
 * L2-L5 fakes both satisfy under `ES2022`, `ES2022+DOM`, the browser config and `deno check`; a
 * union with the named class typechecked only with a cast at the boundary. **Nothing downstream
 * reads `e` as an event** — `detailOf` narrows to `detail` at the subscription site and ADR 0007
 * normalises from there, exactly as before. What changed is the declared shape, not what is read.
 *
 * The two REQUIRED methods are what the seam IS — an `EventTarget` without `addTask` still does not
 * get through — so Q71's own objection to widening does not apply to this widening.
 *
 * **A THIRD member since W173, and it is OPTIONAL** — `cancel`, P34 stop-and-ask (b),
 * [ADR 0104](../../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md). It is
 * the scheduler's own signature, so a real `FyflowScheduler` satisfies the seam as it is (the `_Q71` assertion below is
 * unmoved) and `Driver.cancel` reaches the scheduler from the driver — the only thing with side effects (ADR 0001) — for a
 * driver built by hand exactly as for a runtime's, whose per-run view forwards it. **Optional, so no double breaks**:
 * a scheduler without it still drives every run, and `Driver.cancel` over it is REFUSED by name before anything is
 * recorded (`RunControlRefused`, `reason: 'unsupported'`) — and, since W174, so is `Driver.stop` (`RN-R33`, ADR 0105). **BREAKING in 0.8.0 only for code that IMPLEMENTS the seam
 * with a `cancel` of another shape** (P34 decision 10).
 */
export interface SchedulerLike {
  addTask(task: unknown, options?: { createPromise?: boolean }): unknown;
  addEventListener(type: string, listener: (e: object) => void): void;
  /**
   * Stop a task, waiting or running — the scheduler's `cancel(taskId, { reason, graceMs })`, resolving `true` once it
   * has stopped and `false` for an id it does not hold or a task that finished first. Read only by `Driver.cancel` and,
   * since W174, `Driver.stop` (`RN-R33`) — whose run's `done`, on a runtime, settles once each stop's promise has settled.
   * **It must not REJECT for a task's state** (the scheduler's never does): the run ends only when the scheduler SETTLES
   * each task, so a double whose `cancel` rejects and fires nothing leaves the run `cancelling` for ever (W173, F8).
   */
  cancel?(taskId: string, options?: { reason?: unknown; graceMs?: number }): Promise<boolean>;
}

/**
 * **Q71, asserted at L0 in every typecheck rather than in a scratch harness.** A real
 * `FyflowScheduler` must satisfy the seam; if it stops doing so — the DOM signature changing
 * upstream, or the seam narrowing back — this alias fails to instantiate under
 * `tsc -p tsconfig.browser.json` and `deno check`, both of which carry the DOM lib. Type-level
 * only, so nothing ships for it and Node's type stripping erases it (`RT-R9`).
 */
type Assert<T extends true> = T;
type _Q71RealSchedulerSatisfiesSeam = Assert<FyflowScheduler extends SchedulerLike ? true : false>;

/** The one field the driver reads off a scheduler event. `'detail' in e` narrows without a cast. */
function detailOf(e: object): unknown {
  return 'detail' in e ? e.detail : undefined;
}

/**
 * What `createTask` builds from what the driver hands it. **Optional since W57**: omitted, the
 * driver builds `new FyflowTask(config)` itself (ADR 0048), which is what a real scheduler
 * consumes and what ladder L6 runs. The L2-L5 fakes still pass `(c) => c` and read the plain
 * object back — the option is the seam's other half, kept for exactly that.
 */
export type TaskFactory = (config: {
  id: string;
  workerType: string;
  payload: unknown;
  optional: boolean;
  /**
   * **Present only when the node declared one or the driver has a `defaultRetryPolicy`** —
   * W58. A node that says nothing hands the factory the exact four-field object it always
   * did, so every L2-L5 fake reading `(c) => c` sees no new key on a node that declares none.
   */
  retryPolicy?: RetryPolicy;
  /** Present only when the node declared it — W58. The scheduler unions it with the pool's. */
  workerGroups?: string[];
  /**
   * **The attempts this task ALREADY made, in an earlier process** — `RN-R21` v0.26, `RN-R40`,
   * [ADR 0113](../../doc/decisions/0113-a-tasks-attempts-are-recorded-and-carried-across-a-resume.md), W186, P36 (g). Present
   * ONLY on a task `resume()` hands on again, and only when the stored run recorded an attempt of it (an `attempted`
   * element): the HIGHEST `attemptNumber` recorded — so the attempt in flight at the crash or the stop counts as spent (P36
   * (h)). With or without a `retryPolicy`: the scheduler's attempt numbering continues either way. **A spent budget is
   * handed on all the same**, and the scheduler runs the task ONCE more and settles it — at most one attempt over budget
   * per resume; the driver writes no settlement (P36 decision 7). The scheduler's own `FyflowTask` field of the same name.
   * **A `createTask` that builds the task FIELD BY FIELD must copy it**, or the resumed task starts at a fresh budget again.
   * Additive in 0.8.0: a dispatch that is not a resume's never carries it.
   */
  attemptsSpent?: number;
}) => unknown;

/**
 * **The default factory, and it is why the scheduler is a dependency at all.**
 * `new FyflowTask(config)` is the object `FyflowScheduler.addTask` takes; until W57 every consumer
 * wrote this line themselves, because `src/` was forbidden to import the class (ADR 0013 rule 1,
 * superseded by ADR 0048).
 */
const defaultCreateTask: TaskFactory = (config) => new FyflowTask(config);

export interface DriverOptions {
  /**
   * **The one run this driver serves** —
   * [ADR 0022](../../doc/decisions/0022-a-driver-takes-its-run-at-construction.md)
   * rule 1. `ID-R3` always said a driver serves exactly one run; until W13 the
   * surface said otherwise, and the next reader believed the surface
   * ([Q53](../../doc/questions/q53.md)).
   *
   * `ID-R2`'s charset refusal happens here, in the constructor, before the
   * definition is validated and before anything is queued: a run id is
   * configuration, like `joinPolicy`, and ADR 0002 rule 3's argument applies.
   */
  runId: string;
  scheduler: SchedulerLike;
  /**
   * Optional. The default is `(config) => new FyflowTask(config)` — the real scheduler's own
   * task class, so wiring a `FyflowScheduler` up needs nothing but the scheduler. Pass one to run
   * against a double (ladder L2-L5), or to build something other than a plain `FyflowTask`.
   */
  createTask?: TaskFactory;
  predicates: PredicateRegistry;
  /**
   * **The registry's WORKERS, keyed by the name a node type's `worker` gives** — v0.19 (W65,
   * ADR 0054). Pass the same object the runtime built pools from (`runtime.registry.workers`, or a
   * registry document's `workers`). **Omitted means EMPTY**, so every type is refused as naming a
   * worker the registry lacks (`FD-V32`). The driver reads ONE field of an entry, `settingsSchema`
   * (`FD-V33`), and holds all four of its schemas to the built-in subset at construction, by name
   * (ADR 0053, `SchemaRefused`).
   */
  workers?: Workers;
  /**
   * **The NAMED pool instances a `task`'s `pool` may name** — v0.19. **Omitted means EMPTY**; a
   * type's default instance is implicit and keyed by the type's name. The driver reads one field of
   * an entry, `type` (`FD-V38`), and dispatches a task to `node.pool ?? node.type`.
   */
  pools?: Pools;
  /**
   * **The resource-group ids a node may name in `workerGroups`** — `FD-V31`, W58. Pass
   * `Object.keys(scheduler.groups)`, the scheduler's own map, rather than a second list.
   * **Omitted means EMPTY**: a definition that declares any group is then refused at
   * construction, naming the node and the id, because the scheduler would run the task with
   * the unknown group silently ignored (P16 fact 2). Optional in shape so that no consumer
   * whose flows declare no group has to change anything.
   */
  groups?: Iterable<string>;
  /**
   * **A retry policy for every task node that declares none** — W58,
   * `spec/flow-definition.md` section 2's merge rule: **the node wins, whole.** A node with
   * its own `retryPolicy` is dispatched with exactly that object and this one is not consulted
   * field by field. **Held to `FD-V30` at construction**, before the definition is validated —
   * the first version said *typed rather than re-validated*, and W58's adequacy reader handed it
   * `{}`, `null`, a string and an extra key, every one of which reached `createTask` untouched.
   *
   * There is deliberately **no `defaultWorkerGroups`**: the scheduler already unions a task's
   * `workerGroups` with its POOL's `groups`, so a pool-level default exists upstream where a
   * retry default does not (`WorkerManagerOptions` carries none — measured at W58).
   */
  defaultRetryPolicy?: RetryPolicy;
  /**
   * **The node TYPES a `task`'s `type` may name** — the fourth set, W59,
   * [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md).
   * Pass the same object the bootstrap helper built the pools from. **Omitted means EMPTY**, as
   * `groups` is: a definition naming any type is then refused at construction (`FD-V32`).
   *
   * What the driver reads of an entry, and when: `settings` at construction, through the
   * validator (`FD-V33`); `retryPolicy` at dispatch, as the middle level of the merge (node, then
   * type, then `defaultRetryPolicy`, whole each time) — **held to `FD-V30` at construction**, as
   * the default is; and `groups` at construction only, each held to this driver's `groups` under
   * `FD-V31`, because a pool naming a group the scheduler lacks is ignored in silence exactly as a
   * task is (measured at W59). `worker`, `pool` and `config` are the helper's and are not read.
   */
  nodeTypes?: NodeTypes;
  /**
   * **The registry's LANGUAGES — the fifth set, v0.18** ([W61](../../doc/work-items/w61-what-a-transform-is.md),
   * ADR 0051). Absent means EMPTY, as `nodeTypes` is: a definition declaring any `transform` is
   * then refused at construction (`FD-V35`). The driver reads ONE field of each entry, `compile`,
   * and reads it at construction only — `FD-V36` runs the language's synchronous compiler on
   * every declared expression before anything is queued — and never evaluates anything: the
   * envelope gains the declared `transform` as a third key and the TYPE's worker wrapper
   * evaluates it (P17 decision 1). The bootstrap helper reads the other field, `worker`.
   */
  languages?: Languages;
  /**
   * **A consumer's GATE types, beside the built-ins — the sixth set, and the TWENTIETH member**
   * ([W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md), ADR 0067). Absent, the built-ins alone
   * (`distinct`, `if`, `switch`); the set only ever ADDS, a name that is a built-in's is refused (`NameCollision`) and a
   * value that is not a `GateType` is `GateTypeRefused` — both by `checkRegistry`, at construction. The
   * validator reads each gate's route set through `routesOf` (a static type's members, or a derived type's
   * `routesFor` over the gate's settings — ADR 0092), `settingsSchema` and `settingsProblem` (`FD-V39`-`FD-V41`);
   * the driver resolves each gate's set once at construction and reads `fn` where a branch enters a gate. **The runtime's road is `runtime.registry.gateTypes`**, from
   * `RegistryCode.gateTypes` — code registered once per runtime, as `languages` is (W76's road (b)).
   */
  gateTypes?: GateTypes;
  /**
   * Required when the definition contains a fan-out. **W3 ships none** — both
   * policies are W2's and which is right is W4's question (`JP-R7`, `JP-R8`), so
   * a driver that decided satisfaction itself would answer Q4 from inside W3.
   */
  joinPolicy?: JoinPolicy;
  /**
   * Called when a policy reports a join can never fire. **The driver does not
   * invent a run-level outcome** — that vocabulary is run state's
   * ([Q25](../../doc/questions/q25.md)) and neither pinned policy returns
   * `unsatisfiable` at all, which is itself Q7's finding rather than a gap.
   */
  onUnsatisfiableJoin?: (info: UnsatisfiableJoin) => void;
  /**
   * Called when a refusal terminates a run. See `RunFailure` — a `throw` from a
   * listener never reaches the scheduler's caller (`dispatchEvent` rethrows it out of
   * band), so this is the only way the failure `FD-R1`, `ID-R1` and `OR-R6` describe
   * can actually reach a caller — and a throw from your own `onFoldInput` on an element
   * a scheduler event's step appends, a pause, unpause or stop taken at its end
   * included (`OR-R10`). **And on a driver call's step too, since W184** (`OR-R10` v0.19, P35 (k)): a throw from your
   * `onFoldInput` on any element `start`, `resume`, `resolve`, `cancel`, `stop`, `pause` or `unpause` appends is
   * reported here ONCE, the run halted, and then thrown to that call's caller as well.
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
   *
   * **`seq` is the element's POSITION in the sequence** — `RN-R18`,
   * [ADR 0064](../../doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)
   * rule 5. The index at which the same element appears in `foldInputs()` and in
   * `checkpoint().events`, contiguous in delivery order — from 0 on a run entered by `start()`, and from the STORED LENGTH
   * on one entered by `resume()`, whose earlier elements the consumer already holds (`RN-R24`) — so a consumer that
   * appends what it is handed holds *everything before position N* and nothing else: a stored
   * stream is named by its length. **It is the driver's index and never the listener's own count**
   * — the two agree while one listener sees a run from its first event, and a runtime composing
   * this callback (ADR 0058) hands the driver's `seq` on unchanged.
   *
   * **A THROW from it HALTS the run, on every road** (`OR-R10` v0.19, W184): reported once through `onRunFailure` under
   * its own class, the `halted` element appended after the element thrown on — and, on a driver call's step, thrown to
   * that call's caller as well — the SAME error that was reported. **The FIRST throw halts**: a pause, an unpause or an
   * answer still pending behind it is dropped, and a stop pending behind it is taken SILENTLY, its own throw discarded
   * (P36's brief point 5). The one exception is a throw on the `halted` element itself: reported nowhere again, and on a
   * driver call it reaches the caller in place of the first (`OR-R10`, W178's S-1).
   */
  onFoldInput?: (input: FoldInput, seq: number) => void;
  /**
   * **The run's checkpoint header, handed over BEFORE its first event** — `RN-R39`,
   * [ADR 0112](../../doc/decisions/0112-a-run-delivers-its-header-before-its-first-event.md), P36 decision 1, (d) and (e).
   * Called ONCE, synchronously, inside `start()` — after `FD-R4`'s check and the entry payload's clone, and BEFORE anything is
   * appended (so before the first `onFoldInput`) or handed to the scheduler — with a FROZEN copy of its own, equal to
   * `checkpoint().header` and to a runtime's `handle.header`. So a store writes the header first and every element after it.
   * *The copy is SHALLOW-frozen with a fresh clone of the entry payload — `checkpoint()`'s own shape — so it is a whole copy
   * only while every other `CheckpointHeader` field is a primitive; a field added holding an object must be cloned here too.*
   *
   * **A THROW from it leaves the driver UNSTARTED**: nothing appended, nothing handed on, `onRunFailure` NOT called — no run
   * exists yet, as after an `FD-R4` refusal — and the throw reaches `start()`'s caller; a corrected retry may start the same
   * driver. **Never called** when `start()` is refused (`MultipleRuns`, `BoundaryRefused`, a `DataCloneError`), and never by
   * `resume()`: its caller already holds the header. Additive in 0.8.0.
   */
  onHeader?: (header: CheckpointHeader) => void;
  /**
   * **Every `context.emit()` of a task this run dispatched, with its attribution as fields** — `RN-R42`, v0.27,
   * [ADR 0114](../../doc/decisions/0114-a-tasks-attribution-is-fields-and-its-messages-and-progress-are-passed-through.md),
   * P36 stop-and-ask (k): the scheduler's `task.message`, copied while the listener runs and handed over FROZEN
   * ({@link TaskMessage}). **A PASS-THROUGH, never a fold input**: nothing is appended, nothing a checkpoint holds moves,
   * and the run routes exactly as it would without it.
   *
   * **The driver subscribes to `task.message` ONLY when this is given** — the scheduler sends nothing while nobody listens
   * (its §6), so a run that passes none costs its workers nothing to emit. **Delivered only for a task THIS run dispatched**:
   * another run's, an id no driver minted and a task this run never dispatched are DROPPED in silence — never
   * `onUnmintedTask`, never `UndispatchedTask`: a message never stops a run by existing. **Nothing once the driver is
   * deaf** — stopped (`RN-R33`) or spent by a refused resume (`RN-R23`) — and, on a runtime, nothing once the run is
   * released (ADR 0091). A HALTED run's tasks still run, and their messages still arrive.
   *
   * **A THROW from it takes `onUnmintedTask`'s road** (`OR-R10`): caught at the listener boundary, reported ONCE through
   * `onRunFailure` under its own class, and the run HALTED — a scheduler event's step, so nothing is thrown on; on a run
   * already halted it is discarded. The scheduler delivers `task.message` asynchronously (its §6; W187's declaration step
   * measured an inline and a threaded pool at the pin), so it never arrives on a driver call's own step. Additive in 0.8.0.
   */
  onTaskMessage?: (message: TaskMessage) => void;
  /**
   * **Every progress report of a task this run dispatched, with its attribution as fields** — `RN-R42`, v0.27, ADR 0114,
   * P36 stop-and-ask (k): the scheduler's `task.progress`, copied and handed over FROZEN ({@link TaskProgress}) — the
   * report's fields and none of the task's. Everything {@link DriverOptions.onTaskMessage} says holds here too: subscribed
   * only when given, this run's dispatched tasks only, nothing once deaf or released, a throw reported once and the run
   * halted. Additive in 0.8.0.
   */
  onTaskProgress?: (progress: TaskProgress) => void;
  /**
   * **`FD-R4`'s switch — W73.** `true` (the default): the run's payload is held to the input schema of
   * every task it reaches with no worker in between at `start()`, and a person's `done` resolution to
   * the parked node's worker output schema at `resolve()`, each refused as a `BoundaryRefused`
   * thrown at the caller with the run unaffected. `false` turns both off — the one road P19 leaves
   * to a consumer who has priced the check and wants none of it. A worker declaring no schema on
   * that side is unchecked either way (P18 decision 3), and so, at `start()`, is a task that declares
   * a `transform` (ADR 0101, W170): what its worker's input schema holds is the transform's RESULT.
   */
  validateBoundaries?: boolean;
  /**
   * **`OR-R13`'s switch, and it IS the check** — [ADR 0060](../../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md),
   * [W80](../../doc/work-items/w80-what-a-run-time-result-check-is.md), P21 decisions 1 and 3.
   * Supply it and every `done` settlement's result is held to the `outputSchema` of its node's
   * worker, on the value the RECORD carries; omit it and nothing is checked. **OFF by default**,
   * which is the maintainer's answer to P21's stop-and-ask (a).
   *
   * **The presence of the callback is the switch, deliberately — there is no boolean beside it.**
   * Two members would be two sources that can disagree, and both disagreements are defects this
   * repository has a name for: `true` with no callback is a cost paid for a report nobody receives,
   * and `false` with a callback is **a typed option silently dropped**, which is P20 fact 2's
   * measurement and the thing `StartOptions`' both-ways binding exists to refuse. *A diagnostic
   * whose channel is its own switch cannot be enabled and unheard.*
   *
   * **What keeps it off is COST, not risk.** A finding is reported and never routed, so leaving it
   * on is safe anywhere; what a consumer is declining is P21 fact 4's ratio and the callback they
   * would have to write. **The ratio is not a constant and this is the one place a consumer meets
   * that**: the check is linear in the SCHEMA and the clone it is measured against is linear in the
   * VALUE, so on this library's own corpus it runs from **~90% of a cost already paid at six
   * settlements down to 6% at fifty-two** — and on a result carrying one `enum` of a hundred
   * allowed values it is **1.65x** of that cost at 4 KiB and **3.08x** at 0.5 KiB (W80's
   * declaration step — P21 prediction 1's reversal, measured deliberately).
   * *(This read *6-14%*, which is the two cheap readings with the ~90% one dropped, in the
   * direction that flatters the feature. W80's conformity reader, finding 2.)*
   *
   * **It never changes the run.** Nothing is appended, `OR-R3` still writes exactly one record per
   * settlement, routing is untouched and the nonconforming value reaches the next node unaltered.
   * **A callback that THROWS is the one exception, and it is the consumer's own doing.** Like every
   * other callback here it is called inside the listener, so the throw is caught at `onEvent`,
   * reported through `onRunFailure` and **stops the run** (`OR-R10`). That is the same treatment
   * `onUnmintedTask` gets and it is documented rather than swallowed (`AGENTS.md` §9): a driver
   * that ate a consumer's throw would hide a defect in the code that asked to be told.
   *
   * *(The CHECK's own throw is not a second exception, and it very nearly was: `findings` can
   * raise on a cyclic result or a BigInt under `enum` or `const`, both of which `OR-R11` calls
   * intact. It is caught at the call and reported as a finding — W80's conformity reader,
   * finding 1.)*
   */
  onNonconformingResult?: (finding: NonconformingResult) => void;
}

/**
 * The scheduler events the driver subscribes. **`task.cancelled` is W158's** (ADR 0094): the scheduler fires it, and
 * no other settlement event, for a task `cancel()` ended, so without it a cancelled task was never heard and its
 * run never ended (P33 fact 1). `task.cancelling` is NOT here — a request is not a settlement (`OR-R4`).
 */
const SETTLEMENT_EVENTS = ['task.completed', 'task.failed', 'task.user_action', 'task.cancelled'] as const;
/**
 * **And the one scheduler event the driver hears that is NOT a settlement** — `task.running`, since W186 (`RN-R40`, P36
 * (f), ADR 0113): each attempt's start, recorded as the fold input `attempted` and never as a record (`OR-R4`). So the
 * driver subscribes FIVE names, always. `task.retrying` is never heard (P36 (n)); `task.message` and `task.progress` are
 * the {@link PASS_THROUGH} pair, subscribed only for a callback given (W187).
 */
const SUBSCRIBED_EVENTS = [...SETTLEMENT_EVENTS, 'task.running'] as const;
/**
 * **The two scheduler events the driver PASSES THROUGH, each subscribed only when its callback is given** — `RN-R42`, v0.27,
 * W187, ADR 0114, P36 (k): the scheduler sends nothing while nobody listens (its §6), so a run that asks for neither leaves
 * its workers free to emit at no cost, and subscribes exactly {@link SUBSCRIBED_EVENTS}. Never a record and never a fold
 * input (P36 decision 5).
 */
const PASS_THROUGH = [['task.message', 'onTaskMessage'], ['task.progress', 'onTaskProgress']] as const;

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
   * into one ordered value and **nothing produced it** ([Q41](../../doc/questions/q41.md)):
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
  /**
   * **Every ASK this run has reached, by task id** — `RN-R37`, v0.22, W180, ADR 0109: the ids of the `asked` elements
   * appended, so `RS-R1`'s widened *suspended* (an `asked` element and no record after it) is one lookup rather than a
   * scan of the input sequence at every `resolve()`, and an ask's id is minted once per path (`ID-R1`'s guard). Ids only —
   * the kept INPUT lives on the element alone. `dispatched`'s twin for the one node that is never dispatched.
   */
  private readonly asked = new Set<string>();
  private readonly now: () => number;
  private readonly opts: DriverOptions;
  private readonly def: FlowDefinition;
  /**
   * **Per region INSTANCE: the policy's opaque state.** Opened when that instance
   * is entered, and keyed `openerId -> openerPath -> state` — ADR 0062.
   *
   * *(One level until W84, when a `map` stopped making an opener's node id name one
   * region. The accessors below are `joinStateGet`/`Has`/`Set`, written so the
   * nesting is flattened in ONE place rather than at each of the five call sites.)*
   */
  private readonly joinState = new Map<string, Map<string, unknown>>();
  /**
   * A join fires at most once, however many terminal events follow it — **per
   * region INSTANCE**, keyed `openerId -> {openerPath}` (ADR 0062).
   *
   * *(A `Set<string>` until W84. Keyed by opener alone, the first instance's latch
   * made every later instance's join UNREACHABLE — which is one of the three
   * mechanisms W33's refusal existed to prevent, and the one that produced a run
   * reporting `stuck` with all seven tasks `done`.)*
   */
  private readonly firedJoins = new Map<string, Set<string>>();
  /**
   * **What each branch carried into its join, keyed by region and then by
   * `branchPath`** — [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
   * rule 4, and `JP-R11` in [spec/join-policy.md](../../spec/join-policy.md)
   * section 4.
   *
   * **This is why `settleJoin` still takes no payload parameter.** That signature
   * was left bare because the function is reached from three sites with three
   * different payloads and *which one arrives* is decided by fan-out completion
   * order — so a parameter would make the join's downstream data order-dependent
   * by construction. Recording every arrival and reading the whole map at the exit
   * is not picking one, so the constraint is met rather than worked around, and
   * the guard that keeps the choice from being quietly reintroduced is still
   * exactly where W3 put it.
   *
   * **Keyed by the region INSTANCE, like every other per-region structure here** —
   * `joinState`, `firedJoins`, `RegionEvent`'s `regionId`/`regionPath` pair and the
   * fold's `regions`. **That is FIVE structures and W33's own enumeration named
   * four**: this map is W34's and postdates that reader's list, so the sentence
   * above used to say *like every other per-region structure here* while
   * enumerating four that excluded its own subject. W84's declaration step re-took
   * the list and found it; the count is now in the sentence that states it.
   *
   * *(Until W84 the key was the opener's NODE ID alone, which is total only because
   * a region opener is entered at most once per run — a property W33 held by
   * REFUSING a region inside a map region at construction
   * ([Q160](../../doc/questions/q160.md)). The refusal is lifted and the key is the
   * pair, so instance 2 collects into its own map instead of into instance 1's.
   * **This is the structure a mis-keying would corrupt SILENTLY**: a wrong key here
   * hands a join somebody else's collection, and `JP-R12` is a `Record<string,
   * unknown>` either way.)*
   *
   * **Its LIFETIME is
   * [ADR 0046](../../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
   * rule 3, and until W53 it had none.** An entry lives from a region's first
   * arrival until that region's join becomes terminal, and is dropped there —
   * `releaseArrivals` below, at both exits of `settleJoin`, plus `arrivals.clear()`
   * when a refusal stops the run. Before that this map held every arrived branch's
   * result for the life of the driver, which P15 fact 3 measured at **49.8%** of
   * what a region-bearing run holds at map arities 4, 16 and 64 over 64 KiB
   * results, and which no rung of `doc/workflow.md` section 4 could see removed
   * ([Q214](../../doc/questions/q214.md)).
   *
   * **It is a SECOND COPY and that is measured rather than assumed**: the stored
   * value is the arriving branch's own edge-hop clone, and an identity check says
   * it is neither the log record's `result` object nor the worker's own. So this is
   * not an index over the log the way `outputsCache` is — dropping it frees bytes,
   * and dropping that would free almost none.
   *
   * **What the rule does NOT reach is stated in the rule**: a region whose join
   * never becomes terminal holds its arrivals until the driver is released. That is
   * the run this repository calls `stuck`, and `stuck` is decided in the FOLD at a
   * quiescent point (`RN-R10`), not here — ADR 0046 rule 5.
   */
  private readonly arrivals = new Map<string, Map<string, Map<string, unknown>>>();
  /**
   * **The one run this driver serves** — ADR 0022 rule 1, fixed at construction
   * and never `null`.
   *
   * Until W13 this was `startedRun: string | null`, set by the first `start`,
   * beside a `failedRuns` **set** and a `hasFailed(runId)` taking an argument —
   * three shapes that only made sense if a driver served many runs. They were
   * redundant rather than wrong, and [Q53](../../doc/questions/q53.md) recorded
   * that a redundant surface is read as a permissive one.
   */
  /**
   * **The run this driver serves** — `ID-R3`'s one run, fixed at construction and never reassigned.
   * READABLE since W66: a runtime MINTS one when the caller gives none (P18 decision 10), so the
   * caller must be able to learn it — every task id this run dispatches begins with it.
   */
  readonly runId: string;
  /** `ID-R3` — ONE door into ONE run, once: `start()` or `resume()`, whatever id the caller had in mind (v0.11). */
  private started = false;
  /**
   * **The checkpoint's header, set once by `start()` or `resume()`** — `RN-R15`, ADR 0064 rule 2 and ADR 0065. `null` until
   * then, and `null` again on a driver whose resume was refused before it regenerated a run (`RN-R23`) — which is
   * what `checkpoint()` refuses on, and what makes a spent driver deaf to its scheduler. It holds the driver's OWN copy of the entry
   * payload: taken by `structuredClone` at the call, never handed to a task (the entry node still
   * receives the caller's value, exactly as before this item), and never handed out — `checkpoint()`
   * clones it again on the way out.
   *
   * **It is retained for the life of the run and it is ONE copy of one value** — constant in the
   * number of tasks and proportional to the payload, which for a `map` at the entry is its whole item
   * list, so it IS a third term of what a run retains and `RN-R13` says so since v0.9. *(This read
   * "beside that rule's two terms rather than a third one"; W88's conformity reader.)* The byte walk's
   * universe gains it on the WALKED side: it is run state the driver holds, not configuration it was
   * handed.
   */
  private header: CheckpointHeader | null = null;
  /**
   * **The replay, while `resume()` runs, and `null` at every other moment** — `RN-R19`, ADR 0065. It
   * holds the stored events every regenerated element is compared with and the dispatches the replay
   * HELD; `resume()` drops it before the first re-dispatch, so a resumed driver retains nothing here
   * and `RN-R13`'s terms are unmoved. It is also the one thing that makes a callback fire only for the
   * elements a consumer does not already hold ({@link Driver.delivers}).
   */
  private replay: Replay | null = null;
  /** The run has been HALTED by a refusal (`OR-R10`). Nothing dispatches for it again. */
  private failed = false;
  /**
   * **A task of this run settled `cancelled`, so the run is HALTED** — `RN-R28`,
   * [ADR 0094](../../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md)
   * rule 3, W158. Every door `failed` shuts, this shuts — nothing is dispatched or routed for the run again,
   * a later settlement is appended and routed nowhere, and `resolve()` is refused — and it differs from `failed`
   * in three things only: no `halted` element is appended (the fold reads the run `cancelled` from the
   * settlement itself), `onRunFailure` is not called (a cancel is its owner's act, not a defect), and
   * `hasFailed()` stays false. **Separate rather than `failed` with a reason**, because those three are each
   * a reader of `failed` that must not fire.
   */
  private cancelled = false;
  /**
   * **A resume refused because its replay regenerated a HALT in the lost tail** — `RN-R23`: that driver keeps the
   * halted run (its `header`, so a store may take its checkpoint) and still hears NOTHING. `onEvent`'s other test,
   * *started with no header*, cannot see it, because this refusal is the one that keeps its header: until W151 such a
   * driver built by hand appended and delivered a later settlement and reported an unminted id (W151's conformity
   * reader, finding 6). A driver halted by `failRun` on a run it started is NOT deaf: `OR-R10` halts routing only.
   *
   * **And a STOPPED driver, since W174** (`RN-R33`, P34 decision 3): a stop sets it with its hold — before the
   * `interrupted` element, and so BEFORE it sends the first cancel — so no `task.cancelled` of the stop — nor any later settlement — is appended,
   * routed, delivered or reported, and the log ends with the in-flight set dispatched and unsettled for a resume to
   * re-dispatch. A replay feeding a stored `interrupted` element does NOT set it: the replay hears nothing anyway.
   */
  private deaf = false;
  /**
   * **The run's OWNER cancelled it** — `RN-R31`, v0.18, W173,
   * [ADR 0104](../../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md). `null`
   * until `cancel()` is accepted; then what every LATER cancel of a task sends the scheduler — the caller's `reason` and
   * `graceMs`, each only if given — and, per task id, the promise the scheduler's `cancel` returned for it, which is what
   * `cancel()`'s own promise waits on. **A halt** (`shut()`), set BEFORE the `cancelRequested` element is appended, so a
   * consumer's callback on that element already sees the run held. It holds no result: one promise per task STILL
   * stopping — each dropped as it settles, so none once the run is `cancelled` — and the two option values.
   */
  private cancelRequest: { readonly reason?: string; graceMs?: number; readonly stopping: Map<string, Promise<boolean>> } | null = null;
  /**
   * **The run's OWNER stopped it, to resume it elsewhere** — `RN-R33`, v0.19, W174,
   * [ADR 0105](../../doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md). `null`
   * until `stop()` is accepted; then, as `cancelRequest`'s shape, what every cancel the stop sends carries and one promise
   * per task STILL stopping, each dropped as it settles — and the `actor`, which the element is appended with.
   *
   * **`pending` while the stop has been ACCEPTED and not yet TAKEN**: a stop called MID-STEP — from a callback on the
   * driver's own step — takes effect when that step ends (`stepping` back to `0`), so the step's routing is all in the log
   * and none of it is lost to a resume (`RN-R33`, W174). While pending it is the resolver of the promise every call made
   * before then waits on, `resolve()` and `cancel()` are already refused, and the hold is NOT yet shut; `null` once the
   * stop is taken, from which moment it IS a halt (`shut()`). `took` is the promise a second call made while pending
   * waits on. A function and a promise held only until the step ends — `null` both once taken, never at rest.
   *
   * **And a REPLAY sets it too**, taken, with no options and nothing stopping, where it feeds a stored `interrupted`
   * element (`RN-R19`): the stored run was held from that position, so the replay holds there as well, until a fed
   * `resumed` — or the resume itself, once the replay is over — sets it back to `null`. The stop's deafness is `deaf`'s.
   */
  private stopRequest: {
    readonly actor: string; readonly reason?: string; graceMs?: number; readonly stopping: Map<string, Promise<boolean>>;
    pending: (() => void) | null; took: Promise<void> | null;
  } | null = null;
  /**
   * **Tasks whose `dispatched` element is appended and which the scheduler has NOT been handed yet** — `RN-R29` (i)'s
   * window, ADR 0103's inherited hazard, W173. A scheduler's `cancel()` of an id it does not hold resolves `false` and
   * does nothing, so `cancel()` sends nothing for these: the hand-off site cancels each right AFTER its `addTask` —
   * `dispatch` for the task in progress, `resume()` for its in-flight set. Empty at rest; at most the one task being
   * dispatched, or a resume's in-flight set while it is handed back.
   */
  private readonly unhanded = new Set<string>();
  /**
   * **How deep the driver is in its OWN step** — `start`, `resume`, `resolve` or a scheduler event, each counting itself
   * in (`RN-R31`, W173's conformity reader, D-1). `0` at rest. A consumer callback the driver calls mid-step sees a
   * PREFIX that can read finished while the step is about to dispatch more (`RN-R12`'s quiescent point, P34 fact 3), so
   * `cancel()` refuses `ended` only at rest: mid-step, *nothing in flight and nothing parked* is not *finished*.
   */
  private stepping = 0;
  /**
   * **The run's OWNER has paused it, and the pause is TAKEN** — `RN-R35`, v0.20, W175,
   * [ADR 0106](../../doc/decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md):
   * set when a `paused` element is appended (by `pause()`, or fed to a replay) and cleared when an `unpaused` one is —
   * so it is always what `RunState.paused` folds to on the driver's own sequence. **Not a halt**: it does not join
   * `shut()`, because a paused run still routes and still accepts a resolution (ADR 0103's consequence). It is the
   * dispatch hold's DEFERRED form, at the dispatch door (ADR 0103 rule 6): each dispatch is appended, and held.
   */
  private paused = false;
  /**
   * **Every dispatch the pause HELD, in dispatch order** (`RN-R35`): appended — so the fold reads each `running`, in flight
   * under `RN-R21` (P34 fact 3) — and NOT handed to the scheduler. An `unpause` hands each on, first held first; a
   * `cancel` hands each on and cancels it (ADR 0104 rule 7); a `stop` sends nothing for them, so they stay in flight in
   * the log for a resume to hold again. Empty unless the run is paused — or an unpause's hand-off is under way, while
   * which a dispatch joins the END of it, so the order holds; or a halt broke that hand-off off, after which nothing is
   * handed on for the run and what is left here never is. One `createTask` configuration per held task, no result.
   */
  private readonly pauseHeld = new Map<string, TaskConfig>();
  /**
   * **Pause and unpause calls ACCEPTED mid-step and not yet TAKEN**, in call order (`RN-R35`): a call from a callback on
   * the driver's own step is taken when that step ends (`stepping` back to `0`, `leaveStep()`), as a stop is (`RN-R33`) —
   * so its element lands BETWEEN two steps, where a replay can feed it (`RN-R19`). Empty at rest.
   * **And, since W180, a RESOLUTION given mid-step** — an ask's answer or a parked task's (`RN-R37`, ADR 0109 rule 5, P35's
   * brief: *an owner element a resume's replay feeds is TAKEN AT REST*): accepted at the call — every refusal already asked — and its resolution
   * appended when the step ends, in the same call order as the pauses beside it.
   */
  private readonly pausePending: PendingCall[] = [];
  /**
   * **The highest attempt number RECORDED for each task, by task id** — `RN-R40`, v0.26, W186, P36 (f) and (g): the
   * number the last `attempted` element for it carried — appended, or fed by a replay. What decides that a `task.running`
   * repeating a number (a requeue) appends nothing, and what a resume re-hands an in-flight task with as `attemptsSpent`.
   * One integer per task that ever started an attempt, no result; kept for the life of the run, as `dispatched`'s ids are.
   */
  private readonly lastAttempt = new Map<string, number>();
  /**
   * **`attempted` elements HEARD and not yet appended**, in the order heard (`RN-R40`): a `task.running` arrives on the
   * driver's OWN step when an inline pool starts the task inside `addTask`, and an element appended there would sit between
   * two elements of one step — where the replay, which regenerates a step whole, would refuse the checkpoint `diverged`. So
   * every one is appended when the step ends, BEFORE a pause, an unpause, an answer or a stop pending on that step is taken
   * (`leaveStep()`): the attempt started before any of them. Empty at rest.
   */
  private readonly attemptsPending: { readonly taskId: string; readonly attemptNumber: number }[] = [];

  /**
   * **The dispatch hold is SHUT: a halt is on the run, and the driver dispatches and routes nothing further for it** —
   * `RN-R29`,
   * [ADR 0103](../../doc/decisions/0103-every-halt-shares-one-dispatch-hold.md), P34
   * decisions 5 and 8, W172. **The ONE predicate every halt shares**, read at these doors and no others — `RN-R29`
   * states the two things it does not hold: before each of `resume()`'s re-dispatches (the maintainer's answer to
   * W172's S-1), at the head of `enter` (door (a) of [Q605](../../doc/questions/q605.md) — a fan-out's or a map's remaining
   * branches), at the head of `dispatch`, after a resolution's append and again before its routing (door (b)),
   * after a settlement's append (`settle`), after a join's `joinSettled` append (`settleJoin`), and at `resolve()`'s
   * entry. A halt P34 adds — a cancel or a stop — joins this disjunction, and every door follows.
   *
   * **A METHOD over the halt flags, never a field of its own**: a second copy of *the run is halted* is a field that
   * can disagree with `failed` or `cancelled`, and each of those has readers this predicate must not stand in for
   * (`hasFailed()`, `onRunFailure`). **The replay's hold is the OTHER form and is not this** — it appends a dispatch
   * and defers handing it on (`RN-R19`), where a shut hold appends nothing; `dispatch` keeps both.
   *
   * **A REQUESTED cancel joins it since W173** (`RN-R31`, ADR 0104) — ADR 0103's *a halt P34 adds joins this
   * disjunction*: from the moment `cancel()` is accepted, every door above holds for the run. **And a STOP since W174**
   * (`RN-R33`, ADR 0105): from the moment the stop is TAKEN — at once when `stop()` is called at rest, and when the step
   * ends when it is called mid-step (`stopRequest.pending`) — and, in a replay, from a fed `interrupted` element on.
   */
  private shut(): boolean {
    return this.failed || this.cancelled || this.cancelRequest !== null || (this.stopRequest !== null && this.stopRequest.pending === null);
  }

  /**
   * **What holds a resume's re-dispatch: the hold, EXCEPT a requested cancel** (ADR 0103 rule 7, ADR 0104 rule 7) — read
   * through `shut()` and never as a second copy of its disjunction (ADR 0103 rule 1; W173's conformity reader, F7), so a
   * halt W174 adds to `shut()` holds here too. **W174's stop never reaches this loop taken** (`RN-R33`): a stop is taken
   * at rest, and a stop called on this stack — on the `resumed` element, or in the replay's lost tail — is PENDING until
   * `resume()` returns, so each task is handed on here and the stop then cancels it; and the replay's own fed stop is
   * cleared before the loop. A request is the one halt that hands a task on: its tasks are `dispatched` and unsettled,
   * and only the scheduler can settle them, so each is handed on and cancelled (`handOn`).
   */
  private holdsResume(): boolean {
    return this.shut() && this.cancelRequest === null;
  }

  /**
   * **The driver's own step ends** — each of `start`, `resume`, `resolve` and a scheduler event counts itself out here.
   * At rest again, a stop called on that step is TAKEN (`RN-R33`, W174): the step's routing is whole in the log, and
   * every task it handed on is in flight for the stop to cancel. **And a pause or an unpause called on it** (`RN-R35`,
   * W175), each in call order and BEFORE the stop — a pause or an unpause after a stop is refused, so any pending one was
   * called first. Each take is a step of its own and ends here too, so the next pending call is taken after it.
   * **And a resolution given on the step** (`RN-R37`, W180), in the same queue and the same call order.
   * **And FIRST, every `attempted` element heard on the step** (`RN-R40`, W186): the attempts started before anything
   * taken here, and a stop taken before them would leave them unrecorded — the driver deaf — under P36 (h)'s *a stopped
   * attempt counts*.
   */
  private leaveStep(): void {
    this.stepping -= 1;
    if (this.stepping === 0 && this.attemptsPending.length > 0) this.takeAttempts();
    while (this.stepping === 0 && this.pausePending.length > 0) this.takePending(this.pausePending.shift()!);
    if (this.stepping === 0 && this.stopRequest !== null && this.stopRequest.pending !== null) this.takeStop();
  }

  /**
   * **Every `attempted` element heard and not yet appended, appended — AT REST, as ONE step of their own** (`RN-R40`,
   * W186): in the order heard, each BETWEEN two of the driver's steps, where a replay feeds it (`RN-R19`). A step, so a
   * call a consumer makes from a callback on one — a pause, a stop — is taken after the last of them. **Appended on a
   * halted run too**, as a settlement is: the scheduler started the attempt whatever the run's routing does. A consumer's
   * `onFoldInput` THROWING on one HALTS the run, reported once (`OR-R10` v0.19, W184), and the throw reaches whoever is on
   * the stack — a driver call's caller, or the listener boundary of a scheduler event's step; the elements still pending
   * behind it are appended by this step's own end, SILENTLY (the run is halted, its failure reported), and so is a throw
   * on any of them once the run is halted.
   */
  private takeAttempts(): void {
    this.stepping += 1;
    try {
      while (this.attemptsPending.length > 0) {
        const a = this.attemptsPending.shift()!;
        const silent = this.failed;
        try {
          this.append({ kind: 'attempted', taskId: a.taskId, attemptNumber: a.attemptNumber });
        } catch (e) {
          if (silent) continue;
          this.haltOnce(e);
          throw e;
        }
      }
    } finally {
      this.leaveStep();
    }
  }

  /**
   * **The ONE rule for a throw that reaches a driver call's boundary once the call is ACCEPTED** — `OR-R10` v0.19, P35 (k),
   * P36 (b) and (c), W184: reported ONCE through `onRunFailure` under its own class, and the run HALTED — its `halted`
   * element appended after the element thrown on — unless the run is already halted, whose halt was reported when it was
   * raised. `start()`'s treatment since W3, brought to every call: `resolve`, `resume` and `cancel` at their own element,
   * and EVERY take — a stop's, a pause's, an unpause's, an answer's — at its own element, at rest or at a step's end, so
   * the FIRST throw halts and a call still pending behind it is dropped by its own halted guard (the readers' C1). The
   * caller rethrows: the consumer's error reaches it.
   * A refusal the call raises BEFORE it is accepted — `RunControlRefused`, `BoundaryRefused`, `ResumeRefused`,
   * `MultipleRuns`, a `DataCloneError` — never reaches this: nothing was appended, and a rejected command halts nothing.
   */
  private haltOnce(e: unknown): void {
    if (!this.failed) this.failRun(e);
  }

  /** The registry's node types, normalised once (W59; entries the document or the class form since W65). Read at dispatch for the type's retry default and its settings defaults. */
  private readonly nodeTypes: ReadonlyMap<string, NodeTypeEntry>;
  /** The registry's languages, normalised once (W61). Read at construction only; the driver evaluates nothing. */
  private readonly languages: ReadonlyMap<string, LanguageAdapter>;
  /** The registry's workers, normalised once (W73). Read at the two boundaries for a task's input and output schema, and nowhere else. */
  private readonly workers: ReadonlyMap<string, WorkerEntry>;
  /** The gate types — the built-ins and the registry's — normalised once (W93). Read where a branch enters a gate, and at `start()` for an ENTRY gate's `FD-R4` target. */
  private readonly gateTypes: ReadonlyMap<string, GateType>;
  /**
   * **Each gate's RESOLVED route set, by gate id** — ADR 0092 rule 3: `routesOf` asked once per gate at
   * construction, after validation passed, and read by every decision. Never the type's members.
   */
  private readonly gateRoutes: ReadonlyMap<string, Exclude<ReturnType<typeof routesOf>, { readonly problem: string }>>;
  /**
   * **Each gate's MEMORY: one per gate per RUN, the driver's, and never written down** — `RN-R26`,
   * [ADR 0067](../../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md),
   * P24 decision 6 and stop-and-ask (a). Keyed by gate node id ALONE — never by region instance or map item —
   * so two branches of any region, or of two instances of an enclosing one, reaching one gate share it. An
   * entry is made on the gate's first evaluation and holds whatever its type's `fn` wrote.
   *
   * **Created EMPTY with the driver, and that is the property a resume stands on** — measured at W93's
   * declaration step (`dev-dist/w93/r1b.ts`). A memory kept by the PROCESS, keyed by run and gate, resumed
   * WRONG in silence when the kill came before the first gate decision: the first `gated` element lay past
   * the stored events, where `RN-R20` compares nothing, and every file routed `duplicate`. A driver is one
   * run (`ID-R3`) and is never handed a memory: the replay REBUILDS it by re-evaluating every gate on the
   * stored settlements in their order, so it is the run's memory at every position and nothing else's.
   *
   * **Retained for the life of the run** — `RN-R13`'s fourth term: a later branch may reach the gate, and
   * this driver cannot know that none will. For `distinct` it is one entry per distinct key seen.
   */
  private readonly gateMemory = new Map<string, Map<string, unknown>>();

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
    // **`defaultRetryPolicy` is held to `FD-V30` here, before the definition is validated** — W58's
    // adequacy reader (`x03`): a string, `{}`, `null` or an extra key all reached `createTask`
    // untouched while `retryPolicyProblem`'s own comment said the driver's option read it. The
    // default is the policy a node would otherwise have declared, so the rule that refuses the
    // shape on a node refuses it here, under the same id and the same message.
    if (opts.defaultRetryPolicy !== undefined) {
      const problem = retryPolicyProblem(opts.defaultRetryPolicy);
      if (problem !== null) {
        throw new InvalidDefinition(['FD-V30'], `defaultRetryPolicy is not a RetryPolicy — FD-V30: ${problem}`);
      }
    }
    // **The node types are held at construction too, before the definition is validated** — W59.
    // A type's `retryPolicy` is the policy every node of it would otherwise have declared, so
    // `FD-V30` refuses the shape here as it refuses `defaultRetryPolicy`'s; a type's `groups` are
    // the POOL's, and a pool naming a group this scheduler lacks acquires nothing and says
    // nothing (measured at W59, both runtimes — P16 fact 2 one level up), so `FD-V31` refuses
    // it here, naming the type. `nodeTypesOf` is the validator's own normaliser, so the two
    // read the option identically.
    this.nodeTypes = nodeTypesOf(opts.nodeTypes);
    const declaredGroups = new Set(opts.groups ?? []);
    for (const [name, t] of this.nodeTypes) {
      if (t.retryPolicy !== undefined) {
        const problem = retryPolicyProblem(t.retryPolicy);
        if (problem !== null) {
          throw new InvalidDefinition(['FD-V30'], `node type "${name}" declares a retryPolicy that is not a RetryPolicy — FD-V30: ${problem}`);
        }
      }
      // A DOCUMENT type's declared groups are checked here by name (a class's are inside its
      // derivation, which the driver never runs — the runtime checks those at construction).
      for (const g of (isDerivation(t) ? [] : (t as NodeTypeDeclaration).groups ?? [])) {
        if (!declaredGroups.has(g)) {
          throw new InvalidDefinition(['FD-V31'], `node type "${name}" declares group "${g}", which the registry does not declare — FD-V31: ` +
            'a pool naming a group the scheduler lacks acquires nothing, in silence, exactly as a task does');
        }
      }
    }
    // **And the registry's SHAPE, by name — v0.19 (W65, ADR 0053 and 0054).** Every worker's four
    // schemas in the built-in subset (`SchemaRefused` names the keyword — Q278), every type's shape and
    // its worker present (`WorkerMissing`), every named pool's type present (`PoolTypeMissing`) and no
    // pool named as a type (`NameCollision`). A registry defect is reported where the registry is built,
    // as a `RegistryError` naming the entry, and never blamed on the document. The runtime ran the same
    // checks when it built the pools; here they run for a driver built by hand.
    checkRegistry({ workers: opts.workers, nodeTypes: opts.nodeTypes, pools: opts.pools, gateTypes: opts.gateTypes });
    // **The languages are held at construction too, and read for ONE thing** — W61. A `compile`
    // that is not a function is the REGISTRY's mistake (the schema-object shape a reader is likely
    // to try, one set over from `FD-V33`'s), refused here naming the language rather than on every
    // node that names it; `worker`, the other half, is the bootstrap helper's to check, because
    // the driver never loads it. `languagesOf` is the validator's own normaliser.
    this.languages = languagesOf(opts.languages);
    this.workers = workersOf(opts.workers);
    // The gate types — `checkRegistry` above has already held a consumer's to `GateType` and refused one
    // named as a built-in, so this is the normaliser the validator shares (`gateTypesOf`), read once.
    this.gateTypes = gateTypesOf(opts.gateTypes);
    for (const [name, l] of this.languages) {
      if (typeof l?.compile !== 'function') {
        throw new InvalidDefinition(['FD-V36'], `language "${name}" declares no compile function — FD-V36: ` +
          'the registry half of a language adapter is a synchronous compile(expr) that throws on a syntax error');
      }
    }
    const registry: Registry = {
      predicates: new Set(opts.predicates.keys()),
      // `FD-V31` — absent means empty (W58). `new Set(undefined)` would also be empty, and
      // the `?? []` is here so the reading is stated rather than an accident of the constructor.
      groups: new Set(opts.groups ?? []),
      nodeTypes: this.nodeTypes,
      languages: this.languages,
      // v0.19 (W65): the workers a type's `worker` names and the named pool instances a task's `pool`
      // names, normalised as the sets above are — absent means EMPTY.
      workers: workersOf(opts.workers),
      pools: poolsOf(opts.pools),
      // v0.23: the gate types a gate's `type` may name (`FD-V39`) — handed as given, since the validator
      // merges them over the built-ins with the same `gateTypesOf` this driver reads them through.
      ...(opts.gateTypes !== undefined ? { gateTypes: opts.gateTypes } : {}),
    };
    const findings = validateDefinition(definition, registry);
    if (findings.length) throw InvalidDefinition.fromFindings(definition.flowId, findings);
    // **A GATE RUNS, and until W93 it was refused at this exact point** — ADR 0066 rule 7, LIFTED by
    // [ADR 0067](../../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md).
    // W92 made a gate a VALID definition and refused every flow holding one here, by name, because the
    // `enter()` arm that runs one was this item's; taught to the validator and not to the driver, a gate flow had
    // DISPATCHED the task before the gate and stopped only when it settled — a real worker run first. The arm
    // exists now, so there is nothing left to refuse: what a gate can still do wrong at RUN time — a type
    // returning a route it does not declare (`FD-R5`), or throwing — stops the run by name where it happens,
    // and everything a DOCUMENT can do wrong is `FD-V39`-`FD-V41`, above. *(`test/driver/needs.test.ts`
    // asserted the refusal on `gated-map` where it RUNS every other region-bearing corpus flow, so that this
    // lift would fail it rather than pass in silence.)*
    //
    // **Each gate's ROUTE SET, resolved ONCE, here** — ADR 0092 rule 3, W153. A static type's own members, or
    // what a derived type's `routesFor` returns for the gate's settings: `routesOf`, the function the validator
    // just asked, so a definition it accepted resolves. Every later read — `FD-R5`'s declared check, the default
    // edge, `FD-R4`'s entry walk — reads THIS cache, so within one run a gate's routes have one answer; a resume
    // is a new driver and asks again, from the same settings by the same function.
    const gateRoutes = new Map<string, Exclude<ReturnType<typeof routesOf>, { readonly problem: string }>>();
    for (const n of definition.nodes) {
      if (n.kind !== 'gate') continue;
      const resolved = routesOf(this.gateTypes.get(n.type)!, n.settings ?? {});
      // Unreachable for a type that is the pure function of its settings ADR 0092 asks it to be: the
      // validator asked the same function a moment ago. Loud rather than a gate with no routes.
      if ('problem' in resolved) {
        throw new InvalidDefinition(['FD-V39'], `gate "${n.id}"'s type "${n.type}" resolved no route set at construction, after validation accepted one — FD-V39: ${resolved.problem}`);
      }
      gateRoutes.set(n.id, resolved);
    }
    this.gateRoutes = gateRoutes;
    this.def = definition;
    this.opts = opts;
    this.now = opts.now ?? (() => Date.now());
    this.graph = buildGraph(definition);
    this.regions = allRegions(this.graph, definition);

    if (this.regions.length > 0 && !opts.joinPolicy) {
      throw new MissingJoinPolicy(
        `definition "${definition.flowId}" has ${this.regions.length} ` +
          `fan-out region(s) and no joinPolicy. ` +
          'Without one every branch would arrive and the join would never fire, which is ' +
          'indistinguishable from the case P1 exists to measure.',
      );
    }

    // **A region opener inside a `map` region RUNS, and until W84 it was refused at
    // this exact point** -
    // [ADR 0062](../../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md),
    // [Q160](../../doc/questions/q160.md) and [Q156](../../doc/questions/q156.md).
    //
    // **What the refusal was for.** A `map` is the first construct in this library
    // that enters one opener node more than once in a run, and every per-region
    // run-time structure here was keyed by that node's **id** alone. So instance 2's
    // `open()` discarded instance 1's state, `firedJoins` made the second join
    // unreachable, and the fold merged two distinct regions into one entry. Measured
    // by W33's conformity reader on a definition `validateDefinition` accepts with
    // ZERO findings - `map(split)` into `lead` into `fanout(f2)` into two branches
    // into `join(j2)` into `join(collect)`, all seven tasks settling `done` - and
    // the run reported **`stuck`**. W33 refused the shape rather than running it
    // wrong, which is `doc/workflow.md` section 1 rule 4 applied to a capability.
    //
    // **What replaces it is a KEY and not a check.** A region INSTANCE is
    // `(opener node id, the opener's own branchPath)`, so those five structures are
    // two-level and instance 2 gets its own entry. There is nothing left to refuse:
    // the three mechanisms the refusal named are each closed by the key, and a check
    // that stayed would be refusing the shape its own replacement now executes.
    //
    // **Lifted WHOLE rather than narrowed to `map`-in-`map`.** Conditioning it on
    // which KIND of region encloses which would make the grammar's one refusal turn
    // on a distinction
    // [ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
    // spent a plan removing - and it is the same key either way, because
    // `branchPathOf` walks map and fanout segments with one loop.
    //
    // **What is still refused, and by what**: `FD-V19` still keeps one node out of
    // two branch entries of one fanout, `ID-R6` still refuses a `branchPath` across
    // a map region with no item index supplied, and `ID-R1` still refuses a
    // duplicate dispatch. Those three are what make the derived key TOTAL, and they
    // are why lifting this costs no new refusal.

    for (const name of SUBSCRIBED_EVENTS) {
      // ADR 0007 rule 1: the normalization happens HERE, synchronously, while the
      // listener runs. Nothing downstream ever sees `e.detail`.
      // The seam's listener takes `object` (see `SchedulerLike`); `detail` is read here, once,
      // and an event without one — which no `FyflowScheduler` emits — reaches `onEvent` as
      // `undefined`, where ADR 0027's producer table already says what a detail with no `id` is.
      opts.scheduler.addEventListener(name, (e) => this.onEvent(name, detailOf(e) as TaskDetailLike));
    }
    // `RN-R42` — the pass-through pair, each ONLY for a callback given (P36 (k)); through `onEvent`, so a pass-through is a
    // scheduler event's step like any other: deafness, the listener boundary and a pause or stop called from it all hold.
    for (const [name, callback] of PASS_THROUGH) {
      if (opts[callback] !== undefined) opts.scheduler.addEventListener(name, (e) => this.onEvent(name, detailOf(e) as TaskDetailLike));
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
    this.stepping += 1;
    try {
      this.startStep(payload);
    } finally {
      this.leaveStep();
    }
  }

  /** `start`'s body — wrapped so the driver knows it is on the stack of its own step (`stepping`, `RN-R31`, W173 D-1). */
  private startStep(payload: unknown): void {
    const runId = this.runId;
    if (this.started) {
      throw new MultipleRuns(
        `this driver already started run "${runId}" and cannot start it again. ` +
          'ID-R3: a Driver serves exactly one run — its input sequence, its fired joins and its ' +
          'policy state carry no run id, so a second run would silently merge into the first. ' +
          // **[Q87](../../doc/questions/q87.md) — this sentence recommended the violation.** It
          // ended at *"on the same scheduler"*, and the obvious second `Driver` for a caller
          // re-running a workload is one carrying the run id they already have. Two drivers on one
          // run id mint the SAME task ids, so `dispatched.has()` is true in both, `ID-R4` cannot
          // see it, and one settlement dispatches the successor twice with nothing reported.
          // **No driver can detect it** — `SchedulerLike` has two required methods and an optional `cancel`, and none asks who else
          // is subscribed (the seam is two methods by ADR 0001, stays so under ADR 0048, and ADR 0104 adds only an optional one) — so it stays a precondition, and the least the
          // library can do is not advise against it in its own error text.
          'Construct a second Driver WITH A DIFFERENT RUN ID; ADR 0023 makes that safe on the ' +
          'same scheduler. Run ids must be unique across the drivers sharing one — nothing ' +
          'enforces that and nothing can see it violated.',
      );
    }
    // **`FD-R4` at the START boundary — W73, before `started` is set, so a refused payload leaves the
    // driver UNSTARTED and a corrected one may start it.** The targets are the wiring check's own walk
    // (the entry task, or every branch task of an entry region, recursively — one derivation, two
    // callers), each value composed through the node's `needs` exactly as `enter` will compose it,
    // and held to the task's worker `inputSchema`; a task whose worker declares none is unchecked, and so
    // is a task that declares a `transform` (ADR 0101, below).
    // The composition cannot throw here: at an entry `FD-V27` admits no NODE reference, so what an entry can
    // name is `"."` — the value whole — and, since v0.44, `"$payload"` — the run's payload (W73's adequacy reader
    // measured the guard dead on every valid definition — a `needs` naming a node is refused at construction,
    // `FD-V11`/`FD-V27`). **The run's payload is HANDED to the composition, and it is the caller's `payload`**
    // (P38 (f)): the header does not exist yet — it is built below, after this check — so a `"$payload"` key read
    // from `this.header` here would read nothing, and the boundary would hold a DIFFERENT value than the run
    // receives, the defect class Q633 was. The value is the one the header's copy is taken from just below, after this check and before `onHeader`.
    if (this.opts.validateBoundaries !== false) {
      // **Through an entry GATE, only the route it will take** (W93): without the chooser the walk holds the
      // payload to every route's target, and a run could be refused by a task it never reaches.
      for (const { node, value } of boundaryTargets(this.def, payload, (g, v) => this.boundaryEdges(g, v))) {
        const n = this.graph.byId.get(node);
        if (!n || n.kind !== 'task') continue;
        // **A task that declares a `transform` is UNCHECKED here** — ADR 0101, W170, Q633's road 2. What its
        // worker's `inputSchema` holds is what the node RECEIVES (`FD-C5`), which for a transforming node is the
        // transform's RESULT, made only in the type's worker wrapper (`FD-C6`); `start()` is synchronous and
        // evaluates nothing. Holding the payload BEFORE the transform gave one value the opposite verdict to
        // `tryTransform(…, { input })` (P34 fact 10). The same road as a worker declaring no `inputSchema`, and the
        // walk goes ON to the other targets — `continue`, never `break`.
        if (n.transform !== undefined) continue;
        const type = this.nodeTypes.get(n.type);
        // A type that only transforms names no worker (ADR 0075), so there are no schemas to hold a
        // boundary to — the `undefined` falls through to the `schema === undefined` skip below, which is
        // the same road a worker declaring no `inputSchema` already takes.
        const worker = type?.worker === undefined ? undefined : this.workers.get(type.worker);
        const schema = worker?.inputSchema;
        if (schema === undefined) continue;
        const received = this.compose(n, value, new Map(), payload);
        const fs = findings(schema, received);
        if (fs.length) {
          throw new BoundaryRefused('start', node, null, fs,
            `the payload handed to run "${runId}" does not satisfy the inputSchema of node "${node}"'s worker ` +
              `"${type!.worker}" (type "${n.type}") — ${describeFindings(fs)}. FD-R4: the run's payload is held to the first ` +
              'task(s) it reaches once, at start(); nothing was dispatched and this driver is unstarted, so a corrected payload may start it. ' +
              '`validateBoundaries: false` turns the check off.');
        }
      }
    }
    // **`RN-R15` — the header, and its entry payload is a COPY taken HERE, at the call** (ADR 0064
    // rule 2). Before `started` is set, so an uncloneable payload throws the platform's
    // `DataCloneError` at the caller with the driver UNSTARTED and nothing appended — `OR-R12`'s
    // asymmetry at the other caller-initiated boundary: the one party that can fix it is on the
    // stack. **A behaviour change, measured rather than argued**: before W88 a payload holding a
    // function started a run on an inline pool; it cannot be checkpointed, and a run that cannot be
    // checkpointed is refused before it exists rather than discovered when someone asks for one.
    const entryPayload = structuredClone(payload);
    const header: CheckpointHeader = { format: CHECKPOINT_FORMAT, runId, flowId: this.def.flowId, version: this.def.version, entryPayload };
    // **`RN-R39` — the header handed to `onHeader` BEFORE anything is appended or handed to the scheduler** (P36 decision 1,
    // (d), (e), [ADR 0112](../../doc/decisions/0112-a-run-delivers-its-header-before-its-first-event.md)): after `FD-R4` and
    // the clone above, so a payload either refuses never reaches it. A FROZEN copy of its own, equal to `checkpoint().header`.
    // **A throw leaves the driver UNSTARTED** — nothing appended, nothing handed on, nothing reported: no run exists yet, as
    // after an `FD-R4` refusal — and reaches the caller; a corrected retry may start this driver. While it runs the driver
    // counts as started with NO header — the state `checkpoint()`, `cancel`, `stop`, `pause` and a scheduler event already
    // read as *holds no run* — so a `start()` or `resume()` the callback makes is `MultipleRuns`, never a second entry.
    const onHeader = this.opts.onHeader;
    if (onHeader !== undefined) {
      this.started = true;
      try {
        onHeader(Object.freeze({ ...header, entryPayload: structuredClone(entryPayload) }));
      } catch (e) {
        this.started = false;
        throw e;
      }
    }
    this.header = header;
    this.started = true;
    try {
      this.enter(runId, this.def.entry, payload);
    } catch (e) {
      // `start` is called by the caller, not by a listener, so it BOTH reports
      // and rethrows: the caller is on the stack and can act on it. **ONCE** (W184, P35 (k)): a halt a call made on this
      // stack already reported — a `cancel()` from a callback whose own element threw — is not reported again.
      this.haltOnce(e);
      throw e;
    }
  }

  /**
   * **Resume the run a checkpoint stored, in place of `start()`** — `spec/run-state.md` section 9,
   * `RN-R19` to `RN-R24`,
   * [ADR 0065](../../doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md),
   * P23 decisions 6, 7, 9 and 10. The driver must be FRESH and constructed for the checkpoint's run
   * (`runtime.resume` does both); `start()` and `resume()` are one run's two doors and a driver takes
   * one of them once (`ID-R3`).
   *
   * **In order, and each step is a rule:**
   *   1. **Refuse what the header says** (`RN-R23`) — {@link resumeRefusal}.
   *   2. **REPLAY** (`RN-R19`): enter the entry node with a copy of `header.entryPayload` exactly as
   *      `start()` enters it, then FEED every stored settlement, resolution and `resumed` element — and, since
   *      v0.19 and v0.20, every `interrupted`, `paused` and `unpaused` one, and since v0.26 every `attempted` one — at its own position through the routing the listener and `resolve()` use — every dispatch HELD. Every
   *      other element the replay REGENERATES.
   *   3. **The PREFIX check** (`RN-R20`): each regenerated element at a position the stored events cover
   *      must be the stored one; the first that is not is refused as `diverged`, naming its position, and
   *      so is a replay that ends short. A replay that runs PAST the stored events is the stored run's
   *      lost tail — a checkpoint taken inside `onFoldInput` ends mid-step (ADR 0064) — and it is
   *      DELIVERED, because the consumer does not hold it (`RN-R24`).
   *   4. **A run the replay HALTS is refused** as `halted` (P23 decision 10), its tail delivered first.
   *   5. **Append `resumed`** naming the IN-FLIGHT set — dispatched and never settled, in dispatch order
   *      (`RN-R21`, `RN-R22`) — and then hand each to the scheduler at the SAME task id, with `attemptsSpent` the highest
   *      attempt recorded for it where one was (v0.26, W186); or, where the replay
   *      ends PAUSED (a fed `paused`, no `unpaused` after it), HOLD each again for an unpause (`RN-R35`).
   *
   * **At-least-once, and that is the contract rather than a defect** (P23 decision 6): a task named in
   * `resumed` may have finished in the process that is gone, and runs again here. **Not at a fresh retry budget since
   * W186** (`RN-R21` v0.26, ADR 0113): it is handed on with `attemptsSpent`, the highest attempt the stored run recorded
   * for it — the attempt in flight at the kill or the stop counted as spent — so a spent budget runs ONCE more and no more.
   * *Until W186 it ran at a FRESH budget ([Q365](../../doc/questions/q365.md) — measured: a budget of two attempts ran
   * three times across one kill).* A task parked at `user_action` has SETTLED and is not in flight: it stays parked,
   * and `resolve()` works on it.
   *
   * @throws MultipleRuns — the driver has already started or resumed a run.
   * @throws ResumeRefused — see {@link ResumeRefusalReason}; the driver is then spent.
   * @throws the consumer's own error — a callback that threw on the `resumed` element, or on an element the resume's step
   *   appended after it: the run is HALTED and reported once, and nothing further is handed on (P36 (c), W184).
   */
  resume(checkpoint: Checkpoint): void {
    this.stepping += 1;
    try {
      this.resumeStep(checkpoint);
    } finally {
      this.leaveStep();
    }
  }

  /** `resume`'s body — wrapped so the driver knows it is on the stack of its own step (`stepping`, `RN-R31`, W173 D-1). */
  private resumeStep(checkpoint: Checkpoint): void {
    if (this.started) {
      throw new MultipleRuns(
        `this driver already started or resumed run "${this.runId}", and resume() is the other door into the SAME run. ` +
          'ID-R3: a Driver serves exactly one run, entered once — construct a fresh Driver for the checkpoint (runtime.resume does).',
      );
    }
    const refused = resumeRefusal(this.def, checkpoint, this.runId);
    if (refused !== null) {
      // Spent, like any refused resume: a driver subscribed at construction and cannot be detached, so
      // it is never offered a second chance at a run a consumer may meanwhile have resumed elsewhere.
      this.started = true;
      this.failed = true;
      throw refused;
    }
    const stored = checkpoint.events;
    // **The header is the checkpoint's, as `RN-R15` defines it one run later**: the same five facts,
    // and the entry payload a COPY of the stored copy — taken HERE, so an uncloneable value throws
    // `DataCloneError` with the driver unstarted, as `start()` does, and so the replay below is handed a
    // copy of its own rather than the header's.
    const entryPayload = structuredClone(checkpoint.header.entryPayload);
    this.header = { format: CHECKPOINT_FORMAT, runId: this.runId, flowId: this.def.flowId, version: this.def.version, entryPayload };
    this.started = true;
    const replay: Replay = { stored, feeding: -1, held: new Map() };
    this.replay = replay;
    try {
      this.replayStored(stored);
    } catch (e) {
      this.replay = null;
      this.header = null;
      this.failed = true;
      throw e;
    }
    this.replay = null;
    // **`halted` regenerated PAST the stored events** — the lost tail held the run's halt. The
    // elements were delivered (the consumer's store now holds the halt); the run is not resumed.
    if (this.failed) {
      this.deaf = true;
      const at = this.inputs.findIndex((e) => e.kind === 'halted');
      throw new ResumeRefused('halted', at,
        `ResumeRefused (halted): replaying run "${this.runId}" regenerated its HALT at position ${at} — past the ${stored.length} ` +
          `stored element(s), in the tail the store had lost: ${describeElement(this.inputs[at])}. A halted run is not resumable ` +
          '(P23 decision 10); the tail, `halted` included, has been delivered to onFoldInput so a store can hold it.');
    }
    // **The replay's hold for a FED `interrupted` ends here** (`RN-R19`, `RN-R32`, ADR 0105): the stored run was stopped
    // on another runtime, and this resume is what continues it — before `resumed`, so the re-dispatch below is not held.
    // Only a TAKEN stop is the replay's: one PENDING was called live from a callback on the lost tail (`RN-R33`), and it is
    // taken when `resume()` returns — after `resumed` and every hand-off below, which it then cancels.
    if (this.stopRequest !== null && this.stopRequest.pending === null) this.stopRequest = null;
    const inFlight = this.inFlight();
    // **A run whose replay ends PAUSED resumes PAUSED** (`RN-R35`, `RN-R21` v0.20, P34 (e), W175): the replay fed its
    // `paused` element and no `unpaused` after it, so the WHOLE in-flight set is HELD again — a task the stored run had
    // handed on as much as one it held, since the log cannot tell them apart and this driver has handed on neither — for an
    // unpause here to hand on. **Held BEFORE `resumed` is appended**, in dispatch order (W175's conformity reader, D2): a
    // dispatch a consumer's callback on that element causes joins the END of the queue, as on any paused run; and a cancel
    // raised there releases them, handing each on and cancelling it (`cancel()`, ADR 0104 rule 7).
    const holding = this.paused;
    // **Each in-flight task re-handed with the attempts it SPENT** (`RN-R21` v0.26, `RN-R40`, P36 (g), (h), ADR 0113, W186):
    // `attemptsSpent` the HIGHEST `attemptNumber` the replay was fed for it — so the attempt in flight at the crash, or at a
    // stop, counts as spent — and ABSENT where none was recorded. With or without a `retryPolicy`, and a spent budget handed
    // on all the same: the scheduler runs it once more and settles it; no settlement is written here (P36 decision 7).
    // *Until W186 every task here started at a FRESH budget — two attempts ran three times across one kill (Q365).*
    for (const id of inFlight) {
      const config = replay.held.get(id);
      const spent = this.lastAttempt.get(id) ?? 0;
      if (config !== undefined && spent > 0) replay.held.set(id, { ...config, attemptsSpent: spent });
    }
    if (holding) {
      for (const id of inFlight) {
        const config = replay.held.get(id);
        if (config === undefined) throw new Error(`resume: in-flight task "${id}" has no held dispatch — this is a defect in the driver`);
        this.pauseHeld.set(id, config);
      }
    } else {
      // **Not yet handed back, until each is** (`RN-R31`, W173): a cancel raised on the `resumed` element below sends the
      // scheduler nothing for these, and each is cancelled as it is handed on.
      for (const id of inFlight) this.unhanded.add(id);
    }
    // **`resumed` BEFORE the first re-dispatch** (P23 stop-and-ask (a)): a consumer and the fold learn
    // what is being run again before any of it can settle.
    try {
      // **Inside the boundary** (P36 (c), W184): a consumer's callback THROWING on `resumed` has the element in the log,
      // reported once and the run HALTED — and NOTHING handed on, the hold below never reached. *Until W184 the throw
      // reached the caller with the run unhalted and the in-flight set never handed on: `running` for ever* (P36 fact 11
      // R11). A replay that regenerated a halt in the lost tail never gets here: `ResumeRefused('halted')` (`RN-R37`).
      this.append({ kind: 'resumed', taskIds: inFlight });
      for (const id of holding ? [] : inFlight) {
        // **`RN-R29` — the hold, before EACH re-dispatch** (ADR 0103 rule 5, the maintainer's answer to W172's S-1,
        // 2026-10-16): a consumer's callback on the `resumed` element above — or one a hand-off below reaches — can
        // halt the run on this stack, and a halted run hands nothing further to the scheduler.
        // **EXCEPT a requested cancel** (`RN-R31`, ADR 0104, W173): these tasks are `dispatched` in the run's sequence
        // and unsettled, so the fold reads the run `cancelling` until each settles — and only the scheduler writes a
        // settlement (ADR 0007). Held here, they would never settle and `done` would never come; so each is handed on
        // and cancelled at once (`handOn`), the road P34 (c) gives a paused run's held tasks.
        if (this.holdsResume()) break;
        const config = replay.held.get(id);
        // Every in-flight id was dispatched DURING the replay, and every dispatch during it is held, so
        // this cannot miss — and if it could, a task would be silently lost, which is the one outcome
        // at-least-once exists to exclude. Loud instead.
        if (config === undefined) throw new Error(`resume: in-flight task "${id}" has no held dispatch — this is a defect in the driver`);
        this.handOn(id, config);
      }
    } catch (e) {
      // `start()`'s treatment: caller-initiated, so reported — ONCE (`haltOnce`) — AND rethrown.
      this.haltOnce(e);
      throw e;
    } finally {
      // What a halt left unhanded is never handed: nothing is waiting to cancel it.
      this.unhanded.clear();
    }
  }

  /**
   * **The replay** — `RN-R19` and `RN-R20`. Every fed element goes through {@link Driver.feed}, which
   * turns a refusal routing raises into a `halted` element exactly as the listener's boundary does
   * (`OR-R10`), so the replay regenerates a halt where the stored run had one.
   */
  private replayStored(stored: readonly FoldInput[]): void {
    const replay = this.replay!;
    this.feed(() => this.enter(this.runId, this.def.entry, structuredClone(this.header!.entryPayload)));
    for (let i = 0; i < stored.length; i += 1) {
      const e = stored[i]!;
      if (!isFed(e)) continue;
      // The replay must have regenerated everything before this position. Short of it, the stored
      // element at the replay's length is one the replay did not produce.
      if (this.inputs.length !== i) throw this.diverged(this.inputs.length, 'the replay produced nothing there');
      replay.feeding = i;
      this.feed(() => this.feedOne(e, i));
    }
    if (this.inputs.length < stored.length) throw this.diverged(this.inputs.length, 'the replay ended before it');
  }

  /** One fed element — a settlement, a resolution, an earlier resume, a stop, a pause, an unpause or an attempt — at stored position `i`. */
  private feedOne(e: FoldInput, i: number): void {
    if (e.kind === 'resumed') {
      // **An earlier resume, fed and CHECKED** (`RN-R22`): the ids it names must be exactly what is in
      // flight in the replay at this point, or the stored run is not the one this replay regenerates.
      const now = this.inFlight();
      if (!Array.isArray(e.taskIds) || e.taskIds.length !== now.length || e.taskIds.some((t, k) => t !== now[k])) {
        throw this.diverged(i, `in flight in the replay here: ${JSON.stringify(now)}`);
      }
      // **And it ENDS a fed stop** (`RN-R22`, `RN-R32`, W174): the stored run was resumed here after a stop, and routed
      // again from this element on.
      this.stopRequest = null;
      this.append({ kind: 'resumed', taskIds: [...e.taskIds] });
      return;
    }
    if (e.kind === 'interrupted') {
      // **A stored STOP, fed** (`RN-R19` v0.19, W174): a stop is taken at rest — between the driver's steps — so the
      // replay reaches its position between the steps it regenerates, and holds from here as the stored run was held.
      this.feedInterrupted(e);
      return;
    }
    if (e.kind === 'paused' || e.kind === 'unpaused') {
      // **A stored PAUSE or UNPAUSE, fed** (`RN-R19` v0.20, `RN-R35`, W175): taken at rest, so the replay reaches it between
      // the steps it regenerates. The flag is set as the stored run's was; the replay holds every dispatch anyway, and
      // what the stored unpause handed on is the resume's to decide (`RN-R21`). Appended as stored, its actor its own.
      this.paused = e.kind === 'paused';
      this.append({ kind: e.kind, actor: e.actor });
      return;
    }
    if (e.kind === 'attempted') {
      // **A stored ATTEMPT, fed** (`RN-R19` v0.26, `RN-R40`, W186): appended at rest, so the replay reaches it between the
      // steps it regenerates. `ID-R4`'s question asked of the replay, as for a settlement — the stored run recorded attempts
      // of tasks it had dispatched only — and the number must be one the driver could have recorded: a positive integer
      // GREATER than the last one stored for that task (W186's adequacy reader A3, conformity C5 — the driver appends only
      // a rise, so a stored element that does not rise is a store the run did not write). Appended as stored; so the LAST
      // number fed per task is also its highest, which is what the resume re-hands it with (`RN-R21`).
      const n = e.attemptNumber;
      if (typeof e.taskId !== 'string' || !this.dispatched.has(e.taskId)) throw this.diverged(i, 'the replay never dispatched that task');
      if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) throw this.diverged(i, 'its attemptNumber is not a positive integer');
      if (n <= (this.lastAttempt.get(e.taskId) ?? 0)) throw this.diverged(i, 'its attemptNumber does not exceed the one stored before it for that task');
      this.lastAttempt.set(e.taskId, n);
      this.append({ kind: 'attempted', taskId: e.taskId, attemptNumber: n });
      return;
    }
    if (e.kind !== 'outcome' && e.kind !== 'resolution') return;
    const record = e.record;
    let parts: TaskIdParts;
    try {
      parts = parseTaskId(record?.taskId);
    } catch {
      throw this.diverged(i, 'its task id does not parse, so no driver minted it');
    }
    const { runId, nodeId, branchPath } = parts;
    if (e.kind === 'outcome') {
      // `ID-R4`'s two tiers, asked of the REPLAY: the stored run appended only settlements for tasks it
      // had dispatched, so one the replay did not dispatch is a run the replay is not regenerating.
      if (runId !== this.runId || !this.dispatched.has(record.taskId)) {
        throw this.diverged(i, 'the replay never dispatched that task');
      }
      this.settle(cloneRecord(record as OutcomeRecord), runId, nodeId, branchPath);
      return;
    }
    // `RS-R1`, asked of the REPLAY: the stored run accepted this resolution, so its task was parked — a task at
    // `user_action`, or since v0.22 an ASK the replay has re-entered and re-parked (`RN-R37`), never answered.
    if (!this.parked(record.taskId)) throw this.diverged(i, 'that task is not parked in the replay');
    this.appendResolution(cloneRecord(record as ResolutionRecord), nodeId, branchPath);
    // *No `shut()` check here, unlike `resolve()`'s door (b), and deliberately* (W172's conformity reader, C7): a
    // replay delivers no callback for a stored position (`RN-R24`), so nothing on this stack can halt the run between
    // the append and the routing; a stored halt arrives as its own fed element, later.
    this.advance(runId, nodeId, branchPath);
  }

  /** The listener's boundary, for the replay: a refusal routing raises stops the run (`OR-R10`); a refused resume passes through. */
  private feed(step: () => void): void {
    try {
      step();
    } catch (e) {
      if (e instanceof ResumeRefused) throw e;
      this.failRun(e);
    }
  }

  /** `RN-R20`'s refusal, naming the position and both elements there. */
  private diverged(at: number, why: string): ResumeRefused {
    const stored = this.replay?.stored ?? [];
    return new ResumeRefused('diverged', at,
      `ResumeRefused (diverged): replaying run "${this.runId}" does not reproduce the stored element at position ${at} — ` +
        `stored ${describeElement(stored[at])}, replayed ${describeElement(this.inputs[at])} (${why}). P23 decision 9: a stored run the ` +
        'replay cannot regenerate — a predicate, a definition or an entry payload that is not what produced it — is refused rather than ' +
        'resumed on a different road. Nothing was handed to the scheduler.');
  }

  /**
   * **What is IN FLIGHT: dispatched, and no settlement in the log** — `RN-R21`, in dispatch order. A
   * `user_action` settlement IS a settlement: a parked task is waiting on a person, not on a worker, and
   * handing it to a worker again would run what a person was asked to decide.
   */
  private inFlight(): string[] {
    const settled = new Set<string>();
    for (const r of this.log) if (r.kind === 'outcome') settled.add(r.taskId);
    return [...this.dispatched].filter((id) => !settled.has(id));
  }

  /**
   * **Whether a callback fires for the element at `seq`** — `RN-R24`. Always, except during a replay,
   * where it fires for exactly the positions PAST the stored events: the consumer holds everything
   * before them, and the lost tail is what it does not.
   */
  private delivers(seq: number): boolean {
    return this.replay === null || seq >= this.replay.stored.length;
  }

  // --- inbound: the one thing outside this process that can change a run -------

  /**
   * ADR 0004 rules 4-6. `RS-R1`: refused unless the task's LAST record is an
   * outcome in `user_action` — so a task already resolved is not suspended, and a
   * second resolution is refused like any other. A rejected command, not a run
   * failure: it came from outside and a caller can retry.
   *
   * **And an ASK's answer** — `RS-R1` v0.18, `RN-R37`, ADR 0109: an ask the run reached and nobody has answered is
   * suspended too, so the person's answer is this call — `'done'` with the answer as `result`, held to the ask's
   * `answerSchema` (`FD-R4`), or `'failed'` with an `error`, the person DECLINING, held to nothing. The answer IS the
   * node's result and routes as a task's settlement does.
   *
   * @returns `false` when refused. Nothing is appended and the run is unaffected.
   */
  resolve(
    taskId: string,
    resolvedAs: 'done' | 'failed',
    value: { result?: unknown; error?: string; actor: string },
  ): boolean {
    // Read BEFORE this call counts itself in: a call made from a callback on the driver's own step (`RN-R37`).
    const midStep = this.stepping > 0;
    this.stepping += 1;
    try {
      return this.resolveStep(taskId, resolvedAs, value, midStep);
    } finally {
      this.leaveStep();
    }
  }

  /** `resolve`'s body — wrapped so the driver knows it is on the stack of its own step (`stepping`, `RN-R31`, W173 D-1). */
  private resolveStep(
    taskId: string,
    resolvedAs: 'done' | 'failed',
    value: { result?: unknown; error?: string; actor: string },
    midStep = false,
  ): boolean {
    if (!this.parked(taskId)) return false;
    // **An answer already given on this step and pending is the ask's answer** — a second is refused as a second
    // resolution is (`RS-R1`): the ask is not suspended for anyone else to answer (`RN-R37`).
    if (this.pausePending.some((c) => c.kind === 'answer' && c.record.taskId === taskId)) return false;
    const { runId, nodeId, branchPath } = parseTaskId(taskId);
    // `OR-R10` — *"the driver has stopped routing it"*, and that has to hold on
    // the INBOUND edge too. `onEventOrThrow` checks this; `resolve` did not, so a
    // resolution for a suspended task in a halted run appended a record and
    // dispatched. W5's sequence made it visible: the elements kept arriving after
    // the `halted` element, while `withOutcome` pins the outcome to `halted`,
    // so nothing reported the work. Refused like any other rejected command.
    // **And after a CANCEL** (`RN-R28`, ADR 0094 rule 3): a parked task in a cancelled run stays parked, as
    // after a halt — the run is terminal, and a resolution would route a run its owner ended.
    // **And from the moment a STOP is accepted** (`RN-R33`, P34 decision 9, W174) — taken or still pending on this step:
    // a stopped run's parked task is resolved on the runtime that RESUMES it, never on the one that stopped it.
    if (this.shut() || this.stopRequest !== null) return false;
    // **`FD-R4` at the RESOLVE boundary — W73.** A person's `done` value is held to the parked node's
    // worker `outputSchema` before anything is appended: refused, the task is STILL suspended and a
    // corrected value resolves it — a rejected command, as `RS-R1`'s other refusals are, and the
    // value ADR 0056 rule 3 says a person reaches for is the worker's declared example. A `failed`
    // resolution carries an error string and no result, so nothing holds it.
    if (resolvedAs === 'done' && this.opts.validateBoundaries !== false) {
      const n = this.graph.byId.get(nodeId);
      // **An ASK's answer is held to the ASK's `answerSchema`** (`FD-R4` v0.43, P35 (d), ADR 0109) — the node's own
      // contract for what a person may answer, where a task's resolution is held to its worker's `outputSchema`. Absent,
      // the answer is held to nothing; the same refusal, thrown by name before anything is appended, the ask still parked.
      if (n?.kind === 'ask') {
        const schema = n.answerSchema;
        const fs = schema === undefined ? [] : findings(schema, value.result ?? null);
        if (fs.length) {
          throw new BoundaryRefused('resolve', nodeId, taskId, fs,
            `the answer to "${taskId}" (ask "${nodeId}") does not satisfy the ask's answerSchema — ${describeFindings(fs)}. ` +
              'FD-R4: a person`s answer to an ask is held to the schema the ask declares; nothing was appended and the ask is still ' +
              'parked, so answer it again with a conforming value. `validateBoundaries: false` turns the check off.');
        }
      }
      const type = n?.kind === 'task' ? this.nodeTypes.get(n.type) : undefined;
      const schema = type?.worker === undefined ? undefined : this.workers.get(type.worker)?.outputSchema;
      if (schema !== undefined) {
        const fs = findings(schema, value.result ?? null);
        if (fs.length) {
          throw new BoundaryRefused('resolve', nodeId, taskId, fs,
            `the resolution of "${taskId}" (node "${nodeId}", type "${(n as { type: string }).type}") does not satisfy its worker ` +
              `"${type!.worker}"'s outputSchema — ${describeFindings(fs)}. FD-R4: a person's value stands in for what the worker ` +
              'would have returned, and it is held to that schema once; nothing was appended and the task is still suspended, so resolve ' +
              'it again with a conforming value (the worker`s declared example is one). `validateBoundaries: false` turns the check off.');
        }
      }
    }
    const record: ResolutionRecord = {
      kind: 'resolution',
      taskId,
      resolvedAs,
      result: resolvedAs === 'done' ? structuredClone(value.result ?? null) : null,
      error: resolvedAs === 'failed' ? (value.error ?? 'resolved as failed') : null,
      actor: value.actor,
      observedAt: this.now(),
    };
    // **A resolution given MID-STEP is accepted now and TAKEN AT REST** (`RN-R37`, `RS-R1` v0.18, W180 — the conformity
    // reader's R4 for an ask's answer, and the maintainer's answer to W180's S-4 for EVERY resolution, a parked task's
    // too): every refusal above has been asked — not parked, halted, stopped, `FD-R4`, an uncloneable value (`OR-R12`) —
    // so the call returns `true`, *accepted*; the resolution is appended when the driver's step ends (`takeAnswer`),
    // BETWEEN two steps, where a resume's replay feeds it (`RN-R19`). Appended in the call instead, a parked task resolved
    // on its own `user_action` element in a region was announced `branch.suspended` AFTER its branch arrived, and its
    // checkpoint was refused `diverged` (W180's S-4, measured).
    if (midStep) {
      this.pausePending.push({ kind: 'answer', record, runId, nodeId, branchPath });
      return true;
    }
    // **The call is ACCEPTED from here: a throw is the run's** (`OR-R10` v0.19, P35 (k), W184). A consumer's callback
    // THROWING on the resolution's own element — or on its `branch.resumed` — is reported once and HALTS the run, and
    // reaches the caller. *Until W184 it reached the caller with nothing else done: the answered node routed nowhere and
    // the run folded `completed`, a run that never reached its end* (P36 fact 11 R2, R4).
    try {
      this.appendResolution(record, nodeId, branchPath);
    } catch (e) {
      this.haltOnce(e);
      throw e;
    }
    // **`RN-R29` — door (b)'s SECOND check** (ADR 0103, Q605): the resolution and its `branch.resumed` are appended,
    // and a consumer's callback on either can have halted the run on this stack. Accepted — its element is in the
    // log, so `true` — and routed nowhere.
    if (this.shut()) return true;
    // RS-R2: a resolution supplies an outcome for the dispatch that already
    // happened. It never re-dispatches — that is flow-level retry, Q16/Q28.
    //
    // **`enter` is reached from THREE entry points, not two, and this one reported
    // nothing** — W33's conformity reader. `onEvent` catches and reports (`OR-R10`);
    // `start` catches, reports and rethrows because the caller is on the stack. This
    // call sat outside any guard, so a refusal raised while routing a RESOLUTION was
    // thrown at the caller and **nothing else happened**: no `halted` input,
    // `hasFailed()` still false so later settlements kept routing, and
    // `fold(foldInputs())` reporting **`completed`** for a run that did none of its
    // work.
    //
    // **Measured, against the listener as a control** — the same map whose `over`
    // does not name an array, reached two ways:
    //
    //     through the listener:  reported [UnresolvedMapArity]  hasFailed true   halted
    //     through resolve():     threw, reported []             hasFailed false  COMPLETED
    //
    // The unguarded call predates this item — a throwing user predicate could always
    // reach it — but W33 put a LIBRARY-raised refusal on the road, and ADR 0004's
    // resolution road is exactly how a `user_action` node advances into a map.
    //
    // **It reports AND rethrows, like `start`**, because `resolve` is caller-initiated
    // and the caller is on the stack — `spec/outcome-record.md` section 6's own form. Reported ONCE (`haltOnce`, W184).
    try {
      this.advance(runId, nodeId, branchPath);
    } catch (e) {
      this.haltOnce(e);
      throw e;
    }
    return true;
  }

  /**
   * **A resolution appended, and the region told** — the half of `resolve()` the REPLAY shares
   * (`RN-R19`): a stored resolution is appended as it was stored and routes exactly as the live one
   * did, so a resumed run's `branch.resumed` and everything after it are regenerated rather than
   * written by a second road.
   */
  private appendResolution(record: ResolutionRecord, nodeId: string, branchPath: string): void {
    this.append({ kind: 'resolution', record });
    // **`RN-R29` — door (b)'s FIRST check** (ADR 0103, Q605): a halt raised on the resolution's own element — a
    // consumer's `onFoldInput` that cancels a waiting task, or reaches a refusal — emits no `branch.resumed`.
    if (this.shut()) return;
    const region = this.regionOf(nodeId);
    if (region) {
      this.emit({ type: 'branch.resumed', regionId: region.fanoutId,
        regionPath: this.rpathOf(region, this.indicesFrom(nodeId, branchPath)),
        branchPath, at: nodeId, resolvedAs: record.resolvedAs });
    }
  }

  /**
   * **Cancel the run: hold it, record the request, and ask the scheduler to cancel each task in flight** — `RN-R31`,
   * `spec/run-state.md` section 13, [ADR 0104](../../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md),
   * P34 decision 4 and stop-and-asks (b), (c), (i), (j). **Resolves once every task it cancelled has stopped**; the fold
   * reads the run `cancelling` until then and `cancelled` after (`RN-R30`), so a runtime's `done` settles after the last
   * `task.cancelled` from the fold alone.
   *
   * **In order, and each step is a rule:**
   *   1. **Refuse** — {@link RunControlRefused}, before anything is recorded or sent; and a `graceMs` the scheduler
   *      would throw on is thrown here, as it would be (`TypeError`, `RangeError`).
   *   2. **Hold** (`RN-R29`): `cancelRequest` is set, so `shut()` is true for every door; every region's collection is
   *      released, `failRun`'s run-level moment (ADR 0046 rule 3, `JP-R12`) — no join of this run settles again.
   *   3. **Record** ONE `cancelRequested` element, BEFORE the scheduler is asked for anything.
   *   4. **Cancel** each task in flight the scheduler holds — `RN-R21`'s set, so a PARKED task, settled already, is sent
   *      nothing (P34 (i); the scheduler cannot end it, fact 8). A task not yet handed on is cancelled by `handOn` after
   *      its hand-off (`RN-R29` (i)), and so is each task a PAUSE held (`RN-R35`, P34 (c)). Tasks a worker SPAWNED are
   *      not this run's (P34 (j)). **In a `finally` around step 3** (`RN-R31` v0.21, P35 decision 4): a consumer's
   *      `onFoldInput` that throws on the element still has every cancel sent and every held task handed on and
   *      cancelled — and THEN the run is HALTED and reported once, and the throw reaches the caller (`RN-R31` v0.24,
   *      `OR-R10` v0.19, P36 (b), W184).
   *
   * **A SECOND call** appends nothing and forwards its `graceMs` to each task still stopping — the scheduler's own
   * escalation — and resolves once those have stopped. It is never refused for the halt its own first call made.
   *
   * @throws RunControlRefused — `unsupported`, `not-started`, `halted`, `cancelled` or `ended`; nothing recorded or sent.
   * @throws TypeError / RangeError — `graceMs` not a number, or negative or `NaN`; nothing recorded or sent.
   */
  cancel(options: RunCancelOptions): Promise<void> {
    const cancelOf = this.opts.scheduler.cancel;
    if (typeof cancelOf !== 'function') {
      throw new RunControlRefused('cancel', 'unsupported',
        `RunControlRefused (unsupported): run "${this.runId}"'s scheduler has no cancel(taskId, options) — SchedulerLike's optional ` +
          'third member (P34 (b), ADR 0104). A FyflowScheduler has one, and a runtime`s per-run view forwards it; a scheduler double ' +
          'must declare it to cancel a run. Nothing was recorded and nothing was sent.');
    }
    const graceMs = options?.graceMs;
    if (graceMs !== undefined) {
      // The scheduler's own refusals (its AGENTS.md section 5), raised HERE so they cannot be raised half-way through
      // step 4, with the element already in the log and some tasks cancelled and others not.
      if (typeof graceMs !== 'number') throw new TypeError(`cancel: graceMs must be a number of ms, got ${typeof graceMs} — nothing was recorded`);
      if (Number.isNaN(graceMs) || graceMs < 0) throw new RangeError(`cancel: graceMs must be 0 or more, got ${graceMs} — nothing was recorded`);
    }
    if (this.header === null) {
      throw new RunControlRefused('cancel', 'not-started',
        `RunControlRefused (not-started): driver for run "${this.runId}" holds no run to cancel — it has not started, or its resume ` +
          'was refused and it is spent (RN-R23). Nothing was recorded and nothing was sent.');
    }
    const req = this.cancelRequest;
    if (req !== null) {
      // **The SECOND call** (P34 (c)): nothing appended; its `graceMs` forwarded to each task still stopping.
      if (graceMs !== undefined) req.graceMs = graceMs;
      for (const id of this.inFlight()) if (this.handedOn(id)) this.cancelTask(id);
      // **And it resolves as the first does** (W173's adequacy reader, D-2): a microtask on, on every task STILL
      // stopping — a task not yet handed on when this call was made (its own `dispatched` element's stack, a resume's)
      // is cancelled by `handOn` within that microtask, and waited on here; `still` alone missed it and resolved at once.
      const stopping = req.stopping;
      return Promise.resolve().then(() => Promise.all([...stopping.values()])).then(() => undefined);
    }
    if (this.failed) {
      throw new RunControlRefused('cancel', 'halted',
        `RunControlRefused (halted): run "${this.runId}" was HALTED by a refusal (OR-R10) — it routes nothing again, and its ` +
          'outcome is halted. Nothing was recorded and nothing was sent.');
    }
    if (this.cancelled) {
      throw new RunControlRefused('cancel', 'cancelled',
        `RunControlRefused (cancelled): run "${this.runId}" was already ended CANCELLED by a task the scheduler cancelled on its ` +
          'own (RN-R28). Cancel a task it still runs by its id. Nothing was recorded and nothing was sent.');
    }
    if (this.stopRequest !== null) {
      // **A cancel after a STOP** (`RN-R33`, P34 (c), W174): the run was stopped to be resumed elsewhere, and its driver is
      // deaf — a cancel here could record a request whose settlements nothing would ever append. Cancel it where it resumes.
      throw new RunControlRefused('cancel', 'interrupted',
        `RunControlRefused (interrupted): run "${this.runId}" was STOPPED by its owner (RN-R33) — this driver is deaf to it, ` +
          'and its in-flight tasks are a resume`s to run again. Resume its checkpoint on another runtime and cancel it there. ' +
          'Nothing was recorded and nothing was sent.');
    }
    const inFlight = this.inFlight();
    // **`ended` only AT REST** (D-1): mid-step a prefix with nothing in flight is the moment between a settlement and the
    // dispatch it causes — accepted there, the hold stops that dispatch and the run reads `cancelled`.
    if (this.stepping === 0 && inFlight.length === 0 && !this.hasParked()) {
      throw new RunControlRefused('cancel', 'ended',
        `RunControlRefused (ended): run "${this.runId}" has nothing in flight and nothing parked on a person — it has finished, ` +
          'and a cancel would rewrite its outcome. Nothing was recorded and nothing was sent.');
    }
    // 2. HOLD — before the element, so a consumer's callback on it already sees the run held.
    const reason = options.reason;
    const stopping = new Map<string, Promise<boolean>>();
    this.cancelRequest = {
      ...(reason !== undefined ? { reason } : {}),
      ...(graceMs !== undefined ? { graceMs } : {}),
      stopping,
    };
    this.arrivals.clear();
    // **A PAUSED run's held tasks are handed on and THEN cancelled** (P34 (c), `RN-R35`, W175): each is `dispatched`
    // and unsettled, so the run reads `cancelling` until the scheduler settles it — and only the scheduler writes a
    // settlement (ADR 0007). Taken out of the hold and marked `unhanded` BEFORE the element (P35 decision 4, `takeStop`'s
    // shape): held, the run dispatches nothing a callback on it could add to the hold, so the set is the same after it —
    // and a second cancel raised inside one hand-off, or on the element, sends nothing for those not yet handed; `handOn`
    // cancels each after its `addTask` (the request is set).
    const released = new Map(this.pauseHeld);
    this.pauseHeld.clear();
    for (const id of released.keys()) this.unhanded.add(id);
    // **The boundary** (`OR-R10` v0.19, `RN-R31` v0.24, P36 (b), W184): a throw on the element — at rest, or from a callback
    // mid-step — is reported ONCE and HALTS the run, AFTER step 4's `finally` has sent every cancel and handed on every held
    // task, and then reaches the caller. `halted` outranks `cancelling` (`RN-R8`), so a runtime's `done` settles `halted`
    // at once (`RN-R33`'s clause); the tasks still stop, their settlements appended and routed nowhere.
    try {
      try {
        // 3. RECORD.
        this.append({ kind: 'cancelRequested', actor: options.actor, reason: reason ?? null });
      } finally {
        // 4. CANCEL — in a `finally` (`RN-R31` v0.21, P35 decision 4, fact 9): a consumer's `onFoldInput` that THROWS on
        // the element still has the element in the log, so every task in flight it says is being cancelled IS sent its
        // cancel and every held task is handed on and cancelled — else the run reads `cancelling` for ever — and the throw
        // then reaches the boundary above. **The in-flight set is read HERE, after the element** (W178's R1): unlike a
        // stop's, a cancel's driver still HEARS, so a callback on the element may have had a task settle, and a task no
        // longer in flight is sent nothing.
        try {
          for (const id of this.inFlight()) {
            const config = released.get(id);
            if (config !== undefined) this.handOn(id, config);
            else if (this.handedOn(id)) this.cancelTask(id);
          }
        } finally {
          for (const id of released.keys()) this.unhanded.delete(id);
        }
      }
    } catch (e) {
      this.haltOnce(e);
      throw e;
    }
    // A microtask on, the synchronous stack this call was made from has finished — a `dispatch` or a `resume()` that
    // was handing a task on when the call arrived has handed it and cancelled it (`handOn`) — so every promise is in.
    return Promise.resolve().then(() => Promise.all([...stopping.values()])).then(() => undefined);
  }

  /**
   * **Stop the run so that a resume ELSEWHERE can continue it: hold it, record the stop, go DEAF, and only then ask the
   * scheduler to cancel each task in flight** — `RN-R33`, `spec/run-state.md` section 14,
   * [ADR 0105](../../doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md), P34
   * decisions 3 and 9 and stop-and-ask (d). **Resolves once every task it cancelled has stopped**; the fold reads the run
   * `interrupted` from the element on (`RN-R32`), and the log ends with the cancelled tasks dispatched and UNSETTLED —
   * the in-flight set a resume on another runtime re-dispatches at the same ids (`RN-R21`).
   *
   * **In order, and the ORDER is the rule** (P34 decision 3):
   *   1. **Refuse** — {@link RunControlRefused} with `control: 'stop'`, before anything is recorded or sent: `unsupported`,
   *      `not-started`, `halted`, `cancelled` (`RN-R28`'s, or a cancel its owner requested — P34 (c)) and `ended` (at
   *      rest only, as for a cancel); and a `graceMs` the scheduler would throw on is thrown here. From the accepted call
   *      on, `resolve()` and `cancel()` are refused (P34 decision 9, (c)).
   *   2. **Hold** (`RN-R29`): the stop is TAKEN, so `shut()` is true for every door, and every region's collection is
   *      released.
   *   3. **Go DEAF**: nothing the scheduler fires for this run is heard again — from BEFORE the element, so not even a
   *      settlement a callback on it provokes — and no `task.cancelled` of the stop is appended.
   *   4. **Record** ONE `interrupted` element.
   *   5. **Cancel** each task in flight the scheduler holds — none for a parked task (P34 fact 4), and none for a task a
   *      PAUSE held, which the scheduler was never handed and which stays in flight for the resume (`RN-R35`).
   *
   * **Steps 2-5 are taken at REST** — at once when the call is made at rest, and when the driver's own step ends when it
   * is made from a callback on that step (`stepping`). A hold taken mid-step would drop the rest of the step's routing
   * — a fan-out's later branches, a settlement's successor — and a resume re-dispatches only what is IN FLIGHT, so that
   * work would be lost to the resumed run for good. Taken at rest, the step is whole in the log; the task whose own
   * `dispatched` element carried the call is handed on in the step and cancelled here (`RN-R29` (i)), and so is a resumed
   * run's in-flight set, handed back before `resume()` returns.
   *
   * **A SECOND call** appends nothing, forwards its `graceMs` to each task still stopping, and resolves as the first does.
   *
   * @throws RunControlRefused — `unsupported`, `not-started`, `halted`, `cancelled` or `ended`; nothing recorded or sent.
   * @throws TypeError / RangeError — `graceMs` not a number, or negative or `NaN`; nothing recorded or sent.
   */
  stop(options: RunStopOptions): Promise<void> {
    if (typeof this.opts.scheduler.cancel !== 'function') {
      throw new RunControlRefused('stop', 'unsupported',
        `RunControlRefused (unsupported): run "${this.runId}"'s scheduler has no cancel(taskId, options) — SchedulerLike's optional ` +
          'third member (P34 (b), ADR 0105). A stop cancels each task in flight, so a scheduler double must declare it to stop a ' +
          'run. Nothing was recorded and nothing was sent.');
    }
    const graceMs = options?.graceMs;
    if (graceMs !== undefined) {
      if (typeof graceMs !== 'number') throw new TypeError(`stop: graceMs must be a number of ms, got ${typeof graceMs} — nothing was recorded`);
      if (Number.isNaN(graceMs) || graceMs < 0) throw new RangeError(`stop: graceMs must be 0 or more, got ${graceMs} — nothing was recorded`);
    }
    if (this.header === null) {
      throw new RunControlRefused('stop', 'not-started',
        `RunControlRefused (not-started): driver for run "${this.runId}" holds no run to stop — it has not started, or its resume ` +
          'was refused and it is spent (RN-R23). Nothing was recorded and nothing was sent.');
    }
    const req = this.stopRequest;
    if (req !== null) {
      // **The SECOND call** (`RN-R33`, the cancel's road): nothing appended; its `graceMs` forwarded to each task still
      // stopping — or, while the first is still PENDING, kept for the cancels it will send — and resolved as the first is.
      if (graceMs !== undefined) req.graceMs = graceMs;
      if (req.pending === null) {
        for (const id of this.inFlight()) if (this.handedOn(id) && req.stopping.has(id)) this.cancelTask(id);
        return this.stopSettled(req);
      }
      return req.took!.then(() => this.stopSettled(req));
    }
    if (this.failed) {
      throw new RunControlRefused('stop', 'halted',
        `RunControlRefused (halted): run "${this.runId}" was HALTED by a refusal (OR-R10) — a halted run is not resumable (RN-R23), ` +
          'so there is nothing to stop for a resume elsewhere. Nothing was recorded and nothing was sent.');
    }
    if (this.cancelled || this.cancelRequest !== null) {
      throw new RunControlRefused('stop', 'cancelled',
        `RunControlRefused (cancelled): run "${this.runId}" was CANCELLED${this.cancelRequest !== null ? ' by its owner (RN-R31)' : ' by a task the scheduler cancelled on its own (RN-R28)'} ` +
          '— a cancelled run is not resumable, so it cannot be stopped to resume it elsewhere (P34 (c)). Nothing was recorded and nothing was sent.');
    }
    // **`ended` only AT REST**, as for a cancel (`RN-R31` D-1): mid-step a prefix with nothing in flight is the instant
    // before the step dispatches more — and the stop is taken once it has.
    if (this.stepping === 0 && this.inFlight().length === 0 && !this.hasParked()) {
      throw new RunControlRefused('stop', 'ended',
        `RunControlRefused (ended): run "${this.runId}" has nothing in flight and nothing parked on a person — it has finished, ` +
          'and there is nothing to resume elsewhere. Nothing was recorded and nothing was sent.');
    }
    const reason = options.reason;
    let taken!: () => void;
    const took = new Promise<void>((r) => { taken = r; });
    const accepted: NonNullable<Driver['stopRequest']> = {
      actor: options.actor,
      ...(reason !== undefined ? { reason } : {}),
      ...(graceMs !== undefined ? { graceMs } : {}),
      stopping: new Map(),
      pending: taken,
      took,
    };
    this.stopRequest = accepted;
    // **Taken at rest** — and a consumer's throw on the `interrupted` element HALTS the run at the take, after its `finally`
    // has sent every cancel (`takeStop`, `OR-R10` v0.19, `RN-R33` v0.24, P36 (b), W184), and reaches the caller: `halted`
    // outranks `interrupted` (`RN-R8`), so the run is NOT resumable. A stop called MID-STEP is taken when the step ends.
    if (this.stepping === 0) this.takeStop();
    return took.then(() => this.stopSettled(accepted));
  }

  /**
   * **The stop, TAKEN** — `RN-R33` steps 2-5, at rest: from `stop()` itself, or from the end of the driver's own step
   * when `stop()` was called on it (each step's wrapper calls this when `stepping` returns to `0`).
   */
  private takeStop(): void {
    const req = this.stopRequest!;
    const taken = req.pending!;
    // 2. HOLD — before the element, so a consumer's callback on it already sees the run held.
    req.pending = null;
    req.took = null;
    this.arrivals.clear();
    // 3. DEAF — BEFORE the first cancel (P34 decision 3): a waiting task's `task.cancelled` fires INSIDE its `cancel()`
    // call (P34 fact 8), and it must reach a driver that no longer hears. **And before the element, with the hold**
    // (W174's reading of decision 3's order): a settlement a consumer's callback on the element provokes would otherwise
    // be appended AFTER the stop and routed nowhere — held — and the resume, which re-runs only what is in flight, would
    // never route it either: that task's work lost. Deaf here, it stays in flight and runs again on the resume.
    this.deaf = true;
    // 5's set, read BEFORE the element: deaf and held, nothing a callback on it does can settle or dispatch a task, so the
    // set is the same after it — and read here it survives a callback that THROWS (W174's conformity reader, finding 5).
    const inFlight = this.inFlight().filter((id) => this.handedOn(id));
    // A stop taken on a run its step ALREADY halted (`RN-R33`: taken even so) is taken SILENTLY — P36's brief point 5,
    // W184 (the readers' C1/C2): the run's failure was reported where it was raised and that error is the one on its way to
    // the caller, so a second throw here — on `interrupted`, or from a scheduler's `cancel` — is discarded.
    const silent = this.failed;
    try {
      try {
        // 4. RECORD.
        this.append({ kind: 'interrupted', actor: req.actor, reason: req.reason ?? null });
      } finally {
        // 5. CANCEL — in a `finally` (`RN-R33`): a consumer's `onFoldInput` that throws on the element still has the
        // element in the log, so the tasks it says were stopped ARE cancelled and every stop() promise still settles.
        try {
          for (const id of inFlight) this.cancelTask(id);
        } finally {
          taken();
        }
      }
    } catch (e) {
      // **HALTED HERE, at the take** (`OR-R10` v0.19, `RN-R33` v0.24, W184, the readers' C1): reported once, `halted`
      // right after the element — the cancels already sent — so a call still pending on this step's end is DROPPED by
      // its own halted guard rather than taken before the halt; then the throw reaches whoever is on the stack: `stop()`'s
      // caller at rest, a driver call's caller at its step's end, nobody on a SCHEDULER EVENT's step (`onEvent`).
      if (silent) return;
      this.haltOnce(e);
      throw e;
    }
  }

  /** What a stop's promise resolves on once it is taken: a microtask on, every task it sent a cancel to has stopped. */
  private stopSettled(req: NonNullable<Driver['stopRequest']>): Promise<void> {
    return Promise.resolve().then(() => Promise.all([...req.stopping.values()])).then(() => undefined);
  }

  /**
   * **Pause the run: it routes on, and every dispatch it makes from here is appended and HELD until `unpause()`** —
   * `RN-R35`, `spec/run-state.md` section 15,
   * [ADR 0106](../../doc/decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md),
   * P34 stop-and-ask (e). Tasks already handed to the scheduler run on and settle, and their settlements route as ever; a
   * person's `resolve()` is accepted. **Not a halt** (`shut()` is untouched): only the scheduler's `addTask` waits. The
   * fold reads `RunState.paused` and no new outcome — a held task is `dispatched`, so it reads `running` (P34 fact 3).
   *
   * **In order**: (1) **refused by name** before anything is recorded — {@link RunControlRefused} with `control: 'pause'`:
   * `not-started`, `halted`, `cancelled` (`RN-R28`'s or a requested cancel), `interrupted` (a stop, taken or pending),
   * `paused` (already paused, or a pause called earlier in this step still to be taken — P34 (e): *a second pause is
   * refused by name*) and `ended` (nothing in flight and nothing parked, at rest only); (2) **TAKEN AT REST** — at once
   * when called at rest, and when the driver's own step ends when called from a callback on it: the run is paused and ONE
   * `paused` element is appended, BETWEEN two steps, where a resume's replay can feed it (`RN-R19`). A pause taken
   * mid-step would land between two elements of one step, and the replay — which regenerates a step whole — would refuse
   * its checkpoint `diverged` there; so the step a pause is called on finishes unpaused, its dispatches handed on.
   */
  pause(options: RunPauseOptions): void {
    this.refuseRunHeld('pause');
    if (this.pauseWanted()) {
      throw new RunControlRefused('pause', 'paused',
        `RunControlRefused (paused): run "${this.runId}" is already paused${this.pausePending.some((c) => c.kind !== 'answer') ? ' — by a call earlier in this step, taken when it ends' : ''} ` +
          '(RN-R35, P34 (e)). Unpause it first. Nothing was recorded.');
    }
    if (this.stepping === 0 && this.inFlight().length === 0 && !this.hasParked()) {
      throw new RunControlRefused('pause', 'ended',
        `RunControlRefused (ended): run "${this.runId}" has nothing in flight and nothing parked on a person — it has finished, ` +
          'and there is nothing left to hold. Nothing was recorded.');
    }
    this.pausePending.push({ kind: 'paused', actor: options.actor });
    while (this.stepping === 0 && this.pausePending.length > 0) this.takePending(this.pausePending.shift()!);
  }

  /**
   * **Unpause the run: record it, then hand every held task to the scheduler in DISPATCH ORDER** — `RN-R35`, ADR 0106,
   * P34 (e). Refused by name — `control: 'unpause'`: `not-started`, `halted`, `cancelled`, `interrupted` (a stopped
   * run's held tasks are a resume's: unpause it where it resumes) and `not-paused`. **Never `ended`**: an unpause rewrites
   * no outcome, so a paused run that finished may still be unpaused. Taken at rest, as a pause is: ONE `unpaused` element,
   * then the hand-off — each held task's `createTask` and `addTask`, first held first.
   */
  unpause(options: RunPauseOptions): void {
    this.refuseRunHeld('unpause');
    if (!this.pauseWanted()) {
      throw new RunControlRefused('unpause', 'not-paused',
        `RunControlRefused (not-paused): run "${this.runId}" is not paused${this.pausePending.some((c) => c.kind !== 'answer') ? ' — an unpause earlier in this step already lifts it' : ''} ` +
          '(RN-R35, P34 (e)). Nothing was recorded and nothing was handed on.');
    }
    this.pausePending.push({ kind: 'unpaused', actor: options.actor });
    while (this.stepping === 0 && this.pausePending.length > 0) this.takePending(this.pausePending.shift()!);
  }

  /** The pause the owner has ASKED for: the last call still to be taken, else the pause taken (`RN-R35`). */
  private pauseWanted(): boolean {
    const last = this.pausePending.filter((c) => c.kind !== 'answer').at(-1);
    return last !== undefined ? last.kind === 'paused' : this.paused;
  }

  /**
   * The refusals a pause and an unpause share, in `RN-R35`'s order — each a run that is not this driver's to hold or
   * release: none started, or the run halted, cancelled or stopped. Thrown before anything is recorded.
   */
  private refuseRunHeld(control: 'pause' | 'unpause'): void {
    if (this.header === null) {
      throw new RunControlRefused(control, 'not-started',
        `RunControlRefused (not-started): driver for run "${this.runId}" holds no run to ${control} — it has not started, or its ` +
          'resume was refused and it is spent (RN-R23). Nothing was recorded.');
    }
    if (this.failed) {
      throw new RunControlRefused(control, 'halted',
        `RunControlRefused (halted): run "${this.runId}" was HALTED by a refusal (OR-R10) — it dispatches nothing again, so there ` +
          `is nothing to ${control === 'pause' ? 'hold' : 'hand on'}. Nothing was recorded.`);
    }
    if (this.cancelled || this.cancelRequest !== null) {
      throw new RunControlRefused(control, 'cancelled',
        `RunControlRefused (cancelled): run "${this.runId}" was CANCELLED${this.cancelRequest !== null ? ' by its owner (RN-R31)' : ' by a task the scheduler cancelled on its own (RN-R28)'} ` +
          `— it dispatches nothing again, so there is nothing to ${control === 'pause' ? 'hold' : 'hand on'}. Nothing was recorded.`);
    }
    if (this.stopRequest !== null) {
      throw new RunControlRefused(control, 'interrupted',
        `RunControlRefused (interrupted): run "${this.runId}" was STOPPED by its owner (RN-R33) — its in-flight tasks, held ` +
          `ones included, are a resume\`s to run. Resume its checkpoint on another runtime and ${control} it there. Nothing was recorded.`);
    }
  }

  /**
   * **A pause or an unpause, TAKEN** — `RN-R35`, at rest: from the call itself, or from the end of the driver's own step
   * (`leaveStep()`). **A step of its own** (`stepping`), so a call a consumer makes from a callback on the element — a
   * second pause, a stop, a `resolve()` that dispatches — is taken, or routes, as on any step. **A pause** sets the flag
   * BEFORE its element, so a dispatch a callback on the element causes is held. **An unpause** clears it before its
   * element and hands the held tasks on AFTER it, in a `finally`: a consumer's `onFoldInput` that throws on the element
   * still has the element in the log, and the run it says is unpaused is (W174's conformity reader's finding 5, the stop's
   * lesson) — and then the take HALTS the run itself, reported once (`takePause`, `RN-R35` v0.24, W184), so a call pending
   * behind it is dropped, and the throw reaches whoever is on the stack: the caller of the call at rest or of the driver
   * call mid-step, or, on a SCHEDULER EVENT's step, the listener boundary (`onEvent`, P35 (j)). A dispatch a callback on the element causes joins the end
   * of the held queue (`dispatch`), so the order is the dispatch order still.
   */
  private takePending(c: PendingCall): void {
    if (c.kind === 'answer') this.takeAnswer(c);
    else this.takePause(c);
  }

  /**
   * **A resolution given mid-step, TAKEN at rest** — `RN-R37`, W180 (the conformity reader's R4; S-4 for every
   * resolution): a step of its own, so the resolution lands BETWEEN two steps — where a resume's replay FEEDS it
   * (`RN-R19`) — after the step that parked its node has completed (an ask's `asked` or a task's `user_action`
   * settlement, and in a region `branch.suspended`). Answered on its own `asked` element and appended
   * there instead, it sat between two elements of one step, and the replay — which regenerates a step whole — refused the
   * run's checkpoint `diverged` at it. **Dropped, recording nothing, when the step it was given on HALTED or CANCELLED the
   * run** (or the node is no longer parked) — `takePause`'s rule: it would be refused were it given now. It routes as
   * `resolve()` at rest routes: a throw — from routing, or a consumer's on the resolution's own element — HALTS the run
   * here, reported once, so a call pending behind it is dropped; it then reaches whoever is on the stack: a driver call's
   * caller, or the listener boundary of a scheduler event's step (`onEvent`, `OR-R10` v0.19, W184).
   */
  private takeAnswer(c: Extract<PendingCall, { kind: 'answer' }>): void {
    if (this.failed || this.cancelled || this.cancelRequest !== null || !this.parked(c.record.taskId)) return;
    this.stepping += 1;
    try {
      // **HALTED HERE, at the take** (W184, the readers' C1): a throw on the resolution's own element — or from its
      // routing — halts the run before this take's step ends, so a call still pending behind it is DROPPED, not taken.
      try {
        this.appendResolution(c.record, c.nodeId, c.branchPath);
        if (this.shut()) return;
        this.advance(c.runId, c.nodeId, c.branchPath);
      } catch (e) {
        this.haltOnce(e);
        throw e;
      }
    } finally {
      this.leaveStep();
    }
  }

  private takePause(p: { readonly kind: 'paused' | 'unpaused'; readonly actor: string }): void {
    // **A call accepted mid-step whose step then HALTED or CANCELLED the run is DROPPED, recording nothing** (W175's
    // conformity reader, G1): it would be refused `halted` or `cancelled` were it made now, and a pause recorded after a
    // cancel would read `paused` on a run that can never be unpaused. Not a stop: a pause or an unpause pending beside a
    // stop was called before it (`refuseRunHeld`), and is taken before it (`leaveStep()`).
    if (this.failed || this.cancelled || this.cancelRequest !== null) return;
    this.stepping += 1;
    try {
      // **HALTED HERE, at the take** (`RN-R35` v0.24, W184, the readers' C1): a throw on the element — after an unpause's
      // hand-off, which runs in its `finally` — halts the run before this take's step ends, so `halted` follows the
      // element and a call still pending behind it is DROPPED (its own halted guard) rather than taken before the halt.
      try {
        if (p.kind === 'paused') {
          this.paused = true;
          this.append({ kind: 'paused', actor: p.actor });
        } else {
          this.paused = false;
          try {
            this.append({ kind: 'unpaused', actor: p.actor });
          } finally {
            this.drainHeld();
          }
        }
      } catch (e) {
        this.haltOnce(e);
        throw e;
      }
    } finally {
      this.leaveStep();
    }
  }

  /**
   * **The unpause's hand-off**: each held task to the scheduler, first held first (`RN-R35`). Taken out of the hold and
   * marked `unhanded` before its `addTask`, as a resume's re-dispatch is (`RN-R31`), so a cancel raised inside one
   * hand-off sends nothing for a task not yet handed — and `handOn` then cancels it. **Held for a HALT** — checked before
   * each, as a resume's re-dispatch is (`RN-R29` (4), `holdsResume()`): a halt raised inside one hand-off hands nothing
   * further on, and what is left is never handed. A dispatch made on this stack joins the end of the queue and is handed
   * on in its turn (the `Map` visits what is added while it is walked). Caller-initiated, so a throw from the scheduler
   * is reported AND rethrown, `start()`'s and `resume()`'s treatment.
   */
  private drainHeld(): void {
    try {
      for (const [id, config] of this.pauseHeld) {
        if (this.holdsResume()) break;
        this.pauseHeld.delete(id);
        this.unhanded.add(id);
        this.handOn(id, config);
      }
    } catch (e) {
      this.failRun(e);
      throw e;
    }
  }

  /**
   * Whether the scheduler holds this task — dispatched, not held by a replay, past its `addTask` (`RN-R31`), and not held
   * by a pause (`RN-R35`, W175): a stop of a paused run cancels only what this says the scheduler holds (ADR 0105's last
   * consequence), and a cancel hands each held task on before it cancels it.
   */
  private handedOn(taskId: string): boolean {
    return this.replay === null && !this.unhanded.has(taskId) && !this.pauseHeld.has(taskId);
  }

  // --- the scheduler's side ----------------------------------------------------

  private onEvent(name: string, detail: TaskDetailLike): void {
    this.stepping += 1;
    try {
      this.onEventStep(name, detail);
    } finally {
      // **The step's END is inside the listener boundary too** (`OR-R10` v0.17, P35 (j), W178): a pause, an unpause or a
      // stop called on this step is TAKEN here (`RN-R33`, `RN-R35`), and a consumer's `onFoldInput` that throws on its
      // element would otherwise leave this listener into the scheduler's `dispatchEvent` — which node 24 and deno each
      // rethrow as an UNCAUGHT exception that ends the process (P35 fact 10). A step the scheduler started has nobody
      // else to throw to, so the throw is caught, reported and the run HALTED — `onEventStep`'s treatment of a throw on
      // any other element of the step. The element is in the log first, and the take's own `finally` has run.
      // **ONCE** (W178's R2): a throw the driver already REPORTED — a scheduler's throw inside an unpause's hand-off,
      // which `drainHeld` reports and rethrows for a caller at rest — finds the run halted, and is not reported twice;
      // nor is any throw at the end of a step whose run is already halted, whose halt was reported when it was raised.
      try {
        this.leaveStep();
      } catch (e) {
        // A throw OUT OF `failRun` — on `halted`, or from `onRunFailure` — is DISCARDED, as at `onEventStep` (W178's S-1).
        try {
          if (!this.failed) this.failRun(e);
        } catch {
          // discarded — the run is halted, its element in the log, and its failure reported
        }
      }
    }
  }

  /** `onEvent`'s body — wrapped so the driver knows it is on the stack of its own step (`stepping`, `RN-R31`, W173 D-1). */
  private onEventStep(name: string, detail: TaskDetailLike): void {
    // **A SPENT driver hears nothing** — `RN-R23`, and both of W89's readers from opposite ends: a driver whose resume was
    // refused holds no run (`header` reset, `started` set) and yet stayed subscribed, so a settlement under its run id was
    // appended to its partial replay and delivered to its `onFoldInput`, another reached `onRunFailure` as `UndispatchedTask`,
    // and with `failed` unset it would even have ROUTED (the adequacy reader's a22). It has no run to refuse anything for.
    // **And a STOPPED driver hears nothing** (`deaf` since W174, `RN-R33`): the stop's own `task.cancelled`s and every
    // later settlement stay out of the log, which ends with the in-flight set unsettled for a resume elsewhere.
    if (this.deaf || (this.started && this.header === null)) return;
    // The listener boundary is also the FAILURE boundary: a throw from here would
    // reach nobody who can act on it — `dispatchEvent` rethrows it out of band, an
    // uncaught exception in node 24 and deno (P35 fact 10) — so it is caught,
    // reported, and the run stops. The step's end is caught in `onEvent` (W178).
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
      // **A throw OUT OF `failRun` is DISCARDED here** (`OR-R10` v0.17, W178's S-1): it is the consumer's own
      // `onFoldInput` throwing on the `halted` element, or its `onRunFailure` throwing — after the run was halted and
      // reported (`failRun` reports in a `finally`). Nobody who can act on it is on the stack, and `dispatchEvent` would
      // rethrow it as an uncaught exception (P35 fact 10). **ONCE** (`haltOnce`, W184): a throw that finds the run already
      // halted — a `cancel()` a callback on this step made, whose own element threw and which halted the run and reported
      // it at its own boundary before the throw left the callback — is not reported a second time (W178's Notes).
      try {
        this.haltOnce(e);
      } catch {
        // discarded — the run is halted, its element in the log, and its failure reported
      }
    }
  }

  /**
   * **A `task.running`: an attempt started** — `RN-R40`, W186, P36 (f). Its id and number are COPIED here, while the
   * listener runs (`OR-R1`). Recorded only for a task THIS run dispatched, and only when the number EXCEEDS the last one
   * recorded for it — a requeue repeats its number and appends nothing (the scheduler's own recipe's `max`). **Everything
   * else is dropped in SILENCE, and none of it is a refusal**: an id that does not parse (a plain task on a shared
   * scheduler — its SETTLEMENT is what `onUnmintedTask` reports, `ID-R5`), another run's (`ID-R4` tier 1), one this run
   * never dispatched (its settlement is `ID-R4` tier 2's `UndispatchedTask`), and a detail carrying no positive integer
   * `attemptNumber` (a scheduler older than the pin, or a double). An attempt start never stops a run by existing. **Queued, not
   * appended**: {@link Driver.takeAttempts} appends it when the step it was heard on ends — at once, on a scheduler
   * event's own step; at the step's end when an inline pool fires it inside the driver's `addTask`.
   */
  private heardRunning(detail: TaskDetailLike): void {
    const taskId = detail?.id;
    const attemptNumber = attemptNumberOf(detail);
    if (typeof taskId !== 'string' || attemptNumber === null) return;
    let runId: string;
    try {
      runId = parseTaskId(taskId).runId;
    } catch (e) {
      if (e instanceof InvalidTaskId) return;
      throw e;
    }
    if (runId !== this.runId || !this.dispatched.has(taskId)) return;
    if (attemptNumber <= (this.lastAttempt.get(taskId) ?? 0)) return;
    this.lastAttempt.set(taskId, attemptNumber);
    this.attemptsPending.push({ taskId, attemptNumber });
  }

  /**
   * **A `task.message` or a `task.progress`: PASSED THROUGH to its callback** — `RN-R42`, W187, P36 (k), ADR 0114. The
   * task's id is the detail's `taskId` for a message — `task.message` carries no `id` (P36 fact 2) — and its `id` for a
   * progress report, whose detail is the task spread flat. Handed on only for a task THIS run dispatched (`ID-R4`'s two
   * tiers, asked SILENTLY, as {@link Driver.heardRunning} asks them): anything else is dropped and is not a refusal. Every
   * field is COPIED here, while the listener runs (ADR 0007 rule 1, `OR-R1`), and the copy FROZEN (`OR-R7`); a value that
   * cannot be cloned is handed on `undefined` — the scheduler's own treatment of an uncloneable `emit` (its §6) — so a
   * pass-through never stops a run by existing. **The consumer's throw is NOT caught here**: it leaves through
   * `onEventOrThrow` to the listener boundary, which reports it and halts the run (`onUnmintedTask`'s road, `OR-R10`).
   */
  private heardPassThrough(name: 'task.message' | 'task.progress', detail: Record<string, unknown> | undefined): void {
    const isMessage = name === 'task.message';
    const taskId = isMessage ? detail?.taskId : detail?.id;
    if (typeof taskId !== 'string' || detail === undefined) return;
    let parts: TaskIdParts;
    try {
      parts = parseTaskId(taskId);
    } catch (e) {
      if (e instanceof InvalidTaskId) return;
      throw e;
    }
    if (parts.runId !== this.runId || !this.dispatched.has(taskId)) return;
    const attribution: TaskAttribution = {
      runId: parts.runId, nodeId: parts.nodeId, branchPath: parts.branchPath, taskId, flowAttempt: parts.attempt,
      attemptNumber: attemptNumberOf(detail as unknown as TaskDetailLike),
    };
    if (isMessage) {
      const m: TaskMessage = {
        ...attribution, name: detail.name as string, data: frozenCopy(detail.data), seq: detail.seq as number,
        timestamp: detail.timestamp as number,
      };
      if (detail.dropped !== undefined) m.dropped = detail.dropped as number;
      if (detail.error !== undefined) m.error = detail.error as string;
      this.opts.onTaskMessage?.(Object.freeze(m));
      return;
    }
    const p: TaskProgress = {
      ...attribution, progress: detail.progress as number, message: frozenCopy(detail.message) as string | undefined,
      details: frozenCopy(detail.details), timestamp: detail.timestamp as number,
    };
    this.opts.onTaskProgress?.(Object.freeze(p));
  }

  /** Whether this run has been HALTED by a refusal (`OR-R10`; its outcome `halted`). */
  hasFailed(): boolean {
    return this.failed;
  }

  private failRun(cause: unknown): void {
    // `RN-R8` — `halted` outranks everything, and the fold learns it here.
    //
    // *(This read *"Appended before `failed` is set so a re-entrant `onFoldInput`
    // listener sees the same order a later `foldInputs()` reader does"* — which is
    // the OPPOSITE of what the three lines below do: `failed` is set FIRST and the
    // `halted` element is appended after it. The order is right and the sentence
    // was not; W53's conformity reader, in a file W53 owns, on a comment W53 wrote
    // its own paragraph directly beneath.)*
    //
    // **`failed` being set before the append is what makes the guard in
    // `settleJoin` reachable**: a re-entrant `onFoldInput` listener that reaches
    // `failRun` from inside `settleJoin` leaves `this.failed` true by the time
    // control returns there.
    const already = this.failed;
    this.failed = true;
    const err = cause instanceof Error ? cause : new Error(String(cause));
    let seq: number | null = null;
    // `RN-R24`: during a replay a failure is reported only with the `halted` element it appended
    // PAST the stored events — below them the append has already refused the resume as `diverged`.
    const report = () => {
      if (this.replay !== null && (seq === null || !this.delivers(seq))) return;
      this.opts.onRunFailure?.({
        runId: this.runId,
        kind: err.constructor?.name ?? 'Error',
        message: err.message,
        cause,
      });
    };
    if (!already) {
      // **Reported in a `finally` around the append** (`OR-R10` v0.17, W178's S-1, the maintainer's answer): a consumer's
      // `onFoldInput` that THROWS on the `halted` element itself still has the run reported — the element is in the log
      // (`append` delivers after it stores) and `failed` is set — and the throw then leaves here; at a listener boundary
      // it is DISCARDED (`onEventStep`, `onEvent`), on a driver call it reaches the caller.
      try {
        seq = this.append({ kind: 'halted', reason: `${err.constructor?.name ?? 'Error'}: ${err.message}` });
      } finally {
        // **The RUN-LEVEL moment — the THIRD of the three
        // [ADR 0046](../../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
        // rule 3 names**, and it is not per-region: `OR-R10` says the driver has
        // stopped routing this run, so no join of any region will settle again. The
        // three doors into `settleJoin` are all shut behind `this.failed` — a
        // settlement returns at `onEventOrThrow`'s guard before `advance`, a
        // resolution is refused by `resolve`, and `start` has already thrown — so
        // every region's collection is unreadable from here whether or not its join
        // had fired.
        //
        // **The LOG is untouched, and that asymmetry is rule 2.** A halted run is a
        // run a consumer folds to find out what happened; releasing what the fold
        // reads would be the plausible wrong answer P15 decision 2 forbids. This
        // drops only the structure no `FoldInput` carries.
        this.arrivals.clear();
        report();
      }
      return;
    }
    report();
  }

  private onEventOrThrow(name: string, detail: TaskDetailLike): void {
    if (name === 'task.running') {
      this.heardRunning(detail);
      return;
    }
    if (name === 'task.message' || name === 'task.progress') {
      this.heardPassThrough(name, detail as unknown as Record<string, unknown> | undefined);
      return;
    }
    // **`ID-R4` — ADR 0023. Ownership is decided from the TASK ID ALONE, before
    // anything else reads the detail**, and the order is the whole rule.
    //
    // W13 shipped this after `normalizeEvent` and W13's conformity reader measured
    // what that cost: `normalizeEvent` throws `UncloneableResult` (`OR-R6`) while
    // copying `result`, so **another run's settlement with an uncloneable result
    // halted THIS run** and reported a `RunFailure` carrying *that other run's
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
    // precondition: one plain non-flow task settling halted **every** driver on
    // that scheduler. [ADR 0027](../../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
    // supersedes it and retires the precondition — `buildTaskId` emits only
    // four-segment ids in the `ID-R2`/`FD-V16` charsets, so an id that fails
    // `parseTaskId` was minted by **no** driver and cannot be this run's.
    // [Q86](../../doc/questions/q86.md), `ID-R5`.
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
        `"${taskId}" settled in run "${runId}", but this driver never ` +
          'dispatched it. ID-R4: within one run the driver mints every task id it dispatches, so ' +
          'either its path bookkeeping is wrong or something else is writing into this run id.',
      );
    }

    const record = normalizeEvent(name, detail, this.now());
    if (!record) return; // OR-R3/OR-R4: this event writes nothing
    this.settle(record, runId, nodeId, branchPath);
  }

  /**
   * **A settlement appended, reported and routed** — everything the listener does once `ID-R4` has
   * decided the settlement is this run's and `OR-R2` has normalised it. **The REPLAY shares it**
   * (`RN-R19`): a stored settlement is fed here as it was stored, so a resumed run is regenerated by the
   * routing that produced it rather than by a second road beside it — P23 prediction 1, *resume needs
   * no change to routing*, held as a structure rather than as a hope.
   */
  private settle(record: OutcomeRecord, runId: string, nodeId: string, branchPath: string): void {
    const seq = this.append({ kind: 'outcome', record });
    // **`OR-R13` — the result the log now carries, held to its worker's `outputSchema` and
    // REPORTED** (ADR 0060, W80, P21 decision 3). Off unless the consumer supplied the callback:
    // a run that registers nothing pays one `!== undefined` per settlement and nothing else.
    //
    // **AFTER the append, and the position is the decision.** Before it, a callback that threw
    // would stop the record being written — a behaviour change relative to the check being off,
    // which decision 3 forbids in the sentence its adequacy reader is told to falsify first. After
    // it, the report is about a record the log already holds whatever happens next, including the
    // `this.failed` guard below, which is a fact about a re-entrant `onFoldInput` and not about
    // this result.
    //
    // **The callback is read ONCE and handed down**, rather than read here and again at the call.
    // Two reads are two sources, and this repository keeps finding what that costs; more usefully,
    // it makes the guard an **L0 assertion**: with the parameter typed non-optional, deleting this
    // condition does not compile. *A type closes one direction* (W43, Q196) — the other, that a
    // consumer who supplies nothing pays no `findings` walk, is a COST and W81 owns the rung that
    // can see it.
    const report = this.opts.onNonconformingResult;
    // `RN-R24`: a REPLAYED settlement was reported, if at all, in the process that stored it.
    if (report !== undefined && this.delivers(seq)) this.reportResultSchema(record, nodeId, report);
    if (this.shut()) return;
    if (record.terminalState === 'cancelled') {
      // **`RN-R28` — the FIRST cancelled settlement halts the run** (ADR 0094 rule 3, W158). Exactly `failRun`'s
      // halt and nothing of its report: the record above is already in the log, which is all the fold needs to
      // read the run `cancelled`, so no `halted` element is appended and `onRunFailure` is not called. Every
      // region's collection is released — `failRun`'s RUN-LEVEL moment (ADR 0046 rule 3, `JP-R12`), because no
      // join of this run settles again. The tasks still in flight are the scheduler's: each is appended as it
      // settles, above, and routed nowhere, by the line above this block.
      this.cancelled = true;
      this.arrivals.clear();
      return;
    }
    if (record.terminalState === 'user_action') {
      // Not a loss. The branch is still live and the join keeps waiting; a run
      // waiting on a person must not be reported as stuck (Q7).
      const region = this.regionOf(nodeId);
      if (region) {
        this.emit({ type: 'branch.suspended', regionId: region.fanoutId,
          regionPath: this.rpathOf(region, this.indicesFrom(nodeId, branchPath)),
          branchPath, at: nodeId });
      }
      return;
    }
    this.advance(runId, nodeId, branchPath);
  }

  /**
   * **`OR-R13` — hold one settled result to its worker's `outputSchema` and report, never route**
   * ([ADR 0060](../../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md),
   * [W80](../../doc/work-items/w80-what-a-run-time-result-check-is.md)). Called only when the
   * consumer supplied `onNonconformingResult`, which is the whole of the switch.
   *
   * **`record.result` and never `detail.result`, and that is the rule's sharpest half.** What this
   * reads is the value `OR-R2`'s clone produced — what the RUN carries — and `OR-R11` says that is
   * a different value from the one the worker returned: a non-enumerable own property, or a nested
   * one, is present on what `run()` handed back and absent from the record. So this check and
   * `scripts/check-workers.mjs`, applying **the same schema**, can disagree — measured over seven
   * shapes at W80's declaration step, three of them disagreeing — and that disagreement is
   * unreachable by any authoring-time tool for a structural reason: none of them holds a record.
   *
   * **`done` only.** `OR-R2`'s guard writes `result: null` for `failed` and `user_action`, so
   * checking those would refuse every failure against an output schema no worker ever reached.
   *
   * **Settlements only, never a resolution.** `FD-R4` already holds a person's `done` value to this
   * same `outputSchema` at `resolve()` — as a REJECTED COMMAND, which is a different answer — and
   * one value refused twice by two mechanisms that disagree is worse than either alone.
   *
   * A node with no type entry, a type naming no worker entry, or a worker declaring no
   * `outputSchema` is UNCHECKED — P18 decision 3, *absent means unchecked*, as `FD-R4` reads it.
   * The first two cannot occur on a definition this driver accepted (`FD-V32`) and are written as
   * optional chains rather than asserted, exactly as `resolve()`'s boundary is.
   */
  private reportResultSchema(record: Readonly<OutcomeRecord>, nodeId: string, report: (f: NonconformingResult) => void): void {
    if (record.terminalState !== 'done') return;
    const n = this.graph.byId.get(nodeId);
    if (n?.kind !== 'task') return;
    const type = this.nodeTypes.get(n.type);
    // `workerName` is kept so the report below can name it without an assertion: a schema exists only
    // where a worker does, and a type that only transforms has neither (ADR 0075).
    const workerName = type?.worker;
    const worker = workerName === undefined ? undefined : this.workers.get(workerName);
    const schema = worker?.outputSchema;
    if (schema === undefined || workerName === undefined) return;
    // **The check must not be able to STOP the run, and unguarded it CAN** — W80's conformity
    // reader, finding 1, measured on four shapes. `findings`' `enum` and `const` clauses are the
    // ONLY two of the subset's seventeen keywords (ADR 0053, ADR 0056, ADR 0098) that call `canonical`, and `canonical` is the only
    // expression in that module which walks the WHOLE VALUE rather than the schema's shape — every
    // other clause recurses through `properties` and `items`, whose depth is the SCHEMA's, and the
    // subset has no `$ref` to make that unbounded. So a **cyclic** result or a **BigInt** under
    // either keyword throws `RangeError` or `TypeError`, and `OR-R11`'s own table calls both of
    // those **intact**. From a listener that throw reaches `onEvent`, is reported through
    // `onRunFailure` and STOPS THE RUN — decision 3's headline invariant broken by the reporting
    // machinery itself, one expression along from the append order above.
    //
    // **A value that cannot be read is a FINDING, which is what keeps this a reading.** `FD-R4`
    // runs the same expression and needs no guard, because there the throw reaches a caller on
    // the stack (`OR-R12`'s asymmetry); here there is nobody to throw to.
    let fs: readonly SchemaFinding[];
    try {
      fs = findings(schema, record.result);
    } catch (e) {
      fs = [{ path: '$', says: `could not be checked against the schema: ${e instanceof Error ? e.message : String(e)}` }];
    }
    if (fs.length === 0) return;
    report({
      runId: this.runId,
      taskId: record.taskId,
      nodeId,
      type: n.type,
      worker: workerName,
      findings: fs,
      message:
        `NonconformingResult: the result of "${record.taskId}" (node "${nodeId}", type "${n.type}") does not satisfy its ` +
        `worker "${type!.worker}"'s outputSchema — ${describeFindings(fs)}. OR-R13: this is a READING and not a refusal — ` +
        'the record is written, the run routes, and the value reaches the next node exactly as it would with the check off.',
    });
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
    //
    // **And a context PER EDGE, built only for an edge that carries a `when`** —
    // `FD-C3`,
    // [ADR 0041](../../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md).
    // `resolveNeeds` is `compose`'s reference half with **no `edgeValue`**, because a
    // predicate has no `"."`: *what it would have received anyway* is `ctx.outcome`,
    // which it already has, and `FD-V26` refuses the token on an edge for that reason.
    //
    // **That absence is why Q8 is its own decision.** Handing a predicate *what its
    // NODE received* is not available: the **entry** node's payload is `start(payload)`
    // and appears in **no record** — an `OutcomeRecord` carries `result` and no payload
    // field — so that node has no derivation at all, and for every other node a
    // derivation re-implements `compose`, `JP-R11` and `JP-R12` at a second site, which
    // ADR 0040 rule 2 refuses by name. Keeping it instead would be a payload retained
    // per dispatched node — [Q19](../../doc/questions/q19.md)'s own subject.
    // **The references are derivable; the payload is not.** *(Still true of what a NODE
    // received. What the RUN entered with is no derivation either — it is the header's own
    // copy, retained for the life of the run (`RN-R15`, `RN-R13`) and not a log record — and
    // since v0.44 an edge may name it, `"$payload"`, read by `resolveNeeds` from that copy
    // (ADR 0117, P38 fact 10: this paragraph's *no derivation at all* was the end of the
    // sentence until then).)*
    //
    // *(This comment cited a DIAMOND — a node reachable from two predecessors that both
    // settle — and said choosing between them needs append order. W42's conformity
    // reader derived it in one expression with none: drop any settled predecessor that
    // another settled one is reachable FROM, and `FD-V19` makes the survivor unique.
    // The conclusion held; the reason was wrong and is replaced.)*
    const result = selectEdge(
      node,
      runId,
      outcome.terminalState,
      (edge) => ({
        outcome: cloneRecord(outcome),
        needs: this.resolveNeeds(node, edge, itemIndices),
      }),
      this.opts.predicates,
    );
    if (result.taken === null) {
      // No edge opts into this state. The path ends — declared by omission.
      const region = this.regionOf(nodeId);
      if (region) {
        this.emit({ type: 'branch.lost', regionId: region.fanoutId,
          regionPath: this.rpathOf(region, itemIndices), branchPath, reason: 'failed' });
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
    // **`RN-R29` — the hold, at the head of entering ANY node** (ADR 0103, P34 decision 8): door (a) of
    // [Q605](../../doc/questions/q605.md). A fan-out's and a map's branches are entered one call each, and a
    // consumer's callback on the first one's `dispatched` element can halt the run before the next is entered; a
    // gate's route and a join's successor are entered after an append that can do the same. Checked HERE rather
    // than in each loop, so no arm of this switch — a dispatch, a region opened, a gate decided, a path ended, a
    // join asked — runs for a halted run, whichever caller reached it.
    if (this.shut()) return;
    const node = this.graph.byId.get(nodeId);
    if (!node) return;

    // **`FD-C1` — what this node receives.** Identity for every node that declares
    // no `needs`, which is every node in the corpus that existed before
    // [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md),
    // so this line is a no-op on the whole of v0.10's behaviour — measured, at 574
    // L1-L5 cases unmoved. It sits at the top of `enter` rather than in the two arms
    // that use it because there is then ONE place a payload is composed, and the
    // answer to *what did this node receive* does not depend on which arm read it.
    //
    // **It throws `UnresolvedReference` and is not caught here**, for the reason the
    // `map` arm's `mapItems` states one screen down: the two boundaries above
    // already do the right thing with a throw — `onEvent` catches and reports
    // (`OR-R10`), `start` catches, reports and rethrows — and catching it here would
    // make `start()` stop rethrowing.
    const received = this.compose(node, payload, itemIndices, this.runPayload());

    switch (node.kind) {
      case 'task':
        return this.dispatch(runId, node, received, itemIndices);

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
          this.joinStateSet(region.fanoutId, this.rpathOf(region, itemIndices),
            this.opts.joinPolicy.open(toRegion(region) as Region));
        }
        // **The region is ENTERED, and the fold is told so** — W33. Appended beside
        // `open` in both region-opening arms, because that is the moment
        // `spec/run-state.md`'s *"one entry per fan-out region ENTERED"* becomes
        // true. Here it is redundant with the `branch.opened`s below — `FD-V9`
        // guarantees at least two — and it is emitted anyway so the invariant has
        // ONE mechanism rather than one for a fanout and another for a map.
        this.append({ kind: 'regionEntered', regionId: region.fanoutId,
          regionPath: this.rpathOf(region, itemIndices) });
        // **Each branch entry's OWN path, not its bare index** — W21. This
        // emitted `String(i)` and threaded it, so a nested fanout opened its
        // branches at `0`/`1` with the outer prefix discarded: `fromBranch` was in
        // scope at both lines and thrown away. Derived, an inner branch opens at
        // `1.0` and the outer prefix cannot be lost, because it was never carried.
        // Computed once per branch rather than twice — W21's conformity reader
        // priced the derivation and found it dearer than the fork table said.
        const paths = region.branches.map((b) => this.pathOf(b, itemIndices));
        region.branches.forEach((_b, i) => {
          this.emit({ type: 'branch.opened', regionId: region.fanoutId,
            regionPath: this.rpathOf(region, itemIndices), branchPath: paths[i]! });
        });
        // **The last two arguments here are unobservable and are kept deliberately**
        // — W21's adequacy reader. `FD-V9` makes every branch entry a `task` or, since v0.42, an `ask`, and
        // `enter`'s `task` and `ask` arms discard `fromBranch` and `fromRegion` (an ask derives its path from the
        // graph, as a dispatch does), so nothing downstream reads them. They are passed because the branch entry is the
        // one node whose region and path are known here without a lookup, and the
        // moment `FD-V9` is lifted (or a branch entry may be a `join`) the arm
        // stops discarding them. **Said in place rather than left for the next
        // reader to rediscover as dead code.**
        //
        // **Each branch gets its OWN COPY** — [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
        // rule 2, `JP-R11`. This was one object handed to every branch, so
        // `a.payload === b.payload` was `true` and a branch mutating what it was
        // given mutated its siblings' input ([Q154](../../doc/questions/q154.md)).
        // The payload IS cloned once at the edge hop, which protects the log; that
        // single clone was then shared N ways.
        //
        // **Measured on a real scheduler in both pool kinds**: inline, branch B's
        // worker saw A's write in its own input BEFORE it ran, and A's view gained
        // B's write AFTER A returned; threaded, each saw only its own. **The
        // identity is `true` in both** — the sharing is a driver-level fact and only
        // its observability is a pool option, which the flow author does not control
        // and this driver cannot see. So a rule conditioned on the pool would be one
        // the driver cannot evaluate, which is `OR-R2`'s own reason for cloning
        // unconditionally *including where it is redundant*.
        //
        // **The cost is linear in a number the DOCUMENT declares.** `FD-V9`'s floor
        // is 2 and a fanout's arity is written down, so this is bounded by the
        // author rather than by the data: measured at 9.3 / 14.2 / 23.0 / 44.3 ms
        // for arity 2 / 3 / 5 / 10 over a 230 KiB payload, against 4.5-4.8 ms for
        // one clone. **The same fix on a `map` is quadratic and unaffordable** —
        // 2207.94 ms against 1.50 ms at N = 1000 — and the map arm below does not
        // need it, because its instances no longer receive one value at all.
        region.branches.forEach((b, i) =>
          this.enter(runId, b, cloneValue(received), paths[i]!, region.fanoutId, itemIndices));
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
        const items = this.mapItems(node, received);
        if (this.opts.joinPolicy) {
          this.joinStateSet(region.fanoutId, this.rpathOf(region, itemIndices),
            this.opts.joinPolicy.open(toRegion(region) as Region));
        }
        // The region is ENTERED — see the `fanout` arm. **Here it is the only thing
        // that says so when N is 0**, and without it that run folds to `completed`.
        this.append({ kind: 'regionEntered', regionId: region.fanoutId,
          regionPath: this.rpathOf(region, itemIndices) });
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
        // a fanout. **Since W180 this two-pass loop is the clause's ONLY guarantor** (`spec/join-policy.md` v0.23):
        // `FD-V25` makes a map's branch a `task` or, since v0.42, an `ask`, and entering an ask EMITS — its park's
        // `branch.suspended` — so a loop that interleaved `branch.opened` with entering each instance would put branch
        // 0's `branch.suspended` before branch 1's `branch.opened`. `test/driver/ask.test.ts` fails on that interleaving,
        // here and in the `fanout` arm above.
        for (const p of paths) {
          this.emit({ type: 'branch.opened', regionId: region.fanoutId,
            regionPath: this.rpathOf(region, itemIndices), branchPath: p });
        }
        // **Every instance receives its OWN ITEM, as its own copy** —
        // [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
        // rule 3, `JP-R11`. [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md)
        // shipped this handing every instance the WHOLE value the map node received
        // — arity-correct and payload-unchanged — deliberately, so that deciding
        // [Q11](../../doc/questions/q11.md) at the fan-out edge would be a visible
        // edit rather than a silent one. This is that edit.
        //
        // **It is what makes `over` mean something.** Handed the whole value, an
        // instance can only find its own item by an index nothing gives it, and
        // `over` names an array whose sole use is its `length` — a map that is a
        // fanout that counts.
        //
        // **`cloneValue` per item, and *its own copy* rather than *its own item* is
        // load-bearing.** `structuredClone` preserves aliasing WITHIN one clone, so
        // `{items: [x, x]}` survives the edge hop as an array holding one object
        // twice — measured — and instances 0 and 1 would share it. The invariant is
        // *no two nodes ever receive the same object*, and indexing alone does not
        // give it.
        //
        // **The cost is LINEAR, and it is the whole reason a map needs no per-branch
        // clone of the payload.** At N = 1000 over a 117 KiB payload: the shipped
        // one-shared-clone 1.50 ms, an item each 2.29 ms, a *cloned* item each
        // 7.99 ms — against **2207.94 ms** for the `fanout` arm's fix applied here,
        // which is quadratic because a map's arity and its payload grow together.
        // *The fix that is catastrophic for the feature that needed it is
        // unnecessary for it.*
        idx.forEach((m, i) =>
          this.enter(runId, branch, cloneValue(items[i]), paths[i]!, region.fanoutId, m));
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
        // If [Q97](../../doc/questions/q97.md) is ever answered with a signal that
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
        // [Q97](../../doc/questions/q97.md) exactly where section 5 leaves it.
        const enclosing = this.regionOf(region.fanoutId);
        if (items.length === 0 && enclosing) {
          this.emit({
            type: 'branch.lost',
            regionId: enclosing.fanoutId,
            regionPath: this.rpathOf(enclosing, itemIndices),
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
        // **What this branch carried in, recorded before the policy is asked** —
        // `JP-R12`, [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
        // rule 4. `payload` here is the arriving branch's own edge-hop clone, made
        // by `advance` for this hop and held by nothing else, so no further copy is
        // taken and none is needed.
        //
        // **Before the `settleJoin` below, and that ordering is the rule.** The
        // policy may answer `satisfied` on THIS event, and the exit reads this map;
        // recording after would drop the very arrival that fired the join. The
        // failure is silent — a join firing with N-1 entries — so it is stated here
        // rather than left to the two lines' order.
        //
        // **The `firedJoins` guard is
        // [ADR 0046](../../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
        // rule 4's OPENING bound, and without it rule 3's release is a leak with a
        // narrower mouth.** The release at the exit drops what the region collected;
        // an arrival reaching a join that has ALREADY become terminal would call
        // `arrivalsOf` again, mint a fresh inner map and store a payload nothing can
        // ever read — so the structure would refill after being released, once per
        // late arrival, for the life of the run.
        //
        // **No shipped policy produces that arrival and a third-party one may**,
        // which is why this is a guard rather than a comment. `arrival-count` fires
        // on the N-th of N arrivals and `live-token`/`live-token-requiring-arrival`
        // fire when the last live branch goes terminal, so all three settle the join
        // only once nothing is left to arrive. A policy that settles a join **before
        // every branch is terminal** is exactly the precondition
        // [Q95](../../doc/questions/q95.md) records for the `at most once` latch
        // twenty lines down in `settleJoin` — the same hypothetical policy, reaching
        // the same region through a second door.
        //
        // So the window a region's collection exists in is stated at both ends: it
        // opens at the first arrival and closes when the join becomes terminal, and
        // outside it nothing is recorded and nothing is held.
        const rpJoin = this.rpathOf(region, itemIndices);
        if (!this.firedHas(region.fanoutId, rpJoin)) {
          this.arrivalsOf(region.fanoutId, rpJoin).set(fromBranch, payload);
        }
        this.emit({ type: 'branch.arrived', regionId: region.fanoutId,
          regionPath: rpJoin, branchPath: fromBranch });
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
          this.emit({ type: 'branch.exited', regionId: region.fanoutId,
            regionPath: this.rpathOf(region, itemIndices), branchPath: fromBranch, at: nodeId });
        }
        // `spec/run-state.md` section 3's `completed` — *"at least one path ended
        // at an `end` node"*. **Reported whether or not the path was in a region**,
        // which is the half nothing reported before: outside one there was no
        // region event either, so `pathEnded` had no producer anywhere (Q41).
        this.append({ kind: 'pathEnded', reason: 'end', at: nodeId });
        if (region && fromBranch !== '-') this.settleJoin(runId, region, itemIndices);
        return;
      }

      // **A GATE decides, where a branch ENTERS it, and dispatches nothing** — `spec/flow-definition.md`
      // section 2, P24 decisions 5-8,
      // [ADR 0067](../../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md),
      // [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md). Synchronous, no task id, no scheduler:
      //
      //   1. the TYPE's `fn` is handed `{ key, input, settings, memory }` (`decideGate`) — `settings.key`
      //      resolved by `readKeyPath`, COPIES of the value and the settings, and THIS gate's run memory;
      //   2. a route the type does not declare stops the run by name — `FD-R5`, `UndeclaredRoute` — and a
      //      throw stops it with the thrown error, as a predicate's does; nothing is appended for the gate;
      //   3. the decision is RECORDED — a `gated` element, `RN-R26` — BEFORE its route is entered, so what
      //      the route led to follows it in the sequence and a resume compares the answer where it was made;
      //   4. the ONE edge wired for the route is taken (`gateEdge` — an edge with no `route` carries the
      //      type's DEFAULT), with **`received` itself: what reached the gate, unchanged**, and the branch,
      //      region and item indices that reached it — so an `end` or a `join` after a gate sees the branch
      //      that reached the gate, which is how a drop to an `end` is a `branch.exited` (P24 fact 3).
      //
      // **`received` and not a copy of it is handed on**, and that is sound for the reason every other arm
      // hands it on: it is this hop's own edge-hop clone (`advance`) or the caller's entry payload, held by
      // nothing else; the type saw a COPY, so a type writing into its `input` moves nothing downstream.
      case 'gate': {
        const decided = this.decideGate(node, received, this.memoryOf(nodeId));
        if ('threw' in decided) throw decided.threw;
        const set = decided.set;
        if (!decided.declared) {
          throw new UndeclaredRoute(
            `FD-R5 — run "${runId}" reached gate "${nodeId}" and its type "${node.type}" returned ` +
              `${describeRoute(decided.route)}, which it does not declare; its routes are ${set.routes.map((r) => JSON.stringify(r)).join(', ')}. ` +
              'A route only running the type reveals cannot be refused at load (FD-V41 wires every DECLARED route), so the run halts ' +
              'here rather than routing nowhere. The type is the CODE registered under that name, not the document.',
          );
        }
        const route = decided.route as string;
        const edge = gateEdge(node, set.defaultRoute, route);
        // `FD-V41` wires every declared route by exactly one edge, so this cannot miss; if it could, the branch
        // would end with no event, which is the silent stop section 3 refuses by name — so loud instead.
        if (edge === null) {
          throw new InvalidDefinition(['FD-V41'], `gate "${nodeId}" has no edge for route ${JSON.stringify(route)} — FD-V41 should have refused this definition at construction`);
        }
        const d: Extract<FoldInput, { kind: 'gated' }> = { kind: 'gated', gateId: nodeId, branchPath: this.pathOf(nodeId, itemIndices), route };
        // `decided.key` is already a COPY, taken before the type ran (`decideGate`), so it is stored as it is.
        if (decided.key !== undefined) d.key = decided.key;
        this.append(d);
        this.enter(runId, edge.to, received, fromBranch, fromRegion, itemIndices);
        return;
      }

      // **An ASK PARKS, and nothing is handed to the scheduler** — `RN-R37`, v0.22,
      // [ADR 0109](../../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md),
      // [W180](../../doc/work-items/w180-asking-and-answering-in-a-run.md), P35 (b)-(f). It replaces ADR 0108 rule 8's
      // interim refusal at this arm. See `ask()`.
      case 'ask':
        return this.ask(runId, node, received, itemIndices);

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
   * **One gate's memory — the same `Map` for every branch that reaches the gate in this run** (`RN-R26`),
   * made on the gate's first evaluation. Keyed by gate id ALONE, which is P24 stop-and-ask (a): per RUN, not
   * per region instance and not per map item.
   */
  private memoryOf(gateId: string): Map<string, unknown> {
    let m = this.gateMemory.get(gateId);
    if (m === undefined) {
      m = new Map<string, unknown>();
      this.gateMemory.set(gateId, m);
    }
    return m;
  }

  /**
   * **Ask a gate's TYPE, and nothing else** — the one place a type's `fn` is called, for the arm in `enter()`
   * with the run's memory and for `FD-R4`'s entry walk with a throwaway one. The type is handed COPIES of
   * the value and of the settings (a predicate is handed a copy — `advance`'s `cloneRecord` — for Q9's
   * reason), so nothing the type writes reaches what the gate hands on or the definition.
   *
   * **The gate reads the value AS A `structuredClone` CARRIES IT, and resolves the key ONCE** — W93's
   * conformity reader, finding 1 (BLOCKING), and the adequacy reader's R3/R4. The first cut resolved the key
   * the type was handed off the COPY and the key it recorded off the ORIGINAL: for a CLASS instance in a
   * caller's entry payload the two differ — `readKeyPath` reads own keys of PLAIN objects, and the clone of an
   * instance is plain — so the type saw `"x"`, the record saw nothing, and a resume, which enters from the
   * header's clone (`RN-R19`), regenerated a key the stored element lacked and was REFUSED `diverged` at 0 on
   * a checkpoint nobody tampered with. Reading the clone in BOTH is what makes a run and its replay read the
   * same value — `OR-R11`'s *a value, not an object* at the one boundary where the caller's own object used to
   * reach a decision. And the recorded key is copied BEFORE `fn` runs, so a type writing into its input at the
   * key path moves nothing recorded. A throw is RETURNED, not raised, so each caller decides what it means.
   */
  private decideGate(
    node: GateNode,
    value: unknown,
    memory: Map<string, unknown>,
  ): { set: Exclude<ReturnType<typeof routesOf>, { readonly problem: string }>; route: unknown; declared: boolean; key: unknown } | { threw: unknown } {
    // `FD-V39` at construction: every gate names a registered gate type, so this cannot miss.
    const type = this.gateTypes.get(node.type)!;
    const settings = (node.settings ?? {}) as Readonly<Record<string, unknown>>;
    const path = typeof settings.key === 'string' ? settings.key : undefined;
    const input = cloneValue(value);
    const key = path === undefined ? undefined : readKeyPath(input, path);
    const recorded = key === undefined ? undefined : cloneValue(key);
    let route: unknown;
    try {
      route = type.fn({
        key,
        input,
        settings: cloneValue(settings) as Readonly<Record<string, unknown>>,
        memory,
      });
    } catch (threw) {
      return { threw };
    }
    // **The GATE's resolved set, not the type's members** (ADR 0092 rule 3): for a derived type, a route another
    // gate of the same type declares is still undeclared HERE, and stops the run by `FD-R5`.
    const set = this.gateRoutes.get(node.id)!;
    const declared = typeof route === 'string' && set.routes.includes(route);
    return { set, route, declared, key: recorded };
  }

  /**
   * **`FD-R4`'s road through an ENTRY gate: the edge the run will take, and no other** — W93, Outputs (9).
   * The type is asked against a THROWAWAY memory, which is empty — exactly what this run's memory is at
   * `start()`, since no gate has been evaluated yet — so for a type that is the pure function of its context
   * Q9 asks every decision to be, this is the route `enter()` will take a moment later. **A throw or an
   * undeclared route holds NOTHING past the gate**: the run stops on it for real in `enter()`, where it is
   * reported and rethrown, and a boundary refusal would name a task the run never reaches.
   */
  private boundaryEdges(gate: GateNode, value: unknown): readonly Edge[] {
    const decided = this.decideGate(gate, value, new Map<string, unknown>());
    if ('threw' in decided || !decided.declared) return [];
    const edge = gateEdge(gate, decided.set.defaultRoute, decided.route as string);
    return edge === null ? [] : [edge];
  }

  /**
   * **What the run has produced, keyed by `(node id, branchPath)`** —
   * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
   * rules 2 and 3, and `FD-C2`.
   *
   * **It is a PROJECTION of the log and adds no retention** — measured at
   * [P12](../../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)'s
   * declaration and again before this was written: this driver holds
   * `private readonly log: LogRecord[]` with exactly one `push` and no `splice`,
   * `shift` or reassignment, `OutcomeRecord.result` is on every settled task, and
   * `snapshot()` already returns the whole of it publicly. So
   * [Q19](../../doc/questions/q19.md)'s *"if Q8 or Q11 retains every node output"*
   * described **today** before this method existed, and this adds **no retention**.
   * *(Q19 is RESOLVED since W53 —
   * [ADR 0046](../../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
   * — and `RN-R13` names this memo by id: it holds results **by reference only**,
   * asserted by IDENTITY at ladder L2 rather than by a byte count, because a
   * reachability SET cannot tell an alias from a copy. W53's readers found that
   * from both ends — the rule's stated test returned a third name on a `needs`
   * flow, and cloning here cost ZERO.)*
   * *(It adds ONE field — `outputsCache` below — which is a memo the log invalidates
   * and which holds nothing the log does not. This read *"zero fields"* until W41's
   * conformity reader read it beside the memo the cost measurement had just added.)*
   *
   * **`effectiveOutcome` and not the raw record**, for `spec/flow-definition.md`
   * section 3 rule 4's own reason: a resumed node has two records in the log and
   * neither one alone is the right thing to hand anybody. A node that is still
   * suspended has no effective outcome and therefore no entry — which is what makes
   * `FD-R3` fire rather than a reference quietly resolving to `undefined`.
   *
   * **Computed on demand rather than maintained**, and the cost is why: it is
   * `O(log)` per call, so maintaining it would be a second source that could
   * disagree with the log — the defect [Q43](../../doc/questions/q43.md) and
   * `arrival-count`'s re-sourcing are each an instance of. **A node that declares no
   * `needs` never reaches this method**, which is what keeps ADR 0040 rule 1's *the
   * default is unchanged* true of the cost as well as of the value.
   */
  private outputs(): Map<string, { path: string; result: unknown }[]> {
    // **Memoised on the log's own LENGTH, and that is not a second source.** The
    // projection is a pure function of `this.log`, and `this.log` is append-only —
    // one `push`, no `splice`, no `shift`, no reassignment, which is
    // [P12](../../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)'s
    // fact 1 measured over this file. So the length IS a version counter, and a
    // cache invalidated by the thing it projects cannot disagree with it the way a
    // MAINTAINED index could — which is the distinction ADR 0040 rule 2 turns on.
    //
    // **It is here because the cost was re-taken on the tree this item ships**
    // (`doc/workflow.md` section 1 rule 5's WHEN), and the first reading was 0.027 ms
    // over a 6-record log — true, and not the number that matters.
    //
    // **Its case is N dispatches in ONE turn over a long log**, which is Q165's flow
    // at scale: a second map region fanning out over what the first produced, every
    // instance composing. Measured on `map -> score -> join -> map -> publish` with a
    // `needs` on `publish`, timing only the settlement that opens the second region:
    //
    // | N | with the memo | without |
    // |---|---|---|
    // | 100 | 3.4 ms | 11.1 ms |
    // | 400 | 20.1 ms | 85.2 ms |
    // | 800 | **69.5 ms** | **312.1 ms** |
    //
    // **And it is measurably worth NOTHING on a single map region** — 10.9 ms against
    // 10.7 at N = 1000, inside the noise — because there the log is two records long.
    // Both halves are recorded because the second is what a reader measuring this by
    // the obvious fixture would find, and would then delete it.
    //
    // **No test asserts it, deliberately and stated rather than left as a gap.** The
    // memo changes no observable: all 606 L1-L5 cases pass with the line replaced by
    // a comment, which is the measurement rather than an assumption. A timing
    // assertion would be a check whose verdict is not reproducible
    // ([Q179](../../doc/questions/q179.md)), so what stands in for one is the pair of
    // numbers above.
    if (this.outputsCache && this.outputsCache.at === this.log.length) return this.outputsCache.byNode;
    const byNode = new Map<string, { path: string; result: unknown }[]>();
    // **Grouped in ONE pass, and `effectiveOutcome` is still what decides each
    // group.** The first version called `effectiveOutcome(this.log, id)` once per
    // distinct id and that function scans the whole log, so this method was
    // **O(log²)** — measured on a `needs` composed once per settlement, where a
    // length-keyed memo misses by construction: **4.8 / 29.3 / 132.2 ms** for
    // 50 / 200 / 400 settlements, a per-settlement cost rising 0.096 → 0.146 →
    // 0.331 ms as the log grew.
    //
    // **Grouping rather than reimplementing the merge is the whole point.**
    // `effectiveOutcome` filters by `taskId` anyway, so a sub-log holding only that
    // task's records is an input it is already total on — which means the settlement/
    // resolution/`user_action` rules stay in ONE place. Rewriting them here would be
    // a second source that could disagree with the log, which is the defect
    // [Q43](../../doc/questions/q43.md) and `arrival-count`'s re-sourcing are each
    // an instance of, and it is what ADR 0040 rule 2 refuses.
    const groups = new Map<string, LogRecord[]>();
    for (const r of this.log) {
      const g = groups.get(r.taskId);
      if (g) g.push(r);
      else groups.set(r.taskId, [r]);
    }
    for (const [taskId, group] of groups) {
      const eff = effectiveOutcome(group, taskId);
      // **`!eff` — a suspended node contributes no entry — has NO reachable case,
      // and this records that rather than arguing it** (`doc/workflow.md` section 5
      // rule 8: *construct the case that makes each guard fire, and where the corpus
      // cannot express one, RECORD that*). W41's adequacy reader measured it: making
      // a suspended node contribute `{result: undefined}` costs **0**, on the suite
      // and on a hand-built resumed-map probe. **The reason is a property of every
      // shipped policy**: a suspended branch still holds a token, so no join fires
      // while one is parked and no reader downstream of it is ever entered. It is
      // the same absence `JP-R12`'s row records for its own suspended road, and it
      // becomes live the moment a policy fires over a parked branch
      // ([Q97](../../doc/questions/q97.md)).
      //
      // **What the L2 case named for it DOES test is the resumed node**, which is
      // reachable and is asserted; its title over-claimed and is corrected there.
      if (!eff) continue;
      let parts;
      try {
        parts = parseTaskId(taskId);
      } catch {
        // Unreachable: every id in this log was minted by `buildTaskId`, and
        // `ID-R4` tier 2 has already refused any settlement this driver did not
        // dispatch. Guarded rather than asserted because a parse throw here would
        // turn one malformed id into a failed run for a reference that does not
        // name it.
        continue;
      }
      const list = byNode.get(parts.nodeId);
      if (list) list.push({ path: parts.branchPath, result: eff.result });
      else byNode.set(parts.nodeId, [{ path: parts.branchPath, result: eff.result }]);
    }
    this.outputsCache = { at: this.log.length, byNode };
    return byNode;
  }

  /**
   * The memo above. **Not run state and not a second copy of it** — it is discarded
   * and rebuilt the moment the log grows, and nothing ever reads it without checking
   * the length first, so there is no state here that could be stale in a way anything
   * could observe. `ADR 0014`'s *the driver computes no run state* is untouched.
   */
  private outputsCache: { at: number; byNode: Map<string, { path: string; result: unknown }[]> } | null = null;

  /**
   * **What a node receives** — `FD-C1`, and
   * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
   * rule 1: a node that declares no `needs` receives `edgeValue` **unchanged and by
   * the same expression it took before this method existed**, so every flow in the
   * corpus takes exactly the road it took at v0.10.
   *
   * A node that declares one receives **exactly** the object `needs` describes.
   * There is no wrapper and no reserved key: `"."` is how an author asks for what
   * the edge carried, so the composed object is the whole payload and what the
   * worker gets is what the document says, character for character.
   *
   * @throws UnresolvedReference — `FD-R3`.
   */
  private compose(node: FlowNode, edgeValue: unknown, itemIndices: ReadonlyMap<string, number>, runPayload: unknown): unknown {
    const needs = (node as { needs?: Record<string, unknown> }).needs;
    if (!needs) return edgeValue;
    const here = this.pathOf(node.id, itemIndices);
    const produced = this.outputs();
    const out: Record<string, unknown> = {};
    for (const [key, ref] of Object.entries(needs)) {
      // **`!` rather than a guard, and the assertion is the point.** `FD-V26` refuses
      // every malformed reference at construction, so `referenceTarget` cannot return
      // `null` for a definition a `Driver` accepted — see below.
      const t = referenceTarget(ref)!;
      // **`t === null` was a second disjunct here and is DELETED, on a measurement.**
      // W41's adequacy reader graded it a survivor: `if (t !== null && t.node === null)`
      // costs **0**, because the `Driver` constructor runs `validateDefinition` and
      // `FD-V26` refuses every malformed reference before a run exists. It is the
      // same argument that deleted `target === n.id` from `FD-V27` in
      // `../definition/validate.ts`, and **the reader's finding is that this item
      // applied that argument in one file and not in the other** — so both go.
      //
      // **The node-less forms, switched on BY NAME** (P38 fact 7, W190): reading `t.node === null` as *the
      // `"."` form* — which this line did until v0.44, when `"."` was the only one — hands a `"$payload"` key the
      // edge's value in silence.
      //
      // `"."` composes what the node would have received anyway, whichever of this document's four arcs it
      // sits on. `"$payload"` composes the value the RUN entered with — `FD-C1` v0.44, ADR 0117 — handed in by
      // the caller (P38 (f)): the header's copy in a run and on a resume, the caller's own value at `FD-R4`.
      // **Each its own copy, per key, per read** (`JP-R11`, ADR 0040 rule 6): no node ever receives an object
      // another holds, and no worker can reach the header through what it was handed.
      if (t.form === 'self') {
        out[key] = cloneValue(edgeValue);
        continue;
      }
      if (t.form === 'payload') {
        out[key] = cloneValue(runPayload);
        continue;
      }
      if (t.form === 'item') {
        // `FD-V26` refuses `"$item"` at construction until W191 composes it (W190's reading R1), so no accepted
        // definition reaches this arm — the same assertion the `!` above makes for a malformed reference.
        throw new Error(`node "${node.id}" declares needs[${JSON.stringify(key)}] = "$item", which FD-V26 refuses at this version and no composition reads`);
      }
      const v = this.resolveReference(node.id, here, produced, key, t, 'needs');
      // **`ABSENT` and not `null`, and the reason is measured** — W45. A reference
      // to a task that FAILED already resolves to `null` with the key present
      // (`fanout-failure` with `scoreA` optional: `publish` receives
      // `{"got": null}`), so `null` means *ran and produced nothing* and cannot
      // also mean *did not run*. An absent key is the only answer an author can
      // tell apart. `ADR 0042` rule 4.
      if (v !== ABSENT) out[key] = v;
    }
    return out;
  }

  /**
   * **One reference, resolved against the projection** — `FD-C1`'s table, and the
   * half `FD-C3` shares with it.
   *
   * **Extracted by [W42](../../doc/work-items/w42-what-a-decision-sees.md) rather
   * than copied.** An EDGE's `needs` resolves by exactly these rules — same grammar,
   * same visibility predicate, same order, same per-key copy — and the ONE difference
   * is that an edge has no `"."` form, which is a property of the caller rather than
   * of this expression. *Two callers, one resolution, so a change to what a reference
   * means cannot mean two different things to a worker and to a predicate*, which is
   * the mechanism-invented-twice that
   * [P12](../../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)'s
   * *why this plan* exists to refuse.
   *
   * @throws UnresolvedReference — `FD-R3`.
   */
  private resolveReference(
    atNodeId: string,
    here: string,
    produced: Map<string, { path: string; result: unknown }[]>,
    key: string,
    t: { form: 'one' | 'all'; node: string; conditional: boolean },
    site: 'needs' | 'edge needs',
  ): unknown {
    // **Compatible, not equal.** An entry is visible to this node when their two
    // paths AGREE ON THE REGIONS THEIR TWO CHAINS SHARE — `FD-C1`, and
    // [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
    // rule 1. `ingest@-` is visible everywhere, `extract@1` is visible to
    // `merge@1.0`, and `merge@1.0` and `merge@1.1` are both visible to a node at
    // `-` after the join. That single predicate is what gives the `one` form and
    // the `all` form from one rule.
    //
    // **It REPLACES `isPathPrefix`, which was its special case** (ADR 0044 rule 2).
    // Where the two chains nest the regions they share are the shorter chain
    // entire, so the two pick out the same entries — measured, with L6 unmoved.
    // Where they do NOT nest, the prefix rule compared an index minted in one
    // region against an index minted in another and reported *visible* when the two
    // strings happened to match: `isPathPrefix('0','2')` and `isPathPrefix('2','0')`
    // are both false, so only the reflexive case ever fired.
    // [Q206](../../doc/questions/q206.md).
    //
    // **Two predicates would be two sources that can disagree**, which is ADR 0040
    // rule 2's own refusal, so the old one is gone rather than kept beside it.
    const visible = (produced.get(t.node) ?? [])
      .filter((e) => outputIsVisible(this.regions, atNodeId, here, t.node, e.path))
      .sort((x, y) => compareBranchPaths(x.path, y.path));
    if (visible.length === 0 && t.conditional) {
      // **`FD-C4` — the conditional form's whole effect, and it is asymmetric by
      // shape rather than by choice.** The `one` form has no value that could mean
      // *did not run*, because a task that ran and FAILED already resolves to
      // `null` — so it reports ABSENT and the caller omits the key. The `all` form
      // does: an array of zero outputs, which an author can iterate without a
      // guard. `ADR 0042` rule 4.
      return t.form === 'all' ? [] : ABSENT;
    }
    if (visible.length === 0) {
      throw new UnresolvedReference(
        `node "${atNodeId}" at branch path "${here}" declares ` +
          `\`${site}[${JSON.stringify(key)}]\` naming "${t.node}", and no output of that node is ` +
          'on this path. `FD-V27` checked that this node is reachable FROM it and `FD-V29` that ' +
          'it must have RUN, which is everything the graph can say; whether any of its outputs is ' +
          'on YOUR path is a statement about this run — a reader inside a region whose indices do ' +
          'not line up with the target`s, or a join policy that fired before that node settled. ' +
          'FD-R3.',
      );
    }
    // **Its own copy, per key** — `JP-R11`'s invariant applied to the one edge
    // that is not a fan-out edge: no two nodes ever receive the same object, and
    // a reference is the one way two nodes could otherwise be handed one record's
    // `result` twice.
    return t.form === 'all'
      ? visible.map((e) => cloneValue(e.result))
      : cloneValue(visible[0]!.result);
  }

  /**
   * **The value the run ENTERED with — the header's copy** (`RN-R15`, P38 fact 4 and (f)): taken at `start()` from the
   * caller's payload, or on a resume from the stored header, and held for the life of the run. What a `"$payload"`
   * reference composes from, in both doors; `FD-R4` hands the caller's own value instead, because it runs before the
   * header exists. Read only where a node or an edge composes the token — a run declaring none never clones it
   * (P38 decision 2). The header is set before the first `enter` in both doors, so `null` here is not a run.
   */
  private runPayload(): unknown {
    return this.header?.entryPayload;
  }

  /**
   * **What a decision sees, beyond its node's outcome** — `FD-C3`, and
   * [ADR 0041](../../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md).
   *
   * **`{}` for an edge that declares nothing, and the projection is not computed at
   * all in that case** — which is every edge in the corpus before W42, and is what
   * keeps ADR 0041 rule 1 true of the cost.
   *
   * **No `"."`, and `FD-V26` refuses it on an edge**: *what this predicate would have
   * received anyway* is `ctx.outcome`, which it already has. So there is no
   * `edgeValue` parameter here and none is derivable — see the call site. **A
   * `"$payload"` key needs none either** (v0.44, ADR 0117): it is not derived from what
   * the NODE received but read from the run's header, `runPayload()` above, its own
   * copy per key per read.
   *
   * @throws UnresolvedReference — `FD-R3`, from the same expression a node's does.
   */
  private resolveNeeds(
    node: FlowNode,
    edge: Edge,
    itemIndices: ReadonlyMap<string, number>,
  ): Readonly<Record<string, unknown>> {
    const needs = (edge as { needs?: Record<string, unknown> }).needs;
    if (!needs) return EMPTY_NEEDS;
    const here = this.pathOf(node.id, itemIndices);
    const produced = this.outputs();
    const out: Record<string, unknown> = {};
    for (const [key, ref] of Object.entries(needs)) {
      // `FD-V26` refuses a malformed reference, the `"."` form and — until W191 — `"$item"` on an edge, all at
      // construction, so the one node-less form a `Driver` accepts here is `"$payload"`. **Switched on by
      // `form`**: this read `referenceTarget(ref) as { … node: string … }` until v0.44, a cast that asserted no
      // node-less form could reach it — true while `"."` was the only one (P38 fact 9).
      const t = referenceTarget(ref)!;
      if (t.form === 'payload') {
        // **The run's payload, its own copy per key per read** — `FD-C3` v0.44, the same expression `compose`
        // uses, so `ctx.needs.run` and a worker's `input.run` mean one thing (ADR 0041 rule 4's *one resolver*).
        out[key] = cloneValue(this.runPayload());
        continue;
      }
      if (t.form === 'self' || t.form === 'item') {
        throw new Error(`node "${node.id}"'s edge declares needs[${JSON.stringify(key)}] = ${JSON.stringify(ref)}, which FD-V26 refuses on an edge`);
      }
      const v = this.resolveReference(node.id, here, produced, key, t, 'edge needs');
      // The same omission as `compose`'s, at the second site and by the same
      // expression, so `ctx.needs.f` and `payload.f` mean one thing — ADR 0041
      // rule 4's *one resolver* carried to what happens when it resolves to
      // nothing. A predicate reads `'f' in ctx.needs`.
      if (v !== ABSENT) out[key] = v;
    }
    // **FROZEN, and the same at both branches** — W42's adequacy reader. The shared
    // `EMPTY_NEEDS` was frozen and this was not, so a predicate writing to `ctx.needs`
    // THREW when its edge declared nothing and succeeded silently when it declared
    // something — and with the freeze gone, a write to the shared instance would be
    // read by the NEXT predicate. `ADR 0002` rule 4 asks a predicate to be pure and
    // nothing enforces it ([Q9](../../doc/questions/q9.md)); this does not enforce
    // purity either, it makes the ONE observable consequence uniform. `OR-R7`'s idiom.
    return Object.freeze(out);
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
    // **`RN-R29` — the hold, BEFORE the `dispatched` append** (ADR 0103 rule 2, P34 decision 8): a halted run appends
    // no dispatch. **REACHABLE, and not only a forward guard** — W172's adequacy reader: `enter` checks the hold at
    // its head and then calls `compose`, which for an entry declaring `needs: { v: "." }` clones the CALLER's payload
    // (`start()` hands `enter` the value it was called with), and a clone runs that payload's getters — consumer code
    // between the two checks, which can halt the run (`test/driver/hold.test.ts`). It is also the dispatch's own
    // door, which P34's pause (W175) widens with the replay's DEFER form below: a paused run's dispatch passes this check.
    //
    // **What it does NOT hold** (`RN-R29` (i)): a halt raised on THIS dispatch's own `dispatched` element, below — the
    // task is still handed on. P34's cancel and stop (W173, W174) must cancel such a task AFTER its hand-off, since a
    // scheduler's `cancel()` of an id it has not been handed resolves `false` and the task would then run (ADR 0103).
    // **W173 does, at the foot of this function** (`handOn`): the id is `unhanded` from before its element until `addTask` returns.
    // **W174 by WHEN its stop is taken**: a stop called on this stack is pending until the step ends, so the task is handed
    // on first and the stop cancels it at rest (`RN-R33`).
    if (this.shut()) return;
    const taskId = buildTaskId(runId, node.id, branchIndices(this.pathOf(node.id, itemIndices)), 0);

    // ID-R1 — the refusal, BEFORE addTask sees it. A duplicate means the validator
    // or this driver's path bookkeeping is wrong; continuing runs both tasks and
    // lands two outcome records under one key (spec/task-id.md section 2).
    if (this.dispatched.has(taskId)) {
      throw new DuplicateTaskId(`"${taskId}" was already dispatched in run "${runId}"`);
    }
    this.dispatched.add(taskId);
    // **`unhanded` from BEFORE the element** (`RN-R31`, W173): a consumer's callback on it can cancel the run, and
    // that cancel must not send the scheduler an id it does not hold yet. A replay's dispatch is HELD and never handed
    // here, so it is not marked: `cancel()` reads the whole replay as unhanded, and `resume()` hands it back.
    if (this.replay === null) this.unhanded.add(taskId);
    // Appended BEFORE `addTask`. `RN-R4` says a node absent from `nodes` was never
    // dispatched; a scheduler that settled a task inside `addTask` would otherwise
    // deliver the outcome before the dispatch that caused it.
    this.append({ kind: 'dispatched', taskId });

    // **W58 — the two fields a node says about its own task, passed through exactly as
    // `optional` is.** `retryPolicy` is the node's, whole, or the driver's default when the node
    // declares none (section 2's merge rule: the node WINS — and since `FD-V30` requires both
    // keys, a field-wise merge could not differ from this on a valid document; rule 8 measured
    // that, and the spec says so); `workerGroups`
    // is the node's alone — the scheduler unions it with the pool's, so there is no default to
    // merge. **Each key is present only when there is something to pass**, so a node that
    // declares nothing hands the factory the exact four-field object it did before this item:
    // `new FyflowTask` reads `undefined` and an absent key identically, and every L2-L5 fake
    // deep-compares the object it received.
    //
    // **W59 — a TYPED node, and `FD-C5`.** `!` rather than a guard, and the assertion is the point:
    // `FD-V32` refused every `type` the registry does not hold before a run existed, so the lookup
    // cannot miss for a definition a `Driver` accepted — `compose`'s own argument for
    // `referenceTarget(ref)!`. Three things change for a typed node and nothing changes for an
    // untyped one, to the byte:
    //   - the POOL is the type's, keyed by its name (`FD-V32`'s second clause);
    //   - the PAYLOAD is the envelope `{ settings, input }`: `settings` the node's effective
    //     settings as its OWN copy — `JP-R11`'s invariant one field over, since a map's N instances
    //     share one declaration — and `input` exactly the value an untyped node in this position
    //     would have been handed whole, which is `payload` as it arrives here from `compose`, a
    //     branch's copy, or a map instance's own item. **`input` is defined as the value received
    //     and never as what `needs` composed** (spec section 3, `FD-C5`), which is what leaves
    //     [Q251](../../doc/questions/q251.md)'s transform a place to sit;
    //   - the retry MERGE gains a middle level: the node's own policy, whole; else the type's; else
    //     the driver's default. `workerGroups` merges nothing — a type's groups are the pool's, and
    //     the scheduler unions those with the task's own (W58's measurement).
    //
    // **W61 — the envelope's THIRD key, present only when the node declares one, and the driver's
    // whole part in a transform.** `transform: { lang, expr }` rides on the envelope exactly as
    // declared, as its own copy (a definition is held by reference — Q259), `FD-C6`; `input` is
    // still the value RECEIVED, untransformed, because the driver dispatches inside a listener
    // with no `await` and a language's evaluator is async (P17 fact 1 and decision 1) — the TYPE's
    // worker wrapper is what evaluates it, and ladder L2 therefore cannot see a transformed value
    // (P17 prediction 3). A typed node declaring none is dispatched with the two-key envelope it
    // had at v0.17, to the byte (decision 8; W58's *a key is added only when present*).
    // **W65 — every task node is typed and every dispatch carries the envelope** (ADR 0054): `FD-V32`
    // refused a type the registry lacks, so the lookup cannot miss; the POOL KEY is the named instance
    // the node asked for, else the type's default instance, which is keyed by the type's name; and
    // `settings` is the type's defaults merged under the node's (decision 12, `effectiveSettings`).
    const type = this.nodeTypes.get(node.type)!;
    const retryPolicy = node.retryPolicy ?? type.retryPolicy ?? this.opts.defaultRetryPolicy;
    const config: TaskConfig = {
      id: taskId,
      workerType: node.pool ?? node.type,
      payload: { settings: cloneValue(effectiveSettings(node, type)), input: payload, ...(node.transform !== undefined ? { transform: cloneValue(node.transform) } : {}) },
      optional: node.optional === true,
      ...(retryPolicy !== undefined ? { retryPolicy } : {}),
      ...(node.workerGroups !== undefined ? { workerGroups: node.workerGroups } : {}),
    };
    // **HELD during a replay** (`RN-R19`): the stored run dispatched this already, and whether it runs
    // again is decided once the replay knows what is in flight (`RN-R21`). `createTask` is called at
    // release, so a factory sees exactly the tasks handed to a scheduler.
    if (this.replay !== null) {
      this.replay.held.set(taskId, config);
      return;
    }
    // **HELD by a PAUSE** (`RN-R35`, ADR 0106, W175) — the hold's DEFERRED form at this door (ADR 0103 rules 2 and 6):
    // the element is appended ABOVE, so the fold reads the task `running` and a stop leaves it in flight for a resume
    // (P34 fact 3), and `addTask` waits for the unpause. **And while an unpause is still handing the held tasks on**
    // (`pauseHeld` not empty, the run no longer paused): a dispatch made on that stack joins the END of the queue, so the
    // tasks reach the scheduler in dispatch order. A halt that broke that hand-off off is `shut()`, checked at the head.
    // **Not once a HALT or a CANCEL is on the run** (W175's conformity reader, D1): one raised on THIS task's own
    // `dispatched` element, above, came after `shut()` was read at the head — so the task is handed on, as `RN-R29` (i)
    // hands on the dispatch in progress, and a requested cancel then cancels it (`handOn`). Held here, after the cancel
    // had already released the hold, it would never be handed on, never settle, and the run would read `cancelling` for ever.
    if ((this.paused || this.pauseHeld.size > 0) && !this.shut()) {
      this.pauseHeld.set(taskId, config);
      this.unhanded.delete(taskId);
      return;
    }
    this.handOn(taskId, config);
  }

  /**
   * **A branch reached an ASK: it parks, keeping what reached it, and NOTHING is handed to the scheduler** — `RN-R37`,
   * v0.22, [ADR 0109](../../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md),
   * P35 stop-and-asks (b), (c) and (f), decision 5.
   *
   *   1. **The hold** (`RN-R29`), as `dispatch`'s: `enter` checked it at its head and `compose` ran consumer code since.
   *   2. **Its task id** by `spec/task-id.md`'s scheme, attempt `0` — the address a person's answer names. Minted once
   *      per path: a second `asked` at one id is `ID-R1`'s defect and refused as one (`DuplicateTaskId`), never a
   *      second park.
   *   3. **ONE `asked` element**, carrying `received` — what reached the ask, composed through its `needs` — as the
   *      driver's OWN deep copy: at the entry `received` is the caller's own `start()` payload, and a kept input must not
   *      move when the caller's object does (P35 (f)). No `dispatched` element, no `createTask`, no `addTask`: the ask is
   *      never in flight (`RN-R21`), so a stop cancels nothing for it and a resume re-dispatches nothing (P35 fact 5).
   *   4. **In a region, `branch.suspended`** — what a parked task emits (`settle`'s `user_action` arm): the branch is
   *      live and its join waits for the person (Q7), which is how an ask in a fan-out holds its join. AFTER the element,
   *      as the parked task's follows its settlement, and the hold checked between them (`RN-R29`): a consumer's
   *      callback on `asked` may halt the run, and a halted run emits nothing further. It may also ANSWER the ask: the
   *      answer is accepted and PENDING until the step ends (reading R4), so the park completes first.
   *
   * **During a replay this is how the park is REGENERATED** (`RN-R19`): the element is compared with the stored one,
   * input and all (`sameData`, `RN-R20`), so a replay that composes a different input is refused `diverged` here.
   */
  private ask(
    runId: string,
    node: FlowNode & { kind: 'ask' },
    received: unknown,
    itemIndices: ReadonlyMap<string, number>,
  ): void {
    if (this.shut()) return;
    const branchPath = this.pathOf(node.id, itemIndices);
    const taskId = buildTaskId(runId, node.id, branchIndices(branchPath), 0);
    if (this.asked.has(taskId) || this.dispatched.has(taskId)) {
      throw new DuplicateTaskId(`"${taskId}" was already asked in run "${runId}" — an ask's id is minted once per path (ID-R1)`);
    }
    this.asked.add(taskId);
    this.append({ kind: 'asked', taskId, input: cloneValue(received) });
    // An answer given on this step — even on the `asked` element's own callback — is PENDING until the step ends
    // (`resolve()`, `takeAnswer`), so the park always completes here and the resolution follows it at rest.
    if (this.shut()) return;
    const region = this.regionOf(node.id);
    if (region) {
      this.emit({ type: 'branch.suspended', regionId: region.fanoutId,
        regionPath: this.rpathOf(region, itemIndices), branchPath, at: node.id });
    }
  }

  /**
   * **`RS-R1`'s *suspended*, for one task id** — a dispatched task whose last record is a `user_action` settlement, or,
   * since v0.18 (`RN-R37`, ADR 0109), an ask this run reached that has no record at all. The FIVE readers of the
   * predicate read it here: `resolve()`, the replay's fed resolution, and the three `ended` refusals (`hasParked`).
   */
  private parked(taskId: string): boolean {
    return isSuspended(this.log, taskId, this.asked.has(taskId));
  }

  /**
   * **Whether anything in the run waits on a person** — a parked task or an unanswered ask. `cancel`, `stop` and `pause`
   * refuse a run `ended` only when nothing is in flight and THIS is false: a run whose only live node is a parked ask is
   * waiting on a person, not finished (P35 fact 5 (iv)). The rest of an ask under run control needs no line of its own:
   * never dispatched, it is never in flight, so every road reading `inFlight()` passes it by (`RN-R38`, W181).
   */
  private hasParked(): boolean {
    for (const id of this.dispatched) if (isSuspended(this.log, id)) return true;
    for (const id of this.asked) if (this.parked(id)) return true;
    return false;
  }

  /**
   * **Hand one task to the scheduler — and, if the run's owner cancelled it while the task was on its way, cancel it
   * at once** (`RN-R29` (i), `RN-R31`, ADR 0103's inherited hazard, W173). The ONE place `addTask` is called: by
   * `dispatch` for the task in progress, and by `resume()` for each task in flight. A cancel raised on this task's own
   * `dispatched` element — or on a resume's `resumed` element — ran before the scheduler held the id, and sent nothing
   * for it; this is where that task is cancelled, so it ends with a genuine `task.cancelled` rather than running.
   */
  private handOn(taskId: string, config: TaskConfig): void {
    try {
      this.opts.scheduler.addTask((this.opts.createTask ?? defaultCreateTask)(config));
    } finally {
      this.unhanded.delete(taskId);
    }
    // *Not a STOP's* (`RN-R33`, W174): a stop raised on this task's own `dispatched` element — or inside this `addTask` —
    // is PENDING until the step ends, and is taken at rest, where this task is handed on and `stop()` cancels it as one
    // of the tasks in flight. So a stop needs nothing here; `RN-R29` (i)'s hazard is closed by WHEN it is taken.
    if (this.cancelRequest !== null) this.cancelTask(taskId);
  }

  /**
   * **One task cancelled through the scheduler, with the request's options**, its promise kept for `cancel()` — or,
   * since W174, `stop()` — to wait on (`RN-R31`, `RN-R33`). Each option is passed only when the caller gave it, so an
   * absent `graceMs` is the pool's `cancelGraceMs` and not `undefined` read as a value. A cancel and a stop never both
   * hold — each refuses the other — so the one present is the one whose options these are.
   */
  private cancelTask(taskId: string): Promise<boolean> {
    const req = (this.cancelRequest ?? this.stopRequest)!;
    const options: { reason?: string; graceMs?: number } = {};
    if (req.reason !== undefined) options.reason = req.reason;
    if (req.graceMs !== undefined) options.graceMs = req.graceMs;
    const p = this.opts.scheduler.cancel!(taskId, options);
    // **The FIRST promise per task is the one kept** — a SECOND call's `cancel` of a task still stopping is the
    // scheduler's repeat, which returns the same promise; a double that returns another must not swap out the one the
    // first call's own promise is already waiting on (a promise read once cannot be re-read).
    if (!req.stopping.has(taskId)) req.stopping.set(taskId, p);
    // **Dropped once it settles**, so a run whose tasks have all stopped holds no promise: `RN-R13`'s terms do not move,
    // and a walk that serializes the driver's fields (`examples/run-flow.ts`) is not handed a value it refuses. Both
    // arms, so a double whose `cancel` rejects leaves no unhandled rejection behind this bookkeeping.
    const drop = () => { if (req.stopping.get(taskId) === p) req.stopping.delete(taskId); };
    p.then(drop, drop);
    return p;
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
      `map node "${node.id}" is declared \`over: ${JSON.stringify(node.over)}\`, ` +
        `and the value it received carries no array there — it is ${describeShape(v)}, on a payload ` +
        `that is ${describeShape(payload)}. A map's arity is a run-time fact, so no validator rule ` +
        'could have seen this: `FD-V25` checks that `over` is a key NAME. Return an array (an empty ' +
        'one is a lawful map of zero items), or the previous node did not produce what this flow says it does.',
    );
  }

  /**
   * **Drop one region's collection —
   * [ADR 0046](../../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
   * rule 3.** Called from the two arms of `settleJoin` and from nowhere else; the
   * run-level moment is `failRun`'s `arrivals.clear()`, which is a different fact.
   *
   * **A method rather than an inline `delete`, and the reason is `firedJoins`.**
   * The rule is *a region's collection lives from the first arrival until its join
   * becomes terminal*, and this repository has three call sites that decide
   * "terminal" — the two exits here and the guard in `enter`'s `join` arm. One named
   * expression is what lets a reader check that they agree; three `delete` calls are
   * three sources that can drift, which is
   * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
   * rule 2's own objection.
   *
   * **What it is NOT**: it does not touch `log`, `inputs`, `dispatched`, `joinState`
   * or `firedJoins`. `joinState` in particular stays, because `joinStatusOf` is a
   * public accessor a consumer may call after the join has settled, and because a
   * policy's state is what `describe` reads. What leaves is the one structure P15
   * fact 3 measured as a SECOND COPY — 49.8% of a region-bearing run, aliasing
   * neither the log record's `result` nor the worker's own object.
   */
  private releaseArrivals(fanoutId: string, rp: string): void {
    this.arrivals.get(fanoutId)?.delete(rp);
    // The opener's own entry goes when its last instance's does, so a run that
    // released every instance holds no key at all rather than N empty maps —
    // which is what makes `RN-R13`'s "released" observable as an absence.
    if (this.arrivals.get(fanoutId)?.size === 0) this.arrivals.delete(fanoutId);
  }

  /** The arrival map for one region, created on first arrival. */
  private arrivalsOf(fanoutId: string, rp: string): Map<string, unknown> {
    const byPath = this.arrivals.get(fanoutId) ?? new Map<string, Map<string, unknown>>();
    this.arrivals.set(fanoutId, byPath);
    const existing = byPath.get(rp);
    if (existing) return existing;
    const fresh = new Map<string, unknown>();
    byPath.set(rp, fresh);
    return fresh;
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
  /* ---- region INSTANCE accessors — ADR 0062 --------------------------------
   * A region instance is `(opener node id, the opener's own branchPath)`. The
   * path is derived by the existing `pathOf`/`branchPathOf` from the
   * `itemIndices` the driver already threads, so **no call site gains a
   * parameter and no second region-chain walk is added** — which is the whole of
   * why key (b) was taken over the minimal sufficient qualifier.
   *
   * **Nothing here builds a composite string.** The pair is carried as a pair, at
   * every level, in all three structures and in both fold inputs. A composite was
   * built and run: `joinStatusOf` returned `null` for every nested region and
   * three more lookups returned `[]`, twelve silent modes in all, because a
   * mis-derived composite is a string a `Map.get` simply misses.
   */
  private rpathOf(region: RegionSets, m: ReadonlyMap<string, number> = EMPTY_INDICES): string {
    return this.pathOf(region.fanoutId, m);
  }

  /* **TWO EQUIVALENT DERIVATIONS of this value exist and neither is a defect** — W84's
   * adequacy reader, finding 6, and they are recorded rather than guarded because
   * `doc/workflow.md` v0.22's own test asks for the TREE on which a claim fails and
   * neither has one.
   *
   *   - `region.joinId` in place of `region.fanoutId`: a region's join is never a
   *     MEMBER of that region (`src/definition/regions.ts`: *J is not a member*), so
   *     `innermostRegionOf` gives both the same enclosing region. Measured over the
   *     21 regions of `spec/examples/valid` and `spec/examples/wiring`: **0 where the
   *     two differ.** Swapping it costs 0 at every rung.
   *   - deriving `regionPath` from the EVENT's own `branchPath` by dropping its last
   *     segment: a branch entry's path is always its instance's path plus one segment,
   *     so the two agree by construction. Costs 0 at every rung.
   *
   * *Both are survivors of a provenance probe whose mutation is semantically
   * equivalent, which rule 8's own definition says is not a survivor.* What they cost
   * is INDEPENDENCE: an assertion comparing `regionPath` with `branchPath` is a
   * tautology under the second, which is why the suite's binding is the DOCUMENT-derived
   * key in `test/matrix/chain.test.ts` and not that comparison.
   */

  private joinStateGet(id: string, rp: string): unknown {
    return this.joinState.get(id)?.get(rp);
  }

  private joinStateHas(id: string, rp: string): boolean {
    return this.joinState.get(id)?.has(rp) ?? false;
  }

  private joinStateSet(id: string, rp: string, v: unknown): void {
    const byPath = this.joinState.get(id) ?? new Map<string, unknown>();
    byPath.set(rp, v);
    this.joinState.set(id, byPath);
  }

  private firedHas(id: string, rp: string): boolean {
    return this.firedJoins.get(id)?.has(rp) ?? false;
  }

  private firedAdd(id: string, rp: string): void {
    const s = this.firedJoins.get(id) ?? new Set<string>();
    s.add(rp);
    this.firedJoins.set(id, s);
  }
  /* ------------------------------------------------------------------------- */

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
  private append(input: FoldInput): number {
    // **`RN-R18` — the position is the index `push` gave this element, read from `push` itself**
    // rather than from a length read before or after, so a re-entrant `onFoldInput` that appends
    // again (the `failRun` door on the stack, `OR-R10`) cannot shift the number already chosen.
    const seq = this.inputs.push(input) - 1;
    if (input.kind === 'outcome' || input.kind === 'resolution') this.log.push(input.record);
    // **`RN-R20` — the PREFIX check, at the one place every element passes.** During a replay, an
    // element at a position the stored events cover is the stored one or the resume is refused there:
    // a FED element must be appended at the very position it was fed from, and a REGENERATED one must
    // be the stored element as data. Past the stored events nothing is compared — that is the lost tail.
    const replay = this.replay;
    if (replay !== null && seq < replay.stored.length) {
      const same = isFed(input) ? replay.feeding === seq && input.kind === replay.stored[seq]?.kind : sameData(input, replay.stored[seq]);
      if (!same) throw this.diverged(seq, 'a different element there');
    }
    if (this.opts.onFoldInput && this.delivers(seq)) this.opts.onFoldInput(freezeInput(input), seq);
    return seq;
  }

  /**
   * **A stored `interrupted` element, fed** (`RN-R19`, `RN-R32`): the replay holds as the stopped run was held — the hold
   * BEFORE the element, as a stop is taken — and appends the element as stored. Neither `deaf` nor a cancel nor the
   * collections' release: those were the stopped driver's, and a replay hands a scheduler nothing.
   */
  private feedInterrupted(e: Extract<FoldInput, { kind: 'interrupted' }>): void {
    this.stopRequest = { actor: e.actor, stopping: new Map(), pending: null, took: null };
    this.append({ kind: 'interrupted', actor: e.actor, reason: e.reason ?? null });
  }

  private emit(e: RegionEvent): void {
    const policy = this.opts.joinPolicy;
    // `has`, not `!== undefined`: `S` is the policy's own opaque state type and
    // `undefined` is a legal value of it. An `open()` returning `undefined` used to
    // silently disable the whole seam — no event reached `step`, the join never
    // fired, and `joinStatusOf` reported "not entered" about a region that was.
    if (policy && this.joinStateHas(e.regionId, e.regionPath)) {
      this.joinStateSet(e.regionId, e.regionPath, policy.step(this.joinStateGet(e.regionId, e.regionPath), e));
    }
    // **`OR-R7` and ADR 0014 — every value the driver hands outward is a frozen
    // copy, and `onRegionEvent` was the one path that was not** ([Q73](../../doc/questions/q73.md)).
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
    const seq = this.append({ kind: 'region', event });
    if (this.delivers(seq)) this.opts.onRegionEvent?.(event);
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
    const rp = this.rpathOf(region, itemIndices);
    if (!policy || this.firedHas(region.fanoutId, rp)) return;
    if (!this.joinStateHas(region.fanoutId, rp)) return;
    const state = this.joinStateGet(region.fanoutId, rp);

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
      this.firedAdd(region.fanoutId, rp);
      // **[ADR 0046](../../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
      // rule 3 — the latch on the line above is the whole of the argument.** This
      // arm routes nowhere, so it never reads the collection at all; and once
      // `firedJoins` holds this region, every later `settleJoin` for it returns at
      // the first guard and the `join` arm of `enter` records nothing more. Nothing
      // can reach the region's arrivals again, so they are released here.
      //
      // **This is the half a release at the SATISFIED exit does not cover**, and it
      // is the reachable part of the case P15 fact 3 records as the exception: a
      // region whose join never fires holds its arrivals for the life of the run.
      // A policy reporting `unsatisfiable` is the one such region the driver is
      // TOLD about. The rest — a region nothing ever settles — is the bound rather
      // than a leak, and ADR 0046 rule 5 says why the driver cannot know.
      this.releaseArrivals(region.fanoutId, rp);
      // ADR 0015 — the join is settled and it did NOT fire. Nothing downstream of
      // it will ever be dispatched, which is what makes the run `stuck` rather
      // than `completed`.
      const settledAt = this.append({ kind: 'joinSettled', regionId: region.fanoutId, regionPath: rp,
        joinId: region.joinId, fired: false });
      if (this.delivers(settledAt)) this.opts.onUnsatisfiableJoin?.({
        fanoutId: region.fanoutId,
        // **The INSTANCE, not just the opener** - W84. Under nesting one
        // `fanoutId` names N joins and a report carrying only the id cannot say
        // which of them died. That is `RegionEvent`'s own argument at the one
        // other place a region is named to a consumer, and W33's comment named
        // `onUnsatisfiableJoin` beside `joinStatusOf` as a thing this decision
        // reaches. Additive: a consumer reading the four fields it had is unmoved.
        regionPath: rp,
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
      // [Q114](../../doc/questions/q114.md) one item earlier, where the join's
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
          regionPath: this.rpathOf(enclosing, itemIndices),
          branchPath: this.pathOf(region.fanoutId, itemIndices),
          reason: 'failed',
        });
        this.settleJoin(runId, enclosing, itemIndices);
      }
      return;
    }

    // satisfied — route out of the join, exactly once.
    this.firedAdd(region.fanoutId, rp);
    // **ADR 0015.** Appended before the routing it authorises, so a fold that
    // reads the sequence sees the join fire and *then* sees what it dispatched.
    //
    // This is what [Q43](../../doc/questions/q43.md) needed and what its register
    // entry said was already there: on `p1-routed-away` **both policies produce
    // the same `regions` value** — every branch settles under both — and the only
    // difference is whether this line was reached. Without it a permanently stuck
    // run and a completed one are the same fold.
    //
    // It records what the DRIVER did, not what a policy concluded, which is why it
    // does not violate `RN-R6`: `fired` is "routing left the join", an action, and
    // the same two policies over the same events still produce identical `regions`.
    this.append({ kind: 'joinSettled', regionId: region.fanoutId, regionPath: rp,
      joinId: region.joinId, fired: true });
    // **`OR-R10` on the one door into this function that is already OPEN — W53's
    // conformity reader.** The three doors into `settleJoin` are all shut behind
    // `this.failed`, and the argument in `failRun` enumerates them correctly; what it
    // missed is the door on the STACK. `append` calls `this.opts.onFoldInput`
    // un-wrapped, so a re-entrant listener can reach `failRun` from the line above —
    // and `failRun` is exactly where every region's collection is released.
    //
    // **W53 did not create the defect; it made it SILENT, which is worse.** A halted
    // run routing out of a join at all is `OR-R10`'s own violation and pre-dates this
    // item. Before W53 the successor was dispatched with the full collection; after
    // it, measured on one flow with one re-entrant listener, the successor is
    // dispatched with **`{}`** — a run that has been halted, handing a node an empty
    // object that looks like `live-token`'s legitimate all-exited case.
    //
    // **Costs 0 at L1-L5 and 0 at L6**, and it tightens an existing rule rather than
    // relaxing one: `OR-R10` already says the driver has stopped routing this run.
    // **And a CANCEL can arrive on the same stack** (`RN-R28`, W158): `cancel()` of a task still WAITING fires
    // `task.cancelled` synchronously, so a re-entrant listener that cancels one halts the run here too. Since W172
    // this is one of `RN-R29`'s checks of the ONE hold every halt shares (`shut()`, ADR 0103). **Since W172 it is also
    // SUBSUMED for routing** — the `enter` below checks the hold at its head — and is kept, stated, as belt and braces:
    // it returns before the collection is read and released, which `failRun` and a cancel release already (W172's
    // adequacy reader measured its deletion equivalent).
    if (this.shut()) return;
    // **The collection is read ONCE and the region is released in the same breath —
    // [ADR 0046](../../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
    // rule 3.** `collectArrivals` is a pure projection of the map, so hoisting it
    // above the `join` lookup below changes nothing about what travels; what it buys
    // is that the read and the release are one pair of adjacent lines with no
    // early return between them, which is what makes *released when the join becomes
    // terminal* a property of this function rather than of the path taken through it.
    //
    // **The ORDER is the whole rule and it has a measured negative control**: this
    // release AFTER the read costs 0 failures at L1-L5 and 0 at L6; moved BEFORE it,
    // the join carries `{}` and L1-L5 reports **14** on the tree this item ships —
    // **13** on the suite as it stood before W53, the fourteenth being this item's
    // own `the release is AFTER the read`. P15 fact 3, re-run by W53 and re-taken
    // at its readers (`doc/workflow.md` section 1 rule 5's WHEN clause: three
    // copies of this number said 13 and the register row already said both).
    //
    // **Why it is safe to release before `enter` runs**: `enter` dispatches the
    // join's successor, which is outside this region or in the enclosing one, and
    // `firedJoins` already holds this region — so no path out of that call can read
    // or refill what is dropped here.
    const collected = collectArrivals(this.arrivals.get(region.fanoutId)?.get(rp));
    this.releaseArrivals(region.fanoutId, rp);
    const join = this.graph.byId.get(region.joinId);
    if (!join || join.kind !== 'join') return;
    const edge = join.edges?.[0];
    // **The join carries the arrived branches' results, keyed by `branchPath`** —
    // `JP-R12`, [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
    // rule 4, answering [Q36](../../doc/questions/q36.md).
    //
    // **This paragraph read *"the join passes `null`, deliberately"* and the reason
    // it gave was correct**: `settleJoin` is reached from three sites with three
    // different payloads, and *which one arrives* is decided by fan-out completion
    // order — which `doc/concept.md` section 5 calls genuinely non-deterministic and
    // `CLAUDE.md` says nothing may depend on. A join forwarding "whichever branch
    // finished last" makes a run's DATA order-dependent, which is worse than a flaky
    // test: it is a flaky result.
    //
    // **The answer is that the order-dependence is in *which one*, and this carries
    // ALL of them.** A collection keyed by the branch each value arrived on is the
    // same value whatever order the branches settled in, so the constraint is
    // satisfied by construction rather than by refusing to carry anything — and
    // **`settleJoin` still takes no payload parameter**, which is the guard that has
    // kept this a question rather than a convention. The arrivals are recorded in
    // the `join` arm of `enter` as they happen and read here as a whole.
    //
    // **`collectArrivals` pins the KEY ORDER, and that is not decoration.** The
    // order-dependence does not vanish when the payload is keyed; it moves. Measured:
    // integer-like keys are re-ordered ascending by the language, so a depth-1 join
    // is deterministic for free, while **dotted keys keep insertion order — which
    // for a join is settlement order.** Invisible at depth 1 and live at depth 2,
    // which is W21's and W22's shape a third time in this tree.
    //
    // A join nothing arrived at carries `{}`. `live-token` fires over an all-exited
    // region, so that case is live rather than defensive.
    // **The join's exit carries the path its REGION sits at — [Q114](../../doc/questions/q114.md),
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
    // **The PAYLOAD was a different question when W21 wrote this, and it is
    // answered now** — [Q36](../../doc/questions/q36.md), `JP-R12`, and the
    // `collectArrivals` call below. This comment read *"The `null` PAYLOAD is
    // untouched"*, which stopped being true twenty lines up. W34's conformity
    // reader. What W21's paragraph is still about is unchanged: it fixes which
    // BRANCH the arrival is attributed to, and not what travels with it.
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
        runId, edge.to, collected,
        this.pathOf(region.fanoutId, itemIndices),
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
   * **The fold's input sequence — ADR 0014, and [Q41](../../doc/questions/q41.md)'s
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

  /**
   * **The run, as plain data a consumer can store and a resume can start from** — `RN-R14` to
   * `RN-R17`, [ADR 0064](../../doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md),
   * P23 decisions 2-5. `events` is exactly `foldInputs()` at this moment; `header` is the five facts
   * the events cannot regenerate.
   *
   * **A COPY, not a reference — decided on a measurement** (W88's declaration step, P23 fact 6's
   * run): at 10 000 tasks the copy costs 22 / 24 / 61 ms at 16 B / 1 KiB / 16 KiB results and holds
   * one more copy of the events while the caller keeps it, where handing out the driver's own array
   * costs 0.1-0.3 ms and shares every result. The reference is refused on the contract rather than
   * on the price: a caller writing into a result it was handed would rewrite the run (`OR-R7`), and
   * P23 decision 5 says a checkpoint holds no live reference. *The copy is ~0.5-1.2x of the
   * `v8.serialize` a store pays on whichever it is handed*, and a consumer keeping a store current
   * does it by APPENDING `onFoldInput`'s elements (`RN-R18`), not by calling this repeatedly.
   *
   * @throws NotStarted — before `start()`: there is no run, and no entry payload to put in a header.
   */
  checkpoint(): Checkpoint {
    const h = this.header;
    if (h === null) {
      throw new NotStarted(
        `driver for run "${this.runId}" holds no run to checkpoint — it has not started, or its resume was refused. ` +
          'RN-R14: a checkpoint is a header and the whole event sequence, and the header\'s entry payload is the value ' +
          'start() was called with (or a resumed checkpoint carried) — call start() first; a driver whose resume was refused is spent (RN-R23).',
      );
    }
    return Object.freeze({
      header: Object.freeze({ ...h, entryPayload: structuredClone(h.entryPayload) }),
      events: this.foldInputs(),
    });
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
   * What the join policy currently says, per region INSTANCE. `null` when there is
   * no policy, the instance has not been entered, or no single instance is named.
   *
   * `spec/join-policy.md` section 4 assigns W3 *"how it detects a stuck one when
   * no policy says so"* — and neither pinned policy ever returns `unsatisfiable`,
   * so this accessor is the whole of that detection today. Anything more is
   * [Q7](../../doc/questions/q7.md), which is W4's.
   */
  /**
   * **`regionPath` is OPTIONAL and its absence means THE SOLE INSTANCE** - W84.
   * Every region any flow could express before W84 has exactly one instance, so a
   * caller that never heard of nesting keeps working AND keeps getting the same
   * answer, which is ADR 0062 rule 3 reaching the read side. **With N instances
   * and no path there is no sole one**, so the caller is told `null` rather than
   * told one of the N: picking would make the answer depend on Map insertion
   * order, which is dispatch order, which is exactly the order-dependence
   * `settleJoin`'s bare signature exists to refuse.
   *
   * *(The composite-string design returned `null` here for EVERY nested region and
   * nothing typed could see it - nine of the twelve silent failure modes that road
   * was measured to have, and the sharpest single argument for this one.)*
   */
  joinStatusOf(fanoutId: string, regionPath?: string): { status: string; describe: unknown } | null {
    const policy = this.opts.joinPolicy;
    const byPath = this.joinState.get(fanoutId);
    if (!policy || !byPath) return null;
    const rp = regionPath ?? (byPath.size === 1 ? [...byPath.keys()][0]! : undefined);
    if (rp === undefined || !byPath.has(rp)) return null;
    const state = byPath.get(rp);
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
