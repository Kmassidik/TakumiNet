export interface Spot {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface AnchorBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MARGIN = 4;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(Math.max(value, low), Math.max(low, high));

/* Where a context menu opens: at the pointer, pulled back inside the viewport
   when it would spill past an edge. */
export function placeMenu(at: Spot, menu: Size, view: Size): Spot {
  return {
    x: clamp(at.x, MARGIN, view.w - menu.w - MARGIN),
    y: clamp(at.y, MARGIN, view.h - menu.h - MARGIN),
  };
}

/* Where a submenu opens: to the right of its parent item, flipped to the left
   when the right side has no room, and never past the bottom edge. */
export function placeSubmenu(parent: AnchorBox, menu: Size, view: Size): Spot {
  const right = parent.x + parent.w - 2;
  const x = right + menu.w + MARGIN <= view.w ? right : parent.x - menu.w + 2;
  return {
    x: clamp(x, MARGIN, view.w - menu.w - MARGIN),
    y: clamp(parent.y - MARGIN, MARGIN, view.h - menu.h - MARGIN),
  };
}
