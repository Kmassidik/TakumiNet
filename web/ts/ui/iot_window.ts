import { createButton } from "./button";
import type { DocLike, ElementLike } from "./dom";
import {
  asText,
  asyncSection,
  el,
  errorOf,
  field,
  note,
  onEnter,
  rowList,
  section,
  showOutcome,
  type GetText,
  type KindDevice,
  type KindWorkspace,
  type Post,
} from "./kind_parts";

const enc = encodeURIComponent;

/* The panel shows the first 16 holding registers; writes may address 0-255. */
export const SHOWN_REGISTERS = 16;

export interface Tower {
  id: string;
  name: string;
}

/* Every cell tower in the saved workspace, by id and display name. */
export function towerRows(saved: string): Tower[] {
  const towers: Tower[] = [];
  for (const m of saved.matchAll(/<device id="([^"]+)" kind="celltower"[^>]*name="([^"]*)"/g)) {
    towers.push({ id: m[1] ?? "", name: m[2] ?? "" });
  }
  return towers;
}

function wholeIn(value: string, most: number): number | null {
  const n = Number(value.trim());
  return Number.isInteger(n) && n >= 0 && n <= most ? n : null;
}

function registersSection(doc: DocLike, root: ElementLike, device: KindDevice, post: Post): Promise<void> {
  let listBox: ElementLike | null = null;
  const fill = async (box: ElementLike): Promise<void> => {
    listBox = box;
    const reads = await Promise.all(
      Array.from({ length: SHOWN_REGISTERS }, (_, addr) => post(`/api/iot/read?id=${enc(device.id)}&addr=${addr}`)),
    );
    box.replaceChildren();
    const err = errorOf(reads[0] ?? {});
    if (err) {
      box.appendChild(note(doc, "error", err));
      return;
    }
    box.appendChild(rowList(doc, reads.map((r, addr) => `Register ${addr} · ${asText(r["value"]) || "0"}`)));
  };
  const done = asyncSection(doc, root, "Registers", "Could not read the registers.", fill);

  const form = el(doc, "div", "kw-form");
  const register = field(doc, form, "Register");
  const value = field(doc, form, "Value");
  const outcome = el(doc, "div", "kw-outcome");
  const submit = (): void => void write();
  const write = async (): Promise<void> => {
    const addr = wholeIn(register.value, 255);
    const wanted = wholeIn(value.value, 65535);
    if (addr === null || wanted === null) {
      showOutcome(doc, outcome, "error", "Type a register from 0 to 255 and a value from 0 to 65535.");
      return;
    }
    try {
      const res = await post(`/api/iot/write?id=${enc(device.id)}&addr=${addr}&value=${wanted}`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else {
        showOutcome(doc, outcome, "ok", `Register ${addr} is now ${wanted} (was ${asText(res["old"]) || "0"}).`);
        if (listBox) await fill(listBox).catch(() => undefined);
      }
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };
  onEnter(register, submit);
  onEnter(value, submit);
  form.appendChild(createButton(doc, { label: "Write", className: "kw-submit", onClick: submit }));
  form.appendChild(outcome);
  root.appendChild(form);
  return done;
}

function fillTowers(
  doc: DocLike,
  box: ElementLike,
  device: KindDevice,
  post: Post,
  getText: GetText,
  outcome: ElementLike,
): Promise<void> {
  return (async () => {
    const [saved, status] = await Promise.all([getText("/api/export"), post(`/api/cell/status?id=${enc(device.id)}`)]);
    const towers = towerRows(saved);
    const joined = status["associated"] === true ? asText(status["tower"]) : "";
    box.replaceChildren();
    const joinedName = towers.find((t) => t.id === joined)?.name ?? joined;
    box.appendChild(note(doc, "plain", joined ? `Joined to ${joinedName}.` : "Not joined to a tower."));
    if (towers.length === 0) {
      box.appendChild(note(doc, "empty", "There is no cell tower in this workspace."));
      return;
    }
    for (const tower of towers) {
      const row = el(doc, "div", "kw-row");
      row.appendChild(el(doc, "span", "kw-tower-name", tower.name));
      row.appendChild(createButton(doc, {
        label: "Join",
        className: "kw-submit",
        onClick: () => void (async () => {
          try {
            const res = await post(`/api/cell/join?id=${enc(device.id)}&tower=${enc(tower.id)}`);
            const err = errorOf(res);
            if (err) showOutcome(doc, outcome, "error", err);
            else {
              showOutcome(doc, outcome, "ok", `Joined to ${tower.name}.`);
              await fillTowers(doc, box, device, post, getText, outcome).catch(() => undefined);
            }
          } catch {
            showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
          }
        })(),
      }));
      box.appendChild(row);
    }
  })();
}

function towerSection(
  doc: DocLike,
  root: ElementLike,
  device: KindDevice,
  workspace: KindWorkspace,
  post: Post,
  getText: GetText,
): Promise<void> {
  const outcome = el(doc, "div", "kw-outcome");
  const done = asyncSection(doc, root, "Cell tower", "Could not read the cell towers.", (box) =>
    fillTowers(doc, box, device, post, getText, outcome));
  const form = el(doc, "div", "kw-form");
  const target = field(doc, form, "Send to");
  const sendOutcome = el(doc, "div", "kw-outcome");
  const submit = (): void => void send();
  const send = async (): Promise<void> => {
    const name = target.value.trim();
    const peer = workspace.devices?.find((d) => d.name === name || d.id === name);
    if (!peer) {
      showOutcome(doc, sendOutcome, "error", name ? `No device is named ${name}.` : "Type the name of the device to reach.");
      return;
    }
    try {
      const res = await post(`/api/iot/send?src=${enc(device.id)}&dst=${enc(peer.id)}&proto=cellular&seq=0`);
      const err = errorOf(res);
      if (err) showOutcome(doc, sendOutcome, "error", err);
      else showOutcome(doc, sendOutcome, "ok", `${asText(res["status"])} to ${peer.name}.`);
    } catch {
      showOutcome(doc, sendOutcome, "error", "The request failed. Check the connection and try again.");
    }
  };
  onEnter(target, submit);
  form.appendChild(createButton(doc, { label: "Send over the tower", className: "kw-submit", onClick: submit }));
  form.appendChild(sendOutcome);
  form.appendChild(outcome);
  root.appendChild(form);
  return done;
}

export function renderIotWindow(
  doc: DocLike,
  body: ElementLike,
  device: KindDevice,
  workspace: KindWorkspace,
  post: Post,
  getText: GetText,
): Promise<void> {
  body.replaceChildren();
  return Promise.all([
    registersSection(doc, body, device, post),
    towerSection(doc, body, device, workspace, post, getText),
  ]).then(() => undefined);
}

/* Which clients a tower carries, from the saved workspace's cell rows. */
export function joinedClients(saved: string, towerId: string, workspace: KindWorkspace): string[] {
  const clients: string[] = [];
  for (const m of saved.matchAll(/<cell client="([^"]+)" tower="([^"]+)"/g)) {
    if (m[2] !== towerId) continue;
    const id = m[1] ?? "";
    clients.push(workspace.devices?.find((d) => d.id === id)?.name ?? id);
  }
  return clients;
}

export function renderCellTowerWindow(
  doc: DocLike,
  body: ElementLike,
  device: KindDevice,
  workspace: KindWorkspace,
  getText: GetText,
): Promise<void> {
  body.replaceChildren();
  const about = section(doc, body, "Coverage");
  about.appendChild(note(doc, "plain", "Devices join this tower over the air; no cable terminates here."));
  return asyncSection(doc, body, "Joined clients", "Could not read the joined clients.", async (box) => {
    const saved = await getText("/api/export");
    const clients = joinedClients(saved, device.id, workspace);
    box.replaceChildren();
    if (clients.length === 0) box.appendChild(note(doc, "empty", "No device has joined this tower yet."));
    else box.appendChild(rowList(doc, clients));
  });
}
