import type { DocLike, ElementLike } from "./dom";
import { asText, asyncSection, el, errorOf, note, records, rowList, type KindDevice, type Post } from "./kind_parts";

type ManagerGlobal = { renderWirelessManager?: (box: ElementLike, device: KindDevice) => void };

export function renderHotspotWindow(doc: DocLike, body: ElementLike, device: KindDevice, post: Post): Promise<void> {
  body.replaceChildren();
  /* In the app the shared wireless manager (web/js/wireless_tab.js) carries the
     full controls; tests and headless use fall back to the read-only listing. */
  const manage = (globalThis as unknown as ManagerGlobal).renderWirelessManager;
  let done = Promise.resolve();
  if (typeof manage === "function") {
    const box = el(doc, "div", "dw-wireless");
    body.appendChild(box);
    manage(box, device);
  } else {
    done = asyncSection(doc, body, "Wireless networks", "Could not load the wireless networks.", async (box) => {
      const res = await post(`/api/wifi/wlans?id=${encodeURIComponent(device.id)}`);
      const err = errorOf(res);
      if (err) throw new Error(err);
      const rows = records(res, "wlans");
      box.replaceChildren();
      if (rows.length === 0) box.appendChild(note(doc, "empty", "No wireless network is set up yet."));
      else box.appendChild(rowList(doc, rows.map((r) => `${asText(r["ssid"])} (${asText(r["security"])})`)));
    });
  }
  body.appendChild(note(doc, "plain", "Visitors sign in with a voucher on the gateway."));
  return done;
}
