/**
 * Routing — `spec/flow-definition.md` section 3. Pure: it returns the edge to
 * take, and dispatches nothing (ADR 0001 rule 3).
 *
 * Eligibility is checked BEFORE the `when` evaluation, and only over the eligible
 * edges (ADR 0004 rule 2).
 */
import type { Edge, FlowNode, GateNode, PredicateLeaf, TerminalState, When } from '../definition/types.ts';
import { readKeyPath } from '../definition/validate.ts';
import type { OutcomeRecord } from './log.ts';

/**
 * What a predicate receives — `FD-C3`, and
 * [ADR 0041](../../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md),
 * answering [Q8](../../doc/open-questions.md).
 *
 * **P1 populated exactly one field and the comment here asked whether it would grow.
 * It grows by one**, and the field is declared on the EDGE rather than on the node —
 * which is the whole of what W42 measured, and is why Q8 turned out to be its own
 * decision rather than a consequence of
 * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md).
 */
export interface DecisionContext {
  /**
   * `OR-R9` — ALWAYS the node's effective outcome, so a predicate sees one shape
   * whether the node settled or was resolved, and `terminalState` is never undefined.
   */
  outcome: OutcomeRecord;
  /**
   * **What this EDGE declared it needs** — the object its `needs` describes, resolved
   * against the run's own outputs exactly as a node's is (`FD-C1`, `FD-C2`).
   *
   * **`{}` when the edge declares none, never `undefined`**, for rule 4's own reason
   * one level out: *a predicate written `ctx.needs.flag` must mean one thing*, and a
   * field that is sometimes absent makes every predicate carry a guard the driver
   * could have carried once.
   */
  needs: Readonly<Record<string, unknown>>;
}

export type Predicate = (ctx: DecisionContext) => boolean;
export type PredicateRegistry = ReadonlyMap<string, Predicate>;

export class NoMatchingEdge extends Error {}

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
 * **It reads `ctx` and nothing else.** There is no clock here, no random source, no I/O and no
 * closure over anything — so a declared predicate **CANNOT** be impure, which is strictly stronger
 * than [Q9](../../doc/open-questions.md)'s measured result for a function (evaluating twice caught
 * 1 impurity shape of 4) and is asserted rather than argued.
 *
 * **Total by construction**, because `FD-V42`-`FD-V45` refuse everything this does not handle at
 * `new Driver`. The `default:` arm below is the assertion that they held.
 */
function evalLeaf(ctx: DecisionContext, p: PredicateLeaf): boolean {
  // The key path is read by `readKeyPath` — the DRIVER's own resolution, the same one a gate's
  // `settings.key` gets. W108 measured it unchanged at this scope: `ctx.outcome`, `ctx.outcome.result`
  // and `ctx.needs` are all plain objects, and `ctx.needs` being FROZEN does not change a prototype.
  let v = readKeyPath(ctx, p.path);
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
      throw new NoMatchingEdge(`operator "${String(never)}" is not in the subset; FD-V44 should have caught this at instantiation`);
    }
  }
}

/**
 * **What a `when` ANSWERS** — the one place the three shapes are told apart, shared by `selectEdge`
 * and by the tests, so the grammar and the evaluator cannot disagree about which shape an object is.
 * A registered name is looked up here and nowhere else; `FD-V4` has already refused an absent one.
 */
export function evaluateWhen(when: When, ctx: DecisionContext, predicates: PredicateRegistry): boolean {
  if ('predicate' in when && typeof when.predicate === 'string') {
    const p = predicates.get(when.predicate);
    if (!p) throw new NoMatchingEdge(`predicate "${when.predicate}" is not registered; FD-V4 should have caught this at instantiation`);
    return p(ctx);
  }
  if ('all' in when && Array.isArray(when.all)) return when.all.every((m) => evalLeaf(ctx, m));
  if ('any' in when && Array.isArray(when.any)) return when.any.some((m) => evalLeaf(ctx, m));
  return evalLeaf(ctx, when as PredicateLeaf);
}

export type RoutingResult =
  | { taken: Edge }
  /** No edge opts into this terminal state. The path ends here — declared by omission, not an error. */
  | { taken: null; reason: 'no-eligible-edge' };

const onOf = (e: Edge): readonly string[] => (Array.isArray(e.on) && e.on.length ? e.on : ['done']);

export function eligibleEdges(node: FlowNode, terminalState: TerminalState): Edge[] {
  // **A gate's `[]` here is UNREACHABLE, not a silent path end** — W92 handed this line over and W93
  // measured why: this is called only from `selectEdge`, which only `advance` calls, for a settled TASK's
  // id — and a gate is dispatched to no scheduler, so it never settles and has no id. A gate's edge is
  // chosen by `gateEdge` below, by the ROUTE its type returned, where a branch ENTERS it.
  if (node.kind !== 'task' && node.kind !== 'join') return [];
  const edges: Edge[] = Array.isArray((node as { edges?: Edge[] }).edges) ? (node as { edges: Edge[] }).edges : [];
  return edges.filter((e) => onOf(e).includes(terminalState));
}

/**
 * **The ONE edge a gate takes for a route** — `spec/flow-definition.md` section 2's gate,
 * [ADR 0066](../../doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)
 * rule 4, [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md). An edge carries the route it names,
 * and **an edge with no `route` carries the type's DEFAULT route** — never every route, and not the first.
 * Pure, as `selectEdge` is: the caller has already held `route` to the type's declared routes (`FD-R5`), and
 * `FD-V41` wires every declared route by exactly one edge, so this is total over what reaches it — `null` is
 * the assertion that `FD-V41` held, and the driver stops the run on it rather than routing nowhere.
 */
export function gateEdge(node: GateNode, defaultRoute: string, route: string): Edge | null {
  const edges: Edge[] = Array.isArray(node.edges) ? node.edges : [];
  return edges.find((e) => (e.route ?? defaultRoute) === route) ?? null;
}

/**
 * @throws NoMatchingEdge — `FD-R1`. Unreachable given `FD-V7`, which guarantees a
 *   default edge for every state any edge opts into; this is the assertion that
 *   `FD-V7` held, and a run that reaches it terminates rather than stopping quietly.
 */
export function selectEdge(
  node: FlowNode,
  runId: string,
  terminalState: TerminalState,
  /**
   * **A context PER EDGE, not one for the node** — `FD-C3`. Each edge declares its
   * own `needs`, so each predicate sees a different `ctx.needs`, and this took a
   * `DecisionContext` until W42.
   *
   * **It is a function and routing stays pure.** The caller supplies it exactly as it
   * supplies `predicates`, and it is called ONLY for an edge that carries a `when` —
   * so a default edge costs nothing, which is the common case and is what keeps
   * [ADR 0041](../../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)
   * rule 1's *nothing changes for a flow that declares nothing* true of the cost as
   * well as of the value.
   */
  contextFor: (edge: Edge) => DecisionContext,
  predicates: PredicateRegistry,
): RoutingResult {
  const eligible = eligibleEdges(node, terminalState);
  if (eligible.length === 0) return { taken: null, reason: 'no-eligible-edge' };
  for (const e of eligible) {
    if (e.when === undefined) return { taken: e };
    if (evaluateWhen(e.when, contextFor(e), predicates)) return { taken: e };
  }
  throw new NoMatchingEdge(
    `FD-R1: run "${runId}" reached node "${node.id}" with eligible edges for "${terminalState}" and none matched`,
  );
}
