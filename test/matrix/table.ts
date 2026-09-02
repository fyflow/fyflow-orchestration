/**
 * **The matrix table, as one function** — W15's declared Output (1) and
 * [P5](../../doc/plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md)'s
 * exit artifact, the thing a person looks at and the thing W16 copies into
 * ADR 0025.
 *
 * **It lives here rather than in `render.ts` because `render.ts` is executed by
 * no script in `package.json`** — not by `test`, not by `gate`. W15's adequacy
 * reader measured what that cost: **seven surviving mutations**, including one
 * that printed a **two-column** table with all 361 assertions and `deno lint`
 * green, and five that emptied a cell, dropped the event stream, reversed the
 * column order or broke the separator row. A declared output produced by an
 * unexecuted script is a declared output nobody built, which
 * `doc/workflow.md` section 4 lists as a defect class with no rung.
 *
 * So the whole of the render is a function the suite imports and asserts, and
 * `render.ts` is a two-line shim with no list, no slice and no logic left in it
 * to mutate.
 */
import { renderTable, runCell } from './run.ts';
import { NESTED_SCENARIOS, SCENARIOS } from './scenarios.ts';
import { MATRIX_COLUMNS, MATRIX_POLICY_IDS } from './variants.ts';

/** Every row against every column — the same values `matrix.test.ts` asserts. */
export function matrixRows() {
  return SCENARIOS.map((scenario) => ({
    scenario,
    cells: MATRIX_COLUMNS.map((policy) => runCell(scenario, policy)),
  }));
}

/**
 * **The depth-2 rows — W22.** A separate function rather than four more entries
 * in `matrixRows()`, for the reason `scenarios.ts` gives for keeping them out of
 * `SCENARIOS`: the nine are Q5's cases and ADR 0003 counts them.
 *
 * **They are rendered**, and that is the point of the function existing at all.
 * A deliverable no script prints is the defect `render.ts` was reduced to two
 * lines over ([Q100](../../doc/open-questions.md)), and four rows asserted but
 * never shown would be the same thing with the halves swapped.
 */
export function nestedRows() {
  return NESTED_SCENARIOS.map((scenario) => ({
    scenario,
    cells: MATRIX_COLUMNS.map((policy) => runCell(scenario, policy)),
  }));
}

/**
 * The rendered markdown table.
 *
 * **The id list is derived from the policy list, not passed alongside it.**
 * `MATRIX_POLICY_IDS` is still asserted to equal `MATRIX_COLUMNS.map(p => p.id)`
 * in `matrix.test.ts`, so the constant is checked; but nothing here can hand
 * `renderTable` a *different* list from the one the cells were produced with,
 * which is the mutation (`R2`) that printed two columns and survived everything.
 */
export function renderMatrix(): string {
  return renderTable(matrixRows(), MATRIX_COLUMNS.map((p) => p.id));
}

/**
 * The depth-2 table, rendered by the same function from the same column list, so
 * the two cannot be laid out differently or fall out of step.
 */
export function renderNested(): string {
  return renderTable(nestedRows(), MATRIX_COLUMNS.map((p) => p.id));
}

/** Re-exported so a caller that wants the header order does not rebuild it. */
export { MATRIX_POLICY_IDS };
