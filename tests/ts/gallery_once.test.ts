import { expect, test } from "bun:test";
import { shouldAutoShowGallery } from "../../web/ts/ui/gallery_once";

function memory(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    store,
    getItem: (key: string) => (key in store ? store[key]! : null),
    setItem: (key: string, value: string) => { store[key] = value; },
  };
}

test("the lesson gallery opens automatically only the first time in a browser", () => {
  const storage = memory();
  expect(shouldAutoShowGallery(storage)).toBe(true);
  expect(shouldAutoShowGallery(storage)).toBe(false);
  expect(shouldAutoShowGallery(storage)).toBe(false);
});

test("a browser that already saw the gallery never gets it automatically", () => {
  expect(shouldAutoShowGallery(memory({ "pt-web:gallery-seen": "1" }))).toBe(false);
});

test("blocked storage still shows the gallery, without throwing", () => {
  const blocked = {
    getItem: () => { throw new Error("blocked"); },
    setItem: () => { throw new Error("blocked"); },
  };
  expect(shouldAutoShowGallery(blocked)).toBe(true);
});
