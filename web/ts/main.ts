import { bringToFront, makeWindowMovable, watchOverlays } from "./ui/dialogs";
import type { DocLike, ElementLike } from "./ui/dom";
import { WorkspaceCanvas } from "./canvas/workspace_canvas";
import { wireSidebar } from "./ui/sidebar";
import { wireCollapsibles } from "./ui/collapse";
import { wireMenuBar } from "./ui/menubar";
import { wireTooltips } from "./ui/tooltip";
import { fingerprint, hasUnsaved, type WorkspaceLike } from "./ui/unsaved";
import { groupProtocols, type ProtocolGroup } from "./ui/protocol_groups";
import { CONNECTIONS, keepsCableMode, tilesFor, startGroup, type PaletteDevice } from "./ui/palette_groups";
import { engineLoadingMessage, type EngineProgress } from "./ui/engine_loading";
import { shouldAutoShowGallery } from "./ui/gallery_once";
import { renderDeviceList, type ListedDevice } from "./ui/device_list";
import { renderToolbar, type ToolbarItem } from "./ui/toolbar";
import { buildRunLog, formatLogLine, type CommandRecord, type LogEntry, type RunEvent } from "./ui/run_log";
import { openModal } from "./ui/modal";
import { ModalStack } from "./ui/modal_stack";
import { wireDialogClose, type EventSource } from "./ui/dialog_close";
import { renderKindWindow, windowIdForKind } from "./ui/kind_windows";
import type { KindDevice, KindWorkspace } from "./ui/kind_parts";

const doc = document as unknown as DocLike;
const stack = new ModalStack();

globalThis.askConfirm = async (message: string, okText = "OK"): Promise<boolean> =>
  (await openModal(doc, stack, { message, okText })) === true;

globalThis.askText = async (message: string, value = ""): Promise<string | null> =>
  (await openModal(doc, stack, { message, input: value })) as string | null;

globalThis.bringToFront = bringToFront;
globalThis.engineLoadingMessage = engineLoadingMessage;
globalThis.shouldAutoShowGallery = () => shouldAutoShowGallery(localStorage);
globalThis.renderDeviceList = (list, devices, onSelect) => renderDeviceList(doc, list as unknown as ElementLike, devices, onSelect);
globalThis.WorkspaceCanvas = WorkspaceCanvas;
globalThis.wireMenus = () => wireMenuBar(document);
globalThis.workspaceFingerprint = fingerprint;
globalThis.workspaceHasUnsaved = hasUnsaved;
globalThis.paletteTiles = tilesFor;
globalThis.paletteKeepsCableMode = keepsCableMode;
globalThis.groupProtocols = groupProtocols;
globalThis.paletteStartGroup = startGroup;
globalThis.PALETTE_CONNECTIONS = CONNECTIONS;
globalThis.buildRunLog = buildRunLog;
globalThis.formatLogLine = formatLogLine;
globalThis.renderToolbar = (bar, items) => renderToolbar(doc, bar as unknown as ElementLike, items, (key) => icon3d(key));
globalThis.makeWindowMovable = makeWindowMovable;

const postJson = async (path: string): Promise<Record<string, unknown>> =>
  (await (await fetch(path, { method: "POST" })).json()) as Record<string, unknown>;
const getText = async (path: string): Promise<string> => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`request failed (${res.status})`);
  return res.text();
};

globalThis.openWindowForKind = (device, workspace) => {
  const winId = windowIdForKind(device?.kind ?? "");
  const win = winId ? document.getElementById(winId) : null;
  const name = win?.querySelector<HTMLElement>(".kindwin-name");
  const body = win?.querySelector<HTMLElement>(".kindwin-body");
  if (!win || !name || !body) return false;
  name.textContent = device.name;
  win.hidden = false;
  bringToFront(win);
  void renderKindWindow(doc, body as unknown as ElementLike, device, workspace ?? {}, { post: postJson, getText });
  return true;
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => watchOverlays(stack));
} else {
  watchOverlays(stack);
}
wireDialogClose(document as unknown as EventSource, stack);
const store = (() => {
  try {
    return localStorage;
  } catch {
    return null;
  }
})();
const wireBars = () => {
  wireTooltips(document);
  wireSidebar();
  wireCollapsibles(document, store);
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wireBars);
} else {
  wireBars();
}

declare global {
  var engineLoadingMessage: (progress: EngineProgress | null) => string;
  var shouldAutoShowGallery: () => boolean;
  var renderDeviceList: (list: HTMLElement, devices: readonly ListedDevice[], onSelect: (id: string) => void) => void;
  var groupProtocols: (labels: readonly string[]) => ProtocolGroup[];
  var wireMenus: () => void;
  var paletteKeepsCableMode: (group: string) => boolean;
  var workspaceFingerprint: (ws: WorkspaceLike | null | undefined) => string;
  var workspaceHasUnsaved: (ws: WorkspaceLike | null | undefined, clean: string | null) => boolean;
  var paletteTiles: (group: string, palette: readonly PaletteDevice[]) => PaletteDevice[];
  var paletteStartGroup: (saved: string | null | undefined, groups: readonly string[]) => string;
  var PALETTE_CONNECTIONS: string;
  var WorkspaceCanvas: typeof import("./canvas/workspace_canvas").WorkspaceCanvas;
  var buildRunLog: (events: RunEvent[], commands: CommandRecord[], query: string) => LogEntry[];
  var formatLogLine: (entry: LogEntry) => string;
  var icon3d: (key: string) => string;
  var renderToolbar: (bar: HTMLElement, items: readonly ToolbarItem[]) => void;
  var bringToFront: (win: HTMLElement | null) => void;
  var makeWindowMovable: (win: HTMLElement | null) => void;
  var askConfirm: (message: string, okText?: string) => Promise<boolean>;
  var openWindowForKind: (device: KindDevice, workspace: KindWorkspace | null) => boolean;
  var askText: (message: string, value?: string) => Promise<string | null>;
}
