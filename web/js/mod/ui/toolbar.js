import { createButton } from "./button.js";

export function renderToolbar(doc, bar, items, iconSrc) {
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
