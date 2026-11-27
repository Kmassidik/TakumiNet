export function allText(el) {
  return [el.textContent ?? "", ...el.children.map(allText)].filter(Boolean).join(" ");
}

export function find(el, match) {
  if (match(el)) return el;
  for (const child of el.children) {
    const hit = find(child, match);
    if (hit) return hit;
  }
  return null;
}

export function button(root, label) {
  const hit = find(root, (n) => n.tagName === "BUTTON" && n.textContent === label);
  if (!hit) throw new Error(`no button labelled ${label}`);
  return hit;
}

export function inputUnder(root, label) {
  const field = find(root, (n) => n.tagName === "LABEL" && n.textContent === label);
  const input = field && find(field, (n) => n.tagName === "INPUT");
  if (!input) throw new Error(`no field labelled ${label}`);
  return input;
}

export function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
