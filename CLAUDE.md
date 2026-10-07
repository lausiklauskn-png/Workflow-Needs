# Workflow Bedarfsanalyse (Workflow-Needs) — Sitzungs-Anker

Eine installierbare PWA mit drei getrennten Stufen und Fassungen
(Brief `BRIEF_bedarfsprotokoll.md`, Sitzung „Fahrplan / Marktanalyse", 2026-10-07):

| Stufe | Inhalt | Ausdruck |
|---|---|---|
| **1 · Bedarf** | Klaus' 18 Bereiche, lösungsneutral, **ohne Preis** | „Bedarfsprotokoll" für den Kunden (nur Freigegebenes) · „Bedarfsanalyse" für Klaus (alles) |
| **2 · Umfang** | Bausteine anklicken, Stunden, Preis, Kosten-Nutzen mit Grenzlinie | intern (in der „Bedarfsanalyse") |
| **3 · Angebot** | Positionen, Preis, zwei Unterschriften, **ohne** interne Sätze | an den Kunden |

Dazu **Fassungen** (F1, F2 …, Vergleich, Nachtrag zum Unterschreiben) und der
**Bauauftrag (MD)** für die nächste Sitzung — immer mit Platzhaltern statt Kundendaten.

Adresse: https://lausiklauskn-png.github.io/Workflow-Needs/ · kein Build-Schritt, offline.

**Drei Namen, drei Aufgaben (Klaus 2026-10-07):** *Bedarfsanalyse* = Werkzeug und
Dokument für Klaus · *Bedarfsprotokoll* = Dokument für den Kunden · *Workflow-Needs*
= Name für die Werbung und auf Englisch. Ein Kundenblatt trägt nie das Wort „Analyse".

## Wenn eine Bauauftrags-MD im Chat steht (Brief § 7d, wörtlich)

Steht eine `bauauftrag`-MD im Chat, liest die Sitzung zuerst „Zu tun", baut **nur** die Zeilen
NEU BAUEN / ANPASSEN / ENTFERNEN, fasst UNVERÄNDERT nicht an und nennt NOCH NICHT GESCHÄTZT als
offene Frage. **Platzhalter `⟦…⟧` übernimmt sie unverändert** in Code, Texte und Antwort — sie
fragt nicht nach dem Klartext und erfindet keinen; die App setzt ihn beim Einfügen wieder ein.

Der Kopf sagt, was drinsteht: `stunden: ja|nein`, `euro: ja|nein` (fehlt ein Betrag, heißt
das „weggelassen", nicht „null"), `verdeckt: ja|nein`. Der Stundensatz steht nie darin.

## Aufbau (klassische Skripte, im Browser `window.WN`, in Node `globalThis.WN`)

| Datei | Aufgabe |
|---|---|
| `modules/25_pseudonym.js` | **Sage-Modul 25, byte-1:1** (Sage `df54f0c`), SHA in `tests/kern.mjs` (`MODUL25_SHA`). **Nie hier abwandeln** — in Sage ändern, neu kopieren, Pin nachziehen, Cache erhöhen |
| `assets/kern/geld.js` | Cent-Rechnung nach BookLedgerPro `money.js` (gelesen, nicht importiert) |
| `assets/kern/bedarf.js` | die 18 Bereiche, Kennungen `B-nn`/`O-nn`, Klaus' Definition wörtlich |
| `assets/kern/rechnen.js` | Schätzung, Satz-Ebenen, USt, Kosten-Nutzen, Grenzlinie, Phasen, Positionen |
| `assets/kern/fassungen.js` | Vorgang, Fassung, Unterschreiben (friert Satz + USt ein), Vergleich, Kundenfeld-Platzhalter |
| `assets/kern/aussen.js` | **Whitelist** für Bedarfsprotokoll, Angebot, Nachtrag (Muster: BookLedgerPro `externesAngebot`) |
| `assets/kern/bauauftrag.js` | MD erzeugen (Modul 25 + letzte Sicherung), einlesen, Platzhalter aufdecken |
| `assets/kern/sicherung.js` | verschlüsselte Sicherung: verschließen, öffnen, zusammenführen (fügt hinzu, überschreibt nie), Anhänge ⟷ base64, Erinnerung |
| `assets/kern/uebergabe.js` | 📤 Auftragsdatei für Mein WorkFloh / Tomys Hub — **nur aus `aussen.angebotExtern`** |
| `assets/schluesseltresor.js` | **byte-1:1 aus dem Sende-Prüfer** (`74af186`, aus kim-hub-company `1a4528d`), `TRESOR_SHA` in `tests/kern.mjs`. Nie hier abwandeln |
| `impressum.html` · `datenschutz.html` | wie im Auslieferungsprüfer, echte Angaben nach § 5 DDG — nie durch Platzhalter ersetzen |
| `werbung.html` | Werbeseite mit `icons/werbung-1200.jpg` (nicht im Vorrat) · `docs/MARKTPLATZ_EINTRAG.md` |
| `assets/daten/*.js` | Baustein-Katalog, Faktoren, Markt, Kalibrierung, Beispiel „Boutique" |
| `assets/app.js` · `app.css` · `texte.js` | Oberfläche, Glas-Knöpfe, englische Texte |
| `assets/installieren.js` | byte-1:1 aus Sage (`INSTALLIEREN_SHA`) |

**Speicher (nie ändern):** IndexedDB `WorkflowNeeds1` / Store `vorgaenge` (Vorgänge samt
Zuordnung Platzhalter ⟷ Klartext) · localStorage `workflowneeds_einstellungen`,
`workflowneeds_tabellen`, `workflowneeds_thema`, `workflowneeds_lang`, `workflowneeds_aktiv`,
`workflowneeds_reiter`, `workflowneeds_beispiel_v1`, `workflowneeds_sicherung_zuletzt` (seit Stufe 2;
sessionStorage `workflowneeds_sicherung_spaeter`). Nicht `toolpoint_lang` — github.io ist geteilt.
Am Vorgang neu, ohne neue DB-Fassung: `v.anhaenge = [{id: "A-nn", name, typ, groesse, datum, blob}]`
(der Blob liegt direkt in IndexedDB — `ablage(v)` in `app.js` klont alles als JSON und hängt die Blobs
wieder an), `v.ist = {"<Fassung>": Stunden}`, `v.beispiel` (nur das Beispiel).

## Was hier leicht kaputtgeht

- **Stundensatz verlässt das Haus nie.** Angebot und Nachtrag werden aus `assets/kern/aussen.js`
  gebaut und gezeichnet — nie aus der Ansicht. Ein neues Feld am Vorgang erscheint dort erst,
  wenn es ausdrücklich in die Whitelist kommt. Die Probe stellt den Satz auf 73 € und sucht ihn.
- **Satz-Ebenen:** Baustein → Fassung → Vorgabe. Ein neuer Vorgang **kopiert** die Vorgabe
  (80 €, Klaus 2026-10-07). Unterschreiben friert Satz **und** USt ein (`f.ust` gesetzt);
  eine offene Fassung folgt der USt-Einstellung.
- **Kennungen** kommen aus `vorgang.zaehler` und werden nie neu vergeben. Lücken (B-05 intern)
  bleiben im Kundenausdruck stehen — benannte Entscheidung, Klaus kann sie überstimmen.
- **Kundenfelder haben feste Platzhalter** `⟦KUNDE-1⟧` (Firma) … `⟦KUNDE-6⟧` (Kundennummer),
  auch solange sie leer sind. Die Zuordnung wächst am Vorgang (`v.zuordnung`) und wird nach
  jedem Export gespeichert — so bleibt ein Name über alle Fassungen gleich.
- **App-Zahlen werden nicht verdeckt:** verdeckt wird nur Inhalt (Freitext, Kundenfelder,
  „Weitere Namen und Begriffe"); Stunden, Euro, Kennungen, Datum setzt die App danach ein.
  Die letzte Sicherung sucht deshalb nur Klartext aus der Zuordnung sowie SCHLUESSEL, MAIL,
  IBAN, TELEFON, RECHNUNG — nicht BETRAG und DATUM (die erzeugt die App selbst). Die
  Angebotsnummer steht deshalb NICHT in der MD (Modul 25 hält `AN-2026-0007` für eine Beleg-Nummer).
- **Die Kunden-Mail als Kundenfeld:** Modul 25 erkennt sie zuerst als MAIL → `⟦MAIL-n⟧` statt
  `⟦KUNDE-4⟧`. Beides verdeckt, beides stabil.
- **Cache-Bump:** wer eine Datei aus `CORE` (`sw.js`) ändert, erhöht `CACHE_VERSION` und ruft
  `node tools/cache-stand.mjs` — sonst wird `tests/kern.mjs` rot. `?v=` in `index.html` und
  `CORE` müssen gleich sein (gemessen).
- **Englische Texte:** jeder `t("…")` in `app.js` braucht einen Eintrag in `assets/texte.js`
  (gemessen). Die Bauauftrags-MD bleibt Deutsch.
- **Icons und Bild sind gebaut** aus Klaus' Vorlagen (2026-10-07) in `icons/quelle/`:
  das schlichte Prisma → App-Icon, Favicon (enger geschnitten), maskierbar; das Prisma mit
  Splittern → `assets/bild-prisma.webp` (oben in „Vorgänge") und `icons/werbung-1200.jpg`
  für die Werbung. `python3 tools/icons-bauen.py` (Pillow), danach Cache erhöhen.
- **Offline-Probe:** `ctx.setOffline` erfasst die Abrufe des Service Workers NICHT — damit war
  der Fall „Worker legt nichts in den Vorrat" blind. Die Probe schaltet deshalb einen eigenen
  Server ganz ab und öffnet eine frische Seite.

## Stufe 2 (2026-10-07, zweite Sitzung)

Brief: „Workflow-Needs Stufe 2" (im Chat). Dazu Klaus im Chat: *„Workflow Needs soll mit Workflow
zusammenarbeiten … Tomys Workflow nimmt den Auftrag an … bis zur Buchhaltung"* · *„die Dateianhänge,
die in das Angebot mit einfließen … PDF als PDF, EML als E-Mail … Screenshots als Datei oder Bild"*.

- **🔐 Sicherung** (Einstellungen): Passwort ≥ 8 Zeichen zweimal → Datei
  `Workflow-Needs-Sicherung-JJJJ-MM-TT.json` = `{art: "workflowneeds-sicherung-verschluesselt", fassung: 1,
  erstellt, paket}` — **kein Klartext** darin. Mit drin: Vorgänge samt Anhängen und Zuordnung,
  Einstellungen (Firma, Satz), Tabellen. Zurückholen fügt hinzu; Einstellungen/Tabellen nur, wo auf dem
  Gerät noch keine stehen. ⚠ **Tafel-Evolution:** geschrieben wird nur noch verschlüsselt; eine alte
  Klartext-Sicherung (`workflowneeds-sicherung`) wird weiter gelesen. Erinnerung in „Vorgänge", sobald
  eigene (nicht Beispiel-)Vorgänge da sind und die letzte Sicherung fehlt oder ≥ 14 Tage alt ist.
  `sicherung.js` des Sende-Prüfers ist **nicht** byte-1:1 übernommen (liest dessen MAILS/Ordner) —
  nur das Schloss; das Muster ist nachgebaut.
- **📎 Anhänge am Vorgang** (Reiter Vorgänge, „intern" gestrichelt): Datei wählen, „Screenshot einfügen"
  (Zwischenablage) oder Strg+V im Abschnitt; höchstens 25 MB je Datei (gewählt). Byte für Byte, Name und
  Art bleiben. Gehen **nicht** in Bauauftrag, Angebot, Bedarfsprotokoll — wohl in Sicherung und Übergabe.
- **📤 Als Auftrag übergeben** (Reiter Angebot): schreibt das Weiterleitungs-Bündel, das Mein WorkFloh
  und Tomys Hub/workfloh mit „📥 Importieren" lesen (`applyForwardBundle`, in beiden byte-gleich).
  Status `angebot` (gibt es in beiden), feste Kennung `wn-<Vorgang>-F<n>` (zweimal einlesen =
  aktualisieren), Datum TT.MM.JJJJ, Anhänge als data-URL. **Gemessen 2026-10-07:** eine so gebaute Datei
  in beiden WorkFlohs über deren eigenes `applyForwardBundle` eingelesen — Auftrag mit Kunde, Positionen,
  Preis, PDF als `application/pdf`, .eml als `message/rfc822`. ⚠ Nicht gemessen: Tomys `?angebotNeu=`-Weg
  (trägt keine Dateien) und die Weitergabe WorkFloh → BookLedgerPro mit einem Workflow-Needs-Auftrag.
  ⚠ Das Angebot selbst geht nicht als PDF mit — „Als PDF speichern" im Druckdialog und dann anhängen.
- **Vorlagen nachgesehen** (10 Bausteine, Hinweis nennt Stand-Commit). Workfloh-PDF-Page und
  Perfect-Skin-Fashion: nicht nachgesehen (steht im Hinweis).
- **Bildschirme gezählt** im Code (`markt.js` `GEZAEHLT`, Regel `bildschirmRegel`): Ordner, die nur
  dieselbe Liste filtern, zählen einzeln (Sende-Prüfer 7, Küchenzettel 7 — sonst je 2). mycel-karte lag
  nicht vor → „nicht gezählt".
- **Ist-Stunden** je unterschriebener Fassung (Reiter Fassungen, 🔒) → Tabellen: „Eigene Aufträge:
  Schätzung und Ist (intern)", Abweichung gegen die Mitte. Nie in Ausdruck, Angebot, MD, Übergabe.
- ⚠ **Offen:** Klaus' Sichttest-Befunde vom Tablet (Brief Punkt 1) lagen dieser Sitzung nicht vor.
  Der Marktplatz-Eintrag ist nur als Text da (`docs/MARKTPLATZ_EINTRAG.md`): kein Schreibzugriff auf PWA-Toolpoint.

## Benannte Grenzen

- Platzhalter sind **keine Verschlüsselung**: der Klartext geht nur gar nicht erst hinaus. Was
  Modul 25 nicht erkennt („der einzige Bäcker in X"), bleibt stehen, bis es unter „Weitere
  Namen und Begriffe" eingetragen ist — dann in allen Fassungen.
- Interne **Notizen** gehen nicht in die MD; interne **Einträge** schon (als „nur intern"
  gekennzeichnet) — die MD geht an Klaus' eigene Sitzung, nicht an den Kunden.
- Alle Stunden-Spannen, Faktoren und Wiederverwendungs-Anteile sind **Schätzungen**, keine
  Messung. Vorlage-Zuordnung je Baustein: seit Stufe 2 alle 13 mit Vorlage nachgesehen; die
  zweitgenannten Workfloh-PDF-Page und Perfect-Skin-Fashion nicht (steht im Hinweis).
- Kalibrierung: die Stunden sind aus dem Brief übernommen (dort gemessen); **Bildschirme sind im
  Code gezählt**, nicht in der laufenden App; mycel-karte steht als „nicht gezählt" da.
- Sicherung: verschlüsselt (seit Stufe 2). ⚠ Ein kurzes Passwort lässt sich durchprobieren, wenn
  jemand die Datei hat. Die ganze Sicherung liegt beim Bauen einmal als Text im Speicher (große Anhänge).
- Mindestpreis je Auftrag: **nicht gebaut** (Klaus 2026-10-07: „nicht jetzt").
- Die Entwürfe vorab (Brief § 11) sind nicht als eigene Vorschau gebaut worden — die
  Gestaltung steht direkt in der App.
- ⚠ Nicht gemessen: Tablet, echtes „Als PDF speichern" im Druckdialog, Installieren am Gerät.

## Prüfen

```bash
npm install                       # playwright-core
npm test                          # tests/kern.mjs (ohne Browser) + tests/browser.mjs
NUR_ANKER=1 node tests/gegenprobe.mjs   # jeder Anker steht genau einmal (Sekunden)
npm run gegenprobe                # jeder eingebaute Fehler muss seine rote Zeile werfen
NUR_FALL="MD:" node tests/gegenprobe.mjs
```

Ohne Browser endet `npm test` mit **2** („nicht lauffähig" ist nie grün).
Die Gegenprobe arbeitet in Wegwerf-Kopien unter `/tmp`, nie im echten Baum.

Zuletzt gemessen (2026-10-07, Endstand): `kern` **104 grün · 0 ROT** · `browser` **62 grün ·
0 ROT** · Gegenprobe **36 gefangen · 0 blind · 0 aus falschem Grund · 0 tote Anker**. Beim
ersten vollen Lauf: 34 gefangen, 2 aus falschem Grund (ein Sabotage-Fall ließ die Probe
abstürzen statt rot zu werden; die Offline-Probe stolperte), beim Nachfahren war der
Offline-Fall **blind** (siehe oben) — alle drei geschärft und nachgefahren.

## Netzweit

Freibrief zum Selbst-Mergen · frisch von `origin/main` · Ton · kein PII · Ehrlichkeit:
[Sage-Protokol/docs/NETZWEIT.md](https://github.com/lausiklauskn-png/Sage-Protokol/blob/main/docs/NETZWEIT.md)
