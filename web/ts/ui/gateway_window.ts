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
  records,
  rowList,
  section,
  showOutcome,
  type KindDevice,
  type Post,
} from "./kind_parts";

const enc = encodeURIComponent;

function wholeNumber(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function mbitText(value: unknown): string {
  const n = Number(value);
  return Number.isFinite(n) ? (Math.round(n * 10) / 10).toString() : asText(value);
}

function sessionsSection(doc: DocLike, root: ElementLike, device: KindDevice, post: Post): Promise<void> {
  return asyncSection(doc, root, "Customer sessions", "Could not load the sessions.", async (box) => {
    const res = await post(`/api/pppoe/sessions?id=${enc(device.id)}`);
    const err = errorOf(res);
    if (err) throw new Error(err);
    const rows = records(res, "sessions");
    box.replaceChildren();
    if (rows.length === 0) box.appendChild(note(doc, "empty", "No customer is connected yet."));
    else box.appendChild(rowList(doc, rows.map((r) => `${asText(r["user"])} on ${asText(r["client"])}`)));
  });
}

function fillQueues(doc: DocLike, box: ElementLike, device: KindDevice, post: Post): Promise<void> {
  return (async () => {
    const res = await post(`/api/queues/list?id=${enc(device.id)}&port=Ether1`);
    const err = errorOf(res);
    if (err) throw new Error(err);
    const rows = records(res, "sessions");
    const load = res["load"];
    box.replaceChildren();
    if (rows.length === 0) box.appendChild(note(doc, "empty", "No customer is connected yet."));
    else box.appendChild(rowList(doc, rows.map((r) => `${asText(r["user"])} on ${asText(r["client"])}: ${mbitText(r["mbit"])} Mbit/s measured`)));
    const loadText = typeof load === "number" ? `Line load: ${Math.round(load)}%` : "The line load is not measured yet.";
    box.appendChild(note(doc, "plain", loadText));
  })();
}

function queuesSection(doc: DocLike, root: ElementLike, device: KindDevice, post: Post): Promise<void> {
  let listBox: ElementLike | null = null;
  const done = asyncSection(doc, root, "Speed limits", "Could not load the speed limits.", (box) => {
    listBox = box;
    return fillQueues(doc, box, device, post);
  });
  const refresh = (): void => {
    if (listBox) void fillQueues(doc, listBox, device, post).catch(() => undefined);
  };
  limitForm(doc, root, device, post, refresh);
  parentForm(doc, root, device, post, refresh);
  return done;
}

function limitForm(doc: DocLike, root: ElementLike, device: KindDevice, post: Post, refresh: () => void): void {
  const form = el(doc, "div", "kw-form");
  const user = field(doc, form, "Customer");
  const mbit = field(doc, form, "Limit in Mbit/s", "number");
  const outcome = el(doc, "div", "kw-outcome");
  const submit = (): void => void save();
  const save = async (): Promise<void> => {
    const name = user.value.trim();
    const limit = wholeNumber(mbit.value);
    if (!name || limit === null) {
      showOutcome(doc, outcome, "error", "Type a customer name and a whole number of Mbit/s.");
      return;
    }
    try {
      const res = await post(`/api/devices/queue?id=${enc(device.id)}&user=${enc(name)}&mbit=${limit}`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else {
        showOutcome(doc, outcome, "ok", `Limit saved: ${name} at ${limit} Mbit/s.`);
        refresh();
      }
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };
  onEnter(user, submit);
  onEnter(mbit, submit);
  form.appendChild(createButton(doc, { label: "Set limit", className: "kw-submit", onClick: submit }));
  form.appendChild(outcome);
  root.appendChild(form);
}

function parentForm(doc: DocLike, root: ElementLike, device: KindDevice, post: Post, refresh: () => void): void {
  const form = el(doc, "div", "kw-form");
  const mbit = field(doc, form, "Whole line in Mbit/s", "number");
  const outcome = el(doc, "div", "kw-outcome");
  const submit = (): void => void save();
  const save = async (): Promise<void> => {
    const limit = wholeNumber(mbit.value);
    if (limit === null) {
      showOutcome(doc, outcome, "error", "Type a whole number of Mbit/s.");
      return;
    }
    try {
      const res = await post(`/api/devices/queue?id=${enc(device.id)}&mbit=${limit}&parent=1`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else {
        showOutcome(doc, outcome, "ok", `Line limit saved: ${limit} Mbit/s.`);
        refresh();
      }
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };
  onEnter(mbit, submit);
  form.appendChild(createButton(doc, { label: "Set line limit", className: "kw-submit", onClick: submit }));
  form.appendChild(outcome);
  root.appendChild(form);
}

function vouchersSection(doc: DocLike, root: ElementLike, device: KindDevice, post: Post): void {
  const box = section(doc, root, "Vouchers");
  const form = el(doc, "div", "kw-form");
  const code = field(doc, form, "Code");
  const minutes = field(doc, form, "Minutes", "number");
  const outcome = el(doc, "div", "kw-outcome");
  const submit = (): void => void save();
  const save = async (): Promise<void> => {
    const codeText = code.value.trim();
    const time = wholeNumber(minutes.value);
    if (!codeText || time === null) {
      showOutcome(doc, outcome, "error", "Type a code and a whole number of minutes.");
      return;
    }
    try {
      const res = await post(`/api/voucher?id=${enc(device.id)}&code=${enc(codeText)}&minutes=${time}`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else showOutcome(doc, outcome, "ok", `Voucher ${codeText} is ready for ${time} minutes.`);
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };
  onEnter(code, submit);
  onEnter(minutes, submit);
  form.appendChild(createButton(doc, { label: "Create voucher", className: "kw-submit", onClick: submit }));
  form.appendChild(outcome);
  box.appendChild(form);
}

function accountsSection(doc: DocLike, root: ElementLike, device: KindDevice, post: Post): Promise<void> {
  let listBox: ElementLike | null = null;
  const fill = async (box: ElementLike): Promise<void> => {
    listBox = box;
    const res = await post(`/api/aaa/list?id=${enc(device.id)}`);
    const err = errorOf(res);
    if (err) throw new Error(err);
    const users = Array.isArray(res["users"]) ? (res["users"] as unknown[]).map(asText) : [];
    box.replaceChildren();
    if (users.length === 0) box.appendChild(note(doc, "empty", "No customer account exists yet."));
    else box.appendChild(rowList(doc, users));
  };
  const done = asyncSection(doc, root, "Customer accounts", "Could not load the accounts.", fill);

  const form = el(doc, "div", "kw-form");
  const user = field(doc, form, "User");
  const pass = field(doc, form, "Password", "password");
  const outcome = el(doc, "div", "kw-outcome");
  const submit = (): void => void save();
  const save = async (): Promise<void> => {
    const name = user.value.trim();
    if (!name || !pass.value) {
      showOutcome(doc, outcome, "error", "Type a user name and a password.");
      return;
    }
    try {
      const res = await post(`/api/devices/aaa?id=${enc(device.id)}&user=${enc(name)}&pass=${enc(pass.value)}`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else {
        showOutcome(doc, outcome, "ok", `Account ${name} added.`);
        if (listBox) await fill(listBox).catch(() => undefined);
      }
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };
  onEnter(user, submit);
  onEnter(pass, submit);
  form.appendChild(createButton(doc, { label: "Add account", className: "kw-submit", onClick: submit }));
  form.appendChild(outcome);
  root.appendChild(form);
  return done;
}

export function renderGatewayWindow(doc: DocLike, body: ElementLike, device: KindDevice, post: Post): Promise<void> {
  body.replaceChildren();
  const loads = [
    sessionsSection(doc, body, device, post),
    queuesSection(doc, body, device, post),
  ];
  vouchersSection(doc, body, device, post);
  loads.push(accountsSection(doc, body, device, post));
  return Promise.all(loads).then(() => undefined);
}
