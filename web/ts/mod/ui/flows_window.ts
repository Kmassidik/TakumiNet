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

/* The engine keeps no flow list endpoint; the export file carries the rows as
   <flow dev=".." to=".." mbit=".."/> and <flowspread on="1"/>. */
export function parseFlows(xml) {
  const flows = [];
  for (const m of xml.matchAll(/<flow\s+dev="([^"]*)"\s+to="([^"]*)"\s+mbit="([^"]*)"/g)) {
    flows.push({ from: m[1], to: m[2], mbit: Number(m[3]) || 0 });
  }
  return { flows, spread: /<flowspread\s+on="(1|true)"/.test(xml) };
}

export function loadClass(percent) {
  return percent >= 100 ? "kw-load-danger" : percent >= 70 ? "kw-load-warn" : "kw-load-ok";
}

function deviceName(workspace, id) {
  return workspace.devices?.find((d) => d.id === id)?.name ?? id;
}

function deviceId(workspace, typed) {
  return workspace.devices?.find((d) => d.name === typed)?.id ?? typed;
}

export function renderFlowsWindow(doc, body, workspace, deps) {
  body.replaceChildren();
  const outcome = el(doc, "div", "kw-outcome");
  let loadsBox = null;
  let flowsBox = null;

  const fillLoads = async (box) => {
    const res = await deps.post("/api/flows/list");
    const err = errorOf(res);
    if (err) throw new Error(err);
    const rows = records(res, "links");
    box.replaceChildren();
    if (!rows.length) {
      box.appendChild(note(doc, "empty", "No cables yet. Connect two devices first."));
      return;
    }
    const table = el(doc, "table", "kw-table");
    const head = el(doc, "tr", "");
    for (const title of ["Cable", "Mbit/s", "Capacity", "Load"]) head.appendChild(el(doc, "th", "", title));
    table.appendChild(head);
    for (const row of rows) {
      const tr = el(doc, "tr", "");
      tr.appendChild(el(doc, "td", "", `${asText(row["a"])} ${asText(row["aPort"])} ↔ ${asText(row["b"])} ${asText(row["bPort"])}`));
      tr.appendChild(el(doc, "td", "", `${Number(row["mbit"]) || 0}`));
      tr.appendChild(el(doc, "td", "", `${Number(row["capacity"]) || 0}`));
      const percent = Number(row["percent"]) || 0;
      tr.appendChild(el(doc, "td", loadClass(percent), `${percent}%`));
      table.appendChild(tr);
    }
    box.appendChild(table);
  };

  const refresh = async () => {
    if (loadsBox) await fillLoads(loadsBox).catch(() => undefined);
    if (flowsBox) await fillFlows(flowsBox).catch(() => undefined);
  };

  const setFlow = async (from, to, mbit) => {
    try {
      const res = await deps.post(`/api/flows/set?from=${enc(from)}&to=${enc(to)}&mbit=${mbit}`);
      const err = errorOf(res);
      if (err) {
        showOutcome(doc, outcome, "error", err);
        return;
      }
      showOutcome(doc, outcome, "ok", mbit === 0
        ? `Flow removed: ${deviceName(workspace, from)} → ${deviceName(workspace, to)}.`
        : `Flow set: ${deviceName(workspace, from)} → ${deviceName(workspace, to)} at ${mbit} Mbit/s.`);
      await refresh();
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };

  const setSpread = async (on) => {
    try {
      const res = await deps.post(`/api/flows/set?spread=${on ? "1" : "0"}`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else {
        showOutcome(doc, outcome, "ok", on ? "Flows now spread over spare paths." : "Flows now take one path each.");
        await refresh();
      }
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };

  const fillFlows = async (box) => {
    const { flows, spread } = parseFlows(await deps.getText("/api/export"));
    box.replaceChildren();
    if (!flows.length) {
      box.appendChild(note(doc, "empty", "No flows yet. Add one to light up the cables."));
    } else {
      const list = el(doc, "ul", "kw-list");
      for (const flow of flows) {
        const item = el(doc, "li", "kw-row",
          `${deviceName(workspace, flow.from)} → ${deviceName(workspace, flow.to)} · ${flow.mbit} Mbit/s`);
        item.appendChild(createButton(doc, {
          label: "Remove",
          className: "kw-remove",
          onClick: () => void setFlow(flow.from, flow.to, 0),
        }));
        list.appendChild(item);
      }
      box.appendChild(list);
    }
    box.appendChild(createButton(doc, {
      label: "Spread over spare paths",
      className: "kw-spread",
      toggled: spread,
      onClick: () => void setSpread(!spread),
    }));
  };

  const done = Promise.all([
    asyncSection(doc, body, "Cable loads", "Could not load the cable loads.", (box) => {
      loadsBox = box;
      return fillLoads(box);
    }),
    asyncSection(doc, body, "Flows", "Could not load the flows.", (box) => {
      flowsBox = box;
      return fillFlows(box);
    }),
  ]).then(() => undefined);

  const form = el(doc, "div", "kw-form");
  const from = field(doc, form, "From device");
  const to = field(doc, form, "To device");
  const mbit = field(doc, form, "Mbit/s", "number");
  const add = async () => {
    const fromTyped = from.value.trim();
    const toTyped = to.value.trim();
    const rate = Number(mbit.value.trim());
    if (!fromTyped || !toTyped) {
      showOutcome(doc, outcome, "error", "Name both ends of the flow.");
      return;
    }
    if (!Number.isInteger(rate) || rate < 0) {
      showOutcome(doc, outcome, "error", "Mbit/s must be a whole number; 0 removes the flow.");
      return;
    }
    await setFlow(deviceId(workspace, fromTyped), deviceId(workspace, toTyped), rate);
  };
  const submit = () => void add();
  onEnter(mbit, submit);
  form.appendChild(createButton(doc, { label: "Add flow", className: "kw-submit", onClick: submit }));
  form.appendChild(outcome);
  body.appendChild(form);
  return done;
}
