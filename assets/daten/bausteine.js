/* Baustein-Katalog — die Tabelle hinter „2 Umfang".
   ⚠ ALLE ZAHLEN SIND SCHÄTZUNGEN (Brief 2026-10-07 § 5a), NICHT GEMESSEN. In
   der App unter „Tabellen" änderbar; die Änderung liegt auf dem Gerät
   (localStorage workflowneeds_tabellen), diese Datei bleibt die Vorgabe.
   `spannen`: Stunden von–bis je Größe. `wv`: Anteil Wiederverwendung (0…1),
   `vorlage`: aus welcher App des Netzes. `geprueft`: ob in dieser Sitzung
   nachgesehen wurde, dass die App die Funktion hat (sonst nur laut Brief). */
(function (g) {
  "use strict";
  var WN = g.WN = g.WN || {};
  function b(id, de, en, vorlage, wv, k, m, gr, geprueft, hinweis) {
    return { id: id, name: { de: de, en: en }, vorlage: vorlage, wv: wv, geprueft: !!geprueft,
      hinweis: hinweis || "", spannen: { klein: k, mittel: m, gross: gr } };
  }
  WN.BAUSTEINE = [
    b("seite", "Internetseite / Landing-Page", "Website / landing page", "Mein-Rezeptbuch-Page, Workfloh-PDF-Page", 0.5, [6, 10], [12, 20], [24, 40]),
    b("shop", "Online-Shop / Schaufenster", "Online shop / showcase", "Alis-Moderaum, Perfect-Skin-Fashion", 0.4, [16, 24], [30, 50], [60, 100]),
    b("lager", "Warenwirtschaft / Lager", "Inventory / stock", "Alis-Moderaum (Warenwirtschaft)", 0.4, [16, 24], [30, 50], [60, 100]),
    b("scan", "Dokumente scannen / PDF ausfüllen", "Scan documents / fill PDF", "Workflow PDF", 0.7, [6, 10], [12, 20], [24, 40]),
    b("kipruef", "Text vor KI prüfen", "Check text before AI", "Sende-Prüfer", 0.7, [4, 8], [10, 16], [20, 32], true,
      "nachgesehen 2026-10-07: Sende-Prüfer verdeckt Angaben mit Modul 25"),
    b("dateipruef", "Datei / Anhang prüfen", "Check file / attachment", "Auslieferungsprüfer", 0.7, [4, 8], [10, 16], [20, 32], true,
      "nachgesehen 2026-10-07: Eingang „Foto · Datei prüfen“ und Mail-Anhänge"),
    b("datei", "Dateien sicher weitergeben", "Share files securely", "Datei-Post", 0.6, [8, 14], [16, 28], [32, 56], false, "Server nötig"),
    b("chat", "Kurznachrichten / Bilder intern", "Internal messages / images", "Kim-sync", 0.5, [8, 14], [16, 28], [32, 56]),
    b("liste", "Liste / Notizen", "List / notes", "Küchenzettel", 0.6, [3, 6], [8, 14], [16, 28]),
    b("auftrag", "Aufträge / Zeiterfassung", "Orders / time tracking", "Mein WorkFloh", 0.5, [12, 20], [24, 40], [50, 90]),
    b("rechnung", "Rechnung / Buchhaltung", "Invoicing / bookkeeping", "BookLedgerPro", 0.4, [12, 20], [24, 40], [50, 90], true,
      "nachgesehen 2026-10-07: src/domain/invoicing.js, money.js, angebote.js"),
    b("pinnwand", "Pinnwand / Fragen", "Board / questions", "Kimboard", 0.5, [6, 10], [12, 20], [24, 40]),
    b("suche", "Daten durchsuchen (offline)", "Search data (offline)", "Company Brain", 0.4, [10, 16], [20, 34], [40, 70]),
    b("schnitt", "Schnittstelle zu fremdem System", "Interface to another system", "", 0, [6, 12], [14, 26], [30, 60]),
    b("altdaten", "Datenübernahme aus Altbestand", "Data migration", "", 0, [4, 8], [10, 18], [20, 40]),
    b("neu", "Neu, ohne Vorlage", "New, no template", "", 0, [10, 20], [24, 44], [50, 100]),
  ];

  /* Faktoren je Baustein, ankreuzbar (Brief § 5b: ×1,0…×1,6). Schätzung. */
  WN.FAKTOREN = [
    { id: "offline", name: { de: "Offline", en: "Offline" }, mal: 1.15 },
    { id: "sprachen", name: { de: "Mehrsprachig", en: "Multilingual" }, mal: 1.2 },
    { id: "ki", name: { de: "KI", en: "AI" }, mal: 1.25 },
    { id: "druck", name: { de: "Druck / PDF", en: "Print / PDF" }, mal: 1.1 },
    { id: "nutzer", name: { de: "Mehrere Nutzer", en: "Several users" }, mal: 1.3 },
    { id: "server", name: { de: "Server", en: "Server" }, mal: 1.6 },
  ];
  WN.GROESSEN = ["klein", "mittel", "gross"];
})(typeof window !== "undefined" ? window : globalThis);
