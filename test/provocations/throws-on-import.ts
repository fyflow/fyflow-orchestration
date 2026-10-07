/**
 * **Q272's provocation: a suite that THROWS WHILE IT IS BEING IMPORTED** — W132, P30. It is NOT a
 * `*.test.ts`, so the runner's default glob and the browser bundle never see it; it reaches the runner
 * only through `--with`, which is what `test/provocations/q272.ts` passes.
 *
 * The throw is the shape the tree has actually met (W62, W72, W73, P19): a fixture read at MODULE SCOPE
 * that fails, so the module throws before `suite()` registers anything. Before W132 that ended
 * `npm test` with a stack trace and ZERO `FAIL` lines, and no other suite ran; since W132 it is ONE
 * `FAIL` line naming this file, every other suite runs, and the runner exits 1.
 */
import { equal, suite } from '../harness.ts';

/** A fixture that does not parse — the throw, at module scope, before any suite exists. */
const fixture: { cases: number } = JSON.parse('{ "cases": 1, this is not JSON }');

suite('Q272 provocation — a suite that throws on import, and must never register', (test) => {
  test('never runs: the module threw before this suite was registered', () => {
    equal(fixture.cases, 1, 'unreachable while the fixture above fails to parse');
  });
});
