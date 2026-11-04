import type { DocLike, ElementLike } from "./dom";
import {
  asyncSection,
  linkEnds,
  note,
  rowList,
  section,
  type GetText,
  type KindDevice,
  type KindWorkspace,
} from "./kind_parts";

/* The saved workspace lists a <port id="…" delay_us="…"> row only when the
   delay differs from the 100 µs default, so missing rows mean the default. */
export function portDelayMs(saved: string, deviceId: string): string {
  let max = 100;
  for (const match of saved.matchAll(/<port id="([^"]+)"[^>]*delay_us="(\d+)"/g)) {
    if (match[1] === deviceId) max = Math.max(max, Number(match[2]));
  }
  const ms = max / 1000;
  return Number.isInteger(ms) ? String(ms) : String(Math.round(ms * 10) / 10);
}

function cableSection(doc: DocLike, body: ElementLike, device: KindDevice, workspace: KindWorkspace): void {
  const box = section(doc, body, "Cabled links");
  const ends = linkEnds(workspace, device.id);
  if (ends.length === 0) box.appendChild(note(doc, "empty", "No cable is connected yet."));
  else box.appendChild(rowList(doc, ends));
}

export function renderRadioWindow(
  doc: DocLike,
  body: ElementLike,
  device: KindDevice,
  workspace: KindWorkspace,
  getText: GetText,
): Promise<void> {
  body.replaceChildren();
  cableSection(doc, body, device, workspace);
  if (device.kind !== "client-radio") return Promise.resolve();
  return asyncSection(doc, body, "Radio delay", "Could not read the radio delay.", async (box) => {
    const saved = await getText("/api/export");
    const ms = portDelayMs(saved, device.id);
    box.replaceChildren();
    box.appendChild(note(doc, "plain", `This radio link adds ${ms} ms.`));
  });
}
