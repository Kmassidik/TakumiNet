// Cross-file globals for the classic script files in web/js. They are loaded
// as plain scripts in index.html order, sharing one scope; this file gives
// TypeScript a picture of that scope so each file is checked against it.
//
// Shapes mirror what the Rust server serialises in src/workspace/json.rs.

/* ---------------- shared workspace JSON (src/workspace/types.rs) ---------------- */

type CableKind =
  | "eCopper" | "eCross" | "eSerial" | "eFiber"
  | "eConsole" | "ePhone" | "eCoax" | "eIoT";

interface Layer {
  name: string;
  fields: { name: string; value: string }[];
}

interface Hop {
  id: string;
  name: string;
  in: string | null;
  out: string | null;
  t: number;
  ttl: number;
  srcMac: string;
  dstMac: string;
  srcIp: string;
  dstIp: string;
  note: string;
  layers: Layer[];
}

interface SimEvent {
  id: number;
  time: number;
  last: string;
  at: string;
  type: string;
  proto: string;
  size: number;
  status: string;
  reason: string | null;
  note: string;
  path: string[];
  hops: Hop[];
  layers: Layer[];
}

interface DhcpPool {
  network: string;
  prefix: number;
  gateway: string | null;
  dns: string | null;
}

interface Device {
  id: string;
  name: string;
  model: string;
  icon: string;
  kind: string;
  x: number;
  y: number;
  ip: string | null;
  prefix: number;
  gateway: string | null;
  dns: string | null;
  ipv6: string | null;
  ipv6Prefix: number;
  ipv6Gateway: string | null;
  ipv6Dns: string | null;
  ipv6Auto: boolean;
  dot1x: boolean;
  dot1xUser: string | null;
  dhcp: boolean;
  pool: DhcpPool | null;
  powered: boolean;
  slots: (string | null)[];
  dnsRecords: { name: string; address: string }[];
  httpPage: string | null;
  reservations: { client: string; address: string }[];
  helpers: { iface: string; address: string }[];
  forwards: { outside: number; target: string; inside: number }[];
  pools: DhcpPool[];
  tunnel: { peer: string; state: string } | null;
  vnet: number | null;
  sharedGws: { vip: string; priority: number; owner: boolean }[];
  pppoe: { server: string; user: string } | null;
  replaceModels: string[];
  replaceClears: Record<string, string[]>;
  warning: string | null;
  /* Client-only flags some producers add; the canvas draw code reads them. */
  syslogOn?: boolean;
  errdisabled?: string;
  fault?: string;
}

interface Link {
  a: string;
  aPort: string;
  b: string;
  bPort: string;
  kind: CableKind;
  aState: "red" | "green" | "amber";
  bState: "red" | "green" | "amber";
}

interface Group {
  id: string;
  name: string;
  members: string[];
  devices: number;
  status: string;
}

interface Note {
  id: string;
  x: number;
  y: number;
  color: string;
  text: string;
}

interface LessonStep {
  n: number;
  text: string;
  check: string;
}

interface Lesson {
  id: string;
  title: string;
  level: number;
  minutes: number;
  goal: string;
  steps: LessonStep[];
  checks: { id: string; kind: string; from: string; to: string; url: string; expect: string; label: string }[];
}

interface PaletteGroup {
  label: string;
  icon: string;
}

interface PaletteTile {
  label: string;
  icon: string;
  kind: string;
  blurb: string;
}

interface Workspace {
  tabs: { logical: string; physical: string };
  devices: Device[];
  notes: Note[];
  links: Link[];
  groups: Group[];
  filters: string[];
  paletteGroups: PaletteGroup[];
  palette: PaletteTile[];
  events: SimEvent[];
  lesson: Lesson | null;
  hasDemo: boolean;
  pendingPdus: number;
}

/* One port row from GET /api/devices/ports (src/http/… ports endpoint). */
interface PortInfo {
  name: string;
  ip?: string | null;
  prefix?: number;
  up: boolean;
  peer?: { id: string; name: string; port: string } | null;
  linkUp?: boolean;
  errdisabled?: string;
  fault?: string;
  speed?: string;
  duplex?: string;
  poe?: { capable: boolean; on: boolean; powered?: boolean; watts?: number; reason?: string };
  errors?: number;
  eth?: boolean;
  link?: string;
}

/* The generic API answer: a workspace snapshot, optionally with an error.
   Every endpoint except /api/cli, /api/cmd and /api/webfetch answers this. */
type ApiResult = Workspace & { error?: string };

/* ---------------- menu items (context_menu.ts) ---------------- */

interface MenuItem {
  label: string;
  disabled?: boolean;
  run?: () => void;
  children?: MenuItem[] | (() => MenuItem[]);
}

interface CanvasHit {
  device?: { id: string; name: string; model: string };
  group?: Group;
  link?: Pick<Link, "a" | "b">;
}

/* ---------------- toolbar rows (toolbars.ts): [icon, title, action] ---------------- */

type ToolbarItem = [string, string, string] | null;

declare var ACTIONS: {
  new(): Promise<void>;
  open(): Promise<void>;
  save(): Promise<void>;
  import(): void;
  export(): Promise<void>;
  print(): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  copy(): void;
  paste(): Promise<void>;
  delete(): Promise<void>;
  "add-note"(): void;
  "zoom-in"(): void;
  "zoom-out"(): void;
  "zoom-fit"(): void;
  "zoom-reset"(): void;
  "toggle-palette"(): void;
  "toggle-grid"(): void;
  "build-bus"(): Promise<void>;
  "custom-device"(): Promise<void>;
  pdu(): void;
  mesh(all?: boolean): Promise<void>;
  "collapse-group"(): Promise<void>;
  flows(): void;
  "reset-sim"(): Promise<void>;
  help(): void;
  preferences(): void;
  /* Late additions from lessons.ts */
  "check-work"?: () => Promise<void>;
  "reset-lesson"?: () => Promise<void>;
  "show-lessons"?: () => void;
  "show-templates"?: () => void;
};
declare var ADDRESSING_KINDS: Set<string>;
declare var CABLE_TYPES: [CableKind, string, string, string][];
declare var CLI_MODES: [string, string][];
declare var CLI_STARTERS: [string, string][];
declare var CONSOLE_KINDS: Set<string>;
declare var CONTEXT_CABLE_KINDS: CableKind[];
declare var DESKTOP_APPS: [string, string, string][];
declare var DESKTOP_KINDS: Set<string>;
declare var LESSON_LEVEL_NAMES: Readonly<Record<number, string>>;
declare var LESSON_MASCOTS: Readonly<Record<"wave" | "think" | "happy" | "error", string>>;
declare var NS: string;
declare var NUDGE_ARROWS: Record<"ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown", [number, number]>;
declare var PEER_KINDS: Set<string>;
declare var PHONE_QUERY: string;
declare var PLAYBACK_SPEEDS: number[];
declare var PORT_PICKER_CABLES: Set<CableKind>;
declare var PREFS_KEY: string;
declare var PRIMARY: ToolbarItem[];
declare var REALTIME_TICK_SECONDS: number;
declare var RECOVERY_KEYS: Readonly<{ current: string; previous: string; good: string; active: string }>;
declare var SECONDARY: ToolbarItem[];
declare var SESSION_HISTORY_KEY: string;
declare var SESSION_HISTORY_LIMIT: number;
declare var TUNNEL_KINDS: Set<string>;
declare var WIFI_APP_KINDS: Set<string>;
declare var WIFI_BARS: string[];
declare var WIRELESS_KINDS: Set<string>;

/* ---------------- state holders (state.ts) ---------------- */

declare var aaaSection: (d: Device) => HTMLFieldSetElement;
declare var addressingSection: (d: Device) => HTMLFieldSetElement;
declare var animatePath: (ids: string[], proto?: string, onComplete?: () => void, event?: SimEvent) => void;
declare var cableAnchor: () => { x: number; y: number } | null;
declare var cableFrom: string | null;
declare var cableFromPort: string | null;
declare var cableKind: CableKind;
declare var cableLabel: (kind: string) => string;
declare var cableMode: boolean;
declare var cablePoint: (ev: PointerEvent | MouseEvent | null) => { x: number; y: number };
declare var cablePress: (d: Device, ev: PointerEvent) => void;
declare var cableStats: (id: string) => { ports: string[]; cables: number };
declare var cableStatusText: () => string;
declare var cableSwatch: (kind: string) => SVGSVGElement | null;
declare var canvasContextItems: () => MenuItem[];
declare var captureDialog: () => HTMLElement;
declare var channelSection: (d: Device, redraw: () => void, note: HTMLElement) => HTMLElement;
declare var cleanPrint: string | null;
declare var cliHelpSection: (title: string, rows: [string, string][], pick: ((code: string) => void) | null) => HTMLElement;
declare var clipboard: string | null;
declare var closeContextMenu: () => void;
declare var closeContextSubmenu: () => void;
declare var closePortPicker: () => void;
declare var closeTerm: () => void;
declare var cmdDevice: Device | null;
declare var cmdHistory: string[];
declare var cmdHistoryAt: number;
declare var commandLog: { time: number; device: string; action: string; result: string }[];
declare var compareLessons: (a: unknown, b: unknown) => number;
declare var completedSteps: Set<number>;
declare var configSections: (box: HTMLElement, d: Device) => void;
declare var contextMenuBox: (items: MenuItem[], cls: string) => HTMLElement;
declare var contextMenuFor: (hit: CanvasHit) => MenuItem[];
declare var contextMenuItemButton: (item: MenuItem) => HTMLButtonElement;
declare var contextMenuKeydown: (e: KeyboardEvent) => void;
declare var controllerRow: (d: Device, controller: string, note: HTMLElement, redraw: () => void) => HTMLElement;
declare var ctxMenuAt: { x: number; y: number } | null;
declare var ctxMenuEl: HTMLElement | null;
declare var ctxSubEl: HTMLElement | null;
declare var currentName: string;
declare var currentTemplate: string | null;
declare var data: Workspace | null;
declare var deviceContextItems: (d: Device) => MenuItem[];
declare var deviceTabs: (kind: string) => string[];
declare var dhcpPoolsSection: (d: Device, tab: string) => HTMLFieldSetElement;
declare var drag: { id: string; start: { x: number; y: number }; origins: { id: string; x: number; y: number }[]; moved: boolean } | null;
declare var dwDevice: Device | null;
declare var editorKey: (id: string) => string;
declare var enabledFilters: () => Set<string>;
declare var fileActionError: (message?: string) => void;
declare var finishedBanner: () => HTMLElement;
declare var firstSentence: (text: string) => string;
declare var forwardTargets: (routerId: string) => Device[];
declare var ftpSection: (d: Device) => HTMLFieldSetElement;
declare var galleryCard: (kind: "lesson" | "template", item: LessonCard) => HTMLButtonElement;
declare var gallerySection: (heading: string, cards: HTMLButtonElement[]) => HTMLElement;
declare var groupContextItems: (group: Group) => MenuItem[];
declare var groupLessonsByLevel: (lessons: LessonCard[]) => { level: number; heading: string; lessons: LessonCard[] }[];
declare var hasUnsavedWork: () => boolean;
declare var hideGallery: () => void;
declare var hideLinkToast: () => void;
declare var hideTip: () => void;
declare var hostPrompt: (d: Device) => string;
/* `icon` is shadowed in every file that names it; no global carries it. */
declare var icon: never;
declare var importProblemMessage: (response: { error?: string; problems?: { text?: string; message?: string }[] }, fallback?: string) => string;
declare var initWorkspaceCanvas: () => void;
declare var installBrowserRecovery: () => void;
declare var ipTarget: string | null;
declare var isPhoneScreen: () => boolean;
declare var lastClick: { id: string; t: number } | null;
declare var lastNoteClick: { id: string | null; t: number };
declare var lastRowClick: { id: number; t: number };
declare var layerText: (layers: Layer[]) => string;
declare var leaveCableMode: () => void;
declare var lessonLevel: (item: unknown) => number;
declare var lessonLevelHeading: (level: number) => string;
declare var lessonOrderKey: (id: unknown) => { family: number; number: number; text: string };
declare var lessonResults: CheckResult[];
declare var lessonRunning: boolean;
declare var linkContextItems: (link: Pick<Link, "a" | "b">) => MenuItem[];
declare var linkToastTimer: number | null;
declare var markClean: () => void;
declare var modelBlurb: (model: string) => string;
declare var noteMode: boolean;
declare var ntpSection: (d: Device) => HTMLFieldSetElement;
declare var nudgeSaveTimer: number | null;
declare var nudgeSelection: (dx: number, dy: number) => void;
declare var openBrowser: (d: Device) => void;
declare var openCapture: (d: Device) => void;
declare var openCliHelp: (pick: (code: string) => void) => void;
declare var openCmd: (d: Device) => void;
declare var openContextSubmenu: (anchor: HTMLElement, children: MenuItem[]) => void;
declare var openDeviceWindow: (d: Device) => void;
declare var openEditor: (d: Device) => void;
declare var openIpDialog: (d: Device) => void;
declare var openPduDetail: (e: SimEvent) => void;
declare var openPortPicker: (ports: PortInfo[], at: { x: number; y: number }, done: (value: { port: string | null } | { cancelled: true }) => void) => void;
declare var openWifiApp: (d: Device) => void;
declare var pageError: (text: string) => HTMLElement;
declare var pageMeta: (text: string) => HTMLElement;
/* `any`: page endpoints return heterogeneous one-off shapes (login, status,
   voucher) read field-by-field at each call site. */
declare var pageRequest: (path: string, params?: Record<string, string>) => Promise<Record<string, any>>;
declare var paletteGroup: string | null;
declare var pduFrom: string | null;
declare var pduMode: boolean;
declare var playStarting: boolean;
declare var playTimer: number | null;
declare var playbackSpeed: number;
declare var portForwardSection: (d: Device, page: RouterPage, info: { id: string; forwards: { outside: number; target: string; inside: number; name: string }[] }, body: HTMLElement) => HTMLFieldSetElement;
declare var portPickerCleanup: (() => void) | null;
declare var portPickerEl: HTMLElement | null;
declare var portPickerKeydown: (e: KeyboardEvent, cancel: () => void) => void;
declare var portTakesCable: (name: string, kind: string) => boolean;
declare var portsFieldset: (box: HTMLElement, d: Device) => void;
declare var pppoeSection: (d: Device) => HTMLFieldSetElement;
declare var prefixToMask: (p: number | null) => string;
declare var prefs: { grid: boolean; sound: boolean; confirm: boolean };
declare var readWorkspace: (storage: Storage | null, key: string) => { raw: string | null; workspace: Workspace | null };
declare var realtimeSetMode: (mode: string) => void;
declare var realtimeTimer: number | null;
declare var recordCommand: (device: string, action: string, output?: string) => void;
declare var reloadWhenScreenGrows: () => void;
declare var renderAll: () => void;
declare var renderCaptureRows: (body: HTMLElement, frames: CaptureFrame[]) => void;
declare var renderEvents: () => void;
declare var renderFilters: () => void;
declare var renderGallery: (payload?: GalleryPayload, kind?: "all" | "lessons" | "templates") => void;
declare var renderLesson: () => void;
declare var renderLessonResults: (results: unknown) => void;
declare var renderPalette: () => void;
declare var renderPduQueue: () => void;
declare var renderPortalPage: (d: Device, page: RouterPage, body: HTMLElement) => void;
declare var renderRouterPage: (d: Device, page: RouterPage, body: HTMLElement) => void;
declare var renderRunLog: () => void;
declare var renderTopology: () => void;
declare var renderWifiList: (d: Device, st: WifiState, nets: SsidInfo[], line: HTMLElement, body: HTMLElement) => void;
declare var renderWifiStatus: (d: Device, st: WifiState, line: HTMLElement, body: HTMLElement) => void;
declare var renderWirelessManager: (box: HTMLElement, d: Device) => void;
declare var reopenTab: (id: string, tab: string) => void;
declare var reportLoadProblems: (response: { problems?: { severity?: string }[]; dropped?: number }) => string;
declare var resetLessonState: () => void;
declare var savePrefs: () => void;
declare var sectionBox: (title: string) => HTMLFieldSetElement;
declare var sectionButton: (label: string, onclick: (e?: MouseEvent) => void) => HTMLButtonElement;
declare var sectionInput: (placeholder: string) => HTMLInputElement;
declare var sectionMeta: (text: string) => HTMLElement;
declare var selectTab: (name: string) => void;
declare var selected: string | null;
declare var selectedLink: { a: string; b: string } | null;
declare var selectedNoteId: string | null;
declare var selection: Set<string>;
declare var selectionContextItems: (count: number) => MenuItem[];
declare var selectionCount: () => number;
declare var setAllFilters: (value: boolean) => void;
declare var setData: (json: Workspace, options?: { skipHistory?: boolean }) => void;
declare var setGalleryMascot: (name: "wave" | "think" | "happy" | "error") => void;
declare var setLessonMascot: (name: "wave" | "think" | "happy" | "error") => void;
declare var setPlaybackSpeed: (index: string | number) => void;
declare var setSelection: (ids: string[]) => void;
declare var setView: (mode: string) => void;
declare var sfx: (name: string) => void;
declare var sharedGatewaySection: (d: Device) => HTMLFieldSetElement;
declare var shellPrompt: string;
declare var showContextMenu: (hit: CanvasHit, ev: MouseEvent) => void;
declare var showEngineLoading: () => void;
declare var showGrid: boolean;
declare var showLinkToast: (text: string) => void;
declare var showTip: (e: MouseEvent, text: string) => void;
declare var simCursor: number;
declare var sounds: Map<string, HTMLAudioElement>;
declare var startDrag: (ev: PointerEvent, d: Device) => void;
declare var startNoteDrag: (ev: PointerEvent, note: Note) => void;
declare var startRealtime: () => void;
declare var statusEl: () => HTMLElement | null;
declare var stepStates: (steps: LessonStep[], results: CheckResult[], completed: Set<number>) => { n: number; state: "done" | "current" | "locked" }[];
declare var stopRealtime: () => void;
declare var svg: () => HTMLElement | null;
declare var syncSelectionClasses: () => void;
declare var syslogOn: Set<string>;
declare var syslogSection: (d: Device) => HTMLFieldSetElement;
declare var tabCli: (pane: HTMLElement, d: Device) => void;
declare var tabConfig: (pane: HTMLElement, d: Device) => void;
declare var tabDesktop: (pane: HTMLElement, d: Device) => void;
declare var tabPhysical: (pane: HTMLElement, d: Device) => void;
declare var tabServices: (pane: HTMLElement, d: Device) => void;
declare var tabWireless: (pane: HTMLElement, d: Device) => void;
declare var telnetPeer: string | null;
declare var telnetPrompt: string;
declare var termDevice: Device | null;
declare var termTarget: Device | null;
declare var tipEl: HTMLElement | null;
declare var toSvg: (ev: MouseEvent | PointerEvent) => { x: number; y: number };
declare var toggleSelection: (id: string) => void;
declare var tunnelSection: (d: Device) => HTMLFieldSetElement;
declare var updateCableChip: () => void;
declare var updateFilterCount: (details: HTMLDetailsElement) => void;
declare var validWorkspaceSnapshot: (value: unknown) => boolean;
declare var viewCenter: () => { x: number; y: number };
declare var viewMode: "logical" | "physical";
declare var visibleEvents: () => SimEvent[];
declare var vnetSection: (d: Device) => HTMLFieldSetElement;
declare var wifiCarrierName: (id: string) => string;
declare var wifiNetworkRow: (d: Device, st: WifiState, net: SsidInfo, line: HTMLElement) => HTMLElement;
declare var wireActions: () => void;
declare var wireCanvasDrop: () => void;
declare var wireContextMenu: () => void;
declare var wireKeyboard: () => void;
declare var wireNoteKeys: () => void;
declare var wireWorkspaceCanvas: () => void;
declare var wlanAddForm: (d: Device, note: HTMLElement, redraw: () => void) => HTMLElement;
declare var wlanRow: (d: Device, w: Wlan, note: HTMLElement, redraw: () => void) => HTMLElement;
/* The canvas class lives in the bundled module graph; main.ts puts the class
   itself on globalThis. Legacy code only touches this subset of its surface. */
interface WorkspaceCanvasInstance {
  camera: { x: number; y: number; zoom: number; toWorld(s: { x: number; y: number }): { x: number; y: number }; zoomAt(screen: { x: number; y: number }, factor: number): void };
  handlers: {
    onDeviceDown?: (device: { id: string; name: string; model: string }, ev: PointerEvent) => void;
    onGroupDown?: (group: Group, ev: PointerEvent) => void;
    onLinkDown?: (link: Link) => void;
    onNoteDown?: (note: Note, ev: PointerEvent) => void;
    onMarquee?: (ids: string[], additive: boolean) => void;
    onBackgroundDown?: (ev: PointerEvent) => void;
    onHover?: (device: { id: string; name: string; model: string } | null, ev: MouseEvent) => void;
    onContextMenu?: (hit: CanvasHit, ev: MouseEvent) => void;
  };
  cssWidth: number;
  cssHeight: number;
  setState(state: {
    workspace: Workspace;
    selected: Set<string>;
    marked?: Set<string | null>;
    linked?: { a: string; b: string } | null;
    grid?: boolean;
    physical?: boolean;
    notes?: Note[];
    selectedNote?: string | null;
    pending?: { from: { x: number; y: number }; to: { x: number; y: number } } | null;
    empty?: { message: string; mascot: string };
  }): void;
  deviceAt(ev: PointerEvent | MouseEvent): { id: string } | null;
  worldAt(ev: PointerEvent | MouseEvent): { x: number; y: number };
  worldCenter(): { x: number; y: number };
  runPacket(run: {
    points: { x: number; y: number }[];
    color: string;
    segmentMs: number;
    dropped?: boolean;
    onDone?: () => void;
  }): void;
  renderForPrint(width: number, height: number): HTMLCanvasElement | null;
  fit(): void;
  fitRacks(): void;
  requestDraw(): void;
}

declare var WorkspaceCanvas: { new (canvas: HTMLCanvasElement): WorkspaceCanvasInstance };
declare var workspaceCanvas: WorkspaceCanvasInstance | null;
declare var zoom: (factor: number) => void;

/* ---------------- helpers the bridge did not declare but the files share ---------------- */
/* Every script loads in index.html order into one scope, so these cross-file
   helpers need declarations too; without them the sources do not check. */

type LessonCard = {
  id: string;
  title: string;
  goal: string;
  level?: number;
  minutes?: number;
  stepCount?: number;
};
type CheckResult = { id: string; label?: string; passed: boolean; actual: string; hint: string };
type CaptureFrame = {
  t: number;
  srcIp?: string;
  srcMac: string;
  dstIp?: string;
  dstMac: string;
  proto: string;
  length: number;
  info: string;
};
type GalleryPayload = { error?: string; lessons?: LessonCard[]; templates?: LessonCard[] };
type RouterPage = { host?: string; device?: string; title?: string; app?: string; status?: number; reason?: string; text?: string };
type WifiState = { associated: boolean; ssid?: string; wlc?: string; bars?: number };
type SsidInfo = { ssid: string; security: string; wlc: string };
type Wlan = { ssid: string; security: string; guest?: boolean };

declare var api: (path: string, params?: Record<string, string | number>) => Promise<ApiResult>;
/* `any`: callers narrow every response themselves (`Array.isArray(x.devices)`). */
declare var getJson: (path: string) => Promise<any>;
declare var boot: () => Promise<void>;
declare var choosePort: (device: Device, kind: string, at: { x: number; y: number }) => Promise<{ port: string | null } | { cancelled: true }>;
declare var openTerm: (d: Device) => void;
/* `any`: each endpoint (cli, webfetch, ftp, wifi…) answers a distinct shape. */
declare var jsonRequest: (path: string, params?: Record<string, string>) => Promise<Record<string, any>>;
declare var importTnetFile: (file: File | null | undefined) => Promise<boolean>;
declare var togglePlay: () => Promise<void>;
declare var stepSim: (dir: number) => Promise<void>;
declare var selectPhysical: (d: Device) => Promise<void>;
declare var placeNote: (ev: PointerEvent | MouseEvent) => Promise<void>;
declare var editNote: (note: Note) => Promise<void>;
declare var protocolColor: (proto: string | undefined) => string;
declare var selectCaptureEvent: (id: number, animate?: boolean) => void;
declare var captureVisibleEvents: () => SimEvent[];
declare var captureRows: (events: SimEvent[]) => { event: SimEvent; info: string }[];
declare var applyCaptureFilter: (events: SimEvent[], source: string) => { events: SimEvent[]; error: string };
declare var captureInfo: (event: SimEvent | null) => string;
declare var renderNarration: (event: SimEvent | null) => void;
declare var renderFlow: () => void;
declare var renderPacketDetails: (event: SimEvent | null) => Promise<void>;
declare var eventProtocol: (event: SimEvent | null) => string;
declare var renderCapture: () => void;
declare var wireEngineerView: () => void;
declare var setNarrationMascot: (state: string) => void;
declare var resetPacketDetails: () => void;
declare var highlightByteRange: (index: number | null) => void;
declare var bytesFromHex: (hex: string) => Uint8Array;
declare var layerRange: (name: string, bytes: Uint8Array) => [number, number] | null;
declare var formatByteRows: (bytes: Uint8Array) => { offset: string; hex: string[]; ascii: string }[];
declare var ladder: (events: SimEvent[]) => { lanes: { id: string; name: string }[]; arrows: { eventId: number; from: string; to: string; ttl: number; info: string }[] };
declare var PROTOCOL_COLORS: Readonly<Record<string, string>>;
declare var NARRATION_MASCOTS: Readonly<Record<string, string>>;

/* Bridges the bundled app.js sets on globalThis for the classic scripts. */
declare var askConfirm: (message: string, okText?: string) => Promise<boolean>;
declare var askText: (message: string, value?: string) => Promise<string | null>;
declare var bringToFront: (win: HTMLElement) => void;
declare var wireMenus: () => void;
declare var makeWindowMovable: (win: HTMLElement | null) => void;
declare var openWindowForKind: (device: Device | null, workspace: Workspace | null) => boolean;
declare var openGroupCard: (group: Group) => boolean;
declare var openFlowsWindow: (workspace: Workspace | null) => boolean;
declare var workspaceFingerprint: (workspace: Workspace | null) => string | null;
declare var workspaceHasUnsaved: (workspace: Workspace | null, clean: string | null) => boolean;
declare var paletteTiles: (group: string | null, palette: PaletteTile[]) => PaletteTile[];
declare var paletteKeepsCableMode: (group: string | null) => boolean;
declare var groupProtocols: (labels: string[]) => { name: string; labels: string[] }[];
declare var paletteStartGroup: (saved: string | null, groups: string[]) => string;
declare var PALETTE_CONNECTIONS: string;
declare var buildRunLog: (events: SimEvent[], commands: { time: number; device: string; action: string; result: string }[], query: string) => { id?: number; text: string; cls?: string }[];
declare var formatLogLine: (entry: unknown) => string;
declare var icon3d: (key: string) => string;
declare var engineLoadingMessage: (detail: { loaded: number; total: number }) => string;
declare var selectSidebarTab: (name: string) => void;
declare var TakumiEngine: { ready: Promise<boolean> };
declare var queuedPduCount: number;
declare var shouldAutoShowGallery: (store: Storage | null) => boolean;
