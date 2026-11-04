import { expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";

/* Every tests/bend/*.bend file is a small program. It models one rule of the
   app and prints how many cases failed. 0 is a pass. These are tests, not
   proofs: nothing here claims a formal guarantee. */

const dir = join(import.meta.dir, "../bend");
const bend = Bun.which("bend");

function run(file: string): { out: string; code: number } {
  const result = Bun.spawnSync([bend as string, join(dir, file)], { stdout: "pipe", stderr: "pipe" });
  return { out: result.stdout.toString().trim(), code: result.exitCode };
}

const files = readdirSync(dir).filter((name) => name.endsWith(".bend")).sort();

test("there is at least one Bend test", () => {
  expect(files.length).toBeGreaterThan(0);
});

for (const file of files) {
  test.skipIf(!bend)(`bend test ${file} reports 0 failed cases`, () => {
    const { out, code } = run(file);
    expect(code).toBe(0);
    expect(out).toBe("0");
  }, 60_000);
}
