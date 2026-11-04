import { expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");
const web = join(root, "web");
const read = (name: string) => readFileSync(join(web, name), "utf8");

const PAGES = {
  landingEn: { file: "landing.html", lang: "en", path: "/", other: "/id" },
  landingId: { file: "landing.id.html", lang: "id", path: "/id", other: "/" },
  aboutEn: { file: "about.html", lang: "en", path: "/about", other: "/id/about" },
  aboutId: { file: "about.id.html", lang: "id", path: "/id/about", other: "/about" },
} as const;
const html = Object.fromEntries(Object.entries(PAGES).map(([k, p]) => [k, read(p.file)])) as Record<keyof typeof PAGES, string>;
const css = read("landing.css");
const phone = read("js/phone.js");
const templateIds = readdirSync(join(web, "templates")).map((n) => n.replace(/\.xml$/, ""));
const meta = (page: string, attr: string, name: string) => page.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)">`))?.[1];
const jsonLd = (page: string) => JSON.parse(page.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)![1]!);

for (const [key, p] of Object.entries(PAGES)) {
  const page = html[key as keyof typeof PAGES];

  test(`${p.file}: the language, title, description and robots tags are right`, () => {
    expect(page).toContain(`<html lang="${p.lang}">`);
    const title = page.match(/<title>([^<]+)<\/title>/)![1]!;
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.length).toBeGreaterThan(15);
    const desc = meta(page, "name", "description")!;
    expect(desc.length).toBeGreaterThanOrEqual(70);
    expect(desc.length).toBeLessThanOrEqual(165);
    expect(meta(page, "name", "robots")).toContain("index");
    expect(meta(page, "name", "robots")).not.toContain("noindex");
  });

  test(`${p.file}: the canonical address and both language alternates point at the right pages`, () => {
    expect(page).toContain(`<link rel="canonical" href="{{SITE_URL}}${p.path}">`);
    const en = p.lang === "en" ? p.path : p.other;
    const id = p.lang === "id" ? p.path : p.other;
    expect(page).toContain(`<link rel="alternate" hreflang="en" href="{{SITE_URL}}${en}">`);
    expect(page).toContain(`<link rel="alternate" hreflang="id" href="{{SITE_URL}}${id}">`);
    expect(page).toContain(`<link rel="alternate" hreflang="x-default" href="{{SITE_URL}}${en}">`);
  });

  test(`${p.file}: the social card tags are complete and use the page's own language`, () => {
    const title = page.match(/<title>([^<]+)<\/title>/)![1]!;
    expect(meta(page, "property", "og:title")).toBe(title);
    expect(meta(page, "property", "og:description")).toBe(meta(page, "name", "description"));
    expect(meta(page, "property", "og:url")).toBe(`{{SITE_URL}}${p.path}`);
    expect(meta(page, "property", "og:image")).toBe(`{{SITE_URL}}/landing/og-${p.lang}.png`);
    expect(meta(page, "property", "og:image:width")).toBe("1200");
    expect(meta(page, "property", "og:image:height")).toBe("630");
    expect(meta(page, "property", "og:image:alt")!.length).toBeGreaterThan(10);
    expect(meta(page, "property", "og:locale")).toBe(p.lang === "en" ? "en_US" : "id_ID");
    expect(meta(page, "property", "og:locale:alternate")).toBe(p.lang === "en" ? "id_ID" : "en_US");
    expect(meta(page, "name", "twitter:card")).toBe("summary_large_image");
    expect(meta(page, "name", "twitter:creator")).toBe("@KMassidik");
    expect(meta(page, "name", "twitter:image")).toBe(`{{SITE_URL}}/landing/og-${p.lang}.png`);
  });

  test(`${p.file}: the structured data is valid and says what the page is`, () => {
    const data = jsonLd(page);
    const types = data["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(types).toContain("WebSite");
    expect(types).toContain("SoftwareApplication");
    const app = data["@graph"].find((n: { "@type": string }) => n["@type"] === "SoftwareApplication");
    expect(app.offers.price).toBe("0");
    expect(app.inLanguage).toBe(p.lang);
    expect(app.license).toContain("MIT");
    expect(app.author.name).toBe("Kurnia Massidik");
    expect(JSON.stringify(data)).not.toMatch(/aggregateRating|review/i); // nothing invented
    expect(types).toContain(p.file.startsWith("landing") ? "FAQPage" : "AboutPage");
  });

  test(`${p.file}: one main heading, a skip link, named sections, sized pictures`, () => {
    expect(page.match(/<h1>/g)?.length).toBe(1);
    expect(page).toContain('<a class="skip" href="#main">');
    expect(page).toContain('<main id="main">');
    for (const [tag] of page.matchAll(/<img [^>]*>/g)) {
      expect(tag).toMatch(/\bwidth="\d+"/);
      expect(tag).toMatch(/\bheight="\d+"/);
      expect(tag).toMatch(/\balt="/);
    }
    for (const [, id] of page.matchAll(/aria-labelledby="([a-z]+)"/g)) expect(page).toContain(`id="${id}"`);
    expect(page).not.toContain("<script src=");
    expect(page).not.toContain("<canvas");
  });

  test(`${p.file}: the name is Takumi, and no link ends in .html`, () => {
    const withoutRepoUrl = page.replaceAll("github.com/Kmassidik/TakumiNet", "");
    expect(withoutRepoUrl).not.toMatch(/takuminet/i);
    expect(page).not.toMatch(/href="[^"]*\.html"/);
    expect(page).not.toContain("—"); // no em dashes in the words
  });

  test(`${p.file}: the language switch leads to the same page in the other language`, () => {
    const other = p.lang === "en" ? "id" : "en";
    expect(page).toContain(`<a class="lang" href="${p.other}" hreflang="${other}" lang="${other}"`);
    expect(page).toContain(`>${other.toUpperCase()}</a>`); // the button names the language you will get
  });
}

test("the page files are exactly what the template makes (run tools/landing/build_pages.py)", () => {
  if (!Bun.which("python3")) return;
  const result = Bun.spawnSync(["python3", join(root, "tools/landing/build_pages.py"), "--check"], { stdout: "pipe", stderr: "pipe" });
  expect(result.stdout.toString(), result.stderr.toString()).toContain("stale: none");
  expect(result.exitCode).toBe(0);
});

test("English and Indonesian pages have the same structure, so neither falls behind", () => {
  const shape = (page: string) => ({
    h2: page.match(/<h2/g)?.length,
    h3: page.match(/<h3/g)?.length,
    imgs: page.match(/<img /g)?.length,
    sections: page.match(/<section/g)?.length,
    details: page.match(/<details>/g)?.length ?? 0,
    links: [...page.matchAll(/href="(\/workspace[^"]*|https:\/\/[^"]+)"/g)].map((m) => m[1]),
  });
  expect(shape(html.landingId)).toEqual(shape(html.landingEn));
  expect(shape(html.aboutId)).toEqual(shape(html.aboutEn));
});

test("the Indonesian pages are really Indonesian: no leftover English sentences", () => {
  for (const page of [html.landingId, html.aboutId]) {
    for (const english of ["Build a network", "Open the workspace", "Questions people ask", "Check your work", "Why it exists", "Who makes it", "Free, and yours to change", "Is Takumi free"]) {
      expect(page, english).not.toContain(english);
    }
  }
  expect(html.landingId).toContain("Bangun jaringan dan lihat cara kerjanya.");
  expect(html.landingId).toContain("Gratis, dan bebas kamu ubah");
});

test("the visible questions are exactly the questions in the structured data", () => {
  for (const key of ["landingEn", "landingId"] as const) {
    const page = html[key];
    const faq = jsonLd(page)["@graph"].find((n: { "@type": string }) => n["@type"] === "FAQPage");
    const shown = [...page.matchAll(/<details><summary>([^<]+)<\/summary><p>([^<]+)<\/p><\/details>/g)].map((m) => [m[1], m[2]]);
    const known = faq.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => [q.name, q.acceptedAnswer.text]);
    expect(shown.length).toBe(5);
    expect(shown.map((s) => s.map((t) => t!.replaceAll("&amp;", "&")))).toEqual(known);
  }
});

test("every example and lesson link opens a template that exists, once each in the lists", () => {
  for (const key of ["landingEn", "landingId"] as const) {
    const page = html[key];
    const ids = [...page.matchAll(/href="\/workspace\?open=([a-z0-9-]+)"/g)].map((m) => m[1]!);
    for (const id of ids) expect(templateIds, id).toContain(id);
    expect(new Set(ids)).toEqual(new Set(templateIds));
    const lists = page.slice(page.indexOf('<section class="start" aria-labelledby="start">'), page.indexOf('<section class="start faq"'));
    const listed = [...lists.matchAll(/href="\/workspace\?open=([a-z0-9-]+)"/g)].map((m) => m[1]!);
    expect(listed.length).toBe(new Set(listed).size);
    expect(listed.length).toBe(templateIds.length);
  }
});

test("the page links only to addresses the server answers", () => {
  const known = new Set(["/", "/id", "/about", "/id/about", "/workspace"]);
  for (const page of Object.values(html)) {
    for (const [, href] of page.matchAll(/href="([^"#]+)"/g)) {
      if (href!.startsWith("http") || href!.startsWith("{{")) continue;
      const path = href!.split("?")[0]!;
      if (path.startsWith("/art3d/") || path.startsWith("/landing/") || path.endsWith(".css")) continue;
      expect(known.has(path), href).toBe(true);
    }
  }
});

test("colours come only from the tokens", () => {
  const declarations = [...css.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]!).join("\n");
  expect(declarations.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
  for (const page of Object.values(html)) expect(page).not.toMatch(/style="[^"]*#[0-9a-fA-F]{3,6}/);
});

test("the page is white, with ink, teal and grey blocks", () => {
  expect(css).toMatch(/body \{ margin: 0; background: var\(--white\)/);
  expect(css).toContain("html { color-scheme: light;");
  for (const tone of ["ink", "teal", "grey"]) {
    expect(html.landingEn).toMatch(new RegExp(`class="block ${tone}`));
    expect(html.aboutEn).toMatch(new RegExp(`class="block ${tone}`));
  }
});

test("phones get a note instead of buttons, using the same query as the workspace", () => {
  const query = phone.match(/PHONE_QUERY = '([^']+)'/)![1]!;
  expect(css).toContain(`@media ${query} {`);
  expect(css).toMatch(/\.only-computer \{ display: none !important; \}/);
  expect(html.landingEn).toContain('class="phone-note"');
  expect(html.landingId).toContain('class="phone-note"');
});

test("people who ask for less motion get a still Takumi", () => {
  const block = css.slice(css.indexOf("prefers-reduced-motion"));
  expect(block).toMatch(/\.slot img, \.slot:hover img \{ animation: none; transform: none; transition: none; \}/);
});

test("the pictures of Takumi exist, the first one is the hero, and no 3D library is left", () => {
  for (const key of Object.keys(PAGES) as Array<keyof typeof PAGES>) {
    const slots = [...html[key].matchAll(/<div class="slot[^"]*"><img src="(\/landing\/takumi-([a-z]+)\.webp)" alt="([^"]*)"/g)];
    expect(slots.length).toBe(key.startsWith("landing") ? 5 : 4);
    for (const [, src, pose] of slots) {
      expect(["idle", "wave", "think", "happy"]).toContain(pose!);
      expect(existsSync(join(web, src!.slice(1))), src).toBe(true);
    }
    expect(slots[0]![2]).toBe("wave");
    expect(slots[0]![3]!.length).toBeGreaterThan(8);
    expect(html[key]).toContain('fetchpriority="high"');
  }
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  expect(Object.keys(pkg.devDependencies)).toEqual(["typescript"]);
  expect(existsSync(join(web, "js/landing.js"))).toBe(false);
});

test("the social card pictures are 1200 x 630 and small", () => {
  for (const lang of ["en", "id"]) {
    const file = join(web, `landing/og-${lang}.png`);
    const png = readFileSync(file);
    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    expect(statSync(file).size).toBeLessThan(300 * 1024);
  }
});

test("the About pages are written in plain words and share the landing styles", () => {
  for (const key of ["aboutEn", "aboutId"] as const) {
    const about = html[key];
    expect(about).toContain('href="/tokens.css"');
    expect(about).toContain('href="/landing.css"');
    expect(about).not.toContain("<style");
    for (const banned of ["ChatGPT", "tools/", "MANIFEST", "SHA-256", "provenance", "pipeline"]) expect(about, banned).not.toContain(banned);
    for (const id of ["why", "who", "open", "inside"]) expect(about).toContain(`aria-labelledby="${id}"`);
  }
});

test("the workspace page is kept out of search results, and the sitemap and robots rules exist in the server", () => {
  expect(read("index.html")).toContain('<meta name="robots" content="noindex,follow">');
  const routes = readFileSync(join(root, "src/http/static_routes.rs"), "utf8");
  expect(routes).toContain("Disallow: /workspace");
  expect(routes).toContain("Disallow: /api/");
  expect(routes).toContain('hreflang=\\"x-default\\"');
});

test("no button on the landing pages turns black or ink on hover", () => {
  const hovers = [...css.matchAll(/([^{}]+:hover[^{}]*)\{([^{}]*)\}/g)].filter(([, sel]) => /\.(pill|lang|skip)/.test(sel!));
  expect(hovers.length).toBeGreaterThan(3);
  for (const [, sel, body] of hovers) {
    expect(body, sel!.trim()).not.toMatch(/background:\s*var\(--ink-block\)/);
    expect(body, sel!.trim()).not.toMatch(/background:\s*var\(--black\)/);
  }
});
