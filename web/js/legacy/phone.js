const PHONE_QUERY = "(max-width: 599px), (max-height: 500px) and (pointer: coarse)";
function isPhoneScreen() {
  try {
    return typeof matchMedia === "function" && matchMedia(PHONE_QUERY).matches;
  } catch (_) {
    return false;
  }
}
function reloadWhenScreenGrows() {
  if (typeof matchMedia !== "function")
    return;
  const query = matchMedia(PHONE_QUERY);
  const onChange = () => {
    if (!query.matches)
      location.reload();
  };
  if (typeof query.addEventListener === "function")
    query.addEventListener("change", onChange);
  else if (typeof query.addListener === "function")
    query.addListener(onChange);
}
