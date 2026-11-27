import { linkEnds, note, rowList, section } from "./kind_parts.js";

export function renderProviderWindow(doc, body, device, workspace) {
  body.replaceChildren();
  body.appendChild(note(doc, "plain", "The other end is the provider."));
  const box = section(doc, body, "Cable ends");
  const ends = linkEnds(workspace, device.id);
  if (ends.length === 0) box.appendChild(note(doc, "empty", "No cable is connected yet."));
  else box.appendChild(rowList(doc, ends));
}
