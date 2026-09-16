/**
 * **`fail` — one throwing worker; what it produces is decided by the NODE.**
 *
 * TWO node types name this one worker — `ReviewWorker` and `ExtractWorker` — which is P18 fact 3 on
 * the tree that ships: two `WorkerManager`s over one worker URL are two pools. Four flows reach them
 * and they get four different things, which is the clearest demonstration in the repository that the
 * outcome is a property of the definition rather than of the worker:
 *
 *   optional, no failure edge  -> settles `failed`, branch LOST
 *   optional, `on:["failed"]`  -> settles `failed`, branch EXITED
 *   NOT optional               -> ends `user_action`, branch SUSPENDED
 *   outside a region           -> settles `failed` and routes on
 *
 * The first two are the scheduler's `if (task.optional)` branch; the third is the other one.
 * ADR 0007 rule 2, measured before P2 was written.
 */
import { type Envelope, FlowWorker } from './shared.ts';

export default class FailWorker extends FlowWorker {
  protected compute(_envelope: Envelope): unknown {
    throw new Error('flaky worker: this task is meant to fail');
  }
}
