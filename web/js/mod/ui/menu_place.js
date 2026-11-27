const MARGIN = 4;

const clamp = (value, low, high) =>
  Math.min(Math.max(value, low), Math.max(low, high));

/* Where a context menu opens: at the pointer, pulled back inside the viewport
   when it would spill past an edge. */
export function placeMenu(at, menu, view) {
  return {
    x: clamp(at.x, MARGIN, view.w - menu.w - MARGIN),
    y: clamp(at.y, MARGIN, view.h - menu.h - MARGIN),
  };
}

/* Where a submenu opens: to the right of its parent item, flipped to the left
   when the right side has no room, and never past the bottom edge. */
export function placeSubmenu(parent, menu, view) {
  const right = parent.x + parent.w - 2;
  const x = right + menu.w + MARGIN <= view.w ? right : parent.x - menu.w + 2;
  return {
    x: clamp(x, MARGIN, view.w - menu.w - MARGIN),
    y: clamp(parent.y - MARGIN, MARGIN, view.h - menu.h - MARGIN),
  };
}
