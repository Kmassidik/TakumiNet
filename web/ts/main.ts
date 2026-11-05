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
import { makeGroupPress, renderGroupCard, type GroupLike, type GroupPressDeps } from "./ui/group_card";
import { placeMenu, placeSubmenu } from "./ui/menu_place";
import { renderFlowsWindow } from "./ui/flows_window";
import { renderPortsPanel, type PortInfo, type PortsPanelDeps } from "./ui/ports_panel";
import { cableStyle, type CableStyle } from "./canvas/cable_style";
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

const kindOverlay = (id: string | null, title: string): ElementLike | null => {
  const win = id ? document.getElementById(id) : null;
  const name = win?.querySelector<HTMLElement>(".kindwin-name");
  const body = win?.querySelector<HTMLElement>(".kindwin-body");
  if (!win || !name || !body) return null;
  name.textContent = title;
  win.hidden = false;
  bringToFront(win);
  return body as unknown as ElementLike;
};

globalThis.openWindowForKind = (device, workspace) => {
  const body = kindOverlay(windowIdForKind(device?.kind ?? ""), device.name);
  if (!body) return false;
  void renderKindWindow(doc, body, device, workspace ?? {}, { post: postJson, getText });
  return true;
};

globalThis.openGroupCard = (group) => {
  const body = kindOverlay("group-window", group.name);
  if (!body) return false;
  renderGroupCard(doc, body, group);
  return true;
};

globalThis.openFlowsWindow = (workspace) => {
  const body = kindOverlay("flows-window", "Flows");
  if (!body) return false;
  void renderFlowsWindow(doc, body, workspace ?? {}, { post: postJson, getText });
  return true;
};

globalThis.makeGroupPress = makeGroupPress;
globalThis.placeMenu = placeMenu;
globalThis.placeSubmenu = placeSubmenu;
globalThis.cableStyle = cableStyle;
globalThis.renderPortsPanel = (box, ports, deps) => renderPortsPanel(doc, box as unknown as ElementLike, ports, deps);
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
  var openGroupCard: (group: GroupLike) => boolean;
  var openFlowsWindow: (workspace: KindWorkspace | null) => boolean;
  var makeGroupPress: (deps: GroupPressDeps) => (group: GroupLike) => void;
  var askText: (message: string, value?: string) => Promise<string | null>;
  var placeMenu: typeof import("./ui/menu_place").placeMenu;
  var placeSubmenu: typeof import("./ui/menu_place").placeSubmenu;
  var cableStyle: (kind: string | undefined) => CableStyle;
  var renderPortsPanel: (box: HTMLElement, ports: readonly PortInfo[], deps: PortsPanelDeps) => void;
}
