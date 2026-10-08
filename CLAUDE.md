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
| `assets/kern/aussen.js` | **Whitelist** für Bedarfsprotokoll, Angebot, Nachtrag, Rechtsblätter (Erklärung, Vereinbarung, Wartung) und Sternebogen (Muster: BookLedgerPro `externesAngebot`) |
| `assets/kern/bauauftrag.js` | MD erzeugen (Modul 25 + letzte Sicherung), einlesen, Platzhalter aufdecken |
| `assets/kern/sicherung.js` | verschlüsselte Sicherung: verschließen, öffnen, zusammenführen (fügt hinzu, überschreibt nie), Anhänge ⟷ base64, Erinnerung |
| `assets/kern/mail.js` | .eml lesen für die 👁 Ansicht: Kopf (RFC 2047), multipart, base64/QP, Anhänge Byte für Byte; HTML nur als Text |
| `vendor/pdfjs/` | **byte-1:1 aus dem Auslieferungsprüfer** (PDF.js 3.11.174, `PDFJS_SHA` in `tests/kern.mjs`), nur für die Ansicht, `isEvalSupported: false`, nicht im Vorrat |
| `assets/kern/uebergabe.js` | 📤 Auftragsdatei für Mein WorkFloh / Tomys Hub — **nur aus `aussen.angebotExtern`** |
| `assets/schluesseltresor.js` | **byte-1:1 aus dem Sende-Prüfer** (`74af186`, aus kim-hub-company `1a4528d`), `TRESOR_SHA` in `tests/kern.mjs`. Nie hier abwandeln |
| `impressum.html` · `datenschutz.html` | wie im Auslieferungsprüfer, echte Angaben nach § 5 DDG — nie durch Platzhalter ersetzen |
| `werbung.html` | Werbeseite mit `icons/werbung-1200.jpg` (nicht im Vorrat) · `docs/MARKTPLATZ_EINTRAG.md` |
| `assets/daten/*.js` | Baustein-Katalog, Faktoren, Markt, Kalibrierung, Beispiel „Boutique“ (Testfall) und Register; seit Stufe 3 `beispiel-tomys/-psb/-alis/-eigene.js` |
| `assets/app.js` · `app.css` · `texte.js` | Oberfläche, Glas-Knöpfe, englische Texte |
| `assets/installieren.js` | byte-1:1 aus Sage (`INSTALLIEREN_SHA`) |

**Speicher (nie ändern):** IndexedDB `WorkflowNeeds1` / Store `vorgaenge` (Vorgänge samt
Zuordnung Platzhalter ⟷ Klartext) · localStorage `workflowneeds_einstellungen`,
`workflowneeds_tabellen`, `workflowneeds_thema`, `workflowneeds_lang`, `workflowneeds_aktiv`,
`workflowneeds_reiter`, `workflowneeds_beispiel_v1`, `workflowneeds_sicherung_zuletzt` (seit Stufe 2;
sessionStorage `workflowneeds_sicherung_spaeter`). Nicht `toolpoint_lang` — github.io ist geteilt.
Am Vorgang neu, ohne neue DB-Fassung: `v.anhaenge = [{id: "A-nn", name, typ, groesse, datum, blob}]`
(der Blob liegt direkt in IndexedDB — `ablage(v)` in `app.js` klont alles als JSON und hängt die Blobs
wieder an), `v.ist = {"<Fassung>": Stunden}`, `v.beispiel` (nur Beispiele), seit Stufe 3 `v.bid` (Kennung des Beispiels),
`v.erklaerung` / `v.vereinbarung` / `v.wartung = {unterschriftBetrieb, unterschriftKunde (PNG data-URL), papier, fassung, aktiviert, stand}`,
`v.sterne = [{id: "S-nn", zeitpunkt: "bedarf"|"abnahme", kennung: "B-nn", bereich, kuerzel, sterne, datum}]`; an der Fassung
`umfang.gewaehrleistungH` (Freistunden, fehlt = 0); in den Einstellungen `wartung = {freistunden, wochen, pauschaleCent}`.

## Was hier leicht kaputtgeht

- **Stundensatz verlässt das Haus nie** — mit GENAU EINER Ausnahme: das Blatt **Wartungsvertrag**
  (Klaus 2026-10-07, ausdrückliches Ja: „Stundensatz im Wartungsvertrag“). Erklärung, Vereinbarung,
  Angebot, Nachtrag, Bedarfsprotokoll, Übergabe und MD bleiben ohne Satz; die Proben messen beide Richtungen,
  und die Übergabe nimmt den Wartungsvertrag nie mit. Angebot und Nachtrag werden aus `assets/kern/aussen.js`
  gebaut und gezeichnet — nie aus der Ansicht. Ein neues Feld am Vorgang erscheint dort erst,
  wenn es ausdrücklich in die Whitelist kommt. Die Probe stellt den Satz auf 73 € und sucht ihn.
- **Satz-Ebenen:** Baustein → Fassung → Vorgabe. Ein neuer Vorgang **kopiert** die Vorgabe
  (80 €, Klaus 2026-10-07). Unterschreiben friert Satz **und** USt ein (`f.ust` gesetzt);
  eine offene Fassung folgt der USt-Einstellung.
- **Kennungen** kommen aus `vorgang.zaehler` und werden nie neu vergeben. Lücken (B-05 intern)
  bleiben im Kundenausdruck stehen — benannte Entscheidung, Klaus kann sie überstimmen.
- **Kein Platzhalter auf einem Kundenblatt** (Stufe 3 § 1b, Befund Klaus' Tablet): `kundeExtern` gibt für ein
  leeres Feld `""`, das Blatt zeichnet eine Schreiblinie (`data-schreiblinie`). ⚠ Tafel-Evolution: bis Stufe 2
  stand dort der Platzhalter.
- **Kundenfelder haben feste Platzhalter** `⟦KUNDE-1⟧` (Firma) … `⟦KUNDE-6⟧` (Kundennummer) — in der MD,
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

**Stufe 3 ist gebaut** (Abschnitt unten). Offen: Klaus' Tablet-Sichttest und seine „minimalen“ Verbesserungen.

## Stufe 3 (2026-10-07, dritte Sitzung)

Brief `docs/BRIEF_2026-10-07_stufe3-beispiele-verschwiegenheit.md`, alle Fragen dort beantwortet.

- **§ 1b · kein ⟦ auf Kundenblättern:** leeres Kundenfeld → leere Schreiblinie. Probe kern und browser.
- **§ 3 · vier Beispiele** (Einstellungen → „Beispiele“: Auswahl, „Laden“, „Alle laden“; kein Doppel über `v.bid`,
  alte Boutique ohne `bid` wird am Titel erkannt; beim ersten Öffnen weiter NUR „Boutique“):
  | bid | Quelle (gelesen 2026-10-07) | Fassungen nach der Geschichte | Ist (h, Untergrenze) |
  |---|---|---|---|
  | `tomys` | Tomys-Hub `0e05091` | F1 Grundverbund bis 07-07 · F2 Netz/Feinschliff bis 09-23 · F3 PDF-Werkzeug + Prüfung bis 10-07 | 22,9 · 76,0 · 103,9 |
  | `psb` | Perfect-Skin-Beauty `aba5429` (privat) | F1 Seite bis 07-18 · F2 Selbstpflege/Recht/SEO bis 08-09 · F3 Netz bis 09-30 | 3,5 · 18,1 · 35,3 |
  | `alis` | Alis-Moderaum `3563d45` | F1 Schaufenster **und** Lager (ein Commit) bis 07-16 · F2 Pflege/KI bis 07-25 · F3 Kasse + BLP bis 07-27 · F4 offen (mehrere Geräte, NOCH NICHT GESCHÄTZT) | 1,5 · 16,0 · 18,9 |
  | `eigene` | Mein-Rezeptbuch `e8fe888`, Sage-Protokol `df54f0c`, family-project `9062508`, PWA-Toolpoint `dad5ae6` | F1 bis 05-15 · F2 bis 07-16 · F3 bis 10-07; eigenes Vorhaben (verdeckt: nein) | 118,4 · 392,5 · 749,8 (vereinigt; je Repo addiert 907,8) |
  Methode der Ist-Stunden wie `markt.js` (Lücke > 90 min, 30 min Vorlauf), nachgeprüft an Datei-Post (3,2 h / 5 — gleich).
  ⚠ Brief-Vorschläge, die die Geschichte nicht trug: Tomys „F2 + Angebot und WorkFloh“ (alles am 07-04) und
  Alis „F1 Schaufenster · F2 + Lager“ (ein Commit) — korrigiert, steht im Kopf der Dateien.
  ⚠ **Befund Schätzung gegen Ist:** bei den drei Kundenbeispielen liegt die Katalog-Schätzung weit ÜBER dem Ist
  (KI-gestützter Bau, Vorlagen), bei „Eigene Apps“ darunter. Die Zahlen sind nicht angepasst — das ist genau,
  was die Tabelle „Eigene Aufträge: Schätzung und Ist“ zeigen soll. Kundendaten erfunden (`.example`, „… Beispiel“).
  Die Sterne in Tomys Hub sind erfunden (Beispiel), keine Bewertung echter Personen.
- **§ 4 · Verschwiegenheits- und Datenschutzerklärung** (Reiter Vorgänge, Status oben): Text in `aussen.js`
  (`erklaerungText`, Textfassung 1): DSGVO Art. 6 Abs. 1 lit. b, 3 Jahre für Geschäftliches, personenbezogene
  Daten ohne Frist, Rechte Art. 15–21. Zwei Unterschriftsfelder (`<canvas>`, Finger/Stift/Maus, PNG) oder „auf
  Papier unterschrieben“. **Aktivieren friert ein** (`v.erklaerung.stand`) und öffnet sofort das Blatt: 🖨 Drucken
  und ✉ Per E-Mail (`mailto:` mit Betreff und Text — die App verschickt nichts; PDF hängt Klaus von Hand an).
  Bedarfsprotokoll: „Es gilt die … vom …“. MD: nur „aktiviert: ja/nein“. Übergabe: erst aktiviert, als HTML-Datei.
- **§ 4e/4f · Vereinbarung zu Zahlung und Nutzungsrechten** (Reiter Angebot): Ziel = Bedarfsprotokoll + Angebot
  Fassung n mit den freigegebenen Kennungen; Zahlung erst nach Abnahme, **je Baustein** (Tabelle Kennung · Leistung ·
  deckt · Netto); Nutzungsrecht einfach, nicht übertragbar, zeitlich unbegrenzt, Änderungen nur durch den
  Auftragnehmer; ohne Zahlung **Bedienungssperre — nur vereinbart**, Daten bleiben, Export bleibt (der Schalter
  kommt später je Kunden-App; Katalog-Baustein `lizenz`, Schätzung, nicht nachgesehen); Aktualisierungen automatisch,
  2 Jahre kostenlos, danach Wartungsvertrag, ohne Vertrag läuft die letzte Fassung weiter. Übergabe: erst aktiviert.
- **Wartungsvertrag**: Freistunden in den ersten m Wochen (eingerechnet: `umfang.gewaehrleistungH`, Vorgabe aus den
  Einstellungen; im Angebot steckt er anteilig in den Preisen, der Kunde sieht nur „Inklusive n Stunden
  Fehlerbehebung“), Jahrespauschale ab dem 3. Jahr, „Abrechnung nach Zeitaufwand“ als eigener Abschnitt, **Stundensatz**
  (eingefroren beim Aktivieren). Geht NIE in die Übergabe.
- **Alle Rechtstexte sind Entwürfe** — Karte und Vorschau sagen „Entwurf, kein Rechtsrat — vor Verwendung prüfen
  lassen“ (nicht auf dem Papier). Verbindlich Deutsch: der Text bleibt auch in der englischen Oberfläche Deutsch.
- **Sterne der Mitarbeiter** (Reiter Bedarf, am Ende): zwei Zeitpunkte (Bedarf · Abnahme), zuerst auf Papier
  (🖨 Sternebogen zum Ankreuzen, `sterneBogenExtern`), dann nachtragen: Kennung, Fachbereich, Kürzel, 1–5. Am Vorgang,
  nicht an der Fassung (bleibt nach der Unterschrift erfassbar). Bedarfsprotokoll: Ø und Anzahl beim Bedarf; MD: Ø
  und Anzahl je Zeitpunkt, nie Kürzel/Fachbereich. Grundlage des Abnahme-Gesprächs, keine Rechen-Automatik.
- ⚠ Nicht gemessen: Unterschrift mit dem Finger am Tablet, echtes Drucken/„Als PDF speichern“, das Mailprogramm am
  Tablet mit langem `mailto`-Text (manche Programme kürzen lange Texte), die Übergabe-HTML in WorkFloh geöffnet.

Gemessen (2026-10-07, Stufe 3): `kern` **224 grün · 0 ROT** · `browser` **113 grün · 0 ROT** · `NUR_ANKER` 83 · 0 tot ·
neue Fälle `S3` (26): erst **24 gefangen · 2 aus falschem Grund** (zwei Proben stürzten beim fehlenden Teil ab statt zu
melden), beide geschärft und einzeln nachgefahren: gefangen. Voller Lauf über alle 83: **82 gefangen · 0 blind ·
1 aus falschem Grund · 0 tote Anker** — der alte Fall „UEB: Platzhalter bleibt im Kundenfeld“ fing nur noch über den
Cache: seit § 1b decken `kundeExtern` und `rein()` einander. Der Fall nimmt jetzt beide weg, einzeln nachgefahren: gefangen.

## Tomys Hub — Gesamtprogramm (2026-10-07, abends)

Klaus: *„einen Beispielvorgang mit den kompletten Angaben … Tommy's Hub komplettes Programm … was es theoretisch
gekostet hätte“* · *„Beispiel Bilder und PDFs mit einfügen … PDFs und EMLs … bei Tomys Workflow reingepackt“* ·
*„Wofür du keine Daten hast, erfinde welche … auch mit einer gefälschten Unterschrift“*.

- `assets/daten/beispiel-tomys-gesamt.js` (bid `tomys-gesamt`): Tomys Hub als Kunde, alle 18 Bereiche, 4 Fassungen
  (F1 WorkFloh + BookLedgerPro bis 07-03 · F2 Internetseite, Gestalter, Brücke, Tresor bis 07-16 · F3 Netz, Feinschliff,
  BLP-Ausbau bis 09-23 · F4 PDF-Werkzeug, Scanner, Prüfung bis 10-07), alles beauftragt (`grenzeManuell: "keine"`),
  Erklärung/Vereinbarung/Wartung mit erfundenen Unterschriften (`assets/daten/beispiel-unterschriften.js`).
  Ohne eigene Firmendaten steht in den eingefrorenen Blättern „Werkstatt Beispiel“.
- **Ist-Stunden VEREINIGT** über Tomys-Hub (alle), BookLedgerPro (alle), Mein-WorkFloh (bis zum Abzweig 2026-07-04),
  Workflow-PDF und Auslieferung-Pruefer (nur Commits an den Dateien, die byte-gleich in Tomys' WorkFloh stecken):
  **108,6 · 154,3 · 199,9 · 248,4 h** (einzeln addiert 300,6). Gleiche Methode wie `markt.js`, Untergrenze, `--all`,
  Autorzeit. ⚠ Nicht gezählt: Sage-Netz-Module.
- **Tabellen → „Eigene Aufträge“** hat zwei neue Spalten (intern): Schätzung netto und **Ist × Satz netto**
  (`istVergleich` → `istKostenCent`). Bei 80 €: F4 Ist 19.872 € gegen Schätzung 30.324–54.458 €, Angebot 42.071 € netto.
- **Sieben erfundene Anhänge** unter `beispiele/tomys-gesamt/`, gebaut mit `python3 tools/beispiel-dateien.py`
  (Pillow + reportlab): 2 E-Mails (eine mit Foto, eine mit CSV), 2 PDFs, 3 Bilder. Registry-Feld `anhaenge`;
  `beispielLaden` holt sie, hängt sie als Blob mit Typ an (`message/rfc822` für .eml), die Übergabe trägt sie an WorkFloh.
  Im Vorrat (≈ 300 KB). Telefonnummern aus dem Berliner Film-Block 030 23125 …
- Das alte Beispiel `tomys` heißt jetzt „Tomys Hub — nur die Hub-App“.
- Gemessen: kern **254 grün · 0 ROT** · browser **122 grün · 0 ROT** · Gegenprobe `GESAMT:` **7 gefangen · 0 blind**.
  ⚠ Nicht gemessen: ob WorkFloh die .eml beim Import auspackt (das macht WorkFlohs eigener Posteingang, hier nur die Übergabe).

**Beispiele gleich in „Vorgänge“** (Klaus 2026-10-08: *„da rein, wo neue Vorgänge steht, gleich am Anfang … nicht erst in
Einstellungen“*): neben „+ Neuer Vorgang“ stehen Auswahl, „Laden“ und „Alle laden“ (`beispielSteuerung(pre)`, EINE Fassung
für beide Orte; Kennungen `vg-beispiel-*` hier, `beispiel-*` in den Einstellungen). Geladene tragen ✓, vorausgewählt ist das
erste noch nicht geladene. Die Vorgangsliste zeigt bei leerem Kunden „ohne Kunde“/„eigenes Vorhaben“ statt `⟦KUNDE-1⟧`.
Anschrift im Gesamtbeispiel einzeilig (das Feld ist einzeilig). Gegenprobe `VORGÄNGE:` 2 gefangen · browser 127 grün.

**👁 Ansicht der Anhänge** (Klaus 2026-10-08: *„mit einem Auge … als Voransicht größer … ob es die richtigen Dokumente
sind … komplett drauf“*): an jedem Anhang „👁 Ansehen“ (und Tipp aufs Vorschaubild) → Fenster `#ansicht`. Bild groß (Tipp =
Originalgröße) · PDF: alle Seiten mit pdf.js gezeichnet (Android-Chrome zeigt PDFs nicht im Rahmen; Tipp = volle Auflösung) ·
E-Mail: Von/An/Betreff/Datum, Text, Anhänge — die man darin wieder ansehen kann · Text/CSV/HTML/SVG-Quelltext als Text, **nie
ausgeführt**. Sonst „keine Voransicht“ + Speichern. Gemessen: kern 262 · browser 134 grün · Gegenprobe `ANSICHT:` 4 gefangen.
⚠ Am Tablet nicht gemessen (Zeit für große PDFs, Speicher bei vielen Seiten).

**🔎 Erklären an Ort und Stelle** (Klaus 2026-10-08, Bild vom Tablet: *„Die B-Nummern … sind noch nicht als Link … man klickt
an, sieht, ah, okay, B01 bedeutet das … ein X oder so lassen … wie sich der Preis verändert. Und einmal wieder ein Zurück-Button“* ·
*„alle, die aussehen wie ein Link“*): in „2 Umfang“ ist jeder Chip am Baustein ein Knopf — Kennung K-nn, Größe, Faktor
(Offline ×1,15 … Druck / PDF ×1,1 …), deckt B-/O-nn. Ein Tipp öffnet darunter ein Feld (`erklaerFeld`, `[data-erklaer="art:id"]`):
was er bedeutet (Bereich, Text, Priorität, wer ihn sonst abdeckt · Faktor · Katalog-Spanne · Vorlage) und je Möglichkeit
(✕ nicht durch diesen Baustein · ✕ aus allen · ✓ abdecken · Faktor setzen/entfernen · Größe nehmen · Baustein entfernen) die
**Wirkung, vorher gerechnet an einer Kopie der Fassung**: „Angebot netto X → Y (Δ) · Schätzung“. Geändert wird erst auf Tipp.
Über den Bausteinen steht die Preisleiste (`[data-preis-leiste]`: Angebot netto, optional, „vor der letzten Änderung“) und
**↶ Zurück (n)** (`[data-umfang-zurueck]`): bis zu 50 Stände des Umfangs je Vorgang und Fassung, NUR im Speicher (`ZURUECK`).
Auch Menge, Baustein dazu/✕ und die Grenzlinie legen einen Stand ab. In einer unterschriebenen Fassung erklärt das Feld, ändert
nichts (`[data-erklaer-nurlesen]`). ⚠ **Tafel-Evolution, benannt:** bis dahin schaltete ein Tipp auf B-nn/Faktor/Größe sofort um,
und in einer unterschriebenen Fassung waren die Chips gesperrt (Klaus' Tipp tat nichts). Die Abdeckung ändert NICHT die Schätzung,
sondern Priorität/Nutzen und damit die Grenzlinie, also was im Angebot fest oder optional steht — das Feld sagt das.
⚠ Nicht gebaut: Kennungen in der Kosten-Nutzen-Tabelle und in „Bausteine anklicken“ sind weiter nur Anzeige. Am Tablet nicht gemessen.
Gefunden beim Hinsehen, nicht von einer Probe: `karte.append(null)` schrieb „null“ in die Karten — jetzt `anhaengen`, und die
Probe sucht „null“. Gegenprobe `ERKLÄREN:` 7 Fälle: erst **4 gefangen · 3 aus falschem Grund** (Probe wartete 30 s auf Fehlendes),
geschärft: **7 gefangen**. Cache v16, `app.js?v=9`, `app.css?v=8`, `texte.js?v=7`.

**✎ Neue Fassung zum Ändern — gleich im Banner** (Klaus 2026-10-08: *„Grenzlinie automatisch … funktioniert nicht mehr“* —
er stand in einer unterschriebenen Fassung, dort ist sie gesperrt; *„sie sollte als eine neue Fassung gebaut werden können …
beim Duplizieren sollten die Unterschriften wieder gelöscht werden“*): in jeder unterschriebenen aktuellen Fassung steht unter dem
Nur-lesen-Banner Anlass (vorbelegt „Anpassung im Umfang“), von wem (Vorgabe Betrieb) und `#neue-fassung-hier`. Das ist
`F.neueFassung`: Kopie mit `unterschrieben: null`, `ust: null` — offen, sofort änderbar, später im Angebot neu unterschreiben;
die alte bleibt unterschrieben. Rechtsblätter am Vorgang (Erklärung, Vereinbarung, Wartung) bleiben, wie sie sind.
Der Satz im Erklär-Feld hat vier Lagen (`data-erklaer-lage`): an · nicht allein („Auch abgedeckt von“) · nur dieser
(„Ohne ihn bleibt der Punkt offen“) · nicht eingeplant, deckt schon K-nn · offen. „deckt“ heißt jetzt „deckt (hervorgehoben):“.
Gegenprobe `ERKLÄREN:` 9 gefangen. Cache v17, `app.js?v=10`, `texte.js?v=8`.

**Voller Gegenprobe-Lauf über `main` nach #6–#9** (2026-10-08, Stand `6319fab`, Wegwerf-Kopien, echter Baum vor/nach gleich):
**95 gefangen · 0 blind · 1 aus falschem Grund · 0 tote Anker** (96 Fälle). Der eine: „GESAMT: Beispiel-Dateien werden nicht
angehängt“ — die Ansicht-Proben klickten auf fehlende Anhänge und stolperten. `oeffne` meldet jetzt, und der Ansicht-Block läuft
nur mit sieben Anhängen; nachgefahren: gefangen. Danach: kern **262** · browser **152** grün · `NUR_ANKER` **103 · 0 tot**.

⚠ **Pages-Bau brach nach #10 ab** (2026-10-08): `git add -A` aus einer Arbeitskopie nahm den Verweis `node_modules → ../…`
mit — `.gitignore` hieß `node_modules/` und sperrt mit Schrägstrich nur ein Verzeichnis, keinen Verweis. Jekyll stieg mit
`No such file or directory … /node_modules` aus, die Seite blieb auf v14. Verweis entfernt, `.gitignore` ohne Schrägstrich,
Wächter `PAGES:` in `tests/kern.mjs`. **Nach jedem Merge den Lauf „pages build and deployment“ ansehen.**

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

Zuletzt gemessen (2026-10-07, Stufe 2): `kern` **133 grün · 0 ROT** · `browser` **90 grün · 0 ROT** ·
Gegenprobe, voller Lauf **57 gefangen · 0 blind · 0 aus falschem Grund · 0 tote Anker**. Vorher einzeln
gefahren: zwei neue Fälle waren erst „aus falschem Grund“ (die Probe stürzte bei fehlendem Blob bzw.
fehlendem Download-Knopf ab) — beide Proben geschärft und nachgefahren.

Davor (2026-10-07, Endstand Stufe 1): `kern` **104 grün · 0 ROT** · `browser` **62 grün ·
0 ROT** · Gegenprobe **36 gefangen · 0 blind · 0 aus falschem Grund · 0 tote Anker**. Beim
ersten vollen Lauf: 34 gefangen, 2 aus falschem Grund (ein Sabotage-Fall ließ die Probe
abstürzen statt rot zu werden; die Offline-Probe stolperte), beim Nachfahren war der
Offline-Fall **blind** (siehe oben) — alle drei geschärft und nachgefahren.

## Netzweit

Freibrief zum Selbst-Mergen · frisch von `origin/main` · Ton · kein PII · Ehrlichkeit:
[Sage-Protokol/docs/NETZWEIT.md](https://github.com/lausiklauskn-png/Sage-Protokol/blob/main/docs/NETZWEIT.md)
