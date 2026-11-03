import { expect, test } from "bun:test";
import { clampSidebarWidth, SIDEBAR_DEFAULT_WIDTH } from "../../web/ts/ui/sidebar";

test("L40 sidebar width stays between 240 px and 60 percent of the window", () => {
  expect(clampSidebarWidth(100, 1000)).toBe(240);
  expect(clampSidebarWidth(2000, 1000)).toBe(600);
  expect(clampSidebarWidth(420, 1000)).toBe(420);
  expect(clampSidebarWidth(5000, 400)).toBe(240);
});

test("the default sidebar width is 330 px", () => {
  expect(SIDEBAR_DEFAULT_WIDTH).toBe(330);
});
