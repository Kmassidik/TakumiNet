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

test("menus: File holds only file actions, and Examples has exactly two entries that open the window", () => {
  const file = index.slice(index.indexOf("<button>File</button>"), index.indexOf("<button>Edit</button>"));
  expect(file).not.toMatch(/gallery/i);
  expect(file).not.toMatch(/Lesson/);
  const examples = index.slice(index.indexOf("<button>Examples</button>"), index.indexOf("<button>Tools</button>"));
  const entries = [...examples.matchAll(/<button data-action="([a-z-]+)">([^<]+)<\/button>/g)].map((m) => [m[1], m[2]]);
  expect(entries).toEqual([["show-lessons", "Lessons"], ["show-templates", "Example templates"]]);
});

test("routes: no page is served at an address that ends in .html, except as a redirect", () => {
  const routes = readFileSync(join(import.meta.dir, "../../src/http/static_routes.rs"), "utf8");
  const pages = [...routes.matchAll(/\("GET", "(\/[a-z./-]*\.html)"\) => \(([A-Za-z_]+),/g)];
  for (const [, path, kind] of pages) expect(kind, `${path} must redirect`).toBe("REDIRECT");
  expect(routes).toMatch(/\("GET", "\/about"\)/);
});

test("routes: no link or cached address in the page ends in .html", () => {
  const sw = readFileSync(join(web, "sw.js"), "utf8");
  expect(index).not.toMatch(/href="[^"]*\.html"/);
  expect(readFileSync(join(web, "about.html"), "utf8")).not.toMatch(/href="[^"]*\.html"/);
  expect(sw).not.toMatch(/'\/[a-z]+\.html'/);
});

test("files: .xml is the file type; .tnet appears only where old files are read", () => {
  for (const { name, text } of sources) {
    for (const line of text.split("\n")) {
      if (!line.includes(".tnet")) continue;
      expect(line, `${name}: ${line.trim()}`).toMatch(/xml\|tnet|\.xml,\.tnet|earlier version|legacy/i);
    }
  }
  const templates = readdirSync(join(web, "templates"));
  expect(templates.length).toBe(98);
  expect(templates.every((n) => n.endsWith(".xml"))).toBe(true);
  expect(readFileSync(join(web, "sw.js"), "utf8")).not.toContain(".tnet");
});

test("templates: every example template carries built-in traffic, lessons carry none", () => {
  const dir = join(web, "templates");
  for (const name of readdirSync(dir)) {
    const text = readFileSync(join(dir, name), "utf8");
    if (name.startsWith("tpl-")) expect(text, name).toMatch(/<demo kind="(ping|http)" from="[a-z0-9]+"/);
    else expect(text, name).not.toContain("<demo");
  }
});

test("print: the stylesheet prints the workspace sheet only", () => {
  const css = readFileSync(join(web, "workspace.css"), "utf8");
  expect(css).toContain("@media print");
  expect(css).toMatch(/body > \*:not\(\.print-sheet\)/);
  const actions = sources.find((s) => s.name === "actions.js")!.text;
  expect(actions).not.toMatch(/print\(\) \{ status\('Printing…'\); window\.print\(\); \}/);
});

test("tokens: every colour is defined once in tokens.css, never written into a rule", () => {
  const tokens = readFileSync(join(web, "tokens.css"), "utf8");
  expect(tokens).toMatch(/:root \{/);
  const hex = /#[0-9a-fA-F]{3,8}\b/;
  for (const file of ["workspace.css", "about.html"]) {
    const text = readFileSync(join(web, file), "utf8");
    // strip selectors: only declaration blocks may be checked for colours
    const declarations = [...text.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]!).join("\n");
    const found = declarations.match(new RegExp(hex.source, "g")) ?? [];
    expect(found, `${file} holds raw colours`).toEqual([]);
  }
  expect(index).toMatch(/href="\/tokens\.css"/);
  expect(readFileSync(join(web, "about.html"), "utf8")).toMatch(/href="\/tokens\.css"/);
});

test("tokens: radii and fonts come from the token set", () => {
  const css = readFileSync(join(web, "workspace.css"), "utf8");
  expect(css).not.toMatch(/border-radius:\s*(3|4|6|10)px/);
  expect(css).not.toMatch(/"Segoe UI"/);
  expect(css).not.toMatch(/ui-monospace/);
});

test("tooltips: every icon-only button in the page names itself", () => {
  const buttons = [...index.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
  for (const [whole, attrs, inner] of buttons) {
    const text = inner!.replace(/<img[^>]*>/g, "").replace(/<[^>]+>/g, "").trim();
    if (text) continue; // has visible text
    expect(attrs, whole!.slice(0, 80)).toMatch(/\b(title|aria-label)="[^"]+"/);
  }
});

test("tooltips: the toolbar code gives each icon a title that the hover label shows", () => {
  const toolbar = readFileSync(join(import.meta.dir, "../../web/ts/ui/button.ts"), "utf8");
  expect(toolbar).toMatch(/title/);
});

test("canvas: the drawing buffer follows the canvas box, not just the window", () => {
  const canvas = readFileSync(join(import.meta.dir, "../../web/ts/canvas/workspace_canvas.ts"), "utf8");
  expect(canvas).toContain("ResizeObserver");
  expect(canvas).toContain("bufferSize(");
});

test("play: a second press while Play waits cannot start a second timer", () => {
  const actions = sources.find((s) => s.name === "actions.js")!.text;
  expect(actions).toContain("let playStarting = false;");
  expect(actions).toMatch(/if \(playStarting\) return;/);
  expect(actions.match(/playTimer = setInterval/g)?.length).toBe(1);
});

test("palette: hiding the cable tiles always leaves cable mode", () => {
  const palette = sources.find((s) => s.name === "palette.js")!.text;
  expect(palette).toMatch(/paletteKeepsCableMode\(g\.label\)\) leaveCableMode\(\)/);
  const chrome = sources.find((s) => s.name === "chrome.js")!.text;
  expect(chrome).toContain("leaveCableMode();");
});

test("menus: the menu bar lets go of the keyboard while a dialog is open", () => {
  const bar = readFileSync(join(import.meta.dir, "../../web/ts/ui/menubar.ts"), "utf8");
  expect(bar).toContain('.overlay:not([hidden])');
  expect(bar).toContain("new AltTracker()");
});

test("tooltips: the hover label watches for its button being replaced", () => {
  const tip = readFileSync(join(import.meta.dir, "../../web/ts/ui/tooltip.ts"), "utf8");
  expect(tip).toContain("MutationObserver");
  expect(tip).toContain("isConnected");
});

test("unsaved: every way of starting from a clean workspace marks it clean, and the page warns before leaving", () => {
  const actions = sources.find((s) => s.name === "actions.js")!.text;
  expect(actions.match(/markClean\(\);/g)?.length).toBeGreaterThanOrEqual(4); // import, new, open, save
  expect(sources.find((s) => s.name === "lessons.js")!.text).toContain("markClean();");
  expect(sources.find((s) => s.name === "boot.js")!.text).toContain("beforeunload");
});
