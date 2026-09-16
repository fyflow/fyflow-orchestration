/**
 * **The corpus's registry, as a `Registry`** — `spec/examples/registry.json` is a registry DOCUMENT
 * since v0.19 (W65, ADR 0054): its `workers`, `nodeTypes` and `pools` are the document form the
 * validator reads directly, its `groups` are group INSTANCES whose keys are the group ids a node may
 * name, and its `predicates` and `languages` are NAMES. Ladder L4 validates every corpus flow against
 * the registry this file derives from it, and `test/definition/l4-corpus.test.ts` compares the
 * document's `languages` to `CORPUS_LANGUAGES` both ways, so a language named in one and not the
 * other fails naming itself.
 *
 * **The languages are the one thing the document cannot carry**: an adapter's registry half is a
 * function (ADR 0051 rule 2), so `registry.json` names `path` and this file resolves it to the fake
 * language's adapter, whose worker half is a `data:` URL the validator never loads. *(Until v0.19 a
 * node type's settings VALIDATOR was a function too and lived here as `CORPUS_NODE_TYPES`; the
 * settings language is the worker's `settingsSchema` now, ADR 0053, and the types are in the
 * document.)*
 */
import type { LanguageAdapter, Registry, RegistryDocument } from '../../src/definition/types.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';

export const CORPUS_LANGUAGES: Readonly<Record<string, LanguageAdapter>> = {
  path: PATH_LANGUAGE,
};

/** The document as `registry.json` writes it — every section present, so a suite reading one need not guard. */
export type CorpusRegistryDocument = Required<RegistryDocument>;

/** A registry DOCUMENT turned into the `Registry` the validator and the driver take, with the corpus's languages resolved. */
export function corpusRegistry(doc: RegistryDocument, languages: Readonly<Record<string, LanguageAdapter>> = CORPUS_LANGUAGES): Registry {
  return {
    predicates: new Set(doc.predicates ?? []),
    groups: new Set(Object.keys(doc.groups ?? {})),
    workers: doc.workers ?? {},
    nodeTypes: doc.nodeTypes ?? {},
    pools: doc.pools ?? {},
    languages,
  };
}
