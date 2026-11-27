import { createButton } from "./button.js";

export function deviceLabel(device) {
  return device.ip ? `${device.name}, ${device.model}, ${device.ip}/${device.prefix}` : `${device.name}, ${device.model}`;
}

export function renderDeviceList(doc, list, devices, onSelect) {
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
