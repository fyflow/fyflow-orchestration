/**
 * **`uncloneable` — a result `structuredClone` refuses**, which is `OR-R6`'s whole condition.
 *
 * It reaches the driver only from an **inline** pool: across a worker-thread boundary the scheduler
 * refuses it first and the task ends `user_action` with no result at all
 * ([Q61](../../doc/open-questions.md)). A function is the smallest such value, so the `MergeWorker`
 * type that names this worker declares `inline: true` and must.
 */
import { type Envelope, FlowWorker } from './shared.ts';

export default class UncloneableWorker extends FlowWorker {
  protected compute(_envelope: Envelope): unknown {
    return { fn: () => 1 };
  }
}
