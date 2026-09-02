/**
 * Prints the matrix as a markdown table — the thing a person looks at
 * (`doc/workflow.md` section 1: a work item ends in something a human can read).
 *
 *   node test/matrix/render.ts        deno run --allow-read test/matrix/render.ts
 *
 * **Four columns since W15**: the two policies `spec/join-policy.md` section 3
 * names, then `JP-R7`'s and `JP-R8`'s refinements under their own ids.
 * **Two tables since W22**: Q5's nine cases at depth 1, then the four depth-2
 * rows [ADR 0030](../../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
 * is decided from.
 *
 * **This file is deliberately a shim.** Everything it used to do is in
 * `./table.ts`, which the suite imports and asserts — because **no script in
 * `package.json` executes this one**, so any logic left here is unchecked by
 * construction. W15's adequacy reader found seven surviving mutations in the
 * version that had logic, one of which printed a two-column table with the whole
 * gate green. The two headings below are the only strings it owns.
 */
import { renderMatrix, renderNested } from './table.ts';

console.log('## Depth 1 — Q5’s nine cases\n');
console.log(renderMatrix());
console.log('\n## Depth 2 — a nested fan-out (W22, ADR 0030)\n');
console.log(renderNested());
