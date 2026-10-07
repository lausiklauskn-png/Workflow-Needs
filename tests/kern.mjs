/* Proben ohne Browser — Rechnung, Fassungen, Whitelist, Bauauftrag, Pins.
   node tests/kern.mjs · Rückgabe 0 = grün, 1 = rot. Jede Zusicherung hat einen
   eigenen Namen; die Gegenprobe (tests/gegenprobe.sh) sucht genau diese Namen. */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const stumm = console.log; console.log = () => {};
for (const f of ["modules/25_pseudonym.js", "assets/kern/geld.js", "assets/daten/bausteine.js", "assets/daten/markt.js",
  "assets/kern/bedarf.js", "assets/kern/rechnen.js", "assets/kern/fassungen.js", "assets/kern/aussen.js",
  "assets/kern/bauauftrag.js", "assets/schluesseltresor.js", "assets/kern/sicherung.js", "assets/kern/uebergabe.js", "assets/daten/beispiel.js", "assets/daten/beispiel-tomys.js", "assets/daten/beispiel-psb.js", "assets/daten/beispiel-alis.js", "assets/daten/beispiel-eigene.js", "assets/texte.js", "tests/pruefer-formate.js", "tests/pruefer-mail.js"]) {
  require(join(WURZEL, f));
}
console.log = stumm;
const WN = globalThis.WN, P = globalThis.SbkimPseudonym, PM = globalThis.PrueferMail;
const R = WN.rechnen, F = WN.fassungen, BD = WN.bedarf, BA = WN.bauauftrag, A = WN.aussen;

let gruen = 0, rot = 0;
function ok(name, wahr, mehr) {
  if (wahr) gruen++;
  else { rot++; console.log("ROT  " + name + (mehr !== undefined ? "  — " + (typeof mehr === "string" ? mehr : JSON.stringify(mehr)) : "")); }
}
const sha = (p) => createHash("sha256").update(readFileSync(join(WURZEL, p))).digest("hex");
const EINST = { satzCent: 8000, ust: { modus: "regel", satz: 19 }, zeitraum: 24 };
const kopie = (x) => JSON.parse(JSON.stringify(x));
function vorgang(einst) { return F.neuerVorgang(7, einst || EINST, "2026-10-07"); }
function bs(v, f, katalog, groesse, extra) {
  const b = Object.assign({ id: BD.neueKennung(v, "K"), katalog, name: "", menge: 1, groesse, faktoren: [], deckt: [] }, extra || {});
  f.umfang.bausteine.push(b); return b;
}
function ohneZuschlag(f) { f.umfang.firmenanpassung = { von: 0, bis: 0 }; f.umfang.abstimmungPct = 0; f.umfang.pufferPct = 0; }

/* ── PINS (byte-1:1-Kopien) ── */
const MODUL25_SHA = "8c3092babee80b8fce2c6607cc4c8ced4bbef4addf31a5f0f3de6ba5c92c2ad7"; // Sage-Protokol src/modules/25_pseudonym.js (df54f0c)
const INSTALLIEREN_SHA = "6de57ef331b5deb55b18ca7745da402f16b4401f22259d466b8d828ccbd1b909"; // Sage-Protokol assets/installieren.js (df54f0c)
const PRUEFERMAIL_SHA = "cdf3ca7881bfa68763a2c0be7436d35a65bea4dbd03f606e02eaec5c613632d7"; // Sende-Pruefer assets/pruefer-mail.js (78dde3d), nur für die Probe
ok("PIN: Modul 25 ist byte-gleich mit Sage", sha("modules/25_pseudonym.js") === MODUL25_SHA, sha("modules/25_pseudonym.js"));
ok("PIN: installieren.js ist byte-gleich mit Sage", sha("assets/installieren.js") === INSTALLIEREN_SHA);
const TRESOR_SHA = "eaed30e8f3921835a3f58b69f89d9b008831f69f164ad1dfec630fa43161f666"; // Sende-Pruefer assets/schluesseltresor.js (74af186, aus kim-hub-company 1a4528d)
ok("PIN: schluesseltresor.js ist byte-gleich mit dem Sende-Prüfer", sha("assets/schluesseltresor.js") === TRESOR_SHA);
ok("PIN: pruefer-mail.js (Probe) ist byte-gleich mit dem Sende-Prüfer", sha("tests/pruefer-mail.js") === PRUEFERMAIL_SHA);
ok("PIN: die App trägt keine eigenen Muster (kein find/pseudonymize-Nachbau)", !/new RegExp\([^)]*@/.test(readFileSync(join(WURZEL, "assets/kern/bauauftrag.js"), "utf8")));

/* ── GELD ── */
ok("GELD: „1.234,56“ → 123456 Cent", WN.geld.parseEuroToCents("1.234,56") === 123456);
ok("GELD: „80“ → 8000 Cent", WN.geld.parseEuroToCents("80") === 8000);
ok("GELD: Verteilen ergibt genau die Summe", WN.geld.verteile(1000, [1, 1, 1]).reduce((a, b) => a + b, 0) === 1000);

/* ── RECHNUNG und SATZ-EBENEN ── */
{
  const v = vorgang(); const f = F.aktuelle(v); ohneZuschlag(f);
  ok("SATZ: neuer Vorgang übernimmt die Vorgabe 80 €", f.satzCent === 8000);
  const b = bs(v, f, "seite", "klein", { manuell: { von: 10, bis: 10 } });
  let s = R.schaetze(f);
  ok("SATZ: 80 € × 10 h = 80 000 Cent", s.kostenVon === 80000 && s.kostenBis === 80000, [s.kostenVon, s.kostenBis]);
  f.satzCent = 6500; s = R.schaetze(f);
  ok("SATZ: Vorgangs-Satz gilt (65 € × 10 h = 65 000 Cent)", s.kostenVon === 65000, s.kostenVon);
  b.satzCent = 9000; s = R.schaetze(f);
  ok("SATZ: Baustein-Satz gewinnt über den Vorgangs-Satz", s.kostenVon === 90000, s.kostenVon);
  ok("SATZ: Rechenweg nennt den eigenen Satz", s.zeilen[0].weg.some((w) => w.art === "satz" && w.eigen && w.satzCent === 9000));
  const einst = kopie(EINST); const v2 = F.neuerVorgang(8, einst, "2026-10-07");
  einst.satzCent = 9900;
  ok("SATZ: Vorgabe ändern lässt bestehende Vorgänge unverändert", F.aktuelle(v2).satzCent === 8000);
}
{
  const v = vorgang(); const f = F.aktuelle(v); ohneZuschlag(f);
  const b = bs(v, f, "seite", "klein");
  const k = R.katalogVon(null, "seite");
  let z = R.schaetze(f).zeilen[0];
  ok("RECHNUNG: Spanne × Menge − Wiederverwendung", z.von === k.spannen.klein[0] * (1 - k.wv) && z.bis === k.spannen.klein[1] * (1 - k.wv), [z.von, z.bis]);
  b.menge = 2; b.faktoren = ["offline"];
  z = R.schaetze(f).zeilen[0];
  ok("RECHNUNG: Faktoren werden multipliziert", Math.abs(z.von - k.spannen.klein[0] * 2 * (1 - k.wv) * 1.15) < 1e-9, z.von);
  b.manuell = { von: 3, bis: 4 };
  z = R.schaetze(f).zeilen[0];
  ok("RECHNUNG: Überschreiben gewinnt", z.von === 3 && z.bis === 4 && z.manuell);
  delete b.manuell;
  z = R.schaetze(f).zeilen[0];
  ok("RECHNUNG: ↺ zurück zur Vorgabe", !z.manuell && z.von !== 3);
  b.menge = 1; b.faktoren = []; b.manuell = { von: 1.25, bis: 1.25 };
  z = R.schaetze(f).zeilen[0];
  ok("RECHNUNG: Stunden bleiben ungerundet (1,25 h)", z.von === 1.25);
  ok("RECHNUNG: Cent einmal gerundet (1,25 h × 80 € = 10 000)", z.kostenVon === 10000);
  const u = bs(v, f, null, null, { name: "Warenwirtschaftssystem" });
  const s = R.schaetze(f);
  ok("RECHNUNG: unbekannter Baustein ist „noch nicht geschätzt“, keine Zahl", !s.zeilen[1].geschaetzt && s.offen.includes(u.id) && s.zeilen[1].kostenBis === 0);
  u.groesse = "mittel";
  ok("RECHNUNG: mit Größe wird er geschätzt (Vorlage „neu“)", R.schaetze(f).zeilen[1].geschaetzt);
}
{
  const v = vorgang(); const f = F.aktuelle(v);
  bs(v, f, "seite", "klein", { manuell: { von: 10, bis: 20 } });
  f.umfang.firmenanpassung = { von: 2, bis: 4 }; f.umfang.abstimmungPct = 15; f.umfang.pufferPct = 20;
  const s = R.schaetze(f);
  ok("ZUSCHLAG: Abstimmung 15 % und Puffer 20 % der Summe (inkl. Firmenanpassung)",
    Math.abs(s.stundenVon - 12 * 1.35) < 1e-9 && Math.abs(s.stundenBis - 24 * 1.35) < 1e-9, [s.stundenVon, s.stundenBis]);
}

/* ── KOSTEN-NUTZEN ── */
function knFall(nutzenA, nutzenB) {
  const v = vorgang(); const f = F.aktuelle(v); ohneZuschlag(f);
  const p = f.protokoll;
  const e1 = BD.eintragNeu(v, p, 6, "A"); e1.prio = "muss"; e1.nutzen = { stundenMonat: null, euroMonat: nutzenA, text: "" };
  const e2 = BD.eintragNeu(v, p, 6, "B"); e2.prio = "kann"; e2.nutzen = { stundenMonat: null, euroMonat: nutzenB, text: "" };
  bs(v, f, "seite", "klein", { manuell: { von: 10, bis: 10 }, deckt: [e1.id] }); // 800 €
  bs(v, f, "liste", "klein", { manuell: { von: 10, bis: 10 }, deckt: [e2.id] }); // 800 €
  return R.kostenNutzen(f, R.schaetze(f), 24);
}
{
  let kn = knFall(100, 10); // A: 2400 € > 800 € · B: 240 € < 800 €
  ok("GRENZE: Linie vor dem ersten Baustein, dessen Kosten den Nutzen übersteigen", kn.grenze === 1 && kn.zeilen[1].ueber && !kn.zeilen[0].ueber, kn);
  kn = knFall(10, 100); // A (Muss) 240 € < 800 € → Linie schon bei A
  ok("GRENZE: andere Richtung — Muss-Baustein mit kleinem Nutzen zieht die Linie nach oben", kn.grenze === 0, kn.grenze);
  kn = knFall(100, 100);
  ok("GRENZE: keine Linie, wenn alles sich rechnet", kn.grenze === -1);
  kn = knFall(null, 10);
  ok("GRENZE: fehlender Nutzen → „nicht angegeben“ (null), nie 0", kn.zeilen[0].nutzenMonat === null && kn.zeilen[0].nutzenZeitraum === null && !kn.zeilen[0].ueber);
  ok("GRENZE: Muss vor Kann", kn.zeilen[0].prio === "muss");
}

/* ── UMSATZSTEUER ── */
{
  const pos = [{ nettoCent: 100000 }, { nettoCent: 33333, ermaessigt: true }];
  const p19 = R.ust(pos, { modus: "p19" });
  ok("UST: § 19 → kein USt-Betrag", p19.p19 && p19.ust === 0 && p19.zeilen.length === 0 && p19.brutto === p19.netto);
  const r = R.ust(pos, { modus: "regel", satz: 19 });
  ok("UST: Netto + USt = Brutto auf den Cent", r.netto + r.ust === r.brutto && r.zeilen.length === 2 && r.zeilen[0].ust === 19000 && r.zeilen[1].ust === 2333, r);
  const v = vorgang(); const f = F.aktuelle(v);
  F.unterschreiben(v, f, { modus: "regel", satz: 19 }, "2026-10-07");
  ok("UST: unterschriebene Fassung behält ihren Satz nach einem Wechsel", F.ustVon(f, { modus: "p19" }).modus === "regel");
  ok("FASSUNG: unterschriebene Fassung ist nicht bearbeitbar", !F.bearbeitbar(v, f));
}

/* ── FASSUNGEN und VERGLEICH ── */
{
  const v = vorgang(); const f1 = F.aktuelle(v);
  const e = BD.eintragNeu(v, f1.protokoll, 6, "Eine Seite");
  const seite = bs(v, f1, "seite", "klein", { deckt: [e.id] });
  const news = bs(v, f1, null, "klein", { name: "Newsletter" });
  const fest = bs(v, f1, "liste", "klein");
  ok("FASSUNG: neue Fassung verlangt einen Anlass", !F.neueFassung(v, { anlass: "", von: "kunde" }).ok);
  ok("FASSUNG: neue Fassung verlangt „von wem“", !F.neueFassung(v, { anlass: "x", von: "" }).ok);
  const f2 = F.neueFassung(v, { anlass: "zweite Seite", von: "kunde" }).fassung;
  f2.umfang.bausteine.find((b) => b.id === seite.id).menge = 2;
  f2.umfang.bausteine = f2.umfang.bausteine.filter((b) => b.id !== news.id);
  const neu = bs(v, f2, "lager", "mittel");
  const vg = F.vergleich(f1, f2);
  const akt = Object.fromEntries(vg.bausteine.map((x) => [x.id, x.aktion]));
  ok("VERGLEICH: +1 Seite → ANPASSEN", akt[seite.id] === "ANPASSEN", akt);
  ok("VERGLEICH: neuer Baustein → NEU BAUEN", akt[neu.id] === "NEU BAUEN");
  ok("VERGLEICH: entfallener Baustein → ENTFERNEN", akt[news.id] === "ENTFERNEN");
  ok("VERGLEICH: Rest → UNVERÄNDERT", akt[fest.id] === "UNVERÄNDERT");
  ok("KENNUNG: Bedarf-Kennungen bleiben über Fassungen gleich", BD.alleEintraege(f2.protokoll).map((x) => x.e.id).join() === BD.alleEintraege(f1.protokoll).map((x) => x.e.id).join());
  ok("KENNUNG: Kennungen bleiben über Fassungen gleich", f2.umfang.bausteine[0].id === f1.umfang.bausteine[0].id && neu.id === "K-04", neu.id);
  BD.eintragNeu(v, f2.protokoll, 1, "x");
  f2.protokoll.bereiche[1].eintraege = [];
  const e3 = BD.eintragNeu(v, f2.protokoll, 1, "y");
  ok("KENNUNG: eine entfernte Kennung wird nie wieder vergeben", e3.id === "B-03", e3.id);
  const f3 = F.neueFassung(v, { anlass: "weniger", von: "kunde" }).fassung;
  f3.umfang.bausteine = f3.umfang.bausteine.filter((b) => b.id !== neu.id);
  const vg3 = F.vergleich(f2, f3);
  ok("VERGLEICH: der Preis kann sinken", vg3.summe.kostenNeu[1] < vg3.summe.kostenAlt[1]);
  neu.groesse = null;
  ok("VERGLEICH: Baustein ohne Zahl → NOCH NICHT GESCHÄTZT", F.vergleich(f1, f2).bausteine.find((x) => x.id === neu.id).aktion === "NOCH NICHT GESCHÄTZT");
  const f4 = F.neueFassung(v, { anlass: "Satz", von: "betrieb" }).fassung;
  f4.satzCent = 7000;
  const vg4 = F.vergleich(f3, f4);
  ok("VERGLEICH: Satzänderung steht als eigene Zeile, nicht als Arbeit", vg4.satz && vg4.satz.alt === 8000 && vg4.satz.neu === 7000 && vg4.satz.effektCent < 0 && vg4.satz.arbeitCent === 0, vg4.satz);
}

/* ── WHITELIST (§ 4b, § 6) ── */
{
  const v = vorgang(); const f = F.aktuelle(v);
  BD.eintragNeu(v, f.protokoll, 1, "sichtbar-eins");
  BD.eintragNeu(v, f.protokoll, 1, "INTERN-PRUEFWORT-7Q", { sichtbar: false });
  f.protokoll.bereiche[4].notiz = "NOTIZ-PRUEFWORT-3K";
  BD.eintragNeu(v, f.protokoll, 5, "nur-intern-bereich");
  f.protokoll.bereiche[5].sichtbar = false;
  const k = A.kundenProtokoll(v, f, { name: "X" });
  const j = JSON.stringify(k);
  ok("WHITELIST: interner Eintrag steht nicht im Kundenprotokoll", !j.includes("INTERN-PRUEFWORT-7Q"));
  ok("WHITELIST: interne Notiz steht nicht im Kundenprotokoll", !j.includes("NOTIZ-PRUEFWORT-3K"));
  ok("WHITELIST: ein ganz interner Bereich fällt weg (keine leere Überschrift)", !k.bereiche.some((b) => b.nr === 5));
  ok("WHITELIST: Freigegebenes steht da", j.includes("sichtbar-eins"));
  ok("WHITELIST: Zahl der ausgeblendeten Punkte stimmt (Eintrag, Bereich, Notiz)", k.ausgeblendet === 3, k.ausgeblendet);
  ok("KUNDENBLATT: fehlende Kundendaten bleiben leer, kein Platzhalter", k.kunde.firma === "" && k.kunde.mail === "" && !j.includes("⟦"), k.kunde);
  f.satzCent = 7300;
  bs(v, f, "seite", "klein");
  const an = A.angebotExtern(v, f, { name: "X" }, { modus: "regel", satz: 19 }, null, 24, "de");
  const ja = JSON.stringify(an);
  ok("WHITELIST: Angebot trägt keinen Satz", !/7300|satzCent|"73(,00)?"/.test(ja) && !("satzCent" in an));
  ok("WHITELIST: Angebot trägt keine Stunden, Faktoren, Wiederverwendung", !/stunden|faktor|"wv"|kosten|nutzen|markt/i.test(Object.keys(an).join(",") + JSON.stringify(an.positionen)));
}

/* ── KUNDENBLATT ohne Kundendaten (Stufe 3 § 1b): nie ein Platzhalter ── */
{
  const v = vorgang(); const f = F.aktuelle(v);
  BD.eintragNeu(v, f.protokoll, 1, "Papier");
  bs(v, f, "seite", "klein");
  F.unterschreiben(v, f, EINST.ust, "2026-10-07");
  const f2 = F.neueFassung(v, { anlass: "mehr", von: "kunde", datum: "2026-10-08" }).fassung;
  bs(v, f2, "liste", "klein");
  const blaetter = [A.kundenProtokoll(v, f, {}), A.angebotExtern(v, f, {}, EINST.ust, null, 24, "de"), A.nachtragExtern(v, f, f2, {}, EINST.ust, null, 24, "de")];
  ok("KUNDENBLATT: Protokoll, Angebot, Nachtrag ohne Kundendaten tragen kein ⟦", blaetter.every((b) => !JSON.stringify(b).includes("⟦")), blaetter.map((b) => JSON.stringify(b.kunde)));
  v.kunde.firma = "⟦KUNDE-1⟧";
  ok("KUNDENBLATT: ein eingetippter Platzhalter wird nicht gedruckt", A.angebotExtern(v, f, {}, EINST.ust, null, 24, "de").kunde.firma === "");
}

/* ── BAUAUFTRAG (§ 7c/7e) ── */
function kundenVorgang() {
  const v = vorgang(); const f = F.aktuelle(v);
  v.kunde.firma = "KUNDE-PRUEFWORT-4Z"; v.kunde.mail = "pruef@kunde.example"; v.kunde.telefon = "+49 30 1234567"; v.kunde.ansprechpartner = "Erika Prüfmuster";
  const e = BD.eintragNeu(v, f.protokoll, 6, "KUNDE-PRUEFWORT-4Z braucht eine Seite, Rückfragen an pruef@kunde.example oder +49 30 1234567");
  e.prio = "muss"; e.nutzen = { stundenMonat: 3, euroMonat: 200, text: "" };
  BD.eintragNeu(v, f.protokoll, 6, "Die Bäckerei Prüfwort hat keine Seite");
  f.satzCent = 7300;
  bs(v, f, "seite", "klein", { deckt: [e.id] });
  return v;
}
{
  const v = kundenVorgang(); const f = F.aktuelle(v);
  let r = BA.erzeuge(v, null, f, {}, P);
  ok("MD: wird erzeugt", r.ok, r);
  const md = r.md;
  ok("MD: Kopf art/format/vorgang/fassung", /^---\nart: bauauftrag\nformat: 1\nvorgang: V-2026-0007\nfassung: 1\n/.test(md));
  ok("MD: Kopf nennt stunden: ja und euro: nein (Vorgabe)", /\nstunden: ja\n/.test(md) && /\neuro: nein\n/.test(md));
  ok("MD: Kopf kunde ist immer der Platzhalter", /\nkunde: "⟦KUNDE-1⟧"\n/.test(md));
  ok("MD: Kopf verdeckt: ja", /\nverdeckt: ja\n/.test(md));
  ok("MD: mit Vorgabe-Haken kein €-Betrag", !/€/.test(md), md.match(/.*€.*/));
  ok("MD: mit Vorgabe-Haken stehen Stunden da", /Stunden \(Schätzung\)/.test(md));
  ok("MD: nur Aktionen aus der geschlossenen Liste", (md.match(/^\| ([A-ZÄÖÜ ]+) \|/gm) || []).slice(1).every((z) => BA.AKTIONEN.includes(z.slice(2, -2))), md.match(/^\| ([A-ZÄÖÜ ]+) \|/gm));
  ok("MD: keine Kundendaten (Prüfwort)", !md.includes("KUNDE-PRUEFWORT-4Z"));
  ok("MD: keine Kundendaten (Mail, Telefon, Name)", !md.includes("pruef@kunde.example") && !md.includes("1234567") && !md.includes("Prüfmuster"));
  ok("MD: Platzhalter stehen da", md.includes("⟦KUNDE-1⟧ braucht eine Seite"), md.match(/.*braucht.*/));
  ok("MD: Zuordnung steht nicht in der MD", !/KUNDE-PRUEFWORT|pruef@/.test(md) && !md.includes('"⟦KUNDE-1⟧":'));
  ok("MD: kein HTML", !/<[a-z!/]/i.test(md));
  const pm = PM.pruefeMail(md);
  ok("MD: null Befunde im Auslieferungsprüfer (pruefeMail)", pm.stellen.length === 0, pm.stellen.map((s) => s.kennung));
  ok("MD: App-Zahlen bleiben lesbar (nicht als ⟦BETRAG⟧/⟦DATUM⟧ verdeckt)", !/⟦(BETRAG|DATUM)-/.test(md) && /datum: 2026-10-07/.test(md) && /Nutzen: 3 h\/Monat/.test(md));
  v.zuordnung = r.zuordnung;
  r = BA.erzeuge(v, null, f, { euro: true }, P);
  ok("MD: mit „Euro“ stehen Beträge da", /€/.test(r.md) && /\neuro: ja\n/.test(r.md));
  ok("MD: mit „Euro“ trotzdem kein Stundensatz", !/(^|[^\d.,])73(,00)? ?€/.test(r.md) && !/stundensatz|satzCent/i.test(r.md), r.md.match(/.*73.*/g));
  r = BA.erzeuge(v, null, f, { stunden: false }, P);
  ok("MD: ohne „Stunden“ keine Stundenspalte", !/Stunden/.test(r.md.split("## Vollständiger")[0]) && /\nstunden: nein\n/.test(r.md));
  /* zweite Fassung: dieselben Platzhalter */
  const md1 = BA.erzeuge(v, null, f, {}, P);
  v.zuordnung = md1.zuordnung;
  const f2 = F.neueFassung(v, { anlass: "mehr", von: "kunde" }).fassung;
  BD.eintragNeu(v, f2.protokoll, 1, "Erika Prüfmuster will auch Kurse");
  const md2 = BA.erzeuge(v, f, f2, {}, P);
  const tok = (m) => (m.match(/⟦[A-Z]+-\d+⟧/g) || []);
  ok("MD: zweite Fassung trägt dieselben Platzhalter", md2.ok && md2.md.includes("⟦KUNDE-1⟧ braucht") && md2.md.includes("⟦KUNDE-2⟧ will auch Kurse") && !md2.md.includes("Prüfmuster"), tok(md2.md));
  /* Einlesen stellt dieselbe Fassung her, Klartext zurück */
  const ein = BA.einlesen(md2.md, P);
  ok("EINLESEN: Kopf wird erkannt", ein.ok && ein.kopf.vorgang === v.id && ein.kopf.fassung === "2", ein);
  v.zuordnung = md2.zuordnung;
  const st = BA.standAnwenden(ein.stand, f2, v, P);
  const kern = (x) => JSON.stringify([BD.alleEintraege(x.protokoll).map((y) => [y.nr, y.e]), x.umfang.bausteine]);
  { const a = kern(st.fassung), b = kern(f2); let i = 0; while (i < a.length && a[i] === b[i]) i++; ok("EINLESEN: stellt dieselbe Fassung her", a === b, [a.slice(i - 80, i + 80), b.slice(i - 80, i + 80)]); }
  ok("EINLESEN: Klartext kommt zurück", JSON.stringify(st.fassung).includes("KUNDE-PRUEFWORT-4Z braucht"));
  ok("EINLESEN: Fremdes wird mit Grund abgelehnt", !BA.einlesen("---\nart: rechnung\nformat: 1\n---\n", P).ok && /art/.test(BA.einlesen("---\nart: rechnung\nformat: 1\n---\n", P).grund));
  ok("EINLESEN: falsches Format wird mit Grund abgelehnt", /format/.test(BA.einlesen("---\nart: bauauftrag\nformat: 2\n---\n", P).grund));
  /* Antwort einfügen */
  const auf = BA.aufdecken("Fertig für ⟦KUNDE-1⟧, Mail an ⟦KUNDE-4⟧. Unbekannt: ⟦NAME-99⟧", v, P);
  ok("ANTWORT: Platzhalter werden zu Klartext", auf.text.includes("Fertig für KUNDE-PRUEFWORT-4Z") && auf.text.includes("pruef@kunde.example"));
  ok("ANTWORT: unbekannter Platzhalter bleibt stehen und wird genannt", auf.text.includes("⟦NAME-99⟧") && auf.unbekannt.join() === "⟦NAME-99⟧");
  /* Weitere Namen und Begriffe */
  ok("BEGRIFF: unbekannter Begriff steht erst im Klartext", md2.md.includes("Bäckerei Prüfwort"));
  v.weitereNamen = "Bäckerei Prüfwort";
  const m1 = BA.erzeuge(v, null, f, {}, P), m2 = BA.erzeuge(v, f, f2, {}, P);
  ok("BEGRIFF: nach dem Eintrag in keiner Fassung mehr", m1.ok && m2.ok && !m1.md.includes("Prüfwort") && !m2.md.includes("Prüfwort"));
  v.zuordnung = m2.zuordnung;
  const st2 = BA.standAnwenden(BA.einlesen(m2.md, P).stand, f2, v, P);
  ok("BEGRIFF: kommt beim Einlesen zurück", JSON.stringify(st2.fassung).includes("Die Bäckerei Prüfwort hat keine Seite") && !st2.unbekannt.length, st2.unbekannt);
  /* Eigenes Vorhaben */
  const eig = kopie(v); eig.eigenesVorhaben = true;
  const me = BA.erzeuge(eig, null, F.aktuelle(eig), {}, P);
  ok("EIGEN: eigenes Vorhaben → verdeckt: nein", me.ok && /\nverdeckt: nein\n/.test(me.md));
  ok("EIGEN: Vorgabe ist „aus“", F.neuerVorgang(1, EINST).eigenesVorhaben === false);
  /* Modul 25 fehlt / letzte Sicherung */
  ok("MODUL25: fehlt → nichts geht hinaus", BA.erzeuge(v, null, f, {}, null).ok === false && BA.erzeuge(v, null, f, {}, null).grund === "modul25");
  const blind = Object.assign({}, P, { pseudonymize: (t, o) => ({ text: t, map: Object.assign({}, o.map), tokens: [], findings: [] }) });
  const lr = BA.erzeuge(v, null, f, {}, blind);
  ok("SICHERUNG: letzte Sicherung hält an, wenn nach dem Verdecken noch ein Fund übrig ist", lr.ok === false && lr.grund === "sicherung" && !!lr.fund, lr);
}
{
  /* Vorgang ohne Kundendaten → später ausgefüllt → MD unverändert */
  const v = vorgang(); const f = F.aktuelle(v);
  BD.eintragNeu(v, f.protokoll, 6, "Termine online buchen");
  bs(v, f, "auftrag", "klein");
  const a = BA.erzeuge(v, null, f, {}, P);
  v.zuordnung = a.zuordnung;
  v.kunde.firma = "Spät eingetragen GmbH"; v.kunde.mail = "spaet@kunde.example";
  const b = BA.erzeuge(v, null, f, {}, P);
  ok("SPAET: Vorgang ohne Kundendaten → MD mit Platzhaltern, später ausgefüllt → MD unverändert", a.ok && b.ok && a.md === b.md && a.md.includes('kunde: "⟦KUNDE-1⟧"'));
  ok("SPAET: der Kundenausdruck zeigt den Klartext erst jetzt", A.kundenProtokoll(v, f, {}).kunde.firma === "Spät eingetragen GmbH");
}

/* ── TESTFALL BOUTIQUE (§ 12) ── */
{
  const v = WN.beispiel.boutique(1, EINST);
  const [f1, f2, f3] = v.fassungen;
  ok("BOUTIQUE: F1 hat B-01…B-08 und K-01…K-04", BD.alleEintraege(f1.protokoll).map((x) => x.e.id).join() === "B-01,B-02,B-03,B-04,B-05,B-06,B-07,B-08" && f1.umfang.bausteine.map((b) => b.id).join() === "K-01,K-02,K-03,K-04");
  ok("BOUTIQUE: F1 ist unterschrieben, F2 Internetseite ×2", !!f1.unterschrieben && f2.umfang.bausteine[0].menge === 2);
  const r = BA.erzeuge(v, f2, f3, {}, P);
  const zeilen = (a) => (r.md.match(new RegExp("^\\| " + a + " \\|", "gm")) || []).length;
  ok("BOUTIQUE: MD F2→F3 hat genau eine NEU-BAUEN-, eine ANPASSEN- und eine ENTFERNEN-Zeile", zeilen("NEU BAUEN") === 1 && zeilen("ANPASSEN") === 1 && zeilen("ENTFERNEN") === 1, [zeilen("NEU BAUEN"), zeilen("ANPASSEN"), zeilen("ENTFERNEN")]);
  const kn = R.kostenNutzen(f3, R.schaetze(f3), 24);
  ok("BOUTIQUE: Grenzlinie sichtbar", kn.grenze >= 0);
  const n = A.nachtragExtern(v, f2, f3, {}, EINST.ust, null, 24, "de");
  ok("BOUTIQUE: Nachtrag F2→F3 mit Preisunterschied", n.diff.brutto !== 0 && n.leistungen.length === 3);
  const f3b = kopie(f3); f3b.umfang.bausteine.find((b) => b.name === "Warenwirtschaft").groesse = null;
  ok("BOUTIQUE: Warenwirtschaft erst NOCH NICHT GESCHÄTZT", F.vergleich(f2, f3b).bausteine.some((x) => x.aktion === "NOCH NICHT GESCHÄTZT"));
  ok("BOUTIQUE: keine echten Adressen (nur .example)", !/@(?![a-z.]*\.example)/.test(JSON.stringify(v)));
}

/* ── SICHERUNG (verschlüsselt, Anhänge Byte für Byte) ── */
{
  const SI = WN.sicherung;
  const v = vorgang(); v.kunde.firma = "Sicherungsprüfwort GmbH";
  const bytes = new Uint8Array(70000); for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 31 + 7) & 255;
  v.anhaenge = [{ id: "A-01", name: "Angebot Kunde.pdf", typ: "application/pdf", groesse: bytes.length, blob: new Blob([bytes], { type: "application/pdf" }) }];
  const d = await SI.verschliessen("richtig-langes-pw", { vorgaenge: [v], speicher: { einstellungen: '{"satzCent":7300}' } }, "2026-10-07T10:00:00.000Z");
  const roh = JSON.stringify(d);
  ok("SICHERUNG: in der Datei steht kein Klartext (Kunde, Satz, Anhang-Name)", !roh.includes("Sicherungsprüfwort") && !roh.includes("7300") && !roh.includes("Angebot Kunde") && !roh.includes("V-2026"), roh.slice(0, 200));
  ok("SICHERUNG: Kopf nennt Art, Fassung, Datum — und das Paket", d.art === SI.ART && d.fassung === 1 && d.erstellt === "2026-10-07T10:00:00.000Z" && Object.keys(d).sort().join() === "art,erstellt,fassung,paket");
  let falsch = null; try { await SI.oeffnen("falsches-passwort", d); } catch (e) { falsch = e.message; }
  ok("SICHERUNG: falsches Passwort → „passwort“", falsch === "passwort", falsch);
  let kurz = null; try { await SI.verschliessen("kurz", { vorgaenge: [] }); } catch (e) { kurz = e.message; }
  ok("SICHERUNG: Passwort unter 8 Zeichen wird abgelehnt", kurz === "kurz", kurz);
  const r = await SI.oeffnen("richtig-langes-pw", d);
  const rb = r.vorgaenge[0].anhaenge[0].blob;
  const zurueck = new Uint8Array(rb && rb.arrayBuffer ? await rb.arrayBuffer() : new ArrayBuffer(0));
  ok("SICHERUNG: Rundlauf bringt Vorgang und Einstellungen zurück", r.vorgaenge[0].kunde.firma === "Sicherungsprüfwort GmbH" && r.speicher.einstellungen.includes("7300"));
  ok("SICHERUNG: Anhang kommt Byte für Byte zurück, Name und Art bleiben", zurueck.length === bytes.length && zurueck.every((b, i) => b === bytes[i]) &&
    r.vorgaenge[0].anhaenge[0].name === "Angebot Kunde.pdf" && !!rb && rb.type === "application/pdf");
  const da = kopie(v); da.titel = "schon hier";
  const z = SI.zusammenfuehren([da], r.vorgaenge.concat([vorgang(), { id: "kaputt" }]));
  ok("SICHERUNG: Zurückholen fügt hinzu, überschreibt nie", z.neu.length === 0 && z.schonDa === 3 && da.titel === "schon hier", z);
  const w = kopie(d); w.fassung = 2; let fs = null; try { await SI.oeffnen("richtig-langes-pw", w); } catch (e) { fs = e.message; }
  ok("SICHERUNG: fremde Fassung hat eine eigene Meldung", fs === "fassung", fs);
  ok("SICHERUNG: alte Klartext-Sicherung wird erkannt", SI.istAlt({ art: "workflowneeds-sicherung", vorgaenge: [] }) && !SI.istAlt(d));
  const jetzt = Date.parse("2026-10-21T10:00:00Z");
  ok("ERINNERUNG: nie gesichert → erinnern", SI.erinnernNoetig([v], null, jetzt));
  ok("ERINNERUNG: 13 Tage → nicht, 14 Tage → ja", !SI.erinnernNoetig([v], "2026-10-08T11:00:00Z", jetzt) && SI.erinnernNoetig([v], "2026-10-07T10:00:00Z", jetzt));
  ok("ERINNERUNG: nur das Beispiel → nicht erinnern", !SI.erinnernNoetig([WN.beispiel.boutique(1, EINST)], null, jetzt));
}

/* ── ANHÄNGE gehen nicht in die MD ── */
{
  const v = vorgang(); const f = F.aktuelle(v);
  v.anhaenge = [{ id: "A-01", name: "Anhangprüfwort-Kunde.png", typ: "image/png", groesse: 3 }];
  const m = BA.erzeuge(v, null, f, { stunden: true, euro: false }, P);
  ok("ANHANG: Name eines Anhangs steht nicht in der Bauauftrags-MD", m.ok && !m.md.includes("Anhangprüfwort"));
  const ang = JSON.stringify([A.angebotExtern(v, f, {}), A.kundenProtokoll(v, f, {})]);
  ok("ANHANG: Angebot und Bedarfsprotokoll (Whitelist) tragen keinen Anhang", ang.length > 50 && !ang.includes("Anhangprüfwort") && !ang.includes("A-01"));
}

/* ── ÜBERGABE an WorkFloh (Weiterleitungs-Bündel, nur aus der Whitelist) ── */
{
  const U = WN.uebergabe;
  const v = WN.beispiel.boutique(3, EINST); const f = F.aktuelle(v);
  f.satzCent = 7300; v.kunde.telefon = "";
  const pdfB = new Uint8Array([37, 80, 68, 70, 45, 1, 2, 3, 250]);
  v.anhaenge = [{ id: "A-01", name: "Plan vom Kunden.pdf", typ: "application/pdf", groesse: 9, blob: new Blob([pdfB], { type: "application/pdf" }) },
    { id: "A-02", name: "Mail.eml", typ: "message/rfc822", groesse: 4, blob: new Blob(["Hi\r\n"], { type: "message/rfc822" }) }];
  const a = U.auftrag(v, f, Object.assign({ firma: {} }, EINST), null, "2026-10-07T10:00:00.000Z");
  a.files = await U.dateien(v.anhaenge);
  const b = U.buendel([a], "2026-10-07T10:00:00.000Z");
  const txt = JSON.stringify(b);
  ok("ÜBERGABE: Form des WorkFloh-Bündels (wf forward, v 1, auftraege, status angebot)", b.wf === "forward" && b.v === 1 && b.count === 1 && a.status === "angebot" && Array.isArray(a.files) && typeof a.data === "object");
  ok("ÜBERGABE: kein Stundensatz (gestellt 73 €), keine Stunden", !/73,00|7300|Stundensatz|€\/h|\d+–\d+ h\b/.test(txt), txt.match(/.{0,30}(73,00|7300|Stundensatz).{0,30}/));
  ok("ÜBERGABE: keine internen Einträge (B-05 bleibt draußen)", !txt.includes("Vorgänger-Agentur"));
  ok("ÜBERGABE: Kunde im Klartext, leeres Feld ohne Platzhalter", a.data.nameFirma === "Boutique Beispiel" && a.data.email === "kontakt@boutique.example" && a.data.erreichbarkeit === "" && !txt.includes("⟦"));
  ok("ÜBERGABE: Datum TT.MM.JJJJ wie WorkFloh, Preis brutto", /^\d\d\.\d\d\.\d{4}$/.test(a.data.datum) && /brutto$/.test(a.data.preis));
  ok("ÜBERGABE: feste Kennung je Vorgang und Fassung", a.id === "wn-" + v.id + "-F" + f.nr && U.auftrag(v, f, EINST, null).id === a.id);
  const back = Buffer.from(a.files[0].data.split(",")[1], "base64");
  ok("ÜBERGABE: Anhänge als data-URL, Name und Art bleiben, Byte für Byte", a.files.length === 2 && a.files[0].name === "Plan vom Kunden.pdf" && a.files[0].mime === "application/pdf" &&
    a.files[0].data.startsWith("data:application/pdf;base64,") && back.equals(Buffer.from(pdfB)) && a.files[1].mime === "message/rfc822");
  ok("ÜBERGABE: unterschriebene Fassung sagt das in der Beschreibung", !f.unterschrieben || a.data.beschreibung.includes("Unterschrieben am"));
}

/* ── KALIBRIERUNG gegen eigene Aufträge (intern) ── */
{
  const v = WN.beispiel.boutique(4, EINST);
  const f1 = v.fassungen[0], f3 = F.aktuelle(v);
  const s1 = R.schaetze(f1);
  v.ist = { [f1.nr]: 31.5, [f3.nr]: 99 };
  const z = R.istVergleich([v]);
  const mitte = (s1.stundenVon + s1.stundenBis) / 2;
  ok("IST: nur unterschriebene Fassungen zählen", !!f1.unterschrieben && z.length === (f3.unterschrieben ? 2 : 1) && z[0].fassung === f1.nr, z);
  ok("IST: Abweichung gegen die Mitte der Schätzung", z[0].abweichungPct === Math.round((31.5 - mitte) / mitte * 100) && z[0].von === s1.stundenVon, z[0]);
  ok("IST: leerer oder negativer Wert zählt nicht", R.istVergleich([Object.assign(kopie(v), { ist: { [f1.nr]: "", 2: -3 } })]).length === 0);
  const md = BA.erzeuge(v, null, f3, { stunden: true }, P);
  const ang = JSON.stringify(A.angebotExtern(v, f1, {})), ueb = JSON.stringify(WN.uebergabe.auftrag(v, f1, EINST));
  ok("IST: Ist-Stunden gehen nicht in MD, Angebot oder Übergabe", md.ok && !/31[,.]5/.test(md.md) && !/31[,.]5/.test(ang) && !/31[,.]5/.test(ueb));
  const K = WN.KALIBRIERUNG;
  ok("BILDSCHIRME: gezählte Zeilen tragen eine Zahl, mycel-karte bleibt „nicht gezählt“", K.zeilen.filter((x) => x.bildschirme == null).map((x) => x.repo).join() === "mycel-karte" && typeof K.bildschirmRegel === "string" && K.bildschirmRegel.length > 40);
  ok("KATALOG: jeder nachgesehene Baustein nennt Datum und Stand im Hinweis", WN.BAUSTEINE.filter((b) => b.geprueft).every((b) => /^nachgesehen 2026-\d\d-\d\d/.test(b.hinweis)));
}


/* ── STUFE 3: VIER BEISPIELE AUS DEN EIGENEN REPOS (§ 3) ── */
{
  const E73 = Object.assign(kopie(EINST), { satzCent: 7300, wartung: { freistunden: 4, wochen: 8, pauschaleCent: 30000 }, firma: { name: "Prüf-Firma" } });
  const L = WN.beispiel.liste();
  ok("BEISPIELE: fünf im Register (Boutique + vier aus den Repos)", L.map((b) => b.id).join() === "boutique,tomys,psb,alis,eigene", L.map((b) => b.id));
  for (const b of L.filter((x) => x.id !== "boutique")) {
    const v = b.bauen(3, E73), ff = v.fassungen, ak = F.aktuelle(v);
    ok(`BEISPIEL ${b.id}: lädt, trägt bid und beispiel`, v.bid === b.id && v.beispiel === true && WN.beispiel.bidVon(v) === b.id);
    ok(`BEISPIEL ${b.id}: mindestens zwei Fassungen, jede mit Anlass`, ff.length >= 2 && ff.slice(1).every((f) => f.anlass && f.von));
    ok(`BEISPIEL ${b.id}: alle 18 Bereiche gültig, mindestens 12 ausgefüllt`, WN.BEREICHE.every((x) => ak.protokoll.bereiche[x.nr]) && BD.fortschritt(ak.protokoll) >= 12, BD.fortschritt(ak.protokoll));
    const ids = new Set(); ff.forEach((f) => { BD.alleEintraege(f.protokoll).forEach((x) => ids.add(x.e.id)); f.umfang.bausteine.forEach((x) => ids.add(x.id)); });
    const lueckenlos = ["B", "K", "O"].every((art) => { const n = v.zaehler[art] || 0; for (let i = 1; i <= n; i++) if (!ids.has(art + "-" + String(i).padStart(2, "0"))) return false; return [...ids].filter((x) => x.startsWith(art + "-")).length === n; });
    ok(`BEISPIEL ${b.id}: Kennungen lückenlos aus dem Zähler`, lueckenlos, v.zaehler);
    ok(`BEISPIEL ${b.id}: jeder Baustein deckt einen Bedarf oder ist benannt`, ff.every((f) => f.umfang.bausteine.every((x) => Array.isArray(x.deckt) && (x.deckt.length || x.name))));
    const s = R.schaetze(ak);
    ok(`BEISPIEL ${b.id}: rechnet (Schätzung > 0)`, s.stundenBis > 0 && s.kostenBis > 0);
    ok(`BEISPIEL ${b.id}: keine echten Adressen (nur .example)`, !/@(?![a-z0-9.-]*\.example)/.test(JSON.stringify(v)));
    ok(`BEISPIEL ${b.id}: kein echter Personenname im Kundenfeld (Ansprechpartner erfunden)`, !v.kunde.ansprechpartner || /Beispiel/.test(v.kunde.ansprechpartner), v.kunde.ansprechpartner);
    ok(`BEISPIEL ${b.id}: Ist-Stunden nur an unterschriebenen Fassungen`, Object.keys(v.ist || {}).length >= 2 && Object.keys(v.ist).every((nr) => ff.find((f) => String(f.nr) === nr && f.unterschrieben)));
    const an = JSON.stringify(A.angebotExtern(v, ak, E73.firma, E73.ust, null, 24, "de"));
    ok(`BEISPIEL ${b.id}: Angebot ohne Satz (73 €), ohne ⟦`, !/7300|73,00|satzCent/.test(an) && !an.includes("⟦"));
    const ueb = JSON.stringify(WN.uebergabe.auftrag(v, ak, E73, null));
    ok(`BEISPIEL ${b.id}: Übergabe ohne Satz (73 €)`, !/7300|73,00|Stundensatz/.test(ueb));
    const alt = ff[ff.length - 2];
    const md = BA.erzeuge(v, alt, ak, {}, P);
    ok(`BEISPIEL ${b.id}: Bauauftrag entsteht, verdeckt ${b.id === "eigene" ? "nein" : "ja"}`, md.ok && new RegExp("\\nverdeckt: " + (b.id === "eigene" ? "nein" : "ja") + "\\n").test(md.md), md.grund || md.fund);
    if (b.id !== "eigene") ok(`BEISPIEL ${b.id}: Bauauftrag ohne Kundendaten`, md.ok && !md.md.includes(v.kunde.firma) && !md.md.includes(v.kunde.mail));
  }
  const alis = WN.beispiel.liste().find((b) => b.id === "alis").bauen(4, E73);
  ok("BEISPIEL alis: offene F4 hat einen Baustein NOCH NICHT GESCHÄTZT", F.vergleich(alis.fassungen[2], alis.fassungen[3]).bausteine.some((x) => x.aktion === "NOCH NICHT GESCHÄTZT"));
  ok("BEISPIEL eigene: eigenes Vorhaben, je App eine Gruppe (Name beginnt mit dem App-Namen)", (() => { const v = WN.beispiel.liste().find((b) => b.id === "eigene").bauen(5, E73);
    const n = F.aktuelle(v).umfang.bausteine.map((x) => x.name); return v.eigenesVorhaben && ["Mein Rezeptbuch ·", "Sage-Protokol ·", "family-project ·", "PWA-Toolpoint ·"].every((a) => n.some((x) => x.startsWith(a))); })());
  ok("BEISPIELE: alte Boutique ohne bid wird als „boutique“ erkannt (kein Doppel)", WN.beispiel.bidVon({ beispiel: true, titel: "Internetseite für ein Modegeschäft" }) === "boutique" && WN.beispiel.bidVon({ titel: "x" }) === "");
  ok("BEISPIELE: Erinnerung zählt keines der Beispiele", !WN.sicherung.erinnernNoetig(WN.beispiel.liste().map((b) => b.bauen(1, E73)), null, Date.parse("2026-10-07")));
}

/* ── STUFE 3: RECHTSBLÄTTER (§ 4) ── */
{
  const E73 = Object.assign(kopie(EINST), { satzCent: 7300, wartung: { freistunden: 6, wochen: 8, pauschaleCent: 30000 } });
  const ctx = { firma: { name: "Prüf-Firma", kontakt: "kontakt@pruef.example" }, ust: EINST.ust, tabellen: null, zeitraum: 24, wartung: E73.wartung };
  const v = F.neuerVorgang(9, E73, "2026-10-07"); const f = F.aktuelle(v);
  v.kunde.firma = "Kundin Prüf GmbH"; v.kunde.mail = "kundin@pruef.example";
  const b1 = BD.eintragNeu(v, f.protokoll, 6, "Termine online"); b1.prio = "muss";
  const b2 = BD.eintragNeu(v, f.protokoll, 6, "Geheim intern", { sichtbar: false });
  bs(v, f, "seite", "klein", { deckt: [b1.id] });
  F.unterschreiben(v, f, EINST.ust, "2026-10-07");
  const er = A.erklaerungExtern(v, ctx), ej = JSON.stringify(er);
  ok("ERKLÄRUNG: DSGVO-Grundlage, 3 Jahre, personenbezogene Daten ohne Frist, Rechte Art. 15–21", /Art\. 6 Abs\. 1 lit\. b DSGVO/.test(ej) && /drei Jahre/.test(ej) && /ohne zeitliche Grenze/.test(ej) && /Art\. 15–21/.test(ej));
  ok("ERKLÄRUNG: kein Satz, kein Preis, nicht das Wort „Analyse“", !/7300|73,00|satzCent|netto|€/.test(ej) && !/analyse/i.test(ej));
  ok("ERKLÄRUNG: Firma und Kunde aus der Whitelist", er.firma.name === "Prüf-Firma" && er.kunde.firma === "Kundin Prüf GmbH" && !("zuordnung" in er.kunde));
  ok("ERKLÄRUNG: ohne beide Unterschriften nicht aktivierbar", !A.kannAktivieren(v, "erklaerung") && !A.aktivieren(v, "erklaerung", ctx));
  v.erklaerung = { unterschriftBetrieb: "data:image/png;base64,AAAA" };
  ok("ERKLÄRUNG: eine Unterschrift reicht nicht", !A.kannAktivieren(v, "erklaerung"));
  v.erklaerung.unterschriftKunde = "data:image/png;base64,BBBB";
  ok("ERKLÄRUNG: beide Unterschriften → aktivierbar, aktiviert", A.aktivieren(v, "erklaerung", ctx, "2026-10-07") && v.erklaerung.aktiviert === "2026-10-07");
  ctx.firma.name = "Umbenannt GmbH"; v.kunde.firma = "Andere Kundin";
  const er2 = A.erklaerungExtern(v, ctx);
  ok("ERKLÄRUNG: aktiviert = eingefroren (Firma, Kunde, Text bleiben)", er2.firma.name === "Prüf-Firma" && er2.kunde.firma === "Kundin Prüf GmbH" && er2.aktiviert === "2026-10-07" && er2.unterschriftKunde.endsWith("BBBB"));
  ok("ERKLÄRUNG: zweites Aktivieren ändert nichts", !A.aktivieren(v, "erklaerung", ctx, "2026-12-01") && v.erklaerung.aktiviert === "2026-10-07");
  const m = A.alsText(er2);
  ok("ERKLÄRUNG: Text fürs mailto trägt Betreff und alle Abschnitte, keine Unterschrift", /Verschwiegenheits/.test(m.betreff) && m.text.includes("7. Ihre Rechte") && !m.text.includes("data:image"));
  ok("ERKLÄRUNG: Bedarfsprotokoll nennt die Erklärung vom Datum", A.kundenProtokoll(v, f, {}).erklaerungVom === "2026-10-07");
  ctx.firma.name = "Prüf-Firma"; v.kunde.firma = "Kundin Prüf GmbH";
  const vb = A.vereinbarungExtern(v, ctx), vj = JSON.stringify(vb);
  ok("VEREINBARUNG: nennt Angebot, Fassung und die Kennungen des Ziels (nur freigegebene)", vb.fassung === 1 && vb.text.bezug.ziel.join() === b1.id && vj.includes("Fassung 1") && !vj.includes(b2.id));
  ok("VEREINBARUNG: kein Stundensatz (73 €)", !/7300|73,00|satzCent|Stundensatz/.test(vj));
  ok("VEREINBARUNG: Zahlung je Baustein, Nutzungsrecht unbegrenzt, Änderungen nur durch den Auftragnehmer", /je Baustein/.test(vj) && /zeitlich unbegrenztes Nutzungsrecht/.test(vj) && /nur Prüf-Firma vor/.test(vj));
  ok("VEREINBARUNG: Sperre nur der Bedienung, Daten bleiben, Export bleibt", /Bedienung der App gesperrt/.test(vj) && /Daten bleiben vollständig erhalten/.test(vj) && /exportieren/.test(vj));
  ok("VEREINBARUNG: Aktualisierungen zwei Jahre kostenlos, danach Wartungsvertrag, ohne Vertrag letzte Fassung", /ersten zwei Jahren ab Abnahme sind sie kostenlos/.test(vj) && /Ohne Wartungsvertrag läuft die App in ihrer letzten Fassung weiter/.test(vj));
  ok("VEREINBARUNG: Tabelle je Baustein mit Kennung und Preis aus dem Angebot", vb.text.abschnitte[2].tabelle.some((z) => z.kennung === "K-01" && z.deckt === b1.id && z.nettoCent > 0));
  const wa = A.wartungExtern(v, ctx), wj = JSON.stringify(wa);
  ok("WARTUNG: der Stundensatz steht drin (73,00 €) — das einzige Blatt", /73,00\s€/.test(wj) && wa.text.satzCent === 7300, [wa.text.satzCent, wa.text.abschnitte[4]]);
  ok("WARTUNG: „Abrechnung nach Zeitaufwand“ steht als eigener Abschnitt", wa.text.abschnitte.some((a) => a.titel === "Abrechnung nach Zeitaufwand") && wa.text.abschnitte.some((a) => a.titel === "Stundensatz"));
  ok("WARTUNG: Freistunden und Wochen aus Vorgang und Einstellung, Jahrespauschale ab dem 3. Jahr", /Inklusive 6 Stunden Fehlerbehebung in den ersten 8 Wochen/.test(wj) && /300,00\s€/.test(wj) && /dritten Jahr/.test(wj));
  ok("RECHT: kein Blatt trägt das Wort „Analyse“", [er2, vb, wa].every((x) => !/analyse/i.test(JSON.stringify(x))));
  const dat = WN.uebergabe.rechtsDateien(v, ctx);
  ok("ÜBERGABE: aktivierte Erklärung geht als HTML-Datei mit, Vereinbarung erst wenn aktiviert, Wartung nie", dat.length === 1 && dat[0].mime === "text/html" && /^Verschwiegenheitserklaerung_V-2026-0009\.html$/.test(dat[0].name));
  v.vereinbarung = { papier: true }; A.aktivieren(v, "vereinbarung", ctx, "2026-10-08"); v.wartung = { papier: true }; A.aktivieren(v, "wartung", ctx, "2026-10-08");
  const dat2 = WN.uebergabe.rechtsDateien(v, ctx);
  const html = dat2.map((d) => Buffer.from(d.data.split(",")[1], "base64").toString("utf8")).join("\n");
  ok("ÜBERGABE: auch mit aktivierter Wartung kein Stundensatz in den Dateien", dat2.length === 2 && !/73,00|7300/.test(html) && html.includes("Vereinbarung zu Zahlung"));
  const md = BA.erzeuge(v, null, f, {}, P);
  ok("MD: nennt nur „aktiviert: ja/nein“, keine Unterschrift", md.ok && /Verschwiegenheitserklärung aktiviert: ja/.test(md.md) && /Wartungsvertrag aktiviert: ja/.test(md.md) && !md.md.includes("data:image"));
  /* Gewährleistung, eingerechnet */
  const g0 = F.neuerVorgang(10, EINST, "2026-10-07"), gf = F.aktuelle(g0); ohneZuschlag(gf); bs(g0, gf, "seite", "klein", { manuell: { von: 10, bis: 10 } });
  const ohneFeld = gf.umfang.gewaehrleistungH === 0;
  const s0 = R.schaetze(gf); gf.umfang.gewaehrleistungH = 5; const s1 = R.schaetze(gf);
  ok("GEWÄHR: Freistunden sind eingerechnet (+5 h, +400 €), ohne Vorgabe 0", ohneFeld && s1.stundenVon - s0.stundenVon === 5 && s1.kostenVon - s0.kostenVon === 40000, [s0.stundenVon, s1.stundenVon]);
  const pz = R.positionen(gf, s1, R.kostenNutzen(gf, s1, 24), null, "de");
  ok("GEWÄHR: steckt im Preis der Positionen, nicht als eigene Zeile", pz.haupt.length === 1 && pz.haupt[0].nettoCent === 120000, pz.haupt.map((x) => x.nettoCent));
  ok("GEWÄHR: neuer Vorgang übernimmt die Freistunden aus der Vorgabe", F.aktuelle(F.neuerVorgang(11, E73, "2026-10-07")).umfang.gewaehrleistungH === 6);
  ok("KATALOG: „Freischaltung / Lizenz“ ist Schätzung, nicht nachgesehen", WN.BAUSTEINE.some((x) => x.id === "lizenz" && !x.geprueft && /Schätzung/.test(x.hinweis)));
}

/* ── STUFE 3: STERNE DER MITARBEITER (§ 4f A) ── */
{
  const v = vorgang(); const f = F.aktuelle(v);
  const e1 = BD.eintragNeu(v, f.protokoll, 6, "Lager sehen");
  const e2 = BD.eintragNeu(v, f.protokoll, 6, "intern", { sichtbar: false });
  ok("STERNE: 0 und 6 Sterne werden abgewiesen, fremde Kennung auch", !BD.sterneDazu(v, { kennung: e1.id, sterne: 0 }) && !BD.sterneDazu(v, { kennung: e1.id, sterne: 6 }) && !BD.sterneDazu(v, { kennung: "K-01", sterne: 3 }));
  BD.sterneDazu(v, { zeitpunkt: "bedarf", kennung: e1.id, bereich: "Lager", kuerzel: "STERNPRUEF-KZ", sterne: 5 });
  BD.sterneDazu(v, { zeitpunkt: "bedarf", kennung: e1.id, bereich: "Verkauf", sterne: 4 });
  BD.sterneDazu(v, { zeitpunkt: "abnahme", kennung: e1.id, bereich: "Lager", sterne: 3 });
  BD.sterneDazu(v, { zeitpunkt: "bedarf", kennung: e2.id, bereich: "Lager", sterne: 1 });
  const z = BD.sterneZusammen(v, "bedarf");
  ok("STERNE: Durchschnitt und Anzahl je Kennung und Zeitpunkt", z[e1.id].schnitt === 4.5 && z[e1.id].anzahl === 2 && BD.sterneZusammen(v, "abnahme")[e1.id].schnitt === 3);
  const kp = A.kundenProtokoll(v, f, {}), kj = JSON.stringify(kp);
  ok("STERNE: im Bedarfsprotokoll beim Bedarf (Ø, Anzahl), ohne Kürzel und Fachbereich", ((kp.bereiche.find((x) => x.nr === 6) || { eintraege: [{}] }).eintraege[0].sterne || {}).schnitt === 4.5 && !kj.includes("STERNPRUEF-KZ") && !kj.includes("Verkauf"));
  ok("STERNE: interner Bedarf trägt seine Sterne nicht hinaus", !kp.bereiche.find((x) => x.nr === 6).eintraege.some((x) => x.id === e2.id));
  bs(v, f, "lager", "klein", { deckt: [e1.id] });
  const md = BA.erzeuge(v, null, f, {}, P);
  ok("STERNE: in der MD Ø und Anzahl, keine Kürzel", md.ok && md.md.includes("Sterne " + e1.id + ": beim Bedarf Ø 4,5 (2) · bei der Abnahme Ø 3 (1)") && !md.md.includes("STERNPRUEF-KZ"), md.md.match(/.*Sterne.*/g));
  const sb = A.sterneBogenExtern(v, f, {}, "abnahme");
  ok("STERNE: Bogen zum Ankreuzen nur mit freigegebenen Bedarfen, ohne Namen", sb.zeitpunkt === "abnahme" && sb.bedarfe.length === 1 && sb.bedarfe[0].id === e1.id && !JSON.stringify(sb).includes("STERNPRUEF"));
}

/* ── TEXTE (DE/EN) ── */
{
  const app = readFileSync(join(WURZEL, "assets/app.js"), "utf8");
  const fehlt = [...app.matchAll(/\bt\("((?:[^"\\]|\\.)*)"\)/g)].map((m) => JSON.parse('"' + m[1] + '"')).filter((s) => !WN.EN[s]);
  ok("TEXTE: jeder t(\"…\") hat einen englischen Eintrag", fehlt.length === 0, fehlt.slice(0, 5));
  ok("TEXTE: Bereiche haben DE und EN", WN.BEREICHE.length === 18 && WN.BEREICHE.every((b) => b.name.de && b.name.en));
  ok("TEXTE: Definition steht wörtlich in der App", WN.DEFINITION.de.startsWith("Das Bedarfsprotokoll ist eine strukturierte Dokumentation zur Erfassung, Beschreibung und Bewertung"));
}

/* ── PWA: Vorrat, ?v=, Cache-Bump ── */
{
  const sw = readFileSync(join(WURZEL, "sw.js"), "utf8");
  const idx = readFileSync(join(WURZEL, "index.html"), "utf8");
  const core = JSON.parse(sw.match(/const CORE = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
  const fehlend = core.filter((u) => u !== "./" && !existsSync(join(WURZEL, u.replace(/\?.*$/, ""))));
  ok("PWA: jede Datei im Vorrat gibt es", fehlend.length === 0, fehlend);
  const lokal = [...idx.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]).filter((u) => !/^(https?:)?\/\//.test(u));
  const nichtImVorrat = lokal.filter((u) => u !== "manifest.json" && !core.includes(u));
  ok("PWA: jede Datei der Seite steht im Vorrat (gleiches ?v=)", nichtImVorrat.length === 0, nichtImVorrat);
  ok("PWA: keine CDN, keine fremde Adresse in der Seite", !/(?:src|href)="https?:/.test(idx));
  const man = JSON.parse(readFileSync(join(WURZEL, "manifest.json"), "utf8"));
  ok("PWA: Manifest standalone, Name „Workflow Bedarfsanalyse“, short_name „Bedarfsanalyse“", man.display === "standalone" && man.name === "Workflow Bedarfsanalyse" && man.short_name === "Bedarfsanalyse");
  ok("PWA: Icons 192 und 512 vorhanden", man.icons.some((i) => i.sizes === "192x192") && man.icons.some((i) => i.sizes === "512x512") && man.icons.every((i) => existsSync(join(WURZEL, i.src))));
  const stand = JSON.parse(readFileSync(join(WURZEL, "tests/cache-stand.json"), "utf8"));
  const h = createHash("sha256");
  core.filter((u) => u !== "./").sort().forEach((u) => h.update(u + "\0").update(readFileSync(join(WURZEL, u.replace(/\?.*$/, "")))));
  const jetzt = h.digest("hex");
  const version = sw.match(/CACHE_VERSION = "([^"]+)"/)[1];
  ok("CACHE: Vorrat geändert → CACHE_VERSION erhöht (node tools/cache-stand.mjs)", jetzt === stand.sha || version !== stand.version, { version, stand: stand.version });
  ok("CACHE: tests/cache-stand.json ist nachgezogen", jetzt === stand.sha && version === stand.version, "node tools/cache-stand.mjs");
  const speicher = readFileSync(join(WURZEL, "assets/app.js"), "utf8");
  ok("SPEICHER: app-eigene Namen (WorkflowNeeds1, workflowneeds_*), nicht toolpoint_lang", /DB_NAME = "WorkflowNeeds1"/.test(speicher) && !/toolpoint_lang/.test(speicher));
}

console.log(`kern: ${gruen} grün · ${rot} ROT`);
process.exit(rot ? 1 : 0);
