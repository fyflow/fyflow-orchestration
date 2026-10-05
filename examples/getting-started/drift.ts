/**
 * **A worker whose result its own `outputSchema` refuses, in the two ways that matter** —
 * [W82](../../doc/work-items/w82-a-result-its-own-schema-refuses-on-real-workers.md),
 * `AGENTS.md` section 16.
 *
 * It is the reference's twin of `examples/workers/gauge.ts` and `examples/workers/stamp.ts`, which
 * are the same two shapes as two separate corpus workers on a real L6 row. **The reference has its
 * own for `summarise.ts`'s reason one section along**: a section teaches the smallest shape that
 * carries the point, and the corpus proves it at a rung. Here that means ONE worker and ONE node,
 * where the row needs two so that each finding can have a control.
 *
 * **Neither defect is a mistake in this file.** Both are what an ordinary author writes:
 *
 *   - `load` is how full a batch is against a ten-word budget, so the schema says `maximum: 1`
 *     because a fraction of a budget is a fraction. The code divides and never clamps, which is
 *     right for every input the declared example reaches and wrong at eleven words. That is
 *     [Q302](../../doc/questions/q302.md)'s shape — *a bound a producer does not keep past its
 *     declared domain* — and `npm run check:workers` cannot see it, because one example confirms a
 *     schema at ONE value.
 *   - `label` is attached with `Object.defineProperty` so it stays out of the serialised payload.
 *     That is an ordinary thing to want, and it also keeps the key out of `structuredClone`, which
 *     copies a value's own **enumerable** string-keyed data and nothing else (`OR-R11`). So the
 *     value `run()` returns CONFORMS — `required` is `hasOwnProperty` — and the record `OR-R2`
 *     writes does not. **No authoring-time tool can see this one at all**, for a structural reason
 *     rather than an omission: none of them holds a record.
 *
 * Not an L6 row, for the reason `worker.ts` beside it gives.
 */
export default class Drift {
  run(envelope: { input: { text?: string } }): { words: number; load: number } {
    const words = (envelope.input.text ?? '').split(' ').filter((w) => w.length > 0);
    const out = { words: words.length, load: words.length / 10 };
    Object.defineProperty(out, 'label', { value: `w${words.length}`, enumerable: false, writable: true, configurable: true });
    return out;
  }
}
