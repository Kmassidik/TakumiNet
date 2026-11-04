import { expect, test } from "bun:test";
import { callManagers, renderPhoneWindow } from "../../web/ts/ui/phone_window";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, button, find, flush, inputUnder } from "./kind_test_helpers";

const workspace = {
  devices: [
    { id: "server0", name: "CallManager", kind: "server", ip: "10.20.0.5" },
    { id: "server1", name: "BareServer", kind: "server", ip: "" },
    { id: "switch0", name: "OfficeSwitch", kind: "switch", ip: "" },
    { id: "phone1", name: "DeskPhone1", kind: "phone", ip: "10.20.0.11" },
  ],
  links: [],
};

const device = { id: "phone1", name: "DeskPhone1", kind: "phone" };

type Reply = Record<string, unknown>;

function phoneBackend(state: { registered: boolean; ext: number; call: Reply | null; failCall?: string }) {
  const requests: string[] = [];
  const post = async (path: string): Promise<Reply> => {
    requests.push(path);
    if (path.startsWith("/api/phone/status")) {
      return { registered: state.registered, cm: "10.20.0.5", extension: state.ext, call: state.call };
    }
    if (path.startsWith("/api/phone/register")) {
      state.registered = true;
      state.ext = Number(new URLSearchParams(path.split("?")[1]).get("ext"));
      return {};
    }
    if (path.startsWith("/api/phone/call")) {
      if (state.failCall) return { error: state.failCall };
      state.call = { from: state.ext, to: 2002, state: "established" };
      return {};
    }
    return {};
  };
  return { requests, post };
}

test("only addressed servers count as call managers", () => {
  expect(callManagers(workspace)).toEqual([{ label: "CallManager (10.20.0.5)", address: "10.20.0.5" }]);
  expect(callManagers({ devices: [], links: [] })).toEqual([]);
});

test("an unregistered phone shows the empty line state and registers through the picker", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const backend = phoneBackend({ registered: false, ext: 0, call: null });
  await renderPhoneWindow(doc, body, device, workspace, backend.post);
  expect(allText(body)).toContain("Not registered at any call manager yet.");
  const picker = find(body, (n) => n.tagName === "SELECT")!;
  expect(picker.children[0]?.textContent).toBe("CallManager (10.20.0.5)");
  inputUnder(body, "Extension").value = "2001";
  button(body, "Register").click();
  await flush();
  expect(backend.requests).toContain("/api/phone/register?id=phone1&cm=10.20.0.5&ext=2001");
  expect(allText(body)).toContain("Registered as extension 2001.");
});

test("a registered phone shows its line and dials another extension", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const backend = phoneBackend({ registered: true, ext: 2001, call: null });
  await renderPhoneWindow(doc, body, device, workspace, backend.post);
  expect(allText(body)).toContain("Registered at 10.20.0.5 as extension 2001.");
  inputUnder(body, "Extension to call").value = "2002";
  button(body, "Call").click();
  await flush();
  expect(backend.requests).toContain("/api/phone/call?from=2001&to=2002");
  expect(allText(body)).toContain("Call to extension 2002 established.");
  expect(allText(body)).toContain("In a call to extension 2002 (established).");
});

test("dialing before registering is refused in the window", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const backend = phoneBackend({ registered: false, ext: 0, call: null });
  await renderPhoneWindow(doc, body, device, workspace, backend.post);
  inputUnder(body, "Extension to call").value = "2002";
  button(body, "Call").click();
  await flush();
  expect(allText(body)).toContain("Register this phone first.");
  expect(backend.requests.some((r) => r.startsWith("/api/phone/call"))).toBe(false);
});

test("a failed call shows the engine's reason verbatim", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const reason = "no phone is registered as extension 2002";
  const backend = phoneBackend({ registered: true, ext: 2001, call: null, failCall: reason });
  await renderPhoneWindow(doc, body, device, workspace, backend.post);
  inputUnder(body, "Extension to call").value = "2002";
  button(body, "Call").click();
  await flush();
  expect(allText(body)).toContain(reason);
});

test("an analog phone explains that its router carries the call", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const backend = phoneBackend({ registered: false, ext: 0, call: null });
  const analog = { id: "analog0", name: "WallPhone", kind: "analogphone" };
  await renderPhoneWindow(doc, body, analog, workspace, backend.post);
  expect(allText(body)).toContain("An analog phone talks through its phone cable");
});

test("without an addressed server the register section says what is missing", async () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  const backend = phoneBackend({ registered: false, ext: 0, call: null });
  await renderPhoneWindow(doc, body, device, { devices: [], links: [] }, backend.post);
  expect(allText(body)).toContain("No addressed server to register at.");
});
