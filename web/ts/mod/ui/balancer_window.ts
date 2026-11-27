import { createButton } from "./button.js";
import {
  asText,
  asyncSection,
  el,
  errorOf,
  field,
  note,
  onEnter,
  records,
  showOutcome,
} from "./kind_parts.js";

const enc = encodeURIComponent;

function deviceName(workspace, id) {
  return workspace.devices?.find((d) => d.id === id)?.name ?? id;
}

/* The pool endpoint wants device ids; people type names, so a typed name
   that matches a device resolves to its id and anything else passes as is. */
function memberId(workspace, typed) {
  return workspace.devices?.find((d) => d.name === typed)?.id ?? typed;
}

async function fillPool(doc, box, device, workspace, post, outcome) {
  const res = await post(`/api/lb/list?id=${enc(device.id)}`);
  const err = errorOf(res);
  if (err) throw new Error(err);
  const rows = records(res, "pool");
  box.replaceChildren();
  if (rows.length === 0) {
    box.appendChild(note(doc, "empty", "The pool is empty: add servers."));
    return;
  }
  const list = el(doc, "ul", "kw-list");
  for (const row of rows) {
    const member = asText(row["member"]);
    const served = Number(row["served"]) || 0;
    const item = el(doc, "li", "kw-row", `${deviceName(workspace, member)}: ${served} served`);
    item.appendChild(createButton(doc, {
      label: "Remove",
      className: "kw-remove",
      onClick: () => void (async () => {
        try {
          const out = await post(`/api/devices/lbpool?id=${enc(device.id)}&member=${enc(member)}&remove=1`);
          const removeErr = errorOf(out);
          if (removeErr) showOutcome(doc, outcome, "error", removeErr);
          else {
            showOutcome(doc, outcome, "ok", `${deviceName(workspace, member)} removed from the pool.`);
            await fillPool(doc, box, device, workspace, post, outcome).catch(() => undefined);
          }
        } catch {
          showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
        }
      })(),
    }));
    list.appendChild(item);
  }
  box.appendChild(list);
}

export function renderBalancerWindow(doc, body, device, workspace, post) {
  body.replaceChildren();
  const outcome = el(doc, "div", "kw-outcome");
  let listBox = null;
  const done = asyncSection(doc, body, "Server pool", "Could not load the pool.", (box) => {
    listBox = box;
    return fillPool(doc, box, device, workspace, post, outcome);
  });

  const form = el(doc, "div", "kw-form");
  const server = field(doc, form, "Server");
  const submit = () => void add();
  const add = async () => {
    const typed = server.value.trim();
    if (!typed) {
      showOutcome(doc, outcome, "error", "Type a server name.");
      return;
    }
    try {
      const res = await post(`/api/devices/lbpool?id=${enc(device.id)}&member=${enc(memberId(workspace, typed))}`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else {
        showOutcome(doc, outcome, "ok", `${typed} added to the pool.`);
        server.value = "";
        if (listBox) await fillPool(doc, listBox, device, workspace, post, outcome).catch(() => undefined);
      }
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };
  onEnter(server, submit);
  form.appendChild(createButton(doc, { label: "Add server", className: "kw-submit", onClick: submit }));
  form.appendChild(outcome);
  body.appendChild(form);
  return done;
}
