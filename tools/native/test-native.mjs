// Probe der nativen Hüllen ohne Android und ohne Windows (Workflow Needs Pro, Klaus 15.11.2026): Web-Paket, Kennungen, Fassungen,
// Rechte, Plugins, Verträge Windows = Android, ein Update-Schlüssel, Update-Feed; dazu das App-Paket im echten Browser an der
// Wurzel (wie https://localhost/) mit gestellter Capacitor-Brücke: Name, kein Service Worker, kein Installieren-Knopf,
// Herunterladen → Speichern-Fenster, Drucken → Druckdienst, Update-Fähnchen.
//   node tools/native/test-native.mjs
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { prepareWeb, absolutePfade, istLaufzeit, indexAnpassen, SW_BLOCK, root } from './prepare-web.mjs';

let gruen = 0, rot = 0;
const soll = (name, bed, mehr = '') => { if (bed) { gruen++; console.log('  ✓ ' + name); } else { rot++; console.log('  ✗ ROT: ' + name + (mehr ? ' – ' + mehr : '')); } };
const lies = (p) => readFile(join(root, p), 'utf8');
const JAVA = 'android/app/src/main/java/de/familyprojekt/workflowneeds/';

console.log('Web-Paket');
const beleg = await prepareWeb();
const www = join(root, 'www');
const pwa = await lies('index.html'), app = await readFile(join(www, 'index.html'), 'utf8');
soll('index.html im Paket', existsSync(join(www, 'index.html')));
soll('Service Worker nicht im Paket, Anmeldung aus index.html heraus', !existsSync(join(www, 'sw.js')) && !app.includes('serviceWorker.register') && pwa.includes(SW_BLOCK));
soll('Klebstoff im Paket und vor assets/app.js geladen', existsSync(join(www, 'native/wn-native.js')) && /<script src="native\/wn-native\.js\?v=[0-9a-f]{16}"><\/script>\n<script src="assets\/app\.js\?v=/.test(app));
soll('PWA-index.html unverändert ohne Klebstoff', !pwa.includes('wn-native'));
soll('pdf.js, Modul 25 und Beispiele im Paket', existsSync(join(www, 'vendor/pdfjs/pdf.min.js')) && existsSync(join(www, 'modules/25_pseudonym.js')) && existsSync(join(www, 'beispiele/tomys-gesamt/Preisliste-Beispiel.pdf')));
soll('keine Doku, Proben, Werkzeuge, Hüllen im Paket', !beleg.dateien.some((d) => /^(docs|tests|tools|android|windows|node_modules)\//.test(d.pfad) || d.pfad === 'werbung.html' || d.pfad === 'CLAUDE.md'));
soll('Beleg nennt jede Datei mit Prüfsumme', beleg.dateien.length > 40 && beleg.dateien.every((d) => /^[a-f0-9]{64}$/.test(d.sha256)));
{
  let gleich = true;
  for (const d of beleg.dateien) if (d.pfad !== 'index.html' && !d.pfad.startsWith('native/') && !(await readFile(join(root, d.pfad))).equals(await readFile(join(www, d.pfad)))) gleich = false;
  soll('alle übrigen Dateien byte-gleich mit dem Repo', gleich);
}
soll('absolute Pfade werden erkannt', absolutePfade('<script src="/assets/x.js"></script><link href="./a.css">').join() === '/assets/x.js');
soll('index.html im Paket nutzt nur relative Pfade', absolutePfade(app).length === 0);
soll('Punktdateien, Quellkarten, sw.js, Vorlagen der Symbole nie im Paket', !istLaufzeit('assets/.env') && !istLaufzeit('assets/a.js.map') && !istLaufzeit('sw.js') && !istLaufzeit('icons/quelle/icon-prisma.jpg') && istLaufzeit('assets/app.js') && !istLaufzeit('docs/x.md'));
{
  let ab1 = false, ab2 = false;
  try { indexAnpassen(pwa.replace(SW_BLOCK, ''), 'native/wn-native.js'); } catch { ab1 = true; }
  try { indexAnpassen(pwa.replace('<script src="assets/app.js?v=', '<script src="assets/app2.js?v='), 'native/wn-native.js'); } catch { ab2 = true; }
  soll('fehlender Anker bricht ab statt zu raten (Service Worker, app.js)', ab1 && ab2);
}

console.log('Kennungen und Namen');
const cap = JSON.parse(await lies('capacitor.config.json'));
const gradle = await lies('android/app/build.gradle'), strings = await lies('android/app/src/main/res/values/strings.xml');
soll('Paket de.familyprojekt.workflowneeds überall', cap.appId === 'de.familyprojekt.workflowneeds' && gradle.includes('applicationId "de.familyprojekt.workflowneeds"') && gradle.includes('namespace = "de.familyprojekt.workflowneeds"'));
soll('App heißt „Workflow Needs Pro“', cap.appName === 'Workflow Needs Pro' && strings.includes('<string name="app_name">Workflow Needs Pro</string>'));
soll('Web-App heißt weiter „Workflow Bedarfsanalyse“', JSON.parse(await lies('manifest.json')).name === 'Workflow Bedarfsanalyse');
soll('webDir www, keine Fehlersuche in der WebView', cap.webDir === 'www' && cap.android?.webContentsDebuggingEnabled === false && cap.android?.allowMixedContent === false);

console.log('Fassung');
const pkg = JSON.parse(await lies('package.json'));
const vName = (/versionName "([^"]+)"/.exec(gradle) || [])[1], vCode = Number((/versionCode (\d+)/.exec(gradle) || [])[1]);
soll('package.json = versionName', pkg.version === vName, [pkg.version, vName].join(' / '));
{ const [a, b, c] = vName.split('.').map(Number); soll('versionCode passt zur Fassung (Haupt×1000 + Neben×10 + Flick)', vCode === a * 1000 + b * 10 + c, String(vCode)); }

console.log('Rechte und Freigaben');
const manifest = await lies('android/app/src/main/AndroidManifest.xml');
const rechte = [...manifest.matchAll(/uses-permission android:name="([^"]+)"/g)].map((m) => m[1]).sort();
soll('nur INTERNET und REQUEST_INSTALL_PACKAGES', JSON.stringify(rechte) === JSON.stringify(['android.permission.INTERNET', 'android.permission.REQUEST_INSTALL_PACKAGES']), rechte.join());
soll('keine Android-Sicherung des App-Speichers, kein Klartext-Netz', manifest.includes('android:allowBackup="false"') && manifest.includes('android:usesCleartextTraffic="false"'));
const pfade = await lies('android/app/src/main/res/xml/file_paths.xml');
soll('FileProvider gibt nur update/ frei', [...pfade.matchAll(/<(\w+-path)/g)].length === 1 && pfade.includes('<cache-path name="update" path="update/" />'));

console.log('Plugins');
const main = await lies(JAVA + 'MainActivity.java'), upd = await lies(JAVA + 'WnUpdatesPlugin.java'), feed = await lies(JAVA + 'UpdateFeed.java');
const dat = await lies(JAVA + 'WnDateienPlugin.java'), druck = await lies(JAVA + 'WnDruckenPlugin.java'), glue = await lies('native/wn-native.js');
soll('MainActivity meldet Updates, Speichern unter und Drucken an', ['WnUpdatesPlugin', 'WnDateienPlugin', 'WnDruckenPlugin'].every((p) => main.includes('registerPlugin(' + p + '.class)')));
soll('Hülle: nur https://localhost im Fenster, Fremdes an Browser/Mailprogramm', main.includes('"localhost".equals(uri.getHost())') && main.includes('"mailto"') && main.includes('Intent.ACTION_VIEW'));
soll('Speichern-Plugin „WnDateien“ mit speichern (Zwischenspeicher vor dem Dialog) und appInfo', dat.includes('@CapacitorPlugin(name = "WnDateien")') && dat.includes('public void speichern(PluginCall call)') && dat.includes('public void appInfo(PluginCall call)') && dat.includes('ACTION_CREATE_DOCUMENT') && dat.includes('getCacheDir()'));
soll('Druck-Plugin „WnDrucken“ über Androids PrintManager', druck.includes('@CapacitorPlugin(name = "WnDrucken")') && druck.includes('public void drucken(PluginCall call)') && druck.includes('createPrintDocumentAdapter'));
soll('nie call.getLong (kleine Zahlen kommen als Integer)', ![upd, dat, druck].some((t) => /call\.getLong\(/.test(t)));
soll('Update-Plugin heißt „WnUpdates“ wie im Klebstoff', upd.includes('@CapacitorPlugin(name = "WnUpdates")') && glue.includes('P.WnUpdates'));
soll('Klebstoff ruft genau die Plugins, die es gibt', glue.includes('P.WnDateien.speichern') && glue.includes('P.WnDrucken.drucken') && glue.includes('U.installieren()'));
soll('Feed-Adresse family-projekt.de/updates/workflow-needs/', feed.includes('"https://family-projekt.de/updates/workflow-needs/"'));
const schluessel = (/static final String SCHLUESSEL = "([^"]*)"/.exec(feed) || [])[1];
soll('Update-Schlüssel: Platzhalter leer oder gültiger Ed25519-Schlüssel', schluessel === '' || /^MCowBQYDK2VwAyEA[A-Za-z0-9+/]{43}=$/.test(schluessel));
if (schluessel === '') console.log('  · Hinweis: öffentlicher Update-Schlüssel fehlt noch (Klaus, docs/ANDROID.md Schritt b) – Updates melden „nicht eingerichtet“, die App bleibt still.');

console.log('Windows (gleiche Verträge wie Android)');
{
  const vertr = JSON.parse(await lies('windows/bridge/contracts.json'));
  const tauri = JSON.parse(await lies('windows/src-tauri/tauri.conf.json')), cargo = await lies('windows/src-tauri/Cargo.toml'), wpkg = JSON.parse(await lies('windows/package.json'));
  soll('Windows-Fassung = Fassung (tauri.conf, Cargo.toml, windows/package.json)', tauri.version === vName && cargo.includes(`version = "${vName}"`) && wpkg.version === vName, [tauri.version, wpkg.version].join(' / '));
  soll('Windows heißt „Workflow Needs Pro“, Kennung wie Android', tauri.productName === 'Workflow Needs Pro' && tauri.identifier === 'de.familyprojekt.workflowneeds');
  const java = { WnUpdates: upd, WnDateien: dat };
  for (const [plugin, methoden] of Object.entries(vertr)) for (const m of methoden)
    soll(`Windows-Vertrag ${plugin}.${m} gibt es auch unter Android`, (java[plugin] || '').includes('public void ' + m + '(PluginCall call)'));
  const wUpd = await lies('windows/engine/src/DesktopUpdates.java');
  const wSchl = (/static final String SCHLUESSEL = "([^"]*)"/.exec(wUpd) || [])[1];
  soll('Update-Schlüssel unter Windows = Android (ein Schlüssel für beide)', wSchl === schluessel);
  soll('Windows-Updates aus dem eigenen Ordner', wUpd.includes('"https://family-projekt.de/updates/workflow-needs/"'));
}

console.log('Update-Feed');
{
  const t = await mkdtemp(join(tmpdir(), 'wn-feed-'));
  try {
    const apk = join(t, `Workflow-Needs-Pro-${vName}.apk`); await writeFile(apk, Buffer.from('probe'));
    execFileSync(process.execPath, [join(root, 'tools/native/update-feed-android.mjs'), apk, join(t, 'aktuell-android.json')], { stdio: 'pipe' });
    const f = JSON.parse(await readFile(join(t, 'aktuell-android.json'), 'utf8'));
    soll('Feed: app, Version, Dateiname, versionCode, Prüfsumme', f.format === 1 && f.app === 'workflow-needs' && f.version === vName && f.android.datei === `Workflow-Needs-Pro-${vName}.apk` && f.android.versionCode === vCode && f.android.groesse === 5 && /^[a-f0-9]{64}$/.test(f.android.sha256));
    soll('Feed: App-Kennung wie in UpdateFeed.java und DesktopUpdates.java', feed.includes('"workflow-needs".equals') && (await lies('windows/engine/src/DesktopUpdates.java')).includes('"workflow-needs".equals'));
    const falsch = join(t, 'BookLedgerPro-' + vName + '.apk'); await writeFile(falsch, 'x');
    let ab = false; try { execFileSync(process.execPath, [join(root, 'tools/native/update-feed-android.mjs'), falsch, join(t, 'x.json')], { stdio: 'pipe' }); } catch { ab = true; }
    soll('Feed: fremder Dateiname wird abgewiesen', ab);
  } finally { await rm(t, { recursive: true, force: true }); }
}

console.log('App-Paket im Browser (Wurzel wie https://localhost/, Capacitor gestellt)');
{
  let chromium = null, exe;
  try { chromium = createRequire(import.meta.url)('playwright-core').chromium; exe = (await import("../../tests/chromium-finden.mjs")).findeChromium() || undefined; } catch { /* unten */ }
  if (!chromium) { console.log('  · nicht lauffähig: playwright-core fehlt'); rot++; }
  else {
    const TYP = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.pdf': 'application/pdf' };
    const anfragen = [];
    const srv = createServer(async (q, r) => {
      anfragen.push(q.url);
      try { let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html'; if (p.includes('..')) throw 0;
        const b = await readFile(join(www, p)); r.writeHead(200, { 'content-type': TYP[extname(p)] || 'application/octet-stream' }); r.end(b); }
      catch { r.writeHead(404); r.end(); }
    });
    await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
    const browser = await chromium.launch(exe ? { executablePath: exe } : {});
    try {
      const ctx = await browser.newContext({ viewport: { width: 400, height: 800 } });
      await ctx.addInitScript(() => {
        window.__aufrufe = [];
        const merk = (plugin, method, antwort) => async (o) => { window.__aufrufe.push({ plugin, method, o }); return typeof antwort === 'function' ? antwort(o) : antwort; };
        const hoerer = [];
        window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {
          WnDateien: { speichern: merk('WnDateien', 'speichern', { gespeichert: true }), appInfo: merk('WnDateien', 'appInfo', { version: '1.0.0', plattform: 'android' }) },
          WnDrucken: { drucken: merk('WnDrucken', 'drucken', { gestartet: true }) },
          WnUpdates: { pruefen: merk('WnUpdates', 'pruefen', { neu: '1.0.1', installiert: '1.0.0', groesse: 10 }),
            installieren: merk('WnUpdates', 'installieren', () => { hoerer.forEach((f) => f({ geladen: 5, groesse: 10 })); return { gestartet: true }; }),
            addListener: async (n, f) => { hoerer.push(f); return { remove: async () => {} }; } } } };
      });
      const page = await ctx.newPage(); const fehler = []; page.on('pageerror', (e) => fehler.push(String(e)));
      await page.goto(`http://127.0.0.1:${srv.address().port}/`);
      await page.waitForFunction(() => document.getElementById('app-name')?.textContent === 'Workflow Needs Pro', null, { timeout: 15000 }).catch(() => {});
      soll('App startet aus dem Paket an der Wurzel und heißt „Workflow Needs Pro“ (Kopf und Titel)', await page.evaluate(() => document.getElementById('app-name')?.textContent === 'Workflow Needs Pro' && document.title === 'Workflow Needs Pro'));
      soll('Kennzeichen der App gesetzt (data-nativ, WN_PRO)', await page.evaluate(() => document.documentElement.dataset.nativ === 'android' && window.WN_PRO?.plattform === 'android'));
      await page.click('#sprache').catch(() => {});
      await page.waitForTimeout(300);
      soll('auch auf Englisch heißt der Kopf „Workflow Needs Pro“', await page.evaluate(() => document.documentElement.lang === 'en' && document.getElementById('app-name')?.textContent === 'Workflow Needs Pro'));
      await page.click('#sprache').catch(() => {});
      soll('kein Service Worker angemeldet', await page.evaluate(async () => !navigator.serviceWorker || (await navigator.serviceWorker.getRegistrations()).length === 0) && !anfragen.some((u) => u.includes('sw.js')));
      soll('kein Installieren-Knopf zu sehen', await page.evaluate(() => [...document.querySelectorAll('[data-install-knopf]')].every((k) => k.offsetParent === null)));
      // Herunterladen: genau wie laden() in assets/app.js
      await page.evaluate(() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['{"probe":1}'], { type: 'application/json' })); a.download = 'Auftrag-V-2026-0001-F1.json'; document.body.append(a); a.click(); a.remove(); });
      await page.waitForFunction(() => window.__aufrufe.some((x) => x.method === 'speichern'), null, { timeout: 5000 }).catch(() => {});
      const sp = await page.evaluate(() => window.__aufrufe.find((x) => x.method === 'speichern')?.o);
      soll('<a download> geht an WnDateien.speichern (Name, Art, Inhalt base64)', sp && sp.name === 'Auftrag-V-2026-0001-F1.json' && sp.mime === 'application/json' && Buffer.from(sp.data, 'base64').toString() === '{"probe":1}', JSON.stringify(sp));
      soll('nach dem Speichern ein Hinweis „Gespeichert“', await page.waitForFunction(() => /Gespeichert/.test(document.querySelector('[data-wn-hinweis]')?.textContent || ''), null, { timeout: 3000 }).then(() => true, () => false));
      // Echter Weg der App: Beispiel-Vorgang → Reiter „3 Angebot“ → „📤 Auftragsdatei speichern“ (laden() in assets/app.js)
      await page.locator('#reiter button', { hasText: '3 Angebot' }).first().click().catch(() => {});
      await page.locator('#uebergabe-speichern').click({ timeout: 10000 }).catch(() => {});
      await page.waitForFunction(() => window.__aufrufe.filter((x) => x.method === 'speichern').length >= 2, null, { timeout: 10000 }).catch(() => {});
      const auf = await page.evaluate(() => window.__aufrufe.filter((x) => x.method === 'speichern')[1]?.o);
      soll('echter Knopf „Auftragsdatei speichern“ landet im Speichern-Fenster (JSON-Bündel)', auf && /\.json$/.test(auf.name) && Buffer.from(auf.data, 'base64').length > 100, JSON.stringify(auf && { name: auf.name, mime: auf.mime }));
      // Echter Weg der App: „🖨 Angebot drucken“ legt das Blatt in #druck und ruft window.print()
      await page.locator('#druck-angebot').click({ timeout: 10000 }).catch(() => {});
      await page.waitForFunction(() => window.__aufrufe.some((x) => x.method === 'drucken'), null, { timeout: 5000 }).catch(() => {});
      const dr = await page.evaluate(() => ({ auf: window.__aufrufe.find((x) => x.method === 'drucken')?.o, blatt: document.querySelector('#druck .blatt') ? document.getElementById('druck').dataset.art : '' }));
      soll('echter Knopf „Angebot drucken“ geht an WnDrucken.drucken, das Blatt steht in #druck', dr.auf && dr.auf.titel === 'Workflow Needs Pro – angebot' && dr.blatt === 'angebot', JSON.stringify(dr));
      // Update: stille Frage nach 2,5 s, Fähnchen, Tipp lädt direkt
      soll('Update-Fähnchen „Update 1.0.1“ nach der stillen Frage', await page.waitForFunction(() => document.getElementById('wn-fassung')?.textContent === 'Update 1.0.1', null, { timeout: 8000 }).then(() => true, () => false));
      await page.click('#wn-fassung');
      soll('Tipp auf das Fähnchen lädt direkt (installieren)', await page.waitForFunction(() => window.__aufrufe.some((x) => x.method === 'installieren'), null, { timeout: 5000 }).then(() => true, () => false));
      soll('höchstens eine stille Frage', await page.evaluate(() => window.__aufrufe.filter((x) => x.method === 'pruefen').length) <= 2);
      soll('keine Fehler in der Seite', fehler.length === 0, fehler.slice(0, 2).join(' | '));
      // Gegenrichtung: im Browser (ohne Capacitor) tut der Klebstoff nichts
      const ctx2 = await browser.newContext(); const p2 = await ctx2.newPage();
      await p2.goto(`http://127.0.0.1:${srv.address().port}/`);
      await p2.waitForFunction(() => !!document.getElementById('app-name')?.textContent, null, { timeout: 15000 }).catch(() => {});
      soll('ohne Capacitor: alter Name, kein Kennzeichen, print unverändert', await p2.evaluate(() => document.getElementById('app-name').textContent !== 'Workflow Needs Pro' && !document.documentElement.dataset.nativ && !window.WN_PRO && /native code/.test(String(window.print))));
      await ctx2.close();
    } finally { await browser.close(); srv.close(); }
  }
}
console.log(`Native: ${gruen} grün · ${rot} ROT`);
process.exit(rot ? 1 : 0);
