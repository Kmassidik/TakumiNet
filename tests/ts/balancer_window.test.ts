import { expect, test } from "bun:test";
import { renderBalancerWindow } from "../../web/ts/ui/balancer_window";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, button, flush, inputUnder } from "./kind_test_helpers";

const balancer = { id: "lb1", name: "Balancer1", kind: "load-balancer" };
const workspace = {
  devices: [
    { id: "lb1", name: "Balancer1" },
    { id: "srv1", name: "Web1" },
    { id: "srv2", name: "Web2" },
  ],
  links: [],
};

type Responses = Record<string, Record<string, unknown> | (() => Record<string, unknown>)>;

function mockPost(responses: Responses, calls: string[] = []) {
  const post = async (path: string): Promise<Record<string, unknown>> => {
    calls.push(path);
    const key = Object.keys(responses).find((k) => path.startsWith(k));
    if (!key) throw new Error(`unexpected ${path}`);
    const hit = responses[key]!;
    return typeof hit === "function" ? hit() : hit;
  };
  return { post, calls };
}

const fullResponses: Responses = {
  "/api/lb/list": { pool: [{ member: "srv1", served: 3 }, { member: "srv2", served: 0 }] },
  "/api/devices/lbpool": {},
};

function rendered(responses: Responses) {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const { post, calls } = mockPost(responses);
  const done = renderBalancerWindow(doc, body, balancer, workspace, post);
  return { doc, body, done, calls };
}

test("the balancer window names each pool member with its served count", async () => {
  const { body, done } = rendered(fullResponses);
  await done;
  const text = allText(body);
  expect(text).toContain("Server pool");
  expect(text).toContain("Web1: 3 served");
  expect(text).toContain("Web2: 0 served");
});

test("an empty pool shows the empty state, never a blank pane", async () => {
  const { body, done } = rendered({ ...fullResponses, "/api/lb/list": { pool: [] } });
  await done;
  expect(allText(body)).toContain("The pool is empty: add servers.");
});

test("while the pool loads, the section says it is loading", () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  void renderBalancerWindow(doc, body, balancer, workspace, () => new Promise(() => {}));
  expect(allText(body)).toContain("Loading…");
});

test("a failed pool load shows the error state, and Try again recovers", async () => {
  let healthy = false;
  const { post } = mockPost(fullResponses);
  const flaky = (path: string) => (healthy ? post(path) : Promise.reject(new Error("down")));
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  await renderBalancerWindow(doc, body, balancer, workspace, flaky);
  expect(allText(body)).toContain("Could not load the pool.");
  healthy = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("Web1: 3 served");
});

test("adding a server resolves its name to the id and reloads the pool", async () => {
  const { body, done, calls } = rendered(fullResponses);
  await done;
  inputUnder(body, "Server").value = "Web2";
  button(body, "Add server").click();
  await flush();
  expect(calls).toContain("/api/devices/lbpool?id=lb1&member=srv2");
  expect(calls.filter((c) => c.startsWith("/api/lb/list")).length).toBe(2);
  expect(allText(body)).toContain("Web2 added to the pool.");
});

test("removing a member posts remove=1 and reloads the pool", async () => {
  const { body, done, calls } = rendered(fullResponses);
  await done;
  button(body, "Remove").click();
  await flush();
  expect(calls).toContain("/api/devices/lbpool?id=lb1&member=srv1&remove=1");
  expect(calls.filter((c) => c.startsWith("/api/lb/list")).length).toBe(2);
});

test("a pool failure shows the server's error text verbatim", async () => {
  const { body, done } = rendered({
    ...fullResponses,
    "/api/devices/lbpool": { error: "srv9 is not a server" },
  });
  await done;
  inputUnder(body, "Server").value = "srv9";
  button(body, "Add server").click();
  await flush();
  expect(allText(body)).toContain("srv9 is not a server");
});
