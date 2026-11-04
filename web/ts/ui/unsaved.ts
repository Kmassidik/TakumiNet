/* Has the workspace changed since it was last blank, opened, imported or saved?
   The page warns before closing only when the answer is yes, so a stray refresh
   cannot throw work away, while an untouched or empty page leaves silently. */

export interface WorkspaceLike {
  devices?: ReadonlyArray<Record<string, unknown>>;
  links?: ReadonlyArray<Record<string, unknown>>;
  notes?: ReadonlyArray<Record<string, unknown>>;
}

/* Only what the user can change by editing: devices, cables and notes. Captured
   packets and playback position are not work and are left out. */
export function fingerprint(ws: WorkspaceLike | null | undefined): string {
  if (!ws) return "";
  const pick = (list: WorkspaceLike["devices"], keys: string[]) =>
    (list ?? []).map((item) => keys.map((key) => item[key] ?? null));
  return JSON.stringify({
    d: pick(ws.devices, ["id", "name", "model", "x", "y", "ip", "prefix", "gw"]),
    l: pick(ws.links, ["a", "aPort", "b", "bPort", "kind"]),
    n: pick(ws.notes, ["id", "x", "y", "color", "text"]),
  });
}

export function isEmpty(ws: WorkspaceLike | null | undefined): boolean {
  return !ws || ((ws.devices?.length ?? 0) === 0 && (ws.notes?.length ?? 0) === 0);
}

/* `clean` is the fingerprint taken at the last clean moment, or null when none
   was taken (then nothing is known, so nothing is warned about). */
export function hasUnsaved(ws: WorkspaceLike | null | undefined, clean: string | null): boolean {
  if (clean === null || isEmpty(ws)) return false;
  return fingerprint(ws) !== clean;
}
