import { expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
var root = join(import.meta.dir, "../..");
var LIMIT = 500;
var ROOTS = ["src", "tests", "web/js/mod", "scripts", "tools"];
var EXTENSIONS = [".rs", ".ts", ".js", ".py", ".sh"];
var SKIP = new Set(["node_modules", "target", "fixtures"]);
var baseline = JSON.parse(readFileSync(join(import.meta.dir, "../size_baseline.json"), "utf8"));
function walk(dir, out) {
  if (!existsSync(dir))
    return;
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name))
      continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory())
      walk(full, out);
    else if (EXTENSIONS.some((e) => name.endsWith(e)))
      out.push(full);
  }
}
function sizes() {
  const files = [];
  for (const r of ROOTS)
    walk(join(root, r), files);
  return new Map(files.map((f) => [relative(root, f), readFileSync(f, "utf8").split(`
`).length - 1]));
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
