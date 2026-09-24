/**
 * **The ENTRY of section 17's flow: it turns one payload into a LIST** —
 * [W86](../../doc/work-items/w86-score-each-item-then-fan-out-per-item.md).
 *
 * One order per word of `region`, each carrying how many lines it has. The number of orders is in
 * no field of the flow document and in no constant in the snippet — it is a property of a value
 * this worker returned, which is what a `map` is for and what `FD-V9` makes impossible for a
 * `fanout`, whose branch entries have to be written down.
 *
 * It is NOT an L6 row: `examples/l6.ts` lists `examples/workers/` on disk and compares that listing
 * to the L6 registry both ways, so a module in this directory is outside that clause by
 * construction (`worker.ts`'s own note). What executes it is `npm run check:docs`, through section
 * 17's snippet.
 */
export default class Orders {
  run(envelope: { input: { region: string } }): { region: string; orders: { id: string; size: number }[] } {
    const region = envelope.input.region;
    return {
      region,
      orders: region.split(' ').filter((w) => w.length > 0).map((w) => ({ id: w, size: w.length })),
    };
  }
}
