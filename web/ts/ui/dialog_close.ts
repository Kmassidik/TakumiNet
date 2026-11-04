import type { ModalStack } from "./modal_stack";

/* One way to leave any dialog: its close button, a click on the backdrop, or
   Escape. Every dialog in index.html uses the same `data-dialog-close` button
   and the same `.overlay` wrapper, so this is the only close code there is. */

export interface OverlayLike {
  id: string;
  hidden: boolean;
}

export interface ClickTargetLike {
  closest(selector: string): OverlayLike | null;
  classList: { contains(name: string): boolean };
  id?: string;
  hidden?: boolean;
}

export interface KeyEventLike {
  key: string;
  defaultPrevented?: boolean;
  target?: unknown;
  preventDefault(): void;
}

export interface EventSource {
  addEventListener(type: string, handler: (event: never) => void): void;
}

/* The dialog a click should close, or null when it should close nothing. */
export function overlayToClose(target: ClickTargetLike | null): OverlayLike | null {
  if (!target) return null;
  if (target.classList.contains("overlay")) return target as unknown as OverlayLike;
  if (target.closest("[data-dialog-close]")) return target.closest(".overlay");
  return null;
}

export function closeOverlay(overlay: OverlayLike, stack: ModalStack): void {
  if (!stack.closeById(overlay.id)) overlay.hidden = true;
}

export function wireDialogClose(source: EventSource, stack: ModalStack): void {
  /* A drag that starts inside a dialog and ends on the backdrop must not close
     it, so a backdrop click only counts when the press also began there. */
  let pressed: ClickTargetLike | null = null;
  source.addEventListener("mousedown", ((event: { target: ClickTargetLike | null }) => {
    pressed = event.target;
  }) as (event: never) => void);
  source.addEventListener("click", ((event: { target: ClickTargetLike | null }) => {
    const overlay = overlayToClose(event.target);
    if (!overlay) return;
    const fromBackdrop = (event.target as ClickTargetLike).classList.contains("overlay");
    if (fromBackdrop && pressed !== event.target) return;
    closeOverlay(overlay, stack);
  }) as (event: never) => void);
  source.addEventListener("keydown", ((event: KeyEventLike) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    if (stack.escape()) event.preventDefault();
  }) as (event: never) => void);
}
