---
id: ADR 0137
title: "A key path indexes an array by a bracket suffix, and a plain segment keeps its meaning"
status: accepted
date: "2026-10-25"
item: W216
raised-by: P44
supersedes: ""
amends: ADR 0068 rule 2
resolves: ""
---

# ADR 0137 — A key path indexes an array by a bracket suffix, and a plain segment keeps its meaning

**Status:** accepted 2026-10-25 — [W216](../work-items/w216-a-bracket-array-index-in-a-key-path.md) under
[P44](../plans/p44-what-a-join-hands-on-and-how-a-key-path-reaches-into-it.md), decision 3, the maintainer's (c1)
answering fyflow-app's pass 5 #2. **Amends**
[ADR 0068](0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md) rule 2 — the
refinement it derives along a key path gains an INDEX step — and nothing else in it. `spec/flow-definition.md` v0.53.

## Context

1. **A key path could not reach an array element.** Since P24 stop-and-ask (d) a key path was dot-separated OBJECT
   keys — `KEY_PATH_RE` `^[A-Za-z0-9_-]{1,64}(\.[A-Za-z0-9_-]{1,64})*$` — and `readKeyPath` answered `undefined` for an
   array mid-path. fyflow-app's pass 5 #2: an `if` on `input.1.xs.1 eq 2` over `{"1":{"xs":[1,2]}}` took `else`, so a
   person routing on the second element of a list put a Transform before the gate.
2. **The app offered two spellings and the maintainer chose one** — (c1): a bracket `xs[1]`, not a numeric segment
   `xs.1` indexing (c2), because under (c2) `xs.1` reads differently over an object and an array, so a path's meaning
   would depend on the value; and no quoted key `["0.1"]` (c3), because after P44 (a1) no key fyflow mints holds a dot.
3. **Every reader of a key path reads it through one function** (P44 fact 6): `readKeyPath`, for the driver's gate key
   (`distinct`, `switch`, a consumer's type), a task's and a join's edge `when.path`, and an `if` gate's — and the wiring
   check walks the same path in `requireAlong` and `keyPathRefusal`. **No valid corpus or example flow held `[`**
   (W216's re-take over `spec/examples/**` and `examples/flows`: the `FD-V40` invalid case alone did), so no flow that validates today reads one.
4. **The schema subset has `items` and `minItems` and NOT `prefixItems` or `maxItems`** (`src/definition/schema.ts`,
   ADR 0053): a producer's schema can say an element's shape and a floor on its array's length, and nothing about ONE
   position or a ceiling.

## Decision

1. **The grammar.** A key path is dot-separated SEGMENTS; a segment is a key in `FD-V16`'s charset,
   `[A-Za-z0-9_-]{1,64}`, followed by **zero or more** bracket indexes `[n]`:
   `^SEG(?:\.SEG)*$`, `SEG` = `[A-Za-z0-9_-]{1,64}(?:\[(?:0|[1-9][0-9]{0,8})\])*`.

   | choice | decided | why |
   |---|---|---|
   | leading zeros | **refused** — `n` is `0` or starts `[1-9]` (`[01]`, `[00]` refused) | one spelling per index, so two paths naming one element are one string |
   | multiple brackets | **allowed** — `m[0][2]`, an array of arrays | the suffix is a repetition; refusing a second bracket buys nothing |
   | an index on the root | **refused** — the first step is always a KEY: a gate's key cannot START with `[`, and a `when.path`'s root may not carry one (`outcome[0]`, `input[0]`, rule 3) | a gate's key names a key inside the value that reached it, so an `if`'s `input[0]` would say what no gate key can; `outcome` and `needs` are objects, so their index is always nothing |
   | the maximum | **999,999,999** — at most nine digits | every accepted index is a valid JavaScript array index (`< 2^32 - 1`), the bound is a digit count a `pattern` can state, and no run holds an array that long |
   | not admitted | an empty `[]`, a sign, a wildcard `[*]`, a quoted key, a space, a fraction, a bracket after a dot (`xs.[0]`), text after a bracket (`xs[0]x`) | P44's Out; a wildcard and an expression stay a Transform's |

   **`KEY_PATH_RE`'s `source` is package surface and moves** (P44 decision 7). Every string the v0.52 expression
   matched it still matches, so **the change only accepts more**.
2. **The resolution.** `readKeyPath` walks the path's STEPS — a key, or an index — over the value:
   - a KEY step is an OWN key of a PLAIN object, **unchanged** — so **a plain numeric segment keeps its meaning**: `xs.1`
     reads an own key `"1"` and is `undefined` over an array;
   - an INDEX step `[n]` is element `n` of a **REAL array** (`Array.isArray`, `n < length`) and of nothing else: a plain
     object holding `"n"`, an array-like object, a typed array, a string and `null` are `undefined`, and so is an index
     past the end.

   **Every path that validated at v0.52 resolves exactly as before** — none held `[`, and a segment with no bracket is one
   key step. **A SEGMENT the grammar does not spell** — its key outside `FD-V16`'s charset or longer than 64, or its brackets
   malformed (`a[01]`, `[0]`, `a b[0]`, `xs[1000000000]`) — is read as ONE literal key, as every segment was, so an
   unvalidated caller of the public `readKeyPath` sees no change on any segment the grammar refuses. *(A path refused only
   for how its segments are JOINED — `.xs[0]`, `a..b[0]` — still has well-formed segments, and they are indexed; no
   validated path is either.)* And an index reads an OWN element: a hole in a sparse array is nothing, never what the
   array's prototype answers.
3. **`FD-V43`'s root is read up to the first `.` or `[`**, and **an index ON the root is refused** under `FD-V43` (on an
   `if` gate, reported as `FD-V40`, P32 decision 7), naming the fix — a key first, then the index.
4. **ADR 0068's refinement along an index — within the subset.**
   - **The guarantee** (`requireAlong`): a key step adds `required`, as W99 did; an index step `[n]` raises the array's
     `minItems` to `n + 1`, **never lowering** a larger one — W99's `required`, one keyword over — **and the refinement
     STOPS there.** What the path names past an index is a property of ONE element, and `items` speaks for EVERY element,
     so a `required` pushed into `items` would promise of `xs[0]` what the route learned of `xs[1]`. Saying it needs
     `prefixItems`, which the subset does not have: **a silence, not a guess** (ADR 0068 consequence 5).
   - **The refusal** (`keyPathRefusal`): an index step is refused where the schema's declared types cannot include
     `array`; where it may be an array the walk steps INTO `items`, so the next step is asked of every element — a
     producer forbids `xs[0].id` where its `items` cannot carry `id` (not an object, or closed without it); an array
     with no `items` is open and silent. **An index past the end is never refused**: the subset has no `maxItems`.
   - **No keyword outside the subset is needed** for what is derived; what would need one is not derived, and is stated.
5. **`definitionSchema()` follows**: the gate key's `pattern` is `KEY_PATH_RE.source` (as before), and a comparison
   path's is `^(?:outcome|needs)(?:\.SEG)+$`, built from the same `SEG`, which is asserted against `KEY_PATH_RE`'s source
   when the schema is built.

## Consequences

1. **A CHANGE IN WHAT IS ACCEPTED, only more** — `validateDefinition` accepts a document with a bracket index it refused
   at v0.52; nothing it accepted is refused. It ships in 0.12.0 with P44's BREAKING changes ((e1)).
2. **The `FD-V40` corpus case moved**: `FD-V40--gate-key-path-with-an-index.flow.json` (`files[0].series`) is now a key
   path, so it is re-cut to `files[*].series` — a wildcard, still refused — and renamed
   `FD-V40--gate-key-path-with-a-wildcard.flow.json`. W210's schema suite carries it as before, its repair now
   `files[0].series`.
3. **`xs.1` and `xs[1]` are two paths** over one value, and a flow author reads which one they wrote: an object keyed
   `"1"` answers the first, an array the second. That is (c1)'s point, and the reason (c2) was declined.
4. **What is NOT bought**: a negative index or one from the end, a slice, a wildcard, a quoted key, a per-position
   guarantee past an index, a refusal of an index past an array's length. Each would be its own decision.
