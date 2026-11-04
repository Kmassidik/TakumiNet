import type { DocLike, ElementLike } from "./dom";
import { parsePortsInfo, renderPortsPanel } from "./ports_panel";
import {
  asyncSection,
  note,
  type GetText,
  type KindDevice,
  type Post,
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

function portsSection(doc: DocLike, body: ElementLike, device: KindDevice, getText: GetText, post: Post): Promise<void> {
  return asyncSection(doc, body, "Ports", "Could not load the ports.", async function fill(box): Promise<void> {
    const ports = parsePortsInfo(await getText(`/api/devices/ports?id=${encodeURIComponent(device.id)}`));
    box.replaceChildren();
    if (ports.length === 0) box.appendChild(note(doc, "empty", "This radio has no ports."));
    else renderPortsPanel(doc, box, ports, { deviceId: device.id, post, refresh: () => void fill(box) });
  });
}

export function renderRadioWindow(
  doc: DocLike,
  body: ElementLike,
  device: KindDevice,
  getText: GetText,
  post: Post,
): Promise<void> {
  body.replaceChildren();
  const sections = [portsSection(doc, body, device, getText, post)];
  if (device.kind === "client-radio") {
    sections.push(
      asyncSection(doc, body, "Radio delay", "Could not read the radio delay.", async (box) => {
        const saved = await getText("/api/export");
        const ms = portDelayMs(saved, device.id);
        box.replaceChildren();
        box.appendChild(note(doc, "plain", `This radio link adds ${ms} ms.`));
      }),
    );
  }
  return Promise.all(sections).then(() => undefined);
}
