import type { DocLike } from "./ui/dom";
import { openModal } from "./ui/modal";
import { ModalStack } from "./ui/modal_stack";

const doc = document as unknown as DocLike;
const stack = new ModalStack();

globalThis.askConfirm = async (message: string, okText = "OK"): Promise<boolean> =>
  (await openModal(doc, stack, { message, okText })) === true;

globalThis.askText = async (message: string, value = ""): Promise<string | null> =>
  (await openModal(doc, stack, { message, input: value })) as string | null;

declare global {
  var askConfirm: (message: string, okText?: string) => Promise<boolean>;
  var askText: (message: string, value?: string) => Promise<string | null>;
}
