import { expect, test } from "bun:test";
import { renderToolbar } from "../../web/ts/ui/toolbar";
import { FakeDocument, FakeElement } from "./fake_dom";

const icon = (key: string) => `/art3d/${key}.webp`;

test("a toolbar renders one icon button per item, with its action and title", () => {
  const doc = new FakeDocument();
  const bar = new FakeElement("div");
  renderToolbar(doc, bar, [["toolbar/new", "New", "new"], ["toolbar/open", "Open", "open"]], icon);
  expect(bar.children.map((c) => c.tagName)).toEqual(["BUTTON", "BUTTON"]);
  const [first] = bar.children as [FakeElement, FakeElement];
  expect(first.title).toBe("New");
  expect(first.dataset.action).toBe("new");
  const img = first.children[0] as FakeElement;
  expect(img.getAttribute("src")).toBe("/art3d/toolbar/new.webp");
  expect(img.getAttribute("alt")).toBe("New");
});

test("a null item becomes a separator and rendering replaces old content", () => {
  const doc = new FakeDocument();
  const bar = new FakeElement("div");
  renderToolbar(doc, bar, [["toolbar/new", "New", "new"], null, ["toolbar/help", "Help", "help"]], icon);
  expect(bar.children.map((c) => c.tagName)).toEqual(["BUTTON", "SPAN", "BUTTON"]);
  expect(bar.children[1]?.className).toBe("sep");
  renderToolbar(doc, bar, [["toolbar/help", "Help", "help"]], icon);
  expect(bar.children).toHaveLength(1);
});
