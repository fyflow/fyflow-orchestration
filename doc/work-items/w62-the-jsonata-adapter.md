# W62 — The JSONata adapter

**Status:** todo
**Plan:** [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)

```
Spec:       spec/runtime-targets.md section 4 — what the published source may depend
            on, and by which specifier (RT-R11's shape for a SECOND dependency
            reached from ONE sub-path); spec/flow-definition.md's transform
            subsection for the adapter's obligations (W61's, cited not edited)
Owns:       src/jsonata/** (new), package.json, deno.json, test/jsonata/** (new),
            spec/runtime-targets.md section 4, AGENTS.md one new section,
            doc/decisions/0052-*.md
Inputs:     P17 decisions 2, 3, 6, 7 and 10, read from the PLAN's own file; facts
            2, 3, 4, 5, 6 and 9 re-run from dev-dist/p17/facts.mjs with
            JSONATA_URL set; W61's LanguageAdapter interface and its conformance
            suite; ADR 0048 and RT-R11 for how the first dependency is declared;
            W57's adequacy finding that fields ADJACENT to the one a check reads
            (`peerDependenciesMeta`) are where a hole lives; Q252 — a green
            `deno publish --dry-run` was the wrong answer once.
Outputs:    (1) ADR 0052 — how a second bare dependency is declared when only one
                sub-path reaches it, with `dependencies`, an optional peer and
                `optionalDependencies` each priced on a scratch copy by
                `npm pack` and `deno publish --dry-run`, and the maintainer's
                choice; OR the clause folded into ADR 0051 and 0052 skipped,
                the plan saying which
            (2) `fyflow-orchestration/jsonata` in both manifests' export maps and
                deno.json's publish allowlist (S6), exporting `jsonata:
                LanguageAdapter` whose `worker` is its own import.meta.url
            (3) the adapter: compile synchronous and throwing with jsonata's
                own code, position and message; `$now`, `$millis` and `$random`
                shadowed on EVERY compile with a thrower naming the function;
                `$` bound to the input and `$settings` to the settings; `check`
                absent (P18's hook, declared optional)
            (4) the conformance suite passed by the JSONata adapter, and the
                probe for prediction 4: every built-in in the language's function
                table evaluated twice on one input, none but the three differing
            (5) the cost of fact 6 RE-TAKEN inside the wrapper, inline and
                THREADED, quoted as shape and ratio against the envelope's own
                clone (W54's rule)
            (6) the browser bundle carrying jsonata (fact 9: 242 190 bytes), the
                adapter suite green in chromium, firefox and webkit
            (7) spec/runtime-targets.md: the rule for a second specifier — which
                files may import it, which may not, and what S7/S8 or a new
                clause refuse
            (8) AGENTS.md: a new section — the adapter, a `run` snippet
                validating a transformed flow, a `check` snippet wiring the
                sub-path, and the three unbound names with the reason
Depends on: W61
Blocks:     W63
Tests:      expected values from spec/ and from jsonata's documented semantics,
            never from output. Negative controls: remove one shadow and the
            conformance suite's by-name assertion for it fails while the
            two-evaluation comparison MAY still pass (fact 3's flaky $millis —
            asserted as a pair, so the suite says which check caught it); make
            compile swallow the syntax error and FD-V36's fixture stops firing;
            point `worker` at a different module and Q264's assertion fails.
Gate:       L0 under all five typechecks with jsonata.d.ts in; L1-L5 in five
            runtimes; check:source (S6, and whatever refuses a second bare
            specifier after output 7); check:scheduler (D8 unmoved — the pin is
            the scheduler's); check:docs on the new section; then
            spec-conformity pass (two readers), rule 8 re-run with their edits
Reserves:   Q270-Q273, ADR 0052
```

## Scope

**In**

1. **The dependency decision**, priced before the maintainer chooses — never installed into this
   repository until it is chosen. The three shapes and what each costs a consumer who imports only
   the root, only the scheduler sub-path, or the jsonata sub-path.
2. **The adapter**, the three shadows, the bindings, and the conformance suite W61 wrote passing on
   it unchanged — if the suite has to change for JSONata, the interface was wrong and W61's Record
   is corrected under section 6 pass 3 rule 6.
3. **The reach prediction's probe**: the function table walked, not the documentation read.
4. **The cost across the thread.** Fact 6 was one process and no thread; a threaded pool clones the
   envelope in and the result out, and the number an author is quoted must include that.

**Out** — named rather than left implicit, with where each goes instead

- **A second language** — the interface's, not this item's; CEL refused by the maintainer.
- **Unbinding `$eval`** — decided here at the stop-and-ask ([Q265](../open-questions.md)), and if
  refused, recorded with what a consumer would have lost.
- **The exit artifact** — W63's.
- **P18's `check` hook** — declared optional, absent here.

## Exceptions

| path | why |
|---|---|
| `scripts/check-source.mjs`, `scripts/check-source-selftest.mjs` | predicted: output 7 needs a clause — `S7` refuses only the scheduler's names, so a `jsonata` import from `src/definition/**` would pass today; whichever clause refuses it outside `src/jsonata/**` gets a probe and a `META` entry |
| `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | predicted from W59's table: the extractor rewrites the root and the scheduler specifiers; the jsonata sub-path needs a third rewrite, with a probe; `RUN_FLOOR` rises for the section's `run` snippet |
| `scripts/build-browser-tests.mjs` | only if the bundle needs a resolve hint for a CJS module — fact 9 says it does not |
| `scripts/check-markdown.mjs` | predicted NOT to fire; checked |

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` — all five configurations, read by `$?`; `jsonata.d.ts` under `deno check` is the one fact 9 did not measure |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, redirected, read by exit code; baseline W61's shipped numbers, re-taken |
| checks | `npm run check:source`, `npm run check:scheduler`, `npm run check:docs` |
| cost | the wrapper harness, inline and threaded, medians over N runs with the method stated |
| readers | conformity: spec first — `spec/runtime-targets.md`'s new rule and the transform subsection's adapter obligations re-derived; adequacy: isolated copy, the shadows and the bindings mutated |

## Record

*Filled in when the item is done.*
