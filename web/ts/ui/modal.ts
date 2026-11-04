import { createButton } from "./button";
import type { DocLike, ElementLike } from "./dom";
import type { ModalStack } from "./modal_stack";

export interface ModalOptions {
  message: string;
  input?: string;
  okText?: string;
  cancelText?: string;
}

export type ModalResult = boolean | string | null;

export function openModal(doc: DocLike, stack: ModalStack, options: ModalOptions): Promise<ModalResult> {
  return new Promise((resolve) => {
    const opener = doc.activeElement ?? undefined;
    const backdrop = doc.createElement("div");
    backdrop.className = "modal-backdrop";
    const box = doc.createElement("div");
    box.className = "modal";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    backdrop.appendChild(box);

    const message = doc.createElement("p");
    message.className = "modal-message";
    message.textContent = options.message;
    box.appendChild(message);

    let field: ElementLike | null = null;
    if (options.input !== undefined) {
      field = doc.createElement("input");
      field.className = "modal-input";
      field.setAttribute("type", "text");
      field.setAttribute("autocomplete", "off");
      field.value = options.input;
      box.appendChild(field);
    }

    const accept = () => {
      resolve(field ? field.value : true);
      stack.close();
    };
    const row = doc.createElement("div");
    row.className = "modal-buttons";
    row.appendChild(createButton(doc, { label: options.cancelText ?? "Cancel", className: "modal-cancel", onClick: () => stack.close() }));
    const ok = createButton(doc, { label: options.okText ?? "OK", className: "modal-ok", onClick: accept });
    row.appendChild(ok);
    box.appendChild(row);

    box.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        stack.escape();
      } else if (event.key === "Enter" && event.target?.tagName !== "BUTTON") {
        event.preventDefault();
        accept();
      }
    });
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) stack.close();
    });

    stack.push({
      id: "modal",
      opener,
      onClose: () => {
        backdrop.remove();
        resolve(field ? null : false);
      },
    });
    doc.body.appendChild(backdrop);
    /* Focus after the pointer event that opened us has finished; otherwise the
       browser moves focus back to the page when that click completes. */
    setTimeout(() => {
      if (field) {
        field.focus();
        field.select();
      } else {
        ok.focus();
      }
    }, 0);
  });
}
