import { expect, test } from "bun:test";
import { ModalStack } from "../../web/ts/ui/modal_stack";

test("Escape closes only the top modal", () => {
  const stack = new ModalStack();
  const closed: string[] = [];
  stack.push({ id: "a", onClose: () => closed.push("a") });
  stack.push({ id: "b", onClose: () => closed.push("b") });
  expect(stack.escape()).toBe(true);
  expect(closed).toEqual(["b"]);
  expect(stack.size).toBe(1);
});

test("closing a modal returns focus to the element that opened it", () => {
  const stack = new ModalStack();
  let focused = 0;
  stack.push({ id: "a", opener: { focus: () => { focused++; } }, onClose: () => {} });
  stack.escape();
  expect(focused).toBe(1);
});

test("Escape with nothing open does nothing", () => {
  expect(new ModalStack().escape()).toBe(false);
});
