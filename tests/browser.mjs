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
    const e = [...document.querySelectorAll("#inhalt input:not([type=file]), #inhalt textarea, [data-bereich] button")];
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

  /* ── Gespeichert über Neuladen ── */
  await p.evaluate(() => window.WNApp.jetztSpeichern());
  await p.reload(); await p.waitForSelector("body[data-bereit]");
  await reiter(p, "umfang");
  ok("SPEICHER: Satz des Vorgangs übersteht Neuladen (IndexedDB)", (await p.inputValue("#satz-vorgang")) === "73");
  await ctx.close();

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

  ok("FEHLER: keine Skriptfehler auf der Seite", fehler.length === 0, fehler);
} catch (e) {
  rot++; console.log("ROT  Probe gestolpert: " + (e && e.message ? e.message.split("\n")[0] : e) + " @ " + ((e && e.stack || "").match(/browser\.mjs:\d+/) || [""])[0]);
} finally {
  await browser.close(); server.close();
}
console.log(`browser: ${gruen} grün · ${rot} ROT`);
process.exit(rot ? 1 : 0);
