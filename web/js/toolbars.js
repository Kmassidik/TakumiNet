/* ---------------- toolbars ---------------- */
const PRIMARY = [
  ['iTBNew.png', 'New', 'new'], ['iTBOpen.png', 'Open', 'open'],
  ['iTBSave.png', 'Save', 'save'], ['iTBPrint.png', 'Print', 'print'], null,
  ['iTBUndo.png', 'Undo', 'undo'], ['iTBRedo.png', 'Redo', 'redo'], null,
  ['iTBCopy.png', 'Copy', 'copy'], ['iTBPaste.png', 'Paste', 'paste'],
  ['delete.svg', 'Delete', 'delete'], null,
  ['iTBZoomIn.png', 'Zoom in', 'zoom-in'], ['iTBZoomOut.png', 'Zoom out', 'zoom-out'],
  ['iTBZoomReset.png', 'Reset zoom', 'zoom-reset'], null,
  ['iTBPalette.png', 'Palette', 'toggle-palette'],
  ['iTBCustomDevice.png', 'Custom device', 'custom-device'], null,
  ['iTBClusterAssociations.png', 'Clusters', ''], ['iTBActivityWizard.png', 'Activity wizard', ''],
  ['iTBChallengeMode.png', 'Challenge mode', ''], null,
  ['iTBHelp.png', 'Help', 'help'],
];

const SECONDARY = [
  ['add-simple-pdu.svg', 'Simple PDU', 'pdu'], ['add-complex-pdu.svg', 'Complex PDU', 'pdu'], null,
  ['drawing-palette.svg', 'Drawing palette', ''], ['ellipse.svg', 'Ellipse', ''], null,
  ['4-way-nav.svg', 'Navigate', ''], ['grid-view.svg', 'Grid', 'toggle-grid'],
  ['compass.svg', 'Compass', ''], null,
  ['environment.svg', 'Environment', ''], ['home.svg', 'Home', 'zoom-reset'],
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
    b.title = action ? title : `${title} (not implemented)`;
    if (!action) b.disabled = true;
    if (action) b.dataset.action = action;
    const img = document.createElement('img');
    img.src = asset('art/Toolbar/' + file);
    img.alt = title;
    b.appendChild(img);
    el.appendChild(b);
  }
}
