import { expect, test } from "bun:test";
import { readdirSync } from "fs";
import { join } from "path";
var dir = join(import.meta.dir, "../bend");
var bend = Bun.which("bend");
function run(file) {
  const result = Bun.spawnSync([bend, join(dir, file)], { stdout: "pipe", stderr: "pipe" });
  return { out: result.stdout.toString().trim(), code: result.exitCode };
}
var files = readdirSync(dir).filter((name) => name.endsWith(".bend")).sort();
test("there is at least one Bend test", () => {
  expect(files.length).toBeGreaterThan(0);
});
for (const file of files) {
  test.skipIf(!bend)(`bend test ${file} reports 0 failed cases`, () => {
    const { out, code } = run(file);
    expect(code).toBe(0);
    expect(out).toBe("0");
  }, 60000);
}
