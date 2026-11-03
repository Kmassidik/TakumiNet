import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");

test("web/js/ui.js is the current build of web/ts", async () => {
  const result = await Bun.build({
    entrypoints: [join(root, "web/ts/main.ts")],
    target: "browser",
    format: "iife",
  });
  expect(result.success).toBe(true);
  const built = await result.outputs[0]!.text();
  expect(readFileSync(join(root, "web/js/ui.js"), "utf8")).toBe(built);
});
