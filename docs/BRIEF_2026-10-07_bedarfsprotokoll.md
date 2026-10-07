# BRIEF · Bedarfsprotokoll mit Schätzung, Fassungen und Angebot (PWA)

Stand: 2026-10-07 · Absender: Sitzung „Fahrplan / Marktanalyse" · Ziel-Repo: **`lausiklauskn-png/Workflow-Needs`** (neu, von Klaus angelegt) · Adresse: https://lausiklauskn-png.github.io/Workflow-Needs/
Ersetzt: `BRIEF_bedarfsblatt-rechner.md` (der vermischte Bedarf, Schätzung und Angebot in einem Blatt).

## 1 · Auftrag (Klaus' Wortlaut, gekürzt)

> „Ein Bedarfsblatt mit allem drum und dran … inklusive Plan für die Umsetzung oder
> Testphase … je nach Größe … automatisch je nach Umfang die Zeit verändern … aus meinen
> Daten ziehen … App für das Scannen von Dokumenten: Entwicklung sehr kurze Zeit, Kosten
> sehr gering, nur die Anpassung an die Firma etwas mehr. Alles Schätzung, kann manuell
> geändert werden … PWA zum Kalkulieren … Preis, was sinnvoll ist auf dem Markt, Tabellen
> im Hintergrund … wie die Kalkulation in BookLedgerPro. Design technisch hervorragend,
> Buttonkonstruktion nicht 0815 … Ausdrucken des Angebotes mit Unterschriftsfeld …
> eingetragene Firma."

Und dazu (2026-10-07, zweite Nachricht):

> „… während des Produktionsprozesses stellt man fest: da ist etwas sehr Wichtiges, was
> noch angepasst werden muss … ein Protokoll zum Anklicken oder Ändern, sodass du, wenn
> ich dir das Protokoll hineingebe, sofort weißt, was wir ändern müssen, was wir neu bauen
> müssen. Wie eine Anweisung oder ein MD-Protokoll im Hintergrund … der Kunde wollte eine
> Internetseite, jetzt zwei, dann klicke ich zwei an. Wie bei Alis Moderaum, wo plötzlich
> ein Warenwirtschaftssystem dazukam … ich klicke den Umfang an, geschätzte Stunden,
> Aufwand … Natürlich habe ich es vorher in den Auslieferungsprüfer geschickt … der Kunde
> weiß: wenn ich nochmal unterschreibe, wird es teurer, aber ich weiß, was ich bekomme …
> vielleicht auch nach unten … ich klicke, klicke, klicke und am Ende steht, was es kosten
> kann … an der Stelle könnten wir aufhören … Kosten-Nutzen-Verhältnis … wenn die Kosten
> den Nutzen übersteigen."

Und zum Stundensatz (2026-10-07, dritte Nachricht):

> „Mach mal 80 Euro die Stunde, das ist sinnvoller. 80."

**Kurz:** Eine installierbare PWA mit drei getrennten Stufen.

| Stufe | Inhalt | Ausdruck |
|---|---|---|
| **1 · Bedarfsprotokoll** | Klaus' 18 Bereiche (Abschnitt 4), lösungsneutral, **ohne Preis** | eigenes Dokument, vom Kunden bestätigt |
| **2 · Umfang und Schätzung** | aus Stufe 1 abgeleitet: Bausteine anklicken, Stunden, Preis, Nutzen | intern |
| **3 · Angebot** | Positionen, Preis, Unterschriften, **ohne** interne Sätze | an den Kunden |

Dazu **Fassungen** (Abschnitt 7): jede Änderung während des Baus ergibt eine neue Fassung mit
Änderungsliste, Preisunterschied, Nachtrag zum Unterschreiben **und** einer MD-Datei, aus der
eine Sitzung sofort abliest, was neu zu bauen, anzupassen oder zu entfernen ist.

## 2 · Pflichtlektüre (in dieser Reihenfolge)

1. `Sage-Protokol/docs/NETZWEIT.md`: Freibrief, frisch von `origin/main`, Ton, kein PII, Ehrlichkeit.
2. `BookLedgerPro` (`origin/main`!): `src/domain/money.js` (Cent-Rechnung, `parseEuroToCents`,
   `formatEuro`) und `src/domain/angebote.js` (**PRIME DIRECTIVE**: interne Kalkulation
   verlässt das Haus nie; das Außendokument wird per **Whitelist** gebaut, `externesAngebot`).
   Dazu `docs/KALKULATION_KATALOG.md`. **Lesen und übernehmen, nicht importieren.**
3. Glas-Knöpfe: `Tomys-Hub/tomy-ui/theme.css` (`.btn` mit `::before`/`::after`, der Glanzpunkt
   folgt `--mx/--my`) und der Marktplatz in `family-project`. Vorlage für „nicht 0815".
4. `Sage-Protokol/assets/installieren.js`: Installieren-Knopf.
5. **Kundendaten verdecken (Abschnitt 7e):** `Sage-Protokol/src/modules/25_pseudonym.js`
   (byte-1:1 kopieren, SHA pinnen) und wie der **Sende-Prüfer** es benutzt: `Sende-Pruefer/CLAUDE.md`
   § „Der Prüfkern ist Sage-Modul 25" und in `sende-pruefer.html` die Funktionen `finde`,
   `verdecke`, `aufdecken`, `hinaus` sowie die letzte Sicherung vor dem Hinausgehen.
   Dazu `assets/namensvorschlag.js` (Namen nur als Vorschlag). **Übernehmen, nicht neu erfinden.**
6. `Alis-Moderaum/CLAUDE.md`: der echte Fall „Boutique-Seite, dann Warenwirtschaft dazu" — Vorlage
   für den Testfall in Abschnitt 12 (nur den **Ablauf** übernehmen, keine Kundendaten).
7. Diese Datei.

## 3 · Klaus' Definition — die Grundlage, nicht verhandelbar

Das Bedarfsprotokoll ist eine strukturierte Dokumentation zur Erfassung, Beschreibung und
Bewertung eines bestehenden oder zukünftigen Bedarfs im Bereich Digitalisierung, IT-Systeme,
Apps, Websites, Software oder Geschäftsprozesse. Es beschreibt **nicht** die technische
Umsetzung, sondern beantwortet: **Was wird benötigt, warum, wer benötigt es, welche
Anforderungen ergeben sich daraus?**

Kette: **IST-Zustand → Problem/Schwachstelle → Bedarf → SOLL-Zustand → Anforderungen → Priorität/Nutzen.**

Abgrenzung: kein Programmierauftrag, kein Lastenheft, kein Pflichtenheft, kein Software-,
Architektur-, Datenbank- oder UI/UX-Konzept, kein Entwicklungsplan. Es ist die fachliche
Grundlage dafür. Reihenfolge der Fragen: *Was wird im Betrieb benötigt und warum?* →
*Was muss eine mögliche Lösung können?* → *Wie wird sie technisch umgesetzt?*

**Folge für den Bau:**
- Stufe 1 enthält **keine** Technikwahl, **keine** Stunden, **keinen** Preis. Ein Wächter prüft das
  am Ausdruck (Abschnitt 11).
- Stufe 2 darf aus Stufe 1 **Vorschläge** ableiten (z. B. „Schnittstelle zur Buchhaltung" → Baustein
  „Schnittstelle"), schreibt aber **nie** in Stufe 1 zurück.
- Die Definition steht wörtlich in der App (Hilfe/Erklärung zu Stufe 1).

## 4 · Stufe 1 · die 18 Bereiche

Jeder Bereich ist ein Abschnitt mit Freitext **und**, wo es sich anbietet, Auswahlknöpfen
(schneller beim Kunden, trotzdem frei ergänzbar). Jeder Eintrag bekommt eine **feste Kennung**
(`B-01`, `B-02` …), die über alle Fassungen gleich bleibt — daran hängt die Änderungsliste.

| Nr | Bereich | Auswahl-Vorschläge (Beispiele) |
|---|---|---|
| 1 | Ausgangssituation (IST) | Papier · Excel · E-Mail · alte Software · nichts |
| 2 | Betroffener Prozess | Auftrag · Lager · Buchhaltung · Termin · Kundenkontakt · Dokumente |
| 3 | Nutzer / Beteiligte | Rollen + Anzahl (Zähler +/−) |
| 4 | Problem / Schwachstelle | doppelte Eingabe · Fehler · Zeitverlust · fehlende Übersicht |
| 5 | Ursache | Freitext |
| 6 | Bedarf | Freitext, je Bedarf ein Eintrag mit Kennung |
| 7 | Ziel (SOLL) | Freitext |
| 8 | Funktionaler Bedarf | Liste „das System muss …", je Zeile eine Kennung |
| 9 | Organisatorischer Bedarf | Schulung · Rollen · Abläufe ändern |
| 10 | Technischer Bedarf | Geräte · offline · mehrere Standorte (fachlich, **keine** Technikwahl) |
| 11 | Bestehende Systeme | Liste |
| 12 | Schnittstellen | „muss Daten austauschen mit …" |
| 13 | Daten | welche, wie viele, woher |
| 14 | Datenschutz / Sicherheit | personenbezogen ja/nein · wer darf was |
| 15 | Rahmenbedingungen | Termin · Budget-Rahmen (nur als Angabe des Kunden) · Vorgaben |
| 16 | Priorität | je Bedarf: **Muss · Soll · Kann** |
| 17 | Erwarteter Nutzen | je Bedarf: Zeit gespart/Monat, Fehler weniger, Umsatz — **Angabe des Kunden** |
| 18 | Offene Punkte | Liste, je Punkt „wer klärt bis wann" |

Der Ausdruck von Stufe 1 trägt Datum, Fassung, „Bestätigt durch" mit **zwei** Unterschriftsfeldern.

### 4b · Der Kunde bekommt das Protokoll — ohne das, was nur für Klaus ist

Klaus (2026-10-07): *„Das Protokoll soll für den Kunden ausdruckbar sein, aber bestimmte Punkte,
die für mich wichtiger sind als für ihn, sollen nicht zu sehen sein. Er soll das Protokoll
bekommen. Alles, was wichtig ist für ihn, soll in dem Protokoll als PDF ausdruckbar sein."*

- **Jeder Eintrag und jeder Bereich trägt einen Schalter „👁 für den Kunden" / „🔒 nur für mich".**
  Vorgabe: **für den Kunden** — das Protokoll ist sein Dokument. Welche Punkte intern sind,
  entscheidet Klaus je Vorgang; die App rät das nicht.
- Dazu je Bereich ein Feld **„Interne Notiz"** (Eindruck, Einschätzung, Gesprächsnotiz), das
  **immer** intern ist und keinen Schalter hat.
- Interne Einträge stehen in der App sichtbar abgesetzt (Schloss, gestrichelter Rand, Hinweis
  „erscheint nicht im Kundenausdruck") — nicht nur farbig.
- **Zwei Dokumente mit zwei Namen** (Klaus 2026-10-07: *„Analyse ist die Analyse für mich. Das
  Protokoll ist das Protokoll für den Kunden."*). Die Namen sind nicht austauschbar — ein Blatt,
  das „Bedarfsanalyse" heißt, geht nie an den Kunden:
  - **„🖨 Bedarfsprotokoll"** (für den Kunden) — nur Freigegebenes, mit Firmendaten im Kopf, Datum, Fassung, zwei
    Unterschriftsfeldern. Ein Bereich, in dem alles intern ist, fällt ganz weg (keine leere
    Überschrift).
  - **„🖨 Bedarfsanalyse"** (für Klaus) — alles, samt internen Punkten und Notizen, deutlich
    überschrieben „Bedarfsanalyse — INTERN, nicht an den Kunden". Auch Stufe 2 (Umfang,
    Schätzung, Kosten-Nutzen) heißt in der App **Analyse** und druckt unter diesem Namen.
- **PDF:** über das Druckfenster des Browsers („Als PDF speichern"), A4, schwarz auf weiß. Vor dem
  Druck eine **Vorschau genau dessen, was der Kunde bekommt**, mit der Zeile „N Punkte sind
  ausgeblendet" (nur in der Vorschau, nie auf dem Blatt).
- **Gebaut per Whitelist**, wie das Angebot: der Kundenausdruck wird aus den freigegebenen
  Einträgen neu zusammengesetzt, nicht aus der Ansicht durch Verstecken (`display:none` im
  Druck-CSS ist **kein** Schutz — die PDF-Textebene oder ein Kopieren trüge es weiter).
- **Kennungen:** der Kundenausdruck zeigt die Kennungen (`B-…`), damit Angebot und Nachtrag
  darauf verweisen können. Lücken (B-03 fehlt, weil intern) bleiben stehen — benannte Entscheidung
  der Bau-Sitzung; Klaus kann sie überstimmen (dann fortlaufend nummerieren, Zuordnung intern).
- Die Freigabe gehört zur **Fassung**: eine unterschriebene Fassung friert auch fest, was der
  Kunde gesehen hat; der Vergleich nennt es, wenn ein Punkt zwischen Fassungen sichtbar/intern
  wurde.
- **Proben:** ein interner Eintrag mit auffälligem Text (z. B. „INTERN-PRUEFWORT-7Q") darf im
  Kundenausdruck **weder sichtbar noch im DOM des Druckblatts** stehen; die interne Notiz
  ebenso; in der Bedarfsanalyse stehen beide; der Kundenausdruck trägt nirgends das Wort „Analyse", die Analyse nirgends „Bedarfsprotokoll" als Titel. Gegenprobe: Freigabe-Schalter wird
  ignoriert · interne Notiz rutscht in den Kundenausdruck · Verstecken nur per CSS statt Whitelist.

## 5 · Stufe 2 · Umfang und Schätzung (intern)

### 5a · Bausteine anklicken

Ein **Baustein-Katalog** (Datendatei `assets/daten/bausteine.js`, in der App unter „Tabellen"
bearbeitbar). Klaus klickt an, was der Kunde braucht, und stellt den Umfang ein:

- **Menge** per Zähler (+/−): „Internetseite ×1" → „×2".
- **Größe** je Baustein: klein · mittel · groß (je eine Stundenspanne in der Tabelle).
- **Unbekannter Baustein:** Freitext „Warenwirtschaftssystem" → wird als **neuer Baustein** angelegt,
  steht mit „noch nicht geschätzt" da (gelb), bis Klaus Größe oder Stunden setzt. **Keine geratene Zahl.**
- Jeder Baustein verweist auf die **Bedarfs-Kennungen** aus Stufe 1, die er erfüllt (`deckt: B-06, B-08`).
  Ein Bedarf ohne Baustein wird angezeigt („B-09 ist noch nicht abgedeckt").

Startkatalog (Vorschlag, jeder Wert änderbar):

| Baustein | Vorlage im Netz | Wiederverwendung |
|---|---|---|
| Internetseite / Landing-Page | Mein-Rezeptbuch-Page, Workfloh-PDF-Page | 50 % |
| Online-Shop / Schaufenster | Alis-Moderaum, Perfect-Skin-Fashion | 40 % |
| Warenwirtschaft / Lager | Alis-Moderaum (Warenwirtschaft) | 40 % |
| Dokumente scannen / PDF ausfüllen | Workflow PDF | 70 % |
| Text vor KI prüfen | Sende-Prüfer | 70 % |
| Datei / Anhang prüfen | Auslieferungsprüfer | 70 % |
| Dateien sicher weitergeben | Datei-Post | 60 % (Server nötig) |
| Kurznachrichten / Bilder intern | Kim-sync | 50 % |
| Liste / Notizen | Küchenzettel | 60 % |
| Aufträge / Zeiterfassung | Mein WorkFloh | 50 % |
| Rechnung / Buchhaltung | BookLedgerPro | 40 % |
| Pinnwand / Fragen | Kimboard | 50 % |
| Daten durchsuchen (offline) | Company Brain | 40 % |
| Schnittstelle zu fremdem System | – | 0 % |
| Datenübernahme aus Altbestand | – | 0 % |
| Neu, ohne Vorlage | – | 0 % |

Die Vorlage-Zuordnung ist **meine Einschätzung**, nicht gemessen. Die Sitzung prüft je Zeile,
ob die genannte App die Funktion wirklich hat, und schreibt sonst „keine Vorlage".

### 5b · Schätzmodell

```
je Baustein:
  Stunden   = Größe.spanne (von Tabelle) × Menge
  − Wiederverwendung (Anteil, Quelle genannt)
  × Faktoren (Offline, Mehrsprachig, KI, Druck/PDF, mehrere Nutzer, Server) — ankreuzbar, ×1,0…×1,6
Summe aller Bausteine
+ Firmenanpassung (Logo/Farben, Begriffe, Felder) in Stunden
+ Abstimmung/Doku (% der Summe, Vorgabe 15 %)
+ Puffer (% der Summe, Vorgabe 20 %, sichtbar)
= Stunden (von–bis)
```

Jede Rechenzeile ist aufklappbar zu sehen. Jede Zahl ist überschreibbar und dann markiert
(`data-manuell`); „↺ Vorgabe" setzt zurück. Kalibrierung: Abschnitt 9.

### 5c · Preis

- Geld **nur in Cent** (Muster `money.js`). **Stundensatz: 80 € netto (8000 Cent)**,
  Klaus' Vorgabe vom 2026-10-07. Er steht als **Vorgabe** in den Einstellungen und ist dort
  änderbar. Er bleibt **intern** (PRIME DIRECTIVE, Abschnitt 6).
- **Der Satz variiert je Auftrag** (Klaus 2026-10-07: „Die Stundenpreise können variieren …
  dass ich mal für weniger arbeite oder auch für mehr. Das sollte dann eingetragen werden
  können."). Drei Ebenen, die genaueste gewinnt:
  1. **Einstellungen** — die Vorgabe (80 €) für jeden neuen Vorgang;
  2. **Vorgang** — eigener Satz im Reiter „2 Umfang", oben, deutlich sichtbar
     („Stundensatz für diesen Auftrag: 65 € · Vorgabe 80 €", ↺ zurück zur Vorgabe);
  3. **Baustein** — optional ein eigener Satz für einzelne Arbeit (z. B. Gestaltung teurer
     als Datenpflege), sonst gilt der Satz des Vorgangs.
  Wo ein Satz von der Vorgabe abweicht, steht das sichtbar mit beiden Zahlen da; der Rechenweg
  nennt je Zeile, welcher Satz galt. **Ein neuer Vorgang übernimmt die aktuelle Vorgabe als
  eigenen Wert** — ändert Klaus später die Vorgabe, bleiben bestehende Vorgänge unverändert.
- **Jede Fassung friert ihren Satz ein** (wie die USt): Nachtrag F3 rechnet mit dem Satz von F3;
  der Vergleich F2 → F3 nennt eine Satzänderung als eigene Zeile („Satz 80 → 70 €: −X €"),
  damit ein Preisunterschied nicht wie mehr oder weniger Arbeit aussieht. Eine unterschriebene
  Fassung behält ihren Satz für immer.
- Drei Sichten nebeneinander, beschriftet als **Orientierung, nicht Messung**: kostenbasiert
  (Stunden × Satz) · marktüblich (Tabelle `markt.js`, mit Quelle und Datum, sonst „Annahme") ·
  Auftragsbau-Modell (einmalig + Pflege/Monat).
- **Startwerte für `markt.js`** (Klaus 2026-10-07: Vorschlag aus dem Fahrplan übernehmen).
  Jede Zeile trägt `quelle: "Fahrplan 2026-10-07, Schätzung, nicht gemessen"` und ist in den
  Einstellungen bzw. im Reiter „Tabellen" änderbar:

  | Posten | Spanne netto | Art |
  |---|---|---|
  | Kleine Fachanwendung für einen Betrieb, am Markt | 3.000–15.000 € | einmalig |
  | Fachanwendung im eigenen Vorgehen (vorsichtig) | 1.500–5.000 € | einmalig |
  | Pflege dazu | 20–50 € | je Monat |
  | Einrichtung und Anpassung (Formulare, Logo, Felder, Schulung) | 300–1.500 € | einmalig |
  | Firmenseite nach Vorlage einrichten | 400–900 € | einmalig |
  | Abo-Paket für Betriebe | 15–29 € | je Monat |
  | Domain | ca. 15 € | je Jahr |

  Die Markt-Sicht zeigt die Spanne **neben** der kostenbasierten Rechnung und entscheidet nichts.
  Liegt der kostenbasierte Preis außerhalb der Spanne, steht das als Hinweis da (darüber/darunter),
  ohne Wertung und ohne den Preis zu ändern.
- USt-Schalter: § 19 UStG (Kleinunternehmer) **oder** Regelbesteuerung, **in den Einstellungen
  frei wählbar** (Klaus 2026-10-07: „manuell einstellbar für andere Firmen zu nutzen"). Die App
  soll auch für andere Firmen taugen, deshalb ist hier nichts fest eingetragen. Regelsatz als
  Zahl einstellbar (Vorgabe 19 %), dazu ermäßigt 7 % je Position wählbar. Bei § 19 steht auf
  Angebot und Nachtrag der Hinweis „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet" und
  keine USt-Zeile. Bei Regelbesteuerung stehen Netto, USt je Satz und Brutto da.
  Die Einstellung gehört zum Vorgang, in dem sie gilt: Eine **unterschriebene Fassung behält
  ihren Satz**, auch wenn die Einstellung später wechselt.

### 5d · Kosten-Nutzen und „hier aufhören"

Klaus: *„an der Stelle könnten wir aufhören … wenn die Kosten den Nutzen übersteigen."*

- Je Baustein: **Kosten** (aus 5b/5c) und **Nutzen** (aus Stufe 1, Bereich 17, über die
  Bedarfs-Kennungen; Zeit gespart × Stundenwert des Kunden, oder Euro direkt). Fehlt der Nutzen,
  steht „Nutzen nicht angegeben" — **keine** Null.
- Liste nach **Priorität** (Muss zuerst), innerhalb der Priorität nach **Nutzen ÷ Kosten**.
- Eine **laufende Summe** von oben nach unten: „bis hier: 6 400 € · Nutzen 9 800 €/Jahr ·
  rechnet sich nach 8 Monaten".
- **Grenzlinie:** ab dem ersten Baustein, dessen Kosten seinen Nutzen im gewählten Zeitraum
  (Vorgabe 24 Monate, änderbar) übersteigen, wird die Zeile markiert: „ab hier übersteigen die
  Kosten den Nutzen". Klaus kann die Linie verschieben; Bausteine darunter wandern als
  „später / optional" ins Angebot oder fallen weg.
- Grafik: Kosten- und Nutzenkurve über die kumulierte Liste, der Schnittpunkt markiert.
- ⚠ Beschriftung: „Nutzen = Angabe des Kunden, Kosten = Schätzung". Beides keine Messung.

## 6 · Stufe 3 · Angebot und Druck

- `@media print` + `window.print()`: A4, Kopf mit **Firmendaten aus den Einstellungen** (Name,
  Anschrift, Kontakt, USt-ID/Steuernr., Bank, Logo optional).
- Kunde, Angebotsnummer `AN-JJJJ-NNNN` (frei, nicht GoBD), Datum, gültig bis, Positionen,
  Netto/USt/Brutto bzw. § 19-Satz, Phasenplan kurz, „Alle Zeitangaben sind Schätzungen",
  Verweis auf die Fassung des Bedarfsprotokolls, auf der das Angebot beruht.
- Optional „später / optional"-Block mit den Bausteinen unter der Grenzlinie.
- **Zwei Unterschriftsfelder** (Auftraggeber · Auftragnehmer, Ort/Datum/Unterschrift).
- ⛔ **PRIME DIRECTIVE:** Stundensatz, Faktoren, Wiederverwendung, Markt-Tabellen und
  Kosten-Nutzen-Rechnung erscheinen **nie** auf dem Kundenausdruck. Außendokument per **Whitelist**.
- ⛔ **Kein PII im Repo:** Firmen- und Kundendaten nur lokal; im Depot nur erfundene Beispiele.

## 7 · Fassungen, Nachtrag und das Änderungsprotokoll (MD)

Das ist der Kern von Klaus' zweiter Nachricht.

### 7a · Fassungen

- Ein Vorgang (Kunde + Projekt) hat **Fassungen**: F1, F2, F3 … Jede Fassung ist ein vollständiger
  Stand aller drei Stufen. Eine **unterschriebene** Fassung ist eingefroren (nur lesen); Änderungen
  erzeugen eine neue.
- Jede neue Fassung verlangt: **Anlass** (Freitext, z. B. „Kunde wünscht zweite Seite"),
  **von wem** (Kunde · Betrieb · Befund beim Bau), Datum.
- Ansicht **„Vergleich F(n−1) → F(n)"**: je Eintrag **neu · geändert · entfallen · gleich**,
  farbig und mit Symbol (nicht nur Farbe). Stunden- und Preisunterschied je Baustein und gesamt,
  **in beide Richtungen** (es kann billiger werden).

### 7b · Nachtrag zum Unterschreiben

Druck „Nachtrag zu AN-… (Fassung n)": nur die Änderungen, alter und neuer Gesamtpreis,
Unterschied, neuer Termin, zwei Unterschriftsfelder. Gleiche PRIME DIRECTIVE wie das Angebot.
Satz für den Kunden: *„Mit Ihrer Unterschrift gilt Fassung n. Sie wissen damit, was Sie bekommen
und was es kostet."*

### 7c · Änderungsprotokoll als MD — die Anweisung an die nächste Sitzung

Knopf **„📄 Bauauftrag (MD) speichern"**. Er erzeugt eine Markdown-Datei, die Klaus (nach dem
Auslieferungsprüfer) in eine Sitzung gibt. Eine Sitzung muss daraus **ohne Rückfrage** ablesen
können, was zu tun ist. Festes Format:

```markdown
---
art: bauauftrag
format: 1
vorgang: V-2026-0007
fassung: 3
vorher: 2
datum: 2026-10-07
kunde: "⟦KUNDE-1⟧"        # immer Platzhalter, Abschnitt 7e
verdeckt: ja              # nein nur bei „eigenes Vorhaben" (7e)
repo: "Workflow-Needs"
---

# Bauauftrag · Fassung 3 (vorher 2)

**Anlass:** Kunde wünscht zusätzlich eine Warenwirtschaft.  ·  **von:** Kunde

## Zu tun (für die Sitzung)
| Aktion | Kennung | Was | Größe | Stunden (Schätzung) | deckt Bedarf |
|---|---|---|---|---|---|
| NEU BAUEN | K-07 | Warenwirtschaft / Lager | mittel | 18–26 | B-11, B-12 |
| ANPASSEN  | K-02 | Internetseite ×1 → ×2 | klein | +4–6 | B-06 |
| ENTFERNEN | K-05 | Newsletter | – | −3 | – |
| UNVERÄNDERT | K-01, K-03, K-04 | – | – | – | – |

## Bedarfsprotokoll – Änderungen
- NEU B-11: „Lagerbestand je Artikel sehen" (Muss, Nutzen: 3 h/Woche)
- GEÄNDERT B-06: „eine Seite" → „zwei Seiten (Boutique, Kurse)"
- ENTFALLEN B-09: Newsletter

## Offene Punkte
- O-03: Welche Kasse ist im Laden? (klärt Kunde bis 2026-10-14)

## Summe
Stunden F2 32–41 → F3 51–70 · Kosten-Nutzen: Grenzlinie nach K-07

## Vollständiger Stand (zum Nachschlagen)
… alle Bausteine und Bedarfe der Fassung 3 mit Kennung …
```

Regeln dazu:
- **Kennungen sind stabil** (`B-`, `K-`, `O-`), nie neu nummeriert; entfallene bleiben als
  „ENTFALLEN" stehen.
- Aktionen nur aus dieser geschlossenen Liste: **NEU BAUEN · ANPASSEN · ENTFERNEN · UNVERÄNDERT**,
  dazu **NOCH NICHT GESCHÄTZT** für Bausteine ohne Zahl.
- **Stunden und Euro sind je Datei frei wählbar** (Klaus 2026-10-07: „beides. frei wählbar nach
  Situation"). Zwei Haken direkt am Knopf „📄 Bauauftrag (MD) speichern", für jeden Export neu:
  **„Stunden mitnehmen"** und **„Euro mitnehmen"**. Vorgabe: Stunden an, Euro aus — die Datei geht
  meist in einen Chat, und dort gehört die Kalkulation nur hin, wenn Klaus es für diese Situation
  will. Der Kopf der MD sagt, was drinsteht (`stunden: ja|nein`, `euro: ja|nein`), damit die
  nächste Sitzung nicht rät, ob ein fehlender Betrag „null" oder „weggelassen" heißt.
  Mit „Euro" kommen Preis je Baustein und Summe netto mit; **der Stundensatz selbst steht auch
  dann nicht in der Datei** (er ist aus Preis ÷ Stunden zwar ablesbar — das sagt der Haken in
  seinem Hinweis). Ohne „Stunden" fallen Spalte und Summe weg, die Aktionen bleiben.
- **Kundendaten stehen nie in der MD** — sie werden durch Platzhalter ersetzt, Abschnitt 7e.
  ⚠ Tafel-Evolution, benannt: hier stand ein Haken „Klarnamen mitnehmen" (Vorgabe aus). Er
  **entfällt** (Klaus 2026-10-07: „dann soll keine Kundendaten da drin stehen"). Im Kopf heißt das
  Feld `kunde: "⟦KUNDE-1⟧"` statt `"[Kunde]"`, und neu steht dort `verdeckt: ja|nein`.
- Die MD ist **reiner Text ohne HTML**; der Auslieferungsprüfer soll daran nichts zu melden haben.
  Eine Probe schickt die erzeugte Datei durch `PrueferMail.pruefeMail` (KI-Anweisung,
  unsichtbare Zeichen) und erwartet **null** Befunde.
- Zusätzlich **„↥ Bauauftrag einlesen"**: dieselbe MD (oder das JSON aus der Sicherung) lässt sich
  wieder laden. Die App prüft Kopf (`art: bauauftrag`, `format: 1`) und lehnt Fremdes mit Grund ab.

### 7e · Kundendaten gehen nie hinaus — Platzhalter hin, Klartext zurück (Klaus 2026-10-07)

> *„Es dürfen keine Kundendaten zu sehen sein. Die müssen ausgeblendet werden. Das wird automatisch
> gemacht mit der Technik, die wir bereits in anderen Apps eingebaut haben. Und die Ausgabe erfolgt
> dann wieder mit Kundendaten … Wenn ich sie dann wieder einfüge in die App, dann erscheinen sie
> wieder. So kann ich immer arbeiten, ohne dass ich den Datenschutz verletze."*

**Das Ziel des ganzen Protokolls ist die Bauauftrags-MD**, die Klaus in eine Claude-Sitzung gibt,
die daraus die App baut. Deshalb gilt für **jeden** Weg nach draußen (MD speichern, MD kopieren,
Teilen) dieselbe Tür:

| | |
|---|---|
| **Technik** | **Sage-Modul 25** (`modules/25_pseudonym.js`, byte-1:1, SHA-gepinnt), genau wie im Sende-Prüfer. Keine eigenen Muster in dieser App |
| **Was verdeckt wird** | (1) **alle Kundenfelder** des Vorgangs (Firma, Ansprechpartner, Anschrift, Mail, Telefon, Kundennummer …) — die App kennt sie und reicht sie als bekannte Werte an Modul 25; (2) was Modul 25 im **Freitext** der 18 Bereiche findet (Mail, Telefon, IBAN, Schlüssel, Datum, Rechnungsnummer …); (3) Namen im Freitext, die die Sitzung als **Vorschlag** zeigt (`suggestNames`) — erst ein Tipp verdeckt sie |
| **Platzhalter** | `⟦KUNDE-1⟧`, `⟦NAME-2⟧`, `⟦MAIL-1⟧` … je Vorgang **stabil über alle Fassungen**: dieselbe Firma heißt in F1 und F5 gleich, damit eine Sitzung über Wochen denselben Kunden wiedererkennt |
| **Zuordnung** | Platzhalter ⟷ Klartext liegt **nur auf dem Gerät** (IndexedDB, am Vorgang). Sie steht nie in der MD, nie im Teilen-Text |
| **Zurück** | „↥ Bauauftrag einlesen" und ein Feld **„Antwort einfügen"** (was die Sitzung zurückgibt): die App ersetzt die Platzhalter wieder durch die echten Daten — auf dem Schirm und im Druck. Ein Platzhalter, den die App nicht kennt, bleibt stehen und wird **genannt**, nicht geraten |
| **Von Hand nachtragen** | Klaus 2026-10-07: *„Sachen, die nicht erkannt werden oder Namen, die nicht erkannt werden, können manuell eingefügt werden. Dann wird es erkannt."* Am Vorgang ein Feld **„Weitere Namen und Begriffe"** (eine Zeile je Eintrag, Komma im Namen erlaubt) — **dasselbe Muster wie „Weitere Namen" im Sende-Prüfer** (`mailNamen`, `namensvorschlag.js`), dort nachlesen statt neu erfinden. Ein Eintrag wird an Modul 25 als bekannter Wert gereicht und **überall** verdeckt, auch rückwirkend in allen Fassungen. Ein Tipp auf einen Vorschlag trägt ihn hier ein. Workflow PDF und der Auslieferungsprüfer kennen dasselbe Prinzip (Begriffe, die das Muster nicht findet, gibt der Nutzer selbst vor) |
| **Letzte Sicherung** | vor dem Hinausgehen läuft Modul 25 **noch einmal** über das fertige Ergebnis. Findet es dann noch etwas, geht **nichts** hinaus, die Fundstelle wird gezeigt (wie im Sende-Prüfer) |
| **Fehlt Modul 25** | dann geht nichts hinaus — kein Speichern, kein Kopieren, mit Hinweis. Nie still im Klartext |

**Kundendaten kommen später, die Platzhalter von Anfang an.** Klaus: *„erst später kommt dann die
Frage dazu, welcher Kunde … die sollen dann später eingetragen werden. Es sollen immer Platzhalter
sein dafür."* Ein Vorgang lässt sich **ohne** Kundendaten anlegen und durcharbeiten; die
Kundenfelder sind leer, im Protokoll und in der MD stehen ihre Platzhalter (`⟦KUNDE-1⟧`).
Werden sie später eingetragen, ändert sich an der MD **nichts** — dieselben Platzhalter, jetzt mit
einem Wert dahinter auf dem Gerät. Erst der **Kundenausdruck** (Bedarfsprotokoll, Angebot) zeigt die
echten Daten; fehlen sie dort noch, steht der Platzhalter sichtbar da statt eines leeren Feldes.

**Eigene Vorhaben.** Klaus: *„Meine privaten Sachen, das ist kein Problem."* Ein Vorgang trägt den
Schalter **„Eigenes Vorhaben (keine Kundendaten)"**, Vorgabe **aus**. Nur wenn er an ist, fällt das
Verdecken weg; der MD-Kopf sagt dann `verdeckt: nein`, und der Knopf zeigt es vor dem Speichern.
Klaus' eigene Firmendaten gehen ohnehin nicht in die MD.

⚠ **Die eigenen Zahlen der App sind keine Kundendaten.** Stunden, Euro (wenn der Haken an ist),
Kennungen und Datum der Fassung erzeugt die App selbst — sie dürfen nicht als `⟦BETRAG-…⟧`
verdeckt werden. Verdeckt wird der **Inhalt** (Kundenfelder + Freitext), die von der App gebaute
Tabelle wird danach eingesetzt. Die Sitzung liest die Optionen von Modul 25 nach (welche Sorten
sich abschalten lassen), statt das zu raten.

⚠ **Benannte Grenze:** Platzhalter sind **keine Verschlüsselung**, sondern weniger: der Klartext
geht gar nicht erst hinaus. Was Modul 25 nicht erkennt (ein Name, den niemand eingetragen oder
vorgeschlagen hat, eine Beschreibung, die den Kunden erkennbar macht — „der einzige Bäcker in X")
bleibt stehen — **bis er von Hand unter „Weitere Namen und Begriffe" eingetragen ist; dann wird er
erkannt.** Das steht in der App am Knopf und in der Hilfe, samt diesem Weg.

**Proben:** Kundenfelder mit einem Prüfwort (`KUNDE-PRUEFWORT-4Z`, erfundene Mail/Telefon) → in der
MD, im Kopier- und Teilen-Text **nirgends**, dafür die Platzhalter · zweite Fassung trägt
**dieselben** Platzhalter · Einlesen/„Antwort einfügen" stellt den Klartext her, unbekannter
Platzhalter wird genannt · Vorgang ohne Kundendaten → MD mit Platzhaltern, später ausgefüllt →
MD unverändert · „Eigenes Vorhaben" an → `verdeckt: nein`, aus → `ja` · Stunden/Euro der App bleiben
lesbar · Modul 25 fehlt → nichts geht hinaus · letzte Sicherung hält an, wenn nach dem Verdecken
noch ein Fund übrig ist · Modul-25-SHA stimmt mit Sage · ein Begriff, den Modul 25 nicht kennt
(„Bäckerei Prüfwort"), steht erst im Klartext, nach dem Eintrag unter „Weitere Namen und Begriffe"
in **keiner** Fassung mehr, und kommt beim Einlesen zurück.
**Gegenprobe:** Kundenfeld nicht an Modul 25 gereicht · „Weitere Namen“ nicht an Modul 25 gereicht · Zuordnung in die MD geschrieben ·
Platzhalter je Fassung neu nummeriert · letzte Sicherung ausgebaut · ohne Modul 25 trotzdem
gespeichert · App-Beträge mit verdeckt · „Eigenes Vorhaben" als Vorgabe an.

### 7d · Was die Sitzung mit der MD tut (für die CLAUDE.md des Repos)

Steht eine `bauauftrag`-MD im Chat, liest die Sitzung zuerst „Zu tun", baut **nur** die Zeilen
NEU BAUEN / ANPASSEN / ENTFERNEN, fasst UNVERÄNDERT nicht an und nennt NOCH NICHT GESCHÄTZT als
offene Frage. **Platzhalter `⟦…⟧` übernimmt sie unverändert** in Code, Texte und Antwort — sie
fragt nicht nach dem Klartext und erfindet keinen; die App setzt ihn beim Einfügen wieder ein. Diesen Absatz in die `CLAUDE.md` des neuen Repos übernehmen.

## 8 · Phasen- und Testplan (wächst mit der Größe)

1. Bedarfsprotokoll → 2. Angebot → 3. Bau → 4. Praxistest beim Kunden → 5. Abnahme →
6. optional Betrieb/Pflege. Jede neue Fassung kann Phasen verlängern; der Plan zeigt das.
Schwellen (Vorschlag, änderbar): klein ≤ 20 h → Bau 1 Woche, Test 2 · mittel ≤ 60 h → 2/3 · groß → 3/4.
Option „Zahlung nach bestandenem Praxistest" (Fahrplan 2d).

## 9 · Kalibrierung: Klaus' echte Zeiten (gemessen 2026-10-07)

Commit-Zeitstempel je Repo; Lücke > 90 min = neuer Block, je Block 30 min Vorlauf. **Untergrenze.**

| Repo | aktive h | Commits | Bildschirme (geschätzt) |
|---|---|---|---|
| Datei-Post | 3,2 | 5 | ~3 |
| Kim-sync | 5,9 | 12 | ~3 |
| Kuechenzettel | 8,2 | 17 | ~2–3 |
| Company-Brain | 13,9 | 33 | ? |
| mycel-karte | 16,4 | 36 | ? |
| Auslieferung-Pruefer | 25,0 | 56 | ? |
| Sende-Pruefer | 34,0 | 80 | ~5 |
| Workflow-PDF | 44,0 | 117 | ~6 |
| Kimboard | 76,3 | 220 | ? |
| Mein-WorkFloh | 110,2 | 526 | ? |

Gesamt (Kimhub-Historie 10.03.–24.08.2026): 128 Tage, 1 186,6 h.
⚠ Bildschirm-Zahlen sind geschätzt; die Sitzung zählt nach und schreibt nur Gezähltes.
⚠ Mit KI-Hilfe entstanden. Für Fremdaufträge kommen Abstimmung, Anpassung, Test vor Ort und
Pflege als eigene Posten dazu. Die Tabelle steht in der App (Reiter „Tabellen") mit Methode und Datum.

## 10 · Ablauf in der App

Reiter: **Vorgänge · 1 Bedarf · 2 Umfang · 3 Angebot · Fassungen · Tabellen · Einstellungen**

- *Vorgänge*: Liste (IndexedDB), neu, duplizieren, löschen; je Vorgang die aktuelle Fassung.
- *1 Bedarf*: die 18 Bereiche, Fortschritt „12 von 18 ausgefüllt", Schalter „für den Kunden / nur für mich" je Eintrag, interne Notiz je Bereich, zwei Ausdrucke (Bedarfsprotokoll für den Kunden · Bedarfsanalyse für mich), Vorschau.
- *2 Umfang*: Bausteine anklicken, Zähler, Größe, Faktoren; rechts die große Ergebnisanzeige
  (Stunden-Spanne, Tage, Preis-Spanne) und darunter Kosten-Nutzen mit Grenzlinie.
- *3 Angebot*: Positionen (übernommen, editierbar), Gültigkeit, Zahlung, Vorschau, Drucken.
- *Einstellungen*: Firmendaten, Stundensatz als Vorgabe (80 €, je Vorgang und Baustein abweichend eintragbar), USt-Schalter (§ 19 oder Regelsatz, frei wählbar), Nutzen-Zeitraum.
- *Fassungen*: Liste, Vergleich, Nachtrag drucken, Bauauftrag (MD) speichern/einlesen — immer mit Platzhaltern (7e), „Antwort einfügen" deckt auf.
- *Vorgang*: Kundenfelder optional und jederzeit nachtragbar; Schalter „Eigenes Vorhaben (keine Kundendaten)", Vorgabe aus.
- Sicherung: alle Vorgänge als JSON (später verschlüsselt wie Sende-Prüfer/Workflow PDF — nicht
  in dieser Sitzung, nur benennen).

## 11 · PWA, Gestaltung, Proben

**PWA:** Name **„Workflow Bedarfsanalyse“**, auf Englisch **„Workflow-Needs“** (Manifest `name`,
`short_name` „Bedarfsanalyse“). **Oberfläche Deutsch und Englisch** mit Sprachknopf in der Kopfleiste,
Vorgabe Deutsch, Wahl unter einem app-eigenen Schlüssel (nicht `toolpoint_lang`). Kopfleiste und
`<title>` wechseln den Namen mit der Sprache; das Manifest trägt den deutschen Namen (ein Manifest
kennt nur einen). Ausdrucke (Bedarfsprotokoll, Angebot, Nachtrag) in der gewählten Sprache. Die
Bauauftrags-MD bleibt Deutsch (sie geht an eine Sitzung, nicht an den Kunden). `index.html` ohne Build-Schritt, `manifest.json` (`standalone`), `sw.js` mit
`CACHE_VERSION` (bei jeder Vorrats-Änderung bumpen), offline, keine CDN, app-eigene
Speicher-Namen (nie ändern), Installieren-Knopf, ⟳ Neu laden, Hell/Dunkel, 360 px bis Desktop.

**Gestaltung:** Kalkulations-App: dunkle Arbeitsfläche als Vorgabe, `tabular-nums`, große
Ergebnis-Anzeige mit Spanne als Balken, Glas-Knöpfe nach Tomys-Hub in eigener Farbe, Zähler
und Schalter mechanisch. Druck schlicht schwarz auf weiß. Vorher 2–3 kleine Entwürfe an Klaus
(Artifact-Vorschau erlaubt, mit dem Hinweis, dass Drucken und Service-Worker dort nicht gehen).

**Proben** (`npm test`, playwright-core, Chromium `/opt/pw-browsers`; ohne Browser **Rückgabe 2**):
- Node: Rechnung mit bekannten Eingaben → bekannte Stunden/Cent (Satz 80 € → 10 h = 80 000 Cent); Satz je Vorgang (65 € → 10 h = 65 000 Cent) und je Baustein gewinnt in dieser Reihenfolge; Vorgabe ändern lässt bestehende Vorgänge unverändert; Satzänderung zwischen Fassungen erscheint als eigene Zeile; Überschreiben gewinnt; ↺ zurück;
  Rundung nur bei Anzeige; Kosten-Nutzen-Grenzlinie an gestellten Zahlen in beide Richtungen;
  fehlender Nutzen → „nicht angegeben", nie 0.
- USt: dieselben Positionen mit § 19 → kein USt-Betrag, Hinweis steht da; mit 19 % → Netto + USt
  = Brutto auf den Cent; eine unterschriebene Fassung behält ihren Satz nach einem Wechsel.
- Fassungen: F1 → F2 mit +1 Seite, + neuem Baustein, − einem Baustein ergibt genau
  NEU/ANPASSEN/ENTFERNEN/UNVERÄNDERT; Kennungen bleiben; Preis kann sinken.
- MD: erzeugte Datei hat den Kopf, die geschlossene Aktionsliste; mit Vorgabe-Haken **kein
  €-Betrag** und Stunden da, mit „Euro" an Beträge da und trotzdem **kein Stundensatz**, ohne
  „Stunden" keine Stundenspalte; der Kopf nennt beides (`stunden:`/`euro:`); **keine
  Kundendaten** (7e), null Befunde in `pruefeMail`; Einlesen stellt dieselbe Fassung her.
- Browser: Druck Stufe 1 enthält **keine** Stunden und keinen Preis; Angebot und Nachtrag enthalten
  Firmendaten, beide Unterschriftsfelder und **keinen** Stundensatz (gezielt gesucht: der Satz, der in DIESEM Vorgang galt — gestellt mit einem auffälligen Wert wie 73 €, nicht nur die Vorgabe 80);
  360 px ohne Querlaufen; offline nach erstem Laden; unterschriebene Fassung nicht editierbar.
- **Gegenprobe** (Wegwerf-Kopie, `NUR_ANKER=1`): Satz im Druck, Vorgangs-Satz wird ignoriert (Vorgabe gilt), Preis in Stufe 1, € in der MD trotz Haken aus,
  Stundensatz in der MD trotz Haken an, Kopf `euro:` fehlt,
  Kundendaten in der MD (Fälle in 7e), Kennung neu nummeriert, Grenzlinie falsch herum, Cache-Bump weglassen.
  Jeder Fall wirft seine eigene rote Zeile.

## 12 · Testfall „Boutique" (nach dem Muster Alis Moderaum, erfundene Daten)

- F1: Kunde will eine Internetseite für ein Modegeschäft (B-01…B-08, K-01…K-04). Angebot, unterschrieben.
- F2: beim Bau zeigt sich: Kurse sollen eine eigene Seite bekommen → Internetseite ×2.
- F3: Kunde wünscht Lagerbestand → Freitext „Warenwirtschaft", erst NOCH NICHT GESCHÄTZT,
  dann „mittel". Newsletter entfällt.
- Erwartet: Nachtrag F2→F3 mit Preisunterschied, MD mit genau einer NEU-BAUEN-, einer ANPASSEN-
  und einer ENTFERNEN-Zeile, Grenzlinie sichtbar. Dieser Fall liegt als Beispiel-Vorgang in der App.

## 13 · Abnahme

- [ ] Stufe 1 vollständig (18 Bereiche), druckbar, ohne Preis/Stunden.
- [ ] Kundenausdruck als PDF ohne interne Punkte und Notizen (Whitelist, nicht CSS); Bedarfsanalyse (intern) mit allem.
- [ ] Bausteine anklicken → Stunden/Preis ändern sich live, jede Zahl überschreibbar, Rechenweg sichtbar.
- [ ] Kosten-Nutzen mit laufender Summe und Grenzlinie.
- [ ] Angebot und Nachtrag gedruckt: A4, Firmendaten, zwei Unterschriften, **kein interner Satz**.
- [ ] Fassungen mit Vergleich; Bauauftrag-MD im festen Format, wieder einlesbar.
- [ ] Bauauftrag-MD ohne Kundendaten (Platzhalter über Modul 25, stabil je Vorgang); „Antwort einfügen" zeigt sie wieder; Vorgang auch ohne Kundendaten durcharbeitbar.
- [ ] PWA installierbar, offline, Proben + Gegenprobe grün.
- [ ] Adresse im Chat für Klaus' Sichttest (GitHub Pages: Settings → Pages → main).

## 14 · Offene Fragen an Klaus (vor dem Bauen stellen)

1. ~~Stundensatz~~ → **80 €/h, entschieden (Klaus 2026-10-07).** Mindestpreis je Auftrag: **nicht jetzt** — entscheidet sich später nach Nachfrage (Klaus 2026-10-07). Nicht bauen, kein Feld vorbereiten.
2. Firmendaten fürs Angebot: **nur in der App eintragen, nicht ins Repo.**
3. ~~Kleinunternehmer (§ 19) oder 19 % USt?~~ → **manuell in den Einstellungen wählbar, für andere Firmen (Klaus 2026-10-07).** Abschnitt 5c.
4. ~~Name der App~~ → **„Workflow Bedarfsanalyse“ (Klaus 2026-10-07)**: Kopfleiste, `<title>`, Manifest `name`; `short_name` „Bedarfsanalyse“. Auf Englisch heißt sie **„Workflow-Needs“** (Klaus 2026-10-07), wie das Repo. **Drei Namen, drei Aufgaben** (Klaus 2026-10-07): *Bedarfsanalyse* = das Werkzeug und Dokument für Klaus · *Bedarfsprotokoll* = das Dokument für den Kunden · *Workflow-Needs* (Repo-Name) = der Name für die Werbung (Marktplatz-Eintrag, Webseite, Teilen-Text). Der Kundenausdruck trägt im Fuß deshalb weder „Analyse" noch den App-Namen, nur Klaus' Firmendaten.
5. ~~Marktpreis-Spannen~~ → **Vorschlag aus dem Fahrplan (Klaus 2026-10-07)**, Startwerte in Abschnitt 5c.
6. ~~Zeitraum für die Kosten-Nutzen-Grenze~~ → **24 Monate als Vorgabe (Klaus 2026-10-07: „für die Analyse ganz gut“)**, in den Einstellungen änderbar.
7. ~~Stunden/Euro in der Bauauftrags-MD~~ → **beides frei wählbar je Export, Vorgabe Stunden an, Euro aus (Klaus 2026-10-07).**

## 15 · Abschluss-Pflichten

`CLAUDE.md` im neuen Repo (Zweck, Prüfen, was leicht kaputtgeht, **Abschnitt 7d wörtlich**,
Netzweit-Verweis). Commit/Push auf den vorgegebenen Zweig, PR, Selbst-Merge bei grün.
Sichttest-Adresse: https://lausiklauskn-png.github.io/Workflow-Needs/ (Pages einschalten bzw. prüfen).
Chat-Antwort mit Adresse, „Nächste Schritte" und dem nächsten Brief als Codeblock.
