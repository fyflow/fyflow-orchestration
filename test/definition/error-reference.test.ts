/**
 * Ladder L1 — **`"n!error"` in the grammar: a `needs` reference naming a node's ERROR** — `spec/flow-definition.md` v0.49
 * (section 3's table, `FD-V26`'s `!` clauses, `FD-V27`-`FD-V29` aiming it as the plain reference, the wiring check's
 * `needs` arc), [ADR 0131](../../doc/decisions/0131-a-reference-may-name-a-nodes-error.md),
 * [P43](../../doc/plans/p43-what-a-flow-and-a-run-say-as-data-rather-than-as-prose.md) (c1), decision 5, fact 5;
 * [W209](../../doc/work-items/w209-a-reference-to-a-nodes-error.md).
 *
 * **Every expected value is written from those rows, never read off a run**: the four spellings parse to the plain
 * reference's object PLUS `part: 'error'`, and every spelling before v0.49 parses with NO `part` key (P43 prediction 3);
 * every malformed `!` spelling is `FD-V26` alone, its message naming the fix; `FD-V27`, `FD-V28` and `FD-V29` refuse the
 * error form exactly where they refuse the plain one — each beside the plain form's same verdict — and their fixes spell
 * the reference as written; a node id can never be read as the form (`FD-V16`); and the wiring check composes the key as
 * a string-or-null with a STRING sample, whatever the producer declares. Each claim sits beside a CONTROL.
 */
import { collected, equal, ok, readText, ROOT, suite, listDir } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { referenceTarget, validateDefinition } from '../../src/definition/validate.ts';
import { checkWiring } from '../../src/definition/wiring.ts';
import type { FlowDefinition, JsonSchema } from '../../src/definition/types.ts';
import { CORPUS_LANGUAGES, corpusRegistry, type CorpusRegistryDocument } from './corpus-types.ts';

const SUITE = 'L1 — W209, ADR 0131: "n!error" in the grammar — referenceTarget`s part, FD-V26`s "!" clauses at both sites, FD-V27 to FD-V29 as the plain form, and the wiring check`s string';

const REGISTRY = { predicates: ['isLowConfidence'], ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker', 'ReviewWorker']) };
const doc = (nodes: unknown[], entry = 'ingest'): FlowDefinition =>
  ({ flowId: 'error-reference', version: 1, entry, nodes } as unknown as FlowDefinition);
const findingsOf = (d: FlowDefinition) => validateDefinition(d, REGISTRY);
const rulesOf = (d: FlowDefinition) => [...new Set(findingsOf(d).map((f) => f.rule))].sort();
const END = { id: 'done', kind: 'end', outcome: 'completed' };

/** `ingest -> subject -> done`, `subject` declaring `needs` — `ingest` certain for it, one output. */
const atNode = (needs: unknown) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', optional: true, edges: [{ on: ['done', 'failed'], to: 'subject' }] },
  { id: 'subject', kind: 'task', type: 'ScoreWorker', needs, edges: [{ to: 'done' }] },
  END,
]);
/** The same, the `needs` on `subject`'s GUARDED edge. */
const atEdge = (needs: unknown) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', optional: true, edges: [{ on: ['done', 'failed'], to: 'subject' }] },
  { id: 'subject', kind: 'task', type: 'ScoreWorker',
    edges: [{ when: { path: 'needs.why', op: 'eq', value: null }, to: 'review', needs }, { to: 'done' }] },
  { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'done' }] },
  END,
]);

/**
 * A MAP region and a DECISION in one document, for `FD-V28` and `FD-V29`: `ingest` routes to `review` on a predicate and
 * to `split` otherwise; `split` maps `score` -> `note` -> `collect`; `publish` follows the join and `review`.
 * `reader` is `note` (INSIDE the instance) or `publish` (outside it, after the join).
 */
const shaped = (reader: 'note' | 'publish', needs: unknown) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ when: { predicate: 'isLowConfidence' }, to: 'review' }, { to: 'split' }] },
  { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'split' }] },
  { id: 'split', kind: 'map', over: 'items', branch: 'score' },
  { id: 'score', kind: 'task', type: 'ScoreWorker', optional: true, edges: [{ on: ['done', 'failed'], to: 'note' }] },
  { id: 'note', kind: 'task', type: 'ScoreWorker', ...(reader === 'note' ? { needs } : {}), edges: [{ to: 'collect' }] },
  { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
  { id: 'publish', kind: 'task', type: 'PublishWorker', ...(reader === 'publish' ? { needs } : {}), edges: [{ to: 'done' }] },
  END,
]);

const DECLARED_CASES = [
  'referenceTarget parses the four spellings to the plain reference PLUS part: "error", and every other spelling with NO part key',
  'no spelling in either corpus before v0.49 carries a part, and the new corpus flow`s "!error" references each do',
  'FD-V26 refuses each malformed "!" spelling at a NODE, alone, and its message names the fix',
  'and at an EDGE, by the same clauses, the edge`s "." clause unmoved beside them',
  'a node id can never be read as the form — "!" is FD-V16 in an id — and an id spelled like the part parses with no part',
  'FD-V27 refuses the error form exactly where it refuses the plain one — no such node, a map, downstream — beside the plain form`s same verdict',
  'FD-V28 asks HOW MANY of the error form as of the plain one, inside and outside a map, and its fix spells "!error"',
  'FD-V29 asks MUST IT HAVE RUN of the error form as of the plain one, and its fix spells "!error?"; the "?" form is accepted',
  'the error form is ACCEPTED on a task`s, an ask`s, a map`s and an edge`s needs — and the corpus flow validates clean',
  'checkWiring: a "!error" key composes as string-or-null with a STRING sample, CHECKED even where the producer declares nothing',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('referenceTarget parses the four spellings to the plain reference PLUS part: "error", and every other spelling with NO part key', () => {
    equal(referenceTarget('lookup!error'), { form: 'one', node: 'lookup', conditional: false, part: 'error' }, '"lookup!error" — one, the node, part error');
    equal(referenceTarget('lookup!error?'), { form: 'one', node: 'lookup', conditional: true, part: 'error' }, '"lookup!error?" — conditional, the "?" last');
    equal(referenceTarget(['lookup!error']), { form: 'all', node: 'lookup', conditional: false, part: 'error' }, '["lookup!error"] — the array form');
    equal(referenceTarget(['lookup!error?']), { form: 'all', node: 'lookup', conditional: true, part: 'error' }, '["lookup!error?"] — both');
    // The CONTROLS — the plain spellings, whose objects carry no `part` key at all (`equal` compares key sets too, and
    // the explicit key check below is the second observer).
    const plain: [unknown, unknown][] = [
      ['lookup', { form: 'one', node: 'lookup', conditional: false }],
      ['lookup?', { form: 'one', node: 'lookup', conditional: true }],
      [['lookup'], { form: 'all', node: 'lookup', conditional: false }],
      [['lookup?'], { form: 'all', node: 'lookup', conditional: true }],
      ['.', { form: 'self', node: null, conditional: false }],
      ['$payload', { form: 'payload', node: null, conditional: false }],
      ['$item', { form: 'item', node: null, conditional: false }],
    ];
    let ran = 0;
    for (const [v, want] of plain) {
      ran++;
      const got = referenceTarget(v);
      equal(got, want, `${JSON.stringify(v)} parses as it did before v0.49`);
      ok(got !== null && !('part' in got), `${JSON.stringify(v)} carries NO part key — P43 prediction 3`);
    }
    equal(ran, plain.length, 'the LOOP ran every control');
  });

  test('no spelling in either corpus before v0.49 carries a part, and the new corpus flow`s "!error" references each do', async () => {
    const dirs = [`${ROOT}spec/examples/valid`, `${ROOT}spec/examples/invalid`, `${ROOT}spec/examples/wiring`, `${ROOT}examples/flows`];
    let refs = 0, errorRefs = 0;
    const withPart: string[] = [];
    for (const dir of dirs) {
      for (const n of (await listDir(dir)).filter((x) => x.endsWith('.flow.json'))) {
        const d = JSON.parse(await readText(`${dir}/${n}`)) as { nodes?: Record<string, unknown>[] };
        const scan = (needs: unknown) => {
          if (typeof needs !== 'object' || needs === null || Array.isArray(needs)) return;
          for (const ref of Object.values(needs)) {
            refs++;
            const t = referenceTarget(ref);
            if (t !== null && 'part' in t) withPart.push(`${n}:${JSON.stringify(ref)}`);
            if (JSON.stringify(ref).includes('!error')) errorRefs++;
          }
        };
        for (const node of d.nodes ?? []) {
          scan(node?.needs);
          for (const e of (Array.isArray(node?.edges) ? node.edges : []) as Record<string, unknown>[]) scan(e?.needs);
        }
      }
    }
    ok(refs > 40, `the four corpora were walked — ${refs} references`);
    // The ONLY references with a part are the new flow's two — W209's own — written by hand from the flow file.
    equal(withPart.sort(), ['ask-after-a-failure.flow.json:"lookup!error"', 'ask-after-a-failure.flow.json:"lookup!error"'],
      'exactly the two "lookup!error" keys of ask-after-a-failure.flow.json carry part — no earlier spelling parses as the form');
    // The invalid files' malformed "!" spellings contain "!error" too and parse to null — a second observer on the walk.
    equal(errorRefs, 4, 'and four spellings mention "!error" at all: those two, "lookup?!error" and "!error" (refused, below)');
  });

  test('FD-V26 refuses each malformed "!" spelling at a NODE, alone, and its message names the fix', () => {
    const cases: [unknown, string][] = [
      ['ingest?!error', 'carries "?" before "!error", and the suffix goes last: write "ingest!error?"'],
      [['ingest?!error'], 'carries "?" before "!error", and the suffix goes last: write ["ingest!error?"]'],
      ['ingest?!error?', 'the suffix goes last: write "ingest!error?"'],
      ['!error', 'names no node before "!": write the node whose error you mean first, as "<node>!error"'],
      ['!error?', 'as "<node>!error?"'],
      ['ingest!err?', 'write "ingest!error?", or "ingest?" for its result'],
      ['ingest!err', "names \"err\" after \"!\", and the one part of a node's outcome a reference may name is its error: write \"ingest!error\", or \"ingest\" for its result"],
      ['ingest!result', 'names "result" after "!"'],
      ['ingest!', 'names "" after "!"'],
      ['ingest!error!error', 'names "error!error" after "!"'],
      [['ingest!Error'], 'write ["ingest!error"], or ["ingest"] for its result'],
    ];
    let ran = 0;
    for (const [v, fix] of cases) {
      ran++;
      equal(referenceTarget(v), null, `${JSON.stringify(v)} is not a reference`);
      const f = findingsOf(atNode({ why: v }));
      equal(f.map((x) => x.rule), ['FD-V26'], `${JSON.stringify(v)} at a node: FD-V26, alone`);
      ok(f[0]!.detail.includes(fix), `${JSON.stringify(v)}: the message names the fix ${JSON.stringify(fix)} — got ${f[0]!.detail}`);
    }
    equal(ran, cases.length, 'the LOOP ran every spelling');
    // The CONTROL: a malformed spelling with no "!" is still the GENERIC message, which now names the part.
    const generic = findingsOf(atNode({ why: 'a b' }))[0]!;
    ok(generic.rule === 'FD-V26' && generic.detail.includes('an optional "!error" and an optional "?" suffix') && !generic.detail.includes('after "!"'),
      `a spelling with no "!" takes the generic message, naming the part — got ${generic.detail}`);
    // **A fix is offered only where the text before "!" IS a node id** (the adequacy reader's B5): "ingest?!err" is wrong
    // twice, and a part-clause fix would read `write "ingest?!error"` — itself refused. It takes the generic message.
    const twice = findingsOf(atNode({ why: 'ingest?!err' }));
    equal(twice.map((x) => x.rule), ['FD-V26'], '"ingest?!err": FD-V26, alone');
    ok(twice[0]!.detail.includes('which is not "." ') && !twice[0]!.detail.includes('write "ingest?'),
      `and the generic message, never a fix that is itself refused — got ${twice[0]!.detail}`);
    // And "$..!error" is the "$" clause's, not this one's: the "$" prefix is reserved whatever follows.
    ok(findingsOf(atNode({ why: '$payload!error' }))[0]!.detail.includes('the "$" prefix is reserved'), 'a "$" spelling with "!" is dollarProblem`s');
  });

  test('and at an EDGE, by the same clauses, the edge`s "." clause unmoved beside them', () => {
    const cases: [unknown, string][] = [
      ['ingest?!error', 'write "ingest!error?"'],
      ['!error', 'names no node before "!"'],
      ['ingest!err', 'write "ingest!error", or "ingest" for its result'],
    ];
    for (const [v, fix] of cases) {
      const f = findingsOf(atEdge({ why: v }));
      equal(f.map((x) => x.rule), ['FD-V26'], `${JSON.stringify(v)} on an edge: FD-V26, alone`);
      ok(f[0]!.detail.startsWith('edge needs["why"]: ') && f[0]!.detail.includes(fix), `the edge message names the fix — got ${f[0]!.detail}`);
      equal(f[0]!.at, 'subject#edge0', 'at the edge');
    }
    // The CONTROL on the same edge: the well-formed error form is accepted there, and "." is still refused.
    equal(rulesOf(atEdge({ why: 'ingest!error' })), [], '"ingest!error" on an edge: accepted');
    ok(findingsOf(atEdge({ why: '.' }))[0]!.detail.includes('which an EDGE may not use'), '"." on an edge: still its own clause');
    // And the edge's GENERIC message names the part too (the adequacy reader's B12): a spelling with no "!".
    const generic = findingsOf(atEdge({ why: 'a b' }))[0]!;
    ok(generic.rule === 'FD-V26' && generic.detail.startsWith('edge needs["why"] is "a b"') && generic.detail.includes('an optional "!error" and an optional "?" suffix'),
      `the edge's generic message names the part — got ${generic.detail}`);
  });

  test('a node id can never be read as the form — "!" is FD-V16 in an id — and an id spelled like the part parses with no part', () => {
    const d = doc([
      { id: 'ingest!error', kind: 'task', type: 'IngestWorker', edges: [{ to: 'done' }] },
      END,
    ], 'ingest!error');
    ok(rulesOf(d).includes('FD-V16'), `a node called "ingest!error" is FD-V16 — got ${rulesOf(d).join()}`);
    // Ids that LOOK like the part are plain ids, read as the node, never the form.
    equal(referenceTarget('error'), { form: 'one', node: 'error', conditional: false }, '"error" is a node id');
    equal(referenceTarget('ingesterror'), { form: 'one', node: 'ingesterror', conditional: false }, '"ingesterror" is a node id — no "!"');
    equal(referenceTarget('ingest_error?'), { form: 'one', node: 'ingest_error', conditional: true }, '"ingest_error?" is a node id with "?"');
  });

  test('FD-V27 refuses the error form exactly where it refuses the plain one — no such node, a map, downstream — beside the plain form`s same verdict', () => {
    const pair = (plain: string, error: string, build: (ref: string) => FlowDefinition, want: string[], msg: string) => {
      const a = findingsOf(build(plain)).filter((f) => f.rule === 'FD-V27');
      const b = findingsOf(build(error)).filter((f) => f.rule === 'FD-V27');
      equal(rulesOf(build(plain)), want, `${msg}: the plain form ${JSON.stringify(plain)}`);
      equal(rulesOf(build(error)), want, `${msg}: the error form ${JSON.stringify(error)}, the same verdict`);
      equal(b.map((f) => f.detail), a.map((f) => f.detail), `${msg}: the same message — FD-V27 names the NODE`);
    };
    pair('nope', 'nope!error', (r) => atNode({ why: r }), ['FD-V27'], 'no such node');
    pair('split', 'split!error', (r) => shaped('publish', { why: r }), ['FD-V27'], 'a map — only a task or an ask produces an output');
    pair('publish', 'publish!error', (r) => shaped('note', { why: r }), ['FD-V27'], 'downstream — not reachable from it');
    // The CONTROL: the same document naming an upstream task in the right form is accepted in both forms.
    equal([rulesOf(atNode({ why: 'ingest' })), rulesOf(atNode({ why: 'ingest!error' }))], [[], []], 'an upstream task: accepted, both forms');
  });

  test('FD-V28 asks HOW MANY of the error form as of the plain one, inside and outside a map, and its fix spells "!error"', () => {
    // OUTSIDE the map (publish, after the join): `score` produces one output per item — the array form is legal.
    equal(rulesOf(shaped('publish', { e: ['score!error?'] })), [], 'outside: ["score!error?"] accepted');
    equal(rulesOf(shaped('publish', { e: ['score?'] })), [], 'outside: ["score?"] accepted — the plain twin');
    const outOne = findingsOf(shaped('publish', { e: 'score!error?' })).filter((f) => f.rule === 'FD-V28');
    equal(outOne.length, 1, 'outside: "score!error?" is FD-V28');
    ok(outOne[0]!.detail.includes('names "score!error" as one value') && outOne[0]!.detail.endsWith('write ["score!error"]'), `its fix spells the error form — got ${outOne[0]!.detail}`);
    equal(rulesOf(shaped('publish', { e: 'score?' })), ['FD-V28'], 'and "score?" the same rule — the plain twin');
    // INSIDE the instance (note): `score` produces exactly one output on note's path.
    equal(rulesOf(shaped('note', { e: 'score!error' })), [], 'inside: "score!error" accepted');
    const inAll = findingsOf(shaped('note', { e: ['score!error'] })).filter((f) => f.rule === 'FD-V28');
    equal(inAll.length, 1, 'inside: ["score!error"] is FD-V28');
    ok(inAll[0]!.detail.includes('names ["score!error"] as a list') && inAll[0]!.detail.endsWith('write "score!error"'), `its fix spells the error form — got ${inAll[0]!.detail}`);
    equal(rulesOf(shaped('note', { e: ['score'] })), ['FD-V28'], 'and ["score"] the same rule — the plain twin');
    // The plain form's message is UNMOVED — byte for byte what it said before v0.49.
    equal(findingsOf(shaped('note', { e: ['score'] })).find((f) => f.rule === 'FD-V28')!.detail,
      'needs["e"] names ["score"] as a list, but it produces exactly one output on this node\'s branch path; write "score"', 'the plain message, unmoved');
  });

  test('FD-V29 asks MUST IT HAVE RUN of the error form as of the plain one, and its fix spells "!error?"; the "?" form is accepted', () => {
    // `review` is routed around by ingest's decision, so publish may be reached without it.
    const e = findingsOf(shaped('publish', { e: 'review!error' })).filter((f) => f.rule === 'FD-V29');
    equal(e.length, 1, '"review!error" — FD-V29');
    ok(e[0]!.detail.includes('names "review!error" unconditionally') && e[0]!.detail.includes('Write "review!error?" if you mean'), `its fix spells "review!error?" — got ${e[0]!.detail}`);
    equal(rulesOf(shaped('publish', { e: 'review' })), ['FD-V29'], 'the plain twin "review": FD-V29 too');
    equal(rulesOf(shaped('publish', { e: 'review!error?' })), [], '"review!error?" — the "?" exempts it, as it exempts "review?"');
    equal(rulesOf(shaped('publish', { e: 'review?' })), [], 'and "review?" — the plain twin');
    // The CONTROL: `ingest` is certain for publish, so its error form needs no "?".
    equal(rulesOf(shaped('publish', { e: 'ingest!error' })), [], '"ingest!error" — certain, accepted');
    // The plain message is UNMOVED.
    ok(findingsOf(shaped('publish', { e: 'review' })).find((f) => f.rule === 'FD-V29')!.detail.includes('names "review" unconditionally, and a run can reach this node without "review" having run') &&
      findingsOf(shaped('publish', { e: 'review' })).find((f) => f.rule === 'FD-V29')!.detail.includes('Write "review?" if you mean'), 'the plain message spells "review?", as before');
  });

  test('the error form is ACCEPTED on a task`s, an ask`s, a map`s and an edge`s needs — and the corpus flow validates clean', async () => {
    equal(rulesOf(atNode({ why: 'ingest!error', also: 'ingest' })), [], 'a task`s needs, beside the plain form');
    equal(rulesOf(atEdge({ why: 'ingest!error?' })), [], 'an edge`s needs, with "?"');
    const ask = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', optional: true, edges: [{ on: ['failed'], to: 'ask' }, { to: 'done' }] },
      { id: 'ask', kind: 'ask', needs: { why: 'ingest!error' }, edges: [{ to: 'done' }] },
      END,
    ]);
    equal(rulesOf(ask), [], 'an ask`s needs after a failure edge — pass 4 #2`s shape');
    const map = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', optional: true, edges: [{ on: ['done', 'failed'], to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'score', needs: { items: 'ingest', why: 'ingest!error' } },
      { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      END,
    ]);
    equal(rulesOf(map), [], 'a map`s needs');
    const corpus = JSON.parse(await readText(`${ROOT}spec/examples/valid/ask-after-a-failure.flow.json`)) as FlowDefinition;
    const registry = corpusRegistry(JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as CorpusRegistryDocument);
    equal(validateDefinition(corpus, registry).map((f) => f.rule), [], 'ask-after-a-failure.flow.json: no findings');
    // The CONTROL on the same corpus registry: its "!error" spelled wrong is refused there.
    const broken = { ...corpus, nodes: corpus.nodes.map((n) => (n.id === 'resolve' ? { ...n, needs: { why: 'lookup!err' } } : n)) } as FlowDefinition;
    equal(validateDefinition(broken, registry).map((f) => f.rule), ['FD-V26'], 'and "lookup!err" in its place is FD-V26');
  });

  test('checkWiring: a "!error" key composes as string-or-null with a STRING sample, CHECKED even where the producer declares nothing', async () => {
    const OUT: JsonSchema = { type: 'object', required: ['amount'], properties: { amount: { type: 'number' } }, additionalProperties: false, examples: [{ amount: 3 }] };
    const wantString: JsonSchema = { type: 'object', required: ['why'], properties: { why: { type: ['string', 'null'] } } };
    const wantObject: JsonSchema = { type: 'object', required: ['why'], properties: { why: { type: 'object' } } };
    const registry = (inputSchema: JsonSchema, outputSchema?: JsonSchema) => ({
      workers: { p: { url: 'test://p', ...(outputSchema ? { outputSchema } : {}) }, c: { url: 'test://c', inputSchema } },
      nodeTypes: { P: { worker: 'p' }, C: { worker: 'c' } },
      languages: CORPUS_LANGUAGES,
    });
    const flow = (needs: unknown, transform?: unknown): FlowDefinition => ({
      flowId: 'wire', version: 1, entry: 'p',
      nodes: [
        { id: 'p', kind: 'task', type: 'P', optional: true, edges: [{ on: ['done', 'failed'], to: 'c' }] },
        { id: 'c', kind: 'task', type: 'C', needs, ...(transform ? { transform } : {}), edges: [{ to: 'done' }] },
        END,
      ],
    } as unknown as FlowDefinition);
    const at = async (r: ReturnType<typeof registry>, needs: unknown, transform?: unknown) =>
      (await checkWiring(r as never, flow(needs, transform))).verdicts.find((v) => v.consumer === 'c')!;
    const fits = await at(registry(wantString, OUT), { why: 'p!error' });
    equal([fits.shape, fits.kind], ['needs', 'fits'], 'a consumer wanting a string-or-null: FITS');
    // The SAMPLE is what a transform is handed — so a transformed consumer is where the verdict carries it (ADR 0056).
    const sampled = await at(registry({ type: 'string' }, OUT), { why: 'p!error', got: 'p' }, { lang: 'path', expr: 'why' });
    equal(sampled.kind, 'transform-passes', 'a transform picking `why` for a STRING consumer passes — the sample under the key is a string');
    equal(sampled.sample?.value, { why: '', got: { amount: 3 } }, 'the composed sample: the error key the witness `""`, the plain key beside it the producer`s EXAMPLE');
    equal(sampled.sample?.result, '', 'and the transform`s result is that string');
    // **And the verdict SAYS it rests on a witness** (Q301; the adequacy reader's E6): the error key's `''` is no example.
    equal(sampled.sample?.source, 'witness', 'the sample`s source is `witness` — the error key`s value is the schema`s witness');
    const exampleOnly = await at(registry({ type: 'object' }, OUT), { got: 'p' }, { lang: 'path', expr: 'got' });
    equal(exampleOnly.sample?.source, 'example', 'the CONTROL: the plain key alone rests on the producer`s EXAMPLE — the observer can see the difference');
    const sampledPlain = await at(registry({ type: 'string' }, OUT), { why: 'p' }, { lang: 'path', expr: 'why' });
    equal(sampledPlain.kind, 'transform-fails', 'the CONTROL: the plain "p" under the same key hands the transform an OBJECT, which the string consumer refuses');
    const no = await at(registry(wantObject, OUT), { why: 'p!error' });
    equal(no.kind, 'no', 'a consumer wanting an OBJECT under the key: NO — the error is never the producer`s result');
    // The CONTROL: the plain form under the same key composes the producer's OBJECT, so the two consumers swap verdicts.
    equal((await at(registry(wantObject, OUT), { why: 'p' })).kind, 'fits', 'the plain "p" fits the object-wanting consumer');
    equal((await at(registry(wantString, OUT), { why: 'p' })).kind, 'no', 'and not the string-wanting one');
    // A producer declaring NO output schema: the plain form is unchecked, the error form still checked.
    equal((await at(registry(wantString), { why: 'p' })).kind, 'unchecked', 'no producer schema: "p" UNCHECKED');
    equal((await at(registry(wantString), { why: 'p!error' })).kind, 'fits', 'and "p!error" still FITS — its schema is the error`s, not the producer`s');
    // The array and "?" forms: an array of string-or-null, and the key not required.
    const wantArray: JsonSchema = { type: 'object', properties: { why: { type: 'array', items: { type: 'string' } } } };
    const arr = await at(registry(wantArray, OUT), { why: ['p!error?'] });
    equal(arr.kind, 'no', 'the array form composes an array of string-OR-NULL, which a consumer wanting strings alone refuses');
    const wantArrayOrNull: JsonSchema = { type: 'object', properties: { why: { type: 'array', items: { type: ['string', 'null'] } } } };
    equal((await at(registry(wantArrayOrNull, OUT), { why: ['p!error?'] })).kind, 'fits', 'and a consumer wanting string-or-null items FITS');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
