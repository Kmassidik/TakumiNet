/* ---------------- realtime ----------------
   While Realtime mode is on, the page asks the engine to advance the clock
   every two seconds: tables age out and the configured control planes speak.
   Start and stop are idempotent, so the interval can never stack. */
const REALTIME_TICK_SECONDS = 2;
let realtimeTimer = null;

async function realtimeTick() {
  await api('/api/sim/tick', { seconds: REALTIME_TICK_SECONDS });
}

function startRealtime() {
  if (realtimeTimer !== null) return;
  realtimeTimer = setInterval(realtimeTick, REALTIME_TICK_SECONDS * 1000);
  status('Realtime: the network is breathing');
}

function stopRealtime() {
  if (realtimeTimer === null) return;
  clearInterval(realtimeTimer);
  realtimeTimer = null;
}

function realtimeSetMode(mode) {
  if (String(mode).trim() === 'Realtime') startRealtime();
  else stopRealtime();
}
