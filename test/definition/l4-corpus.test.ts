/**
 * Ladder L4 — definition conformance.
 *
 * **This is the reason W3 runs before W2.** A refusal rule that rejects the spec's
 * own valid examples shipped in two of the four versions of
 * `spec/flow-definition.md` — `FD-V13` at v0.1, `FD-V19` at v0.2, the second one
 * rejecting the flow P1 exists to run. Until this file existed, that property was
 * held up by a throwaway script outside the repository and one conformity reader
 * who reproduced it. Here it is a gate, and it is true of every future version
 * rather than of one that happened to get checked.
 *
 * The corpus is W1's. It is hand-written and MUST NOT be regenerated from this
 * validator's output (`doc/workflow.md` section 5 rule 4) — a corpus produced by
 * the code under test proves only that the code agrees with itself.
 *
 * If this disagrees with `spec/`, **stop and report the conflict** rather than
 * adjusting either (`spec/README.md` rule 2).
 */
import { collected, equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { BUILT_IN_NODE_TYPES, validateDefinition, violatedRules } from '../../src/definition/validate.ts';

/**
 * **The node types the LIBRARY ships** - v0.28, [W109](../../doc/work-items/w109-a-node-that-only-transforms.md),
 * [ADR 0075](../../doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md).
 * `nodeTypesOf` merges them, so every registry holds them and no registry DOCUMENT declares them; the
 * censuses below add them where they count what resolves and exempt them where they count what the
 * document declares. The literal `'Transform'` is asserted against this list in
 * `test/definition/node-type.test.ts`'s W109 suite, so a built-in added without these clauses moving is
 * caught there rather than absorbed here.
 */
const BUILT_INS = Object.keys(BUILT_IN_NODE_TYPES);
import { resolveRegistry } from '../../src/definition/registry.ts';
import type { FlowDefinition, Registry } from '../../src/definition/types.ts';
import { CORPUS_LANGUAGES, corpusRegistry, type CorpusRegistryDocument } from './corpus-types.ts';

const EX = `${ROOT}spec/examples`;

// **The registry is a DOCUMENT since v0.19 (W65, ADR 0054)**: its `workers`, `nodeTypes` and `pools`
// are read as the validator's own sets, its `groups` are instances whose KEYS are the ids a node may
// name (`FD-V31` is a refusal ABOUT a registry, so `task-config.flow.json` validates only against one
// that declares `gpu` and `api`), and the one thing the document cannot carry — a language adapter's
// `compile`, a function — is what `corpus-types.ts` resolves. Compared both ways below.
const registryDoc = JSON.parse(await readText(`${EX}/registry.json`)) as CorpusRegistryDocument;
const registry: Registry = corpusRegistry(registryDoc);

const specText = await readText(`${ROOT}spec/flow-definition.md`);
const validNames = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json'));
const invalidNames = (await listDir(`${EX}/invalid`)).filter((n) => n.endsWith('.flow.json'));

const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;

/**
 * **The corpus and the spec's own table, compared BOTH WAYS** — `spec/flow-definition.md`
 * section 7, added at v0.8 by [W32](../../doc/work-items/w32-what-a-map-fanout-is.md).
 *
 * **Equality rather than a floor**, for `S12`'s reason in `scripts/check-source.mjs`: a
 * floor answers *are there at least N*, and `RUN_FLOOR` is the worked example of one
 * going stale in the direction of weakness ([Q102](../../doc/questions/q102.md)). This
 * fails in both directions — a flow added with no row, and a row naming a flow that is
 * gone.
 *
 * **It had a live case the day it was written.** `nested-fanout.flow.json` was added by
 * [W20](../../doc/work-items/w20-what-a-nested-region-is.md) and never documented, so
 * section 7's table was stale by one for a whole plan and every check here passed.
 *
 * **And it closes a WIRING hole** (`doc/workflow.md` section 5 rule 8 obligation (e)).
 * Until this existed, renaming a corpus flow out of the `.flow.json` glob was noticed by
 * **nothing**: the loops below simply had one less case, `check-spec`'s `C4` never opens a
 * file, and the only bound was `length > 0`. Measured before this was written.
 */
const documentedValid = (() => {
  // Anchored on the SECTION HEADING, not on the first mention of the directory:
  // `spec/examples/valid/` occurs in section 4's own warning paragraph and
  // `spec/examples/invalid/` occurs in section 5's preamble, so a marker-to-marker
  // slice reads a region with no table in it and returns an empty list.
  const from = specText.indexOf('## 7. Examples');
  const doc = from < 0 ? '' : specText.slice(from);
  const stop = doc.indexOf('`spec/examples/invalid/`');
  const table = stop < 0 ? doc : doc.slice(0, stop);
  // **Two narrowings here have NO discriminating case in section 7 as written, and
  // that is recorded rather than argued** — `doc/workflow.md` section 5 rule 8's
  // *"where the corpus cannot express one, RECORD that"*. Both were measured
  // replaceable for 0 by W32's adequacy reader: dropping the `stop` slice above,
  // and loosening the row anchor below to a bare backticked filename. The only
  // text after the table that mentions a flow filename is the
  // `<rule-id>--<slug>.flow.json` convention, which the character class already
  // excludes. They are kept because they are correct, not because anything here
  // can fail without them — the same sentence `check-markdown`'s `M1` earned at
  // W25, and `M1` caught a real dead link one plan later.
  // **Rows, not names** — see the provenance case in the suite below. The second
  // cell is what makes this parse falsifiable.
  return [...table.matchAll(/^\|\s*`([A-Za-z0-9_.-]+\.flow\.json)`\s*\|([^|]*)\|/gm)]
    .map((m) => ({ file: m[1]!, shows: m[2]!.trim() }))
    .sort((a, b) => (a.file < b.file ? -1 : 1));
})();

/** Every `FD-V*` id section 5 declares, and the ones it declares deliberately absent. */
const declaredRules = (() => {
  const all: string[] = [];
  const absent: string[] = [];
  for (const m of specText.matchAll(/^\|\s*`(FD-V\d+)`\s*\|(.*)$/gm)) {
    all.push(m[1]!);
    if (/deliberately absent/i.test(m[2]!)) absent.push(m[1]!);
  }
  return { all, absent, expected: all.filter((r) => !absent.includes(r)).sort() };
})();

suite('L4 — the corpus IS what spec/flow-definition.md section 7 says it is', (test) => {
  test('every valid flow on disk has a row in section 7, and every row has a file', () => {
    // Two assertions rather than one `equal`, so a failure says which DIRECTION
    // broke. **Equality rather than a floor**, for `S12`'s reason in
    // `scripts/check-source.mjs`: a floor answers *are there at least N*, and
    // `RUN_FLOOR` is the worked example of one going stale toward weakness
    // ([Q102](../../doc/questions/q102.md)).
    //
    // **It had a live case the day it was written.** `nested-fanout.flow.json` was
    // added by [W20](../../doc/work-items/w20-what-a-nested-region-is.md) and never
    // documented, so section 7's table was stale by one for a whole plan.
    //
    // **And it closes a WIRING hole** (`doc/workflow.md` section 5 rule 8 (e)):
    // until this existed, renaming a corpus flow out of the `.flow.json` glob was
    // noticed by **nothing** — the loops below simply had one less case,
    // `check-spec`'s `C4` never opens a file, and the only bound was `length > 0`.
    const onDisk = [...validNames].sort();
    const named = documentedValid.map((r) => r.file);
    equal(
      onDisk.filter((n) => !named.includes(n)),
      [],
      'a flow in spec/examples/valid/ has no row in spec/flow-definition.md section 7',
    );
    equal(
      named.filter((n) => !onDisk.includes(n)),
      [],
      'spec/flow-definition.md section 7 names a flow that is not in spec/examples/valid/',
    );
  });

  test('the two sets above really did come from the SPEC and not from the directory', () => {
    // **Provenance** — `doc/workflow.md` section 5 rule 8 (c), and W32's adequacy
    // reader found the hole this closes. The assertions above compare a PARSED list
    // against a DISK list; re-source the parse to `[...validNames]` and both
    // differences are empty by construction, the non-empty guard is satisfied, and
    // the check that exists to bind the corpus to the spec binds nothing. Measured:
    // exit 0, with the author's own `e2` probe — a corpus flow renamed out of the
    // glob — passing again underneath it.
    //
    // The discriminator has to be a value **the directory cannot produce**.
    // Section 7's rows carry a second cell saying what each flow SHOWS; a filename
    // listing has no such thing. A count would have been circular, which is why the
    // first version reached for one and stopped.
    ok(documentedValid.length > 0, "section 7's example table did not parse — the sets above are noise");
    equal(
      documentedValid.filter((r) => r.shows.length === 0).map((r) => r.file),
      [],
      'every row parsed from section 7 carries its "shows" cell — a disk listing carries none',
    );
  });

  test('the valid corpus contains every node kind the spec declares', async () => {
    // **Content, not names** — W32's adequacy reader. Until this existed, both map
    // flows could be rewritten as ordinary static flows with **no `map` node in
    // them at all**, stay valid, and leave every check green: `check-spec`'s `C4`
    // binds `invalid/` filenames to rule ids and *never opens a file*, and the
    // equality above binds `valid/` filenames to table rows and did not open one
    // either. `FD-V24`'s own list is where the five come from.
    const kinds = new Set<string>();
    for (const name of validNames) {
      const flow = await load(`valid/${name}`);
      for (const n of ((flow.nodes ?? []) as { kind?: string }[])) {
        if (typeof n?.kind === 'string') kinds.add(n.kind);
      }
    }
    equal(
      // `gate` since v0.23 (W92): `gated-map.flow.json` is its case. A kind the spec declares and no valid
      // example carries is a kind nothing demonstrates, which is this clause's whole subject.
      ['task', 'fanout', 'map', 'join', 'end', 'gate'].filter((k) => !kinds.has(k)),
      [],
      'a node kind the spec declares appears in no valid example, so nothing demonstrates it',
    );
  });

  test('the INVALID corpus is what section 5 declares, both ways', () => {
    // The same bound as the valid side, on the sibling directory — W32's adequacy
    // reader found it missing **in the file W32 rewrote to remove exactly this
    // shape**. `check-spec`'s `C4` bounds the DISK (a declared rule with no case
    // fails) and nothing bounded the WALK: `invalidNames.slice(1)` dropped 21 of 23
    // cases and the suite reported `all passed`, because its only bound was
    // `length > 0` — `RUN_FLOOR`'s shape again ([Q102](../../doc/questions/q102.md)).
    const prefixes = [...invalidNames].map((n) => n.split('--')[0]!).sort();
    equal(
      declaredRules.expected.filter((r) => !prefixes.includes(r)),
      [],
      'a declared FD-V rule has no case in the WALK — this is C4 one layer in from the disk',
    );
    equal(
      prefixes.filter((r) => !declaredRules.expected.includes(r)),
      [],
      'the walk carries a case for a rule section 5 does not declare, or declares absent',
    );
    // and the parse this rests on is not vacuous, in both directions
    ok(declaredRules.all.length > 20, `section 5's rule table did not parse — got ${declaredRules.all.length}`);
    // Four since v0.19: FD-V5 and FD-V34 retired with workerType (W65, ADR 0054), their ids held.
    equal([...declaredRules.absent].sort(), ['FD-V14', 'FD-V15', 'FD-V34', 'FD-V5'],
      'the four deliberately-absent ids, read from the spec text rather than declared here');
  });
});

suite('L4 — every valid example validates clean', (test) => {
  ok(validNames.length > 0, 'spec/examples/valid/ has no flows — the corpus is missing');

  test('registry.json IS a registry document: it resolves against the corpus`s code with nothing refused, one default pool per type plus the named ones', () => {
    // The corpus registry is held to the same construction-time refusals a consumer's is (W65):
    // every schema in the subset, every type's worker present, every pool's type present, every
    // group an instance of a built-in, every named predicate and language supplied.
    const r = resolveRegistry(registryDoc, { predicates: registryDoc.predicates, languages: CORPUS_LANGUAGES });
    equal([...r.nodeTypes.keys()].sort(), Object.keys(registryDoc.nodeTypes).sort(), 'every declared type resolves — and the built-ins are NOT stored, being merged at every read (ADR 0075 rule 5)');
    equal([...r.pools.keys()].sort(), [...Object.keys(registryDoc.nodeTypes), ...Object.keys(registryDoc.pools)].sort(), 'a default instance per type, plus the named instances');
    equal([...r.groups.keys()].sort(), Object.keys(registryDoc.groups).sort(), 'every group resolves to a built-in factory');
    ok(Object.keys(registryDoc.pools).length > 0, 'and the corpus declares at least one named instance, so the pools half is not vacuous');
  });

  test('the corpus names exactly the registry document`s types, pools and workers — both ways, each (rule 8 obligation (e), third shape)', async () => {
    const namedTypes = new Set<string>();
    const namedPools = new Set<string>();
    for (const name of validNames) {
      for (const n of (await load(`valid/${name}`)).nodes) {
        if (n.kind !== 'task') continue;
        namedTypes.add((n as { type: string }).type);
        const pool = (n as { pool?: string }).pool;
        if (pool !== undefined && pool !== (n as { type: string }).type) namedPools.add(pool);
      }
    }
    // Types: every type a valid flow names is declared, and every declared type is named by some valid flow.
    // A valid flow may name a BUILT-IN type, which no registry DOCUMENT declares (v0.28, ADR 0075
    // rule 5) — that is the whole point of the merge, and `transform-only-node.flow.json` is the case.
    // The other direction is unchanged: a type the document declares and no flow names is still a defect.
    equal([...namedTypes].filter((t) => !(t in registryDoc.nodeTypes) && !BUILT_INS.includes(t)), [],
      'a valid flow names a type that is neither the document`s nor a built-in');
    equal([...namedTypes].filter((t) => BUILT_INS.includes(t)), ['Transform'],
      'and the corpus DOES exercise the built-in — the clause above would be satisfied by a corpus that never named one');
    equal(Object.keys(registryDoc.nodeTypes).filter((t) => !namedTypes.has(t)), [], 'the document declares a type no valid flow names');
    // Named pools, the same, and each named where the node's type is the pool's.
    equal([...namedPools].filter((p) => !(p in registryDoc.pools)), [], 'a valid flow names a pool the document does not declare');
    equal(Object.keys(registryDoc.pools).filter((p) => !namedPools.has(p)), [], 'the document declares a named instance no valid flow uses');
    // Workers: every type's worker exists, and every worker is some type's.
    // `t.worker` is optional since v0.28 — a type that only TRANSFORMS names none (ADR 0075) — so the
    // census is over the types that DO name one. The corpus declares no worker-less type of its own:
    // `Transform` is a BUILT-IN and is not in this document, which the clause below asserts.
    const workersNamed = new Set(Object.values(registryDoc.nodeTypes).map((t) => t.worker).filter((w): w is string => w !== undefined));
    equal(Object.values(registryDoc.nodeTypes).filter((t) => t.worker === undefined).length, 0,
      'every node type the corpus DOCUMENT declares names a worker — a worker-less type is a built-in and is declared in code');
    equal([...workersNamed].filter((w) => !(w in registryDoc.workers)), [], 'a type names a worker the document does not declare');
    equal(Object.keys(registryDoc.workers).filter((w) => !workersNamed.has(w)), [], 'the document declares a worker no type names');
    ok(namedTypes.size > 0 && namedPools.size > 0 && workersNamed.size > 0, 'none of the three sets is empty');
    // And the retired key is nowhere in the valid corpus.
    for (const name of validNames) for (const n of (await load(`valid/${name}`)).nodes) ok(!('workerType' in n), `${name}: no node carries the retired workerType key`);
  });

  test('registry.json`s languages are exactly the adapters corpus-types.ts resolves, both ways — and each has a compile function (W61)', () => {
    equal([...registryDoc.languages].sort(), Object.keys(CORPUS_LANGUAGES).sort(),
      'the names registry.json declares under languages are the keys corpus-types.ts defines');
    ok(registryDoc.languages.length > 0, 'and the set is not empty, which would make the comparison vacuous');
    for (const [name, a] of Object.entries(CORPUS_LANGUAGES)) ok(typeof a.compile === 'function' && typeof a.worker === 'string', `${name} has both halves`);
  });

  for (const name of validNames) {
    test(name, async () => {
      const findings = validateDefinition(await load(`valid/${name}`), registry);
      equal(
        violatedRules(findings),
        [],
        `a valid example was rejected. Per spec/README.md rule 2 this is a conflict to report, ` +
          `not to patch:\n    ${findings.map((f) => `${f.rule} at ${f.at}: ${f.detail}`).join('\n    ')}`,
      );
    });
  }
});

suite('L4 — every invalid example is rejected, naming its own rule', (test) => {
  ok(invalidNames.length > 0, 'spec/examples/invalid/ has no flows — the corpus is missing');

  for (const name of invalidNames) {
    // The expected value comes from the FILENAME, which W1 wrote from the rule —
    // never from what the validator happens to report.
    const expected = name.split('--')[0]!;
    test(`${name} violates ${expected}`, async () => {
      const rules = violatedRules(validateDefinition(await load(`invalid/${name}`), registry));
      ok(rules.length > 0, `${name} was accepted; it must be rejected`);
      ok(
        rules.includes(expected),
        `${name} was rejected, but not for ${expected}. spec/flow-definition.md section 5 requires ` +
          `the named rule among the findings.\n    reported: ${rules.join(', ')}`,
      );
    });
  }
});

suite('L4 — the corpus covers the refusals, and FD-V14 has no case', (test) => {
  test('FD-V14 is declared absent and must not acquire a case', () => {
    ok(
      !invalidNames.some((n) => n.startsWith('FD-V14--')),
      'FD-V14 is deliberately absent (spec/flow-definition.md section 4). A case for it would mean ' +
        'the all-paths rule was re-added, which makes p1-routed-away.flow.json invalid input.',
    );
  });

  test('p1-routed-away is in the valid corpus', () => {
    ok(
      validNames.includes('p1-routed-away.flow.json'),
      "P1's own case must be an authorable, valid flow. If it is not here, the plan has no input.",
    );
  });
});

/**
 * **The suite census — [Q158](../../doc/questions/q158.md), closed here.**
 *
 * Found by [W41](../../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)'s
 * adequacy reader, which renamed both of that item's `.test.ts` files out of the
 * runner's glob and got **`21 file(s), 579 assertions … all passed`, exit 0**, with
 * every static check green: twenty-seven cases — the entire evidence for `FD-C1`,
 * `FD-C2`, `FD-R3`, `FD-V26`, `FD-V27` and `FD-V28` — gone with nothing red. Q158
 * has recorded that hole since [W32](../../doc/work-items/w32-what-a-map-fanout-is.md)
 * and named `test/runner.ts` and `scripts/**` as where a fix would live, **which is
 * why nobody built one**: both are in nobody's `Owns`.
 *
 * **It does not have to live there.** The runner and the browser bundle glob the
 * same tree, and a suite that did not load is a suite `collected()` does not hold —
 * so the bound is over SUITE NAMES, it is one assertion, it works in all five
 * runtimes, and it is inside `test/definition/**`, which W41 owns. **Set equality
 * both ways**, for `S12`'s reason: a floor answers *are there at least N* and goes
 * stale toward weakness ([Q102](../../doc/questions/q102.md)), while an equality
 * fails when a suite disappears AND when one is added without a row here.
 *
 * **Read inside a `test()` body and not at module scope**, because the runner
 * imports every file before running any case; at module scope this would see only
 * the suites that happened to load first.
 *
 * **The limit, stated rather than left to be rediscovered**: this file cannot bind
 * ITSELF. Renamed out of the glob, it takes this census with it — and the corpus
 * equality above with it, which is the same regress one door along. *The regress
 * stops at the first thing that can fail to run*, which is
 * [W31](../../doc/work-items/w31-the-self-list-check-policies-never-had.md)'s own
 * sentence about `SELF` lists, in a test file rather than in a self-test.
 */
const SUITES = [
  'ADR 0002 rule 3 — the definition is validated in full at instantiation',
  'ADR 0004 — user_action suspends, and a resolution resumes the path',
  'ADR 0014 — the driver produces one ordered input sequence',
  'ADR 0014 — the ordering clauses no test reached',
  'ADR 0022 — the surface says what ID-R3 says',
  'ADR 0030 — a region behaves the same whether or not it is nested',
  'FD-R1 — eligible edges exist and none matches: the run fails loudly',
  'FD-V10 and FD-V11 — a cycle does not suppress unreachability',
  'FD-V18 and FD-V21 — the sub-clauses the corpus case cannot separate',
  'FD-V2 and FD-V6 — a join.of naming nothing violates both',
  'FD-V3 — both clauses, not just the one the corpus holds',
  'FD-V7 — every clause, none shadowing another',
  'FD-V8, FD-V16, FD-V17, FD-V21, FD-V23 — every clause',
  'FD-V9 — every clause',
  'ID-R1 — a duplicate dispatch is refused before addTask sees it',
  'ID-R2 — the charset is enforced at run creation, not just in the helper',
  'ID-R3 — a driver serves exactly one run, and start() is called at most once',
  'ID-R4 — a settlement carrying OUR run id for a task we never dispatched stops the run',
  'ID-R4 — a settlement for ANOTHER run is ignored, silently',
  'ID-R4 — both tiers are decided before the terminal state is read',
  'ID-R5 — an inbound id no driver minted is reported and dropped, not refused',
  'JP-R1 — every shipped policy is pure',
  'JP-R2 — describe reports CONTENT, not just valid JSON',
  'JP-R5 — branch.lost and branch.resumed, which nothing drove before',
  'JP-R5 — the region event stream',
  'JP-R7 — decrementing N on branch.exited is a third policy',
  'JP-R8 — requiring an arrival before satisfied is a third policy, and it is SHIPPED',
  'L1 — FD-V26 on an EDGE: the grammar, minus one form',
  'L1 — FD-V26: the reference GRAMMAR',
  'L1 — FD-V27: where a reference POINTS',
  'L1 — FD-V28: the FORM must match the graph',
  'L1 — FD-V29: an unconditional reference names a node that MUST have run',
  'L1 — FD-V29 is not dominance, and that is a measurement over the corpus',
  'L1 — every suite this tree declares actually RAN',
  'L1 — outputIsVisible: the prefix rule is the SPECIAL CASE',
  'L1 — sharedRegionDepth: how many regions contain BOTH nodes',
  'L2 — ADR 0044: what a run carries across SIBLING regions',
  'L1 — a sibling fanout pair: the case neither corpus contained',
  'L1 — the two flows P12 exists for validate with zero findings',
  'L1 — what `FD-V17` refuses against IS what `spec/` declares',
  'L2 — FD-C1: what a node receives',
  'L2 — FD-C2: what NAMES an output',
  'L2 — FD-C3: what a decision sees',
  'L2 — FD-C4: a conditional reference, when the target produced nothing',
  'L2 — FD-R3: a reference the run did not produce',
  'L2 — JP-R12: a map`s join carries its N results, and that is P10`s point',
  'L2 — JP-R12: the KEY ORDER, on the only shape that can discriminate it',
  'L2 — Q186: what a reference costs, as a product and as a decision',
  'L2 — `joined: false` and `joined: null` are the same outcome',
  'L2 — `over` must name an array, and that is a RUN-TIME refusal',
  'L2 — a dead INNER join, through the fold',
  'L2 — a decision picks the first eligible edge whose predicate passes',
  'L2 — a map dispatches one task per item, at an arity no document carries',
  'L2 — a map of ZERO items',
  'L2 — a region opener INSIDE a map region RUNS, keyed by the INSTANCE',
  'L2 — arrival-count at a run-time arity does not fire EARLY',
  'L2 — from `unsatisfiable` to `stuck`, in one run',
  'L2 — sequence routes from a fixture log, with no scheduler',
  'L2 — the two-digit arity, where three orderings stop agreeing',
  'L2 — the whole matrix, checked against the fold and against the scheduler',
  'L3 — a map run folds deterministically',
  'L3 — determinism: fold the same log twice and deep-compare',
  'L4 — every invalid example is rejected, naming its own rule',
  'L4 — every valid example validates clean',
  'L4 — the corpus IS what spec/flow-definition.md section 7 says it is',
  'L4 — the corpus covers the refusals, and FD-V14 has no case',
  'L5 at a run-time arity — the matrix over a `map` region',
  'L5 at depth 2 — the join over a nested fan-out',
  'L5 — the fourth column: what each refinement changes',
  'L5 — the join/failure matrix, cell by cell',
  'L5 — what the matrix says as a whole',
  'OR-R1 — nothing reachable from e.detail is retained',
  'OR-R10 — a stopped run dispatches nothing further on the SCHEDULER edge',
  'OR-R10 — a stopped run stops on the INBOUND edge too',
  'OR-R2 and OR-R6 — result is deep-copied, and an uncloneable one fails the run',
  'OR-R3 — one record per settlement, keyed on terminal state not event name',
];

/** The rest of the census, split only so neither literal is unreadably long. */
const LATE_SUITES = [
  // W164 — ADR 0098, four annotations in the schema subset: L1 in `test/definition/schema.test.ts`.
  'W164 — four annotations in the schema subset: title, description, readOnly, writeOnly — shape-checked, constraining nothing (ADR 0098)',
  // W163 — ADR 0097, FD-R6 and `defaultRetryPolicy` at construction: L1 on the seams and on a real scheduler, in
  // `test/scheduler/runtime.test.ts`.
  'W163 — what start refuses that the flow does not decide: FD-R6, a node reaching a built-in keyed group, and defaultRetryPolicy at construction (ADR 0097)',
  'W163 — FD-R6 on a REAL scheduler: P37 fact 1`s refusal before addTask, and its createTask road completing on a real keyed group',
  // W159 — FD-C5's context and the two v0.33 pool options, through the envelope and on real pools, in
  // `test/scheduler/envelope-worker.test.ts`.
  'W159 — a typed worker REACHES context.signal and context.emit through the envelope, and a type`s cancelGraceMs and messages reach its pool',
  // W158 — ADR 0094, a task that ends `cancelled`: L1-L3 and RN-R23 in `test/driver/cancelled.test.ts`, the fold in
  // `test/fold/cancelled.test.ts`, L5 in `test/matrix/cancelled.test.ts`.
  'L1 — OR-R3 and OR-R4: a cancel writes ONE record, keyed on its state; a cancel REQUESTED writes none',
  'L2 — RN-R28: the first cancelled settlement HALTS the run (a cancel mid-fan-out)',
  'L3 — a cancelled run is deterministic: driven twice, folded twice',
  'RN-R23 — a resume of a CANCELLED run is refused as `cancelled`, naming the cancel`s position',
  'L1 — a cancelled settlement folds to a cancelled NODE, verbatim (spec/run-state.md section 4)',
  'L1 — RN-R28: `cancelled` ranks below `stopped` and above every other outcome',
  'L3 — a cancelled run`s sequence folds the same way twice, and prefix by prefix (RN-R1, RN-R2)',
  'L5 — a cancelled branch under every policy: the join waits, the run is `cancelled`, nothing is `stuck`',
  // W141 — Q266 at L1 (the class, and real inline and threaded pools) in `test/scheduler/transform.test.ts`,
  // at L2 in `test/driver/node-type.test.ts`; Q283 in `test/definition/registry.test.ts`.
  'W141 — a type`s worker that cannot set up: setup() never throws, and every task fails from run() naming why (Q266)',
  'W141 — a task failed by its type`s setup routes as any task failure: down on:["failed"] when optional, parked when not (Q266, ADR 0004)',
  'W141 — one shape function: checkRegistry and resolveRegistry refuse every shape defect identically (Q283)',
  // W142 — ADR 0088's routing, through `createRuntime`'s scheduler seam, in `test/scheduler/runtime.test.ts`.
  'W142 — ADR 0088: a settlement reaches only the driver holding its run id, and an id no driver minted reaches every driver',
  // W151 — ADR 0091's release on done, through the same seam, in `test/scheduler/runtime.test.ts`.
  'W151 — ADR 0091: a runtime releases a run when its done settles, keeps its run id, and keeps every run that has not settled',
  // W153 — ADR 0092, a gate type's routes from its NODE: L1 in `test/definition/gate.test.ts`, the wiring check's two
  // sites in `test/definition/wiring.test.ts`, L2 in `test/driver/gate.test.ts`.
  'W153 — a gate type`s routes may come from its NODE: routesFor, settingsProblem, routesOf, FD-V39 to FD-V41 per gate',
  'W153 — the wiring check reads a DERIVED gate`s routes off its NODE: the default edge and keyResolvedRoutes',
  'W153 — a gate whose routes come from its NODE, in a run: the derived route, its default, FD-R5 against the NODE`s set',
  // W154 — P32 decisions 4-6, the built-in `if` and `switch`: L1 in `test/definition/gate-builtins.test.ts`, L2 in
  // `test/driver/gate-builtins.test.ts`.
  'W154 — the built-in if and switch: registered through the interface, their grammar, and what each decides',
  'W154 — the built-in if and switch in a run: every route taken, FD-R4 through an entry if, no memory, no code registered',
  // W109 — the BUILT-IN node type and `FD-V46`, in `test/definition/node-type.test.ts`; the no-inner
  // arm on real pools, in `test/scheduler/transform.test.ts`.
  'W109 — the BUILT-IN node type: nameable with no nodeTypes declared, and FD-V46 when it has nothing to do',
  'W109 — a type that only TRANSFORMS: the transform IS the task, on a real pool and on the class',
  'W109 — sampledOutput: the shape a transform-only node emits, and the residue it reports beside it',
  'W109 — the pool config the library BUILDS for a transform-only type, and what the arm READS',
  // W108 — `FD-V42`-`FD-V45`, the subset and the absent rule, in `test/definition/predicate.test.ts`
  // and `test/driver/predicate.test.ts`.
  'W108 — a predicate is DATA: FD-V42 to FD-V45, the subset, and the absent rule',
  'W108 — a DECLARED predicate ROUTES, with no predicate registered at all',
  // W57 — ADR 0048 rule 5 at L1, in `test/driver/surface.test.ts`.
  'ADR 0048 rule 5 — createTask: the option is honoured, and the default is exactly new FyflowTask(config)',
  // W58 — `FD-V30`, `FD-V31` and the passthrough, in `test/definition/task-config.test.ts` and
  // `test/driver/task-config.test.ts`.
  'FD-V30 — retryPolicy is exactly the scheduler`s shape, every clause, on every shape',
  'FD-V31 — workerGroups names only groups the registry declares, every clause, on every shape',
  'the task key table — section 2 and FD-V17 agree on what a task declares, both ways',
  'W58 — retryPolicy and workerGroups reach createTask exactly as the node declares them',
  // W59 — `FD-V32`-`FD-V34`, the envelope and the bootstrap helper, in
  // `test/definition/node-type.test.ts`, `test/driver/node-type.test.ts` and
  // `test/scheduler/bootstrap.test.ts`.
  'FD-V32 — type is REQUIRED and names a registered node type whose worker the registry declares, every clause, on every shape',
  'FD-V33 — settings is a plain object the worker`s settingsSchema accepts, with the type`s defaults merged under, every clause, on every shape',
  'FD-V38 — pool names a registered instance of THIS node`s type, every clause, on every shape',
  'the typed corpus flow — section 7`s rows, the four shapes, the pooled flow, and the registry document both ways',
  'W59 — a typed node is dispatched to its type`s pool with the envelope { settings, input } — FD-C5, on every shape',
  'W59 — what a type declares for its nodes: the retry merge and the groups, at construction and at dispatch',
  'W59 — bootstrap: one pool per type keyed by its name, the groups both ways, and the default pool is a real WorkerManager',
  'W59 — the envelope worker: unpacks the two keys, refuses everything else, and drives the inner worker`s lifecycle',
  // W61 — `FD-V35`-`FD-V37`, `FD-C6`, the wrapper evaluating and the adapter conformance suite, in
  // `test/definition/transform.test.ts`, `test/driver/transform.test.ts`,
  // `test/scheduler/transform.test.ts`, `test/scheduler/fake-language.test.ts` and
  // `test/scheduler/bootstrap.test.ts`.
  'FD-V35, FD-V36 and FD-V37 — what a node may DO to its input, every clause, on every shape',
  'the transformed corpus flow — section 7`s row, the four shapes, and the registry`s languages both ways',
  'W61 — a typed node`s envelope carries its declared transform as a THIRD key, only when declared — FD-C6 at L2, on every shape',
  'W61 — the untransformed envelope is byte-identical with and without languages registered — P17 decision 8',
  'W61 — the envelope worker evaluates a declared transform in run(), on all four kinds of input FD-C5 names',
  'W61 — a transform on a REAL pool, inline and threaded: the transformed input arrives, and a failure takes a task`s two roads',
  // W162 renamed this W61 suite when ADR 0096 reversed what it asserts (ADR 0051 rule 4).
  'W162 — bootstrap writes EVERY language it is given into EVERY pool it builds, and reads no flow (ADR 0096 rule 2)',
  'adapter conformance — path (the fake language, a test fixture)',
  'the fake language — what the fixture itself claims',
  // W65 — the registry document, the subset validator and the derivation, in
  // `test/definition/schema.test.ts` and `test/definition/registry.test.ts`.
  'ADR 0053 — the subset validates P18 fact 1`s fourteen cases exactly as the measurement said',
  'ADR 0053 — every keyword of the subset, a positive and a negative case each, and the list bound to the spec both ways',
  'Q278 — a keyword outside the subset is REFUSED at construction naming it, and so is a malformed keyword value',
  // W72 — `examples`, the subset's thirteenth keyword and an annotation (ADR 0056), in `schema.test.ts`.
  'ADR 0056 — examples is an annotation: held to its schema at construction, ignored by every value check',
  // W73 — the wiring check and FD-R4, in `wiring.test.ts` and `test/driver/boundary.test.ts`.
  'W73 — fits(P, C): P19 fact 3`s relation, its twelve controls as fixtures, its stated leniency and the map record',
  'W73 — the two enumerations are the spec`s tables, both ways',
  'W73 — the wiring fixture corpus IS what section 7 says it is, and every verdict kind is reached',
  // **W110's second observer of `AGENTS.md` section 21's first two guards** — its adequacy reader
  // (F5) made all five of that section's guards tautologies at `check:docs` EXIT 0, and the two
  // about the EMPTY registry had no observer anywhere else. BOTH HALVES from the start here: this
  // row and the case count below, which is the counter-measure W108 took half of.
  'W110 — the UI-emitted documents validate with an EMPTY predicate registry: section 21`s first two guards, at L1',
  'W73 — the L6 corpus census, as an EQUALITY, and every arc shape reached',
  'W73 — constructed shapes: needs, a fan-out`s record, a map`s arity, the witness road, provenance',
  'FD-R4 at START — the payload is held to the first task(s) it reaches, once, and a refusal leaves the driver unstarted',
  'FD-R4 at RESOLVE — a person`s value is held to the parked node`s worker outputSchema, once, and a refusal leaves the task suspended',
  'FD-R4 through the runtime — createRuntime forwards the switch to every driver it starts',
  // W74 — the authoring assists over that check, in `assist.test.ts`.
  'W74 — pathsOf: every path a value may carry, over the whole subset',
  'W74 — tryTransform: the sample-and-diff loop, one candidate at a time',
  'W74 — the session`s two workers, RUN on their own declared examples (ADR 0056 rule 3)',
  'W74 — signatureOf: the SHAPE, as text, and the file it generated',
  'the minimum sample resolves — the document, the class, the custom group and the four pools, with NOTHING constructed',
  'the identity derivation reproduces what bootstrap hands WorkerManager today — P18 fact 5, prediction 2',
  'both SHAPES of a node type, every field of both interfaces, under one claim: what the derived spec and the definition carry',
  'every construction-time refusal, by name — a document that trips it and the sample that does not',
  'the key sets are claims about the spec`s tables — compared both ways',
  // W65's conformity reader: four refusal clauses without a fixture, and the schema's `in` walking Object.prototype.
  'the refusal table`s remaining clauses — the conformity reader`s four',
  'the object keywords read OWN keys, never inherited ones',
  // W66 — the runtime entry, in `test/scheduler/runtime.test.ts`.
  'W66 — createRuntime builds from a document: pools, groups and the driver`s registry',
  'W66 — decision 7: a relative worker url resolves against the consumer`s BASE, and without one is refused',
  'W66 — decision 4: the group factories, and what a created group is held to',
  'W66 — decision 9 at the runtime: a resident group beside idleTimeout 0 is refused (P18 fact 6, re-run at W66)',
  'W66 — decision 10: start() mints a run id, defaults the policy, and hands the driver this runtime`s registry',
  // W162 renamed this W66 suite when ADR 0096 reversed decision 13's reading and added `runtime.check`.
  'W162 — every typed pool carries the registry`s languages, and start refuses from runtime.check (ADR 0096)',
  'W66 — every option start forwards, and every member the runtime exposes, observed',
  'W66 — the sub-path re-exports what this module exports, both ways',
  'W66 — a runtime on REAL pools: a document in, a completed run out',
  'W66 — what the runtime refuses that the document alone could not say',
  // W76 — what `start` ACCEPTS: `onRegionEvent` forwarded, and the two hand-written lists bound.
  'W76 — StartOptions and start() are two lists, and nothing compared them',
  'W76 — every StartOptions member ARRIVES at the driver, and the observer set is the type`s',
  'W76 — the forwarded stream IS the driver`s region stream, at every variant, kind and depth',
  // W77 — what `start` RETURNS: a completion handle the runtime keeps (ADR 0058).
  'W77 — `done` IS the caller`s own fold, and it settles exactly when that becomes terminal',
  'W77 — a driver refusal RESOLVES `done` with `stopped`, and never rejects',
  'W77 — a consumer`s own onFoldInput still receives every element, and `done` is not downstream of it',
  'W77 — `done` on a real scheduler, and `done` belongs to a RUN',
  // W62 — the JSONata adapter, in `test/jsonata/jsonata.test.ts` and `test/jsonata/function-table.test.ts`.
  'adapter conformance — jsonata (fyflow-orchestration/jsonata)',
  'W62 — the JSONata adapter: one module, five names unbound, JSONata`s errors as Errors',
  'W62 — the JSONata adapter through the envelope worker and on real pools, inline and threaded',
  'W62 — prediction 4: JSONata`s function table walked, every built-in evaluated twice on one input',
  'ADR 0046 / RN-R13 — a region releases its collection when its join becomes terminal',
  'OR-R11 — a result is a VALUE, and each shape asserts what does NOT cross',
  'OR-R11 — the corpus half of what bounding a result would cost',
  'OR-R4 — task.running and task.progress produce no record',
  'OR-R5 and OR-R7 — the log is ordered by append',
  'OR-R7 / ADR 0014 rule 2 — foldInputs() cannot be written through',
  'OR-R7 / ADR 0014 rule 2 — snapshot() cannot be written through',
  'OR-R7 / ADR 0014 rule 3 — onFoldInput cannot be written through',
  'OR-R7 and OR-R8 — the two tests W2 owed and did not ship',
  'OR-R7 — every ONE of the six region events is frozen, not just the one a fixture happens to emit',
  'OR-R7 — the seven outbound paths ADR 0014 does not name',
  'OR-R8 and OR-R9 — the effective outcome',
  'P1\'s case is now mechanically observable, which is what the plan needs',
  'P1\'s case — a decision inside a branch routes away from the join',
  'Q37 — what a consumer WITHOUT the callback can learn',
  'Q72 — the precondition the topology has, stated rather than assumed',
  'Q72 — two Drivers on ONE scheduler, which is what MultipleRuns tells you to build',
  'RN-R1 — step is pure on the RECORD path, not only the region path',
  'RN-R10 and RN-R12 — the reachable cases no test reached',
  'RN-R10 and `regionEntered` — an entered region that opened NOTHING',
  'RN-R10 — a run whose join can no longer fire is `stuck`, not `completed`',
  'RN-R10 — the precedence, in the order section 3 states it',
  'RN-R12 — a run is finished exactly when it is neither running nor awaiting_action',
  'RN-R2 — the fold is still total over any prefix, with the new inputs',
  'RN-R2 — the fold is total over any prefix',
  'RN-R3 and OR-R5 — append order, never a timestamp',
  'RN-R4, RN-R5 — a run holds only what the log says, keyed by task id',
  'RN-R6 — regions record what happened, not what a policy concluded',
  'RN-R7 — awaiting_action outranks running, now that both are reachable',
  'RN-R7, RN-R8 — the run-level outcome vocabulary and its precedence',
  'RN-R8 — stopped outranks everything, INCLUDING records that follow it',
  'RN-R9 — a resolved node is indistinguishable from one that settled that way',
  'RS-R1 — a resolution is refused unless the LAST record is user_action',
  'TERMINAL_EVENTS is the one list, and it is right',
  'a dead inner join, and what it does to the branch it sits in',
  'a policy that misbehaves does not take the run down silently',
  'branchIndices and branchIndexOf — the two derivations of branchPath',
  'completed vs failed is about how a PATH ended, not how a node settled',
  'every executable node kind has an arm — the default is not a narrowing',
  'every one of the six events reaches the policy',
  'live-token-requiring-arrival — JP-R8`s refinement, under its own id',
  'malformed input is reported, never thrown',
  'map — branchPath is a property of the DISPATCH (spec/task-id.md v0.8, ID-R6)',
  'map — the definition shape (spec/flow-definition.md v0.8 sections 2 and 5)',
  'map — the region maths is UNCHANGED (spec/flow-definition.md section 4)',
  'map — the two corpus flows ARE the shapes section 7 claims',
  'nested fan-out — which region a node is in when it is in two (FD-V15 retired)',
  'one refinement is shipped and the other is refused — ADR 0025',
  'regionOf on a nested flow — the driver reads the INNERMOST region',
  'regions record what happened — including the distinctions W4 needs',
  'spec/outcome-record.md section 2 — every declared field comes from its source',
  'spec/task-id.md — the scheme, the parse, and ID-R2',
  'the depth-2 rows say what they declare — the readers` gaps',
  'the depth-2 table renders, and the multi-region arm is executed',
  'the dispatched task carries what the definition declared',
  'the end-node exemptions — three shapes the corpus does not hold',
  'the exited path — status is asked after branch.exited, not only after arrival',
  'the join seam — the driver asks a policy and acts on the answer',
  'the log is not reachable from outside, including through result',
  'the lost path — status is asked after branch.lost too',
  'the policies against a Region that is not two branches',
  'the policies on non-conformant streams — asymmetries W4 could misread',
  'the refused variant is held to the same clause-level rules as the shipped ones',
  'the region guards — no region event escapes a non-region path',
  'the run-time-arity table renders',
  'the two pinned policies carry neither refinement — JP-R7 and JP-R8',
  'three things the driver decides that spec/ does not state',
  'two sequential fan-outs sharing one `end` node',
  'what the driver reports and what it does must agree',
  'where the two policies AGREE — the cases that separate nothing',
  'where they DIFFER — P1\'s question, as an executable case',
  // W80 — OR-R13, the run-time result check, in `test/driver/result-schema.test.ts`.
  'OR-R13 — what a nonconforming result reports, and what leaves it alone',
  'OR-R13 — REPORTED and never ROUTED: the same run, with the check and without it',
  'OR-R13 — SETTLEMENTS only: a person`s resolution is FD-R4`s, and the two do not overlap',
  'OR-R13 — the REACH: what a static check and a boundary cannot see (P21 prediction 3)',
  // W81 — what a settlement COSTS, as counts, in `test/driver/result-schema-cost.test.ts`. The
  // measurement itself is `examples/settlement-cost.ts` and is deliberately not a gate entry.
  'W81 — the SWITCH is the callback, counted: a consumer who supplies none pays for no check',
  'W81 — Q320: the always-on handle costs exactly one structuredClone per settled task',
  // W85 — what a region nested inside a `map` region CARRIES and how it ENDS, in
  // `test/driver/nested-regions.test.ts`. The retention half is two more cases inside
  // W53's suite, which that file's own `DECLARED_CASES` binds.
  'L2 — W85: the three branch-exit paths, under a region nested in a map',
  'L2 — W85: what a NESTED join carries — JP-R12 at two levels and at depth three',
  'L2 — W85: N = 0 inside a map, at the depths the lift made reachable',
  'L2 — W85: the at-most-once latch is per INSTANCE — Q95`s precondition one key deeper',
  'L2 — W85: ADR 0044 visibility across a region nested in a map',
  // and that file's OWN case-level membership, which this census structurally cannot
  // be: a census over SUITE names is satisfied by an empty suite, which is how eleven
  // of W85's thirteen cases were deletable at exit 0 (its adequacy reader, finding 3).
  'L2 — W85: every case this file declares actually RAN',
  // W88 — what a CHECKPOINT is (ADR 0064, `spec/run-state.md` section 8), in
  // `test/driver/checkpoint.test.ts` and `test/scheduler/checkpoint.test.ts`. Each file carries its
  // own `DECLARED_CASES`, because this census cannot see an emptied suite.
  'W88 — what a checkpoint IS: RN-R14 to RN-R18',
  'W88 — the checkpoint through the runtime: RunHandle.header and the position',
  // W89 — what RESUMING is (ADR 0065, `spec/run-state.md` section 9), in `test/driver/resume.test.ts`
  // and `test/scheduler/resume.test.ts`, each with its own `DECLARED_CASES` and counted below.
  'W89 — what RESUMING is: RN-R19 to RN-R24',
  'W89 — resuming through the runtime: runtime.resume, the positions, and run ids in use',
  // W92 — what a GATE is (ADR 0066, `spec/flow-definition.md` v0.23), in `test/definition/gate.test.ts`, with its
  // own `DECLARED_CASES` and counted below.
  'W92 — what a GATE is: FD-V39 to FD-V41, the default route, and the one interface',
  // W93 — what a gate DOES in a run (ADR 0067, `spec/run-state.md` v0.11's `RN-R26`), in `test/driver/gate.test.ts`
  // with its own `DECLARED_CASES`, and the runtime's road in `test/scheduler/runtime.test.ts`; both counted below.
  'W93 — what a GATE does in a run: the arm, the memory, the recorded decision, FD-R5, resume',
  'W93 — a consumer`s GATE types reach every driver the runtime starts or resumes, and a malformed one is refused where the runtime is built',
  'W99 — what a ROUTE guarantees: the type declares it, the library derives it from the key path',
  // W100 — what a KEY PATH must satisfy: the refusing half of ADR 0068, in `test/definition/wiring.test.ts`.
  'W100 — what a KEY PATH must satisfy: a path the producer FORBIDS is `no`, and what it says nothing about is a silence',
  // W101 — the SECOND OBSERVER of `AGENTS.md` section 20's authoring session, in
  // `test/definition/gate-session.test.ts`: its adequacy reader made all nine of that section's guards
  // TAUTOLOGIES at `check:docs` EXIT 0, so the session's claims are asserted here as well, from the
  // declarations `examples/getting-started/quota-registry.ts` holds and the snippet imports.
  'W101 — the authoring session`s own verdicts, from the declarations the session imports',
  // W133 — `RN-R6` v0.13's lifetime sentence (Q62) and Q63's message, both in `test/driver/driver.test.ts`.
  'RN-R6 v0.13 — regions[*].suspended is CURRENT, not cumulative',
  'OR-R6 and OR-R10 — stoppedBy and the reported failure name UncloneableResult exactly once',
];

suite('L1 — every suite this tree declares actually RAN', (test) => {
  test('the declared suite names are present, and no undeclared one appears', () => {
    const names = collected().map((s) => s.suite).sort();
    const declared = [...SUITES, ...LATE_SUITES].sort();
    const missing = declared.filter((n) => !names.includes(n));
    const extra = names.filter((n) => !declared.includes(n));
    equal(missing, [],
      'a declared suite did not run — its file was renamed out of the runner`s glob, or its ' +
      'module threw while loading. Q158: before this, that cost ZERO failures at exit 0',
    );
    equal(extra, [],
      'a suite ran that this census does not name. Add it here in the same commit — the ratchet ' +
      'is deliberate and is `S12`s: an equality catches a rename, a floor does not',
    );
    ok(names.length >= SUITES.length, 'and the census is not empty, which would make both sets vacuous');
    // **The line above is not a CONTROL and the line below is** — W85's adequacy
    // reader, finding 5, measured on this very clause. Re-source `declared` from
    // `names` and both differences are empty BY CONSTRUCTION, while `names.length >=
    // SUITES.length` reads a literal that is still non-empty and stays **exactly as
    // true as before**: the whole membership goes vacuous at exit 0. That is v0.21's
    // clause and v0.22's test of it — *name the tree on which the control fails and
    // its claim passes*, and for the `>=` there is none.
    //
    // A COUNT survives the re-source, because re-sourcing makes the two sides EQUAL
    // and the literal does not move: with `declared` re-sourced AND a suite file
    // deleted this fails at 1 where the two differences report 0.
    equal(names.length, SUITES.length + LATE_SUITES.length,
      'and the observed COUNT equals the declared one, compared as NUMBERS — which is what the ' +
      'two set differences above cannot do once either side is sourced from the other');
  });

  // **The CASES of W88's two suites, counted from OUTSIDE them** — W88's adequacy reader, F5: each
  // file's own `DECLARED_CASES` check is a case INSIDE the suite it guards, so one edit emptying the
  // suite takes the guard with it and `npm test` stays at exit 0 (W85's finding a second time). A
  // count here survives that edit. It is a count and not a membership, deliberately: the names are
  // each file's own, and a rename is what the in-file membership already catches.
  test('W88`s two suites still REGISTER the cases they declare — an emptied suite fails here', () => {
    const count = (name: string) => collected().filter((s) => s.suite === name).reduce((n, s) => n + s.cases.length, 0);
    equal(count('W88 — what a checkpoint IS: RN-R14 to RN-R18'), 13, 'test/driver/checkpoint.test.ts registers its thirteen cases');
    equal(count('W88 — the checkpoint through the runtime: RunHandle.header and the position'), 3, 'test/scheduler/checkpoint.test.ts registers its three');
  });

  // **W89's two suites, counted the same way and for the same reason** — an emptied suite takes its
  // own `DECLARED_CASES` check with it, and this count does not go with it.
  test('W89`s two suites still REGISTER the cases they declare — an emptied suite fails here', () => {
    const count = (name: string) => collected().filter((s) => s.suite === name).reduce((n, s) => n + s.cases.length, 0);
    equal(count('W89 — what RESUMING is: RN-R19 to RN-R24'), 20, 'test/driver/resume.test.ts registers its twenty cases (W151 added the tail-stop DEAF case)');
    equal(count('W89 — resuming through the runtime: runtime.resume, the positions, and run ids in use'), 7, 'test/scheduler/resume.test.ts registers its seven');
  });

  // **W92's suite, counted the same way and for the same reason.**
  test('W92`s suite still REGISTERS the cases it declares — an emptied suite fails here', () => {
    const count = (name: string) => collected().filter((s) => s.suite === name).reduce((n, s) => n + s.cases.length, 0);
    equal(count('W92 — what a GATE is: FD-V39 to FD-V41, the default route, and the one interface'), 17, 'test/definition/gate.test.ts registers its seventeen cases');
  });

  // **W99's suite, counted the same way** — five cases, and the count is what catches a suite emptied of
  // them while its NAME still registers (W85's finding: an empty suite is still a suite).
  test('W99`s suite still REGISTERS the six cases it declares — an emptied suite fails here', () => {
    const count = (name: string) => collected().filter((s) => s.suite === name).reduce((n, s) => n + s.cases.length, 0);
    equal(count('W99 — what a ROUTE guarantees: the type declares it, the library derives it from the key path'), 6,
      'test/definition/wiring.test.ts registers W99`s six cases');
  });
  // **W100's suite, counted the same way** — SEVEN cases: six as declared plus the one both readers bought
  // (a refusal survives every shape the consumer past the gate declares — the conformity reader's F2 and the
  // adequacy reader's F6, which is also where the code's verdict ORDER changed).
  test('W100`s suite still REGISTERS the seven cases it declares — an emptied suite fails here', () => {
    const count = (name: string) => collected().filter((s) => s.suite === name).reduce((n, s) => n + s.cases.length, 0);
    equal(count('W100 — what a KEY PATH must satisfy: a path the producer FORBIDS is `no`, and what it says nothing about is a silence'), 7,
      'test/definition/wiring.test.ts registers W100`s seven cases — six declared, one the readers added');
  });

  // **W101's suite, counted the same way** — SIX cases. It is the session's second observer, so an
  // emptied suite would leave the reference's nine guards bound by `X4`'s presence test alone.
  test('W101`s suite still REGISTERS the six cases it declares — an emptied suite fails here', () => {
    const count = (name: string) => collected().filter((s) => s.suite === name).reduce((n, s) => n + s.cases.length, 0);
    equal(count('W101 — the authoring session`s own verdicts, from the declarations the session imports'), 6,
      'test/definition/gate-session.test.ts registers W101`s six cases');
  });
  // **W108's two suites, counted the same way** — and this is the counter-measure W88 and W89 built
  // that W108 did not take: it added its rows to the census above and NOT a case count, so both of
  // its suites were emptiable for ZERO. Measured by its adequacy reader (4): replacing the body of
  // each with a single `ok(true)` left `npm test` at EXIT 0 with 0 FAIL lines and 1453 assertions
  // against 1477 — the whole 24-case delta gone in silence, because **a census over SUITE names is
  // satisfied by an empty suite**, which this file's own header says in those words.
  test('W108`s two suites still REGISTER the cases they declare — an emptied suite fails here', () => {
    const count = (name: string) => collected().filter((s) => s.suite === name).reduce((n, s) => n + s.cases.length, 0);
    equal(count('W108 — a predicate is DATA: FD-V42 to FD-V45, the subset, and the absent rule'), 20,
      'test/definition/predicate.test.ts registers W108`s grammar-and-evaluator cases');
    equal(count('W108 — a DECLARED predicate ROUTES, with no predicate registered at all'), 7,
      'test/driver/predicate.test.ts registers W108`s routing cases at ladder L2');
  });
  // **W109's suite, counted the same way — BOTH HALVES from the start.** W108 took the census row and
  // not the count, and its adequacy reader emptied both of its suites for ZERO; the obligation that
  // followed is this item's to discharge at its declaration rather than at its review.
  test('W109`s suite still REGISTERS the cases it declares — an emptied suite fails here', () => {
    const count = (name: string) => collected().filter((s) => s.suite === name).reduce((n, s) => n + s.cases.length, 0);
    equal(count('W109 — the BUILT-IN node type: nameable with no nodeTypes declared, and FD-V46 when it has nothing to do'), 9,
      'test/definition/node-type.test.ts registers W109`s nine grammar cases — four declared, five the readers bought');
    equal(count('W109 — a type that only TRANSFORMS: the transform IS the task, on a real pool and on the class'), 8,
      'test/scheduler/transform.test.ts registers W109`s eight real-pool cases — seven declared, plus the per-suite backend set');
    equal(count('W109 — sampledOutput: the shape a transform-only node emits, and the residue it reports beside it'), 8,
      'test/definition/assist.test.ts registers W109`s eight sampled-output cases — five declared, three the readers bought');
    equal(count('W109 — the pool config the library BUILDS for a transform-only type, and what the arm READS'), 5,
      'test/scheduler/bootstrap.test.ts registers W109`s five producing-side cases, which the adequacy reader`s F1 bought whole');
  });
  // **W110's suites, counted the same way — and the SECOND of the two is the conformity reader's 8.**
  // The maintainer's answer to this item's stop-and-ask (b) changed `src/definition/registry.ts` so a
  // named pool instance may name a BUILT-IN type, and that change costs **ZERO** at L6 (no artifact row
  // names such an instance) and **ZERO** at every other rung: its only observer is one case in
  // `test/definition/registry.test.ts`, whose suite had **no case count**, so deleting that case left
  // `npm test` green at 1512 and the fix unobserved at every rung. That is W108's own finding — *both of
  // this item's suites EMPTIABLE for zero, because the census is over suite NAMES and an empty suite is
  // still a suite* — and this item's own exceptions table named the remedy and did not take it.
  test('W110`s two suites still REGISTER the cases they declare — an emptied suite fails here', () => {
    const count = (name: string) => collected().filter((s) => s.suite === name).reduce((n, s) => n + s.cases.length, 0);
    equal(count('W110 — the UI-emitted documents validate with an EMPTY predicate registry: section 21`s first two guards, at L1'), 2,
      'test/definition/wiring.test.ts registers W110`s two L1 cases — the second observer of section 21`s first two guards');
    equal(count('every construction-time refusal, by name — a document that trips it and the sample that does not'), 15,
      'test/definition/registry.test.ts registers the refusal cases INCLUDING W110`s named-pool-instance one, which is the only ' +
      'observer of the `resolveRegistry` change the maintainer took and which cost 0 everywhere else');
  });
  // **W93's two suites, counted the same way and for the same reason** — a suite emptied of its cases is still a suite.
  test('W93`s two suites still REGISTER the cases they declare — an emptied suite fails here', () => {
    const count = (name: string) => collected().filter((s) => s.suite === name).reduce((n, s) => n + s.cases.length, 0);
    equal(count('W93 — what a GATE does in a run: the arm, the memory, the recorded decision, FD-R5, resume'), 20, 'test/driver/gate.test.ts registers its nineteen cases and W100`s one');
    equal(count('W93 — a consumer`s GATE types reach every driver the runtime starts or resumes, and a malformed one is refused where the runtime is built'), 4,
      'test/scheduler/runtime.test.ts registers W93`s four');
  });
});
