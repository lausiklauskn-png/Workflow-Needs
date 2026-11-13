/* Rahmen des Vorhabens (Klaus 2026-11-13, Ja zu F1–F6, U1 nach dem Rückwärtstest).
   Der Rückwärtstest (Datei-Organizer rueckwaertstest/) zeigte: Geräte, Datenort und Sicherung, das Zusammenspiel
   mit eigenen Programmen, was ausdrücklich NICHT gebaut wird und ob die Lösung vorschlägt oder selbst handelt,
   fragte Needs nie — und genau das ging auf dem Weg zum Bauauftrag verloren.
   Gespeichert an der Fassung (wie alles im Bedarf): protokoll.rahmen = { geraete: [ids], offline: id|"",
   datenort: [ids], sicherung: [ids], eigene: [ids], eigeneText: "", budgetEuro: Zahl|null },
   protokoll.nicht = [{ id: "N-nn", text, sichtbar }], am Bedarf (Bereich 6) e.handeln = id|"".
   Ältere Fassungen haben nichts davon: alles gilt dann als „nicht erfragt“, nichts wird erfunden. */
(function (g) {
  "use strict";
  var WN = g.WN = g.WN || {};
  function o(id, de, en) { return { id: id, name: { de: de, en: en } }; }

  WN.RAHMEN = {
    geraete: { bereich: 10, mehrfach: true, frage: { de: "Wo wird es benutzt?", en: "Where will it be used?" },
      wahl: [o("android", "Android-Handy", "Android phone"), o("iphone", "iPhone", "iPhone"), o("tablet", "Tablet", "Tablet"),
        o("windows", "Windows-PC", "Windows PC"), o("mac", "Mac", "Mac"), o("browser", "im Browser", "in the browser")] },
    offline: { bereich: 10, mehrfach: false, frage: { de: "Muss es ohne Internet gehen?", en: "Must it work without internet?" },
      wahl: [o("immer", "ja, immer", "yes, always"), o("unterwegs", "reicht unterwegs", "on the road is enough"), o("nein", "nein", "no")] },
    eigene: { bereich: 12, mehrfach: true, frage: { de: "Eigene Programme, die schon da sind: was soll zusammenpassen?", en: "Own programs already in use: what must fit together?" },
      wahl: [o("ablageort", "gemeinsamer Ablageort", "shared storage place"), o("hinher", "Dateien hin- und hergeben", "pass files back and forth"),
        o("suche", "gemeinsame Suche", "shared search")] },
    datenort: { bereich: 13, mehrfach: true, frage: { de: "Wo dürfen die Daten liegen?", en: "Where may the data be stored?" },
      wahl: [o("geraet", "nur auf dem Gerät", "only on the device"), o("ordner", "eigener Ordner / Speicherkarte", "own folder / memory card"),
        o("server", "eigener Server", "own server"), o("cloud", "Cloud eines Anbieters", "a provider's cloud")] },
    sicherung: { bereich: 13, mehrfach: true, frage: { de: "Sicherung", en: "Backup" },
      wahl: [o("verschluesselt", "verschlüsselt", "encrypted"), o("zweiterort", "an einen zweiten Ort", "to a second place"),
        o("selbst", "selbst anstoßen", "started by hand"), o("allein", "von allein", "automatic")] },
  };
  WN.RAHMEN_FELDER = ["geraete", "offline", "eigene", "datenort", "sicherung"];
  WN.HANDELN = [o("vorschlagen", "schlägt vor, ich bestätige", "suggests, I confirm"), o("selbst", "macht es selbst", "does it itself"), o("egal", "egal", "either")];

  function leer() { return { geraete: [], offline: "", eigene: [], eigeneText: "", datenort: [], sicherung: [], budgetEuro: null }; }
  /* Lesen ohne zu verändern (für Bauauftrag, Ausdruck, Proben) */
  function von(protokoll) {
    var r = (protokoll && protokoll.rahmen) || {}, l = leer();
    Object.keys(l).forEach(function (k) { if (r[k] !== undefined && r[k] !== null) l[k] = Array.isArray(l[k]) ? (Array.isArray(r[k]) ? r[k].slice() : []) : r[k]; });
    return l;
  }
  /* Zum Ändern: legt rahmen/nicht an, wenn sie fehlen */
  function sicher(protokoll) {
    if (!protokoll.rahmen) protokoll.rahmen = leer();
    var l = leer(); Object.keys(l).forEach(function (k) { if (protokoll.rahmen[k] === undefined) protokoll.rahmen[k] = l[k]; });
    if (!Array.isArray(protokoll.nicht)) protokoll.nicht = [];
    return protokoll.rahmen;
  }
  function umschalten(protokoll, feld, id) {
    var r = sicher(protokoll), def = WN.RAHMEN[feld];
    if (!def || !def.wahl.some(function (w) { return w.id === id; })) return false;
    if (def.mehrfach) { var i = r[feld].indexOf(id); if (i >= 0) r[feld].splice(i, 1); else r[feld].push(id); }
    else r[feld] = r[feld] === id ? "" : id;
    return true;
  }
  function nichtNeu(vorgang, protokoll, text) {
    sicher(protokoll);
    var t = String(text || "").trim(); if (!t) return null;
    var e = { id: WN.bedarf.neueKennung(vorgang, "N"), text: t, sichtbar: true };
    protokoll.nicht.push(e);
    return e;
  }
  function nicht(protokoll) { return (protokoll && Array.isArray(protokoll.nicht)) ? protokoll.nicht : []; }
  function name(feld, id, lang) {
    var def = feld === "handeln" ? { wahl: WN.HANDELN } : WN.RAHMEN[feld];
    var w = def && def.wahl.filter(function (x) { return x.id === id; })[0];
    return w ? (w.name[lang] || w.name.de) : "";
  }
  function liste(r, feld, lang) {
    var x = r[feld]; if (!x || (Array.isArray(x) && !x.length)) return "";
    return (Array.isArray(x) ? x : [x]).map(function (id) { return name(feld, id, lang); }).filter(Boolean).join(", ");
  }
  /* Ist überhaupt etwas erfragt? (für „noch nicht erfragt“) */
  function erfragt(protokoll) {
    var r = von(protokoll);
    return WN.RAHMEN_FELDER.some(function (k) { return Array.isArray(r[k]) ? r[k].length : !!r[k]; }) || !!String(r.eigeneText || "").trim() ||
      nicht(protokoll).length > 0 || (WN.bedarf.bedarfe(protokoll) || []).some(function (e) { return !!e.handeln; });
  }

  /* U1 · Schlüssigkeit des Umfangs: Muss-Bedarf ohne Baustein, Baustein zeigt auf einen Bedarf, den es nicht gibt. */
  function schluessig(fassung) {
    var p = fassung.protokoll, bs = (fassung.umfang && fassung.umfang.bausteine) || [];
    var da = {}; WN.bedarf.alleEintraege(p).forEach(function (x) { da[x.e.id] = 1; });
    var gedeckt = {}; bs.forEach(function (b) { (b.deckt || []).forEach(function (id) { gedeckt[id] = 1; }); });
    var mussOhne = WN.bedarf.bedarfe(p).filter(function (e) { return e.prio === "muss" && !gedeckt[e.id]; }).map(function (e) { return e.id; });
    var verwaist = [];
    bs.forEach(function (b) { (b.deckt || []).forEach(function (id) { if (!da[id]) verwaist.push({ baustein: b.id, bedarf: id }); }); });
    return { ok: !mussOhne.length && !verwaist.length, mussOhne: mussOhne, verwaist: verwaist };
  }
  /* F6 · Budget gegen Schätzung (nur intern): Rahmen des Kunden in Euro gesamt gegen die untere Schätzung netto. */
  function budget(fassung, schaetzung) {
    var b = von(fassung.protokoll).budgetEuro;
    var n = Number(b);
    if (b === null || b === "" || !Number.isFinite(n) || n <= 0 || !schaetzung) return null;
    var cent = Math.round(n * 100);
    return { budgetCent: cent, kostenVon: schaetzung.kostenVon, kostenBis: schaetzung.kostenBis, ueber: schaetzung.kostenVon > cent };
  }

  WN.rahmen = { leer: leer, von: von, sicher: sicher, umschalten: umschalten, nichtNeu: nichtNeu, nicht: nicht, name: name, liste: liste,
    erfragt: erfragt, schluessig: schluessig, budget: budget };
})(typeof window !== "undefined" ? window : globalThis);
