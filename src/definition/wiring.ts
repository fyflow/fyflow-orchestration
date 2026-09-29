/**
 * **The WIRING CHECK: one verdict per arc of a flow, from the schemas its workers declare — what a
 * schema buys an author, before a run** —
 * [P19](../../doc/plans/p19-what-a-schema-buys-an-author.md) decisions 4 and 8,
 * `spec/flow-definition.md` section 3's *what the schemas buy an author* subsection (v0.21),
 * [W73](../../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md).
 *
 * **What an arc is.** A consumer is a `task` node; what it RECEIVES is `FD-C1`'s value, and this
 * module derives the SCHEMA of that value from the producer side of each arc that reaches it, one
 * verdict per arc, in five shapes: an ordinary **edge** (the producer's `outputSchema`), a fan-out
 * **branch** (the same value the fan-out received — `JP-R11`), a map **item** (one element of the
 * `over` array the map received), a join's **record** (`JP-R12`'s, keyed by branch path),
 * and a **needs** composition (`FD-C1`'s table: `"."` is the edge's value, a node id is that node's
 * output, `[id]` an array of them, a `?` makes the key optional — and over a map's item, one
 * composed object per element, evaluated per element as the run does). The ENTRY has no arc: its
 * `needs` composes the payload, which is `FD-R4`'s. The consumer's side is its type's
 * worker `inputSchema`. A `transform` on the consumer is not read statically — the transformed arc
 * is verified by RUNNING the expression on a SAMPLE (below).
 *
 * **The verdicts, five** (P19 decision 4's four, plus one for an absent schema — P18 decision 3's
 * *absent means UNCHECKED*): `fits`; `no` (does not fit, no transform); `transform-passes` and
 * `transform-fails` (a transform present, the sample run, the result held to the consumer's
 * `inputSchema`); `unchecked`, naming the side that declares no schema. The relation is TOTAL —
 * every arc gets one, and none is *cannot tell* (P19 prediction 2).
 *
 * **The relation `fits(P, C)` is P19 fact 3's, promoted from `dev-dist/p19/fact-3-fits.mjs`
 * verbatim in shape — one arm added to clause 4 for the map record below — and its ONE stated
 * leniency is kept and named**: an OPEN producer (no
 * `additionalProperties: false`) that does not name a key the consumer DESCRIBES but does not
 * REQUIRE is read as never emitting it. Read strictly — *the producer may put anything there* —
 * every open output schema into a consumer with an optional typed property is `no`, which is what
 * the check said of `typed`'s echoed items into `rank` while the strict reading was tried at W73's
 * build; an author who leaves an output schema open means *there are keys I do not describe*, not
 * *the keys you describe may hold anything*. The twelve controls of `fact-3-controls.log` hold, and
 * the leniency has its own control in the suite so it is a choice rather than an accident.
 *
 * **A join successor's input is a DIFFERENT question** (decision 8), and the subset cannot say
 * *any key, each of shape S* — measured at W73's declaration: `additionalProperties: <schema>` is
 * refused by `schemaProblem`. So the record's shape is THIS MODULE's knowledge and not a keyword's:
 * for a `fanout` region the record schema is exact in its KEYS (every declared branch path a
 * property, no other key) and REQUIRES none of them — a branch that is lost has no entry, and a
 * branch is lost by three roads no document shows (an `optional` task failing, a person resolving a
 * suspended task `failed`, a policy firing before it settles — `JP-R12`, `spec/join-policy.md`
 * section 2), so a consumer requiring a branch key is `no`; and for a `map` region it is an object whose keys are
 * branch paths minted at run time, each of the branch's output shape — carried internally as
 * `additionalProperties: <schema>` with a `branchKeys` marker, which `fits` reads and no author may
 * write. A consumer naming a property that is not a branch path never meets it.
 *
 * **A transformed arc is verified on a SAMPLE, and the verdict says which sample** (ADR 0056 rule
 * 3, [Q301](../../doc/open-questions.md)): the producer's first declared example, else the
 * generator's witness, and — where the producer is a region — the ARITY the sample had, because a
 * transform's result changes type with the arity ([Q263](../../doc/open-questions.md): `*.score`
 * is an array at two, a scalar at one, absent at zero). The expression is evaluated by the adapter's
 * WORKER half, imported here by its module URL — a URL, never the engine's bare specifier, so
 * `RT-R12` holds and this module loads no engine of its own. A witness is not a proof, and a
 * sample that passes is reported as *the sample passed*, never as *fits*.
 *
 * Pure over data except the one `import()` of an adapter's worker half, which is async and is why
 * `checkWiring` returns a Promise; no `node:` import, no clock (`RT-R3`, `RT-R4`).
 */
import { describeFindings, findings, type JsonSchema } from './schema.ts';
import type { Edge, FanoutNode, FlowDefinition, FlowNode, GateNode, GateType, JoinNode, MapNode, Registry } from './types.ts';
import { effectiveSettings, gateTypesOf, languagesOf, nodeTypesOf, referenceTarget, workersOf } from './validate.ts';
import { allRegions, branchPathOf, buildGraph, type Graph, type RegionSets } from './regions.ts';
import { sampleOf, type SampleSource } from './witness.ts';

// ---- the verdict -----------------------------------------------------------------------------

/** The five shapes of *what a node receives* — `FD-C1`, `JP-R11`, `JP-R12`. */
export type WiringShape = 'edge' | 'branch' | 'item' | 'record' | 'needs';
/** The five verdicts. */
export type VerdictKind = 'fits' | 'no' | 'transform-passes' | 'transform-fails' | 'unchecked';
/** The value a transformed arc was verified on, where it came from, and what came out. */
export interface WiringSample {
  /** Whether the producer side was a declared example or the generator's witness (Q301). */
  source: SampleSource;
  /** How many branches or items the sample had, where the producer is a region or a map (Q263). */
  arity?: number;
  /** What the transform was handed (for an `item` arc, or a `needs` composed over one, the whole array — one evaluation per element). */
  value: unknown;
  /** What it produced, or the failure's message. */
  result?: unknown;
}
export interface WiringVerdict {
  /** The task node on the consuming side. */
  consumer: string;
  shape: WiringShape;
  /** The task whose output arrives, the join whose record arrives, or the opener of the region the consumer sits in. */
  producer: string;
  /** For a `branch` or `item` arc: the fan-out or map the value passed through. */
  through?: string;
  kind: VerdictKind;
  /** The relation's own reason, in the words `fact-3-controls.log` prints. */
  why: string;
  sample?: WiringSample;
}
export interface WiringReport {
  flowId: string;
  verdicts: WiringVerdict[];
  counts: Record<VerdictKind, number>;
  /**
   * The tasks the run's PAYLOAD reaches with no worker in between — the entry task, or every branch
   * task of an entry region, recursively. No arc leads to them; `FD-R4` holds the payload to their
   * input schemas at `start()`, once per run.
   */
  entry: string[];
}
/**
 * What the check reads of a registry: the workers' two schemas, the types' workers, the languages' worker
 * halves — and, since v0.25, the GATE types, for the one thing a route can guarantee (ADR 0068).
 *
 * **`gateTypes` is the fourth key and it was the missing one.** Before W99 this was a `Pick` of three and
 * `wiring.ts` contained zero occurrences of `gateTypes`, so the check could not know what routes a gate's
 * type declares, which is default, or what any of them mean — which is why it read a gate as a
 * pass-through: with no type in hand there was nothing else to read. Widening it cost **zero** typecheck
 * errors on all five lanes, because `Registry.gateTypes` is optional (W99's declaration step, P25 fact 5).
 */
export type WiringRegistry = Pick<Registry, 'workers' | 'nodeTypes' | 'languages' | 'gateTypes'>;

// ---- the relation ----------------------------------------------------------------------------

const TYPES = ['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'];
const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
/** An OWN key, never `k in o` — `Object.prototype` answers `toString`, `constructor` and `valueOf` for every
 * object, and a schema's `properties` is an ordinary object. `schema.ts` has the same one-liner for the same
 * reason; this is its third and fourth site in this repository (W99's conformity reader, F1). */
const own = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);
const jsonType = (v: unknown): string => v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;
const typesOf = (s: Record<string, unknown>): string[] => {
  if (s.const !== undefined) return [jsonType(s.const)];
  if (Array.isArray(s.enum)) return [...new Set(s.enum.map(jsonType))];
  if (s.type === undefined) return TYPES.slice();
  return Array.isArray(s.type) ? (s.type as string[]).slice() : [s.type as string];
};
const widen = (ts: string[]): string[] => ts.flatMap((t) => (t === 'integer' ? ['integer'] : t === 'number' ? ['number', 'integer'] : [t]));
const canon = (v: unknown): string => JSON.stringify(v);
/** A key `JP-R12` can mint: a branch path — `0`, `1.0`, `12.3.1`. */
const BRANCH_KEY = /^\d+(\.\d+)*$/;

/**
 * **Every value `P` admits is accepted by `C`** — P19 fact 3's relation, verbatim in shape, over
 * the twelve constraining keywords (`examples` is read by nothing, ADR 0056 rule 1). `'fits'` or
 * `'no'` with the reason, never a third answer. `path` is where in the two schemas the answer was
 * decided, as `findings` addresses a value.
 */
export function fits(P: JsonSchema, C: JsonSchema, path = '$'): { verdict: 'fits' | 'no'; why: string } {
  const p = P as Record<string, unknown>;
  const c = C as Record<string, unknown>;
  // 1. the type sets: P's must be a subset of C's (number admits integer, not the reverse)
  const pt = typesOf(p), ct = widen(typesOf(c));
  const extra = pt.filter((t) => !ct.includes(t));
  if (extra.length) return { verdict: 'no', why: `${path}: producer may be ${extra.join('|')}, consumer accepts ${typesOf(c).join('|')}` };
  // 2. literal constraints: const / enum on the consumer must contain everything P can produce
  if (c.const !== undefined) {
    if (p.const === undefined || canon(p.const) !== canon(c.const)) return { verdict: 'no', why: `${path}: consumer requires const ${canon(c.const)}` };
  }
  if (Array.isArray(c.enum)) {
    const pv = p.const !== undefined ? [p.const] : (Array.isArray(p.enum) ? p.enum : null);
    if (!pv) return { verdict: 'no', why: `${path}: consumer requires one of ${canon(c.enum)}, producer is unbounded` };
    const miss = pv.filter((v) => !(c.enum as unknown[]).some((e) => canon(e) === canon(v)));
    if (miss.length) return { verdict: 'no', why: `${path}: producer may emit ${canon(miss)} which consumer's enum refuses` };
  }
  // 3. numeric / length bounds: the consumer's bound must be no tighter than the producer's
  for (const [k, dir] of [['minimum', 'ge'], ['maximum', 'le'], ['minLength', 'ge'], ['maxLength', 'le'], ['minItems', 'ge']] as const) {
    if (c[k] === undefined) continue;
    if (p[k] === undefined) return { verdict: 'no', why: `${path}: consumer bounds ${k} ${c[k]}, producer declares no ${k}` };
    const ok = dir === 'ge' ? (p[k] as number) >= (c[k] as number) : (p[k] as number) <= (c[k] as number);
    if (!ok) return { verdict: 'no', why: `${path}: producer ${k} ${p[k]} is looser than consumer ${k} ${c[k]}` };
  }
  // 4. objects: every property the consumer REQUIRES the producer must require; each shared
  //    property fits recursively; a key the consumer describes and the producer does not name is
  //    read as never emitted (the header's stated leniency) unless the consumer REQUIRES it, or
  //    unless the producer is a map's record, whose branch-path keys are known to carry the
  //    branch's shape; the consumer's additionalProperties:false forbids any producer key it does
  //    not name
  if (ct.includes('object') && pt.includes('object')) {
    const preq = new Set((p.required ?? []) as string[]), creq = (c.required ?? []) as string[];
    for (const k of creq) if (!preq.has(k)) return { verdict: 'no', why: `${path}: consumer requires "${k}", producer does not guarantee it` };
    const pp = (p.properties ?? {}) as Record<string, JsonSchema>, cp = (c.properties ?? {}) as Record<string, JsonSchema>;
    // A `JP-R12` record over a map region: its keys are branch paths, each of the branch's shape (the header).
    const record = p.branchKeys === true && isPlainObject(p.additionalProperties) ? (p.additionalProperties as JsonSchema) : undefined;
    for (const k of Object.keys(cp)) {
      // **`own`, never a bare `k in pp`** — the third and fourth occurrence of a class this repository has
      // now met three times: W65's conformity reader found bare `in` walking `Object.prototype` at three
      // keyword sites, W74's found it again in `pathsOf`, and **W99's found it HERE**, in `fits` itself and
      // reachable with no gate at all. A consumer that describes `toString` and does not require it read `no`
      // with an invented type union (`producer may be object|array|number|integer|boolean|null`), because
      // `pp['toString']` is `Object.prototype.toString` and the recursion below read that native FUNCTION as
      // the producer's sub-schema — where the same consumer asking about `zzz` reads `fits` by the leniency
      // one line down. *Measured on an ordinary edge, so it predates gates and this item found it by looking
      // at what a route guarantees.*
      if (!own(pp, k)) {
        if (record !== undefined && BRANCH_KEY.test(k)) {
          const r = fits(record, cp[k]!, `${path}.${k}`);
          if (r.verdict !== 'fits') return { verdict: 'no', why: `${r.why} (a branch path the map's record may mint)` };
          continue;
        }
        if (p.additionalProperties === false) continue;            // producer never emits k
        if (!creq.includes(k)) continue;                           // consumer does not need k; the producer is read as not emitting it (the leniency)
        return { verdict: 'no', why: `${path}.${k}: consumer describes it, producer is open there` };
      }
      const r = fits(pp[k]!, cp[k]!, `${path}.${k}`);
      if (r.verdict !== 'fits') return r;
    }
    if (c.additionalProperties === false) {
      if (p.additionalProperties !== false) return { verdict: 'no', why: `${path}: consumer forbids extra keys, producer may emit any` };
      const leak = Object.keys(pp).filter((k) => !own(cp, k));
      if (leak.length) return { verdict: 'no', why: `${path}: producer emits ${leak.join(',')} which consumer forbids` };
    }
  }
  // 5. arrays: items fit recursively
  if (ct.includes('array') && pt.includes('array') && c.items !== undefined) {
    if (p.items === undefined) return { verdict: 'no', why: `${path}[]: consumer constrains items, producer does not` };
    const r = fits(p.items as JsonSchema, c.items as JsonSchema, `${path}[]`);
    if (r.verdict !== 'fits') return r;
  }
  return { verdict: 'fits', why: '' };
}

// ---- what arrives at a node -------------------------------------------------------------------

/** One arrival on the producer side of an arc: its schema and its sample, or why neither exists. */
interface Arrival {
  shape: WiringShape;
  producer: string;
  through?: string;
  schema?: JsonSchema;
  /** `undefined` where no sample can be built — a side with no schema. */
  sample?: { value: unknown; source: SampleSource; arity?: number };
  /** Set when `schema` is absent: which side declares nothing, or why the value cannot be derived. */
  unchecked?: string;
  /** Set on a derived `no`: the producer's schema says the value cannot be what the consumer's road needs (a map over a key that is not an array). */
  refused?: string;
  /**
   * **The sample is an ARRAY of samples, one per map item, and a transform runs once per element** — set
   * by an `item` arrival and KEPT by a `needs` composed over one (each element composed under the `"."`
   * keys). W73's adequacy reader (R7) found a map's branch task composing `"."` and transforming it
   * sampled on the whole `over` array under the key, evaluated ONCE, while the schema beside it was one
   * item's — a correct wiring read `transform-fails`. The evaluation rule follows this flag, never the shape.
   */
  perItem?: true;
}

/**
 * **The first task(s) a run's payload reaches with no worker in between** — the entry task, or the
 * branch tasks of an entry region, recursively; for a map, one per element of the array the
 * payload carries under `over`. `FD-R4`'s targets at `start()`; the driver composes each value
 * through the node's `needs` (a `"."` is the only reference an entry can carry) and holds it to the
 * task's worker `inputSchema`. ONE walk, two callers — the driver with the payload, and
 * `checkWiring` with none for `WiringReport.entry` (W73's adequacy reader found a second walk
 * beside this one whose map arm nothing bound; there is one walk now, `entryWalk`).
 *
 * **`choose` is what a RUN knows and a static report does not: which route a gate takes** — v0.23's run
 * half, [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md). Without it an entry gate hands the walk
 * EVERY route's target, which is right for `checkWiring` (any of them is a place the payload may land) and
 * wrong for `FD-R4`: measured at W93's declaration step, a payload `distinct` sends to `first` was still held
 * to the `nokey` target's `inputSchema`, so a run could be refused at `start()` by a task it never reaches.
 * The driver passes the edges its gate actually takes — one, or none where the type's `fn` would stop the run
 * — and the walk goes on from those alone. Absent, every edge, exactly as before.
 */
export function boundaryTargets(
  flow: FlowDefinition,
  payload: unknown,
  choose?: (gate: GateNode, value: unknown) => readonly Edge[],
): { node: string; value: unknown }[] {
  return entryWalk(flow, payload, true, choose);
}

/** The names `boundaryTargets` walks to, with no payload — what `WiringReport.entry` lists. */
function entryTasks(flow: FlowDefinition): string[] {
  return [...new Set(entryWalk(flow, undefined, false).map((t) => t.node))];
}

/** The walk both of the above are: `sampled` reads the payload's array under a map's `over`; unsampled, a map's branch is walked once. */
function entryWalk(
  flow: FlowDefinition,
  payload: unknown,
  sampled: boolean,
  choose?: (gate: GateNode, value: unknown) => readonly Edge[],
): { node: string; value: unknown }[] {
  const byId = new Map(flow.nodes.map((n) => [n.id, n] as const));
  const out: { node: string; value: unknown }[] = [];
  const seen = new Set<string>();
  const walk = (id: string, value: unknown): void => {
    const n = byId.get(id);
    if (!n || seen.has(id)) return;
    if (n.kind === 'task') { out.push({ node: id, value }); return; }
    seen.add(id);
    if (n.kind === 'fanout') for (const b of n.branches) walk(b, value);
    // **A gate hands on what reached it, unchanged, on ONE route** (v0.23, ADR 0066) — so the payload may
    // reach any of its routes' targets, and statically every one is a place it may land. Without this arm an
    // entry gate ENDED the walk and the report's `entry` was empty (W92's census). Which ONE route a run takes
    // is the gate's decision at run time, and the driver narrows `FD-R4`'s targets to it through `choose`
    // (W93) — so a static report walks every route and a run walks the one it takes.
    if (n.kind === 'gate') for (const e of choose ? choose(n, value) : n.edges ?? []) walk(e.to, value);
    if (n.kind === 'map') {
      if (!sampled) { walk(n.branch, undefined); return; }
      // A map's own `needs` composed as `enter` composes it — at an entry only `"."` can be named
      // (`FD-V27`), so the composition is the value under each such key. W73's conformity reader (15).
      const composed = n.needs === undefined ? value
        : Object.fromEntries(Object.entries(n.needs).filter(([, r]) => r === '.').map(([k]) => [k, value]));
      const arr = (composed as Record<string, unknown> | null | undefined)?.[n.over];
      if (Array.isArray(arr)) for (const v of arr) walk(n.branch, v);
    }
  };
  walk(flow.entry, payload);
  return out;
}

class Wiring {
  private readonly byId: ReadonlyMap<string, FlowNode>;
  private readonly graph: Graph;
  private readonly regions: RegionSets[];
  private readonly inbound = new Map<string, { from: string; kind: 'edge' | 'branch' | 'item' | 'join' | 'gate'; route?: string }[]>();
  private readonly memo = new Map<string, Arrival[]>();
  private readonly workers: ReturnType<typeof workersOf>;
  private readonly types: ReturnType<typeof nodeTypesOf>;
  private readonly gateTypes: ReadonlyMap<string, GateType>;
  // Explicit fields, never parameter properties: Node's type stripping refuses those (`RT-R9`, `S4`),
  // which is how P18's own sample failed to load (W67's declaration step).
  constructor(
    flow: FlowDefinition,
    workers: ReturnType<typeof workersOf>,
    types: ReturnType<typeof nodeTypesOf>,
    gateTypes: ReadonlyMap<string, GateType>,
  ) {
    this.workers = workers;
    this.types = types;
    this.gateTypes = gateTypes;
    this.byId = new Map(flow.nodes.map((n) => [n.id, n] as const));
    this.graph = buildGraph(flow);
    this.regions = allRegions(this.graph, flow);
    const add = (to: string, from: string, kind: 'edge' | 'branch' | 'item' | 'join' | 'gate', route?: string) =>
      this.inbound.set(to, [...(this.inbound.get(to) ?? []), { from, kind, route }]);
    for (const n of flow.nodes) {
      if (n.kind === 'task' || n.kind === 'join') for (const e of n.edges ?? []) add(e.to, n.id, n.kind === 'task' ? 'edge' : 'join');
      // **A gate carries what reached it, REFINED by what its route GUARANTEES** (v0.25,
      // ADR 0068). It was a flat PASS-THROUGH until W99 — what left it on any route was exactly what
      // reached it — which made the arc through a gate the arc into it and produced Q391's false `no`.
      // Without this line at all a gate's edges added no inbound arc, so every consumer after a gate had
      // NO arrival and its arcs VANISHED from the report (W92's declaration-step census), and that half
      // is unchanged: the arc exists, and only what it carries has learned anything.
      //
      // **The ROUTE is carried here and resolved against the type's `defaultRoute` where the edge
      // declares none** — not treated as a route named `(default)`. `distinct`'s default IS one of its
      // key-resolved routes, so a set holding a placeholder would have been right for the only type that
      // exists and wrong for a type whose default is its unresolved route, in silence (W99's declaration
      // step, correction 3; `doc/workflow.md` v0.23's selection clause).
      if (n.kind === 'gate') {
        const dflt = this.gateTypes.get(n.type)?.defaultRoute;
        for (const e of n.edges ?? []) add(e.to, n.id, 'gate', e.route ?? dflt);
      }
      if (n.kind === 'fanout') for (const b of n.branches) add(b, n.id, 'branch');
      if (n.kind === 'map') add(n.branch, n.id, 'item');
    }
  }

  /**
   * **A schema with `required` added along a dotted key path, at every step** — the refinement a
   * key-resolved route licenses. A step the producer's schema does not describe is left alone rather than
   * invented: `required` on a key no `properties` entry mentions is still a promise the value carries it,
   * which is what the consumer asked about, and describing its SHAPE is not this function's to guess.
   */
  private requireAlong(schema: JsonSchema | undefined, key: string): JsonSchema | undefined {
    if (schema === undefined || key === '') return schema;
    const steps = key.split('.');
    const go = (s: unknown, i: number): unknown => {
      if (i >= steps.length || typeof s !== 'object' || s === null || Array.isArray(s)) return s;
      const o = s as Record<string, unknown>;
      const here = steps[i]!;
      const req = Array.isArray(o.required) ? (o.required as string[]) : [];
      const props = (o.properties ?? {}) as Record<string, unknown>;
      // **An OWN key, never a bare read.** `FD-V16`'s charset admits `toString`, `constructor`, `valueOf` and
      // `__proto__` as key-path segments, and a gate whose `key` is one of them is a document the validator
      // accepts with ZERO findings — so `props['toString']` would return `Object.prototype.toString`, a native
      // FUNCTION, and this walk would write it into the refined schema's `properties` for `fits` to read as a
      // sub-schema. Measured by W99's conformity reader: it FLIPS a verdict, in the lenient direction, on
      // nothing but whether the segment is a prototype key. **Third occurrence of this class here** — W65's
      // conformity reader found bare `in` at three keyword sites and W74's found it again in `pathsOf`; the
      // guard `readKeyPath` and `schema.ts`' own `own()` both use is this one.
      const described = own(props, here);
      return {
        ...o,
        required: req.includes(here) ? req : [...req, here],
        properties: described ? { ...props, [here]: go(props[here], i + 1) } : props,
      };
    };
    return go(schema, 0) as JsonSchema;
  }

  /** The key path a gate resolves, or `''` where it names none — `settings.key` is the one setting the library reads. */
  private keyOf(gate: GateNode): string {
    const k = (gate.settings as Record<string, unknown> | undefined)?.key;
    return typeof k === 'string' ? k : '';
  }

  /** A task's worker entry's schema of one kind, or `undefined` with the reason. */
  private schemaOf(nodeId: string, kind: 'inputSchema' | 'outputSchema'): { schema?: JsonSchema; why?: string } {
    const n = this.byId.get(nodeId);
    if (!n || n.kind !== 'task') return { why: `${nodeId} is not a task` };
    const t = this.types.get(n.type);
    if (!t) return { why: `type "${n.type}" of "${nodeId}" is not in the registry` };
    const w = this.workers.get(t.worker);
    if (!w) return { why: `worker "${t.worker}" of type "${n.type}" is not in the registry` };
    const s = w[kind];
    if (s === undefined) return { why: `"${nodeId}" (type "${n.type}", worker "${t.worker}") declares no ${kind}` };
    return { schema: s };
  }

  /** What a task PRODUCES, as an arrival on the arc it sends. */
  private produced(taskId: string): Pick<Arrival, 'schema' | 'sample' | 'unchecked'> {
    const { schema, why } = this.schemaOf(taskId, 'outputSchema');
    if (schema === undefined) return { unchecked: why };
    const s = sampleOf(schema)!;
    return { schema, sample: { value: s.value, source: s.source } };
  }

  /** Every arrival at `nodeId`, through its `needs` where it declares one. Memoised; the graph is acyclic (`FD-V10`). */
  arrivals(nodeId: string): Arrival[] {
    const hit = this.memo.get(nodeId);
    if (hit) return hit;
    const node = this.byId.get(nodeId);
    const raw: Arrival[] = [];
    for (const { from, kind, route } of this.inbound.get(nodeId) ?? []) {
      if (kind === 'edge') raw.push({ shape: 'edge', producer: from, ...this.produced(from) });
      else if (kind === 'branch') for (const a of this.arrivals(from)) raw.push({ ...a, shape: 'branch', through: from });
      else if (kind === 'item') for (const a of this.arrivals(from)) raw.push(this.item(a, this.byId.get(from) as MapNode));
      // **A gate: every arrival AT the gate arrives after it, REFINED by what this route guarantees.** Same
      // shape, same producer, same sample — the value is the one that reached the gate — and where the
      // type declares this route key-resolved the SCHEMA gains `required` along the node's key
      // path, because the run cannot take that route unless the path was there (ADR 0068).
      //
      // Three ways it does not apply, each a silence rather than a guess: a type that declares no
      // `keyResolvedRoutes` (every type before v0.25), a gate that names no `key`, and a route the type
      // does not call key-resolved. In all three the arrival passes through exactly as it did before.
      else if (kind === 'gate') {
        const gate = this.byId.get(from) as GateNode;
        const key = this.keyOf(gate);
        const resolved = key !== '' && route !== undefined
          && (this.gateTypes.get(gate.type)?.keyResolvedRoutes ?? []).includes(route);
        for (const a of this.arrivals(from)) raw.push(resolved ? { ...a, schema: this.requireAlong(a.schema, key) } : { ...a });
      }
      else raw.push(this.record(this.byId.get(from) as JoinNode));
    }
    const needs = (node as { needs?: Readonly<Record<string, unknown>> } | undefined)?.needs;
    // **The ENTRY has no arc** (the spec's subsection): an entry task's `needs` composes the run's PAYLOAD,
    // which `FD-R4` holds at `start()` — the first cut minted a synthetic `<entry>` producer with schema `{}`
    // here and gave the entry a `no` (W73's adequacy reader, s1); with nothing inbound there is nothing to say.
    const out = needs ? raw.map((a) => this.composed(a, needs)) : raw;
    this.memo.set(nodeId, out);
    return out;
  }

  /** One element of the array the map received under `over` — `JP-R11`'s own item. */
  private item(a: Arrival, m: MapNode): Arrival {
    const base = { shape: 'item' as const, producer: a.producer, through: m.id };
    if (a.schema === undefined) return { ...base, unchecked: a.unchecked ?? a.refused };
    const s = a.schema as Record<string, unknown>;
    const props = (s.properties ?? {}) as Record<string, JsonSchema>;
    const over = props[m.over];
    if (over === undefined) {
      if (s.additionalProperties === false) return { ...base, refused: `map "${m.id}" is over "${m.over}", which the producer's schema never emits (FD-R2 at run time)` };
      return { ...base, unchecked: `map "${m.id}" is over "${m.over}", which the producer's schema says nothing about` };
    }
    const ts = typesOf(over as Record<string, unknown>);
    if (ts.length !== 1 || ts[0] !== 'array') return { ...base, refused: `map "${m.id}" is over "${m.over}", which the producer's schema calls ${ts.join('|')} and not an array (FD-R2 at run time)` };
    const items = ((over as Record<string, unknown>).items ?? {}) as JsonSchema;
    const arr = a.sample ? (a.sample.value as Record<string, unknown> | null)?.[m.over] : undefined;
    const sample = Array.isArray(arr) ? { value: arr, source: a.sample!.source, arity: arr.length } : undefined;
    return { ...base, schema: items, ...(sample ? { sample, perItem: true as const } : {}) };
  }

  /** The node(s) of one branch whose edge reaches the region's join — the value the branch carries in. */
  private arrivingAt(region: RegionSets, branch: string): FlowNode[] {
    const members = region.branchOf.get(branch) ?? new Set<string>();
    return [...members].map((id) => this.byId.get(id)!).filter((n) =>
      (n.kind === 'task' || n.kind === 'join' || n.kind === 'gate') && (n.edges ?? []).some((e) => e.to === region.joinId));
  }

  /** `JP-R12`'s record for the region a join closes — exact for a fan-out, keyed by minted paths for a map. */
  private record(j: JoinNode): Arrival {
    const region = this.regions.find((r) => r.joinId === j.id);
    const base = { shape: 'record' as const, producer: j.id };
    if (!region) return { ...base, unchecked: `join "${j.id}" closes no region` };
    const opener = this.byId.get(region.fanoutId) as FanoutNode | MapNode;
    const branches = opener.kind === 'map' ? [opener.branch] : opener.branches;
    const values: { branch: string; schema: JsonSchema; sample: { value: unknown; source: SampleSource } }[] = [];
    for (const b of branches) {
      const arriving = this.arrivingAt(region, b);
      if (arriving.length === 0) continue;                                  // the branch never arrives; no key
      // A GATE routing into the join carries in what reached it — one shape per arrival at the gate (v0.23).
      // Without it the branch had no arriving node, and the record LOST that branch's key (W92's census).
      type From = { node: FlowNode; shape: Pick<Arrival, 'schema' | 'sample' | 'unchecked'> };
      const from = arriving.flatMap((n): From[] => n.kind === 'join' ? [{ node: n, shape: this.record(n) as Pick<Arrival, 'schema' | 'sample' | 'unchecked'> }]
        : n.kind === 'gate' ? this.arrivals(n.id).map((a) => ({ node: n, shape: a as Pick<Arrival, 'schema' | 'sample' | 'unchecked'> }))
        : [{ node: n, shape: { ...this.produced(n.id) } }]);
      if (from.length === 0) continue;                                      // a gate nothing reaches; no key
      const shapes = from.map((x) => x.shape);
      // An undeclared arriving node is named BEFORE two declared ones are compared — the reader found the
      // message reading *whose outputs differ* of a pair where one declared nothing (W73's conformity reader, 17).
      const bad = shapes.findIndex((s) => s.schema === undefined);
      if (bad >= 0) return { ...base, unchecked: `branch "${b}" of "${region.fanoutId}" arrives at "${j.id}" from "${from[bad]!.node.id}", which ${shapes[bad]!.unchecked ?? 'declares nothing'}` };
      const first = shapes[0]!;
      const firstSchema = first.schema as JsonSchema;                        // every schema is defined past the check above
      if (shapes.some((s) => canon(s.schema) !== canon(firstSchema))) {
        return { ...base, unchecked: `branch "${b}" of "${region.fanoutId}" arrives at "${j.id}" from ${from.length} arrivals whose outputs differ` };
      }
      values.push({ branch: b, schema: firstSchema, sample: first.sample ?? { value: null, source: 'witness' } });
    }
    const source: SampleSource = values.every((v) => v.sample.source === 'example') ? 'example' : 'witness';
    // **The sample's keys for a region INSIDE a map region take item index 0 for every enclosing map** —
    // the schema does not depend on the key, and `branchPathOf` refuses a path that crosses a map with
    // no index (`ID-R6`). W73's conformity reader found the check THROWING here on two documents the
    // validator accepts (a fan-out inside a map branch, a map in a map) — shapes the driver refused at
    // construction until [W84](../../doc/work-items/w84-what-a-regions-identity-is.md) and **RUNS since**
    // ([ADR 0062](../../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md),
    // Q160). **The reason this line gives survives the lift and is now the whole of it**: the schema does
    // not depend on the key, so index 0 is a SAMPLE and always was — it was never an argument about
    // whether a run would start.
    const enclosing = new Map(this.regions.filter((r) => r.opensWith === 'map' && r.members.has(region.fanoutId)).map((r) => [r.fanoutId, 0] as const));
    if (opener.kind === 'fanout') {
      const props: Record<string, JsonSchema> = {}; const sample: Record<string, unknown> = {};
      for (const v of values) {
        const path = branchPathOf(this.regions, v.branch, enclosing);
        props[path] = v.schema;
        sample[path] = v.sample.value;
      }
      // **No key is REQUIRED — `JP-R12`'s three roads** (the header): a branch lost by an `optional` task
      // failing, by a person resolving a suspended task `failed` (`spec/join-policy.md` section 2, `RS-R3`),
      // or by a policy firing before it settles has no entry, and none of the three shows in the document.
      // The first cut required the keys of branches holding no `end` and no `optional` task, and read
      // `fits` for a consumer requiring two non-optional branches — a `fits` the run can falsify, the
      // unsafe direction (W73's conformity reader, 3).
      return { ...base, schema: { type: 'object', required: [], properties: props, additionalProperties: false }, sample: { value: sample, source, arity: values.length } };
    }
    // A map: the keys are minted at run time, each of the one branch's shape; the sample's arity is
    // what the map's own arrival says its `over` array holds.
    const v = values[0];
    if (!v) return { ...base, unchecked: `map "${opener.id}"'s branch never arrives at "${j.id}"` };
    const arity = this.arrivals(opener.branch)[0]?.sample?.arity ?? 1;
    const sample: Record<string, unknown> = {};
    for (let i = 0; i < arity; i++) sample[branchPathOf(this.regions, opener.branch, new Map([...enclosing, [opener.id, i]]))] = v.sample.value;
    return {
      ...base,
      schema: { type: 'object', additionalProperties: v.schema, branchKeys: true } as JsonSchema,
      sample: { value: sample, source, arity },
    };
  }

  /** `FD-C1`'s table over one arrival: the object `needs` describes, schema and sample alike. */
  private composed(a: Arrival, needs: Readonly<Record<string, unknown>>): Arrival {
    const base = { shape: 'needs' as const, producer: a.producer, ...(a.through ? { through: a.through } : {}) };
    const props: Record<string, JsonSchema> = {}; const required: string[] = []; const sample: Record<string, unknown> = {};
    let source: SampleSource = 'example';
    const arity = a.sample?.arity;
    const dot: string[] = [];                                            // the `"."` keys — `FD-V28` admits no `["."]`
    for (const [key, ref] of Object.entries(needs)) {
      const t = referenceTarget(ref);
      if (t === null) return { ...base, unchecked: `needs.${key} is not a reference` };
      let schema: JsonSchema | undefined, value: unknown, src: SampleSource = 'example';
      if (t.node === null) {
        if (a.schema === undefined) return { ...base, unchecked: a.unchecked ?? a.refused ?? `needs.${key} is "." and the edge's value has no schema` };
        schema = a.schema; value = a.sample?.value; src = a.sample?.source ?? 'witness';
        dot.push(key);
      } else {
        const p = this.produced(t.node);
        if (p.schema === undefined) return { ...base, unchecked: `needs.${key} names "${t.node}", which ${p.unchecked}` };
        schema = p.schema; value = p.sample!.value; src = p.sample!.source;
      }
      if (src === 'witness') source = 'witness';
      props[key] = t.form === 'all' ? { type: 'array', items: schema } : schema;
      sample[key] = t.form === 'all' ? [value] : value;
      if (!t.conditional) required.push(key);
    }
    const schema: JsonSchema = { type: 'object', required, properties: props, additionalProperties: false };
    // **Over a map's item, one composed object PER ELEMENT** (R7, the `perItem` field): the `"."` keys take
    // each element in turn, the named keys stay, and the arrival keeps the item shape's evaluation rule.
    if (a.perItem && a.sample !== undefined) {
      const elements = a.sample.value as unknown[];
      const value = elements.map((el) => { const s = { ...sample }; for (const k of dot) s[k] = el; return s; });
      return { ...base, perItem: true, schema, sample: { value, source, arity: elements.length } };
    }
    return { ...base, schema, sample: { value: sample, source, ...(arity !== undefined ? { arity } : {}) } };
  }
}

// ---- the check --------------------------------------------------------------------------------

/**
 * **Every arc of `flow`, given a verdict from the schemas `registry`'s workers declare** — the
 * header's five shapes and five verdicts. A definition the validator accepts; a type or worker the
 * registry lacks makes its arcs `unchecked` by name rather than throwing, because the check is an
 * authoring-time tool and a report is what an author reads.
 */
/** An adapter's WORKER half: `compile(expr)` to an evaluator — the shape `import(adapter.worker)`'s default export has. */
export type WorkerCompile = (expr: string) => { evaluate(input: unknown, settings: Readonly<Record<string, unknown>>): Promise<unknown> };
export interface WiringOptions {
  /**
   * **A worker half handed in, by language name, for a runtime that cannot import the adapter's
   * URL** — ADR 0052 rule 8's road, W62's `workerHalf`: inside a browser bundle `import.meta.url`
   * is the bundle ([Q261](../../doc/open-questions.md)), so `import(adapter.worker)` yields no
   * compile function there. Read ONLY when the URL's default export is not a function; where the
   * URL imports, the URL wins, and the suite asserts the two are the same function.
   */
  workerHalf?: Readonly<Record<string, WorkerCompile>>;
}

export async function checkWiring(registry: WiringRegistry, flow: FlowDefinition, options: WiringOptions = {}): Promise<WiringReport> {
  const workers = workersOf(registry.workers);
  const types = nodeTypesOf(registry.nodeTypes);
  const languages = languagesOf(registry.languages);
  // `gateTypesOf` is the registry's own reading — the built-ins, then the consumer's, and absent is the
  // built-ins ALONE — so the check resolves a gate's type exactly as `checkRegistry` and the driver do,
  // and the three cannot disagree about what `distinct` guarantees.
  const w = new Wiring(flow, workers, types, gateTypesOf(registry.gateTypes));
  const verdicts: WiringVerdict[] = [];
  for (const node of flow.nodes) {
    if (node.kind !== 'task') continue;
    const type = types.get(node.type);
    const consumer = type ? workers.get(type.worker)?.inputSchema : undefined;
    const consumerWhy = !type ? `type "${node.type}" of "${node.id}" is not in the registry`
      : !workers.get(type.worker) ? `worker "${type.worker}" of type "${node.type}" is not in the registry`
      : consumer === undefined ? `"${node.id}" (type "${node.type}", worker "${type.worker}") declares no inputSchema` : undefined;
    for (const a of w.arrivals(node.id)) {
      const v: WiringVerdict = { consumer: node.id, shape: a.shape, producer: a.producer, ...(a.through ? { through: a.through } : {}), kind: 'unchecked', why: '' };
      if (a.refused !== undefined && node.transform === undefined) { v.kind = 'no'; v.why = a.refused; verdicts.push(v); continue; }
      if (a.schema === undefined) { v.why = a.unchecked ?? a.refused ?? 'no schema on the producer side'; verdicts.push(v); continue; }
      if (node.transform === undefined) {
        if (consumer === undefined) { v.why = consumerWhy!; verdicts.push(v); continue; }
        const r = fits(a.schema, consumer);
        v.kind = r.verdict; v.why = r.verdict === 'fits' ? `fits${a.shape === 'record' ? ' (the join`s record)' : ''}` : r.why;
        verdicts.push(v); continue;
      }
      // A transformed arc: run the expression on the sample, hold the result to the consumer's schema.
      if (a.sample === undefined) { v.why = `"${node.id}" declares a transform and no sample can be built on the producer side`; verdicts.push(v); continue; }
      const sample: WiringSample = { source: a.sample.source, ...(a.sample.arity !== undefined ? { arity: a.sample.arity } : {}), value: a.sample.value };
      const adapter = languages.get(node.transform.lang);
      if (adapter === undefined) { v.why = `language "${node.transform.lang}" is not in the registry`; v.sample = sample; verdicts.push(v); continue; }
      const inputs = a.perItem ? (a.sample.value as unknown[]) : [a.sample.value];
      if (inputs.length === 0) { v.why = `the sample holds no item to run "${node.id}"'s transform on (arity 0)`; v.sample = sample; verdicts.push(v); continue; }
      const settings = effectiveSettings(node, type);
      let results: unknown[];
      try {
        let compile: WorkerCompile | undefined;
        try {
          const mod = (await import(adapter.worker)) as { default?: unknown };
          if (typeof mod.default === 'function') compile = mod.default as WorkerCompile;
        } catch (e) {
          if (options.workerHalf?.[node.transform.lang] === undefined) throw e;
        }
        compile ??= options.workerHalf?.[node.transform.lang];
        if (typeof compile !== 'function') throw new Error(`the worker half of language "${node.transform.lang}" has no default export, and none was handed in`);
        const c = compile(node.transform.expr);
        results = [];
        for (const input of inputs) results.push(await c.evaluate(input, settings));
      } catch (e) {
        v.kind = 'transform-fails';
        v.why = `the transform threw on the ${sample.source}: ${e instanceof Error ? e.message : String(e)}`;
        v.sample = { ...sample, result: e instanceof Error ? e.message : String(e) };
        verdicts.push(v); continue;
      }
      sample.result = a.perItem ? results : results[0];
      v.sample = sample;
      if (consumer === undefined) { v.why = consumerWhy! + ' — the transform ran and nothing holds its result'; verdicts.push(v); continue; }
      const bad = results.map((r, i) => [i, findings(consumer, r)] as const).find(([, f]) => f.length > 0);
      if (bad) {
        v.kind = 'transform-fails';
        v.why = `the transform's result on the ${sample.source}${a.perItem ? ` (item ${bad[0]})` : ''} fails the consumer's inputSchema — ${describeFindings(bad[1])}`;
      } else {
        v.kind = 'transform-passes';
        v.why = `the sample passed — the ${sample.source}${sample.arity !== undefined ? ` at arity ${sample.arity}` : ''}, ${inputs.length} evaluation${inputs.length === 1 ? '' : 's'}, every result accepted by the consumer's inputSchema`;
      }
      verdicts.push(v);
    }
  }
  const counts: Record<VerdictKind, number> = { 'fits': 0, 'no': 0, 'transform-passes': 0, 'transform-fails': 0, 'unchecked': 0 };
  for (const v of verdicts) counts[v.kind]++;
  return { flowId: flow.flowId, verdicts, counts, entry: entryTasks(flow) };
}

/** One verdict as one line a person reads — the source of a sample always named (Q301). */
export function describeVerdict(v: WiringVerdict): string {
  const road = v.shape === 'edge' ? `${v.producer} -> ${v.consumer}`
    : v.shape === 'branch' ? `${v.producer} -> (${v.through}) -> ${v.consumer}`
    : v.shape === 'item' ? `${v.producer} -> (${v.through}, one item) -> ${v.consumer}`
    : v.shape === 'record' ? `${v.producer} (the record) -> ${v.consumer}`
    : `${v.producer} -> needs -> ${v.consumer}`;
  const s = v.sample ? ` [on the ${v.sample.source}${v.sample.arity !== undefined ? `, arity ${v.sample.arity}` : ''}]` : '';
  return `${v.kind.padEnd(16)} ${road}: ${v.why}${s}`;
}

/** The verdict kinds, enumerated — what a report's `counts` is keyed by, bound to the spec's table by a test. */
export const VERDICT_KINDS: readonly VerdictKind[] = ['fits', 'no', 'transform-passes', 'transform-fails', 'unchecked'];
/** The arc shapes, enumerated. */
export const WIRING_SHAPES: readonly WiringShape[] = ['edge', 'branch', 'item', 'record', 'needs'];
