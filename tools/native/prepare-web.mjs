// tools/native/prepare-web.mjs — baut das Web-Paket für „Workflow Needs Pro“ (Android-App und Windows-App, Klaus 15.11.2026).
//
// Vorbild Datei-Organizer Pro / BookLedgerPro tools/native/prepare-web.mjs: kein rekursives Kopieren des Repos, sondern nur die
// Laufzeit-Dateien aus `git ls-files` (index.html, Rechtsseiten, assets/, modules/, vendor/, icons/, beispiele/). Die Web-App
// bleibt byte-gleich; einzige Abweichung ist index.html: davor hängt die Hülle ihren Klebstoff (native/wn-native.js, vor
// assets/app.js) und die Anmeldung des Service Workers fällt weg (in der App lädt alles aus dem Paket, ein Offline-Vorrat wäre
// doppelt und könnte alte Stände festhalten). sw.js kommt nicht ins Paket. Jede Anpassung bricht ab, wenn ihr Anker fehlt
// oder mehrfach steht (nicht raten). Geprüft wird auch, dass index.html nur relative Pfade nutzt, die im Paket liegen
// (die App läuft unter https://localhost/ bzw. https://tauri.localhost/, die PWA unter /Workflow-Needs/).

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname, resolve } from 'node:path';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const sha256 = (b) => createHash('sha256').update(b).digest('hex');

/** Laufzeit: Seiten und die Ordner, aus denen die App lädt. Alles andere (Doku, Proben, Werkzeuge, Hüllen) bleibt draußen. */
export const SEITEN = ['index.html', 'impressum.html', 'datenschutz.html', 'sicherheit.html', 'manifest.json', 'THIRD_PARTY.md'];
export const ORDNER = ['assets/', 'modules/', 'vendor/', 'icons/', 'beispiele/'];
/** Was nie ins App-Paket darf, auch wenn es in einem Laufzeit-Ordner liegt. */
export const NIE = [/(^|\/)\.[^/]+$/, /\.map$/, /^sw\.js$/, /^icons\/quelle\//, /^icons\/werbung-/];
export function istLaufzeit(p) {
  if (NIE.some((re) => re.test(p))) return false;
  return SEITEN.includes(p) || ORDNER.some((o) => p.startsWith(o));
}

/** Absolute Pfade in src/href würden unter https://localhost/ ins Leere zeigen. Rein, in Node prüfbar. */
export function absolutePfade(html) {
  return [...html.matchAll(/\s(?:src|href)="(\/[^"]*)"/g)].map((m) => m[1]);
}

export const SW_BLOCK = '<script>\n  if ("serviceWorker" in navigator && location.protocol !== "file:") {\n    navigator.serviceWorker.register("sw.js").catch(function () {});\n  }\n</script>\n';
export const ANKER = '<script src="assets/app.js?v=';

/** index.html der App: Klebstoff vor assets/app.js, ohne Service-Worker-Anmeldung. Rein, in Node prüfbar. */
export function indexAnpassen(html, klebstoffUrl) {
  if (html.split(ANKER).length !== 2) throw new Error('Anker für den nativen Klebstoff fehlt oder steht mehrfach: ' + ANKER);
  if (html.includes('native/wn-native.js')) throw new Error('index.html trägt den Klebstoff schon');
  if (html.split(SW_BLOCK).length !== 2) throw new Error('Anmeldung des Service Workers nicht genau einmal gefunden');
  return html.replace(SW_BLOCK, '').replace(ANKER, '<script src="' + klebstoffUrl + '"></script>\n' + ANKER);
}

export async function prepareWeb({ wurzel = root } = {}) {
  const w = resolve(wurzel), aus = join(w, 'www');
  const alle = execFileSync('git', ['-C', w, 'ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const auswahl = alle.filter(istLaufzeit).sort();
  for (const s of ['index.html', 'manifest.json']) if (!auswahl.includes(s)) throw new Error('Laufzeit-Auswahl unvollständig: ' + s);
  if (!auswahl.some((p) => p.startsWith('assets/'))) throw new Error('Laufzeit-Auswahl unvollständig: assets/');
  const nativ = await readFile(join(w, 'native', 'wn-native.js'));
  const url = 'native/wn-native.js?v=' + sha256(nativ).slice(0, 16);
  const html = indexAnpassen((await readFile(join(w, 'index.html'))).toString('utf8'), url);
  const absolut = absolutePfade(html);
  if (absolut.length) throw new Error('index.html nutzt absolute Pfade: ' + absolut.join(', '));
  for (const m of html.matchAll(/\s(?:src|href)="([^"#:]+?)(?:\?[^"]*)?"/g)) {
    const p = m[1].replace(/^\.\//, '');
    if (p && !p.startsWith('native/') && !auswahl.includes(p)) throw new Error('index.html verweist auf fehlende Datei: ' + p);
  }
  await rm(aus, { recursive: true, force: true });
  await mkdir(join(aus, 'native'), { recursive: true });
  const beleg = { quelle: 'Workflow-Needs', app: 'Workflow Needs Pro',
    abweichungen: ['index.html: <script> für native/wn-native.js vor assets/app.js, Anmeldung des Service Workers entfernt', 'sw.js nicht im App-Paket (kein Offline-Vorrat in der App)'], dateien: [] };
  for (const p of auswahl) {
    const b = p === 'index.html' ? Buffer.from(html, 'utf8') : await readFile(join(w, p));
    await mkdir(dirname(join(aus, p)), { recursive: true });
    await writeFile(join(aus, p), b);
    beleg.dateien.push({ pfad: p, sha256: sha256(b) });
  }
  await writeFile(join(aus, 'native', 'wn-native.js'), nativ);
  beleg.dateien.push({ pfad: 'native/wn-native.js', sha256: sha256(nativ) });
  try { beleg.commit = execFileSync('git', ['-C', w, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* ohne Git-Kopf */ }
  await writeFile(join(aus, 'native-bundle.json'), JSON.stringify(beleg, null, 2) + '\n');
  console.log('Natives Web-Paket: ' + beleg.dateien.length + ' Dateien nach www/');
  return beleg;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await prepareWeb();
