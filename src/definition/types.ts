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

/**
 * **A declared reference to something the run has produced** —
 * `spec/flow-definition.md` section 3's `needs`, and
 * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md).
 *
 * Three forms, all of them data (ADR 0002 rule 1 — nothing here is a function and
 * everything survives `JSON.parse(JSON.stringify(x))`):
 *
 * | | |
 * |---|---|
 * | `"."` | what this node would have received anyway — the ordinary edge's value, and for a `map` instance its own item (`JP-R11`). The one token outside `FD-V16`'s charset, so it can never collide with a node id |
 * | `"score"` | that node's output **on this node's own branch path**. Exactly one, or the run stops (`FD-R3`) |
 * | `["score"]` | that node's outputs as an **array**, in ascending segment-wise-numeric `branchPath` order. Legal only where the reader is outside a region containing the named node (`FD-V28`) |
 *
 * **The array form uses JSON's own array syntax rather than a sigil**, so the
 * grammar needs exactly one invented token (`"."`) rather than two.
 */
export type Reference = string | readonly [string];

/**
 * **What a node receives, when it does not want the previous node's output** —
 * `FD-C1`. An object whose keys are the keys of the payload the node receives and
 * whose values are references. A node that declares one receives **exactly** the
 * object this describes; a node that does not receives what section 3 says an
 * ordinary edge carries, unchanged.
 *
 * Only a `task` and a `map` may carry it: `FD-V17` already refuses an undeclared
 * key on the other three kinds, so that clause needs no rule of its own.
 */
export type Needs = Readonly<Record<string, Reference>>;

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
  /**
   * **What this node receives** — `FD-C1`, `FD-V26`-`FD-V28`. Optional: a task
   * without one receives the ordinary edge's value (section 3), which is what
   * every task received before [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md).
   */
  needs?: Needs;
}

export interface FanoutNode {
  id: string;
  kind: 'fanout';
  /** Branch entry ids, in declaration order. The index here is the `branchPath` segment. */
  branches: string[];
}

/**
 * **A region whose arity is not in the document** — `spec/flow-definition.md`
 * section 2, added at v0.8 by
 * [ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md),
 * answering [Q12](../../doc/open-questions.md): **fan-out is two features over one
 * region.**
 *
 * A `fanout` declares N branches known at authoring time. A `map` declares **one**
 * branch and a run opens N instances of it. That is the whole difference, and it is
 * why this is a second kind rather than a widened `fanout`: `FD-V9`'s arity floor is
 * a statement about the document and a map's arity is not in the document, and
 * `FD-V19`'s *"two distinct branch entries"* has no instance where there is one.
 */
export interface MapNode {
  id: string;
  kind: 'map';
  /**
   * A **key** on the value this node receives, matching `FD-V16`'s charset
   * (`FD-V25`). A declared reference and never a callback — ADR 0002 rule 1, which
   * is why *"how many items"* cannot be a function. **What it is a key ON is
   * [Q11](../../doc/open-questions.md) and belongs to W34**; this type is stated
   * against whatever that resolves to.
   */
  over: string;
  /** **One** branch entry id, whose kind is a `task` (`FD-V25`). Not a list. */
  branch: string;
  /**
   * **What this node receives, and therefore what `over` is a key on** —
   * `FD-C1`. A `map` carries it for the same reason a `task` does, and it is what
   * makes *fan out over what a region produced* expressible: `needs: {"scores":
   * ["score"]}` with `over: "scores"` maps over an array the previous node never
   * produced ([Q165](../../doc/open-questions.md)).
   */
  needs?: Needs;
}

export interface JoinNode {
  id: string;
  kind: 'join';
  /**
   * The `fanout` **or `map`** this join closes. The pairing is declared once, here
   * (spec section 4). Widened at v0.8 — `FD-V6`.
   */
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

export type FlowNode = TaskNode | FanoutNode | MapNode | JoinNode | EndNode;

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
  /** `FD-V1` … `FD-V25`. Never renumbered, so it is safe to assert on. */
  rule: string;
  /** Node id, edge index, or document-level `null`. */
  at: string | null;
  detail: string;
}
