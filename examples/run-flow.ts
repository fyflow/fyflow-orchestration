/**
 * Ladder **L6** — one real run, on a real `FyflowScheduler`, with real workers.
 *
 * This is the only code in the repository that touches the library. Everything
 * under `src/` talks to `SchedulerLike`, a structural interface with two methods
 * (`ADR 0001`, and [ADR 0013](../doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
 * rule 1: the published package depends on the scheduler **not at all**).
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
 * hang is **reported** rather than hung on, and reaching it is a FAILURE.
 */
// Everything from the package entry, never from `src/` — an example that reached
// past `index.ts` would be exercising a surface no consumer has.
import {
  Driver, buildTaskId, emptyState, isTerminal, step,
  type FlowDefinition, type FoldInput, type JoinPolicy, type LogRecord,
  type Predicate, type RunOutcome, type RunState,
} from '../index.ts';
import { FyflowScheduler, FyflowTask, WorkerManager } from 'fyflow-scheduler';

/** The three pools `spec/examples/registry.json` names, all served by one worker file. */
const WORKER_URL = new URL('./workers/flow-worker.ts', import.meta.url).href;

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
   * became true at a quiescent point — the only acceptable answer. `'backstop'`
   * means the wall clock did, and the run is a failure whatever else it reports.
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
   * **Read as an inclusion, never as an exclusion.** `spec/run-state.md` section
   * 3 says the precedence is defined at a quiescent point, and this samples every
   * element, so it also contains mid-turn artefacts. *Did this run ever reach X*
   * is answerable from it; *did it never reach Y* is not.
   */
  outcomesSeen: readonly RunOutcome[];
  /** Task ids resolved by the inbound step, in the order it resolved them. */
  resolved: readonly string[];
  /** Anything `onRunFailure` or `onUnsatisfiableJoin` reported. Empty on every run W5 declares. */
  failures: readonly string[];
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
   */
  resolveOnSuspend?: Record<string, { as: 'done' | 'failed'; result?: unknown; actor: string }>;
}

export async function runFlow(opts: RunOptions): Promise<RunReport> {
  const { definition, policy, runId, payload } = opts;
  const delayMs = opts.delayMs ?? 5;
  const backstopMs = opts.backstopMs ?? 10_000;

  const pool = (role: string, threaded: boolean, maxThreads = 1) =>
    new WorkerManager(WORKER_URL, {
      maxThreads,
      inline: !threaded,
      config: { role, delayMs },
      // The pools are torn down by `shutdown()` at the end of the run, so an idle
      // sweep would only race it. Nothing here shares a resident group, which is
      // the one case `AGENTS.md` says `idleTimeout: 0` deadlocks.
      idleTimeout: 0,
    });

  const scheduler = new FyflowScheduler({
    IngestWorker: pool('ingest', false),
    // The fan-out pool, and the only one that may run on real threads: it is the
    // one place two tasks are in flight at once, so it is where a dispatch race
    // or an id collision would show.
    ScoreWorker: pool('score', opts.threaded === true, 2),
    PublishWorker: pool('publish', false),
    // Reached only by a flow that names it. Its worker always throws — and what
    // that produces is decided by the NODE, not by the pool: `optional: true`
    // settles `failed` (a branch LOST), `optional: false` ends in `user_action`
    // (a branch SUSPENDED). One worker, two outcomes, chosen by the definition.
    // Measured before W6 was declared; ADR 0007 rule 2.
    ReviewWorker: pool('fail', false),
    ExtractWorker: pool('fail', false),
    // **Inline, and it must be.** A result `structuredClone` refuses reaches the
    // driver intact from an inline pool, which is what makes `OR-R6` reachable at
    // all; from a thread pool the scheduler refuses it first and the task ends
    // `user_action` with no result ever reaching us. [Q61](../doc/open-questions.md).
    MergeWorker: pool('uncloneable', false),
  });

  const inputs: FoldInput[] = [];
  const failures: string[] = [];
  const lateInputs: string[] = [];
  const outcomesSeen: RunOutcome[] = [];
  const resolved: string[] = [];
  let state = emptyState();
  let settle: (() => void) | null = null;
  const finished = new Promise<void>((resolve) => { settle = resolve; });
  let checkQueued = false;
  let declaredFinished = false;

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
  const noteDone = (e: { detail: unknown }) => {
    const id = (e.detail as { id?: string })?.id;
    if (typeof id !== 'string') return;
    inFlight.delete(id);
    // Read synchronously from the live detail and never retained (`OR-R1`); only
    // the id, which is a string.
    settledByScheduler.add(id);
  };
  scheduler.addEventListener('task.running', noteRunning);
  scheduler.addEventListener('task.completed', noteDone);
  scheduler.addEventListener('task.failed', noteDone);

  const driver = new Driver(definition, {
    scheduler,
    createTask: (config) => new FyflowTask(config),
    predicates: opts.predicates ?? new Map<string, Predicate>(),
    workerTypes: ['IngestWorker', 'ScoreWorker', 'PublishWorker', 'ReviewWorker',
      'ExtractWorker', 'MergeWorker'],
    joinPolicy: policy,
    onFoldInput: (input) => {
      inputs.push(input);
      state = step(state, input);
      if (!outcomesSeen.includes(state.outcome)) outcomesSeen.push(state.outcome);
      if (declaredFinished) lateInputs.push(input.kind);

      // **The inbound step.** A branch has parked on a person; this is the person.
      // Deferred to a microtask rather than called here: `resolve()` appends and
      // routes, and doing that re-entrantly from inside an append would interleave
      // the sequence with itself. The same boundary termination uses, and the same
      // reason — the driver's turn finishes first.
      if (input.kind === 'region' && input.event.type === 'branch.suspended') {
        const how = opts.resolveOnSuspend?.[input.event.branchPath];
        const at = input.event.at;
        const branchPath = input.event.branchPath;
        if (how) {
          queueMicrotask(() => {
            const taskId = buildTaskId(runId, at, Number(branchPath), 0);
            if (driver.resolve(taskId, how.as, { result: how.result, actor: how.actor })) {
              resolved.push(taskId);
            } else {
              failures.push(`resolve() refused ${taskId} — RS-R1 says it was not suspended`);
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
        if (!isTerminal(state)) return;
        declaredFinished = true;
        settle?.();
      });
    },
    // A refusal reaches the sequence as `{ kind: 'stopped' }` and the fold reports
    // `stopped`, so this exists only so a failure is legible in the report.
    onRunFailure: (f) => { failures.push(`${f.kind}: ${f.message}`); },
    onUnsatisfiableJoin: (j) => { failures.push(`unsatisfiable join ${j.joinId} under ${j.policyId}`); },
  });

  const startedAt = Date.now();
  driver.start(runId, payload);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const backstop = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, backstopMs);
  });
  // `declaredFinished` is set only on the `isTerminal` path, so this reads which
  // of the two won rather than trusting a flag the loser also sets.
  await Promise.race([finished, backstop]);
  const finishedBy: 'run-state' | 'backstop' = declaredFinished ? 'run-state' : 'backstop';
  if (timer !== undefined) clearTimeout(timer);
  const wallMs = Date.now() - startedAt;

  await scheduler.shutdown(); // REQUIRED, or the process stays alive (`AGENTS.md` §2).

  const dispatched = driver.dispatchedIds();
  const settled: Record<string, string | null> = {};
  for (const id of dispatched) settled[id] = driver.terminalStateOf(id);

  return {
    runId,
    flowId: definition.flowId,
    policyId: policy.id,
    state,
    inputs,
    dispatched,
    settled,
    log: driver.snapshot(),
    settledByScheduler: [...settledByScheduler],
    wallMs,
    outcomesSeen,
    resolved,
    finishedBy,
    timedOut: finishedBy === 'backstop',
    failures,
    lateInputs,
    branchesOverlapped,
  };
}