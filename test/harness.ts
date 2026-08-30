/**
 * Repository tooling, not published source — `RT-R7` exempts it from the import
 * rules the rest of the tree obeys. It still runs on Node and Deno unchanged,
 * because the suites do.
 */

export interface Case {
  name: string;
  fn: () => void | Promise<void>;
}

const registered: { suite: string; cases: Case[] }[] = [];

export function suite(name: string, build: (t: (n: string, fn: Case['fn']) => void) => void): void {
  const cases: Case[] = [];
  build((n, fn) => cases.push({ name: n, fn }));
  registered.push({ suite: name, cases });
}

export function collected() {
  return registered;
}

export class AssertionError extends Error {}

export function ok(cond: unknown, msg: string): void {
  if (!cond) throw new AssertionError(msg);
}

export function equal(actual: unknown, expected: unknown, msg: string): void {
  if (!deepEqual(actual, expected)) {
    throw new AssertionError(`${msg}\n    expected: ${show(expected)}\n    actual:   ${show(actual)}`);
  }
}

export function throws(fn: () => unknown, match: string, msg: string): void {
  try {
    fn();
  } catch (e) {
    const text = e instanceof Error ? e.message : String(e);
    if (!text.includes(match)) {
      throw new AssertionError(`${msg}\n    expected an error containing ${JSON.stringify(match)}\n    got: ${text}`);
    }
    return;
  }
  throw new AssertionError(`${msg}\n    expected a throw containing ${JSON.stringify(match)}, nothing was thrown`);
}

function show(x: unknown): string {
  try {
    return JSON.stringify(x, (_k, v) => (v instanceof Set ? [...v] : v)) ?? String(x);
  } catch {
    return String(x);
  }
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const x of a) if (!b.has(x)) return false;
    return true;
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) if (!b.has(k) || !deepEqual(v, b.get(k))) return false;
    return true;
  }
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  const ak = Object.keys(a as object);
  const bk = Object.keys(b as object);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!bk.includes(k)) return false;
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

// --- cross-runtime file access, for the L4 corpus fixtures --------------------
declare const Deno: { readDirSync?: unknown; readTextFileSync?: (p: string) => string } | undefined;

const isDeno = typeof (globalThis as Record<string, unknown>).Deno !== 'undefined';

export async function listDir(dir: string): Promise<string[]> {
  if (isDeno) {
    const D = (globalThis as unknown as { Deno: { readDirSync: (p: string) => Iterable<{ name: string; isFile: boolean; isDirectory: boolean }> } }).Deno;
    return [...D.readDirSync(dir)].map((e) => e.name).sort();
  }
  const { readdirSync } = await import('node:fs');
  return readdirSync(dir).sort();
}

export async function isDir(path: string): Promise<boolean> {
  if (isDeno) {
    const D = (globalThis as unknown as { Deno: { statSync: (p: string) => { isDirectory: boolean } } }).Deno;
    try { return D.statSync(path).isDirectory; } catch { return false; }
  }
  const { statSync } = await import('node:fs');
  try { return statSync(path).isDirectory(); } catch { return false; }
}

export async function readText(path: string): Promise<string> {
  if (isDeno) {
    const D = (globalThis as unknown as { Deno: { readTextFileSync: (p: string) => string } }).Deno;
    return D.readTextFileSync(path);
  }
  const { readFileSync } = await import('node:fs');
  return readFileSync(path, 'utf8');
}

/** Repository root, derived from this file's location so the runner works from any cwd. */
export const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
