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
 *
 * **Since v0.8 a region is opened by a `fanout` or a `map`** and none of the four
 * sets changed a line for it, because none of them mentions a branch COUNT. What a
 * map changes is one thing and it is `branchPathOf`'s: a map region's branch index
 * is a property of the DISPATCH, so the derivation refuses rather than guessing
 * (`ID-R6`, and `UnresolvedBranchPath` below).
 */
import type { FlowDefinition, FlowNode } from './types.ts';

/**
 * **`ID-R6`** — `spec/task-id.md` section 3. A `branchPath` was asked for across a
 * `map` region with no item index supplied for it.
 *
 * The first `Error` subclass in the definition layer, and it is here rather than in
 * `src/driver/ids.ts` because the refusal happens where the derivation does and
 * because `src/definition/**` must not depend on `src/driver/**`.
 *
 * **Why a refusal and not a value.** `branchPathOf` derives from the graph and a map
 * region's segment is not in the graph. Returning the derived value was measured:
 * three dispatches of one mapped node mint `r1:x:0:0` three times — **one distinct id
 * of three** — and the run dies at `ID-R1` naming a *duplicate*, which is the symptom
 * of a missing index rather than the cause. This names the cause.
 */
export class UnresolvedBranchPath extends Error {}

export interface Graph {
  byId: Map<string, FlowNode>;
  /** Arcs out of a node: `edges[].to`, `branches[]` for a fanout, or `branch` for a map. */
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
    // A `map`'s one arc is `branch`, exactly as a `fanout`'s are `branches` —
    // `spec/flow-definition.md` section 4's *"Edge means two things"* note, now
    // with a third arc shape. Keeping it here rather than in a caller is what
    // makes `FD-V2`, `FD-V10` and `FD-V11` pick a map up with no change: they all
    // walk `succ`. **Measured: a map's branch, join and end are reachable from
    // entry whatever the run-time arity turns out to be**, which is why a map can
    // never reach `FD-V11` for an arity reason.
    if (n.kind === 'map') return isId(n.branch) ? [n.branch] : [];
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
  /**
   * **Which node kind opened this region** — `spec/flow-definition.md` section 4,
   * v0.8. A `fanout` declares its branches; a `map` declares one branch and the RUN
   * decides how many instances of it there are.
   *
   * This lives on `RegionSets` and **deliberately not on what `toRegion` hands a
   * policy**: `spec/join-policy.md` section 1 fixes that shape and it is
   * [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md)'s document, not this
   * item's. W32's job is to make the distinction derivable; deciding what a policy
   * sees is W33's.
   */
  opensWith: 'fanout' | 'map';
  /**
   * Branch entries in declaration order. The index is the `branchPath` segment
   * **for a `fanout` region only** — for a `map` this is the one declared branch
   * and the segment is the run-time item index, which is not derivable from here
   * (`ID-R6`).
   */
  branches: string[];
  /** Per branch entry, `{b} ∪ reaches(b) cut at J`. */
  branchOf: Map<string, Set<string>>;
  /** The union. `J` is not a member. */
  members: Set<string>;
  /** `reaches(J)`. `J` is not a member. */
  after: Set<string>;
}

/**
 * The sets for one region-opener/join pair. Callers pair them via `join.of`
 * (`FD-V6`). The opener is a `fanout` or, since v0.8, a `map`.
 *
 * **A map contributes exactly one branch entry and everything below is unchanged.**
 * That is the measurement `spec/flow-definition.md` v0.8 was written from: with
 * `FD-V9`'s floor set aside, a one-subgraph region produces no finding from
 * `FD-V12`, `FD-V13`, `FD-V20` or `FD-V22`, because none of them mentions a count.
 */
export function regionSets(g: Graph, fanoutId: string, joinId: string): RegionSets {
  const fan = g.byId.get(fanoutId);
  const opensWith: 'fanout' | 'map' = fan?.kind === 'map' ? 'map' : 'fanout';
  const branches =
    fan && fan.kind === 'fanout' && Array.isArray(fan.branches)
      ? fan.branches.filter((b) => g.byId.has(b))
      : fan && fan.kind === 'map' && isId(fan.branch) && g.byId.has(fan.branch)
        ? [fan.branch]
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

  return { fanoutId, joinId, opensWith, branches, branchOf, members, after };
}

/**
 * Every region opener paired with the join naming it. Unpaired ones are `FD-V6`'s.
 *
 * **Since v0.8 an opener is a `fanout` OR a `map`** — `spec/flow-definition.md`
 * section 4. Both are picked up here rather than in two passes, because everything
 * downstream (`innermostRegionOf`, `FD-V13`, `FD-V20`, `FD-V22`) is about a region
 * and does not care which kind opened it.
 */
export function allRegions(g: Graph, doc: FlowDefinition): RegionSets[] {
  const out: RegionSets[] = [];
  for (const n of doc.nodes ?? []) {
    if (n?.kind !== 'fanout' && n?.kind !== 'map') continue;
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
 *
 * ---
 *
 * **v0.8: it is no longer total, and the partiality is a `map` region.**
 * [ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
 * rule 5. Inside a `map` region the segment is the run-time **item index**, so:
 *
 * @param itemIndices the item index for each `map` region the walk crosses, keyed
 *   by the map node's id. A `fanout`-only walk ignores it entirely and behaves
 *   exactly as it did at v0.7 — **which is what the corpus asserts.**
 * @throws {UnresolvedBranchPath} `ID-R6` — the walk crossed a map region with no
 *   index supplied for it, or with one that is not a `branchPath` segment.
 *
 * **Optional rather than required, and the reason is an `Owns` boundary rather than
 * a taste.** `src/driver/driver.ts:839` calls this with two arguments and W32 does
 * not own that file, so a required parameter would put a compile error in code W33
 * has not written yet. The cost is stated in ADR 0036's *Consequences*: a caller
 * that forgets gets a throw rather than a compile error.
 *
 * **Keyed per region rather than taking one index**, so that whether a map may
 * contain a map — P10's *"not taken"*, [Q156](../../doc/open-questions.md) — needs no
 * signature change whichever way it lands.
 */
export function branchPathOf(
  regions: RegionSets[],
  nodeId: string,
  itemIndices?: ReadonlyMap<string, number>,
): string {
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
    let i: number | null;
    if (r.opensWith === 'map') {
      // **`ID-R6`.** The graph cannot answer this and neither can the caller's
      // silence. Refusing here rather than falling through to `break` is the
      // point: a `break` would return the OUTER prefix as though it were the
      // whole path — `'-'` for a top-level map — which is a well-formed id for a
      // different dispatch, and that is `spec/task-id.md` section 2's corruption
      // reached by a route the validator cannot see.
      const supplied = itemIndices?.get(r.fanoutId);
      if (supplied === undefined) {
        throw new UnresolvedBranchPath(
          `branchPath of "${nodeId}" crosses map region "${r.fanoutId}", whose branch index is a ` +
            `property of the dispatch rather than of the node (ID-R6): supply its item index`,
        );
      }
      // The same predicate `buildTaskId` applies to a segment, applied where the
      // number enters rather than four frames later, so the refusal names the map
      // rather than the id. `spec/task-id.md` section 1's own grammar.
      if (!INDEX.test(String(supplied))) {
        throw new UnresolvedBranchPath(
          `item index ${JSON.stringify(supplied)} for map region "${r.fanoutId}" is not a ` +
            `non-negative integer, so it is not a branchPath segment (ID-R6)`,
        );
      }
      i = supplied;
    } else {
      i = branchIndexOf(regions, at);
    }
    if (i === null) break;
    segs.unshift(i);
    at = r.fanoutId;
  }
  return segs.length ? segs.join('.') : '-';
}

/**
 * One `branchPath` segment, as `spec/task-id.md` section 1 spells it.
 *
 * **Duplicated from `src/driver/ids.ts` deliberately rather than imported.**
 * `src/definition/**` does not depend on `src/driver/**`, and inverting that for one
 * regular expression would be a worse trade than restating six characters. The two
 * are held together by `test/definition/map.test.ts`, which asserts that every path
 * this mints is one `parseTaskId` accepts — a round trip rather than a shared
 * constant, which is the check that would survive the two drifting apart.
 */
const INDEX = /^(?:0|[1-9][0-9]*)$/;

/**
 * **The region chain of a node, OUTERMOST FIRST** — one entry per segment of that
 * node's `branchPath`, derived by the same walk `branchPathOf` makes.
 *
 * **It is the walk and not `containing(n)`, and that distinction is a correction
 * rather than a preference.** The first version of this file derived the shared
 * depth as the SIZE OF THE INTERSECTION of the two `containing` sets, on the
 * argument that *`containing(n)` is a nesting chain (`FD-V22`), so the regions
 * containing both are always the outermost k of each chain*. **W49's conformity
 * reader measured that false on a document `validateDefinition` accepts with zero
 * findings**: put a fanout region's JOIN inside a nested region and one node's
 * intersection entry is the INNERMOST of the other's chain, so a count returns 1
 * where the shared region sits at segment 1 rather than segment 0. The answer
 * happened to stay right — `branchPathOf` walks the opener chain, so both paths
 * inherit the outer segment either way — but *the justification licensing the
 * implementation was unsound, in the sentence two documents state it in.*
 *
 * **So the derivation is now the same walk the PATH is built from**, which makes
 * *segment `i` corresponds to chain entry `i`* true by construction instead of by
 * an argument about `containing`. A node not in a region still inherits that
 * region's segment when its own region was opened inside it, exactly as its path
 * does.
 */
export function regionChainOf(regions: RegionSets[], nodeId: string): string[] {
  const chain: string[] = [];
  // The same guard `branchPathOf` carries and for the same reason: `FD-V10`
  // forbids cycles and a region cannot contain its own opener, so the walk
  // strictly ascends. It is here because an unbounded loop over caller-supplied
  // data is one edit away from being one.
  const seen = new Set<string>();
  let at = nodeId;
  for (;;) {
    const r = innermostRegionOf(regions, at);
    if (!r || seen.has(r.fanoutId)) break;
    seen.add(r.fanoutId);
    chain.push(r.fanoutId);
    at = r.fanoutId;
  }
  return chain.reverse();
}

/**
 * **How many leading `branchPath` segments the two nodes have anything to compare
 * on** — the length of the COMMON PREFIX of their two region chains, and the whole
 * of what
 * [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
 * decides.
 *
 * A `branchPath` carries **one segment per region on the walk above**, innermost
 * last. So segment `i` of one node's path and segment `i` of another's are indices
 * into the *same* namespace exactly when chain entry `i` is the same region for
 * both — and the moment the chains diverge, every later segment belongs to an
 * unrelated namespace.
 *
 * **Beyond that prefix there is nothing to compare, and comparing anyway is the
 * defect this function exists to remove.** [Q206](../../doc/open-questions.md): for
 * two SIBLING regions the prefix is empty, every segment belongs to an unrelated
 * namespace, and a predicate that compares by POSITION reports *visible* when two
 * indices minted in different regions happen to be equal. Measured on
 * `spec/examples/valid/reference-past-a-map-arity.flow.json` before this was
 * written: `publish@0` received one of `score`'s three outputs and the other two
 * were reachable from nowhere; and on a constructed sibling `fanout` pair, a
 * reference from branch **1** of the second region to branch **0** of the first
 * validated with zero findings and **stopped the run** at `FD-R3`, where the same
 * reference written in branch 0 resolved.
 *
 * **`fanout` and `map` alike, and that is the point.** The corpus contains no
 * sibling `fanout` pair at all, so a set of probes drawn from it cannot see a rule
 * that is wrong about the case the corpus does not have — W41's finding by name,
 * and P14 decision 3. The document is built and asserted in
 * `test/definition/sibling-regions.test.ts`; it joins the corpus with the driver in
 * **W50**, because until then it is a valid document whose RUN STOPS.
 *
 * **And siblings are not only a top-level shape**, which is W49's adequacy
 * reader's finding: two sequential inner regions inside ONE branch of an outer one
 * are siblings sharing a prefix of length 1, and there the two rules disagree
 * while both paths carry two segments. That is the only shape that tells this
 * function apart from *compare every segment*, and it is asserted.
 */
export function sharedRegionDepth(
  regions: RegionSets[],
  a: string,
  b: string,
): number {
  const ca = regionChainOf(regions, a);
  const cb = regionChainOf(regions, b);
  let i = 0;
  while (i < ca.length && i < cb.length && ca[i] === cb[i]) i++;
  return i;
}

/**
 * **Is an output at `targetPath` visible to a reader at `readerPath`** — `FD-C1`'s
 * visibility predicate, and
 * [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
 * rule 2: *the two paths agree on the regions that contain both nodes.*
 *
 * **The prefix rule is this rule's special case rather than its predecessor.**
 * Where the two chains nest, the regions containing both are the shorter chain
 * entire, so *agree on the first k* and *one path is a prefix of the other* pick
 * out the same entries — which is why every ancestor/descendant reference in both
 * corpora behaves identically under either. Measured: with this predicate in the
 * driver, ladder L6 is unmoved at 879 assertions over 40 real runs in both
 * runtimes, and the only L1-L5 rows that move are the `FD-R3`/`FD-C4` fixtures
 * that reached those rules THROUGH the sibling road.
 *
 * **Segment-wise and never by string, which is inherited rather than reinvented.**
 * `'1'` and `'10'` are different segments and a `startsWith` says otherwise, in
 * exactly the case a map region of eleven or more items produces — it hands
 * instance `10` the output of instance `1`, a wrong answer rather than a crash.
 * **Invisible below eleven instances and live at twelve**; `test/driver/needs.test.ts`'s
 * two-digit fixture is the only thing in the repository that discriminates it, and
 * it passes unmoved here because the comparison is still per segment.
 *
 * @param readerId the node declaring the reference — an edge has no path of its
 *   own, so for an edge's `needs` this is the node the edge hangs on (`FD-C3`).
 */
export function outputIsVisible(
  regions: RegionSets[],
  readerId: string,
  readerPath: string,
  targetId: string,
  targetPath: string,
): boolean {
  const depth = sharedRegionDepth(regions, readerId, targetId);
  // **Nothing shared means nothing to disagree about**, which is the half that
  // changes: a reader outside every region the target is in sees ALL of its
  // outputs, whether it sits at `-` after the region (unchanged from v0.11) or
  // inside a sibling region (Q206, and new here).
  if (depth === 0) return true;
  const xs = readerPath === '-' ? [] : readerPath.split('.');
  const ys = targetPath === '-' ? [] : targetPath.split('.');
  for (let i = 0; i < depth; i++) {
    // A shared region always contributes a segment to both paths, so a missing one
    // is a path that was not derived from these regions. Guarded rather than
    // asserted: `undefined !== undefined` is false, so an unguarded compare would
    // report two pathless nodes as AGREEING, which is the one direction that
    // silently widens what a reference reaches.
    if (xs[i] === undefined || ys[i] === undefined) return false;
    if (xs[i] !== ys[i]) return false;
  }
  return true;
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
  // **A map region's index is not a property of the node** —
  // `spec/flow-definition.md` section 4's *"What a map changes"*, and
  // [ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
  // rules 4 and 5. There is exactly one declared branch, so the loop below would
  // answer `0` for **every** node of the subgraph and for every dispatch of it.
  //
  // **It REFUSES rather than returning `null`, and the first version returned
  // `null`.** W32's conformity reader measured what that cost: `null` already
  // means *"no unique enclosing region"* and maps to the `-` segment
  // (`spec/task-id.md` section 1, `spec/flow-definition.md` section 4's shared-`end`
  // case). A map region **is** a unique enclosing region — it simply has no static
  // index — so returning `null` gave one value two meanings, and the obvious
  // composition a caller writes,
  // `buildTaskId(run, node, branchIndexOf(regions, node))`, minted
  // `r1:score:-:0` for **every** dispatch. That is `spec/task-id.md` section 2's
  // two-records-under-one-key corruption, produced by the sibling of the function
  // written to refuse it, with no diagnostic. This function is exported from the
  // package root, so the composition is a caller's to write.
  //
  // ADR 0036 rule 5 is the rule and it is not qualified by which derivation:
  // *a derivation that cannot answer REFUSES rather than guessing.*
  if (r.opensWith === 'map') {
    throw new UnresolvedBranchPath(
      `branch index of "${nodeId}" is a property of the dispatch rather than of the node: it is ` +
        `inside map region "${r.fanoutId}" (ID-R6). Use branchPathOf with an item index; \`null\` ` +
        'here would mean "no enclosing region", which is a different thing and a different id',
    );
  }
  for (let i = 0; i < r.branches.length; i++) {
    if (r.branchOf.get(r.branches[i]!)?.has(nodeId)) return i;
  }
  // In a region's `members` but in none of its `branchOf` sets is unreachable:
  // `members` is the union of those sets. Returning `null` here rather than
  // throwing is deliberate and is NOT the map case above: this is the
  // *"no answer"* branch, which `null` has always meant, reached on an input the
  // set maths says cannot occur.
  return null;
}

/**
 * **Which nodes have CERTAINLY settled by the time each node is entered** —
 * `spec/flow-definition.md` section 5's `FD-V29`, and
 * [ADR 0042](../../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md).
 *
 * **This is NOT dominance, and the difference is a measurement rather than a
 * refinement.** The graph has two kinds of branching and dominance treats them the
 * same:
 *
 * | out-arcs of | are | because |
 * |---|---|---|
 * | a `task`'s `edges` | **disjunctive** — exactly one is taken | section 3's routing rule 2 |
 * | a `fanout`'s `branches`, a `map`'s `branch` | **conjunctive** — all are entered | `JP-R5`, which emits every `branch.opened` before any dispatch |
 *
 * So a branch entry never *dominates* its own join — every path to the join goes
 * through some other branch too — while it has always been dispatched by the time
 * the join fires. W45 measured what ignoring that costs: over both corpora, of the
 * **127** references `FD-V26`/`FD-V27`/`FD-V28` admit today, plain dominance refuses
 * **30** and this walk refuses **8**, so **22 of the 30 are references a correct rule
 * accepts** — including `needs: {"a": "scoreA"}` on a node after a two-branch join,
 * which `FD-V28`'s own note in `spec/flow-definition.md` calls *"a valid document"*.
 *
 * **Its LIMIT is a property of the POLICY and is stated rather than discovered.**
 * *the join fired, therefore every branch entry settled* holds for every shipped
 * policy and is not a property of the document — `validateDefinition` is not given
 * the policy (`FD-V15`'s note). Measured: a policy satisfied on the first arrival,
 * with another branch entry **not settled**, dispatches the reader and `FD-R3` fires.
 * **Parking at `user_action` is INESSENTIAL and this comment said it was the
 * condition** — a branch entry that has simply not settled yet does it just as well,
 * with no `user_action` anywhere. W45's conformity reader. So `FD-V29` **removes cases from `FD-R3`'s reach and does not
 * replace it** ([Q97](../../doc/open-questions.md)), and an unsound acceptance
 * degrades to today's behaviour.
 *
 * **Meaningless on a cyclic graph** and callers must guard: `FD-V10` is what makes
 * the fixpoint below terminate at all, exactly as it is for the region family.
 *
 * @returns node id -> the ids certainly settled when it is entered. The `entry`
 *   node maps to the empty set; a node unreachable from `entry` (`FD-V11`) has no
 *   key at all.
 */
export function certainlySettled(g: Graph, doc: FlowDefinition): Map<string, Set<string>> {
  const entry = (doc as { entry?: unknown }).entry;
  if (typeof entry !== 'string' || !g.byId.has(entry)) return new Map();

  // Reachable from `entry`, and the predecessors within that set. `Graph` carries
  // only `succ`, so the reverse arcs are built here rather than added there: this
  // is the one caller that needs them and `succ` is what four other rules walk.
  const reach = new Set<string>([entry]);
  const stack = [entry];
  while (stack.length) {
    const x = stack.pop() as string;
    for (const s of g.succ(x)) {
      if (g.byId.has(s) && !reach.has(s)) {
        reach.add(s);
        stack.push(s);
      }
    }
  }
  const pred = new Map<string, string[]>([...reach].map((id) => [id, [] as string[]]));
  for (const a of reach) for (const s of g.succ(a)) if (pred.has(s)) pred.get(s)!.push(a);

  // The conjunctive half: a join's opener, and that opener's branch entries.
  // Read off the NODES rather than off `allRegions`, because this walk must answer
  // for a document `FD-V6` refuses too — `allRegions` drops an opener with no
  // unique join, and dropping one here would silently make its branch entries
  // uncertain and produce an `FD-V29` finding beside `FD-V6`'s.
  //
  // **That reason covers ONE of `FD-V6`'s two shapes, and this comment claimed
  // both** — W45's conformity reader. For an opener with TWO joins the claim holds
  // (`['FD-V6']` alone). For a `fanout` with NO join, `openerOfJoin` has no entry
  // whichever source is used, the branch entries are credited nowhere, and a
  // downstream reference to one gives `['FD-V29','FD-V6']` — so this source choice
  // does not fix that half. It is kept for the half it does fix, and the other half
  // is noise beside a refusal rather than a wrong verdict.
  const entriesOf = new Map<string, string[]>();
  const openerOfJoin = new Map<string, string>();
  for (const n of doc.nodes ?? []) {
    if (n?.kind === 'fanout') {
      entriesOf.set(n.id, (Array.isArray(n.branches) ? n.branches : []).filter(isId));
    } else if (n?.kind === 'map') {
      entriesOf.set(n.id, isId(n.branch) ? [n.branch] : []);
    } else if (n?.kind === 'join' && isId((n as { of?: unknown }).of)) {
      openerOfJoin.set(n.id, (n as { of: string }).of);
    }
  }

  // Intersection dataflow: start every non-entry node at EVERYTHING and shrink.
  // A `Set` per node is affordable because `nodes` is an authored list.
  const out = new Map<string, Set<string>>();
  for (const id of reach) out.set(id, id === entry ? new Set() : new Set(reach));
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of reach) {
      if (id === entry) continue;
      const ps = pred.get(id) ?? [];
      let next: Set<string>;
      if (ps.length === 0) {
        // Unreachable given `reach` above, and `new Set()` rather than a throw for
        // the reason the `parseTaskId` guard in the driver gives: a malformed
        // document is `FD-V21`'s and `FD-V11`'s to report, not this walk's.
        next = new Set();
      } else {
        next = new Set([...out.get(ps[0]!)!, ps[0]!]);
        for (const p of ps.slice(1)) {
          const s = new Set([...out.get(p)!, p]);
          next = new Set([...next].filter((x) => s.has(x)));
        }
      }
      // **The one clause that is not dominance.** A join is entered only after its
      // region opened, and opening a region dispatches every branch entry — so
      // they are certain even though none of them dominates the join. For a `map`
      // the arity is the run's, and N = 0 makes the run `stuck` with the join never
      // firing (`spec/join-policy.md` section 5), so a join that IS entered had at
      // least one instance of its one declared branch.
      //
      // **The `map` half is REDUNDANT today and the comment above argued it at
      // length as though it were not** — W45's adequacy reader measured it:
      // `entriesOf.set(n.id, [])` for the map arm costs **0**, because `FD-V25`
      // makes a map declare ONE branch, so its entry is the sole predecessor chain
      // into its join and plain dominance already reaches it. Deleting the clause
      // OUTRIGHT — both kinds — is **5 failures**, so the `fanout` half is
      // load-bearing.
      //
      // **It is kept, and the distinction from the `target === n.id` guard W45
      // DELETED in `validate.ts` is stated rather than assumed.** That one was
      // unreachable by an accident of how `reachFrom` seeds itself; this one is
      // redundant by a RULE, and `FD-V25` is a rule this repository has already
      // discussed lifting. And the clause is one expression over *whichever kind
      // opened the region* because `FD-V29` is one rule over both — writing the
      // `fanout` half alone would make the code say something narrower than the
      // document does. [Q207](../../doc/open-questions.md).
      const opener = openerOfJoin.get(id);
      if (opener !== undefined && reach.has(opener)) {
        for (const b of entriesOf.get(opener) ?? []) if (reach.has(b)) next.add(b);
      }
      const cur = out.get(id)!;
      if (next.size !== cur.size || [...next].some((x) => !cur.has(x))) {
        out.set(id, next);
        changed = true;
      }
    }
  }
  return out;
}
