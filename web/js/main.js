// Everything is defined by the scripts above; start the app.
if (isPhoneScreen()) {
  // Phones get one message (see phone.js). Nothing else starts or downloads.
  reloadWhenScreenGrows();
} else {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
  boot();

  showEngineLoading();
}
