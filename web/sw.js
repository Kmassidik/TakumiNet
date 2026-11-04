'use strict';

const CACHE_PREFIX = 'Takumi-';
const OLD_CACHE_PREFIXES = ['TakumiNet-']; // caches made before the rename
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const PRECACHE_URLS = Object.freeze([
  '/',
  '/workspace',
  '/about',
  '/id',
  '/id/about',
  '/tokens.css',
  '/landing.css',
  '/landing/takumi-idle.webp',
  '/landing/takumi-wave.webp',
  '/landing/takumi-think.webp',
  '/landing/takumi-happy.webp',
  '/workspace.css',
  '/engine.wasm',

  '/js/actions.js',
  '/js/capture_filter.js',
  '/js/capture_table.js',
  '/js/chrome.js',
  '/js/clients.js',
  '/js/command_prompt.js',
  '/js/device_tabs.js',
  '/js/device_window.js',
  '/js/engine.js',
  '/js/flow.js',
  '/js/icons.js',
  '/js/interaction.js',
  '/js/ip_dialog.js',
  '/js/lessons.js',
  '/js/main.js',
  '/js/phone.js',
  '/js/ui.js',
  '/js/packet_details.js',
  '/js/palette.js',
  '/js/physical.js',
  '/js/recovery.js',
  '/js/services_sections.js',
  '/js/services_tab.js',
  '/js/simulation.js',
  '/js/state.js',
  '/js/terminal.js',
  '/js/toolbars.js',
  '/js/topology.js',
  '/js/web_apps.js',
  '/js/boot.js',

  '/art3d/apps/browser.webp',
  '/art3d/apps/cmd.webp',
  '/art3d/apps/dialup.webp',
  '/art3d/apps/email.webp',
  '/art3d/apps/netsearch.webp',
  '/art3d/apps/nic.webp',
  '/art3d/apps/pppoe.webp',
  '/art3d/apps/terminal.webp',
  '/art3d/apps/traffic.webp',
  '/art3d/apps/voip.webp',
  '/art3d/apps/vpn.webp',
  '/art3d/apps/wireless.webp',
  '/art3d/cables/coax.webp',
  '/art3d/cables/coiled.webp',
  '/art3d/cables/console.webp',
  '/art3d/cables/cross.webp',
  '/art3d/cables/fiber.webp',
  '/art3d/cables/phone.webp',
  '/art3d/cables/straight.webp',
  '/art3d/cables/usb.webp',
  '/art3d/devices/analogphone.webp',
  '/art3d/devices/ap.webp',
  '/art3d/devices/asa.webp',
  '/art3d/devices/cablemodem.webp',
  '/art3d/devices/celltower.webp',
  '/art3d/devices/cloud.webp',
  '/art3d/devices/dsl.webp',
  '/art3d/devices/historian.webp',
  '/art3d/devices/homerouter.webp',
  '/art3d/devices/rtrw-gateway.webp',
  '/art3d/devices/provider-link.webp',
  '/art3d/devices/sector-radio.webp',
  '/art3d/devices/client-radio.webp',
  '/art3d/devices/hotspot-ap.webp',
  '/art3d/devices/hub.webp',
  '/art3d/devices/ie2000.webp',
  '/art3d/devices/ioe.webp',
  '/art3d/devices/laptop.webp',
  '/art3d/devices/linksys.webp',
  '/art3d/devices/meraki.webp',
  '/art3d/devices/multiuser.webp',
  '/art3d/devices/netcontroller.webp',
  '/art3d/devices/patchpanel.webp',
  '/art3d/devices/pc.webp',
  '/art3d/devices/pda.webp',
  '/art3d/devices/phone.webp',
  '/art3d/devices/plc.webp',
  '/art3d/devices/printer.webp',
  '/art3d/devices/router.webp',
  '/art3d/devices/server.webp',
  '/art3d/devices/sniffer.webp',
  '/art3d/devices/switch.webp',
  '/art3d/devices/tablet.webp',
  '/art3d/devices/thing.webp',
  '/art3d/devices/tv.webp',
  '/art3d/devices/wlc.webp',
  '/art3d/groups/firewall.webp',
  '/art3d/groups/firewall6.webp',
  '/art3d/groups/hubs.webp',
  '/art3d/groups/notes.webp',
  '/art3d/groups/routers.webp',
  '/art3d/groups/security.webp',
  '/art3d/groups/switches.webp',
  '/art3d/groups/wan.webp',
  '/art3d/groups/wireless.webp',
  '/art3d/mascot/error.webp',
  '/art3d/mascot/happy.webp',
  '/art3d/mascot/idle.webp',
  '/art3d/mascot/sleep.webp',
  '/art3d/mascot/think.webp',
  '/art3d/mascot/wave.webp',
  '/art3d/misc/cable.webp',
  '/art3d/misc/devices.webp',
  '/art3d/misc/network.webp',
  '/art3d/sim/back.webp',
  '/art3d/sim/fastforward.webp',
  '/art3d/sim/pause.webp',
  '/art3d/sim/play.webp',
  '/art3d/sim/reset.webp',
  '/art3d/sim/stepa.webp',
  '/art3d/sim/stepb.webp',
  '/art3d/toolbar/challenge.webp',
  '/art3d/toolbar/compass.webp',
  '/art3d/toolbar/complex.webp',
  '/art3d/toolbar/copy.webp',
  '/art3d/toolbar/delete.webp',
  '/art3d/toolbar/environment.webp',
  '/art3d/toolbar/grid.webp',
  '/art3d/toolbar/help.webp',
  '/art3d/toolbar/home.webp',
  '/art3d/toolbar/new.webp',
  '/art3d/toolbar/open.webp',
  '/art3d/toolbar/paste.webp',
  '/art3d/toolbar/print.webp',
  '/art3d/toolbar/redo.webp',
  '/art3d/toolbar/save.webp',
  '/art3d/toolbar/simple.webp',
  '/art3d/toolbar/templates.webp',
  '/art3d/toolbar/toolbox.webp',
  '/art3d/toolbar/topology.webp',
  '/art3d/toolbar/undo.webp',
  '/art3d/toolbar/wizard.webp',
  '/art3d/toolbar/zoomin.webp',
  '/art3d/toolbar/zoomout.webp',
  '/art3d/toolbar/zoomreset.webp',

  '/sounds/addPacketButton.wav',
  '/sounds/addPacketDevice.wav',
  '/sounds/devicePlacement.wav',
  '/sounds/errorMsg.wav',
  '/sounds/movieControlButton.wav',
  '/sounds/newScenarioButton.wav',
  '/sounds/popUp.wav',
  '/sounds/removeDevice.wav',
  '/sounds/removeLink.wav',
  '/sounds/simulationTab.wav',
  '/sounds/topologyTab.wav',

  '/templates/les-l1-01-router-login.xml',
  '/templates/les-l1-02-wifi-name.xml',
  '/templates/les-l1-03-guest-wifi.xml',
  '/templates/les-l1-04-reserve-address.xml',
  '/templates/les-l1-05-port-forward.xml',
  '/templates/les-l1-06-far-room.xml',
  '/templates/tpl-l3-office-vpn.xml',
  '/templates/les-l3-06-remote-owner.xml',
  '/templates/tpl-l2-rtrw-small.xml',
  '/templates/les-l2-01-first-gateway.xml',
  '/templates/les-l2-02-customer-login.xml',
  '/templates/tpl-l2-rtrw-busy.xml',
  '/templates/les-l2-03-speed-limits.xml',
  '/templates/les-l2-06-find-the-hog.xml',
  '/templates/les-l1-07-find-the-fault.xml',
  '/templates/tpl-l3-office-vlans.xml',
  '/templates/les-l3-01-three-vlans.xml',
  '/templates/les-l3-02-inter-vlan.xml',
  '/templates/les-l3-04-acl-fence.xml',
  '/templates/tpl-l4-campus-ospf.xml',
  '/templates/les-l4-03-ospf-campus.xml',
  '/templates/les-l3-05-port-security.xml',
  '/templates/les-l3-03-dhcp-per-vlan.xml',
  '/templates/t1.xml',
  '/templates/t2.xml',
  '/templates/t3.xml',
  '/templates/t4.xml',
  '/templates/t5.xml',
  '/templates/tpl-connect.xml',
  '/templates/tpl-home.xml',
  '/templates/tpl-l1-wifi-home.xml',
  '/templates/tpl-l1-two-rooms.xml',
  '/templates/tpl-l1-broken-wifi.xml',
  '/templates/tpl-routed.xml',
  '/templates/tpl-star.xml',
  '/templates/tpl-web.xml',
]);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => (name.startsWith(CACHE_PREFIX) || OLD_CACHE_PREFIXES.some((old) => name.startsWith(old))) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') return (await cache.match(url.pathname)) || cache.match('/');
      throw error;
    }
  })());
});
