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
  expect(templates.length).toBe(10);
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
