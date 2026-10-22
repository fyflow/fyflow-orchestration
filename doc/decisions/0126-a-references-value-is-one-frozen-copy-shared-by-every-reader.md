---
id: ADR 0126
title: "A reference's value is one frozen copy shared by every reader"
status: accepted
date: "2026-10-22"
item: W202
raised-by: P41, Q186
supersedes: ADR 0040 rule 6 in part; ADR 0117 rule 4 in part
amends: ""
resolves: Q186
---

# ADR 0126 — A reference's value is one frozen copy shared by every reader

**Status:** accepted — [P41](../plans/p41-what-a-reference-to-a-large-value-costs-inside-a-map.md) decisions 1-8 and
stop-and-asks (a)-(g), answered by the maintainer 2026-10-22 — (a)-(e) as recommended, (f) as (f2), (g) as (g1); written
by [W202](../work-items/w202-one-shared-copy-per-output-read.md). It defines `spec/flow-definition.md` v0.47 (section 3:
what a reference hands a reader, what it costs, and the named gap; `FD-C1`, `FD-C3`), `spec/run-state.md` v0.33
(`RN-R13`'s new term) and `spec/join-policy.md` v0.24 (`JP-R11`'s headline scoped). **It supersedes IN PART
[ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 6 and [ADR 0117](0117-a-reference-may-name-what-reached-the-run.md) rule 4** — their *each key its own copy*, for a
NODE reference and for `"$payload"`; `"."` and `"$item"` keep it as written. It reverses
[P38](../plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) (l)'s refusal by name, and resolves
[Q186](../questions/q186.md) by removing the cost that question decided nothing should warn about.

## Context

[Q186](../questions/q186.md), deferred since W46 as *nothing warns*: a `needs` reference read inside a `map` instance to a
node OUTSIDE it cloned that node's whole result once per instance per key — ADR 0040 rule 6's per-key copy, which is
`JP-R11`'s *no two nodes ever receive the same object* applied to a reference. A map enters every instance in one step, so
every copy is live at once (P41 fact 3) and the peak is N × the referenced value. Re-taken at W202's declaration on
`88059b7`, the driver alone on a scheduler double, fyflow-app's fetch-then-map shape (`fetch`'s result ~100 KB holding the
items; the branch `needs: { item: "$item", all: "fetch" }`), each size a fresh process: **529 / 1,993 / 15,475 ms and
178 / 468 / 1,448 MB** peak heap over baseline at 1,000 / 2,000 / 4,000 items in node 24.20.0; 1,442 / 2,068 / 16,598 ms
in deno 2.9.6. fyflow-app measured 1.6 s / 160 MB and 18.0 s / 800 MB at 1,000 / 4,000 on its Host, and cannot guard it:
its editor offers every upstream node, and nothing before a run says how large a result is. Q186's own row named what
would force it — *an author reporting a flow whose cost surprised them* — and that is this request.

What freezing can protect was MEASURED before anything was decided (P41 fact 5, re-taken by W202 in node 24.20.0, deno
2.9.6 and chromium 151, identically): `Object.freeze` THROWS on a typed array with elements, succeeds on a `DataView`
whose bytes stay writable, and leaves a frozen `Map`, `Set`, `Date` and `ArrayBuffer` taking `set`, `add`, `setTime` and
a write through a view. `OR-R11` lets every one of those cross a result's clone, so a result may hold them.

## Decision

1. **One shared copy per output read.** The first time any reference reads an output entry — a node's `needs` or an
   edge's, `"n"` or `["n"]`, either with `?` — the driver makes ONE deep copy of the entry's `result`, freezes it (rule 2),
   and keeps it beside the entry; every later read of that entry, by any reader, at either site, is handed that object.
   A `one` reference hands the copy; an `all` reference hands a FRESH array per read whose elements are the entries'
   copies — the array is the reader's own. Always: no option, no per-reference flag ((a)), whatever the output holds
   ((f2)). A primitive, `null` and `undefined` are handed as they are. `ABSENT`, `[]` (`FD-C4`) and `FD-R3` are untouched.
2. **The freeze, and the gap it leaves** ((f2)). The walk recurses through plain `Object`s and `Array`s and freezes each;
   every OTHER object is frozen SHALLOWLY and not entered; an `ArrayBuffer` view — a typed array or a `DataView` — is
   never handed to `Object.freeze` and is shared UNFROZEN, and so is a `RegExp` (frozen, its `lastIndex` is read-only and
   a global or sticky one's own reads throw — W202's two readers found it; P41 decision 8 has no third behaviour change).
   The walk never throws, and ends on a cycle. So a `Map`, `Set`, `Date` or
   `ArrayBuffer` in a referenced value is frozen shallowly, which stops none of `set`, `add`, `setTime` or a write through
   a view, what any such object holds (a `Map`'s keys and values, a `Set`'s members, an `Error`'s `cause`) is not frozen
   at all, and neither is a typed array, a `DataView` or a `RegExp` — **the named GAP**.
3. **The invariant, restated** ((c)). From *no two nodes ever receive the same object* to ***no node can write to what
   another node reads***, for a reference's value: **a referenced value is READ-ONLY** — enforced where JavaScript can
   enforce it, and the reader's responsibility in rule 2's gap. Freezing stops a writer in STRICT code — an ES-module
   worker's class body always is; a predicate in sloppy code has its write silently dropped. Two observable changes follow, and they are this decision's
   ((c), (g1); P41 decision 8): **an INLINE worker** writing into a freezable value it received through a reference
   THROWS `TypeError` (a worker is an ES module, so strict), and that ATTEMPT fails — retried by the node's
   `retryPolicy`, the task ending by [Q17](../questions/q17.md)'s rule; a THREADED worker writes into its own clone, as
   before, since `postMessage` clones. **A decision PREDICATE** in strict code writing into a freezable nested value of its `ctx.needs`
   throws `TypeError`, which stops the run — against [ADR 0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
   rule 4, which already asked it not to, and which is therefore now partly enforced. In the gap neither throws: an
   inline worker's write into a shared `Map`, `Set`, `Date` or binary value changes what EVERY other reader of that
   output sees.
4. **`"$payload"`: one shared copy of the header's payload per run** ((b)), made by rule 1's means at the first
   `"$payload"` read of the run — or of a resume, whose driver is a new one — and handed at both sites. **`FD-R4` keeps
   its clone** of the caller's value: it composes before a header exists, and its composition reaches no worker.
5. **One resolver** ([ADR 0041](0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md) rule 4,
   kept by (g1)): an edge's reference is the same shared copy a node's is, so `ctx.needs.f` and a worker's `input.f`
   are one object.
6. **What does not move**: the stored record — `OR-R2`'s clone is the driver's own and stays unfrozen; `outputs()`'
   entries, fold inputs, `state()`, `snapshot()`, a checkpoint and every other surface hand out what they did; every VALUE
   a reference resolves to and the order of an `all` answer; `"."`'s and `"$item"`'s per-key copy ((b)); `JP-R11`'s
   copies, an ask's `asked` element, a gate's input; ADR 0014's append order, `FoldInput`, `RunState`, `CHECKPOINT_FORMAT`
   1; every public signature.

## Consequences

1. **The cost is one copy per output read, not one per reader.** The driver alone on the fetch-then-map shape at
   1,000 / 2,000 / 4,000 items, node 24.20.0, each size a fresh process: 529 / 1,993 / 15,475 ms → **33 / 53 / 91 ms**,
   178 / 468 / 1,448 MB → **5 / 11 / 15 MB** — the same as the flow whose reference names a SMALL node (28 / 45 / 80 ms;
   W202's Record carries deno's and the re-taken section 3 table). The count is in the gate:
   `test/fold/reference-copy-cost.test.ts` pins `outputsCache.copies` EXACT at 2,000 and 8,000 items on SEVEN shapes, each
   restored per-read clone red. *(This read *six* until P41's retro, 2026-10-22: W202's adequacy reader added the
   seventh, `["score?"]`, after this sentence was written; the suite's own subject says seven.)*
2. **What a run RETAINS gains one term** (`RN-R13` v0.33): the shared copy of each output a reference has read, for as
   long as its entry — `outputsCache` lives for the run, so for the run's life, dropped where an entry is replaced or
   removed — and of the entry payload where a `"$payload"` reader has read it. It is a SECOND copy of what it copies,
   never the log's object; the price of this decision, named.
3. **The two behaviour changes are a consumer's to see** (decision 3): an inline worker that writes into what a reference
   handed it, and a predicate that writes into its `ctx.needs`, now fail. Hence 0.10.0 ((d)); the version, the push and
   the publish are the maintainer's.
4. **The gap is PINNED**, so it is recorded rather than accidental: `test/driver/shared-reference.test.ts` holds a typed
   array (with elements and empty) and a `DataView` unfrozen, a `Map`, `Set`, `Date` and `ArrayBuffer` frozen shallowly,
   and a write through each reaching another reader, beside a freezable control that throws. *The maintainer's reason for
   (f2) over (f1)*: the largest results — file contents, images, buffers — are likely exactly the unfreezable ones, so
   sharing only freezable values would have left Q186 unsolved for the values most likely to be big.
5. **`JP-R11`'s headline is scoped, not moved**: *no two nodes ever receive the same object* is a sentence about what an
   OPENER hands its branches, whose copies stay; a reference is no longer covered by it (`spec/join-policy.md` v0.24).
6. **Q186 is resolved by removal, not by a warning**: its decision that *nothing warns* stands, and the cost it was about
   is gone. **[P38](../plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) (l)'s refusal** —
   *one frozen copy shared by every instance … a worker that mutates would throw on one road and not on another* — is
   reversed by name: that sentence is now rule 3, decided.
