// **`lookup.mjs`'s tests — [W119](../doc/work-items/w119-the-lookup.md)'s Verification table, every row
// a hand-written fixture with its expected output written FROM THE FIXTURE, never from a run**
// (`doc/workflow.md` section 5 rules 1, 2 and 4).
//
//   node scripts/lookup.mjs --self-test          npm run lookup:selftest (gate:full, not gate)
//
// **Why here and not under `test/`** — W119's stop-and-ask 1, answered by the maintainer: `test/runner.ts`
// runs every `test/**/*.test.ts` under node, `deno run --allow-read` and a browser bundle, and none of
// the three can spawn the CLI or read a fixture tree; and `check-markdown` walks every `.md` outside
// `dev-dist/`, so fixture documents on disk would move `M3`-`M5`. **The fixtures are literals below,
// staged per process under `dev-dist/`**, and this file's name is the one `check-wiring`'s `G2` derives.
//
// Seven parts, each reported, and the exit is 0 only if all seven pass. READER and SELF, the META
// control, AGREE's floor and its order control arrived at W119's fix round, from its adequacy reader:
//
//   ENV       Node >= 24 — `doc/workflow.md` section 5 rule 8, the ENVIRONMENT asserted.
//   CASES     every fixture case: its exit code AND its whole stdout, compared exactly; an exit-2 case
//             also names what its stderr must say. **Every exit code is provoked**: 0, 1 (naming the
//             filter or id, and the hidden icebox count), and 2 for an unknown field in `--where` and
//             in `--fields`, an unparseable record and an empty folder.
//   GRADER    one case graded against a deliberately WRONG expectation must come back as a mismatch —
//             a grader that cannot fail passes everything.
//   META      each guard of `lookup.mjs` broken in a COPY, and the case named for it must go red —
//             rule 7 (b), each mutation asserted to change its input, and rule 8, the fix broken and
//             watched. The unknown-field guard is the first entry: an unknown field that returns 1 is
//             the founding defect the item exists to refuse. **A positive control runs first**: the
//             UNMUTATED copy, from where the mutants run, must pass every case they name.
//   READER    the adequacy reader's own `lookup.mjs` mutants, checked in at test/lookup/ — each must
//             turn SOME case red, with a floor on how many ran.
//   AGREE     `lookup.mjs`'s front-matter reader against `check-register.mjs`'s, on every question and
//             ADR file in the tree (a floor on how many) and on constructed inputs: both refuse or both
//             read, and what they read is equal field for field and in order. **Two controls must
//             disagree** — one field VALUE, one field ORDER.
//   SELF      every guard above provoked in turn, each required to fail the run for its own reason.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// --- the fixture tree -----------------------------------------------------------------------------

const Q = (id, title, status, cluster, owner, closes, resolvedBy, note, body = '') =>
  ['---', `id: ${id}`, `title: ${JSON.stringify(title)}`, `status: ${status}`,
    `cluster: ${JSON.stringify(cluster)}`, `owner: ${JSON.stringify(owner)}`, `closes-when: ${JSON.stringify(closes)}`,
    `resolved-by: ${JSON.stringify(resolvedBy)}`, `note: ${JSON.stringify(note)}`, 'raised-by: ""', 'shared: ""', '---', '']
    .join('\n') + body;

const BASE = {
  'doc/questions/README.md': '# Questions\n\n## Clusters\n\n| cluster | what it holds |\n|---|---|\n| The join | x |\n| Raised late | y |\n',
  'doc/questions/q1.md': Q('Q1', 'Where does routing execute?', 'resolved', 'Raised late', '', '', 'The driver', ''),
  'doc/questions/q2.md': Q('Q2', 'What does a join do with a `user_action` branch?', 'open', 'The join', 'W4', '', '', '- **half answered**'),
  'doc/questions/q3.md': Q('Q3', 'Could a `user_action` ever be retried by a join?', 'icebox', 'The join', 'no owner', '', '', 'a what-if'),
  'doc/questions/q17.md': Q('Q17', 'How does `user_action` surface at flow level?', 'deferred', 'The join', 'no owner', '', '',
    '**2026-08-31 — real, not now.**', 'Line one\nLine two\twith a tab\nBack\\slash and a CR\r\n'),
  'doc/questions/q170.md': Q('Q170', 'Does a decision see its own output?', 'open', 'Raised late', 'no owner', 'when W9 lands', '', ''),
  'doc/decisions/README.md': '# Decisions\n\nUse the template.\n',
  'doc/decisions/TEMPLATE.md': '---\nid: ADR ____\n---\n',
  'doc/decisions/0001-routing-is-in-the-driver.md': '---\nid: ADR 0001\ntitle: "Routing is in the driver"\nstatus: accepted\n' +
    'date: "2026-08-30"\nitem: W1\nraised-by: Q1\nsupersedes: ""\namends: ""\nresolves: ""\n---\n\n# ADR 0001 — Routing is in the driver\n',
  'doc/decisions/0002-routing-is-in-the-driver-and-a-gate-too.md': '---\nid: ADR 0002\ntitle: "Routing is in the driver, and a gate too"\n' +
    'status: accepted\ndate: "2026-09-01"\nitem: W2\nraised-by: Q2, P1\nsupersedes: ADR 0001 rule 2\namends: ""\nresolves: ""\n---\n\n' +
    '# ADR 0002 — Routing is in the driver, and a gate too\n',
  'doc/decisions/0003-a-later-one.md': '---\nid: ADR 0003\ntitle: "A later one"\nstatus: accepted\ndate: "2026-09-02"\nitem: W2\n' +
    'raised-by: W2\nsupersedes: ADR 0001 in part\namends: ""\nresolves: ""\n---\n\n# ADR 0003 — A later one\n',
  'doc/glossary.md': '# Glossary\n\n## PRODUCT\n\n| term | sense, in one line | defined at |\n|---|---|---|\n' +
    '| gate | the node kind that is a decision with memory | [spec/x.md](../spec/x.md#gate) |\n' +
    '| join | the node kind that closes a region | [spec/x.md](../spec/x.md#join) |\n\n' +
    '## PROCESS\n\n| term | sense, in one line | defined at |\n|---|---|---|\n' +
    '| gate | the command that runs the ladder | [ADR 0001](decisions/0001-routing-is-in-the-driver.md#decision) |\n' +
    '| vacuity floor | a minimum below which a check is vacuous | [workflow](workflow.md#5) |\n\n' +
    '## Not rows\n\n- *gate* is two senses here, and this list is not a table.\n',
  // The citing files. Q17 is cited from THREE files the walk reads and from two it must skip.
  'notes/a.md': 'Q17 and Q170 are different questions.\nSee ADRs 0001 and 0002.\nXQ1 is not an id.\nS2 is an upstream want.\n',
  // The third line cites ADR 0001 by its FILE NAME alone — no `ADR 0001` text on it, as the glossary's
  // link has — which is the only line in the tree where the file-name rule is the one that counts.
  'notes/b.md': '[Q17](../doc/questions/q17.md) is linked here.\n0001 alone is not a citation.\n' +
    '[the routing decision](../doc/decisions/0001-routing-is-in-the-driver.md) is.\n',
  // TWO lines here, so `refs-count` (files) is told from the sum of lines — the adequacy reader's D1.
  'src/c.ts': '// Q17: the third citing file\n// and Q17 again, on a second line\n',
  // The ADR citation forms the lists above do not carry: lower case, and the hyphen.
  'notes/c.md': 'see adr 0003 here\nsee ADR-0003 there\n',
  // A term's refs: whole word, either case — `gateway` is not `gate`.
  'notes/d.md': 'The gate opens.\nA gateway is not one.\nGATE again.\n',
  // The other directories the walk must skip, each citing Q17, and a binary file that does.
  '.git/notes.md': 'Q17 in the object store\n',
  '.claude/worktrees/a/copy.md': 'Q17 in a worktree copy\n',
  '.vscode/notes.md': 'Q17 in editor settings\n',
  'notes/bin.dat': 'Q17\u0000 a binary file\n',
  'dev-dist/old/copy.md': 'Q17 in a stale whole-tree copy\n',
  'node_modules/pkg/readme.md': 'Q17 in a dependency\n',
};

const HIDDEN1 = '# 1 icebox question(s) also matched and are hidden — add --include-icebox to see them\n';
const Q3_FRONT = 'id: Q3\ntitle: "Could a `user_action` ever be retried by a join?"\nstatus: icebox\ncluster: "The join"\n' +
  'owner: "no owner"\ncloses-when: ""\nresolved-by: ""\nnote: "a what-if"\nraised-by: ""\nshared: ""\n';
const Q17_FRONT = 'id: Q17\ntitle: "How does `user_action` surface at flow level?"\nstatus: deferred\ncluster: "The join"\n' +
  'owner: "no owner"\ncloses-when: ""\nresolved-by: ""\nnote: "**2026-08-31 — real, not now.**"\nraised-by: ""\nshared: ""\n';

/**
 * **The cases.** `out` is the WHOLE stdout, written from the fixture above by reading it, and `err` is
 * a substring stderr must carry. `tree` edits the base for one case.
 */
const CASES = [
  // Row 1: three questions match `user_action`, one of them icebox.
  { name: 'search: the default hides the icebox match AND SAYS SO', args: ['q', '--search', 'user_action'], exit: 0,
    out: 'Q2\topen\tWhat does a join do with a `user_action` branch?\nQ17\tdeferred\tHow does `user_action` surface at flow level?\n' + HIDDEN1 },
  { name: 'search: --include-icebox shows it', args: ['q', '--search', 'user_action', '--include-icebox'], exit: 0,
    out: 'Q2\topen\tWhat does a join do with a `user_action` branch?\nQ3\ticebox\tCould a `user_action` ever be retried by a join?\n' +
      'Q17\tdeferred\tHow does `user_action` surface at flow level?\n' },
  { name: '--where status=icebox shows it, and nothing is hidden', args: ['q', '--where', 'status=icebox'], exit: 0,
    out: 'Q3\ticebox\tCould a `user_action` ever be retried by a join?\n' },
  { name: 'by id, an icebox question is returned — its front matter as it stands', args: ['q', 'Q3'], exit: 0, out: Q3_FRONT },
  { name: 'only an icebox question matches: exit 1, the filter named, the hidden count said',
    args: ['q', '--search', 'retried'], exit: 1, out: '# no question matches --search "retried"\n' + HIDDEN1 },
  // Row 2: refs.
  { name: 'refs-count is 3: dev-dist/ and node_modules/ are skipped, the record`s own file is not a ref',
    args: ['q', 'Q17', '--fields', 'id,refs-count'], exit: 0, out: 'Q17\t3\n' },
  { name: 'refs prints paths with counts, joined, in path order', args: ['q', 'Q17', '--fields', 'refs'], exit: 0,
    out: 'notes/a.md:1,notes/b.md:1,src/c.ts:2\n' },
  { name: 'Q1 does not count a Q17 or Q170 citation — only the ADR naming it', args: ['q', 'Q1', '--fields', 'id,refs'], exit: 0,
    out: 'Q1\tdoc/decisions/0001-routing-is-in-the-driver.md:1\n' },
  { name: 'refs Q170 finds the one line naming it', args: ['refs', 'Q170'], exit: 0, out: 'notes/a.md\t1\n' },
  // Q505, resolved at W119: an S id is two namespaces, so its count is printed WITH a note saying so —
  // and only an S id's; `refs Q170` above is the case that carries no note.
  { name: 'refs S2 counts the token AND says the S namespace is shared', args: ['refs', 'S2'], exit: 0,
    out: "notes/a.md\t1\n# S ids are shared with check-source's clause ids (S1-S16); this count includes both — Q505\n" },
  { name: 'refs of an ADR: ADR NNNN in a field, the ADRs list form, the file name in a link — not a bare 0001',
    args: ['refs', '0001'], exit: 0,
    out: 'doc/decisions/0002-routing-is-in-the-driver-and-a-gate-too.md\t1\ndoc/decisions/0003-a-later-one.md\t1\n' +
      'doc/glossary.md\t1\nnotes/a.md\t1\nnotes/b.md\t1\n' },
  // Row 3: projection order.
  { name: '--fields status,id prints THAT order and no other field', args: ['q', '--where', 'cluster~JOIN', '--fields', 'status,id'], exit: 0,
    out: 'open\tQ2\ndeferred\tQ17\n' + HIDDEN1 },
  // Row 4: an unknown field is a 2, never a 1.
  { name: '--where colour=red: exit 2, naming the field', args: ['q', '--where', 'colour=red'], exit: 2, out: '', err: '`colour`' },
  { name: '--fields id,colour: exit 2, naming the field', args: ['q', '--fields', 'id,colour'], exit: 2, out: '', err: '`colour`' },
  { name: '--where on a DERIVED field is a 2', args: ['q', '--where', 'refs-count=3'], exit: 2, out: '', err: 'derived' },
  { name: 'an option the kind does not take is a 2', args: ['adr', '--include-icebox'], exit: 2, out: '', err: '--include-icebox' },
  // Row 5: a filter matching nothing.
  { name: 'a filter matching nothing: exit 1, naming the filter', args: ['q', '--where', 'cluster=The join', '--where', 'status=resolved'],
    exit: 1, out: '# no question matches --where cluster=The join --where status=resolved\n' },
  { name: 'an id matching nothing: exit 1, naming the id', args: ['q', 'Q99'], exit: 1, out: '# no question Q99\n' },
  { name: 'one id found and one not: exit 0, and the missing one named', args: ['q', 'Q17', 'Q99'], exit: 0,
    out: Q17_FRONT + '# not found: Q99\n' },
  // Row 6: an empty folder, and an unparseable record.
  { name: 'an empty questions folder is a 2', args: ['q', '--where', 'status=open'], exit: 2, out: '',
    err: 'doc/questions holds no question file',
    tree: (t) => Object.fromEntries(Object.entries(t).filter(([p]) => !/^doc\/questions\/q\d+\.md$/.test(p))) },
  { name: 'an unparseable record is a 2 naming its file', args: ['q', '--where', 'status=open'], exit: 2, out: '',
    err: 'doc/questions/q2.md', tree: (t) => ({ ...t, 'doc/questions/q2.md': t['doc/questions/q2.md'].replace('owner: "W4"', 'owner: null') }) },
  // Row 7: superseded-by is derived from the newer ADR alone.
  { name: 'superseded-by on the older ADR is derived from both newer ones', args: ['adr', '0001', '--fields', 'id,superseded-by'], exit: 0,
    out: 'ADR 0001\tADR 0002 (rule 2); ADR 0003 (in part)\n' },
  { name: 'and on a newer one that nothing supersedes it is empty', args: ['adr', 'ADR', '2', '--fields', 'superseded-by'], exit: 0, out: '\n' },
  { name: 'adr --index: title, supersedes, superseded by, raised-by / item (not twice), date',
    args: ['adr', '--index'], exit: 0,
    out: '| # | Decision | Raised by | Date |\n|---|---|---|---|\n' +
      '| [0001](0001-routing-is-in-the-driver.md) | Routing is in the driver — superseded by ADR 0002 (rule 2); ADR 0003 (in part) | Q1 / W1 | 2026-08-30 |\n' +
      '| [0002](0002-routing-is-in-the-driver-and-a-gate-too.md) | Routing is in the driver, and a gate too — supersedes ADR 0001 rule 2 | Q2, P1 / W2 | 2026-09-01 |\n' +
      '| [0003](0003-a-later-one.md) | A later one — supersedes ADR 0001 in part | W2 | 2026-09-02 |\n' },
  // Row 8: a term with two senses.
  { name: 'term gate prints both senses', args: ['term', 'gate'], exit: 0,
    out: 'term: gate\ndomain: PRODUCT\nsense: the node kind that is a decision with memory\ndefined-at: [spec/x.md](../spec/x.md#gate)\n\n' +
      'term: gate\ndomain: PROCESS\nsense: the command that runs the ladder\n' +
      'defined-at: [ADR 0001](decisions/0001-routing-is-in-the-driver.md#decision)\n' },
  { name: 'term matching is case-insensitive', args: ['term', 'GATE', '--fields', 'term,domain'], exit: 0, out: 'gate\tPRODUCT\ngate\tPROCESS\n' },
  { name: 'term floor is NOT vacuity floor: a term is matched whole', args: ['term', 'floor'], exit: 1,
    out: '# no term floor — a term is matched whole; --where term~floor matches inside one\n' },
  { name: 'and the substring form finds it', args: ['term', '--where', 'term~floor'], exit: 0,
    out: 'vacuity floor\tPROCESS\ta minimum below which a check is vacuous\n' },
  // The shapes: count, limit, json, escaping, the register table.
  { name: '--count', args: ['q', '--where', 'status=open', '--count'], exit: 0, out: '2\n' },
  { name: '--limit cuts AND SAYS SO, and the hidden note still follows', args: ['q', '--limit', '1'], exit: 0,
    out: 'Q1\tresolved\tWhere does routing execute?\n# 3 more not shown — raise --limit\n' + HIDDEN1 },
  // The body carries all four characters `esc` rewrites: newline, tab, backslash and carriage return.
  // (Until the adequacy reader, this case's name said "backslash" and its body had none.)
  { name: 'a body is one line: newline, tab and backslash escaped', args: ['q', 'Q17', '--fields', 'id,body'], exit: 0,
    out: 'Q17\tLine one\\nLine two\\twith a tab\\nBack\\\\slash and a CR\\r\\n\n' },
  { name: '--format json', args: ['q', 'Q17', '--fields', 'id,refs-count', '--format', 'json'], exit: 0,
    out: '{\n  "kind": "q",\n  "count": 1,\n  "hidden-icebox": 0,\n  "records": [\n    {\n      "id": "Q17",\n      "refs-count": 3\n    }\n  ]\n}\n' },
  { name: '--table: the status cell re-joined, a bold note re-opened before its word, rows by id',
    args: ['q', '--table'], exit: 0,
    out: '## Live\n\n### The join\n\n| Q | Question or finding | Status | Owner | Closes when |\n|---|---|---|---|---|\n' +
      '| Q2 | What does a join do with a `user_action` branch? | open - **half answered** | W4 |  |\n' +
      '| Q3 | Could a `user_action` ever be retried by a join? | icebox a what-if | no owner |  |\n' +
      '| Q17 | How does `user_action` surface at flow level? | **deferred 2026-08-31 — real, not now.** | no owner |  |\n\n' +
      '### Raised late\n\n| Q | Question or finding | Status | Owner | Closes when |\n|---|---|---|---|---|\n' +
      '| Q170 | Does a decision see its own output? | open | no owner | when W9 lands |\n\n' +
      '## Resolved\n\n| Q | Cluster | Question | What resolved it |\n|---|---|---|---|\n' +
      '| Q1 | Raised late | Where does routing execute? | The driver |\n' },
  { name: '--table takes no filter', args: ['q', '--table', '--where', 'status=open'], exit: 2, out: '', err: '--table' },
  ...ADEQUACY_CASES(),
];

/**
 * **The cases W119's ADEQUACY READER bought** — 52 of its 78 mutants of `lookup.mjs` survived the
 * first suite, each proved by an input whose output changed. Grouped by the clause of P28 decision 5 /
 * W119 Scope In each holds; every expected value is written from the fixture above and its edits here.
 */
function ADEQUACY_CASES() {
  const glossary = BASE['doc/glossary.md'];
  const q2 = BASE['doc/questions/q2.md'];
  const without = (t, re) => Object.fromEntries(Object.entries(t).filter(([p]) => !re.test(p)));
  const ADR4 = '---\nid: ADR 0004\ntitle: "An amendment"\nstatus: accepted\ndate: "2026-09-03"\nitem: W3\nraised-by: W3\n' +
    'supersedes: ""\namends: ADR 0002 rule 1\nresolves: ""\n---\n\n# ADR 0004 — An amendment\n';
  const json = (o) => `${JSON.stringify(o, null, 2)}\n`;
  return [
    // --- exit 2: the reading is broken (Scope In 4), every cause and every kind ---------------------
    { name: 'a glossary with no rows is a 2', args: ['term', 'gate'], exit: 2, out: '', err: 'holds no term row',
      tree: (t) => ({ ...t, 'doc/glossary.md': '# Glossary\n\n## PRODUCT\n\n| term | sense, in one line | defined at |\n|---|---|---|\n\n' +
        '## PROCESS\n\n| term | sense, in one line | defined at |\n|---|---|---|\n' }) },
    { name: 'a glossary row of two cells is a 2', args: ['term', 'gate'], exit: 2, out: '', err: 'not a three-cell row',
      tree: (t) => ({ ...t, 'doc/glossary.md': glossary.replace('|---|---|---|\n', '|---|---|---|\n| x | two cells |\n') }) },
    { name: 'a glossary header that is not the declared one is a 2', args: ['term', 'gate'], exit: 2, out: '', err: 'header row',
      tree: (t) => ({ ...t, 'doc/glossary.md': glossary.replace('| term | sense, in one line | defined at |', '| term | sense | defined at |') }) },
    { name: 'a question whose id is not its file name is a 2', args: ['q', 'Q2'], exit: 2, out: '', err: 'not Q2',
      tree: (t) => ({ ...t, 'doc/questions/q2.md': q2.replace('id: Q2\n', 'id: Q20\n') }) },
    { name: 'a question missing a field is a 2', args: ['q', 'Q2'], exit: 2, out: '', err: 'lacks shared',
      tree: (t) => ({ ...t, 'doc/questions/q2.md': q2.replace('shared: ""\n', '') }) },
    { name: 'a question carrying an undeclared field is a 2', args: ['q', 'Q2'], exit: 2, out: '', err: 'carries colour',
      tree: (t) => ({ ...t, 'doc/questions/q2.md': q2.replace('shared: ""\n', 'colour: red\nshared: ""\n') }) },
    { name: 'a missing questions folder is a 2', args: ['q', '--where', 'status=open'], exit: 2, out: '',
      err: 'doc/questions does not exist', tree: (t) => without(t, /^doc\/questions\//) },
    { name: 'an ADR missing a field is a 2', args: ['adr', '--count'], exit: 2, out: '', err: 'lacks resolves',
      tree: (t) => ({ ...t, 'doc/decisions/0003-a-later-one.md': t['doc/decisions/0003-a-later-one.md'].replace('resolves: ""\n', '') }) },
    { name: '--format xml is a 2', args: ['q', '--format', 'xml'], exit: 2, out: '', err: '--format' },
    { name: '--index takes no other option', args: ['adr', '--index', '--where', 'status=accepted'], exit: 2, out: '', err: '--index' },
    { name: 'refs takes no --where', args: ['refs', 'Q17', '--where', 'count=1'], exit: 2, out: '', err: 'takes no --where' },
    { name: 'refs takes no --search', args: ['refs', 'Q17', '--search', 'notes'], exit: 2, out: '', err: 'takes no --where' },
    // --- `=` is exact, `--search` reads every front matter field and not the body ------------------
    { name: '= is exact in case', args: ['q', '--where', 'status=OPEN'], exit: 1, out: '# no question matches --where status=OPEN\n' },
    { name: '= is exact in extent', args: ['q', '--where', 'title=Where does routing'], exit: 1,
      out: '# no question matches --where title=Where does routing\n' },
    { name: '--search is case-insensitive', args: ['q', '--search', 'WHERE'], exit: 0, out: 'Q1\tresolved\tWhere does routing execute?\n' },
    { name: '--search reads a field the list does not print (note)', args: ['q', '--search', 'half answered'], exit: 0,
      out: 'Q2\topen\tWhat does a join do with a `user_action` branch?\n' },
    { name: '--search reads owner', args: ['q', '--search', 'W4'], exit: 0, out: 'Q2\topen\tWhat does a join do with a `user_action` branch?\n' },
    { name: '--search does not read the body', args: ['q', '--search', 'Line two'], exit: 1, out: '# no question matches --search "Line two"\n' },
    // --- --where over every field of every kind ----------------------------------------------------
    { name: '--where reads shared', args: ['q', '--where', 'shared=', '--fields', 'id'], exit: 0, out: 'Q1\nQ2\nQ17\nQ170\n' + HIDDEN1 },
    { name: '--where reads owner', args: ['q', '--where', 'owner~W4', '--fields', 'id'], exit: 0, out: 'Q2\n' },
    { name: 'adr filters by --where', args: ['adr', '--where', 'raised-by~P1', '--fields', 'id'], exit: 0, out: 'ADR 0002\n' },
    // --- icebox: the hidden COUNT, in every shape --------------------------------------------------
    { name: 'the hidden count is the count — two hidden', args: ['q', '--search', 'user_action'], exit: 0,
      out: 'Q2\topen\tWhat does a join do with a `user_action` branch?\nQ17\tdeferred\tHow does `user_action` surface at flow level?\n' +
        '# 2 icebox question(s) also matched and are hidden — add --include-icebox to see them\n',
      tree: (t) => ({ ...t, 'doc/questions/q4.md': Q('Q4', 'Is `user_action` ever silent?', 'icebox', 'The join', 'no owner', '', '', 'a what-if too') }) },
    { name: 'json carries the hidden count', args: ['q', '--search', 'user_action', '--fields', 'id', '--format', 'json'], exit: 0,
      out: json({ kind: 'q', count: 2, 'hidden-icebox': 1, records: [{ id: 'Q2' }, { id: 'Q17' }] }) },
    { name: '--count counts what it shows and says what it hid', args: ['q', '--search', 'user_action', '--count'], exit: 0, out: '2\n' + HIDDEN1 },
    { name: 'status~ice still hides, and says so', args: ['q', '--where', 'status~ice'], exit: 1,
      out: '# no question matches --where status~ice\n' + HIDDEN1 },
    // The whole word through `~` too — the READER's I2 survived `status~ice`, because its mutation
    // dropped the `=` test and kept the value test: only `status~icebox` tells them apart.
    { name: 'status~icebox, the whole word through ~, still hides', args: ['q', '--where', 'status~icebox'], exit: 1,
      out: '# no question matches --where status~icebox\n' + HIDDEN1 },
    { name: 'an icebox question named by id is returned under a filter too', args: ['q', 'Q3', '--where', 'cluster~join', '--fields', 'id'],
      exit: 0, out: 'Q3\n' },
    // --- json and --count on no match, --limit, several ids ---------------------------------------
    { name: 'json on no match exits 1 and names it', args: ['q', 'Q99', '--format', 'json'], exit: 1,
      out: json({ kind: 'q', count: 0, 'hidden-icebox': 0, none: 'no question Q99', records: [] }) },
    { name: '--count on no match exits 1 and names the filter', args: ['q', '--where', 'status=nope', '--count'], exit: 1,
      out: '0\n# no question matches --where status=nope\n' },
    { name: '--count json on no match names the filter', args: ['q', '--where', 'status=nope', '--count', '--format', 'json'], exit: 1,
      out: `${JSON.stringify({ kind: 'q', count: 0, 'hidden-icebox': 0, none: 'no question matches --where status=nope' })}\n` },
    { name: 'json names the id not found', args: ['q', 'Q17', 'Q99', '--fields', 'id', '--format', 'json'], exit: 0,
      out: json({ kind: 'q', count: 1, 'hidden-icebox': 0, 'not-found': ['Q99'], records: [{ id: 'Q17' }] }) },
    { name: 'json says what --limit cut', args: ['q', '--limit', '1', '--fields', 'id', '--format', 'json'], exit: 0,
      out: json({ kind: 'q', count: 4, 'hidden-icebox': 1, 'not-shown': 3, records: [{ id: 'Q1' }] }) },
    { name: '--count counts every match whatever --limit says', args: ['q', '--count', '--limit', '1'], exit: 0, out: '4\n' + HIDDEN1 },
    { name: 'several ids, each returned', args: ['q', 'Q1', 'Q17', '--fields', 'id'], exit: 0, out: 'Q1\nQ17\n' },
    // --- defaults: a single ADR prints its front matter; json by id every field, in order ----------
    { name: 'adr by id prints its front matter and nothing derived', args: ['adr', '0001'], exit: 0,
      out: 'id: ADR 0001\ntitle: "Routing is in the driver"\nstatus: accepted\ndate: "2026-08-30"\nitem: W1\nraised-by: Q1\n' +
        'supersedes: ""\namends: ""\nresolves: ""\n' },
    { name: 'json by id carries every front matter field, in order', args: ['adr', '0003', '--format', 'json'], exit: 0,
      out: json({ kind: 'adr', count: 1, 'hidden-icebox': 0, records: [{ id: 'ADR 0003', title: 'A later one', status: 'accepted',
        date: '2026-09-02', item: 'W2', 'raised-by': 'W2', supersedes: 'ADR 0001 in part', amends: '', resolves: '' }] }) },
    { name: 'the adr list default is id, status, title', args: ['adr'], exit: 0,
      out: 'ADR 0001\taccepted\tRouting is in the driver\nADR 0002\taccepted\tRouting is in the driver, and a gate too\n' +
        'ADR 0003\taccepted\tA later one\n' },
    { name: 'json keeps the --fields order', args: ['q', 'Q1', '--fields', 'title,id', '--format', 'json'], exit: 0,
      out: json({ kind: 'q', count: 1, 'hidden-icebox': 0, records: [{ title: 'Where does routing execute?', id: 'Q1' }] }) },
    // --- refs: the ADR forms, a W id's own file, --limit, term refs ------------------------------
    { name: 'refs reads every id of an ADRs list, not only the first', args: ['refs', '0002'], exit: 0, out: 'notes/a.md\t1\n' },
    { name: 'refs reads adr in either case and ADR-NNNN with a hyphen', args: ['refs', '0003'], exit: 0, out: 'notes/c.md\t2\n' },
    { name: 'refs takes ADR NNNN as the id', args: ['refs', 'ADR', '0003'], exit: 0, out: 'notes/c.md\t2\n' },
    { name: 'refs takes ADR-NNNN as the id', args: ['refs', 'ADR-0003'], exit: 0, out: 'notes/c.md\t2\n' },
    { name: 'refs of a W id skips the item`s own file', args: ['refs', 'W4'], exit: 0, out: 'doc/questions/q2.md\t1\n',
      tree: (t) => ({ ...t, 'doc/work-items/w4-the-item.md': '# W4 — the item\n' }) },
    { name: 'refs honours --limit', args: ['refs', '0001', '--limit', '2'], exit: 0,
      out: 'doc/decisions/0002-routing-is-in-the-driver-and-a-gate-too.md\t1\ndoc/decisions/0003-a-later-one.md\t1\n' +
        '# 3 more not shown — raise --limit\n' },
    { name: 'a term`s refs are whole-word lines in either case, the glossary not among them', args: ['term', 'gate', '--fields', 'domain,refs'],
      exit: 0, out: 'PRODUCT\tdoc/decisions/0002-routing-is-in-the-driver-and-a-gate-too.md:2,notes/d.md:2\n' +
        'PROCESS\tdoc/decisions/0002-routing-is-in-the-driver-and-a-gate-too.md:2,notes/d.md:2\n' },
    // --- the glossary's escaped pipe; amends derives nothing --------------------------------------
    { name: 'an escaped pipe in a glossary cell reads as a pipe', args: ['term', 'a | b', '--fields', 'term,sense'], exit: 0,
      out: 'a | b\ta term with a pipe\n',
      tree: (t) => ({ ...t, 'doc/glossary.md': glossary.replace('| vacuity floor |', '| a \\| b | a term with a pipe | [w](workflow.md#5) |\n| vacuity floor |') }) },
    { name: 'amends derives no superseded-by', args: ['adr', '0002', '--fields', 'id,superseded-by'], exit: 0, out: 'ADR 0002\t\n',
      tree: (t) => ({ ...t, 'doc/decisions/0004-an-amendment.md': ADR4 }) },
    { name: '--index renders amends', args: ['adr', '--index'], exit: 0,
      out: '| # | Decision | Raised by | Date |\n|---|---|---|---|\n' +
        '| [0001](0001-routing-is-in-the-driver.md) | Routing is in the driver — superseded by ADR 0002 (rule 2); ADR 0003 (in part) | Q1 / W1 | 2026-08-30 |\n' +
        '| [0002](0002-routing-is-in-the-driver-and-a-gate-too.md) | Routing is in the driver, and a gate too — supersedes ADR 0001 rule 2 | Q2, P1 / W2 | 2026-09-01 |\n' +
        '| [0003](0003-a-later-one.md) | A later one — supersedes ADR 0001 in part | W2 | 2026-09-02 |\n' +
        '| [0004](0004-an-amendment.md) | An amendment — amends ADR 0002 rule 1 | W3 | 2026-09-03 |\n',
      tree: (t) => ({ ...t, 'doc/decisions/0004-an-amendment.md': ADR4 }) },
  ];
}

/**
 * **META — each guard broken in a COPY of `lookup.mjs`, and the case named for it must go red.** Each
 * `from` must occur exactly once in the source, or the entry fails on its own: a mutation that matches
 * nothing proves nothing.
 */
const META = [
  ['the unknown-field guard in --where', "    if (!kind.fields.includes(w.field)) broken(", '    if (false) broken(',
    '--where colour=red: exit 2, naming the field'],
  ['the unknown-field guard in --fields', '      if (!kind.fields.includes(f) && !kind.derived.includes(f)) {', '      if (false) {',
    '--fields id,colour: exit 2, naming the field'],
  ['the derived-field guard in --where', '    if (kind.derived.includes(w.field)) broken(', '    if (false) broken(',
    '--where on a DERIVED field is a 2'],
  ['the empty-folder guard', '  if (out.length === 0) broken(`${dirRel} holds no', '  if (false) broken(`${dirRel} holds no',
    'an empty questions folder is a 2'],
  ['the YAML-typed-word guard of the reader', ' || YAML_TYPED.test(v)) {', ') {', 'an unparseable record is a 2 naming its file'],
  ['icebox hidden from a search', "  if (kindName === 'q' && !ids.length && !seeking) {", '  if (false) {',
    'search: the default hides the icebox match AND SAYS SO'],
  ['icebox returned by id', "  if (kindName === 'q' && !ids.length && !seeking) {", "  if (kindName === 'q' && !seeking) {",
    'by id, an icebox question is returned — its front matter as it stands'],
  ['the hidden count on an empty answer', "  const hiddenNote = hidden ? `# ${hidden} icebox", '  const hiddenNote = false ? `# ${hidden} icebox',
    'only an icebox question matches: exit 1, the filter named, the hidden count said'],
  ['exit 1 on no match', '  if (lines.length) console.log(lines.join(\'\\n\'));\n  return total ? 0 : 1;',
    '  if (lines.length) console.log(lines.join(\'\\n\'));\n  return 0;', 'a filter matching nothing: exit 1, naming the filter'],
  // **The right boundary is held TWICE** — greedy digits and the `(?![0-9])` lookahead — so deleting the
  // lookahead alone changes nothing (measured: this entry's first version survived). The mutation that
  // breaks the rule takes both: a lazy quantifier with no lookahead reads `Q1` inside `Q17`.
  ['the id token`s right boundary', '([1-9][0-9]*)(?![0-9])/g', '([1-9][0-9]*?)/g',
    'Q1 does not count a Q17 or Q170 citation — only the ADR naming it'],
  ['the id token`s left boundary', '/(?<![A-Za-z0-9_])([QWPS])', '/([QWPS])',
    'Q1 does not count a Q17 or Q170 citation — only the ADR naming it'],
  // The anchor is spelled in halves: whole, it would be a scratch-path site `check-wiring`'s `G6` reads.
  ['the dev-dist skip', " || name === '" + 'dev-' + "dist' ||", ' ||',
    'refs-count is 3: dev-dist/ and node_modules/ are skipped, the record`s own file is not a ref'],
  ['the record`s own file excluded from its refs', '.filter(([p]) => p !== own)', '.filter(() => true)',
    'refs-count is 3: dev-dist/ and node_modules/ are skipped, the record`s own file is not a ref'],
  ['the ADR file-name citation', '        if (id) ids.add(id);', '        if (false) ids.add(id);',
    'refs of an ADR: ADR NNNN in a field, the ADRs list form, the file name in a link — not a bare 0001'],
  ['superseded-by derived', "  for (const a of adrs) a['superseded-by'] = (by.get(a.id) ?? []).join('; ');",
    "  for (const a of adrs) a['superseded-by'] = '';", 'superseded-by on the older ADR is derived from both newer ones'],
  ['term matching case-insensitive', "    const want = ids.map((i) => (kindName === 'term' ? i.toLowerCase() : i));",
    '    const want = ids;', 'term matching is case-insensitive'],
  ['the newline escape', ".replace(/\\n/g, '\\\\n')", '', 'a body is one line: newline, tab and backslash escaped'],
  ['the bold status cell re-opened', "q.note.startsWith('**') ? `**${q.status} ${q.note.slice(2)}`",
    "false ? ''", '--table: the status cell re-joined, a bold note re-opened before its word, rows by id'],
  ['the S-namespace note on an S id (Q505)', '  if (sharedNote) lines.push(sharedNote);', '',
    'refs S2 counts the token AND says the S namespace is shared'],
  ['the S-namespace note narrowed to S ids', "kindName === 'refs' && /^S\\d+$/.test(ids[0])", "kindName === 'refs'",
    'refs Q170 finds the one line naming it'],
  ['the projection order','    for (const r of shown) lines.push(fields.map(', '    for (const r of shown) lines.push([...fields].sort().map(',
    '--fields status,id prints THAT order and no other field'],
];

// --- the harness ----------------------------------------------------------------------------------

/**
 * **The adequacy reader's own mutants, checked in** — `test/lookup/adequacy-mutants.json`, its exact
 * edits as it ran them (`doc/workflow.md` section 5 rule 8: the set is re-run after acting on the
 * readers, *with their exact edits checked back in*). READER applies every `lookup.mjs` entry that is
 * not EQUIVALENT and requires SOME case to go red. The `H` entries are mutants of THIS file; SELF below
 * holds each clause they weakened by provocation, so they are not re-applied here.
 */
const MUTANTS = join('test', 'lookup', 'adequacy-mutants.json');
/** READER's floor: the reader's 78 `lookup.mjs` mutants less its two EQUIVALENT ones. */
const READER_FLOOR = 76;
/**
 * **AGREE's floor on its tree corpus**: 383 questions — `check-register`'s `R5` floor, which only moves
 * up — and the 47 ADRs W117 migrated, none ever deleted. The adequacy reader's H16: with no floor,
 * AGREE reading ZERO tree files printed `52/52 agree`.
 */
const AGREE_FLOOR = 430;

const writeTree = (dir, tree) => {
  rmSync(dir, { recursive: true, force: true });
  for (const [rel, text] of Object.entries(tree)) {
    const p = join(dir, ...rel.split('/'));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};

/** One staged tree per distinct fixture: the base, and one per case that edits it. */
function stageTrees(dir, cases) {
  const trees = new Map();
  for (const c of cases) {
    const key = c.tree ? c.name : '';
    if (trees.has(key)) continue;
    const at = join(dir, `fx-${trees.size}`);
    writeTree(at, c.tree ? c.tree(BASE) : BASE);
    trees.set(key, at);
  }
  return trees;
}
const treeOf = (trees, c) => trees.get(c.tree ? c.name : '');

function runCase(lookup, dir, c) {
  const r = spawnSync(process.execPath, [lookup, ...c.args], {
    encoding: 'utf8', timeout: 60_000, env: { ...process.env, LOOKUP_ROOT: dir },
  });
  return { exit: r.status, out: r.stdout ?? '', err: r.stderr ?? '' };
}

/** A case's verdict against what it got: `null` when it matches, else the reason. */
function grade(c, got) {
  if (got.exit !== c.exit) return `exited ${got.exit}, wanted ${c.exit}${got.err ? ` — stderr: ${got.err.trim().split('\n')[0]}` : ''}`;
  if (got.out !== c.out) return `stdout differs:\n      got    ${JSON.stringify(got.out)}\n      wanted ${JSON.stringify(c.out)}`;
  if (c.err && !got.err.includes(c.err)) return `stderr does not carry ${JSON.stringify(c.err)}: ${JSON.stringify(got.err.trim())}`;
  if (!c.err && got.err !== '') return `stderr is not empty: ${JSON.stringify(got.err.trim())}`;
  return null;
}

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

/**
 * **One entry point, and `opts` is how SELF provokes it.** The gate passes nothing: every section runs
 * against `scripts/lookup.mjs` and the real tree, and the return is the exit code. SELF re-enters with
 * `nested` and one provocation, and reads back `{ code, lines }`.
 *
 *   sections     which of cases, grader, meta, reader, agree run (default: all, then SELF)
 *   target       the lookup to test (default scripts/lookup.mjs)
 *   extraCases / casesFilter / graderSame / metaOnly / mutants / agreeDirs / agreeSame / agreeExtra
 *                one provocation each — see SELF
 */
export async function selfTest(root, opts = {}) {
  const nested = Boolean(opts.nested);
  const lines = [];
  const say = (line) => { lines.push(line); if (!opts.quiet) console.log(line); };
  const finish = (code) => (nested ? { code, lines } : code);
  let ok = true;
  const on = (s) => !opts.sections || opts.sections.includes(s);
  const lookup = opts.target ?? join(root, 'scripts', 'lookup.mjs');
  const before = sha(lookup);
  const stage = opts.stage ?? join(root, 'dev-dist', `w119-lookup-selftest-${process.pid}`);
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });
  if (!nested) process.on('exit', () => rmSync(stage, { recursive: true, force: true }));
  const cases = (opts.casesFilter ? CASES.filter(opts.casesFilter) : CASES).concat(opts.extraCases ?? []);

  // ENV
  const major = Number(process.versions.node.split('.')[0]);
  say(`lookup self-test — node ${process.versions.node}, ${cases.length} cases, ${META.length} META entries`);
  if (major < 24) { say(`  FAIL  ENV  node ${process.versions.node} is not >= 24 — run \`fnm use 24\``); return finish(1); }
  const trees = stageTrees(join(stage, 'fx'), cases);

  // CASES
  if (on('cases')) {
    const bad = [];
    for (const c of cases) {
      const why = grade(c, runCase(lookup, treeOf(trees, c), c));
      if (why) { bad.push(c); say(`  FAIL  CASE  ${c.name}\n      ${why}`); }
    }
    if (bad.length) ok = false;
    say(`  ${bad.length ? 'FAIL' : 'ok  '}  CASES ${cases.length - bad.length}/${cases.length} as written`);
    const exits = new Set(cases.map((c) => c.exit));
    if (![0, 1, 2].every((e) => exits.has(e))) { ok = false; say('  FAIL  CASES do not provoke all three exit codes'); }
  }

  // GRADER — the first case, its expectation made wrong by one byte, must be graded a mismatch.
  if (on('grader')) {
    const first = cases[0];
    const control = { ...first, out: opts.graderSame ? first.out : first.out.replace('Q17', 'Q18') };
    const why = grade(control, runCase(lookup, treeOf(trees, first), first));
    if (control.out === first.out || !why) { ok = false; say('  FAIL  GRADER a wrong expectation was graded a match'); }
    else say('  ok    GRADER a wrong expectation is graded a mismatch');
  }

  const src = readFileSync(lookup, 'utf8');
  const mutDir = join(stage, 'meta');
  mkdirSync(mutDir, { recursive: true });
  const mutFile = join(mutDir, 'lookup.mjs');
  const fails = (source, c) => { writeFileSync(mutFile, source); return grade(c, runCase(mutFile, treeOf(trees, c), c)) !== null; };

  // META — and FIRST its positive control: the UNMUTATED source, run from where the mutants run, must
  // pass every case they name. Without it a copy that cannot even LOAD there fails every case, and that
  // read as 21/21 noticed (the adequacy reader's H6 and H7).
  if (on('meta')) {
    const meta = opts.metaOnly ?? META;
    const named = [...new Set(meta.map((m) => m[3]))].map((n) => cases.find((c) => c.name === n)).filter(Boolean);
    const broke = named.filter((c) => fails(src, c));
    if (broke.length) {
      ok = false;
      say(`  FAIL  META CONTROL the unmutated lookup fails ${broke.length} named case(s) from the META location — ` +
        `"${broke[0].name}" — so every mutant would read as noticed; META not run`);
    } else {
      let noticed = 0;
      for (const [label, from, to, caseName] of meta) {
        const c = cases.find((x) => x.name === caseName);
        const n = src.split(from).length - 1;
        if (!c || n !== 1) {
          ok = false;
          say(`  FAIL  META  ${label}: ${!c ? `names no case "${caseName}"` : `its edit matches ${n} places, not 1`}`);
          continue;
        }
        if (fails(src.replace(from, () => to), c)) noticed++;
        else { ok = false; say(`  FAIL  META  ${label}: broken, and "${caseName}" still passed`); }
      }
      say(`  ${noticed === meta.length ? 'ok  ' : 'FAIL'}  META ${noticed}/${meta.length} noticed by the named case, ` +
        `after a control of ${named.length} case(s) the unmutated copy passes there`);
    }
  }

  // READER — the adequacy reader's exact edits, each required to turn SOME case red.
  if (on('reader')) {
    const all = opts.mutants ?? JSON.parse(readFileSync(join(root, MUTANTS), 'utf8'));
    const mine = all.filter((m) => !/^H/.test(m.id) && m.file === 'scripts/lookup.mjs');
    const run = mine.filter((m) => m.verdict !== 'EQUIVALENT');
    let caught = 0;
    for (const m of run) {
      const n = src.split(m.from).length - 1;
      if (n !== 1) { ok = false; say(`  FAIL  READER ${m.id}: its edit matches ${n} places, not 1 — re-anchor it, never drop it`); continue; }
      const mutant = src.replace(m.from, () => m.to);
      if (cases.some((c) => fails(mutant, c))) caught++;
      else { ok = false; say(`  FAIL  READER ${m.id} SURVIVES (${m.clause})`); }
    }
    const floor = opts.mutants ? 0 : READER_FLOOR;
    if (run.length < floor) { ok = false; say(`  FAIL  READER ran ${run.length} mutant(s), under the floor of ${floor}`); }
    say(`  ${caught === run.length && run.length >= floor ? 'ok  ' : 'FAIL'}  READER ${caught}/${run.length} of the adequacy ` +
      `reader's lookup mutants caught; ${mine.length - run.length} EQUIVALENT by its argument, not run`);
  }

  // AGREE
  if (on('agree')) ok = agree(root, stage, say, opts) && ok;

  // SELF — each harness guard, provoked, must fail the run FOR ITS OWN REASON.
  if (!nested && on('self')) ok = (await selfProbes(root, stage, say, src)) && ok;

  if (sha(lookup) !== before) { ok = false; say('  FAIL  the lookup changed while its self-test ran — THE TREE MOVED'); }
  if (!nested) say(ok ? '\nlookup self-test passed.' : '\nlookup self-test FAILED.');
  return finish(ok ? 0 : 1);
}

/**
 * **SELF — the harness's own guards, each provoked** (the adequacy reader's harness mutants H4-H16).
 * Each row re-enters `selfTest` with ONE provocation and the sections it needs, and requires the run to
 * return 1 AND to print that guard's own failure line — a provocation is evidence only when it fires
 * for the reason it names (`doc/workflow.md` section 5 rule 8). **The one thing no SELF row can hold**
 * is the last line of `selfTest` itself: a harness whose final return is forced to 0 returns 0 here too.
 * That is the adequacy reader's H12, and `check-wiring`'s `G1` holds only that the dispatch routes.
 */
async function selfProbes(root, stage, say, src) {
  const nameOf = (i) => CASES[i].name;
  const noOp = ['SELF a mutation that changes no behaviour', '// --- arguments', '// --- the arguments', nameOf(0)];
  // A lookup that loads where it is and NOT from the META location: H7, a real relative import.
  const target = join(stage, 'self-target', 'scripts', 'lookup.mjs');
  mkdirSync(dirname(target), { recursive: true });
  const nl = src.indexOf('\n');
  writeFileSync(target, `${src.slice(0, nl + 1)}import './helper.mjs';\n${src.slice(nl + 1)}`);
  writeFileSync(join(dirname(target), 'helper.mjs'), 'export {};\n');
  const SELF = [
    ['a case written wrong fails the run', { sections: ['cases'], extraCases: [{ name: 'SELF a case written wrong',
      args: ['q', 'Q1', '--fields', 'id'], exit: 0, out: 'Q2\n' }] }, 'FAIL  CASE  SELF a case written wrong'],
    ['the three exit codes are required', { sections: ['cases'], casesFilter: (c) => c.exit !== 2 }, 'CASES do not provoke all three exit codes'],
    ['the GRADER perturbation must change the expectation', { sections: ['grader'], graderSame: true }, 'GRADER a wrong expectation was graded a match'],
    ['a META survivor fails the run', { sections: ['meta'], metaOnly: [noOp] }, 'still passed'],
    ['a META anchor must match exactly once', { sections: ['meta'], metaOnly: [['SELF an anchor in no file',
      'THIS TEXT IS IN NO FILE', 'x', nameOf(0)]] }, 'matches 0 places, not 1'],
    ['META`s positive control', { sections: ['meta'], target, metaOnly: [META[0]] }, 'FAIL  META CONTROL'],
    ['a surviving reader mutant fails the run', { sections: ['reader'], mutants: [{ id: 'SELF', file: 'scripts/lookup.mjs',
      from: noOp[1], to: noOp[2], verdict: 'SURVIVED', clause: 'none — a comment' }] }, 'READER SELF SURVIVES'],
    ['AGREE has a floor on its tree corpus', { sections: ['agree'], agreeDirs: [] }, 'under the floor of'],
    ['AGREE`s value control must differ', { sections: ['agree'], agreeSame: 'value' }, 'the value control came back equal'],
    ['AGREE`s order control must differ', { sections: ['agree'], agreeSame: 'order' }, 'the order control came back equal'],
    ['a disagreement fails AGREE', { sections: ['agree'], agreeExtra: [{ name: 'SELF a disagreement',
      text: '---\nid: Q1\n---\n', other: '---\nid: Q2\n---\n' }] }, 'FAIL  AGREE SELF a disagreement'],
  ];
  let held = 0;
  for (const [i, [label, prov, want]] of SELF.entries()) {
    const r = await selfTest(root, { ...prov, nested: true, quiet: true, stage: join(stage, 'self', String(i)) });
    if (r.code === 1 && r.lines.some((l) => l.includes(want))) held++;
    else say(`  FAIL  SELF  ${label}: returned ${r.code}${r.lines.some((l) => l.includes(want)) ? '' : `, never printing "${want}"`}`);
  }
  say(`  ${held === SELF.length ? 'ok  ' : 'FAIL'}  SELF ${held}/${SELF.length} harness guards fire, each for its own reason`);
  return held === SELF.length;
}

/**
 * **The two readers, compared** — W119's stop-and-ask 3. `check-register.mjs` runs its check when
 * imported, so the comparison runs in a CHILD, which imports both readers, reads the inputs from a JSON
 * file and writes its results to another; nothing passes through the child's stdout, which carries the
 * register check's report. **Two controls must come back as differences** — one field VALUE and one
 * field ORDER (the adequacy reader's H9: order was compared by nothing) — and the tree corpus has a floor.
 */
function agree(root, stage, say, opts) {
  const texts = [];
  const dirs = opts.agreeDirs ?? [['doc/questions', /^q\d+\.md$/], ['doc/decisions', /^\d{4}-.*\.md$/]];
  for (const [dirRel, re] of dirs) {
    const dir = join(root, ...dirRel.split('/'));
    for (const n of readdirSync(dir).filter((x) => re.test(x)).sort()) texts.push({ name: `${dirRel}/${n}`, text: readFileSync(join(dir, n), 'utf8') });
  }
  const corpusCount = texts.length;
  const one = (line) => `---\nid: Q1\n${line}\n---\n`;
  for (const line of ['title: plain words', 'title: ""', 'title: ', 'title:  padded', 'title: padded ', "title: 'single'",
    'title: [x]', 'title: {x}', 'title: a #c', 'title: a: b', 'title: a\t#c', 'title: W1:', 'title: ? x', 'title: ?', 'title: ?x',
    'title: null', 'title: ~', 'title: true', 'title: yes', 'title: On', 'title: 123', 'title: 1.5', 'title: 0x1F', 'title: +0x1F',
    'title: 0b101', 'title: 1:30', 'title: 190:20:30.15', 'title: 2026-10-04', 'title: 2026-1-4 1:02:03', 'title: "2026-10-04"',
    'title: "bad', 'title: "a\\"b"', 'title: "x" trailing', 'title: 123abc', 'title: -x', 'title: *x', 'title: %x', 'title: x y z',
    'Title: x', 'title x', 'title:x', 'id: Q2', 'two-part: a-b', 'title: .inf', 'title: x:y']) {
    texts.push({ name: `constructed ${JSON.stringify(line)}`, text: one(line) });
  }
  for (const [name, text] of [['no opening line', 'id: Q1\n---\n'], ['no closing line', '---\nid: Q1\n'],
    ['closing at end of file', '---\nid: Q1\n---'], ['CRLF', '---\r\nid: Q1\r\n---\r\n'], ['a BOM', '﻿---\nid: Q1\n---\n'],
    ['a body after', '---\nid: Q1\n---\nbody\n'], ['an empty block', '---\n---\n']]) {
    texts.push({ name: `constructed ${name}`, text });
  }
  for (const x of opts.agreeExtra ?? []) texts.push(x);
  // The CONTROLS: each input's two sides differ by one thing, and each must be a difference.
  const valueText = one('title: left');
  const orderText = '---\nid: Q1\ntitle: left\n---\n';
  const CONTROLS = {
    'CONTROL value — the lookup side reads a different title': ['value', valueText, opts.agreeSame === 'value' ? valueText : one('title: right')],
    'CONTROL order — the lookup side reads the same fields in another order': ['order', orderText,
      opts.agreeSame === 'order' ? orderText : '---\ntitle: left\nid: Q1\n---\n'],
  };
  for (const [name, [, text, other]] of Object.entries(CONTROLS)) texts.push({ name, text, other });

  const inFile = join(stage, 'agree-in.json');
  const outFile = join(stage, 'agree-out.json');
  writeFileSync(inFile, JSON.stringify(texts));
  const child = [
    `const reg = await import(${JSON.stringify(pathToFileURL(join(root, 'scripts', 'check-register.mjs')).href)});`,
    `const look = await import(${JSON.stringify(pathToFileURL(join(root, 'scripts', 'lookup.mjs')).href)});`,
    "const fs = await import('node:fs');",
    `const texts = JSON.parse(fs.readFileSync(${JSON.stringify(inFile)}, 'utf8'));`,
    'const view = (r) => (r.error ? { error: true } : { fields: r.fields, order: r.order });',
    'const out = texts.map((t) => ({ name: t.name, reg: view(reg.readFrontMatter(t.text)), look: view(look.readRecord(t.other ?? t.text)) }));',
    `fs.writeFileSync(${JSON.stringify(outFile)}, JSON.stringify(out));`,
  ].join(' ');
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', child], {
    cwd: root, encoding: 'utf8', timeout: 120_000, env: { ...process.env, CHECK_REGISTER_ROOT: '' },
  });
  if (r.status !== 0 || !existsSync(outFile)) {
    say(`  FAIL  AGREE the child exited ${r.status} and wrote no result — importing check-register.mjs runs the register ` +
      `check, and a red register stops it: ${(r.stderr || r.stdout || '').trim().split('\n').slice(-2).join(' | ')}`);
    return false;
  }
  const res = JSON.parse(readFileSync(outFile, 'utf8'));
  const differs = (x) => JSON.stringify(x.reg) !== JSON.stringify(x.look);
  const real = res.filter((x) => !(x.name in CONTROLS) && differs(x));
  const refusedBoth = res.filter((x) => x.reg.error && x.look.error).length;
  let ok = true;
  for (const x of real) { ok = false; say(`  FAIL  AGREE ${x.name}: check-register ${JSON.stringify(x.reg)} / lookup ${JSON.stringify(x.look)}`); }
  for (const [name, [kind]] of Object.entries(CONTROLS)) {
    if (!differs(res.find((x) => x.name === name))) { ok = false; say(`  FAIL  AGREE the ${kind} control came back equal — the comparison cannot see that difference`); }
  }
  if (corpusCount < AGREE_FLOOR) { ok = false; say(`  FAIL  AGREE read ${corpusCount} tree file(s), under the floor of ${AGREE_FLOOR}`); }
  const compared = res.length - Object.keys(CONTROLS).length;
  say(`  ${ok ? 'ok  ' : 'FAIL'}  AGREE ${compared - real.length}/${compared} agree — ${corpusCount} tree files (floor ${AGREE_FLOOR}) and ` +
    `${compared - corpusCount} constructed inputs, ${refusedBoth} refused by both; both controls are differences`);
  return ok;
}
