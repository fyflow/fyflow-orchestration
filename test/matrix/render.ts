/**
 * Prints the matrix as a markdown table — the thing a person looks at
 * (`doc/workflow.md` section 1: a work item ends in something a human can read).
 *
 *   node test/matrix/render.ts        deno run --allow-read test/matrix/render.ts
 *
 * **This is a by-product, never a source of truth.** The values it prints are the
 * same ones `matrix.test.ts` asserts against expectations written by hand from
 * `spec/join-policy.md`. Nothing in the repository consumes this output
 * automatically: ADR 0003 carries a copy, and the copy is checked by the
 * assertions rather than by a diff against this script.
 */
import { arrivalCount, liveToken } from '../../src/fold/policies.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import { renderTable, runCell } from './run.ts';
import { SCENARIOS } from './scenarios.ts';

const rows = SCENARIOS.map((scenario) => ({
  scenario,
  cells: [runCell(scenario, arrivalCount as JoinPolicy), runCell(scenario, liveToken as JoinPolicy)],
}));

console.log(renderTable(rows, ['arrival-count', 'live-token']));
