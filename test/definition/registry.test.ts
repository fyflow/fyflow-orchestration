/**
 * **The registry document: every construction-time refusal by name, the identity derivation
 * against P18 fact 5, and both SHAPES of a node type on every field** —
 * `spec/flow-definition.md` section 3's registry-document subsection (v0.19),
 * [ADR 0053](../../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md),
 * [ADR 0054](../../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
 * [W65](../../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md).
 *
 * **The positive fixture is P18's minimum sample, verbatim** — the registry document and the shim's
 * three pieces of code (a class type, a custom group type, a predicate) from the plan's own text; the
 * language adapter is the FAKE one under the document's name, so this suite loads no engine and what
 * it asserts of `languages` is the NAME resolution decision 13 describes. Every refusal has a document
 * that trips it and the sample that does not; every expected value is the plan's decision or fact,
 * never the run. Nothing here constructs a pool or a group: `create` is asserted NOT to have been
 * called, which is the *build nothing* the item declares.
 *
 * **Both shapes of a node type, on every field of both interfaces** (rule 8 obligation (a)): every
 * `NodeTypeDeclaration` key and every `NodeTypeDefinition` member is instantiated once under a
 * document type and once under a class, under the same claim — what the derived `PoolSpec` carries.
 */
import { equal, ok, readText, ROOT, suite } from '../harness.ts';
import { canonical } from '../../src/definition/schema.ts';
import * as registryModule from '../../src/definition/registry.ts';
import {
  BUILT_IN_GROUP_TYPES, ConfigRefused, DECLARED_POOL_KEYS, DerivationRefused, DOCUMENT_KEYS, GroupConfigRefused, GroupTypeMissing,
  groupsNamedBy, INSTANCE_KEYS, isDerivation, mergeConfig, NameCollision, NameMissing, NODE_TYPE_DECLARATION_KEYS, nodeTypeFromDeclaration,
  MESSAGE_OPTION_KEYS, POOL_SPEC_KEYS, poolOptionsOf, poolSpecProblem, PoolTypeMissing, RegistryError, resolveRegistry, SchemaRefused, TypeDefaultRefused,
  UndeclaredKey, WORKER_KEYS, WorkerMissing, CHECKED_WORKER_SCHEMAS, checkRegistry,
} from '../../src/definition/registry.ts';
import { BUILT_IN_NODE_TYPES } from '../../src/definition/validate.ts';
import type { GroupType, NodeTypeDeclaration, NodeTypeDefinition, PoolSpec, RegistryCode, RegistryDocument } from '../../src/definition/types.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';
/**
 * **The pool and type expectations below are UNMOVED by [W109](../../doc/work-items/w109-a-node-that-only-transforms.md),
 * and that is the design correction's own observable.** `ResolvedRegistry` stores a built-in node
 * type no more than it stores a gate type — `nodeTypesOf` merges them at every READ — so what
 * `resolveRegistry` hands back still holds exactly the DECLARED types and exactly one pool per
 * declared type instance. Their claim is *nothing added and nothing dropped*, and it is about the
 * document.
 *
 * *The first cut merged at read AND stored, and these sets were widened by a derivation off
 * `BUILT_IN_NODE_TYPES` to absorb it. Storing them made `checkRegistry` — which runs on a raw
 * registry and on a resolved one — unable to tell a consumer's collision from the library's own
 * entry, and refused eighty of this repository's tests; the revert left that derivation stranded
 * with this comment still claiming it was added, which `deno lint` is what caught.* The literal
 * `'Transform'` is asserted where the merge IS the claim, in `test/definition/node-type.test.ts`'s
 * W109 suite, against `BUILT_IN_NODE_TYPES` itself — two different claims, each bound where it
 * belongs, and re-sourcing either to the other would be a tautology (obligation (c)'s limit).
 */

// ---- P18's minimum sample, verbatim from the plan ------------------------------------------------

const SAMPLE: RegistryDocument = {
  workers: {
    prompt: {
      url: './workers/prompt.ts',
      configSchema: { type: 'object', required: ['model'], properties: { model: { type: 'string' } } },
      settingsSchema: { type: 'object', required: ['prompt'], properties: { prompt: { type: 'string' }, temperature: { type: 'number' } } },
      inputSchema: { type: 'object', required: ['text'] },
      outputSchema: { type: 'object', required: ['answer', 'confidence'] },
    },
    fetch: { url: './workers/fetch.ts', outputSchema: { type: 'object', required: ['text'] } },
  },
  groups: {
    vendor: { type: 'RateLimitGroup', config: { windows: [{ limit: 60, windowMs: 60000 }] } },
    gpu: { type: 'ConcurrentLimitGroup', config: { limit: 2 } },
    budget: { type: 'DailyBudgetGroup', config: { tokensPerDay: 2000000 } },
  },
  nodeTypes: {
    Prompt: {
      worker: 'prompt', inline: false,
      config: { model: 'small' },
      pool: { maxThreads: 4, idleTimeout: 30000 },
      groups: ['vendor', 'budget'],
      retryPolicy: { maxRetries: 1, backoffMs: 500 },
      settings: { temperature: 0 },
    },
    Fetch: { worker: 'fetch', inline: true },
  },
  pools: { 'prompt-big': { type: 'GpuModel', config: { model: 'large' } } },
  predicates: ['isLowConfidence'],
  languages: ['jsonata'],
};

/** The shim's class type — a derivation that is NOT the identity: `model` into a resident VRAM cost and a thread count. */
class GpuModel implements NodeTypeDefinition {
  readonly worker = 'prompt';
  readonly inline = false;
  readonly configSchema = { type: 'object', required: ['model'], properties: { model: { enum: ['small', 'large'] } } };
  readonly config = { model: 'small' as const };
  readonly retryPolicy = { maxRetries: 1, backoffMs: 500 };
  calls: [unknown, string][] = [];
  pool(config: unknown, key: string): PoolSpec {
    this.calls.push([config, key]);
    const large = (config as { model: string }).model === 'large';
    return { config: { model: (config as { model: string }).model }, maxThreads: large ? 1 : 4, idleTimeout: 30000, groups: ['vendor'], residentGroups: { gpu: large ? 2 : 1 } };
  }
}
let created = 0;
const DailyBudgetGroup: GroupType = {
  configSchema: { type: 'object', required: ['tokensPerDay'], properties: { tokensPerDay: { type: 'number', minimum: 0 } } },
  create: () => { created++; return {} as never; },
};
const code = (): RegistryCode & { gpu: GpuModel } => {
  const gpu = new GpuModel();
  return { gpu, predicates: { isLowConfidence: () => true }, groupTypes: { DailyBudgetGroup }, nodeTypes: { GpuModel: gpu }, languages: { jsonata: PATH_LANGUAGE } };
};

/** A document edited in one place, for a refusal fixture — loosely typed so a fixture can write any key. */
type Loose = Record<string, Record<string, Record<string, unknown>>> & Record<string, unknown>;
const edited = (f: (d: Loose) => void): RegistryDocument => { const d = JSON.parse(JSON.stringify(SAMPLE)) as Loose; f(d); return d as unknown as RegistryDocument; };
const refused = (doc: RegistryDocument, cls: new (...a: never[]) => RegistryError, names: string[], c: RegistryCode = code(), label = ''): RegistryError => {
  let err: unknown;
  try { resolveRegistry(doc, c); } catch (e) { err = e; }
  ok(err instanceof cls, `${label || cls.name}: refused with ${cls.name}, got ${err instanceof Error ? `${err.name}: ${err.message}` : JSON.stringify(err)}`);
  const e = err as RegistryError;
  ok(e instanceof RegistryError && e.name === cls.name, `${label || cls.name}: a RegistryError named for its class`);
  for (const n of names) ok(e.message.includes(n), `${label || cls.name}: the message names ${n} — ${e.message}`);
  return e;
};

/** The names of the table's first cells under a heading in section 3, for the both-ways comparisons. */
async function specTable(heading: string): Promise<string[]> {
  const spec = await readText(`${ROOT}spec/flow-definition.md`);
  const from = spec.indexOf(heading);
  ok(from >= 0, `section 3 has the heading ${JSON.stringify(heading)}`);
  const body = spec.slice(from + heading.length);
  const table = body.slice(0, body.indexOf('\n##'));
  return [...table.matchAll(/^\|\s*`([A-Za-z$][A-Za-z0-9_-]*)`\s*\|/gm)].map((m) => m[1]!).sort();
}

suite('the minimum sample resolves — the document, the class, the custom group and the four pools, with NOTHING constructed', (test) => {
  test('every section resolves to the names the plan declares, and the default instance of every type is implicit', () => {
    const c = code();
    const r = resolveRegistry(SAMPLE, c);
    equal([...r.workers.keys()].sort(), ['fetch', 'prompt'], 'workers');
    equal([...r.groups.keys()].sort(), ['budget', 'gpu', 'vendor'], 'groups');
    equal([...r.nodeTypes.keys()].sort(), ['Fetch', 'GpuModel', 'Prompt'], 'node types: two from the document, one from code — and NOT the built-ins, which `nodeTypesOf` merges at every read and `ResolvedRegistry` stores no more than it stores a gate type (ADR 0075 rule 5)');
    equal([...r.pools.keys()].sort(), ['Fetch', 'GpuModel', 'Prompt', 'prompt-big'], 'pools: a default instance per type under the type`s name, plus the named one — a built-in`s pool is `bootstrap``s, which reads through nodeTypesOf');
    equal([...r.predicates], ['isLowConfidence'], 'predicates by name');
    equal([...r.languages.keys()], ['jsonata'], 'languages by name');
    ok(r.languages.get('jsonata') === PATH_LANGUAGE, 'the adapter is the one supplied, by reference');
    equal(created, 0, 'no group was created — create() is the runtime`s to call (W66)');
    equal(r.groups.get('budget')!.groupType, DailyBudgetGroup, 'the factory is handed back, uncalled');
    equal(r.groups.get('gpu')!.type, 'ConcurrentLimitGroup', 'a built-in, by name');
  });
  test('the document types derive by IDENTITY and the class by its own rule — the four PoolSpecs, from the plan`s text', () => {
    const c = code();
    const r = resolveRegistry(SAMPLE, c);
    equal(r.pools.get('Prompt')!.spec, { config: { model: 'small' }, maxThreads: 4, idleTimeout: 30000, groups: ['vendor', 'budget'] }, 'Prompt: the declared config, pool fields and groups, copied');
    equal(r.pools.get('Fetch')!.spec, {}, 'Fetch: nothing declared beyond worker and inline, so an EMPTY spec — no config key, no groups key');
    equal(r.pools.get('GpuModel')!.spec, { config: { model: 'small' }, maxThreads: 4, idleTimeout: 30000, groups: ['vendor'], residentGroups: { gpu: 1 } }, 'GpuModel`s default: the class`s own config through its derivation — small');
    equal(r.pools.get('prompt-big')!.spec, { config: { model: 'large' }, maxThreads: 1, idleTimeout: 30000, groups: ['vendor'], residentGroups: { gpu: 2 } }, 'prompt-big: large, one thread, two units of gpu');
    equal(c.gpu.calls, [[{ model: 'small' }, 'GpuModel'], [{ model: 'large' }, 'prompt-big']], 'the derivation was called once per instance with the instance`s config and KEY, default first');
    equal(r.pools.get('prompt-big')!.type, 'GpuModel', 'a named instance records its type');
    ok(r.pools.get('prompt-big')!.definition === c.gpu, 'and its definition is the class itself');
  });
  test('the sample is the discriminating PAIR: a document type and a class type over ONE worker derive DIFFERENT specs — and the difference is asserted', () => {
    const r = resolveRegistry(SAMPLE, code());
    ok(r.pools.get('Prompt')!.worker === r.pools.get('GpuModel')!.worker, 'one worker entry');
    ok(canonical(r.pools.get('Prompt')!.spec) !== canonical(r.pools.get('GpuModel')!.spec), 'two derivations, two specs');
    ok(isDerivation(code().gpu) && !isDerivation(SAMPLE.nodeTypes!.Prompt!), 'told apart by whether pool is a function');
  });
});

suite('the identity derivation reproduces what bootstrap hands WorkerManager today — P18 fact 5, prediction 2', (test) => {
  // The two L6 types as DOCUMENT declarations — transcribed field for field from examples/run-flow.ts's
  // NODE_TYPES literal — and the options fact 5 captured through bootstrap's own createPool hook, re-taken
  // at this item's declaration in both runtimes (dev-dist/w65/fact5-{node,deno}.log, identical), as
  // canonical JSON with the worker URL elided. Expected values written from the capture, never from this run.
  const RETRY = { maxRetries: 1, backoffMs: 0 };
  const L6: Record<string, NodeTypeDeclaration> = {
    Echo: { worker: 'flow', inline: false, config: { role: 'echo' }, pool: { maxThreads: 2, idleTimeout: 0 }, retryPolicy: RETRY },
    Scorer: { worker: 'flow', inline: true, config: { role: 'typed' }, pool: { maxThreads: 2, idleTimeout: 0 }, groups: ['scorer'], retryPolicy: RETRY },
  };
  const FACT5: Record<string, string> = {
    Echo: '{"config":{"config":{"role":"echo"},"worker":"<url>"},"idleTimeout":0,"inline":false,"maxThreads":2}',
    Scorer: '{"config":{"config":{"role":"typed"},"worker":"<url>"},"groups":["scorer"],"idleTimeout":0,"inline":true,"maxThreads":2}',
  };
  test('Echo and Scorer: the derived WorkerManagerOptions equal fact 5`s capture as canonical JSON, and a groups key is ABSENT where none is declared', () => {
    for (const [name, decl] of Object.entries(L6)) {
      const def = nodeTypeFromDeclaration(decl);
      const opts = poolOptionsOf(def.pool(def.config, name), def.inline, '<url>');
      equal(canonical(opts), FACT5[name], `${name}: option for option`);
    }
    const echo = poolOptionsOf(nodeTypeFromDeclaration(L6.Echo!).pool(L6.Echo!.config, 'Echo'), false, '<url>');
    ok(!('groups' in echo), 'Echo declares no groups and the options carry NO groups key — absent, not empty');
    ok(!('languages' in (echo.config as object)), 'and no languages key when none is given');
    equal(Object.keys(FACT5).length, 2, 'two types, as the L6 harness registers');
    ok(FACT5.Echo !== FACT5.Scorer, 'the pair differs (inline, groups)');
  });
  test('the keys the derivation may emit are exactly WorkerManagerOptions` fields it ever sets — and `inline` is absent when the declaration omits it', () => {
    const def = nodeTypeFromDeclaration({ worker: 'w', pool: { maxThreads: 1, maxConcurrentTasks: 3, idleTimeout: 5, residentGroups: ['g'], cancelGraceMs: 250, messages: { flushIntervalMs: 5, maxBuffered: 10 } }, groups: ['h'] });
    const opts = poolOptionsOf(def.pool(undefined, 'k'), def.inline, 'u', { path: 'p' });
    // `cancelGraceMs` and `messages` since v0.33 (W159): the scheduler's own `WorkerManagerOptions` names, passed as declared.
    equal(Object.keys(opts).sort(), ['cancelGraceMs', 'config', 'groups', 'idleTimeout', 'maxConcurrentTasks', 'maxThreads', 'messages', 'residentGroups'], 'no inline key without a declaration');
    equal([opts.cancelGraceMs, opts.messages], [250, { flushIntervalMs: 5, maxBuffered: 10 }], 'the two v0.33 options reach the options bag as declared');
    equal(opts.config, { worker: 'u', config: undefined, languages: { path: 'p' } }, 'the envelope pool config, with languages only when given');
    equal(poolOptionsOf({}, true, 'u'), { inline: true, config: { worker: 'u', config: undefined } }, 'an empty spec with inline: the two keys');
  });
  test('the identity derivation: an instance config merges shallowly OVER the type`s, every other field is copied as declared, and the declared object is not aliased', () => {
    const decl: NodeTypeDeclaration = { worker: 'w', config: { model: 'small', a: 1 }, pool: { maxThreads: 2 }, groups: ['g'], retryPolicy: RETRY, settings: { t: 0 } };
    const def = nodeTypeFromDeclaration(decl);
    equal(def.pool({ model: 'large' }, 'k'), { config: { model: 'large', a: 1 }, maxThreads: 2, groups: ['g'] }, 'merged over');
    equal(def.pool(undefined, 'k'), { config: { model: 'small', a: 1 }, maxThreads: 2, groups: ['g'] }, 'no instance config: the type`s');
    ok(def.pool(undefined, 'k').groups !== decl.groups, 'groups copied, not aliased');
    // And `messages`, the one declared pool field that is an object the scheduler reads by key (v0.33, W159).
    const withMessages: NodeTypeDeclaration = { worker: 'w', pool: { messages: { maxBuffered: 4 } } };
    const derived = nodeTypeFromDeclaration(withMessages).pool(undefined, 'k');
    equal(derived.messages, { maxBuffered: 4 }, 'messages copied as declared');
    ok(derived.messages !== withMessages.pool!.messages, 'messages copied, not aliased');
    equal(def.retryPolicy, RETRY, 'retryPolicy carried on the definition for the driver');
    equal(def.settings, { t: 0 }, 'settings defaults carried');
    equal(def.worker, 'w', 'the worker key carried');
    equal(nodeTypeFromDeclaration({ worker: 'w' }).pool(undefined, 'k'), {}, 'nothing declared: an empty spec, no config key');
    equal(nodeTypeFromDeclaration({ worker: 'w' }).pool({ x: 1 }, 'k'), { config: { x: 1 } }, 'an instance config with no type config stands alone');
    equal(mergeConfig('a', 'b'), 'b', 'non-objects: the instance replaces');
    equal(mergeConfig({ a: 1 }, 'b'), 'b', 'a non-object instance config replaces an object');
    equal(mergeConfig({ a: 1 }, undefined), { a: 1 }, 'absent instance config: the type`s');
    equal(mergeConfig({ a: { deep: 1 } }, { a: { other: 2 } }), { a: { other: 2 } }, 'SHALLOW: a nested object is replaced, not merged');
  });
});

suite('both SHAPES of a node type, every field of both interfaces, under one claim: what the derived spec and the definition carry', (test) => {
  const W: RegistryDocument['workers'] = { w: { url: 'u', configSchema: { type: 'object', properties: { model: { type: 'string' } } } } };
  const G: RegistryDocument['groups'] = { g: { type: 'ConcurrentLimitGroup', config: { limit: 1 } }, h: { type: 'ConcurrentLimitGroup', config: { limit: 1 } } };
  test('document form: every declaration key reaches the definition or the spec', () => {
    const decl: NodeTypeDeclaration = { worker: 'w', inline: true, config: { model: 'm' }, pool: { maxThreads: 3, maxConcurrentTasks: 2, idleTimeout: 7, residentGroups: { h: 1 }, cancelGraceMs: 500, messages: { flushIntervalMs: 10, maxBuffered: 50 } }, groups: ['g'], retryPolicy: { maxRetries: 2, backoffMs: 1 }, settings: { s: 1 } };
    equal(Object.keys(decl).sort(), [...NODE_TYPE_DECLARATION_KEYS].sort(), 'this fixture sets EVERY declaration key');
    equal(Object.keys(decl.pool!).sort(), [...DECLARED_POOL_KEYS].sort(), 'and every declared-pool key');
    const r = resolveRegistry({ workers: W, groups: G, nodeTypes: { T: decl } });
    const p = r.pools.get('T')!;
    equal(p.spec, { config: { model: 'm' }, maxThreads: 3, maxConcurrentTasks: 2, idleTimeout: 7, residentGroups: { h: 1 }, cancelGraceMs: 500, messages: { flushIntervalMs: 10, maxBuffered: 50 }, groups: ['g'] }, 'the spec carries config, the six pool fields and groups');
    equal(Object.keys(p.spec).sort(), [...POOL_SPEC_KEYS].sort(), 'every PoolSpec key, from the document form');
    equal(p.definition.inline, true, 'inline on the definition');
    equal(p.definition.retryPolicy, { maxRetries: 2, backoffMs: 1 }, 'retryPolicy on the definition');
    equal(p.definition.settings, { s: 1 }, 'settings on the definition');
    equal(p.definition.worker, 'w', 'worker on the definition');
    equal(p.definition.configSchema, undefined, 'a document type has no configSchema of its own — its knobs are the fields an instance may override');
  });
  test('class form: every NodeTypeDefinition member is read, and its pool() output passes the SAME checks', () => {
    const cls: NodeTypeDefinition = {
      worker: 'w', inline: false, configSchema: { type: 'object', required: ['n'], properties: { n: { type: 'integer', minimum: 1 } } }, config: { n: 2 },
      retryPolicy: { maxRetries: 3, backoffMs: 2 }, settings: { s: 2 },
      pool: (c) => ({ config: { model: `m${(c as { n: number }).n}` }, maxThreads: (c as { n: number }).n, maxConcurrentTasks: 1, idleTimeout: 9, groups: ['g'], residentGroups: ['h'], cancelGraceMs: Infinity, messages: { maxBuffered: (c as { n: number }).n } }),
    };
    equal(Object.keys(cls).sort(), ['config', 'configSchema', 'inline', 'pool', 'retryPolicy', 'settings', 'worker'], 'this fixture sets EVERY definition member');
    const r = resolveRegistry({ workers: W, groups: G, pools: { big: { type: 'C', config: { n: 5 } } } }, { nodeTypes: { C: cls } });
    equal(r.pools.get('C')!.spec.maxThreads, 2, 'the default instance through the class`s own config');
    equal(r.pools.get('big')!.spec, { config: { model: 'm5' }, maxThreads: 5, maxConcurrentTasks: 1, idleTimeout: 9, groups: ['g'], residentGroups: ['h'], cancelGraceMs: Infinity, messages: { maxBuffered: 5 } }, 'a named instance through the same derivation — a class may COMPUTE the v0.33 options too');
    equal(Object.keys(r.pools.get('big')!.spec).sort(), [...POOL_SPEC_KEYS].sort(), 'every PoolSpec key, from the class form');
    ok(r.pools.get('C')!.definition === cls, 'the class is the definition');
    // The class's configSchema is applied BEFORE pool() — an instance config it refuses never reaches the derivation.
    let reached = 0;
    const strict: NodeTypeDefinition = { ...cls, pool: (c) => { reached++; return cls.pool(c, 'x'); } };
    refused({ workers: W, groups: G, pools: { bad: { type: 'C', config: { n: 0 } } } }, ConfigRefused, ['"bad"', 'configSchema', 'minimum'], { nodeTypes: { C: strict } });
    equal(reached, 1, 'the derivation ran once (the default instance) and never for the refused instance');
    // And the class's OUTPUT is held to the worker's configSchema exactly as a document type's is.
    const computesAround: NodeTypeDefinition = { ...cls, pool: () => ({ config: { model: 5 } }) };
    refused({ workers: W, groups: G }, TypeDefaultRefused, ['"C"', 'worker "w"', 'configSchema'], { nodeTypes: { C: computesAround } }, 'a class returning a config the worker`s schema refuses');
  });
});

suite('every construction-time refusal, by name — a document that trips it and the sample that does not', (test) => {
  test('the sample resolves clean — the control every refusal below is measured against', () => {
    equal(resolveRegistry(SAMPLE, code()).pools.size, 4, 'clean — the sample`s four');
  });
  test('WorkerMissing: a type naming a worker the document lacks, a type with no worker, and a worker with no url', () => {
    refused(edited((d) => { d.nodeTypes!.Prompt!.worker = 'nope'; }), WorkerMissing, ['"Prompt"', '"nope"', '"fetch"', '"prompt"']);
    refused(edited((d) => { delete d.nodeTypes!.Fetch!.worker; }), WorkerMissing, ['"Fetch"', 'names no worker']);
    refused(edited((d) => { d.workers!.fetch!.url = ''; }), WorkerMissing, ['"fetch"', 'no url']);
    // The CLASS form too: GpuModel names 'prompt'; rename the worker away.
    const c = code(); (c.gpu as { worker: string }).worker = 'gone';
    refused(SAMPLE, WorkerMissing, ['"GpuModel"', '"gone"'], c, 'a class naming a missing worker');
  });
  test('PoolTypeMissing: a pool naming a type nobody registered, and a pool with no type', () => {
    refused(edited((d) => { d.pools!['prompt-big']!.type = 'Nope'; }), PoolTypeMissing, ['"prompt-big"', '"Nope"', '"Fetch"', '"GpuModel"', '"Prompt"']);
    refused(edited((d) => { delete d.pools!['prompt-big']!.type; }), PoolTypeMissing, ['"prompt-big"']);
    // **And the enumeration names the BUILT-INS too** — v0.29, W110. Before the fix below this
    // message listed the document's types alone, which would send an author to declare an entry for
    // a type that is never declared. Asserted as the WHOLE sorted list rather than by membership, so
    // a built-in dropped from it is red here and not merely unsaid.
    const e = refused(edited((d) => { d.pools!['prompt-big']!.type = 'Nope'; }), PoolTypeMissing, ['"Transform"']);
    const listed = [...e.message.matchAll(/"([A-Za-z][A-Za-z0-9]*)"/g)].map((m) => m[1]!).filter((n) => n !== 'Nope' && n !== 'prompt-big');
    equal(listed.sort(), ['Fetch', 'GpuModel', 'Prompt', ...Object.keys(BUILT_IN_NODE_TYPES)].sort(),
      'the enumeration is the consumer`s types AND the library`s own, both');
  });

  /**
   * **A named pool INSTANCE of a BUILT-IN node type — the road
   * [ADR 0075](../../doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md)
   * rule 3 blesses BY NAME, and v0.29 is where the runtime road agrees with the driver's.**
   *
   * [W110](../../doc/work-items/w110-a-flow-a-ui-could-have-emitted.md)'s declaration step measured
   * the two roads DISAGREEING about one document: `checkRegistry` — what `new Driver` runs — accepted
   * it, because its types are `nodeTypesOf(reg.nodeTypes)` and therefore merged, while
   * `resolveRegistry` refused `PoolTypeMissing: … "Transform", which is not a node type`, **a message
   * false against `nodeTypesOf`, which returns it.** The maintainer's answer to that item's
   * stop-and-ask (b) was to fix the code rather than the ADR, AGAINST the item's recommendation.
   *
   * **Both roads are asserted here, because one of them passing is what the defect looked like.**
   * Reverting the lookup leaves `checkRegistry` green and this is the only thing that says so.
   */
  test('a named pool instance of a BUILT-IN type resolves, on BOTH roads, and is still stored nowhere', () => {
    const withInstance = edited((d) => { d.pools!['reshape-big'] = { type: 'Transform', config: {} }; });
    const r = resolveRegistry(withInstance, code());
    ok(r.pools.has('reshape-big'), 'resolveRegistry derived the named instance of the built-in');
    equal(r.pools.get('reshape-big')!.type, 'Transform', 'and it carries the type it names');
    equal(r.pools.get('reshape-big')!.worker, undefined, 'with NO worker — a type that only transforms names none (ADR 0075 rule 2)');
    // The DRIVER's road, which accepted it throughout — the control for the clause above. Its
    // `nodeTypes` is the UNION a driver is handed (`driver.ts` passes `opts.nodeTypes`, and the
    // runtime builds it from `resolved.nodeTypes`), so the sample's CLASS goes in beside the
    // document's two; handing it the document's alone makes `prompt-big` the refusal instead and
    // says nothing about the built-in.
    checkRegistry({
      predicates: [], workers: withInstance.workers,
      nodeTypes: { ...withInstance.nodeTypes, GpuModel: code().gpu },
      pools: withInstance.pools, groups: Object.keys(withInstance.groups ?? {}),
    } as never);
    ok(true, 'checkRegistry accepts the same document — the two roads agree');
    // **And ADR 0075 rule 5 is UNTOUCHED**: a lookup is not a store, so the resolved registry still
    // carries the consumer's types alone. This is what let `checkRegistry` tell a consumer's
    // collision from the library's own entry, and it cost W109 eighty tests to learn.
    ok(!r.nodeTypes.has('Transform'), 'and the built-in is in `resolved.nodeTypes` no more than a gate type is');
    equal([...r.pools.keys()].filter((k) => Object.prototype.hasOwnProperty.call(BUILT_IN_NODE_TYPES, k)), [],
      'nor is its DEFAULT instance — `bootstrap` builds that, reading through `nodeTypesOf`');
    // A pool TAKING a built-in's name is still the collision it was, on this road as on the other —
    // **and the message NAMES it as the library's**, which the generic clause did not (W110's
    // conformity reader, 19: the three `NameCollision` messages W109 added each say so and the one a
    // consumer meets first did not).
    const col = refused(edited((d) => { d.pools!.Transform = { type: 'Fetch' }; }), NameCollision, ['"Transform"', 'DEFAULT instance']);
    ok(col.message.includes('BUILT-IN'), `and it says the name is the library's: ${col.message}`);
    // **The arm that was DEAD, now reachable** — W110's conformity reader (9). The first fix folded the
    // consumer's types and the built-ins into one list under *the registry declares*, so the list was
    // never empty and the *declares none* arm had no case; the verb is *a `type` may name* now and the
    // two halves are apart, so a registry with no types of its own reaches it.
    const none = refused({ workers: {}, pools: { big: { type: 'Nope' } } } as unknown as RegistryDocument,
      PoolTypeMissing, ['and it declares none', '"Transform"'], { predicates: new Map() } as RegistryCode,
      'a registry declaring NO node types of its own');
    ok(!none.message.includes('the registry declares "Transform"'),
      `and it does NOT say a document declares the built-in, which ADR 0075 rules 1 and 5 say none does: ${none.message}`);
  });
  test('ConfigRefused: a named instance`s config against its class`s schema, and its DERIVED config against the worker`s', () => {
    const e = refused(edited((d) => { d.pools!['prompt-big']!.config = { model: 'huge' }; }), ConfigRefused, ['"prompt-big"', 'GpuModel', 'not one of']);
    equal(e.at, 'prompt-big', 'at names the pool');
    // A document type's instance: no type schema, so the derived config meets the WORKER's schema — `model` must be a string.
    refused(edited((d) => { d.pools!.small = { type: 'Prompt', config: { model: 7 } }; }), ConfigRefused, ['"small"', 'worker "prompt"', 'expected string']);
  });
  test('TypeDefaultRefused: a type whose OWN config fails its own schema has no valid default and is refused naming the TYPE — both shapes', () => {
    const c = code(); (c.gpu as { config: unknown }).config = { model: 'huge' };
    const e = refused(SAMPLE, TypeDefaultRefused, ['"GpuModel"', 'default instance', 'not one of'], c, 'a class whose config fails its configSchema');
    equal(e.at, 'GpuModel', 'at names the type');
    refused(edited((d) => { d.nodeTypes!.Prompt!.config = {}; }), TypeDefaultRefused, ['"Prompt"', 'default instance', 'worker "prompt"', 'required'], code(), 'a document type whose config fails the WORKER`s schema');
    refused(edited((d) => { delete d.nodeTypes!.Prompt!.config; }), TypeDefaultRefused, ['"Prompt"', '$.model required'], code(), 'and one that declares NONE against a schema that requires a key — the default is {} and {} is refused');
  });
  test('GroupTypeMissing: a group naming a type that is neither built in nor registered', () => {
    refused(edited((d) => { d.groups!.gpu!.type = 'VramGroup'; }), GroupTypeMissing, ['"gpu"', '"VramGroup"', 'ConcurrentLimitGroup', '"DailyBudgetGroup"']);
    refused(SAMPLE, GroupTypeMissing, ['"budget"', '"DailyBudgetGroup"'], { ...code(), groupTypes: {} }, 'the custom type not supplied');
  });
  test('GroupConfigRefused: a group`s config against its type`s schema — a built-in`s and a custom one`s', () => {
    refused(edited((d) => { d.groups!.gpu!.config = { limit: 0 }; }), GroupConfigRefused, ['"gpu"', 'ConcurrentLimitGroup', 'below minimum 1']);
    refused(edited((d) => { d.groups!.vendor!.config = { windows: [] }; }), GroupConfigRefused, ['"vendor"', 'fewer than 1']);
    refused(edited((d) => { d.groups!.budget!.config = { tokensPerDay: -1 }; }), GroupConfigRefused, ['"budget"', 'DailyBudgetGroup', 'below minimum 0']);
    refused(edited((d) => { delete d.groups!.gpu!.config; }), GroupConfigRefused, ['"gpu"', '$.limit required'], code(), 'no config where the schema requires a key');
  });
  test('NameCollision: one name, two definitions — a node type in the document AND in code, a pool named as a type, a group type named as a built-in', () => {
    refused(edited((d) => { d.nodeTypes!.GpuModel = { worker: 'prompt', config: { model: 'small' } }; }), NameCollision, ['"GpuModel"', 'document', 'code']);
    refused(edited((d) => { d.pools!.Prompt = { type: 'Prompt' }; }), NameCollision, ['pool "Prompt"', 'DEFAULT instance']);
    refused(SAMPLE, NameCollision, ['"RateLimitGroup"', 'built-in'], { ...code(), groupTypes: { ...code().groupTypes, RateLimitGroup: DailyBudgetGroup } }, 'a custom group type named as a built-in');
  });
  test('SchemaRefused (Q278): a keyword outside the subset on ANY of a worker`s four schemas, on a group type`s, on a class`s — refused naming the keyword and the entry', () => {
    for (const field of WORKER_KEYS.slice(1)) {
      const e = refused(edited((d) => { d.workers!.prompt![field] = { type: 'object', pattern: 'x' }; }), SchemaRefused, ['"prompt"', field, '"pattern"', 'REFUSED'], code(), `worker.${field}`);
      equal(e.at, 'prompt', `${field}: at names the worker`);
    }
    ok(WORKER_KEYS.slice(1).length === 4 && CHECKED_WORKER_SCHEMAS.length === 2, 'all FOUR schemas are held to the subset though only two are applied');
    refused(SAMPLE, SchemaRefused, ['"DailyBudgetGroup"', '"format"'], { ...code(), groupTypes: { DailyBudgetGroup: { ...DailyBudgetGroup, configSchema: { format: 'x' } } } }, 'a group type`s schema');
    const c = code(); (c.gpu as { configSchema: unknown }).configSchema = { oneOf: [] };
    refused(SAMPLE, SchemaRefused, ['"GpuModel"', '"oneOf"'], c, 'a class`s configSchema');
    refused(edited((d) => { d.workers!.fetch!.settingsSchema = { type: 'strong' }; }), SchemaRefused, ['"fetch"', '$.type'], code(), 'and a malformed keyword value');
  });
  // ADR 0056 (W72, v0.20): `examples` on a worker's schema is held to that schema at construction. The
  // refusal is `SchemaRefused` — the SAME class, because an example that refutes its schema is a defect
  // of the declaration — naming the entry, the field and the example's index; a conforming one resolves.
  test('SchemaRefused (ADR 0056): an example that refutes the schema it sits on, on ANY of a worker`s four schemas, a group type`s, a class`s — and a conforming one resolves', () => {
    for (const field of WORKER_KEYS.slice(1)) {
      const e = refused(edited((d) => { d.workers!.prompt![field] = { type: 'object', required: ['k'], examples: [{ k: 1 }, {}] }; }),
        SchemaRefused, ['"prompt"', field, 'examples[1]', '$.k required'], code(), `worker.${field} example`);
      equal(e.at, 'prompt', `${field}: at names the worker`);
    }
    refused(SAMPLE, SchemaRefused, ['"DailyBudgetGroup"', 'examples[0]', 'below minimum'],
      { ...code(), groupTypes: { DailyBudgetGroup: { ...DailyBudgetGroup, configSchema: { ...DailyBudgetGroup.configSchema!, examples: [{ tokensPerDay: -1 }] } } } }, 'a group type`s example');
    const c = code(); (c.gpu as { configSchema: unknown }).configSchema = { type: 'object', required: ['model'], properties: { model: { enum: ['small', 'large'] } }, examples: [{ model: 'huge' }] };
    refused(SAMPLE, SchemaRefused, ['"GpuModel"', 'examples[0]', 'not one of'], c, 'a class`s example');
    refused(edited((d) => { (d.workers!.fetch!.outputSchema as Record<string, unknown>).examples = []; }), SchemaRefused, ['"fetch"', 'outputSchema', 'NON-EMPTY'], code(), 'an empty examples list');
    // The control, both ways: conforming examples on all four resolve, and the registry carries them through untouched.
    const withExamples = edited((d) => {
      const p = d.workers!.prompt!;
      p.configSchema = { ...(p.configSchema as object), examples: [{ model: 'small' }] };
      p.settingsSchema = { ...(p.settingsSchema as object), examples: [{ prompt: 'summarise' }] };
      p.inputSchema = { ...(p.inputSchema as object), examples: [{ text: 'hello' }] };
      p.outputSchema = { ...(p.outputSchema as object), examples: [{ answer: 'hello', confidence: 0.5 }] };
    });
    const r = resolveRegistry(withExamples, code());
    const carried = r.workers.get('prompt') as unknown as Record<string, { examples?: unknown[] }>;
    equal(WORKER_KEYS.slice(1).map((f) => carried[f]?.examples?.length), [1, 1, 1, 1], 'one example on each of the four, carried as declared');
    // The DRIVER's shape half too — `checkRegistry`, what `new Driver` runs — and not only the resolver: the
    // adequacy reader (c1) stripped examples before that call and everything was green, because every
    // fixture above goes through `resolveRegistry`. The same refusal from the other caller.
    let shape: unknown;
    // The workers section alone: the sample's `prompt-big` pool names the CLASS type, which lives in code and
    // not in the document, and the shape check has no code to look it up in.
    try { checkRegistry({ workers: edited((d) => { d.workers!.fetch!.outputSchema = { type: 'object', required: ['text'], examples: [{}] }; }).workers }); } catch (e) { shape = e; }
    ok(shape instanceof SchemaRefused && (shape as RegistryError).message.includes('examples[0]') && (shape as RegistryError).at === 'fetch', `checkRegistry refuses a refuting example naming the worker — ${String(shape)}`);
    equal(checkRegistry({ workers: withExamples.workers }), undefined, 'and passes the conforming ones');
  });
  test('UndeclaredKey: a key no kind declares — at the top level, on a worker, a type, a pool, a group — and a section that is not an object', () => {
    refused(edited((d) => { (d as Record<string, unknown>).note = 'x'; }), UndeclaredKey, ['"note"', DOCUMENT_KEYS.join(', ')]);
    refused(edited((d) => { d.workers!.fetch!.schema = {}; }), UndeclaredKey, ['"fetch"', '"schema"']);
    refused(edited((d) => { d.nodeTypes!.Fetch!.configSchema = {}; }), UndeclaredKey, ['"Fetch"', '"configSchema"'], code(), 'a document type may not carry a configSchema — that is the class form`s');
    refused(edited((d) => { (d.nodeTypes!.Prompt!.pool as Record<string, unknown>).groups = ['vendor']; }), UndeclaredKey, ['"Prompt"', '"groups"'], code(), 'groups sit beside pool, not in it');
    refused(edited((d) => { d.pools!['prompt-big']!.maxThreads = 1; }), UndeclaredKey, ['"prompt-big"', '"maxThreads"'], code(), 'an instance overrides through config, not pool fields');
    refused(edited((d) => { d.groups!.gpu!.limit = 2; }), UndeclaredKey, ['"gpu"', '"limit"']);
    refused(edited((d) => { d.workers = [] as unknown as Record<string, Record<string, unknown>>; }), UndeclaredKey, ['"workers"', 'keyed by name']);
    refused([] as unknown as RegistryDocument, UndeclaredKey, ['plain object'], code(), 'the document itself');
  });
  test('NameMissing: a predicate or language the document names and code does not supply; a group a type or a derivation names that the document lacks', () => {
    refused(SAMPLE, NameMissing, ['predicate "isLowConfidence"', 'none supplied'], { ...code(), predicates: undefined });
    refused(SAMPLE, NameMissing, ['language "jsonata"', 'ADR 0052'], { ...code(), languages: {} });
    refused(SAMPLE, NameMissing, ['language "jsonata"', 'compile'], { ...code(), languages: { jsonata: { worker: 'x' } as never } }, 'an adapter with no compile');
    refused(edited((d) => { d.nodeTypes!.Prompt!.groups = ['vendor', 'nope']; }), NameMissing, ['"Prompt"', '"nope"', '"budget"', '"gpu"', '"vendor"'], code(), 'a document type`s declared group');
    const c = code(); c.gpu.pool = () => ({ config: { model: 'small' }, residentGroups: { vram: 1 }, idleTimeout: 1 });
    refused(SAMPLE, NameMissing, ['"GpuModel"', '"vram"'], c, 'a class`s derived resident group');
    // The predicate names may be supplied as a Map, a record, a Set or a list.
    for (const p of [new Map([['isLowConfidence', 1]]), { isLowConfidence: 1 }, new Set(['isLowConfidence']), ['isLowConfidence']]) {
      ok(resolveRegistry(SAMPLE, { ...code(), predicates: p as never }).predicates.has('isLowConfidence'), `predicates as ${p.constructor.name}`);
    }
  });
  test('DerivationRefused: pool() throws, returns a non-PoolSpec, a PoolSpec with an undeclared key or a wrong type, a resident group beside idleTimeout 0, a bad inline, a bad retryPolicy, bad settings', () => {
    const with_ = (f: (g: GpuModel) => void) => { const c = code(); f(c.gpu); return c; };
    refused(SAMPLE, DerivationRefused, ['"GpuModel"', 'THREW', 'boom'], with_((g) => { g.pool = () => { throw new Error('boom'); }; }));
    refused(SAMPLE, DerivationRefused, ['"GpuModel"', 'not a PoolSpec'], with_((g) => { g.pool = () => 5 as never; }));
    refused(SAMPLE, DerivationRefused, ['"GpuModel"', '"inline"'], with_((g) => { g.pool = () => ({ config: { model: 'small' }, inline: true } as never); }), 'inline is the TYPE`s, not the spec`s');
    refused(SAMPLE, DerivationRefused, ['"GpuModel"', 'maxThreads'], with_((g) => { g.pool = () => ({ config: { model: 'small' }, maxThreads: 0 }); }));
    refused(SAMPLE, DerivationRefused, ['"GpuModel"', 'idleTimeout: 0', 'fact 6'], with_((g) => { g.pool = () => ({ config: { model: 'small' }, idleTimeout: 0, residentGroups: { gpu: 1 } }); }), 'decision 9');
    refused(edited((d) => { d.nodeTypes!.Prompt!.pool = { maxThreads: 4, idleTimeout: 0, residentGroups: ['gpu'] }; }), DerivationRefused, ['"Prompt"', 'idleTimeout: 0'], code(), 'decision 9 on a document type');
    refused(edited((d) => { d.nodeTypes!.Prompt!.inline = 'yes'; }), DerivationRefused, ['"Prompt"', 'inline']);
    refused(edited((d) => { d.nodeTypes!.Prompt!.retryPolicy = { maxRetries: '1', backoffMs: 0 }; }), DerivationRefused, ['"Prompt"', 'FD-V30']);
    refused(edited((d) => { d.nodeTypes!.Prompt!.settings = [1]; }), DerivationRefused, ['"Prompt"', 'settings']);
    refused(edited((d) => { d.nodeTypes!.Prompt!.pool = 'big'; }), DerivationRefused, ['"Prompt"', 'pool']);
  });
  test('the refusal classes named in the spec are exactly the ones exported — both ways', async () => {
    const inSpec = await specTable('#### What the registry refuses at construction');
    // **Discovered from the module rather than restated** — W65's rule 8 set (`d6`, an abort on a
    // moved anchor that read the list it aimed at): a hand-written list of eleven bound by a literal
    // `11` would pass a twelfth class exported and documented nowhere, and only AGENTS.md section 9's
    // snippet (Q101's mechanism) would see it. Every export that extends `RegistryError`, by prototype.
    const exported = Object.entries(registryModule)
      .filter(([, v]) => typeof v === 'function' && (v as { prototype?: unknown }).prototype instanceof RegistryError)
      .map(([name]) => name).sort();
    equal(inSpec, exported, 'one row per class, one class per row');
    ok(exported.length === 12, 'twelve — GateTypeRefused since v0.23 (W92)');
  });
});

suite('the key sets are claims about the spec`s tables — compared both ways', (test) => {
  test('the document`s top-level keys, a worker entry`s, a node type declaration`s, a PoolSpec`s, an instance`s', async () => {
    equal(await specTable('#### The registry document'), [...DOCUMENT_KEYS].sort(), 'document keys');
    equal(await specTable('#### A worker entry'), [...WORKER_KEYS].sort(), 'worker keys');
    equal(await specTable('#### A node type, in the document'), [...NODE_TYPE_DECLARATION_KEYS].sort(), 'declaration keys');
    equal(await specTable('#### What a derivation returns'), [...POOL_SPEC_KEYS].sort(), 'PoolSpec keys');
    // v0.33 (W159): the `messages` row names its object's keys as `{ a?, b? }`, compared to the module's list both ways.
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = /^\| `messages` \| optional, `\{ ([^}]*) \}` \|/m.exec(spec.slice(spec.indexOf('#### What a derivation returns')));
    ok(row !== null, 'the PoolSpec table has a messages row naming its keys');
    equal(row![1]!.split(',').map((k) => k.trim().replace(/\?$/, '')).sort(), [...MESSAGE_OPTION_KEYS].sort(), 'messages keys');
    equal(await specTable('#### A pool instance, and a group'), [...INSTANCE_KEYS].sort(), 'instance keys');
    equal(await specTable('#### The built-in group types'), Object.keys(BUILT_IN_GROUP_TYPES).sort(), 'the three built-ins by name');
  });
  test('poolSpecProblem and groupsNamedBy — the shape both derivations pass through', () => {
    equal(poolSpecProblem({}), null, 'empty is a spec');
    equal(poolSpecProblem({ config: 1, maxThreads: 1, maxConcurrentTasks: 1, idleTimeout: 0, groups: ['a'], residentGroups: { b: 2 }, cancelGraceMs: 0, messages: { flushIntervalMs: 1, maxBuffered: 1 } }), null, 'every key');
    ok(poolSpecProblem({ groups: ['a', 'a'] })!.includes('repeats'), 'repeated group');
    ok(poolSpecProblem({ residentGroups: { a: 0 } })!.includes('cost > 0'), 'zero cost');
    ok(poolSpecProblem({ residentGroups: 5 })!.includes('residentGroups'), 'wrong resident shape');
    ok(poolSpecProblem({ idleTimeout: -1 })!.includes('idleTimeout'), 'negative idle');
    ok(poolSpecProblem(null)!.includes('plain object'), 'null');
    equal(groupsNamedBy({ groups: ['a', 'b'], residentGroups: { b: 1, c: 2 } }), ['a', 'b', 'c'], 'union of both fields, deduplicated');
    equal(groupsNamedBy({ residentGroups: ['x'] }), ['x'], 'the list form');
    equal(groupsNamedBy({}), [], 'nothing named');
  });
  /**
   * **v0.33 (W159, P33 decision 6): `cancelGraceMs` and `messages`, each refused on each malformed value, on
   * all three roads** — `poolSpecProblem` itself, a DOCUMENT type's `pool` through `resolveRegistry`, and a
   * CLASS derivation's output — and each admitted value admitted on all three. Expected values from the spec's
   * table (the scheduler's own rules, its reference section 5): `cancelGraceMs` a number `>= 0`, `Infinity`
   * included; `flushIntervalMs` finite `> 0`; `maxBuffered` an integer `>= 1`; a PRESENT `messages` key held
   * whatever its value; a key beside the two refused. The scheduler's constructor is the second observer of
   * the numeric clauses, in `test/scheduler/envelope-worker.test.ts` — this suite builds nothing.
   */
  test('v0.33: cancelGraceMs and messages are refused on EVERY malformed value and admitted on every well-formed one — poolSpecProblem, a document type, a class', () => {
    // **PLAIN for `messages` is its prototype being Object.prototype or null** (W159's readers, conformity F4 =
    // adequacy F6): each of these passes the module's `isPlainObject` and is refused by `messages`' own test.
    class WithGetter { get flushIntervalMs(): number { return 9; } }
    const nonEnumerable = Object.defineProperty({}, 'flushIntervalMs', { value: 0, enumerable: false });
    const REFUSED: readonly [string, Record<string, unknown>, string][] = [
      ['cancelGraceMs -1', { cancelGraceMs: -1 }, 'cancelGraceMs'],
      ['cancelGraceMs -Infinity', { cancelGraceMs: -Infinity }, 'cancelGraceMs'],
      ['cancelGraceMs -0.5', { cancelGraceMs: -0.5 }, 'cancelGraceMs'],
      ['cancelGraceMs -Number.MIN_VALUE', { cancelGraceMs: -Number.MIN_VALUE }, 'cancelGraceMs'],
      ['cancelGraceMs NaN', { cancelGraceMs: NaN }, 'cancelGraceMs'],
      ['cancelGraceMs a string', { cancelGraceMs: '100' }, 'cancelGraceMs'],
      ['cancelGraceMs null', { cancelGraceMs: null }, 'cancelGraceMs'],
      ['cancelGraceMs a boolean', { cancelGraceMs: true }, 'cancelGraceMs'],
      ['cancelGraceMs an object', { cancelGraceMs: { ms: 1 } }, 'cancelGraceMs'],
      ['messages null', { messages: null }, 'messages'],
      ['messages a number', { messages: 5 }, 'messages'],
      ['messages a string', { messages: 'fast' }, 'messages'],
      ['messages an array', { messages: [20, 100] }, 'an array'],
      ['messages an EMPTY array — not plain, though it spreads to nothing', { messages: [] }, 'an array'],
      ['messages a Map', { messages: new Map([['flushIntervalMs', 20]]) }, 'a Map'],
      ['messages a Date', { messages: new Date(0) }, 'a Date'],
      ['messages a class instance whose prototype has a getter', { messages: new WithGetter() }, 'a WithGetter'],
      ['messages inheriting a key — Object.create({ flushIntervalMs: 9 })', { messages: Object.create({ flushIntervalMs: 9 }) as object }, 'prototype is not Object.prototype'],
      ['messages an undeclared key', { messages: { flushIntervalMs: 20, maxbuffered: 100 } }, '"maxbuffered"'],
      ['flushIntervalMs 0', { messages: { flushIntervalMs: 0 } }, 'flushIntervalMs'],
      ['flushIntervalMs negative', { messages: { flushIntervalMs: -5 } }, 'flushIntervalMs'],
      ['flushIntervalMs Infinity', { messages: { flushIntervalMs: Infinity } }, 'flushIntervalMs'],
      ['flushIntervalMs NaN', { messages: { flushIntervalMs: NaN } }, 'flushIntervalMs'],
      ['flushIntervalMs a string', { messages: { flushIntervalMs: '20' } }, 'flushIntervalMs'],
      ['flushIntervalMs PRESENT and undefined', { messages: { flushIntervalMs: undefined } }, 'flushIntervalMs'],
      ['maxBuffered 0', { messages: { maxBuffered: 0 } }, 'maxBuffered'],
      ['maxBuffered negative', { messages: { maxBuffered: -1 } }, 'maxBuffered'],
      ['maxBuffered fractional', { messages: { maxBuffered: 1.5 } }, 'maxBuffered'],
      ['maxBuffered Infinity', { messages: { maxBuffered: Infinity } }, 'maxBuffered'],
      ['maxBuffered NaN', { messages: { maxBuffered: NaN } }, 'maxBuffered'],
      ['maxBuffered a string', { messages: { maxBuffered: '100' } }, 'maxBuffered'],
      ['maxBuffered PRESENT and undefined', { messages: { maxBuffered: undefined } }, 'maxBuffered'],
    ];
    const ADMITTED: readonly [string, Record<string, unknown>][] = [
      ['cancelGraceMs 0', { cancelGraceMs: 0 }],
      ['cancelGraceMs fractional', { cancelGraceMs: 2.5 }],
      ['cancelGraceMs Infinity — never force', { cancelGraceMs: Infinity }],
      ['cancelGraceMs ABSENT as undefined, as every top-level key', { cancelGraceMs: undefined }],
      ['messages empty — the scheduler`s defaults', { messages: {} }],
      ['messages ABSENT as undefined', { messages: undefined }],
      ['flushIntervalMs fractional', { messages: { flushIntervalMs: 0.5 } }],
      ['maxBuffered 1', { messages: { maxBuffered: 1 } }],
      ['maxBuffered 2**53 — an integer, however large (the adequacy reader`s F8)', { messages: { maxBuffered: 2 ** 53 } }],
      ['messages with a null prototype — plain', { messages: Object.assign(Object.create(null) as object, { maxBuffered: 3 }) }],
      ['a NON-ENUMERABLE own key, even a malformed one: invisible to the copy and to the scheduler`s spread, so to this check', { messages: nonEnumerable }],
      ['both message keys', { messages: { flushIntervalMs: 20, maxBuffered: 100 } }],
    ];
    ok(new Set(REFUSED.map(([l]) => l)).size === REFUSED.length && new Set(ADMITTED.map(([l]) => l)).size === ADMITTED.length, 'labels distinct');
    // Every non-plain refusal gives the PLAIN reason, not merely a mention of `messages` (the adequacy reader's F2).
    for (const [label, v] of REFUSED) {
      const m = (v as { messages?: unknown }).messages;
      if (typeof m === 'object' && m !== null && Object.getPrototypeOf(m) !== Object.prototype) {
        ok(poolSpecProblem(v)!.includes('must be a plain object'), `${label}: refused for being non-plain — ${poolSpecProblem(v)}`);
      }
    }
    // Each list covers both keys and both message keys — a membership, so a list narrowed to one key is red here.
    const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
    equal([...new Set(REFUSED.flatMap(([, v]) => Object.keys(v)))].sort(), ['cancelGraceMs', 'messages'], 'the refused list exercises both new keys');
    equal([...new Set(REFUSED.flatMap(([, v]) => isObj(v.messages) && Object.getPrototypeOf(v.messages) === Object.prototype ? Object.keys(v.messages) : []))].sort(), ['flushIntervalMs', 'maxBuffered', 'maxbuffered'], 'and both message keys, and a stray one');
    const W: RegistryDocument['workers'] = { w: { url: 'u' } };
    const docType = (pool: Record<string, unknown>) => ({ workers: W, nodeTypes: { T: { worker: 'w', pool } } }) as unknown as RegistryDocument;
    const classType = (pool: Record<string, unknown>): RegistryCode => ({ nodeTypes: { C: { worker: 'w', pool: () => pool as PoolSpec } } });
    for (const [label, v, names] of REFUSED) {
      const p = poolSpecProblem(v);
      ok(p !== null && p.includes(names), `${label}: poolSpecProblem refuses it, naming ${names} — ${p}`);
      refused(docType(v), DerivationRefused, ['"T"', names], {}, `${label}, a document type`);
      refused({ workers: W }, DerivationRefused, ['"C"', 'not a PoolSpec', names], classType(v), `${label}, a class`);
    }
    for (const [label, v] of ADMITTED) {
      equal(poolSpecProblem(v), null, `${label}: poolSpecProblem admits it`);
      equal(resolveRegistry(docType(v), {}).pools.get('T')!.spec.cancelGraceMs, v.cancelGraceMs, `${label}: a document type resolves, carrying it`);
      equal(resolveRegistry({ workers: W }, classType(v)).pools.get('C')!.spec.messages, v.messages, `${label}: a class resolves, carrying it`);
    }
  });
  test('the built-in group types` schemas admit fact 2`s constructor arguments and refuse what the constructors would coerce', () => {
    const r = resolveRegistry({ groups: {
      c: { type: 'ConcurrentLimitGroup', config: { limit: 3 } },
      r: { type: 'RateLimitGroup', config: { windows: [{ limit: 60, windowMs: 60000 }, { limit: 1000, windowMs: 3600000 }] } },
      k: { type: 'KeyedRateLimitGroup', config: { windows: [{ limit: 1, windowMs: 1 }] } },
    } });
    equal([...r.groups.keys()].sort(), ['c', 'k', 'r'], 'three built-ins resolve');
    refused({ groups: { c: { type: 'ConcurrentLimitGroup', config: { limit: 1.5 } } } }, GroupConfigRefused, ['integer'], {}, 'a fractional limit');
    refused({ groups: { c: { type: 'ConcurrentLimitGroup', config: { limit: 1, id: 'x' } } } }, GroupConfigRefused, ['not declared'], {}, 'the id is the KEY, not config');
    // The adequacy reader (M03): the window schema's closed object is INSIDE items, and nothing observed it below the root.
    refused({ groups: { r: { type: 'RateLimitGroup', config: { windows: [{ limit: 1, windowMs: 1, burst: 2 }] } } } }, GroupConfigRefused, ['$.windows[0].burst not declared'], {}, 'a key the constructor would drop, inside a window');
    refused({ groups: { r: { type: 'RateLimitGroup', config: { windows: [{ limit: 1 }] } } } }, GroupConfigRefused, ['windowMs required'], {}, 'a window missing its span');
  });
});

// W65's conformity reader: four clauses the spec's refusal table states that had no fixture, or had one under the wrong class.
suite('the refusal table`s remaining clauses — the conformity reader`s four', (test) => {
  test('GroupTypeMissing clause 2: a registered group type that is not { configSchema?, create }', () => {
    refused(SAMPLE, GroupTypeMissing, ['"DailyBudgetGroup"', 'create(config, key)'], { ...code(), groupTypes: { DailyBudgetGroup: {} as never } }, 'an object with no create');
    refused(SAMPLE, GroupTypeMissing, ['"DailyBudgetGroup"', 'create(config, key)'], { ...code(), groupTypes: { DailyBudgetGroup: { create: 5 } as never } }, 'a create that is not a function');
  });
  test('the ordering guarantee: a bad pool AND a bad worker names the WORKER — every entry of a kind before the next kind', () => {
    refused(edited((d) => { d.pools!['prompt-big']!.type = 'Nope'; d.nodeTypes!.Prompt!.worker = 'nope'; }), WorkerMissing, ['"Prompt"', '"nope"'], code(), 'node types are read before pools, so the first defect named is the worker');
    refused(edited((d) => { d.pools!['prompt-big']!.type = 'Nope'; }), PoolTypeMissing, ['"prompt-big"', '"Nope"'], code(), 'and the pool alone is its own class — the control');
  });
  test('UndeclaredKey: predicates or languages that are not an array of names', () => {
    refused(edited((d) => { (d as { predicates?: unknown }).predicates = 'isLow'; }), UndeclaredKey, ['predicates', 'array of names']);
    refused(edited((d) => { (d as { languages?: unknown }).languages = { path: true }; }), UndeclaredKey, ['languages', 'array of names']);
  });
  // The adequacy reader (M08, M51, P3, P4).
  test('the ordering across KINDS: a worker schema outside the subset AND a type naming a missing worker names the schema — workers before node types', () => {
    refused(edited((d) => { d.workers!.prompt!.settingsSchema = { type: 'object', pattern: 'x' } as never; d.nodeTypes!.Prompt!.worker = 'nope'; }), SchemaRefused, ['"prompt"', '"pattern"'], code(), 'the worker`s defect is named, the type`s never reached');
  });
  test('CHECKED_WORKER_SCHEMAS is exactly the worker-table rows the spec marks CHECKED — a list bound to the document rather than to a count', async () => {
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const from = spec.indexOf('#### A worker entry');
    const table = spec.slice(from, spec.indexOf('\n##', from + 1));
    const checked = [...table.matchAll(/^\|\s*`(\w+)`\s*\|\s*optional, CHECKED\b/gm)].map((m) => m[1]!).sort();
    equal(checked, [...CHECKED_WORKER_SCHEMAS].sort(), 'the CHECKED rows are the applied schemas');
    const carried = [...table.matchAll(/^\|\s*`(\w+)`\s*\|\s*optional, CARRIED\b/gm)].map((m) => m[1]!).sort();
    equal([...checked, ...carried].sort(), WORKER_KEYS.filter((k) => k !== 'url').sort(), 'and CHECKED plus CARRIED is every schema a worker entry may carry');
  });
  test('a CLASS type`s named instance with NO config is derived from {} — refused by name when the class`s configSchema requires a key; a DOCUMENT type`s inherits the type`s config', () => {
    refused(edited((d) => { delete (d.pools!['prompt-big'] as { config?: unknown }).config; }), ConfigRefused, ['"prompt-big"', '$.model required'], code(), 'GpuModel is a class whose schema requires model');
    const r = resolveRegistry(edited((d) => { d.pools!['prompt-2'] = { type: 'Prompt' }; }), code());
    equal(r.pools.get('prompt-2')!.spec.config, r.pools.get('Prompt')!.spec.config, 'a document type`s config-less instance carries the type`s own config');
  });
  test('a repeated key in residentGroups is refused as one in groups is — P4', () => {
    ok((poolSpecProblem({ residentGroups: ['h', 'h'] }) ?? '').includes('repeats'), 'residentGroups repeats a key');
    ok((poolSpecProblem({ groups: ['h', 'h'] }) ?? '').includes('repeats'), 'the control: groups repeats a key');
    equal(poolSpecProblem({ residentGroups: ['h', 'k'] }), null, 'two distinct keys are fine');
  });
  test('DerivationRefused: a document type`s groups of the wrong shape — the table`s class, not NameMissing', () => {
    refused(edited((d) => { (d.nodeTypes!.Prompt as { groups?: unknown }).groups = 'gpu'; }), DerivationRefused, ['"Prompt"', 'groups must be an array']);
    refused(edited((d) => { (d.nodeTypes!.Prompt as { groups?: unknown }).groups = ['gpu', 3]; }), DerivationRefused, ['"Prompt"', 'groups must be an array']);
  });
});

/**
 * **W141 — ONE shape function, and both roads refuse every shape defect IDENTICALLY** — Q283, P31
 * decision 3. `checkRegistry` (what `new Driver` and `bootstrap` run) and `resolveRegistry` (what
 * `createRuntime` runs over a DOCUMENT) diverged twice while each kept its own copy of these checks —
 * W65 (a worker's and a pool's undeclared key, refused on one road only) and W109 (a type named as a
 * built-in, refused on one road only). Since W141 both call `checkRegistryShape`.
 *
 * **The claim is per CHECK**: for every throw site the shape function reaches — its own and the ones in
 * `checkNodeTypeShape`, `noUndeclared` and `checkSchema` it calls — one defect, handed to both roads,
 * refused with the same class, the same `at` and the same message. The defects are written from spec
 * section 3's refusal table and the clause each site states; the list of SITES is read from the source,
 * and the two are compared BOTH WAYS, so a site added without a defect, or a defect whose site left, is
 * red. One site is exempt, by name: a BUILT-IN type naming a worker, which no consumer input reaches
 * because a consumer's entry under a built-in's name is refused as a collision first.
 */
type W141Defect = {
  /** A fragment of the throw site's own source line, unique within the shape functions. */
  site: string;
  cls: new (...a: never[]) => RegistryError;
  /** What a hand-built registry carries — `checkRegistry`'s input. A class-form type goes to `code` on the document road. */
  reg: { workers?: Record<string, unknown>; nodeTypes?: Record<string, unknown>; pools?: Record<string, unknown> };
  /** The message names this — a literal from the site's own template. */
  says: string;
};
const W = { w: { url: 'test://w' } };
const OK_TYPE = { T: { worker: 'w' } };
const W141_DEFECTS: readonly W141Defect[] = [
  { site: "worker ${q(name)} is not an object", cls: UndeclaredKey, reg: { workers: { w: 5 } }, says: 'is not an object' },
  { site: "noUndeclared('worker',", cls: UndeclaredKey, reg: { workers: { w: { url: 'test://w', settingSchema: {} } } }, says: 'carries undeclared key "settingSchema"' },
  { site: 'has no url — the module URL of its worker class', cls: WorkerMissing, reg: { workers: { w: { url: '' } } }, says: 'has no url' },
  { site: 'for (const f of WORKER_KEYS.slice(1)) checkSchema(', cls: SchemaRefused, reg: { workers: { w: { url: 'test://w', inputSchema: { type: 'object', patternProperties: {} } } } }, says: 'inputSchema' },
  { site: 'is registered as a node type and is a BUILT-IN node type', cls: NameCollision, reg: { workers: W, nodeTypes: { Transform: { worker: 'w' } } }, says: 'BUILT-IN' },
  { site: "node type ${q(at)} is not an object", cls: UndeclaredKey, reg: { workers: W, nodeTypes: { T: 5 } }, says: 'is not an object' },
  { site: "noUndeclared('node type', at", cls: UndeclaredKey, reg: { workers: W, nodeTypes: { T: { worker: 'w', workr: 'w' } } }, says: 'carries undeclared key "workr"' },
  { site: '.pool must be an object of pool options', cls: DerivationRefused, reg: { workers: W, nodeTypes: { T: { worker: 'w', pool: 4 } } }, says: 'must be an object of pool options' },
  { site: "noUndeclared('node type pool'", cls: UndeclaredKey, reg: { workers: W, nodeTypes: { T: { worker: 'w', pool: { maxThread: 2 } } } }, says: 'carries undeclared key "maxThread"' },
  { site: 'node type ${q(at)}.pool: ${p}', cls: DerivationRefused, reg: { workers: W, nodeTypes: { T: { worker: 'w', pool: { maxThreads: 0 } } } }, says: 'maxThreads must be an integer >= 1' },
  { site: '.groups must be an array of group keys', cls: DerivationRefused, reg: { workers: W, nodeTypes: { T: { worker: 'w', groups: 'gpu' } } }, says: 'groups must be an array' },
  { site: "checkSchema(at, 'configSchema'", cls: SchemaRefused, reg: { workers: W, nodeTypes: { C: { worker: 'w', pool: () => ({}), configSchema: { type: 'object', patternProperties: {} } } } }, says: 'configSchema' },
  { site: 'names no worker — ', cls: WorkerMissing, reg: { workers: W, nodeTypes: { T: {} } }, says: 'names no worker' },
  { site: '.inline must be a boolean', cls: DerivationRefused, reg: { workers: W, nodeTypes: { T: { worker: 'w', inline: 'yes' } } }, says: 'inline must be a boolean' },
  { site: 'declares a retryPolicy that is not a RetryPolicy', cls: DerivationRefused, reg: { workers: W, nodeTypes: { T: { worker: 'w', retryPolicy: { maxRetries: -1, backoffMs: 0 } } } }, says: 'FD-V30' },
  { site: '.settings must be a plain object of defaults', cls: DerivationRefused, reg: { workers: W, nodeTypes: { T: { worker: 'w', settings: [1] } } }, says: 'settings must be a plain object' },
  { site: "which the registry's workers does not declare", cls: WorkerMissing, reg: { workers: W, nodeTypes: { T: { worker: 'nope' } } }, says: 'names worker "nope"' },
  { site: "pool ${q(key)} is not an object", cls: UndeclaredKey, reg: { workers: W, nodeTypes: OK_TYPE, pools: { p: 5 } }, says: 'is not an object' },
  { site: "noUndeclared('pool', key", cls: UndeclaredKey, reg: { workers: W, nodeTypes: OK_TYPE, pools: { p: { type: 'T', maxThreads: 2 } } }, says: 'carries undeclared key "maxThreads"' },
  { site: 'is named as node type ${q(key)} is', cls: NameCollision, reg: { workers: W, nodeTypes: OK_TYPE, pools: { T: { type: 'T' } } }, says: 'is named as node type "T"' },
  { site: 'which is not a node type`', cls: PoolTypeMissing, reg: { workers: W, nodeTypes: OK_TYPE, pools: { p: { type: 'Nope' } } }, says: 'names type "Nope"' },
];
/**
 * The one site no consumer input reaches — named, with its reason, so the both-ways comparison can hold every other.
 * *(It WAS reachable until W141's adequacy reader (Rl): `name in BUILT_IN_NODE_TYPES` read `Object.prototype`,
 * so a consumer's type called `constructor` reached it. The lookup is own-key now, and a case below holds that.)*
 */
const W141_UNREACHABLE: readonly string[] = ["names a worker — the library's own types name none"];

/** Both roads over one hand-built registry: `[class, at, message]`, or the string `ACCEPTED`. */
function bothRoads(reg: W141Defect['reg']): { check: unknown; resolve: unknown } {
  const verdict = (f: () => unknown) => {
    try { f(); return 'ACCEPTED'; } catch (e) { return e instanceof RegistryError ? [e.name, e.at, e.message] : `NOT A RegistryError: ${String(e)}`; }
  };
  const classes = Object.fromEntries(Object.entries(reg.nodeTypes ?? {}).filter(([, t]) => typeof (t as { pool?: unknown })?.pool === 'function'));
  const declared = Object.fromEntries(Object.entries(reg.nodeTypes ?? {}).filter(([n]) => !(n in classes)));
  return {
    check: verdict(() => checkRegistry(reg as never)),
    resolve: verdict(() => resolveRegistry({ workers: reg.workers, nodeTypes: declared, pools: reg.pools } as never, { nodeTypes: classes } as never)),
  };
}

suite('W141 — one shape function: checkRegistry and resolveRegistry refuse every shape defect identically (Q283)', (test) => {
  test('the defect list and the shape functions` throw sites are the SAME list, compared both ways — every site has a defect, every defect a site, and one site is exempt by name', async () => {
    const src = await readText(ROOT + 'src/definition/registry.ts');
    const region = (from: string, to: string) => { const a = src.indexOf(from); const b = src.indexOf(to, a); ok(a > 0 && b > a, `found ${from}`); return src.slice(a, b); };
    // Every function a shape check lives in: `checkNodeTypeShape`, and the three KINDS `checkRegistryShape`
    // composes — workers, node types, pools — which sit together, in that order, after it.
    const shape = region('function checkNodeTypeShape(', '\n}\n') + region('function checkWorkersShape(', '\n/**');
    const lines = shape.split('\n').filter((l) => /throw new |noUndeclared\(|checkSchema\(/.test(l));
    for (const d of W141_DEFECTS) equal(lines.filter((l) => l.includes(d.site)).length, 1, `the site "${d.site}" is ONE line of the shape functions`);
    const uncovered = lines.filter((l) => !W141_DEFECTS.some((d) => l.includes(d.site)) && !W141_UNREACHABLE.some((u) => l.includes(u)));
    equal(uncovered.map((l) => l.trim().slice(0, 90)), [], 'and every throwing line of them is a defect`s site or the exempt one — the other direction');
    ok(lines.length >= W141_DEFECTS.length, `${lines.length} throwing lines for ${W141_DEFECTS.length} defects`);
  });

  for (const d of W141_DEFECTS) {
    test(`${d.cls.name} at "${d.site}": refused by BOTH roads, with the same class, the same at and the same message`, () => {
      const { check, resolve } = bothRoads(d.reg);
      ok(Array.isArray(check) && check[0] === d.cls.name, `checkRegistry refuses with ${d.cls.name} — ${JSON.stringify(check)}`);
      ok(Array.isArray(check) && String(check[2]).includes(d.says), `and its message says ${d.says} — ${JSON.stringify(check)}`);
      equal(resolve, check, 'resolveRegistry refuses the same registry IDENTICALLY — one function, one verdict');
    });
  }

  test('the CONTROL: a clean registry of the same shapes is accepted by both roads — so the refusals above are the defects`, not the fixture`s', () => {
    const { check, resolve } = bothRoads({ workers: W, nodeTypes: { ...OK_TYPE, C: { worker: 'w', pool: () => ({}) } }, pools: { p: { type: 'T' } } });
    equal([check, resolve], ['ACCEPTED', 'ACCEPTED'], 'both accept');
  });

  test('a consumer name that is an Object.prototype member — constructor, toString, __proto__ — is an ordinary name on BOTH roads, never a built-in (the adequacy reader`s Rl)', () => {
    for (const name of ['constructor', 'toString', '__proto__']) {
      // JSON.parse, so `__proto__` is an OWN key and not the literal's prototype setter.
      const nodeTypes = JSON.parse(`{${JSON.stringify(name)}: {"worker": "w"}}`) as Record<string, unknown>;
      const { check, resolve } = bothRoads({ workers: W, nodeTypes });
      equal([check, resolve], ['ACCEPTED', 'ACCEPTED'], `a type named ${name} is accepted on both roads`);
      const pools = JSON.parse(`{${JSON.stringify(name)}: {"type": "T"}}`) as Record<string, unknown>;
      const named = bothRoads({ workers: W, nodeTypes: OK_TYPE, pools });
      equal([named.check, named.resolve], ['ACCEPTED', 'ACCEPTED'], `a pool named ${name} is accepted on both roads`);
    }
    let err: unknown = null;
    try { resolveRegistry({ workers: W } as never, { nodeTypes: { toString: { worker: 'w', pool: () => ({}) } } } as never); } catch (e) { err = e; }
    equal(err, null, 'a class named toString with NO document types is not a document-against-code collision');
  });

  test('ORDER across KINDS in resolveRegistry, as before W141 — workers, group types, groups, node types with their declared groups and default instances, then pools (the conformity reader`s 1)', () => {
    // Expected values: spec section 3's *every entry of a kind before the next kind is read*, on the order
    // `resolveRegistry` has read its kinds in since W65 — the five documents the conformity reader measured
    // old against new, and the adequacy reader's Rf.
    const first = (doc: Record<string, unknown>, c: Record<string, unknown> = {}): string => {
      try { resolveRegistry(doc as never, c as never); return 'ACCEPTED'; } catch (e) { return `${(e as RegistryError).name} at ${(e as RegistryError).at}`; }
    };
    const wk = { w: { url: 'test://w' } };
    const strict = { w: { url: 'test://w', configSchema: { type: 'object', properties: { n: { type: 'string' } } } } };
    equal(first({ workers: wk, nodeTypes: { A: { worker: 'w', groups: ['nope'] } }, pools: { p: { type: 'Nope' } } }), 'NameMissing at A', 'a node type`s declared group before a pool');
    equal(first({ workers: strict, nodeTypes: { A: { worker: 'w', config: { n: 1 } } }, pools: { p: { type: 'A', x: 1 } } }), 'TypeDefaultRefused at A', 'a type`s default instance before a pool');
    equal(first({ workers: wk, groups: { g: { type: 'NoSuchGroupType' } }, nodeTypes: { A: { worker: 'w' } }, pools: { p: { type: 'Nope' } } }), 'GroupTypeMissing at g', 'a group before a pool');
    equal(first({ workers: wk, groups: { g: { type: 'NoSuchGroupType' } }, nodeTypes: { A: { worker: 'w', inline: 'no' } } }), 'GroupTypeMissing at g', 'a group before a node type');
    equal(first({ workers: { w: { url: '' } }, nodeTypes: { A: { worker: 'w' } } }, { nodeTypes: { A: { worker: 'w', pool: () => ({}) } } }), 'WorkerMissing at w', 'a worker before the document-against-code collision');
    equal(first({ workers: wk, nodeTypes: { A: { worker: 'w' } } }, { nodeTypes: { A: { worker: 'w', pool: () => ({}), configSchema: { type: 'object', patternProperties: {} } } } }), 'NameCollision at A', 'the collision before the colliding class`s own shape (Rf)');
  });

  test('ORDER: a bad pool AND a bad worker names the WORKER on both roads (spec section 3`s refusal table), and a bad type before a bad pool', () => {
    const one = bothRoads({ workers: { w: { url: '' } }, nodeTypes: OK_TYPE, pools: { p: { type: 'Nope' } } });
    equal([(one.check as unknown[])[0], (one.resolve as unknown[])[0]], ['WorkerMissing', 'WorkerMissing'], 'the worker first, on both');
    const two = bothRoads({ workers: W, nodeTypes: { T: { worker: 'w', inline: 'no' } }, pools: { p: { type: 'Nope' } } });
    equal([(two.check as unknown[])[0], (two.resolve as unknown[])[0]], ['DerivationRefused', 'DerivationRefused'], 'the type before the pool, on both');
    // And a bad worker before a bad TYPE — the one pair the two above leave free (the adequacy reader's Rc).
    const three = bothRoads({ workers: { w: { url: '' } }, nodeTypes: { T: { worker: 'w', inline: 'no' } } });
    equal([(three.check as unknown[])[0], (three.resolve as unknown[])[0]], ['WorkerMissing', 'WorkerMissing'], 'the worker before the type, on both');
  });
});
