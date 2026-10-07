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
| `assets/daten/*.js` | Baustein-Katalog, Faktoren, Markt, Kalibrierung, Beispiel „Boutique" |
| `assets/app.js` · `app.css` · `texte.js` | Oberfläche, Glas-Knöpfe, englische Texte |
| `assets/installieren.js` | byte-1:1 aus Sage (`INSTALLIEREN_SHA`) |

**Speicher (nie ändern):** IndexedDB `WorkflowNeeds1` / Store `vorgaenge` (Vorgänge samt
Zuordnung Platzhalter ⟷ Klartext) · localStorage `workflowneeds_einstellungen`,
`workflowneeds_tabellen`, `workflowneeds_thema`, `workflowneeds_lang`, `workflowneeds_aktiv`,
`workflowneeds_reiter`, `workflowneeds_beispiel_v1`. Nicht `toolpoint_lang` — github.io ist geteilt.

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

## Benannte Grenzen

- Platzhalter sind **keine Verschlüsselung**: der Klartext geht nur gar nicht erst hinaus. Was
  Modul 25 nicht erkennt („der einzige Bäcker in X"), bleibt stehen, bis es unter „Weitere
  Namen und Begriffe" eingetragen ist — dann in allen Fassungen.
- Interne **Notizen** gehen nicht in die MD; interne **Einträge** schon (als „nur intern"
  gekennzeichnet) — die MD geht an Klaus' eigene Sitzung, nicht an den Kunden.
- Alle Stunden-Spannen, Faktoren und Wiederverwendungs-Anteile sind **Schätzungen**, keine
  Messung. Vorlage-Zuordnung je Baustein: nachgesehen nur Sende-Prüfer, Auslieferungsprüfer,
  BookLedgerPro; die übrigen stehen „laut Brief, nicht nachgesehen" in der App.
- Kalibrierung: die Stunden sind aus dem Brief übernommen (dort gemessen); **Bildschirme sind
  nicht nachgezählt** und stehen als „nicht gezählt" da.
- Sicherung ist JSON im Klartext (mit Zuordnung). Verschlüsselt wie im Sende-Prüfer: später.
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
