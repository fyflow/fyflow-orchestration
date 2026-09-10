/**
 * **What a reference across SIBLING regions means** — `spec/flow-definition.md`
 * section 3 v0.15, and
 * [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md),
 * built by [W49](../../doc/work-items/w49-what-a-reference-across-sibling-regions-means.md) under
 * [P14](../../doc/plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md).
 *
 * **This file is L1 and tests the DERIVATION.** `sharedRegionDepth` and
 * `outputIsVisible` are pure functions of the region sets; wiring them into
 * `resolveReference` is **W50**'s,
 * and until then a run still resolves by the prefix rule — which is why nothing
 * here reads a `Driver`.
 *
 * **The load-bearing claim is that the new rule GENERALISES the old one**, so the
 * old one is written out below as `prefixVisible`, from the sentence
 * `spec/flow-definition.md` carried at v0.11-v0.14, and the two are compared:
 * they must agree on every pair whose region chains NEST, and disagree on the
 * sibling pairs. **A test that only asserted the new answers would not say that** —
 * it would be consistent with a predicate that changed everything.
 *
 * **Every expected value is read from the spec and from the flows' own edges**,
 * never from what the functions return (`doc/workflow.md` section 5 rule 1) — with
 * ONE stated exception. The depths below are derivable by hand: `region(F)` is the
 * union of `branchOf(F, bᵢ)` with `J` excluded, and a node's region CHAIN is the
 * walk `branchPathOf` makes.
 *
 * **The exception is the nesting/sibling PARTITION**, which decides which of two
 * assertions each combination gets and is computed from `regionChainOf` — code
 * under test. W49's conformity reader found the first version of this header
 * claiming otherwise. **Its second observer is a literal**: the `CASES` table pins
 * every depth by hand, and the INTERLEAVED case pins `regionChainOf` itself to
 * `['outer', 'F3']`, so a probe that re-sources the chain leaves those live —
 * measured, at 4 failures.
 */
import { equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import {
  allRegions, buildGraph, branchPathOf, outputIsVisible, regionChainOf, sharedRegionDepth,
  type RegionSets,
} from '../../src/definition/regions.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/valid/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as
  { workerTypes: string[]; predicates: string[] };

/**
 * **The sibling `fanout` pair, built here because neither corpus contains one** —
 * P14 decision 3, and W41's finding by name: a probe set drawn from the corpus
 * cannot see a rule that is wrong about the case the corpus does not have.
 *
 * **It is not in `spec/examples/valid/` and that is a fact about the tree rather
 * than a preference.** A corpus flow is validated at L4 **and run** by the
 * `FD-C2` census, and until **W50**
 * wires `outputIsVisible` into the resolver this document is a valid definition
 * whose RUN STOPS at `FD-R3` — which is the defect, exhibited. It joins the corpus
 * with the driver.
 *
 * **Both branches of the second region declare the SAME reference**, so the only
 * thing that differs between the two readers is the branch the author wrote it in.
 */
const SIBLING_FANOUTS = {
  flowId: 'sibling-fanouts',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'splitA' }] },
    { id: 'splitA', kind: 'fanout', branches: ['scoreA1', 'scoreA2'] },
    { id: 'scoreA1', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'joinA' }] },
    { id: 'scoreA2', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'joinA' }] },
    { id: 'joinA', kind: 'join', of: 'splitA', edges: [{ to: 'splitB' }] },
    { id: 'splitB', kind: 'fanout', branches: ['publishB1', 'publishB2'] },
    { id: 'publishB1', kind: 'task', workerType: 'PublishWorker',
      needs: { own: '.', first: 'scoreA1' }, edges: [{ to: 'joinB' }] },
    { id: 'publishB2', kind: 'task', workerType: 'PublishWorker',
      needs: { own: '.', first: 'scoreA1' }, edges: [{ to: 'joinB' }] },
    { id: 'joinB', kind: 'join', of: 'splitB', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;
/**
 * **Two SIBLING regions nested inside one outer branch** — the shape W49's
 * adequacy reader found missing, and the only one that tells `sharedRegionDepth`
 * apart from *compare every segment*.
 *
 * Every sibling pair in the corpus is TOP-LEVEL, where the shared prefix is empty
 * and `outputIsVisible` short-circuits before its loop; and every nesting pair has
 * a prefix as long as both paths, where truncating the loop is unobservable. **So
 * the loop's own bound was asserted by nothing**: the reader widened it to compare
 * every segment and the suite stayed green, negating this function's own docblock
 * for zero.
 *
 * Here `x1` and `y2` have chains `[outer, innerA]` and `[outer, innerB]` — length
 * two on both sides, sharing a prefix of **one**. `y2@"1.1"` SEES `x1@"1.0"`,
 * because the segment they share agrees and the segment they do not is minted in
 * two unrelated regions; the prefix rule calls that invisible. **The two rules
 * disagree here at depth 1**, which is also why the sibling claim below is stated
 * as *agree on the shared prefix* rather than as *always visible*.
 *
 * `gate` is a task because `FD-V9` requires a `fanout`'s branch entries to be
 * tasks — the first draft of this fixture named `innerA` directly and was refused.
 */
const NESTED_SIBLINGS = {
  flowId: 'nested-siblings',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'outer' }] },
    { id: 'outer', kind: 'fanout', branches: ['plain', 'gate'] },
    { id: 'plain', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'outerJoin' }] },
    { id: 'gate', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'innerA' }] },
    { id: 'innerA', kind: 'fanout', branches: ['x1', 'x2'] },
    { id: 'x1', kind: 'task', workerType: 'ExtractWorker', edges: [{ to: 'joinA' }] },
    { id: 'x2', kind: 'task', workerType: 'ExtractWorker', edges: [{ to: 'joinA' }] },
    { id: 'joinA', kind: 'join', of: 'innerA', edges: [{ to: 'innerB' }] },
    { id: 'innerB', kind: 'fanout', branches: ['y1', 'y2'] },
    { id: 'y1', kind: 'task', workerType: 'MergeWorker', edges: [{ to: 'joinB' }] },
    { id: 'y2', kind: 'task', workerType: 'MergeWorker', edges: [{ to: 'joinB' }] },
    { id: 'joinB', kind: 'join', of: 'innerB', edges: [{ to: 'outerJoin' }] },
    { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/**
 * **A region's JOIN placed inside a NESTED region** — W49's conformity reader's
 * counterexample, and the document that tells the chain derivation apart from a
 * count of the membership sets.
 *
 * `collect` is `outer`'s join and it sits inside `F3`'s branch `c`, so `region(F3)`
 * holds `x` while `region(outer)` does not. `containing(x)` is `{F3}` and
 * `containing(c)` is `{outer, F3}` — **the shared entry is the INNERMOST of `c`'s
 * chain, not a prefix of it** — so counting the intersection gives **1** where the
 * shared region sits at segment 1 rather than segment 0.
 *
 * **`x`'s PATH is `1.0` and carries an `outer` segment even though `x` is in no
 * outer region**, because `branchPathOf` walks the opener chain: `x` → `F3` →
 * `outer`. So the chains are `[outer, F3]` on both sides and the true depth is
 * **2**. The first version of this file derived it from `containing(n)` and this
 * document is why it does not.
 *
 * `validateDefinition` accepts it with **zero findings**.
 */
const INTERLEAVED = {
  flowId: 'interleaved', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'outer' }] },
    { id: 'outer', kind: 'fanout', branches: ['a', 'b'] },
    { id: 'a', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'endA' }] },
    { id: 'b', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'F3' }] },
    { id: 'F3', kind: 'fanout', branches: ['c', 'd'] },
    { id: 'c', kind: 'task', workerType: 'ExtractWorker', edges: [{ to: 'collect' }] },
    { id: 'd', kind: 'task', workerType: 'ExtractWorker', edges: [{ to: 'innerJoin' }] },
    { id: 'collect', kind: 'join', of: 'outer', edges: [{ to: 'x' }] },
    { id: 'x', kind: 'task', workerType: 'MergeWorker', edges: [{ to: 'endX' }] },
    { id: 'innerJoin', kind: 'join', of: 'F3', edges: [{ to: 'endI' }] },
    { id: 'endA', kind: 'end', outcome: 'completed' },
    { id: 'endX', kind: 'end', outcome: 'completed' },
    { id: 'endI', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

const PAST_ARITY = await load('reference-past-a-map-arity.flow.json');
const OVER_REGION = await load('map-over-region-output.flow.json');
const NESTED_FANOUT = await load('nested-fanout.flow.json');
const MAP_IN_FANOUT = await load('map-in-fanout.flow.json');

const regionsOf = (doc: FlowDefinition) => allRegions(buildGraph(doc), doc);

/**
 * **`one path is a prefix of the other`, segment-wise** — the rule
 * `spec/flow-definition.md` section 3 carried from v0.11 to v0.14, written out
 * here so the generalisation claim has two expressions to compare rather than one.
 *
 * Copied from the sentence and not from `src/driver/driver.ts`: *`-` (no region)
 * being a prefix of everything, and every path being a prefix of itself.*
 */
function prefixVisible(readerPath: string, targetPath: string): boolean {
  const isPrefix = (a: string, b: string) => {
    if (a === '-') return true;
    if (b === '-') return false;
    const xs = a.split('.');
    const ys = b.split('.');
    if (xs.length > ys.length) return false;
    return xs.every((x, i) => x === ys[i]);
  };
  return isPrefix(targetPath, readerPath) || isPrefix(readerPath, targetPath);
}

/** Every path a node with `k` containing regions can be dispatched at, over three indices. */
function candidatePaths(k: number): string[] {
  if (k === 0) return ['-'];
  let out = ['0', '1', '2'];
  for (let d = 1; d < k; d++) out = out.flatMap((p) => ['0', '1', '2'].map((i) => `${p}.${i}`));
  return out;
}

/**
 * The node's region chain, outermost first — the same walk `branchPathOf` makes,
 * so entry `i` is the region segment `i` was minted in.
 *
 * **Not `regions.filter(r => r.members.has(id))`, which is what this read first.**
 * The membership set is not ordered and is not the walk: a node can inherit an
 * outer region's segment without being a MEMBER of that region, which is the case
 * W49's conformity reader constructed. Reading the chain is what makes *nesting*
 * below a statement about the two paths rather than about set sizes.
 */
const chainOf = (rs: RegionSets[], id: string) => regionChainOf(rs, id);

/** One chain is a prefix of the other — computed from the CHAINS, never from
 *  `sharedRegionDepth`, which is the function these suites are grading. */
function chainsNest(ca: string[], cb: string[]): boolean {
  const [short, long] = ca.length <= cb.length ? [ca, cb] : [cb, ca];
  return short.every((r, i) => r === long[i]);
}

/**
 * **The table's MEMBERS, by name** — `doc/workflow.md` section 5 rule 8 (d) at
 * v0.14: *a COUNT is not a MEMBERSHIP*, so where a deletion is one edit away the
 * layer names what it holds. Rule 8's own set found this: one row lifted out of
 * `CASES` cost **zero**, exactly as `DECLARED_TOTAL` let four L6 rows leave for
 * one integer. Compared BOTH WAYS below, so a row that leaves fails NAMING
 * itself and a row added without a key fails too.
 *
 * **Its limit, stated**: this is a literal, so a row and its key are two edits in
 * one diff — [Q217](../../doc/open-questions.md)'s own recorded limit, and
 * [Q102](../../doc/open-questions.md)'s shape.
 */
const CASE_KEYS = [
  'reference-past-a-map-arity:publish/score',
  'map-over-region-output:rank/score',
  'map-over-region-output:publish/score',
  'sibling-fanouts:publishB1/scoreA1',
  'sibling-fanouts:publishB2/scoreA1',
  'sibling-fanouts:publishB1/publishB2',
  'reference-past-a-map-arity:publish/ingest',
  'nested-fanout:scoreC/scoreB',
  'nested-fanout:scoreC/scoreD',
  'map-in-fanout:merge/extract',
  'nested-siblings:y2/x1',
  'nested-siblings:y2/plain',
  'nested-siblings:x1/x2',
  'interleaved:x/c',
  'interleaved:x/a',
];

const CASES: [label: string, doc: FlowDefinition, a: string, b: string, depth: number][] = [
  ['sibling maps, reader inside the second', PAST_ARITY, 'publish', 'score', 0],
  ['sibling maps, reader is the map NODE', OVER_REGION, 'rank', 'score', 0],
  ['sibling maps, reader inside the second', OVER_REGION, 'publish', 'score', 0],
  ['sibling fanouts, branch 0 to branch 0', SIBLING_FANOUTS, 'publishB1', 'scoreA1', 0],
  ['sibling fanouts, branch 1 to branch 0', SIBLING_FANOUTS, 'publishB2', 'scoreA1', 0],
  ['two branches of ONE fanout', SIBLING_FANOUTS, 'publishB1', 'publishB2', 1],
  ['a node and one outside every region', PAST_ARITY, 'publish', 'ingest', 0],
  ['nested: inner node and outer node, same branch', NESTED_FANOUT, 'scoreC', 'scoreB', 1],
  ['nested: two inner nodes of one region', NESTED_FANOUT, 'scoreC', 'scoreD', 2],
  ['a map nested in a fanout branch, and its enclosing branch', MAP_IN_FANOUT, 'merge', 'extract', 1],
  ['NESTED siblings: two inner regions in one outer branch', NESTED_SIBLINGS, 'y2', 'x1', 1],
  ['NESTED siblings: one inner node and the outer branch entry', NESTED_SIBLINGS, 'y2', 'plain', 1],
  ['NESTED siblings: two nodes of ONE inner region', NESTED_SIBLINGS, 'x1', 'x2', 2],
  // **The chain and the membership set disagree here**, which is the only place
  // they do: `containing(x)` is `{F3}` and `containing(c)` is `{outer, F3}`, so a
  // count of the intersection answers 1 — and both PATHS carry an `outer` segment,
  // so the true depth is 2. W49's conformity reader's document.
  ['INTERLEAVED: a region`s join inside a nested region', INTERLEAVED, 'x', 'c', 2],
  ['INTERLEAVED: across the outer branches', INTERLEAVED, 'x', 'a', 1],
];
suite('L1 — sharedRegionDepth: how many regions contain BOTH nodes', (test) => {
  /**
   * Written from each flow's edges, not from a run. `region(split)` in
   * `reference-past-a-map-arity` is `{score}` — `branchOf(split, score)` cut at
   * `collect` — and `region(rank)` is `{publish}`, so the two share nothing; in
   * `map-over-region-output` the reader is `rank`, the map NODE, which is in no
   * region at all because a region opener is never a member of its own region.
   */


  test('every case the table declares is present, and no undeclared one — both ways', () => {
    const keys = CASES.map(([, doc, a, b]) => `${doc.flowId}:${a}/${b}`);
    equal(keys.sort(), [...CASE_KEYS].sort(), 'the depth table IS the cases it declares');
  });

  test('the depth is the number of regions holding both, from each flow`s own edges', () => {
    for (const [label, doc, a, b, depth] of CASES) {
      const rs = regionsOf(doc);
      equal(sharedRegionDepth(rs, a, b), depth, `${label}: ${a} / ${b}`);
    }
  });

  test('it is SYMMETRIC, which the predicate below depends on', () => {
    for (const [label, doc, a, b] of CASES) {
      const rs = regionsOf(doc);
      equal(
        sharedRegionDepth(rs, a, b),
        sharedRegionDepth(rs, b, a),
        `${label}: ${a} / ${b} is not symmetric`,
      );
    }
  });

  test('a SIBLING pair is exactly a pair whose chains do not nest — both directions', () => {
    // The definition in `spec/flow-definition.md` section 3: `containing(n)` is a
    // chains DIVERGE — each has an entry at the divergence point the other lacks.
    for (const [label, doc, a, b, depth] of CASES) {
      const rs = regionsOf(doc);
      const ca = chainOf(rs, a);
      const cb = chainOf(rs, b);
      // **The SECOND observer of `sharedRegionDepth`** — obligation (c)'s LIMIT at
      // v0.13: the row above compares the function to the hand-derived literal and
      // is the only thing that does, so rule 8 graded neutralising it a SURVIVOR.
      // This reads the FUNCTION and the literal reads the flow, so a probe that
      // re-sources either leaves the other live.
      equal(sharedRegionDepth(rs, a, b), depth, `${label}: the two observers disagree`);
      const siblings = !chainsNest(ca, cb);
      equal(siblings, ca[depth] !== undefined && cb[depth] !== undefined,
        `${label}: ${a} / ${b}`);
    }
  });
});

suite('L1 — outputIsVisible: the prefix rule is the SPECIAL CASE', (test) => {
  test('`prefixVisible` is the rule the spec carried at v0.11-v0.14, pinned', () => {
    // **A second observer of the comparison's OTHER half** — obligation (c). W49's
    // adequacy reader re-sourced `prefixVisible(rp, tp)` to
    // `outputIsVisible(...)` in the test below and it came back green: all 682
    // comparisons became `x === x`, and nothing else read the old rule for
    // AGREEMENT. This table is read from the sentence
    // `spec/flow-definition.md` section 3 carried before v0.15 — *`-` (no region)
    // being a prefix of everything, and every path being a prefix of itself* — so
    // a re-sourcing fails here, on the `-` row, whatever it does below.
    const EXPECTED: [a: string, b: string, visible: boolean][] = [
      ['-', '0', true],       // `-` is a prefix of everything
      ['0', '-', true],       // and the predicate is symmetric over the two
      ['0', '0', true],       // every path is a prefix of itself
      ['0', '1', false],      // unrelated indices at the same depth
      ['1', '1.0', true],     // an ancestor of a nested path
      ['1.0', '1', true],
      ['1', '10', false],     // SEGMENT-wise: `1` is not a prefix of `10`
      ['1.0', '1.1', false],  // siblings inside one region
      ['1.1', '0.0', false],
    ];
    for (const [a, b, visible] of EXPECTED) {
      equal(prefixVisible(a, b), visible, `the OLD rule on ${a} / ${b}`);
    }
  });

  /**
   * **`DOCS` declares its MEMBERS by name** — v0.14's obligation (d): *a count is
   * not a membership*. W49's adequacy reader dropped four of the five documents
   * from this list ONE AT A TIME for **zero**, because `nested-fanout` alone
   * supplies ~396 of the comparisons against a floor of 400 — including
   * `sibling-fanouts`, **the fixture P14 decision 3 requires the evidence to
   * include**, which was bound to this comparison by nothing at all.
   *
   * Compared both ways, and every member is required to CONTRIBUTE below, so no
   * one document can carry the list. *The limit is `CASE_KEYS`' own*
   * ([Q217](../../doc/open-questions.md)): a member and its key are two edits in
   * one diff.
   */
  const DOC_KEYS = [
    'map-in-fanout', 'map-over-region-output', 'nested-fanout', 'nested-siblings',
    'reference-past-a-map-arity', 'sibling-fanouts', 'interleaved',
  ];
  const DOCS: [string, FlowDefinition][] = [
    ['reference-past-a-map-arity', PAST_ARITY],
    ['map-over-region-output', OVER_REGION],
    ['sibling-fanouts', SIBLING_FANOUTS],
    ['nested-fanout', NESTED_FANOUT],
    ['map-in-fanout', MAP_IN_FANOUT],
    ['nested-siblings', NESTED_SIBLINGS],
    ['interleaved', INTERLEAVED],
  ];

  test('the compared corpus IS the documents this suite declares — both ways', () => {
    equal(DOCS.map((d) => d[0]).sort(), [...DOC_KEYS].sort(), 'DOCS is its declared members');
    // And it is cross-bound to the depth table, so emptying CASES and CASE_KEYS
    // together — two literals in one diff, which the reader measured at ZERO —
    // now fails against a third list.
    const covered = new Set(CASE_KEYS.map((k) => k.split(':')[0]));
    for (const [name] of DOCS) ok(covered.has(name), `${name} has no case in the depth table`);
  });

  /** Every ordered pair of `task` nodes in a flow, with the paths each can take. */
  function* pairs(doc: FlowDefinition) {
    const rs = regionsOf(doc);
    const tasks = (doc.nodes ?? []).filter((n) => n?.kind === 'task').map((n) => n.id as string);
    for (const reader of tasks) {
      for (const target of tasks) {
        if (reader === target) continue;
        const depth = sharedRegionDepth(rs, reader, target);
        const nests = chainsNest(chainOf(rs, reader), chainOf(rs, target));
        for (const rp of candidatePaths(chainOf(rs, reader).length)) {
          for (const tp of candidatePaths(chainOf(rs, target).length)) {
            yield { rs, reader, target, rp, tp, nests, depth };
          }
        }
      }
    }
  }

  test('where the two chains NEST, the two rules pick out the same entries', () => {
    let compared = 0;
    const perDoc = new Map<string, number>();
    for (const [name, doc] of DOCS) {
      for (const { rs, reader, target, rp, tp, nests } of pairs(doc)) {
        if (!nests) continue;
        compared++;
        perDoc.set(name, (perDoc.get(name) ?? 0) + 1);
        equal(
          outputIsVisible(rs, reader, rp, target, tp),
          prefixVisible(rp, tp),
          `${name}: ${reader}@${rp} / ${target}@${tp}`,
        );
      }
    }
    // **Every declared document must CONTRIBUTE, which is what a floor could not
    // say.** W49's adequacy reader dropped four of the six one at a time for ZERO,
    // because one document supplied ~396 of the total against a floor of 400 — so
    // the floor bounded the counter and not the work, and `sibling-fanouts`, the
    // fixture P14 decision 3 REQUIRES, was bound to this comparison by nothing.
    for (const [name] of DOCS) {
      ok((perDoc.get(name) ?? 0) > 0, `${name} contributed no nesting comparison`);
    }
    // **An EQUALITY and not a floor**, for `S12`'s reason one file across: a floor
    // answers *are there at least N* and goes stale toward weakness
    // ([Q102](../../doc/open-questions.md)), while an equality fails when the
    // iteration shrinks AND when a document is added without anyone looking. The
    // value is measured on this tree and is deliberately pinned; the previous
    // version said *"the documents yield this many"* of a floor 41% below what they
    // yield, which is that same row's own defect. W49's conformity reader.
    equal(compared, 2434, `${compared} nesting combinations compared, expected 2434`);
  });

  test('and on a SIBLING pair the SHARED PREFIX decides, where the prefix rule refuses', () => {
    // **This test asserted `outputIsVisible` unconditionally until W49's adequacy
    // reader**, and that claim is true only of TOP-LEVEL siblings, where the shared
    // prefix is empty. Adding `nested-siblings` falsified it on the first run: two
    // inner regions inside one outer branch are siblings whose paths must still
    // agree on the outer segment. *The suite conflated `!nests` with `depth === 0`
    // and said so nowhere*, which would have handed a later item a red suite
    // pointing at correct code.
    let siblingPairs = 0;
    let disagreements = 0;
    let deepSiblings = 0;
    for (const [name, doc] of DOCS) {
      for (const { rs, reader, target, rp, tp, nests, depth } of pairs(doc)) {
        if (nests) continue;
        siblingPairs++;
        if (depth > 0) deepSiblings++;
        // The rule, stated generally: agree on the shared prefix, and nothing
        // beyond it. Derived here from the two paths rather than from the function.
        const xs = rp === '-' ? [] : rp.split('.');
        const ys = tp === '-' ? [] : tp.split('.');
        const agreeOnPrefix = xs.length >= depth && ys.length >= depth &&
          xs.slice(0, depth).every((x, i) => x === ys[i]);
        equal(
          outputIsVisible(rs, reader, rp, target, tp),
          agreeOnPrefix,
          `${name}: ${reader}@${rp} / ${target}@${tp} at shared depth ${depth}`,
        );
        if (!prefixVisible(rp, tp)) disagreements++;
      }
    }
    ok(siblingPairs > 0, 'no sibling pair in the corpus — the comparison above is vacuous');
    ok(disagreements > 0, 'the two rules never disagreed — the sibling case was not reached');
    // **The DEEP sibling case is what tells this predicate apart from *compare
    // every segment***, so it is bounded separately: a corpus of top-level
    // siblings alone would satisfy every other clause here.
    ok(deepSiblings > 0, 'no sibling pair at a shared depth above zero — the loop bound is unasserted');
  });

  test('a TOP-LEVEL sibling pair is visible unconditionally — the special case', () => {
    // The half the previous version of the test above asserted for everything.
    const rs = regionsOf(SIBLING_FANOUTS);
    equal(sharedRegionDepth(rs, 'publishB2', 'scoreA1'), 0, 'the fixture must share no region');
    for (const rp of ['0', '1', '2', '10']) {
      for (const tp of ['0', '1', '2', '10']) {
        equal(outputIsVisible(rs, 'publishB2', rp, 'scoreA1', tp), true,
          `nothing is shared, so ${rp} / ${tp} has nothing to disagree about`);
      }
    }
  });

  test('the depth is the CHAIN prefix, not the size of the membership intersection', () => {
    // **W49's conformity reader's counterexample.** `containing(x) = {F3}` and
    // `containing(c) = {outer, F3}`; the shared entry is the INNERMOST of `c`'s
    // chain, so a count answers 1 where both PATHS carry two segments and the
    // shared region is at segment 1. Deriving from the walk `branchPathOf` makes
    // answers 2. *Without this document the two derivations are indistinguishable:
    // re-sourcing the chain back to the membership sets cost ZERO on every other
    // fixture in this file.*
    const rs = regionsOf(INTERLEAVED);
    equal(validateDefinition(INTERLEAVED, reg).length, 0, 'the counterexample must be a LEGAL document');
    equal(regionChainOf(rs, 'x'), ['outer', 'F3'], 'x`s chain carries outer, though x is in no outer region');
    equal(regionChainOf(rs, 'c'), ['outer', 'F3'], 'and so does c`s');
    equal(branchPathOf(rs, 'x'), '1.0', 'x`s PATH carries the outer segment');
    equal(sharedRegionDepth(rs, 'x', 'c'), 2, 'the chain prefix — a membership count answers 1');
    // the membership count, written out, so the disagreement is asserted rather
    // than described
    const intersection = rs.filter((r) => r.members.has('x') && r.members.has('c')).length;
    equal(intersection, 1, 'the intersection really is 1 — this is the discriminating case');
  });

  test('and at a shared depth of ONE the two rules disagree — the loop bound`s own case', () => {
    // `y2` and `x1` are in sibling regions nested inside one outer branch: chains
    // `[outer, innerA]` and `[outer, innerB]`, sharing a prefix of 1, with BOTH
    // paths two segments long. This is the only shape in which `depth` and
    // `min(xs.length, ys.length)` differ, and it is what the adequacy reader
    // measured as unasserted — widening the loop to compare every segment cost 0.
    const rs = regionsOf(NESTED_SIBLINGS);
    equal(sharedRegionDepth(rs, 'y2', 'x1'), 1, 'one shared region, two segments each');
    equal(chainOf(rs, 'y2').length, 2, 'y2 carries two segments');
    equal(chainOf(rs, 'x1').length, 2, 'x1 carries two segments');

    equal(outputIsVisible(rs, 'y2', '1.1', 'x1', '1.0'), true,
      'the shared outer segment agrees, and the inner ones are unrelated namespaces');
    equal(prefixVisible('1.1', '1.0'), false,
      'and the prefix rule refuses it — the two rules DISAGREE at depth 1');
    equal(outputIsVisible(rs, 'y2', '1.1', 'x1', '0.0'), false,
      'the shared outer segment differs, so nothing of x1`s is on y2`s path');
  });

  test('a shared region the paths do not carry is NOT visible', () => {
    // The guard: a shared region always contributes a segment to both paths, so a
    // path too short for its own depth is not a path these regions derived. Without
    // it `undefined !== undefined` is false and two pathless nodes read as AGREEING,
    // which is the one direction that silently widens what a reference reaches.
    const rs = regionsOf(SIBLING_FANOUTS);
    equal(sharedRegionDepth(rs, 'publishB1', 'publishB2'), 1, 'the fixture must share one region');
    // **BOTH paths pathless is the case the guard exists for**, and it is the one
    // rule 8 found unasserted: with a segment missing on one side the compare
    // already answers `undefined !== '0'`, but with it missing on BOTH sides
    // `undefined !== undefined` is FALSE and an unguarded loop falls through to
    // *visible*. Two nodes sharing a region can never both be at `-`, so the case
    // is constructed rather than drawn from a flow — which is rule 8's *where the
    // corpus cannot express one, construct it*.
    equal(outputIsVisible(rs, 'publishB1', '-', 'publishB2', '-'), false, 'neither has a segment');
    equal(outputIsVisible(rs, 'publishB1', '-', 'publishB2', '0'), false, 'reader has no segment');
    equal(outputIsVisible(rs, 'publishB1', '0', 'publishB2', '-'), false, 'target has no segment');
    equal(outputIsVisible(rs, 'publishB1', '0', 'publishB2', '0'), true, 'same branch is visible');
    equal(outputIsVisible(rs, 'publishB1', '0', 'publishB2', '1'), false, 'other branch is not');
  });

  test('segments compare as SEGMENTS and never as strings — the two-digit case', () => {
    // `"1"` and `"10"` are different segments; a `startsWith` says otherwise and
    // hands instance 10 the output of instance 1. Invisible below eleven instances
    // and live at twelve. Inherited from the prefix rule rather than reinvented.
    const rs = regionsOf(SIBLING_FANOUTS);
    equal(outputIsVisible(rs, 'publishB1', '1', 'publishB2', '10'), false, '"1" is not "10"');
    equal(outputIsVisible(rs, 'publishB1', '10', 'publishB2', '1'), false, 'and not the other way');
    equal(outputIsVisible(rs, 'publishB1', '10', 'publishB2', '10'), true, '"10" is "10"');
  });
});

suite('L1 — a sibling fanout pair: the case neither corpus contained', (test) => {
  test('it validates with ZERO findings, which is what makes the defect silent', () => {
    equal(validateDefinition(SIBLING_FANOUTS, reg).length, 0, 'sibling-fanouts must be valid');
  });

  test('and BOTH its regions are opened by a `fanout` — P14 decision 3, asserted', () => {
    // **Bound directly rather than incidentally.** W49's adequacy reader turned
    // `splitA` into a `map` opener and the suite went red — but by `branchPathOf`'s
    // `ID-R6` refusal, not by anything asserting the KIND, so the requirement that
    // the evidence include a sibling FANOUT pair was carried by a side effect.
    const rs = regionsOf(SIBLING_FANOUTS);
    equal(rs.map((r) => `${r.fanoutId}:${r.opensWith}`).sort(), ['splitA:fanout', 'splitB:fanout'],
      'the corpus has no sibling fanout pair, so this document is the evidence');
    equal(sharedRegionDepth(rs, 'publishB1', 'scoreA1'), 0, 'and they are SIBLINGS, sharing nothing');
  });

  test('the two branch entries of the second region sit at paths 0 and 1', () => {
    const rs = regionsOf(SIBLING_FANOUTS);
    // Read from `branches: ["publishB1", "publishB2"]` in declaration order — a
    // fanout's branch index is a property of the NODE (section 4).
    equal(branchPathOf(rs, 'scoreA1'), '0', 'branches[0] of splitA');
    equal(branchPathOf(rs, 'scoreA2'), '1', 'branches[1] of splitA');
    equal(branchPathOf(rs, 'publishB1'), '0', 'branches[0] of splitB');
    equal(branchPathOf(rs, 'publishB2'), '1', 'branches[1] of splitB');
  });

  test('BOTH branches see scoreA1, and under the prefix rule only one did', () => {
    const rs = regionsOf(SIBLING_FANOUTS);
    // This is the pair, and its difference is asserted rather than carried by a
    // literal (`doc/workflow.md` section 5 rule 8's fourth requirement): the two
    // readers differ in their path and in nothing else, and the old rule answered
    // differently for the two while the new one answers the same.
    const b1 = branchPathOf(rs, 'publishB1');
    const b2 = branchPathOf(rs, 'publishB2');
    ok(b1 !== b2, 'the pair collapsed — both readers are at the same path');
    // **A second observer, sourced from the DOCUMENT rather than from the region
    // maths** — obligation (c)'s LIMIT. A `fanout`'s branch index is its position
    // in `branches` (section 4), so the declaration is an independent expression of
    // the same fact and a probe that re-sources either leaves the other live.
    const declared = (SIBLING_FANOUTS.nodes.find((n) => n?.id === 'splitB') as unknown as
      { branches: string[] }).branches;
    equal(b1, String(declared.indexOf('publishB1')), 'branch 0 by the document`s own order');
    equal(b2, String(declared.indexOf('publishB2')), 'branch 1 by the document`s own order');

    equal(outputIsVisible(rs, 'publishB1', b1, 'scoreA1', '0'), true, 'branch 0 sees it');
    equal(outputIsVisible(rs, 'publishB2', b2, 'scoreA1', '0'), true, 'and so does branch 1');

    equal(prefixVisible(b1, '0'), true, 'the old rule resolved for branch 0');
    equal(prefixVisible(b2, '0'), false, 'and stopped the run for branch 1 — FD-R3');
  });

  test('both branches declare the SAME reference, so nothing but the path differs', () => {
    const needs = (id: string) =>
      JSON.stringify((SIBLING_FANOUTS.nodes.find((n) => n?.id === id) as unknown as
        { needs: Record<string, unknown> }).needs);
    equal(needs('publishB1'), needs('publishB2'), 'the two readers must declare one thing');
    equal(needs('publishB1'), '{"own":".","first":"scoreA1"}', 'read from the document');
  });
});
