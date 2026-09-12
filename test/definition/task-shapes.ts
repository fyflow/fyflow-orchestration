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
 */
import type { FlowDefinition } from '../../src/definition/types.ts';

export function shapesOf(flow: FlowDefinition): string[] {
  const fanoutEntries = new Set(flow.nodes.filter((n) => n.kind === 'fanout').flatMap((n) => (n as { branches: string[] }).branches));
  const mapBranches = new Set(flow.nodes.filter((n) => n.kind === 'map').map((n) => (n as { branch: string }).branch));
  return flow.nodes
    .filter((n) => n.kind === 'task' && (n as { retryPolicy?: unknown }).retryPolicy !== undefined && (n as { workerGroups?: unknown }).workerGroups !== undefined)
    .map((n) => n.id === flow.entry ? 'top-level task' : fanoutEntries.has(n.id) ? 'task inside a fanout branch' : mapBranches.has(n.id) ? 'branch task of a map' : `UNKNOWN shape for ${n.id}`);
}
