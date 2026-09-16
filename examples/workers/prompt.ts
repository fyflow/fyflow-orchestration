/**
 * **The sample's model worker — P18's `prompt`, and ONE worker under TWO node types.**
 *
 * `Prompt` is a DOCUMENT-declared type and `GpuModel` is a CLASS registered in code, and both name
 * this worker. That is deliberate and it is what makes the exit artifact's second pair sharp: the
 * two types differ in nothing but their DERIVATION, so a clause comparing the pools they built is
 * comparing derivations rather than workers. It is also P18 fact 3 on the tree that ships — two
 * `WorkerManager`s over one worker URL are two pools.
 *
 * **The model is the TYPE's config and the prompt is the NODE's settings** — decision 3's three
 * levels, each observable in the return value:
 *
 *   - `model` is `config.model`, the constructor argument, checked against the worker entry's
 *     `configSchema` at `createRuntime` for every instance — `model: "small"` for `Prompt` and for
 *     `GpuModel`'s default, `"large"` for the named instance `prompt-big`, each beside the
 *     `delayMs: 5` every derived config here also carries and this class also reads
 *     (W67's conformity reader, finding 14);
 *   - `prompt` and `temperature` are `settings`, checked against the worker entry's
 *     `settingsSchema` at `new Driver` (`FD-V33`), with `temperature` defaulted by the `Prompt`
 *     TYPE's own `settings` and overridable by a node (decision 12);
 *   - `text` is the envelope's `input` — what this node RECEIVED (`FD-C5`), which on `report` is the
 *     result of a declared `transform` over the join's record (`FD-C6`, `JP-R12`).
 *
 * **`answer` is a function of the MODEL**, so which pool ran a task is legible from what the worker
 * RETURNED and not only from the scheduler: the small model keeps the first two words and the large
 * model keeps all of them. That is the discriminating pair's other observer — a row that read only
 * the pool's options would be one expression away from unfalsifiable (obligation (c)'s LIMIT).
 */
import { confidenceOf, type Envelope, FlowWorker } from './shared.ts';
import type { BaseWorkerContext, WorkerConfig } from 'fyflow-scheduler';

/** How many words of the text an answer keeps, per model — the whole of what a bigger model buys here. */
const DETAIL: Readonly<Record<string, number>> = { small: 2, large: Number.MAX_SAFE_INTEGER };

export default class PromptWorker extends FlowWorker {
  private readonly model: string;

  constructor(config: WorkerConfig = {}, workerContext?: BaseWorkerContext) {
    super(config, workerContext);
    const c = config as { model?: unknown };
    this.model = typeof c.model === 'string' ? c.model : 'small';
  }

  protected compute(envelope: Envelope): unknown {
    const settings = envelope.settings as { prompt?: unknown; temperature?: unknown };
    const input = (envelope.input ?? {}) as { text?: unknown };
    const words = (typeof input.text === 'string' ? input.text : '').split(' ').filter((w) => w.length > 0);
    const keep = DETAIL[this.model] ?? DETAIL.small!;
    return {
      model: this.model,
      prompt: typeof settings.prompt === 'string' ? settings.prompt : null,
      temperature: typeof settings.temperature === 'number' ? settings.temperature : null,
      // Echoed, so the next node in a chain of prompts still has the text this one answered about —
      // which is what lets the sample's `review` node, whose input is `classify`'s RESULT, be given
      // the LARGE model's job on the same text. Without it the model difference would be invisible
      // one hop down, and the discriminating pair would rest on the pool observers alone.
      text: typeof input.text === 'string' ? input.text : '',
      answer: words.slice(0, keep).join(' '),
      words: words.length,
      // Carried, because the sample's decision edge reads `confidence` off this node's result.
      confidence: confidenceOf(envelope.input),
    };
  }
}
