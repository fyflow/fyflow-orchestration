/**
 * The region event vocabulary — `spec/join-policy.md` section 2.
 *
 * Flow-level facts, not scheduler outcomes: the driver derives them while routing,
 * and a join policy never sees an outcome record or a scheduler task.
 *
 * The driver EMITS these. It implements no policy — `JP-R1`'s pure state machines
 * are W2's, and an emission choice here can settle Q4 from inside W3 where nobody
 * is looking for it. Emit to the rule, not for convenience.
 *
 * **Every variant carries `regionId` AND `regionPath`, and the pair is the region
 * INSTANCE** — [ADR 0062](../../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md),
 * [W84](../../doc/work-items/w84-what-a-regions-identity-is.md). `regionId` is the
 * opener's node id and is unchanged in meaning and in value; `regionPath` is that
 * opener's OWN `branchPath`, `'-'` at top level, derived by the same `branchPathOf`
 * every other path here comes from.
 *
 * **Why a second field rather than a qualified `regionId`.** A `map` is the first
 * construct that enters one opener more than once in a run, so a node id alone
 * stopped naming one region. Redefining `regionId` to carry the qualifier was
 * BUILT and measured: it costs twenty-nine diffs and **twelve silent failure
 * modes**, because the composite is a string either way and no type can see a
 * lookup miss. Two fields cost sixty typecheck errors, every one named. *The
 * cheapest road is the one that fails in silence and the dearest is the one whose
 * whole cost a typechecker prints.*
 *
 * *(**Twenty-nine and sixty are the SPIKE's figures for the two designs as it
 * measured them**, and W84 shipped one thing beyond design C — `UnsatisfiableJoin`
 * gained the same field for the same reason — so the churn this item actually paid
 * is **63 typecheck sites in 8 files and 34 L1-L5 failures**, plus **five more in
 * `AGENTS.md` that no typecheck lane reads and `check:docs` does**. W84's conformity
 * reader, finding 4.)*
 */

/** Terminal: at most one per branch, with nothing after it (`JP-R5`). */
export interface BranchArrived { type: 'branch.arrived'; regionId: string; regionPath: string; branchPath: string }
/** Terminal. Fires when the branch reached an **`end` node** — NOT "left the region": */
/** the `end` a routed-away branch reaches is inside `region(F)` (spec section 4). */
export interface BranchExited { type: 'branch.exited'; regionId: string; regionPath: string; branchPath: string; at: string }
/** Terminal. A node reached a terminal state — by settling OR by being resolved — with no eligible edge. */
export interface BranchLost { type: 'branch.lost'; regionId: string; regionPath: string; branchPath: string; reason: 'failed' }

/** Non-terminal: the branch is still live and the join is still waiting. */
export interface BranchOpened { type: 'branch.opened'; regionId: string; regionPath: string; branchPath: string }
export interface BranchSuspended { type: 'branch.suspended'; regionId: string; regionPath: string; branchPath: string; at: string }
export interface BranchResumed {
  type: 'branch.resumed'; regionId: string; regionPath: string; branchPath: string; at: string; resolvedAs: 'done' | 'failed';
}

export type RegionEvent =
  | BranchOpened | BranchArrived | BranchExited | BranchLost | BranchSuspended | BranchResumed;

/**
 * The three terminal event types. Exported because `JP-R5`'s "at most one terminal
 * event per branch" is a property W4's matrix and W5's run both assert over a
 * stream, and both need the same list.
 */
export const TERMINAL_EVENTS = ['branch.arrived', 'branch.exited', 'branch.lost'] as const;

export function isTerminalEvent(e: RegionEvent): boolean {
  return (TERMINAL_EVENTS as readonly string[]).includes(e.type);
}
