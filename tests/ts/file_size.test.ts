import { expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dir, "../..");
const LIMIT = 500;
const ROOTS = ["src", "tests", "web/ts", "scripts", "tools"];
const EXTENSIONS = [".rs", ".ts", ".js", ".py", ".sh"];
const SKIP = new Set(["node_modules", "target", "fixtures"]);

/* Files that were already over the limit when the rule began. They may shrink
   and must never grow. Remove an entry once the file is split. */
const baseline: Record<string, number> = JSON.parse(readFileSync(join(import.meta.dir, "../size_baseline.json"), "utf8"));

function walk(dir: string, out: string[]) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTENSIONS.some((e) => name.endsWith(e))) out.push(full);
  }
}

function sizes(): Map<string, number> {
  const files: string[] = [];
  for (const r of ROOTS) walk(join(root, r), files);
  return new Map(files.map((f) => [relative(root, f), readFileSync(f, "utf8").split("\n").length - 1]));
}

test("no source file passes 500 lines unless it is on the shrink-only list", () => {
  const over = [...sizes()].filter(([f, n]) => n > LIMIT && !(f in baseline));
  expect(over.map(([f, n]) => `${f}: ${n}`)).toEqual([]);
});

test("a file on the shrink-only list never grows", () => {
  const now = sizes();
  const grown = Object.entries(baseline).filter(([f, max]) => (now.get(f) ?? 0) > max);
  expect(grown.map(([f, max]) => `${f}: ${now.get(f)} > ${max}`)).toEqual([]);
});

test("the shrink-only list holds no file that is already small or gone", () => {
  const now = sizes();
  const stale = Object.keys(baseline).filter((f) => (now.get(f) ?? 0) <= LIMIT);
  expect(stale).toEqual([]);
});
