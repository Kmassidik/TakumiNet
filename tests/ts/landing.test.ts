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

test("people who ask for less motion get a still Takumi", () => {
  const block = css.slice(css.indexOf("prefers-reduced-motion"));
  expect(block).toMatch(/\.slot img, \.slot:hover img \{ animation: none; transform: none; transition: none; \}/);
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

test("Takumi has five places on the page, each a picture that exists with its size", () => {
  const slots = [...landing.matchAll(/<div class="slot[^"]*"><img src="(\/landing\/takumi-([a-z]+)\.webp)" alt="([^"]*)" width="512" height="512">/g)];
  expect(slots.length).toBe(5);
  for (const [, src, pose] of slots) {
    expect(["idle", "wave", "think", "happy"]).toContain(pose!);
    expect(existsSync(join(web, src!.slice(1))), src).toBe(true);
  }
  expect(slots[0]![2]).toBe("wave"); // the first one is the middle of the hero, waving hello
  expect(slots[0]![3]).toMatch(/Takumi/); // and it has a description, the others are decoration
});

test("the page needs no script at all, and no 3D library is left in the project", () => {
  expect(landing).not.toContain("<script");
  expect(landing).not.toContain("<canvas");
  const pkg = JSON.parse(readFileSync(join(import.meta.dir, "../../package.json"), "utf8"));
  expect(Object.keys(pkg.devDependencies)).toEqual(["typescript"]);
  expect(existsSync(join(web, "js/landing.js"))).toBe(false);
});

test("every picture on the page has a size, so nothing jumps while it loads", () => {
  for (const [tag] of landing.matchAll(/<img [^>]*>/g)) {
    expect(tag).toMatch(/\bwidth="\d+"/);
    expect(tag).toMatch(/\bheight="\d+"/);
  }
});

test("the About page uses the same tokens and styles as the landing page, and plain words", () => {
  const about = readFileSync(join(web, "about.html"), "utf8");
  expect(about).toContain('href="/tokens.css"');
  expect(about).toContain('href="/landing.css"');
  expect(about).not.toContain("<style");
  for (const banned of ["ChatGPT", "tools/", "MANIFEST", "SHA-256", "provenance", "pipeline", "\u2014"]) expect(about, banned).not.toContain(banned);
  expect(about.match(/<h1>/g)?.length).toBe(1);
  for (const id of ["why", "who", "open", "inside"]) expect(about).toContain(`aria-labelledby="${id}"`);
  for (const tone of ["ink", "teal", "grey"]) expect(about).toMatch(new RegExp(`class="block ${tone}`));
  expect(about).not.toMatch(/href="[^"]*\.html"/);
});
