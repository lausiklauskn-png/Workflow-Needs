# BRIEF · Stufe 3 — vier echte Beispiele und die Verschwiegenheitserklärung

Stand: 2026-10-07 · Absender: Sitzung „Stufe 2“ (PR #2, gemergt `2b29642`) · Ziel-Repo:
**`lausiklauskn-png/Workflow-Needs`** · Adresse: https://lausiklauskn-png.github.io/Workflow-Needs/

## 1 · Auftrag (Klaus' Wortlaut, gekürzt, 2026-10-07)

> „Mach bitte … Beispiele. Nimm dabei die eigenen Daten, die wir zur Verfügung haben, mit
> heran. Und zwar einmal für Tomys Hub. Da kannst du einmal das komplette Workflow Needs
> ausfüllen, als wenn Tomys Hub ein … Auftrag … eine Bedarfsanalyse [gewesen wäre]. Dann
> dasselbe für … Perfect Skin Beauty Internetseite, … der dritte wäre dann … Alis Moderaum,
> das Repo, und meine eigene Bedarfsanalyse für die verschiedenen Apps, wie Mein Rezeptbuch,
> dann den Weiteraufbau für das Protokoll und ebenso für … family-project und
> family-projekt.de und PWA Toolpoint. Das Ganze einarbeiten in die Bedarfsanalyse als
> Beispiele, und ein kleiner Betrieb für zum Beispiel Werbeartikel. Also vier insgesamt.“
>
> „Und eine Verschwiegenheitserklärung muss noch mit hinein … mit der Unterschrift …, dass
> damit erklärt wird, dass alle Daten gemäß der DSGVO verarbeitet werden … dass da auch schon
> unterschrieben werden kann, dass, sobald die aktiviert ist, ein Ausdruck gemacht wird für
> den Kunden oder [sie] per E-Mail zugesendet wird, damit er auch etwas in der Hand hat.
> Damit er weiß, dass er keine Daten verschenkt.“

**Lesart „vier insgesamt“ (Vorschlag dieser Sitzung, vor dem Bauen Klaus bestätigen lassen):**
Tomys Hub **ist** der „kleine Betrieb für Werbeartikel“ (Tomys Hub = Digitaldruck, Stickerei,
Kleinwerbeartikel, siehe `Tomys-Hub/CLAUDE.md`). Dann sind es genau vier:

| # | Beispiel | Art |
|---|---|---|
| 1 | **Tomys Hub** — kleiner Betrieb für Werbeartikel | Kundenauftrag |
| 2 | **Perfect Skin Beauty** — Internetseite | Kundenauftrag |
| 3 | **Alis Moderaum** — Boutique mit Warenwirtschaft | Kundenauftrag (ersetzt oder ergänzt „Boutique“, s. § 3) |
| 4 | **Klaus' eigene Apps** — Mein Rezeptbuch, Sage-Protokol (Weiteraufbau), family-project / family-projekt.de, PWA-Toolpoint | **Eigenes Vorhaben** (`eigenesVorhaben: true`, „verdeckt: nein“) |

Sagt Klaus „nein, fünf“: dann ist Nr. 5 ein erfundener Werbeartikel-Betrieb, und Tomys Hub
bleibt Nr. 1. Die Bauart ändert sich dadurch nicht.

## 1b · Befund aus Klaus' Bildschirmfoto (Tablet, 2026-10-07, 19:11) — zuerst beheben

Vorschau „Angebot AN-2026-0003“ eines Vorgangs **ohne** Kundendaten: im Kopf steht
`für: ⟦KUNDE-1⟧ / ⟦KUNDE-2⟧ / ⟦KUNDE-3⟧`. **Platzhalter gehören in die Bauauftrags-MD, nie
auf ein Kundenblatt.** Ursache: `kundeExtern` in `assets/kern/aussen.js` setzt für ein leeres
Feld den Platzhalter (bewusst, Stufe 1) — der gilt für Angebot, Nachtrag und Bedarfsprotokoll mit.
Soll: leeres Feld → leere Schreiblinie (zum Ausfüllen von Hand) oder gar nichts, nie `⟦…⟧`.
Probe: kern und browser — ein Kundenblatt eines Vorgangs ohne Kundendaten enthält kein `⟦`.
Die Übergabe an WorkFloh (`uebergabe.js`) entfernt Platzhalter schon (`rein()`), daran nichts ändern.
Weitere Verbesserungen meldet Klaus selbst („minimal“) — erst danach fragen, nicht raten.

## 2 · Pflichtlektüre (in dieser Reihenfolge)

1. `CLAUDE.md` dieses Repos — vor allem „Was hier leicht kaputtgeht“ und „Stufe 2“.
2. `assets/daten/beispiel.js` — der Testfall „Boutique“ ist das Muster (F1 unterschrieben, F2, F3).
3. `assets/kern/aussen.js` — die Whitelist. **Alles, was zum Kunden geht, geht hier durch.**
4. `assets/kern/fassungen.js`, `assets/kern/bedarf.js` (18 Bereiche, Kennungen).
5. Die Quellen der Beispiele (§ 3), jeweils `CLAUDE.md`, `README.md` und die Struktur der
   Seiten — **gelesen, nicht geraten**. Zugriff: siehe § 7.

## 3 · Die vier Beispiele

### 3a · Was „mit den eigenen Daten“ heißt — und was nicht

- **Inhalt aus den Repos:** was die App kann, welche Bildschirme sie hat, welche Bausteine
  sie braucht, wie viele Stunden sie gekostet hat (Kalibrierung, Methode wie in
  `assets/daten/markt.js`: Commit-Zeitstempel, Lücke > 90 min = neuer Block, je Block 30 min
  Vorlauf, Untergrenze). Für Repos ohne Kalibrierungszeile: **nachmessen** und dazu sagen.
- **Kundendaten bleiben erfunden.** Firmenname darf der echte App-/Projektname sein (Klaus'
  eigene Projekte). **Ansprechpartner, Mail, Telefon, Anschrift, Kundennummer: erfunden**,
  Mail nur `@…example` (Probe „BOUTIQUE: keine echten Adressen“ gilt für alle Beispiele).
  Kein echter Name einer Person (Tomy, Alina …) in einem Kundenfeld. Grund: kein PII im Depot
  (NETZWEIT) — und die Beispiele landen in jeder Sicherung und jeder MD.
- **Stunden und Preise sind Schätzungen** aus dem Katalog; wo die Kalibrierung die echte Zeit
  kennt, stehen **Ist-Stunden** an der unterschriebenen Fassung (`v.ist`, Stufe 2) — so zeigt
  jedes Beispiel auch „Schätzung gegen Ist“.

### 3b · Je Beispiel

Jedes Beispiel füllt **alle drei Stufen**: alle 18 Bereiche (wo etwas zu sagen ist; ein leerer
Bereich bleibt leer, nicht erfunden), Umfang mit Bausteinen aus dem Katalog (mit `deckt`),
Angebot. Dazu **mindestens zwei Fassungen**, wo die echte Geschichte das hergibt.

| # | Quelle | Fassungen (Vorschlag aus der Repo-Geschichte, nachsehen) |
|---|---|---|
| 1 Tomys Hub | `Tomys-Hub` (Schaufenster `showcase/`, Gestalter `gift.html`, Angebots-Werkzeug `bookledger/`, `workfloh/`, `promptgenerator/`, Tresor) | F1 Schaufenster + Gestalter · F2 + Angebots-Werkzeug und WorkFloh · F3 + PDF-Werkzeug/Prüfung beim Anhängen |
| 2 Perfect Skin Beauty | `Perfect-Skin-Beauty` (privat) bzw. `New-Perfect-Skin-Beauty-` (öffentlich) — welche gilt, Klaus fragen | F1 Internetseite · F2 was danach dazukam (nachsehen) |
| 3 Alis Moderaum | `Alis-Moderaum` (`index.html` Schaufenster, `warehouse.html`, `kasse.html`, Übergabe an BookLedgerPro) | F1 Schaufenster · F2 + Warenwirtschaft · F3 + Kasse — **das ist die Geschichte, aus der „Boutique“ erfunden wurde** |
| 4 Eigene Apps | `Mein-Rezeptbuch` (+ `-Page`), `Sage-Protokol`, `family-project` / family-projekt.de, `PWA-Toolpoint` | je App ein Baustein-Block oder je App ein eigener Vorgang — **Klaus fragen** (§ 6, Frage 3) |

- **„Boutique“** (erfunden) bleibt, solange Klaus nichts anderes sagt: sie ist der Testfall der
  Proben (`BOUTIQUE:`-Zeilen in `tests/kern.mjs`). Alis Moderaum kommt **daneben**.
- **Beispiel 4 ist ein eigenes Vorhaben:** `eigenesVorhaben: true` → Bauauftrags-MD mit
  `verdeckt: nein`. Kein Kundenausdruck nötig; das Angebot heißt dort sinnvollerweise „Plan“
  (oder bleibt weg) — Klaus fragen.

### 3c · In der App

- **Einstellungen → Beispiel:** statt eines Knopfs eine Auswahl („Boutique (Testfall)“,
  „Tomys Hub“, „Perfect Skin Beauty“, „Alis Moderaum“, „Eigene Apps“) und „Alle laden“.
  Jedes trägt `v.beispiel = true` (zählt nicht für die Sicherungs-Erinnerung, Stufe 2).
- Beim ersten Öffnen lädt weiter **nur** „Boutique“ (`workflowneeds_beispiel_v1` nicht ändern).
- Zweimal laden legt **keinen** Doppel an (Kennung prüfen, wie in Sende-Prüfer `bid`).
- Daten in `assets/daten/beispiel-*.js` (eine Datei je Beispiel), Aufbau wie `boutique()`;
  `?v=` + CORE + Cache-Bump über `tools/cache-stand.mjs`.

## 4 · Die Verschwiegenheits- und Datenschutzerklärung (und in 4e: Zahlung und Rechte)

### 4a · Was sie ist

Eine **Erklärung von Klaus an den Kunden**, vor oder zu Beginn des Bedarfsgesprächs: was mit
seinen Angaben geschieht und was nicht. Der Kunde soll „etwas in der Hand haben“.

Inhalt (Entwurf — ⚠ **kein Rechtsrat**, Klaus lässt den Wortlaut prüfen, bevor er ihn einem
Kunden gibt; das steht auch in der App am Text):

1. **Vertraulichkeit:** alles, was der Kunde im Gespräch und in Dateien mitteilt, wird
   vertraulich behandelt und nicht an Dritte weitergegeben; gilt auch nach Ende der
   Zusammenarbeit (Dauer: Klaus' Entscheidung, Vorschlag 3 Jahre).
2. **Zweck:** nur für Bedarfsprotokoll, Angebot und — falls beauftragt — Umsetzung.
3. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen auf Anfrage).
4. **Wo die Daten liegen:** auf Klaus' Gerät, in dieser App, ohne Server; Sicherung
   verschlüsselt (AES-256-GCM). Das ist wahr und gemessen (Stufe 2) — so steht es auch da.
5. **KI-Hilfe:** an eine KI geht nur ein Bauauftrag **mit Platzhaltern statt Namen**;
   Grenze ehrlich benannt (was die Erkennung nicht findet, bleibt stehen, bis es eingetragen
   ist). Kein Satz, der mehr verspricht.
6. **Löschung:** auf Wunsch, spätestens nach Ablauf gesetzlicher Aufbewahrungsfristen.
7. **Rechte:** Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit, Widerspruch
   (Art. 15–21 DSGVO), Beschwerde bei der Aufsichtsbehörde; Kontakt aus den Firmendaten.

Die **Firmendaten** (Einstellungen) füllen Absender und Kontakt; die **Kundenfelder** den
Empfänger — über die Whitelist (`aussen.js`, neue Funktion z. B. `erklaerungExtern`), nie aus
der Ansicht. Kein Stundensatz, kein Preis, kein internes Feld. **Das Wort „Analyse“ steht nicht
darin** (Kundenblatt).

### 4b · Unterschreiben und „aktivieren“

- **Unterschrift in der App:** zwei Felder (Klaus · Kunde) zum Zeichnen mit Finger oder Stift
  (`<canvas>`, als PNG gespeichert am Vorgang, z. B. `v.erklaerung = {fassung, datum,
  unterschriftBetrieb, unterschriftKunde, text-Fassung}`), **dazu** die Möglichkeit, nur zu
  drucken und von Hand zu unterschreiben.
- **Aktiviert** = beide Unterschriften da (oder „auf Papier unterschrieben“ markiert). Danach
  ist sie **eingefroren** wie eine unterschriebene Fassung (Text-Fassung und Datum fest).
- **Beim Aktivieren** öffnet sich sofort das Blatt für den Kunden: **🖨 Drucken** (auch „Als PDF
  speichern“) und **✉ Per E-Mail** — siehe 4c.
- Die Erklärung erscheint im Vorgang oben (Status: offen · aktiviert am …) und im
  Bedarfsprotokoll als ein Satz („Es gilt die Verschwiegenheitserklärung vom …“).

### 4c · „Per E-Mail zusenden“ — ehrliche Grenze

Die App hat **keinen Server** und kann **keine Mail selbst verschicken**. Machbar ohne Server:

1. `mailto:` mit Betreff und Text der Erklärung an die Kunden-Mail — **ohne Anhang** (geht
   mit `mailto` nicht); oder
2. **Teilen** (`navigator.share`) mit der Erklärung als Datei (HTML oder ein PDF, das die App
   dafür bauen müsste) — am Tablet geht dann das Mailprogramm auf.

Vorschlag: (1) für den Text, und „Als PDF speichern“ aus dem Druck, das Klaus anhängt. Klaus
fragen (§ 6, Frage 5). **Nicht** bauen: einen Mail-Dienst oder Server.

### 4d · Wohin noch

- In die **Sicherung** (verschlüsselt, mit den Unterschriften) — ja.
- In die **Bauauftrags-MD** — nein (Unterschriften sind Kundendaten; die MD nennt höchstens
  „Erklärung aktiviert: ja/nein“).
- In die **Übergabe an WorkFloh** — als Datei mit (`files[]`, z. B. das Druckblatt als HTML),
  damit sie beim Auftrag liegt. Klaus fragen.

## 4e · Zweite Erklärung: Zahlung erst nach Erfolg · Rechte am Bau (Klaus 2026-10-07, Nachtrag)

> „Da muss auch noch eine Erklärung, sobald der Kunde etwas bekommt, unterschrieben von mir und
> von ihm, dass … Zahlung [erst] stattfindet bei erfolgreicher Umsetzung des Projektes. Das Ziel
> ist festgesetzt, es ist alles festgelegt. … wenn das Projekt beendet ist, erst dann kommt es zu
> einer Zahlung, wenn überhaupt, je nachdem, was der Kunde als praktisch empfindet oder nützlich
> für ihn. Lizenzen und ähnliche Sachen bleiben bei mir für den Bau selber, den ich ja dann später
> auch noch für andere Firmen nutzen kann.“

**Wann:** „sobald der Kunde etwas bekommt“ — Vorschlag: zusammen mit dem **Angebot** (Stufe 3), als
eigenes Blatt „Vereinbarung zu Zahlung und Nutzungsrechten“, unterschrieben von **beiden** (gleiche
Bauart wie 4b: zwei Unterschriftsfelder, Aktivieren friert ein, danach Druck / Mail wie 4c).
Gilt je **Fassung**: ein Nachtrag (F2, F3 …) verweist auf sie oder bekommt eine neue — Klaus fragen.

**Inhalt (Entwurf, ⚠ kein Rechtsrat — Wortlaut vor dem ersten Kunden prüfen lassen):**

1. **Das Ziel steht fest:** Grundlage ist das unterschriebene Bedarfsprotokoll und das Angebot in
   Fassung *n* (Kennungen B-nn/K-nn nennen — sie sind das, woran „erfolgreich“ gemessen wird).
2. **Zahlung erst nach Abschluss:** vor dem Ende des Projekts wird nichts fällig. Erst nach der
   Abnahme (Ende des Praxistests, Phasen aus Stufe 2) entscheidet der Kunde.
3. **„Wenn überhaupt“:** ist das Ziel nicht erreicht oder empfindet der Kunde das Ergebnis nicht als
   nützlich, entfällt die Zahlung — **ganz** oder **je Baustein** (der Kunde zahlt nur, was er
   behält)? ⚠ **Klaus' Entscheidung** (§ 6, Frage 7). Die App hat dafür schon den Haken „Zahlung nach
   bestandenem Praxistest“ (`angebot.zahlungNachTest`, `app.js` und `aussen.js`) — darauf aufbauen,
   nicht daneben ein zweites Feld.
4. **Rechte am Bau bleiben bei Klaus:** Urheberrecht und alle Rechte an Code, Bausteinen, Vorlagen und
   Werkzeugen bleiben bei Klaus; er darf sie für andere Kunden weiterverwenden. Der Kunde erhält —
   **erst mit der Zahlung** — ein **einfaches, nicht übertragbares Nutzungsrecht** für den eigenen
   Betrieb. ⚠ Klaus fragen: zeitlich unbegrenzt? darf der Kunde ändern lassen? was gilt ohne Zahlung
   (Vorschlag: kein Nutzungsrecht, die App wird nicht weiter betrieben)?
5. **Was dem Kunden gehört, bleibt seins:** seine Daten, Texte, Bilder, Logos, Kundenlisten — Klaus
   verwendet sie für niemanden sonst (Verbindung zur Verschwiegenheit, § 4a).
6. Kein Stundensatz, keine internen Sätze, nicht das Wort „Analyse“ (Kundenblatt, Whitelist).

**Proben dazu:** Blatt nur über die Whitelist (neue Funktion, z. B. `vereinbarungExtern`); nennt Fassung
und die Kennungen des Ziels; ohne beide Unterschriften nicht „aktiviert“; aktiviert = eingefroren;
der Satz zur Zahlung folgt dem gewählten Modell (ganz / je Baustein); kein Satz/Preis-Leck außer den
Summen des Angebots.

## 4f · Klaus' Antworten (2026-10-07, dritte Nachricht) — gelten

> „Erfolg wird gemessen am Bedarfsprotokoll und die Bewertung der Mitarbeiter … mit Sternchen …
> Mitarbeiter, die in dem Fachbereich tätig sind. Das ist ganz wichtig, wie schätzen die Mitarbeiter
> den Bedarf ein. … Nutzungsrecht gilt zeitlich unbegrenzt. … die App darf er von anderen nicht ändern
> lassen. Wenn er nicht zahlt, wird die App kodiert … ein Code geschickt und die App wird unbrauchbar
> bei der nächsten Aktualisierung … Aktualisierungen oder Verbesserungen werden separat abgerechnet nach
> Stundensatz … auf den bestehenden Auftrag oder Neuauftrag … Es wird im Prinzip eine Grundversion
> ausgeliefert, die dann jederzeit verbessert werden kann. … die Änderung an der App, die kann ich dann
> vornehmen. Das ist dann das Ziel … eines Vertrages über die Wartung … mehrere Umsonststunden dabei,
> die gewährleisten, dass die App in der Anfangsphase Fehler ausgemerzt bekommt … Nur kalkuliert.“

**A · Erfolg = Bedarfsprotokoll + Sterne der Mitarbeiter im Fachbereich (neu zu bauen)**

- Die Mitarbeiter, die im jeweiligen Fachbereich arbeiten, bewerten mit **1–5 Sternen**.
- **Zwei Zeitpunkte** (Vorschlag, Klaus bestätigen lassen):
  1. **beim Bedarf (Stufe 1):** „Wie wichtig ist dieser Bedarf für meine Arbeit?“ — je Bedarf (Kennung B-nn).
  2. **bei der Abnahme:** „Wie gut erfüllt das Ergebnis diesen Bedarf?“ — je Bedarf.
  Das Ergebnis je Bedarf steht neben der Kennung (Durchschnitt, Anzahl). Dieselbe Kennung ist in der
  Vereinbarung (4e, Punkt 1) das Ziel.
- **Mitarbeiter sind Kundendaten:** erfasst wird **Fachbereich** (z. B. „Verkauf“, „Lager“) und
  optional ein Kürzel — kein Klarname nötig. Steht doch ein Name da, gilt er wie ein Kundenfeld:
  Platzhalter in der MD, Klartext nur auf Kundenblättern.
- Ins **Bedarfsprotokoll für den Kunden:** die Sterne beim Bedarf ja (es ist seine Einschätzung).
  In die **Bauauftrags-MD:** die Sterne ja, Namen nein.
- Wie die Bewertung in die App kommt: am Gerät reihum, oder ein Ausdruck mit Sternchen zum
  Ankreuzen, den Klaus nachträgt. Vorschlag: beides, Ausdruck zuerst. Klaus fragen (Frage 10).

**B · Nutzungsrecht:** zeitlich **unbegrenzt**, einfach, nicht übertragbar; **Änderungen nur durch
Klaus** — der Kunde lässt die App nicht von anderen ändern. So steht es in der Vereinbarung (4e, Punkt 4).

**C · Ohne Zahlung wird die App unbrauchbar — ⚠ benannte Grenzen, vor dem Bauen mit Klaus klären**

Klaus' Wunsch: zahlt der Kunde nicht, wird die App „kodiert“, ein Code geht hinaus und sie ist ab der
nächsten Aktualisierung nicht mehr benutzbar.

- **Das gehört NICHT in Workflow-Needs gebaut**, sondern in die ausgelieferte Kunden-App. Workflow-Needs
  bekommt nur: (1) den **Satz in der Vereinbarung**, offen angekündigt, und (2) einen neuen
  **Katalog-Baustein „Freischaltung / Lizenz“** (Schätzung, `geprueft: false`), damit er in jedem
  Angebot mitgerechnet wird. Gebaut wird der Schalter in einer eigenen Sitzung je App.
- ⚠ **Drei Grenzen, die im Brief stehen bleiben müssen:**
  1. **Rechtlich:** eine Sperre gegen einen Kunden ist nur haltbar, wenn sie vorher klar vereinbart ist
     und erst greift, wenn die Zahlung nach der Abnahme ausbleibt. Wortlaut prüfen lassen.
  2. **Die Daten des Kunden bleiben seine** (4e, Punkt 5, und DSGVO Art. 20): die Sperre darf **nur die
     Bedienung** sperren, nie Daten löschen oder verschlüsseln; **Export der eigenen Daten bleibt immer
     möglich**. Sonst bricht sie Klaus' eigene Verschwiegenheits- und Datenschutzerklärung.
  3. **Technisch:** eine PWA, die offline läuft, sieht eine Sperre erst beim nächsten Abruf vom Server
     (nächste Aktualisierung). Wer nie wieder online geht oder die Dateien kopiert, behält die alte
     Fassung. Das heißt „unbrauchbar ab der nächsten Aktualisierung“, nicht „sofort“ — so benennen.

**C2 · Klaus' Festlegung (2026-10-07, vierte Nachricht) — gilt:**

> „Die Sperre für den Kunden … werden wir erstmal festhalten, später einbauen. Die wird in der App
> eingebaut … ich werde sie dann … in der App aktivieren, wenn es Not tut. Das soll auch vereinbart
> werden, dass wenn es nicht zur Zahlung kommt, die App dann deaktiviert wird. … Eine Bedienungssperre …
> Die Daten bleiben erhalten. Er braucht keine Angst haben, dass irgendwas verloren geht. … Aktualisierung
> erfolgt automatisch … lebenslang eine Verbesserung der App, automatisch, wenn es erwünscht ist … die
> Aktualisierung wird die ersten zwei Jahre kostenlos sein.“

- **In dieser Stufe NICHT bauen:** den Sperr-Mechanismus. Er kommt später in die jeweilige Kunden-App;
  Klaus schaltet ihn dort ein, „wenn es Not tut“. Hier nur: der Satz in der Vereinbarung und der
  Katalog-Baustein „Freischaltung / Lizenz“ (Schätzung).
- **Satz für die Vereinbarung (4e), Entwurf:** „Kommt es nach der Abnahme nicht zur vereinbarten
  Zahlung, wird die Bedienung der App gesperrt. Ihre Daten bleiben vollständig erhalten und lassen sich
  weiterhin exportieren; es geht nichts verloren.“
- **Aktualisierungen:** kommen **automatisch**, solange der Kunde sie wünscht (abschaltbar), lebenslang.
  Die **ersten zwei Jahre kostenlos**; danach: noch offen (Frage 13). Satz für die Vereinbarung:
  „Aktualisierungen der App erhalten Sie automatisch, solange Sie das wünschen. In den ersten zwei Jahren
  ab Abnahme sind sie kostenlos.“
- Abgrenzung zu D: **Aktualisierung** = Klaus verbessert die Grundversion von sich aus (kostenlos 2 Jahre);
  **Verbesserung auf Wunsch des Kunden** = Nachtrag oder neuer Vorgang (bezahlt). Diese Grenze steht so im
  Blatt, sonst ist „kostenlos“ missverständlich.

**D · Grundversion, Verbesserungen und Wartung**

- Ausgeliefert wird eine **Grundversion** (die Fassung, die zur Vereinbarung unterschrieben ist). Die
  Vereinbarung gilt **je Vorgang** für diese Grundversion.
- **Verbesserungen und Erweiterungen** werden **gesondert** abgerechnet: als **Nachtrag** zum bestehenden
  Auftrag (neue Fassung + Nachtrag zum Unterschreiben — gibt es schon) oder als **neuer Vorgang**.
- **Wartungsvertrag** (neues Blatt, gleiche Bauart wie 4e): nur Klaus ändert die App; Fehlerbehebung in
  der Anfangsphase mit **n Freistunden**. Die Freistunden sind **eingerechnet** („nur kalkuliert“): sie
  stehen intern in der Schätzung (Stufe 2, neuer Posten neben Abstimmung/Puffer, z. B. „Gewährleistung in
  der Anfangsphase“), der Kunde sieht nur „inklusive *n* Stunden Fehlerbehebung in den ersten *m* Wochen“.
  Werte *n* und *m* sind Klaus' Vorgabe in den Einstellungen.
- ⚠ **Stundensatz:** „separat abgerechnet nach Stundensatz“ — die App druckt den Satz **nie** (CLAUDE.md,
  „Stundensatz verlässt das Haus nie“). Das Blatt sagt deshalb „nach Aufwand, mit gesondertem Angebot
  oder Nachtrag“. Soll der Satz im Wartungsvertrag doch genannt werden, ist das eine **Änderung dieser
  Regel** — nur mit Klaus' ausdrücklichem Wort, und dann nur in diesem einen Blatt (Frage 11).

## 5 · Proben und Gegenprobe

- **kern:** jedes Beispiel lädt, hat 18 Bereiche gültig, Kennungen lückenlos aus dem Zähler,
  rechnet (Schätzung > 0), keine echte Mail (`@…example`), kein Stundensatz in Angebot/Übergabe;
  Beispiel 4 ergibt `verdeckt: nein`; die Erklärung: Whitelist ohne Satz/Preis/„Analyse“,
  nach dem Aktivieren eingefroren.
- **browser:** Beispiel-Auswahl lädt jedes einzeln und „Alle“ ohne Doppel; Unterschrift zeichnen
  (Maus/Finger per CDP), Aktivieren öffnet das Kundenblatt, Druck zeigt Firma, Kunde, beide
  Unterschriften; `mailto:`-Link trägt Betreff + Text; 360 px ohne Querlaufen.
- **Gegenprobe** für jede neue Zusicherung, voller Lauf am Ende (Stand Stufe 2: 57 gefangen).
- Englische Texte für jeden neuen `t("…")` (Probe misst es). Den Rechtstext der Erklärung:
  Englisch nur, wenn Klaus es will (wie Impressum: verbindlich ist die deutsche Fassung).

## 6 · Offene Fragen an Klaus (vor dem Bauen stellen)

1. ~~vier oder fünf~~ — beantwortet (Klaus „1. ok“): **vier**, Tomys Hub ist der Werbeartikel-Betrieb.
2. Perfect Skin Beauty: welches Repo gilt (`Perfect-Skin-Beauty` oder `New-Perfect-Skin-Beauty-`)?
3. Beispiel 4: ein Vorgang mit allen eigenen Apps — oder je App ein Vorgang?
4. Verschwiegenheit: wie lange nach Ende der Zusammenarbeit (Vorschlag 3 Jahre)? Unterschreibt
   nur Klaus (einseitige Erklärung) oder beide (Vereinbarung)?
5. „Per E-Mail“: reicht `mailto` mit Text + PDF von Hand angehängt?
6. Soll die Erklärung mit in die WorkFloh-Übergabe?
7. Zahlung nach Erfolg: entfällt sie **ganz**, wenn das Ziel verfehlt ist, oder zahlt der Kunde **je
   Baustein**, den er behält? (Noch offen. Beantwortet: „erfolgreich“ = Bedarfsprotokoll + Sterne der
   Mitarbeiter, § 4f A.)
8. ~~Nutzungsrecht~~ — beantwortet (§ 4f B, C): unbegrenzt, Änderungen nur durch Klaus, ohne Zahlung Sperre.
9. ~~je Vorgang oder je Fassung~~ — beantwortet (§ 4f D): je Vorgang für die Grundversion; Verbesserungen
   als Nachtrag oder neuer Vorgang; dazu ein Wartungsvertrag mit eingerechneten Freistunden.
10. Sterne der Mitarbeiter: zu beiden Zeitpunkten (Bedarf und Abnahme)? Am Gerät oder auf Papier?
11. Wartungsvertrag: bleibt der Stundensatz ungenannt („nach Aufwand“), oder soll er dort stehen?
12. ~~Sperre~~ — beantwortet (§ 4f C2): Bedienungssperre, Daten bleiben, später in der Kunden-App gebaut,
    hier nur vereinbart. (Alte Frage zum Nachlesen: einverstanden mit den drei Grenzen in § 4f C (nur Bedienung, Export bleibt,
    erst ab der nächsten Aktualisierung) und damit, dass sie in der Kunden-App gebaut wird, nicht hier?

13. Aktualisierungen nach den zwei kostenlosen Jahren: bezahlt (wie — Wartungsvertrag, je Aktualisierung)
    oder weiter kostenlos?

## 7 · Zugriff (gemessen in dieser Sitzung)

- Lesbar waren: `Tomys-Hub`, `Alis-Moderaum`, `Mein-WorkFloh`, `Kim-sync` (über `add_repo`),
  öffentliche Repos ohne weiteres.
- **Abgelehnt** (Berechtigungs-Prüfung der Sitzung): `PWA-Toolpoint` (push), `BookLedgerPro`.
  Für Beispiel 4 braucht die nächste Sitzung `PWA-Toolpoint` **lesend**; für Perfect Skin Beauty
  ggf. das private Repo. Wird es abgelehnt: das Beispiel aus dem Sichtbaren bauen und die Lücke
  in der App benennen („nicht nachgesehen“), nicht raten.

## 8 · Abschluss-Pflichten

`npm test` grün · Gegenprobe voller Lauf · Cache-Bump · CLAUDE.md (Abschnitt „Stufe 3“, neue
Speicher-Felder am Vorgang, gemessene Zahlen) · PR mit Tabelle „was drin, was offen“ ·
⚠ Tablet: Klaus' Sichttest (Unterschrift mit dem Finger, Druck, Mail) — nicht ersetzbar.
