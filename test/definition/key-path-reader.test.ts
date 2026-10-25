/**
 * Ladder L1 — **the key path reader, public from the root entry**: P45 (c1), decision 1, fact 2,
 * [W220](../../doc/work-items/w220-the-key-path-reader-exported-and-documented.md) — fyflow-app's pass 6 #2.
 *
 * **Every expected value is read from `spec/flow-definition.md` section 2's KEY PATH** (the grammar `^SEG(\.SEG)*$`,
 * `SEG` = `[A-Za-z0-9_-]{1,64}(\[(0|[1-9][0-9]{0,8})\])*`; a KEY step an own key of a plain object, an INDEX step an own
 * element of a REAL array, a plain numeric segment a KEY) and [ADR 0137](../../doc/decisions/0137-a-key-path-indexes-an-array-by-a-bracket-suffix-and-a-plain-segment-keeps-its-meaning.md)
 * rules 1-2, and from section 3's `when` PATH for the roots (`FD-V43`: `outcome` and `needs`) — derived by hand in the
 * item file before the first run, never from the functions' output.
 *
 * **The claim is about the ROOT ENTRY**, so every function is called through `import * as lib from '../../index.ts'`
 * — the module `scripts/build.mjs` bundles for node AND browser and `deno.json`'s `"."` names. Each name is held
 * `===` to its defining module's own (a copy or a wrapper would be a second reader to hold in step), and the CONTROL is
 * two names that module also exports and the root does NOT — `evalLeaf` and `evaluateDeclared` — so a root that
 * re-exported `condition.ts` whole fails here, and a namespace read that answered every name would fail the control.
 * `KeyPathStep` is imported as a TYPE from the root and used, which is the L0 half: the tests' typecheck lane fails
 * if the root does not carry it.
 */
import { equal, ok, suite, collected } from '../harness.ts';
import * as lib from '../../index.ts';
import type { KeyPathStep } from '../../index.ts';
import * as condition from '../../src/definition/condition.ts';
import * as validate from '../../src/definition/validate.ts';
import * as types from '../../src/definition/types.ts';

const SUITE = 'L1 — W220, P45 (c1): the key path reader from the root entry — keyPathSteps, KeyPathStep, readKeyPath, KEY_PATH_RE and PREDICATE_ROOTS';

const DECLARED_CASES = [
  'the root entry carries the four values, each the defining module`s own, and not evalLeaf or evaluateDeclared (the control)',
  'keyPathSteps through the root: section 2`s steps, a segment the grammar does not spell kept as ONE literal key',
  'readKeyPath through the root: a key on a plain object, an index on a real array, and xs.1 over an array nothing (the control)',
  'KEY_PATH_RE through the root: section 2`s grammar, and PREDICATE_ROOTS: an edge comparison`s two roots',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

/** The hand-written value every resolution below reads — section 2's cases, one key each. */
const VALUE = { files: [{ name: 'a.csv' }, { name: 'b.csv' }], xs: ['p', 'q'], m: [[0, 1, 2]], o: { '1': 'one' } };

/** The item file's table: path → steps, resolution, grammar. `'SELF:files'` marks "the array itself". */
const TABLE: [string, KeyPathStep[], unknown, boolean][] = [
  ['files[0].name', [{ key: 'files' }, { index: 0 }, { key: 'name' }], 'a.csv', true],
  ['files[1].name', [{ key: 'files' }, { index: 1 }, { key: 'name' }], 'b.csv', true],
  ['files[2].name', [{ key: 'files' }, { index: 2 }, { key: 'name' }], undefined, true],
  ['xs[1]', [{ key: 'xs' }, { index: 1 }], 'q', true],
  ['xs.1', [{ key: 'xs' }, { key: '1' }], undefined, true],
  ['o.1', [{ key: 'o' }, { key: '1' }], 'one', true],
  ['o[1]', [{ key: 'o' }, { index: 1 }], undefined, true],
  ['m[0][2]', [{ key: 'm' }, { index: 0 }, { index: 2 }], 2, true],
  ['files', [{ key: 'files' }], 'SELF:files', true],
  ['nope.x', [{ key: 'nope' }, { key: 'x' }], undefined, true],
  ['[0].x', [{ key: '[0]' }, { key: 'x' }], undefined, false],
  ['xs[01]', [{ key: 'xs[01]' }], undefined, false],
  ['files[*].name', [{ key: 'files[*]' }, { key: 'name' }], undefined, false],
];

suite(SUITE, (test) => {
  test('the root entry carries the four values, each the defining module`s own, and not evalLeaf or evaluateDeclared (the control)', () => {
    const root = lib as Record<string, unknown>;
    ok(typeof root.keyPathSteps === 'function', 'index.ts exports keyPathSteps');
    ok(root.keyPathSteps === condition.keyPathSteps, 'and it is condition.ts` own, not a copy');
    ok(typeof root.readKeyPath === 'function' && root.readKeyPath === condition.readKeyPath, 'readKeyPath, condition.ts` own');
    ok(root.KEY_PATH_RE instanceof RegExp && root.KEY_PATH_RE === validate.KEY_PATH_RE, 'KEY_PATH_RE, validate.ts` own');
    ok(root.PREDICATE_ROOTS === types.PREDICATE_ROOTS && Array.isArray(root.PREDICATE_ROOTS),'PREDICATE_ROOTS, types.ts` own');
    // The control: two names the SAME module exports, and the root deliberately does not (decision 1).
    for (const name of ['evalLeaf', 'evaluateDeclared']) {
      ok(typeof (condition as Record<string, unknown>)[name] === 'function', `${name} is exported by condition.ts — so its absence below is the root's choice`);
      ok(!(name in root), `${name} is NOT exported by the root entry`);
    }
  });

  test('keyPathSteps through the root: section 2`s steps, a segment the grammar does not spell kept as ONE literal key', () => {
    // The loop bound, counted and named: the item file's table is thirteen rows, these thirteen (adequacy D7, D8b — a
    // row dropped, or the whole table emptied, left every loop below green).
    equal(TABLE.map((r) => r[0]), ['files[0].name', 'files[1].name', 'files[2].name', 'xs[1]', 'xs.1', 'o.1', 'o[1]', 'm[0][2]', 'files', 'nope.x', '[0].x', 'xs[01]', 'files[*].name'],
      'the thirteen rows of the item file`s table, in its order');
    for (const [path, steps] of TABLE) equal(lib.keyPathSteps(path), steps, `the steps of ${path}`);
    // A step is a KEY or an INDEX and never both: the type's two members, read by `in`, as the library reads them.
    const kinds = lib.keyPathSteps('files[0].name').map((s: KeyPathStep) => ('index' in s ? 'index' : 'key'));
    equal(kinds, ['key', 'index', 'key'], 'a key, an index, a key');
  });

  test('readKeyPath through the root: a key on a plain object, an index on a real array, and xs.1 over an array nothing (the control)', () => {
    for (const [path, , read] of TABLE) {
      const expected = read === 'SELF:files' ? VALUE.files : read;
      ok(lib.readKeyPath(VALUE, path) === expected, `${path} reads ${String(read)} — got ${String(lib.readKeyPath(VALUE, path))}`);
    }
    // The control of the index claim: the same element, spelled as a plain numeric segment, is nothing over an array.
    ok(lib.readKeyPath(VALUE, 'xs[1]') === 'q' && lib.readKeyPath(VALUE, 'xs.1') === undefined, 'xs[1] indexes; xs.1 is a key and an array has none');
  });

  test('KEY_PATH_RE through the root: section 2`s grammar, and PREDICATE_ROOTS: an edge comparison`s two roots', () => {
    for (const [path, , , grammar] of TABLE) equal([path, lib.KEY_PATH_RE.test(path)], [path, grammar], `${path} ${grammar ? 'is' : 'is NOT'} a key path`);
    equal([...lib.PREDICATE_ROOTS], ['outcome', 'needs'], 'FD-V43: outcome and needs, and the if`s input is not one');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((x) => x.suite === SUITE).flatMap((x) => x.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
