# W68 — reserved, and expected unused

**Status:** reserved — not issued
**Plan:** [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)

**This id is reserved by [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)
and is expected never to be issued.** It exists so that a fourth item, if the plan needs one, has a
number nobody else has taken — `doc/workflow.md` section 3: *two items that each take "the next free
number" while running in parallel take the same one, and that is a rename across nine files.*

**On P9's through P17's precedent**: W27, W40, W44, W48, W52, W56, W60 and W64 were each reserved
this way and each closed without being issued. **A reserved id that is not spent is still not
free** — it is never reused and never renumbered, so if this item is not issued the next plan starts
at W69.

**If it IS issued**, it is because one of three things happened, and the plan says which in its
Record:

1. **[W65](w65-the-registry-document-and-a-node-type-is-a-derivation.md) reversed prediction 4** —
   a schema the corpus or the sample needs is outside the built-in subset, so ADR 0053 declares
   `@cfworker/json-schema` the way ADR 0052 declared `jsonata`, and the declaration of a THIRD
   dependency, its manifests, its `check:source` clauses and its browser cost is an item of its own
   rather than a clause in W65.
2. **[W66](w66-the-runtime-entry.md) found the runtime cannot be ONE sub-path** — the validator and
   the scheduler objects cannot share an entry without the root or the scheduler sub-path loading
   one of them, so the placement is a decision with its own evidence (ADR 0055) and its own item.
3. **[W67](w67-a-flow-from-documents-on-real-workers.md) found the corpus migration needs BOTH
   roads** — the workers rewritten to read `input` AND the rows' expectations moved — at a size that
   is an item rather than a stop-and-ask answer inside W67 (fact 4: 146 nodes, eleven roles).

**Nothing else justifies issuing it.** An item that is *more of W66* is W66; an item that enforces
a schema at run time is P19's, in P18's *Slices beyond this plan*.
