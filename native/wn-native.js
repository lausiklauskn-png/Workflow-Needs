/* native/wn-native.js — Klebstoff von „Workflow Needs Pro“ (Android-App und Windows-App, Klaus 15.11.2026).
 *
 * Die Web-App (PWA „Workflow Bedarfsanalyse“) bleibt unverändert. Diese Datei kommt nur ins App-Paket
 * (tools/native/prepare-web.mjs hängt sie vor assets/app.js) und ist die EINE Stelle, an der die App erkannt wird:
 * window.Capacitor mit isNativePlatform() — unter Android von Capacitor, unter Windows von windows/bridge/capacitor-tauri.js.
 * Im Browser tut sie nichts (erste Zeilen).
 *
 * Sie schließt die Lücken der WebView, jeweils über den Weg, den die Web-App schon geht:
 *   1. Name: Kopf und Fenstertitel heißen „Workflow Needs Pro“ (Speicher-Namen bleiben: WorkflowNeeds1, workflowneeds_*).
 *   2. Herunterladen: jedes <a download> (Auftragsdatei, Sicherung, Bauauftrag, Anhänge, Tabellen) geht an das
 *      Speichern-Fenster des Systems (Plugin WnDateien.speichern) — die WebView kann kein <a download>.
 *   3. Drucken (nur Android): window.print() tut in der WebView nichts; es geht an Androids Druckdienst (WnDrucken.drucken).
 *      Unter Windows druckt WebView2 selbst.
 *   4. Kein Installieren-Knopf (die App ist installiert), kein Service Worker (prepare-web nimmt die Anmeldung heraus).
 *   5. Updates vom eigenen Server (WnUpdates, Muster Datei-Organizer Pro src/nativ.ts): still beim Start, beim Zurückholen und
 *      höchstens einmal je Stunde; steht eins bereit, zeigt die Fassung im Kopf „Update X.Y.Z“, ein Tipp lädt direkt.
 *      Ohne eingetragenen Schlüssel oder ohne Netz: still.
 */
(function () {
  'use strict';
  var C = window.Capacitor;
  if (!C || typeof C.isNativePlatform !== 'function' || !C.isNativePlatform()) return;
  var P = C.Plugins || {};
  var PLATTFORM = typeof C.getPlatform === 'function' && C.getPlatform() === 'windows' ? 'windows' : 'android';
  var NAME = 'Workflow Needs Pro';
  var MAX = (PLATTFORM === 'windows' ? 64 : 100) * 1024 * 1024; // Windows: Zeilengrenze der Engine (96 Mio. Zeichen base64)
  document.documentElement.setAttribute('data-nativ', PLATTFORM);
  window.WN_PRO = Object.freeze({ plattform: PLATTFORM, name: NAME });

  var en = function () { return document.documentElement.lang === 'en'; };
  var tx = function (de, eng) { return en() ? eng : de; };

  function hinweis(text, ms) {
    try {
      var d = document.createElement('div');
      d.setAttribute('role', 'status'); d.setAttribute('data-wn-hinweis', '');
      d.textContent = text;
      d.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483000;max-width:90vw;' +
        'padding:10px 14px;border-radius:10px;background:#1f2933;color:#fff;font:15px/1.35 system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.3)';
      (document.body || document.documentElement).appendChild(d);
      setTimeout(function () { d.remove(); }, ms || 4000);
    } catch (e) { /* nur Anzeige */ }
  }

  // ---- 1 · Name, kein Installieren-Knopf -------------------------------------------------------------------------
  var stil = document.createElement('style');
  stil.textContent = '[data-install-knopf],#install-meldung{display:none!important}' +
    '#wn-fassung{margin-left:6px;vertical-align:middle;cursor:pointer;border:1px solid currentColor;background:transparent;color:inherit;opacity:.8}' +
    '#wn-fassung[data-update]{opacity:1;background:#1f7a4d;color:#fff;border-color:#1f7a4d}';
  (document.head || document.documentElement).appendChild(stil);
  function nameSetzen() {
    var b = document.getElementById('app-name');
    if (b && b.textContent !== NAME) b.textContent = NAME;
    if (document.title !== NAME) document.title = NAME;
  }

  // ---- 2 · Herunterladen -> Speichern-Fenster -------------------------------------------------------------------
  function base64(blob) {
    return new Promise(function (ok, fehler) {
      var r = new FileReader();
      r.onload = function () { var s = String(r.result || ''); ok(s.slice(s.indexOf(',') + 1)); };
      r.onerror = function () { fehler(r.error); };
      r.readAsDataURL(blob);
    });
  }
  var SPEICHER_FEHLER = {
    WN_KEIN_PLATZ: ['Speichern ging nicht: kein Platz im Speicher der App.', 'Saving failed: no space left in the app storage.'],
    WN_DATEI_UNGUELTIG: ['Die Datei ist zu groß oder beschädigt – nichts gespeichert.', 'The file is too large or damaged – nothing saved.'],
    WN_SPEICHERN_FEHLER: ['Speichern ging nicht. Die angefangene Datei wurde wieder gelöscht. Bitte noch einmal versuchen.', 'Saving failed. The partial file was removed. Please try again.']
  };
  function speichern(href, name) {
    name = name || 'Workflow-Needs';
    return fetch(href).then(function (r) { return r.blob(); }).then(function (blob) {
      if (!blob.size) throw new Error('LEER');
      if (blob.size > MAX) throw new Error('WN_DATEI_UNGUELTIG');
      return base64(blob).then(function (data) {
        return P.WnDateien.speichern({ name: name, mime: blob.type || 'application/octet-stream', data: data });
      });
    }).then(function (r) {
      hinweis(r && r.gespeichert ? tx('Gespeichert: ', 'Saved: ') + name : tx('Nicht gespeichert.', 'Not saved.'));
      return r;
    }).catch(function (e) {
      var c = String((e && (e.code || e.message)) || e || '');
      var satz = c === 'LEER' ? [tx('Die Datei ist leer – nichts gespeichert.', 'The file is empty – nothing saved.')] : SPEICHER_FEHLER[c];
      hinweis(satz ? (satz.length > 1 ? tx(satz[0], satz[1]) : satz[0]) : tx('Speichern ging nicht. Bitte noch einmal versuchen.', 'Saving failed. Please try again.'), 9000);
      return { gespeichert: false, fehler: c };
    });
  }
  if (P.WnDateien) {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[download]') : null;
      if (!a || !a.href || !/^(blob:|data:)/.test(a.href)) return;
      e.preventDefault(); e.stopImmediatePropagation();
      window.__wnLetztesSpeichern = speichern(a.href, a.getAttribute('download') || '');
    }, true);
  }

  // ---- 3 · Drucken (Android) ------------------------------------------------------------------------------------
  if (PLATTFORM === 'android' && P.WnDrucken) {
    window.print = function () {
      var titel = NAME;
      try { var d = document.getElementById('druck'); if (d && d.dataset.art) titel = NAME + ' – ' + d.dataset.art; } catch (e) { /* Titel bleibt */ }
      P.WnDrucken.drucken({ titel: titel }).catch(function () {
        hinweis(tx('Drucken ging nicht. Bitte noch einmal versuchen.', 'Printing failed. Please try again.'), 6000);
      });
    };
  }

  // ---- 5 · Updates vom eigenen Server --------------------------------------------------------------------------
  var U = P.WnUpdates && typeof P.WnUpdates.pruefen === 'function' ? P.WnUpdates : null;
  var STILL_KEY = 'workflowneeds_update_still_v1', STUNDE = 60 * 60 * 1000;
  var ich = '', neu = '', lauf = null, laedt = false;
  function gemerkt() { try { var g = JSON.parse(localStorage.getItem(STILL_KEY) || 'null'); return g && typeof g.zeit === 'number' ? g : null; } catch (e) { return null; } }
  function merken(g) { try { localStorage.setItem(STILL_KEY, JSON.stringify(g)); } catch (e) { /* nur diese Sitzung */ } }
  function teile(v) { var m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v || ''); return m ? [+m[1], +m[2], +m[3]] : null; }
  function neuer(a, b) { var x = teile(a), y = teile(b); if (!x || !y) return false; for (var i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; }
  function frage() { return lauf || (lauf = U.pruefen().finally(function () { lauf = null; })); }
  function knopf() {
    var b = document.getElementById('app-name'); if (!b || !b.parentNode) return null;
    var k = document.getElementById('wn-fassung');
    if (!k) {
      k = document.createElement('button'); k.type = 'button'; k.id = 'wn-fassung'; k.className = 'badge';
      k.addEventListener('click', direktLaden);
      b.parentNode.insertBefore(k, b.nextSibling);
    }
    return k;
  }
  function zeigen(text) {
    var k = knopf(); if (!k) return;
    if (neu) { k.setAttribute('data-update', ''); k.textContent = text || 'Update ' + neu; k.title = tx('Neue Fassung laden und installieren', 'Download and install the new version'); }
    else { k.removeAttribute('data-update'); k.textContent = text || (ich ? 'v' + ich : 'Pro'); k.title = tx('Auf Updates prüfen', 'Check for updates'); }
  }
  function stillPruefen() {
    if (!U || document.visibilityState === 'hidden') return;
    var g = gemerkt(), jetzt = Date.now();
    if (g && jetzt >= g.zeit && jetzt - g.zeit < STUNDE) { neu = neuer(g.neu, ich) ? g.neu : ''; zeigen(); return; }
    merken({ zeit: jetzt, neu: (g && g.neu) || '' }); // auch ein Fehlschlag zählt: höchstens eine Anfrage je Stunde
    frage().then(function (r) {
      neu = r && r.neu && neuer(r.neu, ich) ? r.neu : '';
      merken({ zeit: jetzt, neu: neu }); zeigen();
    }, function () { /* ohne Netz, nicht eingerichtet: still */ });
  }
  function fehlerSatz(e) {
    var c = String((e && (e.code || e.message)) || '');
    if (c.indexOf('UPDATE_NICHT_EINGERICHTET') >= 0) return tx('Updates sind in dieser Fassung noch nicht eingerichtet.', 'Updates are not set up in this version yet.');
    if (c.indexOf('UPDATE_NICHT_ERREICHBAR') >= 0) return tx('Update-Server gerade nicht erreichbar. Verbindung prüfen und später noch einmal antippen.', 'Update server not reachable. Check the connection and tap again later.');
    return tx('Update ließ sich nicht laden. Später noch einmal antippen.', 'The update could not be loaded. Tap again later.');
  }
  function direktLaden() {
    if (!U) { hinweis(tx('Fassung ', 'Version ') + ich); return; }
    if (laedt) return;
    laedt = true;
    var hoerer = null, aktiv = true;
    frage().then(function (r) {
      neu = r && r.neu && neuer(r.neu, ich) ? r.neu : '';
      merken({ zeit: Date.now(), neu: neu });
      if (!neu) { zeigen(); hinweis(tx('Aktuelle Fassung ', 'Current version ') + ((r && (r.installiert || r.version)) || ich) + '.'); return null; }
      zeigen(tx('Update lädt …', 'Update loading …'));
      return Promise.resolve(U.addListener ? U.addListener('stand', function (e) {
        if (aktiv && e && e.groesse) zeigen('Update ' + Math.min(99, Math.floor(e.geladen * 100 / e.groesse)) + ' %');
      }) : null).then(function (h) { hoerer = h; return U.installieren(); }).then(function (aus) {
        if (aus && aus.erlaubnis) hinweis(tx('Erlaube „Apps installieren“ und tippe dann noch einmal auf das Update.', 'Allow “install apps” and then tap the update again.'), 8000);
      });
    }).catch(function (e) { hinweis(fehlerSatz(e), 8000); }).then(function () {
      aktiv = false; laedt = false; zeigen();
      try { if (hoerer && hoerer.remove) hoerer.remove(); } catch (e) { /* egal */ }
    });
  }

  function start() {
    nameSetzen();
    var b = document.getElementById('app-name');
    if (b && window.MutationObserver) new MutationObserver(nameSetzen).observe(b, { childList: true, characterData: true, subtree: true });
    var t = document.querySelector('title');
    if (t && window.MutationObserver) new MutationObserver(function () { if (document.title !== NAME) document.title = NAME; }).observe(t, { childList: true, characterData: true, subtree: true });
    var info = P.WnDateien && typeof P.WnDateien.appInfo === 'function' ? P.WnDateien.appInfo() : Promise.resolve({});
    Promise.resolve(info).then(function (i) { ich = String((i && i.version) || '').replace(/-.*$/, ''); }, function () {}).then(function () {
      zeigen();
      setTimeout(stillPruefen, 2500);
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') stillPruefen(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
