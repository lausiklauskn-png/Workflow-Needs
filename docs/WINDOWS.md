# Workflow Needs Pro für Windows (Fassung 1.0.0, Klaus 15.11.2026)

Vorbild in allem: Datei-Organizer Pro `windows/` (Tauri 2 / WebView2, Java-Engine als privater Kindprozess, Updates vom eigenen Server),
dahinter BookLedgerPro. Dieselbe Oberfläche wie die Android-App: `windows/tools/build-web.mjs` nimmt das native Web-Paket aus
`tools/native/prepare-web.mjs`. Die Hülle stellt dieselben Capacitor-Plugins bereit (`windows/bridge/capacitor-tauri.js`),
`native/wn-native.js` läuft unverändert; `Capacitor.getPlatform()` = `windows`.

## Was drin ist

| Teil | Windows | Android (zum Vergleich) |
|---|---|---|
| Speichern unter | Windows-Speichern-Dialog (`WnDateien.speichern`, Engine `DesktopService`) | Android-Speichern-Fenster (`WnDateienPlugin`) |
| Drucken | WebView2 druckt selbst (`window.print()` unverändert) | Androids Druckdienst (`WnDruckenPlugin`) |
| Updates | `DesktopUpdates.java`: `aktuell-windows.json` + `.sig`, Setup `Workflow-Needs-Pro-Windows-X.Y.Z-x64-setup.exe` | `UpdateFeed.java`: `aktuell-android.json`, APK |
| Eigene Seiten im Fenster | App, Impressum, Datenschutz, Sicherheit (`main.rs`); alles andere an Browser bzw. Mailprogramm | nur `https://localhost` |
| Zweiter Programmstart | holt das offene Fenster nach vorn | – |
| Fassung | `windows/src-tauri/tauri.conf.json` = `windows/package.json` = `Cargo.toml` = `package.json` | `versionName` |

Nicht gebaut (gegenüber dem Datei-Organizer weggelassen, Needs braucht es nicht): Ordner am PC, „Öffnen mit“, Dateiarten im Installer.
Daten: WebView-Daten und Engine-Dateien unter `%LOCALAPPDATA%\de.familyprojekt.workflowneeds\`, Programm unter
`%LOCALAPPDATA%\Workflow Needs Pro\`. Deinstallieren lässt gespeicherte Dateien stehen.

## Updates vom eigenen Server

Feed `https://family-projekt.de/updates/workflow-needs/aktuell-windows.json` + `.sig` (Ed25519, Format 1, `app: "workflow-needs"`).
**Ein Schlüssel für Windows und Android** (Geheimnis `UPDATE_SIGNING_KEY`); der öffentliche Teil steht in `DesktopUpdates.SCHLUESSEL`
**und** `UpdateFeed.SCHLUESSEL` – `tools/native/test-native.mjs` und `windows-release.yml` prüfen, dass beide gleich sind.
**Noch leer (Platzhalter):** dann fragt die App nichts und meldet „nicht eingerichtet“. Schritte: `docs/ANDROID.md` (b).

## Prüfen

```bash
LANG=C.UTF-8 node windows/engine/test.mjs           # Engine mit gestellter Hülle (Speichern unter, Updates)
LANG=C.UTF-8 node windows/engine/protocol-test.mjs  # echter Kindprozess über stdio
npm ci --ignore-scripts --prefix windows && NODE_PATH=windows/node_modules node windows/tools/test-bruecke.mjs   # Brücke, Verträge
node tools/native/test-native.mjs                   # Fassungen, Verträge Windows = Android, ein Update-Schlüssel
```

GitHub `windows.yml` (PR bei Änderungen an Windows-Teilen oder der Web-App, auf main immer): Engine (Linux und Windows), eigene Java-Laufzeit
(jlink), Prüfbau mit Prüf-Schnittstelle installiert und zweimal gestartet (`windows/pruefung/installed.mjs`: Name, Fassung, Zugriffsschutz,
Verträge, Updates, neuer Vorgang über die Oberfläche, Herunterladen → Speichern unter; nach Neustart ist der Vorgang noch da), Deinstallieren,
dann Auslieferungsbau ohne Prüf-Schnittstelle. Artefakt `workflow-needs-pro-windows-unsigniert`.

## Veröffentlichen (nur auf Klaus' Wort)

Erst wenn der öffentliche Schlüssel eingetragen ist: Actions → „Workflow Needs Pro Windows veröffentlichen“ auf `main`, Feld `bestaetigung` = `ja`.

## Grenzen (benannt)

- **Nicht an einem echten Windows-PC gemessen.** In der Sitzung nur `cargo check` für Windows (mit und ohne `messprobe`); Bau,
  Installation und Start zeigt `windows.yml`.
- Drucken (WebView2-Druckfenster) ist in keiner Probe gefahren.
- Unsigniertes Setup: SmartScreen warnt beim ersten Start.
- Speichern unter nimmt höchstens 64 MB je Datei (eine Zeile im Protokoll zur Engine).
