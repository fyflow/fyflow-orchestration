/**
 * Ladder **L6** — one real run, on a real `FyflowScheduler`, with real workers.
 *
 * This is the only code in the repository that DRIVES the library end to end. Everything
 * under `src/` talks to `SchedulerLike`, a structural interface with two methods
 * (`ADR 0001`); since [ADR 0048](../doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
 * the published package also DEPENDS on the scheduler — a peer dependency, and one import
 * in `src/driver/driver.ts` for the default `createTask` — which is why this harness no
 * longer writes that factory itself. *(This read ADR 0013 rule 1's "depends on the scheduler
 * **not at all**" from W5 until W57 superseded that rule.)*
 *
 * ## How a run is known to be over, with no clock
 *
 * The hard question at L6, and the three obvious answers are all wrong:
 * `scheduler.completed` fires **every time the scheduler drains** and will fire
 * between the steps of any flow; `stats` reads `queued=0 running=0` for a
 * scheduler that is genuinely stalled (`AGENTS.md`, the `idleTimeout: 0` note);
 * and a `setTimeout` is how a green L6 gets written that proves nothing.
 *
 * So: fold the driver's own input sequence as it arrives
 * ([ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md))
 * and stop when `isTerminal(state)` — `RN-R12`. That is decidable, needs no
 * clock, and is the repository's central invariant applied to a real run for the
 * first time.
 *
 * **Read at the end of the driver's turn, never mid-turn.** The fold is total
 * over any prefix (`RN-R2`) and a mid-turn prefix is not a run's resting state: a
 * settlement is appended before the routing it causes, so between `ingest`
 * settling and its successor being dispatched there is momentarily nothing
 * running, and between the last branch arriving and the join firing the state is
 * momentarily `stuck`. Both are artefacts of reading a prefix inside a
 * synchronous turn. `queueMicrotask` is exactly the right boundary — the driver
 * routes synchronously inside the scheduler's listener, so a microtask queued
 * during that turn runs after all of it — and it is a **boundary, not a
 * timeout**.
 *
 * The wall-clock backstop below is not how the run is detected. It exists so a
 * hang is **reported** rather than hung on, and reaching it is a failure —
 * **except on the one row whose declared result it is**: a run parked on a person
 * cannot finish, because `RN-R12` makes `awaiting_action` non-terminal, so
 * asserting `finishedBy === 'backstop'` there is asserting that rule's negative
 * half. `Expectation.expectBackstop` marks it.
 */
// Everything from the package entry, never from `src/` — an example that reached
// past `index.ts` would be exercising a surface no consumer has.
import {
  Driver, branchIndices, buildTaskId, emptyState, isTerminal, step,
  type FlowDefinition, type FoldInput, type JoinPolicy, type LogRecord,
  type Predicate, type RunOutcome, type RunState, type UnmintedTask,
  type UnsatisfiableJoin,
} from '../index.ts';
import { ConcurrentLimitGroup, FyflowScheduler, FyflowTask } from 'fyflow-scheduler';
// **The SUB-PATH, by its published entry — W59.** `fyflow-orchestration/scheduler` is the one
// module of this package that constructs scheduler objects, and this file reaches it exactly as
// a consumer does: through the sub-path's entry and never a file under it. The reaches-past-index
// clause in `l6.ts` exempts this one path by name, because it IS a consumer surface.
import { bootstrap } from '../src/scheduler/index.ts';
// **The SECOND sub-path, by its published entry — W63.** `fyflow-orchestration/jsonata` is the
// language a `transform` names, reached here exactly as a consumer reaches it (ADR 0052 rule 3);
// the reaches-past-index clause in `l6.ts` exempts this entry by name as it does the one above.
import { jsonata } from '../src/jsonata/index.ts';
import type { NodeTypeDeclaration, WorkerEntry } from '../index.ts';

/**
 * **The languages a `transform.lang` may name at this rung, and the ONE object both the helper
 * and every driver read — W63, ADR 0051 rules 2 and 4.** `buildScheduler` hands it to `bootstrap`
 * beside the flows a scheduler will run, so the adapter's WORKER half (its module URL) is written
 * into a typed pool's config only for a type some node of those flows transforms on; `runFlow`
 * hands the same object to the `Driver`, whose registry half (`compile`) refuses an expression at
 * construction (`FD-V36`). One object, two readers, as `NODE_TYPES` is. Exported so `l6.ts` can
 * compare its keys to the languages the flows NAME, both ways (rule 8 obligation (e)).
 */
export const LANGUAGES = { jsonata } as const;

/**
 * **This module's realm, marked so a worker can say whether it shares it — W63, W62's mechanism one
 * rung up.** The `echo` role reports `realm: 'harness'` when it sees this mark and `'thread'` when it
 * does not; an inline pool runs its worker here and a threaded pool in a fresh realm, so a row
 * expecting `'thread'` is red the moment the `Echo` pool is made inline. Before this the header's
 * *"a real THREAD in both runtimes"* was a configuration nothing read (the adequacy reader, M5).
 */
(globalThis as Record<string, unknown>).__L6_HARNESS_REALM__ = 1;
// **The worker file`s own role list, imported rather than repeated** — W43. See
// `ROLES` there: three lists said the same seven things and nothing compared them.
import type { Role } from './workers/flow-worker.ts';

/**
 * **The ONE worker entry every pool here runs, and the THIRTEEN node types this rung registers over
 * it — W65 (ADR 0054), where W59's two types and W43's eleven `pool()` lines became one registry.**
 * Every task node names a type since v0.19 and every pool is fronted by the package's envelope
 * worker, so the eleven pools `buildScheduler` used to construct by hand are document-declared types
 * now — one per former pool key, each with its role in its `config` — and `bootstrap` builds every
 * pool through the identity derivation. *(This read "thirteen pools … eleven by `pool()` and two by
 * the bootstrap helper" from W63; there is no `pool()` call left in this file.)*
 *
 * **One object, two readers, as before**: `buildScheduler` hands `registryFor(delayMs, threaded)` —
 * this literal with the run's delay and threading written into the eleven role types' config and
 * `inline` — to `bootstrap`, and `runFlow` hands the SAME sections to the `Driver`, so the type a
 * document names, the pool the scheduler holds and the schema the driver applies cannot be three
 * copies. Exported so `l6.ts` can compare the keys to the types the flows NAME and to the pools the
 * scheduler REPORTS, both ways (rule 8 obligation (e)).
 *
 * **What `registryFor` changes and what it does not.** A role type whose `config` carries `delayMs`
 * gets the run's delay — four times over for the roles that must settle LAST (see `SETTLES_LAST`
 * below) — and `inline: !threaded` where the type declares no `inline`. `Echo` and `Scorer` carry no
 * `delayMs` and declare `inline`, so they are handed to the helper byte-identical to their
 * declaration here, which is what keeps P18 fact 5's capture — and the typed rows of P16 and P17 —
 * unmoved (prediction 2).
 *
 * `Scorer` is one type, deliberately: P16's exit artifact is *two nodes of ONE type with DIFFERENT
 * settings*, and a second type would let a row pass on the type rather than on the settings.
 * **Inline**, for `retry`'s reason — the `typed` role's first-attempt memo is per process.
 * `groups: ['scorer']` is the group every task of the type holds, registered through the helper
 * and read back off `scheduler.groups` like `gate`. `retryPolicy` is the TYPE's, and it is what
 * `typed.flow.json`'s `high` node retries under — the node declares none. **Its settings are what
 * the `flow` worker's `settingsSchema` admits**: `factor` a number, `failFirst` a boolean, `scale`
 * a number (the `Echo` type's one key), and no other key — a typo in any is refused at construction
 * (`FD-V33`), where W59 had a function per type.
 *
 * **`Echo` is W63's, and it is THREADED on purpose**: P17's exit artifact is a declared `transform`
 * evaluated in the type's wrapper, and the adapter's worker half reaches a pool as a MODULE URL
 * because a function cannot cross to a thread (P17 fact 7) — so the pool that evaluates it here is a
 * real thread in both L6 runtimes, loading `fyflow-orchestration/jsonata` by that URL, **and every
 * result the role returns says so** (`realm: 'thread'`, the mark above unseen). Its role echoes what
 * it received. No groups, and `retryPolicy` of ONE retry, so a transform that fails at run time is
 * evaluated AGAIN under the type's policy and parks the task on its second attempt, `attempts: 1`
 * on both observers.
 */
const WORKER_URL = new URL('./workers/flow-worker.ts', import.meta.url).href;

/** The one worker: every pool loads it; its `settingsSchema` is what `FD-V33` applies to every typed node's settings. */
export const WORKERS: Readonly<Record<string, WorkerEntry>> = {
  flow: {
    url: WORKER_URL,
    settingsSchema: { type: 'object', properties: { factor: { type: 'number' }, failFirst: { type: 'boolean' }, scale: { type: 'number', minimum: 0 } }, additionalProperties: false },
  },
};

/**
 * **A role that must settle LAST is given a longer delay**, so the branch that arrives is not the
 * branch that finishes. Without it, `settleJoin` on the `lost` and `exited` paths is unreachable at
 * L6 — the arriving branch always settled last and the join was always fired by the arrival, so
 * deleting either of the other two calls was invisible across twelve rows. Found by W6's adequacy
 * reader. This ARRANGES an order rather than depending on one (`doc/workflow.md` section 5 rule 5).
 * **The 4x is INERT today and W17's adequacy reader measured it** — the settling order those rows
 * depend on is produced by inline dispatch order — and it is kept because the moment a pool becomes
 * threaded, dispatch order stops implying settle order. [Q99](../doc/open-questions.md).
 */
const SETTLES_LAST = new Set<Role>(['fail', 'uncloneable']);

export const NODE_TYPES: Readonly<Record<string, NodeTypeDeclaration>> = {
  // ---- the eleven former pool() lines, one type each; `delayMs` and (where absent) `inline` are the run's — see registryFor ----
  IngestWorker: { worker: 'flow', inline: true, config: { role: 'ingest', delayMs: 5 }, pool: { maxThreads: 1, idleTimeout: 0 } },
  // The fan-out pool, and the only one that may run on real threads: it is the one place two tasks
  // are in flight at once, so it is where a dispatch race or an id collision would show.
  ScoreWorker: { worker: 'flow', config: { role: 'score', delayMs: 5 }, pool: { maxThreads: 2, idleTimeout: 0 } },
  PublishWorker: { worker: 'flow', inline: true, config: { role: 'publish', delayMs: 5 }, pool: { maxThreads: 1, idleTimeout: 0 } },
  // **Where a map's arity comes from — W35.** Its worker returns an array and the run dispatches one
  // task per element. Inline: it runs once per run and a thread would only add a hop.
  SplitWorker: { worker: 'flow', inline: true, config: { role: 'split', delayMs: 5 }, pool: { maxThreads: 1, idleTimeout: 0 } },
  // **W43's pool, THREADED for the same reason `ScoreWorker` is** — `maxThreads: 2` at an arity of
  // three makes the overlap real. Not held down by an assertion (W43's adequacy reader; Q99).
  WeighWorker: { worker: 'flow', config: { role: 'weigh', delayMs: 5 }, pool: { maxThreads: 2, idleTimeout: 0 } },
  // **The one worker here that MUTATES its payload — W35's adequacy reader.** Inline, and it must be:
  // two map instances handed one object would see each other's write, and a thread would hide it.
  TallyWorker: { worker: 'flow', inline: true, config: { role: 'tally', delayMs: 5 }, pool: { maxThreads: 1, idleTimeout: 0 } },
  // **W45's pool.** Inline; its role reports whether a conditional reference's key ARRIVED (`FD-C4`).
  AttestWorker: { worker: 'flow', inline: true, config: { role: 'attest', delayMs: 5 }, pool: { maxThreads: 1, idleTimeout: 0 } },
  // Reached only by a flow that names them. Their worker always throws — and what that produces is
  // decided by the NODE: `optional: true` settles `failed`, `optional: false` ends in `user_action`.
  ReviewWorker: { worker: 'flow', inline: true, config: { role: 'fail', delayMs: 5 }, pool: { maxThreads: 1, idleTimeout: 0 } },
  ExtractWorker: { worker: 'flow', inline: true, config: { role: 'fail', delayMs: 5 }, pool: { maxThreads: 1, idleTimeout: 0 } },
  // **Inline, and it must be.** A result `structuredClone` refuses reaches the driver intact from an
  // inline pool, which is what makes `OR-R6` reachable at all ([Q61](../doc/open-questions.md)).
  MergeWorker: { worker: 'flow', inline: true, config: { role: 'uncloneable', delayMs: 5 }, pool: { maxThreads: 1, idleTimeout: 0 } },
  // **W58's pool, inline because its memo is per process** — see `thrownOnce` in the worker.
  RetryWorker: { worker: 'flow', inline: true, config: { role: 'retry', delayMs: 5 }, pool: { maxThreads: 1, idleTimeout: 0 } },
  // ---- W63's and W59's types, byte-identical to their v0.18 declarations (P18 fact 5) ----
  Echo: {
    worker: 'flow',
    inline: false,
    config: { role: 'echo' },
    pool: { maxThreads: 2, idleTimeout: 0 },
    retryPolicy: { maxRetries: 1, backoffMs: 0 },
  },
  Scorer: {
    worker: 'flow',
    inline: true,
    config: { role: 'typed' },
    pool: { maxThreads: 2, idleTimeout: 0 },
    groups: ['scorer'],
    retryPolicy: { maxRetries: 1, backoffMs: 0 },
  },
};

/** No named pool instance at this rung yet — W67's sample flow brings the first. Declared so the driver and the helper read one shape. */
export const POOLS: Readonly<Record<string, { type: string; config?: unknown }>> = {};

/** `NODE_TYPES` with the run's delay and threading written into the role types' config and `inline` — the object `bootstrap` builds from. */
export function registryFor(delayMs: number, threaded: boolean): { workers: typeof WORKERS; nodeTypes: Record<string, NodeTypeDeclaration>; pools: typeof POOLS } {
  const nodeTypes: Record<string, NodeTypeDeclaration> = {};
  for (const [name, t] of Object.entries(NODE_TYPES)) {
    const cfg = t.config as { role: Role; delayMs?: number };
    if (cfg.delayMs === undefined) { nodeTypes[name] = t; continue; }
    nodeTypes[name] = {
      ...t,
      inline: t.inline ?? !threaded,
      config: { ...cfg, delayMs: SETTLES_LAST.has(cfg.role) ? delayMs * 4 : delayMs },
    };
  }
  return { workers: WORKERS, nodeTypes, pools: POOLS };
}

/**
 * **What the driver was still holding, observed at the two ends of `JP-R12`'s
 * window** — [W55](../doc/work-items/w55-a-run-at-scale-on-real-workers.md), and it is
 * [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)'s
 * only observable.
 *
 * **A footprint is REPORTED; what is ASSERTED is the RELATION** — this item's own
 * `Tests:` line, and [Q179](../doc/open-questions.md) is why: a byte count is a
 * property of one run on one machine, and the rule is about *which structures hold a
 * result and for how long*. So the two ENTRY counts below are what `examples/l6.ts`
 * asserts, and the two BYTE counts are what `examples/retention.ts` prints.
 *
 * **`bytesBeforeRelease` is a RECONSTRUCTION and says so.** It is the same
 * `v8.serialize` call with the collection as it stood at its peak added to the list,
 * so an object reachable twice is still counted once — which is exactly what the
 * driver held before ADR 0046 rule 3, because the release is the only difference and
 * nothing else drops an entry. **It is validated against the real thing rather than
 * trusted**: W55 reverted the two `releaseArrivals` calls and re-took the numbers,
 * and the item's Record carries both columns.
 */
export interface Retention {
  /** Arrival entries held, per region, at the moment that region's collection was largest. */
  peakByRegion: Readonly<Record<string, number>>;
  /** Arrival entries held, per region, when the run was declared over. */
  endByRegion: Readonly<Record<string, number>>;
  /** The two above, summed across regions. */
  peakEntries: number;
  endEntries: number;
  /**
   * **How many of the values held at the peak are the SAME OBJECT as a log record's
   * `result`** — `JP-R12`'s *second copy* claim, and it is the half a byte count
   * cannot answer. Expected **0**: what a branch carries into a join is the edge-hop
   * clone `advance` made for that hop, and the log holds `OR-R2`'s listener-boundary
   * clone. P15 fact 3 measured this at ladder L2; this is the same claim on real
   * workers.
   */
  peakAliasingLog: number;
  /**
   * **How many `result` objects the log held when that count was taken** — W55's
   * adequacy reader, BLOCKING, and it is obligation (c)'s LIMIT on a SENSOR.
   *
   * `peakAliasingLog` is a count of an intersection, so it is `0` both when nothing
   * aliases and when one of the two sets is **empty**. Measured: making
   * `loggedResults` return `[]` cost **zero** — twenty-six assertions of `JP-R12`'s
   * second-copy claim went on passing against an empty `Set`. This is the other
   * side's size, so `examples/l6.ts` can assert the observer had something to see.
   */
  loggedResults: number;
  /**
   * **How many values the peak snapshot actually holds** — W55's adequacy reader.
   *
   * `peakEntries` counts what the driver recorded; this counts what the harness kept,
   * and the two are what `bytesBeforeRelease` is a subtraction between. Measured:
   * storing an EMPTY map at the peak cost **zero** — the collection column read 0.0
   * KiB on every row while twenty-six aliasing assertions passed against nothing, and
   * the reconstruction stayed *strictly larger* than the end because an empty map is
   * still a few bytes. **Two counts of one thing is what discriminates**, and it is a
   * relation rather than a byte figure ([Q179](../doc/open-questions.md)).
   */
  snapshotEntries: number;
  /**
   * `v8.serialize(...).length` over the driver's own growing structures in ONE call.
   * `null` where `node:v8` is absent, `-1` where the serializer refused the graph —
   * two different facts, and the refusal is one this rung can actually reach
   * (`uncloneable / OR-R6` puts a function in nobody's structures, but a policy's
   * opaque state is not this file's to promise).
   */
  bytesAtEnd: number | null;
  /** The same call with the peak collection added — the shape before ADR 0046 rule 3. */
  bytesBeforeRelease: number | null;
  /**
   * **The driver's own property names the byte measurement WALKED, and the ones it
   * skipped** — obligation (e)'s third shape, *a LIST is a claim about another list*.
   *
   * `NOT_RUN_STATE` is a literal, so without this it is bound to nothing: measured,
   * adding `'arrivals'` to it costs **zero** at both L6 rungs, because every other
   * clause here reads the collection's SIZE through `arrivalsOf` and never through
   * the walk. The byte number would then have silently stopped counting the one
   * structure this whole item is about. `examples/l6.ts` compares the two lists
   * against the driver's own keys, both ways.
   */
  walked: readonly string[];
  skipped: readonly string[];
}

export interface RunReport {
  runId: string;
  flowId: string;
  policyId: string;
  /** The run-state outcome the fold settled on — the whole result. */
  state: RunState;
  /** The full sequence, for anyone who wants to re-fold or read it. */
  inputs: readonly FoldInput[];
  /** `Driver.dispatchedIds()`, for the every-node-settles assertion (Q32). */
  dispatched: readonly string[];
  /** Per dispatched id, its effective outcome's terminal state, or `null` if it never settled. */
  settled: Record<string, string | null>;
  /**
   * Task ids the **scheduler** reported a settlement event for, counted at the
   * listener boundary and independent of anything the driver recorded.
   *
   * `settled` above is built by calling `driver.terminalStateOf`, so an assertion
   * over it is an assertion about the code it is checking
   * (`doc/workflow.md` section 5 rule 4). This is the second, independent source
   * `Q32` actually needs — *every dispatched task produced an outcome* is a claim
   * about the **scheduler**, not about our bookkeeping.
   */
  settledByScheduler: readonly string[];
  log: readonly LogRecord[];
  /** Observed, not asserted on. [Q19](../doc/open-questions.md) wants a number and this is not it. */
  wallMs: number;
  /**
   * **Which of the two ended the wait.** `'run-state'` means `isTerminal(state)`
   * became true at a quiescent point. `'backstop'` means the wall clock did —
   * a failure on every row but the one that declares `expectBackstop`, where a run
   * parked on a person genuinely cannot finish.
   *
   * This exists because W5's test-adequacy pass replaced the whole termination
   * mechanism with `setTimeout(1)` and **all 72 L6 assertions still passed**:
   * `await scheduler.shutdown()` drains the run while `onFoldInput` keeps
   * advancing `state`, so everything read afterwards is correct anyway. The
   * clock-free termination is the stated reason
   * [ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)
   * exists, `RN-R12` calls it *"what makes ladder L6 clock-free"*, and nothing was
   * testing it. Recording the winner of the race is what makes it testable.
   */
  finishedBy: 'run-state' | 'backstop';
  /**
   * `finishedBy === 'backstop'`, derived rather than tracked.
   *
   * It used to be a flag the backstop callback set, which made *"never set the
   * flag"* a surviving mutation: nothing else wrote it, so nothing could notice.
   * Deriving it from the winner of the race removes the second source of truth.
   */
  timedOut: boolean;
  /**
   * **Inputs that arrived AFTER the run was declared finished.** Any is a bug in
   * the declaration, not in the run: `RN-R12` says a terminal outcome means no
   * more input is coming, so one that comes anyway means the predicate was read
   * at a point that was not quiescent.
   *
   * This exists because W5's mutation sweep found that dropping the microtask
   * boundary below **survived every assertion** — the early resolve was masked by
   * `scheduler.shutdown()` taking long enough for the run to finish anyway. A
   * latent flake reported as a pass is the worst shape of green.
   */
  lateInputs: readonly string[];
  /**
   * **What the scheduler HELD when the run was over, and how many of those were the class's
   * own — W57, ADR 0048 rule 5's only observer at L6.** `FyflowScheduler.addTask` duck-types
   * its task: rule 8 probe `a3` swapped the driver's default `createTask` for `(config) => config`
   * and every row stayed green, because a plain object runs to `done` too. Counted from
   * `scheduler.tasks`, the scheduler's own map, never from the driver.
   */
  tasksHeld: number;
  fyflowTasksHeld: number;
  /**
   * **How many settlement events the SCHEDULER reported, and how many of their live task
   * objects carried a NUMERIC `attempts`.** The second thing a plain-object task lacks —
   * `FyflowTask` sets `attempts: 0` at construction — read at the listener off the scheduler's
   * own object, which is independent of `tasksHeld` (the scheduler's map) and of the driver's
   * log (whose listener normalises `attempts`, so a record could not see this).
   */
  settlementsSeen: number;
  numericAttemptsSeen: number;
  /**
   * **The `attempts` each settled task carried on the scheduler's LIVE object, per task id —
   * W58, the retry row's SECOND observer.** The outcome record's `attempts` is the driver's
   * listener copying the same field (`OR-R2`), so a row that read only the record would be
   * reading one observer through a normaliser; this is read at the harness's own listener,
   * synchronously and never retained (`OR-R1`), and the row asserts the two AGREE. Where
   * `numericAttemptsSeen` above counts *is it a number*, this records *which number*.
   */
  attemptsSeen: Readonly<Record<string, number>>;
  /**
   * **The error string the scheduler's live task carried at settlement, per id — W63.** A task whose
   * declared `transform` failed is parked `user_action` with `TransformFailed`'s message as its
   * error (ADR 0051 rule 5); this is that message read off the live object at the harness's own
   * listener, the second observer beside the outcome record's `error` (`OR-R2`), so a driver that
   * normalised the message away would fail one and not the other.
   */
  errorsSeen: Readonly<Record<string, string>>;
  /**
   * **What the scheduler said about a task's RESOURCES, in order, per task id — W58.** The
   * four `resource.*` events the scheduler emits on the task's behalf (`AGENTS.md` §6: blocked
   * on every push onto a blocked queue, unblocked on every exit, acquired immediately after
   * `onStart`, released immediately after `onFinish`) interleaved with its `task.running`, so a
   * row can assert not only that the task was blocked but that it was blocked BEFORE it ran.
   * Empty for a task that names no group and whose pool declares none — which is every task
   * before this item, and the negative control: with the passthrough reverted the gated task
   * has no entry here at all.
   */
  resourceEvents: Readonly<Record<string, readonly string[]>>;
  /**
   * **WHICH groups a task acquired, in order, per task id — W59.** `resourceEvents` above records
   * event NAMES; this records the `groupId` of every `resource.acquired` the scheduler emitted on
   * the task's behalf, so a row can assert that a typed task held the group its TYPE declares —
   * by id, not merely that some resource event happened. Empty for every task whose pool and
   * node declare no group, which is every task outside W58's and W59's rows.
   */
  heldGroups: Readonly<Record<string, readonly string[]>>;
  /**
   * The ids of the resource groups the scheduler holds, read from `scheduler.groups` at
   * construction — the same reading the driver's `groups` option is derived from, so a
   * cross-row clause can compare what the L6 flows NAME to what the scheduler DECLARES.
   */
  schedulerGroups: readonly string[];
  /**
   * The keys of `scheduler.workerPools`, read at construction — reported so a cross-row clause can
   * compare the pools the helper built for `NODE_TYPES` to the types the flows name, both ways, from
   * the scheduler rather than from a list beside it (W59; since W65 every pool is a type's, so the
   * two sets are equal).
   */
  schedulerPools: readonly string[];
  /**
   * **The languages each pool's config carries, by pool name, read off the built pools — W63,
   * ADR 0051 rule 4.** `[]` for every bare pool and for a typed pool none of whose nodes transform
   * in this run's flow; the adapter names for a typed pool some node does. `examples/l6.ts` compares
   * it, on every row, to what the row's DEFINITION declares — derived there independently of the
   * helper — both ways.
   */
  poolLanguages: Readonly<Record<string, readonly string[]>>;
  /** How many times `holdGroup`'s slot was released by this harness. `0` when nothing was held. */
  heldGroupReleases: number;
  /**
   * Whether the two fan-out branches were ever in flight at the same time.
   * Symmetric, so it depends on no completion order — which nothing may
   * (`doc/concept.md` section 5).
   */
  branchesOverlapped: boolean;
  /**
   * Every distinct run-state outcome the incremental fold passed through, in
   * first-seen order. **W6's, and it is how a transient outcome is asserted at
   * all**: `awaiting_action` is real and durable — a branch is parked on a person
   * — but a run that is later resolved ends `completed`, so the final state does
   * not record that it ever happened.
   *
   * **Sampled at quiescent points only**, in the termination microtask, which is
   * what makes an *exclusion* sound as well as an inclusion. The first version
   * sampled every element and therefore contained the mid-turn artefacts
   * `spec/run-state.md` section 3 enumerates — a transient `completed` and a
   * transient `stuck` on runs that were neither. Found by W6's conformity reader,
   * and it was the second occurrence of the failure mode that produced section 3's
   * quiescence block.
   */
  outcomesSeen: readonly RunOutcome[];
  /** Task ids resolved by the inbound step, in the order it resolved them. */
  resolved: readonly string[];
  /**
   * **Where the DRIVER said each branch parked**, keyed by branch path — W23's
   * adequacy reader, BLOCKING.
   *
   * The inbound step below reads `input.event.at` to know which node to resolve.
   * Substituting the ROW's own declared node for it — `how.at ?? input.event.at`,
   * a source swap and nothing else — cost **0 failures**, and with it in place
   * `branch.suspended`'s `at` was asserted by nothing at L6: a driver emitting
   * `at: 'WRONG'` went from **5** failures to **0**. That is W19's blocking
   * finding — *an assertion whose SOURCE could be swapped, forbidden in prose and
   * enforced by nothing* — in a field W23 itself created.
   *
   * Recorded so a row can compare what the DRIVER said against what the ROW
   * declared. Two sources, not one.
   */
  suspendedAt: Readonly<Record<string, string>>;
  /**
   * Anything **`onRunFailure`** reported, as text.
   *
   * **`onUnsatisfiableJoin` used to be flattened into this array too, and W17
   * separated them.** That was harmless while no shipped policy could return
   * `unsatisfiable` — the array was empty on every row either way — and it stopped
   * being harmless the moment one could: `spec/join-policy.md` section 4 gives the
   * two callbacks different jobs. A refusal **stops the run** and `RN-R8` makes it
   * `stopped` whatever its nodes say; an unsatisfiable join stops nothing, invents
   * no run-level outcome, and leaves the fold to reach `stuck` on its own
   * (`RN-R10`). Reporting them through one channel of strings would have made
   * *"nothing was reported"* unassertable on the one row where something is.
   */
  failures: readonly string[];
  /**
   * **What `onUnsatisfiableJoin` reported, whole — W17.**
   *
   * `spec/join-policy.md` section 4: on `unsatisfiable` the driver *"reports it
   * with the policy's own `describe`, and routes nowhere"*. The `describe` is the
   * half that says **why** the join can never fire, and it is the half a string
   * summary threw away — so a row could assert that something was reported and
   * not that the policy's account of it reached the caller.
   *
   * Structural rather than counted: an empty array on every row but one is a
   * stronger claim than a zero, and it is checked on **every** row.
   */
  unsatisfiableJoins: readonly UnsatisfiableJoin[];
  /**
   * The `kind` of each reported failure, kept separate from its message.
   *
   * `RunFailure.kind` was pinned by no test anywhere: row 12's assertion read
   * `${kind}: ${message}` for a substring, and `UncloneableResult`'s message
   * begins with its own class name, so forcing `kind` to `'Error'` was green at
   * L6 **and** at L1-L5. Found by W6's adequacy reader.
   */
  failureKinds: readonly string[];
  /**
   * **What `onUnmintedTask` reported, whole — W19, and it is `ID-R5`'s only
   * outbound evidence.**
   *
   * [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
   * rule 3: a settlement whose task id no driver minted is dropped and **reported
   * on its own channel**, carrying this driver's `runId`, the scheduler event's
   * name, `detail.id` uncoerced, and `parseTaskId`'s own message. Rule 4 makes the
   * empty case load-bearing rather than decorative: a settlement carrying
   * *another run's* parseable id must NOT arrive here, so `[]` on the pair row
   * that injects nothing is an assertion about `ID-R4` tier 1 as much as about
   * this channel.
   *
   * Kept whole and separate from `failures` for the reason `unsatisfiableJoins`
   * is: the run has **not** failed, so folding it into a channel whose contract is
   * *"the driver has stopped routing"* would make *"nothing was reported"*
   * unassertable on the one row where something is.
   *
   * Copied field by field rather than retained — `OR-R1`'s habit applied to our
   * own surface.
   */
  unmintedTasks: readonly UnmintedTask[];
  /** W55 — see `Retention`. Measured on every run; asserted by the RELATION, never by the bytes. */
  retention: Retention;
  /**
   * **The `Driver` itself, and only when the caller asked for it** —
   * `RunOptions.keepDriver`.
   *
   * `examples/retention.ts`'s scale mode holds N completed drivers and measures
   * `heapUsed` after a forced `gc()`, and a driver nobody references is collected
   * before that observer can see it. Every other caller leaves it `undefined`, so
   * ladder L6 keeps forty-four drivers reachable for exactly as long as it did before
   * this field existed.
   */
  driver?: Driver;
}

export interface RunOptions {
  definition: FlowDefinition;
  policy: JoinPolicy;
  runId: string;
  payload: unknown;
  predicates?: ReadonlyMap<string, Predicate>;
  /** Per-task delay in the workers, so the two branches genuinely overlap. */
  delayMs?: number;
  /** Threads rather than the main event loop for the fan-out pool. */
  threaded?: boolean;
  /** Backstop only. Reaching it fails the run; it never decides that a run finished. */
  backstopMs?: number;
  /**
   * **The inbound step — W6, and the one piece of design P2 named before it was
   * hit.** Keyed by branch path: when that branch suspends, resolve it this way.
   *
   * A suspended run **never finishes**, because `RN-R12` makes `awaiting_action`
   * explicitly non-terminal — correctly, since a run waiting on a person is not
   * over. So without this a row that suspends waits for its backstop and reports
   * a failure. This is the human, and `Driver.resolve()` is the only inbound API
   * the library has (ADR 0004 rule 5).
   *
   * **Driven by the sequence, not by a clock**, exactly as termination is: it
   * fires on the `branch.suspended` element rather than after an interval.
   *
   * **Deferred to a microtask, and the reason is not the one first written here.**
   * The original claim — that a re-entrant `resolve()` would interleave the
   * sequence with itself — is false: `Driver.append` pushes before it notifies, so
   * a re-entrant append lands after the current element rather than inside it. The
   * real reason is sharper: resolving inside the driver's own turn means the run is
   * **never quiescently `awaiting_action`**, which is the state the row exists to
   * demonstrate. A human who answers within the same synchronous turn is not a
   * human. W6's adequacy reader found the false claim; the row now fails without
   * the deferral.
   */
  resolveOnSuspend?: Record<string, { as: 'done' | 'failed'; result?: unknown; actor: string }>;
  /**
   * **A scheduler to share, rather than one of this run's own — W14.**
   *
   * [ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
   * makes *two drivers on one scheduler* a supported topology, and P4's exit
   * artifact is that topology on **real workers**. Passing a scheduler in is the
   * whole of what W14 needed from this file: two runs then differ from two
   * sequential runs in exactly one respect, which is the respect under test.
   *
   * **The caller that supplies it owns its lifetime** — `runFlow` will not
   * `shutdown()` a scheduler it did not build, because the other run is still
   * using it. `runPair` below is that caller.
   *
   * What this shares, and it is worth knowing before reading a report: the
   * `task.running`/`completed`/`failed` listeners this function registers see
   * **both** runs, so `branchesOverlapped` and `settledByScheduler` are
   * scheduler-wide rather than run-wide when a scheduler is shared. Everything
   * else in a `RunReport` comes from that run's own driver.
   */
  scheduler?: FyflowScheduler;
  /**
   * **Hand the `Driver` back in the report — W55, and only the scale measurement
   * asks for it.** See `RunReport.driver`: an observer that reads `heapUsed` after a
   * forced `gc()` cannot see what nothing references.
   */
  keepDriver?: boolean;
  /**
   * **A resource group this HARNESS holds when the run starts, and releases once the
   * scheduler reports a task blocked behind it — W58's group row.** The group is a
   * `ConcurrentLimitGroup(1)` `buildScheduler` registers; the harness takes its one slot with
   * the group's own `onStart()` before `driver.start`, so a task whose node declares it in
   * `workerGroups` is `resource.blocked` on dispatch. The release is driven by that event and
   * not by a clock: on the first `resource.blocked` naming this group the slot is given back
   * on a microtask, and the scheduler's own heartbeat re-dispatches the task. No foreign task
   * is involved, so `onUnmintedTask` stays empty and the row is about the group alone.
   */
  holdGroup?: string;
}

/**
 * **A task this library did not mint, put onto the shared scheduler — W19.**
 *
 * The whole of what [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
 * is about, and the thing no fixture can establish: the `id` is passed to the
 * scheduler **verbatim**, so it is whatever the caller says rather than anything
 * `spec/task-id.md` section 1's grammar would produce. A real
 * `FyflowScheduler` queues it, dispatches it to a real worker and settles it, and
 * its settlement reaches every `Driver` subscribed to that scheduler.
 *
 * **`workerType` must be a pool `buildScheduler` registers**, because `addTask`
 * throws on an unknown one — which is itself the first thing a fake cannot tell
 * you, and is why W19's declaration measured it before the row was written.
 */
export interface ForeignTask {
  /**
   * Verbatim, and deliberately not built by `buildTaskId`. An id that parsed
   * would be `ID-R4`'s question, not `ID-R5`'s.
   */
  id: string;
  /** A key in `buildScheduler`'s pools — since W65 the name of a TYPE, because every pool is one type's default instance. The field keeps the scheduler's own name for it. */
  workerType: string;
  /** What the task's worker receives as its `input`. Since W65 every pool is fronted by the envelope worker, so `runPair` wraps this as `{ settings: {}, input }` — a raw payload on a typed pool is refused by the wrapper (`NotAnEnvelope`) and would settle `user_action` instead of `done`. */
  payload?: unknown;
  /**
   * **Passed through to the scheduler, and it is what `task.failed` needs** —
   * [Q107](../doc/open-questions.md), taken by
   * [W23](../doc/work-items/w23-a-nested-flow-on-real-workers.md).
   *
   * `ID-R5` at L6 had only ever been reached from `task.completed`, because every
   * foreign task W19 injected ran a worker that returns. Only an **optional** task
   * can settle `failed` (`core/FyflowScheduler.ts:894-897`), so a foreign task
   * that throws needs this flag or it ends `user_action` instead — which is a
   * third event name and a different question again.
   */
  optional?: boolean;
}

/**
 * **Two runs, two `Driver`s, ONE scheduler, on real workers — P4's exit artifact.**
 *
 * The pairing [Q72](../doc/open-questions.md) named and
 * [ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md)
 * closed. Before W13 this corrupted both runs **silently**: each driver received
 * the other's settlements, `run-a:publish:-:0` was dispatched twice under two
 * outcomes — `spec/task-id.md` section 2's collision — and `ID-R1` could not fire,
 * because each driver keeps its own dispatched-id set.
 *
 * The two runs are started **concurrently against one scheduler**, which is the
 * only difference from running them one after another, and is exactly the
 * difference under test. Each awaits its own clock-free termination; the shared
 * scheduler is shut down once, after both.
 */
export async function runPair(
  a: RunOptions,
  b: RunOptions,
  foreign: readonly ForeignTask[] = [],
): Promise<{ a: RunReport; b: RunReport; facts: PairFacts }> {
  // One scheduler means one set of pools, so the two runs cannot ask for
  // different worker timings. Refused rather than silently taking `a`'s, which is
  // what this did until W14's conformity reader pointed out that `b`'s were dead.
  if ((a.delayMs ?? 5) !== (b.delayMs ?? 5) || (a.threaded === true) !== (b.threaded === true)) {
    throw new Error('runPair: both runs share one scheduler, so delayMs and threaded must match');
  }
  const scheduler = buildScheduler(a.delayMs ?? 5, a.threaded === true, [a.definition, b.definition]);

  // **Everything below is read from the SCHEDULER, before either driver exists.**
  // `doc/workflow.md` section 5 rule 4 — a fixture must not come from the code
  // under test — and W14's adequacy reader found the row breaking it: every
  // disjointness assertion read `driver.dispatchedIds()` and `driver.snapshot()`,
  // so deleting the `ID-R4` guard *and* filtering those two accessors by run id
  // left the row **green at 233/0** while `addTask` was called 55 times for 50
  // distinct ids — Q72's corruption in full, on the real scheduler, reported by
  // nothing. The harness already avoids this for `settled`, via
  // `settledByScheduler`; it did not for disjointness.
  const settlementIds: string[] = [];
  const listenersAtSettlement: number[] = [];
  const record = (e: { detail: unknown }) => {
    const id = (e.detail as { id?: string })?.id;
    // Read synchronously from the live detail and never retained (`OR-R1`); only
    // the id, which is a string. Pushed rather than added to a Set, **and that is
    // the point**: a Set makes "no id settled twice" a tautology, which is what
    // the same reader found assertion 14 asserting.
    //
    // **`record` is registered BEFORE either driver**, so for any settlement event
    // it runs first — which makes the number pushed beside each id the count of
    // listeners attached when that settlement was delivered. That is the boundary
    // that matters: a driver attached later would never have seen it.
    //
    // **One push per settlement, and the first-settlement count is READ OFF the
    // array rather than latched into a field — W19's adequacy reader.** It was
    // `if (settlementIds.length === 0) listenersAtFirstSettlement = listenersTotal;`,
    // and deleting that guard so the field is overwritten by every settlement left
    // all 370 assertions green: `listenersAtFirstSettlement === listenersTotal`
    // became a tautology, and with it the whole *"both drivers were attached when
    // the foreign settlement arrived"* half of the hostile-ordering claim, which
    // this harness leans on in as many words. **Third occurrence of one shape**:
    // `timedOut` and `lateInputs` were both a second source of truth beside the
    // thing that produced them, and both were fixed by deriving rather than
    // tracking. This is that fix a third time, and the two arrays being the same
    // length is what makes "record only the last one" fail as well.
    if (typeof id === 'string') {
      settlementIds.push(id);
      listenersAtSettlement.push(listenersTotal);
    }
  };
  scheduler.addEventListener('task.completed', record);
  scheduler.addEventListener('task.failed', record);

  let listenersTotal = 2;
  let addTaskCalls = 0;
  let shutdownCalls = 0;
  const realAdd = scheduler.addEventListener.bind(scheduler);
  const realAddTask = scheduler.addTask.bind(scheduler);
  const realShutdown = scheduler.shutdown.bind(scheduler);
  (scheduler as unknown as { addEventListener: unknown }).addEventListener =
    (type: string, fn: (e: { detail: unknown }) => void) => { listenersTotal++; return realAdd(type, fn); };
  (scheduler as unknown as { addTask: unknown }).addTask = (task: unknown, o?: unknown) => {
    addTaskCalls++;
    return realAddTask(task as never, o as never);
  };
  (scheduler as unknown as { shutdown: unknown }).shutdown = () => { shutdownCalls++; return realShutdown(); };

  // **The foreign tasks — W19, and where they go in this function is the whole
  // arrangement.**
  //
  // *After* the instrumentation, so `addTaskCalls` counts them and stays a fact
  // about the scheduler rather than about the harness; *before* `Promise.all`, so
  // they are queued ahead of everything either run dispatches.
  //
  // **The settlement must land while both runs are LIVE, and this is what makes
  // that structural rather than hoped for.** `runFlow` is synchronous up to its
  // first `await`, so both drivers attach their listeners before any timer fires,
  // and the worker's own `delayMs` means nothing can settle inside this turn.
  // **NOT all on one pool since [Q107](../doc/open-questions.md)**, and the
  // sentence this replaces was true of five of the six. It read: *"The pool these
  // go to is `IngestWorker` — `maxThreads: 1`, `inline` — so a task queued first
  // is dispatched first and settles first, and the ordering is produced by queue
  // discipline rather than by a delay comparison."*
  //
  // The five that run `IngestWorker` still serialize on one inline slot, and that
  // part is queue discipline. `weekly-report` runs `ReviewWorker` so that a
  // foreign settlement reaches `ID-R5` under `task.failed` rather than
  // `task.completed`, and **its ordering against the runs is a delay comparison
  // across two pools** — ~20 ms against each run's `ingest` at ~30 ms. The claim
  // the assertions make is unchanged; the mechanism behind one of the six is not,
  // and W23's conformity reader found this sentence still describing the old one.
  //
  // **Both halves are asserted rather than trusted**, which is W17's lesson about
  // `SETTLES_LAST`: `PairFacts.settlementIds[0]` says the foreign settlement came
  // first, and `listenersAtFirstSettlement === listenersTotal` says both drivers
  // were attached when it was delivered. `doc/workflow.md` section 5 rule 5 —
  // this ARRANGES an order and then checks the effect; nothing depends on an
  // order the spec does not fix.
  for (const f of foreign) {
    scheduler.addTask(new FyflowTask({
      id: f.id,
      workerType: f.workerType,
      // Wrapped since W65 (ADR 0054): the pool is a TYPE's and its worker receives the envelope
      // (`FD-C5`); the id is what this row is about and the payload shape is not.
      payload: { settings: {}, input: f.payload ?? null },
      // Q107: `optional` is what decides whether a throwing worker settles
      // `failed` or ends `user_action`, and the driver keys on terminal state
      // rather than on event name (ADR 0007 rule 2) — so this is how a foreign
      // settlement reaches `ID-R5` down a road that is not `task.completed`.
      optional: f.optional ?? false,
    }));
  }

  try {
    const [ra, rb] = await Promise.all([
      runFlow({ ...a, scheduler }),
      runFlow({ ...b, scheduler }),
    ]);
    return {
      a: ra,
      b: rb,
      facts: { settlementIds, listenersAtSettlement, listenersTotal, addTaskCalls, shutdownCalls: shutdownCalls + 1 },
    };
  } finally {
    // Once, after both — and in a `finally`, because a row that fails must not
    // also leave the process alive (`AGENTS.md` §2). Counted above as `+ 1`
    // because the report is built before this runs.
    await scheduler.shutdown();
  }
}

/**
 * What the **scheduler** saw, independent of anything either driver recorded.
 *
 * Every field here exists because W14's readers found the row's own claims
 * resting on the driver it is checking, or on an interleaving `spec/` does not
 * fix. These are timing-free: they are counts of structure, not of order.
 */
export interface PairFacts {
  /**
   * Every settlement event id the scheduler dispatched, **in order and with
   * duplicates kept**. `spec/task-id.md` section 2 point 3: two `task.completed`
   * under one id is what a real 0.3.0 collision produces, and a `Set` here would
   * discard exactly the evidence.
   */
  settlementIds: readonly string[];
  /**
   * How many listeners were registered when **each** settlement was delivered, in
   * the same order and at the same length as `settlementIds`, and the total.
   *
   * `[0] === listenersTotal` iff both runs were attached before **anything**
   * settled — which is what makes "two drivers on one scheduler" structural rather
   * than a hope about timing, because a driver attached later would never see that
   * settlement.
   *
   * **An array rather than a latched first-settlement field, since W19.** The
   * field's `if (settlementIds.length === 0)` guard was deletable with all 370
   * assertions green, which turned the claim into a tautology. Read off `[0]`
   * instead, with the two arrays' equal length asserted, and there is nothing to
   * latch and nothing a later settlement can overwrite.
   *
   * **Not the first *dispatch*:** `runFlow` is synchronous up to its first
   * `await`, so run `a` has already called `addTask` before run `b` is
   * constructed. Measured — 8 of 14 — which is why this reads settlements.
   * A sequential `runPair` leaves `[0]` strictly less than the total; a run given
   * its own scheduler leaves `addTaskCalls` at zero on this one.
   *
   * **And it proves ATTACHMENT, not that either run had `start()`ed** — a `Driver`
   * registers its listeners in its constructor (ADR 0022). That is the property
   * `ID-R5` needs and it is what the row's prose now says. W19's conformity reader.
   */
  listenersAtSettlement: readonly number[];
  listenersTotal: number;
  addTaskCalls: number;
  /** `runFlow` must not shut down a scheduler it did not build; this is one. */
  shutdownCalls: number;
}

/**
 * The pools and the scheduler, in one place so `runFlow` and `runPair` cannot
 * drift apart about what a worker does. W14 extracted it unchanged.
 */
// --- W55: the retention observer ------------------------------------------------

/**
 * **The ONE reach into the driver's private state, named once** — W55, and it is
 * `test/driver/retention.test.ts`'s reach at ladder L6.
 *
 * [Q233](../doc/open-questions.md) is the record of why it has to be a reach:
 * [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
 * rule 1 is a statement about what a run HOLDS and **no public surface can observe
 * it** — `snapshot()` and `foldInputs()` both return the log, and the region
 * collections `RN-R13`'s second term is about are reachable from neither, which is
 * that rule's own point. W53 measured both alternatives and refused both: a public
 * accessor enlarges the surface for a test's convenience ([Q53](../doc/open-questions.md)
 * — *a redundant surface is read as a permissive one*), and a byte measurement needs
 * `v8.serialize`, which exists in two of the five runtimes.
 *
 * **The shape is the field's own declaration**, `Map<fanoutId, Map<branchPath, payload>>`.
 */
const arrivalsOf = (d: Driver): Map<string, Map<string, unknown>> =>
  (d as unknown as { arrivals: Map<string, Map<string, unknown>> }).arrivals;

/** The `result` object of every settled record in the driver's own log, **by reference**. */
const loggedResults = (d: Driver): unknown[] =>
  (d as unknown as { log: { result?: unknown }[] }).log
    .filter((r) => r && typeof r === 'object' && 'result' in r).map((r) => r.result);

/**
 * **What the walk below does NOT look in, and why each is excluded** — the same
 * three `test/driver/retention.test.ts` excludes, for the same reason. `graph`,
 * `opts` and `def` are the DEFINITION and the caller's own options: neither grows
 * with the run, which is `RN-R13`'s subject. **The list is stated rather than
 * implied**, because a byte figure whose universe is unwritten is a figure nobody
 * can re-take — and it is the same universe `dev-dist/p15/scale.ts` used, so this
 * rung's number and P15 fact 5's table are the same measurement at two scales.
 */
// `languages` since W61: the registry's languages — consumer configuration holding a compile FUNCTION
// and a worker URL, no result; the same reading as `nodeTypes` (a late exception: the driver gained a
// field and this walk enumerates every driver field both ways).
// `nodeTypes` since W59: the registry's node types — consumer configuration holding validator
// FUNCTIONS, which `v8.serialize` refuses and which hold no result. The same reading as `opts`.
const NOT_RUN_STATE = ['def', 'graph', 'languages', 'nodeTypes', 'opts'];

/** The two halves of `NOT_RUN_STATE`'s claim, for the clause in `examples/l6.ts` that binds it. */
const walkOf = (d: Driver): { walked: string[]; skipped: string[] } => {
  const keys = Object.keys(d as unknown as Record<string, unknown>);
  return {
    walked: keys.filter((k) => !NOT_RUN_STATE.includes(k)).sort(),
    skipped: keys.filter((k) => NOT_RUN_STATE.includes(k)).sort(),
  };
};

/**
 * **`v8.serialize`, loaded once and never assumed.** It is in **two** of the five
 * runtimes — node and deno, through `node:v8`, and in none of the three browsers
 * ([Q233](../doc/open-questions.md), corrected there from *one*). Ladder L6 runs in
 * exactly those two, so it is available at both L6 rungs and at neither browser one.
 */
let serializeFn: ((v: unknown) => { length: number }) | null | undefined;
async function serializer(): Promise<((v: unknown) => { length: number }) | null> {
  if (serializeFn !== undefined) return serializeFn;
  try {
    serializeFn = (await import('node:v8')).serialize as unknown as (v: unknown) => { length: number };
  } catch {
    serializeFn = null;
  }
  return serializeFn;
}

/**
 * **What a run RETAINS, in bytes, in ONE serialize call** — so an object reachable
 * twice is counted once, which is the whole reason it is one call and not a sum.
 *
 * `extra` is what the caller wants counted **beside** the driver's own structures:
 * `runFlow` passes the collection as it stood at its peak, which reconstructs the
 * pre-ADR-0046 shape. A `Map` and a `Set` are spread first, matching P15's own
 * method exactly; a function (`now`) and the primitives are skipped, because the
 * serializer refuses the first and the second are not results.
 *
 * Returns `null` where there is no serializer and **`-1`** where it refused the
 * graph — two different facts, and collapsing them would make *this runtime cannot
 * measure* indistinguishable from *this run holds something uncloneable*.
 */
export async function retainedBytes(d: Driver, extra: readonly unknown[] = []): Promise<number | null> {
  const ser = await serializer();
  if (!ser) return null;
  const o = d as unknown as Record<string, unknown>;
  const parts: unknown[] = [];
  // **The key list comes from `walkOf` and from nowhere else** — W55's adequacy
  // reader, BLOCKING. It used to consult `NOT_RUN_STATE` itself, so `walkOf` and
  // this function were **two expressions over one literal** and only `walkOf`'s
  // output reached an assertion: measured, a second `continue` inside this loop
  // dropping `arrivals`, `inputs` and `log` cost **ZERO** at both L6 rungs while the
  // artifact's *held at end* went 777.5 KiB to 0.6 KiB. Adding `'arrivals'` to the
  // literal was caught and skipping it here was not. **One expression, so the list
  // `examples/l6.ts` asserts IS the list this measures.**
  for (const k of walkOf(d).walked) {
    const v = o[k];
    if (Array.isArray(v)) parts.push(v);
    else if (v instanceof Map) parts.push([...v]);
    else if (v instanceof Set) parts.push([...v]);
    else if (v && typeof v === 'object') parts.push(v);
  }
  for (const x of extra) parts.push(x);
  try {
    return ser(parts).length;
  } catch {
    return -1;
  }
}

/**
 * **What `examples/retention.ts` REFUSES to report, and it lives here so that ladder
 * L6 can bind it** — W55's adequacy reader, BLOCKING.
 *
 * That file is a reporter: everything else in it is a `console.log`, so it exited
 * **0** whatever it measured until this predicate existed — and then the predicate
 * itself was deletable for zero, because nothing at L6 or in the gate runs that file.
 * *A command that cannot fail is not evidence that anything held.* Declared here and
 * given a positive case in `examples/l6.ts`, which is the shape W47 settled for a
 * detector whose tree is clean: **a sensor with no case that makes it fire is bound
 * to nothing.**
 *
 * **It asserts the RELATION and never the bytes** — this item's own `Tests:` line, and
 * [Q179](../doc/open-questions.md) is why. On a run that COMPLETED,
 * [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
 * rule 3 says the collection is gone and `JP-R12` says one entry was recorded per
 * branch that arrived. The two BYTE clauses are relations too: a serializer this rung
 * is required to have (`node:v8`, in both L6 runtimes) must have produced a number,
 * and the reconstruction must exceed the end — which is what makes *the collection it
 * released* a measurement rather than a subtraction of a value from itself.
 */
export function violations(r: RunReport, arity: number): string[] {
  const bad: string[] = [];
  if (r.state.outcome !== 'completed') bad.push(`outcome ${r.state.outcome}, not completed`);
  if (r.retention.peakEntries !== arity) {
    bad.push(`JP-R12: recorded ${r.retention.peakEntries} arrivals, not ${arity}`);
  }
  if (r.retention.endEntries !== 0) {
    bad.push(`ADR 0046 rule 3: still holding ${r.retention.endEntries} after the join became terminal`);
  }
  if (r.retention.peakAliasingLog !== 0 || r.retention.loggedResults === 0) {
    bad.push(
      `JP-R12: ${r.retention.peakAliasingLog} held values ARE a log record's own result, ` +
        `against ${r.retention.loggedResults} logged`,
    );
  }
  // **The byte columns are RELATIONS here too, and the adequacy reader is why.** Three
  // separate edits turned the measurement off with every assertion green: making the
  // serializer unavailable (every column `n/a`), skipping keys inside the walk (777.5
  // KiB to 0.6), and dropping the `extra` list (the collection column to 0.0). None is
  // a claim about a NUMBER — they are *this rung has a serializer*, *it measured
  // something*, and *the reconstruction is larger than the end* — so `Q179` is
  // untouched and a measurement that stopped measuring fails.
  if (r.retention.bytesAtEnd === null) bad.push('no serializer: both L6 runtimes have node:v8');
  else if (r.retention.bytesAtEnd <= 0) bad.push(`bytesAtEnd ${r.retention.bytesAtEnd}`);
  if (arity > 0 && (r.retention.bytesBeforeRelease ?? 0) <= (r.retention.bytesAtEnd ?? 0)) {
    bad.push('the reconstruction is not larger than the end, so nothing was released');
  }
  // **What the run holds is at least what it released, and that is STRUCTURAL rather
  // than a figure** — W55's adequacy reader, whose edit put a second `continue` inside
  // the walk and dropped `inputs`, `log` and `arrivals` for **zero**, taking the byte
  // column from 777.5 KiB to 0.6 while every other relation here still held.
  //
  // `inputs` holds every settled result once (`RN-R13`'s first term) and a region's
  // collection is one entry per branch that ARRIVED — a subset of those same results.
  // So a measurement that still counts `inputs` cannot come out smaller than the
  // collection it is measuring the release of. A walk that stopped walking does.
  const released = (r.retention.bytesBeforeRelease ?? 0) - (r.retention.bytesAtEnd ?? 0);
  if (arity > 0 && (r.retention.bytesAtEnd ?? 0) < released) {
    bad.push(
      `the run holds ${r.retention.bytesAtEnd} B and released ${released} B — the collection is a ` +
        'SUBSET of what `inputs` holds, so the walk is not counting what it says it counts',
    );
  }
  if (r.retention.snapshotEntries !== r.retention.peakEntries) {
    bad.push(
      `the peak snapshot holds ${r.retention.snapshotEntries} values for ${r.retention.peakEntries} ` +
        'recorded arrivals, so the reconstruction is a subtraction over the wrong set',
    );
  }
  return bad;
}

/**
 * **Exported since W55, and only so that a batch can SHARE one.**
 *
 * `runFlow` builds its own unless one is passed, and `runPair` is the other caller
 * that passes one. `examples/retention.ts`'s scale mode is the third: N runs on ONE
 * real scheduler is what makes *at scale* a real-worker measurement rather than an
 * extrapolation from one run.
 */
/**
 * `flows` — **the definitions this scheduler will run, handed to the bootstrap helper so it can
 * write a language's worker URL into exactly the typed pools whose nodes transform** (W63,
 * ADR 0051 rule 4). Required rather than defaulted: a scheduler built without its flows would
 * carry no engine, and every transforming task on it would fail at `run()` with *language not
 * loaded* — a silence this file should not be able to produce by omission.
 */
export function buildScheduler(delayMs: number, threaded: boolean, flows: readonly FlowDefinition[]): FyflowScheduler {
  // **A role that must settle LAST is given a longer delay**, so the branch that
  // arrives is not the branch that finishes. Without it, `settleJoin` on the
  // `lost` and `exited` paths is unreachable at L6 — the arriving branch always
  // settled last and the join was always fired by the arrival, so deleting either
  // of the other two calls was invisible across twelve rows. Found by W6's
  // adequacy reader.
  //
  // This ARRANGES an order rather than depending on one: nothing asserts which
  // branch finishes first, the flow's own definition decides which branch
  // arrives, and a 4x delay difference is not a race. `doc/workflow.md` section 5
  // rule 5 forbids depending on an order the spec does not fix; it does not
  // forbid choosing inputs that make a causal path reachable.
  //
  // **The 4x is currently INERT, and W17's adequacy reader measured it.** Emptying
  // this set, or reducing the multiplier to 1x, leaves all 342 assertions green —
  // the settling order those two rows depend on is produced by **inline dispatch
  // order**, not by the delay. Reversing the set is caught, because that reverses
  // dispatch order's effect too. So the delay is belt-and-braces over a property
  // the pools already have, and `Expectation.joinSettledBy` pins the **effect**
  // rather than this mechanism — correctly, since which mechanism produces the
  // order is not something `spec/` fixes. It is kept because the moment a pool
  // becomes threaded or gains a second thread, dispatch order stops implying
  // settle order and this is what remains. [Q99](../doc/open-questions.md).
  // **Every pool through the helper since W65** — the ONE constructing call a consumer copies. The
  // group objects are keyed by the id a TYPE or a NODE names: `scorer` is the `Scorer` type's, given
  // to the helper because a pool's derivation names it and the helper refuses both ways; `gate` is
  // named by NODES' `workerGroups` and by no pool, so it is registered beside the helper's result —
  // the helper's direction-two refusal is what keeps it out of that call.
  // **The KEY is `scorer` and the object calls itself something else, on purpose** — the adequacy
  // reader (q13): ADR 0049 fact 2 says the scheduler resolves a group by the map key and the object's
  // own name is inert, and every fixture in the tree had the two equal, so a helper checking the
  // inert name survived every rung. `heldGroups` records the scheduler's `groupId`, which is the KEY.
  // **And the languages, with the flows — W63**: the helper reads WHICH types transform in WHICH
  // languages from the definitions and writes only those adapters' worker URLs into only those
  // pools, so `Scorer`'s pool carries the engine on a run of `transformed.flow.json` and NOT on a
  // run of `typed.flow.json` — same type, decided by the flow. `RunReport.poolLanguages` is what
  // `l6.ts` reads that from, off the built pools rather than off this call.
  const built = bootstrap(registryFor(delayMs, threaded), {
    scorer: new ConcurrentLimitGroup(8, 'scorer-by-object-name'),
  }, { languages: LANGUAGES, flows });

  return new FyflowScheduler(built.workerPools, {
    // **The resource group the NODES declare — W58's group row.** A limit of ONE so the harness can
    // hold its whole capacity with a single `onStart()`, and any task naming it is blocked until the
    // harness lets go. It is the value `runFlow` derives the driver's `groups` option from, read back
    // off `scheduler.groups` rather than named twice. Beside the helper's groups, not through them.
    gate: new ConcurrentLimitGroup(1, 'gate'),
    // And the group the `Scorer` TYPE declares, built through the helper: a limit of EIGHT, so the
    // three map instances of `typed-regions.flow.json` never block on it and every typed task reports
    // the same three-event sequence — the row is about which group was HELD, not about contention.
    ...built.resourceGroups,
  });
}

export async function runFlow(opts: RunOptions): Promise<RunReport> {
  const { definition, policy, runId, payload } = opts;
  const delayMs = opts.delayMs ?? 5;
  const backstopMs = opts.backstopMs ?? 10_000;

  const scheduler = opts.scheduler ?? buildScheduler(delayMs, opts.threaded === true, [definition]);
  const ownsScheduler = opts.scheduler === undefined;

  const inputs: FoldInput[] = [];
  const failures: string[] = [];
  const unsatisfiableJoins: UnsatisfiableJoin[] = [];
  const unmintedTasks: UnmintedTask[] = [];
  const failureKinds: string[] = [];
  const outcomesSeen: RunOutcome[] = [];
  const resolved: string[] = [];
  const suspendedAt: Record<string, string> = {};
  let state = emptyState();
  // **The race's two arms each RESOLVE WITH THEIR OWN NAME — W17.**
  //
  // `finishedBy` used to be `declaredFinished ? 'run-state' : 'backstop'`, read
  // after the race, and its comment claimed that *"reads which of the two won
  // rather than trusting a flag the loser also sets"*. **It did not.** W17's
  // adequacy reader replaced the whole `Promise.race` with `setTimeout(1200)` —
  // a timer LONGER than the run rather than shorter — and all 341 assertions
  // passed: the microtask still set `declaredFinished` while the harness slept,
  // so every row still reported `finishedBy: 'run-state'`. That is W5's mask
  // restored in the only form that matters, and the existing probe missed it
  // because a 1 ms timer truncates the run and a 1200 ms one does not.
  //
  // Now the value IS the race's result. Delete the race and there is no value to
  // report — `tsc` refuses it, and at runtime every row's `finishedBy` assertion
  // fails. This is the same repair the file already made for `timedOut`, applied
  // one level up: derive it from the winner rather than from a flag a participant
  // sets.
  let settle: (() => void) | null = null;
  const finished = new Promise<'run-state'>((resolve) => { settle = () => resolve('run-state'); });
  let checkQueued = false;
  // **Where the sequence stood when the predicate fired**, and the single source
  // `lateInputs` is derived from below. It used to be a parallel array pushed to
  // from the listener, and deleting that one push made all nineteen
  // *"nothing arrived after the run was declared finished"* assertions
  // tautologies with the gate green — W17's adequacy reader, and the identical
  // second-source-of-truth shape this file records as fixed for `timedOut`.
  //
  // `-1` means the predicate never fired, and the derivation below then reports
  // the WHOLE sequence as late: a harness that never recorded when the run
  // finished cannot claim nothing arrived afterwards.
  let finishIndex = -1;

  // **The peak of `JP-R12`'s window, per region — W55.**
  //
  // **Sampled on every fold input, and that is the whole of why it works.** The
  // driver records an arrival, THEN emits `branch.arrived`, THEN asks the policy
  // (`src/driver/driver.ts`'s `join` arm, and the order is stated there as a rule) —
  // so the element that reaches this callback for the last arrival is delivered
  // while the collection is still whole and the join has not yet become terminal.
  // A sample taken anywhere else would be a sample of the released state.
  //
  // **Per region rather than across regions**, because a nested run has two and they
  // peak at different moments: `max(total)` would report the larger of two maxima
  // rather than the sum of them, and a region that filled and emptied before the
  // other started would vanish from the number entirely.
  //
  // **The snapshot holds the payload OBJECTS**, which is what makes the
  // reconstruction below a measurement of the same graph rather than of a copy of
  // it — and what makes `peakAliasingLog` answerable at all.
  const peakByRegion: Record<string, number> = {};
  const peakSnapshot = new Map<string, Map<string, unknown>>();
  const samplePeak = (): void => {
    for (const [region, held] of arrivalsOf(driver)) {
      if (held.size > (peakByRegion[region] ?? 0)) {
        peakByRegion[region] = held.size;
        peakSnapshot.set(region, new Map(held));
      }
    }
  };

  // In-flight tracking, for the overlap check. `task.running` and the settlement
  // events are the scheduler's own, and this is the example rather than the
  // library, so subscribing directly is fine — `OR-R4` only says they write no
  // outcome RECORD.
  const inFlight = new Set<string>();
  let branchesOverlapped = false;
  const noteRunning = (e: { detail: unknown }) => {
    const id = (e.detail as { id?: string })?.id;
    if (typeof id !== 'string') return;
    inFlight.add(id);
    // Two branches of one region are in flight at once. Order-free: it is true
    // whichever of them entered first.
    const branches = [...inFlight].filter((t) => !t.includes(':-:'));
    if (branches.length > 1) branchesOverlapped = true;
  };
  const settledByScheduler = new Set<string>();
  // **W57's second observer for ADR 0048 rule 5, read off the scheduler's LIVE task object at
  // the listener** (`OR-R1`, synchronously, never retained): a `FyflowTask` carries a numeric
  // `attempts` from construction and a plain object handed to `addTask` carries none. The
  // driver's own record cannot see this — its listener normalises `attempts` — so this is
  // independent of both the driver and the `instanceof` count below.
  let settlementsSeen = 0;
  let numericAttemptsSeen = 0;
  // **W58: WHICH `attempts`, per id, off the same live object** — the retry row's second
  // observer, independent of the driver's record (which is the listener's normalised copy).
  const attemptsSeen: Record<string, number> = {};
  // **W63: the task's ERROR string, per id, off the same live object** — the failing-transform
  // row's second observer of `TransformFailed`'s message, independent of the driver's record
  // (whose listener copies the same field). A string, copied synchronously, never the object.
  const errorsSeen: Record<string, string> = {};
  const noteDone = (e: { detail: unknown }) => {
    const id = (e.detail as { id?: string })?.id;
    if (typeof id !== 'string') return;
    inFlight.delete(id);
    // Read synchronously from the live detail and never retained (`OR-R1`); only
    // the id, which is a string, and whether `attempts` is a number.
    settledByScheduler.add(id);
    settlementsSeen++;
    const attempts = (e.detail as { attempts?: unknown }).attempts;
    if (typeof attempts === 'number') { numericAttemptsSeen++; attemptsSeen[id] = attempts; }
    const error = (e.detail as { error?: unknown }).error;
    if (typeof error === 'string') errorsSeen[id] = error;
  };
  scheduler.addEventListener('task.running', noteRunning);
  scheduler.addEventListener('task.completed', noteDone);
  scheduler.addEventListener('task.failed', noteDone);

  // **W58: the scheduler's own account of a task's RESOURCES, per task id, with `task.running`
  // interleaved** — see `RunReport.resourceEvents`. `resource.*` is emitted only once something
  // listens (the scheduler checks for an observer before building the detail), so these
  // listeners are what make the group row observable at all; on every other row they record
  // nothing, because no task names a group and no pool declares one.
  const resourceEvents: Record<string, string[]> = {};
  const heldGroups: Record<string, string[]> = {};
  const noteResource = (name: string) => (e: { detail: unknown }) => {
    const d = e.detail as { holderKind?: string; holderId?: string; groupId?: string };
    if (d?.holderKind !== 'task' || typeof d.holderId !== 'string') return;
    (resourceEvents[d.holderId] ??= []).push(name);
    // W59: the group's ID on every acquisition, so a row can name the group a TYPE declared.
    if (name === 'resource.acquired' && typeof d.groupId === 'string') (heldGroups[d.holderId] ??= []).push(d.groupId);
    if (name === 'resource.blocked' && d.groupId === opts.holdGroup && heldGroupReleases === 0) {
      // The task the row exists for is now parked behind the slot this harness holds. Give the
      // slot back — on a microtask, after the scheduler's own turn, and exactly once.
      heldGroupReleases++;
      queueMicrotask(() => heldGroup!.onFinish());
    }
  };
  for (const n of ['resource.blocked', 'resource.unblocked', 'resource.acquired', 'resource.released']) {
    scheduler.addEventListener(n, noteResource(n));
  }
  scheduler.addEventListener('task.running', (e: { detail: unknown }) => {
    const id = (e.detail as { id?: string })?.id;
    if (typeof id === 'string' && id in resourceEvents) resourceEvents[id]!.push('task.running');
  });
  const schedulerGroups = Object.keys(scheduler.groups as Record<string, unknown>).sort();
  const schedulerPools = Object.keys(scheduler.workerPools as Record<string, unknown>).sort();
  // **W63: which languages each POOL's config carries, read off the built pools** — ADR 0051 rule 4's
  // only observable at this rung. The helper writes an adapter's worker URL into a typed pool's
  // `config.languages` for a type some node of the run's flow transforms on and nowhere else; a bare
  // `pool()` carries `{ role, delayMs }` and so reports none. Read at construction, as the two
  // lists above are, so it is a fact about the scheduler this run was BUILT with.
  const poolLanguages: Record<string, readonly string[]> = Object.fromEntries(
    Object.entries(scheduler.workerPools as Record<string, { config?: { languages?: Record<string, unknown> } }>)
      .map(([name, pool]) => [name, Object.keys(pool.config?.languages ?? {}).sort()]),
  );
  let heldGroupReleases = 0;
  const heldGroup = opts.holdGroup === undefined
    ? null
    : (scheduler.groups as Record<string, ConcurrentLimitGroup | undefined>)[opts.holdGroup] ?? null;
  if (opts.holdGroup !== undefined && heldGroup === null) {
    throw new Error(`holdGroup "${opts.holdGroup}" is not a group this scheduler declares (${schedulerGroups.join(', ')})`);
  }
  // Taken BEFORE `driver.start`, so the gated task finds the slot gone at its first dispatch.
  heldGroup?.onStart();

  const driver = new Driver(definition, {
    runId,
    scheduler,
    // **No `createTask` — deliberately, since W57.** The driver's default is
    // `(config) => new FyflowTask(config)` (ADR 0048), and this is the ONE place a real
    // scheduler is driven, so omitting the option here is what makes ladder L6 run the
    // factory that SHIPS rather than a copy of it written in a harness — `doc/workflow.md`
    // rule 8 obligation (e), *was what it RAN what SHIPS*. Restoring the explicit line is
    // the control: it must cost nothing, because it builds the same object.
    predicates: opts.predicates ?? new Map<string, Predicate>(),
    // **The registry's three sections — W65 (ADR 0054) — the literal `registryFor` derives the
    // helper's per-run object from: one literal, two readings, the helper's carrying the run's delay
    // and threading, which the driver never reads.** Until W65 this was `workerTypes: Object.keys(scheduler.workerPools)`, read off the
    // scheduler rather than written out again (W35's obligation (c) finding: a hand-written list of
    // pool names drifted on the first pool anyone added). A type's default pool exists by
    // construction now, so the pool-key set is the type-key set and `FD-V32` reads `nodeTypes`; what
    // is still read off the scheduler is `schedulerPools`, which `l6.ts` compares to these keys both
    // ways, so a pool the helper did not build, or one no type accounts for, is red there.
    workers: WORKERS,
    nodeTypes: NODE_TYPES,
    pools: POOLS,
    // **The third set, read from the SCHEDULER for the same reason `workerTypes` is — W58,
    // `FD-V31`.** `scheduler.groups` is the map the scheduler resolves a task's `workerGroups`
    // against, so it is the authority the rule names; a hand-written list beside it is what
    // `workerTypes` was before W35 and would drift the same way. Obligation (e), both ways:
    // this direction is closed by construction (the validator's set IS the scheduler's keys),
    // and the other — every group the scheduler declares is one some L6 flow names — is a
    // cross-row clause in `l6.ts` over `RunReport.schedulerGroups`.
    groups: schedulerGroups,
    // **The fifth set — W63 — and it is the OBJECT the helper wrote the pools' worker URLs from**:
    // `FD-V35` checks a transform's `lang` against its keys and `FD-V36` runs each adapter's
    // `compile` at construction; the helper read the same object's `worker` field. One object,
    // two readers, as `nodeTypes` is. Passed on every row — a flow declaring no transform is
    // dispatched byte-identically with it (P17 decision 8, asserted at L2 by W61).
    languages: LANGUAGES,
    joinPolicy: policy,
    onFoldInput: (input) => {
      inputs.push(input);
      state = step(state, input);
      samplePeak();

      // **The inbound step.** A branch has parked on a person; this is the person.
      // Deferred to a microtask rather than called here: `resolve()` appends and
      // routes, and doing that re-entrantly from inside an append would interleave
      // the sequence with itself. The same boundary termination uses, and the same
      // reason — the driver's turn finishes first.
      if (input.kind === 'region' && input.event.type === 'branch.suspended') {
        const how = opts.resolveOnSuspend?.[input.event.branchPath];
        const at = input.event.at;
        const branchPath = input.event.branchPath;
        // **Recorded from `input.event` DIRECTLY, not from the `at` local above.**
        // The first version of this line read `suspendedAt[branchPath] = at`, which
        // is the same variable the resolve step uses — so substituting the row's
        // own node for the event's swapped BOTH sides at once and the assertion
        // compared a declaration with itself. W23's adequacy reader's probe still
        // cost 0 after the "fix". Reading the event here is what makes this a
        // second source.
        suspendedAt[branchPath] = input.event.at;
        if (how) {
          queueMicrotask(() => {
            // `resolve()` is called with no caller on the stack, so a refusal
            // during the routing it triggers would surface as an uncaught
            // rejection rather than as a result. The harness's whole design is
            // that a failure is *reported*; this is that, applied to itself.
            //
            // **`branchIndices`, not `Number` — [Q117](../doc/open-questions.md),
            // fixed by [W23](../doc/work-items/w23-a-nested-flow-on-real-workers.md).**
            // This read `Number(branchPath)`, which is right at depth 1 and wrong
            // in two different ways below it. At depth 2 `Number('1.0')` is **1**,
            // not `NaN`: the harness minted `r*:node:1:0` — a **well-formed id for
            // a different task** — and `resolve()` refused it as not-suspended,
            // reporting a real failure under a false cause. At depth 3
            // `Number('1.1.0')` **is** `NaN` and `buildTaskId` throws since W21's
            // `INDEX` test, which is why the call is now **inside** the `try`:
            // it used to sit outside it, in a `queueMicrotask`, so the throw
            // surfaced as an unhandled rejection rather than as a harness failure.
            //
            // `branchIndices` is `buildTaskId`'s exact inverse and needs no new
            // export — `index.ts` re-exports `src/driver/ids.ts` whole.
            let taskId = `<unminted ${at}:${branchPath}>`;
            try {
              taskId = buildTaskId(runId, at, branchIndices(branchPath), 0);
              if (driver.resolve(taskId, how.as, { result: how.result, actor: how.actor })) {
                resolved.push(taskId);
              } else {
                failures.push(`resolve() refused ${taskId} — RS-R1 says it was not suspended`);
              }
            } catch (e) {
              failures.push(`resolve() threw for ${taskId}: ${e instanceof Error ? e.message : String(e)}`);
            }
          });
        }
      }
      if (checkQueued) return;
      checkQueued = true;
      // **A boundary, not a timeout.** The driver routes synchronously inside the
      // scheduler's listener and appends a settlement BEFORE the routing it
      // causes, so a prefix read mid-turn is not a resting state: between
      // `ingest` settling and its successor being dispatched there is momentarily
      // nothing running (`completed`), and between the last branch arriving and
      // the join firing the state is momentarily `stuck`. A microtask queued
      // during the turn runs after all of it.
      queueMicrotask(() => {
        checkQueued = false;
        // **Sampled HERE and nowhere else.** `spec/run-state.md` section 3 defines
        // the precedence at a quiescent point, and this microtask IS that point —
        // the driver routes synchronously inside the scheduler's listener, so by
        // now its turn is over. Sampling per element instead recorded `completed`
        // and `stuck` for runs that were neither: the exact artefacts section 3's
        // quiescence block enumerates, in a list a row then asserted on. Found by
        // W6's conformity reader, and it is the second occurrence of the failure
        // mode that produced that block.
        //
        // Being quiescent is what makes an EXCLUSION sound as well as an
        // inclusion, so a row can now say which outcomes a run must never have
        // been in.
        if (!outcomesSeen.includes(state.outcome)) outcomesSeen.push(state.outcome);
        if (!isTerminal(state)) return;
        // **The whole record of "the run was declared finished", and there is no
        // longer a boolean beside it.** `declaredFinished` was deleted here: with
        // `finishedBy` coming from the race and `lateInputs` derived from this
        // index, nothing read it, and `deno lint` said so. Two fields removed, two
        // second-sources-of-truth gone — which is the same repair, twice.
        //
        // The sequence as the fold saw it at the quiescent point that declared the
        // run over. `RN-R12` says no more input is coming; `lateInputs` below is
        // that claim, checked.
        finishIndex = inputs.length;
        settle?.();
      });
    },
    // A refusal reaches the sequence as `{ kind: 'stopped' }` and the fold reports
    // `stopped`, so this exists only so a failure is legible in the report.
    onRunFailure: (f) => { failures.push(`${f.kind}: ${f.message}`); failureKinds.push(f.kind); },
    // **Kept whole, and NOT folded into `failures`.** See `RunReport.failures`:
    // the two callbacks report different things and only one of them stops a run.
    // Copied field by field rather than retained, for `OR-R1`'s reason applied to
    // our own surface — the driver hands out a fresh object here, but a harness
    // that retains what a callback gave it is the habit that produced ADR 0007.
    onUnsatisfiableJoin: (j) => {
      unsatisfiableJoins.push({
        fanoutId: j.fanoutId, joinId: j.joinId, policyId: j.policyId, describe: j.describe,
      });
    },
    // **`ID-R5` — and this callback MUST NOT THROW.**
    // [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
    // invokes it inside `onEventOrThrow`, so a throw here is caught at the
    // listener boundary and stops the run under the consumer's own error class —
    // reinstating, through this harness, exactly the damage the decision removed.
    // Documented rather than guarded upstream, so the obligation is ours: four
    // field reads and a push, and nothing that can raise.
    //
    // Copied field by field for `OR-R1`'s reason applied to our own surface. The
    // driver hands out a fresh object; a harness that retains what a callback gave
    // it is the habit that produced ADR 0007.
    onUnmintedTask: (u) => {
      unmintedTasks.push({ runId: u.runId, event: u.event, taskId: u.taskId, reason: u.reason });
    },
  });

  const startedAt = Date.now();
  driver.start(payload);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const backstop = new Promise<'backstop'>((resolve) => {
    timer = setTimeout(() => resolve('backstop'), backstopMs);
  });
  // **The winner names itself.** See the declaration of `finished` above for why
  // this is not `declaredFinished ? … : …` any more.
  const finishedBy: 'run-state' | 'backstop' = await Promise.race([finished, backstop]);
  if (timer !== undefined) clearTimeout(timer);
  // **Derived from the sequence, not tracked beside it.** On the backstop row the
  // predicate never fired, so there is no "after" to be late relative to and the
  // list is empty by definition; on every other row it is everything the driver
  // appended after the run was declared over, which `RN-R12` says is nothing.
  const lateInputs = finishedBy === 'backstop'
    ? []
    : inputs.slice(finishIndex < 0 ? 0 : finishIndex).map((i) => i.kind);
  const wallMs = Date.now() - startedAt;

  // **Read BEFORE `shutdown()`, and the order is the whole point.**
  //
  // `shutdown()` drains the scheduler, and a drain does more work: it settles
  // whatever was still in flight, the driver routes it, and the state advances.
  // Reading after it therefore reports a *finished* run no matter how the wait
  // ended — which is how a 1 ms backstop passed every assertion on the one row
  // whose declared result IS the backstop, and, one item earlier, how replacing
  // the whole termination mechanism with a timer passed all 72
  // ([ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)'s
  // *Correction*).
  //
  // **Twice now, the same shape**: `shutdown()` silently repairing a harness that
  // stopped waiting too early. Reading first is what makes the wait's outcome
  // observable at all — and it is safe precisely because `lateInputs` asserts
  // nothing arrives after a run is declared finished.
  const dispatched = driver.dispatchedIds();
  const settled: Record<string, string | null> = {};
  for (const id of dispatched) settled[id] = driver.terminalStateOf(id);
  const log = driver.snapshot();
  const finalState = state;
  // **And what the SCHEDULER holds, sampled at the same quiescent point** — W57. Not at the
  // report literal below: by then the retention observer has awaited, and the first version of
  // this read `scheduler.tasks.size` there and saw **0 on every row**, which the cross-row
  // non-vacuity clause in `l6.ts` caught on its first run.
  const tasksHeld = scheduler.tasks.size;
  const fyflowTasksHeld = [...scheduler.tasks.values()].filter((t) => t instanceof FyflowTask).length;

  // **What the driver is still holding, read in the same place and for the same
  // reason `dispatched` is: BEFORE `shutdown()`** — W55. A drain settles what was in
  // flight and the driver routes it, so a collection read afterwards would be a
  // collection at a different moment in the run.
  const endByRegion: Record<string, number> = {};
  for (const [region, held] of arrivalsOf(driver)) endByRegion[region] = held.size;
  const peakValues = [...peakSnapshot.values()].flatMap((m) => [...m.values()]);
  // **Identity, not equality** — `JP-R12`'s *second copy* claim. `OR-R2` deep-copies
  // at the listener boundary and `advance` clones again for the edge hop, so an
  // arrived payload that WERE a log record's own object would mean one of those two
  // clones had stopped happening. Counted rather than asserted here: this file
  // reports, `examples/l6.ts` asserts.
  const logged = new Set<unknown>(loggedResults(driver));
  const sum = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
  const retention: Retention = {
    peakByRegion,
    endByRegion,
    peakEntries: sum(peakByRegion),
    endEntries: sum(endByRegion),
    peakAliasingLog: peakValues.filter((v) => logged.has(v)).length,
    loggedResults: logged.size,
    snapshotEntries: peakValues.length,
    bytesAtEnd: await retainedBytes(driver),
    bytesBeforeRelease: await retainedBytes(driver, [[...peakSnapshot].map(([r, m]) => [r, [...m]])]),
    ...walkOf(driver),
  };
  // **The instrument is dropped once it has been read, and that is observer 2's
  // whole standing** — W55's conformity reader, BLOCKING.
  //
  // `samplePeak` closes over `peakSnapshot`, `samplePeak` is reachable from
  // `onFoldInput`, and `onFoldInput` is on `driver.opts` — which `retainedBytes`
  // skips by name. So observer 1 could not see it and observer 2 could: under
  // `keepDriver` every kept driver transitively retained **a second copy of the very
  // collection ADR 0046 releases**. Measured at `scale 50 16 16 own`: **141.9 MiB as
  // shipped against 129.4 MiB with this line**, which is 256 KiB a run — exactly one
  // collection each, 9% of the figure being reported. *A sensor cannot corroborate
  // itself, and here the second sensor was measuring the first one's instrument.*
  peakSnapshot.clear();

  // REQUIRED, or the process stays alive (`AGENTS.md` §2) — but only for a
  // scheduler this run BUILT. A shared one belongs to the caller (`runPair`),
  // and shutting it down here would drain the other run out from under itself.
  if (ownsScheduler) await scheduler.shutdown();

  return {
    runId,
    flowId: definition.flowId,
    policyId: policy.id,
    state: finalState,
    inputs,
    dispatched,
    settled,
    log,
    settledByScheduler: [...settledByScheduler],
    tasksHeld,
    fyflowTasksHeld,
    settlementsSeen,
    numericAttemptsSeen,
    attemptsSeen,
    errorsSeen,
    resourceEvents,
    heldGroups,
    schedulerGroups,
    schedulerPools,
    poolLanguages,
    heldGroupReleases,
    wallMs,
    outcomesSeen,
    resolved,
    suspendedAt,
    finishedBy,
    timedOut: finishedBy === 'backstop',
    failures,
    unsatisfiableJoins,
    failureKinds,
    unmintedTasks,
    lateInputs,
    branchesOverlapped,
    retention,
    driver: opts.keepDriver === true ? driver : undefined,
  };
}