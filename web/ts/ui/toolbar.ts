import { createButton } from "./button";
import type { DocLike, ElementLike } from "./dom";

export type ToolbarItem = readonly [icon: string, title: string, action: string] | null;

export function renderToolbar(doc: DocLike, bar: ElementLike, items: readonly ToolbarItem[], iconSrc: (key: string) => string): void {
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
