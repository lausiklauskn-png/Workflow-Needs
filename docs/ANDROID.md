# Workflow Needs Pro – die Android-App (Fassung 1.0.0, Klaus 15.11.2026)

Klaus 15.11.2026: „Workflow Needs und Calculate zu einer APK und einer Windows-Version bauen und sie Pro nennen.“
Windows: `docs/WINDOWS.md` (gleiche Verträge, gleicher Update-Schlüssel). Vorbild in allem: Datei-Organizer Pro
(`docs/ANDROID.md` dort), dahinter BookLedgerPro.

| Fassung | Name | Wo |
|---|---|---|
| Web-App (PWA) | **Workflow Bedarfsanalyse** (englisch Workflow-Needs) | GitHub Pages, unverändert weiter |
| Android-App | **Workflow Needs Pro** | Paket `de.familyprojekt.workflowneeds`, APK `Workflow-Needs-Pro-X.Y.Z.apk` |

Die App wird an **einer** Stelle erkannt: `native/wn-native.js` (Capacitor mit `isNativePlatform()`; unter Windows stellt
`windows/bridge/capacitor-tauri.js` dieselbe Brücke). **Speicher-Namen bleiben** (IndexedDB `WorkflowNeeds1`, localStorage `workflowneeds_*`).

## Aufbau

| Teil | Datei |
|---|---|
| Web-Paket (Laufzeit-Dateien aus `git ls-files` byte-gleich, ohne `sw.js`; index.html mit Klebstoff, ohne Service-Worker-Anmeldung) | `tools/native/prepare-web.mjs` → `www/` + Beleg `native-bundle.json` |
| Klebstoff der App (Name, Speichern unter, Drucken, Updates, kein Installieren-Knopf) | `native/wn-native.js` (nur im App-Paket, vor `assets/app.js`) |
| Capacitor 8.5.3 | `capacitor.config.json` (`webDir: www`, `https://localhost`, keine WebView-Fehlersuche) |
| Android-Projekt | `android/` (Java in `android/app/src/main/java/de/familyprojekt/workflowneeds/`) |
| Hülle | `MainActivity.java`: nur `https://localhost` im Fenster; fremde Adressen, `mailto:` und `tel:` an Browser bzw. Mailprogramm (BookLedgerPro, WorkFloh auch ohne Tipp, weil `?uebernahme=` nach dem Speichern springt); Schrift 100 %; Neuaufbau bei Anzeigeausfall |
| Speichern unter | `WnDateienPlugin.java` (`WnDateien.speichern`, `appInfo`) – Inhalt vor dem Dialog im Zwischenspeicher, bei Fehler wieder gelöscht |
| Drucken | `WnDruckenPlugin.java` (`WnDrucken.drucken`) – Androids Druckdienst mit dem Druckadapter der WebView; „Als PDF speichern“ bietet Android selbst an |
| Updates | `UpdateFeed.java` (Regel, rein) + `WnUpdatesPlugin.java` (`WnUpdates.pruefen`, `installieren`) |
| Symbole | `tools/native/symbole-bauen.py` (aus `icons/quelle/icon-prisma.jpg`, wie die PWA) |
| Probe ohne Android | `tools/native/test-native.mjs` |
| JVM-Proben | `android/app/src/test/…/UpdateFeedTest.java`, `NativeUtilTest.java` |
| Signieren | `tools/signing/` (Freigabe `WN_SIGNING_UNLOCK`, eigene Identität, nie die einer anderen App) |
| Abläufe | `.github/workflows/android.yml` (Prüf-Bau bei PR/main), `signing-identity.yml` und `android-release.yml` (nur von Hand) |

### Was die App anders macht als die PWA

- **Kein Service Worker** (Anmeldung im Paket entfernt, `sw.js` nicht im Paket): alles kommt aus dem App-Paket.
- **Herunterladen:** die WebView kann kein `<a download>`. Der Klebstoff fängt jeden solchen Klick ab (Auftragsdatei, Sicherung,
  Bauauftrag, Anhänge speichern, Tabellen) und öffnet Androids Speichern-Fenster. Zahlen nie über `call.getLong` (Familienakte-Befund 11.11.).
- **Drucken:** `window.print()` tut in der WebView nichts; der Klebstoff leitet es an Androids Druckdienst. Gedruckt wird, was die
  Web-App in `#druck` gelegt hat (dieselben `@media print`-Regeln wie im Browser).
- **Name** „Workflow Needs Pro“ in Kopf und Fenstertitel (auch auf Englisch), kein Installieren-Knopf.
- **Anhänge wählen** geht über Capacitors Dateiwahl; **E-Mail** (`mailto:`) öffnet das Mailprogramm; **An BookLedgerPro** öffnet den Browser.
- **Nicht in der App:** Teilen an die App / „Öffnen mit“ (nicht gebaut, war nicht nötig); „Teilen“ des Bauauftrags (die WebView kennt
  kein `navigator.share`) – die App sagt dann wie im Browser „bitte Kopieren nehmen“.

### Updates vom eigenen Server

- Feed `https://family-projekt.de/updates/workflow-needs/aktuell-android.json` + `.sig` (Ed25519 über genau die Bytes, Format 1,
  `app: "workflow-needs"`, Abschnitt `android: {datei, groesse, sha256, versionCode}`), gebaut von `tools/native/update-feed-android.mjs`.
- Die App glaubt nur der Unterschrift (öffentlicher Schlüssel in `UpdateFeed.SCHLUESSEL`), nimmt nur eine **neuere** Fassung, nur den
  Dateinamen `Workflow-Needs-Pro-X.Y.Z.apk`, prüft Größe, SHA-256, Paket, Signier-Zertifikat und versionCode, dann Androids Installieren-Fenster.
- **Bedienung:** neben dem Namen steht die Fassung („v1.0.0“). Still gefragt wird nach 2,5 s, beim Zurückholen und höchstens einmal je
  Stunde (`localStorage` `workflowneeds_update_still_v1`). Steht ein Update bereit, heißt der Knopf „Update X.Y.Z“; ein Tipp lädt direkt.
- **Noch nicht eingerichtet:** `UpdateFeed.SCHLUESSEL` ist ein leerer Platzhalter – die App fragt dann nichts und bleibt still,
  ein Tipp sagt „Updates sind in dieser Fassung noch nicht eingerichtet“.

### Fassungsnummern

`package.json` = `versionName` in `android/app/build.gradle` = `windows/src-tauri/tauri.conf.json` = `windows/package.json` = `Cargo.toml`;
`versionCode` = Haupt × 1000 + Neben × 10 + Flick (1.0.0 → 1000). `test-native.mjs` prüft beides. Die Fassung der PWA (Cache `workflow-needs-vNN`)
ist davon unabhängig.

## Proben

```bash
npm test                              # Web-App (kern + browser), unverändert
node tools/native/test-native.mjs     # Web-Paket, Kennungen, Fassung, Rechte, Plugins, Feed; App-Paket im Browser mit gestellter Brücke
npm run sync:android                  # www/ bauen und in android/ legen
cd android && ./gradlew assembleDebug lintDebug testDebugUnitTest   # braucht ein Android-SDK → in GitHub (android.yml)
```

Die JVM-Proben laufen auch ohne Android mit `javac` + JUnit 4.13.2 (eddsa 0.3.0, hamcrest 1.3 von Maven Central).

## Was Klaus einmalig tun muss

Nichts davon kann Claude tun; nichts wird ohne Klaus' Wort ausgelöst oder veröffentlicht. Keine Werte in den Chat.

**(a) Eigene Signieridentität** (dauerhafter Schlüssel nur für Workflow Needs Pro):

1. Freigabe erzeugen (Termux): `openssl rand -hex 32 > ~/wn-signing-freigabe.txt` – wie die anderen Freigaben verschlüsselt sichern
   (`age -p`), die offene Datei danach löschen.
2. GitHub → Workflow-Needs → Settings → Environments → **New environment** `android-production` → **Add environment secret**
   Name `WN_SIGNING_UNLOCK`, Wert = Inhalt der Datei.
3. Actions → **„Dauerhafte Workflow-Needs-Pro-Signieridentität“** → Run workflow auf `main`, Operation **initialize**. Der Lauf erzeugt
   den Schlüssel, verschlüsselt ihn, prüft die Wiederherstellung und legt einen PR `signing/android-identity` an (nur das verschlüsselte
   Paket und der öffentliche Fingerabdruck). Danach jederzeit Operation **check**.
   Der Lauf bricht ab, wenn es im Repo schon GitHub-Releases gibt (Schutz vor einem zweiten Schlüssel; am 15.11. gab es keine).
   Wer die Freigabe verliert, kann nach der ersten Veröffentlichung keine Updates mehr ausliefern.

**(b) Update-Server und Update-Schlüssel** (wie beim Datei-Organizer, Termux, ein Block; der Hochlade-Schlüssel von BookLedgerPro darf
schon in `/srv/family-project/updates` schreiben):

```
A=workflow-needs; R=lausiklauskn-png/Workflow-Needs; S=root@167.233.204.72
ssh $S "mkdir -p /srv/family-project/updates/$A && echo '{\"probe\":1}' > /srv/family-project/updates/$A/probe.json"
curl -s https://family-projekt.de/updates/$A/probe.json; echo
mkdir -p ~/$A-update && cd ~/$A-update
[ -f signatur.pem ] || openssl genpkey -algorithm ed25519 -out signatur.pem; chmod 600 signatur.pem
gh secret set UPDATE_SIGNING_KEY -R $R < signatur.pem
gh secret set UPDATE_UPLOAD_KEY -R $R < ~/blp-update/upload
gh secret list -R $R | grep UPDATE_
echo "== öffentlicher Schlüssel:"; openssl pkey -in signatur.pem -pubout | sed -n 2p
```

Danach die **eine ausgegebene Zeile** nach „öffentlicher Schlüssel:“ (beginnt mit `MCowBQYDK2VwAyEA`, öffentlich, kein Geheimnis) an
Claude geben; sie kommt in `UpdateFeed.SCHLUESSEL` (Android) **und** `DesktopUpdates.SCHLUESSEL` (Windows). `signatur.pem` bleibt nur in
Termux (verschlüsselt sichern). Prüfen, ob `rsync … root@167.233.204.72:workflow-needs/` auf denselben Server-Ordner zeigt wie beim
Datei-Organizer (`datei-organizer/`).

**(c) Veröffentlichen** (erst nach a und b, nur auf Klaus' Wort): Actions → „Workflow Needs Pro Android veröffentlichen“ auf `main`,
Tag `v1.0.0` (= `versionName`), voller main-Commit (Check „android“ grün), Feld `bestaetigung` = `ja`. Der Lauf baut, signiert, prüft im
Emulator (neuer Vorgang, überinstallieren, Vorgang noch da), veröffentlicht auf GitHub, prüft den Download, unterschreibt den Feed und lädt
nach `family-projekt.de/updates/workflow-needs/` hoch.

## Grenzen (benannt)

- **Nicht am Gerät, kein Emulator-Lauf, kein Android-Bau in der Sitzung** (kein Android-SDK im Behälter). Ob Gradle baut und Lint
  besteht, zeigt `android.yml`. Lokal geprüft: JVM-Proben, Node-Probe, Browser mit gestellter Brücke.
- Drucken über Androids Druckdienst, Speichern-Fenster, Dateiwahl für Anhänge und `mailto:` sind am Gerät ungeprüft.
- Speichern unter nimmt höchstens 100 MB je Datei (eine Sicherung mit sehr vielen großen Anhängen kann darüber liegen – dann eine Meldung).
- Die Probe im Veröffentlichungs-Lauf (`tools/native/verify-signed-install.py`) ist umgeschrieben, aber noch nie gelaufen.
