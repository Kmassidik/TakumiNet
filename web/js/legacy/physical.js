function cableStats(id) {
  const ports = new Set;
  let cables = 0;
  for (const l of data.links || []) {
    if (l.a === id) {
      ports.add(l.aPort);
      cables++;
    } else if (l.b === id) {
      ports.add(l.bPort);
      cables++;
    }
  }
  return { ports: [...ports].filter(Boolean), cables };
}
async function selectPhysical(d) {
  selectedLink = null;
  setSelection([d.id]);
  renderTopology();
  const stats = cableStats(d.id);
  const r = await getJson(`/api/devices/ports?id=${encodeURIComponent(d.id)}`);
  const ports = Array.isArray(r.ports) ? r.ports : [];
  if (ports.length) {
    const names = ports.map((p) => p.ip ? `${p.name} (${p.ip}/${p.prefix})` : p.name);
    status(`${d.name} · ${d.model} — ${ports.length} port${ports.length === 1 ? "" : "s"}: ${names.join(", ")}`);
  } else {
    status(`${d.name} · ${d.model} — ${stats.cables} cable${stats.cables === 1 ? "" : "s"}${stats.ports.length ? ` on ${stats.ports.join(", ")}` : ""}`);
  }
}
function setView(mode) {
  viewMode = mode === "physical" ? "physical" : "logical";
  const physical = viewMode === "physical";
  document.querySelector(".canvas-wrap").classList.toggle("physical-mode", physical);
  document.querySelectorAll(".tabs .tab[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === viewMode);
  });
  const toggle = document.getElementById("physical-toggle");
  if (toggle) {
    toggle.classList.toggle("active", physical);
    toggle.setAttribute("aria-pressed", physical ? "true" : "false");
  }
  renderTopology();
  status(physical ? "Physical view" : "Logical view");
}
