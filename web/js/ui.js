(() => {
  // web/ts/ui/dialogs.ts
  var zTop = 80;
  function bringToFront(win) {
    if (!win)
      return;
    win.style.zIndex = String(++zTop);
  }
  function makeWindowMovable(win) {
    const box = win?.querySelector(".preview");
    const title = box?.querySelector(".devwin-title");
    if (!win || !box || !title)
      return;
    let drag = null;
    title.addEventListener("pointerdown", (ev) => {
      if (ev.target.closest("button"))
        return;
      bringToFront(win);
      const r = box.getBoundingClientRect();
      drag = { x: ev.clientX, y: ev.clientY, ox: r.left, oy: r.top };
      title.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    });
    title.addEventListener("pointermove", (ev) => {
      if (!drag)
        return;
      const x = Math.max(0, Math.min(window.innerWidth - 80, drag.ox + ev.clientX - drag.x));
      const y = Math.max(0, Math.min(window.innerHeight - 40, drag.oy + ev.clientY - drag.y));
      box.style.position = "fixed";
      box.style.margin = "0";
      box.style.left = `${x}px`;
      box.style.top = `${y}px`;
    });
    const stop = (ev) => {
      drag = null;
      try {
        title.releasePointerCapture(ev.pointerId);
      } catch {}
    };
    title.addEventListener("pointerup", stop);
    title.addEventListener("pointercancel", stop);
    box.addEventListener("pointerdown", () => bringToFront(win), true);
  }
  function watchOverlays(stack) {
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        const el = record.target;
        if (el.hidden) {
          stack.forget(el.id);
        } else if (!stack.has(el.id)) {
          const opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
          stack.push({ id: el.id, opener, onClose: () => {
            el.hidden = true;
          } });
        }
      }
    });
    for (const el of document.querySelectorAll(".overlay")) {
      observer.observe(el, { attributes: true, attributeFilter: ["hidden"] });
    }
  }

  // web/ts/ui/button.ts
  function createButton(doc, options) {
    const button = doc.createElement("button");
    button.className = options.className ? `ui-button ${options.className}` : "ui-button";
    if (options.icon) {
      const img = doc.createElement("img");
      img.setAttribute("src", options.icon);
      img.setAttribute("alt", options.label);
      button.appendChild(img);
    } else {
      button.textContent = options.label;
    }
    if (options.action)
      button.dataset.action = options.action;
    button.title = options.title ?? options.label;
    button.setAttribute("type", "button");
    if (options.toggled !== undefined)
      button.setAttribute("aria-pressed", String(options.toggled));
    button.disabled = options.disabled ?? false;
    button.addEventListener("click", () => {
      if (!button.disabled)
        options.onClick?.();
    });
    return button;
  }

  // web/ts/ui/toolbar.ts
  function renderToolbar(doc, bar, items, iconSrc) {
    bar.replaceChildren();
    for (const item of items) {
      if (!item) {
        const separator = doc.createElement("span");
        separator.className = "sep";
        bar.appendChild(separator);
        continue;
      }
      const [icon, title, action] = item;
      bar.appendChild(createButton(doc, { label: title, icon: iconSrc(icon), action }));
    }
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
    has(id) {
      return this.entries.some((entry) => entry.id === id);
    }
    forget(id) {
      const index = this.entries.findIndex((entry) => entry.id === id);
      if (index < 0)
        return false;
      this.entries.splice(index, 1);
      return true;
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
  globalThis.bringToFront = bringToFront;
  globalThis.renderToolbar = (bar, items) => renderToolbar(doc, bar, items, (key) => icon3d(key));
  globalThis.makeWindowMovable = makeWindowMovable;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => watchOverlays(stack));
  } else {
    watchOverlays(stack);
  }
})();
