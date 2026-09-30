/**
 * **The consumer on the two routes the session does NOT guard** —
 * [W101](../../doc/work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md),
 * `AGENTS.md` section 20. Both the over-quota road and the no-key road end here.
 *
 * **One consumer on two arcs is what makes the refusal legible as the ROUTE's rather than the node's.**
 * With the gate's key path misspelled this node has TWO verdicts at once: `no` on the arc arriving by
 * `over`, which the type calls key-resolved, and `fits` on the arc arriving by `nokey`, which it does
 * not. Same consumer, same producer, same schema — the route is the only thing that differs, which is
 * [ADR 0068](../../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)
 * rule 1 read from the outside.
 *
 * Its `inputSchema` therefore accepts ANY object: the only thing that can make an arc into it `no` is
 * the key path, which is what the session is about. (W100's suite uses the same device for the same
 * reason, and says so.)
 */
export default class Skipped {
  run(envelope: { input: { file: string } }): { skipped: string } {
    return { skipped: envelope.input.file };
  }
}
