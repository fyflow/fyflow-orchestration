/**
 * Ladder L1 — **`definitionSchema()`: a flow definition's STATIC SHAPE as a JSON Schema draft 2020-12** —
 * `spec/flow-definition.md` v0.50 (section 1's *The definition's shape as a schema*),
 * [ADR 0132](../../doc/decisions/0132-a-definitions-shape-is-a-schema-built-from-the-validator.md),
 * [P43](../../doc/plans/p43-what-a-flow-and-a-run-say-as-data-rather-than-as-prose.md) (a1), (b1), decisions 1-4, facts 1-3;
 * [W210](../../doc/work-items/w210-the-static-shape-schema.md).
 *
 * **The ORACLE is the corpus and a real 2020-12 validator, never the key constants** (P43's brief sentence: *an oracle
 * reached through the package names which `src/` functions it shares with its subject*): `definitionSchema()` and
 * `validateDefinition` share the validator's exported key sets BY DESIGN, so a test comparing the schema to those sets
 * proves only that one function agrees with the constants the other reads. What holds the schema true is
 * `@cfworker/json-schema` (a TEST-ONLY devDependency, ADR 0132 rule 3) run over the hand-written corpus, with every
 * expected verdict written below from `spec/flow-definition.md` section 5's rule table (P43 decision 4) — the
 * classification is P43 fact 2's, re-taken file by file at W210's declaration. **Every refusal sits beside a CONTROL**:
 * the refused document repaired in its one clause, ACCEPTED — so a schema refusing for a reason other than the rule's
 * is seen — and the repair is read by `validateDefinition` too, which no longer reports that rule. Where this suite does
 * read the validator (`referenceTarget`, `validateDefinition`), it is as the SECOND observer of a claim whose first is
 * the schema run through cfworker, and it says so.
 *
 * **And the REGISTRY form, `definitionSchema(registry)`** — [W211](../../doc/work-items/w211-the-registry-specialised-schema.md),
 * `spec/flow-definition.md` v0.51, P43 fact 2's registry-specialisable row — held the same way against
 * `spec/examples/registry.json`: every valid flow accepted, every registry-specialisable invalid file refused beside its
 * repair and NOT refused by the static form, each of fact 2's not-cleanly rows pinned NOT refused beside the validator's
 * refusal of the same document, and a sweep in which no refusal of the registry form is an acceptance of
 * `validateDefinition` against the same registry. The registry-derived names every expected value below uses are
 * written from `registry.json` by hand, never read from the module's own functions. The suite keeps W210's name, so its
 * census line (`test/definition/l4-corpus.test.ts`) does not move.
 */
import { Validator } from '@cfworker/json-schema';
import { collected, deepEqual, equal, listDir, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { checkRegistry } from '../../src/definition/registry.ts';
import type { GateType, Registry } from '../../src/definition/types.ts';
import { definitionSchema, type DefinitionSchema } from '../../src/definition/definition-schema.ts';
import {
  DOC_KEYS_DECLARED, EDGE_KEYS_DECLARED, NODE_KEYS_DECLARED, NODE_KEYS_REQUIRED, PREDICATE_GROUP_KEYS, PREDICATE_LEAF_KEYS,
  PREDICATE_NAME_KEYS, RETRY_POLICY_KEYS, TRANSFORM_KEYS, KINDS, BUILT_IN_GATE_TYPES, referenceTarget, validateDefinition,
} from '../../src/definition/validate.ts';
import { SCHEMA_KEYWORDS, SCHEMA_TYPES } from '../../src/definition/schema.ts';
import { PREDICATE_OPS } from '../../src/definition/types.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { corpusRegistry, type CorpusRegistryDocument } from './corpus-types.ts';

const SUITE = 'L1 — W210, ADR 0132: definitionSchema() — a valid 2020-12 document, the corpus accepted, every shape-only refusal beside its repair, never refusing what validateDefinition accepts';

const EX = `${ROOT}spec/examples`;
const registryDoc = JSON.parse(await readText(`${EX}/registry.json`)) as CorpusRegistryDocument;
const registry = corpusRegistry(registryDoc);
const schema = definitionSchema();
// SHORT-CIRCUITING: a verdict is all a case reads, and collecting every error of every refused document cost the chromium
// lane seconds in GC (W210's declaration step, re-take 7). The full errors are read only to word a failure, by `explain`.
const validator = new Validator(schema as never, '2020-12', true);
const accepts = (d: unknown): boolean => validator.validate(d).valid;
const explain = (d: unknown): string => new Validator(schema as never, '2020-12', false).validate(d).errors.slice(-2).map((e) => `${e.instanceLocation} ${e.error}`).join(' | ');
const rulesOf = (d: unknown): string[] => [...new Set(validateDefinition(d as FlowDefinition, registry).map((f) => f.rule))].sort();
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
type Doc = { flowId: string; version: number; entry: string; nodes: Record<string, unknown>[] } & Record<string, unknown>;
const nodeOf = (d: Doc, id: string): Record<string, unknown> => {
  const n = d.nodes.find((x) => x.id === id);
  if (n === undefined) throw new Error(`no node "${id}" in ${d.flowId}`);
  return n;
};
const edgesOf = (d: Doc, id: string) => nodeOf(d, id).edges as Record<string, unknown>[];

const validNames = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json'));
const exampleNames = (await listDir(`${ROOT}examples/flows`)).filter((n) => n.endsWith('.flow.json'));
const invalidNames = (await listDir(`${EX}/invalid`)).filter((n) => n.endsWith('.flow.json'));
const load = async (path: string): Promise<Doc> => JSON.parse(await readText(path)) as Doc;
const ruleOfFile = (name: string): string => name.split('--')[0]!;

/**
 * **The rules whose every clause is a node's, an edge's or a value's own shape** — P43 fact 2's *shape-only* row, read
 * against section 5's table: `FD-V16` (the id charset), `FD-V17` (an undeclared key), `FD-V18` (`on`'s values),
 * `FD-V21` (a declared key's type), `FD-V23` (a required key), `FD-V24` (the kind), `FD-V26` (`needs`' grammar),
 * `FD-V30` (retryPolicy), `FD-V37` (transform), `FD-V42`-`FD-V45` (a `when`'s shapes, path, operator and group),
 * `FD-V47` (a task's keys on an ask) and `FD-V48` (an answerSchema in the subset — but for ADR 0056's `examples` check,
 * which no file here exercises). **Every invalid file of these rules is REFUSED.**
 */
const SHAPE_ONLY = ['FD-V16', 'FD-V17', 'FD-V18', 'FD-V21', 'FD-V23', 'FD-V24', 'FD-V26', 'FD-V30', 'FD-V37', 'FD-V42', 'FD-V43', 'FD-V44', 'FD-V45', 'FD-V47', 'FD-V48'];
/**
 * **Three files of OTHER rules, refused because the clause each exercises is a shape clause** — written from the files'
 * names and the rules' rows, before any run: `FD-V8`'s *an `end` node has `edges`* (an `end` declares no `edges`, so its
 * key set refuses it), `FD-V9`'s *fewer than two `branches`* (a `minItems`) — both *partly shape* in fact 2, whose shape
 * clause their corpus file happens to be — and `FD-V40`'s *`key` is not a KEY PATH*, which fact 2 left unclassified and
 * which W210's re-take moves to shape: the library resolves `key` on EVERY gate, whatever its type (`FD-V40`, P24 (d)),
 * so it needs no registry. **Every other invalid file is ACCEPTED** — its rule needs another node or the registry.
 */
const SHAPE_FILES_OF_OTHER_RULES = [
  'FD-V8--end-node-with-edges.flow.json',
  'FD-V9--fanout-with-one-branch.flow.json',
  'FD-V40--gate-key-path-with-a-wildcard.flow.json',
];
/**
 * **One file of a SHAPE-ONLY rule that the schema does NOT refuse, because its clause is not a shape** — W221, P45 (g1),
 * `spec/flow-definition.md` v0.55: `FD-V43` refuses a `needs` path whose first key THIS EDGE's `needs` does not declare,
 * which reads a SIBLING key of the comparison's edge — a relation between two keys' VALUES that a `pattern` cannot state.
 * Section 1's *does not carry* row names it. Accepted by the schema, refused by the validator: the partition reads it so.
 */
const CROSS_KEY_FILES_OF_SHAPE_RULES = ['FD-V43--a-needs-key-the-edge-does-not-declare.flow.json'];
/** Which invalid files the STATIC form refuses — ONE predicate, read by the static partition, its repairs and W211's registry partition. */
const staticRefuses = (n: string): boolean =>
  (SHAPE_ONLY.includes(ruleOfFile(n)) && !CROSS_KEY_FILES_OF_SHAPE_RULES.includes(n)) || SHAPE_FILES_OF_OTHER_RULES.includes(n);

/** Each refused file repaired in its ONE clause — hand-written from the file and the rule, never from a verdict. */
const REPAIRS: Record<string, (d: Doc) => void> = {
  'FD-V16--node-id-with-a-colon.flow.json': (d) => { nodeOf(d, 'score:v2').id = 'score-v2'; d.entry = 'score-v2'; },
  'FD-V17--unknown-key-on-an-edge.flow.json': (d) => { const e = edgesOf(d, 'score')[0]!; e.when = { predicate: e.whn }; delete e.whn; },
  'FD-V18--on-names-user-action.flow.json': (d) => { edgesOf(d, 'review')[0]!.on = ['failed']; nodeOf(d, 'review').optional = true; },
  'FD-V21--optional-is-not-a-boolean.flow.json': (d) => { nodeOf(d, 'extract').optional = true; },
  'FD-V21--join-of-is-not-a-string.flow.json': (d) => { nodeOf(d, 'collect').of = 'split'; },
  'FD-V21--fanout-branch-entry-is-not-a-string.flow.json': (d) => { nodeOf(d, 'split').branches = ['scoreA', 'scoreB']; },
  'FD-V23--node-without-a-kind.flow.json': (d) => { nodeOf(d, 'score').kind = 'task'; },
  'FD-V24--unknown-node-kind.flow.json': (d) => { nodeOf(d, 'pick').kind = 'ask'; },
  'FD-V26--an-unreserved-dollar-token.flow.json': (d) => { nodeOf(d, 'publish').needs = { run: '$payload' }; },
  'FD-V26--edge-needs-uses-the-self-token.flow.json': (d) => { edgesOf(d, 'score')[0]!.needs = { self: 'ingest' }; },
  'FD-V26--error-part-misspelled.flow.json': (d) => { nodeOf(d, 'publish').needs = { why: 'lookup!error' }; },
  'FD-V26--error-part-with-no-node.flow.json': (d) => { edgesOf(d, 'publish')[0]!.needs = { why: 'lookup!error' }; },
  'FD-V26--needs-value-is-not-a-reference.flow.json': (d) => { nodeOf(d, 'publish').needs = { run: 'ingest' }; },
  'FD-V26--payload-as-an-array.flow.json': (d) => { (nodeOf(d, 'publish').needs as Record<string, unknown>).run = '$payload'; },
  'FD-V26--payload-with-a-suffix.flow.json': (d) => { edgesOf(d, 'score')[0]!.needs = { run: '$payload' }; },
  'FD-V26--suffix-before-the-error-part.flow.json': (d) => { nodeOf(d, 'publish').needs = { why: 'lookup!error?' }; },
  'FD-V30--retry-policy-max-retries-is-a-string.flow.json': (d) => { (nodeOf(d, 'score').retryPolicy as Record<string, unknown>).maxRetries = 1; },
  'FD-V37--transform-not-lang-and-expr.flow.json': (d) => { (nodeOf(d, 'score').transform as Record<string, unknown>).expr = 'confidence'; },
  'FD-V42--when-is-a-bare-string.flow.json': (d) => { const e = edgesOf(d, 'score')[0]!; e.when = { predicate: e.when }; },
  'FD-V42--a-comparison-with-value-and-value-from.flow.json': (d) => { delete (edgesOf(d, 'score')[0]!.when as Record<string, unknown>).value; },
  'FD-V43--value-from-outside-the-roots.flow.json': (d) => { (edgesOf(d, 'score')[0]!.when as Record<string, unknown>).valueFrom = 'outcome.result.threshold'; },
  'FD-V43--predicate-path-has-no-root.flow.json': (d) => { (edgesOf(d, 'score')[0]!.when as Record<string, unknown>).path = 'outcome.result.confidence'; },
  'FD-V44--predicate-op-outside-the-subset.flow.json': (d) => { (edgesOf(d, 'score')[0]!.when as Record<string, unknown>).op = 'startsWith'; },
  'FD-V45--a-group-inside-a-group.flow.json': (d) => {
    const all = (edgesOf(d, 'score')[0]!.when as { all: Record<string, unknown>[] }).all;
    all[1] = (all[1]!.any as Record<string, unknown>[])[0]!;
  },
  'FD-V47--an-ask-with-a-type-and-a-transform.flow.json': (d) => { const n = nodeOf(d, 'approve'); delete n.type; delete n.transform; },
  'FD-V48--an-answer-schema-with-a-pattern.flow.json': (d) => {
    delete ((nodeOf(d, 'approve').answerSchema as { properties: { code: Record<string, unknown> } }).properties.code.pattern);
  },
  'FD-V8--end-node-with-edges.flow.json': (d) => { delete nodeOf(d, 'done').edges; },
  'FD-V9--fanout-with-one-branch.flow.json': (d) => {
    nodeOf(d, 'split').branches = ['scoreA', 'scoreB'];
    d.nodes.push({ id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] });
  },
  'FD-V40--gate-key-path-with-a-wildcard.flow.json': (d) => { (nodeOf(d, 'dedupe').settings as Record<string, unknown>).key = 'files[0].series'; },
};

/** A hand-built base flow with every structural kind — the control for the constructed clauses below. */
const base = (): Doc => clone({
  flowId: 'shape', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['b', 'c'] },
    { id: 'b', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'join' }] },
    { id: 'c', kind: 'ask', edges: [{ to: 'join' }] },
    { id: 'join', kind: 'join', of: 'split', edges: [{ to: 'm' }] },
    { id: 'm', kind: 'map', over: 'items', branch: 'per' },
    { id: 'per', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'mjoin' }] },
    { id: 'mjoin', kind: 'join', of: 'm', edges: [{ to: 'g' }] },
    { id: 'g', kind: 'gate', type: 'distinct', settings: { key: 'series' }, edges: [{ to: 'done' }, { route: 'duplicate', to: 'done' }, { route: 'nokey', to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
});

/** A new edge from `a`, ahead of its default, carrying a `when` — where a comparison or a group is put. */
const when = (w: unknown) => (d: Doc) => { edgesOf(d, 'a').unshift({ when: w, to: 'split' }); };
const leaf = (extra: Record<string, unknown>) => ({ path: 'outcome.result', op: 'eq', value: 1, ...extra });
/** The ask `c`'s `answerSchema`. */
const answer = (s: unknown) => (d: Doc) => { nodeOf(d, 'c').answerSchema = s; };

/**
 * **Every clause the schema CARRIES, one edit each on the base above, beside the rule `validateDefinition` reports for
 * it** — spec section 1's *carries* row, clause by clause: the partly-shape rules' shape clauses (P43 fact 2: `FD-V7`,
 * `FD-V8`, `FD-V9`, `FD-V25`), `FD-V41`'s per-edge half, and — W210's adequacy reader, SHOULD 2 — every shape-only rule's
 * clauses the corpus has no file for: the document's keys, `needs`, a comparison's path, value, default and length, every
 * ordering operator, the name and group shapes, each node key's type, each edge key, every `retryPolicy`, `transform`
 * and `answerSchema` (subset) clause. Each row is a refusal claim; the base, accepted by both, is the control.
 */
const CLAUSES: [string, string, (d: Doc) => void][] = [
  ['FD-V17', 'an undeclared document key', (d) => { d.zz = 1; }],
  ['FD-V21', 'version 0', (d) => { d.version = 0; }],
  ['FD-V21', 'version 1.5', (d) => { d.version = 1.5; }],
  ['FD-V16', 'a flowId outside the charset', (d) => { d.flowId = 'a:b'; }],
  ['FD-V23', 'a document without nodes', (d) => { delete (d as Record<string, unknown>).nodes; }],
  ['FD-V26', 'an empty needs', (d) => { nodeOf(d, 'b').needs = {}; }],
  ['FD-V26', 'a needs key outside the charset', (d) => { nodeOf(d, 'b').needs = { 'a b': 'a' }; }],
  ['FD-V26', 'a needs that is not an object', (d) => { nodeOf(d, 'b').needs = 'a'; }],
  ['FD-V26', 'an empty edge needs', (d) => { edgesOf(d, 'a').unshift({ when: { predicate: 'isLowConfidence' }, needs: {}, to: 'split' }); }],
  ['FD-V43', 'a path that is a root alone', when(leaf({ path: 'outcome' }))],
  ['FD-V43', 'a path before its root', when(leaf({ path: 'xoutcome.result' }))],
  ['FD-V43', 'a path with a trailing dot', when(leaf({ path: 'outcome.result.' }))],
  ['FD-V43', 'a path at a foreign root', when(leaf({ path: 'input.result' }))],
  ['FD-V44', 'a value that is an object', when(leaf({ value: {} }))],
  ['FD-V44', 'a value that is an array', when(leaf({ value: [1] }))],
  ['FD-V44', 'a default holding an object', when(leaf({ op: 'gt', length: true, default: [{}] }))],
  ['FD-V44', 'length false', when(leaf({ length: false }))],
  ['FD-V42', 'a comparison without its value', when({ path: 'outcome.result', op: 'eq' })],
  // W221, v0.55: `valueFrom` — exactly one of the two right sides (FD-V42), and `path`'s own pattern (FD-V43).
  ['FD-V42', 'a comparison with both value and valueFrom', when(leaf({ valueFrom: 'outcome.result.b' }))],
  ['FD-V43', 'a valueFrom at a foreign root', when({ path: 'outcome.result', op: 'eq', valueFrom: 'input.b' })],
  ['FD-V43', 'a valueFrom that is a root alone', when({ path: 'outcome.result', op: 'eq', valueFrom: 'needs' })],
  ['FD-V43', 'a valueFrom indexing its root', when({ path: 'outcome.result', op: 'eq', valueFrom: 'outcome[0].x' })],
  ['FD-V43', 'a valueFrom that is not a string', when({ path: 'outcome.result', op: 'eq', valueFrom: 5 })],
  ['FD-V42', 'a comparison with an undeclared key', when(leaf({ zz: 1 }))],
  ['FD-V44', 'an op outside the enumeration', when(leaf({ op: 'matches' }))],
  ...['lt', 'lte', 'gt', 'gte'].map((op): [string, string, (d: Doc) => void] => ['FD-V44', `${op} against a string`, when(leaf({ op, value: 'x' }))]),
  ['FD-V44', 'startsWith against a number', when(leaf({ op: 'startsWith', value: 1 }))],
  ['FD-V44', 'a length compared against a string', when(leaf({ op: 'gt', value: 'x', length: true }))],
  ['FD-V44', 'an array default with no length', when(leaf({ default: [1] }))],
  ['FD-V44', 'a length whose default has none', when(leaf({ op: 'gt', length: true, default: 3 }))],
  ['FD-V44', 'a length with startsWith', when(leaf({ op: 'startsWith', value: 1, length: true }))],
  ['FD-V42', 'a name with an undeclared key', when({ predicate: 'isLowConfidence', zz: 1 })],
  ['FD-V42', 'a name that is not a string', when({ predicate: 5 })],
  ['FD-V42', 'a name and a comparison in one object', when({ predicate: 'isLowConfidence', ...leaf({}) })],
  ['FD-V42', 'an object marking no shape', when({ zz: 1 })],
  ['FD-V42', 'an empty object', when({})],
  ['FD-V45', 'an empty group', when({ all: [] })],
  ['FD-V45', 'a group that is not an array', when({ any: leaf({}) })],
  ['FD-V45', 'a group with both all and any', when({ all: [leaf({})], any: [leaf({})] })],
  ['FD-V45', 'a group holding a name', when({ all: [{ predicate: 'isLowConfidence' }] })],
  ['FD-V42', 'a group with an undeclared key', when({ all: [leaf({})], zz: 1 })],
  ['FD-V21', 'a task type that is not a string', (d) => { nodeOf(d, 'a').type = 5; }],
  ['FD-V21', 'a pool that is not a string', (d) => { nodeOf(d, 'a').pool = 5; }],
  ['FD-V21', 'optional that is not a boolean', (d) => { nodeOf(d, 'a').optional = 'yes'; }],
  ['FD-V23', 'a task without its type', (d) => { delete nodeOf(d, 'a').type; }],
  ['FD-V23', 'a map without over', (d) => { delete nodeOf(d, 'm').over; }],
  ['FD-V33', 'task settings that are not an object', (d) => { nodeOf(d, 'a').settings = []; }],
  ['FD-V40', 'gate settings that are not an object', (d) => { nodeOf(d, 'g').settings = 'x'; }],
  ['FD-V40', 'a gate key that is not a string', (d) => { nodeOf(d, 'g').settings = { key: 5 }; }],
  ['FD-V21', 'ask settings that are not an object', (d) => { nodeOf(d, 'c').settings = 'x'; }],
  ['FD-V21', 'an outcome that is not a string', (d) => { nodeOf(d, 'done').outcome = 5; }],
  ['FD-V31', 'an empty workerGroups', (d) => { nodeOf(d, 'a').workerGroups = []; }],
  ['FD-V31', 'a workerGroups entry that is not a string', (d) => { nodeOf(d, 'a').workerGroups = [5]; }],
  ['FD-V31', 'a workerGroups entry repeated', (d) => { nodeOf(d, 'a').workerGroups = ['gpu', 'gpu']; }],
  ['FD-V7', 'a task with an empty edge list', (d) => { nodeOf(d, 'a').edges = []; }],
  ['FD-V7', 'an ask with an empty edge list', (d) => { nodeOf(d, 'c').edges = []; }],
  ['FD-V7', 'a join with no edge', (d) => { nodeOf(d, 'join').edges = []; }],
  ['FD-V7', 'a join with two edges', (d) => { edgesOf(d, 'join').push({ to: 'm' }); }],
  ['FD-V7', 'a join edge carrying on', (d) => { edgesOf(d, 'join')[0]!.on = ['done']; }],
  ['FD-V7', 'a join edge carrying when', (d) => { edgesOf(d, 'join')[0]!.when = { predicate: 'isLowConfidence' }; }],
  ['FD-V41', 'a gate with no edge', (d) => { nodeOf(d, 'g').edges = []; }],
  ['FD-V8', 'an end with an empty outcome', (d) => { nodeOf(d, 'done').outcome = ''; }],
  ['FD-V9', 'a fanout repeating a branch', (d) => { nodeOf(d, 'split').branches = ['b', 'b']; }],
  ['FD-V9', 'a fanout with edges', (d) => { nodeOf(d, 'split').edges = [{ to: 'b' }]; }],
  ['FD-V25', 'a map with edges', (d) => { nodeOf(d, 'm').edges = [{ to: 'per' }]; }],
  ['FD-V25', 'a map over a dotted key', (d) => { nodeOf(d, 'm').over = 'items.list'; }],
  ['FD-V18', 'an empty on', (d) => { edgesOf(d, 'a')[0]!.on = []; }],
  ['FD-V18', 'an on repeating a state', (d) => { edgesOf(d, 'a')[0]!.on = ['done', 'done']; }],
  ['FD-V23', 'an edge without to', (d) => { delete edgesOf(d, 'a')[0]!.to; }],
  ['FD-V21', 'an edge to that is not a string', (d) => { edgesOf(d, 'a')[0]!.to = 5; }],
  // W215, Q774 resolved (v0.52): W210's two ACCEPTS pins, flipped — a branch entry and a join's `of` that are not strings.
  ['FD-V21', 'a branch entry that is not a string', (d) => { nodeOf(d, 'split').branches = ['b', 'c', 5]; }],
  ...([null, 5, [], {}, true] as unknown[]).map((v): [string, string, (d: Doc) => void] => ['FD-V21', `a join of ${JSON.stringify(v)}`, (d) => { nodeOf(d, 'join').of = v; }]),
  ['FD-V17', 'an undeclared edge key', (d) => { edgesOf(d, 'a')[0]!.zz = 1; }],
  ['FD-V41', 'a route on a task edge', (d) => { edgesOf(d, 'a')[0]!.route = 'x'; }],
  ['FD-V41', 'a route on a join edge', (d) => { edgesOf(d, 'join')[0]!.route = 'x'; }],
  ['FD-V41', 'a gate route that is not a string', (d) => { edgesOf(d, 'g')[1]!.route = 5; }],
  ['FD-V41', 'a gate edge carrying on', (d) => { edgesOf(d, 'g')[0]!.on = ['done']; }],
  ['FD-V41', 'a gate edge carrying when', (d) => { edgesOf(d, 'g')[0]!.when = { predicate: 'isLowConfidence' }; }],
  ['FD-V41', 'a gate edge carrying needs', (d) => { edgesOf(d, 'g')[0]!.needs = { x: 'a' }; }],
  ['FD-V30', 'a retryPolicy that is not an object', (d) => { nodeOf(d, 'a').retryPolicy = 'x'; }],
  ['FD-V30', 'a retryPolicy missing backoffMs', (d) => { nodeOf(d, 'a').retryPolicy = { maxRetries: 1 }; }],
  ['FD-V30', 'a retryPolicy with an undeclared key', (d) => { nodeOf(d, 'a').retryPolicy = { maxRetries: 1, backoffMs: 0, zz: 1 }; }],
  ['FD-V30', 'a fractional maxRetries', (d) => { nodeOf(d, 'a').retryPolicy = { maxRetries: 1.5, backoffMs: 0 }; }],
  ['FD-V30', 'a negative maxRetries', (d) => { nodeOf(d, 'a').retryPolicy = { maxRetries: -1, backoffMs: 0 }; }],
  ['FD-V30', 'a negative backoffMs', (d) => { nodeOf(d, 'a').retryPolicy = { maxRetries: 1, backoffMs: -1 }; }],
  ['FD-V30', 'a backoffMs that is not a number', (d) => { nodeOf(d, 'a').retryPolicy = { maxRetries: 1, backoffMs: '0' }; }],
  ['FD-V37', 'a transform that is not an object', (d) => { nodeOf(d, 'a').transform = 'x'; }],
  ['FD-V37', 'a transform with an undeclared key', (d) => { nodeOf(d, 'a').transform = { lang: 'path', expr: 'x', zz: 1 }; }],
  ['FD-V37', 'a transform lang that is not a string', (d) => { nodeOf(d, 'a').transform = { lang: 5, expr: 'x' }; }],
  ['FD-V37', 'a transform expr that is not a string', (d) => { nodeOf(d, 'a').transform = { lang: 'path', expr: 5 }; }],
  ['FD-V48', 'an answerSchema that is not an object', answer('x')],
  ['FD-V48', 'a type outside the seven', answer({ type: 'strin' })],
  ['FD-V48', 'an empty type list', answer({ type: [] })],
  ['FD-V48', 'a type list repeating a type', answer({ type: ['string', 'string'] })],
  ['FD-V48', 'required that is not a list', answer({ required: 'a' })],
  ['FD-V48', 'required repeating a name', answer({ required: ['a', 'a'] })],
  ['FD-V48', 'properties that is not an object', answer({ properties: [] })],
  ['FD-V48', 'a nested property outside the subset', answer({ properties: { a: { type: 'strin' } } })],
  ['FD-V48', 'additionalProperties as a schema', answer({ additionalProperties: {} })],
  ['FD-V48', 'an empty enum', answer({ enum: [] })],
  ['FD-V48', 'a minimum that is not a number', answer({ minimum: 'x' })],
  ['FD-V48', 'a negative minLength', answer({ minLength: -1 })],
  ['FD-V48', 'a fractional minItems', answer({ minItems: 1.5 })],
  ['FD-V48', 'items as a tuple', answer({ items: [{}] })],
  ['FD-V48', 'items outside the subset', answer({ items: { type: 'strin' } })],
  ['FD-V48', 'an empty examples', answer({ examples: [] })],
  ['FD-V48', 'a title that is not a string', answer({ title: 5 })],
  ['FD-V48', 'readOnly that is not a boolean', answer({ readOnly: 'x' })],
  ['FD-V48', 'a keyword outside the subset', answer({ pattern: 'x' })],

];
/** The rules CLAUSES covers — compared as a SET, so a row family emptied fails (W210's adequacy reader, T5). */
const CLAUSE_RULES = ['FD-V7', 'FD-V8', 'FD-V9', 'FD-V16', 'FD-V17', 'FD-V18', 'FD-V21', 'FD-V23', 'FD-V25', 'FD-V26', 'FD-V30', 'FD-V31', 'FD-V33', 'FD-V37', 'FD-V40', 'FD-V41', 'FD-V42', 'FD-V43', 'FD-V44', 'FD-V45', 'FD-V48'];

/**
 * **Values validateDefinition ACCEPTS that sit INSIDE a node — each must be accepted by the schema too** — ADR 0132 rule
 * 2, where the sweep below cannot reach (it writes only whole keys): W210's adequacy reader, BLOCKER 1, and its
 * conformity reader's B1 (`of` and a branch entry that are not strings, which the validator holds only through the
 * graph). Every one of the seven JSON types alone and as a list, each subset keyword's legal values, a fractional
 * `backoffMs`, a `version` above 1, both `on` states in either order, a `length` with a string or array default, every
 * operator against the value it compares.
 */
const ACCEPTS: [string, (d: Doc) => void][] = [
  ...SCHEMA_TYPES.map((t): [string, (d: Doc) => void] => [`answerSchema type ${t}`, answer({ type: t })]),
  ['answerSchema a type list', answer({ type: ['string', 'null'] })],
  ['answerSchema const an object', answer({ const: {} })],
  ['answerSchema a fractional minimum and maximum', answer({ minimum: 1.5, maximum: 2.5 })],
  ['answerSchema a one-value enum', answer({ enum: [1] })],
  ['answerSchema an empty required', answer({ required: [] })],
  ['answerSchema properties and additionalProperties true', answer({ properties: { a: {} }, additionalProperties: true })],
  ['answerSchema lengths and items', answer({ minLength: 0, maxLength: 3, minItems: 0, items: { type: 'string' } })],
  ['answerSchema the four annotations', answer({ title: 't', description: 'd', readOnly: true, writeOnly: false })],
  ['answerSchema examples', answer({ type: 'object', examples: [{}] })],
  ['answerSchema empty', answer({})],
  ['a fractional backoffMs and zero retries', (d) => { nodeOf(d, 'a').retryPolicy = { maxRetries: 0, backoffMs: 0.5 }; }],
  ['version 2', (d) => { d.version = 2; }],
  ['on in either order', (d) => { nodeOf(d, 'b').optional = true; edgesOf(d, 'b')[0]!.on = ['failed', 'done']; }],
  ['a length with a string default', when(leaf({ op: 'gt', length: true, default: 'abc' }))],
  ['a length with an array default', when(leaf({ op: 'gt', length: true, default: [] }))],
  ['eq null', when(leaf({ value: null }))],
  ...PREDICATE_OPS.map((op): [string, (d: Doc) => void] => [`${op} against what it compares`, when(leaf({ op, value: op === 'startsWith' ? 'x' : 1 }))]),
  ['a group of two comparisons', when({ any: [leaf({}), leaf({ op: 'ne', value: 'x' })] })],
  ['empty settings on a task, an ask and a gate key path', (d) => { nodeOf(d, 'a').settings = {}; nodeOf(d, 'c').settings = {}; nodeOf(d, 'g').settings = { key: 'a.b' }; }],
  ['workerGroups the registry declares', (d) => { nodeOf(d, 'a').workerGroups = ['gpu', 'api']; }],
  ['a transform', (d) => { nodeOf(d, 'a').type = 'Scorer'; nodeOf(d, 'a').transform = { lang: 'path', expr: 'confidence' }; }],
  ['a join edge with needs', (d) => { edgesOf(d, 'join')[0]!.needs = { x: 'a' }; }],
  // W210's two Q774 rows — a branch entry and a region-less join's `of` that are not strings — LEFT this table at W215:
  // `FD-V21` refuses both since v0.52, so they are CLAUSES rows and the W215 case below.
];

/**
 * **The error reference's spellings (W209, v0.49) and their neighbours** — each checked at a node's `needs` and at an
 * edge's, the schema's verdict compared with `referenceTarget`'s parse (the SECOND observer: the validator's one
 * parser) and with a verdict written here by hand from section 3's table.
 */
const SPELLINGS: [unknown, boolean][] = [
  ['lookup', true], ['lookup?', true], ['lookup!error', true], ['lookup!error?', true],
  [['lookup'], true], [['lookup?'], true], [['lookup!error'], true], [['lookup!error?'], true],
  ['.', true], ['$payload', true], ['$item', true],
  ['lookup?!error', false], ['!error', false], ['lookup!err', false], ['lookup!', false], ['lookup!result', false],
  ['lookup!error!error', false], ['lookup!error??', false], ['lookup??', false], ['?', false], ['', false], ['.?', false],
  [['!error'], false], [['lookup?!error'], false], [['$payload'], false], [['$item'], false], [['.'], false],
  ['$payload?', false], ['$other', false], ['look:up', false], ['a'.repeat(64), true], ['a'.repeat(65), false],
  [['lookup', 'other'], false], [[], false], [5, false], [null, false], [{ node: 'lookup' }, false],
];

/**
 * **The sweep** — every node key of each named valid flow DELETED, set to null, a string or an array, an undeclared key
 * ADDED, and every edge key set the same way; the schema `s` asked of the mutated NODE alone (`$defs/node` — the rest of
 * the document is the accepted flow, unchanged), and of the whole document on every tenth, to hold that equivalence; the
 * validator asked wherever the schema refused. *(Six values, the whole document and the validator on every mutation
 * cost the chromium lane ~2.8 s, and its later suites ~5 s more — W210's re-take 8.)*
 */
async function sweep(names: string[], s: DefinitionSchema) {
  const nodeValidator = new Validator({ $schema: s.$schema, $ref: '#/$defs/node', $defs: s.$defs } as never, '2020-12', true);
  const docValidator = new Validator(s as never, '2020-12', true);
  const values: unknown[] = [null, 'x', []];
  const r = { refused: 0, accepted: 0, whole: 0, unsound: [] as string[], disagree: [] as string[] };
  const check = (d: Doc, i: number, what: string) => {
    const verdict = nodeValidator.validate(d.nodes[i]).valid;
    if ((r.refused + r.accepted) % 10 === 0) { r.whole++; if (docValidator.validate(d).valid !== verdict) r.disagree.push(what); }
    if (verdict) { r.accepted++; return; }
    r.refused++;
    if (rulesOf(d).length === 0) r.unsound.push(what);
  };
  for (const n of names) {
    const d0 = await load(`${EX}/valid/${n}`);
    d0.nodes.forEach((node, i) => {
      for (const k of [...Object.keys(node), 'zz']) {
        const del = clone(d0); delete del.nodes[i]![k]; check(del, i, `${n} nodes[${i}] without ${k}`);
        for (const v of values) { const d = clone(d0); d.nodes[i]![k] = v; check(d, i, `${n} nodes[${i}].${k} = ${JSON.stringify(v)}`); }
      }
      ((node.edges as Record<string, unknown>[] | undefined) ?? []).forEach((e, j) => {
        for (const k of [...Object.keys(e), 'zz']) {
          for (const v of values) {
            const d = clone(d0); (d.nodes[i]!.edges as Record<string, unknown>[])[j]![k] = v; check(d, i, `${n} nodes[${i}].edges[${j}].${k} = ${JSON.stringify(v)}`);
          }
        }
      });
    });
  }
  return r;
}

// ---- the REGISTRY form — W211 ----

/** A variant of the corpus registry: `registry.json` copied, `edit` applied to the copy, read as the corpus reads it. */
const variant = (edit: (doc: CorpusRegistryDocument) => void): Registry => {
  const doc = clone(registryDoc);
  edit(doc);
  return corpusRegistry(doc);
};
const regSchema = definitionSchema(registry);
const regValidator = new Validator(regSchema as never, '2020-12', true);
const regAccepts = (d: unknown, v: Validator = regValidator): boolean => v.validate(d).valid;
const regExplain = (d: unknown, s: DefinitionSchema = regSchema): string => new Validator(s as never, '2020-12', false).validate(d).errors.slice(-2).map((e) => `${e.instanceLocation} ${e.error}`).join(' | ');
const rulesAgainst = (d: unknown, reg: Registry): string[] => [...new Set(validateDefinition(d as FlowDefinition, reg).map((f) => f.rule))].sort();

/**
 * **The invalid files whose rule the REGISTRY decides of a node by itself** — P43 fact 2's registry-specialisable row,
 * written from section 5's rule table and the files' names before any run: `FD-V4` (a predicate name), `FD-V31` (a
 * group), `FD-V32` (a node type), `FD-V33` (`factor: "ten"` against `scorer`'s settingsSchema, which says a number —
 * fact 2's row names a type's `settings` schema; only the DEFAULTS' weakening is its not-cleanly row), `FD-V35` (a
 * language), `FD-V38` (a pool of another type), `FD-V39` (a gate type) and `FD-V46` (a transform-only type's node with
 * no `transform`). Each REFUSED by the registry form and ACCEPTED by the static one — the specialisation is what refuses.
 */
const REGISTRY_REPAIRS: Record<string, (d: Doc) => void> = {
  'FD-V4--unknown-predicate-name.flow.json': (d) => { (edgesOf(d, 'score')[0]!.when as Record<string, unknown>).predicate = 'isLowConfidence'; },
  'FD-V31--worker-group-not-in-registry.flow.json': (d) => { nodeOf(d, 'score').workerGroups = ['gpu']; },
  'FD-V32--type-not-in-registry.flow.json': (d) => { nodeOf(d, 'score').type = 'Scorer'; },
  'FD-V33--settings-the-type-refuses.flow.json': (d) => { (nodeOf(d, 'score').settings as Record<string, unknown>).factor = 10; },
  'FD-V35--transform-language-not-in-registry.flow.json': (d) => { (nodeOf(d, 'score').transform as Record<string, unknown>).lang = 'path'; },
  'FD-V38--pool-not-an-instance-of-the-type.flow.json': (d) => { nodeOf(d, 'score').pool = 'ScoreWorker'; },
  'FD-V39--gate-type-not-registered.flow.json': (d) => { nodeOf(d, 'dedupe').type = 'distinct'; },
  'FD-V46--a-transform-only-node-with-no-transform.flow.json': (d) => { nodeOf(d, 'reshape').transform = { lang: 'path', expr: 'confidence' }; },
};

/**
 * **Every clause the registry form CARRIES, one edit each on `base()`** — refused by the registry form, ACCEPTED by the
 * static one, reported by `validateDefinition` against the registry as the rule named. Names from `registry.json`:
 * `ScoreWorker` (worker `score`, no settingsSchema), `Scorer` (worker `scorer`: `factor`, a number >= 0, nothing else;
 * defaults `{ factor: 1 }`), the instance `scorer-fast` of `Scorer`, groups `gpu` and `api`, predicates
 * `isLowConfidence` and `isHighConfidence`, the language `path`; and the built-in gate types `distinct` (static: `first`,
 * `duplicate`, `nokey`; settings exactly `{ key }`), `if` (static: `then`, `else`; settings exactly `{ when }`) and
 * `switch` (derived).
 */
const REGISTRY_CLAUSES: [string, string, (d: Doc) => void][] = [
  ['FD-V32', 'a type the registry does not declare', (d) => { nodeOf(d, 'a').type = 'Nope'; }],
  ['FD-V38', 'a pool the registry does not declare', (d) => { nodeOf(d, 'a').pool = 'nope'; }],
  ['FD-V38', 'a pool that is an instance of another type', (d) => { nodeOf(d, 'a').pool = 'scorer-fast'; }],
  ['FD-V33', 'a setting of the wrong type', (d) => { nodeOf(d, 'a').type = 'Scorer'; nodeOf(d, 'a').settings = { factor: 'x' }; }],
  ['FD-V33', 'a setting below its minimum', (d) => { nodeOf(d, 'a').type = 'Scorer'; nodeOf(d, 'a').settings = { factor: -1 }; }],
  ['FD-V33', 'a setting the schema does not declare', (d) => { nodeOf(d, 'a').type = 'Scorer'; nodeOf(d, 'a').settings = { zz: 1 }; }],
  ['FD-V31', 'a group the registry does not declare', (d) => { nodeOf(d, 'a').workerGroups = ['gpu', 'nope']; }],
  ['FD-V35', 'a language the registry does not declare', (d) => { nodeOf(d, 'a').type = 'Scorer'; nodeOf(d, 'a').transform = { lang: 'jsonata', expr: 'x' }; }],
  ['FD-V46', 'a Transform node with no transform', (d) => { nodeOf(d, 'a').type = 'Transform'; }],
  ['FD-V4', 'a predicate the registry does not declare', when({ predicate: 'isLowConfidenc' })],
  ['FD-V39', 'a gate type the registry does not declare', (d) => { nodeOf(d, 'g').type = 'unique'; }],
  ['FD-V40', 'distinct settings with an undeclared key', (d) => { nodeOf(d, 'g').settings = { key: 'series', zz: 1 }; }],
  ['FD-V40', 'a distinct gate with no settings (its key is required)', (d) => { delete nodeOf(d, 'g').settings; }],
  ['FD-V41', 'a distinct edge naming a route distinct does not declare', (d) => { edgesOf(d, 'g')[1]!.route = 'dup'; }],
  ['FD-V40', 'an if gate with no settings (its when is required)', (d) => {
    const g = nodeOf(d, 'g'); g.type = 'if'; delete g.settings; g.edges = [{ to: 'done' }, { route: 'then', to: 'done' }];
  }],
  ['FD-V41', 'an if edge naming a route if does not declare', (d) => {
    const g = nodeOf(d, 'g'); g.type = 'if'; g.settings = { when: { path: 'input.a', op: 'eq', value: 1 } };
    g.edges = [{ to: 'done' }, { route: 'first', to: 'done' }];
  }],
];

/**
 * **What the registry form must ACCEPT because `validateDefinition` does** — the soundness claim's constructed half,
 * each row naming the clause that could over-refuse: a pool by the type's own name and by its instance, `Scorer` with no
 * settings (its defaults), every built-in gate type configured, a switch's routes (derived: any string), both groups,
 * both predicates, a `Transform` with its `transform`.
 */
const REGISTRY_ACCEPTS: [string, (d: Doc) => void][] = [
  ['a pool by the type\'s own name', (d) => { nodeOf(d, 'a').pool = 'ScoreWorker'; }],
  ['a Scorer on its named instance, with no settings (its defaults)', (d) => { nodeOf(d, 'a').type = 'Scorer'; nodeOf(d, 'a').pool = 'scorer-fast'; }],
  ['a Scorer with settings and a transform', (d) => { const a = nodeOf(d, 'a'); a.type = 'Scorer'; a.settings = { factor: 0 }; a.transform = { lang: 'path', expr: 'confidence' }; }],
  ['a Transform with its transform', (d) => { const a = nodeOf(d, 'a'); a.type = 'Transform'; a.transform = { lang: 'path', expr: 'confidence' }; }],
  ['both groups', (d) => { nodeOf(d, 'a').workerGroups = ['api', 'gpu']; }],
  ['the other predicate', when({ predicate: 'isHighConfidence' })],
  ['an if gate with its two routes', (d) => {
    const g = nodeOf(d, 'g'); g.type = 'if'; g.settings = { when: { path: 'input.a', op: 'eq', value: 1 } };
    g.edges = [{ to: 'done' }, { route: 'then', to: 'done' }];
  }],
  ['a switch gate with its cases routed', (d) => {
    const g = nodeOf(d, 'g'); g.type = 'switch'; g.settings = { key: 'kind', cases: { pdf: 'pdf' } };
    g.edges = [{ to: 'done' }, { route: 'pdf', to: 'done' }];
  }],
];

/**
 * **What a schema CANNOT cleanly carry — P43 fact 2's not-cleanly row, and `minLength` (found by this item)** — each a
 * claim of ABSENCE: the registry form ACCEPTS the document, and the CONTROL is `validateDefinition` refusing the same
 * document, against the same registry, under the rule named. Files where the corpus has one; constructed otherwise.
 */
const NOT_CLEANLY: [string, string, Registry, () => Doc | Promise<Doc>][] = [
  ['FD-V41', 'every route wired EXACTLY ONCE — distinct\'s duplicate unwired', registry, () => load(`${EX}/invalid/FD-V41--a-declared-route-with-no-edge.flow.json`)],
  ['FD-V41', 'a DERIVED gate type\'s routes — a switch case unwired', registry, () => load(`${EX}/invalid/FD-V41--a-switch-case-with-no-edge.flow.json`)],
  ['FD-V41', 'a DERIVED gate type\'s routes — a switch edge naming no case', registry, () => {
    const d = base(); const g = nodeOf(d, 'g'); g.type = 'switch'; g.settings = { key: 'kind', cases: { pdf: 'pdf' } };
    g.edges = [{ to: 'done' }, { route: 'pdf', to: 'done' }, { route: 'nope', to: 'done' }];
    return d;
  }],
  ['FD-V40', 'a gate type\'s settingsProblem — an if condition outside input', registry, () => load(`${EX}/invalid/FD-V40--an-if-condition-outside-input.flow.json`)],
  ['FD-V36', 'a language\'s compile', registry, () => load(`${EX}/invalid/FD-V36--transform-the-language-refuses.flow.json`)],
  ['FD-V33', 'the EFFECTIVE settings — a type default the settingsSchema refuses', variant((r) => { r.nodeTypes.Scorer!.settings = { factor: -1 }; }), () => {
    const d = base(); nodeOf(d, 'a').type = 'Scorer'; return d;
  }],
  ['FD-V33', 'a minLength above 1, relaxed to half — "a" against minLength 2', variant((r) => {
    (r.workers.scorer!.settingsSchema as { properties: Record<string, unknown> }).properties.name = { type: 'string', minLength: 2 };
  }), () => {
    const d = base(); nodeOf(d, 'a').type = 'Scorer'; nodeOf(d, 'a').settings = { name: 'a' }; return d;
  }],
];

/** A consumer gate type beside the built-ins — static, routes `ok` (the default) and `hold`. */
const TRIAGE: GateType = { routes: ['ok', 'hold'], defaultRoute: 'ok', settingsSchema: { type: 'object', additionalProperties: false }, fn: () => 'ok' };

/**
 * **The registry form's sweep** — every task node of each valid corpus flow given each node type, pool, settings,
 * group list and transform below; every gate each gate type and settings; every gate edge each route; every named
 * predicate each name. The values are written from `registry.json`, not read from the module. The registry form is asked
 * of the mutated NODE alone (`$defs/node`), and `validateDefinition` against the same registry wherever it refused.
 */
async function registrySweep(names: string[], s: DefinitionSchema, reg: Registry) {
  const nodeValidator = new Validator({ $schema: s.$schema, $ref: '#/$defs/node', $defs: s.$defs } as never, '2020-12', true);
  const r = { refused: 0, accepted: 0, unsound: [] as string[] };
  const TASK: [string, unknown][] = [
    ...['IngestWorker', 'ScoreWorker', 'ReviewWorker', 'PublishWorker', 'ExtractWorker', 'MergeWorker', 'Scorer', 'Transform', 'Nope'].map((t): [string, unknown] => ['type', t]),
    ...['scorer-fast', 'Scorer', 'ScoreWorker', 'nope'].map((p): [string, unknown] => ['pool', p]),
    ['settings', {}], ['settings', { factor: 2 }], ['settings', { factor: -1 }], ['settings', { zz: 1 }],
    ['workerGroups', ['gpu']], ['workerGroups', ['api', 'gpu']], ['workerGroups', ['nope']],
    ['transform', { lang: 'path', expr: 'confidence' }], ['transform', { lang: 'nope', expr: 'confidence' }],
  ];
  const GATE: [string, unknown][] = [
    ...['distinct', 'if', 'switch', 'nope'].map((t): [string, unknown] => ['type', t]),
    ['settings', { key: 'k' }], ['settings', { when: { path: 'input.a', op: 'eq', value: 1 } }], ['settings', { key: 'k', cases: { a: 1 } }], ['settings', {}],
  ];
  const ROUTES = ['first', 'duplicate', 'nokey', 'then', 'else', 'default', 'nope'];
  const PREDICATES = ['isLowConfidence', 'isHighConfidence', 'nope'];
  const check = (d: Doc, i: number, what: string) => {
    if (nodeValidator.validate(d.nodes[i]).valid) { r.accepted++; return; }
    r.refused++;
    if (validateDefinition(d as unknown as FlowDefinition, reg).length === 0) r.unsound.push(what);
  };
  for (const n of names) {
    const d0 = await load(`${EX}/valid/${n}`);
    d0.nodes.forEach((node, i) => {
      const keyed = node.kind === 'task' ? TASK : node.kind === 'gate' ? GATE : [];
      for (const [k, v] of keyed) { const d = clone(d0); d.nodes[i]![k] = clone(v); check(d, i, `${n} nodes[${i}].${k} = ${JSON.stringify(v)}`); }
      ((node.edges as Record<string, unknown>[] | undefined) ?? []).forEach((e, j) => {
        const edge = (d: Doc) => (d.nodes[i]!.edges as Record<string, unknown>[])[j]!;
        if (node.kind === 'gate') {
          for (const route of ROUTES) { const d = clone(d0); edge(d).route = route; check(d, i, `${n} nodes[${i}].edges[${j}].route = ${route}`); }
        }
        if (typeof (e.when as { predicate?: unknown } | undefined)?.predicate === 'string') {
          for (const p of PREDICATES) { const d = clone(d0); (edge(d).when as Record<string, unknown>).predicate = p; check(d, i, `${n} nodes[${i}].edges[${j}].when.predicate = ${p}`); }
        }
      });
    });
  }
  return r;
}

suite(SUITE, (test) => {
  test('it is a VALID JSON Schema draft 2020-12 document — the 2020-12 meta-schema accepts it, and refuses a nested defect in a copy (the control)', () => {
    const meta = metaValidator();
    equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema', 'the dialect it declares');
    const r = meta.validate(schema);
    ok(r.valid, `the meta-schema refuses it: ${r.errors.slice(-3).map((e) => `${e.instanceLocation} ${e.error}`).join(' | ')}`);
    // The controls: a defect DEEP inside a copy — a `$defs` member's type, a nested property's minItems — is refused,
    // so the meta-check reaches nested schemas (the measurement `metaValidator` exists for).
    const bad1 = clone(schema) as unknown as { $defs: Record<string, Record<string, unknown>> };
    bad1.$defs.id!.type = 'strin';
    ok(!meta.validate(bad1).valid, 'a $defs member with type "strin" is refused');
    const bad2 = clone(schema) as unknown as { $defs: { fanoutNode: { properties: { branches: Record<string, unknown> } } } };
    bad2.$defs.fanoutNode.properties.branches.minItems = -1;
    ok(!meta.validate(bad2).valid, 'a nested property with minItems -1 is refused');
  });

  test('every valid corpus flow is ACCEPTED — spec/examples/valid and examples/flows, all of them', async () => {
    ok(validNames.length > 0 && exampleNames.length > 0, 'both corpora are non-empty');
    const refused: string[] = [];
    for (const n of validNames) if (!accepts(await load(`${EX}/valid/${n}`))) refused.push(`valid/${n}`);
    for (const n of exampleNames) if (!accepts(await load(`${ROOT}examples/flows/${n}`))) refused.push(`examples/flows/${n}`);
    equal(refused, [], 'no valid flow is refused');
  });

  test('the invalid corpus PARTITIONS as section 5 says — every shape-only file refused, the three shape-clause files refused, every other file accepted', async () => {
    const refused: string[] = [];
    const accepted: string[] = [];
    for (const n of invalidNames) (accepts(await load(`${EX}/invalid/${n}`)) ? accepted : refused).push(n);
    const expectRefused = invalidNames.filter(staticRefuses);
    equal(refused, expectRefused, 'the refused files are exactly the shape-only rules\' and the three named');
    equal(accepted, invalidNames.filter((n) => !expectRefused.includes(n)), 'and every other file is accepted');
    // Every name the two lists carry is a file on disk, and every shape-only rule has one — so neither list is vacuous.
    for (const n of [...SHAPE_FILES_OF_OTHER_RULES, ...CROSS_KEY_FILES_OF_SHAPE_RULES]) ok(invalidNames.includes(n), `${n} is in the corpus`);
    for (const r of SHAPE_ONLY) ok(invalidNames.some((n) => ruleOfFile(n) === r), `${r} has a corpus file`);
  });

  test('each refused file, REPAIRED in its one clause, is ACCEPTED — and validateDefinition stops reporting its rule (the control)', async () => {
    const refusedNames = invalidNames.filter(staticRefuses);
    equal(Object.keys(REPAIRS).sort(), [...refusedNames].sort(), 'one repair per refused file, and no other');
    for (const n of refusedNames) {
      const d = await load(`${EX}/invalid/${n}`);
      const rule = ruleOfFile(n);
      ok(!accepts(d), `${n}: refused before the repair`);
      ok(rulesOf(d).includes(rule), `${n}: validateDefinition reports ${rule} before the repair (the second observer)`);
      const fixed = clone(d);
      REPAIRS[n]!(fixed);
      ok(!deepEqual(fixed, d), `${n}: the repair changed the document`);
      if (!accepts(fixed)) ok(false, `${n}: ACCEPTED once repaired — refused: ${explain(fixed)}`);
      ok(!rulesOf(fixed).includes(rule), `${n}: validateDefinition no longer reports ${rule} once repaired (got ${rulesOf(fixed).join(', ')})`);
    }
  });

  test('every clause it carries, each on a hand-built base: refused by the schema, reported by validateDefinition as the rule named — the base accepted by both (the control)', () => {
    const b = base();
    if (!accepts(b)) ok(false, `the base is accepted — refused: ${explain(b)}`);
    equal(rulesOf(b), [], 'and validateDefinition reports nothing on it');
    equal([...new Set(CLAUSES.map(([r]) => r))].sort(), [...CLAUSE_RULES].sort(), 'the rows cover exactly the rules named');
    // A COUNT beside the set (rule 8 (d)): a row dropped from a rule other rows still cover keeps the set equal.
    equal(CLAUSES.length, 116, 'a hundred and seven rows written (five of them W221`s valueFrom rows), four generated (the ordering operators) and five generated (a join of null, 5, [], {} and true — W215)');
    let run = 0;
    for (const [rule, what, edit] of CLAUSES) {
      const d = base();
      edit(d);
      ok(!deepEqual(d, b), `${what}: the edit changed the base`);
      ok(!accepts(d), `${what}: refused by the schema`);
      ok(rulesOf(d).includes(rule), `${what}: validateDefinition reports ${rule} (got ${rulesOf(d).join(', ')})`);
      run++;
    }
    equal(run, CLAUSES.length, 'every row ran');
  });

  test('every value validateDefinition accepts INSIDE a node is accepted — each subset type and keyword, retryPolicy, version, on, length defaults, every operator', () => {
    equal(ACCEPTS.length, 7 + 10 + 6 + 7 + 5, 'the seven types alone, ten subset rows, six more, the seven operators and five more (W210\'s two Q774 rows left at W215)');
    let run = 0;
    for (const [what, edit] of ACCEPTS) {
      run++;
      const d = base();
      edit(d);
      ok(!deepEqual(d, base()), `${what}: the edit changed the base`);
      equal(rulesOf(d), [], `${what}: validateDefinition accepts it (the premise)`);
      if (!accepts(d)) ok(false, `${what}: the schema accepts it — refused: ${explain(d)}`);
    }
    equal(run, ACCEPTS.length, 'every row ran');
  });

  test('the operator partition the schema writes AGREES with the validator: every operator against a number, a string, a boolean and null, with and without length', () => {
    let refusedByBoth = 0;
    let acceptedByBoth = 0;
    let schemaRefused = 0;
    for (const op of PREDICATE_OPS) {
      for (const value of [1, 'x', true, null]) {
        for (const length of [undefined, true]) {
          const d = base();
          when(leaf({ op, value, ...(length ? { length } : {}) }))(d);
          const validator = !rulesOf(d).includes('FD-V44');
          if (!accepts(d)) schemaRefused++;
          equal(accepts(d), validator, `${op} ${JSON.stringify(value)}${length ? ' with length' : ''}: the schema's verdict is the validator's`);
          if (validator) acceptedByBoth++; else refusedByBoth++;
        }
      }
    }
    equal(schemaRefused, refusedByBoth, 'the schema refused exactly as many as the validator did (a second count of the same verdicts)');
    ok(refusedByBoth > 10 && acceptedByBoth > 10, `both verdicts occur (refused ${refusedByBoth}, accepted ${acceptedByBoth})`);
  });

  test('the error reference (W209): "n!error", "n!error?" and their array forms accepted at a node and at an edge, every malformed "!" spelling refused — each verdict equal to referenceTarget`s parse and to section 3`s table', () => {
    const atNode = (ref: unknown): Doc => { const d = base(); nodeOf(d, 'b').needs = { x: ref }; return d; };
    const atEdge = (ref: unknown): Doc => { const d = base(); edgesOf(d, 'a').unshift({ when: { predicate: 'isLowConfidence' }, needs: { x: ref }, to: 'split' }); return d; };
    const ran = [0, 0];
    for (const [ref, expected] of SPELLINGS) {
      ran[expected ? 0 : 1]!++;
      const parsed = referenceTarget(ref);
      equal(parsed !== null, expected, `${JSON.stringify(ref)}: referenceTarget's parse agrees with the table`);
      equal(accepts(atNode(ref)), expected, `${JSON.stringify(ref)} at a node's needs`);
      const atEdgeExpected = expected && parsed?.form !== 'self';
      equal(accepts(atEdge(ref)), atEdgeExpected, `${JSON.stringify(ref)} at an edge's needs (where "." is refused)`);
    }
    // The control for the whole table: the accepted spellings include all four error forms, so a schema refusing every
    // "!" spelling fails above rather than passing on the refusals alone.
    ok(SPELLINGS.filter(([r, e]) => e && JSON.stringify(r).includes('!error')).length === 4, 'four accepted error spellings');
    equal(ran, [12, 25], 'twelve accepted spellings and twenty-five refused were CHECKED — a row deleted, or a filter on the loop, fails here');
  });

  test('every key of every set the validator declares carries a description, the required ones are required, and none other is admitted', () => {
    const defs = schema.$defs as Record<string, { properties: Record<string, { description?: unknown }>; required?: string[]; additionalProperties?: unknown }>;
    const hasDescription = (o: { description?: unknown } | undefined) => typeof o?.description === 'string' && (o.description as string).length > 20;
    for (const kind of KINDS) {
      const def = defs[`${kind}Node`]!;
      equal(Object.keys(def.properties).sort(), [...NODE_KEYS_DECLARED[kind]!].sort(), `${kind}: its properties are the validator's declared keys`);
      equal([...def.required!].sort(), [...NODE_KEYS_REQUIRED[kind]!].sort(), `${kind}: its required keys are the validator's`);
      equal(def.additionalProperties, false, `${kind}: no other key`);
      for (const k of NODE_KEYS_DECLARED[kind]!) ok(hasDescription(def.properties[k]), `${kind}.${k} carries a description`);
    }
    const edgeKeys = new Set([...Object.keys(defs.edge!.properties), ...Object.keys(defs.joinEdge!.properties), ...Object.keys(defs.gateEdge!.properties)]);
    equal([...edgeKeys].sort(), [...EDGE_KEYS_DECLARED].sort(), 'the three edge sites together carry exactly the validator\'s edge keys');
    for (const site of ['edge', 'joinEdge', 'gateEdge']) for (const [k, p] of Object.entries(defs[site]!.properties)) ok(hasDescription(p), `${site}.${k} carries a description`);
    const root = schema as unknown as { properties: Record<string, { description?: unknown }>; required: string[] };
    equal(Object.keys(root.properties).sort(), [...DOC_KEYS_DECLARED].sort(), 'the document\'s keys');
    equal([...root.required].sort(), [...DOC_KEYS_DECLARED].sort(), 'every one required');
    for (const k of DOC_KEYS_DECLARED) ok(hasDescription(root.properties[k]), `${k} carries a description`);
    const sets: [string, readonly string[]][] = [
      ['retryPolicy', RETRY_POLICY_KEYS], ['transform', TRANSFORM_KEYS], ['predicateName', PREDICATE_NAME_KEYS],
      ['comparison', PREDICATE_LEAF_KEYS], ['subsetSchema', SCHEMA_KEYWORDS],
    ];
    for (const [def, keys] of sets) {
      equal(Object.keys(defs[def]!.properties).sort(), [...keys].sort(), `${def}: exactly the validator's keys`);
      for (const k of keys) ok(hasDescription(defs[def]!.properties[k]), `${def}.${k} carries a description`);
    }
    const group = schema.$defs as unknown as { group: { oneOf: { properties: Record<string, { description?: unknown }> }[] } };
    equal(group.group.oneOf.map((b) => Object.keys(b.properties)[0]), [...PREDICATE_GROUP_KEYS], 'a group branch per group key');
    for (const b of group.group.oneOf) ok(hasDescription(Object.values(b.properties)[0]), 'each group key carries a description');
  });

  test('a key the validator gains with no description, or no schema, makes definitionSchema() THROW naming it — each road alone, and restored, it builds again (the control)', () => {
    // One probe per THROW SITE (W210's adequacy reader, SHOULD 3 — a key with neither fires both, a compound probe):
    // `pool` on a fanout HAS a schema (`nodeKeySchema`) and no fanout description, so only `described` can throw;
    // `predicate` in a comparison has a description and no comparison schema, so only the comparison's throw can.
    const probe = (set: string[], key: string): string => {
      set.push(key);
      try { definitionSchema(); return ''; } catch (e) { return (e as Error).message; } finally { set.pop(); }
    };
    const fanout = NODE_KEYS_DECLARED.fanout as string[];
    const undescribed = probe(fanout, 'pool');
    ok(undescribed.includes('"pool"') && undescribed.includes('no description'), `the description road, naming the key (got ${JSON.stringify(undescribed)})`);
    const unschemed = probe(PREDICATE_LEAF_KEYS as string[], 'predicate');
    ok(unschemed.includes('"predicate"') && unschemed.includes('no schema'), `the schema road, naming the key (got ${JSON.stringify(unschemed)})`);
    const task = NODE_KEYS_DECLARED.task as string[];
    const neither = probe(task, 'zzUndescribed');
    ok(neither.includes('zzUndescribed'), `a key with neither, naming it (got ${JSON.stringify(neither)})`);
    ok(!fanout.includes('pool') && !task.includes('zzUndescribed') && !PREDICATE_LEAF_KEYS.includes('predicate'), 'every set is restored');
    ok(deepEqual(definitionSchema(), schema), 'and it builds what it built before');
  });

  test('the root description names validateDefinition and runtime.check as the authority for every rule it does not carry', () => {
    const d = schema.description as string;
    ok(typeof d === 'string' && d.includes('validateDefinition') && d.includes('runtime.check'), 'both are named');
    ok(/AUTHORITY/.test(d), 'as the authority');
  });

  test('a NEW object on every call, JSON-serialisable — mutating one changes neither the next call nor another', () => {
    const a = definitionSchema();
    const b = definitionSchema();
    ok(a !== b, 'two calls, two objects');
    ok((a.$defs as object) !== (b.$defs as object), 'and no shared nested object');
    ok(deepEqual(a, b), 'with equal content');
    ok(deepEqual(JSON.parse(JSON.stringify(a)), a), 'that survives JSON whole');
    ((a.$defs as Record<string, Record<string, unknown>>).id!).pattern = 'x';
    (a.required as string[]).pop();
    ok(deepEqual(b, definitionSchema()), 'mutating one changes neither another nor the next call');
    // DEEP: no object reachable from one result is reachable from another (W210's adequacy reader, SHOULD 4 — a nested
    // schema hoisted to module scope survived the one-level checks above).
    const reach = (v: unknown, into: Set<object>) => {
      if (typeof v !== 'object' || v === null || into.has(v)) return;
      into.add(v);
      for (const x of Object.values(v)) reach(x, into);
    };
    const inA = new Set<object>();
    reach(definitionSchema(), inA);
    const inB = new Set<object>();
    reach(definitionSchema(), inB);
    ok(inA.size > 100, `the walk reached the nested schemas (${inA.size} objects)`);
    equal([...inB].filter((o) => inA.has(o)).length, 0, 'no object is shared between two results');
  });

  test('it NEVER refuses what validateDefinition accepts — every valid flow mutated one key at a time, each refusal of the schema a refusal of the validator', async () => {
    // ADR 0132 rule 2 as a property over constructed values: a node's or an edge's key DELETED (a node's), set to a value
    // of each kind a declared key can be WRONG with — null, a string, an array — or an undeclared key ADDED. The direction
    // asserted is the schema's: where the schema refuses, the validator must, so the validator is asked only there.
    // **The schema is asked of the mutated NODE alone** (`$defs/node`): the rest of the document is the accepted corpus flow,
    // unchanged, so the document's verdict is the node's — and that equivalence is a claim, checked on every TENTH mutation
    // against the whole document. Counted both ways so neither half is vacuous. *(Six values, the whole document and the
    // validator on every mutation cost the chromium lane ~2.8 s, and its later suites ~5 s more — W210's re-take 7.)*
    const r = await sweep(validNames, schema);
    equal(r.unsound, [], 'no document the validator accepts is refused by the schema');
    equal(r.disagree, [], 'the verdict on the node is the verdict on the document, wherever both were asked');
    ok(r.refused > 1000 && r.accepted > 0 && r.whole > 100, `every half is populated (schema refused ${r.refused}, accepted ${r.accepted}; the whole document asked ${r.whole} times)`);
    // The POSITIVE CONTROL on the same observer (W210's adequacy reader, BLOCKER 1's T10): an over-strict copy — an end's
    // outcome at least TWO characters, where the validator accepts one — swept over one corpus flow, IS reported unsound.
    const strict = clone(schema) as unknown as DefinitionSchema & { $defs: { endNode: { properties: { outcome: Record<string, unknown> } } } };
    strict.$defs.endNode.properties.outcome.minLength = 2;
    const control = await sweep(['linear.flow.json'], strict);
    ok(control.unsound.some((w) => w.includes('.outcome = "x"')), `the over-strict copy is caught (unsound: ${JSON.stringify(control.unsound)})`);
  });

  // ---- W211: the REGISTRY form ----

  test('W211 — definitionSchema(registry) is a VALID 2020-12 document too, and definitionSchema() is unmoved by the argument it may now take', () => {
    const r = metaValidator().validate(regSchema);
    ok(r.valid, `the meta-schema refuses it: ${r.errors.slice(-3).map((e) => `${e.instanceLocation} ${e.error}`).join(' | ')}`);
    equal(regSchema.$schema, 'https://json-schema.org/draft/2020-12/schema', 'the dialect it declares');
    ok(deepEqual(definitionSchema(undefined), schema), 'an undefined registry is no registry');
    // The STATIC form carries none of the registry form's additions — read from W210's shape, not from a second call
    // (W211's adequacy reader, SHOULD 3: comparing definitionSchema() with itself could not fail).
    type Bare = { properties: Record<string, { enum?: unknown; items?: { enum?: unknown } }>; allOf?: unknown };
    const st = schema.$defs as Record<string, Bare>;
    ok(st.taskNode!.allOf === undefined && st.gateNode!.allOf === undefined, 'no per-type branch on a task or a gate');
    ok(st.taskNode!.properties.type!.enum === undefined && st.gateNode!.properties.type!.enum === undefined, 'no type enum');
    ok(st.taskNode!.properties.workerGroups!.items!.enum === undefined && st.transform!.properties.lang!.enum === undefined &&
      st.predicateName!.properties.predicate!.enum === undefined, 'no group, language or predicate enum');
    ok(String(schema.description).includes('none that needs another node or a registry'), 'and its own root description, W210\'s');
    ok(!deepEqual(regSchema, schema), 'and a registry specialises it (the control: the two differ)');
  });

  test('W211 — against spec/examples/registry.json: every valid corpus flow ACCEPTED; the registry-specialisable files REFUSED, the static form accepting each; every other invalid file as the static form has it', async () => {
    const refused: string[] = [];
    for (const n of validNames) if (!regAccepts(await load(`${EX}/valid/${n}`))) refused.push(n);
    equal(refused, [], 'no valid flow is refused');
    const registryFiles = Object.keys(REGISTRY_REPAIRS);
    for (const n of registryFiles) ok(invalidNames.includes(n), `${n} is in the corpus`);
    const staticRefused = invalidNames.filter(staticRefuses);
    const got: string[] = [];
    for (const n of invalidNames) if (!regAccepts(await load(`${EX}/invalid/${n}`))) got.push(n);
    equal(got, invalidNames.filter((n) => staticRefused.includes(n) || registryFiles.includes(n)), 'refused: the static form\'s files and the eight registry-specialisable files, no other');
    equal(registryFiles.filter((n) => staticRefused.includes(n)), [], 'no registry-specialisable file is one the static form refuses — so the SPECIALISATION is what refuses it');
  });

  test('W211 — each registry-specialisable file, REPAIRED in its one clause, is ACCEPTED by the registry form — and validateDefinition stops reporting its rule (the control)', async () => {
    let run = 0;
    for (const [n, repair] of Object.entries(REGISTRY_REPAIRS)) {
      const d = await load(`${EX}/invalid/${n}`);
      const rule = ruleOfFile(n);
      ok(!regAccepts(d), `${n}: refused before the repair`);
      ok(accepts(d), `${n}: and ACCEPTED by the static form — the specialisation is what refuses`);
      ok(rulesOf(d).includes(rule), `${n}: validateDefinition reports ${rule} (the second observer)`);
      const fixed = clone(d);
      repair(fixed);
      ok(!deepEqual(fixed, d), `${n}: the repair changed the document`);
      if (!regAccepts(fixed)) ok(false, `${n}: ACCEPTED once repaired — refused: ${regExplain(fixed)}`);
      ok(!rulesOf(fixed).includes(rule), `${n}: validateDefinition no longer reports ${rule} once repaired (got ${rulesOf(fixed).join(', ')})`);
      run++;
    }
    equal(run, 8, 'all eight files ran');
  });

  test('W211 — every clause the registry form carries, on the hand-built base: refused by it, accepted by the static form, reported by validateDefinition as the rule named; and every value validateDefinition accepts, accepted', () => {
    const b = base();
    if (!regAccepts(b)) ok(false, `the base is accepted — refused: ${regExplain(b)}`);
    equal([...new Set(REGISTRY_CLAUSES.map(([r]) => r))].sort(), ['FD-V31', 'FD-V32', 'FD-V33', 'FD-V35', 'FD-V38', 'FD-V39', 'FD-V4', 'FD-V40', 'FD-V41', 'FD-V46'], 'the rows cover exactly the rules the registry form carries');
    let run = 0;
    for (const [rule, what, edit] of REGISTRY_CLAUSES) {
      const d = base();
      edit(d);
      ok(!regAccepts(d), `${what}: refused by the registry form`);
      if (!accepts(d)) ok(false, `${what}: ACCEPTED by the static form — refused: ${explain(d)}`);
      ok(rulesOf(d).includes(rule), `${what}: validateDefinition reports ${rule} (got ${rulesOf(d).join(', ')})`);
      run++;
    }
    equal(run, 16, 'every row ran');
    for (const [what, edit] of REGISTRY_ACCEPTS) {
      const d = base();
      edit(d);
      ok(!deepEqual(d, base()), `${what}: the edit changed the base`);
      equal(rulesOf(d), [], `${what}: validateDefinition accepts it (the premise)`);
      if (!regAccepts(d)) ok(false, `${what}: the registry form accepts it — refused: ${regExplain(d)}`);
      run++;
    }
    equal(run, 16 + 8, 'and every accepted row ran');
  });

  test('W211 — what a schema CANNOT cleanly carry, each NOT refused, beside validateDefinition\'s refusal of the same document (the control); named in the root description; the inputSchema an annotation only', async () => {
    let run = 0;
    for (const [rule, what, reg, doc] of NOT_CLEANLY) {
      const d = await doc();
      const s = reg === registry ? regSchema : definitionSchema(reg);
      if (!regAccepts(d, reg === registry ? regValidator : new Validator(s as never, '2020-12', true))) ok(false, `${what}: NOT refused — refused: ${regExplain(d, s)}`);
      ok(rulesAgainst(d, reg).includes(rule), `${what}: validateDefinition refuses it as ${rule} (got ${rulesAgainst(d, reg).join(', ')})`);
      run++;
    }
    equal(run, 7, 'every row ran');
    const said = String(regSchema.description);
    let named = 0;
    for (const phrase of ['EFFECTIVE', 'WEAKENED', 'a default\'s own value', 'top-level keyword', 'minLength', 'DERIVED', 'EXACTLY ONCE', 'settingsProblem', 'compile', 'inputSchema', 'ANNOTATION', 'needs another node', 'validateDefinition(flow, registry)', 'runtime.check']) {
      ok(said.includes(phrase), `the root description names ${JSON.stringify(phrase)}`);
      named++;
    }
    equal(named, 14, 'every phrase was looked for');
    ok(said !== schema.description, 'and it is not the static form\'s');
    // The inputSchema: carried in its type's branch, and constraining nothing — a value it would refuse is accepted.
    const input = { type: 'string', minLength: 3 };
    const withInput = variant((r) => { (r.workers.scorer as { inputSchema?: unknown }).inputSchema = input; });
    const s = definitionSchema(withInput);
    const branch = ((s.$defs as Record<string, { allOf: { if: { properties: { type: { const: string } } }; then: { $defs?: { inputSchema?: unknown } } }[] }>).taskNode!.allOf)
      .find((b) => b.if.properties.type.const === 'Scorer')!;
    equal(branch.then.$defs?.inputSchema, input, 'Scorer\'s branch carries its worker\'s inputSchema whole');
    ok(branch.then.$defs?.inputSchema !== input, 'as a COPY — the registry\'s own object is not in the result');
    const d = base(); nodeOf(d, 'a').type = 'Scorer'; nodeOf(d, 'a').needs = { x: '$payload' };
    ok(regAccepts(d, new Validator(s as never, '2020-12', true)), 'and a node of that type is not held to it');
  });

  test('W211 — the required WEAKENED by the defaults is carried exactly, and a minLength relaxed to half accepts what the subset accepts (a lone astral character against minLength 2)', () => {
    // `factor` required by the worker, supplied by `Scorer`'s defaults and not by `Bare`'s (both of worker `scorer`).
    const reg = variant((r) => {
      (r.workers.scorer!.settingsSchema as { required?: string[] }).required = ['factor'];
      (r.nodeTypes as Record<string, unknown>).Bare = { worker: 'scorer' };
      const p = (r.workers.scorer!.settingsSchema as { properties: Record<string, unknown> }).properties;
      p.name = { type: 'string', minLength: 2 };
      p.code = { type: 'string', minLength: 3 };
      p.tags = { type: 'array', items: { type: 'string', minLength: 2 } };
      p.meta = { type: 'object', properties: { label: { type: 'string', minLength: 2 }, inner: { type: 'object', properties: { label: { type: 'string', minLength: 2 } } } } };
      p.short = { type: 'string', maxLength: 2 };
    });
    const v = new Validator(definitionSchema(reg) as never, '2020-12', true);
    const typed = (type: string, settings?: Record<string, unknown>): Doc => {
      const d = base(); nodeOf(d, 'a').type = type; if (settings !== undefined) nodeOf(d, 'a').settings = settings; return d;
    };
    const rows: [string, Doc, boolean][] = [
      ['Scorer, no settings — factor supplied by its defaults', typed('Scorer'), true],
      ['Bare, no settings — factor supplied by nothing', typed('Bare'), false],
      ['Bare, settings without factor', typed('Bare', { name: 'ab' }), false],
      ['Bare, settings with factor', typed('Bare', { factor: 1 }), true],
      ['a lone astral character against minLength 2 (two UTF-16 units)', typed('Scorer', { name: '\u{1F600}' }), true],
      ['an empty string against minLength 2', typed('Scorer', { name: '' }), false],
      ['three UTF-16 units in two code points against minLength 3', typed('Scorer', { code: '\u{1F600}a' }), true],
      ['one character against minLength 3 — relaxed to 2, rounded UP', typed('Scorer', { code: 'a' }), false],
      ['a lone astral character as an ITEM against minLength 2 — the walk reaches items', typed('Scorer', { tags: ['\u{1F600}'] }), true],
      ['a lone astral character in a NESTED property against minLength 2 — the walk reaches properties', typed('Scorer', { meta: { label: '\u{1F600}' } }), true],
      ['the same two levels down — the walk RECURSES', typed('Scorer', { meta: { inner: { label: '\u{1F600}' } } }), true],
      ['two characters against maxLength 2 — emitted as written', typed('Scorer', { short: 'ab' }), true],
      ['three against maxLength 2', typed('Scorer', { short: 'abc' }), false],
    ];
    let ran = 0;
    for (const [what, d, expected] of rows) {
      equal(rulesAgainst(d, reg).length === 0, expected, `${what}: validateDefinition's verdict (the premise)`);
      equal(regAccepts(d, v), expected, `${what}: the registry form's verdict is the validator's`);
      ran++;
    }
    equal(ran, 13, 'thirteen rows RAN');
    // The control for the relaxation: the same schema with minLength 2 put back REFUSES the astral character, so the
    // relaxation is what accepts it.
    const strict = definitionSchema(reg) as unknown as { $defs: { taskNode: { allOf: { if: { properties: { type: { const: string } } }; then: { properties: { settings: { properties: { name: { minLength: number } } } } } }[] } } };
    const scorer = strict.$defs.taskNode.allOf.find((b) => b.if.properties.type.const === 'Scorer')!;
    equal(scorer.then.properties.settings.properties.name.minLength, 1, 'minLength 2 is emitted as 1');
    scorer.then.properties.settings.properties.name.minLength = 2;
    ok(!regAccepts(rows[4]![1], new Validator(strict as never, '2020-12', true)), 'unrelaxed, a 2020-12 validator refuses it');
  });

  test('W211 — a registry checkRegistry REFUSES is never specialised: definitionSchema(registry) throws its refusal; the corpus registry does not', () => {
    const refusedRegistries: [string, Registry][] = [
      ['a node type naming a worker the registry does not declare', variant((r) => { (r.nodeTypes as Record<string, unknown>).Lost = { worker: 'nope' }; })],
      ['a pool of a type the registry does not declare', variant((r) => { (r.pools as Record<string, unknown>).stray = { type: 'Nope' }; })],
      ['a gate type named as a built-in', { ...registry, gateTypes: { distinct: TRIAGE } }],
      ['a gate type that is not one', { ...registry, gateTypes: { broken: { routes: [], defaultRoute: 'x', fn: () => 'x' } as unknown as GateType } }],
    ];
    let ran = 0;
    for (const [what, reg] of refusedRegistries) {
      let message = '';
      try { checkRegistry(reg); } catch (e) { message = `${(e as Error).name}: ${(e as Error).message}`; }
      ok(message.length > 0, `${what}: checkRegistry refuses it (the premise)`);
      throws(() => definitionSchema(reg), message, `${what}: definitionSchema throws checkRegistry's own refusal`);
      ran++;
    }
    equal(ran, 4, 'all four refused registries RAN');
    // The control: the corpus registry, which checkRegistry accepts, is specialised without a throw.
    checkRegistry(registry);
    const again = definitionSchema(registry);
    ok(deepEqual(again, regSchema) && Array.isArray(((again.$defs as Record<string, { properties: { type: { enum?: unknown } } }>).taskNode!.properties.type.enum)), 'the corpus registry is specialised (the control)');
  });

  test('W211 — every registry-derived set as the validator reads it: a Map, a Set or an object alike; a consumer gate type beside the built-ins, its routes the edge\'s enum', () => {
    type Defs = Record<string, { properties: Record<string, { enum?: unknown[]; items?: { enum?: unknown[] } }>; allOf?: { if: { properties: { type: { const: string } } }; then: { properties: Record<string, { enum?: unknown[]; items?: { properties: { route: { enum: unknown[] } } } }> } }[] }>;
    const defs = regSchema.$defs as Defs;
    // Every expected list below is registry.json's, by hand, and the built-ins' (spec section 2).
    equal(defs.taskNode!.properties.type!.enum, ['IngestWorker', 'ScoreWorker', 'ReviewWorker', 'PublishWorker', 'ExtractWorker', 'MergeWorker', 'Scorer', 'Transform'], 'the node types, the built-in last');
    equal(defs.taskNode!.properties.workerGroups!.items!.enum, ['gpu', 'api'], 'the groups');
    equal(defs.transform!.properties.lang!.enum, ['path'], 'the languages');
    equal(defs.predicateName!.properties.predicate!.enum, ['isLowConfidence', 'isHighConfidence'], 'the predicates');
    equal(defs.gateNode!.properties.type!.enum, ['distinct', 'if', 'switch'], 'the gate types');
    const pool = (t: string) => defs.taskNode!.allOf!.find((b) => b.if.properties.type.const === t)!.then.properties.pool!.enum;
    equal(pool('Scorer'), ['Scorer', 'scorer-fast'], 'Scorer\'s pools: its own name and its instance');
    equal(pool('ScoreWorker'), ['ScoreWorker'], 'ScoreWorker\'s: its own name alone');
    const routes = (t: string) => defs.gateNode!.allOf!.find((b) => b.if.properties.type.const === t)!.then.properties.edges?.items?.properties.route.enum;
    equal(routes('distinct'), ['first', 'duplicate', 'nokey'], 'distinct\'s routes');
    equal(routes('if'), ['then', 'else'], 'if\'s routes');
    equal(routes('switch'), undefined, 'switch is DERIVED: no route enum');
    // The registry's other shapes: Maps for the keyed sections, Sets for the named ones — the same schema.
    const asMaps: Registry = {
      predicates: new Set(registry.predicates), groups: new Set(registry.groups),
      workers: new Map(Object.entries(registryDoc.workers)), nodeTypes: new Map(Object.entries(registryDoc.nodeTypes)),
      pools: new Map(Object.entries(registryDoc.pools)), languages: new Map(Object.entries(registry.languages as Record<string, never>)),
    };
    ok(deepEqual(definitionSchema(asMaps), regSchema), 'a registry of Maps and Sets specialises as one of objects and lists');
    // A consumer's gate type: beside the built-ins, its static routes its edges' enum.
    const withTriage = definitionSchema({ ...registry, gateTypes: { triage: TRIAGE } }).$defs as Defs;
    equal(withTriage.gateNode!.properties.type!.enum, ['distinct', 'if', 'switch', 'triage'], 'the built-ins, then the registry\'s');
    equal(withTriage.gateNode!.allOf!.find((b) => b.if.properties.type.const === 'triage')!.then.properties.edges!.items!.properties.route.enum, ['ok', 'hold'], 'triage\'s routes');
    // The remaining shapes `Registry` admits (W211's adequacy reader, SHOULD 2): the groups and the predicates as LISTS,
    // and `gateTypes` as a Map.
    const asLists: Registry = { ...registry, predicates: [...registry.predicates], groups: [...(registry.groups ?? [])] };
    ok(!(asLists.groups instanceof Set) && !(asLists.predicates instanceof Set), 'lists, not Sets (the premise)');
    ok(deepEqual(definitionSchema(asLists), regSchema), 'groups and predicates as lists specialise as Sets do');
    ok(deepEqual(definitionSchema({ ...registry, gateTypes: new Map([['triage', TRIAGE]]) }).$defs, withTriage), 'gateTypes as a Map specialises as an object does');
  });

  test('W211 — the soundness claim over registry shapes the corpus registry never takes: each document validateDefinition accepts, the registry form accepts', () => {
    // W211's adequacy reader, SHOULD 1: an open settingsSchema, a gate type whose schema accepts `{}`, a worker with an
    // inputSchema beside settings, and the list and Map forms — each a way the form could over-refuse.
    const open = variant((r) => { delete (r.workers.scorer!.settingsSchema as { additionalProperties?: unknown }).additionalProperties; });
    const withInput = variant((r) => { (r.workers.scorer as { inputSchema?: unknown }).inputSchema = { type: 'string', minLength: 3 }; });
    const triageGate = (d: Doc) => { const g = nodeOf(d, 'g'); g.type = 'triage'; delete g.settings; g.edges = [{ to: 'done' }, { route: 'hold', to: 'done' }]; };
    const scorer = (settings: Record<string, unknown>) => (d: Doc) => { nodeOf(d, 'a').type = 'Scorer'; nodeOf(d, 'a').settings = settings; };
    const rows: [string, Registry, (d: Doc) => void][] = [
      ['an undeclared setting under a settingsSchema that does not close its properties', open, scorer({ factor: 1, extra: 1 })],
      ['a gate of a consumer type whose settingsSchema accepts {}, with no settings', { ...registry, gateTypes: { triage: TRIAGE } }, triageGate],
      ['the same, gateTypes a Map', { ...registry, gateTypes: new Map([['triage', TRIAGE]]) }, triageGate],
      ['a Scorer with settings, its worker declaring an inputSchema', withInput, scorer({ factor: 2 })],
      ['a group and a predicate, the registry\'s sets as lists', { ...registry, predicates: [...registry.predicates], groups: [...(registry.groups ?? [])] }, (d) => {
        nodeOf(d, 'a').workerGroups = ['api']; edgesOf(d, 'a').unshift({ when: { predicate: 'isHighConfidence' }, to: 'split' });
      }],
    ];
    let ran = 0;
    for (const [what, reg, edit] of rows) {
      const d = base();
      edit(d);
      equal(rulesAgainst(d, reg), [], `${what}: validateDefinition accepts it (the premise)`);
      const s = definitionSchema(reg);
      if (!regAccepts(d, new Validator(s as never, '2020-12', true))) ok(false, `${what}: the registry form accepts it — refused: ${regExplain(d, s)}`);
      ran++;
    }
    equal(ran, 5, 'every row RAN');
    // The control on the same observer: the open schema still refuses a setting of the wrong type.
    const d = base(); scorer({ factor: 'x' })(d);
    ok(rulesAgainst(d, open).includes('FD-V33') && !regAccepts(d, new Validator(definitionSchema(open) as never, '2020-12', true)), 'the open schema still refuses factor "x", as the validator does');
  });

  test('W211 — a NEW object on every call, sharing nothing with another call NOR with the registry\'s own schemas', () => {
    const reach = (v: unknown, into: Set<object>) => {
      if (typeof v !== 'object' || v === null || into.has(v)) return;
      into.add(v);
      for (const x of Object.values(v)) reach(x, into);
    };
    const inA = new Set<object>();
    reach(definitionSchema(registry), inA);
    const inB = new Set<object>();
    reach(definitionSchema(registry), inB);
    equal([...inB].filter((o) => inA.has(o)).length, 0, 'no object is shared between two results');
    const inRegistry = new Set<object>();
    reach(registryDoc, inRegistry);
    reach(BUILT_IN_GATE_TYPES, inRegistry);
    ok(inRegistry.has(registryDoc.workers.scorer!.settingsSchema as object) && inRegistry.has(BUILT_IN_GATE_TYPES.distinct!.settingsSchema as object), 'the walk reached the registry\'s schemas (the control)');
    equal([...inA].filter((o) => inRegistry.has(o)).length, 0, 'and none with the registry or the built-in gate types it was built from');
    ok(inA.size > 150, `the walk reached the branches (${inA.size} objects)`);
  });

  test('W211 — it NEVER refuses what validateDefinition accepts against the same registry — every valid flow given each registered and unregistered name, each refusal of the registry form a refusal of the validator', async () => {
    const r = await registrySweep(validNames, regSchema, registry);
    equal(r.unsound, [], 'no document the validator accepts is refused by the registry form');
    ok(r.refused > 200 && r.accepted > 200, `both halves are populated (refused ${r.refused}, accepted ${r.accepted})`);
    // The POSITIVE CONTROL on the same observer: an over-strict copy — the groups without "api" — IS reported unsound.
    const strict = clone(regSchema) as unknown as DefinitionSchema & { $defs: { taskNode: { properties: { workerGroups: { items: { enum: string[] } } } } } };
    strict.$defs.taskNode.properties.workerGroups.items.enum = ['gpu'];
    const control = await registrySweep(['linear.flow.json'], strict, registry);
    ok(control.unsound.some((w) => w.includes('workerGroups = ["api","gpu"]')), `the over-strict copy is caught (unsound: ${JSON.stringify(control.unsound)})`);
  });

  test('W215 — Q774 resolved: a non-string join of and branch entry REFUSED by both forms and reported FD-V21 by the validator, with and without a region; each repaired to its string form ACCEPTED by both, the validator\'s verdict on that form unmoved', () => {
    // Expected values from spec/flow-definition.md v0.52's FD-V21 row and Q774's table, written before the first run:
    // each non-string value is FD-V21, naming `of` or `branches[i]`; the STRING form keeps its 0.11.0 verdict — the base's
    // `of: "split"` and `["b", "c"]` nothing, a region-less join's `of: "nowhere"` FD-V2 and FD-V6 (no FD-V21).
    const noRegion = (of: unknown): Doc => clone({
      flowId: 'q774', version: 1, entry: 'a',
      nodes: [
        { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j' }] },
        { id: 'j', kind: 'join', of, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    });
    const detailsOf = (d: Doc): string[] => validateDefinition(d as unknown as FlowDefinition, registry).filter((f) => f.rule === 'FD-V21').map((f) => f.detail);
    const rows: [string, Doc, Doc, string, string[]][] = [];
    for (const v of [null, 5, [], {}, true] as unknown[]) {
      const inRegion = base(); nodeOf(inRegion, 'join').of = v;
      rows.push([`a join of ${JSON.stringify(v)} closing a fanout`, inRegion, base(), 'join of must be a string', []]);
      rows.push([`a region-less join of ${JSON.stringify(v)}`, noRegion(v), noRegion('nowhere'), 'join of must be a string', ['FD-V2', 'FD-V6']]);
    }
    const mixed = base(); nodeOf(mixed, 'split').branches = ['b', 'c', 5];
    rows.push(['a fanout ["b", "c", 5]', mixed, base(), 'fanout branches[2] must be a string, got 5', []]);
    const nulled = base(); nodeOf(nulled, 'split').branches = [null, 'b', 'c'];
    rows.push(['a fanout [null, "b", "c"]', nulled, base(), 'fanout branches[0] must be a string, got null', []]);
    let run = 0;
    for (const [what, bad, repaired, detail, repairedRules] of rows) {
      ok(!accepts(bad), `${what}: refused by the static form`);
      ok(!regAccepts(bad), `${what}: refused by the registry form`);
      const ds = detailsOf(bad);
      equal(ds.length, 1, `${what}: exactly one FD-V21 finding (got ${JSON.stringify(ds)})`);
      ok(ds[0]!.startsWith(detail), `${what}: the finding names the key — "${ds[0]}" starts with "${detail}"`);
      if (!accepts(repaired)) ok(false, `${what}: its string form ACCEPTED by the static form — refused: ${explain(repaired)}`);
      if (!regAccepts(repaired)) ok(false, `${what}: its string form ACCEPTED by the registry form — refused: ${regExplain(repaired)}`);
      equal(rulesOf(repaired), repairedRules, `${what}: the string form's verdict is 0.11.0's (the control)`);
      run++;
    }
    equal(run, 12, 'five values in two places, and two branch lists');
    // **The CHARSET half — "held to the id charset unconditionally"** (W215's adequacy reader, SHOULD 2: `{ type: 'string' }`
    // survived): a STRING `of` or branch entry outside `[A-Za-z0-9_-]{1,64}` is refused by both forms, and the validator
    // refuses it too — FD-V2, since no node id can be outside the charset (FD-V16) — never FD-V21, which is the type's.
    const charset: [string, Doc][] = [];
    for (const s of ['a b', '', 'x'.repeat(65)]) {
      const o = base(); nodeOf(o, 'join').of = s; charset.push([`a join of ${JSON.stringify(s)}`, o]);
      const b = base(); nodeOf(b, 'split').branches = ['b', s]; charset.push([`a branch entry ${JSON.stringify(s)}`, b]);
    }
    for (const [what, d] of charset) {
      ok(!accepts(d), `${what}: refused by the static form`);
      ok(!regAccepts(d), `${what}: refused by the registry form`);
      ok(rulesOf(d).includes('FD-V2') && !rulesOf(d).includes('FD-V21'), `${what}: the validator refuses it FD-V2, not FD-V21 (got ${rulesOf(d).join(', ')})`);
    }
    equal(charset.length, 6, 'three strings outside the charset, at of and at a branch entry');
  });

  test('W215 — the two new corpus files, each repaired in its one clause, are VALID — no other finding (the repair names the right node)', async () => {
    // W215's adequacy reader, NIT (R1, R2): the generic REPAIRS case asks only that the file's own rule stops firing, so a
    // repair naming the WRONG node (`of: "scoreA"`, `["scoreA", "nowhere"]`) passed it. Both files are otherwise clean.
    const names = ['FD-V21--join-of-is-not-a-string.flow.json', 'FD-V21--fanout-branch-entry-is-not-a-string.flow.json'];
    for (const n of names) {
      const fixed = await load(`${EX}/invalid/${n}`);
      REPAIRS[n]!(fixed);
      equal(rulesOf(fixed), [], `${n}: repaired, validateDefinition reports nothing`);
      ok(accepts(fixed) && regAccepts(fixed), `${n}: repaired, both forms accept it`);
    }
  });

  test('the suite registered every case it declares', () => {
    equal(collected().filter((s) => s.suite === SUITE).reduce((n, s) => n + s.cases.length, 0), 27, 'fourteen of W210\'s, eleven of W211\'s and two of W215\'s');
  });
});

/**
 * **The JSON Schema draft 2020-12 META-SCHEMA, vendored for ONE test** — W210, P43 decision 3 and its Gate's *the schema a
 * valid 2020-12 document*. `@cfworker/json-schema` 4.1.1 ships no meta-schema, so the eight documents it is made of are
 * here, fetched from `https://json-schema.org/draft/2020-12/<name>` on 2026-10-23 and copied as DATA — every key and value
 * as published (the files are BSD-3-Clause / AFL-3.0, json-schema-org). Inside this suite, so W211 (which owns it) owns this too;
 * nothing under `src/` reads it, and no published file list names it. `metaValidator()` is the one place they are read, and the one place they are
 * changed — see there.
 */
/** The eight documents, the dialect's own `schema` first and its seven vocabularies after it, as published. */
const META_2020_12: readonly Readonly<Record<string, unknown>>[] = [
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://json-schema.org/draft/2020-12/schema",
    "$vocabulary": {
      "https://json-schema.org/draft/2020-12/vocab/core": true,
      "https://json-schema.org/draft/2020-12/vocab/applicator": true,
      "https://json-schema.org/draft/2020-12/vocab/unevaluated": true,
      "https://json-schema.org/draft/2020-12/vocab/validation": true,
      "https://json-schema.org/draft/2020-12/vocab/meta-data": true,
      "https://json-schema.org/draft/2020-12/vocab/format-annotation": true,
      "https://json-schema.org/draft/2020-12/vocab/content": true
    },
    "$dynamicAnchor": "meta",
    "title": "Core and Validation specifications meta-schema",
    "allOf": [
      {
        "$ref": "meta/core"
      },
      {
        "$ref": "meta/applicator"
      },
      {
        "$ref": "meta/unevaluated"
      },
      {
        "$ref": "meta/validation"
      },
      {
        "$ref": "meta/meta-data"
      },
      {
        "$ref": "meta/format-annotation"
      },
      {
        "$ref": "meta/content"
      }
    ],
    "type": [
      "object",
      "boolean"
    ],
    "$comment": "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.",
    "properties": {
      "definitions": {
        "$comment": "\"definitions\" has been replaced by \"$defs\".",
        "type": "object",
        "additionalProperties": {
          "$dynamicRef": "#meta"
        },
        "deprecated": true,
        "default": {}
      },
      "dependencies": {
        "$comment": "\"dependencies\" has been split and replaced by \"dependentSchemas\" and \"dependentRequired\" in order to serve their differing semantics.",
        "type": "object",
        "additionalProperties": {
          "anyOf": [
            {
              "$dynamicRef": "#meta"
            },
            {
              "$ref": "meta/validation#/$defs/stringArray"
            }
          ]
        },
        "deprecated": true,
        "default": {}
      },
      "$recursiveAnchor": {
        "$comment": "\"$recursiveAnchor\" has been replaced by \"$dynamicAnchor\".",
        "$ref": "meta/core#/$defs/anchorString",
        "deprecated": true
      },
      "$recursiveRef": {
        "$comment": "\"$recursiveRef\" has been replaced by \"$dynamicRef\".",
        "$ref": "meta/core#/$defs/uriReferenceString",
        "deprecated": true
      }
    }
  },
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://json-schema.org/draft/2020-12/meta/core",
    "$dynamicAnchor": "meta",
    "title": "Core vocabulary meta-schema",
    "type": [
      "object",
      "boolean"
    ],
    "properties": {
      "$id": {
        "$ref": "#/$defs/uriReferenceString",
        "$comment": "Non-empty fragments not allowed.",
        "pattern": "^[^#]*#?$"
      },
      "$schema": {
        "$ref": "#/$defs/uriString"
      },
      "$ref": {
        "$ref": "#/$defs/uriReferenceString"
      },
      "$anchor": {
        "$ref": "#/$defs/anchorString"
      },
      "$dynamicRef": {
        "$ref": "#/$defs/uriReferenceString"
      },
      "$dynamicAnchor": {
        "$ref": "#/$defs/anchorString"
      },
      "$vocabulary": {
        "type": "object",
        "propertyNames": {
          "$ref": "#/$defs/uriString"
        },
        "additionalProperties": {
          "type": "boolean"
        }
      },
      "$comment": {
        "type": "string"
      },
      "$defs": {
        "type": "object",
        "additionalProperties": {
          "$dynamicRef": "#meta"
        }
      }
    },
    "$defs": {
      "anchorString": {
        "type": "string",
        "pattern": "^[A-Za-z_][-A-Za-z0-9._]*$"
      },
      "uriString": {
        "type": "string",
        "format": "uri"
      },
      "uriReferenceString": {
        "type": "string",
        "format": "uri-reference"
      }
    }
  },
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://json-schema.org/draft/2020-12/meta/applicator",
    "$dynamicAnchor": "meta",
    "title": "Applicator vocabulary meta-schema",
    "type": [
      "object",
      "boolean"
    ],
    "properties": {
      "prefixItems": {
        "$ref": "#/$defs/schemaArray"
      },
      "items": {
        "$dynamicRef": "#meta"
      },
      "contains": {
        "$dynamicRef": "#meta"
      },
      "additionalProperties": {
        "$dynamicRef": "#meta"
      },
      "properties": {
        "type": "object",
        "additionalProperties": {
          "$dynamicRef": "#meta"
        },
        "default": {}
      },
      "patternProperties": {
        "type": "object",
        "additionalProperties": {
          "$dynamicRef": "#meta"
        },
        "propertyNames": {
          "format": "regex"
        },
        "default": {}
      },
      "dependentSchemas": {
        "type": "object",
        "additionalProperties": {
          "$dynamicRef": "#meta"
        },
        "default": {}
      },
      "propertyNames": {
        "$dynamicRef": "#meta"
      },
      "if": {
        "$dynamicRef": "#meta"
      },
      "then": {
        "$dynamicRef": "#meta"
      },
      "else": {
        "$dynamicRef": "#meta"
      },
      "allOf": {
        "$ref": "#/$defs/schemaArray"
      },
      "anyOf": {
        "$ref": "#/$defs/schemaArray"
      },
      "oneOf": {
        "$ref": "#/$defs/schemaArray"
      },
      "not": {
        "$dynamicRef": "#meta"
      }
    },
    "$defs": {
      "schemaArray": {
        "type": "array",
        "minItems": 1,
        "items": {
          "$dynamicRef": "#meta"
        }
      }
    }
  },
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://json-schema.org/draft/2020-12/meta/unevaluated",
    "$dynamicAnchor": "meta",
    "title": "Unevaluated applicator vocabulary meta-schema",
    "type": [
      "object",
      "boolean"
    ],
    "properties": {
      "unevaluatedItems": {
        "$dynamicRef": "#meta"
      },
      "unevaluatedProperties": {
        "$dynamicRef": "#meta"
      }
    }
  },
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://json-schema.org/draft/2020-12/meta/validation",
    "$dynamicAnchor": "meta",
    "title": "Validation vocabulary meta-schema",
    "type": [
      "object",
      "boolean"
    ],
    "properties": {
      "type": {
        "anyOf": [
          {
            "$ref": "#/$defs/simpleTypes"
          },
          {
            "type": "array",
            "items": {
              "$ref": "#/$defs/simpleTypes"
            },
            "minItems": 1,
            "uniqueItems": true
          }
        ]
      },
      "const": true,
      "enum": {
        "type": "array",
        "items": true
      },
      "multipleOf": {
        "type": "number",
        "exclusiveMinimum": 0
      },
      "maximum": {
        "type": "number"
      },
      "exclusiveMaximum": {
        "type": "number"
      },
      "minimum": {
        "type": "number"
      },
      "exclusiveMinimum": {
        "type": "number"
      },
      "maxLength": {
        "$ref": "#/$defs/nonNegativeInteger"
      },
      "minLength": {
        "$ref": "#/$defs/nonNegativeIntegerDefault0"
      },
      "pattern": {
        "type": "string",
        "format": "regex"
      },
      "maxItems": {
        "$ref": "#/$defs/nonNegativeInteger"
      },
      "minItems": {
        "$ref": "#/$defs/nonNegativeIntegerDefault0"
      },
      "uniqueItems": {
        "type": "boolean",
        "default": false
      },
      "maxContains": {
        "$ref": "#/$defs/nonNegativeInteger"
      },
      "minContains": {
        "$ref": "#/$defs/nonNegativeInteger",
        "default": 1
      },
      "maxProperties": {
        "$ref": "#/$defs/nonNegativeInteger"
      },
      "minProperties": {
        "$ref": "#/$defs/nonNegativeIntegerDefault0"
      },
      "required": {
        "$ref": "#/$defs/stringArray"
      },
      "dependentRequired": {
        "type": "object",
        "additionalProperties": {
          "$ref": "#/$defs/stringArray"
        }
      }
    },
    "$defs": {
      "nonNegativeInteger": {
        "type": "integer",
        "minimum": 0
      },
      "nonNegativeIntegerDefault0": {
        "$ref": "#/$defs/nonNegativeInteger",
        "default": 0
      },
      "simpleTypes": {
        "enum": [
          "array",
          "boolean",
          "integer",
          "null",
          "number",
          "object",
          "string"
        ]
      },
      "stringArray": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "uniqueItems": true,
        "default": []
      }
    }
  },
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://json-schema.org/draft/2020-12/meta/meta-data",
    "$dynamicAnchor": "meta",
    "title": "Meta-data vocabulary meta-schema",
    "type": [
      "object",
      "boolean"
    ],
    "properties": {
      "title": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "default": true,
      "deprecated": {
        "type": "boolean",
        "default": false
      },
      "readOnly": {
        "type": "boolean",
        "default": false
      },
      "writeOnly": {
        "type": "boolean",
        "default": false
      },
      "examples": {
        "type": "array",
        "items": true
      }
    }
  },
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://json-schema.org/draft/2020-12/meta/format-annotation",
    "$dynamicAnchor": "meta",
    "title": "Format vocabulary meta-schema for annotation results",
    "type": [
      "object",
      "boolean"
    ],
    "properties": {
      "format": {
        "type": "string"
      }
    }
  },
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://json-schema.org/draft/2020-12/meta/content",
    "$dynamicAnchor": "meta",
    "title": "Content vocabulary meta-schema",
    "type": [
      "object",
      "boolean"
    ],
    "properties": {
      "contentEncoding": {
        "type": "string"
      },
      "contentMediaType": {
        "type": "string"
      },
      "contentSchema": {
        "$dynamicRef": "#meta"
      }
    }
  }
];

/**
 * **A validator of SCHEMAS against the 2020-12 meta-schema.** One change from the published documents, and it is why this
 * function exists: every `"$dynamicRef": "#meta"` is read as `"$ref": "https://json-schema.org/draft/2020-12/schema"`.
 * Measured at W210's declaration step: cfworker 4.1.1 does not follow a `$dynamicRef` into a NESTED schema, so with the
 * documents as published `{ properties: { a: { type: "strin" } } }` and `{ $defs: { d: { enum: 3 } } }` were both ACCEPTED
 * while a top-level `{ type: 5 }` was refused. With no schema EXTENDING the meta-schema, the dynamic scope resolves
 * `#meta` to the dialect's own `schema` document, so the plain `$ref` names the same schema. The suite's control cases
 * are a nested defect refused, which is the measurement re-taken on every run.
 */
function metaValidator(): Validator {
  const read = (d: Readonly<Record<string, unknown>>): Record<string, unknown> => JSON.parse(
    JSON.stringify(d).split('"$dynamicRef":"#meta"').join('"$ref":"https://json-schema.org/draft/2020-12/schema"'),
  );
  const [main, ...vocabularies] = META_2020_12.map(read);
  const v = new Validator(main as never, '2020-12', false);
  for (const s of vocabularies) v.addSchema(s as never);
  return v;
}
