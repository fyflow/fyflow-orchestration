# W139 — `gate:item`: an item's confirming gate is `gate:full` less the register lane

**Status:** in progress — declared on `ac84c1e`, before any file under `Owns` was edited.
**Plan:** none — an item outside any plan, on W98's precedent. Its source is P30's Retro section 10,
*the maintainer's answer, 2026-10-07: proposal A*, which names this mechanism and the five files it
owns; `doc/workflow.md` v0.29 says the rule is *in force when the `gate:item` mechanism lands*. It
takes the next id, so the next free work item after it is W140; the Record states the ledger
sentence once the reserved Q block is settled.

*Every id in this file is bare text and the file carries no relative link — Q142's `M4`, as the brief
asks.*

**Question:** *what runs the self-tests less exactly one lane, in a form the gate's own checks can
see, so that v0.29's item gate exists?*

```
Spec:       none - doc/workflow.md section 4, v0.29 (an item's confirming gate is gate:full LESS
            check:register:selftest; the plan's last item runs the whole gate:full; an item editing
            scripts/check-register*.mjs, scripts/state.mjs or doc/questions/README.md runs that lane
            too), and P30's Retro section 10. NO ADR is predicted: ADR 0070 rule 4 (nothing deleted,
            every lane still runs) holds, once per plan, which section 10 states.
Owns:       package.json (a gate:item entry, and nothing else in it)
            scripts/run-selftests.mjs (the leave-one-out option)
            scripts/check-wiring.mjs and scripts/check-wiring-selftest.mjs (the binding)
            CLAUDE.md ("How work is done": the ITEM'S CONFIRMING GATE lines)
            doc/workflow.md (section 4's v0.29 paragraph)
            this file
Inputs:     P30's Retro sections 1, 3 and 10 (777.2 s without the lane; ~915 s estimated with the
            ladder's ~138 s, against 41 min); doc/workflow.md v0.29 and section 5 rules 7 and 8;
            scripts/run-selftests.mjs and check-wiring.mjs G4/G5 as they stand at ac84c1e.
Outputs:    (1) `node scripts/run-selftests.mjs --without <entry>`, repeatable: refuses a missing
                value, an entry that is not one of the manifest's `:selftest` entries, a duplicate,
                any argument it does not know, and a set that leaves nothing to run; `--plan` prints
                each left-out entry and the count; the run's accounting compares planned plus
                left-out to the manifest BOTH WAYS
            (2) package.json `gate:item`: `npm run gate && node scripts/run-selftests.mjs --without
                check:register:selftest`
            (3) check-wiring `G7`: `gate:item` exists; is exactly two `&&` parts, `npm run gate` then
                the runner followed only by `--without <entry>` pairs; the set it names equals a
                declared ITEM_LEAVES_OUT both ways; and the runner, run with that argv plus `--plan`,
                plans exactly the manifest's entries less that set and reports exactly that set left
                out. `G5`'s declarations follow the runner's. Provoked at birth in
                check-wiring-selftest.mjs, checked in (section 5 rule 7 (a)-(c))
            (4) CLAUDE.md and doc/workflow.md name `gate:item`; v0.29's "until then" sentence deleted
            (5) gate:item measured for real, wall against the retro's ~915 s and 41 min
Depends on: nothing
Blocks:     nothing - every later item's confirming gate uses it
Tests:      the runner's refusals and `G7` each provoked by a checked-in probe declaring its exact
            set of tripped checks; rule 8 on every output in dev-dist/w139-1638/ with a no-op control,
            a CRASH grader and a WRONG-REASON grader; expected values from v0.29 (the set left out is
            exactly {check:register:selftest}) and never from the runner's output.
Gate:       L0 untouched (scripts/ is not linted - check-wiring's G6 header); check:wiring and
            check:wiring:selftest alone (the owned lane, rule 7); check:budget; then
            `npm run gate:item` measured; then the WHOLE `npm run gate:full` once on a still tree,
            because this item builds the mechanism (the brief), with a content digest at both ends.
Reserves:   Q548-Q552; ADR 0087 only if a stop-and-ask answer needs one
```

## Exceptions, declared before their first edit

| file | why | predicted |
|---|---|---|
| `doc/glossary.md` | its *confirming gate* row says `npm run gate:full, not npm run gate`, and that is the sentence this item makes false | NEEDED |
| `doc/plans/p30-which-open-questions-close-by-a-fix-already-named.md` | one dated Retro line: the mechanism landed at W139. A finished plan is on nobody's `Owns` and W139 is not that plan's item, so it is declared rather than taken as record step | NEEDED |
| `scripts/check-source.mjs` | `S11`/`S13` read the manifest; `S13`'s loop is over `GATE_CHAIN`, which `gate:item` is not in, so nothing forces a `COMPOSED` row | UNNEEDED |
| `scripts/check-markdown.mjs` | `M3`/`M4` floors move with a new `.md`; this file carries no relative link | UNNEEDED |
| `.github/workflows/gate.yml`, `AGENTS.md`, `README.md`, `doc/work-items/TEMPLATE.md` | CI runs `gate:full`, which is unchanged; none of the other three names an item's confirming gate (grep at declaration) | UNNEEDED |

## What the declaration step measured before anything was edited

*On `ac84c1e`, node 24.20.0, in `dev-dist/w139-1638/`.*

| # | measured | result |
|---|---|---|
| 1 | how the runner selects lanes | **derived, not listed**: every manifest entry ending `:selftest`, sorted; exclusivity from the `SELFTEST-EXCLUSIVE:` marker in the self-test file. Overrides: `CHECK_SELFTESTS_PKG`, `_SCRIPTS`, `_CMD`. The only argument read is `--plan`; **`--plan --without x` exits 0** — every other argument is ignored silently. `--plan` names 11 entries, 1 exclusive |
| 2 | what check-wiring holds about the manifest | `G3`: each check's two entries exist and are reached from `gate:full`'s chain, one level deep. `G4`: exactly one chain entry is `node scripts/run-selftests.mjs`, verbatim; its `--plan` equals the manifest both ways, per-entry command included; the exclusive set; a passing-stub and a failing-stub run. `G5`: nine runner declarations pinned line for line. **Nothing reads any entry but `gate`, `gate:full` and the runner's** |
| 3 | `gate:full`'s composition | `npm run gate && npm run selftests`, bound by name in `check-source.mjs` `S13` (`COMPOSED`); `gate` is 17 entries bound by `S12` (`GATE_CHAIN`) |
| 4 | `check:wiring` alone | EXIT 0, 1.2 s wall |
