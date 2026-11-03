/* ---------------- topology: drawn on the workspace canvas ---------------- */
let workspaceCanvas = null;

function initWorkspaceCanvas() {
  workspaceCanvas = new WorkspaceCanvas(document.getElementById('topology'));
}

function renderTopology() {
  if (!data || !workspaceCanvas) return;
  renderDeviceList(document.getElementById('device-list'), data.devices, (id) => {
    setSelection([id]);
    renderTopology();
  });
  workspaceCanvas.setState({
    workspace: data,
    selected: selection,
    marked: new Set([cableFrom, pduFrom].filter(Boolean)),
    linked: selectedLink,
    grid: showGrid,
    empty: data.devices.length
      ? undefined
      : { message: 'No devices yet. Drop a device here to begin', mascot: '/art3d/mascot/sleep.webp' },
  });
}

function wireWorkspaceCanvas() {
  workspaceCanvas.handlers = {
    onDeviceDown: (device, ev) => startDrag(ev, data.devices.find((d) => d.id === device.id)),
    onLinkDown: (link) => {
      selectedLink = { a: link.a, b: link.b };
      setSelection([]);
      const kind = link.kind === 'eConsole' ? 'Console cable' : 'Link';
      status(`${kind}: ${link.from.name} ${link.aPort} ↔ ${link.to.name} ${link.bPort}`);
      renderTopology();
    },
    onBackgroundDown: () => {
      if (!selection.size && !selectedLink) return;
      setSelection([]);
      selectedLink = null;
      renderTopology();
    },
    onHover: (device, ev) => {
      if (device) showTip(ev, `${device.name} · ${device.model}`);
      else hideTip();
    },
  };
}

function viewCenter() {
  return workspaceCanvas.worldCenter();
}
