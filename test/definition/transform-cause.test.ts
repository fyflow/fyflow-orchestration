/**
 * **L1 — `cause` on a `transform-fails` verdict** — `spec/flow-definition.md` v0.48's verdict table,
 * [W208](../../doc/work-items/w208-a-transforms-cause-and-when-an-ask-was-asked.md), P43 (d1), decision 6, fact 4.
 *
 * Expected values from the spec's row and P43 decision 6, by hand: `'threw'` where the transform produced no result — its
 * language's worker half failing to IMPORT, having NO DEFAULT export, its `compile` THROWING, or its `evaluate` THROWING
 * (the four roads of `judgeTransform`'s `catch`) — and `'schema'` where it produced one the consumer's `inputSchema`
 * refused; ABSENT on `fits`, `no`, `transform-passes` and `unchecked`. Each road reached through `tryTransform` with no
 * input (the arcs — `checkWiring` itself), through `tryTransform` WITH an input (`givenVerdict`, the given road) and
 * through `checkWiring` called directly on the flow carrying the transform: the two callers of the one evaluation.
 *
 * **Every claim of ABSENCE beside its CONTROL on the same observer** (P43's brief): the same `'cause' in v` read on a
 * `transform-fails` verdict of the same call is `true`. **`why` UNMOVED**: each reason is the pre-W208 wording, written
 * here from `AGENTS.md` section 15's printed lines and `judgeTransform`'s two templates, never from a run.
 */
import { collected, equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { tryTransform } from '../../src/definition/assist.ts';
import { checkWiring, givenVerdict, VERDICT_KINDS, type WiringVerdict } from '../../src/definition/wiring.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { SESSION_REGISTRY, SESSION_WORKERS } from '../../examples/getting-started/session-registry.ts';
import { CORPUS_LANGUAGES, type CorpusRegistryDocument } from './corpus-types.ts';
import compileExpression, { jsonata } from '../../src/jsonata/index.ts';

const SUITE = 'L1 — W208, P43 (d1): `cause` on a transform-fails verdict — threw on each of the catch`s four roads, schema on a finding, absent on every other kind, why unmoved';

const EX = `${ROOT}spec/examples`;
const wiringDoc = JSON.parse(await readText(`${EX}/wiring/registry.json`)) as CorpusRegistryDocument;
const wiringRegistry = { workers: wiringDoc.workers, nodeTypes: wiringDoc.nodeTypes, languages: CORPUS_LANGUAGES };
const wiringNames = (await listDir(`${EX}/wiring`)).filter((n) => n.endsWith('.flow.json')).sort();

/** The session's two-node flow (`AGENTS.md` section 15): `read` (lines) -> `sum` (requires `text`, a string). */
const FLOW: FlowDefinition = {
  flowId: 'w208-cause', version: 1, entry: 'read',
  nodes: [
    { id: 'read', kind: 'task', type: 'Reader', edges: [{ to: 'sum' }] },
    { id: 'sum', kind: 'task', type: 'Summarise', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;
const withTransform = (lang: string, expr: string): FlowDefinition => ({
  ...FLOW, nodes: FLOW.nodes.map((n) => (n.id === 'sum' ? { ...n, transform: { lang, expr } } : n)),
} as unknown as FlowDefinition);

/**
 * The four roads' LANGUAGES, each with a worker URL of its own. A `data:` URL that THROWS on evaluation is an import that
 * fails everywhere, the browser included (W74's A10 measured a `file:///` one reported as a page error there); one that
 * exports only `x` imports and has no default.
 */
const THROWING_URL = 'data:text/javascript,throw new Error(%22w208: this worker half refuses to load%22)';
const NO_DEFAULT_URL = 'data:text/javascript,export const x = 1;';
const stub = (worker: string) => ({ compile: (e: string) => ({ evaluate: () => Promise.resolve(e) }), worker });
const LANGUAGES = {
  jsonata,
  unloadable: stub(THROWING_URL),
  nodefault: stub(NO_DEFAULT_URL),
  compilethrows: stub(THROWING_URL),
  evalthrows: stub(THROWING_URL),
};
const registry = { workers: SESSION_WORKERS, nodeTypes: SESSION_REGISTRY.nodeTypes, languages: LANGUAGES } as unknown as Parameters<typeof checkWiring>[0];
/** The handed worker halves (ADR 0052 rule 8): jsonata's for the browser, and the two that throw where they are called. */
const OPTS = {
  workerHalf: {
    jsonata: compileExpression,
    compilethrows: () => { throw new Error('w208: compile refuses'); },
    evalthrows: () => ({ evaluate: () => { throw new Error('w208: evaluate refuses'); } }),
  },
} as unknown as Parameters<typeof checkWiring>[2];

/** The sample `sum` is handed: the Reader's declared example (Q301). */
const EXAMPLE = SESSION_WORKERS.reader.outputSchema.examples[0];

type Road = { name: string; lang: string; expr: string; message: string | RegExp };
const THREW: Road[] = [
  { name: 'its worker half does not IMPORT', lang: 'unloadable', expr: 'x', message: /w208: this worker half refuses to load/ },
  { name: 'its worker half has NO DEFAULT export', lang: 'nodefault', expr: 'x', message: 'the worker half of language "nodefault" has no default export, and none was handed in' },
  { name: 'its compile THROWS', lang: 'compilethrows', expr: 'x', message: 'w208: compile refuses' },
  { name: 'its evaluate THROWS', lang: 'evalthrows', expr: 'x', message: 'w208: evaluate refuses' },
  { name: 'the engine refuses the expression (a compile throw, jsonata)', lang: 'jsonata', expr: '{{{', message: /./ },
];
const matches = (s: string, m: string | RegExp) => (typeof m === 'string' ? s === m : m.test(s));

/** The three roads into the one evaluation: the arcs through tryTransform, the given input, and checkWiring direct. */
async function threeRoads(lang: string, expr: string): Promise<[string, WiringVerdict][]> {
  const arcs = await tryTransform(registry, FLOW, 'sum', { lang, expr }, OPTS);
  const given = await givenVerdict(registry, withTransform(lang, expr), 'sum', EXAMPLE, OPTS);
  const direct = (await checkWiring(registry, withTransform(lang, expr), OPTS)).verdicts.filter((v) => v.consumer === 'sum');
  equal([arcs.length, given.length, direct.length], [1, 1, 1], `${lang}: ONE verdict on each road — the arrangement`);
  return [['tryTransform (the arcs)', arcs[0]!], ['givenVerdict (the given input)', given[0]!], ['checkWiring', direct[0]!]];
}

const DECLARED_CASES = [
  '`threw` on each of the catch`s roads — no import, no default export, a compile throw, an evaluate throw, and the engine`s own refusal — through tryTransform, givenVerdict and checkWiring alike, why unmoved',
  '`schema` on a finding — the discriminating pair`s failing half — on all three roads, why unmoved, and the passing half carrying no cause',
  'absent on fits, no, transform-passes and unchecked across the wiring corpus, each beside the corpus`s own transform-fails carrying `schema` (P43 prediction 2)',
  'unchecked carries no cause — a language the registry lacks, a consumer with no inputSchema — and VERDICT_KINDS and the counts are unmoved',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, async () => {
    for (const road of THREW) {
      for (const [where, v] of await threeRoads(road.lang, road.expr)) {
        equal([v.kind, v.cause], ['transform-fails', 'threw'], `${road.name}, ${where}: transform-fails, cause threw`);
        const source = where.startsWith('givenVerdict') ? 'given input' : 'example';
        const msg = String(v.sample?.result);
        ok(matches(msg, road.message), `${road.name}, ${where}: the sample's result is the throw's message — ${msg}`);
        // `why` UNMOVED: `judgeTransform`'s catch template, word for word, around the same message.
        equal(v.why, `the transform threw on the ${source}: ${msg}`, `${road.name}, ${where}: why is the pre-W208 wording`);
      }
    }
  });

  test(DECLARED_CASES[1]!, async () => {
    for (const [where, v] of await threeRoads('jsonata', '{ "text": lines }')) {
      const source = where.startsWith('givenVerdict') ? 'given input' : 'example';
      equal([v.kind, v.cause], ['transform-fails', 'schema'], `${where}: an array under a key the consumer types string — cause schema`);
      // `AGENTS.md` section 15 prints this line (`:4063`): the finding's wording is unmoved.
      equal(v.why, `the transform's result on the ${source} fails the consumer's inputSchema — $.text expected string, got array`, `${where}: why unmoved`);
      equal(v.sample!.result, { text: ['alpha', 'beta', 'gamma'] }, `${where}: the result the schema refused, kept as before`);
    }
    for (const [where, v] of await threeRoads('jsonata', '{ "text": $join(lines, " ") }')) {
      equal(v.kind, 'transform-passes', `${where}: the CONTROL — joined, it passes`);
      ok(!('cause' in v), `${where}: and a transform-passes verdict has NO cause key`);
    }
  });

  test(DECLARED_CASES[2]!, async () => {
    const seen = new Map<string, number>();
    let failsWithSchema = 0;
    for (const name of wiringNames) {
      const report = await checkWiring(wiringRegistry, JSON.parse(await readText(`${EX}/wiring/${name}`)) as FlowDefinition);
      for (const v of report.verdicts) {
        seen.set(v.kind, (seen.get(v.kind) ?? 0) + 1);
        if (v.kind === 'transform-fails') {
          // The control on the SAME observer: `'cause' in v` is true here, so its `false` below is not a blind read.
          ok('cause' in v, `${name}: a transform-fails verdict carries cause`);
          equal(v.cause, 'schema', `${name}: P43 prediction 2 — a path picks a number for a string consumer: the schema refused it, nothing threw`);
          failsWithSchema += 1;
        } else {
          ok(!('cause' in v), `${name}: a ${v.kind} verdict has NO cause key`);
        }
      }
    }
    // The ARRANGEMENT: the corpus reaches every kind but `transform-fails` beside it — otherwise *absent on every other
    // kind* is about the kinds it happened to hold. The file names say which kinds (`<kind>--…`).
    for (const k of ['fits', 'no', 'transform-passes', 'unchecked']) ok((seen.get(k) ?? 0) > 0, `the wiring corpus yields a \`${k}\` verdict`);
    equal(failsWithSchema, 1, 'and exactly ONE transform-fails, its one file`s (`transform-fails--a-path-picks-a-number-for-a-string-consumer`)');
  });

  test(DECLARED_CASES[3]!, async () => {
    const missing = await tryTransform(registry, FLOW, 'sum', { lang: 'nope', expr: 'x' }, OPTS);
    equal(missing[0]!.kind, 'unchecked', 'a language the registry does not declare is unchecked');
    ok(!('cause' in missing[0]!), 'and carries NO cause');
    // A consumer with NO inputSchema: the transform RUNS and nothing holds its result — unchecked, no cause (the author's
    // sweep, M05: this road had no case).
    const { inputSchema: _dropped, ...bare } = (SESSION_WORKERS as unknown as Record<string, Record<string, unknown>>).summarise!;
    const noSchema = { ...registry, workers: { ...SESSION_WORKERS, summarise: bare } } as unknown as Parameters<typeof checkWiring>[0];
    const ran = await tryTransform(noSchema, FLOW, 'sum', { lang: 'jsonata', expr: '{ "text": lines }' }, OPTS);
    equal([ran[0]!.kind, ran[0]!.sample?.result], ['unchecked', { text: ['alpha', 'beta', 'gamma'] }], 'no consumer schema: unchecked, the transform having RUN (its result reported)');
    ok(!('cause' in ran[0]!), 'and carries NO cause');
    const direct = (await checkWiring(noSchema, withTransform('jsonata', '{ "text": lines }'), OPTS)).verdicts.filter((v) => v.consumer === 'sum');
    equal(direct.map((v) => [v.kind, 'cause' in v]), [['unchecked', false]], 'the same through checkWiring direct: unchecked, NO cause (the adequacy reader, W6b)');
    // And where the consumer has no inputSchema but the transform THROWS: still transform-fails, `threw` — the throw is
    // judged before the consumer side (the conformity reader's NIT 3; spec v0.48's clause).
    const threwBare = await tryTransform(noSchema, FLOW, 'sum', { lang: 'jsonata', expr: '{{{' }, OPTS);
    equal([threwBare[0]!.kind, threwBare[0]!.cause], ['transform-fails', 'threw'], 'no consumer schema, a throw: transform-fails, threw');
    const failing = await tryTransform(registry, FLOW, 'sum', { lang: 'jsonata', expr: '{{{' }, OPTS);
    ok('cause' in failing[0]!, 'the CONTROL on the same call shape: a transform that throws DOES carry one');
    equal(VERDICT_KINDS, ['fits', 'no', 'transform-passes', 'transform-fails', 'unchecked'], 'VERDICT_KINDS unmoved — five kinds, no new one (P43 (d3) declined)');
    const report = await checkWiring(registry, withTransform('jsonata', '{{{'), OPTS);
    equal(Object.keys(report.counts).sort(), [...VERDICT_KINDS].sort(), 'the counts are keyed by the same five kinds and nothing else');
    equal(report.counts['transform-fails'], 1, 'and the throw is counted where it always was');
  });

  test(DECLARED_CASES[4]!, () => {
    const ran = collected().find((s) => s.suite === SUITE)!.cases.map((c) => c.name).sort();
    const declared: string[] = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
