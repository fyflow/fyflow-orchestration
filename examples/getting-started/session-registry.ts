/**
 * **The registry the authoring session is handed** — [W74](../../doc/work-items/w74-the-assists-and-the-exit-artifact.md),
 * `AGENTS.md` section 15. Two workers whose schemas OPPOSE, which is the whole setup: `reader`
 * returns a batch of `lines`, `summarise` requires a single `text`, and both objects are CLOSED, so
 * the wiring check can say what a consumer will and will not receive.
 *
 * **It is a module rather than a JSON file for one reason**: it is the ONE source the generated
 * signatures (`session-types.ts`) and the reference's snippet both read, and
 * `test/definition/assist.test.ts` compares `signaturesOf(SESSION_WORKERS)` to that file BOTH WAYS
 * — the same object the document below carries, named directly because `RegistryDocument.workers`
 * is optional. A registry a consumer writes is JSON; this one is imported by a snippet and by a test
 * in the same tree, and a copy kept in step by a person is what `X8` exists to refuse.
 *
 * `SESSION_BASE` is what relative worker urls resolve against — `import.meta.url` of this file, so
 * `./reader.ts` means the module beside it wherever the caller sits.
 */
import type { RegistryDocument, WorkerSchemas } from '../../index.ts';

/** What relative worker urls in the document below resolve against. */
export const SESSION_BASE: string = import.meta.url;

/**
 * **The two workers, exported on their own** — because `RegistryDocument.workers` is OPTIONAL and a
 * caller reading `SESSION_REGISTRY.workers!.reader!` to hand a schema to an assist is reading two
 * non-null assertions for a document that always has both. The document below uses this same object,
 * so there is one declaration and no copy.
 */
export const SESSION_WORKERS = {
  reader: {
    url: './reader.ts',
    // What it RETURNS. Closed, so the wiring check knows there is no `text` here — which is the
    // miswire the session opens with. The example is what every authoring-time tool runs on
    // (ADR 0056 rule 3), so it is a real batch rather than the generator's witness `{}`.
    inputSchema: {
      type: 'object',
      properties: { source: { type: 'string' } },
      additionalProperties: false,
      examples: [{ source: 'inbox' }],
    },
    outputSchema: {
      type: 'object',
      required: ['lines', 'source'],
      properties: { lines: { type: 'array', items: { type: 'string' } }, source: { type: 'string' } },
      additionalProperties: false,
      examples: [{ lines: ['alpha', 'beta', 'gamma'], source: 'inbox' }],
    },
  },
  summarise: {
    url: './summarise.ts',
    // What it NEEDS. `text` is REQUIRED and is a string: `lines` is neither, and no amount of
    // reading the two workers' code says so as quickly as these six lines do.
    inputSchema: {
      type: 'object',
      required: ['text'],
      properties: { text: { type: 'string' } },
      additionalProperties: false,
      examples: [{ text: 'alpha beta gamma' }],
    },
    outputSchema: {
      type: 'object',
      required: ['words'],
      properties: { words: { type: 'integer', minimum: 0 } },
      additionalProperties: false,
      examples: [{ words: 3 }],
    },
  },
} satisfies Record<string, WorkerSchemas & { url: string }>;

export const SESSION_REGISTRY: RegistryDocument = {
  workers: SESSION_WORKERS,
  nodeTypes: {
    Reader: { worker: 'reader', inline: true },
    Summarise: { worker: 'summarise', inline: true },
  },
  languages: ['jsonata'],
};
