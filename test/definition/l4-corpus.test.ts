/**
 * Ladder L4 — definition conformance.
 *
 * **This is the reason W3 runs before W2.** A refusal rule that rejects the spec's
 * own valid examples shipped in two of the four versions of
 * `spec/flow-definition.md` — `FD-V13` at v0.1, `FD-V19` at v0.2, the second one
 * rejecting the flow P1 exists to run. Until this file existed, that property was
 * held up by a throwaway script outside the repository and one conformity reader
 * who reproduced it. Here it is a gate, and it is true of every future version
 * rather than of one that happened to get checked.
 *
 * The corpus is W1's. It is hand-written and MUST NOT be regenerated from this
 * validator's output (`doc/workflow.md` section 5 rule 4) — a corpus produced by
 * the code under test proves only that the code agrees with itself.
 *
 * If this disagrees with `spec/`, **stop and report the conflict** rather than
 * adjusting either (`spec/README.md` rule 2).
 */
import { equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import type { FlowDefinition, Registry } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;

const registryDoc = JSON.parse(await readText(`${EX}/registry.json`)) as {
  predicates: string[];
  workerTypes: string[];
};
const registry: Registry = {
  predicates: new Set(registryDoc.predicates),
  workerTypes: new Set(registryDoc.workerTypes),
};

const specText = await readText(`${ROOT}spec/flow-definition.md`);
const validNames = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json'));
const invalidNames = (await listDir(`${EX}/invalid`)).filter((n) => n.endsWith('.flow.json'));

const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;

/**
 * **The corpus and the spec's own table, compared BOTH WAYS** — `spec/flow-definition.md`
 * section 7, added at v0.8 by [W32](../../doc/work-items/w32-what-a-map-fanout-is.md).
 *
 * **Equality rather than a floor**, for `S12`'s reason in `scripts/check-source.mjs`: a
 * floor answers *are there at least N*, and `RUN_FLOOR` is the worked example of one
 * going stale in the direction of weakness ([Q102](../../doc/open-questions.md)). This
 * fails in both directions — a flow added with no row, and a row naming a flow that is
 * gone.
 *
 * **It had a live case the day it was written.** `nested-fanout.flow.json` was added by
 * [W20](../../doc/work-items/w20-what-a-nested-region-is.md) and never documented, so
 * section 7's table was stale by one for a whole plan and every check here passed.
 *
 * **And it closes a WIRING hole** (`doc/workflow.md` section 5 rule 8 obligation (e)).
 * Until this existed, renaming a corpus flow out of the `.flow.json` glob was noticed by
 * **nothing**: the loops below simply had one less case, `check-spec`'s `C4` never opens a
 * file, and the only bound was `length > 0`. Measured before this was written.
 */
const documentedValid = (() => {
  // Anchored on the SECTION HEADING, not on the first mention of the directory:
  // `spec/examples/valid/` occurs in section 4's own warning paragraph and
  // `spec/examples/invalid/` occurs in section 5's preamble, so a marker-to-marker
  // slice reads a region with no table in it and returns an empty list.
  const from = specText.indexOf('## 7. Examples');
  const doc = from < 0 ? '' : specText.slice(from);
  const stop = doc.indexOf('`spec/examples/invalid/`');
  const table = stop < 0 ? doc : doc.slice(0, stop);
  // **Two narrowings here have NO discriminating case in section 7 as written, and
  // that is recorded rather than argued** — `doc/workflow.md` section 5 rule 8's
  // *"where the corpus cannot express one, RECORD that"*. Both were measured
  // replaceable for 0 by W32's adequacy reader: dropping the `stop` slice above,
  // and loosening the row anchor below to a bare backticked filename. The only
  // text after the table that mentions a flow filename is the
  // `<rule-id>--<slug>.flow.json` convention, which the character class already
  // excludes. They are kept because they are correct, not because anything here
  // can fail without them — the same sentence `check-markdown`'s `M1` earned at
  // W25, and `M1` caught a real dead link one plan later.
  // **Rows, not names** — see the provenance case in the suite below. The second
  // cell is what makes this parse falsifiable.
  return [...table.matchAll(/^\|\s*`([A-Za-z0-9_.-]+\.flow\.json)`\s*\|([^|]*)\|/gm)]
    .map((m) => ({ file: m[1]!, shows: m[2]!.trim() }))
    .sort((a, b) => (a.file < b.file ? -1 : 1));
})();

/** Every `FD-V*` id section 5 declares, and the ones it declares deliberately absent. */
const declaredRules = (() => {
  const all: string[] = [];
  const absent: string[] = [];
  for (const m of specText.matchAll(/^\|\s*`(FD-V\d+)`\s*\|(.*)$/gm)) {
    all.push(m[1]!);
    if (/deliberately absent/i.test(m[2]!)) absent.push(m[1]!);
  }
  return { all, absent, expected: all.filter((r) => !absent.includes(r)).sort() };
})();

suite('L4 — the corpus IS what spec/flow-definition.md section 7 says it is', (test) => {
  test('every valid flow on disk has a row in section 7, and every row has a file', () => {
    // Two assertions rather than one `equal`, so a failure says which DIRECTION
    // broke. **Equality rather than a floor**, for `S12`'s reason in
    // `scripts/check-source.mjs`: a floor answers *are there at least N*, and
    // `RUN_FLOOR` is the worked example of one going stale toward weakness
    // ([Q102](../../doc/open-questions.md)).
    //
    // **It had a live case the day it was written.** `nested-fanout.flow.json` was
    // added by [W20](../../doc/work-items/w20-what-a-nested-region-is.md) and never
    // documented, so section 7's table was stale by one for a whole plan.
    //
    // **And it closes a WIRING hole** (`doc/workflow.md` section 5 rule 8 (e)):
    // until this existed, renaming a corpus flow out of the `.flow.json` glob was
    // noticed by **nothing** — the loops below simply had one less case,
    // `check-spec`'s `C4` never opens a file, and the only bound was `length > 0`.
    const onDisk = [...validNames].sort();
    const named = documentedValid.map((r) => r.file);
    equal(
      onDisk.filter((n) => !named.includes(n)),
      [],
      'a flow in spec/examples/valid/ has no row in spec/flow-definition.md section 7',
    );
    equal(
      named.filter((n) => !onDisk.includes(n)),
      [],
      'spec/flow-definition.md section 7 names a flow that is not in spec/examples/valid/',
    );
  });

  test('the two sets above really did come from the SPEC and not from the directory', () => {
    // **Provenance** — `doc/workflow.md` section 5 rule 8 (c), and W32's adequacy
    // reader found the hole this closes. The assertions above compare a PARSED list
    // against a DISK list; re-source the parse to `[...validNames]` and both
    // differences are empty by construction, the non-empty guard is satisfied, and
    // the check that exists to bind the corpus to the spec binds nothing. Measured:
    // exit 0, with the author's own `e2` probe — a corpus flow renamed out of the
    // glob — passing again underneath it.
    //
    // The discriminator has to be a value **the directory cannot produce**.
    // Section 7's rows carry a second cell saying what each flow SHOWS; a filename
    // listing has no such thing. A count would have been circular, which is why the
    // first version reached for one and stopped.
    ok(documentedValid.length > 0, "section 7's example table did not parse — the sets above are noise");
    equal(
      documentedValid.filter((r) => r.shows.length === 0).map((r) => r.file),
      [],
      'every row parsed from section 7 carries its "shows" cell — a disk listing carries none',
    );
  });

  test('the valid corpus contains every node kind the spec declares', async () => {
    // **Content, not names** — W32's adequacy reader. Until this existed, both map
    // flows could be rewritten as ordinary static flows with **no `map` node in
    // them at all**, stay valid, and leave every check green: `check-spec`'s `C4`
    // binds `invalid/` filenames to rule ids and *never opens a file*, and the
    // equality above binds `valid/` filenames to table rows and did not open one
    // either. `FD-V24`'s own list is where the five come from.
    const kinds = new Set<string>();
    for (const name of validNames) {
      const flow = await load(`valid/${name}`);
      for (const n of ((flow.nodes ?? []) as { kind?: string }[])) {
        if (typeof n?.kind === 'string') kinds.add(n.kind);
      }
    }
    equal(
      ['task', 'fanout', 'map', 'join', 'end'].filter((k) => !kinds.has(k)),
      [],
      'a node kind the spec declares appears in no valid example, so nothing demonstrates it',
    );
  });

  test('the INVALID corpus is what section 5 declares, both ways', () => {
    // The same bound as the valid side, on the sibling directory — W32's adequacy
    // reader found it missing **in the file W32 rewrote to remove exactly this
    // shape**. `check-spec`'s `C4` bounds the DISK (a declared rule with no case
    // fails) and nothing bounded the WALK: `invalidNames.slice(1)` dropped 21 of 23
    // cases and the suite reported `all passed`, because its only bound was
    // `length > 0` — `RUN_FLOOR`'s shape again ([Q102](../../doc/open-questions.md)).
    const prefixes = [...invalidNames].map((n) => n.split('--')[0]!).sort();
    equal(
      declaredRules.expected.filter((r) => !prefixes.includes(r)),
      [],
      'a declared FD-V rule has no case in the WALK — this is C4 one layer in from the disk',
    );
    equal(
      prefixes.filter((r) => !declaredRules.expected.includes(r)),
      [],
      'the walk carries a case for a rule section 5 does not declare, or declares absent',
    );
    // and the parse this rests on is not vacuous, in both directions
    ok(declaredRules.all.length > 20, `section 5's rule table did not parse — got ${declaredRules.all.length}`);
    equal([...declaredRules.absent].sort(), ['FD-V14', 'FD-V15'],
      'the two deliberately-absent ids, read from the spec text rather than declared here');
  });
});

suite('L4 — every valid example validates clean', (test) => {
  ok(validNames.length > 0, 'spec/examples/valid/ has no flows — the corpus is missing');

  for (const name of validNames) {
    test(name, async () => {
      const findings = validateDefinition(await load(`valid/${name}`), registry);
      equal(
        violatedRules(findings),
        [],
        `a valid example was rejected. Per spec/README.md rule 2 this is a conflict to report, ` +
          `not to patch:\n    ${findings.map((f) => `${f.rule} at ${f.at}: ${f.detail}`).join('\n    ')}`,
      );
    });
  }
});

suite('L4 — every invalid example is rejected, naming its own rule', (test) => {
  ok(invalidNames.length > 0, 'spec/examples/invalid/ has no flows — the corpus is missing');

  for (const name of invalidNames) {
    // The expected value comes from the FILENAME, which W1 wrote from the rule —
    // never from what the validator happens to report.
    const expected = name.split('--')[0]!;
    test(`${name} violates ${expected}`, async () => {
      const rules = violatedRules(validateDefinition(await load(`invalid/${name}`), registry));
      ok(rules.length > 0, `${name} was accepted; it must be rejected`);
      ok(
        rules.includes(expected),
        `${name} was rejected, but not for ${expected}. spec/flow-definition.md section 5 requires ` +
          `the named rule among the findings.\n    reported: ${rules.join(', ')}`,
      );
    });
  }
});

suite('L4 — the corpus covers the refusals, and FD-V14 has no case', (test) => {
  test('FD-V14 is declared absent and must not acquire a case', () => {
    ok(
      !invalidNames.some((n) => n.startsWith('FD-V14--')),
      'FD-V14 is deliberately absent (spec/flow-definition.md section 4). A case for it would mean ' +
        'the all-paths rule was re-added, which makes p1-routed-away.flow.json invalid input.',
    );
  });

  test('p1-routed-away is in the valid corpus', () => {
    ok(
      validNames.includes('p1-routed-away.flow.json'),
      "P1's own case must be an authorable, valid flow. If it is not here, the plan has no input.",
    );
  });
});
