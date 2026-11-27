/* One way to leave any dialog: its close button, a click on the backdrop, or
   Escape. Every dialog in index.html uses the same `data-dialog-close` button
   and the same `.overlay` wrapper, so this is the only close code there is. */

/* The dialog a click should close, or null when it should close nothing. */
export function overlayToClose(target) {
  if (!target) return null;
  if (target.classList.contains("overlay")) return target;
  if (target.closest("[data-dialog-close]")) return target.closest(".overlay");
  return null;
}

export function closeOverlay(overlay, stack) {
  if (!stack.closeById(overlay.id)) overlay.hidden = true;
}

export function wireDialogClose(source, stack) {
  /* A drag that starts inside a dialog and ends on the backdrop must not close
     it, so a backdrop click only counts when the press also began there. */
  let pressed = null;
  source.addEventListener("mousedown", (event) => {
    pressed = event.target;
  });
  source.addEventListener("click", (event) => {
    const overlay = overlayToClose(event.target);
    if (!overlay) return;
    const fromBackdrop = event.target.classList.contains("overlay");
    if (fromBackdrop && pressed !== event.target) return;
    closeOverlay(overlay, stack);
  });
  source.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    if (stack.escape()) event.preventDefault();
  });
}
