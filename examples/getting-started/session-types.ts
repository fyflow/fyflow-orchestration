/**
 * **GENERATED — do not edit by hand.** The TypeScript signatures of the authoring session's two
 * workers, emitted by `signaturesOf(SESSION_REGISTRY.workers)` from the schemas in
 * `session-registry.ts` — [W74](../../doc/work-items/w74-the-assists-and-the-exit-artifact.md),
 * [P19](../../doc/plans/p19-what-a-schema-buys-an-author.md) decision 9, `AGENTS.md` section 15.
 *
 * `test/definition/assist.test.ts` compares this file to the generator's output BOTH WAYS, so an
 * edit here or a schema change there is a red ladder rung rather than a drifting copy — which is
 * what a "recipe" in prose could not be. `npm run typecheck:examples` then compiles `reader.ts`
 * and `summarise.ts` against these, which is the sense in which the session's worker "typechecks".
 *
 * **What these types do NOT catch**: the constraints. `words` is `number` and its schema says
 * `minimum: 0`; `source` is `string` and nothing here stops it being empty. A type holds the
 * SHAPE — `npm run check:workers` runs the worker and `checkWiring` reads the bounds.
 */

/** Generated from the registry document's "Reader" worker entry, by `signatureOf`.
 *  Types catch the SHAPE and not the constraints: a number below a declared `minimum`, a
 *  string past a `maxLength` and a short array all typecheck. `npm run check:workers` and
 *  `checkWiring` are what see those. Do not edit by hand. */
export type ReaderSettings = unknown;
export type ReaderInput = {
  "source"?: string;
};
export type ReaderOutput = {
  "lines": (string)[];
  "source": string;
};
export interface ReaderEnvelope { settings: ReaderSettings; input: ReaderInput; }

/** Generated from the registry document's "Summarise" worker entry, by `signatureOf`.
 *  Types catch the SHAPE and not the constraints: a number below a declared `minimum`, a
 *  string past a `maxLength` and a short array all typecheck. `npm run check:workers` and
 *  `checkWiring` are what see those. Do not edit by hand. */
export type SummariseSettings = unknown;
export type SummariseInput = {
  "text": string;
};
export type SummariseOutput = {
  "words": number;
};
export interface SummariseEnvelope { settings: SummariseSettings; input: SummariseInput; }
