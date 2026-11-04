/* Windows-style menu bar rules, kept apart from the page so they can be tested
   without a browser. The controller knows which menu is open and which item is
   lit; a "view" does the actual showing. */

export interface MenuView {
  count(): number;
  /* Which items of a menu can be chosen (separators are not listed at all). */
  enabled(menu: number): boolean[];
  setOpen(menu: number | null): void;
  setActive(menu: number, item: number | null): void;
  choose(menu: number, item: number): void;
  focusHead(menu: number | null): void;
}

/* Next chosen item from `from` going `dir`, wrapping round and skipping disabled
   ones. Returns null when nothing can be chosen. */
export function stepItem(enabled: readonly boolean[], from: number | null, dir: 1 | -1): number | null {
  const n = enabled.length;
  if (!enabled.some(Boolean)) return null;
  let i = from === null ? (dir === 1 ? -1 : 0) : from;
  for (let k = 0; k < n; k++) {
    i = (i + dir + n) % n;
    if (enabled[i]) return i;
  }
  return null;
}

export const firstItem = (enabled: readonly boolean[]): number | null => stepItem(enabled, null, 1);
export const lastItem = (enabled: readonly boolean[]): number | null => stepItem(enabled, null, -1);

/* "Alt on its own" means Alt went down and up with nothing in between: no other
   key, no mouse press (Alt+click must not wake the menu bar). */
export class AltTracker {
  private alone = false;

  down(): void {
    this.alone = true;
  }

  /* Any other key or mouse press while Alt is held. */
  other(): void {
    this.alone = false;
  }

  /* True when this Alt release was an Alt press on its own. */
  up(): boolean {
    const was = this.alone;
    this.alone = false;
    return was;
  }
}

export class MenuController {
  open: number | null = null;
  active: number | null = null;
  /* The menu bar has the keyboard even when no menu is showing (after Alt or F10). */
  bar: number | null = null;

  constructor(private readonly view: MenuView) {}

  get engaged(): boolean {
    return this.open !== null || this.bar !== null;
  }

  private show(menu: number | null, active: number | null = null): void {
    this.open = menu;
    this.active = active;
    this.view.setOpen(menu);
    if (menu !== null) {
      this.bar = menu;
      this.view.setActive(menu, active);
    }
  }

  clickHead(menu: number): void {
    if (this.open === menu) this.closeAll();
    else this.show(menu);
  }

  /* Once one menu is open, passing over another head opens that one instead. */
  hoverHead(menu: number): void {
    if (this.open !== null && this.open !== menu) this.show(menu);
  }

  hoverItem(menu: number, item: number): void {
    if (this.open !== menu || !this.view.enabled(menu)[item]) return;
    this.active = item;
    this.view.setActive(menu, item);
  }

  closeAll(): void {
    const had = this.engaged;
    this.show(null);
    this.bar = null;
    if (had) this.view.focusHead(null);
  }

  /* Alt or F10 on its own: the bar takes the keyboard, or gives it back. */
  toggleBar(): void {
    if (this.engaged) this.closeAll();
    else {
      this.bar = 0;
      this.view.focusHead(0);
    }
  }

  /* Returns true when the key was used, so the page can stop it. */
  key(key: string): boolean {
    if (!this.engaged) return false;
    const n = this.view.count();
    const current = this.open ?? this.bar ?? 0;
    switch (key) {
      case "ArrowRight":
      case "ArrowLeft": {
        const next = (current + (key === "ArrowRight" ? 1 : n - 1)) % n;
        if (this.open !== null) this.show(next, firstItem(this.view.enabled(next)));
        else {
          this.bar = next;
          this.view.focusHead(next);
        }
        return true;
      }
      case "ArrowDown":
      case "ArrowUp": {
        const dir = key === "ArrowDown" ? 1 : -1;
        if (this.open === null) {
          this.show(current, dir === 1 ? firstItem(this.view.enabled(current)) : lastItem(this.view.enabled(current)));
        } else {
          this.active = stepItem(this.view.enabled(this.open), this.active, dir);
          this.view.setActive(this.open, this.active);
        }
        return true;
      }
      case "Home":
      case "End": {
        if (this.open === null) return true;
        const list = this.view.enabled(this.open);
        this.active = key === "Home" ? firstItem(list) : lastItem(list);
        this.view.setActive(this.open, this.active);
        return true;
      }
      case "Enter":
      case " ": {
        if (this.open === null) this.show(current, firstItem(this.view.enabled(current)));
        else if (this.active !== null) {
          const menu = this.open;
          const item = this.active;
          this.closeAll();
          this.view.choose(menu, item);
        }
        return true;
      }
      case "Escape": {
        if (this.open !== null) {
          const menu = this.open;
          this.show(null);
          this.bar = menu;
          this.view.focusHead(menu);
        } else this.closeAll();
        return true;
      }
      default:
        return false;
    }
  }
}
