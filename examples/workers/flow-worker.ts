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

type Role = 'ingest' | 'score' | 'publish' | 'fail' | 'uncloneable' | 'split' | 'tally';

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
      case 'split':
        // **A map's ARITY, and it is a fact about this return value** — W35, and
        // the whole of what ladder L6 adds to
        // [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md)'s fixtures.
        //
        // The number of tasks the run dispatches is `items.length`, and that number
        // appears in **no** field of the flow definition and in **no** constant in
        // the harness: the definition says `over: "items"` and nothing about how
        // many, and `examples/l6.ts` declares the ids it EXPECTS, which is what
        // makes a miscount a failure rather than a silent re-plan. A `fanout`
        // cannot reach this shape — `FD-V9` requires its branch entries to be
        // written down.
        //
        // **One item per word, and each carries a DIFFERENT confidence**, derived
        // from its own word's length. That is not decoration: handed the whole
        // value rather than its own item, every instance would compute the same
        // score and the row could not tell
        // [ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
        // rule 3 from its negation. `'a bb ccc'` gives 0.1, 0.2, 0.3.
        //
        // **Total, like `confidenceOf`**: no text is zero items, which is a lawful
        // map (`FD-R2` says an empty array is not the refusal) and the arity
        // `FD-V9`'s floor means the static feature can never produce.
        //
        // **The items are MEMOISED per word, and that is what makes ADR 0037's own
        // INVARIANT falsifiable at L6 — W35's adequacy reader.** Rule 1 is *no two
        // nodes ever receive the same object*, and the driver's per-instance
        // `cloneValue` is what holds it: `structuredClone` preserves aliasing WITHIN
        // one clone, so an `items` array holding one object twice survives the edge
        // hop still holding it twice. **Dropping that clone cost 0 failures**, because
        // every payload here produced distinct items and L6 could not express the
        // case the driver's own comment names. One word cached per word is the
        // natural way to produce it: `'a bb ccc'` is unchanged, and `'a a'` is two
        // references to one object.
        return {
          confidence: confidenceOf(payload),
          items: memoisedItems(wordsOf(payload)),
        };
      case 'tally':
        // **A worker that MUTATES what it was handed**, and the only one here that
        // does. It is what turns *two instances share an object* from an identity
        // fact into an observable one: sharing makes the second instance read the
        // first's write, so the two results differ. With the clone in place both
        // read `seen: 1`.
        //
        // **Deliberately not defensive.** A worker that copies its input first would
        // be correct practice and would measure nothing; ADR 0037 rule 1 exists so
        // that a worker need not.
        {
          const p = (payload ?? {}) as { seen?: number; word?: string };
          p.seen = (p.seen ?? 0) + 1;
          return { seen: p.seen, word: typeof p.word === 'string' ? p.word : null };
        }
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
        // **The payload here is the JOIN's collection** — an object keyed by the
        // `branchPath` of every branch that arrived, valued by what that branch
        // carried in ([ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md),
        // `JP-R12`). **It is `{}` when nothing arrived**, which `live-token` makes
        // reachable, so `?? null` is a guard for a node reached outside a region
        // rather than the join case.
        //
        // *(This read **"The payload here is `null`. A satisfied join carries
        // nothing downstream, which is a placeholder rather than an answer — and a
        // worker that assumed otherwise would be the first thing to break when Q36
        // lands."** It landed, and the thing that broke was the EXPECTATION rather
        // than this worker, because the echo was written to pass the value through
        // rather than to interpret it.)*
        return { published: true, joinPayload: payload ?? null };
    }
  }
}

/** Total, and it never throws: a worker that rejects on a shape is a worker that hides a routing bug. */
function confidenceOf(payload: unknown): number {
  const c = (payload as Partial<Confidence> | null | undefined)?.confidence;
  return typeof c === 'number' ? c : 0;
}

/**
 * The words of `text`, and **total for the same reason `confidenceOf` is**.
 *
 * `''.split(' ')` is `['']` rather than `[]`, so the filter is what makes *no
 * text* mean *no items* — and that is the row `FD-V9`'s arity floor makes
 * unreachable for a `fanout`, so it is worth one line rather than a `?? []`.
 */
function memoisedItems(words: readonly string[]): { word: string; confidence: number }[] {
  const seen = new Map<string, { word: string; confidence: number }>();
  return words.map((word) => {
    const hit = seen.get(word);
    if (hit) return hit;
    const made = { word, confidence: word.length / 10 };
    seen.set(word, made);
    return made;
  });
}

function wordsOf(payload: unknown): string[] {
  const t = (payload as { text?: unknown } | null | undefined)?.text;
  return (typeof t === 'string' ? t : '').split(' ').filter((w) => w.length > 0);
}
