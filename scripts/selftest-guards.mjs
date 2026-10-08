/**
 * **The one definition of a mutation that half-happened — shared by every `scripts/*-selftest.mjs`.**
 * [W143](../doc/work-items/w143-the-self-tests-three-guards.md), [Q434](../doc/questions/q434.md).
 *
 * `mutated === src` is `doc/workflow.md` section 5 rule 7 (b) over the WHOLE text, and a COMPOUND defeats
 * it: an entry whose first edit matches and whose second matches nothing still changes the text, so the
 * guard passes and the entry grades a mutation it did not make. W105 shipped exactly that for two entries of
 * `check-wiring-selftest.mjs` — the lane said `exited 0: the mutation costs nothing`, a true sentence about
 * the wrong subject — and closed it there by instrumenting `String.prototype.replace` for the duration of
 * the call. This module is that instrumentation, moved out of the one file that had it so the other self-tests
 * read the same definition (the maintainer's answer to W143's stop-and-ask, option A).
 *
 * **What counts as a MISS**: a `.replace` or `.replaceAll` call made while `mutate` runs whose result equals
 * its receiver — the call changed nothing. `replaceAll` is covered because three swap entries (`M1`/`M2`,
 * `P1`/`P2`, `S12`/`S13`) are written with it, and a swap whose third leg matched nothing is a swap that did
 * not happen. A `.replace` that legitimately replaces a string with itself counts as a miss; an entry that
 * needs a miss on purpose says so where it is graded, never here.
 *
 * **What it cannot see**, stated rather than padded around: an edit made by `slice`, `split`/`join`,
 * `indexOf` or a template literal makes no call this counts; a regex or callback form is counted like any
 * other. A caller that wants those graded keeps its own whole-text guard beside this one — every caller does.
 *
 * **The patch is scoped to the call** and restored in a `finally`, so harness code that runs a `.replace`
 * which may legitimately match nothing — `relative(...).replace(/\\/g, '/')` on a path with no backslash —
 * is never counted. **The caller passes only the FIRST application of an entry**: the "matched MORE THAN
 * ONCE" and "GLOBAL" guards re-apply a mutation to text where it must NOT match, and wrapping them would
 * count their success as a miss.
 *
 * **Loaded by a ROOT-DERIVED dynamic import, never `./selftest-guards.mjs`**: a `SELF` child runs a mutated
 * COPY of its self-test from a scratch directory, where a relative static import does not resolve.
 *
 * @param {(...args: any[]) => any} mutate the entry's mutation — `(text) => text` for most, `(dir) => void`
 *   for a probe that edits files
 * @param {...any} args what it is applied to
 * @returns {{ out: any, misses: number }}
 */
export const applyMutation = (mutate, ...args) => {
  const realReplace = String.prototype.replace;
  const realReplaceAll = String.prototype.replaceAll;
  let misses = 0;
  const watch = (real) => function patched(from, to) {
    const out = real.call(this, from, to);
    if (out === String(this)) misses += 1;
    return out;
  };
  // eslint-disable-next-line no-extend-native
  String.prototype.replace = watch(realReplace);
  // eslint-disable-next-line no-extend-native
  String.prototype.replaceAll = watch(realReplaceAll);
  try {
    return { out: mutate(...args), misses };
  } finally {
    // eslint-disable-next-line no-extend-native
    String.prototype.replace = realReplace;
    // eslint-disable-next-line no-extend-native
    String.prototype.replaceAll = realReplaceAll;
  }
};

/**
 * The sentence every caller prints for a miss, so the eleven files say the same thing and a grep finds them all.
 * @param {number} misses
 */
export const missWhy = (misses) => `${misses} of this mutation's \`replace\` calls matched NOTHING, so the ` +
  'text changed and the entry is about a different mutation from the one it names (Q434). Re-anchor it: a ' +
  'literal pinned to text someone has since reformatted is rule 7 (b) at the half a whole-text comparison cannot see';

