/* ---------------- 3D icons: our own art, served from /art3d/<group>/<name>.webp ---------------- */
/* On globalThis so the classic scripts that load after this file (palette,
   actions, device_tabs) and the bundled app.js all share one definition. */
function icon3d(key) {
  return "/art3d/" + key + ".webp";
}
