/**
 * **The shape each carrying node of a document takes, derived from its structure** — W58's
 * adequacy reader (`d01`, `d05`): the three shapes `spec/flow-definition.md` section 2 (v0.16)
 * ranges over were a list in two suites bound to nothing but the printed case count, and with
 * the map shape deleted from either, a rule or a passthrough narrowed to the other two shapes
 * cost ZERO. This is the second observer of that membership, and it is a helper rather than a
 * test file so that neither suite imports the other — renaming one out of the runner's glob
 * must be caught by the suite census, not turn into a load crash of the other.
 *
 * A node is a top-level task when it is the entry, a fanout branch task when some `fanout` lists
 * it, a map branch task when some `map` names it; the labels are the two suites' own, so each
 * compares its `SHAPES` list to this by set equality rather than by count.
 *
 * **`carries` is W59's parameter, and it exists so the typed suites do not write a FOURTH
 * literal list.** W58's predicate — a task declaring BOTH `retryPolicy` and `workerGroups` — is
 * the default, so W58's two callers are unchanged; `typedNode` is the predicate the typed corpus
 * flow's carrying nodes satisfy, and the same three labels come out.
 */
import type { FlowDefinition, FlowNode } from '../../src/definition/types.ts';

/** W58's carrying node: a task declaring both keys the item added. */
export const configuredNode = (n: FlowNode): boolean =>
  n.kind === 'task' && (n as { retryPolicy?: unknown }).retryPolicy !== undefined && (n as { workerGroups?: unknown }).workerGroups !== undefined;

/** W59's carrying node: a task naming a `type`. */
export const typedNode = (n: FlowNode): boolean =>
  n.kind === 'task' && (n as { type?: unknown }).type !== undefined;

export function shapesOf(flow: FlowDefinition, carries: (n: FlowNode) => boolean = configuredNode): string[] {
  const fanoutEntries = new Set(flow.nodes.filter((n) => n.kind === 'fanout').flatMap((n) => (n as { branches: string[] }).branches));
  const mapBranches = new Set(flow.nodes.filter((n) => n.kind === 'map').map((n) => (n as { branch: string }).branch));
  // **A join's successor is a FOURTH shape — W59's adequacy reader (q51).** `FD-C5` enumerates
  // what `input` may be, and its fourth kind is the collection a join hands its successor; with no
  // suite instantiating that position, a driver handing a typed successor `{}` instead of the
  // collection cost 0 at L2 and at L6. It is a shape of the TYPED feature and not of W58's, whose
  // predicate no corpus successor satisfies, so the label is unreachable from the default.
  const joinSuccessors = new Set(flow.nodes.filter((n) => n.kind === 'join').flatMap((n) => ((n as { edges: { to: string }[] }).edges ?? []).map((e) => e.to)));
  return flow.nodes
    .filter((n) => carries(n))
    .map((n) => n.id === flow.entry ? 'top-level task' : fanoutEntries.has(n.id) ? 'task inside a fanout branch' : mapBranches.has(n.id) ? 'branch task of a map' : joinSuccessors.has(n.id) ? 'successor of a join' : `UNKNOWN shape for ${n.id}`);
}
