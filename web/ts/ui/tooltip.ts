import { placeTip, shortcutFor, tipText, TipController } from "./tooltip_rules";

/* One hover label for every button that carries a `title` or `data-tip`. The
   browser's own tooltip is slow and different everywhere, so the title moves
   to `data-tip` the first time the pointer or keyboard reaches the button. */
export function wireTooltips(doc: Document): void {
  if (!doc.body) return; // no page to attach to (tests load the bundle without one)
  const tip = doc.createElement("div");
  tip.id = "tooltip";
  tip.className = "tooltip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  doc.body.appendChild(tip);
  let current: HTMLElement | null = null;
  // While a label shows, watch the page: if its button is replaced, the label goes too.
  const watcher = new MutationObserver(() => controller.check());

  const controller = new TipController({
    show(anchor, text, shortcut) {
      const el = anchor as HTMLElement;
      tip.replaceChildren(doc.createTextNode(text));
      if (shortcut) {
        const key = doc.createElement("span");
        key.className = "tooltip-key";
        key.textContent = shortcut;
        tip.appendChild(key);
      }
      tip.hidden = false;
      const a = el.getBoundingClientRect();
      const t = tip.getBoundingClientRect();
      const place = placeTip({ x: a.left, y: a.top, w: a.width, h: a.height }, { w: t.width, h: t.height }, { w: window.innerWidth, h: window.innerHeight });
      tip.style.left = `${Math.round(place.x)}px`;
      tip.style.top = `${Math.round(place.y)}px`;
      current = el;
      el.setAttribute("aria-describedby", "tooltip");
      watcher.observe(doc.body, { childList: true, subtree: true });
    },
    hide() {
      tip.hidden = true;
      watcher.disconnect();
      current?.removeAttribute("aria-describedby");
      current = null;
    },
    setTimer: (fn, ms) => window.setTimeout(fn, ms),
    clearTimer: (h) => window.clearTimeout(h as number),
    now: () => performance.now(),
    connected: (anchor) => (anchor as HTMLElement).isConnected,
  });

  const anchorOf = (target: EventTarget | null): HTMLElement | null => {
    const el = (target as HTMLElement | null)?.closest?.<HTMLElement>("[title], [data-tip]") ?? null;
    if (!el || el.id === "tooltip") return null;
    if (el.hasAttribute("title")) {
      const title = el.getAttribute("title") ?? "";
      el.removeAttribute("title");
      el.dataset.tip = title;
      if (!el.getAttribute("aria-label") && !(el.textContent ?? "").trim()) el.setAttribute("aria-label", title);
    }
    return el;
  };
  const enter = (target: EventTarget | null) => {
    const el = anchorOf(target);
    if (!el) return;
    const text = tipText(el.dataset.tip, el.textContent);
    controller.enter(el, text, shortcutFor({ action: el.dataset.action, sim: el.dataset.sim, collapseFor: el.dataset.collapseFor }));
  };

  doc.addEventListener("mouseover", (ev) => {
    const el = anchorOf(ev.target);
    if (!el) controller.leave();
    else enter(ev.target);
  });
  doc.addEventListener("mouseout", (ev) => {
    const to = (ev as MouseEvent).relatedTarget as HTMLElement | null;
    if (!to?.closest?.("[data-tip], [title]")) controller.leave();
  });
  doc.addEventListener("focusin", (ev) => enter(ev.target));
  doc.addEventListener("focusout", () => controller.leave());
  doc.addEventListener("pointerdown", () => controller.leave(), true);
  doc.addEventListener("keydown", (ev) => { if (ev.key === "Escape") controller.leave(); }, true);
  doc.addEventListener("scroll", () => controller.leave(), true);
  window.addEventListener("blur", () => controller.leave());
}
