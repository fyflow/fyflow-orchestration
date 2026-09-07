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
  /** A key in `buildScheduler`'s pools. */
  workerType: string;
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
  const scheduler = buildScheduler(a.delayMs ?? 5, a.threaded === true);

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
      payload: f.payload ?? null,
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
function buildScheduler(delayMs: number, threaded: boolean): FyflowScheduler {
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
  const SETTLES_LAST = new Set(['fail', 'uncloneable']);
  const pool = (role: string, threaded: boolean, maxThreads = 1) =>
    new WorkerManager(WORKER_URL, {
      maxThreads,
      inline: !threaded,
      config: { role, delayMs: SETTLES_LAST.has(role) ? delayMs * 4 : delayMs },
      // The pools are torn down by `shutdown()` at the end of the run, so an idle
      // sweep would only race it. Nothing here shares a resident group, which is
      // the one case `AGENTS.md` says `idleTimeout: 0` deadlocks.
      idleTimeout: 0,
    });

  return new FyflowScheduler({
    IngestWorker: pool('ingest', false),
    // The fan-out pool, and the only one that may run on real threads: it is the
    // one place two tasks are in flight at once, so it is where a dispatch race
    // or an id collision would show.
    ScoreWorker: pool('score', threaded, 2),
    PublishWorker: pool('publish', false),
    // **Where a map's arity comes from — W35.** Its worker returns an array and
    // the run dispatches one task per element, so this pool is the only reason
    // `examples/flows/map.flow.json` dispatches a number of tasks that is written
    // down nowhere in the definition.
    //
    // **Inline, and unlike `MergeWorker` that is a convenience rather than a
    // constraint**: nothing it returns resists `structuredClone`. It is inline
    // because it runs once per run and a thread would only add a hop.
    SplitWorker: pool('split', false),
    // **The one worker here that MUTATES its payload — W35's adequacy reader.**
    // Inline, and it must be: the whole point is that two map instances handed one
    // object would see each other's write, and a thread boundary would clone it
    // away and hide exactly the case the row exists for.
    TallyWorker: pool('tally', false),
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
}

export async function runFlow(opts: RunOptions): Promise<RunReport> {
  const { definition, policy, runId, payload } = opts;
  const delayMs = opts.delayMs ?? 5;
  const backstopMs = opts.backstopMs ?? 10_000;

  const scheduler = opts.scheduler ?? buildScheduler(delayMs, opts.threaded === true);
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
    runId,
    scheduler,
    createTask: (config) => new FyflowTask(config),
    predicates: opts.predicates ?? new Map<string, Predicate>(),
    // **Read from the SCHEDULER, not written out again — W35, and it is
    // `doc/workflow.md` rule 8's obligation (c) caught by walking into it.**
    //
    // This was a hand-written array of six pool names, a second copy of
    // `buildScheduler`'s keys with nothing comparing them. `FD-V5` is *"a task's
    // `workerType` is not a key in the scheduler's `workerPools`"* — the
    // scheduler's map is the authority the rule names, and the copy could only
    // ever agree with it by hand.
    //
    // **It drifted on the first pool anyone added.** W35 added `SplitWorker` to
    // `buildScheduler` and the copy still said six, so every map row died at
    // construction with `FD-V5 at ingest` — a valid flow refused by a validator
    // reading a stale list. The other direction is the one that matters and is
    // silent: delete a pool from `buildScheduler` and the copy still names it, so
    // `FD-V5` passes and the run dies later inside `addTask`, which throws on an
    // unknown pool. **The rule would have been checking a list rather than the
    // scheduler**, which is the whole of what obligation (c) is about.
    //
    // `FD-V5`'s negative case does not live here in either form — no L6 flow can
    // name a pool this scheduler lacks, by construction — it lives in
    // `spec/examples/invalid/` at L1. What lives here is the derivation.
    workerTypes: Object.keys(scheduler.workerPools as Record<string, unknown>),
    joinPolicy: policy,
    onFoldInput: (input) => {
      inputs.push(input);
      state = step(state, input);

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
  };
}