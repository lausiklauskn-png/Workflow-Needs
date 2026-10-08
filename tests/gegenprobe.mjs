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
    an: [["assets/kern/aussen.js", "if (roh.sichtbar && e.sichtbar) eintraege.push(eintragExtern(b.nr, e, sterne)); else aus++;", "eintraege.push(eintragExtern(b.nr, e, sterne));"]] },
  { name: "WHITELIST: interne Notiz rutscht in den Kundenausdruck", probe: K, erwartet: "WHITELIST: interne Notiz steht nicht im Kundenprotokoll",
    an: [["assets/kern/aussen.js", "      if (eintraege.length) bereiche.push({ nr: b.nr, eintraege: eintraege });", "      if (roh.notiz) eintraege.push({ id: \"\", text: roh.notiz });\n      if (eintraege.length) bereiche.push({ nr: b.nr, eintraege: eintraege });"]] },
  { name: "WHITELIST: Verstecken nur per CSS statt Whitelist", probe: B, erwartet: "PROTOKOLL: interner Eintrag weder sichtbar noch im DOM",
    an: [["assets/kern/aussen.js", "if (roh.sichtbar && e.sichtbar) eintraege.push(eintragExtern(b.nr, e, sterne)); else aus++;",
      "{ var o = eintragExtern(b.nr, e, sterne); if (!(roh.sichtbar && e.sichtbar)) { o.versteckt = true; aus++; } eintraege.push(o); }"],
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
  { name: "SICHER: Klartext neben dem Paket", probe: K, erwartet: "SICHERUNG: in der Datei steht kein Klartext",
    an: [["assets/kern/sicherung.js", "      return { art: ART, fassung: FASSUNG, erstellt: erstellt, paket: paket };", "      return { art: ART, fassung: FASSUNG, erstellt: erstellt, paket: paket, vorgaenge: inhalt.vorgaenge };"]] },
  { name: "SICHER: Zurückholen überschreibt", probe: K, erwartet: "SICHERUNG: Zurückholen fügt hinzu, überschreibt nie",
    an: [["assets/kern/sicherung.js", "if (!v || !v.id || !Array.isArray(v.fassungen) || da[v.id]) return;", "if (!v || !v.id || !Array.isArray(v.fassungen)) return;"]] },
  { name: "SICHER: Anhänge fehlen in der Sicherung", probe: K, erwartet: "SICHERUNG: Anhang kommt Byte für Byte zurück",
    an: [["assets/kern/sicherung.js", "blobZuB64(a.blob).then(function (b) { x.b64 = b; return x; })", "Promise.resolve(x)"]] },
  { name: "SICHER: Erinnerung erst nach 140 Tagen", probe: K, erwartet: "ERINNERUNG: 13 Tage → nicht, 14 Tage → ja",
    an: [["assets/kern/sicherung.js", "var MIN_PW = 8, ERINNERN_TAGE = 14;", "var MIN_PW = 8, ERINNERN_TAGE = 140;"]] },
  { name: "SICHER: Beispiel zählt als eigener Vorgang", probe: K, erwartet: "ERINNERUNG: nur das Beispiel → nicht erinnern",
    an: [["assets/daten/beispiel.js", "    v.beispiel = true;", "    v.beispiel = false;"]] },
  { name: "SICHER: kurzes Passwort angenommen", probe: K, erwartet: "SICHERUNG: Passwort unter 8 Zeichen wird abgelehnt",
    an: [["assets/kern/sicherung.js", "    if (String(pw || \"\").length < MIN_PW) return Promise.reject(new Error(\"kurz\"));", ""]] },
  { name: "SICHER: Firmendaten fehlen in der Sicherung", probe: B, erwartet: "SICHERUNG: Firmendaten kommen mit",
    an: [["assets/app.js", "speicher: { einstellungen: lsGet(LS.einst) || \"\", tabellen: lsGet(LS.tab) || \"\" }", "speicher: {}"]] },
  { name: "SICHER: Schloss abgewandelt", probe: K, erwartet: "PIN: schluesseltresor.js ist byte-gleich",
    an: [["assets/schluesseltresor.js", "var MINDEST_LAENGE = 40;", "var MINDEST_LAENGE = 41;"]] },
  { name: "ANHANG: Blob geht beim Speichern verloren", probe: B, erwartet: "ANHANG: übersteht Neuladen",
    an: [["assets/app.js", "return Object.assign(a, { blob: v.anhaenge[i].blob }); });\n    return k;", "return a; });\n    return k;"]] },
  { name: "ANHANG: Screenshot ohne Namen", probe: B, erwartet: "ANHANG: PDF bleibt PDF",
    an: [["assets/app.js", "return d.name && d.name !== \"image.png\" ? d : new File(", "return d || new File("]] },
  { name: "ANHANG: Name in der MD", probe: K, erwartet: "ANHANG: Name eines Anhangs steht nicht in der Bauauftrags-MD",
    an: [["assets/kern/bauauftrag.js", '    L.push("## Summe");', '    L.push("## Summe"); (v.anhaenge || []).forEach(function (a) { L.push("Anhang " + a.name); });']] },
  { name: "UEB: Stundensatz in der Übergabe", probe: K, erwartet: "ÜBERGABE: kein Stundensatz",
    an: [["assets/kern/uebergabe.js", '    zeilen.push("", "Aus Workflow-Needs übernommen.");', '    zeilen.push("", "Aus Workflow-Needs übernommen. Satz " + eur(f.satzCent) + "/h");']] },
  /* Seit Stufe 3 decken zwei Riegel einander: kundeExtern (aussen.js) gibt kein ⟦ mehr heraus, rein() (uebergabe.js)
     entfernt es ein zweites Mal. Ein Fall nimmt deshalb BEIDE weg — einer allein misst nichts (gemessen 2026-10-07). */
  { name: "UEB: Platzhalter bleibt im Kundenfeld", probe: K, erwartet: "ÜBERGABE: Kunde im Klartext",
    an: [["assets/kern/uebergabe.js", '  function rein(s) { return String(s == null ? "" : s).replace(PLATZHALTER, "").trim(); }', '  function rein(s) { return String(s == null ? "" : s).trim(); }'],
         ["assets/kern/aussen.js", 'k[f.id] = String((v.kunde && v.kunde[f.id]) || "").replace(/⟦[^⟧]*⟧/g, "").trim();', 'k[f.id] = String((v.kunde && v.kunde[f.id]) || "").trim() || f.token;']] },
  { name: "UEB: Datei verliert ihre Art", probe: K, erwartet: "ÜBERGABE: Anhänge als data-URL",
    an: [["assets/kern/uebergabe.js", 'return { name: x.name, mime: x.typ || "", size: x.groesse || 0, data: d };', 'return { name: x.name, mime: "", size: x.groesse || 0, data: d };']] },
  { name: "UEB: Kennung je Übergabe neu (WorkFloh verdoppelt)", probe: K, erwartet: "ÜBERGABE: feste Kennung",
    an: [["assets/kern/uebergabe.js", 'id: "wn-" + v.id + "-F" + f.nr,', 'id: "wn-" + v.id + "-F" + f.nr + "-" + Math.random(),']] },
  { name: "UEB: interne Einträge in der Übergabe", probe: K, erwartet: "ÜBERGABE: keine internen Einträge",
    an: [["assets/kern/uebergabe.js", '    zeilen.push("", "Aus Workflow-Needs übernommen.");', '    zeilen.push("", "Aus Workflow-Needs übernommen.", JSON.stringify(f.protokoll));']] },
  { name: "UEB: Anhänge fehlen in der Auftragsdatei", probe: B, erwartet: "ÜBERGABE: Auftragsdatei für WorkFloh mit allen Anhängen",
    an: [["assets/app.js", "          auf.files = fs.concat(WN.uebergabe.rechtsDateien(v, rechtCtx()));", "          auf.files = [];"]] },
  { name: "IST: offene Fassung zählt mit", probe: K, erwartet: "IST: nur unterschriebene Fassungen zählen",
    an: [["assets/kern/rechnen.js", "return String(x.nr) === String(nr) && x.unterschrieben; })[0];", "return String(x.nr) === String(nr); })[0];"]] },
  { name: "IST: Ist-Stunden in der Übergabe", probe: K, erwartet: "IST: Ist-Stunden gehen nicht in MD, Angebot oder Übergabe",
    an: [["assets/kern/uebergabe.js", '    if (a.zahlung) zeilen.push("Zahlung: " + a.zahlung);', '    if (a.zahlung) zeilen.push("Zahlung: " + a.zahlung); zeilen.push(JSON.stringify(v.ist || {}));']] },
  { name: "BILDSCHIRME: Zählung fällt weg", probe: K, erwartet: "BILDSCHIRME: gezählte Zeilen tragen eine Zahl",
    an: [["assets/daten/markt.js", "bildschirme: GEZAEHLT.hasOwnProperty(z[0]) ? GEZAEHLT[z[0]] : null", "bildschirme: null"]] },
  { name: "RECHT: Fußzeile mit Impressum fehlt", probe: B, erwartet: "RECHT: Impressum und Datenschutz sind von der App aus verlinkt",
    an: [["index.html", '<footer class="app-fuss"><a href="impressum.html">Impressum</a> · <a href="datenschutz.html">Datenschutz</a></footer>', ""]] },
  /* ── Stufe 3 ── */
  { name: "S3 KUNDENBLATT: leeres Kundenfeld zeigt wieder den Platzhalter", probe: K, erwartet: "KUNDENBLATT: fehlende Kundendaten bleiben leer",
    an: [["assets/kern/aussen.js", 'k[f.id] = String((v.kunde && v.kunde[f.id]) || "").replace(/⟦[^⟧]*⟧/g, "").trim();', 'k[f.id] = String((v.kunde && v.kunde[f.id]) || "").replace(/⟦[^⟧]*⟧/g, "").trim() || f.token;']] },
  { name: "S3 KUNDENBLATT: Druckblatt setzt den Platzhalter statt der Schreiblinie", probe: B, erwartet: "KUNDENBLATT: Angebot und Bedarfsprotokoll ohne Kundendaten",
    an: [["assets/app.js", 'txt ? txt : h("span", { class: "schreiblinie", "data-schreiblinie": "", "aria-label": t("von Hand ausfüllen") })', 'txt ? txt : "⟦KUNDE-1⟧"']] },
  { name: "S3 ERKLÄRUNG: Satz rutscht in die Erklärung", probe: K, erwartet: "ERKLÄRUNG: kein Satz, kein Preis",
    an: [["assets/kern/aussen.js", 'vorhaben: String(v.titel || ""), fassung: art === "erklaerung" ? null : f.nr, text: txt };', 'vorhaben: String(v.titel || "") + " (" + WN.geld.formatEuro(WN.fassungen.aktuelle(v).satzCent, "de") + "/h)", fassung: art === "erklaerung" ? null : f.nr, text: txt };']] },
  { name: "S3 VEREINBARUNG: Satz rutscht in die Vereinbarung", probe: K, erwartet: "VEREINBARUNG: kein Stundensatz",
    an: [["assets/kern/aussen.js", 'abschnitt(2, "Zahlung erst nach Abschluss", "Vor dem Ende des Projekts wird nichts fällig.', 'abschnitt(2, "Zahlung erst nach Abschluss", "Stundensatz " + eurDe(f.satzCent) + ". Vor dem Ende des Projekts wird nichts fällig.']] },
  { name: "S3 WARTUNG: Stundensatz fehlt im Wartungsvertrag", probe: K, erwartet: "WARTUNG: der Stundensatz steht drin",
    an: [["assets/kern/aussen.js", 'abschnitt(5, "Stundensatz", eurDe(f.satzCent) + (p19', 'abschnitt(5, "Stundensatz", "nach Absprache" + (p19']] },
  { name: "S3 RECHT: Aktivieren ohne Unterschriften", probe: K, erwartet: "ERKLÄRUNG: ohne beide Unterschriften nicht aktivierbar",
    an: [["assets/kern/aussen.js", 'return !r.aktiviert && (!!r.papier || (!!r.unterschriftBetrieb && !!r.unterschriftKunde));', 'return !r.aktiviert;']] },
  { name: "S3 RECHT: aktiviertes Blatt friert nicht ein", probe: K, erwartet: "ERKLÄRUNG: aktiviert = eingefroren",
    an: [["assets/kern/aussen.js", "if (r.aktiviert && r.stand) stand = JSON.parse(JSON.stringify(r.stand));", "if (false) stand = JSON.parse(JSON.stringify(r.stand));"]] },
  { name: "S3 ÜBERGABE: Wartungsvertrag (mit Satz) geht mit", probe: K, erwartet: "ÜBERGABE: auch mit aktivierter Wartung kein Stundensatz",
    an: [["assets/kern/uebergabe.js", 'var MIT = { erklaerung: "Verschwiegenheitserklaerung", vereinbarung: "Vereinbarung-Zahlung-Rechte" };', 'var MIT = { erklaerung: "Verschwiegenheitserklaerung", vereinbarung: "Vereinbarung-Zahlung-Rechte", wartung: "Wartung" };']] },
  { name: "S3 ÜBERGABE: Blatt geht schon vor dem Aktivieren mit", probe: K, erwartet: "ÜBERGABE: aktivierte Erklärung geht als HTML-Datei mit",
    an: [["assets/kern/uebergabe.js", "return Object.keys(MIT).filter(function (art) { return v[art] && v[art].aktiviert; })", "return Object.keys(MIT).filter(function (art) { return true; })"]] },
  { name: "S3 MD: Unterschrift in der MD", probe: K, erwartet: "MD: nennt nur „aktiviert: ja/nein“",
    an: [["assets/kern/bauauftrag.js", '    L.push("## Erklärungen und Sterne");', '    L.push("## Erklärungen und Sterne", String((v.erklaerung || {}).unterschriftKunde || ""));']] },
  { name: "S3 STERNE: Kürzel in der MD", probe: K, erwartet: "STERNE: in der MD Ø und Anzahl, keine Kürzel",
    an: [["assets/kern/bauauftrag.js", 'L.push("- Sterne " + id + ": beim Bedarf " + f0(stB[id]) + " · bei der Abnahme " + f0(stA[id]));', 'L.push("- Sterne " + id + ": beim Bedarf " + f0(stB[id]) + " · bei der Abnahme " + f0(stA[id]) + " " + (v.sterne || []).map(function (x) { return x.kuerzel; }).join(","));']] },
  { name: "S3 STERNE: Sterne fehlen im Bedarfsprotokoll", probe: K, erwartet: "STERNE: im Bedarfsprotokoll beim Bedarf",
    an: [["assets/kern/aussen.js", '    var sterne = WN.bedarf.sterneZusammen(v, "bedarf");', "    var sterne = null;"]] },
  { name: "S3 STERNE: sechs Sterne erlaubt", probe: K, erwartet: "STERNE: 0 und 6 Sterne werden abgewiesen",
    an: [["assets/kern/bedarf.js", "if (!(n >= 1 && n <= 5)", "if (!(n >= 1 && n <= 6)"]] },
  { name: "S3 GEWÄHR: Freistunden nicht in der Summe", probe: K, erwartet: "GEWÄHR: Freistunden sind eingerechnet",
    an: [["assets/kern/rechnen.js", "s.stundenVon = summeV + s.abstimmung.von + s.puffer.von + gw;", "s.stundenVon = summeV + s.abstimmung.von + s.puffer.von;"]] },
  { name: "S3 GEWÄHR: Freistunden nicht im Preis der Positionen", probe: K, erwartet: "GEWÄHR: steckt im Preis",
    an: [["assets/kern/rechnen.js", "s.zuschlag = (ap + pp) / 100 + (gw && mitteBasis > 0 ? gw / mitteBasis : 0);", "s.zuschlag = (ap + pp) / 100;"]] },
  { name: "S3 BEISPIEL: zweimal laden ergibt einen Doppel", probe: B, erwartet: "BEISPIELE: zweimal laden legt keinen Doppel an",
    an: [["assets/app.js", "if (!b || S.vorgaenge.some(function (x) { return WN.beispiel.bidVon(x) === id; })) return Promise.resolve(false);", "if (!b) return Promise.resolve(false);"]] },
  { name: "S3 BEISPIEL: echte Adresse im Beispiel", probe: K, erwartet: "BEISPIEL psb: keine echten Adressen",
    an: [["assets/daten/beispiel-psb.js", 'v.kunde.mail = "studio@perfect-skin-beauty.example";', 'v.kunde.mail = "studio@perfect-skin-beauty.de";']] },
  { name: "S3 BEISPIEL: Kennung des Beispiels fehlt", probe: K, erwartet: "BEISPIEL tomys: lädt, trägt bid",
    an: [["assets/daten/beispiel-tomys.js", 'v.beispiel = true; v.bid = "tomys";', "v.beispiel = true;"]] },
  { name: "S3 BEISPIEL: eigene Apps verdecken doch", probe: K, erwartet: "BEISPIEL eigene: Bauauftrag entsteht, verdeckt nein",
    an: [["assets/daten/beispiel-eigene.js", "    v.eigenesVorhaben = true;", "    v.eigenesVorhaben = false;"]] },
  { name: "S3 BEISPIEL: Ist an der offenen Fassung", probe: K, erwartet: "BEISPIEL alis: Ist-Stunden nur an unterschriebenen",
    an: [["assets/daten/beispiel-alis.js", "v.ist = { 1: 1.5, 2: 16.0, 3: 18.9 };", "v.ist = { 1: 1.5, 2: 16.0, 3: 18.9, 4: 25 };"]] },
  { name: "S3 ERKLÄRUNG: Bedarfsprotokoll verschweigt die Erklärung", probe: B, erwartet: "ERKLÄRUNG: das Bedarfsprotokoll nennt sie",
    an: [["assets/app.js", "    if (d.erklaerungVom) b.append(", "    if (false) b.append("]] },
  { name: "S3 ERKLÄRUNG: mailto ohne Empfänger", probe: B, erwartet: "ERKLÄRUNG: „Per E-Mail“ ist ein mailto",
    an: [["assets/app.js", 'return "mailto:" + encodeURIComponent(b.kunde.mail || "") + "?subject="', 'return "mailto:?subject="']] },
  { name: "S3 ERKLÄRUNG: Aktivieren öffnet kein Kundenblatt", probe: B, erwartet: "ERKLÄRUNG: Aktivieren öffnet sofort das Blatt",
    an: [["assets/app.js", "merken(v); jetztSpeichern(); zeichne(); vorschau(art);", "merken(v); jetztSpeichern(); zeichne();"]] },
  { name: "S3 ERKLÄRUNG: Entwurf-Hinweis fehlt an der Karte", probe: B, erwartet: "ERKLÄRUNG: Karte sagt „Entwurf",
    an: [["assets/app.js", 'h("div", { class: "hinweis warn klein", "data-entwurf": "" }, "⚠ " + t("Entwurf, kein Rechtsrat — vor Verwendung prüfen lassen."))', "null"]] },
  { name: "S3 ERKLÄRUNG: gezeichnete Unterschrift wird nicht gespeichert", probe: B, erwartet: "ERKLÄRUNG: beide Unterschriften gezeichnet",
    an: [["assets/app.js", 'r[key] = c.toDataURL("image/png"); merken(v); zeichne();', "merken(v); zeichne();"]] },
  { name: "S3 KATALOG: Lizenz-Baustein gilt als nachgesehen", probe: K, erwartet: "KATALOG: „Freischaltung / Lizenz“",
    an: [["assets/daten/bausteine.js", '"Licence / activation", "", 0, [4, 8], [8, 14], [14, 24], false,', '"Licence / activation", "", 0, [4, 8], [8, 14], [14, 24], true,']] },
  { name: "GESAMT: Beispiel-Dateien werden nicht angehängt", probe: B, erwartet: "GESAMT: sieben Beispiel-Dateien hängen",
    an: [["assets/app.js", "        v.anhaenge.push({ id: BD.neueKennung(v, \"A\"), name: r.a.name,", "        if (false) v.anhaenge.push({ id: BD.neueKennung(v, \"A\"), name: r.a.name,"]] },
  { name: "GESAMT: Beispiel-Datei verliert ihren Typ", probe: B, erwartet: "GESAMT: sieben Beispiel-Dateien hängen",
    an: [["assets/app.js", "return bl ? { a: a, blob: new Blob([bl], { type: a.typ }) }", "return bl ? { a: a, blob: new Blob([bl]) }"]] },
  { name: "GESAMT: Übergabe nimmt die Beispiel-Dateien nicht mit", probe: B, erwartet: "GESAMT: Übergabe trägt alle Dateien",
    an: [["assets/kern/uebergabe.js", "return Promise.all((anhaenge || []).filter(function (x) { return x && x.blob; })", "return Promise.all((anhaenge || []).filter(function (x) { return x && x.blob && !/^(message|image|application\\/pdf)/.test(x.typ); })"]] },
  { name: "GESAMT: Ist × Satz fehlt", probe: K, erwartet: "GESAMT: „Ist × Satz“",
    an: [["assets/kern/rechnen.js", "istKostenCent: Math.round(ist * f.satzCent) });", "istKostenCent: null });"]] },
  { name: "GESAMT: Rechtsblätter nur auf Papier statt mit Unterschrift", probe: K, erwartet: "GESAMT: Erklärung, Vereinbarung und Wartung aktiviert",
    an: [["assets/daten/beispiel-tomys-gesamt.js", "    var U = WN.beispielUnterschriften || {};", "    var U = {};"]] },
  { name: "GESAMT: Telefon des Kunden fehlt", probe: K, erwartet: "GESAMT: Kunde vollständig",
    an: [["assets/daten/beispiel-tomys-gesamt.js", '    v.kunde.telefon = "030 23125456";', ""]] },
  { name: "GESAMT: E-Mail als Bild deklariert", probe: K, erwartet: "GESAMT: sieben Anhänge angekündigt",
    an: [["assets/daten/beispiel-tomys-gesamt.js", 'name: "Rueckfrage-Buchhaltung.eml", typ: "message/rfc822"', 'name: "Rueckfrage-Buchhaltung.eml", typ: "image/png"']] },
  { name: "VORGÄNGE: Beispiele nur in den Einstellungen", probe: B, erwartet: "VORGÄNGE: Beispiel-Auswahl, „Laden“ und „Alle laden“ stehen sichtbar",
    an: [["assets/app.js", 'h("span", { class: "gedaempft klein", text: t("oder ein Beispiel ansehen:") }), beispielSteuerung("vg-beispiel"))', 'h("span", { class: "gedaempft klein", text: t("oder ein Beispiel ansehen:") }))']] },
  { name: "VORGÄNGE: Platzhalter in der Liste", probe: B, erwartet: "VORGÄNGE: Liste zeigt bei leerem Kunden nie einen Platzhalter",
    an: [["assets/app.js", '(x.kunde.firma || (x.eigenesVorhaben ? t("eigenes Vorhaben") : t("ohne Kunde")))', '(x.kunde.firma || "⟦KUNDE-1⟧")']] },
  { name: "ANSICHT: kein 👁-Knopf am Anhang", probe: B, erwartet: "ANSICHT: jeder Anhang hat einen 👁-Knopf",
    an: [["assets/app.js", 'a.blob ? knopf("👁 " + t("Ansehen"), function () { anhangAnsehen(a); }, "klein", { "data-anhang-ansehen": a.id,', 'false ? knopf("👁 " + t("Ansehen"), function () { anhangAnsehen(a); }, "klein", { "data-anhang-ansehen": a.id,']] },
  { name: "ANSICHT: pdf.js ohne Schutz gegen eval (CVE-2024-4367)", probe: K, erwartet: "PDFJS: die App öffnet PDFs nur mit isEvalSupported",
    an: [["assets/app.js", "return r[0].getDocument({ data: new Uint8Array(r[1]), isEvalSupported: false }).promise;", "return r[0].getDocument({ data: new Uint8Array(r[1]) }).promise;"]] },
  { name: "ANSICHT: HTML wird als Seite gezeigt", probe: B, erwartet: "ANSICHT: eine HTML-Datei erscheint als Text",
    an: [["assets/app.js", 'return blob.text().then(function (s) { ziel.append(h("pre", { class: "ansicht-text", "data-ansicht-text": "", text: s.length > 200000 ? s.slice(0, 200000) + "\\n…" : s })); });', 'return blob.text().then(function (s) { var d = document.createElement("div"); d.innerHTML = s; d.querySelectorAll("script").forEach(function (x) { var n = document.createElement("script"); n.textContent = x.textContent; d.append(n); }); ziel.append(d); });']] },
  { name: "ANSICHT: Mail-Anhang verliert Bytes", probe: K, erwartet: "MAIL: Beispiel-Mail — Bild-Anhang kommt Byte für Byte",
    an: [["assets/kern/mail.js", 'if (cte === "base64") return b64bytes(rumpf);', 'if (cte === "base64") return b64bytes(rumpf).subarray(1);']] },
  { name: "PIN: Modul 25 abgewandelt", probe: K, erwartet: "PIN: Modul 25 ist byte-gleich mit Sage",
    an: [["modules/25_pseudonym.js", "  var KEIN_NAME = [\"herr\",", "  var KEIN_NAME = [\"chef2\", \"herr\","]] },
  { name: "ERKLÄREN: leeres Feld hängt „null“ an", probe: B, erwartet: "ERKLÄREN: kein „null“",
    an: [["assets/app.js", "anhaengen(karte, erklaerFeld(v, f, bs, ro, \"kennung\", bs.id));", "karte.append(erklaerFeld(v, f, bs, ro, \"kennung\", bs.id));"]] },
  { name: "ERKLÄREN: Wirkung wird nicht an der Kopie gerechnet", probe: B, erwartet: "ERKLÄREN: die vorher gerechnete Wirkung stimmt",
    an: [["assets/app.js", "var kopie = JSON.parse(JSON.stringify(f)); ak.tun(kopie, bsIn(kopie, bs.id));", "var kopie = JSON.parse(JSON.stringify(f));"]] },
  { name: "ERKLÄREN: kein Zurück-Knopf", probe: B, erwartet: "ERKLÄREN: ↶ Zurück steht da",
    an: [["assets/app.js", "    if (st.length && !ro) {", "    if (false) {"]] },
  { name: "ERKLÄREN: Zurück stellt nichts her", probe: B, erwartet: "ERKLÄREN: Zurück stellt die B-Nummer",
    an: [["assets/app.js", "f.umfang = JSON.parse(st.pop().umfang);", "st.pop();"]] },
  { name: "ERKLÄREN: Änderung im Feld merkt keinen Stand", probe: B, erwartet: "ERKLÄREN: ↶ Zurück steht da",
    an: [["assets/app.js", "knopf(ak.label, function () { vorher(v, f); ak.tun", "knopf(ak.label, function () { ak.tun"]] },
  { name: "ERKLÄREN: unterschriebene Fassung lässt ändern", probe: B, erwartet: "ERKLÄREN: in einer unterschriebenen Fassung",
    an: [["assets/app.js", "    if (ro) box.append(h(\"p\", { class: \"gedaempft klein\", \"data-erklaer-nurlesen\"", "    if (false) box.append(h(\"p\", { class: \"gedaempft klein\", \"data-erklaer-nurlesen\""]] },
  { name: "ERKLÄREN: Tipp schaltet die B-Nummer sofort um (alter Weg)", probe: B, erwartet: "ERKLÄREN: ein Tipp aufs Feld ändert noch nichts",
    an: [["assets/app.js", "\"data-erklaer-chip\": art + \":\" + id, onclick: function () { erklaerUmschalten(v, f, bs, art, id); } });", "\"data-erklaer-chip\": art + \":\" + id, onclick: function () { if (art === \"deckt\") { bs.deckt = umschalten(bs.deckt, id); merken(v); } erklaerUmschalten(v, f, bs, art, id); } });"]] },
  { name: "PAGES: .gitignore sperrt nur das Verzeichnis", probe: K, erwartet: "PAGES: .gitignore sperrt node_modules",
    an: [[".gitignore", "node_modules", "node_modules/"]] },
  { name: "ERKLÄREN: kein Weg zur neuen Fassung in der unterschriebenen", probe: B, erwartet: "ERKLÄREN: unterschrieben — Grenzlinie gesperrt",
    an: [["assets/app.js", "    if (f.unterschrieben && f === F.aktuelle(v)) {", "    if (false) {"]] },
  { name: "ERKLÄREN: alter Satz „deckt den Punkt nicht ab“", probe: B, erwartet: "ERKLÄREN: der Satz sagt, was folgt",
    an: [["assets/app.js", "an && andere.length ? t(\"Dieser Baustein deckt den Punkt ab — nicht allein. Auch abgedeckt von\") + \": \" + andere.join(\", \")", "an && andere.length ? t(\"Dieser Baustein deckt den Punkt ab.\")"]] },
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
