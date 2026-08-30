/**
 * Routing — `spec/flow-definition.md` section 3. Pure: it returns the edge to
 * take, and dispatches nothing (ADR 0001 rule 3).
 *
 * Eligibility is checked BEFORE the `when` evaluation, and only over the eligible
 * edges (ADR 0004 rule 2).
 */
import type { Edge, FlowNode, TerminalState } from '../definition/types.ts';
import type { OutcomeRecord } from './log.ts';

/** What a predicate receives. P1 populates exactly one field; Q8 is whether it grows. */
export interface DecisionContext {
  /**
   * `OR-R9` — ALWAYS the node's effective outcome, so a predicate sees one shape
   * whether the node settled or was resolved, and `terminalState` is never undefined.
   */
  outcome: OutcomeRecord;
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
  if (node.kind !== 'task' && node.kind !== 'join') return [];
  const edges: Edge[] = Array.isArray((node as { edges?: Edge[] }).edges) ? (node as { edges: Edge[] }).edges : [];
  return edges.filter((e) => onOf(e).includes(terminalState));
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
  ctx: DecisionContext,
  predicates: PredicateRegistry,
): RoutingResult {
  const eligible = eligibleEdges(node, terminalState);
  if (eligible.length === 0) return { taken: null, reason: 'no-eligible-edge' };
  for (const e of eligible) {
    if (e.when === undefined) return { taken: e };
    const p = predicates.get(e.when);
    if (!p) throw new NoMatchingEdge(`predicate "${e.when}" is not registered; FD-V4 should have caught this at instantiation`);
    if (p(ctx)) return { taken: e };
  }
  throw new NoMatchingEdge(
    `FD-R1: run "${runId}" reached node "${node.id}" with eligible edges for "${terminalState}" and none matched`,
  );
}
