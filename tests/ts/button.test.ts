import { expect, test } from "bun:test";
import { createButton } from "../../web/ts/ui/button";
import { FakeDocument } from "./fake_dom";

test("a button renders its label, title and pressed state", () => {
  const doc = new FakeDocument();
  const button = createButton(doc, { label: "Play", title: "Play events", toggled: true, onClick: () => {} });
  expect(button.textContent).toBe("Play");
  expect(button.title).toBe("Play events");
  expect(button.getAttribute("aria-pressed")).toBe("true");
});

test("a button calls its handler on click and not when disabled", () => {
  const doc = new FakeDocument();
  let clicks = 0;
  const button = createButton(doc, { label: "Step", onClick: () => { clicks++; } });
  button.click();
  expect(clicks).toBe(1);
  button.disabled = true;
  button.click();
  expect(clicks).toBe(1);
});
