/**
 * **`retry` — it fails ONCE per task id, then succeeds — W58.**
 *
 * It exists because no other worker here FAILS ONCE: `fail` fails every time, so a retry policy on
 * it only spends the budget. This one throws on the first attempt of a task id and returns on the
 * second, which is the only way a real scheduler ever sets a non-zero `attempts` on a task that
 * settles `done`.
 *
 * See `thrownOnce` in `./shared.ts` for why the task id is read, what it is NOT used for, and why
 * the pool that runs this must be inline. The second attempt's result is `score`'s shape plus a
 * marker, so a row can tell a retried settlement from a first-attempt one by the VALUE as well as by
 * `attempts`.
 */
import { confidenceOf, type Envelope, FlowWorker, thrownOnce } from './shared.ts';
import type { TaskWorkerContext } from 'fyflow-scheduler';

export default class RetryWorker extends FlowWorker {
  protected compute(envelope: Envelope, context?: TaskWorkerContext): unknown {
    const id = context?.taskId ?? '';
    if (!thrownOnce.has(id)) {
      thrownOnce.add(id);
      throw new Error(`retry worker: first attempt of ${id} fails on purpose`);
    }
    const c = confidenceOf(envelope.input);
    return { confidence: c, score: Math.round(c * 100), retried: true };
  }
}
