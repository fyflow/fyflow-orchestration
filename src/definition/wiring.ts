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
 * REQUIRE is read as never emitting it — **unless the producer itself REQUIRES that key**, which is
 * the leniency's ONE scope, added at v0.26 by [W100](../../doc/work-items/w100-what-a-key-path-must-satisfy.md)
 * (its conformity reader, F4: this sentence was unqualified and the paragraph below did not mention
 * the scope either). `required` refutes the leniency's own premise — *the producer is read as never
 * emitting it* cannot be said of a key the producer guarantees — so a consumer describing a key the
 * producer requires and describes nothing about is `no` rather than lenient. Read strictly — *the producer may put anything there* —
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
 * 3, [Q301](../../doc/questions/q301.md)): the producer's first declared example, else the
 * generator's witness, and — where the producer is a region — the ARITY the sample had, because a
 * transform's result changes type with the arity ([Q263](../../doc/questions/q263.md): `*.score`
 * is an array at two, a scalar at one, absent at zero). The expression is evaluated by the adapter's
 * WORKER half, imported here by its module URL — a URL, never the engine's bare specifier, so
 * `RT-R12` holds and this module loads no engine of its own. A witness is not a proof, and a
 * sample that passes is reported as *the sample passed*, never as *fits*.
 *
 * **And a value the CALLER GIVES is not an arc at all** (v0.38,
 * [P37](../../doc/plans/p37-a-runtime-is-its-registry.md) stop-and-ask (d),
 * [W166](../../doc/work-items/w166-a-sample-the-caller-gives.md)): `givenVerdict` runs a task's transform
 * ONCE on what the node RECEIVES — `$`, as given, no `needs` composed over it — and returns ONE verdict of
 * shape `given`, with no producer and the source `'given'`, whatever arcs reach the node and on the ENTRY
 * too. It reads no arrival, so a given value never reaches the record's or the composition's source
 * aggregation (P37 fact 4) — and those are typed over the two sources a SCHEMA supplies, so it cannot.
 * The evaluation is the arcs' own: `judgeTransform` below is the one both roads call.
 *
 * **A GATE's arc carries what reached it REFINED by what its ROUTE guarantees, and a KEY PATH the
 * producer FORBIDS makes that arc `no`** — [ADR 0068](../../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)
 * and its refusing half ([W99](../../doc/work-items/w99-what-a-route-guarantees.md),
 * [W100](../../doc/work-items/w100-what-a-key-path-must-satisfy.md)). A route the gate's type calls
 * key-resolved gains `required` along the gate's own key path (`requireAlong`); a path no value the
 * producer admits can carry means that route is never taken, which `keyPathRefusal` names. An OPEN
 * producer that says nothing at a step forbids nothing and is left alone — the same leniency `fits`
 * states, one question over, **and with the same scope: a step the producer REQUIRES is not read as
 * never carried.** That scope is W100's, and it is what made `fits`'s `'is open there'` arm dead.
 *
 * Pure over data except the one `import()` of an adapter's worker half, which is async and is why
 * `checkWiring` returns a Promise; no `node:` import, no clock (`RT-R3`, `RT-R4`).
 */
import { describeFindings, findings, type JsonSchema } from './schema.ts';
import type { Edge, FanoutNode, FlowDefinition, FlowNode, GateNode, GateType, JoinNode, MapNode, Registry, TaskNode } from './types.ts';
import { effectiveSettings, gateTypesOf, languagesOf, nodeTypesOf, referenceTarget, routesOf, workersOf } from './validate.ts';
import { allRegions, branchPathOf, buildGraph, type Graph, type RegionSets } from './regions.ts';
import { sampleOf, type SampleSource } from './witness.ts';

// ---- the verdict -----------------------------------------------------------------------------

/**
 * The five shapes of *what a node receives* — `FD-C1`, `JP-R11`, `JP-R12` — **and `given`, which is
 * not an arc** (v0.38, W166): the value a caller hands `tryTransform(…, { input })`. `checkWiring` never
 * produces it. **BREAKING in 0.8.0**: a `switch` exhaustive over the five is not exhaustive over six.
 */
export type WiringShape = 'edge' | 'branch' | 'item' | 'record' | 'needs' | 'given';
/** The shapes an ARC has — every one but `given`, which only the given road produces. */
type ArcShape = Exclude<WiringShape, 'given'>;
/**
 * **The two sources an ARC's sample can have, and the only two the aggregations below are typed over** — a
 * region's record and a `needs` composition call the whole sample `'example'` when every part is and
 * `'witness'` otherwise (P37 fact 4), so a third value reaching them would be reported as `'witness'` in
 * silence. A given value cannot reach them: it reads no arrival, and this type refuses it at compile time.
 */
type ArcSampleSource = Exclude<SampleSource, 'given'>;
// **The narrowing above, held by `typecheck` and not by a harness outside the tree** (W166's adequacy reader, A3):
// widen `ArcSampleSource` to `SampleSource` and the directive below is unused, which is a compile error.
// @ts-expect-error — `'given'` is never an arc's source.
const _GIVEN_IS_NO_ARC_SOURCE: ArcSampleSource = 'given';
/** The five verdicts. */
export type VerdictKind = 'fits' | 'no' | 'transform-passes' | 'transform-fails' | 'unchecked';
/** The value a transformed arc was verified on, where it came from, and what came out. */
export interface WiringSample {
  /** Whether the producer side was a declared example or the generator's witness (Q301) — or, on a `given` verdict and only there, the value the caller gave (`'given'`, W166). */
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
  /**
   * The task whose output arrives, the join whose record arrives, or the opener of the region the consumer sits in.
   * **ABSENT on a `given` verdict, and present on every other** (v0.38, W166): a value the caller gave came from no
   * node. **BREAKING in 0.8.0**: this was `string`.
   */
  producer?: string;
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
        // **The leniency, and its ONE scope — a key the producer REQUIRES is not read as never
        // emitted** (v0.26, [W100](../../doc/work-items/w100-what-a-key-path-must-satisfy.md)). The
        // leniency's own argument is *an author who leaves an output schema open means "there are keys
        // I do not describe"*; a schema that REQUIRES a key has said that key IS emitted, so its own
        // `required` refutes the premise. Measured on the shipped tree before the guard: a producer
        // requiring `series` and describing nothing, against a consumer DESCRIBING `series` as an
        // object and not requiring it, read **`fits`** — for the value `{ name: "n", series: 42 }`,
        // which the producer's schema ACCEPTS and the consumer's REFUSES. *A `fits` the run can
        // falsify is the unsafe kind.* **W99's `requireAlong` is the first thing here that
        // manufactures that shape from an ordinary flow** — it adds `required` along a gate's key path
        // and describes no step it did not find — which is why the scope lands in this item and not in
        // P19's.
        if (!creq.includes(k) && !preq.has(k)) continue;            // consumer does not need k; the producer is read as not emitting it (the leniency)
        // **One reason, because only one case reaches here** — W100's conformity reader, F1. This return read
        // `producer ${preq.has(k) ? 'requires it and describes nothing' : 'is open there'}`, and the guard above
        // made the second arm UNREACHABLE: `!preq.has(k)` now implies `creq.includes(k)`, which returned at the
        // `consumer requires "k", producer does not guarantee it` clause several lines up. Verified over all four
        // combinations of the two `required` lists — not one reaches it — and the string was quoted by three
        // documents, which is `CLAUDE.md`'s own *declared and dead* hazard. *This item is what killed it: before the
        // scope the guard was `if (!creq.includes(k)) continue;` and the arm fired for a key required by BOTH.*
        return { verdict: 'no', why: `${path}.${k}: consumer describes it, producer requires it and describes nothing` };
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
  shape: ArcShape;
  producer: string;
  through?: string;
  schema?: JsonSchema;
  /** `undefined` where no sample can be built — a side with no schema. Its source is a SCHEMA's, never `'given'`. */
  sample?: { value: unknown; source: ArcSampleSource; arity?: number };
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
  /**
   * **Each gate's RESOLVED route set, by gate id — or nothing** (ADR 0092 rule 3): `routesOf` over the gate's
   * type and settings, asked once here. This check does not run the validator first, so an unknown type and a
   * `routesOf` problem (it is total: a malformed set, a throwing `routesFor`) both leave the gate with NO set — no default
   * route and no guarantee, the arcs reported as they are, which is what an unknown type always got.
   */
  private readonly gateRoutes = new Map<string, { readonly defaultRoute: string; readonly keyResolvedRoutes?: readonly string[] }>();
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
      // **The ROUTE is carried here and resolved against the GATE's `defaultRoute` (v0.30: its resolved set's, ADR 0092) where the edge
      // declares none** — not treated as a route named `(default)`. `distinct`'s default IS one of its
      // key-resolved routes, so a set holding a placeholder would have been right for the only type that
      // exists and wrong for a type whose default is its unresolved route, in silence (W99's declaration
      // step, correction 3; `doc/workflow.md` v0.23's selection clause).
      if (n.kind === 'gate') {
        const type = this.gateTypes.get(n.type);
        const resolved = type === undefined ? undefined : routesOf(type, n.settings ?? {});
        if (resolved !== undefined && !('problem' in resolved)) this.gateRoutes.set(n.id, resolved);
        // The NODE's default (ADR 0092): for a derived type two gates of one type may have two.
        const dflt = this.gateRoutes.get(n.id)?.defaultRoute;
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

  /**
   * **Why the arriving schema FORBIDS a gate's key path, or `null`** — v0.26,
   * [W100](../../doc/work-items/w100-what-a-key-path-must-satisfy.md), the other half of
   * [ADR 0068](../../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)
   * read in the refusing direction: a route can only promise that a path RESOLVED if the path is one
   * the producer can emit.
   *
   * **The question is per STEP and about the CONTAINER, because that is what `readKeyPath` is** —
   * the DRIVER's own resolution (`src/definition/validate.ts`, W93), where each segment is an OWN key
   * of a PLAIN object and a missing key, a `null`, an array mid-path or a primitive is `undefined`.
   * So two shapes forbid a step and the third is a silence:
   *
   * - **its declared types cannot include `object`** — `name.id` where the producer calls `name` a
   *   string. No value the schema admits carries the path.
   * - **it can be an object, is `additionalProperties: false`, and does not name the step** —
   *   `sereis.id`, or `series.slug` where `series` is closed over `id` and `title`.
   * - **it can be an object, does not name the step, and is OPEN** — `null`, which is `fits`'s own
   *   leniency one question over: the producer may emit it, so nothing is forbidden and nothing is
   *   claimed. P25 stop-and-ask (b)'s *rather than a false alarm*.
   *
   * **The LEAF's type is never read** (ADR 0068 rule 3): `readKeyPath` returns whatever the path ends
   * on, and *which leaf values count as a key* is the type's judgement — `distinct` wants a string or
   * a finite number and no static tool derives that. So a key path ending on a property the producer
   * calls an array is fine here and `nokey` at run time.
   *
   * **What it costs to be wrong is the reason's last clause, and it is MEASURED rather than reasoned**
   * (W100's declaration step, `dev-dist/w100/d2.ts`, P25 prediction 4): `tv-ingest` on real workers
   * with the key misspelled routes **7 of 7** branches to `nokey`, dispatches **ZERO** `setupSeries`
   * tasks against the correct key's three, runs 22 tasks instead of 25 — and reports **`completed`**.
   * Every rung this repository has is green on a flow that did none of the work it exists for.
   */
  private keyPathRefusal(schema: JsonSchema, key: string, gateId: string, route: string): string | null {
    const steps = key.split('.');
    let s = schema as Record<string, unknown>;
    const because = (at: string, detail: string): string =>
      `gate "${gateId}" is keyed on "${key}", which the producer's schema FORBIDS at ${at}: ${detail} — so route "${route}" can never be taken, ` +
      // **What follows says what the check KNOWS, and no more** — BOTH readers, independently (the conformity
      // reader's F7 and the adequacy reader's F14). This read *and a run routes every branch by another route
      // and completes having done none of the work past this gate*: `tv-ingest`'s measured behaviour written as
      // a claim about every flow. Two ways it can be false. The unresolved route may be wired to an `end` whose
      // outcome is not `completed` (`test/driver/gate.test.ts` wires one to `dropped`), so the run need not
      // complete; and the work past the gate ON that route IS done — what is skipped is the work on the
      // key-resolved routes. The adequacy reader found a third, sharper one: a worker whose returned value its
      // own declared `outputSchema` refuses can carry the path, so `distinct` really does route `first` and the
      // run really does the work — the class `examples/flows/nonconforming.flow.json` ships on purpose, whose
      // census comment is *a wiring check reads two SCHEMAS and never a value*. Every other verdict in this
      // module hedges a run-time consequence (`FD-R2`'s says *at run time*); this one did not.
      'and a run may route every branch by another route, doing none of the work this gate guards';
    for (let i = 0; i < steps.length; i++) {
      const here = steps[i]!;
      const at = i === 0 ? '$' : `$.${steps.slice(0, i).join('.')}`;
      const ts = typesOf(s);
      if (!ts.includes('object')) return because(at, `the schema calls it ${ts.join('|')}, and a key path reads an own key of a plain object`);
      const props = (s.properties ?? {}) as Record<string, unknown>;
      // **`own`, never a bare read** — `FD-V16`'s charset admits `toString` and `__proto__` as key-path
      // segments, so a bare `here in props` would call a prototype key DESCRIBED and walk into a native
      // function ([Q411](../../doc/questions/q411.md), W99's conformity reader, F1 — its third and fourth site).
      if (!own(props, here)) {
        if (s.additionalProperties === false) {
          const named = Object.keys(props);
          return because(at, `the schema forbids every key it does not name (additionalProperties: false) and it names ${named.length ? named.join(', ') : 'no property'}`);
        }
        return null;                                               // OPEN and silent: it may emit it
      }
      const next = props[here];
      // **UNREACHABLE by construction, and kept as a total function's last arm** — both readers asked for this
      // line to be justified or dropped (the conformity reader's F8, the adequacy reader's F13, which measured
      // `s = (next ?? {}) as …` in its place at ZERO and classified it semantically equivalent). Two reasons it
      // cannot fire: `schemaProblem` refuses a non-object `properties` entry at construction, so no `new Driver`
      // reaches here with one; and were one to arrive, `typesOf` of a non-object answers all seven types, its
      // `.properties` is `undefined` and `own({}, here)` is false, so the NEXT iteration returns `null` anyway.
      // No JSON-expressible schema distinguishes the two, which is why the adequacy reader's probe is a declared
      // ceiling rather than a hole. It stays because this function's contract is *never throw on any schema*.
      if (!isPlainObject(next)) return null;                       // not a schema this can read; say nothing
      s = next;
    }
    return null;
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
    // **A type that only transforms names NO worker (ADR 0075), and the reason has to say so.**
    // Measured at W109's declaration step: without this clause the arc reads *worker "<envelope>" of
    // type "Transform" is not in the registry*, which sends an author to the registry to add a worker
    // the type is defined not to have. The schemas are the WORKER's, so such a type declares none —
    // which is why every arc leaving one is `unchecked` ([Q446](../../doc/questions/q446.md)) and why
    // `sampledOutput` in `assist.ts` exists.
    if (t.worker === undefined) return { why: `"${nodeId}" is of type "${n.type}", which only TRANSFORMS — it names no worker, so it declares no ${kind}` };
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
      //
      // **And a key path the arriving schema FORBIDS makes this arc `no`** (v0.26, W100): a route can
      // only promise that a path resolved if the path is one the producer can emit, so the refinement
      // is preceded by the question `keyPathRefusal` asks. It is set as `refused`, which is the shape
      // a map's `over` over a key the producer never emits already uses — so a consumer declaring a
      // TRANSFORM reads the same reason under `unchecked`, because `no` is defined as *does not fit,
      // and no transform is declared*.
      else if (kind === 'gate') {
        const gate = this.byId.get(from) as GateNode;
        const key = this.keyOf(gate);
        const resolved = key !== '' && route !== undefined
          && (this.gateRoutes.get(gate.id)?.keyResolvedRoutes ?? []).includes(route);
        for (const a of this.arrivals(from)) {
          if (!resolved || a.schema === undefined) { raw.push({ ...a }); continue; }
          const refused = this.keyPathRefusal(a.schema, key, gate.id, route!);
          // Explicit fields rather than a spread with `schema: undefined`: an arrival that carries a
          // schema AND a `refused` reason would run the consumer's transform on a sample from a road
          // no run takes.
          if (refused !== null) { raw.push({ shape: a.shape, producer: a.producer, ...(a.through ? { through: a.through } : {}), refused }); continue; }
          raw.push({ ...a, schema: this.requireAlong(a.schema, key) });
        }
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
    const values: { branch: string; schema: JsonSchema; sample: { value: unknown; source: ArcSampleSource } }[] = [];
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
      // **What this road does NOT do is refine or refuse, and that is a stated silence** — W100's adequacy
      // reader, F16. This walk reads `this.arrivals(gate.id)` for a gate, which is what arrives AT the gate
      // unrefined, so neither W99's `required` refinement nor W100's key-path refusal applies to a gate wired
      // into a JOIN: measured, both the right key and a forbidden one give `record fits`. `spec/` licenses it —
      // *the record is what the node before it would carry* — and the `?? 'declares nothing'` below would then
      // say that of a producer with a perfectly good schema, because `From` is a `Pick` that cannot see
      // `refused`. Left as it is, named rather than fixed, because refining a record is a question about
      // `JP-R12`'s shape and not about a key path.
      const bad = shapes.findIndex((s) => s.schema === undefined);
      if (bad >= 0) return { ...base, unchecked: `branch "${b}" of "${region.fanoutId}" arrives at "${j.id}" from "${from[bad]!.node.id}", which ${shapes[bad]!.unchecked ?? 'declares nothing'}` };
      const first = shapes[0]!;
      const firstSchema = first.schema as JsonSchema;                        // every schema is defined past the check above
      if (shapes.some((s) => canon(s.schema) !== canon(firstSchema))) {
        return { ...base, unchecked: `branch "${b}" of "${region.fanoutId}" arrives at "${j.id}" from ${from.length} arrivals whose outputs differ` };
      }
      values.push({ branch: b, schema: firstSchema, sample: first.sample ?? { value: null, source: 'witness' } });
    }
    const source: ArcSampleSource = values.every((v) => v.sample.source === 'example') ? 'example' : 'witness';
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
    // A refused arrival stays REFUSED through composition (W100's conformity reader, F2): the refusal says
    // this arc is never traversed, which no `needs` can change. Before this clause the `"."` road turned it
    // into an `unchecked` below and a road naming another node dropped it entirely, reading `fits`.
    if (a.refused !== undefined) return { ...base, refused: a.refused };
    const props: Record<string, JsonSchema> = {}; const required: string[] = []; const sample: Record<string, unknown> = {};
    let source: ArcSampleSource = 'example';
    const arity = a.sample?.arity;
    const dot: string[] = [];                                            // the `"."` keys — `FD-V28` admits no `["."]`
    for (const [key, ref] of Object.entries(needs)) {
      const t = referenceTarget(ref);
      if (t === null) return { ...base, unchecked: `needs.${key} is not a reference` };
      let schema: JsonSchema | undefined, value: unknown, src: ArcSampleSource = 'example';
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
   * is the bundle ([Q261](../../doc/questions/q261.md)), so `import(adapter.worker)` yields no
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
    const { consumer, consumerWhy } = consumerOf(node, type, workers);
    for (const a of w.arrivals(node.id)) {
      const v: WiringVerdict = { consumer: node.id, shape: a.shape, producer: a.producer, ...(a.through ? { through: a.through } : {}), kind: 'unchecked', why: '' };
      // **A refusal is about the ROUTE and not about the FIT, so it outranks every other road here** —
      // W100's conformity reader, F2. This read `a.refused !== undefined && node.transform === undefined`,
      // which made the same arc `unchecked` the moment its consumer declared a transform: measured on
      // documents `validateDefinition` accepts, plain was `no`, `transform` and `needs: {"v": "."}` were
      // `unchecked`, and `needs: {"v": "produce"}` was **`fits`** with the reason gone altogether (a
      // fourth configuration the reader did not reach). `keyPathRefusal` says *no value this producer
      // admits can carry this key path*, so the key-resolved route is never taken — and a transform runs
      // on a value that only exists if it is taken, while `needs` composes one for the same reason. So the
      // refusal is checked FIRST, and `composed` carries it rather than downgrading it.
      if (a.refused !== undefined) { v.kind = 'no'; v.why = a.refused; verdicts.push(v); continue; }
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
      const inputs = a.perItem ? (a.sample.value as unknown[]) : [a.sample.value];
      await judgeTransform(v, node, node.transform, type, consumer, consumerWhy, languages, sample, inputs, a.perItem === true, options);
      verdicts.push(v);
    }
  }
  const counts: Record<VerdictKind, number> = { 'fits': 0, 'no': 0, 'transform-passes': 0, 'transform-fails': 0, 'unchecked': 0 };
  for (const v of verdicts) counts[v.kind]++;
  return { flowId: flow.flowId, verdicts, counts, entry: entryTasks(flow) };
}

/**
 * **The consuming side of a task node: its type's worker `inputSchema`, and the reason where it has none.** A
 * type that only transforms names no worker (ADR 0075), so its clause comes FIRST — before the one about a
 * worker the registry lacks, which is false of it. One reading, both roads (W166).
 */
function consumerOf(
  node: TaskNode,
  type: ReturnType<ReturnType<typeof nodeTypesOf>['get']>,
  workers: ReturnType<typeof workersOf>,
): { consumer?: JsonSchema; consumerWhy?: string } {
  const consumer = type?.worker === undefined ? undefined : workers.get(type.worker)?.inputSchema;
  const consumerWhy = !type ? `type "${node.type}" of "${node.id}" is not in the registry`
    : type.worker === undefined ? `"${node.id}" is of type "${node.type}", which only TRANSFORMS — it names no worker, so it declares no inputSchema`
    : !workers.get(type.worker) ? `worker "${type.worker}" of type "${node.type}" is not in the registry`
    : consumer === undefined ? `"${node.id}" (type "${node.type}", worker "${type.worker}") declares no inputSchema` : undefined;
  return { consumer, consumerWhy };
}

/** How a reason names a sample's source: `the example`, `the witness` — and `the given input`, which `the given` alone would not say. */
const sourceWord = (s: SampleSource): string => (s === 'given' ? 'given input' : s);

/**
 * **Run a task's transform on `inputs` and hold every result to the consumer's `inputSchema` — the ONE
 * evaluation** an arc's sample takes in `checkWiring` and a value the caller gives takes in `givenVerdict`
 * (W166 lifted it out of the first so the second is not a second evaluator). It writes `v`'s `kind`, `why`
 * and `sample`: `unchecked` for a language the registry lacks, an empty item list, or a consumer with no
 * `inputSchema` (the transform still ran, and its result is reported); `transform-fails` where the expression
 * throws — compiling or evaluating — or a result fails the schema; `transform-passes` where every result is
 * accepted. `perItem` is the map item's rule (R7): one evaluation per element, the results an array.
 */
async function judgeTransform(
  v: WiringVerdict,
  node: TaskNode,
  transform: { readonly lang: string; readonly expr: string },
  type: ReturnType<ReturnType<typeof nodeTypesOf>['get']>,
  consumer: JsonSchema | undefined,
  consumerWhy: string | undefined,
  languages: ReturnType<typeof languagesOf>,
  sample: WiringSample,
  inputs: readonly unknown[],
  perItem: boolean,
  options: WiringOptions,
): Promise<void> {
  const adapter = languages.get(transform.lang);
  if (adapter === undefined) { v.why = `language "${transform.lang}" is not in the registry`; v.sample = sample; return; }
  if (inputs.length === 0) { v.why = `the sample holds no item to run "${node.id}"'s transform on (arity 0)`; v.sample = sample; return; }
  const settings = effectiveSettings(node, type);
  let results: unknown[];
  try {
    let compile: WorkerCompile | undefined;
    try {
      const mod = (await import(adapter.worker)) as { default?: unknown };
      if (typeof mod.default === 'function') compile = mod.default as WorkerCompile;
    } catch (e) {
      if (options.workerHalf?.[transform.lang] === undefined) throw e;
    }
    compile ??= options.workerHalf?.[transform.lang];
    if (typeof compile !== 'function') throw new Error(`the worker half of language "${transform.lang}" has no default export, and none was handed in`);
    const c = compile(transform.expr);
    results = [];
    for (const input of inputs) results.push(await c.evaluate(input, settings));
  } catch (e) {
    v.kind = 'transform-fails';
    v.why = `the transform threw on the ${sourceWord(sample.source)}: ${e instanceof Error ? e.message : String(e)}`;
    v.sample = { ...sample, result: e instanceof Error ? e.message : String(e) };
    return;
  }
  sample.result = perItem ? results : results[0];
  v.sample = sample;
  if (consumer === undefined) { v.why = consumerWhy! + ' — the transform ran and nothing holds its result'; return; }
  const bad = results.map((r, i) => [i, findings(consumer, r)] as const).find(([, f]) => f.length > 0);
  if (bad) {
    v.kind = 'transform-fails';
    v.why = `the transform's result on the ${sourceWord(sample.source)}${perItem ? ` (item ${bad[0]})` : ''} fails the consumer's inputSchema — ${describeFindings(bad[1])}`;
  } else {
    v.kind = 'transform-passes';
    v.why = `the sample passed — the ${sourceWord(sample.source)}${sample.arity !== undefined ? ` at arity ${sample.arity}` : ''}, ${inputs.length} evaluation${inputs.length === 1 ? '' : 's'}, every result accepted by the consumer's inputSchema`;
  }
}

/**
 * **A value the CALLER GIVES, on one task node: its transform run ONCE on what the node RECEIVES, and ONE
 * verdict** — v0.38, [P37](../../doc/plans/p37-a-runtime-is-its-registry.md) stop-and-ask (d)'s answer,
 * [W166](../../doc/work-items/w166-a-sample-the-caller-gives.md). **PUBLIC SURFACE, new in 0.8.0**: `index.ts`
 * re-exports every name of this module, so it is a root export, stated as one in `spec/flow-definition.md`
 * v0.38 and `AGENTS.md` section 15. It is `tryTransform` on the node as the flow DECLARES it — `tryTransform`
 * calls it on the copy that carries the candidate — and the two have ONE contract.
 *
 * `input` IS `$` — what the node receives, so no `needs` is composed over it and no arc is read: the verdict
 * is the same whatever arcs reach the node, and the ENTRY node — which no arc reaches — gets one too. Its
 * shape is `given`, it has NO `producer` and no `through`, and its sample's source is `'given'` and nothing
 * else. The evaluation and the judgement are the arcs' own (`judgeTransform`): `transform-passes` where the
 * result satisfies the consumer's `inputSchema`, `transform-fails` naming the finding where it does not or the
 * error where the expression throws, `unchecked` for a language, type, worker or consumer schema the registry
 * lacks — and for a node with NO transform, because there is nothing to run the value through: holding one
 * value to a schema is `findings`'s question.
 *
 * **`undefined` is no input** (the spec's table, W166's conformity reader F1): with it the ARCS answer, exactly
 * as `tryTransform` with no input — the node's verdicts from `checkWiring`, and `[]` on the entry. A node id
 * that names no task returns `[]`.
 */
export async function givenVerdict(
  registry: WiringRegistry,
  flow: FlowDefinition,
  nodeId: string,
  input: unknown,
  options: WiringOptions = {},
): Promise<WiringVerdict[]> {
  if (input === undefined) return (await checkWiring(registry, flow, options)).verdicts.filter((v) => v.consumer === nodeId);
  const node = flow.nodes.find((n) => n.id === nodeId);
  if (node === undefined || node.kind !== 'task') return [];
  const workers = workersOf(registry.workers);
  const type = nodeTypesOf(registry.nodeTypes).get(node.type);
  const { consumer, consumerWhy } = consumerOf(node, type, workers);
  const v: WiringVerdict = { consumer: node.id, shape: 'given', kind: 'unchecked', why: '' };
  const sample: WiringSample = { source: 'given', value: input };
  if (node.transform === undefined) {
    // **Nothing is claimed about a worker** (the conformity reader, F2): a `Transform` node has none, and a type
    // the registry lacks has none it can name — so the reason says there is no transform, and where the consumer
    // side is missing too it says why, as an arc's reason does.
    v.why = `"${node.id}" has no transform to run the given input through, so nothing is evaluated — holding one value to the inputSchema is \`findings\`'s question${consumerWhy !== undefined ? `; and ${consumerWhy}` : ''}`;
    v.sample = sample;
    return [v];
  }
  await judgeTransform(v, node, node.transform, type, consumer, consumerWhy, languagesOf(registry.languages), sample, [input], false, options);
  return [v];
}

/** One verdict as one line a person reads — the source of a sample always named (Q301). */
export function describeVerdict(v: WiringVerdict): string {
  const road = v.shape === 'given' ? `(given) -> ${v.consumer}`
    : v.shape === 'edge' ? `${v.producer} -> ${v.consumer}`
    : v.shape === 'branch' ? `${v.producer} -> (${v.through}) -> ${v.consumer}`
    : v.shape === 'item' ? `${v.producer} -> (${v.through}, one item) -> ${v.consumer}`
    : v.shape === 'record' ? `${v.producer} (the record) -> ${v.consumer}`
    : `${v.producer} -> needs -> ${v.consumer}`;
  const s = v.sample ? ` [on the ${sourceWord(v.sample.source)}${v.sample.arity !== undefined ? `, arity ${v.sample.arity}` : ''}]` : '';
  return `${v.kind.padEnd(16)} ${road}: ${v.why}${s}`;
}

/** The verdict kinds, enumerated — what a report's `counts` is keyed by, bound to the spec's table by a test. */
export const VERDICT_KINDS: readonly VerdictKind[] = ['fits', 'no', 'transform-passes', 'transform-fails', 'unchecked'];
/** The shapes, enumerated — the five arc shapes and `given` (W166), bound to the spec's arc table by a test. */
export const WIRING_SHAPES: readonly WiringShape[] = ['edge', 'branch', 'item', 'record', 'needs', 'given'];
