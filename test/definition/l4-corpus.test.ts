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

const validNames = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json'));
const invalidNames = (await listDir(`${EX}/invalid`)).filter((n) => n.endsWith('.flow.json'));

const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;

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
