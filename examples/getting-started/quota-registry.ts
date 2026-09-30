/**
 * **The registry the authoring session in `AGENTS.md` section 20 is handed** —
 * [W101](../../doc/work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md), P25's exit
 * artifact. On `session-registry.ts`'s precedent beside it (W74, section 15) and for the same reason.
 *
 * **It is a module rather than a literal inside the snippet because the session needs a SECOND
 * OBSERVER, and a snippet cannot be one.** W101's adequacy reader made all nine of the section's
 * guards TAUTOLOGIES at `check:docs` EXIT 0 — individually and all nine at once — and deleted two of
 * its five steps for zero, because `X4` counts a `throw` textually and refuses `if (false)` by name,
 * so `x !== x` is outside both tests and `RUN_FLOOR` counts SNIPPETS rather than what is in one. That
 * is `doc/workflow.md` v0.20's clause doing exactly its job. The answer is not a better snippet: it is
 * that everything the session claims lives HERE, so `test/definition/gate-session.test.ts` asserts the
 * same verdicts from the same declarations, and a tautologised snippet leaves `npm test` RED.
 *
 * *What remains a ceiling is stated in that test rather than here.*
 */
import type { FlowDefinition, GateType, JsonSchema, RegistryDocument } from '../../index.ts';

/** What relative worker urls below resolve against — `import.meta.url` of this file. */
export const QUOTA_BASE: string = import.meta.url;

/**
 * **What `classify` RETURNS, and every clause of it is load-bearing.**
 *
 * `owner` is OPTIONAL: that is what makes the session's payoff visible, because a consumer past a
 * key-resolved route REQUIRES it and the arc fits only because the route guarantees the path resolved
 * ([ADR 0068](../../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)).
 * Both objects are CLOSED at their own level: that is what makes a misspelled key path a `no` rather
 * than a silence, and it is what lets the reason name the step — `ownr.id` stops at `$` and
 * `owner.ident` at `$.owner` (W100). The `examples` entry is the annotation ADR 0056 rule 1 makes it.
 */
export const CLASSIFIED: JsonSchema = {
  type: 'object',
  required: ['file'],
  additionalProperties: false,
  properties: {
    file: { type: 'string' },
    owner: { type: 'object', required: ['id'], additionalProperties: false, properties: { id: { type: 'string' }, name: { type: 'string' } } },
  },
  examples: [{ file: 'q1-eu.csv', owner: { id: 'ada', name: 'Ada' } }],
} as unknown as JsonSchema;

/** What the node past the key-resolved route requires — the key `classify` does not promise. */
export const PER_OWNER_IN: JsonSchema = {
  type: 'object',
  required: ['owner'],
  properties: { owner: { type: 'object', required: ['id'] } },
} as unknown as JsonSchema;

/**
 * **A CONSUMER'S OWN gate type: the first `limit` values per key, and only TWO of its three routes
 * depend on the key resolving.** Nothing this repository ships exercised that before — the corpus has
 * one gate and it is `distinct` — which is P25 prediction 3's reach.
 *
 * **Its `fn` never walks the key path.** The library resolves `settings.key` and hands the value over
 * as `ctx.key`, which is exactly why the library can derive what a route guarantees while the type
 * decides what to do with it (ADR 0068 rule 3: the member is a promise about PRESENCE along the path
 * and never about the leaf's type, even though this `fn` does in fact require a non-empty string).
 *
 * The `key === ''` arm is REACHED: `classify` hands on an owner whose `id` is the empty string rather
 * than stripping it, so the path RESOLVES and the TYPE is what refuses it — the other road to `nokey`
 * being a path that does not resolve at all. Both are asserted; W101's adequacy reader (F6) found that
 * arm dead when `classify` stripped the empty id, with this file's prose describing what did not happen.
 */
export const QUOTA: GateType = {
  routes: Object.freeze(['within', 'over', 'nokey']),
  defaultRoute: 'within',
  keyResolvedRoutes: Object.freeze(['within', 'over']),
  settingsSchema: {
    type: 'object',
    required: ['key', 'limit'],
    additionalProperties: false,
    properties: { key: { type: 'string' }, limit: { type: 'integer' } },
  } as unknown as JsonSchema,
  fn: ({ key, memory, settings }) => {
    if (typeof key !== 'string' || key === '') return 'nokey';
    const n = ((memory.get(key) as number | undefined) ?? 0) + 1;
    memory.set(key, n);                                          // ONE memory per gate per RUN
    return n <= Number(settings.limit) ? 'within' : 'over';
  },
};

/** The document. Three workers, each declaring only what the session's verdicts turn on. */
export const QUOTA_REGISTRY: RegistryDocument = {
  workers: {
    classify: { url: './classify.ts', outputSchema: CLASSIFIED },
    perOwner: { url: './per-owner.ts', inputSchema: PER_OWNER_IN },
    // Accepts any object, so the only thing that can make an arc into it `no` is the KEY PATH.
    skipped: { url: './skipped.ts', inputSchema: { type: 'object' } as unknown as JsonSchema },
  },
  nodeTypes: {
    Classify: { worker: 'classify', inline: true },
    PerOwner: { worker: 'perOwner', inline: true },
    Skipped: { worker: 'skipped', inline: true },
  },
} as unknown as RegistryDocument;

/** What `checkWiring` reads: the document's own parts plus the gate TYPE, which a document cannot carry. */
export const QUOTA_WIRING = {
  workers: QUOTA_REGISTRY.workers,
  nodeTypes: QUOTA_REGISTRY.nodeTypes,
  gateTypes: { quota: QUOTA },
};

/**
 * The flow, parameterised by the gate's KEY PATH — which is the one thing the session varies.
 * `over` and `nokey` share ONE consumer on purpose: two arcs into one node, so a refusal that belongs
 * to the ROUTE rather than to the node is legible as two verdicts in one report.
 */
export const quotaFlow = (key: string, limit = 2): FlowDefinition => ({
  flowId: 'per-owner', version: 1, entry: 'batch',
  nodes: [
    { id: 'batch', kind: 'map', over: 'files', branch: 'classify' },
    { id: 'classify', kind: 'task', type: 'Classify', edges: [{ to: 'quota' }] },
    { id: 'quota', kind: 'gate', type: 'quota', settings: { key, limit }, edges: [{ to: 'report' }, { route: 'over', to: 'skip' }, { route: 'nokey', to: 'skip' }] },
    { id: 'report', kind: 'task', type: 'PerOwner', edges: [{ to: 'all' }] },
    { id: 'skip', kind: 'task', type: 'Skipped', edges: [{ to: 'all' }] },
    { id: 'all', kind: 'join', of: 'batch', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition);

/**
 * The five files the session runs, and every one is load-bearing: `ada` owns THREE, so the third goes
 * `over` a quota of two; `grace` owns one, so hers stays `within` and the count is per KEY rather than
 * per run; `scratch.tmp` has an owner whose id is EMPTY, so the path resolves and the type refuses;
 * and `unowned.csv` is in no owner map, so the path does not resolve at all.
 */
export const QUOTA_FILES: readonly { file: string }[] = Object.freeze(
  ['q1-eu.csv', 'q1-us.csv', 'q2-eu.csv', 'q1-apac.csv', 'scratch.tmp', 'unowned.csv'].map((file) => ({ file })),
);
