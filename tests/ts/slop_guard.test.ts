import { expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/* Guards against old bad patterns coming back. Each test names the rule it
   protects. They read the shipped files, so they cannot drift from the app. */

const web = join(import.meta.dir, "../../web");
const index = readFileSync(join(web, "index.html"), "utf8");
const jsDir = join(web, "js");
const sources = readdirSync(jsDir)
  .filter((n) => n.endsWith(".js") && n !== "ui.js")
  .map((n) => ({ name: n, text: readFileSync(join(jsDir, n), "utf8") }));

function overlays(): string[] {
  const parts = index.split(/<div id="[a-z-]+" class="overlay[^"]*"/).slice(1);
  return parts.map((p) => p.split("\n<div id=")[0] ?? p);
}

test("dialogs: every overlay has exactly one shared close button", () => {
  const list = overlays();
  expect(list.length).toBeGreaterThanOrEqual(9);
  for (const body of list) {
    expect(body.split("data-dialog-close").length - 1).toBe(1);
  }
});

test("dialogs: no old close styles or per-dialog close ids remain in the page", () => {
  expect(index).not.toMatch(/class="close"/);
  expect(index).not.toMatch(/winbtn/);
  expect(index).not.toMatch(/id="[a-z]+-close"/);
});

test("dialogs: no hand-written close handler on a dialog", () => {
  for (const { name, text } of sources) {
    expect(text, name).not.toMatch(/-close'\)\.onclick/);
    expect(text, name).not.toMatch(/\.onclick = \(e(v)?\) => \{ if \(e(v)?\.target === (win|dialog)\)/);
  }
});

test("dialogs: preferences sits inside an overlay, not loose on the page", () => {
  expect(index).toMatch(/<div id="prefs-dialog" class="overlay"/);
});

test("minimize: the status bar holds no component toggles", () => {
  const status = index.slice(index.indexOf('<div class="statusbar">'));
  expect(status.split("</div>")[0]).not.toMatch(/<button/);
});

test("minimize: every collapsible bar has exactly one handle on the component", () => {
  const ids = [...index.matchAll(/data-collapsible="([a-z-]+)"/g)].map((m) => m[1]);
  expect(ids).toEqual(["toolbar-primary", "toolbar-secondary", "palette"]);
  for (const id of [...ids, "sidebar"]) {
    expect(index.split(`data-collapse-for="${id}"`).length - 1).toBe(1);
  }
});

test("palette: tiles come only from the chosen category", () => {
  const palette = sources.find((s) => s.name === "palette.js")!.text;
  expect(palette).toMatch(/paletteTiles\(paletteGroup, data\.palette\)/);
  expect(palette).not.toMatch(/for \(const p of data\.palette\)/);
});

test("menus: File holds only file actions, and Examples has its two sections", () => {
  const file = index.slice(index.indexOf("<button>File</button>"), index.indexOf("<button>Edit</button>"));
  expect(file).not.toMatch(/gallery/i);
  expect(file).not.toMatch(/Lesson/);
  const examples = index.slice(index.indexOf("<button>Examples</button>"), index.indexOf("<button>Tools</button>"));
  expect(examples).toMatch(/Lessons<\/div>/);
  expect(examples).toMatch(/Example templates<\/div>/);
});
