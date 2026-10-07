/* Gegenprobe — baut je Fall EINEN Fehler in eine Wegwerf-Kopie und verlangt,
   dass die Probe genau an der genannten Stelle rot wird.
     node tests/gegenprobe.mjs                 alle Fälle
     NUR_FALL="MD:" node tests/gegenprobe.mjs  nur Fälle, deren Name so beginnt
     NUR_ANKER=1 node tests/gegenprobe.mjs     nur prüfen, dass jeder Anker genau
                                               EINMAL in seiner Datei steht (Sekunden)
   Ergebnis je Fall: gefangen · BLIND (Probe blieb grün) · FALSCHER GRUND (rot,
   aber nicht mit der erwarteten Zeile) · TOTER ANKER (Sabotage griff nicht).
   Der echte Baum wird nie angefasst: gearbeitet wird in einer Kopie unter /tmp. */
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, symlinkSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const K = "kern", B = "browser";
const FAELLE = [
  { name: "SATZDRUCK: Satz steht im Angebot", probe: B, erwartet: "ANGEBOT: kein Stundensatz",
    an: [["assets/kern/aussen.js", 'function ext(p) { return { beschreibung: String(p.beschreibung),', 'function ext(p) { return { beschreibung: String(p.beschreibung) + " (" + (f.satzCent / 100) + " €/h)",']] },
  { name: "SATZDRUCK: Satz steht im Nachtrag", probe: B, erwartet: "NACHTRAG: kein Stundensatz",
    an: [["assets/kern/aussen.js", 'fassungAlt: alt.nr, fassungNeu: neu.nr, datum: neu.datum, anlass: String(neu.anlass || ""),', 'fassungAlt: alt.nr, fassungNeu: neu.nr, datum: neu.datum, anlass: String(neu.anlass || "") + " — Stundensatz " + (neu.satzCent / 100) + " €",']] },
  { name: "VORGANGSSATZ: Satz des Vorgangs wird ignoriert (Vorgabe gilt)", probe: K, erwartet: "SATZ: Vorgangs-Satz gilt",
    an: [["assets/kern/rechnen.js", "var satz = zahl(bs.satzCent) != null ? zahl(bs.satzCent) : fassung.satzCent;", "var satz = zahl(bs.satzCent) != null ? zahl(bs.satzCent) : 8000;"]] },
  { name: "BAUSTEINSATZ: Baustein-Satz verliert gegen den Vorgang", probe: K, erwartet: "SATZ: Baustein-Satz gewinnt",
    an: [["assets/kern/rechnen.js", "var satz = zahl(bs.satzCent) != null ? zahl(bs.satzCent) : fassung.satzCent;", "var satz = fassung.satzCent;"]] },
  { name: "VORGABE: Vorgabe wird nicht kopiert, sondern geteilt", probe: K, erwartet: "SATZ: Vorgabe ändern lässt bestehende Vorgänge unverändert",
    an: [["assets/kern/fassungen.js", "kunde: {}, eigenesVorhaben: false,", "einst: einst, kunde: {}, eigenesVorhaben: false,"],
         ["assets/kern/fassungen.js", "  function aktuelle(v) { return v.fassungen[v.fassungen.length - 1]; }", "  function aktuelle(v) { var f = v.fassungen[v.fassungen.length - 1]; if (v.einst) f.satzCent = v.einst.satzCent; return f; }"]] },
  { name: "PREIS1: Preis steht im Bedarfsprotokoll", probe: B, erwartet: "PROTOKOLL: keine Stunden-Schätzung und kein Preis",
    an: [["assets/app.js", 'b.append(h("p", { class: "klein", text: t("Dieses Protokoll beschreibt, was benötigt wird und warum — nicht die technische Umsetzung.") }));',
      'b.append(h("p", { class: "klein", text: t("Dieses Protokoll beschreibt, was benötigt wird und warum — nicht die technische Umsetzung.") + " " + euroG(R.schaetze(sichtFassung(aktiverVorgang()), S.tabellen).kostenVon) + " " + t("netto") }));']] },
  { name: "MD: € in der MD trotz Haken aus", probe: K, erwartet: "MD: mit Vorgabe-Haken kein €-Betrag",
    an: [["assets/kern/bauauftrag.js", "euro: !!(opts && opts.euro),", "euro: true,"]] },
  { name: "MD: Stundensatz in der MD trotz Haken an", probe: K, erwartet: "MD: mit „Euro“ trotzdem kein Stundensatz",
    an: [["assets/kern/bauauftrag.js", '    L.push("## Summe");', '    L.push("## Summe"); if (opts.euro) L.push("Stundensatz " + euroG(neu.satzCent));']] },
  { name: "MD: Kopf euro: fehlt", probe: K, erwartet: "MD: Kopf nennt stunden: ja und euro: nein",
    an: [["assets/kern/bauauftrag.js", '"euro: " + (opts.euro ? "ja" : "nein"), ', ""]] },
  { name: "MD: ohne Stunden steht die Spalte trotzdem da", probe: K, erwartet: "MD: ohne „Stunden“ keine Stundenspalte",
    an: [["assets/kern/bauauftrag.js", '    if (opts.stunden) kopf.push("Stunden (Schätzung)");', '    kopf.push("Stunden (Schätzung)");']] },
  { name: "KUNDE: Kundenfeld nicht an Modul 25 gereicht", probe: K, erwartet: "MD: keine Kundendaten (Prüfwort)",
    an: [["assets/kern/bauauftrag.js", 'if (w.length >= 2) { values.push({ value: w, type: "KUNDE" }); seed[f.token] = w; }', 'if (w.length >= 2) { seed[f.token] = w; }'],
         ["assets/kern/bauauftrag.js", "      var leck = P.findLeak(md, V.map());", "      var leck = null;"]] },
  { name: "KUNDE: „Weitere Namen“ nicht an Modul 25 gereicht", probe: K, erwartet: "BEGRIFF: nach dem Eintrag in keiner Fassung mehr",
    an: [["assets/kern/bauauftrag.js", 'namenListe(v.weitereNamen).forEach(function (n) { values.push({ value: n, type: "NAME" }); });', ""]] },
  { name: "KUNDE: Zuordnung in die MD geschrieben", probe: K, erwartet: "MD: Zuordnung steht nicht in der MD",
    an: [["assets/kern/bauauftrag.js", '    L.push("", "```json", JSON.stringify(stand), "```", "");', '    L.push("", "```json", JSON.stringify(stand), "```", "", "```json", JSON.stringify(V.map()), "```");'],
         ["assets/kern/bauauftrag.js", "      var leck = P.findLeak(md, V.map());", "      var leck = null;"],
         ["assets/kern/bauauftrag.js", "      var funde = P.find(md, { values: V.values, types: PRUEF_SORTEN });", "      var funde = [];"]] },
  { name: "KUNDE: Platzhalter je Fassung neu nummeriert", probe: K, erwartet: "MD: zweite Fassung trägt dieselben Platzhalter",
    an: [["assets/kern/bauauftrag.js", "    var map = zuordnungVon(v);\n    return {", "    var map = {};\n    return {"]] },
  { name: "KUNDE: letzte Sicherung ausgebaut", probe: K, erwartet: "SICHERUNG: letzte Sicherung hält an",
    an: [["assets/kern/bauauftrag.js", "      if (leck || funde.length) {", "      if (false) {"]] },
  { name: "KUNDE: ohne Modul 25 trotzdem gespeichert", probe: K, erwartet: "MODUL25: fehlt → nichts geht hinaus",
    an: [["assets/kern/bauauftrag.js", 'if (!P || typeof P.pseudonymize !== "function") return { ok: false, grund: "modul25" };',
      'if (!P) P = { pseudonymize: function (t, o) { return { text: t, map: o.map || {} }; }, findLeak: function () { return null; }, find: function () { return []; } };']] },
  { name: "KUNDE: App-Beträge mit verdeckt", probe: K, erwartet: "MD: App-Zahlen bleiben lesbar",
    an: [["assets/kern/bauauftrag.js", '    var md = L.join("\\n");', '    var md = v.eigenesVorhaben ? L.join("\\n") : P.pseudonymize(L.join("\\n"), { values: V.values, map: V.map() }).text;']] },
  { name: "KUNDE: „Eigenes Vorhaben“ als Vorgabe an", probe: K, erwartet: "EIGEN: Vorgabe ist „aus“",
    an: [["assets/kern/fassungen.js", "kunde: {}, eigenesVorhaben: false,", "kunde: {}, eigenesVorhaben: true,"]] },
  { name: "KENNUNG: Kennung neu nummeriert", probe: K, erwartet: "KENNUNG: eine entfernte Kennung wird nie wieder vergeben",
    an: [["assets/kern/bedarf.js", "    var n = (vorgang.zaehler[art] || 0) + 1;", "    var n = 1 + (art === \"B\" ? alleEintraege(vorgang.fassungen[vorgang.fassungen.length - 1].protokoll).length : (vorgang.zaehler[art] || 0));"]] },
  { name: "KENNUNG: neue Fassung nummeriert die Einträge neu", probe: K, erwartet: "KENNUNG: Bedarf-Kennungen bleiben über Fassungen gleich",
    an: [["assets/kern/fassungen.js", "    f.nr = alt.nr + 1;", "    WN.bedarf.alleEintraege(f.protokoll).forEach(function (x, i) { x.e.id = \"B-\" + (i + 11); });\n    f.nr = alt.nr + 1;"]] },
  { name: "GRENZE: Grenzlinie falsch herum", probe: K, erwartet: "GRENZE: Linie vor dem ersten Baustein",
    an: [["assets/kern/rechnen.js", "r.ueber = r.nutzenZeitraum != null && r.kosten > r.nutzenZeitraum;", "r.ueber = r.nutzenZeitraum != null && r.kosten < r.nutzenZeitraum;"]] },
  { name: "GRENZE: fehlender Nutzen zählt als 0", probe: K, erwartet: "GRENZE: fehlender Nutzen",
    an: [["assets/kern/rechnen.js", "    if (!hatH && !hatE) return null;", "    if (!hatH && !hatE) return 0;"]] },
  { name: "UST: § 19 rechnet trotzdem Umsatzsteuer", probe: K, erwartet: "UST: § 19 → kein USt-Betrag",
    an: [["assets/kern/rechnen.js", '      if (e.modus === "p19") return;\n', ""]] },
  { name: "UST: unterschriebene Fassung folgt der Einstellung", probe: K, erwartet: "UST: unterschriebene Fassung behält ihren Satz",
    an: [["assets/kern/fassungen.js", "function ustVon(f, ustEinst) { return f.ust ? f.ust :", "function ustVon(f, ustEinst) { return false ? f.ust :"]] },
  { name: "FASSUNG: unterschriebene Fassung bleibt bearbeitbar", probe: B, erwartet: "NUR LESEN: unterschriebene Fassung ist nicht editierbar",
    an: [["assets/kern/fassungen.js", "function bearbeitbar(v, f) { return !!f && f === aktuelle(v) && !f.unterschrieben; }", "function bearbeitbar(v, f) { return !!f; }"]] },
  { name: "WHITELIST: Freigabe-Schalter wird ignoriert", probe: B, erwartet: "PROTOKOLL: interner Eintrag weder sichtbar noch im DOM",
    an: [["assets/kern/aussen.js", "if (roh.sichtbar && e.sichtbar) eintraege.push(eintragExtern(b.nr, e)); else aus++;", "eintraege.push(eintragExtern(b.nr, e));"]] },
  { name: "WHITELIST: interne Notiz rutscht in den Kundenausdruck", probe: K, erwartet: "WHITELIST: interne Notiz steht nicht im Kundenprotokoll",
    an: [["assets/kern/aussen.js", "      if (eintraege.length) bereiche.push({ nr: b.nr, eintraege: eintraege });", "      if (roh.notiz) eintraege.push({ id: \"\", text: roh.notiz });\n      if (eintraege.length) bereiche.push({ nr: b.nr, eintraege: eintraege });"]] },
  { name: "WHITELIST: Verstecken nur per CSS statt Whitelist", probe: B, erwartet: "PROTOKOLL: interner Eintrag weder sichtbar noch im DOM",
    an: [["assets/kern/aussen.js", "if (roh.sichtbar && e.sichtbar) eintraege.push(eintragExtern(b.nr, e)); else aus++;",
      "{ var o = eintragExtern(b.nr, e); if (!(roh.sichtbar && e.sichtbar)) { o.versteckt = true; aus++; } eintraege.push(o); }"],
         ["assets/app.js", '        ul.append(h("li", null, h("span", { class: "kenn", text: e.id }), " ", txt));', '        ul.append(h("li", { style: e.versteckt ? "display:none" : null }, h("span", { class: "kenn", text: e.id }), " ", txt));']] },
  { name: "TITEL: Kundenblatt heißt „Bedarfsanalyse“", probe: B, erwartet: "PROTOKOLL: Titel „Bedarfsprotokoll“, nirgends „Analyse“",
    an: [["assets/app.js", 'h("div", null, h("h1", { text: t("Bedarfsprotokoll") }),', 'h("div", null, h("h1", { text: t("Bedarfsanalyse") }),']] },
  { name: "VORSCHAU: „ausgeblendet“ steht auf dem Blatt", probe: B, erwartet: "VORSCHAU: „N Punkte sind ausgeblendet“",
    an: [["assets/app.js", '    b.append(h("p", { class: "klein", style: "margin-top:18px", text: t("Bestätigt durch") + ":" }));', '    b.append(h("p", { class: "klein", style: "margin-top:18px", text: d.ausgeblendet + " " + t("Punkte sind ausgeblendet") + " · " + t("Bestätigt durch") + ":" }));']] },
  { name: "BOUTIQUE: Newsletter entfällt nicht", probe: K, erwartet: "BOUTIQUE: MD F2→F3 hat genau eine NEU-BAUEN-",
    an: [["assets/daten/beispiel.js", '    f3.umfang.bausteine = f3.umfang.bausteine.filter(function (b) { return b.name !== "Newsletter"; });\n', ""]] },
  { name: "CACHE: Cache-Bump weglassen", probe: K, erwartet: "CACHE: Vorrat geändert → CACHE_VERSION erhöht",
    an: [["assets/app.css", "/* Workflow Bedarfsanalyse — Gestaltung.", "/* geändert ohne Cache-Bump */\n/* Workflow Bedarfsanalyse — Gestaltung."]] },
  { name: "TEXTE: englischer Eintrag fehlt", probe: K, erwartet: "TEXTE: jeder t(\"…\") hat einen englischen Eintrag",
    an: [["assets/texte.js", '    "Bauauftrag (MD) speichern": "Save build order (MD)",\n', ""]] },
  { name: "BREITE: Raster läuft am Handy quer", probe: B, erwartet: "BREITE: 360 px",
    an: [["assets/app.css", "main{padding:16px;max-width:1400px;margin:0 auto}", "main{padding:16px;max-width:1400px;margin:0 auto;min-width:520px}"]] },
  { name: "OFFLINE: Worker legt nichts in den Vorrat", probe: B, erwartet: "OFFLINE: App lädt nach dem ersten Laden ohne Netz",
    an: [["sw.js", "    if (r.status === 200) { const k = r.clone(); caches.open(CACHE_VERSION).then((c) => c.put(e.request, k)); }\n", ""],
         ["sw.js", "    Promise.allSettled(CORE.map((u) => c.add(new Request(u, { cache: \"reload\" }))))", "    Promise.allSettled([])"]] },
  { name: "PIN: Modul 25 abgewandelt", probe: K, erwartet: "PIN: Modul 25 ist byte-gleich mit Sage",
    an: [["modules/25_pseudonym.js", "  var KEIN_NAME = [\"herr\",", "  var KEIN_NAME = [\"chef2\", \"herr\","]] },
];

function vorkommen(text, teil) { let n = 0, i = 0; while ((i = text.indexOf(teil, i)) >= 0) { n++; i += teil.length; } return n; }

const nurFall = process.env.NUR_FALL || "";
const nurAnker = !!process.env.NUR_ANKER;
const faelle = FAELLE.filter((f) => f.name.startsWith(nurFall));
let gefangen = 0, blind = 0, falsch = 0, tot = 0;

/* 1 · Anker: jede Stelle steht genau einmal im echten Baum */
for (const f of faelle) {
  for (const [datei, alt] of f.an) {
    const n = vorkommen(readFileSync(join(WURZEL, datei), "utf8"), alt);
    if (n !== 1) { tot++; console.log(`TOTER ANKER  ${f.name}  — ${datei}: ${n}× statt 1×: ${alt.slice(0, 70)}`); }
  }
}
if (nurAnker) {
  console.log(`Anker: ${faelle.length} Fälle · ${tot} tot`);
  process.exit(tot ? 1 : 0);
}

/* 2 · Ausgangslage: die Proben sind in einer frischen Kopie grün */
function kopie() {
  const d = mkdtempSync(join(tmpdir(), "wn-gp-"));
  cpSync(WURZEL, d, { recursive: true, filter: (q) => !/[/\\](node_modules|\.git)([/\\]|$)/.test(q) });
  if (existsSync(join(WURZEL, "node_modules"))) symlinkSync(join(WURZEL, "node_modules"), join(d, "node_modules"), "dir");
  return d;
}
function lauf(d, probe) {
  const r = spawnSync(process.execPath, [join(d, "tests", probe + ".mjs")], { encoding: "utf8", timeout: 300000 });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}
const basis = kopie();
for (const p of [K, B]) {
  const r = lauf(basis, p);
  if (r.code !== 0) { console.log(`Ausgangslage: ${p} ist schon vor der Gegenprobe ${r.code === 2 ? "nicht lauffähig" : "rot"}:\n${r.out}`); rmSync(basis, { recursive: true, force: true }); process.exit(2); }
}
rmSync(basis, { recursive: true, force: true });

/* 3 · je Fall eine eigene Kopie */
for (const f of faelle) {
  const d = kopie();
  let griff = true;
  for (const [datei, alt, neu] of f.an) {
    const t = readFileSync(join(d, datei), "utf8");
    if (vorkommen(t, alt) !== 1) { griff = false; break; }
    writeFileSync(join(d, datei), t.replace(alt, () => neu));
  }
  if (!griff) { console.log(`TOTER ANKER   ${f.name}`); rmSync(d, { recursive: true, force: true }); continue; }
  const r = lauf(d, f.probe);
  const rote = r.out.split("\n").filter((z) => z.startsWith("ROT"));
  if (r.code === 0) { blind++; console.log(`BLIND         ${f.name}`); }
  else if (rote.some((z) => z.includes(f.erwartet))) { gefangen++; console.log(`gefangen      ${f.name}`); }
  else { falsch++; console.log(`FALSCHER GRUND ${f.name}\n    erwartet: ${f.erwartet}\n    ${rote.slice(0, 3).join("\n    ") || r.out.slice(0, 300)}`); }
  rmSync(d, { recursive: true, force: true });
}
console.log(`Gegenprobe: ${gefangen} gefangen · ${blind} blind · ${falsch} aus falschem Grund · ${tot} tote Anker (${faelle.length} Fälle)`);
process.exit(blind || falsch || tot ? 1 : 0);
