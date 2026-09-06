// **The negative tests for `check-markdown.mjs`, checked in rather than run once by
// hand** — `doc/workflow.md` section 5 rule 7, all three requirements, and rule 8's
// four obligations on the lists this file iterates.
//
//   node scripts/check-markdown.mjs --self-test
//
// **This file carries more weight than any other self-test here, and the reason is
// measured.** At W25's declaration four different slug rules — the declared one,
// whitespace runs collapsed, hyphen runs collapsed, and punctuation replaced by a
// hyphen rather than dropped — each reported **14 dead anchors of 76** on this
// repository. They disagreed about **134, 140 and 294 of the corpus's 584 headings**,
// and **not one of the 76 anchor-carrying links pointed at a heading they disagree
// about.** So the slug rule — the centre of the check — was **unfalsifiable against
// the tree it shipped on**, and these probes were the only thing that could hold it
// to anything.
//
// **W25's own fix made two thirds of that false, and its conformity reader is what
// measured it.** The fourteen repaired `s2---cancel-a-queued-task` anchors are
// exactly the discriminating cases the corpus lacked: on the tree as shipped,
// hyphen-run collapsing costs **14** and punctuation-to-hyphen **6**, where both cost
// 0 before, so two of the three variants are now caught by the CORPUS rather than by
// a probe. **Only whitespace-run collapsing is still invisible to it.** The probes
// stay for all three, because a corpus that happens to discriminate today is not a
// test — and because the `_` defect below is the case that proves it: zero live
// occurrences, a false positive, and only a constructed probe could reach it.
//
// **The file half ships GREEN**, which is the other reason the probes matter: there
// are 0 dead file links today, so `M1` would pass on an empty implementation. Rule 7
// (a)'s case exactly — a check whose subject is currently clean is a check whose
// probes carry the whole weight.
//
// Every probe declares the full **set** of checks it must trip, and the set must
// match exactly. **An empty set is a real declaration here and not an absence**: a
// dead link inside a fenced block, and a correct anchor into an em-dash heading,
// must leave the run at exit 0 with nothing reported. A check that fires on those
// is as broken as one that misses a dead link, and only a `{}` probe says so.
//
// **Three lists live here and each is a loop bound** — `PROBES`, `META`, `SELF` —
// and each has a floor, because `caught === PROBES.length` is vacuously true at
// zero. The observed set is read out of the run's own output rather than filtered
// through an allowlist, which is W24's finding: an allowlist on the observing side
// of a set equality narrows the equality to a universe the author chose.
//
// **What this file does NOT reach.** The fixed point `check-policies-selftest.mjs`
// records and W24 re-measured: nothing inside a self-grading file can assert that
// the file grades. The Record names which guards are outside reach, measured against
// this file as shipped rather than copied from a sibling.
//
// ---------------------------------------------------------------------------
// **W28: A META ENTRY NAMES THE PROBE IT MUST BREAK.** [Q138](../doc/open-questions.md).
//
// A grading was `r.status !== 0` — re-run all 37 probes against the broken check and
// require a non-zero exit — which cannot tell *the clause I broke was caught* from
// *something else went wrong*. Measured over these 36 code-targeted entries: the
// probe credited with the catch is **whichever comes FIRST in list order and
// reacts**, so five of the six slug-rule entries were credited to *a link to a file
// that does not exist* while the two probes written for the slug rule sat lower and
// never ran at all. Each entry now names its probe as its second element, the child
// runs **that probe and no other**, and the grading has three verdicts — ABORT (exit
// 3, the name matches nothing), uncaught (1), STILL CAUGHT (0) — plus `ran:`, which
// requires the mutant to have printed its header so a **crash** is not read as a
// catch.
//
// **Measured: 129.4 s -> 25.3 s for the grading**, and the four new `SELF` entries
// put ~38 s of that back, which is a trade this file makes on purpose.
//
// **And the SELF pass could not see any of it until W28.** The return after the
// probe pass read `if (nested)` — both nesting kinds — so **every `SELF` child
// returned before META and no mutation of a grading was observable from here at
// all.** All four new entries survived on exactly that.
// `check-source-selftest.mjs` had already learned it and says so in place; the
// sibling did not inherit it, which is [Q137](../doc/open-questions.md)'s shape a
// third time — a fix moves and its reason does not.
//
// **The four new entries edit the `META` LIST and leave the guards alone.** The
// two-edit form — *remove the guard AND supply the case it catches* — asks the
// question backwards, because with the guard gone and the defect present the run
// goes GREEN and `SELF`'s *"must exit non-zero"* then reads as *the floor did not
// fire* either way. And an anchor that quotes a guard matches the entry's own
// literal first: [Q143](../doc/open-questions.md).
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const UPSTREAM = 'doc/scheduler-upstream.md';
const README = 'doc/README.md';
const TEMPLATE = 'doc/work-items/TEMPLATE.md';
// **NOT `spec/README.md`**: `C8` reads its version table, so a broken link there
// trips `{C5, C8}` and a probe declaring `{C5}` fails. Both were wrong at birth.
const SPEC_DOC = 'spec/flow-definition.md';
const AGENTS = 'AGENTS.md';
const SPEC_RUNTIME = 'spec/runtime-targets.md';

/**
 * `file` is the document the probe rewrites, relative to the fixture root.
 * `check` plus `also` is the exact set of checks the run must report under, and
 * **`check: null` means the run must stay GREEN** — the probe asserts the check does
 * not fire on something legitimate.
 * `runs: 'spec'` runs `check-spec.mjs` against the fixture's `spec/` instead, which
 * is the only thing that proves `C5`'s lift is actually wired rather than merely
 * written.
 */
const PROBES = [
  // --- M1: a link to a file that does not exist -------------------------------
  {
    name: 'a link to a file that does not exist',
    file: README, check: 'M1',
    mutate: (t) => t.replace('](workflow.md)', '](workflow-v2.md)'),
  },
  {
    name: 'a link to a RENAMED work item — the defect Q121 says this repository produces',
    file: README, check: 'M1',
    // Q121's own five originals were links to real files under old names. This
    // repository renames work items, which is the argument for the clause at all.
    mutate: (t) => t.replace('](work-items/w24-the-gates-own-wiring.md)',
      '](work-items/w24-the-gate-wiring.md)'),
  },
  {
    name: 'a link one directory too shallow — AGENTS.md`s original defect shape',
    file: README, check: 'M1',
    // **Wrong at birth and set equality said so**: this first wrote
    // `](../doc/open-questions.md)`, which from `doc/README.md` resolves back to the
    // same file and broke nothing. The defect Q121 recorded was in `AGENTS.md` at the
    // repo ROOT, where `../doc/` leaves the repository; from inside `doc/` the
    // equivalent mistake is one level the other way.
    mutate: (t) => t.replace('](open-questions.md)', '](../open-questions.md)'),
  },

  // --- M2: the half C5 was structurally blind to ------------------------------
  {
    name: 'a cross-file anchor that resolves to no heading',
    file: README, check: 'M2',
    mutate: (t) => t.replace('](workflow.md)', '](workflow.md#section-nine)'),
  },
  {
    name: 'a SAME-FILE anchor that resolves to no heading — the form C5`s pattern could not match',
    file: 'doc/open-questions.md', check: 'M2',
    // `\]\(([^)#\s]+)(?:#[^)\s]*)?\)` requires at least one non-`#` character
    // before the hash, so `](#live)` never matched it at all. Every same-file
    // anchor in this repository was invisible to C5, not merely unchecked.
    mutate: (t) => t.replace('](#live)', '](#the-live-table)'),
  },
  {
    name: 'an S-id anchor in doc/scheduler-upstream.md broken again',
    file: UPSTREAM, check: 'M2',
    // The exact defect W25 fixed: fourteen links over nine targets, born dead in
    // the founding commit, using the em-dash slug for an ASCII-hyphen heading.
    mutate: (t) => t.replace('](#s2---cancel-a-queued-task)', '](#s2--cancel-a-queued-task)'),
  },
  {
    name: 'a heading RENAMED, leaving every link to it pointing at nothing',
    file: UPSTREAM, check: 'M2',
    // The other direction: the links are untouched and the target moved. A check
    // that only ever sees edited links would miss this.
    mutate: (t) => t.replace('## S6 - Pause and resume', '## S6 - Pause, resume and cancel'),
  },

  // --- {} : the check must NOT fire ------------------------------------------
  {
    name: 'a dead link inside a FENCED BLOCK — must trip nothing',
    file: TEMPLATE, check: null,
    mutate: (t) => t.replace('Spec:       spec/<file>.md section _',
      'Spec:       see [nothing](./no-such-file-at-all.md)'),
  },
  {
    name: 'a dead link inside an INLINE CODE SPAN — must trip nothing',
    file: README, check: null,
    // Measured at W25's declaration: 4 false positives in three files without
    // span-blanking, one of them a placeholder rather than an illustration.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\nWrite a link as `[label](../no-such-file.md)` or `](#no-such-anchor)`.\n'),
  },
  {
    name: 'an EXTERNAL link that does not resolve locally — must trip nothing',
    file: README, check: null,
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\nSee [upstream](https://github.com/fyflow/fyflow-scheduler/blob/main/AGENTS.md#6-events).\n'),
  },

  // --- the slug rule, which the corpus cannot discriminate --------------------
  {
    name: 'a correct link into an EM-DASH heading — must trip nothing, and does not under a collapsing rule',
    file: README, check: null,
    // ` — ` drops the em-dash and leaves TWO spaces, so the slug carries two
    // hyphens. A rule that collapses runs produces one and this probe goes red.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n## Probe — em dash\n\nSee [it](#probe--em-dash).\n'),
  },
  {
    name: 'a correct link into a ` - ` heading — three hyphens, not one',
    file: README, check: null,
    // space, literal hyphen, space. This is the exact shape the fourteen dead
    // anchors got wrong, written correctly.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n## Probe - hyphen\n\nSee [it](#probe---hyphen).\n'),
  },
  {
    name: 'a correct link into the SECOND of two identical headings — GitHub`s -1 suffix',
    file: README, check: null,
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n## Probe twin\n\n## Probe twin\n\nSee [second](#probe-twin-1).\n'),
  },
  {
    name: 'a link into a heading whose text is entirely inside a code span',
    file: README, check: null,
    // GitHub slugs what it RENDERS, so `AGENTS.md` slugs to `agentsmd` — the
    // backticks are markup and the dot is punctuation. Blanking code spans before
    // reading headings would produce an empty slug and this probe would go red.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n## `AGENTS.md` and friends\n\nSee [it](#agentsmd-and-friends).\n'),
  },

  {
    name: 'a CORRECT cross-file anchor — must trip nothing, and this repository has none',
    file: README, check: null,
    // **The probe the corpus cannot supply, and the META pass is what found it
    // missing.** All 76 anchor-carrying links in this repository are **same-file**;
    // there are **zero** cross-file ones. So for every real link `p === abs`, and
    // the provenance mutation *"read the target's anchors from the LINKING file"*
    // changes one expression into an identical one and costs nothing. Every M2 probe
    // above breaks the anchor, so it fails either way and cannot discriminate; only
    // a link that is CORRECT and points at ANOTHER file can.
    //
    // This is the slug rule's problem in a second clause of the same check: the
    // tree the check ships on cannot falsify it, and the probe has to construct the
    // case. Measured after the fact, which is the honest order — the author's set
    // did not have it and the META entry it was written for came back not-noticed.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\nSee [S2](scheduler-upstream.md#s2---cancel-a-queued-task).\n'),
  },

  {
    name: 'a correct link into a heading with an INTRAWORD UNDERSCORE — the BLOCKING defect',
    file: README, check: null,
    // **W25's conformity reader's edit, checked in.** `slug()` stripped `_` with
    // ``[`*_~]`` as "emphasis markup" while its own docstring said GitHub keeps it,
    // so `## The run_flow helper` slugged to `the-runflow-helper` and this link was
    // reported DEAD. False positive — the gate red for a document that is right.
    // Zero live occurrences, which is why only a constructed probe can hold it.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n## The run_flow helper\n\nSee [it](#the-run_flow-helper).\n'),
  },

  {
    name: 'a dead link in the ROOT README.md — the only probe that covers a root document',
    file: 'README.md', check: 'M1',
    // **The META entry that drops the three root files from the scan found this
    // missing.** Every other probe edits something under `doc/` or `spec/`, so the
    // root documents were in the walk and in no assertion: dropping them cost 0.
    mutate: (t) => t.replace('](AGENTS.md)', '](AGENTS-v2.md)'),
  },

  {
    name: 'a correct link into an H4 heading — the heading-LEVEL bound',
    file: README, check: null,
    // **W25's adequacy sweep's survivor, checked in.** Narrowing `#{1,6}` to
    // `#{1,3}` cost 0: every probe above adds an `##` heading, so the levels below
    // h3 were in the regex and in no assertion. `doc/` uses h4 in several documents.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n#### Probe deep heading\n\nSee [it](#probe-deep-heading).\n'),
  },
  {
    name: 'a correct link into the THIRD identical heading — the -2 suffix',
    file: README, check: null,
    // Capping the duplicate loop at two cost 0, because the probe above needs only
    // `-1`. A bound is not exercised by its first iteration.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n## Probe trio\n\n## Probe trio\n\n## Probe trio\n\nSee [third](#probe-trio-2).\n'),
  },
  {
    name: 'a correct link into a heading with a NON-ASCII letter',
    file: README, check: null,
    // The character class is `\\p{L}` and an ASCII-only variant cost 0, because every
    // heading any probe wrote was ASCII. GitHub keeps unicode letters in a slug.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n## Präzision und Größe\n\nSee [it](#präzision-und-größe).\n'),
  },

  {
    name: 'a dead link in AGENTS.md — the file Q121 named, and it could leave the walk',
    file: AGENTS, check: 'M1',
    // **W25's adequacy reader's edit.** Dropping `'AGENTS.md'` from the root list
    // cost **0**: only one probe touched a root document and it used README.md, so
    // two of the three could leave one at a time. Q121's own five original defects
    // included three in AGENTS.md.
    mutate: (t) => t.replace('](doc/open-questions.md)', '](doc/open-questions-v2.md)'),
  },
  {
    name: 'a dead link in spec/, seen by CHECK-MARKDOWN rather than by check-spec',
    file: SPEC_RUNTIME, check: 'M1',
    // Dropping `markdownIn(join(SCAN_ROOT, 'spec'))` from this script's own file set
    // cost 0, because every spec probe runs `check-spec` instead. The lift means
    // `spec/` is scanned twice and only one of the two was bounded.
    mutate: (t) => t.replace('](task-id.md)', '](task-id-v9.md)'),
  },
  {
    name: 'a PERCENT-ENCODED anchor that resolves — must trip nothing',
    file: UPSTREAM, check: null,
    // One of three clauses added for the conformity reader that shipped with no
    // probe. Without the try/catch a bare `%` is a URIError and the run dies; with
    // `anchor = raw` an encoded anchor is compared undecoded and reported DEAD.
    mutate: (t) => t.replace('](#s2---cancel-a-queued-task)', '](#s2%2D%2D%2Dcancel-a-queued-task)'),
  },
  {
    name: 'an EMPTY anchor ](#) — must trip nothing',
    file: README, check: null,
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\nSee [nowhere](#).\n'),
  },
  {
    name: 'an anchored link to a NON-MARKDOWN file — must trip nothing',
    file: README, check: null,
    // `isMarkdownFile` is what stops `readFileSync` on a directory (EISDIR) and stops
    // a `.json` being read as headings. Deleting its `.md` test cost 0.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\nSee [the registry](../spec/examples/registry.json#predicates).\n'),
  },
  {
    name: 'a MAILTO link — must trip nothing, and the scheme test is wider than https',
    file: README, check: null,
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\nWrite to [someone](mailto:nobody@example.com).\n'),
  },
  {
    name: 'a correct link into a heading containing a LINK — must trip nothing',
    file: README, check: null,
    // `slug()`'s link-rendering clause had neither a probe nor a META entry and
    // deleting it cost 0. GitHub slugs the RENDERED text, so the url is not in it.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n## See [ADR 0001](decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md) for this\n\nSee [it](#see-adr-0001-for-this).\n'),
  },
  {
    name: 'a dead link inside a ~~~ FENCE — must trip nothing',
    file: README, check: null,
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n~~~\n[label](../no-such-file.md)\n~~~\n'),
  },
  {
    name: 'a dead link inside a fence INDENTED in a list item — must trip nothing',
    file: README, check: null,
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n- an item:\n\n  ```\n  [label](../no-such-file.md)\n  ```\n'),
  },
  {
    name: 'a CODE-SPAN heading after a fenced block — the newline half of length preservation',
    file: README, check: null,
    // **Why the code span matters, and the first version of this probe had none.**
    // `anchorsOf` walks the BLANKED text to find which lines are headings and the RAW
    // text to read what they say, indexing both by the same `i`. A blank that does not
    // preserve newlines makes the two arrays different lengths, so every heading after
    // the first fence reads its text from the wrong line. A plain heading survives
    // that — its slug is recomputed from whatever line it lands on, and a link to it
    // is dead either way, so the probe reported `{}` both ways and the META entry came
    // back not-noticed. A heading whose text is a code span only slugs correctly when
    // the raw line is the right one.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n```\nfenced\n```\n\n## The `AGENTS.md` note\n\nSee [it](#the-agentsmd-note).\n'),
  },
  {
    name: 'a link to a MID-LINE ## — dead, and alive if the heading regex loses its anchor',
    file: README, check: 'M2',
    // **These two were one `{}` probe and it could not discriminate.** It linked to a
    // heading that resolves either way, so loosening the regex only ADDED anchors and
    // nothing failed. A probe for a clause that makes the check MORE permissive has
    // to assert something is DEAD, not that something resolves.
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\nText with a ## Fake head inline in it.\n\nSee [it](#fake-head-inline-in-it).\n'),
  },
  {
    name: 'a link to #notaheading — dead, and alive if the space after the hashes stops being required',
    file: README, check: 'M2',
    mutate: (t) => t.replace('# Documentation index',
      '# Documentation index\n\n#notaheading\n\nSee [it](#notaheading).\n'),
  },

  // --- M3 / M4 / M5: the walk covers the tree --------------------------------
  {
    name: 'doc/decisions removed from the tree — the FILE floor, alone',
    file: README, check: 'M1', also: ['M3'], removes: ['doc/decisions'],
    // 66 -> 50 files, 1746 -> 1548 links, 86 anchored: RE-MEASURED at P9's declaration,
    // which is where the previous figures (62 -> 46 / 1577 -> 1379 / 78) stopped being
    // true and took this probe with them. Four new documents took the cut from 46 to
    // **50** against a floor of `< 50`, so M3 fell silent and the gate exited 1 with
    // `wanted [M1,M3], got [M1]`. **It happened again at P10's declaration, 51 -> 56
    // against a floor of `< 56`, and this is the first time it was PREDICTED from the
    // pre-edit counts rather than discovered by the gate going red.** The cut now reads
    // **56 files / 1947 links / 99 anchored** and the floor is **64**;
    // check-markdown.mjs carries why: a floor is one-sided for the CHECK and two-sided
    // for the PROBE.
    // [Q142](../doc/open-questions.md). Still the only cut in this
    // corpus that trips the FILE floor and neither of the other two. The README edit
    // is there so the rule 7 (b) guard has a change to see.
    //
    // **`M1` is a structural cascade on every `removes` probe and was missed at
    // birth** — declared `{M3}`, reported `{M1,M3}`. Taking a directory out of the
    // tree also kills every link pointing INTO it, and 1483 of this corpus's 1577
    // links are to `.md` files. There is no cut that moves a count without moving
    // `M1`, so the cascade is declared rather than engineered away.
    mutate: (t) => t.replace('# Documentation index', '# Documentation index\n'),
  },
  {
    name: 'doc/decisions AND doc/plans removed — the LINK floor, with the anchors left alone',
    file: README, check: 'M1', also: ['M3', 'M4'],
    removes: ['doc/decisions', 'doc/plans'],
    // **41 files / 1357 links / 94 anchored, re-measured at W30's close** — and this
    // probe reported `wanted [M1,M3,M4], got [M1,M3]` again, for the second plan
    // running, because W30's own Record and index paragraphs pushed the fixture's link
    // count from 1217 past the 1350 floor. It read 37/1116/78 at W25, 40/1217/86 at
    // P9's declaration, 41/1357/94 at W30's close and **45/1507/99 at P10's
    // declaration**; the floor is **1720**.
    // [Q142](../doc/open-questions.md) is not fixed by retuning it — the window is
    // two-sided by construction — and the mitigation is the direction: it fails
    // LOUDLY, in the gate, naming the probe and the expected set: the anchors are untouched, because
    // all 78 live in `doc/`'s top level. So this probe fires `M4` and the one above
    // does not, and that difference is what makes the link floor independently
    // observable — the first version removed `doc/`'s top level instead, which took
    // the anchors with it and left the link count at 1247, above the floor. Declared
    // `{M4,M5}`, reported `{M1,M5}`: wrong on both halves at birth.
    mutate: (t) => t.replace('# Documentation index', '# Documentation index\n'),
  },


  {
    name: 'the anchor-carrying links all removed, so M2 would pass on nothing',
    file: 'doc/open-questions.md', check: 'M5',
    // **Wrong at birth.** It first emptied `doc/scheduler-upstream.md`, which holds
    // 14 of the corpus's 76 anchored links — leaving 62, well above M3's floor of 20,
    // so the run stayed green and the probe reported `wanted [M3], got []`. The
    // register is where the anchors are: 62 of 76.
    // Emptying the subject rather than the checker: with every `#` target gone the
    // corpus drops under M3's anchored floor and M2 becomes true of the walk.
    mutate: (t) => t.replace(/\]\(#[a-z0-9-]+\)/g, '](.)'),
  },

  // --- C5's lift, which nothing else proves is wired --------------------------
  {
    name: 'a dead link inside spec/, which check-spec must still refuse as C5',
    file: SPEC_DOC, check: 'C5', runs: 'spec',
    // **The only probe that proves the lift is wired rather than written.**
    // `check-spec.mjs` imports `resolveLinks` and labels its result `C5`; if that
    // import were removed, `check-markdown` would stay green and `spec/` would go
    // unchecked for the first time since W1.
    mutate: (t) => t.replace('](task-id.md)', '](task-id-v2.md)'),
  },
  {
    name: 'a dead ANCHOR inside spec/, which the lift gives C5 and C5 never had',
    file: SPEC_DOC, check: 'C5', runs: 'spec',
    // `spec/` carries zero anchor links today — measured — so this clause is
    // inert there and the probe is the only thing that exercises it.
    mutate: (t) => t.replace('](join-policy.md)', '](join-policy.md#no-such-heading)'),
  },
];

/** A floor on the probe list. `caught === PROBES.length` is vacuous at zero. */
/**
 * **Did the check under test RUN TO COMPLETION?** A grading requires this, which is
 * how a mutant that **crashed** is told apart from one that ran and stopped
 * detecting — an exit code reads both as a catch.
 *
 * **It keys on the TERMINAL line rather than the report header**, which is W28's
 * readers' finding: the header is printed *before* the report and the exit path, so
 * a mutant made to throw after it was scored *noticed* at a cost of **0**. Every
 * check here — `check-markdown` and `check-spec` alike — ends with exactly one of
 * these two lines, which also **removes the `runs: 'spec'` exemption**: that branch
 * had `ran: true` hardcoded on the stated ground that the header belonged to
 * another script, and a `check-spec.mjs` mutated into a **SyntaxError** was scored
 * *noticed* at a cost of 0.
 */
const RAN = (out) => /^(All checks passed|\d+ failure\(s\)\.)/m.test(out);

/**
 * **And did the SELF child's own self-test run at all?** `SELF` graded
 * `ok = r.status !== 0`, so an entry could pass by making this file a **syntax
 * error** — W28's adequacy reader appended `((( ;` to a `SELF` mutation and the run
 * reported bounded at exit 0 while the bound it claims to test was never tested.
 * Both code paths that grade anything print this line first; a file that does not
 * parse prints nothing.
 */
const SELF_RAN = (out) => /self-test — /.test(out);

const MIN_PROBES = 37;
/** The same floor for `META`. */
const MIN_META = 37;
/** And for `SELF`. */
const MIN_SELF = 7;

/** The ids a run reported under, read out of the run's own output — no allowlist. */
const trippedIn = (out) => [...new Set([...out.matchAll(/^ {2}([A-Z]\d+): /gm)].map((m) => m[1]))].sort();

/**
 * **The mutations `check-markdown.mjs` itself is run against**, with the whole probe
 * suite re-run against each broken copy. Every probe asserts the check refuses a
 * broken document; nothing above asserts that the probes notice a broken check.
 *
 * Each entry must make at least one probe stop being caught. **Five of these swap
 * the slug rule**, which is the only way this repository can be made to say anything
 * about it at all.
 */
const META = [
  // (b) the Outputs table's rows, broken so they are PRESENT BUT INERT.
  ['M1 disabled',
    'a link to a file that does not exist', (t) => t.replace("for (const d of r.dead) fail('M1', d);", "for (const d of []) fail('M1', d);")],
  ['M2 disabled',
    'a cross-file anchor that resolves to no heading', (t) => t.replace("for (const d of r.deadAnchors) fail('M2', d);", "for (const d of []) fail('M2', d);")],
  ['M5`s anchored floor disabled — the entry name said M3 until W28, and it edits r.anchored',
    'the anchor-carrying links all removed, so M2 would pass on nothing', (t) => t.replace('if (r.anchored < 60)', 'if (false)')],
  ['M1 and M2 swapped, so every count still matches and no set does',
    'a link to a file that does not exist',
    (t) => t.replaceAll("fail('M1'", "fail('MX'").replaceAll("fail('M2'", "fail('M1'").replaceAll("fail('MX'", "fail('M2'")],
  // **The primary loop's BOUND, and it was unguarded.** W25's conformity reader
  // added these two directories to the skip list and **31 of 62 documents — every
  // work item and every plan — left the scan with all three checks green and the
  // gate at exit 0**. The floors were 20 / 100 / 20, which is the degenerate extreme
  // rather than the tree; they are 50 / 1200 / 60 now and this is what holds them.
  ['the walk skips doc/work-items and doc/plans — half the corpus leaves',
    'an EXTERNAL link that does not resolve locally — must trip nothing',
    (t) => t.replace("      if (name === 'node_modules' || name === '.git' || name === 'dev-dist' || name === 'dist') continue;",
      "      if (name === 'node_modules' || name === '.git' || name === 'dev-dist' || name === 'dist') continue;\n      if (name === 'work-items' || name === 'plans') continue;")],
  ['the three ROOT documents dropped from the scan',
    'a dead link in the ROOT README.md — the only probe that covers a root document',
    (t) => t.replace("  ...['README.md', 'AGENTS.md', 'CLAUDE.md'].map((f) => join(SCAN_ROOT, f)).filter(existsSync),", '')],
  // **W25's adequacy sweep's three surviving mutations, checked back in.** All three
  // are inside `slug()` / `anchorsOf()` — the clause this item declared its corpus
  // cannot falsify — and all three cost 0 until the probes above existed.
  ['heading levels narrowed to h1-h3',
    'a correct link into an H4 heading — the heading-LEVEL bound',
    (t) => t.replaceAll('/^#{1,6}[ \\t]+(.+?)[ \\t]*$/', '/^#{1,3}[ \\t]+(.+?)[ \\t]*$/')],
  ['the duplicate-heading suffix loop capped at two',
    'a correct link into the THIRD identical heading — the -2 suffix',
    (t) => t.replace('for (let i = 1; i < n; i++) out.add(`${s}-${i}`);',
      'for (let i = 1; i < Math.min(n, 2); i++) out.add(`${s}-${i}`);')],
  ['the slug character class made ASCII-only',
    'a correct link into a heading with a NON-ASCII letter',
    (t) => t.replace(".replace(/[^\\p{L}\\p{N}\\s_-]/gu, '')", ".replace(/[^a-z0-9\\s_-]/g, '')")],
  // **W25's adequacy reader's mutations, checked back in.** Every one of these cost
  // **0 failures** before the probes above existed — 75 mutations, 23 survivors, 7 of
  // them blocking.
  // **Both of these first matched a COMMENT and not the code**, because the
  // paragraph above the clauses quotes them verbatim to explain why the ids were
  // split — so `String.replace`'s first-occurrence rule edited the prose and the
  // check ran unchanged, and the entry reported *"the probes passed against a check
  // that does not check"* against a check that was never broken. **A comment that
  // quotes the code it explains makes that code unmutatable by a literal-anchored
  // probe**, which is W25's adequacy reader's finding 12 arriving from the opposite
  // direction: there a literal stopped matching, here it matched the wrong thing.
  // Anchored on the `fail(` that only the real clause carries.
  ['M3`s file floor disabled',
    'doc/decisions removed from the tree — the FILE floor, alone',
    (t) => t.replace("if (r.files < 64) fail('M3'", "if (false) fail('M3'")],
  ['M4`s link floor disabled',
    'doc/decisions AND doc/plans removed — the LINK floor, with the anchors left alone',
    (t) => t.replace("if (r.links < 1720) fail('M4'", "if (false) fail('M4'")],
  ['AGENTS.md dropped from the root file list',
    'a dead link in AGENTS.md — the file Q121 named, and it could leave the walk',
    (t) => t.replace("  ...['README.md', 'AGENTS.md', 'CLAUDE.md']", "  ...['README.md', 'CLAUDE.md']")],
  ['spec/ dropped from this script`s own file set',
    'a dead link in spec/, seen by CHECK-MARKDOWN rather than by check-spec',
    (t) => t.replace("  ...markdownIn(join(SCAN_ROOT, 'spec')),\n", '')],
  ['the percent-decode guard removed, so an encoded anchor is compared raw',
    'a PERCENT-ENCODED anchor that resolves — must trip nothing',
    (t) => t.replace('        try { anchor = decodeURIComponent(raw); } catch { anchor = raw; }', '        anchor = raw;')],
  ['the empty-anchor skip narrowed to null',
    'an EMPTY anchor ](#) — must trip nothing',
    (t) => t.replace('      if (!anchor) continue;', '      if (anchor === null) continue;')],
  ['isMarkdownFile`s .md test removed',
    'an anchored link to a NON-MARKDOWN file — must trip nothing',
    (t) => t.replace("  if (!abs.endsWith('.md')) return false;\n", '')],
  ['the external-scheme test narrowed to http(s)',
    'a MAILTO link — must trip nothing, and the scheme test is wider than https',
    (t) => t.replace('if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;', 'if (/^https?:/i.test(target)) continue;')],
  ['slug()`s link-rendering clause removed',
    'a correct link into a heading containing a LINK — must trip nothing',
    (t) => t.replace("    .replace(/!?\\[([^\\]]*)\\]\\([^)]*\\)/g, '$1')   // [text](url) renders as text\n", '')],
  ['blankCode stops recognising ~~~ fences',
    'a dead link inside a ~~~ FENCE — must trip nothing',
    (t) => t.replace('(```+|~~~+)', '(```+)')],
  ['blankCode stops allowing an INDENTED closing fence',
    'a dead link inside a fence INDENTED in a list item — must trip nothing',
    (t) => t.replace('^[ \\t]*\\2[^\\n]*$/gm', '^\\2[^\\n]*$/gm')],
  ['blankCode stops preserving newlines',
    'a CODE-SPAN heading after a fenced block — the newline half of length preservation',
    (t) => t.replace("const blank = (m) => m.replace(/[^\\n]/g, ' ');", "const blank = (m) => m.replace(/[\\s\\S]/g, ' ');")],
  ['the heading regex stops requiring a space after the hashes',
    'a link to #notaheading — dead, and alive if the space after the hashes stops being required',
    (t) => t.replaceAll('/^#{1,6}[ \\t]+(.+?)[ \\t]*$/', '/^#{1,6}[ \\t]*(.+?)[ \\t]*$/')],
  ['the heading regex stops being anchored to the line start',
    'a link to a MID-LINE ## — dead, and alive if the heading regex loses its anchor',
    (t) => t.replaceAll('/^#{1,6}[ \\t]+(.+?)[ \\t]*$/', '/#{1,6}[ \\t]+(.+?)[ \\t]*$/')],
  ['a row deleted from the report`s checks array',
    'a link to a file that does not exist',
    (t) => t.replace("  'M1 every relative link resolves to a file that exists',\n", '')],
  ['the anchor comparison made one-way — a missing anchor is never reported',
    'a cross-file anchor that resolves to no heading',
    (t) => t.replace('if (have && !have.has(anchor)) {', 'if (false) {')],
  ['same-file anchors skipped, which is exactly what C5 did',
    'a SAME-FILE anchor that resolves to no heading — the form C5`s pattern could not match',
    (t) => t.replace("const abs = path === '' ? p : resolve(dirname(p), path);",
      "if (path === '') continue;\n      const abs = resolve(dirname(p), path);")],
  ['code spans NOT blanked, so an illustration of link syntax is a failure',
    'a dead link inside an INLINE CODE SPAN — must trip nothing',
    (t) => t.replace('  return fenced.replace(/(`+)(?!`)([^\\n]*?)\\1(?!`)/g, blank);', '  return fenced;')],
  ['fenced blocks NOT blanked',
    'a dead link inside a FENCED BLOCK — must trip nothing', (t) => t.replace(
    '  const fenced = text.replace(/^([ \\t]*)(```+|~~~+)[^\\n]*\\n[\\s\\S]*?^[ \\t]*\\2[^\\n]*$/gm, blank);',
    '  const fenced = text;')],
  // (a)+(the slug rule) — the clauses the corpus cannot discriminate.
  ['the slug rule collapses whitespace runs',
    'a correct link into an EM-DASH heading — must trip nothing, and does not under a collapsing rule', (t) => t.replace(".replace(/\\s/g, '-');", ".replace(/\\s+/g, '-');")],
  ['the slug rule collapses hyphen runs',
    'a correct link into a ` - ` heading — three hyphens, not one', (t) => t.replace(".replace(/\\s/g, '-');", ".replace(/\\s/g, '-').replace(/-+/g, '-');")],
  ['the slug rule replaces punctuation with a hyphen rather than dropping it',
    'a correct link into an EM-DASH heading — must trip nothing, and does not under a collapsing rule',
    (t) => t.replace(".replace(/[^\\p{L}\\p{N}\\s_-]/gu, '')", ".replace(/[^\\p{L}\\p{N}\\s_-]/gu, '-')")],
  ['the slug rule blanks a heading`s code spans, so `AGENTS.md` slugs to nothing',
    'a link into a heading whose text is entirely inside a code span',
    (t) => t.replace('    const raw = /^#{1,6}[ \\t]+(.+?)[ \\t]*$/.exec(lines[i]);', '    const raw = null;')],
  ['GitHub`s -1 suffix for a repeated heading dropped',
    'a correct link into the SECOND of two identical headings — GitHub`s -1 suffix',
    (t) => t.replace('    for (let i = 1; i < n; i++) out.add(`${s}-${i}`);', '')],
  // (c) PROVENANCE — the source expression and nothing else.
  ['the target`s anchors read from the LINKING file rather than the target',
    'a CORRECT cross-file anchor — must trip nothing, and this repository has none',
    (t) => t.replace('      const have = anchorsFor(abs);', '      const have = anchorsFor(p);')],
  ['every failure swallowed',
    'an S-id anchor in doc/scheduler-upstream.md broken again', (t) => t.replace('const fail = (check, msg) => failures.push(`${check}: ${msg}`);', 'const fail = () => {};')],
  ['the non-zero exit removed',
    'a link to a RENAMED work item — the defect Q121 says this repository produces', (t) => t.replace('  process.exit(1);', '  process.exitCode = 0;')],
  ['C5`s lift removed from check-spec — the import kept and the call dropped',
    'a dead link inside spec/, which check-spec must still refuse as C5',
    (t) => t, 'spec'],
];

/**
 * **The mutations THIS file is run against** — rule 8's fourth obligation turned on
 * the harness. Each must make the run exit non-zero.
 */
const SELF = [
  ['one probe deleted from PROBES',
    (t) => t.replace(/\n  \{\n    name: 'an EXTERNAL link that does not resolve locally[\s\S]*?\n  \},/, '')],
  ['PROBES emptied entirely', (t) => t.replace(/const PROBES = \[[\s\S]*?\n\];/, 'const PROBES = [];')],
  // **The rule 7 (b) guard, which is what keeps twelve `{}` probes from going
  // vacuous.** W25's adequacy reader disabled `if (mutated === original)` for **0**
  // and showed the consequence both ways: a probe whose mutation matches nothing
  // reports `FAIL … the mutation matched nothing` with the guard, and reports `ok`
  // with the whole run green without it. **This is not the acknowledged fixed
  // point** — the failure is observable from one level out, which is exactly what a
  // `SELF` entry is, so it is closed rather than recorded.
  // --- W28: the named-probe contract, one edit each ---------------------------
  //
  // **Each of these edits the META LIST and leaves the guard alone**, which is a
  // correction of how they were first written in `check-source-selftest.mjs`. The
  // two-edit form — *remove the guard AND supply the case it catches* — asks the
  // question backwards: with the guard gone and the defect present the run goes
  // GREEN, so `SELF`'s *"must exit non-zero"* reads as **the floor did not fire**
  // whether the guard was load-bearing or not, and two of the four passed VACUOUSLY.
  // Editing only the defect asks it the right way round: with the guard in place,
  // does the run go red? Nothing self-matches, because `META` sits above `SELF`.
  // [Q143](../doc/open-questions.md).
  ['the probe name dropped from the child`s env, so the grading reads the whole suite again',
    (t) => t.replace('CHECK_MARKDOWN_SCRIPT: path, CHECK_MARKDOWN_FIXTURE: tree,\n            CHECK_MARKDOWN_PROBE: probeName }',
      'CHECK_MARKDOWN_SCRIPT: path, CHECK_MARKDOWN_FIXTURE: tree }')],
  ['one META entry pointed at a probe that does not exist — the ABORT`s own case',
    (t) => t.replace("  ['every failure swallowed',\n    'an S-id anchor in doc/scheduler-upstream.md broken again',",
      "  ['every failure swallowed',\n    'a probe this file does not have',")],
  ['one META entry pointed at a probe its mutation does not break — the STILL-CAUGHT case',
    // Disabling `M1` cannot make a `{}` probe stop being caught: it reports nothing
    // either way. So the entry is mislabelled and the verdict has to say so.
    (t) => t.replace("  ['M1 disabled',\n    'a link to a file that does not exist',",
      "  ['M1 disabled',\n    'a MAILTO link — must trip nothing, and the scheme test is wider than https',")],
  // **This entry replaces one that made a META mutation FATAL, and the replacement
  // is a finding rather than a tidy-up** — the same correction `check-source` makes.
  // That entry existed because a crashing mutant used to be scored *noticed* on its
  // exit code. **The inertness check the readers asked for absorbs the class**: a
  // mutant that throws does not exit 0 on the untouched fixture, so it is classified
  // `corpus` — noticed, by the gate itself, which is true and stronger than a probe.
  //
  // The `ran:` guard stays as defence in depth for a mutant that is inert on the
  // clean tree and dies only on the probe's input. **That case is REAL and was
  // measured** — `check-policies.mjs` ends with ``All checks passed — ${names.join(', ')}``,
  // reachable with `names === null` exactly when P3's first clause is disabled — but
  // no current entry in any of the three files produces one, so the guard is
  // unprovoked and is on the ceiling list. [Q144](../doc/open-questions.md).
  //
  // What this entry provokes instead is rule 7 (b) at the META layer.
  ['one META mutation made VACUOUS — rule 7 (b) at the grading layer',
    (t) => t.replace("(t) => t.replace(\"for (const d of r.dead) fail('M1', d);\", \"for (const d of []) fail('M1', d);\")",
      "(t) => t.replace('a string this file does not contain', 'nor this one')")],

  ['the rule 7 (b) guard disabled, and one probe made a no-op',
    (t) => t.replace('    if (mutated === original) {', '    if (false) {')
      .replace("      '# Documentation index\\n\\nSee [nowhere](#).\\n'),", "      '# Documentation index'),")],

];

// **A third `SELF` entry was written and REMOVED, and the removal is the finding.**
// It weakened the empty-set rule from *exit 0 AND nothing reported* to *exit 0*, and
// it came back **"the floor did not fire"**: `check-markdown.mjs` exits non-zero
// whenever it reports anything, so the two forms are equivalent and the second
// conjunct decides nothing. It is kept in the code because it is correct and free,
// and it is named here rather than dressed up as a grading that fires — which is
// W24's `missingFrom` case in a second file.
//
// **And `SELF` children do NOT run `META` here, where in W24 they must.** W24 has a
// guard whose only effect is inside its `META` pass, so a child that skipped `META`
// could not see it; this file has none, both entries abort at `MIN_PROBES`, and
// running `META` inside each `SELF` child took the suite from **59 s to 2 m 4 s**
// for no extra grading.

export async function selfTest(root) {
  // **Per-process, not per-repository.** W25's conformity reader hit two concurrent
  // top-level runs sharing one fixture path — once as `ENOENT … tree/doc/README.md`
  // mid-probe, once as `4/18 probes caught` with spurious M1s. The sharing argument
  // below is about children within one run and said nothing about two runs; a pid in
  // the path costs nothing and makes the claim true as written.
  const base = join(root, 'dev-dist', `markdown-selftest-${process.pid}`);
  // **The fixture is built once and REUSED by every child.** Measured: a copy is
  // ~1.6 s and a nested probe suite is ~5.7 s, so seventeen META children copying
  // their own tree was about half the suite's wall clock. Reuse is safe because the
  // children run strictly sequentially, every probe restores the document it edited,
  // and every child rewrites both scripts under test before it starts — see below,
  // where the third of those was missing and is the defect this sharing introduced.
  // None of it would hold if the children ran concurrently, which is why this is an
  // env var a parent sets rather than a default.
  const shared = process.env.CHECK_MARKDOWN_FIXTURE;
  // **`base` is created UNCONDITIONALLY, and a SELF child is why.** `shared` is
  // about the FIXTURE TREE — whether this run builds its own copy of the repository
  // or reuses its parent's — and `base` is something else: it is where the META and
  // SELF passes write their mutant scripts. Guarding both on `!shared` meant a
  // child that inherited a fixture had nowhere to put a mutant.
  //
  // **Until W28 that was unreachable**, because a SELF child returned before the
  // META pass. W28 changed that return from `if (nested)` to `if (nestedScript)` so
  // SELF children would finally exercise the gradings — and every one of them then
  // died with `ENOENT … .meta-00.mjs` on the first write. `SELF` grades
  // `ok = r.status !== 0`, so **all four of the entries W28 added scored BOUNDED on
  // the crash**, and the control proves it: an UNMUTATED copy of this file, run as a
  // SELF child against a real fixture, reports `37/37 probes caught`, reaches META
  // and exits 1. **Both readers found this independently**, and it is rule 8's
  // founding case — a repair that could not fail — landing on the repair itself.
  if (!shared) rmSync(base, { recursive: true, force: true });
  mkdirSync(base, { recursive: true });
  const tree = shared ?? join(base, 'tree');

  // **The fixture is a copy of the real tree**, because a link points at whatever
  // it points at: 1483 of this repository's relative links are to `.md` files and
  // eleven are not, so a markdown-only fixture would report those eleven dead. The
  // copy is 2.9 MB and is made once per run, not once per probe.
  // **Copied entry by entry rather than in one call**, because the fixture lives
  // under `dev-dist/` and `cpSync` refuses to copy a directory into a subdirectory
  // of itself (`ERR_FS_CP_EINVAL`). Keeping it under `dev-dist/` is the point: that
  // directory is gitignored, so an interrupted run leaves nothing in `git status`.
  // Only the trees a relative link can reach, measured rather than guessed: of
  // 1494 relative links, 1483 are to `.md` files and the other eleven are
  // directories under `doc/` and `examples/` plus one `scripts/*.mjs`. Copying
  // `src/` and `test/` as well cost seconds per META child for nothing.
  const COPY = ['doc', 'spec', 'scripts', 'examples', 'README.md', 'AGENTS.md', 'CLAUDE.md',
    'package.json', 'deno.json'];
  if (!shared) {
    mkdirSync(tree, { recursive: true });
    for (const name of COPY) {
      if (existsSync(join(root, name))) cpSync(join(root, name), join(tree, name), { recursive: true });
    }
  }

  const script = process.env.CHECK_MARKDOWN_SCRIPT ?? join(root, 'scripts', 'check-markdown.mjs');
  const specScript = process.env.CHECK_MARKDOWN_SPEC_SCRIPT;
  // A META child must grade nothing; a SELF child must run META, because a guard
  // whose only effect is inside META is invisible to a child that skips it.
  const nestedScript = !!process.env.CHECK_MARKDOWN_SCRIPT || !!specScript;
  const nestedSelf = !!process.env.CHECK_MARKDOWN_SELFTEST;
  const nested = nestedScript || nestedSelf;

  if (PROBES.length < MIN_PROBES || META.length < MIN_META || SELF.length < MIN_SELF) {
    console.log(`check-markdown self-test — ${PROBES.length} probes (floor ${MIN_PROBES}), ` +
      `${META.length} meta (floor ${MIN_META}), ${SELF.length} self (floor ${MIN_SELF}).`);
    console.log('  FAIL  a list is short, and `caught === length` is vacuous at zero.');
    if (!shared) rmSync(base, { recursive: true, force: true });
    return 1;
  }

  // **Both scripts under test are written into the fixture UNCONDITIONALLY, even
  // when they are the real ones.** The conditional form was a defect the author
  // found while trying to justify the sharing above: a `META` child writes its
  // broken copy into the SHARED fixture and never restores it, so the next child —
  // and in particular every `SELF` child, which runs after `META` and has no script
  // override of its own — would have run against the last `META` mutation still in
  // place. Both `SELF` entries happened to abort at `MIN_PROBES` before reaching a
  // probe, so they passed for the right reason by luck rather than by design.
  // Writing every time makes each child start from a known state and costs two file
  // writes.
  const scriptInTree = join(tree, 'scripts', 'check-markdown.mjs');
  writeFileSync(scriptInTree, readFileSync(script, 'utf8'));
  writeFileSync(join(tree, 'scripts', 'check-spec.mjs'),
    readFileSync(specScript ?? join(root, 'scripts', 'check-spec.mjs'), 'utf8'));

  /**
   * **One probe, run once**, shared by the main pass and by single-probe mode so the
   * two cannot drift. Returns the verdict rather than printing it.
   *
   * `ran` says whether the check under test PRINTED ITS HEADER. A mutant that throws
   * exits non-zero and reports nothing, which every grading here used to read as a
   * catch. `runs: 'spec'` is exempt, because the header it prints is `check-spec`'s.
   */
  const runOne = (probe) => {
    const target = join(tree, probe.file);
    const original = readFileSync(target, 'utf8');
    const mutated = probe.mutate(original);
    if (mutated === original) {
      return { refused: false, ran: false, msg: 'the mutation matched nothing' };
    }
    // **`removes` takes DIRECTORIES OUT OF THE FIXTURE**, which is the only way to
    // move the counts `M3` and `M4` bound. Every other probe edits one document's
    // text, so the file count and the link count could not be reached from here at
    // all — W25's adequacy reader replaced both floors with `if (false)` for 0.
    // Restored from the source tree afterwards rather than from memory.
    const removed = probe.removes ?? [];
    writeFileSync(target, mutated);
    let r;
    try {
      for (const d of removed) rmSync(join(tree, d), { recursive: true, force: true });
      r = probe.runs === 'spec'
        ? spawnSync(process.execPath, [join(tree, 'scripts', 'check-spec.mjs')],
          { cwd: tree, encoding: 'utf8', timeout: 300_000 })
        : spawnSync(process.execPath, [scriptInTree], { cwd: tree, encoding: 'utf8', timeout: 300_000 });
    } finally {
      for (const d of removed) cpSync(join(root, d), join(tree, d), { recursive: true });
      writeFileSync(target, original);
    }
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    const declared = probe.check === null ? [] : [probe.check, ...(probe.also ?? [])].sort();
    const tripped = trippedIn(out);
    // **AND the per-check REPORT ROWS, which are a second projection of the same
    // fact.** W25's adequacy reader found the row list counted from nothing: deleting
    // `'M1 every relative link resolves…'` from `checks` cost **0**, and a run with a
    // real dead link then printed two `ok` rows above an `M1:` failure. That is
    // [Q100](../doc/open-questions.md)'s class, and W24 answered it one item earlier
    // by requiring the two projections to agree — this file said it should meet that
    // standard and did not. `runs: 'spec'` is exempt: `check-spec.mjs` is not this
    // item's report to constrain.
    const rows = probe.runs === 'spec' ? null
      : [...out.matchAll(/^ {2}(ok {2}|FAIL) {2}(M\d+) /gm)].filter((m) => m[1] === 'FAIL')
        .map((m) => m[2]).sort();
    const agree = rows === null || rows.join(',') === tripped.join(',');
    // **An empty declared set means the run must be GREEN**, and both halves are
    // asserted: exit 0 AND nothing reported. Exit 0 alone would pass a run that
    // reported under an id this harness does not know.
    const refused = agree && (declared.length === 0
      ? (r.status === 0 && tripped.length === 0)
      : (r.status !== 0 && tripped.join(',') === declared.join(',')));
    return {
      refused, ran: RAN(out), declared, tripped, agree, status: r.status,
      msg: `exited ${r.status}, wanted [${declared.join(',')}], got [${tripped.join(',')}]` +
        `${agree ? '' : `, report rows said [${rows.join(',')}]`}`,
    };
  };

  /**
   * **Is the check under test INERT on the untouched fixture?** Rule 8 (b) asks for
   * a mutation that is *present but inert*, and until W28's readers nothing tested
   * it — the conformity reader then measured **six** entries here whose mutant fails
   * on the corpus by itself, five of them named against a `{}` probe that cannot be
   * caught whatever it edits.
   *
   * A mutant that fails on the repository's own documents is still NOTICED — by the
   * corpus, more strongly than by any probe — but its probe verdict is meaningless,
   * because every id it reports may be noise rather than detection. W25 celebrated
   * that as *"caught by the CORPUS rather than by a probe"*; this makes it a verdict
   * instead of a footnote.
   */
  const inertOnCleanFixture = (probe) => {
    const r = probe.runs === 'spec'
      ? spawnSync(process.execPath, [join(tree, 'scripts', 'check-spec.mjs')],
        { cwd: tree, encoding: 'utf8', timeout: 300_000 })
      : spawnSync(process.execPath, [scriptInTree], { cwd: tree, encoding: 'utf8', timeout: 300_000 });
    return r.status === 0;
  };

  // **Single-probe mode.** The META pass names ONE probe and this runs that one, in
  // place of re-running all 37 against every broken check — which is where both
  // halves of [Q138](../doc/open-questions.md) lived: the credit went to whichever
  // probe reacted first, and the pass cost a `PROBES.length` multiplier.
  const only = process.env.CHECK_MARKDOWN_PROBE;
  if (only !== undefined) {
    const probe = PROBES.find((p) => p.name === only);
    // **Aborts rather than passing or skipping.** A renamed probe leaves its META
    // entry pointing at nothing, and reading that as "no probe failed, so the check
    // must still be checking" is exactly backwards.
    if (!probe) {
      console.log(`  ABORT  no probe is named "${only}"`);
      if (!shared) rmSync(base, { recursive: true, force: true });
      return 3;
    }
    // **Inertness FIRST**, and a non-inert mutant short-circuits: its probe verdict
    // cannot discriminate, so running the probe would only produce a number the
    // parent must then ignore.
    const inert = inertOnCleanFixture(probe);
    console.log(`  inert: ${inert ? 'yes' : 'no'}`);
    if (!inert) {
      console.log('  outcome: corpus');
      if (!shared) rmSync(base, { recursive: true, force: true });
      return 1;
    }
    const v = runOne(probe);
    // **`outcome:` is the fact the parent grades on, and it exists because reading
    // the EXIT CODE cannot distinguish a detection from NOISE.** `refused` is
    // computed with full set equality here and was then collapsed to a boolean the
    // parent read as *uncaught* — so a mutant that left the named clause fully
    // detecting and added one unrelated failure was graded as a detection. Both of
    // W28's readers found it, from opposite directions: *the grading no longer reads
    // AN exit code, it reads ONE exit code.*
    const missing = v.declared.filter((id) => !v.tripped.includes(id));
    const outcome = v.refused ? 'caught'
      // The report contradicting the failure lines is a detection in its own right,
      // and it is the only thing that sees a mutation to the report — the set of ids
      // is unchanged, so no set comparison can.
      : !v.agree ? 'disagreed'
        // Right set, wrong exit path: the check found everything and told the shell
        // it was fine.
        : v.status === 0 && v.tripped.length ? 'exit0'
          : v.declared.length === 0 ? (v.tripped.length ? 'fires' : 'other')
            : missing.length ? 'disappeared'
              : v.tripped.length > v.declared.length ? 'noisy' : 'other';
    console.log(`  ran: ${v.ran ? 'yes' : 'no'}`);
    console.log(`  outcome: ${outcome}`);
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${(probe.check ?? '{}').padEnd(2)}  ${probe.name}` +
      (v.refused ? '' : `  — ${v.msg}`));
    if (!shared) rmSync(base, { recursive: true, force: true });
    return v.refused ? 0 : 1;
  }

  console.log(`check-markdown self-test — ${PROBES.length} probes\n`);
  let caught = 0;
  for (const probe of PROBES) {
    const v = runOne(probe);
    if (v.refused) caught++;
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${(probe.check ?? '{}').padEnd(2)}  ${probe.name}` +
      (v.refused ? '' : `  — ${v.msg}`));
    if (nested && !v.refused) break;
  }
  console.log(`\n${caught}/${PROBES.length} probes caught.`);
  if (caught !== PROBES.length) { if (!shared) rmSync(base, { recursive: true, force: true }); return 1; }
  // **A META child must grade nothing; a SELF child must go on to run META.** This
  // read `if (nested)` — both kinds — until W28, so **every `SELF` entry here
  // returned before the META pass and no mutation of `META` or of a grading could
  // ever be seen.** Four new SELF entries survived on exactly that, and all four
  // were about the grading. `check-source-selftest.mjs` had already learned this and
  // says so in place — *"a guard whose only effect is inside META is invisible to a
  // child that skips it"* — and the sibling did not inherit it, which is
  // [Q137](../doc/open-questions.md)'s shape a third time: a fix moves, its reason
  // does not.
  if (nestedScript) { if (!shared) rmSync(base, { recursive: true, force: true }); return 0; }

  // --- META: does this suite NOTICE a broken check? ---------------------------
  const checkSource = readFileSync(join(root, 'scripts', 'check-markdown.mjs'), 'utf8');
  const specSource = readFileSync(join(root, 'scripts', 'check-spec.mjs'), 'utf8');
  let noticed = 0, byCorpus = 0;
  console.log(`\nand against a broken check — ${META.length} mutations of the check itself\n`);
  /**
   * **Three verdicts where there was one**, and each says something different.
   *   3 — the named probe does not exist. A dangling reference, and NOT evidence
   *       about the check either way.
   *   1 — the named probe went uncaught: the entry did what it claims.
   *   0 — the named probe is STILL CAUGHT. Either the probes have a hole this entry
   *       cannot see, or the entry names the wrong probe. Both are findings, and
   *       neither may be closed by renaming the probe to whatever happens to fail.
   * `ran: no` means the mutant CRASHED rather than stopped checking.
   */
  const grade = (probeName, r) => {
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    const outcome = (out.match(/^ {2}outcome: (\w+)$/m) ?? [, ''])[1];
    if (r.status === 3) return { ok: false, why: ` — ${out.trim().split('\n').pop()}` };
    // Noticed by the corpus rather than by the named probe: true, stronger than a
    // probe, and not what the entry claims — so it is counted separately.
    if (outcome === 'corpus') return { ok: true, corpus: true, why: ' (by the corpus: the mutant is not inert)' };
    if (!/^ {2}ran: yes$/m.test(out)) return { ok: false, why: ' — the mutant did not run: this is a crash, not a detection' };
    if (outcome === 'caught') return { ok: false, why: ` — "${probeName}" is STILL CAUGHT against a check that does not check` };
    if (outcome === 'noisy') return { ok: false, why: ` — "${probeName}" still reports every id it declared; the mutant only got NOISIER, which is not a detection` };
    if (['disappeared', 'fires', 'disagreed', 'exit0'].includes(outcome)) return { ok: true, why: '' };
    return { ok: false, why: ` — the child reported outcome "${outcome || '(none)'}", which grades nothing` };
  };

  for (const [i, [name, probeName, mutate, which]] of META.entries()) {
    let broken, path;
    if (which === 'spec') {
      // The lift's wiring: the import stays and the call goes, which is the shape
      // a refactor produces and which leaves check-markdown entirely green.
      broken = specSource
        .replace("for (const d of linkResult.dead) fail('C5', d);", '')
        .replace("for (const d of linkResult.deadAnchors) fail('C5', d);", '');
      path = join(base, `.meta-spec-${i}.mjs`);
      if (broken === specSource) { console.log(`  FAIL  ${name} — the mutation matched nothing`); continue; }
      // check-spec derives ROOT from its own location, so the copy must sit one
      // directory below the repository root. dev-dist is gitignored; scripts/ is not.
      writeFileSync(path, broken);
      let v = { ok: false, why: '' };
      try {
        const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-markdown.mjs'), '--self-test'],
          { cwd: root, encoding: 'utf8', timeout: 900_000,
            env: { ...process.env, CHECK_MARKDOWN_SPEC_SCRIPT: path, CHECK_MARKDOWN_FIXTURE: tree,
              CHECK_MARKDOWN_PROBE: probeName } });
        v = grade(probeName, r);
      } finally { rmSync(path, { force: true }); }
      if (v.ok) noticed++;
      if (v.corpus) byCorpus++;
      console.log(`  ${v.ok ? 'ok  ' : 'FAIL'}  ${name}${v.why}`);
      continue;
    }
    broken = mutate(checkSource);
    if (broken === checkSource) { console.log(`  FAIL  ${name} — the mutation matched nothing`); continue; }
    path = join(base, `.meta-${String(i).padStart(2, '0')}.mjs`);
    writeFileSync(path, broken);
    let v = { ok: false, why: '' };
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-markdown.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 900_000,
          env: { ...process.env, CHECK_MARKDOWN_SCRIPT: path, CHECK_MARKDOWN_FIXTURE: tree,
            CHECK_MARKDOWN_PROBE: probeName } });
      v = grade(probeName, r);
    } finally { rmSync(path, { force: true }); }
    if (v.ok) noticed++;
    if (v.corpus) byCorpus++;
    console.log(`  ${v.ok ? 'ok  ' : 'FAIL'}  ${name}${v.why}`);
    // Same reason as the probe loop's break: a SELF child is read for its exit code
    // alone, so once a grading has failed the remaining spawns are waste. check-source
    // has had this since W24; this file did not, and its four new SELF children each
    // ran all 37 gradings to learn what the first one already said.
    if (nestedSelf && !v.ok) break;
  }
  // **Corpus-backed gradings are counted SEPARATELY**, because a bare "noticed"
  // hides how many entries no probe actually backs. W28's conformity reader measured
  // six of them here.
  console.log(`\n${noticed}/${META.length} noticed` +
    (byCorpus ? ` — ${noticed - byCorpus} by the named probe, ${byCorpus} by the corpus.` : '.'));
  if (noticed !== META.length) { if (!shared) rmSync(base, { recursive: true, force: true }); return 1; }
  // A SELF child has now run META, which is what it is for; it must not go on to
  // run SELF as well, or the recursion has no bottom.
  if (nestedSelf) { if (!shared) rmSync(base, { recursive: true, force: true }); return 0; }

  // --- SELF: does the probe LIST have a bound? --------------------------------
  const selfSource = readFileSync(join(root, 'scripts', 'check-markdown-selftest.mjs'), 'utf8');
  let bounded = 0;
  console.log(`\nand against a shortened probe list — ${SELF.length} mutations of this file\n`);
  for (const [i, [name, mutate]] of SELF.entries()) {
    const broken = mutate(selfSource);
    if (broken === selfSource) { console.log(`  FAIL  ${name} — the mutation matched nothing`); continue; }
    const path = join(base, `.self-${String(i).padStart(2, '0')}.mjs`);
    writeFileSync(path, broken);
    let ok = false, why = '';
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-markdown.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 900_000,
          env: { ...process.env, CHECK_MARKDOWN_SELFTEST: path, CHECK_MARKDOWN_FIXTURE: tree } });
      // **Non-zero AND the child's self-test actually ran.** `r.status !== 0` alone
      // let an entry pass by making this file a syntax error, measured by W28's
      // adequacy reader at a cost of 0 — and, in this file, by the child dying of
      // ENOENT before it graded anything, which is how all four of the entries W28
      // added scored BOUNDED on a crash.
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      ok = r.status !== 0 && SELF_RAN(out);
      if (r.status !== 0 && !ok) why = ' — the child never got as far as running: a broken file, not a fired floor';
    } finally { rmSync(path, { force: true }); }
    if (ok) bounded++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : (why || ' — the floor did not fire')}`);
  }
  if (!shared) rmSync(base, { recursive: true, force: true });
  console.log(`\n${bounded}/${SELF.length} bounded.`);
  return bounded === SELF.length ? 0 : 1;
}
