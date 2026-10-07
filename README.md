# Workflow-Needs · Workflow Bedarfsanalyse

Installierbare Web-App (PWA) für Aufträge in drei Stufen:

1. **Bedarfsprotokoll** — 18 Bereiche, lösungsneutral, ohne Preis; als PDF für den Kunden
   (nur Freigegebenes) und als interne Bedarfsanalyse.
2. **Umfang und Schätzung** — Bausteine anklicken, Stunden und Preis als Spanne,
   Kosten-Nutzen mit Grenzlinie. Intern.
3. **Angebot** — Positionen, Umsatzsteuer (§ 19 oder Regelsatz), zwei Unterschriftsfelder.

Dazu **Fassungen** mit Vergleich und Nachtrag sowie der **Bauauftrag (MD)**: eine
Markdown-Datei für die nächste Arbeitssitzung, in der Kundendaten durch Platzhalter
(`⟦KUNDE-1⟧`) ersetzt sind. Die Zuordnung bleibt auf dem Gerät.

Läuft offline im Browser, ohne Server, ohne Build-Schritt:
https://lausiklauskn-png.github.io/Workflow-Needs/

Prüfen: `npm install && npm test` · Gegenprobe: `npm run gegenprobe`.
Mehr in [CLAUDE.md](CLAUDE.md).
