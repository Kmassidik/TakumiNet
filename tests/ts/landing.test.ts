import { expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const web = join(import.meta.dir, "../../web");
const landing = readFileSync(join(web, "landing.html"), "utf8");
const css = readFileSync(join(web, "landing.css"), "utf8");
const phone = readFileSync(join(web, "js/phone.js"), "utf8");
const templateIds = readdirSync(join(web, "templates")).map((n) => n.replace(/\.xml$/, ""));

test("every example and lesson link opens a template that exists, and every template is linked", () => {
  const ids = [...landing.matchAll(/href="\/workspace\?open=([a-z0-9-]+)"/g)].map((m) => m[1]!);
  for (const id of ids) expect(templateIds, id).toContain(id);
  expect(new Set(ids)).toEqual(new Set(templateIds));
  // the hero button repeats one example; each template appears once in the lists
  const inLists = landing.slice(landing.indexOf('<section class="start" aria-labelledby="start">'));
  const listed = [...inLists.matchAll(/href="\/workspace\?open=([a-z0-9-]+)"/g)].map((m) => m[1]!);
  expect(listed.length).toBe(new Set(listed).size);
  expect(listed.length).toBe(templateIds.length);
});

test("the page links only to addresses the server answers", () => {
  const known = new Set(["/", "/workspace", "/about"]);
  for (const [, href] of landing.matchAll(/href="([^"]+)"/g)) {
    if (href!.startsWith("http")) continue;
    const path = href!.split("?")[0]!;
    if (path.startsWith("/art3d/") || path.startsWith("/landing/") || path.endsWith(".css")) continue;
    expect(known.has(path), href).toBe(true);
  }
  expect(landing).not.toMatch(/href="[^"]*\.html"/);
});

test("colours come only from the tokens", () => {
  const declarations = [...css.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]!).join("\n");
  expect(declarations.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
  expect(landing).not.toMatch(/style="[^"]*#[0-9a-fA-F]{3,6}/);
});

test("phones get a note instead of buttons, using the same query as the workspace", () => {
  const query = phone.match(/PHONE_QUERY = '([^']+)'/)![1]!;
  expect(css).toContain(`@media ${query} {`);
  expect(css).toMatch(/\.only-computer \{ display: none !important; \}/);
  expect(landing).toContain('class="phone-note"');
});

test("people who ask for less motion get the flat pictures, not the live Takumi", () => {
  const block = css.slice(css.indexOf("prefers-reduced-motion"));
  expect(block).toMatch(/#stage \{ display: none; \}/);
  expect(block).toMatch(/\.slot img, \.scene-ready \.slot img \{ opacity: 1; \}/);
  expect(css).toMatch(/\.flat-only #stage \{ display: none; \}/);
});

test("the headline and the main button are present and plain", () => {
  expect(landing).toContain("<h1>Build a network and watch it work.</h1>");
  expect(landing).toMatch(/<a class="pill solid" href="\/workspace">Open the workspace<\/a>/);
  expect(landing).not.toMatch(/[→←]/);
});

test("the page has one main heading and each section is named", () => {
  expect(landing.match(/<h1>/g)?.length).toBe(1);
  for (const id of ["wire", "follow", "check", "start", "free"]) expect(landing).toContain(`aria-labelledby="${id}"`);
});

test("the page is white: no dark page background, and the blocks use the token colours", () => {
  expect(css).toMatch(/body \{ margin: 0; background: var\(--white\)/);
  expect(css).toContain("html { color-scheme: light;");
  expect(landing).not.toContain('name="color-scheme" content="dark"');
  for (const tone of ["ink", "teal", "grey"]) expect(landing).toMatch(new RegExp(`class="block ${tone}`));
});

test("Takumi has five slots, each with a known pose, a side, and a flat picture that exists", () => {
  const slots = [...landing.matchAll(/<div class="slot[^"]*" data-takumi-slot data-pose="([a-z]+)" data-side="([a-z]+)"><img src="([^"]+)"/g)];
  expect(slots.length).toBe(5);
  for (const [, pose, side, src] of slots) {
    expect(["idle", "wave", "think", "happy"]).toContain(pose!);
    expect(["left", "right", "center"]).toContain(side!);
    expect(existsSync(join(web, "art/3d", src!.replace("/art3d/", ""))), src).toBe(true);
  }
  expect(slots[0]![2]).toBe("center"); // the first one is the middle of the hero
  // each slot's pose name is one the scene can strike
  const motion = readFileSync(join(import.meta.dir, "../../web/ts/landing/motion.ts"), "utf8");
  for (const [, pose] of slots) expect(motion).toContain(`"${pose}"`);
});

test("the flat pictures are real pictures with sizes, and the canvas is hidden from screen readers", () => {
  expect(landing).toContain('<canvas id="stage" aria-hidden="true">');
  for (const [tag] of landing.matchAll(/<img [^>]*>/g)) {
    expect(tag).toMatch(/\bwidth="\d+"/);
    expect(tag).toMatch(/\bheight="\d+"/);
  }
  expect(landing).toContain('<script src="/js/landing.js" defer>');
});
