/* One minimize behaviour for every bar. A bar marked `data-collapsible="id"`
   hides everything except its own handle; the handle is a button with
   `data-collapse-for="id"`. The collapsed state is kept per browser. */

export const COLLAPSE_KEY = "pt-web:collapsed";

/* A broken or missing saved value means "nothing is collapsed". */
export function readCollapsed(store) {
  try {
    const raw = store?.getItem(COLLAPSE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result = {};
    for (const [id, value] of Object.entries(parsed)) if (value === true) result[id] = true;
    return result;
  } catch {
    return {};
  }
}

export function writeCollapsed(store, id, collapsed) {
  try {
    const all = readCollapsed(store);
    if (collapsed) all[id] = true;
    else delete all[id];
    store?.setItem(COLLAPSE_KEY, JSON.stringify(all));
  } catch {
    /* storage can be blocked; the choice then lasts for this page only */
  }
}

export function handleText(label, collapsed) {
  return collapsed
    ? { text: `+ ${label}`, title: `Show ${label.toLowerCase()}` }
    : { text: "−", title: `Minimize ${label.toLowerCase()}` };
}

export function applyCollapsed(bar, handle, collapsed) {
  const label = handle.dataset.label ?? "bar";
  const { text, title } = handleText(label, collapsed);
  bar.classList.toggle("collapsed", collapsed);
  handle.textContent = text;
  handle.title = title;
  handle.setAttribute("aria-label", title);
  handle.setAttribute("aria-expanded", String(!collapsed));
}

export function wireCollapsibles(root, store) {
  for (const bar of root.querySelectorAll("[data-collapsible]")) {
    const id = bar.dataset.collapsible ?? "";
    const handle = root.querySelector(`[data-collapse-for="${id}"]`);
    if (!id || !handle) continue;
    applyCollapsed(bar, handle, readCollapsed(store)[id] === true);
    handle.addEventListener("click", () => {
      const next = !bar.classList.contains("collapsed");
      applyCollapsed(bar, handle, next);
      writeCollapsed(store, id, next);
    });
  }
}
