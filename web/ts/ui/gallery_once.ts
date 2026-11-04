const SEEN_KEY = "pt-web:gallery-seen";

interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/* The lesson gallery opens by itself only on a browser's first visit. It stays
   reachable from the File menu at any time. */
export function shouldAutoShowGallery(store: KeyValueStore): boolean {
  try {
    if (store.getItem(SEEN_KEY)) return false;
    store.setItem(SEEN_KEY, "1");
    return true;
  } catch {
    return true;
  }
}
