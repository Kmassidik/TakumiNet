import { expect, test } from "bun:test";
import { renderGatewayWindow } from "../../web/ts/ui/gateway_window";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, button, flush, inputUnder } from "./kind_test_helpers";

const gateway = { id: "gw1", name: "Gateway1", kind: "rtrw-gateway" };

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
  "/api/pppoe/sessions": { sessions: [{ client: "pc1", user: "budi" }] },
  "/api/queues/list": { sessions: [{ client: "pc1", user: "budi", mbit: 4.0 }], load: 80 },
  "/api/aaa/list": { users: ["budi"] },
  "/api/devices/queue": {},
  "/api/devices/aaa": {},
  "/api/voucher": {},
};

function rendered(responses: Responses) {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const { post, calls } = mockPost(responses);
  const done = renderGatewayWindow(doc, body, gateway, post);
  return { doc, body, done, calls };
}

test("the gateway window shows sessions, measured rates and the line load", async () => {
  const { body, done } = rendered(fullResponses);
  await done;
  const text = allText(body);
  expect(text).toContain("Customer sessions");
  expect(text).toContain("budi on pc1");
  expect(text).toContain("budi on pc1: 4 Mbit/s measured");
  expect(text).toContain("Line load: 80%");
  expect(text).toContain("budi");
});

test("empty replies show the empty states, never a blank pane", async () => {
  const { body, done } = rendered({
    ...fullResponses,
    "/api/pppoe/sessions": { sessions: [] },
    "/api/queues/list": { sessions: [], load: null },
    "/api/aaa/list": { users: [] },
  });
  await done;
  const text = allText(body);
  expect(text).toContain("No customer is connected yet.");
  expect(text).toContain("The line load is not measured yet.");
  expect(text).toContain("No customer account exists yet.");
});

test("while the fetches run, the sections say they are loading", () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  void renderGatewayWindow(doc, body, gateway, () => new Promise(() => {}));
  expect(allText(body)).toContain("Loading…");
});

test("a failed load shows the error state, and Try again recovers", async () => {
  let healthy = false;
  const { post } = mockPost(fullResponses);
  const flaky = (path: string) => (healthy ? post(path) : Promise.reject(new Error("down")));
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  await renderGatewayWindow(doc, body, gateway, flaky);
  expect(allText(body)).toContain("Could not load the sessions.");
  healthy = true;
  button(body, "Try again").click();
  await flush();
  expect(allText(body)).toContain("budi on pc1");
});

test("the limit form posts the customer queue and refreshes the list", async () => {
  const { body, done, calls } = rendered(fullResponses);
  await done;
  inputUnder(body, "Customer").value = "budi";
  inputUnder(body, "Limit in Mbit/s").value = "5";
  button(body, "Set limit").click();
  await flush();
  expect(calls).toContain("/api/devices/queue?id=gw1&user=budi&mbit=5");
  expect(calls.filter((c) => c.startsWith("/api/queues/list")).length).toBe(2);
  expect(allText(body)).toContain("Limit saved: budi at 5 Mbit/s.");
});

test("the parent limit form posts with parent=1", async () => {
  const { body, done, calls } = rendered(fullResponses);
  await done;
  inputUnder(body, "Whole line in Mbit/s").value = "20";
  button(body, "Set line limit").click();
  await flush();
  expect(calls).toContain("/api/devices/queue?id=gw1&mbit=20&parent=1");
});

test("a voucher failure shows the server's error text verbatim", async () => {
  const { body, done } = rendered({
    ...fullResponses,
    "/api/voucher": { error: "voucher CAFE1 already exists" },
  });
  await done;
  inputUnder(body, "Code").value = "CAFE1";
  inputUnder(body, "Minutes").value = "60";
  button(body, "Create voucher").click();
  await flush();
  expect(allText(body)).toContain("voucher CAFE1 already exists");
});

test("adding an account posts the user and reloads the account list", async () => {
  const { body, done, calls } = rendered(fullResponses);
  await done;
  inputUnder(body, "User").value = "sari";
  inputUnder(body, "Password").value = "pw1";
  button(body, "Add account").click();
  await flush();
  expect(calls).toContain("/api/devices/aaa?id=gw1&user=sari&pass=pw1");
  expect(calls.filter((c) => c.startsWith("/api/aaa/list")).length).toBe(2);
});
