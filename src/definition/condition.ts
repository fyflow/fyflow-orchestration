/**
 * **A DECLARED condition, evaluated, and the key path it reads** — the pure half of `spec/flow-definition.md`
 * section 3's `when` subsection, in the DEFINITION layer so that both of its readers import it from one place and
 * neither layer imports the other's back: `src/driver/routing.ts`' `evaluateWhen` (a task's or a join's edge) and
 * the built-in `if` gate in `validate.ts` (P32 decision 4: *evaluated by the same evaluator a task edge's `when`
 * is*). [W154](../../doc/work-items/w154-the-built-in-if-and-switch.md) exception (p): until it, the `if` reached
 * the evaluator through `routing.ts`, which imports `src/definition` — a module cycle in a published library.
 *
 * **Not re-exported WHOLE by `index.ts`.** Three names here are public, each through `validate.ts`' re-export:
 * `readKeyPath` (public since W92, defined in `validate.ts` then; through this re-export since W154), and `keyPathSteps`
 * with its `KeyPathStep` (since W220, P45 (c1) — fyflow-app's pass 6 #2: a host reads a key path with the library's own
 * parse and read rather than a copy of the spelling). `evalLeaf` and `evaluateDeclared` are NOT (P45 decision 1): a
 * host evaluates a `when` by `evaluateWhen`, public through `routing.ts`. Nothing here imports anything but types.
 */
import type { PredicateLeaf, When } from './types.ts';

/**
 * **One step of a key path** — a KEY (an own key of a plain object) or, since v0.53, an INDEX (an element of a real
 * array). [ADR 0137](../../doc/decisions/0137-a-key-path-indexes-an-array-by-a-bracket-suffix-and-a-plain-segment-keeps-its-meaning.md).
 */
export type KeyPathStep = { readonly key: string } | { readonly index: number };

/**
 * **A segment's bracket suffix, as the grammar spells it** — a key, then one or more `[n]`, `n` either `0` or
 * `[1-9][0-9]{0,8}`: no leading zero, at most 999,999,999, so every index the grammar accepts is a valid JavaScript array
 * index. The SAME key and index spelling `KEY_PATH_RE` (`validate.ts`) accepts — the key `FD-V16`'s charset, never
 * "any run of non-brackets" (W216's conformity reader, SHOULD 1: `a b[0]`, a 65-character key, `$[0]` were indexed) — and
 * the index spelled ONCE, below, so the two expressions cannot drift (W216's adequacy reader, K7b). A segment that does
 * not match is ONE literal key, exactly as every segment was before v0.53 — so every SEGMENT the grammar refuses
 * resolves as it always did.
 */
const INDEX_SPELLING = '\\[(0|[1-9][0-9]{0,8})\\]';
const INDEXED_SEGMENT = new RegExp(`^([A-Za-z0-9_-]{1,64})((?:${INDEX_SPELLING})+)$`);
const INDEX = new RegExp(INDEX_SPELLING, 'g');

/**
 * **A key path's STEPS, in order** — `files[0].series` is `files`, `[0]`, `series`. Split on `.` as it always was
 * (neither a key nor an index holds one), then each segment's bracket suffix, where it has one the grammar spells,
 * into its indexes. The one parse `readKeyPath` and the wiring check (`requireAlong`, `keyPathRefusal`) both walk, so
 * the run and the check cannot read a path differently. Total: any string has steps.
 */
export function keyPathSteps(path: string): KeyPathStep[] {
  const out: KeyPathStep[] = [];
  for (const seg of path.split('.')) {
    const m = INDEXED_SEGMENT.exec(seg);
    if (m === null) { out.push({ key: seg }); continue; }
    out.push({ key: m[1]! });
    for (const i of m[2]!.matchAll(INDEX)) out.push({ index: Number(i[1]) });
  }
  return out;
}

/**
 * **What a key path NAMES on a value — the meaning of stop-and-ask (d)'s grammar**, one definition for the
 * driver that resolves it (W93, where a branch enters a gate) and the tests that pin it. Each KEY step is an OWN key of a plain object
 * (`hasOwnProperty`, never `in`, which walks the prototype — W65's conformity reader, three keyword sites);
 * anything else — a missing key, `null`, an ARRAY under a key step (a plain numeric segment is a KEY, by (c1)), a
 * primitive — is `undefined`, which is what `distinct` routes to `nokey`. **An INDEX step `[n]` (v0.53, ADR 0137) is an
 * OWN element of a REAL array** (`Array.isArray`, `n < length`, not a hole) and of nothing else: a plain object holding a key `"n"`, an
 * array-like object, a typed array and a primitive are all `undefined`. The value at the end is returned whatever it is.
 */
export function readKeyPath(value: unknown, path: string): unknown {
  let v = value;
  for (const step of keyPathSteps(path)) {
    if (typeof v !== 'object' || v === null) return undefined;
    if ('index' in step) {
      // A REAL array and nothing else; past its end is nothing; and an OWN element, as every key step reads an own key —
      // a HOLE in a sparse array is nothing too, never what the array's prototype answers. *(`structuredClone` keeps a
      // hole, so a run CAN hold one — W216's conformity reader, NIT 1, measured a custom prototype answering through it.)*
      if (!Array.isArray(v) || step.index >= v.length || !Object.prototype.hasOwnProperty.call(v, step.index)) return undefined;
      v = (v as unknown[])[step.index];
      continue;
    }
    const seg = step.key;
    // **A PLAIN object** — its prototype `Object.prototype` or none. An ARRAY is not one (a KEY step never indexes, by (c1)), nor
    // is a class instance, a `Map` or a `Date`, whatever its own fields hold. *(An `Array.isArray` guard stood above
    // this and was removed once this made it unreachable — rule 8's `a13` measured it survive.)* W92's conformity
    // reader (finding 10) found the first cut reading a class instance's own field while the spec says *own key of
    // a plain object*. Reachable through a run since W93, where it IS the driver's resolution — over the value AS A
    // CLONE CARRIES IT, so a caller's class instance is plain by the time a gate reads it (W93's conformity reader,
    // finding 1: reading the original made a run and its replay resolve different keys); stated here so the
    // resolution cannot be wider than the grammar.
    const proto = Object.getPrototypeOf(v);
    if (proto !== Object.prototype && proto !== null) return undefined;
    if (!Object.prototype.hasOwnProperty.call(v, seg)) return undefined;
    v = (v as Record<string, unknown>)[seg];
  }
  return v;
}

/**
 * **A DECLARED comparison, evaluated — v0.27,
 * [ADR 0074](../../doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md).**
 *
 * **Synchronous, total, and a pure function of its argument** — which is the whole reason the subset
 * exists rather than reusing `transform`'s declared expressions: W108's declaration step re-measured
 * that `jsonata`'s only evaluation entry returns a Promise and that `src/driver/driver.ts` holds ZERO
 * `async`/`await` in code, so an expression cannot be evaluated where a decision is made without
 * reaching [ADR 0014](../../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)'s
 * ordered fold-input sequence.
 *
 * **It reads `scope` and nothing else.** There is no clock here, no random source, no I/O and no
 * closure over anything — so a declared predicate **CANNOT** be impure, which is strictly stronger
 * than [Q9](../../doc/questions/q9.md)'s measured result for a function (evaluating twice caught
 * 1 impurity shape of 4) and is asserted rather than argued. `scope` is a task edge's `DecisionContext`
 * or an `if` gate's `{ input }` (W154) — the path is read off it by `readKeyPath`, and that is the only read.
 *
 * **Total by construction**, because `FD-V42`-`FD-V45` refuse everything this does not handle at
 * `new Driver`. The `default:` arm below is the assertion that they held; `unknownOp` is the error it throws,
 * the caller's own class (`routing.ts` passes `NoMatchingEdge`, as before W154).
 */
export function evalLeaf(scope: object, p: PredicateLeaf, unknownOp: (message: string) => Error): boolean {
  // The key path is read by `readKeyPath` — the DRIVER's own resolution, the same one a gate's
  // `settings.key` gets. W108 measured it unchanged at this scope: `ctx.outcome`, `ctx.outcome.result`
  // and `ctx.needs` are all plain objects, and `ctx.needs` being FROZEN does not change a prototype.
  let v = readKeyPath(scope, p.path);
  // **Absent is NO MATCH, and `default` is what makes the comparisons closed under negation**
  // (W108 stop-and-ask (d)): without it both `x > t` and `x <= t` are false for an absent path, so
  // no pair of operators complements and `!p` has no declared form. Substituted BEFORE `length`.
  //
  // **A path resolving to `null` takes the default too, and that is BOTH readers' shared finding.**
  // `readKeyPath` returns a terminal `null` as a resolved value, so a `v === undefined` test alone
  // left `gt` and `lte` BOTH false on a null-valued key — the pair not complementary, and the
  // declared form not reproducing `(r?.score ?? 0) > 0.5`, which five documents said it was.
  // `??` is nullish, so this is: where a `default` is declared, it stands in for `undefined` AND
  // for `null`. **Where NONE is declared a resolved `null` stays `null`**, so `eq null` is still a
  // scalar comparison that holds — a blanket `v == null -> no match` would break that, which is
  // why the two halves are separate statements.
  if (v === undefined && !('default' in p)) return false;
  if ((v === undefined || v === null) && 'default' in p) v = p.default as unknown;
  if (p.length === true) {
    // An array or a string has a length; anything else is no match, which is the absent rule's own
    // reading one step along rather than a second convention.
    if (Array.isArray(v)) v = v.length;
    else if (typeof v === 'string') v = v.length;
    else return false;
  }
  const w = p.value;
  switch (p.op) {
    // **Type-STRICT, and it is a departure measured rather than assumed.** Under JS comparison
    // `{confidence: "0.4"} < 0.5` is true and every `typeof`-guarded predicate in this tree is false;
    // measured over 1800 contexts, a type-strict form reproduces those three EXACTLY and differs from
    // `resume.test.ts`'s unguarded `isHigh` on `{score: "9"}`, where the JS body coerces. That is
    // `FD-V30`'s own argument — *a string `maxRetries` retries by coercion* — one rule over.
    case 'eq': return v === w;
    case 'ne': return v !== w;
    case 'lt': return typeof v === 'number' && typeof w === 'number' && v < w;
    case 'lte': return typeof v === 'number' && typeof w === 'number' && v <= w;
    case 'gt': return typeof v === 'number' && typeof w === 'number' && v > w;
    case 'gte': return typeof v === 'number' && typeof w === 'number' && v >= w;
    case 'startsWith': return typeof v === 'string' && typeof w === 'string' && v.startsWith(w);
    default: {
      // `FD-V44` refuses every other operator at construction; this is the assertion that it held,
      // and it is a THROW rather than a `false` because a predicate silently answering no is the
      // plausible-wrong-answer class `FD-R2` exists for.
      const never: never = p.op;
      throw unknownOp(`operator "${String(never)}" is not in the subset; FD-V44 should have caught this at instantiation`);
    }
  }
}

/**
 * **A COMPARISON or a FLAT GROUP, answered** — the two DECLARED shapes of a `when`. A registered NAME is not
 * one: `routing.ts`' `evaluateWhen` looks a name up itself and hands every other shape here, and the `if` gate's
 * grammar refuses a name at load.
 */
export function evaluateDeclared(when: When, scope: object, unknownOp: (message: string) => Error): boolean {
  if ('all' in when && Array.isArray(when.all)) return when.all.every((m) => evalLeaf(scope, m, unknownOp));
  if ('any' in when && Array.isArray(when.any)) return when.any.some((m) => evalLeaf(scope, m, unknownOp));
  return evalLeaf(scope, when as PredicateLeaf, unknownOp);
}
