/* ---------------- cable feedback ---------------- */
/* The chip over the canvas says which cable is armed and how to leave cable
   mode; the toast repeats a refused link where it cannot be missed. */
function cableLabel(kind) {
  const row = CABLE_TYPES.find((c) => c[0] === kind);
  return row ? row[1] : 'Cable';
}

/* One sentence for the whole cable state. The chip and the status bar both
   show it, so they can never disagree about what the next click does. */
function cableStatusText() {
  const from = cableFrom && data ? data.devices.find((d) => d.id === cableFrom) : null;
  return from
    ? `${cableLabel(cableKind)} cable from ${from.name} — click the far end. Esc cancels.`
    : `${cableLabel(cableKind)} cable — click two devices. Esc cancels.`;
}

function updateCableChip() {
  const chip = document.getElementById('cable-chip');
  if (!chip) return;
  if (!cableMode) {
    chip.hidden = true;
    chip.textContent = '';
    return;
  }
  chip.textContent = cableStatusText();
  chip.hidden = false;
}

let linkToastTimer = null;

function hideLinkToast() {
  const toast = document.getElementById('link-toast');
  if (toast) toast.hidden = true;
  if (linkToastTimer) {
    clearTimeout(linkToastTimer);
    linkToastTimer = null;
  }
}

function showLinkToast(text) {
  const toast = document.getElementById('link-toast');
  if (!toast) return;
  toast.textContent = text;
  toast.hidden = false;
  toast.onclick = hideLinkToast;
  if (linkToastTimer) clearTimeout(linkToastTimer);
  linkToastTimer = setTimeout(hideLinkToast, 3500);
}
