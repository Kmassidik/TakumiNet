/* ---------------- port picker ---------------- */
/* When a cable lands on a device with more than one free compatible port, a
   small chooser pops at the pointer, dressed like the context menu. Used
   ports stay visible but greyed, naming the far end. */

/* Cables that terminate on a named interface; the rest pick their own port. */
const PORT_PICKER_CABLES = new Set(['eCopper', 'eCross', 'eFiber', 'eSerial']);

function portTakesCable(name, kind) {
  const serial = name.startsWith('Serial');
  if (kind === 'eSerial') return serial;
  return !serial && /^(FastEthernet|GigabitEthernet|Ethernet|Ether)/.test(name);
}

async function compatiblePorts(id, kind) {
  if (!PORT_PICKER_CABLES.has(kind)) return null;
  const res = await getJson(`/api/devices/ports?id=${encodeURIComponent(id)}`);
  if (!res || res.error || !Array.isArray(res.ports)) return null;
  const ports = res.ports.filter((p) => portTakesCable(p.name, kind));
  return ports.length ? ports : null;
}

let portPickerEl = null;
let portPickerCleanup = null;

function closePortPicker() {
  if (portPickerCleanup) portPickerCleanup();
}

/* Arrow keys walk the free ports, Enter chooses, Escape cancels. */
function portPickerKeydown(e, cancel) {
  if (!portPickerEl) return;
  const buttons = [...portPickerEl.querySelectorAll('button:not(:disabled)')];
  const at = buttons.indexOf(document.activeElement);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    e.stopPropagation();
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    const next = buttons[(at < 0 ? (dir === 1 ? -1 : 0) : at) + dir] || buttons[dir === 1 ? 0 : buttons.length - 1];
    if (next) next.focus();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    e.stopPropagation();
    if (at >= 0) buttons[at].onclick(e);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    cancel();
  }
}

function openPortPicker(ports, at, done) {
  closePortPicker();
  if (typeof closeContextMenu === 'function') closeContextMenu();
  let settled = false;
  const finish = (value) => {
    if (settled) return;
    settled = true;
    if (portPickerEl) portPickerEl.remove();
    portPickerEl = null;
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('pointerdown', onPress, true);
    portPickerCleanup = null;
    done(value);
  };
  const onKey = (e) => portPickerKeydown(e, () => finish({ cancelled: true }));
  const onPress = (e) => {
    if (portPickerEl && !portPickerEl.contains(e.target)) finish({ cancelled: true });
  };
  portPickerCleanup = () => finish({ cancelled: true });

  const items = ports.map((p) => ({
    label: p.peer ? `${p.name} → ${p.peer.name} ${p.peer.port}` : p.name,
    disabled: !!p.peer,
    run: () => finish({ port: p.name }),
  }));
  portPickerEl = contextMenuBox(items, 'ctx-menu port-picker');
  const spot = placeMenu(
    { x: at.x, y: at.y },
    { w: portPickerEl.offsetWidth, h: portPickerEl.offsetHeight },
    { w: window.innerWidth, h: window.innerHeight },
  );
  portPickerEl.style.left = `${spot.x}px`;
  portPickerEl.style.top = `${spot.y}px`;
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('pointerdown', onPress, true);
  const first = portPickerEl.querySelector('button:not(:disabled)');
  if (first) first.focus();
}

/* Resolves {port} with the chosen interface, {port: null} to let the engine
   pick, or {cancelled: true} when the user backs out of the chooser. The menu
   only appears when two or more compatible ports are free. */
async function choosePort(device, kind, at) {
  const ports = await compatiblePorts(device.id, kind);
  if (!ports) return { port: null };
  const free = ports.filter((p) => !p.peer);
  if (free.length <= 1) return { port: free.length === 1 ? free[0].name : null };
  return new Promise((resolve) => openPortPicker(ports, at, resolve));
}
