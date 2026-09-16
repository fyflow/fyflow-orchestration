/**
 * **`publish` — the node after a join, and what it echoes is the JOIN's collection.**
 *
 * The `input` here is an object keyed by the `branchPath` of every branch that arrived, valued by
 * what that branch carried in
 * ([ADR 0037](../../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md),
 * `JP-R12`). **It is `{}` when nothing arrived**, which `live-token` makes reachable, so the `?? null`
 * is a guard for a node reached OUTSIDE a region rather than for the join case.
 *
 * *(This read **"The payload here is `null`. A satisfied join carries nothing downstream"** until
 * Q36 landed, and the thing that broke was the EXPECTATION rather than this worker, because the echo
 * was written to pass the value through rather than to interpret it.)*
 */
import { type Envelope, FlowWorker } from './shared.ts';

export default class PublishWorker extends FlowWorker {
  protected compute(envelope: Envelope): unknown {
    return { published: true, joinPayload: envelope.input ?? null };
  }
}
