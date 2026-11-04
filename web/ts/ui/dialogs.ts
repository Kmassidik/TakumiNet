import { ModalStack } from "./modal_stack";

let zTop = 80;

export function bringToFront(win: HTMLElement | null): void {
  if (!win) return;
  win.style.zIndex = String(++zTop);
}

/* Drag a window by its title bar. The overlay stays full-screen so clicks
   outside still close it; the box switches to fixed coordinates once. */
export function makeWindowMovable(win: HTMLElement | null): void {
  const box = win?.querySelector<HTMLElement>(".preview");
  const title = box?.querySelector<HTMLElement>(".devwin-title");
  if (!win || !box || !title) return;
  let drag: { x: number; y: number; ox: number; oy: number } | null = null;

  title.addEventListener("pointerdown", (ev: PointerEvent) => {
    if ((ev.target as HTMLElement).closest("button")) return;
    bringToFront(win);
    const r = box.getBoundingClientRect();
    drag = { x: ev.clientX, y: ev.clientY, ox: r.left, oy: r.top };
    title.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  title.addEventListener("pointermove", (ev: PointerEvent) => {
    if (!drag) return;
    const x = Math.max(0, Math.min(window.innerWidth - 80, drag.ox + ev.clientX - drag.x));
    const y = Math.max(0, Math.min(window.innerHeight - 40, drag.oy + ev.clientY - drag.y));
    box.style.position = "fixed";
    box.style.margin = "0";
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
  });
  const stop = (ev: PointerEvent) => {
    drag = null;
    try {
      title.releasePointerCapture(ev.pointerId);
    } catch {
      /* already released */
    }
  };
  title.addEventListener("pointerup", stop);
  title.addEventListener("pointercancel", stop);
  box.addEventListener("pointerdown", () => bringToFront(win), true);
}

/* Every `.overlay` dialog joins the modal stack while it is shown, so Escape
   closes the topmost one and focus returns to the control that opened it. */
export function watchOverlays(stack: ModalStack): void {
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      const el = record.target as HTMLElement;
      if (el.hidden) {
        stack.forget(el.id);
        el.dispatchEvent(new Event("dialog-closed"));
      } else if (!stack.has(el.id)) {
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
        stack.push({ id: el.id, opener, onClose: () => { el.hidden = true; } });
      }
    }
  });
  for (const el of document.querySelectorAll<HTMLElement>(".overlay")) {
    observer.observe(el, { attributes: true, attributeFilter: ["hidden"] });
  }
}
