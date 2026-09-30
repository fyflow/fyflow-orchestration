/**
 * **The PRODUCER of the authoring session in `AGENTS.md` section 20** —
 * [W101](../../doc/work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md), P25's exit
 * artifact. It takes a file name and says who owns it, which is the value a `quota` gate is keyed on.
 *
 * **What it says about itself is in `quota-registry.ts`'s `CLASSIFIED` schema, not here**, because that
 * is what `checkWiring` reads and what the session's test asserts against. Two things about it are
 * load-bearing and both are clauses of that schema: `owner` is OPTIONAL, which is what makes the
 * route's guarantee visible; and both objects are CLOSED, which is what makes a misspelled key path a
 * `no` naming the step it stopped on rather than a silence.
 *
 * **It hands on an owner whose `id` is EMPTY rather than stripping it**, so the gate's key path
 * RESOLVES to `''` and the gate TYPE is what decides that is not a key. That is the whole of ADR 0068
 * rule 3 from the outside: the library promises PRESENCE along the path and never says what the leaf
 * must be. *This read `owner && owner.id !== '' ? …` until W101's adequacy reader (F6) measured the
 * consequence — with the empty id stripped, the type's own `key === ''` arm was DEAD and this paragraph
 * described what did not happen, while the two roads to `nokey` were one.* A name in no map at all is
 * the other road, and the session asserts both.
 *
 * Not an L6 row, for the reason `worker.ts` beside it gives: the reference's snippets are run by
 * `check:docs` on a real `FyflowScheduler`, which is the rung this worker has.
 */

/** Who owns each file. A name the map does not carry is UNOWNED, and that is the second `nokey` road. */
const OWNERS: Readonly<Record<string, { id: string; name: string }>> = {
  'q1-eu.csv': { id: 'ada', name: 'Ada' },
  'q1-us.csv': { id: 'ada', name: 'Ada' },
  'q2-eu.csv': { id: 'ada', name: 'Ada' },          // ada's THIRD, so it goes over a quota of two
  'q1-apac.csv': { id: 'grace', name: 'Grace' },    // and grace's only one stays within it
  'scratch.tmp': { id: '', name: '' },              // an EMPTY id: the path RESOLVES and the type refuses
};

export default class Classify {
  run(envelope: { input: { file: string } }): { file: string; owner?: { id: string; name: string } } {
    const file = envelope.input.file;
    const owner = OWNERS[file];
    return owner ? { file, owner } : { file };
  }
}
