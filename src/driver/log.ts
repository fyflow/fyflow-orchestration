/**
 * The log — `spec/outcome-record.md`.
 *
 * An ordered, append-only sequence of two record kinds. Run state is a pure fold
 * of it (`doc/concept.md` section 5), and a resolution is a RECORD rather than a
 * mutation precisely so that stays true (ADR 0004 rule 6).
 */
import type { TerminalState } from '../definition/types.ts';

/** Whatever `structuredClone` accepts — broader than JSON, and deliberately so (section 4). */
export type CloneableValue = unknown;

export interface OutcomeRecord {
  kind: 'outcome';
  taskId: string;
  terminalState: TerminalState;
  result: CloneableValue | null;
  error: string | null;
  attempts: number;
  schedulerTimestamp: number;
  observedAt: number;
  startTime: number | null;
  endTime: number | null;
  executionTime: number | null;
}

export interface ResolutionRecord {
  kind: 'resolution';
  taskId: string;
  /** `'done' | 'failed'` — a resolution cannot leave a node in `user_action`; that is what not resolving it is. */
  resolvedAs: 'done' | 'failed';
  result: CloneableValue | null;
  error: string | null;
  /** Opaque. Never interpreted, never authenticated (Q29). */
  actor: string;
  observedAt: number;
  /** There is deliberately no `schedulerTimestamp`: no scheduler was involved. */
}

export type LogRecord = OutcomeRecord | ResolutionRecord;

/**
 * The last record for a task, or `undefined`. `RS-R1`'s discriminator is the
 * **last** record rather than "has a `user_action` record" — which is what makes a
 * second resolution refusable.
 */
export function lastRecordFor(log: readonly LogRecord[], taskId: string): LogRecord | undefined {
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i]!.taskId === taskId) return log[i];
  }
  return undefined;
}

/** `RS-R1` — a task is suspended when its last record is an outcome in `user_action`. */
export function isSuspended(log: readonly LogRecord[], taskId: string): boolean {
  const last = lastRecordFor(log, taskId);
  return last?.kind === 'outcome' && last.terminalState === 'user_action';
}

/**
 * `spec/outcome-record.md` section 6 — the record ROUTING reads, which is never
 * the log directly.
 *
 * The settlement record, with `terminalState`, `result` and `error` replaced by a
 * following resolution's. The execution fields stay the settlement's: they
 * describe the dispatch that actually happened, and a resolution executed nothing.
 *
 * `OR-R8`: derived, never appended. Appending it would make the log contain its
 * own conclusions, and a second fold would derive a third record from the second.
 *
 * @returns `null` when the task has not settled, or has settled `user_action` and
 *   has no resolution — a suspended node has no effective outcome, which is
 *   exactly right: it has not finished and nothing routes.
 */
export function effectiveOutcome(log: readonly LogRecord[], taskId: string): OutcomeRecord | null {
  let settlement: OutcomeRecord | null = null;
  let resolution: ResolutionRecord | null = null;
  for (const r of log) {
    if (r.taskId !== taskId) continue;
    if (r.kind === 'outcome') settlement = r;
    else resolution = r;
  }
  if (!settlement) return null;
  if (!resolution) return settlement.terminalState === 'user_action' ? null : settlement;
  return {
    ...settlement,
    terminalState: resolution.resolvedAs,
    result: resolution.result,
    error: resolution.error,
    // `observedAt` is the resolution's because it is the later record BY APPEND
    // ORDER. Comparing the two Date.now() reads is what OR-R5 refuses, and for a
    // suspended node the gap is hours, not milliseconds.
    observedAt: resolution.observedAt,
  };
}
