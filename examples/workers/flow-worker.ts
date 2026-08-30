/**
 * The one worker file, for **both** runtimes — ladder L6, `RT-R10`.
 *
 * `AGENTS.md` §3 says a Node worker *"must be JavaScript"* and shows a
 * `typeof Deno !== 'undefined'` branch for picking `.ts` or `.js`. **Measured at
 * Node 24.20.0, that is no longer true**: this file runs unchanged in Node
 * (`inline` and threaded) and in Deno, because Node runs TypeScript by erasing
 * types. It is [S9](../../doc/scheduler-upstream.md), and it is what made
 * [Q33](../../doc/open-questions.md)'s answer *Node and Deno* rather than
 * *Node only* — the leaning's whole argument was one worker file per runtime.
 *
 * **One class, three roles**, selected by the pool's `config` — which is how
 * `spec/examples/registry.json`'s three `workerType` names are satisfied without
 * three near-identical files.
 *
 * **A worker computes and does not route** ([ADR 0001](../../doc/decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
 * rule 2). `context.taskId` is available and this file does not read it: deriving
 * a score from a branch index is the first step towards a worker that decides
 * where its own output goes. Which branch takes which road is decided by the
 * *entry payload* and the definition's predicate, and by nothing in here.
 */
import { BaseWorker } from 'fyflow-scheduler';
import type { BaseWorkerContext, TaskWorkerContext, WorkerConfig } from 'fyflow-scheduler';

/** What the entry payload carries, and what every hop passes along. */
export interface Confidence {
  confidence: number;
}

type Role = 'ingest' | 'score' | 'publish' | 'fail' | 'uncloneable';

export default class FlowWorker extends BaseWorker {
  private readonly role: Role;
  private readonly delayMs: number;

  // Both arguments forwarded — dropping the second leaves `this.workerContext`
  // undefined and `terminateWithError()` silently does nothing (`AGENTS.md` §4).
  constructor(config: WorkerConfig = {}, workerContext?: BaseWorkerContext) {
    super(config, workerContext);
    const c = config as { role?: Role; delayMs?: number };
    this.role = c.role ?? 'score';
    this.delayMs = c.delayMs ?? 0;
  }

  // Abstract on `BaseWorker`; omitting either is a compile error.
  async setup(): Promise<void> {}
  async teardown(): Promise<void> {}

  async run(payload: unknown, _context?: TaskWorkerContext): Promise<unknown> {
    // A real await, so the two fan-out branches genuinely overlap and their
    // completion order is the scheduler's rather than this file's. Nothing may
    // depend on that order (`doc/concept.md` section 5).
    if (this.delayMs > 0) await new Promise((r) => setTimeout(r, this.delayMs));

    switch (this.role) {
      case 'ingest':
        return { confidence: confidenceOf(payload) };
      case 'score':
        // `score` is derived from the payload alone, so the result is a function
        // of the input and the run is reproducible.
        return { confidence: confidenceOf(payload), score: Math.round(confidenceOf(payload) * 100) };
      case 'fail':
        // **One throwing worker; what it produces is decided by the NODE.** Four
        // flows use this role and they get four different things, which is the
        // clearest demonstration in the repository that the outcome is a property
        // of the definition rather than of the worker:
        //
        //   optional, no failure edge  -> settles `failed`, branch LOST
        //   optional, `on:["failed"]`  -> settles `failed`, branch EXITED
        //   NOT optional               -> ends `user_action`, branch SUSPENDED
        //   outside a region           -> settles `failed` and routes on
        //
        // The first two are `core/FyflowScheduler.ts:894-897`'s `if (task.optional)`
        // branch; the third is the other one. ADR 0007 rule 2, measured before P2
        // was written.
        throw new Error('flaky worker: this task is meant to fail');
      case 'uncloneable':
        // **A result `structuredClone` refuses**, which is `OR-R6`'s whole
        // condition. It reaches the driver only from an **inline** pool: across a
        // worker-thread boundary the scheduler refuses it first and the task ends
        // `user_action` with no result at all ([Q61](../../doc/open-questions.md)).
        // A function is the smallest such value.
        return { fn: () => 1 };
      case 'publish':
        // **The payload here is `null`.** A satisfied join carries nothing
        // downstream ([Q36](../../doc/open-questions.md)), which is a placeholder
        // rather than an answer — and a worker that assumed otherwise would be
        // the first thing to break when Q36 lands.
        return { published: true, joinPayload: payload ?? null };
    }
  }
}

/** Total, and it never throws: a worker that rejects on a shape is a worker that hides a routing bug. */
function confidenceOf(payload: unknown): number {
  const c = (payload as Partial<Confidence> | null | undefined)?.confidence;
  return typeof c === 'number' ? c : 0;
}
