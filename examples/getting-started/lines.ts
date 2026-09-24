/**
 * **The node BETWEEN the two maps, and the reason section 17's flow needs one** —
 * [W86](../../doc/work-items/w86-score-each-item-then-fan-out-per-item.md).
 *
 * A `map`'s `over` names a key of what the PREVIOUS node returned, and a `map`'s branch is a TASK
 * (`FD-V25` refuses a map whose branch is a map). So *fan out per item* needs one node whose input
 * is the outer item and whose output carries that item's own list — this is it, and it is the whole
 * of what sits between the two regions.
 *
 * **Each order gets a DIFFERENT number of lines**, from its own `size`. That is what makes the two
 * instances of the inner region differ in width, and therefore what makes them tell apart a driver
 * that keys a region by its opener alone from one that keys it by the opener AND the opener's own
 * branch path
 * ([ADR 0062](../../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)).
 *
 * Not an L6 row, for the reason `orders.ts` beside it gives.
 */
export default class Lines {
  run(envelope: { input: { id: string; size: number } }): { id: string; lines: { sku: string }[] } {
    const { id, size } = envelope.input;
    return { id, lines: Array.from({ length: size }, (_, i) => ({ sku: `${id}-${i}` })) };
  }
}
