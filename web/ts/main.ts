import { bringToFront, makeWindowMovable, watchOverlays } from "./ui/dialogs";
import type { DocLike, ElementLike } from "./ui/dom";
import { WorkspaceCanvas } from "./canvas/workspace_canvas";
import { wireSidebar } from "./ui/sidebar";
import { engineLoadingMessage, type EngineProgress } from "./ui/engine_loading";
import { shouldAutoShowGallery } from "./ui/gallery_once";
import { renderDeviceList, type ListedDevice } from "./ui/device_list";
import { renderToolbar, type ToolbarItem } from "./ui/toolbar";
import { buildRunLog, formatLogLine, type CommandRecord, type LogEntry, type RunEvent } from "./ui/run_log";
import { openModal } from "./ui/modal";
import { ModalStack } from "./ui/modal_stack";

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
globalThis.buildRunLog = buildRunLog;
globalThis.formatLogLine = formatLogLine;
globalThis.renderToolbar = (bar, items) => renderToolbar(doc, bar as unknown as ElementLike, items, (key) => icon3d(key));
globalThis.makeWindowMovable = makeWindowMovable;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => watchOverlays(stack));
} else {
  watchOverlays(stack);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wireSidebar);
} else {
  wireSidebar();
}

declare global {
  var engineLoadingMessage: (progress: EngineProgress | null) => string;
  var shouldAutoShowGallery: () => boolean;
  var renderDeviceList: (list: HTMLElement, devices: readonly ListedDevice[], onSelect: (id: string) => void) => void;
  var WorkspaceCanvas: typeof import("./canvas/workspace_canvas").WorkspaceCanvas;
  var buildRunLog: (events: RunEvent[], commands: CommandRecord[], query: string) => LogEntry[];
  var formatLogLine: (entry: LogEntry) => string;
  var icon3d: (key: string) => string;
  var renderToolbar: (bar: HTMLElement, items: readonly ToolbarItem[]) => void;
  var bringToFront: (win: HTMLElement | null) => void;
  var makeWindowMovable: (win: HTMLElement | null) => void;
  var askConfirm: (message: string, okText?: string) => Promise<boolean>;
  var askText: (message: string, value?: string) => Promise<string | null>;
}
