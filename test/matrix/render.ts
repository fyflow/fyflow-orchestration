/**
 * Prints the matrix as a markdown table — the thing a person looks at
 * (`doc/workflow.md` section 1: a work item ends in something a human can read).
 *
 *   node test/matrix/render.ts        deno run --allow-read test/matrix/render.ts
 *
 * **Four columns since W15**: the two policies `spec/join-policy.md` section 3
 * names, then `JP-R7`'s and `JP-R8`'s refinements under their own ids.
 *
 * **This file is deliberately two lines.** Everything it used to do is in
 * `./table.ts`, which the suite imports and asserts — because **no script in
 * `package.json` executes this one**, so any logic left here is unchecked by
 * construction. W15's adequacy reader found seven surviving mutations in the
 * version that had logic, one of which printed a two-column table with the whole
 * gate green.
 */
import { renderMatrix } from './table.ts';

console.log(renderMatrix());
