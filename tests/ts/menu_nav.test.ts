import { expect, test } from "bun:test";
import { MenuController, firstItem, lastItem, stepItem, type MenuView } from "../../web/ts/ui/menu_nav";

function setup(menus: boolean[][] = [[true, true, false, true], [true], [false, true]]) {
  const log: string[] = [];
  const view: MenuView = {
    count: () => menus.length,
    enabled: (m) => menus[m]!,
    setOpen: (m) => log.push(`open:${m}`),
    setActive: (m, i) => log.push(`active:${m}.${i}`),
    choose: (m, i) => log.push(`choose:${m}.${i}`),
    focusHead: (m) => log.push(`head:${m}`),
  };
  return { c: new MenuController(view), log };
}

test("stepping skips disabled items and wraps round", () => {
  const e = [true, true, false, true];
  expect(stepItem(e, 1, 1)).toBe(3);
  expect(stepItem(e, 3, 1)).toBe(0);
  expect(stepItem(e, 0, -1)).toBe(3);
  expect(stepItem(e, null, 1)).toBe(0);
  expect(stepItem(e, null, -1)).toBe(3);
  expect(firstItem([false, true])).toBe(1);
  expect(lastItem([true, false])).toBe(0);
});

test("a menu with nothing to choose never lands on an item, and never loops forever", () => {
  expect(stepItem([false, false], 0, 1)).toBeNull();
  expect(stepItem([], null, 1)).toBeNull();
});

test("stepping never lands on a disabled item, from any start", () => {
  const e = [false, true, false, false, true, false];
  for (let from = 0; from < e.length; from++) {
    for (const dir of [1, -1] as const) expect(e[stepItem(e, from, dir)!]).toBe(true);
  }
});

test("click opens a menu; hovering another head then switches; clicking the open head closes", () => {
  const { c } = setup();
  c.hoverHead(1);
  expect(c.open).toBeNull(); // nothing opens on hover alone
  c.clickHead(0);
  expect(c.open).toBe(0);
  c.hoverHead(2);
  expect(c.open).toBe(2);
  c.clickHead(2);
  expect(c.open).toBeNull();
  expect(c.engaged).toBe(false);
});

test("hovering an item lights it, but never a disabled one or one in a closed menu", () => {
  const { c } = setup();
  c.clickHead(0);
  c.hoverItem(0, 3);
  expect(c.active).toBe(3);
  c.hoverItem(0, 2);
  expect(c.active).toBe(3);
  c.hoverItem(1, 0);
  expect(c.active).toBe(3);
});

test("arrow keys move through items and across menus", () => {
  const { c } = setup();
  c.clickHead(0);
  expect(c.key("ArrowDown")).toBe(true);
  expect(c.active).toBe(0);
  c.key("ArrowDown");
  c.key("ArrowDown");
  expect(c.active).toBe(3); // skipped the disabled item
  c.key("ArrowDown");
  expect(c.active).toBe(0);
  c.key("ArrowUp");
  expect(c.active).toBe(3);
  c.key("ArrowRight");
  expect([c.open, c.active]).toEqual([1, 0]);
  c.key("ArrowLeft");
  c.key("ArrowLeft");
  expect(c.open).toBe(2); // wraps to the last menu
  expect(c.active).toBe(1); // its first enabled item
});

test("Home and End jump to the first and last enabled item", () => {
  const { c } = setup();
  c.clickHead(0);
  c.key("End");
  expect(c.active).toBe(3);
  c.key("Home");
  expect(c.active).toBe(0);
});

test("Enter runs the lit item and closes the menu; with nothing lit it does nothing", () => {
  const { c, log } = setup();
  c.clickHead(0);
  c.key("Enter");
  expect(log.some((l) => l.startsWith("choose"))).toBe(false);
  expect(c.open).toBe(0);
  c.key("ArrowDown");
  c.key("Enter");
  expect(log.at(-1)).toBe("choose:0.0");
  expect(c.open).toBeNull();
  expect(c.engaged).toBe(false);
});

test("Escape closes the menu first, then leaves the bar", () => {
  const { c } = setup();
  c.clickHead(1);
  expect(c.key("Escape")).toBe(true);
  expect(c.open).toBeNull();
  expect(c.bar).toBe(1);
  expect(c.key("Escape")).toBe(true);
  expect(c.engaged).toBe(false);
});

test("Alt on its own puts the keyboard on the bar; Down opens; Alt again leaves", () => {
  const { c } = setup();
  expect(c.key("ArrowDown")).toBe(false); // keys belong to the page until the bar is engaged
  c.toggleBar();
  expect(c.bar).toBe(0);
  c.key("ArrowRight");
  expect(c.bar).toBe(1);
  c.key("ArrowDown");
  expect(c.open).toBe(1);
  c.toggleBar();
  expect(c.engaged).toBe(false);
});

test("keys that are not menu keys are left alone while a menu is open", () => {
  const { c } = setup();
  c.clickHead(0);
  expect(c.key("a")).toBe(false);
  expect(c.key("Tab")).toBe(false);
});
