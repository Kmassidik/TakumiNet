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

const pooled = {
  ...gateway,
  pools: [{ network: "192.168.10.0", prefix: 24, gateway: "192.168.10.1", dns: null }],
};
const poolReply = () => ({
  devices: [{ id: "gw1", pools: [{ network: "192.168.20.0", prefix: 24, gateway: "192.168.20.1", dns: "198.51.100.53" }] }],
});

test("the pools section lists the snapshot and removing posts remove=1", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const { post, calls } = mockPost({ ...fullResponses, "/api/devices/dhcp": poolReply });
  await renderGatewayWindow(doc, body, pooled, post);
  expect(allText(body)).toContain("192.168.10.0/24 · gateway 192.168.10.1 · DNS none");

  button(body, "Remove").click();
  await flush();
  expect(calls).toContain("/api/devices/dhcp?id=gw1&network=192.168.10.0&prefix=24&remove=1");
  expect(allText(body)).toContain("192.168.20.0/24 · gateway 192.168.20.1 · DNS 198.51.100.53");
});

test("adding a pool posts more=1 and shows the engine's refusal verbatim", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const { post, calls } = mockPost({ ...fullResponses, "/api/devices/dhcp": poolReply });
  await renderGatewayWindow(doc, body, gateway, post);
  expect(allText(body)).toContain("No pools yet.");

  inputUnder(body, "Network").value = "192.168.20.0";
  inputUnder(body, "Prefix").value = "24";
  inputUnder(body, "Gateway").value = "192.168.20.1";
  inputUnder(body, "DNS").value = "198.51.100.53";
  button(body, "Add pool").click();
  await flush();
  expect(calls).toContain(
    "/api/devices/dhcp?id=gw1&network=192.168.20.0&prefix=24&gateway=192.168.20.1&dns=198.51.100.53&more=1",
  );
  expect(allText(body)).toContain("Pool 192.168.20.0/24 saved.");

  const refused = new FakeElement("div");
  const bad = mockPost({ ...fullResponses, "/api/devices/dhcp": { error: "pool prefix must be between 1 and 30" } });
  await renderGatewayWindow(doc, refused, gateway, bad.post);
  inputUnder(refused, "Network").value = "192.168.20.0";
  inputUnder(refused, "Prefix").value = "31";
  button(refused, "Add pool").click();
  await flush();
  expect(allText(refused)).toContain("pool prefix must be between 1 and 30");
});
