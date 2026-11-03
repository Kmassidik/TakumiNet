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

test("forget removes a dialog without calling its close handler", () => {
  const stack = new ModalStack();
  const closed: string[] = [];
  stack.push({ id: "a", onClose: () => closed.push("a") });
  stack.push({ id: "b", onClose: () => closed.push("b") });
  expect(stack.has("a")).toBe(true);
  expect(stack.forget("a")).toBe(true);
  expect(closed).toEqual([]);
  expect(stack.has("a")).toBe(false);
  expect(stack.forget("a")).toBe(false);
  expect(stack.escape()).toBe(true);
  expect(closed).toEqual(["b"]);
});
