/**
 * The join-policy seam — `spec/join-policy.md` section 1.
 *
 * **W3 defines the seam and ships no policy.** `JP-R1`'s pure state machines are
 * W2's, and which of them is right is W4's question. A driver that decided
 * satisfaction itself would answer [Q4](../../doc/open-questions.md) from inside
 * W3, where nobody is looking for it.
 *
 * The types here are the shapes the spec fixes, so W2 implements against a
 * declaration rather than against `src/driver/driver.ts`.
 */
import type { RegionEvent } from './events.ts';

/** A JSON value. Not the structured-cloneable set — `describe` is for display and for a matrix cell. */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

/**
 * What a policy is given at `open`. Computed at instantiation by
 * `spec/flow-definition.md` section 4 and handed over by the driver.
 */
export interface Region {
  fanoutId: string;
  joinId: string;
  /** Branch entries **in declaration order**. An index here is the `branchPath` segment. */
  branches: string[];
  /** `region(F)`, **sorted by node id** so the value is stable across folds. */
  members: string[];
}

export type JoinStatus = 'waiting' | 'satisfied' | 'unsatisfiable';

/**
 * A pure state machine over one fan-out region. `S` is the policy's own opaque
 * state; nothing outside the policy reads it, and `describe` is the only way its
 * contents leave.
 */
export interface JoinPolicy<S = unknown> {
  /** `'arrival-count'` | `'live-token'`, or a Q24 variant under its own id. */
  readonly id: string;
  open(region: Region): S;
  step(state: S, event: RegionEvent): S;
  /** Total: every reachable state answers one of the three (`JP-R3`). */
  status(state: S): JoinStatus;
  /** Plain JSON, for W4's matrix and for a future UI (`JP-R2`). */
  describe(state: S): JsonValue;
}

/** What the driver reports when a policy says a join can never fire. */
export interface UnsatisfiableJoin {
  fanoutId: string;
  joinId: string;
  /** The policy's own account of what it was waiting for. */
  describe: JsonValue;
  policyId: string;
}
