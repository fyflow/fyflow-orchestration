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
 */
import { Validator } from '@cfworker/json-schema';
import { collected, deepEqual, equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { definitionSchema, type DefinitionSchema } from '../../src/definition/definition-schema.ts';
import {
  DOC_KEYS_DECLARED, EDGE_KEYS_DECLARED, NODE_KEYS_DECLARED, NODE_KEYS_REQUIRED, PREDICATE_GROUP_KEYS, PREDICATE_LEAF_KEYS,
  PREDICATE_NAME_KEYS, RETRY_POLICY_KEYS, TRANSFORM_KEYS, KINDS, referenceTarget, validateDefinition,
} from '../../src/definition/validate.ts';
import { SCHEMA_KEYWORDS, SCHEMA_TYPES } from '../../src/definition/schema.ts';
import { PREDICATE_OPS } from '../../src/definition/types.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { corpusRegistry, type CorpusRegistryDocument } from './corpus-types.ts';

const SUITE = 'L1 — W210, ADR 0132: definitionSchema() — a valid 2020-12 document, the corpus accepted, every shape-only refusal beside its repair, never refusing what validateDefinition accepts';

const EX = `${ROOT}spec/examples`;
const registry = corpusRegistry(JSON.parse(await readText(`${EX}/registry.json`)) as CorpusRegistryDocument);
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
  'FD-V40--gate-key-path-with-an-index.flow.json',
];

/** Each refused file repaired in its ONE clause — hand-written from the file and the rule, never from a verdict. */
const REPAIRS: Record<string, (d: Doc) => void> = {
  'FD-V16--node-id-with-a-colon.flow.json': (d) => { nodeOf(d, 'score:v2').id = 'score-v2'; d.entry = 'score-v2'; },
  'FD-V17--unknown-key-on-an-edge.flow.json': (d) => { const e = edgesOf(d, 'score')[0]!; e.when = { predicate: e.whn }; delete e.whn; },
  'FD-V18--on-names-user-action.flow.json': (d) => { edgesOf(d, 'review')[0]!.on = ['failed']; nodeOf(d, 'review').optional = true; },
  'FD-V21--optional-is-not-a-boolean.flow.json': (d) => { nodeOf(d, 'extract').optional = true; },
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
  'FD-V40--gate-key-path-with-an-index.flow.json': (d) => { (nodeOf(d, 'dedupe').settings as Record<string, unknown>).key = 'files.series'; },
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
  ['a branch entry that is not a string (Q774)', (d) => { nodeOf(d, 'split').branches = ['b', 'c', 5]; }],
  ['a join of no region whose of is not a string (Q774)', (d) => {
    d.nodes = [
      { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j' }] },
      { id: 'j', kind: 'join', of: null, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ];
  }],
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
    const expectRefused = invalidNames.filter((n) => SHAPE_ONLY.includes(ruleOfFile(n)) || SHAPE_FILES_OF_OTHER_RULES.includes(n));
    equal(refused, expectRefused, 'the refused files are exactly the shape-only rules\' and the three named');
    equal(accepted, invalidNames.filter((n) => !expectRefused.includes(n)), 'and every other file is accepted');
    // Every name the two lists carry is a file on disk, and every shape-only rule has one — so neither list is vacuous.
    for (const n of SHAPE_FILES_OF_OTHER_RULES) ok(invalidNames.includes(n), `${n} is in the corpus`);
    for (const r of SHAPE_ONLY) ok(invalidNames.some((n) => ruleOfFile(n) === r), `${r} has a corpus file`);
  });

  test('each refused file, REPAIRED in its one clause, is ACCEPTED — and validateDefinition stops reporting its rule (the control)', async () => {
    const refusedNames = invalidNames.filter((n) => SHAPE_ONLY.includes(ruleOfFile(n)) || SHAPE_FILES_OF_OTHER_RULES.includes(n));
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
    equal(CLAUSES.length, 105, 'a hundred and one rows written and four generated (the ordering operators)');
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

  test('every value validateDefinition accepts INSIDE a node is accepted — each subset type and keyword, retryPolicy, version, on, length defaults, every operator, a non-string branch entry and join of (Q774)', () => {
    equal(ACCEPTS.length, 7 + 10 + 6 + 7 + 7, 'the seven types alone, ten subset rows, six more, the seven operators and seven more');
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

  test('the suite registered every case it declares', () => {
    equal(collected().filter((s) => s.suite === SUITE).reduce((n, s) => n + s.cases.length, 0), 14, 'fourteen cases');
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
