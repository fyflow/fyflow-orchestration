# W60 — reserved, and expected unused

**Status:** reserved — not issued
**Plan:** [P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)

**This id is reserved by [P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)
and is expected never to be issued.** It exists so that a fourth item, if the plan needs one, has a
number nobody else has taken — `doc/workflow.md` section 3: *two items that each take "the next free
number" while running in parallel take the same one, and that is a rename across nine files.*

**On P9's, P11's, P12's, P13's, P14's and P15's precedent**: W27, W40, W44, W48, W52 and W56 were each
reserved this way and each closed without being issued. **A reserved id that is not spent is still not
free** — it is never reused and never renumbered, so if this item is not issued the next plan starts
at W61.

**If it IS issued**, it is because one of three things happened, and the plan says which in its
Record:

1. **[W57](w57-the-scheduler-is-a-dependency.md) found that the JSR package cannot declare the
   scheduler without moving the import map** out of `examples/deno-import-map.json` and into
   `deno.json`, which ADR 0029 rule 2 placed deliberately and `S8` refuses. That is a second decision
   about a second registry, ADR 0050's shape, and not a clause of ADR 0048.
2. **[W58](w58-what-a-node-says-about-its-own-task.md)'s global default turned out to need more
   than `defaultRetryPolicy`** — a driver-level default for `workerGroups` too, or a merge rule
   richer than *the node wins* — which is a small decision with its own evidence rather than a
   sentence in section 2.
3. **[W59](w59-what-a-node-type-is.md)'s measurement favoured per-variant pools over the envelope**
   ([Q250](../questions/q250.md)) — settings delivered as pool `config`, one pool per distinct
   settings value — in a direction that changes what P16 decision 2 decided.

**Nothing else justifies issuing it.** An item that is *more of W59* is W59; an item that is a
`transform`, a schema or a pre-flight check is the follow-on plan's, in P16's *Slices beyond this
plan*.
