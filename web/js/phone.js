/* Takumi needs a large screen and a pointer: phones are not supported. On a
   phone the page shows one message and starts nothing (no engine download, no
   offline cache). The same query is written in workspace.css; a test keeps the
   two in step. */
const PHONE_QUERY = '(max-width: 599px), (max-height: 500px) and (pointer: coarse)';

function isPhoneScreen() {
  try {
    return typeof matchMedia === 'function' && matchMedia(PHONE_QUERY).matches;
  } catch (_) {
    return false;
  }
}

/* If the window grows past a phone (a tablet turned, a desktop window widened),
   reload so the app starts normally. */
function reloadWhenScreenGrows() {
  if (typeof matchMedia !== 'function') return;
  const query = matchMedia(PHONE_QUERY);
  const onChange = () => { if (!query.matches) location.reload(); };
  if (typeof query.addEventListener === 'function') query.addEventListener('change', onChange);
  else if (typeof query.addListener === 'function') query.addListener(onChange);
}
