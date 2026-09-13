/**
 * **The corpus's node TYPES, as functions** — `spec/examples/registry.json` names them and this
 * file is where the names resolve, exactly as the corpus's predicate names resolve in whichever
 * suite runs them: a validator is a registered function (ADR 0002 rule 3, ADR 0049 rule 2), and a
 * JSON registry cannot carry one. Ladder L4 validates every corpus flow against this map, and
 * `test/definition/l4-corpus.test.ts` compares its keys to `registry.json`'s `nodeTypes` BOTH WAYS,
 * so a type named in one and not the other fails naming itself.
 *
 * `worker` is a placeholder URL: the spec corpus is validated and never RUN (section 7), and the
 * validator reads no field of a type but `settings`. What a real type looks like on real workers
 * is `examples/run-flow.ts`'s `NODE_TYPES`.
 *
 * **And the corpus's LANGUAGES, the same way** — v0.18 (W61, ADR 0051). `registry.json` names
 * `path` under `languages` and this file resolves it to the fake language's adapter, whose
 * registry half is a function (`compile`) and whose worker half is a `data:` URL the validator
 * never loads. Compared to `registry.json`'s `languages` both ways in the same suite.
 */
import type { LanguageAdapter, NodeType } from '../../src/definition/types.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';

export const CORPUS_NODE_TYPES: Readonly<Record<string, NodeType>> = {
  Scorer: {
    worker: 'corpus://Scorer',
    // `factor`, when present, is a positive finite number; no other key. Absent settings — the
    // effective `{}` — are ACCEPTED, which is what `typed.flow.json`'s entry node shows; a typo'd
    // key and a string factor are the two refusals `FD-V33`'s case and the L1 suite exercise.
    settings: (s) => {
      for (const k of Object.keys(s)) if (k !== 'factor') return `settings carries undeclared key "${k}"; Scorer declares "factor"`;
      if (s.factor !== undefined && !(typeof s.factor === 'number' && Number.isFinite(s.factor) && s.factor > 0)) {
        return `settings.factor must be a positive finite number, got ${JSON.stringify(s.factor)}`;
      }
      return null;
    },
  },
};

export const CORPUS_LANGUAGES: Readonly<Record<string, LanguageAdapter>> = {
  path: PATH_LANGUAGE,
};
