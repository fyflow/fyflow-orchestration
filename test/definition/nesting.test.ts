/**
 * **Which region a node is in, when it is in two** — `spec/flow-definition.md`
 * section 4, added at v0.7 when `FD-V15` was retired
 * ([W20](../../doc/work-items/w20-what-a-nested-region-is.md) under
 * [P7](../../doc/plans/p7-is-a-join-transitive-over-nested-fan-out.md)).
 *
 * **Beside `exemptions.test.ts` deliberately.** That file exists for section 4's
 * warning earned twice — `FD-V13` at v0.1 and `FD-V19` at v0.2, both refusal
 * rules that rejected the spec's own valid corpus — and this file is the same
 * section's newest clause. Retiring a region rule is the mirror image of adding
 * one, and it can fail the same way.
 *
 * **Every expected value is read from the spec and written down**, never derived
 * from what `allRegions` returns: `region(F)` is the union of `branchOf(F, bᵢ)`
 * with `J` excluded, and `branchOf` is transitive, so an outer region contains an
 * inner fanout, its branches and its join. All of it is derivable from
 * `valid/nested-fanout.flow.json` by reading the edges — which is why the table
 * below is a literal rather than a comparison of two runs against each other.
 */
import { equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import {
  allRegions, branchIndexOf, branchPathOf, buildGraph, innermostRegionOf,
} from '../../src/definition/regions.ts';
import { branchIndices, buildTaskId } from '../../src/driver/ids.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>; pools: Record<string, { type: string }>; predicates: string[]; languages: string[] };

/** `outer` fans to `scoreA` and `scoreB`; `scoreB` reaches `inner`, which fans to `scoreC`/`scoreD`. */
const NESTED = 'valid/nested-fanout.flow.json';
const NESTED_DEF = await load(NESTED);

/**
 * **The whole answer, written from the spec before anything ran** — one row per
 * node, in the flow's own declaration order: the innermost region containing it,
 * and that region's branch index.
 *
 * Derived by reading `spec/flow-definition.md` section 4 against the flow's
 * edges: `region(outer)` is everything reachable from `scoreA` or `scoreB` cut at
 * `outerJoin`, which is the whole inner region and its join; `region(inner)` is
 * `{scoreC, scoreD}` because `innerJoin` is its own `J`; and a join is never in
 * its own region, so `innerJoin` belongs to `outer`.
 *
 * **A literal, and that is the point.** The first version of the order test
 * compared the two declaration orders *against each other*, and this item's own
 * provocation sweep found that comparing one order against itself passed — a
 * tautology with the suite green. Both orders are now compared against this.
 */
const EXPECTED: [node: string, region: string | null, branch: number | null][] = [
  ['outer', null, null],       // a fanout is not in its own region, and nothing encloses this one
  ['scoreA', 'outer', 0],
  ['scoreB', 'outer', 1],
  ['inner', 'outer', 1],       // the inner FANOUT is in the outer region, on branch 1
  ['scoreC', 'inner', 0],      // in BOTH regions — the answer is the inner one
  ['scoreD', 'inner', 1],
  ['innerJoin', 'outer', 1],   // a join is never in its own region, so this is outer's
  ['outerJoin', null, null],   // nor is the outer join in outer's
  ['done', null, null],
];

suite('nested fan-out — which region a node is in when it is in two (FD-V15 retired)', (test) => {
  /**
   * **The node list comes from the DEFINITION, never from `EXPECTED`** — W20's
   * adequacy reader, and it was BLOCKING.
   *
   * This mapped over `EXPECTED`'s own ids, so the expected literal supplied the
   * assertion's **domain** as well as its values: deleting eight of the nine rows
   * removed eight *cases* from both sides and left the suite green — taking the
   * only route to two code mutations with it. Reading the domain from `def.nodes`
   * makes a short table a **length mismatch** instead.
   */
  const shapeOf = (regions: ReturnType<typeof allRegions>, nodeIds: string[]) =>
    nodeIds.map((id): [string, string | null, number | null] => [
      id,
      innermostRegionOf(regions, id)?.fanoutId ?? null,
      branchIndexOf(regions, id),
    ]);
  const idsOf = (d: FlowDefinition) => (d.nodes ?? []).map((n) => n.id);

  test('an outer region contains the inner fanout, its branches and its join', async () => {
    const def = await load(NESTED);
    const regions = allRegions(buildGraph(def), def);
    const outer = regions.find((r) => r.fanoutId === 'outer')!;
    const inner = regions.find((r) => r.fanoutId === 'inner')!;
    equal([...outer.members].sort(),
      ['inner', 'innerJoin', 'scoreA', 'scoreB', 'scoreC', 'scoreD'],
      'region(outer) reaches through the nested region — J excluded, so outerJoin is not a member');
    equal([...inner.members].sort(), ['scoreC', 'scoreD'],
      'region(inner) is its two branches and nothing else — innerJoin is its own J');
    ok(outer.members.has(inner.fanoutId),
      'and the inner FANOUT is a member of the outer region, which is the whole definition of `inside`');
  });

  test('every node resolves to the region the spec says, and to that region`s branch', async () => {
    const def = await load(NESTED);
    equal(shapeOf(allRegions(buildGraph(def), def), idsOf(def)), EXPECTED,
      'spec/flow-definition.md section 4 — innermost(n), and branchIndexOf reading the same region');
  });

  test('THE SAME GRAPH DECLARED IN A DIFFERENT ORDER GIVES THE SAME ANSWERS', async () => {
    // **The assertion this item exists for, and it could not have been written
    // while `FD-V15` stood** — that rule refused the only input that distinguishes
    // the two orders.
    //
    // `allRegions` iterates `doc.nodes`, so before v0.7 the answer was the order
    // the author declared the fanouts in. Measured on this flow before the fix:
    // with `outer` first, `scoreC` resolved to `outer` and `branchIndexOf` said 1;
    // with `inner` first, `inner` and 0. Same graph, same edges, different answer.
    //
    // **Compared against `EXPECTED`, not against the other order.** Comparing the
    // two runs to each other is a tautology the moment one of them is written
    // twice, which this item's own sweep measured surviving.
    const def = await load(NESTED);
    const reversed = { ...def, nodes: [...def.nodes].reverse() } as FlowDefinition;
    ok(def.nodes[0]!.id !== reversed.nodes[0]!.id,
      'the two declarations are genuinely in different orders, or the case below asserts nothing');
    // **The value's PROVENANCE is asserted before the value is** — W20's adequacy
    // reader, and it was BLOCKING. Substituting `def` for `reversed` in the line
    // below left this test green while it silently stopped reading the reversed
    // graph at all: the guard above checks the FIXTURE differs and says nothing
    // about which fixture the asserted value was computed from. `allRegions`
    // returns regions in node-declaration order, so this line fails on the swap.
    const reversedRegions = allRegions(buildGraph(reversed), reversed);
    equal(reversedRegions.map((r) => r.fanoutId), ['inner', 'outer'],
      'allRegions really did see the other order — the outer fanout is now declared second');
    equal(shapeOf(reversedRegions, idsOf(def)), EXPECTED,
      'innermostRegionOf and branchIndexOf are properties of the GRAPH, not of the node order');
  });

  test('the depth-1 corpus is unchanged, which is the clause a resolver can quietly break', async () => {
    // `spec/flow-definition.md` section 4 property 2: innermost(n) for a node in
    // exactly one region is that region. Asserted against the flow every other
    // suite uses, so a resolver that got containment backwards fails here rather
    // than only on the nested flow.
    const def = await load('valid/p1-routed-away.flow.json');
    const regions = allRegions(buildGraph(def), def);
    equal(innermostRegionOf(regions, 'scoreA')?.fanoutId, 'split', 'one region, and it is that one');
    equal(innermostRegionOf(regions, 'ingest'), undefined, 'a node before the fanout is in none');
    equal(branchIndexOf(regions, 'scoreA'), 0, 'and branchIndexOf still agrees with W1`s values');
    equal(branchIndexOf(regions, 'abandoned'), 1, "the routed-away branch's end node is still branch 1");
  });

  test('an `end` node shared by two SIBLING regions has NO innermost region, in either order', () => {
    // **The case the rule's first draft claimed was unreachable, and W20's
    // conformity reader found live.** `spec/flow-definition.md` section 4: `FD-V22`
    // is what makes `innermost(n)` unique, and `end` nodes are EXEMPT from it — so
    // one `end` may be shared by two sibling regions that are nested in neither.
    // [Q45](../../doc/questions/q45.md)'s shape, and `validateDefinition` accepts
    // it.
    //
    // **Measured before the fix**: a resolver that fell through to the first
    // candidate answered `f1` or `f2` for this graph depending on which `fanout`
    // was declared first — the exact defect this item exists to remove, surviving
    // in the one case the rule said could not happen.
    //
    // **Inline rather than in `spec/examples/valid/`** — deliberately. Putting it
    // in the corpus would assert that this shape SHOULD be legal, and whether it
    // should is [Q45](../../doc/questions/q45.md), which is open and is not
    // W20's. The same reasoning `test/matrix/` uses for shapes the corpus cannot
    // express ([Q44](../../doc/questions/q44.md)).
    const nodes = [
      { id: 'f1', kind: 'fanout', branches: ['a1', 'a2'] },
      { id: 'a1', kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [{ to: 'j1' }] },
      { id: 'a2', kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [{ to: 'shared' }] },
      { id: 'j1', kind: 'join', of: 'f1', edges: [{ to: 'f2' }] },
      { id: 'f2', kind: 'fanout', branches: ['b1', 'b2'] },
      { id: 'b1', kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [{ to: 'j2' }] },
      { id: 'b2', kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [{ to: 'shared' }] },
      { id: 'j2', kind: 'join', of: 'f2', edges: [{ to: 'done' }] },
      { id: 'shared', kind: 'end', outcome: 'completed' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ];
    const def = { flowId: 'q45', version: 1, entry: 'f1', nodes } as unknown as FlowDefinition;
    equal(validateDefinition(def, { workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, predicates: [] }), [],
      'the shape is VALID — `end` nodes are exempt from FD-V19 and FD-V22, so nothing refuses it');

    // Both orders, and the answer is the same because there ISN'T one.
    for (const [label, d] of [['declared', def], ['reversed', { ...def, nodes: [...nodes].reverse() }]] as const) {
      const rs = allRegions(buildGraph(d as FlowDefinition), d as FlowDefinition);
      equal(rs.map((r) => r.fanoutId).sort(), ['f1', 'f2'], `${label}: the shared end node really is in two regions`);
      equal(innermostRegionOf(rs, 'shared'), undefined,
        `${label}: no candidate is inside the other, so there is no innermost region`);
      equal(branchIndexOf(rs, 'shared'), null,
        `${label}: and no branchPath is derivable — spec/task-id.md section 1`);
      // **The function W21 added, on the one shape both specs single out** —
      // W21's adequacy reader, BLOCKING. This inline flow already pinned
      // `innermostRegionOf` and `branchIndexOf`; the new derivation was not given
      // the same case, so it could return `'0'` here with the suite green.
      // `spec/task-id.md` section 1: `-` is a node with no unique enclosing
      // region, which is a node in none **and** this one.
      equal(branchPathOf(rs, 'shared'), '-',
        `${label}: no unique region means no path — the dash, not a branch index`);
    }
  });

  test('depth 3 resolves correctly, and in every declaration order', () => {
    // **W20's Scope/Out says depth 3 is out and that "an item that claims depth 3
    // works owes a case". Its adequacy reader measured that the code IS correct at
    // depth 3 and that nothing held it there** — a one-improvement variant of the
    // resolver answers `f2` where the spec says `f3`, in one declaration order and
    // not the other, with the gate green. The definition in
    // `spec/flow-definition.md` section 4 is depth-agnostic; this is the case that
    // says the implementation is too.
    const nodes = [
      { id: 'f1', kind: 'fanout', branches: ['a1', 'a2'] },
      { id: 'a1', kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [{ to: 'j1' }] },
      { id: 'a2', kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [{ to: 'f2' }] },
      { id: 'f2', kind: 'fanout', branches: ['b1', 'b2'] },
      { id: 'b1', kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [{ to: 'j2' }] },
      { id: 'b2', kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [{ to: 'f3' }] },
      { id: 'f3', kind: 'fanout', branches: ['c1', 'c2'] },
      { id: 'c1', kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [{ to: 'j3' }] },
      { id: 'c2', kind: 'task', type: Object.keys(reg.nodeTypes)[0]!, edges: [{ to: 'j3' }] },
      { id: 'j3', kind: 'join', of: 'f3', edges: [{ to: 'j2' }] },
      { id: 'j2', kind: 'join', of: 'f2', edges: [{ to: 'j1' }] },
      { id: 'j1', kind: 'join', of: 'f1', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ];
    const def = { flowId: 'depth3', version: 1, entry: 'f1', nodes } as unknown as FlowDefinition;
    equal(validateDefinition(def, { workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, predicates: [] }), [],
      'a three-deep nesting is a valid definition');

    // Read from section 4: `region` is transitive, so f1 contains everything short
    // of j1, f2 everything short of j2, f3 its two branches. Innermost is the
    // deepest region containing the node.
    const WANT: [string, string | null, number | null][] = [
      ['f1', null, null], ['a1', 'f1', 0], ['a2', 'f1', 1],
      ['f2', 'f1', 1], ['b1', 'f2', 0], ['b2', 'f2', 1],
      ['f3', 'f2', 1], ['c1', 'f3', 0], ['c2', 'f3', 1],
      ['j3', 'f2', 1], ['j2', 'f1', 1], ['j1', null, null], ['done', null, null],
    ];
    for (const [label, d] of [
      ['declared', def],
      ['reversed', { ...def, nodes: [...nodes].reverse() }],
      ['innermost-first', { ...def, nodes: [...nodes].sort((x, y) => x.id.localeCompare(y.id)) }],
    ] as const) {
      const rs = allRegions(buildGraph(d as FlowDefinition), d as FlowDefinition);
      equal(shapeOf(rs, idsOf(def)), WANT, `${label}: depth 3 resolves by containment, not by order`);
    }
  });

  test('branchPathOf derives the whole path, and buildTaskId can express it — W21', () => {
    // **`spec/task-id.md` section 1 calls `branchPath` "a property of the node",
    // and W21 is where that stopped being a description of how the driver threads
    // a value.** Read from that section and section 4's region definition: a
    // node's path is its innermost region's branch index, prefixed by the path of
    // that region's own fanout, terminating at a node in no region.
    //
    // Both halves are asserted, because `branchIndices` has been the inverse of a
    // function that did not exist since P1 — the dotted shape was reserved and
    // unreachable from the minter.
    const WANT: Record<string, string> = {
      outer: '-', scoreA: '0', scoreB: '1', inner: '1',
      scoreC: '1.0', scoreD: '1.1', innerJoin: '1', outerJoin: '-', done: '-',
    };
    const rs = allRegions(buildGraph(NESTED_DEF), NESTED_DEF);
    // **The domain is pinned, not inherited** — W21's adequacy reader, BLOCKING,
    // and it is W20's own provenance finding reproduced 130 lines below the
    // comment that records it. The map below reads its node list from the
    // DEFINITION, which is right; nothing said so, and the two key sets happened
    // to be equal, so swapping the source to `Object.keys(WANT)` was invisible.
    // This is the assertion that makes the equality a fact rather than a
    // coincidence: drop a node from `WANT` and it fails here first.
    equal(Object.keys(WANT).sort(), (NESTED_DEF.nodes ?? []).map((n) => n.id).sort(),
      'WANT covers every node in the flow, so it cannot silently shrink the comparison');
    equal(Object.fromEntries((NESTED_DEF.nodes ?? []).map((n) => [n.id, branchPathOf(rs, n.id)])), WANT,
      'the path is derived from the graph, innermost-outward');
    // The minter can now say it, and `branchIndices` reads it back.
    equal(buildTaskId('r1', 'scoreC', branchIndices('1.0')), 'r1:scoreC:1.0:0',
      'buildTaskId accepts a PATH — the half of the conversion that did not exist');
    equal(buildTaskId('r1', 'scoreA', branchIndices('0')), 'r1:scoreA:0:0', 'and the depth-1 form is unchanged');
    equal(buildTaskId('r1', 'ingest', branchIndices('-')), 'r1:ingest:-:0', 'as is a node in no region');
  });

  test('the nested flow VALIDATES — FD-V15 is retired and no other region rule objects', async () => {
    // **Measured before the rule was retired and asserted after**: with FD-V15 set
    // aside, this flow produced NO other finding. FD-V13, FD-V19 and FD-V22 all
    // accept it, which is what made this a lift rather than a redesign — and
    // asserting the WHOLE list rather than "no FD-V15" is what stops a later
    // region rule reintroducing the refusal under a new id, which section 4
    // records happening twice already.
    const def = await load(NESTED);
    equal(validateDefinition(def, { workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, predicates: [] }), [],
      'a nested fan-out is a valid definition');
  });
});
