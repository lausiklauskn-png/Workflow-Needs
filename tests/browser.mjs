/* Proben im echten Browser. node tests/browser.mjs
   Rückgabe 0 = grün · 1 = rot · 2 = nicht lauffähig (kein playwright-core
   oder kein Chromium) — „nicht lauffähig" ist NIE grün. */
import { findeChromium } from "./chromium-finden.mjs";
import { starteServer } from "./server.mjs";

let chromium;
try { ({ chromium } = await import("playwright-core")); } catch { console.log("nicht lauffähig: playwright-core fehlt (npm install)"); process.exit(2); }
const pfad = findeChromium();
if (!pfad) { console.log("nicht lauffähig: kein Chromium gefunden"); process.exit(2); }

let gruen = 0, rot = 0;
function ok(name, wahr, mehr) {
  if (wahr) gruen++;
  else { rot++; console.log("ROT  " + name + (mehr !== undefined ? "  — " + (typeof mehr === "string" ? mehr : JSON.stringify(mehr)) : "")); }
}

const { server, url } = await starteServer();
const browser = await chromium.launch({ executablePath: pfad });
const fehler = [];
async function seite(breite, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: breite, height: 900 } }, opts || {}));
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fehler.push(e.message));
  return { ctx, p };
}
async function reiter(p, r) { await p.click(`[data-reiter="${r}"]`); }
/* Drucken ohne Dialog: window.print wird gestellt, das Blatt bleibt in #druck */
async function druck(p, knopf) {
  await p.evaluate(() => { window.print = () => { window.__gedruckt = (window.__gedruckt || 0) + 1; }; });
  await p.click(knopf);
  return p.evaluate(() => ({ text: document.getElementById("druck").textContent, html: document.getElementById("druck").innerHTML,
    h1: (document.querySelector("#druck h1") || {}).textContent || "", unterschriften: document.querySelectorAll("#druck .unterschriften > div").length,
    gedruckt: window.__gedruckt || 0 }));
}

try {
  /* ── Start mit Beispiel ── */
  const { ctx, p } = await seite(1300);
  await p.goto(url);
  await p.waitForSelector("body[data-bereit]");
  ok("START: Beispiel „Boutique“ liegt beim ersten Öffnen da", await p.locator("[data-vorgang]").count() === 1);
  ok("START: Titel heißt „Workflow Bedarfsanalyse“", (await p.title()) === "Workflow Bedarfsanalyse");
  ok("START: Modul 25 ist geladen", await p.evaluate(() => !!window.SbkimPseudonym) && await p.locator("[data-modul25-fehlt]").count() === 0);

  /* Firmendaten und ein auffälliger Satz */
  await reiter(p, "einstellungen");
  await p.fill('[data-firma="name"]', "Werkstatt Prüf-Firma");
  await p.fill('[data-firma="kontakt"]', "kontakt@werkstatt.example");
  await reiter(p, "umfang");
  await p.fill("#satz-vorgang", "73"); await p.press("#satz-vorgang", "Tab");
  ok("SATZ: abweichender Satz steht mit beiden Zahlen da", (await p.textContent("[data-satz-abweichung]")).includes("73") && (await p.textContent("[data-satz-abweichung]")).includes("80"));

  /* ── Stufe 1: interner Eintrag und Notiz ── */
  await reiter(p, "bedarf");
  await p.fill('[data-neu-eintrag="1"]', "INTERN-PRUEFWORT-7Q"); await p.click('[data-dazu="1"]');
  const neu = p.locator('[data-bereich="1"] [data-eintrag]').last();
  await neu.locator("[data-sichtbar]").uncheck();
  ok("BEDARF: interner Eintrag ist sichtbar abgesetzt (Schloss, gestrichelt, Hinweis)", (await neu.getAttribute("class")).includes("intern") && (await neu.textContent()).includes("erscheint nicht im Kundenausdruck") && (await neu.textContent()).includes("🔒"));
  await p.fill('[data-notiz="2"]', "NOTIZ-PRUEFWORT-3K");
  await p.locator('[data-notiz="2"]').blur();
  ok("BEDARF: Fortschritt „n von 18 ausgefüllt“", /\d+ von 18 ausgefüllt/.test(await p.textContent("[data-fortschritt]")));
  const prot = await druck(p, "#druck-protokoll");
  ok("PROTOKOLL: Druck wurde angestoßen", prot.gedruckt === 1);
  ok("PROTOKOLL: interner Eintrag weder sichtbar noch im DOM des Druckblatts", !prot.html.includes("INTERN-PRUEFWORT-7Q"));
  ok("PROTOKOLL: interne Notiz weder sichtbar noch im DOM", !prot.html.includes("NOTIZ-PRUEFWORT-3K"));
  ok("PROTOKOLL: interner Bereich-Eintrag (B-05) fehlt", !prot.html.includes("Vorgänger-Agentur"));
  ok("PROTOKOLL: Titel „Bedarfsprotokoll“, nirgends „Analyse“", prot.h1 === "Bedarfsprotokoll" && !/analyse/i.test(prot.text));
  ok("PROTOKOLL: keine Stunden-Schätzung und kein Preis", !/Stundensatz|netto|Kosten|73,00|\d+–\d+[,\d]* h\b/.test(prot.text), prot.text.match(/.{0,30}(Stundensatz|netto|Kosten|73,00).{0,30}/));
  ok("PROTOKOLL: Firmendaten im Kopf, zwei Unterschriftsfelder, Kennungen", prot.text.includes("Werkstatt Prüf-Firma") && prot.unterschriften === 2 && prot.text.includes("B-06"));
  ok("PROTOKOLL: Kennungslücken bleiben (B-05 fehlt, B-04 und B-06 stehen)", !/B-05(?!\d)/.test(prot.text) && /B-04(?!\d)/.test(prot.text) && /B-06(?!\d)/.test(prot.text), prot.text.match(/B-\d\d/g));
  const ana = await druck(p, "#druck-analyse");
  ok("ANALYSE: interner Eintrag und Notiz stehen drin", ana.html.includes("INTERN-PRUEFWORT-7Q") && ana.html.includes("NOTIZ-PRUEFWORT-3K"));
  ok("ANALYSE: überschrieben „INTERN, nicht an den Kunden“, Titel nicht „Bedarfsprotokoll“", ana.text.includes("INTERN, nicht an den Kunden") && ana.h1 === "Bedarfsanalyse" && !ana.text.includes("Bedarfsprotokoll"));
  await p.click("#vorschau-protokoll");
  const vs = await p.evaluate(() => ({ kopf: document.querySelector("#vorschau .vorschau-kopf").textContent, blatt: document.querySelector("#vorschau .blatt").textContent, n: document.querySelector("[data-ausgeblendet]").dataset.ausgeblendet }));
  ok("VORSCHAU: „N Punkte sind ausgeblendet“ steht in der Vorschau, nicht auf dem Blatt", /\d+ Punkte sind ausgeblendet/.test(vs.kopf) && !vs.blatt.includes("ausgeblendet") && Number(vs.n) >= 3, vs.n);
  ok("VORSCHAU: zeigt genau das Kundenblatt", !vs.blatt.includes("INTERN-PRUEFWORT-7Q") && vs.blatt.includes("Bedarfsprotokoll"));
  await p.keyboard.press("Escape");

  /* ── Angebot und Nachtrag: kein Satz ── */
  await reiter(p, "angebot");
  const an = await druck(p, "#druck-angebot");
  const SATZ = /(^|[^\d.,])73(,00)? ?€|Stundensatz|€\/h/;
  ok("ANGEBOT: kein Stundensatz (gestellt 73 €)", !SATZ.test(an.text), an.text.match(/.{0,30}73.{0,30}/g));
  ok("ANGEBOT: Firmendaten und beide Unterschriftsfelder", an.text.includes("Werkstatt Prüf-Firma") && an.unterschriften === 2);
  ok("ANGEBOT: keine Stunden, Faktoren, Wiederverwendung, Markt, Kosten-Nutzen", !/Faktor|Wiederverwendung|Markt|Nutzen|Puffer| h\b/.test(an.text), an.text.match(/.{0,20}(Faktor|Wiederverwendung|Markt|Nutzen|Puffer| h\b).{0,20}/));
  ok("ANGEBOT: Netto, USt, Brutto (Regelbesteuerung)", an.text.includes("Summe netto") && an.text.includes("Umsatzsteuer 19 %") && an.text.includes("Gesamt brutto"));
  ok("ANGEBOT: „Alle Zeitangaben sind Schätzungen“ und Verweis auf die Fassung", an.text.includes("Alle Zeitangaben sind Schätzungen") && an.text.includes("Bedarfsprotokoll, Fassung 3"));
  ok("ANGEBOT: Bausteine unter der Grenzlinie stehen als „später / optional“", an.text.includes("Später / optional") && an.text.includes("Datenübernahme"));
  await reiter(p, "fassungen");
  const na = await druck(p, "#druck-nachtrag");
  ok("NACHTRAG: kein Stundensatz (gestellt 73 €)", !SATZ.test(na.text), na.text.match(/.{0,30}73.{0,30}/g));
  ok("NACHTRAG: Titel, Unterschied, Termin, zwei Unterschriften, Satz für den Kunden", /Nachtrag zu AN-\d{4}-\d{4} \(Fassung 3\)/.test(na.h1) && na.text.includes("Unterschied") && na.text.includes("Neuer Termin") && na.unterschriften === 2 && na.text.includes("Mit Ihrer Unterschrift gilt Fassung 3"));
  ok("NACHTRAG: keine Satz-Zeile aus dem Vergleich", !/Satz \d/.test(na.text));

  /* § 19 */
  await reiter(p, "einstellungen"); await p.check("#ust-p19");
  await reiter(p, "angebot");
  const an19 = await druck(p, "#druck-angebot");
  ok("UST: § 19 → Hinweis, keine USt-Zeile", an19.text.includes("Gemäß § 19 UStG wird keine Umsatzsteuer berechnet") && !an19.text.includes("Umsatzsteuer 19 %"));
  await reiter(p, "einstellungen"); await p.check("#ust-regel");

  /* ── Vergleich und Bauauftrag ── */
  await reiter(p, "fassungen");
  const akt = await p.$$eval("[data-vg-baustein]", (z) => z.map((x) => x.dataset.aktion));
  ok("VERGLEICH: F2→F3 zeigt NEU BAUEN, ANPASSEN, ENTFERNEN", akt.includes("NEU BAUEN") && akt.includes("ANPASSEN") && akt.includes("ENTFERNEN"), akt);
  ok("VERGLEICH: Satzänderung als eigene Zeile", await p.locator("[data-vg-satz]").count() === 1);
  ok("BAUAUFTRAG: Haken Stunden an, Euro aus (Vorgabe)", await p.isChecked("#md-stunden") && !(await p.isChecked("#md-euro")));
  ok("BAUAUFTRAG: zeigt vor dem Speichern „verdeckt: ja“", (await p.getAttribute("[data-verdeckt]", "data-verdeckt")) === "ja");
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#md-speichern")]);
  const fs = await import("node:fs");
  const md = fs.readFileSync(await dl.path(), "utf8");
  ok("BAUAUFTRAG: Datei heißt Bauauftrag-V-…-F3.md", /^Bauauftrag-V-\d{4}-\d{4}-F3\.md$/.test(dl.suggestedFilename()), dl.suggestedFilename());
  ok("BAUAUFTRAG: keine Kundendaten (Firma, Ansprechpartnerin, Mail)", !md.includes("Boutique Beispiel") && !md.includes("Erika Muster") && !md.includes("boutique.example"));
  ok("BAUAUFTRAG: „Weitere Namen“ verdeckt (Lindenstraße-Passage)", !md.includes("Lindenstraße"));
  ok("BAUAUFTRAG: kein €-Betrag, kein Satz", !/€/.test(md) && !/73/.test(md.replace(/\d{4}-\d{2}-\d{2}/g, "")));
  /* Antwort einfügen */
  await p.fill("#antwort", "Seite für ⟦KUNDE-1⟧ fertig, Kontakt ⟦KUNDE-2⟧, ⟦NAME-77⟧ unklar.");
  await p.click("#aufdecken");
  const aufg = await p.textContent("[data-aufgedeckt]");
  ok("ANTWORT: Klartext auf dem Schirm, unbekannter Platzhalter genannt", aufg.includes("Seite für Boutique Beispiel fertig") && aufg.includes("Erika Muster") && (await p.getAttribute("[data-unbekannt]", "data-unbekannt")) === "⟦NAME-77⟧");
  /* Einlesen derselben MD */
  await p.setInputFiles("#md-einlesen", { name: "b.md", mimeType: "text/markdown", buffer: Buffer.from(md) });
  await p.waitForFunction(() => /schon da|Eingelesen/.test((document.querySelector("[data-meldung]") || {}).textContent || ""), null, { timeout: 5000 }).catch(() => {});
  ok("EINLESEN: dieselbe Fassung wird als gleich erkannt", (await p.textContent("[data-meldung]")).includes("ist schon da und gleich"), await p.textContent("[data-meldung]"));
  await p.setInputFiles("#md-einlesen", { name: "x.md", mimeType: "text/markdown", buffer: Buffer.from("---\nart: rechnung\nformat: 1\n---\n") });
  await p.waitForFunction(() => /Nicht eingelesen/.test((document.querySelector("[data-meldung]") || {}).textContent || ""), null, { timeout: 5000 }).catch(() => {});
  ok("EINLESEN: Fremdes wird mit Grund abgelehnt", (await p.textContent("[data-meldung]")).includes("Nicht eingelesen"));

  /* ── Unterschriebene Fassung: nur lesen ── */
  await p.click('[data-fassung="1"] button');
  const ro = await p.evaluate(() => {
    /* Die Sterne der Mitarbeiter hängen am Vorgang, nicht an der Fassung — sie bleiben nach der Unterschrift erfassbar (Abnahme) */
    const e = [...document.querySelectorAll("#inhalt input:not([type=file]), #inhalt textarea, [data-bereich] button")].filter((x) => !x.closest("[data-sterne]"));
    return { alle: e.length, offen: e.filter((x) => !x.disabled).length, banner: !!document.querySelector("[data-nur-lesen]") };
  });
  ok("NUR LESEN: unterschriebene Fassung ist nicht editierbar", ro.banner && ro.alle > 10 && ro.offen === 0, ro);
  await p.click("[data-nur-lesen] button");

  /* ── Sprache ── */
  await p.click("#sprache");
  ok("SPRACHE: Englisch — Titel „Workflow-Needs“, Reiter englisch", (await p.title()) === "Workflow-Needs" && (await p.textContent('[data-reiter="bedarf"]')) === "1 Needs");
  ok("SPRACHE: Wahl unter eigenem Schlüssel", await p.evaluate(() => localStorage.getItem("workflowneeds_lang") === "en" && localStorage.getItem("toolpoint_lang") === null));
  await reiter(p, "bedarf");
  const en = await druck(p, "#druck-protokoll");
  ok("SPRACHE: Ausdruck in der gewählten Sprache", en.h1 === "Needs record" && en.text.includes("Client"));
  await p.click("#sprache");

  /* ── Ist-Stunden (intern) und Kalibrierung ── */
  await reiter(p, "fassungen");
  ok("IST: Feld nur an unterschriebenen Fassungen", await p.locator("[data-ist]").count() >= 1 && await p.locator('[data-fassung="3"] ~ [data-ist-zeile="3"]').count() === 0);
  await p.fill('[data-ist="1"]', "31,5".replace(",", ".")); await p.press('[data-ist="1"]', "Tab");
  await reiter(p, "tabellen");
  ok("IST: Tabelle „Eigene Aufträge“ zeigt Schätzung, Ist und Abweichung", (await p.getAttribute('[data-tabelle="eigene-auftraege"]', "data-anzahl")) === "1" && /31,5/.test(await p.textContent('[data-tabelle="eigene-auftraege"]')) && /%/.test(await p.textContent('[data-tabelle="eigene-auftraege"]')));
  const kal = await p.textContent('[data-tabelle="kalibrierung"]');
  ok("BILDSCHIRME: gezählte Zahlen und die Regel stehen da", /Gezählt im Code/.test(kal) && (kal.match(/nicht gezählt/g) || []).length === 1, (kal.match(/nicht gezählt/g) || []).length);
  await reiter(p, "angebot");
  const anI = await druck(p, "#druck-angebot");
  ok("IST: nicht im Angebot", !/31,5/.test(anI.text));

  /* ── Gespeichert über Neuladen ── */
  await p.evaluate(() => window.WNApp.jetztSpeichern());
  await p.reload(); await p.waitForSelector("body[data-bereit]");
  await reiter(p, "umfang");
  ok("SPEICHER: Satz des Vorgangs übersteht Neuladen (IndexedDB)", (await p.inputValue("#satz-vorgang")) === "73");
  await ctx.close();

  /* ── Anhänge am Vorgang und verschlüsselte Sicherung ── */
  {
    const fsm = await import("node:fs");
    const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n% Anhangpruefwort\n"), Buffer.from(Array.from({ length: 3000 }, (_, i) => (i * 13) & 255))]);
    const eml = Buffer.from("From: a@kunde.example\r\nSubject: Bitte\r\n\r\nText\r\n");
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
    const s = await seite(1100, { acceptDownloads: true });
    await s.p.goto(url); await s.p.waitForSelector("body[data-bereit]");
    ok("ERINNERUNG: nur das Beispiel → keine Sicherungs-Erinnerung", await s.p.locator("[data-sicherung-erinnerung]").count() === 0);
    await s.p.click("#neuer-vorgang");
    ok("ERINNERUNG: eigener Vorgang, nie gesichert → Erinnerung steht da", (await s.p.getAttribute("[data-sicherung-erinnerung]", "data-sicherung-erinnerung")) === "nie");
    /* § 1b: ein Vorgang OHNE Kundendaten — kein ⟦ auf dem Kundenblatt, eine Schreiblinie statt dessen */
    await reiter(s.p, "angebot");
    const leerA = await druck(s.p, "#druck-angebot");
    await reiter(s.p, "bedarf");
    const leerP = await druck(s.p, "#druck-protokoll");
    ok("KUNDENBLATT: Angebot und Bedarfsprotokoll ohne Kundendaten tragen kein ⟦, sondern eine Schreiblinie", !leerA.text.includes("⟦") && !leerP.text.includes("⟦") && leerA.html.includes("data-schreiblinie") && leerP.html.includes("data-schreiblinie"), [leerA.text.slice(0, 120)]);
    await reiter(s.p, "vorgaenge");
    await s.p.setInputFiles("#anhang-datei", [
      { name: "Anhangpruefwort-Plan.pdf", mimeType: "application/pdf", buffer: pdf },
      { name: "Mail vom Kunden.eml", mimeType: "message/rfc822", buffer: eml }]);
    await s.p.waitForFunction(() => document.querySelectorAll("[data-anhang]").length === 2);
    await s.p.evaluate((b64) => {
      const bin = atob(b64), a = new Uint8Array(bin.length); for (let i = 0; i < a.length; i++) a[i] = bin.charCodeAt(i);
      const dt = new DataTransfer(); dt.items.add(new File([a], "image.png", { type: "image/png" }));
      document.getElementById("anhaenge").dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
    }, png.toString("base64"));
    await s.p.waitForFunction(() => document.querySelectorAll("[data-anhang]").length === 3);
    const arten = await s.p.$$eval("[data-anhang]", (z) => z.map((x) => x.dataset.art + "|" + x.textContent));
    ok("ANHANG: PDF bleibt PDF, .eml bleibt E-Mail, Screenshot wird Bild", arten[0].startsWith("PDF|") && arten[1].startsWith("E-Mail|") && arten[2].startsWith("Bild|") && /Screenshot-\d{4}-\d{2}-\d{2}-\d{6}\.png/.test(arten[2]), arten);
    ok("ANHANG: Kennungen A-01…A-03 aus dem Zähler", arten.every((a, i) => a.includes("A-0" + (i + 1))), arten);
    ok("ANHANG: Bild hat eine Vorschau", await s.p.locator("[data-anhang] img.anhang-bild").count() === 1);
    await s.p.evaluate(() => window.WNApp.jetztSpeichern());
    await s.p.reload(); await s.p.waitForSelector("body[data-bereit]");
    let zurueck = Buffer.alloc(0), zname = "";
    if (await s.p.locator('[data-anhang-laden="A-01"]').count() === 1) {
      const [dlA] = await Promise.all([s.p.waitForEvent("download"), s.p.click('[data-anhang-laden="A-01"]')]);
      zurueck = fsm.readFileSync(await dlA.path()); zname = dlA.suggestedFilename();
    }
    ok("ANHANG: übersteht Neuladen und kommt Byte für Byte heraus, unter seinem Namen", zurueck.equals(pdf) && zname === "Anhangpruefwort-Plan.pdf", [zurueck.length, zname]);
    await reiter(s.p, "fassungen");
    const [dlM] = await Promise.all([s.p.waitForEvent("download"), s.p.click("#md-speichern")]);
    ok("ANHANG: weder Name noch Inhalt in der Bauauftrags-MD", !fsm.readFileSync(await dlM.path(), "utf8").includes("Anhangpruefwort"));
    await reiter(s.p, "angebot");
    const anA = await druck(s.p, "#druck-angebot");
    ok("ANHANG: nicht im Angebot", !anA.html.includes("Anhangpruefwort") && !anA.html.includes("A-01"));
    const [dlU] = await Promise.all([s.p.waitForEvent("download"), s.p.click("#uebergabe-speichern")]);
    const ueb = JSON.parse(fsm.readFileSync(await dlU.path(), "utf8"));
    const uf = (ueb.auftraege && ueb.auftraege[0] && ueb.auftraege[0].files) || [];
    ok("ÜBERGABE: Auftragsdatei für WorkFloh mit allen Anhängen (Name und Art bleiben)", ueb.wf === "forward" && /^Auftrag_V-\d{4}-\d{4}-F1\.json$/.test(dlU.suggestedFilename()) &&
      uf.length === 3 && uf[0].name === "Anhangpruefwort-Plan.pdf" && Buffer.from(uf[0].data.split(",")[1], "base64").equals(pdf) && uf[1].mime === "message/rfc822" && uf[2].mime === "image/png", [dlU.suggestedFilename(), uf.map((x) => x.name + "|" + x.mime)]);
    /* Sichern */
    await reiter(s.p, "einstellungen");
    await s.p.fill('[data-firma="name"]', "Sicherung Prüf-Firma");
    await s.p.fill("#sicherung-pw", "ein-langes-pw-1"); await s.p.fill("#sicherung-pw2", "anders-langes-pw");
    await s.p.click("#sicherung-machen");
    ok("SICHERUNG: ungleiche Passwörter → kein Download, Meldung", (await s.p.textContent("#sicherung-meldung")).includes("nicht gleich"));
    await s.p.fill("#sicherung-pw2", "ein-langes-pw-1");
    const [dlS] = await Promise.all([s.p.waitForEvent("download", { timeout: 20000 }), s.p.click("#sicherung-machen")]);
    const sich = fsm.readFileSync(await dlS.path(), "utf8");
    ok("SICHERUNG: Datei heißt Workflow-Needs-Sicherung-JJJJ-MM-TT.json", /^Workflow-Needs-Sicherung-\d{4}-\d{2}-\d{2}\.json$/.test(dlS.suggestedFilename()));
    ok("SICHERUNG: kein Klartext in der Datei (Kunde, Anhang, Firma)", !sich.includes("Anhangpruefwort") && !sich.includes("Boutique") && !sich.includes("Prüf-Firma") && !sich.includes("V-20") && JSON.parse(sich).paket.ct.length > 1000);
    ok("SICHERUNG: Passwortfelder sind danach leer", (await s.p.inputValue("#sicherung-pw")) === "" && (await s.p.inputValue("#sicherung-pw2")) === "");
    await reiter(s.p, "vorgaenge");
    ok("ERINNERUNG: nach dem Sichern verschwunden", await s.p.locator("[data-sicherung-erinnerung]").count() === 0);
    await s.ctx.close();
    /* Zurückholen auf einem frischen Gerät */
    const z = await seite(1100, { acceptDownloads: true });
    await z.p.goto(url); await z.p.waitForSelector("body[data-bereit]");
    await reiter(z.p, "einstellungen");
    await z.p.setInputFiles("#sicherung-datei", { name: dlS.suggestedFilename(), mimeType: "application/json", buffer: Buffer.from(sich) });
    await z.p.waitForFunction(() => !document.getElementById("sicherung-zurueck-meldung").hidden);
    await z.p.fill("#sicherung-pw-zurueck", "falsches-pw-123"); await z.p.click("#sicherung-holen");
    await z.p.waitForFunction(() => /passt nicht/.test(document.getElementById("sicherung-zurueck-meldung").textContent), null, { timeout: 20000 }).catch(() => {});
    ok("SICHERUNG: falsches Passwort → eigene Meldung, nichts dazu", (await z.p.textContent("#sicherung-zurueck-meldung")).includes("passt nicht") && await z.p.evaluate(() => window.WNApp.S.vorgaenge.length) === 1);
    await z.p.fill("#sicherung-pw-zurueck", "ein-langes-pw-1"); await z.p.click("#sicherung-holen");
    await z.p.waitForFunction(() => /Vorgänge dazu/.test((document.querySelector("[data-meldung]") || {}).textContent || ""), null, { timeout: 20000 }).catch(() => {});
    const mz = await z.p.textContent("[data-meldung]").catch(() => "");
    ok("SICHERUNG: Zurückholen fügt hinzu, das Beispiel bleibt (1 dazu, 1 schon da)", /1 Vorgänge dazu, 1 schon da/.test(mz) && await z.p.evaluate(() => window.WNApp.S.vorgaenge.length) === 2, mz);
    ok("SICHERUNG: Firmendaten kommen mit, wo noch keine standen", (await z.p.inputValue('[data-firma="name"]')) === "Sicherung Prüf-Firma", await z.p.inputValue('[data-firma="name"]'));
    await reiter(z.p, "vorgaenge");
    const neuId = await z.p.evaluate(() => window.WNApp.S.vorgaenge.filter((v) => !v.beispiel)[0].id);
    await z.p.click(`[data-vorgang="${neuId}"] button`);
    const [dlZ] = await Promise.all([z.p.waitForEvent("download"), z.p.click('[data-anhang-laden="A-01"]')]);
    ok("SICHERUNG: Anhang kommt auf dem frischen Gerät Byte für Byte zurück", fsm.readFileSync(await dlZ.path()).equals(pdf) && dlZ.suggestedFilename() === "Anhangpruefwort-Plan.pdf");
    await z.p.reload(); await z.p.waitForSelector("body[data-bereit]");
    ok("SICHERUNG: Zurückgeholtes übersteht Neuladen (samt Anhängen)", await z.p.evaluate(() => window.WNApp.S.vorgaenge.some((v) => (v.anhaenge || []).length === 3 && v.anhaenge.every((a) => a.blob instanceof Blob))));
    await z.ctx.close();
  }

  /* ── Stufe 3: Beispiele, Rechtsblätter mit Unterschrift, Sterne ── */
  {
    const fsm = await import("node:fs");
    const s = await seite(1100, { acceptDownloads: true });
    await s.p.goto(url); await s.p.waitForSelector("body[data-bereit]");
    const anzahl = () => s.p.evaluate(() => window.WNApp.S.vorgaenge.length);
    await reiter(s.p, "einstellungen");
    await s.p.fill('[data-firma="name"]', "Werkstatt Prüf-Firma");
    const opts = await s.p.$$eval("#beispiel-wahl option", (o) => o.map((x) => x.value));
    ok("BEISPIELE: Auswahl mit Boutique, den vier Beispielen und Tomys Hub gesamt", opts.join() === "boutique,tomys,psb,alis,eigene,tomys-gesamt", opts);
    await s.p.selectOption("#beispiel-wahl", "tomys"); await s.p.click("#beispiel-laden");
    await s.p.waitForFunction(() => window.WNApp.S.vorgaenge.length === 2, null, { timeout: 5000 }).catch(() => {});
    ok("BEISPIELE: ein Beispiel einzeln laden", await anzahl() === 2 && await s.p.evaluate(() => window.WNApp.S.vorgaenge.some((v) => v.bid === "tomys")));
    await s.p.selectOption("#beispiel-wahl", "tomys"); await s.p.click("#beispiel-laden");
    await s.p.waitForFunction(() => /schon da/.test((document.querySelector("[data-meldung]") || {}).textContent || ""), null, { timeout: 5000 }).catch(() => {});
    ok("BEISPIELE: zweimal laden legt keinen Doppel an", await anzahl() === 2 && /schon da/.test(await s.p.textContent("[data-meldung]")));
    await s.p.click("#beispiel-alle");
    await s.p.waitForFunction(() => /Beispiele geladen/.test((document.querySelector("[data-meldung]") || {}).textContent || ""), null, { timeout: 8000 }).catch(() => {});
    ok("BEISPIELE: „Alle laden“ ergänzt nur die fehlenden (4 geladen, 2 schon da)", await anzahl() === 6 && /4 Beispiele geladen, 2 waren schon da/.test(await s.p.textContent("[data-meldung]")), await s.p.textContent("[data-meldung]").catch(() => ""));
    await s.p.click("#beispiel-alle");
    await s.p.waitForFunction(() => /0 Beispiele geladen/.test((document.querySelector("[data-meldung]") || {}).textContent || ""), null, { timeout: 8000 }).catch(() => {});
    ok("BEISPIELE: zweites „Alle laden“ ohne Doppel", await anzahl() === 6);
    await s.p.evaluate(() => window.WNApp.jetztSpeichern());
    await s.p.reload(); await s.p.waitForSelector("body[data-bereit]");
    ok("BEISPIELE: alle sechs überstehen das Neuladen, jedes einmal", await s.p.evaluate(() => { const b = window.WNApp.S.vorgaenge.map((v) => v.bid).sort().join(); return b; }) === "alis,boutique,eigene,psb,tomys,tomys-gesamt");
    /* Tomys Hub gesamt: die erfundenen Bilder, PDFs und E-Mails hängen als echte Dateien am Vorgang
       und gehen mit der Übergabe an WorkFloh — dort werden sie wieder Dateien am Auftrag. */
    const ga = await s.p.evaluate(() => { const v = window.WNApp.S.vorgaenge.find((x) => x.bid === "tomys-gesamt");
      return { id: v.id, n: (v.anhaenge || []).length, mit: (v.anhaenge || []).filter((a) => a.blob instanceof Blob && a.blob.size > 500 && a.blob.type === a.typ).map((a) => a.name + "|" + a.typ) }; });
    ok("GESAMT: sieben Beispiel-Dateien hängen nach dem Neuladen am Vorgang, Byte für Byte mit Typ", ga.n === 7 && ga.mit.length === 7 && ga.mit.some((x) => x === "Anfrage-Tomys-Hub.eml|message/rfc822") && ga.mit.some((x) => /\.pdf\|application\/pdf$/.test(x)) && ga.mit.some((x) => /\.jpg\|image\/jpeg$/.test(x)), ga);
    await s.p.evaluate((id) => { window.WNApp.S.aktiv = id; }, ga.id);
    await reiter(s.p, "vorgaenge");
    ok("GESAMT: Anhänge-Karte zeigt die sieben Dateien", (await s.p.getAttribute("#anhaenge", "data-anhaenge")) === "7");
    await reiter(s.p, "angebot");
    const [dlG] = await Promise.all([s.p.waitForEvent("download"), s.p.click("#uebergabe-speichern")]);
    const ug = JSON.parse(fsm.readFileSync(await dlG.path(), "utf8")), gfiles = ug.auftraege[0].files || [];
    const eml = gfiles.find((x) => x.name === "Anfrage-Tomys-Hub.eml");
    ok("GESAMT: Übergabe trägt alle Dateien mit Typ — 2 E-Mails, 2 PDFs, 3 Bilder, dazu Erklärung und Vereinbarung", gfiles.filter((x) => x.mime === "message/rfc822").length === 2 && gfiles.filter((x) => x.mime === "application/pdf").length === 2 && gfiles.filter((x) => /^image\//.test(x.mime)).length === 3 && gfiles.filter((x) => x.mime === "text/html").length === 2, gfiles.map((x) => x.name + "|" + x.mime));
    ok("GESAMT: die E-Mail kommt in der Übergabe unverändert an (mit ihrem Bild-Anhang)", !!eml && eml.data.startsWith("data:message/rfc822;base64,") && /Auftragszettel-Papier\.jpg/.test(Buffer.from(eml.data.split(",")[1], "base64").toString("utf8")));
    ok("GESAMT: Kunde der Übergabe ist Tomys Hub, kein Satz", ug.auftraege[0].data.nameFirma === "Tomys Hub" && !/Stundensatz/.test(JSON.stringify(ug.auftraege[0].data)));
    await reiter(s.p, "tabellen");
    const ik = await s.p.evaluate(() => [...document.querySelectorAll("[data-ist-kosten]")].map((x) => x.closest("tr").getAttribute("data-ist-vergleich") + "=" + x.getAttribute("data-ist-kosten")));
    const soll = await s.p.evaluate((id) => { const v = window.WNApp.S.vorgaenge.find((x) => x.id === id); return id + "-F4=" + Math.round(248.4 * v.fassungen[3].satzCent); }, ga.id);
    ok("GESAMT: Tabelle zeigt „Ist × Satz“ je Fassung (F4 = 248,4 h × Satz der Fassung)", ik.includes(soll) && ik.filter((x) => x.startsWith(ga.id + "-F")).length === 4, [soll, ik]);
    ok("ERINNERUNG: nur Beispiele → keine Sicherungs-Erinnerung", await s.p.locator("[data-sicherung-erinnerung]").count() === 0);
    /* Erklärung an einem neuen Vorgang */
    await reiter(s.p, "vorgaenge"); await s.p.click("#neuer-vorgang");
    await s.p.fill('[data-kundenfeld="firma"]', "Kundin Prüf-Blatt GmbH");
    await s.p.fill('[data-kundenfeld="mail"]', "kundin@pruefblatt.example");
    await s.p.fill("#weitere-namen", ""); await s.p.locator("#weitere-namen").blur();
    ok("ERKLÄRUNG: Status „offen“ oben im Vorgang, Aktivieren gesperrt", (await s.p.getAttribute("[data-erklaerung-status]", "data-erklaerung-status")) === "offen" && await s.p.isDisabled('[data-recht-aktivieren="erklaerung"]'));
    ok("ERKLÄRUNG: Karte sagt „Entwurf, vor Verwendung prüfen lassen“", (await s.p.evaluate(() => (document.querySelector('[data-recht="erklaerung"] [data-entwurf]') || {}).textContent || "")).includes("vor Verwendung prüfen lassen"));
    for (const key of ["unterschriftBetrieb", "unterschriftKunde"]) {
      const c = s.p.locator(`[data-recht="erklaerung"] [data-unterschrift="${key}"]`);
      const bb = await c.boundingBox();
      await s.p.mouse.move(bb.x + 20, bb.y + bb.height / 2); await s.p.mouse.down();
      for (let i = 1; i <= 8; i++) await s.p.mouse.move(bb.x + 20 + i * 25, bb.y + bb.height / 2 + (i % 2 ? 15 : -15));
      await s.p.mouse.up();
      await s.p.waitForTimeout(80);
    }
    ok("ERKLÄRUNG: beide Unterschriften gezeichnet → Aktivieren frei", await s.p.evaluate(() => { const v = window.WNApp.S.vorgaenge.find((x) => x.id === window.WNApp.S.aktiv); return /^data:image\/png/.test(v.erklaerung.unterschriftBetrieb) && /^data:image\/png/.test(v.erklaerung.unterschriftKunde); }) && !(await s.p.isDisabled('[data-recht-aktivieren="erklaerung"]')));
    await s.p.click('[data-recht-aktivieren="erklaerung"]');
    await s.p.waitForSelector("#vorschau[open] [data-blatt=erklaerung]", { timeout: 5000 }).catch(() => {});
    const ev = await s.p.evaluate(() => { const d = document.getElementById("vorschau"); return { offen: d.open, text: (d.querySelector(".blatt") || {}).textContent || "", bilder: d.querySelectorAll(".blatt img[data-unterschrift-bild]").length,
      mail: (d.querySelector("[data-vorschau-mail]") || {}).href || "", entwurf: !!d.querySelector(".vorschau-kopf [data-entwurf]") }; });
    ok("ERKLÄRUNG: Aktivieren öffnet sofort das Blatt für den Kunden (Firma, Kunde, beide Unterschriften)", ev.offen && ev.text.includes("Werkstatt Prüf-Firma") && ev.text.includes("Kundin Prüf-Blatt GmbH") && ev.bilder === 2, [ev.offen, ev.bilder, ev.text.slice(0, 80)]);
    const kopf = await s.p.evaluate(() => { const d = document.getElementById("vorschau"), b = d.querySelector(".blatt"), pa = b.querySelector("[data-parteien]"), sb = b.querySelector("[data-schlussblock]");
      return { an: (pa && pa.querySelector("[data-partei=auftragnehmer]") || {}).textContent || "", ag: (pa && pa.querySelector("[data-partei=auftraggeber]") || {}).textContent || "",
        vorTitel: pa ? !!(pa.compareDocumentPosition(b.querySelector("h2")) & 4) : false,
        unterStrich: b.querySelectorAll("[data-unterschrift-feld] .strich img[data-unterschrift-bild]").length,
        zusammen: sb ? (sb.querySelector("h2") || {}).textContent + "|" + !!sb.querySelector(".unterschriften") + "|" + getComputedStyle(sb).breakInside : "" }; });
    ok("ERKLÄRUNG: im Kopf stehen Auftragnehmer und Auftraggeber mit Namen, vor dem ersten Abschnitt", kopf.an.startsWith("Auftragnehmer") && kopf.an.includes("Werkstatt Prüf-Firma") && kopf.ag.startsWith("Auftraggeber") && kopf.ag.includes("Kundin Prüf-Blatt GmbH") && kopf.vorTitel, kopf);
    ok("ERKLÄRUNG: die Unterschrift sitzt ÜBER der Linie", kopf.unterStrich === 2, kopf.unterStrich);
    ok("ERKLÄRUNG: letzter Abschnitt und Unterschriften bleiben beim Seitenumbruch zusammen", kopf.zusammen === "7. Ihre Rechte|true|avoid", kopf.zusammen);
    ok("ERKLÄRUNG: Entwurf-Hinweis in der Vorschau, nicht auf dem Blatt; nirgends „Analyse“", ev.entwurf && !/prüfen lassen/.test(ev.text) && !/analyse/i.test(ev.text));
    const mt = decodeURIComponent(ev.mail);
    ok("ERKLÄRUNG: „Per E-Mail“ ist ein mailto an die Kundin mit Betreff und Text", ev.mail.startsWith("mailto:kundin%40pruefblatt.example?subject=") && mt.includes("Verschwiegenheits- und Datenschutzerklärung") && mt.includes("7. Ihre Rechte") && !mt.includes("data:image"), ev.mail.slice(0, 80));
    await s.p.keyboard.press("Escape");
    ok("ERKLÄRUNG: danach „aktiviert am …“, Unterschriften eingefroren", (await s.p.getAttribute("[data-erklaerung-status]", "data-erklaerung-status")) === "aktiviert" && await s.p.locator('[data-recht="erklaerung"] [data-recht-aktivieren]').count() === 0 && await s.p.locator('[data-recht="erklaerung"] [data-unterschrift-weg]').count() === 0);
    await reiter(s.p, "bedarf");
    const pr = await druck(s.p, "#druck-protokoll");
    ok("ERKLÄRUNG: das Bedarfsprotokoll nennt sie mit Datum", /Es gilt die Verschwiegenheits- und Datenschutzerklärung vom \d\d\.\d\d\.\d{4}/.test(pr.text));
    /* Sterne */
    await s.p.fill('[data-neu-eintrag="6"]', "Termine online buchen"); await s.p.click('[data-dazu="6"]');
    await s.p.fill("#sterne-bereich", "Empfang"); await s.p.click('[data-stern="4"]');
    ok("STERNE: Bewertung eintragen → Ø in der Tabelle", (await s.p.getAttribute("[data-sterne]", "data-sterne")) === "1" && /★ 4/.test(await s.p.textContent("[data-sterne-zeile]")));
    const sb = await druck(s.p, "#druck-sterne-abnahme");
    ok("STERNE: Sternebogen zum Ankreuzen mit dem Bedarf, ohne Fachbereich-Eintrag", sb.text.includes("Termine online buchen") && sb.text.includes("☐5") && !sb.text.includes("Empfang"));
    /* Satz: nur im Wartungsvertrag */
    await reiter(s.p, "umfang");
    await s.p.fill("#satz-vorgang", "73"); await s.p.press("#satz-vorgang", "Tab");
    await reiter(s.p, "angebot");
    const SATZ = /(^|[^\d.,])73(,00)?\s?€|Stundensatz|€\/h/;
    const wd = await druck(s.p, '[data-recht-druck="wartung"]');
    ok("WARTUNG: der Stundensatz steht im Wartungsvertrag (73,00 €), dazu „Abrechnung nach Zeitaufwand“", /73,00\s€ netto je Stunde/.test(wd.text) && wd.text.includes("Abrechnung nach Zeitaufwand"), wd.text.match(/.{0,30}je Stunde.{0,10}/));
    const vd = await druck(s.p, '[data-recht-druck="vereinbarung"]');
    ok("VEREINBARUNG: kein Stundensatz (gestellt 73 €), Fassung und Ziel genannt", !SATZ.test(vd.text) && /Fassung 1/.test(vd.text) && vd.text.includes("je Baustein"), vd.text.match(/.{0,30}73.{0,30}/g));
    const ad = await druck(s.p, "#druck-angebot");
    ok("ANGEBOT: weiter kein Stundensatz, Freistunden als Satz „inklusive“", !SATZ.test(ad.text) && /Inklusive 4 Stunden Fehlerbehebung/.test(ad.text), ad.text.match(/.{0,30}(73|Inklusive).{0,30}/g));
    await s.p.check('[data-papier="vereinbarung"]'); await s.p.click('[data-recht-aktivieren="vereinbarung"]'); await s.p.keyboard.press("Escape");
    await s.p.check('[data-papier="wartung"]'); await s.p.click('[data-recht-aktivieren="wartung"]'); await s.p.keyboard.press("Escape");
    ok("RECHT: „auf Papier unterschrieben“ aktiviert ohne gezeichnete Unterschrift", (await s.p.getAttribute('[data-recht="vereinbarung"]', "data-recht-status")) === "aktiviert" && (await s.p.getAttribute('[data-recht="wartung"]', "data-recht-status")) === "aktiviert");
    const [dlU] = await Promise.all([s.p.waitForEvent("download"), s.p.click("#uebergabe-speichern")]);
    const ueb = JSON.parse(fsm.readFileSync(await dlU.path(), "utf8"));
    const uf = ueb.auftraege[0].files || [];
    const html = uf.map((x) => Buffer.from(x.data.split(",")[1], "base64").toString("utf8")).join("\n");
    ok("ÜBERGABE: Erklärung und Vereinbarung als HTML-Datei, Wartungsvertrag nicht, kein Satz", uf.length === 2 && uf.every((x) => x.mime === "text/html") && /Verschwiegenheitserklaerung_/.test(uf[0].name) && !/73,00|Stundensatz/.test(html + JSON.stringify(ueb.auftraege[0].data)), uf.map((x) => x.name));
    await s.ctx.close();
  }

  /* ── 360 px ohne Querlaufen ── */
  for (const breite of [360, 380]) {
    const s = await seite(breite);
    await s.p.goto(url); await s.p.waitForSelector("body[data-bereit]");
    for (const r of ["vorgaenge", "bedarf", "umfang", "angebot", "fassungen", "tabellen", "einstellungen"]) {
      await reiter(s.p, r);
      const q = await s.p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(`BREITE: ${breite} px, Reiter ${r} läuft nicht quer`, q <= 0, q);
    }
    await s.ctx.close();
  }

  /* ── Modul 25 fehlt → nichts geht hinaus ── */
  {
    const s = await seite(1000);
    await s.p.route("**/modules/25_pseudonym.js", (r) => r.fulfill({ status: 404, body: "" }));
    await s.p.goto(url); await s.p.waitForSelector("body[data-bereit]");
    await reiter(s.p, "fassungen");
    ok("MODUL25: fehlt → Hinweis steht da", await s.p.locator("[data-modul25-fehlt]").count() === 1);
    ok("MODUL25: fehlt → Speichern, Kopieren, Teilen gesperrt", await s.p.isDisabled("#md-speichern") && await s.p.isDisabled("#md-kopieren") && await s.p.isDisabled("#md-teilen"));
    await s.ctx.close();
  }

  /* ── Offline nach dem ersten Laden ──
     Ein EIGENER Server, der danach ganz abgeschaltet wird. ctx.setOffline genügt
     nicht: es erfasst die Abrufe des Service Workers nicht — so war dieser Fall
     in der Gegenprobe zuerst blind (die App lud trotz Sabotage „offline"). */
  {
    const eigen = await starteServer();
    const s = await seite(1000);
    await s.p.goto(eigen.url); await s.p.waitForSelector("body[data-bereit]");
    await s.p.evaluate(() => navigator.serviceWorker.ready);
    await s.p.reload(); await s.p.waitForSelector("body[data-bereit]");
    await s.p.waitForFunction(() => !!navigator.serviceWorker.controller);
    await s.p.waitForTimeout(500);
    eigen.server.closeAllConnections(); await new Promise((r) => eigen.server.close(r));
    const p2 = await s.ctx.newPage();
    await p2.goto(eigen.url).catch(() => {});
    await p2.waitForSelector("body[data-bereit]", { timeout: 8000 }).catch(() => {});
    ok("OFFLINE: App lädt nach dem ersten Laden ohne Netz", await p2.evaluate(() => !!document.body && !!document.body.dataset.bereit && !!window.WN && !!window.SbkimPseudonym).catch(() => false));
    await s.ctx.close();
  }

  /* ── Impressum und Datenschutz ── */
  {
    const r = await seite(380);
    await r.p.goto(url); await r.p.waitForSelector("body[data-bereit]");
    ok("RECHT: Impressum und Datenschutz sind von der App aus verlinkt", await r.p.locator('a[href="impressum.html"]').count() >= 1 && await r.p.locator('a[href="datenschutz.html"]').count() >= 1);
    for (const [seiteName, muss] of [["impressum.html", ["Angaben gemäß § 5 DDG", "Klaus Nitzsche", "info@family-projekt.de"]], ["datenschutz.html", ["GitHub", "WorkflowNeeds1", "keine Verschlüsselung"]]]) {
      await r.p.goto(url + seiteName);
      const txt = await r.p.textContent("body");
      ok(`RECHT: ${seiteName} trägt ${muss.join(", ")}`, muss.every((m) => txt.includes(m)), muss.filter((m) => !txt.includes(m)));
      ok(`RECHT: ${seiteName} läuft bei 380 px nicht quer und führt zur App zurück`, await r.p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0 && await r.p.locator('a[href="index.html"]').count() >= 1);
    }
    await r.ctx.close();
  }

  ok("FEHLER: keine Skriptfehler auf der Seite", fehler.length === 0, fehler);
} catch (e) {
  rot++; console.log("ROT  Probe gestolpert: " + (e && e.message ? e.message.split("\n")[0] : e) + " @ " + ((e && e.stack || "").match(/browser\.mjs:\d+/) || [""])[0]);
} finally {
  await browser.close(); server.close();
}
console.log(`browser: ${gruen} grün · ${rot} ROT`);
process.exit(rot ? 1 : 0);
