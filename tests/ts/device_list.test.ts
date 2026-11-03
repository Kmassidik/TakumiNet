import { expect, test } from "bun:test";
import { renderDeviceList } from "../../web/ts/ui/device_list";
import { FakeDocument, FakeElement } from "./fake_dom";

const devices = [
  { id: "a", name: "PC0", model: "PC-PT", ip: "10.0.0.2", prefix: 24 },
  { id: "b", name: "Switch0", model: "2960", ip: "", prefix: 0 },
];

test("the screen-reader device list has one button per device, named for screen readers", () => {
  const doc = new FakeDocument();
  const list = new FakeElement("ul");
  renderDeviceList(doc, list, devices, () => {});
  expect(list.children.map((c) => c.tagName)).toEqual(["LI", "LI"]);
  const first = list.children[0]!.children[0]!;
  expect(first.tagName).toBe("BUTTON");
  expect(first.getAttribute("aria-label")).toBe("PC0, PC-PT, 10.0.0.2/24");
  expect(list.children[1]!.children[0]!.getAttribute("aria-label")).toBe("Switch0, 2960");
});

test("activating a device button reports its id", () => {
  const doc = new FakeDocument();
  const list = new FakeElement("ul");
  const picked: string[] = [];
  renderDeviceList(doc, list, devices, (id) => picked.push(id));
  list.children[1]!.children[0]!.click();
  expect(picked).toEqual(["b"]);
});

test("rendering again replaces the previous list", () => {
  const doc = new FakeDocument();
  const list = new FakeElement("ul");
  renderDeviceList(doc, list, devices, () => {});
  renderDeviceList(doc, list, [devices[0]!], () => {});
  expect(list.children).toHaveLength(1);
});
