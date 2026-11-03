import { expect, test } from "bun:test";
import { openModal } from "../../web/ts/ui/modal";
import { ModalStack } from "../../web/ts/ui/modal_stack";
import { FakeDocument, FakeElement } from "./fake_dom";

function openedModal(doc: FakeDocument, options: { message: string; input?: string }) {
  const stack = new ModalStack();
  const result = openModal(doc, stack, options);
  const box = doc.body.children[0]!.children[0]!;
  const buttons = box.children.at(-1)!.children;
  return { stack, result, box, cancel: buttons[0]!, ok: buttons[1]! };
}

test("OK on a confirm resolves true and removes the modal", async () => {
  const doc = new FakeDocument();
  const { stack, result, ok } = openedModal(doc, { message: "Discard?" });
  ok.click();
  expect(await result).toBe(true);
  expect(stack.size).toBe(0);
  expect(doc.body.children).toHaveLength(0);
});

test("Escape on a confirm resolves false", async () => {
  const doc = new FakeDocument();
  const { box, result } = openedModal(doc, { message: "Discard?" });
  box.dispatch("keydown", { key: "Escape" });
  expect(await result).toBe(false);
});

test("a text prompt resolves to the typed value, or null on cancel", async () => {
  const doc = new FakeDocument();
  const typed = openedModal(doc, { message: "Name", input: "pc0" });
  const field = typed.box.children[1] as FakeElement;
  field.value = "router9";
  ((typed.box.children.at(-1) as FakeElement).children[1] as FakeElement).click();
  expect(await typed.result).toBe("router9");

  const cancelled = openedModal(doc, { message: "Name", input: "pc0" });
  ((cancelled.box.children.at(-1) as FakeElement).children[0] as FakeElement).click();
  expect(await cancelled.result).toBe(null);
});
