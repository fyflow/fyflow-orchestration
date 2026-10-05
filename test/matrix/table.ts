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
import { MAP_SCENARIOS, NESTED_SCENARIOS, SCENARIOS } from './scenarios.ts';
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
 * lines over ([Q100](../../doc/questions/q100.md)), and four rows asserted but
 * never shown would be the same thing with the halves swapped.
 */
export function nestedRows() {
  return NESTED_SCENARIOS.map((scenario) => ({
    scenario,
    cells: MATRIX_COLUMNS.map((policy) => runCell(scenario, policy)),
  }));
}

/**
 * **The MAP rows — [W34](../../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md).**
 * A third function for the same reason `nestedRows` is a second: a run-time arity
 * is its own axis, and folding these into `SCENARIOS` would restate ADR 0003's
 * arithmetic over rows it did not count.
 *
 * **They are RENDERED, and that is the point of the function existing.** A
 * deliverable no script prints is the defect `render.ts` was reduced to two lines
 * over ([Q100](../../doc/questions/q100.md)), and five rows asserted but never
 * shown would be the same thing with the halves swapped — which is the argument
 * `nestedRows` already makes, applied to the rows this item added.
 */
export function mapRows() {
  return MAP_SCENARIOS.map((scenario) => ({
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

/**
 * The map table, rendered by the same function from the same column list.
 *
 * **What it deliberately does NOT show is the join's collected payload**, and the
 * reason is that this render is a **policy comparison**: its cell is
 * `status`/`verdict`/`describe`, which is what differs between the four columns and
 * what ADR 0003 and ADR 0025 were decided from. `JP-R12`'s collection is a property
 * of the REGION rather than of the policy, so on most rows it is the same value in
 * every column that fires and a payload column would repeat itself four times.
 * **It is asserted at L5 instead** — `matrix.test.ts`'s `JP-R12` tests compare it
 * on all 34 firing static cells and all 11 firing map cells. Stated here because
 * W34's adequacy reader is right that the exit artifact does not mention the
 * item's central new fact, and a reader should find the decision rather than the
 * omission.
 */
export function renderMap(): string {
  return renderTable(mapRows(), MATRIX_COLUMNS.map((p) => p.id));
}

/** Re-exported so a caller that wants the header order does not rebuild it. */
export { MATRIX_POLICY_IDS };
