/**
 * The scheduler task id scheme — `spec/task-id.md`.
 *
 *   <runId> ":" <nodeId> ":" <branchPath> ":" <attempt>
 *
 * Four segments, always four. The parse is total because `:` and `.` are outside
 * the runId/nodeId charset, which is what lets an outcome record carry the id
 * alone and derive everything else.
 *
 * This is a correctness rule rather than a naming convention. At 0.3.0 a reused
 * id does not lose a task: `addTask` sets the map entry AND pushes to the ready
 * queue (`core/FyflowScheduler.ts:444-445`), the success path settles each object
 * on its own outcome (`:723-727`), and two `task.completed` fire under one id.
 * `ID-R1` refuses the dispatch before `addTask` can see it.
 */

const SEGMENT = /^[A-Za-z0-9_-]{1,64}$/;
const BRANCH_PATH = /^(?:-|(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*))*)$/;
const ATTEMPT = /^(?:0|[1-9][0-9]*)$/;

export interface TaskIdParts {
  runId: string;
  nodeId: string;
  /** `'-'` when the node is in no fan-out region; otherwise outermost-first indices. */
  branchPath: string;
  /** The **flow-level** attempt (Q16). Not the scheduler's `attempts`, which counts retries within one task. */
  attempt: number;
}

export class InvalidRunId extends Error {}
export class InvalidTaskId extends Error {}

/** `ID-R2` — enforced at run creation, the half `FD-V16` cannot check. */
export function assertRunId(runId: string): void {
  if (!SEGMENT.test(runId)) {
    throw new InvalidRunId(`runId ${JSON.stringify(runId)} is not [A-Za-z0-9_-]{1,64}`);
  }
}

/**
 * @param branchIndex the node's branch index within its enclosing region, or
 *   `null` when it is in none. `FD-V19` and `FD-V22` are what make this a
 *   property of the node rather than of the traversal.
 */
export function buildTaskId(
  runId: string,
  nodeId: string,
  branchIndex: number | null,
  attempt = 0,
): string {
  assertRunId(runId);
  if (!SEGMENT.test(nodeId)) throw new InvalidTaskId(`nodeId ${JSON.stringify(nodeId)} is not [A-Za-z0-9_-]{1,64}`);
  if (!Number.isInteger(attempt) || attempt < 0) throw new InvalidTaskId(`attempt must be a non-negative integer`);
  const path = branchIndex === null ? '-' : String(branchIndex);
  return `${runId}:${nodeId}:${path}:${attempt}`;
}

/** Total for any id this module built. Throws only on a string that did not come from here. */
export function parseTaskId(taskId: string): TaskIdParts {
  const parts = taskId.split(':');
  if (parts.length !== 4) {
    throw new InvalidTaskId(`task id ${JSON.stringify(taskId)} has ${parts.length} segments, expected exactly 4`);
  }
  const [runId, nodeId, branchPath, attempt] = parts as [string, string, string, string];
  if (!SEGMENT.test(runId)) throw new InvalidTaskId(`runId segment is not [A-Za-z0-9_-]{1,64}`);
  if (!SEGMENT.test(nodeId)) throw new InvalidTaskId(`nodeId segment is not [A-Za-z0-9_-]{1,64}`);
  if (!BRANCH_PATH.test(branchPath)) throw new InvalidTaskId(`branchPath segment ${JSON.stringify(branchPath)} is malformed`);
  if (!ATTEMPT.test(attempt)) throw new InvalidTaskId(`attempt segment ${JSON.stringify(attempt)} is malformed`);
  return { runId, nodeId, branchPath, attempt: Number(attempt) };
}

/** `'-'` → `null`; `'1'` → `[1]`; `'1.0'` → `[1, 0]` (reserved shape, nested fan-out is FD-V15). */
export function branchIndices(branchPath: string): number[] | null {
  return branchPath === '-' ? null : branchPath.split('.').map(Number);
}
