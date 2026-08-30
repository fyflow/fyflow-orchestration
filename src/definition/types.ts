/**
 * The flow definition, as data. `spec/flow-definition.md` sections 1-3.
 *
 * ADR 0002 rule 1: no functions anywhere in the structure. Everything here
 * survives `JSON.parse(JSON.stringify(x))`, which is what lets a definition be
 * validated, rendered and persisted by things that never ran it.
 */

/** The terminal states an edge may opt into. `user_action` is refused: it suspends (FD-V18). */
export type RoutableState = 'done' | 'failed';

/** Every terminal state a scheduler task can reach. Five library states, three terminal. */
export type TerminalState = 'done' | 'failed' | 'user_action';

export interface Edge {
  /** Target node id. Required (FD-V23). */
  to: string;
  /**
   * Terminal states this edge is eligible for. Default `['done']` — an edge with
   * no `on` routes successes and nothing else (ADR 0004 rule 1).
   */
  on?: RoutableState[];
  /** Predicate name, resolved against the registry at instantiation (FD-V4). */
  when?: string;
}

export interface TaskNode {
  id: string;
  kind: 'task';
  workerType: string;
  edges: Edge[];
  /**
   * `true` means the flow handles this node's failure; the default means a human
   * does (ADR 0004 rule 7). It is passed through to the scheduler task, and it is
   * the only way a node can *settle* `failed` rather than `user_action`.
   */
  optional?: boolean;
}

export interface FanoutNode {
  id: string;
  kind: 'fanout';
  /** Branch entry ids, in declaration order. The index here is the `branchPath` segment. */
  branches: string[];
}

export interface JoinNode {
  id: string;
  kind: 'join';
  /** The fanout this join closes. The pairing is declared once, here (spec section 4). */
  of: string;
  /** Exactly one edge, carrying neither `when` nor `on` (FD-V7). */
  edges: Edge[];
}

export interface EndNode {
  id: string;
  kind: 'end';
  /** Author-defined and never interpreted by the driver (Q25). */
  outcome: string;
}

export type FlowNode = TaskNode | FanoutNode | JoinNode | EndNode;

export interface FlowDefinition {
  flowId: string;
  version: number;
  entry: string;
  nodes: FlowNode[];
}

/**
 * What a definition is validated *against*. ADR 0002 rule 3: an unknown predicate
 * or worker type fails here, at instantiation, rather than on the one workload
 * that takes that branch.
 */
export interface Registry {
  predicates: ReadonlySet<string> | readonly string[];
  workerTypes: ReadonlySet<string> | readonly string[];
}

/**
 * One violated rule. The validator reports **every** violation rather than the
 * first: `spec/flow-definition.md` section 5 requires an invalid definition to be
 * rejected *and* the named rule to appear among the findings, and several cases
 * legitimately violate more than one rule.
 */
export interface Finding {
  /** `FD-V1` … `FD-V24`. Never renumbered, so it is safe to assert on. */
  rule: string;
  /** Node id, edge index, or document-level `null`. */
  at: string | null;
  detail: string;
}
