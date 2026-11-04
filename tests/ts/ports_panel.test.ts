import { expect, test } from "bun:test";
import { parsePortsInfo, portDotClass, portPeerText, renderPortsPanel } from "../../web/ts/ui/ports_panel";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, button, find, flush } from "./kind_test_helpers";

const payload = JSON.stringify({
  ports: [
    { name: "GigabitEthernet0/0", ip: "192.168.1.1", prefix: 24, up: true, peer: { id: "sw0", name: "Switch0", port: "FastEthernet0/1" } },
    { name: "GigabitEthernet0/1", ip: null, prefix: 0, up: true, peer: null },
    { name: "GigabitEthernet0/2", ip: null, prefix: 0, up: false, peer: null },
  ],
});

test("the ports payload parses into rows with peers and admin state", () => {
  const ports = parsePortsInfo(payload);
  expect(ports.length).toBe(3);
  expect(ports[0]!.peer).toEqual({ id: "sw0", name: "Switch0", port: "FastEthernet0/1" });
  expect(ports[1]!.peer).toBe(null);
  expect(ports[2]!.up).toBe(false);
  expect(() => parsePortsInfo('{"error":"no such device"}')).toThrow("no such device");
});

test("the dot is green when up and cabled, grey when idle, red when shut", () => {
  const [cabled, idle, shut] = parsePortsInfo(payload);
  expect(portDotClass(cabled!)).toBe("port-dot is-up");
  expect(portDotClass(idle!)).toBe("port-dot is-idle");
  expect(portDotClass(shut!)).toBe("port-dot is-down");
  expect(portPeerText(cabled!)).toBe("connected to Switch0 FastEthernet0/1");
  expect(portPeerText(idle!)).toBe("free");
});

test("rows show the address, the far end and the free state", () => {
  const doc = new FakeDocument();
  const box = new FakeElement("div");
  renderPortsPanel(doc, box, parsePortsInfo(payload), { deviceId: "r1" });
  const text = allText(box);
  expect(text).toContain("GigabitEthernet0/0 192.168.1.1/24 connected to Switch0 FastEthernet0/1");
  expect(text).toContain("GigabitEthernet0/1 free");
  expect(find(box, (n) => n.className === "port-peer is-free")).not.toBe(null);
  expect(find(box, (n) => n.tagName === "BUTTON")).toBe(null);
});

test("the toggle posts the exact port and direction, then refreshes", async () => {
  const doc = new FakeDocument();
  const box = new FakeElement("div");
  const posts: string[] = [];
  let refreshed = 0;
  renderPortsPanel(doc, box, parsePortsInfo(payload), {
    deviceId: "r1",
    post: async (path) => {
      posts.push(path);
      return {};
    },
    refresh: () => {
      refreshed += 1;
    },
  });
  button(box, "Shut down").click();
  button(box, "Bring up").click();
  await flush();
  expect(posts).toEqual([
    "/api/devices/port?id=r1&port=GigabitEthernet0%2F0&up=0",
    "/api/devices/port?id=r1&port=GigabitEthernet0%2F2&up=1",
  ]);
  expect(refreshed).toBe(2);
});

test("a refused toggle leaves the rows alone instead of refreshing", async () => {
  const doc = new FakeDocument();
  const box = new FakeElement("div");
  let refreshed = 0;
  renderPortsPanel(doc, box, parsePortsInfo(payload), {
    deviceId: "r1",
    post: async () => ({ error: "no such interface" }),
    refresh: () => {
      refreshed += 1;
    },
  });
  button(box, "Shut down").click();
  await flush();
  expect(refreshed).toBe(0);
});
