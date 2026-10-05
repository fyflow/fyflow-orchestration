# W64 — reserved, and expected unused

**Status:** reserved — not issued
**Plan:** [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)

**This id is reserved by [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)
and is expected never to be issued.** It exists so that a fourth item, if the plan needs one, has a
number nobody else has taken — `doc/workflow.md` section 3: *two items that each take "the next free
number" while running in parallel take the same one, and that is a rename across nine files.*

**On P9's through P16's precedent**: W27, W40, W44, W48, W52, W56 and W60 were each reserved this
way and each closed without being issued. **A reserved id that is not spent is still not free** — it
is never reused and never renumbered, so if this item is not issued the next plan starts at W65.

**If it IS issued**, it is because one of three things happened, and the plan says which in its
Record:

1. **[W61](w61-what-a-transform-is.md) found that the envelope cannot carry the transform** —
   that the key must travel as pool config or a per-task field rather than inside `{ settings,
   input, transform }` — which changes P17 decision 4's shape and is a decision with its own
   evidence rather than a sentence in the spec's subsection.
2. **[W62](w62-the-jsonata-adapter.md)'s dependency decision needs more than ADR 0052** — the
   maintainer wants the second-specifier rule and the manifests' shape as an item of its own, with
   `check-source` clauses beyond what W62 declared.
3. **[W63](w63-a-transformed-join-on-real-workers.md) found that [Q263](../questions/q263.md)'s
   singleton rule needs an adapter-side normalisation** — the adapter wrapping every result in an
   array, or refusing a scalar where the input was a record — in a direction that changes what a
   transform RETURNS and therefore `FD-C6`.

**Nothing else justifies issuing it.** An item that is *more of W61* is W61; an item that is a
schema, a pre-flight check or strict mode is P18's or P19's, in P17's *Slices beyond this plan*.
