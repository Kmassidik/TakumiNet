import { createButton } from "./button.js";

/* One field of a device inside a workspace reply, for refreshing a list
   after a change without a second request. */
export function deviceField(res, id, key) {
  const devices = Array.isArray(res["devices"]) ? res["devices"] : [];
  return devices.find((d) => d["id"] === id)?.[key];
}

/* "Router 300 — The everyday branch router: …", or "" when the palette does
   not know the model. */
export function modelBlurbLine(workspace, device) {
  const blurb = workspace.palette?.find((p) => p.label === device.model)?.blurb;
  return blurb && device.model ? `${device.model} — ${blurb}` : "";
}

export function el(doc, tag, className, text) {
  const node = doc.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function note(doc, state, text) {
  const p = el(doc, "p", `kw-note kw-${state}`, text);
  p.setAttribute("role", state === "error" ? "alert" : "status");
  return p;
}

export function rowList(doc, items) {
  const list = el(doc, "ul", "kw-list");
  for (const item of items) list.appendChild(el(doc, "li", "kw-row", item));
  return list;
}

export function section(doc, root, title) {
  const wrap = el(doc, "section", "kw-section");
  wrap.appendChild(el(doc, "h3", "kw-heading", title));
  const body = el(doc, "div", "kw-section-body");
  wrap.appendChild(body);
  root.appendChild(wrap);
  return body;
}

/* A section whose contents come from the network: it shows "Loading…" first,
   lets `fill` replace that on success, and on any failure offers a retry that
   runs the same load again. */
export function asyncSection(doc, root, title, errorText, fill) {
  const box = section(doc, root, title);
  const run = async () => {
    box.replaceChildren();
    box.appendChild(note(doc, "loading", "Loading…"));
    try {
      await fill(box);
    } catch {
      box.replaceChildren();
      box.appendChild(note(doc, "error", errorText));
      box.appendChild(createButton(doc, { label: "Try again", className: "kw-retry", onClick: () => void run() }));
    }
  };
  return run();
}

export function field(doc, form, labelText, type = "text") {
  const label = el(doc, "label", "kw-field", labelText);
  const input = el(doc, "input", "kw-input");
  input.setAttribute("type", type);
  if (type === "number") input.setAttribute("min", "1");
  input.setAttribute("autocomplete", "off");
  input.setAttribute("spellcheck", "false");
  label.appendChild(input);
  form.appendChild(label);
  return input;
}

export function onEnter(input, action) {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") action();
  });
}

export function showOutcome(doc, target, state, text) {
  target.replaceChildren();
  target.appendChild(note(doc, state, text));
}

export function records(res, key) {
  const value = res[key];
  return Array.isArray(value) ? value : [];
}

export function asText(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function errorOf(res) {
  return typeof res["error"] === "string" && res["error"] ? res["error"] : null;
}

/* Every cable end of one device, written out with the far end's name. */
export function linkEnds(workspace, id) {
  const name = (deviceId) =>
    workspace.devices?.find((d) => d.id === deviceId)?.name ?? deviceId;
  const ends = [];
  for (const link of workspace.links ?? []) {
    if (link.a === id) ends.push(`${link.aPort} to ${name(link.b)} ${link.bPort}`);
    else if (link.b === id) ends.push(`${link.bPort} to ${name(link.a)} ${link.aPort}`);
  }
  return ends;
}
