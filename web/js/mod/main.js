import { bringToFront, makeWindowMovable, watchOverlays } from "./ui/dialogs.js";
import { WorkspaceCanvas } from "./canvas/workspace_canvas.js";
import { wireSidebar } from "./ui/sidebar.js";
import { wireCollapsibles } from "./ui/collapse.js";
import { wireMenuBar } from "./ui/menubar.js";
import { wireTooltips } from "./ui/tooltip.js";
import { fingerprint, hasUnsaved } from "./ui/unsaved.js";
import { groupProtocols } from "./ui/protocol_groups.js";
import { CONNECTIONS, keepsCableMode, tilesFor, startGroup } from "./ui/palette_groups.js";
import { engineLoadingMessage } from "./ui/engine_loading.js";
import { shouldAutoShowGallery } from "./ui/gallery_once.js";
import { renderDeviceList } from "./ui/device_list.js";
import { renderToolbar } from "./ui/toolbar.js";
import { buildRunLog, formatLogLine } from "./ui/run_log.js";
import { openModal } from "./ui/modal.js";
import { ModalStack } from "./ui/modal_stack.js";
import { wireDialogClose } from "./ui/dialog_close.js";
import { renderKindWindow, windowIdForKind } from "./ui/kind_windows.js";
import { makeGroupPress, renderGroupCard } from "./ui/group_card.js";
import { placeMenu, placeSubmenu } from "./ui/menu_place.js";
import { renderFlowsWindow } from "./ui/flows_window.js";
import { renderPortsPanel } from "./ui/ports_panel.js";
import { renderPortFaceplate } from "./ui/port_faceplate.js";
import { cableStyle } from "./canvas/cable_style.js";

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
globalThis.renderToolbar = (bar, items) => renderToolbar(document, bar, items, (key) => globalThis.icon3d(key));
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
