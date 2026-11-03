/* ---------------- toolbars ---------------- */
// [icon, title, action]. An icon is "group/name" in web/art/3d, or "~glyph" while no 3D art exists yet.
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
  ['~\u2709', 'Simple PDU', 'pdu'], ['~\u2709+', 'Complex PDU', 'pdu'], null,
  ['~\u25A6', 'Grid', 'toggle-grid'], null,
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
    if (file.startsWith('~')) {
      b.textContent = file.slice(1);
    } else {
      const img = document.createElement('img');
      img.src = icon3d(file);
      img.alt = title;
      b.appendChild(img);
    }
    el.appendChild(b);
  }
}
