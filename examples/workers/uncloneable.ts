/**
 * **`uncloneable` — a result `structuredClone` refuses**, which is `OR-R6`'s whole condition.
 *
 * It reaches the driver only from an **inline** pool: across a worker-thread boundary the scheduler
 * refuses it first and the task ends `user_action` with no result at all
 * ([Q61](../../doc/questions/q61.md)). A function is the smallest such value, so the `MergeWorker`
 * type that names this worker declares `inline: true` and must.
 */
import { type Envelope, FlowWorker } from './shared.ts';

// **No `outputSchema` in the registry, and this is why**: this worker returns a FUNCTION, which is
// not a JSON value, so no JSON Schema describes it — P19 fact 1's second undescribable worker, and
// `check-workers` reports it NOT CHECKED by name (W72). The whole point of the worker is that the
// value does not survive the clone; a schema over it would be a claim about a value nobody receives.
export default class UncloneableWorker extends FlowWorker {
  protected compute(_envelope: Envelope): unknown {
    return { fn: () => 1 };
  }
}
