import { MenuController, type MenuView } from "./menu_nav";

/* Connects the menu bar in index.html to the rules in menu_nav.ts. A menu is a
   `.menu` holding a head button and a `.drop` of buttons and links. */
export function wireMenuBar(root: Document): void {
  const menus = [...root.querySelectorAll<HTMLElement>("#menus > .menu")];
  if (!menus.length) return;
  const bar = root.getElementById("menus");
  bar?.setAttribute("role", "menubar");

  const head = (m: number) => menus[m]!.querySelector<HTMLElement>(":scope > button")!;
  const items = (m: number) =>
    [...menus[m]!.querySelectorAll<HTMLElement>(":scope > .drop > button, :scope > .drop > a")];

  menus.forEach((menu, m) => {
    const h = head(m);
    h.setAttribute("aria-haspopup", "menu");
    h.setAttribute("aria-expanded", "false");
    menu.querySelector(":scope > .drop")?.setAttribute("role", "menu");
    menu.querySelector(":scope > .drop")?.querySelectorAll(".sep").forEach((s) => s.setAttribute("role", "separator"));
    items(m).forEach((el) => {
      el.setAttribute("role", "menuitem");
      el.setAttribute("tabindex", "-1");
    });
  });

  const view: MenuView = {
    count: () => menus.length,
    enabled: (m) => items(m).map((el) => !(el as HTMLButtonElement).disabled),
    setOpen(m) {
      menus.forEach((menu, i) => {
        const on = i === m;
        menu.classList.toggle("open", on);
        head(i).setAttribute("aria-expanded", String(on));
        if (!on) items(i).forEach((el) => el.classList.remove("active"));
      });
    },
    setActive(m, item) {
      items(m).forEach((el, i) => el.classList.toggle("active", i === item));
      if (item !== null) items(m)[item]?.focus();
    },
    choose(m, item) {
      items(m)[item]?.click();
    },
    focusHead(m) {
      if (m === null) (root.activeElement as HTMLElement | null)?.blur?.();
      else head(m).focus();
    },
  };
  const controller = new MenuController(view);

  menus.forEach((menu, m) => {
    head(m).addEventListener("click", (ev) => {
      ev.stopPropagation();
      controller.clickHead(m);
    });
    head(m).addEventListener("mouseenter", () => controller.hoverHead(m));
    items(m).forEach((el, i) => {
      el.addEventListener("mouseenter", () => controller.hoverItem(m, i));
    });
    // Choosing anything, including a link, ends the menu.
    menu.querySelector(":scope > .drop")?.addEventListener("click", () => controller.closeAll());
  });

  root.addEventListener("click", (ev) => {
    if (controller.engaged && !(ev.target as HTMLElement).closest?.("#menus")) controller.closeAll();
  });
  window.addEventListener("blur", () => controller.closeAll());

  // Alt or F10 on its own moves the keyboard to the bar, like Windows.
  let altAlone = false;
  root.addEventListener("keydown", (ev) => {
    if (ev.key === "Alt") {
      altAlone = true;
      return;
    }
    altAlone = false;
    if (ev.key === "F10" && !ev.shiftKey) {
      ev.preventDefault();
      controller.toggleBar();
      return;
    }
    if (controller.key(ev.key)) ev.preventDefault();
  }, true);
  root.addEventListener("keyup", (ev) => {
    if (ev.key === "Alt" && altAlone) controller.toggleBar();
    altAlone = false;
  });
}
