import { createButton } from "./button";
import type { DocLike, ElementLike } from "./dom";

export interface ListedDevice {
  id: string;
  name: string;
  model: string;
  ip: string;
  prefix: number;
}

export function deviceLabel(device: ListedDevice): string {
  return device.ip ? `${device.name}, ${device.model}, ${device.ip}/${device.prefix}` : `${device.name}, ${device.model}`;
}

export function renderDeviceList(
  doc: DocLike,
  list: ElementLike,
  devices: readonly ListedDevice[],
  onSelect: (id: string) => void,
): void {
  list.replaceChildren();
  for (const device of devices) {
    const item = doc.createElement("li");
    const label = deviceLabel(device);
    const button = createButton(doc, { label: device.name, title: label, onClick: () => onSelect(device.id) });
    button.setAttribute("aria-label", label);
    item.appendChild(button);
    list.appendChild(item);
  }
}
