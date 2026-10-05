# W56 — reserved, and expected unused

**Status:** reserved — not issued
**Plan:** [P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md)

**This id is reserved by [P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md) and is
expected never to be issued.** It exists so that a fourth item, if the plan needs one, has a number
nobody else has taken — `doc/workflow.md` section 3: *two items that each take "the next free number"
while running in parallel take the same one, and that is a rename across nine files.*

**On P9's, P11's, P12's, P13's and P14's precedent**: W27, W40, W44, W48 and W52 were each reserved
this way and each closed without being issued. **A reserved id that is not spent is still not free** —
it is never reused and never renumbered, so if this item is not issued the next plan starts at W57.

**If it IS issued**, it is because one of three things happened, and the plan says which in its
Record:

1. **[W53](w53-what-a-run-retains-that-nothing-reads.md) found a bound that meets P15 decision 2** — a
   way for `fold()` to say it was handed less than the whole log that costs a field rather than a new
   `FoldInput` kind. That is prediction 2's stated reversal, and it is a separate decision from *what
   a run retains*.
2. **[W54](w54-what-a-result-may-be-and-what-bounding-it-would-cost.md)'s price came back low enough
   that the maintainer took the bound** on `RunState.nodes[*].result`. Taking it is explicitly not
   W54's call (P15 decision 1), so it would need an item.
3. **[W55](w55-a-run-at-scale-on-real-workers.md)'s real-worker measurement disagreed with the L2
   extrapolation** in a direction that changes what W53 decided.

**Nothing else justifies issuing it.** An item that is *more of W53* is W53; an item that is *the
follow-on* is [Q219](../questions/q219.md)'s and belongs to the next plan.
