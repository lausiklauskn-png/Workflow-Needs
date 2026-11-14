/* Rahmen für die Beispiele aus den fertigen Apps (Klaus 2026-11-14: „die Beispiele … aus meinen gebauten Apps testen“).
   Seit Rahmen 1/2 (Klaus 2026-11-13) fragt Needs Geräte, Abgleich, ohne Internet, eigene Programme, Datenort, Sicherung,
   Ort der KI, „Nicht gewünscht“ und „schlägt vor / macht es selbst“. Die Angaben hier stehen so in den CLAUDE.md der Repos
   (gelesen 2026-11-14), nicht geraten; Budget nur dort, wo ein Beispiel den Hinweis „über dem Budget“ zeigen soll (erfunden).
   Lädt NACH allen beispiel-*.js. */
(function (g) {
  "use strict";
  var WN = g.WN; if (!WN || !WN.beispiel || !WN.beispiel.rahmenSetzen) return;
  var setze = WN.beispiel.rahmenSetzen;
  var pro = { offline: "immer", eigene: ["ablageort", "hinher", "suche"], datenort: ["geraet", "ordner"], ki: "wahl" };
  function m(a, b) { return Object.assign({}, a, b); }

  setze("familienakte", {
    rahmen: m(pro, { geraete: ["android", "tablet", "windows", "browser"], abgleich: "abundzu", datenort: ["geraet", "ordner", "cloud"],
      sicherung: ["verschluesselt", "zweiterort", "allein"],
      eigeneText: "Gemeinsamer Pro-Tresor mit BookLedgerPro, Workflow PDF Pro und Private Brain Pro; Kalender von Google und Microsoft" }),
    nicht: ["Nichts wird ohne Bestätigung in die Akte abgelegt", "Mails werden nur als Entwurf vorbereitet, nie selbst versendet",
      "Keine Nutzungsdaten an den Hersteller"],
    handeln: [["Frist|Termin|Erinner", "vorschlagen"], ["Sicherung|sicher", "selbst"], ["einordn|zuordn|sortier", "vorschlagen"]],
  });
  setze("bookledgerpro", {
    rahmen: m(pro, { geraete: ["android", "windows", "browser"], abgleich: "abundzu", sicherung: ["verschluesselt", "zweiterort", "allein"],
      eigeneText: "Belege aus Workflow PDF Pro und Mails aus Private Brain Pro; Angebote aus Workflow Calculate und Needs" }),
    nicht: ["Keine Registrierkasse mit TSE", "Kein Bargeld in einer Kasse verwalten", "Keine Buchung ohne Bestätigung"],
    handeln: [["Konto|buch|Beleg", "vorschlagen"], ["Sicherung", "selbst"]],
  });
  setze("workflowpdfpro", {
    rahmen: m(pro, { geraete: ["android", "windows", "browser"], abgleich: "eins", sicherung: ["verschluesselt", "selbst"],
      eigeneText: "Scanner-Direktstart aus BookLedgerPro; gemeinsamer Tresorordner der Pro-Apps" }),
    nicht: ["Prüfen und Einordnen starten nie von selbst", "Kein Hochladen von Dokumenten an fremde Dienste ohne Bestätigung"],
    handeln: [["prüf|einordn|beschreib", "vorschlagen"]],
  });
  setze("privatebrainpro", {
    rahmen: m(pro, { geraete: ["android", "windows", "browser"], abgleich: "eins", sicherung: ["verschluesselt", "selbst"],
      eigeneText: "Mails an die Familienakte und an BookLedgerPro teilen; eigenes Postfach über IMAP/SMTP" }),
    nicht: ["Originale werden nie verändert oder verschoben", "Keine Mail geht ohne Tipp hinaus"],
    handeln: [["aufräum|Newsletter|abmeld", "vorschlagen"], ["Sicherung", "selbst"]],
  });
  setze("proverbund", {
    rahmen: m(pro, { geraete: ["android", "tablet", "windows", "browser"], abgleich: "abundzu", datenort: ["geraet", "ordner", "cloud"],
      sicherung: ["verschluesselt", "zweiterort", "selbst", "allein"],
      eigeneText: "Ein Tresor und ein Passwort für alle vier Apps; Dateien gehen zwischen den Apps hin und her" }),
    nicht: ["Nichts wird ohne Bestätigung abgelegt oder gebucht", "Keine Mail geht ohne Tipp hinaus", "Keine Nutzungsdaten an den Hersteller"],
    handeln: [["Frist|Termin|Konto|buch|prüf|einordn", "vorschlagen"], ["Sicherung", "selbst"]],
  });
  setze("rezeptbuch", {
    rahmen: { geraete: ["android", "iphone", "tablet", "browser"], offline: "immer", abgleich: "abundzu", eigene: ["hinher"],
      eigeneText: "Rezepte zwischen Mein Rezeptbuch, Muttis Rezeptbuch und Mein Mixarium austauschen", datenort: ["geraet"],
      sicherung: ["selbst"], ki: "dienst" },
    nicht: ["Kein Konto und keine Anmeldung beim Hersteller"],
    handeln: [["Kategorie|einordn", "vorschlagen"]],
  });
  setze("mixarium", {
    rahmen: { geraete: ["android", "iphone", "tablet", "browser"], offline: "immer", abgleich: "abundzu", eigene: ["hinher"],
      eigeneText: "Rezepte mit Mein Rezeptbuch austauschen", datenort: ["geraet"], sicherung: ["selbst"], ki: "dienst" },
    nicht: ["Kein Konto und keine Anmeldung beim Hersteller"],
  });
  setze("mixariumpage", {
    rahmen: { geraete: ["browser"], offline: "nein", abgleich: "eins", datenort: ["geraet"], ki: "keine" },
    nicht: ["Keine fremden Dienste beim Laden der Seite"],
  });
  setze("calculate", {
    rahmen: { geraete: ["browser", "tablet", "android"], offline: "immer", abgleich: "abundzu", eigene: ["hinher"],
      eigeneText: "Angebote an Mein WorkFloh, Tomys Hub und BookLedgerPro", datenort: ["geraet"], sicherung: ["verschluesselt", "selbst"],
      ki: "dienst", budgetEuro: 2500 },
    nicht: ["Keine Live-Versandtarife", "Kein Marktpreis zählt, bevor er von Hand bestätigt ist"],
    handeln: [["Preis|Recherche|Lieferant", "vorschlagen"]],
  });
  setze("kimsync", {
    rahmen: { geraete: ["android", "iphone", "tablet", "windows", "browser"], offline: "unterwegs", abgleich: "sofort", eigene: ["hinher"],
      eigeneText: "Große Dateien über Datei-Post", datenort: ["geraet", "server"], sicherung: ["verschluesselt", "selbst", "zweiterort"],
      ki: "geraet", budgetMonatEuro: 49, budgetMonate: 24, budgetWartung: true },
    nicht: ["Kein Konto und keine Telefonnummer", "Kein Klartext auf dem Relais"],
  });
  setze("workflohpage", {
    rahmen: { geraete: ["browser"], offline: "unterwegs", abgleich: "eins", datenort: ["geraet"], ki: "keine" },
    nicht: ["Keine echten Firmendaten in der Vorlage"],
  });
  setze("dateiorganizer", {
    rahmen: { geraete: ["browser", "tablet", "windows", "android"], offline: "immer", abgleich: "eins", eigene: ["ablageort", "hinher"],
      eigeneText: "Der sortierte Ordner wird in die Familienakte übernommen", datenort: ["geraet", "ordner"], sicherung: ["selbst"], ki: "dienst" },
    nicht: ["Originale werden nie verändert oder verschoben"],
    handeln: [["sortier|einordn|Archivnummer", "vorschlagen"]],
  });
  setze("needs", {
    rahmen: { geraete: ["browser", "tablet", "windows"], offline: "immer", abgleich: "abundzu", eigene: ["hinher"],
      eigeneText: "Aufträge an Mein WorkFloh und Tomys Hub, Angebote an BookLedgerPro", datenort: ["geraet"],
      sicherung: ["verschluesselt", "selbst"], ki: "keine" },
    nicht: ["Der Stundensatz steht nie auf einem Kundenblatt"],
  });
  setze("toolpoint", {
    rahmen: { geraete: ["browser"], offline: "unterwegs", abgleich: "eins", eigene: ["suche"], datenort: ["server"], ki: "geraet" },
    nicht: ["Keine Preise und keine Provision (Stufe 1)", "Keine geschönten Messwerte"],
  });
})(typeof window !== "undefined" ? window : globalThis);
