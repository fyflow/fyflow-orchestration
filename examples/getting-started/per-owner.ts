/**
 * **The consumer past the gate's key-resolved route** —
 * [W101](../../doc/work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md),
 * `AGENTS.md` section 20. It does the work that must happen at most `limit` times per owner.
 *
 * **Its `inputSchema` REQUIRES `owner`, and that is the session's whole point.** The producer beside it
 * declares `owner` OPTIONAL, so on an ordinary edge this arc is `no` — *consumer requires "owner",
 * producer does not guarantee it* — and it is `fits` only because the arc arrives by a route the gate's
 * type calls key-resolved, where `owner.id` resolved by construction
 * ([ADR 0068](../../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)).
 * *The guarantee is doing visible work, and the session shows it by removing the declaration and
 * reading the same arc again.*
 *
 * So this worker reads `input.owner.id` with no guard, which is the honest shape: a worker whose author
 * has been told the key is there. **What carries the claim is the PARAMETER TYPE** — `owner` declared
 * non-optional — and the wiring check is what makes it true. *(This said *the non-null assertion is the
 * claim*; W101's conformity reader (F7) measured `grep -c '!'` at ZERO. There is no assertion operator
 * in this file and there never was, and a type is a different mechanism from one.)*
 *
 * **Its RETURN is asserted by the session**, which reads `report`'s three results off the run rather
 * than taking the run's completion as evidence: W101's adequacy reader (F5) replaced this body with a
 * constant and, once `envelope` was renamed so `no-unused-vars` could not stand in, every rung was
 * green — so *the run completed* had stopped being evidence that the guarantee held at run time.
 */
export default class PerOwner {
  run(envelope: { input: { file: string; owner: { id: string; name: string } } }): { owner: string; file: string; did: string } {
    const owner = envelope.input.owner;
    return { owner: owner.id, file: envelope.input.file, did: `report for ${owner.name}` };
  }
}
