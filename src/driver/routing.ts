/**
 * Routing — `spec/flow-definition.md` section 3. Pure: it returns the edge to
 * take, and dispatches nothing (ADR 0001 rule 3).
 *
 * Eligibility is checked BEFORE the `when` evaluation, and only over the eligible
 * edges (ADR 0004 rule 2).
 */
import type { Edge, FlowNode, GateNode, TerminalState } from '../definition/types.ts';
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
    const p = predicates.get(e.when);
    if (!p) throw new NoMatchingEdge(`predicate "${e.when}" is not registered; FD-V4 should have caught this at instantiation`);
    if (p(contextFor(e))) return { taken: e };
  }
  throw new NoMatchingEdge(
    `FD-R1: run "${runId}" reached node "${node.id}" with eligible edges for "${terminalState}" and none matched`,
  );
}
