import { bringToFront, makeWindowMovable, watchOverlays } from "./ui/dialogs";
import { WorkspaceCanvas } from "./canvas/workspace_canvas";
import { wireSidebar } from "./ui/sidebar";
import { wireCollapsibles } from "./ui/collapse";
import { wireMenuBar } from "./ui/menubar";
import { wireTooltips } from "./ui/tooltip";
import { fingerprint, hasUnsaved } from "./ui/unsaved";
import { groupProtocols } from "./ui/protocol_groups";
import { CONNECTIONS, keepsCableMode, tilesFor, startGroup } from "./ui/palette_groups";
import { engineLoadingMessage } from "./ui/engine_loading";
import { shouldAutoShowGallery } from "./ui/gallery_once";
import { renderDeviceList } from "./ui/device_list";
import { renderToolbar } from "./ui/toolbar";
import { buildRunLog, formatLogLine } from "./ui/run_log";
import { openModal } from "./ui/modal";
import { ModalStack } from "./ui/modal_stack";
import { wireDialogClose } from "./ui/dialog_close";
import { renderKindWindow, windowIdForKind } from "./ui/kind_windows";
import { makeGroupPress, renderGroupCard } from "./ui/group_card";
import { placeMenu, placeSubmenu } from "./ui/menu_place";
import { renderFlowsWindow } from "./ui/flows_window";
import { renderPortsPanel } from "./ui/ports_panel";
import { renderPortFaceplate } from "./ui/port_faceplate";
import { cableStyle } from "./canvas/cable_style";

const stack = new ModalStack();

globalThis.askConfirm = async (message, okText = "OK") =>
  (await openModal(document, stack, { message, okText })) === true;

globalThis.askText = async (message, value = "") =>
  await openModal(document, stack, { message, input: value });

globalThis.bringToFront = bringToFront;
globalThis.engineLoadingMessage = engineLoadingMessage;
globalThis.shouldAutoShowGallery = () => shouldAutoShowGallery(localStorage);
globalThis.renderDeviceList = (list, devices, onSelect) => renderDeviceList(document, list, devices, onSelect);
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
/* icon3d is defined (and hoisted to globalThis) by web/js/legacy/icons.ts,
   which loads before this bundle in index.html. */
globalThis.renderToolbar = (bar, items) => renderToolbar(document, bar, items, icon3d);
globalThis.makeWindowMovable = makeWindowMovable;

const postJson = async (path) => (await (await fetch(path, { method: "POST" })).json());
const getText = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`request failed (${res.status})`);
  return res.text();
};

const kindOverlay = (id, title) => {
  const win = id ? document.getElementById(id) : null;
  const name = win?.querySelector(".kindwin-name");
  const body = win?.querySelector(".kindwin-body");
  if (!win || !name || !body) return null;
  name.textContent = title;
  win.hidden = false;
  bringToFront(win);
  return body;
};

globalThis.openWindowForKind = (device, workspace) => {
  const body = kindOverlay(windowIdForKind(device?.kind ?? ""), device.name);
  if (!body) return false;
  void renderKindWindow(document, body, device, workspace ?? {}, { post: postJson, getText });
  return true;
};

globalThis.openGroupCard = (group) => {
  const body = kindOverlay("group-window", group.name);
  if (!body) return false;
  renderGroupCard(document, body, group);
  return true;
};

globalThis.openFlowsWindow = (workspace) => {
  const body = kindOverlay("flows-window", "Flows");
  if (!body) return false;
  void renderFlowsWindow(document, body, workspace ?? {}, { post: postJson, getText });
  return true;
};

globalThis.makeGroupPress = makeGroupPress;
globalThis.placeMenu = placeMenu;
globalThis.placeSubmenu = placeSubmenu;
globalThis.cableStyle = cableStyle;
globalThis.renderPortsPanel = (box, ports, deps) => renderPortsPanel(document, box, ports, deps);
globalThis.renderPortFaceplate = (box, ports) => renderPortFaceplate(document, box, ports);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => watchOverlays(stack));
} else {
  watchOverlays(stack);
}
wireDialogClose(document, stack);
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

/* The bootstrap that used to live in web/js/main.js: phones get one message
   and download nothing; desktops register the service worker, start the app
   and show the engine loading screen. */
if (isPhoneScreen()) {
  // Phones get one message (see phone.js). Nothing else starts or downloads.
  reloadWhenScreenGrows();
} else {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
  boot();
  showEngineLoading();
}
