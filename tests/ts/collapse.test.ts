import { expect, test } from "bun:test";
import { applyCollapsed, COLLAPSE_KEY, handleText, readCollapsed, writeCollapsed, type BarLike, type HandleLike, type StoreLike } from "../../web/ts/ui/collapse";

class Store implements StoreLike {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
}

function bar(): BarLike & { classes: Set<string> } {
  const classes = new Set<string>();
  return {
    classes,
    classList: {
      toggle(name, force) { const on = force ?? !classes.has(name); if (on) classes.add(name); else classes.delete(name); return on; },
      contains: (name) => classes.has(name),
    },
  };
}

function handle(label = "Toolbar"): HandleLike & { attrs: Record<string, string> } {
  const attrs: Record<string, string> = {};
  return { attrs, textContent: "", title: "", dataset: { label }, setAttribute: (n, v) => { attrs[n] = v; } };
}

test("saved collapsed state round-trips per bar", () => {
  const store = new Store();
  writeCollapsed(store, "palette", true);
  writeCollapsed(store, "sidebar", true);
  expect(readCollapsed(store)).toEqual({ palette: true, sidebar: true });
  writeCollapsed(store, "palette", false);
  expect(readCollapsed(store)).toEqual({ sidebar: true });
});

test("a broken saved value falls back to nothing collapsed and does not throw", () => {
  for (const bad of ["{not json", "[]", "7", "null", '"x"']) {
    const store = new Store();
    store.setItem(COLLAPSE_KEY, bad);
    expect(readCollapsed(store)).toEqual({});
  }
  expect(readCollapsed(null)).toEqual({});
});

test("only a real true counts as collapsed", () => {
  const store = new Store();
  store.setItem(COLLAPSE_KEY, JSON.stringify({ a: true, b: "true", c: 1, d: false }));
  expect(readCollapsed(store)).toEqual({ a: true });
});

test("blocked storage never throws on write", () => {
  const blocked: StoreLike = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  expect(() => writeCollapsed(blocked, "x", true)).not.toThrow();
  expect(readCollapsed(blocked)).toEqual({});
});

test("collapsing then restoring returns the original look", () => {
  const b = bar();
  const h = handle("Devices");
  applyCollapsed(b, h, false);
  const before = { text: h.textContent, title: h.title, cls: b.classes.has("collapsed") };
  applyCollapsed(b, h, true);
  expect(b.classes.has("collapsed")).toBe(true);
  expect(h.textContent).toBe("+ Devices");
  expect(h.attrs["aria-expanded"]).toBe("false");
  applyCollapsed(b, h, false);
  expect({ text: h.textContent, title: h.title, cls: b.classes.has("collapsed") }).toEqual(before);
  expect(h.attrs["aria-expanded"]).toBe("true");
});

test("handle text names the bar so a collapsed bar can be found again", () => {
  expect(handleText("Sidebar", true).title).toBe("Show sidebar");
  expect(handleText("Sidebar", false).title).toBe("Minimize sidebar");
});
