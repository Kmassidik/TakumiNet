import type { DocLike, ElementLike } from "./dom";

export interface ButtonOptions {
  label: string;
  onClick?: () => void;
  icon?: string;
  action?: string;
  title?: string;
  className?: string;
  toggled?: boolean;
  disabled?: boolean;
}

export function createButton(doc: DocLike, options: ButtonOptions): ElementLike {
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
  if (options.action) button.dataset.action = options.action;
  button.title = options.title ?? options.label;
  button.setAttribute("type", "button");
  if (options.toggled !== undefined) button.setAttribute("aria-pressed", String(options.toggled));
  button.disabled = options.disabled ?? false;
  button.addEventListener("click", () => {
    if (!button.disabled) options.onClick?.();
  });
  return button;
}
