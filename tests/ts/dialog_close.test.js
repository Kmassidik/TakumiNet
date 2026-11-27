import { expect, test } from "bun:test";
import { overlayToClose, wireDialogClose } from "../../web/ts/mod/ui/dialog_close.js";
import { ModalStack } from "../../web/ts/mod/ui/modal_stack.js";
function overlay(id) {
  const o = { id, hidden: false, classList: { contains: (n) => n === "overlay" }, closest: () => null };
  return o;
}
function closeButton(parent) {
  return { classList: { contains: () => false }, closest: (sel) => sel === "[data-dialog-close]" ? {} : sel === ".overlay" ? parent : null };
}
function inside(parent) {
  return { classList: { contains: () => false }, closest: () => null };
}

class Source {
  handlers = {};
  addEventListener(type, h) {
    (this.handlers[type] ??= []).push(h);
  }
  fire(type, event) {
    for (const h of this.handlers[type] ?? [])
      h(event);
  }
}
function wired() {
  const stack = new ModalStack;
  const source = new Source;
  wireDialogClose(source, stack);
  const open = (o) => stack.push({ id: o.id, onClose: () => {
    o.hidden = true;
  } });
  return { stack, source, open };
}
test("the close button closes its own dialog", () => {
  const a = overlay("a");
  expect(overlayToClose(closeButton(a))).toBe(a);
});
test("a click inside a dialog closes nothing", () => {
  expect(overlayToClose(inside(overlay("a")))).toBeNull();
  expect(overlayToClose(null)).toBeNull();
});
test("a click on the backdrop closes the dialog, but only if the press began there too", () => {
  const { source, open } = wired();
  const a = overlay("a");
  open(a);
  source.fire("mousedown", { target: inside(a) });
  source.fire("click", { target: a });
  expect(a.hidden).toBe(false);
  source.fire("mousedown", { target: a });
  source.fire("click", { target: a });
  expect(a.hidden).toBe(true);
});
test("the close button hides the dialog even when it is not on the stack", () => {
  const { source } = wired();
  const a = overlay("a");
  source.fire("click", { target: closeButton(a) });
  expect(a.hidden).toBe(true);
});
test("Escape closes only the top dialog", () => {
  const { source, open } = wired();
  const a = overlay("a");
  const b = overlay("b");
  open(a);
  open(b);
  let prevented = false;
  source.fire("keydown", { key: "Escape", preventDefault: () => {
    prevented = true;
  } });
  expect(b.hidden).toBe(true);
  expect(a.hidden).toBe(false);
  expect(prevented).toBe(true);
});
test("Escape with nothing open does nothing and is not swallowed", () => {
  const { source } = wired();
  let prevented = false;
  source.fire("keydown", { key: "Escape", preventDefault: () => {
    prevented = true;
  } });
  expect(prevented).toBe(false);
});
test("Escape that another handler already used is ignored", () => {
  const { source, open } = wired();
  const a = overlay("a");
  open(a);
  source.fire("keydown", { key: "Escape", defaultPrevented: true, preventDefault() {} });
  expect(a.hidden).toBe(false);
});
test("other keys never close a dialog", () => {
  const { source, open } = wired();
  const a = overlay("a");
  open(a);
  source.fire("keydown", { key: "Enter", preventDefault() {} });
  expect(a.hidden).toBe(false);
});
test("closeById closes a dialog that is not on top and keeps the rest", () => {
  const stack = new ModalStack;
  let closed = "";
  stack.push({ id: "a", onClose: () => {
    closed += "a";
  } });
  stack.push({ id: "b", onClose: () => {
    closed += "b";
  } });
  expect(stack.closeById("a")).toBe(true);
  expect(closed).toBe("a");
  expect(stack.has("b")).toBe(true);
  expect(stack.closeById("zzz")).toBe(false);
});
