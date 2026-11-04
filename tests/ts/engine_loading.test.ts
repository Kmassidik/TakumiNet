import { expect, test } from "bun:test";
import { engineLoadingMessage } from "../../web/ts/ui/engine_loading";

test("before any bytes arrive the loader says what it is loading", () => {
  expect(engineLoadingMessage(null)).toBe("Loading the TakumiNet engine…");
});

test("with a known total it shows megabytes loaded of the total", () => {
  expect(engineLoadingMessage({ loaded: 524288, total: 1835008 })).toBe("Loading the TakumiNet engine… 0.5 of 1.8 MB");
});

test("with an unknown total it shows only the megabytes loaded", () => {
  expect(engineLoadingMessage({ loaded: 1048576, total: 0 })).toBe("Loading the TakumiNet engine… 1.0 MB");
});
