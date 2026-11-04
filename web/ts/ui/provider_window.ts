import type { DocLike, ElementLike } from "./dom";
import { linkEnds, note, rowList, section, type KindDevice, type KindWorkspace } from "./kind_parts";

export function renderProviderWindow(
  doc: DocLike,
  body: ElementLike,
  device: KindDevice,
  workspace: KindWorkspace,
): void {
  body.replaceChildren();
  body.appendChild(note(doc, "plain", "The other end is the provider."));
  const box = section(doc, body, "Cable ends");
  const ends = linkEnds(workspace, device.id);
  if (ends.length === 0) box.appendChild(note(doc, "empty", "No cable is connected yet."));
  else box.appendChild(rowList(doc, ends));
}
