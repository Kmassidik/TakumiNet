/* Rules for the hover label on icon buttons, kept apart from the page so they
   can be tested without a browser. */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TipPlace {
  x: number;
  y: number;
  above: boolean;
}

const GAP = 6;
const EDGE = 4;

/* Below the button when it fits, otherwise above; never past a window edge. */
export function placeTip(anchor: Box, tip: { w: number; h: number }, viewport: { w: number; h: number }): TipPlace {
  const below = anchor.y + anchor.h + GAP;
  const above = below + tip.h > viewport.h - EDGE && anchor.y - GAP - tip.h >= EDGE;
  const y = above ? anchor.y - GAP - tip.h : below;
  const centred = anchor.x + anchor.w / 2 - tip.w / 2;
  const x = Math.max(EDGE, Math.min(centred, viewport.w - tip.w - EDGE));
  return { x, y: Math.max(EDGE, y), above };
}

const SHORTCUTS: Readonly<Record<string, string>> = {
  save: "Ctrl+S",
  undo: "Ctrl+Z",
  redo: "Ctrl+Y",
  copy: "Ctrl+C",
  paste: "Ctrl+V",
  delete: "Del",
  play: "Space",
  play2: "Space",
  step: "→",
  forward: "→",
  back: "←",
};

/* The shortcut to show beside a label, from the button's action. */
export function shortcutFor(data: { action?: string; sim?: string; collapseFor?: string }): string {
  if (data.collapseFor === "sidebar") return "\\";
  return SHORTCUTS[data.action ?? data.sim ?? ""] ?? "";
}

/* A label worth showing: not empty, and not just repeating the button's own text. */
export function tipText(label: string | null | undefined, ownText: string | null | undefined): string {
  const text = (label ?? "").trim();
  if (!text) return "";
  return text === (ownText ?? "").trim() ? "" : text;
}

export interface TipDeps {
  show(anchor: unknown, text: string, shortcut: string): void;
  hide(): void;
  setTimer(fn: () => void, ms: number): unknown;
  clearTimer(handle: unknown): void;
  now(): number;
}

export const SHOW_DELAY_MS = 300;
export const GRACE_MS = 500;

/* Waits a moment before the first label, but moves to the next one at once when
   the pointer slides from one button to its neighbour. */
export class TipController {
  private pending: unknown = null;
  private shownFor: unknown = null;
  private lastHidden = -Infinity;

  constructor(private readonly deps: TipDeps) {}

  get visible(): boolean {
    return this.shownFor !== null;
  }

  enter(anchor: unknown, text: string, shortcut = ""): void {
    if (!text) return;
    if (this.shownFor === anchor) return;
    this.cancel();
    const quick = this.visible || this.deps.now() - this.lastHidden < GRACE_MS;
    const run = () => {
      this.pending = null;
      this.shownFor = anchor;
      this.deps.show(anchor, text, shortcut);
    };
    if (quick) run();
    else this.pending = this.deps.setTimer(run, SHOW_DELAY_MS);
  }

  leave(): void {
    this.cancel();
    if (this.visible) {
      this.shownFor = null;
      this.lastHidden = this.deps.now();
      this.deps.hide();
    }
  }

  private cancel(): void {
    if (this.pending !== null) this.deps.clearTimer(this.pending);
    this.pending = null;
  }
}
