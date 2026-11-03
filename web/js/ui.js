(() => {
  // web/ts/ui/button.ts
  function createButton(doc, options) {
    const button = doc.createElement("button");
    button.className = options.className ? `ui-button ${options.className}` : "ui-button";
    button.textContent = options.label;
    button.title = options.title ?? options.label;
    button.setAttribute("type", "button");
    if (options.toggled !== undefined)
      button.setAttribute("aria-pressed", String(options.toggled));
    button.disabled = options.disabled ?? false;
    button.addEventListener("click", () => {
      if (!button.disabled)
        options.onClick();
    });
    return button;
  }

  // web/ts/ui/modal.ts
  function openModal(doc, stack, options) {
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
      let field = null;
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
        if (event.target === backdrop)
          stack.close();
      });
      stack.push({
        id: "modal",
        opener,
        onClose: () => {
          backdrop.remove();
          resolve(field ? null : false);
        }
      });
      doc.body.appendChild(backdrop);
      if (field) {
        field.focus();
        field.select();
      } else {
        ok.focus();
      }
    });
  }

  // web/ts/ui/modal_stack.ts
  class ModalStack {
    entries = [];
    get size() {
      return this.entries.length;
    }
    push(entry) {
      this.entries.push(entry);
    }
    escape() {
      return this.close();
    }
    close() {
      const top = this.entries.pop();
      if (!top)
        return false;
      top.onClose();
      top.opener?.focus();
      return true;
    }
  }

  // web/ts/main.ts
  var doc = document;
  var stack = new ModalStack;
  globalThis.askConfirm = async (message, okText = "OK") => await openModal(doc, stack, { message, okText }) === true;
  globalThis.askText = async (message, value = "") => await openModal(doc, stack, { message, input: value });
})();
