/* Browser-only persistence. Workspace exports never include either store. */
const RECOVERY_KEYS = Object.freeze({
  current: 'pt-web:workspace:current',
  previous: 'pt-web:workspace:previous',
  good: 'pt-web:workspace:last-known-good',
  active: 'pt-web:workspace:active',
});
const SESSION_HISTORY_KEY = 'pt-web:workspace:history';
const SESSION_HISTORY_LIMIT = 100;

function validWorkspaceSnapshot(value) {
  return !!value && typeof value === 'object' &&
    Array.isArray(value.devices) && Array.isArray(value.links) &&
    Array.isArray(value.filters) && Array.isArray(value.events) &&
    !!value.tabs && typeof value.tabs === 'object';
}

function readWorkspace(storage, key) {
  let raw = null;
  try { raw = storage && storage.getItem(key); } catch (_) { return { raw: null, workspace: null }; }
  if (!raw) return { raw, workspace: null };
  try {
    const workspace = JSON.parse(raw);
    return { raw, workspace: validWorkspaceSnapshot(workspace) ? workspace : null };
  } catch (_) {
    return { raw, workspace: null };
  }
}

class BrowserSnapshotStore {
  constructor(storage) {
    this.storage = storage;
    this.notice = '';
  }

  write(key, value) {
    try { this.storage.setItem(key, value); return true; } catch (_) { return false; }
  }

  save(workspace) {
    if (!validWorkspaceSnapshot(workspace)) return false;
    let raw;
    try { raw = JSON.stringify(workspace); } catch (_) { return false; }
    const current = readWorkspace(this.storage, RECOVERY_KEYS.current);
    if (current.raw === raw) return true;
    // A malformed current snapshot must never become the recovery snapshot.
    if (current.workspace) this.write(RECOVERY_KEYS.previous, current.raw);
    return this.write(RECOVERY_KEYS.current, raw);
  }

  markKnownGood(workspace) {
    if (!validWorkspaceSnapshot(workspace)) return false;
    try { return this.write(RECOVERY_KEYS.good, JSON.stringify(workspace)); } catch (_) { return false; }
  }

  recover() {
    this.notice = '';
    const current = readWorkspace(this.storage, RECOVERY_KEYS.current);
    const previous = readWorkspace(this.storage, RECOVERY_KEYS.previous);
    const good = readWorkspace(this.storage, RECOVERY_KEYS.good);
    let crashed = false;
    try { crashed = this.storage.getItem(RECOVERY_KEYS.active) === '1'; } catch (_) {}

    const candidates = crashed
      ? [['previous', previous], ['last-known-good', good], ['current', current]]
      : [['current', current], ['previous', previous], ['last-known-good', good]];
    const found = candidates.find(([, value]) => value.workspace);

    if (found) {
      const [source, value] = found;
      if (source !== 'current' || crashed) {
        const reason = crashed ? 'an interrupted session' : 'a corrupt or missing snapshot';
        this.notice = `Recovered ${source} snapshot after ${reason}.`;
        this.write(RECOVERY_KEYS.current, value.raw);
      }
      return { workspace: value.workspace, source, notice: this.notice };
    }

    if (current.raw || previous.raw || good.raw || crashed) {
      this.notice = 'Browser recovery snapshots were unavailable; loaded the server workspace.';
    }
    return { workspace: null, source: null, notice: this.notice };
  }
}

class SessionWorkspaceHistory {
  constructor(storage, limit = SESSION_HISTORY_LIMIT) {
    this.storage = storage;
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];
    this.current = null;
    this.load();
  }

  load() {
    let saved;
    try { saved = JSON.parse(this.storage.getItem(SESSION_HISTORY_KEY) || 'null'); } catch (_) { return; }
    if (!saved || saved.version !== 1 || !Array.isArray(saved.undo) ||
        !Array.isArray(saved.redo) || typeof saved.current !== 'string') return;
    const valid = (raw) => {
      if (typeof raw !== 'string') return false;
      try { return validWorkspaceSnapshot(JSON.parse(raw)); } catch (_) { return false; }
    };
    if (!valid(saved.current) || !saved.undo.every(valid) || !saved.redo.every(valid)) return;
    this.undoStack = saved.undo.slice(-this.limit);
    this.redoStack = saved.redo.slice(-this.limit);
    this.current = saved.current;
  }

  persist() {
    try {
      this.storage.setItem(SESSION_HISTORY_KEY, JSON.stringify({
        version: 1,
        current: this.current,
        undo: this.undoStack,
        redo: this.redoStack,
      }));
      return true;
    } catch (_) { return false; }
  }

  static serialize(workspace) {
    if (!validWorkspaceSnapshot(workspace)) return null;
    try { return JSON.stringify(workspace); } catch (_) { return null; }
  }

  restore(workspace) {
    const raw = SessionWorkspaceHistory.serialize(workspace);
    if (!raw) return false;
    if (this.current === raw) return true;
    if (this.current !== null) {
      this.undoStack = [];
      this.redoStack = [];
    }
    this.current = raw;
    this.persist();
    return true;
  }

  record(workspace) {
    const raw = SessionWorkspaceHistory.serialize(workspace);
    if (!raw || raw === this.current) return false;
    if (this.current !== null) {
      this.undoStack.push(this.current);
      if (this.undoStack.length > this.limit) this.undoStack.shift();
    }
    this.current = raw;
    this.redoStack = [];
    this.persist();
    return true;
  }

  undo() {
    if (!this.undoStack.length) return null;
    this.redoStack.push(this.current);
    this.current = this.undoStack.pop();
    this.persist();
    return JSON.parse(this.current);
  }

  redo() {
    if (!this.redoStack.length) return null;
    this.undoStack.push(this.current);
    this.current = this.redoStack.pop();
    this.persist();
    return JSON.parse(this.current);
  }
}

/* Loaded after all other application scripts, immediately before main.js. */
function installBrowserRecovery() {
  if (typeof window === 'undefined' || window.__takumiRecoveryInstalled) return;
  window.__takumiRecoveryInstalled = true;

  const storage = (name) => { try { return window[name]; } catch (_) { return null; } };
  const snapshots = new BrowserSnapshotStore(storage('localStorage'));
  const history = new SessionWorkspaceHistory(storage('sessionStorage'));
  const originalSetData = setData;
  const originalApi = api;
  const originalGetJson = getJson;
  const originalBoot = boot;
  const originalFetch = window.fetch;
  let booting = false;
  let recoveredWorkspace = null;
  let suspendSetData = false;
  let autosaveTimer = null;
  let pendingSnapshot = null;

  const flushAutosave = () => {
    if (autosaveTimer !== null && typeof window.clearTimeout === 'function') {
      window.clearTimeout(autosaveTimer);
    }
    autosaveTimer = null;
    if (pendingSnapshot) snapshots.save(pendingSnapshot);
    pendingSnapshot = null;
  };
  const scheduleAutosave = (workspace) => {
    pendingSnapshot = workspace;
    if (autosaveTimer !== null && typeof window.clearTimeout === 'function') {
      window.clearTimeout(autosaveTimer);
    }
    if (typeof window.setTimeout !== 'function') { flushAutosave(); return; }
    autosaveTimer = window.setTimeout(flushAutosave, 1000);
  };

  setData = function (json, options = {}) {
    if (suspendSetData) return;
    if (!validWorkspaceSnapshot(json)) {
      const recovered = snapshots.recover();
      if (!recovered.workspace) {
        status('Workspace response was invalid and no recovery snapshot is available.', true);
        return;
      }
      originalSetData(recovered.workspace);
      scheduleAutosave(recovered.workspace);
      history.restore(recovered.workspace);
      status(recovered.notice || 'Recovered the last valid browser snapshot.', true);
      return;
    }
    originalSetData(json);
    scheduleAutosave(json);
    if (!options.skipHistory) history.record(json);
  };

  api = async function (path, params = {}) {
    if (path !== '/api/undo' && path !== '/api/redo') return originalApi(path, params);
    suspendSetData = true;
    let response;
    try { response = await originalApi(path, params); } finally { suspendSetData = false; }
    if (response.error) return response;

    const restored = path === '/api/undo' ? history.undo() : history.redo();
    if (restored) {
      setData(restored, { skipHistory: true });
      return restored;
    }
    // Keep the pre-existing server undo/redo API usable before local history
    // exists, without recording the navigation as a new edit.
    setData(response, { skipHistory: true });
    history.restore(response);
    return response;
  };

  getJson = async function (path) {
    const response = await originalGetJson(path);
    if (booting && path === '/api/workspace' && recoveredWorkspace) return recoveredWorkspace;
    return response;
  };

  boot = async function () {
    const recovered = snapshots.recover();
    let restore = recovered.workspace;
    if (recovered.source === 'current') {
      const server = await originalGetJson('/api/workspace');
      if (JSON.stringify(restore) === JSON.stringify(server)) {
        restore = null;
      } else if (typeof askConfirm === 'function' &&
          !(await askConfirm('Restore last session? Your latest browser workspace can replace the server workspace.', 'Restore'))) {
        restore = null;
      }
    }
    recoveredWorkspace = restore;
    booting = true;
    try { await originalBoot(); } finally { booting = false; recoveredWorkspace = null; }

    if (validWorkspaceSnapshot(data)) {
      if (!restore) {
        snapshots.save(data);
        if (!readWorkspace(snapshots.storage, RECOVERY_KEYS.good).workspace) {
          snapshots.markKnownGood(data);
        }
      }
      history.restore(data);
    }
    if (restore && recovered.notice) status(recovered.notice, true);
    try { snapshots.storage.setItem(RECOVERY_KEYS.active, '1'); } catch (_) {}
  };

  // Successful native/XML load and import responses are the only updates to
  // last-known-good. Ordinary edits and simulation events never replace it.
  if (typeof originalFetch === 'function') {
    window.fetch = async function (input, ...args) {
      const response = await originalFetch.call(this, input, ...args);
      const url = typeof input === 'string' ? input : input && input.url;
      const path = typeof url === 'string' ? url.split('?')[0] : '';
      if ((path.endsWith('/api/load') || path.endsWith('/api/import')) &&
          response && response.ok && typeof response.json === 'function') {
        const originalJson = response.json.bind(response);
        response.json = async function () {
          const json = await originalJson();
          const passedValidation = validWorkspaceSnapshot(json) &&
            (!Array.isArray(json.problems) || !json.problems.some((p) => p.severity === 'error'));
          if (passedValidation) snapshots.markKnownGood(json);
          return json;
        };
      }
      return response;
    };
  }

  const cleanExit = () => {
    flushAutosave();
    try { snapshots.storage.removeItem(RECOVERY_KEYS.active); } catch (_) {}
  };
  window.addEventListener('pagehide', cleanExit);
  window.addEventListener('beforeunload', cleanExit);
}

if (typeof boot === 'function' && typeof setData === 'function' &&
    typeof api === 'function' && typeof getJson === 'function') {
  installBrowserRecovery();
}
