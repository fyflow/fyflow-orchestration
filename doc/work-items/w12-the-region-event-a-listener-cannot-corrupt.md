# W12 — The region event a listener cannot corrupt

**Status:** todo
**Plan:** [P4](../plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) — the first of its
three items, and the only one with nothing to decide

```
Spec:       spec/outcome-record.md OR-R7, and ADR 0014's rule that every element
            of the fold's input sequence leaves as a frozen copy. This item
            writes no spec and changes none: the rules already say what the code
            must do, and the code does not do it. That is why it needs no ADR
Owns:       src/driver/driver.ts, test/driver/**
            — taken over from W3, which is done. P4's "Which files this plan
            takes over" table is the declaration; W13 takes the same two files
            AFTER this item, never concurrently
Inputs:     Q73, as measured rather than as written: onRegionEvent's argument is
            not frozen, and a listener writing e.branchPath makes the driver's
            own foldInputs() read the mutated value. Reproduced against the
            code before this item was declared. The three outbound paths that
            DO freeze — snapshot(), foldInputs(), onFoldInput via freezeInput —
            are the shape to match
Outputs:    (1) onRegionEvent receives a frozen copy; (2) a test that fails if
            it stops being one, for EACH of the four outbound paths rather than
            only the one being fixed; (3) AGENTS.md section 10's exception to
            "anything the driver gives you is safe" deleted — the sentence is
            wrong once this ships
Depends on: nothing. It is one line of src/ and does not touch the surface
Blocks:     W13, which rewrites the same file
Tests:      L1. The expected value comes from OR-R7 and ADR 0014, not from the
            code: every value the driver hands outward is a frozen copy, so the
            assertion is Object.isFrozen on what the listener receives, PLUS a
            mutation attempt whose failure is observed in foldInputs(). A test
            that only checks isFrozen would pass against a frozen alias of the
            live object, which is the mistake OR-R1 exists to name
Gate:       L0 (typecheck, lint, check:docs — the reference is edited) and L1.
            All five runtimes, since no scheduler is involved. Then pass 2 as
            doc/workflow.md section 6 defines it — TWO readers
Reserves:   Q81-Q83, ADR — none. See Spec above
```

**Every line is fillable.** The one that had to be settled first was `Inputs:` — whether Q73 is true
at all — and P4 reproduced it before this was declared.

---

## Scope

**In**

1. **`emit()` hands `onRegionEvent` a frozen copy.** `append()` already builds one via
   `freezeInput`; `emit()` then calls `this.opts.onRegionEvent?.(e)` with the raw `e`. The fix is to
   pass the same frozen value, not a second copy — **two copies would be two truths**, which is the
   reason `append` pushes the record by reference in the first place.
2. **A test per outbound path, not per bug.** `snapshot()`, `foldInputs()`, `onFoldInput` and
   `onRegionEvent`. Three of the four are already correct and **none of them has a test that would
   notice if they stopped being** — that is what let the fourth ship.
3. **`AGENTS.md` section 10's exception is deleted** (line 656: *"`onRegionEvent` is the exception —
   it hands you the driver's own live object"*). The gate re-runs the reference's snippets, so the
   deletion is checked.

**Out** — named rather than left implicit, with where it goes instead

- **`Object.freeze` being shallow.** A `RegionEvent`'s six fields are all primitives
  (`spec/join-policy.md` section 2), so a shallow freeze is the whole copy. **If that stops being
  true, `freezeInput` is already wrong in the same way** and it is a finding for the Record, not a
  fix here.
- **The surface change** — `start`, `hasFailed`, `failedRuns`. That is [W13](w13-one-driver-one-run-fixed-at-construction.md).
- **Freezing what a `JoinPolicy` sees.** `emit()` steps the policy with `e` before appending. A
  policy is *ours* in a way a listener is not, and whether the seam should freeze there too is a
  question this item may raise but not answer.

## Verification

| Clause | How it is run |
|---|---|
| L0 | `npm run check:spec`, `check:source`, `check:scheduler`, `check:docs`, `check:docs:selftest`, `npm run lint`, `npm run typecheck` (six configs), `deno publish --dry-run` |
| L1 | `npm test`, `npm run test:deno`, `npm run test:browser:all` — 288 assertions plus this item's, in five runtimes |
| **rule 8** | **this item is a fix for a review finding, so the fix is broken and the gate watched go red**: revert the freeze and the new test must fail; freeze a *copy* while still handing out the live object and the mutation test must fail. Both provocations recorded in the Record beside the fix |
| L2-L6 | **NOT RUN as this item's gate** — it changes no routing and no dispatch. They run anyway as part of `npm run gate`, and a failure there is this item's problem |
| pass 2 | two readers |

**Routing cases** (`TEMPLATE.md` asks each in turn): **none apply.** A branch routed away from its
join (Q4), `user_action` (Q17), no matching decision edge (Q10), a duplicate task id (Q13) and a
nested fan-out (Q6) are all unaffected — this item changes what a listener *receives*, not what the
driver does. Stated rather than left silent.

## Record

*Filled in when the item is done.*
