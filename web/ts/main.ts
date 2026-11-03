import { bringToFront, makeWindowMovable, watchOverlays } from "./ui/dialogs";
import type { DocLike, ElementLike } from "./ui/dom";
import { renderToolbar, type ToolbarItem } from "./ui/toolbar";
import { openModal } from "./ui/modal";
import { ModalStack } from "./ui/modal_stack";

const doc = document as unknown as DocLike;
const stack = new ModalStack();

globalThis.askConfirm = async (message: string, okText = "OK"): Promise<boolean> =>
  (await openModal(doc, stack, { message, okText })) === true;

globalThis.askText = async (message: string, value = ""): Promise<string | null> =>
  (await openModal(doc, stack, { message, input: value })) as string | null;

globalThis.bringToFront = bringToFront;
globalThis.renderToolbar = (bar, items) => renderToolbar(doc, bar as unknown as ElementLike, items, (key) => icon3d(key));
globalThis.makeWindowMovable = makeWindowMovable;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => watchOverlays(stack));
} else {
  watchOverlays(stack);
}

declare global {
  var icon3d: (key: string) => string;
  var renderToolbar: (bar: HTMLElement, items: readonly ToolbarItem[]) => void;
  var bringToFront: (win: HTMLElement | null) => void;
  var makeWindowMovable: (win: HTMLElement | null) => void;
  var askConfirm: (message: string, okText?: string) => Promise<boolean>;
  var askText: (message: string, value?: string) => Promise<string | null>;
}
