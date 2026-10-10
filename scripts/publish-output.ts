// Parsing and path maths for `deno publish --dry-run`'s file list — W152 Outputs (10).
//
// Adopted from fyflow-scheduler's `scripts/publishOutput.ts`, which was split out of its smoke test
// so it could be tested, after an inline version broke on Linux in two ways at once: a regex that
// captured after the third slash of `file:///` (right for `file:///C:/...`, wrong for
// `file:///home/...`), and a drive-letter root computation that did not match on Linux, so every
// staged path lost a character (`README.md` became `EADME.md`). Development here is on Windows and
// CI is Linux, which is the same arrangement that hid it there.
//
// **Two differences from the scheduler's file, each forced by this package:**
//
//   1. **No `jsr:@std/path` import.** `deno.lock` is tracked here and W152 does not own it; a `jsr:`
//      import in a script would rewrite it on the first run. The two path implementations are
//      written out below instead — small, and each one is exercised by the tests on any host.
//   2. **This package HAS dependencies** — `fyflow-scheduler` and `jsonata` (ADR 0048, ADR 0052),
//      reached by bare specifier through `deno.json`'s `imports`. So `externalImports` reports every
//      non-relative specifier, and the smoke test compares that set to the declared `imports` keys
//      rather than requiring it empty.

/** The slice of a path module this file needs, so a test can hand in either platform's. */
export interface PathApi {
  fromFileUrl(url: string): string;
  relative(from: string, to: string): string;
  join(...parts: string[]): string;
}

export interface StagedFile {
  /** Absolute path of the file as it exists in the repository. */
  source: string;
  /** Absolute path it is copied to inside the staging directory. */
  target: string;
}

const trimSlashes = (s: string, sep: string) => s.endsWith(sep) && s.length > 1 ? s.slice(0, -1) : s;

function makePath(sep: '/' | '\\', fromFileUrl: (url: string) => string, caseInsensitive: boolean): PathApi {
  const split = (p: string) => p.split(/[\\/]/).filter((s) => s !== '');
  const norm = (s: string) => caseInsensitive ? s.toLowerCase() : s;
  return {
    fromFileUrl,
    join(...parts: string[]): string {
      const out = parts.filter((p) => p !== '').join(sep).replace(sep === '/' ? /\/+/g : /[\\/]+/g, sep);
      return trimSlashes(out, sep);
    },
    relative(from: string, to: string): string {
      const a = split(from);
      const b = split(to);
      let i = 0;
      while (i < a.length && i < b.length && norm(a[i]) === norm(b[i])) i += 1;
      return [...a.slice(i).map(() => '..'), ...b.slice(i)].join(sep);
    },
  };
}

/** POSIX: `file:///home/x/a%20b.ts` -> `/home/x/a b.ts`. */
export const posix: PathApi = makePath('/', (url) => {
  const u = new URL(url);
  if (u.protocol !== 'file:') throw new TypeError(`not a file URL: ${url}`);
  return decodeURIComponent(u.pathname);
}, false);

/** Windows: `file:///C:/Users/x/a.ts` -> `C:\Users\x\a.ts`. */
export const windows: PathApi = makePath('\\', (url) => {
  const u = new URL(url);
  if (u.protocol !== 'file:') throw new TypeError(`not a file URL: ${url}`);
  const p = decodeURIComponent(u.pathname).replace(/^\/([A-Za-z]:)/, '$1');
  return (u.hostname ? `\\\\${u.hostname}` : '') + p.split('/').join('\\');
}, true);

/** The host's own implementation. */
export const nativePath: PathApi = (globalThis as { Deno?: { build: { os: string } } }).Deno?.build.os === 'windows' ? windows : posix;

/**
 * The `file://` URLs `deno publish --dry-run` says it would publish. URLs rather than paths: the URL
 * form is the same on every platform, so a test asserts without a host.
 */
export function parsePublishedFileUrls(output: string): string[] {
  const urls: string[] = [];
  let collecting = false;
  for (const rawLine of output.split('\n')) {
    // deno-lint-ignore no-control-regex -- stripping ANSI colour codes from deno publish output
    const line = rawLine.replace(/\x1b\[[0-9;]*m/g, '').trim();
    if (line.startsWith('Simulating publish')) { collecting = true; continue; }
    if (!collecting) continue;
    // The WHOLE URL. Anything narrower has to know where the path starts, which is the
    // platform-specific part that broke before.
    const match = line.match(/^(file:\/\/\S+) \(/);
    if (match) urls.push(match[1]);
  }
  return urls;
}

// The specifier of a static import/export or a dynamic import() with a LITERAL argument.
// `import.meta.url` does not match, and neither does `import(workerUrl)`.
const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;
// `//` not preceded by a colon, so `https://` survives as part of a specifier.
const LINE_COMMENT = /(?<!:)\/\/.*$/gm;

/** Every module specifier in `source` that is not relative. Textual, so comments are stripped first. */
export function externalImports(source: string): string[] {
  const code = source.replace(BLOCK_COMMENT, '').replace(LINE_COMMENT, '');
  const external: string[] = [];
  for (const [, specifier] of code.matchAll(SPECIFIER)) {
    if (specifier.startsWith('./') || specifier.startsWith('../')) continue;
    // A template placeholder or whitespace cannot be in a static specifier: that is an error message
    // QUOTING one — `from "${n.id}"` in validate.ts and wiring.ts, measured on this tree.
    if (/\$\{|\s/.test(specifier)) continue;
    external.push(specifier);
  }
  return external;
}

/** Where each published file lands under `staging`, keeping its path relative to the repository root. */
export function stagingPlan(fileUrls: string[], repoRoot: string, staging: string, path: PathApi = nativePath): StagedFile[] {
  const rootPath = path.fromFileUrl(repoRoot);
  return fileUrls.map((url) => {
    const source = path.fromFileUrl(url);
    return { source, target: path.join(staging, path.relative(rootPath, source)) };
  });
}
