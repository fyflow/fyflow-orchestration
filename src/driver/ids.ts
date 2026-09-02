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
/** One `branchPath` segment, as `spec/task-id.md` section 1 spells it. */
const INDEX = /^(?:0|[1-9][0-9]*)$/;

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
 * @param branchIndex the node's branch **path** — an index, an array of indices
 *   outermost-first for a node inside nested regions, or `null` for a node with
 *   no unique enclosing region. `FD-V19` and `FD-V22` are what make it a property
 *   of the node rather than of the traversal, and `branchPathOf` in
 *   `../definition/regions.ts` is what derives it. The array form is W21's; the
 *   scalar form is P1's and is unchanged.
 */
export function buildTaskId(
  runId: string,
  nodeId: string,
  branchIndex: number | readonly number[] | null,
  attempt = 0,
): string {
  assertRunId(runId);
  if (!SEGMENT.test(nodeId)) throw new InvalidTaskId(`nodeId ${JSON.stringify(nodeId)} is not [A-Za-z0-9_-]{1,64}`);
  if (!Number.isInteger(attempt) || attempt < 0) throw new InvalidTaskId(`attempt must be a non-negative integer`);
  const path = branchPathSegment(branchIndex);
  return `${runId}:${nodeId}:${path}:${attempt}`;
}

/**
 * `null` -> `'-'`; `1` -> `'1'`; `[1, 0]` -> `'1.0'`. **The exact inverse of
 * `branchIndices`**, which has existed since P1 and had no partner — the two
 * halves of one conversion, with only one of them written.
 *
 * **The array form is new at W21 and the scalar form is unchanged**, so every
 * caller written against `number | null` still compiles and still means what it
 * meant. `spec/task-id.md` section 1 reserved the dotted shape in P1 on the
 * ground that *"an id format change is a change to every fixture, every log line
 * and every test name written before it"*; widening rather than replacing is
 * that argument honoured rather than restated.
 */
function branchPathSegment(branchIndex: number | readonly number[] | null): string {
  if (branchIndex === null) return '-';
  const parts = typeof branchIndex === 'number' ? [branchIndex] : branchIndex;
  if (parts.length === 0) {
    throw new InvalidTaskId('branchPath must be null for a node in no region, never an empty path');
  }
  for (const n of parts) {
    // **`String(n)` must match the grammar, not merely be a non-negative integer**
    // — W21's conformity reader. `Number.isInteger(1e21)` is `true` and
    // `String(1e21)` is `"1e+21"`, which `spec/task-id.md` section 1's
    // `^(0|[1-9][0-9]*)$` refuses: `buildTaskId` could mint an id `parseTaskId`
    // rejects, so *"the exact inverse of `branchIndices`"* was not total over the
    // declared parameter type. Unreachable from `branchPathOf`; reachable from a
    // caller, and this is exported from the package root.
    // **One clause, and it used to be three.** `!Number.isInteger(n) || n < 0`
    // came first; the `INDEX` test was added when W21's conformity reader found
    // that `1e21` passed both and minted `"1e+21"`, which `parseTaskId` refuses.
    // The adequacy reader's re-run then showed the first two had become dead —
    // `INDEX.test(String(-1))` and `INDEX.test(String(1.5))` are both already
    // false — so they are removed rather than kept as guards that cannot fire.
    // **The predicate is now exactly `spec/task-id.md` section 1's own**: what
    // `parseTaskId` will accept back, tested on the string this will actually emit.
    if (!INDEX.test(String(n))) {
      throw new InvalidTaskId(`branchPath segment ${JSON.stringify(n)} is not a non-negative integer`);
    }
  }
  return parts.join('.');
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

/**
 * `'-'` → `null`; `'1'` → `[1]`; `'1.0'` → `[1, 0]`.
 *
 * **The dotted form is no longer a reserved shape.** `FD-V15` was retired by W20
 * and W21 gave this function the partner it had lacked since P1 — `buildTaskId`
 * now accepts what this returns, so the two are a round trip rather than one
 * half of one.
 */
export function branchIndices(branchPath: string): number[] | null {
  return branchPath === '-' ? null : branchPath.split('.').map(Number);
}
