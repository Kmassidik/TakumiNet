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
  section,
  showOutcome,
  type KindDevice,
  type KindWorkspace,
  type Post,
} from "./kind_parts";

const enc = encodeURIComponent;

/* The addressed servers a phone can register at, as (label, address). */
export function callManagers(workspace: KindWorkspace): Array<{ label: string; address: string }> {
  return (workspace.devices ?? [])
    .filter((d) => d.kind === "server" && typeof d.ip === "string" && d.ip !== "")
    .map((d) => ({ label: `${d.name} (${d.ip})`, address: d.ip as string }));
}

export function renderPhoneWindow(
  doc: DocLike,
  body: ElementLike,
  device: KindDevice,
  workspace: KindWorkspace,
  post: Post,
): Promise<void> {
  body.replaceChildren();
  let extension = 0;
  let statusBox: ElementLike | null = null;

  const fillStatus = async (box: ElementLike): Promise<void> => {
    const res = await post(`/api/phone/status?id=${enc(device.id)}`);
    const err = errorOf(res);
    if (err) throw new Error(err);
    box.replaceChildren();
    extension = typeof res["extension"] === "number" ? (res["extension"] as number) : 0;
    if (res["registered"] !== true) {
      box.appendChild(note(doc, "empty", "Not registered at any call manager yet."));
      return;
    }
    box.appendChild(note(doc, "ok", `Registered at ${asText(res["cm"])} as extension ${extension}.`));
    const call = res["call"] as { from?: number; to?: number; state?: string } | null;
    if (call && typeof call === "object") {
      const line = call.from === extension
        ? `In a call to extension ${call.to} (${asText(call.state)}).`
        : `In a call from extension ${call.from} (${asText(call.state)}).`;
      box.appendChild(note(doc, "plain", line));
    }
  };
  const done = asyncSection(doc, body, "Line status", "Could not read the phone status.", (box) => {
    statusBox = box;
    return fillStatus(box);
  });
  const refresh = (): void => {
    if (statusBox) void fillStatus(statusBox).catch(() => undefined);
  };

  registerForm(doc, body, device, workspace, post, refresh);
  dialPad(doc, body, post, () => extension, refresh);
  if (device.kind === "analogphone") {
    body.appendChild(note(doc, "plain", "An analog phone talks through its phone cable; the router carries its calls."));
  }
  return done;
}

function registerForm(
  doc: DocLike,
  root: ElementLike,
  device: KindDevice,
  workspace: KindWorkspace,
  post: Post,
  refresh: () => void,
): void {
  const box = section(doc, root, "Register");
  const managers = callManagers(workspace);
  if (managers.length === 0) {
    box.appendChild(note(doc, "empty", "No addressed server to register at. Give a server an address first."));
    return;
  }
  const form = el(doc, "div", "kw-form");
  const label = el(doc, "label", "kw-field", "Call manager");
  const picker = el(doc, "select", "kw-input");
  for (const manager of managers) {
    const option = el(doc, "option", "", manager.label);
    option.setAttribute("value", manager.address);
    picker.appendChild(option);
  }
  picker.value = managers[0]!.address;
  label.appendChild(picker);
  form.appendChild(label);
  const ext = field(doc, form, "Extension", "number");
  const outcome = el(doc, "div", "kw-outcome");
  const submit = (): void => void save();
  const save = async (): Promise<void> => {
    const number = wholeNumber(ext.value);
    if (number === null) {
      showOutcome(doc, outcome, "error", "Type a whole extension number.");
      return;
    }
    try {
      const res = await post(`/api/phone/register?id=${enc(device.id)}&cm=${enc(picker.value)}&ext=${number}`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else {
        showOutcome(doc, outcome, "ok", `Registered as extension ${number}.`);
        refresh();
      }
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };
  onEnter(ext, submit);
  form.appendChild(createButton(doc, { label: "Register", className: "kw-submit", onClick: submit }));
  form.appendChild(outcome);
  box.appendChild(form);
}

function dialPad(
  doc: DocLike,
  root: ElementLike,
  post: Post,
  ownExtension: () => number,
  refresh: () => void,
): void {
  const box = section(doc, root, "Dial");
  const form = el(doc, "div", "kw-form");
  const target = field(doc, form, "Extension to call", "number");
  const outcome = el(doc, "div", "kw-outcome");
  const submit = (): void => void dial();
  const dial = async (): Promise<void> => {
    const to = wholeNumber(target.value);
    if (to === null) {
      showOutcome(doc, outcome, "error", "Type the extension to call.");
      return;
    }
    const from = ownExtension();
    if (from === 0) {
      showOutcome(doc, outcome, "error", "Register this phone first.");
      return;
    }
    try {
      const res = await post(`/api/phone/call?from=${from}&to=${to}`);
      const err = errorOf(res);
      if (err) showOutcome(doc, outcome, "error", err);
      else {
        showOutcome(doc, outcome, "ok", `Call to extension ${to} established.`);
        refresh();
      }
    } catch {
      showOutcome(doc, outcome, "error", "The request failed. Check the connection and try again.");
    }
  };
  onEnter(target, submit);
  form.appendChild(createButton(doc, { label: "Call", className: "kw-submit", onClick: submit }));
  form.appendChild(outcome);
  box.appendChild(form);
}

function wholeNumber(raw: string): number | null {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return value > 0 && value <= 65535 ? value : null;
}
