'use strict';

const CACHE_PREFIX = 'TakumiNet-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const PRECACHE_URLS = Object.freeze([
  '/',
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
  '/js/mail.js',
  '/js/main.js',
  '/js/mib.js',
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
  '/js/traffic.js',
  '/js/web_apps.js',
  '/js/windows.js',
  '/js/wireless.js',

  '/art3d/apps/browser.png',
  '/art3d/apps/cmd.png',
  '/art3d/apps/dialup.png',
  '/art3d/apps/email.png',
  '/art3d/apps/netsearch.png',
  '/art3d/apps/nic.png',
  '/art3d/apps/pppoe.png',
  '/art3d/apps/terminal.png',
  '/art3d/apps/traffic.png',
  '/art3d/apps/voip.png',
  '/art3d/apps/vpn.png',
  '/art3d/apps/wireless.png',
  '/art3d/cables/coax.png',
  '/art3d/cables/coiled.png',
  '/art3d/cables/console.png',
  '/art3d/cables/cross.png',
  '/art3d/cables/fiber.png',
  '/art3d/cables/phone.png',
  '/art3d/cables/straight.png',
  '/art3d/cables/usb.png',
  '/art3d/devices/analogphone.png',
  '/art3d/devices/ap.png',
  '/art3d/devices/asa.png',
  '/art3d/devices/cablemodem.png',
  '/art3d/devices/celltower.png',
  '/art3d/devices/cloud.png',
  '/art3d/devices/dsl.png',
  '/art3d/devices/historian.png',
  '/art3d/devices/homerouter.png',
  '/art3d/devices/hub.png',
  '/art3d/devices/ie2000.png',
  '/art3d/devices/ioe.png',
  '/art3d/devices/laptop.png',
  '/art3d/devices/linksys.png',
  '/art3d/devices/meraki.png',
  '/art3d/devices/multiuser.png',
  '/art3d/devices/netcontroller.png',
  '/art3d/devices/patchpanel.png',
  '/art3d/devices/pc.png',
  '/art3d/devices/pda.png',
  '/art3d/devices/phone.png',
  '/art3d/devices/plc.png',
  '/art3d/devices/printer.png',
  '/art3d/devices/router.png',
  '/art3d/devices/server.png',
  '/art3d/devices/sniffer.png',
  '/art3d/devices/switch.png',
  '/art3d/devices/tablet.png',
  '/art3d/devices/thing.png',
  '/art3d/devices/tv.png',
  '/art3d/devices/wlc.png',
  '/art3d/groups/firewall.png',
  '/art3d/groups/firewall6.png',
  '/art3d/groups/hubs.png',
  '/art3d/groups/notes.png',
  '/art3d/groups/routers.png',
  '/art3d/groups/security.png',
  '/art3d/groups/switches.png',
  '/art3d/groups/wan.png',
  '/art3d/groups/wireless.png',
  '/art3d/mascot/error.png',
  '/art3d/mascot/happy.png',
  '/art3d/mascot/idle.png',
  '/art3d/mascot/sleep.png',
  '/art3d/mascot/think.png',
  '/art3d/mascot/wave.png',
  '/art3d/misc/cable.png',
  '/art3d/misc/devices.png',
  '/art3d/misc/network.png',
  '/art3d/sim/back.png',
  '/art3d/sim/fastforward.png',
  '/art3d/sim/pause.png',
  '/art3d/sim/play.png',
  '/art3d/sim/reset.png',
  '/art3d/sim/stepa.png',
  '/art3d/sim/stepb.png',
  '/art3d/toolbar/challenge.png',
  '/art3d/toolbar/compass.png',
  '/art3d/toolbar/complex.png',
  '/art3d/toolbar/copy.png',
  '/art3d/toolbar/delete.png',
  '/art3d/toolbar/environment.png',
  '/art3d/toolbar/grid.png',
  '/art3d/toolbar/help.png',
  '/art3d/toolbar/home.png',
  '/art3d/toolbar/new.png',
  '/art3d/toolbar/open.png',
  '/art3d/toolbar/paste.png',
  '/art3d/toolbar/print.png',
  '/art3d/toolbar/redo.png',
  '/art3d/toolbar/save.png',
  '/art3d/toolbar/simple.png',
  '/art3d/toolbar/templates.png',
  '/art3d/toolbar/toolbox.png',
  '/art3d/toolbar/topology.png',
  '/art3d/toolbar/undo.png',
  '/art3d/toolbar/wizard.png',
  '/art3d/toolbar/zoomin.png',
  '/art3d/toolbar/zoomout.png',
  '/art3d/toolbar/zoomreset.png',

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

  '/templates/t1.tnet',
  '/templates/t2.tnet',
  '/templates/t3.tnet',
  '/templates/t4.tnet',
  '/templates/t5.tnet',
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
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
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
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      if (request.mode === 'navigate') return cache.match('/');
      throw error;
    }
  })());
});
