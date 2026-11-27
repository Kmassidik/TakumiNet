import { el, errorOf, section } from "./kind_parts.js";

const STATUS_TEXT = {
  up: "Up: every boundary cable is live",
  degraded: "Degraded: a device inside has a port down",
  down: "Down: a boundary cable is down",
  isolated: "Isolated: no cable crosses the boundary",
};

export function renderGroupCard(doc, body, group) {
  body.replaceChildren();
  const box = section(doc, body, group.name);
  const list = el(doc, "ul", "kw-list");
  list.appendChild(el(doc, "li", "kw-row", `${group.devices} device${group.devices === 1 ? "" : "s"} inside`));
  list.appendChild(el(doc, "li", `kw-row kw-status-${group.status}`, STATUS_TEXT[group.status] ?? group.status));
  box.appendChild(list);
  body.appendChild(el(doc, "p", "kw-note", "Double-click the node on the canvas to expand it."));
}

const DOUBLE_MS = 400;

/* One press on a group node opens its card; a second press on the same node
   within 400 ms expands the group instead and hands the fresh workspace on. */
export function makeGroupPress(deps) {
  let last = null;
  return (group) => {
    const t = deps.now();
    if (last && last.id === group.id && t - last.t < DOUBLE_MS) {
      last = null;
      void (async () => {
        try {
          const res = await deps.post(`/api/groups/expand?id=${encodeURIComponent(group.id)}`);
          if (!errorOf(res)) deps.applied(res);
        } catch {
          /* the node stays collapsed; the next double-click tries again */
        }
      })();
      return;
    }
    last = { id: group.id, t };
    deps.card(group);
  };
}
