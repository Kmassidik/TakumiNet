/* One minimize behaviour for every bar. A bar marked `data-collapsible="id"`
   hides everything except its own handle; the handle is a button with
   `data-collapse-for="id"`. The collapsed state is kept per browser. */

export const COLLAPSE_KEY = "pt-web:collapsed";

export interface StoreLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/* A broken or missing saved value means "nothing is collapsed". */
export function readCollapsed(store: StoreLike | null): Record<string, boolean> {
  try {
    const raw = store?.getItem(COLLAPSE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result: Record<string, boolean> = {};
    for (const [id, value] of Object.entries(parsed)) if (value === true) result[id] = true;
    return result;
  } catch {
    return {};
  }
}

export function writeCollapsed(store: StoreLike | null, id: string, collapsed: boolean): void {
  try {
    const all = readCollapsed(store);
    if (collapsed) all[id] = true;
    else delete all[id];
    store?.setItem(COLLAPSE_KEY, JSON.stringify(all));
  } catch {
    /* storage can be blocked; the choice then lasts for this page only */
  }
}

export function handleText(label: string, collapsed: boolean): { text: string; title: string } {
  return collapsed
    ? { text: `+ ${label}`, title: `Show ${label.toLowerCase()}` }
    : { text: "−", title: `Minimize ${label.toLowerCase()}` };
}

export interface BarLike {
  classList: { toggle(name: string, force?: boolean): boolean; contains(name: string): boolean };
}

export interface HandleLike {
  textContent: string | null;
  title: string;
  dataset: Record<string, string | undefined>;
  setAttribute(name: string, value: string): void;
}

export function applyCollapsed(bar: BarLike, handle: HandleLike, collapsed: boolean): void {
  const label = handle.dataset.label ?? "bar";
  const { text, title } = handleText(label, collapsed);
  bar.classList.toggle("collapsed", collapsed);
  handle.textContent = text;
  handle.title = title;
  handle.setAttribute("aria-label", title);
  handle.setAttribute("aria-expanded", String(!collapsed));
}

export function wireCollapsibles(root: ParentNode, store: StoreLike | null): void {
  for (const bar of root.querySelectorAll<HTMLElement>("[data-collapsible]")) {
    const id = bar.dataset.collapsible ?? "";
    const handle = root.querySelector<HTMLElement>(`[data-collapse-for="${id}"]`);
    if (!id || !handle) continue;
    applyCollapsed(bar, handle, readCollapsed(store)[id] === true);
    handle.addEventListener("click", () => {
      const next = !bar.classList.contains("collapsed");
      applyCollapsed(bar, handle, next);
      writeCollapsed(store, id, next);
    });
  }
}
