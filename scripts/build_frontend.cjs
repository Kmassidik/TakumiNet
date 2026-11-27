// Build: compile the TypeScript front end to plain JS the browser runs.
// Two outputs:
//   web/js/app.js      — the mod/ ES-module graph (one bundled classic script)
//   web/js/legacy/     — each legacy web/js/*.ts as its own .js classic script
// bun build strips types; legacy files keep their top-level scope as globals.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const legacyDir = 'web/js';
const legacyTs = fs.readdirSync(legacyDir).filter((n) => n.endsWith('.ts'));

// 1. The module graph: bundle mod/main.ts into one classic script. The bundle
//    sets globalThis bridges the legacy files read.
execSync('bun build web/ts/mod/main.ts --target=browser --format=iife --outfile=web/js/app.js', { stdio: 'inherit' });

// 2. Legacy files: strip types per file, keep everything else byte-for-byte.
const t = new Bun.Transpiler({ loader: 'ts' });

// Bake the production URL into the landing/about pages: {{SITE_URL}} is the
// Rust server's template slot; on Pages there is no server, so the build
// replaces it with the real domain from wrangler.toml.
const siteUrl = 'https://takumi.kurniatech.my.id';
const web = 'web';
const pages = ['landing.html', 'landing.id.html', 'about.html', 'about.id.html'];
for (const f of pages) {
  const p = path.join(web, f);
  if (!fs.existsSync(p)) continue;
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll('{{SITE_URL}}', siteUrl));
}

fs.mkdirSync(path.join(legacyDir, 'legacy'), { recursive: true });
for (const f of legacyTs) {
  const code = fs.readFileSync(path.join(legacyDir, f), 'utf8');
  fs.writeFileSync(path.join(legacyDir, 'legacy', f.replace(/\.ts$/, '.js')), t.transformSync(code));
}

// 3. Art: the pages and code reference /art3d/<group>/<name>.webp; the Rust
//    server rewrote that to art/3d/. A static host serves files as-is, so copy
//    the tree to where the URLs point.
fs.cpSync(path.join(web, 'art', '3d'), path.join(web, 'art3d'), { recursive: true });
console.log(`app.js bundled; ${legacyTs.length} legacy files compiled to web/js/legacy/`);
