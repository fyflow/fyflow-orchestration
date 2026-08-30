/**
 * The listener boundary — ADR 0007, and `spec/outcome-record.md` sections 2-3.
 *
 * The scheduler's `detail` for `task.completed`/`failed`/`user_action` IS the live
 * `FyflowTask` (`core/FyflowScheduler.ts:857, 907, 909, 1139, 1141`). Nothing
 * downstream of this file ever sees a library object.
 *
 * `OR-R1`: every field is read while the listener runs. No `e`, no `e.detail`, and
 * nothing reachable from it is retained. **A `{...e.detail}` spread does not
 * satisfy this** — it copies the top level and still aliases `payload`, `result`
 * and `error`, which is why the field list below is written out one at a time.
 */
import type { TerminalState } from '../definition/types.ts';
import type { OutcomeRecord } from './log.ts';

/** The shape this module reads. Structural on purpose: no dependency on the library's classes. */
export interface TaskDetailLike {
  id: string;
  state: string;
  result?: unknown;
  error?: string;
  attempts?: number;
  timestamp?: number;
  startTime?: number;
  endTime?: number;
  executionTime?: number;
}

export class UncloneableResult extends Error {}

const TERMINAL = new Set<string>(['done', 'failed', 'user_action']);
const num = (x: unknown): number | null => (typeof x === 'number' ? x : null);

/**
 * Normalize one scheduler event into an outcome record, or `null` when the event
 * is not a settlement.
 *
 * `OR-R3` — keyed on `detail.state`, **never on the event name**:
 *
 *   done                      task.completed              -> 1 record
 *   failed (optional task)    task.failed                 -> 1 record
 *   user_action               task.failed, task.user_action -> 1 record, on the SECOND
 *
 * The third row is why this exists. `task.failed` fires for a task that did not
 * fail, its detail already reads `state: 'user_action'`, and a driver keying on
 * the event name writes two records and routes a human-intervention case down an
 * error edge.
 *
 * @param now the driver's own clock read, kept separate from the library's
 *   `timestamp` (ADR 0007 rule 4) — the gap between them is this listener's latency.
 */
export function normalizeEvent(
  eventName: string,
  detail: TaskDetailLike,
  now: number,
): OutcomeRecord | null {
  // OR-R4 — not settlements, and not resolutions either. Whether they are logged
  // at all, and in what shape, is Q26.
  if (eventName === 'task.running' || eventName === 'task.progress') return null;

  const state = detail?.state;
  if (typeof state !== 'string' || !TERMINAL.has(state)) return null;

  // The one line OR-R3 is about: `task.failed` carrying an already-`user_action`
  // task is the precursor to the `task.user_action` that follows for the same
  // object. It writes nothing.
  if (eventName === 'task.failed' && state === 'user_action') return null;
  if (eventName !== 'task.completed' && eventName !== 'task.failed' && eventName !== 'task.user_action') {
    return null;
  }

  const terminalState = state as TerminalState;

  // OR-R2 — the one field whose VALUE is a reference the producer may still hold.
  // An inline pool returns the worker's own object; copying the field copies the
  // reference. Ten of the eleven fields are primitives, so the copy is
  // proportional to the payload a flow moves rather than to the task object.
  let result: unknown = null;
  if (terminalState === 'done') {
    try {
      result = structuredClone(detail.result);
    } catch (cause) {
      // OR-R6 — a result that cannot be cloned cannot be logged, cannot be handed
      // to a predicate deterministically, and could never be persisted (Q15).
      throw new UncloneableResult(
        `UncloneableResult: the result of task "${detail.id}" is not structured-cloneable`,
        { cause },
      );
    }
  }

  return {
    kind: 'outcome',
    taskId: detail.id,
    terminalState,
    result,
    error: typeof detail.error === 'string' ? detail.error : null,
    attempts: typeof detail.attempts === 'number' ? detail.attempts : 0,
    schedulerTimestamp: typeof detail.timestamp === 'number' ? detail.timestamp : now,
    observedAt: now,
    startTime: num(detail.startTime),
    endTime: num(detail.endTime),
    executionTime: num(detail.executionTime),
  };
}
