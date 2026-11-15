/* Workflow Needs Pro für Windows (Vorbild Datei-Organizer Pro / BookLedgerPro windows/bridge): stellt dieselben Capacitor-Plugins
   bereit wie die Android-Hülle, damit native/wn-native.js unverändert seinen Weg findet (Speichern unter, Updates; Drucken kann
   WebView2 selbst). Jeder Aufruf geht mit dem Sitzungsschlüssel an
   die Hülle (wn_call); welche Methoden es gibt, legt bridge/contracts.json fest (dort geprüft, nicht hier). Ereignisse der Engine
   kommen als 'wn-native' (z. B. WnUpdates:stand). */
(() => {
  'use strict';
  if (window !== window.top || location.protocol !== 'https:' || location.hostname !== 'tauri.localhost' || !['/', '/index.html'].includes(location.pathname)) return;
  const invoke = window.__TAURI_INTERNALS__?.invoke; if (typeof invoke !== 'function') return;
  const TOKEN = __WN_SESSION_TOKEN__;
  const listeners = new Map();
  window.addEventListener('wn-native', (event) => {
    for (const listener of listeners.get(event.detail?.name) || []) { try { listener(event.detail.data); } catch { /* Hörer der Seite */ } }
  });
  const plugins = {};
  for (const name of ['WnDateien', 'WnUpdates']) {
    plugins[name] = new Proxy(Object.freeze({}), { get(_, method) {
      if (method === 'then') return undefined;
      if (method === 'addListener') return async (event, listener) => {
        const key = name + ':' + event; let set = listeners.get(key); if (!set) listeners.set(key, set = new Set()); set.add(listener);
        return { remove: async () => set.delete(listener) };
      };
      return async (options = {}) => {
        try {
          return await invoke('wn_call', { plugin: name, method: String(method), options }, { headers: { 'x-wn-session': TOKEN } });
        } catch (error) {
          const code = typeof error === 'string' ? error : error?.code || 'APP_RUNTIME_UNAVAILABLE';
          throw Object.assign(new Error(code), { code });
        }
      };
    } });
  }
  Object.defineProperty(window, 'Capacitor', { value: Object.freeze({ Plugins: Object.freeze(plugins), isNativePlatform: () => true, getPlatform: () => 'windows' }), writable: false, configurable: false });
})();
