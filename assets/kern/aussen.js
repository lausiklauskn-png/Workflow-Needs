/* Was das Haus verlässt — per WHITELIST gebaut (Muster: BookLedgerPro
   src/domain/angebote.js, externesAngebot/externePosition).

   ⛔ PRIME DIRECTIVE: Stundensatz, Stunden, Faktoren, Wiederverwendung,
   Markt-Tabellen, Kosten-Nutzen und interne Notizen erscheinen NIE auf einem
   Kundenausdruck. Jede Funktion hier liest aus dem Vorgang nur die Felder,
   die sie ausdrücklich nennt, und gibt ein NEUES Objekt zurück. Die Oberfläche
   zeichnet das Druckblatt allein aus diesem Objekt — nicht aus der Ansicht
   durch Verstecken (display:none ist kein Schutz).

   Namen (Brief § 14.4): „Bedarfsprotokoll" = für den Kunden, „Bedarfsanalyse"
   = für Klaus. Ein Kundenblatt trägt nie das Wort „Analyse". */
(function (g) {
  "use strict";
  var WN = g.WN = g.WN || {};

  function firmaExtern(f) {
    f = f || {};
    return { name: String(f.name || ""), anschrift: String(f.anschrift || ""), kontakt: String(f.kontakt || ""),
      steuer: String(f.steuer || ""), bank: String(f.bank || ""), logo: /^data:image\/(png|jpeg|webp);base64,/.test(f.logo || "") ? f.logo : "" };
  }
  /* Kunde: Klartext, sonst sichtbar der Platzhalter (nie ein leeres Feld). */
  function kundeExtern(v) {
    var k = {};
    WN.KUNDENFELDER.forEach(function (f) {
      var w = String((v.kunde && v.kunde[f.id]) || "").trim();
      k[f.id] = w || f.token;
    });
    return k;
  }
  function eintragExtern(nr, e) {
    var o = { id: String(e.id), text: String(e.text || "") };
    if (nr === 3) o.anzahl = Number(e.anzahl) || 0;
    if (nr === 18) { o.wer = String(e.wer || ""); o.bis = String(e.bis || ""); }
    return o;
  }

  /* Stufe 1 für den Kunden: nur Freigegebenes. Ein Bereich, in dem nichts
     freigegeben ist, fällt ganz weg. Prioritäten und Nutzen sind Angaben des
     Kunden und stehen in 16/17 je Bedarf. */
  function kundenProtokoll(v, f, firma) {
    var bereiche = [], aus = 0;
    var bed = WN.bedarf.bedarfe(f.protokoll);
    var bedFrei = (f.protokoll.bereiche[6].sichtbar ? bed : []).filter(function (e) { return e.sichtbar; });
    WN.BEREICHE.forEach(function (b) {
      var roh = f.protokoll.bereiche[b.nr];
      var eintraege = [];
      if (b.art === "prio" || b.art === "nutzen") {
        if (roh.sichtbar) bedFrei.forEach(function (e) {
          if (b.art === "prio" && e.prio) eintraege.push({ id: e.id, text: String(e.text || ""), prio: e.prio });
          if (b.art === "nutzen" && WN.bedarf.hatNutzen(e)) eintraege.push({ id: e.id, text: String(e.text || ""),
            nutzen: { stundenMonat: e.nutzen.stundenMonat, euroMonat: e.nutzen.euroMonat, text: String(e.nutzen.text || "") } });
        });
      } else {
        roh.eintraege.forEach(function (e) {
          if (roh.sichtbar && e.sichtbar) eintraege.push(eintragExtern(b.nr, e)); else aus++;
        });
      }
      if (eintraege.length) bereiche.push({ nr: b.nr, eintraege: eintraege });
    });
    WN.BEREICHE.forEach(function (b) { if (String(f.protokoll.bereiche[b.nr].notiz || "").trim()) aus++; });
    return { art: "protokoll", firma: firmaExtern(firma), kunde: kundeExtern(v), vorgang: v.id,
      titel: String(v.titel || ""), fassung: f.nr, datum: f.datum, unterschrieben: f.unterschrieben || "",
      bereiche: bereiche, ausgeblendet: aus };
  }

  /* Angebot (Stufe 3) */
  function angebotExtern(v, f, firma, ustEinst, tabellen, zeitraum, lang) {
    var R = WN.rechnen;
    var s = R.schaetze(f, tabellen);
    var kn = R.kostenNutzen(f, s, zeitraum);
    var pos = R.positionen(f, s, kn, tabellen, lang);
    var ust = WN.fassungen.ustVon(f, ustEinst);
    function ext(p) { return { beschreibung: String(p.beschreibung), nettoCent: Math.round(p.nettoCent),
      ustSatz: ust.modus === "p19" ? 0 : (p.ermaessigt ? 7 : Number(ust.satz)) }; }
    var haupt = pos.haupt.map(ext), optional = pos.optional.map(ext);
    var summen = R.ust(pos.haupt, ust);
    var ph = R.phasen(s);
    var a = f.angebot || {};
    return { art: "angebot", firma: firmaExtern(firma), kunde: kundeExtern(v), nummer: String(a.nummer || ""),
      titel: String(v.titel || ""), datum: String(a.datum || f.datum), gueltigBis: String(a.gueltigBis || ""),
      fassung: f.nr, positionen: haupt, optional: optional,
      summen: { p19: summen.p19, netto: summen.netto, zeilen: summen.zeilen.map(function (z) { return { satz: z.satz, netto: z.netto, ust: z.ust }; }), ust: summen.ust, brutto: summen.brutto },
      phasen: { bauWochen: ph.wochen[2].wochen, testWochen: ph.wochen[3].wochen },
      zahlung: String(a.zahlung || ""), zahlungNachTest: !!a.zahlungNachTest };
  }

  /* Nachtrag F(alt) → F(neu): nur Änderungen, die der Kunde sehen darf. */
  function nachtragExtern(v, alt, neu, firma, ustEinst, tabellen, zeitraum, lang) {
    var A = angebotExtern(v, alt, firma, ustEinst, tabellen, zeitraum, lang);
    var N = angebotExtern(v, neu, firma, ustEinst, tabellen, zeitraum, lang);
    var vg = WN.fassungen.vergleich(alt, neu, tabellen);
    var aend = [];
    vg.bedarf.forEach(function (x) {
      if (x.status === "gleich") return;
      var frei = function (f, e) { return !!e && e.sichtbar && f.protokoll.bereiche[x.nr].sichtbar; };
      if (!frei(alt, x.alt) && !frei(neu, x.neu)) return;
      aend.push({ id: x.id, art: x.status, alt: x.alt && frei(alt, x.alt) ? String(x.alt.text || "") : "",
        neu: x.neu && frei(neu, x.neu) ? String(x.neu.text || "") : "" });
    });
    var namen = function (f) { var m = {}; (f.umfang.bausteine || []).forEach(function (b) { m[b.id] = WN.rechnen.bausteinName(b, tabellen, lang); }); return m; };
    var na = namen(alt), nn = namen(neu);
    var leist = [];
    vg.bausteine.forEach(function (x) {
      if (x.status === "gleich") return;
      var text = x.status === "entfallen" ? na[x.id] : nn[x.id];
      if (x.status === "geaendert" && x.zAlt && x.zNeu && x.zAlt.menge !== x.zNeu.menge) text += " (" + x.zAlt.menge + "× → " + x.zNeu.menge + "×)";
      leist.push({ id: x.id, art: x.status, text: String(text || ""), offen: x.aktion === "NOCH NICHT GESCHÄTZT" });
    });
    var ph = WN.rechnen.phasen(WN.rechnen.schaetze(neu, tabellen));
    return { art: "nachtrag", firma: A.firma, kunde: A.kunde, nummer: A.nummer, titel: A.titel,
      fassungAlt: alt.nr, fassungNeu: neu.nr, datum: neu.datum, anlass: String(neu.anlass || ""),
      bedarf: aend, leistungen: leist,
      alt: { netto: A.summen.netto, brutto: A.summen.brutto }, neu: { netto: N.summen.netto, brutto: N.summen.brutto, p19: N.summen.p19 },
      diff: { netto: N.summen.netto - A.summen.netto, brutto: N.summen.brutto - A.summen.brutto },
      termin: WN.rechnen.datumPlus(neu.datum, ph.summeWochen) };
  }

  /* Bedarfsanalyse (für Klaus): alles — kein Whitelist-Zwang, aber eigener Titel. */
  function analyseIntern(v, f, firma, ustEinst, tabellen, zeitraum, lang) {
    var R = WN.rechnen;
    var s = R.schaetze(f, tabellen);
    return { art: "analyse", firma: firmaExtern(firma), kunde: kundeExtern(v), vorgang: v.id, titel: v.titel,
      fassung: f.nr, datum: f.datum, protokoll: f.protokoll, umfang: f.umfang, schaetzung: s,
      sichten: R.sichten(s, tabellen), kn: R.kostenNutzen(f, s, zeitraum), satzCent: f.satzCent };
  }

  WN.aussen = { kundenProtokoll: kundenProtokoll, angebotExtern: angebotExtern, nachtragExtern: nachtragExtern,
    analyseIntern: analyseIntern, kundeExtern: kundeExtern, firmaExtern: firmaExtern };
})(typeof window !== "undefined" ? window : globalThis);
