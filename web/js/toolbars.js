/* ---------------- toolbars ---------------- */
// [icon, title, action]. Icons are "group/name" in web/art/3d.
const PRIMARY = [
  ['toolbar/new', 'New', 'new'], ['toolbar/open', 'Open', 'open'],
  ['toolbar/save', 'Save', 'save'], ['toolbar/print', 'Print', 'print'], null,
  ['toolbar/undo', 'Undo', 'undo'], ['toolbar/redo', 'Redo', 'redo'], null,
  ['toolbar/copy', 'Copy', 'copy'], ['toolbar/paste', 'Paste', 'paste'],
  ['toolbar/delete', 'Delete', 'delete'], null,
  ['toolbar/zoomin', 'Zoom in', 'zoom-in'], ['toolbar/zoomout', 'Zoom out', 'zoom-out'],
  ['toolbar/zoomreset', 'Reset zoom', 'zoom-reset'], null,
  ['toolbar/templates', 'Palette', 'toggle-palette'],
  ['toolbar/toolbox', 'Custom device', 'custom-device'], null,
  ['toolbar/help', 'Help', 'help'],
];

const SECONDARY = [
  ['toolbar/simple', 'Send PDU', 'pdu'], null,
  ['toolbar/grid', 'Grid', 'toggle-grid'], null,
  ['toolbar/home', 'Home', 'zoom-reset'],
];

function renderToolbar(el, items) {
  el.replaceChildren();
  for (const item of items) {
    if (!item) {
      const sep = document.createElement('span');
      sep.className = 'sep';
      el.appendChild(sep);
      continue;
    }
    const [file, title, action] = item;
    const b = document.createElement('button');
    b.title = title;
    b.dataset.action = action;
    const img = document.createElement('img');
    img.src = icon3d(file);
    img.alt = title;
    b.appendChild(img);
    el.appendChild(b);
  }
}
