import { readCollapsed, writeCollapsed } from "./collapse";

export const SIDEBAR_DEFAULT_WIDTH = 330;
const MIN_WIDTH = 240;
const MAX_SHARE = 0.6;
const WIDTH_KEY = "pt-web:sidebar-width";

export function clampSidebarWidth(width: number, viewport: number): number {
  const max = Math.max(MIN_WIDTH, viewport * MAX_SHARE);
  return Math.min(max, Math.max(MIN_WIDTH, width));
}

function readSavedWidth(): number {
  try {
    const saved = Number(localStorage.getItem(WIDTH_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : SIDEBAR_DEFAULT_WIDTH;
  } catch {
    return SIDEBAR_DEFAULT_WIDTH;
  }
}

function saveWidth(width: number): void {
  try {
    localStorage.setItem(WIDTH_KEY, String(Math.round(width)));
  } catch {
    /* storage can be blocked; the width then lasts for this page only */
  }
}

export function wireSidebar(): void {
  const main = document.querySelector<HTMLElement>(".main");
  if (!main) return;
  const sidebar = document.getElementById("sidebar");
  const splitter = document.getElementById("sidebar-splitter");
  const hide = document.querySelector<HTMLElement>('[data-collapse-for="sidebar"]');
  const restore = document.getElementById("sidebar-restore");
  if (!sidebar || !splitter || !hide || !restore) return;

  const setWidth = (px: number) => main.style.setProperty("--sidebar-width", `${px}px`);
  setWidth(clampSidebarWidth(readSavedWidth(), window.innerWidth));

  const store = (() => {
    try {
      return localStorage;
    } catch {
      return null;
    }
  })();
  const setHidden = (hidden: boolean) => {
    main.classList.toggle("sidebar-hidden", hidden);
    restore.hidden = !hidden;
    writeCollapsed(store, "sidebar", hidden);
  };
  main.classList.toggle("sidebar-hidden", readCollapsed(store).sidebar === true);
  restore.hidden = !main.classList.contains("sidebar-hidden");
  hide.addEventListener("click", () => setHidden(true));
  restore.addEventListener("click", () => setHidden(false));
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "\\" || ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) return;
    setHidden(!main.classList.contains("sidebar-hidden"));
  });

  splitter.addEventListener("pointerdown", (down: PointerEvent) => {
    down.preventDefault();
    splitter.setPointerCapture(down.pointerId);
    const move = (ev: PointerEvent) => {
      const width = clampSidebarWidth(window.innerWidth - ev.clientX, window.innerWidth);
      setWidth(width);
    };
    const up = () => {
      splitter.removeEventListener("pointermove", move);
      const width = parseFloat(main.style.getPropertyValue("--sidebar-width")) || SIDEBAR_DEFAULT_WIDTH;
      saveWidth(width);
    };
    splitter.addEventListener("pointermove", move);
    splitter.addEventListener("pointerup", up, { once: true });
  });
  splitter.addEventListener("dblclick", () => {
    setWidth(SIDEBAR_DEFAULT_WIDTH);
    saveWidth(SIDEBAR_DEFAULT_WIDTH);
  });

  const tabs = sidebar.querySelectorAll<HTMLButtonElement>("[data-side-tab]");
  const selectTab = (name: string) => {
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.sideTab === name));
    sidebar.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.panel !== name;
    });
  };
  tabs.forEach((tab) => tab.addEventListener("click", () => selectTab(tab.dataset.sideTab ?? "events")));
  (globalThis as { selectSidebarTab?: (name: string) => void }).selectSidebarTab = selectTab;
}
