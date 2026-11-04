import { expect, test } from "bun:test";
import { loadClass, parseFlows, renderFlowsWindow } from "../../web/ts/ui/flows_window";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, button, find, flush, inputUnder } from "./kind_test_helpers";

const workspace = {
  devices: [
    { id: "pc0", name: "PC0" },
    { id: "srv0", name: "Server0" },
  ],
  links: [],
};

const loadedList = {
  links: [
    { a: "PC0", aPort: "Fa0", b: "Server0", bPort: "Fa0/1", mbit: 95, capacity: 100, percent: 95 },
    { a: "Server0", aPort: "Gi0", b: "PC0", bPort: "Gi1", mbit: 10, capacity: 1000, percent: 1 },
  ],
};

const exportXml = '<takumi version="1"><flow dev="pc0" to="srv0" mbit="95"/></takumi>';

type Responses = Record<string, Record<string, unknown>>;

function harness(options: { list?: Record<string, unknown>; xml?: string; set?: Record<string, unknown> } = {}) {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const posts: string[] = [];
  const post = async (path: string): Promise<Record<string, unknown>> => {
    posts.push(path);
    if (path.startsWith("/api/flows/list")) return options.list ?? loadedList;
    if (path.startsWith("/api/flows/set")) return options.set ?? { devices: [] };
    throw new Error(`unexpected ${path}`);
  };
  const getText = async (): Promise<string> => options.xml ?? exportXml;
  const done = renderFlowsWindow(doc, body, workspace, { post, getText });
  return { doc, body, posts, done };
}

test("the load colour follows the thresholds: ok under 70, warn to 99, danger from 100", () => {
  expect(loadClass(0)).toBe("kw-load-ok");
  expect(loadClass(69.9)).toBe("kw-load-ok");
  expect(loadClass(70)).toBe("kw-load-warn");
  expect(loadClass(99.9)).toBe("kw-load-warn");
  expect(loadClass(100)).toBe("kw-load-danger");
});

test("the export file yields the flow rows and the spread switch state", () => {
  const parsed = parseFlows('<flow dev="a" to="b" mbit="40"/><flowspread on="1"/>');
  expect(parsed.flows).toEqual([{ from: "a", to: "b", mbit: 40 }]);
  expect(parsed.spread).toBe(true);
  expect(parseFlows("<takumi/>")).toEqual({ flows: [], spread: false });
});

test("the dialog tables every cable with its load percent coloured by threshold", async () => {
  const { body, done } = harness();
  await done;
  const text = allText(body);
  expect(text).toContain("PC0 Fa0 ↔ Server0 Fa0/1");
  expect(find(body, (n) => n.className === "kw-load-warn" && n.textContent === "95%")).not.toBeNull();
  expect(find(body, (n) => n.className === "kw-load-ok" && n.textContent === "1%")).not.toBeNull();
  expect(text).toContain("PC0 → Server0 · 95 Mbit/s");
});

test("with no flows the dialog says so instead of showing a blank list", async () => {
  const { body, done } = harness({ xml: "<takumi/>" });
  await done;
  expect(allText(body)).toContain("No flows yet. Add one to light up the cables.");
});

test("while loading the dialog says so", () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  void renderFlowsWindow(doc, body, workspace, {
    post: () => new Promise(() => {}),
    getText: () => new Promise(() => {}),
  });
  expect(allText(body)).toContain("Loading…");
});

test("a failed load shows the error state, and Try again recovers", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  let healthy = false;
  const post = async (path: string): Promise<Record<string, unknown>> => {
    if (!healthy) throw new Error("down");
    if (path.startsWith("/api/flows/list")) return loadedList;
    return {};
  };
  await renderFlowsWindow(doc, body, workspace, { post, getText: async () => exportXml });
  expect(allText(body)).toContain("Could not load the cable loads.");
  healthy = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("PC0 Fa0 ↔ Server0 Fa0/1");
});

test("adding a flow resolves both names to ids and posts the right query", async () => {
  const { body, posts, done } = harness();
  await done;
  inputUnder(body, "From device").value = "PC0";
  inputUnder(body, "To device").value = "Server0";
  inputUnder(body, "Mbit/s").value = "40";
  button(body, "Add flow").click();
  await flush();
  expect(posts).toContain("/api/flows/set?from=pc0&to=srv0&mbit=40");
  expect(allText(body)).toContain("Flow set: PC0 → Server0 at 40 Mbit/s.");
});

test("a fractional rate is refused before anything is posted", async () => {
  const { body, posts, done } = harness();
  await done;
  inputUnder(body, "From device").value = "PC0";
  inputUnder(body, "To device").value = "Server0";
  inputUnder(body, "Mbit/s").value = "1.5";
  button(body, "Add flow").click();
  await flush();
  expect(posts.filter((p) => p.startsWith("/api/flows/set"))).toEqual([]);
  expect(allText(body)).toContain("Mbit/s must be a whole number; 0 removes the flow.");
});

test("Remove posts the flow again at zero", async () => {
  const { body, posts, done } = harness();
  await done;
  button(body, "Remove").click();
  await flush();
  expect(posts).toContain("/api/flows/set?from=pc0&to=srv0&mbit=0");
});

test("the spread switch posts its new state", async () => {
  const { body, posts, done } = harness();
  await done;
  const toggle = button(body, "Spread over spare paths");
  expect(toggle.getAttribute("aria-pressed")).toBe("false");
  toggle.click();
  await flush();
  expect(posts).toContain("/api/flows/set?spread=1");
});

test("the server's own error text reaches the person verbatim", async () => {
  const { body, done } = harness({ set: { error: "a flow must be at most 100000 Mbit/s" } });
  await done;
  inputUnder(body, "From device").value = "PC0";
  inputUnder(body, "To device").value = "Server0";
  inputUnder(body, "Mbit/s").value = "200000";
  button(body, "Add flow").click();
  await flush();
  expect(allText(body)).toContain("a flow must be at most 100000 Mbit/s");
});
