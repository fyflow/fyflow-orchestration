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
 * Which region a node belongs to, and via which branch — the value the task id's
 * `branchPath` segment is derived from (`spec/task-id.md` section 1).
 *
 * Returns `null` for a node in no region. Returns the FIRST match; `FD-V19` and
 * `FD-V22` are what make "first" and "only" the same thing, and `ID-R1` is the
 * assertion that they held.
 */
export function branchIndexOf(regions: RegionSets[], nodeId: string): number | null {
  for (const r of regions) {
    for (let i = 0; i < r.branches.length; i++) {
      if (r.branchOf.get(r.branches[i]!)?.has(nodeId)) return i;
    }
  }
  return null;
}
