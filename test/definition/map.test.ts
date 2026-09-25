/**
 * **A `map` node** — `spec/flow-definition.md` v0.8 sections 2, 4 and 5, and
 * `spec/task-id.md` v0.8 sections 1 and 3, under
 * [ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md),
 * answering [Q12](../../doc/open-questions.md): **fan-out is two features over one
 * region.**
 *
 * **Every expected value below was derived from the spec text before the validator
 * was run against any of these documents** (`doc/workflow.md` section 5 rule 1),
 * and the derivations that are not obvious carry their reasoning in a comment.
 *
 * **This file's shape follows `clauses.test.ts`'s finding and not its own author's
 * instinct.** `spec/examples/invalid/` holds one case per rule *id*, so a
 * multi-clause rule with one corpus file has clauses that shadow each other and can
 * never fail. `FD-V25` has three clauses and one corpus file, so all three are
 * exercised here rather than there.
 *
 * **The half that is deliberately NOT here.** How many dispatches a map opens, in
 * what order, what each receives, and what the join carries are
 * [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md)'s and
 * [W34](../../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s.
 * Nothing here needs a driver, which is the test that W32's decomposition was right.
 */
import { equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import {
  allRegions,
  branchIndexOf,
  branchPathOf,
  buildGraph,
  innermostRegionOf,
  regionSets,
  toRegion,
  UnresolvedBranchPath,
} from '../../src/definition/regions.ts';
import { branchIndices, buildTaskId, parseTaskId } from '../../src/driver/ids.ts';
import type { FlowDefinition, FlowNode, Registry } from '../../src/definition/types.ts';

const registry: Registry = {
  predicates: new Set(['isLowConfidence']),
  ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker', 'ExtractWorker', 'MergeWorker']),
};

const doc = (nodes: unknown[], over: Record<string, unknown> = {}): FlowDefinition =>
  ({ flowId: 'map-test', version: 1, entry: 'ingest', nodes, ...over }) as unknown as FlowDefinition;

const task = (id: string, to: string, over: Record<string, unknown> = {}) =>
  ({ id, kind: 'task', type: 'ScoreWorker', edges: [{ to }], ...over }) as unknown as FlowNode;

const end = (id: string) => ({ id, kind: 'end', outcome: 'completed' }) as unknown as FlowNode;

const join = (id: string, of: string, to: string) =>
  ({ id, kind: 'join', of, edges: [{ to }] }) as unknown as FlowNode;

const mapNode = (id: string, over: string, branch: string, extra: Record<string, unknown> = {}) =>
  ({ id, kind: 'map', over, branch, ...extra }) as unknown as FlowNode;

/**
 * `ingest -> split(map over "items" -> score) -> collect -> publish -> done`.
 *
 * The same shape as `spec/examples/valid/map-fanout.flow.json`, built here so a
 * clause test can mutate one key without editing the normative corpus
 * (`spec/README.md` rule 1).
 */
const MAP_FLOW = () =>
  doc([
    task('ingest', 'split', { type: 'IngestWorker' }),
    mapNode('split', 'items', 'score'),
    task('score', 'collect'),
    join('collect', 'split', 'publish'),
    task('publish', 'done', { type: 'PublishWorker' }),
    end('done'),
  ]);

/** A map region nested inside a static one — `spec/examples/valid/map-in-fanout.flow.json`. */
const MAP_IN_FANOUT = () =>
  doc([
    task('ingest', 'outer', { type: 'IngestWorker' }),
    { id: 'outer', kind: 'fanout', branches: ['scoreA', 'extract'] } as unknown as FlowNode,
    task('scoreA', 'collect'),
    task('extract', 'perItem', { type: 'ExtractWorker' }),
    mapNode('perItem', 'rows', 'merge'),
    task('merge', 'gather', { type: 'MergeWorker' }),
    join('gather', 'perItem', 'collect'),
    join('collect', 'outer', 'publish'),
    task('publish', 'done', { type: 'PublishWorker' }),
    end('done'),
  ]);

const regionsOf = (d: FlowDefinition) => allRegions(buildGraph(d), d);

// ---------------------------------------------------------------------------

suite('map — the definition shape (spec/flow-definition.md v0.8 sections 2 and 5)', (t) => {
  t('a map flow is VALID, and the expected finding count is 0 derived rule by rule', () => {
    // Derived from section 5 before running: FD-V25's three clauses all pass (no
    // `edges`, `branch` names a task, `over` matches FD-V16's charset); FD-V6 sees
    // one join naming a map; FD-V11 is satisfied because `succ(split) = [score]`,
    // so branch, join and end are reachable WHATEVER the run-time arity is;
    // FD-V19 iterates 0 pairs over one branch; FD-V13 and FD-V20 have empty
    // intersections; FD-V22's only entrant into the region is the map itself.
    equal(validateDefinition(MAP_FLOW(), registry), [], 'a map is a valid definition');
  });

  t('FD-V9 is NOT reachable by a map — its floor and its repeat clause are about `fanout`', () => {
    // ADR 0036 rule 3, and the whole of "one feature or two". A map declares ONE
    // branch, so "fewer than two branches" and "repeats a branch entry" have no
    // instance. This asserts the ABSENCE of a rule id, which is the only way to
    // state "this rule was not widened".
    const rules = violatedRules(validateDefinition(MAP_FLOW(), registry));
    ok(!rules.includes('FD-V9'), `a valid map must not trip FD-V9, got ${JSON.stringify(rules)}`);
    // and the same at the arity the STATIC feature refuses: a map has no arity in
    // the document at all, so there is no "map of one item" document to reject.
    ok(!rules.includes('FD-V11'), `a map's branch is reachable statically, got ${JSON.stringify(rules)}`);
  });

  t('FD-V25 clause 1 — a map with `edges`', () => {
    const d = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      mapNode('split', 'items', 'score', { edges: [{ to: 'score' }] }),
      task('score', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    ok(violatedRules(validateDefinition(d, registry)).includes('FD-V25'), 'a map may not carry edges');
  });

  t('FD-V25 clause 2 — a map whose `branch` is not a task', () => {
    // Three sub-cases, because "not a task" has three shapes and one corpus file
    // can only be one of them.
    for (const [label, branch, extra] of [
      ['a join', 'collect', []],
      ['an end', 'done', []],
      ['a fanout', 'inner', [
        { id: 'inner', kind: 'fanout', branches: ['a1', 'a2'] } as unknown as FlowNode,
        task('a1', 'ic'), task('a2', 'ic'), join('ic', 'inner', 'collect'),
      ]],
    ] as [string, string, FlowNode[]][]) {
      const d = doc([
        task('ingest', 'split', { type: 'IngestWorker' }),
        mapNode('split', 'items', branch),
        join('collect', 'split', 'done'),
        end('done'),
        ...extra,
      ]);
      ok(
        violatedRules(validateDefinition(d, registry)).includes('FD-V25'),
        `a map's branch may not be ${label}`,
      );
    }
  });

  t('FD-V25 clause 3 — `over` outside FD-V16\'s charset, and the boundary both ways', () => {
    const withOver = (over: unknown) =>
      violatedRules(validateDefinition(
        doc([
          task('ingest', 'split', { type: 'IngestWorker' }),
          mapNode('split', over as string, 'score'),
          task('score', 'collect'),
          join('collect', 'split', 'done'),
          end('done'),
        ]),
        registry,
      ));
    // Refused. `''` is refused by the {1,64} floor, `'a b'` and `'a.b'` by the
    // charset, `65 chars` by the ceiling, and a non-string by the type half of the
    // same clause.
    for (const bad of ['', 'a b', 'a.b', 'x'.repeat(65), 42, null]) {
      ok(
        withOver(bad).includes('FD-V25'),
        `over ${JSON.stringify(bad)} must be refused by FD-V25`,
      );
    }
    for (const good of ['a', 'items', 'A-b_9']) {
      ok(
        !withOver(good).includes('FD-V25'),
        `over ${JSON.stringify(good)} must be accepted, got ${JSON.stringify(withOver(good))}`,
      );
    }
    // **The {1,64} bound is asserted as a NAMED PAIR rather than as two entries in
    // the two loops above** — rule 8 obligation (d), and this is the author's own
    // set finding it: `'x'.repeat(64)` could be dropped from the accept list for
    // **0 failures**, because nothing counts that list and the refuse list's
    // `repeat(65)` is satisfied by any ceiling at all. A ceiling needs both sides
    // of one boundary, and putting them side by side is what says so.
    ok(!withOver('x'.repeat(64)).includes('FD-V25'), 'the ceiling is 64 and 64 is ACCEPTED');
    ok(withOver('x'.repeat(65)).includes('FD-V25'), 'the ceiling is 64 and 65 is REFUSED');
    ok(!withOver('a').includes('FD-V25'), 'the floor is 1 and 1 is ACCEPTED');
    ok(withOver('').includes('FD-V25'), 'the floor is 1 and 0 is REFUSED');
  });

  t('FD-V24 admits `map` and still refuses everything else', () => {
    // `gate` since v0.23 (W92) — this list is a copy of `KINDS`, and it names every kind the validator admits.
    const kinds = ['task', 'fanout', 'map', 'join', 'end', 'gate'];
    for (const k of ['decision', 'Map', 'MAP', 'fanOut', '']) {
      ok(!kinds.includes(k), `${JSON.stringify(k)} is not a declared kind`);
      const d = doc([{ id: 'ingest', kind: k } as unknown as FlowNode]);
      ok(
        violatedRules(validateDefinition(d, registry)).includes('FD-V24'),
        `kind ${JSON.stringify(k)} must be refused by FD-V24`,
      );
    }
  });

  t('FD-V23 — `over` and `branch` are both REQUIRED, one at a time', () => {
    for (const missing of ['over', 'branch']) {
      const node = { id: 'split', kind: 'map', over: 'items', branch: 'score' } as Record<string, unknown>;
      delete node[missing];
      const d = doc([
        task('ingest', 'split', { type: 'IngestWorker' }),
        node as unknown as FlowNode,
        task('score', 'collect'),
        join('collect', 'split', 'done'),
        end('done'),
      ]);
      const rules = violatedRules(validateDefinition(d, registry));
      ok(rules.includes('FD-V23'), `a map without "${missing}" must trip FD-V23, got ${JSON.stringify(rules)}`);
    }
  });

  t('FD-V17 — a map carrying `branches` is an undeclared key, not a second way to write one', () => {
    // The mistake the two features invite: writing `branches` on a map. It must be
    // refused rather than silently ignored, which is FD-V17's own argument about a
    // misspelled `when`.
    const d = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      mapNode('split', 'items', 'score', { branches: ['score'] }),
      task('score', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    ok(violatedRules(validateDefinition(d, registry)).includes('FD-V17'), 'a map may not carry `branches`');
  });

  t('FD-V6 — a join may name a map, and an unpaired map is still refused', () => {
    ok(
      !violatedRules(validateDefinition(MAP_FLOW(), registry)).includes('FD-V6'),
      'a join naming a map is legal at v0.8',
    );
    // zero joins naming it
    const orphan = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      mapNode('split', 'items', 'score'),
      task('score', 'done'),
      end('done'),
    ]);
    ok(violatedRules(validateDefinition(orphan, registry)).includes('FD-V6'), 'a map with no join is refused');
    // two joins naming it
    const two = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      mapNode('split', 'items', 'score'),
      task('score', 'collect'),
      join('collect', 'split', 'done'),
      join('collect2', 'split', 'done'),
      end('done'),
    ]);
    ok(violatedRules(validateDefinition(two, registry)).includes('FD-V6'), 'a map with two joins is refused');
  });

  t('FD-V2 — a map whose `branch` names nothing', () => {
    const d = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      mapNode('split', 'items', 'nowhere'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    ok(violatedRules(validateDefinition(d, registry)).includes('FD-V2'), "a map's branch must exist");
  });

  t('FD-V12 — a map whose `branch` is its own join, which is the corpus case', () => {
    const d = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      mapNode('split', 'items', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    const rules = violatedRules(validateDefinition(d, registry));
    // Derived before running: FD-V25 because `collect` is a join and not a task,
    // AND FD-V12 because `regionSets` puts a map's `branch` into `branches`, so the
    // existing loop covers both openers. Section 5: "an invalid example is named
    // for the rule it exists to exercise, and may violate others as well."
    equal(rules, ['FD-V12', 'FD-V25'], "a map branch that is its own join trips both");
  });
});

// ---------------------------------------------------------------------------

suite('map — the region maths is UNCHANGED (spec/flow-definition.md section 4)', (t) => {
  t('a map opens a region, and `opensWith` says which kind did', () => {
    const d = MAP_FLOW();
    const regions = regionsOf(d);
    equal(regions.length, 1, 'allRegions picks up a map');
    equal(regions[0]!.opensWith, 'map', 'and records that a map opened it');
    equal(regions[0]!.fanoutId, 'split', '');
    equal(regions[0]!.joinId, 'collect', '');
  });

  t('the four sets for a map region, derived from section 4 by hand', () => {
    const r = regionSets(buildGraph(MAP_FLOW()), 'split', 'collect');
    // branchOf(split, score) = {score} ∪ reaches(score) cut at collect = {score}.
    equal(r.branches, ['score'], 'a map contributes exactly ONE branch entry');
    equal([...r.branchOf.keys()], ['score'], '');
    equal([...(r.branchOf.get('score') ?? [])].sort(), ['score'], 'cut at the join, and J is not a member');
    equal([...r.members].sort(), ['score'], 'region(M) is the union over one entry');
    // after(M) = reaches(collect) = {publish, done}; J is not a member.
    equal([...r.after].sort(), ['done', 'publish'], 'after(M) is reaches(J), J excluded');
    ok(!r.members.has('collect') && !r.after.has('collect'), 'J is in neither set');
  });

  t('a `fanout` region still reports `opensWith: "fanout"` — the control', () => {
    const d = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      { id: 'split', kind: 'fanout', branches: ['a', 'b'] } as unknown as FlowNode,
      task('a', 'collect'), task('b', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    const r = regionsOf(d)[0]!;
    equal(r.opensWith, 'fanout', 'the static feature is unmoved');
    equal(r.branches, ['a', 'b'], '');
    equal(r.branchOf.size, 2, 'N branches are N distinct branchOf sets');
  });

  t('a map nested in a fanout: innermost(n) resolves through both, and both orders agree', () => {
    // Derived by hand from section 4: containing(merge) = {outer, perItem};
    // perItem ∈ region(outer) and outer ∉ region(perItem) = {merge}, so perItem is
    // inside outer and innermost(merge) = perItem.
    const d = MAP_IN_FANOUT();
    equal(validateDefinition(d, registry), [], 'a map inside a fanout is a valid definition');
    const regions = regionsOf(d);
    equal(regions.length, 2, 'two regions, one of each kind');
    equal(innermostRegionOf(regions, 'merge')?.fanoutId, 'perItem', 'the map is innermost for its own node');
    equal(innermostRegionOf(regions, 'extract')?.fanoutId, 'outer', 'the outer branch entry is in the outer one');
    equal(innermostRegionOf(regions, 'gather')?.fanoutId, 'outer', 'an inner join is in the OUTER region');

    // Order independence — v0.7's own property, re-asserted because a new opener
    // kind is exactly the sort of change that could reintroduce a `.find()`.
    const reversed = doc([...(d.nodes as FlowNode[])].reverse(), { entry: 'ingest' });
    const rr = regionsOf(reversed);
    ok(rr[0]!.fanoutId !== regions[0]!.fanoutId, 'allRegions really did see the other declaration order');
    equal(innermostRegionOf(rr, 'merge')?.fanoutId, 'perItem', 'and the answer is a property of the GRAPH');
  });

  t('FD-V19 iterates ZERO pairs over a map region — Q27 is untouched', () => {
    // ADR 0036's Q27 paragraph, asserted rather than argued. The count is
    // `n(n-1)/2` and n is 1, so there is nothing to iterate and no way for a map to
    // reach the refusal, whatever its branch subgraph contains.
    const r = regionsOf(MAP_FLOW())[0]!;
    equal((r.branches.length * (r.branches.length - 1)) / 2, 0, 'one branch is zero pairs');
    // and a bigger branch subgraph still cannot reach it
    const d = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      mapNode('split', 'items', 'score'),
      task('score', 'refine'),
      task('refine', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    const rules = violatedRules(validateDefinition(d, registry));
    ok(!rules.includes('FD-V19'), `a two-node map subgraph must not trip FD-V19, got ${JSON.stringify(rules)}`);
    equal([...regionsOf(d)[0]!.members].sort(), ['refine', 'score'], 'both nodes are in the one branch');
  });

  t('FD-V13, FD-V20 and FD-V22 still FIRE on a map region — vacuous is not the same as absent', () => {
    // The rules that did not change must still be reachable through the new kind,
    // or "the region maths carries over" is a claim with no case behind it.
    // FD-V13: a node in both region(M) and after(M) — the corpus's
    // `branch-skips-join` shape with the map's ONE branch doing the skipping.
    // Derived: branchOf(split, score) = {score, publish, done} because score's
    // guarded edge leaves for `publish`; after(split) = reaches(collect) =
    // {publish, done}. The intersection is {publish, done}, and `done` is exempt
    // as an `end`, so `publish` is the finding. **Acyclic**, which the first draft
    // of this fixture was not — a cycle makes FD-V10 fire and the whole region
    // family is guarded on `!cyclic`, so the test passed for the wrong reason
    // until it was read.
    const v13 = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      mapNode('split', 'items', 'score'),
      { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [
        { when: 'isLowConfidence', to: 'publish' },
        { to: 'collect' },
      ] } as unknown as FlowNode,
      join('collect', 'split', 'publish'),
      task('publish', 'done', { type: 'PublishWorker' }),
      end('done'),
    ]);
    const r13 = violatedRules(validateDefinition(v13, registry));
    ok(!r13.includes('FD-V10'), `the fixture must be acyclic or the region rules never run: ${JSON.stringify(r13)}`);
    ok(r13.includes('FD-V13'), `FD-V13 fires inside a map region, got ${JSON.stringify(r13)}`);

    // FD-V20: a node outside the region with an arc to its join.
    const v20 = doc([
      task('ingest', 'side', { type: 'IngestWorker' }),
      task('side', 'split'),
      mapNode('split', 'items', 'score'),
      task('score', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ], { entry: 'ingest' });
    const outside = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      mapNode('split', 'items', 'score'),
      task('score', 'collect'),
      { id: 'stray', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] } as unknown as FlowNode,
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    ok(violatedRules(validateDefinition(outside, registry)).includes('FD-V20'), 'FD-V20 fires on a map region');
    ok(validateDefinition(v20, registry).length === 0, 'and the benign neighbour is still accepted');

    // FD-V22: an edge into a region node from outside it — the corpus's
    // `region-entered-from-outside` shape. Acyclic for the same reason as above.
    const v22 = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [
        { when: 'isLowConfidence', to: 'score' },
        { to: 'split' },
      ] } as unknown as FlowNode,
      mapNode('split', 'items', 'score'),
      task('score', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    const r22 = violatedRules(validateDefinition(v22, registry));
    ok(!r22.includes('FD-V10'), `the fixture must be acyclic: ${JSON.stringify(r22)}`);
    ok(r22.includes('FD-V22'), `FD-V22 fires on a map region, got ${JSON.stringify(r22)}`);
  });

  t('`opensWith` comes from the opener KIND, and a one-branch FANOUT proves it', () => {
    // **Provenance** — rule 8 obligation (c). Every VALID document makes
    // `kind === 'map'` and `branches.length === 1` agree, because `FD-V9`'s floor
    // means a valid `fanout` never has one branch. So the two sources are
    // indistinguishable on the valid corpus, and reading the count instead of the
    // kind survived the whole of this file until this case was constructed.
    //
    // The discriminating input is an INVALID document, which `regionSets` is
    // handed anyway: `validateDefinition` calls `allRegions` on whatever it is
    // given, and reports FD-V9 alongside the region findings rather than instead
    // of them.
    const oneBranchFanout = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      { id: 'split', kind: 'fanout', branches: ['score'] } as unknown as FlowNode,
      task('score', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    ok(
      violatedRules(validateDefinition(oneBranchFanout, registry)).includes('FD-V9'),
      'the fixture really is the one FD-V9 refuses — otherwise this proves nothing',
    );
    const r = regionsOf(oneBranchFanout)[0]!;
    equal(r.branches.length, 1, 'and it really does have one branch, which is the confusable half');
    equal(r.opensWith, 'fanout', 'a one-branch FANOUT is still a fanout — the kind decides, not the count');
    // and the consequence, which is what would actually break: its index stays
    // derivable and its path does not throw.
    equal(branchIndexOf(regionsOf(oneBranchFanout), 'score'), 0, 'so branchIndexOf still answers');
    equal(branchPathOf(regionsOf(oneBranchFanout), 'score'), '0', 'and branchPathOf does not refuse');
  });

  t('`toRegion` is UNCHANGED — the four fields a policy sees, and no fifth', () => {
    // ADR 0036: `opensWith` lives on RegionSets and deliberately not here, because
    // `spec/join-policy.md` section 1 fixes this shape and it is W33's document.
    const view = toRegion(regionsOf(MAP_FLOW())[0]!);
    equal(Object.keys(view).sort(), ['branches', 'fanoutId', 'joinId', 'members'],
      'toRegion still hands a policy exactly four fields');
  });
});

// ---------------------------------------------------------------------------

suite('map — the two corpus flows ARE the shapes section 7 claims', (t) => {
  // **The hand copies above are convenience; these are the contract.** W32's
  // adequacy reader rewrote `map-fanout.flow.json` as a linear four-node flow with
  // no `map` node in it at all and `map-in-fanout.flow.json` as a plain static
  // fan-out, kept both valid, and every check stayed green — because `check-spec`'s
  // `C4` never opens a file and the section-7 equality binds NAMES. `MAP_FLOW()`
  // and `MAP_IN_FANOUT()` are hand copies of these two documents, so the corpus and
  // this file could drift in exactly that direction with nothing holding them
  // together.
  //
  // The kinds bound in `l4-corpus.test.ts` catches BOTH being emptied; this catches
  // EITHER, because each row claims a specific shape and each is the sole evidence
  // for it.
  t('map-fanout.flow.json is a map region — one branch, opened by a map', async () => {
    const d = JSON.parse(await readText(`${ROOT}spec/examples/valid/map-fanout.flow.json`)) as FlowDefinition;
    equal(validateDefinition(d, registry), [], 'and it is valid, which is why L4 walks it');
    const regions = regionsOf(d);
    equal(regions.length, 1, 'exactly one region');
    equal(regions[0]!.opensWith, 'map', "section 7 says this flow shows a `map`");
    equal(regions[0]!.branches.length, 1, 'one branch entry — the whole difference from a fanout');
    throws(() => branchPathOf(regions, regions[0]!.branches[0]!), 'ID-R6',
      'and its branch index is a property of the dispatch');
  });

  t('map-in-fanout.flow.json is a map region nested inside a static one', async () => {
    const d = JSON.parse(await readText(`${ROOT}spec/examples/valid/map-in-fanout.flow.json`)) as FlowDefinition;
    equal(validateDefinition(d, registry), [], '');
    const regions = regionsOf(d);
    equal(regions.length, 2, 'two regions');
    equal([...regions].map((r) => r.opensWith).sort(), ['fanout', 'map'], 'one of each kind');
    const map = regions.find((r) => r.opensWith === 'map')!;
    const outer = regions.find((r) => r.opensWith === 'fanout')!;
    ok(outer.members.has(map.fanoutId), 'and the map is INSIDE the fanout, which is what the row claims');
    // the derivable prefix, which is what makes this fixture worth having
    equal(branchPathOf(regions, map.fanoutId), '1', "the map node's own path is still derived");
    equal(branchPathOf(regions, map.branches[0]!, new Map([[map.fanoutId, 7]])), '1.7',
      'and only the map segment is supplied');
  });
});

suite('map — branchPath is a property of the DISPATCH (spec/task-id.md v0.8, ID-R6)', (t) => {
  t('branchIndexOf REFUSES for a node in a map region, and `null` keeps its one meaning', () => {
    // **The first version returned `null` here and W32's conformity reader measured
    // what that cost.** `null` already means *"no unique enclosing region"* and maps
    // to the `-` segment, so a map region — which IS a unique enclosing region with
    // no static index — gave one value two meanings, and
    // `buildTaskId(run, node, branchIndexOf(regions, node))` minted `r1:score:-:0`
    // for every dispatch. ADR 0036 rule 5 is not qualified by which derivation.
    const regions = regionsOf(MAP_FLOW());
    throws(() => branchIndexOf(regions, 'score'), 'ID-R6', "a map's index is a property of the dispatch");
    throws(() => branchIndexOf(regions, 'score'), 'split', 'and the refusal names the map');
    let caught: unknown;
    try { branchIndexOf(regions, 'score'); } catch (e) { caught = e; }
    ok(caught instanceof UnresolvedBranchPath, 'the same class branchPathOf throws');
    // `null` still means exactly one thing, and both of its cases still return it.
    equal(branchIndexOf(regions, 'ingest'), null, 'a node in NO region: unchanged');
    const shared = regionsOf(MAP_IN_FANOUT());
    equal(branchIndexOf(shared, 'publish'), null, 'a node after the join: unchanged');
    // and the corruption the refusal exists to prevent, stated as the value it
    // would otherwise have produced
    equal(buildTaskId('r1', 'score', null), 'r1:score:-:0',
      'this is the id `null` would have composed to, for every dispatch');
  });

  t('a map as the ENTRY node is valid — the spec says so and nothing else asserted it', () => {
    // `spec/flow-definition.md` section 2: *"A `map` may be the `entry` node, and
    // then the value is the run's start payload; that needs no rule, because
    // `FD-V3` refuses only a `join` or an `end`."* **A rule deliberately absent for
    // a map** is the same class of claim `FD-V14` gets a dedicated test for, and it
    // had none — both readers found it independently, one by mutating `FD-V3` and
    // one by re-deriving the sentence.
    const d = doc([
      mapNode('split', 'items', 'score'),
      task('score', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ], { entry: 'split' });
    equal(validateDefinition(d, registry), [], 'a map may be the entry node');
    // and the neighbours FD-V3 does refuse are unmoved, so this is not the rule
    // being weakened
    for (const [entry, kind] of [['collect', 'join'], ['done', 'end']] as [string, string][]) {
      const bad = doc([
        mapNode('split', 'items', 'score'),
        task('score', 'collect'),
        join('collect', 'split', 'done'),
        end('done'),
      ], { entry });
      ok(violatedRules(validateDefinition(bad, registry)).includes('FD-V3'),
        `FD-V3 still refuses a ${kind} as entry`);
    }
  });

  t('FD-V21 — a map whose `branch` is present and not a string', () => {
    // The guard carries a five-line comment justifying its existence and had no
    // test at all (adequacy reader S3; conformity reader F10 reached the same
    // guard from the attribution side). Without it the graph builder filters the
    // non-string out before `FD-V2` can see it.
    const d = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      { id: 'split', kind: 'map', over: 'items', branch: 5 } as unknown as FlowNode,
      task('score', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    const rules = violatedRules(validateDefinition(d, registry));
    ok(rules.includes('FD-V21'), `a non-string branch must be refused by name, got ${JSON.stringify(rules)}`);
    // and the honest scope: FD-V11 and FD-V20 still fire on this document, so what
    // the guard adds is the DIAGNOSIS rather than every diagnostic. The comment in
    // validate.ts overclaimed slightly and now says so.
    const detail = validateDefinition(d, registry).find((f) => f.rule === 'FD-V21')!;
    ok(detail.detail.includes('5'), 'the finding quotes the offending value');
    // succ() must not put the non-string into the graph
    equal(buildGraph(d).succ('split'), [], 'a non-string branch contributes no arc');
  });

  t("regionSets refuses a map branch that does not exist, so no phantom id enters region(F)", () => {
    // Adequacy reader S6: dropping `g.byId.has(fan.branch)` from the map arm let
    // `"nowhere"` into `members`, which FD-V13/FD-V19/FD-V20/FD-V22 and
    // innermostRegionOf all read.
    const d = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      mapNode('split', 'items', 'nowhere'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    const r = regionSets(buildGraph(d), 'split', 'collect');
    equal(r.branches, [], 'a branch that does not exist is not a branch entry');
    equal([...r.members], [], 'and no phantom id reaches the set the region rules read');
    ok(violatedRules(validateDefinition(d, registry)).includes('FD-V2'), 'FD-V2 is what reports it');
  });

  t('ID-R6 — branchPathOf REFUSES rather than guessing, and names the node and the map', () => {
    const regions = regionsOf(MAP_FLOW());
    throws(() => branchPathOf(regions, 'score'), 'ID-R6', 'the refusal cites its rule');
    throws(() => branchPathOf(regions, 'score'), 'score', 'and names the node');
    throws(() => branchPathOf(regions, 'score'), 'split', 'and names the map');
    // **This one is what discriminates the two refusals, and it exists because a
    // fix for one reader's finding MASKED another guard.** `branchIndexOf` now
    // refuses too (conformity F7), with the same class, the same `ID-R6` citation
    // and the same map name — so making THIS arm unreachable left the three
    // assertions above passing, fired by the other guard from the `else` branch.
    // Measured: `branchPathOf` still threw `UnresolvedBranchPath` mentioning both
    // `ID-R6` and `split`. That is W29's `D5` masking shape, produced inside this
    // item by acting on a review finding — which is rule 8's own founding
    // observation about the fixes that follow a review.
    //
    // The two messages already differ; only the assertions did not.
    throws(() => branchPathOf(regions, 'score'), 'branchPath of',
      "the PATH refusal, not the INDEX one — `branchIndexOf`'s says `branch index of`");
    throws(() => branchPathOf(regions, 'score'), 'crosses map region',
      'and its own phrasing, so a sibling guard cannot answer for it');
    // The class, not merely a throw — a caller has to be able to tell this from a
    // bug. `throws()` matches on the message, so the class is asserted separately.
    let caught: unknown;
    try { branchPathOf(regions, 'score'); } catch (e) { caught = e; }
    ok(caught instanceof UnresolvedBranchPath, 'it is an UnresolvedBranchPath');
  });

  t('the measured alternative: guessing mints ONE distinct id for N dispatches', () => {
    // ADR 0036's "Alternatives rejected" row, executed rather than asserted in
    // prose. `branchIndexOf` answers `null` for a mapped node, and the value the
    // v0.7 walk WOULD have used is the region's only branch index, 0.
    const ids = [0, 1, 2].map(() => buildTaskId('r1', 'score', 0));
    equal(new Set(ids).size, 1, 'three dispatches, one id — this is what ID-R6 refuses');
    equal(ids[0], 'r1:score:0:0', '');
  });

  t('with an index supplied, the path is the index — and it round-trips through parseTaskId', () => {
    const regions = regionsOf(MAP_FLOW());
    for (const i of [0, 1, 2, 7, 42, 137, 9999, 1000000]) {
      const path = branchPathOf(regions, 'score', new Map([['split', i]]));
      equal(path, String(i), `item ${i} is its own segment`);
      // The round trip is what holds `regions.ts`'s INDEX and `ids.ts`'s grammar
      // together without a shared constant — see the comment on that constant.
      const parsed = parseTaskId(buildTaskId('r1', 'score', branchIndices(path) ?? null));
      equal(parsed.branchPath, String(i), 'and parseTaskId accepts what this minted');
    }
  });

  t('500 dispatches of one node are 500 distinct ids — P10 prediction 1, executed', () => {
    const regions = regionsOf(MAP_FLOW());
    const ids = new Set(
      Array.from({ length: 500 }, (_, i) =>
        buildTaskId('r1', 'score', branchIndices(branchPathOf(regions, 'score', new Map([['split', i]]))) ?? null)),
    );
    equal(ids.size, 500, 'the grammar carries a map with no format change');
  });

  t('ID-R6 also refuses an index that is not a branchPath segment', () => {
    const regions = regionsOf(MAP_FLOW());
    for (const bad of [-1, 1.5, NaN, 1e21]) {
      // **`is not a non-negative integer` is the phrase only THIS arm produces.**
      // `branchIndexOf`'s sibling refusal cites `ID-R6`, names the map, AND says
      // *"use branchPathOf with an item index"* — so `ID-R6`, `split` and even
      // `item index` all match it, and the first three discriminators tried here
      // were measured passing with this arm unreachable. See the masking note above:
      // the two guards are distinguishable, but only by a phrase one of them does
      // not contain, and finding it took three attempts and a hand-run.
      throws(
        () => branchPathOf(regions, 'score', new Map([['split', bad]])),
        'is not a non-negative integer',
        `item index ${bad} must be refused where it enters, not four frames later`,
      );
      throws(
        () => branchPathOf(regions, 'score', new Map([['split', bad]])),
        'ID-R6',
        'and it cites the rule',
      );
    }
    // 1e21 is the case W21's conformity reader found in `buildTaskId`:
    // `Number.isInteger(1e21)` is true and `String(1e21)` is `"1e+21"`, which the
    // grammar refuses. Asserted here so the two guards cannot drift apart.
    equal(String(1e21), '1e+21', 'the reason 1e21 is refused is its STRING, not its type');
  });

  t('a `fanout`-only walk ignores the new parameter entirely — the v0.7 behaviour, unmoved', () => {
    const d = doc([
      task('ingest', 'split', { type: 'IngestWorker' }),
      { id: 'split', kind: 'fanout', branches: ['a', 'b'] } as unknown as FlowNode,
      task('a', 'collect'), task('b', 'collect'),
      join('collect', 'split', 'done'),
      end('done'),
    ]);
    const regions = regionsOf(d);
    equal(branchPathOf(regions, 'a'), '0', 'two arguments, exactly as at v0.7');
    equal(branchPathOf(regions, 'b'), '1', '');
    equal(branchPathOf(regions, 'ingest'), '-', '');
    // and an index for a region that is not a map changes nothing — the parameter
    // is consulted only where `opensWith === 'map'`.
    equal(branchPathOf(regions, 'a', new Map([['split', 99]])), '0',
      'a stray index cannot override a static region');
  });

  t('a map inside a fanout: the OUTER prefix is derived and only the inner segment is supplied', () => {
    // Derived by hand: merge's innermost region is `perItem` (a map, index supplied)
    // and perItem's own path is derived from `outer`, whose branch 1 is `extract`.
    // So the path is `1.<item>`.
    const regions = regionsOf(MAP_IN_FANOUT());
    equal(branchPathOf(regions, 'extract'), '1', 'the outer branch index is still a property of the node');
    equal(branchPathOf(regions, 'perItem'), '1', 'and so is the map node`s own path');
    equal(branchPathOf(regions, 'merge', new Map([['perItem', 0]])), '1.0', '');
    equal(branchPathOf(regions, 'merge', new Map([['perItem', 137]])), '1.137', '');
    throws(() => branchPathOf(regions, 'merge'), 'ID-R6', 'and the inner segment is still required');
    // the whole point: nested map ids round-trip through the unchanged grammar
    const id = buildTaskId('r1', 'merge', branchIndices('1.137') ?? null);
    equal(id, 'r1:merge:1.137:0', '');
    equal(parseTaskId(id).branchPath, '1.137', '');
  });

  t('the index is keyed PER REGION, so supplying the wrong map does not satisfy the refusal', () => {
    // Q156 is decided YES at W84 (ADR 0062) and was NOT decided here, which is what
    // this signature bought: the per-region keying held across the decision unchanged.
    const regions = regionsOf(MAP_IN_FANOUT());
    throws(
      () => branchPathOf(regions, 'merge', new Map([['outer', 0]])),
      'perItem',
      'an index for another region is not an index for this one',
    );
    // the discriminator again: `branchIndexOf`'s refusal would also name `perItem`
    throws(
      () => branchPathOf(regions, 'merge', new Map([['outer', 0]])),
      'crosses map region',
      "the PATH walk's own refusal, not the index derivation's",
    );
  });
});
