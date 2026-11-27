/* Has the workspace changed since it was last blank, opened, imported or saved?
   The page warns before closing only when the answer is yes, so a stray refresh
   cannot throw work away, while an untouched or empty page leaves silently. */

/* Only what the user can change by editing: devices, cables and notes. Captured
   packets and playback position are not work and are left out. */
export function fingerprint(ws) {
  if (!ws) return "";
  const pick = (list, keys) =>
    (list ?? []).map((item) => keys.map((key) => item[key] ?? null));
  return JSON.stringify({
    d: pick(ws.devices, ["id", "name", "model", "x", "y", "ip", "prefix", "gw"]),
    l: pick(ws.links, ["a", "aPort", "b", "bPort", "kind"]),
    n: pick(ws.notes, ["id", "x", "y", "color", "text"]),
  });
}

export function isEmpty(ws) {
  return !ws || ((ws.devices?.length ?? 0) === 0 && (ws.notes?.length ?? 0) === 0);
}

/* `clean` is the fingerprint taken at the last clean moment, or null when none
   was taken (then nothing is known, so nothing is warned about). */
export function hasUnsaved(ws, clean) {
  if (clean === null || isEmpty(ws)) return false;
  return fingerprint(ws) !== clean;
}
