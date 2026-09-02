/**
 * The four sets of `spec/flow-definition.md` section 4, and nothing else.
 *
 * This file is separate from the validator on purpose. Two versions of the spec
 * shipped a fan-out region rule that rejected the spec's own valid examples, both
 * times because a set was computed reflexively or without the cut at the join. The
 * definitions live in one place so a rule cannot quietly disagree with the rule
 * next to it about what `region(F)` means.
 *
 *   reaches(X)      nodes reachable from X. IRREFLEXIVE.
 *   branchOf(F,b)   {b} plus everything reachable from b, every path CUT AT J.
 *                   J is not a member.
 *   region(F)       the union of branchOf over F's branch entries. J is not a member.
 *   after(F)        reaches(J). J is not a member of that either.
 */
import type { FlowDefinition, FlowNode } from './types.ts';

export interface Graph {
  byId: Map<string, FlowNode>;
  /** Arcs out of a node: `edges[].to`, or `branches[]` for a fanout. */
  succ: (id: string) => string[];
}

export function buildGraph(doc: FlowDefinition): Graph {
  const byId = new Map<string, FlowNode>();
  for (const n of doc.nodes ?? []) {
    // First wins, so a duplicate id (FD-V1) cannot change which node the region
    // maths sees depending on array order.
    if (typeof n?.id === 'string' && !byId.has(n.id)) byId.set(n.id, n);
  }
  const succ = (id: string): string[] => {
    const n = byId.get(id);
    if (!n) return [];
    if (n.kind === 'fanout') return Array.isArray(n.branches) ? n.branches.filter(isId) : [];
    const edges = (n as { edges?: unknown }).edges;
    return Array.isArray(edges) ? edges.map((e) => (e as { to?: unknown })?.to).filter(isId) : [];
  };
  return { byId, succ };
}

function isId(x: unknown): x is string {
  return typeof x === 'string';
}

/**
 * Nodes reachable from `start`. Irreflexive: traversal begins at `start`'s
 * successors, so `start` is a member only if a path returns to it — and `FD-V10`
 * forbids cycles, so it never is.
 *
 * `stopAt` cuts every path: the named node is neither entered nor included.
 */
export function reaches(g: Graph, start: string, stopAt?: string): Set<string> {
  const seen = new Set<string>();
  const stack = [...g.succ(start)];
  while (stack.length) {
    const x = stack.pop() as string;
    if (!g.byId.has(x) || seen.has(x) || x === stopAt) continue;
    seen.add(x);
    stack.push(...g.succ(x));
  }
  return seen;
}

export interface RegionSets {
  fanoutId: string;
  joinId: string;
  /** Branch entries in declaration order. The index is the `branchPath` segment. */
  branches: string[];
  /** Per branch entry, `{b} ∪ reaches(b) cut at J`. */
  branchOf: Map<string, Set<string>>;
  /** The union. `J` is not a member. */
  members: Set<string>;
  /** `reaches(J)`. `J` is not a member. */
  after: Set<string>;
}

/** The sets for one fanout/join pair. Callers pair them via `join.of` (FD-V6). */
export function regionSets(g: Graph, fanoutId: string, joinId: string): RegionSets {
  const fan = g.byId.get(fanoutId);
  const branches =
    fan && fan.kind === 'fanout' && Array.isArray(fan.branches)
      ? fan.branches.filter((b) => g.byId.has(b))
      : [];

  const branchOf = new Map<string, Set<string>>();
  for (const b of branches) {
    const s = reaches(g, b, joinId);
    s.add(b); // branchOf includes its own entry
    s.delete(joinId); // and never the join, whichever way it was reached
    branchOf.set(b, s);
  }

  const members = new Set<string>();
  for (const s of branchOf.values()) for (const id of s) members.add(id);
  members.delete(joinId);

  const after = reaches(g, joinId);
  after.delete(joinId);

  return { fanoutId, joinId, branches, branchOf, members, after };
}

/** Every fanout paired with the join naming it. Unpaired fanouts are `FD-V6`'s. */
export function allRegions(g: Graph, doc: FlowDefinition): RegionSets[] {
  const out: RegionSets[] = [];
  for (const n of doc.nodes ?? []) {
    if (n?.kind !== 'fanout') continue;
    const joins = (doc.nodes ?? []).filter((j) => j?.kind === 'join' && j.of === n.id);
    if (joins.length !== 1) continue; // FD-V6 reports it; the maths stays out of it
    out.push(regionSets(g, n.id, joins[0]!.id));
  }
  return out;
}

/**
 * The shape `spec/join-policy.md` section 1 fixes, derived from the internal one.
 *
 * Two things the internal `RegionSets` does not guarantee and the spec does:
 * `members` is a **sorted array**, not a Set in traversal order — *"so the value
 * is stable across folds"* — and the value carries only the four fields a policy
 * is allowed to see. `branchOf` and `after` are the validator's working set and
 * are deliberately not handed to a policy.
 */
export function toRegion(sets: RegionSets): {
  fanoutId: string;
  joinId: string;
  branches: string[];
  members: string[];
} {
  return {
    fanoutId: sets.fanoutId,
    joinId: sets.joinId,
    branches: [...sets.branches],
    members: [...sets.members].sort(),
  };
}

/**
 * **Which region a node is in when it is in two** — `spec/flow-definition.md`
 * section 4, *"Which region a node is in, when it is in two"*, added at v0.7 when
 * `FD-V15` was retired.
 *
 * `F` is **inside** `G` when `F !== G` and `F`'s fanout node is a member of
 * `region(G)`. `region` is already transitive — `regionSets` computes `members`
 * through `reaches(b, joinId)` — so containment needs no new data and this
 * function adds none.
 *
 * **Returns the region that is inside every other candidate**; `undefined` both
 * for a node in no region and for one whose candidates are **not nested** — see
 * below, because the second case is real and the first version of this comment
 * denied it.
 *
 * **`FD-V22` is what makes it unique for a NON-`end` node**, and only for one. Any
 * path entering `region(G)` must enter through `G` itself, so a node in two
 * regions has one of their fanouts inside the other. **`end` nodes are exempt from
 * `FD-V22`** (`spec/flow-definition.md` section 2), so one `end` node may be shared
 * by two **sibling** regions that contain neither each other nor it exclusively —
 * [Q45](../../doc/open-questions.md)'s shape, two sequential fan-outs sharing one
 * `end`, which `validateDefinition` accepts today.
 *
 * **For that node there is no innermost region and this returns `undefined`
 * rather than picking one.** W20's conformity reader measured the alternative:
 * with a running `best` that fell through to the first candidate, the same graph
 * answered `f1` or `f2` depending on which `fanout` was declared first — the exact
 * defect this function exists to remove, surviving in the one case the rule's
 * first draft claimed was unreachable. `spec/task-id.md` section 1 makes
 * `branchPath` *a property of the node*; a node with no unique region has no such
 * property, and saying so is the only order-independent answer.
 *
 * **This replaces a `.find()`, and the difference is not stylistic.** Until v0.7
 * the answer was *the first region in `allRegions` order*, and `allRegions`
 * iterates `doc.nodes` — so the answer was the order the author declared the
 * fanouts in. Measured on `spec/examples/valid/nested-fanout.flow.json` before
 * this was written: with `outer` declared first `scoreC` resolved to `outer`, and
 * with `inner` first it resolved to `inner`. **Same graph, same edges, different
 * answer.** Nothing could see it while `FD-V15` refused the only input that
 * distinguishes the two.
 */
export function innermostRegionOf(
  regions: RegionSets[],
  nodeId: string,
): RegionSets | undefined {
  const candidates = regions.filter((r) => r.members.has(nodeId));
  // **The definition, verbatim** — the candidate that is inside every other one.
  // Written this way rather than as a running `best` because the fold has a
  // fall-through and this does not: where no candidate qualifies, `find` returns
  // `undefined`, which is the answer. At most one can qualify, since two regions
  // each inside the other would need a cycle and `FD-V10` forbids those.
  //
  // A member COUNT would agree on every shape here and is still the wrong
  // predicate: it orders regions that do not contain one another, and those are
  // exactly the ones with no answer.
  return candidates.find((r) => candidates.every((o) => o === r || o.members.has(r.fanoutId)));
}

/**
 * **The whole `branchPath` of a node, derived from the graph** —
 * `spec/task-id.md` section 1, which calls it *"a property of the node"*. Since
 * [W21](../../doc/work-items/w21-the-branch-path-is-a-path.md) that sentence is
 * literally true rather than a description of how the driver happens to thread a
 * value.
 *
 * Walks innermost-outward: a node's innermost region gives one segment, and that
 * region's own **fanout** is a node whose path is derived the same way, so the
 * walk terminates at a node in no region. `'-'` for such a node, `'1'` at depth
 * one, `'1.0'` at depth two.
 *
 * **`FD-V19` and `FD-V22` are what make it a function rather than a relation** —
 * they keep a node out of two branches of one region and out of any region it was
 * not opened into. Where `innermostRegionOf` has no answer, neither does this, and
 * `'-'` is returned for the same reason it is returned for a node in no region:
 * `spec/flow-definition.md` section 4's `end`-node case, where there is no unique
 * region and therefore no derivable path.
 *
 * **Measured total over the whole valid corpus before it was written**, and it
 * agrees with the value the driver threaded at depth 1 on every flow — which is
 * what makes replacing the threading a refactor rather than a behaviour change.
 */
export function branchPathOf(regions: RegionSets[], nodeId: string): string {
  const segs: number[] = [];
  // A guard, not a possibility: `FD-V10` forbids cycles and a region cannot
  // contain its own fanout, so the walk strictly ascends. It is here because an
  // unbounded loop over caller-supplied data is one edit away from being one.
  const seen = new Set<string>();
  let at = nodeId;
  for (;;) {
    const r = innermostRegionOf(regions, at);
    if (!r || seen.has(r.fanoutId)) break;
    seen.add(r.fanoutId);
    const i = branchIndexOf(regions, at);
    if (i === null) break;
    segs.unshift(i);
    at = r.fanoutId;
  }
  return segs.length ? segs.join('.') : '-';
}

/**
 * Which region a node belongs to, and via which branch — the value the task id's
 * `branchPath` segment is derived from (`spec/task-id.md` section 1).
 *
 * Returns `null` for a node in no region, and the branch index **of the innermost
 * region containing it** — `spec/flow-definition.md` section 4. It read the FIRST
 * match until v0.7, on the ground that `FD-V19` and `FD-V22` make *"first"* and
 * *"only"* the same thing; **retiring `FD-V15` made that false**, because a node
 * inside a nested region is in an outer branch and an inner one at the same time,
 * and *"first"* then meant *"whichever fanout the author declared earlier"*.
 *
 * **At depth 2 the honest answer to *"which branch is this node in"* is a PATH**
 * — `'1.0'` rather than `0` — and that is `spec/task-id.md`'s vocabulary rather
 * than this file's. This function returns the innermost index; whether it becomes
 * a path is **W21**'s question, named in W20's Scope/Out so that neither item is
 * read as having overreached.
 */
export function branchIndexOf(regions: RegionSets[], nodeId: string): number | null {
  const r = innermostRegionOf(regions, nodeId);
  if (!r) return null;
  for (let i = 0; i < r.branches.length; i++) {
    if (r.branchOf.get(r.branches[i]!)?.has(nodeId)) return i;
  }
  // In a region's `members` but in none of its `branchOf` sets is unreachable:
  // `members` is the union of those sets. Returning `null` rather than throwing
  // keeps the signature total, which is what `ID-R1`'s soundness argument reads.
  return null;
}
